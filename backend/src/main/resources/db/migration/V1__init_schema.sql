--CREATE TABLE owner (
--    owner_id BIGSERIAL PRIMARY KEY,
--    name VARCHAR(255),
--    phone VARCHAR(64),
--    email VARCHAR(255)
--);

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

--CREATE TABLE kpi_daily (
--    kpi_id BIGSERIAL PRIMARY KEY,
--    powerstation_id INTEGER REFERENCES powerstation(powerstation_id) ON DELETE CASCADE,
--    kpi_date DATE NOT NULL,
--    month_generation_k_wh NUMERIC(12,3),
--    pac_w NUMERIC(12,3),
--    power_k_wh NUMERIC(12,3),
--    total_power_k_wh NUMERIC(14,3),
--    day_income_eur NUMERIC(12,2),
--    total_income_eur NUMERIC(14,2),
--    yield_rate NUMERIC(8,4)
--);

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

--CREATE TABLE weather_forecast (
--    forecast_id BIGSERIAL PRIMARY KEY,
--    powerstation_id INTEGER REFERENCES powerstation(powerstation_id) ON DELETE CASCADE,
--    forecast_date DATE NOT NULL,
--    cond_code_d VARCHAR(32),
--    cond_code_n VARCHAR(32),
--    cond_txt_d VARCHAR(128),
--    cond_txt_n VARCHAR(128),
--    hum INTEGER,
--    pcpn DOUBLE PRECISION,
--    pop INTEGER,
--    pres DOUBLE PRECISION,
--    tmp_max DOUBLE PRECISION,
--    tmp_min DOUBLE PRECISION,
--    uv_index INTEGER,
--    vis INTEGER,
--    wind_deg INTEGER,
--    wind_dir VARCHAR(32),
--    wind_sc VARCHAR(32),
--    wind_spd DOUBLE PRECISION
--);

--CREATE TABLE equipment (
--    equipment_id BIGSERIAL PRIMARY KEY,
--    powerstation_id INTEGER REFERENCES powerstation(powerstation_id) ON DELETE CASCADE,
--    type VARCHAR(64),
--    title VARCHAR(255),
--    status VARCHAR(64),
--    model VARCHAR(128),
--    brand VARCHAR(128),
--    relation_id VARCHAR(128),
--    sn VARCHAR(128),
--    capacity_k_w DOUBLE PRECISION,
--    is_stored BOOLEAN,
--    soc_percent DOUBLE PRECISION,
--    eday_k_wh DOUBLE PRECISION
--);

--CREATE TABLE inverter (
--    sn VARCHAR(128) PRIMARY KEY,
--    powerstation_id INTEGER REFERENCES powerstation(powerstation_id) ON DELETE CASCADE,
--    relation_id VARCHAR(128),
--    name VARCHAR(255),
--    type VARCHAR(128),
--    capacity_k_w DOUBLE PRECISION,
--    turnon_time TIMESTAMPTZ,
--    firmware_version VARCHAR(128),
--    status VARCHAR(64),
--    temperature_c DOUBLE PRECISION,
--    pac_w DOUBLE PRECISION,
--    etotal_k_wh DOUBLE PRECISION,
--    eday_k_wh DOUBLE PRECISION,
--    emonth_k_wh DOUBLE PRECISION,
--    soc_percent DOUBLE PRECISION,
--    soh_percent DOUBLE PRECISION,
--    check_code VARCHAR(64)
--);

--CREATE TABLE inverter_measurement (
--    meas_id BIGSERIAL PRIMARY KEY,
--    sn VARCHAR(128) REFERENCES inverter(sn) ON DELETE CASCADE,
--    timestamp TIMESTAMPTZ NOT NULL,
--    output_power_w DOUBLE PRECISION,
--    output_current_a DOUBLE PRECISION,
--    output_voltage_v DOUBLE PRECISION,
--    dc_input1_va DOUBLE PRECISION,
--    dc_input2_va DOUBLE PRECISION,
--    battery_voltage_v DOUBLE PRECISION,
--    battery_current_a DOUBLE PRECISION,
--    battery_power_w DOUBLE PRECISION,
--    work_mode VARCHAR(64),
--    grid_conn_status VARCHAR(64),
--    backup_outputs VARCHAR(255),
--    meter_phase_r DOUBLE PRECISION,
--    meter_phase_s DOUBLE PRECISION,
--    meter_phase_t DOUBLE PRECISION
--);

--CREATE INDEX idx_inverter_measurement_time ON inverter_measurement(sn, timestamp);

--CREATE TABLE energy_statistics_daily (
--    stat_id BIGSERIAL PRIMARY KEY,
--    powerstation_id INTEGER REFERENCES powerstation(powerstation_id) ON DELETE CASCADE,
--    stat_date DATE NOT NULL,
--    contributing_rate DOUBLE PRECISION,
--    self_use_rate DOUBLE PRECISION,
--    sum_k_wh DOUBLE PRECISION,
--    buy_k_wh DOUBLE PRECISION,
--    buy_percent DOUBLE PRECISION,
--    sell_k_wh DOUBLE PRECISION,
--    sell_percent DOUBLE PRECISION,
--    self_use_of_pv_k_wh DOUBLE PRECISION,
--    consumption_of_load_k_wh DOUBLE PRECISION,
--    charge_k_wh DOUBLE PRECISION,
--    discharge_k_wh DOUBLE PRECISION,
--    genset_gen_k_wh DOUBLE PRECISION,
--    microgrid_gen_k_wh DOUBLE PRECISION
--);

--CREATE TABLE energy_statistics_totals (
--    totals_id BIGSERIAL PRIMARY KEY,
--    powerstation_id INTEGER REFERENCES powerstation(powerstation_id) ON DELETE CASCADE,
--    contributing_rate DOUBLE PRECISION,
--    self_use_rate DOUBLE PRECISION,
--    sum_k_wh DOUBLE PRECISION,
--    buy_k_wh DOUBLE PRECISION,
--    buy_percent DOUBLE PRECISION,
--    sell_k_wh DOUBLE PRECISION,
--    sell_percent DOUBLE PRECISION,
--    self_use_of_pv_k_wh DOUBLE PRECISION,
--    consumption_of_load_k_wh DOUBLE PRECISION,
--    charge_k_wh DOUBLE PRECISION,
--    discharge_k_wh DOUBLE PRECISION,
--    genset_gen_k_wh DOUBLE PRECISION,
--    microgrid_gen_k_wh DOUBLE PRECISION
--);

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
