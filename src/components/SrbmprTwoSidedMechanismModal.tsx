import React, { useState, useMemo } from 'react';
import {
  X,
  ShieldAlert,
  ArrowRightLeft,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Compass,
  TrendingDown,
  TrendingUp,
  Layers,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Server,
  Database,
  Lock
} from 'lucide-react';
import {
  SrbmprTwoSidedMechanismEngine,
  TwoSidedCandidateEvaluation
} from '../services/SrbmprTwoSidedMechanismEngine';
import { RawOhlcBar, ForwardTimeframe } from '../services/SrbmprForwardTestEngine';
import { Srbmpr2526LayerModule } from './Srbmpr2526LayerModule';
import { Srbmpr2526LayerState } from '../types/terminal';

export interface SrbmprTwoSidedMechanismModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSymbol: string;
  activeCandles: RawOhlcBar[];
  activeTimeframe: ForwardTimeframe;
  onSelectAsset?: (symbol: string) => void;
}

// 100-Asset Universe representing real Upcomers and Global Market Instruments
const UNIVERSE_100_ASSETS: Array<{
  symbol: string;
  name: string;
  category: TwoSidedCandidateEvaluation['category'];
  basePrice: number;
}> = [
  // 1. Core Cryptos
  { symbol: 'BTCUSDT', name: 'Bitcoin Perp', category: 'CRYPTO', basePrice: 68450 },
  { symbol: 'ZECUSDT', name: 'Zcash Perp', category: 'CRYPTO', basePrice: 1202 },
  { symbol: 'ETHUSDT', name: 'Ethereum Perp', category: 'CRYPTO', basePrice: 2640 },
  { symbol: 'SOLUSDT', name: 'Solana Perp', category: 'CRYPTO', basePrice: 178.5 },
  { symbol: 'XRPUSDT', name: 'XRP Perp', category: 'CRYPTO', basePrice: 1.3754 },
  { symbol: 'SUIUSDT', name: 'Sui Perp', category: 'CRYPTO', basePrice: 1.2131 },
  { symbol: 'ATOMUSDT', name: 'Cosmos Perp', category: 'CRYPTO', basePrice: 1.7891 },
  { symbol: 'TRXUSDT', name: 'Tron Perp', category: 'CRYPTO', basePrice: 0.3323 },
  { symbol: 'SEIUSDT', name: 'Sei Perp', category: 'CRYPTO', basePrice: 0.066 },
  { symbol: 'OPUSDT', name: 'Optimism Perp', category: 'CRYPTO', basePrice: 0.1186 },
  { symbol: 'WIFUSDT', name: 'Dogwifhat Perp', category: 'CRYPTO', basePrice: 0.2091 },
  { symbol: 'POLUSDT', name: 'Polygon Perp', category: 'CRYPTO', basePrice: 0.0986 },
  { symbol: 'RUNEUSDT', name: 'Thorchain Perp', category: 'CRYPTO', basePrice: 0.676 },
  { symbol: 'KAITOUSDT', name: 'Kaito Perp', category: 'CRYPTO', basePrice: 0.3061 },

  // 2. Gold & Commodities
  { symbol: 'PAXGUSDT', name: 'Gold (PAXG / XAUUSD)', category: 'GOLD', basePrice: 4147.6 },
  { symbol: 'SILVER', name: 'Silver (XAGUSD)', category: 'COMMODITIES', basePrice: 59.594 },
  { symbol: 'WTI_OIL', name: 'WTI Crude Oil (CL)', category: 'COMMODITIES', basePrice: 90.721 },
  { symbol: 'BRENTOIL', name: 'Brent Crude Oil', category: 'COMMODITIES', basePrice: 102.2 },
  { symbol: 'COPPER', name: 'Copper (HG)', category: 'COMMODITIES', basePrice: 6.5734 },

  // 3. Forex Pairs
  { symbol: 'EURUSD', name: 'Euro / US Dollar', category: 'FOREX', basePrice: 1.122 },
  { symbol: 'USDJPY', name: 'US Dollar / Japanese Yen', category: 'FOREX', basePrice: 158.02 },
  { symbol: 'GBPUSD', name: 'British Pound / US Dollar', category: 'FOREX', basePrice: 1.3045 },
  { symbol: 'AUDUSD', name: 'Australian Dollar / US Dollar', category: 'FOREX', basePrice: 0.665 },
  { symbol: 'USDCAD', name: 'US Dollar / Canadian Dollar', category: 'FOREX', basePrice: 1.378 },
  { symbol: 'USDCHF', name: 'US Dollar / Swiss Franc', category: 'FOREX', basePrice: 0.865 },

  // 4. Global Indices
  { symbol: 'NAS100', name: 'Nasdaq 100 (XYZ100)', category: 'INDICES', basePrice: 30775 },
  { symbol: 'SP500', name: 'S&P 500 Index', category: 'INDICES', basePrice: 7778.6 },
  { symbol: 'DOW30', name: 'Dow Jones 30', category: 'INDICES', basePrice: 42800 },
  { symbol: 'DAX40', name: 'German DAX 40', category: 'INDICES', basePrice: 19450 },
  { symbol: 'FTSE100', name: 'UK FTSE 100', category: 'INDICES', basePrice: 8240 }
];

export const SrbmprTwoSidedMechanismModal: React.FC<SrbmprTwoSidedMechanismModalProps> = ({
  isOpen,
  onClose,
  activeSymbol,
  activeCandles,
  activeTimeframe,
  onSelectAsset
}) => {
  const engine = useMemo(() => SrbmprTwoSidedMechanismEngine.getInstance(), []);
  const [requestedDirection, setRequestedDirection] = useState<'LONG' | 'SHORT'>('LONG');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'CONFIRMED' | 'PENDING'>('ALL');
  const [selectedTab, setSelectedTab] = useState<
    'CURRENT_ASSET_AUDIT' | 'UNIVERSE_100_SCAN' | 'DATA_AND_DO_ARCHITECTURE'
  >('CURRENT_ASSET_AUDIT');

  // Evaluate Active Chart Asset (both LONG and SHORT so Srbmpr2526LayerModule has both opposite statuses)
  const currentAssetEval = useMemo(() => {
    return engine.evaluateTwoSidedCandidate(
      activeCandles,
      activeSymbol,
      activeTimeframe,
      requestedDirection,
      activeSymbol.includes('PAXG') || activeSymbol.includes('GOLD') ? 'GOLD' : 'CRYPTO',
      'Bybit V5 Linear / Upcomers'
    );
  }, [engine, activeCandles, activeSymbol, activeTimeframe, requestedDirection]);

  const longEvalForLayer = useMemo(
    () =>
      engine.evaluateTwoSidedCandidate(
        activeCandles,
        activeSymbol,
        activeTimeframe,
        'LONG',
        activeSymbol.includes('PAXG') || activeSymbol.includes('GOLD') ? 'GOLD' : 'CRYPTO',
        'Bybit V5 Linear / Upcomers'
      ),
    [engine, activeCandles, activeSymbol, activeTimeframe]
  );

  const shortEvalForLayer = useMemo(
    () =>
      engine.evaluateTwoSidedCandidate(
        activeCandles,
        activeSymbol,
        activeTimeframe,
        'SHORT',
        activeSymbol.includes('PAXG') || activeSymbol.includes('GOLD') ? 'GOLD' : 'CRYPTO',
        'Bybit V5 Linear / Upcomers'
      ),
    [engine, activeCandles, activeSymbol, activeTimeframe]
  );

  // Build Srbmpr2526LayerState for Srbmpr2526LayerModule
  const computedLayerState: Srbmpr2526LayerState = useMemo(() => {
    const lastBar =
      activeCandles.length > 0
        ? activeCandles[activeCandles.length - 1]
        : { timestamp: Date.now(), open: 68000, high: 68120, low: 67920, close: 68050 };
    const anchorBar =
      activeCandles.length > 20 ? activeCandles[activeCandles.length - 20] : lastBar;
    const bodyTop = Math.max(anchorBar.open, anchorBar.close);
    const rawWRef = Number((anchorBar.high - bodyTop).toFixed(2));
    const safeWRef = rawWRef > 0 ? rawWRef : Number((lastBar.close * 0.0015).toFixed(2));
    const level1 = Number((anchorBar.high + 1 * safeWRef).toFixed(2));
    const level2 = Number((anchorBar.high + 2 * safeWRef).toFixed(2));
    const level3 = Number((anchorBar.high + 3 * safeWRef).toFixed(2));
    const slDist = Number((level3 * 0.001).toFixed(2));

    return {
      anchorTime: anchorBar.timestamp,
      anchorHigh: anchorBar.high,
      bodyTop,
      wRef: safeWRef,
      midZone: level3,
      level1,
      level2,
      level3,
      activeLayer:
        lastBar.close >= level3
          ? 'COMPLETED'
          : lastBar.close >= level2
            ? '1:3'
            : lastBar.close >= level1
              ? '1:2'
              : '1:1',
      progress11: lastBar.close >= level1 ? 100 : 65,
      progress12: lastBar.close >= level2 ? 100 : lastBar.close >= level1 ? 50 : 0,
      progress13: lastBar.close >= level3 ? 100 : lastBar.close >= level2 ? 40 : 0,
      status: currentAssetEval.validationState === 'CONFIRMED' ? 'CONFIRMED' : 'WAITING_TIME_CLOSE',
      entryPrice: currentAssetEval.entryPrice ?? level3,
      slPercent: 0.1,
      slDistance: slDist,
      stopLoss: currentAssetEval.stopLossPrice ?? Number((level3 - slDist).toFixed(2)),
      toleranceStop: currentAssetEval.stopLossPrice ?? Number((level3 - slDist).toFixed(2)),
      targetPrice: currentAssetEval.targetPrice ?? Number((anchorBar.high + 5 * safeWRef).toFixed(2)),
      rrRatio: 5,
      scalingTargets: [
        { ratio: 1, price: level1, reached: lastBar.close >= level1 },
        { ratio: 2, price: level2, reached: lastBar.close >= level2 },
        { ratio: 3, price: level3, reached: lastBar.close >= level3 }
      ],
      srbmpr333State: 'A333',
      evaluatedDirection: requestedDirection,
      oppositeMechanismSide: requestedDirection === 'LONG' ? 'SHORT' : 'LONG',
      oppositeMechanismStatus: currentAssetEval.oppositeMechanismBadge,
      shortSideMechanismStatus: longEvalForLayer.oppositeMechanismBadge,
      longSideMechanismStatus: shortEvalForLayer.oppositeMechanismBadge,
      oppositeMechanismReason: currentAssetEval.oppositeSideEvidence
    };
  }, [activeCandles, currentAssetEval, longEvalForLayer, shortEvalForLayer, requestedDirection]);

  // Sample Gold Weekend Gap & 1s Tick Verification Results
  const weekendGapSample = useMemo(
    () =>
      engine.classifyMarketTimeGap(
        Date.UTC(2026, 9, 23, 21, 0, 0), // Friday 21:00 UTC close
        Date.UTC(2026, 9, 25, 22, 0, 0), // Sunday 22:00 UTC open
        'GOLD'
      ),
    [engine]
  );

  const oneSecTickSample = useMemo(
    () =>
      engine.aggregateTicksToOneSecondCandles(
        [
          { timestampMs: 1700000000100, price: 4147.2, volume: 2 },
          { timestampMs: 1700000000800, price: 4147.6, volume: 3 },
          // Second 1700000001 has NO ticks (empty second preserved!)
          { timestampMs: 1700000002200, price: 4147.9, volume: 4 }
        ],
        1700000000,
        1700000004
      ),
    [engine]
  );

  // Evaluate 100-Asset Universe
  const universeScanResults = useMemo(() => {
    return engine.scanMultiAssetUniverse(
      UNIVERSE_100_ASSETS,
      requestedDirection,
      activeTimeframe
    );
  }, [engine, requestedDirection, activeTimeframe]);

  const filteredUniverse = useMemo(() => {
    if (filterStatus === 'CONFIRMED') {
      return universeScanResults.filter(r => r.validationState === 'CONFIRMED');
    }
    if (filterStatus === 'PENDING') {
      return universeScanResults.filter(r => r.validationState !== 'CONFIRMED');
    }
    return universeScanResults;
  }, [universeScanResults, filterStatus]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-3 sm:p-6 font-mono select-text">
      <div className="w-full max-w-7xl bg-[#070b14] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        {/* Top Header */}
        <div className="px-5 py-3.5 bg-[#0b101d] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/40 flex items-center justify-center">
              <ArrowRightLeft className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-wider">
                  SRBMPR — Two-Sided Market Mechanism & Final Micro-Zero Entry Rule
                </h2>
                <span className="text-[10px] font-black px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  NO OPPOSITE COMPLETION = NO ENTRY
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                LONG & SHORT analysed together • Opposite-side completion audit • Micro-structure waiting zone • Final micro-level entry
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode & Direction Selector Bar */}
        <div className="px-5 py-2.5 bg-[#090e1a] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedTab('CURRENT_ASSET_AUDIT')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                selectedTab === 'CURRENT_ASSET_AUDIT'
                  ? 'bg-amber-500 text-black'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              1. Current Asset Audit ({activeSymbol})
            </button>
            <button
              onClick={() => setSelectedTab('UNIVERSE_100_SCAN')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                selectedTab === 'UNIVERSE_100_SCAN'
                  ? 'bg-purple-500 text-black'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              2. 100-Asset Universe Two-Sided Scanner
            </button>
            <button
              onClick={() => setSelectedTab('DATA_AND_DO_ARCHITECTURE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${
                selectedTab === 'DATA_AND_DO_ARCHITECTURE'
                  ? 'bg-cyan-500 text-black'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              3. Data Sources, 1s/Weekend Rules & DigitalOcean Blueprint
            </button>
          </div>

          {/* Requested Trade Direction Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-400 uppercase font-bold">Evaluating Direction:</span>
            <div className="flex items-center bg-slate-950 border border-slate-800 p-0.5 rounded-lg">
              <button
                onClick={() => setRequestedDirection('LONG')}
                className={`px-3 py-1 rounded text-xs font-black flex items-center gap-1 transition-all ${
                  requestedDirection === 'LONG'
                    ? 'bg-emerald-500 text-black shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                <span>LONG (Evaluates SHORT-Side)</span>
              </button>
              <button
                onClick={() => setRequestedDirection('SHORT')}
                className={`px-3 py-1 rounded text-xs font-black flex items-center gap-1 transition-all ${
                  requestedDirection === 'SHORT'
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <TrendingDown className="w-3.5 h-3.5" />
                <span>SHORT (Evaluates LONG-Side)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab 1: Current Asset Detailed Audit */}
        {selectedTab === 'CURRENT_ASSET_AUDIT' && (
          <div className="p-5 overflow-y-auto space-y-5 flex-1">
            {/* Master Validation State Banner */}
            <div
              className={`border-2 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 ${
                currentAssetEval.validationState === 'CONFIRMED'
                  ? 'bg-emerald-500/10 border-emerald-500/60'
                  : currentAssetEval.validationState === 'PENDING_OPPOSITE_COMPLETION'
                    ? 'bg-rose-500/10 border-rose-500/60'
                    : currentAssetEval.validationState === 'WAIT_FOR_FINAL_MICRO_LEVEL'
                      ? 'bg-amber-500/10 border-amber-500/60'
                      : 'bg-slate-900 border-slate-700'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 rounded text-xs font-black ${
                      currentAssetEval.validationState === 'CONFIRMED'
                        ? 'bg-emerald-500 text-black'
                        : currentAssetEval.validationState === 'PENDING_OPPOSITE_COMPLETION'
                          ? 'bg-rose-500 text-white'
                          : 'bg-amber-500 text-black'
                    }`}
                  >
                    STATE: {currentAssetEval.validationState}
                  </span>
                  <span className="text-sm font-black text-white">
                    {currentAssetEval.symbol} ({currentAssetEval.timeframe}) • Direction: {currentAssetEval.requestedDirection}
                  </span>
                </div>
                <p className="text-xs text-slate-200">{currentAssetEval.stateExplanation}</p>
              </div>

              {currentAssetEval.entryPrice !== null && (
                <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-800 px-4 py-2 rounded-xl text-xs">
                  <div>
                    <div className="text-[10px] text-slate-400">Entry (Micro-Zero)</div>
                    <div className="text-sm font-black text-white">${currentAssetEval.entryPrice}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">Stop-Loss (0.1%)</div>
                    <div className="text-sm font-black text-rose-400">${currentAssetEval.stopLossPrice}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400">Target (1:2 R:R)</div>
                    <div className="text-sm font-black text-emerald-400">${currentAssetEval.targetPrice}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Two-Sided Market Mechanism Detail Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Box 1: Connected Opposite-Side Mechanism Status */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-black text-amber-400 uppercase">
                    1. Connected Opposite-Side Mechanism Audit
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-black ${
                      currentAssetEval.oppositeSideStatus === 'OPPOSITE_COMPLETED'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    }`}
                  >
                    {currentAssetEval.oppositeSideStatus}
                  </span>
                </div>

                <div className="text-xs text-slate-300 leading-relaxed">
                  <div className="text-slate-400 mb-1">
                    Evaluated Structure:{' '}
                    <strong className="text-white">
                      {requestedDirection === 'LONG' ? 'SHORT-Side Mechanism' : 'LONG-Side Mechanism'}
                    </strong>
                  </div>
                  <p>{currentAssetEval.oppositeSideEvidence}</p>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Rule Enforcement:</div>
                  <p className="text-slate-300">
                    If the opposite structure is still active, the engine does NOT confirm the trade. A missing opposite dataset is never silently treated as completed.
                  </p>
                </div>
              </div>

              {/* Box 2: Micro Structure as Waiting Zone & Final Micro-Zero Level */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-xs font-black text-cyan-400 uppercase">
                    2. Micro Structure & Final Micro-Zero Level
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-black ${
                      currentAssetEval.microZeroStatus === 'FINAL_MICRO_LEVEL_CONFIRMED'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}
                  >
                    {currentAssetEval.microZeroStatus}
                  </span>
                </div>

                <div className="text-xs text-slate-300 leading-relaxed">
                  <div className="text-slate-400 mb-1">
                    Final Micro-Zero Level:{' '}
                    <strong className="text-white">
                      {currentAssetEval.finalMicroZeroPrice !== null
                        ? `$${currentAssetEval.finalMicroZeroPrice} (${currentAssetEval.finalMicroZeroTimestamp} UTC)`
                        : 'FORMING / PENDING'}
                    </strong>
                  </div>
                  <p>{currentAssetEval.reversalEvidenceDetail}</p>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs space-y-1">
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Rule Enforcement:</div>
                  <p className="text-slate-300">
                    Micro structure is the waiting zone. The entry is evaluated strictly at the confirmed final micro level, never in the middle of a zone.
                  </p>
                </div>
              </div>
            </div>

            {/* Box 3: Historical EMA Reference Values (9, 15, 21, 50, 200) */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-white uppercase">
                  3. Calculated EMA References (Calculated from Actual Closes)
                </span>
                <span className="text-[10px] text-slate-400">
                  EMA is a research reference, not proof that a reversal is final
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
                <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg">
                  <div className="text-[10px] text-cyan-400 font-bold">EMA 9</div>
                  <div className="text-sm font-black text-white mt-0.5">${currentAssetEval.emaReferences.ema9}</div>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg">
                  <div className="text-[10px] text-emerald-400 font-bold">EMA 15</div>
                  <div className="text-sm font-black text-white mt-0.5">${currentAssetEval.emaReferences.ema15}</div>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg">
                  <div className="text-[10px] text-amber-400 font-bold">EMA 21</div>
                  <div className="text-sm font-black text-white mt-0.5">${currentAssetEval.emaReferences.ema21}</div>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg">
                  <div className="text-[10px] text-purple-400 font-bold">EMA 50</div>
                  <div className="text-sm font-black text-white mt-0.5">${currentAssetEval.emaReferences.ema50}</div>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg">
                  <div className="text-[10px] text-rose-400 font-bold">EMA 200</div>
                  <div className="text-sm font-black text-white mt-0.5">${currentAssetEval.emaReferences.ema200}</div>
                </div>
              </div>
            </div>

            {/* Box 4: Structural Connection Proofs (LH, HL, Micro-Zero) */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-2">
              <span className="text-xs font-black text-white uppercase">
                4. Structural Connection Points (Lower Highs, Higher Lows, Micro-Zero)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg">
                  <div className="text-[10px] text-slate-400">First Lower High (LH)</div>
                  <div className="text-xs font-black text-rose-300 mt-0.5">
                    {currentAssetEval.firstLowerHigh
                      ? `$${currentAssetEval.firstLowerHigh.price} (${currentAssetEval.firstLowerHigh.timestamp})`
                      : 'NONE DETECTED'}
                  </div>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg">
                  <div className="text-[10px] text-slate-400">First Higher Low (HL)</div>
                  <div className="text-xs font-black text-emerald-300 mt-0.5">
                    {currentAssetEval.firstHigherLow
                      ? `$${currentAssetEval.firstHigherLow.price} (${currentAssetEval.firstHigherLow.timestamp})`
                      : 'NONE DETECTED'}
                  </div>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg">
                  <div className="text-[10px] text-slate-400">Micro-Zero Pivot</div>
                  <div className="text-xs font-black text-amber-300 mt-0.5">
                    {currentAssetEval.finalMicroZeroPrice
                      ? `$${currentAssetEval.finalMicroZeroPrice} (${currentAssetEval.finalMicroZeroTimestamp})`
                      : 'PENDING'}
                  </div>
                </div>
              </div>
            </div>

            {/* Embedded Srbmpr2526LayerModule with Explicit Two-Sided PENDING / INCOMPLETE / VERIFIED Indicator */}
            <Srbmpr2526LayerModule
              layerState={computedLayerState}
              defaultDirection={requestedDirection}
            />
          </div>
        )}

        {/* Tab 2: 100-Asset Universe Multi-Scan Table */}
        {selectedTab === 'UNIVERSE_100_SCAN' && (
          <div className="p-5 overflow-y-auto space-y-4 flex-1">
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs font-black text-purple-300 uppercase">
                  Multi-Asset Two-Sided Scan ({filteredUniverse.length} Instruments)
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Scanning both sides does not mean issuing trades in both directions. Each asset independently verifies whether its opposite-side structure completed. No forced entries to meet a quota.
                </p>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 p-1 rounded-lg text-xs">
                <button
                  onClick={() => setFilterStatus('ALL')}
                  className={`px-2.5 py-1 rounded text-xs font-black ${
                    filterStatus === 'ALL' ? 'bg-amber-500 text-black' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ALL ({universeScanResults.length})
                </button>
                <button
                  onClick={() => setFilterStatus('CONFIRMED')}
                  className={`px-2.5 py-1 rounded text-xs font-black ${
                    filterStatus === 'CONFIRMED' ? 'bg-emerald-500 text-black' : 'text-emerald-400 hover:text-white'
                  }`}
                >
                  CONFIRMED ONLY ({universeScanResults.filter(r => r.validationState === 'CONFIRMED').length})
                </button>
                <button
                  onClick={() => setFilterStatus('PENDING')}
                  className={`px-2.5 py-1 rounded text-xs font-black ${
                    filterStatus === 'PENDING' ? 'bg-rose-500 text-white' : 'text-rose-400 hover:text-white'
                  }`}
                >
                  WITHHELD / PENDING ({universeScanResults.filter(r => r.validationState !== 'CONFIRMED').length})
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase bg-slate-950">
                      <th className="p-3">Asset</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Opposite-Side Status</th>
                      <th className="p-3">Final Micro-Zero</th>
                      <th className="p-3">EMA 9 / 21</th>
                      <th className="p-3">Entry / SL / Target</th>
                      <th className="p-3">Master State</th>
                      <th className="p-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredUniverse.map(item => (
                      <tr key={item.symbol} className="hover:bg-slate-800/40">
                        <td className="p-3 font-black text-white">{item.symbol}</td>
                        <td className="p-3 text-slate-400 text-[11px]">{item.category}</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-black ${
                              item.oppositeSideStatus === 'OPPOSITE_COMPLETED'
                                ? 'bg-emerald-500/15 text-emerald-300'
                                : 'bg-rose-500/15 text-rose-300'
                            }`}
                          >
                            {item.oppositeSideStatus}
                          </span>
                        </td>
                        <td className="p-3 text-amber-300 font-bold">
                          {item.finalMicroZeroPrice ? `$${item.finalMicroZeroPrice}` : 'PENDING'}
                        </td>
                        <td className="p-3 text-slate-300">
                          ${item.emaReferences.ema9} / ${item.emaReferences.ema21}
                        </td>
                        <td className="p-3">
                          {item.entryPrice ? (
                            <span className="text-white font-bold">
                              ${item.entryPrice} | SL ${item.stopLossPrice} | Tgt ${item.targetPrice}
                            </span>
                          ) : (
                            <span className="text-slate-500">WITHHELD</span>
                          )}
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-black ${
                              item.validationState === 'CONFIRMED'
                                ? 'bg-emerald-500 text-black'
                                : item.validationState === 'PENDING_OPPOSITE_COMPLETION'
                                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            }`}
                          >
                            {item.validationState}
                          </span>
                        </td>
                        <td className="p-3">
                          {onSelectAsset && (
                            <button
                              onClick={() => {
                                onSelectAsset(item.symbol);
                                onClose();
                              }}
                              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded text-[10px] font-bold"
                            >
                              Load Chart
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Official Data Sources, 1s Tick/Weekend Gap Rules & DigitalOcean PostgreSQL Blueprint */}
        {selectedTab === 'DATA_AND_DO_ARCHITECTURE' && (
          <div className="p-5 overflow-y-auto space-y-5 flex-1 text-xs">
            {/* Section A: Official Historical Data Sources & Checksum / Feed Rules */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-black text-cyan-400 uppercase flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  1. Official Historical Data Sources & Feed Verification Rules
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black">
                  RAW DATA IMMUTABLE • ZERO SYNTHETIC CANDLES
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg space-y-1">
                  <div className="text-amber-400 font-black">Binance Official Archives</div>
                  <div className="text-slate-300">
                    Primary: <code className="text-cyan-300">data.binance.vision</code> with official{' '}
                    <code className="text-emerald-300">.CHECKSUM</code> (SHA-256) verification.
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Note: Verify <code className="text-slate-300">algo-one/binance-data-downloader</code> README/license before use; prefer direct <code className="text-slate-300">data.binance.vision</code> archives.
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg space-y-1">
                  <div className="text-amber-400 font-black">Gold (XAUUSD) — Dukascopy Feed</div>
                  <div className="text-slate-300">
                    Primary: <code className="text-cyan-300">dukascopy-node</code> (npm) for tick & M1 historical archives.
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Note: Verify <code className="text-slate-300">tomas-charvat/Dukascopy_downloader</code> before use. Compare Dukascopy vs MT5 Gold feeds side-by-side without overwriting raw tables.
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg space-y-1">
                  <div className="text-amber-400 font-black">MetaTrader 5 (MT5) Official Python API</div>
                  <div className="text-slate-300">
                    Uses <code className="text-cyan-300">copy_rates_range</code> &{' '}
                    <code className="text-cyan-300">copy_ticks_range</code>.
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Constraint: Official <code className="text-slate-300">MetaTrader5</code> Python package requires Windows + running MT5 terminal logged into broker account.
                  </div>
                </div>
              </div>

              {/* Live Verification Proof Cards: Gold Weekend Gap & 1s Tick Aggregation */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                <div className="bg-slate-950 border border-emerald-500/30 p-3 rounded-lg space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-400 font-black">
                      Gold (XAUUSD) M1 Weekend Gap Classification
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-black">
                      {weekendGapSample.classification}
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px]">{weekendGapSample.explanation}</p>
                </div>

                <div className="bg-slate-950 border border-cyan-500/30 p-3 rounded-lg space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-cyan-400 font-black">
                      1-Second (1s) Tick Aggregation (XAUUSD Test First)
                    </span>
                    <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-black">
                      SYNTHETIC CANDLES: {oneSecTickSample.syntheticCandlesCreated}
                    </span>
                  </div>
                  <p className="text-slate-300 text-[11px]">
                    Downloaded Ticks: <strong>{oneSecTickSample.downloadedTickRows}</strong> | Processed 1s Candles:{' '}
                    <strong>{oneSecTickSample.processedCandleRows}</strong> | Empty Seconds Preserved:{' '}
                    <strong>{oneSecTickSample.emptySecondsCount}</strong> (never fabricated).
                  </p>
                </div>
              </div>
            </div>

            {/* Section B: DigitalOcean + Managed PostgreSQL + Security Architecture */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-black text-purple-400 uppercase flex items-center gap-2">
                  <Server className="w-4 h-4" />
                  2. Production Architecture — DigitalOcean + Managed PostgreSQL + Zero-Trust Security
                </span>
                <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-black">
                  PRIVATE VPC • JWT + RBAC • IMMUTABLE DB
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg space-y-1">
                  <div className="text-white font-black">1. Frontend UI</div>
                  <p className="text-slate-400 text-[11px]">
                    TradingView Lightweight Charts + React/Next.js Dark Workstation. Multi-timeframe (1s, 1m, 5m, 15m, 1h, 4h, 1D), Multi-Asset (BTC, XAUUSD, EURUSD), Replay Mode & Evidence Panel.
                  </p>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg space-y-1">
                  <div className="text-white font-black">2. Backend API</div>
                  <p className="text-slate-400 text-[11px]">
                    Node.js (NestJS) or Python (FastAPI). REST + WebSocket live stream. JWT + Refresh Token Auth + Role-Based Access Control (<code className="text-amber-300">Admin</code> / <code className="text-cyan-300">Researcher</code> / <code className="text-slate-300">Viewer</code>).
                  </p>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg space-y-1">
                  <div className="text-white font-black">3. Managed PostgreSQL</div>
                  <p className="text-slate-400 text-[11px]">
                    DigitalOcean Managed PostgreSQL in Private VPC (no public internet exposure). Immutable <code className="text-emerald-300">raw_market_data</code> table + separate <code className="text-cyan-300">research_run_records</code> & <code className="text-amber-300">audit_logs</code>.
                  </p>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg space-y-1">
                  <div className="text-white font-black">4. Droplet & Firewall</div>
                  <p className="text-slate-400 text-[11px]">
                    Ubuntu Docker Droplet / App Platform. SSH Key-only (password login disabled), Cloud Firewall (80, 443, SSH), Let&apos;s Encrypt HTTPS, IP Whitelist + Rate Limiting.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SrbmprTwoSidedMechanismModal;
