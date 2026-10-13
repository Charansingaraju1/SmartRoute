# SmartRoute — University Transportation Management System

> **Anurag University** | Cloud-Native Transit, Bus Pass & Fleet Management Platform

SmartRoute is a modern, production-ready university transportation management system built with **Java 21**, **Spring Boot 4.1.1**, **React 18**, **TypeScript**, and **MySQL 8.4**. It is architected for seamless cloud deployment using **Docker + Render** for the backend and **Vercel** for the frontend, powered by an **Aiven Cloud MySQL** database.

---

## 🏛️ System Architecture

SmartRoute follows a decoupled client-server architecture designed for high availability and zero-config deployment:

```
┌────────────────────────────────────────────────────────┐
│               Client Tier (Vercel)                     │
│  React 18 + Vite + TypeScript Single Page Application  │
│  Live URL: https://smart-route-jet.vercel.app          │
└──────────────────────────┬─────────────────────────────┘
                           │
                 HTTPS / REST API (/api)
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│               Backend Tier (Render)                    │
│  Spring Boot 4.1.1 (Java 21 LTS) in Docker Container   │
│  Context Path: /api | Non-root User | Health Probes    │
│  Live URL: https://smartroute-backend-4vyz.onrender.com│
└──────────────────────────┬─────────────────────────────┘
                           │
                 TLS Encrypted JDBC (SSL)
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│               Database Tier (Aiven)                    │
│  Managed MySQL 8.4 Database Cluster                    │
│  Flyway Schema Migrations (V1 to V6)                   │
│  Connection Pooling via HikariCP (Size: 5)             │
└────────────────────────────────────────────────────────┘
```

---

## 🚀 Key Features

* **🎓 Student Portal:** Real-time bus & route tracking, digital bus pass generation, boarding point selector, missed bus assistance, and emergency SOS alerts.
* **👨‍🏫 Teacher / Transport Admin:** Transport operations oversight, bus pass verification, disruption publishing, passenger rosters, and real-time fleet coordination.
* **🔐 Security & Access Control:** Stateless JWT authentication, BCrypt password hashing, role-based authorization (`ROLE_STUDENT`, `ROLE_FACULTY`, `ROLE_ADMIN`), and brute-force rate limiting.
* **🗄️ Resilient Ingestion & Migrations:** Automated Flyway migrations on startup (`V1` through `V6`) with `ddl-auto: validate` schema safety, and batched workbook ingestion for bus routes and stops.
* **📊 Observability:** Spring Boot Actuator health checks (`/api/actuator/health`), Prometheus metrics, and Swagger UI API documentation (`/api/swagger-ui.html`).

---

## 🛠️ Technology Stack

| Layer | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend** | React, TypeScript, Vite | React 18, Vite 5 | SPA UI, dynamic routing, Leaflet maps |
| **Backend** | Java, Spring Boot | Java 21 LTS, Boot 4.1.1 | Enterprise REST APIs, domain logic |
| **ORM / Migrations** | Hibernate, Flyway | Hibernate 6.6, Flyway 10 | Object-relational mapping, versioned DDL |
| **Database** | MySQL | 8.4 (Aiven Cloud) | Relational persistence, utf8mb4 collation |
| **Containerization** | Docker, Alpine Linux | Docker 24+, Multi-stage | Containerized JVM runtime, non-root user |
| **Cloud Hosting** | Render & Vercel | PaaS / Edge CDN | Docker Web Service & SPA Hosting |

---

## 💻 Local Development Setup

### Option 1: Quick Start with Docker Compose (Recommended)

Requires [Docker Desktop](https://www.docker.com/products/docker-desktop/):

```bash
# Clone the repository
git clone https://github.com/Charansingaraju1/SmartRoute.git
cd SmartRoute

# Start MySQL and the Spring Boot backend
docker compose up -d

# Start the React frontend
cd frontend
npm install
npm run dev
```
* **Frontend:** `http://localhost:5173`
* **Backend API:** `http://localhost:8080/api`
* **API Documentation:** `http://localhost:8080/api/swagger-ui.html`
* **Health Check:** `http://localhost:8080/api/actuator/health`

---

### Option 2: Manual Local Setup (Without Docker)

#### Prerequisites
* **Java 21 LTS** (`java -version`)
* **Apache Maven 3.9+** (`mvn -v`)
* **Node.js 20+** and **npm** (`node -v`)
* **MySQL 8.0+** running locally on port `3306`

#### 1. Configure Environment
Copy the environment template:
```bash
cp .env.example .env
```
Ensure your local MySQL database exists:
```sql
CREATE DATABASE smartroute CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### 2. Start Backend
```bash
cd backend
mvn clean spring-boot:run
```
The backend initializes database tables via Flyway migrations and starts on `http://localhost:8080/api`.

#### 3. Start Frontend
In a new terminal:
```bash
cd frontend
npm install
npm run dev
```
The frontend starts on `http://localhost:5173` with automatic `/api` proxying to `http://localhost:8080`.

---

## 🐳 Docker Build and Execution Commands

SmartRoute uses a multi-stage Docker build to produce a minimal, secure container image (~180MB) running on Alpine Linux as a non-root user.

### Build Backend Docker Image
From the repository root:
```bash
docker build -t smartroute-backend -f backend/Dockerfile ./backend
```
*(Or navigate into `backend` and run `docker build -t smartroute-backend .`)*

### Run Container Locally
```bash
docker run -d \
  --name smartroute-backend \
  -p 8080:8080 \
  -e SPRING_PROFILES_ACTIVE=dev \
  -e DB_URL="jdbc:mysql://host.docker.internal:3306/smartroute?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC" \
  -e DB_USERNAME="root" \
  -e DB_PASSWORD="your_password" \
  -e JWT_SECRET="your-32-char-min-secret-key-for-jwt" \
  smartroute-backend
```

### Inspect Container Logs and Health
```bash
# View live container logs
docker logs -f smartroute-backend

# Check container health status
docker inspect --format='{{json .State.Health}}' smartroute-backend
```

---

## 🌐 Production Deployment Guide

### 1. Database Deployment (Aiven MySQL)
1. Create a MySQL 8.4 service on [Aiven.io](https://aiven.io/).
2. Copy the **Service URI**, **Host**, **Port**, **User**, and **Password**.
3. Note the JDBC connection string with required SSL:
   ```
   jdbc:mysql://<aiven-host>:<port>/defaultdb?sslMode=REQUIRED&serverTimezone=UTC
   ```

### 2. Backend Deployment on Render (Docker)
1. Go to [Render Dashboard](https://dashboard.render.com/) and click **New + > Web Service**.
2. Connect your GitHub repository: `https://github.com/Charansingaraju1/SmartRoute`.
3. Configure the build:
   * **Runtime:** `Docker`
   * **Docker Command / Context:** `./backend`
   * **Dockerfile Path:** `./backend/Dockerfile`
   * **Health Check Path:** `/api/actuator/health`
4. In **Environment Variables**, add:
   * `SPRING_PROFILES_ACTIVE`: `prod`
   * `PORT`: `8080`
   * `DB_URL`: `jdbc:mysql://<aiven-host>:<port>/defaultdb?sslMode=REQUIRED&serverTimezone=UTC`
   * `DB_USERNAME`: `<your-aiven-user>`
   * `DB_PASSWORD`: `<your-aiven-password>`
   * `JWT_SECRET`: `$(openssl rand -base64 32)`
   * `CORS_ALLOWED_ORIGINS`: `https://smart-route-jet.vercel.app,http://localhost:5173`
   * `REQUIRE_EMAIL_VERIFICATION`: `false` *(or configure Gmail SMTP below)*
   * `MAIL_USERNAME`: `<your-gmail>@gmail.com`
   * `MAIL_PASSWORD`: `<16-character-app-password>`
5. Click **Deploy Web Service**.

> **Note:** Alternatively, deploy automatically via Render Blueprints using the included [`render.yaml`](render.yaml).

### 3. Frontend Deployment on Vercel
1. Go to [Vercel Dashboard](https://vercel.com/) and click **Add New > Project**.
2. Import the `SmartRoute` repository.
3. Configure project settings:
   * **Root Directory:** `frontend`
   * **Framework Preset:** `Vite`
   * **Build Command:** `npm run build`
   * **Output Directory:** `dist`
4. In **Environment Variables**:
   * `VITE_API_URL`: `https://smartroute-backend-4vyz.onrender.com/api`
5. Click **Deploy**.

> **Note:** The [`frontend/vercel.json`](frontend/vercel.json) file automatically proxies `/api/*` to the Render backend and handles SPA route rewrites for direct navigation.

---

## 🔑 Environment Variables Reference

| Variable | Description | Default / Example | Required in Prod |
| :--- | :--- | :--- | :---: |
| `SPRING_PROFILES_ACTIVE` | Active Spring profile (`dev`, `test`, `prod`) | `dev` | **Yes** (`prod`) |
| `PORT` | HTTP server port | `8080` | Managed by Render |
| `DB_URL` | MySQL JDBC connection string | `jdbc:mysql://localhost:3306/smartroute...` | **Yes** |
| `DB_USERNAME` | Database username | `smartroute` | **Yes** |
| `DB_PASSWORD` | Database password | — | **Yes** |
| `JWT_SECRET` | 256-bit signing key for JWT tokens | — | **Yes** |
| `CORS_ALLOWED_ORIGINS` | Comma-separated list of allowed frontend origins | `https://smart-route-jet.vercel.app` | **Yes** |
| `REQUIRE_EMAIL_VERIFICATION` | Enforce email OTP verification on student registration | `false` | No |
| `MAIL_HOST` | SMTP server host | `smtp.gmail.com` | No |
| `MAIL_PORT` | SMTP port | `587` | No |
| `MAIL_USERNAME` | SMTP account email | — | Conditional |
| `MAIL_PASSWORD` | SMTP account app password | — | Conditional |
| `PAYMENT_PROVIDER_KEY` | Razorpay public key ID | — | Optional |
| `PAYMENT_PROVIDER_SECRET` | Razorpay secret key | — | Optional |
| `VITE_API_URL` | Frontend API endpoint URL | `/api` | Optional (Proxied) |

---

## 🧪 Testing and Verification

### Backend Tests
```bash
cd backend
mvn test
```
* **Unit & Integration Tests:** 83 tests covering Authentication, JWT, Student/Teacher operations, Transport workbook ingestion, and Rate Limiting. All tests pass with zero failures.

### Frontend Tests
```bash
cd frontend
npm test
```
* **Vitest Suite:** 49 tests covering Authentication Context, Theme Switcher, Bus Pass application, and GPS tracking interfaces. All tests pass with zero failures.

### Production Build Verification
```bash
# Verify backend fat JAR build
cd backend && mvn clean package -DskipTests

# Verify frontend bundle build
cd frontend && npm run build
```

---

## 📄 License & Institutional Attribution

Proprietary — Developed for **Anurag University** Transportation & Transit Department.  
All rights reserved © 2026.