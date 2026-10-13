-- ==============================================================================
-- V4: Complete Alignment of Database Schema with JPA Entities
--     1. Convert LocalTime fields from DATETIME(6) to TIME
--     2. Convert LocalDate fields from DATETIME(6) to DATE
--     3. Safely convert UUID fields from VARCHAR(255) to BINARY(16)
--     4. Align column length for students.bus_pass_image_url
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. Boarding Points & Routes: stop_time, starting_time, ending_time (LocalTime -> TIME)
-- ------------------------------------------------------------------------------
ALTER TABLE boarding_points MODIFY COLUMN stop_time TIME NULL;
ALTER TABLE routes MODIFY COLUMN starting_time TIME NULL;
ALTER TABLE routes MODIFY COLUMN ending_time TIME NULL;

-- ------------------------------------------------------------------------------
-- 2. Students: pickup_time (TIME), bus_pass_image_url (VARCHAR 500), push_subscription_id (BINARY 16)
-- ------------------------------------------------------------------------------
ALTER TABLE students MODIFY COLUMN pickup_time TIME NULL;
ALTER TABLE students MODIFY COLUMN bus_pass_image_url VARCHAR(500) NULL;

ALTER TABLE students ADD COLUMN push_subscription_id_bin BINARY(16) NULL AFTER emergency_contact_phone;
UPDATE students
SET push_subscription_id_bin = CASE
    WHEN push_subscription_id IS NULL OR TRIM(push_subscription_id) = '' THEN NULL
    WHEN TRIM(REPLACE(push_subscription_id, '-', '')) REGEXP '^[0-9a-fA-F]{32}$'
        THEN UNHEX(TRIM(REPLACE(push_subscription_id, '-', '')))
    ELSE NULL
END;
ALTER TABLE students DROP COLUMN push_subscription_id;
ALTER TABLE students CHANGE COLUMN push_subscription_id_bin push_subscription_id BINARY(16) NULL AFTER emergency_contact_phone;

-- ------------------------------------------------------------------------------
-- 3. Teachers: push_subscription_id (BINARY 16)
-- ------------------------------------------------------------------------------
ALTER TABLE teachers ADD COLUMN push_subscription_id_bin BINARY(16) NULL AFTER can_manage_assignments;
UPDATE teachers
SET push_subscription_id_bin = CASE
    WHEN push_subscription_id IS NULL OR TRIM(push_subscription_id) = '' THEN NULL
    WHEN TRIM(REPLACE(push_subscription_id, '-', '')) REGEXP '^[0-9a-fA-F]{32}$'
        THEN UNHEX(TRIM(REPLACE(push_subscription_id, '-', '')))
    ELSE NULL
END;
ALTER TABLE teachers DROP COLUMN push_subscription_id;
ALTER TABLE teachers CHANGE COLUMN push_subscription_id_bin push_subscription_id BINARY(16) NULL AFTER can_manage_assignments;

-- ------------------------------------------------------------------------------
-- 4. Student Bus Assignments: assigned_by, cancelled_by (BINARY 16)
-- ------------------------------------------------------------------------------
ALTER TABLE student_bus_assignments ADD COLUMN assigned_by_bin BINARY(16) NULL AFTER end_date;
ALTER TABLE student_bus_assignments ADD COLUMN cancelled_by_bin BINARY(16) NULL AFTER cancelled_at;

UPDATE student_bus_assignments
SET assigned_by_bin = CASE
    WHEN assigned_by IS NULL OR TRIM(assigned_by) = '' THEN NULL
    WHEN TRIM(REPLACE(assigned_by, '-', '')) REGEXP '^[0-9a-fA-F]{32}$'
        THEN UNHEX(TRIM(REPLACE(assigned_by, '-', '')))
    ELSE NULL
END,
cancelled_by_bin = CASE
    WHEN cancelled_by IS NULL OR TRIM(cancelled_by) = '' THEN NULL
    WHEN TRIM(REPLACE(cancelled_by, '-', '')) REGEXP '^[0-9a-fA-F]{32}$'
        THEN UNHEX(TRIM(REPLACE(cancelled_by, '-', '')))
    ELSE NULL
END;

ALTER TABLE student_bus_assignments DROP COLUMN assigned_by;
ALTER TABLE student_bus_assignments DROP COLUMN cancelled_by;
ALTER TABLE student_bus_assignments CHANGE COLUMN assigned_by_bin assigned_by BINARY(16) NULL AFTER end_date;
ALTER TABLE student_bus_assignments CHANGE COLUMN cancelled_by_bin cancelled_by BINARY(16) NULL AFTER cancelled_at;

-- ------------------------------------------------------------------------------
-- 5. Bus Pass Records: valid_from (DATE), valid_until (DATE), verified_by (BINARY 16), payment_record_id (BINARY 16)
-- ------------------------------------------------------------------------------
ALTER TABLE bus_pass_records MODIFY COLUMN valid_from DATE NOT NULL;
ALTER TABLE bus_pass_records MODIFY COLUMN valid_until DATE NULL;

ALTER TABLE bus_pass_records ADD COLUMN verified_by_bin BINARY(16) NULL AFTER verified_at;
ALTER TABLE bus_pass_records ADD COLUMN payment_record_id_bin BINARY(16) NULL AFTER fee_amount;

UPDATE bus_pass_records
SET verified_by_bin = CASE
    WHEN verified_by IS NULL OR TRIM(verified_by) = '' THEN NULL
    WHEN TRIM(REPLACE(verified_by, '-', '')) REGEXP '^[0-9a-fA-F]{32}$'
        THEN UNHEX(TRIM(REPLACE(verified_by, '-', '')))
    ELSE NULL
END,
payment_record_id_bin = CASE
    WHEN payment_record_id IS NULL OR TRIM(payment_record_id) = '' THEN NULL
    WHEN TRIM(REPLACE(payment_record_id, '-', '')) REGEXP '^[0-9a-fA-F]{32}$'
        THEN UNHEX(TRIM(REPLACE(payment_record_id, '-', '')))
    ELSE NULL
END;

ALTER TABLE bus_pass_records DROP COLUMN verified_by;
ALTER TABLE bus_pass_records DROP COLUMN payment_record_id;
ALTER TABLE bus_pass_records CHANGE COLUMN verified_by_bin verified_by BINARY(16) NULL AFTER verified_at;
ALTER TABLE bus_pass_records CHANGE COLUMN payment_record_id_bin payment_record_id BINARY(16) NULL AFTER fee_amount;

-- ------------------------------------------------------------------------------
-- 6. Delays: expected_arrival_time (TIME), acknowledged_by (BINARY 16), resolved_by (BINARY 16)
-- ------------------------------------------------------------------------------
ALTER TABLE delays MODIFY COLUMN expected_arrival_time TIME NULL;

ALTER TABLE delays ADD COLUMN acknowledged_by_bin BINARY(16) NULL AFTER acknowledged_at;
ALTER TABLE delays ADD COLUMN resolved_by_bin BINARY(16) NULL AFTER resolved_at;

UPDATE delays
SET acknowledged_by_bin = CASE
    WHEN acknowledged_by IS NULL OR TRIM(acknowledged_by) = '' THEN NULL
    WHEN TRIM(REPLACE(acknowledged_by, '-', '')) REGEXP '^[0-9a-fA-F]{32}$'
        THEN UNHEX(TRIM(REPLACE(acknowledged_by, '-', '')))
    ELSE NULL
END,
resolved_by_bin = CASE
    WHEN resolved_by IS NULL OR TRIM(resolved_by) = '' THEN NULL
    WHEN TRIM(REPLACE(resolved_by, '-', '')) REGEXP '^[0-9a-fA-F]{32}$'
        THEN UNHEX(TRIM(REPLACE(resolved_by, '-', '')))
    ELSE NULL
END;

ALTER TABLE delays DROP COLUMN acknowledged_by;
ALTER TABLE delays DROP COLUMN resolved_by;
ALTER TABLE delays CHANGE COLUMN acknowledged_by_bin acknowledged_by BINARY(16) NULL AFTER acknowledged_at;
ALTER TABLE delays CHANGE COLUMN resolved_by_bin resolved_by BINARY(16) NULL AFTER resolved_at;

-- ------------------------------------------------------------------------------
-- 7. Disruptions: acknowledged_by (BINARY 16), resolved_by (BINARY 16)
-- ------------------------------------------------------------------------------
ALTER TABLE disruptions ADD COLUMN acknowledged_by_bin BINARY(16) NULL AFTER acknowledged_at;
ALTER TABLE disruptions ADD COLUMN resolved_by_bin BINARY(16) NULL AFTER resolved_at;

UPDATE disruptions
SET acknowledged_by_bin = CASE
    WHEN acknowledged_by IS NULL OR TRIM(acknowledged_by) = '' THEN NULL
    WHEN TRIM(REPLACE(acknowledged_by, '-', '')) REGEXP '^[0-9a-fA-F]{32}$'
        THEN UNHEX(TRIM(REPLACE(acknowledged_by, '-', '')))
    ELSE NULL
END,
resolved_by_bin = CASE
    WHEN resolved_by IS NULL OR TRIM(resolved_by) = '' THEN NULL
    WHEN TRIM(REPLACE(resolved_by, '-', '')) REGEXP '^[0-9a-fA-F]{32}$'
        THEN UNHEX(TRIM(REPLACE(resolved_by, '-', '')))
    ELSE NULL
END;

ALTER TABLE disruptions DROP COLUMN acknowledged_by;
ALTER TABLE disruptions DROP COLUMN resolved_by;
ALTER TABLE disruptions CHANGE COLUMN acknowledged_by_bin acknowledged_by BINARY(16) NULL AFTER acknowledged_at;
ALTER TABLE disruptions CHANGE COLUMN resolved_by_bin resolved_by BINARY(16) NULL AFTER resolved_at;

-- ------------------------------------------------------------------------------
-- 8. Transport Disruptions: created_by (BINARY 16)
-- ------------------------------------------------------------------------------
ALTER TABLE transport_disruptions ADD COLUMN created_by_bin BINARY(16) NULL AFTER active;
UPDATE transport_disruptions
SET created_by_bin = CASE
    WHEN created_by IS NULL OR TRIM(created_by) = '' THEN NULL
    WHEN TRIM(REPLACE(created_by, '-', '')) REGEXP '^[0-9a-fA-F]{32}$'
        THEN UNHEX(TRIM(REPLACE(created_by, '-', '')))
    ELSE NULL
END;
ALTER TABLE transport_disruptions DROP COLUMN created_by;
ALTER TABLE transport_disruptions CHANGE COLUMN created_by_bin created_by BINARY(16) NULL AFTER active;

-- ------------------------------------------------------------------------------
-- 9. Delay Alerts: alert_time (TIME NOT NULL), created_by (BINARY 16)
-- ------------------------------------------------------------------------------
ALTER TABLE delay_alerts MODIFY COLUMN alert_time TIME NOT NULL;

ALTER TABLE delay_alerts ADD COLUMN created_by_bin BINARY(16) NULL AFTER recurrence_pattern;
UPDATE delay_alerts
SET created_by_bin = CASE
    WHEN created_by IS NULL OR TRIM(created_by) = '' THEN NULL
    WHEN TRIM(REPLACE(created_by, '-', '')) REGEXP '^[0-9a-fA-F]{32}$'
        THEN UNHEX(TRIM(REPLACE(created_by, '-', '')))
    ELSE NULL
END;
ALTER TABLE delay_alerts DROP COLUMN created_by;
ALTER TABLE delay_alerts CHANGE COLUMN created_by_bin created_by BINARY(16) NULL AFTER recurrence_pattern;

-- ------------------------------------------------------------------------------
-- 10. Missed Bus Requests: acknowledged_by (BINARY 16), resolved_by (BINARY 16)
-- ------------------------------------------------------------------------------
ALTER TABLE missed_bus_requests ADD COLUMN acknowledged_by_bin BINARY(16) NULL AFTER acknowledged_at;
ALTER TABLE missed_bus_requests ADD COLUMN resolved_by_bin BINARY(16) NULL AFTER resolved_at;

UPDATE missed_bus_requests
SET acknowledged_by_bin = CASE
    WHEN acknowledged_by IS NULL OR TRIM(acknowledged_by) = '' THEN NULL
    WHEN TRIM(REPLACE(acknowledged_by, '-', '')) REGEXP '^[0-9a-fA-F]{32}$'
        THEN UNHEX(TRIM(REPLACE(acknowledged_by, '-', '')))
    ELSE NULL
END,
resolved_by_bin = CASE
    WHEN resolved_by IS NULL OR TRIM(resolved_by) = '' THEN NULL
    WHEN TRIM(REPLACE(resolved_by, '-', '')) REGEXP '^[0-9a-fA-F]{32}$'
        THEN UNHEX(TRIM(REPLACE(resolved_by, '-', '')))
    ELSE NULL
END;

ALTER TABLE missed_bus_requests DROP COLUMN acknowledged_by;
ALTER TABLE missed_bus_requests DROP COLUMN resolved_by;
ALTER TABLE missed_bus_requests CHANGE COLUMN acknowledged_by_bin acknowledged_by BINARY(16) NULL AFTER acknowledged_at;
ALTER TABLE missed_bus_requests CHANGE COLUMN resolved_by_bin resolved_by BINARY(16) NULL AFTER resolved_at;

-- ------------------------------------------------------------------------------
-- 11. SOS Requests: acknowledged_by (BINARY 16), responding_by (BINARY 16), resolved_by (BINARY 16)
-- ------------------------------------------------------------------------------
ALTER TABLE sos_requests ADD COLUMN acknowledged_by_bin BINARY(16) NULL AFTER acknowledged_at;
ALTER TABLE sos_requests ADD COLUMN responding_by_bin BINARY(16) NULL AFTER responding_at;
ALTER TABLE sos_requests ADD COLUMN resolved_by_bin BINARY(16) NULL AFTER resolved_at;

UPDATE sos_requests
SET acknowledged_by_bin = CASE
    WHEN acknowledged_by IS NULL OR TRIM(acknowledged_by) = '' THEN NULL
    WHEN TRIM(REPLACE(acknowledged_by, '-', '')) REGEXP '^[0-9a-fA-F]{32}$'
        THEN UNHEX(TRIM(REPLACE(acknowledged_by, '-', '')))
    ELSE NULL
END,
responding_by_bin = CASE
    WHEN responding_by IS NULL OR TRIM(responding_by) = '' THEN NULL
    WHEN TRIM(REPLACE(responding_by, '-', '')) REGEXP '^[0-9a-fA-F]{32}$'
        THEN UNHEX(TRIM(REPLACE(responding_by, '-', '')))
    ELSE NULL
END,
resolved_by_bin = CASE
    WHEN resolved_by IS NULL OR TRIM(resolved_by) = '' THEN NULL
    WHEN TRIM(REPLACE(resolved_by, '-', '')) REGEXP '^[0-9a-fA-F]{32}$'
        THEN UNHEX(TRIM(REPLACE(resolved_by, '-', '')))
    ELSE NULL
END;

ALTER TABLE sos_requests DROP COLUMN acknowledged_by;
ALTER TABLE sos_requests DROP COLUMN responding_by;
ALTER TABLE sos_requests DROP COLUMN resolved_by;
ALTER TABLE sos_requests CHANGE COLUMN acknowledged_by_bin acknowledged_by BINARY(16) NULL AFTER acknowledged_at;
ALTER TABLE sos_requests CHANGE COLUMN responding_by_bin responding_by BINARY(16) NULL AFTER responding_at;
ALTER TABLE sos_requests CHANGE COLUMN resolved_by_bin resolved_by BINARY(16) NULL AFTER resolved_at;
