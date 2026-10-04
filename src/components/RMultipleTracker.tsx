import React from 'react';
import { Activity, TrendingUp, TrendingDown, Target, Shield } from 'lucide-react';

interface RMultipleTrackerProps {
  entryPrice: number;
  stopLoss: number;
  livePrice: number;
}

export const RMultipleTracker: React.FC<RMultipleTrackerProps> = ({
  entryPrice,
  stopLoss,
  livePrice,
}) => {
  const risk = Math.abs(entryPrice - stopLoss); // Fixed $1.00 risk
  const priceDifference = livePrice - entryPrice;
  const currentR = risk > 0 ? Number((priceDifference / risk).toFixed(2)) : 0;

  const isPositive = currentR >= 0;

  // Determine milestone percentage progress towards 10R
  const progressPercent = Math.min(100, Math.max(0, (currentR / 10) * 100));

  return (
    <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-2xl shadow-2xl space-y-4 font-mono">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-900">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
            R
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wider">LIVE R-MULTIPLE TRACKER</h3>
            <p className="text-xs text-zinc-400">Dynamic R-value recalculation based on live Bybit price vs fixed $1.00 SL</p>
          </div>
        </div>
        <span className={`px-3 py-1 text-xs font-bold rounded-lg border flex items-center gap-1.5 ${
          isPositive ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400' : 'bg-rose-500/10 border-rose-500/40 text-rose-400'
        }`}>
          {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
          <span>{isPositive ? `+${currentR}R` : `${currentR}R`}</span>
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
        <div className="bg-zinc-900/80 p-4 rounded-xl border border-zinc-800">
          <div className="text-[10px] text-zinc-400 uppercase">Limit Entry</div>
          <div className="text-lg font-bold text-amber-400 mt-1">${entryPrice.toLocaleString()}</div>
        </div>

        <div className="bg-zinc-900/80 p-4 rounded-xl border border-zinc-800">
          <div className="text-[10px] text-zinc-400 uppercase">Fixed SL ($1.00 Risk)</div>
          <div className="text-lg font-bold text-rose-400 mt-1">${stopLoss.toLocaleString()}</div>
        </div>

        <div className="bg-zinc-900/80 p-4 rounded-xl border border-zinc-800">
          <div className="text-[10px] text-zinc-400 uppercase">Current Live Price</div>
          <div className="text-lg font-bold text-emerald-400 mt-1">${livePrice.toLocaleString()}</div>
        </div>

        <div className="bg-zinc-900/80 p-4 rounded-xl border border-zinc-800">
          <div className="text-[10px] text-zinc-400 uppercase">Active R-Multiple</div>
          <div className={`text-xl font-black mt-1 ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isPositive ? `+${currentR}R` : `${currentR}R`}
          </div>
        </div>
      </div>

      {/* Visual R Progress Bar towards 10R */}
      <div className="space-y-2 pt-2">
        <div className="flex justify-between text-xs text-zinc-400 font-bold">
          <span>0R (Entry)</span>
          <span>5R Target</span>
          <span>10R Max Extension</span>
        </div>
        <div className="w-full h-3 bg-zinc-900 rounded-full overflow-hidden p-0.5 border border-zinc-800">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isPositive ? 'bg-gradient-to-r from-amber-500 via-emerald-500 to-indigo-500' : 'bg-rose-500'
            }`}
            style={{ width: `${Math.max(5, progressPercent)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};
