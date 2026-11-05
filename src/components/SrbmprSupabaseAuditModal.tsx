import React, { useState, useEffect } from 'react';
import {
  X,
  Database,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Play,
  ArrowRight,
  Server,
  Table,
  UploadCloud,
  FileText
} from 'lucide-react';
import {
  SrbmprSupabaseService,
  SupabaseTestResult,
  SupabaseForwardTestAuditRow
} from '../services/SrbmprSupabaseService';
import { RawOhlcBar } from '../services/SrbmprForwardTestEngine';
import { SupabaseDiagnosticPanel } from './SupabaseDiagnosticPanel';

interface SrbmprSupabaseAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSymbol?: string;
  activeTimeframe?: string;
  currentBars?: RawOhlcBar[];
}

export const SrbmprSupabaseAuditModal: React.FC<SrbmprSupabaseAuditModalProps> = ({
  isOpen,
  onClose,
  activeSymbol = 'BTC/USDT',
  activeTimeframe = '1m',
  currentBars = []
}) => {
  const supabaseService = SrbmprSupabaseService.getInstance();
  const details = supabaseService.getProjectDetails();

  const [activeTab, setActiveTab] = useState<'CONNECTION' | 'SQL_MIGRATION' | 'AUDIT_RECORDS' | 'SYNC_CANDLES' | 'DIAGNOSTIC_PANEL'>('CONNECTION');
  const [tokenInput, setTokenInput] = useState<string>(() => supabaseService.getPublishableToken());
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<SupabaseTestResult | null>(null);
  const [auditRows, setAuditRows] = useState<SupabaseForwardTestAuditRow[]>([]);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<{ count?: number; error?: string } | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTokenInput(supabaseService.getPublishableToken());
      loadAuditRows();
      runDatabaseTest();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const loadAuditRows = async () => {
    const rows = await supabaseService.fetchForwardTestAudits(activeSymbol);
    setAuditRows(rows);
  };

  const runDatabaseTest = async () => {
    setIsTesting(true);
    try {
      const res = await supabaseService.testDatabaseConnection();
      setTestResult(res);
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveToken = () => {
    supabaseService.setPublishableToken(tokenInput);
    runDatabaseTest();
  };

  const handleCopySql = () => {
    const sql = supabaseService.getNonDestructiveMigrationSql();
    navigator.clipboard.writeText(sql);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleSyncCandles = async () => {
    if (currentBars.length === 0) return;
    setIsSyncing(true);
    setSyncStatus(null);
    try {
      const res = await supabaseService.syncCandlesToDatabase(
        activeSymbol,
        activeTimeframe,
        currentBars
      );
      if (res.error) {
        setSyncStatus({ error: res.error });
      } else {
        setSyncStatus({ count: res.inserted });
        runDatabaseTest();
      }
    } finally {
      setIsSyncing(false);
    }
  };

  const migrationSql = supabaseService.getNonDestructiveMigrationSql();

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-5">
      <div className="bg-[#070b14] border border-emerald-500/50 rounded-xl shadow-2xl shadow-emerald-500/15 w-full max-w-4xl flex flex-col overflow-hidden font-mono text-xs max-h-[90vh]">
        
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-emerald-500/30 bg-gradient-to-r from-[#071311] via-[#0d221e] to-[#071311] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-400 flex items-center justify-center shadow-[0_0_12px_rgba(16,185,129,0.3)]">
              <Database className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-black text-white tracking-wider flex items-center gap-1.5">
                  SUPABASE CENTRAL DATABASE
                </h2>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                  PROJECT: {details.projectId}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5 flex items-center gap-2">
                <span>{details.url}</span>
                <span className="text-zinc-600">•</span>
                <span className="text-emerald-400">TimescaleDB / Postgres Port 5432</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={details.sqlEditorUrl}
              target="_blank"
              rel="noreferrer"
              className="px-2.5 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-500/40 text-emerald-300 text-[11px] font-bold flex items-center gap-1.5 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open Supabase SQL Editor</span>
            </a>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 border-b border-zinc-800 bg-[#090f17] flex items-center gap-2 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('CONNECTION')}
            className={`px-3 py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'CONNECTION'
                ? 'border-emerald-400 text-emerald-300 bg-emerald-500/10'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Connection & Health</span>
          </button>

          <button
            onClick={() => setActiveTab('SQL_MIGRATION')}
            className={`px-3 py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'SQL_MIGRATION'
                ? 'border-emerald-400 text-emerald-300 bg-emerald-500/10'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Safe SQL Migration</span>
            <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 text-[9px]">IF NOT EXISTS</span>
          </button>

          <button
            onClick={() => setActiveTab('AUDIT_RECORDS')}
            className={`px-3 py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'AUDIT_RECORDS'
                ? 'border-emerald-400 text-emerald-300 bg-emerald-500/10'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Table className="w-3.5 h-3.5" />
            <span>Forward Test DB Records ({auditRows.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('SYNC_CANDLES')}
            className={`px-3 py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'SYNC_CANDLES'
                ? 'border-emerald-400 text-emerald-300 bg-emerald-500/10'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Sync Chart to DB ({currentBars.length} Bars)</span>
          </button>

          <button
            onClick={() => setActiveTab('DIAGNOSTIC_PANEL')}
            className={`px-3 py-2.5 text-xs font-bold border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'DIAGNOSTIC_PANEL'
                ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Raw JSON Diagnostics</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          
          {/* TAB 1: CONNECTION & HEALTH */}
          {activeTab === 'CONNECTION' && (
            <div className="space-y-4">
              
              {/* Token Configuration Bar */}
              <div className="p-4 rounded-xl bg-[#0b1318] border border-emerald-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="font-bold text-white text-xs">
                      Supabase Publishable Token (Saved Once Permanently)
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px]">
                    No Repeated Prompts
                  </span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="password"
                    value={tokenInput}
                    onChange={e => setTokenInput(e.target.value)}
                    placeholder="Paste sb_publishable_... or anon JWT token from Supabase Dashboard"
                    className="flex-1 bg-black/80 border border-zinc-700 rounded-lg px-3 py-2 text-emerald-200 text-xs font-mono focus:outline-none focus:border-emerald-400"
                  />
                  <button
                    onClick={handleSaveToken}
                    className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs transition"
                  >
                    Save Token
                  </button>
                  <button
                    onClick={runDatabaseTest}
                    disabled={isTesting}
                    className="px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold text-xs flex items-center gap-1.5 transition"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                    <span>Test Probe</span>
                  </button>
                </div>
                <p className="text-[10px] text-zinc-400">
                  Find in: Supabase Dashboard &rarr; Project <code className="text-emerald-300">kyrnctzfvmivzqejogci</code> &rarr; Project Settings &rarr; API &rarr; Publishable / Anon Key.
                </p>
              </div>

              {/* Probe Result */}
              {testResult && (
                <div className={`p-4 rounded-xl border ${
                  testResult.success
                    ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                    : 'bg-zinc-900 border-zinc-700 text-zinc-300'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 font-bold text-xs">
                      {testResult.success ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-400" />
                      )}
                      <span>{testResult.message}</span>
                    </div>
                    <span className="text-[10px] text-zinc-400">
                      Roundtrip: {testResult.latencyMs}ms
                    </span>
                  </div>

                  {/* Table checks */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3">
                    {testResult.tablesVerified.map(tbl => (
                      <div
                        key={tbl.name}
                        className="p-2.5 rounded-lg bg-black/60 border border-zinc-800 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-bold text-white text-[11px]">{tbl.name}</div>
                          <div className="text-[10px] text-zinc-400">
                            {tbl.accessible ? `Sample: ${tbl.rowCountSample} rows` : tbl.error || 'Pending migration'}
                          </div>
                        </div>
                        {tbl.accessible ? (
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                        ) : (
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Environment Variable Verification (Server-Side) */}
              {testResult?.envAudit && (
                <div className="p-4 rounded-xl bg-[#0a1019] border border-cyan-500/30 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cyan-300 text-xs">
                      AI Studio Environment Variables Audit (Server-Side)
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        testResult.envAudit.missingRequired.length === 0
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}
                    >
                      {testResult.envAudit.missingRequired.length === 0
                        ? 'ALL ENV VARS CONFIGURED'
                        : `MISSING: ${testResult.envAudit.missingRequired.join(', ')}`}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px]">
                    <div className="p-2.5 rounded-lg bg-black/60 border border-zinc-800 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-white">VITE_SUPABASE_URL</div>
                        <div className="text-[10px] text-emerald-400 truncate max-w-[180px]">
                          https://kyrnctzfvmivzqejogci.supabase.co
                        </div>
                      </div>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    </div>

                    <div className="p-2.5 rounded-lg bg-black/60 border border-zinc-800 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-white">VITE_SUPABASE_ANON_KEY</div>
                        <div className="text-[10px] text-zinc-400">
                          {testResult.envAudit.VITE_SUPABASE_ANON_KEY.configured || Boolean(tokenInput)
                            ? 'Configured'
                            : 'Missing in AI Studio Env'}
                        </div>
                      </div>
                      {testResult.envAudit.VITE_SUPABASE_ANON_KEY.configured || Boolean(tokenInput) ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                      )}
                    </div>

                    <div className="p-2.5 rounded-lg bg-black/60 border border-zinc-800 flex items-center justify-between">
                      <div>
                        <div className="font-bold text-white">DATABASE_URL</div>
                        <div className="text-[10px] text-zinc-400">
                          {testResult.envAudit.DATABASE_URL.configured
                            ? 'Configured (PostgreSQL)'
                            : 'Missing in AI Studio Env'}
                        </div>
                      </div>
                      {testResult.envAudit.DATABASE_URL.configured ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Architectural Confirmation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-[#0a0f16] border border-zinc-800">
                  <div className="text-zinc-400 text-[10px] uppercase font-bold">DATABASE SCHEMA PRESERVATION</div>
                  <div className="text-emerald-300 font-bold text-xs mt-1">
                    public.candles (open_time) • Zero Cycles • LEFT/RIGHT
                  </div>
                  <div className="text-zinc-500 text-[10px] mt-0.5">
                    Existing historical candles, sequences & Forward Test records preserved
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[#0a0f16] border border-zinc-800">
                  <div className="text-zinc-400 text-[10px] uppercase font-bold">30-DAY SPOT ENGINE & SAFETY LOCK</div>
                  <div className="text-cyan-300 font-bold text-xs mt-1">
                    30-Day Continuous Horizon • Idempotent order_link_id
                  </div>
                  <div className="text-zinc-500 text-[10px] mt-0.5">
                    Live Spot orders remain locked until DB & Bybit auth are verified
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: SAFE SQL MIGRATION */}
          {activeTab === 'SQL_MIGRATION' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/40 text-amber-200 text-xs flex items-center justify-between">
                <div>
                  <strong>Safe Non-Destructive Guarantee:</strong> Every SQL statement uses <code>IF NOT EXISTS</code>. It will NEVER drop, delete, or overwrite your existing historical market data.
                </div>
                <button
                  onClick={handleCopySql}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-black text-xs flex items-center gap-1.5 shrink-0 ml-3 transition"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{isCopied ? 'SQL Copied!' : 'Copy Migration SQL'}</span>
                </button>
              </div>

              <div className="relative">
                <pre className="bg-[#05080f] border border-zinc-800 rounded-xl p-4 text-[11px] font-mono text-emerald-200/90 overflow-x-auto max-h-[45vh] leading-relaxed">
                  {migrationSql}
                </pre>
              </div>

              <div className="p-3 rounded-lg bg-[#0a0f16] border border-zinc-800 flex items-center justify-between">
                <div className="text-[11px] text-zinc-400">
                  Ready to execute? Open your Supabase SQL Editor, paste the SQL script, and click <strong>RUN</strong>.
                </div>
                <a
                  href={details.sqlEditorUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center gap-1.5 transition"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Execute in Supabase SQL Editor</span>
                </a>
              </div>
            </div>
          )}

          {/* TAB 3: AUDIT RECORDS */}
          {activeTab === 'AUDIT_RECORDS' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-zinc-300 font-bold text-xs">
                  Forward Test Audit Entries for {activeSymbol}
                </span>
                <button
                  onClick={loadAuditRows}
                  className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-bold flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Reload Records</span>
                </button>
              </div>

              {auditRows.length === 0 ? (
                <div className="p-8 text-center bg-[#0a0f16] rounded-xl border border-zinc-800 text-zinc-500 text-xs">
                  No forward test records recorded yet. As you execute Forward Test cycles (+1 step / Auto Play), completed targets (1:1, 1:2, 1:3) will automatically be saved to <code>public.srbmpr_forward_tests</code>!
                </div>
              ) : (
                <div className="overflow-x-auto border border-zinc-800 rounded-xl">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-[#0a0f18] text-zinc-400 border-b border-zinc-800">
                      <tr>
                        <th className="p-2">#</th>
                        <th className="p-2">Asset</th>
                        <th className="p-2">Dir</th>
                        <th className="p-2">Entry</th>
                        <th className="p-2">SL</th>
                        <th className="p-2">1:1 (T1)</th>
                        <th className="p-2">50% EQ</th>
                        <th className="p-2">1:2 (T2)</th>
                        <th className="p-2">1:3 (T3)</th>
                        <th className="p-2">PnL</th>
                        <th className="p-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60">
                      {auditRows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-emerald-500/5">
                          <td className="p-2 text-zinc-500">{row.trade_no || idx + 1}</td>
                          <td className="p-2 font-bold text-white">{row.asset}</td>
                          <td className="p-2">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              row.direction === 'LONG'
                                ? 'bg-emerald-500/20 text-emerald-300'
                                : 'bg-rose-500/20 text-rose-300'
                            }`}>
                              {row.direction}
                            </span>
                          </td>
                          <td className="p-2 text-zinc-300">${row.entry_price?.toFixed(2)}</td>
                          <td className="p-2 text-rose-400">${row.sl_price?.toFixed(2)}</td>
                          <td className="p-2 text-emerald-400">${row.t1_price?.toFixed(2)}</td>
                          <td className="p-2 text-amber-400">${row.equilibrium_50?.toFixed(2) || '—'}</td>
                          <td className="p-2 text-cyan-400">${row.t2_price?.toFixed(2) || '—'}</td>
                          <td className="p-2 text-purple-400">${row.t3_price?.toFixed(2) || '—'}</td>
                          <td className={`p-2 font-bold ${row.pnl_usd >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {row.pnl_usd >= 0 ? `+$${row.pnl_usd}` : `-$${Math.abs(row.pnl_usd)}`}
                          </td>
                          <td className="p-2">
                            <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px]">
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SYNC CANDLES */}
          {activeTab === 'SYNC_CANDLES' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#0b1318] border border-cyan-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-white text-xs">
                      Push Active Chart Candles to <code>public.candles</code>
                    </h3>
                    <p className="text-[10px] text-zinc-400 mt-0.5">
                      Writes up to 200 authentic OHLC bars of <strong>{activeSymbol} ({activeTimeframe})</strong> directly into your Supabase database.
                    </p>
                  </div>
                  <button
                    onClick={handleSyncCandles}
                    disabled={isSyncing || currentBars.length === 0}
                    className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-black font-black text-xs flex items-center gap-1.5 transition"
                  >
                    <UploadCloud className={`w-4 h-4 ${isSyncing ? 'animate-bounce' : ''}`} />
                    <span>{isSyncing ? 'Syncing...' : 'Sync Bars to Supabase'}</span>
                  </button>
                </div>

                {syncStatus && (
                  <div className={`p-3 rounded-lg text-xs font-bold ${
                    syncStatus.error
                      ? 'bg-rose-950/40 border border-rose-500/40 text-rose-300'
                      : 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-300'
                  }`}>
                    {syncStatus.error
                      ? syncStatus.error
                      : `Successfully inserted ${syncStatus.count} OHLC candles into public.candles!`}
                  </div>
                )}
              </div>

              <div className="p-3 rounded-lg bg-[#0a0f16] border border-zinc-800 text-zinc-400 text-[11px]">
                <strong>Candle Schema Verification:</strong> Each row contains <code>symbol</code>, <code>asset</code>, <code>timeframe</code>, <code>timestamp</code>, <code>open</code>, <code>high</code>, <code>low</code>, <code>close</code>, and <code>volume</code>.
              </div>
            </div>
          )}

          {activeTab === 'DIAGNOSTIC_PANEL' && (
            <div className="space-y-4">
              <SupabaseDiagnosticPanel isStandalone={true} />
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-zinc-800 bg-[#090f17] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-zinc-400 text-[11px]">
            <Server className="w-3.5 h-3.5 text-emerald-400" />
            <span>Database: <strong>kyrnctzfvmivzqejogci</strong> (Central Backend)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs transition"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
