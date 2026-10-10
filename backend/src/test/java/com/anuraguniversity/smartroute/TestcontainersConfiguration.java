package com.anuraguniversity.smartroute;

import org.testcontainers.containers.MySQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@Testcontainers
public class TestcontainersConfiguration {

    @Container
    static MySQLContainer<?> mysql = new MySQLContainer<>("mysql:8.0")
            .withDatabaseName("smartroute_test")
            .withUsername("test")
            .withPassword("test")
            .withInitScript("db/migration/test-init.sql");
}