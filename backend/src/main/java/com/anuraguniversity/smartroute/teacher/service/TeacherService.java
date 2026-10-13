package com.anuraguniversity.smartroute.teacher.service;

import com.anuraguniversity.smartroute.teacher.dto.TeacherDTO;
import com.anuraguniversity.smartroute.teacher.entity.Teacher;
import com.anuraguniversity.smartroute.teacher.entity.Delay;
import com.anuraguniversity.smartroute.teacher.entity.Disruption;
import com.anuraguniversity.smartroute.teacher.entity.TeacherBusAssignment;
import com.anuraguniversity.smartroute.teacher.repository.TeacherRepository;
import com.anuraguniversity.smartroute.teacher.repository.DelayRepository;
import com.anuraguniversity.smartroute.teacher.repository.DisruptionRepository;
import com.anuraguniversity.smartroute.teacher.repository.TeacherBusAssignmentRepository;
import com.anuraguniversity.smartroute.student.entity.MissedBusRequest;
import com.anuraguniversity.smartroute.student.entity.Student;
import com.anuraguniversity.smartroute.student.repository.MissedBusRequestRepository;
import com.anuraguniversity.smartroute.student.repository.StudentRepository;
import com.anuraguniversity.smartroute.sos.entity.SOSRequest;
import com.anuraguniversity.smartroute.sos.repository.SOSRequestRepository;
import com.anuraguniversity.smartroute.auth.entity.User;
import com.anuraguniversity.smartroute.auth.repository.UserRepository;
import com.anuraguniversity.smartroute.transport.entity.Bus;
import com.anuraguniversity.smartroute.transport.entity.Route;
import com.anuraguniversity.smartroute.transport.entity.BoardingPoint;
import com.anuraguniversity.smartroute.transport.entity.StudentBusAssignment;
import com.anuraguniversity.smartroute.transport.repository.BusRepository;
import com.anuraguniversity.smartroute.transport.repository.RouteRepository;
import com.anuraguniversity.smartroute.transport.repository.BoardingPointRepository;
import com.anuraguniversity.smartroute.transport.repository.StudentBusAssignmentRepository;
import com.anuraguniversity.smartroute.common.enums.AssignmentStatus;
import com.anuraguniversity.smartroute.common.enums.DelayStatus;
import com.anuraguniversity.smartroute.common.enums.DisruptionStatus;
import com.anuraguniversity.smartroute.common.enums.MissedBusStatus;
import com.anuraguniversity.smartroute.common.enums.NotificationType;
import com.anuraguniversity.smartroute.common.enums.NotificationChannel;
import com.anuraguniversity.smartroute.common.enums.SOSStatus;
import com.anuraguniversity.smartroute.common.exception.ResourceNotFoundException;
import com.anuraguniversity.smartroute.notification.entity.Notification;
import com.anuraguniversity.smartroute.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TeacherService {

    private final TeacherRepository teacherRepository;
    private final UserRepository userRepository;
    private final DelayRepository delayRepository;
    private final DisruptionRepository disruptionRepository;
    private final TeacherBusAssignmentRepository teacherBusAssignmentRepository;
    private final MissedBusRequestRepository missedBusRequestRepository;
    private final StudentRepository studentRepository;
    private final SOSRequestRepository sosRequestRepository;
    private final BusRepository busRepository;
    private final RouteRepository routeRepository;
    private final BoardingPointRepository boardingPointRepository;
    private final StudentBusAssignmentRepository studentBusAssignmentRepository;
    private final NotificationRepository notificationRepository;

    public TeacherDTO getTeacherProfile(UUID userId) {
        Teacher teacher = teacherRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher profile not found"));
        return TeacherDTO.from(teacher);
    }

    @Transactional(readOnly = true)
    public List<TeacherDTO.BusInfo> getTeacherBuses(UUID userId) {
        Teacher teacher = teacherRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher profile not found"));

        List<TeacherBusAssignment> assignments = teacherBusAssignmentRepository.findByTeacherId(teacher.getId());
        if (!assignments.isEmpty()) {
            return assignments.stream()
                    .map(a -> {
                        Route r = routeRepository.findFirstByBusIdAndActiveTrue(a.getBus().getId()).orElse(null);
                        return TeacherDTO.BusInfo.from(a.getBus(), r, a.getIsPrimary(), a.getCanPublishLocation(),
                                a.getCanPublishDelays(), a.getCanPublishDisruptions());
                    })
                    .collect(Collectors.toList());
        }

        if (teacher.getAssignedBus() != null) {
            Route r = routeRepository.findFirstByBusIdAndActiveTrue(teacher.getAssignedBus().getId()).orElse(null);
            return List.of(TeacherDTO.BusInfo.from(teacher.getAssignedBus(), r, true,
                    teacher.getCanPublishLocation(), teacher.getCanPublishDelays(), teacher.getCanPublishDisruptions()));
        }

        List<Bus> allBuses = busRepository.findAll();
        return allBuses.stream()
                .map(b -> {
                    Route r = routeRepository.findFirstByBusIdAndActiveTrue(b.getId()).orElse(null);
                    return TeacherDTO.BusInfo.from(b, r, false, false, false, false);
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TeacherDTO.PassengerInfo> getBusStudents(UUID userId, UUID busId) {
        Teacher teacher = teacherRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher profile not found"));

        // Verify teacher has access to this bus
        boolean hasAccess = teacherBusAssignmentRepository.existsByTeacherIdAndBusId(teacher.getId(), busId);
        if (teacher.getAssignedBus() != null && teacher.getAssignedBus().getId().equals(busId)) {
            hasAccess = true;
        }
        if (!hasAccess && !teacher.getCanManageAssignments()) {
            throw new ResourceNotFoundException("Access denied to this bus");
        }

        List<StudentBusAssignment> assignments = studentBusAssignmentRepository.findActiveByBus(busId);
        return assignments.stream()
                .map(a -> TeacherDTO.PassengerInfo.from(a.getStudent(), a))
                .collect(Collectors.toList());
    }

    public Page<TeacherDTO.MissedBusDTO> getTeacherMissedBusRequests(UUID userId, int page, int size) {
        Teacher teacher = teacherRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher profile not found"));

        Pageable pageable = PageRequest.of(page, size, Sort.by("requestedAt").descending());

        // Get buses assigned to this teacher
        List<UUID> busIds = teacherBusAssignmentRepository.findByTeacherId(teacher.getId())
                .stream().map(a -> a.getBus().getId()).collect(Collectors.toList());

        if (busIds.isEmpty()) {
            return Page.empty(pageable);
        }

        Page<MissedBusRequest> requests = missedBusRequestRepository.findByOriginalBusIdInOrderByRequestedAtDesc(busIds, pageable);
        return requests.map(TeacherDTO.MissedBusDTO::from);
    }

    @Transactional
    public TeacherDTO.MissedBusDTO acknowledgeMissedBusRequest(UUID userId, UUID requestId) {
        Teacher teacher = teacherRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher profile not found"));

        MissedBusRequest request = missedBusRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Missed bus request not found"));

        // Verify teacher has access to this bus
        if (request.getOriginalBus() != null) {
            boolean hasAccess = teacherBusAssignmentRepository.existsByTeacherIdAndBusId(teacher.getId(), request.getOriginalBus().getId());
            if (!hasAccess && !teacher.getCanManageAssignments()) {
                throw new ResourceNotFoundException("Access denied to this request");
            }
        }

        if (request.getStatus() != MissedBusStatus.REQUESTED) {
            throw new IllegalStateException("Request is not in REQUESTED status");
        }

        request.setStatus(MissedBusStatus.ACKNOWLEDGED);
        request.setAcknowledgedAt(Instant.now());
        request.setAcknowledgedBy(teacher.getId());
        request = missedBusRequestRepository.save(request);

        // Notify student
        createNotification(request.getStudent().getUser().getId(),
            "Missed Bus Request Acknowledged",
            "Your missed bus request has been acknowledged by a teacher.",
            NotificationType.MISSED_BUS, request.getId());

        return TeacherDTO.MissedBusDTO.from(request);
    }

    @Transactional
    public TeacherDTO.MissedBusDTO assignAlternativeBus(UUID userId, UUID requestId, UUID alternativeBusId) {
        return assignAlternativeBus(userId, requestId, alternativeBusId, null);
    }

    @Transactional
    public TeacherDTO.MissedBusDTO assignAlternativeBus(UUID userId, UUID requestId, UUID alternativeBusId, String notes) {
        Teacher teacher = teacherRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher profile not found"));

        MissedBusRequest request = missedBusRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Missed bus request not found"));

        // Verify teacher has access
        boolean hasAccess = teacher.getCanManageAssignments();
        if (!hasAccess && request.getOriginalBus() != null) {
            hasAccess = teacherBusAssignmentRepository.existsByTeacherIdAndBusId(teacher.getId(), request.getOriginalBus().getId());
        }
        if (!hasAccess) {
            throw new ResourceNotFoundException("Access denied");
        }

        Bus alternativeBus = busRepository.findById(alternativeBusId)
                .orElseThrow(() -> new ResourceNotFoundException("Alternative bus not found"));

        if (!alternativeBus.hasAvailableCapacity()) {
            throw new IllegalStateException("Alternative bus is at full capacity");
        }

        request.setAlternativeBus(alternativeBus);
        request.setStatus(MissedBusStatus.ALTERNATIVE_BUS_ASSIGNED);
        request.setAlternativeAssignedAt(Instant.now());
        if (notes != null && !notes.trim().isEmpty()) {
            request.setTeacherNotes(notes.trim());
        }
        request = missedBusRequestRepository.save(request);

        // Notify student
        createNotification(request.getStudent().getUser().getId(),
            "Alternative Bus Assigned",
            "An alternative bus (" + alternativeBus.getRegistrationNumber() + ") has been assigned for your missed bus request.",
            NotificationType.MISSED_BUS, request.getId());

        return TeacherDTO.MissedBusDTO.from(request);
    }

    @Transactional
    public TeacherDTO.MissedBusDTO resolveMissedBusRequest(UUID userId, UUID requestId) {
        Teacher teacher = teacherRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher profile not found"));

        MissedBusRequest request = missedBusRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Missed bus request not found"));

        // Verify teacher has access
        boolean hasAccess = teacher.getCanManageAssignments();
        if (!hasAccess && request.getOriginalBus() != null) {
            hasAccess = teacherBusAssignmentRepository.existsByTeacherIdAndBusId(teacher.getId(), request.getOriginalBus().getId());
        }
        if (!hasAccess) {
            throw new ResourceNotFoundException("Access denied");
        }

        request.setStatus(MissedBusStatus.RESOLVED);
        request.setResolvedAt(Instant.now());
        request.setResolvedBy(teacher.getId());
        request = missedBusRequestRepository.save(request);

        // Notify student
        createNotification(request.getStudent().getUser().getId(),
            "Missed Bus Request Resolved",
            "Your missed bus request has been resolved.",
            NotificationType.MISSED_BUS, request.getId());

        return TeacherDTO.MissedBusDTO.from(request);
    }

    public Page<TeacherDTO.DelayDTO> getTeacherDelays(UUID userId, int page, int size) {
        Teacher teacher = teacherRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher profile not found"));

        Pageable pageable = PageRequest.of(page, size, Sort.by("publishedAt").descending());
        List<UUID> busIds = teacherBusAssignmentRepository.findByTeacherId(teacher.getId())
                .stream().map(a -> a.getBus().getId()).collect(Collectors.toList());

        if (busIds.isEmpty()) {
            return Page.empty(pageable);
        }

        Page<Delay> delays = delayRepository.findByBusIdInOrderByPublishedAtDesc(busIds, pageable);
        return delays.map(TeacherDTO.DelayDTO::from);
    }

    @Transactional
    public TeacherDTO.DelayDTO createDelay(UUID userId, TeacherDTO.CreateDelayRequest request) {
        Teacher teacher = teacherRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher profile not found"));

        Bus bus = busRepository.findById(request.getBusId())
                .orElseThrow(() -> new ResourceNotFoundException("Bus not found"));

        // Verify teacher has access to this bus
        boolean hasAccess = teacherBusAssignmentRepository.existsByTeacherIdAndBusId(teacher.getId(), bus.getId());
        if (!hasAccess && !teacher.getCanPublishDelays()) {
            throw new ResourceNotFoundException("Access denied to publish delays for this bus");
        }

        Delay delay = new Delay();
        delay.setBus(bus);
        delay.setRoute(request.getRouteId() != null ? routeRepository.findById(request.getRouteId()).orElse(null) : null);
        delay.setTeacher(teacher);
        delay.setStatus(DelayStatus.PUBLISHED);
        delay.setDelayMinutes(request.getDelayMinutes());
        delay.setExpectedArrivalTime(request.getExpectedArrivalTime());
        delay.setReason(request.getReason());
        delay.setNotes(request.getNotes());
        delay.setPublishedAt(Instant.now());
        delay.setAutoExpireAt(Instant.now().plusSeconds(request.getDelayMinutes() * 60L * 2)); // Auto-expire after 2x delay time

        delay = delayRepository.save(delay);

        // Notify students on this bus
        List<StudentBusAssignment> assignments = studentBusAssignmentRepository.findActiveByBus(bus.getId());
        for (StudentBusAssignment assignment : assignments) {
            createNotification(assignment.getStudent().getUser().getId(),
                "Bus Delay Notification",
                "Bus " + bus.getRegistrationNumber() + " is delayed by " + delay.getDelayMinutes() + " minutes.",
                NotificationType.DELAY, delay.getId());
        }

        return TeacherDTO.DelayDTO.from(delay);
    }

    @Transactional
    public TeacherDTO.DelayDTO acknowledgeDelay(UUID userId, UUID delayId) {
        Teacher teacher = teacherRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher profile not found"));

        Delay delay = delayRepository.findById(delayId)
                .orElseThrow(() -> new ResourceNotFoundException("Delay not found"));

        if (delay.getStatus() != DelayStatus.PUBLISHED) {
            throw new IllegalStateException("Delay is not in PUBLISHED status");
        }

        delay.setStatus(DelayStatus.ACKNOWLEDGED);
        delay.setAcknowledgedAt(Instant.now());
        delay.setAcknowledgedBy(teacher.getId());
        delay = delayRepository.save(delay);

        return TeacherDTO.DelayDTO.from(delay);
    }

    @Transactional
    public TeacherDTO.DelayDTO resolveDelay(UUID userId, UUID delayId) {
        Teacher teacher = teacherRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher profile not found"));

        Delay delay = delayRepository.findById(delayId)
                .orElseThrow(() -> new ResourceNotFoundException("Delay not found"));

        if (delay.getStatus() == DelayStatus.RESOLVED || delay.getStatus() == DelayStatus.CANCELLED) {
            throw new IllegalStateException("Delay is already resolved or cancelled");
        }

        delay.setStatus(DelayStatus.RESOLVED);
        delay.setResolvedAt(Instant.now());
        delay.setResolvedBy(teacher.getId());
        delay = delayRepository.save(delay);

        return TeacherDTO.DelayDTO.from(delay);
    }

    public Page<TeacherDTO.DisruptionDTO> getTeacherDisruptions(UUID userId, int page, int size) {
        Teacher teacher = teacherRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher profile not found"));

        Pageable pageable = PageRequest.of(page, size, Sort.by("publishedAt").descending());
        List<UUID> busIds = teacherBusAssignmentRepository.findByTeacherId(teacher.getId())
                .stream().map(a -> a.getBus().getId()).collect(Collectors.toList());

        if (busIds.isEmpty()) {
            return Page.empty(pageable);
        }

        Page<Disruption> disruptions = disruptionRepository.findByBusIdInOrderByPublishedAtDesc(busIds, pageable);
        return disruptions.map(TeacherDTO.DisruptionDTO::from);
    }

    @Transactional
    public TeacherDTO.DisruptionDTO createDisruption(UUID userId, TeacherDTO.CreateDisruptionRequest request) {
        Teacher teacher = teacherRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher profile not found"));

        Bus bus = request.getBusId() != null ? busRepository.findById(request.getBusId()).orElse(null) : null;
        Route route = request.getRouteId() != null ? routeRepository.findById(request.getRouteId()).orElse(null) : null;

        // Verify teacher has access to publish disruptions
        if (!teacher.getCanPublishDisruptions() && !teacher.getCanManageAssignments()) {
            throw new ResourceNotFoundException("Access denied to publish disruptions");
        }

        Disruption disruption = new Disruption();
        disruption.setBus(bus);
        disruption.setRoute(route);
        disruption.setTeacher(teacher);
        disruption.setType(request.getType());
        disruption.setStatus(DisruptionStatus.ACTIVE);
        disruption.setStartTime(request.getStartTime());
        disruption.setEstimatedEndTime(request.getEstimatedEndTime());
        disruption.setTitle(request.getTitle());
        disruption.setDescription(request.getDescription());
        disruption.setAffectedArea(request.getAffectedArea());
        disruption.setAlternativeRoute(request.getAlternativeRoute());
        disruption.setPublishedAt(Instant.now());
        disruption.setSeverity(request.getSeverity());

        disruption = disruptionRepository.save(disruption);

        // Notify affected students
        if (bus != null) {
            List<StudentBusAssignment> assignments = studentBusAssignmentRepository.findActiveByBus(bus.getId());
            for (StudentBusAssignment assignment : assignments) {
                createNotification(assignment.getStudent().getUser().getId(),
                    "Transport Disruption",
                    disruption.getTitle() + ": " + disruption.getDescription(),
                    NotificationType.DISRUPTION, disruption.getId());
            }
        }

        return TeacherDTO.DisruptionDTO.from(disruption);
    }

    @Transactional
    public TeacherDTO.DisruptionDTO acknowledgeDisruption(UUID userId, UUID disruptionId) {
        Teacher teacher = teacherRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher profile not found"));

        Disruption disruption = disruptionRepository.findById(disruptionId)
                .orElseThrow(() -> new ResourceNotFoundException("Disruption not found"));

        if (disruption.getStatus() != DisruptionStatus.ACTIVE) {
            throw new IllegalStateException("Disruption is not in ACTIVE status");
        }

        disruption.setStatus(DisruptionStatus.ACKNOWLEDGED);
        disruption.setAcknowledgedAt(Instant.now());
        disruption.setAcknowledgedBy(teacher.getId());
        disruption = disruptionRepository.save(disruption);

        return TeacherDTO.DisruptionDTO.from(disruption);
    }

    @Transactional
    public TeacherDTO.DisruptionDTO resolveDisruption(UUID userId, UUID disruptionId) {
        Teacher teacher = teacherRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher profile not found"));

        Disruption disruption = disruptionRepository.findById(disruptionId)
                .orElseThrow(() -> new ResourceNotFoundException("Disruption not found"));

        if (disruption.getStatus() == DisruptionStatus.RESOLVED || disruption.getStatus() == DisruptionStatus.CANCELLED) {
            throw new IllegalStateException("Disruption is already resolved or cancelled");
        }

        disruption.setStatus(DisruptionStatus.RESOLVED);
        disruption.setResolvedAt(Instant.now());
        disruption.setResolvedBy(teacher.getId());
        if (disruption.getEndTime() == null) {
            disruption.setEndTime(Instant.now());
        }
        disruption = disruptionRepository.save(disruption);

        return TeacherDTO.DisruptionDTO.from(disruption);
    }

    public Page<TeacherDTO.SOSDTO> getTeacherSOSRequests(UUID userId, int page, int size) {
        Teacher teacher = teacherRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher profile not found"));

        Pageable pageable = PageRequest.of(page, size, Sort.by("triggeredAt").descending());

        // Get bus IDs assigned to this teacher
        List<UUID> busIds = teacherBusAssignmentRepository.findByTeacherId(teacher.getId())
                .stream().map(a -> a.getBus().getId()).collect(Collectors.toList());

        if (busIds.isEmpty()) {
            // Teacher has no bus assignments yet.
            // To preserve emergency visibility, show only OPEN (un-acknowledged) SOS requests
            // so no emergency is silently discarded. Once a bus is assigned this narrows automatically.
            Page<SOSRequest> openSos = sosRequestRepository.findByStatusIn(
                    List.of(com.anuraguniversity.smartroute.common.enums.SOSStatus.OPEN), pageable);
            return openSos.map(TeacherDTO.SOSDTO::from);
        }

        // Collect student IDs assigned to these buses
        List<UUID> studentIds = busIds.stream()
                .flatMap(busId -> studentBusAssignmentRepository.findActiveByBus(busId).stream())
                .map(a -> a.getStudent().getId())
                .distinct()
                .collect(Collectors.toList());

        if (studentIds.isEmpty()) {
            return Page.empty(pageable);
        }

        Page<SOSRequest> sosRequests = sosRequestRepository.findByStudentIdIn(studentIds, pageable);
        return sosRequests.map(TeacherDTO.SOSDTO::from);
    }

    @Transactional
    public TeacherDTO.SOSDTO acknowledgeSOS(UUID userId, UUID sosId) {
        Teacher teacher = teacherRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher profile not found"));

        SOSRequest sos = sosRequestRepository.findById(sosId)
                .orElseThrow(() -> new ResourceNotFoundException("SOS request not found"));

        if (sos.getStatus() != SOSStatus.OPEN) {
            throw new IllegalStateException("SOS is not in OPEN status");
        }

        sos.setStatus(SOSStatus.ACKNOWLEDGED);
        sos.setAcknowledgedAt(Instant.now());
        sos.setAcknowledgedBy(teacher.getId());
        sos.setTeacherNotified(true);
        sos = sosRequestRepository.save(sos);

        // Notify student
        createNotification(sos.getStudent().getUser().getId(),
            "SOS Acknowledged",
            "Your SOS request has been acknowledged by a teacher.",
            NotificationType.SOS, sos.getId());

        return TeacherDTO.SOSDTO.from(sos);
    }

    @Transactional
    public TeacherDTO.SOSDTO respondToSOS(UUID userId, UUID sosId) {
        Teacher teacher = teacherRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher profile not found"));

        SOSRequest sos = sosRequestRepository.findById(sosId)
                .orElseThrow(() -> new ResourceNotFoundException("SOS request not found"));

        if (sos.getStatus() != SOSStatus.ACKNOWLEDGED) {
            throw new IllegalStateException("SOS must be acknowledged first");
        }

        sos.setStatus(SOSStatus.RESPONDING);
        sos.setRespondingAt(Instant.now());
        sos.setRespondingBy(teacher.getId());
        sos = sosRequestRepository.save(sos);

        // Notify student
        createNotification(sos.getStudent().getUser().getId(),
            "SOS Response In Progress",
            "A teacher is responding to your SOS request.",
            NotificationType.SOS, sos.getId());

        return TeacherDTO.SOSDTO.from(sos);
    }

    @Transactional
    public TeacherDTO.SOSDTO resolveSOS(UUID userId, UUID sosId, String notes) {
        Teacher teacher = teacherRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher profile not found"));

        SOSRequest sos = sosRequestRepository.findById(sosId)
                .orElseThrow(() -> new ResourceNotFoundException("SOS request not found"));

        if (sos.getStatus() == SOSStatus.RESOLVED) {
            throw new IllegalStateException("SOS is already resolved");
        }

        sos.setStatus(SOSStatus.RESOLVED);
        sos.setResolvedAt(Instant.now());
        sos.setResolvedBy(teacher.getId());
        sos.setResolutionNotes(notes);
        sos = sosRequestRepository.save(sos);

        // Notify student
        createNotification(sos.getStudent().getUser().getId(),
            "SOS Resolved",
            "Your SOS request has been resolved.",
            NotificationType.SOS, sos.getId());

        return TeacherDTO.SOSDTO.from(sos);
    }

    public TeacherDTO.TransportOpsDTO getTransportOpsDashboard(UUID userId) {
        Teacher teacher = teacherRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher profile not found"));

        List<UUID> busIds = teacherBusAssignmentRepository.findByTeacherId(teacher.getId())
                .stream().map(a -> a.getBus().getId()).collect(Collectors.toList());

        long activeDelays = busIds.isEmpty() ? 0 : delayRepository.countByBusIdInAndStatusIn(busIds, List.of(DelayStatus.PUBLISHED, DelayStatus.ACKNOWLEDGED));
        long activeDisruptions = busIds.isEmpty() ? 0 : disruptionRepository.countByBusIdInAndStatusIn(busIds, List.of(DisruptionStatus.ACTIVE, DisruptionStatus.ACKNOWLEDGED));
        long pendingMissedBus = busIds.isEmpty() ? 0 : missedBusRequestRepository.countByOriginalBusIdInAndStatus(busIds, MissedBusStatus.REQUESTED);
        long activeSOS = sosRequestRepository.countByStatusIn(List.of(SOSStatus.OPEN, SOSStatus.ACKNOWLEDGED, SOSStatus.RESPONDING));

        return TeacherDTO.TransportOpsDTO.builder()
                .activeDelays(activeDelays)
                .activeDisruptions(activeDisruptions)
                .pendingMissedBusRequests(pendingMissedBus)
                .activeSOSRequests(activeSOS)
                .totalAssignedBuses(busIds.size())
                .build();
    }

    @Transactional(readOnly = true)
    public List<TeacherDTO.AssignmentDTO> getTeacherAssignments(UUID userId) {
        Teacher teacher = teacherRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher profile not found"));

        List<UUID> busIds = teacherBusAssignmentRepository.findByTeacherId(teacher.getId())
                .stream().map(a -> a.getBus().getId()).collect(Collectors.toList());
        if (teacher.getAssignedBus() != null && !busIds.contains(teacher.getAssignedBus().getId())) {
            busIds.add(teacher.getAssignedBus().getId());
        }

        List<StudentBusAssignment> assignments;
        if (Boolean.TRUE.equals(teacher.getCanManageAssignments()) || busIds.isEmpty()) {
            assignments = studentBusAssignmentRepository.findAll();
        } else {
            assignments = studentBusAssignmentRepository.findByBusIdIn(busIds);
        }

        return assignments.stream().map(TeacherDTO.AssignmentDTO::from).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TeacherDTO.StudentSummary> getEligibleStudents(UUID userId) {
        teacherRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher profile not found"));

        return studentRepository.findAll().stream()
                .map(s -> TeacherDTO.StudentSummary.builder()
                        .id(s.getId())
                        .studentId(s.getStudentId())
                        .branch(s.getBranch())
                        .classSection(s.getClassSection())
                        .user(s.getUser() != null ? TeacherDTO.UserSummary.builder()
                                .name(s.getUser().getName())
                                .email(s.getUser().getEmail())
                                .build() : null)
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public TeacherDTO.AssignmentDTO createAssignment(UUID userId, TeacherDTO.CreateAssignmentRequest request) {
        Teacher teacher = teacherRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher profile not found"));

        if (request.getStudentId() == null) {
            throw new IllegalArgumentException("Student ID is required");
        }
        if (request.getBusId() == null) {
            throw new IllegalArgumentException("Bus ID is required");
        }
        if (request.getRouteId() == null) {
            throw new IllegalArgumentException("Route ID is required");
        }

        // Validate teacher scope
        validateTeacherBusScope(teacher, request.getBusId());

        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        Bus bus = busRepository.findById(request.getBusId())
                .orElseThrow(() -> new ResourceNotFoundException("Bus not found"));

        Route route = routeRepository.findById(request.getRouteId())
                .orElseThrow(() -> new ResourceNotFoundException("Route not found"));

        BoardingPoint boardingPoint = null;
        if (request.getBoardingPointId() != null) {
            boardingPoint = boardingPointRepository.findById(request.getBoardingPointId())
                    .orElseThrow(() -> new ResourceNotFoundException("Boarding point not found"));
            if (!boardingPoint.getRoute().getId().equals(route.getId())) {
                throw new IllegalArgumentException("Boarding point does not belong to the selected route");
            }
        }

        com.anuraguniversity.smartroute.common.enums.Direction direction = request.getDirection() != null
                ? request.getDirection()
                : (route.getDirection() != null ? route.getDirection() : com.anuraguniversity.smartroute.common.enums.Direction.MORNING);

        // Check active duplicate assignment
        var existingActive = studentBusAssignmentRepository.findActiveByStudentAndDirection(student.getId(), direction);
        if (existingActive.isPresent()) {
            throw new IllegalStateException("Student already has an active assignment for direction: " + direction);
        }

        // Validate capacity
        long currentCount = studentBusAssignmentRepository.countActiveByBus(bus.getId());
        if (currentCount >= bus.getCapacity()) {
            throw new IllegalStateException("Bus capacity reached (" + bus.getCapacity() + " seats)");
        }

        StudentBusAssignment assignment = new StudentBusAssignment();
        assignment.setStudent(student);
        assignment.setBus(bus);
        assignment.setRoute(route);
        assignment.setBoardingPoint(boardingPoint);
        assignment.setDirection(direction);
        assignment.setStatus(AssignmentStatus.ACTIVE);
        assignment.setStartDate(request.getStartDate() != null ? request.getStartDate() : LocalDate.now());
        assignment.setEndDate(request.getEndDate());
        assignment.setAssignedBy(teacher.getId());
        assignment.setAssignmentNotes(request.getAssignmentNotes());

        assignment = studentBusAssignmentRepository.save(assignment);

        // Update student record
        student.setBus(bus);
        student.setRoute(route);
        student.setBoardingPoint(boardingPoint);
        student.setDirection(direction);
        student.setAssignmentStatus(AssignmentStatus.ACTIVE);
        studentRepository.save(student);

        // Update bus current student count
        recalibrateBusCapacity(bus);

        // Create notification
        createNotification(student.getUser().getId(),
                "Bus Assignment Created",
                "You have been assigned to Bus " + bus.getRegistrationNumber() + " on Route " + route.getRouteCode(),
                NotificationType.BUS_ASSIGNMENT, assignment.getId());

        return TeacherDTO.AssignmentDTO.from(assignment);
    }

    @Transactional
    public TeacherDTO.AssignmentDTO cancelAssignment(UUID userId, UUID assignmentId, String reason) {
        Teacher teacher = teacherRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher profile not found"));

        StudentBusAssignment assignment = studentBusAssignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));

        if (assignment.getStatus() == AssignmentStatus.CANCELLED) {
            throw new IllegalStateException("Assignment is already cancelled");
        }

        validateTeacherBusScope(teacher, assignment.getBus().getId());

        assignment.setStatus(AssignmentStatus.CANCELLED);
        assignment.setCancelledAt(Instant.now());
        assignment.setCancelledBy(teacher.getId());
        assignment.setCancellationReason(reason != null && !reason.isBlank() ? reason : "Removed by teacher");
        assignment = studentBusAssignmentRepository.save(assignment);

        // Release student transport assignment if active on this assignment
        Student student = assignment.getStudent();
        if (student != null) {
            var otherActive = studentBusAssignmentRepository.findActiveByStudentAndDirection(student.getId(), assignment.getDirection());
            if (otherActive.isEmpty()) {
                student.setAssignmentStatus(null);
                if (student.getBus() != null && student.getBus().getId().equals(assignment.getBus().getId())) {
                    student.setBus(null);
                }
                if (student.getRoute() != null && student.getRoute().getId().equals(assignment.getRoute().getId())) {
                    student.setRoute(null);
                }
                student.setBoardingPoint(null);
                studentRepository.save(student);
            }
        }

        // Recalibrate bus seat count
        Bus bus = assignment.getBus();
        if (bus != null) {
            recalibrateBusCapacity(bus);
        }

        // Notify student
        if (student != null && student.getUser() != null) {
            createNotification(student.getUser().getId(),
                    "Bus Assignment Cancelled",
                    "Your transport assignment for Bus " + (bus != null ? bus.getRegistrationNumber() : "") + " has been cancelled.",
                    NotificationType.BUS_ASSIGNMENT, assignment.getId());
        }

        return TeacherDTO.AssignmentDTO.from(assignment);
    }

    @Transactional
    public TeacherDTO.AssignmentDTO updateAssignment(UUID userId, UUID assignmentId, TeacherDTO.UpdateAssignmentRequest request) {
        Teacher teacher = teacherRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher profile not found"));

        StudentBusAssignment assignment = studentBusAssignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found"));

        validateTeacherBusScope(teacher, assignment.getBus().getId());

        Bus oldBus = assignment.getBus();
        Bus targetBus = oldBus;

        if (request.getBusId() != null && !request.getBusId().equals(oldBus.getId())) {
            validateTeacherBusScope(teacher, request.getBusId());
            targetBus = busRepository.findById(request.getBusId())
                    .orElseThrow(() -> new ResourceNotFoundException("Target bus not found"));
            long currentCount = studentBusAssignmentRepository.countActiveByBus(targetBus.getId());
            if (currentCount >= targetBus.getCapacity()) {
                throw new IllegalStateException("Target bus capacity reached (" + targetBus.getCapacity() + " seats)");
            }
            assignment.setBus(targetBus);
        }

        if (request.getRouteId() != null) {
            Route route = routeRepository.findById(request.getRouteId())
                    .orElseThrow(() -> new ResourceNotFoundException("Route not found"));
            assignment.setRoute(route);
        }

        if (request.getBoardingPointId() != null) {
            BoardingPoint bp = boardingPointRepository.findById(request.getBoardingPointId())
                    .orElseThrow(() -> new ResourceNotFoundException("Boarding point not found"));
            assignment.setBoardingPoint(bp);
        }

        if (request.getDirection() != null) {
            assignment.setDirection(request.getDirection());
        }

        if (request.getStatus() != null) {
            assignment.setStatus(request.getStatus());
        }

        if (request.getStartDate() != null) {
            assignment.setStartDate(request.getStartDate());
        }

        if (request.getEndDate() != null) {
            assignment.setEndDate(request.getEndDate());
        }

        if (request.getAssignmentNotes() != null) {
            assignment.setAssignmentNotes(request.getAssignmentNotes());
        }

        assignment = studentBusAssignmentRepository.save(assignment);

        if (oldBus != null && !oldBus.getId().equals(targetBus.getId())) {
            recalibrateBusCapacity(oldBus);
        }
        recalibrateBusCapacity(targetBus);

        // Keep student entity synchronized
        Student student = assignment.getStudent();
        if (student != null && assignment.getStatus() == AssignmentStatus.ACTIVE) {
            student.setBus(assignment.getBus());
            student.setRoute(assignment.getRoute());
            student.setBoardingPoint(assignment.getBoardingPoint());
            student.setDirection(assignment.getDirection());
            student.setAssignmentStatus(AssignmentStatus.ACTIVE);
            studentRepository.save(student);
        }

        return TeacherDTO.AssignmentDTO.from(assignment);
    }

    @Transactional
    public TeacherDTO updateTeacherProfile(UUID userId, TeacherDTO.UpdateProfileRequest request) {
        Teacher teacher = teacherRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Teacher profile not found"));

        User user = teacher.getUser();
        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName().trim());
            userRepository.save(user);
        }

        if (request.getDepartment() != null) {
            teacher.setDepartment(request.getDepartment().trim());
        }
        if (request.getDesignation() != null) {
            teacher.setDesignation(request.getDesignation().trim());
        }
        if (request.getPhone() != null) {
            teacher.setPhone(request.getPhone().trim());
        }

        teacher = teacherRepository.save(teacher);
        return TeacherDTO.from(teacher);
    }

    private void validateTeacherBusScope(Teacher teacher, UUID busId) {
        if (Boolean.TRUE.equals(teacher.getCanManageAssignments())) {
            return;
        }
        boolean hasAccess = teacherBusAssignmentRepository.existsByTeacherIdAndBusId(teacher.getId(), busId);
        if (!hasAccess && teacher.getAssignedBus() != null && teacher.getAssignedBus().getId().equals(busId)) {
            hasAccess = true;
        }
        if (!hasAccess) {
            throw new ResourceNotFoundException("Access denied: You are not assigned to manage Bus " + busId);
        }
    }

    private void recalibrateBusCapacity(Bus bus) {
        long activeCount = studentBusAssignmentRepository.countActiveByBus(bus.getId());
        bus.setCurrentStudentsCount((int) activeCount);
        busRepository.save(bus);
    }

    private void createNotification(UUID recipientId, String title, String message, NotificationType type, UUID relatedEntityId) {
        Notification notification = new Notification();
        notification.setRecipient(userRepository.findById(recipientId).orElseThrow());
        notification.setType(type);
        notification.setChannel(NotificationChannel.IN_APP);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setRelatedEntityType(type.name());
        notification.setRelatedEntityId(relatedEntityId);
        notification.setPriority(1);
        notificationRepository.save(notification);
    }
}
