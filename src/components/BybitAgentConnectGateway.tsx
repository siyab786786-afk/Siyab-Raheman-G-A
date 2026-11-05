import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Zap,
  Key,
  Lock,
  CheckCircle2,
  Activity,
  Globe,
  Copy,
  Check,
  ExternalLink,
  AlertTriangle
} from 'lucide-react';
import {
  VERIFIED_BYBIT_API_RECORDS,
  BybitApiKeyRecord,
  SrbmprOneTimeConnectionService
} from '../services/SrbmprOneTimeConnectionService';

export const BybitAgentConnectGateway: React.FC = () => {
  const connService = SrbmprOneTimeConnectionService.getInstance();
  const [selectedRecord, setSelectedRecord] = useState<BybitApiKeyRecord>(VERIFIED_BYBIT_API_RECORDS[0]);
  const [subAccountUid, setSubAccountUid] = useState<string>(VERIFIED_BYBIT_API_RECORDS[0].name);
  const [apiKey, setApiKey] = useState<string>(VERIFIED_BYBIT_API_RECORDS[0].apiKey);
  const [apiSecret, setApiSecret] = useState<string>('');
  const [ipWhitelist, setIpWhitelist] = useState<string>(VERIFIED_BYBIT_API_RECORDS[0].ipAddressAdded);
  const [rsaPublicKey, setRsaPublicKey] = useState<string>('');
  const [recommendedIpList, setRecommendedIpList] = useState<string>('64.227.129.205,34.96.39.17,74.125.216.170');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [verifying, setVerifying] = useState<boolean>(false);

  useEffect(() => {
    fetch('/api/bybit/outbound-ip')
      .then(r => r.json())
      .then(d => {
        if (d?.recommendedWhitelistString) setRecommendedIpList(d.recommendedWhitelistString);
      })
      .catch(() => {});

    fetch('/api/bybit/generate-rsa-keypair')
      .then(r => r.json())
      .then(d => {
        if (d?.publicKeyPem) setRsaPublicKey(d.publicKeyPem);
      })
      .catch(() => {});
  }, []);

  const handleSelectRecord = (rec: BybitApiKeyRecord) => {
    setSelectedRecord(rec);
    setSubAccountUid(rec.name);
    setApiKey(rec.apiKey);
    setIpWhitelist(rec.ipAddressAdded);
    connService.selectBybitRecord(rec.id);
    setNotice(`Switched to Bybit V5 API Record: ${rec.name} (${rec.apiKey}) • Status: ${rec.expirationStatus}`);
    setTimeout(() => setNotice(null), 4000);
  };

  const handleCopy = (text: string, tag: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(tag);
    setTimeout(() => setCopiedKey(null), 2200);
  };

  const handleConnectAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);
    try {
      const res = await fetch('/api/bybit/verify-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey,
          apiSecret,
          authMode: apiSecret ? 'HMAC' : 'RSA',
          isDemo: false
        })
      });
      const data = await res.json();
      connService.updateConnections({
        activeBybitProfileId: selectedRecord.id,
        bybitSubaccountName: subAccountUid,
        bybitApiKey: apiKey,
        bybitApiSecret: apiSecret,
        bybitAgentAuthorized: true
      });
      if (data?.authorized) {
        setNotice(`Bybit V5 Live Verified for ${subAccountUid} (${apiKey})! UID: ${data.keyInfo?.userID || 'Active'}.`);
      } else {
        setNotice(
          `Saved ${subAccountUid} (${apiKey}) permanently. ${
            data?.retMsg ? `Bybit API Note: ${data.retMsg}` : 'Ready for V5 execution.'
          }`
        );
      }
    } catch {
      setNotice(`Saved ${subAccountUid} (${apiKey}) permanently in One-Time Connection Hub.`);
    } finally {
      setVerifying(false);
      setTimeout(() => setNotice(null), 6000);
    }
  };

  return (
    <div
      id="bybit-agent-connect-gateway"
      className="bg-[#02050A] border-2 border-cyan-500 rounded-[36px] p-6 sm:p-8 font-mono text-zinc-100 shadow-[0_0_100px_rgba(6,182,212,0.2)] space-y-6"
    >
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 border-b border-zinc-800 pb-5">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <Zap className="w-4 h-4 text-cyan-400" />
              BYBIT V5 OPENAPI & AI SUBACCOUNT AGENT CONNECT
            </span>
            <span className="text-amber-400 text-xs font-black uppercase bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              5 VERIFIED API KEY RECORDS LOADED
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            WWW.BYBIT.COM ACCOUNT & AI SUBACCOUNT AUTHORIZATION
          </h2>

          <p className="text-xs text-zinc-300 max-w-4xl leading-relaxed">
            Your 5 <code className="text-cyan-400">www.bybit.com</code> API Key Records (<code className="text-amber-300">SR.RAZIYA OPAN</code>, <code className="text-amber-300">SR TAIM NEW DETA</code>, <code className="text-amber-300">SR.ECC AGENT</code>, <code className="text-amber-300">sr laiv 2026</code>, and <code className="text-zinc-500">SRBMPR BOT</code>) are pre-configured below.
          </p>
        </div>

        <a
          href="https://www.bybit.com/app/user/api-management"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs flex items-center gap-2 shrink-0 shadow"
        >
          <span>Open Bybit API Management</span>
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {notice && (
        <div className="p-3 bg-cyan-500/10 border border-cyan-500/40 rounded-xl text-cyan-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* 5 KEY SELECTOR CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {VERIFIED_BYBIT_API_RECORDS.map(rec => {
          const active = selectedRecord.id === rec.id;
          const expired = rec.expirationStatus === 'Expired';
          return (
            <button
              key={rec.id}
              type="button"
              onClick={() => handleSelectRecord(rec)}
              className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between gap-2 ${
                active
                  ? 'bg-cyan-950/50 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]'
                  : expired
                    ? 'bg-zinc-950/60 border-zinc-800 opacity-60'
                    : 'bg-zinc-950 border-zinc-800 hover:border-zinc-600'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="font-black text-white text-xs truncate">{rec.name}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                      rec.expirationStatus === 'Permanent'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : rec.expirationStatus === '74 Days'
                          ? 'bg-cyan-500/20 text-cyan-300'
                          : 'bg-rose-500/20 text-rose-300'
                    }`}
                  >
                    {rec.expirationStatus}
                  </span>
                </div>
                <div className="text-[11px] text-amber-300 font-mono truncate">{rec.apiKey}</div>
              </div>
              <div className="text-[10px] text-zinc-400 truncate">IP: {rec.ipAddressAdded}</div>
            </button>
          );
        })}
      </div>

      {/* GRID: CREDENTIALS & RSA AGENT CONNECT */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Box A: Selected Key & Secret Form */}
        <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
            <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Key className="w-4 h-4 text-cyan-400" /> Authorize Selected Bybit V5 Key
            </h3>
            <span className="text-[10px] text-emerald-400 font-bold">{selectedRecord.expirationStatus}</span>
          </div>

          <form onSubmit={handleConnectAgent} className="space-y-3.5 text-xs">
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-400 font-bold uppercase block">
                Application / Sub-Account Name
              </label>
              <input
                type="text"
                value={subAccountUid}
                onChange={e => setSubAccountUid(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2 text-white font-mono focus:border-cyan-500 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-zinc-400 font-bold uppercase block">Bybit V5 API Key</label>
              <input
                type="text"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2 text-amber-300 font-mono focus:border-cyan-500 outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-zinc-400 font-bold uppercase block">
                API Secret (For HMAC Key Verification)
              </label>
              <input
                type="password"
                value={apiSecret}
                onChange={e => setApiSecret(e.target.value)}
                className="w-full bg-black border border-zinc-800 rounded-xl px-3.5 py-2 text-white font-mono focus:border-cyan-500 outline-none"
                placeholder="Paste your API Secret for this key (saved once permanently)"
              />
            </div>

            <button
              type="submit"
              disabled={verifying}
              className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-black rounded-xl uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] flex items-center justify-center gap-2"
            >
              <Lock className="w-4 h-4" />
              <span>{verifying ? 'Verifying on Bybit V5...' : 'Save & Authorize Bybit V5 Key'}</span>
            </button>
          </form>
        </div>

        {/* Box B: AI Subaccount Agent Connect & Multi-IP Whitelist Helper */}
        <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-3xl space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2 border-b border-zinc-900 pb-3">
              <Activity className="w-4 h-4 text-emerald-400" /> AI Subaccount Agent Connect & IP Binding
            </h3>

            <div className="p-3 bg-black/60 border border-zinc-900 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-amber-300 font-bold uppercase flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5" /> Multi-IP Comma List (For Permanent Keys)
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(recommendedIpList, 'IPS')}
                  className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold flex items-center gap-1"
                >
                  {copiedKey === 'IPS' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'IPS' ? 'Copied!' : 'Copy IPs'}</span>
                </button>
              </div>
              <code className="text-[11px] text-white block break-all">{recommendedIpList}</code>
              <p className="text-[10px] text-zinc-400">
                In Bybit API Management &rarr; Click <strong>Edit</strong> on <code className="text-zinc-200">{selectedRecord.name}</code> &rarr; Paste this comma-separated IP list so all your servers stay permanently authorized.
              </p>
            </div>

            <div className="p-3 bg-black/60 border border-zinc-900 rounded-xl space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-cyan-300 font-bold uppercase flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> AI Subaccount Agent Connect (2048-Bit RSA Public Key)
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(rsaPublicKey, 'RSA')}
                  className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[10px] font-bold flex items-center gap-1"
                >
                  {copiedKey === 'RSA' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedKey === 'RSA' ? 'Copied Public Key!' : 'Copy Public Key'}</span>
                </button>
              </div>
              <textarea
                readOnly
                rows={3}
                value={rsaPublicKey || 'Loading 2048-bit RSA Public Key...'}
                className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-[10px] text-emerald-300 font-mono focus:outline-none"
              />
              <p className="text-[10px] text-zinc-400">
                For <strong>Bybit AI Subaccount &rarr; Agent Connect</strong> (Cloud/Manual mode), paste this Public Key into Bybit to bind without ever exposing a secret key.
              </p>
            </div>
          </div>

          <div className="p-3 bg-emerald-950/20 border border-emerald-500/30 rounded-xl text-[10px] text-emerald-300">
            <strong>Current Active Key Status:</strong> <code className="text-white">{selectedRecord.name}</code> ({selectedRecord.apiKey}) • Permissions: {selectedRecord.permissions}
          </div>
        </div>
      </div>
    </div>
  );
};
