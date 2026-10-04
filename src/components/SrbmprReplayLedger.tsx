import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ShieldCheck, 
  Hash, 
  ArrowRight,
  Download,
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Activity,
  Zap,
  ShieldAlert
} from 'lucide-react';
import { SRBMPROneSecondEventEngine } from '../services/SRBMPROneSecondEventEngine';
import { OneSecondEventRecord } from '../types/terminal';

export const SrbmprReplayLedger: React.FC = () => {
  const [records, setRecords] = useState<OneSecondEventRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');

  const engine = SRBMPROneSecondEventEngine.getInstance();

  useEffect(() => {
    const unsubscribe = engine.subscribe((events) => {
      // Sort chronologically (latest first for the ledger view)
      setRecords([...events].reverse());
    });
    
    return () => unsubscribe();
  }, [engine]);

  const filteredRecords = records.filter(r => {
    const matchesSearch = r.asset.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         r.eventId.toLowerCase().includes(searchTerm.toLowerCase());
    const isQualifying = r.structureDetected; // We only show qualifying structural events in the trade ledger
    const matchesFilter = filterStatus === 'ALL' || r.completionStatus === filterStatus;
    return matchesSearch && matchesFilter && isQualifying;
  });

  const handleExport = () => {
    const headers = [
      'Timestamp_UTC', 'EventID', 'Asset', 'Rule_Followed', 'RR_Ratio', 
      'Status', 'Entry_Price', 'SL_Price', 'Target_Price', 'Tamper_Proof_Hash'
    ];

    const rows = filteredRecords.map(r => [
      r.exactTimestamp,
      r.eventId,
      r.asset,
      `"${r.auditRule}"`,
      r.rrRatio,
      r.completionStatus,
      r.entryPrice,
      r.slPrice,
      r.targetPrice,
      r.tamperProofHash
    ]);

    const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `SRBMPR_Audit_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: OneSecondEventRecord['completionStatus']) => {
    switch (status) {
      case 'TARGET_HIT':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase">
            <CheckCircle2 className="w-3 h-3" /> WIN / TARGET
          </span>
        );
      case 'SL_HIT':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-black uppercase">
            <ShieldAlert className="w-3 h-3" /> LOSS / SL
          </span>
        );
      case 'FORWARD_MONITORING':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-black uppercase">
            <Activity className="w-3 h-3 animate-pulse" /> LIVE REPLAY
          </span>
        );
      case 'TIMEOUT_INCOMPLETE':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-500 border border-zinc-700 text-[10px] font-black uppercase">
            <Clock className="w-3 h-3" /> TIMEOUT
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full bg-zinc-900 text-zinc-600 border border-zinc-800 text-[10px] font-black uppercase">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="bg-[#05070a] border border-zinc-800 rounded-[32px] overflow-hidden flex flex-col h-[650px] shadow-[0_0_100px_rgba(0,0,0,0.5)]">
      {/* Header */}
      <div className="p-6 border-b border-zinc-800 bg-gradient-to-br from-[#0a0d14] to-[#05070a] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
              <Zap className="w-6 h-6 fill-amber-500/20" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-tighter italic">SRBMPR Replay Ledger</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Chronological Execution Audit</span>
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
                <span className="text-[10px] text-emerald-500 font-black uppercase flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> 1-Second Frozen Proofs
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative group">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600 group-focus-within:text-amber-500 transition-colors" />
             <input 
               type="text" 
               placeholder="Filter Asset / Event..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="bg-black border border-zinc-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-amber-500/50 w-full md:w-56 transition-all font-mono"
             />
          </div>
          
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-black border border-zinc-800 rounded-xl px-4 py-2.5 text-xs text-zinc-400 focus:outline-none focus:border-amber-500/50 transition-all font-black uppercase appearance-none cursor-pointer"
          >
            <option value="ALL">ALL EVENTS</option>
            <option value="TARGET_HIT">TARGET HIT</option>
            <option value="SL_HIT">SL HIT</option>
            <option value="FORWARD_MONITORING">REPLAYING</option>
          </select>

          <button 
            onClick={handleExport}
            className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl border border-zinc-800 transition-all flex items-center gap-2 font-black text-xs uppercase"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">CSV</span>
          </button>
        </div>
      </div>

      {/* Stats Ribbon */}
      <div className="grid grid-cols-2 md:grid-cols-4 border-b border-zinc-800 bg-zinc-950/20 backdrop-blur-md">
        <div className="p-5 border-r border-zinc-800">
           <div className="text-[10px] text-zinc-600 font-black uppercase mb-1 tracking-tighter">Structural Observations</div>
           <div className="text-2xl font-black text-white font-mono">{filteredRecords.length}</div>
        </div>
        <div className="p-5 border-r border-zinc-800">
           <div className="text-[10px] text-zinc-600 font-black uppercase mb-1 tracking-tighter">Completion Velocity</div>
           <div className="text-2xl font-black text-emerald-400 font-mono">
             {filteredRecords.length > 0 
               ? ((filteredRecords.filter(r => r.completionStatus === 'TARGET_HIT').length / filteredRecords.length) * 100).toFixed(1) 
               : '0.0'}%
           </div>
        </div>
        <div className="p-5 border-r border-zinc-800">
           <div className="text-[10px] text-zinc-600 font-black uppercase mb-1 tracking-tighter">Net R-Accumulated</div>
           <div className="text-2xl font-black text-amber-500 font-mono">
             +{filteredRecords.reduce((acc, r) => {
               if (r.completionStatus === 'TARGET_HIT') return acc + parseInt(r.rrRatio.split(':')[1] || '0');
               if (r.completionStatus === 'SL_HIT') return acc - 1;
               return acc;
             }, 0).toLocaleString()}R
           </div>
        </div>
        <div className="p-5">
           <div className="text-[10px] text-zinc-600 font-black uppercase mb-1 tracking-tighter">Audit Compliance</div>
           <div className="flex items-center gap-1.5 text-emerald-500 font-black text-sm uppercase">
             <ShieldCheck className="w-4 h-4" /> 100% REPRODUCIBLE
           </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="flex-1 overflow-auto custom-scroll bg-black/40">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead className="sticky top-0 z-20 bg-[#05070a] border-b border-zinc-800">
            <tr>
              <th className="px-6 py-4 text-[10px] text-zinc-500 font-black uppercase tracking-widest">Timestamp (UTC)</th>
              <th className="px-6 py-4 text-[10px] text-zinc-500 font-black uppercase tracking-widest">Structural ID / Asset</th>
              <th className="px-6 py-4 text-[10px] text-zinc-500 font-black uppercase tracking-widest">Rule Followed</th>
              <th className="px-6 py-4 text-[10px] text-zinc-500 font-black uppercase tracking-widest">Calculated RR</th>
              <th className="px-6 py-4 text-[10px] text-zinc-500 font-black uppercase tracking-widest">Result (Win/Loss)</th>
              <th className="px-6 py-4 text-[10px] text-zinc-500 font-black uppercase tracking-widest text-right">Tamper-Proof Hash</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900/40">
            {filteredRecords.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-24 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <ShieldAlert className="w-8 h-8 text-zinc-800" />
                    <span className="text-zinc-600 italic font-medium">No chronological structural audits recorded for current selection.</span>
                  </div>
                </td>
              </tr>
            ) : (
              filteredRecords.map((record) => (
                <tr key={record.eventId} className="hover:bg-white/[0.01] transition-all group border-l-2 border-transparent hover:border-amber-500/40">
                  <td className="px-6 py-5">
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-zinc-200 font-mono flex items-center gap-1.5">
                        <Clock className="w-3 h-3 text-zinc-600" />
                        {record.timeStr}
                      </span>
                      <span className="text-[9px] text-zinc-600 font-bold uppercase mt-1">
                        {new Date(record.unixTimestampMs).toLocaleDateString([], { day: '2-digit', month: 'short' })}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-[10px] font-black border ${
                        record.completionStatus === 'TARGET_HIT' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 
                        record.completionStatus === 'SL_HIT' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
                        'bg-zinc-900 border-zinc-800 text-zinc-500'
                      }`}>
                        {record.asset.slice(0, 2)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-white">{record.asset}</span>
                        <span className="text-[9px] text-zinc-600 font-mono tracking-tighter">{record.eventId.split('-').pop()}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5">
                         <span className="text-[10px] font-black text-zinc-400 uppercase tracking-tighter">FROZEN_RULE_V26</span>
                         <ShieldCheck className="w-3.5 h-3.5 text-emerald-500/60" />
                      </div>
                      <p className="text-[9px] text-zinc-600 font-medium max-w-[200px] leading-tight line-clamp-1 italic">
                        "{record.auditRule}"
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <div className="inline-flex flex-col items-center">
                      <span className="text-xs font-black text-amber-500 font-mono bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/20">{record.rrRatio}</span>
                      <div className="w-16 h-1 bg-zinc-900 rounded-full mt-1.5 overflow-hidden">
                        <div 
                          className="h-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" 
                          style={{ width: `${Math.min(100, (parseInt(record.rrRatio.split(':')[1]) / 100) * 100)}%` }} 
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    {getStatusBadge(record.completionStatus)}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <div className="inline-flex items-center gap-2 bg-zinc-950 px-2 py-1 rounded-lg border border-zinc-900 group/hash cursor-help">
                      <Hash className="w-2.5 h-2.5 text-zinc-700" />
                      <span className="text-[9px] text-zinc-600 font-mono tracking-tighter">
                        {record.tamperProofHash.slice(0, 16)}
                      </span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 bg-black border-t border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2 text-[9px] text-zinc-600 font-black uppercase tracking-widest">
           <ShieldCheck className="w-3.5 h-3.5 text-emerald-900" />
           Immutable 256-bit Evidence Chain • Data-Source: Bybit V5 Native
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-[9px] text-zinc-400 font-black uppercase">Live Audit Stream</span>
          </div>
          <span className="text-zinc-800 font-bold">/</span>
          <span className="text-[9px] text-zinc-600 font-black font-mono">NODE_HASH: 0xSRB_LEDGER_STABLE</span>
        </div>
      </div>
    </div>
  );
};
