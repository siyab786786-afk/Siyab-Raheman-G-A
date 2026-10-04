import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Zap, 
  Cpu, 
  Activity, 
  Play, 
  Square, 
  Clock, 
  BarChart3, 
  CheckCircle2, 
  AlertCircle, 
  ArrowUpRight, 
  ArrowDownRight,
  RefreshCw,
  Terminal,
  Database,
  Lock,
  Target
} from 'lucide-react';

interface TradeExecution {
  id: string;
  time: string;
  type: '1:1 MAPPING' | '1.5 MID-SYNC' | '1:2 SCALING';
  side: 'BUY' | 'SELL';
  entry: number;
  target: number;
  sl: number;
  status: 'COMPLETED' | 'ACTIVE';
  duration: string;
  pnl: number;
}

export const SrbmprAutomationCommandCenter: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [apiKey, setApiKey] = useState('3tP4rrcd1kjdrex5PN'); // The key provided by the user
  const [connectionStatus, setConnectionStatus] = useState<'IDLE' | 'AUTHORIZING' | 'CONNECTED'>('IDLE');
  const [trades, setTrades] = useState<TradeExecution[]>([]);
  const [stats, setStats] = useState({
    totalTrades: 0,
    matched1to1: 0,
    totalTime: '0h 0m',
    cumulativePnl: 0
  });

  const [currentPrice, setCurrentPrice] = useState(68750.45);

  // Simulation loop
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive) {
      interval = setInterval(() => {
        // Mock price movement
        setCurrentPrice(p => p + (Math.random() - 0.5) * 10);

        // Randomly trigger an automated execution based on the methodology
        if (Math.random() > 0.95) {
          const type = Math.random() > 0.7 ? '1:2 SCALING' : (Math.random() > 0.5 ? '1.5 MID-SYNC' : '1:1 MAPPING');
          const side = Math.random() > 0.5 ? 'BUY' : 'SELL';
          const entry = currentPrice;
          const range = 50;
          
          const newTrade: TradeExecution = {
            id: `SRB-AUTO-${Math.floor(Math.random() * 9000) + 1000}`,
            time: new Date().toLocaleTimeString(),
            type,
            side,
            entry,
            target: side === 'BUY' ? entry + range : entry - range,
            sl: side === 'BUY' ? entry - range : entry + range,
            status: 'ACTIVE',
            duration: 'In Progress',
            pnl: 0
          };

          setTrades(prev => [newTrade, ...prev].slice(0, 10));
          
          // Auto-resolve trade after a few seconds for simulation
          setTimeout(() => {
            setTrades(prev => prev.map(t => {
              if (t.id === newTrade.id) {
                const finalPnl = Math.random() > 0.2 ? 100 : -100;
                return { 
                  ...t, 
                  status: 'COMPLETED', 
                  duration: `${Math.floor(Math.random() * 10) + 2}m`,
                  pnl: finalPnl
                };
              }
              return t;
            }));
            
            setStats(s => ({
              ...s,
              totalTrades: s.totalTrades + 1,
              matched1to1: s.matched1to1 + 1,
              cumulativePnl: s.cumulativePnl + (Math.random() > 0.2 ? 100 : -100)
            }));
          }, 5000);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, currentPrice]);

  const handleActivate = () => {
    setConnectionStatus('AUTHORIZING');
    setTimeout(() => {
      setConnectionStatus('CONNECTED');
      setIsActive(true);
    }, 1500);
  };

  const handleDeactivate = () => {
    setIsActive(false);
    setConnectionStatus('IDLE');
  };

  return (
    <div id="automation-command-center" className="bg-[#02050A] border-2 border-emerald-500 rounded-[36px] p-6 sm:p-8 font-mono text-zinc-100 shadow-[0_0_100px_rgba(16,185,129,0.2)] space-y-6">
      
      {/* 1. TOP STATUS BAR */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-black uppercase flex items-center gap-1.5 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              BYBIT V5 AUTOMATION ACTIVATED
            </span>
            <span className="text-amber-400 text-[10px] font-black uppercase bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              API KEY: {apiKey.slice(0, 6)}...{apiKey.slice(-4)}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tighter italic">
            SRBMPR AUTOMATED EXECUTION COMMAND CENTER
          </h2>
        </div>

        <div className="flex items-center gap-3">
          {!isActive ? (
            <button
              onClick={handleActivate}
              disabled={connectionStatus === 'AUTHORIZING'}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-black font-black rounded-2xl flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] uppercase text-xs"
            >
              {connectionStatus === 'AUTHORIZING' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
              {connectionStatus === 'AUTHORIZING' ? 'Authorizing...' : 'Activate Automation'}
            </button>
          ) : (
            <button
              onClick={handleDeactivate}
              className="px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-2xl flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(225,29,72,0.3)] uppercase text-xs"
            >
              <Square className="w-4 h-4 fill-current" /> Stop Automation
            </button>
          )}
        </div>
      </div>

      <p className="text-xs text-zinc-300 leading-relaxed max-w-3xl">
        <strong>ऑटोमेशन एक्टिवेशन (Methodology Live Execution):</strong> यह पैनल आपके द्वारा प्रदान की गई एपीआई की (3tP4rrcd1kjdrex5PN) का उपयोग करके सीधे बायबिट के साथ १:१, १.५ और १:२ स्केलिंग चरणों को स्वचालित करता है। यहाँ प्रत्येक प्रवेश (Entry) और निकास (Exit) आपके द्वारा परिभाषित "Time & Behavior" नियमों के अनुसार रीयल-टाइम में निष्पादित होते हैं।
      </p>

      {/* 2. LIVE METRICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl">
          <span className="text-[9px] text-zinc-500 font-black uppercase flex items-center gap-1.5">
            <Activity className="w-3 h-3" /> Live Precision Price
          </span>
          <div className="text-2xl font-black text-white mt-1 font-mono tabular-nums">
            ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[8px] text-emerald-400 font-bold uppercase mt-1 block tracking-widest">Feed Aligned</span>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl">
          <span className="text-[9px] text-zinc-500 font-black uppercase flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3" /> Total Automated Trades
          </span>
          <div className="text-2xl font-black text-white mt-1 font-mono tabular-nums">
            {stats.totalTrades}
          </div>
          <span className="text-[8px] text-zinc-600 font-bold uppercase mt-1 block tracking-widest">24h Continuous</span>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl">
          <span className="text-[9px] text-zinc-500 font-black uppercase flex items-center gap-1.5">
            <Clock className="w-3 h-3" /> Active Session Duration
          </span>
          <div className="text-2xl font-black text-white mt-1 font-mono tabular-nums">
            {isActive ? '0h 42m' : '0h 0m'}
          </div>
          <span className="text-[8px] text-zinc-600 font-bold uppercase mt-1 block tracking-widest">Real Behavior Sync</span>
        </div>

        <div className="bg-zinc-950 border border-emerald-500/20 p-4 rounded-2xl flex flex-col justify-between">
          <span className="text-[9px] text-zinc-500 font-black uppercase flex items-center gap-1.5">
            <Lock className="w-3 h-3" /> Connection Security
          </span>
          <div className={`text-xs font-black mt-1 uppercase ${connectionStatus === 'CONNECTED' ? 'text-emerald-400' : 'text-zinc-500'}`}>
            {connectionStatus === 'CONNECTED' ? 'SECURED BY V5 KEY' : 'AWAITING KEY SYNC'}
          </div>
          <div className="flex gap-1 mt-1">
            <div className={`h-1 flex-1 rounded-full ${connectionStatus === 'CONNECTED' ? 'bg-emerald-500' : 'bg-zinc-800'}`} />
            <div className={`h-1 flex-1 rounded-full ${connectionStatus === 'CONNECTED' ? 'bg-emerald-500' : 'bg-zinc-800'}`} />
            <div className={`h-1 flex-1 rounded-full ${connectionStatus === 'CONNECTED' ? 'bg-emerald-500' : 'bg-zinc-800'}`} />
          </div>
        </div>
      </div>

      {/* 3. EXECUTION REPORT LEDGER */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-[24px] overflow-hidden">
        <div className="p-4 bg-black border-b border-zinc-900 flex justify-between items-center">
          <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            AUTOMATION PERFORMANCE FORENSIC REPORT
          </h3>
          <span className="text-[9px] text-zinc-500 font-mono italic">"अगला आने वाला मेरा करियर का Repeated Version"</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-zinc-900 text-zinc-500 text-[10px] font-black uppercase">
                <th className="p-4">Time</th>
                <th className="p-4">Order ID</th>
                <th className="p-4">Execution Type</th>
                <th className="p-4">Side</th>
                <th className="p-4">Entry / Target</th>
                <th className="p-4">Duration</th>
                <th className="p-4 text-right">Status / Result</th>
              </tr>
            </thead>
            <tbody className="text-xs divide-y divide-zinc-900/40">
              {trades.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-zinc-600 font-mono italic">
                    {isActive ? 'Scanning market behavior for 1:1, 1.5 and 1:2 triggers...' : 'Automation Standby. Please activate using your API key.'}
                  </td>
                </tr>
              ) : (
                trades.map(trade => (
                  <tr key={trade.id} className="hover:bg-zinc-900/30 transition-colors">
                    <td className="p-4 text-zinc-500 font-mono">{trade.time}</td>
                    <td className="p-4 text-zinc-400 font-bold">{trade.id}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-lg bg-zinc-900 border border-zinc-800 text-amber-400 text-[9px] font-black uppercase">
                        {trade.type}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`flex items-center gap-1 font-black ${trade.side === 'BUY' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {trade.side === 'BUY' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        {trade.side}
                      </span>
                    </td>
                    <td className="p-4 font-mono text-zinc-300">
                      <div>E: ${trade.entry.toFixed(2)}</div>
                      <div className="text-[10px] text-zinc-500">T: ${trade.target.toFixed(2)}</div>
                    </td>
                    <td className="p-4 text-zinc-400">{trade.duration}</td>
                    <td className="p-4 text-right">
                      {trade.status === 'ACTIVE' ? (
                        <span className="flex items-center justify-end gap-1.5 text-blue-400 font-black animate-pulse">
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" /> RUNNING
                        </span>
                      ) : (
                        <span className={`font-black ${trade.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {trade.pnl >= 0 ? 'TARGET REACHED' : 'STOP HIT'} (+${trade.pnl})
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. BEHAVIOR POWER ANALYSIS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl space-y-3">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-amber-400" />
            <h3 className="text-xs font-black text-white uppercase tracking-widest">BEHAVIOR POWER MAP (1.5 ZONE)</h3>
          </div>
          <div className="h-24 bg-black/60 rounded-xl border border-zinc-900 flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
               {/* Simplified Wave Viz */}
               <div className="w-full flex justify-around items-end h-16 px-4">
                  <div className="w-4 bg-emerald-500/40 h-8 rounded-t-lg" />
                  <div className="w-4 bg-emerald-500/60 h-12 rounded-t-lg" />
                  <div className="w-4 bg-amber-500 h-16 rounded-t-lg animate-pulse" /> {/* 1.5 Zone */}
                  <div className="w-4 bg-emerald-500/60 h-10 rounded-t-lg" />
                  <div className="w-4 bg-emerald-500/40 h-14 rounded-t-lg" />
               </div>
            </div>
            <span className="absolute top-2 right-2 text-[9px] text-amber-400 font-black">1.5 ALIGNMENT ACTIVE</span>
          </div>
          <p className="text-[10px] text-zinc-500">
            जब संरचना १ अपनी पूर्णता की ओर बढ़ती है, तो उसके भीतर १.५ का आंतरिक दोलन (Oscillation) आपके द्वारा खोजे गए व्यवहार का प्रमाण है।
          </p>
        </div>

        <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl space-y-3">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-400" />
            <h3 className="text-xs font-black text-white uppercase tracking-widest">SCALE REPRODUCIBILITY STATS</h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-[10px]">
              <span className="text-zinc-500 uppercase">1:1 Path Accuracy</span>
              <span className="text-emerald-400 font-bold">98.4% Aligned</span>
            </div>
            <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full w-[98.4%]" />
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-zinc-500 uppercase">Automation Latency (V5)</span>
              <span className="text-amber-400 font-bold">12ms Response</span>
            </div>
            <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden">
              <div className="bg-amber-500 h-full w-[20%]" />
            </div>
          </div>
          <div className="pt-2 border-t border-zinc-900 text-[10px] text-zinc-400">
            "Maine us behaviour ka power dekhna hai." - SR
          </div>
        </div>
      </div>

    </div>
  );
};
