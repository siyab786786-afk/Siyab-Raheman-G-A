import React from 'react';
import { Network, GitBranch, Search, Filter } from 'lucide-react';

// Behavioral Classification Data
const SEQ_LEDGER = [
  { id: 'SEQ-001', asset: 'BTC/USD', tf: '1h', sequence: '1→2→3', length: 3, origin: 'LEFT', dest: 'LEFT', trans: 'LEFT→LEFT', family: 'FAM-A', reversal: 'First Occurrence', status: 'VALIDATED' },
  { id: 'SEQ-002', asset: 'BTC/USD', tf: '1h', sequence: '3→2→1', length: 3, origin: 'RIGHT', dest: 'RIGHT', trans: 'RIGHT→RIGHT', family: 'FAM-A', reversal: 'Directional Transformation', status: 'VALIDATED' },
  { id: 'SEQ-003', asset: 'ETH/USD', tf: '4h', sequence: '1→2→3→3→2→1', length: 6, origin: 'LEFT', dest: 'RIGHT', trans: 'LEFT→RIGHT', family: 'FAM-B', reversal: 'Same Structural Family', status: 'UNDER REVIEW' },
  { id: 'SEQ-004', asset: 'BTC/USD', tf: '15m', sequence: '2→1→2', length: 3, origin: 'RIGHT', dest: 'LEFT', trans: 'RIGHT→LEFT', family: 'FAM-C', reversal: 'Unrelated', status: 'VALIDATED' },
  { id: 'SEQ-005', asset: 'SPX', tf: '1D', sequence: '1→2→3', length: 3, origin: 'LEFT', dest: 'LEFT', trans: 'LEFT→LEFT', family: 'FAM-A', reversal: 'Same Structural Family', status: 'VALIDATED' },
  { id: 'SEQ-006', asset: 'NASDAQ', tf: '1h', sequence: '1→3→2', length: 3, origin: 'LEFT', dest: 'RIGHT', trans: 'LEFT→RIGHT', family: 'FAM-D', reversal: 'Unrelated', status: 'UNCLASSIFIED' },
];

export const SrbmprBehavioralLaboratory: React.FC = () => {
  return (
    <div className="mt-8 p-8 rounded-[40px] bg-zinc-950 border border-indigo-500/20 shadow-2xl">
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-6">
            <h2 className="text-4xl font-black text-white uppercase tracking-[0.3em] flex items-center gap-4 italic leading-none">
              <Network className="text-indigo-500 w-10 h-10" /> SRBMPR
            </h2>
            <div className="flex flex-col">
              <span className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.3em]">Behavioral Research Laboratory</span>
              <span className="text-[9px] text-indigo-400 font-black uppercase tracking-widest mt-0.5 italic">Market Psychology Sequence Classification</span>
            </div>
          </div>
          <button className="px-4 py-2 bg-indigo-900/50 border border-indigo-500/50 rounded-xl text-[10px] font-black text-white uppercase flex items-center gap-2">
            <Search className="w-3 h-3" /> Search Sequences
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Seq', value: '6' },
            { label: 'Families', value: '4' },
            { label: 'Left', value: '4' },
            { label: 'Right', value: '2' },
          ].map((stat, i) => (
            <div key={i} className="bg-black/40 p-4 rounded-2xl border border-white/5">
              <div className="text-[9px] text-zinc-500 font-black uppercase">{stat.label}</div>
              <div className="text-lg font-black text-white">{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto bg-black/20 rounded-3xl border border-white/5">
          <table className="w-full text-left text-[10px] uppercase font-black text-zinc-400">
            <thead className="border-b border-white/5">
              <tr>
                <th className="p-4">Seq ID</th>
                <th className="p-4">Asset</th>
                <th className="p-4">Sequence</th>
                <th className="p-4">Transition</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="text-zinc-200">
              {SEQ_LEDGER.map((row) => (
                <tr key={row.id} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                  <td className="p-4 font-mono text-indigo-400">{row.id}</td>
                  <td className="p-4">{row.asset}</td>
                  <td className="p-4 font-mono">{row.sequence}</td>
                  <td className="p-4">{row.trans}</td>
                  <td className={`p-4 ${row.status === 'VALIDATED' ? 'text-emerald-500' : 'text-amber-500'}`}>{row.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
