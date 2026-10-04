import React, { useState, useEffect } from 'react';
import { AssetSymbol, Srbmpr2526LayerState, PendingOrder, ExchangeId } from '../types/terminal';
import { Zap, ShieldCheck, CheckCircle2, XCircle, AlertTriangle, Lock, ShieldAlert, Activity } from 'lucide-react';

interface LimitOrderExecutionProps {
  asset: AssetSymbol;
  exchange: ExchangeId;
  layerState: Srbmpr2526LayerState | null;
  livePrice: number;
  onOrderConfirmed: (order: PendingOrder) => void;
}

export const LimitOrderExecution: React.FC<LimitOrderExecutionProps> = ({
  asset,
  exchange,
  layerState,
  livePrice,
  onOrderConfirmed,
}) => {
  const [orderPrice, setOrderPrice] = useState<string>('');
  const [orderQty, setOrderQuantity] = useState<string>('');
  const [orderSL, setOrderSL] = useState<string>('');
  const [orderTarget, setOrderTarget] = useState<string>('');
  const [draftOrder, setDraftOrder] = useState<PendingOrder | null>(null);

  const getDecimals = (sym: string) => (sym.includes('GOLD') || sym.includes('PAXG') ? 3 : 2);

  const calculateDynamicSL = (entry: number, type: 'BUY' | 'SELL', sym: string) => {
    const dec = getDecimals(sym);
    const factor = 10 ** dec;
    const slDist = Math.round((entry * 0.001) * factor) / factor;
    const rawSL = type === 'BUY' ? entry - slDist : entry + slDist;
    const sl = Math.round(rawSL * factor) / factor;
    return {
      slDistance: slDist,
      sl
    };
  };

  // Automatically sync entry price from layerState if not manually edited
  useEffect(() => {
    if (layerState?.entryPrice) {
      const price = layerState.entryPrice;
      const { sl } = calculateDynamicSL(price, 'BUY', asset);
      setOrderPrice(price.toString());
      setOrderSL(sl.toString());
      setOrderTarget(layerState.targetPrice.toString());
    }
  }, [layerState?.entryPrice, layerState?.targetPrice, asset]);

  const initiateOrder = (type: 'BUY' | 'SELL') => {
    const price = parseFloat(orderPrice);
    const qty = parseFloat(orderQty);
    let sl = parseFloat(orderSL);
    const target = parseFloat(orderTarget);

    if (isNaN(price) || isNaN(qty) || qty <= 0 || isNaN(sl) || isNaN(target)) {
      alert('INVALID INPUT COORDINATES - ALL FIELDS REQUIRED FOR LIMIT NODE');
      return;
    }

    // Force Dynamic 0.10% SL Policy Enforcement
    const { slDistance: requiredDist, sl: requiredSL } = calculateDynamicSL(price, type, asset);
    const tolerance = getDecimals(asset) === 3 ? 0.005 : 0.05;
    
    if (Math.abs(sl - requiredSL) > tolerance) {
      // Strictly enforce policy
      sl = requiredSL;
    }

    const now = Date.now();
    const newDraft: PendingOrder = {
      id: `NODE-${Math.random().toString(36).substring(7).toUpperCase()}`,
      type,
      price,
      quantity: qty,
      slPercent: 0.1,
      slDistance: requiredDist,
      sl,
      target: Number(target.toFixed(getDecimals(asset))),
      status: 'PENDING_LIMIT',
      confirmed: false,
      timeframe: '15M', // Default to 15M structure as per SRBMPR standard
      createdAt: now,
      expiresAt: now + 15 * 60 * 1000,
      fillPrice: null,
      frozen: true
    };

    setDraftOrder(newDraft);
  };

  const confirmExecution = () => {
    if (draftOrder) {
      onOrderConfirmed({ ...draftOrder, confirmed: true });
      setDraftOrder(null);
      setOrderQuantity('');
    }
  };

  const calculatedRR = React.useMemo(() => {
    const price = parseFloat(orderPrice);
    const target = parseFloat(orderTarget);
    const sl = parseFloat(orderSL);
    if (!price || !target || !sl || price === sl) return null;
    const risk = Math.abs(price - sl);
    const reward = Math.abs(target - price);
    return (reward / risk).toFixed(1);
  }, [orderPrice, orderTarget, orderSL]);

  const isTooClose = React.useMemo(() => {
    const price = parseFloat(orderPrice);
    if (!price || !livePrice) return false;
    const diff = Math.abs(price - livePrice);
    return diff < (livePrice * 0.0002); // Within 0.02% of live price
  }, [orderPrice, livePrice]);

  const nodeFingerprint = React.useMemo(() => {
    return `SR-${Math.random().toString(36).substring(2, 7).toUpperCase()}-${Date.now().toString().slice(-4)}`;
  }, [draftOrder]);

  return (
    <div className="w-full lg:w-96 bg-[#05080f] border border-white/10 rounded-[32px] p-6 shadow-2xl flex flex-col relative overflow-hidden h-full">
      
      {/* Confirmation Overlay - Manual Visual Confirmation Step */}
      {draftOrder && (
        <div className="absolute inset-0 z-30 bg-zinc-950/98 backdrop-blur-2xl p-8 flex flex-col justify-center items-center text-center space-y-6 animate-in fade-in zoom-in duration-300">
           <div className="w-16 h-16 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center">
              <Lock className="w-8 h-8 text-blue-400" />
           </div>
           <div className="space-y-2">
              <h4 className="text-sm font-black text-white uppercase tracking-widest italic">Node Integrity Verification</h4>
              <div className="text-[10px] text-blue-400 font-black font-mono bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                PROTOCOL_ID: {nodeFingerprint}
              </div>
           </div>

           <div className="w-full bg-black/60 border border-white/5 rounded-2xl p-5 space-y-3 font-mono text-[10px]">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-zinc-500">ENGINE STATE</span>
                <span className="text-amber-500 font-black">LIMIT_NODE_PENDING</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-zinc-500">FROZEN ENTRY</span>
                <span className="text-white font-bold">${draftOrder.price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-zinc-500 italic">0.10% SL (POLICY)</span>
                <span className="text-rose-400 font-bold">${draftOrder.sl.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">OBJECTIVE</span>
                <span className="text-emerald-400 font-bold">${draftOrder.target.toLocaleString()}</span>
              </div>
           </div>

           <div className="w-full grid grid-cols-2 gap-4">
              <button 
                onClick={() => setDraftOrder(null)}
                className="py-3.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-500 rounded-2xl font-black text-[10px] uppercase transition-all border border-white/5"
              >
                DISCARD
              </button>
              <button 
                onClick={confirmExecution}
                className="py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-[10px] uppercase shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>CONFIRM_NODE</span>
              </button>
           </div>
           
           <p className="text-[8px] text-zinc-600 font-black uppercase tracking-[0.2em] pt-2">
             By confirming, you verify this is a PURE LIMIT order.
           </p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
         <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
              <Zap className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <h4 className="text-xs font-black text-white uppercase tracking-widest">Limit Order Node</h4>
              <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-tighter italic">SRBMPR V26 Pro • Manual Execution</p>
            </div>
         </div>
         <div className="flex items-center gap-2">
            {calculatedRR && (
              <div className="px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                <span className="text-[8px] text-emerald-400 font-black uppercase">RR 1:{calculatedRR}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 px-2 py-1 bg-zinc-900 border border-white/10 rounded-lg">
              <span className="text-[8px] text-zinc-400 font-black">PENDING</span>
            </div>
         </div>
      </div>

      <div className="space-y-5 flex-1 overflow-y-auto pr-1 scrollbar-none">
        {/* Manual Inputs */}
        <div className="space-y-2">
           <label className="text-[9px] text-zinc-500 font-black uppercase tracking-widest ml-1">Limit Entry Axis</label>
           <div className="relative group">
              <input 
                type="number" 
                value={orderPrice}
                onChange={(e) => setOrderPrice(e.target.value)}
                className={`w-full bg-zinc-950 border rounded-2xl px-5 py-4 text-base text-white font-mono focus:outline-none transition-all placeholder-zinc-800 ${
                  isTooClose ? 'border-amber-500/40 focus:border-amber-500' : 'border-white/5 focus:border-blue-500/50'
                }`}
                placeholder="0.00"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-zinc-600 font-bold uppercase tracking-widest">USD</div>
           </div>
           {isTooClose && (
             <div className="flex items-center gap-1.5 text-[9px] text-amber-500 font-black uppercase tracking-tighter animate-pulse ml-1">
               <AlertTriangle className="w-3 h-3" /> SLIPPAGE_RISK: LIMIT_SEAT_REQUIRED
             </div>
           )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[9px] text-zinc-500 font-black uppercase tracking-widest ml-1 flex items-center gap-1.5">
              <ShieldAlert className="w-3 h-3 text-rose-500" /> Manual SL
            </label>
            <div className="relative">
              <input 
                type="number" 
                value={orderSL}
                onChange={(e) => setOrderSL(e.target.value)}
                className="w-full bg-zinc-950 border border-rose-500/20 rounded-2xl px-4 py-3 text-sm text-rose-400 font-mono focus:outline-none focus:border-rose-500/50 transition-all placeholder-zinc-800"
                placeholder="0.00"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[9px] text-zinc-500 font-black uppercase tracking-widest ml-1">Manual Target</label>
            <div className="relative">
              <input 
                type="number" 
                value={orderTarget}
                onChange={(e) => setOrderTarget(e.target.value)}
                className="w-full bg-zinc-950 border border-emerald-500/20 rounded-2xl px-4 py-3 text-sm text-emerald-400 font-mono focus:outline-none focus:border-emerald-500/50 transition-all placeholder-zinc-800"
                placeholder="0.00"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
           <label className="text-[9px] text-zinc-500 font-black uppercase tracking-widest ml-1">Behavioral Units</label>
           <div className="relative">
              <input 
                type="number" 
                value={orderQty}
                onChange={(e) => setOrderQuantity(e.target.value)}
                className="w-full bg-zinc-950 border border-white/5 rounded-2xl px-5 py-4 text-base text-white font-mono focus:outline-none focus:border-blue-500/50 transition-all placeholder-zinc-800"
                placeholder="0.00"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-zinc-600 font-bold italic uppercase tracking-widest">{asset.split('/')[0]}</div>
           </div>
        </div>

        {/* Policy Summary */}
        <div className="p-4 bg-zinc-950/60 border border-white/5 rounded-2xl space-y-3">
           <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-tighter">
             <span className="text-zinc-600 flex items-center gap-1.5"><ShieldCheck className="w-3 h-3 text-blue-500" /> Node Verification</span>
             <span className="text-emerald-400 font-mono">0.10% SL Mandatory</span>
           </div>
           
           {orderPrice && parseFloat(orderPrice) > 0 ? (
             <div className="space-y-2">
               <div className="text-[9px] text-zinc-500 font-mono flex justify-between">
                  <span>Policy Distance:</span> 
                  <span className="text-amber-400 font-bold">±${((parseFloat(orderPrice) || 0) * 0.001).toFixed(getDecimals(asset))}</span>
               </div>
               <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 w-full animate-pulse" />
               </div>
               <div className="text-[8px] text-zinc-700 font-black uppercase tracking-widest flex items-center gap-2">
                  <Activity className="w-3 h-3" /> MARKET_ORDERS_FORBIDDEN
               </div>
             </div>
           ) : (
             <div className="text-[9px] text-zinc-700 italic text-center py-2 uppercase tracking-widest">
               Enter coordinates to sync protocol
             </div>
           )}
        </div>
      </div>

      {/* Initiation Buttons */}
      <div className="grid grid-cols-2 gap-4 mt-6">
        <button 
          onClick={() => initiateOrder('BUY')}
          className="py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] active:scale-95 flex flex-col items-center gap-1"
        >
          <span>BUY LIMIT</span>
          <span className="text-[7px] opacity-60">PENDING_WAITING</span>
        </button>
        <button 
          onClick={() => initiateOrder('SELL')}
          className="py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(244,63,94,0.2)] active:scale-95 flex flex-col items-center gap-1"
        >
          <span>SELL LIMIT</span>
          <span className="text-[7px] opacity-60">PENDING_WAITING</span>
        </button>
      </div>
      
      <div className="mt-4 text-center">
         <div className="flex items-center justify-center gap-3 text-[9px] text-zinc-700 font-black uppercase tracking-[0.3em]">
            <span>NODE ONLY</span>
            <div className="w-1 h-1 rounded-full bg-zinc-800" />
            <span>NO MARKET</span>
            <div className="w-1 h-1 rounded-full bg-zinc-800" />
            <span>STRICT 0.1%</span>
         </div>
      </div>
    </div>
  );
};
