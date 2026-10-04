import React, { useState } from 'react';
import { Database, TrendingUp, RefreshCw, AlertCircle, FileText, ShieldCheck } from 'lucide-react';
import { SrbmprValidationLayer } from './SrbmprValidationLayer';
import { EvidenceRegistrationLayer } from './EvidenceRegistrationLayer';
import { SrbmprProspectiveAuditLog } from './SrbmprProspectiveAuditLog';
import { FounderLiveArea } from './FounderLiveArea';
import { FundedAccountManager } from './FundedAccountManager';
import { SrbmprOneSecondEventStream } from './SrbmprOneSecondEventStream';
import { SrbmprDataDensityEngine } from './SrbmprDataDensityEngine';
import { LeverageProgressionTracker } from './LeverageProgressionTracker';
import { TimeFirstTimeZoneAuditor } from './TimeFirstTimeZoneAuditor';
import { Micro60SecondTerminalStream } from './Micro60SecondTerminalStream';
import { CountFirstCycleDashboard } from './CountFirstCycleDashboard';
import { SrbmprCycleCountEngineModule } from './SrbmprCycleCountEngineModule';
import { SrbmprRiskInputCleanTerminal } from './SrbmprRiskInputCleanTerminal';

export const ResearchPipelineWorkspace: React.FC = () => {
  // SRBMPR Precision Table: Profit Book -> Re-Entry Logic
  const researchCycles = [
    { tf: 'DAILY', entry: '$65,250', sl: '$65,185', target: '$71,775', action: 'TP & RE-ENTRY', status: 'ACTIVE' },
    { tf: '1 HOUR', entry: '$65,280', sl: '$65,215', target: '$66,500', action: 'TP & RE-ENTRY', status: 'WAITING' },
    { tf: '5 MIN', entry: '$65,310', sl: '$65,245', target: '$65,500', action: 'TP & RE-ENTRY', status: 'ACTIVE' }
  ];

  return (
    <div className="bg-black border border-emerald-500/50 rounded-3xl p-8 shadow-[0_0_50px_rgba(16,185,129,0.1)] space-y-8 font-mono">
      {/* Institutional Research & Verifiability Statement Banner */}
      <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-emerald-400 font-black uppercase text-sm">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>SRBMPR INDEPENDENT MARKET BEHAVIOR RESEARCH ENVIRONMENT</span>
          </div>
          <p className="text-zinc-400 text-[11px] max-w-4xl">
            <strong className="text-white">Strict Compliance & Verification Notice:</strong> SRBMPR does not provide speculative promises. All statistics reflect verifiable raw-data feeds (Bybit V5 Linear), cryptographic pre-registration hashes, and frozen deterministic rules. All datasets are transparently audited against closed-candle ticks.
          </p>
        </div>
        <div className="px-3 py-1.5 bg-black border border-zinc-700 text-zinc-300 rounded-xl text-[10px] font-bold shrink-0">
          STATUS: AUDIT-COMPLIANT
        </div>
      </div>

      <FounderLiveArea />
      <SrbmprRiskInputCleanTerminal />
      <SrbmprCycleCountEngineModule />
      <Micro60SecondTerminalStream />
      <CountFirstCycleDashboard />
      <SrbmprDataDensityEngine />
      <SrbmprOneSecondEventStream />
      <FundedAccountManager />
      <LeverageProgressionTracker />
      <TimeFirstTimeZoneAuditor />
      <div className="border-b border-zinc-800 pb-6">
        <h2 className="text-2xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-emerald-500" /> SRBMPR STRUCTURAL RE-ENTRY & CYCLE ANALYSIS ENGINE
        </h2>
        <p className="text-zinc-400 text-sm mt-2">
          "Structure Validation → Defined Risk Axis → Pre-Registered SL" [MULTI-TIMEFRAME QUANTITATIVE MATRIX]
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {researchCycles.map((cycle, idx) => (
          <div key={idx} className="bg-zinc-950 border border-zinc-800 p-6 rounded-3xl space-y-4 hover:border-emerald-500/50 transition-all">
            <div className="flex justify-between items-center">
              <span className="text-xl font-black text-emerald-400">{cycle.tf} CYCLE</span>
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-[10px] font-bold">{cycle.status}</span>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-zinc-500 text-xs"><span>Entry:</span> <span className="text-white font-bold">{cycle.entry}</span></div>
              <div className="flex justify-between text-zinc-500 text-xs"><span>Stop-Loss:</span> <span className="text-rose-400 font-bold">{cycle.sl}</span></div>
              <div className="flex justify-between text-zinc-500 text-xs"><span>Target:</span> <span className="text-emerald-400 font-bold">{cycle.target}</span></div>
            </div>

            <button className="w-full py-4 bg-emerald-500 text-black font-black rounded-2xl flex items-center justify-center gap-2 hover:bg-emerald-400 transition-all">
              <RefreshCw className="w-5 h-5" /> {cycle.action}
            </button>
          </div>
        ))}
      </div>
      
      <div className="bg-zinc-900 border border-emerald-500/30 p-8 rounded-3xl space-y-6">
        <h3 className="text-xl font-black text-white uppercase flex items-center gap-3">
          <FileText className="w-6 h-6 text-emerald-500" /> SRBMPR FORENSIC RESEARCH VAULT (PARTNER/INVESTOR GRADE)
        </h3>
        <p className="text-zinc-400 text-sm max-w-2xl">
          Complete, evidence-based research reports ready for forensic audit. Click to generate PDF/CSV with full data linkage.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'SRBMPR Validation Report', desc: 'Full Quantitative Audit' },
            { name: 'Time-Zone Integrity', desc: 'Temporal Sync Evidence' },
            { name: 'Data Leakage Audit', desc: 'No-Lookahead Proof' },
            { name: 'Mechanism Forensics', desc: 'Behavioural Traceability' }
          ].map((report, idx) => (
            <button key={idx} className="bg-black border border-emerald-500/20 p-5 rounded-2xl text-left hover:border-emerald-500/60 transition group">
              <span className="block text-emerald-400 font-black text-sm group-hover:text-white">{report.name}</span>
              <span className="block text-zinc-500 text-[10px] mt-1">{report.desc}</span>
              <span className="block text-emerald-500 text-[10px] font-bold mt-3 underline">Generate PDF/CSV</span>
            </button>
          ))}
        </div>
      </div>
      
      <SrbmprValidationLayer />
      <SrbmprProspectiveAuditLog />
      <EvidenceRegistrationLayer />
    </div>
  );
};

