import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Binary, 
  Layers, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  CheckCircle2, 
  Zap, 
  ArrowRight, 
  AlertTriangle,
  Info,
  HelpCircle,
  Play,
  Maximize2,
  Sliders
} from 'lucide-react';


interface RuleCardProps {
  title: string;
  value: string;
  desc: string;
  status: string;
}

export const SrbmprFrozenInstructionBoard: React.FC<{
  assetSymbol?: string;
  livePrice?: number;
}> = ({ assetSymbol = 'BTC/USDT', livePrice = 68750.00 }) => {
  const [aslBelow, setAslBelow] = useState<number>(livePrice - 150);
  const [aslAbove, setAslAbove] = useState<number>(livePrice + 180);
  const [runningBox, setRunningBox] = useState<number>(-4);
  const [simDirection, setSimDirection] = useState<'MINUS' | 'PLUS'>('MINUS');
  const [simStatus, setSimStatus] = useState<string>('Awaiting ASL Reaction...');
  
  // Compounding simulator starting with $2
  const [compStep, setCompStep] = useState<number>(1);
  const compoundValues = [2, 4, 8, 16, 32, 64, 128, 256, 512, 1024, 2048, 4096, 8192, 16384, 32768, 65536, 131072, 262144, 524288, 1048576, 2097152];

  // Re-calculate ASL bounds whenever livePrice ticks to keep realistic proportion
  useEffect(() => {
    if (livePrice && livePrice > 0) {
      setAslBelow(Number((livePrice * 0.998).toFixed(2)));
      setAslAbove(Number((livePrice * 1.002).toFixed(2)));
    }
  }, [livePrice]);

  const triggerSimulation = (type: 'TOUCH_BELOW' | 'TOUCH_ABOVE' | 'BREAKOUT' | 'FAKEOUT') => {
    if (type === 'TOUCH_BELOW') {
      setSimDirection('MINUS');
      setRunningBox(prev => prev - 1);
      setSimStatus('ASL-Below Touch & Reject: TRIGGER LONG (SL: ASL-Below -0.1%, Target: ASL-Above)');
    } else if (type === 'TOUCH_ABOVE') {
      setSimDirection('PLUS');
      setRunningBox(prev => prev + 1);
      setSimStatus('ASL-Above Touch & Reject: TRIGGER SHORT (SL: ASL-Above +0.1%, Target: ASL-Below)');
    } else if (type === 'BREAKOUT') {
      setSimStatus('ASL-Above Solid Breakout: Sustained 1-Sec PLUS steps (No immediate reversal, Long Bias Open)');
    } else if (type === 'FAKEOUT') {
      setSimStatus('Fakeout Triggered: Broken ASL rejected immediately by alternate 1-Sec direction candle. Entry Cancelled!');
    }
  };

  return (
    <div id="pure-1to1-validator" className="bg-[#02050A] border-2 border-emerald-500 rounded-[40px] p-6 sm:p-8 font-mono text-zinc-100 shadow-[0_0_120px_rgba(16,185,129,0.25)] space-y-8">
      
      {/* 1. HEADER SECTION - SRTIME BOARD EMBLEM */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 border-b border-zinc-800 pb-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <Binary className="w-4 h-4 text-emerald-400" />
              SRTIME MASTER FRAMEWORK
            </span>
            <span className="text-amber-400 text-xs font-black uppercase bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              UNIFIED TRUTH • ZERO EXCEPTIONS
            </span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
            SRBMPR FROZEN INSTRUCTION BOARD <span className="text-zinc-600 font-light mx-2">|</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-200 to-amber-400">
              WORLDWIDE ASSET ENGINE
            </span>
          </h2>

          <p className="text-xs text-zinc-300 max-w-4xl leading-relaxed">
            <strong>सार्वभौमिक नियम (Universal Law):</strong> कोई इंडिकेटर नहीं, कोई बाहरी फ़िल्टर नहीं। सिर्फ एक नियम—हर कैंडल का डायरेक्शन बॉक्स को ठीक $\pm1$ ले जाता है और RR उसी के साथ बंधा होता है। एंट्री हमेशा माइक्रो (1-सेकंड) से, और स्टॉप/टारगेट दो ASL स्तरों (cycle shift levels) से तय होते हैं।
          </p>
        </div>

        {/* Golden Validation Shield */}
        <div className="bg-emerald-500/10 border border-emerald-500/30 px-5 py-4 rounded-3xl flex items-center gap-4 shrink-0 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
          <ShieldCheck className="w-10 h-10 text-emerald-400" />
          <div className="text-left">
            <div className="text-xs font-black text-emerald-400 uppercase tracking-widest">SR ENCLAVE LOCK</div>
            <div className="text-[10px] text-zinc-400 leading-tight">MATHEMATICAL PROOF<br />FROZEN V26 STANDARD</div>
          </div>
        </div>
      </div>

      {/* 2. CORE SPECIFICATION TABLE */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 space-y-4">
        <h3 className="text-xs font-black text-white uppercase tracking-widest border-b border-zinc-900 pb-2.5 flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          FROZEN SPECIFICATION REGISTER
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs">
          <div className="space-y-1.5 p-4 bg-black/60 rounded-2xl border border-zinc-900">
            <span className="text-[9px] text-zinc-500 font-black uppercase">Asset Target</span>
            <div className="text-sm font-black text-white">WORLDWIDE ANY ASSET</div>
            <p className="text-[10px] text-zinc-400">BTC, Gold, Crypto, Spot or Perpetual</p>
          </div>

          <div className="space-y-1.5 p-4 bg-black/60 rounded-2xl border border-zinc-900">
            <span className="text-[9px] text-zinc-500 font-black uppercase">Entry Timeframe</span>
            <div className="text-sm font-black text-emerald-400">1-SECOND (MICRO)</div>
            <p className="text-[10px] text-zinc-400">Confirm Direction & Box Step ±1</p>
          </div>

          <div className="space-y-1.5 p-4 bg-black/60 rounded-2xl border border-zinc-900">
            <span className="text-[9px] text-zinc-500 font-black uppercase">Structure Timeframe</span>
            <div className="text-sm font-black text-cyan-300">1-MINUTE OR HIGHER</div>
            <p className="text-[10px] text-zinc-400">Defined by two cycle shift levels</p>
          </div>

          <div className="space-y-1.5 p-4 bg-black/60 rounded-2xl border border-zinc-900">
            <span className="text-[9px] text-zinc-500 font-black uppercase">Compounding Rule</span>
            <div className="text-sm font-black text-amber-400">FIXED 20-STEP WIN CHAIN</div>
            <p className="text-[10px] text-zinc-400">$2 Entry ➜ $2,097,152 Objective</p>
          </div>
        </div>
      </div>

      {/* 3. DUAL ASL CYCLE SHIFT VISUALIZATION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Column: Visual Level Gantry */}
        <div className="bg-zinc-950/80 border border-zinc-900 rounded-3xl p-6 space-y-6 relative flex flex-col justify-between">
          <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
            DUAL ASL (CYCLE SHIFT LEVELS) LIVE PROJECTION
          </h3>

          {/* Interactive Line Chart / Gantry Representation */}
          <div className="relative border border-zinc-900 h-52 bg-black/80 rounded-2xl p-4 flex flex-col justify-between overflow-hidden">
            {/* ASL Above Line */}
            <div className="relative z-10 border-t-2 border-dashed border-rose-500/50 flex items-center justify-between pt-1">
              <span className="text-[9px] text-rose-400 font-black bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                ASL-ABOVE (Last Completed High)
              </span>
              <span className="text-xs text-rose-400 font-mono font-black">${aslAbove}</span>
            </div>

            {/* Live Price Oscillator */}
            <div className="relative z-10 flex items-center justify-between py-1 bg-zinc-900/60 border border-zinc-800 rounded-xl px-3 my-2">
              <span className="text-[10px] text-zinc-400 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Price
              </span>
              <span className="text-sm font-black text-white font-mono animate-pulse">${livePrice.toLocaleString()}</span>
            </div>

            {/* ASL Below Line */}
            <div className="relative z-10 border-b-2 border-dashed border-emerald-500/50 flex items-center justify-between pb-1">
              <span className="text-[9px] text-emerald-400 font-black bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                ASL-BELOW (Last Completed Low)
              </span>
              <span className="text-xs text-emerald-400 font-mono font-black">${aslBelow}</span>
            </div>

            {/* Background grid */}
            <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:16px_16px]" />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] text-zinc-500 font-bold block uppercase">Live Reactor Status:</span>
            <div className="text-[11px] font-mono text-amber-400 font-black bg-black p-3 rounded-xl border border-zinc-900 flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0 text-amber-500" />
              {simStatus}
            </div>
          </div>
        </div>

        {/* Right Column: Interaction Controls & Simulator Triggers */}
        <div className="bg-zinc-950/80 border border-zinc-900 rounded-3xl p-6 space-y-5 flex flex-col justify-between">
          <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-emerald-400" />
            CYCLE TRIGGER SIMULATION ADAPTERS
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => triggerSimulation('TOUCH_BELOW')}
              className="py-3.5 bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-500/30 text-emerald-300 rounded-2xl font-black text-[10px] uppercase flex flex-col items-center gap-1 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
            >
              <span>1s Reaction at ASL-Below</span>
              <span className="text-[7px] opacity-75">Touch & Reject Long Entry</span>
            </button>

            <button
              onClick={() => triggerSimulation('TOUCH_ABOVE')}
              className="py-3.5 bg-rose-950/40 hover:bg-rose-900/40 border border-rose-500/30 text-rose-300 rounded-2xl font-black text-[10px] uppercase flex flex-col items-center gap-1 shadow-[0_0_15px_rgba(244,63,94,0.1)]"
            >
              <span>1s Reaction at ASL-Above</span>
              <span className="text-[7px] opacity-75">Touch & Reject Short Entry</span>
            </button>

            <button
              onClick={() => triggerSimulation('BREAKOUT')}
              className="py-3.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-2xl font-black text-[10px] uppercase flex flex-col items-center gap-1"
            >
              <span>ASL Breakout</span>
              <span className="text-[7px] opacity-75">Sustained 1-Sec Steps</span>
            </button>

            <button
              onClick={() => triggerSimulation('FAKEOUT')}
              className="py-3.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-2xl font-black text-[10px] uppercase flex flex-col items-center gap-1"
            >
              <span>ASL Fakeout</span>
              <span className="text-[7px] opacity-75">Immediate Alternate Reject</span>
            </button>
          </div>

          <div className="p-4 bg-black/60 border border-zinc-900 rounded-xl space-y-2">
            <span className="text-[9px] text-zinc-500 uppercase font-black">Strict Target & Stop Rules:</span>
            <ul className="list-disc pl-4 text-[10px] text-zinc-400 space-y-1">
              <li><strong>LONG TARGET:</strong> ASL-Above first, then next structural extreme.</li>
              <li><strong>LONG STOP LOSS:</strong> Just below ASL-Below (Zero lookahead exceptions).</li>
              <li><strong>SHORT TARGET:</strong> ASL-Below first, then next structural extreme.</li>
              <li><strong>SHORT STOP LOSS:</strong> Just above ASL-Above (Zero lookahead exceptions).</li>
            </ul>
          </div>
        </div>

      </div>

      {/* 4. COMPOUNDING PROGRESSION TRACKER */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-900 pb-2.5">
          <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
            <Sliders className="w-4 h-4 text-amber-400" />
            LIVE PURE COMPOUNDING STEP CALCULATOR (FROM $2 BASE)
          </h3>
          <span className="text-[10px] text-zinc-500 font-mono">Click step to view compounding value</span>
        </div>

        <div className="flex flex-wrap gap-2.5 justify-between">
          {compoundValues.map((val, idx) => (
            <button
              key={idx}
              onClick={() => setCompStep(idx)}
              className={`px-3 py-2.5 rounded-xl border font-mono text-center flex-1 min-w-[70px] transition-all ${
                compStep === idx
                  ? 'bg-amber-500 text-black border-amber-400 font-black shadow-[0_0_15px_rgba(245,158,11,0.3)] scale-105'
                  : 'bg-black/60 text-zinc-400 border-zinc-900 hover:text-white hover:border-zinc-800'
              }`}
            >
              <div className="text-[8px] uppercase tracking-tighter">WIN #{idx}</div>
              <div className="text-xs font-black mt-1">${val.toLocaleString()}</div>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};
