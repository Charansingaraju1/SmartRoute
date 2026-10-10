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
        try {
            AuditLog audit = AuditLog.create(userId, correlationId, action, 
                entityType, entityId, entityIdentifier,
                oldValues != null ? toJson(oldValues) : null,
                newValues != null ? toJson(newValues) : null,
                true, null);
            
            auditLogRepository.save(audit);
        } catch (Exception e) {
            log.error("Failed to save audit log", e);
        }
    }

    @Async
    public void logWithStrings(UUID userId, UUID correlationId, AuditAction action, 
            String entityType, String entityId, String entityIdentifier,
            String oldValues, String newValues) {
        try {
            AuditLog audit = AuditLog.create(userId, correlationId, action, 
                entityType, entityId, entityIdentifier,
                oldValues, newValues,
                true, null);
            
            auditLogRepository.save(audit);
        } catch (Exception e) {
            log.error("Failed to save audit log", e);
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