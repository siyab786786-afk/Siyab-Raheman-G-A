import React, { useState } from 'react';
import {
  X,
  Zap,
  ShieldCheck,
  CheckCircle2,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  Calculator,
  Lock,
  Layers,
  Clock
} from 'lucide-react';
import { AssetInstrument } from './SrbmprForwardTestOnlyChart';

export interface LimitOrderNode {
  id: string;
  symbol: string;
  side: 'BUY_LIMIT' | 'SELL_LIMIT';
  price: number;
  sl: number;
  tp1to10: number;
  tp1to20: number;
  qty: number;
  riskUsd: number;
  status: 'PENDING_AT_NODE' | 'TRIGGERED' | 'CANCELLED';
  createdAt: string;
}

interface SrbmprLimitOrderDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeAsset: AssetInstrument;
  livePrice: number;
  timeframe: string;
}

export const SrbmprLimitOrderDrawer: React.FC<SrbmprLimitOrderDrawerProps> = ({
  isOpen,
  onClose,
  activeAsset,
  livePrice,
  timeframe
}) => {
  const [side, setSide] = useState<'BUY_LIMIT' | 'SELL_LIMIT'>('BUY_LIMIT');
  const [entryPrice, setEntryPrice] = useState<number>(() => livePrice);
  const [stopLossPrice, setStopLossPrice] = useState<number>(() => {
    return Number((livePrice * 0.998).toFixed(activeAsset.basePrice < 2 ? 4 : 2));
  });
  const [orderExpiryMinutes, setOrderExpiryMinutes] = useState<number>(60);
  const [orders, setOrders] = useState<LimitOrderNode[]>([
    {
      id: 'LMT-NODE-78601',
      symbol: activeAsset.symbol,
      side: 'BUY_LIMIT',
      price: livePrice > 0 ? livePrice : activeAsset.basePrice,
      sl: Number(((livePrice > 0 ? livePrice : activeAsset.basePrice) - 50).toFixed(2)),
      tp1to10: Number(((livePrice > 0 ? livePrice : activeAsset.basePrice) + 500).toFixed(2)),
      tp1to20: Number(((livePrice > 0 ? livePrice : activeAsset.basePrice) + 1000).toFixed(2)),
      qty: 1.0,
      riskUsd: 50.0,
      status: 'PENDING_AT_NODE',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19)
    }
  ]);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Calculate $50 Fixed Risk: Q = $50 / |Entry - SL|
  const riskDiff = Math.abs(entryPrice - stopLossPrice);
  const qtyFor50Risk = riskDiff > 0 ? 50 / riskDiff : 0;
  const tp1to10 = side === 'BUY_LIMIT' ? entryPrice + riskDiff * 10 : entryPrice - riskDiff * 10;
  const tp1to20 = side === 'BUY_LIMIT' ? entryPrice + riskDiff * 20 : entryPrice - riskDiff * 20;

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (riskDiff <= 0) {
      alert('Invalid coordinates: Stop Loss must not equal Limit Entry Price.');
      return;
    }

    const newNode: LimitOrderNode = {
      id: `LMT-NODE-${Date.now().toString().slice(-5)}`,
      symbol: activeAsset.symbol,
      side,
      price: entryPrice,
      sl: stopLossPrice,
      tp1to10,
      tp1to20,
      qty: Number(qtyFor50Risk.toFixed(4)),
      riskUsd: 50.0,
      status: 'PENDING_AT_NODE',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19)
    };

    setOrders(prev => [newNode, ...prev]);
    setActionSuccessMsg(`Limit Node ${newNode.id} transmitted to engine at $${entryPrice.toLocaleString()}!`);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  const handleCancelOrder = (id: string) => {
    setOrders(prev => prev.map(o => (o.id === id ? { ...o, status: 'CANCELLED' } : o)));
  };

  const handleSimulateTrigger = (id: string) => {
    setOrders(prev => prev.map(o => (o.id === id ? { ...o, status: 'TRIGGERED' } : o)));
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-lg h-full bg-[#070b14] border-l border-amber-500/40 text-slate-100 flex flex-col shadow-2xl font-mono">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-[#0a0f1d] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/15 border border-amber-500/40 rounded-lg text-amber-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-black text-amber-300 uppercase tracking-wide">
                DECOUPLED LIMIT ORDER MODULE
              </h2>
              <p className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>Authorized Master Researcher • Fixed $50 Risk Model</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Context Banner */}
        <div className="px-4 py-2 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between text-xs">
          <div>
            <span className="text-slate-400 text-[11px]">ACTIVE ASSET:</span>{' '}
            <strong className="text-amber-300 font-black">{activeAsset.symbol}</strong>{' '}
            <span className="text-[10px] text-emerald-400">({activeAsset.sourceLabel})</span>
          </div>
          <div className="text-right">
            <span className="text-slate-400 text-[11px]">LIVE:</span>{' '}
            <strong className="text-white font-black">${livePrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {actionSuccessMsg && (
            <div className="p-2.5 bg-emerald-500/15 border border-emerald-500/40 rounded-lg text-emerald-300 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{actionSuccessMsg}</span>
            </div>
          )}

          {/* Configuration Form */}
          <form onSubmit={handlePlaceOrder} className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5 text-amber-400" />
                STAGE NEW LIMIT ORDER NODE
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                $50 STRICT CAPITAL RISK
              </span>
            </div>

            {/* Side Selection */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setSide('BUY_LIMIT');
                  if (stopLossPrice >= entryPrice) {
                    setStopLossPrice(Number((entryPrice * 0.998).toFixed(2)));
                  }
                }}
                className={`py-2 rounded-lg font-black text-xs flex items-center justify-center gap-1.5 border transition-all ${
                  side === 'BUY_LIMIT'
                    ? 'bg-emerald-500 text-black border-emerald-300 shadow-md font-bold'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <ArrowUpRight className="w-4 h-4" />
                BUY LIMIT (LONG)
              </button>
              <button
                type="button"
                onClick={() => {
                  setSide('SELL_LIMIT');
                  if (stopLossPrice <= entryPrice) {
                    setStopLossPrice(Number((entryPrice * 1.002).toFixed(2)));
                  }
                }}
                className={`py-2 rounded-lg font-black text-xs flex items-center justify-center gap-1.5 border transition-all ${
                  side === 'SELL_LIMIT'
                    ? 'bg-rose-500 text-white border-rose-300 shadow-md font-bold'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                <ArrowDownRight className="w-4 h-4" />
                SELL LIMIT (SHORT)
              </button>
            </div>

            {/* Price Inputs */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-400 font-bold block mb-1">
                  LIMIT PRICE ($)
                </label>
                <input
                  type="number"
                  step="any"
                  value={entryPrice}
                  onChange={e => setEntryPrice(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-black text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold block mb-1">
                  STOP LOSS ($)
                </label>
                <input
                  type="number"
                  step="any"
                  value={stopLossPrice}
                  onChange={e => setStopLossPrice(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-black text-rose-300 focus:outline-none focus:border-rose-400"
                />
              </div>
            </div>

            {/* Risk Engine Mathematical Readout */}
            <div className="bg-[#0b101d] border border-amber-500/30 rounded-lg p-2.5 space-y-1.5 text-xs">
              <div className="flex justify-between items-center text-slate-400 text-[11px]">
                <span>Risk Delta (|Entry - SL|):</span>
                <span className="font-bold text-slate-200">${riskDiff.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-slate-400 text-[11px]">
                <span>Calculated Quantity (Q = $50 / Δ):</span>
                <strong className="text-emerald-400 font-black">{qtyFor50Risk.toFixed(4)} Units</strong>
              </div>
              <div className="flex justify-between items-center text-slate-400 text-[11px]">
                <span>★ 1:10 Target (+ $500.00):</span>
                <strong className="text-amber-300 font-bold">${tp1to10.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
              </div>
              <div className="flex justify-between items-center text-slate-400 text-[11px]">
                <span>★ 1:20 Target (+ $1,000.00):</span>
                <strong className="text-fuchsia-300 font-bold">${tp1to20.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 text-black font-black text-xs rounded-lg shadow flex items-center justify-center gap-1.5"
            >
              <Zap className="w-4 h-4" />
              <span>STAMP & TRANSMIT LIMIT NODE</span>
            </button>
          </form>

          {/* Active Limit Orders List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-300 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                ACTIVE LIMIT NODES ({orders.length})
              </span>
              <span className="text-[10px] text-slate-500">Decoupled from replay</span>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-xs border border-dashed border-slate-800 rounded-lg">
                No limit nodes staged. Use the form above to add an order.
              </div>
            ) : (
              orders.map(order => (
                <div
                  key={order.id}
                  className="bg-slate-900/60 border border-slate-800 rounded-lg p-2.5 text-xs space-y-1.5 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-amber-300">{order.id}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded font-black ${
                          order.side === 'BUY_LIMIT'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : 'bg-rose-500/20 text-rose-300'
                        }`}
                      >
                        {order.side}
                      </span>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        order.status === 'PENDING_AT_NODE'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : order.status === 'TRIGGERED'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-1 text-[11px] text-slate-300">
                    <div>Price: <strong className="text-white">${order.price.toLocaleString()}</strong></div>
                    <div>SL: <strong className="text-rose-400">${order.sl.toLocaleString()}</strong></div>
                    <div>Qty: <strong className="text-emerald-400">{order.qty}</strong></div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[10px] text-slate-500">
                    <span>1:10 Target: ${order.tp1to10.toLocaleString()}</span>
                    <div className="flex items-center gap-1.5">
                      {order.status === 'PENDING_AT_NODE' && (
                        <>
                          <button
                            type="button"
                            onClick={() => handleSimulateTrigger(order.id)}
                            className="px-1.5 py-0.5 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-black rounded font-bold"
                            title="Simulate Market Price Reaching Node"
                          >
                            Fill Node
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCancelOrder(order.id)}
                            className="px-1.5 py-0.5 bg-rose-500/20 hover:bg-rose-500 text-rose-300 hover:text-black rounded font-bold"
                            title="Cancel Order"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-[#0a0f1d] text-[10px] text-slate-500 flex justify-between items-center shrink-0">
          <span>Decoupled Limit Execution Engine v2.5</span>
          <span className="text-emerald-400 font-bold">Risk Guard Enforced</span>
        </div>
      </div>
    </div>
  );
};
