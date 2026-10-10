package com.anuraguniversity.smartroute.teacher.entity;

import com.anuraguniversity.smartroute.common.entity.BaseEntity;
import com.anuraguniversity.smartroute.transport.entity.Bus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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
    name = "teacher_bus_assignments",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_teacher_bus_assignment", columnNames = {"teacher_id", "bus_id"})
    },
    indexes = {
        @Index(name = "idx_teacher_bus_assignment_teacher", columnList = "teacher_id"),
        @Index(name = "idx_teacher_bus_assignment_bus", columnList = "bus_id")
    }
)
@Getter
@Setter
public class TeacherBusAssignment extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "teacher_id", nullable = false)
    private Teacher teacher;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "bus_id", nullable = false)
    private Bus bus;

    @Column(name = "is_primary", nullable = false)
    private Boolean isPrimary = false;

    @Column(name = "can_publish_location", nullable = false)
    private Boolean canPublishLocation = false;

    @Column(name = "can_publish_delays", nullable = false)
    private Boolean canPublishDelays = false;

    @Column(name = "can_publish_disruptions", nullable = false)
    private Boolean canPublishDisruptions = false;
}