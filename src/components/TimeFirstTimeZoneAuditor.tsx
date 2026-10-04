import React, { useState } from 'react';
import { Clock, ShieldCheck, AlertCircle, RefreshCw, Layers, CheckCircle2 } from 'lucide-react';
import { TimeFirstTimeZoneEngine, TimeZoneRatio, TIME_ZONE_MAP, TimeFirstAuditResult } from '../services/TimeFirstTimeZoneEngine';
import { AssetSymbol } from '../types/terminal';

interface Props {
  activeAsset?: AssetSymbol;
  livePrice?: number;
}

export const TimeFirstTimeZoneAuditor: React.FC<Props> = ({
  activeAsset = 'BTC/USDT',
  livePrice = 65280
}) => {
  const engine = TimeFirstTimeZoneEngine.getInstance();
  const [selectedRatio, setSelectedRatio] = useState<TimeZoneRatio>('1:100');
  const [auditResult, setAuditResult] = useState<TimeFirstAuditResult | null>(null);
  const [isAuditing, setIsAuditing] = useState(false);

  const handleRunTimeFirstAudit = () => {
    setIsAuditing(true);
    const now = Date.now();
    const entryTime = now - (TIME_ZONE_MAP[selectedRatio] * 60 * 1000);

    // Generate mock micro candles for audit test conforming to time resolution
    const mockCandles = Array.from({ length: TIME_ZONE_MAP[selectedRatio] }, (_, i) => ({
      timestamp: entryTime + (i * 60 * 1000),
      high: livePrice + (i * 2.5),
      low: livePrice - (i * 1.2),
      close: livePrice + (i * 1.8)
    }));

    const result = engine.auditTimeFirstEvent(
      `EVT-${Math.floor(1000 + Math.random() * 9000)}`,
      entryTime,
      livePrice,
      selectedRatio,
      mockCandles
    );

    setTimeout(() => {
      setAuditResult(result);
      setIsAuditing(false);
    }, 400);
  };

  return (
    <div className="bg-gradient-to-b from-zinc-950 via-black to-zinc-950 border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(245,158,11,0.12)] font-mono text-xs space-y-6">
      
      {/* Header */}
      <div className="border-b border-zinc-800 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Clock className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
              SRBMPR TIME-FIRST TIME-ZONE MAPPING AUDITOR
            </h2>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Micro Entry → Time Window → Completion Time → Price Movement → RR (Max = 1000 Minutes)
            </p>
          </div>
        </div>

        {/* Time Ratio Selector */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-zinc-500 uppercase font-black">Time-Zone Ratio:</span>
          <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800 flex-wrap">
            {(['1:1', '1:2', '1:5', '1:10', '1:100', '1:1000'] as TimeZoneRatio[]).map(ratio => (
              <button
                key={ratio}
                onClick={() => setSelectedRatio(ratio)}
                className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all ${
                  selectedRatio === ratio
                    ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {ratio}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Principle Banner */}
      <div className="p-4 bg-amber-950/20 border border-amber-500/30 rounded-2xl text-amber-300 text-[11px] flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <strong className="text-white uppercase font-bold">Time-First Logic Principle:</strong> पहले TIME पकड़ो। PRICE बाद में पढ़ो। (Micro Entry → Time Window → Target Completion → Price Movement → RR). Maximum handling limit is strictly 1000 minutes.
          </div>
        </div>

        <button
          onClick={handleRunTimeFirstAudit}
          disabled={isAuditing}
          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-xl text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${isAuditing ? 'animate-spin' : ''}`} />
          <span>{isAuditing ? 'Auditing Time-Zone...' : `Run ${selectedRatio} Audit`}</span>
        </button>
      </div>

      {/* Audit Result Display */}
      {auditResult && (
        <div className="bg-black border border-zinc-800 p-6 rounded-2xl space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
            <span className="text-[11px] font-black text-amber-400 uppercase tracking-widest">
              TIME-FIRST AUDIT RESULT ({auditResult.selectedRatio} = {auditResult.maxWindowMinutes} Minutes Window)
            </span>
            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
              auditResult.auditStatus === 'QUALIFIED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
            }`}>
              {auditResult.auditStatus}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-[11px]">
            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-900">
              <span className="text-[9px] text-zinc-500 font-bold block">EVENT ID</span>
              <span className="text-white font-black text-sm">{auditResult.eventId}</span>
            </div>

            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-900">
              <span className="text-[9px] text-zinc-500 font-bold block">TIME WINDOW</span>
              <span className="text-amber-400 font-black text-sm">{auditResult.maxWindowMinutes} Minutes</span>
            </div>

            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-900">
              <span className="text-[9px] text-zinc-500 font-bold block">ACTUAL PRICE MOVEMENT</span>
              <span className="text-emerald-400 font-black text-sm">${auditResult.actualPriceMovement}</span>
            </div>

            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-900">
              <span className="text-[9px] text-zinc-500 font-bold block">COMPUTED RR</span>
              <span className="text-cyan-400 font-black text-sm">1:{auditResult.actualRr}</span>
            </div>
          </div>

          <div className="p-3.5 bg-zinc-900 rounded-xl border border-zinc-800 text-zinc-300 text-[11px] flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{auditResult.notes}</span>
          </div>
        </div>
      )}

    </div>
  );
};
