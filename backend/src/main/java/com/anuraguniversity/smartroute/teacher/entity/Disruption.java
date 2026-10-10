package com.anuraguniversity.smartroute.teacher.entity;

import com.anuraguniversity.smartroute.common.entity.BaseEntity;
import com.anuraguniversity.smartroute.common.enums.DisruptionStatus;
import com.anuraguniversity.smartroute.common.enums.DisruptionType;
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
    name = "disruptions",
    indexes = {
        @Index(name = "idx_disruptions_bus", columnList = "bus_id"),
        @Index(name = "idx_disruptions_route", columnList = "route_id"),
        @Index(name = "idx_disruptions_teacher", columnList = "teacher_id"),
        @Index(name = "idx_disruptions_type", columnList = "type"),
        @Index(name = "idx_disruptions_status", columnList = "status"),
        @Index(name = "idx_disruptions_created_at", columnList = "created_at"),
        @Index(name = "idx_disruptions_start_time", columnList = "start_time"),
        @Index(name = "idx_disruptions_end_time", columnList = "end_time")
    }
)
@Getter
@Setter
public class Disruption extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bus_id")
    private Bus bus;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "route_id")
    private Route route;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "teacher_id", nullable = false)
    private Teacher teacher;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 30)
    private DisruptionType type;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private DisruptionStatus status = DisruptionStatus.ACTIVE;

    @Column(name = "start_time", nullable = false)
    private java.time.Instant startTime;

    @Column(name = "end_time")
    private java.time.Instant endTime;

    @Column(name = "estimated_end_time")
    private java.time.Instant estimatedEndTime;

    @Size(max = 500)
    @Column(name = "title", nullable = false, length = 500)
    private String title;

    @Size(max = 2000)
    @Column(name = "description", length = 2000)
    private String description;

    @Size(max = 500)
    @Column(name = "affected_area", length = 500)
    private String affectedArea;

    @Size(max = 500)
    @Column(name = "alternative_route", length = 500)
    private String alternativeRoute;

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

    @Column(name = "severity", nullable = false)
    private Integer severity = 1;

    public boolean isActive() {
        return status == DisruptionStatus.ACTIVE || status == DisruptionStatus.ACKNOWLEDGED;
    }
}