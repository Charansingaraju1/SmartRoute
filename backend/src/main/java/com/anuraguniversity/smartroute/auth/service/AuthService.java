package com.anuraguniversity.smartroute.auth.service;

import com.anuraguniversity.smartroute.auth.dto.*;
import com.anuraguniversity.smartroute.auth.entity.OTP;
import com.anuraguniversity.smartroute.auth.entity.User;
import com.anuraguniversity.smartroute.auth.repository.OTPRepository;
import com.anuraguniversity.smartroute.auth.repository.UserRepository;
import com.anuraguniversity.smartroute.audit.service.AuditService;
import com.anuraguniversity.smartroute.common.enums.OTPType;
import com.anuraguniversity.smartroute.common.enums.UserRole;
import com.anuraguniversity.smartroute.common.exception.ResourceNotFoundException;
import com.anuraguniversity.smartroute.config.SmartRouteProperties;
import com.anuraguniversity.smartroute.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Random;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final OTPRepository otpRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final EmailService emailService;
    private final SmartRouteProperties properties;
    private final AuditService auditService;

    @Transactional
    public AuthResponse registerStudent(RegisterRequest request) {
        validateRegistrationRequest(request);
        
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }

        User user = User.create(
            request.getName().trim(),
            request.getEmail().toLowerCase().trim(),
            passwordEncoder.encode(request.getPassword()),
            UserRole.STUDENT
        );

        user = userRepository.save(user);

        sendOTP(user.getEmail(), OTPType.REGISTRATION);

        auditService.logWithStrings(user.getId(), null, com.anuraguniversity.smartroute.common.enums.AuditAction.CREATE, 
            "User", user.getId().toString(), user.getEmail(), null, null);

        return AuthResponse.builder()
            .message("Registration successful. Please verify your email with the OTP sent.")
            .email(user.getEmail())
            .requiresOTPVerification(true)
            .build();
    }

    @Transactional
    public AuthResponse registerTeacher(RegisterRequest request) {
        validateRegistrationRequest(request);
        
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }

        User user = User.create(
            request.getName().trim(),
            request.getEmail().toLowerCase().trim(),
            passwordEncoder.encode(request.getPassword()),
            UserRole.TEACHER
        );

        user = userRepository.save(user);

        sendOTP(user.getEmail(), OTPType.REGISTRATION);

        auditService.logWithStrings(user.getId(), null, com.anuraguniversity.smartroute.common.enums.AuditAction.CREATE, 
            "User", user.getId().toString(), user.getEmail(), null, null);

        return AuthResponse.builder()
            .message("Registration successful. Please verify your email with the OTP sent.")
            .email(user.getEmail())
            .requiresOTPVerification(true)
            .build();
    }

    @Transactional
    public void verifyOTP(VerifyOTPRequest request) {
        OTP otp = otpRepository.findValidOTP(request.getEmail().toLowerCase().trim(), request.getType(), Instant.now())
            .orElseThrow(() -> new IllegalArgumentException("Invalid or expired OTP"));

        if (!otp.canVerify()) {
            throw new IllegalArgumentException("OTP expired or maximum attempts reached");
        }

        String hashedOTP = hashOTP(request.getOtp());
        if (!hashedOTP.equals(otp.getOtpHash())) {
            otp.incrementAttempt();
            otpRepository.save(otp);
            throw new IllegalArgumentException("Invalid OTP");
        }

        otp.markAsUsed();
        otpRepository.save(otp);

        User user = userRepository.findByEmail(request.getEmail().toLowerCase().trim())
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (request.getType() == OTPType.REGISTRATION) {
            user.setEmailVerified(true);
            userRepository.save(user);
        }

        auditService.logWithStrings(user.getId(), null, com.anuraguniversity.smartroute.common.enums.AuditAction.OTP_VERIFY, 
            "OTP", otp.getId().toString(), request.getEmail(), null, null);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findActiveByEmail(request.getEmail().toLowerCase().trim())
            .orElseThrow(() -> new com.anuraguniversity.smartroute.auth.exception.InvalidCredentialsException("Invalid email or password"));

        if (!user.isAccountNonLocked()) {
            throw new com.anuraguniversity.smartroute.auth.exception.AccountLockedException("Account temporarily locked. Try again later.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            user.incrementFailedLoginAttempts();
            userRepository.save(user);
            
            auditService.logWithStrings(user.getId(), null, com.anuraguniversity.smartroute.common.enums.AuditAction.LOGIN_FAILED, 
                "User", user.getId().toString(), user.getEmail(), null, "Invalid password");
            
            throw new com.anuraguniversity.smartroute.auth.exception.InvalidCredentialsException("Invalid email or password");
        }

        user.resetFailedLoginAttempts();
        user.setLastLoginAt(Instant.now());
        userRepository.save(user);

        String accessToken = jwtTokenProvider.generateToken(user.getId(), user.getRole().name());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getId());

        auditService.logWithStrings(user.getId(), null, com.anuraguniversity.smartroute.common.enums.AuditAction.LOGIN, 
            "User", user.getId().toString(), user.getEmail(), null, null);

        return AuthResponse.builder()
            .accessToken(accessToken)
            .refreshToken(refreshToken)
            .tokenType("Bearer")
            .expiresIn(jwtTokenProvider.getExpiration())
            .user(UserDTO.from(user))
            .message("Login successful")
            .build();
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail().toLowerCase().trim())
            .orElse(null);

        if (user != null && user.isActive()) {
            sendOTP(user.getEmail(), OTPType.FORGOT_PASSWORD);
            auditService.logWithStrings(user.getId(), null, com.anuraguniversity.smartroute.common.enums.AuditAction.PASSWORD_RESET, 
                "User", user.getId().toString(), user.getEmail(), null, null);
        }
        // Always return success to prevent email enumeration
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        OTP otp = otpRepository.findValidOTP(request.getEmail().toLowerCase().trim(), OTPType.FORGOT_PASSWORD, Instant.now())
            .orElseThrow(() -> new IllegalArgumentException("Invalid or expired OTP"));

        if (!otp.canVerify()) {
            throw new IllegalArgumentException("OTP expired or maximum attempts reached");
        }

        String hashedOTP = hashOTP(request.getOtp());
        if (!hashedOTP.equals(otp.getOtpHash())) {
            otp.incrementAttempt();
            otpRepository.save(otp);
            throw new IllegalArgumentException("Invalid OTP");
        }

        otp.markAsUsed();
        otpRepository.save(otp);

        User user = userRepository.findByEmail(request.getEmail().toLowerCase().trim())
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(request.getNewPassword(), user.getPasswordHash())) {
            user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
            user.setPasswordChangedAt(Instant.now());
            userRepository.save(user);
            
            auditService.logWithStrings(user.getId(), null, com.anuraguniversity.smartroute.common.enums.AuditAction.PASSWORD_CHANGE, 
                "User", user.getId().toString(), user.getEmail(), null, null);
        }
    }

    @Transactional
    public void resendOTP(ResendOTPRequest request) {
        String email = request.getEmail().toLowerCase().trim();
        OTPType type = request.getType();

        OTP existing = otpRepository.findFirstByEmailAndTypeOrderByCreatedAtDesc(email, type).orElse(null);
        if (existing != null && existing.getResendCooldownUntil() != null 
                && existing.getResendCooldownUntil().isAfter(Instant.now())) {
            throw new IllegalArgumentException("Please wait before requesting another OTP");
        }

        sendOTP(email, type);
    }

    private void sendOTP(String email, OTPType type) {
        long recentCount = otpRepository.countByEmailAndTypeAndCreatedAtAfter(email, type, Instant.now().minusSeconds(3600));
        if (recentCount >= properties.getOtp().getRateLimitPerHour()) {
            throw new IllegalArgumentException("Too many OTP requests. Please try again later.");
        }

        String otpCode = generateOTP();
        String otpHash = hashOTP(otpCode);

        OTP otp = OTP.create(
            email,
            type,
            otpHash,
            Instant.now().plusSeconds(properties.getOtp().getExpirationMinutes() * 60L),
            properties.getOtp().getMaxAttempts(),
            Instant.now().plusSeconds(properties.getOtp().getResendCooldownSeconds())
        );

        otpRepository.save(otp);

        emailService.sendOTP(email, otpCode, type);

        auditService.logWithStrings(null, null, com.anuraguniversity.smartroute.common.enums.AuditAction.OTP_REQUEST, 
            "OTP", null, email, null, null);
    }

    private String generateOTP() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }

    private String hashOTP(String otp) {
        return passwordEncoder.encode(otp);
    }

    private void validateRegistrationRequest(RegisterRequest request) {
        if (request.getName() == null || request.getName().trim().length() < 2) {
            throw new IllegalArgumentException("Name must be at least 2 characters");
        }
        if (request.getEmail() == null || !request.getEmail().matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
            throw new IllegalArgumentException("Invalid email format");
        }
        if (request.getPassword() == null || request.getPassword().length() < 8) {
            throw new IllegalArgumentException("Password must be at least 8 characters");
        }
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match");
        }
    }

    public AuthResponse refreshToken(String refreshToken) {
        if (!jwtTokenProvider.validateToken(refreshToken)) {
            throw new IllegalArgumentException("Invalid or expired refresh token");
        }
        
        UUID userId = jwtTokenProvider.getUserIdFromToken(refreshToken);
        String role = jwtTokenProvider.getRoleFromToken(refreshToken);
        
        if (!"refresh".equals(jwtTokenProvider.getClaims(refreshToken).get("type"))) {
            throw new IllegalArgumentException("Invalid token type");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (!user.isActive() || !user.isAccountNonLocked()) {
            throw new IllegalArgumentException("User account is not active");
        }

        String newAccessToken = jwtTokenProvider.generateToken(user.getId(), user.getRole().name());
        String newRefreshToken = jwtTokenProvider.generateRefreshToken(user.getId());

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtTokenProvider.getExpiration())
                .user(UserDTO.from(user))
                .message("Token refreshed successfully")
                .build();
    }

    public AuthResponse getCurrentUser(String accessToken) {
        if (!jwtTokenProvider.validateToken(accessToken)) {
            throw new IllegalArgumentException("Invalid or expired access token");
        }

        UUID userId = jwtTokenProvider.getUserIdFromToken(accessToken);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return AuthResponse.builder()
                .user(UserDTO.from(user))
                .build();
    }
}