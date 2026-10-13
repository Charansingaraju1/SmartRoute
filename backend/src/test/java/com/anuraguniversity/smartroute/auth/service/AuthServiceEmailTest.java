package com.anuraguniversity.smartroute.auth.service;

import com.anuraguniversity.smartroute.audit.service.AuditService;
import com.anuraguniversity.smartroute.auth.dto.AuthResponse;
import com.anuraguniversity.smartroute.auth.dto.ForgotPasswordRequest;
import com.anuraguniversity.smartroute.auth.dto.RegisterRequest;
import com.anuraguniversity.smartroute.auth.dto.ResendOTPRequest;
import com.anuraguniversity.smartroute.auth.entity.OTP;
import com.anuraguniversity.smartroute.auth.entity.User;
import com.anuraguniversity.smartroute.auth.exception.EmailDeliveryException;
import com.anuraguniversity.smartroute.auth.repository.OTPRepository;
import com.anuraguniversity.smartroute.auth.repository.UserRepository;
import com.anuraguniversity.smartroute.common.enums.OTPType;
import com.anuraguniversity.smartroute.common.enums.UserRole;
import com.anuraguniversity.smartroute.config.SmartRouteProperties;
import com.anuraguniversity.smartroute.security.JwtTokenProvider;
import com.anuraguniversity.smartroute.student.repository.StudentRepository;
import com.anuraguniversity.smartroute.teacher.repository.TeacherRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceEmailTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private OTPRepository otpRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    @Mock
    private EmailService emailService;

    @Mock
    private SmartRouteProperties properties;

    @Mock
    private AuditService auditService;

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private TeacherRepository teacherRepository;

    @InjectMocks
    private AuthService authService;

    private SmartRouteProperties.Otp otpProps;

    @BeforeEach
    void setUp() {
        otpProps = new SmartRouteProperties.Otp();
        otpProps.setLength(6);
        otpProps.setExpirationMinutes(10);
        otpProps.setMaxAttempts(3);
        otpProps.setResendCooldownSeconds(60);
        otpProps.setRateLimitPerHour(5);

        lenient().when(properties.getOtp()).thenReturn(otpProps);
        lenient().when(emailService.isMailConfigured()).thenReturn(true);
    }

    @Test
    @DisplayName("registerStudent: calls emailService.sendOTP and returns registration response")
    void testRegisterStudentCallsEmailService() {
        RegisterRequest request = new RegisterRequest();
        request.setName("Test Student");
        request.setEmail("student@anuraguniversity.edu.in");
        request.setPassword("Password123!");
        request.setConfirmPassword("Password123!");

        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hashedPassword");

        User savedUser = User.create(request.getName(), request.getEmail(), "hashedPassword", UserRole.STUDENT);
        savedUser.setId(java.util.UUID.randomUUID());
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(otpRepository.countByEmailAndTypeAndCreatedAtAfter(anyString(), any(), any())).thenReturn(0L);

        doNothing().when(emailService).sendOTP(eq("student@anuraguniversity.edu.in"), anyString(), eq(OTPType.REGISTRATION));

        AuthResponse response = authService.registerStudent(request);

        assertNotNull(response);
        assertTrue(Boolean.TRUE.equals(response.getRequiresOTPVerification()));
        assertEquals("student@anuraguniversity.edu.in", response.getEmail());

        verify(emailService, times(1)).sendOTP(eq("student@anuraguniversity.edu.in"), anyString(), eq(OTPType.REGISTRATION));
        verify(otpRepository, times(1)).save(any(OTP.class));
    }

    @Test
    @DisplayName("registerStudent: does NOT swallow EmailDeliveryException when email fails")
    void testRegisterStudentPropagatesEmailException() {
        RegisterRequest request = new RegisterRequest();
        request.setName("Test Student");
        request.setEmail("student@anuraguniversity.edu.in");
        request.setPassword("Password123!");
        request.setConfirmPassword("Password123!");

        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hashedPassword");

        User savedUser = User.create(request.getName(), request.getEmail(), "hashedPassword", UserRole.STUDENT);
        savedUser.setId(java.util.UUID.randomUUID());
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(otpRepository.countByEmailAndTypeAndCreatedAtAfter(anyString(), any(), any())).thenReturn(0L);

        doThrow(new EmailDeliveryException("SMTP authentication failed"))
                .when(emailService).sendOTP(eq("student@anuraguniversity.edu.in"), anyString(), eq(OTPType.REGISTRATION));

        EmailDeliveryException ex = assertThrows(EmailDeliveryException.class, () -> authService.registerStudent(request));
        assertTrue(ex.getMessage().contains("SMTP authentication failed"));

        verify(emailService, times(1)).sendOTP(eq("student@anuraguniversity.edu.in"), anyString(), eq(OTPType.REGISTRATION));
    }

    @Test
    @DisplayName("registerStudent: when requireEmailVerification is false, bypasses OTP and does NOT mark emailVerified")
    void testRegisterStudentEmailVerificationDisabled() {
        otpProps.setRequireEmailVerification(false);

        RegisterRequest request = new RegisterRequest();
        request.setName("Dev Student");
        request.setEmail("dev.student@anuraguniversity.edu.in");
        request.setPassword("Password123!");
        request.setConfirmPassword("Password123!");

        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hashedPassword");

        User savedUser = User.create(request.getName(), request.getEmail(), "hashedPassword", UserRole.STUDENT);
        savedUser.setId(java.util.UUID.randomUUID());
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        when(jwtTokenProvider.generateToken(any(), eq("STUDENT"))).thenReturn("mock-access-token");
        when(jwtTokenProvider.generateRefreshToken(any())).thenReturn("mock-refresh-token");
        when(jwtTokenProvider.getExpiration()).thenReturn(86400000L);

        AuthResponse response = authService.registerStudent(request);

        assertNotNull(response);
        assertEquals(Boolean.FALSE, response.getRequiresOTPVerification());
        assertEquals("mock-access-token", response.getAccessToken());
        assertEquals("mock-refresh-token", response.getRefreshToken());
        assertNotNull(response.getUser());
        assertEquals("dev.student@anuraguniversity.edu.in", response.getUser().getEmail());
        assertEquals(Boolean.FALSE, response.getUser().getEmailVerified(), "Email must NOT be marked as verified when OTP is bypassed");

        verify(emailService, never()).sendOTP(anyString(), anyString(), any());
        verify(otpRepository, never()).save(any(OTP.class));
        verify(studentRepository, times(1)).save(any());
    }

    @Test
    @DisplayName("registerTeacher: when requireEmailVerification is false, bypasses OTP and does NOT mark emailVerified")
    void testRegisterTeacherEmailVerificationDisabled() {
        otpProps.setRequireEmailVerification(false);

        RegisterRequest request = new RegisterRequest();
        request.setName("Dev Teacher");
        request.setEmail("dev.teacher@anuraguniversity.edu.in");
        request.setPassword("Password123!");
        request.setConfirmPassword("Password123!");

        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hashedPassword");

        User savedUser = User.create(request.getName(), request.getEmail(), "hashedPassword", UserRole.TEACHER);
        savedUser.setId(java.util.UUID.randomUUID());
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        when(jwtTokenProvider.generateToken(any(), eq("TEACHER"))).thenReturn("mock-access-token");
        when(jwtTokenProvider.generateRefreshToken(any())).thenReturn("mock-refresh-token");
        when(jwtTokenProvider.getExpiration()).thenReturn(86400000L);

        AuthResponse response = authService.registerTeacher(request);

        assertNotNull(response);
        assertEquals(Boolean.FALSE, response.getRequiresOTPVerification());
        assertEquals("mock-access-token", response.getAccessToken());
        assertEquals("mock-refresh-token", response.getRefreshToken());
        assertNotNull(response.getUser());
        assertEquals("dev.teacher@anuraguniversity.edu.in", response.getUser().getEmail());
        assertEquals(Boolean.FALSE, response.getUser().getEmailVerified(), "Email must NOT be marked as verified when OTP is bypassed");

        verify(emailService, never()).sendOTP(anyString(), anyString(), any());
        verify(otpRepository, never()).save(any(OTP.class));
        verify(teacherRepository, times(1)).save(any());
    }

    @Test
    @DisplayName("resendOTP: sends OTP when cooldown is expired")
    void testResendOTPSuccess() {
        ResendOTPRequest request = new ResendOTPRequest();
        request.setEmail("student@anuraguniversity.edu.in");
        request.setType(OTPType.REGISTRATION);

        OTP existing = OTP.create(
                request.getEmail(),
                OTPType.REGISTRATION,
                "hash",
                Instant.now().plusSeconds(600),
                3,
                Instant.now().minusSeconds(10) // cooldown already in the past
        );

        when(otpRepository.findFirstByEmailAndTypeOrderByCreatedAtDesc(eq(request.getEmail()), eq(OTPType.REGISTRATION)))
                .thenReturn(Optional.of(existing));
        when(otpRepository.countByEmailAndTypeAndCreatedAtAfter(anyString(), any(), any())).thenReturn(0L);
        when(passwordEncoder.encode(anyString())).thenReturn("hashedOtp");

        doNothing().when(emailService).sendOTP(eq(request.getEmail()), anyString(), eq(OTPType.REGISTRATION));

        assertDoesNotThrow(() -> authService.resendOTP(request));

        verify(emailService, times(1)).sendOTP(eq(request.getEmail()), anyString(), eq(OTPType.REGISTRATION));
    }

    @Test
    @DisplayName("resendOTP: rejects request when cooldown is still active")
    void testResendOTPCooldownActive() {
        ResendOTPRequest request = new ResendOTPRequest();
        request.setEmail("student@anuraguniversity.edu.in");
        request.setType(OTPType.REGISTRATION);

        OTP existing = OTP.create(
                request.getEmail(),
                OTPType.REGISTRATION,
                "hash",
                Instant.now().plusSeconds(600),
                3,
                Instant.now().plusSeconds(45) // cooldown still in future
        );

        when(otpRepository.findFirstByEmailAndTypeOrderByCreatedAtDesc(eq(request.getEmail()), eq(OTPType.REGISTRATION)))
                .thenReturn(Optional.of(existing));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> authService.resendOTP(request));
        assertTrue(ex.getMessage().contains("Please wait before requesting another OTP"));

        verify(emailService, never()).sendOTP(anyString(), anyString(), any());
    }

    @Test
    @DisplayName("resendOTP: throws EmailDeliveryException when email delivery is not configured")
    void testResendOTPUnconfigured() {
        ResendOTPRequest request = new ResendOTPRequest();
        request.setEmail("student@anuraguniversity.edu.in");
        request.setType(OTPType.REGISTRATION);

        when(emailService.isMailConfigured()).thenReturn(false);

        EmailDeliveryException ex = assertThrows(EmailDeliveryException.class, () -> authService.resendOTP(request));
        assertTrue(ex.getMessage().contains("Email delivery is not configured"));
    }

    @Test
    @DisplayName("forgotPassword: sends OTP when active user exists and mail is configured")
    void testForgotPasswordCallsEmailService() {
        ForgotPasswordRequest request = new ForgotPasswordRequest();
        request.setEmail("student@anuraguniversity.edu.in");

        User activeUser = User.create("Student", "student@anuraguniversity.edu.in", "hash", UserRole.STUDENT);
        activeUser.setId(java.util.UUID.randomUUID());
        when(userRepository.findByEmail(eq("student@anuraguniversity.edu.in"))).thenReturn(Optional.of(activeUser));
        when(otpRepository.countByEmailAndTypeAndCreatedAtAfter(anyString(), any(), any())).thenReturn(0L);
        when(passwordEncoder.encode(anyString())).thenReturn("hashedOtp");

        doNothing().when(emailService).sendOTP(eq("student@anuraguniversity.edu.in"), anyString(), eq(OTPType.FORGOT_PASSWORD));

        assertDoesNotThrow(() -> authService.forgotPassword(request));

        verify(emailService, times(1)).sendOTP(eq("student@anuraguniversity.edu.in"), anyString(), eq(OTPType.FORGOT_PASSWORD));
    }

    @Test
    @DisplayName("forgotPassword: throws EmailDeliveryException when email delivery is not configured for registered user")
    void testForgotPasswordUnconfiguredRegisteredUser() {
        ForgotPasswordRequest request = new ForgotPasswordRequest();
        request.setEmail("student@anuraguniversity.edu.in");

        when(emailService.isMailConfigured()).thenReturn(false);

        EmailDeliveryException ex = assertThrows(EmailDeliveryException.class, () -> authService.forgotPassword(request));
        assertTrue(ex.getMessage().contains("Email delivery is not configured"));
        verify(userRepository, never()).findByEmail(anyString());
    }

    @Test
    @DisplayName("forgotPassword: throws EmailDeliveryException when email delivery is not configured for unregistered user - preserving enumeration protection")
    void testForgotPasswordUnconfiguredUnregisteredUser() {
        ForgotPasswordRequest request = new ForgotPasswordRequest();
        request.setEmail("unknown@anuraguniversity.edu.in");

        when(emailService.isMailConfigured()).thenReturn(false);

        EmailDeliveryException ex = assertThrows(EmailDeliveryException.class, () -> authService.forgotPassword(request));
        assertTrue(ex.getMessage().contains("Email delivery is not configured"));
        verify(userRepository, never()).findByEmail(anyString());
    }

    @Test
    @DisplayName("forgotPassword: does not reveal user absence when email delivery is configured")
    void testForgotPasswordUnregisteredUserConfigured() {
        ForgotPasswordRequest request = new ForgotPasswordRequest();
        request.setEmail("unknown@anuraguniversity.edu.in");

        when(userRepository.findByEmail(eq("unknown@anuraguniversity.edu.in"))).thenReturn(Optional.empty());

        assertDoesNotThrow(() -> authService.forgotPassword(request));
        verify(emailService, never()).sendOTP(anyString(), anyString(), any());
    }
}
