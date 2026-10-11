package com.anuraguniversity.smartroute.auth.service;

import com.anuraguniversity.smartroute.common.enums.OTPType;
import com.anuraguniversity.smartroute.config.SmartRouteProperties;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private final SmartRouteProperties properties;

    @Async
    public void sendOTP(String toEmail, String otpCode, OTPType type) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(properties.getMail().getFrom());
            helper.setTo(toEmail);
            helper.setSubject(buildSubject(type));
            helper.setText(buildBody(otpCode, type), true);
            
            mailSender.send(message);
            log.info("OTP email sent to {} for type {}", toEmail, type);
        } catch (MessagingException e) {
            log.error("Failed to send OTP email to {}: {}", toEmail, e.getMessage());
        } catch (org.springframework.mail.MailException e) {
            // SMTP transport unavailable (e.g. no local mail catcher running). Registration must
            // still succeed; the actuator mail health check is disabled for this reason.
            log.error("OTP email delivery unavailable for {}: {}", toEmail, e.getMessage());
        }
    }

    @Async
    public void sendWelcomeEmail(String toEmail, String name) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(properties.getMail().getFrom());
            helper.setTo(toEmail);
            helper.setSubject("Welcome to SmartRoute - Anurag University Transport");
            helper.setText(buildWelcomeBody(name), true);
            
            mailSender.send(message);
            log.info("Welcome email sent to {}", toEmail);
        } catch (MessagingException e) {
            log.error("Failed to send welcome email to {}: {}", toEmail, e.getMessage());
        } catch (org.springframework.mail.MailException e) {
            log.error("Welcome email delivery unavailable for {}: {}", toEmail, e.getMessage());
        }
    }

    @Async
    public void sendPasswordResetConfirmation(String toEmail) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(properties.getMail().getFrom());
            helper.setTo(toEmail);
            helper.setSubject("Password Reset Successful - SmartRoute");
            helper.setText(buildPasswordResetBody(), true);
            
            mailSender.send(message);
            log.info("Password reset confirmation sent to {}", toEmail);
        } catch (MessagingException e) {
            log.error("Failed to send password reset confirmation to {}: {}", toEmail, e.getMessage());
        } catch (org.springframework.mail.MailException e) {
            log.error("Password reset confirmation delivery unavailable for {}: {}", toEmail, e.getMessage());
        }
    }

    private String buildSubject(OTPType type) {
        return switch (type) {
            case REGISTRATION -> "Verify Your Email - SmartRoute Anurag University";
            case FORGOT_PASSWORD -> "Password Reset OTP - SmartRoute Anurag University";
            case LOGIN -> "Login OTP - SmartRoute Anurag University";
            case EMAIL_VERIFICATION -> "Email Verification - SmartRoute Anurag University";
        };
    }

    private String buildBody(String otpCode, OTPType type) {
        String purpose = switch (type) {
            case REGISTRATION -> "complete your registration";
            case FORGOT_PASSWORD -> "reset your password";
            case LOGIN -> "log in to your account";
            case EMAIL_VERIFICATION -> "verify your email address";
        };

        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1C1917; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .card { background: #FAFAF9; border: 1px solid #E7E5E4; border-radius: 12px; padding: 32px; }
                    .logo { text-align: center; margin-bottom: 24px; }
                    .otp-code { background: #1C1917; color: #FAFAF9; font-size: 32px; font-weight: 700; letter-spacing: 8px; padding: 24px; border-radius: 8px; text-align: center; margin: 24px 0; font-family: 'Courier New', monospace; }
                    .footer { text-align: center; color: #78716C; font-size: 12px; margin-top: 24px; }
                    .warning { background: #FEF3C7; border: 1px solid #FCD34D; color: #92400E; padding: 16px; border-radius: 8px; margin: 16px 0; font-size: 14px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="card">
                        <div class="logo">
                            <h1 style="margin: 0; color: #1C1917; font-family: 'Poppins', sans-serif;">SmartRoute</h1>
                            <p style="margin: 8px 0 0; color: #78716C;">Anurag University Transport</p>
                        </div>
                        <h2 style="color: #1C1917; margin-top: 0;">Your Verification Code</h2>
                        <p>Use the code below to %s. This code will expire in %d minutes.</p>
                        <div class="otp-code">%s</div>
                        <div class="warning">
                            <strong>Security Notice:</strong> Never share this code with anyone. SmartRoute staff will never ask for your OTP.
                        </div>
                        <p style="color: #78716C; font-size: 14px;">If you didn't request this code, please ignore this email or contact support.</p>
                        <div class="footer">
                            <p>© 2026 Anurag University. All rights reserved.</p>
                            <p>This is an automated message, please do not reply.</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
            """, purpose, properties.getOtp().getExpirationMinutes(), otpCode);
    }

    private String buildWelcomeBody(String name) {
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1C1917; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .card { background: #FAFAF9; border: 1px solid #E7E5E4; border-radius: 12px; padding: 32px; }
                    .logo { text-align: center; margin-bottom: 24px; }
                    .btn { display: inline-block; background: #C06B4A; color: #FAFAF9; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 24px 0; }
                    .footer { text-align: center; color: #78716C; font-size: 12px; margin-top: 24px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="card">
                        <div class="logo">
                            <h1 style="margin: 0; color: #1C1917; font-family: 'Poppins', sans-serif;">SmartRoute</h1>
                            <p style="margin: 8px 0 0; color: #78716C;">Anurag University Transport</p>
                        </div>
                        <h2 style="color: #1C1917; margin-top: 0;">Welcome, %s!</h2>
                        <p>Your account has been created successfully. You can now access real-time bus tracking, route information, and transport management features.</p>
                        <a href="https://smartroute.anuraguniversity.edu.in" class="btn">Access SmartRoute</a>
                        <p style="color: #78716C;">If you have any questions, contact our support team at transport@anuraguniversity.edu.in</p>
                        <div class="footer">
                            <p>© 2026 Anurag University. All rights reserved.</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
            """, name);
    }

    private String buildPasswordResetBody() {
        return """
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1C1917; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .card { background: #FAFAF9; border: 1px solid #E7E5E4; border-radius: 12px; padding: 32px; }
                    .logo { text-align: center; margin-bottom: 24px; }
                    .success { background: #DCFCE7; border: 1px solid #86EFAC; color: #166534; padding: 16px; border-radius: 8px; margin: 16px 0; }
                    .footer { text-align: center; color: #78716C; font-size: 12px; margin-top: 24px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="card">
                        <div class="logo">
                            <h1 style="margin: 0; color: #1C1917; font-family: 'Poppins', sans-serif;">SmartRoute</h1>
                            <p style="margin: 8px 0 0; color: #78716C;">Anurag University Transport</p>
                        </div>
                        <h2 style="color: #1C1917; margin-top: 0;">Password Reset Successful</h2>
                        <div class="success">Your password has been successfully reset.</div>
                        <p>If you didn't request this change, please contact support immediately at transport@anuraguniversity.edu.in</p>
                        <div class="footer">
                            <p>© 2026 Anurag University. All rights reserved.</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
            """;
    }
}