package com.anuraguniversity.smartroute.audit.repository;

import com.anuraguniversity.smartroute.audit.entity.AuditLog;
import com.anuraguniversity.smartroute.common.enums.AuditAction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, java.util.UUID> {

    List<AuditLog> findByUserIdOrderByCreatedAtDesc(java.util.UUID userId);

    List<AuditLog> findByActionOrderByCreatedAtDesc(AuditAction action);

    List<AuditLog> findByEntityTypeAndEntityId(String entityType, java.util.UUID entityId);

    @Query("SELECT a FROM AuditLog a WHERE a.createdAt >= :since ORDER BY a.createdAt DESC")
    List<AuditLog> findSince(@Param("since") Instant since);

    @Query("SELECT a FROM AuditLog a WHERE a.user.id = :userId AND a.action = :action AND a.createdAt >= :since")
    List<AuditLog> findByUserAndActionSince(@Param("userId") java.util.UUID userId, @Param("action") AuditAction action, @Param("since") Instant since);

    @Query("SELECT a FROM AuditLog a WHERE a.success = false AND a.createdAt >= :since")
    List<AuditLog> findFailedSince(@Param("since") Instant since);
}