import React, { useState } from 'react';
import { KaliAuditReportSummary } from '../types/terminal';
import { 
  ShieldAlert, ShieldCheck, Terminal, AlertTriangle, FileText, 
  Clock, Database, Lock, CheckCircle2, XCircle, Search, 
  Layers, BarChart2, GitPullRequest, Hash, Printer, Cpu
} from 'lucide-react';

interface KaliAuditEngineModalProps {
  isOpen: boolean;
  onClose: () => void;
  auditSummary: KaliAuditReportSummary;
}

export const KaliAuditEngineModal: React.FC<KaliAuditEngineModalProps> = ({
  isOpen,
  onClose,
  auditSummary
}) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'STATISTICS' | 'FORWARD_ENGINE' | 'DUAL_AGENT'>('OVERVIEW');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
      <div className="bg-zinc-950 border border-red-500/30 rounded-3xl w-full max-w-5xl overflow-hidden shadow-[0_0_50px_rgba(239,68,68,0.2)] flex flex-col max-h-[95vh] text-zinc-200 font-mono">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800 bg-red-950/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
              <ShieldAlert className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
                  KALI LINUX INDEPENDENT AUDIT CONSOLE
                </h3>
                <span className="px-2 py-0.5 rounded bg-red-500/20 border border-red-500/40 text-[9px] font-black text-red-300">
                  ADVERSARIAL AUDIT
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                AUDITED FILE: {auditSummary.auditFile} • {auditSummary.totalPages} PAGES • {auditSummary.totalAuditedEvents} EVENTS VERIFIED
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Audit</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-all"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-zinc-800/80 bg-zinc-900/30 overflow-x-auto">
          {[
            { id: 'OVERVIEW', label: '16-Page & 718 Events Audit', icon: FileText },
            { id: 'STATISTICS', label: 'p-Value & Leakage Integrity', icon: BarChart2 },
            { id: 'FORWARD_ENGINE', label: '10-Year Forward Engine', icon: Cpu },
            { id: 'DUAL_AGENT', label: 'Ubuntu Builder vs Kali Auditor', icon: Terminal }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold tracking-wider uppercase border-b-2 transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-red-500 text-white bg-red-500/10'
                    : 'border-transparent text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* TAB 1: OVERVIEW & 718 EVENTS */}
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-6">
              
              {/* Summary Metrics Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-4">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">1m Timeframe (73 Days)</span>
                  <div className="text-2xl font-black text-emerald-400 mt-1">+$5,312.00</div>
                  <div className="text-[10px] text-zinc-400 mt-1">108 Events • 53% 'None' Excluded</div>
                  <div className="text-[10px] text-amber-400 mt-0.5">57% Clustered at 00:00/00:05 UTC</div>
                </div>

                <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-4">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">5m Timeframe (1 Year)</span>
                  <div className="text-2xl font-black text-emerald-400 mt-1">+$15,593.00</div>
                  <div className="text-[10px] text-zinc-400 mt-1">342 Events • 60% 'None' Excluded</div>
                  <div className="text-[10px] text-red-400 mt-0.5">75% Clustered at 00:00/00:05 UTC (Anomaly)</div>
                </div>

                <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-4">
                  <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">10m Timeframe (~2 Years)</span>
                  <div className="text-2xl font-black text-rose-400 mt-1">-$7,449.00</div>
                  <div className="text-[10px] text-zinc-400 mt-1">268 Events • 66% 'None' Excluded</div>
                  <div className="text-[10px] text-zinc-400 mt-0.5">42% Clustered at 00:00/00:05 UTC</div>
                </div>
              </div>

              {/* Critical Audit Findings */}
              <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-5 space-y-3">
                <h4 className="text-sm font-black text-red-400 flex items-center gap-2 uppercase tracking-wide">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  Audit Discrepancy & Verification Notes (PDF2 16-Page Ledger)
                </h4>
                <div className="space-y-2.5 text-zinc-300 leading-relaxed">
                  <div className="p-3 bg-black/40 rounded-xl border border-white/5">
                    <span className="text-white font-bold block mb-1">1. Script Mechanism vs Real SRBMPR Specification:</span>
                    The test script blindly entered at the <span className="text-amber-400">OPEN of the candle immediately following a gap</span> and exited after a static <span className="text-amber-400">100 bars</span> with no Stop Loss and no Target. Real SRBMPR rules mandate entering at the replay-confirmed structural level with a $1.00 (0.10%) risk coordinate. Therefore, the raw script P&L does not represent your real entry formula.
                  </div>

                  <div className="p-3 bg-black/40 rounded-xl border border-white/5">
                    <span className="text-white font-bold block mb-1">2. Majority Direction Excluded:</span>
                    Across all files, events with direction "none" were systematically excluded from trading calculations (1m: 53%, 5m: 60%, 10m: 66%). More than half the detected market gaps remained untraded.
                  </div>

                  <div className="p-3 bg-black/40 rounded-xl border border-white/5">
                    <span className="text-white font-bold block mb-1">3. Non-Additive Date Windows:</span>
                    The three timeframes cover completely different periods: 1m (73 days), 5m (1 full year), 10m (~2 years). They share only 73 common days. Summing their P&L figures (+5,312 + 15,593 - 7,449) is mathematically invalid.
                  </div>

                  <div className="p-3 bg-black/40 rounded-xl border border-white/5">
                    <span className="text-white font-bold block mb-1">4. 00:00 / 00:05 UTC Clock Clustering Anomaly:</span>
                    75% of 5m entries and 57% of 1m entries occur at exactly 00:00 or 00:05 UTC. This proves that these "gaps" are daily exchange session reset artifacts rather than genuine intraday behavioral patterns.
                  </div>
                </div>
              </div>

              {/* Timeframe Detail Table */}
              <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-black/40">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-800 bg-zinc-900/50 text-[10px] text-zinc-400 uppercase tracking-wider">
                      <th className="p-3.5">Timeframe</th>
                      <th className="p-3.5">Audited Period</th>
                      <th className="p-3.5">Total Events</th>
                      <th className="p-3.5">Excluded %</th>
                      <th className="p-3.5">P&L ($)</th>
                      <th className="p-3.5">Win Rate</th>
                      <th className="p-3.5">00:00 UTC Cluster</th>
                      <th className="p-3.5">Top-3 Skew</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {auditSummary.timeframeBreakdowns.map((tf) => (
                      <tr key={tf.timeframe} className="hover:bg-white/5">
                        <td className="p-3.5 font-bold text-white">{tf.timeframe}</td>
                        <td className="p-3.5 text-zinc-400">{tf.dateRange}</td>
                        <td className="p-3.5 text-zinc-300 font-bold">{tf.totalEvents}</td>
                        <td className="p-3.5 text-amber-400">{tf.directionNoneExcludedPercent}%</td>
                        <td className={`p-3.5 font-bold ${tf.pnlDollar >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {tf.pnlDollar >= 0 ? `+$${tf.pnlDollar.toLocaleString()}` : `-$${Math.abs(tf.pnlDollar).toLocaleString()}`}
                        </td>
                        <td className="p-3.5 text-zinc-300">{tf.winRatePercent}%</td>
                        <td className="p-3.5 text-red-400 font-bold">{tf.clusteringAt0000_0005Percent}%</td>
                        <td className="p-3.5 text-amber-300 font-bold">{tf.top3TradesProfitPercent}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* TAB 2: STATISTICS & LEAKAGE */}
          {activeTab === 'STATISTICS' && (
            <div className="space-y-6">
              
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 space-y-4">
                <h4 className="text-sm font-black text-amber-400 uppercase tracking-wide flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-amber-500" />
                  Statistical Hypothesis Testing (Null: Win Rate = 50.0% Random Coin Toss)
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-black/40 border border-zinc-800 p-4 rounded-xl space-y-2">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase">1-Minute Window</span>
                    <div className="text-lg font-black text-white">60.8% Win Rate</div>
                    <div className="text-xs font-bold text-amber-400">p-value: 0.16</div>
                    <p className="text-[10px] text-zinc-400 leading-normal">
                      p &gt; 0.05. Statistically indistinguishable from random noise at standard 95% confidence level. 95% CI is +$23 to +$193/trade, but on only 51 trades.
                    </p>
                  </div>

                  <div className="bg-black/40 border border-zinc-800 p-4 rounded-xl space-y-2">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase">5-Minute Window</span>
                    <div className="text-lg font-black text-white">54.5% Win Rate</div>
                    <div className="text-xs font-bold text-amber-400">p-value: 0.28</div>
                    <p className="text-[10px] text-zinc-400 leading-normal">
                      p &gt; 0.05. Null hypothesis cannot be rejected. Strong positive P&L is driven heavily by volatility cluster rather than statistical edge.
                    </p>
                  </div>

                  <div className="bg-black/40 border border-zinc-800 p-4 rounded-xl space-y-2">
                    <span className="text-[10px] text-zinc-500 font-bold uppercase">10-Minute Window</span>
                    <div className="text-lg font-black text-white">44.8% Win Rate</div>
                    <div className="text-xs font-bold text-rose-400">p-value: 0.46</div>
                    <p className="text-[10px] text-zinc-400 leading-normal">
                      Underperforms 50% baseline. Result is negative (-$7,449), demonstrating that raw mechanical gap entry fails on longer horizons.
                    </p>
                  </div>
                </div>
              </div>

              {/* Leakage Audit */}
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 space-y-3">
                <h4 className="text-sm font-black text-emerald-400 uppercase tracking-wide flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Lookahead Leakage & Outlier Concentration Checks
                </h4>
                <div className="space-y-3 text-zinc-300">
                  <div className="flex items-start gap-3 p-3 bg-black/30 rounded-xl border border-white/5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-white block">MFE & MAE Post-Event Integrity:</span>
                      Maximum Favorable Excursion (MFE) and Maximum Adverse Excursion (MAE) represent future price paths after the trade occurs. As long as MFE/MAE are NOT used to select the entry, they do not cause leakage. They are purely post-trade audit outputs.
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-black/30 rounded-xl border border-white/5">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-white block">Top 3 Trades Profit Concentration Skew:</span>
                      In the 1m report, the 3 largest trades account for <span className="text-amber-400 font-bold">32% of total profit</span>. In the 10m report, the top 3 account for <span className="text-amber-400 font-bold">32% of total profit</span>. Removing just 3 outlier trades turns marginal gains into losses.
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: 10-YEAR FORWARD-TEST ENGINE */}
          {activeTab === 'FORWARD_ENGINE' && (
            <div className="space-y-6">
              
              <div className="bg-gradient-to-br from-zinc-900 via-black to-zinc-900 border border-zinc-800 rounded-2xl p-5 space-y-4">
                <h4 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-indigo-400" />
                  Forward-Test Engine Architecture (Continuous 10-Year Execution Stream)
                </h4>
                <p className="text-zinc-400 leading-relaxed">
                  Future market candles do not exist in advance. The forward-test engine operates as an immutable real-time state machine: raw candles are ingested minute-by-minute and evaluated against strictly frozen rules.
                </p>

                {/* Pipeline Flowchart */}
                <div className="grid grid-cols-1 sm:grid-cols-7 gap-2 text-center text-[10px]">
                  <div className="p-3 bg-zinc-900/90 border border-zinc-800 rounded-xl">
                    <span className="text-zinc-500 font-bold block">STEP 1</span>
                    <span className="text-white font-bold">FROZEN RULES</span>
                    <span className="text-[9px] text-zinc-500 block mt-1">Zero Discretion</span>
                  </div>
                  <div className="flex items-center justify-center text-zinc-600 font-bold">→</div>
                  <div className="p-3 bg-zinc-900/90 border border-zinc-800 rounded-xl">
                    <span className="text-zinc-500 font-bold block">STEP 2</span>
                    <span className="text-white font-bold">LIVE RAW DATA</span>
                    <span className="text-[9px] text-emerald-400 block mt-1">1m Bybit/Binance</span>
                  </div>
                  <div className="flex items-center justify-center text-zinc-600 font-bold">→</div>
                  <div className="p-3 bg-zinc-900/90 border border-zinc-800 rounded-xl">
                    <span className="text-zinc-500 font-bold block">STEP 3</span>
                    <span className="text-white font-bold">ZERO DETECTION</span>
                    <span className="text-[9px] text-amber-400 block mt-1">Left / Right Form</span>
                  </div>
                  <div className="flex items-center justify-center text-zinc-600 font-bold">→</div>
                  <div className="p-3 bg-zinc-900/90 border border-zinc-800 rounded-xl">
                    <span className="text-zinc-500 font-bold block">STEP 4</span>
                    <span className="text-white font-bold">FROZEN LEDGER</span>
                    <span className="text-[9px] text-blue-400 block mt-1">SHA-256 Hash</span>
                  </div>
                </div>

                <div className="p-4 bg-black/60 rounded-xl border border-zinc-800 space-y-2 text-zinc-300">
                  <span className="text-white font-bold block uppercase text-[11px]">Strict Anti-Fabrication Guarantees:</span>
                  <ul className="list-disc list-inside space-y-1 text-zinc-400">
                    <li><strong className="text-zinc-200">Zero Synthetic Candle Generation:</strong> No synthetic or fabricated candles allowed. Missing data is stamped as <span className="text-amber-400 font-mono">MISSING</span>.</li>
                    <li><strong className="text-zinc-200">Immutable Cryptographic Hashing:</strong> Every event is logged with millisecond UTC timestamp and SHA-256 hash. If 10,000 raw candles enter, 10,000 candles are preserved.</li>
                    <li><strong className="text-zinc-200">No Training Set Contamination:</strong> Future data is never backward-merged into past historical sets to manufacture false perfection.</li>
                  </ul>
                </div>
              </div>

              {/* Required Data for 17-Year PDF */}
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl space-y-2">
                <span className="text-amber-300 font-bold uppercase text-[11px]">To Produce the Full 17-Year Historical Audit Ledger:</span>
                <p className="text-zinc-300 leading-relaxed">
                  1. Official BTC 1-minute historical candles (Open, High, Low, Close, Volume, UTC Timestamps) from 2017 to current date.<br />
                  2. Concrete, versioned mathematical definition for Left and Right swing formation on 1-minute bars without manual post-hoc adjustments.
                </p>
              </div>

            </div>
          )}

          {/* TAB 4: DUAL-AGENT SEGREGATION */}
          {activeTab === 'DUAL_AGENT' && (
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                {/* Ubuntu Builder */}
                <div className="bg-zinc-900/60 border border-blue-500/30 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-2 text-blue-400 font-black uppercase text-sm">
                    <Terminal className="w-4 h-4" /> Ubuntu Builder Agent
                  </div>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase block">Role: Engineering, Execution & Continuous Stream</span>
                  <div className="space-y-2 text-zinc-300">
                    <p>• Ingests 24/7 Bybit & Binance native kline WebSockets.</p>
                    <p>• Constructs the High-Low behavioral pipes (1:1 → 1:2 → 1:3).</p>
                    <p>• Runs the Limit Order Terminal with frozen coordinates.</p>
                    <p>• Generates daily performance snapshots and trade ledgers.</p>
                  </div>
                  <div className="pt-2">
                    <span className="px-2.5 py-1 rounded bg-blue-500/10 border border-blue-500/30 text-blue-400 font-bold text-[10px]">
                      STATUS: ONLINE & BUILDING
                    </span>
                  </div>
                </div>

                {/* Kali Linux Auditor */}
                <div className="bg-zinc-900/60 border border-red-500/30 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center gap-2 text-red-400 font-black uppercase text-sm">
                    <ShieldAlert className="w-4 h-4" /> Kali Linux Auditor Agent
                  </div>
                  <span className="text-[10px] text-zinc-500 font-bold uppercase block">Role: Adversarial Audit, Security & Fraud Prevention</span>
                  <div className="space-y-2 text-zinc-300">
                    <p>• Challenges all claims against the 50% random chance null hypothesis.</p>
                    <p>• Audits for clock-time clustering (e.g. 00:00/00:05 UTC session gaps).</p>
                    <p>• Inspects for MFE/MAE lookahead leakage and data fabrication.</p>
                    <p>• Enforces cryptographic SHA-256 verification on raw files.</p>
                  </div>
                  <div className="pt-2">
                    <span className="px-2.5 py-1 rounded bg-red-500/10 border border-red-500/30 text-red-400 font-bold text-[10px]">
                      STATUS: ADVERSARIAL AUDIT ENGAGED
                    </span>
                  </div>
                </div>

              </div>

              <div className="p-4 bg-black/40 rounded-xl border border-zinc-800 text-zinc-400 leading-relaxed">
                <span className="text-white font-bold block mb-1">Architectural Independence Rule:</span>
                The Builder Agent is never permitted to audit its own code. The Kali Linux Auditor evaluates the raw datasets independently and issues falsifiable, reproducible reports.
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/40 flex items-center justify-between text-[11px] text-zinc-500">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-red-400" />
            <span>KALI ADVERSARIAL PROTOCOL • ZERO LEAKAGE ENFORCED</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold transition-all"
          >
            Close Audit Console
          </button>
        </div>

      </div>
    </div>
  );
};
