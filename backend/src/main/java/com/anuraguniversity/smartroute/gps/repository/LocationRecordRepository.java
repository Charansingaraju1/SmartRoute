package com.anuraguniversity.smartroute.gps.repository;

import com.anuraguniversity.smartroute.gps.entity.LocationRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface LocationRecordRepository extends JpaRepository<LocationRecord, java.util.UUID> {

    List<LocationRecord> findByStudentIdOrderByRecordedAtDesc(java.util.UUID studentId);

    List<LocationRecord> findByBusIdOrderByRecordedAtDesc(java.util.UUID busId);

    @Query("SELECT l FROM LocationRecord l WHERE l.student.id = :studentId AND l.recordedAt >= :since ORDER BY l.recordedAt DESC")
    List<LocationRecord> findByStudentSince(@Param("studentId") java.util.UUID studentId, @Param("since") Instant since);

    @Query("SELECT l FROM LocationRecord l WHERE l.bus.id = :busId AND l.recordedAt >= :since ORDER BY l.recordedAt DESC")
    List<LocationRecord> findByBusSince(@Param("busId") java.util.UUID busId, @Param("since") Instant since);

    @Query("SELECT l FROM LocationRecord l WHERE l.student.id = :studentId ORDER BY l.recordedAt DESC")
    Optional<LocationRecord> findLatestByStudent(@Param("studentId") java.util.UUID studentId);

    @Query("SELECT l FROM LocationRecord l WHERE l.bus.id = :busId ORDER BY l.recordedAt DESC")
    Optional<LocationRecord> findLatestByBus(@Param("busId") java.util.UUID busId);

    @Modifying
    @Transactional
    @Query("DELETE FROM LocationRecord l WHERE l.recordedAt < :cutoff")
    void deleteOlderThan(@Param("cutoff") Instant cutoff);
}