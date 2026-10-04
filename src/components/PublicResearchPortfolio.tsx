import React from 'react';
import { BookOpen, ShieldCheck, Terminal, Award, ExternalLink, ArrowRight } from 'lucide-react';

interface PublicResearchPortfolioProps {
  onOpenArchive: () => void;
  onOpenPineScript: () => void;
  onOpenFullPortfolio?: () => void;
}

export const PublicResearchPortfolio: React.FC<PublicResearchPortfolioProps> = ({ 
  onOpenArchive, 
  onOpenPineScript,
  onOpenFullPortfolio 
}) => {
  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-6 font-mono">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-zinc-900">
        <div>
          <span className="text-amber-500 text-xs tracking-widest uppercase font-bold">Independent Quantitative Research</span>
          <h2 className="text-xl font-bold text-white mt-1">SRBMPR-25/26 PUBLIC RESEARCH PORTFOLIO</h2>
          <p className="text-xs text-zinc-400 mt-0.5">
            Founder: Siyab Raheman Gulwadi Abbushet | Independent Market-Behavior & Quantitative Researcher
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {onOpenFullPortfolio && (
            <button
              onClick={onOpenFullPortfolio}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-blue-600/20"
            >
              <ExternalLink className="w-4 h-4" /> Full Portfolio Spec (LinkedIn)
            </button>
          )}
          <button
            onClick={onOpenArchive}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-amber-400 border border-zinc-800 rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
          >
            <Award className="w-4 h-4" /> Validation Archive
          </button>
          <button
            onClick={onOpenPineScript}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
          >
            <Terminal className="w-4 h-4" /> Pine Script v5 Generator
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800 space-y-2">
          <div className="text-amber-400 font-bold text-sm">1. Upper Wick Unit (W-Ref)</div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Standardized measurement unit defined by the anchor candle high minus the body top. All internal and external projections derive from this immutable unit.
          </p>
        </div>

        <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800 space-y-2">
          <div className="text-amber-400 font-bold text-sm">2. 1:1 → 1:2 → 1:3 Sequence</div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Deterministic state machine where completion of Pipe 1 (1:1) unlocks Pipe 2 (1:2), subsequently leading to Pipe 3 (1:3) target progression without data leakage.
          </p>
        </div>

        <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-800 space-y-2">
          <div className="text-amber-400 font-bold text-sm">3. Isolated Broker Containers</div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Zero cross-broker mixing rule. Bybit Mainnet V5 and Binance Futures data run in independent pipelines to guarantee pristine raw validation.
          </p>
        </div>
      </div>
    </div>
  );
};
