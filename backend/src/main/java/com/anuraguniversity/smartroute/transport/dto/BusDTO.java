package com.anuraguniversity.smartroute.transport.dto;

import com.anuraguniversity.smartroute.transport.entity.Bus;
import com.anuraguniversity.smartroute.transport.entity.Route;
import com.anuraguniversity.smartroute.common.enums.Direction;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BusDTO {
    private UUID id;
    private String registrationNumber;
    private String busNumber;
    private Integer capacity;
    private String model;
    private String fuelType;
    private Integer manufactureYear;
    private String driverName;
    private String driverPhone;
    private String conductorName;
    private String conductorPhone;
    private Boolean active;
    private String gpsDeviceId;
    private Double lastLocationLat;
    private Double lastLocationLng;
    private Instant lastLocationAt;
    private Integer currentStudentsCount;
    private Integer availableCapacity;
    private Boolean verified;
    private RouteSummary assignedRoute;
    private Instant createdAt;
    private Instant updatedAt;

    public static BusDTO from(Bus bus) {
        return BusDTO.builder()
                .id(bus.getId())
                .registrationNumber(bus.getRegistrationNumber())
                .busNumber(bus.getBusNumber())
                .capacity(bus.getCapacity())
                .model(bus.getModel())
                .fuelType(bus.getFuelType())
                .manufactureYear(bus.getManufactureYear())
                .driverName(bus.getDriverName())
                .driverPhone(bus.getDriverPhone())
                .conductorName(bus.getConductorName())
                .conductorPhone(bus.getConductorPhone())
                .active(bus.getActive())
                .gpsDeviceId(bus.getGpsDeviceId())
                .lastLocationLat(bus.getLastLocationLat())
                .lastLocationLng(bus.getLastLocationLng())
                .lastLocationAt(bus.getLastLocationAt())
                .currentStudentsCount(bus.getCurrentStudentsCount())
                .availableCapacity(bus.getAvailableCapacity())
                .createdAt(bus.getCreatedAt())
                .updatedAt(bus.getUpdatedAt())
                .build();
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LocationInfo {
        private UUID busId;
        private String registrationNumber;
        private Double latitude;
        private Double longitude;
        private Instant lastLocationAt;
        private String gpsDeviceId;

        public static LocationInfo from(Bus bus) {
            return LocationInfo.builder()
                    .busId(bus.getId())
                    .registrationNumber(bus.getRegistrationNumber())
                    .latitude(bus.getLastLocationLat())
                    .longitude(bus.getLastLocationLng())
                    .lastLocationAt(bus.getLastLocationAt())
                    .gpsDeviceId(bus.getGpsDeviceId())
                    .build();
        }
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
    }
}