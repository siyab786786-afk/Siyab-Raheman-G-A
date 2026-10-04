import React, { useState, useEffect, useMemo } from 'react';
import { ExchangeId, AssetSymbol, Srbmpr2526LayerState, ScalpingContainer, ScalpingTicket, Side } from '../types/terminal';
import { Ticket, ShieldCheck, Clock, Zap, ArrowRight, CheckCircle2, AlertTriangle, XCircle, TrendingUp, TrendingDown, DollarSign, Wallet, Percent, Flame, RefreshCw, Lock, FileText } from 'lucide-react';

interface SrScalpingTicketTerminalProps {
  exchange: ExchangeId;
  asset: AssetSymbol;
  layerState: Srbmpr2526LayerState | null;
  livePrice: number;
  onFullSync?: () => void;
  onOpenAuditReport?: () => void;
}

export const SrScalpingTicketTerminal: React.FC<SrScalpingTicketTerminalProps> = ({
  exchange,
  asset,
  layerState,
  livePrice,
  onFullSync,
  onOpenAuditReport,
}) => {
  // User risk and balance settings
  const [userBalance, setUserBalance] = useState<number>(50.00);
  const [userRisk, setUserRisk] = useState<number>(2.00);
  const [selectedContainer, setSelectedContainer] = useState<ScalpingContainer>('1:5');
  
  // Active ticket state
  const [activeTicket, setActiveTicket] = useState<ScalpingTicket | null>(null);
  const [recentCompleted, setRecentCompleted] = useState<ScalpingTicket[]>([]);

  // Decimals helper
  const isGold = asset.includes('GOLD') || asset.includes('PAXG');
  const decimals = isGold ? 3 : 2;
  const factor = 10 ** decimals;

  // Multiplier for target based on container
  const containerMultiplier = selectedContainer === '1:5' ? 5 : selectedContainer === '1:10' ? 10 : 15;
  const containerMinutes = selectedContainer === '1:5' ? 5 : selectedContainer === '1:10' ? 10 : 15;

  // Order lock state: true whenever ticket is PENDING_LIMIT or FILLED
  const isOrderLocked = activeTicket?.status === 'PENDING_LIMIT' || activeTicket?.status === 'FILLED';

  // Base limit entry from market behavior layer (used only when no locked order is active)
  const projectedLimitEntry = useMemo(() => {
    if (!layerState || layerState.entryPrice <= 0) {
      return livePrice > 0 ? livePrice : 84250.00;
    }
    return layerState.entryPrice;
  }, [layerState, livePrice]);

  const side: Side = useMemo(() => {
    if (activeTicket) return activeTicket.side;
    if (layerState && layerState.activeLayer) {
      return 'LONG'; // Scalping continuation bias
    }
    return 'LONG';
  }, [layerState, activeTicket]);

  // Dynamic 0.10% SL space
  const slDistance = useMemo(() => {
    const entry = projectedLimitEntry;
    return Math.round(entry * 0.001 * factor) / factor;
  }, [projectedLimitEntry, factor]);

  const displaySL = useMemo(() => {
    const entry = projectedLimitEntry;
    const raw = side === 'LONG' ? entry - slDistance : entry + slDistance;
    return Math.round(raw * factor) / factor;
  }, [projectedLimitEntry, slDistance, side, factor]);

  const targetPrice = useMemo(() => {
    const entry = projectedLimitEntry;
    const raw = side === 'LONG' 
      ? entry + (slDistance * containerMultiplier)
      : entry - (slDistance * containerMultiplier);
    return Math.round(raw * factor) / factor;
  }, [projectedLimitEntry, slDistance, containerMultiplier, side, factor]);

  // Sizing calculation based on user risk
  const calculatedQty = useMemo(() => {
    if (slDistance <= 0) return 0;
    const rawQty = userRisk / slDistance;
    return Number(rawQty.toFixed(isGold ? 3 : 4));
  }, [userRisk, slDistance, isGold]);

  const estimatedLoss = -userRisk;
  const estimatedProfit = userRisk * containerMultiplier;

  // STRICTLY LOCKED VALUES: If active order is PENDING_LIMIT or FILLED,
  // NEVER recalculate from live ticker or layer updates!
  const displayedLimitEntry = isOrderLocked ? activeTicket.limitEntry : projectedLimitEntry;
  const displayedSL = isOrderLocked ? activeTicket.displaySL : displaySL;
  const displayedTarget = isOrderLocked ? activeTicket.targetPrice : targetPrice;
  const displayedSLDistance = isOrderLocked ? activeTicket.slDistance : slDistance;
  const displayedQty = isOrderLocked ? activeTicket.quantity : calculatedQty;
  const displayedRisk = isOrderLocked ? activeTicket.userRisk : userRisk;
  const displayedLoss = isOrderLocked ? activeTicket.estimatedLoss : estimatedLoss;
  const displayedProfit = isOrderLocked ? activeTicket.estimatedProfit : estimatedProfit;

  // Countdown timer for active filled ticket
  const [secondsRemaining, setSecondsRemaining] = useState<number>(containerMinutes * 60);

  useEffect(() => {
    if (!activeTicket || activeTicket.status !== 'FILLED') {
      return;
    }

    const interval = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleTimeExpire();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTicket]);

  // Live order execution monitoring on livePrice ticks
  useEffect(() => {
    if (!activeTicket || livePrice <= 0) return;

    // 1. Check Fill for PENDING_LIMIT order
    if (activeTicket.status === 'PENDING_LIMIT') {
      const isFilled = activeTicket.side === 'LONG'
        ? livePrice <= activeTicket.limitEntry
        : livePrice >= activeTicket.limitEntry;

      if (isFilled) {
        // Transition to FILLED (Waiting Zone Active) — Locked Coordinates Preserved!
        setActiveTicket(prev => prev ? ({
          ...prev,
          status: 'FILLED',
          filledAt: Date.now(),
          fillPrice: activeTicket.limitEntry
        }) : null);
        setSecondsRemaining(activeTicket.timeWindowMin * 60);
      }
      return;
    }

    // 2. Check Active FILLED Order Monitoring (Waiting Zone)
    if (activeTicket.status === 'FILLED') {
      const entry = activeTicket.fillPrice || activeTicket.limitEntry;
      const isLong = activeTicket.side === 'LONG';

      // Real-time live P&L calculation based on frozen entry & frozen quantity
      const pnlDollar = isLong
        ? (livePrice - entry) * activeTicket.quantity
        : (entry - livePrice) * activeTicket.quantity;
      const pnlPercent = (pnlDollar / userBalance) * 100;

      // Check Target Hit against frozen target price
      const isTargetHit = isLong ? livePrice >= activeTicket.targetPrice : livePrice <= activeTicket.targetPrice;
      if (isTargetHit) {
        const finishedTicket: ScalpingTicket = {
          ...activeTicket,
          status: 'TARGET_HIT',
          currentPnlDollar: activeTicket.estimatedProfit,
          currentPnlPercent: (activeTicket.estimatedProfit / userBalance) * 100
        };
        setActiveTicket(finishedTicket);
        setRecentCompleted(prev => [finishedTicket, ...prev.slice(0, 4)]);
        
        // Auto-progress sequence: 1:5 -> 1:10 -> 1:15
        if (selectedContainer === '1:5') {
          setTimeout(() => setSelectedContainer('1:10'), 2500);
        } else if (selectedContainer === '1:10') {
          setTimeout(() => setSelectedContainer('1:15'), 2500);
        }
        return;
      }

      // Check Stop Loss Breached against frozen SL price
      const isSLHit = isLong ? livePrice <= activeTicket.displaySL : livePrice >= activeTicket.displaySL;
      if (isSLHit) {
        const stoppedTicket: ScalpingTicket = {
          ...activeTicket,
          status: 'SL_HIT',
          currentPnlDollar: activeTicket.estimatedLoss,
          currentPnlPercent: (activeTicket.estimatedLoss / userBalance) * 100
        };
        setActiveTicket(stoppedTicket);
        setRecentCompleted(prev => [stoppedTicket, ...prev.slice(0, 4)]);
        return;
      }

      // Update ticking P&L only (coordinates remain 100% frozen)
      setActiveTicket(prev => prev ? ({
        ...prev,
        currentPnlDollar: Number(pnlDollar.toFixed(2)),
        currentPnlPercent: Number(pnlPercent.toFixed(2))
      }) : null);
    }
  }, [livePrice, activeTicket, userBalance, selectedContainer]);

  const handleTimeExpire = () => {
    if (!activeTicket) return;
    const expiredTicket: ScalpingTicket = {
      ...activeTicket,
      status: 'CLOSED'
    };
    setActiveTicket(expiredTicket);
    setRecentCompleted(prev => [expiredTicket, ...prev.slice(0, 4)]);
  };

  const handleCreateTicket = () => {
    const now = Date.now();
    const newTicket: ScalpingTicket = {
      id: `TKT-${Math.random().toString(36).substring(4, 9).toUpperCase()}`,
      symbol: asset,
      exchange,
      container: selectedContainer,
      side,
      timeWindowMin: containerMinutes,
      limitEntry: projectedLimitEntry, // Strictly frozen
      targetPrice, // Strictly frozen
      displaySL, // Strictly frozen
      slDistance, // Strictly frozen
      quantity: calculatedQty, // Strictly frozen
      userBalance,
      userRisk,
      estimatedLoss,
      estimatedProfit,
      status: 'PENDING_LIMIT', // Clearly set to PENDING_LIMIT
      createdAt: now,
      expiresAt: now + containerMinutes * 60 * 1000
    };
    setActiveTicket(newTicket);
    setSecondsRemaining(containerMinutes * 60);
  };

  const handleCancelTicket = () => {
    setActiveTicket(null);
  };

  const handleManualClose = () => {
    if (activeTicket) {
      const closed: ScalpingTicket = {
        ...activeTicket,
        status: 'CLOSED'
      };
      setRecentCompleted(prev => [closed, ...prev.slice(0, 4)]);
      setActiveTicket(null);
    }
  };

  // Format MM:SS
  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 lg:p-8 shadow-2xl relative overflow-hidden">
      
      {/* Top Banner: One-Click Scalping Window Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-white/5 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
            <Ticket className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-white tracking-widest uppercase">
                SCALPING LIMIT FLIGHT TICKET
              </h2>
              <span className="text-[9px] bg-blue-500/10 text-blue-400 font-mono font-bold px-2 py-0.5 rounded border border-blue-500/30">
                BYBIT V5 LIVE
              </span>
            </div>
            <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider mt-0.5">
              1-Minute Behavior Engine • 5m / 10m / 15m Scalping Horizons • Waiting Zone Protected
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Scalping Container Selector: 1:5 -> 1:10 -> 1:15 */}
          <div className="flex items-center gap-2 bg-black/60 p-1.5 rounded-2xl border border-white/5">
            {(['1:5', '1:10', '1:15'] as ScalpingContainer[]).map((c) => {
              const min = c === '1:5' ? '5m' : c === '1:10' ? '10m' : '15m';
              const isSelected = selectedContainer === c;
              return (
                <button
                  key={c}
                  disabled={isOrderLocked}
                  onClick={() => setSelectedContainer(c)}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
                    isSelected
                      ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5 disabled:opacity-40'
                  }`}
                >
                  <span>{c}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded ${isSelected ? 'bg-black/20 text-black' : 'bg-white/5 text-zinc-500'}`}>
                    {min}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 24H Broker Audit Certificate Button */}
          {onOpenAuditReport && (
            <button
              onClick={onOpenAuditReport}
              className="px-4 py-2.5 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-black text-xs uppercase tracking-wider flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(16,185,129,0.15)] whitespace-nowrap"
              title="24-Hour Broker Proof Audit & Growth Report"
            >
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>24H BROKER AUDIT (PDF/PROOF)</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Two-Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT PANEL: LIMIT ORDER TICKET DETAILS */}
        <div className="lg:col-span-7 bg-[#05080f] border border-white/10 rounded-[32px] p-6 lg:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden">
          
          {/* Header of Ticket */}
          <div>
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-black text-zinc-400 uppercase tracking-widest">
                  FLIGHT #{activeTicket ? activeTicket.id : `NEXT-${asset.replace('/', '')}`}
                </span>
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  {side} LIMIT
                </span>

                {/* Status Indicator Badge */}
                {activeTicket?.status === 'PENDING_LIMIT' && (
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1.5 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    PENDING_LIMIT
                  </span>
                )}

                {activeTicket?.status === 'FILLED' && (
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    FILLED
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 font-mono text-[10px] text-zinc-500">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                <span>HORIZON: {containerMinutes} MIN</span>
              </div>
            </div>

            {/* PENDING_LIMIT Notice when Order is active & waiting for fill */}
            {activeTicket?.status === 'PENDING_LIMIT' && (
              <div className="mb-6 p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between animate-in fade-in">
                <div className="flex items-center gap-3.5">
                  <div className="w-4 h-4 rounded-full bg-amber-500/30 border border-amber-500 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-black text-amber-400 uppercase tracking-widest">
                        STATUS: PENDING_LIMIT
                      </h4>
                      <span className="text-[9px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-black font-mono flex items-center gap-1">
                        <Lock className="w-3 h-3" /> LOCKED & FROZEN
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase mt-1 leading-relaxed">
                      Entry (${displayedLimitEntry.toLocaleString()}), SL (${displayedSL.toLocaleString()}), and Target (${displayedTarget.toLocaleString()}) are strictly locked against ticker recalculation.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCancelTicket}
                  className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ml-4"
                >
                  Cancel Order
                </button>
              </div>
            )}

            {/* FILLED Notice (Waiting Zone Active — No New Entry Projected) */}
            {activeTicket?.status === 'FILLED' && (
              <div className="mb-6 p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between animate-in fade-in">
                <div className="flex items-center gap-3.5">
                  <div className="w-4 h-4 rounded-full bg-emerald-500/30 border border-emerald-500 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-black text-emerald-400 uppercase tracking-widest">
                        STATUS: FILLED (WAITING ZONE ACTIVE)
                      </h4>
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-black font-mono flex items-center gap-1">
                        <Lock className="w-3 h-3" /> LOCKED
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase mt-1 leading-relaxed">
                      Filled @ ${activeTicket.fillPrice?.toLocaleString() || displayedLimitEntry.toLocaleString()} • Running in Waiting Zone • No new entry projected until trade closes
                    </p>
                  </div>
                </div>
                <div className="text-right font-mono whitespace-nowrap ml-4">
                  <div className="text-[9px] text-zinc-500 uppercase font-black">Window Time Left</div>
                  <div className="text-base font-black text-amber-400">{formatCountdown(secondsRemaining)}</div>
                </div>
              </div>
            )}

            {/* Target Hit celebration */}
            {activeTicket?.status === 'TARGET_HIT' && (
              <div className="mb-6 p-5 rounded-2xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-between animate-in fade-in">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  <div>
                    <h4 className="text-xs font-black text-emerald-300 uppercase tracking-widest">
                      {selectedContainer} TARGET ACHIEVED (+${activeTicket.estimatedProfit.toFixed(2)})
                    </h4>
                    <p className="text-[10px] text-emerald-400/80 font-bold uppercase mt-0.5">
                      Completed 100% cleanly • Next Scalping Horizon ready
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTicket(null)}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-xl text-xs uppercase transition-all"
                >
                  Next Ticket
                </button>
              </div>
            )}

            {/* Stop Loss Hit */}
            {activeTicket?.status === 'SL_HIT' && (
              <div className="mb-6 p-5 rounded-2xl bg-rose-500/20 border border-rose-500/50 flex items-center justify-between animate-in fade-in">
                <div className="flex items-center gap-3">
                  <XCircle className="w-6 h-6 text-rose-400" />
                  <div>
                    <h4 className="text-xs font-black text-rose-300 uppercase tracking-widest">
                      STOP LOSS TRIGGERED (-${activeTicket.userRisk.toFixed(2)})
                    </h4>
                    <p className="text-[10px] text-rose-400/80 font-bold uppercase mt-0.5">
                      Risk contained strictly at 0.10% space • Trade closed cleanly
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTicket(null)}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-black rounded-xl text-xs uppercase transition-all"
                >
                  Reset Ticket
                </button>
              </div>
            )}

            {/* Big Flight Ticket Price Coordinates: Strictly Frozen when isOrderLocked */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
              
              {/* Limit Entry Box */}
              <div className={`p-6 rounded-2xl border space-y-2 transition-all ${
                isOrderLocked ? 'bg-zinc-950 border-amber-500/30' : 'bg-zinc-950 border-white/5'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-zinc-500 font-mono font-black uppercase tracking-widest flex items-center gap-1.5">
                    {isOrderLocked && <Lock className="w-3 h-3 text-amber-400" />}
                    FROZEN LIMIT ENTRY
                  </span>
                  <span className={`text-[9px] font-black font-mono ${isOrderLocked ? 'text-amber-400' : 'text-blue-400'}`}>
                    {isOrderLocked ? 'LOCKED SEAT' : 'EXACT SEAT'}
                  </span>
                </div>
                <div className="text-4xl font-black text-white font-mono tracking-tight">
                  ${displayedLimitEntry.toLocaleString()}
                </div>
                <div className="text-[9px] text-zinc-500 font-mono flex items-center justify-between">
                  <span>Live Distance: <strong className="text-white">${Math.abs(livePrice - displayedLimitEntry).toFixed(decimals)}</strong></span>
                  {isOrderLocked && <span className="text-amber-400/80 text-[8px] uppercase font-bold">Zero Drift</span>}
                </div>
              </div>

              {/* Target Price Box */}
              <div className={`p-6 rounded-2xl border space-y-2 transition-all ${
                isOrderLocked ? 'bg-zinc-950 border-emerald-500/40' : 'bg-zinc-950 border-emerald-500/20'
              }`}>
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-emerald-500/80 font-mono font-black uppercase tracking-widest flex items-center gap-1.5">
                    {isOrderLocked && <Lock className="w-3 h-3 text-emerald-400" />}
                    TARGET OBJECTIVE ({selectedContainer})
                  </span>
                  <span className="text-[9px] text-emerald-400 font-black font-mono">
                    {isOrderLocked ? 'LOCKED TARGET' : 'DESTINATION'}
                  </span>
                </div>
                <div className="text-4xl font-black text-emerald-400 font-mono tracking-tight">
                  ${displayedTarget.toLocaleString()}
                </div>
                <div className="text-[9px] text-emerald-500/60 font-mono flex items-center justify-between">
                  <span>Calculated Peak Horizon: <strong className="text-white">+{containerMultiplier}x Space</strong></span>
                  {isOrderLocked && <span className="text-emerald-400 text-[8px] uppercase font-bold">Protected</span>}
                </div>
              </div>
            </div>

            {/* Scalping Window Timeline Summary */}
            <div className="bg-black/40 border border-white/5 p-4 rounded-2xl flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                <span className="text-zinc-400">Current Market:</span>
                <span className="text-white font-bold">${livePrice.toLocaleString()}</span>
              </div>
              <div className="text-zinc-500">
                Window: <span className="text-amber-400 font-bold">{containerMinutes} Minutes</span>
              </div>
              <div className="text-zinc-500 flex items-center gap-1">
                {isOrderLocked && <Lock className="w-3 h-3 text-amber-400" />}
                Status: <span className={isOrderLocked ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                  {activeTicket ? activeTicket.status : 'READY_TO_PLACE'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Button Section */}
          <div className="mt-8 pt-6 border-t border-white/5">
            {!activeTicket && (
              <button
                onClick={handleCreateTicket}
                className="w-full py-5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-black font-black text-sm uppercase tracking-[0.2em] rounded-2xl shadow-[0_0_30px_rgba(245,158,11,0.3)] transition-all flex items-center justify-center gap-3 active:scale-[0.99]"
              >
                <Zap className="w-5 h-5 fill-black" />
                <span>CONFIRM & PLACE {containerMinutes}M LIMIT TICKET</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            )}

            {activeTicket?.status === 'PENDING_LIMIT' && (
              <div className="flex items-center justify-between bg-zinc-950 p-4 rounded-2xl border border-amber-500/20">
                <span className="text-xs font-bold text-amber-400 font-mono flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  Order Locked in PENDING_LIMIT • Awaiting Market Fill
                </span>
                <button
                  onClick={handleCancelTicket}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl text-xs font-black uppercase transition-all"
                >
                  Cancel Order
                </button>
              </div>
            )}

            {activeTicket?.status === 'FILLED' && (
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 bg-zinc-950 p-4 rounded-2xl border border-white/5 font-mono">
                  <span className="text-[9px] text-zinc-500 uppercase block font-black">Trade Progress</span>
                  <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    Running in Waiting Zone (No New Entry)
                  </span>
                </div>
                <button
                  onClick={handleManualClose}
                  className="px-6 py-4 bg-zinc-900 hover:bg-zinc-800 text-rose-400 hover:text-rose-300 rounded-2xl font-black text-xs uppercase tracking-wider transition-all border border-rose-500/20"
                >
                  Manual Exit / Close
                </button>
              </div>
            )}
          </div>

        </div>

        {/* RIGHT PANEL: CALCULATED RISK MANAGEMENT & LIVE P&L */}
        <div className="lg:col-span-5 bg-[#05080f] border border-white/10 rounded-[32px] p-6 lg:p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden">
          
          <div>
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-xs font-mono font-black text-white uppercase tracking-widest">
                  CALCULATED RISK PASSPORT
                </h3>
              </div>
              <span className="text-[10px] text-zinc-500 font-mono font-bold uppercase flex items-center gap-1">
                {isOrderLocked && <Lock className="w-3 h-3 text-amber-400" />}
                {isOrderLocked ? 'FIELDS LOCKED' : 'ZERO CONFUSION'}
              </span>
            </div>

            {/* User Account Balance Input with Quick Presets */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-zinc-400">
                <label className="flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5 text-blue-400" /> Available Balance
                </label>
                <span className="text-zinc-600">INPUT YOUR CAPITAL</span>
              </div>
              
              <div className="relative">
                <input
                  type="number"
                  disabled={isOrderLocked}
                  value={userBalance}
                  onChange={(e) => setUserBalance(Math.max(1, parseFloat(e.target.value) || 0))}
                  className="w-full bg-zinc-950 border border-white/10 rounded-2xl px-5 py-3 text-xl font-mono text-white font-black focus:outline-none focus:border-amber-500/50 disabled:opacity-60"
                  placeholder="50.00"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono text-zinc-500 font-bold">USD</div>
              </div>

              {/* Quick Presets */}
              <div className="flex items-center gap-2">
                {[20, 50, 100, 250, 500].map((preset) => (
                  <button
                    key={preset}
                    disabled={isOrderLocked}
                    onClick={() => setUserBalance(preset)}
                    className={`flex-1 py-1 rounded-lg text-[10px] font-mono font-bold border transition-all ${
                      userBalance === preset
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                        : 'bg-white/[0.02] text-zinc-500 border-white/5 hover:text-white disabled:opacity-40'
                    }`}
                  >
                    ${preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Risk Amount per Trade */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-zinc-400">
                <label className="flex items-center gap-1.5">
                  <Percent className="w-3.5 h-3.5 text-amber-400" /> Risk Amount
                </label>
                <span className="text-amber-400/80 font-mono">
                  {userBalance > 0 ? ((displayedRisk / userBalance) * 100).toFixed(1) : 0}% OF ACCOUNT
                </span>
              </div>

              <div className="relative">
                <input
                  type="number"
                  disabled={isOrderLocked}
                  value={userRisk}
                  onChange={(e) => setUserRisk(Math.max(0.5, parseFloat(e.target.value) || 0))}
                  className="w-full bg-zinc-950 border border-white/10 rounded-2xl px-5 py-3 text-xl font-mono text-white font-black focus:outline-none focus:border-amber-500/50 disabled:opacity-60"
                  placeholder="2.00"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-mono text-zinc-500 font-bold">USD</div>
              </div>

              {/* Risk Presets */}
              <div className="flex items-center gap-2">
                {[1, 2, 5, 10].map((r) => (
                  <button
                    key={r}
                    disabled={isOrderLocked}
                    onClick={() => setUserRisk(r)}
                    className={`flex-1 py-1 rounded-lg text-[10px] font-mono font-bold border transition-all ${
                      userRisk === r
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-white/[0.02] text-zinc-500 border-white/5 hover:text-white disabled:opacity-40'
                    }`}
                  >
                    ${r}
                  </button>
                ))}
              </div>
            </div>

            {/* Calculated Risk Display Coordinates: Frozen from activeTicket when isOrderLocked */}
            <div className={`p-5 rounded-2xl border space-y-3 font-mono text-xs transition-all ${
              isOrderLocked ? 'bg-zinc-950 border-amber-500/30' : 'bg-zinc-950 border-white/5'
            }`}>
              <div className="flex justify-between items-center text-zinc-400">
                <span className="flex items-center gap-1.5">
                  {isOrderLocked && <Lock className="w-3 h-3 text-amber-400" />}
                  Display Stop-Loss:
                </span>
                <span className="text-rose-400 font-black">${displayedSL.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-zinc-400">
                <span>0.10% SL Risk Distance:</span>
                <span className="text-zinc-300">±${displayedSLDistance.toFixed(decimals)}</span>
              </div>
              <div className="flex justify-between items-center text-zinc-400">
                <span className="flex items-center gap-1.5">
                  {isOrderLocked && <Lock className="w-3 h-3 text-amber-400" />}
                  Suggested Quantity:
                </span>
                <span className="text-white font-black">{displayedQty} {asset.split('/')[0]}</span>
              </div>
              <div className="flex justify-between items-center text-zinc-400 border-t border-white/5 pt-2">
                <span>Maximum Risk / Loss:</span>
                <span className="text-rose-400 font-bold">-${displayedRisk.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-zinc-400">
                <span>Projected Profit ({selectedContainer}):</span>
                <span className="text-emerald-400 font-black">+${displayedProfit.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* REAL-TIME LIVE P&L MONITOR */}
          <div className="mt-8 pt-6 border-t border-white/5">
            <div className="bg-black/60 border border-white/5 p-5 rounded-2xl">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-black uppercase text-zinc-500 font-mono tracking-widest flex items-center gap-1.5">
                  {activeTicket?.status === 'FILLED' && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />}
                  LIVE SCALPING P&L MONITOR
                </span>
                <span className="text-[9px] font-bold font-mono text-zinc-600">
                  {activeTicket?.status === 'FILLED' 
                    ? 'STREAMING REAL-TIME' 
                    : activeTicket?.status === 'PENDING_LIMIT'
                    ? 'AWAITING FILL'
                    : 'STANDBY'}
                </span>
              </div>

              {activeTicket?.status === 'FILLED' ? (
                <div className="space-y-3">
                  <div className="flex items-baseline justify-between">
                    <div className={`text-3xl font-black font-mono tracking-tight ${
                      (activeTicket.currentPnlDollar || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {(activeTicket.currentPnlDollar || 0) >= 0 ? '+' : ''}${activeTicket.currentPnlDollar?.toFixed(2)}
                    </div>
                    <div className={`text-base font-black font-mono ${
                      (activeTicket.currentPnlPercent || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {(activeTicket.currentPnlPercent || 0) >= 0 ? '+' : ''}{activeTicket.currentPnlPercent?.toFixed(1)}%
                    </div>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full transition-all duration-300"
                      style={{
                        width: `${Math.min(100, Math.max(5, ((activeTicket.currentPnlDollar || 0) / displayedProfit) * 100))}%`
                      }}
                    />
                  </div>
                </div>
              ) : activeTicket?.status === 'PENDING_LIMIT' ? (
                <div className="text-center py-4 text-amber-500/80 font-mono text-xs uppercase tracking-widest flex items-center justify-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  Order Locked in PENDING_LIMIT • P&L starts upon fill
                </div>
              ) : (
                <div className="text-center py-4 text-zinc-600 font-mono text-xs uppercase tracking-widest">
                  No active trade in waiting zone
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Recent Completed Tickets Bar */}
      {recentCompleted.length > 0 && (
        <div className="mt-8 pt-6 border-t border-white/5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest font-mono">
              RECENT COMPLETED SCALPING FLIGHTS
            </span>
            <span className="text-[9px] text-zinc-600 font-mono">LOCKED AUDIT TRAIL</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentCompleted.map((t, idx) => (
              <div key={idx} className="bg-zinc-950 p-4 rounded-2xl border border-white/5 font-mono text-xs space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-white font-bold">{t.id}</span>
                  <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                    t.status === 'TARGET_HIT' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                  }`}>
                    {t.status}
                  </span>
                </div>
                <div className="flex justify-between text-zinc-500 text-[10px]">
                  <span>P&L Result:</span>
                  <span className={(t.currentPnlDollar || 0) >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    {(t.currentPnlDollar || 0) >= 0 ? '+' : ''}${t.currentPnlDollar?.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
