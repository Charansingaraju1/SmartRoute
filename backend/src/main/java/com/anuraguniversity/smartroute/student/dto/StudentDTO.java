package com.anuraguniversity.smartroute.student.dto;

import com.anuraguniversity.smartroute.student.entity.Student;
import com.anuraguniversity.smartroute.student.entity.MissedBusRequest;
import com.anuraguniversity.smartroute.buspass.entity.BusPassRecord;
import com.anuraguniversity.smartroute.transport.entity.Bus;
import com.anuraguniversity.smartroute.transport.entity.Route;
import com.anuraguniversity.smartroute.transport.entity.BoardingPoint;
import com.anuraguniversity.smartroute.transport.entity.StudentBusAssignment;
import com.anuraguniversity.smartroute.notification.entity.Notification;
import com.anuraguniversity.smartroute.auth.entity.User;
import com.anuraguniversity.smartroute.sos.entity.SOSRequest;
import com.anuraguniversity.smartroute.gps.entity.LocationRecord;
import com.anuraguniversity.smartroute.common.enums.AssignmentStatus;
import com.anuraguniversity.smartroute.common.enums.Direction;
import com.anuraguniversity.smartroute.common.enums.NotificationType;
import com.anuraguniversity.smartroute.common.enums.SOSCategory;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
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
        private String driverPhone;
        private String conductorName;
        private String conductorPhone;
        private Boolean active;
        private RouteInfo route;

        public static BusInfo from(Bus bus) {
            return from(bus, null);
        }

        public static BusInfo from(Bus bus, Route route) {
            if (bus == null) return null;
            return BusInfo.builder()
                    .id(bus.getId())
                    .registrationNumber(bus.getRegistrationNumber())
                    .busNumber(bus.getBusNumber())
                    .capacity(bus.getCapacity())
                    .currentStudentsCount(bus.getCurrentStudentsCount())
                    .availableCapacity(bus.getAvailableCapacity())
                    .driverName(bus.getDriverName())
                    .driverPhone(bus.getDriverPhone())
                    .conductorName(bus.getConductorName())
                    .conductorPhone(bus.getConductorPhone())
                    .active(bus.getActive())
                    .route(route != null ? RouteInfo.from(route) : null)
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
        private String description;
        private Double distanceKm;
        private Integer estimatedDurationMinutes;
        private BigDecimal feeAmount;
        private Boolean active;
        private ZoneSummary zone;
        private BusSummary bus;
        private List<BoardingPointInfo> boardingPoints;

        public static RouteInfo from(Route route) {
            if (route == null) return null;
            List<BoardingPointInfo> bpList = null;
            try {
                if (route.getBoardingPoints() != null) {
                    bpList = route.getBoardingPoints().stream().map(BoardingPointInfo::from).collect(Collectors.toList());
                }
            } catch (Exception ignored) {}

            return RouteInfo.builder()
                    .id(route.getId())
                    .routeCode(route.getRouteCode())
                    .routeName(route.getRouteName())
                    .direction(route.getDirection())
                    .startingPoint(route.getStartingPoint())
                    .startingTime(route.getStartingTime())
                    .endingPoint(route.getEndingPoint())
                    .endingTime(route.getEndingTime())
                    .description(route.getDescription())
                    .distanceKm(route.getDistanceKm())
                    .estimatedDurationMinutes(route.getEstimatedDurationMinutes())
                    .feeAmount(route.getFeeAmount())
                    .active(route.getActive())
                    .zone(route.getZone() != null ? ZoneSummary.builder()
                            .id(route.getZone().getId())
                            .name(route.getZone().getName())
                            .code(route.getZone().getCode())
                            .build() : null)
                    .bus(route.getBus() != null ? BusSummary.builder()
                            .id(route.getBus().getId())
                            .registrationNumber(route.getBus().getRegistrationNumber())
                            .capacity(route.getBus().getCapacity())
                            .currentStudentsCount(route.getBus().getCurrentStudentsCount())
                            .build() : null)
                    .boardingPoints(bpList)
                    .build();
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ZoneSummary {
        private UUID id;
        private String name;
        private String code;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BusSummary {
        private UUID id;
        private String registrationNumber;
        private Integer capacity;
        private Integer currentStudentsCount;
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
        private Boolean active;
        private RouteInfo route;

        public static BoardingPointInfo from(BoardingPoint bp) {
            if (bp == null) return null;
            return BoardingPointInfo.builder()
                    .id(bp.getId())
                    .stopName(bp.getStopName())
                    .stopDescription(bp.getStopDescription())
                    .stopOrder(bp.getStopOrder())
                    .stopTime(bp.getStopTime())
                    .latitude(bp.getLatitude())
                    .longitude(bp.getLongitude())
                    .landmark(bp.getLandmark())
                    .active(bp.getActive())
                    .build();
        }

        public static BoardingPointInfo from(BoardingPoint bp, Route route) {
            if (bp == null) return null;
            BoardingPointInfo info = from(bp);
            if (route != null) {
                info.setRoute(RouteInfo.from(route));
            }
            return info;
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
        private BusInfo bus;
        private RouteInfo route;
        private BoardingPointInfo boardingPoint;

        public static StudentAssignmentDTO from(Student student, StudentBusAssignment morningAssignment,
                List<StudentBusAssignment> activeAssignments) {
            Bus assignedBus = morningAssignment != null ? morningAssignment.getBus() : student.getBus();
            Route assignedRoute = morningAssignment != null ? morningAssignment.getRoute() : student.getRoute();
            BoardingPoint assignedBoardingPoint = morningAssignment != null ? morningAssignment.getBoardingPoint() : student.getBoardingPoint();

            if (assignedBus == null && activeAssignments != null && !activeAssignments.isEmpty()) {
                assignedBus = activeAssignments.get(0).getBus();
            }
            if (assignedRoute == null && activeAssignments != null && !activeAssignments.isEmpty()) {
                assignedRoute = activeAssignments.get(0).getRoute();
            }
            if (assignedBoardingPoint == null && activeAssignments != null && !activeAssignments.isEmpty()) {
                assignedBoardingPoint = activeAssignments.get(0).getBoardingPoint();
            }

            if (assignedRoute != null && assignedBus == null && assignedRoute.getBus() != null) {
                assignedBus = assignedRoute.getBus();
            }

            return StudentAssignmentDTO.builder()
                    .studentId(student.getId())
                    .morningAssignment(morningAssignment != null ? AssignmentInfo.from(morningAssignment) : null)
                    .eveningAssignment(null)
                    .allActiveAssignments(activeAssignments != null
                            ? activeAssignments.stream().map(AssignmentInfo::from).collect(Collectors.toList())
                            : List.of())
                    .bus(assignedBus != null ? BusInfo.from(assignedBus, assignedRoute) : null)
                    .route(assignedRoute != null ? RouteInfo.from(assignedRoute) : null)
                    .boardingPoint(assignedBoardingPoint != null ? BoardingPointInfo.from(assignedBoardingPoint, assignedRoute) : null)
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

        public static SOSDTO from(SOSRequest sos) {
            return SOSDTO.builder()
                    .id(sos.getId())
                    .studentId(sos.getStudent().getId())
                    .category(sos.getCategory().name())
                    .status(sos.getStatus().name())
                    .description(sos.getDescription())
                    .latitude(sos.getLatitude())
                    .longitude(sos.getLongitude())
                    .triggeredAt(sos.getTriggeredAt())
                    .acknowledgedAt(sos.getAcknowledgedAt())
                    .resolvedAt(sos.getResolvedAt())
                    .resolutionNotes(sos.getResolutionNotes())
                    .build();
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateSOSRequest {
        @NotNull
        private SOSCategory category;

        @Size(max = 500)
        private String description;

        @DecimalMin(value = "-90.0")
        @DecimalMax(value = "90.0")
        private BigDecimal latitude;

        @DecimalMin(value = "-180.0")
        @DecimalMax(value = "180.0")
        private BigDecimal longitude;

        @DecimalMin(value = "0.0")
        private Double locationAccuracy;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BusPassDTO {
        private UUID id;
        private String status;
        private LocalDate validFrom;
        private LocalDate validUntil;
        private String passNumber;
        private Boolean verified;
        private Instant verifiedAt;
        private UUID verifiedBy;
        private String imageUrl;
        private String qrCode;
        private String qrCodeData;
        private String ocrExtractedData;
        private String verificationNotes;
        private String rejectionReason;
        private String academicYear;
        private Boolean feePaid;
        private BigDecimal feeAmount;
        private UUID paymentRecordId;
        private BusInfo bus;
        private RouteInfo route;
        private BoardingPointInfo boardingPoint;
        private RouteInfo studentAssignedRoute;
        private BusInfo studentAssignedBus;

        public static BusPassDTO from(Student student, BusPassRecord record) {
            if (record != null) {
                // Strict isolation: The bus pass record's route and bus reflect only what is recognized
                // and verified on the document, NEVER silently falling back to the student's existing assignment!
                Bus passBus = record.getBus();
                Route passRoute = record.getRoute();
                String passNo = com.anuraguniversity.smartroute.buspass.service.BusPassRecognitionService.canonicalizePassNumber(record.getPassNumber());

                return BusPassDTO.builder()
                        .id(record.getId())
                        .status(record.getStatus() != null ? record.getStatus() : "PENDING_VERIFICATION")
                        .validFrom(record.getValidFrom())
                        .validUntil(record.getValidUntil())
                        .passNumber(passNo)
                        .verified("ACTIVE".equalsIgnoreCase(record.getStatus()))
                        .verifiedAt(record.getVerifiedAt() != null ? record.getVerifiedAt() : null)
                        .verifiedBy(record.getVerifiedBy())
                        .imageUrl(record.getImageUrl() != null ? record.getImageUrl() : student.getBusPassImageUrl())
                        .qrCode(student.getQrCode())
                        .qrCodeData(record.getQrCodeData() != null ? record.getQrCodeData() : student.getQrCode())
                        .ocrExtractedData(record.getOcrExtractedData())
                        .verificationNotes(record.getVerificationNotes())
                        .rejectionReason(record.getRejectionReason())
                        .academicYear(record.getAcademicYear() != null ? record.getAcademicYear() : student.getAcademicYear())
                        .feePaid(Boolean.TRUE.equals(record.getFeePaid()))
                        .feeAmount(record.getFeeAmount())
                        .paymentRecordId(record.getPaymentRecordId())
                        .bus(passBus != null ? BusInfo.from(passBus) : null)
                        .route(passRoute != null ? RouteInfo.from(passRoute) : null)
                        .boardingPoint(student.getBoardingPoint() != null ? BoardingPointInfo.from(student.getBoardingPoint()) : null)
                        .studentAssignedRoute(student.getRoute() != null ? RouteInfo.from(student.getRoute()) : null)
                        .studentAssignedBus(student.getBus() != null ? BusInfo.from(student.getBus()) : null)
                        .build();
            }

            // Fallback from student entity if no separate record exists yet
            boolean hasPass = student.getBusPassImageUrl() != null || Boolean.TRUE.equals(student.getBusPassVerified());
            if (!hasPass && student.getBus() == null) {
                return null;
            }

            boolean isVerified = Boolean.TRUE.equals(student.getBusPassVerified());
            String status = isVerified ? "ACTIVE" : "PENDING_VERIFICATION";
            String passNo = com.anuraguniversity.smartroute.buspass.service.BusPassRecognitionService.canonicalizePassNumber(
                    student.getStudentId() != null ? student.getStudentId() : null);

            return BusPassDTO.builder()
                    .id(student.getId())
                    .status(status)
                    .validFrom(student.getCreatedAt() != null ? LocalDate.ofInstant(student.getCreatedAt(), java.time.ZoneId.systemDefault()) : LocalDate.now())
                    .validUntil(LocalDate.now().plusMonths(6))
                    .passNumber(passNo)
                    .verified(isVerified)
                    .verifiedAt(student.getBusPassVerifiedAt())
                    .imageUrl(student.getBusPassImageUrl())
                    .qrCode(student.getQrCode())
                    .qrCodeData(student.getQrCode())
                    .academicYear(student.getAcademicYear())
                    .feePaid(isVerified)
                    .feeAmount(student.getRoute() != null ? student.getRoute().getFeeAmount() : null)
                    .bus(isVerified && student.getBus() != null ? BusInfo.from(student.getBus()) : null)
                    .route(isVerified && student.getRoute() != null ? RouteInfo.from(student.getRoute()) : null)
                    .boardingPoint(student.getBoardingPoint() != null ? BoardingPointInfo.from(student.getBoardingPoint()) : null)
                    .studentAssignedRoute(student.getRoute() != null ? RouteInfo.from(student.getRoute()) : null)
                    .studentAssignedBus(student.getBus() != null ? BusInfo.from(student.getBus()) : null)
                    .build();
        }

        public static BusPassDTO from(Student student) {
            return from(student, null);
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
            return GPSDTO.builder()
                    .studentId(student.getId())
                    .build();
        }

        public static GPSDTO from(LocationRecord location) {
            return GPSDTO.builder()
                    .studentId(location.getStudent().getId())
                    .latitude(location.getLatitude())
                    .longitude(location.getLongitude())
                    .accuracy(location.getAccuracy())
                    .recordedAt(location.getRecordedAt())
                    .source(location.getSource())
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
