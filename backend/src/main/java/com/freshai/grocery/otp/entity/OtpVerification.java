package com.freshai.grocery.otp.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "otp_verification",   // fixed: schema uses 'otp_verification' (no plural)
    indexes = {
        @Index(name = "idx_otp_user_purpose", columnList = "user_id, otp_purpose"),
        @Index(name = "idx_otp_expiry",       columnList = "expiry_time")
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OtpVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "otp_id")
    private Long otpId;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "otp_code", nullable = false, length = 6)
    private String otpCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "otp_purpose", nullable = false, length = 30)
    private OtpPurpose otpPurpose;

    /**
     * The new value being verified:
     * - EMAIL_CHANGE  → new email address
     * - PHONE_CHANGE  → new phone number
     * - EMAIL_VERIFY  → email to verify (same as registration email)
     * - PASSWORD_RESET → email of the account requesting reset
     * - PASSWORD_CHANGE → null (change within profile, current user known)
     */
    @Column(name = "target_value", length = 255)
    private String targetValue;

    @Column(name = "expiry_time", nullable = false)
    private LocalDateTime expiryTime;

    @Column(name = "is_verified")
    @Builder.Default
    private Boolean isVerified = false;

    @Column(name = "attempt_count")
    @Builder.Default
    private Integer attemptCount = 0;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiryTime);
    }

    public boolean isMaxAttemptsExceeded(int maxAttempts) {
        return attemptCount >= maxAttempts;
    }

    // ── Purpose enum ─────────────────────────────────────────────────────────

    public enum OtpPurpose {
        /** Verify email at registration time */
        EMAIL_VERIFY,
        /** Verify new email before updating it in profile */
        EMAIL_CHANGE,
        /** Verify new phone before updating it in profile */
        PHONE_CHANGE,
        /** OTP sent before allowing in-profile password change */
        PASSWORD_CHANGE,
        /** Password reset flow (forgot password — unauthenticated) */
        PASSWORD_RESET
    }
}
