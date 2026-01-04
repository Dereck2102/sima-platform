# SIMA: Integrated Asset Management System

**Institution:** Universidad Central del Ecuador (UCE)  
**Author:** Dereck Stevens Amacoria Chávez  
**Supervisor:** Ing. Juan Guevara  
**Version:** 2.0.0

---

## 📋 Project Overview
SIMA (Sistema Integrado de Manejo de Activos) is a **SaaS Multi-Tenant B2B platform** designed to modernize the management, auditing, and traceability of fixed assets in public institutions. It replaces legacy monolithic systems with a distributed Event-Driven Architecture (EDA).

### 🚀 Key Features
* **Multi-Tenancy:** Logical data isolation for multiple faculties/organizations.
* **Event-Driven:** Asynchronous communication using **Apache Kafka**.
* **Polyglot Persistence:** PostgreSQL (Relational), MongoDB (Audit Logs), Redis (Cache).
* **Real-Time Tracking:** Geolocation services via **Go** microservice.
* **Financial Analytics:** Depreciation calculation engine via **Python**.

---

## 🏗 Architecture
The system follows a **Hexagonal Architecture** (Ports & Adapters) distributed across **12 Microservices**:

| Service | Type | Tech Stack | Responsibility |
| :--- | :--- | :--- | :--- |
| **api-gateway** | Entry Point | NestJS | Reverse Proxy, Rate Limiting, SSL |
| **auth-service** | Core | NestJS | OAuth2/OIDC, JWT Management |
| **tenant-service** | Core | NestJS | Organization & Data Isolation |
| **inventory-service** | **Domain Core** | NestJS | Asset Lifecycle (CRUD, Status) |
| **search-service** | Support | NestJS | Optimized Search Engine |
| **audit-service** | Support | NestJS + Mongo | Immutable Ledger & Logs |
| **report-service** | Support | NestJS | PDF/Excel Generation |
| **notification-service** | Support | NestJS | SMTP Email & Push Alerts |
| **storage-service** | Infrastructure | NestJS + MinIO | S3-compatible File Storage |
| **mobile-bff** | BFF | NestJS | Mobile App Optimization |
| **geo-tracker** | Worker | **Go (Golang)** | High-concurrency Location Tracking |
| **analytics-engine** | Worker | **Python** | Financial Math & Predictions |

---

## 🛠 Prerequisites
* **Node.js:** v18+
* **Docker & Docker Compose:** v24+
* **Pnpm:** v9+

## ⚡ Quick Start (Local Development)

### 1. Start Infrastructure
Launch Databases (Postgres, Mongo, Redis) and Message Brokers (Kafka, RabbitMQ).
```bash
docker compose up -d
```

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Run Inventory Service (Example)
```bash
npx nx serve inventory-service
```

---

## 🧪 Testing Strategy
* **Unit Tests:** Jest (Backend).
* **Chaos Testing:** Custom bash scripts to simulate container failures.
* **Load Testing:** Python scripts for traffic spiking.

## 📄 License
Private Repository. Property of Universidad Central del Ecuador.
