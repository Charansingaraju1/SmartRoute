package com.anuraguniversity.smartroute.teacher.entity;

import com.anuraguniversity.smartroute.auth.entity.User;
import com.anuraguniversity.smartroute.common.entity.BaseEntity;
import com.anuraguniversity.smartroute.transport.entity.Bus;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(
    name = "teachers",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_teachers_user", columnNames = "user_id"),
        @UniqueConstraint(name = "uk_teachers_employee_id", columnNames = "employee_id")
    },
    indexes = {
        @Index(name = "idx_teachers_user", columnList = "user_id"),
        @Index(name = "idx_teachers_employee_id", columnList = "employee_id"),
        @Index(name = "idx_teachers_department", columnList = "department"),
        @Index(name = "idx_teachers_bus", columnList = "bus_id")
    }
)
@Getter
@Setter
public class Teacher extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Size(max = 50)
    @Column(name = "employee_id", unique = true, length = 50)
    private String employeeId;

    @Size(max = 100)
    @Column(name = "department", length = 100)
    private String department;

    @Size(max = 100)
    @Column(name = "designation", length = 100)
    private String designation;

    @Column(name = "phone", length = 20)
    private String phone;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bus_id")
    private Bus assignedBus;

    @Column(name = "can_publish_location", nullable = false)
    private Boolean canPublishLocation = false;

    @Column(name = "can_publish_delays", nullable = false)
    private Boolean canPublishDelays = false;

    @Column(name = "can_publish_disruptions", nullable = false)
    private Boolean canPublishDisruptions = false;

    @Column(name = "can_manage_assignments", nullable = false)
    private Boolean canManageAssignments = false;

    @Column(name = "push_subscription_id")
    private java.util.UUID pushSubscriptionId;

    @Column(name = "notification_email_enabled", nullable = false)
    private Boolean notificationEmailEnabled = true;

    @Column(name = "notification_push_enabled", nullable = false)
    private Boolean notificationPushEnabled = true;

    @Column(name = "notification_in_app_enabled", nullable = false)
    private Boolean notificationInAppEnabled = true;

    @OneToMany(mappedBy = "teacher", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<TeacherBusAssignment> busAssignments = new HashSet<>();

    public void addBusAssignment(TeacherBusAssignment assignment) {
        busAssignments.add(assignment);
        assignment.setTeacher(this);
    }

    public void removeBusAssignment(TeacherBusAssignment assignment) {
        busAssignments.remove(assignment);
        assignment.setTeacher(null);
    }
}