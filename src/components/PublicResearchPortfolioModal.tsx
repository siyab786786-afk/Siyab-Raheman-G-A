import React, { useState } from 'react';
import { 
  Award, BookOpen, ShieldCheck, Terminal, ExternalLink, ArrowRight, 
  CheckCircle2, Database, Layers, Target, Clock, Cpu, FileText, 
  User, Search, AlertCircle, BarChart3, Lock, Shield
} from 'lucide-react';

interface PublicResearchPortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenArchive?: () => void;
  onOpenPineScript?: () => void;
}

export const PublicResearchPortfolioModal: React.FC<PublicResearchPortfolioModalProps> = ({
  isOpen,
  onClose,
  onOpenArchive,
  onOpenPineScript
}) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'METHODOLOGY' | 'DATABASE' | 'EVIDENCE' | 'PAPERS'>('OVERVIEW');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const verifiedMetrics = [
    { label: 'BTC 10-Minute Historical Candles', value: '116,726', category: 'Raw Data', status: 'AUDITED' },
    { label: 'Independently Documented Events', value: '3,157', category: 'Sequence', status: 'VERIFIED' },
    { label: 'H1 Zero-to-Zero Cycles', value: '2,065', category: 'Cycle', status: 'VERIFIED' },
    { label: 'BTC 10-Minute Behavioral Legs', value: '7,229', category: 'Leg Analysis', status: 'VERIFIED' },
    { label: 'Trades Meeting ≥5R Structural Condition', value: '8,579', category: 'Risk/Reward', status: 'VERIFIED' },
    { label: 'Maximum Favorable Excursion (MFE) Points', value: '8,632', category: 'MFE Metrics', status: 'AUDITED' },
    { label: 'Exact DateTime Gap-Map Records', value: '718', category: 'Gap Audit', status: 'AUDITED' },
    { label: 'Independent Validation Tests Passed', value: '17 of 17', category: 'Validation', status: '100% PASS' },
    { label: 'Detected Gaps in Frozen Pipeline', value: '0 Gaps', category: 'Data Quality', status: 'ZERO LEAKAGE' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-[#080a0d] border border-zinc-800 rounded-3xl w-full max-w-6xl overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.95)] flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-zinc-800/80 bg-zinc-950/70 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-mono font-black text-xl shadow-[0_0_25px_rgba(245,158,11,0.25)]">
              SR
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-lg md:text-xl font-black font-mono text-white tracking-widest uppercase">
                  SRBMPR PUBLIC RESEARCH PORTFOLIO & AUDIT EXPLORER
                </h2>
                <span className="text-[10px] bg-amber-500/10 text-amber-400 font-mono font-bold px-2.5 py-0.5 rounded-full border border-amber-500/30">
                  LINKEDIN VERIFIED SPEC
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono mt-1">
                Founder: <strong className="text-white">Siyab Raheman Gulwadi Abbushet</strong> | Independent Market-Behavior & Quantitative Researcher
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {onOpenArchive && (
              <button
                onClick={onOpenArchive}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-amber-400 border border-zinc-800 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all"
              >
                <Award className="w-4 h-4" /> Validation Archive
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-xl font-mono text-xs font-bold transition-all border border-zinc-800"
            >
              ✕ Close Portfolio
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-zinc-800/60 bg-zinc-950/40 overflow-x-auto scrollbar-none font-mono text-xs">
          <button
            onClick={() => setActiveTab('OVERVIEW')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-bold transition-all whitespace-nowrap ${
              activeTab === 'OVERVIEW'
                ? 'bg-zinc-900 text-amber-400 border-t-2 border-amber-500 border-x border-zinc-800'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <User className="w-3.5 h-3.5" /> Researcher & Mission
          </button>

          <button
            onClick={() => setActiveTab('METHODOLOGY')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-bold transition-all whitespace-nowrap ${
              activeTab === 'METHODOLOGY'
                ? 'bg-zinc-900 text-amber-400 border-t-2 border-amber-500 border-x border-zinc-800'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Core Methodology & 1:1→1:3
          </button>

          <button
            onClick={() => setActiveTab('DATABASE')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-bold transition-all whitespace-nowrap ${
              activeTab === 'DATABASE'
                ? 'bg-zinc-900 text-amber-400 border-t-2 border-amber-500 border-x border-zinc-800'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" /> Database Explorer (116k+ Records)
          </button>

          <button
            onClick={() => setActiveTab('EVIDENCE')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-bold transition-all whitespace-nowrap ${
              activeTab === 'EVIDENCE'
                ? 'bg-zinc-900 text-amber-400 border-t-2 border-amber-500 border-x border-zinc-800'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" /> Isolated Bybit / Binance Proof
          </button>

          <button
            onClick={() => setActiveTab('PAPERS')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-bold transition-all whitespace-nowrap ${
              activeTab === 'PAPERS'
                ? 'bg-zinc-900 text-amber-400 border-t-2 border-amber-500 border-x border-zinc-800'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" /> Publications & Gap Audit Papers
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6 font-mono text-xs">
          
          {/* TAB 1: OVERVIEW & MISSION */}
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-6">
              <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800/80 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-800 pb-4">
                  <div>
                    <span className="text-[10px] text-amber-400 uppercase tracking-widest font-bold">Public Research Mandate</span>
                    <h3 className="text-white font-bold text-base mt-1">SIYAB RAHEMAN BEHAVIOR MARKET PSYCHOLOGY RESEARCH (SRBMPR)</h3>
                  </div>
                  <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl text-[10px] font-bold">
                    REPRODUCIBLE • FALSIFIABLE • AUDITABLE
                  </span>
                </div>

                <p className="text-zinc-300 leading-relaxed text-xs">
                  Founded by <strong>Siyab Raheman Gulwadi Abbushet</strong> in 2010, SRBMPR is an independent quantitative behavioral research framework. Rather than relying on predictive indicators, black-box AI signals, or subjective charting patterns, SRBMPR reconstructs market behavior exclusively from <strong>raw OHLC sequences, exact exchange timestamps, and structural Zero-to-Zero cycles</strong>.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                  <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 uppercase block">Research Inception</span>
                    <span className="text-white font-bold text-sm">2010 — Present</span>
                    <span className="text-[10px] text-zinc-500 block mt-0.5">17+ Years Observation</span>
                  </div>

                  <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 uppercase block">Data Foundation</span>
                    <span className="text-emerald-400 font-bold text-sm">Pure Raw OHLC</span>
                    <span className="text-[10px] text-zinc-500 block mt-0.5">Zero Interpolation</span>
                  </div>

                  <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 uppercase block">Structural Reference</span>
                    <span className="text-amber-400 font-bold text-sm">$1.00 Anchor Axis</span>
                    <span className="text-[10px] text-zinc-500 block mt-0.5">Physical Stop Distance</span>
                  </div>

                  <div className="bg-zinc-950 p-3.5 rounded-xl border border-zinc-800">
                    <span className="text-[10px] text-zinc-500 uppercase block">Cycle State Machine</span>
                    <span className="text-blue-400 font-bold text-sm">1:1 → 1:2 → 1:3</span>
                    <span className="text-[10px] text-zinc-500 block mt-0.5">Deterministic Pipe Logic</span>
                  </div>
                </div>
              </div>

              {/* Research Chain */}
              <div className="bg-zinc-900/40 p-5 rounded-2xl border border-zinc-800 space-y-3">
                <h4 className="text-white font-bold text-xs uppercase tracking-wider">The 10-Step Deterministic Research Chain</h4>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-[10px]">
                  <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800"><span className="text-zinc-500 block">1</span> Source Exchange</div>
                  <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800"><span className="text-zinc-500 block">2</span> Raw OHLC Intake</div>
                  <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800"><span className="text-zinc-500 block">3</span> Exact UTC Date</div>
                  <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800"><span className="text-zinc-500 block">4</span> Exact UTC Time</div>
                  <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800"><span className="text-zinc-500 block">5</span> Sequence Derivation</div>
                  <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800"><span className="text-zinc-500 block">6</span> Mechanism Lock</div>
                  <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800"><span className="text-zinc-500 block">7</span> Zero-to-Zero Cycle</div>
                  <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800"><span className="text-zinc-500 block">8</span> Code Execution</div>
                  <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-800"><span className="text-zinc-500 block">9</span> Verified Result</div>
                  <div className="bg-zinc-950 p-2.5 rounded-xl border border-emerald-500/30 text-emerald-400 font-bold"><span className="text-emerald-500 block">10</span> Audit Archive</div>
                </div>
              </div>

              {/* Research Attribution & Recognition */}
              <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800/80 text-zinc-400 text-[11px] leading-relaxed">
                <span className="text-white font-bold block mb-1">Collaborative Attribution:</span>
                SRBMPR research encompasses the foundational contributions of <strong>Siyab Raheman Gulwadi Abbushet</strong> and the time-continuity research contributions of <strong>Raziya Raheman</strong>. All data and methodologies are documented for independent public audit.
              </div>
            </div>
          )}

          {/* TAB 2: METHODOLOGY */}
          {activeTab === 'METHODOLOGY' && (
            <div className="space-y-5">
              <div className="bg-zinc-900/50 p-5 rounded-2xl border border-zinc-800 space-y-3">
                <h4 className="text-white font-bold text-sm uppercase">1:1 → 1:2 → 1:3 Sequential Pipe State Machine</h4>
                <p className="text-zinc-300 leading-relaxed text-xs">
                  In SRBMPR, cycle completion is governed by deterministic sequential progression. Think of these as three connected physical pipes:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="bg-zinc-950 p-4 rounded-xl border border-amber-500/30 space-y-1.5">
                    <span className="text-[10px] text-amber-400 font-bold uppercase">Pipe 1 = 1:1 Progression</span>
                    <p className="text-zinc-400 text-[11px] leading-relaxed">
                      Measures initial impulse equal to 1.0 × Upper Wick Unit (W_ref). When 1:1 reaches 100%, Pipe 2 deterministically activates.
                    </p>
                  </div>
                  <div className="bg-zinc-950 p-4 rounded-xl border border-amber-500/30 space-y-1.5">
                    <span className="text-[10px] text-amber-400 font-bold uppercase">Pipe 2 = 1:2 Progression</span>
                    <p className="text-zinc-400 text-[11px] leading-relaxed">
                      Intermediate continuation stage. Pipe 1 remains completed in audit records; Pipe 2 becomes the live active state until 100% completion.
                    </p>
                  </div>
                  <div className="bg-zinc-950 p-4 rounded-xl border border-emerald-500/30 space-y-1.5">
                    <span className="text-[10px] text-emerald-400 font-bold uppercase">Pipe 3 = 1:3 Target & Reset</span>
                    <p className="text-zinc-400 text-[11px] leading-relaxed">
                      Continuation position within the cycle. 1:3 is not a static guess; upon completion, the cycle resets deterministically under defined rules.
                    </p>
                  </div>
                </div>
              </div>

              {/* The One-Dollar Structural Stop Rule */}
              <div className="bg-zinc-900/50 p-5 rounded-2xl border border-zinc-800 space-y-3">
                <h4 className="text-white font-bold text-sm uppercase flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-400" />
                  The $1.00 Structural Stop Rule
                </h4>
                <p className="text-zinc-300 leading-relaxed text-xs">
                  The $1.00 stop loss is not an arbitrary risk tolerance slider. It represents the <strong>exact structural reference distance</strong> derived from the anchor candle's left-side pivot. If the market coordinate does not support this structural boundary, the system identifies the condition as "WAITING" rather than fabricating an artificial trade.
                </p>
              </div>

              {/* Zero-to-Zero Cycle & One Entry Rule */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-2">
                  <h5 className="text-white font-bold text-xs uppercase">Zero Candle & Zero Cycle</h5>
                  <p className="text-zinc-400 text-[11px] leading-relaxed">
                    Identifies the exact origin candle from which directional momentum originates. A cycle completes only when returning to an opposite structural Zero state.
                  </p>
                </div>

                <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-2">
                  <h5 className="text-white font-bold text-xs uppercase">One Entry Per Cycle Principle</h5>
                  <p className="text-zinc-400 text-[11px] leading-relaxed">
                    Strict mathematical discipline: Each verified Zero-to-Zero cycle permits exactly one confirmed entry execution, eliminating overtrading and noise.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DATABASE EXPLORER */}
          {activeTab === 'DATABASE' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800">
                <div>
                  <h4 className="text-white font-bold text-sm uppercase">Verified Public Database Metrics</h4>
                  <p className="text-[11px] text-zinc-400">All numbers extracted from the PostgreSQL / TimescaleDB immutable audit ledger.</p>
                </div>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search metrics..."
                    className="bg-zinc-950 border border-zinc-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {verifiedMetrics
                  .filter(m => m.label.toLowerCase().includes(searchQuery.toLowerCase()) || m.category.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((item, idx) => (
                    <div key={idx} className="bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800/80 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] text-zinc-500 uppercase">{item.category}</span>
                        <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          {item.status}
                        </span>
                      </div>
                      <div className="text-2xl font-black text-white font-mono">{item.value}</div>
                      <div className="text-[11px] text-zinc-300 font-bold">{item.label}</div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* TAB 4: ISOLATED BYBIT / BINANCE EVIDENCE */}
          {activeTab === 'EVIDENCE' && (
            <div className="space-y-5">
              <div className="bg-zinc-900/50 p-5 rounded-2xl border border-zinc-800 space-y-3">
                <h4 className="text-white font-bold text-sm uppercase">Zero Cross-Broker Mixing Enforcement</h4>
                <p className="text-zinc-300 leading-relaxed text-xs">
                  To prevent cross-contamination and guarantee authentic verification, Bybit and Binance run in physically isolated processing pipelines:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="bg-zinc-950 p-4 rounded-xl border border-amber-500/30 space-y-2">
                    <span className="text-xs font-bold text-amber-400 uppercase">Container A: BYBIT_SRBMPR</span>
                    <ul className="text-zinc-400 text-[11px] space-y-1 list-disc list-inside">
                      <li>Source: Pure Bybit Linear V5 WebSocket & REST</li>
                      <li>Candles: Native Bybit klines and reconstructed trades</li>
                      <li>High/Low Coordinates: Bybit-only anchor calculations</li>
                      <li>Zero data from Binance or TradingView aggregated feeds</li>
                    </ul>
                  </div>

                  <div className="bg-zinc-950 p-4 rounded-xl border border-blue-500/30 space-y-2">
                    <span className="text-xs font-bold text-blue-400 uppercase">Container B: BINANCE_SRBMPR</span>
                    <ul className="text-zinc-400 text-[11px] space-y-1 list-disc list-inside">
                      <li>Source: Pure Binance USDT-M Futures WebSocket & REST</li>
                      <li>Candles: Native Binance mark price and trade sequence</li>
                      <li>High/Low Coordinates: Binance-only anchor calculations</li>
                      <li>Zero data from Bybit or other exchanges</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PUBLICATIONS & GAP AUDIT PAPERS */}
          {activeTab === 'PAPERS' && (
            <div className="space-y-4">
              <div className="bg-zinc-900/50 p-5 rounded-2xl border border-zinc-800 space-y-2">
                <h4 className="text-white font-bold text-sm uppercase">Academic & Scientific Documentation</h4>
                <p className="text-zinc-300 text-xs">
                  SRBMPR publishes formal research notes detailing behavioral mechanics, gap maps, and statistical reproducibility.
                </p>
              </div>

              <div className="space-y-3">
                <div className="bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-amber-400 uppercase font-bold">Research Paper #01</span>
                    <h5 className="text-white font-bold text-sm">Quantitative Market Behavior & Zero-to-Zero Cycle Mechanics</h5>
                    <p className="text-zinc-400 text-[11px] mt-0.5">Author: Siyab Raheman Gulwadi Abbushet • Status: Published</p>
                  </div>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-xl border border-emerald-500/30 font-bold shrink-0">
                    AUDITED ARCHIVE
                  </span>
                </div>

                <div className="bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-amber-400 uppercase font-bold">Research Paper #02</span>
                    <h5 className="text-white font-bold text-sm">16-Page Independent Gap File Audit & 718 Verified Event Timestamps</h5>
                    <p className="text-zinc-400 text-[11px] mt-0.5">Documenting exact UTC minute-by-minute integrity and zero synthetic interpolation.</p>
                  </div>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-xl border border-emerald-500/30 font-bold shrink-0">
                    AUDITED ARCHIVE
                  </span>
                </div>

                <div className="bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-amber-400 uppercase font-bold">Research Paper #03</span>
                    <h5 className="text-white font-bold text-sm">Time Horizon & Temporal Continuity Model (SR Time)</h5>
                    <p className="text-zinc-400 text-[11px] mt-0.5">Authors: Siyab Raheman & Raziya Raheman • Status: Peer-Review Ready</p>
                  </div>
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-xl border border-emerald-500/30 font-bold shrink-0">
                    AUDITED ARCHIVE
                  </span>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800/80 bg-zinc-950/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 text-zinc-500 text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Public Research Portfolio • Siyab Raheman Gulwadi Abbushet • No Financial Advice Policy</span>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={onClose}
              className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold transition-all"
            >
              Close Portfolio
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
