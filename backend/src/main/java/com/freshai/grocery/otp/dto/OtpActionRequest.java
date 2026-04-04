package com.freshai.grocery.otp.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

/**
 * Request body for "verify OTP and apply the change atomically" endpoints.
 *
 * Used by:
 *   POST /api/auth/forgot-password/reset → purpose=PASSWORD_RESET, email=..., otpCode=..., newPassword=...
 *   (Profile change endpoints use OtpVerifyRequest separately before UpdateProfileRequest)
 */
@Data
public class OtpActionRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank(message = "OTP purpose is required")
    private String purpose;

    @NotBlank(message = "OTP code is required")
    @Pattern(regexp = "^[0-9]{6}$", message = "OTP must be exactly 6 digits")
    private String otpCode;

    /** New password — required for PASSWORD_RESET and PASSWORD_CHANGE purposes */
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String newPassword;

    /**
     * New value being applied after OTP success:
     * - EMAIL_CHANGE  → the new email address
     * - PHONE_CHANGE  → the new phone number
     */
    private String newValue;
}
