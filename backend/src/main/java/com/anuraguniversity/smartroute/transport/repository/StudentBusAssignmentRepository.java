package com.anuraguniversity.smartroute.transport.repository;

import com.anuraguniversity.smartroute.transport.entity.StudentBusAssignment;
import com.anuraguniversity.smartroute.common.enums.AssignmentStatus;
import com.anuraguniversity.smartroute.common.enums.Direction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface StudentBusAssignmentRepository extends JpaRepository<StudentBusAssignment, java.util.UUID> {

    List<StudentBusAssignment> findByStudentId(java.util.UUID studentId);

    List<StudentBusAssignment> findByStudentIdAndStatus(java.util.UUID studentId, AssignmentStatus status);

    List<StudentBusAssignment> findByBusId(java.util.UUID busId);

    List<StudentBusAssignment> findByRouteId(java.util.UUID routeId);

    @Query("SELECT a FROM StudentBusAssignment a WHERE a.student.id = :studentId AND a.status = 'ACTIVE' AND a.startDate <= :date AND (a.endDate IS NULL OR a.endDate >= :date)")
    Optional<StudentBusAssignment> findActiveAssignmentForStudentOnDate(@Param("studentId") java.util.UUID studentId, @Param("date") LocalDate date);

    @Query("SELECT a FROM StudentBusAssignment a WHERE a.student.id = :studentId AND a.direction = :direction AND a.status = 'ACTIVE'")
    Optional<StudentBusAssignment> findActiveByStudentAndDirection(@Param("studentId") java.util.UUID studentId, @Param("direction") Direction direction);

    @Query("SELECT a FROM StudentBusAssignment a WHERE a.bus.id = :busId AND a.status = 'ACTIVE'")
    List<StudentBusAssignment> findActiveByBus(@Param("busId") java.util.UUID busId);

    @Query("SELECT COUNT(a) FROM StudentBusAssignment a WHERE a.bus.id = :busId AND a.status = 'ACTIVE'")
    long countActiveByBus(@Param("busId") java.util.UUID busId);

    @Query("SELECT a FROM StudentBusAssignment a WHERE a.student.id = :studentId AND a.status IN ('ACTIVE', 'PENDING')")
    List<StudentBusAssignment> findActiveOrPendingByStudent(@Param("studentId") java.util.UUID studentId);
}