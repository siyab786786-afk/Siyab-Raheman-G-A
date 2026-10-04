import React, { useState } from 'react';
import { Database, TrendingUp, Clock, CheckCircle2, Layers, ShieldCheck, RefreshCw } from 'lucide-react';
import { FinalCycleCountEngine, CycleCountRecord } from '../services/FinalCycleCountEngine';
import { AssetSymbol } from '../types/terminal';

interface Props {
  activeAsset?: AssetSymbol;
}

export const FinalCycleCountDashboard: React.FC<Props> = ({
  activeAsset = 'BTC/USDT'
}) => {
  const engine = FinalCycleCountEngine.getInstance();
  const [stats, setStats] = useState(() => engine.getAggregatedStats());
  const [filterDate, setFilterDate] = useState<string>('ALL');

  const handleSimulateNewCount = () => {
    const now = new Date();
    engine.addRecord({
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().split(' ')[0],
      microCycleCount: Math.floor(4 + Math.random() * 4),
      oneSecCycleCount: Math.floor(2 + Math.random() * 3),
      oneMinCycleCount: Math.floor(1 + Math.random() * 2),
      rr: `1:${(2 + Math.random() * 2.5).toFixed(1)}`,
      completionSecond: Math.floor(10 + Math.random() * 45)
    });
    setStats(engine.getAggregatedStats());
  };

  const filteredRecords = filterDate === 'ALL' 
    ? stats.records 
    : stats.records.filter(r => r.date === filterDate);

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
              SRBMPR FINAL CYCLE COUNT STRUCTURE (HIGH → LOW → HIGH)
            </h2>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Granular Resolutions Only: MICRO → 1 SECOND → 1 MINUTE (Maximum Time Resolution = 1 Minute)
            </p>
          </div>
        </div>

        <button
          onClick={handleSimulateNewCount}
          className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-xl text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all shrink-0"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Record Live Cycle Count</span>
        </button>
      </div>

      {/* Aggregated Counts Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-black border border-zinc-800 p-4 rounded-2xl space-y-1">
          <span className="text-[10px] text-zinc-500 font-bold uppercase">Total Micro Cycles</span>
          <div className="text-2xl font-black text-emerald-400">{stats.totalMicroCycles.toLocaleString()}</div>
          <span className="text-[9px] text-zinc-600 font-bold">Granular Origin Resolution</span>
        </div>

        <div className="bg-black border border-zinc-800 p-4 rounded-2xl space-y-1">
          <span className="text-[10px] text-zinc-500 font-bold uppercase">Total 1S Cycles</span>
          <div className="text-2xl font-black text-cyan-400">{stats.totalOneSecCycles.toLocaleString()}</div>
          <span className="text-[9px] text-zinc-600 font-bold">1-Second Resolution</span>
        </div>

        <div className="bg-black border border-zinc-800 p-4 rounded-2xl space-y-1">
          <span className="text-[10px] text-zinc-500 font-bold uppercase">Total 1M Cycles (Max Res)</span>
          <div className="text-2xl font-black text-amber-400">{stats.totalOneMinCycles.toLocaleString()}</div>
          <span className="text-[9px] text-zinc-600 font-bold">1-Minute Resolution (Max)</span>
        </div>

        <div className="bg-black border border-zinc-800 p-4 rounded-2xl space-y-1">
          <span className="text-[10px] text-zinc-500 font-bold uppercase">Est. Annualized Cycles</span>
          <div className="text-2xl font-black text-white">{stats.cyclesPerYearEstimated.toLocaleString()}</div>
          <span className="text-[9px] text-zinc-600 font-bold">Day → Month → Year → Total</span>
        </div>
      </div>

      {/* Database Table Structure: DATE | TIME | MICRO CYCLE COUNT | 1S CYCLE COUNT | 1M CYCLE COUNT | RR | COMPLETION SECOND */}
      <div className="bg-black border border-zinc-800 rounded-2xl overflow-hidden space-y-3">
        <div className="p-4 bg-zinc-950 border-b border-zinc-800 text-xs font-black text-zinc-300 uppercase tracking-wider flex items-center justify-between">
          <span>SRBMPR Cycle Count Database Registry</span>
          <span className="text-[10px] text-emerald-400 font-bold">Structure: HIGH → LOW → HIGH</span>
        </div>

        <div className="overflow-x-auto p-4">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-900 bg-zinc-950/50 text-zinc-500 text-[10px] uppercase font-black">
                <th className="py-3 px-3">DATE</th>
                <th className="py-3 px-3">TIME</th>
                <th className="py-3 px-3 text-center">MICRO CYCLE COUNT</th>
                <th className="py-3 px-3 text-center">1S CYCLE COUNT</th>
                <th className="py-3 px-3 text-center">1M CYCLE COUNT</th>
                <th className="py-3 px-3 text-center">RR</th>
                <th className="py-3 px-3 text-right">COMPLETION SECOND</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900 text-[11px]">
              {filteredRecords.map(rec => (
                <tr key={rec.id} className="hover:bg-zinc-950 transition-colors">
                  <td className="py-3 px-3 font-mono text-white font-bold">{rec.date}</td>
                  <td className="py-3 px-3 font-mono text-zinc-400">{rec.time}</td>
                  <td className="py-3 px-3 font-mono text-center font-black text-emerald-400">{rec.microCycleCount}</td>
                  <td className="py-3 px-3 font-mono text-center font-black text-cyan-400">{rec.oneSecCycleCount}</td>
                  <td className="py-3 px-3 font-mono text-center font-black text-amber-400">{rec.oneMinCycleCount}</td>
                  <td className="py-3 px-3 font-mono text-center font-bold text-white">{rec.rr}</td>
                  <td className="py-3 px-3 font-mono text-right font-bold text-zinc-300">{rec.completionSecond}s</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
