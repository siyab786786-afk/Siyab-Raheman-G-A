import React, { useState, useEffect } from 'react';
import { Database, ShieldCheck, AlertTriangle, RefreshCw, CheckCircle2, XCircle, Copy, Check, Terminal } from 'lucide-react';

interface SupabaseDiagnosticPanelProps {
  onClose?: () => void;
  isStandalone?: boolean;
}

export const SupabaseDiagnosticPanel: React.FC<SupabaseDiagnosticPanelProps> = ({
  onClose,
  isStandalone = false
}) => {
  const [envData, setEnvData] = useState<any>(null);
  const [candlesData, setCandlesData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const fetchDiagnosticData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [envRes, candlesRes] = await Promise.allSettled([
        fetch('/api/supabase/env-check'),
        fetch('/api/supabase/candles')
      ]);

      let envJson = null;
      if (envRes.status === 'fulfilled' && envRes.value.ok) {
        envJson = await envRes.value.json();
      } else {
        envJson = { error: 'Failed to fetch /api/supabase/env-check', status: envRes.status };
      }

      let candlesJson = null;
      if (candlesRes.status === 'fulfilled' && candlesRes.value.ok) {
        candlesJson = await candlesRes.value.json();
      } else {
        candlesJson = { error: 'Failed to fetch /api/supabase/candles', status: candlesRes.status };
      }

      setEnvData(envJson);
      setCandlesData(candlesJson);
    } catch (err: any) {
      setError(err?.message || 'Network error fetching diagnostics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiagnosticData();
  }, []);

  const handleCopy = (key: string, data: any) => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopiedSection(key);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const missingVars = envData?.missingRequired || [];
  const hasEnvError = missingVars.length > 0 || !envData?.hasUrl || !envData?.hasAnon;

  return (
    <div className={`bg-[#070b14] border border-cyan-500/40 rounded-xl shadow-2xl overflow-hidden font-mono text-xs ${isStandalone ? 'w-full max-w-5xl mx-auto my-6' : 'fixed inset-4 sm:inset-10 z-[140] flex flex-col'}`}>
      
      {/* Header */}
      <div className="px-5 py-4 bg-gradient-to-r from-[#0c1322] via-[#121c33] to-[#0c1322] border-b border-cyan-500/30 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-cyan-500/20 border border-cyan-400 flex items-center justify-center shadow-[0_0_12px_rgba(6,182,212,0.3)]">
            <Database className="w-5 h-5 text-cyan-300" />
          </div>
          <div>
            <h2 className="text-sm font-black text-white tracking-wider flex items-center gap-2">
              SUPABASE CONNECTION DIAGNOSTIC PANEL
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${hasEnvError ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'}`}>
                {hasEnvError ? 'NOT ACCESSIBLE / MISSING CONFIG' : 'CONNECTED & HEALTHY'}
              </span>
            </h2>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Inspecting <code className="text-cyan-300">/api/supabase/env-check</code> and <code className="text-cyan-300">/api/supabase/candles</code>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchDiagnosticData}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-200 font-bold flex items-center gap-1.5 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-bold transition"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-5 overflow-y-auto flex-1 space-y-4">
        
        {/* Status Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className={`p-3.5 rounded-xl border ${envData?.hasUrl ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-rose-950/20 border-rose-500/30'}`}>
            <div className="text-[10px] uppercase font-bold text-zinc-400">VITE_SUPABASE_URL</div>
            <div className="text-sm font-black text-white mt-1 flex items-center gap-2">
              {envData?.hasUrl ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-rose-400" />}
              <span>{envData?.hasUrl ? 'Configured' : 'Missing or Null'}</span>
            </div>
            <div className="text-[10px] text-zinc-400 truncate mt-1">
              {envData?.supabaseUrl || 'https://kyrnctzfvmivzqejogci.supabase.co'}
            </div>
          </div>

          <div className={`p-3.5 rounded-xl border ${envData?.hasAnon ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-rose-950/20 border-rose-500/30'}`}>
            <div className="text-[10px] uppercase font-bold text-zinc-400">VITE_SUPABASE_ANON_KEY</div>
            <div className="text-sm font-black text-white mt-1 flex items-center gap-2">
              {envData?.hasAnon ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-rose-400" />}
              <span>{envData?.hasAnon ? 'Configured' : 'Missing or Null'}</span>
            </div>
            <div className="text-[10px] text-zinc-400 mt-1">
              {envData?.hasAnon ? 'Present (Anon JWT)' : 'Not detected in process.env'}
            </div>
          </div>

          <div className={`p-3.5 rounded-xl border ${candlesData && Array.isArray(candlesData) && candlesData.length > 0 ? 'bg-emerald-950/20 border-emerald-500/30' : 'bg-amber-950/20 border-amber-500/30'}`}>
            <div className="text-[10px] uppercase font-bold text-zinc-400">Candles Table Status</div>
            <div className="text-sm font-black text-white mt-1 flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" />
              <span>{Array.isArray(candlesData) ? `${candlesData.length} Candles Loaded` : 'Error / Empty'}</span>
            </div>
            <div className="text-[10px] text-zinc-400 mt-1">
              Endpoint: /api/supabase/candles
            </div>
          </div>
        </div>

        {missingVars.length > 0 && (
          <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/50 text-rose-200 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">Missing Required Environment Variables:</strong> {missingVars.join(', ')}.
              <div className="text-[11px] text-rose-300 mt-0.5">
                Ensure these are defined in your environment / <code className="text-white">.env</code> file so Supabase client requests do not fail or return 'Not Accessible'.
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-500/50 text-rose-200 text-xs">
            <strong>Diagnostic Error:</strong> {error}
          </div>
        )}

        {/* Raw JSON Responses */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          
          {/* Env Check JSON */}
          <div className="border border-zinc-800 rounded-xl overflow-hidden bg-[#05080f] flex flex-col">
            <div className="px-4 py-2.5 bg-[#0c1322] border-b border-zinc-800 flex items-center justify-between">
              <span className="font-bold text-cyan-300 text-xs flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5" />
                GET /api/supabase/env-check
              </span>
              <button
                onClick={() => handleCopy('env', envData)}
                className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-bold flex items-center gap-1 transition"
              >
                {copiedSection === 'env' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedSection === 'env' ? 'Copied' : 'Copy JSON'}</span>
              </button>
            </div>
            <pre className="p-4 text-[11px] text-emerald-300 overflow-x-auto max-h-[320px] flex-1">
              <code>{JSON.stringify(envData, null, 2)}</code>
            </pre>
          </div>

          {/* Candles JSON */}
          <div className="border border-zinc-800 rounded-xl overflow-hidden bg-[#05080f] flex flex-col">
            <div className="px-4 py-2.5 bg-[#0c1322] border-b border-zinc-800 flex items-center justify-between">
              <span className="font-bold text-cyan-300 text-xs flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5" />
                GET /api/supabase/candles
              </span>
              <button
                onClick={() => handleCopy('candles', candlesData)}
                className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-bold flex items-center gap-1 transition"
              >
                {copiedSection === 'candles' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{copiedSection === 'candles' ? 'Copied' : 'Copy JSON'}</span>
              </button>
            </div>
            <pre className="p-4 text-[11px] text-amber-200 overflow-x-auto max-h-[320px] flex-1">
              <code>{JSON.stringify(candlesData, null, 2)}</code>
            </pre>
          </div>

        </div>

      </div>
    </div>
  );
};
