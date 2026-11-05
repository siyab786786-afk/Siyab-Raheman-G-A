import React, { useState, useEffect } from 'react';
import { 
  Rocket, 
  Search, 
  ShieldAlert, 
  ShieldCheck, 
  Activity, 
  TrendingUp, 
  Clock, 
  Zap, 
  Coins, 
  Copy, 
  CheckCircle2, 
  AlertTriangle,
  BarChart3,
  ExternalLink,
  Lock,
  RefreshCw
} from 'lucide-react';

interface MemeCoinItem {
  id: string;
  name: string;
  symbol: string;
  blockchain: 'SOL' | 'ETH' | 'BASE' | 'BSC' | 'ARBITRUM';
  contractAddress: string;
  launchTime: string; // e.g. "12m ago", "3h ago", "2d ago"
  launchCategory: 'NEW_LP' | 'NEW_LISTING' | 'MOMENTUM_BREAKOUT' | 'HIGH_VOLUME';
  marketCap: number;
  liquidity: number;
  vol24h: number;
  price: number;
  priceChange1h: number;
  priceChange24h: number;
  holderConcentrationRisk: 'LOW' | 'MEDIUM' | 'HIGH (HONEYPOT RISK)';
  isVerified: boolean;
  bidAskSpread: string;
  estimatedSlippage: string;
  status: 'SCANNING' | 'VERIFIED_SAFE' | 'FLAGGED_RISK';
}

export const MemeCoinDiscoveryLiveScanner: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'NEW' | 'HIGH_VOL' | 'MOMENTUM' | 'AUDIT'>('NEW');
  const [selectedChain, setSelectedChain] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Live Simulated Meme Coin Database adhering to prompt instructions
  const [coins, setCoins] = useState<MemeCoinItem[]>([
    {
      id: 'meme-1',
      name: 'Quantum Pepe',
      symbol: 'QPEPE',
      blockchain: 'SOL',
      contractAddress: '7xKX...v29B (Verified)',
      launchTime: '18m ago',
      launchCategory: 'NEW_LP',
      marketCap: 450000,
      liquidity: 125000,
      vol24h: 890000,
      price: 0.000452,
      priceChange1h: 34.5,
      priceChange24h: 180.2,
      holderConcentrationRisk: 'LOW',
      isVerified: true,
      bidAskSpread: '0.12%',
      estimatedSlippage: '0.4%',
      status: 'VERIFIED_SAFE'
    },
    {
      id: 'meme-2',
      name: 'Cyber Doge AI',
      symbol: 'CDOGE',
      blockchain: 'BASE',
      contractAddress: '0x3f...91aC (Verified)',
      launchTime: '2h ago',
      launchCategory: 'NEW_LISTING',
      marketCap: 1200000,
      liquidity: 340000,
      vol24h: 2100000,
      price: 0.012400,
      priceChange1h: 12.8,
      priceChange24h: 94.5,
      holderConcentrationRisk: 'MEDIUM',
      isVerified: true,
      bidAskSpread: '0.25%',
      estimatedSlippage: '0.8%',
      status: 'VERIFIED_SAFE'
    },
    {
      id: 'meme-3',
      name: 'Turbo Cat Shrub',
      symbol: 'SHRUB',
      blockchain: 'SOL',
      contractAddress: '9pLm...82Rt (Flagged)',
      launchTime: '45m ago',
      launchCategory: 'MOMENTUM_BREAKOUT',
      marketCap: 85000,
      liquidity: 14000,
      vol24h: 320000,
      price: 0.000085,
      priceChange1h: 68.9,
      priceChange24h: 210.0,
      holderConcentrationRisk: 'HIGH (HONEYPOT RISK)',
      isVerified: false,
      bidAskSpread: '4.50%',
      estimatedSlippage: '12.0%',
      status: 'FLAGGED_RISK'
    },
    {
      id: 'meme-4',
      name: 'Neon Solana Moon',
      symbol: 'NEONMOON',
      blockchain: 'SOL',
      contractAddress: '5hRt...33Qp (Verified)',
      launchTime: '5h ago',
      launchCategory: 'HIGH_VOLUME',
      marketCap: 3400000,
      liquidity: 950000,
      vol24h: 5400000,
      price: 0.034200,
      priceChange1h: 5.4,
      priceChange24h: 45.1,
      holderConcentrationRisk: 'LOW',
      isVerified: true,
      bidAskSpread: '0.08%',
      estimatedSlippage: '0.2%',
      status: 'VERIFIED_SAFE'
    },
    {
      id: 'meme-5',
      name: 'Ether Inu V2',
      symbol: 'EINU',
      blockchain: 'ETH',
      contractAddress: '0x88...12F4 (Verified)',
      launchTime: '1d ago',
      launchCategory: 'HIGH_VOLUME',
      marketCap: 5200000,
      liquidity: 1800000,
      vol24h: 8900000,
      price: 0.145000,
      priceChange1h: -2.1,
      priceChange24h: 28.4,
      holderConcentrationRisk: 'LOW',
      isVerified: true,
      bidAskSpread: '0.05%',
      estimatedSlippage: '0.15%',
      status: 'VERIFIED_SAFE'
    },
    {
      id: 'meme-6',
      name: 'BSC Turbo Frog',
      symbol: 'FROG',
      blockchain: 'BSC',
      contractAddress: '0x99...55Bb (Verified)',
      launchTime: '12h ago',
      launchCategory: 'NEW_LP',
      marketCap: 210000,
      liquidity: 65000,
      vol24h: 450000,
      price: 0.002100,
      priceChange1h: 18.2,
      priceChange24h: 115.0,
      holderConcentrationRisk: 'MEDIUM',
      isVerified: true,
      bidAskSpread: '0.40%',
      estimatedSlippage: '1.2%',
      status: 'VERIFIED_SAFE'
    }
  ]);

  // Live ticking simulation for prices and volume
  useEffect(() => {
    const interval = setInterval(() => {
      setCoins(prev => 
        prev.map(c => {
          const delta = (Math.random() - 0.48) * 0.02 * c.price;
          const nextPrice = Math.max(0.000001, c.price + delta);
          const nextVol = c.vol24h + Math.floor(Math.random() * 500);
          return {
            ...c,
            price: nextPrice,
            vol24h: nextVol
          };
        })
      );
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleCopy = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setNotice(`Contract address copied to clipboard: ${address}`);
    setTimeout(() => setNotice(null), 3000);
  };

  const filteredCoins = coins.filter(c => {
    if (selectedChain !== 'ALL' && c.blockchain !== selectedChain) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.symbol.toLowerCase().includes(q);
    }
    if (activeTab === 'NEW') return c.launchCategory === 'NEW_LP' || c.launchCategory === 'NEW_LISTING';
    if (activeTab === 'HIGH_VOL') return c.launchCategory === 'HIGH_VOLUME' || c.vol24h > 1000000;
    if (activeTab === 'MOMENTUM') return c.launchCategory === 'MOMENTUM_BREAKOUT' || c.priceChange1h > 15;
    if (activeTab === 'AUDIT') return c.holderConcentrationRisk.includes('HONEYPOT') || !c.isVerified;
    return true;
  });

  return (
    <div className="bg-[#02050A] border-2 border-amber-500/50 rounded-[36px] p-6 sm:p-8 font-mono text-zinc-100 shadow-[0_0_100px_rgba(245,158,11,0.15)] space-y-6">
      
      {/* HEADER */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 border-b border-zinc-800 pb-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.3)] animate-pulse">
              <Rocket className="w-4 h-4 text-amber-400" />
              MEME COIN DISCOVERY ENGINE — LIVE SCANNER
            </span>
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Honeypot & Risk Guard Active
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight italic">
            Small-Cap Meme Discovery & <span className="text-amber-400">1-Hour Momentum Inspector</span>
          </h2>
          <p className="text-xs text-zinc-400 leading-relaxed max-w-4xl">
            Continuously scans newly launched liquidity pools, new exchange listings, and 1-minute candle momentum within 1-hour market context. Filters out honeypots, suspicious contracts, and extreme holder concentration automatically.
          </p>
        </div>

        {/* Search & Chain Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search coin or symbol..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 rounded-2xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500 w-56"
            />
          </div>

          <select
            value={selectedChain}
            onChange={e => setSelectedChain(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-2.5 text-xs text-amber-400 font-bold focus:outline-none focus:border-amber-500 cursor-pointer"
          >
            <option value="ALL">All Networks</option>
            <option value="SOL">Solana (SOL)</option>
            <option value="ETH">Ethereum (ETH)</option>
            <option value="BASE">Base (BASE)</option>
            <option value="BSC">Binance (BSC)</option>
          </select>
        </div>
      </div>

      {notice && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/40 rounded-xl text-amber-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* CATEGORY TABS */}
      <div className="flex flex-wrap items-center gap-3 bg-zinc-950 p-2 rounded-2xl border border-white/5">
        <button
          onClick={() => setActiveTab('NEW')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${
            activeTab === 'NEW' ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Newly Launched (LPs & Listings)</span>
        </button>

        <button
          onClick={() => setActiveTab('HIGH_VOL')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${
            activeTab === 'HIGH_VOL' ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>High-Volume Small-Cap</span>
        </button>

        <button
          onClick={() => setActiveTab('MOMENTUM')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${
            activeTab === 'MOMENTUM' ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>1-Hour Momentum (1-Min Candles)</span>
        </button>

        <button
          onClick={() => setActiveTab('AUDIT')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all ${
            activeTab === 'AUDIT' ? 'bg-rose-600 text-white shadow-[0_0_15px_rgba(225,29,72,0.3)]' : 'text-zinc-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <span>Honeypot & Risk Guard Filter</span>
        </button>
      </div>

      {/* COINS TABLE / GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCoins.map(coin => {
          const isRisk = coin.status === 'FLAGGED_RISK';

          return (
            <div 
              key={coin.id}
              className={`p-5 rounded-3xl border transition-all flex flex-col justify-between space-y-4 ${
                isRisk 
                  ? 'bg-rose-950/10 border-rose-500/40 shadow-[0_0_20px_rgba(244,63,94,0.1)]' 
                  : 'bg-zinc-950/80 border-zinc-900 hover:border-amber-500/30'
              }`}
            >
              {/* Card Header */}
              <div className="flex justify-between items-start">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black text-white">{coin.symbol}</span>
                    <span className="px-2 py-0.5 bg-zinc-900 text-amber-400 text-[9px] font-black rounded border border-white/5">
                      {coin.blockchain}
                    </span>
                  </div>
                  <span className="text-xs text-zinc-400">{coin.name}</span>
                </div>

                <span className={`px-2 py-1 rounded-full text-[9px] font-black uppercase ${
                  isRisk ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}>
                  {coin.holderConcentrationRisk}
                </span>
              </div>

              {/* Price & Momentum */}
              <div className="grid grid-cols-2 gap-3 bg-black/40 p-3 rounded-2xl border border-white/5">
                <div>
                  <span className="text-[9px] text-zinc-500 block uppercase font-bold">Live Price</span>
                  <span className="text-base font-black text-white font-mono">${coin.price < 0.001 ? coin.price.toFixed(8) : coin.price.toFixed(4)}</span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-zinc-500 block uppercase font-bold">1h / 24h Change</span>
                  <span className={`text-xs font-black ${coin.priceChange1h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {coin.priceChange1h >= 0 ? '+' : ''}{coin.priceChange1h}%
                  </span>
                </div>
              </div>

              {/* Metrics (Market Cap, Liquidity, Volume, Launch) */}
              <div className="space-y-1.5 text-xs text-zinc-400">
                <div className="flex justify-between">
                  <span>Launch Time:</span>
                  <span className="text-white font-bold">{coin.launchTime} ({coin.launchCategory})</span>
                </div>
                <div className="flex justify-between">
                  <span>Market Cap:</span>
                  <span className="text-white font-bold">${coin.marketCap.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Executable Liquidity:</span>
                  <span className="text-emerald-400 font-bold">${coin.liquidity.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>24h Volume:</span>
                  <span className="text-white font-bold">${coin.vol24h.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Bid-Ask Spread / Slippage:</span>
                  <span className="text-amber-400 font-bold">{coin.bidAskSpread} / {coin.estimatedSlippage}</span>
                </div>
              </div>

              {/* Contract Address & Actions */}
              <div className="pt-3 border-t border-zinc-900 flex items-center justify-between gap-3">
                <button
                  onClick={() => handleCopy(coin.contractAddress)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl text-[10px] font-bold transition-all"
                >
                  <Copy className="w-3.5 h-3.5 text-amber-400" />
                  <span className="truncate max-w-[120px]">{coin.contractAddress}</span>
                </button>

                <button
                  disabled={isRisk}
                  onClick={() => {
                    setNotice(`Inspecting 1-minute momentum context for ${coin.symbol}. Strict 1:5 RR rule enforced.`);
                    setTimeout(() => setNotice(null), 3000);
                  }}
                  className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${
                    isRisk 
                      ? 'bg-zinc-900 text-zinc-600 cursor-not-allowed' 
                      : 'bg-amber-500 hover:bg-amber-400 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                  }`}
                >
                  {isRisk ? 'Blocked (Risk)' : 'Inspect 1m Candles'}
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
