package com.freshai.grocery.otp.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

/**
 * Request body for POST /api/user/verify-otp
 * Also used embedded in profile update for sensitive field changes.
 */
@Data
public class OtpVerifyRequest {

    @NotBlank(message = "OTP purpose is required")
    private String purpose;

    @NotBlank(message = "OTP code is required")
    @Pattern(regexp = "^[0-9]{6}$", message = "OTP must be exactly 6 digits")
    private String otpCode;
}
