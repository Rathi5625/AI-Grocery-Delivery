package com.freshai.grocery.notification.email;

/**
 * Email notification service.
 * All methods are fire-and-forward — exceptions are caught and logged inside the implementation.
 */
public interface EmailService {

    /** OTP for EMAIL_CHANGE or PHONE_CHANGE (generic OTP email) */
    void sendOtpEmail(String toEmail, String otpCode, String purpose);

    /** OTP sent to verify email address at registration */
    void sendEmailVerificationOtp(String toEmail, String firstName, String otpCode);

    /** OTP sent before allowing PASSWORD_CHANGE in profile settings */
    void sendPasswordChangeOtp(String toEmail, String firstName, String otpCode);

    /** OTP sent for the unauthenticated PASSWORD_RESET (forgot password) flow */
    void sendPasswordResetOtp(String toEmail, String firstName, String otpCode);

    /** Confirmation email after a sensitive profile field is updated */
    void sendProfileUpdateConfirmation(String toEmail, String fieldChanged);

    /** Welcome email sent immediately after a new account is created */
    void sendWelcomeEmail(String toEmail, String firstName);

    /** Alert sent after a password is successfully reset/changed */
    void sendPasswordChangedAlert(String toEmail, String firstName);
}
