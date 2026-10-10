package com.anuraguniversity.smartroute.student.repository;

import com.anuraguniversity.smartroute.common.enums.AssignmentStatus;
import com.anuraguniversity.smartroute.student.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, java.util.UUID> {

    Optional<Student> findByUserId(java.util.UUID userId);

    Optional<Student> findByStudentId(String studentId);

    List<Student> findByBusId(java.util.UUID busId);

    List<Student> findByRouteId(java.util.UUID routeId);

    List<Student> findByBoardingPointId(java.util.UUID boardingPointId);

    @Query("SELECT s FROM Student s WHERE s.bus.id = :busId AND s.assignmentStatus = 'ACTIVE'")
    List<Student> findActiveByBusId(@Param("busId") java.util.UUID busId);

    @Query("SELECT s FROM Student s WHERE s.route.id = :routeId AND s.assignmentStatus = 'ACTIVE'")
    List<Student> findActiveByRouteId(@Param("routeId") java.util.UUID routeId);

    boolean existsByStudentId(String studentId);

    long countByBusIdAndAssignmentStatus(java.util.UUID busId, AssignmentStatus status);
}