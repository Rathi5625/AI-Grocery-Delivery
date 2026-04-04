package com.freshai.grocery.notification.sms;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * Stub SMS provider — logs the OTP to console.
 *
 * To use Twilio:
 *   1. Add dependency: com.twilio.sdk:twilio:x.y.z
 *   2. Replace this class body with:
 *        Twilio.init(ACCOUNT_SID, AUTH_TOKEN);
 *        Message.creator(new PhoneNumber(phoneNumber),
 *                        new PhoneNumber(FROM_NUMBER),
 *                        "Your FreshAI code: " + otpCode).create();
 *
 * To use AWS SNS:
 *   1. Add dependency: software.amazon.awssdk:sns
 *   2. Replace with SNS PublishRequest.
 */
@Service
@Slf4j
public class SmsServiceStub implements SmsService {

    @Override
    public void sendOtp(String phoneNumber, String otpCode) {
        // TODO: Integrate real SMS provider
        log.info("[SMS-STUB] Would send OTP {} to phone {}", otpCode, phoneNumber);
    }
}
