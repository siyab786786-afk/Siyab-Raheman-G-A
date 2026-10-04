import React, { useState } from 'react';
import { 
  Bot, Shield, Cpu, Database, CheckCircle, AlertCircle, RefreshCw,
  Mail, Globe, Share2, FileText, Lock, Eye, Key, Check, X,
  Radio, Server, ShieldCheck, AlertTriangle, ExternalLink, HardDrive,
  UserCheck, Layers, Terminal, Sparkles
} from 'lucide-react';

interface SraiOperationsAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AssetItem {
  name: string;
  category: 'CLOUD' | 'EXCHANGE' | 'APP' | 'DATABASE' | 'SOCIAL' | 'RESEARCH';
  platform: string;
  status: 'ONLINE' | 'CONNECTED' | 'READY' | 'RESTRICTED' | 'DRAFT';
  accessScope: string;
  nextAction: string;
  riskStatus: 'SECURE' | 'AUDITED' | 'READ_ONLY';
}

interface ApprovalRequest {
  id: string;
  title: string;
  platform: string;
  category: string;
  timestamp: string;
  details: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export const SraiOperationsAgentModal: React.FC<SraiOperationsAgentModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'INVENTORY' | 'GMAIL' | 'SECURITY' | 'LIVE' | 'DATABASE'>('INVENTORY');

  const [approvals, setApprovals] = useState<ApprovalRequest[]>([
    {
      id: 'APP-001',
      title: 'Draft Research Note: Zero-to-Zero Cycle & 1:1→1:2→1:3 Progression',
      platform: 'LinkedIn Article Queue',
      category: 'Publishing',
      timestamp: 'Today, 03:15 UTC',
      details: 'Article draft prepared for review. Zero claims of financial guarantees; rigorous focus on deterministic raw OHLC and 1:1, 1:2, 1:3 sequential pipe validation.',
      status: 'PENDING',
    },
    {
      id: 'APP-002',
      title: 'YouTube Live Stream Public Overlay Preparation',
      platform: 'YouTube Live',
      category: 'Live Broadcast',
      timestamp: 'Today, 02:40 UTC',
      details: 'Browser overlay configuration verified: Pure Bybit Mainnet V5 isolated container stream with read-only market data and multilingual chatbot.',
      status: 'PENDING',
    },
    {
      id: 'APP-003',
      title: 'Parquet Database Snapshot Backup to Immutable Cold Storage',
      platform: 'DigitalOcean TimescaleDB',
      category: 'Data Integrity',
      timestamp: 'Today, 01:00 UTC',
      details: 'Compressed Parquet archive containing 116,726 BTC candles and 3,157 validated events ready for hash verification and encrypted offsite replication.',
      status: 'PENDING',
    },
  ]);

  if (!isOpen) return null;

  const handleApprove = (id: string) => {
    setApprovals(prev => prev.map(item => item.id === id ? { ...item, status: 'APPROVED' } : item));
  };

  const handleReject = (id: string) => {
    setApprovals(prev => prev.map(item => item.id === id ? { ...item, status: 'REJECTED' } : item));
  };

  const assetInventory: AssetItem[] = [
    {
      name: 'SRBMPR Terminal & Vault',
      category: 'APP',
      platform: 'Google AI Studio / Web Container',
      status: 'ONLINE',
      accessScope: 'View-Only Public / High-Low Horizon / 1:1→1:3 State Machine',
      nextAction: 'Sync live price coordinates with DigitalOcean backend',
      riskStatus: 'SECURE',
    },
    {
      name: 'Primary Ubuntu VPS & TimescaleDB',
      category: 'CLOUD',
      platform: 'DigitalOcean (FRA1 / BLR1)',
      status: 'ONLINE',
      accessScope: '24/7 Headless WebSocket Recorder / Redis Streams / Parquet Cold Storage',
      nextAction: 'Automated 10-minute snapshot & hash audit',
      riskStatus: 'SECURE',
    },
    {
      name: 'Bybit V5 Mainnet Connection',
      category: 'EXCHANGE',
      platform: 'Bybit Linear V5',
      status: 'CONNECTED',
      accessScope: 'Strictly Read-Only (IP Allowlisted to VPS IP; Withdrawals HARD DISABLED)',
      nextAction: 'Verify perpetual funding rate and orderbook depth latency',
      riskStatus: 'READ_ONLY',
    },
    {
      name: 'Binance USDT-M Futures Connection',
      category: 'EXCHANGE',
      platform: 'Binance Derivatives API',
      status: 'CONNECTED',
      accessScope: 'Strictly Read-Only (Isolated schema; Zero mixing with Bybit data)',
      nextAction: 'Verify kline timestamp alignment against exchange server time',
      riskStatus: 'READ_ONLY',
    },
    {
      name: 'Firebase Security & Auth Project',
      category: 'DATABASE',
      platform: 'Google Cloud / Firebase',
      status: 'READY',
      accessScope: 'Firestore Security Rules enforced; RBAC role separation',
      nextAction: 'Deploy verified Firestore audit rules',
      riskStatus: 'AUDITED',
    },
    {
      name: 'Zero-to-Zero Cycle & Gap Audit Papers',
      category: 'RESEARCH',
      platform: 'SRBMPR Research Archive (PDF/LaTeX)',
      status: 'READY',
      accessScope: '16-Page Independent Audit, 718 Verified Events, 17 Validation Tests',
      nextAction: 'Publish executive summary on public LinkedIn research portfolio',
      riskStatus: 'AUDITED',
    },
    {
      name: 'Live Stream Broadcast Channels',
      category: 'SOCIAL',
      platform: 'YouTube Live / TikTok LIVE / Instagram Live / LinkedIn Live',
      status: 'RESTRICTED',
      accessScope: 'Read-only visual overlay feed only; Zero trading signal / execution commands',
      nextAction: 'Founder manual authorization required before stream start',
      riskStatus: 'SECURE',
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-[#090b0e] border border-zinc-800 rounded-3xl w-full max-w-5xl overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.9)] flex flex-col max-h-[92vh]">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800/80 bg-zinc-950/70">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
              <Bot className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-base font-black font-mono text-white tracking-widest uppercase">
                  SRAI OPERATIONS AGENT & COMMAND CENTER
                </h3>
                <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-mono font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                  SYSTEM GUARDIAN ACTIVE
                </span>
              </div>
              <p className="text-xs text-zinc-400 font-mono mt-0.5">
                Private Asset Inventory • Permission-Based OAuth Gateway • Zero-Password Governance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-zinc-900/80 rounded-xl border border-zinc-800 text-[11px] font-mono text-zinc-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Siyab Raheman Approval Lock: <strong className="text-white">ENFORCED</strong></span>
            </div>
            <button 
              onClick={onClose}
              className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-xl font-mono text-xs font-bold transition-all border border-zinc-800"
            >
              ✕ Close Console
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-zinc-800/60 bg-zinc-950/30 overflow-x-auto scrollbar-none font-mono text-xs">
          <button
            onClick={() => setActiveTab('INVENTORY')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-bold transition-all whitespace-nowrap ${
              activeTab === 'INVENTORY'
                ? 'bg-zinc-900 text-amber-400 border-t-2 border-amber-500 border-x border-zinc-800'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" /> Asset Inventory ({assetInventory.length})
          </button>

          <button
            onClick={() => setActiveTab('GMAIL')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-bold transition-all whitespace-nowrap ${
              activeTab === 'GMAIL'
                ? 'bg-zinc-900 text-amber-400 border-t-2 border-amber-500 border-x border-zinc-800'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Mail className="w-3.5 h-3.5" /> Gmail & Communications Hub
          </button>

          <button
            onClick={() => setActiveTab('SECURITY')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-bold transition-all whitespace-nowrap relative ${
              activeTab === 'SECURITY'
                ? 'bg-zinc-900 text-amber-400 border-t-2 border-amber-500 border-x border-zinc-800'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" /> Approval Queue & Security
            {approvals.filter(a => a.status === 'PENDING').length > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('LIVE')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-bold transition-all whitespace-nowrap ${
              activeTab === 'LIVE'
                ? 'bg-zinc-900 text-amber-400 border-t-2 border-amber-500 border-x border-zinc-800'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5" /> Social & Live Stream Registry
          </button>

          <button
            onClick={() => setActiveTab('DATABASE')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl font-bold transition-all whitespace-nowrap ${
              activeTab === 'DATABASE'
                ? 'bg-zinc-900 text-amber-400 border-t-2 border-amber-500 border-x border-zinc-800'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Server className="w-3.5 h-3.5" /> 24/7 Autonomous Architecture
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6 font-mono text-xs">
          
          {/* TAB 1: ASSET INVENTORY */}
          {activeTab === 'INVENTORY' && (
            <div className="space-y-5">
              <div className="bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Database className="w-4 h-4 text-amber-400" />
                    Autonomous SRBMPR Asset Classification Map
                  </h4>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    Permission-based discovery mapping websites, cloud nodes, Bybit/Binance read-only channels, and scientific publications.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-xl border border-emerald-500/20 font-bold">
                    Audit Status: 100% Verified
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {assetInventory.map((asset, idx) => (
                  <div key={idx} className="bg-zinc-900/40 hover:bg-zinc-900/80 border border-zinc-800/70 rounded-2xl p-4 transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl text-xs font-bold ${
                          asset.category === 'CLOUD' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                          asset.category === 'EXCHANGE' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                          asset.category === 'APP' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                          asset.category === 'DATABASE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          asset.category === 'SOCIAL' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                          'bg-zinc-800 text-zinc-300'
                        }`}>
                          {asset.category}
                        </div>
                        <div>
                          <h5 className="text-white font-bold text-sm">{asset.name}</h5>
                          <span className="text-[10px] text-zinc-400">{asset.platform}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg text-[10px] font-bold flex items-center gap-1.5">
                          <CheckCircle className="w-3 h-3" /> {asset.status}
                        </span>
                        <span className="px-2 py-0.5 bg-zinc-800 text-zinc-400 rounded text-[9px] font-bold">
                          {asset.riskStatus}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-zinc-800/60 grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
                      <div>
                        <span className="text-zinc-500 text-[10px] uppercase block">Permitted Scope:</span>
                        <span className="text-zinc-300 font-medium">{asset.accessScope}</span>
                      </div>
                      <div>
                        <span className="text-zinc-500 text-[10px] uppercase block">Scheduled Guard Action:</span>
                        <span className="text-amber-400/90 font-medium">{asset.nextAction}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: GMAIL & COMMUNICATIONS HUB */}
          {activeTab === 'GMAIL' && (
            <div className="space-y-5">
              <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-amber-300 uppercase">Strict Permission-Based OAuth Protocol (Zero Password Policy)</h4>
                  <p className="text-[11px] text-zinc-300 leading-relaxed mt-1">
                    The agent connects strictly via Google OAuth limited token scopes. SRAI will <strong>NEVER</strong> ask for, view, or store your Gmail password, OTPs, or recovery codes. All emails drafted remain in your Drafts folder until you personally hit "Send".
                  </p>
                </div>
              </div>

              {/* Scope Governance Matrix */}
              <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-4">
                <h4 className="text-white font-bold text-xs uppercase tracking-wider">OAuth Scope Governance Matrix</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800/80 flex items-center justify-between">
                    <div>
                      <div className="text-white font-bold">Read Gmail Metadata</div>
                      <div className="text-[10px] text-zinc-500">Scan sender, subject, date & labels</div>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded text-[10px] font-bold">
                      PERMITTED
                    </span>
                  </div>

                  <div className="p-3.5 bg-zinc-950 rounded-xl border border-zinc-800/80 flex items-center justify-between">
                    <div>
                      <div className="text-white font-bold">Create Email Drafts</div>
                      <div className="text-[10px] text-zinc-500">Draft replies for Siyab's review</div>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded text-[10px] font-bold">
                      PERMITTED
                    </span>
                  </div>

                  <div className="p-3.5 bg-zinc-950 rounded-xl border border-rose-500/20 flex items-center justify-between">
                    <div>
                      <div className="text-white font-bold">Direct Email Dispatch</div>
                      <div className="text-[10px] text-zinc-500">Send message without user approval</div>
                    </div>
                    <span className="px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded text-[10px] font-bold">
                      HARD BLOCKED
                    </span>
                  </div>

                  <div className="p-3.5 bg-zinc-950 rounded-xl border border-rose-500/20 flex items-center justify-between">
                    <div>
                      <div className="text-white font-bold">Password & Recovery Codes</div>
                      <div className="text-[10px] text-zinc-500">View or mutate security credentials</div>
                    </div>
                    <span className="px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/30 rounded text-[10px] font-bold">
                      HARD BLOCKED
                    </span>
                  </div>
                </div>
              </div>

              {/* Classified Inbox Signals */}
              <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 space-y-3">
                <h4 className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-400" />
                  Classified Verified Inbox Signals
                </h4>
                <div className="space-y-2">
                  <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center justify-between">
                    <div>
                      <div className="text-white font-bold">DigitalOcean Cloud Infrastructure</div>
                      <div className="text-[10px] text-zinc-400">Account verified, active droplet & database billing alert normal.</div>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-bold">CLASSIFIED</span>
                  </div>

                  <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center justify-between">
                    <div>
                      <div className="text-white font-bold">Bybit API Security Notice (IP Whitelisting)</div>
                      <div className="text-[10px] text-zinc-400">IP binding verified to VPS static IP. Read-only market data enabled.</div>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-bold">CLASSIFIED</span>
                  </div>

                  <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center justify-between">
                    <div>
                      <div className="text-white font-bold">Firebase Studio & Authentication Rules</div>
                      <div className="text-[10px] text-zinc-400">Project applet config updated with strict RBAC rules.</div>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-bold">CLASSIFIED</span>
                  </div>

                  <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center justify-between">
                    <div>
                      <div className="text-white font-bold">TikTok Collaboration Research Draft</div>
                      <div className="text-[10px] text-zinc-400">Preserved in Asset Inventory with reference to srbmpr.ai.studio.</div>
                    </div>
                    <span className="text-[10px] text-amber-400 font-bold">DRAFT READY</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: APPROVAL QUEUE & SECURITY */}
          {activeTab === 'SECURITY' && (
            <div className="space-y-5">
              <div className="bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800 flex items-center justify-between">
                <div>
                  <h4 className="text-white font-bold text-sm uppercase">Founder One-Click Action Authorization Queue</h4>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    No publishing, live stream launch, or database replication occurs without Siyab Raheman's explicit sign-off.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-zinc-500 uppercase block">Pending Actions</span>
                  <span className="text-lg font-bold text-amber-400">
                    {approvals.filter(a => a.status === 'PENDING').length}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {approvals.map((req) => (
                  <div key={req.id} className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-4 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded text-[10px] font-bold">
                          {req.id}
                        </span>
                        <h5 className="text-white font-bold text-sm">{req.title}</h5>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-zinc-500">{req.timestamp}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          req.status === 'PENDING' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
                          req.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                          'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}>
                          {req.status}
                        </span>
                      </div>
                    </div>

                    <p className="text-zinc-400 text-xs leading-relaxed bg-zinc-950 p-3 rounded-xl border border-zinc-800/60">
                      {req.details}
                    </p>

                    {req.status === 'PENDING' ? (
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          onClick={() => handleReject(req.id)}
                          className="px-4 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                        >
                          <X className="w-3.5 h-3.5" /> Reject Action
                        </button>
                        <button
                          onClick={() => handleApprove(req.id)}
                          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                        >
                          <Check className="w-3.5 h-3.5" /> Approve Action
                        </button>
                      </div>
                    ) : (
                      <div className="text-[11px] text-zinc-500 italic text-right">
                        Resolution logged in immutable audit trail.
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: SOCIAL & LIVE STREAM REGISTRY */}
          {activeTab === 'LIVE' && (
            <div className="space-y-5">
              <div className="bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800 space-y-1">
                <h4 className="text-white font-bold text-sm uppercase flex items-center gap-2">
                  <Radio className="w-4 h-4 text-rose-500 animate-pulse" />
                  Universal Broadcast Stream Output Layer
                </h4>
                <p className="text-[11px] text-zinc-400">
                  Dual broker-labeled overlays: BYBIT_ONLY and BINANCE_ONLY. Viewers inspect pristine live market states with multilingual explanation bot (Hindi, English, Arabic, Urdu, Kannada, Malayalam).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-bold text-xs uppercase">YouTube Live Broadcast</span>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30 font-bold">
                      READY TO BROADCAST
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-400 space-y-1 bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                    <div>Format: 1080p60 Web-RTC / RTMP Stream</div>
                    <div>Source: BYBIT_SRBMPR Container Only (No cross-mixing)</div>
                    <div>Chatbot: Multilingual SR-Jarvis Public Assistant Enabled</div>
                  </div>
                </div>

                <div className="bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-bold text-xs uppercase">TikTok LIVE Studio</span>
                    <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/30 font-bold">
                      DRAFT / READY
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-400 space-y-1 bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                    <div>Format: 9:16 Vertical Live Layout with QR to SRBMPR Web</div>
                    <div>Overlay: High/Low Behaviour & 1:1→1:3 Horizon Sequence</div>
                    <div>Audience Mode: Strictly Educational & Observational</div>
                  </div>
                </div>

                <div className="bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-bold text-xs uppercase">LinkedIn Live Research Stream</span>
                    <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/30 font-bold">
                      ACADEMIC / RESEARCH
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-400 space-y-1 bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                    <div>Topic: Zero-to-Zero Cycle Reconstruction from Raw OHLC</div>
                    <div>Display: Side-by-Side Bybit V5 & Binance Futures Validation</div>
                    <div>Host: Siyab Raheman Gulwadi Abbushet (Founder)</div>
                  </div>
                </div>

                <div className="bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-bold text-xs uppercase">Instagram Live Producer</span>
                    <span className="text-[10px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded border border-purple-500/30 font-bold">
                      RTMP READY
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-400 space-y-1 bg-zinc-950 p-3 rounded-xl border border-zinc-800">
                    <div>Format: Direct RTMP connection to professional account</div>
                    <div>Interaction: Public chat answers in viewer's selected language</div>
                    <div>Disclaimer: No investment advice; pure market behavior research</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: 24/7 AUTONOMOUS ARCHITECTURE */}
          {activeTab === 'DATABASE' && (
            <div className="space-y-5">
              <div className="bg-zinc-900/60 p-4 rounded-2xl border border-zinc-800 space-y-2">
                <h4 className="text-white font-bold text-sm uppercase flex items-center gap-2">
                  <Server className="w-4 h-4 text-emerald-400" />
                  Independent 24/7 System Health (Zero Google / Credit Dependency)
                </h4>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  "If the mobile phone switches off, browser closes, or AI studio token resets, the <strong>main SRBMPR database on DigitalOcean continues recording every trade, candle, and cycle event uninterrupted 24/7</strong>."
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 uppercase block">Bybit V5 Stream Latency</span>
                  <div className="text-xl font-bold text-emerald-400 mt-1">42 ms</div>
                  <span className="text-[10px] text-zinc-500 mt-1 block">Live Websocket Trade Stream</span>
                </div>

                <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 uppercase block">Binance Futures Latency</span>
                  <div className="text-xl font-bold text-emerald-400 mt-1">58 ms</div>
                  <span className="text-[10px] text-zinc-500 mt-1 block">Kline & Orderbook Stream</span>
                </div>

                <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
                  <span className="text-[10px] text-zinc-500 uppercase block">Total Candles Archived</span>
                  <div className="text-xl font-bold text-amber-400 mt-1">116,726 BTC</div>
                  <span className="text-[10px] text-zinc-500 mt-1 block">17-Year Raw Data Integrity</span>
                </div>
              </div>

              <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800 space-y-3">
                <div className="text-white font-bold text-xs uppercase">Continuous Recovery & Gap Self-Healing Protocol</div>
                <div className="space-y-1.5 text-zinc-400 text-[11px]">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Automatic REST Backfill on connection loss with exponential backoff (2s → 5s → 10s)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Deduplication & UTC timestamp normalization on every incoming packet</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Zero synthetic filling policy: If a gap occurs, it is explicitly flagged, never forged</span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800/80 bg-zinc-950/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2 text-zinc-500 text-[11px]">
            <Lock className="w-3.5 h-3.5 text-amber-500" />
            <span>SRAI Autonomous Engine • Controlled Exclusively by Siyab Raheman Gulwadi Abbushet</span>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={onClose}
              className="px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold transition-all"
            >
              Close Console
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
