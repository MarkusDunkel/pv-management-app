# Google Cloud Run Deployment Guide

This document captures the essentials for deploying the PV Management stack to Google Cloud Run as described in the product specification.

## Prerequisites
- Google Cloud project with billing enabled
- `gcloud` CLI v430+
- Artifact Registry repository for container images
- Cloud SQL for PostgreSQL instance (15+)
- Secret Manager entries for SEMS credentials and JWT secret

## 1. Build & Push Images
```bash
# Backend
cd backend
gcloud builds submit --tag REGION-docker.pkg.dev/PROJECT_ID/REPO/backend:latest .

# Frontend
cd ../frontend
gcloud builds submit --tag REGION-docker.pkg.dev/PROJECT_ID/REPO/frontend:latest .
```

## 2. Provision Infrastructure
1. Create a Cloud SQL instance (`db-custom-1-3840` or similar).
2. Create a database `pv_management` and a user `pv_app` with a strong password.
3. Store sensitive configuration in Secret Manager:
   - `sems-account`
   - `sems-password`
   - `jwt-secret`

## 3. Deploy Cloud Run Services
```bash
# Backend
gcloud run deploy pv-backend \
  --image REGION-docker.pkg.dev/PROJECT_ID/REPO/backend:latest \
  --region REGION \
  --platform managed \
  --allow-unauthenticated \
  --add-cloudsql-instances PROJECT_ID:REGION:INSTANCE_ID \
  --set-env-vars "SPRING_PROFILES_ACTIVE=prod" \
  --set-env-vars "DB_HOST=/cloudsql/PROJECT_ID:REGION:INSTANCE_ID" \
  --set-env-vars "DB_NAME=pv_management,DB_USERNAME=pv_app" \
  --set-env-vars "SEMS_BASE_URL=https://eu.semsportal.com/api/v2" \
  --set-secrets "DB_PASSWORD=db-password:latest" \
  --set-secrets "SEMS_ACCOUNT=sems-account:latest" \
  --set-secrets "SEMS_PASSWORD=sems-password:latest" \
  --set-secrets "JWT_SECRET=jwt-secret:latest" \
  --set-env-vars "SEMS_STATION_ID=YOUR-STATION-ID" \
  --min-instances 0 --max-instances 10 --concurrency 80

# Frontend
gcloud run deploy pv-frontend \
  --image REGION-docker.pkg.dev/PROJECT_ID/REPO/frontend:latest \
  --region REGION \
  --platform managed \
  --allow-unauthenticated \
  --set-env-vars "VITE_API_BASE_URL=https://<backend-url>" \
  --min-instances 0 --max-instances 5
```

> **Note**: When running on Cloud Run, configure a Serverless VPC Access connector if the backend must reach the Cloud SQL instance via private IP.

## 4. Observability
- Enable Cloud Logging and Monitoring for both services.
- Configure alerting on HTTP 5xx rate and `SemSyncScheduler` failure metrics.

## 5. IAM & Security
- Limit Cloud Run invoker roles to the frontend and API Gateway if applicable.
- Use Workload Identity Federation for GitHub Actions to avoid long-lived service account keys.
- Lock down Cloud SQL user to only the backend service account.

## 6. CI/CD Outline
- GitHub Actions pipeline to lint/build on PR.
- On merge to `main`, build + push both images and deploy via `gcloud run deploy` with Workload Identity.
- Cache Maven and npm dependencies to speed up builds.
