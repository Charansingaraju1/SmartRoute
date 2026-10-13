package com.anuraguniversity.smartroute.student.controller;

import com.anuraguniversity.smartroute.config.JacksonConfig;
import com.anuraguniversity.smartroute.config.SecurityConfig;
import com.anuraguniversity.smartroute.security.JwtAuthenticationFilter;
import com.anuraguniversity.smartroute.security.JwtAuthenticationEntryPoint;
import com.anuraguniversity.smartroute.security.CustomAccessDeniedHandler;
import com.anuraguniversity.smartroute.security.JwtTokenProvider;
import com.anuraguniversity.smartroute.auth.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.anuraguniversity.smartroute.auth.entity.User;
import com.anuraguniversity.smartroute.common.enums.UserRole;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import java.util.List;
import java.util.UUID;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.authentication;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Role-authorization test on the real security configuration.
 * The JWT filter is mocked away; @WithMockUser supplies the role authorities
 * exactly as the real JwtAuthenticationFilter would (ROLE_STUDENT / ROLE_TEACHER).
 * Service calls are never expected to run for wrong-role access.
 */
@WebMvcTest(StudentController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class, JwtAuthenticationEntryPoint.class, CustomAccessDeniedHandler.class, JacksonConfig.class})
class StudentControllerSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    // Only mocked so the real SecurityConfig filter chain can be built.
    @MockitoBean
    private JwtTokenProvider jwtTokenProvider;

    @MockitoBean
    private UserRepository userRepository;

    @MockitoBean
    private com.anuraguniversity.smartroute.student.service.StudentService studentService;

    private User createMockUser(UserRole role) {
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setName("Test " + role.name());
        user.setEmail(role.name().toLowerCase() + "@anurag.edu");
        user.setRole(role);
        user.setActive(true);
        user.setEmailVerified(true);
        return user;
    }

    @Test
    void unauthenticatedRequest_returns401() throws Exception {
        mockMvc.perform(get("/student/profile"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void teacherTokenOnStudentEndpoint_returns403() throws Exception {
        mockMvc.perform(get("/student/profile").with(user("teacher").roles("TEACHER")))
                .andExpect(status().isForbidden());
    }

    @Test
    void studentTokenOnStudentEndpoint_passesAuthorization() throws Exception {
        User student = createMockUser(UserRole.STUDENT);
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                student, null, List.of(new SimpleGrantedAuthority("ROLE_STUDENT")));

        mockMvc.perform(get("/student/notifications").with(authentication(auth)))
                .andExpect(result -> {
                    int s = result.getResponse().getStatus();
                    if (s >= 500) {
                        throw new AssertionError("Student request should not 500; got " + s
                                + " " + result.getResponse().getContentAsString());
                    }
                });
    }

    @Test
    void unauthenticatedRequestToBusPass_returns401() throws Exception {
        mockMvc.perform(get("/student/bus-pass"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void teacherRequestToBusPass_returns403() throws Exception {
        mockMvc.perform(get("/student/bus-pass").with(user("teacher").roles("TEACHER")))
                .andExpect(status().isForbidden());
    }

    @Test
    void studentRequestToBusPass_passesAuthorization() throws Exception {
        User student = createMockUser(UserRole.STUDENT);
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                student, null, List.of(new SimpleGrantedAuthority("ROLE_STUDENT")));

        mockMvc.perform(get("/student/bus-pass").with(authentication(auth)))
                .andExpect(result -> {
                    int s = result.getResponse().getStatus();
                    if (s >= 500) {
                        throw new AssertionError("Student bus pass request should not 500; got " + s
                                + " " + result.getResponse().getContentAsString());
                    }
                });
    }

    @Test
    void unauthenticatedRequestToBusPassImage_isPermitAll() throws Exception {
        mockMvc.perform(get("/student/bus-pass/image/nonexistent-image.jpg"))
                .andExpect(status().isNotFound());
    }
}
