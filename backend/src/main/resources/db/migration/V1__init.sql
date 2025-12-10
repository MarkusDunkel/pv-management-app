CREATE TABLE powerstation (
    powerstation_id BIGSERIAL PRIMARY KEY,
--    owner_id BIGSERIAL REFERENCES owner(owner_id),
    stationname VARCHAR(255) UNIQUE NOT NULL,
    address TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    capacity_k_wp DOUBLE PRECISION,
    battery_capacity_k_wh DOUBLE PRECISION,
    powerstation_type VARCHAR(128),
    status VARCHAR(64),
    turnon_time TIMESTAMPTZ,
    create_time TIMESTAMPTZ,
    org_code VARCHAR(128),
    org_name VARCHAR(255),
    is_stored BOOLEAN,
    is_powerflow BOOLEAN,
    charts_type VARCHAR(64),
    time_span VARCHAR(64)
);

CREATE TABLE powerflow_snapshot (
    powerflow_id BIGSERIAL PRIMARY KEY,
    powerstation_id BIGSERIAL REFERENCES powerstation(powerstation_id) ON DELETE CASCADE,
    powerflow_timestamp TIMESTAMPTZ NOT NULL,
    pv_w NUMERIC(12,3),
    pv_status VARCHAR(64),
    battery_w NUMERIC(12,3),
    battery_status VARCHAR(64),
    load_w NUMERIC(12,3),
    load_status VARCHAR(64),
    grid_w NUMERIC(12,3),
    grid_status VARCHAR(64),
    genset_w NUMERIC(12,3),
    microgrid_w NUMERIC(12,3),
    soc_percent NUMERIC(6,3)
);

CREATE TABLE ingestion_state (
    id TEXT PRIMARY KEY,
    last_fetched_at TIMESTAMPTZ
);

ALTER TABLE powerflow_snapshot
    ADD CONSTRAINT uq_powerflow_station_time UNIQUE (powerstation_id, powerflow_timestamp);

CREATE INDEX idx_powerflow_snapshot_station_time
    ON powerflow_snapshot(powerstation_id, powerflow_timestamp);

CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(64) UNIQUE NOT NULL
);

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    enabled BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_roles (
    user_id BIGSERIAL REFERENCES users(id) ON DELETE CASCADE,
    role_id BIGSERIAL REFERENCES roles(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE sem_sync_log (
    id BIGSERIAL PRIMARY KEY,
    powerstation_id BIGSERIAL REFERENCES powerstation(powerstation_id) ON DELETE SET NULL,
    last_success_at TIMESTAMPTZ,
    status VARCHAR(32),
    message TEXT
);

INSERT INTO roles (name) VALUES ('ROLE_USER') ON CONFLICT DO NOTHING;
INSERT INTO roles (name) VALUES ('ROLE_ADMIN') ON CONFLICT DO NOTHING;

-- === Refresh tokens (from V2__add_refresh_tokens.sql) ===

CREATE TABLE refresh_tokens (
    id BIGSERIAL PRIMARY KEY,
    token VARCHAR(255) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_refresh_tokens_user_id
    ON refresh_tokens(user_id);

-- === Demo access (from V3__demo_access.sql) ===

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS demo_org TEXT UNIQUE,
    ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS demo_expires_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS demo_keys (
    id BIGSERIAL PRIMARY KEY,
    key_id TEXT NOT NULL,
    org TEXT NOT NULL,
    issued_at TIMESTAMPTZ,
    first_used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    activations INT NOT NULL DEFAULT 0,
    max_activations INT NOT NULL DEFAULT 5,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    last_used_at TIMESTAMPTZ,
    UNIQUE (key_id, org)
);

CREATE TABLE IF NOT EXISTS demo_redemptions (
    id BIGSERIAL PRIMARY KEY,
    key_id TEXT NOT NULL,
    org TEXT NOT NULL,
    ts TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ip TEXT,
    ua TEXT
);

CREATE INDEX IF NOT EXISTS idx_demo_redemptions_key_ts
    ON demo_redemptions(key_id, ts DESC);

INSERT INTO roles (name) VALUES ('ROLE_DEMO') ON CONFLICT DO NOTHING;