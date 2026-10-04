import React, { useState } from 'react';
import { DailyBrokerAuditSummary, DailyAuditReportRecord } from '../types/terminal';
import { 
  FileText, Download, ShieldCheck, CheckCircle2, AlertCircle, 
  Clock, Lock, Layers, Zap, ExternalLink, Printer, Building2, UserCheck
} from 'lucide-react';

interface DailyBrokerAuditReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  auditSummary: DailyBrokerAuditSummary;
}

export const DailyBrokerAuditReportModal: React.FC<DailyBrokerAuditReportModalProps> = ({
  isOpen,
  onClose,
  auditSummary
}) => {
  const [selectedRecord, setSelectedRecord] = useState<DailyAuditReportRecord | null>(
    auditSummary.records.length > 0 ? auditSummary.records[0] : null
  );

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col max-h-[95vh] text-zinc-200">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800 bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-white font-mono uppercase tracking-wider">
                  24-HOUR SRBMPR BROKER AUDIT & GROWTH REPORT
                </h3>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-[9px] font-black font-mono text-emerald-300">
                  OFFICIAL PUBLICATION
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-mono">
                {auditSummary.exchange} NATIVE FEED ONLY • {auditSummary.asset} • UTC DATE: {auditSummary.reportDate}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-xl font-mono text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <Printer className="w-3.5 h-3.5 text-zinc-400" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl font-mono text-xs font-bold transition-all"
            >
              ✕ Close
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs font-mono">
          
          {/* Institutional Header Banner for Broker Growth Publication */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-zinc-900/90 via-zinc-900/50 to-zinc-950 border border-zinc-800 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
              <div>
                <span className="text-[9px] text-amber-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" /> BROKER VERIFICATION & PUBLICATION CERTIFICATE
                </span>
                <h2 className="text-lg font-black text-white uppercase tracking-tight mt-1">
                  SRBMPR Quantitative Structural Nodes Verification
                </h2>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-[9px] text-zinc-500 uppercase block font-bold">Data Feed Integrity</span>
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> STRICT {auditSummary.exchange} NATIVE (NO MIXING)
                </span>
              </div>
            </div>

            {/* Researchers Attribution */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-950 border border-zinc-800/80">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-black">
                  SR
                </div>
                <div>
                  <div className="text-[10px] text-zinc-400 uppercase">Research Lead & Founder</div>
                  <div className="text-sm font-black text-white">{auditSummary.researcherLead}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-950 border border-zinc-800/80">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-black">
                  RR
                </div>
                <div>
                  <div className="text-[10px] text-zinc-400 uppercase">Time Zone & Structural Continuum Researcher</div>
                  <div className="text-sm font-black text-white">{auditSummary.timeZoneResearcher}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Audit Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800">
              <div className="text-[10px] text-zinc-500 uppercase">Total Nodes Detected</div>
              <div className="text-xl font-black text-white mt-1">{auditSummary.totalLimitNodes}</div>
              <div className="text-[9px] text-zinc-500 mt-1">24-Hour Continuum Window</div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800">
              <div className="text-[10px] text-emerald-400 uppercase">Valid High-Conviction Limit Trades</div>
              <div className="text-xl font-black text-emerald-400 mt-1">{auditSummary.validLimitTrades} Nodes</div>
              <div className="text-[9px] text-zinc-500 mt-1">0.10% SL Protected Only</div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800">
              <div className="text-[10px] text-amber-400 uppercase">Waiting Zone Noise Filter</div>
              <div className="text-xs font-bold text-amber-300 mt-1 leading-tight">
                {auditSummary.waitingZoneFilterRatio}
              </div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-900/40 border border-zinc-800">
              <div className="text-[10px] text-blue-400 uppercase">Order Execution Policy</div>
              <div className="text-sm font-black text-white mt-1">LIMIT ORDER ONLY</div>
              <div className="text-[9px] text-emerald-400 mt-1 font-bold">Zero Market Slip • Perfect Seat</div>
            </div>
          </div>

          {/* Explanatory Multi-Timezone Architecture Rule Box */}
          <div className="p-5 rounded-2xl bg-blue-950/20 border border-blue-500/20 space-y-2">
            <div className="flex items-center gap-2 text-blue-400 font-bold text-xs uppercase">
              <Layers className="w-4 h-4 text-blue-400" />
              <span>Multi-Timezone Structural Continuum Connection Mechanism</span>
            </div>
            <p className="text-[11px] text-zinc-300 leading-relaxed">
              Every SRBMPR limit entry is anchored to higher timeframe structural floors:
              <strong> 1-Minute highs are anchored on 5-Minute Higher-Lows</strong>; 
              <strong> 5-Minute momentum breaks are supported by 15-Minute parent corrections</strong>; 
              and <strong>15-Minute intermediate cycles align with the 1-Hour macro flow</strong>. 
              Our 0.10% structural stop loss sits strictly behind this multi-timeframe connection. If the connection holds, price expansion toward 1:5, 1:10, and 1:15 is validated with mathematical precision.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-2">
              {auditSummary.timeframesAudited.map((tf, i) => (
                <span key={i} className="px-2.5 py-1 rounded bg-blue-500/10 border border-blue-500/30 text-[9px] font-bold text-blue-300">
                  ✓ {tf}
                </span>
              ))}
            </div>
          </div>

          {/* Audited Trade Records Table */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>24-Hour Verified Limit Node Entries (Chronological Audit)</span>
              </h4>
              <span className="text-[10px] text-zinc-500">
                Click any row to inspect proof rationale
              </span>
            </div>

            <div className="overflow-x-auto border border-zinc-800 rounded-2xl">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900/80 text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                    <th className="p-3">Node ID / UTC</th>
                    <th className="p-3">Order Type</th>
                    <th className="p-3">Limit Entry</th>
                    <th className="p-3">0.10% Hard SL</th>
                    <th className="p-3">Target Price</th>
                    <th className="p-3">Horizon</th>
                    <th className="p-3">Timeframe Anchor</th>
                    <th className="p-3 text-right">Audit Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900 text-[11px]">
                  {auditSummary.records.map((rec) => {
                    const isSelected = selectedRecord?.id === rec.id;
                    return (
                      <tr 
                        key={rec.id}
                        onClick={() => setSelectedRecord(rec)}
                        className={`cursor-pointer transition-all hover:bg-zinc-900/60 ${
                          isSelected ? 'bg-amber-500/10 border-l-2 border-l-amber-500' : ''
                        }`}
                      >
                        <td className="p-3 font-bold text-white whitespace-nowrap">
                          <div>{rec.id}</div>
                          <div className="text-[9px] text-zinc-500">{rec.timestampUtc}</div>
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <span className="px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/30 text-[9px] text-blue-400 font-bold">
                            LIMIT_ORDER
                          </span>
                        </td>
                        <td className="p-3 font-bold text-white tabular-nums whitespace-nowrap">
                          ${rec.limitEntry.toLocaleString()}
                        </td>
                        <td className="p-3 text-rose-400 font-bold tabular-nums whitespace-nowrap">
                          ${rec.structuralSL.toLocaleString()}
                          <div className="text-[8px] text-zinc-500">±${rec.slDistance} (0.10%)</div>
                        </td>
                        <td className="p-3 text-emerald-400 font-bold tabular-nums whitespace-nowrap">
                          ${rec.targetPrice.toLocaleString()}
                        </td>
                        <td className="p-3 font-black text-amber-400 whitespace-nowrap">
                          {rec.horizon}
                        </td>
                        <td className="p-3 text-zinc-300 max-w-xs truncate">
                          {rec.timeframeConnection}
                        </td>
                        <td className="p-3 text-right whitespace-nowrap">
                          <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                            {rec.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Detailed Proof Rationale for Selected Record */}
          {selectedRecord && (
            <div className="p-5 rounded-2xl bg-zinc-900/70 border border-amber-500/30 space-y-3">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Proof Verification Breakdown for {selectedRecord.id}</span>
                </span>
                <span className="text-[10px] text-zinc-400 font-mono">
                  Horizon: {selectedRecord.horizon} • SL Space: ${selectedRecord.slDistance} (0.10%)
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="text-[10px] text-zinc-500 uppercase font-bold">Multi-Timezone Anchor Connection:</div>
                  <div className="text-white font-bold mt-1 text-[11px] leading-relaxed">
                    {selectedRecord.timeframeConnection}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-zinc-500 uppercase font-bold">Waiting Zone Filtering Decision:</div>
                  <div className="text-emerald-400 font-bold mt-1 text-[11px]">
                    Status: {selectedRecord.waitingZoneStatus} (Noise eliminated)
                  </div>
                </div>
              </div>

              <div>
                <div className="text-[10px] text-zinc-500 uppercase font-bold">Deterministic Mathematical Rationale:</div>
                <p className="text-[11px] text-zinc-300 leading-relaxed mt-1 bg-black/40 p-3 rounded-xl border border-zinc-800">
                  {selectedRecord.proofRationale}
                </p>
              </div>
            </div>
          )}

          {/* Broker Growth & Independence Notice */}
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-500 text-[10px] leading-relaxed">
            <strong className="text-zinc-400">Broker Growth Notice:</strong> This audit report is generated strictly from {auditSummary.exchange} native market data. Binance or other broker feeds operate under separate and independent state machines and are never mixed. All entries reflect pre-scheduled limit orders only. For questions or independent verification, visit the official SRBMPR verification portal.
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/40 flex items-center justify-between text-xs font-mono">
          <div className="text-[10px] text-zinc-500">
            Validated by SRBMPR Autonomous Engine • Lead: Siyab Raheman • Time Zone: Raziya Raheman
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-xl uppercase transition-all"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
