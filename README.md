# ProcureAI

A multi-tenant SaaS procurement platform built with Java Spring Boot microservices, Next.js frontend, and full infrastructure stack.

## Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Java 21, Spring Boot 3.3.5, Spring Cloud 2023.0.5 |
| **Frontend** | Next.js 16, React 19, TypeScript 5, Tailwind CSS 4 |
| **Database** | PostgreSQL 15 (10 isolated databases, one per service) |
| **Message Broker** | RabbitMQ 3 |
| **Cache** | Redis 7 |
| **Object Storage** | MinIO (S3-compatible) |
| **AI/OCR** | Python (FastAPI) |
| **Deployment** | Docker Compose (local), Kubernetes (production) |

## Architecture

```
                    ┌──────────────┐
                    │   Frontend   │
                    │  Next.js:3000│
                    └──────┬───────┘
                           │
                    ┌──────▼───────┐
                    │  API Gateway │
                    │   :8082      │
                    │ JWT + Rate   │
                    │ Limiting     │
                    └──────┬───────┘
                           │
          ┌────────────────┼────────────────┐
          │                │                │
   ┌──────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐
   │ Auth Service│ │Procurement  │ │  RFQ Svc    │
   │   :8081     │ │  :8088      │ │  :8083      │
   └──────┬──────┘ └──────┬──────┘ └──────┬──────┘
          │                │                │
   ┌──────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐
   │ Supplier    │ │ Quotation   │ │  Invoice    │
   │  :8085      │ │  :8084      │ │  :8086      │
   └──────┬──────┘ └──────┬──────┘ └──────┬──────┘
          │                │                │
          └────────────────┼────────────────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
       ┌──────▼──┐  ┌──────▼──┐  ┌─────▼───┐
       │PostgreSQL│  │ RabbitMQ │  │  Redis  │
       │  :5432   │  │  :5672   │  │  :6379  │
       └─────────┘  └─────────┘  └─────────┘
```

## Services

| Service | Port | Description |
|---|---|---|
| **auth-service** | 8081 | Authentication, user management, RBAC, company registration, subscriptions |
| **api-gateway** | 8082 | Request routing, JWT validation, rate limiting, CORS |
| **rfq-service** | 8083 | Request for Quotation management |
| **quotation-service** | 8084 | Supplier quotation handling |
| **supplier-service** | 8085 | Supplier registration, profiles, documents |
| **invoice-service** | 8086 | Invoice creation and tracking |
| **notification-service** | 8087 | Email notifications via RabbitMQ consumers |
| **procurement-service** | 8088 | Purchase requests, purchase orders, approval workflows |
| **user-service** | 8090 | User profiles and departments |
| **ai-service** | 18000 | AI-powered supplier ranking and recommendations (Python) |
| **ocr-service** | 8091 | Document OCR processing (Python) |

## Getting Started

### Prerequisites

- Java 21
- Node.js 18+
- Docker & Docker Compose
- Maven

### 1. Start Infrastructure

```bash
cd infrastructure
docker-compose up -d
```

This starts PostgreSQL, RabbitMQ, Redis, and MinIO. Wait ~10 seconds for them to be healthy.

### 2. Start Java Services (Terminal per service)

```bash
cd services/auth-service
mvn spring-boot:run
```

```bash
cd services/api-gateway
mvn spring-boot:run
```

```bash
cd services/procurement-service
mvn spring-boot:run
```

Repeat for other services as needed (rfq-service, quotation-service, supplier-service, invoice-service, notification-service, user-service).

### 3. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:3000`.

### 4. Access Services

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| API Gateway | http://localhost:8082 |
| RabbitMQ UI | http://localhost:15672 (guest/guest) |
| MinIO Console | http://localhost:9001 |
| PostgreSQL | localhost:5432 |

## API Endpoints

All requests go through the gateway at `http://localhost:8082`.

### Authentication (Public)

| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/register-company` | Register a new company |
| POST | `/api/auth/login` | Login (returns JWT) |
| POST | `/api/auth/refresh` | Refresh JWT token |
| GET | `/api/auth/me` | Get current user |

### Procurement

| Method | Path | Description |
|---|---|---|
| POST | `/api/procurement/pr` | Create purchase request |
| GET | `/api/procurement/pr` | List purchase requests |
| POST | `/api/procurement/pr/{id}/submit` | Submit for approval |
| POST | `/api/procurement/pr/{id}/approve` | Approve/reject PR |
| POST | `/api/procurement/pr/{id}/generate-po` | Generate purchase order |

### RFQ & Quotation

| Method | Path | Description |
|---|---|---|
| POST | `/api/rfq` | Create RFQ |
| GET | `/api/rfq` | List RFQs |
| POST | `/api/quotation` | Submit quotation |
| GET | `/api/quotation/rfq/{id}/compare` | Compare quotations |

### Admin

| Method | Path | Description |
|---|---|---|
| GET | `/api/platform/admin/dashboard` | Platform dashboard |
| GET | `/api/platform/admin/companies` | List companies |
| GET | `/api/platform/admin/system/health` | System health |

## Project Structure

```
procure-ai/
├── frontend/                    # Next.js frontend
│   └── src/
│       ├── app/                 # Pages (App Router)
│       │   ├── login/
│       │   ├── signup/
│       │   └── dashboard/       # Role-based dashboards
│       ├── lib/                 # API client, auth, translations
│       └── components/          # UI components
├── services/
│   ├── common/                  # Shared code (security, events, tenant, caching)
│   ├── api-gateway/             # Spring Cloud Gateway
│   ├── auth-service/            # Authentication & user management
│   ├── procurement-service/     # PR/PO workflow
│   ├── rfq-service/             # Request for Quotation
│   ├── quotation-service/       # Supplier quotations
│   ├── supplier-service/        # Supplier management
│   ├── invoice-service/         # Invoice processing
│   ├── notification-service/    # Email notifications
│   ├── user-service/            # User profiles & departments
│   ├── ai-service/              # Python AI service
│   └── ocr-service/             # Python OCR service
├── infrastructure/
│   ├── docker-compose.yml       # All services
│   └── postgres/                # DB init scripts
├── k8s/                         # Kubernetes manifests
│   ├── deployments/
│   ├── services/
│   ├── ingress/
│   ├── hpa/
│   └── pdb/
└── pom.xml                      # Parent POM (Maven multi-module)
```

## RBAC Roles

| Role | Description |
|---|---|
| `ADMIN` | Platform admin (full access) |
| `COMPANY_ADMIN` | Company admin (manage company users, approve PRs) |
| `PROCUREMENT` | Procurement officer (create/manage PRs, POs, RFQs) |
| `MANAGER` | Manager (approve PRs, view reports) |
| `EMPLOYEE` | Employee (submit PRs) |
| `SUPPLIER` | Supplier (respond to RFQs, submit quotations) |

## License

Private - All rights reserved.
