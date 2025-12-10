-- 01-init-dbs.sql
-- Initializes multi-DB setup:
--   - homewatts_prod     (production app data)
--   - homewatts_staging  (staging app data)
--   - homewatts_cache    (shared cache for external API responses)

------------------------------------------------------------
-- 0. Create logical databases
------------------------------------------------------------

CREATE DATABASE homewatts_prod;
CREATE DATABASE homewatts_staging;
CREATE DATABASE homewatts_cache;

------------------------------------------------------------
-- 1. Schema for homewatts_cache
------------------------------------------------------------

\connect homewatts_cache

-- Shared cache table for external API responses, used by both prod & staging.

CREATE TABLE external_api_cache (
  id            BIGSERIAL PRIMARY KEY,
  cache_key     TEXT NOT NULL UNIQUE,
  response_json JSONB,
  status_code   INT,
  error_message TEXT,
  fetched_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ttl_seconds   INT NOT NULL DEFAULT 300
);

-- UNIQUE constraint on cache_key already creates an index in Postgres,
-- so no additional index is strictly necessary here.
