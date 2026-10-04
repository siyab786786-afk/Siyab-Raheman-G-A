import React, { useState, useEffect } from 'react';
import { Zap, Clock, ShieldAlert, CheckCircle2, RefreshCw, Layers } from 'lucide-react';
import { Micro60SecondExecutionEngine, MicroOrigin, SixtySecondCycleResult } from '../services/Micro60SecondExecutionEngine';
import { AssetSymbol } from '../types/terminal';

interface Props {
  activeAsset?: AssetSymbol;
  livePrice?: number;
}

export const Micro60SecondTerminalStream: React.FC<Props> = ({
  activeAsset = 'BTC/USDT',
  livePrice = 65280
}) => {
  const engine = Micro60SecondExecutionEngine.getInstance();
  const [hasMicroOrigin, setHasMicroOrigin] = useState<boolean>(true);
  const [microOrigin, setMicroOrigin] = useState<MicroOrigin>({
    id: 'M-7842',
    timestamp: Date.now() - 15000,
    price: livePrice - 5,
    validated: true
  });

  const [cycleResult, setCycleResult] = useState<SixtySecondCycleResult>(() => 
    engine.evaluateMicroCycle(microOrigin, livePrice, Date.now())
  );

  useEffect(() => {
    const timer = setInterval(() => {
      const activeMicro = hasMicroOrigin ? microOrigin : null;
      const res = engine.evaluateMicroCycle(activeMicro, livePrice, Date.now());
      setCycleResult(res);
    }, 1000);
    return () => clearInterval(timer);
  }, [hasMicroOrigin, microOrigin, livePrice]);

  const handleResetMicroOrigin = () => {
    const newOrigin: MicroOrigin = {
      id: `M-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: Date.now(),
      price: livePrice,
      validated: true
    };
    setMicroOrigin(newOrigin);
    setHasMicroOrigin(true);
  };

  return (
    <div className="bg-gradient-to-b from-zinc-950 via-black to-zinc-950 border-2 border-emerald-500/50 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(16,185,129,0.15)] font-mono text-xs space-y-6">
      
      {/* Header */}
      <div className="border-b border-zinc-800 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Clock className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
              SRBMPR MICRO 60-SECOND EXECUTION ENGINE
            </h2>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Strict Operative Time-Zone: 1 Minute = 60 Seconds • Time First, Price Later • No Micro = No Start
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setHasMicroOrigin(!hasMicroOrigin)}
            className={`px-4 py-2 rounded-xl text-xs font-black border transition-all ${
              hasMicroOrigin ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-rose-500/20 border-rose-500/40 text-rose-400'
            }`}
          >
            {hasMicroOrigin ? 'Micro Origin: LOCKED' : 'Micro Origin: ABORTED (NO MICRO)'}
          </button>

          <button
            onClick={handleResetMicroOrigin}
            className="p-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 rounded-xl"
            title="Reset Micro Origin"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Core Sequence Display */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-black border border-zinc-800 p-4 rounded-2xl space-y-1">
          <span className="text-[10px] text-zinc-500 font-bold uppercase">1. Micro Origin</span>
          <div className="text-sm font-black text-white">{hasMicroOrigin ? microOrigin.id : 'NONE'}</div>
          <span className="text-[9px] text-emerald-400 font-bold">{hasMicroOrigin ? `@ $${microOrigin.price}` : 'NO START'}</span>
        </div>

        <div className="bg-black border border-zinc-800 p-4 rounded-2xl space-y-1">
          <span className="text-[10px] text-zinc-500 font-bold uppercase">2. Time Window</span>
          <div className="text-sm font-black text-amber-400">60 Seconds</div>
          <span className="text-[9px] text-zinc-600 font-bold">Strict Operative Unit</span>
        </div>

        <div className="bg-black border border-zinc-800 p-4 rounded-2xl space-y-1">
          <span className="text-[10px] text-zinc-500 font-bold uppercase">3. Target Completion</span>
          <div className={`text-sm font-black ${cycleResult.targetCompleted ? 'text-emerald-400' : 'text-cyan-400'}`}>
            {cycleResult.targetCompleted ? 'QUALIFIED' : 'PENDING 60S'}
          </div>
          <span className="text-[9px] text-zinc-600 font-bold">Time-First Verification</span>
        </div>

        <div className="bg-black border border-zinc-800 p-4 rounded-2xl space-y-1">
          <span className="text-[10px] text-zinc-500 font-bold uppercase">4. Price Movement</span>
          <div className={`text-sm font-black ${cycleResult.actualPriceMovement >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            ${cycleResult.actualPriceMovement > 0 ? `+${cycleResult.actualPriceMovement}` : cycleResult.actualPriceMovement}
          </div>
          <span className="text-[9px] text-zinc-600 font-bold">Result After Time</span>
        </div>

        <div className="bg-black border border-zinc-800 p-4 rounded-2xl space-y-1">
          <span className="text-[10px] text-zinc-500 font-bold uppercase">5. RR Result</span>
          <div className="text-sm font-black text-amber-400">1:{cycleResult.actualRr}</div>
          <span className="text-[9px] text-zinc-600 font-bold">Deterministic Outcome</span>
        </div>
      </div>

      {/* Execution Status Banner */}
      <div className={`p-4 rounded-2xl border text-xs flex items-center justify-between ${
        cycleResult.status === 'NO_MICRO_ABORT' 
          ? 'bg-rose-950/30 border-rose-500/40 text-rose-300' 
          : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
      }`}>
        <div className="flex items-center gap-3">
          {cycleResult.status === 'NO_MICRO_ABORT' ? <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" /> : <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
          <div>
            <strong className="text-white uppercase font-bold">Engine Status: {cycleResult.status}</strong>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              {cycleResult.status === 'NO_MICRO_ABORT' 
                ? 'Hard Rule Enforced: NO MICRO = NO START. Entry, target, RR and cycle suspended.' 
                : 'Micro origin active → 60-second operative window elapsed → Target evaluated → New micro sequence ready.'}
            </p>
          </div>
        </div>

        <div className="px-3 py-1 bg-black rounded-xl border border-zinc-800 font-bold text-[10px] text-zinc-300">
          Cycle: {cycleResult.cycleId}
        </div>
      </div>

    </div>
  );
};
