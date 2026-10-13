package com.anuraguniversity.smartroute.buspass.service;

import com.anuraguniversity.smartroute.buspass.entity.BusPassRecord;
import com.anuraguniversity.smartroute.buspass.repository.BusPassRecordRepository;
import com.anuraguniversity.smartroute.common.enums.AssignmentStatus;
import com.anuraguniversity.smartroute.student.dto.StudentDTO;
import com.anuraguniversity.smartroute.student.entity.Student;
import com.anuraguniversity.smartroute.student.repository.StudentRepository;
import com.anuraguniversity.smartroute.transport.entity.BoardingPoint;
import com.anuraguniversity.smartroute.transport.entity.Bus;
import com.anuraguniversity.smartroute.transport.entity.Route;
import com.anuraguniversity.smartroute.transport.repository.BoardingPointRepository;
import com.anuraguniversity.smartroute.transport.repository.BusRepository;
import com.anuraguniversity.smartroute.transport.repository.RouteRepository;
import com.anuraguniversity.smartroute.transport.repository.StudentBusAssignmentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalTime;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BusPassRecognitionServiceTest {

    @Mock
    private RouteRepository routeRepository;

    @Mock
    private BusRepository busRepository;

    @Mock
    private BoardingPointRepository boardingPointRepository;

    @Mock
    private StudentBusAssignmentRepository assignmentRepository;

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private BusPassRecordRepository busPassRecordRepository;

    @InjectMocks
    private BusPassRecognitionService recognitionService;

    @TempDir
    Path tempDir;

    private Route route28;
    private Bus bus28;
    private BoardingPoint stopSairamTheater;

    private Route route39;
    private Bus bus39;

    @BeforeEach
    void setUp() {
        // Route 28
        route28 = new Route();
        route28.setId(UUID.randomUUID());
        route28.setRouteCode("R-28");
        route28.setRouteName("Sairam Theater to College");

        bus28 = new Bus();
        bus28.setId(UUID.randomUUID());
        bus28.setBusNumber("Bus 28");
        bus28.setRegistrationNumber("TS08UK2801");
        bus28.setActive(true);
        route28.setBus(bus28);

        stopSairamTheater = new BoardingPoint();
        stopSairamTheater.setId(UUID.randomUUID());
        stopSairamTheater.setStopName("SAIRAM THEATER");
        stopSairamTheater.setStopTime(LocalTime.of(7, 35));
        stopSairamTheater.setRoute(route28);

        // Route 39
        route39 = new Route();
        route39.setId(UUID.randomUUID());
        route39.setRouteCode("R-39");
        route39.setRouteName("Suchithra to College");

        bus39 = new Bus();
        bus39.setId(UUID.randomUUID());
        bus39.setBusNumber("Bus 39");
        bus39.setRegistrationNumber("TS08UK3904");
        bus39.setActive(true);
        route39.setBus(bus39);
    }

    @Test
    @DisplayName("canonicalizePassNumber standardizes ASS-, FASS-, BUS-PASS- into PASS- prefix")
    void testCanonicalizePassNumber() {
        assertEquals("PASS-31849762", BusPassRecognitionService.canonicalizePassNumber("ASS-31849762"));
        assertEquals("PASS-31849762", BusPassRecognitionService.canonicalizePassNumber("PASS-31849762"));
        assertEquals("PASS-31849762", BusPassRecognitionService.canonicalizePassNumber("FASS-31849762"));
        assertEquals("PASS-31849762", BusPassRecognitionService.canonicalizePassNumber("BUS-PASS-31849762"));
        assertEquals("PASS-31849762", BusPassRecognitionService.canonicalizePassNumber("31849762"));
        assertEquals("PASS-24EG105V14", BusPassRecognitionService.canonicalizePassNumber("ASS-24EG105V14"));
        assertTrue(BusPassRecognitionService.canonicalizePassNumber(null).startsWith("PASS-"));
        assertTrue(BusPassRecognitionService.canonicalizePassNumber("   ").startsWith("PASS-"));
    }

    @Test
    @DisplayName("Recognizing Route 28 and Sairam Theater auto-assigns active status and updates student assignment")
    void testRecognizeRoute28AndSairamTheater_AutoAssigns() throws IOException {
        when(boardingPointRepository.findAll()).thenReturn(List.of(stopSairamTheater));
        when(routeRepository.findAll()).thenReturn(List.of(route28, route39));

        Student student = new Student();
        student.setId(UUID.randomUUID());
        student.setStudentId("24EG105V14");

        BusPassRecord record = new BusPassRecord();
        record.setId(UUID.randomUUID());
        record.setStudent(student);
        record.setPassNumber("ASS-31849762");

        Path testFile = tempDir.resolve("pass_r28.txt");
        String content = "ANURAG UNIVERSITY\nSTUDENT BUS PASS\n"
                + "Name: SINGARAJU N R SAI CHARAN\n"
                + "HT No: 24EG105V14\n"
                + "Route No. 28\n"
                + "Boarding at SAIRAM THEATER\n"
                + "Academic Year 2026-27\n"
                + "PASS NO: ASS-31849762\n";
        Files.writeString(testFile, content);

        BusPassRecognitionService.RecognitionResult result =
                recognitionService.recognizeAndProcess(student, record, testFile, "pass_r28.txt");

        assertNotNull(result);
        assertTrue(result.isAutoAssigned(), "Should be auto-assigned when both Route and Stop match official transport DB");
        assertEquals("R-28", result.getDetectedRouteCode());
        assertEquals("SAIRAM THEATER", result.getDetectedStopName());
        assertEquals("PASS-31849762", result.getPassNumber());

        assertEquals(BusPassRecord.Status.ACTIVE.name(), record.getStatus());
        assertEquals(route28, record.getRoute());
        assertEquals(bus28, record.getBus());
        assertEquals("PASS-31849762", record.getPassNumber());

        assertEquals(route28, student.getRoute());
        assertEquals(bus28, student.getBus());
        assertEquals(stopSairamTheater, student.getBoardingPoint());
        assertTrue(student.getBusPassVerified());

        verify(studentRepository, times(1)).save(student);
        verify(busPassRecordRepository, times(1)).save(record);
        verify(assignmentRepository, times(1)).save(any());
    }

    @Test
    @DisplayName("Uncertain OCR keeps pass PENDING_VERIFICATION, bus null, and preserves student existing Route 39")
    void testRecognizeUncertainOcr_PreservesExistingRoute39() throws IOException {
        when(boardingPointRepository.findAll()).thenReturn(Collections.emptyList());
        when(routeRepository.findAll()).thenReturn(List.of(route28, route39));

        // Student has an existing active Route 39 assignment
        Student student = new Student();
        student.setId(UUID.randomUUID());
        student.setStudentId("24EG105V14");
        student.setRoute(route39);
        student.setBus(bus39);
        student.setAssignmentStatus(AssignmentStatus.ACTIVE);
        student.setBusPassVerified(false);

        BusPassRecord record = new BusPassRecord();
        record.setId(UUID.randomUUID());
        record.setStudent(student);
        record.setPassNumber("ASS-31849762");

        Path testFile = tempDir.resolve("uncertain_pass.txt");
        String content = "ANURAG UNIVERSITY\nBLURRED DOCUMENT WITH NO ROUTE OR STOP\n"
                + "Academic Year: 2026-27\n"
                + "Pass No: ASS-31849762\n";
        Files.writeString(testFile, content);

        BusPassRecognitionService.RecognitionResult result =
                recognitionService.recognizeAndProcess(student, record, testFile, "uncertain_pass.txt");

        assertNotNull(result);
        assertFalse(result.isAutoAssigned(), "Should not auto-assign when route and stop are uncertain");
        assertEquals("PASS-31849762", result.getPassNumber());
        assertNull(result.getDetectedRouteCode());
        assertNull(result.getDetectedStopName());

        // BusPassRecord must be pending, route null, bus null
        assertEquals(BusPassRecord.Status.PENDING_VERIFICATION.name(), record.getStatus());
        assertNull(record.getRoute(), "Record route must be null when uncertain");
        assertNull(record.getBus(), "Record bus must be null when uncertain");
        assertEquals("PASS-31849762", record.getPassNumber());

        // CRITICAL: Student's existing assignment to Route 39 must NOT be altered or overwritten!
        assertEquals(route39, student.getRoute(), "Student's existing route must remain intact");
        assertEquals(bus39, student.getBus(), "Student's existing bus must remain intact");
        assertFalse(student.getBusPassVerified());

        verify(studentRepository, times(1)).save(student);
        verify(busPassRecordRepository, times(1)).save(record);
        // StudentBusAssignment must NOT be overwritten when unverified
        verify(assignmentRepository, never()).save(any());
    }

    @Test
    @DisplayName("StudentDTO.BusPassDTO does not silently fallback to student route when pass record route is null")
    void testBusPassDTO_DoesNotFallbackToStudentRoute() {
        Student student = new Student();
        student.setId(UUID.randomUUID());
        student.setRoute(route39);
        student.setBus(bus39);

        BusPassRecord record = new BusPassRecord();
        record.setId(UUID.randomUUID());
        record.setPassNumber("ASS-31849762");
        record.setStatus(BusPassRecord.Status.PENDING_VERIFICATION.name());
        record.setRoute(null);
        record.setBus(null);
        record.setStudent(student);

        StudentDTO.BusPassDTO dto = StudentDTO.BusPassDTO.from(student, record);

        assertNotNull(dto);
        assertEquals("PASS-31849762", dto.getPassNumber(), "Pass number must be canonical");
        assertNull(dto.getRoute(), "DTO route must be null if pass record route is null (no silent fallback)");
        assertNull(dto.getBus(), "DTO bus must be null if pass record bus is null (no silent fallback)");

        // The DTO must cleanly expose the student's active assignment separately
        assertNotNull(dto.getStudentAssignedRoute());
        assertEquals("R-39", dto.getStudentAssignedRoute().getRouteCode());
        assertNotNull(dto.getStudentAssignedBus());
        assertEquals("Bus 39", dto.getStudentAssignedBus().getBusNumber());
    }
}
