# Docker Compose Deployment Guide

This guide walks through deploying the PV Management stack — backend API, frontend UI, and a PostgreSQL 15 database — on any Linux host using Docker Compose. It replaces the previous Cloud Run + Cloud SQL approach with a self-managed Postgres container.

## 1. Prerequisites
- x86_64 host (VM or bare metal) running a recent Linux distribution
- Docker Engine 24+ and the Docker Compose plugin
- Access to the project repository (SSH or Git)
- Ability to open firewall ports for HTTP(S) and PostgreSQL (if remote access is required)

## 2. Configure Environment Variables
1. Copy the sample environment file and update secrets:
   ```bash
   cp .env.example .env
   ```
2. Fill out the following entries:
   - `JWT_SECRET`, `SEMS_*` credentials, and optional admin bootstrap values
   - `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD` (used by both the Postgres and backend containers)
   - `DB_PORT` (host-side exposure for PostgreSQL; defaults to `5432`)
3. Store the completed `.env` file securely on the host. Docker Compose will automatically load it.

## 3. Launch the Stack
```bash
docker compose up -d --build
```

- The `postgres` service exposes the database on `${DB_PORT:-5432}` and persists data in the named volume `postgres-data`.
- The backend runs with the `local` Spring profile and connects to Postgres via the internal Docker network.
- The frontend is served by nginx on port `5173` (configurable inside `docker-compose.yml`).

Validate that everything is healthy:
```bash
docker compose ps
docker compose logs backend --tail 50
```

## 4. Database Management
- Shell access:
  ```bash
  docker compose exec postgres psql -U "$DB_USERNAME" "$DB_NAME"
  ```
- Backups:
  ```bash
  docker compose exec postgres pg_dump -U "$DB_USERNAME" "$DB_NAME" > backup.sql
  ```
- Data persists in the Docker volume `postgres-data`. Snapshot or copy this volume as part of your backup strategy.

## 5. Upgrades & Rollbacks
1. Pull the latest code (`git pull`) or images (`docker compose pull`).
2. Rebuild and restart containers:
   ```bash
   docker compose up -d --build
   ```
3. Roll back by checking out the previous Git commit or using `docker compose up` with the last known-good images.

## 6. Hardening Checklist
- Restrict direct access to the Postgres port; allow only trusted networks or tunnel over SSH/VPN.
- Configure HTTPS termination (e.g., Caddy, Traefik, or Nginx reverse proxy) in front of the frontend container.
- Rotate the credentials stored in `.env` periodically and prefer Docker secrets or a secrets manager where available.
- Enable OS-level monitoring (e.g., systemd service health checks, fail2ban, unattended upgrades).

## 7. Monitoring & Troubleshooting
- View logs with `docker compose logs -f backend` or `frontend`.
- Check container health status via `docker inspect --format '{{json .State.Health}}' pv-management-app-postgres-1`.
- Flyway migrations run automatically at backend startup; review Flyway history with:
  ```bash
  docker compose exec postgres psql -U "$DB_USERNAME" "$DB_NAME" -c 'SELECT * FROM flyway_schema_history;'
  ```

With this setup you control the database lifecycle directly while keeping the rest of the stack identical to development.
