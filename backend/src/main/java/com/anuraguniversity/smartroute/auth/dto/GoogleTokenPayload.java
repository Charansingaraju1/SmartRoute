package com.anuraguniversity.smartroute.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoogleTokenPayload {

    private String email;
    private String name;
    private String sub;
    private boolean emailVerified;
}
