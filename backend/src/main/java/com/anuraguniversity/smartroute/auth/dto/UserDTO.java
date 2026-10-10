package com.anuraguniversity.smartroute.auth.dto;

import com.anuraguniversity.smartroute.auth.entity.User;
import com.anuraguniversity.smartroute.common.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {

    private UUID id;
    private String name;
    private String email;
    private UserRole role;
    private Boolean active;
    private Boolean emailVerified;
    private Instant lastLoginAt;
    private Instant createdAt;

    public static UserDTO from(User user) {
        return UserDTO.builder()
            .id(user.getId())
            .name(user.getName())
            .email(user.getEmail())
            .role(user.getRole())
            .active(user.getActive())
            .emailVerified(user.getEmailVerified())
            .lastLoginAt(user.getLastLoginAt())
            .createdAt(user.getCreatedAt())
            .build();
    }
}