import React from 'react';
import { Srbmpr2526LayerState } from '../types/terminal';
import { Layers, Target, ShieldAlert, ArrowRight, Zap, CheckCircle, FileText, ShieldCheck } from 'lucide-react';

interface Srbmpr2526LayerModuleProps {
  layerState: Srbmpr2526LayerState;
  onOpenAuditReport?: () => void;
}

export const Srbmpr2526LayerModule: React.FC<Srbmpr2526LayerModuleProps> = ({ layerState, onOpenAuditReport }) => {
  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 shadow-2xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-zinc-900">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-amber-500" />
          <div>
            <h3 className="text-sm font-mono font-bold text-white tracking-wide">
              SRBMPR-25/26 MODEL SEQUENCE LAYER STATE MACHINE
            </h3>
            <p className="text-xs text-zinc-400 font-mono">
              Upper Wick Unit (W_ref) = 1.0 | Sequential Pipe State: 1:1 → 1:2 → 1:3
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs font-bold rounded-lg flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400 animate-bounce" /> Active State: {layerState.activeLayer}
          </span>
          {onOpenAuditReport && (
            <button
              onClick={onOpenAuditReport}
              className="px-3 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-mono text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-sm"
              title="Open 24-Hour Broker Growth & Proof Audit Report (Siyab Raheman & Raziya Raheman)"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span>24H BROKER AUDIT (PDF/PROOF)</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Layer 1:1 */}
        <div className={`p-4 rounded-xl border transition-all ${
          layerState.activeLayer === '1:1'
            ? 'bg-amber-500/10 border-amber-500/60 shadow-lg shadow-amber-500/10'
            : layerState.progress11 === 100
            ? 'bg-zinc-900/80 border-emerald-500/40'
            : 'bg-zinc-900/40 border-zinc-800'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold text-zinc-300">PIPE 1 = 1:1 PROJECTION</span>
            {layerState.progress11 === 100 ? (
              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> COMPLETE</span>
            ) : (
              <span className="text-[10px] font-mono text-amber-400 animate-pulse">ACTIVE</span>
            )}
          </div>
          <div className="text-lg font-mono font-bold text-white mb-1">${layerState.level1}</div>
          <div className="text-xs text-zinc-400 font-mono mb-3">1 × W_ref Unit from Anchor High</div>
          <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden border border-zinc-800">
            <div
              className="bg-amber-500 h-full transition-all duration-500"
              style={{ width: `${layerState.progress11}%` }}
            ></div>
          </div>
          <div className="text-[10px] font-mono text-right text-zinc-500 mt-1">{layerState.progress11}% Complete</div>
        </div>

        {/* Layer 1:2 */}
        <div className={`p-4 rounded-xl border transition-all ${
          layerState.activeLayer === '1:2'
            ? 'bg-amber-500/10 border-amber-500/60 shadow-lg shadow-amber-500/10'
            : layerState.progress12 === 100
            ? 'bg-zinc-900/80 border-emerald-500/40'
            : 'bg-zinc-900/40 border-zinc-800'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold text-zinc-300">PIPE 2 = 1:2 PROJECTION</span>
            {layerState.progress12 === 100 ? (
              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> COMPLETE</span>
            ) : layerState.activeLayer === '1:2' ? (
              <span className="text-[10px] font-mono text-amber-400 animate-pulse">ACTIVE NEXT</span>
            ) : (
              <span className="text-[10px] font-mono text-zinc-500">PENDING</span>
            )}
          </div>
          <div className="text-lg font-mono font-bold text-white mb-1">${layerState.level2}</div>
          <div className="text-xs text-zinc-400 font-mono mb-3">2 × W_ref Unit Projection</div>
          <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden border border-zinc-800">
            <div
              className="bg-amber-500 h-full transition-all duration-500"
              style={{ width: `${layerState.progress12}%` }}
            ></div>
          </div>
          <div className="text-[10px] font-mono text-right text-zinc-500 mt-1">{layerState.progress12}% Complete</div>
        </div>

        {/* Layer 1:3 */}
        <div className={`p-4 rounded-xl border transition-all ${
          layerState.activeLayer === '1:3' || layerState.activeLayer === 'COMPLETED'
            ? 'bg-amber-500/10 border-amber-500/60 shadow-lg shadow-amber-500/10'
            : 'bg-zinc-900/40 border-zinc-800'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold text-zinc-300">PIPE 3 = 1:3 TARGET</span>
            {layerState.activeLayer === 'COMPLETED' ? (
              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> CYCLE DONE</span>
            ) : layerState.activeLayer === '1:3' ? (
              <span className="text-[10px] font-mono text-amber-400 animate-pulse">FINAL STAGE</span>
            ) : (
              <span className="text-[10px] font-mono text-zinc-500">PENDING</span>
            )}
          </div>
          <div className="text-lg font-mono font-bold text-white mb-1">${layerState.level3}</div>
          <div className="text-xs text-zinc-400 font-mono mb-3">3 × W_ref Final Target Unit</div>
          <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden border border-zinc-800">
            <div
              className="bg-emerald-500 h-full transition-all duration-500"
              style={{ width: `${layerState.progress13}%` }}
            ></div>
          </div>
          <div className="text-[10px] font-mono text-right text-zinc-500 mt-1">{layerState.progress13}% Complete</div>
        </div>
      </div>

      {/* Entry Parameters & $1.00 Rule */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-zinc-900/50 p-3.5 rounded-xl border border-zinc-800 font-mono text-xs">
        <div>
          <div className="text-zinc-500 text-[10px]">UPPER WICK (W_ref)</div>
          <div className="text-white font-bold text-sm">${layerState.wRef}</div>
        </div>
        <div>
          <div className="text-zinc-500 text-[10px]">MID-ZONE ENTRY</div>
          <div className="text-amber-400 font-bold text-sm">${layerState.midZone}</div>
        </div>
        <div>
          <div className="text-zinc-500 text-[10px]">0.10% DYNAMIC ASSET STOP</div>
          <div className="text-rose-400 font-bold text-sm">
            ${layerState.stopLoss} <span className="text-[9px] text-zinc-500 font-normal font-mono">(±${layerState.slDistance || (layerState.entryPrice * 0.001).toFixed(2)})</span>
          </div>
        </div>
        <div>
          <div className="text-zinc-500 text-[10px]">TARGET (1:3)</div>
          <div className="text-emerald-400 font-bold text-sm">${layerState.targetPrice}</div>
        </div>
        <div>
          <div className="text-zinc-500 text-[10px]">RISK-REWARD</div>
          <div className="text-indigo-400 font-bold text-sm">1:{layerState.rrRatio}</div>
        </div>
      </div>
    </div>
  );
};
