import React from 'react';
import { FileText, Clock, TrendingUp, ShieldCheck, Target, Zap, Building2 } from 'lucide-react';
import { TomorrowReportRecord } from '../types/terminal';

interface TomorrowEntryReportProps {
  reports: TomorrowReportRecord[];
  symbol: string;
  onOpenAuditReport?: () => void;
}

export const TomorrowEntryReport: React.FC<TomorrowEntryReportProps> = ({ reports, symbol, onOpenAuditReport }) => {
  return (
    <div className="bg-[#05070a] border border-white/5 rounded-[40px] p-8 shadow-2xl space-y-8 font-mono relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h2 className="text-base font-black text-white tracking-[0.2em] uppercase flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20">
               <FileText className="w-5 h-5 text-amber-400" />
            </div>
            Prediction Intelligence
          </h2>
          <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mt-2 ml-1">Tomorrow's Validity Windows • {symbol}</p>
        </div>
        <div className="flex items-center gap-2">
          {onOpenAuditReport && (
            <button
              onClick={onOpenAuditReport}
              className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-400 font-black text-[10px] uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-sm"
              title="Open 24H Broker Growth & Proof Audit (Siyab Raheman & Raziya Raheman)"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>24H BROKER AUDIT</span>
            </button>
          )}
          <div className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-xl">
             <span className="text-[10px] text-amber-400 font-black uppercase tracking-tighter">V25/26 ALGO</span>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {reports.map((r, i) => (
          <div key={i} className="group bg-zinc-950/40 border border-white/5 p-6 rounded-[32px] hover:border-amber-500/30 transition-all relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500 opacity-20 group-hover:opacity-100 transition-opacity" />
            
            <div className="flex flex-col sm:flex-row justify-between gap-8 relative z-10">
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                  <Clock className="w-4 h-4 text-zinc-600" /> Potential Node Time
                  <span className="text-white bg-white/5 px-3 py-1 rounded-full border border-white/10 ml-auto sm:ml-0">{r.time}</span>
                </div>
                <div className="flex items-center gap-8">
                  <div className="space-y-1">
                    <span className="text-[9px] text-zinc-700 uppercase font-black tracking-widest">Entry Limit</span>
                    <div className="text-2xl font-black text-white tabular-nums">${r.entryPrice.toLocaleString()}</div>
                  </div>
                  <div className="w-px h-10 bg-white/5" />
                  <div className="space-y-1">
                    <span className="text-[9px] text-rose-500/40 uppercase font-black tracking-widest">0.1% Hard SL</span>
                    <div className="text-xl font-black text-rose-400/80 tabular-nums">${r.sl.toLocaleString()}</div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-center sm:items-end justify-center gap-3">
                 <div className="flex items-center gap-3 text-emerald-400 font-black text-[11px] uppercase tracking-widest">
                    <Target className="w-4 h-4" /> Target: ${r.target.toLocaleString()}
                 </div>
                 <div className="flex items-center gap-2 text-zinc-400 font-black text-[9px] uppercase bg-white/[0.03] px-4 py-1.5 rounded-full border border-white/10 shadow-sm">
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-500" /> {r.validity} Confidence
                 </div>
              </div>
            </div>
            
            <div className="mt-5 pt-5 border-t border-white/5 flex flex-wrap items-center gap-6 text-[9px] text-zinc-700 font-black uppercase tracking-widest">
               <span className="flex items-center gap-1.5"><Zap className="w-3 h-3 text-amber-500" /> LIMIT_NODE_ONLY</span>
               <span className="flex items-center gap-1.5"><TrendingUp className="w-3 h-3 text-blue-500" /> BEHAVIORAL_SYNC_PASS</span>
               <span className="flex items-center gap-1.5 ml-auto"><ShieldCheck className="w-3 h-3 text-emerald-500" /> FTMO_OK</span>
            </div>
          </div>
        ))}
      </div>

      <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-[32px] shadow-inner">
         <p className="text-[10px] text-blue-300/40 leading-relaxed font-bold italic text-center">
           "Coordinates derived from the 1-Min to 1-Month structural state machine. Wait for time-close activation."
         </p>
      </div>
    </div>
  );
};
