package com.anuraguniversity.smartroute.transport.entity;

import com.anuraguniversity.smartroute.common.entity.BaseEntity;
import com.anuraguniversity.smartroute.common.enums.AssignmentStatus;
import com.anuraguniversity.smartroute.common.enums.Direction;
import com.anuraguniversity.smartroute.student.entity.Student;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(
    name = "student_bus_assignments",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_student_bus_assignment_active", columnNames = {"student_id", "bus_id", "route_id", "direction", "status"})
    },
    indexes = {
        @Index(name = "idx_student_bus_assignment_student", columnList = "student_id"),
        @Index(name = "idx_student_bus_assignment_bus", columnList = "bus_id"),
        @Index(name = "idx_student_bus_assignment_route", columnList = "route_id"),
        @Index(name = "idx_student_bus_assignment_status", columnList = "status"),
        @Index(name = "idx_student_bus_assignment_dates", columnList = "start_date, end_date")
    }
)
@Getter
@Setter
public class StudentBusAssignment extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "bus_id", nullable = false)
    private Bus bus;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "route_id", nullable = false)
    private Route route;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "boarding_point_id")
    private BoardingPoint boardingPoint;

    @Enumerated(EnumType.STRING)
    @Column(name = "direction", nullable = false, length = 20)
    private Direction direction;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private AssignmentStatus status = AssignmentStatus.ACTIVE;

    @Column(name = "start_date", nullable = false)
    private java.time.LocalDate startDate;

    @Column(name = "end_date")
    private java.time.LocalDate endDate;

    @Column(name = "assigned_by")
    private java.util.UUID assignedBy;

    @Column(name = "assignment_notes", length = 500)
    private String assignmentNotes;

    @Column(name = "cancelled_at")
    private java.time.Instant cancelledAt;

    @Column(name = "cancelled_by")
    private java.util.UUID cancelledBy;

    @Column(name = "cancellation_reason", length = 500)
    private String cancellationReason;

    public boolean isActiveOn(java.time.LocalDate date) {
        return status == AssignmentStatus.ACTIVE
            && !startDate.isAfter(date)
            && (endDate == null || !endDate.isBefore(date));
    }
}