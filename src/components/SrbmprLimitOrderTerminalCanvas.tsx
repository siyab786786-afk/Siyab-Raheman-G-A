import React, { useState } from 'react';
import { ExchangeId, AssetSymbol, Srbmpr2526LayerState, ScalpingContainer } from '../types/terminal';
import { SRBMPRMechanismEngine } from '../services/SRBMPRMechanismEngine';
import { 
  Terminal, ShieldCheck, Clock, Zap, Target, Lock, 
  ArrowRight, CheckCircle2, AlertCircle, RefreshCw, Layers, Bot, Sparkles 
} from 'lucide-react';
import { DeepResearcherRationalePanel } from './DeepResearcherRationalePanel';
import { DailyBrokerAuditReportModal } from './DailyBrokerAuditReportModal';

interface SrbmprLimitOrderTerminalCanvasProps {
  exchange: ExchangeId;
  asset: AssetSymbol;
  layerState: Srbmpr2526LayerState | null;
  livePrice: number;
}

export const SrbmprLimitOrderTerminalCanvas: React.FC<SrbmprLimitOrderTerminalCanvasProps> = ({
  exchange,
  asset,
  layerState,
  livePrice,
}) => {
  // Whether user explicitly staged or armed this detected limit ticket
  const [isArmed, setIsArmed] = useState<boolean>(false);
  const [selectedHorizon, setSelectedHorizon] = useState<ScalpingContainer>('1:5');
  const [isDeepResearcherOpen, setIsDeepResearcherOpen] = useState<boolean>(true);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);

  const isGold = asset.includes('GOLD') || asset.includes('PAXG');
  const decimals = isGold ? 3 : 2;
  const factor = 10 ** decimals;

  // Detection condition: A valid limit order opportunity exists if layerState is valid & price is within scanning threshold
  const hasValidSetup = Boolean(
    layerState && 
    layerState.entryPrice > 0 && 
    livePrice > 0 &&
    (layerState.status === 'CONFIRMED' || layerState.status === 'WAITING_TIME_CLOSE')
  );

  const limitEntry = layerState?.entryPrice || (livePrice > 0 ? livePrice : 84850.00);
  const slDistance = Math.round((limitEntry * 0.001) * factor) / factor;
  const structuralSL = Math.round((limitEntry - slDistance) * factor) / factor;
  
  const multiplier = selectedHorizon === '1:5' ? 5 : selectedHorizon === '1:10' ? 10 : 15;
  const targetPrice = Math.round((limitEntry + slDistance * multiplier) * factor) / factor;

  return (
    <div className="bg-[#030508] border border-white/5 rounded-[36px] p-6 lg:p-8 shadow-2xl relative overflow-hidden font-mono text-zinc-300">
      
      {/* Background ambient glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/[0.02] rounded-full blur-[120px] pointer-events-none" />

      {/* Terminal Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/5 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-black text-white uppercase tracking-[0.2em]">
                SRBMPR-25/26 — LIMIT ORDER TERMINAL
              </h3>
              <span className="px-2 py-0.5 rounded bg-zinc-900 border border-white/10 text-[9px] font-bold text-amber-400">
                CANVAS ENGINE
              </span>
            </div>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-0.5">
              Dark Mode Visual Space • Auto-Detecting 1:5 / 1:10 / 1:15 Structural Nodes • {exchange}
            </p>
          </div>
        </div>

        {/* Live Status indicator & Deep Researcher Toggle */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsAuditModalOpen(true)}
            className="px-3.5 py-1.5 rounded-full bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all shadow-sm"
            title="Generate 24-Hour Daily Broker Audit Report (PDF-Ready)"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>DAILY AUDIT REPORT</span>
          </button>

          <button
            onClick={() => setIsDeepResearcherOpen(!isDeepResearcherOpen)}
            className={`px-3.5 py-1.5 rounded-full border text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all shadow-sm ${
              isDeepResearcherOpen
                ? 'bg-blue-600 text-white border-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.35)]'
                : 'bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white border-white/10'
            }`}
            title="Toggle Deep Researcher Plain-Language Audit Rationale"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>DEEP RESEARCHER</span>
            <span className={`w-1.5 h-1.5 rounded-full ${isDeepResearcherOpen ? 'bg-white animate-pulse' : 'bg-zinc-500'}`} />
          </button>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-950 border border-white/10 text-[10px]">
            <span className={`w-2 h-2 rounded-full ${hasValidSetup ? 'bg-emerald-400 animate-ping' : 'bg-amber-400/80 animate-pulse'}`} />
            <span className="text-zinc-400 uppercase font-black">
              {hasValidSetup ? 'OPPORTUNITY DETECTED' : 'SCANNING LIVE MARKET'}
            </span>
          </div>
          <span className="text-zinc-600">|</span>
          <span className="text-[10px] text-zinc-400 font-bold">
            {asset}: <strong className="text-white">${livePrice.toLocaleString()}</strong>
          </span>
        </div>
      </div>

      {/* MAIN CANVAS BODY */}
      {!hasValidSetup ? (
        /* IDLE STATE: Pure, clean empty visual canvas */
        <div className="space-y-6">
          <div className="min-h-[260px] flex flex-col items-center justify-center text-center p-8 rounded-3xl bg-zinc-950/40 border border-dashed border-white/10 space-y-4">
            <div className="w-12 h-12 rounded-full bg-zinc-900/80 border border-white/5 flex items-center justify-center text-zinc-600">
              <RefreshCw className="w-5 h-5 animate-spin text-zinc-500" style={{ animationDuration: '4s' }} />
            </div>
            <div>
              <h4 className="text-sm font-black text-zinc-400 uppercase tracking-widest">
                No valid limit order active — scanning live data
              </h4>
              <p className="text-[11px] text-zinc-600 font-medium max-w-md mx-auto mt-1.5 leading-relaxed">
                Waiting for high-conviction multi-timezone structural confirmation. The canvas will automatically illuminate when a 1:5, 1:10, or 1:15 limit node is validated.
              </p>
            </div>
            <div className="flex items-center gap-2 text-[9px] text-zinc-700 uppercase font-black tracking-widest pt-2">
              <span>• 1m Anchor</span>
              <span>• 5m Higher-Low</span>
              <span>• 15m Parent</span>
              <span>• 0.10% SL Protected</span>
            </div>
          </div>

          {/* Deep Researcher Mode (Controller viewable upon toggle) */}
          {isDeepResearcherOpen && (
            <div className="pt-2 animate-in fade-in">
              <DeepResearcherRationalePanel
                asset={asset}
                exchange={exchange}
                limitEntry={limitEntry}
                structuralSL={structuralSL}
                slDistance={slDistance}
                targetPrice={targetPrice}
                horizon={selectedHorizon}
                livePrice={livePrice}
              />
            </div>
          )}
        </div>
      ) : (
        /* ACTIVE OPPORTUNITY DETECTED: Minimal, sleek limit-order ticket */
        <div className="p-6 lg:p-8 rounded-3xl bg-gradient-to-br from-zinc-950 via-[#050811] to-black border border-amber-500/30 shadow-[0_0_30px_rgba(245,158,11,0.05)] space-y-6 animate-in fade-in">
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-5">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                VALID LIMIT SEAT IDENTIFIED
              </span>
              <span className="text-xs text-zinc-400 font-bold uppercase">
                {asset} • Multi-Timezone Continuum Pass
              </span>
            </div>

            {/* Horizon Horizon Switcher */}
            <div className="flex items-center gap-1.5 bg-black/60 p-1 rounded-xl border border-white/10">
              {(['1:5', '1:10', '1:15'] as ScalpingContainer[]).map((hz) => (
                <button
                  key={hz}
                  onClick={() => setSelectedHorizon(hz)}
                  className={`px-3 py-1 rounded-lg text-xs font-black transition-all ${
                    selectedHorizon === hz
                      ? 'bg-amber-500 text-black shadow-sm'
                      : 'text-zinc-500 hover:text-white'
                  }`}
                >
                  {hz}
                </button>
              ))}
            </div>
          </div>

          {/* Minimal 3-Point Coordinates Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* Frozen Limit Entry */}
            <div className="p-5 rounded-2xl bg-zinc-950 border border-amber-500/20 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-black flex items-center gap-1">
                  <Lock className="w-3 h-3 text-amber-400" /> FROZEN LIMIT SEAT
                </span>
                <span className="text-[9px] text-amber-400 font-bold">EXACT ENTRY</span>
              </div>
              <div className="text-2xl lg:text-3xl font-black text-white font-mono tabular-nums">
                ${limitEntry.toLocaleString()}
              </div>
              <div className="text-[9px] text-zinc-500">
                Distance: <strong className="text-zinc-300">${Math.abs(livePrice - limitEntry).toFixed(decimals)}</strong>
              </div>
            </div>

            {/* 0.10% Hard Structural Stop */}
            <div className="p-5 rounded-2xl bg-zinc-950 border border-rose-500/20 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-rose-500/80 uppercase tracking-widest font-black flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-rose-400" /> 0.10% HARD SL
                </span>
                <span className="text-[9px] text-zinc-500">±${slDistance} space</span>
              </div>
              <div className="text-2xl lg:text-3xl font-black text-rose-400 font-mono tabular-nums">
                ${structuralSL.toLocaleString()}
              </div>
              <div className="text-[9px] text-zinc-500">
                Anchored behind 5m structural support floor
              </div>
            </div>

            {/* Horizon Objective */}
            <div className="p-5 rounded-2xl bg-zinc-950 border border-emerald-500/20 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-emerald-500/80 uppercase tracking-widest font-black flex items-center gap-1">
                  <Target className="w-3 h-3 text-emerald-400" /> {selectedHorizon} OBJECTIVE
                </span>
                <span className="text-[9px] text-emerald-400 font-bold">PROJECTION</span>
              </div>
              <div className="text-2xl lg:text-3xl font-black text-emerald-400 font-mono tabular-nums">
                ${targetPrice.toLocaleString()}
              </div>
              <div className="text-[9px] text-zinc-500">
                Potential: +${Math.round(slDistance * multiplier * factor) / factor} ({selectedHorizon} RR)
              </div>
            </div>

          </div>

          {/* Bottom Execution Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-white/5 text-[11px]">
            <div className="flex items-center gap-2 text-zinc-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>
                Verified Node: <strong>LIMIT ORDER ONLY</strong> (Zero market slippage guaranteed)
              </span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {isArmed ? (
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-400 font-black text-xs uppercase">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>ARMED IN WAITING ZONE</span>
                </div>
              ) : (
                <button
                  onClick={() => setIsArmed(true)}
                  className="w-full sm:w-auto px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.25)] flex items-center justify-center gap-2"
                >
                  <span>ARM THIS LIMIT SEAT</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Deep Researcher Plain-Language Multilingual Rationale Controller */}
          {isDeepResearcherOpen && (
            <div className="pt-2 animate-in fade-in">
              <DeepResearcherRationalePanel
                asset={asset}
                exchange={exchange}
                limitEntry={limitEntry}
                structuralSL={structuralSL}
                slDistance={slDistance}
                targetPrice={targetPrice}
                horizon={selectedHorizon}
                livePrice={livePrice}
              />
            </div>
          )}

        </div>
      )}

      {/* 24-Hour Daily Broker Audit Report Modal */}
      <DailyBrokerAuditReportModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        auditSummary={SRBMPRMechanismEngine.getInstance().generate24HourBrokerAuditReport(exchange, asset)}
      />

    </div>
  );
};
