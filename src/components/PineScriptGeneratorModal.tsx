import React, { useState } from 'react';
import { Code, Copy, Check, Terminal, FileCode, Webhook, ShieldAlert, Cpu } from 'lucide-react';

interface PineScriptGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PINE_SCRIPT_V6_STRATEGY = `//@version=6
strategy(
     "Merged Margin + SRBMPR Two Entry",
     overlay = true,
     pyramiding = 2,
     initial_capital = 10000,
     commission_type = strategy.commission.percent,
     commission_value = 0.05,
     slippage = 1,
     process_orders_on_close = true
)

//────────────────────────────────────
// Inputs
//────────────────────────────────────
source = input.source(close, "Source")

bbLength = input.int(
     20,
     "Margin length",
     minval = 1
)

bbMult = input.float(
     2.0,
     "Margin multiplier",
     minval = 0.001,
     maxval = 50
)

pivotLength = input.int(
     3,
     "SRBMPR pivot strength",
     minval = 1
)

rr = input.float(
     5.0,
     "Minimum RR",
     minval = 5.0,
     step = 1.0
)

stopBufferTicks = input.int(
     1,
     "Stop buffer ticks",
     minval = 0
)

entryQuantity = input.float(
     1.0,
     "Quantity per entry",
     minval = 0.000001
)

tradeDirection = input.string(
     "Both",
     "Direction",
     options = ["Both", "Long only", "Short only"]
)

showPanel = input.bool(
     true,
     "Show panel"
)

//────────────────────────────────────
// Timeframe check
//────────────────────────────────────
isOneMinute =
     timeframe.isminutes and
     timeframe.multiplier == 1

//────────────────────────────────────
// Margin / Bollinger calculation
//────────────────────────────────────
basis = ta.sma(source, bbLength)
deviation = bbMult * ta.stdev(source, bbLength)

upperMargin = basis + deviation
lowerMargin = basis - deviation

// First entry uses margin condition.
// Long first entry: price crosses above lower margin.
// Short first entry: price crosses below upper margin.
marginLong =
     isOneMinute and
     barstate.isconfirmed and
     ta.crossover(source, lowerMargin)

marginShort =
     isOneMinute and
     barstate.isconfirmed and
     ta.crossunder(source, upperMargin)

//────────────────────────────────────
// Confirmed pivots
//────────────────────────────────────
pivotHigh = ta.pivothigh(high, pivotLength, pivotLength)
pivotLow = ta.pivotlow(low, pivotLength, pivotLength)

newPivotHigh =
     isOneMinute and
     barstate.isconfirmed and
     not na(pivotHigh)

newPivotLow =
     isOneMinute and
     barstate.isconfirmed and
     not na(pivotLow)

pivotHighBar = bar_index - pivotLength
pivotLowBar = bar_index - pivotLength

//────────────────────────────────────
// State
//────────────────────────────────────
const int WAITING = 0
const int FIRST_LONG = 1
const int FIRST_SHORT = 2
const int SECOND_READY_LONG = 3
const int SECOND_READY_SHORT = 4
const int ACTIVE_LONG = 5
const int ACTIVE_SHORT = 6

var int state = WAITING

//────────────────────────────────────
// Structure memory
//────────────────────────────────────
var float lockedHigh = na
var float lockedLow = na

var int lockedHighBar = na
var int lockedLowBar = na

//────────────────────────────────────
// Trade memory
//────────────────────────────────────
var float firstEntry = na
var float secondEntry = na
var float combinedEntry = na

var float frozenStop = na
var float frozenTarget = na

var float frozenRisk = na
var int entryCount = 0

//────────────────────────────────────
// Direction filters
//────────────────────────────────────
allowLong =
     tradeDirection == "Both" or
     tradeDirection == "Long only"

allowShort =
     tradeDirection == "Both" or
     tradeDirection == "Short only"

//────────────────────────────────────
// FIRST ENTRY
// Margin condition only
//────────────────────────────────────
if state == WAITING and
   allowLong and
   marginLong and
   strategy.position_size == 0

    firstEntry := close
    entryCount := 1
    state := FIRST_LONG

    strategy.entry(
         "FIRST LONG",
         strategy.long,
         qty = entryQuantity,
         comment = "FIRST LONG - MARGIN"
    )

if state == WAITING and
   allowShort and
   marginShort and
   strategy.position_size == 0

    firstEntry := close
    entryCount := 1
    state := FIRST_SHORT

    strategy.entry(
         "FIRST SHORT",
         strategy.short,
         qty = entryQuantity,
         comment = "FIRST SHORT - MARGIN"
    )

//────────────────────────────────────
// Build SRBMPR high-low structure
// after first LONG entry
//────────────────────────────────────
if state == FIRST_LONG and newPivotHigh
    lockedHigh := pivotHigh
    lockedHighBar := pivotHighBar
    state := SECOND_READY_LONG

if state == SECOND_READY_LONG and newPivotLow
    bool validLowAfterHigh =
         pivotLowBar > lockedHighBar

    if validLowAfterHigh
        lockedLow := pivotLow
        lockedLowBar := pivotLowBar

//────────────────────────────────────
// Build SRBMPR high-low structure
// after first SHORT entry
//────────────────────────────────────
if state == FIRST_SHORT and newPivotLow
    lockedLow := pivotLow
    lockedLowBar := pivotLowBar
    state := SECOND_READY_SHORT

if state == SECOND_READY_SHORT and newPivotHigh
    bool validHighAfterLow =
         pivotHighBar > lockedLowBar

    if validHighAfterLow
        lockedHigh := pivotHigh
        lockedHighBar := pivotHighBar

//────────────────────────────────────
// SECOND ENTRY CONDITIONS
//────────────────────────────────────
longSecondEntry =
     state == SECOND_READY_LONG and
     strategy.position_size > 0 and
     close > lowerMargin and
     close > high[1] and
     close > open

shortSecondEntry =
     state == SECOND_READY_SHORT and
     strategy.position_size < 0 and
     close < upperMargin and
     close < low[1] and
     close < open

//────────────────────────────────────
// SECOND LONG ENTRY
//────────────────────────────────────
if longSecondEntry and entryCount == 1
    secondEntry := close
    entryCount := 2

    combinedEntry :=
         (firstEntry + secondEntry) / 2.0

    frozenStop :=
         math.min(
             lockedLow,
             lowerMargin
         ) -
         stopBufferTicks * syminfo.mintick

    frozenRisk := combinedEntry - frozenStop

    if frozenRisk > syminfo.mintick
        frozenTarget :=
             combinedEntry + frozenRisk * rr

        strategy.entry(
             "SECOND LONG",
             strategy.long,
             qty = entryQuantity,
             comment = "SECOND LONG - SRBMPR"
        )

        state := ACTIVE_LONG

//────────────────────────────────────
// SECOND SHORT ENTRY
//────────────────────────────────────
if shortSecondEntry and entryCount == 1
    secondEntry := close
    entryCount := 2

    combinedEntry :=
         (firstEntry + secondEntry) / 2.0

    frozenStop :=
         math.max(
             lockedHigh,
             upperMargin
         ) +
         stopBufferTicks * syminfo.mintick

    frozenRisk := frozenStop - combinedEntry

    if frozenRisk > syminfo.mintick
        frozenTarget :=
             combinedEntry - frozenRisk * rr

        strategy.entry(
             "SECOND SHORT",
             strategy.short,
             qty = entryQuantity,
             comment = "SECOND SHORT - SRBMPR"
        )

        state := ACTIVE_SHORT

//────────────────────────────────────
// Exits for combined position
//────────────────────────────────────
if strategy.position_size > 0 and
   not na(frozenStop) and
   not na(frozenTarget)

    strategy.exit(
         "LONG EXIT",
         stop = frozenStop,
         limit = frozenTarget,
         comment = "LONG SL / TARGET"
    )

if strategy.position_size < 0 and
   not na(frozenStop) and
   not na(frozenTarget)

    strategy.exit(
         "SHORT EXIT",
         stop = frozenStop,
         limit = frozenTarget,
         comment = "SHORT SL / TARGET"
    )

//────────────────────────────────────
// Safety: first entry fails before second
//────────────────────────────────────
longFirstEntryFailed =
     state == FIRST_LONG and
     strategy.position_size == 0 and
     close < lowerMargin

shortFirstEntryFailed =
     state == FIRST_SHORT and
     strategy.position_size == 0 and
     close > upperMargin

if longFirstEntryFailed or shortFirstEntryFailed
    state := WAITING
    firstEntry := na
    secondEntry := na
    combinedEntry := na
    frozenStop := na
    frozenTarget := na
    frozenRisk := na
    lockedHigh := na
    lockedLow := na
    entryCount := 0

//────────────────────────────────────
// Reset after completed position
//────────────────────────────────────
tradeClosed =
     strategy.position_size == 0 and
     strategy.position_size[1] != 0

if tradeClosed
    state := WAITING

    firstEntry := na
    secondEntry := na
    combinedEntry := na
    frozenStop := na
    frozenTarget := na
    frozenRisk := na

    lockedHigh := na
    lockedLow := na
    lockedHighBar := na
    lockedLowBar := na

    entryCount := 0

//────────────────────────────────────
// State text & Panel
//────────────────────────────────────
stateText =
     state == WAITING ? "WAITING FIRST ENTRY" :
     state == FIRST_LONG ? "FIRST LONG ACTIVE" :
     state == FIRST_SHORT ? "FIRST SHORT ACTIVE" :
     state == SECOND_READY_LONG ? "WAITING SECOND LONG" :
     state == SECOND_READY_SHORT ? "WAITING SECOND SHORT" :
     state == ACTIVE_LONG ? "TWO LONG ENTRIES ACTIVE" :
     state == ACTIVE_SHORT ? "TWO SHORT ENTRIES ACTIVE" :
     "UNKNOWN"

plot(basis, "Margin Basis", color=color.blue)
upperPlot = plot(upperMargin, "Upper Margin", color=color.red)
lowerPlot = plot(lowerMargin, "Lower Margin", color=color.green)

fill(upperPlot, lowerPlot, color=color.new(color.blue, 90))
plot(firstEntry, "First Entry", color=color.orange, linewidth=2, style=plot.style_linebr)
plot(secondEntry, "Second Entry", color=color.yellow, linewidth=2, style=plot.style_linebr)
plot(combinedEntry, "Combined Entry", color=color.white, linewidth=2, style=plot.style_linebr)
plot(frozenStop, "Frozen Stop", color=color.red, linewidth=2, style=plot.style_linebr)
plot(frozenTarget, "Frozen Target", color=color.lime, linewidth=2, style=plot.style_linebr)
`;

const WEBHOOK_PAYLOAD = `{
  "engine": "SRBMPR",
  "version": "1.0.0",
  "event_id": "BTCUSD-20261004T040000Z-LONG-0001",
  "symbol": "BTCUSD",
  "direction": "LONG",
  "entry_number": 1,
  "entry_price": 62000.0,
  "stop_loss": 61900.0,
  "target": 63000.0,
  "risk_reward": "1:10",
  "entry_time_utc": "2026-10-04T04:00:00Z",
  "target_time_utc": "2026-10-04T04:10:00Z",
  "timeframe": "1S",
  "status": "CONFIRMED"
}`;

const SRBMPR_MODES_PY = `"""
srbmpr_modes.py
Multi-Mode Data Separation Engine with Live Guard & Anomaly Auditor
"""
from enum import Enum
import hashlib
import pandas as pd

class Mode(Enum):
    BACKTEST        = "BACKTEST"
    REPLAY          = "REPLAY"
    FORWARD_PAPER   = "FORWARD_PAPER"
    LIVE_READ_ONLY  = "LIVE_READ_ONLY"
    DEMO_EXECUTION  = "DEMO_EXECUTION"

MODE_SOURCE = {
    Mode.BACKTEST:       "CSV_HISTORICAL",
    Mode.REPLAY:         "CSV_HISTORICAL",
    Mode.FORWARD_PAPER:  "BYBIT_WS",
    Mode.LIVE_READ_ONLY: "BYBIT_REST",
    Mode.DEMO_EXECUTION: "BYBIT_DEMO",
}

def assert_live_feed(feed_df: pd.DataFrame, historical_hash: str) -> None:
    now = pd.Timestamp.now(tz="UTC")
    if feed_df.empty:
        raise RuntimeError("LIVE_REJECTED: empty feed")

    # 1. source type check
    if "source_type" in feed_df.columns:
        if (feed_df["source_type"] == "CSV_HISTORICAL").any():
            raise RuntimeError("LIVE_REJECTED: historical CSV in live feed")

    # 2. staleness check
    latest = pd.to_datetime(feed_df["exchange_timestamp_utc"].max(), utc=True)
    age = (now - latest).total_seconds()
    if age > 15:
        raise RuntimeError(f"LIVE_REJECTED: stale feed age={age:.2f}s")

    # 3. future timestamps check
    if (pd.to_datetime(feed_df["exchange_timestamp_utc"], utc=True) > now).any():
        raise RuntimeError("LIVE_REJECTED: future timestamp / lookahead")

    # 4. source hash collision with historical
    live_hash = hashlib.sha256(feed_df.to_csv(index=False).encode()).hexdigest()
    if live_hash == historical_hash:
        raise RuntimeError("LIVE_REJECTED: source hash matches historical")

    # 5. advancing local clock check
    if feed_df["local_received_timestamp_utc"].nunique() < 2:
        raise RuntimeError("LIVE_REJECTED: local receive time not advancing")
`;

export const PineScriptGeneratorModal: React.FC<PineScriptGeneratorModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'PINE' | 'WEBHOOK' | 'PYTHON'>('PINE');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const currentContent = activeTab === 'PINE' 
    ? PINE_SCRIPT_V6_STRATEGY 
    : activeTab === 'WEBHOOK' 
    ? WEBHOOK_PAYLOAD 
    : SRBMPR_MODES_PY;

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-900 bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <FileCode className="w-6 h-6 text-amber-500" />
            <div>
              <h3 className="text-base font-mono font-black text-white">SRBMPR UNIFIED EVENT ENGINE & CODE ASSETS</h3>
              <p className="text-xs text-zinc-400 font-mono">TradingView Pine Script v6 • Webhook Alert JSON • Mode Separation Guard</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white font-mono text-sm px-3.5 py-1.5 bg-zinc-900 rounded-xl hover:bg-zinc-800 transition">
            ✕ Close
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-zinc-900 bg-zinc-950">
          <button
            onClick={() => setActiveTab('PINE')}
            className={`px-4 py-2.5 rounded-t-xl font-mono text-xs font-black flex items-center gap-2 border-t-2 transition-all ${
              activeTab === 'PINE'
                ? 'bg-zinc-900 border-amber-500 text-amber-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Code className="w-4 h-4" /> Pine Script v6 Strategy
          </button>
          <button
            onClick={() => setActiveTab('WEBHOOK')}
            className={`px-4 py-2.5 rounded-t-xl font-mono text-xs font-black flex items-center gap-2 border-t-2 transition-all ${
              activeTab === 'WEBHOOK'
                ? 'bg-zinc-900 border-emerald-500 text-emerald-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Webhook className="w-4 h-4" /> Webhook Bot Payload
          </button>
          <button
            onClick={() => setActiveTab('PYTHON')}
            className={`px-4 py-2.5 rounded-t-xl font-mono text-xs font-black flex items-center gap-2 border-t-2 transition-all ${
              activeTab === 'PYTHON'
                ? 'bg-zinc-900 border-blue-500 text-blue-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Cpu className="w-4 h-4" /> srbmpr_modes.py (Guard)
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 flex-1 overflow-y-auto space-y-4 font-mono">
          <div className="flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-bold">
              {activeTab === 'PINE' && 'Pine Script v6 (Merged Margin + SRBMPR Two Entry - Pyramiding: 2)'}
              {activeTab === 'WEBHOOK' && 'Deterministic Webhook POST JSON for External Bot Execution'}
              {activeTab === 'PYTHON' && 'Live Guard & Mode Isolation (Hard-rejects stale feeds & hash collisions)'}
            </span>
            <button
              onClick={handleCopy}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-amber-500/10"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied to Clipboard!' : 'Copy Code'}
            </button>
          </div>

          <pre className="bg-black/90 p-5 rounded-2xl border border-zinc-800 text-xs text-amber-300/90 overflow-x-auto leading-relaxed max-h-[500px]">
            {currentContent}
          </pre>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-900 bg-zinc-900/40 flex items-center justify-between">
          <div className="text-[11px] text-zinc-500 font-mono">
            Deterministic Engine • Same input = Same output • Zero-Lookahead Certified
          </div>
          <button onClick={onClose} className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-mono text-xs font-bold transition">
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
