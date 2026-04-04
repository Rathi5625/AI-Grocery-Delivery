package com.freshai.grocery.auth.controller;

import com.freshai.grocery.exception.ApiResponse;
import com.freshai.grocery.exception.BadRequestException;
import com.freshai.grocery.notification.email.EmailService;
import com.freshai.grocery.otp.dto.OtpActionRequest;
import com.freshai.grocery.otp.service.OtpService;
import com.freshai.grocery.user.entity.User;
import com.freshai.grocery.user.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Unauthenticated password-reset flow.
 *
 * Step 1: POST /api/auth/forgot-password/request  { email }
 *          → sends OTP to the email
 *
 * Step 2: POST /api/auth/forgot-password/verify   { email, otpCode }
 *          → validates OTP (does NOT reset yet — gives 30s grace for UX)
 *
 * Step 3: POST /api/auth/forgot-password/reset    { email, otpCode, newPassword }
 *          → verifies OTP (again) + resets password atomically
 *
 * All three endpoints are public (no JWT required).
 */
@RestController
@RequestMapping("/api/auth/forgot-password")
@RequiredArgsConstructor
public class ForgotPasswordController {

    private final UserRepository  userRepository;
    private final OtpService      otpService;
    private final PasswordEncoder passwordEncoder;
    private final EmailService    emailService;

    // ── STEP 1 ─ Request OTP ────────────────────────────────────────────────

    @PostMapping("/request")
    public ResponseEntity<ApiResponse<Map<String, String>>> requestReset(
            @RequestBody Map<String, String> payload) {

        String email = payload.get("email");
        if (email == null || email.isBlank()) {
            throw new BadRequestException("Email is required.");
        }

        // Always return success even if email not found (prevents user enumeration)
        userRepository.findByEmail(email.trim().toLowerCase()).ifPresent(user -> {
            if (Boolean.TRUE.equals(user.getIsActive())) {
                otpService.generateAndSendForPasswordReset(user);
            }
        });

        return ResponseEntity.ok(ApiResponse.ok(
            Map.of("message", "If this email is registered, a reset code has been sent."),
            "OTP sent"
        ));
    }

    // ── STEP 2 ─ Verify OTP (pre-check for UX only) ─────────────────────────

    @PostMapping("/verify")
    public ResponseEntity<ApiResponse<Map<String, Object>>> verifyResetOtp(
            @RequestBody Map<String, String> payload) {

        String email   = payload.get("email");
        String otpCode = payload.get("otpCode");

        if (email == null || otpCode == null) {
            throw new BadRequestException("email and otpCode are required.");
        }

        User user = findActiveUser(email);
        // This call validates only — does not mark the OTP as used yet
        // We re-verify in step 3 to prevent skipping step 2
        otpService.verifyOtpForPasswordReset(user.getId(), otpCode);

        // Re-mark the OTP as NOT verified so step 3 can verify it again
        // (handled inside verifyOtpForPasswordReset — keeps OTP valid until step 3)
        return ResponseEntity.ok(ApiResponse.ok(
            Map.of("verified", true, "email", email),
            "OTP verified. You may now set a new password."
        ));
    }

    // ── STEP 3 ─ Reset Password ──────────────────────────────────────────────

    @PostMapping("/reset")
    public ResponseEntity<ApiResponse<Map<String, String>>> resetPassword(
            @Valid @RequestBody OtpActionRequest request) {

        if (request.getNewPassword() == null || request.getNewPassword().length() < 8) {
            throw new BadRequestException("New password must be at least 8 characters.");
        }

        User user = findActiveUser(request.getEmail());

        // Re-verify OTP atomically with the reset
        otpService.verifyOtpForPasswordReset(user.getId(), request.getOtpCode());

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // Non-critical security alert
        emailService.sendPasswordChangedAlert(user.getEmail(), user.getFirstName());

        return ResponseEntity.ok(ApiResponse.ok(
            Map.of("message", "Password reset successful. You may now log in."),
            "Password reset"
        ));
    }

    // ── Private helper ────────────────────────────────────────────────────────

    private User findActiveUser(String email) {
        return userRepository.findByEmail(email.trim().toLowerCase())
                .filter(u -> Boolean.TRUE.equals(u.getIsActive()))
                .orElseThrow(() -> new BadRequestException("Invalid email or account is not active."));
    }
}
