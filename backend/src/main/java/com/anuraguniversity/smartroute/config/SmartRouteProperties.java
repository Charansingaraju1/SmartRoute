package com.anuraguniversity.smartroute.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "smartroute")
@Data
public class SmartRouteProperties {

    private Jwt jwt = new Jwt();
    private Otp otp = new Otp();
    private RateLimit rateLimit = new RateLimit();
    private Transport transport = new Transport();
    private Payment payment = new Payment();
    private Push push = new Push();
    private Ocr ocr = new Ocr();
    private Llm llm = new Llm();
    private Mail mail = new Mail();

    @Data
    public static class Jwt {
        private String secret;
        private long expiration = 86400000;
        private long refreshExpiration = 604800000;
    }

    @Data
    public static class Otp {
        private int length = 6;
        private int expirationMinutes = 10;
        private int maxAttempts = 3;
        private int resendCooldownSeconds = 60;
        private int rateLimitPerHour = 5;
    }

    @Data
    public static class RateLimit {
        private Login login = new Login();
        private PasswordReset passwordReset = new PasswordReset();

        @Data
        public static class Login {
            private int maxAttempts = 5;
            private int windowMinutes = 15;
        }

        @Data
        public static class PasswordReset {
            private int maxAttempts = 3;
            private int windowMinutes = 60;
        }
    }

    @Data
    public static class Transport {
        private String workbookPath = "classpath:data/AU_College_Transport_2026-2027-1.xls";
    }

    @Data
    public static class Payment {
        private String provider = "razorpay";
        private String key;
        private String secret;
        private String webhookSecret;
    }

    @Data
    public static class Push {
        private String vapidSubject = "mailto:admin@anuraguniversity.edu.in";
        private String vapidPublicKey;
        private String vapidPrivateKey;
    }

    @Data
    public static class Ocr {
        private boolean enabled = false;
        private String apiKey;
        private String endpoint;
    }

    @Data
    public static class Llm {
        private boolean enabled = false;
        private String apiKey;
        private String model = "gpt-4";
        private String endpoint;
    }

    @Data
    public static class Mail {
        private String host = "smtp.gmail.com";
        private int port = 587;
        private String username;
        private String password;
        private String from = "noreply@anuraguniversity.edu.in";
    }
}