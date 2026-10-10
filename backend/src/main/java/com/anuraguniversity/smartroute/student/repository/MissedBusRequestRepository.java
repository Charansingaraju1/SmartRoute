package com.anuraguniversity.smartroute.student.repository;

import com.anuraguniversity.smartroute.student.entity.MissedBusRequest;
import com.anuraguniversity.smartroute.common.enums.MissedBusStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface MissedBusRequestRepository extends JpaRepository<MissedBusRequest, java.util.UUID> {

    List<MissedBusRequest> findByStudentIdOrderByCreatedAtDesc(java.util.UUID studentId);

    Page<MissedBusRequest> findByStudentIdOrderByCreatedAtDesc(java.util.UUID studentId, Pageable pageable);

    List<MissedBusRequest> findByOriginalBusIdAndStatus(java.util.UUID busId, MissedBusStatus status);

    List<MissedBusRequest> findByAlternativeBusId(java.util.UUID busId);

    List<MissedBusRequest> findByStatus(MissedBusStatus status);

    @Query("SELECT m FROM MissedBusRequest m WHERE m.originalBus.id IN :busIds ORDER BY m.requestedAt DESC")
    List<MissedBusRequest> findByOriginalBusIdInOrderByRequestedAtDesc(@Param("busIds") java.util.List<java.util.UUID> busIds);

    Page<MissedBusRequest> findByOriginalBusIdInOrderByRequestedAtDesc(java.util.List<java.util.UUID> busIds, Pageable pageable);

    @Query("SELECT m FROM MissedBusRequest m WHERE m.status IN ('REQUESTED', 'ACKNOWLEDGED') AND m.requestedAt >= :since")
    List<MissedBusRequest> findPendingSince(@Param("since") Instant since);

    long countByStudentIdAndStatus(java.util.UUID studentId, MissedBusStatus status);

    long countByOriginalBusIdInAndStatus(java.util.List<java.util.UUID> busIds, MissedBusStatus status);
}