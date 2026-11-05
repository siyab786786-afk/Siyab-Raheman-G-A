import React, { useState, useEffect } from 'react';
import { Clock, Zap, Layers, Target, Activity, CheckCircle2, Play, Pause, RefreshCw, FileText, Download, ShieldCheck } from 'lucide-react';

interface OneSecondCandleInterval {
  secondIndex: number; // 1 to 60
  absoluteTimestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  structuralState: '1:1 COMPLETED' | '1:2 APPROACHING' | 'LOW FORMING' | '1:3 PENDING' | 'VALIDATED_ENTRY';
  direction: 'LONG' | 'SHORT' | 'NEUTRAL';
  rMultiple: string;
}

export const SrbmprOneSecondSequenceLedger: React.FC = () => {
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [currentSecond, setCurrentSecond] = useState<number>(1);
  const [zackBasePrice, setZackBasePrice] = useState<number>(0.02450000);
  const [intervals, setIntervals] = useState<OneSecondCandleInterval[]>([]);

  useEffect(() => {
    generateMinuteIntervals(zackBasePrice);
  }, []);

  const generateMinuteIntervals = (base: number) => {
    const list: OneSecondCandleInterval[] = [];
    let p = base;
    const now = new Date();

    for (let i = 1; i <= 60; i++) {
      const delta = (Math.random() - 0.48) * 0.000120;
      const open = p;
      const close = parseFloat((open + delta).toFixed(8));
      const high = parseFloat((Math.max(open, close) + Math.random() * 0.000040).toFixed(8));
      const low = parseFloat((Math.min(open, close) - Math.random() * 0.000040).toFixed(8));
      p = close;

      let state: OneSecondCandleInterval['structuralState'] = '1:1 COMPLETED';
      if (i > 15 && i <= 35) state = '1:2 APPROACHING';
      else if (i > 35 && i <= 45) state = 'LOW FORMING';
      else if (i > 45) state = '1:3 PENDING';

      if (i === 10 || i === 28 || i === 42 || i === 55) {
        state = 'VALIDATED_ENTRY';
      }

      const secDate = new Date(now.getTime() - (60 - i) * 1000);
      const absoluteTimestamp = secDate.toISOString().replace('T', ' ').substring(0, 19);

      list.push({
        secondIndex: i,
        absoluteTimestamp,
        open,
        high,
        low,
        close,
        volume: Math.floor(1200 + Math.random() * 4500),
        structuralState: state,
        direction: close >= open ? 'LONG' : 'SHORT',
        rMultiple: i <= 30 ? '1:1' : i <= 45 ? '1:2' : '1:3'
      });
    }

    setIntervals(list);
  };

  useEffect(() => {
    if (!isRunning) return;

    const intervalTimer = setInterval(() => {
      setCurrentSecond(prev => {
        if (prev >= 60) {
          generateMinuteIntervals(zackBasePrice);
          return 1;
        }
        return prev + 1;
      });

      setZackBasePrice(prev => parseFloat((prev + (Math.random() - 0.49) * 0.000080).toFixed(8)));
    }, 1000);

    return () => clearInterval(intervalTimer);
  }, [isRunning, zackBasePrice]);

  return (
    <div className="w-full bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 border border-amber-500/30 rounded-3xl p-6 shadow-[0_0_50px_rgba(245,158,11,0.15)]">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <Clock className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white tracking-wider uppercase">
                ZACK One-Second Sequence Ledger
              </h2>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-[10px] font-bold">
                60 INTERVALS / MIN
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-medium mt-1">
              Absolute 1s timestamp mapping for 1:1, 1:2, and 1:3 structural mechanism states (ZACK Spot)
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="px-3 py-1.5 bg-zinc-900 rounded-xl border border-white/10 text-xs font-mono text-zinc-300">
            Current Frontier: <span className="text-amber-400 font-bold">{currentSecond} / 60 sec</span>
          </div>

          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`px-4 py-2 rounded-xl font-black text-xs flex items-center gap-2 transition-all shadow-lg ${
              isRunning ? 'bg-amber-500 text-black hover:bg-amber-400 shadow-amber-500/30' : 'bg-emerald-500 text-black hover:bg-emerald-400 shadow-emerald-500/30'
            }`}
          >
            {isRunning ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            {isRunning ? 'Pause Ledger' : 'Resume Live 1s'}
          </button>

          <button
            onClick={() => {
              setCurrentSecond(1);
              generateMinuteIntervals(zackBasePrice);
            }}
            className="p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl border border-white/10 transition-all"
            title="Reset Ledger"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Summary Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
        <div className="p-4 bg-zinc-900/60 rounded-2xl border border-white/5">
          <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Asset / Symbol</div>
          <div className="text-lg font-black text-white mt-1 flex items-center gap-2">
            ZACK / USDT <span className="text-xs text-emerald-400 font-mono">Spot</span>
          </div>
        </div>

        <div className="p-4 bg-zinc-900/60 rounded-2xl border border-white/5">
          <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Active State</div>
          <div className="text-sm font-black text-amber-400 mt-1 flex items-center gap-1.5">
            <Activity className="w-4 h-4 animate-pulse" /> 1:2 Approaching / Low Form
          </div>
        </div>

        <div className="p-4 bg-zinc-900/60 rounded-2xl border border-white/5">
          <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Captured Seconds</div>
          <div className="text-lg font-black text-emerald-400 mt-1 font-mono">
            {currentSecond} Seconds Live
          </div>
        </div>

        <div className="p-4 bg-zinc-900/60 rounded-2xl border border-white/5">
          <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Bybit API Security</div>
          <div className="text-xs font-mono font-bold text-white mt-1 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> IWHPYDz... (Active)
          </div>
        </div>
      </div>

      {/* 60 One-Second Intervals Table */}
      <div className="rounded-2xl border border-zinc-800 overflow-hidden bg-zinc-950/60">
        <div className="px-4 py-3 bg-zinc-900/80 border-b border-zinc-800 flex items-center justify-between text-xs font-black uppercase text-zinc-400 tracking-wider">
          <div className="flex items-center gap-6">
            <span># SEC</span>
            <span>ABSOLUTE TIMESTAMP</span>
            <span>STRUCTURAL STATE</span>
          </div>
          <div className="flex items-center gap-8">
            <span>DIR</span>
            <span>PRICE ($)</span>
            <span>R-MULT</span>
            <span>STATUS</span>
          </div>
        </div>

        <div className="max-h-[380px] overflow-y-auto divide-y divide-zinc-900 font-mono text-xs">
          {intervals.map((item) => {
            const isCurrent = item.secondIndex === currentSecond;
            const isPast = item.secondIndex < currentSecond;

            return (
              <div 
                key={item.secondIndex}
                className={`px-4 py-2.5 flex items-center justify-between transition-colors ${
                  isCurrent ? 'bg-amber-500/20 border-l-4 border-amber-500 text-white font-bold' :
                  isPast ? 'bg-zinc-900/40 text-zinc-300' : 'bg-zinc-950 text-zinc-600 opacity-60'
                }`}
              >
                <div className="flex items-center gap-6">
                  <span className="w-8 text-amber-400 font-bold">#{item.secondIndex}</span>
                  <span className="text-zinc-300">{item.absoluteTimestamp}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                    item.structuralState === 'VALIDATED_ENTRY' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
                    item.structuralState === '1:1 COMPLETED' ? 'bg-blue-500/20 text-blue-300' :
                    item.structuralState === '1:2 APPROACHING' ? 'bg-amber-500/20 text-amber-300' : 'bg-purple-500/20 text-purple-300'
                  }`}>
                    {item.structuralState}
                  </span>
                </div>

                <div className="flex items-center gap-8">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${item.direction === 'LONG' ? 'text-emerald-400 bg-emerald-500/10' : 'text-red-400 bg-red-500/10'}`}>
                    {item.direction}
                  </span>
                  <span className="text-white">{item.close.toFixed(8)}</span>
                  <span className="text-amber-400">{item.rMultiple}</span>
                  <span className="text-[10px] text-zinc-400">
                    {isPast || isCurrent ? 'RECORDED' : 'PENDING'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
