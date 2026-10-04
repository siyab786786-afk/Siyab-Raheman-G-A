import React, { useState } from 'react';
import { BrokerFootprintRecord, CrossPlatformFootprintMatch } from '../types/terminal';
import { SRBMPRMechanismEngine } from '../services/SRBMPRMechanismEngine';
import { 
  Layers, GitCompare, Database, CheckCircle2, XCircle, 
  AlertTriangle, Hash, Clock, FileText, ArrowRight, ShieldCheck, Filter
} from 'lucide-react';

interface BrokerFootprintWorkspaceProps {
  asset?: string;
}

export const BrokerFootprintWorkspace: React.FC<BrokerFootprintWorkspaceProps> = ({
  asset = 'BTC/USDT'
}) => {
  const engine = SRBMPRMechanismEngine.getInstance();
  const [footprints] = useState<BrokerFootprintRecord[]>(engine.getBrokerFootprintRecords(asset));
  const [crossMatches] = useState<CrossPlatformFootprintMatch[]>(engine.getCrossPlatformMatches(asset));
  const [activeTab, setActiveTab] = useState<'FOOTPRINTS' | 'CROSS_MATCH' | 'METHODOLOGY'>('FOOTPRINTS');
  const [selectedDirection, setSelectedDirection] = useState<'ALL' | 'BUY' | 'GIRL_SELL'>('ALL');

  const filteredFootprints = footprints.filter(fp => {
    if (selectedDirection === 'ALL') return true;
    return fp.direction === selectedDirection;
  });

  return (
    <div className="mt-8 p-6 sm:p-8 rounded-[40px] bg-gradient-to-br from-zinc-950 via-[#0a0c10] to-black border border-indigo-500/20 shadow-2xl relative overflow-hidden font-mono">
      <div className="relative z-10 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Layers className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider italic">
                  SRBMPR BROKER FOOTPRINT EXTRACTION
                </h2>
                <span className="px-2.5 py-0.5 rounded bg-indigo-500/20 border border-indigo-500/40 text-[9px] font-black text-indigo-300">
                  METHODOLOGY V1.0
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-1 uppercase tracking-widest">
                Raw OHLC Intake • Buy/Girl Sequence Depth • Same-Day Cross-Platform Matching • Zero Forced Data
              </p>
            </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center gap-2 bg-black/60 p-1.5 rounded-2xl border border-white/5">
            <button
              onClick={() => setActiveTab('FOOTPRINTS')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all flex items-center gap-1.5 ${
                activeTab === 'FOOTPRINTS'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Footprint Library ({footprints.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('CROSS_MATCH')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all flex items-center gap-1.5 ${
                activeTab === 'CROSS_MATCH'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>Cross-Platform Match</span>
            </button>

            <button
              onClick={() => setActiveTab('METHODOLOGY')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all flex items-center gap-1.5 ${
                activeTab === 'METHODOLOGY'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>5-Step Protocol</span>
            </button>
          </div>
        </div>

        {/* TAB 1: FROZEN FOOTPRINT LIBRARY */}
        {activeTab === 'FOOTPRINTS' && (
          <div className="space-y-4">
            
            {/* Filter Bar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-zinc-500 font-bold uppercase">Direction Filter:</span>
                {(['ALL', 'BUY', 'GIRL_SELL'] as const).map(dir => (
                  <button
                    key={dir}
                    onClick={() => setSelectedDirection(dir)}
                    className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                      selectedDirection === dir
                        ? 'bg-white/10 text-white border border-white/20'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {dir === 'GIRL_SELL' ? 'GIRL (SELL)' : dir}
                  </button>
                ))}
              </div>
              <span className="text-[10px] text-zinc-500 uppercase">CALENDAR DATE: 2026-10-02 (UTC)</span>
            </div>

            {/* Footprints Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredFootprints.map(fp => (
                <div key={fp.footprint_id} className="bg-black/50 border border-zinc-800 rounded-2xl p-5 space-y-4 hover:border-indigo-500/30 transition-all">
                  
                  {/* Card Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-zinc-800 text-[10px] font-bold text-white uppercase">
                        {fp.source_id}
                      </span>
                      <span className="text-[10px] text-zinc-500">{fp.timeframe} • {fp.asset}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                        fp.direction === 'BUY' 
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      }`}>
                        DEPTH {fp.sequence_depth}: {fp.sequence_label}
                      </span>
                    </div>
                  </div>

                  {/* Sequence Depth Visualization */}
                  <div className="space-y-1.5">
                    <div className="text-[10px] text-zinc-400 font-bold uppercase flex items-center justify-between">
                      <span>Observed Structural Sequence</span>
                      <span className="text-indigo-400">Depth {fp.sequence_depth}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-zinc-900/60 p-2.5 rounded-xl border border-white/5 overflow-x-auto">
                      {Array.from({ length: fp.sequence_depth }).map((_, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded text-[10px] font-black ${
                            fp.direction === 'BUY' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                          }`}>
                            {fp.direction === 'BUY' ? `BUY [L${idx + 1}]` : `GIRL [L${idx + 1}]`}
                          </span>
                          {idx < fp.sequence_depth - 1 && (
                            <span className="text-zinc-600 font-black">→</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Price References & Timestamps */}
                  <div className="grid grid-cols-2 gap-2 text-[10px] bg-zinc-900/30 p-3 rounded-xl border border-white/5">
                    <div>
                      <span className="text-zinc-500 block">Start Timestamp</span>
                      <span className="text-zinc-300 font-bold">{fp.start_timestamp.replace('T', ' ').replace('Z', '')}</span>
                    </div>
                    <div>
                      <span className="text-zinc-500 block">End Timestamp</span>
                      <span className="text-zinc-300 font-bold">{fp.end_timestamp.replace('T', ' ').replace('Z', '')}</span>
                    </div>
                    <div className="mt-1">
                      <span className="text-zinc-500 block">Start / End Price</span>
                      <span className="text-white font-bold">${fp.price_reference.start_price.toLocaleString()} → ${fp.price_reference.end_price.toLocaleString()}</span>
                    </div>
                    <div className="mt-1">
                      <span className="text-zinc-500 block">High / Low Range</span>
                      <span className="text-emerald-400 font-bold">${fp.price_reference.high.toLocaleString()} / ${fp.price_reference.low.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Cryptographic SHA-256 Hash */}
                  <div className="text-[9px] text-zinc-500 flex items-center justify-between pt-2 border-t border-white/5">
                    <span className="flex items-center gap-1 text-zinc-400">
                      <Hash className="w-3 h-3 text-indigo-400" />
                      {fp.raw_file_hash.substring(0, 16)}...
                    </span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> IMMUTABLE RECORD
                    </span>
                  </div>

                </div>
              ))}
            </div>

          </div>
        )}

        {/* TAB 2: SAME-DAY CROSS-PLATFORM MATCHING */}
        {activeTab === 'CROSS_MATCH' && (
          <div className="space-y-4">
            
            <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl text-xs text-zinc-300 leading-relaxed">
              <strong className="text-white">Strict Cross-Platform Matching Rule:</strong> We do not declare platforms winners or losers. We compare identical calendar dates and timeframes. If a platform does not exhibit the required sequence depth, it is recorded as <span className="text-amber-400 font-bold">NOT_FOUND</span> or <span className="text-amber-400 font-bold">INCOMPLETE</span> without forcing alignment.
            </div>

            <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-black/40">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900/50 text-[10px] text-zinc-400 uppercase tracking-wider">
                    <th className="p-3.5">Match ID</th>
                    <th className="p-3.5">Primary Source & Depth</th>
                    <th className="p-3.5">Secondary Source & Depth</th>
                    <th className="p-3.5">Price & Time Delta</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5">Evidence Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {crossMatches.map(m => (
                    <tr key={m.match_id} className="hover:bg-white/5">
                      <td className="p-3.5 font-bold text-indigo-400">{m.match_id}</td>
                      <td className="p-3.5 text-white font-bold">{m.primary_source}</td>
                      <td className="p-3.5 text-zinc-300 font-bold">{m.secondary_source}</td>
                      <td className="p-3.5 text-zinc-400 font-mono">
                        ΔP: ${m.tolerance_delta_price.toFixed(2)} • ΔT: {m.tolerance_delta_sec}s
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                          m.status === 'MATCHED'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : m.status === 'PARTIAL_MATCH'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                            : m.status === 'BEHAVIOUR_MATCH_ONLY'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        }`}>
                          {m.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-[10px] text-zinc-400 max-w-xs">{m.evidence_notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

          </div>
        )}

        {/* TAB 3: 5-STEP PROTOCOL */}
        {activeTab === 'METHODOLOGY' && (
          <div className="space-y-4 text-xs text-zinc-300">
            
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {[
                { step: '1', title: 'Raw Data Intake', desc: 'Preserves unmodified original OHLC klines, row numbers, and SHA-256 hashes per exchange.' },
                { step: '2', title: 'Footprint Extraction', desc: 'Detects High-Low cycles and directional Buy/Girl formations within the calendar day.' },
                { step: '3', title: 'Behavioural Layers', desc: 'Classifies sequence depth: Depth 1 (BUY), Depth 2 (BUY_BUY), Depth 3 (BUY_BUY_BUY).' },
                { step: '4', title: 'Footprint Matching', desc: 'Compares cross-platform sequences using strict price (ΔP) and timestamp (ΔT) tolerances.' },
                { step: '5', title: 'Frozen Library', desc: 'Archives matched, partial, and not-found footprints in immutable cryptographic storage.' }
              ].map(s => (
                <div key={s.step} className="bg-zinc-900/60 border border-zinc-800 p-4 rounded-2xl space-y-2">
                  <div className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 font-black flex items-center justify-center text-xs">
                    {s.step}
                  </div>
                  <h4 className="text-white font-bold text-[11px] uppercase">{s.title}</h4>
                  <p className="text-[10px] text-zinc-400 leading-normal">{s.desc}</p>
                </div>
              ))}
            </div>

            <div className="p-4 bg-black/60 rounded-2xl border border-zinc-800 space-y-2 text-[11px]">
              <span className="text-white font-bold uppercase">The Core Methodology Boundary:</span>
              <p className="text-zinc-400 italic">
                "Extract first, preserve second, compare third, interpret later."
              </p>
              <p className="text-zinc-400">
                This stage contains zero P&L claims, zero trading advice, zero prediction, and zero strategy ranking. Its sole objective is capturing real behavioral market footprints across independent broker feeds with complete auditability.
              </p>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
