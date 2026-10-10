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
    name = "zones",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_zones_name", columnNames = "name"),
        @UniqueConstraint(name = "uk_zones_code", columnNames = "code")
    },
    indexes = {
        @Index(name = "idx_zones_name", columnList = "name"),
        @Index(name = "idx_zones_code", columnList = "code")
    }
)
@Getter
@Setter
public class Zone extends BaseEntity {

    @NotBlank
    @Size(max = 100)
    @Column(name = "name", nullable = false, unique = true, length = 100)
    private String name;

    @NotBlank
    @Size(max = 20)
    @Column(name = "code", nullable = false, unique = true, length = 20)
    private String code;

    @Size(max = 255)
    @Column(name = "description", length = 255)
    private String description;

    @Column(name = "display_order")
    private Integer displayOrder = 0;

    @Column(name = "active", nullable = false)
    private Boolean active = true;

    public static Zone create(String name, String code, String description, int displayOrder) {
        Zone zone = new Zone();
        zone.setName(name);
        zone.setCode(code);
        zone.setDescription(description);
        zone.setDisplayOrder(displayOrder);
        zone.setActive(true);
        return zone;
    }
}