package com.anuraguniversity.smartroute.auth.dto;

import com.anuraguniversity.smartroute.common.enums.UserRole;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoogleLoginRequest {

    @NotBlank(message = "Google ID token is required")
    private String idToken;

    private UserRole role;

    public GoogleLoginRequest(String idToken) {
        this.idToken = idToken;
    }
}
