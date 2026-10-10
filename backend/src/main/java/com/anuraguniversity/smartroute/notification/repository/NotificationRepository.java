package com.anuraguniversity.smartroute.notification.repository;

import com.anuraguniversity.smartroute.notification.entity.Notification;
import com.anuraguniversity.smartroute.notification.entity.PushSubscription;
import com.anuraguniversity.smartroute.common.enums.NotificationChannel;
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
public interface NotificationRepository extends JpaRepository<Notification, java.util.UUID> {

    List<Notification> findByRecipientIdOrderByCreatedAtDesc(java.util.UUID recipientId);

    Page<Notification> findByRecipientIdOrderByCreatedAtDesc(java.util.UUID recipientId, Pageable pageable);

    List<Notification> findByRecipientIdAndReadFalseOrderByCreatedAtDesc(java.util.UUID recipientId);

    @Query("SELECT n FROM Notification n WHERE n.recipient.id = :recipientId AND n.read = false AND n.channel = :channel")
    List<Notification> findUnreadByRecipientAndChannel(@Param("recipientId") java.util.UUID recipientId, @Param("channel") NotificationChannel channel);

    @Query("SELECT COUNT(n) FROM Notification n WHERE n.recipient.id = :recipientId AND n.read = false")
    long countUnreadByRecipient(@Param("recipientId") java.util.UUID recipientId);

    @Query("SELECT n FROM Notification n WHERE n.recipient.id = :recipientId AND n.createdAt >= :since ORDER BY n.createdAt DESC")
    List<Notification> findByRecipientSince(@Param("recipientId") java.util.UUID recipientId, @Param("since") Instant since);

    @Query("SELECT n FROM Notification n WHERE n.failed = true AND n.retryCount < 3 AND n.createdAt >= :since")
    List<Notification> findFailedForRetry(@Param("since") Instant since);
}

@Repository
interface PushSubscriptionRepository extends JpaRepository<PushSubscription, java.util.UUID> {

    List<PushSubscription> findByUserId(java.util.UUID userId);

    List<PushSubscription> findByUserIdAndActiveTrue(java.util.UUID userId);

    Optional<PushSubscription> findByUserIdAndEndpoint(java.util.UUID userId, String endpoint);

    @Query("SELECT p FROM PushSubscription p WHERE p.active = true AND p.failedDeliveryCount < 3")
    List<PushSubscription> findActiveSubscriptions();

    void deleteByUserId(java.util.UUID userId);
}