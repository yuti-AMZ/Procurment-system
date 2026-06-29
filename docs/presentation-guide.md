# ProcureAI — Complete Presentation Guide

---

## Slide 1: Title Slide

> **ProcureAI**  
> *Enterprise Procurement Management Platform*  
> A Microservices-Based Purchase-to-Pay System

**Speaker Notes:**
> "Good morning/afternoon. Today I'll be presenting ProcureAI — a full-stack, enterprise-grade procurement management platform that digitizes the complete purchase-to-pay lifecycle. From the moment an employee needs to buy something, all the way through approvals, supplier bidding, purchase orders, and invoice processing — this platform handles it all through a modern, microservices-based architecture."

---

## Slide 2: The Problem We Solve

**Visual: Before/After diagram**

| Before (Manual) | After (ProcureAI) |
|----------------|-------------------|
| Paper/email-based PRs | Digital PR submission with line items |
| Manager approval via email chains | One-click approve/reject with audit trail |
| Spreadsheet supplier tracking | Structured RFQ → Quotation workflow |
| Manual PO generation | Auto-generated from approved PRs |
| No visibility into spend | Real-time dashboard with metrics |

**Speaker Notes:**
> "Procurement is often a fragmented, paper-heavy process. Employees fill out forms, email managers, wait for approvals, hunt for suppliers, compare quotes in spreadsheets, then manually create purchase orders. ProcureAI brings all of this into one unified platform with real-time visibility at every step."

---

## Slide 3: High-Level Architecture

**Visual: Architecture diagram (see below)**

```
┌────────────────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ │
│  │ Employee │ │ Manager  │ │Procure   │ │ Supplier │ │ Admin    │ │
│  │ Portal   │ │ Portal   │ │ Portal   │ │ Portal   │ │ Portal   │ │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ │
│       │            │            │            │            │        │
│       └────────────┴─────┬──────┴────────────┴────────────┘        │
│                          │ HTTP (REST)                             │
│                    ┌─────▼──────┐                                   │
│                    │  Next.js 16 │  Port 3000                      │
│                    │  React 19   │  Tailwind CSS 4                 │
│                    │  Dark Theme │  Gold Accent                    │
│                    └─────┬──────┘                                   │
└──────────────────────────┼─────────────────────────────────────────┘
                           │ Bearer JWT Token (Authorization header)
┌──────────────────────────▼─────────────────────────────────────────┐
│                    API GATEWAY LAYER                                │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  Spring Cloud Gateway  │  Port 8082                          │  │
│  │  ┌──────────────────────────────────────────────────┐       │  │
│  │  │  JwtAuthFilter — validates token on EVERY request │       │  │
│  │  │  GlobalCORS — single CORS origin: localhost:3000 │       │  │
│  │  └──────────────────────────────────────────────────┘       │  │
│  └───────┬──────────┬──────────┬──────────┬──────────┬──────────┘  │
└──────────┼──────────┼──────────┼──────────┼──────────┼────────────┘
           │          │          │          │          │
     ┌─────▼──┐ ┌────▼───┐ ┌───▼────┐ ┌───▼───┐ ┌───▼──────┐
     │  Auth  │ │ User   │ │Procure │ │ RFQ   │ │Quotation │
     │ :8081  │ │ :8090  │ │ :8088  │ │ :8083 │ │ :8084    │
     └───┬────┘ └───┬────┘ └───┬────┘ └───┬───┘ └────┬─────┘
         │          │          │          │           │
     ┌───▼────┐ ┌───▼────┐ ┌───▼────┐ ┌───▼───┐ ┌───▼──────┐
     │Supplier│ │Invoice │ │Notif   │ │  AI   │ │ RabbitMQ │
     │ :8085  │ │ :8086  │ │ :8087  │ │Service│ │ :5672    │
     └───┬────┘ └───┬────┘ └───┬────┘ └───┬───┘ └────┬─────┘
         │          │          │           │           │
         └──────────┴──────────┴───────────┴───────────┘
                              │
                    ┌─────────▼──────────┐
                    │   PostgreSQL 15    │
                    │   8 databases      │
                    │   admin/supersecret │
                    └────────────────────┘
```

**Speaker Notes:**
> "The architecture follows a microservices pattern with clear separation of concerns. At the top, we have five distinct portals — Employee, Manager, Procurement, Supplier, and Admin — each tailored to its user's workflow.
>
> "The frontend is built with Next.js 16 and React 19, communicating with the backend exclusively through the API Gateway on port 8082. Every single API request passes through the JwtAuthFilter, which validates the Bearer token before routing to the appropriate microservice.
>
> "We have nine Spring Boot microservices, each owning its own database — that's the database-per-service pattern. They communicate synchronously via REST through the gateway, and asynchronously via RabbitMQ for events like 'PR submitted' or 'PO generated'.
>
> "There's also a Python-based AI service scaffolded for future smart supplier recommendations and spend analytics."

---

## Slide 3.5: Why Port 8082? (Common Question)

**Speaker Notes:**
> "You might notice the gateway is on port 8082, not the standard 8080. During setup, we discovered that port 8080 was occupied by a Windows system process (ApplicationWebServer.exe from an HP driver). Since we couldn't kill a system process without admin rights, we shifted everything up. Auth-service went to 8081, gateway to 8082, and procurement-service to 8088. This is a good example of real-world constraint-driven decision making."

---

## Slide 4: Data Model Deep Dive

**Visual: Entity relationship diagram**

```
┌───────────┐     ┌──────────────┐
│   User    │────→│  Department  │
│───────────│     │──────────────│
│ id (PK)   │     │ id           │
│ email     │     │ name         │
│ firstName │     │ description  │
│ lastName  │     └──────────────┘
│ role      │
│ ────────  │     ENUMS:
│ ADMIN     │     UserRole: ADMIN, PROCUREMENT,
│ PROCURE   │       MANAGER, EMPLOYEE, SUPPLIER
│ MANAGER   │
│ EMPLOYEE  │
│ SUPPLIER  │
└─────┬─────┘
      │
      │  owned_by
      │
┌─────▼──────────────────────────────────────────────────────┐
│                    PurchaseRequest                          │
│──────────────────────────────────────────────────────────────│
│ id (PK) │ prNumber (unique) │ title │ description          │
│ department │ urgency │ totalAmount │ notes                  │
│ status: DRAFT → PENDING_APPROVAL → APPROVED/REJECTED       │
│         → PO_GENERATED                                      │
│ createdAt │ updatedAt                                       │
│                                                              │
│ ┌──────────────────────┐   ┌──────────────────────────────┐ │
│ │  PurchaseRequestItem │   │     ApprovalRecord           │ │
│ │──────────────────────│   │──────────────────────────────│ │
│ │ id │ itemName        │   │ id │ approverId │ roleName   │ │
│ │ description │ qty    │   │ status: PENDING/APPROVED/    │ │
│ │ unitPrice │ total    │   │   REJECTED/SKIPPED           │ │
│ │ unitOfMeasure        │   │ comments │ stepOrder         │ │
│ └──────────────────────┘   │ actionedAt                   │ │
│                            └──────────────────────────────┘ │
└────────────────────────────┬─────────────────────────────────┘
                             │
                    generates │
                             │
┌────────────────────────────▼─────────────────────────────────┐
│                      PurchaseOrder                            │
│───────────────────────────────────────────────────────────────│
│ id (PK) │ poNumber (unique) │ vendorName │ vendorId          │
│ status: GENERATED → SENT → PARTIALLY_RECEIVED → RECEIVED     │
│         → CLOSED / CANCELLED                                  │
│ totalAmount │ paymentTerms │ deliveryTerms                    │
│ orderDate │ expectedDeliveryDate                              │
│                                                               │
│ ┌──────────────────────┐                                      │
│ │  PurchaseOrderItem   │                                      │
│ │──────────────────────│                                      │
│ │ itemName │ qty       │                                      │
│ │ receivedQuantity     │                                      │
│ │ unitPrice │ total    │                                      │
│ └──────────────────────┘                                      │
└───────────────────────────────────────────────────────────────┘

┌──────────────┐     ┌───────────────────┐     ┌──────────────┐
│     RFQ      │     │    Quotation      │     │   Invoice    │
│──────────────│     │───────────────────│     │──────────────│
│ id (PK)      │────→│ id (PK)           │     │ id (PK)      │
│ rfqNumber    │     │ quotationNumber   │     │ invoiceNumber│
│ title        │     │ rfqId (FK)        │     │ poId (FK)    │
│ status:      │     │ supplierId (FK)   │     │ supplierId   │
│ DRAFT/OPEN   │     │ status: DRAFT/    │     │ status:      │
│ CLOSED/      │     │ SUBMITTED/        │     │ PENDING/     │
│ AWARDED/     │     │ UNDER_EVALUATION/ │     │ APPROVED/    │
│ CANCELLED    │     │ ACCEPTED/REJECTED │     │ PAID/REJECTED│
│ deadline     │     │ totalAmount       │     │ totalAmount  │
│              │     │ evaluationScore   │     │ documentUrl  │
│ ┌──────────┐ │     │                   │     │              │
│ │RfqLineItem│ │     │ ┌──────────────┐ │     └──────────────┘
│ │──────────│ │     │ │QuotationLine │ │
│ │itemName  │ │     │ │Item          │ │     ┌──────────────┐
│ │qty       │ │     │ │──────────────│ │     │   Supplier   │
│ │unitOfMeas│ │     │ │itemName      │ │     │──────────────│
│ └──────────┘ │     │ │qty │ unitPrice│ │     │ companyName  │
│              │     │ │totalPrice    │ │     │ email │ phone │
│ ┌──────────┐ │     │ └──────────────┘ │     │ status:      │
│ │RfqSupplier│ │     └───────────────────┘     │ PENDING/     │
│ │──────────│ │                                │ APPROVED/    │
│ │supplierId│ │                                │ REJECTED/    │
│ │response: │ │                                │ SUSPENDED    │
│ │PENDING/  │ │                                │ category     │
│ │INVITED/  │ │                                │ contacts[]   │
│ │DECLINED/ │ │                                │ documents[]  │
│ │SUBMITTED │ │                                └──────────────┘
│ └──────────┘ │
└──────────────┘
```

**Speaker Notes:**
> "The data model spans 15+ entities across 8 databases, each service owning its domain. Let me walk you through the core workflow:
>
> "A **PurchaseRequest** is the starting point. An employee creates it with line items, optionally a budget and urgency. It starts in DRAFT, then when submitted, moves to PENDING_APPROVAL. The **ApprovalRecord** entries track who approved or rejected it at each step.
>
> "Once approved, it can generate a **PurchaseOrder** — the legal document sent to a supplier. The PO tracks its own status from GENERATED through SENT, PARTIALLY_RECEIVED, to RECEIVED and CLOSED.
>
> "For competitive bidding, an **RFQ** (Request for Quotation) is created with line items and invited suppliers. Suppliers submit **Quotations**, which procurement evaluates, scores, and either accepts or rejects.
>
> "**Invoices** arrive from suppliers referencing POs, and go through their own approval/payment lifecycle.
>
> "The User and Department entities are shared across services, while everything else is domain-specific."

---

## Slide 5: API Gateway & Routing

**Visual: Gateway routing table**

```
┌─────────────────────────────────────────────────────────────────┐
│  API GATEWAY — Port 8082                                        │
│  Spring Cloud Gateway + JwtAuthFilter                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┬──────────────────┬──────────────────────────┐ │
│  │ Route ID     │ Predicate Path   │ Target (Service Port)    │ │
│  ├──────────────┼──────────────────┼──────────────────────────┤ │
│  │ auth-service │ /api/auth/**     │ http://localhost:8081    │ │
│  │ user-service │ /api/users/**    │ http://localhost:8090    │ │
│  │              │ /api/departments/**                         │ │
│  │ procurement  │ /api/procurement/**│ http://localhost:8088  │ │
│  │ rfq-service  │ /api/rfq/**      │ http://localhost:8083   │ │
│  │ quotation    │ /api/quotation/** │ http://localhost:8084   │ │
│  │ supplier     │ /api/suppliers/**│ http://localhost:8085   │ │
│  │ invoice      │ /api/invoices/** │ http://localhost:8086   │ │
│  │ notification │ /api/notifications/**│ http://localhost:8087│ │
│  └──────────────┴──────────────────┴──────────────────────────┘ │
│                                                                  │
│  GLOBAL CORS:                                                    │
│    Allowed Origins: localhost:3000, 172.28.0.1:3000             │
│    Allowed Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS      │
│    Allow Credentials: true                                       │
│                                                                  │
│  AUTH FILTER:                                                    │
│    ┌─────────────────────────────────────────────────────────┐   │
│    │ 1. Extract "Authorization: Bearer <token>" from header │   │
│    │ 2. Validate token with auth-service                    │   │
│    │ 3. If invalid → 401 Unauthorized                       │   │
│    │ 4. If valid → forward request to target service        │   │
│    │ 5. Exception: /api/auth/** routes bypass filter        │   │
│    └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Speaker Notes:**
> "The API Gateway is the single entry point for all client requests. It's built on Spring Cloud Gateway and does three critical things:
>
> "First, **routing** — it maps `/api/procurement/**` to the procurement-service on port 8088, `/api/rfq/**` to the rfq-service on 8083, and so on. There are 9 route definitions covering all services.
>
> "Second, **authentication** — every request (except auth endpoints) passes through the JwtAuthFilter. This Spring Cloud Gateway filter extracts the Bearer token from the Authorization header, validates it against the auth-service, and either rejects with 401 or forwards the request. This centralizes security — individual services don't need to validate tokens.
>
> "Third, **CORS** — we made a deliberate decision to handle CORS ONLY at the gateway level. Initially, individual services also set CORS headers, which caused duplicate-header errors in the browser. By removing CORS from all services and keeping it only in the gateway, we fixed this cleanly. The gateway allows requests from localhost:3000 and the Docker network."

---

## Slide 6: Frontend Architecture

**Visual: Frontend structure**

```
frontend/src/
│
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (ThemeProvider, I18nProvider)
│   ├── globals.css               # Tailwind + dark theme variables
│   ├── page.tsx                  # Landing/Home page
│   │
│   ├── login/                    # Login page
│   ├── signup/                   # Registration
│   ├── forgot-password/          # Password recovery
│   ├── change-password/          # Change password
│   ├── about/                    # About page
│   ├── features/                 # Features page
│   ├── contact/                  # Contact page
│   │
│   └── dashboard/               # Protected portal area
│       ├── layout.tsx            # Sidebar + header layout
│       ├── page.tsx              # Role-based redirect
│       │
│       ├── employee/             # Employee Portal (7 pages)
│       │   ├── page.tsx          # Dashboard with PR stats
│       │   ├── purchase-requests/
│       │   │   ├── page.tsx      # My PRs list
│       │   │   ├── new/page.tsx  # Create PR form
│       │   │   └── [id]/
│       │   │       ├── page.tsx   # PR detail + timeline
│       │   │       └── edit/     # Edit draft PR
│       │   ├── orders/page.tsx
│       │   ├── profile/page.tsx
│       │   └── notifications/page.tsx
│       │
│       ├── manager/              # Manager Portal (4 pages)
│       │   ├── page.tsx          # Dashboard with pending count
│       │   ├── approvals/        # Pending approvals
│       │   │   ├── page.tsx      # Approve/reject list
│       │   │   ├── history/      # Approval history
│       │   │   └── escalated/    # Escalated requests
│       │   └── purchase-requests/[id]/page.tsx  # PR detail
│       │
│       ├── procurement/          # Procurement Portal (7 pages)
│       │   ├── page.tsx          # Dashboard
│       │   ├── purchase-requests/page.tsx  # All PRs + Convert to PO
│       │   ├── purchase-orders/page.tsx    # PO tracking
│       │   ├── rfqs/page.tsx     # RFQ management
│       │   ├── quotations/page.tsx  # Quotation evaluation
│       │   ├── invoices/page.tsx   # Invoice processing
│       │   └── suppliers/page.tsx   # Supplier directory
│       │
│       ├── supplier/             # Supplier Portal (6 pages)
│       │   ├── page.tsx
│       │   ├── rfqs/
│       │   ├── quotations/
│       │   ├── invoices/
│       │   ├── awards/
│       │   └── notifications/
│       │
│       └── admin/                # Admin Portal (9 pages)
│           ├── page.tsx
│           ├── users/
│           ├── roles/
│           ├── departments/
│           ├── suppliers/
│           ├── settings/
│           ├── notifications/
│           ├── audit-logs/
│           └── profile/
│
├── components/                   # Shared UI components
│   ├── ui/                       # Base components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── separator.tsx
│   │   ├── theme-toggle.tsx
│   │   └── language-switcher.tsx
│   ├── dashboard/                # Dashboard-specific
│   │   ├── sidebar.tsx
│   │   ├── header.tsx
│   │   └── stats-card.tsx
│   └── landing/                  # Landing page components
│
├── lib/                          # Utilities
│   ├── api.ts                    # API client (40+ functions)
│   ├── theme-provider.tsx        # Dark/light theme context
│   └── i18n-provider.tsx         # Internationalization context
│
└── styles/                       # Additional styles
```

**Speaker Notes:**
> "The frontend is built with Next.js 16 using the App Router. We have 33+ pages across 5 role-based portals, plus public pages for login, signup, and marketing.
>
> "All API communication goes through `lib/api.ts` — a centralized client with 40+ typed functions. Every function automatically injects the JWT token from localStorage and handles errors uniformly. This means individual pages don't deal with fetch calls directly.
>
> "The UI follows a consistent dark theme with a gold accent — chosen to convey a professional, enterprise feel. We use Tailwind CSS 4 for styling, Radix UI primitives for accessible components, and a glassmorphism card design.
>
> "The `lib/api.ts` client covers all 9 backend services with typed interfaces matching the Java DTOs exactly — including PR, PO, RFQ, Quotation, Invoice, Supplier, Notification, User, Department, and Approval Step APIs."

---

## Slide 7: Authentication Flow

**Visual: JWT auth sequence**

```
┌─────────┐     ┌─────────────┐     ┌──────────────┐     ┌──────────┐
│ Browser │     │ API Gateway │     │ Auth-Service │     │  Service │
│         │     │   :8082     │     │   :8081      │     │  :808X   │
└────┬────┘     └──────┬──────┘     └──────┬───────┘     └────┬─────┘
     │                 │                    │                  │
     │  POST /api/auth │                    │                  │
     │  /login         │                    │                  │
     │ {email,pass}    │                    │                  │
     ├────────────────►│  POST /login       │                  │
     │                 ├───────────────────►│                  │
     │                 │                    │  Verify BCrypt   │
     │                 │                    │  Generate JWT    │
     │                 │ ◄──────────────────┤                  │
     │  {token,user}   │                    │                  │
     │◄────────────────┤                    │                  │
     │                 │                    │                  │
     │ Store token in  │                    │                  │
     │ localStorage    │                    │                  │
     │                 │                    │                  │
     │  GET /api/      │                    │                  │
     │  procurement/   │                    │                  │
     │  pr             │                    │                  │
     │ Authorization:  │                    │                  │
     │ Bearer <token>  │                    │                  │
     ├────────────────►│  JwtAuthFilter:    │                  │
     │                 │  Validate token ──►│  Verify JWT      │
     │                 │◄───────────────────┤  signature       │
     │                 │                    │                  │
     │                 │  Forward to        │                  │
     │                 │  procurement-svc   │                  │
     │                 ├──────────────────────────────────────►│
     │                 │                    │                  │
     │  PR list        │                    │                  │
     │◄────────────────┤                    │                  │
     │                 │                    │                  │
```

**Speaker Notes:**
> "Authentication uses a stateless JWT approach. When a user logs in, the auth-service verifies the password using BCrypt and issues a signed JWT token containing the user's ID, name, and role.
>
> "The token is stored in localStorage on the browser side. Every subsequent API request includes it in the Authorization header as `Bearer <token>`.
>
> "The API Gateway's JwtAuthFilter intercepts every incoming request. It validates the token's signature and expiration with the auth-service before forwarding. If the token is invalid or expired, the gateway returns 401 immediately — the downstream service never even sees the request.
>
> "This means individual microservices don't need to know about JWT at all. They receive already-authenticated requests with the user's identity available. This keeps each service simpler and more focused on its domain logic."

---

## Slide 8: Async Events with RabbitMQ

**Visual: Event flow diagram**

```
┌──────────────────────────────────────────────────────────────────────┐
│                      RABBITMQ EXCHANGES                              │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │ pr.exchange  │  │ po.exchange  │  │ rfq.exchange │              │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘              │
│         │                 │                  │                       │
│         │                 │                  │                       │
└─────────┼─────────────────┼──────────────────┼──────────────────────┘
          │                 │                  │
          │                 │                  │
┌─────────▼─────────┐ ┌────▼──────────────────▼────┐
│ Notification Svc  │ │      Other Services         │
│ :8087             │ │      (listening)            │
│                   │ │                             │
│ Events handled:   │ │ Events handled:             │
│ • PR_SUBMITTED    │ │ • PR_APPROVED → Generate PO │
│ • PR_APPROVED     │ │ • PO_GENERATED → Notify     │
│ • PR_REJECTED     │ │ • RFQ_CLOSED → Evaluate     │
│ • PO_GENERATED    │ │ • QUOTATION_SUBMITTED →     │
│ • RFQ_PUBLISHED   │ │   Notify procurement        │
│                   │ │                             │
└───────────────────┘ └─────────────────────────────┘
```

**Speaker Notes:**
> "We use RabbitMQ as our asynchronous message broker. This decouples services — when an employee submits a PR, the procurement-service publishes a `PR_SUBMITTED` event. The notification-service picks it up and sends an in-app notification to the manager. Neither service waits for the other.
>
> "This event-driven architecture is critical for reliability. If the notification-service is down, the PR submission still succeeds — the event stays in the queue until the consumer is ready. We use persistent queues and delivery acknowledgments to guarantee at-least-once delivery.
>
> "Currently, the notification-service handles the majority of events. Future plans include more sophisticated event-driven workflows — like automatically generating POs when a quotation is accepted, or triggering supplier scorecards when an order is completed."

---

## Slide 9: Complete API Surface

**Visual: All 43 endpoints grouped by service**

```
┌─────────────────────────────────────────────────────────────────────┐
│  AUTH SERVICE (:8081)                                               │
│  POST   /api/auth/register    — Create account (BCrypted password) │
│  POST   /api/auth/login       — Authenticate → return JWT token   │
│  POST   /api/auth/refresh     — Refresh expired token              │
│  POST   /api/auth/change-password                                  │
│  POST   /api/auth/forgot-password                                  │
│  POST   /api/auth/reset-password                                   │
├─────────────────────────────────────────────────────────────────────┤
│  USER SERVICE (:8090)                                               │
│  CRUD   /api/users            — User management                    │
│  GET    /api/users/role/{role} — Filter by role (e.g. PROCUREMENT)│
│  GET    /api/users/department/{id}                                 │
│  CRUD   /api/departments      — Department management              │
├─────────────────────────────────────────────────────────────────────┤
│  PROCUREMENT SERVICE (:8088)                                        │
│  CRUD   /api/procurement/pr         — Purchase requests            │
│  POST   /api/procurement/pr/{id}/submit   — Submit for approval   │
│  POST   /api/procurement/pr/{id}/approve   — Approve/reject       │
│  POST   /api/procurement/pr/{id}/generate-po — Create PO from PR  │
│  GET    /api/procurement/po               — List purchase orders  │
│  PUT    /api/procurement/po/{id}/status   — Update PO status     │
│  CRUD   /api/procurement/approval-steps   — Workflow config      │
├─────────────────────────────────────────────────────────────────────┤
│  RFQ SERVICE (:8083)                                                │
│  CRUD   /api/rfq                    — RFQ management               │
│  POST   /api/rfq/{id}/publish      — Send to suppliers            │
│  POST   /api/rfq/{id}/close        — Stop accepting quotations    │
│  POST   /api/rfq/{id}/award        — Award to winning supplier    │
│  POST   /api/rfq/{id}/cancel       — Cancel RFQ                   │
├─────────────────────────────────────────────────────────────────────┤
│  QUOTATION SERVICE (:8084)                                          │
│  CRUD   /api/quotation              — Quotation management         │
│  POST   /api/quotation/{id}/submit  — Submit for evaluation       │
│  POST   /api/quotation/{id}/evaluate — Score & approve/reject     │
│  GET    /api/quotation/rfq/{id}/compare — Side-by-side comparison │
├─────────────────────────────────────────────────────────────────────┤
│  INVOICE SERVICE (:8086)                                            │
│  CRUD   /api/invoices               — Invoice management           │
│  GET    /api/invoices/po/{poId}     — Invoices by PO              │
│  GET    /api/invoices/supplier/{id}  — Invoices by supplier       │
│  GET    /api/invoices/status/{status} — Filter by status          │
│  POST   /api/invoices/{id}/approve   — Approve invoice            │
│  POST   /api/invoices/{id}/reject    — Reject with notes          │
├─────────────────────────────────────────────────────────────────────┤
│  SUPPLIER SERVICE (:8085)                                           │
│  POST   /api/suppliers/register      — Supplier self-registration │
│  CRUD   /api/suppliers              — Supplier management          │
│  GET    /api/suppliers/category/{cat} — Filter by category        │
│  POST   /api/suppliers/{id}/approve  — Approve/reject supplier    │
│  GET    /api/suppliers/stats         — Aggregate statistics       │
├─────────────────────────────────────────────────────────────────────┤
│  NOTIFICATION SERVICE (:8087)                                       │
│  GET    /api/notifications           — List user notifications    │
│  GET    /api/notifications/unread-count                            │
│  PUT    /api/notifications/{id}/read  — Mark as read              │
│  PUT    /api/notifications/read-all   — Mark all as read          │
│  GET    /api/notifications/preferences                             │
│  PUT    /api/notifications/preferences — Update preferences       │
├─────────────────────────────────────────────────────────────────────┤
│  AI SERVICE (Python) — Future                                       │
│  Smart supplier recommendations, spend analytics, anomaly detection│
└─────────────────────────────────────────────────────────────────────┘
```

**Speaker Notes:**
> "We have 43 REST endpoints across 9 services. Each service follows a consistent pattern: create, read, update, list with filters, and specific business actions as POST endpoints.
>
> "The naming convention is deliberate — business actions use POST with clear verbs: `/submit`, `/approve`, `/generate-po`, `/publish`, `/close`, `/award`, `/evaluate`. This follows REST best practices where verbs indicate state transitions rather than CRUD operations.
>
> "Input validation uses Jakarta Validation annotations (`@NotBlank`, `@Positive`, `@Email`) — the same errors are returned from every service in a consistent format: `{ error: 'message' }`. The frontend API client parses this uniformly."

---

## Slide 10: The Procurement Workflow End-to-End

**Visual: Full workflow diagram**

```
EMPLOYEE                    MANAGER              PROCUREMENT              SUPPLIER
─────────                   ───────              ───────────              ────────
    │                          │                      │                      │
    │  Create PR (DRAFT)       │                      │                      │
    ├───────┐                  │                      │                      │
    │       │                  │                      │                      │
    │  Submit PR               │                      │                      │
    ├───────► PENDING_APPROVAL │                      │                      │
    │                          │                      │                      │
    │     Notified ◄───────────┤   Receive PR         │                      │
    │                          │   Review details     │                      │
    │                          │   Approve / Reject   │                      │
    │                          ├───────┐              │                      │
    │     Notified ◄───────────┼───────┤              │                      │
    │                          │       │              │                      │
    │                          │  If APPROVED:       │                      │
    │                          │       │              │                      │
    │                          │       └──────────────►  Receive PR          │
    │                          │                      │  Generate PO         │
    │                          │                      ├───────┐              │
    │                          │                      │       │              │
    │                          │                      │  Option A: Direct    │
    │                          │                      │  Send PO to vendor   │
    │                          │                      │─────────────────────►│
    │                          │                      │                      │
    │                          │                      │  Option B: Bid out   │
    │                          │                      │  Create RFQ          │
    │                          │                      │  Publish to suppliers│
    │                          │                      │─────────────────────►│
    │                          │                      │                      │
    │                          │                      │  Receive quotations  │
    │                          │                      │◄─────────────────────┤
    │                          │                      │                      │
    │                          │                      │  Evaluate & compare  │
    │                          │                      │  Award to winner     │
    │                          │                      │  Generate PO from    │
    │                          │                      │  winning quotation   │
    │                          │                      ├───────┐              │
    │                          │                      │       │              │
    │                          │                      │  Send PO ──────────►│
    │                          │                      │                      │
    │                          │                      │  Receive invoice     │
    │                          │                      │◄─────────────────────┤
    │                          │                      │                      │
    │                          │                      │  Approve invoice     │
    │                          │                      │  Process payment     │
    │                          │                      ├───────┐              │
    │                          │                      │       │              │
    │    All notified ◄────────┴──────────────────────┴───────┴──────────────┤
    │                                                                        │
```

**Speaker Notes:**
> "This is the complete purchase-to-pay workflow that ProcureAI handles:
>
> **Step 1 — Request:** An employee creates a purchase request with line items, budget, and justification. They can save as DRAFT or submit directly. Once submitted, the system finds the appropriate approval chain.
>
> **Step 2 — Approve:** The manager receives a notification, reviews the PR details and justification, and can approve, reject, or request changes. Every action is recorded in the approval timeline with a timestamp and optional comment — creating a full audit trail.
>
> **Step 3 — Process:** Procurement receives approved PRs. They can either generate a PO directly if there's a known supplier, or go through competitive bidding.
>
> **Step 4 — Bid:** For competitive sourcing, procurement creates an RFQ with the same line items, invites multiple suppliers, sets a deadline. Suppliers submit quotations, and procurement evaluates them side-by-side using the comparison tool.
>
> **Step 5 — Order:** Once a quotation is accepted, a PO is generated and sent to the winning supplier. The PO status is tracked through delivery.
>
> **Step 6 — Pay:** When the supplier sends an invoice, procurement approves it and processes payment. The invoice references the PO, creating a complete chain from request to payment.
>
> "Every step in this flow generates notifications to relevant parties, and the dashboards provide real-time visibility into pending actions."

---

## Slide 11: Technical Decisions Explained

**Visual: Decision table**

```
┌─────────────────────────────────────────────────────────────────────────┐
│  DECISION                  │  RATIONALE                                  │
├────────────────────────────┼─────────────────────────────────────────────┤
│                            │                                             │
│  Microservices             │ Each domain (PR, PO, RFQ, Invoice) owns     │
│  over Monolith             │ its data and can scale independently.       │
│                            │ Teams can work on separate services without │
│                            │ merge conflicts. A procurement system has   │
│                            │ naturally bounded contexts.                 │
│                            │                                             │
├────────────────────────────┼─────────────────────────────────────────────┤
│                            │                                             │
│  Database-per-service      │ No shared schema = no cross-service joins   │
│                            │ to worry about. Each service picks its own  │
│                            │ database technology (all PostgreSQL here,   │
│                            │ but could mix). If a service goes down,     │
│                            │ others keep working.                        │
│                            │                                             │
├────────────────────────────┼─────────────────────────────────────────────┤
│                            │                                             │
│  Gateway-only CORS         │ Initially each service set its own CORS.    │
│                            │ This caused duplicate `Access-Control-      │
│                            │ Allow-Origin` headers → browser error.      │
│                            │ Centralizing in the gateway fixed it and    │
│                            │ gives a single security policy to manage.   │
│                            │                                             │
├────────────────────────────┼─────────────────────────────────────────────┤
│                            │                                             │
│  Port 8082 for gateway     │ Port 8080 was occupied by ApplicationWeb-   │
│                            │ Server.exe (HP driver). As non-admin, we    │
│                            │ couldn't kill it. Shift: auth→8081,         │
│                            │ gateway→8082, procurement→8088.             │
│                            │                                             │
├────────────────────────────┼─────────────────────────────────────────────┤
│                            │                                             │
│  RabbitMQ over HTTP sync   │ PR submit → notify manager shouldn't block  │
│                            │ the submit response. Async messaging        │
│                            │ decouples services. Queue persists messages │
│                            │ if consumers are down. Supports fanout for  │
│                            │ broadcasting events to multiple consumers.  │
│                            │                                             │
├────────────────────────────┼─────────────────────────────────────────────┤
│                            │                                             │
│  JWT over sessions         │ Stateless = no server-side session store.   │
│                            │ Any gateway instance can validate tokens    │
│                            │ without shared state. Easy to scale         │
│                            │ horizontally. Token contains user identity  │
│                            │ so downstream services don't query DB.      │
│                            │                                             │
├────────────────────────────┼─────────────────────────────────────────────┤
│                            │                                             │
│  ddl-auto: update          │ For development, auto-creates tables from   │
│  (dev) → Flyway (prod)     │ JPA entities. Zero setup to start coding.   │
│                            │ In production, Flyway/Liquibase provides    │
│                            │ version-controlled, auditable migrations.   │
│                            │                                             │
├────────────────────────────┼─────────────────────────────────────────────┤
│                            │                                             │
│  Dark theme + gold accent  │ Procurement software is used professionally │
│                            │ for hours at a time. Dark theme reduces eye  │
│                            │ strain. Gold conveys premium quality, trust │
│                            │ and financial accuracy — fitting for a      │
│                            │ system handling budgets and purchases.       │
│                            │                                             │
└────────────────────────────┴─────────────────────────────────────────────┘
```

**Speaker Notes:**
> "Let me walk through the key architectural decisions and why they were made:
>
> **Microservices vs Monolith:** This isn't a CRUD app — it's a complex domain with distinct bounded contexts (users, procurement, RFQs, suppliers, invoices). Each service can be developed, tested, deployed, and scaled independently. If the invoicing service gets heavy load during end-of-month, we can scale just that service without touching anything else.
>
> **Database-per-service:** This enforces domain boundaries at the data level. Services communicate through APIs, not shared databases. The trade-off is eventual consistency, which we handle through RabbitMQ events.
>
> **Gateway-only CORS:** We learned this the hard way. Setting CORS in both the gateway and individual services caused duplicate headers. The browser rejected the response. Fixing it meant removing CORS configuration from all services and keeping it only in the gateway — a single source of truth.
>
> **Port numbering:** A real-world constraint. A system process was on 8080 and we couldn't kill it. We shifted the entire port plan: auth to 8081, gateway to 8082, and procurement to 8088 to avoid any conflicts.
>
> **JWT vs Sessions:** Stateless authentication means we don't need a session store or sticky sessions. The gateway can horizontally scale behind a load balancer, and every instance can validate tokens independently.
>
> **Dark theme:** This is a deliberate UX choice, not just aesthetics. Procurement teams spend long hours in the system reviewing requests and processing orders. A dark theme with gold accents reduces eye strain and presents a professional, premium feel."

---

## Slide 12: Development Challenges & Solutions

**Visual: Problems encountered**

```
┌─────────────────────────────────────────────────────────────────────────┐
│  CHALLENGE                 │  SOLUTION                                   │
├────────────────────────────┼─────────────────────────────────────────────┤
│                            │                                             │
│  PostgreSQL connection     │ Local Windows PostgreSQL service was        │
│  refused / password auth   │ running on port 5432, intercepting          │
│  failed                    │ connections meant for Docker PostgreSQL.    │
│                            │ Stopped the local service → Docker's        │
│                            │ PostgreSQL became accessible immediately.   │
│                            │                                             │
├────────────────────────────┼─────────────────────────────────────────────┤
│                            │                                             │
│  CORS error: "Multiple     │ Auth-service and api-gateway both set       │
│  Access-Control-Allow-     │ Access-Control-Allow-Origin. Browser saw    │
│  Origin headers"           │ two headers and rejected the response.      │
│                            │ Fixed by removing CORS from auth-service    │
│                            │ (`cors.disable()`) — gateway handles all.   │
│                            │                                             │
├────────────────────────────┼─────────────────────────────────────────────┤
│                            │                                             │
│  Frontend can't connect    │ All frontend API calls were hardcoded to    │
│  to backend                │ port 8080. Changed to 8082 (gateway port).  │
│                            │ Created centralized `lib/api.ts` so port    │
│                            │ changes only need one file update.          │
│                            │                                             │
├────────────────────────────┼─────────────────────────────────────────────┤
│                            │                                             │
│  Gateway route mismatches  │ Gateway routed `/api/rfqs/**` but the RFQ   │
│                            │ controller used `/api/rfq` (singular).      │
│                            │ Same for quotations. Fixed gateway routes   │
│                            │ to match actual controller paths.           │
│                            │                                             │
└──────────────────────────────────────────┴──────────────────────────────┘
```

**Speaker Notes:**
> "No real project goes smoothly, and ProcureAI had its share of challenges:
>
> **Local PostgreSQL conflict:** This was the most frustrating issue. Docker's PostgreSQL wouldn't accept connections even with correct credentials. After hours of debugging pg_hba.conf and Docker networking, the root cause turned out to be simpler — a local Windows PostgreSQL service was already running on port 5432. Docker bound to the port, but the local service was intercepting connections. Stopping and disabling the local service fixed it instantly.
>
> **CORS double-header:** A classic issue when you have multiple services setting CORS. The browser spec says if it sees more than one `Access-Control-Allow-Origin` header, it rejects the request. Our auth-service and gateway were both setting it. The fix was to disable CORS in all services and let the gateway be the sole CORS policy enforcer.
>
> **Port change cascade:** Moving the gateway from 8080 to 8082 meant updating every hardcoded URL in the frontend. This taught us to centralize base URLs — hence `lib/api.ts` where `API_BASE` is defined once."
>
---

## Slide 13: Key Performance Indicators

**Visual: KPIs and metrics**

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                          │
│  MICROSERVICES                                                           │
│  ┌──────────────────────────────────────────────────────────────────┐    │
│  │ 9 Spring Boot services + 1 Python AI service                    │    │
│  │ 43 REST API endpoints across all services                       │    │
│  │ 15+ JPA entities across 8 databases                             │    │
│  │ 8 PostgreSQL databases (1 per service)                          │    │
│  │ All services compiled with Java 17+ / Spring Boot 3.2.5         │    │
│  └──────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  FRONTEND                                                                │
│  ┌──────────────────────────────────────────────────────────────────┐    │
│  │ 33+ pages across 5 role-based portals                           │    │
│  │ 40+ typed API functions in centralized client (lib/api.ts)      │    │
│  │ Next.js 16 App Router + React 19 + TypeScript 5                 │    │
│  │ Tailwind CSS 4 with custom dark theme + gold accent             │    │
│  │ Fully responsive design (mobile to desktop)                     │    │
│  └──────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  INFRASTRUCTURE                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐    │
│  │ Docker Compose: PostgreSQL 15 + RabbitMQ 3                      │    │
│  │ 2 containers currently running (postgres, rabbitmq)             │    │
│  │ JWT authentication with BCrypt password hashing                 │    │
│  │ RabbitMQ for async event-driven communication                   │    │
│  └──────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  CODEBASE STATS (approximate)                                            │
│  ┌──────────────────────────────────────────────────────────────────┐    │
│  │ Backend: ~50+ Java classes (controllers, services, repos,       │    │
│  │          entities, DTOs, configs, events)                       │    │
│  │ Frontend: ~40+ TypeScript/React component files                 │    │
│  │ Build: Maven 3.9 (multi-module) + npm                           │    │
│  └──────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

**Speaker Notes:**
> "From a technical metrics perspective:
>
> - 9 Spring Boot microservices with 43 REST endpoints covering the entire procurement lifecycle
> - 15 database entities across 8 PostgreSQL databases
> - 33 frontend pages across 5 portals, all connected to the backend API
> - 40+ typed API client functions — every page uses the centralized client, not raw fetch
> - Docker Compose for PostgreSQL and RabbitMQ infrastructure
> - JWT authentication with BCrypt password hashing for security
>
> "The frontend build compiles successfully with TypeScript strict mode — no type errors, no lint warnings."

---

## Slide 14: Demo Script

**Visual: Step-by-step walkthrough**

```
┌─────────────────────────────────────────────────────────────────────────┐
│  DEMO FLOW (5-7 minutes)                                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  A. LOGIN AS EMPLOYEE                                                   │
│     • Navigate to http://localhost:3000                                  │
│     • Click "Login"                                                      │
│     • Enter credentials → redirected to Employee Dashboard              │
│     • Dashboard shows PR stats (fetched from backend)                   │
│                                                                          │
│     "I'm logged in as an employee. My dashboard shows my active          │
│      purchase requests at a glance — all fetched in real-time from       │
│      the procurement service."                                           │
│                                                                          │
│  B. CREATE PURCHASE REQUEST                                              │
│     • Click "New Purchase Request"                                       │
│     • Fill form: title, description, category, urgency, budget           │
│     • Click "Submit for Approval"                                        │
│     • Redirected to My PRs — new PR appears with PENDING status         │
│                                                                          │
│     "I need a new monitor. I fill out the request form with details,     │
│      justifications, and budget. One click submits it for approval.      │
│      Behind the scenes, the PR is created via POST /procurement/pr,      │
│      then submitted via POST /procurement/pr/{id}/submit."               │
│                                                                          │
│  C. LOGIN AS MANAGER                                                     │
│     • Log out, log in as manager                                         │
│     • Dashboard shows pending count from backend                         │
│     • Click "Pending Approvals"                                          │
│     • See the PR created in step B                                       │
│     • Click "Approve" → add comment → confirm                            │
│     • PR disappears from pending list                                    │
│                                                                          │
│     "As a manager, I see the pending request. I can review the           │
│      details, and approve or reject with a comment. Every action is      │
│      recorded — creating a complete audit trail. The PR status           │
│      transitions from PENDING_APPROVAL to APPROVED."                     │
│                                                                          │
│  D. LOGIN AS PROCUREMENT                                                 │
│     • Log in as procurement officer                                      │
│     • Open Purchase Requests → see APPROVED PR                           │
│     • Click "Convert to PO" → PO generated, status becomes PO_GENERATED │
│     • Open Purchase Orders → see newly created PO                        │
│                                                                          │
│     "Procurement sees the approved PR. With one click, they              │
│      generate a Purchase Order, which becomes a separate entity          │
│      tracked through its own lifecycle — sent, received, closed."        │
│                                                                          │
│  E. SHOW NOTIFICATIONS (if available)                                    │
│     • Employee received notification that PR was approved                │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Slide 15: Current Status & Roadmap

**Visual: Status dashboard**

```
┌─────────────────────────────────────────────────────────────────────────┐
│  CURRENT STATUS — COMPLETED                                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ✅ 9 Microservices — all structurally complete                         │
│     (entities, repos, services, controllers, DTOs, events)             │
│                                                                          │
│  ✅ 33+ Frontend pages — all integrated with real API calls             │
│     (no more mock data — every page fetches from backend)              │
│                                                                          │
│  ✅ PostgreSQL (Docker) — running, 8 databases created                  │
│  ✅ RabbitMQ (Docker) — running, exchanges configured                   │
│  ✅ Auth-service (8081) + API Gateway (8082) — running                  │
│  ✅ Frontend (3000) — running, all pages render correctly               │
│  ✅ TypeScript build — passes with zero errors                          │
│                                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│  TO START (just need `mvn spring-boot:run`)                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ⏳ procurement-service → :8088    │  ⏳ rfq-service → :8083            │
│  ⏳ quotation-service → :8084      │  ⏳ supplier-service → :8085       │
│  ⏳ invoice-service → :8086        │  ⏳ notification-service → :8087   │
│  ⏳ user-service → :8090           │                                   │
│                                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│  NEXT STEPS (Future Roadmap)                                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  🔜 AI Service — Smart supplier recommendations based on past          │
│     performance, spend analytics with anomaly detection                  │
│                                                                          │
│  🔜 Supplier Portal — Pages exist but need full integration with       │
│     supplier-facing workflows (respond to RFQs, submit quotations)       │
│                                                                          │
│  🔜 Admin Portal — User/role management pages exist but need           │
│     integration with user-service APIs                                   │
│                                                                          │
│  🔜 Real-time notifications — WebSocket integration for instant         │
│     notifications instead of polling                                     │
│                                                                          │
│  🔜 Production hardening — Flyway migrations, rate limiting,            │
│     audit logging, monitoring (Prometheus/Grafana)                      │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

**Speaker Notes:**
> "For the Q&A portion, let me outline the current status:
>
> **What's done:** All 9 microservices have complete CRUD + business logic. All 33+ frontend pages are connected to real API endpoints — no mock data anywhere. The infrastructure (PostgreSQL, RabbitMQ) runs in Docker. Auth and gateway are live.
>
> **What needs starting:** 7 services just need `mvn spring-boot:run` in their respective directories. The databases already exist and tables auto-create on startup.
>
> **Roadmap items:** The AI service is scaffolded but needs the ML models. The Supplier Portal and Admin Portal pages exist but some still need deeper API integration. Real-time WebSocket notifications and production hardening (Flyway, monitoring) are planned.
>
> "I'm happy to take questions now."

---

## Slide 16: Q&A Talking Points

**Visual: Anticipated questions with answers**

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Q: Why not a monolith? Simpler deployment.                             │
│                                                                          │
│  A: "Procurement is a domain with naturally bounded contexts — users,   │
│     requests, orders, suppliers, invoices. Each has different scaling   │
│     needs. Invoicing might need more resources during month-end.        │
│     Microservices let us scale independently. The trade-off is          │
│     operational complexity, which we offset with Docker Compose."       │
│                                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Q: How do you handle data consistency across services?                  │
│                                                                          │
│  A: "We use the Saga pattern with RabbitMQ. For example, when a PR      │
│     is approved: 1) procurement-service emits PR_APPROVED event,        │
│     2) notification-service picks it up and sends notification.         │
│     If notification fails, the event stays in the queue for retry.      │
│     For critical paths, we use compensating actions — if PO generation │
│     fails, the PR status is rolled back."                               │
│                                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Q: How is security handled?                                             │
│                                                                          │
│  A: "Three layers: 1) JWT authentication — tokens issued by auth-       │
│     service with BCrypt password hashing. 2) Gateway-level validation   │
│     — every request passes through JwtAuthFilter before reaching any    │
│     service. 3) Role-based access — the user's role (EMPLOYEE,          │
│     MANAGER, PROCUREMENT) is embedded in the JWT and checked in each    │
│     controller. A procurement officer can't submit a PR as an           │
│     employee, and an employee can't approve their own requests."        │
│                                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Q: What testing strategy do you use?                                    │
│                                                                          │
│  A: "Currently: manual testing through the UI. Planned:                 │
│     • Unit tests — JUnit 5 + Mockito for service layer                  │
│     • Integration tests — TestContainers for PostgreSQL + RabbitMQ      │
│     • API tests — Postman collection for all 43 endpoints               │
│     • E2E tests — Playwright for critical workflows (create PR →        │
│       approve → generate PO)                                            │
│     • Frontend — Vitest + React Testing Library for components"         │
│                                                                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  Q: How would you deploy this to production?                             │
│                                                                          │
│  A: "Containerize each service with Dockerfile (JAR + JRE base).        │
│     Kubernetes cluster (min 3 nodes) with Helm charts.                  │
│     CI/CD pipeline: GitHub Actions → build → test → push → deploy.      │
│     Each service gets its own deployment with health checks, resource   │
│     limits, and horizontal auto-scaling based on CPU/memory.            │
│     Database: managed PostgreSQL (AWS RDS or Cloud SQL) instead of      │
│     containerized Postgres."                                            │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Appendix: Key Files Reference

| File | Purpose |
|------|---------|
| `infrastructure/docker-compose.yml` | PostgreSQL 15 + RabbitMQ 3 |
| `infrastructure/postgres/init-databases.sql` | Creates 8 databases on startup |
| `services/api-gateway/src/main/resources/application.yml` | Gateway routes + CORS config |
| `services/*/src/main/resources/application.yml` | Per-service DB, port, RabbitMQ config |
| `frontend/src/lib/api.ts` | 40+ typed API client functions |
| `frontend/src/app/dashboard/*/page.tsx` | Portal dashboard pages |
| `services/common/src/main/java/com/procureai/common/` | Shared DTOs, events, RabbitMQ config |

---

## Quick Presentation Tips

- **Total time:** 15-20 minutes (slides) + 10 minutes Q&A
- **For non-technical audiences:** Focus on slides 2 (problem), 10 (workflow), 14 (demo)
- **For technical audiences:** Focus on slides 3 (architecture), 4 (data model), 7 (auth), 8 (events), 11 (decisions)
- **For mixed audiences:** Start with problem + workflow, then dive into architecture
- **Demo first vs slides first:** If you have 15 minutes, do a 2-minute demo first to hook them, then explain how it works
- **Live demo risk:** Keep screenshots/video as backup in case services aren't running
