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
    name = "delay_alerts",
    indexes = {
        @Index(name = "idx_delay_alert_route", columnList = "route_id"),
        @Index(name = "idx_delay_alert_bus", columnList = "bus_id"),
        @Index(name = "idx_delay_alert_active", columnList = "active"),
        @Index(name = "idx_delay_alert_time", columnList = "alert_time")
    }
)
@Getter
@Setter
public class DelayAlert extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "route_id")
    private Route route;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bus_id")
    private Bus bus;

    @Column(name = "alert_time", nullable = false)
    private java.time.LocalTime alertTime;

    @Column(name = "delay_minutes", nullable = false)
    private Integer delayMinutes;

    @Size(max = 500)
    @Column(name = "reason", length = 500)
    private String reason;

    @Column(name = "active", nullable = false)
    private Boolean active = true;

    @Column(name = "recurring", nullable = false)
    private Boolean recurring = false;

    @Size(max = 20)
    @Column(name = "recurrence_pattern", length = 20)
    private String recurrencePattern;

    @Column(name = "created_by")
    private java.util.UUID createdBy;
}