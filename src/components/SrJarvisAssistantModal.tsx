import React, { useState } from 'react';
import { MessageSquare, Send, Globe, Bot, User, Sparkles } from 'lucide-react';

interface SrJarvisAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  sender: 'user' | 'jarvis';
  text: string;
}

export const SrJarvisAssistantModal: React.FC<SrJarvisAssistantModalProps> = ({ isOpen, onClose }) => {
  const [language, setLanguage] = useState<'English' | 'Hindi' | 'Arabic' | 'Urdu' | 'Malayalam' | 'Kannada'>('English');
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'jarvis',
      text: 'Namaste / Welcome. I am SR JARVIS, your quantitative research and SRBMPR-25/26 behavior assistant. How may I assist you with the Upper Wick $W_{ref}$ unit, 1:1, 1:2, 1:3 sequence, or data integrity audit?'
    }
  ]);
  const [inputVal, setInputVal] = useState('');

  if (!isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;

    const newMsgs: Message[] = [...messages, { sender: 'user', text: inputVal }];
    setMessages(newMsgs);
    setInputVal('');

    setTimeout(() => {
      let reply = `Analyzed under SRBMPR-25/26 rules in ${language}. Upper Wick = 1 reference unit, 1:1 → 1:2 → 1:3 sequence active. Data feed verified from secure broker source with zero cross-mixing.`;
      if (language === 'Hindi') {
        reply = `SRBMPR-25/26 नियमों के तहत विश्लेषण किया गया। Upper Wick = 1 unit, 1:1, 1:2, 1:3 पाइप सीक्वेंस पूरी तरह सुरक्षित है।`;
      } else if (language === 'Arabic') {
        reply = `تم التحليل وفق قواعد SRBMPR-25/26. الوحدة المرجعية Upper Wick = 1، التسلسل 1:1 → 1:2 → 1:3 نشط.`;
      }
      setMessages(prev => [...prev, { sender: 'jarvis', text: reply }]);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col h-[650px]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-900 bg-zinc-900/40">
          <div className="flex items-center gap-2.5">
            <Bot className="w-5 h-5 text-amber-500" />
            <div>
              <h3 className="text-sm font-mono font-bold text-white flex items-center gap-2">
                SR JARVIS [AI] RESEARCH ASSISTANT
                <span className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20">
                  {language}
                </span>
              </h3>
              <p className="text-[11px] text-zinc-400 font-mono">Multilingual Quantitative Behavior & Mechanism Guide</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
              className="bg-zinc-900 border border-zinc-800 text-xs text-amber-400 font-mono rounded-lg px-2.5 py-1 focus:outline-none"
            >
              <option value="English">English</option>
              <option value="Hindi">हिन्दी</option>
              <option value="Arabic">العربية</option>
              <option value="Urdu">اردو</option>
              <option value="Malayalam">മലയാളം</option>
              <option value="Kannada">ಕನ್ನಡ</option>
            </select>
            <button onClick={onClose} className="text-zinc-400 hover:text-white font-mono text-xs px-2.5 py-1 bg-zinc-900 rounded-lg">
              ✕
            </button>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 font-mono text-xs">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.sender === 'jarvis' && (
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div className={`p-3.5 rounded-xl max-w-[80%] leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-amber-500 text-black font-medium'
                  : 'bg-zinc-900 text-zinc-200 border border-zinc-800'
              }`}>
                {m.text}
              </div>
              {m.sender === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-300 shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-4 border-t border-zinc-900 bg-zinc-900/30 flex gap-2">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Ask SR Jarvis about Upper Wick unit, 1:1 level, or data validation..."
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs font-mono text-zinc-200 focus:outline-none focus:border-amber-500"
          />
          <button
            type="submit"
            className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black rounded-xl font-mono text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

      </div>
    </div>
  );
};
