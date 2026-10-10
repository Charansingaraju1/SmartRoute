package com.anuraguniversity.smartroute.transport.service;

import com.anuraguniversity.smartroute.transport.dto.ImportResult;
import com.anuraguniversity.smartroute.transport.entity.Bus;
import com.anuraguniversity.smartroute.transport.entity.BoardingPoint;
import com.anuraguniversity.smartroute.transport.entity.Route;
import com.anuraguniversity.smartroute.transport.entity.Zone;
import com.anuraguniversity.smartroute.transport.repository.BusRepository;
import com.anuraguniversity.smartroute.transport.repository.BoardingPointRepository;
import com.anuraguniversity.smartroute.transport.repository.RouteRepository;
import com.anuraguniversity.smartroute.transport.repository.ZoneRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.io.InputStream;
import java.math.BigDecimal;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;

@Service
@RequiredArgsConstructor
@Slf4j
public class TransportWorkbookImporter {

    private final ZoneRepository zoneRepository;
    private final BusRepository busRepository;
    private final RouteRepository routeRepository;
    private final BoardingPointRepository boardingPointRepository;

    @Value("${smartroute.transport.workbook-path:classpath:data/AU_College_Transport_2026-2027-1.xls}")
    private Resource workbookResource;

    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("h:mm a");
    private static final DateTimeFormatter TIME_FORMATTER_24 = DateTimeFormatter.ofPattern("HH:mm");
    private static final Set<String> KNOWN_SHEETS = Set.of(
        "Routes", "Zone routes", "DSNR Zone", "Ramanthapur Zone", 
        "Uppal Zone", "Secunderabad Zone", "ECIL Zone", "Bhongir Zone"
    );

    @Transactional
    public ImportResult importWorkbook() {
        ImportResult result = new ImportResult();
        
        if (!workbookResource.exists()) {
            log.warn("Transport workbook not found at: {}", workbookResource.getDescription());
            result.addError("Workbook not found: " + workbookResource.getDescription());
            result.setWorkbookMissing(true);
            return result;
        }

        try (InputStream is = workbookResource.getInputStream();
             Workbook workbook = WorkbookFactory.create(is)) {

            log.info("Workbook loaded: {} sheets", workbook.getNumberOfSheets());
            
            for (int i = 0; i < workbook.getNumberOfSheets(); i++) {
                Sheet sheet = workbook.getSheetAt(i);
                String sheetName = sheet.getSheetName();
                log.info("Processing sheet: {}", sheetName);
                
                if (KNOWN_SHEETS.contains(sheetName) || sheetName.contains("Zone") || sheetName.contains("Route")) {
                    processSheet(sheet, sheetName, result);
                } else {
                    log.debug("Skipping unknown sheet: {}", sheetName);
                }
            }

            verifyImport(result);
            logImportSummary(result);

        } catch (Exception e) {
            log.error("Failed to import workbook", e);
            result.addError("Import failed: " + e.getMessage());
        }

        return result;
    }

    private void processSheet(Sheet sheet, String sheetName, ImportResult result) {
        if (sheetName.equalsIgnoreCase("Routes") || sheetName.equalsIgnoreCase("Zone routes")) {
            processRoutesSheet(sheet, result);
        } else if (sheetName.contains("Zone")) {
            processZoneSheet(sheet, sheetName, result);
        }
    }

    private void processRoutesSheet(Sheet sheet, ImportResult result) {
        AtomicInteger rowNum = new AtomicInteger(0);
        
        sheet.forEach(row -> {
            if (rowNum.get() == 0) {
                rowNum.incrementAndGet();
                return; // Skip header
            }
            
            try {
                String zoneName = getStringCellValue(row.getCell(0));
                String routeCode = getStringCellValue(row.getCell(1));
                String routeName = getStringCellValue(row.getCell(2));
                String directionStr = getStringCellValue(row.getCell(3));
                String startingPoint = getStringCellValue(row.getCell(4));
                String startingTimeStr = getStringCellValue(row.getCell(5));
                String endingPoint = getStringCellValue(row.getCell(6));
                String endingTimeStr = getStringCellValue(row.getCell(7));
                String description = getStringCellValue(row.getCell(8));
                String distanceStr = getStringCellValue(row.getCell(9));
                String durationStr = getStringCellValue(row.getCell(10));
                String feeStr = getStringCellValue(row.getCell(11));
                String busReg = getStringCellValue(row.getCell(12));
                String driverName = getStringCellValue(row.getCell(13));
                String conductorName = getStringCellValue(row.getCell(14));

                if (!StringUtils.hasText(zoneName) || !StringUtils.hasText(routeCode)) {
                    result.incrementSkipped();
                    return;
                }

                Zone zone = findOrCreateZone(zoneName, result);
                if (zone == null) {
                    result.incrementRejected();
                    return;
                }

                com.anuraguniversity.smartroute.common.enums.Direction direction = parseDirection(directionStr);
                if (direction == null) {
                    result.incrementRejected();
                    return;
                }

                Route route = findOrCreateRoute(zone, routeCode, routeName, direction, result);
                if (route == null) {
                    result.incrementRejected();
                    return;
                }

                updateRouteDetails(route, startingPoint, startingTimeStr, endingPoint, endingTimeStr, 
                    description, distanceStr, durationStr, feeStr);

                if (StringUtils.hasText(busReg)) {
                    Bus bus = findOrCreateBus(busReg, driverName, conductorName, result);
                    if (bus != null) {
                        route.setBus(bus);
                    }
                }

                routeRepository.save(route);
                result.incrementTransformed();

            } catch (Exception e) {
                log.warn("Error processing route row {}: {}", rowNum.get(), e.getMessage());
                result.incrementRejected();
            } finally {
                rowNum.incrementAndGet();
            }
        });
    }

    private void processZoneSheet(Sheet sheet, String sheetName, ImportResult result) {
        String zoneName = sheetName.replace(" Zone", "").trim();
        Zone zone = findOrCreateZone(zoneName, result);
        if (zone == null) return;

        AtomicInteger rowNum = new AtomicInteger(0);
        
        sheet.forEach(row -> {
            if (rowNum.get() == 0) {
                rowNum.incrementAndGet();
                return;
            }

            try {
                String routeCode = getStringCellValue(row.getCell(0));
                String routeName = getStringCellValue(row.getCell(1));
                String directionStr = getStringCellValue(row.getCell(2));
                String startingPoint = getStringCellValue(row.getCell(3));
                String startingTimeStr = getStringCellValue(row.getCell(4));
                String busReg = getStringCellValue(row.getCell(5));
                String driverName = getStringCellValue(row.getCell(6));
                String conductorName = getStringCellValue(row.getCell(7));

                // Boarding points start from column 8 onwards
                List<BoardingPointData> stops = new ArrayList<>();
                for (int col = 8; col < row.getLastCellNum(); col++) {
                    Cell cell = row.getCell(col);
                    if (cell != null && cell.getCellType() != CellType.BLANK) {
                        String stopData = getStringCellValue(cell);
                        BoardingPointData stop = parseStopData(stopData, col - 8);
                        if (stop != null) {
                            stops.add(stop);
                        }
                    }
                }

                if (!StringUtils.hasText(routeCode) || stops.isEmpty()) {
                    result.incrementSkipped();
                    return;
                }

                com.anuraguniversity.smartroute.common.enums.Direction direction = parseDirection(directionStr);
                if (direction == null) {
                    result.incrementRejected();
                    return;
                }

                Route route = findOrCreateRoute(zone, routeCode, routeName, direction, result);
                if (route == null) {
                    result.incrementRejected();
                    return;
                }

                updateRouteDetails(route, startingPoint, startingTimeStr, null, null, null, null, null, null);

                if (StringUtils.hasText(busReg)) {
                    Bus bus = findOrCreateBus(busReg, driverName, conductorName, result);
                    if (bus != null) {
                        route.setBus(bus);
                    }
                }

                // Save boarding points
                for (int i = 0; i < stops.size(); i++) {
                    BoardingPointData stopData = stops.get(i);
                    BoardingPoint bp = findOrCreateBoardingPoint(route, i + 1, stopData, result);
                    if (bp != null) {
                        boardingPointRepository.save(bp);
                    }
                }

                routeRepository.save(route);
                result.incrementTransformed();

            } catch (Exception e) {
                log.warn("Error processing zone row {} in {}: {}", rowNum.get(), sheetName, e.getMessage());
                result.incrementRejected();
            } finally {
                rowNum.incrementAndGet();
            }
        });
    }

    private Zone findOrCreateZone(String name, ImportResult result) {
        return zoneRepository.findByName(name).orElseGet(() -> {
            String code = generateZoneCode(name);
            long count = zoneRepository.count();
            Zone zone = Zone.create(name, code, "Zone imported from workbook", (int) count + 1);
            Zone saved = zoneRepository.save(zone);
            result.incrementZoneCount();
            log.info("Created new zone: {} ({})", name, code);
            return saved;
        });
    }

    private String generateZoneCode(String name) {
        String code = name.toUpperCase().replaceAll("[^A-Z]", "").substring(0, Math.min(5, name.length()));
        String baseCode = code;
        int suffix = 1;
        while (zoneRepository.existsByCode(code)) {
            code = baseCode + suffix++;
        }
        return code;
    }

    private Route findOrCreateRoute(Zone zone, String routeCode, String routeName, 
            com.anuraguniversity.smartroute.common.enums.Direction direction, ImportResult result) {
        return routeRepository.findByRouteCodeAndZoneIdAndDirection(routeCode, zone.getId(), direction)
            .orElseGet(() -> {
                long count = routeRepository.countByZoneId(zone.getId());
                Route route = Route.create(zone, routeCode, routeName, direction, (int) count + 1);
                result.incrementRouteAssignmentCount();
                log.debug("Created new route: {} - {}", routeCode, routeName);
                return route;
            });
    }

    private void updateRouteDetails(Route route, String startingPoint, String startingTimeStr,
            String endingPoint, String endingTimeStr, String description, 
            String distanceStr, String durationStr, String feeStr) {
        if (StringUtils.hasText(startingPoint)) route.setStartingPoint(startingPoint);
        if (StringUtils.hasText(startingTimeStr)) route.setStartingTime(parseTime(startingTimeStr));
        if (StringUtils.hasText(endingPoint)) route.setEndingPoint(endingPoint);
        if (StringUtils.hasText(endingTimeStr)) route.setEndingTime(parseTime(endingTimeStr));
        if (StringUtils.hasText(description)) route.setDescription(description);
        if (StringUtils.hasText(distanceStr)) route.setDistanceKm(parseDouble(distanceStr));
        if (StringUtils.hasText(durationStr)) route.setEstimatedDurationMinutes(parseInt(durationStr));
        if (StringUtils.hasText(feeStr)) route.setFeeAmount(parseBigDecimal(feeStr));
    }

    private Bus findOrCreateBus(String registrationNumber, String driverName, String conductorName, ImportResult result) {
        return busRepository.findByRegistrationNumber(registrationNumber).orElseGet(() -> {
            Bus bus = Bus.create(registrationNumber.toUpperCase().trim(), driverName, conductorName);
            Bus saved = busRepository.save(bus);
            result.incrementUniqueBusCount();
            log.info("Created new bus: {}", registrationNumber);
            return saved;
        });
    }

    private BoardingPoint findOrCreateBoardingPoint(Route route, int stopOrder, BoardingPointData stopData, ImportResult result) {
        return boardingPointRepository.findByRouteIdAndStopOrder(route.getId(), stopOrder)
            .orElseGet(() -> {
                BoardingPoint bp = BoardingPoint.create(route, stopData.name(), stopData.description(), 
                    stopOrder, stopData.time(), stopData.latitude(), stopData.longitude(), stopData.landmark());
                BoardingPoint saved = boardingPointRepository.save(bp);
                result.incrementBoardingStopCount();
                return saved;
            });
    }

    private com.anuraguniversity.smartroute.common.enums.Direction parseDirection(String directionStr) {
        if (!StringUtils.hasText(directionStr)) return null;
        String normalized = directionStr.toUpperCase().trim();
        if (normalized.contains("MORNING") || normalized.contains("HOME") || normalized.contains("TO COLLEGE")) {
            return com.anuraguniversity.smartroute.common.enums.Direction.MORNING;
        }
        if (normalized.contains("EVENING") || normalized.contains("COLLEGE") || normalized.contains("TO HOME")) {
            return com.anuraguniversity.smartroute.common.enums.Direction.EVENING;
        }
        return null;
    }

    private LocalTime parseTime(String timeStr) {
        if (!StringUtils.hasText(timeStr)) return null;
        String cleaned = timeStr.trim().toUpperCase();
        try {
            if (cleaned.contains("AM") || cleaned.contains("PM")) {
                return LocalTime.parse(cleaned, TIME_FORMATTER);
            } else {
                return LocalTime.parse(cleaned, TIME_FORMATTER_24);
            }
        } catch (Exception e) {
            log.warn("Failed to parse time: {}", timeStr);
            return null;
        }
    }

    private Double parseDouble(String str) {
        try { return Double.parseDouble(str.replaceAll("[^0-9.]", "")); } catch (Exception e) { return null; }
    }

    private Integer parseInt(String str) {
        try { return Integer.parseInt(str.replaceAll("[^0-9]", "")); } catch (Exception e) { return null; }
    }

    private BigDecimal parseBigDecimal(String str) {
        try { return new BigDecimal(str.replaceAll("[^0-9.]", "")); } catch (Exception e) { return null; }
    }

    private String getStringCellValue(Cell cell) {
        if (cell == null) return "";
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue().trim();
            case NUMERIC -> String.valueOf((long) cell.getNumericCellValue());
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            case FORMULA -> cell.getStringCellValue().trim();
            default -> "";
        };
    }

    private record BoardingPointData(String name, String description, LocalTime time, 
                                     BigDecimal latitude, BigDecimal longitude, String landmark) {}

    private BoardingPointData parseStopData(String stopData, int order) {
        // Parse format: "Stop Name (Time) - Landmark" or similar
        String name = stopData;
        String description = null;
        LocalTime time = null;
        BigDecimal lat = null;
        BigDecimal lng = null;
        String landmark = null;

        // Try to extract time in parentheses
        if (stopData.contains("(") && stopData.contains(")")) {
            int start = stopData.indexOf("(");
            int end = stopData.indexOf(")");
            String timeStr = stopData.substring(start + 1, end);
            time = parseTime(timeStr);
            name = stopData.substring(0, start).trim();
        }

        // Try to extract landmark after dash
        if (name.contains(" - ")) {
            String[] parts = name.split(" - ", 2);
            name = parts[0].trim();
            landmark = parts[1].trim();
        }

        return new BoardingPointData(name, description, time, lat, lng, landmark);
    }

    private void verifyImport(ImportResult result) {
        long zoneCount = zoneRepository.count();
        long routeCount = routeRepository.count();
        long busCount = busRepository.count();
        long stopCount = boardingPointRepository.count();

        result.setZoneCount((int) zoneCount);
        result.setRouteAssignmentCount((int) routeCount);
        result.setUniqueBusCount((int) busCount);
        result.setBoardingStopCount((int) stopCount);

        // Check for duplicate registrations
        List<Bus> allBuses = busRepository.findAll();
        Map<String, Long> regCounts = allBuses.stream()
            .collect(java.util.stream.Collectors.groupingBy(Bus::getRegistrationNumber, java.util.stream.Collectors.counting()));
        
        regCounts.entrySet().stream()
            .filter(e -> e.getValue() > 1)
            .forEach(e -> result.addDuplicateRegistration(e.getKey(), e.getValue()));
    }

    private void logImportSummary(ImportResult result) {
        log.info("=== Transport Import Summary ===");
        log.info("Zones: {}", result.getZoneCount());
        log.info("Route Assignments: {}", result.getRouteAssignmentCount());
        log.info("Unique Buses: {}", result.getUniqueBusCount());
        log.info("Boarding Stops: {}", result.getBoardingStopCount());
        log.info("Rows Transformed: {}", result.getRowsTransformed());
        log.info("Rows Skipped: {}", result.getRowsSkipped());
        log.info("Rows Rejected: {}", result.getRowsRejected());
        if (!result.getDuplicateRegistrations().isEmpty()) {
            log.info("Duplicate Registrations: {}", result.getDuplicateRegistrations());
        }
        if (!result.getErrors().isEmpty()) {
            log.warn("Errors: {}", result.getErrors());
        }
        log.info("=================================");
    }
}