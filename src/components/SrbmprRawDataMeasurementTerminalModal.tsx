import React, { useState, useMemo } from 'react';
import {
  X,
  Ruler,
  Search,
  Database,
  Clock,
  Crosshair,
  StepForward,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Download,
  Edit3
} from 'lucide-react';
import {
  SrbmprRawDataMeasurementService,
  RawCandleMeasurementRecord,
  ResearchTimezone,
  ZeroMechanismRole
} from '../services/SrbmprRawDataMeasurementService';
import { RawOhlcBar, ForwardTimeframe } from '../services/SrbmprForwardTestEngine';

export interface SrbmprRawDataMeasurementTerminalModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSymbol: string;
  activeTimeframe: ForwardTimeframe;
  activeTimezone: ResearchTimezone;
  bars: RawOhlcBar[];
  currentIndex: number;
  isForwardReplayMode: boolean;
  liveOneSecBars: RawOhlcBar[];
  onJumpToCandleAndLock: (
    targetArrayIndex: number,
    highlightRange?: { startIdx: number; endIdx: number; label: string }
  ) => void;
  onSelectCryptoSymbol: (symbol: string) => void;
  onFetchMoreHistoricalBatch: () => Promise<void>;
  isFetchingBatch: boolean;
}

export const SrbmprRawDataMeasurementTerminalModal: React.FC<
  SrbmprRawDataMeasurementTerminalModalProps
> = ({
  isOpen,
  onClose,
  activeSymbol,
  activeTimeframe,
  activeTimezone,
  bars,
  currentIndex,
  isForwardReplayMode,
  liveOneSecBars,
  onJumpToCandleAndLock,
  onSelectCryptoSymbol,
  onFetchMoreHistoricalBatch,
  isFetchingBatch
}) => {
  const service = useMemo(() => SrbmprRawDataMeasurementService.getInstance(), []);

  const [activeTab, setActiveTab] = useState<
    | 'RAW_MEASUREMENTS'
    | 'BACKWARD_DATE_SEARCH'
    | 'MICRO_1S_TERMINAL'
    | 'CRYPTO_100_UNIVERSE'
    | 'DIAGNOSTIC_9_POINT_REPORT'
  >('RAW_MEASUREMENTS');

  const [roleFilter, setRoleFilter] = useState<'ALL' | 'ZERO_STRUCTURES_ONLY' | ZeroMechanismRole>(
    'ZERO_STRUCTURES_ONLY'
  );
  const [dateSearchInput, setDateSearchInput] = useState<string>(
    bars.length > 10 ? bars[bars.length - 10].timeFormatted : '2026-10-27 12:00:00'
  );
  const [editingMeasurementId, setEditingMeasurementId] = useState<string | null>(null);
  const [correctionNoteInput, setCorrectionNoteInput] = useState<string>('');
  const [correctionVersion, setCorrectionVersion] = useState<number>(0);
  const [oneSecCursorIdx, setOneSecCursorIdx] = useState<number>(0);

  // Build raw-data measurements from a focused 1,500-candle window around currentIndex when modal is open
  const allMeasurements = useMemo(() => {
    if (!isOpen || bars.length === 0) return [];
    void correctionVersion;
    const winStart = Math.max(0, currentIndex - 1000);
    const winEnd = Math.min(bars.length, currentIndex + 500);
    const windowBars = bars.slice(winStart, winEnd);
    return service.buildMeasurementsFromRawBars(
      windowBars,
      activeSymbol,
      activeTimeframe,
      currentIndex,
      isForwardReplayMode,
      'Bybit V5 Linear Archive'
    );
  }, [isOpen, service, bars, activeSymbol, activeTimeframe, currentIndex, isForwardReplayMode, correctionVersion]);

  // Build 1-second measurements from authentic live tick-reconstructed bars
  const oneSecMeasurements = useMemo(() => {
    if (!isOpen) return [];
    return service.buildMeasurementsFromRawBars(
      liveOneSecBars,
      activeSymbol,
      '1s',
      oneSecCursorIdx,
      false,
      'Bybit V5 Live publicTrade 1s Stream'
    );
  }, [isOpen, service, liveOneSecBars, activeSymbol, oneSecCursorIdx]);

  const filteredMeasurements = useMemo(() => {
    if (!isOpen) return [];
    if (roleFilter === 'ALL') return [...allMeasurements].reverse();
    if (roleFilter === 'ZERO_STRUCTURES_ONLY') {
      return [...allMeasurements]
        .filter(m => m.zeroRole !== 'STANDARD_OBSERVATION')
        .reverse();
    }
    return [...allMeasurements].filter(m => m.zeroRole === roleFilter).reverse();
  }, [isOpen, allMeasurements, roleFilter]);

  const dateSearchResult = useMemo(() => {
    if (!isOpen || bars.length === 0) {
      return service.investigateDateAndBackwardSequence(
        dateSearchInput,
        [],
        activeSymbol,
        activeTimeframe
      );
    }
    const parsedMs = Date.parse(
      dateSearchInput.includes('T') ? dateSearchInput : `${dateSearchInput.trim()}Z`
    );
    if (!Number.isNaN(parsedMs) && parsedMs >= bars[0].timestamp) {
      // Binary search across all 100,000 candles for instant date lookup
      let lo = 0;
      let hi = bars.length - 1;
      let matchIdx = 0;
      while (lo <= hi) {
        const mid = (lo + hi) >>> 1;
        if (bars[mid].timestamp <= parsedMs) {
          matchIdx = mid;
          lo = mid + 1;
        } else {
          hi = mid - 1;
        }
      }
      const sliceStart = Math.max(0, matchIdx - 30);
      const sliceEnd = Math.min(bars.length, matchIdx + 5);
      const sliceMeasurements = service.buildMeasurementsFromRawBars(
        bars.slice(sliceStart, sliceEnd),
        activeSymbol,
        activeTimeframe,
        currentIndex,
        isForwardReplayMode,
        'Bybit V5 Linear Archive'
      );
      return service.investigateDateAndBackwardSequence(
        dateSearchInput,
        sliceMeasurements,
        activeSymbol,
        activeTimeframe
      );
    }
    // Outside earliest bar -> pass earliest bar so missingArchiveNotice reports accurately
    const edgeMeasurements = service.buildMeasurementsFromRawBars(
      bars.slice(0, Math.min(5, bars.length)),
      activeSymbol,
      activeTimeframe,
      currentIndex,
      isForwardReplayMode,
      'Bybit V5 Linear Archive'
    );
    return service.investigateDateAndBackwardSequence(
      dateSearchInput,
      edgeMeasurements,
      activeSymbol,
      activeTimeframe
    );
  }, [isOpen, service, dateSearchInput, bars, activeSymbol, activeTimeframe, currentIndex, isForwardReplayMode]);

  const crypto100Manifest = useMemo(() => {
    if (!isOpen) return [];
    return service.get100CryptoArchiveManifest(activeSymbol, bars.length);
  }, [isOpen, service, activeSymbol, bars.length]);

  const diagnosticReport = useMemo(() => {
    return service.getRepositoryDiagnosticReport(
      activeSymbol,
      activeTimeframe,
      bars.length,
      liveOneSecBars.length
    );
  }, [service, activeSymbol, activeTimeframe, bars.length, liveOneSecBars.length]);

  if (!isOpen) return null;

  const handleSaveCorrection = (measurementId: string) => {
    service.recordMeasurementCorrection(measurementId, correctionNoteInput);
    setEditingMeasurementId(null);
    setCorrectionNoteInput('');
    setCorrectionVersion(v => v + 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-3 sm:p-5 font-mono select-text">
      <div className="w-full max-w-7xl bg-[#070b14] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        {/* Top Header */}
        <div className="px-5 py-3.5 bg-[#0b101d] border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center">
              <Ruler className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-sm sm:text-base font-black text-white uppercase tracking-wider">
                  SRBMPR — Raw-Data Measurement Tool & Micro-Candle Research Terminal
                </h2>
                <span className="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  RAW DATA = EVIDENCE • ZERO TRADING SIGNALS
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Click any measurement to jump directly to its source candles, inspect the preceding Zero sequence, and step forward on the frozen chart
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
        <div className="px-5 py-2.5 bg-[#090e1a] border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setActiveTab('RAW_MEASUREMENTS')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
                activeTab === 'RAW_MEASUREMENTS'
                  ? 'bg-amber-500 text-black'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Ruler className="w-3.5 h-3.5" />
              <span>1. Raw-Data Measurements ({allMeasurements.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('BACKWARD_DATE_SEARCH')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
                activeTab === 'BACKWARD_DATE_SEARCH'
                  ? 'bg-cyan-500 text-black'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>2. Date & Backward Sequence Search</span>
            </button>

            <button
              onClick={() => setActiveTab('MICRO_1S_TERMINAL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
                activeTab === 'MICRO_1S_TERMINAL'
                  ? 'bg-emerald-500 text-black'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>3. Micro 1-Second Terminal ({liveOneSecBars.length} Live 1s)</span>
            </button>

            <button
              onClick={() => setActiveTab('CRYPTO_100_UNIVERSE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
                activeTab === 'CRYPTO_100_UNIVERSE'
                  ? 'bg-purple-500 text-black'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>4. 100-Coin Crypto Archive (100K Target)</span>
            </button>

            <button
              onClick={() => setActiveTab('DIAGNOSTIC_9_POINT_REPORT')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1.5 ${
                activeTab === 'DIAGNOSTIC_9_POINT_REPORT'
                  ? 'bg-rose-500 text-white'
                  : 'bg-slate-900 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>5. 9-Point Archive & Chart Audit</span>
            </button>
          </div>

          {/* Fetch Additional Historical Batch Button */}
          <button
            onClick={onFetchMoreHistoricalBatch}
            disabled={isFetchingBatch}
            className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-300 rounded-lg text-xs font-black flex items-center gap-1.5 disabled:opacity-50"
            title="Paginate backward on Bybit V5 REST API to append earlier historical candles"
          >
            <Download className="w-3.5 h-3.5" />
            <span>
              {isFetchingBatch
                ? 'Loading Historical Batch...'
                : `Load Older Batch (+1,000 Candles • Current: ${bars.length})`}
            </span>
          </button>
        </div>

        {/* ====================================================================
            TAB 1: RAW-DATA MEASUREMENTS & CLICK-TO-JUMP CANDLE INSPECTOR
        ==================================================================== */}
        {activeTab === 'RAW_MEASUREMENTS' && (
          <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-black text-amber-400 uppercase">
                  Direct Measurement-to-Candle Navigation ({activeSymbol} • {activeTimeframe} • {activeTimezone})
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Click <strong>&quot;Jump &amp; Lock on Chart&quot;</strong> on any row below to position the chart at that exact candle, highlight its preceding Zero sequence, and continue the Forward Test step-by-step.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  onClick={() => setRoleFilter('ZERO_STRUCTURES_ONLY')}
                  className={`px-2.5 py-1 rounded text-[11px] font-black ${
                    roleFilter === 'ZERO_STRUCTURES_ONLY'
                      ? 'bg-amber-500 text-black'
                      : 'bg-slate-950 text-slate-300 border border-slate-800'
                  }`}
                >
                  Zero & Sequence Events ({allMeasurements.filter(m => m.zeroRole !== 'STANDARD_OBSERVATION').length})
                </button>
                <button
                  onClick={() => setRoleFilter('ZERO_ORIGIN')}
                  className={`px-2.5 py-1 rounded text-[11px] font-black ${
                    roleFilter === 'ZERO_ORIGIN'
                      ? 'bg-emerald-500 text-black'
                      : 'bg-slate-950 text-slate-300 border border-slate-800'
                  }`}
                >
                  ZERO_ORIGIN Only
                </button>
                <button
                  onClick={() => setRoleFilter('ZERO_COMPLETION_CONFIRMED')}
                  className={`px-2.5 py-1 rounded text-[11px] font-black ${
                    roleFilter === 'ZERO_COMPLETION_CONFIRMED'
                      ? 'bg-cyan-500 text-black'
                      : 'bg-slate-950 text-slate-300 border border-slate-800'
                  }`}
                >
                  ZERO_COMPLETION Only
                </button>
                <button
                  onClick={() => setRoleFilter('ALL')}
                  className={`px-2.5 py-1 rounded text-[11px] font-black ${
                    roleFilter === 'ALL'
                      ? 'bg-purple-500 text-black'
                      : 'bg-slate-950 text-slate-300 border border-slate-800'
                  }`}
                >
                  All Raw Candles ({allMeasurements.length})
                </button>
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden">
              <div className="overflow-x-auto max-h-[58vh]">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="sticky top-0 bg-slate-950 border-b border-slate-800 text-[10px] text-slate-400 uppercase z-10">
                    <tr>
                      <th className="p-2.5">Candle #</th>
                      <th className="p-2.5">Timestamp ({activeTimezone})</th>
                      <th className="p-2.5">Raw OHLC</th>
                      <th className="p-2.5">Body / Upper / Lower / Range</th>
                      <th className="p-2.5">Mechanism Role & Cycle</th>
                      <th className="p-2.5">Derivation Evidence & Corrections</th>
                      <th className="p-2.5">Navigate & Forward Test</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredMeasurements.slice(0, 250).map(m => (
                      <tr key={m.measurementId} className="hover:bg-slate-800/40">
                        <td className="p-2.5 font-black text-cyan-300">
                          #{m.candleIndex}
                          <div className="text-[10px] text-slate-500">{m.provenance}</div>
                        </td>
                        <td className="p-2.5 text-white font-bold">
                          {service.formatTimestampInTimezone(m.timestampUtcMs, activeTimezone)}
                          <div className="text-[10px] text-slate-500">UTC: {m.timestampUtcIso}</div>
                        </td>
                        <td className="p-2.5 tabular-nums">
                          <div>
                            <span className="text-slate-400">O:</span> {m.open}{' '}
                            <span className="text-emerald-400">H:</span> {m.high}
                          </div>
                          <div>
                            <span className="text-rose-400">L:</span> {m.low}{' '}
                            <span className="text-amber-300">C:</span> {m.close}
                          </div>
                        </td>
                        <td className="p-2.5 tabular-nums">
                          <div>
                            Body: <strong>{m.bodySize}</strong> ({m.bodyPctOfRange}%) | Range:{' '}
                            <strong>{m.totalRange}</strong>
                          </div>
                          <div className="text-[11px] text-slate-400">
                            UWick: {m.upperWickSize} ({m.upperWickPctOfRange}%) | LWick:{' '}
                            {m.lowerWickSize} ({m.lowerWickPctOfRange}%)
                          </div>
                        </td>
                        <td className="p-2.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-black inline-block ${
                              m.zeroRole === 'ZERO_ORIGIN'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : m.zeroRole === 'ZERO_COMPLETION_CONFIRMED'
                                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                                  : m.zeroRole === 'MINUS_ZERO_EXTENSION'
                                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                                    : m.zeroRole === 'STANDARD_OBSERVATION'
                                      ? 'bg-slate-800 text-slate-400'
                                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            }`}
                          >
                            {m.zeroRole}
                          </span>
                          <div className="text-[10px] text-slate-400 mt-1">
                            {m.cycleSequenceId} • Zero Ref: ${m.precedingZeroPrice} (Candle #
                            {m.precedingStartArrayIndex + 1}→#{m.candleIndex})
                          </div>
                        </td>
                        <td className="p-2.5 max-w-xs">
                          <div className="text-[11px] text-slate-300 leading-snug">
                            {m.derivationRuleText}
                          </div>
                          {m.researcherCorrectionNote && (
                            <div className="mt-1 p-1.5 rounded bg-amber-500/15 border border-amber-500/40 text-[10px] text-amber-200">
                              <strong>Researcher Correction ({m.correctedAtUtc}):</strong>{' '}
                              {m.researcherCorrectionNote}
                            </div>
                          )}
                          {editingMeasurementId === m.measurementId ? (
                            <div className="mt-1.5 flex items-center gap-1">
                              <input
                                type="text"
                                value={correctionNoteInput}
                                onChange={e => setCorrectionNoteInput(e.target.value)}
                                placeholder="Record correction note..."
                                className="bg-slate-950 border border-slate-700 rounded px-2 py-1 text-[11px] text-white flex-1"
                              />
                              <button
                                onClick={() => handleSaveCorrection(m.measurementId)}
                                className="px-2 py-1 bg-emerald-500 text-black font-black rounded text-[10px]"
                              >
                                Save
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingMeasurementId(m.measurementId);
                                setCorrectionNoteInput(m.researcherCorrectionNote || '');
                              }}
                              className="mt-1 text-[10px] text-amber-400 hover:underline flex items-center gap-1"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Log Correction Note</span>
                            </button>
                          )}
                        </td>
                        <td className="p-2.5">
                          <button
                            onClick={() => {
                              onJumpToCandleAndLock(m.arrayIndex, {
                                startIdx: m.precedingStartArrayIndex,
                                endIdx: m.arrayIndex,
                                label: `${m.zeroRole} (${m.cycleSequenceId})`
                              });
                              onClose();
                            }}
                            className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-lg text-[11px] flex items-center gap-1 shadow-sm"
                          >
                            <Crosshair className="w-3.5 h-3.5" />
                            <span>Jump & Lock on Chart</span>
                          </button>
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
            TAB 2: DATE & TIME SEARCH + BACKWARD SEQUENCE INVESTIGATOR
        ==================================================================== */}
        {activeTab === 'BACKWARD_DATE_SEARCH' && (
          <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="font-black text-cyan-400 uppercase">
                Archive Date Investigator & Backward Zero-Sequence Finder
              </div>
              <p className="text-[11px] text-slate-300">
                Enter any UTC timestamp (`YYYY-MM-DD HH:mm:ss`) to search the existing archive and walk backward through the preceding candles to identify its Zero structure. If the date precedes the loaded archive, the exact missing range is reported without fabricating data.
              </p>

              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  value={dateSearchInput}
                  onChange={e => setDateSearchInput(e.target.value)}
                  placeholder="YYYY-MM-DD HH:mm:ss"
                  className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white w-64 font-bold"
                />
                {bars.length > 0 && (
                  <>
                    <button
                      onClick={() => setDateSearchInput(bars[Math.floor(bars.length * 0.25)].timeFormatted)}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-bold"
                    >
                      Sample 25% Archive Date
                    </button>
                    <button
                      onClick={() => setDateSearchInput(bars[Math.floor(bars.length * 0.6)].timeFormatted)}
                      className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-bold"
                    >
                      Sample 60% Archive Date
                    </button>
                  </>
                )}
              </div>

              {dateSearchResult.missingDataReport && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/50 text-rose-200 flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>{dateSearchResult.missingDataReport}</div>
                </div>
              )}

              {dateSearchResult.matchedCandle && (
                <div className="bg-slate-950 border border-cyan-500/40 rounded-xl p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <span className="text-cyan-400 font-black">
                        Matched Candle #{dateSearchResult.matchedCandle.candleIndex} •{' '}
                        {dateSearchResult.matchedCandle.timestampUtcIso} UTC
                      </span>
                      <div className="text-[11px] text-slate-400">
                        Preceding Sequence Window: Candle #
                        {dateSearchResult.precedingSequenceCandles[0]?.candleIndex} → #
                        {dateSearchResult.matchedCandle.candleIndex} (
                        {dateSearchResult.precedingSequenceCandles.length} bars inspected backward)
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        const mc = dateSearchResult.matchedCandle!;
                        const firstPre =
                          dateSearchResult.precedingSequenceCandles[0]?.arrayIndex ?? mc.arrayIndex;
                        onJumpToCandleAndLock(mc.arrayIndex, {
                          startIdx: firstPre,
                          endIdx: mc.arrayIndex,
                          label: `Date Search Sequence (${mc.timestampUtcIso})`
                        });
                        onClose();
                      }}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-lg text-xs flex items-center gap-1.5"
                    >
                      <Crosshair className="w-3.5 h-3.5" />
                      <span>Jump Chart to This Date & Lock for Forward Test</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-[11px]">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 uppercase">
                          <th className="p-2">Candle #</th>
                          <th className="p-2">UTC Timestamp</th>
                          <th className="p-2">OHLC</th>
                          <th className="p-2">Body / Range</th>
                          <th className="p-2">Zero / Sequence Role</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/50">
                        {dateSearchResult.precedingSequenceCandles.map(pc => (
                          <tr key={pc.measurementId}>
                            <td className="p-2 font-black text-cyan-300">#{pc.candleIndex}</td>
                            <td className="p-2 text-white">{pc.timestampUtcIso}</td>
                            <td className="p-2">
                              O:{pc.open} H:{pc.high} L:{pc.low} C:{pc.close}
                            </td>
                            <td className="p-2">
                              Body: {pc.bodySize} / Range: {pc.totalRange}
                            </td>
                            <td className="p-2 font-bold text-amber-300">{pc.zeroRole}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ====================================================================
            TAB 3: MICRO-CANDLE & 1-SECOND RESEARCH TERMINAL
        ==================================================================== */}
        {activeTab === 'MICRO_1S_TERMINAL' && (
          <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
            <div className="bg-slate-900/90 border border-emerald-500/40 rounded-xl p-4 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-black text-emerald-400 uppercase">
                  Micro-Candle 1-Second (1s) Research Terminal — Authentic Live Tick Reconstruction
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-black">
                  ZERO FABRICATION • EMPTY SECONDS PRESERVED
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                <strong>Technical Provenance Rule:</strong> A 1-minute historical candle cannot be mathematically subdivided into real 1-second candles without raw trade/tick observations. Below are the authentic 1-second candles reconstructed in real time from incoming Bybit V5 <code className="text-cyan-300">publicTrade.{activeSymbol}</code> WebSocket trades during this session.
              </p>
            </div>

            {oneSecMeasurements.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center text-slate-400">
                Waiting for live WebSocket trades on <strong>{activeSymbol}</strong> to construct authentic 1-second candles... (Empty seconds with 0 trades are never fabricated).
              </div>
            ) : (
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-white font-black">
                    Captured Authentic 1-Second Candles: {oneSecMeasurements.length} | Stepping Index: #
                    {Math.min(oneSecMeasurements.length, oneSecCursorIdx + 1)} / {oneSecMeasurements.length}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setOneSecCursorIdx(prev => Math.max(0, prev - 1))}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded font-bold"
                    >
                      -1 Second
                    </button>
                    <button
                      onClick={() =>
                        setOneSecCursorIdx(prev => Math.min(oneSecMeasurements.length - 1, prev + 1))
                      }
                      className="px-2.5 py-1 bg-emerald-500 hover:bg-emerald-400 text-black rounded font-black flex items-center gap-1"
                    >
                      <span>+1 Second</span>
                      <StepForward className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto max-h-[48vh]">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="sticky top-0 bg-slate-950 border-b border-slate-800 text-[10px] text-slate-400 uppercase">
                      <tr>
                        <th className="p-2">1s Seq #</th>
                        <th className="p-2">Exact Second ({activeTimezone})</th>
                        <th className="p-2">1s OHLC</th>
                        <th className="p-2">Body / Range</th>
                        <th className="p-2">Micro Zero Role</th>
                        <th className="p-2">Provenance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {oneSecMeasurements.map((sm, idx) => (
                        <tr
                          key={sm.measurementId}
                          className={
                            idx === oneSecCursorIdx
                              ? 'bg-emerald-500/15 border-l-2 border-emerald-400'
                              : 'hover:bg-slate-800/40'
                          }
                        >
                          <td className="p-2 font-black text-emerald-300">#{sm.candleIndex}</td>
                          <td className="p-2 text-white font-bold">
                            {service.formatTimestampInTimezone(sm.timestampUtcMs, activeTimezone)}
                          </td>
                          <td className="p-2 tabular-nums">
                            O:{sm.open} H:{sm.high} L:{sm.low} C:{sm.close}
                          </td>
                          <td className="p-2 tabular-nums">
                            Body: {sm.bodySize} | Range: {sm.totalRange}
                          </td>
                          <td className="p-2 font-bold text-amber-300">{sm.zeroRole}</td>
                          <td className="p-2 text-[10px] text-cyan-300">{sm.provenance}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ====================================================================
            TAB 4: 100-COIN HIGH-VOLUME CRYPTO UNIVERSE & 100,000-CANDLE MANIFEST
        ==================================================================== */}
        {activeTab === 'CRYPTO_100_UNIVERSE' && (
          <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
            <div className="bg-slate-900/90 border border-purple-500/40 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-black text-purple-300 uppercase">
                  100-Coin High-Volume Crypto Research Universe — 100,000-Candle Coverage Manifest
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Pure verifiable crypto perpetuals only (no stocks, forex, or commodities mixed in). Exchange listing date is recorded separately from earliest verified candle, and any shortfall from the 100,000-candle target is explicitly reported.
                </p>
              </div>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-xl overflow-hidden">
              <div className="overflow-x-auto max-h-[58vh]">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="sticky top-0 bg-slate-950 border-b border-slate-800 text-[10px] text-slate-400 uppercase">
                    <tr>
                      <th className="p-2.5">#</th>
                      <th className="p-2.5">Crypto Asset</th>
                      <th className="p-2.5">Listing Date vs First Candle</th>
                      <th className="p-2.5">Loaded vs 100,000 Target</th>
                      <th className="p-2.5">Shortfall Report</th>
                      <th className="p-2.5">1s Tick Status</th>
                      <th className="p-2.5">Load Asset</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {crypto100Manifest.map(item => (
                      <tr key={item.symbol} className="hover:bg-slate-800/40">
                        <td className="p-2.5 text-slate-400 font-bold">{item.rank}</td>
                        <td className="p-2.5 font-black text-white">
                          {item.symbol}
                          <div className="text-[10px] text-slate-400">{item.marketSource}</div>
                        </td>
                        <td className="p-2.5 text-[11px]">
                          <div className="text-slate-300">Listed: {item.exchangeListingDateUtc}</div>
                          <div className="text-emerald-400">1st Bar: {item.earliestVerifiedCandleUtc}</div>
                        </td>
                        <td className="p-2.5 tabular-nums font-bold text-cyan-300">
                          {item.loadedArchiveCandles.toLocaleString()} /{' '}
                          {item.targetArchiveCandles.toLocaleString()}
                        </td>
                        <td className="p-2.5 tabular-nums text-amber-300">
                          {item.shortfallCandles.toLocaleString()} candles remaining (use Batch Loader / Archive DB)
                        </td>
                        <td className="p-2.5 text-[10px] text-emerald-300">
                          Live publicTrade 1s Active
                        </td>
                        <td className="p-2.5">
                          <button
                            onClick={() => {
                              onSelectCryptoSymbol(item.symbol);
                              onClose();
                            }}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-amber-500 hover:text-black text-amber-400 font-black rounded text-[11px] transition-colors"
                          >
                            Inspect {item.baseCoin}
                          </button>
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
            TAB 5: 9-POINT REPOSITORY, ARCHIVE & CHART STABILITY AUDIT REPORT
        ==================================================================== */}
        {activeTab === 'DIAGNOSTIC_9_POINT_REPORT' && (
          <div className="p-5 overflow-y-auto space-y-4 flex-1 text-xs">
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-black text-amber-400 uppercase">
                  Section 10 — 9-Point Repository & Archive Inspection Report
                </span>
                <span className="text-[10px] text-emerald-400 font-bold">
                  Generated: {diagnosticReport.generatedAtUtc}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg space-y-1">
                  <div className="text-cyan-400 font-black">
                    1–3. Raw Datasets & 100,000-Candle Coverage Status
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    • Active symbol <strong>{activeSymbol} ({activeTimeframe})</strong> currently has{' '}
                    <strong>{bars.length.toLocaleString()}</strong> authentic candles loaded in browser memory from Bybit V5 REST API.<br />
                    • Bybit V5 returns up to 1,000 candles per single HTTP request. Clicking{' '}
                    <strong>&quot;Load Older Batch (+1,000 Candles)&quot;</strong> paginates backward using the earliest candle&apos;s timestamp to accumulate deeper history toward the 100,000-candle archive target.
                  </p>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-3 rounded-lg space-y-1">
                  <div className="text-emerald-400 font-black">
                    4–5. One-Second (1s) Availability & Derived Measurements
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    • Authentic 1-second candles cannot be mathematically inferred from 1-minute OHLC bars.<br />
                    • Real-time 1-second candles ({liveOneSecBars.length} captured this session) are aggregated strictly from incoming Bybit V5 <code className="text-cyan-300">publicTrade</code> ticks, preserving empty seconds as empty.<br />
                    • Derived measurements computed for every bar: Body, Upper Wick, Lower Wick, Range, Midpoint, Wick/Range %, and Zero sequence role.
                  </p>
                </div>

                <div className="bg-slate-950 border border-amber-500/40 p-3 rounded-lg space-y-1">
                  <div className="text-amber-400 font-black">
                    6. Why the Chart Previously Changed During Forward Testing (Root Cause & Fix)
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    <strong>Root Cause:</strong> {diagnosticReport.chartStabilityRootCauseAndFix.previousIssue}<br />
                    <strong>Implemented Fix:</strong> {diagnosticReport.chartStabilityRootCauseAndFix.implementedFix}
                  </p>
                </div>

                <div className="bg-slate-950 border border-purple-500/40 p-3 rounded-lg space-y-1">
                  <div className="text-purple-400 font-black">
                    7–9. Measurement-to-Candle Jump & Reproducible Replay Verification
                  </div>
                  <p className="text-slate-300 text-[11px] leading-relaxed">
                    {diagnosticReport.measurementNavigationMechanism}<br />
                    • Replay Verification: Deterministic Match ={' '}
                    <strong className="text-emerald-400">
                      {String(diagnosticReport.replayVerificationSummary.deterministicMatch)}
                    </strong>{' '}
                    | Y-Axis Scale Drift During Stepping:{' '}
                    <strong className="text-emerald-400">
                      {diagnosticReport.replayVerificationSummary.scaleDriftDuringStepping}
                    </strong>
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

export default SrbmprRawDataMeasurementTerminalModal;
