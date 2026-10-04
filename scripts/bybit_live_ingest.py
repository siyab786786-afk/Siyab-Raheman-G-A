"""
Bybit live ingestion — REST polling + WS optional.
Writes C_live_events.csv and D_live_candles.csv.
"""
import ccxt, time, hashlib, json, os
import pandas as pd
from datetime import datetime, timezone
from srbmpr_modes import Mode, MODE_SOURCE, REQUIRED_COLUMNS

RUN_ID = f"live_{datetime.utcnow().strftime('%Y%m%d_%H%M%S')}"
HISTORICAL_HASH = os.environ.get("HISTORICAL_HASH", "none")
SYMBOL = "BTCUSDT"
POLL_SECONDS = 10

ex = ccxt.bybit({
    "options": {"defaultType": "linear"},
    "enableRateLimit": True,
})
ex.enable_demo_trading(True)

def build_record(ohlcv_row):
    ts_ex, o, h, l, c, v = ohlcv_row
    ts_local_ms = int(time.time() * 1000)
    payload = {"o": o, "h": h, "l": l, "c": c, "v": v, "ts": ts_ex}
    return {
        "run_id": RUN_ID,
        "mode": Mode.LIVE_READ_ONLY.value,
        "source_id": f"bybit_rest_{RUN_ID}",
        "source_type": MODE_SOURCE[Mode.LIVE_READ_ONLY],
        "provider": "BYBIT",
        "symbol": SYMBOL,
        "environment": "demo",
        "exchange_timestamp_utc": pd.to_datetime(ts_ex, unit="ms", utc=True),
        "local_received_timestamp_utc": pd.to_datetime(ts_local_ms, unit="ms", utc=True),
        "feed_age_ms": ts_local_ms - ts_ex,
        "raw_payload_hash": hashlib.sha256(
            json.dumps(payload, sort_keys=True).encode()).hexdigest(),
        "candle_confirmed": False,
        "data_gap_status": "NONE",
        "open": o, "high": h, "low": l, "close": c, "volume": v,
    }

def main():
    rows = []
    while True:
        try:
            ohlcv = ex.fetch_ohlcv(SYMBOL, timeframe="1m", limit=2)
            rec = build_record(ohlcv[-1])
            rows.append(rec)
            df = pd.DataFrame(rows, columns=REQUIRED_COLUMNS + [
                "open", "high", "low", "close", "volume"])
            df.to_csv("C_live_events.csv", index=False)
            df.to_csv("D_live_candles.csv", index=False)
            print(f"[{rec['local_received_timestamp_utc']}] "
                  f"age={rec['feed_age_ms']}ms close={rec['close']}")
        except Exception as e:
            print(f"INGEST_ERROR: {e}")
        time.sleep(POLL_SECONDS)

if __name__ == "__main__":
    main()
