package com.freshai.grocery.auth.controller;

import com.freshai.grocery.exception.ApiResponse;
import com.freshai.grocery.notification.email.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * ⚠  DIAGNOSTIC ONLY — Remove or disable this controller in production.
 *
 * Sends a test OTP email so you can verify SMTP is working without going
 * through the full registration flow.
 *
 * Usage:
 *   GET  http://localhost:8080/api/test-email
 *   GET  http://localhost:8080/api/test-email?to=your@gmail.com
 */
@RestController
@RequestMapping("/api/test-email")
@RequiredArgsConstructor
@Slf4j
public class TestEmailController {

    private final EmailService emailService;

    @Value("${spring.mail.username:}")
    private String configuredSmtpUser;

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, Object>>> sendTestEmail(
            @RequestParam(defaultValue = "test@example.com") String to) {

        System.out.println("========================================");
        System.out.println("[TEST-EMAIL] Request received");
        System.out.println("[TEST-EMAIL] Target address : " + to);
        System.out.println("[TEST-EMAIL] SMTP username  : " +
                (configuredSmtpUser.isBlank() ? "*** NOT SET — set MAIL_USERNAME env var ***" : configuredSmtpUser));
        System.out.println("========================================");

        String testOtp = "123456";

        try {
            emailService.sendEmailVerificationOtp(to, "TestUser", testOtp);

            String msg = "Test email sent successfully to: " + to;
            log.info("[TEST-EMAIL] {}", msg);
            System.out.println("[TEST-EMAIL] SUCCESS: " + msg);

            return ResponseEntity.ok(ApiResponse.ok(
                    Map.of(
                            "to",  to,
                            "otp", testOtp,
                            "smtpUser", configuredSmtpUser
                    ),
                    msg
            ));

        } catch (Exception e) {
            String errMsg = "Failed to send test email to " + to + ": " + e.getMessage();
            log.error("[TEST-EMAIL] FAILED: {}", errMsg, e);
            System.err.println("[TEST-EMAIL] FAILED: " + errMsg);
            e.printStackTrace();

            return ResponseEntity.status(500).body(
                    ApiResponse.ok(
                            Map.of(
                                    "error",    e.getMessage(),
                                    "to",       to,
                                    "smtpUser", configuredSmtpUser
                            ),
                            "Email send failed: " + e.getMessage()
                    )
            );
        }
    }
}
