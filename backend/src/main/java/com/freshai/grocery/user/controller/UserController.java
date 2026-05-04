package com.freshai.grocery.user.controller;

import com.freshai.grocery.exception.ApiResponse;
import com.freshai.grocery.exception.BadRequestException;
import com.freshai.grocery.exception.ResourceNotFoundException;
import com.freshai.grocery.user.dto.AddressDTO;
import com.freshai.grocery.user.dto.UserDTO;
import com.freshai.grocery.user.dto.UserProfileUpdateDTO;
import com.freshai.grocery.user.entity.User;
import com.freshai.grocery.user.entity.UserAddress;
import com.freshai.grocery.user.repository.UserAddressRepository;
import com.freshai.grocery.user.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final UserAddressRepository addressRepository;

    // ── Profile ────────────────────────────────────────────────────────────

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDTO>> getCurrentUser(Authentication authentication) {
        User user = getAuthUser(authentication);
        return ResponseEntity.ok(ApiResponse.ok(mapToDTO(user)));
    }

    @PutMapping("/update")
    public ResponseEntity<ApiResponse<UserDTO>> updateProfile(
            Authentication authentication,
            @Valid @RequestBody UserProfileUpdateDTO updateDTO) {

        User user = getAuthUser(authentication);
        if (updateDTO.getFirstName() != null) user.setFirstName(updateDTO.getFirstName());
        if (updateDTO.getLastName()  != null) user.setLastName(updateDTO.getLastName());
        if (updateDTO.getPhone()     != null) user.setPhone(updateDTO.getPhone());
        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.ok(mapToDTO(user), "Profile updated successfully"));
    }

    // ── Addresses ──────────────────────────────────────────────────────────

    @GetMapping("/addresses")
    public ResponseEntity<ApiResponse<List<AddressDTO>>> getAddresses(Authentication authentication) {
        User user = getAuthUser(authentication);
        List<AddressDTO> addresses = addressRepository
                .findByUserIdOrderByIsDefaultDescIdAsc(user.getId())
                .stream().map(this::toAddressDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok(addresses));
    }

    @PostMapping("/addresses")
    @Transactional
    public ResponseEntity<ApiResponse<AddressDTO>> addAddress(
            Authentication authentication,
            @Valid @RequestBody AddressDTO dto) {

        User user = getAuthUser(authentication);

        // If this is set as default, unset existing defaults
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

        addressRepository.save(address);
        return ResponseEntity.ok(ApiResponse.ok(toAddressDTO(address), "Address added successfully"));
    }

    @PutMapping("/addresses/{id}")
    @Transactional
    public ResponseEntity<ApiResponse<AddressDTO>> updateAddress(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody AddressDTO dto) {

        User user = getAuthUser(authentication);
        UserAddress address = addressRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found: " + id));

        if (!address.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Access denied.");
        }

        // If setting as default, unset others
        if (Boolean.TRUE.equals(dto.getIsDefault())) {
            addressRepository.clearDefaultForUser(user.getId());
        }

        if (dto.getLabel()       != null) address.setLabel(dto.getLabel());
        if (dto.getFullAddress() != null) address.setFullAddress(dto.getFullAddress());
        if (dto.getCity()        != null) address.setCity(dto.getCity());
        if (dto.getPincode()     != null) address.setPincode(dto.getPincode());
        if (dto.getIsDefault()   != null) address.setIsDefault(dto.getIsDefault());

        addressRepository.save(address);
        return ResponseEntity.ok(ApiResponse.ok(toAddressDTO(address), "Address updated successfully"));
    }

    @DeleteMapping("/addresses/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAddress(
            Authentication authentication,
            @PathVariable Long id) {

        User user = getAuthUser(authentication);
        UserAddress address = addressRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Address not found: " + id));

        if (!address.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Access denied.");
        }

        addressRepository.delete(address);
        return ResponseEntity.ok(ApiResponse.ok(null, "Address deleted successfully"));
    }

    // ── Helpers ────────────────────────────────────────────────────────────

    private User getAuthUser(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private UserDTO mapToDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phone(user.getPhone())
                .role(user.getRole() != null ? user.getRole().name() : null)
                .profileImage(user.getProfileImage())
                .isActive(user.getIsActive())
                .emailVerified(user.getEmailVerified())
                .phoneVerified(user.getPhoneVerified())
                .createdAt(user.getCreatedAt())
                .build();
    }

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
}
