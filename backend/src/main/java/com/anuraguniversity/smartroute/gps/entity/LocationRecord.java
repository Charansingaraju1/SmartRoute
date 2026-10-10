package com.anuraguniversity.smartroute.gps.entity;

import com.anuraguniversity.smartroute.common.entity.BaseEntity;
import com.anuraguniversity.smartroute.student.entity.Student;
import com.anuraguniversity.smartroute.transport.entity.Bus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(
    name = "location_records",
    indexes = {
        @Index(name = "idx_location_student", columnList = "student_id"),
        @Index(name = "idx_location_bus", columnList = "bus_id"),
        @Index(name = "idx_location_recorded_at", columnList = "recorded_at"),
        @Index(name = "idx_location_student_time", columnList = "student_id, recorded_at")
    }
)
@Getter
@Setter
public class LocationRecord extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id")
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bus_id")
    private Bus bus;

    @Column(name = "latitude", nullable = false, precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(name = "longitude", nullable = false, precision = 10, scale = 7)
    private BigDecimal longitude;

    @Column(name = "accuracy")
    private Double accuracy;

    @Column(name = "altitude")
    private Double altitude;

    @Column(name = "speed")
    private Double speed;

    @Column(name = "heading")
    private Double heading;

    @Column(name = "recorded_at", nullable = false)
    private java.time.Instant recordedAt;

    @Column(name = "source", length = 20)
    private String source;

    public static LocationRecord fromStudent(Student student, BigDecimal lat, BigDecimal lng, Double accuracy, String source) {
        LocationRecord record = new LocationRecord();
        record.setStudent(student);
        record.setLatitude(lat);
        record.setLongitude(lng);
        record.setAccuracy(accuracy);
        record.setRecordedAt(java.time.Instant.now());
        record.setSource(source);
        return record;
    }

    public static LocationRecord fromBus(Bus bus, BigDecimal lat, BigDecimal lng, Double accuracy, String source) {
        LocationRecord record = new LocationRecord();
        record.setBus(bus);
        record.setLatitude(lat);
        record.setLongitude(lng);
        record.setAccuracy(accuracy);
        record.setRecordedAt(java.time.Instant.now());
        record.setSource(source);
        return record;
    }
}