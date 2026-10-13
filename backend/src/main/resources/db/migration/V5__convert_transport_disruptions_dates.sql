-- ==============================================================================
-- V5: Convert transport_disruptions start_date and end_date to DATE
--     Align database schema with TransportDisruption JPA entity (LocalDate)
-- ==============================================================================

ALTER TABLE transport_disruptions MODIFY COLUMN start_date DATE NOT NULL;
ALTER TABLE transport_disruptions MODIFY COLUMN end_date DATE NULL;
