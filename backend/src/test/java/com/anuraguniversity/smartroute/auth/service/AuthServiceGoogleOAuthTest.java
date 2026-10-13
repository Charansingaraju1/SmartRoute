package com.anuraguniversity.smartroute.auth.service;

import com.anuraguniversity.smartroute.audit.service.AuditService;
import com.anuraguniversity.smartroute.auth.dto.AuthResponse;
import com.anuraguniversity.smartroute.auth.dto.GoogleLoginRequest;
import com.anuraguniversity.smartroute.auth.dto.GoogleTokenPayload;
import com.anuraguniversity.smartroute.auth.entity.User;
import com.anuraguniversity.smartroute.auth.exception.AccountLockedException;
import com.anuraguniversity.smartroute.auth.exception.InvalidCredentialsException;
import com.anuraguniversity.smartroute.auth.repository.OTPRepository;
import com.anuraguniversity.smartroute.auth.repository.UserRepository;
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
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceGoogleOAuthTest {

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

    @Mock
    private GoogleTokenVerifier googleTokenVerifier;

    @InjectMocks
    private AuthService authService;

    private User studentUser;
    private User teacherUser;

    @BeforeEach
    void setUp() {
        studentUser = User.create(
                "Student Name",
                "student@anuraguniversity.edu.in",
                "encodedPassword",
                UserRole.STUDENT
        );
        studentUser.setId(UUID.randomUUID());
        studentUser.setEmailVerified(false);

        teacherUser = User.create(
                "Teacher Name",
                "teacher@anuraguniversity.edu.in",
                "encodedPassword",
                UserRole.TEACHER
        );
        teacherUser.setId(UUID.randomUUID());
        teacherUser.setEmailVerified(true);
    }

    @Test
    @DisplayName("loginWithGoogle fails when idToken is null or blank")
    void loginWithGoogle_missingToken_throwsInvalidCredentials() {
        assertThatThrownBy(() -> authService.loginWithGoogle(new GoogleLoginRequest(null)))
                .isInstanceOf(InvalidCredentialsException.class)
                .hasMessageContaining("Google ID token is required");

        assertThatThrownBy(() -> authService.loginWithGoogle(new GoogleLoginRequest("   ")))
                .isInstanceOf(InvalidCredentialsException.class)
                .hasMessageContaining("Google ID token is required");

        verifyNoInteractions(googleTokenVerifier, userRepository);
    }

    @Test
    @DisplayName("loginWithGoogle propagates token verifier failure")
    void loginWithGoogle_verifierFails_throwsException() {
        when(googleTokenVerifier.verify("invalid.token"))
                .thenThrow(new InvalidCredentialsException("Invalid or expired Google token"));

        assertThatThrownBy(() -> authService.loginWithGoogle(new GoogleLoginRequest("invalid.token")))
                .isInstanceOf(InvalidCredentialsException.class)
                .hasMessageContaining("Invalid or expired Google token");

        verifyNoInteractions(userRepository, jwtTokenProvider);
    }

    @Test
    @DisplayName("loginWithGoogle rejects unregistered email without creating unauthorized user")
    void loginWithGoogle_unregisteredUser_throwsInvalidCredentials() {
        when(googleTokenVerifier.verify("valid.token")).thenReturn(GoogleTokenPayload.builder()
                .email("unregistered@anuraguniversity.edu.in")
                .name("Unregistered User")
                .sub("google-sub-123")
                .emailVerified(true)
                .build());

        when(userRepository.findByEmail("unregistered@anuraguniversity.edu.in")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> authService.loginWithGoogle(new GoogleLoginRequest("valid.token")))
                .isInstanceOf(InvalidCredentialsException.class)
                .hasMessageContaining("No SmartRoute account found for unregistered@anuraguniversity.edu.in")
                .hasMessageContaining("Please register as a Student or Teacher first");

        verify(userRepository, never()).save(any());
        verifyNoInteractions(jwtTokenProvider);
    }

    @Test
    @DisplayName("loginWithGoogle authenticates existing student and preserves database role STUDENT")
    void loginWithGoogle_existingStudent_successWithStudentRole() {
        when(googleTokenVerifier.verify("valid.student.token")).thenReturn(GoogleTokenPayload.builder()
                .email("student@anuraguniversity.edu.in")
                .name("Student Name")
                .sub("google-sub-student")
                .emailVerified(true)
                .build());

        when(userRepository.findByEmail("student@anuraguniversity.edu.in")).thenReturn(Optional.of(studentUser));
        when(jwtTokenProvider.generateToken(studentUser.getId(), "STUDENT")).thenReturn("mock-access-jwt");
        when(jwtTokenProvider.generateRefreshToken(studentUser.getId())).thenReturn("mock-refresh-jwt");
        when(jwtTokenProvider.getExpiration()).thenReturn(86400000L);

        AuthResponse response = authService.loginWithGoogle(new GoogleLoginRequest("valid.student.token"));

        assertThat(response).isNotNull();
        assertThat(response.getAccessToken()).isEqualTo("mock-access-jwt");
        assertThat(response.getUser()).isNotNull();
        assertThat(response.getUser().getEmail()).isEqualTo("student@anuraguniversity.edu.in");
        assertThat(response.getUser().getRole()).isEqualTo(UserRole.STUDENT);

        // Verify email marked as verified by Google sign-in
        assertThat(studentUser.getEmailVerified()).isTrue();
        verify(userRepository).save(studentUser);
        verify(jwtTokenProvider).generateToken(studentUser.getId(), "STUDENT");
    }

    @Test
    @DisplayName("loginWithGoogle authenticates existing teacher and preserves database role TEACHER")
    void loginWithGoogle_existingTeacher_successWithTeacherRole() {
        when(googleTokenVerifier.verify("valid.teacher.token")).thenReturn(GoogleTokenPayload.builder()
                .email("teacher@anuraguniversity.edu.in")
                .name("Teacher Name")
                .sub("google-sub-teacher")
                .emailVerified(true)
                .build());

        when(userRepository.findByEmail("teacher@anuraguniversity.edu.in")).thenReturn(Optional.of(teacherUser));
        when(jwtTokenProvider.generateToken(teacherUser.getId(), "TEACHER")).thenReturn("mock-teacher-access-jwt");
        when(jwtTokenProvider.generateRefreshToken(teacherUser.getId())).thenReturn("mock-teacher-refresh-jwt");
        when(jwtTokenProvider.getExpiration()).thenReturn(86400000L);

        AuthResponse response = authService.loginWithGoogle(new GoogleLoginRequest("valid.teacher.token"));

        assertThat(response).isNotNull();
        assertThat(response.getAccessToken()).isEqualTo("mock-teacher-access-jwt");
        assertThat(response.getUser().getRole()).isEqualTo(UserRole.TEACHER);

        verify(jwtTokenProvider).generateToken(teacherUser.getId(), "TEACHER");
    }

    @Test
    @DisplayName("loginWithGoogle rejects deactivated user account")
    void loginWithGoogle_deactivatedUser_throwsInvalidCredentials() {
        studentUser.setActive(false);

        when(googleTokenVerifier.verify("valid.token")).thenReturn(GoogleTokenPayload.builder()
                .email("student@anuraguniversity.edu.in")
                .name("Student Name")
                .sub("sub-123")
                .emailVerified(true)
                .build());

        when(userRepository.findByEmail("student@anuraguniversity.edu.in")).thenReturn(Optional.of(studentUser));

        assertThatThrownBy(() -> authService.loginWithGoogle(new GoogleLoginRequest("valid.token")))
                .isInstanceOf(InvalidCredentialsException.class)
                .hasMessageContaining("Account is deactivated");

        verifyNoInteractions(jwtTokenProvider);
    }

    @Test
    @DisplayName("loginWithGoogle rejects temporarily locked account")
    void loginWithGoogle_lockedAccount_throwsAccountLockedException() {
        studentUser.setLockedUntil(Instant.now().plusSeconds(900));

        when(googleTokenVerifier.verify("valid.token")).thenReturn(GoogleTokenPayload.builder()
                .email("student@anuraguniversity.edu.in")
                .name("Student Name")
                .sub("sub-123")
                .emailVerified(true)
                .build());

        when(userRepository.findByEmail("student@anuraguniversity.edu.in")).thenReturn(Optional.of(studentUser));

        assertThatThrownBy(() -> authService.loginWithGoogle(new GoogleLoginRequest("valid.token")))
                .isInstanceOf(AccountLockedException.class)
                .hasMessageContaining("Account temporarily locked");

        verifyNoInteractions(jwtTokenProvider);
    }
}
