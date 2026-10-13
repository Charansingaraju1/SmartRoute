-- ============================================================
-- V2: Ensure audit_logs table exists and matches AuditLog entity
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id                 BINARY(16)      NOT NULL,
    user_id            BINARY(16)      NULL,
    action             VARCHAR(50)     NOT NULL,
    entity_type        VARCHAR(100)    NULL,
    entity_id          BINARY(16)      NULL,
    entity_identifier  VARCHAR(100)    NULL,
    old_values         JSON            NULL,
    new_values         JSON            NULL,
    ip_address         VARCHAR(45)     NULL,
    user_agent         VARCHAR(500)    NULL,
    endpoint           VARCHAR(200)    NULL,
    http_method        VARCHAR(10)     NULL,
    response_status    INT             NULL,
    duration_ms        BIGINT          NULL,
    error_message      VARCHAR(1000)   NULL,
    success            TINYINT(1)      NOT NULL DEFAULT 1,
    correlation_id     BINARY(16)      NULL,
    created_at         DATETIME(6)     NOT NULL,
    updated_at         DATETIME(6)     NOT NULL,
    version            BIGINT          NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_audit_logs_user FOREIGN KEY (user_id) REFERENCES users (id),
    KEY idx_audit_user (user_id),
    KEY idx_audit_action (action),
    KEY idx_audit_entity (entity_type, entity_id),
    KEY idx_audit_created_at (created_at),
    KEY idx_audit_ip (ip_address),
    KEY idx_audit_user_action (user_id, action)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
