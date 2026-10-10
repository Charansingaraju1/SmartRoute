package com.anuraguniversity.smartroute.transport.dto;

import com.anuraguniversity.smartroute.transport.entity.Zone;
import com.anuraguniversity.smartroute.transport.entity.Bus;
import com.anuraguniversity.smartroute.transport.entity.Route;
import com.anuraguniversity.smartroute.transport.entity.BoardingPoint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ZoneDTO {
    private UUID id;
    private String name;
    private String code;
    private String description;
    private Integer displayOrder;
    private Boolean active;
    private Instant createdAt;
    private Instant updatedAt;

    public static ZoneDTO from(Zone zone) {
        return ZoneDTO.builder()
                .id(zone.getId())
                .name(zone.getName())
                .code(zone.getCode())
                .description(zone.getDescription())
                .displayOrder(zone.getDisplayOrder())
                .active(zone.getActive())
                .createdAt(zone.getCreatedAt())
                .updatedAt(zone.getUpdatedAt())
                .build();
    }
}