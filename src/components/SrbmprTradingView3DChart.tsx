import React, { useState, useEffect, useRef } from 'react';
import { Shield, Sparkles, TrendingUp, TrendingDown, Target, Lock, Play, Layers, Award, AlertTriangle, RefreshCw, FileDown, CheckCircle2, Copy, Maximize2, Minimize2, Percent, Users, DollarSign } from 'lucide-react';
import { AssetSymbol } from '../types/terminal';

interface Props {
  selectedAsset?: AssetSymbol;
  livePrice?: number;
}

// 10 high-velocity, small-priced, meme/volume-optimized coins conforming to AssetSymbol type
const MULTI_ASSET_TEN: { symbol: AssetSymbol; priceMultiplier: number; type: string }[] = [
  { symbol: 'ZEC/USDT', priceMultiplier: 1.0, type: 'CORE' },
  { symbol: 'DOGE/USDT', priceMultiplier: 0.003, type: 'MEME' },
  { symbol: 'PEPE/USDT', priceMultiplier: 0.0000001, type: 'MEME' },
  { symbol: 'BONK/USDT', priceMultiplier: 0.0000003, type: 'MEME' },
  { symbol: 'WIF/USDT', priceMultiplier: 0.00005, type: 'MEME' },
  { symbol: 'SHIB/USDT', priceMultiplier: 0.0000005, type: 'MEME' },
  { symbol: 'FLOKI/USDT', priceMultiplier: 0.000001, type: 'MEME' },
  { symbol: 'SUI/USDT', priceMultiplier: 0.03, type: 'VOLUME' },
  { symbol: 'AR/USDT', priceMultiplier: 0.4, type: 'VOLUME' },
  { symbol: 'SOL/USDT', priceMultiplier: 0.002, type: 'VOLUME' },
];

export const SrbmprTradingView3DChart: React.FC<Props> = ({
  selectedAsset = 'BTC/USDT',
  livePrice = 67420.50
}) => {
  const [activeAsset, setActiveAsset] = useState<AssetSymbol>('ZEC/USDT');
  const [assetPrice, setAssetPrice] = useState<number>(31.42);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Expanded Funded Account Tiers ($2,000 up to $2,000,000)
  const FUNDED_TIERS = [
    { label: '$2,000 Tier', value: 2000 },
    { label: '$3,000 Tier', value: 3000 },
    { label: '$5,000 Tier', value: 5000 },
    { label: '$10,000 Tier', value: 10000 },
    { label: '$50,000 Tier', value: 50000 },
    { label: '$100,000 Tier', value: 100000 },
    { label: '$1,000,000 Tier', value: 1000000 },
    { label: '$1,500,000 Tier', value: 1500000 },
    { label: '$2,000,000 Tier', value: 2000000 }
  ];

  const [selectedFundedSize, setSelectedFundedSize] = useState<number>(2000);
  const [riskPercent, setRiskPercent] = useState<number>(0.1); // default 0.1% for safe risk containment

  // Tool Measurements State (TradingView Risk Management tool mimic)
  const [isMeasurementFrozen, setIsMeasurementFrozen] = useState<boolean>(true);
  const [measurementEntry, setMeasurementEntry] = useState<number>(31.42);
  const [measurementSl, setMeasurementSl] = useState<number>(30.42); // exact $1 SL
  const [measurementTarget, setMeasurementTarget] = useState<number>(131.42); // 1:100 ratio
  const [customRrMultiple, setCustomRrMultiple] = useState<number>(100);

  // Active Trade Status
  const [isTradeActive, setIsTradeActive] = useState<boolean>(false);
  const [tradeTimer, setTradeTimer] = useState<number>(600); // 10 minutes (600s) maximum countdown
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Sync pricing for chosen assets
  useEffect(() => {
    const chosen = MULTI_ASSET_TEN.find(a => a.symbol === activeAsset);
    if (chosen) {
      const basePrice = activeAsset === 'ZEC/USDT' ? 31.42 : livePrice * chosen.priceMultiplier;
      setAssetPrice(Number(basePrice.toFixed(4)));
      setMeasurementEntry(Number(basePrice.toFixed(4)));
      setMeasurementSl(Number((basePrice - 1.00).toFixed(4))); // $1.00 stop distance
      setMeasurementTarget(Number((basePrice + 100.00).toFixed(4)));
    }
  }, [activeAsset, livePrice]);

  // Max 10-Minute Hard Cutoff Timer
  useEffect(() => {
    let interval: any;
    if (isTradeActive && tradeTimer > 0) {
      interval = setInterval(() => {
        setTradeTimer(prev => {
          if (prev <= 1) {
            setIsTradeActive(false);
            return 600;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTradeActive, tradeTimer]);

  // Live price tick changes measurement calculations
  useEffect(() => {
    if (!isMeasurementFrozen) {
      setMeasurementEntry(assetPrice);
      setMeasurementSl(Number((assetPrice - 1.00).toFixed(4)));
      setMeasurementTarget(Number((assetPrice + customRrMultiple).toFixed(4)));
    }
  }, [assetPrice, isMeasurementFrozen, customRrMultiple]);

  // Simulate price ticks for current active coin
  useEffect(() => {
    const interval = setInterval(() => {
      setAssetPrice(prev => {
        const delta = (Math.random() - 0.5) * 0.08;
        return Number((prev + delta).toFixed(4));
      });
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  const upcomerRiskValue = (selectedFundedSize * riskPercent) / 100;
  const slDistance = Math.abs(measurementEntry - measurementSl) || 1.00;
  const computedPositionSize = Number((upcomerRiskValue / slDistance).toFixed(2));

  const handleCopy = (val: string, label: string) => {
    navigator.clipboard.writeText(val);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const isNearSl = assetPrice <= (measurementSl + 0.15) && assetPrice >= measurementSl;

  return (
    <div className={`bg-[#020406] border-2 border-emerald-500 rounded-[32px] p-6 sm:p-8 shadow-[0_0_90px_rgba(16,185,129,0.18)] font-mono text-zinc-100 space-y-6 transition-all duration-500 ${
      isFullscreen ? 'fixed inset-0 z-[9999] overflow-y-auto rounded-none border-none p-8' : ''
    }`}>
      
      {/* HEADER CONTROLS WITH FULLSCREEN AND LOGS */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-900 pb-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-black text-white tracking-[0.1em] uppercase flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-400" />
              SRBMPR PREMIUM TRADINGVIEW TOOL OVERLAY
            </h2>
            <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">
              REAL-TIME HIGH FIDELITY
            </span>
          </div>
          <p className="text-[10px] text-zinc-500 font-bold uppercase mt-1">
            Dynamic Position Sizing & Live Risk Overlay for Prop/Funded Verification
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-2 text-zinc-300 transition-all"
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="w-4 h-4 text-emerald-400" /> Collapse Screen
              </>
            ) : (
              <>
                <Maximize2 className="w-4 h-4 text-emerald-400" /> Maximize Fullscreen
              </>
            )}
          </button>
        </div>
      </div>

      {/* 10-Asset Switcher Ribbon */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            10 VOLATILITY CRYPTO ASSETS
          </span>
          <span className="text-[10px] text-zinc-500 font-bold uppercase">Click Coin to Load Immediately</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2">
          {MULTI_ASSET_TEN.map(coin => {
            const isSelected = activeAsset === coin.symbol;
            return (
              <button
                key={coin.symbol}
                onClick={() => {
                  setActiveAsset(coin.symbol);
                  setIsTradeActive(false);
                  setTradeTimer(600);
                }}
                className={`p-3 rounded-xl border text-center transition-all ${
                  isSelected 
                    ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]' 
                    : 'bg-zinc-950 border-zinc-900 text-zinc-400 hover:text-white hover:border-zinc-800'
                }`}
              >
                <div className="text-xs font-black">{coin.symbol.replace('/USDT', '')}</div>
                <div className="text-[9px] text-zinc-500 font-bold uppercase mt-1">{coin.type}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT PANEL: ACTIVE FUNDED ACCOUNT SIZER */}
        <div className="lg:col-span-4 bg-zinc-950/80 border border-zinc-900 rounded-2xl p-5 space-y-6">
          <div className="border-b border-zinc-900 pb-3 flex items-center justify-between">
            <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-400" /> Funded Account Tier
            </h4>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-[9px] font-bold">
              Upcomer Setup
            </span>
          </div>

          {/* Account Sizes Selector List */}
          <div className="space-y-2">
            <label className="text-[10px] text-zinc-500 font-bold uppercase">Funded Program Size (Select Target Layer)</label>
            <div className="grid grid-cols-3 gap-1.5">
              {FUNDED_TIERS.map(tier => (
                <button
                  key={tier.value}
                  onClick={() => setSelectedFundedSize(tier.value)}
                  className={`py-2 rounded-lg text-[9px] font-black border transition-all ${
                    selectedFundedSize === tier.value 
                      ? 'bg-zinc-900 text-white border-amber-500/60 shadow-[0_0_10px_rgba(245,158,11,0.15)]' 
                      : 'bg-black text-zinc-500 border-zinc-900 hover:text-zinc-300'
                  }`}
                >
                  {tier.label.replace(' Tier', '')}
                </button>
              ))}
            </div>
          </div>

          {/* Risk Control */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <label className="text-[10px] text-zinc-500 font-bold uppercase">Risk Allowed Per Rocket-Cycle</label>
              <span className="text-[10px] text-emerald-400 font-bold">Safe Lock</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[0.1, 0.25, 0.5].map(pct => (
                <button
                  key={pct}
                  onClick={() => setRiskPercent(pct)}
                  className={`py-1.5 rounded-lg text-[10px] font-black transition-all ${
                    riskPercent === pct 
                      ? 'bg-emerald-500 text-black font-black shadow-lg shadow-emerald-500/20' 
                      : 'bg-black text-zinc-500 border border-zinc-900 hover:text-zinc-300'
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>

          {/* Sizing Information Display */}
          <div className="bg-black/80 border border-zinc-900 p-4 rounded-xl space-y-3 text-[11px]">
            <div className="flex justify-between">
              <span className="text-zinc-500 uppercase font-bold">Cash Risk Budget:</span>
              <span className="text-white font-black">${upcomerRiskValue.toFixed(2)} USD</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500 uppercase font-bold">SL Floor (1R Distance):</span>
              <span className="text-rose-400 font-black">${slDistance.toFixed(4)}</span>
            </div>
            <div className="flex justify-between border-t border-zinc-900 pt-2 text-xs">
              <span className="text-zinc-400 font-black uppercase">Calculated Position Size:</span>
              <span className="text-emerald-400 font-black">{computedPositionSize.toLocaleString()} Units</span>
            </div>
          </div>

          {/* 10-Min Timer Countdown */}
          <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800 space-y-1.5">
            <div className="flex justify-between text-[10px]">
              <span className="text-zinc-500 uppercase font-bold">10-Min Hard Cut-off Timer</span>
              <span className="text-amber-400 font-bold">SELF-CUT ACTIVE</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-zinc-400">Time to Force Closure:</span>
              <span className={`text-sm font-black font-mono ${isTradeActive ? 'text-rose-400 animate-pulse' : 'text-zinc-500'}`}>
                {Math.floor(tradeTimer / 60)}:{(tradeTimer % 60).toString().padStart(2, '0')}s
              </span>
            </div>
          </div>

          {/* Copy price values directly */}
          <div className="space-y-2 pt-2">
            <span className="text-[10px] text-zinc-500 font-bold uppercase block">Copy Parameters to Broker:</span>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleCopy(measurementEntry.toString(), 'ENTRY')}
                className="bg-zinc-900 hover:bg-zinc-850 p-2 rounded-lg border border-zinc-800 text-[10px] text-zinc-300 font-bold flex flex-col items-center gap-1 transition"
              >
                <span>Entry</span>
                <span className="text-white text-[11px]">${measurementEntry.toFixed(4)}</span>
              </button>
              <button
                onClick={() => handleCopy(measurementSl.toString(), 'SL')}
                className="bg-zinc-900 hover:bg-zinc-850 p-2 rounded-lg border border-rose-950 text-[10px] text-rose-400 font-bold flex flex-col items-center gap-1 transition"
              >
                <span>Stop Loss</span>
                <span className="text-rose-400 text-[11px]">${measurementSl.toFixed(4)}</span>
              </button>
              <button
                onClick={() => handleCopy(measurementTarget.toString(), 'TARGET')}
                className="bg-zinc-900 hover:bg-zinc-850 p-2 rounded-lg border border-emerald-950 text-[10px] text-emerald-400 font-bold flex flex-col items-center gap-1 transition"
              >
                <span>Target</span>
                <span className="text-emerald-400 text-[11px]">${measurementTarget.toFixed(4)}</span>
              </button>
            </div>
          </div>

        </div>

        {/* RIGHT PANEL: LIVE TRADINGVIEW-STYLE CANVAS WITH DRAGGABLE LONG/SHORT POSITION overlay */}
        <div className="lg:col-span-8 bg-zinc-950/80 border border-zinc-900 rounded-2xl p-5 flex flex-col justify-between space-y-4 relative">
          
          <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
            <span className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              LIVE TradingView Chart Simulation & Position Tool
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMeasurementFrozen(!isMeasurementFrozen)}
                className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase flex items-center gap-1.5 transition-all ${
                  isMeasurementFrozen 
                    ? 'bg-amber-500 text-black font-black' 
                    : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-zinc-200'
                }`}
              >
                <Lock className="w-3 h-3" />
                {isMeasurementFrozen ? 'Freeze Tool' : 'Unfreeze & Sync'}
              </button>
            </div>
          </div>

          {/* Premium TradingView Dark Grid Canvas with Draggable Overlays */}
          <div className="relative h-96 bg-[#0c0d12] border border-zinc-900 rounded-2xl overflow-hidden flex select-none">
            
            {/* Grid Lines Overlay */}
            <div className="absolute inset-0 grid grid-cols-12 grid-rows-8 opacity-10 pointer-events-none">
              {Array.from({ length: 96 }).map((_, i) => (
                <div key={i} className="border-b border-r border-zinc-700" />
              ))}
            </div>

            {/* TradingView-Style Price Scale Right */}
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-[#0c0d12]/95 border-l border-zinc-900 z-30 flex flex-col justify-between py-6 text-[9px] text-zinc-500 font-black pr-2 text-right">
              <div>${(measurementEntry + 3.0).toFixed(2)}</div>
              <div>${(measurementEntry + 1.5).toFixed(2)}</div>
              <div className="text-emerald-400">${measurementEntry.toFixed(2)}</div>
              <div>${(measurementEntry - 1.5).toFixed(2)}</div>
              <div className="text-rose-400">${measurementSl.toFixed(2)}</div>
              <div>${(measurementEntry - 3.0).toFixed(2)}</div>
            </div>

            {/* Simulated Live Candles Rendering */}
            <div className="flex-1 relative flex items-end justify-around px-8 pb-10 pt-6">
              
              {/* Candles Loop */}
              {[
                { o: 60, h: 85, l: 45, c: 80, dir: 'up' },
                { o: 80, h: 95, l: 70, c: 75, dir: 'down' },
                { o: 75, h: 90, l: 65, c: 88, dir: 'up' },
                { o: 88, h: 110, l: 80, c: 105, dir: 'up' },
                { o: 105, h: 120, l: 95, c: 100, dir: 'down' },
                { o: 100, h: 140, l: 90, c: 135, dir: 'up' },
                { o: 135, h: 170, l: 125, c: 165, dir: 'up' },
                { o: 165, h: 185, l: 150, c: 155, dir: 'down' },
                { o: 155, h: 220, l: 145, c: 210, dir: 'up' },
                { o: 210, h: 240, l: 195, c: 235, dir: 'up' },
              ].map((cand, idx) => (
                <div key={idx} className="relative flex flex-col items-center w-full max-w-[18px]">
                  {/* Wick */}
                  <div 
                    className={`w-[1.5px] ${cand.dir === 'up' ? 'bg-emerald-500/60' : 'bg-rose-500/60'}`}
                    style={{
                      height: `${cand.h - cand.l}px`,
                      marginBottom: `${cand.l - 40}px`
                    }}
                  />
                  {/* Candle Body */}
                  <div 
                    className={`w-3.5 rounded-sm relative z-10 transition-all ${
                      cand.dir === 'up' 
                        ? 'bg-emerald-500 border border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.3)]' 
                        : 'bg-rose-500 border border-rose-400 shadow-[0_0_8px_rgba(239,68,68,0.3)]'
                    }`}
                    style={{
                      height: `${Math.abs(cand.o - cand.c)}px`,
                      bottom: `${Math.min(cand.o, cand.c) - 40}px`,
                      position: 'absolute'
                    }}
                  />
                </div>
              ))}

              {/* TRADINGVIEW LONG POSITION TOOL OVERLAY */}
              <div className="absolute inset-x-0 bottom-24 top-16 z-20 pointer-events-none flex flex-col justify-between">
                
                {/* Green Profit/Target Container Shaded Box */}
                <div className="h-1/2 bg-emerald-500/15 border-t-2 border-emerald-400 flex flex-col justify-between p-3 relative">
                  <div className="absolute top-2 right-20 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30 text-[9px] text-emerald-400 font-bold">
                    Risk/Reward Ratio: {customRrMultiple.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-emerald-400 font-black flex justify-between items-center pr-16">
                    <span className="uppercase tracking-wider">Target Area (Profit Container)</span>
                    <span>${measurementTarget.toFixed(4)}</span>
                  </div>
                </div>

                {/* Red Risk/Stop Loss Shaded Box */}
                <div className="h-1/2 bg-rose-500/15 border-t-2 border-white border-b-2 border-rose-500 flex flex-col justify-between p-3 relative">
                  <div className="text-[10px] text-white font-black flex justify-between items-center pr-16 bg-zinc-950/40 py-1 rounded px-2">
                    <span className="uppercase tracking-wider">Entry Point</span>
                    <span className="animate-pulse">${measurementEntry.toFixed(4)}</span>
                  </div>
                  <div className="text-[10px] text-rose-400 font-black flex justify-between items-center pr-16">
                    <span className="uppercase tracking-wider">Stop Loss Area (Risk Container)</span>
                    <span>${measurementSl.toFixed(4)}</span>
                  </div>
                </div>

              </div>

            </div>

            {/* Horizontal Watermark Logo */}
            <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
              <span className="text-5xl font-black tracking-widest text-white">SRBMPR PRO</span>
            </div>

          </div>

          {/* ACTION BUTTONS TO TRIGGER TRADE */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                setIsTradeActive(true);
                setTradeTimer(600);
              }}
              className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all"
            >
              <Play className="w-4 h-4" /> Start Validated Scalping Run
            </button>
            <button
              onClick={() => {
                setIsTradeActive(false);
                setTradeTimer(600);
              }}
              className="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
            >
              Reset Tool
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
