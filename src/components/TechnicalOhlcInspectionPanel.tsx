import React from 'react';
import { CandleData, ExchangeId } from '../types/terminal';
import { Activity, BarChart2, TrendingUp, Layers, CheckCircle2 } from 'lucide-react';

interface TechnicalOhlcInspectionPanelProps {
  candle: CandleData | null;
  exchange: ExchangeId;
}

export const TechnicalOhlcInspectionPanel: React.FC<TechnicalOhlcInspectionPanelProps> = ({ candle, exchange }) => {
  if (!candle) return null;

  const deltaVal = candle.close - candle.open;
  const deltaPct = ((deltaVal / candle.open) * 100).toFixed(3);
  const trueRange = (candle.high - candle.low).toFixed(2);
  const upperWick = (candle.high - Math.max(candle.open, candle.close)).toFixed(2);
  const lowerWick = (Math.min(candle.open, candle.close) - candle.low).toFixed(2);
  
  const isBullish = candle.close >= candle.open;
  let structureForm = isBullish ? 'Bullish Impetus Candle' : 'Bearish Implosion Candle';
  if (Math.abs(Number(upperWick)) < 0.1 && Math.abs(Number(lowerWick)) < 0.1) {
    structureForm = 'Bullish Marubozu (Clean)';
  } else if (Number(upperWick) > Number(trueRange) * 0.5) {
    structureForm = 'Shooting Star / Upper Rejection';
  } else if (Number(lowerWick) > Number(trueRange) * 0.5) {
    structureForm = 'Hammer / Lower Demand Wick';
  }

  return (
    <div className="bg-zinc-950/90 border border-zinc-800/80 rounded-xl p-4 shadow-xl backdrop-blur-md">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-zinc-900">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-amber-500 animate-pulse" />
          <h3 className="text-xs font-mono font-bold tracking-wider text-zinc-200">
            TECHNICAL OHLC INSPECTION PANEL [{exchange} MAINNET V5]
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Locked Source Feed
          </span>
          <span className="text-[10px] font-mono text-zinc-500">{candle.timeStr} UTC</span>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 font-mono">
        <div className="bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800/50">
          <div className="text-[10px] text-zinc-500 uppercase">Open</div>
          <div className="text-sm font-bold text-zinc-200">${candle.open.toLocaleString()}</div>
        </div>
        <div className="bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800/50">
          <div className="text-[10px] text-zinc-500 uppercase">High</div>
          <div className="text-sm font-bold text-emerald-400">${candle.high.toLocaleString()}</div>
        </div>
        <div className="bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800/50">
          <div className="text-[10px] text-zinc-500 uppercase">Low</div>
          <div className="text-sm font-bold text-rose-400">${candle.low.toLocaleString()}</div>
        </div>
        <div className="bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800/50">
          <div className="text-[10px] text-zinc-500 uppercase">Close</div>
          <div className="text-sm font-bold text-zinc-100">${candle.close.toLocaleString()}</div>
        </div>
        <div className="bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800/50">
          <div className="text-[10px] text-zinc-500 uppercase">Candle Delta</div>
          <div className={`text-sm font-bold ${isBullish ? 'text-emerald-400' : 'text-rose-400'}`}>
            {deltaVal >= 0 ? '+' : ''}${deltaVal.toFixed(2)} ({deltaPct}%)
          </div>
        </div>
        <div className="bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800/50">
          <div className="text-[10px] text-zinc-500 uppercase">True Range</div>
          <div className="text-sm font-bold text-amber-400">${trueRange}</div>
        </div>
        <div className="bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800/50">
          <div className="text-[10px] text-zinc-500 uppercase">Volume</div>
          <div className="text-sm font-bold text-indigo-400 flex items-center gap-1">
            <BarChart2 className="w-3.5 h-3.5" /> {candle.volume.toLocaleString()}
          </div>
        </div>
        <div className="bg-zinc-900/60 p-2.5 rounded-lg border border-zinc-800/50 col-span-2 sm:col-span-1">
          <div className="text-[10px] text-zinc-500 uppercase">Structure Form</div>
          <div className="text-xs font-bold text-amber-300 truncate" title={structureForm}>
            {structureForm}
          </div>
        </div>
      </div>
    </div>
  );
};
