package com.anuraguniversity.smartroute.transport.controller;

import com.anuraguniversity.smartroute.transport.dto.ZoneDTO;
import com.anuraguniversity.smartroute.transport.dto.BusDTO;
import com.anuraguniversity.smartroute.transport.dto.RouteDTO;
import com.anuraguniversity.smartroute.transport.dto.BoardingPointDTO;
import com.anuraguniversity.smartroute.transport.entity.Zone;
import com.anuraguniversity.smartroute.transport.entity.Bus;
import com.anuraguniversity.smartroute.transport.entity.Route;
import com.anuraguniversity.smartroute.transport.entity.BoardingPoint;
import com.anuraguniversity.smartroute.transport.repository.ZoneRepository;
import com.anuraguniversity.smartroute.transport.repository.BusRepository;
import com.anuraguniversity.smartroute.transport.repository.RouteRepository;
import com.anuraguniversity.smartroute.transport.repository.BoardingPointRepository;
import com.anuraguniversity.smartroute.common.enums.Direction;
import com.anuraguniversity.smartroute.common.dto.ApiResponse;
import com.anuraguniversity.smartroute.transport.repository.StudentBusAssignmentRepository;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/")
@RequiredArgsConstructor
public class TransportPublicController {

    private final ZoneRepository zoneRepository;
    private final BusRepository busRepository;
    private final RouteRepository routeRepository;
    private final BoardingPointRepository boardingPointRepository;
    private final StudentBusAssignmentRepository studentBusAssignmentRepository;

    @GetMapping("/zones")
    public ResponseEntity<ApiResponse<List<ZoneDTO>>> getZones() {
        List<Zone> zones = zoneRepository.findAll(Sort.by("displayOrder").and(Sort.by("name")));
        List<ZoneDTO> zoneDTOs = zones.stream().map(ZoneDTO::from).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(zoneDTOs));
    }

    @GetMapping("/buses/zones")
    public ResponseEntity<ApiResponse<List<ZoneDTO>>> getBusesZones() {
        return getZones();
    }

    @GetMapping("/zones/{zoneId}")
    public ResponseEntity<ApiResponse<ZoneDTO>> getZone(@PathVariable UUID zoneId) {
        Zone zone = zoneRepository.findById(zoneId)
                .orElseThrow(() -> new com.anuraguniversity.smartroute.common.exception.ResourceNotFoundException("Zone not found"));
        return ResponseEntity.ok(ApiResponse.success(ZoneDTO.from(zone)));
    }

    @GetMapping("/buses")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<List<BusDTO>>> getBuses(
            @RequestParam(required = false) Boolean activeOnly) {
        List<Bus> buses;
        if (Boolean.TRUE.equals(activeOnly)) {
            buses = busRepository.findByActiveTrue();
        } else {
            buses = busRepository.findAll();
        }
        List<BusDTO> busDTOs = buses.stream().map(b -> {
            BusDTO dto = BusDTO.from(b);
            long activeCount = studentBusAssignmentRepository.countActiveByBus(b.getId());
            int effectiveStudents = activeCount > 0 ? (int) activeCount : (b.getCurrentStudentsCount() != null ? b.getCurrentStudentsCount() : 0);
            dto.setCurrentStudentsCount(effectiveStudents);
            dto.setAvailableCapacity(Math.max(0, b.getCapacity() - effectiveStudents));
            return dto;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(busDTOs));
    }

    @GetMapping("/buses/{busId}")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<BusDTO>> getBus(@PathVariable UUID busId) {
        Bus bus = busRepository.findById(busId)
                .orElseThrow(() -> new com.anuraguniversity.smartroute.common.exception.ResourceNotFoundException("Bus not found"));
        BusDTO dto = BusDTO.from(bus);
        long activeCount = studentBusAssignmentRepository.countActiveByBus(bus.getId());
        int effectiveStudents = activeCount > 0 ? (int) activeCount : (bus.getCurrentStudentsCount() != null ? bus.getCurrentStudentsCount() : 0);
        dto.setCurrentStudentsCount(effectiveStudents);
        dto.setAvailableCapacity(Math.max(0, bus.getCapacity() - effectiveStudents));
        return ResponseEntity.ok(ApiResponse.success(dto));
    }

    @GetMapping("/buses/verify/{identifier}")
    public ResponseEntity<ApiResponse<BusDTO>> verifyBus(@PathVariable String identifier) {
        String cleanIdentifier = java.net.URLDecoder.decode(identifier, java.nio.charset.StandardCharsets.UTF_8).trim();
        if (cleanIdentifier.contains("/")) {
            cleanIdentifier = cleanIdentifier.substring(cleanIdentifier.lastIndexOf('/') + 1).trim();
        }
        if (cleanIdentifier.toUpperCase().startsWith("SMARTROUTE:BUS:")) {
            cleanIdentifier = cleanIdentifier.substring(15).trim();
        }

        Bus bus = null;

        try {
            UUID busId = UUID.fromString(cleanIdentifier);
            bus = busRepository.findById(busId).orElse(null);
        } catch (IllegalArgumentException ignored) {}

        if (bus == null) {
            bus = busRepository.findByRegistrationNumberIgnoreCase(cleanIdentifier).orElse(null);
        }

        if (bus == null) {
            String stripped = cleanIdentifier.replaceAll("[\\s\\-_]", "");
            bus = busRepository.findByRegistrationNumberIgnoreCase(stripped).orElse(null);
        }

        if (bus == null) {
            bus = busRepository.findByBusNumberIgnoreCase(cleanIdentifier).orElse(null);
        }

        if (bus == null) {
            throw new com.anuraguniversity.smartroute.common.exception.ResourceNotFoundException(
                "Unregistered or invalid bus. No matching Anurag University bus found for: " + identifier);
        }

        BusDTO dto = BusDTO.from(bus);
        dto.setVerified(true);

        Optional<Route> assignedRoute = routeRepository.findFirstByBusIdAndActiveTrue(bus.getId());
        if (assignedRoute.isPresent()) {
            Route r = assignedRoute.get();
            dto.setAssignedRoute(BusDTO.RouteSummary.builder()
                .id(r.getId())
                .routeCode(r.getRouteCode())
                .routeName(r.getRouteName())
                .direction(r.getDirection())
                .build());
        }

        return ResponseEntity.ok(ApiResponse.success(dto, "Bus verified successfully as registered Anurag University Transport"));
    }

    @GetMapping("/buses/{busId}/location")
    public ResponseEntity<ApiResponse<BusDTO.LocationInfo>> getBusLocation(@PathVariable UUID busId) {
        Bus bus = busRepository.findById(busId)
                .orElseThrow(() -> new com.anuraguniversity.smartroute.common.exception.ResourceNotFoundException("Bus not found"));
        return ResponseEntity.ok(ApiResponse.success(BusDTO.LocationInfo.from(bus)));
    }

    @GetMapping("/routes")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<Page<RouteDTO>>> getRoutes(
            @RequestParam(required = false) UUID zoneId,
            @RequestParam(required = false) Direction direction,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "100") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("routeCode"));
        Page<Route> routes;
        
        if (zoneId != null && direction != null) {
            routes = routeRepository.findActiveByZoneAndDirection(zoneId, direction, pageable);
        } else if (zoneId != null) {
            routes = routeRepository.findByZoneIdAndActiveTrue(zoneId, pageable);
        } else if (direction != null) {
            routes = routeRepository.findAll(pageable).map(r -> r.getDirection() == direction ? r : null);
        } else {
            routes = routeRepository.findAll(pageable);
        }
        
        Page<RouteDTO> routeDTOs = routes.map(RouteDTO::from);
        return ResponseEntity.ok(ApiResponse.success(routeDTOs));
    }

    @GetMapping("/routes/{routeId}")
    public ResponseEntity<ApiResponse<RouteDTO>> getRoute(@PathVariable UUID routeId) {
        Route route = routeRepository.findById(routeId)
                .orElseThrow(() -> new com.anuraguniversity.smartroute.common.exception.ResourceNotFoundException("Route not found"));
        return ResponseEntity.ok(ApiResponse.success(RouteDTO.from(route)));
    }

    @GetMapping("/stops")
    public ResponseEntity<ApiResponse<List<BoardingPointDTO>>> getStops(
            @RequestParam UUID routeId) {
        List<BoardingPoint> stops = boardingPointRepository.findByRouteIdAndActiveTrueOrderByStopOrderAsc(routeId);
        List<BoardingPointDTO> stopDTOs = stops.stream().map(BoardingPointDTO::from).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(stopDTOs));
    }

    @GetMapping("/stops/{stopId}")
    public ResponseEntity<ApiResponse<BoardingPointDTO>> getStop(@PathVariable UUID stopId) {
        BoardingPoint stop = boardingPointRepository.findById(stopId)
                .orElseThrow(() -> new com.anuraguniversity.smartroute.common.exception.ResourceNotFoundException("Boarding point not found"));
        return ResponseEntity.ok(ApiResponse.success(BoardingPointDTO.from(stop)));
    }
}