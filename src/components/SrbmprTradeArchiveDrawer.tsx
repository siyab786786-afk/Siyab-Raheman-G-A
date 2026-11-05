import React from 'react';
import {
  Archive,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  FileText,
  Filter,
  X,
  RotateCcw
} from 'lucide-react';

export interface ArchivedTradeRecord {
  id: string;
  symbol: string;
  timeframe: string;
  direction: 'LONG' | 'SHORT';
  sequencePattern: string;
  entryPrice: number;
  stopLossPrice: number;
  targetPrice: number;
  exitPrice: number;
  realizedR: number;
  mfeR: number;
  maeR: number;
  entryTime: string;
  exitTime: string;
  outcome: 'TARGET_HIT' | 'SL_HIT' | 'TIMED_OUT';
  isRetest: boolean;
  retestParentId?: string;
  retestEligible: boolean;
}

interface SrbmprTradeArchiveDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  archivedTrades: ArchivedTradeRecord[];
  onSelectTradeForInspection?: (trade: ArchivedTradeRecord) => void;
}

export const SrbmprTradeArchiveDrawer: React.FC<SrbmprTradeArchiveDrawerProps> = ({
  isOpen,
  onClose,
  archivedTrades,
  onSelectTradeForInspection
}) => {
  if (!isOpen) return null;

  const totalTrades = archivedTrades.length;
  const targetHits = archivedTrades.filter(t => t.outcome === 'TARGET_HIT').length;
  const slHits = archivedTrades.filter(t => t.outcome === 'SL_HIT').length;
  const winRate = totalTrades > 0 ? ((targetHits / totalTrades) * 100).toFixed(1) : '0.0';
  const totalR = archivedTrades.reduce((acc, t) => acc + t.realizedR, 0).toFixed(2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 font-mono select-none">
      <div className="bg-[#0b0f19] border border-slate-700 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-100">
        
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 bg-[#070a12] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Archive className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <span>Completed Trade Archive & Retest Ledger</span>
                <span className="text-[10px] bg-purple-500/15 border border-purple-500/40 text-purple-300 px-2 py-0.5 rounded font-bold">
                  Immutable Records ({totalTrades})
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Completed trades automatically move here, keeping the main chart clean for the next active entry.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stats Summary Bar */}
        <div className="grid grid-cols-4 gap-2 bg-slate-900/60 p-3 border-b border-slate-800 text-xs">
          <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase">Archived Setups</div>
            <div className="text-base font-bold text-white tabular-nums">{totalTrades}</div>
          </div>
          <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase">Target Hits</div>
            <div className="text-base font-bold text-emerald-400 tabular-nums">{targetHits}</div>
          </div>
          <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase">Stop Loss Hits</div>
            <div className="text-base font-bold text-rose-400 tabular-nums">{slHits}</div>
          </div>
          <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase">Win Rate / Total R</div>
            <div className="text-base font-bold text-amber-400 tabular-nums">{winRate}% ({totalR >= '0' ? `+${totalR}R` : `${totalR}R`})</div>
          </div>
        </div>

        {/* Content Table */}
        <div className="p-4 max-h-[60vh] overflow-y-auto">
          {archivedTrades.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs space-y-2">
              <Archive className="w-8 h-8 mx-auto text-slate-600" />
              <div>No trades archived yet.</div>
              <p className="text-[11px] text-slate-400 max-w-md mx-auto">
                When an active trade on the main chart reaches its Target, Stop-Loss, or completes its minimum observation window, its complete chart is frozen and preserved here.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-[11px] tabular-nums border-collapse">
              <thead className="bg-slate-950 border-b border-slate-800 text-slate-400 text-[10px] uppercase sticky top-0">
                <tr>
                  <th className="py-2 px-3">Trade ID</th>
                  <th className="py-2 px-3">Dir / Symbol</th>
                  <th className="py-2 px-3">Sequence Pattern</th>
                  <th className="py-2 px-3 text-right">Entry</th>
                  <th className="py-2 px-3 text-right">SL</th>
                  <th className="py-2 px-3 text-right">Target</th>
                  <th className="py-2 px-3 text-right">Exit</th>
                  <th className="py-2 px-3 text-right">Realized R</th>
                  <th className="py-2 px-3 text-right">MFE / MAE</th>
                  <th className="py-2 px-3">Status</th>
                  <th className="py-2 px-3">Retest Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {archivedTrades.map(t => (
                  <tr key={t.id} className="hover:bg-slate-900/60 transition-colors">
                    <td className="py-2 px-3 font-bold text-slate-400">{t.id}</td>
                    <td className="py-2 px-3">
                      <span className={`font-black ${t.direction === 'LONG' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {t.direction}
                      </span>{' '}
                      <span className="text-slate-300 font-bold">{t.symbol}</span>
                    </td>
                    <td className="py-2 px-3 text-slate-300 text-[10px] truncate max-w-[180px]" title={t.sequencePattern}>
                      {t.sequencePattern}
                    </td>
                    <td className="py-2 px-3 text-right text-white font-bold">${t.entryPrice.toFixed(2)}</td>
                    <td className="py-2 px-3 text-right text-rose-400">${t.stopLossPrice.toFixed(2)}</td>
                    <td className="py-2 px-3 text-right text-emerald-400">${t.targetPrice.toFixed(2)}</td>
                    <td className="py-2 px-3 text-right text-slate-200 font-bold">${t.exitPrice.toFixed(2)}</td>
                    <td className={`py-2 px-3 text-right font-bold ${t.realizedR >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {t.realizedR >= 0 ? `+${t.realizedR}R` : `${t.realizedR}R`}
                    </td>
                    <td className="py-2 px-3 text-right text-[10px] text-slate-400">
                      +{t.mfeR}R / -{t.maeR}R
                    </td>
                    <td className="py-2 px-3">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                        t.outcome === 'TARGET_HIT'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : t.outcome === 'SL_HIT'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}>
                        {t.outcome.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-2 px-3">
                      {t.isRetest ? (
                        <span className="text-[10px] font-bold text-cyan-400 flex items-center gap-1">
                          <RotateCcw className="w-3 h-3" /> RETEST TRADE
                        </span>
                      ) : t.retestEligible ? (
                        <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30">
                          RETEST ELIGIBLE
                        </span>
                      ) : (
                        <span className="text-slate-600 text-[10px]">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-[#070a12] flex items-center justify-between text-[11px] text-slate-400">
          <span>SRBMPR Lifecycle: One Active Chart → Completed Archived Trade → Next Eligible Entry</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold"
          >
            Close Archive
          </button>
        </div>

      </div>
    </div>
  );
};
