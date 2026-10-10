package com.anuraguniversity.smartroute.teacher.repository;

import com.anuraguniversity.smartroute.teacher.entity.TeacherBusAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeacherBusAssignmentRepository extends JpaRepository<TeacherBusAssignment, java.util.UUID> {

    List<TeacherBusAssignment> findByTeacherId(java.util.UUID teacherId);

    List<TeacherBusAssignment> findByBusId(java.util.UUID busId);

    Optional<TeacherBusAssignment> findByTeacherIdAndBusId(java.util.UUID teacherId, java.util.UUID busId);

    boolean existsByTeacherIdAndBusId(java.util.UUID teacherId, java.util.UUID busId);

    List<TeacherBusAssignment> findByTeacherIdAndIsPrimaryTrue(java.util.UUID teacherId);

    List<TeacherBusAssignment> findByBusIdAndCanPublishLocationTrue(java.util.UUID busId);

    List<TeacherBusAssignment> findByBusIdAndCanPublishDelaysTrue(java.util.UUID busId);

    List<TeacherBusAssignment> findByBusIdAndCanPublishDisruptionsTrue(java.util.UUID busId);
}