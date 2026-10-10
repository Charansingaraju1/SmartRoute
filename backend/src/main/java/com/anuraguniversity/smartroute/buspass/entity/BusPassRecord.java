package com.anuraguniversity.smartroute.buspass.entity;

import com.anuraguniversity.smartroute.common.entity.BaseEntity;
import com.anuraguniversity.smartroute.student.entity.Student;
import com.anuraguniversity.smartroute.transport.entity.Bus;
import com.anuraguniversity.smartroute.transport.entity.Route;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(
    name = "bus_pass_records",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_bus_pass_student_active", columnNames = {"student_id", "status"})
    },
    indexes = {
        @Index(name = "idx_bus_pass_student", columnList = "student_id"),
        @Index(name = "idx_bus_pass_bus", columnList = "bus_id"),
        @Index(name = "idx_bus_pass_route", columnList = "route_id"),
        @Index(name = "idx_bus_pass_status", columnList = "status"),
        @Index(name = "idx_bus_pass_dates", columnList = "valid_from, valid_until")
    }
)
@Getter
@Setter
public class BusPassRecord extends BaseEntity {

    public enum Status {
        ACTIVE,
        EXPIRED,
        REVOKED,
        PENDING_VERIFICATION,
        REJECTED
    }

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bus_id")
    private Bus bus;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "route_id")
    private Route route;

    @Column(name = "status", nullable = false, length = 30)
    private String status = Status.PENDING_VERIFICATION.name();

    @Column(name = "valid_from", nullable = false)
    private java.time.LocalDate validFrom;

    @Column(name = "valid_until")
    private java.time.LocalDate validUntil;

    @Size(max = 100)
    @Column(name = "pass_number", length = 100)
    private String passNumber;

    @Size(max = 500)
    @Column(name = "image_url", length = 500)
    private String imageUrl;

    @Size(max = 500)
    @Column(name = "qr_code_data", length = 500)
    private String qrCodeData;

    @Size(max = 1000)
    @Column(name = "ocr_extracted_data", length = 1000)
    private String ocrExtractedData;

    @Column(name = "verified_at")
    private java.time.Instant verifiedAt;

    @Column(name = "verified_by")
    private java.util.UUID verifiedBy;

    @Size(max = 500)
    @Column(name = "verification_notes", length = 500)
    private String verificationNotes;

    @Size(max = 500)
    @Column(name = "rejection_reason", length = 500)
    private String rejectionReason;

    @Column(name = "academic_year", length = 20)
    private String academicYear;

    @Column(name = "fee_paid", nullable = false)
    private Boolean feePaid = false;

    @Column(name = "fee_amount")
    private java.math.BigDecimal feeAmount;

    @Column(name = "payment_record_id")
    private java.util.UUID paymentRecordId;

    public boolean isValid() {
        return Status.ACTIVE.name().equals(status)
            && !validFrom.isAfter(java.time.LocalDate.now())
            && (validUntil == null || !validUntil.isBefore(java.time.LocalDate.now()));
    }
}