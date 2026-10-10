package com.anuraguniversity.smartroute.payment.controller;

import com.anuraguniversity.smartroute.payment.dto.PaymentDTO;
import com.anuraguniversity.smartroute.payment.entity.PaymentRecord;
import com.anuraguniversity.smartroute.payment.repository.PaymentRecordRepository;
import com.anuraguniversity.smartroute.auth.entity.User;
import com.anuraguniversity.smartroute.common.dto.ApiResponse;
import com.anuraguniversity.smartroute.common.enums.PaymentMethod;
import com.anuraguniversity.smartroute.common.enums.PaymentStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@RestController
@RequestMapping("/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentRecordRepository paymentRecordRepository;

    @GetMapping("/student/payments")
    public ResponseEntity<ApiResponse<Page<PaymentDTO>>> getPaymentHistory(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("initiatedAt").descending());
        Page<PaymentRecord> payments = paymentRecordRepository.findByUserIdOrderByInitiatedAtDesc(user.getId(), pageable);
        Page<PaymentDTO> paymentDTOs = payments.map(PaymentDTO::from);
        return ResponseEntity.ok(ApiResponse.success(paymentDTOs));
    }

    @PostMapping("/initiate")
    public ResponseEntity<ApiResponse<PaymentDTO>> initiatePayment(
            @AuthenticationPrincipal User user,
            @RequestBody PaymentDTO.InitiatePaymentRequest request) {
        
        PaymentRecord payment = new PaymentRecord();
        payment.setUser(user);
        payment.setOrderId("ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        payment.setMethod(request.getMethod() != null ? request.getMethod() : PaymentMethod.UPI);
        payment.setStatus(PaymentStatus.PENDING);
        payment.setAmount(request.getAmount() != null ? request.getAmount() : BigDecimal.ZERO);
        payment.setCurrency("INR");
        payment.setDescription(request.getDescription());
        payment.setFeeType(request.getFeeType());
        payment.setAcademicYear(request.getAcademicYear());
        payment.setInitiatedAt(Instant.now());

        payment = paymentRecordRepository.save(payment);

        return ResponseEntity.ok(ApiResponse.success(PaymentDTO.from(payment), "Payment initiated. Complete payment through your preferred method."));
    }
}