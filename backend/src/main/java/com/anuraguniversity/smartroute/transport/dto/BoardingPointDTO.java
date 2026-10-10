package com.anuraguniversity.smartroute.transport.dto;

import com.anuraguniversity.smartroute.transport.entity.BoardingPoint;
import com.anuraguniversity.smartroute.transport.entity.Route;
import com.anuraguniversity.smartroute.common.enums.Direction;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BoardingPointDTO {
    private UUID id;
    private RouteSummary route;
    private UUID routeId;
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
    private Instant createdAt;
    private Instant updatedAt;

    public static BoardingPointDTO from(BoardingPoint bp) {
        return BoardingPointDTO.builder()
                .id(bp.getId())
                .route(bp.getRoute() != null ? RouteSummary.from(bp.getRoute()) : null)
                .routeId(bp.getRoute() != null ? bp.getRoute().getId() : null)
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
                .createdAt(bp.getCreatedAt())
                .updatedAt(bp.getUpdatedAt())
                .build();
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RouteSummary {
        private UUID id;
        private String routeCode;
        private String routeName;
        private Direction direction;

        public static RouteSummary from(Route route) {
            return RouteSummary.builder()
                    .id(route.getId())
                    .routeCode(route.getRouteCode())
                    .routeName(route.getRouteName())
                    .direction(route.getDirection())
                    .build();
        }
    }
}