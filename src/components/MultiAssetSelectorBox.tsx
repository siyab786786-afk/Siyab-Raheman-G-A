import React from 'react';
import { ExchangeId, AssetSymbol, Timeframe, TimezoneMode, MarketType } from '../types/terminal';
import { Coins, Globe, Clock, ShieldCheck, RefreshCw, Layers } from 'lucide-react';

interface MultiAssetSelectorBoxProps {
  selectedExchange: ExchangeId;
  onSelectExchange: (ex: ExchangeId) => void;
  selectedAsset: AssetSymbol;
  onSelectAsset: (asset: AssetSymbol) => void;
  timeframe: Timeframe;
  onSelectTimeframe: (tf: Timeframe) => void;
  timezone: TimezoneMode;
  onSelectTimezone: (tz: TimezoneMode) => void;
  marketType: MarketType;
  onSelectMarketType: (mt: MarketType) => void;
  onFullSync: () => void;
}

const STANDARD_ASSETS: AssetSymbol[] = ['BTC/USDT', 'ETH/USDT', 'ZEC/USDT', 'PAXG/USDT', 'SOL/USDT', 'XRP/USDT', 'ADA/USDT', 'GOLD', 'NIFTY50'];
const MEME_VOLUME_ASSETS: AssetSymbol[] = ['PEPE/USDT', 'WIF/USDT', 'DOGE/USDT', 'BONK/USDT', 'SHIB/USDT', 'FLOKI/USDT', 'SUI/USDT', 'AR/USDT', 'SOL/USDT', 'ZEC/USDT'];
const TIMEFRAMES: Timeframe[] = ['1m', '5m', '15m', '1h', '4h'];
const MARKETS: MarketType[] = ['SPOT', 'FUTURE', 'OPTION'];

export const MultiAssetSelectorBox: React.FC<MultiAssetSelectorBoxProps> = ({
  selectedExchange,
  onSelectExchange,
  selectedAsset,
  onSelectAsset,
  timeframe,
  onSelectTimeframe,
  timezone,
  onSelectTimezone,
  marketType,
  onSelectMarketType,
  onFullSync,
}) => {
  const [assetCategory, setAssetCategory] = React.useState<'STANDARD' | 'MEME_VOLUME'>('STANDARD');
  const activeAssetsList = assetCategory === 'STANDARD' ? STANDARD_ASSETS : MEME_VOLUME_ASSETS;

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-4 shadow-2xl backdrop-blur-md space-y-4">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        
        {/* Exchange & Market Type Selector */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
            <button
              onClick={() => onSelectExchange('BYBIT')}
              className={`px-3 py-1.5 rounded-md text-[10px] font-black transition-all flex items-center gap-2 ${
                selectedExchange === 'BYBIT' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              BYBIT_SRBMPR
            </button>
            <button
              onClick={() => onSelectExchange('BINANCE')}
              className={`px-3 py-1.5 rounded-md text-[10px] font-black transition-all flex items-center gap-2 ${
                selectedExchange === 'BINANCE' ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              BINANCE_SRBMPR
            </button>
          </div>

          <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
            {MARKETS.map(mt => (
              <button
                key={mt}
                onClick={() => onSelectMarketType(mt)}
                className={`px-3 py-1.5 rounded-md text-[10px] font-black transition-all ${
                  marketType === mt ? 'bg-blue-600 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {mt}
              </button>
            ))}
          </div>

          {/* Asset Category Toggle */}
          <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-lg border border-zinc-800">
            <button
              onClick={() => setAssetCategory('STANDARD')}
              className={`px-2 py-1 rounded text-[9px] font-black transition-all ${
                assetCategory === 'STANDARD' ? 'bg-zinc-800 text-white' : 'text-zinc-500'
              }`}
            >
              STANDARD
            </button>
            <button
              onClick={() => setAssetCategory('MEME_VOLUME')}
              className={`px-2 py-1 rounded text-[9px] font-black transition-all flex items-center gap-1 ${
                assetCategory === 'MEME_VOLUME' ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'text-zinc-500'
              }`}
            >
              <Coins className="w-3 h-3 text-red-400" /> MEME/VOLUME
            </button>
          </div>
        </div>

        {/* 8-Coin Fast Switcher */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 lg:pb-0 scrollbar-none">
          <span className="text-zinc-500 text-[10px] font-black mr-1 flex items-center gap-1 uppercase">
            <Coins className="w-3 h-3 text-amber-500" /> List:
          </span>
          {activeAssetsList.map((asset) => (
            <button
              key={asset}
              onClick={() => onSelectAsset(asset)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black font-mono transition-all whitespace-nowrap ${
                selectedAsset === asset
                  ? 'bg-zinc-800 text-white border border-amber-500/50 shadow'
                  : 'bg-zinc-900/60 text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              {asset}
            </button>
          ))}
        </div>


        {/* Timeframe, Timezone & Sync */}
        <div className="flex items-center gap-3">
          <div className="flex bg-zinc-900 rounded-lg border border-zinc-800 p-1">
            {TIMEFRAMES.map((tf) => (
              <button
                key={tf}
                onClick={() => onSelectTimeframe(tf)}
                className={`px-2.5 py-1 rounded text-[10px] font-mono font-black ${
                  timeframe === tf ? 'bg-zinc-800 text-amber-400' : 'text-zinc-500 hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-zinc-900 rounded-lg border border-zinc-800 px-2 py-1">
            <Clock className="w-3 h-3 text-zinc-500" />
            <select
              value={timezone}
              onChange={(e) => onSelectTimezone(e.target.value as TimezoneMode)}
              className="bg-transparent text-[10px] text-zinc-300 font-mono font-black focus:outline-none cursor-pointer uppercase"
            >
              <option value="UTC" className="bg-zinc-900">UTC</option>
              <option value="Asia/Dubai" className="bg-zinc-900">Dubai</option>
              <option value="Asia/Kolkata" className="bg-zinc-900">India</option>
            </select>
          </div>

          <button
            onClick={onFullSync}
            title="Full Sync Streams"
            className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-lg border border-zinc-800 transition-all flex items-center gap-1.5 text-[10px] font-black"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-500 animate-spin-slow" />
            <span className="hidden xl:inline uppercase">Sync</span>
          </button>
        </div>

      </div>
    </div>
  );
};
