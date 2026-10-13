-- ==============================================================================
-- V6: Widen bus driver_phone and conductor_phone columns to VARCHAR(50)
--     Prevents data truncation when multiple phone numbers are supplied (e.g., "9398187515 / 9603040944")
-- ==============================================================================

ALTER TABLE buses MODIFY COLUMN driver_phone VARCHAR(50) NULL;
ALTER TABLE buses MODIFY COLUMN conductor_phone VARCHAR(50) NULL;
