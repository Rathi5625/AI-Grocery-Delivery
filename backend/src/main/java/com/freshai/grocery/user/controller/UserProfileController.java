package com.freshai.grocery.user.controller;

import com.freshai.grocery.exception.ApiResponse;
import com.freshai.grocery.exception.BadRequestException;
import com.freshai.grocery.otp.dto.OtpRequest;
import com.freshai.grocery.otp.dto.OtpVerifyRequest;
import com.freshai.grocery.otp.service.OtpService;
import com.freshai.grocery.user.dto.AddressDTO;
import com.freshai.grocery.user.dto.UpdateProfileRequest;
import com.freshai.grocery.user.dto.UserProfileDTO;
import com.freshai.grocery.user.entity.User;
import com.freshai.grocery.user.repository.UserRepository;
import com.freshai.grocery.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Authenticated user profile endpoints.
 *
 * All endpoints require a valid JWT Bearer token.
 * All responses use the ApiResponse<T> envelope.
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ GET    /api/user/profile                     → get full profile          │
 * │ PUT    /api/user/profile/update              → update name / image / ... │
 * │ POST   /api/user/send-otp                    → send OTP for sensitive op │
 * │ POST   /api/user/verify-otp                  → standalone OTP check      │
 * │ POST   /api/user/verify-email                → verify email with OTP     │
 * │ POST   /api/user/addresses                   → add address               │
 * │ PUT    /api/user/addresses/{id}              → update address             │
 * │ DELETE /api/user/addresses/{id}              → delete address             │
 * └─────────────────────────────────────────────────────────────────────────┘
 */
@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserProfileController {

    private final UserService    userService;
    private final OtpService     otpService;
    private final UserRepository userRepository;

    // ── PROFILE ────────────────────────────────────────────────────────────

    /** GET /api/user/profile */
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserProfileDTO>> getProfile(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(ApiResponse.ok(userService.getProfile(userDetails.getUsername())));
    }

    /** PUT /api/user/profile/update */
    @PutMapping("/profile/update")
    public ResponseEntity<ApiResponse<UserProfileDTO>> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(ApiResponse.ok(
            userService.updateProfile(userDetails.getUsername(), request),
            "Profile updated successfully"
        ));
    }

    // ── OTP ────────────────────────────────────────────────────────────────

    /**
     * POST /api/user/send-otp
     * Purpose values: EMAIL_VERIFY | EMAIL_CHANGE | PHONE_CHANGE | PASSWORD_CHANGE
     */
    @PostMapping("/send-otp")
    public ResponseEntity<ApiResponse<Map<String, String>>> sendOtp(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody OtpRequest request) {

        User user = getUser(userDetails.getUsername());
        otpService.generateAndSend(user, request);

        return ResponseEntity.ok(ApiResponse.ok(
            Map.of(
                "message", "OTP sent successfully. It expires in 5 minutes.",
                "purpose",  request.getPurpose().toUpperCase()
            ),
            "OTP sent"
        ));
    }

    /**
     * POST /api/user/verify-otp
     * Standalone OTP verification — use before calling updateProfile.
     * Does NOT apply any change; just confirms the OTP is valid.
     */
    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<Map<String, Object>>> verifyOtp(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody OtpVerifyRequest request) {

        User user = getUser(userDetails.getUsername());
        otpService.verifyOtp(user, request);

        return ResponseEntity.ok(ApiResponse.ok(
            Map.of("verified", true, "purpose", request.getPurpose().toUpperCase()),
            "OTP verified successfully"
        ));
    }

    /**
     * POST /api/user/verify-email
     * Body: { "otpCode": "123456" }
     * Marks the user's email as verified (emailVerified = true).
     * Call this after the user enters the OTP from the registration welcome email.
     */
    @PostMapping("/verify-email")
    public ResponseEntity<ApiResponse<Map<String, Object>>> verifyEmail(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, String> payload) {

        String otpCode = payload.get("otpCode");
        if (otpCode == null || otpCode.isBlank()) {
            throw new BadRequestException("otpCode is required.");
        }

        User user = getUser(userDetails.getUsername());

        if (Boolean.TRUE.equals(user.getEmailVerified())) {
            return ResponseEntity.ok(ApiResponse.ok(
                Map.of("emailVerified", true),
                "Email is already verified."
            ));
        }

        userService.verifyEmail(user, otpCode);

        return ResponseEntity.ok(ApiResponse.ok(
            Map.of("emailVerified", true),
            "Email verified successfully! 🎉"
        ));
    }

    // ── ADDRESSES ──────────────────────────────────────────────────────────

    /** POST /api/user/addresses */
    @PostMapping("/addresses")
    public ResponseEntity<ApiResponse<AddressDTO>> addAddress(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @RequestBody AddressDTO dto) {
        return ResponseEntity.ok(ApiResponse.ok(
            userService.addAddress(userDetails.getUsername(), dto),
            "Address added"
        ));
    }

    /** PUT /api/user/addresses/{id} */
    @PutMapping("/addresses/{id}")
    public ResponseEntity<ApiResponse<AddressDTO>> updateAddress(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id,
            @Valid @RequestBody AddressDTO dto) {
        return ResponseEntity.ok(ApiResponse.ok(
            userService.updateAddress(userDetails.getUsername(), id, dto),
            "Address updated"
        ));
    }

    /** DELETE /api/user/addresses/{id} */
    @DeleteMapping("/addresses/{id}")
    public ResponseEntity<ApiResponse<Map<String, String>>> deleteAddress(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        userService.deleteAddress(userDetails.getUsername(), id);
        return ResponseEntity.ok(ApiResponse.ok(
            Map.of("message", "Address deleted successfully.")
        ));
    }

    // ── Private helper ─────────────────────────────────────────────────────

    private User getUser(String email) {
        return userRepository.findByEmail(email).orElseThrow();
    }
}
