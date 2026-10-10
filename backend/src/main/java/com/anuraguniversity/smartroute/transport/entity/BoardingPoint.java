package com.anuraguniversity.smartroute.transport.entity;

import com.anuraguniversity.smartroute.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(
    name = "boarding_points",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_boarding_points_route_stop_order", columnNames = {"route_id", "stop_order"})
    },
    indexes = {
        @Index(name = "idx_boarding_points_route", columnList = "route_id"),
        @Index(name = "idx_boarding_points_stop_order", columnList = "stop_order"),
        @Index(name = "idx_boarding_points_location", columnList = "latitude, longitude"),
        @Index(name = "idx_boarding_points_active", columnList = "active")
    }
)
@Getter
@Setter
public class BoardingPoint extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "route_id", nullable = false)
    private Route route;

    @NotBlank
    @Size(max = 100)
    @Column(name = "stop_name", nullable = false, length = 100)
    private String stopName;

    @Size(max = 255)
    @Column(name = "stop_description", length = 255)
    private String stopDescription;

    @Column(name = "stop_order", nullable = false)
    private Integer stopOrder;

    @Column(name = "stop_time")
    private java.time.LocalTime stopTime;

    @Column(name = "latitude", precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(name = "longitude", precision = 10, scale = 7)
    private BigDecimal longitude;

    @Size(max = 100)
    @Column(name = "landmark", length = 100)
    private String landmark;

    @Column(name = "active", nullable = false)
    private Boolean active = true;

    @Column(name = "wheelchair_accessible", nullable = false)
    private Boolean wheelchairAccessible = false;

    @Column(name = "shelter_available", nullable = false)
    private Boolean shelterAvailable = false;
    
    public static BoardingPoint create(Route route, String stopName, String stopDescription, 
            int stopOrder, java.time.LocalTime stopTime, BigDecimal latitude, BigDecimal longitude, String landmark) {
        BoardingPoint bp = new BoardingPoint();
        bp.setRoute(route);
        bp.setStopName(stopName);
        bp.setStopDescription(stopDescription);
        bp.setStopOrder(stopOrder);
        bp.setStopTime(stopTime);
        bp.setLatitude(latitude);
        bp.setLongitude(longitude);
        bp.setLandmark(landmark);
        bp.setActive(true);
        return bp;
    }
}