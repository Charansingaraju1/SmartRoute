package com.anuraguniversity.smartroute.transport.service;

import com.anuraguniversity.smartroute.transport.dto.ImportResult;
import com.anuraguniversity.smartroute.transport.repository.RouteRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(10)
@RequiredArgsConstructor
@Slf4j
public class TransportDataSeeder implements CommandLineRunner {

    private final RouteRepository routeRepository;
    private final TransportWorkbookImporter workbookImporter;

    @Override
    public void run(String... args) {
        try {
            if (routeRepository.count() >= 60) {
                log.info("Transport data already initialized ({} routes found)", routeRepository.count());
                return;
            }

            log.info("Initializing Anurag University Transport data from official AU dataset...");
            ImportResult result = workbookImporter.importWorkbook();
            if (result != null && !result.getErrors().isEmpty()) {
                log.warn("Transport data import completed with {} error(s): {}", result.getErrors().size(), result.getErrors());
            } else {
                log.info("Transport data import completed successfully.");
            }
        } catch (Exception e) {
            log.error("Failed to seed transport data during startup: {}", e.getMessage(), e);
        }
    }
}
