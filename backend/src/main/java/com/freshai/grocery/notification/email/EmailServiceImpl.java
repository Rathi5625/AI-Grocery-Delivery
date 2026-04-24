package com.freshai.grocery.notification.email;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import jakarta.mail.internet.MimeMessage;
import jakarta.mail.internet.InternetAddress;

/**
 * HTML email implementation for FreshAI.
 *
 * All OTP emails use a polished HTML template with:
 *   • FreshAI green branding (#10b981)
 *   • Large digit display for the OTP
 *   • Security footer + expiry notice
 *
 * OTP sends re-throw on failure. Non-critical sends (welcome, alert) are best-effort.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String smtpUsername;

    @Value("${app.mail.from-address:${spring.mail.username:noreply@freshai.com}}")
    private String fromAddress;

    @Value("${app.mail.from-name:FreshAI}")
    private String fromName;

    @Value("${app.mail.enabled:true}")
    private boolean mailEnabled;

    // ── Brand constants ────────────────────────────────────────────────────────
    private static final String BRAND_COLOR   = "#10b981";
    private static final String BRAND_DARK    = "#065f46";
    private static final String BRAND_NAME    = "🌿 FreshAI";
    private static final String BRAND_TAGLINE = "Fresh Grocery Delivery";
    private static final int    OTP_EXPIRY_MINUTES = 5;

    // ═══════════════════════════════════════════════════════════════════════════
    // PUBLIC API
    // ═══════════════════════════════════════════════════════════════════════════

    @Override
    public void sendOtpEmail(String toEmail, String otpCode, String purpose) {
        String purposeLabel = switch (purpose.toUpperCase()) {
            case "EMAIL_CHANGE"    -> "email address change";
            case "PHONE_CHANGE"    -> "phone number change";
            case "PASSWORD_CHANGE" -> "password change";
            case "EMAIL_VERIFY"    -> "email verification";
            default                -> "profile update";
        };
        sendHtml(toEmail,
                "FreshAI Verification Code",
                buildOtpTemplate(
                        "Verification Code",
                        "You requested a one-time code for your <strong>" + purposeLabel + "</strong>.",
                        otpCode));
    }

    @Override
    public void sendEmailVerificationOtp(String toEmail, String firstName, String otpCode) {
        sendHtml(toEmail,
                "FreshAI — Verify Your Email",
                buildOtpTemplate(
                        "Verify Your Email ✉️",
                        "Hi <strong>" + escHtml(firstName) + "</strong>! Thanks for joining FreshAI. " +
                        "Enter the 6-digit code below to activate your account.",
                        otpCode));
    }

    @Override
    public void sendPasswordChangeOtp(String toEmail, String firstName, String otpCode) {
        sendHtml(toEmail,
                "FreshAI — Password Change Request",
                buildOtpTemplate(
                        "Password Change 🔒",
                        "Hi <strong>" + escHtml(firstName) + "</strong>, we received a request to change " +
                        "your password. Enter the code below to continue.",
                        otpCode));
    }

    @Override
    public void sendPasswordResetOtp(String toEmail, String firstName, String otpCode) {
        sendHtml(toEmail,
                "FreshAI — Reset Your Password",
                buildOtpTemplate(
                        "Password Reset 🔑",
                        "Hi <strong>" + escHtml(firstName) + "</strong>, we received a request to reset " +
                        "your FreshAI account password. Enter the code below. " +
                        "If you did not request this, you can safely ignore this email.",
                        otpCode));
    }

    @Override
    public void sendProfileUpdateConfirmation(String toEmail, String fieldChanged) {
        sendHtmlNonCritical(toEmail,
                "FreshAI — Profile Updated",
                buildConfirmationTemplate(
                        "Profile Updated ✓",
                        "Your <strong>" + escHtml(fieldChanged) + "</strong> has been updated successfully. " +
                        "If you did not make this change, please contact support immediately."));
    }

    @Override
    public void sendWelcomeEmail(String toEmail, String firstName) {
        sendHtmlNonCritical(toEmail,
                "Welcome to FreshAI 🎉",
                buildWelcomeTemplate(firstName));
    }

    @Override
    public void sendPasswordChangedAlert(String toEmail, String firstName) {
        sendHtmlNonCritical(toEmail,
                "FreshAI — Password Changed Successfully",
                buildConfirmationTemplate(
                        "Password Changed ✓",
                        "Hi <strong>" + escHtml(firstName) + "</strong>, your password was just changed. " +
                        "If this was you, no action is needed. " +
                        "If you did not make this change, please contact support immediately."));
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // HTML TEMPLATES
    // ═══════════════════════════════════════════════════════════════════════════

    /**
     * Premium OTP email template with:
     *  • Gradient header
     *  • Spaced digit boxes for the OTP
     *  • Expiry + security notices
     */
    private String buildOtpTemplate(String heading, String bodyText, String code) {
        // Render each digit as a styled box
        StringBuilder digitBoxes = new StringBuilder();
        for (char ch : code.toCharArray()) {
            digitBoxes.append(
                "<span style=\"" +
                "display:inline-block;" +
                "width:48px;height:56px;" +
                "line-height:56px;" +
                "text-align:center;" +
                "font-size:28px;font-weight:800;" +
                "color:" + BRAND_DARK + ";" +
                "background:#f0fdf4;" +
                "border:2px solid " + BRAND_COLOR + ";" +
                "border-radius:10px;" +
                "margin:0 4px;" +
                "font-family:monospace;" +
                "\">" + ch + "</span>"
            );
        }

        return """
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8"/>
              <meta name="viewport" content="width=device-width,initial-scale=1"/>
              <title>FreshAI Verification Code</title>
            </head>
            <body style="margin:0;padding:0;background:#f3f4f6;font-family:Inter,Arial,sans-serif;">
              <table width="100%%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 0;">
                <tr><td align="center">
                  <table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%%;">

                    <!-- HEADER -->
                    <tr>
                      <td style="background:linear-gradient(135deg,%s 0%%,%s 100%%);border-radius:16px 16px 0 0;padding:32px;text-align:center;">
                        <div style="font-size:32px;font-weight:900;color:#fff;letter-spacing:-0.5px;">🌿 FreshAI</div>
                        <div style="color:rgba(255,255,255,0.8);font-size:13px;margin-top:4px;">Fresh Grocery Delivery</div>
                      </td>
                    </tr>

                    <!-- BODY -->
                    <tr>
                      <td style="background:#ffffff;padding:36px 40px;">
                        <h2 style="color:#111827;font-size:22px;font-weight:700;margin:0 0 12px;">%s</h2>
                        <p style="color:#6b7280;font-size:15px;line-height:1.65;margin:0 0 28px;">%s</p>

                        <!-- OTP DISPLAY -->
                        <div style="background:#f9fafb;border-radius:12px;padding:28px 20px;text-align:center;margin-bottom:24px;">
                          <p style="color:#6b7280;font-size:13px;margin:0 0 16px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Your verification code</p>
                          <div style="display:inline-block;">
                            %s
                          </div>
                          <p style="color:#9ca3af;font-size:12px;margin:16px 0 0;">
                            ⏱&nbsp; Valid for <strong>%d minutes</strong> &nbsp;·&nbsp; Do not share this code
                          </p>
                        </div>

                        <!-- SECURITY NOTE -->
                        <div style="background:#fef3c7;border-left:4px solid #f59e0b;border-radius:0 8px 8px 0;padding:12px 16px;margin-bottom:8px;">
                          <p style="color:#92400e;font-size:13px;margin:0;">
                            🔒 <strong>Security tip:</strong> FreshAI will never ask for this code via phone or chat.
                          </p>
                        </div>
                      </td>
                    </tr>

                    <!-- FOOTER -->
                    <tr>
                      <td style="background:#f9fafb;border-radius:0 0 16px 16px;padding:20px 40px;text-align:center;border-top:1px solid #e5e7eb;">
                        <p style="color:#9ca3af;font-size:12px;line-height:1.6;margin:0;">
                          This email was sent by FreshAI &copy; 2025. All rights reserved.<br/>
                          Questions? Contact <a href="mailto:support@freshai.com" style="color:%s;text-decoration:none;">support@freshai.com</a>
                        </p>
                      </td>
                    </tr>

                  </table>
                </td></tr>
              </table>
            </body>
            </html>
            """.formatted(
                BRAND_COLOR, BRAND_DARK,        // gradient
                heading,                         // h2
                bodyText,                        // paragraph
                digitBoxes.toString(),           // OTP boxes
                OTP_EXPIRY_MINUTES,              // validity
                BRAND_COLOR                      // footer link color
            );
    }

    private String buildConfirmationTemplate(String heading, String body) {
        return """
            <!DOCTYPE html>
            <html lang="en">
            <head><meta charset="UTF-8"/><title>FreshAI</title></head>
            <body style="margin:0;padding:0;background:#f3f4f6;font-family:Inter,Arial,sans-serif;">
              <table width="100%%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 0;">
                <tr><td align="center">
                  <table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%%;">
                    <tr>
                      <td style="background:linear-gradient(135deg,%s 0%%,%s 100%%);border-radius:16px 16px 0 0;padding:28px;text-align:center;">
                        <div style="font-size:28px;font-weight:900;color:#fff;">🌿 FreshAI</div>
                      </td>
                    </tr>
                    <tr>
                      <td style="background:#fff;padding:32px 40px;border-radius:0 0 16px 16px;">
                        <h2 style="color:#111827;font-size:20px;margin:0 0 12px;">%s</h2>
                        <p style="color:#6b7280;font-size:14px;line-height:1.65;margin:0;">%s</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="text-align:center;padding:16px;"><p style="color:#9ca3af;font-size:12px;margin:0;">&copy; 2025 FreshAI</p></td>
                    </tr>
                  </table>
                </td></tr>
              </table>
            </body>
            </html>
            """.formatted(BRAND_COLOR, BRAND_DARK, heading, body);
    }

    private String buildWelcomeTemplate(String firstName) {
        return """
            <!DOCTYPE html>
            <html lang="en">
            <head><meta charset="UTF-8"/><title>Welcome to FreshAI</title></head>
            <body style="margin:0;padding:0;background:#f3f4f6;font-family:Inter,Arial,sans-serif;">
              <table width="100%%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:40px 0;">
                <tr><td align="center">
                  <table width="520" cellpadding="0" cellspacing="0" style="max-width:520px;width:100%%;">
                    <tr>
                      <td style="background:linear-gradient(135deg,%s 0%%,%s 100%%);border-radius:16px 16px 0 0;padding:40px;text-align:center;">
                        <div style="font-size:36px;font-weight:900;color:#fff;margin-bottom:8px;">🌿 FreshAI</div>
                        <div style="color:rgba(255,255,255,0.85);font-size:14px;">Fresh Grocery Delivery</div>
                      </td>
                    </tr>
                    <tr>
                      <td style="background:#fff;padding:36px 40px;">
                        <h2 style="color:#111827;font-size:22px;margin:0 0 12px;">Welcome, <span style="color:%s;">%s</span>! 👋</h2>
                        <p style="color:#6b7280;font-size:15px;line-height:1.7;margin:0 0 24px;">
                          Thanks for joining <strong>FreshAI</strong> — your smart grocery delivery companion.
                          We bring fresh fruits, veggies, dairy, and more straight to your door.
                        </p>
                        <a href="http://localhost:5173"
                           style="display:inline-block;padding:14px 32px;background:%s;color:#fff;
                                  border-radius:10px;text-decoration:none;font-weight:700;font-size:15px;">
                          Start Shopping →
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td style="text-align:center;padding:16px;background:#f9fafb;border-radius:0 0 16px 16px;">
                        <p style="color:#9ca3af;font-size:12px;margin:0;">&copy; 2025 FreshAI. All rights reserved.</p>
                      </td>
                    </tr>
                  </table>
                </td></tr>
              </table>
            </body>
            </html>
            """.formatted(BRAND_COLOR, BRAND_DARK, BRAND_COLOR, escHtml(firstName), BRAND_COLOR);
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // SEND HELPERS
    // ═══════════════════════════════════════════════════════════════════════════

    /** Critical send (OTP) — re-throws on failure. */
    private void sendHtml(String to, String subject, String htmlBody) {
        if (!mailEnabled) {
            log.warn("[EMAIL DISABLED] Skipping send to {} subject='{}'", to, subject);
            return;
        }
        if (smtpUsername == null || smtpUsername.isBlank()) {
            log.error("[EMAIL CONFIG] MAIL_USERNAME not set.");
            throw new RuntimeException("Email service not configured (MAIL_USERNAME missing).");
        }

        log.info("[EMAIL] Sending to={} subject='{}'", to, subject);
        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper h = new MimeMessageHelper(msg, true, "UTF-8");
            h.setFrom(new InternetAddress(fromAddress, fromName));
            h.setTo(to);
            h.setSubject(subject);
            h.setText(htmlBody, true);   // true = HTML
            mailSender.send(msg);
            log.info("[EMAIL OK] Sent to={}", to);
        } catch (Exception e) {
            log.error("[EMAIL FAILED] to={} error={}", to, e.getMessage(), e);
            throw new RuntimeException("Could not send email to " + to + ": " + e.getMessage(), e);
        }
    }

    /** Non-critical send — logs failure, does not re-throw. */
    private void sendHtmlNonCritical(String to, String subject, String htmlBody) {
        try {
            sendHtml(to, subject, htmlBody);
        } catch (Exception e) {
            log.warn("[EMAIL WARN] Non-critical send failed: to={} reason={}", to, e.getMessage());
        }
    }

    /** Escape HTML special chars to prevent injection. */
    private String escHtml(String s) {
        if (s == null) return "";
        return s.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;");
    }
}
