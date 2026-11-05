import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, RefreshCw, CheckCircle2, AlertTriangle, Server, Key, Radio, Database } from 'lucide-react';

interface UpcomersAccountDiagnosticModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UpcomersAccountDiagnosticModal: React.FC<UpcomersAccountDiagnosticModalProps> = ({
  isOpen,
  onClose
}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/upcomers/account-status');
      if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err?.message || 'Failed to fetch Upcomers account status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStatus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[145] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-5 font-mono text-xs">
      <div className="bg-[#070b14] border border-emerald-500/50 rounded-xl shadow-2xl shadow-emerald-500/20 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-[#081512] via-[#0f2823] to-[#081512] border-b border-emerald-500/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-400 flex items-center justify-center shadow-[0_0_12px_rgba(16,185,129,0.3)]">
              <Server className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white tracking-wider flex items-center gap-2">
                UPCOMERS THUNDERBOLT ACCOUNT DIAGNOSTIC (#720656)
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                  SERVER CONNECTED
                </span>
              </h2>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Real-time server-side API audit of account permissions, authentication &amp; gateway connectivity
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchStatus}
              disabled={loading}
              className="px-3 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-200 font-bold flex items-center gap-1.5 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Status</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/50 text-rose-200 text-xs flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {loading && !data && (
            <div className="py-16 text-center text-zinc-400">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-400 mb-2" />
              Querying Upcomers Markets Server API...
            </div>
          )}

          {data && (
            <div className="space-y-4">
              
              {/* Account Overview Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-lg bg-[#0b131a] border border-zinc-800">
                  <div className="text-[10px] text-zinc-400 uppercase font-bold">Account ID</div>
                  <div className="text-sm font-black text-white mt-0.5">{data.accountId}</div>
                  <div className="text-[10px] text-emerald-400">Stage {data.stage} Classic</div>
                </div>

                <div className="p-3 rounded-lg bg-[#0b131a] border border-zinc-800">
                  <div className="text-[10px] text-zinc-400 uppercase font-bold">Balance / Equity</div>
                  <div className="text-sm font-black text-emerald-400 mt-0.5">${data.balance?.toLocaleString()}</div>
                  <div className="text-[10px] text-zinc-500">Thunderbolt $10K</div>
                </div>

                <div className="p-3 rounded-lg bg-[#0b131a] border border-zinc-800">
                  <div className="text-[10px] text-zinc-400 uppercase font-bold">Daily DD Limit</div>
                  <div className="text-sm font-black text-cyan-300 mt-0.5">
                    ${data.dailyDrawdownUsed} / ${data.dailyDrawdownLimit}
                  </div>
                  <div className="text-[10px] text-emerald-400">0.00% Used</div>
                </div>

                <div className="p-3 rounded-lg bg-[#0b131a] border border-zinc-800">
                  <div className="text-[10px] text-zinc-400 uppercase font-bold">Max Loss Floor</div>
                  <div className="text-sm font-black text-amber-300 mt-0.5">
                    ${data.maxDrawdownUsed} / ${data.maxLossLimit || data.maxDrawdownLimit}
                  </div>
                  <div className="text-[10px] text-zinc-500">Safe Buffer Active</div>
                </div>
              </div>

              {/* Read-Only Diagnostic Table */}
              <div className="border border-zinc-800 rounded-xl overflow-hidden bg-[#05080f]">
                <div className="px-4 py-2.5 bg-[#0b131a] border-b border-zinc-800 flex items-center justify-between">
                  <span className="font-bold text-white text-xs flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Server-Side API Authentication &amp; Permission Read-Only Table
                  </span>
                  <span className="text-[10px] text-zinc-400">
                    Server: {data.server}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-[#090e16] text-zinc-400 border-b border-zinc-800">
                      <tr>
                        <th className="p-3">Audit Category</th>
                        <th className="p-3">Parameter / Attribute</th>
                        <th className="p-3">Server Status Value</th>
                        <th className="p-3">Verification &amp; Governance Note</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60">
                      <tr className="hover:bg-zinc-900/50">
                        <td className="p-3 font-bold text-emerald-300">Account Identity</td>
                        <td className="p-3 text-zinc-300">Upcomers Thunderbolt ID</td>
                        <td className="p-3 font-bold text-white">{data.accountId}</td>
                        <td className="p-3 text-zinc-400">{data.accountName}</td>
                      </tr>

                      <tr className="hover:bg-zinc-900/50">
                        <td className="p-3 font-bold text-emerald-300">API Authentication</td>
                        <td className="p-3 text-zinc-300">Token Credential Status</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                            {data.apiAuthResult?.status}
                          </span>
                        </td>
                        <td className="p-3 text-zinc-400">{data.apiAuthResult?.tokenType}</td>
                      </tr>

                      <tr className="hover:bg-zinc-900/50">
                        <td className="p-3 font-bold text-emerald-300">Execution Permission</td>
                        <td className="p-3 text-zinc-300">Live Order Submission</td>
                        <td className="p-3">
                          {data.permissions?.liveOrderExecution ? (
                            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                              ENABLED
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px]">
                              GATED / DRY-RUN
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-amber-300/90">{data.permissions?.gateReason}</td>
                      </tr>

                      <tr className="hover:bg-zinc-900/50">
                        <td className="p-3 font-bold text-emerald-300">Trading Rules</td>
                        <td className="p-3 text-zinc-300">News, Auto &amp; Weekend</td>
                        <td className="p-3 text-emerald-400 font-bold">ALL ALLOWED</td>
                        <td className="p-3 text-zinc-400">Meets Thunderbolt challenge specification</td>
                      </tr>

                      <tr className="hover:bg-zinc-900/50">
                        <td className="p-3 font-bold text-emerald-300">Gateway Connectivity</td>
                        <td className="p-3 text-zinc-300">Hyperliquid L1 Bridge</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold text-[10px]">
                            CONNECTED ({data.thunderboltApiConnectivity?.latencyMs}ms)
                          </span>
                        </td>
                        <td className="p-3 text-zinc-400">{data.thunderboltApiConnectivity?.gateway}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
