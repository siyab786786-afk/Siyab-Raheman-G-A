import React, { useState } from 'react';
import {
  DollarSign,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Sliders,
  Shield,
  X
} from 'lucide-react';

export type LimitOrderStatus = 'DRAFT' | 'PENDING' | 'FILLED' | 'CANCELLED' | 'REJECTED';

export interface LimitOrderRecord {
  id: string;
  symbol: string;
  type: 'BUY_LIMIT' | 'SELL_LIMIT';
  limitPrice: number;
  quantity: number;
  notionalValue: number;
  stopLossPrice: number;
  targetPrice: number;
  riskAmount: number;
  estimatedReward: number;
  riskRewardRatio: string;
  status: LimitOrderStatus;
  createdAt: string;
  fillPrice?: number;
  fillTimestamp?: string;
  isSimulated: boolean;
}

interface SrbmprLimitOrderSimulatorProps {
  symbol: string;
  currentPrice: number;
  isOpen: boolean;
  onClose: () => void;
  onPlaceOrder?: (order: LimitOrderRecord) => void;
}

export const SrbmprLimitOrderSimulator: React.FC<SrbmprLimitOrderSimulatorProps> = ({
  symbol,
  currentPrice,
  isOpen,
  onClose,
  onPlaceOrder
}) => {
  const [orderType, setOrderType] = useState<'BUY_LIMIT' | 'SELL_LIMIT'>('BUY_LIMIT');
  const [limitPrice, setLimitPrice] = useState<number>(() => {
    return Number((currentPrice * (orderType === 'BUY_LIMIT' ? 0.998 : 1.002)).toFixed(2));
  });
  const [quantity, setQuantity] = useState<number>(0.05);
  const [slPercent, setSlPercent] = useState<number>(0.10); // 0.10% SRBMPR dynamic stop
  const [targetRatio, setTargetRatio] = useState<number>(5); // 1:5
  const [isSimulated, setIsSimulated] = useState<boolean>(true);
  const [orderList, setOrderList] = useState<LimitOrderRecord[]>([]);
  const [showEduHelp, setShowEduHelp] = useState<boolean>(true);

  if (!isOpen) return null;

  const notional = Number((limitPrice * quantity).toFixed(2));
  const slDistance = Number((limitPrice * (slPercent / 100)).toFixed(2));
  const stopLossPrice = Number((orderType === 'BUY_LIMIT' ? limitPrice - slDistance : limitPrice + slDistance).toFixed(2));
  const targetDistance = Number((slDistance * targetRatio).toFixed(2));
  const targetPrice = Number((orderType === 'BUY_LIMIT' ? limitPrice + targetDistance : limitPrice - targetDistance).toFixed(2));
  const riskAmount = Number((slDistance * quantity).toFixed(2));
  const estimatedReward = Number((targetDistance * quantity).toFixed(2));

  const handleCreateOrder = () => {
    const newOrder: LimitOrderRecord = {
      id: `ORD-LIM-${Math.floor(100000 + Math.random() * 900000)}`,
      symbol,
      type: orderType,
      limitPrice,
      quantity,
      notionalValue: notional,
      stopLossPrice,
      targetPrice,
      riskAmount,
      estimatedReward,
      riskRewardRatio: `1:${targetRatio}`,
      status: 'PENDING',
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
      isSimulated
    };

    setOrderList(prev => [newOrder, ...prev]);
    if (onPlaceOrder) onPlaceOrder(newOrder);
  };

  const handleCancelOrder = (id: string) => {
    setOrderList(prev =>
      prev.map(o => (o.id === id ? { ...o, status: 'CANCELLED' } : o))
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 font-mono select-none">
      <div className="bg-[#0b0f19] border border-slate-700 w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-100">
        
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 bg-[#070a12] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <span>Limit Order Learning & Execution Terminal</span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold border ${
                  isSimulated
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
                }`}>
                  {isSimulated ? 'Simulation / Training Mode' : 'Live Execution Mode'}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Understand price-level fills, slippage boundaries, and risk/reward containment.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          
          {/* Educational Callout Banner */}
          {showEduHelp && (
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 space-y-1.5 relative">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-300 flex items-center gap-1.5 text-[11px]">
                  <HelpCircle className="w-4 h-4 text-amber-400" />
                  What is a Limit Order? (Critical Trader Rule)
                </span>
                <button
                  onClick={() => setShowEduHelp(false)}
                  className="text-slate-400 hover:text-white text-[10px]"
                >
                  Dismiss
                </button>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                A <strong>Limit Order</strong> is an instruction to buy or sell only at a specific price or better.
                Unlike a market order, <span className="text-amber-400 font-bold">a limit order will remain UNFILLED if the market does not reach your specified price</span> or if there is insufficient liquidity at that price level.
              </p>
            </div>
          )}

          {/* Order Placement Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Left Column: Inputs */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-300 uppercase text-[11px]">Order Configuration</span>
                <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 p-0.5 rounded">
                  <button
                    onClick={() => setOrderType('BUY_LIMIT')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      orderType === 'BUY_LIMIT'
                        ? 'bg-emerald-500 text-black font-black'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    BUY LIMIT
                  </button>
                  <button
                    onClick={() => setOrderType('SELL_LIMIT')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      orderType === 'SELL_LIMIT'
                        ? 'bg-rose-500 text-white font-black'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    SELL LIMIT
                  </button>
                </div>
              </div>

              {/* Limit Price */}
              <div>
                <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                  <span>Limit Entry Price (USD)</span>
                  <span className="text-slate-300">Market: ${currentPrice.toFixed(2)}</span>
                </div>
                <input
                  type="number"
                  value={limitPrice}
                  onChange={e => setLimitPrice(parseFloat(e.target.value) || 0)}
                  step={0.01}
                  className="w-full bg-slate-950 border border-slate-700 text-white font-bold text-xs px-3 py-1.5 rounded focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Quantity */}
              <div>
                <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                  <span>Quantity ({symbol.split('/')[0] || 'BTC'})</span>
                  <span className="text-slate-300">Notional: ${notional}</span>
                </div>
                <input
                  type="number"
                  value={quantity}
                  onChange={e => setQuantity(parseFloat(e.target.value) || 0)}
                  step={0.001}
                  className="w-full bg-slate-950 border border-slate-700 text-white font-bold text-xs px-3 py-1.5 rounded focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Target Ratio & SL */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Stop-Loss (%):</label>
                  <select
                    value={slPercent}
                    onChange={e => setSlPercent(parseFloat(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 text-rose-400 font-bold text-xs px-2 py-1.5 rounded"
                  >
                    <option value={0.05}>0.05% (Micro)</option>
                    <option value={0.10}>0.10% (SRBMPR Policy)</option>
                    <option value={0.20}>0.20% (Wide)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] text-slate-400 block mb-1">Target Ratio:</label>
                  <select
                    value={targetRatio}
                    onChange={e => setTargetRatio(parseInt(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 text-emerald-400 font-bold text-xs px-2 py-1.5 rounded"
                  >
                    <option value={1}>1:1 Ratio</option>
                    <option value={2}>1:2 Ratio</option>
                    <option value={3}>1:3 Ratio</option>
                    <option value={5}>1:5 Ratio</option>
                    <option value={10}>1:10 Ratio</option>
                    <option value={20}>1:20 Ratio</option>
                  </select>
                </div>
              </div>

              {/* Mode Toggle */}
              <div className="pt-1 flex items-center justify-between text-[10px] text-slate-400 border-t border-slate-800">
                <span>Execution Mode:</span>
                <button
                  onClick={() => setIsSimulated(!isSimulated)}
                  className={`px-2 py-0.5 rounded font-bold ${
                    isSimulated ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                  }`}
                >
                  {isSimulated ? 'Paper Simulation (Safe)' : 'Live Exchange Bridge'}
                </button>
              </div>

              {/* Submit Button */}
              <button
                onClick={handleCreateOrder}
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-black uppercase tracking-wider rounded-lg shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <span>Submit {orderType} Order</span>
              </button>
            </div>

            {/* Right Column: Calculated Risk/Reward Matrix */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3">
              <div>
                <span className="font-bold text-slate-300 uppercase text-[11px] block border-b border-slate-800 pb-1.5 mb-2.5">
                  Pre-Flight Execution Matrix
                </span>

                <div className="space-y-2 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Order Type:</span>
                    <span className={orderType === 'BUY_LIMIT' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                      {orderType}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Limit Price:</span>
                    <span className="text-white font-bold tabular-nums">${limitPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Stop-Loss Price:</span>
                    <span className="text-rose-400 font-bold tabular-nums">
                      ${stopLossPrice.toFixed(2)} (-${slDistance})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Target Objective:</span>
                    <span className="text-emerald-400 font-bold tabular-nums">
                      ${targetPrice.toFixed(2)} (+${targetDistance})
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-slate-800/80 pt-1.5">
                    <span className="text-slate-400">Maximum Risk:</span>
                    <span className="text-rose-400 font-bold tabular-nums">-${riskAmount} USD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Projected Reward:</span>
                    <span className="text-emerald-400 font-bold tabular-nums">+${estimatedReward} USD</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Risk-to-Reward:</span>
                    <span className="text-amber-400 font-bold">1:{targetRatio}</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[10px] text-slate-400">
                <span className="text-white font-bold block mb-0.5">Authorization Safeguard:</span>
                Orders are queued in local paper memory until matched by real tick prices. No live exchange orders are transmitted without your explicit API key authorization.
              </div>
            </div>

          </div>

          {/* Orders History Ledger */}
          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/40">
            <div className="bg-[#070a12] px-3.5 py-2 border-b border-slate-800 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase">
              <span>Limit Orders Ledger ({orderList.length})</span>
              <span>Status Filter: All</span>
            </div>

            <div className="max-h-40 overflow-y-auto">
              {orderList.length === 0 ? (
                <div className="p-4 text-center text-slate-500 text-[11px]">
                  No limit orders placed yet. Configure above and submit your first order.
                </div>
              ) : (
                <table className="w-full text-left text-[11px] tabular-nums">
                  <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 text-[10px]">
                    <tr>
                      <th className="py-1.5 px-3">Order ID</th>
                      <th className="py-1.5 px-3">Type</th>
                      <th className="py-1.5 px-3">Limit Price</th>
                      <th className="py-1.5 px-3">Quantity</th>
                      <th className="py-1.5 px-3">SL Price</th>
                      <th className="py-1.5 px-3">Target</th>
                      <th className="py-1.5 px-3">Status</th>
                      <th className="py-1.5 px-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {orderList.map(ord => (
                      <tr key={ord.id} className="hover:bg-slate-900/50">
                        <td className="py-2 px-3 text-slate-400 font-bold">{ord.id}</td>
                        <td className={`py-2 px-3 font-bold ${ord.type === 'BUY_LIMIT' ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {ord.type}
                        </td>
                        <td className="py-2 px-3 font-bold text-white">${ord.limitPrice}</td>
                        <td className="py-2 px-3 text-slate-300">{ord.quantity}</td>
                        <td className="py-2 px-3 text-rose-400">${ord.stopLossPrice}</td>
                        <td className="py-2 px-3 text-emerald-400">${ord.targetPrice}</td>
                        <td className="py-2 px-3">
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            ord.status === 'PENDING'
                              ? 'bg-amber-500/20 text-amber-300'
                              : ord.status === 'FILLED'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-slate-800 text-slate-400'
                          }`}>
                            {ord.status}
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          {ord.status === 'PENDING' && (
                            <button
                              onClick={() => handleCancelOrder(ord.id)}
                              className="text-rose-400 hover:text-rose-300 text-[10px] font-bold"
                            >
                              Cancel
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-[#070a12] flex items-center justify-between text-[11px] text-slate-400">
          <span>Simulation Engine: SRBMPR Limit Order Simulator</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
