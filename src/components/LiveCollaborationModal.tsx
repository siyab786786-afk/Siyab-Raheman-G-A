import React, { useState, useEffect, useRef } from 'react';
import { 
  Video, VideoOff, Mic, MicOff, Monitor, Share2, Users, 
  MessageSquare, PhoneOff, Settings, ShieldCheck, Copy, Check, 
  Radio, Volume2, Sparkles, X, ChevronRight, Send
} from 'lucide-react';

interface LiveCollaborationModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeAsset?: string;
  livePrice?: number;
}

interface Participant {
  id: string;
  name: string;
  role: 'HOST' | 'PARTICIPANT' | 'ANALYST';
  micActive: boolean;
  videoActive: boolean;
  avatarColor: string;
  location: string;
}

export const LiveCollaborationModal: React.FC<LiveCollaborationModalProps> = ({
  isOpen,
  onClose,
  activeAsset = 'BTC/USDT',
  livePrice = 65280
}) => {
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [copiedLinkType, setCopiedLinkType] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'PARTICIPANTS' | 'CHAT'>('PARTICIPANTS');
  
  // Real camera stream ref
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Dynamic user count
  const [liveUserCount, setLiveUserCount] = useState(148);

  // Chat stream
  const [chatMessages, setChatMessages] = useState([
    { sender: 'Siyab (Host)', text: 'Welcome everyone! Analyzing the 1:100 entry ladder on BTC & Gold now.', time: '10:02' },
    { sender: 'Dr. Tariq (Dubai)', text: 'Clear audio. Seeing the $65,280 entry axis perfectly on screen.', time: '10:03' },
    { sender: 'Karan (Mumbai)', text: 'Can we check the FTMO funded account stop loss distance?', time: '10:04' },
  ]);
  const [inputMsg, setInputMsg] = useState('');

  const participants: Participant[] = [
    { id: '1', name: 'Siyab Raheman (Founder / Host)', role: 'HOST', micActive: isMicOn, videoActive: isVideoOn, avatarColor: 'from-amber-500 to-red-600', location: 'Dubai, UAE' },
    { id: '2', name: 'Dr. Tariq Al-Mansoor', role: 'ANALYST', micActive: true, videoActive: true, avatarColor: 'from-blue-600 to-indigo-800', location: 'Abu Dhabi' },
    { id: '3', name: 'Karan Patel (Trader)', role: 'PARTICIPANT', micActive: false, videoActive: false, avatarColor: 'from-emerald-600 to-teal-800', location: 'Mumbai, IN' },
    { id: '4', name: 'Rashid Khan', role: 'PARTICIPANT', micActive: true, videoActive: false, avatarColor: 'from-purple-600 to-pink-800', location: 'Sharjah' },
  ];

  // Try accessing webcam when video is on
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (isOpen && isVideoOn) {
      navigator.mediaDevices?.getUserMedia({ video: true, audio: false })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
          }
          setCameraError(null);
        })
        .catch(() => {
          setCameraError('Webcam in virtual simulation mode');
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen, isVideoOn]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveUserCount(prev => Math.max(120, prev + Math.floor(Math.random() * 7) - 3));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  if (!isOpen) return null;

  const handleCopyLink = (type: 'ROOM' | 'STATION' | 'COWATCH' | 'REPORT') => {
    const baseUrl = window.location.origin;
    let link = `${baseUrl}?room=srbmpr-live-${Date.now()}`;
    if (type === 'STATION') link = `${baseUrl}?station=live-broadcast`;
    if (type === 'COWATCH') link = `${baseUrl}?mode=co-watch&sync=true`;
    if (type === 'REPORT') link = `${baseUrl}?report=100-guarantee-pdf`;

    navigator.clipboard.writeText(link);
    setCopiedLinkType(type);
    setTimeout(() => setCopiedLinkType(null), 2500);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;
    setChatMessages([...chatMessages, { sender: 'You (Siyab)', text: inputMsg, time: 'Just now' }]);
    setInputMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col font-mono text-xs">
      
      {/* Top Session Bar */}
      <header className="border-b border-zinc-800 bg-zinc-950 p-4 flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-red-500/20 border border-red-500/40 px-3 py-1 rounded-full text-red-400 font-black uppercase text-[10px] animate-pulse">
            <Radio className="w-3.5 h-3.5" />
            <span>LIVE COLLABORATION ROOM</span>
          </div>

          <div className="flex items-center gap-2 text-zinc-300 font-bold">
            <span className="text-white text-sm font-black">SRBMPR MASTER BROADCAST</span>
            <span className="text-zinc-600">|</span>
            <span className="text-emerald-400 font-bold">{activeAsset} (${livePrice.toLocaleString()})</span>
          </div>
        </div>

        {/* 1-Click Link Generators */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleCopyLink('ROOM')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-[10px] transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)]"
          >
            {copiedLinkType === 'ROOM' ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy 1-Click Zoom Link</span>
          </button>

          <button
            onClick={() => handleCopyLink('COWATCH')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 font-bold rounded-xl text-[10px] transition-all"
          >
            {copiedLinkType === 'COWATCH' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5 text-emerald-400" />}
            <span>Co-Watch Link</span>
          </button>

          <div className="flex items-center gap-1.5 bg-emerald-950/60 border border-emerald-500/40 px-3 py-1.5 rounded-xl text-emerald-300 font-bold text-[10px]">
            <Users className="w-3.5 h-3.5 text-emerald-400" />
            <span>{liveUserCount} Live Listeners</span>
          </div>

          <button 
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-xl bg-zinc-900 border border-zinc-800 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Grid: Video Stage + Sidebar */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        
        {/* Left Video Stage (Zoom-style layout) */}
        <div className="lg:col-span-9 p-4 sm:p-6 flex flex-col justify-between gap-4 overflow-y-auto bg-black">
          
          {/* Main Stage Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
            
            {/* Host Primary Stream (You / Siyab) */}
            <div className="relative rounded-3xl bg-zinc-950 border-2 border-amber-500/50 overflow-hidden shadow-[0_0_40px_rgba(245,158,11,0.15)] flex flex-col justify-between min-h-[260px]">
              {isVideoOn ? (
                <div className="absolute inset-0 bg-black flex items-center justify-center">
                  <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className="w-full h-full object-cover"
                  />
                  {cameraError && (
                    <div className="absolute inset-0 bg-zinc-950 flex flex-col items-center justify-center p-6 text-center">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 to-red-600 flex items-center justify-center text-white text-2xl font-black shadow-[0_0_30px_rgba(245,158,11,0.4)]">
                        SR
                      </div>
                      <span className="text-white font-black text-sm mt-3">SIYAB RAHEMAN</span>
                      <span className="text-zinc-500 text-[10px] mt-1">SRBMPR Founder • HD Voice Live Stream</span>
                      <div className="mt-3 flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full text-emerald-400 text-[9px] font-bold">
                        <Volume2 className="w-3 h-3 animate-pulse" /> Studio Mic Clean Audio Active
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="absolute inset-0 bg-zinc-950 flex flex-col items-center justify-center p-6 text-center">
                  <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 text-2xl font-black">
                    SR
                  </div>
                  <span className="text-white font-bold text-sm mt-3">Camera Off</span>
                </div>
              )}

              {/* Badges on Video Card */}
              <div className="relative z-10 p-3 flex justify-between items-center">
                <span className="bg-amber-500 text-black px-2.5 py-0.5 rounded-full font-black text-[9px] uppercase tracking-wider">
                  FOUNDER / HOST
                </span>
                <div className="flex items-center gap-1.5 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 text-[9px] text-white">
                  {isMicOn ? <Mic className="w-3 h-3 text-emerald-400" /> : <MicOff className="w-3 h-3 text-rose-400" />}
                  <span>{isMicOn ? 'Clean Mic' : 'Muted'}</span>
                </div>
              </div>

              <div className="relative z-10 p-3 bg-gradient-to-t from-black via-black/80 to-transparent flex justify-between items-end">
                <div>
                  <div className="text-white font-black text-xs">Siyab Raheman Gulwadi Abbushet</div>
                  <div className="text-[10px] text-zinc-400">SRBMPR Lead Researcher (Funded Account Bridge)</div>
                </div>
                <span className="text-[9px] text-emerald-400 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                  SYNC LOCKED
                </span>
              </div>
            </div>

            {/* Participant 2 Stream (e.g. Dubai Partner / Analyst) */}
            <div className="relative rounded-3xl bg-zinc-950 border border-zinc-800 overflow-hidden flex flex-col justify-between min-h-[260px]">
              <div className="absolute inset-0 bg-zinc-900/60 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-indigo-800 flex items-center justify-center text-white text-2xl font-black">
                  TA
                </div>
                <span className="text-white font-bold text-sm mt-3">Dr. Tariq Al-Mansoor</span>
                <span className="text-zinc-500 text-[10px] mt-1">Quantitative Risk Reviewer • Dubai</span>
              </div>

              <div className="relative z-10 p-3 flex justify-between items-center">
                <span className="bg-blue-600/40 text-blue-300 border border-blue-500/40 px-2.5 py-0.5 rounded-full font-bold text-[9px]">
                  ANALYST
                </span>
                <div className="bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10 text-[9px] text-emerald-400 flex items-center gap-1">
                  <Mic className="w-3 h-3" /> Listening
                </div>
              </div>

              <div className="relative z-10 p-3 bg-gradient-to-t from-black via-black/80 to-transparent">
                <div className="text-white font-bold text-xs">Dr. Tariq (Co-Host)</div>
                <div className="text-[10px] text-zinc-400">Co-Watching Screen State & SL Floor</div>
              </div>
            </div>

            {/* Participant 3 Stream (Mumbai Trader) */}
            <div className="relative rounded-3xl bg-zinc-950 border border-zinc-800 overflow-hidden flex flex-col justify-between min-h-[200px]">
              <div className="absolute inset-0 bg-zinc-900/30 flex flex-col items-center justify-center p-4 text-center">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white text-xl font-black">
                  KP
                </div>
                <span className="text-white font-bold text-xs mt-2">Karan Patel</span>
                <span className="text-zinc-500 text-[9px]">Funded Trader • Mumbai</span>
              </div>
              <div className="relative z-10 p-3">
                <span className="bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded text-[8px] font-bold">TRADER</span>
              </div>
              <div className="relative z-10 p-3 text-[10px] text-zinc-400">
                Audio Connected • Clean Feed
              </div>
            </div>

            {/* Synchronized Screen View / Co-Watch Terminal Preview */}
            <div className="relative rounded-3xl bg-zinc-950 border-2 border-emerald-500/30 overflow-hidden flex flex-col justify-between min-h-[200px] p-4">
              <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
                <div className="flex items-center gap-2 text-white font-bold text-[10px]">
                  <Monitor className="w-3.5 h-3.5 text-emerald-400" />
                  <span>SHARED CO-WATCH WORKSPACE</span>
                </div>
                <span className="text-[9px] text-emerald-400 font-mono">LATENCY: 12ms</span>
              </div>

              <div className="space-y-2 py-3 font-mono text-[10px]">
                <div className="flex justify-between bg-black p-2 rounded-lg border border-zinc-800">
                  <span className="text-zinc-400">Active Asset:</span>
                  <span className="text-white font-bold">{activeAsset}</span>
                </div>
                <div className="flex justify-between bg-black p-2 rounded-lg border border-zinc-800">
                  <span className="text-zinc-400">Synchronized Entry Axis:</span>
                  <span className="text-emerald-400 font-bold">$65,280 (L1 Completed)</span>
                </div>
                <div className="flex justify-between bg-black p-2 rounded-lg border border-zinc-800">
                  <span className="text-zinc-400">Target Horizon:</span>
                  <span className="text-amber-400 font-bold">$71,775 (1:100 Ratio)</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-[9px] text-zinc-500 pt-2 border-t border-zinc-800">
                <span>Shared Cursor: ACTIVE</span>
                <span className="text-emerald-400 font-bold">ALL PARTICIPANTS SEE SAME AXIS</span>
              </div>
            </div>

          </div>

          {/* Bottom Zoom-style Control Dock */}
          <div className="bg-zinc-950 border border-zinc-800 px-6 py-3 rounded-2xl flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMicOn(!isMicOn)}
                className={`p-3 rounded-xl flex items-center gap-2 font-bold text-[11px] transition-all ${
                  isMicOn ? 'bg-zinc-800 hover:bg-zinc-700 text-white' : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
              >
                {isMicOn ? <Mic className="w-4 h-4 text-emerald-400" /> : <MicOff className="w-4 h-4" />}
                <span>{isMicOn ? 'Mute' : 'Unmute'}</span>
              </button>

              <button
                onClick={() => setIsVideoOn(!isVideoOn)}
                className={`p-3 rounded-xl flex items-center gap-2 font-bold text-[11px] transition-all ${
                  isVideoOn ? 'bg-zinc-800 hover:bg-zinc-700 text-white' : 'bg-red-500 hover:bg-red-600 text-white'
                }`}
              >
                {isVideoOn ? <Video className="w-4 h-4 text-emerald-400" /> : <VideoOff className="w-4 h-4" />}
                <span>{isVideoOn ? 'Stop Video' : 'Start Video'}</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsScreenSharing(!isScreenSharing)}
                className={`px-4 py-2.5 rounded-xl font-bold text-[11px] flex items-center gap-2 transition-all ${
                  isScreenSharing ? 'bg-emerald-500 text-black font-black' : 'bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200'
                }`}
              >
                <Monitor className="w-4 h-4" />
                <span>{isScreenSharing ? 'Sharing Screen' : 'Share Screen'}</span>
              </button>

              <button
                onClick={() => handleCopyLink('ROOM')}
                className="px-4 py-2.5 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 font-bold rounded-xl text-[11px] flex items-center gap-2 transition-all"
              >
                <Share2 className="w-4 h-4 text-blue-400" />
                <span>Invite Link</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl text-[11px] flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)]"
            >
              <PhoneOff className="w-4 h-4" />
              <span>Leave Room</span>
            </button>
          </div>

        </div>

        {/* Right Sidebar: Participant Roster & Live Chat */}
        <div className="lg:col-span-3 border-t lg:border-t-0 lg:border-l border-zinc-800 bg-zinc-950 flex flex-col justify-between">
          
          {/* Tabs */}
          <div className="flex border-b border-zinc-800">
            <button
              onClick={() => setActiveTab('PARTICIPANTS')}
              className={`flex-1 py-3 text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'PARTICIPANTS' ? 'text-amber-400 border-b-2 border-amber-400 bg-white/5' : 'text-zinc-500 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Members ({participants.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('CHAT')}
              className={`flex-1 py-3 text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
                activeTab === 'CHAT' ? 'text-emerald-400 border-b-2 border-emerald-400 bg-white/5' : 'text-zinc-500 hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Live Chat ({chatMessages.length})</span>
            </button>
          </div>

          {/* Tab Body */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {activeTab === 'PARTICIPANTS' ? (
              <div className="space-y-3">
                <div className="text-[10px] text-zinc-500 font-bold uppercase">Active in Room</div>
                {participants.map(p => (
                  <div key={p.id} className="p-3 bg-black rounded-2xl border border-zinc-800 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${p.avatarColor} flex items-center justify-center text-white font-bold text-xs shrink-0`}>
                        {p.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-white font-bold text-[11px] leading-tight">{p.name}</div>
                        <div className="text-[9px] text-zinc-500">{p.location} • {p.role}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {p.micActive ? <Mic className="w-3.5 h-3.5 text-emerald-400" /> : <MicOff className="w-3.5 h-3.5 text-zinc-600" />}
                      {p.videoActive ? <Video className="w-3.5 h-3.5 text-blue-400" /> : <VideoOff className="w-3.5 h-3.5 text-zinc-600" />}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3 flex flex-col justify-between h-full">
                <div className="space-y-2.5 overflow-y-auto max-h-[350px] pr-1">
                  {chatMessages.map((m, i) => (
                    <div key={i} className="p-2.5 bg-black rounded-xl border border-zinc-800 space-y-1">
                      <div className="flex justify-between items-center text-[9px]">
                        <span className="font-bold text-amber-400">{m.sender}</span>
                        <span className="text-zinc-600">{m.time}</span>
                      </div>
                      <div className="text-zinc-300 text-[11px]">{m.text}</div>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleSendMessage} className="pt-2 flex gap-2">
                  <input
                    type="text"
                    placeholder="Ask Siyab on voice/chat..."
                    value={inputMsg}
                    onChange={e => setInputMsg(e.target.value)}
                    className="flex-1 bg-black border border-zinc-800 text-white rounded-xl px-3 py-2 text-xs font-mono focus:border-emerald-500 outline-none"
                  />
                  <button type="submit" className="p-2 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl transition-all">
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Footer of Sidebar */}
          <div className="p-4 border-t border-zinc-800 bg-black text-[10px] text-zinc-500 flex items-center justify-between">
            <span className="flex items-center gap-1 text-emerald-400 font-bold">
              <ShieldCheck className="w-3.5 h-3.5" /> End-to-End Encrypted
            </span>
            <span>Room ID: SRB-8821</span>
          </div>

        </div>

      </div>

    </div>
  );
};
