import React, { useState, useEffect } from 'react';
import {
  X,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Database,
  Download,
  RotateCcw,
  Play,
  Pause,
  Zap,
  Activity,
  Layers,
  Sparkles
} from 'lucide-react';
import {
  Srbmpr100TradeTargetDbService,
  Srbmpr100TradeRecord,
  Summary24Hour,
  CycleStage
} from '../services/Srbmpr100TradeTargetDbService';

interface Srbmpr100TradeTargetPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSymbol?: string;
  activeTimeframe?: string;
  livePrice?: number;
}

export const Srbmpr100TradeTargetPanelModal: React.FC<Srbmpr100TradeTargetPanelModalProps> = ({
  isOpen,
  onClose,
  activeSymbol = 'BTCUSDT',
  activeTimeframe = '1m',
  livePrice = 68420.50
}) => {
  const dbService = Srbmpr100TradeTargetDbService.getInstance();
  const [records, setRecords] = useState<Srbmpr100TradeRecord[]>(() => dbService.getRecords());
  const [summary, setSummary] = useState<Summary24Hour>(() => dbService.get24HourSummary());
  const [filterMode, setFilterMode] = useState<'ALL' | 'TAKEN_ONLY' | 'WAITED_ONLY' | 'LONGS' | 'SHORTS'>('ALL');
  const [isAutoRunnerActive, setIsAutoRunnerActive] = useState<boolean>(true);
  const [simNotification, setSimNotification] = useState<string | null>(null);

  useEffect(() => {
    return dbService.subscribe(() => {
      setRecords([...dbService.getRecords()]);
      setSummary({ ...dbService.get24HourSummary() });
    });
  }, [dbService]);

  // Auto-runner simulation: every 30-45 seconds, discovers a new candle completion
  useEffect(() => {
    if (!isAutoRunnerActive) return;
    const interval = setInterval(() => {
      const isHigh = Math.random() > 0.45;
      const targetP = livePrice > 0 ? livePrice : 68420;
      const newRec = dbService.evaluateSequence(activeSymbol, activeTimeframe, targetP, isHigh);
      setSimNotification(
        newRec.action === 'TAKE_TRADE'
          ? `⚡ [${newRec.cycleStage}] ${newRec.trigger === 'HIGH_COMPLETE_LONG' ? 'HIGH COMPLETE → LONG' : 'LOW COMPLETE → SHORT'} TAKEN at $${newRec.entryPrice.toLocaleString()}! Target in ${newRec.targetCompletedWithinMinutes}m`
          : `⏳ [${newRec.cycleStage}] ${newRec.trigger === 'HIGH_COMPLETE_LONG' ? 'HIGH COMPLETE' : 'LOW COMPLETE'} → WAITING (Zero & First Rule)`
      );
      setTimeout(() => setSimNotification(null), 5000);
    }, 35000);

    return () => clearInterval(interval);
  }, [isAutoRunnerActive, livePrice, activeSymbol, activeTimeframe, dbService]);

  if (!isOpen) return null;

  const handleManualTrigger = (isHighComplete: boolean, forcedStage?: CycleStage) => {
    const targetP = livePrice > 0 ? livePrice : 68420;
    const newRec = dbService.evaluateSequence(activeSymbol, activeTimeframe, targetP, isHighComplete, forcedStage);
    setSimNotification(
      newRec.action === 'TAKE_TRADE'
        ? `⚡ [${newRec.cycleStage}] ${newRec.trigger === 'HIGH_COMPLETE_LONG' ? 'HIGH COMPLETE → LONG' : 'LOW COMPLETE → SHORT'} EXECUTED at $${newRec.entryPrice.toLocaleString()}! Target in ${newRec.targetCompletedWithinMinutes}m`
        : `⏳ [${newRec.cycleStage}] ${newRec.trigger === 'HIGH_COMPLETE_LONG' ? 'HIGH COMPLETE' : 'LOW COMPLETE'} → WAITING (Zero & First Rule)`
    );
    setTimeout(() => setSimNotification(null), 5000);
  };

  const handleDownloadCsv = () => {
    const csvContent = dbService.exportCsv();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SR_TIME_100_TRADES_24H_DATABASE_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredRecords = records.filter(r => {
    if (filterMode === 'TAKEN_ONLY') return r.action === 'TAKE_TRADE';
    if (filterMode === 'WAITED_ONLY') return r.action === 'WAIT';
    if (filterMode === 'LONGS') return r.trigger === 'HIGH_COMPLETE_LONG';
    if (filterMode === 'SHORTS') return r.trigger === 'LOW_COMPLETE_SHORT';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md font-mono">
      <div className="bg-[#070b14] border border-amber-500/40 rounded-2xl w-full max-w-6xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-100">
        
        {/* Header Bar */}
        <div className="px-5 py-3.5 border-b border-slate-800 bg-[#0a0f1d] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl text-black font-black shadow-lg">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-black text-amber-300 uppercase tracking-wide">
                  SR TIME — 100 TRADES / 100 TARGETS (24-HOUR MICRO-ENGINE)
                </h2>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                  FIXED FORWARD CANDLE LAYER
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                High Complete → Long • Low Complete → Short • Zero & First: Wait • Second & Third: Take Execution (Target in 1m–10m)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadCsv}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-amber-500/50 text-amber-300 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
              title="Download Small Database as CSV"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Notification Banner */}
        {simNotification && (
          <div className="px-5 py-2 bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-cyan-500/20 border-b border-amber-500/30 text-xs font-black text-white flex items-center gap-2 animate-pulse">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{simNotification}</span>
          </div>
        )}

        {/* Four Key Architecture Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 p-4 bg-[#0a0f1d]/50 border-b border-slate-800/80 shrink-0">
          {/* Card 1: 24-Hour Progress */}
          <div className="bg-slate-900/90 border border-amber-500/30 rounded-xl p-3">
            <div className="text-[10px] text-slate-400 font-bold uppercase flex justify-between">
              <span>24h Target Quota</span>
              <span className="text-amber-400">Target 100/100</span>
            </div>
            <div className="text-xl font-black text-amber-300 mt-1">
              {summary.targetsCompleted} / 100
            </div>
            <div className="w-full bg-slate-950 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                className="bg-amber-400 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (summary.targetsCompleted / 100) * 100)}%` }}
              />
            </div>
            <div className="text-[10px] text-emerald-400 font-bold mt-1.5">
              100% Target Hit Rate • $50 Risk
            </div>
          </div>

          {/* Card 2: Micro-Cadence Completion */}
          <div className="bg-slate-900/90 border border-cyan-500/30 rounded-xl p-3">
            <div className="text-[10px] text-slate-400 font-bold uppercase flex justify-between">
              <span>Cadence Velocity</span>
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-xl font-black text-cyan-300 mt-1">
              {summary.avgCompletionMinutes} mins
            </div>
            <div className="text-[10px] text-slate-400 font-bold mt-2">
              Within 1m – 10m Per Target
            </div>
            <div className="text-[10px] text-cyan-400 font-bold mt-0.5">
              1m: Rapid | 5m: Standard | 10m: Max
            </div>
          </div>

          {/* Card 3: Cycle Stages Filter (Zero/First vs Second/Third) */}
          <div className="bg-slate-900/90 border border-emerald-500/30 rounded-xl p-3">
            <div className="text-[10px] text-slate-400 font-bold uppercase flex justify-between">
              <span>Stage Gate Rules</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-sm font-black text-slate-200 mt-1 flex justify-between">
              <span>Zero & First:</span>
              <span className="text-amber-400 font-bold">{summary.waitedStagesCount} WAITED</span>
            </div>
            <div className="text-sm font-black text-slate-200 mt-0.5 flex justify-between">
              <span>Second & Third:</span>
              <span className="text-emerald-400 font-bold">{summary.executedStagesCount} TAKEN</span>
            </div>
            <div className="text-[10px] text-slate-400 font-bold mt-1">
              Only Second & Third are executed
            </div>
          </div>

          {/* Card 4: Directional Triggers & PnL */}
          <div className="bg-slate-900/90 border border-yellow-500/30 rounded-xl p-3">
            <div className="text-[10px] text-slate-400 font-bold uppercase flex justify-between">
              <span>Trigger Balance & PnL</span>
              <Database className="w-3.5 h-3.5 text-yellow-400" />
            </div>
            <div className="text-xl font-black text-emerald-400 mt-1">
              +${summary.totalPnlUsd.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-300 mt-1.5 flex justify-between">
              <span className="text-emerald-400 font-bold">▲ High Complete: {summary.highCompleteLongs}</span>
              <span className="text-rose-400 font-bold">▼ Low Complete: {summary.lowCompleteShorts}</span>
            </div>
          </div>
        </div>

        {/* Live Manual Execution Controls Strip */}
        <div className="px-5 py-2.5 bg-[#090d19] border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>LIVE TRIGGER SIMULATOR:</span>
            </span>

            {/* High Complete -> Take LONG */}
            <button
              onClick={() => handleManualTrigger(true, 'Second')}
              className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs rounded-lg flex items-center gap-1 shadow"
              title="High Complete on Left Side -> Take LONG (Second Stage)"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>HIGH COMPLETE → TAKE LONG (2nd)</span>
            </button>

            {/* Low Complete -> Take SHORT */}
            <button
              onClick={() => handleManualTrigger(false, 'Third')}
              className="px-3 py-1 bg-rose-500 hover:bg-rose-400 text-white font-black text-xs rounded-lg flex items-center gap-1 shadow"
              title="Low Complete on Right Side -> Take SHORT (Third Stage)"
            >
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>LOW COMPLETE → TAKE SHORT (3rd)</span>
            </button>

            {/* Stage 0/1 Wait Simulator */}
            <button
              onClick={() => handleManualTrigger(true, 'Zero')}
              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs rounded-lg flex items-center gap-1"
              title="Stage Zero or First -> Just Wait"
            >
              <Clock className="w-3 h-3 text-slate-400" />
              <span>STAGE ZERO/FIRST (WAIT)</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAutoRunnerActive(!isAutoRunnerActive)}
              className={`px-3 py-1 rounded-lg text-xs font-black flex items-center gap-1 border transition-all ${
                isAutoRunnerActive
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                  : 'bg-slate-900 text-slate-400 border-slate-700'
              }`}
            >
              {isAutoRunnerActive ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              <span>AUTO 24h ENGINE: {isAutoRunnerActive ? 'RUNNING' : 'PAUSED'}</span>
            </button>

            <button
              onClick={() => dbService.resetCycle()}
              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs rounded-lg flex items-center gap-1"
              title="Reset 24h Cycle to Clean Seed"
            >
              <RotateCcw className="w-3 h-3 text-slate-400" />
              <span>Reset Cycle</span>
            </button>
          </div>
        </div>

        {/* Small Database Filter Bar */}
        <div className="px-5 py-2 bg-[#060a14] border-b border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-bold text-slate-300">SMALL DATABASE LEDGER:</span>
            <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
              <button
                onClick={() => setFilterMode('ALL')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  filterMode === 'ALL' ? 'bg-amber-500 text-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                All ({records.length})
              </button>
              <button
                onClick={() => setFilterMode('TAKEN_ONLY')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  filterMode === 'TAKEN_ONLY' ? 'bg-emerald-500 text-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                Taken: 2nd & 3rd ({summary.executedStagesCount})
              </button>
              <button
                onClick={() => setFilterMode('WAITED_ONLY')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  filterMode === 'WAITED_ONLY' ? 'bg-amber-500/30 text-amber-300' : 'text-slate-400 hover:text-white'
                }`}
              >
                Waited: 0 & 1st ({summary.waitedStagesCount})
              </button>
              <button
                onClick={() => setFilterMode('LONGS')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  filterMode === 'LONGS' ? 'bg-emerald-500 text-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                High Complete Longs
              </button>
              <button
                onClick={() => setFilterMode('SHORTS')}
                className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  filterMode === 'SHORTS' ? 'bg-rose-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Low Complete Shorts
              </button>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 font-bold">
            Showing <strong className="text-white">{filteredRecords.length}</strong> verified trades
          </div>
        </div>

        {/* Small Database Table Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-1">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase font-black tracking-wider">
                <th className="py-2 px-2.5">Trade #</th>
                <th className="py-2 px-2.5">Time (UTC)</th>
                <th className="py-2 px-2.5">Asset</th>
                <th className="py-2 px-2.5">Sequence Trigger</th>
                <th className="py-2 px-2.5">Stage</th>
                <th className="py-2 px-2.5">Action</th>
                <th className="py-2 px-2.5">Entry ($)</th>
                <th className="py-2 px-2.5">SL ($)</th>
                <th className="py-2 px-2.5">1:10 Target ($)</th>
                <th className="py-2 px-2.5">Target Completion</th>
                <th className="py-2 px-2.5">Status</th>
                <th className="py-2 px-2.5">PnL ($)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
              {filteredRecords.map(item => (
                <tr
                  key={item.id}
                  className={`hover:bg-slate-900/60 transition-colors ${
                    item.action === 'TAKE_TRADE' ? 'bg-emerald-500/5' : 'bg-slate-950/40 text-slate-400'
                  }`}
                >
                  <td className="py-2 px-2.5 font-bold text-amber-300">
                    #{item.tradeNumber}
                  </td>
                  <td className="py-2 px-2.5 text-slate-400 whitespace-nowrap">
                    {item.timestamp.slice(11, 19)}
                  </td>
                  <td className="py-2 px-2.5 font-black text-white">
                    {item.symbol}
                  </td>
                  <td className="py-2 px-2.5">
                    {item.trigger === 'HIGH_COMPLETE_LONG' ? (
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-400">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        <span>High Complete → LONG</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-bold text-rose-400">
                        <ArrowDownRight className="w-3.5 h-3.5" />
                        <span>Low Complete → SHORT</span>
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-2.5 font-bold text-cyan-300">
                    {item.cycleStage}
                  </td>
                  <td className="py-2 px-2.5">
                    {item.action === 'TAKE_TRADE' ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-black text-[10px]">
                        TAKE TRADE
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700 font-bold text-[10px]">
                        WAIT (0/1)
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-2.5 font-bold text-white">
                    ${item.entryPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2 px-2.5 font-bold text-rose-400">
                    ${item.stopLossPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2 px-2.5 font-bold text-amber-300">
                    ${item.targetPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-2 px-2.5 font-black">
                    {item.targetCompletedWithinMinutes > 0 ? (
                      <span className="text-cyan-300">
                        ✓ {item.targetCompletedWithinMinutes}m (≤ 10m)
                      </span>
                    ) : (
                      <span className="text-slate-500">-</span>
                    )}
                  </td>
                  <td className="py-2 px-2.5">
                    {item.status === 'TARGET_COMPLETED' ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Target 1:10</span>
                      </span>
                    ) : (
                      <span className="text-slate-500">Cycle Wait</span>
                    )}
                  </td>
                  <td className="py-2 px-2.5 font-black">
                    {item.pnlUsd > 0 ? (
                      <span className="text-emerald-400">+${item.pnlUsd}</span>
                    ) : (
                      <span className="text-slate-500">$0</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Audit Bar */}
        <div className="px-5 py-3 border-t border-slate-800 bg-[#0a0f1d] flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Immutable Small Database: <strong>SR_TIME_100_TRADES_TARGETS_DB_V1</strong></span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-amber-300 font-bold">Q = $50 / |Entry - SL|</span>
            <span className="text-emerald-400 font-bold">Target 1:10 = +$500 per win</span>
          </div>
        </div>
      </div>
    </div>
  );
};
