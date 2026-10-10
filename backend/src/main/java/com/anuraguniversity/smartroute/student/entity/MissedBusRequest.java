package com.anuraguniversity.smartroute.student.entity;

import com.anuraguniversity.smartroute.common.entity.BaseEntity;
import com.anuraguniversity.smartroute.common.enums.MissedBusStatus;
import com.anuraguniversity.smartroute.student.entity.Student;
import com.anuraguniversity.smartroute.transport.entity.Bus;
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
    name = "missed_bus_requests",
    indexes = {
        @Index(name = "idx_missed_bus_student", columnList = "student_id"),
        @Index(name = "idx_missed_bus_bus", columnList = "bus_id"),
        @Index(name = "idx_missed_bus_status", columnList = "status"),
        @Index(name = "idx_missed_bus_created_at", columnList = "created_at"),
        @Index(name = "idx_missed_bus_resolved_at", columnList = "resolved_at")
    }
)
@Getter
@Setter
public class MissedBusRequest extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "original_bus_id")
    private Bus originalBus;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "alternative_bus_id")
    private Bus alternativeBus;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private MissedBusStatus status = MissedBusStatus.REQUESTED;

    @Column(name = "requested_at", nullable = false)
    private java.time.Instant requestedAt;

    @Column(name = "acknowledged_at")
    private java.time.Instant acknowledgedAt;

    @Column(name = "acknowledged_by")
    private java.util.UUID acknowledgedBy;

    @Column(name = "alternative_assigned_at")
    private java.time.Instant alternativeAssignedAt;

    @Column(name = "resolved_at")
    private java.time.Instant resolvedAt;

    @Column(name = "resolved_by")
    private java.util.UUID resolvedBy;

    @Size(max = 500)
    @Column(name = "student_notes", length = 500)
    private String studentNotes;

    @Size(max = 500)
    @Column(name = "teacher_notes", length = 500)
    private String teacherNotes;

    @Size(max = 500)
    @Column(name = "cancellation_reason", length = 500)
    private String cancellationReason;

    @Column(name = "student_location_lat")
    private Double studentLocationLat;

    @Column(name = "student_location_lng")
    private Double studentLocationLng;

    @Column(name = "student_location_at")
    private java.time.Instant studentLocationAt;
}