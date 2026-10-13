package com.anuraguniversity.smartroute.audit.service;

import com.anuraguniversity.smartroute.audit.entity.AuditLog;
import com.anuraguniversity.smartroute.audit.repository.AuditLogRepository;
import com.anuraguniversity.smartroute.auth.entity.User;
import com.anuraguniversity.smartroute.common.enums.AuditAction;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    @Async
    public void log(UUID userId, UUID correlationId, AuditAction action,
            String entityType, String entityId, String entityIdentifier,
            Map<String, Object> oldValues, Map<String, Object> newValues) {
        AuditLog audit = AuditLog.create(userId, correlationId, action,
            entityType, entityId, entityIdentifier,
            oldValues != null ? toJson(oldValues) : null,
            newValues != null ? toJson(newValues) : null,
            true, null);
        saveAuditSafely(audit);
    }

    @Async
    public void logWithStrings(UUID userId, UUID correlationId, AuditAction action,
            String entityType, String entityId, String entityIdentifier,
            String oldValues, String newValues) {
        AuditLog audit = AuditLog.create(userId, correlationId, action,
            entityType, entityId, entityIdentifier,
            ensureJson(oldValues), ensureJson(newValues),
            true, null);
        saveAuditSafely(audit);
    }

    private void saveAuditSafely(AuditLog audit) {
        try {
            auditLogRepository.save(audit);
        } catch (org.springframework.dao.DataIntegrityViolationException e) {
            try {
                Thread.sleep(150);
                auditLogRepository.save(audit);
            } catch (Exception retryEx) {
                try {
                    audit.setUser(null);
                    auditLogRepository.save(audit);
                } catch (Exception fallbackEx) {
                    log.error("Failed to persist audit log fallback", fallbackEx);
                }
            }
        } catch (Exception e) {
            log.error("Failed to save audit log", e);
        }
    }

    private String ensureJson(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        String trimmed = value.trim();
        if ((trimmed.startsWith("{") && trimmed.endsWith("}")) ||
            (trimmed.startsWith("[") && trimmed.endsWith("]"))) {
            return trimmed;
        }
        try {
            return new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(Map.of("message", trimmed));
        } catch (Exception e) {
            return "{\"message\":\"" + trimmed.replace("\"", "\\\"") + "\"}";
        }
    }

    @Async
    public void logFailure(UUID userId, UUID correlationId, AuditAction action,
            String entityType, String entityId, String errorMessage) {
        try {
            AuditLog audit = AuditLog.create(userId, correlationId, action,
                entityType, entityId, entityId,
                null, null,
                false, errorMessage);

            auditLogRepository.save(audit);
        } catch (Exception e) {
            log.error("Failed to save audit log", e);
        }
    }

    private String toJson(Map<String, Object> map) {
        try {
            return new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(map);
        } catch (Exception e) {
            return map.toString();
        }
    }
}
