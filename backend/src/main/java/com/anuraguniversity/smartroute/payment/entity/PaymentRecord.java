package com.anuraguniversity.smartroute.payment.entity;

import com.anuraguniversity.smartroute.auth.entity.User;
import com.anuraguniversity.smartroute.common.entity.BaseEntity;
import com.anuraguniversity.smartroute.common.enums.PaymentMethod;
import com.anuraguniversity.smartroute.common.enums.PaymentStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(
    name = "payment_records",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_payment_gateway_ref", columnNames = "gateway_transaction_id")
    },
    indexes = {
        @Index(name = "idx_payment_user", columnList = "user_id"),
        @Index(name = "idx_payment_gateway_ref", columnList = "gateway_transaction_id"),
        @Index(name = "idx_payment_order_id", columnList = "order_id"),
        @Index(name = "idx_payment_status", columnList = "status"),
        @Index(name = "idx_payment_created_at", columnList = "created_at"),
        @Index(name = "idx_payment_completed_at", columnList = "completed_at")
    }
)
@Getter
@Setter
public class PaymentRecord extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Size(max = 100)
    @Column(name = "order_id", nullable = false, unique = true, length = 100)
    private String orderId;

    @Size(max = 100)
    @Column(name = "gateway_transaction_id", unique = true, length = 100)
    private String gatewayTransactionId;

    @Size(max = 100)
    @Column(name = "gateway_order_id", length = 100)
    private String gatewayOrderId;

    @Size(max = 100)
    @Column(name = "gateway_payment_id", length = 100)
    private String gatewayPaymentId;

    @Enumerated(EnumType.STRING)
    @Column(name = "method", length = 20)
    private PaymentMethod method;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private PaymentStatus status = PaymentStatus.PENDING;

    @Column(name = "amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(name = "currency", nullable = false, length = 3)
    private String currency = "INR";

    @Size(max = 500)
    @Column(name = "description", length = 500)
    private String description;

    @Size(max = 100)
    @Column(name = "fee_type", length = 100)
    private String feeType;

    @Column(name = "academic_year", length = 20)
    private String academicYear;

    @Column(name = "initiated_at", nullable = false)
    private java.time.Instant initiatedAt;

    @Column(name = "completed_at")
    private java.time.Instant completedAt;

    @Column(name = "failed_at")
    private java.time.Instant failedAt;

    @Size(max = 500)
    @Column(name = "failure_reason", length = 500)
    private String failureReason;

    @Size(max = 100)
    @Column(name = "gateway_response_code", length = 100)
    private String gatewayResponseCode;

    @Column(name = "webhook_received_at")
    private java.time.Instant webhookReceivedAt;

    @Column(name = "webhook_verified", nullable = false)
    private Boolean webhookVerified = false;

    @Size(max = 2000)
    @Column(name = "gateway_response", length = 2000)
    private String gatewayResponse;

    @Column(name = "refund_amount", precision = 10, scale = 2)
    private BigDecimal refundAmount;

    @Column(name = "refunded_at")
    private java.time.Instant refundedAt;

    @Size(max = 100)
    @Column(name = "refund_id", length = 100)
    private String refundId;

    public boolean isSuccessful() {
        return status == PaymentStatus.SUCCESS;
    }

    public boolean isTerminal() {
        return status == PaymentStatus.SUCCESS
            || status == PaymentStatus.FAILED
            || status == PaymentStatus.CANCELLED
            || status == PaymentStatus.REFUNDED;
    }
}