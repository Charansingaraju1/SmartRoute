package com.anuraguniversity.smartroute.transport.repository;

import com.anuraguniversity.smartroute.transport.entity.Route;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RouteRepository extends JpaRepository<Route, java.util.UUID> {

    List<Route> findByZoneId(java.util.UUID zoneId);

    List<Route> findByZoneIdAndActiveTrue(java.util.UUID zoneId);

    Page<Route> findByZoneIdAndActiveTrue(java.util.UUID zoneId, Pageable pageable);

    List<Route> findByZoneIdAndDirection(
            java.util.UUID zoneId, 
            com.anuraguniversity.smartroute.common.enums.Direction direction
    );

    Page<Route> findByZoneIdAndDirection(
            java.util.UUID zoneId, 
            com.anuraguniversity.smartroute.common.enums.Direction direction,
            Pageable pageable);

    @Query("SELECT r FROM Route r WHERE r.zone.id = :zoneId AND r.active = true AND r.direction = :direction")
    List<Route> findActiveByZoneAndDirection(@Param("zoneId") java.util.UUID zoneId, @Param("direction") com.anuraguniversity.smartroute.common.enums.Direction direction);

    @Query("SELECT r FROM Route r WHERE r.zone.id = :zoneId AND r.active = true AND r.direction = :direction")
    Page<Route> findActiveByZoneAndDirection(@Param("zoneId") java.util.UUID zoneId, @Param("direction") com.anuraguniversity.smartroute.common.enums.Direction direction, Pageable pageable);

    Optional<Route> findByRouteCodeAndZoneIdAndDirection(String routeCode, java.util.UUID zoneId, com.anuraguniversity.smartroute.common.enums.Direction direction);

    boolean existsByRouteCodeAndZoneIdAndDirection(String routeCode, java.util.UUID zoneId, com.anuraguniversity.smartroute.common.enums.Direction direction);

    long countByZoneId(java.util.UUID zoneId);
}