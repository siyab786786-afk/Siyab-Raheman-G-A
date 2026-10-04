import React, { useState, useEffect } from 'react';
import { ExchangeId, AssetSymbol, Srbmpr2526LayerState, PendingOrder } from '../types/terminal';
import { SRBMPRMechanismEngine } from '../services/SRBMPRMechanismEngine';
import { Maximize2, Minimize2, ShieldCheck, Zap, Activity, TrendingUp, TrendingDown, Target, Droplets, ArrowRightLeft, CheckCircle2, XCircle } from 'lucide-react';

import { LimitOrderExecution } from './LimitOrderExecution';

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

  const getDecimals = (sym: string) => (sym.includes('GOLD') || sym.includes('PAXG') ? 3 : 2);

  // Order fill & SL logic for frozen limit orders via SRBMPRMechanismEngine
  // Under no circumstance is the frozen SL recalculated or shifted on live ticks!
  useEffect(() => {
    if (livePrice <= 0) return;
    setPendingOrders(prev => SRBMPRMechanismEngine.getInstance().processLivePrice(prev, livePrice));
  }, [livePrice]);

  const handleOrderConfirmed = (order: PendingOrder) => {
    setPendingOrders(prev => [order, ...prev]);
  };

  const cancelOrder = (id: string) => {
    setPendingOrders(prev => prev.filter(o => o.id !== id));
  };

  return (
    <div className={`bg-[#020408] border border-zinc-800 rounded-3xl p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col transition-all duration-500 relative overflow-hidden ${
      isFullscreen ? 'fixed inset-0 z-50 rounded-none h-screen w-screen' : 'h-[850px] lg:h-[920px]'
    }`}>
      
      {/* Dynamic Fluid "Water" Background Effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,123,255,0.05),transparent_70%)]" />
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-blue-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse duration-[12s]" />
      </div>

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8 pb-6 border-b border-white/5 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-[0_0_20px_rgba(59,130,246,0.2)]">
            <Droplets className="w-7 h-7 animate-bounce duration-[3s]" />
          </div>
          <div>
            <h3 className="text-lg font-mono font-black text-white tracking-[0.2em] uppercase">
              SRBMPR QUANTITATIVE LIQUIDITY VAULT
            </h3>
            <div className="flex items-center gap-3 mt-1">
              <span className="flex items-center gap-1.5 text-xs text-blue-400/80 font-mono font-bold">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                BYBIT V5 STREAM: {asset}
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

          {/* Behavioral Execution Log (Excel-like) */}
          <div className="bg-zinc-900/20 border border-white/5 rounded-[32px] p-6 flex-1 min-h-0 flex flex-col">
            <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <ArrowRightLeft className="w-5 h-5 text-blue-400" />
                <h4 className="text-xs font-black text-white uppercase tracking-[0.2em]">Behavioral Execution Log</h4>
              </div>
              <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
                 <span className="text-emerald-500">Filled: {pendingOrders.filter(o => o.status === 'FILLED').length}</span>
                 <span className="text-amber-500">Pending: {pendingOrders.filter(o => o.status === 'PENDING_LIMIT').length}</span>
              </div>
            </div>

            <div className="flex-1 overflow-auto scrollbar-none">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-[9px] text-zinc-500 font-black uppercase tracking-widest">
                    <th className="pb-3 pl-2">ID/Timeframe</th>
                    <th className="pb-3">Type</th>
                    <th className="pb-3">Frozen Entry</th>
                    <th className="pb-3 text-rose-500/60 italic">0.10% SL Space & Floor</th>
                    <th className="pb-3 text-emerald-500/60">Target Objective</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 pr-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="text-[10px] font-mono">
                  {pendingOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-20 text-center text-zinc-700 italic tracking-[0.2em] uppercase">
                         Zero Active Execution Nodes Detected
                      </td>
                    </tr>
                  ) : (
                    pendingOrders.map(order => (
                      <tr key={order.id} className={`border-b border-white/[0.03] group hover:bg-white/[0.02] transition-colors ${order.status === 'FILLED' ? 'bg-emerald-500/5' : order.status === 'SL_HIT' ? 'bg-rose-500/5' : ''}`}>
                        <td className="py-4 pl-2">
                           <div className="flex flex-col">
                              <span className="text-white font-bold">{order.id}</span>
                              <span className="text-[8px] text-zinc-600 font-black uppercase tracking-tighter">{order.timeframe} Structure</span>
                           </div>
                        </td>
                        <td className="py-4">
                           <span className={`px-2 py-0.5 rounded-md font-black text-[9px] ${order.type === 'BUY' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                             {order.type}
                           </span>
                        </td>
                        <td className="py-4 text-white font-bold">${order.price.toLocaleString()}</td>
                        <td className="py-4 text-rose-400 font-bold">
                          ${order.sl.toLocaleString()} 
                          <span className="text-[8px] text-zinc-500 ml-1.5 font-normal">(±${order.slDistance?.toFixed(getDecimals(asset))})</span>
                        </td>
                        <td className="py-4 text-emerald-500 font-bold">${order.target.toLocaleString()}</td>
                        <td className="py-4">
                           <div className="flex items-center gap-2">
                              {order.status === 'PENDING_LIMIT' ? (
                                <>
                                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                  <span className="text-amber-500 font-black uppercase italic text-[9px]">PENDING_LIMIT</span>
                                </>
                              ) : order.status === 'FILLED' ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                  <span className="text-emerald-400 font-black uppercase text-[9px]">Filled @ ${order.fillPrice?.toLocaleString()}</span>
                                </>
                              ) : order.status === 'SL_HIT' ? (
                                <>
                                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                  <span className="text-rose-400 font-black uppercase text-[9px]">SL Hit</span>
                                </>
                              ) : (
                                <span className="text-zinc-500 font-black uppercase text-[9px]">{order.status}</span>
                              )}
                           </div>
                        </td>
                        <td className="py-4 pr-2 text-right">
                           {order.status === 'PENDING_LIMIT' && (
                             <button 
                               onClick={() => cancelOrder(order.id)}
                               className="p-1.5 hover:bg-rose-500/20 text-zinc-600 hover:text-rose-400 rounded-lg transition-all"
                               title="Cancel Node"
                             >
                               <XCircle className="w-4 h-4" />
                             </button>
                           )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Side: Dedicated Limit Order Execution Component */}
        <LimitOrderExecution 
          asset={asset}
          exchange={exchange}
          layerState={layerState}
          livePrice={livePrice}
          onOrderConfirmed={handleOrderConfirmed}
        />

      </div>

      {/* Numerical Infrastructure Footer */}
      <div className="mt-8 pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-6 relative z-10">
        <div className="flex items-center gap-8 font-mono text-[9px] font-bold text-zinc-500 uppercase tracking-widest">
           <div className="flex items-center gap-2 group">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
             FTMO RISK INTEGRITY: 100%
           </div>
           <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
             ENGINE: SRBMPR-25/26 PRO
           </div>
           <div className="flex items-center gap-2">
             <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
             STATUS: PURE DATA SYNC
           </div>
        </div>
        <div className="text-zinc-600 font-mono text-[8px] uppercase tracking-[0.4em] font-black text-center sm:text-right">
          V26 CORE • REAL-TIME NODE SYNC • ZERO NOISE
        </div>
      </div>

    </div>
  );
};
