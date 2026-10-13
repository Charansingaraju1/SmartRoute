package com.anuraguniversity.smartroute.teacher.controller;

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
 * Role-authorization test on the real security configuration (mirror of the
 * StudentControllerSecurityTest). Verifies teacher-only access on {@link TeacherController}.
 */
@WebMvcTest(TeacherController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class, JwtAuthenticationEntryPoint.class, CustomAccessDeniedHandler.class, JacksonConfig.class})
class TeacherControllerSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private JwtTokenProvider jwtTokenProvider;

    @MockitoBean
    private UserRepository userRepository;

    @MockitoBean
    private com.anuraguniversity.smartroute.teacher.service.TeacherService teacherService;

    @MockitoBean
    private com.anuraguniversity.smartroute.notification.repository.NotificationRepository notificationRepository;

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
        mockMvc.perform(get("/teacher/profile"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void studentTokenOnTeacherEndpoint_returns403() throws Exception {
        mockMvc.perform(get("/teacher/profile").with(user("student").roles("STUDENT")))
                .andExpect(status().isForbidden());
    }

    @Test
    void teacherTokenOnTeacherEndpoint_passesAuthorization() throws Exception {
        User teacher = createMockUser(UserRole.TEACHER);
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                teacher, null, List.of(new SimpleGrantedAuthority("ROLE_TEACHER")));

        mockMvc.perform(get("/teacher/profile").with(authentication(auth)))
                .andExpect(result -> {
                    int s = result.getResponse().getStatus();
                    if (s >= 500) {
                        throw new AssertionError("Teacher request should not 500; got " + s
                                + " " + result.getResponse().getContentAsString());
                    }
                });
    }

    @Test
    void teacherCanAssignAlternativeBus_passesAuthorization() throws Exception {
        User teacher = createMockUser(UserRole.TEACHER);
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                teacher, null, List.of(new SimpleGrantedAuthority("ROLE_TEACHER")));

        UUID requestId = UUID.randomUUID();
        UUID altBusId = UUID.randomUUID();

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/teacher/missed-bus/" + requestId + "/alternative")
                .with(authentication(auth))
                .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                .content("{\"alternativeBusId\":\"" + altBusId + "\",\"notes\":\"Board at Stop B\"}"))
                .andExpect(result -> {
                    int s = result.getResponse().getStatus();
                    if (s >= 500) {
                        throw new AssertionError("Teacher alternative bus assignment should not 500; got " + s
                                + " " + result.getResponse().getContentAsString());
                    }
                });
    }

    @Test
    void studentCannotAccessAssignmentEndpoints_returns403() throws Exception {
        UUID assignmentId = UUID.randomUUID();
        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get("/teacher/assignments")
                .with(user("student").roles("STUDENT")))
                .andExpect(status().isForbidden());

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post("/teacher/assignments")
                .with(user("student").roles("STUDENT"))
                .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isForbidden());

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete("/teacher/assignments/" + assignmentId)
                .with(user("student").roles("STUDENT")))
                .andExpect(status().isForbidden());
    }

    @Test
    void teacherCanAccessAssignmentEndpoints_passesAuthorization() throws Exception {
        User teacher = createMockUser(UserRole.TEACHER);
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                teacher, null, List.of(new SimpleGrantedAuthority("ROLE_TEACHER")));

        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get("/teacher/assignments")
                .with(authentication(auth)))
                .andExpect(status().isOk());

        UUID assignmentId = UUID.randomUUID();
        mockMvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete("/teacher/assignments/" + assignmentId)
                .with(authentication(auth)))
                .andExpect(status().isOk());
    }
}
