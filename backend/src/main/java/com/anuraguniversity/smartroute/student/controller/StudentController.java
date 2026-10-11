package com.anuraguniversity.smartroute.student.controller;

import com.anuraguniversity.smartroute.student.dto.StudentDTO;
import com.anuraguniversity.smartroute.student.service.StudentService;
import com.anuraguniversity.smartroute.common.dto.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import com.anuraguniversity.smartroute.auth.entity.User;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/student")
@PreAuthorize("hasRole('STUDENT')")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<StudentDTO>> getProfile(@AuthenticationPrincipal User user) {
        StudentDTO profile = studentService.getStudentProfile(user.getId());
        return ResponseEntity.ok(ApiResponse.success(profile));
    }

    @GetMapping("/assignment")
    public ResponseEntity<ApiResponse<StudentDTO.StudentAssignmentDTO>> getAssignment(@AuthenticationPrincipal User user) {
        StudentDTO.StudentAssignmentDTO assignment = studentService.getStudentAssignment(user.getId());
        return ResponseEntity.ok(ApiResponse.success(assignment));
    }

    @GetMapping("/bus")
    public ResponseEntity<ApiResponse<List<StudentDTO.BusInfo>>> getBusInfo(@AuthenticationPrincipal User user) {
        List<StudentDTO.BusInfo> busInfo = studentService.getStudentBusInfo(user.getId());
        return ResponseEntity.ok(ApiResponse.success(busInfo));
    }

    @GetMapping("/notifications")
    public ResponseEntity<ApiResponse<Page<StudentDTO.NotificationDTO>>> getNotifications(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<StudentDTO.NotificationDTO> notifications = studentService.getStudentNotifications(user.getId(), page, size);
        return ResponseEntity.ok(ApiResponse.success(notifications));
    }

    @GetMapping("/missed-bus")
    public ResponseEntity<ApiResponse<List<StudentDTO.MissedBusDTO>>> getMissedBusRequests(@AuthenticationPrincipal User user) {
        List<StudentDTO.MissedBusDTO> requests = studentService.getStudentMissedBusRequests(user.getId());
        return ResponseEntity.ok(ApiResponse.success(requests));
    }

    @PostMapping("/missed-bus")
    public ResponseEntity<ApiResponse<StudentDTO.MissedBusDTO>> createMissedBusRequest(
            @AuthenticationPrincipal User user,
            @RequestBody StudentDTO.CreateMissedBusRequest request) {
        StudentDTO.MissedBusDTO created = studentService.createMissedBusRequest(user.getId(), request);
        return ResponseEntity.ok(ApiResponse.success(created, "Missed bus request submitted successfully"));
    }

    @GetMapping("/sos")
    public ResponseEntity<ApiResponse<List<StudentDTO.SOSDTO>>> getSOSRequests(@AuthenticationPrincipal User user) {
        List<StudentDTO.SOSDTO> sosRequests = studentService.getStudentSOSRequests(user.getId());
        return ResponseEntity.ok(ApiResponse.success(sosRequests));
    }

    @PostMapping("/sos")
    public ResponseEntity<ApiResponse<StudentDTO.SOSDTO>> createSOSRequest(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody StudentDTO.CreateSOSRequest request) {
        StudentDTO.SOSDTO created = studentService.createSOSRequest(user.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(created, "SOS request submitted"));
    }

    @GetMapping("/bus-pass")
    public ResponseEntity<ApiResponse<StudentDTO.BusPassDTO>> getBusPass(@AuthenticationPrincipal User user) {
        StudentDTO.BusPassDTO busPass = studentService.getStudentBusPass(user.getId());
        return ResponseEntity.ok(ApiResponse.success(busPass));
    }

    @PutMapping("/bus-pass")
    public ResponseEntity<ApiResponse<StudentDTO.BusPassDTO>> updateBusPass(
            @AuthenticationPrincipal User user,
            @RequestBody StudentDTO.UpdateBusPassRequest request) {
        StudentDTO.BusPassDTO updated = studentService.updateBusPass(user.getId(), request);
        return ResponseEntity.ok(ApiResponse.success(updated, "Bus pass updated successfully"));
    }

    @PostMapping("/bus-pass")
    public ResponseEntity<ApiResponse<StudentDTO.BusPassDTO>> uploadBusPass(
            @AuthenticationPrincipal User user,
            @RequestParam("image") org.springframework.web.multipart.MultipartFile image) {
        // Handle file upload for bus pass image
        // This would save the file and update the student's bus pass image URL
        return ResponseEntity.ok(ApiResponse.success(null, "Bus pass upload endpoint - to be implemented"));
    }

    @GetMapping("/gps")
    public ResponseEntity<ApiResponse<StudentDTO.GPSDTO>> getGPS(@AuthenticationPrincipal User user) {
        StudentDTO.GPSDTO gps = studentService.getStudentGPS(user.getId());
        return ResponseEntity.ok(ApiResponse.success(gps));
    }

    @PostMapping("/location")
    public ResponseEntity<ApiResponse<StudentDTO.GPSDTO>> updateLocation(
            @AuthenticationPrincipal User user,
            @RequestBody StudentDTO.LocationUpdateRequest request) {
        StudentDTO.GPSDTO location = studentService.updateStudentLocation(user.getId(), request);
        return ResponseEntity.ok(ApiResponse.success(location, "Location recorded"));
    }
}
