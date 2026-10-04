import React, { useState } from 'react';
import { Layers, ShieldCheck, Zap, TrendingUp, Lock, ArrowUpRight, AlertTriangle } from 'lucide-react';
import { LeverageProgressionEngine, LeverageLevelState } from '../services/LeverageProgressionEngine';
import { AssetSymbol } from '../types/terminal';

interface Props {
  activeAsset?: AssetSymbol;
  livePrice?: number;
}

export const LeverageProgressionTracker: React.FC<Props> = ({
  activeAsset = 'BTC/USDT',
  livePrice = 65280
}) => {
  const engine = LeverageProgressionEngine.getInstance();
  const [currentLevel, setCurrentLevel] = useState<number>(2);
  const baseEntry = 65000;
  const baseSize = 0.5;
  const targetPrice = 72000;

  const levels = engine.calculateProgression(livePrice, baseEntry, baseSize, targetPrice, currentLevel);
  const activeState = levels.find(l => l.level === currentLevel) || levels[0];

  return (
    <div className="bg-gradient-to-b from-zinc-950 via-black to-zinc-950 border-2 border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_60px_rgba(6,182,212,0.15)] font-mono text-xs space-y-6">
      
      {/* Header */}
      <div className="border-b border-zinc-800 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Layers className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
              SRBMPR LEVERAGE-BASED PROTECTIVE STOP & PROGRESSION MODEL
            </h2>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Sequence Advances → Leverage Advances → Protective Stop Advances (No Traditional Trailing Stop)
            </p>
          </div>
        </div>

        {/* Level Controls */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-zinc-500 uppercase font-black">Active Sequence Level:</span>
          <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800">
            {[1, 2, 3, 4, 5, 6].map(lvl => (
              <button
                key={lvl}
                onClick={() => setCurrentLevel(lvl)}
                className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${
                  currentLevel === lvl
                    ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {lvl}×</button>
            ))}
          </div>
        </div>
      </div>

      {/* Advisory Banner */}
      <div className="p-4 bg-cyan-950/20 border border-cyan-500/30 rounded-2xl text-cyan-300 text-[11px] flex items-center gap-3">
        <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0" />
        <div>
          <strong className="text-white uppercase font-bold">Capital Protection + Progressive Deployment:</strong> Stop-loss is calculated dynamically from position size and actual SL price distance (Position Size × Distance = Dollar Risk). As the SRBMPR sequence advances to the next leverage level, the protective stop structure advances to lock in profits.
        </div>
      </div>

      {/* Active Level Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-black border border-zinc-800 p-4 rounded-2xl space-y-1">
          <span className="text-[10px] text-zinc-500 font-bold uppercase">Current Leverage Level</span>
          <div className="text-2xl font-black text-cyan-400">{activeState.leverageMultiplier}×</div>
          <span className="text-[9px] text-zinc-600 font-bold">Active SRBMPR Stage</span>
        </div>

        <div className="bg-black border border-zinc-800 p-4 rounded-2xl space-y-1">
          <span className="text-[10px] text-zinc-500 font-bold uppercase">Position Size</span>
          <div className="text-xl font-black text-white">{activeState.positionSize} units</div>
          <span className="text-[9px] text-zinc-600 font-bold">Accumulated Position</span>
        </div>

        <div className="bg-black border border-rose-900/50 p-4 rounded-2xl space-y-1">
          <span className="text-[10px] text-rose-400/80 font-bold uppercase">Protective SL / Dollar Risk</span>
          <div className="text-xl font-black text-rose-400">${activeState.actualDollarRiskAtSl.toLocaleString()}</div>
          <span className="text-[9px] text-rose-500 font-bold">SL Price: ${activeState.protectiveSlPrice}</span>
        </div>

        <div className="bg-black border border-emerald-500/30 p-4 rounded-2xl space-y-1">
          <span className="text-[10px] text-emerald-400/80 font-bold uppercase">Protected Profit / Target</span>
          <div className="text-xl font-black text-emerald-400">${activeState.protectedProfit.toLocaleString()}</div>
          <span className="text-[9px] text-emerald-500 font-bold">Target: ${activeState.targetPrice}</span>
        </div>
      </div>

      {/* 6-Level Progression Table */}
      <div className="bg-black border border-zinc-800 rounded-2xl overflow-hidden">
        <div className="p-4 bg-zinc-950 border-b border-zinc-800 text-xs font-black text-zinc-300 uppercase tracking-wider flex items-center justify-between">
          <span>SRBMPR 6-Stage Leverage Progression Architecture</span>
          <span className="text-[10px] text-cyan-400 font-bold">Asset: {activeAsset}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-900 bg-zinc-950/50 text-zinc-500 text-[10px] uppercase font-black">
                <th className="py-3 px-4">Stage Level</th>
                <th className="py-3 px-4">Leverage</th>
                <th className="py-3 px-4">Entry Axis</th>
                <th className="py-3 px-4">Position Size</th>
                <th className="py-3 px-4">Protective SL</th>
                <th className="py-3 px-4">Actual SL Loss ($)</th>
                <th className="py-3 px-4">Protected Profit</th>
                <th className="py-3 px-4 text-right">Sequence Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900 text-[11px]">
              {levels.map(lvl => (
                <tr key={lvl.level} className={`hover:bg-zinc-950 transition-colors ${lvl.level === currentLevel ? 'bg-cyan-950/10 border-l-2 border-cyan-400' : ''}`}>
                  <td className="py-3 px-4 font-black text-white">LEVEL {lvl.level}</td>
                  <td className="py-3 px-4 font-black text-cyan-400">{lvl.leverageMultiplier}×</td>
                  <td className="py-3 px-4 font-mono text-white">${lvl.entryPrice.toLocaleString()}</td>
                  <td className="py-3 px-4 font-mono text-zinc-300">{lvl.positionSize}</td>
                  <td className="py-3 px-4 font-mono text-rose-400">${lvl.protectiveSlPrice.toLocaleString()}</td>
                  <td className="py-3 px-4 font-mono font-bold text-rose-300">${lvl.actualDollarRiskAtSl.toLocaleString()}</td>
                  <td className="py-3 px-4 font-mono font-bold text-emerald-400">${lvl.protectedProfit.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right">
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase ${
                      lvl.status === 'ACTIVE' 
                        ? 'bg-cyan-500 text-black shadow-[0_0_10px_rgba(6,182,212,0.4)]' 
                        : lvl.status === 'ADVANCED' 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                        : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
                    }`}>
                      {lvl.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
