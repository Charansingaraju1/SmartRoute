package com.anuraguniversity.smartroute.teacher.dto;

import com.anuraguniversity.smartroute.teacher.entity.Teacher;
import com.anuraguniversity.smartroute.teacher.entity.Delay;
import com.anuraguniversity.smartroute.teacher.entity.Disruption;
import com.anuraguniversity.smartroute.teacher.entity.TeacherBusAssignment;
import com.anuraguniversity.smartroute.student.entity.Student;
import com.anuraguniversity.smartroute.student.entity.MissedBusRequest;
import com.anuraguniversity.smartroute.sos.entity.SOSRequest;
import com.anuraguniversity.smartroute.transport.entity.Bus;
import com.anuraguniversity.smartroute.transport.entity.Route;
import com.anuraguniversity.smartroute.transport.entity.StudentBusAssignment;
import com.anuraguniversity.smartroute.common.enums.DelayStatus;
import com.anuraguniversity.smartroute.common.enums.DisruptionStatus;
import com.anuraguniversity.smartroute.common.enums.DisruptionType;
import com.anuraguniversity.smartroute.common.enums.MissedBusStatus;
import com.anuraguniversity.smartroute.common.enums.SOSStatus;
import com.anuraguniversity.smartroute.common.enums.Direction;
import com.anuraguniversity.smartroute.common.enums.AssignmentStatus;
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
public class TeacherDTO {

    private UUID id;
    private UUID userId;
    private String employeeId;
    private String department;
    private String designation;
    private String phone;
    private BusInfo assignedBus;
    private Boolean canPublishLocation;
    private Boolean canPublishDelays;
    private Boolean canPublishDisruptions;
    private Boolean canManageAssignments;
    private Instant createdAt;
    private Instant updatedAt;

    public static TeacherDTO from(Teacher teacher) {
        return TeacherDTO.builder()
                .id(teacher.getId())
                .userId(teacher.getUser().getId())
                .employeeId(teacher.getEmployeeId())
                .department(teacher.getDepartment())
                .designation(teacher.getDesignation())
                .phone(teacher.getPhone())
                .assignedBus(teacher.getAssignedBus() != null ? BusInfo.from(teacher.getAssignedBus()) : null)
                .canPublishLocation(teacher.getCanPublishLocation())
                .canPublishDelays(teacher.getCanPublishDelays())
                .canPublishDisruptions(teacher.getCanPublishDisruptions())
                .canManageAssignments(teacher.getCanManageAssignments())
                .createdAt(teacher.getCreatedAt())
                .updatedAt(teacher.getUpdatedAt())
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
        private Boolean isPrimary;
        private Boolean canPublishLocation;
        private Boolean canPublishDelays;
        private Boolean canPublishDisruptions;

        public static BusInfo from(Bus bus, Boolean isPrimary, Boolean canPublishLocation, 
                Boolean canPublishDelays, Boolean canPublishDisruptions) {
            return BusInfo.builder()
                    .id(bus.getId())
                    .registrationNumber(bus.getRegistrationNumber())
                    .busNumber(bus.getBusNumber())
                    .capacity(bus.getCapacity())
                    .currentStudentsCount(bus.getCurrentStudentsCount())
                    .availableCapacity(bus.getAvailableCapacity())
                    .driverName(bus.getDriverName())
                    .conductorName(bus.getConductorName())
                    .isPrimary(isPrimary)
                    .canPublishLocation(canPublishLocation)
                    .canPublishDelays(canPublishDelays)
                    .canPublishDisruptions(canPublishDisruptions)
                    .build();
        }

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
    public static class PassengerInfo {
        private UUID studentId;
        private UUID userId;
        private String name;
        private String email;
        private String studentIdStr;
        private String branch;
        private String classSection;
        private UUID assignmentId;
        private Direction direction;
        private AssignmentStatus status;
        private UUID boardingPointId;
        private String boardingPointName;
        private LocalTime stopTime;

        public static PassengerInfo from(Student student, StudentBusAssignment assignment) {
            return PassengerInfo.builder()
                    .studentId(student.getId())
                    .userId(student.getUser().getId())
                    .name(student.getUser().getName())
                    .email(student.getUser().getEmail())
                    .studentIdStr(student.getStudentId())
                    .branch(student.getBranch())
                    .classSection(student.getClassSection())
                    .assignmentId(assignment.getId())
                    .direction(assignment.getDirection())
                    .status(assignment.getStatus())
                    .boardingPointId(assignment.getBoardingPoint() != null ? assignment.getBoardingPoint().getId() : null)
                    .boardingPointName(assignment.getBoardingPoint() != null ? assignment.getBoardingPoint().getStopName() : null)
                    .stopTime(assignment.getBoardingPoint() != null ? assignment.getBoardingPoint().getStopTime() : null)
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
        private String studentName;
        private String studentEmail;
        private String studentIdStr;
        private UUID originalBusId;
        private String originalBusRegNumber;
        private UUID alternativeBusId;
        private String alternativeBusRegNumber;
        private String status;
        private Instant requestedAt;
        private Instant acknowledgedAt;
        private UUID acknowledgedBy;
        private Instant alternativeAssignedAt;
        private Instant resolvedAt;
        private UUID resolvedBy;
        private String studentNotes;
        private String teacherNotes;

        public static MissedBusDTO from(MissedBusRequest request) {
            return MissedBusDTO.builder()
                    .id(request.getId())
                    .studentId(request.getStudent().getId())
                    .studentName(request.getStudent().getUser().getName())
                    .studentEmail(request.getStudent().getUser().getEmail())
                    .studentIdStr(request.getStudent().getStudentId())
                    .originalBusId(request.getOriginalBus() != null ? request.getOriginalBus().getId() : null)
                    .originalBusRegNumber(request.getOriginalBus() != null ? request.getOriginalBus().getRegistrationNumber() : null)
                    .alternativeBusId(request.getAlternativeBus() != null ? request.getAlternativeBus().getId() : null)
                    .alternativeBusRegNumber(request.getAlternativeBus() != null ? request.getAlternativeBus().getRegistrationNumber() : null)
                    .status(request.getStatus() != null ? request.getStatus().name() : null)
                    .requestedAt(request.getRequestedAt())
                    .acknowledgedAt(request.getAcknowledgedAt())
                    .acknowledgedBy(request.getAcknowledgedBy())
                    .alternativeAssignedAt(request.getAlternativeAssignedAt())
                    .resolvedAt(request.getResolvedAt())
                    .resolvedBy(request.getResolvedBy())
                    .studentNotes(request.getStudentNotes())
                    .teacherNotes(request.getTeacherNotes())
                    .build();
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateMissedBusRequest {
        private UUID originalBusId;
        private UUID alternativeBusId;
        private String notes;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DelayDTO {
        private UUID id;
        private UUID busId;
        private String busRegistrationNumber;
        private UUID routeId;
        private String routeCode;
        private UUID teacherId;
        private String teacherName;
        private String status;
        private Integer delayMinutes;
        private LocalTime expectedArrivalTime;
        private String reason;
        private String notes;
        private Instant publishedAt;
        private Instant acknowledgedAt;
        private Instant resolvedAt;
        private Instant autoExpireAt;

        public static DelayDTO from(Delay delay) {
            return DelayDTO.builder()
                    .id(delay.getId())
                    .busId(delay.getBus().getId())
                    .busRegistrationNumber(delay.getBus().getRegistrationNumber())
                    .routeId(delay.getRoute() != null ? delay.getRoute().getId() : null)
                    .routeCode(delay.getRoute() != null ? delay.getRoute().getRouteCode() : null)
                    .teacherId(delay.getTeacher().getId())
                    .teacherName(delay.getTeacher().getUser().getName())
                    .status(delay.getStatus() != null ? delay.getStatus().name() : null)
                    .delayMinutes(delay.getDelayMinutes())
                    .expectedArrivalTime(delay.getExpectedArrivalTime())
                    .reason(delay.getReason())
                    .notes(delay.getNotes())
                    .publishedAt(delay.getPublishedAt())
                    .acknowledgedAt(delay.getAcknowledgedAt())
                    .resolvedAt(delay.getResolvedAt())
                    .autoExpireAt(delay.getAutoExpireAt())
                    .build();
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateDelayRequest {
        private UUID busId;
        private UUID routeId;
        private Integer delayMinutes;
        private LocalTime expectedArrivalTime;
        private String reason;
        private String notes;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DisruptionDTO {
        private UUID id;
        private UUID busId;
        private String busRegistrationNumber;
        private UUID routeId;
        private String routeCode;
        private UUID teacherId;
        private String teacherName;
        private String type;
        private String status;
        private Instant startTime;
        private Instant endTime;
        private Instant estimatedEndTime;
        private String title;
        private String description;
        private String affectedArea;
        private String alternativeRoute;
        private Instant publishedAt;
        private Instant acknowledgedAt;
        private Instant resolvedAt;
        private Integer severity;

        public static DisruptionDTO from(Disruption disruption) {
            return DisruptionDTO.builder()
                    .id(disruption.getId())
                    .busId(disruption.getBus() != null ? disruption.getBus().getId() : null)
                    .busRegistrationNumber(disruption.getBus() != null ? disruption.getBus().getRegistrationNumber() : null)
                    .routeId(disruption.getRoute() != null ? disruption.getRoute().getId() : null)
                    .routeCode(disruption.getRoute() != null ? disruption.getRoute().getRouteCode() : null)
                    .teacherId(disruption.getTeacher().getId())
                    .teacherName(disruption.getTeacher().getUser().getName())
                    .type(disruption.getType() != null ? disruption.getType().name() : null)
                    .status(disruption.getStatus() != null ? disruption.getStatus().name() : null)
                    .startTime(disruption.getStartTime())
                    .endTime(disruption.getEndTime())
                    .estimatedEndTime(disruption.getEstimatedEndTime())
                    .title(disruption.getTitle())
                    .description(disruption.getDescription())
                    .affectedArea(disruption.getAffectedArea())
                    .alternativeRoute(disruption.getAlternativeRoute())
                    .publishedAt(disruption.getPublishedAt())
                    .acknowledgedAt(disruption.getAcknowledgedAt())
                    .resolvedAt(disruption.getResolvedAt())
                    .severity(disruption.getSeverity())
                    .build();
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateDisruptionRequest {
        private UUID busId;
        private UUID routeId;
        private DisruptionType type;
        private Instant startTime;
        private Instant estimatedEndTime;
        private String title;
        private String description;
        private String affectedArea;
        private String alternativeRoute;
        private Integer severity;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SOSDTO {
        private UUID id;
        private UUID studentId;
        private String studentName;
        private String studentEmail;
        private String studentIdStr;
        private String category;
        private String status;
        private String description;
        private BigDecimal latitude;
        private BigDecimal longitude;
        private Instant triggeredAt;
        private Instant acknowledgedAt;
        private UUID acknowledgedBy;
        private Instant respondingAt;
        private UUID respondingBy;
        private Instant resolvedAt;
        private UUID resolvedBy;
        private String resolutionNotes;

        public static SOSDTO from(SOSRequest sos) {
            return SOSDTO.builder()
                    .id(sos.getId())
                    .studentId(sos.getStudent().getId())
                    .studentName(sos.getStudent().getUser().getName())
                    .studentEmail(sos.getStudent().getUser().getEmail())
                    .studentIdStr(sos.getStudent().getStudentId())
                    .category(sos.getCategory() != null ? sos.getCategory().name() : null)
                    .status(sos.getStatus() != null ? sos.getStatus().name() : null)
                    .description(sos.getDescription())
                    .latitude(sos.getLatitude())
                    .longitude(sos.getLongitude())
                    .triggeredAt(sos.getTriggeredAt())
                    .acknowledgedAt(sos.getAcknowledgedAt())
                    .acknowledgedBy(sos.getAcknowledgedBy())
                    .respondingAt(sos.getRespondingAt())
                    .respondingBy(sos.getRespondingBy())
                    .resolvedAt(sos.getResolvedAt())
                    .resolvedBy(sos.getResolvedBy())
                    .resolutionNotes(sos.getResolutionNotes())
                    .build();
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TransportOpsDTO {
        private long activeDelays;
        private long activeDisruptions;
        private long pendingMissedBusRequests;
        private long activeSOSRequests;
        private int totalAssignedBuses;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AssignmentDTO {
        private UUID id;
        private UUID teacherId;
        private UUID busId;
        private String busRegistrationNumber;
        private Boolean isPrimary;
        private Boolean canPublishLocation;
        private Boolean canPublishDelays;
        private Boolean canPublishDisruptions;

        public static AssignmentDTO from(TeacherBusAssignment assignment) {
            return AssignmentDTO.builder()
                    .id(assignment.getId())
                    .teacherId(assignment.getTeacher().getId())
                    .busId(assignment.getBus().getId())
                    .busRegistrationNumber(assignment.getBus().getRegistrationNumber())
                    .isPrimary(assignment.getIsPrimary())
                    .canPublishLocation(assignment.getCanPublishLocation())
                    .canPublishDelays(assignment.getCanPublishDelays())
                    .canPublishDisruptions(assignment.getCanPublishDisruptions())
                    .build();
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ResolveSOSRequest {
        private String notes;
    }
}