package com.anuraguniversity.smartroute.transport.service;

import com.anuraguniversity.smartroute.transport.repository.RouteRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Order(10)
@RequiredArgsConstructor
@Slf4j
public class TransportDataSeeder implements CommandLineRunner {

    private final RouteRepository routeRepository;
    private final TransportWorkbookImporter workbookImporter;

    @Override
    @Transactional
    public void run(String... args) {
        if (routeRepository.count() >= 60) {
            log.info("Transport data already initialized ({} routes found)", routeRepository.count());
            return;
        }

        log.info("Initializing Anurag University Transport data from official AU dataset...");
        workbookImporter.importWorkbook();
    }
}
