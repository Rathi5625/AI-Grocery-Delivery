package com.freshai.grocery.otp.controller;

import com.freshai.grocery.exception.ApiResponse;
import com.freshai.grocery.exception.BadRequestException;
import com.freshai.grocery.otp.entity.OtpVerification;
import com.freshai.grocery.otp.repository.OtpRepository;
import com.freshai.grocery.otp.service.OtpService;
import com.freshai.grocery.user.entity.User;
import com.freshai.grocery.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;


@RestController
@RequestMapping("/api/otp")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class OtpController {

    private final OtpService otpService;
    private final OtpRepository otpRepository;
    private final UserRepository userRepository;

    // ─── SEND ─────────────────────────────────────────────────────────────────

    @PostMapping("/send")
    public ResponseEntity<ApiResponse<Map<String, String>>> sendOtp(
            @RequestBody Map<String, String> payload) {

        String target = payload.get("target");
        if (target == null || target.isBlank()) {
            throw new BadRequestException("target (email) is required");
        }

        User user = userRepository.findByEmail(target)
                .orElseThrow(() -> new BadRequestException("No account found with that email."));

        otpService.sendEmailVerificationOtp(user);
        log.info("[OTP SEND] Verification OTP sent to userId={}", user.getId());

        return ResponseEntity.ok(ApiResponse.ok(
                Map.of("message", "OTP sent successfully to " + target),
                "OTP sent"));
    }

    // ─── RESEND ────────────────────────────────────────────────────────────────

    /**
     * POST /api/otp/resend
     * Generates a fresh OTP, invalidates old ones, and re-sends to the user's email.
     */
    @PostMapping("/resend")
    public ResponseEntity<ApiResponse<Map<String, String>>> resendOtp(
            @RequestBody Map<String, String> payload) {

        String email = payload.get("email");
        if (email == null || email.isBlank()) {
            throw new BadRequestException("email is required");
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("No account found with that email."));

        if (Boolean.TRUE.equals(user.getEmailVerified())) {
            throw new BadRequestException("Email is already verified.");
        }

        // resendEmailVerificationOtp applies rate-limit + invalidates old OTPs
        otpService.resendEmailVerificationOtp(user);
        log.info("[OTP RESEND] New verification OTP sent to userId={}", user.getId());

        return ResponseEntity.ok(ApiResponse.ok(
                Map.of("message", "A new OTP has been sent to " + email),
                "OTP resent"));
    }

    // ─── VERIFY ───────────────────────────────────────────────────────────────

    @Transactional
    @PostMapping("/verify")
    public ResponseEntity<ApiResponse<Map<String, String>>> verifyOtp(
            @RequestBody Map<String, String> payload) {

        String otpCode = payload.get("otp");
        String email   = payload.get("email"); // optional but used for lookup when provided

        if (otpCode == null || otpCode.isBlank()) {
            throw new BadRequestException("OTP code is required");
        }

        List<OtpVerification> candidates;

        if (email != null && !email.isBlank()) {
            // Prefer lookup by email → more accurate when multiple users exist
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new BadRequestException("No account found with that email."));

            candidates = otpRepository.findByOtpCodeAndIsVerifiedFalse(otpCode)
                    .stream()
                    .filter(o -> o.getUserId().equals(user.getId()))
                    .toList();
        } else {
            candidates = otpRepository.findByOtpCodeAndIsVerifiedFalse(otpCode);
        }

        if (candidates.isEmpty()) {
            throw new BadRequestException("Invalid OTP. Please check the code and try again.");
        }

        OtpVerification otp = candidates.get(0);

        // ── Expiry check ──────────────────────────────────────────────────────
        if (otp.isExpired()) {
            throw new BadRequestException("OTP has expired. Please request a new one.");
        }

        // ── Attempt-limit check ───────────────────────────────────────────────
        if (otp.isMaxAttemptsExceeded(3)) {
            throw new BadRequestException(
                    "Too many failed attempts. Please request a new OTP.");
        }

        // Increment before comparing — prevents timing oracle
        otp.setAttemptCount(otp.getAttemptCount() + 1);

        if (!otp.getOtpCode().equals(otpCode)) {
            otpRepository.save(otp);
            int remaining = Math.max(0, 3 - otp.getAttemptCount());
            throw new BadRequestException(
                    "Invalid OTP. " + remaining + " attempt(s) remaining.");
        }

        // ── Mark OTP verified ─────────────────────────────────────────────────
        otpRepository.markVerified(otp.getOtpId());
        otp.setIsVerified(true);

        // ── Apply side-effect: set email_verified = true ──────────────────────
        if (otp.getOtpPurpose() == OtpVerification.OtpPurpose.EMAIL_VERIFY) {
            User user = userRepository.findById(otp.getUserId())
                    .orElseThrow(() -> new BadRequestException("User not found."));
            user.setEmailVerified(true);
            userRepository.save(user);
            log.info("[OTP VERIFY] Email verified for userId={}", user.getId());
        }

        return ResponseEntity.ok(ApiResponse.ok(
                Map.of("message", "Email verified successfully!"),
                "Verified successfully"));
    }
}
