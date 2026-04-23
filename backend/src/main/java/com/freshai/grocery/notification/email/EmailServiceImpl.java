package com.freshai.grocery.notification.email;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import jakarta.mail.internet.InternetAddress;

/**
 * HTML email implementation.
 *
 * All templates share the same green (#10b981) FreshAI brand identity.
 * Mail sends are best-effort: exceptions are caught and logged, not re-thrown for
 * non-critical emails (welcome, confirmation). For OTP emails, the exception IS
 * re-thrown so the caller can surface the error to the user.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String smtpUsername;          // raw SMTP login (e.g. you@gmail.com)

    @Value("${app.mail.from-address:${spring.mail.username:noreply@freshai.com}}")
    private String fromAddress;           // display From address

    @Value("${app.mail.from-name:FreshAI}")
    private String fromName;              // display From name

    @Value("${app.mail.enabled:true}")
    private boolean mailEnabled;          // master kill-switch

    // ─── Brand constants ───────────────────────────────────────────────────────

    private static final String BRAND_COLOR = "#10b981";
    private static final String BRAND_NAME  = "🌿 FreshAI";
    private static final String BRAND_TAGLINE = "Fresh Grocery Delivery";
    private static final int    OTP_EXPIRY_MINUTES = 5;

    // ═══════════════════════════════════════════════════════════════════════
    // PUBLIC API
    // ═══════════════════════════════════════════════════════════════════════

    @Override
    public void sendOtpEmail(String toEmail, String otpCode, String purpose) {
        String purposeLabel = switch (purpose.toUpperCase()) {
            case "EMAIL_CHANGE"   -> "email address change";
            case "PHONE_CHANGE"   -> "phone number change";
            case "PASSWORD_CHANGE" -> "password change";
            case "EMAIL_VERIFY"   -> "email verification";
            default               -> "profile update";
        };
        sendHtml(toEmail, BRAND_NAME + " — Verification Code",
                buildOtpBlock("Verification Code",
                        "You requested a code for your <strong>" + purposeLabel + "</strong>.",
                        otpCode));
    }

    @Override
    public void sendEmailVerificationOtp(String toEmail, String firstName, String otpCode) {
        sendHtml(toEmail, BRAND_NAME + " — Verify Your Email",
                buildOtpBlock("Verify Your Email ✉️",
                        "Hi <strong>" + escHtml(firstName) + "</strong>, thanks for joining FreshAI! " +
                        "Enter the code below to verify your email address.",
                        otpCode));
    }

    @Override
    public void sendPasswordChangeOtp(String toEmail, String firstName, String otpCode) {
        sendHtml(toEmail, BRAND_NAME + " — Password Change Request",
                buildOtpBlock("Password Change 🔒",
                        "Hi <strong>" + escHtml(firstName) + "</strong>, we received a request to change " +
                        "your password. Enter the code below to continue.",
                        otpCode));
    }

    @Override
    public void sendPasswordResetOtp(String toEmail, String firstName, String otpCode) {
        sendHtml(toEmail, BRAND_NAME + " — Reset Your Password",
                buildOtpBlock("Password Reset 🔑",
                        "Hi <strong>" + escHtml(firstName) + "</strong>, we received a request to reset " +
                        "your FreshAI account password. Enter the code below. " +
                        "If you did not request this, you can safely ignore this email.",
                        otpCode));
    }

    @Override
    public void sendProfileUpdateConfirmation(String toEmail, String fieldChanged) {
        sendHtmlNonCritical(toEmail, BRAND_NAME + " — Profile Updated",
                buildConfirmation(
                        "Profile Updated ✓",
                        "Your <strong>" + escHtml(fieldChanged) + "</strong> has been updated successfully. " +
                        "If you did not make this change, please contact support immediately."));
    }

    @Override
    public void sendWelcomeEmail(String toEmail, String firstName) {
        sendHtmlNonCritical(toEmail, "Welcome to " + BRAND_NAME + " 🎉",
                buildWelcome(firstName));
    }

    @Override
    public void sendPasswordChangedAlert(String toEmail, String firstName) {
        sendHtmlNonCritical(toEmail, BRAND_NAME + " — Password Changed Successfully",
                buildConfirmation(
                        "Password Changed ✓",
                        "Hi <strong>" + escHtml(firstName) + "</strong>, your password was just changed. " +
                        "If this was you, no action is needed. " +
                        "If you did not make this change, please contact support immediately."));
    }

    // ═══════════════════════════════════════════════════════════════════════
    // HTML BUILDERS
    // ═══════════════════════════════════════════════════════════════════════

    private String buildOtpBlock(String heading, String body, String code) {
        return """
            <div style="font-family:Inter,Arial,sans-serif;max-width:500px;margin:0 auto;background:#f9fafb;padding:32px;border-radius:16px;">
              %s
              <div style="background:#fff;border-radius:12px;padding:28px;box-shadow:0 2px 12px rgba(0,0,0,0.07);">
                <h2 style="color:#111827;margin:0 0 10px;font-size:20px;">%s</h2>
                <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0 0 24px;">%s</p>
                <div style="background:#f0fdf4;border:2px dashed %s;border-radius:10px;padding:22px;text-align:center;">
                  <span style="font-size:38px;font-weight:800;letter-spacing:12px;color:%s;font-variant-numeric:tabular-nums;">%s</span>
                </div>
                <p style="color:#9ca3af;font-size:12px;margin:18px 0 0;text-align:center;">
                  ⏱ Expires in <strong>%d minutes</strong>. Never share this code with anyone.
                </p>
              </div>
              %s
            </div>
            """.formatted(brandHeader(), heading, body, BRAND_COLOR, BRAND_COLOR, code,
                          OTP_EXPIRY_MINUTES, brandFooter());
    }

    private String buildConfirmation(String heading, String body) {
        return """
            <div style="font-family:Inter,Arial,sans-serif;max-width:500px;margin:0 auto;background:#f9fafb;padding:32px;border-radius:16px;">
              %s
              <div style="background:#fff;border-radius:12px;padding:28px;box-shadow:0 2px 12px rgba(0,0,0,0.07);">
                <h2 style="color:#111827;margin:0 0 10px;font-size:20px;">%s</h2>
                <p style="color:#6b7280;font-size:14px;line-height:1.6;margin:0;">%s</p>
              </div>
              %s
            </div>
            """.formatted(brandHeader(), heading, body, brandFooter());
    }

    private String buildWelcome(String firstName) {
        return """
            <div style="font-family:Inter,Arial,sans-serif;max-width:500px;margin:0 auto;background:#f9fafb;padding:32px;border-radius:16px;">
              %s
              <div style="background:#fff;border-radius:12px;padding:28px;box-shadow:0 2px 12px rgba(0,0,0,0.07);">
                <h2 style="color:#111827;margin:0 0 10px;">Welcome, <span style="color:%s;">%s</span>! 👋</h2>
                <p style="color:#6b7280;font-size:14px;line-height:1.7;">
                  Thanks for joining <strong>FreshAI</strong> — your smart grocery delivery companion.
                  We bring fresh fruits, veggies, dairy, and more straight to your door.
                </p>
                <a href="http://localhost:5173"
                   style="display:inline-block;margin-top:20px;padding:12px 28px;background:%s;
                          color:#fff;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px;">
                  Start Shopping →
                </a>
              </div>
              %s
            </div>
            """.formatted(brandHeader(), BRAND_COLOR, escHtml(firstName), BRAND_COLOR, brandFooter());
    }

    // ═══════════════════════════════════════════════════════════════════════
    // SEND HELPERS
    // ═══════════════════════════════════════════════════════════════════════

    /** Send a critical email (OTP). Re-throws on failure so caller can surface it. */
    private void sendHtml(String to, String subject, String htmlBody) {
        // ── Master kill-switch guard ──────────────────────────────────────
        if (!mailEnabled) {
            log.warn("[EMAIL DISABLED] app.mail.enabled=false — skipping send to {} subject='{}'", to, subject);
            return;
        }

        // ── Credential sanity check ───────────────────────────────────────
        if (smtpUsername == null || smtpUsername.isBlank()) {
            log.error("[EMAIL CONFIG ERROR] MAIL_USERNAME env var is not set! " +
                      "Set it in PowerShell: $env:MAIL_USERNAME='you@gmail.com'");
            throw new RuntimeException("Email service is not configured (MAIL_USERNAME missing).");
        }

        System.out.println("[EMAIL] Attempting to send email to: " + to);
        System.out.println("[EMAIL] Subject: " + subject);
        System.out.println("[EMAIL] From: " + fromAddress + " (" + fromName + ")");
        System.out.println("[EMAIL] SMTP user: " + smtpUsername);

        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper h = new MimeMessageHelper(msg, true, "UTF-8");
            h.setFrom(new InternetAddress(fromAddress, fromName));
            h.setTo(to);
            h.setSubject(subject);
            h.setText(htmlBody, true);
            mailSender.send(msg);
            log.info("[EMAIL OK] Sent to={} subject='{}'", to, subject);
            System.out.println("[EMAIL OK] Email sent successfully to: " + to);
        } catch (Exception e) {
            log.error("[EMAIL FAILED] Could not send to={} subject='{}' error={}", to, subject, e.getMessage(), e);
            System.err.println("[EMAIL FAILED] Error sending to: " + to);
            e.printStackTrace();
            throw new RuntimeException("Could not send email to " + to + ": " + e.getMessage(), e);
        }
    }

    /** Send a non-critical email (welcome, confirmation). Logs but does not re-throw. */
    private void sendHtmlNonCritical(String to, String subject, String htmlBody) {
        try {
            sendHtml(to, subject, htmlBody);
        } catch (Exception e) {
            log.warn("[EMAIL WARN] Non-critical email failed: to={} reason={}", to, e.getMessage());
            System.err.println("[EMAIL WARN] Non-critical send failed for: " + to + " — " + e.getMessage());
        }
    }

    // ═══════════════════════════════════════════════════════════════════════
    // TEMPLATE PARTIALS
    // ═══════════════════════════════════════════════════════════════════════

    private String brandHeader() {
        return """
            <div style="text-align:center;margin-bottom:24px;">
              <div style="font-size:28px;font-weight:800;color:%s;">%s</div>
              <div style="color:#9ca3af;font-size:13px;margin-top:2px;">%s</div>
            </div>
            """.formatted(BRAND_COLOR, BRAND_NAME, BRAND_TAGLINE);
    }

    private String brandFooter() {
        return """
            <p style="color:#9ca3af;font-size:11px;text-align:center;margin:20px 0 0;line-height:1.6;">
              This email was sent by FreshAI. &copy; 2024 FreshAI, All rights reserved.<br>
              If you have questions, contact <a href="mailto:support@freshai.com" style="color:%s;">support@freshai.com</a>
            </p>
            """.formatted(BRAND_COLOR);
    }

    /** Escape HTML special chars to prevent injection in name/field values */
    private String escHtml(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;");
    }
}
