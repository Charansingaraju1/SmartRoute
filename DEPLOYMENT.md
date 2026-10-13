# SmartRoute — Production Deployment Guide

This document outlines the deployment architecture, configuration requirements, migration policies, health checks, and rollback procedures for deploying the SmartRoute university transit management platform to production.

---

## 1. Architecture Overview

SmartRoute consists of three core tiers:

```
[ Browser / Mobile Client ]
            │
            ▼
┌─────────────────────────┐       HTTPS / REST API
│  Frontend (Vercel SPA)  │ ───────────────────────────┐
│  React 18 + Vite + TS   │                            │
└─────────────────────────┘                            ▼
                                            ┌─────────────────────────┐
                                            │  Backend (Spring Boot)  │
                                            │  Java 21, Context: /api │
                                            └────────────┬────────────┘
                                                         │
                                                         ▼
                                            ┌─────────────────────────┐
                                            │   MySQL 8.0 Database    │
                                            │   Flyway Schema (V1)    │
                                            └─────────────────────────┘
```

- **Frontend**: Single Page Application built with React 18, Vite, and TypeScript. Hosted on **Vercel** (or any static CDN).
- **Backend**: Spring Boot 4.x / Java 21 REST API located under `/api`. Hosted on a Linux VM, container service, or managed PaaS (e.g., AWS ECS, Render, Railway, DigitalOcean).
- **Database**: Managed MySQL 8.0 with UTC timezone and utf8mb4 collation.

---

## 2. Frontend Hosting (Vercel)

### Project Configuration
- **Root Directory**: `frontend`
- **Framework Preset**: `Vite`
- **Build Command**: `npm run build` (executes `tsc -b && vite build`)
- **Output Directory**: `dist`
- **Node.js Version**: `20.x` or higher

### SPA Routing & Cache Configuration
Routing rewrites and caching headers are managed via [`frontend/vercel.json`](file:///C:/Users/anush/OneDrive/Desktop/C/SmartRoute/frontend/vercel.json):
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### Environment Variables on Vercel
Configure the following variable in **Vercel Project Settings > Environment Variables**:

| Variable | Required | Example Value | Description |
|---|---|---|---|
| `VITE_API_URL` | **Yes** | `https://your-backend-domain.com/api` | Full URL to backend API; **must include the `/api` context path** |

> [!IMPORTANT]
> Because Vite embeds environment variables at build time, any changes to `VITE_API_URL` require triggering a new deployment in Vercel.

---

## 3. Backend Hosting (Spring Boot / Java 21)

### Prerequisites
- **JDK 21 LTS** installed (`java -version`).
- **Apache Maven 3.9+** (or use included `mvnw` wrapper).
- Network ingress allowing HTTP/HTTPS to port `8080`.
- Outbound access to MySQL (port `3306`) and SMTP mail server (port `587`).

### Build Command
Compile and package the production executable JAR:
```bash
cd backend
mvn clean package -DskipTests
```
The output artifact is generated at:
`backend/target/smartroute-backend-1.0.0-SNAPSHOT.jar`

### Running the Production JAR
```bash
java -jar -Dspring.profiles.active=prod target/smartroute-backend-1.0.0-SNAPSHOT.jar
```

### Standard Systemd Service (Linux VM)
For deployment on a dedicated Ubuntu/Debian server, create `/etc/systemd/system/smartroute.service`:
```ini
[Unit]
Description=SmartRoute Backend Service
After=network.target mysql.service

[Service]
Type=simple
User=smartroute
WorkingDirectory=/opt/smartroute/backend
EnvironmentFile=/etc/smartroute/backend.env
ExecStart=/usr/bin/java -Xms512m -Xmx2048m -Dspring.profiles.active=prod -jar /opt/smartroute/backend/smartroute-backend.jar
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
```

---

## 4. Production Environment Variables Reference

All runtime parameters can be injected via standard environment variables or a `.env` file:

| Environment Variable | Required | Default / Fallback | Description |
|---|---|---|---|
| `SPRING_PROFILES_ACTIVE` | **Yes** | `dev` | Set to `prod` in production |
| `DB_URL` | **Yes** | `jdbc:mysql://localhost:3306/smartroute...` | Full JDBC URL with timezone and SSL settings |
| `DB_USERNAME` | **Yes** | `smartroute` | MySQL application user |
| `DB_PASSWORD` | **Yes** | *(empty)* | MySQL application password |
| `JWT_SECRET` | **Yes** | *(empty)* | Base64-encoded or raw secret (min 256-bit / 32 chars) |
| `CORS_ALLOWED_ORIGINS` | **Yes** | `http://localhost:5173,http://127.0.0.1:5173` | Comma-separated list of allowed frontend origins or origin patterns (e.g. `https://*.vercel.app,https://your-domain.com`) |
| `MAIL_HOST` | **Yes** | `smtp.gmail.com` | SMTP host for OTP and emergency notifications |
| `MAIL_PORT` | **Yes** | `587` | SMTP port (587 for TLS, 465 for SSL) |
| `MAIL_USERNAME` | **Yes** | *(empty)* | SMTP authenticated username |
| `MAIL_PASSWORD` | **Yes** | *(empty)* | SMTP application password / token |
| `MAIL_FROM` | No | `noreply@anuraguniversity.edu.in` | Sender display email address |
| `PAYMENT_PROVIDER` | No | `razorpay` | Payment provider identifier |
| `PAYMENT_PROVIDER_KEY` | Conditional | *(empty)* | Public API Key (Razorpay/Stripe) |
| `PAYMENT_PROVIDER_SECRET` | Conditional | *(empty)* | Secret API Key |
| `PAYMENT_WEBHOOK_SECRET` | Conditional | *(empty)* | Webhook signature verification secret |
| `PUSH_VAPID_SUBJECT` | No | `mailto:admin@...` | VAPID contact URI |
| `PUSH_VAPID_PUBLIC_KEY` | No | *(empty)* | VAPID public key for Web Push notifications |
| `PUSH_VAPID_PRIVATE_KEY` | No | *(empty)* | VAPID private key |

---

## 5. Database Migration Policy & Approval Rules

### Flyway Migration Standards
1. **Schema Authority**: Database schema is strictly controlled via Flyway migrations under `backend/src/main/resources/db/migration/`.
2. **Initial Schema**: Baseline is [`V1__initial_schema.sql`](file:///C:/Users/anush/OneDrive/Desktop/C/SmartRoute/backend/src/main/resources/db/migration/V1__initial_schema.sql).
3. **Hibernate DDL Validation**: In production (`application.yml`), `spring.jpa.hibernate.ddl-auto` is set to `validate`. Hibernate will **never** modify or drop tables automatically.
4. **Zero-Destructive-SQL Rule**:
   - `DROP TABLE`, `DROP COLUMN`, and `TRUNCATE` statements are strictly prohibited in migration scripts without explicit stakeholder sign-off and scheduled maintenance windows.
   - New columns must be added as nullable (`NULL`) or with safe default values.
   - Column renames must follow expand-and-contract deployment patterns.
5. **Approval Workflow**:
   - Review every `.sql` script in a code review pull request.
   - Verify checksums and ensure Flyway version sequence numbers are unique and chronological.
   - Execute dry-run against a staging database before applying to production.
   - In production, Flyway runs on startup (`spring.flyway.enabled=true`, `validate-on-migrate=true`), or can be executed via `backend/flyway-migrate.bat` using environment credentials.

---

## 6. Health Checks & Verification

After deployment, verify system health using the following endpoints:

### 1. Actuator Liveness & Readiness Probe
```bash
curl -f https://<backend-domain>/api/actuator/health
```
- **Expected Status**: `200 OK`
- **Expected Response**: `{"status":"UP"}`

### 2. Public Transit Fleet Smoke Test
```bash
curl -f https://<backend-domain>/api/buses
```
- **Expected Status**: `200 OK`
- **Expected Response**: JSON array containing verified buses (e.g., AU-B1 through AU-B6).

### 3. Actuator Metrics (Monitoring)
```bash
curl -H "Authorization: Bearer <ADMIN_TOKEN>" https://<backend-domain>/api/actuator/prometheus
```

### 4. Interactive Swagger UI (Staging/Dev)
- URL: `https://<backend-domain>/api/swagger-ui/index.html`
- OpenAPI Schema: `https://<backend-domain>/api/v3/api-docs`

---

## 7. Incident Recovery & Rollback Procedures

### Frontend Rollback (Vercel)
1. Navigate to the project dashboard on Vercel.
2. Select **Deployments**.
3. Locate the previous healthy deployment and click **Instant Rollback**.
4. Traffic is rerouted immediately within seconds with no downtime.

### Backend Rollback
1. Stop the failing backend process:
   ```bash
   sudo systemctl stop smartroute
   ```
2. Replace `smartroute-backend.jar` with the previous version backup (`smartroute-backend.jar.bak`).
3. Restart the service:
   ```bash
   sudo systemctl start smartroute
   ```
4. Verify logs with `journalctl -u smartroute -f` and test `/api/actuator/health`.

### Database Recovery
1. If a Flyway migration fails:
   - Check the `flyway_schema_history` table for rows where `success = 0`.
   - Never manually alter applied migration checksums without running `flyway:repair`.
   - Restore MySQL database from the pre-deployment snapshot if data corruption occurred:
     ```bash
     mysql -u smartroute -p smartroute < pre_deploy_backup.sql
     ```
