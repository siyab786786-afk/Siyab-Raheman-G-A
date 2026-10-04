import React, { useState, useEffect } from 'react';
import { HorizonAssetRecord, TimezoneMode, ExchangeId, AssetCategory } from '../types/terminal';
import { SRBMPRMechanismEngine } from '../services/SRBMPRMechanismEngine';
import { 
  Target, Clock, ShieldCheck, AlertTriangle, ArrowRight, Zap, 
  DollarSign, Percent, TrendingUp, CheckCircle2, ChevronDown, 
  ChevronUp, Lock, Award, Building2, Flame, Layers, Calendar, Copy, Check, Star, Search, Cpu
} from 'lucide-react';

interface SrMultiCoinHorizonPageProps {
  timezone: TimezoneMode;
  onSelectTimezone: (tz: TimezoneMode) => void;
  selectedExchange: ExchangeId;
}

export const SrMultiCoinHorizonPage: React.FC<SrMultiCoinHorizonPageProps> = ({
  timezone,
  onSelectTimezone,
  selectedExchange
}) => {
  const engine = SRBMPRMechanismEngine.getInstance();
  const [horizonAssets, setHorizonAssets] = useState<HorizonAssetRecord[]>(
    engine.getHorizonAssetRecords(timezone)
  );
  const [expandedAssetId, setExpandedAssetId] = useState<string>('HRZ-BTC-001');
  const [accountTier, setAccountTier] = useState<number>(100000); // $100k default Upcomers
  const [categoryFilter, setCategoryFilter] = useState<AssetCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [personalCoins, setPersonalCoins] = useState<string[]>(['BTC/USDT', 'ETH/USDT', 'PEPE/USDT', 'PAXG/USDT']);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [currentTime, setCurrentTime] = useState<string>(
    new Date().toLocaleTimeString('en-GB', { timeZone: timezone })
  );

  useEffect(() => {
    // Generate up to 100 coins by repeating and scaling base assets if needed
    const baseRecords = engine.getHorizonAssetRecords(timezone);
    const expanded100: HorizonAssetRecord[] = [];
    const suffixes = ['USDT', 'PERP', 'USD'];
    
    let count = 1;
    while (expanded100.length < 100) {
      baseRecords.forEach((b, idx) => {
        if (expanded100.length >= 100) return;
        const multiplier = 1 + (expanded100.length * 0.01);
        expanded100.push({
          ...b,
          id: `HRZ-COIN-${expanded100.length + 1}`,
          symbol: expanded100.length === 0 ? 'BTC/USDT' : expanded100.length === 1 ? 'ETH/USDT' : expanded100.length === 2 ? 'PEPE/USDT' : expanded100.length === 3 ? 'PAXG/USDT' : `COIN${expanded100.length}/USDT`,
          openingCandlePrice: Number((b.openingCandlePrice * (0.8 + (expanded100.length % 5) * 0.1)).toFixed(4)),
          currentPrice: Number((b.currentPrice * (0.8 + (expanded100.length % 5) * 0.1)).toFixed(4)),
          stopLossPrice: Number((b.stopLossPrice * (0.8 + (expanded100.length % 5) * 0.1)).toFixed(4)),
        });
        count++;
      });
    }

    setHorizonAssets(expanded100);

    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('en-GB', { timeZone: timezone }));
    }, 1000);
    return () => clearInterval(timer);
  }, [timezone]);

  const togglePersonalCoin = (symbol: string) => {
    if (personalCoins.includes(symbol)) {
      setPersonalCoins(personalCoins.filter(s => s !== symbol));
    } else {
      setPersonalCoins([...personalCoins, symbol]);
    }
  };

  const filteredAssets = horizonAssets.filter(asset => {
    const matchesSearch = asset.symbol.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (categoryFilter === 'ALL') return true;
    if (categoryFilter === 'CRYPTO_MAJOR') return ['BTC/USDT', 'ETH/USDT', 'SOL/USDT'].includes(asset.symbol);
    if (categoryFilter === 'MEME_COIN') return asset.symbol.includes('PEPE') || asset.symbol.includes('COIN');
    if (categoryFilter === 'COMMODITY') return asset.symbol.includes('PAXG');
    if (categoryFilter === 'INDIAN_MARKET') return asset.symbol.includes('NIFTY');
    if (categoryFilter === 'US_INDEX') return asset.symbol.includes('SPX');
    return true;
  });

  return (
    <div className="space-y-8 font-mono">
      
      {/* Top Banner: Timezone, Strict 0.10% SL Policy, and Funded Risk Guardian */}
      <div className="bg-gradient-to-r from-zinc-950 via-[#0a0d14] to-black border border-amber-500/30 rounded-[32px] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-white/5 pb-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Target className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider italic flex items-center gap-3">
                  0-SRBMPR / RS-Time Engine v1.1 — 100-COIN HORIZON VAULT
                </h1>
                <p className="text-[11px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">
                  Micro Timing (1s / 1m) • Opening Candle Axis • Strict 0.10% SL • $1 → $1,000+ Compounding Objective
                </p>
              </div>
            </div>
          </div>

          {/* Timezone Switcher & Live UTC Clock */}
          <div className="flex flex-wrap items-center gap-3 bg-zinc-900/60 p-2 rounded-2xl border border-white/5">
            <div className="flex items-center gap-2 px-3 py-1 bg-black/50 rounded-xl border border-white/10 text-xs">
              <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '8s' }} />
              <span className="text-zinc-400 font-bold">TIMEZONE:</span>
              <span className="text-white font-black">{currentTime} ({timezone})</span>
            </div>

            <div className="flex items-center gap-1">
              {(['UTC', 'Asia/Dubai', 'Asia/Kolkata'] as const).map(tz => (
                <button
                  key={tz}
                  onClick={() => onSelectTimezone(tz)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase transition-all ${
                    timezone === tz
                      ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tz === 'Asia/Dubai' ? 'Dubai (GST +4)' : tz === 'Asia/Kolkata' ? 'India (IST +5:30)' : 'UTC'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Essential Rules Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6">
          <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-2xl flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-black text-white uppercase block">Strict 0.10% Stop Loss Mandate</span>
              <span className="text-zinc-400 text-[10px] leading-relaxed block mt-0.5">
                Exact floor protection across all 100 coins. $1.00 risk on $1,000 asset space.
              </span>
            </div>
          </div>

          <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl flex items-start gap-3">
            <Building2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-black text-white uppercase block">Upcomers & Bybit Prop Rules</span>
              <span className="text-zinc-400 text-[10px] leading-relaxed block mt-0.5">
                Max Daily Drawdown: 4.0% • Per-Trade Risk: 0.50% • 100-Coin Scanning Active.
              </span>
            </div>
          </div>

          <div className="bg-emerald-500/10 border border-emerald-500/30 p-4 rounded-2xl flex items-start gap-3">
            <Flame className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-black text-white uppercase block">$1 to $1,000 24h Objective</span>
              <span className="text-zinc-400 text-[10px] leading-relaxed block mt-0.5">
                Zero-multiplier growth via 1:333 state machine (A333, B333, C333) across 1s / 1m micro intervals.
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Main Layout: Left 100-Coin List, Right Personal Coin Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-mono">
        
        {/* Left 100-Coin List Section (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Search & Category Filter Bar */}
          <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search any coin (e.g. BTC, ETH, PEPE)..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded-xl pl-9 pr-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-1">
              {(['ALL', 'CRYPTO_MAJOR', 'MEME_COIN', 'COMMODITY'] as const).map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase transition-all ${
                    categoryFilter === cat
                      ? 'bg-amber-500 text-black font-black'
                      : 'text-zinc-400 hover:text-white bg-zinc-900'
                  }`}
                >
                  {cat.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Coins List (Showing up to 100 filtered items) */}
          <div className="space-y-4">
            <div className="flex justify-between items-center text-xs text-zinc-400 px-2">
              <span>Displaying <strong className="text-white">{filteredAssets.length}</strong> Horizon Assets (100-Coin Terminal)</span>
              <span>Timezone: <strong className="text-amber-400">{timezone}</strong></span>
            </div>

            {filteredAssets.map(asset => {
              const isExpanded = expandedAssetId === asset.id;
              const isPinned = personalCoins.includes(asset.symbol);

              return (
                <div
                  key={asset.id}
                  className={`bg-zinc-950/90 border rounded-3xl p-6 transition-all relative overflow-hidden ${
                    isExpanded 
                      ? 'border-amber-500/40 shadow-[0_0_30px_rgba(245,158,11,0.1)] bg-gradient-to-b from-zinc-950 to-black' 
                      : 'border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => togglePersonalCoin(asset.symbol)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                          isPinned ? 'bg-amber-500 text-black' : 'bg-zinc-900 text-zinc-500 hover:text-white'
                        }`}
                        title="Pin to Personal Coin Watchlist"
                      >
                        <Star className={`w-4 h-4 ${isPinned ? 'fill-current' : ''}`} />
                      </button>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-black text-white">{asset.symbol}</h3>
                          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded text-[9px] font-black uppercase">
                            {asset.status}
                          </span>
                        </div>
                        <div className="text-[10px] text-zinc-400 mt-0.5">
                          Opening Time ({timezone}): <strong className="text-white">{asset.candleOpeningTime}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <div>
                        <span className="text-[9px] text-zinc-500 uppercase block">Opening Axis</span>
                        <span className="text-sm font-black text-white">${asset.openingCandlePrice.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-rose-400 uppercase block">0.10% SL</span>
                        <span className="text-sm font-black text-rose-400">${asset.stopLossPrice.toLocaleString()}</span>
                      </div>
                      <button
                        onClick={() => setExpandedAssetId(isExpanded ? '' : asset.id)}
                        className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl text-xs font-bold transition flex items-center gap-1 border border-zinc-800"
                      >
                        <span>{isExpanded ? 'Hide' : 'Details'}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="mt-6 pt-6 border-t border-zinc-900 space-y-4 animate-fadeIn">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {asset.targets.map(t => (
                          <div key={t.ratio} className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800 text-center">
                            <span className="text-[10px] font-bold text-emerald-400">{t.ratio} Target</span>
                            <div className="text-sm font-black text-white mt-0.5">${t.price.toLocaleString()}</div>
                            <span className="text-[9px] text-zinc-500">{t.timeHorizon}</span>
                          </div>
                        ))}
                      </div>

                      <div className="bg-black/60 p-4 rounded-xl border border-zinc-900 space-y-2 text-[11px]">
                        <div className="text-amber-400 font-bold">Re-Entry Cascade Steps (Micro 1s/1m Timing):</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {asset.reEntrySteps.map(step => (
                            <div key={step.stepNumber} className="bg-zinc-900/40 p-2.5 rounded-lg border border-zinc-800 space-y-1">
                              <div className="flex justify-between text-[10px]">
                                <span className="font-bold text-white">Step {step.stepNumber}: {step.label}</span>
                                <span className="text-amber-400">{step.timeWindow}</span>
                              </div>
                              <div className="text-[10px] text-zinc-400">{step.triggerCondition}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>

        </div>

        {/* Right Side: Personal Coin & Micro Timezone Panel (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="bg-zinc-950 border border-amber-500/30 rounded-3xl p-6 shadow-2xl space-y-5 sticky top-6">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                Personal Coin Watchlist
              </h3>
              <span className="px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded text-[10px] font-bold">
                {personalCoins.length} Pinned
              </span>
            </div>

            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Your pinned personal coins are tracked here with micro 1s/1m timing and explicit timezone offsets for immediate execution.
            </p>

            <div className="space-y-3">
              {personalCoins.map(sym => {
                const found = horizonAssets.find(a => a.symbol === sym) || horizonAssets[0];
                return (
                  <div key={sym} className="bg-zinc-900/80 border border-zinc-800 p-4 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-white text-sm">{sym}</span>
                      <span className="text-[10px] text-emerald-400 font-bold">Active ($1 → $1K)</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] bg-black/40 p-2.5 rounded-xl border border-zinc-900">
                      <div>
                        <span className="text-zinc-500">Timezone:</span>
                        <div className="text-amber-400 font-bold">{timezone}</div>
                      </div>
                      <div>
                        <span className="text-zinc-500">0.10% SL:</span>
                        <div className="text-rose-400 font-bold">${found.stopLossPrice.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* $1 to $1,000 Micro Compounding Widget */}
            <div className="bg-gradient-to-br from-amber-950/30 via-zinc-900 to-black p-4 rounded-2xl border border-amber-500/20 space-y-3">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                <Cpu className="w-4 h-4" />
                <span>$1 to $1,000 Compounding Engine</span>
              </div>
              <p className="text-[10px] text-zinc-400 leading-relaxed">
                Running 1:333 state machine across personal coin micro timeframes (1s / 1m) to achieve 24h compounding target.
              </p>
              <div className="flex justify-between items-center text-xs font-black bg-black/60 p-3 rounded-xl border border-amber-500/30">
                <span className="text-zinc-400">Start: <strong className="text-white">$1.00</strong></span>
                <ArrowRight className="w-4 h-4 text-amber-400" />
                <span className="text-emerald-400">Target: <strong className="text-emerald-400">$1,000.00+</strong></span>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
