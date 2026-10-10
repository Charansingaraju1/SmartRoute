package com.anuraguniversity.smartroute.transport.repository;

import com.anuraguniversity.smartroute.transport.entity.DelayAlert;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalTime;
import java.util.List;

@Repository
public interface DelayAlertRepository extends JpaRepository<DelayAlert, java.util.UUID> {

    List<DelayAlert> findByRouteId(java.util.UUID routeId);

    List<DelayAlert> findByBusId(java.util.UUID busId);

    List<DelayAlert> findByActiveTrue();

    @Query("SELECT d FROM DelayAlert d WHERE d.route.id = :routeId AND d.active = true AND d.alertTime = :time")
    List<DelayAlert> findActiveByRouteAndTime(@Param("routeId") java.util.UUID routeId, @Param("time") LocalTime time);

    @Query("SELECT d FROM DelayAlert d WHERE d.bus.id = :busId AND d.active = true AND d.alertTime = :time")
    List<DelayAlert> findActiveByBusAndTime(@Param("busId") java.util.UUID busId, @Param("time") LocalTime time);
}