package com.anuraguniversity.smartroute.auth.service;

import com.anuraguniversity.smartroute.audit.service.AuditService;
import com.anuraguniversity.smartroute.auth.dto.AuthResponse;
import com.anuraguniversity.smartroute.auth.dto.LoginRequest;
import com.anuraguniversity.smartroute.auth.entity.User;
import com.anuraguniversity.smartroute.auth.exception.InvalidCredentialsException;
import com.anuraguniversity.smartroute.auth.exception.RoleMismatchException;
import com.anuraguniversity.smartroute.auth.repository.OTPRepository;
import com.anuraguniversity.smartroute.auth.repository.UserRepository;
import com.anuraguniversity.smartroute.common.enums.UserRole;
import com.anuraguniversity.smartroute.config.SmartRouteProperties;
import com.anuraguniversity.smartroute.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceLoginRoleTest {

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

    @InjectMocks
    private AuthService authService;

    private User studentUser;
    private User teacherUser;

    @BeforeEach
    void setUp() {
        studentUser = new User();
        studentUser.setId(UUID.randomUUID());
        studentUser.setName("Student Name");
        studentUser.setEmail("student@anurag.edu");
        studentUser.setPasswordHash("hashed_password");
        studentUser.setRole(UserRole.STUDENT);
        studentUser.setActive(true);
        studentUser.setEmailVerified(true);
        studentUser.setFailedLoginAttempts(0);

        teacherUser = new User();
        teacherUser.setId(UUID.randomUUID());
        teacherUser.setName("Teacher Name");
        teacherUser.setEmail("teacher@anurag.edu");
        teacherUser.setPasswordHash("hashed_password");
        teacherUser.setRole(UserRole.TEACHER);
        teacherUser.setActive(true);
        teacherUser.setEmailVerified(true);
        teacherUser.setFailedLoginAttempts(0);
    }

    @Test
    @DisplayName("Student user submitting Student Login succeeds and receives tokens")
    void studentUser_withStudentRole_succeeds() {
        when(userRepository.findActiveByEmail("student@anurag.edu")).thenReturn(Optional.of(studentUser));
        when(passwordEncoder.matches("Password123!", "hashed_password")).thenReturn(true);
        when(jwtTokenProvider.generateToken(studentUser.getId(), "STUDENT")).thenReturn("jwt-student");
        when(jwtTokenProvider.generateRefreshToken(studentUser.getId())).thenReturn("refresh-student");
        when(jwtTokenProvider.getExpiration()).thenReturn(3600000L);

        LoginRequest request = LoginRequest.builder()
                .email("student@anurag.edu")
                .password("Password123!")
                .role(UserRole.STUDENT)
                .build();

        AuthResponse response = authService.login(request);

        assertThat(response.getAccessToken()).isEqualTo("jwt-student");
        assertThat(response.getUser().getRole()).isEqualTo(UserRole.STUDENT);
        verify(jwtTokenProvider).generateToken(studentUser.getId(), "STUDENT");
    }

    @Test
    @DisplayName("Teacher user submitting Teacher Login succeeds and receives tokens")
    void teacherUser_withTeacherRole_succeeds() {
        when(userRepository.findActiveByEmail("teacher@anurag.edu")).thenReturn(Optional.of(teacherUser));
        when(passwordEncoder.matches("Password123!", "hashed_password")).thenReturn(true);
        when(jwtTokenProvider.generateToken(teacherUser.getId(), "TEACHER")).thenReturn("jwt-teacher");
        when(jwtTokenProvider.generateRefreshToken(teacherUser.getId())).thenReturn("refresh-teacher");
        when(jwtTokenProvider.getExpiration()).thenReturn(3600000L);

        LoginRequest request = LoginRequest.builder()
                .email("teacher@anurag.edu")
                .password("Password123!")
                .role(UserRole.TEACHER)
                .build();

        AuthResponse response = authService.login(request);

        assertThat(response.getAccessToken()).isEqualTo("jwt-teacher");
        assertThat(response.getUser().getRole()).isEqualTo(UserRole.TEACHER);
        verify(jwtTokenProvider).generateToken(teacherUser.getId(), "TEACHER");
    }

    @Test
    @DisplayName("Teacher credentials submitted through Student Login are rejected with RoleMismatchException")
    void teacherCredentials_submittedThroughStudentLogin_throwsRoleMismatch() {
        when(userRepository.findActiveByEmail("teacher@anurag.edu")).thenReturn(Optional.of(teacherUser));
        when(passwordEncoder.matches("Password123!", "hashed_password")).thenReturn(true);

        LoginRequest request = LoginRequest.builder()
                .email("teacher@anurag.edu")
                .password("Password123!")
                .role(UserRole.STUDENT)
                .build();

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(RoleMismatchException.class)
                .hasMessage("This account is registered as a Teacher. Please use Teacher Login.");

        verify(jwtTokenProvider, never()).generateToken(any(), anyString());
    }

    @Test
    @DisplayName("Student credentials submitted through Teacher Login are rejected with RoleMismatchException")
    void studentCredentials_submittedThroughTeacherLogin_throwsRoleMismatch() {
        when(userRepository.findActiveByEmail("student@anurag.edu")).thenReturn(Optional.of(studentUser));
        when(passwordEncoder.matches("Password123!", "hashed_password")).thenReturn(true);

        LoginRequest request = LoginRequest.builder()
                .email("student@anurag.edu")
                .password("Password123!")
                .role(UserRole.TEACHER)
                .build();

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(RoleMismatchException.class)
                .hasMessage("This account is registered as a Student. Please use Student Login.");

        verify(jwtTokenProvider, never()).generateToken(any(), anyString());
    }

    @Test
    @DisplayName("Invalid password throws InvalidCredentialsException without leaking role information")
    void wrongPassword_throwsInvalidCredentials() {
        when(userRepository.findActiveByEmail("teacher@anurag.edu")).thenReturn(Optional.of(teacherUser));
        when(passwordEncoder.matches("WrongPassword", "hashed_password")).thenReturn(false);

        LoginRequest request = LoginRequest.builder()
                .email("teacher@anurag.edu")
                .password("WrongPassword")
                .role(UserRole.STUDENT)
                .build();

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(InvalidCredentialsException.class)
                .hasMessage("Invalid email or password");

        verify(jwtTokenProvider, never()).generateToken(any(), anyString());
    }

    @Test
    @DisplayName("Non-existent email throws InvalidCredentialsException without leaking email presence")
    void nonExistentEmail_throwsInvalidCredentials() {
        when(userRepository.findActiveByEmail("unknown@anurag.edu")).thenReturn(Optional.empty());

        LoginRequest request = LoginRequest.builder()
                .email("unknown@anurag.edu")
                .password("AnyPassword")
                .role(UserRole.STUDENT)
                .build();

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(InvalidCredentialsException.class)
                .hasMessage("Invalid email or password");

        verify(jwtTokenProvider, never()).generateToken(any(), anyString());
    }
}
