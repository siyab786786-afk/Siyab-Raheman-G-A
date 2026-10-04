import React, { useState } from 'react';
import { Database, TrendingUp, Clock, CheckCircle2, Layers, ShieldCheck, RefreshCw, FileDown } from 'lucide-react';
import { CountFirstCycleEngine } from '../services/CountFirstCycleEngine';
import { AssetSymbol } from '../types/terminal';

interface Props {
  activeAsset?: AssetSymbol;
}

export const CountFirstCycleDashboard: React.FC<Props> = ({
  activeAsset = 'BTC/USDT'
}) => {
  const engine = CountFirstCycleEngine.getInstance();
  const [activeTab, setActiveTab] = useState<'CYCLES' | 'RR_COMPLETION' | 'DAILY_COUNTS'>('CYCLES');
  const cycles = engine.getCycles();
  const rrCompletions = engine.getRrCompletions();
  const dailyCount = engine.getDailyCount();

  const handleDownloadCsv = (tableName: 'raw_data' | 'cycles' | 'daily_counts' | 'rr_completion') => {
    const csvStr = engine.exportTableCsv(tableName);
    const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `srbmpr_${tableName}_table.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-gradient-to-b from-zinc-950 via-black to-zinc-950 border-2 border-emerald-500/50 rounded-3xl p-6 sm:p-8 shadow-[0_0_80px_rgba(16,185,129,0.15)] font-mono text-xs space-y-6">
      
      {/* Header */}
      <div className="border-b border-zinc-800 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Database className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
              SRBMPR EXACT DATABASE SCHEMA + COUNT-FIRST ENGINE
            </h2>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Strict Schema Enforced • raw_data → cycles → daily_counts → rr_completion (Status = COMPLETE only)
            </p>
          </div>
        </div>

        {/* CSV Export Bar */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleDownloadCsv('cycles')}
            className="px-3 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-xl font-black text-[11px] flex items-center gap-1.5"
          >
            <FileDown className="w-4 h-4" /> cycles.csv
          </button>
          <button
            onClick={() => handleDownloadCsv('rr_completion')}
            className="px-3 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-xl font-black text-[11px] flex items-center gap-1.5"
          >
            <FileDown className="w-4 h-4" /> rr_completion.csv
          </button>
          <button
            onClick={() => handleDownloadCsv('daily_counts')}
            className="px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-xl font-black text-[11px] flex items-center gap-1.5"
          >
            <FileDown className="w-4 h-4" /> daily_counts.csv
          </button>
        </div>
      </div>

      {/* Daily Count Summary Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-black border border-zinc-800 p-4 rounded-2xl space-y-1">
          <span className="text-[10px] text-zinc-500 font-bold uppercase">Micro Complete / Incomplete</span>
          <div className="text-xl font-black text-emerald-400">{dailyCount.micro_complete_cycles} / {dailyCount.micro_incomplete_cycles}</div>
          <span className="text-[9px] text-zinc-600 font-bold">Layer: MICRO</span>
        </div>

        <div className="bg-black border border-zinc-800 p-4 rounded-2xl space-y-1">
          <span className="text-[10px] text-zinc-500 font-bold uppercase">1S Complete / Incomplete</span>
          <div className="text-xl font-black text-cyan-400">{dailyCount.second_complete_cycles} / {dailyCount.second_incomplete_cycles}</div>
          <span className="text-[9px] text-zinc-600 font-bold">Layer: 1S</span>
        </div>

        <div className="bg-black border border-zinc-800 p-4 rounded-2xl space-y-1">
          <span className="text-[10px] text-zinc-500 font-bold uppercase">1M Complete / Incomplete</span>
          <div className="text-xl font-black text-amber-400">{dailyCount.minute_complete_cycles} / {dailyCount.minute_incomplete_cycles}</div>
          <span className="text-[9px] text-zinc-600 font-bold">Layer: 1M (Max Res)</span>
        </div>

        <div className="bg-black border border-zinc-800 p-4 rounded-2xl space-y-1">
          <span className="text-[10px] text-zinc-500 font-bold uppercase">Data Gap Count</span>
          <div className="text-xl font-black text-rose-400">{dailyCount.data_gap_count}</div>
          <span className="text-[9px] text-zinc-600 font-bold">Unverifiable Order Filtered</span>
        </div>
      </div>

      {/* Table Switcher Tabs */}
      <div className="flex items-center gap-2 bg-zinc-900 p-1.5 rounded-2xl border border-zinc-800 max-w-fit">
        <button
          onClick={() => setActiveTab('CYCLES')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
            activeTab === 'CYCLES' ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'text-zinc-400 hover:text-white'
          }`}
        >
          TABLE: cycles ({cycles.length})
        </button>
        <button
          onClick={() => setActiveTab('RR_COMPLETION')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all ${
            activeTab === 'RR_COMPLETION' ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]' : 'text-zinc-400 hover:text-white'
          }`}
        >
          TABLE: rr_completion ({rrCompletions.length})
        </button>
      </div>

      {/* Table View */}
      {activeTab === 'CYCLES' && (
        <div className="bg-black border border-zinc-800 rounded-2xl overflow-hidden space-y-3">
          <div className="p-4 bg-zinc-950 border-b border-zinc-800 text-xs font-black text-zinc-300 uppercase tracking-wider flex items-center justify-between">
            <span>Primary Cycles Table (HIGH → LOW → HIGH)</span>
            <span className="text-[10px] text-emerald-400 font-bold">UTC Timestamps Enforced</span>
          </div>

          <div className="overflow-x-auto p-4">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-900 bg-zinc-950/50 text-zinc-500 text-[10px] uppercase font-black">
                  <th className="py-3 px-3">CYCLE ID</th>
                  <th className="py-3 px-3">LAYER</th>
                  <th className="py-3 px-3">HIGH 1 TIME / PRICE</th>
                  <th className="py-3 px-3">LOW TIME / PRICE</th>
                  <th className="py-3 px-3">HIGH 2 TIME / PRICE</th>
                  <th className="py-3 px-3 text-center">DURATION (s)</th>
                  <th className="py-3 px-3 text-right">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900 text-[11px]">
                {cycles.map(c => (
                  <tr key={c.cycle_id} className="hover:bg-zinc-950 transition-colors">
                    <td className="py-3 px-3 font-mono text-white font-bold">{c.cycle_id}</td>
                    <td className="py-3 px-3 font-mono text-cyan-400 font-bold">{c.layer}</td>
                    <td className="py-3 px-3 font-mono text-zinc-300">{c.high_1_time} <span className="text-zinc-500">(${c.high_1_price})</span></td>
                    <td className="py-3 px-3 font-mono text-rose-400">{c.low_time} <span className="text-zinc-500">(${c.low_price})</span></td>
                    <td className="py-3 px-3 font-mono text-emerald-400">{c.high_2_time ? `${c.high_2_time} ($${c.high_2_price})` : 'MISSING'}</td>
                    <td className="py-3 px-3 font-mono text-center text-zinc-300">{c.duration_seconds}s</td>
                    <td className="py-3 px-3 text-right">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase ${
                        c.status === 'COMPLETE' 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                      }`}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'RR_COMPLETION' && (
        <div className="bg-black border border-zinc-800 rounded-2xl overflow-hidden space-y-3">
          <div className="p-4 bg-zinc-950 border-b border-zinc-800 text-xs font-black text-zinc-300 uppercase tracking-wider flex items-center justify-between">
            <span>RR & Completion Table (Eligible ONLY for status = COMPLETE)</span>
            <span className="text-[10px] text-cyan-400 font-bold">FK → cycles.cycle_id</span>
          </div>

          <div className="overflow-x-auto p-4">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-900 bg-zinc-950/50 text-zinc-500 text-[10px] uppercase font-black">
                  <th className="py-3 px-3">CYCLE ID</th>
                  <th className="py-3 px-3">ENTRY / SL / TARGET</th>
                  <th className="py-3 px-3 text-center">RR 1:1</th>
                  <th className="py-3 px-3 text-center">RR 1:2</th>
                  <th className="py-3 px-3 text-center">RR 1:3</th>
                  <th className="py-3 px-3 text-center">COMPL. SEC</th>
                  <th className="py-3 px-3 text-right">STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900 text-[11px]">
                {rrCompletions.map(r => (
                  <tr key={r.cycle_id} className="hover:bg-zinc-950 transition-colors">
                    <td className="py-3 px-3 font-mono text-white font-bold">{r.cycle_id}</td>
                    <td className="py-3 px-3 font-mono text-zinc-300">
                      E: ${r.entry_reference} | SL: ${r.sl_reference} | TP: ${r.target_reference}
                    </td>
                    <td className="py-3 px-3 font-mono text-center font-bold text-emerald-400">{r.rr_1_1_status}</td>
                    <td className="py-3 px-3 font-mono text-center font-bold text-cyan-400">{r.rr_1_2_status}</td>
                    <td className="py-3 px-3 font-mono text-center font-bold text-zinc-400">{r.rr_1_3_status}</td>
                    <td className="py-3 px-3 font-mono text-center text-zinc-300">{r.completion_seconds}s</td>
                    <td className="py-3 px-3 text-right">
                      <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                        {r.status}
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
