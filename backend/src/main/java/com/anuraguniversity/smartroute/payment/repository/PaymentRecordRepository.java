package com.anuraguniversity.smartroute.payment.repository;

import com.anuraguniversity.smartroute.payment.entity.PaymentRecord;
import com.anuraguniversity.smartroute.common.enums.PaymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRecordRepository extends JpaRepository<PaymentRecord, java.util.UUID> {

    List<PaymentRecord> findByUserIdOrderByInitiatedAtDesc(java.util.UUID userId);

    Page<PaymentRecord> findByUserIdOrderByInitiatedAtDesc(java.util.UUID userId, Pageable pageable);

    List<PaymentRecord> findByUserIdAndStatus(java.util.UUID userId, PaymentStatus status);

    Optional<PaymentRecord> findByOrderId(String orderId);

    Optional<PaymentRecord> findByGatewayTransactionId(String gatewayTransactionId);

    Optional<PaymentRecord> findByGatewayOrderId(String gatewayOrderId);

    List<PaymentRecord> findByStatus(PaymentStatus status);

    @Query("SELECT p FROM PaymentRecord p WHERE p.user.id = :userId AND p.status IN ('PENDING', 'CREATED', 'PROCESSING')")
    List<PaymentRecord> findPendingByUser(@Param("userId") java.util.UUID userId);

    @Query("SELECT p FROM PaymentRecord p WHERE p.webhookVerified = false AND p.status IN ('SUCCESS', 'FAILED') AND p.initiatedAt >= :since")
    List<PaymentRecord> findUnverifiedWebhooks(@Param("since") Instant since);

    long countByUserIdAndStatus(java.util.UUID userId, PaymentStatus status);
}