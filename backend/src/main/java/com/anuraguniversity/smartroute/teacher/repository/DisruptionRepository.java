package com.anuraguniversity.smartroute.teacher.repository;

import com.anuraguniversity.smartroute.teacher.entity.Disruption;
import com.anuraguniversity.smartroute.common.enums.DisruptionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface DisruptionRepository extends JpaRepository<Disruption, java.util.UUID> {

    List<Disruption> findByBusIdOrderByPublishedAtDesc(java.util.UUID busId);

    Page<Disruption> findByBusIdInOrderByPublishedAtDesc(java.util.List<java.util.UUID> busIds, Pageable pageable);

    List<Disruption> findByRouteIdOrderByPublishedAtDesc(java.util.UUID routeId);

    List<Disruption> findByTeacherIdOrderByPublishedAtDesc(java.util.UUID teacherId);

    List<Disruption> findByType(com.anuraguniversity.smartroute.common.enums.DisruptionType type);

    List<Disruption> findByStatus(DisruptionStatus status);

    @Query("SELECT d FROM Disruption d WHERE d.bus.id = :busId AND d.status IN ('ACTIVE', 'ACKNOWLEDGED')")
    List<Disruption> findActiveByBus(@Param("busId") java.util.UUID busId);

    @Query("SELECT d FROM Disruption d WHERE d.route.id = :routeId AND d.status IN ('ACTIVE', 'ACKNOWLEDGED')")
    List<Disruption> findActiveByRoute(@Param("routeId") java.util.UUID routeId);

    @Query("SELECT d FROM Disruption d WHERE d.status IN ('ACTIVE', 'ACKNOWLEDGED') AND d.startTime <= :now AND (d.endTime IS NULL OR d.endTime >= :now)")
    List<Disruption> findCurrentlyActive(@Param("now") Instant now);

    @Query("SELECT d FROM Disruption d WHERE d.status IN ('ACTIVE', 'ACKNOWLEDGED')")
    List<Disruption> findAllActive();

    long countByBusIdInAndStatusIn(java.util.List<java.util.UUID> busIds, java.util.List<DisruptionStatus> statuses);
}