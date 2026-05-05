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

/**
 * Legacy user profile endpoints.
 *
 * Address management has been moved to UserProfileController to avoid
 * ambiguous route conflicts. Only basic profile GET/PUT remain here.
 *
 * ┌──────────────────────────────────────────────────────┐
 * │ GET /api/user/me       → get current user info       │
 * │ PUT /api/user/update   → update firstName/lastName   │
 * └──────────────────────────────────────────────────────┘
 */
@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

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
}
