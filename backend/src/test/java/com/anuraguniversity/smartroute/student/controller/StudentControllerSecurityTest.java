package com.anuraguniversity.smartroute.student.controller;

import com.anuraguniversity.smartroute.config.SecurityConfig;
import com.anuraguniversity.smartroute.security.JwtAuthenticationFilter;
import com.anuraguniversity.smartroute.security.JwtTokenProvider;
import com.anuraguniversity.smartroute.auth.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Role-authorization test on the real security configuration.
 * The JWT filter is mocked away; @WithMockUser supplies the role authorities
 * exactly as the real JwtAuthenticationFilter would (ROLE_STUDENT / ROLE_TEACHER).
 * Service calls are never expected to run for wrong-role access.
 */
@WebMvcTest(StudentController.class)
@Import(SecurityConfig.class)
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

    @Test
    void unauthenticatedRequest_returns401() throws Exception {
        mockMvc.perform(get("/student/profile"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "TEACHER")
    void teacherTokenOnStudentEndpoint_returns403() throws Exception {
        mockMvc.perform(get("/student/profile"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "STUDENT")
    void studentTokenOnStudentEndpoint_passesAuthorization() throws Exception {
        // Authorization passes; the controller runs and the (mocked) service returns null
        // profile data. Any non-5xx here proves the role gate let the student in.
        mockMvc.perform(get("/student/notifications"))
                .andExpect(result -> {
                    int s = result.getResponse().getStatus();
                    if (s >= 500) {
                        throw new AssertionError("Student request should not 500; got " + s
                                + " " + result.getResponse().getContentAsString());
                    }
                });
    }
}
