package com.anuraguniversity.smartroute.notification.entity;

import com.anuraguniversity.smartroute.auth.entity.User;
import com.anuraguniversity.smartroute.common.entity.BaseEntity;
import com.anuraguniversity.smartroute.common.enums.NotificationChannel;
import com.anuraguniversity.smartroute.common.enums.NotificationType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(
    name = "notifications",
    indexes = {
        @Index(name = "idx_notifications_recipient", columnList = "recipient_id"),
        @Index(name = "idx_notifications_type", columnList = "type"),
        @Index(name = "idx_notifications_read", columnList = "is_read"),
        @Index(name = "idx_notifications_created_at", columnList = "created_at"),
        @Index(name = "idx_notifications_recipient_read", columnList = "recipient_id, is_read")
    }
)
@Getter
@Setter
public class Notification extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "recipient_id", nullable = false)
    private User recipient;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 30)
    private NotificationType type;

    @Enumerated(EnumType.STRING)
    @Column(name = "channel", nullable = false, length = 20)
    private NotificationChannel channel = NotificationChannel.IN_APP;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "message", nullable = false, length = 2000)
    private String message;

    @Column(name = "related_entity_type", length = 50)
    private String relatedEntityType;

    @Column(name = "related_entity_id")
    private java.util.UUID relatedEntityId;

    @Column(name = "action_url", length = 500)
    private String actionUrl;

    @Column(name = "is_read", nullable = false)
    private Boolean read = false;

    @Column(name = "read_at")
    private java.time.Instant readAt;

    @Column(name = "sent_at")
    private java.time.Instant sentAt;

    @Column(name = "delivered_at")
    private java.time.Instant deliveredAt;

    @Column(name = "failed", nullable = false)
    private Boolean failed = false;

    @Column(name = "failure_reason", length = 500)
    private String failureReason;

    @Column(name = "retry_count", nullable = false)
    private Integer retryCount = 0;

    @Column(name = "priority", nullable = false)
    private Integer priority = 0;

    public void markAsRead() {
        this.read = true;
        this.readAt = java.time.Instant.now();
    }

    public void markAsSent() {
        this.sentAt = java.time.Instant.now();
    }

    public void markAsDelivered() {
        this.deliveredAt = java.time.Instant.now();
    }

    public void markAsFailed(String reason) {
        this.failed = true;
        this.failureReason = reason;
        this.retryCount++;
    }
}