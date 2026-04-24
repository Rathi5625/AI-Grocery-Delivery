package com.freshai.grocery.otp.service;

import com.freshai.grocery.exception.BadRequestException;
import com.freshai.grocery.notification.email.EmailService;
import com.freshai.grocery.notification.sms.SmsService;
import com.freshai.grocery.otp.dto.OtpRequest;
import com.freshai.grocery.otp.dto.OtpVerifyRequest;
import com.freshai.grocery.otp.entity.OtpVerification;
import com.freshai.grocery.otp.entity.OtpVerification.OtpPurpose;
import com.freshai.grocery.otp.repository.OtpRepository;
import com.freshai.grocery.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;

/**
 * Central OTP orchestration service.
 *
 * Supported flows
 * ───────────────
 * 1. EMAIL_VERIFY → OTP sent to registered email; on verify →
 * user.emailVerified = true
 * 2. EMAIL_CHANGE → OTP sent to the NEW email; on verify → user.email is
 * updated
 * 3. PHONE_CHANGE → OTP sent to new phone (SMS) or current email; on verify →
 * user.phone updated
 * 4. PASSWORD_CHANGE → OTP sent to current email; on verify → password hash
 * updated
 * 5. PASSWORD_RESET → Unauthenticated flow; OTP sent to account email; on
 * verify → new password set
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class OtpService {

    private static final int OTP_EXPIRY_MINUTES = 5;
    private static final int MAX_OTP_PER_HOUR = 5; // rate-limit per user per purpose
    private static final int MAX_ATTEMPTS = 3;
    private static final SecureRandom RANDOM = new SecureRandom();

    private final OtpRepository otpRepository;
    private final EmailService emailService;
    private final SmsService smsService;

    // ═══════════════════════════════════════════════════════════════════════
    // GENERATE & SEND
    // ═══════════════════════════════════════════════════════════════════════

    /**
     * Primary entry point for AUTHENTICATED users.
     * Called by UserProfileController → /api/user/send-otp
     */
    @Transactional
    public void generateAndSend(User user, OtpRequest request) {
        OtpPurpose purpose = parsePurpose(request.getPurpose());
        validateTargetValue(purpose, request.getTargetValue());
        enforceRateLimit(user.getId(), purpose);

        // Invalidate any earlier active OTPs for same user + purpose
        otpRepository.invalidateActiveOtps(user.getId(), purpose);

        String code = generateCode();
        OtpVerification otp = buildOtp(user.getId(), code, purpose, request.getTargetValue());
        otpRepository.save(otp);

        deliverOtp(user, purpose, code, request.getTargetValue());
        log.info("OTP generated: userId={} purpose={}", user.getId(), purpose);
    }

    /**
     * Send OTP for the unauthenticated PASSWORD_RESET flow.
     * The targetValue must be the user's registered email.
     */
    @Transactional
    public void generateAndSendForPasswordReset(User user) {
        enforceRateLimit(user.getId(), OtpPurpose.PASSWORD_RESET);
        otpRepository.invalidateActiveOtps(user.getId(), OtpPurpose.PASSWORD_RESET);

        String code = generateCode();
        OtpVerification otp = buildOtp(user.getId(), code, OtpPurpose.PASSWORD_RESET, user.getEmail());
        otpRepository.save(otp);

        emailService.sendPasswordResetOtp(user.getEmail(), user.getFirstName(), code);
        log.info("Password-reset OTP sent: userId={}", user.getId());
    }

    /**
     * Send email-verification OTP right after registration.
     * OTP is always persisted to DB. Email delivery failure is logged but does NOT
     * prevent the OTP record from being saved (user can resend from verify page).
     */
    @Transactional
    public void sendEmailVerificationOtp(User user) {
        // No rate-limit here — called only once at registration
        otpRepository.invalidateActiveOtps(user.getId(), OtpPurpose.EMAIL_VERIFY);

        String code = generateCode();
        OtpVerification otp = buildOtp(user.getId(), code, OtpPurpose.EMAIL_VERIFY, user.getEmail());
        otpRepository.save(otp); // always save first

        // ALWAYS print OTP to console first (fail-safe — visible even if SMTP fails)
        System.out.println("================================================");
        System.out.println("[OTP GENERATED] Email : " + user.getEmail());
        System.out.println("[OTP GENERATED] Code  : " + code);
        System.out.println("[OTP GENERATED] Purpose: EMAIL_VERIFY");
        System.out.println("================================================");
        log.info("[OTP] Generated code for userId={} email={}", user.getId(), user.getEmail());

        // Email is best-effort — OTP is already in DB so user can verify even if SMTP
        // fails
        try {
            emailService.sendEmailVerificationOtp(user.getEmail(), user.getFirstName(), code);
            log.info("[OTP] Email-verification OTP sent successfully: userId={}", user.getId());
            System.out.println("[OTP EMAIL] Successfully dispatched to: " + user.getEmail());
        } catch (Exception e) {
            log.warn("[OTP] Email delivery failed for userId={}: {}", user.getId(), e.getMessage());
            log.error("[OTP] SMTP Error details:", e);
            System.err.println("[OTP EMAIL FAILED] " + e.getMessage());
            System.out.println("[OTP FALLBACK] Check console above for the OTP code — it's saved in DB.");
        }
    }

    /**
     * Resend email-verification OTP from the verify page.
     * Applies rate-limiting (max 5 per hour) and invalidates any existing OTPs.
     */
    @Transactional
    public void resendEmailVerificationOtp(User user) {
        enforceRateLimit(user.getId(), OtpPurpose.EMAIL_VERIFY);
        sendEmailVerificationOtp(user);
        log.info("[OTP RESEND] Email-verification OTP resent: userId={}", user.getId());
    }

    // ═══════════════════════════════════════════════════════════════════════
    // VERIFY
    // ═══════════════════════════════════════════════════════════════════════

    /**

     * Verifies an OTP without applying the change.
     * Returns the verified OtpVerification record so the caller can act on it.
     */
    @Transactional
    public OtpVerification verifyOtp(User user, OtpVerifyRequest request) {
        OtpPurpose purpose = parsePurpose(request.getPurpose());

        OtpVerification otp = otpRepository
                .findTopByUserIdAndOtpPurposeAndIsVerifiedFalseOrderByCreatedAtDesc(user.getId(), purpose)
                .orElseThrow(() -> new BadRequestException("No active OTP found. Please request a new one."));

        checkOtp(otp, request.getOtpCode());

        otpRepository.markVerified(otp.getOtpId());
        otp.setIsVerified(true);
        log.info("OTP verified: userId={} purpose={}", user.getId(), purpose);
        return otp;
    }

    /**
     * Verify OTP for an unauthenticated user (PASSWORD_RESET flow).
     * Looks up by user ID only — caller must supply the User object fetched by
     * email.
     */
    @Transactional
    public OtpVerification verifyOtpForPasswordReset(Long userId, String otpCode) {
        OtpVerification otp = otpRepository
                .findTopByUserIdAndOtpPurposeAndIsVerifiedFalseOrderByCreatedAtDesc(userId, OtpPurpose.PASSWORD_RESET)
                .orElseThrow(() -> new BadRequestException("No active OTP found. Please request a new one."));

        checkOtp(otp, otpCode);

        otpRepository.markVerified(otp.getOtpId());
        otp.setIsVerified(true);
        log.info("Password-reset OTP verified: userId={}", userId);
        return otp;
    }

    // ═══════════════════════════════════════════════════════════════════════
    // SCHEDULED CLEANUP
    // ═══════════════════════════════════════════════════════════════════════

    /** Purge expired OTPs every hour to keep the table lean. */
    @Scheduled(fixedRate = 3_600_000)
    @Transactional
    public void cleanupExpiredOtps() {
        int deleted = otpRepository.deleteExpiredOtps(LocalDateTime.now());
        log.debug("Cleaned up {} expired OTPs", deleted);
    }

    // ═══════════════════════════════════════════════════════════════════════
    // PRIVATE HELPERS
    // ═══════════════════════════════════════════════════════════════════════

    private String generateCode() {
        int code = 100_000 + RANDOM.nextInt(900_000);
        return String.valueOf(code);
    }

    private OtpPurpose parsePurpose(String raw) {
        if (raw == null || raw.isBlank()) {
            throw new BadRequestException("OTP purpose is required.");
        }
        try {
            return OtpPurpose.valueOf(raw.toUpperCase().trim());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException(
                    "Invalid OTP purpose '" + raw + "'. Valid values: EMAIL_VERIFY, EMAIL_CHANGE, " +
                            "PHONE_CHANGE, PASSWORD_CHANGE, PASSWORD_RESET");
        }
    }

    private void validateTargetValue(OtpPurpose purpose, String targetValue) {
        switch (purpose) {
            case EMAIL_CHANGE -> {
                if (targetValue == null || targetValue.isBlank()) {
                    throw new BadRequestException("New email address (targetValue) is required for EMAIL_CHANGE.");
                }
                if (!targetValue.matches("^[\\w.%+\\-]+@[\\w.\\-]+\\.[a-zA-Z]{2,}$")) {
                    throw new BadRequestException("targetValue must be a valid email address for EMAIL_CHANGE.");
                }
            }
            case PHONE_CHANGE -> {
                if (targetValue == null || targetValue.isBlank()) {
                    throw new BadRequestException("New phone number (targetValue) is required for PHONE_CHANGE.");
                }
                if (!targetValue.matches("^[+]?[0-9]{10,15}$")) {
                    throw new BadRequestException("targetValue must be a valid phone number for PHONE_CHANGE.");
                }
            }
            default -> {
                /* no targetValue needed */ }
        }
    }

    private void enforceRateLimit(Long userId, OtpPurpose purpose) {
        long recentCount = otpRepository.countRecentOtpRequests(
                userId, purpose, LocalDateTime.now().minusHours(1));
        if (recentCount >= MAX_OTP_PER_HOUR) {
            throw new BadRequestException(
                    "Too many OTP requests. Please wait before trying again.");
        }
    }

    private OtpVerification buildOtp(Long userId, String code, OtpPurpose purpose, String targetValue) {
        return OtpVerification.builder()
                .userId(userId)
                .otpCode(code)
                .otpPurpose(purpose)
                .targetValue(targetValue)
                .expiryTime(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES))
                .build();
    }

    private void deliverOtp(User user, OtpPurpose purpose, String code, String targetValue) {
        switch (purpose) {
            case EMAIL_VERIFY ->
                emailService.sendEmailVerificationOtp(user.getEmail(), user.getFirstName(), code);

            case EMAIL_CHANGE -> {
                // Send to NEW email so user proves they own it
                String dest = (targetValue != null && !targetValue.isBlank()) ? targetValue : user.getEmail();
                emailService.sendOtpEmail(dest, code, purpose.name());
            }

            case PHONE_CHANGE -> {
                // Prefer SMS to new phone; fall back to email
                if (targetValue != null && !targetValue.isBlank()) {
                    smsService.sendOtp(targetValue, code);
                } else {
                    emailService.sendOtpEmail(user.getEmail(), code, purpose.name());
                }
            }

            case PASSWORD_CHANGE ->
                emailService.sendPasswordChangeOtp(user.getEmail(), user.getFirstName(), code);

            case PASSWORD_RESET ->
                emailService.sendPasswordResetOtp(user.getEmail(), user.getFirstName(), code);
        }
    }

    private void checkOtp(OtpVerification otp, String inputCode) {
        if (otp.isExpired()) {
            throw new BadRequestException("OTP has expired. Please request a new one.");
        }
        if (otp.isMaxAttemptsExceeded(MAX_ATTEMPTS)) {
            throw new BadRequestException(
                    "Maximum verification attempts exceeded. Please request a new OTP.");
        }

        // Increment attempt before checking — prevents timing oracle
        otp.setAttemptCount(otp.getAttemptCount() + 1);
        otpRepository.save(otp);

        if (!otp.getOtpCode().equals(inputCode)) {
            int remaining = MAX_ATTEMPTS - otp.getAttemptCount();
            throw new BadRequestException(
                    "Invalid OTP. " + Math.max(0, remaining) + " attempt(s) remaining.");
        }
    }
}
