package com.anuraguniversity.smartroute.auth.dto;

import com.anuraguniversity.smartroute.common.enums.OTPType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResendOTPRequest {

    @NotBlank
    @Email
    @Size(max = 255)
    private String email;

    @NotNull
    private OTPType type;
}