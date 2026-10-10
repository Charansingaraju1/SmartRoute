package com.anuraguniversity.smartroute.transport.repository;

import com.anuraguniversity.smartroute.transport.entity.Zone;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ZoneRepository extends JpaRepository<Zone, java.util.UUID> {

    Optional<Zone> findByCode(String code);

    Optional<Zone> findByName(String name);

    List<Zone> findByActiveTrueOrderByDisplayOrderAsc();

    boolean existsByCode(String code);

    boolean existsByName(String name);
}