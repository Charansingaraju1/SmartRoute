-- ==============================================================================
-- V3: Convert audit_logs.correlation_id from VARCHAR to BINARY(16)
--     Safely parse existing UUID strings into 16-byte binary representations
--     and ensure duration_ms is BIGINT to match Java Long durationMs.
-- ==============================================================================

-- 1. Add temporary binary column
ALTER TABLE audit_logs ADD COLUMN correlation_id_bin BINARY(16) NULL AFTER success;

-- 2. Convert existing VARCHAR UUID values to BINARY(16), safely handling NULLs and invalid formats
UPDATE audit_logs
SET correlation_id_bin = CASE
    WHEN correlation_id IS NULL OR TRIM(correlation_id) = '' THEN NULL
    WHEN TRIM(REPLACE(correlation_id, '-', '')) REGEXP '^[0-9a-fA-F]{32}$'
        THEN UNHEX(TRIM(REPLACE(correlation_id, '-', '')))
    ELSE NULL
END;

-- 3. Drop the old VARCHAR column
ALTER TABLE audit_logs DROP COLUMN correlation_id;

-- 4. Rename and position the new BINARY(16) column
ALTER TABLE audit_logs CHANGE COLUMN correlation_id_bin correlation_id BINARY(16) NULL AFTER success;

-- 5. Ensure duration_ms is BIGINT to match AuditLog.durationMs (Long)
ALTER TABLE audit_logs MODIFY COLUMN duration_ms BIGINT NULL;
