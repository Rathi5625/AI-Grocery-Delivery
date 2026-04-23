package com.freshai.grocery.user.controller;

import com.freshai.grocery.exception.ApiResponse;
import com.freshai.grocery.exception.ResourceNotFoundException;
import com.freshai.grocery.user.dto.UserDTO;
import com.freshai.grocery.user.dto.UserProfileUpdateDTO;
import com.freshai.grocery.user.entity.User;
import com.freshai.grocery.user.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final com.freshai.grocery.user.repository.UserAddressRepository addressRepository;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserDTO>> getCurrentUser(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return ResponseEntity.ok(ApiResponse.ok(mapToDTO(user)));
    }

    @PutMapping("/update")
    public ResponseEntity<ApiResponse<UserDTO>> updateProfile(
            Authentication authentication,
            @Valid @RequestBody UserProfileUpdateDTO updateDTO) {
        
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setFirstName(updateDTO.getFirstName());
        user.setLastName(updateDTO.getLastName());
        user.setPhone(updateDTO.getPhone());

        userRepository.save(user);

        return ResponseEntity.ok(ApiResponse.ok(mapToDTO(user), "Profile updated successfully"));
    }

    @GetMapping("/addresses")
    public ResponseEntity<ApiResponse<java.util.List<com.freshai.grocery.user.dto.AddressDTO>>> getAddresses(
            Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        
        java.util.List<com.freshai.grocery.user.dto.AddressDTO> addresses = addressRepository
                .findByUserIdOrderByIsDefaultDescIdAsc(user.getId())
                .stream().map(a -> com.freshai.grocery.user.dto.AddressDTO.builder()
                        .id(a.getId())
                        .label(a.getLabel())
                        .fullAddress(a.getFullAddress())
                        .city(a.getCity())
                        .pincode(a.getPincode())
                        .isDefault(a.getIsDefault())
                        .build())
                .collect(java.util.stream.Collectors.toList());

        return ResponseEntity.ok(ApiResponse.ok(addresses));
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
}
