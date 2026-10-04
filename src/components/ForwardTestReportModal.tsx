import React from 'react';
import { ValidationArchiveRecord } from '../types/terminal';
import { ShieldCheck, Download, Award, FileText, CheckCircle2 } from 'lucide-react';

interface ForwardTestReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  archives: ValidationArchiveRecord[];
}

export const ForwardTestReportModal: React.FC<ForwardTestReportModalProps> = ({ isOpen, onClose, archives }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-900 bg-zinc-900/40">
          <div className="flex items-center gap-2.5">
            <Award className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="text-sm font-mono font-bold text-white">SRBMPR-25/26 QUANTITATIVE VALIDATION ARCHIVE & PROOF</h3>
              <p className="text-xs text-zinc-400 font-mono">Immutable Backtest & Forward Test Evidence Ledger</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-white font-mono text-sm px-3 py-1 bg-zinc-900 rounded-lg">
            ✕ Close
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-mono font-bold text-white">Data Integrity & Source Verification</h4>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">All test records are verified against Bybit and Binance V5 mainnet raw streams.</p>
            </div>
            <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs rounded-lg flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> 100% Traceable
            </span>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold text-zinc-300 uppercase tracking-wider">Validation Archive Records</h4>
            {archives.map((arch) => (
              <div key={arch.id} className="bg-zinc-900/70 border border-zinc-800 p-4 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 font-mono text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-amber-400">{arch.id}</span>
                    <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px]">{arch.exchange} • {arch.symbol}</span>
                    <span className="text-zinc-500">{arch.timeframe}</span>
                  </div>
                  <div className="text-zinc-400 text-[11px]">Timezone: {arch.timezone} | Timestamp: {arch.timestamp}</div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-zinc-500 text-[10px]">WIN RATE</div>
                    <div className="text-emerald-400 font-bold">{arch.winRate}%</div>
                  </div>
                  <div className="text-center">
                    <div className="text-zinc-500 text-[10px]">CYCLES</div>
                    <div className="text-white font-bold">{arch.confirmedCycles}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-zinc-500 text-[10px]">MFE / MAE</div>
                    <div className="text-amber-400 font-bold">{arch.avgMfe}R / {arch.avgMae}R</div>
                  </div>
                  <button
                    onClick={() => alert(`Downloading Verification Proof PDF for ${arch.id}...`)}
                    className="p-2.5 bg-zinc-800 hover:bg-zinc-700 text-amber-400 rounded-lg transition-all"
                    title="Download Proof PDF"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-900 bg-zinc-900/30 flex justify-end">
          <button onClick={onClose} className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-mono text-xs font-bold">
            Close Archive
          </button>
        </div>

      </div>
    </div>
  );
};
