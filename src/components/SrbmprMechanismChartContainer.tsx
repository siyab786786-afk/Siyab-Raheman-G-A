import React, { useState, useEffect } from 'react';
import { ExchangeId, AssetSymbol, Srbmpr2526LayerState, PendingOrder } from '../types/terminal';
import { SRBMPRMechanismEngine } from '../services/SRBMPRMechanismEngine';
import { Maximize2, Minimize2, ShieldCheck, Zap, Activity, TrendingUp, TrendingDown, Target, Droplets, ArrowRightLeft, CheckCircle2, XCircle } from 'lucide-react';

interface SrbmprMechanismChartContainerProps {
  exchange: ExchangeId;
  asset: AssetSymbol;
  layerState: Srbmpr2526LayerState;
  buyLiquidity: number;
  sellLiquidity: number;
  livePrice: number;
}

export const SrbmprMechanismChartContainer: React.FC<SrbmprMechanismChartContainerProps> = ({
  exchange,
  asset,
  layerState,
  buyLiquidity,
  sellLiquidity,
  livePrice,
}) => {
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [pendingOrders, setPendingOrders] = useState<PendingOrder[]>([]);
  const [activeStep, setActiveStep] = useState<number>(3);
  const [simulatedPnl, setSimulatedPnl] = useState<number>(0.34);

  const getDecimals = (sym: string) => (sym.includes('GOLD') || sym.includes('PAXG') ? 3 : 2);

  useEffect(() => {
    if (livePrice <= 0) return;
    setPendingOrders(prev => SRBMPRMechanismEngine.getInstance().processLivePrice(prev, livePrice));
  }, [livePrice]);

  const handleOrderConfirmed = (order: PendingOrder) => {
    setPendingOrders(prev => [order, ...prev]);
  };

  return (
    <div className={`bg-[#020408] border-2 border-emerald-500/80 rounded-3xl p-6 sm:p-8 shadow-[0_0_80px_rgba(16,185,129,0.2)] flex flex-col transition-all duration-500 relative overflow-hidden ${
      isFullscreen ? 'fixed inset-0 z-50 rounded-none h-screen w-screen' : 'h-[850px] lg:h-[940px]'
    }`}>
      
      {/* Dynamic Fluid Background Effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.05),transparent_70%)]" />
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" />
      </div>

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-6 pb-5 border-b border-white/10 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <Droplets className="w-7 h-7 animate-bounce duration-[3s]" />
          </div>
          <div>
            <h3 className="text-lg font-mono font-black text-white tracking-[0.2em] uppercase">
              SRBMPR REAL-TIME PNL & ORDER STATE TRACKER OVERLAY
            </h3>
            <div className="flex items-center gap-3 mt-1">
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                BYBIT V5 STREAM: {asset} • LIVE PRICE: ${livePrice.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl border border-white/10 transition-all group"
          >
            {isFullscreen ? <Minimize2 className="w-6 h-6" /> : <Maximize2 className="w-6 h-6 group-hover:scale-110 transition-transform" />}
          </button>
        </div>
      </div>

      {/* REAL-TIME PNL & ORDER STATE TRACKER OVERLAY ON THE CHART */}
      <div className="bg-black/90 border-2 border-emerald-500 p-4 sm:p-5 rounded-2xl mb-6 shadow-[0_0_30px_rgba(16,185,129,0.25)] relative z-20 font-mono">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5 mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-black text-emerald-300 uppercase tracking-wider">
              20-TRADE SEQUENCE ENGINE OVERLAY • STEP #{activeStep} OF 20
            </span>
          </div>
          <span className="text-[10px] text-zinc-400 font-bold">
            Single Coin Focus: <strong className="text-white">{asset}</strong>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          <div className="bg-zinc-950/90 border border-zinc-800 p-3 rounded-xl">
            <span className="text-[9px] text-zinc-400 font-bold uppercase block">Active Entry Price</span>
            <span className="text-white font-black font-mono text-sm">${(layerState?.entryPrice || livePrice * 0.999).toLocaleString(undefined, { minimumFractionDigits: getDecimals(asset) })}</span>
          </div>
          <div className="bg-zinc-950/90 border border-zinc-800 p-3 rounded-xl">
            <span className="text-[9px] text-zinc-400 font-bold uppercase block">Stop Loss (SL)</span>
            <span className="text-rose-400 font-black font-mono text-sm">${(layerState?.stopLoss || livePrice * 0.998).toLocaleString(undefined, { minimumFractionDigits: getDecimals(asset) })}</span>
          </div>
          <div className="bg-zinc-950/90 border border-zinc-800 p-3 rounded-xl">
            <span className="text-[9px] text-zinc-400 font-bold uppercase block">Target Objective</span>
            <span className="text-emerald-400 font-black font-mono text-sm">${(layerState?.targetPrice || livePrice * 1.002).toLocaleString(undefined, { minimumFractionDigits: getDecimals(asset) })}</span>
          </div>
          <div className="bg-zinc-950/90 border border-zinc-800 p-3 rounded-xl">
            <span className="text-[9px] text-zinc-400 font-bold uppercase block">Current PnL ($)</span>
            <span className="text-emerald-400 font-black font-mono text-sm animate-pulse">+${simulatedPnl.toFixed(2)}</span>
          </div>
          <div className="bg-zinc-950/90 border border-zinc-800 p-3 rounded-xl">
            <span className="text-[9px] text-zinc-400 font-bold uppercase block">Execution Status</span>
            <span className="text-amber-400 font-black uppercase text-xs">ACTIVE 1M SYNC</span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-8 relative z-10 min-h-0">
        
        {/* Left Side: Statistics & Visualization */}
        <div className="flex-1 flex flex-col gap-8 overflow-y-auto pr-2 scrollbar-none">
          
          {/* Availability Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            <div className="relative bg-zinc-900/40 border border-emerald-500/10 p-6 rounded-[28px] backdrop-blur-2xl flex flex-col items-center text-center">
              <TrendingUp className="w-8 h-8 text-emerald-500/40 mb-3" />
              <span className="text-emerald-500/40 text-[9px] font-mono font-black uppercase tracking-widest mb-2">Buy Liquidity</span>
              <div className="text-5xl font-black text-white font-mono tracking-tighter">{buyLiquidity.toFixed(1)}</div>
            </div>

            <div className="relative bg-zinc-900/40 border border-rose-500/10 p-6 rounded-[28px] backdrop-blur-2xl flex flex-col items-center text-center">
              <TrendingDown className="w-8 h-8 text-rose-500/40 mb-3" />
              <span className="text-rose-500/40 text-[9px] font-mono font-black uppercase tracking-widest mb-2">Sell Liquidity</span>
              <div className="text-5xl font-black text-white font-mono tracking-tighter">{sellLiquidity.toFixed(1)}</div>
            </div>
          </div>

          {/* Coordinates Card - Main Focus */}
          <div className="bg-[#05080f] border border-white/5 p-8 rounded-[32px] backdrop-blur-3xl shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center space-y-2">
                <span className="text-emerald-500/60 uppercase tracking-widest font-mono text-[9px] font-black">Target Objective</span>
                <div className="text-3xl font-black text-white font-mono">${layerState?.targetPrice?.toLocaleString() || '0.00'}</div>
              </div>
              <div className="text-center space-y-2 border-x border-white/5 px-4">
                <span className="text-blue-500/60 uppercase tracking-widest font-mono text-[9px] font-black">Frozen Entry Axis</span>
                <div className="text-4xl font-black text-blue-400 font-mono">${layerState?.midZone?.toLocaleString() || '0.00'}</div>
              </div>
              <div className="text-center space-y-2">
                <span className="text-rose-500/60 uppercase tracking-widest font-mono text-[9px] font-black">
                  0.10% DYNAMIC SL (±${(layerState?.slDistance || (layerState?.entryPrice ? layerState.entryPrice * 0.001 : 0)).toFixed(getDecimals(asset))})
                </span>
                <div className="text-3xl font-black text-white font-mono">${layerState?.stopLoss?.toLocaleString() || '0.00'}</div>
              </div>
            </div>
          </div>

          {/* Clean Active Node Overlay Grid (1:1 - 1:10) */}
          <div className="bg-zinc-900/40 border border-white/5 rounded-[32px] p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-blue-400" />
                <h4 className="text-xs font-black text-white uppercase tracking-[0.2em]">Active Structural Grid (1:1 - 1:10)</h4>
              </div>
              <div className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">
                 Asset: {asset}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
               {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((ratio) => {
                 const entry = layerState?.entryPrice || livePrice;
                 const slDist = (layerState?.slDistance || (entry * 0.001));
                 const target = entry + (slDist * ratio);
                 const isReached = livePrice >= target;
                 
                 return (
                   <div key={ratio} className={`p-4 rounded-2xl border transition-all ${
                     isReached 
                      ? 'bg-emerald-500/10 border-emerald-500/30' 
                      : 'bg-black/40 border-white/5'
                   }`}>
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-[10px] font-black ${isReached ? 'text-emerald-400' : 'text-zinc-600'}`}>1:{ratio}</span>
                        {isReached && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                      </div>
                      <div className={`text-sm font-bold font-mono ${isReached ? 'text-white' : 'text-zinc-400'}`}>
                        ${target.toLocaleString(undefined, { minimumFractionDigits: getDecimals(asset) })}
                      </div>
                   </div>
                 );
               })}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
