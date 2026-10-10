# SmartRoute – Intelligent University Transportation Management System

> **Anurag University** | Production-Ready Transport Portal

A complete, professional web platform for university transportation management built with **Java 21**, **Spring Boot 4.1.1**, **React 18**, **TypeScript**, and **MySQL 8**.

---

## 🚀 Features

### 🎓 Student Features
- **Real-time Bus Tracking** – Live GPS location with three-stops-away alerts
- **My Bus & Route** – Assigned bus, route, boarding point, pickup time
- **Digital Bus Pass** – QR code, OCR upload, camera capture, manual entry
- **Missed Bus Assistance** – Request alternative bus with capacity validation
- **SOS Emergency** – Medical, accident, safety, breakdown categories
- **Notifications** – In-app, email, push for delays, disruptions, assignments
- **Payments** – Secure Indian payment gateway integration (Razorpay sandbox)
- **Profile & Settings** – Notification preferences, emergency contacts

### 👨‍🏫 Teacher Features
- **Transport Operations** – Bus management, route oversight, passenger lists
- **Live Location Publishing** – Authorized GPS sharing to students
- **Delay & Disruption Management** – Verified manual publishing with auto-expiry
- **Missed Bus Handling** – Acknowledge, assign alternative bus, resolve
- **SOS Response** – Acknowledge, respond, resolve with resolution notes
- **Assignment Management** – Capacity-aware student-bus assignments

### 🔐 Authentication & Security
- **Email OTP Verification** – Registration, login, password reset
- **JWT Authentication** – Secure stateless auth with refresh tokens
- **BCrypt Password Hashing** – Cost factor 12
- **Role-based Access** – STUDENT / TEACHER (no admin role per requirements)
- **Rate Limiting** – Login, OTP, password reset endpoints
- **Audit Logging** – Comprehensive action tracking

### 🚌 Transport Data (Real)
- **8 Zones** – DSNR, Ramanthapur, Uppal, Secunderabad, ECIL, Bhongir, Alwal, Medchal
- **67 Unique Buses** – Deduplicated by registration number
- **69 Route Assignments** – Morning/Evening with proper direction
- **389+ Boarding Points** – Ordered stops with timings
- **Excel Importer** – Idempotent import from authoritative workbook

---

## 🏗️ Architecture

```
D:\SmartRoute
├── backend/                 # Spring Boot 4.1.1 Application
│   ├── src/main/java/com/anuraguniversity/smartroute/
│   │   ├── auth/           # Authentication & Authorization
│   │   ├── transport/      # Transport domain (Bus, Route, Stop, Zone)
│   │   ├── student/        # Student domain & features
│   │   ├── teacher/        # Teacher domain & features
│   │   ├── notification/   # In-app, Email, Push notifications
│   │   ├── gps/            # Location tracking
│   │   ├── buspass/        # Digital bus pass management
│   │   ├── payment/        # Payment gateway integration
│   │   ├── sos/            # Emergency SOS system
│   │   ├── audit/          # Audit logging
│   │   ├── common/         # Shared entities, enums, DTOs, exceptions
│   │   ├── config/         # Spring configuration
│   │   └── security/       # JWT, filters, security config
│   ├── src/main/resources/
│   │   ├── db/migration/   # Flyway migrations (V1-V11)
│   │   └── data/           # Transport workbook location
│   └── pom.xml
├── frontend/               # React 18 + TypeScript + Vite
│   ├── src/
│   │   ├── features/       # Feature-based organization
│   │   │   ├── auth/
│   │   │   ├── student/
│   │   │   ├── teacher/
│   │   │   ├── transport/
│   │   │   ├── gps/
│   │   │   ├── buspass/
│   │   │   ├── payments/
│   │   │   ├── notifications/
│   │   │   └── sos/
│   │   ├── components/     # Shared UI components
│   │   ├── layouts/        # Page layouts
│   │   ├── pages/          # Route pages
│   │   ├── services/       # API client
│   │   ├── hooks/          # Custom React hooks
│   │   ├── types/          # TypeScript types
│   │   └── styles/         # Tailwind CSS
│   └── package.json
├── docs/                   # Documentation
└── README.md
```

---

## 🛠️ Tech Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Java | 21 (LTS) | Language |
| Spring Boot | 4.1.1 | Framework |
| Spring Data JPA | - | ORM |
| Spring Security | - | Auth & Authorization |
| MySQL | 8.0 | Database |
| Flyway | 11.3.0 | Database Migrations |
| JWT (jjwt) | 0.12.6 | Token Authentication |
| MapStruct | 1.6.3 | DTO Mapping |
| Apache POI | 5.3.0 | Excel Processing |
| Resilience4j | 2.2.0 | Rate Limiting, Retry |
| Micrometer/Prometheus | - | Metrics |
| Springdoc OpenAPI | 2.8.0 | API Documentation |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 18.3.1 | UI Framework |
| TypeScript | 5.5.4 | Type Safety |
| Vite | 5.4.2 | Build Tool |
| React Router | 6.26.1 | Routing |
| Tailwind CSS | 3.4.10 | Styling |
| React Hook Form | 7.52.2 | Forms |
| Zod | 3.23.8 | Validation |
| Axios | 1.7.4 | HTTP Client |
| Zustand | 4.5.5 | State Management |
| TanStack Query | 5.x | Server State |
| Lucide React | 0.424.0 | Icons |
| Vitest | 2.0.5 | Testing |

---

## 📋 Prerequisites

- **Java 21** (Eclipse Temurin recommended)
- **Maven 3.9+**
- **Node.js 20+** & **npm 10+**
- **MySQL 8.0+**
- **Git**

---

## 🚀 Quick Start

### 1. Clone & Configure
```bash
cd D:\SmartRoute
cp .env.example .env
# Edit .env with your credentials
```

### 2. Database Setup
```sql
CREATE DATABASE smartroute CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'smartroute'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON smartroute.* TO 'smartroute'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Backend
```bash
cd backend
mvn clean compile
mvn spring-boot:run
# Runs on http://localhost:8080/api
```

### 4. Frontend
```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

### 5. Transport Data Import
Place the authoritative workbook at:
```
backend/src/main/resources/data/AU_College_Transport_2026-2027-1.xls
```

Then trigger import via API:
```bash
curl -X POST http://localhost:8080/api/transport/import \
  -H "Authorization: Bearer <teacher_jwt_token>"
```

---

## 🔧 Configuration

### Required Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DB_URL` | MySQL JDBC URL | Yes |
| `DB_USERNAME` | Database username | Yes |
| `DB_PASSWORD` | Database password | Yes |
| `JWT_SECRET` | 256-bit secret (32+ chars) | Yes |
| `MAIL_HOST` | SMTP host | For OTP emails |
| `MAIL_PORT` | SMTP port | For OTP emails |
| `MAIL_USERNAME` | SMTP username | For OTP emails |
| `MAIL_PASSWORD` | SMTP password | For OTP emails |
| `MAIL_FROM` | From email address | For OTP emails |
| `PAYMENT_PROVIDER_KEY` | Razorpay key ID | For payments |
| `PAYMENT_PROVIDER_SECRET` | Razorpay secret | For payments |
| `PAYMENT_WEBHOOK_SECRET` | Webhook verification | For payments |
| `PUSH_VAPID_PUBLIC_KEY` | VAPID public key | For push notifications |
| `PUSH_VAPID_PRIVATE_KEY` | VAPID private key | For push notifications |

### JWT Secret Generation
```bash
# Generate a secure 256-bit secret
openssl rand -base64 32
```

### VAPID Keys Generation
```bash
npx web-push generate-vapid-keys
```

---

## 📚 API Documentation

Once backend is running:
- **Swagger UI**: http://localhost:8080/api/swagger-ui.html
- **OpenAPI Spec**: http://localhost:8080/api/v3/api-docs

### Key Endpoints

#### Authentication
```
POST   /api/auth/register/student     # Student registration
POST   /api/auth/register/teacher     # Teacher registration
POST   /api/auth/login                # Login
POST   /api/auth/verify-otp           # OTP verification
POST   /api/auth/forgot-password      # Forgot password
POST   /api/auth/reset-password       # Reset password
POST   /api/auth/resend-otp           # Resend OTP
```

#### Transport (Public)
```
GET    /api/buses                     # List all buses
GET    /api/buses/{id}                # Bus details
GET    /api/routes                    # List routes (zone, direction filters)
GET    /api/routes/{id}               # Route details with stops
GET    /api/stops?routeId=            # Boarding points for route
```

#### Student (Requires STUDENT role)
```
GET    /api/student/profile           # Student profile
GET    /api/student/assignment        # Current bus assignment
GET    /api/student/bus               # Assigned bus details
GET    /api/student/notifications     # Notifications (paginated)
POST   /api/student/missed-bus        # Report missed bus
POST   /api/student/sos               # Trigger SOS
GET    /api/student/bus-pass          # Bus pass details
POST   /api/student/bus-pass          # Upload/update bus pass
GET    /api/student/payments          # Payment history
```

#### Teacher (Requires TEACHER role)
```
GET    /api/teacher/profile           # Teacher profile
GET    /api/teacher/buses             # Assigned buses
GET    /api/teacher/bus/{id}/students # Passenger list with Student IDs
POST   /api/teacher/delays            # Publish delay
POST   /api/teacher/disruptions       # Publish disruption
GET    /api/teacher/missed-bus        # Missed bus requests
GET    /api/teacher/sos               # Active SOS alerts
POST   /api/teacher/location          # Publish live location
```

---

## 🗄️ Database Schema

Flyway migrations create all tables:
- **V1** - Users
- **V2** - Students
- **V3** - Teachers
- **V4** - Transport (Zones, Buses, Routes, Boarding Points)
- **V5** - Assignments (Student-Bus, Teacher-Bus)
- **V6** - Notifications & Push Subscriptions
- **V7** - Student Features (Missed Bus, SOS)
- **V8** - Teacher Features (Delays, Disruptions)
- **V9** - Payments & OTPs
- **V10** - Audit Logs & Location Records
- **V11** - Bus Passes & Transport Disruptions

Run migrations:
```bash
cd backend
mvn flyway:migrate
```

---

## 🧪 Testing

### Backend
```bash
cd backend
mvn test                    # Unit tests
mvn verify                  # Integration tests (Testcontainers)
```

### Frontend
```bash
cd frontend
npm run test                # Unit tests
npm run test:ui             # Test UI
npm run typecheck           # TypeScript check
npm run lint                # ESLint
```

---

## 🏭 Production Deployment

### Backend
```bash
cd backend
mvn clean package -Pprod
java -jar target/smartroute-backend-1.0.0-SNAPSHOT.jar --spring.profiles.active=prod
```

### Frontend
```bash
cd frontend
npm run build
# Deploy dist/ to nginx/Apache/CDN
```

### Docker (Optional)
```dockerfile
# Backend Dockerfile
FROM eclipse-temurin:21-jre
COPY target/smartroute-backend-*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]

# Frontend Dockerfile (nginx)
FROM nginx:alpine
COPY dist/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

### Environment Checklist
- [ ] Strong JWT_SECRET (256+ bits)
- [ ] Production MySQL with SSL
- [ ] SMTP credentials for OTP emails
- [ ] Payment gateway live credentials
- [ ] VAPID keys for push notifications
- [ ] HTTPS/TLS certificates
- [ ] CORS origins configured
- [ ] Actuator endpoints secured
- [ ] Database backups configured
- [ ] Log aggregation setup

---

## 📁 Project Structure Details

### Backend Package Structure
```
com.anuraguniversity.smartroute
├── auth/
│   ├── controller/       # AuthController
│   ├── dto/              # Request/Response DTOs
│   ├── entity/           # User, OTP
│   ├── exception/        # Custom exceptions
│   ├── repository/       # UserRepository, OTPRepository
│   └── service/          # AuthService, EmailService
├── transport/
│   ├── controller/       # TransportController
│   ├── dto/              # ImportResult
│   ├── entity/           # Zone, Bus, Route, BoardingPoint, StudentBusAssignment, TransportDisruption, DelayAlert
│   ├── repository/       # All transport repositories
│   └── service/          # TransportWorkbookImporter
├── student/
│   ├── entity/           # Student, MissedBusRequest
│   ├── repository/       # StudentRepository, MissedBusRequestRepository
│   └── service/
├── teacher/
│   ├── entity/           # Teacher, TeacherBusAssignment, Delay, Disruption
│   ├── repository/       # TeacherRepository, DelayRepository, DisruptionRepository
│   └── service/
├── notification/
│   ├── entity/           # Notification, PushSubscription
│   └── repository/
├── gps/
│   ├── entity/           # LocationRecord
│   └── repository/
├── buspass/
│   ├── entity/           # BusPassRecord
│   └── repository/
├── payment/
│   ├── entity/           # PaymentRecord
│   └── repository/
├── sos/
│   ├── entity/           # SOSRequest
│   └── repository/
├── audit/
│   ├── entity/           # AuditLog
│   └── repository/
├── common/
│   ├── entity/           # BaseEntity
│   ├── dto/              # ApiResponse, PageResponse, ErrorResponse
│   ├── enums/            # All enums
│   └── exception/        # GlobalExceptionHandler
├── config/               # SecurityConfig, OpenApiConfig, JwtProperties, SmartRouteProperties
└── security/             # JwtTokenProvider, JwtAuthenticationFilter, EntryPoint, AccessDeniedHandler
```

### Frontend Feature Structure
```
src/features/
├── auth/
│   ├── context/          # AuthContext
│   └── components/
├── student/
│   ├── components/
│   ├── hooks/
│   └── pages/
├── teacher/
│   ├── components/
│   ├── hooks/
│   └── pages/
├── transport/
├── gps/
├── buspass/
├── payments/
├── notifications/
├── sos/
└── common/
```

---

## 🔒 Security Considerations

- **No hardcoded secrets** – All via environment variables
- **Passwords** – BCrypt cost 12, never logged
- **JWT** – 256-bit secret, 24h access / 7d refresh, minimal payload
- **Rate Limiting** – Login (5/15min), OTP (5/hour), Password reset (3/hour)
- **CORS** – Restricted to configured origins
- **File Uploads** – Size limits, MIME validation, secure storage
- **Audit Logs** – All sensitive actions tracked
- **SQL Injection** – Parameterized queries via JPA
- **XSS Prevention** – React auto-escaping, CSP headers

---

## 📊 Monitoring

- **Actuator**: `/actuator/health`, `/actuator/metrics`, `/actuator/prometheus`
- **Metrics**: JVM, HTTP, DB pool, custom business metrics
- **Logging**: Structured JSON logs, correlation IDs

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Code Standards
- Backend: Google Java Style, Spotless formatting
- Frontend: ESLint + Prettier, TypeScript strict mode
- Commits: Conventional Commits

---

## 📄 License

Proprietary – Anurag University. All rights reserved.

---

## 📞 Support

- **Email**: transport@anuraguniversity.edu.in
- **Phone**: +91 40 1234 5678
- **Issues**: GitHub Issues (internal)

---

## 🎯 Roadmap

- [ ] Mobile App (React Native)
- [ ] AI-powered Route Optimization
- [ ] Real-time Traffic Integration
- [ ] Multi-language Support
- [ ] Analytics Dashboard
- [ ] IoT Sensor Integration

---

**Built with ❤️ for Anurag University**