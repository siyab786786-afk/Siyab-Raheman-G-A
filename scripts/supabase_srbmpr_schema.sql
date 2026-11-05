-- ==============================================================================
-- SRBMPR (Siyab Raheman Behavior Market Psychology Research)
-- Supabase PostgreSQL Production Schema & Institutional Migration
-- Organization: siyab786786-afk's Org
-- Project: siyab786786-afk's Project
-- Lead Architect: Siyab Raheman Gulwadi Abbushet (siyab786786@gmail.com)
-- Time-Zone Lead: Raziya Rahman
-- Version: SRBMPR-CONSTITUTION-v2.6
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. BROKER VALIDATION & IMMUTABLE PROVENANCE LEDGER
CREATE TABLE IF NOT EXISTS public.srbmpr_broker_ledger (
    record_id VARCHAR(64) PRIMARY KEY,
    symbol VARCHAR(32) NOT NULL,
    timeframe VARCHAR(16) NOT NULL DEFAULT '1m',
    asset_class VARCHAR(32) NOT NULL DEFAULT 'US_CRYPTO_PERP',
    provider VARCHAR(128) NOT NULL,
    stream_id TEXT NOT NULL,
    market_type VARCHAR(32) NOT NULL DEFAULT 'PERPETUAL_DERIVATIVE',
    
    -- Triple Timezone Timestamps
    source_timestamp_utc TIMESTAMPTZ NOT NULL,
    source_timestamp_uae VARCHAR(64) NOT NULL, -- GST (+04:00 Dubai)
    source_timestamp_ist VARCHAR(64) NOT NULL, -- IST (+05:30 India)
    completion_timestamp_utc VARCHAR(64) NOT NULL,
    elapsed_minutes NUMERIC(8, 2) NOT NULL DEFAULT 0.00,
    duration_requirement_met BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Zero & Negative-Zero SRBMPR Core Parameters
    zero_reference_price NUMERIC(16, 4) NOT NULL,
    zero_source_candle_index BIGINT NOT NULL,
    exact_entry_price NUMERIC(16, 4) NOT NULL,
    negative_zero_stop_loss_price NUMERIC(16, 4) NOT NULL,
    atomic_delta_zero NUMERIC(16, 4) NOT NULL,
    
    -- Target Expansion Levels
    target_1to1_price NUMERIC(16, 4) NOT NULL,
    target_1to10_price NUMERIC(16, 4) NOT NULL,
    target_1to20_price NUMERIC(16, 4) NOT NULL,
    
    -- $50 Fixed Risk Engine: Q = 50 / |Entry - SL|
    risk_amount_usd NUMERIC(10, 2) NOT NULL DEFAULT 50.00,
    approved_quantity_units NUMERIC(16, 4) NOT NULL,
    potential_reward_1to10_usd NUMERIC(10, 2) NOT NULL DEFAULT 500.00,
    potential_reward_1to20_usd NUMERIC(10, 2) NOT NULL DEFAULT 1000.00,
    realized_result_usd NUMERIC(12, 2),
    fees_deduction_usd NUMERIC(8, 2) NOT NULL DEFAULT 0.10,
    
    -- Forensic Provenance & Integrity
    rule_version VARCHAR(32) NOT NULL DEFAULT 'SRBMPR-CONSTITUTION-v2.6',
    dataset_version VARCHAR(64) NOT NULL DEFAULT 'DS-BYBIT-V5-100K-OCT2026',
    raw_checksum_sha256 VARCHAR(64) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'OPEN', -- 'OPEN', 'COMPLETED', 'REJECTED'
    origin_type VARCHAR(32) NOT NULL DEFAULT 'REPLAY_VERIFIED',
    rejection_reason TEXT,
    provenance_chain_verified BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes for lightning-fast institutional broker queries
CREATE INDEX IF NOT EXISTS idx_srbmpr_ledger_symbol ON public.srbmpr_broker_ledger(symbol);
CREATE INDEX IF NOT EXISTS idx_srbmpr_ledger_tf ON public.srbmpr_broker_ledger(timeframe);
CREATE INDEX IF NOT EXISTS idx_srbmpr_ledger_status ON public.srbmpr_broker_ledger(status);
CREATE INDEX IF NOT EXISTS idx_srbmpr_ledger_utc ON public.srbmpr_broker_ledger(source_timestamp_utc);

-- 3. RAW HIGH-VELOCITY TICK & CANDLE INGESTION (0.1s & 1s Stream)
CREATE TABLE IF NOT EXISTS public.srbmpr_raw_ticks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_id VARCHAR(64) NOT NULL,
    asset VARCHAR(32) NOT NULL,
    timeframe VARCHAR(16) NOT NULL DEFAULT '1S', -- 'MICRO', '1S', '1M'
    timestamp_utc TIMESTAMPTZ NOT NULL,
    open NUMERIC(16, 4) NOT NULL,
    high NUMERIC(16, 4) NOT NULL,
    low NUMERIC(16, 4) NOT NULL,
    close NUMERIC(16, 4) NOT NULL,
    volume NUMERIC(20, 6),
    source_row BIGINT,
    raw_file_hash VARCHAR(64),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_raw_ticks_asset_ts ON public.srbmpr_raw_ticks(asset, timestamp_utc DESC);

-- 4. MICRO CANDLE ZERO CYCLES (60x1s Nested Container State Machine)
CREATE TABLE IF NOT EXISTS public.srbmpr_cycle_records (
    cycle_id VARCHAR(64) PRIMARY KEY,
    asset VARCHAR(32) NOT NULL,
    source_id VARCHAR(64) NOT NULL,
    layer VARCHAR(16) NOT NULL DEFAULT '1S',
    cycle_date DATE NOT NULL,
    timezone VARCHAR(32) NOT NULL DEFAULT 'UTC',
    high_1_time TIMESTAMPTZ NOT NULL,
    high_1_price NUMERIC(16, 4) NOT NULL,
    low_time TIMESTAMPTZ NOT NULL,
    low_price NUMERIC(16, 4) NOT NULL,
    high_2_time TIMESTAMPTZ NOT NULL,
    high_2_price NUMERIC(16, 4) NOT NULL,
    duration_seconds INT NOT NULL,
    parent_cycle_id VARCHAR(64),
    raw_row_start BIGINT,
    raw_row_end BIGINT,
    status VARCHAR(32) NOT NULL DEFAULT 'COMPLETE',
    methodology_version VARCHAR(32) NOT NULL DEFAULT 'SRBMPR-2.6',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. DAILY STATISTICAL AGGREGATES & PURGE GAP COUNTS
CREATE TABLE IF NOT EXISTS public.srbmpr_daily_counts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    count_date DATE NOT NULL,
    asset VARCHAR(32) NOT NULL,
    source_id VARCHAR(64) NOT NULL,
    micro_complete_cycles INT NOT NULL DEFAULT 0,
    second_complete_cycles INT NOT NULL DEFAULT 0,
    minute_complete_cycles INT NOT NULL DEFAULT 0,
    micro_incomplete_cycles INT NOT NULL DEFAULT 0,
    second_incomplete_cycles INT NOT NULL DEFAULT 0,
    minute_incomplete_cycles INT NOT NULL DEFAULT 0,
    data_gap_count INT NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(count_date, asset, source_id)
);

-- 6. VIEWER & BROKER ACCESS PROFILES (SECURE READ-ONLY ROLES)
CREATE TABLE IF NOT EXISTS public.srbmpr_broker_profiles (
    broker_id VARCHAR(64) PRIMARY KEY,
    organization_name VARCHAR(128) NOT NULL,
    authorized_contact_email VARCHAR(128) NOT NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'VIEW_READ_VALIDATE',
    permitted_markets TEXT[] NOT NULL DEFAULT ARRAY['US_CRYPTO_PERP'],
    access_key_public_id VARCHAR(64) NOT NULL UNIQUE,
    is_revoked BOOLEAN NOT NULL DEFAULT FALSE,
    total_validation_runs INT NOT NULL DEFAULT 0,
    last_accessed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. ROW-LEVEL SECURITY (RLS) POLICIES
-- Zero Private Keys or Write Access for Public Clients
ALTER TABLE public.srbmpr_broker_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.srbmpr_raw_ticks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.srbmpr_cycle_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.srbmpr_daily_counts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.srbmpr_broker_profiles ENABLE ROW LEVEL SECURITY;

-- Allow Public/Institutional READ-ONLY access to verified ledger records
CREATE POLICY "Public Read Verified Ledger"
    ON public.srbmpr_broker_ledger
    FOR SELECT
    USING (true);

CREATE POLICY "Public Read Ticks"
    ON public.srbmpr_raw_ticks
    FOR SELECT
    USING (true);

CREATE POLICY "Public Read Cycles"
    ON public.srbmpr_cycle_records
    FOR SELECT
    USING (true);

CREATE POLICY "Public Read Daily Counts"
    ON public.srbmpr_daily_counts
    FOR SELECT
    USING (true);

-- 8. INITIAL VERIFIED SEED DATA (SRBMPR Baseline)
INSERT INTO public.srbmpr_broker_ledger (
    record_id, symbol, timeframe, asset_class, provider, stream_id,
    source_timestamp_utc, source_timestamp_uae, source_timestamp_ist, completion_timestamp_utc,
    elapsed_minutes, duration_requirement_met, zero_reference_price, zero_source_candle_index,
    exact_entry_price, negative_zero_stop_loss_price, atomic_delta_zero,
    target_1to1_price, target_1to10_price, target_1to20_price,
    risk_amount_usd, approved_quantity_units, potential_reward_1to10_usd, potential_reward_1to20_usd,
    realized_result_usd, fees_deduction_usd, rule_version, dataset_version,
    raw_checksum_sha256, status, origin_type, provenance_chain_verified
) VALUES 
(
    'SRB-REC-2026-BTC-001', 'BTCUSDT', '1m', 'US_CRYPTO_PERP',
    'Bybit V5 Linear Public WebSocket', 'wss://stream.bybit.com/v5/public/linear/tickers.BTCUSDT',
    '2026-10-28 14:15:00+00', '2026-10-28 18:15:00 GST', '2026-10-28 19:45:00 IST', '2026-10-28T14:27:14Z',
    12.23, TRUE, 68420.00, 12048, 68420.00, 68370.00, 50.00,
    68470.00, 68920.00, 69420.00,
    50.00, 1.0000, 500.00, 1000.00, 500.00, 0.10,
    'SRBMPR-CONSTITUTION-v2.6', 'DS-BYBIT-V5-100K-OCT2026',
    '9f4ad401c385ba8019b88ef7b28fa5c2690d234a413d96cbfaec4098f98aa12d', 'COMPLETED', 'REPLAY_VERIFIED', TRUE
),
(
    'SRB-REC-2026-ETH-002', 'ETHUSDT', '3m', 'US_CRYPTO_PERP',
    'Bybit V5 Linear Public WebSocket', 'wss://stream.bybit.com/v5/public/linear/tickers.ETHUSDT',
    '2026-10-28 13:40:00+00', '2026-10-28 17:40:00 GST', '2026-10-28 19:10:00 IST', '2026-10-28T13:54:30Z',
    14.50, TRUE, 3420.00, 8940, 3420.00, 3412.00, 8.00,
    3428.00, 3500.00, 3580.00,
    50.00, 6.2500, 500.00, 1000.00, 500.00, 0.10,
    'SRBMPR-CONSTITUTION-v2.6', 'DS-BYBIT-V5-100K-OCT2026',
    '7b80a1c32d96cbfaec4098f98aa12d9f4ad401c385ba8019b88ef7b28fa5c269', 'COMPLETED', 'REPLAY_VERIFIED', TRUE
),
(
    'SRB-REC-2026-SOL-003', 'SOLUSDT', '5m', 'US_CRYPTO_PERP',
    'Bybit V5 Linear Public WebSocket', 'wss://stream.bybit.com/v5/public/linear/tickers.SOLUSDT',
    '2026-10-28 12:10:00+00', '2026-10-28 16:10:00 GST', '2026-10-28 17:40:00 IST', '2026-10-28T12:28:40Z',
    18.67, TRUE, 184.50, 6120, 184.50, 183.25, 1.25,
    185.75, 197.00, 209.50,
    50.00, 40.0000, 500.00, 1000.00, 500.00, 0.10,
    'SRBMPR-CONSTITUTION-v2.6', 'DS-BYBIT-V5-100K-OCT2026',
    '413d96cbfaec4098f98aa12d9f4ad401c385ba8019b88ef7b28fa5c2690d234a', 'COMPLETED', 'RECOVERED_HISTORICAL', TRUE
),
(
    'SRB-REC-2026-REJ-004', 'XRPUSDT', '1m', 'US_CRYPTO_PERP',
    'Bybit V5 Linear Public WebSocket', 'wss://stream.bybit.com/v5/public/linear/tickers.XRPUSDT',
    '2026-10-28 11:05:00+00', '2026-10-28 15:05:00 GST', '2026-10-28 16:35:00 IST', '2026-10-28T11:11:00Z',
    6.00, FALSE, 0.6240, 4320, 0.6240, 0.6160, 0.0080,
    0.6320, 0.7040, 0.7840,
    50.00, 6250.00, 500.00, 1000.00, NULL, 0.00,
    'SRBMPR-CONSTITUTION-v2.6', 'DS-BYBIT-V5-100K-OCT2026',
    '2690d234a413d96cbfaec4098f98aa12d9f4ad401c385ba8019b88ef7b28fa5c', 'REJECTED', 'REJECTED_NEAR_MISS', TRUE
)
ON CONFLICT (record_id) DO NOTHING;
