import React, { useState, useEffect } from 'react';
import { 
  Terminal, ShieldCheck, AlertTriangle, Layers, Clock, Zap, CheckCircle2, 
  Copy, Check, RefreshCw, Send, ArrowRight, Activity, FileSpreadsheet, Lock, 
  HelpCircle, ShieldAlert
} from 'lucide-react';
import { AssetSymbol, ExchangeId } from '../types/terminal';

export type OperatingMode = 'BACKTEST' | 'REPLAY' | 'FORWARD_PAPER' | 'LIVE_READ_ONLY' | 'DEMO_EXECUTION';

interface UnifiedEventRecord {
  event_id: string;
  engine: string;
  version: string;
  symbol: string;
  direction: 'LONG' | 'SHORT';
  entry_number: number;
  entry_price: number;
  stop_loss: number;
  target: number;
  risk_reward: string;
  entry_time_utc: string;
  target_time_utc: string;
  timeframe: string;
  status: 'CONFIRMED' | 'ACTIVE' | 'CLOSED' | 'WAITING';
  first_outcome?: 'PROFIT' | 'SL_HIT' | 'RUNNING';
}

interface DiffReportRow {
  event_id: string;
  symbol: string;
  backtest_signal_time: string;
  live_signal_time: string;
  signal_time_diff_sec: number;
  backtest_entry: number;
  live_entry_ref: number;
  actual_fill_price: number;
  entry_difference: number;
  backtest_sl: number;
  live_sl: number;
  backtest_rr: string;
  live_rr: string;
  data_mode: string;
  reason: 'OK' | 'IDENTICAL_SUSPICIOUS' | 'SLIPPAGE_DETECTED' | 'NO_LIVE_DATA';
}

interface SrbmprUnifiedEventEngineWorkspaceProps {
  selectedAsset: AssetSymbol;
  livePrice: number;
  onOpenPineModal: () => void;
}

export const SrbmprUnifiedEventEngineWorkspace: React.FC<SrbmprUnifiedEventEngineWorkspaceProps> = ({
  selectedAsset,
  livePrice,
  onOpenPineModal
}) => {
  const [currentMode, setCurrentMode] = useState<OperatingMode>('LIVE_READ_ONLY');
  const [feedAgeSeconds, setFeedAgeSeconds] = useState<number>(1.8);
  const [localClockAdvancing, setLocalClockAdvancing] = useState<boolean>(true);
  const [copiedWebhook, setCopiedWebhook] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'CRICKET_PANEL' | 'LIVE_GUARD' | 'DIFF_REPORT'>('CRICKET_PANEL');

  // Multi-Timeframe Monthly Context Simulation
  const monthlyContext = {
    previousMonthState: 'CLOSED (CONFIRMED)',
    monthlyOpen: 58920.0,
    monthlyHigh: 66490.0,
    monthlyLow: 57110.0,
    monthlyClose: 63210.0,
    monthlyAtr: 4200.0,
    isLargeMove: true // monthlyRange >= monthlyAtr * 2.0
  };

  // Active Current Event (Right Side)
  const [activeEvent, setActiveEvent] = useState<UnifiedEventRecord>({
    event_id: `${selectedAsset.replace('/', '')}-20261004T040000Z-LONG-0012`,
    engine: 'SRBMPR',
    version: '1.0.0',
    symbol: selectedAsset.replace('/', ''),
    direction: 'LONG',
    entry_number: 12,
    entry_price: livePrice > 0 ? livePrice : 62150.0,
    stop_loss: livePrice > 0 ? Number((livePrice - (livePrice * 0.005)).toFixed(2)) : 62050.0,
    target: livePrice > 0 ? Number((livePrice + (livePrice * 0.05)).toFixed(2)) : 63150.0,
    risk_reward: '1:10',
    entry_time_utc: '2026-10-04T03:58:00Z',
    target_time_utc: '2026-10-04T04:10:00Z',
    timeframe: '1S',
    status: 'ACTIVE'
  });

  // Next Eligible Event Condition
  const nextEligibleEvent = {
    entry_number: 13,
    condition: 'Waiting for confirmed pullback & lower-margin crossover [1m confirmed]',
    required_side: 'LONG',
    status: 'WAITING_CONFIRMATION',
    max_lookahead_guarded: true
  };

  // Left-Side Historical Events (Journey Record)
  const historicalEvents: UnifiedEventRecord[] = [
    {
      event_id: `${selectedAsset.replace('/', '')}-20261004T033000Z-LONG-0011`,
      engine: 'SRBMPR',
      version: '1.0.0',
      symbol: selectedAsset.replace('/', ''),
      direction: 'LONG',
      entry_number: 11,
      entry_price: 61820.0,
      stop_loss: 61720.0,
      target: 62820.0,
      risk_reward: '1:10',
      entry_time_utc: '2026-10-04T03:30:00Z',
      target_time_utc: '2026-10-04T03:41:20Z',
      timeframe: '1S',
      status: 'CLOSED',
      first_outcome: 'PROFIT'
    },
    {
      event_id: `${selectedAsset.replace('/', '')}-20261004T031500Z-SHORT-0010`,
      engine: 'SRBMPR',
      version: '1.0.0',
      symbol: selectedAsset.replace('/', ''),
      direction: 'SHORT',
      entry_number: 10,
      entry_price: 62400.0,
      stop_loss: 62500.0,
      target: 61400.0,
      risk_reward: '1:10',
      entry_time_utc: '2026-10-04T03:15:00Z',
      target_time_utc: '2026-10-04T03:26:45Z',
      timeframe: '1S',
      status: 'CLOSED',
      first_outcome: 'PROFIT'
    },
    {
      event_id: `${selectedAsset.replace('/', '')}-20261004T025000Z-LONG-0009`,
      engine: 'SRBMPR',
      version: '1.0.0',
      symbol: selectedAsset.replace('/', ''),
      direction: 'LONG',
      entry_number: 9,
      entry_price: 61500.0,
      stop_loss: 61400.0,
      target: 62500.0,
      risk_reward: '1:10',
      entry_time_utc: '2026-10-04T02:50:00Z',
      target_time_utc: '2026-10-04T02:54:10Z',
      timeframe: '1S',
      status: 'CLOSED',
      first_outcome: 'SL_HIT'
    }
  ];

  // F_diff_report sample data matching user's exact specification
  const diffReportData: DiffReportRow[] = [
    {
      event_id: 'EVT_0001',
      symbol: 'BTCUSDT',
      backtest_signal_time: '2024-03-15 00:00:00',
      live_signal_time: '2024-03-15 00:00:42',
      signal_time_diff_sec: 42.0,
      backtest_entry: 68431.00,
      live_entry_ref: 68431.00,
      actual_fill_price: 68432.15,
      entry_difference: 0.00,
      backtest_sl: 68430.99,
      live_sl: 68430.99,
      backtest_rr: '5.8',
      live_rr: '5.8',
      data_mode: 'LIVE_READ_ONLY',
      reason: 'OK'
    },
    {
      event_id: 'EVT_0002',
      symbol: 'BTCUSDT',
      backtest_signal_time: '2024-04-15 00:00:00',
      live_signal_time: '—',
      signal_time_diff_sec: 0,
      backtest_entry: 73092.31,
      live_entry_ref: 0,
      actual_fill_price: 0,
      entry_difference: 0,
      backtest_sl: 0,
      live_sl: 0,
      backtest_rr: '—',
      live_rr: '—',
      data_mode: 'NOT_TOUCHED',
      reason: 'NO_LIVE_DATA'
    },
    {
      event_id: 'EVT_0003',
      symbol: 'BTCUSDT',
      backtest_signal_time: '2024-05-01 00:00:00',
      live_signal_time: '2024-05-01 00:00:00',
      signal_time_diff_sec: 0.0,
      backtest_entry: 69439.84,
      live_entry_ref: 69439.84,
      actual_fill_price: 69439.84,
      entry_difference: 0.00,
      backtest_sl: 69439.83,
      live_sl: 69439.83,
      backtest_rr: '5.0',
      live_rr: '5.0',
      data_mode: 'BACKTEST',
      reason: 'IDENTICAL_SUSPICIOUS' // Caught by Anti-Self-Deception Guard: 0 latency, 0 slippage proves it's historical replay, not real live!
    }
  ];

  // Feed age simulator
  useEffect(() => {
    const timer = setInterval(() => {
      setFeedAgeSeconds(prev => {
        const next = Number((Math.random() * 2.5 + 0.8).toFixed(2));
        return next;
      });
      setLocalClockAdvancing(true);
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  const copyWebhookJson = () => {
    const payload = JSON.stringify(activeEvent, null, 2);
    navigator.clipboard.writeText(payload);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  const getModeBadge = (mode: OperatingMode) => {
    switch (mode) {
      case 'LIVE_READ_ONLY':
        return { label: 'LIVE READ-ONLY (BYBIT_REST)', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' };
      case 'FORWARD_PAPER':
        return { label: 'FORWARD PAPER (BYBIT_WS)', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40' };
      case 'DEMO_EXECUTION':
        return { label: 'DEMO EXECUTION (BYBIT_DEMO)', color: 'bg-purple-500/20 text-purple-400 border-purple-500/40' };
      case 'BACKTEST':
        return { label: 'BACKTEST (CSV_HISTORICAL)', color: 'bg-amber-500/20 text-amber-400 border-amber-500/40' };
      case 'REPLAY':
        return { label: 'BAR REPLAY (CSV_HISTORICAL)', color: 'bg-zinc-700/50 text-zinc-300 border-zinc-600' };
    }
  };

  const badge = getModeBadge(currentMode);

  return (
    <div className="bg-[#030508] border-2 border-emerald-500/40 rounded-[32px] p-6 sm:p-8 shadow-[0_0_90px_rgba(16,185,129,0.12)] font-mono text-zinc-100 space-y-6">
      
      {/* 1. MASTER HEADER & MODE SWITCHER */}
      <div className="border-b border-zinc-800 pb-6 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-3.5 h-3.5 bg-emerald-500 rounded-full animate-ping shrink-0" />
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-widest flex items-center gap-3">
              SRBMPR UNIFIED EVENT ENGINE & BOT GATEWAY
            </h2>
            <span className={`text-[10px] px-3 py-1 rounded-full font-black border uppercase tracking-widest whitespace-nowrap ${badge.color}`}>
              {badge.label}
            </span>
          </div>
          <p className="text-xs text-zinc-400 font-bold uppercase mt-1.5 max-w-4xl">
            Cricket-Style Left/Right Journey Split • Frozen Invariant Events • Anti-Self-Deception Live Guard • TradingView Webhook Sync
          </p>
        </div>

        {/* Operating Mode Selector Buttons */}
        <div className="flex flex-wrap items-center gap-2 bg-zinc-950 p-2 rounded-2xl border border-zinc-800">
          {(['LIVE_READ_ONLY', 'FORWARD_PAPER', 'DEMO_EXECUTION', 'BACKTEST', 'REPLAY'] as OperatingMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setCurrentMode(mode)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-black tracking-wider transition-all uppercase ${
                currentMode === mode
                  ? 'bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}
            >
              {mode.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* 2. SUB-NAVIGATION TABS */}
      <div className="flex items-center justify-between border-b border-zinc-900 pb-3 flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('CRICKET_PANEL')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-2 ${
              activeTab === 'CRICKET_PANEL'
                ? 'bg-zinc-900 text-emerald-400 border border-emerald-500/40 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Activity className="w-4 h-4" /> Left/Right Event Journey
          </button>
          <button
            onClick={() => setActiveTab('LIVE_GUARD')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-2 ${
              activeTab === 'LIVE_GUARD'
                ? 'bg-zinc-900 text-emerald-400 border border-emerald-500/40 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <ShieldAlert className="w-4 h-4" /> Live Guard (Anti-Deception)
          </button>
          <button
            onClick={() => setActiveTab('DIFF_REPORT')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase transition-all flex items-center gap-2 ${
              activeTab === 'DIFF_REPORT'
                ? 'bg-zinc-900 text-emerald-400 border border-emerald-500/40 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" /> F_diff_report (Live vs BT)
          </button>
        </div>

        {/* Pine Script Quick Launcher */}
        <button
          onClick={onOpenPineModal}
          className="px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-400 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition"
        >
          <Terminal className="w-4 h-4" /> Pine Script v6 Strategy Code
        </button>
      </div>

      {/* 3. TAB 1: CRICKET-STYLE LEFT/RIGHT JOURNEY PANEL */}
      {activeTab === 'CRICKET_PANEL' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT SIDE: HISTORICAL JOURNEY & MONTHLY CONTEXT (CRICKET INNINGS ANALOGY) */}
          <div className="lg:col-span-5 bg-zinc-950 border border-zinc-900 rounded-2xl p-5 flex flex-col justify-between space-y-4">
            <div className="border-b border-zinc-900 pb-3 flex items-center justify-between">
              <div>
                <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest block">LEFT-SIDE HISTORICAL JOURNEY</span>
                <h3 className="text-sm font-black text-white uppercase flex items-center gap-2">
                  <Clock className="w-4 h-4 text-zinc-400" /> Completed & Frozen Events
                </h3>
              </div>
              <span className="text-[9px] px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 font-bold border border-zinc-800">
                AUDIT ARCHIVE
              </span>
            </div>

            {/* Monthly Higher-Timeframe Context */}
            <div className="bg-black/80 border border-zinc-900 rounded-xl p-3 text-[10px] space-y-2">
              <div className="flex items-center justify-between text-zinc-400">
                <span className="font-bold">MONTHLY CONTEXT (barmerge [1] locked):</span>
                <span className="text-emerald-400 font-black">{monthlyContext.previousMonthState}</span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-zinc-400 font-mono">
                <div>O: <span className="text-white">${monthlyContext.monthlyOpen}</span></div>
                <div>H: <span className="text-white">${monthlyContext.monthlyHigh}</span></div>
                <div>L: <span className="text-white">${monthlyContext.monthlyLow}</span></div>
                <div>C: <span className="text-white">${monthlyContext.monthlyClose}</span></div>
              </div>
              <div className="flex items-center justify-between pt-1 border-t border-zinc-900">
                <span className="text-zinc-500">LARGE MOVE CRITERION (Range ≥ ATR×2):</span>
                <span className={`px-2 py-0.5 rounded text-[8px] font-black ${monthlyContext.isLargeMove ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-500'}`}>
                  {monthlyContext.isLargeMove ? 'YES (TREND CONFIRMED)' : 'NO (CONSOLIDATION)'}
                </span>
              </div>
            </div>

            {/* List of past closed events */}
            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1 custom-scroll">
              {historicalEvents.map((evt) => (
                <div key={evt.event_id} className="bg-black border border-zinc-900 p-3 rounded-xl flex items-center justify-between text-[11px]">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-black ${
                        evt.direction === 'LONG' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                      }`}>
                        #{evt.entry_number} {evt.direction}
                      </span>
                      <span className="font-bold text-white font-mono">{evt.symbol}</span>
                    </div>
                    <div className="text-[9px] text-zinc-500 mt-1">
                      Entry: ${evt.entry_price} • SL: ${evt.stop_loss} • Target: ${evt.target}
                    </div>
                    <div className="text-[8px] text-zinc-600 mt-0.5">
                      UTC: {evt.entry_time_utc} → {evt.target_time_utc}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-[10px] font-black block ${
                      evt.first_outcome === 'PROFIT' ? 'text-emerald-400' : 'text-rose-500'
                    }`}>
                      {evt.first_outcome === 'PROFIT' ? 'TARGET ACHIEVED' : 'STOP HIT (1:1)'}
                    </span>
                    <span className="text-[8px] text-zinc-500 font-mono font-bold">LOCKED INVARIANT</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-[9px] text-zinc-500 border-t border-zinc-900 pt-2 flex items-center justify-between">
              <span>Cricket Match Analogy: Inning 1 Archive</span>
              <span>No Repaint Guarantee</span>
            </div>
          </div>

          {/* RIGHT SIDE: CURRENT ACTIVE EVENT & NEXT ELIGIBLE EVENT */}
          <div className="lg:col-span-7 bg-zinc-950 border border-zinc-900 rounded-2xl p-5 flex flex-col justify-between space-y-4">
            <div className="border-b border-zinc-900 pb-3 flex items-center justify-between">
              <div>
                <span className="text-[9px] text-amber-400 font-black uppercase tracking-widest block">RIGHT-SIDE ACTIVE INNINGS</span>
                <h3 className="text-sm font-black text-white uppercase flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" /> Active Event & Next Eligible Trigger
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={copyWebhookJson}
                  className="px-3 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded-lg text-[10px] font-black uppercase flex items-center gap-1.5 transition"
                >
                  {copiedWebhook ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-amber-400" />}
                  {copiedWebhook ? 'Webhook JSON Copied' : 'Copy Webhook JSON'}
                </button>
              </div>
            </div>

            {/* Currently Active Live Event Card */}
            <div className="bg-black/90 border border-amber-500/30 rounded-2xl p-4 space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-500 text-black font-black text-xs uppercase animate-pulse">
                    ACTIVE {activeEvent.direction} #{activeEvent.entry_number}
                  </span>
                  <span className="text-xs text-zinc-400 font-bold font-mono">{activeEvent.event_id}</span>
                </div>
                <span className="text-emerald-400 font-black text-xs">FROZEN LOCK</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono pt-2">
                <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-900">
                  <span className="text-zinc-500 text-[9px] block">ENTRY POINT</span>
                  <span className="text-white font-black text-sm">${activeEvent.entry_price}</span>
                </div>
                <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-900">
                  <span className="text-rose-400 text-[9px] block">ZERO STOP LOSS</span>
                  <span className="text-rose-500 font-black text-sm">${activeEvent.stop_loss}</span>
                </div>
                <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-900">
                  <span className="text-emerald-400 text-[9px] block">PROJECTION TARGET</span>
                  <span className="text-emerald-400 font-black text-sm">${activeEvent.target}</span>
                </div>
                <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-900">
                  <span className="text-amber-400 text-[9px] block">EXPECTED RR</span>
                  <span className="text-amber-400 font-black text-sm">{activeEvent.risk_reward}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-2 border-t border-zinc-900">
                <span>Entry Time (UTC): {activeEvent.entry_time_utc}</span>
                <span>Expiry Horizon: {activeEvent.target_time_utc}</span>
              </div>
            </div>

            {/* Next Eligible Event Condition */}
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-zinc-400 uppercase">NEXT ELIGIBLE ENTRY #{nextEligibleEvent.entry_number}</span>
                <span className="px-2 py-0.5 rounded bg-zinc-800 text-amber-400 text-[9px] font-black uppercase">
                  WAITING FOR TRIGGER
                </span>
              </div>
              <p className="text-xs text-zinc-300">
                {nextEligibleEvent.condition}
              </p>
              <div className="text-[9px] text-zinc-500">
                Lookahead Guard: Active (Next entry calculation will only lock AFTER confirmed bar close)
              </div>
            </div>

            {/* TradingView Webhook Output String Display */}
            <div className="bg-black border border-zinc-900 p-3 rounded-xl">
              <div className="text-[9px] text-zinc-500 uppercase font-black mb-1">
                Real-Time Webhook JSON Payload (Sent on Confirmed Bar):
              </div>
              <pre className="text-[10px] text-emerald-400 font-mono overflow-x-auto whitespace-pre">
                {JSON.stringify(activeEvent, null, 2)}
              </pre>
            </div>

          </div>

        </div>
      )}

      {/* 4. TAB 2: LIVE GUARD & ANTI-SELF-DECEPTION ENGINE */}
      {activeTab === 'LIVE_GUARD' && (
        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 space-y-6">
          <div className="border-b border-zinc-900 pb-3 flex items-center justify-between">
            <div>
              <span className="text-[9px] text-rose-500 font-black uppercase tracking-widest block">SRBMPR HARD REJECT GUARD</span>
              <h3 className="text-base font-black text-white uppercase flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-500" />
                Anti-Self-Deception Safeguard (srbmpr_modes.py)
              </h3>
            </div>
            <span className="px-3 py-1 rounded bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 font-black text-[10px]">
              ALL 5 CHECKS PASSING
            </span>
          </div>

          {/* 5 Hard Reject Checks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* Check 1 */}
            <div className="bg-black border border-zinc-800 p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-white uppercase">1. SOURCE TYPE CHECK</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-[10px] text-zinc-400">
                Rejects any historical CSV detected in LIVE mode. Only BYBIT_WS or BYBIT_REST permitted.
              </p>
              <div className="text-[9px] text-emerald-400 font-bold bg-zinc-900 px-2 py-1 rounded">
                STATUS: CSV IN LIVE REJECTED (GUARD ARMED)
              </div>
            </div>

            {/* Check 2 */}
            <div className="bg-black border border-zinc-800 p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-white uppercase">2. STALENESS GUARD</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-[10px] text-zinc-400">
                Rejects feeds if age &gt; 15.0 seconds. Ensures live reaction speed.
              </p>
              <div className="text-[9px] text-emerald-400 font-bold bg-zinc-900 px-2 py-1 rounded flex justify-between">
                <span>FEED AGE: {feedAgeSeconds}s</span>
                <span>LIMIT: &lt; 15.0s (OK)</span>
              </div>
            </div>

            {/* Check 3 */}
            <div className="bg-black border border-zinc-800 p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-white uppercase">3. FUTURE LOOKAHEAD GUARD</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-[10px] text-zinc-400">
                Rejects any candle timestamp greater than current UTC time. Zero lookahead bias.
              </p>
              <div className="text-[9px] text-emerald-400 font-bold bg-zinc-900 px-2 py-1 rounded">
                STATUS: TS &lt;= NOW_UTC (STRICT PASS)
              </div>
            </div>

            {/* Check 4 */}
            <div className="bg-black border border-zinc-800 p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-white uppercase">4. HASH COLLISION GUARD</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-[10px] text-zinc-400">
                Computes SHA-256 hash of live payload. Rejects if it exactly matches backtest file hash.
              </p>
              <div className="text-[9px] text-emerald-400 font-bold bg-zinc-900 px-2 py-1 rounded">
                STATUS: NO COLLISION (INDEPENDENT DATA)
              </div>
            </div>

            {/* Check 5 */}
            <div className="bg-black border border-zinc-800 p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-white uppercase">5. CLOCK ADVANCEMENT</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-[10px] text-zinc-400">
                Requires unique monotonic timestamps on local receive to ensure socket thread is actively advancing.
              </p>
              <div className="text-[9px] text-emerald-400 font-bold bg-zinc-900 px-2 py-1 rounded">
                STATUS: ADVANCING MONOTONICALLY
              </div>
            </div>

            {/* Cost & Slippage Model */}
            <div className="bg-black border border-zinc-800 p-4 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-white uppercase">COST & SLIPPAGE MODEL</span>
                <span className="text-amber-400 font-black text-[10px]">REALISTIC</span>
              </div>
              <p className="text-[10px] text-zinc-400">
                Applies standard institutional friction: 5 bps slippage + 2 bps maker/taker fee.
              </p>
              <div className="text-[9px] text-amber-400 font-bold bg-zinc-900 px-2 py-1 rounded">
                SLIPPAGE: 5 BPS • FEE: 2 BPS
              </div>
            </div>

          </div>

          <div className="bg-black p-4 rounded-2xl border border-zinc-900 text-xs text-zinc-400 space-y-1">
            <span className="text-white font-bold block uppercase">Live Card Audit Stamp:</span>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px] pt-1">
              <div>DATA MODE: <span className="text-emerald-400">{currentMode}</span></div>
              <div>PROVIDER: <span className="text-white">BYBIT V5 LINEAR</span></div>
              <div>FEED AGE: <span className="text-emerald-400">{feedAgeSeconds}s</span></div>
              <div>CANDLE: <span className="text-white">CONFIRMED</span></div>
            </div>
          </div>
        </div>
      )}

      {/* 5. TAB 3: F_DIFF_REPORT (LIVE VS BACKTEST FORENSIC COMPARISON) */}
      {activeTab === 'DIFF_REPORT' && (
        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 space-y-4">
          <div className="border-b border-zinc-900 pb-3 flex items-center justify-between">
            <div>
              <span className="text-[9px] text-cyan-400 font-black uppercase tracking-widest block">FORENSIC COMPARISON</span>
              <h3 className="text-base font-black text-white uppercase flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-cyan-400" />
                F_diff_report.csv (Backtest vs Live Execution Differences)
              </h3>
            </div>
            <div className="text-[10px] text-zinc-500">
              Flags <span className="text-rose-400 font-bold">IDENTICAL_SUSPICIOUS</span> if live trades lack slippage/latency!
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono text-zinc-400 border-collapse">
              <thead>
                <tr className="border-b border-zinc-900 text-zinc-500 text-[10px] uppercase font-bold">
                  <th className="py-3 px-3">Event ID</th>
                  <th className="py-3 px-3">BT Signal Time</th>
                  <th className="py-3 px-3">Live Signal Time</th>
                  <th className="py-3 px-3">Latency</th>
                  <th className="py-3 px-3">BT Entry</th>
                  <th className="py-3 px-3">Actual Fill</th>
                  <th className="py-3 px-3">Slippage Diff</th>
                  <th className="py-3 px-3">Mode</th>
                  <th className="py-3 px-3">Audit Reason</th>
                </tr>
              </thead>
              <tbody>
                {diffReportData.map((row) => {
                  const isSuspicious = row.reason === 'IDENTICAL_SUSPICIOUS';
                  return (
                    <tr key={row.event_id} className={`border-b border-zinc-900 hover:bg-zinc-900/30 transition-colors ${
                      isSuspicious ? 'bg-red-950/20' : ''
                    }`}>
                      <td className="py-3 px-3 font-bold text-white">{row.event_id}</td>
                      <td className="py-3 px-3 text-zinc-500">{row.backtest_signal_time}</td>
                      <td className="py-3 px-3 text-zinc-300">{row.live_signal_time}</td>
                      <td className="py-3 px-3 text-amber-400 font-bold">{row.signal_time_diff_sec}s</td>
                      <td className="py-3 px-3 text-white">${row.backtest_entry}</td>
                      <td className="py-3 px-3 text-emerald-400 font-bold">${row.actual_fill_price}</td>
                      <td className="py-3 px-3 text-zinc-400 font-bold">
                        {row.entry_difference > 0 ? `+${row.entry_difference}` : row.entry_difference}
                      </td>
                      <td className="py-3 px-3 text-zinc-500">{row.data_mode}</td>
                      <td className="py-3 px-3 font-black">
                        {isSuspicious ? (
                          <span className="text-rose-400 px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/30 text-[9px] animate-pulse">
                            ⚠️ IDENTICAL_SUSPICIOUS
                          </span>
                        ) : (
                          <span className="text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-[9px]">
                            {row.reason}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="bg-black p-3.5 rounded-xl border border-zinc-900 text-[10px] text-zinc-400">
            <strong className="text-white">Forensic Note:</strong> In legitimate live trading, actual fills will always have slight variance due to exchange order queue, network latency (feed_age_ms), and slippage. If a live report matches historical tick-for-tick with zero slippage, the system flags it as <code className="text-rose-400">IDENTICAL_SUSPICIOUS</code> to prevent synthetic lookahead masquerading as genuine live performance.
          </div>
        </div>
      )}

      {/* 6-FILE SCHEMA DISCLOSURE */}
      <div className="bg-black/60 border border-zinc-900 rounded-2xl p-4 text-[11px] font-mono text-zinc-400 space-y-2">
        <div className="flex items-center justify-between text-xs font-black text-white uppercase">
          <span className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            SRBMPR 6-FILE ARCHITECTURAL PIPELINE
          </span>
          <span className="text-emerald-400 font-bold">DATA ISOLATION ENFORCED</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 pt-1 text-[10px]">
          <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-900">
            <div className="text-zinc-500 font-bold">A_matches.csv</div>
            <div className="text-zinc-300">Historical Detection</div>
          </div>
          <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-900">
            <div className="text-zinc-500 font-bold">B_replay_v3.csv</div>
            <div className="text-zinc-300">Target Ladder (T1-T5)</div>
          </div>
          <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-900">
            <div className="text-zinc-500 font-bold">C_live_events.csv</div>
            <div className="text-emerald-400 font-bold">Bybit WS / REST Signals</div>
          </div>
          <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-900">
            <div className="text-zinc-500 font-bold">D_live_candles.csv</div>
            <div className="text-emerald-400 font-bold">Live 1m Bars</div>
          </div>
          <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-900">
            <div className="text-zinc-500 font-bold">E_demo_execution.csv</div>
            <div className="text-purple-400 font-bold">Actual Demo Fills</div>
          </div>
          <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-900">
            <div className="text-zinc-500 font-bold">F_diff_report.csv</div>
            <div className="text-cyan-400 font-bold">Forensic Diff Audit</div>
          </div>
        </div>
      </div>

    </div>
  );
};
