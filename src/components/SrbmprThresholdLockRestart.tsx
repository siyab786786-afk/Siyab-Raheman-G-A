import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  RotateCcw, 
  DollarSign, 
  CheckCircle2, 
  ArrowRight, 
  Activity, 
  TrendingUp, 
  Percent,
  Wallet,
  Coins
} from 'lucide-react';

interface TransferLog {
  id: string;
  timestamp: string;
  action: string;
  amountLocked: number;
  amountWithdrawn: number;
  remainingCapital: number;
  status: 'COMPLETED';
}

export const SrbmprThresholdLockRestart: React.FC = () => {
  const [currentCapital, setCurrentCapital] = useState<number>(1024); // Start exactly at step 9 ($1024) to show the trigger!
  const [lockedMainBalance, setLockedMainBalance] = useState<number>(5000);
  const [logs, setLogs] = useState<TransferLog[]>([
    { id: 'TX-SR-901', timestamp: '2026-10-04T12:45:00Z', action: '$1000 Threshold Lock & Reset', amountLocked: 1000, amountWithdrawn: 1000, remainingCapital: 2, status: 'COMPLETED' }
  ]);

  const handleFullReset = () => {
    // Lock entire $1000, transfer to main account, restart bot with $2
    const amountToLock = Math.min(currentCapital, 1000);
    const newLog: TransferLog = {
      id: `TX-SR-${Math.floor(Math.random() * 900) + 100}`,
      timestamp: new Date().toISOString(),
      action: 'Full $1000 Threshold Locked & Bot Restarted ($2)',
      amountLocked: amountToLock,
      amountWithdrawn: amountToLock,
      remainingCapital: 2,
      status: 'COMPLETED'
    };

    setLockedMainBalance(prev => prev + amountToLock);
    setLogs(prev => [newLog, ...prev]);
    setCurrentCapital(2);
  };

  const handleRatioSplit = () => {
    // 1:3 Profit Split: Withdraw $333 profit, keep $667 or restart from $2
    const withdrawn = 333;
    const kept = 667;
    const newLog: TransferLog = {
      id: `TX-SR-${Math.floor(Math.random() * 900) + 100}`,
      timestamp: new Date().toISOString(),
      action: '1:3 Ratio Split (Withdrawn $333 Profit / Kept $667)',
      amountLocked: kept,
      amountWithdrawn: withdrawn,
      remainingCapital: 2, // Reset bot to $2 for safety
      status: 'COMPLETED'
    };

    setLockedMainBalance(prev => prev + kept);
    setLogs(prev => [newLog, ...prev]);
    setCurrentCapital(2);
  };

  return (
    <div className="bg-[#02050A] border-2 border-emerald-500 rounded-[36px] p-6 sm:p-8 font-mono text-zinc-100 shadow-[0_0_100px_rgba(16,185,129,0.2)] space-y-6">
      
      {/* 1. HEADER PANEL */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-black uppercase flex items-center gap-1.5 shadow-[0_0_10px_rgba(16,185,129,0.2)] animate-pulse">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              $1000 THRESHOLD SAFEGUARD PROTOCOL
            </span>
            <span className="text-amber-400 text-xs font-black uppercase bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              RESTART LAW LOCKED
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tighter italic">
            SR $1000 LOCK, TRANSFER & RESTART CONTROLLER
          </h2>
        </div>

        <div className="text-right shrink-0">
          <span className="text-[9px] text-zinc-500 font-bold uppercase block">Secured Capital Enclave</span>
          <span className="text-lg font-black text-emerald-400 font-mono">${lockedMainBalance.toLocaleString()} USD</span>
        </div>
      </div>

      <p className="text-xs text-zinc-300 leading-relaxed">
        <strong>सुरक्षा चक्र नियम ($1000 Profit Locking Rule):</strong> संचयी रिस्क को स्थाई रूप से समाप्त करने का गणितीय समाधान। जैसे ही बॉट का बैलेंस \$१,००० (स्टेप ९) को छूता है, पूरा लाभ सुरक्षित तिजोरी में स्थानांतरित (Lock & Transfer) कर दिया जाता है और बॉट फिर से \$२ की न्यूनतम पूंजी से चक्र की नए सिरे से शुरुआत करता है।
      </p>

      {/* Threshold Reached Dynamic State Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Box A: Bot Balance Trigger State */}
        <div className="bg-zinc-950 border-2 border-amber-500/40 p-5 rounded-2xl flex flex-col justify-between h-48 relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-[9px] text-zinc-500 font-black uppercase">CURRENT LIVE BOT BALANCE</span>
            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[8px] font-mono font-black border border-amber-500/30 uppercase animate-pulse">
              {currentCapital >= 1000 ? 'Threshold Alert Active' : 'Compounding in Progress'}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-white font-mono tabular-nums">${currentCapital.toLocaleString()}</span>
            <span className="text-xs text-zinc-400">USD</span>
          </div>

          {currentCapital >= 1000 ? (
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl text-[10px] font-bold flex items-center gap-1.5">
              <Lock className="w-4 h-4 animate-bounce" /> $1000 Threshold Breached! Action Needed.
            </div>
          ) : (
            <div className="p-2.5 bg-zinc-900 border border-zinc-800 text-zinc-500 rounded-xl text-[10px]">
              *Bot will alert when compounding hits Step 9 ($1,024).
            </div>
          )}

          {/* BG grid line */}
          <div className="absolute inset-0 opacity-5 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px)]" />
        </div>

        {/* Box B: Action Interface & Strategy Splitting */}
        <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl flex flex-col justify-between h-48">
          <span className="text-[9px] text-zinc-500 font-black uppercase">DISPOSAL DECISION WORKFLOW</span>

          <div className="flex flex-col gap-2">
            <button
              onClick={handleFullReset}
              disabled={currentCapital < 1000}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-black font-black text-xs uppercase rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.2)] disabled:opacity-50 disabled:bg-zinc-900 disabled:text-zinc-500"
            >
              🔒 Lock Entire $1,000 & Restart Bot ($2)
            </button>

            <button
              onClick={handleRatioSplit}
              disabled={currentCapital < 1000}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase rounded-xl transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)] disabled:opacity-50 disabled:bg-zinc-900 disabled:text-zinc-500"
            >
              ⚖️ 1:3 Ratio Split ($333 Out / $667 Keep)
            </button>
          </div>

          {currentCapital < 1000 && (
            <button 
              onClick={() => setCurrentCapital(1024)}
              className="text-[9px] text-amber-400 hover:text-amber-300 uppercase font-black tracking-widest text-left"
            >
              ➜ Click to simulate Step 9 ($1,024) trigger
            </button>
          )}
        </div>

      </div>

      {/* Crytographic Transfer Ledger Logs */}
      <div className="bg-black/60 border border-zinc-900 rounded-2xl p-5 space-y-3">
        <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
          <span className="text-[9px] text-zinc-500 font-black uppercase">ENCLAVE SECURED TRANSACTION LOGS</span>
          <span className="text-[9px] text-emerald-400 font-bold uppercase">SECURED BY BYBIT V5 TESTNET API</span>
        </div>

        <div className="space-y-2">
          {logs.map((l, i) => (
            <div key={i} className="p-3 bg-zinc-950 rounded-xl border border-zinc-900 flex justify-between items-center text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="font-black text-zinc-300">{l.action}</span>
                </div>
                <div className="text-[9px] text-zinc-500">TX_ID: {l.id} | Timestamp: {l.timestamp}</div>
              </div>

              <div className="text-right">
                <span className="font-black text-emerald-400 block">+${l.amountLocked} USD</span>
                <span className="text-[9px] text-zinc-500 font-mono">Restart Capital: ${l.remainingCapital}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
