ALTER TABLE users ADD COLUMN IF NOT EXISTS demo_org TEXT UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS demo_expires_at TIMESTAMPTZ;

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

CREATE INDEX IF NOT EXISTS idx_demo_redemptions_key_ts ON demo_redemptions(key_id, ts DESC);

INSERT INTO roles (name) VALUES ('ROLE_DEMO') ON CONFLICT DO NOTHING;
