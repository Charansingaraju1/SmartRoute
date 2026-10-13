package com.anuraguniversity.smartroute.auth.service;

import com.anuraguniversity.smartroute.auth.dto.GoogleTokenPayload;
import com.anuraguniversity.smartroute.auth.exception.InvalidCredentialsException;
import com.anuraguniversity.smartroute.auth.exception.OAuthNotConfiguredException;
import com.anuraguniversity.smartroute.config.SmartRouteProperties;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.util.Map;

@Service
@Slf4j
public class DefaultGoogleTokenVerifier implements GoogleTokenVerifier {

    private final SmartRouteProperties properties;
    private final RestTemplate restTemplate;

    private static final String GOOGLE_TOKENINFO_URL = "https://oauth2.googleapis.com/tokeninfo?id_token={idToken}";

    public DefaultGoogleTokenVerifier(SmartRouteProperties properties) {
        this.properties = properties;
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(5));
        factory.setReadTimeout(Duration.ofSeconds(5));
        this.restTemplate = new RestTemplate(factory);
    }

    @Override
    public GoogleTokenPayload verify(String idToken) {
        String configuredClientId = properties.getOauth() != null && properties.getOauth().getGoogle() != null
                ? properties.getOauth().getGoogle().getClientId()
                : null;

        if (configuredClientId == null || configuredClientId.trim().isEmpty()) {
            throw new OAuthNotConfiguredException(
                "Google OAuth is not configured on the server. Please set GOOGLE_CLIENT_ID environment variable."
            );
        }

        if (idToken == null || idToken.trim().isEmpty()) {
            throw new InvalidCredentialsException("Google ID token is required");
        }

        try {
            ResponseEntity<Map> response = restTemplate.getForEntity(
                    GOOGLE_TOKENINFO_URL,
                    Map.class,
                    idToken.trim()
            );

            Map<String, Object> body = response.getBody();
            if (body == null) {
                throw new InvalidCredentialsException("Invalid Google token response");
            }

            String audience = (String) body.get("aud");
            if (!configuredClientId.equals(audience)) {
                log.warn("Google token audience mismatch. Expected: {}, Received: {}", configuredClientId, audience);
                throw new InvalidCredentialsException("Google token audience mismatch");
            }

            String issuer = (String) body.get("iss");
            if (!"https://accounts.google.com".equals(issuer) && !"accounts.google.com".equals(issuer)) {
                log.warn("Invalid Google token issuer: {}", issuer);
                throw new InvalidCredentialsException("Invalid Google token issuer");
            }

            Object emailVerifiedObj = body.get("email_verified");
            boolean emailVerified = Boolean.parseBoolean(String.valueOf(emailVerifiedObj));
            if (!emailVerified) {
                throw new InvalidCredentialsException("Google email is not verified");
            }

            String email = (String) body.get("email");
            if (email == null || email.trim().isEmpty()) {
                throw new InvalidCredentialsException("Google token does not contain an email");
            }

            String name = (String) body.get("name");
            String sub = (String) body.get("sub");

            return GoogleTokenPayload.builder()
                    .email(email.toLowerCase().trim())
                    .name(name != null ? name.trim() : email)
                    .sub(sub)
                    .emailVerified(true)
                    .build();

        } catch (RestClientException ex) {
            log.warn("Failed to verify Google token with Google identity services: {}", ex.getMessage());
            throw new InvalidCredentialsException("Invalid or expired Google token");
        }
    }
}
