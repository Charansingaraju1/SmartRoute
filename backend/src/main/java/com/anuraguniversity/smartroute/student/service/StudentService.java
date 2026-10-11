package com.anuraguniversity.smartroute.student.service;

import com.anuraguniversity.smartroute.student.dto.StudentDTO;
import com.anuraguniversity.smartroute.student.entity.MissedBusRequest;
import com.anuraguniversity.smartroute.student.entity.Student;
import com.anuraguniversity.smartroute.student.repository.MissedBusRequestRepository;
import com.anuraguniversity.smartroute.student.repository.StudentRepository;
import com.anuraguniversity.smartroute.auth.entity.User;
import com.anuraguniversity.smartroute.auth.repository.UserRepository;
import com.anuraguniversity.smartroute.common.enums.AssignmentStatus;
import com.anuraguniversity.smartroute.common.enums.Direction;
import com.anuraguniversity.smartroute.common.exception.ResourceNotFoundException;
import com.anuraguniversity.smartroute.notification.entity.Notification;
import com.anuraguniversity.smartroute.common.enums.NotificationType;
import com.anuraguniversity.smartroute.common.enums.NotificationChannel;
import com.anuraguniversity.smartroute.notification.repository.NotificationRepository;
import com.anuraguniversity.smartroute.sos.entity.SOSRequest;
import com.anuraguniversity.smartroute.sos.repository.SOSRequestRepository;
import com.anuraguniversity.smartroute.gps.entity.LocationRecord;
import com.anuraguniversity.smartroute.gps.repository.LocationRecordRepository;
import com.anuraguniversity.smartroute.transport.entity.Bus;
import com.anuraguniversity.smartroute.transport.entity.BoardingPoint;
import com.anuraguniversity.smartroute.transport.entity.Route;
import com.anuraguniversity.smartroute.transport.repository.BusRepository;
import com.anuraguniversity.smartroute.transport.repository.BoardingPointRepository;
import com.anuraguniversity.smartroute.transport.repository.RouteRepository;
import com.anuraguniversity.smartroute.transport.repository.StudentBusAssignmentRepository;
import com.anuraguniversity.smartroute.transport.entity.StudentBusAssignment;
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
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class StudentService {

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final MissedBusRequestRepository missedBusRequestRepository;
    private final NotificationRepository notificationRepository;
    private final BusRepository busRepository;
    private final RouteRepository routeRepository;
    private final BoardingPointRepository boardingPointRepository;
    private final StudentBusAssignmentRepository studentBusAssignmentRepository;
    private final SOSRequestRepository sosRequestRepository;
    private final LocationRecordRepository locationRecordRepository;

    public StudentDTO getStudentProfile(UUID userId) {
        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));
        return StudentDTO.from(student);
    }

    public StudentDTO.StudentAssignmentDTO getStudentAssignment(UUID userId) {
        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));

        LocalDate today = LocalDate.now();
        StudentBusAssignment morningAssignment = studentBusAssignmentRepository
                .findActiveAssignmentForStudentOnDate(student.getId(), today)
                .orElse(null);

        List<StudentBusAssignment> activeAssignments = studentBusAssignmentRepository
                .findByStudentIdAndStatus(student.getId(), AssignmentStatus.ACTIVE);

        return StudentDTO.StudentAssignmentDTO.from(student, morningAssignment, activeAssignments);
    }

    public List<StudentDTO.BusInfo> getStudentBusInfo(UUID userId) {
        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));

        if (student.getBus() == null) {
            return List.of();
        }

        return List.of(StudentDTO.BusInfo.from(student.getBus()));
    }

    public Page<StudentDTO.NotificationDTO> getStudentNotifications(UUID userId, int page, int size) {
        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Notification> notifications = notificationRepository.findByRecipientIdOrderByCreatedAtDesc(
                student.getUser().getId(), pageable);

        return notifications.map(StudentDTO.NotificationDTO::from);
    }

    public List<StudentDTO.MissedBusDTO> getStudentMissedBusRequests(UUID userId) {
        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));

        List<MissedBusRequest> requests = missedBusRequestRepository.findByStudentIdOrderByCreatedAtDesc(student.getId());
        return requests.stream().map(StudentDTO.MissedBusDTO::from).collect(Collectors.toList());
    }

    @Transactional
    public StudentDTO.MissedBusDTO createMissedBusRequest(UUID userId, StudentDTO.CreateMissedBusRequest request) {
        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));

        MissedBusRequest requestEntity = new MissedBusRequest();
        requestEntity.setStudent(student);
        requestEntity.setStatus(com.anuraguniversity.smartroute.common.enums.MissedBusStatus.REQUESTED);
        requestEntity.setRequestedAt(Instant.now());
        requestEntity.setStudentNotes(request.getNotes());
        
        if (request.getLocationLat() != null && request.getLocationLng() != null) {
            requestEntity.setStudentLocationLat(request.getLocationLat().doubleValue());
            requestEntity.setStudentLocationLng(request.getLocationLng().doubleValue());
            requestEntity.setStudentLocationAt(Instant.now());
        }

        if (request.getOriginalBusId() != null) {
            Bus bus = busRepository.findById(request.getOriginalBusId())
                    .orElseThrow(() -> new ResourceNotFoundException("Bus not found"));
            requestEntity.setOriginalBus(bus);
        }

        requestEntity = missedBusRequestRepository.save(requestEntity);

        // Create notification for the student
        createNotification(student.getUser().getId(), 
            "Missed Bus Request Submitted",
            "Your missed bus request has been submitted and is pending acknowledgment.",
            NotificationType.MISSED_BUS, requestEntity.getId());

        // Notify teachers assigned to the bus
        if (requestEntity.getOriginalBus() != null) {
            notifyTeachersForBus(requestEntity.getOriginalBus().getId(),
                "New Missed Bus Request",
                "Student " + student.getUser().getName() + " reported missing bus " + requestEntity.getOriginalBus().getRegistrationNumber());
        }

        return StudentDTO.MissedBusDTO.from(requestEntity);
    }

    public List<StudentDTO.SOSDTO> getStudentSOSRequests(UUID userId) {
        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));

        return sosRequestRepository.findByStudentIdOrderByTriggeredAtDesc(student.getId()).stream()
                .map(StudentDTO.SOSDTO::from)
                .toList();
    }

    @Transactional
    public StudentDTO.SOSDTO createSOSRequest(UUID userId, StudentDTO.CreateSOSRequest request) {
        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));

        if ((request.getLatitude() == null) != (request.getLongitude() == null)) {
            throw new IllegalArgumentException("Latitude and longitude must be provided together");
        }
        if (request.getLocationAccuracy() != null && !Double.isFinite(request.getLocationAccuracy())) {
            throw new IllegalArgumentException("Location accuracy must be a finite number");
        }

        SOSRequest sos = new SOSRequest();
        sos.setStudent(student);
        sos.setCategory(request.getCategory());
        sos.setDescription(request.getDescription());
        sos.setLatitude(request.getLatitude());
        sos.setLongitude(request.getLongitude());
        sos.setLocationAccuracy(request.getLocationAccuracy());
        sos.setLocationAt(request.getLatitude() != null ? Instant.now() : null);
        sos.setTriggeredAt(Instant.now());

        return StudentDTO.SOSDTO.from(sosRequestRepository.save(sos));
    }

    public StudentDTO.BusPassDTO getStudentBusPass(UUID userId) {
        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));

        return StudentDTO.BusPassDTO.from(student);
    }

    @Transactional
    public StudentDTO.BusPassDTO updateBusPass(UUID userId, StudentDTO.UpdateBusPassRequest request) {
        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));

        if (request.getBusPassImageUrl() != null) {
            student.setBusPassImageUrl(request.getBusPassImageUrl());
        }
        if (request.getQrCode() != null) {
            student.setQrCode(request.getQrCode());
        }
        if (request.getOcrExtractedData() != null) {
            // Store OCR data if needed
        }

        student = studentRepository.save(student);
        return StudentDTO.BusPassDTO.from(student);
    }

    public StudentDTO.GPSDTO getStudentGPS(UUID userId) {
        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));

        return locationRecordRepository.findLatestByStudent(student.getId())
                .map(StudentDTO.GPSDTO::from)
                .orElseGet(() -> StudentDTO.GPSDTO.from(student));
    }

    @Transactional
    public StudentDTO.GPSDTO updateStudentLocation(UUID userId, StudentDTO.LocationUpdateRequest request) {
        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));

        validateLocation(request);

        LocationRecord location = LocationRecord.fromStudent(
                student, request.getLatitude(), request.getLongitude(), request.getAccuracy(), "BROWSER");
        location.setAltitude(request.getAltitude());
        location.setSpeed(request.getSpeed());
        location.setHeading(request.getHeading());
        return StudentDTO.GPSDTO.from(locationRecordRepository.save(location));
    }

    private void validateLocation(StudentDTO.LocationUpdateRequest request) {
        if (request.getLatitude() == null || request.getLongitude() == null) {
            throw new IllegalArgumentException("Latitude and longitude are required");
        }
        if (request.getLatitude().compareTo(java.math.BigDecimal.valueOf(-90)) < 0
                || request.getLatitude().compareTo(java.math.BigDecimal.valueOf(90)) > 0
                || request.getLongitude().compareTo(java.math.BigDecimal.valueOf(-180)) < 0
                || request.getLongitude().compareTo(java.math.BigDecimal.valueOf(180)) > 0) {
            throw new IllegalArgumentException("Location coordinates are out of range");
        }
        if (!isFiniteNonNegative(request.getAccuracy()) || !isFinite(request.getAltitude())
                || !isFiniteNonNegative(request.getSpeed()) || !isFinite(request.getHeading())) {
            throw new IllegalArgumentException("Location metadata contains an invalid value");
        }
    }

    private boolean isFinite(Double value) {
        return value == null || Double.isFinite(value);
    }

    private boolean isFiniteNonNegative(Double value) {
        return value == null || (Double.isFinite(value) && value >= 0);
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

    private void notifyTeachersForBus(UUID busId, String title, String message) {
        // Find teachers assigned to this bus and create notifications
        // This is a simplified implementation
    }
}
