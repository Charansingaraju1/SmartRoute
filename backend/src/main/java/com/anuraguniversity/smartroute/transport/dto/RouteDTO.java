package com.anuraguniversity.smartroute.transport.dto;

import com.anuraguniversity.smartroute.transport.entity.Route;
import com.anuraguniversity.smartroute.transport.entity.Zone;
import com.anuraguniversity.smartroute.transport.entity.Bus;
import com.anuraguniversity.smartroute.transport.entity.BoardingPoint;
import com.anuraguniversity.smartroute.common.enums.Direction;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RouteDTO {
    private UUID id;
    private ZoneSummary zone;
    private UUID zoneId;
    private String routeCode;
    private String routeName;
    private Direction direction;
    private String startingPoint;
    private LocalTime startingTime;
    private String endingPoint;
    private LocalTime endingTime;
    private String description;
    private Double distanceKm;
    private Integer estimatedDurationMinutes;
    private Boolean active;
    private Integer displayOrder;
    private BigDecimal feeAmount;
    private BusSummary bus;
    private UUID busId;
    private List<BoardingPointSummary> boardingPoints;
    private Instant createdAt;
    private Instant updatedAt;

    public static RouteDTO from(Route route) {
        return RouteDTO.builder()
                .id(route.getId())
                .zone(route.getZone() != null ? ZoneSummary.from(route.getZone()) : null)
                .zoneId(route.getZone() != null ? route.getZone().getId() : null)
                .routeCode(route.getRouteCode())
                .routeName(route.getRouteName())
                .direction(route.getDirection())
                .startingPoint(route.getStartingPoint())
                .startingTime(route.getStartingTime())
                .endingPoint(route.getEndingPoint())
                .endingTime(route.getEndingTime())
                .description(route.getDescription())
                .distanceKm(route.getDistanceKm())
                .estimatedDurationMinutes(route.getEstimatedDurationMinutes())
                .active(route.getActive())
                .displayOrder(route.getDisplayOrder())
                .feeAmount(route.getFeeAmount())
                .bus(route.getBus() != null ? BusSummary.from(route.getBus()) : null)
                .busId(route.getBus() != null ? route.getBus().getId() : null)
                .boardingPoints(route.getBoardingPoints() != null ? 
                    route.getBoardingPoints().stream().map(BoardingPointSummary::from).collect(Collectors.toList()) : null)
                .createdAt(route.getCreatedAt())
                .updatedAt(route.getUpdatedAt())
                .build();
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ZoneSummary {
        private UUID id;
        private String name;
        private String code;

        public static ZoneSummary from(Zone zone) {
            return ZoneSummary.builder()
                    .id(zone.getId())
                    .name(zone.getName())
                    .code(zone.getCode())
                    .build();
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BusSummary {
        private UUID id;
        private String registrationNumber;
        private Integer capacity;
        private Integer currentStudentsCount;
        private Integer availableCapacity;

        public static BusSummary from(Bus bus) {
            return BusSummary.builder()
                    .id(bus.getId())
                    .registrationNumber(bus.getRegistrationNumber())
                    .capacity(bus.getCapacity())
                    .currentStudentsCount(bus.getCurrentStudentsCount())
                    .availableCapacity(bus.getAvailableCapacity())
                    .build();
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BoardingPointSummary {
        private UUID id;
        private String stopName;
        private String stopDescription;
        private Integer stopOrder;
        private LocalTime stopTime;
        private BigDecimal latitude;
        private BigDecimal longitude;
        private String landmark;
        private Boolean active;
        private Boolean wheelchairAccessible;
        private Boolean shelterAvailable;

        public static BoardingPointSummary from(BoardingPoint bp) {
            return BoardingPointSummary.builder()
                    .id(bp.getId())
                    .stopName(bp.getStopName())
                    .stopDescription(bp.getStopDescription())
                    .stopOrder(bp.getStopOrder())
                    .stopTime(bp.getStopTime())
                    .latitude(bp.getLatitude())
                    .longitude(bp.getLongitude())
                    .landmark(bp.getLandmark())
                    .active(bp.getActive())
                    .wheelchairAccessible(bp.getWheelchairAccessible())
                    .shelterAvailable(bp.getShelterAvailable())
                    .build();
        }
    }
}