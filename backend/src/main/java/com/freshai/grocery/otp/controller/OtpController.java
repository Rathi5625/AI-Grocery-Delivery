package com.freshai.grocery.otp.controller;

import com.freshai.grocery.exception.ApiResponse;
import com.freshai.grocery.exception.BadRequestException;
import com.freshai.grocery.otp.entity.OtpVerification;
import com.freshai.grocery.otp.repository.OtpRepository;
import com.freshai.grocery.otp.service.OtpService;
import com.freshai.grocery.user.entity.User;
import com.freshai.grocery.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/otp")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class OtpController {

    private final OtpService otpService;
    private final OtpRepository otpRepository;
    private final UserRepository userRepository;

    @PostMapping("/send")
    public ResponseEntity<ApiResponse<Map<String, String>>> sendOtp(@RequestBody Map<String, String> payload) {
        String type = payload.get("type");
        String target = payload.get("target");

        if (target == null || target.isBlank()) {
            throw new BadRequestException("target is required");
        }

        User user = userRepository.findByEmail(target).orElse(null);
        if (user == null) {
            throw new BadRequestException("User not found via target contact point.");
        }

        // We can just call sendEmailVerificationOtp or similar.
        otpService.sendEmailVerificationOtp(user);
        System.out.println("OTP requested for target: " + target);

        return ResponseEntity.ok(ApiResponse.ok(
                Map.of("message", "OTP sent successfully to " + target),
                "OTP sent"
        ));
    }

    @Transactional
    @PostMapping("/verify")
    public ResponseEntity<ApiResponse<Map<String, String>>> verifyOtp(@RequestBody Map<String, String> payload) {
        String otpCode = payload.get("otp");
        if (otpCode == null || otpCode.isBlank()) {
            throw new BadRequestException("OTP code is required");
        }

        // Find active unverified OTP with this code
        List<OtpVerification> otps = otpRepository.findByOtpCodeAndIsVerifiedFalse(otpCode);
        if (otps.isEmpty()) {
            throw new BadRequestException("Invalid or expired OTP");
        }

        // Just take the first one
        OtpVerification otp = otps.get(0);

        if (otp.isExpired()) {
            throw new BadRequestException("OTP has expired. Please request a new one.");
        }
        if (otp.isMaxAttemptsExceeded(3)) {
            throw new BadRequestException("Maximum verification attempts exceeded.");
        }

        otp.setAttemptCount(otp.getAttemptCount() + 1);

        if (!otp.getOtpCode().equals(otpCode)) { // should be equal since DB hit, but just in case
            otpRepository.save(otp);
            throw new BadRequestException("Invalid OTP.");
        }

        otpRepository.markVerified(otp.getOtpId());
        otp.setIsVerified(true);

        // Apply logic (if EMAIL_VERIFY)
        if (otp.getOtpPurpose() == OtpVerification.OtpPurpose.EMAIL_VERIFY) {
            User user = userRepository.findById(otp.getUserId()).orElseThrow();
            user.setEmailVerified(true);
            userRepository.save(user);
        }

        return ResponseEntity.ok(ApiResponse.ok(
                Map.of("message", "Verified successfully"),
                "Verified successfully"
        ));
    }
}
