import React, { useState, useEffect } from 'react';
import { Shield, Coins, Percent, Target, Play, ShieldAlert, CheckCircle2, Lock, RefreshCw, Layers, ArrowUpRight, ArrowDownRight, Clock, HelpCircle } from 'lucide-react';
import { MicroRootRiskBudgetEngine, LiveReplayTrade } from '../services/MicroRootRiskBudgetEngine';
import { AssetSymbol } from '../types/terminal';

interface Props {
  selectedAsset?: AssetSymbol;
  livePrice?: number;
}

export const SrbmprRiskInputCleanTerminal: React.FC<Props> = ({
  selectedAsset = 'BTC/USDT',
  livePrice = 67420.50
}) => {
  const engine = MicroRootRiskBudgetEngine.getInstance();
  const [accountSize, setAccountSize] = useState<number>(100000);
  const [riskPercentage, setRiskPercentage] = useState<number>(0.5);
  const [activeTrade, setActiveTrade] = useState<LiveReplayTrade | null>(null);
  const [completedTrades, setCompletedTrades] = useState<LiveReplayTrade[]>(() => engine.getCompletedTrades());
  
  // Replay freeze & loop state
  const [isReplayFrozen, setIsReplayFrozen] = useState<boolean>(true);
  const [currentTestingPhase, setCurrentTestingPhase] = useState<'REPLAY_TEST' | 'FORWARD_TEST' | 'BACK_TEST'>('REPLAY_TEST');
  const [microCyclesAnalyzed, setMicroCyclesAnalyzed] = useState<number>(142);

  // Time & date
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toISOString().replace('T', ' ').substring(0, 19));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Update engine configurations whenever user tweaks inputs
  useEffect(() => {
    engine.setRiskConfig(accountSize, riskPercentage);
  }, [accountSize, riskPercentage]);

  // Simulated live price ticks updates if active trade is running
  useEffect(() => {
    const interval = setInterval(() => {
      const trade = engine.getActiveTrade();
      if (trade) {
        // Feed slight price volatility
        const randChange = (Math.random() - 0.5) * 0.4;
        const currentTick = Number((livePrice + randChange).toFixed(2));
        engine.updateActiveTradePrice(currentTick);
        setActiveTrade(engine.getActiveTrade());
        setCompletedTrades([...engine.getCompletedTrades()]);
      } else {
        setActiveTrade(null);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [livePrice]);

  const config = engine.getRiskConfig();

  const handleTriggerReplayVerify = () => {
    // Continuous protocol loop action: triggers entry on validated 1R stop distance
    const trade = engine.triggerTradeExecution(livePrice, 10, currentTestingPhase);
    setActiveTrade(trade);
    setIsReplayFrozen(true);
    setMicroCyclesAnalyzed(prev => prev + 1);
  };

  const cycleTestingPhase = () => {
    setCurrentTestingPhase(prev => {
      if (prev === 'REPLAY_TEST') return 'FORWARD_TEST';
      if (prev === 'FORWARD_TEST') return 'BACK_TEST';
      return 'REPLAY_TEST';
    });
  };

  return (
    <div className="bg-gradient-to-b from-[#0a0d12] via-black to-[#0a0d12] border-2 border-emerald-500 rounded-3xl p-6 sm:p-8 shadow-[0_0_90px_rgba(16,185,129,0.18)] font-mono text-zinc-100 space-y-6">
      
      {/* Top Title Section */}
      <div className="border-b border-zinc-800 pb-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <Shield className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
              SRBMPR RISK BUDGET INPUT & MICRO ROOT ENGINE
            </h2>
            <p className="text-[11px] text-zinc-400 mt-1">
              Risk Configured First → Micro Root Sequence Preservation → Measure Realized RR & P&L
            </p>
          </div>
        </div>

        {/* Live Replay Loop Mode Selector */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={cycleTestingPhase}
            className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 border border-zinc-800 rounded-xl text-[10px] font-black uppercase flex items-center gap-1.5"
          >
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>TEST PHASE: {currentTestingPhase.replace('_', ' ')}</span>
          </button>

          <button
            onClick={() => setIsReplayFrozen(!isReplayFrozen)}
            className={`px-3.5 py-2 rounded-xl text-[10px] font-black uppercase border transition-all flex items-center gap-1.5 ${
              isReplayFrozen 
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                : 'bg-zinc-900 text-zinc-400 border-zinc-800'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>{isReplayFrozen ? 'Replay: FROZEN' : 'Replay: STREAMING'}</span>
          </button>
        </div>
      </div>

      {/* Row 1: First-Class Risk Budget Configuration Input */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-zinc-950/80 border border-zinc-800/80 p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between text-zinc-400 text-[10px] font-black uppercase tracking-wider">
            <span className="flex items-center gap-1.5"><Coins className="w-3.5 h-3.5 text-zinc-500" /> 1. Account Size</span>
            <span className="text-emerald-400">USD</span>
          </div>
          <div className="relative">
            <input
              type="number"
              value={accountSize}
              onChange={(e) => setAccountSize(Math.max(100, Number(e.target.value)))}
              className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-2.5 text-lg font-black text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div className="flex gap-2">
            {[10000, 50000, 100000, 250000].map(val => (
              <button
                key={val}
                onClick={() => setAccountSize(val)}
                className={`px-2 py-1 rounded text-[9px] font-bold ${
                  accountSize === val ? 'bg-zinc-800 text-white border border-zinc-700' : 'bg-black text-zinc-500 border border-zinc-900'
                }`}
              >
                ${val.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-zinc-950/80 border border-zinc-800/80 p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between text-zinc-400 text-[10px] font-black uppercase tracking-wider">
            <span className="flex items-center gap-1.5"><Percent className="w-3.5 h-3.5 text-zinc-500" /> 2. Risk Percentage</span>
            <span className="text-emerald-400">CONTROL</span>
          </div>
          <div className="relative">
            <input
              type="number"
              step="0.1"
              value={riskPercentage}
              onChange={(e) => setRiskPercentage(Math.max(0.01, Number(e.target.value)))}
              className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-2.5 text-lg font-black text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div className="flex gap-2">
            {[0.1, 0.25, 0.5, 1.0].map(val => (
              <button
                key={val}
                onClick={() => setRiskPercentage(val)}
                className={`px-2 py-1 rounded text-[9px] font-bold ${
                  riskPercentage === val ? 'bg-zinc-800 text-white border border-zinc-700' : 'bg-black text-zinc-500 border border-zinc-900'
                }`}
              >
                {val}%
              </button>
            ))}
          </div>
        </div>

        <div className="bg-emerald-950/20 border border-emerald-500/30 p-5 rounded-2xl flex flex-col justify-between">
          <div className="text-emerald-400/80 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5" /> 3. Max Permissible Risk Value
          </div>
          <div className="my-2">
            <div className="text-3xl font-black text-white">${config.calculatedRiskValue.toLocaleString()}</div>
            <p className="text-[10px] text-zinc-500 mt-1">Calculated: Account × Risk %</p>
          </div>
          <span className="text-[9px] text-emerald-400 font-bold uppercase tracking-wider">
            ✓ FIXED RISK PERMITTED FOR NEXT CYCLE
          </span>
        </div>

      </div>

      {/* Row 2: Bottom-Up MICRO → 1 SECOND → 1 MINUTE Hierarchy Panel */}
      <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
          <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            Bottom-Up Micro Sequence Registry
          </h3>
          <span className="text-[9px] text-zinc-500 font-bold">NO MICRO → NO STRUCTURE</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          
          <div className="bg-black/60 border border-zinc-900 p-4 rounded-xl space-y-2">
            <span className="text-[10px] text-emerald-400 font-black uppercase">1. MICRO SEQUENCE</span>
            <div className="h-24 overflow-y-auto scrollbar-none space-y-1.5 text-left text-[10px] p-2 bg-zinc-950 rounded-lg border border-zinc-900">
              <div className="text-zinc-500 font-bold border-b border-zinc-900 pb-1">HIGH → LOW → HIGH Ticks</div>
              {engine.getMicroTicks().slice(0, 5).map((t, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-zinc-500">{new Date(t.timestamp).toISOString().split('T')[1].substring(0, 8)}</span>
                  <span className={t.type === 'HIGH' ? 'text-emerald-400 font-bold' : t.type === 'LOW' ? 'text-rose-400 font-bold' : 'text-zinc-400'}>
                    ${t.price} ({t.type})
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[9px] text-zinc-600">Continuous tick flow forms the origin</p>
          </div>

          <div className="bg-black/60 border border-zinc-900 p-4 rounded-xl space-y-2">
            <span className="text-[10px] text-cyan-400 font-black uppercase">2. PARENT 1S CANDLE</span>
            <div className="h-24 overflow-y-auto scrollbar-none space-y-1.5 text-left text-[10px] p-2 bg-zinc-950 rounded-lg border border-zinc-900">
              <div className="text-zinc-500 font-bold border-b border-zinc-900 pb-1">Micro Sequence Close Retained</div>
              {engine.get1SCandles().slice(0, 3).map((c, idx) => (
                <div key={idx} className="space-y-0.5 border-b border-zinc-900/50 pb-1">
                  <div className="flex justify-between text-zinc-400">
                    <span>O: {c.open} | C: {c.close}</span>
                    <span className="text-cyan-400 font-bold">1S Close</span>
                  </div>
                  <div className="text-[9px] text-zinc-600">Last Micro Close: <span className="text-white">${c.lastMicroClosePrice}</span></div>
                </div>
              ))}
            </div>
            <p className="text-[9px] text-zinc-600">Includes last micro before close</p>
          </div>

          <div className="bg-black/60 border border-zinc-900 p-4 rounded-xl space-y-2">
            <span className="text-[10px] text-amber-400 font-black uppercase">3. PARENT 1M CONTAINER</span>
            <div className="h-24 overflow-y-auto scrollbar-none space-y-1.5 text-left text-[10px] p-2 bg-zinc-950 rounded-lg border border-zinc-900">
              <div className="text-zinc-500 font-bold border-b border-zinc-900 pb-1">1S + Micro Structure Saved</div>
              {engine.get1MCandles().slice(0, 2).map((c, idx) => (
                <div key={idx} className="space-y-0.5 border-b border-zinc-900/50 pb-1">
                  <div className="flex justify-between text-zinc-400">
                    <span>H: {c.high} | L: {c.low}</span>
                    <span className="text-amber-400 font-bold">1M Max Res</span>
                  </div>
                  <div className="text-[9px] text-zinc-600">Verified Cycles inside: <span className="text-emerald-400 font-bold">{c.verifiedCycles.length}</span></div>
                </div>
              ))}
            </div>
            <p className="text-[9px] text-zinc-600">Maximum operative timeframe container</p>
          </div>

        </div>
      </div>

      {/* Row 3: Active Trade Verification Console & Results Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Clean Replay Verification Display */}
        <div className="lg:col-span-5 bg-zinc-950 p-6 rounded-2xl border border-zinc-800/80 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
            <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-emerald-400" /> Clean Execution Display
            </h4>
            <span className="text-[9px] text-emerald-400 font-bold">REPLAY FREEZE REQUIRED</span>
          </div>

          <div className="p-4 bg-black rounded-xl border border-zinc-800 text-center font-bold">
            <div className="text-xs text-zinc-500">SELECTED ASSET</div>
            <div className="text-2xl font-black text-white">{selectedAsset.replace('/', '')}</div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-2 border-b border-zinc-900">
              <span className="text-zinc-500 uppercase">ENTRY PRICE</span>
              <span className="text-white font-black">${livePrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-zinc-900">
              <span className="text-rose-400 uppercase font-black">1R STOP LOSS</span>
              <span className="text-rose-400 font-black">${(livePrice - 1.00).toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-zinc-900">
              <span className="text-emerald-400 uppercase font-bold">REALISED RR TARGET</span>
              <span className="text-emerald-400 font-black">${(livePrice + 10.00).toFixed(2)} (1:10)</span>
            </div>
          </div>

          <button
            onClick={handleTriggerReplayVerify}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all"
          >
            <Play className="w-4 h-4" /> Freeze & Verify in Replay
          </button>
        </div>

        {/* Right Side: Actual Measured Outcomes Registry */}
        <div className="lg:col-span-7 bg-zinc-950 p-6 rounded-2xl border border-zinc-800/80 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
            <h4 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-cyan-400" /> Actual Measured RR Outcomes
            </h4>
            <span className="text-[9px] text-zinc-500 font-bold">ACCOUNT BALANCE PROTECTED</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-[11px] border-collapse">
              <thead>
                <tr className="border-b border-zinc-900 bg-black/60 text-zinc-500 text-[9px] uppercase font-black">
                  <th className="py-2.5 px-3">TRADE ID</th>
                  <th className="py-2.5 px-3">RISK %</th>
                  <th className="py-2.5 px-3 text-center">REALISED RR</th>
                  <th className="py-2.5 px-3 text-center">ELAPSED</th>
                  <th className="py-2.5 px-3 text-right">P&L OUTPUT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900 font-mono">
                {completedTrades.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-zinc-600 font-bold">
                      No trades verified in this session yet. Click "Freeze & Verify in Replay" above!
                    </td>
                  </tr>
                ) : (
                  completedTrades.slice(0, 5).map(t => (
                    <tr key={t.id} className="hover:bg-zinc-900/60 transition-colors">
                      <td className="py-2.5 px-3 font-bold text-white">{t.id}</td>
                      <td className="py-2.5 px-3 text-zinc-400">{riskPercentage}%</td>
                      <td className="py-2.5 px-3 text-center text-emerald-400 font-bold">1 : {t.rrMultiple}</td>
                      <td className="py-2.5 px-3 text-center text-zinc-400">{t.durationSeconds}s</td>
                      <td className={`py-2.5 px-3 text-right font-black ${t.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {t.pnl >= 0 ? `+$${t.pnl.toLocaleString()}` : `-$${Math.abs(t.pnl).toLocaleString()}`}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
};
