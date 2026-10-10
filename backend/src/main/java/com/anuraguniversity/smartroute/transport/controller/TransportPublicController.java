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
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
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
    public ResponseEntity<ApiResponse<List<BusDTO>>> getBuses(
            @RequestParam(required = false) Boolean activeOnly) {
        List<Bus> buses;
        if (Boolean.TRUE.equals(activeOnly)) {
            buses = busRepository.findByActiveTrue();
        } else {
            buses = busRepository.findAll();
        }
        List<BusDTO> busDTOs = buses.stream().map(BusDTO::from).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(busDTOs));
    }

    @GetMapping("/buses/{busId}")
    public ResponseEntity<ApiResponse<BusDTO>> getBus(@PathVariable UUID busId) {
        Bus bus = busRepository.findById(busId)
                .orElseThrow(() -> new com.anuraguniversity.smartroute.common.exception.ResourceNotFoundException("Bus not found"));
        return ResponseEntity.ok(ApiResponse.success(BusDTO.from(bus)));
    }

    @GetMapping("/buses/{busId}/location")
    public ResponseEntity<ApiResponse<BusDTO.LocationInfo>> getBusLocation(@PathVariable UUID busId) {
        Bus bus = busRepository.findById(busId)
                .orElseThrow(() -> new com.anuraguniversity.smartroute.common.exception.ResourceNotFoundException("Bus not found"));
        return ResponseEntity.ok(ApiResponse.success(BusDTO.LocationInfo.from(bus)));
    }

    @GetMapping("/routes")
    public ResponseEntity<ApiResponse<Page<RouteDTO>>> getRoutes(
            @RequestParam(required = false) UUID zoneId,
            @RequestParam(required = false) Direction direction,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        
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