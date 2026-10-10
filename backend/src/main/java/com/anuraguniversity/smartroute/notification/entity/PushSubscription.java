package com.anuraguniversity.smartroute.notification.entity;

import com.anuraguniversity.smartroute.auth.entity.User;
import com.anuraguniversity.smartroute.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(
    name = "push_subscriptions",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_push_subscription_user_endpoint", columnNames = {"user_id", "endpoint"})
    },
    indexes = {
        @Index(name = "idx_push_subscription_user", columnList = "user_id"),
        @Index(name = "idx_push_subscription_endpoint", columnList = "endpoint"),
        @Index(name = "idx_push_subscription_active", columnList = "active")
    }
)
@Getter
@Setter
public class PushSubscription extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Size(max = 500)
    @Column(name = "endpoint", nullable = false, length = 500)
    private String endpoint;

    @Size(max = 100)
    @Column(name = "p256dh_key", nullable = false, length = 100)
    private String p256dhKey;

    @Size(max = 100)
    @Column(name = "auth_key", nullable = false, length = 100)
    private String authKey;

    @Column(name = "active", nullable = false)
    private Boolean active = true;

    @Column(name = "user_agent", length = 500)
    private String userAgent;

    @Column(name = "last_used_at")
    private java.time.Instant lastUsedAt;

    @Column(name = "failed_delivery_count", nullable = false)
    private Integer failedDeliveryCount = 0;

    @Column(name = "last_failed_at")
    private java.time.Instant lastFailedAt;

    public void markUsed() {
        this.lastUsedAt = java.time.Instant.now();
        this.failedDeliveryCount = 0;
    }

    public void markFailed() {
        this.failedDeliveryCount++;
        this.lastFailedAt = java.time.Instant.now();
        if (this.failedDeliveryCount >= 3) {
            this.active = false;
        }
    }
}