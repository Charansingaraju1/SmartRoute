package com.anuraguniversity.smartroute.transport.entity;

import com.anuraguniversity.smartroute.common.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(
    name = "buses",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_buses_registration", columnNames = "registration_number")
    },
    indexes = {
        @Index(name = "idx_buses_registration", columnList = "registration_number"),
        @Index(name = "idx_buses_active", columnList = "active"),
        @Index(name = "idx_buses_capacity", columnList = "capacity")
    }
)
@Getter
@Setter
public class Bus extends BaseEntity {

    @NotBlank
    @Size(max = 20)
    @Column(name = "registration_number", nullable = false, unique = true, length = 20)
    private String registrationNumber;

    @Size(max = 50)
    @Column(name = "bus_number", length = 50)
    private String busNumber;

    @Column(name = "capacity", nullable = false)
    private Integer capacity = 50;

    @Size(max = 100)
    @Column(name = "model", length = 100)
    private String model;

    @Size(max = 50)
    @Column(name = "fuel_type", length = 50)
    private String fuelType;

    @Column(name = "manufacture_year")
    private Integer manufactureYear;

    @Size(max = 100)
    @Column(name = "driver_name", length = 100)
    private String driverName;

    @Size(max = 20)
    @Column(name = "driver_phone", length = 20)
    private String driverPhone;

    @Size(max = 100)
    @Column(name = "conductor_name", length = 100)
    private String conductorName;

    @Size(max = 20)
    @Column(name = "conductor_phone", length = 20)
    private String conductorPhone;

    @Column(name = "active", nullable = false)
    private Boolean active = true;

    @Column(name = "gps_device_id", length = 100)
    private String gpsDeviceId;

    @Column(name = "last_location_lat")
    private Double lastLocationLat;

    @Column(name = "last_location_lng")
    private Double lastLocationLng;

    @Column(name = "last_location_at")
    private java.time.Instant lastLocationAt;

    @Column(name = "current_students_count", nullable = false)
    private Integer currentStudentsCount = 0;

    public int getAvailableCapacity() {
        return capacity - currentStudentsCount;
    }

    public boolean hasAvailableCapacity() {
        return currentStudentsCount < capacity;
    }

    public boolean canAccommodate(int additionalStudents) {
        return (currentStudentsCount + additionalStudents) <= capacity;
    }
    
    public static Bus create(String registrationNumber, String driverName, String conductorName) {
        Bus bus = new Bus();
        bus.setRegistrationNumber(registrationNumber);
        bus.setDriverName(driverName);
        bus.setConductorName(conductorName);
        bus.setCapacity(50);
        bus.setActive(true);
        bus.setCurrentStudentsCount(0);
        return bus;
    }
}