package com.anuraguniversity.smartroute.security;

import com.anuraguniversity.smartroute.config.JwtProperties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class JwtTokenProviderTest {

    private JwtTokenProvider jwtTokenProvider;
    private JwtProperties jwtProperties;

    @BeforeEach
    void setUp() {
        jwtProperties = new JwtProperties();
        jwtProperties.setSecret("test-secret-key-for-testing-only-must-be-at-least-32-characters-long");
        jwtProperties.setExpiration(3600000); // 1 hour
        jwtProperties.setRefreshExpiration(604800000); // 7 days

        jwtTokenProvider = new JwtTokenProvider(jwtProperties);
        // Call init manually since @PostConstruct won't run in unit test
        ReflectionTestUtils.invokeMethod(jwtTokenProvider, "init");
    }

    @Test
    void generateToken_ShouldCreateValidToken() {
        UUID userId = UUID.randomUUID();
        String role = "STUDENT";

        String token = jwtTokenProvider.generateToken(userId, role);

        assertNotNull(token);
        assertFalse(token.isBlank());
        assertTrue(token.split("\\.").length == 3); // JWT has 3 parts
    }

    @Test
    void generateRefreshToken_ShouldCreateValidToken() {
        UUID userId = UUID.randomUUID();

        String refreshToken = jwtTokenProvider.generateRefreshToken(userId);

        assertNotNull(refreshToken);
        assertFalse(refreshToken.isBlank());
        assertTrue(refreshToken.split("\\.").length == 3);
    }

    @Test
    void validateToken_WithValidToken_ShouldReturnTrue() {
        UUID userId = UUID.randomUUID();
        String token = jwtTokenProvider.generateToken(userId, "STUDENT");

        boolean isValid = jwtTokenProvider.validateToken(token);

        assertTrue(isValid);
    }

    @Test
    void validateToken_WithInvalidToken_ShouldReturnFalse() {
        boolean isValid = jwtTokenProvider.validateToken("invalid.token.string");

        assertFalse(isValid);
    }

    @Test
    void validateToken_WithEmptyString_ShouldReturnFalse() {
        boolean isValid = jwtTokenProvider.validateToken("");

        assertFalse(isValid);
    }

    @Test
    void getUserIdFromToken_ShouldReturnCorrectUserId() {
        UUID userId = UUID.randomUUID();
        String token = jwtTokenProvider.generateToken(userId, "STUDENT");

        UUID extractedId = jwtTokenProvider.getUserIdFromToken(token);

        assertEquals(userId, extractedId);
    }

    @Test
    void getRoleFromToken_ShouldReturnCorrectRole() {
        UUID userId = UUID.randomUUID();
        String role = "TEACHER";
        String token = jwtTokenProvider.generateToken(userId, role);

        String extractedRole = jwtTokenProvider.getRoleFromToken(token);

        assertEquals(role, extractedRole);
    }

    @Test
    void isTokenExpired_WithValidToken_ShouldReturnFalse() {
        UUID userId = UUID.randomUUID();
        String token = jwtTokenProvider.generateToken(userId, "STUDENT");

        boolean isExpired = jwtTokenProvider.isTokenExpired(token);

        assertFalse(isExpired);
    }

    @Test
    void getExpiration_ShouldReturnConfiguredExpiration() {
        long expiration = jwtTokenProvider.getExpiration();

        assertEquals(3600000, expiration);
    }

    @Test
    void generateToken_WithDifferentRoles_ShouldEncodeRoleCorrectly() {
        UUID userId = UUID.randomUUID();
        
        String studentToken = jwtTokenProvider.generateToken(userId, "STUDENT");
        String teacherToken = jwtTokenProvider.generateToken(userId, "TEACHER");

        assertEquals("STUDENT", jwtTokenProvider.getRoleFromToken(studentToken));
        assertEquals("TEACHER", jwtTokenProvider.getRoleFromToken(teacherToken));
    }
}