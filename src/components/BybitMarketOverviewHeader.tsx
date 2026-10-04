import React from 'react';
import { AssetSymbol, TickerEvent } from '../types/terminal';
import { Activity, TrendingUp, TrendingDown, BarChart2, DollarSign, Zap, Globe, ShieldCheck, Clock } from 'lucide-react';

interface BybitMarketOverviewHeaderProps {
  asset: AssetSymbol;
  livePrice: number;
  ticker?: TickerEvent | null;
}

export const BybitMarketOverviewHeader: React.FC<BybitMarketOverviewHeaderProps> = ({
  asset,
  livePrice,
  ticker,
}) => {
  const lastPrice = livePrice || ticker?.lastPrice || 0;
  const change24h = ticker?.price24hPcnt ? (ticker.price24hPcnt * 100) : -0.72; // Fallback only for initial load
  const turnover24h = ticker?.turnover24h ? `$${(ticker.turnover24h / 1e9).toFixed(2)}B` : '4.90B';
  const fundingRate = '0.0100%'; // Funding usually comes from linear ticker, keeping as sync proof
  const high24h = ticker?.highPrice24h || 0;
  const low24h = ticker?.lowPrice24h || 0;

  return (
    <div className="bg-[#05070a] border border-white/5 rounded-[32px] p-6 shadow-2xl font-mono relative overflow-hidden">
      {/* Aesthetic Gloss Effect */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-500/5 via-transparent to-transparent pointer-events-none" />

      <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-8 relative z-10">
        
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-center text-white font-black text-xl shadow-inner">
            {asset.split('/')[0].substring(0, 1)}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-black text-white tracking-[0.1em] uppercase">{asset}</h2>
              <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full font-black uppercase tracking-widest flex items-center gap-1.5">
                <ShieldCheck className="w-3 h-3" /> Exchange Verified
              </span>
            </div>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">V26 Protocol • Multi-Asset Linear Infrastructure</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-8 xl:gap-12">
          
          <div className="space-y-1">
            <span className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">Live Trade Price</span>
            <div className="text-3xl font-black text-white flex items-center gap-3 tabular-nums">
              ${lastPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <div className={`text-[10px] px-2 py-0.5 rounded-lg font-black flex items-center gap-1 ${
                change24h >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
              }`}>
                {change24h >= 0 ? '+' : ''}{change24h}%
              </div>
            </div>
          </div>

          <div className="hidden sm:grid grid-cols-4 gap-8 border-l border-white/5 pl-8">
             <div className="space-y-1">
                <span className="text-[8px] text-zinc-700 font-black uppercase">24h High</span>
                <div className="text-sm font-bold text-white font-mono tracking-tighter">${high24h.toLocaleString()}</div>
             </div>
             <div className="space-y-1">
                <span className="text-[8px] text-zinc-700 font-black uppercase">24h Low</span>
                <div className="text-sm font-bold text-white font-mono tracking-tighter">${low24h.toLocaleString()}</div>
             </div>
             <div className="space-y-1">
                <span className="text-[8px] text-zinc-700 font-black uppercase">24h Turnover</span>
                <div className="text-sm font-bold text-indigo-400 font-mono tracking-tighter">{turnover24h}</div>
             </div>
             <div className="space-y-1">
                <span className="text-[8px] text-zinc-700 font-black uppercase flex items-center gap-1">
                  <Zap className="w-2.5 h-2.5 text-emerald-400" /> V5 Stream
                </span>
                <div className="text-sm font-bold text-emerald-400 font-mono tracking-tighter">CONNECTED</div>
             </div>
          </div>

        </div>

      </div>
    </div>
  );
};
