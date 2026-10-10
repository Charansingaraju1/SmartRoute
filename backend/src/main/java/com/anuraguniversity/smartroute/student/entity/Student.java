package com.anuraguniversity.smartroute.student.entity;

import com.anuraguniversity.smartroute.auth.entity.User;
import com.anuraguniversity.smartroute.common.entity.BaseEntity;
import com.anuraguniversity.smartroute.common.enums.AssignmentStatus;
import com.anuraguniversity.smartroute.common.enums.Direction;
import com.anuraguniversity.smartroute.transport.entity.Bus;
import com.anuraguniversity.smartroute.transport.entity.BoardingPoint;
import com.anuraguniversity.smartroute.transport.entity.Route;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(
    name = "students",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_students_user", columnNames = "user_id"),
        @UniqueConstraint(name = "uk_students_student_id", columnNames = "student_id")
    },
    indexes = {
        @Index(name = "idx_students_user", columnList = "user_id"),
        @Index(name = "idx_students_student_id", columnList = "student_id"),
        @Index(name = "idx_students_bus", columnList = "bus_id"),
        @Index(name = "idx_students_route", columnList = "route_id"),
        @Index(name = "idx_students_boarding_point", columnList = "boarding_point_id")
    }
)
@Getter
@Setter
public class Student extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Size(max = 50)
    @Column(name = "student_id", unique = true, length = 50)
    private String studentId;

    @Size(max = 100)
    @Column(name = "branch", length = 100)
    private String branch;

    @Size(max = 50)
    @Column(name = "class_section", length = 50)
    private String classSection;

    @Column(name = "academic_year", length = 20)
    private String academicYear;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bus_id")
    private Bus bus;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "route_id")
    private Route route;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "boarding_point_id")
    private BoardingPoint boardingPoint;

    @Enumerated(EnumType.STRING)
    @Column(name = "direction", length = 20)
    private Direction direction;

    @Column(name = "pickup_time")
    private java.time.LocalTime pickupTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "assignment_status", length = 20)
    private AssignmentStatus assignmentStatus;

    @Column(name = "bus_pass_verified", nullable = false)
    private Boolean busPassVerified = false;

    @Column(name = "bus_pass_verified_at")
    private java.time.Instant busPassVerifiedAt;

    @Column(name = "bus_pass_image_url", length = 500)
    private String busPassImageUrl;

    @Column(name = "qr_code", length = 255)
    private String qrCode;

    @Column(name = "emergency_contact_name", length = 100)
    private String emergencyContactName;

    @Column(name = "emergency_contact_phone", length = 20)
    private String emergencyContactPhone;

    @Column(name = "push_subscription_id")
    private java.util.UUID pushSubscriptionId;

    @Column(name = "notification_email_enabled", nullable = false)
    private Boolean notificationEmailEnabled = true;

    @Column(name = "notification_push_enabled", nullable = false)
    private Boolean notificationPushEnabled = true;

    @Column(name = "notification_in_app_enabled", nullable = false)
    private Boolean notificationInAppEnabled = true;

    @Column(name = "sos_notification_enabled", nullable = false)
    private Boolean sosNotificationEnabled = true;
}