package com.anuraguniversity.smartroute.transport.repository;

import com.anuraguniversity.smartroute.transport.entity.Bus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BusRepository extends JpaRepository<Bus, java.util.UUID> {

    Optional<Bus> findByRegistrationNumber(String registrationNumber);

    List<Bus> findByActiveTrue();

    List<Bus> findByActiveTrueAndCapacityGreaterThan(int minCapacity);

    @Query("SELECT b FROM Bus b WHERE b.active = true AND b.currentStudentsCount < b.capacity")
    List<Bus> findBusesWithAvailableCapacity();

    @Query("SELECT b FROM Bus b WHERE b.active = true AND (b.currentStudentsCount + :additionalStudents) <= b.capacity")
    List<Bus> findBusesThatCanAccommodate(@Param("additionalStudents") int additionalStudents);

    boolean existsByRegistrationNumber(String registrationNumber);

    long countByActiveTrue();
}