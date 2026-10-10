package com.anuraguniversity.smartroute.student.dto;

import com.anuraguniversity.smartroute.student.entity.Student;
import com.anuraguniversity.smartroute.student.entity.MissedBusRequest;
import com.anuraguniversity.smartroute.transport.entity.Bus;
import com.anuraguniversity.smartroute.transport.entity.Route;
import com.anuraguniversity.smartroute.transport.entity.BoardingPoint;
import com.anuraguniversity.smartroute.transport.entity.StudentBusAssignment;
import com.anuraguniversity.smartroute.notification.entity.Notification;
import com.anuraguniversity.smartroute.auth.entity.User;
import com.anuraguniversity.smartroute.common.enums.AssignmentStatus;
import com.anuraguniversity.smartroute.common.enums.Direction;
import com.anuraguniversity.smartroute.common.enums.NotificationType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StudentDTO {

    private UUID id;
    private UUID userId;
    private String studentId;
    private String branch;
    private String classSection;
    private String academicYear;
    private BusInfo bus;
    private RouteInfo route;
    private BoardingPointInfo boardingPoint;
    private Direction direction;
    private LocalTime pickupTime;
    private AssignmentStatus assignmentStatus;
    private Boolean busPassVerified;
    private Instant busPassVerifiedAt;
    private String busPassImageUrl;
    private String qrCode;
    private String emergencyContactName;
    private String emergencyContactPhone;
    private Boolean notificationEmailEnabled;
    private Boolean notificationPushEnabled;
    private Boolean notificationInAppEnabled;
    private Boolean sosNotificationEnabled;
    private Instant createdAt;
    private Instant updatedAt;

    public static StudentDTO from(Student student) {
        return StudentDTO.builder()
                .id(student.getId())
                .userId(student.getUser().getId())
                .studentId(student.getStudentId())
                .branch(student.getBranch())
                .classSection(student.getClassSection())
                .academicYear(student.getAcademicYear())
                .bus(student.getBus() != null ? BusInfo.from(student.getBus()) : null)
                .route(student.getRoute() != null ? RouteInfo.from(student.getRoute()) : null)
                .boardingPoint(student.getBoardingPoint() != null ? BoardingPointInfo.from(student.getBoardingPoint()) : null)
                .direction(student.getDirection())
                .pickupTime(student.getPickupTime())
                .assignmentStatus(student.getAssignmentStatus())
                .busPassVerified(student.getBusPassVerified())
                .busPassVerifiedAt(student.getBusPassVerifiedAt())
                .busPassImageUrl(student.getBusPassImageUrl())
                .qrCode(student.getQrCode())
                .emergencyContactName(student.getEmergencyContactName())
                .emergencyContactPhone(student.getEmergencyContactPhone())
                .notificationEmailEnabled(student.getNotificationEmailEnabled())
                .notificationPushEnabled(student.getNotificationPushEnabled())
                .notificationInAppEnabled(student.getNotificationInAppEnabled())
                .sosNotificationEnabled(student.getSosNotificationEnabled())
                .createdAt(student.getCreatedAt())
                .updatedAt(student.getUpdatedAt())
                .build();
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BusInfo {
        private UUID id;
        private String registrationNumber;
        private String busNumber;
        private Integer capacity;
        private Integer currentStudentsCount;
        private Integer availableCapacity;
        private String driverName;
        private String conductorName;

        public static BusInfo from(Bus bus) {
            return BusInfo.builder()
                    .id(bus.getId())
                    .registrationNumber(bus.getRegistrationNumber())
                    .busNumber(bus.getBusNumber())
                    .capacity(bus.getCapacity())
                    .currentStudentsCount(bus.getCurrentStudentsCount())
                    .availableCapacity(bus.getAvailableCapacity())
                    .driverName(bus.getDriverName())
                    .conductorName(bus.getConductorName())
                    .build();
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RouteInfo {
        private UUID id;
        private String routeCode;
        private String routeName;
        private Direction direction;
        private String startingPoint;
        private LocalTime startingTime;
        private String endingPoint;
        private LocalTime endingTime;
        private BigDecimal feeAmount;

        public static RouteInfo from(Route route) {
            return RouteInfo.builder()
                    .id(route.getId())
                    .routeCode(route.getRouteCode())
                    .routeName(route.getRouteName())
                    .direction(route.getDirection())
                    .startingPoint(route.getStartingPoint())
                    .startingTime(route.getStartingTime())
                    .endingPoint(route.getEndingPoint())
                    .endingTime(route.getEndingTime())
                    .feeAmount(route.getFeeAmount())
                    .build();
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BoardingPointInfo {
        private UUID id;
        private String stopName;
        private String stopDescription;
        private Integer stopOrder;
        private LocalTime stopTime;
        private BigDecimal latitude;
        private BigDecimal longitude;
        private String landmark;

        public static BoardingPointInfo from(BoardingPoint bp) {
            return BoardingPointInfo.builder()
                    .id(bp.getId())
                    .stopName(bp.getStopName())
                    .stopDescription(bp.getStopDescription())
                    .stopOrder(bp.getStopOrder())
                    .stopTime(bp.getStopTime())
                    .latitude(bp.getLatitude())
                    .longitude(bp.getLongitude())
                    .landmark(bp.getLandmark())
                    .build();
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AssignmentInfo {
        private UUID id;
        private UUID studentId;
        private UUID busId;
        private UUID routeId;
        private UUID boardingPointId;
        private Direction direction;
        private AssignmentStatus status;
        private LocalDate startDate;
        private LocalDate endDate;
        private UUID assignedBy;
        private String assignmentNotes;

        public static AssignmentInfo from(StudentBusAssignment assignment) {
            return AssignmentInfo.builder()
                    .id(assignment.getId())
                    .studentId(assignment.getStudent().getId())
                    .busId(assignment.getBus().getId())
                    .routeId(assignment.getRoute().getId())
                    .boardingPointId(assignment.getBoardingPoint() != null ? assignment.getBoardingPoint().getId() : null)
                    .direction(assignment.getDirection())
                    .status(assignment.getStatus())
                    .startDate(assignment.getStartDate())
                    .endDate(assignment.getEndDate())
                    .assignedBy(assignment.getAssignedBy())
                    .assignmentNotes(assignment.getAssignmentNotes())
                    .build();
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StudentAssignmentDTO {
        private UUID studentId;
        private AssignmentInfo morningAssignment;
        private AssignmentInfo eveningAssignment;
        private List<AssignmentInfo> allActiveAssignments;

        public static StudentAssignmentDTO from(Student student, StudentBusAssignment morningAssignment, 
                List<StudentBusAssignment> activeAssignments) {
            return StudentAssignmentDTO.builder()
                    .studentId(student.getId())
                    .morningAssignment(morningAssignment != null ? AssignmentInfo.from(morningAssignment) : null)
                    .eveningAssignment(null) // Could be enhanced to find evening assignment
                    .allActiveAssignments(activeAssignments.stream().map(AssignmentInfo::from).collect(Collectors.toList()))
                    .build();
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NotificationDTO {
        private UUID id;
        private NotificationType type;
        private String title;
        private String message;
        private Boolean read;
        private Instant readAt;
        private Instant createdAt;
        private String actionUrl;

        public static NotificationDTO from(Notification notification) {
            return NotificationDTO.builder()
                    .id(notification.getId())
                    .type(notification.getType())
                    .title(notification.getTitle())
                    .message(notification.getMessage())
                    .read(notification.getRead())
                    .readAt(notification.getReadAt())
                    .createdAt(notification.getCreatedAt())
                    .actionUrl(notification.getActionUrl())
                    .build();
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MissedBusDTO {
        private UUID id;
        private UUID studentId;
        private UUID originalBusId;
        private UUID alternativeBusId;
        private String status;
        private Instant requestedAt;
        private Instant acknowledgedAt;
        private Instant resolvedAt;
        private String studentNotes;
        private String teacherNotes;
        private Double studentLocationLat;
        private Double studentLocationLng;
        private Instant studentLocationAt;

        public static MissedBusDTO from(MissedBusRequest request) {
            return MissedBusDTO.builder()
                    .id(request.getId())
                    .studentId(request.getStudent().getId())
                    .originalBusId(request.getOriginalBus() != null ? request.getOriginalBus().getId() : null)
                    .alternativeBusId(request.getAlternativeBus() != null ? request.getAlternativeBus().getId() : null)
                    .status(request.getStatus() != null ? request.getStatus().name() : null)
                    .requestedAt(request.getRequestedAt())
                    .acknowledgedAt(request.getAcknowledgedAt())
                    .resolvedAt(request.getResolvedAt())
                    .studentNotes(request.getStudentNotes())
                    .teacherNotes(request.getTeacherNotes())
                    .studentLocationLat(request.getStudentLocationLat())
                    .studentLocationLng(request.getStudentLocationLng())
                    .studentLocationAt(request.getStudentLocationAt())
                    .build();
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateMissedBusRequest {
        private UUID originalBusId;
        private String notes;
        private Double locationLat;
        private Double locationLng;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SOSDTO {
        private UUID id;
        private UUID studentId;
        private String category;
        private String status;
        private String description;
        private BigDecimal latitude;
        private BigDecimal longitude;
        private Instant triggeredAt;
        private Instant acknowledgedAt;
        private Instant resolvedAt;
        private String resolutionNotes;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BusPassDTO {
        private Boolean verified;
        private Instant verifiedAt;
        private String imageUrl;
        private String qrCode;
        private String ocrExtractedData;

        public static BusPassDTO from(Student student) {
            return BusPassDTO.builder()
                    .verified(student.getBusPassVerified())
                    .verifiedAt(student.getBusPassVerifiedAt())
                    .imageUrl(student.getBusPassImageUrl())
                    .qrCode(student.getQrCode())
                    .build();
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateBusPassRequest {
        private String busPassImageUrl;
        private String qrCode;
        private String ocrExtractedData;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class GPSDTO {
        private UUID studentId;
        private BigDecimal latitude;
        private BigDecimal longitude;
        private Double accuracy;
        private Instant recordedAt;
        private String source;

        public static GPSDTO from(Student student) {
            // This would typically come from the latest location record
            return GPSDTO.builder()
                    .studentId(student.getId())
                    .build();
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LocationUpdateRequest {
        private BigDecimal latitude;
        private BigDecimal longitude;
        private Double accuracy;
        private Double altitude;
        private Double speed;
        private Double heading;
        private String source;
    }
}