package com.anuraguniversity.smartroute.audit.entity;

import com.anuraguniversity.smartroute.auth.entity.User;
import com.anuraguniversity.smartroute.common.entity.BaseEntity;
import com.anuraguniversity.smartroute.common.enums.AuditAction;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(
    name = "audit_logs",
    indexes = {
        @Index(name = "idx_audit_user", columnList = "user_id"),
        @Index(name = "idx_audit_action", columnList = "action"),
        @Index(name = "idx_audit_entity", columnList = "entity_type, entity_id"),
        @Index(name = "idx_audit_created_at", columnList = "created_at"),
        @Index(name = "idx_audit_ip", columnList = "ip_address"),
        @Index(name = "idx_audit_user_action", columnList = "user_id, action")
    }
)
@Getter
@Setter
public class AuditLog extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "action", nullable = false, length = 50)
    private AuditAction action;

    @Size(max = 100)
    @Column(name = "entity_type", length = 100)
    private String entityType;

    @Column(name = "entity_id")
    private java.util.UUID entityId;

    @Size(max = 100)
    @Column(name = "entity_identifier", length = 100)
    private String entityIdentifier;

    @Column(name = "old_values", columnDefinition = "JSON")
    private String oldValues;

    @Column(name = "new_values", columnDefinition = "JSON")
    private String newValues;

    @Size(max = 45)
    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Size(max = 500)
    @Column(name = "user_agent", length = 500)
    private String userAgent;

    @Size(max = 200)
    @Column(name = "endpoint", length = 200)
    private String endpoint;

    @Size(max = 10)
    @Column(name = "http_method", length = 10)
    private String httpMethod;

    @Column(name = "response_status")
    private Integer responseStatus;

    @Column(name = "duration_ms")
    private Long durationMs;

    @Size(max = 1000)
    @Column(name = "error_message", length = 1000)
    private String errorMessage;

    @Column(name = "success", nullable = false)
    private Boolean success = true;

    @Column(name = "correlation_id")
    private java.util.UUID correlationId;

    public static AuditLog create(UUID userId, UUID correlationId, AuditAction action, 
            String entityType, String entityId, String entityIdentifier,
            String oldValues, String newValues, boolean success, String errorMessage) {
        AuditLog audit = new AuditLog();
        if (userId != null) {
            User user = new User();
            user.setId(userId);
            audit.setUser(user);
        }
        audit.setAction(action);
        audit.setEntityType(entityType);
        audit.setEntityId(entityId != null ? UUID.fromString(entityId) : null);
        audit.setEntityIdentifier(entityIdentifier);
        audit.setOldValues(oldValues);
        audit.setNewValues(newValues);
        audit.setCorrelationId(correlationId);
        audit.setSuccess(success);
        audit.setErrorMessage(errorMessage);
        return audit;
    }
}