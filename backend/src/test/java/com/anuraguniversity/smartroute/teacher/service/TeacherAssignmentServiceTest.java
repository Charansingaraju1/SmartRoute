package com.anuraguniversity.smartroute.teacher.service;

import com.anuraguniversity.smartroute.auth.entity.User;
import com.anuraguniversity.smartroute.auth.repository.UserRepository;
import com.anuraguniversity.smartroute.common.enums.AssignmentStatus;
import com.anuraguniversity.smartroute.common.enums.Direction;
import com.anuraguniversity.smartroute.common.exception.ResourceNotFoundException;
import com.anuraguniversity.smartroute.notification.repository.NotificationRepository;
import com.anuraguniversity.smartroute.student.entity.Student;
import com.anuraguniversity.smartroute.student.repository.StudentRepository;
import com.anuraguniversity.smartroute.teacher.dto.TeacherDTO;
import com.anuraguniversity.smartroute.teacher.entity.Teacher;
import com.anuraguniversity.smartroute.teacher.entity.TeacherBusAssignment;
import com.anuraguniversity.smartroute.teacher.repository.TeacherBusAssignmentRepository;
import com.anuraguniversity.smartroute.teacher.repository.TeacherRepository;
import com.anuraguniversity.smartroute.transport.entity.BoardingPoint;
import com.anuraguniversity.smartroute.transport.entity.Bus;
import com.anuraguniversity.smartroute.transport.entity.Route;
import com.anuraguniversity.smartroute.transport.entity.StudentBusAssignment;
import com.anuraguniversity.smartroute.transport.repository.BoardingPointRepository;
import com.anuraguniversity.smartroute.transport.repository.BusRepository;
import com.anuraguniversity.smartroute.transport.repository.RouteRepository;
import com.anuraguniversity.smartroute.transport.repository.StudentBusAssignmentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TeacherAssignmentServiceTest {

    @Mock
    private TeacherRepository teacherRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private TeacherBusAssignmentRepository teacherBusAssignmentRepository;
    @Mock
    private StudentRepository studentRepository;
    @Mock
    private BusRepository busRepository;
    @Mock
    private RouteRepository routeRepository;
    @Mock
    private BoardingPointRepository boardingPointRepository;
    @Mock
    private StudentBusAssignmentRepository studentBusAssignmentRepository;
    @Mock
    private NotificationRepository notificationRepository;

    @InjectMocks
    private TeacherService teacherService;

    private UUID userId;
    private Teacher teacher;
    private Bus bus;
    private Route route;
    private Student student;
    private BoardingPoint boardingPoint;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        teacher = new Teacher();
        teacher.setId(UUID.randomUUID());
        teacher.setCanManageAssignments(false);

        User teacherUser = new User();
        teacherUser.setId(userId);
        teacherUser.setName("Teacher User");
        teacherUser.setEmail("teacher@anurag.edu");
        teacher.setUser(teacherUser);

        bus = new Bus();
        bus.setId(UUID.randomUUID());
        bus.setRegistrationNumber("TS08UK1234");
        bus.setCapacity(50);
        bus.setCurrentStudentsCount(10);

        route = new Route();
        route.setId(UUID.randomUUID());
        route.setRouteCode("R-28");
        route.setDirection(Direction.MORNING);

        boardingPoint = new BoardingPoint();
        boardingPoint.setId(UUID.randomUUID());
        boardingPoint.setStopName("Sairam Theater");
        boardingPoint.setRoute(route);

        student = new Student();
        student.setId(UUID.randomUUID());
        student.setStudentId("24EG105V14");
        User studentUser = new User();
        studentUser.setId(UUID.randomUUID());
        studentUser.setName("Student Name");
        studentUser.setEmail("student@anurag.edu");
        student.setUser(studentUser);
    }

    @Test
    void createAssignment_success_updatesBusCapacityAndStudent() {
        when(teacherRepository.findByUserId(userId)).thenReturn(Optional.of(teacher));
        when(teacherBusAssignmentRepository.existsByTeacherIdAndBusId(teacher.getId(), bus.getId())).thenReturn(true);
        when(studentRepository.findById(student.getId())).thenReturn(Optional.of(student));
        when(busRepository.findById(bus.getId())).thenReturn(Optional.of(bus));
        when(routeRepository.findById(route.getId())).thenReturn(Optional.of(route));
        when(boardingPointRepository.findById(boardingPoint.getId())).thenReturn(Optional.of(boardingPoint));
        when(studentBusAssignmentRepository.findActiveByStudentAndDirection(student.getId(), Direction.MORNING))
                .thenReturn(Optional.empty());
        when(studentBusAssignmentRepository.countActiveByBus(bus.getId())).thenReturn(10L, 11L);

        when(studentBusAssignmentRepository.save(any(StudentBusAssignment.class))).thenAnswer(i -> {
            StudentBusAssignment a = i.getArgument(0);
            a.setId(UUID.randomUUID());
            return a;
        });
        when(userRepository.findById(student.getUser().getId())).thenReturn(Optional.of(student.getUser()));

        TeacherDTO.CreateAssignmentRequest request = TeacherDTO.CreateAssignmentRequest.builder()
                .studentId(student.getId())
                .busId(bus.getId())
                .routeId(route.getId())
                .boardingPointId(boardingPoint.getId())
                .direction(Direction.MORNING)
                .startDate(LocalDate.now())
                .assignmentNotes("Valid creation test")
                .build();

        TeacherDTO.AssignmentDTO result = teacherService.createAssignment(userId, request);

        assertNotNull(result);
        assertEquals(student.getId(), result.getStudent().getId());
        assertEquals(bus.getId(), result.getBus().getId());
        verify(studentRepository, times(1)).save(student);
        verify(busRepository, times(1)).save(bus);
        assertEquals(11, bus.getCurrentStudentsCount());
        assertEquals(AssignmentStatus.ACTIVE, student.getAssignmentStatus());
    }

    @Test
    void createAssignment_throwsWhenCapacityReached() {
        when(teacherRepository.findByUserId(userId)).thenReturn(Optional.of(teacher));
        when(teacherBusAssignmentRepository.existsByTeacherIdAndBusId(teacher.getId(), bus.getId())).thenReturn(true);
        when(studentRepository.findById(student.getId())).thenReturn(Optional.of(student));
        when(busRepository.findById(bus.getId())).thenReturn(Optional.of(bus));
        when(routeRepository.findById(route.getId())).thenReturn(Optional.of(route));
        when(studentBusAssignmentRepository.findActiveByStudentAndDirection(student.getId(), Direction.MORNING))
                .thenReturn(Optional.empty());
        when(studentBusAssignmentRepository.countActiveByBus(bus.getId())).thenReturn(50L);

        TeacherDTO.CreateAssignmentRequest request = TeacherDTO.CreateAssignmentRequest.builder()
                .studentId(student.getId())
                .busId(bus.getId())
                .routeId(route.getId())
                .direction(Direction.MORNING)
                .build();

        IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
                teacherService.createAssignment(userId, request));
        assertTrue(ex.getMessage().contains("Bus capacity reached"));
        verify(studentBusAssignmentRepository, never()).save(any());
    }

    @Test
    void createAssignment_throwsWhenDuplicateActiveAssignmentExists() {
        when(teacherRepository.findByUserId(userId)).thenReturn(Optional.of(teacher));
        when(teacherBusAssignmentRepository.existsByTeacherIdAndBusId(teacher.getId(), bus.getId())).thenReturn(true);
        when(studentRepository.findById(student.getId())).thenReturn(Optional.of(student));
        when(busRepository.findById(bus.getId())).thenReturn(Optional.of(bus));
        when(routeRepository.findById(route.getId())).thenReturn(Optional.of(route));

        StudentBusAssignment existing = new StudentBusAssignment();
        when(studentBusAssignmentRepository.findActiveByStudentAndDirection(student.getId(), Direction.MORNING))
                .thenReturn(Optional.of(existing));

        TeacherDTO.CreateAssignmentRequest request = TeacherDTO.CreateAssignmentRequest.builder()
                .studentId(student.getId())
                .busId(bus.getId())
                .routeId(route.getId())
                .direction(Direction.MORNING)
                .build();

        IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
                teacherService.createAssignment(userId, request));
        assertTrue(ex.getMessage().contains("already has an active assignment"));
    }

    @Test
    void createAssignment_throwsWhenTeacherNotInScope() {
        when(teacherRepository.findByUserId(userId)).thenReturn(Optional.of(teacher));
        when(teacherBusAssignmentRepository.existsByTeacherIdAndBusId(teacher.getId(), bus.getId())).thenReturn(false);

        TeacherDTO.CreateAssignmentRequest request = TeacherDTO.CreateAssignmentRequest.builder()
                .studentId(student.getId())
                .busId(bus.getId())
                .routeId(route.getId())
                .build();

        assertThrows(ResourceNotFoundException.class, () ->
                teacherService.createAssignment(userId, request));
    }

    @Test
    void cancelAssignment_success_releasesCapacityAndUpdatesStudent() {
        UUID assignmentId = UUID.randomUUID();
        StudentBusAssignment assignment = new StudentBusAssignment();
        assignment.setId(assignmentId);
        assignment.setStudent(student);
        assignment.setBus(bus);
        assignment.setRoute(route);
        assignment.setStatus(AssignmentStatus.ACTIVE);
        assignment.setDirection(Direction.MORNING);

        student.setBus(bus);
        student.setRoute(route);
        student.setAssignmentStatus(AssignmentStatus.ACTIVE);

        when(teacherRepository.findByUserId(userId)).thenReturn(Optional.of(teacher));
        when(studentBusAssignmentRepository.findById(assignmentId)).thenReturn(Optional.of(assignment));
        when(teacherBusAssignmentRepository.existsByTeacherIdAndBusId(teacher.getId(), bus.getId())).thenReturn(true);
        when(studentBusAssignmentRepository.save(any(StudentBusAssignment.class))).thenAnswer(i -> i.getArgument(0));
        when(studentBusAssignmentRepository.findActiveByStudentAndDirection(student.getId(), Direction.MORNING))
                .thenReturn(Optional.empty());
        when(studentBusAssignmentRepository.countActiveByBus(bus.getId())).thenReturn(9L);
        when(userRepository.findById(student.getUser().getId())).thenReturn(Optional.of(student.getUser()));

        TeacherDTO.AssignmentDTO result = teacherService.cancelAssignment(userId, assignmentId, "Test cancellation");

        assertNotNull(result);
        assertEquals(AssignmentStatus.CANCELLED, assignment.getStatus());
        assertNull(student.getBus());
        assertNull(student.getRoute());
        assertNull(student.getAssignmentStatus());
        verify(busRepository, times(1)).save(bus);
        assertEquals(9, bus.getCurrentStudentsCount());
    }
}
