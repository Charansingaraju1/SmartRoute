package com.anuraguniversity.smartroute.transport.entity;

import com.anuraguniversity.smartroute.common.entity.BaseEntity;
import com.anuraguniversity.smartroute.common.enums.Direction;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(
    name = "routes",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_routes_zone_code_direction", columnNames = {"zone_id", "route_code", "direction"})
    },
    indexes = {
        @Index(name = "idx_routes_zone", columnList = "zone_id"),
        @Index(name = "idx_routes_code", columnList = "route_code"),
        @Index(name = "idx_routes_direction", columnList = "direction"),
        @Index(name = "idx_routes_active", columnList = "active")
    }
)
@Getter
@Setter
public class Route extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "zone_id", nullable = false)
    private Zone zone;

    @NotBlank
    @Size(max = 20)
    @Column(name = "route_code", nullable = false, length = 20)
    private String routeCode;

    @Size(max = 100)
    @Column(name = "route_name", length = 100)
    private String routeName;

    @Enumerated(EnumType.STRING)
    @Column(name = "direction", nullable = false, length = 20)
    private Direction direction;

    @Size(max = 255)
    @Column(name = "starting_point", length = 255)
    private String startingPoint;

    @Column(name = "starting_time")
    private java.time.LocalTime startingTime;

    @Size(max = 255)
    @Column(name = "ending_point", length = 255)
    private String endingPoint;

    @Column(name = "ending_time")
    private java.time.LocalTime endingTime;

    @Size(max = 500)
    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "distance_km")
    private Double distanceKm;

    @Column(name = "estimated_duration_minutes")
    private Integer estimatedDurationMinutes;

    @Column(name = "active", nullable = false)
    private Boolean active = true;

    @Column(name = "display_order")
    private Integer displayOrder = 0;

    @Column(name = "fee_amount")
    private java.math.BigDecimal feeAmount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bus_id")
    private Bus bus;

    @OneToMany(mappedBy = "route", fetch = FetchType.LAZY, cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BoardingPoint> boardingPoints = new ArrayList<>();

    public void setBus(Bus bus) {
        this.bus = bus;
    }
    
    public static Route create(Zone zone, String routeCode, String routeName, Direction direction, int displayOrder) {
        Route route = new Route();
        route.setZone(zone);
        route.setRouteCode(routeCode);
        route.setRouteName(routeName);
        route.setDirection(direction);
        route.setActive(true);
        route.setDisplayOrder(displayOrder);
        return route;
    }
}