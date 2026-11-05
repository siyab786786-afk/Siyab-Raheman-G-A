import React, { useState, useEffect } from 'react';
import { Zap, TrendingUp, ShieldCheck, Database, Terminal, Activity, CheckCircle2, Award } from 'lucide-react';
import { AssetSymbol } from '../types/terminal';

export const SrbmprGiantPnlMasterDashboard: React.FC<{ selectedAsset?: AssetSymbol; livePrice?: number }> = ({
  selectedAsset = 'BTC/USDT',
  livePrice = 68720.00
}) => {
  const [activeStep, setActiveStep] = useState<number>(3);
  const [currentCapital, setCurrentCapital] = useState<number>(32.00); // Step 3 ($4 -> $8 -> $16 -> $32)
  const [livePnl, setLivePnl] = useState<number>(2.45);

  // 20 steps compounding model starting at $4
  const steps = Array.from({ length: 20 }, (_, i) => {
    const stepNum = i + 1;
    const capBefore = 4 * Math.pow(2, i);
    const capAfter = capBefore * 2;
    return {
      step: stepNum,
      capitalBefore: capBefore,
      capitalAfter: capAfter,
      status: stepNum < activeStep ? 'COMPLETED' : stepNum === activeStep ? 'ACTIVE_LIVE' : 'PENDING'
    };
  });

  return (
    <div className="w-full bg-[#010409] border-4 border-emerald-500 rounded-[36px] p-8 sm:p-12 font-mono text-white shadow-[0_0_160px_rgba(16,185,129,0.35)] space-y-8 my-4 relative overflow-hidden">
      
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* TOP HEADER */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-zinc-800 pb-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-black uppercase flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.4)] animate-pulse">
              <Zap className="w-4 h-4 text-emerald-400" />
              GIANT 20-SEQUENCE PNL MASTER DASHBOARD ($4 → $4.19M)
            </span>
            <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase rounded-xl">
              ACTIVE COIN: {selectedAsset}
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight italic text-white">
            SRBMPR REAL-TIME PNL & 20-STEP MASTER ENGINE
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-4xl">
            यह आपका पूर्ण और विशाल स्क्रीन डैशबोर्ड है जो केवल रीयल-टाइम PnL, वर्तमान कैपिटल प्रगति, और 20-ट्रेड सीक्वेंस को बड़े और स्पष्ट अक्षरों में दिखाता है। कोई अनावश्यक शोर नहीं, केवल शुद्ध परिणाम।
          </p>
        </div>

        <div className="bg-black/90 border-2 border-emerald-500/60 p-5 rounded-3xl text-center shrink-0 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
          <span className="text-[10px] text-zinc-400 font-bold uppercase block">LIVE MARKET PRICE</span>
          <span className="text-2xl font-black text-emerald-400 font-mono">${livePrice.toLocaleString()}</span>
        </div>
      </div>

      {/* GIANT PNL & CAPITAL DISPLAY (BIG NUMBERS) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-gradient-to-br from-emerald-950/50 via-black to-zinc-950 border-3 border-emerald-500 p-8 rounded-[32px] shadow-[0_0_50px_rgba(16,185,129,0.25)] space-y-3">
          <span className="text-xs text-emerald-400 font-black uppercase tracking-widest block">REAL-TIME ACTIVE PnL ($)</span>
          <div className="text-5xl sm:text-7xl font-black text-emerald-400 font-mono tracking-tighter animate-pulse">
            +${livePnl.toFixed(2)}
          </div>
          <span className="text-[10px] text-zinc-400 uppercase block font-bold">Step #{activeStep} Micro 1-Minute Trade Axis</span>
        </div>

        <div className="bg-zinc-950 border-2 border-zinc-800 p-8 rounded-[32px] space-y-3">
          <span className="text-xs text-amber-400 font-black uppercase tracking-widest block">CURRENT COMPOUNDED CAPITAL</span>
          <div className="text-4xl sm:text-6xl font-black text-white font-mono tracking-tighter">
            ${currentCapital.toFixed(2)}
          </div>
          <span className="text-[10px] text-zinc-400 uppercase block font-bold">Starting Base: $4.00 USD</span>
        </div>

        <div className="bg-zinc-950 border-2 border-zinc-800 p-8 rounded-[32px] space-y-3">
          <span className="text-xs text-cyan-400 font-black uppercase tracking-widest block">SEQUENCE PROGRESSION</span>
          <div className="text-4xl sm:text-6xl font-black text-cyan-400 font-mono tracking-tighter">
            {activeStep} / 20
          </div>
          <span className="text-[10px] text-zinc-400 uppercase block font-bold">Target Final: $4,194,304.00</span>
        </div>

      </div>

      {/* GIANT ACTIVE TRADE SPECIFICATION BOX */}
      <div className="bg-black border-2 border-emerald-500 p-6 sm:p-8 rounded-[32px] space-y-4 shadow-[0_0_40px_rgba(16,185,129,0.2)]">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <h3 className="text-sm sm:text-base font-black text-emerald-300 uppercase tracking-widest flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400 animate-pulse" />
            ACTIVE STEP #{activeStep} • ENTRY, SL, TARGET & EXECUTION STATE
          </h3>
          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-lg text-xs font-black uppercase">
            LIVE 1-MINUTE AXIS
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-base font-mono">
          <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-800">
            <span className="text-[11px] text-zinc-400 font-bold uppercase block mb-1">Entry Price</span>
            <span className="text-white font-black text-xl sm:text-2xl">${(livePrice * 0.999).toFixed(2)}</span>
          </div>
          <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-800">
            <span className="text-[11px] text-zinc-400 font-bold uppercase block mb-1">Stop Loss (SL)</span>
            <span className="text-rose-400 font-black text-xl sm:text-2xl">${(livePrice * 0.998).toFixed(2)}</span>
          </div>
          <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-800">
            <span className="text-[11px] text-zinc-400 font-bold uppercase block mb-1">Precision Target (1:1)</span>
            <span className="text-emerald-400 font-black text-xl sm:text-2xl">${(livePrice * 1.002).toFixed(2)}</span>
          </div>
          <div className="bg-zinc-950 p-5 rounded-2xl border border-zinc-800">
            <span className="text-[11px] text-zinc-400 font-bold uppercase block mb-1">Execution Status</span>
            <span className="text-amber-400 font-black text-lg uppercase animate-pulse">ACTIVE 1M SYNC</span>
          </div>
        </div>
      </div>

      {/* FULL 20-SEQUENCE STEPS GRID (BIG & CLEAR) */}
      <div className="bg-zinc-950 border-2 border-zinc-800 rounded-[32px] p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <h3 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Terminal className="w-5 h-5 text-emerald-400" />
            FULL 20-STEP COMPOUNDING SEQUENCE MASTER GRID (CLICK STEP TO SELECT)
          </h3>
          <span className="text-xs text-zinc-400 font-bold">Starting Capital: $4.00 USD</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
          {steps.map((s) => {
            const isSelected = s.step === activeStep;
            return (
              <div
                key={s.step}
                onClick={() => {
                  setActiveStep(s.step);
                  setCurrentCapital(s.capitalBefore);
                }}
                className={`cursor-pointer p-4 rounded-2xl border-2 transition-all font-mono space-y-2 ${
                  isSelected 
                    ? 'bg-emerald-950/60 border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.4)] scale-105' 
                    : s.step < activeStep 
                      ? 'bg-zinc-900/60 border-zinc-800 opacity-70' 
                      : 'bg-black/80 border-zinc-800 hover:border-zinc-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-emerald-400">STEP #{s.step}</span>
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${
                    isSelected ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-zinc-300'
                  }`}>
                    {isSelected ? 'ACTIVE' : s.step < activeStep ? 'DONE' : 'NEXT'}
                  </span>
                </div>
                <div className="space-y-0.5">
                  <div className="text-[10px] text-zinc-400">Start: ${s.capitalBefore.toLocaleString()}</div>
                  <div className="text-base font-black text-white">Target: ${s.capitalAfter.toLocaleString()}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
