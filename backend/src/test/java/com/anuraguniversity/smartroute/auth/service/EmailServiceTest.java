package com.anuraguniversity.smartroute.auth.service;

import com.anuraguniversity.smartroute.auth.exception.EmailDeliveryException;
import com.anuraguniversity.smartroute.common.enums.OTPType;
import com.anuraguniversity.smartroute.config.SmartRouteProperties;
import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.MailAuthenticationException;
import org.springframework.mail.MailSendException;
import org.springframework.mail.javamail.JavaMailSender;

import java.util.Properties;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @Mock
    private SmartRouteProperties properties;

    @InjectMocks
    private EmailService emailService;

    private SmartRouteProperties.Mail mailProps;
    private SmartRouteProperties.Otp otpProps;

    @BeforeEach
    void setUp() {
        mailProps = new SmartRouteProperties.Mail();
        mailProps.setHost("smtp.gmail.com");
        mailProps.setPort(587);
        mailProps.setUsername("verified@anuraguniversity.edu.in");
        mailProps.setPassword("valid-app-password");
        mailProps.setFrom("test@anuraguniversity.edu.in");

        otpProps = new SmartRouteProperties.Otp();
        otpProps.setExpirationMinutes(10);

        lenient().when(properties.getMail()).thenReturn(mailProps);
        lenient().when(properties.getOtp()).thenReturn(otpProps);
    }

    private MimeMessage createMockMimeMessage() {
        return new MimeMessage(Session.getInstance(new Properties()));
    }

    @Test
    @DisplayName("sendOTP: successfully sends email when mail server is available")
    void testSendOTPSuccess() {
        when(mailSender.createMimeMessage()).thenReturn(createMockMimeMessage());
        doNothing().when(mailSender).send(any(MimeMessage.class));

        assertDoesNotThrow(() -> emailService.sendOTP("student@anuraguniversity.edu.in", "123456", OTPType.REGISTRATION));

        verify(mailSender, times(1)).send(any(MimeMessage.class));
    }

    @Test
    @DisplayName("sendOTP: throws EmailDeliveryException when SMTP authentication fails")
    void testSendOTPFailureAuthentication() {
        when(mailSender.createMimeMessage()).thenReturn(createMockMimeMessage());
        doThrow(new MailAuthenticationException("Authentication failed"))
                .when(mailSender).send(any(MimeMessage.class));

        EmailDeliveryException ex = assertThrows(EmailDeliveryException.class, () ->
                emailService.sendOTP("student@anuraguniversity.edu.in", "123456", OTPType.REGISTRATION));

        assertTrue(ex.getMessage().contains("SMTP authentication failed"));
        assertTrue(ex.getMessage().contains("Google App Password"));
        verify(mailSender, times(1)).send(any(MimeMessage.class));
    }

    @Test
    @DisplayName("sendOTP: throws EmailDeliveryException when mail server connection fails")
    void testSendOTPFailureConnection() {
        when(mailSender.createMimeMessage()).thenReturn(createMockMimeMessage());
        doThrow(new MailSendException("Could not connect to SMTP host: smtp.gmail.com, port: 587"))
                .when(mailSender).send(any(MimeMessage.class));

        EmailDeliveryException ex = assertThrows(EmailDeliveryException.class, () ->
                emailService.sendOTP("student@anuraguniversity.edu.in", "123456", OTPType.REGISTRATION));

        assertTrue(ex.getMessage().contains("Unable to connect to mail server"));
        verify(mailSender, times(1)).send(any(MimeMessage.class));
    }

    @Test
    @DisplayName("sendWelcomeEmail: completes without throwing even if delivery fails")
    void testSendWelcomeEmailHandlesException() {
        when(mailSender.createMimeMessage()).thenReturn(createMockMimeMessage());
        doThrow(new MailSendException("Connection failed"))
                .when(mailSender).send(any(MimeMessage.class));

        assertDoesNotThrow(() -> emailService.sendWelcomeEmail("student@anuraguniversity.edu.in", "John Doe"));
        verify(mailSender, times(1)).send(any(MimeMessage.class));
    }

    @Test
    @DisplayName("sendPasswordResetConfirmation: completes without throwing even if delivery fails")
    void testSendPasswordResetConfirmationHandlesException() {
        when(mailSender.createMimeMessage()).thenReturn(createMockMimeMessage());
        doThrow(new MailSendException("Connection failed"))
                .when(mailSender).send(any(MimeMessage.class));

        assertDoesNotThrow(() -> emailService.sendPasswordResetConfirmation("student@anuraguniversity.edu.in"));
        verify(mailSender, times(1)).send(any(MimeMessage.class));
    }

    @Test
    @DisplayName("sendOTP: throws EmailDeliveryException when credentials are unconfigured or placeholder")
    void testSendOTPThrowsWhenUnconfigured() {
        mailProps.setUsername("your-email@gmail.com");
        mailProps.setPassword("your-app-password");

        EmailDeliveryException ex = assertThrows(EmailDeliveryException.class, () ->
                emailService.sendOTP("student@anuraguniversity.edu.in", "123456", OTPType.FORGOT_PASSWORD));

        assertTrue(ex.getMessage().contains("Email delivery is not configured"));
        verify(mailSender, never()).send(any(MimeMessage.class));
    }

    @Test
    @DisplayName("isMailConfigured: correctly detects configured vs placeholder credentials")
    void testIsMailConfigured() {
        mailProps.setHost("smtp.gmail.com");
        mailProps.setUsername("verified@anuraguniversity.edu.in");
        mailProps.setPassword("valid-app-password");
        assertTrue(emailService.isMailConfigured());

        mailProps.setUsername("your-email@gmail.com");
        assertFalse(emailService.isMailConfigured());

        mailProps.setUsername("student@anuraguniversity.edu.in");
        mailProps.setPassword("your-app-password");
        assertFalse(emailService.isMailConfigured());

        mailProps.setPassword("");
        assertFalse(emailService.isMailConfigured());

        mailProps.setHost("localhost");
        mailProps.setUsername("");
        mailProps.setPassword("");
        assertTrue(emailService.isMailConfigured());
    }
}
