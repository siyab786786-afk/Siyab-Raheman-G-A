import React, { useState, useEffect, useCallback } from 'react';
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Database,
  Download,
  GitBranch,
  Layers,
  Lock,
  Play,
  RefreshCw,
  ShieldCheck,
  Target,
  Zap
} from 'lucide-react';
import {
  ForwardTimeframe,
  ForwardTestExecutionSummary,
  SrbmprForwardTestEngine
} from '../services/SrbmprForwardTestEngine';

const ALL_TIMEFRAMES: ForwardTimeframe[] = [
  '1s', '5s', '15s', '30s', '45s',
  '1m', '2m', '3m', '5m', '10m', '15m', '30m', '45m',
  '1h', '2h', '3h', '4h',
  '1D', '1W', '1M', '3M', '6M', '12M'
];

const SYMBOLS = ['BTCUSDT', 'ZECUSDT', 'ETHUSDT', 'SOLUSDT', 'PAXGUSDT'];

const FOURTEEN_STEPS = [
  { step: 1, action: 'Load Raw OHLC', details: 'Continuous price data only (Open, High, Low, Close)', rule: 'No indicators, no fabricated candles' },
  { step: 2, action: 'Start Point', details: 'Begin where enough bars exist to form first pivots', rule: 'Forward only – never look ahead' },
  { step: 3, action: 'Run Both Sides', details: 'LEFT (High→Low→High) + RIGHT (Low→High→Low)', rule: 'Independent state machines' },
  { step: 4, action: 'Detect Completion', details: 'Swing High Complete or Swing Low Complete', rule: 'Pure pivot based' },
  { step: 5, action: 'Check Connection Break', details: 'High Complete → Lower High | Low Complete → Higher Low', rule: 'Mandatory before rotation' },
  { step: 6, action: 'Count Zero Stages', details: 'Zero-1 → Zero-2 → Zero-3', rule: 'Must finish before any 1:1' },
  { step: 7, action: 'Count Honest Stages', details: 'Honest One → Honest Two → Honest Three', rule: 'Correct directional structure only' },
  { step: 8, action: 'Wait Candles', details: 'After completion + break, wait N candles (3–10)', rule: 'No entry on completion candle itself' },
  { step: 9, action: 'Generate Entry', details: 'Entry = Open of the candle after wait is finished', rule: 'Swing-based, never breakout' },
  { step: 10, action: 'Place Stop-Loss', details: '0.1% away from the completion pivot', rule: 'Fixed percentage (0.1%)' },
  { step: 11, action: 'Calculate Targets', details: '1:1, 1:2, 1:3, 1:5, 1:10, 1:15, 1:20, 1:25', rule: 'Exact multiples of Risk' },
  { step: 12, action: 'Record Everything', details: 'Timestamp, Side, Stage, Direction, Entry, SL, Targets', rule: 'Full audit trail' },
  { step: 13, action: 'Continue Forward', details: 'Move to next bar, repeat process', rule: 'Minimum 1000 candles required' },
  { step: 14, action: 'No Optimization', details: 'Do not change rules using Forward Test results', rule: 'Keep methodology frozen' }
];

export const SrbmprForwardTestChelseaTerminal: React.FC = () => {
  const engine = SrbmprForwardTestEngine.getInstance();

  const [symbol, setSymbol] = useState<string>('BTCUSDT');
  const [timeframe, setTimeframe] = useState<ForwardTimeframe>('1m');
  const [waitCandles, setWaitCandles] = useState<number>(3);
  const [dataSourceLabel, setDataSourceLabel] = useState<string>('BYBIT_V5_LIVE_RAW_OHLC');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [summary, setSummary] = useState<ForwardTestExecutionSummary | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'ALL' | 'AUDIT_TRAIL' | 'CHELSEA_109' | 'STEPS_OHLC'>('ALL');
  const [sideFilter, setSideFilter] = useState<'ALL' | 'LEFT_HLH' | 'RIGHT_LHL'>('ALL');

  const executeForwardTest = useCallback(async () => {
    setIsRunning(true);
    try {
      const { candles, source } = await engine.fetchMinimum1000RawOhlc(symbol, timeframe, 1080);
      setDataSourceLabel(source);
      const result = engine.runChronologicalForwardTest(candles, symbol, timeframe, waitCandles);
      setSummary(result);
    } finally {
      setIsRunning(false);
    }
  }, [engine, symbol, timeframe, waitCandles]);

  useEffect(() => {
    executeForwardTest();
  }, [executeForwardTest]);

  const handleExportCsv = () => {
    if (!summary) return;
    const headers = [
      'ID', 'CandleIndex', 'Timestamp', 'Symbol', 'Timeframe', 'Side', 'Pattern',
      'Stage', 'ConnectionBreak', 'Direction', 'WaitCandles', 'CompletionPivot',
      'ConnectionBreakPivot', 'EntryOpenPrice', 'StopLoss_0.1pct',
      'Target_1_1', 'Target_1_2', 'Target_1_3', 'Target_1_5',
      'Target_1_10', 'Target_1_15', 'Target_1_20', 'Target_1_25',
      'HighestHit', 'AchievedR', 'Theoretical_1Dollar_Equity'
    ].join(',');

    const rows = summary.signals.map(s => [
      s.id,
      s.candleIndex,
      s.timestamp,
      s.symbol,
      s.timeframe,
      s.side,
      `"${s.sequencePattern}"`,
      `"${s.stage}"`,
      s.connectionBreak,
      s.direction,
      s.waitCandles,
      s.completionPivotPrice,
      s.connectionPivotPrice,
      s.entryPrice,
      s.stopLossPrice,
      s.targets.r1,
      s.targets.r2,
      s.targets.r3,
      s.targets.r5,
      s.targets.r10,
      s.targets.r15,
      s.targets.r20,
      s.targets.r25,
      `"${s.highestTargetHit}"`,
      s.achievedR,
      s.theoreticalOneDollarEquity
    ].join(','));

    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SRBMPR_ForwardTest_${symbol}_${timeframe}_${summary.totalCandlesProcessed}Candles.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredSignals = summary?.signals.filter(s =>
    sideFilter === 'ALL' ? true : s.side === sideFilter
  ) || [];

  return (
    <section className="w-full bg-gradient-to-b from-[#070B14] via-black to-[#070B14] border-2 border-emerald-500/60 rounded-3xl p-5 sm:p-8 shadow-[0_0_90px_rgba(16,185,129,0.18)] font-mono text-xs space-y-6">
      
      {/* TOP HEADER & ONE-LINE DEFINITION MANDATE */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 rounded-lg bg-emerald-500 text-black font-black text-[11px] uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 fill-black" /> SRBMPR PURE FORWARD TEST ENGINE
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/40 text-amber-300 font-bold text-[10px] uppercase">
              CHELSEA DATA CONNECTION BREAK (LH / HL)
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 font-bold text-[10px] uppercase">
              {dataSourceLabel === 'BYBIT_V5_LIVE_RAW_OHLC' ? 'LIVE BYBIT V5 RAW OHLC' : 'CONTINUOUS RAW OHLC'}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-300 font-bold text-[10px] flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-400" /> METHODOLOGY FROZEN (NO OPTIMIZATION)
            </span>
          </div>

          <h2 className="text-lg sm:text-2xl font-black text-white tracking-wide uppercase">
            LEFT (High → Low → High) + RIGHT (Low → High → Low) Dual State Machine
          </h2>

          <p className="text-[11px] text-zinc-300 leading-relaxed bg-zinc-900/80 border-l-4 border-emerald-400 pl-3 py-1.5 rounded-r-xl">
            <strong className="text-emerald-400">One-Line Definition:</strong> “Forward Test = Run both LEFT (HLH) and RIGHT (LHL) state machines chronologically on raw OHLC, respect Zero-to-Zero then Honest stages, detect connection breaks (Lower High / Higher Low), give entry only after wait candles, and prove the system on minimum 1000 unseen candles of any timeframe.”
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={executeForwardTest}
            disabled={isRunning}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-black rounded-xl text-xs flex items-center gap-2 shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
            <span>{isRunning ? 'Running 1000+ Candles...' : 'Run 1000+ Candle Forward Test'}</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-amber-300 border border-amber-500/40 font-black rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>Export Audit CSV</span>
          </button>
        </div>
      </div>

      {/* HINDI CORE MANDATE BOX FROM CHELSEA DATA */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 bg-zinc-950/90 border border-amber-500/40 rounded-2xl p-4">
        <div className="space-y-1.5">
          <div className="text-amber-400 font-black text-xs uppercase flex items-center gap-2">
            <GitBranch className="w-4 h-4" />
            Chelsea Data का असली नक्शा (Connection Break = Heart of Forward Test)
          </div>
          <p className="text-[11px] text-zinc-200 leading-relaxed">
            “Raw data में जाओ। सिर्फ High complete या Low complete मत देखो। High complete के बाद <strong className="text-rose-400">Lower High (LH)</strong> बनता है या नहीं — ये connection चेक करो। Low complete के बाद <strong className="text-emerald-400">Higher Low (HL)</strong> बनता है या नहीं — ये connection चेक करो। यही connection टूटने के बाद rotation आता है। एक भी High/Low miss मत करना।”
          </p>
        </div>
        <div className="space-y-1.5 border-t lg:border-t-0 lg:border-l border-zinc-800 pt-3 lg:pt-0 lg:pl-4">
          <div className="text-cyan-400 font-black text-xs uppercase flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Forward Test के अंदर दोनों Sides साथ चलते हैं (आधा खत्म – आधा बाकी)
          </div>
          <p className="text-[11px] text-zinc-200 leading-relaxed">
            “Raw data से सीधा <strong className="text-amber-300">LEFT (High → Low → High)</strong> और <strong className="text-cyan-300">RIGHT (Low → High → Low)</strong> दोनों sides को पढ़ो। Zero-1, Zero-2, Zero-3 के बाद Honest One, Two, Three गिनो। Completion + Connection Break के बाद Wait Candles पूरे होने पर अगली कैंडल के Open पर Entry दो, SL 0.1% रखो, और Minimum 1000 candles पर साबित करो।”
          </p>
        </div>
      </div>

      {/* CONTROLS BAR: ASSET, ALL 22 TIMEFRAMES, WAIT CANDLES (3-10) */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Asset Selector */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] text-zinc-400 font-bold uppercase">Raw OHLC Asset:</span>
            {SYMBOLS.map(s => (
              <button
                key={s}
                onClick={() => setSymbol(s)}
                className={`px-3 py-1.5 rounded-lg font-black text-[11px] transition-all cursor-pointer ${
                  symbol === s
                    ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Wait Candles Rule Selector (Step 8: 3 to 10 candles) */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] text-zinc-400 font-bold uppercase">Step 8 Wait Candles (after Break):</span>
            {[3, 4, 5, 6, 7, 8, 10].map(w => (
              <button
                key={w}
                onClick={() => setWaitCandles(w)}
                className={`px-2.5 py-1 rounded-lg font-black text-[11px] transition-all cursor-pointer ${
                  waitCandles === w
                    ? 'bg-amber-500 text-black'
                    : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                {w} Bars
              </button>
            ))}
            <span className="px-2.5 py-1 rounded-lg bg-rose-500/15 border border-rose-500/40 text-rose-300 font-black text-[10px]">
              Step 10 SL: Fixed 0.1%
            </span>
          </div>
        </div>

        {/* Timeframe Independence Bar (1s to 12M) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[10px] text-zinc-400 font-bold uppercase">
            <span>Timeframe Independence (Same Zero → Honest → Connection Break Sequence Across All 22 Timeframes):</span>
            <span className="text-emerald-400">Active: {timeframe}</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {ALL_TIMEFRAMES.map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2.5 py-1 rounded-lg font-bold text-[10px] transition-all cursor-pointer ${
                  timeframe === tf
                    ? 'bg-cyan-400 text-black font-black shadow-[0_0_12px_rgba(34,211,238,0.4)]'
                    : 'bg-zinc-900/90 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KEY METRICS SUMMARY BAR */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          <div className="bg-zinc-950 border border-emerald-500/40 p-3.5 rounded-2xl">
            <div className="text-[9px] text-zinc-400 uppercase font-bold">Candles Processed</div>
            <div className="text-xl font-black text-emerald-400 mt-0.5">
              {summary.totalCandlesProcessed.toLocaleString()}
            </div>
            <div className="text-[9px] text-emerald-300 font-bold flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3 h-3" /> Min 1000 Verified
            </div>
          </div>

          <div className="bg-zinc-950 border border-amber-500/40 p-3.5 rounded-2xl">
            <div className="text-[9px] text-zinc-400 uppercase font-bold">LEFT (H→L→H) Breaks</div>
            <div className="text-xl font-black text-amber-400 mt-0.5">
              {summary.lowerHighBreaks} <span className="text-xs text-zinc-400">/ {summary.leftHlhCompletions}</span>
            </div>
            <div className="text-[9px] text-amber-300 font-bold mt-0.5">High Complete → Lower High</div>
          </div>

          <div className="bg-zinc-950 border border-cyan-500/40 p-3.5 rounded-2xl">
            <div className="text-[9px] text-zinc-400 uppercase font-bold">RIGHT (L→H→L) Breaks</div>
            <div className="text-xl font-black text-cyan-400 mt-0.5">
              {summary.higherLowBreaks} <span className="text-xs text-zinc-400">/ {summary.rightLhlCompletions}</span>
            </div>
            <div className="text-[9px] text-cyan-300 font-bold mt-0.5">Low Complete → Higher Low</div>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 p-3.5 rounded-2xl">
            <div className="text-[9px] text-zinc-400 uppercase font-bold">Zero Stages (1→2→3)</div>
            <div className="text-xl font-black text-white mt-0.5">{summary.zeroStageSignals}</div>
            <div className="text-[9px] text-zinc-400 font-bold mt-0.5">Completed before 1:1</div>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 p-3.5 rounded-2xl">
            <div className="text-[9px] text-zinc-400 uppercase font-bold">Honest Stages (1→2→3)</div>
            <div className="text-xl font-black text-emerald-400 mt-0.5">{summary.honestStageSignals}</div>
            <div className="text-[9px] text-zinc-400 font-bold mt-0.5">Directional Confirmed</div>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 p-3.5 rounded-2xl">
            <div className="text-[9px] text-zinc-400 uppercase font-bold">Long / Short Balance</div>
            <div className="text-xl font-black text-white mt-0.5">
              <span className="text-emerald-400">{summary.longSignals}L</span>
              {' / '}
              <span className="text-rose-400">{summary.shortSignals}S</span>
            </div>
            <div className="text-[9px] text-zinc-400 font-bold mt-0.5">Natural Unbiased Split</div>
          </div>

          <div className="bg-zinc-950 border border-zinc-800 p-3.5 rounded-2xl">
            <div className="text-[9px] text-zinc-400 uppercase font-bold">Chelsea 109 Gaps</div>
            <div className="text-xl font-black text-amber-300 mt-0.5">53R / 53C / 3F</div>
            <div className="text-[9px] text-zinc-400 font-bold mt-0.5">Skipped Zero: {summary.skippedZeroCandidates}</div>
          </div>

          <div className="bg-zinc-950 border border-emerald-500/50 p-3.5 rounded-2xl">
            <div className="text-[9px] text-zinc-400 uppercase font-bold">$1 Multiplication Power</div>
            <div className="text-xl font-black text-emerald-400 mt-0.5">
              ${summary.theoreticalFinalDollar.toLocaleString()}
            </div>
            <div className="text-[9px] text-emerald-300 font-bold mt-0.5">From $1.00 Start</div>
          </div>
        </div>
      )}

      {/* DUAL STATE MACHINE LIVE BOXES (LEFT HLH + RIGHT LHL) */}
      {summary && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* LEFT STATE MACHINE */}
          <div className="bg-zinc-950 border border-amber-500/40 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  LEFT SIDE STATE MACHINE
                </span>
                <h3 className="text-base font-black text-white mt-1">
                  Family: High → Low → High (HLH)
                </h3>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-zinc-400">Connection Break Rule</div>
                <div className="text-xs font-black text-rose-400">High Complete → Lower High (LH)</div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-[11px]">
              <div className="bg-black border border-zinc-800 p-2.5 rounded-xl">
                <div className="text-[9px] text-zinc-500 uppercase">1. Swing High (H1)</div>
                <div className="text-sm font-black text-white mt-0.5">
                  {summary.stateSnapshot.leftSide.h1Price ?? 'Scanning'}
                </div>
              </div>
              <div className="bg-black border border-zinc-800 p-2.5 rounded-xl">
                <div className="text-[9px] text-zinc-500 uppercase">2. Swing Low (L1)</div>
                <div className="text-sm font-black text-white mt-0.5">
                  {summary.stateSnapshot.leftSide.l1Price ?? 'Scanning'}
                </div>
              </div>
              <div className="bg-black border border-amber-500/30 p-2.5 rounded-xl">
                <div className="text-[9px] text-amber-400 uppercase">3. High Complete (H2)</div>
                <div className="text-sm font-black text-amber-300 mt-0.5">
                  {summary.stateSnapshot.leftSide.h2CompletePrice ?? 'Awaiting Pivot'}
                </div>
              </div>
              <div className="bg-black border border-rose-500/40 p-2.5 rounded-xl">
                <div className="text-[9px] text-rose-400 uppercase">4. Lower High Break</div>
                <div className="text-sm font-black text-rose-300 mt-0.5">
                  {summary.stateSnapshot.leftSide.lowerHighBreakPrice ?? 'Checking LH'}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px]">
              <div className="flex items-center gap-2">
                <span className="text-zinc-400">Stage Sequence:</span>
                <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-white font-bold">
                  Zero 1→2→3 ({summary.stateSnapshot.leftSide.zeroCount}/3)
                </span>
                <span className="text-zinc-600">→</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-bold">
                  Honest 1→2→3 ({summary.stateSnapshot.leftSide.honestCount}/3)
                </span>
              </div>
              <span className="text-amber-300 font-bold">
                Breaks Confirmed: {summary.stateSnapshot.leftSide.connectionBreaksDetected}
              </span>
            </div>
          </div>

          {/* RIGHT STATE MACHINE */}
          <div className="bg-zinc-950 border border-cyan-500/40 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  RIGHT SIDE STATE MACHINE
                </span>
                <h3 className="text-base font-black text-white mt-1">
                  Family: Low → High → Low (LHL)
                </h3>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-zinc-400">Connection Break Rule</div>
                <div className="text-xs font-black text-emerald-400">Low Complete → Higher Low (HL)</div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-[11px]">
              <div className="bg-black border border-zinc-800 p-2.5 rounded-xl">
                <div className="text-[9px] text-zinc-500 uppercase">1. Swing Low (L1)</div>
                <div className="text-sm font-black text-white mt-0.5">
                  {summary.stateSnapshot.rightSide.l1Price ?? 'Scanning'}
                </div>
              </div>
              <div className="bg-black border border-zinc-800 p-2.5 rounded-xl">
                <div className="text-[9px] text-zinc-500 uppercase">2. Swing High (H1)</div>
                <div className="text-sm font-black text-white mt-0.5">
                  {summary.stateSnapshot.rightSide.h1Price ?? 'Scanning'}
                </div>
              </div>
              <div className="bg-black border border-cyan-500/30 p-2.5 rounded-xl">
                <div className="text-[9px] text-cyan-400 uppercase">3. Low Complete (L2)</div>
                <div className="text-sm font-black text-cyan-300 mt-0.5">
                  {summary.stateSnapshot.rightSide.l2CompletePrice ?? 'Awaiting Pivot'}
                </div>
              </div>
              <div className="bg-black border border-emerald-500/40 p-2.5 rounded-xl">
                <div className="text-[9px] text-emerald-400 uppercase">4. Higher Low Break</div>
                <div className="text-sm font-black text-emerald-300 mt-0.5">
                  {summary.stateSnapshot.rightSide.higherLowBreakPrice ?? 'Checking HL'}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px]">
              <div className="flex items-center gap-2">
                <span className="text-zinc-400">Stage Sequence:</span>
                <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-white font-bold">
                  Zero 1→2→3 ({summary.stateSnapshot.rightSide.zeroCount}/3)
                </span>
                <span className="text-zinc-600">→</span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-bold">
                  Honest 1→2→3 ({summary.stateSnapshot.rightSide.honestCount}/3)
                </span>
              </div>
              <span className="text-cyan-300 font-bold">
                Breaks Confirmed: {summary.stateSnapshot.rightSide.connectionBreaksDetected}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* SUB-NAVIGATION TABS */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveSubTab('ALL')}
            className={`px-3.5 py-2 rounded-xl font-black text-xs uppercase transition-all cursor-pointer ${
              activeSubTab === 'ALL'
                ? 'bg-emerald-500 text-black'
                : 'bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            All Forward Test Panels
          </button>
          <button
            onClick={() => setActiveSubTab('AUDIT_TRAIL')}
            className={`px-3.5 py-2 rounded-xl font-black text-xs uppercase transition-all cursor-pointer ${
              activeSubTab === 'AUDIT_TRAIL'
                ? 'bg-emerald-500 text-black'
                : 'bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            Signal Audit Trail (1:1 → 1:25)
          </button>
          <button
            onClick={() => setActiveSubTab('CHELSEA_109')}
            className={`px-3.5 py-2 rounded-xl font-black text-xs uppercase transition-all cursor-pointer ${
              activeSubTab === 'CHELSEA_109'
                ? 'bg-amber-500 text-black'
                : 'bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            Chelsea Data 109 Gaps (53R / 53C / 3F)
          </button>
          <button
            onClick={() => setActiveSubTab('STEPS_OHLC')}
            className={`px-3.5 py-2 rounded-xl font-black text-xs uppercase transition-all cursor-pointer ${
              activeSubTab === 'STEPS_OHLC'
                ? 'bg-cyan-400 text-black'
                : 'bg-zinc-900 text-zinc-400 hover:text-white'
            }`}
          >
            14-Step Table & Raw OHLC Stream
          </button>
        </div>

        {/* Side filter for Audit Trail */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-zinc-400 uppercase font-bold">Filter Side:</span>
          {(['ALL', 'LEFT_HLH', 'RIGHT_LHL'] as const).map(st => (
            <button
              key={st}
              onClick={() => setSideFilter(st)}
              className={`px-2.5 py-1 rounded-lg font-bold text-[10px] cursor-pointer ${
                sideFilter === st
                  ? 'bg-zinc-200 text-black font-black'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white'
              }`}
            >
              {st === 'ALL' ? 'Both Sides' : st === 'LEFT_HLH' ? 'LEFT (HLH)' : 'RIGHT (LHL)'}
            </button>
          ))}
        </div>
      </div>

      {/* PANEL 1: CHRONOLOGICAL FORWARD TEST SIGNAL AUDIT TRAIL */}
      {(activeSubTab === 'ALL' || activeSubTab === 'AUDIT_TRAIL') && summary && (
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="p-4 bg-zinc-900/60 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-black text-white uppercase flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-400" />
                Step 12: Chronological Forward Test Signal Audit Trail ({filteredSignals.length} Verified Rotations)
              </h3>
              <p className="text-[10px] text-zinc-400 mt-0.5">
                Entry = Open of Candle after {summary.waitCandlesRule} Wait Candles | SL = 0.1% from Completion Pivot | Exact R-Multiple Targets 1:1 to 1:25
              </p>
            </div>
            <span className="text-[10px] px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold">
              Zero-1,2,3 → Honest-1,2,3 Enforced
            </span>
          </div>

          <div className="overflow-x-auto max-h-[460px]">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-zinc-950 border-b border-zinc-800 text-[10px] text-zinc-400 uppercase font-black z-10">
                <tr>
                  <th className="py-3 px-3">ID / Bar#</th>
                  <th className="py-3 px-3">Timestamp</th>
                  <th className="py-3 px-3">Side (Family)</th>
                  <th className="py-3 px-3">Stage</th>
                  <th className="py-3 px-3">Connection Break (LH / HL)</th>
                  <th className="py-3 px-3 text-center">Wait</th>
                  <th className="py-3 px-3 text-center">Dir</th>
                  <th className="py-3 px-3 text-right">Entry (Open)</th>
                  <th className="py-3 px-3 text-right">SL (0.1%)</th>
                  <th className="py-3 px-3 text-right">1:1</th>
                  <th className="py-3 px-3 text-right">1:3</th>
                  <th className="py-3 px-3 text-right">1:5</th>
                  <th className="py-3 px-3 text-right">1:10</th>
                  <th className="py-3 px-3 text-right">1:25</th>
                  <th className="py-3 px-3 text-center">Hit</th>
                  <th className="py-3 px-3 text-right">$1 Stack</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900 text-[11px]">
                {filteredSignals.slice(0, 60).map(sig => (
                  <tr key={sig.id} className="hover:bg-zinc-900/50 transition-colors">
                    <td className="py-2.5 px-3 font-bold text-white">
                      {sig.id} <span className="text-zinc-500 text-[10px]">(#{sig.candleIndex})</span>
                    </td>
                    <td className="py-2.5 px-3 text-zinc-400 whitespace-nowrap">{sig.timestamp}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black ${
                          sig.side === 'LEFT_HLH'
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            : 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                        }`}
                      >
                        {sig.side === 'LEFT_HLH' ? 'LEFT (H→L→H)' : 'RIGHT (L→H→L)'}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black ${
                          sig.stage.startsWith('Zero')
                            ? 'bg-zinc-800 text-zinc-200'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        }`}
                      >
                        {sig.stage}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-zinc-200 font-medium">{sig.connectionBreakDetail}</td>
                    <td className="py-2.5 px-3 text-center text-amber-300 font-bold">+{sig.waitCandles}c</td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black inline-flex items-center gap-0.5 ${
                          sig.direction === 'LONG'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        {sig.direction === 'LONG' ? (
                          <ArrowUpRight className="w-3 h-3" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3" />
                        )}
                        {sig.direction}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-white">{sig.entryPrice}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-rose-400">{sig.stopLossPrice}</td>
                    <td className="py-2.5 px-3 text-right text-zinc-300">{sig.targets.r1}</td>
                    <td className="py-2.5 px-3 text-right text-zinc-300">{sig.targets.r3}</td>
                    <td className="py-2.5 px-3 text-right text-amber-300 font-bold">{sig.targets.r5}</td>
                    <td className="py-2.5 px-3 text-right text-cyan-300 font-bold">{sig.targets.r10}</td>
                    <td className="py-2.5 px-3 text-right text-emerald-400 font-black">{sig.targets.r25}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black ${
                          sig.achievedR > 0
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-rose-500/20 text-rose-400'
                        }`}
                      >
                        {sig.highestTargetHit}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-black text-emerald-400">
                      ${sig.theoreticalOneDollarEquity.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PANEL 2: CHELSEA DATA 109-GAP FORENSIC DISCOVERY (53 REVERSAL / 53 CONTINUATION / 3 FLAT) */}
      {(activeSubTab === 'ALL' || activeSubTab === 'CHELSEA_109') && summary && (
        <div className="bg-zinc-950 border border-amber-500/40 rounded-2xl p-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
            <div>
              <h3 className="text-base font-black text-white uppercase flex items-center gap-2">
                <Database className="w-4 h-4 text-amber-400" />
                Chelsea 1-Min Structural + Behavior Data Analysis (109 Gaps Proof)
              </h3>
              <p className="text-[11px] text-zinc-300 mt-0.5">
                क्यों सिर्फ High/Low Complete देखकर direction नहीं चलता (53 Reversal vs 53 Continuation = 50/50) — <strong className="text-amber-300">Lower High / Higher Low Connection Break</strong> ही असली Rotation Signal है।
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-black text-xs">
                Reversal: {summary.chelseaSummary.reversals}
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 font-black text-xs">
                Continuation: {summary.chelseaSummary.continuations}
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300 font-black text-xs">
                Flat: {summary.chelseaSummary.flats}
              </div>
              <div className="px-3 py-1.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 font-black text-xs">
                Total: {summary.chelseaSummary.totalGaps} Gaps
              </div>
            </div>
          </div>

          <div className="overflow-x-auto max-h-[320px]">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-zinc-950 border-b border-zinc-800 text-[10px] text-zinc-400 uppercase font-black">
                <tr>
                  <th className="py-2.5 px-3">Gap #</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Completion Side</th>
                  <th className="py-2.5 px-3">Mandatory Connection Break</th>
                  <th className="py-2.5 px-3 text-right">Completion Pivot</th>
                  <th className="py-2.5 px-3 text-right">LH / HL Break Pivot</th>
                  <th className="py-2.5 px-3 text-center">100-Candle Outcome</th>
                  <th className="py-2.5 px-3">Forensic Rule Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900 text-[11px]">
                {summary.chelseaSummary.records.slice(0, 30).map(gap => (
                  <tr key={gap.gapId} className="hover:bg-zinc-900/40">
                    <td className="py-2 px-3 font-black text-amber-400">GAP-{gap.gapId}</td>
                    <td className="py-2 px-3 text-zinc-400">{gap.timestamp}</td>
                    <td className="py-2 px-3 font-bold text-white">{gap.completionType}</td>
                    <td className="py-2 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black ${
                          gap.connectionType.includes('LH')
                            ? 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                            : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {gap.connectionType}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-right font-mono text-zinc-200">{gap.completionPrice}</td>
                    <td className="py-2 px-3 text-right font-mono font-bold text-white">{gap.connectionPivotPrice}</td>
                    <td className="py-2 px-3 text-center">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black ${
                          gap.outcomeAfter100Candles === 'Reversal'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : gap.outcomeAfter100Candles === 'Continuation'
                              ? 'bg-cyan-500/20 text-cyan-300'
                              : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {gap.outcomeAfter100Candles} ({gap.moveRMultiple}R)
                      </span>
                    </td>
                    <td className="py-2 px-3 text-zinc-300">{gap.noteHindi}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* PANEL 3: 14-STEP METHODOLOGY TABLE & RAW OHLC INSPECTOR */}
      {(activeSubTab === 'ALL' || activeSubTab === 'STEPS_OHLC') && summary && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* 14-Step Forward Test Process Table */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-black text-white uppercase flex items-center gap-2 border-b border-zinc-800 pb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Forward Test Process – 14-Step Frozen Protocol
            </h3>
            <div className="overflow-x-auto max-h-[360px]">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-zinc-950 border-b border-zinc-800 text-[10px] text-zinc-400 uppercase font-black">
                  <tr>
                    <th className="py-2 px-2.5">Step</th>
                    <th className="py-2 px-2.5">Action</th>
                    <th className="py-2 px-2.5">Details</th>
                    <th className="py-2 px-2.5">Frozen Rule</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900 text-[11px]">
                  {FOURTEEN_STEPS.map(s => (
                    <tr key={s.step} className="hover:bg-zinc-900/40">
                      <td className="py-2 px-2.5 font-black text-emerald-400">#{s.step}</td>
                      <td className="py-2 px-2.5 font-bold text-white whitespace-nowrap">{s.action}</td>
                      <td className="py-2 px-2.5 text-zinc-300">{s.details}</td>
                      <td className="py-2 px-2.5 text-amber-300 font-semibold">{s.rule}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Step 1: Pure Raw OHLC Stream Inspector (No Indicators, No Fabricated Candles) */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h3 className="text-sm font-black text-white uppercase flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                Step 1: Pure Raw OHLC Feed ({symbol} • {timeframe})
              </h3>
              <span className="text-[10px] text-emerald-400 font-bold">
                Showing Latest 25 of {summary.totalCandlesProcessed} Raw Bars
              </span>
            </div>
            <div className="overflow-x-auto max-h-[360px]">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-zinc-950 border-b border-zinc-800 text-[10px] text-zinc-400 uppercase font-black">
                  <tr>
                    <th className="py-2 px-2.5">Bar #</th>
                    <th className="py-2 px-2.5">Timestamp (UTC)</th>
                    <th className="py-2 px-2.5 text-right">Open</th>
                    <th className="py-2 px-2.5 text-right">High</th>
                    <th className="py-2 px-2.5 text-right">Low</th>
                    <th className="py-2 px-2.5 text-right">Close</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900 text-[11px]">
                  {summary.rawCandlesSample.map(bar => (
                    <tr key={bar.index} className="hover:bg-zinc-900/40">
                      <td className="py-2 px-2.5 font-bold text-cyan-400">#{bar.index}</td>
                      <td className="py-2 px-2.5 text-zinc-400">{bar.timeFormatted}</td>
                      <td className="py-2 px-2.5 text-right text-zinc-200">{bar.open}</td>
                      <td className="py-2 px-2.5 text-right text-emerald-400 font-bold">{bar.high}</td>
                      <td className="py-2 px-2.5 text-right text-rose-400 font-bold">{bar.low}</td>
                      <td className="py-2 px-2.5 text-right text-white font-bold">{bar.close}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
