package com.anuraguniversity.smartroute.auth.entity;

import com.anuraguniversity.smartroute.common.entity.BaseEntity;
import com.anuraguniversity.smartroute.common.enums.OTPType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(
    name = "otps",
    indexes = {
        @Index(name = "idx_otps_email_type", columnList = "email, type"),
        @Index(name = "idx_otps_expires_at", columnList = "expires_at"),
        @Index(name = "idx_otps_used", columnList = "used"),
        @Index(name = "idx_otps_created_at", columnList = "created_at")
    }
)
@Getter
@Setter
public class OTP extends BaseEntity {

    @Size(max = 255)
    @Column(name = "email", nullable = false, length = 255)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 30)
    private OTPType type;

    @Size(max = 255)
    @Column(name = "otp_hash", nullable = false, length = 255)
    private String otpHash;

    @Column(name = "expires_at", nullable = false)
    private java.time.Instant expiresAt;

    @Column(name = "used", nullable = false)
    private Boolean used = false;

    @Column(name = "used_at")
    private java.time.Instant usedAt;

    @Column(name = "attempt_count", nullable = false)
    private Integer attemptCount = 0;

    @Column(name = "max_attempts", nullable = false)
    private Integer maxAttempts = 3;

    @Column(name = "resend_cooldown_until")
    private java.time.Instant resendCooldownUntil;

    public boolean isExpired() {
        return java.time.Instant.now().isAfter(expiresAt);
    }

    public boolean canVerify() {
        return !used && !isExpired() && attemptCount < maxAttempts;
    }

    public void incrementAttempt() {
        this.attemptCount++;
    }

    public void markAsUsed() {
        this.used = true;
        this.usedAt = java.time.Instant.now();
    }
    
    public static OTP create(String email, OTPType type, String otpHash, java.time.Instant expiresAt, 
                             int maxAttempts, java.time.Instant resendCooldownUntil) {
        OTP otp = new OTP();
        otp.setEmail(email);
        otp.setType(type);
        otp.setOtpHash(otpHash);
        otp.setExpiresAt(expiresAt);
        otp.setMaxAttempts(maxAttempts);
        otp.setResendCooldownUntil(resendCooldownUntil);
        return otp;
    }
}