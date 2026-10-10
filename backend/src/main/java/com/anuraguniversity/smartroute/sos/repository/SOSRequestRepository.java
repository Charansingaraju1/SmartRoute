package com.anuraguniversity.smartroute.sos.repository;

import com.anuraguniversity.smartroute.sos.entity.SOSRequest;
import com.anuraguniversity.smartroute.common.enums.SOSStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;

@Repository
public interface SOSRequestRepository extends JpaRepository<SOSRequest, java.util.UUID> {

    List<SOSRequest> findByStudentIdOrderByTriggeredAtDesc(java.util.UUID studentId);

    Page<SOSRequest> findAll(Pageable pageable);

    List<SOSRequest> findByStatus(SOSStatus status);

    List<SOSRequest> findByCategory(com.anuraguniversity.smartroute.common.enums.SOSCategory category);

    @Query("SELECT s FROM SOSRequest s WHERE s.status IN ('OPEN', 'ACKNOWLEDGED', 'RESPONDING')")
    List<SOSRequest> findAllActive();

    @Query("SELECT s FROM SOSRequest s WHERE s.student.bus.id = :busId AND s.status IN ('OPEN', 'ACKNOWLEDGED', 'RESPONDING')")
    List<SOSRequest> findActiveByBus(@Param("busId") java.util.UUID busId);

    @Query("SELECT s FROM SOSRequest s WHERE s.triggeredAt >= :since ORDER BY s.triggeredAt DESC")
    List<SOSRequest> findSince(@Param("since") Instant since);

    long countByStatusIn(java.util.List<SOSStatus> statuses);
}