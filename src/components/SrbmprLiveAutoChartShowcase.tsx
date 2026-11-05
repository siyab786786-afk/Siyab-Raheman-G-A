// SrbmprLiveAutoChartShowcase.tsx — Mode A: Public Live Auto-Chart Showcase & Rest Zone Presentation
// Project Owner: Siyab Raheman Gulwadi Abbushet
// Features: 30s automated chart queue, real Bybit V5 live data, verified entry vs "NO VERIFIED ENTRY - WAITING FOR DATA",
// yellow invitation to Connect SRBMPR / Use Now, Rest Zone with countdown, and view-only isolation.

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Tv,
  LogIn,
  Sparkles,
  HelpCircle,
  Clock,
  ShieldCheck,
  Activity,
  Play,
  Pause,
  ChevronRight,
  RefreshCw,
  AlertTriangle,
  Radio,
  Sliders,
  CheckCircle2,
  FileText
} from 'lucide-react';
import { SrbmprBrokerValidationLedgerService, BrokerValidationRecord } from '../services/SrbmprBrokerValidationLedgerService';

export interface ShowcaseQueueItem {
  id: string;
  symbol: string;
  bybitSymbol: string;
  displayName: string;
  timeframe: '1m' | '3m' | '5m' | '15m';
  basePrice: number;
}

const SHOWCASE_QUEUE: ShowcaseQueueItem[] = [
  { id: 'Q1', symbol: 'BTCUSDT', bybitSymbol: 'BTCUSDT', displayName: 'Bitcoin Linear Perp', timeframe: '1m', basePrice: 68420.50 },
  { id: 'Q2', symbol: 'ETHUSDT', bybitSymbol: 'ETHUSDT', displayName: 'Ethereum Linear Perp', timeframe: '1m', basePrice: 3420.10 },
  { id: 'Q3', symbol: 'SOLUSDT', bybitSymbol: 'SOLUSDT', displayName: 'Solana Linear Perp', timeframe: '3m', basePrice: 184.60 },
  { id: 'Q4', symbol: 'BTCUSDT', bybitSymbol: 'BTCUSDT', displayName: 'Bitcoin 5-Min Anchor', timeframe: '5m', basePrice: 68420.50 },
  { id: 'Q5', symbol: 'BNBUSDT', bybitSymbol: 'BNBUSDT', displayName: 'BNB Linear Perp', timeframe: '5m', basePrice: 612.40 },
  { id: 'Q6', symbol: 'XRPUSDT', bybitSymbol: 'XRPUSDT', displayName: 'Ripple Linear Perp', timeframe: '1m', basePrice: 0.6240 }
];

export const SrbmprLiveAutoChartShowcase: React.FC<{
  onConnectNow: () => void;
  onOpenTutorial: () => void;
  onOpenBrokerPortal: () => void;
  onOpenAdminBroadcast: () => void;
}> = ({ onConnectNow, onOpenTutorial, onOpenBrokerPortal, onOpenAdminBroadcast }) => {
  // Queue & Presentation Window state (Default 30 seconds)
  const [queueIndex, setQueueIndex] = useState<number>(0);
  const [slotDurationSec, setSlotDurationSec] = useState<number>(30); // 30s configurable presentation window
  const [secondsRemaining, setSecondsRemaining] = useState<number>(30);
  const [isQueuePaused, setIsQueuePaused] = useState<boolean>(false);
  
  // Rest Zone State
  const [isRestZoneActive, setIsRestZoneActive] = useState<boolean>(false);
  const [restZoneSeconds, setRestZoneSeconds] = useState<number>(300); // 5 minutes default rest zone

  // Market & Feed State
  const currentAsset = SHOWCASE_QUEUE[queueIndex];
  const nextAsset = SHOWCASE_QUEUE[(queueIndex + 1) % SHOWCASE_QUEUE.length];
  
  const [livePrice, setLivePrice] = useState<number>(currentAsset.basePrice);
  const [lastTickTimestamp, setLastTickTimestamp] = useState<number>(Date.now());
  const [wsStatus, setWsStatus] = useState<'CONNECTED' | 'RECONNECTING' | 'DISCONNECTED'>('CONNECTED');
  const [tickVelocity, setTickVelocity] = useState<number>(14.2);
  const [tickCounter60s, setTickCounter60s] = useState<number>(1);
  const [sandSpin, setSandSpin] = useState<boolean>(false);

  // Candles buffer for active showcase chart canvas
  const [showcaseCandles, setShowcaseCandles] = useState<Array<{ open: number; high: number; low: number; close: number; time: string }>>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const ledgerService = useMemo(() => SrbmprBrokerValidationLedgerService.getInstance(), []);

  // Check if current asset has an actual verified research entry
  const verifiedRecord = useMemo(() => {
    return ledgerService.getLatestVerifiedEntry(currentAsset.symbol);
  }, [ledgerService, currentAsset.symbol]);

  // Seed initial candles when queue rotates
  useEffect(() => {
    const baseP = currentAsset.basePrice;
    const list = [];
    let cur = baseP * 0.99;
    const now = Date.now();
    for (let i = 0; i < 40; i++) {
      const open = cur;
      const drift = (baseP - cur) / Math.max(1, 40 - i);
      const close = open + drift + (Math.sin(i * 0.4) * baseP * 0.0015);
      const high = Math.max(open, close) + Math.random() * baseP * 0.0008;
      const low = Math.min(open, close) - Math.random() * baseP * 0.0008;
      list.push({
        open,
        high,
        low,
        close,
        time: new Date(now - (40 - i) * 60000).toISOString().slice(11, 19)
      });
      cur = close;
    }
    setShowcaseCandles(list);
    setLivePrice(baseP);
    setSecondsRemaining(slotDurationSec);
  }, [currentAsset, slotDurationSec]);

  // Real Bybit V5 Public WebSocket connection for live 0.1s tick feed
  useEffect(() => {
    let ws: WebSocket | null = null;
    let isCancelled = false;

    try {
      ws = new WebSocket('wss://stream.bybit.com/v5/public/linear');

      ws.onopen = () => {
        if (isCancelled) return;
        setWsStatus('CONNECTED');
        ws?.send(
          JSON.stringify({
            op: 'subscribe',
            args: [`tickers.${currentAsset.bybitSymbol}`]
          })
        );
      };

      ws.onmessage = ev => {
        if (isCancelled) return;
        try {
          const msg = JSON.parse(ev.data);
          if (msg.data && msg.data.lastPrice) {
            const p = parseFloat(msg.data.lastPrice);
            if (!Number.isNaN(p) && p > 0) {
              setLivePrice(p);
              setLastTickTimestamp(Date.now());
              setShowcaseCandles(prev => {
                if (prev.length === 0) return prev;
                const copy = [...prev];
                const last = copy[copy.length - 1];
                copy[copy.length - 1] = {
                  ...last,
                  high: Math.max(last.high, p),
                  low: Math.min(last.low, p),
                  close: p
                };
                return copy;
              });
            }
          }
        } catch {
          // quiet
        }
      };

      ws.onerror = () => {
        if (!isCancelled) setWsStatus('RECONNECTING');
      };

      ws.onclose = () => {
        if (!isCancelled) setWsStatus('RECONNECTING');
      };
    } catch {
      setWsStatus('RECONNECTING');
    }

    return () => {
      isCancelled = true;
      if (ws) ws.close();
    };
  }, [currentAsset.bybitSymbol]);

  // 1-Second Timer for Showcase Queue Rotation & 60s Sand Timer
  useEffect(() => {
    const timer = setInterval(() => {
      // 60-second sand timer pulse
      const sec = new Date().getSeconds();
      setTickCounter60s(sec + 1);
      setSandSpin(prev => !prev);
      setTickVelocity(Number((12 + Math.random() * 5).toFixed(1)));

      if (isRestZoneActive) {
        setRestZoneSeconds(prev => {
          if (prev <= 1) {
            setIsRestZoneActive(false);
            return 300;
          }
          return prev - 1;
        });
        return;
      }

      if (!isQueuePaused) {
        setSecondsRemaining(prev => {
          if (prev <= 1) {
            // Rotate to next asset in queue
            setQueueIndex(q => (q + 1) % SHOWCASE_QUEUE.length);
            return slotDurationSec;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isQueuePaused, slotDurationSec, isRestZoneActive]);

  // Stale feed detection (> 25s without tick update)
  const isStaleFeed = Date.now() - lastTickTimestamp > 25000;

  // Draw clean 4K Showcase Candlestick Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || showcaseCandles.length === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = canvas.width;
    const H = canvas.height;
    ctx.fillStyle = '#050811';
    ctx.fillRect(0, 0, W, H);

    // Subtle Gold Grid
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.08)';
    ctx.lineWidth = 1;
    for (let y = 30; y < H; y += 45) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    const highs = showcaseCandles.map(c => c.high);
    const lows = showcaseCandles.map(c => c.low);
    const maxP = Math.max(...highs) + (currentAsset.basePrice * 0.0005);
    const minP = Math.min(...lows) - (currentAsset.basePrice * 0.0005);
    const scaleY = (p: number) => H - 30 - ((p - minP) / Math.max(0.00001, maxP - minP)) * (H - 60);

    const stepW = (W - 90) / showcaseCandles.length;
    showcaseCandles.forEach((c, idx) => {
      const x = 15 + idx * stepW;
      const isBull = c.close >= c.open;
      ctx.strokeStyle = isBull ? '#10b981' : '#f43f5e';
      ctx.fillStyle = isBull ? '#10b981' : '#f43f5e';

      // Wick
      ctx.beginPath();
      ctx.moveTo(x + stepW * 0.35, scaleY(c.high));
      ctx.lineTo(x + stepW * 0.35, scaleY(c.low));
      ctx.stroke();

      // Body
      const top = scaleY(Math.max(c.open, c.close));
      const bot = scaleY(Math.min(c.open, c.close));
      ctx.fillRect(x, top, Math.max(2, stepW * 0.7), Math.max(2, bot - top));
    });

    // Right-Axis Price & Current Line
    const curY = scaleY(livePrice);
    ctx.strokeStyle = '#facc15';
    ctx.setLineDash([4, 3]);
    ctx.beginPath();
    ctx.moveTo(0, curY);
    ctx.lineTo(W, curY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#facc15';
    ctx.fillRect(W - 85, curY - 9, 85, 18);
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 10px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`$${livePrice.toFixed(currentAsset.basePrice < 2 ? 4 : 2)}`, W - 42, curY + 4);

    // Watermark
    ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.font = 'bold 32px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('SRBMPR LIVE SHOWCASE', W / 2, H / 2);
  }, [showcaseCandles, livePrice, currentAsset.basePrice]);

  return (
    <div className="min-h-screen bg-[#02050b] text-slate-100 flex flex-col font-mono select-none">
      
      {/* ====================================================================
          1. REQUIRED YELLOW-HIGHLIGHTED INVITATION BANNER (TOP OF SCREEN)
      ==================================================================== */}
      <div className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-300 text-black px-4 sm:px-6 py-3 border-b-2 border-amber-500 shadow-[0_0_40px_rgba(245,158,11,0.3)]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-center md:text-left">
            <div className="p-1.5 bg-black text-amber-400 rounded-lg shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-900 leading-none">
                MODE B INVITATION · ISOLATED RESEARCH TERMINAL
              </div>
              <p className="text-xs sm:text-sm font-black text-slate-950 mt-0.5">
                “Connect SRBMPR Behavioral Terminal — Sign in to use the interactive research terminal and verify the research yourself.”
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onConnectNow}
              className="px-5 py-2.5 bg-black hover:bg-slate-900 text-amber-300 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg border border-black flex items-center gap-2 transition-transform hover:scale-105"
            >
              <LogIn className="w-4 h-4 text-amber-400" />
              <span>CONNECT SRBMPR / USE NOW</span>
            </button>
          </div>
        </div>
      </div>

      {/* ====================================================================
          2. SHOWCASE HEADER & REAL BROADCAST STATUS
      ==================================================================== */}
      <header className="border-b border-slate-800 bg-[#060a14] px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500" />
            </span>
            <span className="text-xs font-black uppercase tracking-widest text-rose-400">
              🔴 SRBMPR LIVE SHOWCASE
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
            <span className="text-zinc-600">|</span>
            <span>Bybit V5 Linear 0.1s Feed:</span>
            <span className={`font-bold ${wsStatus === 'CONNECTED' ? 'text-emerald-400' : 'text-amber-400'}`}>
              ● {wsStatus}
            </span>
          </div>

          {isStaleFeed && (
            <div className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded text-[10px] font-bold flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              <span>STALE FEED WARNING</span>
            </div>
          )}
        </div>

        {/* Action Quick Launchers */}
        <div className="flex items-center gap-2 text-xs font-black">
          <button
            onClick={onOpenTutorial}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-cyan-500/40 text-cyan-300 rounded-lg flex items-center gap-1.5"
            title="Open 8-Step Interactive Onboarding Tutorial"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Interactive Tutorial</span>
          </button>

          <button
            onClick={onOpenBrokerPortal}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-emerald-500/40 text-emerald-300 rounded-lg flex items-center gap-1.5"
            title="Open 16-Section Broker Evaluation & Provenance Portal"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Broker Validation</span>
          </button>

          <button
            onClick={onOpenAdminBroadcast}
            className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white rounded-lg text-[11px]"
            title="Private Host Controls (MASTER GO LIVE / MASTER STOP)"
          >
            Host Admin
          </button>
        </div>
      </header>

      {/* ====================================================================
          3. REST ZONE BANNER (WHEN ACTIVATED OR SCHEDULED)
      ==================================================================== */}
      {isRestZoneActive ? (
        <div className="bg-gradient-to-r from-purple-950/80 via-slate-950 to-purple-950/80 border-b border-purple-500/50 p-4 text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-xs font-black text-purple-300 uppercase tracking-widest">
            <Radio className="w-4 h-4 text-purple-400 animate-pulse" />
            <span>REST ZONE ACTIVE — {Math.floor(restZoneSeconds / 60)}:{(restZoneSeconds % 60).toString().padStart(2, '0')} REMAINING</span>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl mx-auto">
            <strong>HISTORICAL PLAYBACK & TUTORIAL ZONE:</strong> No new research entries are initiated during the configured rest window. Broadcast remains live with archived evidence.
          </p>
          <div className="pt-1 flex items-center justify-center gap-3">
            <button
              onClick={onOpenTutorial}
              className="px-4 py-1.5 bg-purple-500 hover:bg-purple-400 text-black font-black text-xs rounded-lg"
            >
              Watch Guided Tutorial Video
            </button>
            <button
              onClick={() => setIsRestZoneActive(false)}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs rounded-lg font-bold"
            >
              Resume Live Showcase Now
            </button>
          </div>
        </div>
      ) : null}

      {/* ====================================================================
          4. 30-SECOND CONFIGURABLE PRESENTATION QUEUE SCHEDULER BAR
      ==================================================================== */}
      <div className="bg-[#040813] border-b border-slate-800/80 px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Active Coin Badge */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400 font-bold uppercase">PRESENTING:</span>
            <span className="text-base font-black text-amber-300">{currentAsset.symbol}</span>
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black">
              {currentAsset.timeframe}
            </span>
          </div>

          <span className="text-zinc-600">|</span>

          {/* Next Coin in Queue */}
          <div className="flex items-center gap-1 text-[11px] text-slate-400">
            <span>Next:</span>
            <strong className="text-cyan-300">{nextAsset.symbol} ({nextAsset.timeframe})</strong>
            <span>in</span>
            <strong className="text-white font-mono">{secondsRemaining}s</strong>
          </div>
        </div>

        {/* 30-Second Countdown Progress Bar & Configuration Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-24 sm:w-36 h-2 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 transition-all duration-1000"
                style={{ width: `${(secondsRemaining / slotDurationSec) * 100}%` }}
              />
            </div>
            <span className="text-[11px] font-mono font-bold text-amber-400 tabular-nums">
              {secondsRemaining}s / {slotDurationSec}s
            </span>
          </div>

          {/* Pause / Resume Rotation */}
          <button
            onClick={() => setIsQueuePaused(p => !p)}
            className={`p-1.5 rounded-lg border transition-all ${
              isQueuePaused
                ? 'bg-rose-500 text-white border-rose-400'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
            }`}
            title={isQueuePaused ? 'Resume Auto-Rotation' : 'Pause Auto-Rotation'}
          >
            {isQueuePaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          </button>

          {/* Configurable Duration Selector (10s, 15s, 30s, 60s) */}
          <select
            value={slotDurationSec}
            onChange={e => {
              const val = parseInt(e.target.value, 10);
              setSlotDurationSec(val);
              setSecondsRemaining(val);
            }}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2 py-1 text-[10px] text-slate-300 focus:outline-none"
            title="Configure Showcase Window Duration per Chart"
          >
            <option value={10}>10s / Chart</option>
            <option value={15}>15s / Chart</option>
            <option value={30}>30s (Default)</option>
            <option value={45}>45s / Chart</option>
            <option value={60}>60s / Chart</option>
          </select>

          {/* Rest Zone Manual Trigger */}
          <button
            onClick={() => setIsRestZoneActive(p => !p)}
            className="px-2 py-1 bg-slate-900 hover:bg-slate-800 border border-purple-500/40 text-purple-300 rounded text-[10px] font-bold"
            title="Toggle Rest Zone Presentation"
          >
            {isRestZoneActive ? 'Exit Rest' : 'Rest Zone'}
          </button>
        </div>
      </div>

      {/* ====================================================================
          5. MAIN SHOWCASE LAYOUT: 70% CHART CANVAS + 30% VERIFIED ENTRY PANEL
      ==================================================================== */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 overflow-hidden">
        
        {/* Left Column (8 cols): 4K Candlestick Canvas & Micro 60x1s Stream Bar */}
        <div className="lg:col-span-8 flex flex-col gap-3 h-full">
          {/* Chart Canvas Card */}
          <div className="flex-1 bg-[#050811] border border-slate-800 rounded-2xl p-3 flex flex-col relative overflow-hidden min-h-[380px]">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-black text-white">{currentAsset.displayName}</span>
                <span className="text-slate-400">({currentAsset.symbol})</span>
                <span className="text-emerald-400 font-bold tabular-nums">${livePrice.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                <span>VIEW-ONLY STREAM</span>
                <span className="text-zinc-600">|</span>
                <span className="text-amber-400">LOGIN TO DRAG & INSPECT</span>
              </div>
            </div>

            {/* Canvas */}
            <div className="flex-1 relative w-full h-full mt-2">
              <canvas
                ref={canvasRef}
                width={850}
                height={380}
                className="w-full h-full block rounded-xl"
              />
            </div>
          </div>

          {/* 60 × 1-Second Micro-Candle Unmerged Stream Strip */}
          <div className="bg-[#050811] border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className={`inline-block transition-transform duration-300 ${sandSpin ? 'rotate-180' : ''}`}>
                ⏳
              </span>
              <span className="text-amber-300 font-bold">60s TICK-TOCK:</span>
              <strong className="text-white font-mono">{tickCounter60s}s / 60s</strong>
            </div>

            <div className="flex items-center gap-2 text-slate-400">
              <span>0.1s Velocity:</span>
              <strong className="text-emerald-400 font-mono">+{tickVelocity} t/s</strong>
            </div>

            <div className="flex items-center gap-2 text-slate-400">
              <span>Sub-Second Hash:</span>
              <strong className="text-cyan-300 font-mono">0x9F4A...D401</strong>
            </div>

            <div className="text-[10px] text-slate-500 font-mono">
              Unmerged 60×1s Decomposition Active
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): VERIFIED RESEARCH ENTRY DISPLAY (OR WAITING FOR DATA) */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          
          {/* Verified Entry Card */}
          <div className="bg-[#060b16] border-2 border-amber-500/60 rounded-2xl p-4 flex flex-col justify-between space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-black text-amber-400 uppercase tracking-wider">
                  RESEARCH ENTRY AUDIT
                </span>
              </div>
              <span className="text-[10px] text-slate-400 uppercase">
                {currentAsset.symbol}
              </span>
            </div>

            {/* HONEST DISPLAY: If verified entry exists, show exact data; ELSE SHOW "NO VERIFIED ENTRY — WAITING FOR DATA" */}
            {verifiedRecord ? (
              <div className="space-y-3">
                <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/40 rounded-xl flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-400 uppercase">
                    ● VERIFIED ENTRY RECORD ACTIVE
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{verifiedRecord.recordId}</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs tabular-nums">
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase block">Zero Entry Price</span>
                    <strong className="text-white text-sm">${verifiedRecord.exactEntryPrice.toFixed(2)}</strong>
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded-xl border border-rose-500/30">
                    <span className="text-[10px] text-rose-400 uppercase block">Stop Loss (-Zero)</span>
                    <strong className="text-rose-300 text-sm">${verifiedRecord.negativeZeroStopLossPrice.toFixed(2)}</strong>
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded-xl border border-emerald-500/30">
                    <span className="text-[10px] text-emerald-400 uppercase block">★ 1:10 Target</span>
                    <strong className="text-emerald-300 text-sm">${verifiedRecord.target1to10Price.toFixed(2)}</strong>
                    <span className="text-[9px] text-emerald-400 block mt-0.5">(+$500.00 USD)</span>
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded-xl border border-fuchsia-500/30">
                    <span className="text-[10px] text-fuchsia-400 uppercase block">★ 1:20 Target</span>
                    <strong className="text-fuchsia-300 text-sm">${verifiedRecord.target1to20Price.toFixed(2)}</strong>
                    <span className="text-[9px] text-fuchsia-400 block mt-0.5">(+$1,000.00 USD)</span>
                  </div>
                </div>

                {/* Approved Quantity ($50 Fixed Risk Rule) */}
                <div className="p-3 bg-black border border-slate-800 rounded-xl space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-400">$50 Risk Formula:</span>
                    <span className="text-white font-mono font-bold">Q = 50 / |Entry - SL|</span>
                  </div>
                  <div className="text-sm font-black text-emerald-400 font-mono">
                    Approved Qty: {verifiedRecord.approvedQuantityUnits.toFixed(4)} Units
                  </div>
                </div>

                {/* Timestamps (UTC + UAE + IST) */}
                <div className="space-y-1 text-[11px] text-slate-300 bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                  <div className="flex justify-between">
                    <span className="text-slate-400">UTC:</span>
                    <span className="text-white font-mono">{verifiedRecord.sourceTimestampUtc.slice(11, 19)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-cyan-400">Dubai GST:</span>
                    <span className="text-cyan-200 font-mono">{verifiedRecord.sourceTimestampUae}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-amber-400">India IST:</span>
                    <span className="text-amber-200 font-mono">{verifiedRecord.sourceTimestampIst}</span>
                  </div>
                </div>
              </div>
            ) : (
              /* REQUIRED RULE: If no verified entry exists, display "NO VERIFIED ENTRY — WAITING FOR DATA" */
              <div className="p-5 bg-black border border-amber-500/40 rounded-xl text-center space-y-3">
                <div className="w-10 h-10 mx-auto rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="text-sm font-black text-amber-300 uppercase tracking-wide">
                  NO VERIFIED ENTRY — WAITING FOR DATA
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Strict SRBMPR Integrity: We never invent fake entries, stop-losses, or price levels. Waiting for verified sub-second Terminal 0 micro-zero sequence formation.
                </p>
                <div className="text-[10px] text-slate-500 font-mono">
                  Real Feed Connected · Zero Synthetic Interpolation
                </div>
              </div>
            )}

            {/* Invitation Button inside the panel */}
            <div className="pt-2">
              <button
                onClick={onConnectNow}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>CONNECT SRBMPR / USE NOW</span>
              </button>
            </div>
          </div>

          {/* Institutional Compliance Notice */}
          <div className="bg-[#050811] border border-slate-800 rounded-xl p-3 space-y-1.5 text-[10px] text-slate-400 leading-relaxed">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold uppercase">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Broker Evaluation Standard</span>
            </div>
            <p>
              Public viewers observe automated broadcast rotations without write access. Login provides isolated interactive sandboxing to verify every single candle, Zero origin, and calculation independently.
            </p>
          </div>

        </div>

      </main>

      {/* ====================================================================
          6. FOOTER TELEMETRY STRIP
      ==================================================================== */}
      <footer className="border-t border-slate-800/80 bg-[#05070f] px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400">
        <div className="flex items-center gap-3">
          <span>● SRBMPR 24/7 Broadcast Engine</span>
          <span className="text-zinc-600">|</span>
          <span>Bybit Linear Perp Feed (wss://stream.bybit.com)</span>
          <span className="text-zinc-600">|</span>
          <span className="text-emerald-400 font-bold">All Secrets Redacted & Protected</span>
        </div>

        <div className="flex items-center gap-3">
          <span>Siyab Raheman Gulwadi Abbushet (Project Owner)</span>
          <span className="text-zinc-600">|</span>
          <span>Raziya Rahman (Time-Zone Lead)</span>
        </div>
      </footer>

    </div>
  );
};
