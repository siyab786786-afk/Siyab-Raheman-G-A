"""
SRBMPR Mode Separation Layer
Ensures BACKTEST / REPLAY / FORWARD / LIVE / DEMO never share data paths.
"""
from enum import Enum
from datetime import datetime, timezone
import pandas as pd
import hashlib

class Mode(Enum):
    BACKTEST       = "BACKTEST"
    REPLAY         = "REPLAY"
    FORWARD_PAPER  = "FORWARD_PAPER"
    LIVE_READ_ONLY = "LIVE_READ_ONLY"
    DEMO_EXECUTION = "DEMO_EXECUTION"

MODE_SOURCE = {
    Mode.BACKTEST:       "CSV_HISTORICAL",
    Mode.REPLAY:         "CSV_HISTORICAL",
    Mode.FORWARD_PAPER:  "BYBIT_WS",
    Mode.LIVE_READ_ONLY: "BYBIT_REST",
    Mode.DEMO_EXECUTION: "BYBIT_DEMO",
}

REQUIRED_COLUMNS = [
    "run_id", "mode", "source_id", "source_type", "provider",
    "symbol", "environment",
    "exchange_timestamp_utc", "local_received_timestamp_utc",
    "feed_age_ms", "raw_payload_hash",
    "candle_confirmed", "data_gap_status",
]

def assert_schema(df: pd.DataFrame) -> None:
    missing = [c for c in REQUIRED_COLUMNS if c not in df.columns]
    if missing:
        raise RuntimeError(f"SCHEMA_REJECTED: missing columns {missing}")

def assert_live_feed(feed_df: pd.DataFrame,
                     historical_hash: str,
                     max_age_seconds: int = 15) -> None:
    now = pd.Timestamp.now(tz="UTC")
    assert_schema(feed_df)

    if feed_df.empty:
        raise RuntimeError("LIVE_REJECTED: empty feed")

    if (feed_df["source_type"] == "CSV_HISTORICAL").any():
        raise RuntimeError("LIVE_REJECTED: historical CSV in live feed")

    latest = pd.to_datetime(
        feed_df["exchange_timestamp_utc"].max(), utc=True)
    age = (now - latest).total_seconds()
    if age > max_age_seconds:
        raise RuntimeError(f"LIVE_REJECTED: stale feed age={age:.2f}s")

    if (pd.to_datetime(
        feed_df["exchange_timestamp_utc"], utc=True) > now).any():
        raise RuntimeError("LIVE_REJECTED: future timestamp / lookahead")

    live_hash = hashlib.sha256(
        feed_df.to_csv(index=False).encode()).hexdigest()
    if live_hash == historical_hash:
        raise RuntimeError("LIVE_REJECTED: source hash matches historical")

    if feed_df["local_received_timestamp_utc"].nunique() < 2:
        raise RuntimeError("LIVE_REJECTED: local receive time not advancing")
