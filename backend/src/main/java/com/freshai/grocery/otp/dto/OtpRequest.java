package com.freshai.grocery.otp.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * Request body for POST /api/user/send-otp
 *
 * purpose values:
 *   EMAIL_VERIFY   — verify email after registration
 *   EMAIL_CHANGE   — verify new email before updating profile
 *   PHONE_CHANGE   — verify new phone before updating profile
 *   PASSWORD_CHANGE — verify identity before in-profile password change
 *   PASSWORD_RESET  — unauthenticated forgot-password flow
 *
 * targetValue:
 *   Required for EMAIL_CHANGE (new email) and PHONE_CHANGE (new phone)
 *   For PASSWORD_RESET (unauthenticated), targetValue = the user's email
 */
@Data
public class OtpRequest {

    @NotBlank(message = "OTP purpose is required (e.g. EMAIL_VERIFY, PASSWORD_CHANGE)")
    private String purpose;

    /**
     * The new value to verify. Required for EMAIL_CHANGE and PHONE_CHANGE.
     * For PASSWORD_RESET, this is the account email.
     */
    private String targetValue;
}
