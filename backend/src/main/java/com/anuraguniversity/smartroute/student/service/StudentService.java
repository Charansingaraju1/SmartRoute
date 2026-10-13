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
import com.anuraguniversity.smartroute.buspass.entity.BusPassRecord;
import com.anuraguniversity.smartroute.buspass.repository.BusPassRecordRepository;
import org.springframework.web.multipart.MultipartFile;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
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

import com.anuraguniversity.smartroute.teacher.repository.TeacherBusAssignmentRepository;

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
    private final BusPassRecordRepository busPassRecordRepository;
    private final TeacherBusAssignmentRepository teacherBusAssignmentRepository;
    private final com.anuraguniversity.smartroute.buspass.service.BusPassRecognitionService busPassRecognitionService;

    public StudentDTO getStudentProfile(UUID userId) {
        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));
        return StudentDTO.from(student);
    }

    @Transactional(readOnly = true)
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
        } else if (student.getBus() != null) {
            requestEntity.setOriginalBus(student.getBus());
        } else {
            studentBusAssignmentRepository.findActiveAssignmentForStudentOnDate(student.getId(), LocalDate.now())
                    .map(StudentBusAssignment::getBus)
                    .ifPresent(requestEntity::setOriginalBus);
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

        List<BusPassRecord> records = busPassRecordRepository.findByStudentIdOrderByCreatedAtDesc(student.getId());
        BusPassRecord latest = records.isEmpty() ? null : records.get(0);
        return StudentDTO.BusPassDTO.from(student, latest);
    }

    @Transactional
    public StudentDTO.BusPassDTO uploadBusPass(UUID userId, MultipartFile image) {
        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));

        if (image == null || image.isEmpty()) {
            throw new IllegalArgumentException("Bus pass image file cannot be empty");
        }

        String contentType = image.getContentType();
        if (contentType == null || (!contentType.startsWith("image/") && !contentType.equalsIgnoreCase("application/pdf"))) {
            throw new IllegalArgumentException("Uploaded file must be a valid image");
        }

        if (image.getSize() > 10 * 1024 * 1024) {
            throw new IllegalArgumentException("File size must not exceed 10MB");
        }

        try {
            Path uploadDir = Paths.get("uploads", "bus-passes").toAbsolutePath().normalize();
            Files.createDirectories(uploadDir);

            String originalName = image.getOriginalFilename();
            String ext = ".jpg";
            if (originalName != null && originalName.contains(".")) {
                String potentialExt = originalName.substring(originalName.lastIndexOf(".")).toLowerCase();
                if (potentialExt.matches("\\.(jpg|jpeg|png|webp|gif|pdf)")) {
                    ext = potentialExt;
                }
            }
            String fileName = UUID.randomUUID() + ext;
            Path targetPath = uploadDir.resolve(fileName);
            Files.copy(image.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            String imageUrl = "/api/student/bus-pass/image/" + fileName;

            List<BusPassRecord> records = busPassRecordRepository.findByStudentIdOrderByCreatedAtDesc(student.getId());
            BusPassRecord record;
            if (records.isEmpty()) {
                record = new BusPassRecord();
                record.setStudent(student);
                record.setBus(null);
                record.setRoute(null);
                record.setValidFrom(LocalDate.now());
                record.setValidUntil(LocalDate.now().plusMonths(6));
                String initialPassNo = "PASS-" + (student.getStudentId() != null ? student.getStudentId() : UUID.randomUUID().toString().substring(0, 8).toUpperCase());
                record.setPassNumber(com.anuraguniversity.smartroute.buspass.service.BusPassRecognitionService.canonicalizePassNumber(initialPassNo));
                record.setAcademicYear(student.getAcademicYear() != null ? student.getAcademicYear() : "2026-27");
                record.setFeePaid(false);
                record.setFeeAmount(java.math.BigDecimal.ZERO);
            } else {
                record = records.get(0);
                record.setPassNumber(com.anuraguniversity.smartroute.buspass.service.BusPassRecognitionService.canonicalizePassNumber(record.getPassNumber()));
            }

            record.setImageUrl(imageUrl);
            record.setStatus(BusPassRecord.Status.PENDING_VERIFICATION.name());
            record.setVerifiedAt(null);
            record.setVerifiedBy(null);
            record.setRejectionReason(null);
            record.setVerificationNotes("Submitted by student for verification");
            record = busPassRecordRepository.save(record);

            student.setBusPassImageUrl(imageUrl);
            studentRepository.save(student);

            // Execute automated recognition, route/stop validation, and assignment
            busPassRecognitionService.recognizeAndProcess(student, record, targetPath, originalName != null ? originalName : fileName);

            // Reload records
            student = studentRepository.findById(student.getId()).orElse(student);
            record = busPassRecordRepository.findById(record.getId()).orElse(record);

            return StudentDTO.BusPassDTO.from(student, record);
        } catch (java.io.IOException e) {
            log.error("Failed to store uploaded bus pass image", e);
            throw new RuntimeException("Failed to store uploaded file", e);
        }
    }

    @Transactional
    public StudentDTO.BusPassDTO updateBusPass(UUID userId, StudentDTO.UpdateBusPassRequest request) {
        Student student = studentRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found"));

        List<BusPassRecord> records = busPassRecordRepository.findByStudentIdOrderByCreatedAtDesc(student.getId());
        BusPassRecord record = records.isEmpty() ? null : records.get(0);

        if (request.getBusPassImageUrl() != null) {
            student.setBusPassImageUrl(request.getBusPassImageUrl());
            if (record != null) {
                record.setImageUrl(request.getBusPassImageUrl());
            }
        }
        if (request.getQrCode() != null) {
            student.setQrCode(request.getQrCode());
            if (record != null) {
                record.setQrCodeData(request.getQrCode());
            }
        }
        if (request.getOcrExtractedData() != null && record != null) {
            record.setOcrExtractedData(request.getOcrExtractedData());
        }

        student = studentRepository.save(student);
        if (record != null) {
            record = busPassRecordRepository.save(record);
        }
        return StudentDTO.BusPassDTO.from(student, record);
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
        // Find all teachers assigned to this bus and send each an in-app notification
        List<com.anuraguniversity.smartroute.teacher.entity.TeacherBusAssignment> assignments =
                teacherBusAssignmentRepository.findByBusId(busId);
        for (com.anuraguniversity.smartroute.teacher.entity.TeacherBusAssignment assignment : assignments) {
            UUID teacherUserId = assignment.getTeacher().getUser().getId();
            createNotification(teacherUserId, title, message, NotificationType.MISSED_BUS, busId);
        }
        if (!assignments.isEmpty()) {
            log.debug("Notified {} teacher(s) for bus {}", assignments.size(), busId);
        }
    }
}
