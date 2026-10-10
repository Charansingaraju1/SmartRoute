package com.anuraguniversity.smartroute.transport.repository;

import com.anuraguniversity.smartroute.transport.entity.BoardingPoint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BoardingPointRepository extends JpaRepository<BoardingPoint, java.util.UUID> {

    List<BoardingPoint> findByRouteIdOrderByStopOrderAsc(java.util.UUID routeId);

    List<BoardingPoint> findByRouteIdAndActiveTrueOrderByStopOrderAsc(java.util.UUID routeId);

    Optional<BoardingPoint> findByRouteIdAndStopOrder(java.util.UUID routeId, int stopOrder);

    @Query("SELECT bp FROM BoardingPoint bp WHERE bp.route.id = :routeId AND bp.active = true ORDER BY bp.stopOrder ASC")
    List<BoardingPoint> findActiveByRouteOrderByStopOrder(@Param("routeId") java.util.UUID routeId);

    @Query("SELECT bp FROM BoardingPoint bp WHERE bp.route.id = :routeId AND bp.stopOrder > :currentOrder AND bp.active = true ORDER BY bp.stopOrder ASC")
    List<BoardingPoint> findStopsAfterOrder(@Param("routeId") java.util.UUID routeId, @Param("currentOrder") int currentOrder);

    @Query("SELECT bp FROM BoardingPoint bp WHERE bp.latitude IS NOT NULL AND bp.longitude IS NOT NULL AND bp.active = true")
    List<BoardingPoint> findAllWithCoordinates();

    @Query("SELECT bp FROM BoardingPoint bp WHERE bp.route.id = :routeId AND bp.stopOrder = (SELECT MAX(bp2.stopOrder) FROM BoardingPoint bp2 WHERE bp2.route.id = :routeId AND bp2.active = true)")
    Optional<BoardingPoint> findLastStopByRoute(@Param("routeId") java.util.UUID routeId);
}