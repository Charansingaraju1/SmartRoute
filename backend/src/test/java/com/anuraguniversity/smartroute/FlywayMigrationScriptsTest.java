package com.anuraguniversity.smartroute;

import org.junit.jupiter.api.Test;
import org.springframework.boot.flyway.autoconfigure.FlywayAutoConfiguration;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.*;

class FlywayMigrationScriptsTest {

    @Test
    void flywayAutoConfiguration_ShouldBePresentOnClasspath() {
        assertNotNull(FlywayAutoConfiguration.class, "FlywayAutoConfiguration must be available via spring-boot-starter-flyway");
    }

    @Test
    void migrationScripts_ShouldExistAndContainRequiredTables() throws Exception {
        try (InputStream v1Stream = getClass().getResourceAsStream("/db/migration/V1__initial_schema.sql")) {
            assertNotNull(v1Stream, "V1__initial_schema.sql must exist on classpath");
            String v1Content = new String(v1Stream.readAllBytes(), StandardCharsets.UTF_8);
            assertTrue(v1Content.contains("CREATE TABLE users"), "V1 must define users table");
        }

        try (InputStream v2Stream = getClass().getResourceAsStream("/db/migration/V2__add_audit_logs.sql")) {
            assertNotNull(v2Stream, "V2__add_audit_logs.sql must exist on classpath");
            String v2Content = new String(v2Stream.readAllBytes(), StandardCharsets.UTF_8);
            assertTrue(v2Content.contains("CREATE TABLE IF NOT EXISTS audit_logs"), "V2 must create audit_logs table");
            assertTrue(v2Content.contains("fk_audit_logs_user"), "V2 must define fk_audit_logs_user constraint");
            assertTrue(v2Content.contains("duration_ms        BIGINT"), "V2 must match AuditLog.durationMs (BIGINT)");
            assertTrue(v2Content.contains("correlation_id     BINARY(16)"), "V2 must match AuditLog.correlationId (BINARY(16))");
        }

        try (InputStream v3Stream = getClass().getResourceAsStream("/db/migration/V3__convert_audit_logs_correlation_id_to_binary.sql")) {
            assertNotNull(v3Stream, "V3__convert_audit_logs_correlation_id_to_binary.sql must exist on classpath");
            String v3Content = new String(v3Stream.readAllBytes(), StandardCharsets.UTF_8);
            assertTrue(v3Content.contains("correlation_id_bin BINARY(16)"), "V3 must define binary conversion column");
            assertTrue(v3Content.contains("UNHEX(TRIM(REPLACE(correlation_id, '-', '')))"), "V3 must convert UUID string to binary");
            assertTrue(v3Content.contains("CHANGE COLUMN correlation_id_bin correlation_id BINARY(16)"), "V3 must rename binary column to correlation_id");
            assertTrue(v3Content.contains("MODIFY COLUMN duration_ms BIGINT"), "V3 must ensure duration_ms is BIGINT");
        }
    }
}
