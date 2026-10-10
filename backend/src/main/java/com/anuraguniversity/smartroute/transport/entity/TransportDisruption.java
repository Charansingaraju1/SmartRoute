package com.anuraguniversity.smartroute.transport.entity;

import com.anuraguniversity.smartroute.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(
    name = "transport_disruptions",
    indexes = {
        @Index(name = "idx_transport_disruption_route", columnList = "route_id"),
        @Index(name = "idx_transport_disruption_bus", columnList = "bus_id"),
        @Index(name = "idx_transport_disruption_active", columnList = "active"),
        @Index(name = "idx_transport_disruption_dates", columnList = "start_date, end_date")
    }
)
@Getter
@Setter
public class TransportDisruption extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "route_id")
    private Route route;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bus_id")
    private Bus bus;

    @Column(name = "start_date", nullable = false)
    private java.time.LocalDate startDate;

    @Column(name = "end_date")
    private java.time.LocalDate endDate;

    @Size(max = 500)
    @Column(name = "title", nullable = false, length = 500)
    private String title;

    @Size(max = 2000)
    @Column(name = "description", length = 2000)
    private String description;

    @Size(max = 500)
    @Column(name = "affected_stops", length = 500)
    private String affectedStops;

    @Size(max = 500)
    @Column(name = "alternative_arrangement", length = 500)
    private String alternativeArrangement;

    @Column(name = "active", nullable = false)
    private Boolean active = true;

    @Column(name = "created_by")
    private java.util.UUID createdBy;

    public boolean isActiveOn(java.time.LocalDate date) {
        return active
            && !startDate.isAfter(date)
            && (endDate == null || !endDate.isBefore(date));
    }
}