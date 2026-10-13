package com.anuraguniversity.smartroute.teacher.controller;

import com.anuraguniversity.smartroute.teacher.dto.TeacherDTO;
import com.anuraguniversity.smartroute.teacher.service.TeacherService;
import com.anuraguniversity.smartroute.common.dto.ApiResponse;
import com.anuraguniversity.smartroute.notification.entity.Notification;
import com.anuraguniversity.smartroute.notification.repository.NotificationRepository;
import lombok.Data;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.anuraguniversity.smartroute.auth.entity.User;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/teacher")
@PreAuthorize("hasRole('TEACHER')")
@RequiredArgsConstructor
public class TeacherController {

    private final TeacherService teacherService;
    private final NotificationRepository notificationRepository;

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<TeacherDTO>> getProfile(@AuthenticationPrincipal User user) {
        TeacherDTO profile = teacherService.getTeacherProfile(user.getId());
        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<TeacherDTO>> updateProfile(
            @AuthenticationPrincipal User user,
            @RequestBody TeacherDTO.UpdateProfileRequest request) {
        TeacherDTO updated = teacherService.updateTeacherProfile(user.getId(), request);
        return ResponseEntity.ok(ApiResponse.success(updated, "Profile updated successfully"));
    }

    @GetMapping("/buses")
    public ResponseEntity<ApiResponse<List<TeacherDTO.BusInfo>>> getBuses(@AuthenticationPrincipal User user) {
        List<TeacherDTO.BusInfo> buses = teacherService.getTeacherBuses(user.getId());
        return ResponseEntity.ok(ApiResponse.success(buses));
    }

    @GetMapping("/bus/{busId}/students")
    public ResponseEntity<ApiResponse<List<TeacherDTO.PassengerInfo>>> getBusStudents(
            @AuthenticationPrincipal User user,
            @PathVariable UUID busId) {
        List<TeacherDTO.PassengerInfo> students = teacherService.getBusStudents(user.getId(), busId);
        return ResponseEntity.ok(ApiResponse.success(students));
    }

    @GetMapping("/missed-bus")
    public ResponseEntity<ApiResponse<Page<TeacherDTO.MissedBusDTO>>> getMissedBusRequests(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<TeacherDTO.MissedBusDTO> requests = teacherService.getTeacherMissedBusRequests(user.getId(), page, size);
        return ResponseEntity.ok(ApiResponse.success(requests));
    }

    @PostMapping("/missed-bus/{id}/acknowledge")
    public ResponseEntity<ApiResponse<TeacherDTO.MissedBusDTO>> acknowledgeMissedBusRequest(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id) {
        TeacherDTO.MissedBusDTO acknowledged = teacherService.acknowledgeMissedBusRequest(user.getId(), id);
        return ResponseEntity.ok(ApiResponse.success(acknowledged, "Missed bus request acknowledged"));
    }

    @PostMapping("/missed-bus/{id}/alternative")
    public ResponseEntity<ApiResponse<TeacherDTO.MissedBusDTO>> assignAlternativeBus(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id,
            @RequestBody TeacherDTO.CreateMissedBusRequest request) {
        TeacherDTO.MissedBusDTO updated = teacherService.assignAlternativeBus(user.getId(), id, request.getAlternativeBusId(), request.getNotes());
        return ResponseEntity.ok(ApiResponse.success(updated, "Alternative bus assigned"));
    }

    @PostMapping("/missed-bus/{id}/resolve")
    public ResponseEntity<ApiResponse<TeacherDTO.MissedBusDTO>> resolveMissedBusRequest(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id) {
        TeacherDTO.MissedBusDTO resolved = teacherService.resolveMissedBusRequest(user.getId(), id);
        return ResponseEntity.ok(ApiResponse.success(resolved, "Missed bus request resolved"));
    }

    @GetMapping("/delays")
    public ResponseEntity<ApiResponse<Page<TeacherDTO.DelayDTO>>> getDelays(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<TeacherDTO.DelayDTO> delays = teacherService.getTeacherDelays(user.getId(), page, size);
        return ResponseEntity.ok(ApiResponse.success(delays));
    }

    @PostMapping("/delays")
    public ResponseEntity<ApiResponse<TeacherDTO.DelayDTO>> createDelay(
            @AuthenticationPrincipal User user,
            @RequestBody TeacherDTO.CreateDelayRequest request) {
        TeacherDTO.DelayDTO delay = teacherService.createDelay(user.getId(), request);
        return ResponseEntity.ok(ApiResponse.success(delay, "Delay published"));
    }

    @PostMapping("/delays/{id}/acknowledge")
    public ResponseEntity<ApiResponse<TeacherDTO.DelayDTO>> acknowledgeDelay(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id) {
        TeacherDTO.DelayDTO delay = teacherService.acknowledgeDelay(user.getId(), id);
        return ResponseEntity.ok(ApiResponse.success(delay, "Delay acknowledged"));
    }

    @PostMapping("/delays/{id}/resolve")
    public ResponseEntity<ApiResponse<TeacherDTO.DelayDTO>> resolveDelay(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id) {
        TeacherDTO.DelayDTO delay = teacherService.resolveDelay(user.getId(), id);
        return ResponseEntity.ok(ApiResponse.success(delay, "Delay resolved"));
    }

    @GetMapping("/disruptions")
    public ResponseEntity<ApiResponse<Page<TeacherDTO.DisruptionDTO>>> getDisruptions(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<TeacherDTO.DisruptionDTO> disruptions = teacherService.getTeacherDisruptions(user.getId(), page, size);
        return ResponseEntity.ok(ApiResponse.success(disruptions));
    }

    @PostMapping("/disruptions")
    public ResponseEntity<ApiResponse<TeacherDTO.DisruptionDTO>> createDisruption(
            @AuthenticationPrincipal User user,
            @RequestBody TeacherDTO.CreateDisruptionRequest request) {
        TeacherDTO.DisruptionDTO disruption = teacherService.createDisruption(user.getId(), request);
        return ResponseEntity.ok(ApiResponse.success(disruption, "Disruption published"));
    }

    @PostMapping("/disruptions/{id}/acknowledge")
    public ResponseEntity<ApiResponse<TeacherDTO.DisruptionDTO>> acknowledgeDisruption(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id) {
        TeacherDTO.DisruptionDTO disruption = teacherService.acknowledgeDisruption(user.getId(), id);
        return ResponseEntity.ok(ApiResponse.success(disruption, "Disruption acknowledged"));
    }

    @PostMapping("/disruptions/{id}/resolve")
    public ResponseEntity<ApiResponse<TeacherDTO.DisruptionDTO>> resolveDisruption(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id) {
        TeacherDTO.DisruptionDTO disruption = teacherService.resolveDisruption(user.getId(), id);
        return ResponseEntity.ok(ApiResponse.success(disruption, "Disruption resolved"));
    }

    @GetMapping("/sos")
    public ResponseEntity<ApiResponse<Page<TeacherDTO.SOSDTO>>> getSOSRequests(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<TeacherDTO.SOSDTO> sosRequests = teacherService.getTeacherSOSRequests(user.getId(), page, size);
        return ResponseEntity.ok(ApiResponse.success(sosRequests));
    }

    @PostMapping("/sos/{id}/acknowledge")
    public ResponseEntity<ApiResponse<TeacherDTO.SOSDTO>> acknowledgeSOS(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id) {
        TeacherDTO.SOSDTO sos = teacherService.acknowledgeSOS(user.getId(), id);
        return ResponseEntity.ok(ApiResponse.success(sos, "SOS acknowledged"));
    }

    @PostMapping("/sos/{id}/respond")
    public ResponseEntity<ApiResponse<TeacherDTO.SOSDTO>> respondToSOS(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id) {
        TeacherDTO.SOSDTO sos = teacherService.respondToSOS(user.getId(), id);
        return ResponseEntity.ok(ApiResponse.success(sos, "SOS response initiated"));
    }

    @PostMapping("/sos/{id}/resolve")
    public ResponseEntity<ApiResponse<TeacherDTO.SOSDTO>> resolveSOS(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id,
            @RequestBody TeacherDTO.ResolveSOSRequest request) {
        TeacherDTO.SOSDTO sos = teacherService.resolveSOS(user.getId(), id, request.getNotes());
        return ResponseEntity.ok(ApiResponse.success(sos, "SOS resolved"));
    }

    @GetMapping("/transport-ops")
    public ResponseEntity<ApiResponse<TeacherDTO.TransportOpsDTO>> getTransportOpsDashboard(
            @AuthenticationPrincipal User user) {
        TeacherDTO.TransportOpsDTO dashboard = teacherService.getTransportOpsDashboard(user.getId());
        return ResponseEntity.ok(ApiResponse.success(dashboard));
    }

    @GetMapping("/assignments")
    public ResponseEntity<ApiResponse<List<TeacherDTO.AssignmentDTO>>> getAssignments(
            @AuthenticationPrincipal User user) {
        List<TeacherDTO.AssignmentDTO> assignments = teacherService.getTeacherAssignments(user.getId());
        return ResponseEntity.ok(ApiResponse.success(assignments));
    }

    @GetMapping("/students")
    public ResponseEntity<ApiResponse<List<TeacherDTO.StudentSummary>>> getStudents(
            @AuthenticationPrincipal User user) {
        List<TeacherDTO.StudentSummary> students = teacherService.getEligibleStudents(user.getId());
        return ResponseEntity.ok(ApiResponse.success(students));
    }

    @PostMapping("/assignments")
    public ResponseEntity<ApiResponse<TeacherDTO.AssignmentDTO>> createAssignment(
            @AuthenticationPrincipal User user,
            @RequestBody TeacherDTO.CreateAssignmentRequest request) {
        TeacherDTO.AssignmentDTO assignment = teacherService.createAssignment(user.getId(), request);
        return ResponseEntity.ok(ApiResponse.success(assignment, "Bus assignment created successfully"));
    }

    @PutMapping("/assignments/{id}")
    public ResponseEntity<ApiResponse<TeacherDTO.AssignmentDTO>> updateAssignment(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id,
            @RequestBody TeacherDTO.UpdateAssignmentRequest request) {
        TeacherDTO.AssignmentDTO assignment = teacherService.updateAssignment(user.getId(), id, request);
        return ResponseEntity.ok(ApiResponse.success(assignment, "Bus assignment updated successfully"));
    }

    @DeleteMapping("/assignments/{id}")
    public ResponseEntity<ApiResponse<TeacherDTO.AssignmentDTO>> cancelAssignment(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id,
            @RequestParam(required = false, defaultValue = "Removed by teacher") String reason) {
        TeacherDTO.AssignmentDTO assignment = teacherService.cancelAssignment(user.getId(), id, reason);
        return ResponseEntity.ok(ApiResponse.success(assignment, "Student assignment removed successfully"));
    }

    @PostMapping("/assignments/{id}/cancel")
    public ResponseEntity<ApiResponse<TeacherDTO.AssignmentDTO>> cancelAssignmentPost(
            @AuthenticationPrincipal User user,
            @PathVariable UUID id,
            @RequestParam(required = false, defaultValue = "Removed by teacher") String reason) {
        TeacherDTO.AssignmentDTO assignment = teacherService.cancelAssignment(user.getId(), id, reason);
        return ResponseEntity.ok(ApiResponse.success(assignment, "Student assignment removed successfully"));
    }

    /**
     * Returns notifications for the authenticated teacher, scoped to their own
     * recipient ID. Uses the same Notification entity and repository as student
     * notifications â€” only the JWT-derived user ID differs.
     */
    @GetMapping("/notifications")
    public ResponseEntity<ApiResponse<Page<Notification>>> getNotifications(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        var pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Notification> notifications = notificationRepository
                .findByRecipientIdOrderByCreatedAtDesc(user.getId(), pageable);
        return ResponseEntity.ok(ApiResponse.success(notifications));
    }
}
