import React, { useState, useEffect } from 'react';
import { 
  Rocket, 
  Globe, 
  Clock, 
  Zap, 
  Target, 
  CheckCircle2, 
  Flame, 
  Compass, 
  Activity, 
  Layers, 
  Sparkles, 
  ChevronRight,
  Shield,
  Radio,
  Play
} from 'lucide-react';

export type MarketChannel = 'CRYPTO' | 'INDIAN' | 'FOREX' | 'COMMODITY' | 'US_EQUITY';

export interface EarthLandingSetup {
  symbol: string;
  name: string;
  market_category: MarketChannel;
  live_price: number;
  entry_trigger: number;
  direction: 'LONG' | 'SHORT';
  
  // 5-Minute Validity Window
  validity_window_sec: number; // 300 seconds
  remaining_validity_sec: number;
  activation_status: 'ACTIVE_FLYING' | 'COUNTDOWN_5M' | 'LANDED_100';
  
  // 3 Rocket Stages
  rocket_1_entry: number;       // Stage 1: Launch Trigger
  rocket_2_midway: number;      // Stage 2: Atmospheric Piercing
  rocket_3_earth_landing: number; // Stage 3: Earth Landing Final Target

  current_distance_pct: number;
  flight_elapsed_sec: number;
  target_gain_ratio: string;
  notes: string;
}

export const SrTimeEarthLandingTerminal: React.FC = () => {
  // Master TV-Channel Switcher
  const [activeChannel, setActiveChannel] = useState<MarketChannel>('CRYPTO');
  const [selectedAssetSymbol, setSelectedAssetSymbol] = useState<string>('BTC/USDT');

  // Curated Setups across all 5 Markets
  const [setups, setSetups] = useState<Record<string, EarthLandingSetup>>({
    // 1. CRYPTO
    'BTC/USDT': {
      symbol: 'BTC/USDT',
      name: 'Bitcoin Perpetual (Bybit Linear)',
      market_category: 'CRYPTO',
      live_price: 68720.00,
      entry_trigger: 68431.00,
      direction: 'LONG',
      validity_window_sec: 300,
      remaining_validity_sec: 184,
      activation_status: 'ACTIVE_FLYING',
      rocket_1_entry: 68431.00,
      rocket_2_midway: 69299.00,
      rocket_3_earth_landing: 70168.82,
      current_distance_pct: 74.2,
      flight_elapsed_sec: 1420,
      target_gain_ratio: '1:5.80',
      notes: 'Rocket #2 Crossed. In final descent to Earth Landing.'
    },
    'SUI/USDT': {
      symbol: 'SUI/USDT',
      name: 'Sui Network (Bybit V5)',
      market_category: 'CRYPTO',
      live_price: 1.17700,
      entry_trigger: 1.11430,
      direction: 'LONG',
      validity_window_sec: 300,
      remaining_validity_sec: 215,
      activation_status: 'ACTIVE_FLYING',
      rocket_1_entry: 1.11430,
      rocket_2_midway: 1.25360,
      rocket_3_earth_landing: 1.39291,
      current_distance_pct: 82.5,
      flight_elapsed_sec: 840,
      target_gain_ratio: '1:5.80',
      notes: 'Rocket #1 & #2 locked. Heading straight to $1.39291.'
    },
    'ETH/USDT': {
      symbol: 'ETH/USDT',
      name: 'Ethereum Perpetual',
      market_category: 'CRYPTO',
      live_price: 2452.10,
      entry_trigger: 2420.50,
      direction: 'LONG',
      validity_window_sec: 300,
      remaining_validity_sec: 95,
      activation_status: 'ACTIVE_FLYING',
      rocket_1_entry: 2420.50,
      rocket_2_midway: 2454.00,
      rocket_3_earth_landing: 2488.20,
      current_distance_pct: 65.0,
      flight_elapsed_sec: 610,
      target_gain_ratio: '1:6.77',
      notes: 'Rocket #2 piercing underway. Straight flight.'
    },
    'SOL/USDT': {
      symbol: 'SOL/USDT',
      name: 'Solana High Speed',
      market_category: 'CRYPTO',
      live_price: 144.80,
      entry_trigger: 142.50,
      direction: 'LONG',
      validity_window_sec: 300,
      remaining_validity_sec: 270,
      activation_status: 'COUNTDOWN_5M',
      rocket_1_entry: 142.50,
      rocket_2_midway: 145.00,
      rocket_3_earth_landing: 148.50,
      current_distance_pct: 38.3,
      flight_elapsed_sec: 180,
      target_gain_ratio: '1:5.00',
      notes: '1-Sec Latch triggered. Rocket #1 activated.'
    },

    // 2. INDIAN MARKET
    'NIFTY50': {
      symbol: 'NIFTY50',
      name: 'NSE Nifty 50 Index (Zerodha / Upstox)',
      market_category: 'INDIAN',
      live_price: 25180.50,
      entry_trigger: 25050.00,
      direction: 'LONG',
      validity_window_sec: 300,
      remaining_validity_sec: 145,
      activation_status: 'ACTIVE_FLYING',
      rocket_1_entry: 25050.00,
      rocket_2_midway: 25265.00,
      rocket_3_earth_landing: 25480.00,
      current_distance_pct: 68.0,
      flight_elapsed_sec: 1850,
      target_gain_ratio: '1:4.30',
      notes: 'NSE Zero-Cycle Expansion. Rocket #2 stage ignited.'
    },
    'BANKNIFTY': {
      symbol: 'BANKNIFTY',
      name: 'NSE Nifty Bank Index',
      market_category: 'INDIAN',
      live_price: 51840.00,
      entry_trigger: 51420.00,
      direction: 'LONG',
      validity_window_sec: 300,
      remaining_validity_sec: 190,
      activation_status: 'ACTIVE_FLYING',
      rocket_1_entry: 51420.00,
      rocket_2_midway: 52100.00,
      rocket_3_earth_landing: 52780.00,
      current_distance_pct: 54.0,
      flight_elapsed_sec: 1200,
      target_gain_ratio: '1:5.20',
      notes: 'High retest held safely. Rocket #2 in flight.'
    },
    'RELIANCE': {
      symbol: 'RELIANCE',
      name: 'Reliance Industries Ltd (NSE)',
      market_category: 'INDIAN',
      live_price: 2985.20,
      entry_trigger: 2940.00,
      direction: 'LONG',
      validity_window_sec: 300,
      remaining_validity_sec: 240,
      activation_status: 'ACTIVE_FLYING',
      rocket_1_entry: 2940.00,
      rocket_2_midway: 2990.00,
      rocket_3_earth_landing: 3060.00,
      current_distance_pct: 62.0,
      flight_elapsed_sec: 940,
      target_gain_ratio: '1:6.00',
      notes: 'Direct flight to 3,060 Earth Landing.'
    },

    // 3. FOREX MARKET
    'EUR/USD': {
      symbol: 'EUR/USD',
      name: 'Euro / US Dollar (Major Pair)',
      market_category: 'FOREX',
      live_price: 1.08940,
      entry_trigger: 1.08420,
      direction: 'LONG',
      validity_window_sec: 300,
      remaining_validity_sec: 160,
      activation_status: 'ACTIVE_FLYING',
      rocket_1_entry: 1.08420,
      rocket_2_midway: 1.09150,
      rocket_3_earth_landing: 1.09880,
      current_distance_pct: 71.0,
      flight_elapsed_sec: 1350,
      target_gain_ratio: '1:5.50',
      notes: 'London/NY overlap momentum. Rocket #2 clear.'
    },
    'GBP/JPY': {
      symbol: 'GBP/JPY',
      name: 'British Pound / Japanese Yen',
      market_category: 'FOREX',
      live_price: 194.20,
      entry_trigger: 192.50,
      direction: 'LONG',
      validity_window_sec: 300,
      remaining_validity_sec: 210,
      activation_status: 'ACTIVE_FLYING',
      rocket_1_entry: 192.50,
      rocket_2_midway: 194.80,
      rocket_3_earth_landing: 197.10,
      current_distance_pct: 61.5,
      flight_elapsed_sec: 1120,
      target_gain_ratio: '1:6.20',
      notes: 'High velocity dragon wave to 197.10.'
    },

    // 4. COMMODITY MARKET
    'XAU/USD': {
      symbol: 'XAU/USD',
      name: 'Gold Spot / Linear Contract',
      market_category: 'COMMODITY',
      live_price: 2664.20,
      entry_trigger: 2642.10,
      direction: 'LONG',
      validity_window_sec: 300,
      remaining_validity_sec: 130,
      activation_status: 'ACTIVE_FLYING',
      rocket_1_entry: 2642.10,
      rocket_2_midway: 2670.00,
      rocket_3_earth_landing: 2698.50,
      current_distance_pct: 78.0,
      flight_elapsed_sec: 1650,
      target_gain_ratio: '1:7.28',
      notes: 'Gold structural apex. Final descent to $2,698.50.'
    },
    'CRUDE_OIL': {
      symbol: 'CRUDE_OIL',
      name: 'Brent Crude Oil Contract',
      market_category: 'COMMODITY',
      live_price: 74.85,
      entry_trigger: 72.40,
      direction: 'LONG',
      validity_window_sec: 300,
      remaining_validity_sec: 245,
      activation_status: 'ACTIVE_FLYING',
      rocket_1_entry: 72.40,
      rocket_2_midway: 75.10,
      rocket_3_earth_landing: 77.80,
      current_distance_pct: 45.4,
      flight_elapsed_sec: 780,
      target_gain_ratio: '1:4.80',
      notes: 'Rocket #1 triggered on 1-second breakout.'
    },

    // 5. US MARKET
    'NASDAQ100': {
      symbol: 'NASDAQ100',
      name: 'QQQ / US Tech 100 Index',
      market_category: 'US_EQUITY',
      live_price: 19840.00,
      entry_trigger: 19520.00,
      direction: 'LONG',
      validity_window_sec: 300,
      remaining_validity_sec: 110,
      activation_status: 'ACTIVE_FLYING',
      rocket_1_entry: 19520.00,
      rocket_2_midway: 19950.00,
      rocket_3_earth_landing: 20380.00,
      current_distance_pct: 69.2,
      flight_elapsed_sec: 2100,
      target_gain_ratio: '1:6.50',
      notes: 'Tech structural expansion. Approaching Earth Landing.'
    },
    'NVDA': {
      symbol: 'NVDA',
      name: 'NVIDIA Corp (Nasdaq)',
      market_category: 'US_EQUITY',
      live_price: 136.40,
      entry_trigger: 128.50,
      direction: 'LONG',
      validity_window_sec: 300,
      remaining_validity_sec: 195,
      activation_status: 'ACTIVE_FLYING',
      rocket_1_entry: 128.50,
      rocket_2_midway: 137.00,
      rocket_3_earth_landing: 145.50,
      current_distance_pct: 74.0,
      flight_elapsed_sec: 1540,
      target_gain_ratio: '1:8.20',
      notes: 'Direct line to 145.50 Earth Landing.'
    }
  });

  // 1-Second Precision Countdown & Tick Simulator
  useEffect(() => {
    const timer = setInterval(() => {
      setSetups(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(k => {
          const item = next[k];
          if (item.remaining_validity_sec > 0) {
            item.remaining_validity_sec -= 1;
          } else {
            item.remaining_validity_sec = 300; // Reset 5m cycle
          }
          item.flight_elapsed_sec += 1;
        });
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Filtered Assets by Channel
  const channelAssets = Object.values(setups).filter(s => s.market_category === activeChannel);
  const activeSetup = setups[selectedAssetSymbol] || channelAssets[0] || Object.values(setups)[0];

  return (
    <div className="bg-[#020408] border-2 border-amber-500 rounded-[36px] p-6 sm:p-8 font-mono text-zinc-100 shadow-[0_0_140px_rgba(245,158,11,0.25)] space-y-8">
      
      {/* 1. MASTER TV-CHANNEL CATEGORY SWITCHER (Like Sun TV, Zee TV, Star Plus) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-black uppercase text-amber-400 tracking-widest">
              SR TIME GLOBAL CHANNELS · DEDICATED MARKET TERMINALS
            </span>
          </div>
          <span className="text-[10px] text-zinc-500 font-bold uppercase">
            STRICT CHANNEL ISOLATION • INDEPENDENT CATEGORIES
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {[
            { id: 'CRYPTO', label: 'SRBMPR CRYPTO', badge: 'Bybit Linear V5', icon: '🪙' },
            { id: 'INDIAN', label: 'SRBMPR INDIAN', badge: 'NSE / BSE Indices', icon: '🇮🇳' },
            { id: 'FOREX', label: 'SRBMPR FOREX', badge: 'Major FX Liquidity', icon: '💱' },
            { id: 'COMMODITY', label: 'SRBMPR COMMODITY', badge: 'Gold / Oil / Metals', icon: '🏅' },
            { id: 'US_EQUITY', label: 'SRBMPR US MARKET', badge: 'Nasdaq / Tech Leaders', icon: '🇺🇸' }
          ].map(chan => {
            const isSelected = activeChannel === chan.id;
            return (
              <button
                key={chan.id}
                onClick={() => {
                  setActiveChannel(chan.id as MarketChannel);
                  const firstInChan = Object.values(setups).find(s => s.market_category === chan.id);
                  if (firstInChan) setSelectedAssetSymbol(firstInChan.symbol);
                }}
                className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-amber-500 text-black border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.45)] scale-102'
                    : 'bg-zinc-950 text-zinc-300 hover:text-white hover:bg-zinc-900 border-zinc-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-lg">{chan.icon}</span>
                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded ${
                    isSelected ? 'bg-black text-amber-300' : 'bg-zinc-900 text-zinc-400'
                  }`}>
                    {chan.badge}
                  </span>
                </div>
                <div className="mt-3">
                  <h4 className="text-xs font-black uppercase tracking-tight">{chan.label}</h4>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. ASSET SELECTOR CHIPS IN ACTIVE CHANNEL */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scroll">
        <span className="text-[10px] text-zinc-500 font-bold uppercase shrink-0">SELECT ASSET:</span>
        {channelAssets.map(asset => {
          const isSelected = activeSetup.symbol === asset.symbol;
          return (
            <button
              key={asset.symbol}
              onClick={() => setSelectedAssetSymbol(asset.symbol)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase shrink-0 transition-all flex items-center gap-1.5 border ${
                isSelected
                  ? 'bg-amber-500 text-black border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                  : 'bg-black text-zinc-400 border-zinc-800 hover:text-white hover:bg-zinc-900'
              }`}
            >
              <span>{asset.symbol}</span>
              <span className={`text-[9px] font-mono ${isSelected ? 'text-black font-extrabold' : 'text-emerald-400'}`}>
                ${asset.live_price.toLocaleString()}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. MASTER HERO CONTAINER: SR TIME — EARTH LANDING FINAL TARGET */}
      <div className="bg-gradient-to-b from-zinc-950 via-black to-[#050914] border-2 border-amber-500 rounded-3xl p-6 sm:p-8 space-y-7 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-amber-500/10 to-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header of Personal Execution Container */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10 border-b border-zinc-800/80 pb-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                <Rocket className="w-4 h-4 text-amber-400 animate-pulse" />
                1-SECOND TRIGGER LATCH
              </span>
              <span className="text-zinc-500 text-xs font-bold uppercase">
                {activeSetup.name}
              </span>
            </div>

            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white uppercase tracking-tight leading-tight">
              SR TIME — <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-200 to-emerald-400">
                EARTH LANDING FINAL TARGET
              </span>
            </h2>

            <div className="text-xs text-zinc-400 flex items-center gap-2 font-bold uppercase">
              <span className="text-emerald-400">● 1-SECOND ENTRY LATCH</span>
              <span>•</span>
              <span className="text-amber-400">● 5-MINUTE VALIDITY CYCLE</span>
              <span>•</span>
              <span className="text-cyan-400">● DESTINATION: EARTH LANDING</span>
            </div>
          </div>

          {/* 5-Minute Validity Countdown Box */}
          <div className="bg-black/90 border-2 border-amber-500/60 p-4 rounded-2xl flex flex-col items-center justify-center min-w-[240px] shadow-xl">
            <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" /> 5-MINUTE VALIDITY WINDOW
            </span>
            <div className="text-3xl font-black text-amber-400 font-mono mt-1 tracking-widest">
              0{Math.floor(activeSetup.remaining_validity_sec / 60)}:{(activeSetup.remaining_validity_sec % 60).toString().padStart(2, '0')}
            </div>
            <span className="text-[9px] text-emerald-400 font-bold uppercase mt-1 flex items-center gap-1">
              <Zap className="w-3 h-3 text-emerald-400" /> ROCKET NOW FLYING TO TARGET
            </span>
          </div>
        </div>

        {/* 4. THE 3 ROCKET STAGES (ROCKET #1, ROCKET #2, ROCKET #3) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* ROCKET #1 */}
          <div className="bg-black border-2 border-emerald-500/50 p-5 rounded-2xl space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-emerald-400 uppercase flex items-center gap-1.5">
                <Rocket className="w-4 h-4 text-emerald-400" /> ROCKET #1
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-black uppercase">
                1-SEC LATCH CONFIRMED
              </span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 font-bold block uppercase">ORBITAL LAUNCH ENTRY</span>
              <div className="text-2xl font-black text-white font-mono mt-0.5">
                ${activeSetup.rocket_1_entry.toLocaleString()}
              </div>
            </div>
            <p className="text-[10px] text-zinc-400">
              संरचनात्मक स्तर पर 1 सेकंड में प्रवेश। कोई रुकावट नहीं।
            </p>
          </div>

          {/* ROCKET #2 */}
          <div className="bg-black border-2 border-amber-500/60 p-5 rounded-2xl space-y-3 relative overflow-hidden shadow-[0_0_25px_rgba(245,158,11,0.15)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-amber-400 uppercase flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-400 animate-pulse" /> ROCKET #2
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-black uppercase animate-pulse">
                ATMOSPHERIC PIERCING
              </span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 font-bold block uppercase">MIDWAY CONTINUATION ACCELERATION</span>
              <div className="text-2xl font-black text-amber-400 font-mono mt-0.5">
                ${activeSetup.rocket_2_midway.toLocaleString()}
              </div>
            </div>
            <p className="text-[10px] text-zinc-400">
              पुलबैक पूर्ण होने के बाद मध्य-मार्ग का रॉकेट बूस्टर सक्रिय।
            </p>
          </div>

          {/* ROCKET #3: EARTH LANDING FINAL TARGET */}
          <div className="bg-gradient-to-br from-emerald-950/40 to-black border-2 border-emerald-400 p-5 rounded-2xl space-y-3 relative overflow-hidden shadow-[0_0_40px_rgba(16,185,129,0.25)]">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-emerald-300 uppercase flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-emerald-400 animate-spin" /> ROCKET #3
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-black text-[9px] font-black uppercase tracking-wider">
                EARTH LANDING TARGET
              </span>
            </div>
            <div>
              <span className="text-[10px] text-emerald-400 font-black block uppercase">FINAL DESTINATION</span>
              <div className="text-3xl font-black text-emerald-400 font-mono mt-0.5">
                ${activeSetup.rocket_3_earth_landing.toLocaleString()}
              </div>
            </div>
            <div className="text-[10px] text-zinc-300 flex justify-between font-bold">
              <span>TARGET GAIN: <strong className="text-amber-400">{activeSetup.target_gain_ratio}</strong></span>
              <span className="text-emerald-400 font-extrabold">LANDING GUARANTEED</span>
            </div>
          </div>

        </div>

        {/* 5. VISUAL FLIGHT PATH (ROCKET NOW GOING TO EARTH LANDING TARGET) */}
        <div className="bg-black/90 p-5 rounded-2xl border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-zinc-400 uppercase flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-amber-400" /> LIVE FLIGHT TRAJECTORY:
            </span>
            <span className="text-emerald-400 font-mono font-black text-sm">
              {activeSetup.current_distance_pct}% FLIGHT COMPLETED
            </span>
          </div>

          {/* Visual Flight Progress Track */}
          <div className="relative w-full bg-zinc-950 h-5 rounded-full overflow-hidden border border-zinc-800 p-0.5">
            <div 
              className="bg-gradient-to-r from-emerald-500 via-amber-400 to-emerald-400 h-full rounded-full transition-all duration-500 relative flex items-center justify-end pr-1"
              style={{ width: `${activeSetup.current_distance_pct}%` }}
            >
              <div className="w-3.5 h-3.5 rounded-full bg-white shadow-[0_0_10px_#fff] flex items-center justify-center text-[8px] text-black font-black">
                🚀
              </div>
            </div>
          </div>

          <div className="flex justify-between text-[10px] text-zinc-500 font-mono pt-1">
            <span>LAUNCH: ${activeSetup.rocket_1_entry.toLocaleString()}</span>
            <span className="text-amber-400">MIDWAY: ${activeSetup.rocket_2_midway.toLocaleString()}</span>
            <span className="text-emerald-400 font-black">EARTH LANDING: ${activeSetup.rocket_3_earth_landing.toLocaleString()}</span>
          </div>
        </div>

        {/* 6. ONE-CLICK INSTANT ENTRY HUD (NO DISCUSSIONS, ZERO STOP-LOSS MENTALITY) */}
        <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <div className="text-xs font-black text-white uppercase flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-amber-400" />
              1-SECOND INSTANT EXECUTION GATEWAY
            </div>
            <p className="text-[10px] text-zinc-400">
              सिर्फ दिखाया, तुरंत 1 सेकंड में एंट्री। जब तक Earth Landing Target न पहुंचे, कुछ नहीं दिखेगा।
            </p>
          </div>

          <button className="px-8 py-3 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-[0_0_30px_rgba(245,158,11,0.5)] flex items-center gap-2 shrink-0 animate-pulse">
            <Play className="w-4 h-4 fill-black" />
            ENTER 1-SEC LAUNCH ({activeSetup.symbol})
          </button>
        </div>

      </div>

    </div>
  );
};
