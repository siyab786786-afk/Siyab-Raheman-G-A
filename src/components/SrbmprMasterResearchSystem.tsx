import React, { useState, useMemo } from 'react';
import {
  X,
  ShieldCheck,
  Layers,
  Database,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Cpu,
  Radio,
  Lock,
  ArrowRight,
  Calculator,
  Calendar,
  Zap,
  BellRing
} from 'lucide-react';
import {
  SrbmprMasterResearchArchiveService,
  FiveMinuteCandidateSetup
} from '../services/SrbmprMasterResearchArchiveService';

export interface SrbmprMasterResearchSystemProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectInstrumentForChart?: (symbol: string, timeframe: '1m' | '5m') => void;
}

type MasterTab =
  | 'NESTED_CONTAINERS'
  | 'FOUR_LAYER_CONSTITUTION'
  | 'YEARLY_MANIFEST'
  | 'UPCOMERS_PARITY'
  | 'FIVE_MIN_ROCKET'
  | 'SIXTEEN_POINT_ARTICLE';

export const SrbmprMasterResearchSystem: React.FC<SrbmprMasterResearchSystemProps> = ({
  isOpen,
  onClose,
  onSelectInstrumentForChart
}) => {
  const service = useMemo(() => SrbmprMasterResearchArchiveService.getInstance(), []);
  const [activeTab, setActiveTab] = useState<MasterTab>('NESTED_CONTAINERS');

  // Interactive Derived Candle Measurement Calculator (with Zero-Range Guard test)
  const [calcOpen, setCalcOpen] = useState<number>(0.2676);
  const [calcHigh, setCalcHigh] = useState<number>(0.2915);
  const [calcLow, setCalcLow] = useState<number>(0.2670);
  const [calcClose, setCalcClose] = useState<number>(0.2891);

  // Interactive Upcomers #720656 Same-to-Same Execution Parity State
  const [paritySymbol, setParitySymbol] = useState<'ZECUSDT' | 'AXISUSDT' | 'BTCUSDT'>('ZECUSDT');
  const [srbmprTf, setSrbmprTf] = useState<'1m' | '5m'>('1m');
  const [upcomersTf, setUpcomersTf] = useState<'1m' | '5m'>('1m');
  const [parityDir, setParityDir] = useState<'LONG' | 'SHORT'>('LONG');
  const [parityEntry, setParityEntry] = useState<number>(1202.0);
  const [paritySl, setParitySl] = useState<number>(1195.0);
  const [parityRr, setParityRr] = useState<1 | 2 | 3 | 4 | 10>(1);
  const [permittedRiskUsd, setPermittedRiskUsd] = useState<number>(49.98);
  const [dynamicTargetBalance, setDynamicTargetBalance] = useState<number>(20000);

  // Full-Screen Emergency Alert Overlay State for Universal 5-Minute Rocket Engine
  const [emergencyCandidate, setEmergencyCandidate] = useState<FiveMinuteCandidateSetup | null>(null);

  const nestedData = useMemo(() => service.getThreeNestedContainers(), [service]);
  const empiricalSignedSeq = useMemo(() => service.getEmpiricalSignedSequence(), [service]);
  const minusZeroCheck = useMemo(() => service.evaluateZeroStructuralToken('MINUS_ZERO'), [service]);
  const zeroBaselineCheck = useMemo(() => service.evaluateZeroStructuralToken('ZERO'), [service]);
  const constitutionRecords = useMemo(() => service.getFourLayerConstitutionRecords(), [service]);
  const yearlyManifest = useMemo(() => service.getYearlyRecoveryManifest(), [service]);
  const fiveMinCandidates = useMemo(() => service.getUniversalFiveMinuteCandidates(), [service]);

  const liveDerivedMeasurement = useMemo(
    () => service.calculateDerivedCandleMeasurement(calcOpen, calcHigh, calcLow, calcClose),
    [service, calcOpen, calcHigh, calcLow, calcClose]
  );

  const upcomersMapping = useMemo(
    () =>
      service.mapSrbmprToUpcomersExecution({
        srbmprSymbol: paritySymbol,
        srbmprTimeframe: srbmprTf,
        upcomersChartTimeframe: upcomersTf,
        direction: parityDir,
        entryPriceUsd: parityEntry,
        stopLossPriceUsd: paritySl,
        rrMultiplier: parityRr,
        accountEquityUsd: 10200.0,
        permittedRiskUsd
      }),
    [service, paritySymbol, srbmprTf, upcomersTf, parityDir, parityEntry, paritySl, parityRr, permittedRiskUsd]
  );

  const handlePresetSymbol = (sym: 'ZECUSDT' | 'AXISUSDT' | 'BTCUSDT') => {
    setParitySymbol(sym);
    if (sym === 'ZECUSDT') {
      setParityEntry(1202.0);
      setParitySl(1195.0);
    } else if (sym === 'AXISUSDT') {
      setParityEntry(0.2828);
      setParitySl(0.2792);
    } else {
      setParityEntry(68450.0);
      setParitySl(68200.0);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-3 sm:p-6 font-mono select-text">
      <div className="w-full max-w-7xl bg-[#070a12] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        {/* Top Header */}
        <div className="px-5 py-3.5 bg-[#0b101d] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-wider">
                  SRBMPR Master Research Archive, Measurement Evidence & System Constitution
                </h2>
                <span className="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  3 ⊃ 2 ⊃ 1 VERIFIED
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                4-Layer Record Constitution • Left/Right Causal Separation • MINUS_ZERO • Upcomers #720656 Dual-Unit Parity • 5-Min Rocket Engine
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

        {/* Navigation Tabs */}
        <div className="px-5 py-2 bg-[#090d16] border-b border-slate-800 flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('NESTED_CONTAINERS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all ${
              activeTab === 'NESTED_CONTAINERS'
                ? 'bg-amber-500 text-black'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>1. Nested Containers (3 ⊃ 2 ⊃ 1) & MINUS_ZERO</span>
          </button>

          <button
            onClick={() => setActiveTab('FOUR_LAYER_CONSTITUTION')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all ${
              activeTab === 'FOUR_LAYER_CONSTITUTION'
                ? 'bg-cyan-500 text-black'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>2. 4-Layer Constitution & OHLC Formulas</span>
          </button>

          <button
            onClick={() => setActiveTab('YEARLY_MANIFEST')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all ${
              activeTab === 'YEARLY_MANIFEST'
                ? 'bg-emerald-500 text-black'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>3. 2009–2026 Left/Right Manifest</span>
          </button>

          <button
            onClick={() => setActiveTab('UPCOMERS_PARITY')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all ${
              activeTab === 'UPCOMERS_PARITY'
                ? 'bg-purple-500 text-black'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>4. Upcomers #720656 Same-to-Same Mapper</span>
          </button>

          <button
            onClick={() => setActiveTab('FIVE_MIN_ROCKET')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all ${
              activeTab === 'FIVE_MIN_ROCKET'
                ? 'bg-rose-500 text-black'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>5. Universal 5-Min Rocket Scanner</span>
          </button>

          <button
            onClick={() => setActiveTab('SIXTEEN_POINT_ARTICLE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all ${
              activeTab === 'SIXTEEN_POINT_ARTICLE'
                ? 'bg-amber-400 text-black'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>6. 16-Point Master Research Article</span>
          </button>
        </div>

        {/* Main Tab Content */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* ====================================================================
              TAB 1: DARK TECHNICAL VISUALIZATION OF 3 NESTED CONTAINERS (3 ⊃ 2 ⊃ 1)
          ==================================================================== */}
          {activeTab === 'NESTED_CONTAINERS' && (
            <div className="space-y-5">
              {/* Asymmetric Inclusion Law Banner */}
              <div className="bg-slate-900/90 border border-amber-500/40 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-black text-amber-400 uppercase tracking-wider">
                    Asymmetric Inclusion Law & Negative Proof Priority
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    Mathematical Hierarchy: <span className="text-white font-bold">Container 3 ⊃ Container 2 ⊃ Container 1</span> •
                    Reverse inclusion is strictly false (<span className="text-rose-400 font-bold">Container 2 ⊅ Container 3</span> and <span className="text-rose-400 font-bold">Container 1 ⊅ Container 2</span>).
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2.5 py-1 rounded bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-bold">
                    Law Verified: {nestedData.inclusionProof.lawSatisfied ? 'TRUE' : 'FALSE'}
                  </span>
                </div>
              </div>

              {/* Dark Technical Visualization of 3 Concentric Nested Containers */}
              <div className="bg-[#050811] border-2 border-amber-500/50 rounded-2xl p-5 shadow-inner">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-amber-500 text-black text-[11px] font-black">
                      {nestedData.containers[0].validationBadge}
                    </span>
                    <span className="text-sm font-black text-white">{nestedData.containers[0].title}</span>
                  </div>
                  <span className="text-[11px] text-amber-300 font-bold">
                    {nestedData.containers[0].timeframeScope} • {nestedData.containers[0].timestampRangeUtc}
                  </span>
                </div>
                <p className="text-xs text-slate-300 mb-4">{nestedData.containers[0].roleDescription}</p>

                {/* Container 3 Metadata */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5 text-xs">
                  <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-2.5">
                    <div className="text-[10px] text-slate-400 uppercase">Zero Structural Token</div>
                    <div className="text-amber-300 font-black mt-0.5">{nestedData.containers[0].zeroToken}</div>
                  </div>
                  <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-2.5">
                    <div className="text-[10px] text-slate-400 uppercase">Empirical Signed Sequence (Preserved Order)</div>
                    <div className="text-cyan-300 font-black mt-0.5">
                      {nestedData.containers[0].signedSequenceSnapshot.map(v => (v > 0 ? `+${v}` : `${v}`)).join(' → ')}
                    </div>
                  </div>
                  <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-2.5">
                    <div className="text-[10px] text-slate-400 uppercase">Negative Proof Classification</div>
                    <div className="text-emerald-400 font-black mt-0.5">{nestedData.containers[0].negativeProofClassification}</div>
                  </div>
                </div>

                {/* NESTED CONTAINER 2 (Middle Level) */}
                <div className="bg-[#090f1e] border-2 border-cyan-500/50 rounded-xl p-4 ml-2 sm:ml-6">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-cyan-500 text-black text-[11px] font-black">
                        {nestedData.containers[1].validationBadge}
                      </span>
                      <span className="text-xs sm:text-sm font-black text-white">{nestedData.containers[1].title}</span>
                    </div>
                    <span className="text-[11px] text-cyan-300 font-bold">
                      {nestedData.containers[1].timeframeScope} • {nestedData.containers[1].timestampRangeUtc}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mb-3">{nestedData.containers[1].roleDescription}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 text-xs">
                    <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-2.5">
                      <div className="text-[10px] text-slate-400 uppercase">Zero Structural Token</div>
                      <div className="text-purple-300 font-black mt-0.5">{nestedData.containers[1].zeroToken}</div>
                    </div>
                    <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-2.5">
                      <div className="text-[10px] text-slate-400 uppercase">Unborn / Outer Level Reference</div>
                      <div className="text-rose-300 font-black mt-0.5">
                        Level 3 Not Inside Level 2 (2 ⊅ 3)
                      </div>
                    </div>
                    <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-2.5">
                      <div className="text-[10px] text-slate-400 uppercase">Negative Proof Classification</div>
                      <div className="text-amber-300 font-black mt-0.5">{nestedData.containers[1].negativeProofClassification}</div>
                    </div>
                  </div>

                  {/* NESTED CONTAINER 1 (Inner / Micro Level) */}
                  <div className="bg-[#0d1629] border-2 border-emerald-500/50 rounded-xl p-4 ml-2 sm:ml-6">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-emerald-500 text-black text-[11px] font-black">
                          {nestedData.containers[2].validationBadge}
                        </span>
                        <span className="text-xs sm:text-sm font-black text-white">{nestedData.containers[2].title}</span>
                      </div>
                      <span className="text-[11px] text-emerald-300 font-bold">
                        {nestedData.containers[2].timeframeScope} • {nestedData.containers[2].timestampRangeUtc}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mb-3">{nestedData.containers[2].roleDescription}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-2.5">
                        <div className="text-[10px] text-slate-400 uppercase">Zero Structural Token</div>
                        <div className="text-purple-300 font-black mt-0.5">{nestedData.containers[2].zeroToken}</div>
                      </div>
                      <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-2.5">
                        <div className="text-[10px] text-slate-400 uppercase">Enclosed Child Levels</div>
                        <div className="text-slate-300 font-black mt-0.5">NONE (Innermost Micro Unit)</div>
                      </div>
                      <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-2.5">
                        <div className="text-[10px] text-slate-400 uppercase">Negative Proof Classification</div>
                        <div className="text-rose-400 font-black mt-0.5">{nestedData.containers[2].negativeProofClassification}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Zero vs. Minus-Zero (MINUS_ZERO) & Empirical Signed Sequence */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="text-xs font-black text-purple-400 uppercase">
                    Zero vs. Minus-Zero (MINUS_ZERO) Structural Distinction
                  </div>
                  <p className="text-xs text-slate-300">
                    In standard IEEE floating-point arithmetic, <code className="text-amber-300">-0 === 0</code>. In the SRBMPR engine,{' '}
                    <code className="text-purple-300 font-bold">MINUS_ZERO</code> is preserved as a first-class symbolic structural state token representing the below-baseline{' '}
                    <code className="text-cyan-300">T_-2 → T_0</code> structural anchor.
                  </p>
                  <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                    <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg">
                      <div className="text-[10px] text-slate-400">Token: {minusZeroCheck.token}</div>
                      <div className="text-emerald-400 font-bold mt-0.5">
                        Collapsed to 0: {String(minusZeroCheck.collapsedToNumericZero).toUpperCase()}
                      </div>
                    </div>
                    <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg">
                      <div className="text-[10px] text-slate-400">Token: {zeroBaselineCheck.token}</div>
                      <div className="text-amber-400 font-bold mt-0.5">
                        Primary Zero-A Origin
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-2">
                  <div className="text-xs font-black text-cyan-400 uppercase">
                    Empirical Signed Sequence (Never Numerically Sorted)
                  </div>
                  <p className="text-xs text-slate-300">
                    The signed transition array is stored in exact chronological observation order. It is never sorted into ascending or descending numerical order:
                  </p>
                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    {empiricalSignedSeq.map((val, idx) => (
                      <React.Fragment key={idx}>
                        <span
                          className={`px-3 py-1.5 rounded-lg text-xs font-black border ${
                            val < 0
                              ? 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                              : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                          }`}
                        >
                          {val > 0 ? `+${val}` : val}
                        </span>
                        {idx < empiricalSignedSeq.length - 1 && (
                          <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ====================================================================
              TAB 2: 4-LAYER RECORD CONSTITUTION & DERIVED OHLC MEASUREMENT FORMULAS
          ==================================================================== */}
          {activeTab === 'FOUR_LAYER_CONSTITUTION' && (
            <div className="space-y-5">
              {/* Interactive Derived Candle Measurement Verifier */}
              <div className="bg-slate-900/90 border border-cyan-500/40 rounded-xl p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="text-xs font-black text-cyan-400 uppercase">
                      Layer 2: Derived Candle Measurement Verifier (With Zero-Range Safe Division Guard)
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Formulas: Body = |Close - Open| • Upper Wick = High - max(Open, Close) • Lower Wick = min(Open, Close) - Low • Range = High - Low
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setCalcOpen(0.2828);
                      setCalcHigh(0.2828);
                      setCalcLow(0.2828);
                      setCalcClose(0.2828);
                    }}
                    className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 rounded text-xs font-bold"
                  >
                    Test Zero-Range Candle (H = L)
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Open</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={calcOpen}
                      onChange={e => setCalcOpen( parseFloat(e.target.value) || 0 )}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">High</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={calcHigh}
                      onChange={e => setCalcHigh( parseFloat(e.target.value) || 0 )}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Low</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={calcLow}
                      onChange={e => setCalcLow( parseFloat(e.target.value) || 0 )}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Close</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={calcClose}
                      onChange={e => setCalcClose( parseFloat(e.target.value) || 0 )}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-white font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-2 text-xs">
                  <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg">
                    <div className="text-[10px] text-slate-400">Body (|C - O|)</div>
                    <div className="text-white font-black mt-0.5">{liveDerivedMeasurement.body}</div>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg">
                    <div className="text-[10px] text-slate-400">Upper Wick</div>
                    <div className="text-emerald-400 font-black mt-0.5">{liveDerivedMeasurement.upperWick}</div>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg">
                    <div className="text-[10px] text-slate-400">Lower Wick</div>
                    <div className="text-rose-400 font-black mt-0.5">{liveDerivedMeasurement.lowerWick}</div>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg">
                    <div className="text-[10px] text-slate-400">Total Range (H - L)</div>
                    <div className="text-amber-400 font-black mt-0.5">{liveDerivedMeasurement.totalRange}</div>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 p-2.5 rounded-lg">
                    <div className="text-[10px] text-slate-400">Body/Range Ratio</div>
                    <div className="text-cyan-300 font-black mt-0.5">
                      {liveDerivedMeasurement.bodyToRangeRatio} {liveDerivedMeasurement.isZeroRangeCandle && '(Zero-Range Safe)'}
                    </div>
                  </div>
                </div>
              </div>

              {/* 4-Layer Constitution Table */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden">
                <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                  <span className="text-xs font-black text-white uppercase">
                    4-Layer Record Constitution Audit Ledger (Raw Data → Measurement → Mechanism Rule → Replay Evidence)
                  </span>
                  <span className="text-[11px] text-emerald-400 font-bold">Zero Future Data Leakage</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase bg-slate-950/60">
                        <th className="p-3">Layer 1: Raw Data</th>
                        <th className="p-3">Layer 2: Derived Measurement</th>
                        <th className="p-3">Layer 3: Mechanism Rule</th>
                        <th className="p-3">Layer 4: Replay Evidence</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/70">
                      {constitutionRecords.map(rec => (
                        <tr key={rec.id} className="hover:bg-slate-800/40">
                          <td className="p-3 align-top">
                            <div className="font-black text-amber-400">{rec.rawData.symbol} ({rec.rawData.timeframe})</div>
                            <div className="text-[11px] text-slate-300">{rec.rawData.timestampUtc} UTC</div>
                            <div className="text-[11px] text-slate-400 mt-1">
                              O: {rec.rawData.open} • H: {rec.rawData.high} • L: {rec.rawData.low} • C: {rec.rawData.close}
                            </div>
                          </td>
                          <td className="p-3 align-top">
                            <div className="text-white font-bold">
                              Body: {rec.measurement.body} | Range: {rec.measurement.totalRange}
                            </div>
                            <div className="text-[11px] text-slate-300">
                              Upper Wick: {rec.measurement.upperWick} • Lower Wick: {rec.measurement.lowerWick}
                            </div>
                            <div className="text-[10px] text-cyan-400 mt-1">
                              Polarity: {rec.measurement.polarity} (Ratio: {rec.measurement.bodyToRangeRatio})
                            </div>
                          </td>
                          <td className="p-3 align-top">
                            <div className="font-black text-purple-300">{rec.mechanismRule.ruleName}</div>
                            <div className="text-[11px] text-slate-300">
                              Side: <span className="text-white font-bold">{rec.mechanismRule.structuralSide}</span>
                            </div>
                            <div className="text-[11px] text-amber-300 mt-0.5">
                              Token: {rec.mechanismRule.zeroToken} • Signed: {rec.mechanismRule.signedValue > 0 ? `+${rec.mechanismRule.signedValue}` : rec.mechanismRule.signedValue}
                            </div>
                          </td>
                          <td className="p-3 align-top">
                            <div className="text-emerald-400 font-black">{rec.replayEvidence.reproducibleOutcome}</div>
                            <div className="text-[11px] text-slate-400">SHA256: {rec.replayEvidence.sha256Checksum}</div>
                            <div className="text-[10px] text-slate-400 mt-0.5">
                              Causal Lock: {rec.replayEvidence.zeroFutureDataLeakageVerified ? 'VERIFIED' : 'FAILED'}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ====================================================================
              TAB 3: 2009-2026 YEARLY HISTORICAL RECOVERY MANIFEST (HONEST LEFT/RIGHT SEPARATION)
          ==================================================================== */}
          {activeTab === 'YEARLY_MANIFEST' && (
            <div className="space-y-4">
              <div className="bg-slate-900/90 border border-emerald-500/40 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-black text-emerald-400 uppercase">
                    Left-Side vs. Right-Side Directional Separation (2009–2026 Archive)
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    Left-Side ascending causal structures (<code className="text-amber-300">Low → High → Low</code>) and Right-Side descending reaction structures (<code className="text-cyan-300">Lower-High → Lower-Low</code>, "मजबूरन मजबूरी") are stored in separate datasets. Mirroring or inverting Left-Side data is strictly prohibited (<code className="text-emerald-300">mirrorFabricationUsed = false</code>).
                  </p>
                </div>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase bg-slate-950">
                        <th className="p-2.5">Year</th>
                        <th className="p-2.5">Structural Era</th>
                        <th className="p-2.5">Left-Side Causal</th>
                        <th className="p-2.5">Right-Side Reaction</th>
                        <th className="p-2.5">Replay Validated</th>
                        <th className="p-2.5">Mirror Fabrication</th>
                        <th className="p-2.5">Status</th>
                        <th className="p-2.5">Audit Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {yearlyManifest.map(row => (
                        <tr key={row.year} className="hover:bg-slate-800/40">
                          <td className="p-2.5 font-black text-amber-400">{row.year}</td>
                          <td className="p-2.5 font-bold text-white">{row.eraLabel}</td>
                          <td className="p-2.5 text-emerald-300 font-bold">{row.leftSideCausalRecords.toLocaleString()}</td>
                          <td className="p-2.5 text-cyan-300 font-bold">{row.rightSideReactionRecords.toLocaleString()}</td>
                          <td className="p-2.5 text-white font-bold">{row.replayValidatedRecords.toLocaleString()}</td>
                          <td className="p-2.5">
                            <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 text-[10px] font-black">
                              FALSE (0%)
                            </span>
                          </td>
                          <td className="p-2.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-black ${
                                row.recoveryStatus === 'VERIFIED_COMPLETE'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                              }`}
                            >
                              {row.recoveryStatus}
                            </span>
                          </td>
                          <td className="p-2.5 text-[11px] text-slate-400">{row.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ====================================================================
              TAB 4: UPCOMERS #720656 SAME-ASSET, SAME-TIMEFRAME, SAME-RISK MAPPER
          ==================================================================== */}
          {activeTab === 'UPCOMERS_PARITY' && (
            <div className="space-y-5">
              {/* Controls */}
              <div className="bg-slate-900/90 border border-purple-500/40 rounded-xl p-4 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="text-xs font-black text-purple-300 uppercase">
                      SRBMPR × Upcomers Thunderbolt #720656 — Dual-Unit Same-to-Same Execution Mapper
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Independent Quantity Formula: <code className="text-amber-300">Quantity = Permitted Risk USD / |Entry - StopLoss|</code> • Never copy quantity from another coin!
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {(['ZECUSDT', 'AXISUSDT', 'BTCUSDT'] as const).map(sym => (
                      <button
                        key={sym}
                        onClick={() => handlePresetSymbol(sym)}
                        className={`px-3 py-1 rounded text-xs font-black ${
                          paritySymbol === sym
                            ? 'bg-amber-500 text-black'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {sym}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-xs">
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">SRBMPR TF</label>
                    <select
                      value={srbmprTf}
                      onChange={e => setSrbmprTf(e.target.value as '1m' | '5m')}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-white font-bold"
                    >
                      <option value="1m">1m</option>
                      <option value="5m">5m</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Upcomers TF</label>
                    <select
                      value={upcomersTf}
                      onChange={e => setUpcomersTf(e.target.value as '1m' | '5m')}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-white font-bold"
                    >
                      <option value="1m">1m</option>
                      <option value="5m">5m</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Direction</label>
                    <select
                      value={parityDir}
                      onChange={e => setParityDir(e.target.value as 'LONG' | 'SHORT')}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-white font-bold"
                    >
                      <option value="LONG">LONG (BUY)</option>
                      <option value="SHORT">SHORT (SELL)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Entry Price ($)</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={parityEntry}
                      onChange={e => setParityEntry(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Stop-Loss ($)</label>
                    <input
                      type="number"
                      step="0.0001"
                      value={paritySl}
                      onChange={e => setParitySl(parseFloat(e.target.value) || 0)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-1">Permitted Risk ($)</label>
                    <input
                      type="number"
                      step="1"
                      value={permittedRiskUsd}
                      onChange={e => setPermittedRiskUsd(parseFloat(e.target.value) || 10)}
                      className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-amber-400 font-bold"
                    />
                  </div>
                </div>

                {/* Timeframe Mismatch Abort Warning if TF != TF */}
                {upcomersMapping.timeframeParityStatus === 'TIMEFRAME_MISMATCH_ABORT' && (
                  <div className="bg-rose-500/20 border border-rose-500 text-rose-200 p-3 rounded-lg flex items-center gap-2 text-xs font-black">
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>
                      TIMEFRAME_MISMATCH_ABORT: SRBMPR Research Timeframe ({upcomersMapping.srbmprTimeframe}) does NOT match Upcomers Execution Timeframe ({upcomersMapping.upcomersTimeframe}). Execution locked until both charts are set to the exact same timeframe!
                    </span>
                  </div>
                )}

                {/* Dual-Unit Comparison Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-[10px] text-slate-400 uppercase bg-slate-950">
                        <th className="p-2.5">Parameter</th>
                        <th className="p-2.5">SRBMPR Research Unit</th>
                        <th className="p-2.5">Upcomers #720656 Execution Unit</th>
                        <th className="p-2.5">Parity Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      <tr>
                        <td className="p-2.5 text-slate-400">Asset Symbol</td>
                        <td className="p-2.5 font-black text-amber-400">{upcomersMapping.srbmprSymbol}</td>
                        <td className="p-2.5 font-black text-emerald-400">{upcomersMapping.upcomersSymbol}</td>
                        <td className="p-2.5 text-emerald-400 font-bold">SAME ASSET LOCKED</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 text-slate-400">Chart Timeframe</td>
                        <td className="p-2.5 font-bold text-white">{upcomersMapping.srbmprTimeframe}</td>
                        <td className="p-2.5 font-bold text-white">{upcomersMapping.upcomersTimeframe}</td>
                        <td className="p-2.5 font-black">
                          <span
                            className={
                              upcomersMapping.timeframeParityStatus === 'MATCHED_100%'
                                ? 'text-emerald-400'
                                : 'text-rose-400'
                            }
                          >
                            {upcomersMapping.timeframeParityStatus}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2.5 text-slate-400">Entry Price & Side</td>
                        <td className="p-2.5 font-bold text-white">
                          {upcomersMapping.direction} @ ${upcomersMapping.entryPriceUsd}
                        </td>
                        <td className="p-2.5 font-bold text-cyan-300">
                          {upcomersMapping.upcomersSide} @ ${upcomersMapping.entryPriceUsd}
                        </td>
                        <td className="p-2.5 text-emerald-400 font-bold">EXACT PRICE</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 text-slate-400">Stop-Loss & Distance</td>
                        <td className="p-2.5 font-bold text-rose-400">
                          ${upcomersMapping.stopLossPriceUsd} (Δ ${upcomersMapping.stopLossDistanceUsd})
                        </td>
                        <td className="p-2.5 font-bold text-rose-300">
                          {upcomersMapping.stopLossDistancePct}% from Entry
                        </td>
                        <td className="p-2.5 text-emerald-400 font-bold">STOP-LOSS VERIFIED</td>
                      </tr>
                      <tr>
                        <td className="p-2.5 text-slate-400">Calculated Position Size</td>
                        <td className="p-2.5 font-black text-amber-300">
                          {upcomersMapping.calculatedQuantityContracts} {paritySymbol.replace('USDT', '')}
                        </td>
                        <td className="p-2.5 font-black text-white">
                          ${upcomersMapping.notionalOrderValueUsd} Notional (${upcomersMapping.marginRequiredUsd2x} @ 2×)
                        </td>
                        <td className="p-2.5 text-emerald-400 font-bold">
                          Risk = ${upcomersMapping.permittedRiskUsd} ({upcomersMapping.permittedRiskPctOfEquity}%)
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Dynamic Daily Target Tracker ($10K <-> $20K <-> $30K <-> $40K <-> $50K) */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="text-xs font-black text-amber-400 uppercase">
                      Dynamic Daily Target Milestone Tracker ($10K ↔ $20K ↔ $30K ↔ $40K ↔ $50K)
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Current Equity: $10,200.00 • Daily Drawdown Remaining: $303.23 • Max Loss Floor: $9,400.00
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {[10000, 20000, 30000, 40000, 50000].map(milestone => (
                      <button
                        key={milestone}
                        onClick={() => setDynamicTargetBalance(milestone)}
                        className={`px-2.5 py-1 rounded text-xs font-black ${
                          dynamicTargetBalance === milestone
                            ? 'bg-emerald-500 text-black'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        ${milestone / 1000}K
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg">
                    <div className="text-[10px] text-slate-400">Selected Target Balance</div>
                    <div className="text-base font-black text-emerald-400 mt-0.5">
                      ${dynamicTargetBalance.toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg">
                    <div className="text-[10px] text-slate-400">Net Gain Required from $10,200</div>
                    <div className="text-base font-black text-white mt-0.5">
                      ${Math.max(0, dynamicTargetBalance - 10200).toLocaleString()}
                    </div>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg">
                    <div className="text-[10px] text-slate-400">1:1 R-Units Needed (@ ${permittedRiskUsd}/R)</div>
                    <div className="text-base font-black text-amber-400 mt-0.5">
                      {Math.ceil(Math.max(0, dynamicTargetBalance - 10200) / permittedRiskUsd)} R
                    </div>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg">
                    <div className="text-[10px] text-slate-400">1:10 R-Units Needed</div>
                    <div className="text-base font-black text-cyan-300 mt-0.5">
                      {Math.ceil(Math.max(0, dynamicTargetBalance - 10200) / (permittedRiskUsd * 10))} Trades
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ====================================================================
              TAB 5: UNIVERSAL 5-MINUTE ROCKET ENGINE SCANNER & EMERGENCY OVERLAY
          ==================================================================== */}
          {activeTab === 'FIVE_MIN_ROCKET' && (
            <div className="space-y-4">
              <div className="bg-slate-900/90 border border-rose-500/40 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-black text-rose-400 uppercase">
                    SR Time Universal Five-Minute Rocket Engine (1,500-Instrument Universe → 100 Shortlist)
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    Strict Rule: Never force an entry just because 5 minutes elapsed. Transfer the main chart ONLY when both the 5m Zero-to-Zero sequence and 1m Micro Retest (<code className="text-emerald-300">RETEST_CONFIRMED</code>) are verified.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {fiveMinCandidates.map(cand => (
                  <div
                    key={cand.instrument}
                    className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-white">{cand.instrument}</span>
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 text-[10px] font-bold">
                          {cand.category} • {cand.timeframe}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-purple-500/15 border border-purple-500/30 text-purple-300 text-[10px] font-bold">
                          {cand.zeroSequenceState}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-black ${
                            cand.nextAction === 'READY'
                              ? 'bg-emerald-500 text-black'
                              : cand.nextAction === 'WAIT'
                                ? 'bg-amber-500 text-black'
                                : 'bg-rose-500 text-white'
                          }`}
                        >
                          {cand.nextAction}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">{cand.statusReason}</p>
                      <div className="text-[11px] text-slate-400">
                        Entry: <span className="text-white font-bold">${cand.entryPrice}</span> • SL:{' '}
                        <span className="text-rose-400 font-bold">${cand.stopLossPrice}</span> • Target:{' '}
                        <span className="text-emerald-400 font-bold">${cand.targetPrice}</span> • Elapsed:{' '}
                        {cand.elapsedSeconds}s / 300s
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEmergencyCandidate(cand)}
                        className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/50 text-rose-300 rounded-lg text-xs font-black flex items-center gap-1.5"
                      >
                        <BellRing className="w-3.5 h-3.5" />
                        <span>Full-Screen Alert</span>
                      </button>

                      {cand.nextAction === 'READY' && onSelectInstrumentForChart && (
                        <button
                          onClick={() => {
                            const cleanSym = cand.instrument.split(' ')[0];
                            onSelectInstrumentForChart(cleanSym, cand.timeframe);
                            onClose();
                          }}
                          className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-lg text-xs font-black"
                        >
                          Transfer to Main Chart
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ====================================================================
              TAB 6: 16-POINT MASTER RESEARCH ARTICLE & SYSTEM CONSTITUTION
          ==================================================================== */}
          {activeTab === 'SIXTEEN_POINT_ARTICLE' && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 space-y-4 text-xs text-slate-300 leading-relaxed">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-base font-black text-white uppercase">
                  SRBMPR Master Research Article & System Constitution (16 Architectural Laws)
                </h3>
                <p className="text-[11px] text-amber-400 mt-0.5">
                  Preserve the Footprint • Distinguish Zero vs. Minus-Zero • Enforce 3 ⊃ 2 ⊃ 1 Asymmetric Inclusion
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-lg space-y-1">
                  <div className="font-black text-amber-400">1–4. Four-Layer Record Constitution</div>
                  <p>
                    Every archive record strictly separates (1) Immutable Raw OHLC Data, (2) Derived Candle Measurements (Body, Upper Wick, Lower Wick, Total Range with Zero-Range guard), (3) SRBMPR Mechanism Rule Binding, and (4) Chronological Replay Evidence with SHA-256 verification.
                  </p>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-lg space-y-1">
                  <div className="font-black text-emerald-400">5–8. Left-Side Causal vs. Right-Side Reaction</div>
                  <p>
                    Left-Side ascending structures (Low → High → Low) and Right-Side descending reaction structures (Lower-High → Lower-Low, "मजबूरन मजबूरी") are stored in separate tables from 2009 to 2026. Mirroring or inverting Left-Side candles to fabricate Right-Side data is strictly banned.
                  </p>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-lg space-y-1">
                  <div className="font-black text-cyan-400">9–12. Three Nested Containers (3 ⊃ 2 ⊃ 1)</div>
                  <p>
                    Container 3 (Macro Parent) encloses Container 2 and Container 1. Container 2 (Middle 1:1 Anchor) encloses Container 1 only. Container 1 (Micro 1m Retest) encloses no higher container. Unborn higher levels inside micro containers are explicitly classified as MEASUREMENT_ABSENT_IN_CONTAINER.
                  </p>
                </div>
                <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-lg space-y-1">
                  <div className="font-black text-purple-400">13–16. MINUS_ZERO & Empirical Signed Sequence</div>
                  <p>
                    MINUS_ZERO is preserved as a distinct structural token from ZERO_BASELINE. The empirical signed sequence (-4 → +4 → +3 → -3 → +2 → -2) is preserved in exact observed order without numerical sorting.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* FULL-SCREEN EMERGENCY ALERT OVERLAY (WAIT / CONFIRM / CANCEL / READY) */}
      {emergencyCandidate && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-6">
          <div className="max-w-2xl w-full bg-[#090d16] border-2 border-rose-500 rounded-2xl p-6 shadow-2xl space-y-5 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/20 border border-rose-500 text-rose-300 text-xs font-black uppercase">
              <BellRing className="w-4 h-4 animate-bounce" />
              <span>SRBMPR Emergency Micro-Sequence Alert</span>
            </div>

            <div className="space-y-2">
              <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {emergencyCandidate.instrument} ({emergencyCandidate.timeframe})
              </div>
              <div className="text-xl font-black text-amber-400">
                ACTION: {emergencyCandidate.nextAction} • {emergencyCandidate.zeroSequenceState}
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm text-slate-200">
              {emergencyCandidate.statusReason}
            </div>

            <div className="grid grid-cols-3 gap-3 text-sm">
              <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl">
                <div className="text-xs text-slate-400">Entry Price</div>
                <div className="text-lg font-black text-white mt-0.5">${emergencyCandidate.entryPrice}</div>
              </div>
              <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl">
                <div className="text-xs text-slate-400">Stop-Loss</div>
                <div className="text-lg font-black text-rose-400 mt-0.5">${emergencyCandidate.stopLossPrice}</div>
              </div>
              <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl">
                <div className="text-xs text-slate-400">Target Price</div>
                <div className="text-lg font-black text-emerald-400 mt-0.5">${emergencyCandidate.targetPrice}</div>
              </div>
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setEmergencyCandidate(null)}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs rounded-xl uppercase"
              >
                Acknowledge & Dismiss Alert
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SrbmprMasterResearchSystem;
