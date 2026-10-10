package com.anuraguniversity.smartroute.common.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ErrorResponse {

    @JsonFormat(shape = JsonFormat.Shape.STRING)
    private Instant timestamp;

    private int status;
    private String error;
    private String message;
    private String path;
    private Map<String, String> validationErrors;
    private String traceId;

    public static ErrorResponse of(int status, String error, String message, String path) {
        return ErrorResponse.builder()
            .timestamp(Instant.now())
            .status(status)
            .error(error)
            .message(message)
            .path(path)
            .build();
    }
}