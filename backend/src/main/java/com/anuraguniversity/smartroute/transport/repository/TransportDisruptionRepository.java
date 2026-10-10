package com.anuraguniversity.smartroute.transport.repository;

import com.anuraguniversity.smartroute.transport.entity.TransportDisruption;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface TransportDisruptionRepository extends JpaRepository<TransportDisruption, java.util.UUID> {

    List<TransportDisruption> findByRouteId(java.util.UUID routeId);

    List<TransportDisruption> findByBusId(java.util.UUID busId);

    List<TransportDisruption> findByActiveTrue();

    @Query("SELECT d FROM TransportDisruption d WHERE d.route.id = :routeId AND d.active = true AND d.startDate <= :date AND (d.endDate IS NULL OR d.endDate >= :date)")
    List<TransportDisruption> findActiveForRouteOnDate(@Param("routeId") java.util.UUID routeId, @Param("date") LocalDate date);

    @Query("SELECT d FROM TransportDisruption d WHERE d.bus.id = :busId AND d.active = true AND d.startDate <= :date AND (d.endDate IS NULL OR d.endDate >= :date)")
    List<TransportDisruption> findActiveForBusOnDate(@Param("busId") java.util.UUID busId, @Param("date") LocalDate date);

    @Query("SELECT d FROM TransportDisruption d WHERE d.active = true AND d.startDate <= :date AND (d.endDate IS NULL OR d.endDate >= :date)")
    List<TransportDisruption> findAllActiveOnDate(@Param("date") LocalDate date);
}