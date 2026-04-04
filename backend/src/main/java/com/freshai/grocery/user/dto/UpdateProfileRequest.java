package com.freshai.grocery.user.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

/**
 * Request body for PUT /api/user/profile/update
 *
 * Non-sensitive fields (firstName, lastName, profileImage) can be updated freely.
 * Sensitive fields (email, phone, newPassword) require a valid OTP.
 *
 * When changing a sensitive field:
 *  1. Client calls POST /api/user/send-otp  { purpose: "EMAIL_CHANGE", targetValue: "newemail@..." }
 *  2. User enters OTP from email
 *  3. Client sends this request with verifiedOtpCode + otpPurpose
 *  4. Server re-verifies the OTP before applying the change
 */
@Data
public class UpdateProfileRequest {

    // ── Non-sensitive (no OTP required) ──────────────────────────────────────

    @Size(min = 2, max = 100, message = "First name must be 2-100 characters")
    private String firstName;

    @Size(min = 2, max = 100, message = "Last name must be 2-100 characters")
    private String lastName;

    @Size(max = 500, message = "Profile image URL too long")
    private String profileImage;

    // ── Sensitive (OTP required) ──────────────────────────────────────────────

    @Email(message = "Invalid email format")
    @Size(max = 255)
    private String email;

    @Pattern(regexp = "^[+]?[0-9]{10,15}$", message = "Invalid phone number format")
    private String phone;

    @Size(min = 8, message = "Password must be at least 8 characters")
    private String newPassword;

    // ── OTP fields — required when any sensitive field is present ─────────────

    /**
     * The OTP code the user entered (will be re-verified server-side).
     * Required when email, phone, or newPassword is present.
     */
    private String verifiedOtpCode;

    /**
     * Must match the purpose used when requesting the OTP:
     * EMAIL_CHANGE | PHONE_CHANGE | PASSWORD_CHANGE
     */
    private String otpPurpose;
}
