package com.anuraguniversity.smartroute.buspass.repository;

import com.anuraguniversity.smartroute.buspass.entity.BusPassRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BusPassRecordRepository extends JpaRepository<BusPassRecord, java.util.UUID> {

    Optional<BusPassRecord> findByStudentIdAndStatus(java.util.UUID studentId, String status);

    List<BusPassRecord> findByStudentIdOrderByCreatedAtDesc(java.util.UUID studentId);

    List<BusPassRecord> findByBusId(java.util.UUID busId);

    List<BusPassRecord> findByRouteId(java.util.UUID routeId);

    List<BusPassRecord> findByStatus(String status);

    @Query("SELECT b FROM BusPassRecord b WHERE b.student.id = :studentId AND b.status = 'ACTIVE' AND b.validFrom <= :date AND (b.validUntil IS NULL OR b.validUntil >= :date)")
    Optional<BusPassRecord> findActiveForStudentOnDate(@Param("studentId") java.util.UUID studentId, @Param("date") LocalDate date);

    @Query("SELECT b FROM BusPassRecord b WHERE b.bus.id = :busId AND b.status = 'ACTIVE' AND b.validFrom <= :date AND (b.validUntil IS NULL OR b.validUntil >= :date)")
    List<BusPassRecord> findActiveByBusOnDate(@Param("busId") java.util.UUID busId, @Param("date") LocalDate date);

    @Query("SELECT b FROM BusPassRecord b WHERE b.academicYear = :year AND b.status = 'ACTIVE'")
    List<BusPassRecord> findActiveByAcademicYear(@Param("year") String year);
}