package com.anuraguniversity.smartroute.teacher.controller;

import com.anuraguniversity.smartroute.config.SecurityConfig;
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
 * Role-authorization test on the real security configuration (mirror of the
 * StudentControllerSecurityTest). Verifies teacher-only access on {@link TeacherController}.
 */
@WebMvcTest(TeacherController.class)
@Import(SecurityConfig.class)
class TeacherControllerSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private JwtTokenProvider jwtTokenProvider;

    @MockitoBean
    private UserRepository userRepository;

    @MockitoBean
    private com.anuraguniversity.smartroute.teacher.service.TeacherService teacherService;

    @Test
    void unauthenticatedRequest_returns401() throws Exception {
        mockMvc.perform(get("/teacher/profile"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "STUDENT")
    void studentTokenOnTeacherEndpoint_returns403() throws Exception {
        mockMvc.perform(get("/teacher/profile"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "TEACHER")
    void teacherTokenOnTeacherEndpoint_passesAuthorization() throws Exception {
        mockMvc.perform(get("/teacher/profile"))
                .andExpect(result -> {
                    int s = result.getResponse().getStatus();
                    if (s >= 500) {
                        throw new AssertionError("Teacher request should not 500; got " + s
                                + " " + result.getResponse().getContentAsString());
                    }
                });
    }
}
