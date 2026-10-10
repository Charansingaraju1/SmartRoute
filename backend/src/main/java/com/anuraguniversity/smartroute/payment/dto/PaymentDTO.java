package com.anuraguniversity.smartroute.payment.dto;

import com.anuraguniversity.smartroute.payment.entity.PaymentRecord;
import com.anuraguniversity.smartroute.common.enums.PaymentMethod;
import com.anuraguniversity.smartroute.common.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentDTO {

    private UUID id;
    private UUID userId;
    private String orderId;
    private String gatewayTransactionId;
    private String gatewayOrderId;
    private String gatewayPaymentId;
    private PaymentMethod method;
    private PaymentStatus status;
    private BigDecimal amount;
    private String currency;
    private String description;
    private String feeType;
    private String academicYear;
    private Instant initiatedAt;
    private Instant completedAt;
    private Instant failedAt;
    private String failureReason;
    private String gatewayResponseCode;
    private Instant webhookReceivedAt;
    private Boolean webhookVerified;
    private String gatewayResponse;
    private BigDecimal refundAmount;
    private Instant refundedAt;
    private String refundId;

    public static PaymentDTO from(PaymentRecord payment) {
        return PaymentDTO.builder()
                .id(payment.getId())
                .userId(payment.getUser() != null ? payment.getUser().getId() : null)
                .orderId(payment.getOrderId())
                .gatewayTransactionId(payment.getGatewayTransactionId())
                .gatewayOrderId(payment.getGatewayOrderId())
                .gatewayPaymentId(payment.getGatewayPaymentId())
                .method(payment.getMethod())
                .status(payment.getStatus())
                .amount(payment.getAmount())
                .currency(payment.getCurrency())
                .description(payment.getDescription())
                .feeType(payment.getFeeType())
                .academicYear(payment.getAcademicYear())
                .initiatedAt(payment.getInitiatedAt())
                .completedAt(payment.getCompletedAt())
                .failedAt(payment.getFailedAt())
                .failureReason(payment.getFailureReason())
                .gatewayResponseCode(payment.getGatewayResponseCode())
                .webhookReceivedAt(payment.getWebhookReceivedAt())
                .webhookVerified(payment.getWebhookVerified())
                .gatewayResponse(payment.getGatewayResponse())
                .refundAmount(payment.getRefundAmount())
                .refundedAt(payment.getRefundedAt())
                .refundId(payment.getRefundId())
                .build();
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class InitiatePaymentRequest {
        private PaymentMethod method;
        private BigDecimal amount;
        private String description;
        private String feeType;
        private String academicYear;
    }
}