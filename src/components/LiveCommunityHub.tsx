import React, { useState } from 'react';
import { MessageSquare, Video, Mic, Users, Send, MonitorPlay, Wifi } from 'lucide-react';

export const LiveCommunityHub: React.FC = () => {
  const [activeCall, setActiveCall] = useState<'NONE' | 'AUDIO' | 'VIDEO'>('NONE');
  const [messages, setMessages] = useState<{ user: string; text: string; time: string }[]>([
    { user: 'Admin', text: 'SRBMPR V25/26 Engine is now Live with 0.1% Hard SL.', time: '12:00' },
    { user: 'Quant_Bot', text: 'Behavioral Liquidity detected at 84,875 zone.', time: '12:05' },
    { user: 'Market_Scan', text: 'Bridge Sync active: 100+ Limit Nodes processed today.', time: '12:15' }
  ]);

  return (
    <div className="bg-[#05070a] border border-white/5 rounded-[40px] p-8 shadow-2xl space-y-8 font-mono relative overflow-hidden group">
      {/* 3D Depth Glow */}
      <div className="absolute top-0 left-1/4 w-1/2 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
      <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b border-white/5 pb-6">
        <div>
          <h2 className="text-base font-black text-white tracking-[0.2em] uppercase flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-xl border border-blue-500/20">
               <Users className="w-5 h-5 text-blue-400" />
            </div>
            Live Interaction Node
          </h2>
          <div className="flex items-center gap-2 mt-2 ml-1">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
             <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">4,285 Global Nodes Connected</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveCall('AUDIO')}
            className={`p-3.5 rounded-2xl border transition-all duration-500 transform active:scale-90 ${activeCall === 'AUDIO' ? 'bg-amber-500 border-amber-400 text-black shadow-[0_0_25px_rgba(245,158,11,0.4)]' : 'bg-zinc-900/50 border-white/5 text-zinc-400 hover:text-white hover:border-white/10'}`}
            title="Live Audio Call"
          >
            <Mic className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setActiveCall('VIDEO')}
            className={`p-3.5 rounded-2xl border transition-all duration-500 transform active:scale-90 ${activeCall === 'VIDEO' ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_25px_rgba(37,99,235,0.4)]' : 'bg-zinc-900/50 border-white/5 text-zinc-400 hover:text-white hover:border-white/10'}`}
            title="3D Video Stream"
          >
            <Video className="w-5 h-5" />
          </button>
        </div>
      </div>

      {activeCall !== 'NONE' && (
        <div className="relative aspect-video w-full rounded-[32px] bg-black border border-white/10 overflow-hidden shadow-2xl animate-in zoom-in duration-500">
           {/* Scanline Effect */}
           <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%] pointer-events-none z-10" />
           
           <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center space-y-6">
                 <div className="relative">
                    <div className="absolute inset-0 bg-blue-500 rounded-full blur-2xl opacity-20 animate-pulse" />
                    <div className="w-20 h-20 rounded-full bg-blue-600/10 border border-blue-500/40 flex items-center justify-center mx-auto relative z-10 backdrop-blur-md">
                       <MonitorPlay className="w-10 h-10 text-blue-400 animate-bounce duration-[3s]" />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <div className="text-white text-xs font-black tracking-[0.3em] uppercase">Initializing 3D Spatial Stream</div>
                    <div className="text-[10px] text-blue-400/60 font-bold uppercase">P2P Encrypted • Ultra Low Latency</div>
                 </div>
                 <button 
                   onClick={() => setActiveCall('NONE')}
                   className="px-8 py-2.5 bg-rose-600/20 text-rose-400 border border-rose-500/30 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all duration-300 shadow-lg"
                 >
                   Terminate Uplink
                 </button>
              </div>
           </div>
           
           <div className="absolute top-6 right-6 flex items-center gap-3 px-4 py-2 bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 z-20">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] text-white font-black tracking-widest uppercase">HD 3D QUALITY ACTIVE</span>
           </div>
        </div>
      )}

      <div className="h-80 bg-zinc-950/50 rounded-[32px] border border-white/5 flex flex-col p-6 relative shadow-inner">
        <div className="flex-1 overflow-y-auto space-y-5 pr-2 scrollbar-none">
          {messages.map((m, i) => (
            <div key={i} className="space-y-2 group/msg">
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-black uppercase tracking-widest ${m.user === 'Admin' ? 'text-amber-400' : m.user === 'Quant_Bot' ? 'text-blue-400' : 'text-zinc-500'}`}>{m.user}</span>
                <span className="text-[9px] text-zinc-700 font-bold group-hover/msg:text-zinc-500 transition-colors">{m.time}</span>
              </div>
              <p className="text-[11px] text-zinc-400 bg-white/[0.02] p-4 rounded-2xl border border-white/5 group-hover/msg:border-white/10 transition-colors leading-relaxed shadow-sm">
                {m.text}
              </p>
            </div>
          ))}
        </div>
        
        <div className="mt-6 flex gap-3">
          <input 
            type="text" 
            placeholder="Broadcast quantitative coordinate..."
            className="flex-1 bg-zinc-900/50 border border-white/5 rounded-2xl px-6 py-4 text-[11px] text-white focus:outline-none focus:border-blue-500/50 transition-all font-bold placeholder-zinc-700"
          />
          <button className="p-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-500 transition-all shadow-[0_0_15px_rgba(37,99,235,0.3)] active:scale-95">
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="pt-2 flex items-center justify-between text-[9px] text-zinc-700 font-black uppercase tracking-[0.2em]">
         <div className="flex items-center gap-4">
            <span>Mode: Public High-Tier Hub</span>
            <span className="w-1 h-1 rounded-full bg-zinc-800" />
            <span>Encrypted Node</span>
         </div>
         <span className="text-blue-500/40">Latency: 22ms</span>
      </div>
    </div>
  );
};
