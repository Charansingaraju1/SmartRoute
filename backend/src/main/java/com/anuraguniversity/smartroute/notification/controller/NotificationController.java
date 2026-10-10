package com.anuraguniversity.smartroute.notification.controller;

import com.anuraguniversity.smartroute.notification.entity.Notification;
import com.anuraguniversity.smartroute.notification.repository.NotificationRepository;
import com.anuraguniversity.smartroute.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.anuraguniversity.smartroute.auth.entity.User;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepository notificationRepository;

    @PostMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new com.anuraguniversity.smartroute.common.exception.ResourceNotFoundException("Notification not found"));

        if (!notification.getRecipient().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body(ApiResponse.error("Access denied"));
        }

        notification.markAsRead();
        notificationRepository.save(notification);
        return ResponseEntity.ok(ApiResponse.success(null, "Notification marked as read"));
    }

    @PostMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(@AuthenticationPrincipal User user) {
        List<Notification> unreadNotifications = notificationRepository.findByRecipientIdAndReadFalseOrderByCreatedAtDesc(user.getId());
        for (Notification notification : unreadNotifications) {
            notification.markAsRead();
        }
        notificationRepository.saveAll(unreadNotifications);
        return ResponseEntity.ok(ApiResponse.success(null, "All notifications marked as read"));
    }
}