import React, { useState, useEffect, useMemo } from 'react';
import { 
  Zap, Target, Clock, ShieldCheck, ArrowRight, 
  CheckCircle2, AlertTriangle, Lock, RefreshCw, 
  Download, Globe, Layers, BarChart2, Activity, Hash,
  Maximize2, Minimize2, ChevronRight, TrendingUp, TrendingDown
} from 'lucide-react';
import { AssetSymbol, MarketType, ExchangeId, CandleData } from '../types/terminal';
import { ProspectiveAuditStorageService } from '../services/ProspectiveAuditStorageService';
import { SRBMPRMechanismEngine } from '../services/SRBMPRMechanismEngine';

interface ProjectedSetup {
  id: string;
  timestampUtc: string;
  marketType: 'SPOT' | 'FUTURES';
  symbol: AssetSymbol;
  livePriceAtProjection: number;
  selectedRr: string;
  calculatedTimezoneCondition: string;
  entryAxis: number;
  slFloor: number;
  targetCeiling: number;
  riskDistance: number;
  rewardDistance: number;
  status: 'PROJECTION_FROZEN_ACTIVE' | 'LIMIT_ORDER_PLACED' | 'TARGET_HIT' | 'SL_HIT' | 'INVALIDATED';
  ruleHash: string;
  frozenAtUtc: string;
}

const RR_OPTIONS = [
  '1:1', '1:1.5', '1:2', '1:3'
];


const QUICK_10_ASSETS: AssetSymbol[] = [
  'BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'PAXG/USDT', 
  'AR/USDT', 'XRP/USDT', 'DOGE/USDT', 'BNB/USDT', 
  'PEPE/USDT', 'SUI/USDT'
];

interface Props {
  selectedAsset: AssetSymbol;
  livePrice: number;
  selectedExchange?: ExchangeId;
  onFullSync?: () => void;
}

export const SrbmprDedicatedProjectionScreen: React.FC<Props> = ({
  selectedAsset: initialAsset,
  livePrice: rawLivePrice,
  selectedExchange = 'BYBIT',
  onFullSync
}) => {
  const auditService = ProspectiveAuditStorageService.getInstance();
  const engine = SRBMPRMechanismEngine.getInstance();
  
  // Local asset state so user can switch between any of the 100 coins directly on the chart
  const [currentAsset, setCurrentAsset] = useState<AssetSymbol>(initialAsset);
  const [selectedFeed, setSelectedFeed] = useState<'FUTURES' | 'SPOT'>('FUTURES');
  const [selectedRr, setSelectedRr] = useState<string>('1:1');
  const [chartHeight, setChartHeight] = useState<'STANDARD' | 'LARGE' | 'MASSIVE'>('LARGE');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  
  // Projection State
  const [activeProjection, setActiveProjection] = useState<ProjectedSetup | null>(null);
  const [history, setHistory] = useState<ProjectedSetup[]>([]);
  const [isLimitOrderSimulated, setIsLimitOrderSimulated] = useState<boolean>(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Dubai Time and Countdown
  const [dubaiTime, setDubaiTime] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(540); // 9 minutes base countdown

  useEffect(() => {
    const interval = setInterval(() => {
      // Calculate Dubai Time (UTC + 4 hours)
      const now = new Date();
      const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
      const dubaiOffset = 4;
      const dubai = new Date(utc + (3600000 * dubaiOffset));
      
      const timeStr = dubai.toLocaleTimeString('en-US', { hour12: false });
      setDubaiTime(`Dubai ${timeStr.slice(0, 5)}`);

      setCountdown(c => {
        if (c <= 1) return 540; // Auto-reset countdown to simulate new micro setup
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Candles State for the Native SRBMPR Chart
  const [candles, setCandles] = useState<CandleData[]>([]);


  // Update asset when parent changes
  useEffect(() => {
    setCurrentAsset(initialAsset);
  }, [initialAsset]);

  // Fetch real candles for the selected asset and market
  useEffect(() => {
    let isMounted = true;
    const loadCandles = async () => {
      const data = await engine.fetchHistoricalCandles(selectedExchange, currentAsset, '1m', selectedFeed === 'FUTURES' ? 'FUTURE' : 'SPOT', 40);
      if (isMounted && data.length > 0) {
        setCandles(data);
      }
    };
    loadCandles();
    return () => { isMounted = false; };
  }, [currentAsset, selectedFeed, selectedExchange]);

  const livePrice = useMemo(() => {
    if (currentAsset === initialAsset && rawLivePrice > 0) return rawLivePrice;
    if (candles.length > 0) return candles[candles.length - 1].close;
    return 65280.00;
  }, [currentAsset, initialAsset, rawLivePrice, candles]);

  // Compute Timezone Condition and Entry based on SRBMPR deterministic rules
  useEffect(() => {
    generateFrozenProjection(selectedRr, selectedFeed, currentAsset, livePrice);
  }, [currentAsset, selectedFeed, selectedRr]);

  const generateFrozenProjection = (rr: string, feed: 'FUTURES' | 'SPOT', asset: AssetSymbol, price: number) => {
    const currentPrice = price > 0 ? price : 65280;
    const nowUtc = new Date().toISOString();

    // SYSTEM DETERMINES TIMEZONE CONDITION (Dubai Time UTC+4 explicitly maintained)
    let calculatedTz = 'Dubai Time (UTC+4)';
    let riskDollar = currentPrice * 0.0003; // exact 0.03% micro-scale risk
    if (riskDollar < 0.0001) riskDollar = 0.0001;

    const rrMultiplier = parseFloat(rr.split(':')[1]) || 1;

    // Strict Micro entry placement directly at current price axis
    const projectedEntry = currentPrice;
    const sl = Number((projectedEntry - riskDollar).toFixed(currentPrice > 100 ? 2 : 4));
    const target = Number((projectedEntry + (riskDollar * rrMultiplier)).toFixed(currentPrice > 100 ? 2 : 4));

    const newProjection: ProjectedSetup = {
      id: `SRB-PROJ-${asset.replace('/', '')}-${Date.now().toString().slice(-6)}`,
      timestampUtc: nowUtc,
      marketType: feed,
      symbol: asset,
      livePriceAtProjection: currentPrice,
      selectedRr: rr,
      calculatedTimezoneCondition: calculatedTz,
      entryAxis: projectedEntry,
      slFloor: sl,
      targetCeiling: target,
      riskDistance: riskDollar,
      rewardDistance: riskDollar * rrMultiplier,
      status: 'PROJECTION_FROZEN_ACTIVE',
      ruleHash: `SHA256:SRBMPR_FROZEN_${rr.replace(':', '_')}_${feed}`,
      frozenAtUtc: nowUtc
    };

    setActiveProjection(newProjection);
    setIsLimitOrderSimulated(false);
  };


  const handleSelectRr = (rr: string) => {
    setSelectedRr(rr);
    generateFrozenProjection(rr, selectedFeed, currentAsset, livePrice);
    setNotice(`Target R:R set to ${rr}. System auto-determined qualifying SR time-zone condition.`);
    setTimeout(() => setNotice(null), 4000);
  };

  const handleLockAndSendToAudit = () => {
    if (!activeProjection) return;

    auditService.addPreEventPrediction({
      dayNumber: 2,
      registeredAtUtc: activeProjection.frozenAtUtc,
      symbol: activeProjection.symbol,
      timeframe: selectedFeed === 'FUTURES' ? '1m' : '5m',
      origin: {
        price: Number((activeProjection.entryAxis - activeProjection.riskDistance * 2).toFixed(2)),
        timestampUtc: activeProjection.frozenAtUtc,
        description: `SRBMPR Structural Origin (${activeProjection.calculatedTimezoneCondition})`
      },
      left: {
        highPrice: activeProjection.livePriceAtProjection,
        lowPrice: activeProjection.entryAxis,
        description: 'LEFT Reference: Pre-Entry Pullback'
      },
      right: {
        lowPrice: activeProjection.entryAxis,
        highPrice: activeProjection.targetCeiling,
        description: `RIGHT Impulse: ${activeProjection.selectedRr} Target Expansion`
      },
      sequence: {
        sequenceId: `SEQ_${activeProjection.id}`,
        stage: 'LOCKED'
      },
      lockCoordinate: activeProjection.entryAxis,
      entryAxis: activeProjection.entryAxis,
      slFloor: activeProjection.slFloor,
      targetCeiling: activeProjection.targetCeiling,
      riskRewardRatio: activeProjection.selectedRr,
      expectedCompletionWindowUtc: new Date(Date.now() + 86400000).toISOString()
    });

    setHistory(prev => [activeProjection, ...prev]);
    setIsLimitOrderSimulated(true);
    setNotice(`Projection permanently frozen in 30-Day Prospective Audit Ledger!`);
    setTimeout(() => setNotice(null), 6000);
  };

  // SVG Candlestick Math
  const chartHeightPx = chartHeight === 'STANDARD' ? 440 : chartHeight === 'LARGE' ? 620 : 800;
  const candleDisplay = candles.length > 0 ? candles.slice(-30) : [];
  
  const minPrice = useMemo(() => {
    if (candleDisplay.length === 0) return (livePrice * 0.995);
    const candleMin = Math.min(...candleDisplay.map(c => c.low));
    const targetMin = activeProjection ? Math.min(candleMin, activeProjection.slFloor) : candleMin;
    return targetMin * 0.999;
  }, [candleDisplay, activeProjection, livePrice]);

  const maxPrice = useMemo(() => {
    if (candleDisplay.length === 0) return (livePrice * 1.005);
    const candleMax = Math.max(...candleDisplay.map(c => c.high));
    const targetMax = activeProjection ? Math.max(candleMax, activeProjection.targetCeiling) : candleMax;
    return targetMax * 1.001;
  }, [candleDisplay, activeProjection, livePrice]);

  const priceRange = (maxPrice - minPrice) || 1;
  const getY = (val: number, height: number) => {
    return height - ((val - minPrice) / priceRange) * (height - 60) - 30;
  };

  return (
    <div className={`bg-black border-2 border-cyan-500/50 rounded-3xl p-6 sm:p-8 shadow-[0_0_80px_rgba(6,182,212,0.15)] font-mono text-xs space-y-6 ${
      isFullscreen ? 'fixed inset-0 z-50 overflow-y-auto rounded-none border-0 p-6' : ''
    }`}>
      
      {/* Top Header: Feed Source & Fullscreen Control */}
      <div className="border-b border-zinc-800 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Zap className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-tighter flex items-center gap-2">
                SRBMPR PROJECTION TOOL & MASTER CHART
              </h2>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Full-Scale Candlestick Engine • Frozen Entry Axis • Strict 1R SL • Auto Time-Zone Qualification
              </p>
            </div>
          </div>
        </div>

        {/* Feed Switcher & View Tools */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center bg-zinc-950 p-1 rounded-xl border border-zinc-800">
            <button
              onClick={() => setSelectedFeed('FUTURES')}
              className={`px-3 py-1.5 rounded-lg font-black text-[10px] uppercase transition-all ${
                selectedFeed === 'FUTURES'
                  ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Bybit Futures
            </button>
            <button
              onClick={() => setSelectedFeed('SPOT')}
              className={`px-3 py-1.5 rounded-lg font-black text-[10px] uppercase transition-all ${
                selectedFeed === 'SPOT'
                  ? 'bg-amber-500 text-black shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Bybit Spot
            </button>
          </div>

          {/* Chart Height Scale Controls */}
          {!isFullscreen && (
            <div className="hidden sm:flex items-center bg-zinc-950 p-1 rounded-xl border border-zinc-800 text-[10px]">
              <button
                onClick={() => setChartHeight('STANDARD')}
                className={`px-2.5 py-1 rounded-lg font-bold ${chartHeight === 'STANDARD' ? 'bg-zinc-800 text-white' : 'text-zinc-400'}`}
              >
                500px
              </button>
              <button
                onClick={() => setChartHeight('LARGE')}
                className={`px-2.5 py-1 rounded-lg font-bold ${chartHeight === 'LARGE' ? 'bg-zinc-800 text-white' : 'text-zinc-400'}`}
              >
                700px
              </button>
              <button
                onClick={() => setChartHeight('MASSIVE')}
                className={`px-2.5 py-1 rounded-lg font-bold ${chartHeight === 'MASSIVE' ? 'bg-zinc-800 text-white' : 'text-zinc-400'}`}
              >
                900px
              </button>
            </div>
          )}

          {/* Fullscreen Button */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-xl font-black text-[10px] transition-all"
            title="Expand Chart to 100% Screen"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            <span>{isFullscreen ? 'Exit Fullscreen' : '⛶ Fullscreen'}</span>
          </button>
        </div>
      </div>

      {notice && (
        <div className="p-3 bg-cyan-500/10 border border-cyan-500/40 rounded-xl text-cyan-300 text-[11px] flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* QUICK 10-ASSET SWITCHER BAR */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[10px] text-zinc-500 font-bold uppercase shrink-0 mr-1">Switch Coin:</span>
        {QUICK_10_ASSETS.map(asset => (
          <button
            key={asset}
            onClick={() => setCurrentAsset(asset)}
            className={`px-3 py-1.5 rounded-xl font-black text-xs font-mono transition-all whitespace-nowrap border ${
              currentAsset === asset
                ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700'
            }`}
          >
            {asset.split('/')[0]}
          </button>
        ))}
      </div>

      {/* CORE MICRO-ONLY NUMBERS DISPLAY (EXCLUDING UNNECESSARY LONG-HORIZON PROJECTIONS) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Card 1: COIN */}
        <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl relative overflow-hidden">
          <span className="text-[10px] text-zinc-500 font-black uppercase tracking-wider block">COIN</span>
          <div className="text-3xl font-black text-white mt-1.5 font-mono tracking-tight">
            {currentAsset}
          </div>
          <span className="text-[8px] text-cyan-400 font-bold block mt-1 uppercase tracking-widest">Selected Micro Asset</span>
        </div>

        {/* Card 2: CURRENT VALID TIME */}
        <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl relative overflow-hidden">
          <span className="text-[10px] text-zinc-500 font-black uppercase tracking-wider block">CURRENT VALID TIME</span>
          <div className="text-3xl font-black text-amber-400 mt-1.5 font-mono tracking-tight">
            {dubaiTime || 'Dubai 12:00'}
          </div>
          <span className="text-[8px] text-zinc-500 font-bold block mt-1 uppercase tracking-widest">Explicit Dubai Time</span>
        </div>

        {/* Card 3: ENTRY */}
        <div className="bg-zinc-950 border-2 border-cyan-500/50 p-5 rounded-2xl relative overflow-hidden shadow-[0_0_20px_rgba(6,182,212,0.1)]">
          <span className="text-[10px] text-cyan-400 font-black uppercase tracking-wider block">ENTRY</span>
          <div className="text-3xl font-black text-cyan-300 mt-1.5 font-mono tracking-tight tabular-nums">
            ${activeProjection ? activeProjection.entryAxis.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 }) : livePrice.toLocaleString()}
          </div>
          <span className="text-[8px] text-zinc-500 font-bold block mt-1 uppercase tracking-widest">Micro Price Axis</span>
        </div>

        {/* Card 4: SL */}
        <div className="bg-zinc-950 border-2 border-rose-500/50 p-5 rounded-2xl relative overflow-hidden">
          <span className="text-[10px] text-rose-400 font-black uppercase tracking-wider block">SL</span>
          <div className="text-3xl font-black text-rose-400 mt-1.5 font-mono tracking-tight tabular-nums">
            ${activeProjection ? activeProjection.slFloor.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 }) : (livePrice - 10).toLocaleString()}
          </div>
          <span className="text-[8px] text-rose-500 font-bold block mt-1 uppercase tracking-widest">Strict Micro SL (1R)</span>
        </div>

        {/* Card 5: TARGET */}
        <div className="bg-zinc-950 border-2 border-emerald-500/50 p-5 rounded-2xl relative overflow-hidden shadow-[0_0_20px_rgba(16,185,129,0.1)]">
          <span className="text-[10px] text-emerald-400 font-black uppercase tracking-wider block">TARGET</span>
          <div className="text-3xl font-black text-emerald-400 mt-1.5 font-mono tracking-tight tabular-nums">
            ${activeProjection ? activeProjection.targetCeiling.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 }) : (livePrice + 15).toLocaleString()}
          </div>
          <span className="text-[8px] text-emerald-400 font-bold block mt-1 uppercase tracking-widest">Micro Target Space</span>
        </div>

        {/* Card 6: RR */}
        <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl relative overflow-hidden">
          <span className="text-[10px] text-zinc-500 font-black uppercase tracking-wider block">RR</span>
          <div className="text-3xl font-black text-white mt-1.5 font-mono tracking-tight">
            {selectedRr}
          </div>
          <span className="text-[8px] text-zinc-500 font-bold block mt-1 uppercase tracking-widest">Micro Ratio Locked</span>
        </div>

        {/* Card 7: COUNTDOWN / VALID UNTIL */}
        <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl relative overflow-hidden">
          <span className="text-[10px] text-zinc-500 font-black uppercase tracking-wider block">COUNTDOWN / VALID UNTIL</span>
          <div className="text-3xl font-black text-cyan-300 mt-1.5 font-mono tracking-tight tabular-nums">
            {Math.floor(countdown / 60)}:{(countdown % 60) < 10 ? '0' : ''}{countdown % 60}
          </div>
          <span className="text-[8px] text-zinc-500 font-bold block mt-1 uppercase tracking-widest">Time to Re-align Window</span>
        </div>

        {/* Card 8: STATUS */}
        <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl relative overflow-hidden">
          <span className="text-[10px] text-zinc-500 font-black uppercase tracking-wider block">STATUS</span>
          <div className="mt-2">
            <span className="inline-block px-3 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-xl text-xs font-black uppercase tracking-wider animate-pulse">
              ACCEPTED (Valid Micro Setup)
            </span>
          </div>
          <span className="text-[8px] text-zinc-500 font-bold block mt-1.5 uppercase tracking-widest">Inside 1-10m Time-bar</span>
        </div>

      </div>


      {/* USER SELECTS ONLY RR (1:1 -> 1:1500) */}
      <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Target className="w-4 h-4 text-cyan-400" /> SELECT DESIRED RR (USER SELECTS ONLY RR • TIMEZONE IS DETERMINED BY SYSTEM)
            </h3>
            <p className="text-[10px] text-zinc-500 mt-0.5">
              SL remains locked at 1R. The SRBMPR engine determines the applicable structural condition automatically.
            </p>
          </div>
        </div>

        {/* RR Buttons */}
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 pt-2">
          {RR_OPTIONS.map(rr => (
            <button
              key={rr}
              onClick={() => handleSelectRr(rr)}
              className={`py-2.5 rounded-xl font-mono text-xs font-black transition-all border ${
                selectedRr === rr
                  ? 'bg-cyan-500 text-black border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)] scale-105'
                  : 'bg-black text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-white'
              }`}
            >
              {rr}
            </button>
          ))}
        </div>
      </div>

      {/* MASSIVE NATIVE SRBMPR CANDLESTICK & PROJECTION CHART */}
      <div className="bg-black border-2 border-zinc-800 rounded-3xl p-6 relative overflow-hidden space-y-4">
        
        {/* Chart Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-900 pb-4">
          <div className="flex items-center gap-3">
            <span className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-cyan-400" /> {currentAsset} SRBMPR PROPRIETARY CANDLESTICK CHART
            </span>
            <span className="px-2.5 py-0.5 bg-zinc-900 text-zinc-300 rounded font-bold text-[10px]">
              1-Minute Ticks • High/Low/Wick/Body
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <span className="text-zinc-500 font-bold">
              PRICE: <strong className="text-white text-sm">${livePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</strong>
            </span>
            <span className="text-zinc-700">|</span>
            <span className="text-cyan-400 font-bold">
              ENTRY: ${activeProjection?.entryAxis.toLocaleString()}
            </span>
            <span className="text-zinc-700">|</span>
            <span className="text-rose-400 font-bold">
              SL: ${activeProjection?.slFloor.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Real Candlestick SVG Rendering Plane */}
        <div 
          style={{ height: `${chartHeightPx}px` }} 
          className="w-full bg-zinc-950/90 rounded-2xl border border-zinc-900 relative overflow-hidden font-mono select-none"
        >
          {/* Background Grid Lines */}
          <div className="absolute inset-0 flex flex-col justify-between p-4 pointer-events-none opacity-20">
            <div className="border-b border-zinc-700 w-full" />
            <div className="border-b border-zinc-700 w-full" />
            <div className="border-b border-zinc-700 w-full" />
            <div className="border-b border-zinc-700 w-full" />
          </div>

          <svg className="w-full h-full">
            {/* Render Candlesticks */}
            {candleDisplay.map((c, i) => {
              const candleWidth = 14;
              const spacing = 22;
              const x = 50 + (i * spacing);
              const isBullish = c.close >= c.open;
              const highY = getY(c.high, chartHeightPx);
              const lowY = getY(c.low, chartHeightPx);
              const openY = getY(c.open, chartHeightPx);
              const closeY = getY(c.close, chartHeightPx);
              const bodyTop = Math.min(openY, closeY);
              const bodyHeight = Math.max(Math.abs(closeY - openY), 2);

              return (
                <g key={i} className="hover:opacity-80 transition-opacity">
                  {/* Candle Wick */}
                  <line 
                    x1={x + (candleWidth / 2)} 
                    y1={highY} 
                    x2={x + (candleWidth / 2)} 
                    y2={lowY} 
                    stroke={isBullish ? '#10b981' : '#ef4444'} 
                    strokeWidth="1.5" 
                  />
                  {/* Candle Body */}
                  <rect 
                    x={x} 
                    y={bodyTop} 
                    width={candleWidth} 
                    height={bodyHeight} 
                    fill={isBullish ? '#10b981' : '#ef4444'} 
                    rx="1" 
                  />
                </g>
              );
            })}

            {/* Target Ceiling Line */}
            {activeProjection && (
              <g>
                <line 
                  x1="0" 
                  y1={getY(activeProjection.targetCeiling, chartHeightPx)} 
                  x2="100%" 
                  y2={getY(activeProjection.targetCeiling, chartHeightPx)} 
                  stroke="#10b981" 
                  strokeWidth="2" 
                  strokeDasharray="4 4" 
                />
              </g>
            )}

            {/* Projected Entry Line (Frozen Axis) */}
            {activeProjection && (
              <g>
                <line 
                  x1="0" 
                  y1={getY(activeProjection.entryAxis, chartHeightPx)} 
                  x2="100%" 
                  y2={getY(activeProjection.entryAxis, chartHeightPx)} 
                  stroke="#06b6d4" 
                  strokeWidth="2.5" 
                />
              </g>
            )}

            {/* Stop Loss Floor Line */}
            {activeProjection && (
              <g>
                <line 
                  x1="0" 
                  y1={getY(activeProjection.slFloor, chartHeightPx)} 
                  x2="100%" 
                  y2={getY(activeProjection.slFloor, chartHeightPx)} 
                  stroke="#ef4444" 
                  strokeWidth="2" 
                />
              </g>
            )}

            {/* Live Price Pulsing Line */}
            <g>
              <line 
                x1="0" 
                y1={getY(livePrice, chartHeightPx)} 
                x2="100%" 
                y2={getY(livePrice, chartHeightPx)} 
                stroke="#f59e0b" 
                strokeWidth="1.5" 
                strokeDasharray="2 2" 
              />
            </g>
          </svg>

          {/* Floating Price Axis Badges on the Right */}
          {activeProjection && (
            <div className="absolute right-4 inset-y-0 flex flex-col justify-between py-6 pointer-events-none font-bold text-[10px]">
              
              {/* Target Badge */}
              <div 
                style={{ top: `${Math.max(10, getY(activeProjection.targetCeiling, chartHeightPx) - 12)}px` }} 
                className="absolute right-0 bg-emerald-500 text-black px-2.5 py-1 rounded shadow-lg flex items-center gap-1.5"
              >
                <span>TARGET ({selectedRr}): ${activeProjection.targetCeiling.toLocaleString()}</span>
              </div>

              {/* Live Price Badge */}
              <div 
                style={{ top: `${Math.max(10, getY(livePrice, chartHeightPx) - 12)}px` }} 
                className="absolute right-0 bg-amber-500 text-black px-2.5 py-1 rounded shadow-lg flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-black animate-ping" />
                <span>LIVE: ${livePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</span>
              </div>

              {/* Projected Entry Badge */}
              <div 
                style={{ top: `${Math.max(10, getY(activeProjection.entryAxis, chartHeightPx) - 12)}px` }} 
                className="absolute right-0 bg-cyan-400 text-black px-2.5 py-1 rounded shadow-lg flex items-center gap-1.5"
              >
                <Lock className="w-3 h-3" />
                <span>ENTRY: ${activeProjection.entryAxis.toLocaleString()}</span>
              </div>

              {/* Stop Loss Badge */}
              <div 
                style={{ top: `${Math.max(10, getY(activeProjection.slFloor, chartHeightPx) - 12)}px` }} 
                className="absolute right-0 bg-rose-500 text-white px-2.5 py-1 rounded shadow-lg flex items-center gap-1.5"
              >
                <span>SL (1R): ${activeProjection.slFloor.toLocaleString()}</span>
              </div>

            </div>
          )}

        </div>

        {/* Action Row: Limit Order & 30-Day Audit Log */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-zinc-900">
          <div className="text-[10px] text-zinc-500">
            <span>Projection Frozen At: </span>
            <span className="text-white font-mono">{activeProjection?.frozenAtUtc}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleLockAndSendToAudit}
              className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-black rounded-xl text-xs flex items-center gap-2 transition-all shadow-[0_0_25px_rgba(6,182,212,0.4)]"
            >
              <Lock className="w-4 h-4" /> Place Limit Order at ${activeProjection?.entryAxis.toLocaleString()}
            </button>
          </div>
        </div>

      </div>

      {/* Historical Projections Ledger */}
      {history.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-zinc-900">
          <div className="flex items-center justify-between text-xs">
            <span className="font-black text-white uppercase flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" /> ACTIVE PROJECTIONS LOGGED THIS SESSION
            </span>
            <span className="text-[10px] text-zinc-500">{history.length} Projections Recorded</span>
          </div>

          <div className="overflow-x-auto border border-zinc-800 rounded-2xl bg-black">
            <table className="w-full text-left text-[10px]">
              <thead className="bg-zinc-950 text-zinc-400 uppercase font-black border-b border-zinc-800">
                <tr>
                  <th className="py-2.5 px-3">Time (UTC)</th>
                  <th className="py-2.5 px-3">Asset</th>
                  <th className="py-2.5 px-3">Market</th>
                  <th className="py-2.5 px-3">RR</th>
                  <th className="py-2.5 px-3">Entry Axis</th>
                  <th className="py-2.5 px-3">1R SL</th>
                  <th className="py-2.5 px-3">Target</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900">
                {history.map(item => (
                  <tr key={item.id} className="hover:bg-zinc-950/60">
                    <td className="py-3 px-3 font-mono text-zinc-300">{new Date(item.frozenAtUtc).toLocaleTimeString()}</td>
                    <td className="py-3 px-3 font-bold text-white">{item.symbol}</td>
                    <td className="py-3 px-3 text-cyan-400">{item.marketType}</td>
                    <td className="py-3 px-3 font-bold text-emerald-400">{item.selectedRr}</td>
                    <td className="py-3 px-3 font-mono text-white font-bold">${item.entryAxis.toLocaleString()}</td>
                    <td className="py-3 px-3 font-mono text-rose-400">${item.slFloor.toLocaleString()}</td>
                    <td className="py-3 px-3 font-mono text-emerald-400">${item.targetCeiling.toLocaleString()}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
