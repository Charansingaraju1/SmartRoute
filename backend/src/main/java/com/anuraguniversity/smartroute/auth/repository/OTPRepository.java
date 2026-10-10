package com.anuraguniversity.smartroute.auth.repository;

import com.anuraguniversity.smartroute.auth.entity.OTP;
import com.anuraguniversity.smartroute.common.enums.OTPType;
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
public interface OTPRepository extends JpaRepository<OTP, java.util.UUID> {

    Optional<OTP> findFirstByEmailAndTypeOrderByCreatedAtDesc(String email, OTPType type);

    @Query("SELECT o FROM OTP o WHERE o.email = :email AND o.type = :type AND o.used = false AND o.expiresAt > :now ORDER BY o.createdAt DESC")
    Optional<OTP> findValidOTP(@Param("email") String email, @Param("type") OTPType type, @Param("now") Instant now);

    @Query("SELECT o FROM OTP o WHERE o.email = :email AND o.type = :type AND o.createdAt >= :since")
    List<OTP> findRecentByEmailAndType(@Param("email") String email, @Param("type") OTPType type, @Param("since") Instant since);

    long countByEmailAndTypeAndCreatedAtAfter(String email, OTPType type, Instant since);

    @Modifying
    @Transactional
    @Query("DELETE FROM OTP o WHERE o.expiresAt < :now")
    void deleteExpired(@Param("now") Instant now);

    @Modifying
    @Transactional
    @Query("UPDATE OTP o SET o.used = true, o.usedAt = :now WHERE o.id = :id")
    void markAsUsed(@Param("id") java.util.UUID id, @Param("now") Instant now);
}