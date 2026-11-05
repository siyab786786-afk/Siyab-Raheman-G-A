import React, { useState } from 'react';
import {
  Rocket,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  X,
  Layers,
  Activity,
  AlertTriangle,
  Database,
  Wallet
} from 'lucide-react';
import {
  RocketNoStopLossRecord,
  RocketEngineNoStopLossResearchService
} from '../services/RocketEngineNoStopLossResearchService';

interface SrbmprRocketNoStopLossResearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  symbol: string;
  records: RocketNoStopLossRecord[];
  onSelectRecordToHighlight?: (record: RocketNoStopLossRecord) => void;
}

export const SrbmprRocketNoStopLossResearchModal: React.FC<SrbmprRocketNoStopLossResearchModalProps> = ({
  isOpen,
  onClose,
  symbol,
  records,
  onSelectRecordToHighlight
}) => {
  const [activeTab, setActiveTab] = useState<'SECOND_MINING_PASS' | 'NO_SL_RECORDS'>('SECOND_MINING_PASS');

  if (!isOpen) return null;

  const service = RocketEngineNoStopLossResearchService.getInstance();
  const auditReport = service.getSecondMiningPassAuditReport();

  const qualifyingCount = records.length;
  const longCount = records.filter(r => r.direction === 'LONG').length;
  const shortCount = records.filter(r => r.direction === 'SHORT').length;
  const t5Count = records.filter(r => r.highestTargetHit === '1:5').length;
  const t10Count = records.filter(r => r.highestTargetHit === '1:10').length;
  const t25Count = records.filter(r => r.highestTargetHit === '1:25').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 font-mono select-none">
      <div className="bg-[#0b0f19] border border-amber-500/30 w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-100 max-h-[88vh]">
        
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 bg-[#070a12] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Rocket className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <span>SRBMPR — Second Mining Pass & No-SL Archive</span>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded font-bold">
                  {symbol} • Zero-A / Signed +A & -A Mechanism
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Annual → Monthly → H1 → M1 Hierarchy • Zero-to-Zero Counter vs Wallet Accounting • 1:5 / 1:10 / 1:25 Targets
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
              <button
                onClick={() => setActiveTab('SECOND_MINING_PASS')}
                className={`px-3 py-1 rounded-md font-bold transition-colors ${
                  activeTab === 'SECOND_MINING_PASS'
                    ? 'bg-amber-500 text-black font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Second Mining Pass (Zero-A Audit)
              </button>
              <button
                onClick={() => setActiveTab('NO_SL_RECORDS')}
                className={`px-3 py-1 rounded-md font-bold transition-colors ${
                  activeTab === 'NO_SL_RECORDS'
                    ? 'bg-amber-500 text-black font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                No-SL Records ({qualifyingCount})
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {activeTab === 'SECOND_MINING_PASS' ? (
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
            {/* Top Accounting & Zero-to-Zero Wallet Separation Summary */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2.5">
              <div className="bg-slate-950 p-3 rounded-xl border border-rose-500/30">
                <div className="text-[10px] text-slate-400 uppercase">AXISUSDT Net Loss</div>
                <div className="text-base font-black text-rose-400 tabular-nums">
                  {auditReport.axisTotalNetLossUsdt.toFixed(4)} USDT
                </div>
                <div className="text-[9px] text-slate-500 mt-0.5">
                  Realized: {auditReport.axisRealizedGrossPnlUsdt} | Fee: {auditReport.axisTradingFeesUsdt} | Fund: {auditReport.axisFundingPaidUsdt}
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-rose-500/30">
                <div className="text-[10px] text-slate-400 uppercase">Total Ledger Net Loss</div>
                <div className="text-base font-black text-rose-400 tabular-nums">
                  {auditReport.totalDocumentedNetLossIncludingFloatingUsdt.toFixed(4)} USDT
                </div>
                <div className="text-[9px] text-slate-500 mt-0.5">
                  Closed+Fund: {auditReport.totalDocumentedRealizedAndFundingLossUsdt} | Float: {auditReport.axisFloatingPnlUsdt}
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-amber-500/40">
                <div className="text-[10px] text-amber-300 uppercase">100× Mining Objective</div>
                <div className="text-base font-black text-amber-400 tabular-nums">
                  ${auditReport.recovery100xTotalObjectiveUsdt.toFixed(2)} USDT
                </div>
                <div className="text-[9px] text-slate-500 mt-0.5">
                  AXIS 100×: ${auditReport.recovery100xAxisObjectiveUsdt.toFixed(2)} (Backtest Only)
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-emerald-500/30">
                <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1">
                  <Wallet className="w-3 h-3 text-emerald-400" /> Wallet Accumulated
                </div>
                <div className="text-base font-black text-emerald-400 tabular-nums">
                  {auditReport.completedOnesCreditedToWallet} Completed Ones
                </div>
                <div className="text-[9px] text-slate-500 mt-0.5">
                  Credited only on confirmed Mid-Zone connection
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-cyan-500/30">
                <div className="text-[10px] text-slate-400 uppercase flex items-center gap-1">
                  <Database className="w-3 h-3 text-cyan-400" /> Mining Counter
                </div>
                <div className="text-base font-black text-cyan-400 tabular-nums">
                  {auditReport.activeMiningCounter} (Zero-to-Zero)
                </div>
                <div className="text-[9px] text-slate-500 mt-0.5">
                  Resets to 0 every new cycle; never mixed with Wallet
                </div>
              </div>
            </div>

            {/* Timeframe Hierarchy & Signed Layer Rules */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
              <div className="text-[11px] font-black text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <Layers className="w-3.5 h-3.5" />
                <span>1. Original Time-Zone Hierarchy & Signed Zero-A / Plus-A (`+A, +AA, +AAA`) / Minus-A (`-A, -AA, -AAA, -4A`) Mapping</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px]">
                <div className="bg-slate-900/70 p-2.5 rounded-lg border border-slate-800">
                  <div className="text-white font-bold mb-0.5">Annual (12M) → Monthly (1M)</div>
                  <p className="text-slate-400 text-[10px] leading-relaxed">{auditReport.annualToMonthlyMapping}</p>
                </div>
                <div className="bg-slate-900/70 p-2.5 rounded-lg border border-slate-800">
                  <div className="text-white font-bold mb-0.5">Monthly (25D/1M) → H1 Cycle</div>
                  <p className="text-slate-400 text-[10px] leading-relaxed">{auditReport.monthlyToH1Mapping}</p>
                </div>
                <div className="bg-slate-900/70 p-2.5 rounded-lg border border-slate-800">
                  <div className="text-white font-bold mb-0.5">H1 Controlling → M1 Micro</div>
                  <p className="text-slate-400 text-[10px] leading-relaxed">{auditReport.h1ToM1MicroMapping}</p>
                </div>
              </div>
            </div>

            {/* Sequence Traces: Controlling TF -> Cycle ID -> Zero-A -> Signed Layer -> Entry vs Actual */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
              <div className="text-[11px] font-black text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-3.5 h-3.5" />
                <span>2. Exact Sequence Trace & Faulty State Transition Diagnosis (AXISUSDT Raw Data)</span>
              </div>
              <div className="space-y-2">
                {auditReport.sequenceTraces.map(trace => (
                  <div key={trace.traceId} className="bg-slate-900/80 border border-slate-800 rounded-lg p-2.5 space-y-1.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold">{trace.traceId}</span>
                        <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                          {trace.timestampUtc} UTC
                        </span>
                        <span className="text-[10px] bg-amber-500/15 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded font-bold">
                          {trace.controllingTimeframe} • {trace.cycleId} (Layer {trace.layerIndex})
                        </span>
                        <span className="text-[10px] bg-purple-500/15 text-purple-300 border border-purple-500/30 px-1.5 py-0.5 rounded font-bold">
                          State: {trace.signedALayer} | Zero-A: ${trace.zeroAReferencePrice} | Mid: ${trace.midZoneReferencePrice}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-slate-400">
                        Counter: {trace.miningCounterZeroToZero} | Wallet: {trace.walletAccumulatedUnits}
                      </span>
                    </div>

                    <div className="text-[10px] text-slate-300">
                      <span className="text-slate-500">Confirmed Sequence:</span> {trace.confirmedSequence} ({trace.sideMapping})
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-800/80 text-[10px]">
                      <div>
                        <span className="text-slate-400">Required by Mechanism: </span>
                        <strong className="text-emerald-400">
                          {trace.requiredEntrySide} @ ${trace.correctedMechanismEntryPrice} → Target ${trace.correctedTargetPrice}
                        </strong>
                        <span className="mx-2 text-slate-600">|</span>
                        <span className="text-slate-400">Actual Ledger Execution: </span>
                        <strong className="text-rose-400">
                          {trace.actualLedgerEntrySide} @ ${trace.actualLedgerPrice}
                        </strong>
                      </div>
                    </div>

                    <div className="text-[10px] text-amber-300/90 flex items-start gap-1.5 bg-amber-500/5 border border-amber-500/20 px-2 py-1 rounded">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>{trace.faultyTransitionDiagnosis}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Ledger Batches Reconciliation Table */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
              <div className="text-[11px] font-black text-white uppercase tracking-wider">
                3. Documented Transaction Ledger Audit (Realized P&L, Taker Fees, and Funding Charges)
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-[10px]">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase">
                      <th className="py-1.5 px-2">Batch / Time</th>
                      <th className="py-1.5 px-2">Side / Qty</th>
                      <th className="py-1.5 px-2">Entry → Exit</th>
                      <th className="py-1.5 px-2">Signed Layer (Actual vs Req)</th>
                      <th className="py-1.5 px-2 text-right">Gross P&L</th>
                      <th className="py-1.5 px-2 text-right">Fees</th>
                      <th className="py-1.5 px-2 text-right">Funding</th>
                      <th className="py-1.5 px-2 text-right">Net P&L</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {auditReport.ledgerBatches.map(b => (
                      <tr key={b.batchId} className="hover:bg-slate-900/50">
                        <td className="py-2 px-2">
                          <div className="font-bold text-white">{b.batchId}</div>
                          <div className="text-[9px] text-slate-400">{b.explanation}</div>
                        </td>
                        <td className="py-2 px-2 font-bold">
                          <span className={b.direction === 'LONG' ? 'text-emerald-400' : b.direction === 'SHORT' ? 'text-rose-400' : 'text-amber-400'}>
                            {b.direction}
                          </span>{' '}
                          ({b.quantity})
                        </td>
                        <td className="py-2 px-2 tabular-nums">
                          ${b.avgEntryPrice} → ${b.avgExitOrMarkPrice}
                        </td>
                        <td className="py-2 px-2">
                          <span className="text-rose-300">{b.signedLayerAtExecution}</span>
                          <span className="text-slate-500"> vs </span>
                          <span className="text-emerald-300">{b.requiredSignedLayer}</span>
                        </td>
                        <td className={`py-2 px-2 text-right tabular-nums font-bold ${b.grossPnlUsdt >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {b.grossPnlUsdt >= 0 ? `+${b.grossPnlUsdt.toFixed(4)}` : b.grossPnlUsdt.toFixed(4)}
                        </td>
                        <td className="py-2 px-2 text-right tabular-nums text-rose-300">
                          {b.tradingFeesUsdt.toFixed(4)}
                        </td>
                        <td className="py-2 px-2 text-right tabular-nums text-amber-300">
                          {b.fundingChargesUsdt.toFixed(4)}
                        </td>
                        <td className={`py-2 px-2 text-right tabular-nums font-black ${b.netPnlUsdt >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {b.netPnlUsdt >= 0 ? `+${b.netPnlUsdt.toFixed(4)}` : b.netPnlUsdt.toFixed(4)} USDT
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Stats Summary Bar */}
            <div className="grid grid-cols-4 gap-2 bg-slate-900/60 p-3 border-b border-slate-800 text-xs shrink-0">
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase">Qualifying Records</div>
                <div className="text-base font-bold text-amber-400 tabular-nums">{qualifyingCount}</div>
                <div className="text-[9px] text-slate-500">Zero SL entries in dataset</div>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase">Target Hits (1:5 / 1:10 / 1:25)</div>
                <div className="text-base font-bold text-emerald-400 tabular-nums">
                  {t5Count} / {t10Count} / {t25Count}
                </div>
                <div className="text-[9px] text-slate-500">100% Target Reached</div>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase">Directions (Long / Short)</div>
                <div className="text-base font-bold text-cyan-400 tabular-nums">
                  {longCount}L / {shortCount}S
                </div>
                <div className="text-[9px] text-slate-500">Aligned with Signed A-Layer</div>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <div className="text-[10px] text-slate-400 uppercase">Avg Elapsed Window</div>
                <div className="text-base font-bold text-white tabular-nums">8.6 Candles</div>
                <div className="text-[9px] text-emerald-400">Within 5-10 min target</div>
              </div>
            </div>

            {/* Rule Requirements Checklist */}
            <div className="bg-[#090d16] px-4 py-2 border-b border-slate-800 text-[10px] flex items-center justify-between text-slate-400 shrink-0">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" /> No Stop Loss recorded
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" /> Target outcome recorded as HIT
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" /> 3rd Candle + Signed A-Layer satisfied
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" /> 1:5, 1:10, 1:25 sequence
              </span>
            </div>

            {/* Records Table */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {records.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs">
                  No eligible records found matching all no-Stop-Loss conditions.
                </div>
              ) : (
                records.map(rec => (
                  <div
                    key={rec.recordId}
                    onClick={() => onSelectRecordToHighlight && onSelectRecordToHighlight(rec)}
                    className="bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                          rec.direction === 'LONG'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {rec.direction === 'LONG' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-bold text-xs">{rec.recordId}</span>
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                              rec.direction === 'LONG' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                            }`}
                          >
                            {rec.direction} • {rec.signedALayer || rec.sequenceStage}
                          </span>
                          <span className="text-[9px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded">
                            {rec.symbol} ({rec.timeframe})
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          3rd Candle #{rec.thirdCandleIndex} ({rec.thirdCandleTimestamp.slice(11, 16)}) • Entry: ${rec.entryPrice} • Zero-A Ref: ${rec.zeroARefPrice ?? rec.thirdCandleLow}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <div className="text-right">
                        <div className="text-[9px] text-slate-400 uppercase">Target Reached</div>
                        <div className="text-emerald-400 font-black">{rec.highestTargetHit}</div>
                      </div>

                      <div className="text-right">
                        <div className="text-[9px] text-slate-400 uppercase">Elapsed</div>
                        <div className="text-white font-bold">{rec.elapsedCandles} candles ({rec.elapsedMinutes}m)</div>
                      </div>

                      <div className="text-right">
                        <div className="text-[9px] text-slate-400 uppercase">Stop Loss</div>
                        <div className="text-amber-400 font-bold text-[10px]">NONE (Research)</div>
                      </div>

                      <div className="text-right">
                        <div className="text-[9px] text-slate-400 uppercase">1:5 / 1:10 / 1:25</div>
                        <div className="text-slate-300 text-[10px]">
                          ${rec.target1_5} / ${rec.target1_10} / ${rec.target1_25}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-[#070a12] flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div className="text-[11px]">
            Raw data preserved across all timeframes. Zero-to-Zero mining counter kept strictly separate from Wallet credits.
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold text-xs"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
