package com.freshai.grocery.notification.sms;

/**
 * Abstraction for SMS OTP delivery.
 * Swap the implementation bean to change provider (Twilio / Firebase / AWS SNS).
 */
public interface SmsService {
    void sendOtp(String phoneNumber, String otpCode);
}
