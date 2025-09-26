## 1. Overview
**Purpose:**  
Build a modern dashboard—functionally similar to https://www.semsportal.com/—to visualize solar energy production and consumption.  
The application will periodically fetch live solar data from the SEMS API and store only the essential, current values in the PostgreSQL database.  
Historical timelines and trend graphs will be derived from the database history itself, keeping storage lean while enabling rich analytics and visual insights.

**Target Audience:**  
Owners of solar installations and energy-conscious households who want a simple, responsive, self-hosted monitoring platform.

**Key Features (high level):**
- Real-time display of solar production and consumption data  
- Automatic retrieval of the latest readings from the SEMS API  
- Historical charts and timelines generated from stored database history

---

## 2. Tech Stack
**Frontend:**
- Framework/library: **React.js 18**
- Build/Tooling: **Vite**
- Routing: **React Router v6+**
- Styling: **Sass (SCSS)**
- Component/UI library: **shadcn/ui**
- State management: Context API / Redux Toolkit / Zustand
- **No testing setup for now**

**Backend:**
- Language & Runtime: **Java 17+**
- Framework: **Spring Framework 6**
- Application Bootstrapping: **Spring Boot 3**
- API style: **REST** (Spring Web / MVC)
- Authentication & Authorization: **Spring Security** (JWT or OAuth2)
- Dependency Injection: Built-in via Spring
- Validation: **Jakarta Bean Validation / Hibernate Validator**
- **No testing setup for now**

**Database:**
- Type: **PostgreSQL 15+**
- ORM/Database access: **Spring Data JPA** (Hibernate as the default provider)
- Database migrations: **Flyway** (for schema versioning and incremental migrations)
- Connection Pooling: **HikariCP** (default in Spring Boot)
- Migration files: stored in `src/main/resources/db/migration`  
  (e.g. `V1__init.sql`, `V2__add_user_table.sql`)

**Infrastructure & Deployment:**
- Build tool: **Maven** or Gradle
- Packaging: **Docker containers**
- Hosting: **Google Cloud Run** (one service per container: `backend`, optional `frontend`)
- Container Registry: **Artifact Registry** (gcr.io / europe-west*)
- CI/CD: **GitHub Actions** or **Cloud Build**
- Environment & secrets: Cloud Run environment variables + **Secret Manager**
- Networking: HTTPS via Cloud Run-managed TLS; custom domain optional
- Observability: Cloud Logging & Cloud Monitoring
- Scalability: Cloud Run min/max instances; set concurrency (e.g. 80)

---

## 3. Functional Requirements
### 3.1 User Accounts
- Sign up / log in (email/password or OAuth)  
- Password reset  
- Profile management

### 3.2 Core App Logic
- Connect to SEMS API to pull the latest solar production and consumption data  
- Persist only essential current values to the database  
- Generate historical timelines and graphs by querying stored history  
- Display live dashboards and key metrics

### 3.3 Admin & Roles
- Roles (e.g. user, admin)  
- Permissions per role

---

## 4. Data Models

### 1️⃣ Power Station & Core Tables
| Table | Key | Purpose | Important Columns (examples, not exhaustive) |
|------|-----|--------|----------------------------------------------|
| powerstation | powerstation_id (PK) | One PV plant / site | stationname, address, latitude, longitude, capacity_kWp, battery_capacity_kWh, powerstation_type, status, turnon_time, create_time, org_code, org_name, is_stored, is_powerflow, charts_type, time_span |
| owner | owner_id (PK) | Optional: link if owner info provided | name, phone, email |
| kpi_daily | kpi_id (PK) | Snapshot of daily KPIs | powerstation_id (FK), kpi_date, month_generation_kWh, pac_W, power_kWh, total_power_kWh, day_income_EUR, total_income_EUR, yield_rate |
| hjgx_environment | env_id (PK) | Environmental savings | powerstation_id (FK), co2_kg, tree_equivalent, coal_kg |
| smuggle_info | smuggle_id (PK) | Status flags | powerstation_id (FK), is_all_smuggle, is_smuggle, description_text |

### 2️⃣ Weather Forecast
| Table | Key | Columns |
|------|-----|--------|
| weather_forecast | forecast_id (PK) | powerstation_id (FK), forecast_date, cond_code_d, cond_code_n, cond_txt_d, cond_txt_n, hum, pcpn, pop, pres, tmp_max, tmp_min, uv_index, vis, wind_deg, wind_dir, wind_sc, wind_spd |

_One row per day per site._

### 3️⃣ Equipment & Inverters
| Table | Key | Columns |
|------|-----|--------|
| equipment | equipment_id (PK) | powerstation_id (FK), type, title, status, model, brand, relation_id, sn, capacity_kW, is_stored, soc_percent, eday_kWh |
| inverter | sn (PK) | powerstation_id (FK), relation_id, name, type, capacity_kW, turnon_time, firmware_version, status, temperature_C, pac_W, etotal_kWh, eday_kWh, emonth_kWh, soc_percent, soh_percent, check_code |
| inverter_measurement | meas_id (PK) | sn (FK), timestamp, output_power_W, output_current_A, output_voltage_V (store as JSON or split per phase), dc_input1_VA, dc_input2_VA, battery_voltage_V, battery_current_A, battery_power_W, work_mode, grid_conn_status, backup_outputs (phases), meter_phase_R/S/T_W, etc. |
| battery_detail | battery_detail_id (PK) | inverter_sn (FK), timestamp, soc_percent, soh_percent, bms_status, bms_warning, charge_current_limit_A, discharge_current_limit_A, temperature_C, pbattery_W, vbattery_V, ibattery_A |

Nested measurement points (like “Vpv1”, “Iac1” …) can either be:
- a lookup table (**measurement_point_def**) describing each point (target_index, target_name, unit),
- and a fact table (**measurement_point_value**) with (meas_id, point_index, value).

### 4️⃣ Powerflow & Energy Statistics
| Table | Key | Columns |
|------|-----|--------|
| powerflow_snapshot | powerflow_id (PK) | powerstation_id (FK), timestamp, pv_W, pv_status, battery_W, battery_status, load_W, load_status, grid_W, grid_status, genset_W, microgrid_W, soc_percent |
| energy_statistics_daily | stat_id (PK) | powerstation_id (FK), stat_date, contributing_rate, self_use_rate, sum_kWh, buy_kWh, buy_percent, sell_kWh, sell_percent, self_use_of_pv_kWh, consumption_of_load_kWh, charge_kWh, discharge_kWh, genset_gen_kWh, microgrid_gen_kWh |
| energy_statistics_totals | totals_id (PK) | powerstation_id (FK), same columns as above but cumulative |

### 5️⃣ Auxiliary Tables
| Table | Key | Columns |
|------|-----|--------|
| homkit_status | homkit_id | powerstation_id (FK), homekit_limit, sn |
| soc_status | soc_id | powerstation_id (FK), power_percent, status |
| environmental_item | env_item_id | powerstation_id (FK), name, value (if “environmental” array is later populated) |

### 6️⃣ Relationships (High-Level ERD)
```
owner 1─1 powerstation ─< kpi_daily
                       ├─< weather_forecast
                       ├─< equipment ─1─1 inverter ─< inverter_measurement ─< measurement_point_value
                       ├─< powerflow_snapshot
                       ├─< energy_statistics_daily
                       └─< energy_statistics_totals
```

**Implementation Notes**
- Datatypes: use **TIMESTAMP WITH TIME ZONE** for all time fields; **DECIMAL(10,2)** for kWh/W, etc.  
- Indexes: time-based indexes on measurement tables for fast time-series queries.  
- Scalability: store high-frequency inverter data in a time-series DB (e.g., **TimescaleDB**) if very frequent.  
- Extensibility: new inverter models or new measurement points just add rows to **measurement_point_def**.

---

## 5. External Integrations: SEMS API (EU region)
Base URL: `https://eu.semsportal.com/api/` (v2 endpoints)

### 5.1 Authentication (CrossLogin → token JSON)
- **Endpoint:** `POST https://eu.semsportal.com/api/v2/Common/CrossLogin`  
- **Headers:**
  - `Content-Type: application/json`
  - `Token: {"version":"v2.1.0","client":"ios","language":"en"}`
- **Body:** `{"account":"<SEMS_ACCOUNT>","pwd":"<SEMS_PASSWORD>"}`  
- **Result:** Returns `data.uid`, `data.timestamp`, `data.token` and metadata (`client`/`version`/`language`).  
- **Token JSON to reuse on subsequent calls:**
  ```json
  {"uid":"<UID>","timestamp":<TIMESTAMP_MS>,"token":"<TOKEN>","client":"ios","version":"v2.1.0","ver":"v2.1.0","language":"en"}
  ```

**Security & storage**
- Never hardcode credentials. Source `SEMS_ACCOUNT` and `SEMS_PASSWORD` from **Secret Manager**; inject as env vars.  
- Cache token JSON in memory with a short TTL; refresh via CrossLogin when expired or on 401/403.  
- Persist only if necessary; prefer in-memory cache on each Cloud Run instance.

### 5.2 Read PV Output for a Power Station
- **Endpoint:** `POST https://eu.semsportal.com/api/v2/PowerStation/GetMonitorDetailByPowerstationId`
- **Headers:**
  - `Content-Type: application/json`
  - `token: <TOKEN_JSON_STRING>`  <!-- lowercase header name; value is stringified token JSON -->
- **Body:** `{"powerStationId":"<SEMS_STATION_ID>"}`

**Station identification**
- `SEMS_STATION_ID` is provided via env var (example: `64703347-271b-446f-9468-0cc1e8f1df30`).

### 5.3 Minimal field mapping to internal schema (store only basics)
From `GetMonitorDetailByPowerstationId` response, extract and persist only essential current values:
- **powerflow_snapshot:** `timestamp(now)`, `pv_W`, `battery_W` (sign indicates charge/discharge if available), `load_W`, `grid_W`, `soc_percent`, status fields where provided.
- **inverter:** for each inverter/sn present, update `pac_W`, `etotal_kWh`, `eday_kWh`, `temperature_C`, `status`, `soc_percent`/`soh_percent` if present.
- **kpi_daily:** day-level totals like `power_kWh` (or `production_kWh`), `total_power_kWh`, `pac_W`, `yield_rate`, and income fields if available.
- **powerstation:** `stationname`, `capacity_kWp`, `battery_capacity_kWh`, `status`; update if changed.

Historical timelines are derived from accumulated rows in `powerflow_snapshot`, `inverter_measurement`, and `kpi_daily`; no separate time-series kept beyond what is needed.

### 5.4 Scheduling, rate limits, and resilience
- Use Spring `@Scheduled` (e.g., every **1–5 minutes**) to refresh current values.  
- On **401/403** from SEMS API: retry once after CrossLogin refresh.  
- Implement **exponential backoff + jitter** on non-2xx responses.  
- Log API errors and store **last successful sync timestamp** per powerstation.

### 5.5 Configuration (env vars)
- `SEMS_BASE_URL=https://eu.semsportal.com/api/v2`
- `SEMS_ACCOUNT` (Secret)
- `SEMS_PASSWORD` (Secret)
- `SEMS_STATION_ID=64703347-271b-446f-9468-0cc1e8f1df30`
- `SEMS_CLIENT=ios`
- `SEMS_VERSION=v2.1.0`
- `SEMS_LANGUAGE=en`

---

## 6. API Design (app’s own backend)
**Example REST Endpoints**
| Method | Path | Description | Auth |
|-------|------|-------------|------|
| POST  | /api/sems/sync            | Trigger immediate SEMS pull and persist | admin |
| GET   | /api/measurements/current | Get latest solar data (joined view)     | user  |
| GET   | /api/measurements/history | Get historical timeline (paged)         | user  |
| GET   | /api/powerstation/:id     | Power station metadata                  | user  |

---

## 7. UI / UX Notes
- Responsive layout targeting desktop, tablet, and mobile  
- Navigation handled by **React Router v6** (nested routes and lazy loading)  
- Color palette and typography guidelines  
- **shadcn/ui** component usage (charts, cards, dialogs)  
- Sass architecture (e.g., **7–1 pattern**) for maintainability  
- Accessibility considerations (**WCAG 2.1 AA**)

---

## 8. Security & Compliance
- Data privacy requirements (e.g., **GDPR**)  
- Input validation & sanitization  
- Rate limiting / throttling  
- Secure handling of API credentials and tokens (**Secret Manager**, short-lived in-memory token cache)  
- **HTTPS** everywhere

---

## 9. Roadmap / Milestones
| Milestone | Tasks | Deadline |
|-----------|-------|---------|
| MVP       | SEMS API auth + monitor detail ingestion + live dashboard | YYYY-MM-DD |
| v1.0      | Weather forecast, inverter measurements, admin controls   | … |

---

## 10. Containerization Details

### Backend Dockerfile (Spring Boot)
```dockerfile
# backend/Dockerfile
FROM eclipse-temurin:17-jdk AS build
WORKDIR /app
COPY . .
# For Maven:
RUN ./mvnw -q -DskipTests package
# Or for Gradle:
# RUN ./gradlew -q bootJar

FROM eclipse-temurin:17-jre
WORKDIR /app
# Maven output:
COPY --from=build /app/target/*-SNAPSHOT.jar app.jar
# Gradle output (alternative):
# COPY --from=build /app/build/libs/*-SNAPSHOT.jar app.jar
ENV JAVA_OPTS="-XX:MaxRAMPercentage=75.0"
EXPOSE 8080
CMD ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
```

### Frontend Dockerfile (Vite build, static serve)
```dockerfile
# frontend/Dockerfile
FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Serve static with nginx
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
# Optional: custom nginx.conf for SPA history fallback
# COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Google Cloud Run Deployment Notes
- **Build & push:**
  - `gcloud builds submit --tag REGION-docker.pkg.dev/PROJECT/REPO/backend:latest backend/`
  - `gcloud builds submit --tag REGION-docker.pkg.dev/PROJECT/REPO/frontend:latest frontend/`
- **Deploy:**
  - `gcloud run deploy backend --image REGION-docker.pkg.dev/PROJECT/REPO/backend:latest --region REGION --platform managed --allow-unauthenticated --set-env-vars "SPRING_PROFILES_ACTIVE=prod,SEMS_BASE_URL=https://eu.semsportal.com/api/v2,SEMS_ACCOUNT=secret://...,SEMS_PASSWORD=secret://...,SEMS_STATION_ID=64703347-271b-446f-9468-0cc1e8f1df30" --min-instances 0 --max-instances 10 --concurrency 80`
  - `gcloud run deploy frontend --image REGION-docker.pkg.dev/PROJECT/REPO/frontend:latest --region REGION --platform managed --allow-unauthenticated --min-instances 0 --max-instances 5`
- **DB connectivity:**
  - Prefer **Cloud SQL for PostgreSQL** + **Cloud SQL Connector/JDBC** (no sidecar needed).
- **SPA routing:**
  - If serving React directly from Cloud Run (nginx), ensure **history fallback** to `/index.html`.
  - Alternatively, host static files on **Cloud Storage + Cloud CDN** and keep API on Cloud Run.
