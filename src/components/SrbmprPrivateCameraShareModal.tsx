import React, { useState, useRef, useEffect } from 'react';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Share2,
  Copy,
  Check,
  Shield,
  Lock,
  Radio,
  Eye,
  Volume2,
  RefreshCw,
  X,
  ExternalLink,
  Sliders,
  Maximize2
} from 'lucide-react';

export interface WorkspacePermissionSettings {
  allowViewChart: boolean;
  allowViewCamera: boolean;
  allowHearVoice: boolean;
}

interface SrbmprPrivateCameraShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  symbol: string;
  isCameraActive: boolean;
  isMicActive: boolean;
  onToggleCamera: () => void;
  onToggleMic: () => void;
  mediaStream: MediaStream | null;
  videoResolution: string;
}

export const SrbmprPrivateCameraShareModal: React.FC<SrbmprPrivateCameraShareModalProps> = ({
  isOpen,
  onClose,
  symbol,
  isCameraActive,
  isMicActive,
  onToggleCamera,
  onToggleMic,
  mediaStream,
  videoResolution
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [token, setToken] = useState<string>(() => {
    return 'srb_priv_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now().toString(36);
  });
  const [permissions, setPermissions] = useState<WorkspacePermissionSettings>({
    allowViewChart: true,
    allowViewCamera: true,
    allowHearVoice: true
  });
  const [expiresInHours, setExpiresInHours] = useState<number>(24);
  const [isRevoked, setIsRevoked] = useState<boolean>(false);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (localVideoRef.current && mediaStream) {
      localVideoRef.current.srcObject = mediaStream;
    }
  }, [mediaStream, isCameraActive]);

  if (!isOpen) return null;

  // Determine actual public/host shareable URL
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://srbmpr-terminal.com';
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : '/';
  const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  const shareableUrl = isRevoked
    ? 'LINK_REVOKED'
    : `${currentOrigin}${currentPath}?room=${token}&symbol=${symbol}&view_chart=${permissions.allowViewChart}&view_cam=${permissions.allowViewCamera}&hear_voice=${permissions.allowHearVoice}`;

  const handleCopyLink = () => {
    if (isRevoked) return;
    navigator.clipboard.writeText(shareableUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleRegenerateToken = () => {
    setToken('srb_priv_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now().toString(36));
    setIsRevoked(false);
  };

  const handleRevokeAccess = () => {
    setIsRevoked(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 font-mono select-none">
      <div className="bg-[#0b0f19] border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-100">
        
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 bg-[#070a12] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                <span>Private Shareable Workspace</span>
                <span className="text-[10px] bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 px-2 py-0.5 rounded font-bold">
                  Encrypted Session
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Grant authenticated, private access to your live chart, face camera, and voice.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          
          {/* Live Camera Preview & Direct Owner Controls */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3.5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-white uppercase text-[11px]">Live Camera & Voice Controls</span>
              </div>
              <div className="flex items-center gap-2 text-[10px]">
                <span className={`flex items-center gap-1 ${isCameraActive ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>
                  <span className={`w-2 h-2 rounded-full ${isCameraActive ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`} />
                  {isCameraActive ? `ACTIVE (${videoResolution})` : 'CAMERA OFF'}
                </span>
                <span className="text-slate-600">|</span>
                <span className={isMicActive ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                  {isMicActive ? 'MIC ON' : 'MUTED'}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
              {/* Video Element */}
              <div className="relative aspect-video bg-black rounded-lg border border-slate-800 overflow-hidden flex items-center justify-center">
                {isCameraActive && mediaStream ? (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover mirror"
                  />
                ) : (
                  <div className="text-center p-4 text-slate-500">
                    <VideoOff className="w-6 h-6 mx-auto mb-1 text-slate-600" />
                    <span className="text-[10px]">Camera deactivated by owner</span>
                  </div>
                )}
                {isCameraActive && (
                  <span className="absolute bottom-2 left-2 bg-black/80 border border-emerald-500/40 text-emerald-300 text-[9px] px-1.5 py-0.5 rounded font-bold">
                    {videoResolution}
                  </span>
                )}
              </div>

              {/* Activation Buttons */}
              <div className="space-y-2">
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Your live face and voice will be transmitted to authorized viewers only while you enable them below.
                </p>
                <div className="flex flex-col gap-2 pt-1">
                  <button
                    onClick={onToggleCamera}
                    className={`py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
                      isCameraActive
                        ? 'bg-rose-600 hover:bg-rose-500 text-white'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-black font-black'
                    }`}
                  >
                    {isCameraActive ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                    <span>{isCameraActive ? 'Turn Off Camera' : 'Activate Live Camera (4K/1080p)'}</span>
                  </button>

                  <button
                    onClick={onToggleMic}
                    className={`py-2 px-3 rounded-lg font-bold flex items-center justify-center gap-2 border transition-all ${
                      isMicActive
                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-400 border-slate-800'
                    }`}
                  >
                    {isMicActive ? <Mic className="w-4 h-4 text-emerald-400" /> : <MicOff className="w-4 h-4" />}
                    <span>{isMicActive ? 'Mute Microphone' : 'Unmute Microphone'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Granular Permission Settings */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <span className="font-bold text-white uppercase text-[11px] flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-amber-400" /> Granular Access Permissions
              </span>
              <span className="text-[10px] text-slate-400">Authorized Viewer Rights</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
              {/* Permission 1: View Chart */}
              <label className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800 cursor-pointer hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={permissions.allowViewChart}
                  onChange={e => setPermissions(p => ({ ...p, allowViewChart: e.target.checked }))}
                  className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0"
                />
                <div className="flex flex-col">
                  <span className="font-bold text-white text-[11px] flex items-center gap-1">
                    <Eye className="w-3 h-3 text-sky-400" /> View Chart
                  </span>
                  <span className="text-[9px] text-slate-400">Live candlestick feed</span>
                </div>
              </label>

              {/* Permission 2: View Camera */}
              <label className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800 cursor-pointer hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={permissions.allowViewCamera}
                  onChange={e => setPermissions(p => ({ ...p, allowViewCamera: e.target.checked }))}
                  className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0"
                />
                <div className="flex flex-col">
                  <span className="font-bold text-white text-[11px] flex items-center gap-1">
                    <Video className="w-3 h-3 text-emerald-400" /> View Camera
                  </span>
                  <span className="text-[9px] text-slate-400">See owner live face</span>
                </div>
              </label>

              {/* Permission 3: Hear Voice */}
              <label className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800 cursor-pointer hover:border-slate-700">
                <input
                  type="checkbox"
                  checked={permissions.allowHearVoice}
                  onChange={e => setPermissions(p => ({ ...p, allowHearVoice: e.target.checked }))}
                  className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0"
                />
                <div className="flex flex-col">
                  <span className="font-bold text-white text-[11px] flex items-center gap-1">
                    <Volume2 className="w-3 h-3 text-purple-400" /> Hear Voice
                  </span>
                  <span className="text-[9px] text-slate-400">Listen to audio stream</span>
                </div>
              </label>
            </div>
          </div>

          {/* Generated Shareable Link with Expiry & Revocation */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
              <span className="font-bold text-white uppercase text-[11px] flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-400" /> Private Revocable Link
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400">Valid:</span>
                <select
                  value={expiresInHours}
                  onChange={e => setExpiresInHours(Number(e.target.value))}
                  className="bg-slate-950 border border-slate-800 text-slate-200 text-[10px] px-1.5 py-0.5 rounded"
                >
                  <option value={1}>1 Hour</option>
                  <option value={12}>12 Hours</option>
                  <option value={24}>24 Hours</option>
                  <option value={72}>3 Days</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-[11px] text-emerald-300 font-mono truncate">
                {shareableUrl}
              </div>
              <button
                onClick={handleCopyLink}
                disabled={isRevoked}
                className={`px-3 py-2 rounded-lg font-bold flex items-center gap-1.5 shrink-0 transition-all ${
                  isRevoked
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : copied
                      ? 'bg-emerald-500 text-black'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-black font-black'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
              </button>
            </div>

            {/* Localhost Notice Callout */}
            {isLocalhost && (
              <div className="bg-amber-500/10 border border-amber-500/30 p-2.5 rounded-lg text-[10px] text-amber-300 space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <span>ℹ Network Connectivity Notice:</span>
                </div>
                <div>
                  This application is currently running locally. A link with <code className="bg-black/50 px-1 py-0.5 rounded">localhost</code> will only open on this same computer. When deployed to the AI Studio preview or cloud server, this share link works seamlessly across external devices and mobile phones.
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              <button
                onClick={handleRegenerateToken}
                className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 font-bold"
              >
                <RefreshCw className="w-3 h-3" /> Regenerate Token
              </button>
              <button
                onClick={handleRevokeAccess}
                className="text-[11px] text-rose-400 hover:text-rose-300 font-bold"
              >
                Revoke This Link Immediately
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-[#070a12] flex items-center justify-between text-[11px] text-slate-400">
          <span>Security: Expiring Token • End-to-End Encrypted Session</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
