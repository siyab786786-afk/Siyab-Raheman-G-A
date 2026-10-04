import React, { useState, useEffect } from 'react';
import { 
  Atom, 
  Binary, 
  Cpu, 
  Maximize2, 
  Layers, 
  Percent, 
  CheckCircle2, 
  TrendingUp, 
  TrendingDown,
  RefreshCw,
  Zap,
  ShieldCheck
} from 'lucide-react';

interface MicroTick {
  id: string;
  timestamp: string;
  microPrice: number;
  delta: string;
  accumulatedSatoshi: number;
  status: 'ALIGNED';
}

export const SrbmprNanoPrecisionSimulator: React.FC = () => {
  const [basePrice, setBasePrice] = useState<number>(1.000000000);
  const [accumulatedSteps, setAccumulatedSteps] = useState<number>(3157229);
  const [liveTicks, setLiveTicks] = useState<MicroTick[]>([]);
  const [isLiveActive, setIsLiveActive] = useState<boolean>(true);

  // Generate micro-ticks with 1e-9 precision (0.000000001 Satoshi steps)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLiveActive) {
      interval = setInterval(() => {
        const randDirection = Math.random() > 0.5 ? 1 : -1;
        const tickDelta = 0.000000001;
        
        setBasePrice(prev => {
          const newVal = prev + (randDirection * tickDelta);
          // Avoid JS floating point issues
          return parseFloat(newVal.toFixed(9));
        });

        setAccumulatedSteps(prev => prev + 1);

        setLiveTicks(prev => {
          const newTick: MicroTick = {
            id: `NANO-${Math.floor(Math.random() * 90000) + 10000}`,
            timestamp: new Date().toISOString().split('T')[1].slice(0, 12),
            microPrice: basePrice,
            delta: randDirection > 0 ? '+0.000000001' : '-0.000000001',
            accumulatedSatoshi: accumulatedSteps,
            status: 'ALIGNED'
          };
          return [newTick, ...prev.slice(0, 4)];
        });
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isLiveActive, basePrice, accumulatedSteps]);

  // Macro progression stats
  const macroRatio = "1 : 1,000,000,000";
  const microScale = "0.000000001 (1e-9)";

  return (
    <div id="nano-precision-simulator" className="bg-[#02050A] border-2 border-emerald-500 rounded-[36px] p-6 sm:p-8 font-mono text-zinc-100 shadow-[0_0_100px_rgba(16,185,129,0.2)] space-y-6">
      
      {/* 1. HEADER PANEL */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-black uppercase flex items-center gap-1.5 shadow-[0_0_10px_rgba(16,185,129,0.2)] animate-pulse">
              <Atom className="w-3.5 h-3.5 text-emerald-400" />
              1e-9 NANO-SCALE PRECISION
            </span>
            <span className="text-amber-400 text-xs font-black uppercase bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              ATOMIC CODES LOCKED
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tighter italic">
            SR NANO-PRECISION MICRO 1:1 SCALING GANTRY
          </h2>
        </div>

        <div className="text-right shrink-0 bg-zinc-950 border border-zinc-900 p-3 rounded-2xl">
          <span className="text-[9px] text-zinc-500 font-bold uppercase block">Macro Scaling Matrix</span>
          <span className="text-sm font-black text-amber-400 font-mono">{macroRatio}</span>
        </div>
      </div>

      <p className="text-xs text-zinc-300 leading-relaxed">
        <strong>अणु-स्तरीय संचय नियम (Nano-Accumulation Rule):</strong> संपूर्ण $1 बिलियन का महा-आंदोलन वास्तव में अरबों सूक्ष्म परमाणु स्तर के कदमों (Micro Ticks of 1e-9) का संचय है। जब आप अणु स्तर पर १:१ संरेखण करते हैं, तो प्रत्येक सूक्ष्म कदम एक संतुलित सुरक्षा शील्ड है जो संचयी बल को १ बिलियन गुना बढ़ा देती है।
      </p>

      {/* Grid: Live Micro Feed & Atomic Entry Module */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Box A: Live 1e-9 Satoshi Tick Feed */}
        <div className="bg-zinc-950 border border-zinc-900 p-5 rounded-2xl flex flex-col justify-between h-56 relative overflow-hidden">
          <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
            <span className="text-[9px] text-zinc-500 font-black uppercase">LIVE SATOSHI TICK ENGINE</span>
            <span className="text-[9px] text-emerald-400 font-black flex items-center gap-1">
              <Zap className="w-3 h-3 text-emerald-400 animate-pulse" />
              1e-9 RESOLUTION
            </span>
          </div>

          <div className="my-3 text-center">
            <div className="text-3xl sm:text-4xl font-black text-white tracking-wider font-mono tabular-nums">
              {basePrice.toFixed(9)}
            </div>
            <span className="text-[10px] text-zinc-500 font-bold">CURRENT ATOMIC BASE VALUE</span>
          </div>

          {/* Mini tick rows */}
          <div className="space-y-1 text-[9px] text-zinc-500 font-mono">
            {liveTicks.map((t, idx) => (
              <div key={idx} className="flex justify-between items-center bg-black/40 px-2 py-0.5 rounded border border-zinc-900/40">
                <span>Time: {t.timestamp} | ID: {t.id}</span>
                <span className={t.delta.startsWith('+') ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {t.delta}
                </span>
                <span className="text-zinc-400">{t.microPrice.toFixed(9)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Box B: Atomic 1:1 Execution Node Diagram */}
        <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl flex flex-col justify-between h-56">
          <span className="text-[9px] text-zinc-500 font-black uppercase">ATOMIC 1:1 ALIGNMENT COEFFICIENTS</span>

          <div className="space-y-2">
            <div className="flex justify-between items-center p-2.5 bg-zinc-900/60 border border-zinc-800 rounded-xl text-xs">
              <span className="text-zinc-500 uppercase font-black">Micro Entry Target</span>
              <span className="text-emerald-400 font-black font-mono">{(basePrice + 0.000000001).toFixed(9)} (+1 Node)</span>
            </div>

            <div className="flex justify-between items-center p-2.5 bg-zinc-900/60 border border-zinc-800 rounded-xl text-xs">
              <span className="text-zinc-500 uppercase font-black">Atomic Entry Point</span>
              <span className="text-white font-black font-mono">{basePrice.toFixed(9)} (Axis Center)</span>
            </div>

            <div className="flex justify-between items-center p-2.5 bg-zinc-900/60 border border-zinc-800 rounded-xl text-xs">
              <span className="text-zinc-500 uppercase font-black">Micro Stop Loss</span>
              <span className="text-rose-400 font-black font-mono">{(basePrice - 0.000000001).toFixed(9)} (-1 Node)</span>
            </div>
          </div>

          <div className="text-[9px] text-zinc-500">
            *सूक्ष्म स्तर पर १:१ = बराबर की सूक्ष्म हलचल बनाम बराबर की सूक्ष्म रिस्क।
          </div>
        </div>

      </div>

      {/* Cumulative Progress Meter to 1B */}
      <div className="bg-black/80 border border-zinc-900 p-5 rounded-2xl space-y-3">
        <div className="flex justify-between items-center text-xs">
          <span className="text-[10px] text-zinc-400 font-black uppercase">ACCUMULATED MICRO 1:1 STEPS REGISTERED</span>
          <span className="text-[10px] text-amber-400 font-black">{accumulatedSteps.toLocaleString()} / 1,000,000,000 (0.31%)</span>
        </div>

        <div className="w-full bg-zinc-900 rounded-full h-2.5 overflow-hidden border border-zinc-800">
          <div 
            className="bg-gradient-to-r from-emerald-500 via-amber-500 to-yellow-400 h-2.5 rounded-full" 
            style={{ width: `${Math.min(100, (accumulatedSteps / 1000000000) * 100)}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-[9px] text-zinc-500">
          <span>Start Point: 0.000000001</span>
          <span>Axis Target: $1B Cumulative</span>
        </div>
      </div>

    </div>
  );
};
