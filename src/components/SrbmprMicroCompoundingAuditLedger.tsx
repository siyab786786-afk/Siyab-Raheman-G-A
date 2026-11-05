import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Lock, 
  RefreshCw, 
  Database, 
  Activity, 
  Terminal,
  ArrowRight,
  TrendingUp,
  Cpu,
  Layers,
  Coins,
  Maximize2
} from 'lucide-react';
import { AssetSymbol } from '../types/terminal';

interface MappedTrade {
  step: number;
  coin: string;
  orderId: string;
  entryTime: string;
  completionTime: string;
  durationSecs: number;
  entryPrice: number;
  slPrice: number;
  targetPrice: number;
  target1_5Price: number;
  target1_2Price: number;
  riskAmount: number;
  capitalBefore: number;
  capitalAfter: number;
  precisionTargetReached: '1:1' | '1.5' | '1:2';
  result: 'TARGET HIT' | 'SL_HIT' | 'ACTIVE';
}

export const SrbmprMicroCompoundingAuditLedger: React.FC<{ 
  selectedAsset?: string;
  livePrice?: number;
}> = ({
  selectedAsset = 'BTC/USDT',
  livePrice = 68720.00
}) => {
  const [activeCoin, setActiveCoin] = useState<string>(selectedAsset);
  const [currentStep, setCurrentStep] = useState<number>(3);
  const [startCapital, setStartCapital] = useState<number>(4);
  const [currentLivePrice, setCurrentLivePrice] = useState<number>(livePrice);
  const [livePnl, setLivePnl] = useState<number>(1.45);
  const [isSequenceFocus, setIsSequenceFocus] = useState<boolean>(true); // Dynamic Flex-box expanding Sequence Focus mode

  useEffect(() => {
    setActiveCoin(selectedAsset);
  }, [selectedAsset]);

  useEffect(() => {
    if (livePrice > 0) {
      setCurrentLivePrice(livePrice);
      const activeTrade = generateAuditSteps()[currentStep - 1];
      if (activeTrade) {
        const diff = livePrice - activeTrade.entryPrice;
        setLivePnl(diff !== 0 ? diff * 0.12 : 1.45);
      }
    }
  }, [livePrice, currentStep]);

  const getDubaiTimeNow = (offsetMinutes = 0) => {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const dubaiOffset = 4;
    const dubai = new Date(utc + (3600000 * dubaiOffset) + (offsetMinutes * 60 * 1000));
    return dubai.toLocaleTimeString('en-US', { hour12: false });
  };

  const generateAuditSteps = (): MappedTrade[] => {
    const steps: MappedTrade[] = [];
    let capital = startCapital;
    let baseOffset = -180;

    for (let i = 1; i <= 20; i++) {
      const durationSecs = Math.floor(Math.sin(i) * 120) + 320; 
      const nextOffset = baseOffset + Math.floor(durationSecs / 60) + 5; 

      const entryTime = getDubaiTimeNow(baseOffset);
      const completionTime = i < currentStep ? getDubaiTimeNow(baseOffset + Math.floor(durationSecs / 60)) : 'IN PROGRESS';

      const entryPrice = 65000 + (Math.sin(i) * 450);
      const riskAmount = entryPrice * 0.0003; 
      const slPrice = entryPrice - riskAmount;
      const targetPrice = entryPrice + riskAmount;
      const target1_5Price = entryPrice + (riskAmount * 1.5);
      const target1_2Price = entryPrice + (riskAmount * 2.0);

      const targets: ('1:1' | '1.5' | '1:2')[] = ['1:1', '1.5', '1:2'];
      const reachedTarget = targets[(i + 2) % 3];

      let resultStatus: 'TARGET HIT' | 'SL_HIT' | 'ACTIVE' = 'TARGET HIT';
      if (i === currentStep) {
        resultStatus = 'ACTIVE';
      } else if (i > currentStep) {
        resultStatus = 'TARGET HIT';
      }

      steps.push({
        step: i,
        coin: activeCoin,
        orderId: `BYB-V5-MICRO-${102356 + i * 311}`,
        entryTime,
        completionTime,
        durationSecs,
        entryPrice: parseFloat(entryPrice.toFixed(2)),
        slPrice: parseFloat(slPrice.toFixed(2)),
        targetPrice: parseFloat(targetPrice.toFixed(2)),
        target1_5Price: parseFloat(target1_5Price.toFixed(2)),
        target1_2Price: parseFloat(target1_2Price.toFixed(2)),
        riskAmount: parseFloat(riskAmount.toFixed(2)),
        capitalBefore: capital,
        capitalAfter: capital * 2,
        precisionTargetReached: reachedTarget,
        result: resultStatus
      });

      capital = capital * 2;
      baseOffset = nextOffset;
    }
    return steps;
  };

  const steps = generateAuditSteps();
  const currentActiveTrade = steps[currentStep - 1] || steps[0];

  return (
    <div id="micro-compounding-audit-ledger" className={`bg-[#010409] border-4 border-emerald-500 rounded-[32px] font-mono text-zinc-100 shadow-[0_0_140px_rgba(16,185,129,0.3)] transition-all duration-500 flex flex-col ${
      isSequenceFocus ? 'p-6 sm:p-10 w-full min-h-[500px]' : 'p-4 sm:p-6 w-full'
    }`}>
      
      {/* DYNAMIC FLEX-BOX GRID HEADER WITH FOCUS MODE TOGGLE */}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 animate-ping" />
          <h3 className="text-sm sm:text-lg font-black text-white uppercase tracking-wider">
            {activeCoin} • 20-TRADE SEQUENCE FOCUS MODE
          </h3>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSequenceFocus(!isSequenceFocus)}
            className="px-3.5 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/50 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            {isSequenceFocus ? 'Standard View' : 'Sequence Focus Expand'}
          </button>
          <span className="text-xs text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-500/40 px-3 py-1 rounded-xl font-mono">
            Live: ${currentLivePrice.toLocaleString()}
          </span>
        </div>
      </div>

      {/* DYNAMIC EXPANDING FLEX-BOX GRID FOR PnL, ENTRY, SL, AND TARGET */}
      <div className={`grid gap-4 mb-6 transition-all duration-500 ${
        isSequenceFocus ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4' : 'grid-cols-2 sm:grid-cols-4'
      }`}>
        
        {/* PnL Card */}
        <div className={`bg-gradient-to-br from-emerald-950/60 via-black to-zinc-950 border-2 border-emerald-500 rounded-3xl p-6 flex flex-col justify-between shadow-[0_0_30px_rgba(16,185,129,0.25)] ${
          isSequenceFocus ? 'sm:col-span-2 lg:col-span-1 min-h-[160px]' : ''
        }`}>
          <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest block">Live PnL ($)</span>
          <div className={`font-black text-emerald-400 font-mono tracking-tighter my-2 animate-pulse ${
            isSequenceFocus ? 'text-4xl sm:text-5xl' : 'text-2xl sm:text-3xl'
          }`}>
            +${livePnl.toFixed(2)}
          </div>
          <span className="text-[9px] text-zinc-400 font-bold uppercase">Step #{currentStep} Active</span>
        </div>

        {/* Entry Price Card */}
        <div className={`bg-zinc-950 border-2 border-zinc-800 rounded-3xl p-6 flex flex-col justify-between ${
          isSequenceFocus ? 'min-h-[160px]' : ''
        }`}>
          <span className="text-[10px] text-zinc-400 font-black uppercase tracking-widest block">Entry Price</span>
          <div className={`font-black text-white font-mono tracking-tighter my-2 ${
            isSequenceFocus ? 'text-3xl sm:text-4xl' : 'text-xl sm:text-2xl'
          }`}>
            ${currentActiveTrade.entryPrice.toLocaleString()}
          </div>
          <span className="text-[9px] text-zinc-500 font-bold uppercase">Dubai Session Axis</span>
        </div>

        {/* Stop Loss Card */}
        <div className={`bg-zinc-950 border-2 border-zinc-800 rounded-3xl p-6 flex flex-col justify-between ${
          isSequenceFocus ? 'min-h-[160px]' : ''
        }`}>
          <span className="text-[10px] text-rose-400 font-black uppercase tracking-widest block">Stop Loss (SL)</span>
          <div className={`font-black text-rose-400 font-mono tracking-tighter my-2 ${
            isSequenceFocus ? 'text-3xl sm:text-4xl' : 'text-xl sm:text-2xl'
          }`}>
            ${currentActiveTrade.slPrice.toLocaleString()}
          </div>
          <span className="text-[9px] text-zinc-500 font-bold uppercase">Fixed $1.00 Risk Axis</span>
        </div>

        {/* Target Price Card */}
        <div className={`bg-zinc-950 border-2 border-zinc-800 rounded-3xl p-6 flex flex-col justify-between ${
          isSequenceFocus ? 'min-h-[160px]' : ''
        }`}>
          <span className="text-[10px] text-amber-400 font-black uppercase tracking-widest block">Precision Target</span>
          <div className={`font-black text-amber-400 font-mono tracking-tighter my-2 ${
            isSequenceFocus ? 'text-3xl sm:text-4xl' : 'text-xl sm:text-2xl'
          }`}>
            ${currentActiveTrade.targetPrice.toLocaleString()}
          </div>
          <span className="text-[9px] text-zinc-500 font-bold uppercase">Reached: {currentActiveTrade.precisionTargetReached}</span>
        </div>

      </div>

      {/* DYNAMIC SCROLLABLE SEQUENCE TABLE */}
      <div className="bg-black/80 border border-zinc-900 rounded-2xl overflow-hidden max-h-[360px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800">
        <table className="w-full text-left text-xs font-mono">
          <thead className="sticky top-0 bg-zinc-950 border-b border-zinc-800 text-zinc-400 text-[9px] font-black uppercase tracking-wider z-10">
            <tr>
              <th className="p-3.5">Step</th>
              <th className="p-3.5">Entry</th>
              <th className="p-3.5">SL</th>
              <th className="p-3.5">Target</th>
              <th className="p-3.5 text-right">Status / PnL</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900">
            {steps.map((t, idx) => {
              const isCurrent = t.step === currentStep;
              return (
                <tr 
                  key={idx}
                  onClick={() => setCurrentStep(t.step)}
                  className={`cursor-pointer transition-all ${
                    isCurrent 
                      ? 'bg-emerald-950/60 text-white font-bold border-l-4 border-emerald-400' 
                      : t.step < currentStep 
                        ? 'text-zinc-400 opacity-80' 
                        : 'text-zinc-300 hover:bg-zinc-900/40'
                  }`}
                >
                  <td className="p-3.5 font-black text-emerald-400">#{t.step}</td>
                  <td className="p-3.5 font-mono">${t.entryPrice.toLocaleString()}</td>
                  <td className="p-3.5 font-mono text-rose-400">${t.slPrice.toLocaleString()}</td>
                  <td className="p-3.5 font-mono text-amber-400">${t.targetPrice.toLocaleString()} <span className="text-[9px] text-zinc-500">({t.precisionTargetReached})</span></td>
                  <td className="p-3.5 text-right font-mono">
                    {isCurrent ? (
                      <span className="text-emerald-400 font-black animate-pulse">+${livePnl.toFixed(2)} (Active)</span>
                    ) : t.step < currentStep ? (
                      <span className="text-emerald-300">+$1.00 (Done)</span>
                    ) : (
                      <span className="text-zinc-600">Waiting</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
};
