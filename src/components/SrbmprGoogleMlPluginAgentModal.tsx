import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Bot,
  Send,
  X,
  Zap,
  Target,
  Shield,
  Layers,
  ArrowRight,
  Database,
  HardDrive,
  Cpu,
  RefreshCw,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { SrbmprGoogleMlAgentService, MlChatMessage } from '../services/SrbmprGoogleMlAgentService';

interface SrbmprGoogleMlPluginAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSymbol?: string;
  livePrice?: number;
  timeframe?: string;
}

export const SrbmprGoogleMlPluginAgentModal: React.FC<SrbmprGoogleMlPluginAgentModalProps> = ({
  isOpen,
  onClose,
  activeSymbol = 'BTCUSDT',
  livePrice = 68450.0,
  timeframe = '1m'
}) => {
  const mlService = SrbmprGoogleMlAgentService.getInstance();
  const [messages, setMessages] = useState<MlChatMessage[]>(() => mlService.getMessages());
  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    return mlService.subscribe(() => {
      setMessages(mlService.getMessages());
    });
  }, [mlService]);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSend = async (textToSend?: string) => {
    const prompt = (textToSend || inputPrompt).trim();
    if (!prompt || isProcessing) return;

    setInputPrompt('');
    setIsProcessing(true);

    try {
      await mlService.sendQuery(prompt, {
        symbol: activeSymbol,
        livePrice,
        timeframe,
        candleMetrics: {
          open: livePrice - 3.0,
          high: livePrice + 12.0,
          low: livePrice - 8.0,
          close: livePrice,
          upperWick: 12.0,
          lowerWick: 5.0,
          bodySize: 3.0,
          tickCount: 52
        }
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const quickPrompts = [
    'Analyze Unseen Minus Zero Entry to Zero Complete',
    'Evaluate 1:1, 1:2, and 1:3 Target Pipeline',
    'Check 8-Candle Shot & 2-Candle Wick Equal Measurement',
    'Verify High 1:1 Retest to Lower High (LH)',
    'Confirm 0.1 Micro-Level Live Stream (No Buffering)'
  ];

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-5">
      <div className="bg-[#060910] border border-cyan-500/50 rounded-xl shadow-2xl shadow-cyan-500/15 w-full max-w-4xl h-[88vh] flex flex-col overflow-hidden font-mono animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-cyan-500/30 bg-gradient-to-r from-[#081020] via-[#0d1830] to-[#081020] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-500/20 border border-cyan-400 flex items-center justify-center shadow-[0_0_12px_rgba(6,182,212,0.35)]">
              <Sparkles className="w-5 h-5 text-cyan-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-black text-white tracking-wider flex items-center gap-1.5">
                  GOOGLE ML PLUGIN AGENT
                </h2>
                <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-bold">
                  GEMINI 3.8 FLASH • ZERO-BUFFERING ML
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold">
                  0.1 MICRO STREAM
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Monitoring {activeSymbol} @ ${livePrice.toFixed(2)} • Unseen Minus Zero, 1:1 $\rightarrow$ 1:2 $\rightarrow$ 1:3 Targets, 8-Candle Shot
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => mlService.clearChat()}
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs flex items-center gap-1"
              title="Clear chat history"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Live Sequence Telemetry Strip */}
        <div className="px-5 py-2 bg-[#091222] border-b border-cyan-500/20 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] shrink-0">
          <div className="p-1.5 rounded bg-black/40 border border-cyan-500/30">
            <div className="text-zinc-500 text-[9px] uppercase">Unseen Minus Zero (-0)</div>
            <div className="font-bold text-amber-300 text-xs">Sweep & Complete</div>
          </div>
          <div className="p-1.5 rounded bg-black/40 border border-emerald-500/30">
            <div className="text-zinc-500 text-[9px] uppercase">Target 1: 1:1 (+$50)</div>
            <div className="font-bold text-emerald-400 text-xs">${(livePrice + 15).toFixed(2)}</div>
          </div>
          <div className="p-1.5 rounded bg-black/40 border border-purple-500/30">
            <div className="text-zinc-500 text-[9px] uppercase">Target 2: 1:2 (+$100)</div>
            <div className="font-bold text-purple-400 text-xs">${(livePrice + 30).toFixed(2)}</div>
          </div>
          <div className="p-1.5 rounded bg-black/40 border border-yellow-500/30">
            <div className="text-zinc-500 text-[9px] uppercase">Target 3: 1:3 (+$150)</div>
            <div className="font-bold text-yellow-400 text-xs">${(livePrice + 45).toFixed(2)}</div>
          </div>
        </div>

        {/* Chat Message Scrollable Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs select-text">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.sender === 'USER' ? 'items-end' : 'items-start'
              }`}
            >
              <div className="flex items-center gap-1.5 mb-1 text-[10px] text-zinc-500">
                {msg.sender === 'USER' ? (
                  <>
                    <span className="font-bold text-amber-400">Master Researcher</span>
                    <span>• {new Date(msg.timestamp).toLocaleTimeString()}</span>
                  </>
                ) : (
                  <>
                    <Bot className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="font-bold text-cyan-300">Google ML Sequence Agent</span>
                    <span>• {new Date(msg.timestamp).toLocaleTimeString()}</span>
                  </>
                )}
              </div>

              <div
                className={`max-w-[88%] rounded-xl p-3.5 leading-relaxed whitespace-pre-wrap ${
                  msg.sender === 'USER'
                    ? 'bg-gradient-to-r from-amber-600 to-yellow-600 text-black font-semibold'
                    : 'bg-[#0a1120] text-cyan-100 border border-cyan-500/30 shadow-lg'
                }`}
              >
                {msg.text}

                {/* Rich Analysis Details Card */}
                {msg.analysisDetails && (
                  <div className="mt-3 pt-3 border-t border-cyan-500/30 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
                    <div className="p-2 rounded bg-black/50 border border-zinc-800">
                      <span className="text-zinc-400">8-Candle Shot State:</span>
                      <div className="font-bold text-emerald-400">{msg.analysisDetails.eightCandleShotState}</div>
                    </div>
                    <div className="p-2 rounded bg-black/50 border border-zinc-800">
                      <span className="text-zinc-400">2-Candle Wick Measurement:</span>
                      <div className="font-bold text-cyan-300">{msg.analysisDetails.twoCandleWickMeasurement}</div>
                    </div>
                    <div className="p-2 rounded bg-black/50 border border-zinc-800">
                      <span className="text-zinc-400">High Retest &rarr; LH:</span>
                      <div className="font-bold text-amber-300">{msg.analysisDetails.highRetestLowerHigh}</div>
                    </div>
                    <div className="p-2 rounded bg-black/50 border border-zinc-800">
                      <span className="text-zinc-400">Zero-Lag Stream:</span>
                      <div className="font-bold text-purple-400">0.1 Micro-Stream Active (No Buffering)</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isProcessing && (
            <div className="flex items-center gap-2 text-cyan-400 text-xs py-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Google ML is evaluating 0.1 micro live sequence & 8-candle shot...</span>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        <div className="px-4 py-2 bg-[#080d1a] border-t border-zinc-800 flex flex-wrap gap-1.5 shrink-0">
          <span className="text-[10px] text-zinc-500 self-center mr-1">ASK ML:</span>
          {quickPrompts.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              disabled={isProcessing}
              className="px-2.5 py-1 rounded-md bg-zinc-900/90 hover:bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 text-[10px] font-bold transition hover:border-cyan-400"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 bg-[#060a14] border-t border-cyan-500/30 flex items-center gap-2 shrink-0">
          <input
            type="text"
            value={inputPrompt}
            onChange={e => setInputPrompt(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Ask Google ML Agent about Unseen Minus Zero, 1:1->1:2->1:3 targets, or 8-candle shots..."
            className="flex-1 bg-black/80 border border-cyan-500/40 rounded-lg px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-cyan-400 font-mono"
            disabled={isProcessing}
          />

          <button
            onClick={() => handleSend()}
            disabled={isProcessing || !inputPrompt.trim()}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-black font-black text-xs flex items-center gap-1.5 transition shadow"
          >
            <span>Ask ML</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
};
