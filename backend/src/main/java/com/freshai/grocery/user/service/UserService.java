package com.freshai.grocery.user.service;

import com.freshai.grocery.exception.BadRequestException;
import com.freshai.grocery.exception.ResourceNotFoundException;
import com.freshai.grocery.notification.email.EmailService;
import com.freshai.grocery.order.dto.OrderDTO;
import com.freshai.grocery.order.dto.OrderItemDTO;
import com.freshai.grocery.order.entity.Order;
import com.freshai.grocery.order.repository.OrderRepository;
import com.freshai.grocery.otp.dto.OtpVerifyRequest;
import com.freshai.grocery.otp.service.OtpService;
import com.freshai.grocery.user.dto.AddressDTO;
import com.freshai.grocery.user.dto.UpdateProfileRequest;
import com.freshai.grocery.user.dto.UserProfileDTO;
import com.freshai.grocery.user.entity.User;
import com.freshai.grocery.user.entity.UserAddress;
import com.freshai.grocery.user.repository.UserAddressRepository;
import com.freshai.grocery.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository        userRepository;
    private final UserAddressRepository addressRepository;
    private final OrderRepository       orderRepository;
    private final PasswordEncoder       passwordEncoder;
    private final EmailService          emailService;
    private final OtpService            otpService;

    // ═══════════════════════ GET PROFILE ════════════════════════════════════

    public UserProfileDTO getProfile(String email) {
        User user = findByEmail(email);

        List<AddressDTO> addresses = addressRepository
                .findByUserIdOrderByIsDefaultDescIdAsc(user.getId())
                .stream().map(this::toAddressDTO).collect(Collectors.toList());

        List<OrderDTO> recentOrders = orderRepository
                .findByUserIdOrderByCreatedAtDesc(user.getId(), PageRequest.of(0, 5))
                .stream().map(this::toOrderDTO).collect(Collectors.toList());

        return UserProfileDTO.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole().name())
                .profileImage(user.getProfileImage())
                .emailVerified(user.getEmailVerified())
                .phoneVerified(user.getPhoneVerified())
                .createdAt(user.getCreatedAt())
                .addresses(addresses)
                .recentOrders(recentOrders)
                .build();
    }

    // ═══════════════════════ UPDATE PROFILE ═════════════════════════════════

    @Transactional
    public UserProfileDTO updateProfile(String email, UpdateProfileRequest req) {
        User user = findByEmail(email);

        // ── Non-sensitive fields (no OTP) ──────────────────────────────────
        if (isPresent(req.getFirstName()))  user.setFirstName(req.getFirstName().trim());
        if (isPresent(req.getLastName()))   user.setLastName(req.getLastName().trim());
        if (isPresent(req.getProfileImage())) user.setProfileImage(req.getProfileImage().trim());

        // ── Sensitive fields: OTP must be verified first ───────────────────
        boolean sensitiveChange = req.getEmail() != null
                || req.getPhone() != null
                || req.getNewPassword() != null;

        if (sensitiveChange) {
            if (req.getOtpPurpose() == null || req.getVerifiedOtpCode() == null) {
                throw new BadRequestException(
                    "OTP code and purpose are required for sensitive field changes.");
            }

            // Server-side OTP re-verification for security (throws BadRequestException if invalid)
            OtpVerifyRequest verifyReq = new OtpVerifyRequest();
            verifyReq.setPurpose(req.getOtpPurpose());
            verifyReq.setOtpCode(req.getVerifiedOtpCode());
            otpService.verifyOtp(user, verifyReq);
            log.debug("OTP re-verified for user={} purpose={}", user.getId(), req.getOtpPurpose());

            // Apply the change matching the verified purpose  ← fixed switch fall-through
            switch (req.getOtpPurpose().toUpperCase().trim()) {
                case "EMAIL_CHANGE" -> {
                    if (!isPresent(req.getEmail())) {
                        throw new BadRequestException("New email is required for EMAIL_CHANGE.");
                    }
                    String newEmail = req.getEmail().trim().toLowerCase();
                    if (userRepository.existsByEmail(newEmail)) {
                        throw new BadRequestException("This email is already registered.");
                    }
                    String oldEmail = user.getEmail();
                    user.setEmail(newEmail);
                    user.setEmailVerified(true);  // OTP sent to new email proves ownership
                    emailService.sendProfileUpdateConfirmation(oldEmail, "email address");
                }
                case "PHONE_CHANGE" -> {
                    if (!isPresent(req.getPhone())) {
                        throw new BadRequestException("New phone number is required for PHONE_CHANGE.");
                    }
                    user.setPhone(req.getPhone().trim());
                    user.setPhoneVerified(true);  // OTP proves ownership of new phone
                    emailService.sendProfileUpdateConfirmation(user.getEmail(), "phone number");
                }
                case "PASSWORD_CHANGE" -> {
                    if (!isPresent(req.getNewPassword())) {
                        throw new BadRequestException("New password is required for PASSWORD_CHANGE.");
                    }
                    if (req.getNewPassword().length() < 8) {
                        throw new BadRequestException("Password must be at least 8 characters.");
                    }
                    user.setPasswordHash(passwordEncoder.encode(req.getNewPassword()));
                    emailService.sendPasswordChangedAlert(user.getEmail(), user.getFirstName());
                }
                default -> throw new BadRequestException(
                    "Unknown OTP purpose: " + req.getOtpPurpose() +
                    ". Valid: EMAIL_CHANGE, PHONE_CHANGE, PASSWORD_CHANGE");
            }
        }

        userRepository.save(user);
        log.info("Profile updated: userId={}", user.getId());
        return getProfile(user.getEmail());
    }

    // ═══════════════════════ VERIFY EMAIL ════════════════════════════════════

    @Transactional
    public void verifyEmail(User user, String otpCode) {
        OtpVerifyRequest req = new OtpVerifyRequest();
        req.setPurpose("EMAIL_VERIFY");
        req.setOtpCode(otpCode);

        otpService.verifyOtp(user, req);

        user.setEmailVerified(true);
        userRepository.save(user);
        log.info("Email verified: userId={}", user.getId());
    }

    // ═══════════════════════ ADDRESS MANAGEMENT ══════════════════════════════

    @Transactional
    public AddressDTO addAddress(String email, AddressDTO dto) {
        User user = findByEmail(email);
        if (addressRepository.countByUserId(user.getId()) >= 5) {
            throw new BadRequestException("Maximum 5 addresses allowed per account.");
        }
        if (Boolean.TRUE.equals(dto.getIsDefault())) {
            addressRepository.clearDefaultForUser(user.getId());
        }
        UserAddress address = UserAddress.builder()
                .user(user)
                .label(dto.getLabel() != null ? dto.getLabel() : "Home")
                .fullAddress(dto.getFullAddress())
                .city(dto.getCity())
                .pincode(dto.getPincode())
                .isDefault(Boolean.TRUE.equals(dto.getIsDefault()))
                .build();
        return toAddressDTO(addressRepository.save(address));
    }

    @Transactional
    public AddressDTO updateAddress(String email, Long addressId, AddressDTO dto) {
        User user = findByEmail(email);
        UserAddress address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));
        if (!address.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Access denied.");
        }
        if (Boolean.TRUE.equals(dto.getIsDefault())) {
            addressRepository.clearDefaultForUser(user.getId());
        }
        address.setLabel(dto.getLabel());
        address.setFullAddress(dto.getFullAddress());
        address.setCity(dto.getCity());
        address.setPincode(dto.getPincode());
        address.setIsDefault(Boolean.TRUE.equals(dto.getIsDefault()));
        return toAddressDTO(addressRepository.save(address));
    }

    @Transactional
    public void deleteAddress(String email, Long addressId) {
        User user = findByEmail(email);
        UserAddress address = addressRepository.findById(addressId)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found"));
        if (!address.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Access denied.");
        }
        addressRepository.delete(address);
    }

    // ═══════════════════════ HELPERS ═════════════════════════════════════════

    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private boolean isPresent(String s) {
        return s != null && !s.isBlank();
    }

    // ─── DTO converters ──────────────────────────────────────────────────────

    private AddressDTO toAddressDTO(UserAddress a) {
        return AddressDTO.builder()
                .id(a.getId())
                .label(a.getLabel())
                .fullAddress(a.getFullAddress())
                .city(a.getCity())
                .pincode(a.getPincode())
                .isDefault(a.getIsDefault())
                .build();
    }

    private OrderDTO toOrderDTO(Order o) {
        List<OrderItemDTO> items = o.getOrderItems().stream().map(i -> OrderItemDTO.builder()
                .productId(i.getProduct().getId())
                .productName(i.getProduct().getName())
                .quantity(i.getQuantity())
                .unitPrice(i.getUnitPrice())
                .totalPrice(i.getTotalPrice())
                .build()).collect(Collectors.toList());

        return OrderDTO.builder()
                .id(o.getId())
                .orderNumber(o.getOrderNumber())
                .subtotal(o.getSubtotal())
                .deliveryFee(o.getDeliveryFee())
                .discountAmount(o.getDiscountAmount())
                .totalAmount(o.getTotalAmount())
                .status(o.getStatus().name())
                .paymentMethod(o.getPaymentMethod())
                .paymentStatus(o.getPaymentStatus().name())
                .deliveryAddress(o.getDeliveryAddress())
                .notes(o.getNotes())
                .createdAt(o.getCreatedAt())
                .items(items)
                .build();
    }
}
