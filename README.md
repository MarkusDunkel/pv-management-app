# PV Management Platform

A full-stack application for monitoring photovoltaic (PV) production, battery behaviour, and consumption. It ingests live data from the SEMS API, persists the latest metrics in PostgreSQL, and exposes a modern React dashboard for real-time and historical insights.

## Project Structure
```
├── backend/                # Spring Boot 3 service (REST API + SEMS ingestion)
│   ├── src/main/java
│   └── src/main/resources
├── frontend/               # Vite + React 18 dashboard with SCSS & shadcn/ui
├── infrastructure/         # Deployment notes (containerised stack)
├── docker-compose.yml      # Local dev stack (Postgres + backend + frontend)
└── app-spec.md             # Original product specification
```

## Tech Stack
- **Backend:** Java 17, Spring Boot 3, Spring Security (JWT), Spring Data JPA, Flyway, WebClient, Resilience4j
- **Frontend:** React 18, Vite, TypeScript, React Router v6, Zustand, shadcn/ui, TailwindCSS, Sass (7–1 pattern)
- **Database:** PostgreSQL 15+, Flyway migrations
- **Containerization:** Dockerfiles for backend and frontend; Docker Compose for local dev

## Getting Started

### Prerequisites
- Java 17+
- Maven 3.9+
- Node.js 20+
- Docker (for containerized workflows)

### Environment Variables
Copy `.env.example` to `.env` and update the secrets:

```
cp .env.example .env
```

| Variable | Description |
|----------|-------------|
| `JWT_SECRET` | Signing secret for access tokens |
| `SEMS_ACCOUNT` / `SEMS_PASSWORD` | Credentials for the SEMS API |
| `SEMS_STATION_ID` | UUID of the monitored station |
| `DB_NAME` / `DB_USERNAME` / `DB_PASSWORD` | Credentials for the bundled Postgres container |
| `DB_PORT` | Host port exposed for Postgres (defaults to `5432`) |
| `APP_ADMIN_EMAIL` / `APP_ADMIN_PASSWORD` | Optional bootstrap admin account |

> The backend reads these via Spring's relaxed binding (e.g. `APP_ADMIN_EMAIL` → `app.admin.email`).

### Run with Docker Compose

```
docker compose up --build
```

Services exposed:
- Backend API: http://localhost:8080
- Frontend UI: http://localhost:5173
- PostgreSQL: localhost:<DB_PORT> (default user/password `pv_app` / `pv_app`)

### Run Backend Locally

```
cd backend
mvn spring-boot:run
```

The backend expects PostgreSQL credentials via environment variables (defaults target `localhost:5432/pv_management`). Flyway migrations (`V1__init_schema.sql`) initialise all tables and seed `ROLE_USER`/`ROLE_ADMIN`.

### Run Frontend Locally

```
cd frontend
npm install
npm run dev
```

The Vite dev server proxies `/api` calls to `http://localhost:8080`.

## Key Backend Features
- **JWT Authentication:** `/api/auth/register`, `/api/auth/login`, `/api/auth/me`
- **User Profile:** `/api/users/me` (PATCH) for updating display names
- **SEMS Sync:** Scheduled via `SemSyncScheduler` (default every 180 s). Manual trigger at `/api/sems/sync` (admin only).
- **Data Endpoints:**
  - `/api/measurements/current/{powerStationId}`
  - `/api/measurements/history/{powerStationId}`
  - `/api/powerstations/{id}` and `/dashboard` summary
- **Flyway migrations:** `src/main/resources/db/migration`

## Frontend Highlights
- Responsive layout with Sidebar navigation and sticky top bar
- Zustand stores for authentication state and live dashboard metrics
- SCSS 7–1 architecture alongside Tailwind-powered shadcn/ui components
- Pages: Login, Register, Dashboard, History (range picker), Settings

## Testing & Quality
- No automated tests yet (per spec). Add JUnit/Spring Test for backend and Vitest/react-testing-library for frontend when expanding.
- `Resilience4j` retry protects SEMS sync; failures recorded in `sem_sync_log`.

## Deployment
- Container images built via Dockerfiles in `backend/` and `frontend/`
- Self-hosted deployment notes (Docker Compose + Postgres container) in `infrastructure/postgres-compose.md`
- Provide secrets to containers via environment variables or your orchestration platform (e.g. Docker secrets, Kubernetes).

## Next Steps
1. Integrate actual charting (e.g. Recharts) for powerflow and KPI trends.
2. Add e-mail verification and password reset flows.
3. Implement automated tests and CI/CD pipeline (GitHub Actions + Workload Identity).
