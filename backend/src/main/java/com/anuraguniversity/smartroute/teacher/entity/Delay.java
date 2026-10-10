package com.anuraguniversity.smartroute.teacher.entity;

import com.anuraguniversity.smartroute.common.entity.BaseEntity;
import com.anuraguniversity.smartroute.common.enums.DelayStatus;
import com.anuraguniversity.smartroute.teacher.entity.Teacher;
import com.anuraguniversity.smartroute.transport.entity.Bus;
import com.anuraguniversity.smartroute.transport.entity.Route;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
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
    name = "delays",
    indexes = {
        @Index(name = "idx_delays_bus", columnList = "bus_id"),
        @Index(name = "idx_delays_route", columnList = "route_id"),
        @Index(name = "idx_delays_teacher", columnList = "teacher_id"),
        @Index(name = "idx_delays_status", columnList = "status"),
        @Index(name = "idx_delays_created_at", columnList = "created_at"),
        @Index(name = "idx_delays_expected_time", columnList = "expected_arrival_time")
    }
)
@Getter
@Setter
public class Delay extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "bus_id", nullable = false)
    private Bus bus;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "route_id")
    private Route route;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "teacher_id", nullable = false)
    private Teacher teacher;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private DelayStatus status = DelayStatus.PUBLISHED;

    @Column(name = "delay_minutes", nullable = false)
    private Integer delayMinutes;

    @Column(name = "expected_arrival_time")
    private java.time.LocalTime expectedArrivalTime;

    @Size(max = 500)
    @Column(name = "reason", length = 500)
    private String reason;

    @Size(max = 500)
    @Column(name = "notes", length = 500)
    private String notes;

    @Column(name = "published_at", nullable = false)
    private java.time.Instant publishedAt;

    @Column(name = "acknowledged_at")
    private java.time.Instant acknowledgedAt;

    @Column(name = "acknowledged_by")
    private java.util.UUID acknowledgedBy;

    @Column(name = "resolved_at")
    private java.time.Instant resolvedAt;

    @Column(name = "resolved_by")
    private java.util.UUID resolvedBy;

    @Column(name = "auto_expire_at")
    private java.time.Instant autoExpireAt;

    public boolean isActive() {
        return status == DelayStatus.PUBLISHED || status == DelayStatus.ACKNOWLEDGED;
    }

    public boolean isExpired() {
        return autoExpireAt != null && autoExpireAt.isBefore(java.time.Instant.now());
    }
}