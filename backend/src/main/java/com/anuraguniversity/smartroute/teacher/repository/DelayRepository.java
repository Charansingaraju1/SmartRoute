package com.anuraguniversity.smartroute.teacher.repository;

import com.anuraguniversity.smartroute.teacher.entity.Delay;
import com.anuraguniversity.smartroute.common.enums.DelayStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface DelayRepository extends JpaRepository<Delay, java.util.UUID> {

    List<Delay> findByBusIdOrderByPublishedAtDesc(java.util.UUID busId);

    Page<Delay> findByBusIdInOrderByPublishedAtDesc(java.util.List<java.util.UUID> busIds, Pageable pageable);

    List<Delay> findByRouteIdOrderByPublishedAtDesc(java.util.UUID routeId);

    List<Delay> findByTeacherIdOrderByPublishedAtDesc(java.util.UUID teacherId);

    List<Delay> findByStatus(DelayStatus status);

    @Query("SELECT d FROM Delay d WHERE d.bus.id = :busId AND d.status IN ('PUBLISHED', 'ACKNOWLEDGED')")
    List<Delay> findActiveByBus(@Param("busId") java.util.UUID busId);

    @Query("SELECT d FROM Delay d WHERE d.route.id = :routeId AND d.status IN ('PUBLISHED', 'ACKNOWLEDGED')")
    List<Delay> findActiveByRoute(@Param("routeId") java.util.UUID routeId);

    @Query("SELECT d FROM Delay d WHERE d.autoExpireAt IS NOT NULL AND d.autoExpireAt < :now AND d.status IN ('PUBLISHED', 'ACKNOWLEDGED')")
    List<Delay> findExpired(@Param("now") Instant now);

    long countByBusIdInAndStatusIn(java.util.List<java.util.UUID> busIds, java.util.List<DelayStatus> statuses);
}