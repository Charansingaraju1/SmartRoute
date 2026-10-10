package com.anuraguniversity.smartroute.teacher.repository;

import com.anuraguniversity.smartroute.teacher.entity.Teacher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeacherRepository extends JpaRepository<Teacher, java.util.UUID> {

    Optional<Teacher> findByUserId(java.util.UUID userId);

    Optional<Teacher> findByEmployeeId(String employeeId);

    List<Teacher> findByAssignedBusId(java.util.UUID busId);

    List<Teacher> findByDepartment(String department);

    @Query("SELECT t FROM Teacher t WHERE t.assignedBus.id = :busId AND t.canPublishLocation = true")
    List<Teacher> findLocationPublishersByBusId(@Param("busId") java.util.UUID busId);

    boolean existsByEmployeeId(String employeeId);
}