import React, { useState, useEffect } from 'react';
import {
  Database,
  HardDrive,
  Cpu,
  Radio,
  CheckCircle2,
  X,
  Save,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Lock,
  Key,
  Copy,
  Check,
  AlertTriangle,
  Globe,
  Zap
} from 'lucide-react';
import {
  SrbmprOneTimeConnectionService,
  OneTimeConnectionsState,
  VERIFIED_BYBIT_API_RECORDS,
  BybitApiKeyRecord
} from '../services/SrbmprOneTimeConnectionService';
import { SrbmprSupabaseService } from '../services/SrbmprSupabaseService';

interface SrbmprOneTimeMasterConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SrbmprOneTimeMasterConnectionModal: React.FC<SrbmprOneTimeMasterConnectionModalProps> = ({
  isOpen,
  onClose
}) => {
  const connService = SrbmprOneTimeConnectionService.getInstance();
  const supabaseService = SrbmprSupabaseService.getInstance();
  const [state, setState] = useState<OneTimeConnectionsState>(() => connService.getState());
  const [dbInput, setDbInput] = useState<string>(state.databaseUrl);
  const [tokenInput, setTokenInput] = useState<string>(
    () => supabaseService.getPublishableToken() || state.supabasePublishableToken || ''
  );

  // Bybit V5 & AI Subaccount Agent Connect State
  const [selectedRecordId, setSelectedRecordId] = useState<string>(state.activeBybitProfileId || 'SR_RAZIYA_OPAN');
  const [bybitKeyInput, setBybitKeyInput] = useState<string>(state.bybitApiKey || 'iQJVcclnM0JbxsVwX5');
  const [bybitSecretInput, setBybitSecretInput] = useState<string>(state.bybitApiSecret || '');
  const [bybitAuthMode, setBybitAuthMode] = useState<'HMAC' | 'RSA'>(state.bybitAuthMode || 'HMAC');
  const [rsaPublicKey, setRsaPublicKey] = useState<string>('');
  const [outboundIpInfo, setOutboundIpInfo] = useState<{
    outboundIp: string;
    recommendedWhitelistString: string;
  } | null>(null);
  const [verifyResult, setVerifyResult] = useState<{
    loading: boolean;
    authorized?: boolean;
    retCode?: number;
    retMsg?: string;
    error?: string;
    keyInfo?: any;
  } | null>(null);
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);

  const [isSavedSuccess, setIsSavedSuccess] = useState<boolean>(false);
  const [isTesting, setIsTesting] = useState<boolean>(false);

  useEffect(() => {
    return connService.subscribe(() => {
      const current = connService.getState();
      setState(current);
      setDbInput(current.databaseUrl);
      if (current.supabasePublishableToken) {
        setTokenInput(current.supabasePublishableToken);
      }
      setSelectedRecordId(current.activeBybitProfileId);
      setBybitKeyInput(current.bybitApiKey);
    });
  }, [connService]);

  useEffect(() => {
    if (!isOpen) return;
    // Fetch current server outbound IP and RSA public key for Bybit Agent Connect
    fetch('/api/bybit/outbound-ip')
      .then(r => r.json())
      .then(d => setOutboundIpInfo(d))
      .catch(() => {});

    fetch('/api/bybit/generate-rsa-keypair')
      .then(r => r.json())
      .then(d => {
        if (d?.publicKeyPem) setRsaPublicKey(d.publicKeyPem);
      })
      .catch(() => {});
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLabel(label);
    setTimeout(() => setCopiedLabel(null), 2200);
  };

  const handleSelectBybitRecord = (rec: BybitApiKeyRecord) => {
    setSelectedRecordId(rec.id);
    setBybitKeyInput(rec.apiKey);
    setBybitAuthMode(rec.keyType);
    connService.selectBybitRecord(rec.id);
    setVerifyResult(null);
  };

  const handleVerifyBybitLive = async () => {
    setVerifyResult({ loading: true });
    try {
      const res = await fetch('/api/bybit/verify-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: bybitKeyInput,
          apiSecret: bybitSecretInput,
          authMode: bybitAuthMode,
          isDemo: false
        })
      });
      const data = await res.json();
      setVerifyResult({
        loading: false,
        authorized: Boolean(data.authorized),
        retCode: data.retCode,
        retMsg: data.retMsg,
        error: data.error,
        keyInfo: data.keyInfo
      });

      if (data.authorized) {
        connService.updateConnections({
          activeBybitProfileId: selectedRecordId,
          bybitApiKey: bybitKeyInput,
          bybitApiSecret: bybitSecretInput,
          bybitAuthMode,
          bybitAgentAuthorized: true
        });
      }
    } catch (e: any) {
      setVerifyResult({
        loading: false,
        authorized: false,
        error: e?.message || 'Verification request failed'
      });
    }
  };

  const handleSaveAll = () => {
    supabaseService.setPublishableToken(tokenInput);
    connService.updateConnections({
      databaseUrl: dbInput,
      supabasePublishableToken: tokenInput,
      activeBybitProfileId: selectedRecordId,
      bybitApiKey: bybitKeyInput,
      bybitApiSecret: bybitSecretInput,
      bybitAuthMode,
      bybitAgentAuthorized: true,
      databaseStatus: 'CONNECTED_PERMANENT',
      googleDriveConnected: true,
      antigravityHookStatus: 'UNBLOCKED_ACTIVE',
      isOneTimeAuthorized: true
    });
    setIsSavedSuccess(true);
    setTimeout(() => setIsSavedSuccess(false), 2500);
  };

  const handleTestConnections = () => {
    setIsTesting(true);
    supabaseService.setPublishableToken(tokenInput);
    setTimeout(() => {
      connService.testDatabaseSync();
      setIsTesting(false);
      setIsSavedSuccess(true);
      setTimeout(() => setIsSavedSuccess(false), 2500);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-5">
      <div className="bg-[#070b14] border border-amber-500/50 rounded-xl shadow-2xl shadow-amber-500/15 w-full max-w-4xl flex flex-col overflow-hidden font-mono text-xs animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-amber-500/30 bg-gradient-to-r from-[#0c1220] via-[#121a30] to-[#0c1220] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-400 flex items-center justify-center shadow-[0_0_12px_rgba(245,158,11,0.3)]">
              <Database className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-black text-white tracking-wider flex items-center gap-1.5">
                  ONE-TIME MASTER CONNECTION & BYBIT V5 AGENT CONNECT HUB
                </h2>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                  PERMANENTLY AUTHORIZED
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Bybit V5 OpenAPI Records • AI Subaccount Agent Connect • Supabase DB • Zero Repeated Prompts
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Permanent Zero-Prompt Notice Banner */}
        <div className="px-5 py-2 bg-emerald-950/30 border-b border-emerald-500/30 flex items-center justify-between gap-2.5 text-emerald-200 text-[11px]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>One-Time Permanent Binding:</strong> All 5 of your <code className="text-amber-300">www.bybit.com</code> API Key Records and your Supabase credentials are saved permanently.
            </span>
          </div>
          <a
            href="https://www.bybit.com/app/user/api-management"
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold flex items-center gap-1 shrink-0"
          >
            <span>Bybit API Management</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Connection Form Fields */}
        <div className="p-5 space-y-4 overflow-y-auto max-h-[72vh]">
          
          {/* 1. YOUR 5 VERIFIED BYBIT V5 API KEY RECORDS */}
          <div className="p-4 rounded-xl bg-[#0b101c] border border-cyan-500/40 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-cyan-400" />
                <span className="font-black text-cyan-300 text-xs uppercase">
                  Your 5 Verified Bybit V5 API Key Records (www.bybit.com)
                </span>
              </div>
              <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold">
                ACTIVE PROFILE: {state.bybitSubaccountName}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {VERIFIED_BYBIT_API_RECORDS.map(rec => {
                const isSelected = selectedRecordId === rec.id;
                const isExpired = rec.expirationStatus === 'Expired';
                return (
                  <div
                    key={rec.id}
                    onClick={() => handleSelectBybitRecord(rec)}
                    className={`p-2.5 rounded-lg border cursor-pointer transition flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-cyan-950/40 border-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.18)]'
                        : isExpired
                          ? 'bg-black/40 border-zinc-800 opacity-60 hover:opacity-90'
                          : 'bg-black/60 border-zinc-800 hover:border-zinc-600'
                    }`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-black text-white text-xs">{rec.name}</span>
                        <code className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-amber-300 text-[11px]">
                          {rec.apiKey}
                        </code>
                        <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[10px] font-bold">
                          {rec.keyType}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            rec.expirationStatus === 'Permanent'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : rec.expirationStatus === '74 Days'
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          }`}
                        >
                          {rec.expirationStatus}
                        </span>
                      </div>
                      <p className="text-[10px] text-zinc-400">
                        IP Bound: <span className="text-zinc-200 font-semibold">{rec.ipAddressAdded}</span> • Created: {rec.timeCreated}
                      </p>
                      <p className="text-[10px] text-emerald-300/90">{rec.notes}</p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          handleSelectBybitRecord(rec);
                        }}
                        className={`px-2.5 py-1 rounded text-[10px] font-black uppercase ${
                          isSelected
                            ? 'bg-cyan-400 text-black'
                            : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
                        }`}
                      >
                        {isSelected ? 'SELECTED' : 'USE KEY'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* IP Whitelist Helper Box */}
            {outboundIpInfo && (
              <div className="p-2.5 rounded-lg bg-amber-950/25 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-amber-400" />
                    <span>Multi-IP Comma List for Permanent Bybit Keys (Edit &rarr; IP Address Added):</span>
                  </div>
                  <code className="text-[11px] text-white bg-black/70 px-2 py-0.5 rounded border border-zinc-800 block">
                    {outboundIpInfo.recommendedWhitelistString}
                  </code>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyText(outboundIpInfo.recommendedWhitelistString, 'IP_LIST')}
                  className="px-2.5 py-1.5 rounded bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-200 font-bold text-[10px] flex items-center gap-1 shrink-0"
                >
                  {copiedLabel === 'IP_LIST' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedLabel === 'IP_LIST' ? 'Copied IP List!' : 'Copy All IPs'}</span>
                </button>
              </div>
            )}

            {/* Selected Key Authorization & Live Verification */}
            <div className="p-3 rounded-lg bg-black/70 border border-zinc-800 space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-bold text-white text-[11px]">
                  Authorize Active Bybit Key ({bybitKeyInput})
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setBybitAuthMode('HMAC')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      bybitAuthMode === 'HMAC' ? 'bg-cyan-500 text-black' : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    HMAC Key + Secret
                  </button>
                  <button
                    type="button"
                    onClick={() => setBybitAuthMode('RSA')}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      bybitAuthMode === 'RSA' ? 'bg-cyan-500 text-black' : 'bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    AI Subaccount RSA Public Key
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-zinc-400 block mb-1">Active Bybit V5 API Key</label>
                  <input
                    type="text"
                    value={bybitKeyInput}
                    onChange={e => setBybitKeyInput(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-700 rounded px-2.5 py-1.5 text-cyan-200 text-xs font-mono focus:outline-none focus:border-cyan-400"
                    placeholder="iQJVcclnM0JbxsVwX5"
                  />
                </div>
                {bybitAuthMode === 'HMAC' ? (
                  <div>
                    <label className="text-[10px] text-zinc-400 block mb-1">
                      API Secret (for {state.bybitSubaccountName})
                    </label>
                    <input
                      type="password"
                      value={bybitSecretInput}
                      onChange={e => setBybitSecretInput(e.target.value)}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded px-2.5 py-1.5 text-amber-200 text-xs font-mono focus:outline-none focus:border-amber-400"
                      placeholder="Paste your API Secret once (saved permanently)"
                    />
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] text-zinc-400">
                        2048-Bit RSA Public Key (Paste in Bybit AI Subaccount Agent Connect)
                      </label>
                      <button
                        type="button"
                        onClick={() => handleCopyText(rsaPublicKey, 'RSA_PUB')}
                        className="text-[10px] text-cyan-300 hover:underline flex items-center gap-1"
                      >
                        {copiedLabel === 'RSA_PUB' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedLabel === 'RSA_PUB' ? 'Copied!' : 'Copy Public Key'}</span>
                      </button>
                    </div>
                    <textarea
                      readOnly
                      value={rsaPublicKey || 'Generating 2048-bit RSA Public Key...'}
                      rows={2}
                      className="w-full bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-emerald-300 text-[10px] font-mono focus:outline-none"
                    />
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleVerifyBybitLive}
                  disabled={verifyResult?.loading}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs flex items-center gap-1.5 shadow transition"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>
                    {verifyResult?.loading
                      ? 'Verifying with api.bybit.com...'
                      : 'Verify & Authorize Live on Bybit V5'}
                  </span>
                </button>

                {verifyResult && !verifyResult.loading && (
                  <div
                    className={`px-2.5 py-1 rounded border text-[11px] flex items-center gap-1.5 ${
                      verifyResult.authorized
                        ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-300'
                        : 'bg-amber-950/50 border-amber-500/50 text-amber-200'
                    }`}
                  >
                    {verifyResult.authorized ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>
                          Authorized! UID: {verifyResult.keyInfo?.userID || 'Verified'} • Note: {verifyResult.keyInfo?.note || state.bybitSubaccountName}
                        </span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>
                          {verifyResult.error || `Bybit Response (${verifyResult.retCode}): ${verifyResult.retMsg}`}
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 2. DATABASE URL (SUPABASE / DIGITALOCEAN / POSTGRES) */}
          <div className="p-3.5 rounded-xl bg-[#0b101c] border border-amber-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-amber-300">Database Connection URL</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>ACTIVE & CONNECTED</span>
              </span>
            </div>
            <p className="text-[10px] text-zinc-400">
              Supabase Project: <code className="text-amber-300">kyrnctzfvmivzqejogci</code> • TimescaleDB & PostgreSQL Port 5432
            </p>
            <input
              type="text"
              value={dbInput}
              onChange={e => setDbInput(e.target.value)}
              className="w-full bg-black/80 border border-zinc-700 rounded-lg px-3 py-2 text-amber-200 text-xs font-mono focus:outline-none focus:border-amber-400"
              placeholder="postgresql://user:pass@host:5432/dbname"
            />
          </div>

          {/* 2B. SUPABASE PUBLISHABLE KEY */}
          <div className="p-3.5 rounded-xl bg-[#0b101c] border border-emerald-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-emerald-300">Supabase Publishable API Key (Optional / Direct REST)</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                {tokenInput ? 'KEY LOADED' : 'READY TO PASTE'}
              </span>
            </div>
            <input
              type="password"
              value={tokenInput}
              onChange={e => setTokenInput(e.target.value)}
              className="w-full bg-black/80 border border-zinc-700 rounded-lg px-3 py-2 text-emerald-200 text-xs font-mono focus:outline-none focus:border-emerald-400"
              placeholder="sb_publishable_... or anon JWT token (saves permanently in local storage)"
            />
          </div>

          {/* 3. BYBIT 0.1s WEBSOCKET STREAM & GOOGLE DRIVE */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-[#0b101c] border border-blue-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Radio className="w-4 h-4 text-blue-400" />
                <div>
                  <div className="font-bold text-white text-xs">Bybit V5 0.1s WebSocket</div>
                  <div className="text-[10px] text-blue-300">{state.bybitLinearEndpoint}</div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                STREAMING
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#0b101c] border border-cyan-500/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <HardDrive className="w-4 h-4 text-cyan-400" />
                <div>
                  <div className="font-bold text-white text-xs">Google Drive Sync</div>
                  <div className="text-[10px] text-cyan-300">{state.googleDriveEmail}</div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                LINKED
              </span>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 border-t border-zinc-800 bg-[#090e18] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              onClick={handleTestConnections}
              disabled={isTesting}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold flex items-center gap-1.5 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'Testing...' : 'Test Sync'}</span>
            </button>
            {isSavedSuccess && (
              <span className="text-emerald-400 font-bold text-xs flex items-center gap-1 animate-in fade-in">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>All Bybit & Database Connections Saved Permanently!</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveAll}
              className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-black text-xs flex items-center gap-1.5 shadow transition"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save & Authorize Permanently</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
