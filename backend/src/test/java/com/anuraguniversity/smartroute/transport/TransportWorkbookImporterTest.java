package com.anuraguniversity.smartroute.transport;

import com.anuraguniversity.smartroute.transport.dto.ImportResult;
import com.anuraguniversity.smartroute.transport.entity.Bus;
import com.anuraguniversity.smartroute.transport.entity.Route;
import com.anuraguniversity.smartroute.transport.entity.Zone;
import com.anuraguniversity.smartroute.transport.repository.BoardingPointRepository;
import com.anuraguniversity.smartroute.transport.repository.BusRepository;
import com.anuraguniversity.smartroute.transport.repository.RouteRepository;
import com.anuraguniversity.smartroute.transport.repository.ZoneRepository;
import com.anuraguniversity.smartroute.transport.service.TransportWorkbookImporter;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.io.ClassPathResource;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TransportWorkbookImporterTest {

    @Mock
    private ZoneRepository zoneRepository;

    @Mock
    private BusRepository busRepository;

    @Mock
    private RouteRepository routeRepository;

    @Mock
    private BoardingPointRepository boardingPointRepository;

    private TransportWorkbookImporter importer;

    @BeforeEach
    void setUp() {
        importer = new TransportWorkbookImporter(
                zoneRepository,
                busRepository,
                routeRepository,
                boardingPointRepository,
                new ObjectMapper()
        );
        ReflectionTestUtils.setField(importer, "jsonResource", new ClassPathResource("data/transport_data.json"));
    }

    @Test
    void importWorkbook_ShouldParseAndSaveBusesWithDualPhoneNumbers() {
        when(busRepository.findByRegistrationNumber(any())).thenReturn(Optional.empty());
        when(busRepository.save(any(Bus.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ImportResult result = importer.importWorkbook();

        assertNotNull(result);
        verify(busRepository, atLeast(60)).save(argThat(bus -> {
            if ("TS08UG5275".equals(bus.getRegistrationNumber())) {
                assertEquals("9398187515 / 9603040944", bus.getDriverPhone());
                return true;
            }
            return true;
        }));
    }

    @Test
    void importWorkbook_ShouldParseAndBatchSaveRoutesAndStops() {
        when(zoneRepository.save(any(Zone.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(busRepository.save(any(Bus.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(routeRepository.save(any(Route.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ImportResult result = importer.importWorkbook();

        assertNotNull(result);
        assertTrue(result.getRowsTransformed() > 0);
        verify(routeRepository, atLeast(60)).save(any(Route.class));
        verify(boardingPointRepository, atLeast(60)).saveAll(any());
    }

    @Test
    void importWorkbook_ShouldHandleRouteFailureGracefullyWithoutAbortingOtherRoutes() {
        when(zoneRepository.save(any(Zone.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(busRepository.save(any(Bus.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(routeRepository.save(any(Route.class)))
                .thenThrow(new RuntimeException("Simulated socket closed error"))
                .thenAnswer(invocation -> invocation.getArgument(0));

        ImportResult result = importer.importWorkbook();

        assertNotNull(result);
        assertTrue(result.getRowsRejected() >= 1);
        assertTrue(result.getRowsTransformed() > 0);
        assertTrue(result.getErrors().stream().anyMatch(e -> e.contains("Simulated socket closed error")));
    }
}
