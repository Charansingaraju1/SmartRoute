package com.anuraguniversity.smartroute.auth.entity;

import com.anuraguniversity.smartroute.common.entity.BaseEntity;
import com.anuraguniversity.smartroute.common.enums.UserRole;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.NaturalId;

import java.util.UUID;

@Entity
@Table(
    name = "users",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_users_email", columnNames = "email")
    },
    indexes = {
        @Index(name = "idx_users_email", columnList = "email"),
        @Index(name = "idx_users_role", columnList = "role"),
        @Index(name = "idx_users_active", columnList = "active"),
        @Index(name = "idx_users_created_at", columnList = "createdAt")
    }
)
@Getter
@Setter
public class User extends BaseEntity {

    @NotBlank
    @Size(max = 100)
    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @NaturalId
    @NotBlank
    @Email
    @Size(max = 255)
    @Column(name = "email", nullable = false, unique = true, length = 255)
    private String email;

    @NotBlank
    @Size(max = 255)
    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @NotBlank
    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 20)
    private UserRole role;

    @Column(name = "active", nullable = false)
    private Boolean active = true;

    @Column(name = "email_verified", nullable = false)
    private Boolean emailVerified = false;

    @Column(name = "last_login_at")
    private java.time.Instant lastLoginAt;

    @Column(name = "failed_login_attempts")
    private Integer failedLoginAttempts = 0;

    @Column(name = "locked_until")
    private java.time.Instant lockedUntil;

    @Column(name = "password_changed_at")
    private java.time.Instant passwordChangedAt;

    public boolean isActive() {
        return active != null && active;
    }

    public boolean isAccountNonLocked() {
        return lockedUntil == null || lockedUntil.isBefore(java.time.Instant.now());
    }

    public void incrementFailedLoginAttempts() {
        this.failedLoginAttempts = (this.failedLoginAttempts == null ? 0 : this.failedLoginAttempts) + 1;
        if (this.failedLoginAttempts >= 5) {
            this.lockedUntil = java.time.Instant.now().plusSeconds(15 * 60);
        }
    }

    public void resetFailedLoginAttempts() {
        this.failedLoginAttempts = 0;
        this.lockedUntil = null;
    }

    public static User create(String name, String email, String passwordHash, UserRole role) {
        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPasswordHash(passwordHash);
        user.setRole(role);
        user.setActive(true);
        user.setEmailVerified(false);
        return user;
    }
    
    public static User createWithId(UUID id, String name, String email, String passwordHash, UserRole role) {
        User user = create(name, email, passwordHash, role);
        user.setId(id);
        return user;
    }
}