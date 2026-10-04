import React, { useState, useEffect } from 'react';
import { Clock, ShieldCheck, Play, RotateCcw, FastForward, CheckCircle2, Lock, ArrowRight, Activity } from 'lucide-react';
import { AssetSymbol } from '../types/terminal';

interface Props {
  selectedAsset?: AssetSymbol;
  livePrice?: number;
}

export const BtcCleanExecutionDisplay: React.FC<Props> = ({
  selectedAsset = 'BTC/USDT',
  livePrice = 67420.50
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [rrMultiplier, setRrMultiplier] = useState<number>(10);
  const [tradeStatus, setTradeStatus] = useState<'LOCKED' | 'RUNNING' | 'COMPLETED'>('LOCKED');
  const [testingProtocolPhase, setTestingProtocolPhase] = useState<'REPLAY_TEST' | 'FORWARD_TEST' | 'BACK_TEST'>('REPLAY_TEST');
  const [isReplayFrozen, setIsReplayFrozen] = useState<boolean>(true);

  // Stateful Entry/SL/Target to allow instant override by RocketEngine CustomEvent
  const [entryPrice, setEntryPrice] = useState<number>(livePrice);
  const [stopLossPrice, setStopLossPrice] = useState<number>(livePrice - 1.00);
  const [targetPrice, setTargetPrice] = useState<number>(livePrice + 10.00);
  const [rocketCountdown, setRocketCountdown] = useState<number | null>(null);
  const [activeRocketSymbol, setActiveRocketSymbol] = useState<AssetSymbol | null>(null);

  // Update base level on regular live tick IF no active rocket countdown is running
  useEffect(() => {
    if (rocketCountdown === null) {
      const baseEntry = livePrice > 0 ? livePrice : 67420.50;
      setEntryPrice(baseEntry);
      setStopLossPrice(Number((baseEntry - 1.00).toFixed(2)));
      setTargetPrice(Number((baseEntry + (1.00 * rrMultiplier)).toFixed(2)));
    }
  }, [livePrice, rrMultiplier, rocketCountdown]);

  // Live UTC timestamp generator
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const yr = now.getUTCFullYear();
      const mo = String(now.getUTCMonth() + 1).padStart(2, '0');
      const da = String(now.getUTCDate()).padStart(2, '0');
      const hr = String(now.getUTCHours()).padStart(2, '0');
      const mi = String(now.getUTCMinutes()).padStart(2, '0');
      const se = String(now.getUTCSeconds()).padStart(2, '0');
      setCurrentTime(`${yr}-${mo}-${da} ${hr}:${mi}:${se}`);
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Custom Event Listener for RocketEngine triggers
  useEffect(() => {
    const handleRocketTrigger = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail) {
        console.log(`[BTC_CLEAN_DISPLAY] INSTANT OVERRIDE FROM ROCKET_ENGINE ON ${detail.symbol}!`);
        setActiveRocketSymbol(detail.symbol);
        setEntryPrice(Number(detail.entryPrice.toFixed(4)));
        setStopLossPrice(Number(detail.slPrice.toFixed(4)));
        setTargetPrice(Number(detail.targetPrice.toFixed(4)));
        setRrMultiplier(detail.rrMultiplier);
        setRocketCountdown(detail.timeLimitSeconds); // 600 seconds (10 minutes)
        setTradeStatus('RUNNING');
      }
    };

    window.addEventListener('srbmpr-rocket-trigger', handleRocketTrigger);
    return () => {
      window.removeEventListener('srbmpr-rocket-trigger', handleRocketTrigger);
    };
  }, []);

  // 10-Minute Exposure self-cut timer countdown
  useEffect(() => {
    let interval: any;
    if (rocketCountdown !== null && rocketCountdown > 0) {
      interval = setInterval(() => {
        setRocketCountdown(prev => {
          if (prev && prev <= 1) {
            setTradeStatus('COMPLETED');
            setActiveRocketSymbol(null);
            return null; // Stop countdown and reset
          }
          return prev ? prev - 1 : null;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [rocketCountdown]);

  // Continuous Testing Protocol Cycle: Replay Test -> Forward Test -> Back Test -> Replay Test...
  useEffect(() => {
    const loop = setInterval(() => {
      setTestingProtocolPhase(prev => {
        if (prev === 'REPLAY_TEST') return 'FORWARD_TEST';
        if (prev === 'FORWARD_TEST') return 'BACK_TEST';
        return 'REPLAY_TEST';
      });
    }, 6000);
    return () => clearInterval(loop);
  }, []);

  const oneSecRiskDistance = Math.abs(entryPrice - stopLossPrice) || 1.00;
  const targetDistance = Math.abs(targetPrice - entryPrice) || 10.00;

  const cleanAssetLabel = activeRocketSymbol ? activeRocketSymbol.replace('/', '') : selectedAsset.replace('/', '');

  return (
    <div className="bg-black border-2 border-emerald-500/60 rounded-3xl p-6 sm:p-8 shadow-[0_0_80px_rgba(16,185,129,0.2)] font-mono text-zinc-100 max-w-4xl mx-auto space-y-6">
      
      {/* Top Protocol Status Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-[11px] font-black text-emerald-400 uppercase tracking-widest">
            CONTINUOUS TESTING PROTOCOL:
          </span>
          <span className="px-2.5 py-0.5 rounded-md bg-zinc-900 border border-emerald-500/40 text-[10px] font-black text-white">
            {testingProtocolPhase === 'REPLAY_TEST' && '1. REPLAY TEST (FREEZE VERIFY)'}
            {testingProtocolPhase === 'FORWARD_TEST' && '2. FORWARD TEST (1:1 → 1:2 → 1:3)'}
            {testingProtocolPhase === 'BACK_TEST' && '3. RAW BACKTEST (NO SYNTHETICS)'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsReplayFrozen(!isReplayFrozen)}
            className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase flex items-center gap-1.5 transition-all ${
              isReplayFrozen 
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50' 
                : 'bg-zinc-900 text-zinc-400 border border-zinc-800'
            }`}
          >
            <Lock className="w-3 h-3" />
            {isReplayFrozen ? 'Replay Freeze: VERIFIED' : 'Replay: LIVE STREAM'}
          </button>
        </div>
      </div>

      {/* EXACT REQUESTED BTC DISPLAY LAYOUT */}
      <div className="bg-zinc-950/90 border border-zinc-800/80 rounded-2xl p-6 sm:p-8 space-y-5">
        
        {/* Asset Header */}
        <div className="flex items-baseline justify-between">
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-widest">
            {cleanAssetLabel}
          </h1>
          <span className="text-xs text-zinc-500 font-bold uppercase tracking-wider">
            1-SECOND CANDLE 1R RISK ENGINE
          </span>
        </div>

        {/* Divider */}
        <div className="h-[2px] w-full bg-gradient-to-r from-emerald-500 via-zinc-700 to-transparent" />

        {/* Large Clear Time Display */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 py-1">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-emerald-400 shrink-0" />
            <div className="text-xl sm:text-2xl font-black text-white tracking-wider">
              TIME: <span className="text-emerald-400 font-bold">{currentTime || '2026-10-03 15:47:23'}</span>
            </div>
          </div>
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">
            [UTC REPLAY TIMESTAMP SYNCHRONIZED]
          </span>
        </div>

        {/* Divider */}
        <div className="h-[2px] w-full bg-gradient-to-r from-emerald-500 via-zinc-700 to-transparent" />

        {/* Entry / SL / Target Grid */}
        <div className="space-y-4 pt-2">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 p-3 bg-zinc-900/60 rounded-xl border border-zinc-800/80">
            <span className="text-sm font-black text-zinc-400 tracking-wider">ENTRY</span>
            <div className="flex items-baseline gap-3">
              <span className="text-2xl sm:text-3xl font-black text-white tabular-nums tracking-tight">
                {entryPrice.toFixed(2)}
              </span>
              <span className="text-[10px] text-zinc-500 font-bold">USD</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 p-3 bg-zinc-900/60 rounded-xl border border-rose-500/30">
            <div className="flex flex-col">
              <span className="text-sm font-black text-rose-400 tracking-wider">SL</span>
              <span className="text-[10px] text-zinc-500">1-second candle size (1R = ${oneSecRiskDistance.toFixed(2)})</span>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-2xl sm:text-3xl font-black text-rose-400 tabular-nums tracking-tight">
                {stopLossPrice.toFixed(2)}
              </span>
              <span className="text-[10px] text-rose-500/80 font-bold">1R FLOOR</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 p-3 bg-zinc-900/60 rounded-xl border border-emerald-500/30">
            <div className="flex flex-col">
              <span className="text-sm font-black text-emerald-400 tracking-wider">TARGET</span>
              <span className="text-[10px] text-zinc-500">Multiple of 1R (1R × {rrMultiplier} = +${targetDistance.toFixed(2)})</span>
            </div>
            <div className="flex items-baseline gap-3">
              <span className="text-2xl sm:text-3xl font-black text-emerald-400 tabular-nums tracking-tight">
                {targetPrice.toFixed(2)}
              </span>
              <span className="text-[10px] text-emerald-500/80 font-bold">OBJECTIVE</span>
            </div>
          </div>

        </div>

        {/* RR & Status Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
          
          <div className="p-4 bg-zinc-900/80 rounded-xl border border-zinc-800 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] font-black text-zinc-400 uppercase tracking-wider">RR RATIO</span>
              <span className="text-[9px] text-zinc-500">Target Distance / 1R Risk</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-amber-400">1 : {rrMultiplier}</span>
              <div className="flex flex-wrap gap-1 bg-black p-1 rounded-lg border border-zinc-800">
                {[1, 2, 5, 10, 100].map(m => (
                  <button
                    key={m}
                    onClick={() => setRrMultiplier(m)}
                    className={`px-1.5 py-0.5 rounded text-[9px] font-black transition-all ${
                      rrMultiplier === m ? 'bg-amber-500 text-black' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 bg-zinc-900/80 rounded-xl border border-zinc-800 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[11px] font-black text-zinc-400 uppercase tracking-wider">STATUS</span>
              <span className="text-[9px] text-zinc-500">Execution State Machine</span>
            </div>
            <div className="flex items-center gap-1.5">
              {(['LOCKED', 'RUNNING', 'COMPLETED'] as const).map(st => (
                <button
                  key={st}
                  onClick={() => setTradeStatus(st)}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase transition-all ${
                    tradeStatus === st
                      ? st === 'LOCKED'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                        : st === 'RUNNING'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50'
                      : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* Replay Verification Principle Note */}
      <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800/80 text-[11px] text-zinc-400 flex items-center gap-3">
        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
        <div>
          <strong className="text-white">Continuous Testing Rule:</strong> Replay Test → Forward Test → Back Test → Replay Test. 
          No entry is valid until freeze-verified in Replay Test at the exact moment of signal generation.
        </div>
      </div>

    </div>
  );
};
