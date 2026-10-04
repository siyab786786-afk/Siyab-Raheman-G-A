"""
Bybit Webhook Receiver (Flask)
Listens to TradingView Pine Script alerts and executes Bybit Demo limit orders with SL & TP.
Logs fills to E_demo_execution.csv.
"""
from flask import Flask, request, jsonify
import hmac, hashlib, os, time
import ccxt
from datetime import datetime, timezone

app = Flask(__name__)
SECRET = os.environ.get("SRBMPR_WEBHOOK_SECRET", "SRBMPR_2026_SECRET")
LOG = "E_demo_execution.csv"

ex = ccxt.bybit({
    "apiKey": os.environ.get("BYBIT_API_KEY", ""),
    "secret": os.environ.get("BYBIT_API_SECRET", ""),
    "options": {"defaultType": "linear"},
})
ex.enable_demo_trading(True)

def log_row(row):
    header = not os.path.exists(LOG)
    import csv
    with open(LOG, "a", newline="") as f:
        w = csv.DictWriter(f, fieldnames=row.keys())
        if header: w.writeheader()
        w.writerow(row)

@app.route("/webhook", methods=["POST"])
def webhook():
    data = request.get_json(force=True)
    if data.get("secret") != SECRET:
        return jsonify({"error": "bad_secret"}), 401

    side = data["side"]        # "buy" or "sell"
    symbol = data["symbol"]    # "BTCUSDT"
    price = float(data["price"])
    sl = float(data["sl"])
    tp = float(data["tp"])
    qty = float(data["qty"])

    try:
        order = ex.create_order(
            symbol=symbol,
            type="limit",
            side=side,
            amount=qty,
            price=price,
            params={
                "timeInForce": "GTC",
                "takeProfit": tp,
                "stopLoss": sl,
                "tpslMode": "Partial",
                "tpOrderType": "Limit",
                "slOrderType": "Limit",
            },
        )
        log_row({
            "ts_utc": datetime.now(timezone.utc).isoformat(),
            "mode": "DEMO_EXECUTION",
            "symbol": symbol,
            "side": side,
            "requested_price": price,
            "requested_qty": qty,
            "order_id": order["id"],
            "status": order["status"],
            "filled_qty": order.get("filled", 0),
            "avg_fill_price": order.get("average"),
            "sl": sl,
            "tp": tp,
        })
        return jsonify({"ok": True, "order_id": order["id"]})
    except Exception as e:
        log_row({
            "ts_utc": datetime.now(timezone.utc).isoformat(),
            "mode": "DEMO_EXECUTION",
            "symbol": symbol, "side": side,
            "requested_price": price, "requested_qty": qty,
            "order_id": "", "status": f"ERROR:{e}",
            "filled_qty": 0, "avg_fill_price": None,
            "sl": sl, "tp": tp,
        })
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
