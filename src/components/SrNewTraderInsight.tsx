import React, { useState, useEffect } from 'react';
import { Star, Zap, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import { SRBMPRMechanismEngine } from '../services/SRBMPRMechanismEngine';

export const SrNewTraderInsight: React.FC = () => {
  const [successCount, setSuccessCount] = useState(1284);
  const [memeCandidates, setMemeCandidates] = useState<any[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('en-GB', { timeZone: 'UTC' }));
  const engine = SRBMPRMechanismEngine.getInstance();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-GB', { timeZone: 'UTC' }));
    }, 1000);
    const unsubscribe = engine.subscribeToMemeScanner(setMemeCandidates);
    return () => {
      clearInterval(timer);
      unsubscribe();
    };
  }, []);

  return (
    <div className="mt-8 p-8 rounded-[40px] bg-gradient-to-br from-indigo-950/40 via-zinc-950 to-blue-950/40 border border-indigo-500/20 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden group">
      <div className="relative z-10 flex flex-col gap-8">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-[28px] bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Star className="w-10 h-10 fill-indigo-500/20" />
            </div>
            <div>
              <h2 className="text-4xl font-black text-white tracking-[0.25em] uppercase italic">SRBMPR</h2>
              <p className="text-[10px] text-indigo-400 font-black uppercase tracking-[0.3em] mt-1">Deep Research Framework | Behavioral Research Laboratory</p>
            </div>
          </div>
          <div className="text-right">
             <div className="text-[10px] text-zinc-500 font-black uppercase">Successful Trajectories</div>
             <div className="text-xl font-black text-white tracking-widest">{successCount.toLocaleString()}</div>
          </div>
        </div>

        {/* Strict 0.10% Stop Loss Mandate Banner */}
        <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-wider">Mandatory Structural Policy: STRICT 0.10% STOP LOSS SPACE</h3>
            <p className="text-[10px] text-zinc-400 uppercase font-black tracking-tight mt-0.5">
              Every entry is anchored to a strict 0.10% Stop Loss floor. Trading without a Stop Loss is gambling. Compounding trajectories: 1:100 to 1:1000.
            </p>
          </div>
        </div>

        {/* Scanner Table */}
        <div className="overflow-x-auto max-h-[600px] overflow-y-auto custom-scrollbar bg-black/40 rounded-3xl border border-white/5">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-zinc-900 z-10 shadow-lg">
              <tr className="text-[10px] text-zinc-500 font-black uppercase border-b border-white/10">
                <th className="p-5">Asset Symbol</th>
                <th className="p-5 text-center">Status</th>
                <th className="p-5">Entry Time</th>
                <th className="p-5 text-amber-400">Wait Time</th>
                <th className="p-5 text-emerald-400">Target End Time</th>
                <th className="p-5 text-indigo-400 text-right font-black">TRF Time / Path</th>
              </tr>
            </thead>
            <tbody className="text-white font-mono text-sm">
              {memeCandidates.length > 0 ? (
                memeCandidates.map((coin, index) => (
                  <tr key={index} className="border-b border-white/5 last:border-0 hover:bg-indigo-500/5 transition-all group/row">
                    <td className="p-5 font-black text-indigo-300">
                      <div className="flex items-center gap-2">
                        <div className="w-1 h-4 bg-indigo-500 rounded-full group-hover/row:h-6 transition-all" />
                        <div className="flex flex-col">
                          <span>{coin.symbol}</span>
                          <span className={`text-[9px] font-black ${index % 3 === 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                            {index % 3 === 0 ? 'SHORT' : 'LONG'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-5 text-center">
                      {coin.status === 'NOW' ? (
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
                          <span className="text-emerald-400 font-black text-[9px] uppercase">NOW</span>
                        </div>
                      ) : coin.status === 'WAIT' ? (
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full">
                          <Clock className="w-2 h-2 text-amber-500" />
                          <span className="text-amber-400 font-black text-[9px] uppercase">WAIT</span>
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-full">
                          <CheckCircle2 className="w-2 h-2 text-blue-500" />
                          <span className="text-blue-400 font-black text-[9px] uppercase">FINISHED</span>
                        </div>
                      )}
                    </td>
                    <td className="p-5">
                      <span className="text-zinc-300 font-black">{coin.entryTime}</span>
                    </td>
                    <td className="p-5 text-amber-500 font-black">
                      {coin.waitTime}
                    </td>
                    <td className="p-5 text-emerald-400 font-black">
                      {coin.targetEndTime}
                    </td>
                    <td className="p-5 text-right">
                      <div className="inline-flex flex-col items-end">
                        <div className="flex items-center gap-2 text-white font-black">
                          <span className="text-indigo-400 text-xs">{coin.trfTime} TRF</span>
                          <div className="flex gap-1">
                              {[1,2,3].map(step => (
                                  <div key={step} className={`w-3 h-1 rounded-full ${coin.status === 'NOW' ? 'bg-indigo-500 animate-pulse' : 'bg-zinc-800'}`} style={{ opacity: step * 0.3 }} />
                              ))}
                          </div>
                        </div>
                        <div className="text-[9px] text-zinc-500 uppercase font-black">1:100 Ratio Lock</div>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                    <td colSpan={5} className="py-20 text-center text-zinc-600 font-black uppercase tracking-[0.3em] animate-pulse">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                        <span>Mechanism Validating Real-Time Data...</span>
                      </div>
                    </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center pt-6 border-t border-white/5">
          <div className="flex items-center gap-4">
            <button className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-black text-xs uppercase transition-all flex items-center gap-2">
              <Zap className="w-4 h-4" /> Go to I buy live trade in the VIP tab
            </button>
            <div className="text-[10px] text-emerald-500 font-black uppercase animate-pulse">
              System Ready for Purchase. Good Luck!
            </div>
          </div>
          <div className="flex flex-col items-end">
            <p className="text-xs font-black text-white uppercase tracking-[0.2em]">SRBMPR LABORATORY</p>
            <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest mt-1">LOCKED DATA SOURCE • NO LEAK POLICY</p>
          </div>
        </div>
      </div>
    </div>
  );
};
