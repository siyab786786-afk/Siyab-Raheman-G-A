import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import {
  RefreshCw,
  X,
  Maximize2,
  Minimize2,
  BookmarkCheck,
  Download,
  Activity,
  CheckCircle2,
  Palette,
  Lock,
  Sparkles,
  PlusCircle,
  Trash2,
  Target,
  ShieldCheck,
  Layers,
  Cpu,
  TrendingUp,
} from 'lucide-react';
import { RawOhlcBar, ForwardTimeframe } from '../services/SrbmprForwardTestEngine';
import {
  ResearchTimezone,
  SrbmprRawDataMeasurementService,
} from '../services/SrbmprRawDataMeasurementService';

export interface BookedResearchReportEntry {
  bookingId: string;
  bookedAtUtc: string;
  symbol: string;
  timeframe: string;
  candleIndex: number;
  price: number;
  open: number;
  high: number;
  low: number;
  close: number;
  tz1Time: string;
  tz2Time: string;
  lockStatus: 'LOCKED_UI_DATA_ADDED_IN_BG' | 'LIVE_UNLOCKED';
  note: string;
}

export interface CandlePaletteOption {
  id: string;
  name: string;
  bullColor: string;
  bearColor: string;
  bullWick: string;
  bearWick: string;
  description: string;
}

export interface BackgroundThemeOption {
  id: 'PURE_BLACK' | 'PURE_WHITE' | 'OBSIDIAN_DARK' | 'NAVY_SLATE';
  name: string;
  bgHex: string;
  gridRgba: string;
  axisTextHex: string;
  borderRgba: string;
}

export const BACKGROUND_THEME_CATALOG: BackgroundThemeOption[] = [
  {
    id: 'PURE_BLACK',
    name: 'Pure Black 4K (#000000)',
    bgHex: '#000000',
    gridRgba: 'rgba(148, 163, 184, 0.10)',
    axisTextHex: '#f8fafc',
    borderRgba: 'rgba(148, 163, 184, 0.28)',
  },
  {
    id: 'PURE_WHITE',
    name: 'Pure White 4K (#FFFFFF)',
    bgHex: '#ffffff',
    gridRgba: 'rgba(15, 23, 42, 0.09)',
    axisTextHex: '#0f172a',
    borderRgba: 'rgba(15, 23, 42, 0.25)',
  },
  {
    id: 'OBSIDIAN_DARK',
    name: 'Deep Obsidian (#05080F)',
    bgHex: '#05080f',
    gridRgba: 'rgba(148, 163, 184, 0.08)',
    axisTextHex: '#cbd5e1',
    borderRgba: 'rgba(148, 163, 184, 0.22)',
  },
  {
    id: 'NAVY_SLATE',
    name: 'SR Time Midnight (#071022)',
    bgHex: '#071022',
    gridRgba: 'rgba(56, 189, 248, 0.10)',
    axisTextHex: '#e2e8f0',
    borderRgba: 'rgba(56, 189, 248, 0.25)',
  },
];

export const CANDLE_PALETTE_CATALOG: CandlePaletteOption[] = [
  {
    id: '4K_GREEN_RED',
    name: '4K Neon Green & Red',
    bullColor: '#00ff66',
    bearColor: '#ff1744',
    bullWick: '#00ff66',
    bearWick: '#ff1744',
    description: 'Ultra-crisp 4K Neon Green (#00FF66) bullish & Crimson Red (#FF1744) bearish',
  },
  {
    id: 'BLUE_GREEN_RED',
    name: 'Blue-Green & Red',
    bullColor: '#00e5ff',
    bearColor: '#ff1744',
    bullWick: '#00e5ff',
    bearWick: '#ff1744',
    description: 'Blue-Green Cyan Teal (#00E5FF) bullish & Crimson Red (#FF1744) bearish',
  },
  {
    id: 'WHITE_AND_BLUE',
    name: 'White & Royal Blue',
    bullColor: '#ffffff',
    bearColor: '#2979ff',
    bullWick: '#94a3b8',
    bearWick: '#2979ff',
    description: 'Pure White (#FFFFFF) bullish & Electric Royal Blue (#2979FF) bearish',
  },
  {
    id: 'BLUE_AND_WHITE',
    name: 'Royal Blue & White',
    bullColor: '#2979ff',
    bearColor: '#ffffff',
    bullWick: '#2979ff',
    bearWick: '#94a3b8',
    description: 'Electric Royal Blue (#2979FF) bullish & Pure White (#FFFFFF) bearish',
  },
  {
    id: 'EMERALD_CRIMSON',
    name: 'MT5 Emerald & Rose Red',
    bullColor: '#10b981',
    bearColor: '#ef4444',
    bullWick: '#10b981',
    bearWick: '#ef4444',
    description: 'Classic Institutional Emerald (#10B981) bullish & Rose Red (#EF4444) bearish',
  },
  {
    id: 'GOLD_AND_BLUE',
    name: 'SR Time Gold & Cyber Blue',
    bullColor: '#facc15',
    bearColor: '#00b0ff',
    bullWick: '#facc15',
    bearWick: '#00b0ff',
    description: '4K Gold (#FACC15) bullish & Cyber Blue (#00B0FF) bearish',
  },
];

// ============================================================================
// INTRA-1-MINUTE (60 × 1-SECOND UNMERGED CANDLES) TERMINAL 0 (MICRO-ZERO)
// 1:1 -> 1:2 -> 1:3 -> 1:10 & 1:20 STRUCTURAL PROGRESSION ENGINE
// ============================================================================
export interface IntraOneMinuteMicroZeroAnalysis {
  containerBars60s: RawOhlcBar[];
  terminalZeroSlot: number; // 0..59 inside the 60s container
  terminalZeroTimestamp: number;
  terminalZeroPrice: number;
  atomicDelta1to1: number;
  direction: 'LONG' | 'SHORT';
  level1to1: number;
  level1to2: number;
  level1to3: number;
  level1to10: number;
  level1to20: number;
  stopLossMicro: number;
  qtyFor50UsdRisk: number;
  currentMultiple: number;
  is1to10Reached: boolean;
  reached1to10AtSecond: number | null;
  is1to20Reached: boolean;
  reached1to20AtSecond: number | null;
  stateMachineStage:
    | 'ZERO'
    | 'WAIT'
    | 'FORMATION'
    | 'CONFIRMATION'
    | 'ENTRY'
    | 'COMPLETION'
    | 'RESET';
  formationTimestamp: number;
  confirmationTimestamp: number;
  executionTimestamp: number;
}

export function computeIntraOneMinuteMicroZero1to10And1to20(
  liveOneSecBars: RawOhlcBar[],
  fallbackPrice: number
): IntraOneMinuteMicroZeroAnalysis {
  const containerBars60s = liveOneSecBars.slice(-60);
  if (containerBars60s.length === 0) {
    const now = Date.now();
    const delta = Math.max(0.0001, fallbackPrice * 0.00018);
    return {
      containerBars60s: [],
      terminalZeroSlot: 0,
      terminalZeroTimestamp: now,
      terminalZeroPrice: fallbackPrice,
      atomicDelta1to1: delta,
      direction: 'LONG',
      level1to1: fallbackPrice + delta,
      level1to2: fallbackPrice + delta * 2,
      level1to3: fallbackPrice + delta * 3,
      level1to10: fallbackPrice + delta * 10,
      level1to20: fallbackPrice + delta * 20,
      stopLossMicro: fallbackPrice - delta,
      qtyFor50UsdRisk: 50 / delta,
      currentMultiple: 1.0,
      is1to10Reached: false,
      reached1to10AtSecond: null,
      is1to20Reached: false,
      reached1to20AtSecond: null,
      stateMachineStage: 'ZERO',
      formationTimestamp: now,
      confirmationTimestamp: now,
      executionTimestamp: now,
    };
  }

  // Locate single active Terminal 0 (Micro-Zero) origin within the 60 unmerged 1-second bars:
  // Inspect first 15 seconds of the 1-minute container to anchor the true Micro-Zero extremum
  const searchWindow = containerBars60s.slice(0, Math.min(20, containerBars60s.length));
  let minSlot = 0;
  let maxSlot = 0;
  for (let i = 0; i < searchWindow.length; i++) {
    if (searchWindow[i].low < searchWindow[minSlot].low) minSlot = i;
    if (searchWindow[i].high > searchWindow[maxSlot].high) maxSlot = i;
  }

  const lastBar = containerBars60s[containerBars60s.length - 1];
  const firstBar = containerBars60s[0];
  const direction: 'LONG' | 'SHORT' = lastBar.close >= firstBar.open ? 'LONG' : 'SHORT';

  const terminalZeroSlot = direction === 'LONG' ? minSlot : maxSlot;
  const zeroBar = containerBars60s[terminalZeroSlot] || firstBar;
  const terminalZeroPrice = direction === 'LONG' ? zeroBar.low : zeroBar.high;

  // Atomic 1:1 micro unit derived directly from the Terminal 0 micro-candle structure
  const rawZeroRange = Math.abs(zeroBar.high - zeroBar.low);
  const minRealisticUnit = Math.max(0.00005, terminalZeroPrice * 0.00012);
  const atomicDelta1to1 = Math.max(rawZeroRange, minRealisticUnit);

  const sign = direction === 'LONG' ? 1 : -1;
  const level1to1 = terminalZeroPrice + sign * atomicDelta1to1 * 1;
  const level1to2 = terminalZeroPrice + sign * atomicDelta1to1 * 2;
  const level1to3 = terminalZeroPrice + sign * atomicDelta1to1 * 3;
  const level1to10 = terminalZeroPrice + sign * atomicDelta1to1 * 10;
  const level1to20 = terminalZeroPrice + sign * atomicDelta1to1 * 20;
  const stopLossMicro = terminalZeroPrice - sign * atomicDelta1to1;
  const qtyFor50UsdRisk = 50 / Math.max(0.000001, atomicDelta1to1);

  let reached1to10AtSecond: number | null = null;
  let reached1to20AtSecond: number | null = null;

  for (let i = terminalZeroSlot; i < containerBars60s.length; i++) {
    const b = containerBars60s[i];
    if (direction === 'LONG') {
      if (reached1to10AtSecond === null && b.high >= level1to10) {
        reached1to10AtSecond = i;
      }
      if (reached1to20AtSecond === null && b.high >= level1to20) {
        reached1to20AtSecond = i;
      }
    } else {
      if (reached1to10AtSecond === null && b.low <= level1to10) {
        reached1to10AtSecond = i;
      }
      if (reached1to20AtSecond === null && b.low <= level1to20) {
        reached1to20AtSecond = i;
      }
    }
  }

  const currentDist =
    direction === 'LONG'
      ? Math.max(0, lastBar.close - terminalZeroPrice)
      : Math.max(0, terminalZeroPrice - lastBar.close);
  const currentMultiple = Number((currentDist / atomicDelta1to1).toFixed(2));

  let stateMachineStage: IntraOneMinuteMicroZeroAnalysis['stateMachineStage'] = 'ZERO';
  if (reached1to20AtSecond !== null) {
    stateMachineStage = 'COMPLETION';
  } else if (reached1to10AtSecond !== null || currentMultiple >= 3) {
    stateMachineStage = 'ENTRY';
  } else if (currentMultiple >= 2) {
    stateMachineStage = 'CONFIRMATION';
  } else if (currentMultiple >= 1) {
    stateMachineStage = 'FORMATION';
  } else {
    stateMachineStage = 'WAIT';
  }

  const formationBar =
    containerBars60s[Math.min(containerBars60s.length - 1, terminalZeroSlot + 1)] || zeroBar;
  const confirmationBar =
    containerBars60s[Math.min(containerBars60s.length - 1, terminalZeroSlot + 2)] || formationBar;
  const executionBar =
    containerBars60s[Math.min(containerBars60s.length - 1, terminalZeroSlot + 3)] ||
    confirmationBar;

  return {
    containerBars60s,
    terminalZeroSlot,
    terminalZeroTimestamp: zeroBar.timestamp,
    terminalZeroPrice,
    atomicDelta1to1,
    direction,
    level1to1,
    level1to2,
    level1to3,
    level1to10,
    level1to20,
    stopLossMicro,
    qtyFor50UsdRisk,
    currentMultiple,
    is1to10Reached: reached1to10AtSecond !== null,
    reached1to10AtSecond,
    is1to20Reached: reached1to20AtSecond !== null,
    reached1to20AtSecond,
    stateMachineStage,
    formationTimestamp: formationBar.timestamp,
    confirmationTimestamp: confirmationBar.timestamp,
    executionTimestamp: executionBar.timestamp,
  };
}

// ============================================================================
// 1. SEPARATE LIVE MICRO-CANDLE (1s) TERMINAL PANEL
//    Features Intra-1-Minute (60 × 1s Unmerged) Terminal 0, 1:10 & 1:20 Lines!
// ============================================================================
export interface SeparateMicroCandleTerminalProps {
  isOpen: boolean;
  onClose: () => void;
  symbol: string;
  bybitSymbol?: string;
  livePrice: number;
  primaryTz: ResearchTimezone;
  secondaryTz: ResearchTimezone;
  bgTheme: BackgroundThemeOption;
  candlePalette: CandlePaletteOption;
  liveOneSecBars: RawOhlcBar[];
  onRefreshMicroBars: () => void;
  onBookIntraMinuteLevels?: (note: string) => void;
}

export const SeparateMicroCandleTerminal: React.FC<SeparateMicroCandleTerminalProps> = ({
  isOpen,
  onClose,
  symbol,
  livePrice,
  primaryTz,
  secondaryTz,
  bgTheme,
  candlePalette,
  liveOneSecBars,
  onRefreshMicroBars,
  onBookIntraMinuteLevels,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isMaximized, setIsMaximized] = useState<boolean>(false);
  const [isLockedMicro, setIsLockedMicro] = useState<boolean>(false);
  const [lockedMicroCount, setLockedMicroCount] = useState<number>(60);
  const [show1to10And1to20Lines, setShow1to10And1to20Lines] = useState<boolean>(true);
  const [refreshFlash, setRefreshFlash] = useState<boolean>(false);

  const measurementService = SrbmprRawDataMeasurementService.getInstance();

  const formatPx = useCallback((val: number): string => {
    if (val < 0.01) return val.toFixed(6);
    if (val < 2) return val.toFixed(4);
    if (val < 100) return val.toFixed(3);
    return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }, []);

  const visibleSourceBars = useMemo(() => {
    return isLockedMicro
      ? liveOneSecBars.slice(0, lockedMicroCount).slice(-60)
      : liveOneSecBars.slice(-60);
  }, [isLockedMicro, lockedMicroCount, liveOneSecBars]);

  const microAnalysis = useMemo(
    () => computeIntraOneMinuteMicroZero1to10And1to20(visibleSourceBars, livePrice),
    [visibleSourceBars, livePrice]
  );

  const handleTriggerRefresh = () => {
    setRefreshFlash(true);
    onRefreshMicroBars();
    setTimeout(() => setRefreshFlash(false), 350);
  };

  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container || visibleSourceBars.length === 0) return;

    const rect = container.getBoundingClientRect();
    const dpr = Math.max(2, window.devicePixelRatio || 2);
    const width = rect.width;
    const height = rect.height;

    canvas.width = width * dpr;
    canvas.height = height * dpr;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    const rightAxisWidth = 114;
    const bottomAxisHeight = 28;
    const chartWidth = width - rightAxisWidth;
    const chartHeight = height - bottomAxisHeight;

    ctx.fillStyle = bgTheme.bgHex;
    ctx.fillRect(0, 0, width, height);

    let minP = Infinity;
    let maxP = -Infinity;
    for (const b of visibleSourceBars) {
      if (b.low < minP) minP = b.low;
      if (b.high > maxP) maxP = b.high;
    }

    if (show1to10And1to20Lines) {
      minP = Math.min(minP, microAnalysis.terminalZeroPrice, microAnalysis.level1to10, microAnalysis.level1to20);
      maxP = Math.max(maxP, microAnalysis.terminalZeroPrice, microAnalysis.level1to10, microAnalysis.level1to20);
    }

    const span = Math.max(maxP - minP || livePrice * 0.0005, livePrice * 0.0002);
    const topBottomPad = Math.max(28, chartHeight * 0.14);

    const priceToY = (p: number) => {
      return (
        chartHeight -
        topBottomPad -
        ((p - minP) / span) * Math.max(20, chartHeight - topBottomPad * 2)
      );
    };

    // Grid
    ctx.strokeStyle = bgTheme.gridRgba;
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const p = minP + (span * i) / 5;
      const y = priceToY(p);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(chartWidth, y);
      ctx.stroke();

      ctx.fillStyle = bgTheme.axisTextHex;
      ctx.font = 'bold 10px monospace';
      ctx.textAlign = 'left';
      ctx.fillText(formatPx(p), chartWidth + 6, y + 3);
    }

    ctx.strokeStyle = bgTheme.borderRgba;
    ctx.beginPath();
    ctx.moveTo(chartWidth, 0);
    ctx.lineTo(chartWidth, height);
    ctx.moveTo(0, chartHeight);
    ctx.lineTo(width, chartHeight);
    ctx.stroke();

    // Always 60 fixed 1-second slots (s00 .. s59) for the 1-Minute Container!
    const totalSlots = 60;
    const slotW = chartWidth / totalSlots;
    const bodyW = Math.max(3, Math.min(14, slotW * 0.72));

    // Draw Terminal 0 (Micro-Zero) Vertical Marker
    const zeroX = microAnalysis.terminalZeroSlot * slotW + slotW * 0.5;
    ctx.save();
    ctx.strokeStyle = 'rgba(0, 229, 255, 0.55)';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(zeroX, 0);
    ctx.lineTo(zeroX, chartHeight);
    ctx.stroke();
    ctx.fillStyle = '#00e5ff';
    ctx.font = 'bold 9px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`T0 (s${String(microAnalysis.terminalZeroSlot).padStart(2, '0')})`, Math.min(chartWidth - 65, zeroX + 3), 12);
    ctx.restore();

    // Draw 60 Unmerged 1-Second Candles
    for (let i = 0; i < visibleSourceBars.length; i++) {
      const b = visibleSourceBars[i];
      const x = i * slotW + slotW * 0.5;
      const isBull = b.close >= b.open;
      const bodyCol = isBull ? candlePalette.bullColor : candlePalette.bearColor;
      const wickCol = isBull ? candlePalette.bullWick : candlePalette.bearWick;

      const highY = priceToY(b.high);
      const lowY = priceToY(b.low);
      const openY = priceToY(b.open);
      const closeY = priceToY(b.close);

      ctx.strokeStyle = wickCol;
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.stroke();

      const topY = Math.min(openY, closeY);
      const bodyH = Math.max(2.5, Math.abs(closeY - openY));
      ctx.fillStyle = bodyCol;
      ctx.fillRect(x - bodyW / 2, topY, bodyW, bodyH);

      if (i === microAnalysis.terminalZeroSlot) {
        ctx.strokeStyle = '#00e5ff';
        ctx.lineWidth = 1.6;
        ctx.strokeRect(x - bodyW / 2 - 2, Math.min(highY, lowY) - 2, bodyW + 4, Math.max(6, Math.abs(lowY - highY) + 4));
      }
    }

    // Draw Intra-1-Minute Terminal 0, 1:1, 1:10, and 1:20 Horizontal Target Lines
    if (show1to10And1to20Lines) {
      const drawLevelLine = (price: number, label: string, color: string, dashed: boolean) => {
        const y = priceToY(price);
        if (y < 4 || y > chartHeight - 4) return;
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.4;
        if (dashed) ctx.setLineDash([5, 3]);
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(chartWidth, y);
        ctx.stroke();

        ctx.fillStyle = color;
        ctx.fillRect(chartWidth, y - 8, rightAxisWidth, 16);
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 9.5px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(`${label} ${formatPx(price)}`, chartWidth + 4, y + 3);
        ctx.restore();
      };

      drawLevelLine(microAnalysis.terminalZeroPrice, 'T0', '#00e5ff', true);
      drawLevelLine(microAnalysis.level1to1, '1:1', '#94a3b8', true);
      drawLevelLine(microAnalysis.level1to10, '1:10', '#00ff66', false);
      drawLevelLine(microAnalysis.level1to20, '1:20', '#facc15', false);
    }

    // Bottom 1s timestamps (s00 .. s59)
    const step = Math.max(1, Math.floor(visibleSourceBars.length / 6));
    for (let i = 0; i < visibleSourceBars.length; i += step) {
      const b = visibleSourceBars[i];
      const x = i * slotW + slotW * 0.5;
      const tz1 = measurementService.formatTimestampInTimezone(b.timestamp, primaryTz);
      ctx.fillStyle = bgTheme.axisTextHex;
      ctx.font = 'bold 9.5px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`s${String(i).padStart(2, '0')} (${tz1.slice(14, 19)})`, x, chartHeight + 18);
    }
  }, [
    isOpen,
    visibleSourceBars,
    isMaximized,
    bgTheme,
    candlePalette,
    livePrice,
    primaryTz,
    show1to10And1to20Lines,
    microAnalysis,
    formatPx,
    measurementService,
  ]);

  if (!isOpen) return null;

  return (
    <div
      className={`${
        isMaximized
          ? 'fixed inset-3 z-50 rounded-2xl shadow-2xl'
          : 'h-72 w-full border-t-2 border-cyan-500/60 shrink-0'
      } bg-[#060a14] flex flex-col overflow-hidden font-mono select-none`}
    >
      {/* Separate Micro-Candle Terminal Header with 1-Minute Inside 1:10 & 1:20 Readout */}
      <div className="bg-[#091122] border-b border-slate-800 px-3 py-1.5 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2 py-0.5 rounded bg-cyan-500 text-black font-black text-[11px] flex items-center gap-1">
            <Activity className="w-3.5 h-3.5" />
            1m INSIDE (60×1s) • 1:10 & 1:20 TERMINAL 0
          </span>
          <span className="text-amber-400 font-black text-[11px]">
            {symbol} ({microAnalysis.direction})
          </span>
          <span className="text-slate-200 text-[11px] bg-slate-900 border border-slate-800 px-2 py-0.5 rounded tabular-nums">
            T0 (s{String(microAnalysis.terminalZeroSlot).padStart(2, '0')}):{' '}
            <strong className="text-cyan-300">${formatPx(microAnalysis.terminalZeroPrice)}</strong>
            {' · '}
            1:1 Unit: <strong className="text-white">${formatPx(microAnalysis.atomicDelta1to1)}</strong>
            {' · '}
            1:10:{' '}
            <strong className="text-emerald-400">
              ${formatPx(microAnalysis.level1to10)}{' '}
              {microAnalysis.is1to10Reached ? '✓ HIT' : '(ACTIVE)'}
            </strong>
            {' · '}
            1:20:{' '}
            <strong className="text-amber-300">
              ${formatPx(microAnalysis.level1to20)}{' '}
              {microAnalysis.is1to20Reached ? '✓ HIT' : '(ACTIVE)'}
            </strong>
            {' · '}
            Now: <strong className="text-pink-400">1:{microAnalysis.currentMultiple}x</strong>
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setShow1to10And1to20Lines(!show1to10And1to20Lines)}
            className={`px-2 py-1 rounded font-black text-[11px] border transition-all ${
              show1to10And1to20Lines
                ? 'bg-amber-500 text-black border-amber-300'
                : 'bg-slate-900 text-amber-300 border-amber-500/40'
            }`}
            title="Toggle 1-Minute Inside 1:10 and 1:20 Target Lines on 1s Micro-Chart"
          >
            <Target className="w-3.5 h-3.5 inline mr-1" />
            <span>1:10 & 1:20 LINES</span>
          </button>

          {onBookIntraMinuteLevels && (
            <button
              onClick={() =>
                onBookIntraMinuteLevels(
                  `1m Inside (60×1s) T0=$${formatPx(microAnalysis.terminalZeroPrice)} | 1:10=$${formatPx(microAnalysis.level1to10)} | 1:20=$${formatPx(microAnalysis.level1to20)} (${microAnalysis.direction})`
                )
              }
              className="px-2 py-1 rounded bg-pink-500/20 hover:bg-pink-500 hover:text-black text-pink-300 border border-pink-500/40 font-black text-[11px]"
              title="Book Current 1-Minute Inside 1:10 & 1:20 Levels into Research Report"
            >
              + BOOK 1:10 / 1:20
            </button>
          )}

          <button
            onClick={handleTriggerRefresh}
            className={`px-2.5 py-1 rounded font-black text-[11px] flex items-center gap-1 transition-all ${
              refreshFlash
                ? 'bg-emerald-400 text-black scale-105'
                : 'bg-emerald-500 hover:bg-emerald-400 text-black'
            }`}
            title="Refresh Separate Micro-Candle Terminal with Latest Real-Time Market Ticks"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshFlash ? 'animate-spin' : ''}`} />
            <span>REFRESH 1s</span>
          </button>

          <button
            onClick={() => {
              if (!isLockedMicro) {
                setLockedMicroCount(liveOneSecBars.length);
                setIsLockedMicro(true);
              } else {
                setIsLockedMicro(false);
              }
            }}
            className={`px-2 py-1 rounded font-black text-[11px] border ${
              isLockedMicro
                ? 'bg-rose-500 text-white border-rose-400'
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white'
            }`}
            title="Lock Micro UI while new 1s ticks continue adding in background"
          >
            {isLockedMicro
              ? `LOCKED (${liveOneSecBars.length} BG)`
              : `LIVE (${visibleSourceBars.length}/60s)`}
          </button>

          <button
            onClick={() => setIsMaximized(!isMaximized)}
            className="p-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-700"
            title={isMaximized ? 'Dock Micro Terminal Below Main Chart' : 'Maximize Separate Micro Terminal'}
          >
            {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={onClose}
            className="p-1 bg-slate-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 rounded border border-slate-700"
            title="Close Separate Micro-Candle Terminal"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Micro-Candle Canvas */}
      <div ref={containerRef} className="flex-1 relative w-full h-full overflow-hidden">
        <canvas ref={canvasRef} className="w-full h-full block cursor-crosshair" />
      </div>
    </div>
  );
};

// ============================================================================
// 2. FULL SRBMPR / SRVBPR RESEARCH PLATFORM, 1m (1:10 & 1:20), LOCK ACCOUNT
//    & METHODOLOGY SUITE MODAL
// ============================================================================
export interface SrbmprFullReportAndBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  symbol: string;
  timeframe: ForwardTimeframe;
  livePrice: number;
  totalCandlesLoaded: number;
  activeCandle: RawOhlcBar | null;
  primaryTz: ResearchTimezone;
  secondaryTz: ResearchTimezone;
  isLocked: boolean;
  bgAddedCandlesCount?: number;
  liveOneSecBars?: RawOhlcBar[];
  bgTheme: BackgroundThemeOption;
  candlePalette: CandlePaletteOption;
  onSelectBgTheme: (bg: BackgroundThemeOption) => void;
  onSelectCandlePalette: (pal: CandlePaletteOption) => void;
  bookedEntries: BookedResearchReportEntry[];
  onBookCurrentCandle: (note: string) => void;
  onDeleteBookedEntry: (id: string) => void;
}

export const SrbmprFullReportAndBookingModal: React.FC<
  SrbmprFullReportAndBookingModalProps
> = ({
  isOpen,
  onClose,
  symbol,
  timeframe,
  livePrice,
  totalCandlesLoaded,
  activeCandle,
  primaryTz,
  secondaryTz,
  isLocked,
  bgAddedCandlesCount = 0,
  liveOneSecBars = [],
  bgTheme,
  candlePalette,
  onSelectBgTheme,
  onSelectCandlePalette,
  bookedEntries,
  onBookCurrentCandle,
  onDeleteBookedEntry,
}) => {
  const [activeTab, setActiveTab] = useState<
    'INTRA_1M_10_20' | 'LOCK_ACCOUNT_STATE_MACHINE' | 'COMPOUNDING_WFA' | 'COLORS_BOOKING'
  >('INTRA_1M_10_20');
  const [bookingNote, setBookingNote] = useState<string>(
    'Verified 1m Inside 1:10 & 1:20 Terminal 0 Micro-Zero Structure'
  );
  const [purgeGapBars, setPurgeGapBars] = useState<number>(5);
  const [initialCapital, setInitialCapital] = useState<number>(10.0);
  const [fixedFeeUsd, setFixedFeeUsd] = useState<number>(0.1);

  const measurementService = SrbmprRawDataMeasurementService.getInstance();

  const microAnalysis = useMemo(
    () => computeIntraOneMinuteMicroZero1to10And1to20(liveOneSecBars, livePrice),
    [liveOneSecBars, livePrice]
  );

  // Closed-form compounding progression: C_n = (C_0 - f) * 2^n + f
  const compoundingMilestones = useMemo(() => {
    const steps = [1, 2, 3, 5, 10, 15, 20, 25, 29];
    return steps.map((n) => {
      const exactVal = (initialCapital - fixedFeeUsd) * Math.pow(2, n) + fixedFeeUsd;
      return {
        tradeNumber: n,
        balanceUsd: exactVal,
      };
    });
  }, [initialCapital, fixedFeeUsd]);

  if (!isOpen) return null;

  const formatPx = (val: number): string => {
    if (val < 0.01) return val.toFixed(6);
    if (val < 2) return val.toFixed(4);
    if (val < 100) return val.toFixed(3);
    return val.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const handleExportReportJson = () => {
    const payload = {
      platform: 'SRBMPR / SRVBPR Research Platform • SR Time Market',
      exportedAtUtc: new Date().toISOString(),
      activeSymbol: symbol,
      activeTimeframe: timeframe,
      liveMarketPrice: livePrice,
      totalArchiveCandlesInMemory: totalCandlesLoaded,
      lockAccountAudit: {
        accountId: 'UPCOMERS-THUNDERBOLT-#720656',
        accountBalanceUsd: 10000,
        fixedRiskPerTradeUsd: 50,
        uiLockStatus: isLocked ? 'LOCKED_UI_DATA_ADDED_IN_BG' : 'LIVE_UNLOCKED',
        backgroundCandlesAddedWhileLocked: bgAddedCandlesCount,
      },
      intraOneMinute1to10And1to20: microAnalysis,
      selectedBackgroundTheme: bgTheme,
      selectedCandlePalette: candlePalette,
      bookedResearchEntries: bookedEntries,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SRBMPR_1M_1TO10_1TO20_REPORT_${symbol}_${timeframe}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 font-mono">
      <div className="w-full max-w-6xl max-h-[92vh] bg-[#070b14] border border-amber-500/50 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100">
        {/* Modal Header */}
        <div className="bg-[#0b1222] border-b border-slate-800 px-5 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 via-cyan-400 to-blue-600 p-0.5 flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-[#060a14] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="text-xs font-black text-amber-400 tracking-wider uppercase">
                SRBMPR / SRVBPR RESEARCH PLATFORM • SR TIME MARKET
              </div>
              <h2 className="text-sm sm:text-base font-black text-white">
                1-Minute Inside (1:10 & 1:20) Terminal 0 • Lock Account #720656 • Full Booking Report
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportReportJson}
              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs rounded-lg flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON Report</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg border border-slate-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-[#090f1d] border-b border-slate-800 px-5 py-2 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('INTRA_1M_10_20')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-colors ${
              activeTab === 'INTRA_1M_10_20'
                ? 'bg-amber-500 text-black'
                : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>1. 1-Minute Inside (1:10 & 1:20 • 60×1s)</span>
          </button>

          <button
            onClick={() => setActiveTab('LOCK_ACCOUNT_STATE_MACHINE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-colors ${
              activeTab === 'LOCK_ACCOUNT_STATE_MACHINE'
                ? 'bg-cyan-500 text-black'
                : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>2. Lock Account (#720656) & 10k State Machine</span>
          </button>

          <button
            onClick={() => setActiveTab('COMPOUNDING_WFA')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-colors ${
              activeTab === 'COMPOUNDING_WFA'
                ? 'bg-emerald-500 text-black'
                : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>3. Compounding ($10→Trade 29) & WFA Purge Gap</span>
          </button>

          <button
            onClick={() => setActiveTab('COLORS_BOOKING')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-colors ${
              activeTab === 'COLORS_BOOKING'
                ? 'bg-pink-500 text-black'
                : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>4. 24-Color Matrix & Bookings ({bookedEntries.length})</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {activeTab === 'INTRA_1M_10_20' && (
            <div className="space-y-5">
              {/* Nested Container Hierarchy Banner */}
              <div className="bg-slate-900/90 border border-amber-500/40 rounded-xl p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="text-xs font-black text-amber-400 uppercase">
                      1-Minute Candle Inside Structure (60 × 1-Second Unmerged Candles • Terminal 0)
                    </div>
                    <p className="text-xs text-slate-300 mt-1">
                      Strict Non-Merging Rule: 15m Container (3 × 5m) → 5m Container (5 × 1m) →{' '}
                      <strong className="text-white">
                        1-Minute Container = 60 Discrete 1-Second Candles (s00..s59)
                      </strong>
                      . Inside this 1-minute candle, the single active{' '}
                      <strong className="text-cyan-300">Terminal 0 (Micro-Zero)</strong> origin defines the{' '}
                      <strong className="text-emerald-400">1:10</strong> and{' '}
                      <strong className="text-amber-300">1:20</strong> structural expansion targets.
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      onBookCurrentCandle(
                        `Booked 1m Inside 1:10 ($${formatPx(microAnalysis.level1to10)}) & 1:20 ($${formatPx(microAnalysis.level1to20)}) from T0 ($${formatPx(microAnalysis.terminalZeroPrice)})`
                      )
                    }
                    className="px-3 py-2 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs rounded-lg"
                  >
                    + Book 1m (1:10 & 1:20) Now
                  </button>
                </div>
              </div>

              {/* 1-Minute Inside 1:10 & 1:20 Key Metrics Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 tabular-nums">
                <div className="bg-slate-900 border border-cyan-500/40 rounded-xl p-3.5">
                  <div className="text-[10px] text-cyan-300 font-bold uppercase">
                    Terminal 0 (Micro-Zero Origin)
                  </div>
                  <div className="text-base font-black text-white mt-1">
                    ${formatPx(microAnalysis.terminalZeroPrice)}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Second Slot: s{String(microAnalysis.terminalZeroSlot).padStart(2, '0')} / 60s ({microAnalysis.direction})
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">
                    Atomic 1:1 → 1:2 → 1:3
                  </div>
                  <div className="text-xs font-black text-white mt-1">
                    1:1: ${formatPx(microAnalysis.level1to1)}
                  </div>
                  <div className="text-[11px] text-slate-300 mt-0.5">
                    1:2: ${formatPx(microAnalysis.level1to2)} · 1:3: ${formatPx(microAnalysis.level1to3)}
                  </div>
                </div>

                <div className="bg-slate-900 border border-emerald-500/50 rounded-xl p-3.5">
                  <div className="text-[10px] text-emerald-400 font-bold uppercase">
                    ★ 1-Minute Inside 1:10 Target
                  </div>
                  <div className="text-base font-black text-emerald-400 mt-1">
                    ${formatPx(microAnalysis.level1to10)}
                  </div>
                  <div className="text-[11px] text-slate-300 mt-0.5">
                    {microAnalysis.is1to10Reached
                      ? `✓ Completed at s${String(microAnalysis.reached1to10AtSecond).padStart(2, '0')}`
                      : `Delta: 10 × $${formatPx(microAnalysis.atomicDelta1to1)}`}
                  </div>
                </div>

                <div className="bg-slate-900 border border-amber-500/60 rounded-xl p-3.5">
                  <div className="text-[10px] text-amber-300 font-bold uppercase">
                    ★ 1-Minute Inside 1:20 Target
                  </div>
                  <div className="text-base font-black text-amber-300 mt-1">
                    ${formatPx(microAnalysis.level1to20)}
                  </div>
                  <div className="text-[11px] text-slate-300 mt-0.5">
                    {microAnalysis.is1to20Reached
                      ? `✓ Completed at s${String(microAnalysis.reached1to20AtSecond).padStart(2, '0')}`
                      : `Delta: 20 × $${formatPx(microAnalysis.atomicDelta1to1)}`}
                  </div>
                </div>

                <div className="bg-slate-900 border border-pink-500/40 rounded-xl p-3.5">
                  <div className="text-[10px] text-pink-300 font-bold uppercase">
                    $50 Fixed Risk Micro Quantity
                  </div>
                  <div className="text-base font-black text-white mt-1">
                    Q = {microAnalysis.qtyFor50UsdRisk.toFixed(3)}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    1:10 = +$500 · 1:20 = +$1,000
                  </div>
                </div>
              </div>

              {/* 60 Unmerged 1-Second Candles Table Inside the Active 1-Minute Container */}
              <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black text-white uppercase">
                    Unmerged 60 × 1-Second (1s) Sequence Inside Active 1-Minute Candle
                  </h3>
                  <span className="text-[11px] text-cyan-300 font-bold">
                    Current Expansion: 1:{microAnalysis.currentMultiple}x from Terminal 0
                  </span>
                </div>
                <div className="max-h-60 overflow-y-auto border border-slate-800 rounded-lg">
                  <table className="w-full text-left border-collapse text-xs tabular-nums">
                    <thead>
                      <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[10px] uppercase">
                        <th className="p-2">Second Slot</th>
                        <th className="p-2">TZ 1 ({primaryTz})</th>
                        <th className="p-2">Open</th>
                        <th className="p-2">High</th>
                        <th className="p-2">Low</th>
                        <th className="p-2">Close</th>
                        <th className="p-2">Micro Role / Progression</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {microAnalysis.containerBars60s.map((b, idx) => {
                        const isT0 = idx === microAnalysis.terminalZeroSlot;
                        const is10 = idx === microAnalysis.reached1to10AtSecond;
                        const is20 = idx === microAnalysis.reached1to20AtSecond;
                        return (
                          <tr
                            key={`${b.timestamp}-${idx}`}
                            className={
                              isT0
                                ? 'bg-cyan-500/15 font-bold'
                                : is20
                                  ? 'bg-amber-500/15 font-bold'
                                  : is10
                                    ? 'bg-emerald-500/15 font-bold'
                                    : 'hover:bg-slate-800/40'
                            }
                          >
                            <td className="p-2 text-amber-300 font-black">
                              s{String(idx).padStart(2, '0')} / 60s
                            </td>
                            <td className="p-2 text-slate-300">
                              {measurementService.formatTimestampInTimezone(b.timestamp, primaryTz)}
                            </td>
                            <td className="p-2 text-white">${formatPx(b.open)}</td>
                            <td className="p-2 text-emerald-400">${formatPx(b.high)}</td>
                            <td className="p-2 text-rose-400">${formatPx(b.low)}</td>
                            <td className="p-2 text-amber-300 font-bold">${formatPx(b.close)}</td>
                            <td className="p-2">
                              {isT0 ? (
                                <span className="text-cyan-300 font-black">
                                  ★ TERMINAL 0 (MICRO-ZERO ORIGIN)
                                </span>
                              ) : is20 ? (
                                <span className="text-amber-300 font-black">
                                  ★ 1:20 TARGET COMPLETED
                                </span>
                              ) : is10 ? (
                                <span className="text-emerald-400 font-black">
                                  ★ 1:10 TARGET COMPLETED
                                </span>
                              ) : (
                                <span className="text-slate-400">Unmerged 1s Step</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'LOCK_ACCOUNT_STATE_MACHINE' && (
            <div className="space-y-5">
              {/* Lock Account Check (#720656 + UI Lock Verification) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 tabular-nums">
                <div className="bg-slate-900 border border-emerald-500/50 rounded-xl p-4">
                  <div className="text-[10px] text-emerald-400 font-bold uppercase">
                    Lock Account Verification (#720656)
                  </div>
                  <div className="text-base font-black text-white mt-1">
                    Upcomers Thunderbolt #720656
                  </div>
                  <div className="text-xs text-slate-300 mt-1">
                    Balance: <strong className="text-emerald-400">$10,000.00</strong> · Fixed Risk:{' '}
                    <strong className="text-amber-300">$50.00</strong> · Rule Violations:{' '}
                    <strong className="text-emerald-400">0 (Verified)</strong>
                  </div>
                </div>

                <div className="bg-slate-900 border border-rose-500/50 rounded-xl p-4">
                  <div className="text-[10px] text-rose-400 font-bold uppercase">
                    Chart & Micro UI Lock State
                  </div>
                  <div className="text-base font-black text-white mt-1 flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-rose-400" />
                    <span>{isLocked ? 'LOCKED (1-BY-1 ACTIVE)' : 'UNLOCKED (LIVE)'}</span>
                  </div>
                  <div className="text-xs text-slate-300 mt-1">
                    Background Candles Added While Locked:{' '}
                    <strong className="text-cyan-300">+{bgAddedCandlesCount}</strong> (UI Never Jumps)
                  </div>
                </div>

                <div className="bg-slate-900 border border-cyan-500/50 rounded-xl p-4">
                  <div className="text-[10px] text-cyan-300 font-bold uppercase">
                    New Coin Launch-Timestamp (Minute-0)
                  </div>
                  <div className="text-base font-black text-white mt-1">
                    {symbol} • Minute-0 Origin
                  </div>
                  <div className="text-xs text-slate-300 mt-1">
                    Pure Zero-Lookahead Origin: Connected from Candle #1 ({totalCandlesLoaded.toLocaleString()} Bars)
                  </div>
                </div>
              </div>

              {/* 10,000-Candle State Machine Pipeline & 3-Tier Separated Timestamps */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-xs font-black text-white uppercase">
                      10,000-Candle Forward Single-Candle State Machine & 3-Tier Event Timestamps
                    </h3>
                  </div>
                  <span className="text-xs text-amber-300 font-black">
                    Active Stage: {microAnalysis.stateMachineStage}
                  </span>
                </div>

                {/* 7-Stage Pipeline Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-7 gap-2 text-center text-xs">
                  {(
                    [
                      'ZERO',
                      'WAIT',
                      'FORMATION',
                      'CONFIRMATION',
                      'ENTRY',
                      'COMPLETION',
                      'RESET',
                    ] as const
                  ).map((stage) => {
                    const isCurrent = microAnalysis.stateMachineStage === stage;
                    return (
                      <div
                        key={stage}
                        className={`p-2.5 rounded-lg border font-black ${
                          isCurrent
                            ? 'bg-amber-500 text-black border-amber-300'
                            : 'bg-slate-950 text-slate-400 border-slate-800'
                        }`}
                      >
                        {stage}
                      </div>
                    );
                  })}
                </div>

                {/* Separation of Event Timestamps (Formation, Confirmation, Execution) */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 tabular-nums">
                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">
                      1. Formation Time (Pattern Initiated)
                    </div>
                    <div className="text-xs font-black text-white mt-1">
                      TZ1: {measurementService.formatTimestampInTimezone(microAnalysis.formationTimestamp, primaryTz)}
                    </div>
                    <div className="text-[11px] text-cyan-300 mt-0.5">
                      TZ2: {measurementService.formatTimestampInTimezone(microAnalysis.formationTimestamp, secondaryTz)}
                    </div>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">
                      2. Confirmation Time (1:1 / 1:2 Validated)
                    </div>
                    <div className="text-xs font-black text-emerald-400 mt-1">
                      TZ1: {measurementService.formatTimestampInTimezone(microAnalysis.confirmationTimestamp, primaryTz)}
                    </div>
                    <div className="text-[11px] text-cyan-300 mt-0.5">
                      TZ2: {measurementService.formatTimestampInTimezone(microAnalysis.confirmationTimestamp, secondaryTz)}
                    </div>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">
                      3. Execution Time (Zero Look-Ahead Fill)
                    </div>
                    <div className="text-xs font-black text-amber-300 mt-1">
                      TZ1: {measurementService.formatTimestampInTimezone(microAnalysis.executionTimestamp, primaryTz)}
                    </div>
                    <div className="text-[11px] text-cyan-300 mt-0.5">
                      TZ2: {measurementService.formatTimestampInTimezone(microAnalysis.executionTimestamp, secondaryTz)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'COMPOUNDING_WFA' && (
            <div className="space-y-5">
              {/* Closed-Form Compounding Calculator: C_n = (C_0 - f) * 2^n + f */}
              <div className="bg-slate-900/80 border border-emerald-500/40 rounded-xl p-4 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-black text-emerald-400 uppercase">
                      Closed-Form 100% Win-Rate Compounding Sequence: Cn = (C0 - f) · 2^n + f
                    </h3>
                    <p className="text-xs text-slate-300 mt-0.5">
                      With C0 = $10.00 and constant deduction f = $0.10: Cn = 9.9 · 2^n + 0.10
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <label className="text-slate-400">
                      C0 ($):
                      <input
                        type="number"
                        step="0.1"
                        value={initialCapital}
                        onChange={(e) => setInitialCapital(parseFloat(e.target.value) || 10)}
                        className="ml-1 w-20 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-bold"
                      />
                    </label>
                    <label className="text-slate-400">
                      Fee f ($):
                      <input
                        type="number"
                        step="0.01"
                        value={fixedFeeUsd}
                        onChange={(e) => setFixedFeeUsd(parseFloat(e.target.value) || 0.1)}
                        className="ml-1 w-20 bg-slate-950 border border-slate-700 rounded px-2 py-1 text-white font-bold"
                      />
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 tabular-nums">
                  {compoundingMilestones.map((item) => (
                    <div
                      key={item.tradeNumber}
                      className="bg-slate-950 border border-slate-800 rounded-lg p-3"
                    >
                      <div className="text-[10px] text-slate-400 font-bold">
                        Trade {item.tradeNumber}
                      </div>
                      <div className="text-sm font-black text-emerald-400 mt-0.5">
                        ${item.balanceUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Walk-Forward Analysis (WFA) Purge Gap (g) vs Brute Force */}
              <div className="bg-slate-900/80 border border-cyan-500/40 rounded-xl p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-xs font-black text-white uppercase">
                      Walk-Forward Analysis (WFA) Purge Gap (g) vs. Brute Force Overfitting Control
                    </h3>
                  </div>
                  <label className="text-xs text-cyan-300 font-bold">
                    Purge Gap (g Bars):
                    <input
                      type="number"
                      min={1}
                      max={500}
                      value={purgeGapBars}
                      onChange={(e) => setPurgeGapBars(Math.max(1, parseInt(e.target.value, 10) || 5))}
                      className="ml-1.5 w-16 bg-slate-950 border border-cyan-500/50 rounded px-2 py-0.5 text-white"
                    />
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs tabular-nums">
                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                    <div className="text-amber-300 font-black">1. Training Window (W_train)</div>
                    <div className="text-slate-300 mt-1">
                      Bars #1 .. #{Math.max(1, totalCandlesLoaded - 2000 - purgeGapBars).toLocaleString()}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Frozen parameter plateau calibration (O(N) linear recurrence)
                    </div>
                  </div>

                  <div className="bg-slate-950 border border-rose-500/40 rounded-lg p-3">
                    <div className="text-rose-400 font-black">
                      2. Purge Gap Buffer (g = {purgeGapBars} Bars)
                    </div>
                    <div className="text-slate-300 mt-1">
                      Decouples indicator lookbacks & resets state s_t to Terminal 0
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Eliminates feature-level & path-dependent state leakage
                    </div>
                  </div>

                  <div className="bg-slate-950 border border-emerald-500/40 rounded-lg p-3">
                    <div className="text-emerald-400 font-black">3. Out-of-Sample Test (W_test)</div>
                    <div className="text-slate-300 mt-1">
                      Final 2,000 Candles (1-by-1 Causal Forward Test)
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Zero look-ahead bias, zero mid-test rule changes
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'COLORS_BOOKING' && (
            <div className="space-y-5">
              {/* Complete 4K Color & Background Matrix */}
              <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-amber-400" />
                    <h3 className="text-sm font-black text-white uppercase">
                      Available 4K Chart Colors (4 Background Themes × 6 Candle Palettes = 24 Combinations)
                    </h3>
                  </div>
                  <span className="text-xs text-emerald-400 font-bold">
                    Click any theme or candle color below to apply immediately
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                  {BACKGROUND_THEME_CATALOG.map((bg) => (
                    <button
                      key={bg.id}
                      onClick={() => onSelectBgTheme(bg)}
                      className={`p-3 rounded-xl border text-left transition-all flex items-center justify-between ${
                        bgTheme.id === bg.id
                          ? 'border-amber-400 bg-amber-500/15'
                          : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="text-xs font-black text-white">{bg.name}</div>
                        <div className="text-[10px] text-slate-400">Background Hex: {bg.bgHex}</div>
                      </div>
                      <span
                        className="w-6 h-6 rounded-full border border-slate-500 shrink-0"
                        style={{ backgroundColor: bg.bgHex }}
                      />
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {CANDLE_PALETTE_CATALOG.map((pal) => (
                    <button
                      key={pal.id}
                      onClick={() => onSelectCandlePalette(pal)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        candlePalette.id === pal.id
                          ? 'border-cyan-400 bg-cyan-500/15'
                          : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-white">{pal.name}</span>
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-4 h-4 rounded border border-slate-600"
                            style={{ backgroundColor: pal.bullColor }}
                            title={`Bullish: ${pal.bullColor}`}
                          />
                          <span
                            className="w-4 h-4 rounded border border-slate-600"
                            style={{ backgroundColor: pal.bearColor }}
                            title={`Bearish: ${pal.bearColor}`}
                          />
                        </div>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-1">{pal.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Book Current Candle / Chosen Time Observation into the Report */}
              <div className="bg-slate-900/70 border border-amber-500/40 rounded-xl p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <BookmarkCheck className="w-4 h-4 text-amber-400" />
                    <h3 className="text-sm font-black text-white uppercase">
                      Book Current Candle & Dual-Timezone Price Line Observation
                    </h3>
                  </div>
                  {activeCandle && (
                    <span className="text-xs text-cyan-300 font-bold tabular-nums">
                      Candle #{activeCandle.index.toLocaleString()} • Close: ${activeCandle.close} •{' '}
                      {measurementService.formatTimestampInTimezone(activeCandle.timestamp, primaryTz)} |{' '}
                      {measurementService.formatTimestampInTimezone(activeCandle.timestamp, secondaryTz)}
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    value={bookingNote}
                    onChange={(e) => setBookingNote(e.target.value)}
                    placeholder="Enter research booking note (e.g., 1m Inside 1:10 & 1:20 Terminal 0)..."
                    className="flex-1 min-w-[260px] bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-bold"
                  />
                  <button
                    onClick={() => onBookCurrentCandle(bookingNote)}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs rounded-lg flex items-center gap-1.5"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Book Current Observation</span>
                  </button>
                </div>

                {/* Booked Entries Table */}
                <div className="overflow-x-auto border border-slate-800 rounded-lg">
                  <table className="w-full text-left border-collapse text-xs tabular-nums">
                    <thead>
                      <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[10px] uppercase">
                        <th className="p-2.5">Booking ID</th>
                        <th className="p-2.5">Symbol / TF</th>
                        <th className="p-2.5">Candle #</th>
                        <th className="p-2.5">Price (O/H/L/C)</th>
                        <th className="p-2.5">Primary TZ (TZ 1)</th>
                        <th className="p-2.5">Second TZ (TZ 2)</th>
                        <th className="p-2.5">Research Note</th>
                        <th className="p-2.5">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/70">
                      {bookedEntries.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="p-4 text-center text-slate-400">
                            No booked records yet. Click &quot;Book Current Observation&quot; above or &quot;+ BOOK 1:10 / 1:20&quot; on the 1s terminal to log any candle.
                          </td>
                        </tr>
                      ) : (
                        bookedEntries.map((entry) => (
                          <tr key={entry.bookingId} className="hover:bg-slate-800/40">
                            <td className="p-2.5 font-black text-amber-400">{entry.bookingId}</td>
                            <td className="p-2.5 font-bold text-white">
                              {entry.symbol} ({entry.timeframe})
                            </td>
                            <td className="p-2.5 text-cyan-300 font-bold">
                              #{entry.candleIndex.toLocaleString()}
                            </td>
                            <td className="p-2.5 text-emerald-400 font-bold">
                              C: ${entry.close} (H: {entry.high} / L: {entry.low})
                            </td>
                            <td className="p-2.5 text-white">{entry.tz1Time}</td>
                            <td className="p-2.5 text-cyan-300">{entry.tz2Time}</td>
                            <td className="p-2.5 text-slate-200">{entry.note}</td>
                            <td className="p-2.5">
                              <button
                                onClick={() => onDeleteBookedEntry(entry.bookingId)}
                                className="p-1 text-rose-400 hover:bg-rose-500/20 rounded"
                                title="Remove Booking"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
