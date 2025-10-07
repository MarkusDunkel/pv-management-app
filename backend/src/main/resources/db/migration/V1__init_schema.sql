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

CREATE INDEX idx_powerflow_snapshot_station_time ON powerflow_snapshot(powerstation_id, powerflow_timestamp);

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
