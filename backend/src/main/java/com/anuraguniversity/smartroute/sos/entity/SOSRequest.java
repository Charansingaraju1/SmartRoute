package com.anuraguniversity.smartroute.sos.entity;

import com.anuraguniversity.smartroute.common.entity.BaseEntity;
import com.anuraguniversity.smartroute.common.enums.SOSCategory;
import com.anuraguniversity.smartroute.common.enums.SOSStatus;
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
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(
    name = "sos_requests",
    indexes = {
        @Index(name = "idx_sos_student", columnList = "student_id"),
        @Index(name = "idx_sos_category", columnList = "category"),
        @Index(name = "idx_sos_status", columnList = "status"),
        @Index(name = "idx_sos_created_at", columnList = "created_at"),
        @Index(name = "idx_sos_location", columnList = "latitude, longitude"),
        @Index(name = "idx_sos_resolved_at", columnList = "resolved_at")
    }
)
@Getter
@Setter
public class SOSRequest extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false, length = 30)
    private SOSCategory category;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private SOSStatus status = SOSStatus.OPEN;

    @Size(max = 500)
    @Column(name = "description", length = 500)
    private String description;

    @Column(name = "latitude", precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(name = "longitude", precision = 10, scale = 7)
    private BigDecimal longitude;

    @Column(name = "location_accuracy")
    private Double locationAccuracy;

    @Column(name = "location_at")
    private java.time.Instant locationAt;

    @Column(name = "triggered_at", nullable = false)
    private java.time.Instant triggeredAt;

    @Column(name = "acknowledged_at")
    private java.time.Instant acknowledgedAt;

    @Column(name = "acknowledged_by")
    private java.util.UUID acknowledgedBy;

    @Column(name = "responding_at")
    private java.time.Instant respondingAt;

    @Column(name = "responding_by")
    private java.util.UUID respondingBy;

    @Column(name = "resolved_at")
    private java.time.Instant resolvedAt;

    @Column(name = "resolved_by")
    private java.util.UUID resolvedBy;

    @Size(max = 500)
    @Column(name = "resolution_notes", length = 500)
    private String resolutionNotes;

    @Column(name = "emergency_services_contacted", nullable = false)
    private Boolean emergencyServicesContacted = false;

    @Column(name = "emergency_contact_notified", nullable = false)
    private Boolean emergencyContactNotified = false;

    @Column(name = "teacher_notified", nullable = false)
    private Boolean teacherNotified = false;

    public boolean isOpen() {
        return status == SOSStatus.OPEN;
    }

    public boolean isActive() {
        return status == SOSStatus.OPEN
            || status == SOSStatus.ACKNOWLEDGED
            || status == SOSStatus.RESPONDING;
    }
}