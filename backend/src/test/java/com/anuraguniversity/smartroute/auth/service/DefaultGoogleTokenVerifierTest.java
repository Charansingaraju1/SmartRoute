package com.anuraguniversity.smartroute.auth.service;

import com.anuraguniversity.smartroute.auth.exception.InvalidCredentialsException;
import com.anuraguniversity.smartroute.auth.exception.OAuthNotConfiguredException;
import com.anuraguniversity.smartroute.config.SmartRouteProperties;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThatThrownBy;

class DefaultGoogleTokenVerifierTest {

    @Test
    @DisplayName("verify throws OAuthNotConfiguredException when client-id is missing or empty")
    void verify_unconfiguredClientId_throwsOAuthNotConfiguredException() {
        SmartRouteProperties properties = new SmartRouteProperties();
        // properties.getOauth().getGoogle().getClientId() is null by default

        DefaultGoogleTokenVerifier verifier = new DefaultGoogleTokenVerifier(properties);

        assertThatThrownBy(() -> verifier.verify("some.token.here"))
                .isInstanceOf(OAuthNotConfiguredException.class)
                .hasMessageContaining("Google OAuth is not configured on the server")
                .hasMessageContaining("GOOGLE_CLIENT_ID");
    }

    @Test
    @DisplayName("verify throws InvalidCredentialsException when token is null or blank with configured client-id")
    void verify_blankToken_throwsInvalidCredentialsException() {
        SmartRouteProperties properties = new SmartRouteProperties();
        properties.getOauth().getGoogle().setClientId("mock-client-id.apps.googleusercontent.com");

        DefaultGoogleTokenVerifier verifier = new DefaultGoogleTokenVerifier(properties);

        assertThatThrownBy(() -> verifier.verify(null))
                .isInstanceOf(InvalidCredentialsException.class)
                .hasMessageContaining("Google ID token is required");

        assertThatThrownBy(() -> verifier.verify("   "))
                .isInstanceOf(InvalidCredentialsException.class)
                .hasMessageContaining("Google ID token is required");
    }
}
