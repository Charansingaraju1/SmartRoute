package com.anuraguniversity.smartroute.auth.controller;

import com.anuraguniversity.smartroute.auth.dto.AuthResponse;
import com.anuraguniversity.smartroute.auth.dto.LoginRequest;
import com.anuraguniversity.smartroute.auth.dto.UserDTO;
import com.anuraguniversity.smartroute.auth.exception.InvalidCredentialsException;
import com.anuraguniversity.smartroute.auth.exception.RoleMismatchException;
import com.anuraguniversity.smartroute.auth.service.AuthService;
import com.anuraguniversity.smartroute.common.enums.UserRole;
import com.anuraguniversity.smartroute.common.exception.GlobalExceptionHandler;
import com.anuraguniversity.smartroute.config.JacksonConfig;
import com.anuraguniversity.smartroute.config.SecurityConfig;
import com.anuraguniversity.smartroute.security.CustomAccessDeniedHandler;
import com.anuraguniversity.smartroute.security.JwtAuthenticationEntryPoint;
import com.anuraguniversity.smartroute.security.JwtAuthenticationFilter;
import com.anuraguniversity.smartroute.security.JwtTokenProvider;
import com.anuraguniversity.smartroute.auth.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class, JwtAuthenticationEntryPoint.class, CustomAccessDeniedHandler.class, JacksonConfig.class, GlobalExceptionHandler.class})
class AuthControllerSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private AuthService authService;

    @MockitoBean
    private JwtTokenProvider jwtTokenProvider;

    @MockitoBean
    private UserRepository userRepository;

    @Test
    @DisplayName("Student credentials submitted through Student Login succeed with 200 OK")
    void studentLogin_withStudentRole_succeeds() throws Exception {
        LoginRequest request = LoginRequest.builder()
                .email("student@anurag.edu")
                .password("ValidPass123!")
                .role(UserRole.STUDENT)
                .build();

        AuthResponse authResponse = AuthResponse.builder()
                .accessToken("mock-student-jwt")
                .refreshToken("mock-student-refresh")
                .tokenType("Bearer")
                .user(UserDTO.builder()
                        .id(UUID.randomUUID())
                        .name("Test Student")
                        .email("student@anurag.edu")
                        .role(UserRole.STUDENT)
                        .active(true)
                        .emailVerified(true)
                        .build())
                .message("Login successful")
                .build();

        when(authService.login(any(LoginRequest.class))).thenReturn(authResponse);

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").value("mock-student-jwt"))
                .andExpect(jsonPath("$.data.user.role").value("STUDENT"));
    }

    @Test
    @DisplayName("Teacher credentials submitted through Teacher Login succeed with 200 OK")
    void teacherLogin_withTeacherRole_succeeds() throws Exception {
        LoginRequest request = LoginRequest.builder()
                .email("teacher@anurag.edu")
                .password("ValidPass123!")
                .role(UserRole.TEACHER)
                .build();

        AuthResponse authResponse = AuthResponse.builder()
                .accessToken("mock-teacher-jwt")
                .refreshToken("mock-teacher-refresh")
                .tokenType("Bearer")
                .user(UserDTO.builder()
                        .id(UUID.randomUUID())
                        .name("Test Teacher")
                        .email("teacher@anurag.edu")
                        .role(UserRole.TEACHER)
                        .active(true)
                        .emailVerified(true)
                        .build())
                .message("Login successful")
                .build();

        when(authService.login(any(LoginRequest.class))).thenReturn(authResponse);

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").value("mock-teacher-jwt"))
                .andExpect(jsonPath("$.data.user.role").value("TEACHER"));
    }

    @Test
    @DisplayName("Teacher credentials submitted through Student Login are rejected with 403 Forbidden")
    void teacherCredentials_submittedThroughStudentLogin_rejectedWith403() throws Exception {
        LoginRequest request = LoginRequest.builder()
                .email("teacher@anurag.edu")
                .password("ValidPass123!")
                .role(UserRole.STUDENT)
                .build();

        when(authService.login(any(LoginRequest.class)))
                .thenThrow(new RoleMismatchException("This account is registered as a Teacher. Please use Teacher Login."));

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.error").value("Forbidden"))
                .andExpect(jsonPath("$.message").value("This account is registered as a Teacher. Please use Teacher Login."));
    }

    @Test
    @DisplayName("Student credentials submitted through Teacher Login are rejected with 403 Forbidden")
    void studentCredentials_submittedThroughTeacherLogin_rejectedWith403() throws Exception {
        LoginRequest request = LoginRequest.builder()
                .email("student@anurag.edu")
                .password("ValidPass123!")
                .role(UserRole.TEACHER)
                .build();

        when(authService.login(any(LoginRequest.class)))
                .thenThrow(new RoleMismatchException("This account is registered as a Student. Please use Student Login."));

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.error").value("Forbidden"))
                .andExpect(jsonPath("$.message").value("This account is registered as a Student. Please use Student Login."));
    }

    @Test
    @DisplayName("Invalid credentials return 401 Unauthorized with generic message")
    void invalidCredentials_returns401() throws Exception {
        LoginRequest request = LoginRequest.builder()
                .email("random@anurag.edu")
                .password("WrongPassword123")
                .role(UserRole.STUDENT)
                .build();

        when(authService.login(any(LoginRequest.class)))
                .thenThrow(new InvalidCredentialsException("Invalid email or password"));

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.error").value("Unauthorized"))
                .andExpect(jsonPath("$.message").value("Invalid email or password"));
    }
}
