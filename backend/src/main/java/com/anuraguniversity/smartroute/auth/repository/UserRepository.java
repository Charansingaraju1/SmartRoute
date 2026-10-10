package com.anuraguniversity.smartroute.auth.repository;

import com.anuraguniversity.smartroute.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, java.util.UUID> {

    Optional<User> findByEmail(String email);

    @Query("SELECT u FROM User u WHERE u.email = :email AND u.active = true")
    Optional<User> findActiveByEmail(@Param("email") String email);

    boolean existsByEmail(String email);

    long countByRoleAndActiveTrue(com.anuraguniversity.smartroute.common.enums.UserRole role);
}