import React, { useState, useEffect } from 'react';
import { 
  Video, VideoOff, Users, Mic, Radio, Share2, Copy, Check, 
  ExternalLink, Sparkles, Volume2, ShieldCheck, ChevronRight
} from 'lucide-react';
import { LiveCollaborationModal } from './LiveCollaborationModal';

export const FounderLiveArea: React.FC = () => {
  const [users, setUsers] = useState(148);
  const [isLiveModalOpen, setIsLiveModalOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setUsers(prev => Math.max(130, prev + Math.floor(Math.random() * 5) - 2));
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const handleCopyInvite = () => {
    const link = `${window.location.origin}?session=srbmpr-live-room`;
    navigator.clipboard.writeText(link);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <>
      <div className="bg-gradient-to-r from-zinc-950 via-black to-zinc-950 border-2 border-emerald-500/40 rounded-3xl p-6 shadow-[0_0_40px_rgba(16,185,129,0.12)] font-mono text-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Left: Founder Status & Live Ping */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center text-white text-xl font-black shadow-[0_0_25px_rgba(245,158,11,0.3)]">
                SR
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-black rounded-full animate-ping" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-black rounded-full" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/40 px-2 py-0.5 rounded font-black uppercase flex items-center gap-1">
                  <Radio className="w-3 h-3 animate-pulse" /> LIVE BROADCAST
                </span>
                <span className="text-[11px] text-white font-bold">SIYAB RAHEMAN GULWADI ABBUSHET</span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-1">
                Founder Live Station • Face-to-Face Explanation • Studio Mic Audio Ready
              </p>
            </div>
          </div>

          {/* Right: Metrics & One-Click Launch */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-emerald-950/40 border border-emerald-500/40 px-3 py-2 rounded-2xl text-emerald-400 font-bold text-xs">
              <Users className="w-4 h-4 text-emerald-400" />
              <span>{users} ACTIVE LISTENERS</span>
            </div>

            <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-2xl text-zinc-300 text-xs">
              <Volume2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Clean Voice Mic</span>
            </div>

            <button
              onClick={handleCopyInvite}
              className="flex items-center gap-1.5 px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-2xl font-bold text-xs transition-all"
            >
              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-zinc-400" />}
              <span>{isCopied ? 'Link Copied!' : 'Copy Invite Link'}</span>
            </button>

            <button
              onClick={() => setIsLiveModalOpen(true)}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-2xl text-xs flex items-center gap-2 transition-all shadow-[0_0_25px_rgba(16,185,129,0.35)]"
            >
              <Video className="w-4 h-4" />
              <span>JOIN LIVE ZOOM-STYLE ROOM</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* Full Live Collaboration Modal */}
      <LiveCollaborationModal 
        isOpen={isLiveModalOpen}
        onClose={() => setIsLiveModalOpen(false)}
      />
    </>
  );
};
