CREATE TABLE IF NOT EXISTS ingestion_state (
    id TEXT PRIMARY KEY,
    last_fetched_at TIMESTAMPTZ
);

DO $$
BEGIN
    ALTER TABLE powerflow_snapshot
        ADD CONSTRAINT uq_powerflow_station_time UNIQUE (powerstation_id, powerflow_timestamp);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;
