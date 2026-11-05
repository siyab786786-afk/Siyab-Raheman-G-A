// SrbmprInteractiveTutorialModal.tsx — Built-in Professional Onboarding Interactive Tutorial
// Demonstrates all 8 specific onboarding workflows with animated interactive UI mockups, captions, playback controls, and Hindi/English instruction.

import React, { useState, useEffect } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Tv,
  LogIn,
  KeyRound,
  LineChart,
  Layers,
  Crosshair,
  Sparkles,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

export interface TutorialStep {
  stepNumber: number;
  titleEn: string;
  titleHi: string;
  summaryEn: string;
  summaryHi: string;
  keyActionEn: string;
  keyActionHi: string;
  icon: React.ComponentType<{ className?: string }>;
  uiHighlightTarget: string;
  badge: string;
  bulletPoints: string[];
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    stepNumber: 1,
    titleEn: 'Where to Click "CONNECT SRBMPR / USE NOW"',
    titleHi: '"CONNECT SRBMPR / USE NOW" कहाँ क्लिक करें',
    summaryEn: 'Anyone can watch the public showcase stream without login. To interact with candles, test 1-by-1, and verify research yourself, locate the yellow banner at the top of the showcase and click "CONNECT SRBMPR / USE NOW".',
    summaryHi: 'कोई भी दर्शक बिना लॉगिन के सार्वजनिक शोकेस देख सकता है। चार्ट को खुद इस्तेमाल करने और रिसर्च की पुष्टि करने के लिए ऊपर पीले बैनर पर "CONNECT SRBMPR / USE NOW" बटन दबाएं।',
    keyActionEn: 'Click the yellow glowing "CONNECT SRBMPR / USE NOW" invitation button.',
    keyActionHi: 'शीर्ष पर दिए गए पीले "CONNECT SRBMPR / USE NOW" बटन पर क्लिक करें।',
    icon: Tv,
    uiHighlightTarget: 'TOP_INVITATION_BANNER',
    badge: 'Step 1 of 8 · Discovery',
    bulletPoints: [
      'Unauthenticated viewers enjoy 24/7 view-only live streaming of scheduled coins.',
      'The yellow top bar invites viewers to get their own isolated research session.',
      'No credit card required. Free quantitative behavioral research access.'
    ]
  },
  {
    stepNumber: 2,
    titleEn: 'How to Create an Account & Verify Email',
    titleHi: 'अकाउंट कैसे बनाएं और ईमेल वेरीफाई करें',
    summaryEn: 'Click "Create New Account" in the modal. Enter your email and choose a secure password. A 6-digit confirmation code will be issued to confirm your identity.',
    summaryHi: 'मॉडल में "Create New Account" चुनें। अपना ईमेल और 6-अक्षरों का पासवर्ड डालें। सत्यापन के लिए 6-अंकों का वेरिफिकेशन कोड दर्ज करें।',
    keyActionEn: 'Enter email & password, then confirm the 6-digit verification code.',
    keyActionHi: 'ईमेल और पासवर्ड दर्ज करें, फिर 6-अंकों का कोड डालकर अकाउंट एक्टिवेट करें।',
    icon: LogIn,
    uiHighlightTarget: 'REGISTRATION_FORM',
    badge: 'Step 2 of 8 · Registration',
    bulletPoints: [
      'Isolated session assigned immediately upon email verification.',
      'Personal state, bookings, and replay tests are kept private in your browser session.',
      'Instant demo login button is also provided for immediate evaluation.'
    ]
  },
  {
    stepNumber: 3,
    titleEn: 'How to Log in Securely (Isolated Sandbox)',
    titleHi: 'सुरक्षित लॉगिन कैसे करें (आइसोलेटेड सैंडबॉक्स)',
    summaryEn: 'Sign in with your verified credentials. Your viewer session operates in a strict, read-and-test sandbox with zero risk of altering host configurations, database records, or initiating live exchange orders.',
    summaryHi: 'अपने रजिस्टर्ड ईमेल और पासवर्ड से साइन इन करें। आपका सत्र सुरक्षित सैंडबॉक्स में चलता है, जिससे होस्ट सेटिंग्स या असली ट्रेडिंग को कोई खतरा नहीं होता।',
    keyActionEn: 'Authenticate to unlock interactive chart manipulation & personal testing.',
    keyActionHi: 'लॉगिन करें ताकि आपको इंटरैक्टिव चार्ट और खुद टेस्टिंग करने की अनुमति मिले।',
    icon: KeyRound,
    uiHighlightTarget: 'SECURE_LOGIN',
    badge: 'Step 3 of 8 · Security Isolation',
    bulletPoints: [
      'Viewer role is strictly read-only and analytical.',
      'Public broadcast continues running independently without disturbance.',
      'Real orders and host controls remain inaccessible to viewers.'
    ]
  },
  {
    stepNumber: 4,
    titleEn: 'How to Open & Navigate the Chart',
    titleHi: 'चार्ट कैसे खोलें और नेविगेट करें',
    summaryEn: 'Upon login, your personal interactive chart loads. Drag left or right across 100,000 candles, drag the vertical price axis to scale, and use +Upper/Lower Space controls to adjust vertical height.',
    summaryHi: 'लॉगिन होते ही आपका व्यक्तिगत चार्ट खुलता है। 100,000 कैंडल्स में बाएँ-दाएँ स्क्रॉल करें, दाएँ प्राइस अक्ष को ऊपर-नीचे खींचें और चार्ट को अपनी पसंद से सेट करें।',
    keyActionEn: 'Drag canvas to pan historical candles, drag right axis to scale prices.',
    keyActionHi: 'चार्ट को ड्रैग करके ऐतिहासिक डेटा देखें और राइट-स्केल को रीसाइज करें।',
    icon: LineChart,
    uiHighlightTarget: 'CANVAS_NAVIGATION',
    badge: 'Step 4 of 8 · Chart Viewport',
    bulletPoints: [
      '◄ Bring to Left Side: Positions active candles with 75% forward testing space.',
      'UI Lock: Locks your viewport so live incoming candles never jump your view.',
      '24 4K Color Combinations: Choose Pure Black (#000000) or Pure White (#FFFFFF).'
    ]
  },
  {
    stepNumber: 5,
    titleEn: 'How to Change Symbol & Timeframe',
    titleHi: 'कॉइन सिंबल और टाइमफ्रेम कैसे बदलें',
    summaryEn: 'Use the top-left asset selector to switch between BTC, ETH, SOL, BNB, XRP, and DOGE. Use the dedicated "★ 1m (1:10 & 1:20 INSIDE)" or "★ 5m (SINGLE 5-MIN)" buttons or 1s, 3m, 15m, 1D selectors.',
    summaryHi: 'ऊपरी बाएँ ड्रॉपडाउन से बीटीसी, ईथ, सोल, बीएनबी आदि चुनें। "★ 1m (1:10 & 1:20 INSIDE)" और "★ 5m" बटन से सीधे इच्छित टाइमफ्रेम पर जाएँ।',
    keyActionEn: 'Click asset dropdown or timeframe buttons to switch research context.',
    keyActionHi: 'एसेट ड्रॉपडाउन या टाइमफ्रेम बटन से अलग-अलग कॉइन और समय-सीमा चुनें।',
    icon: Layers,
    uiHighlightTarget: 'TIMEFRAME_SELECTOR',
    badge: 'Step 5 of 8 · Multi-Asset',
    bulletPoints: [
      'All 100 high-volume Bybit Linear Perpetual symbols supported.',
      'Dedicated 1-minute and 5-minute single-container fast switches.',
      'Dual Timezone clocks (UTC + IST / GST) adapt automatically.'
    ]
  },
  {
    stepNumber: 6,
    titleEn: 'How to Inspect Entry, SL, Target & Timestamps',
    titleHi: 'Entry, SL, Target और टाइमस्टैम्प्स की जांच कैसे करें',
    summaryEn: 'Hover over any candle to see high-precision OHLC, 3-tier timestamps (Formation, Confirmation, Execution), and the $50 fixed risk calculation: Q = 50 / |Entry - SL| with 1:1, 1:10 (+$500) and 1:20 (+$1,000) target lines.',
    summaryHi: 'कैंडल पर कर्सर ले जाकर OHLC और टाइमस्टैम्प देखें। $50 फिक्स्ड रिस्क फॉर्मूला (Q = 50 / |Entry - SL|) और 1:10 (+$500) व 1:20 (+$1,000) टारगेट लाइन्स जांचें।',
    keyActionEn: 'Single-click any candle to set Chosen-Time Price Line and inspect targets.',
    keyActionHi: 'किसी भी कैंडल पर क्लिक करके प्राइस लाइन सेट करें और लेवल्स देखें।',
    icon: Crosshair,
    uiHighlightTarget: 'INSPECT_ENTRY_TARGETS',
    badge: 'Step 6 of 8 · Mathematical Rigor',
    bulletPoints: [
      'Atomic 1:1 (Δ0) unit strictly computed from Terminal 0 micro-zero origin.',
      '★ 1:10 level = 10 × Δ0 expansion (+$500 USD payout on $50 risk).',
      '★ 1:20 level = 20 × Δ0 expansion (+$1,000 USD payout on $50 risk).'
    ]
  },
  {
    stepNumber: 7,
    titleEn: 'How to Use Replay, 1-by-1 Forward Test & 1s Terminal',
    titleHi: '1-by-1 फॉरवर्ड टेस्ट और 1-सेकंड टर्मिनल का उपयोग',
    summaryEn: 'Click "+1 CANDLE (1-BY-1)" or use the Right Arrow key to reveal candles one by one into the open forward space. Click "1s MICRO TERMINAL" to inspect the 60 unmerged 1-second candles (s00..s59).',
    summaryHi: '"+1 CANDLE (1-BY-1)" दबाएं या कीबोर्ड एरो से एक-एक कैंडल आगे बढ़ाकर टेस्ट करें। "1s MICRO TERMINAL" खोलकर 1-मिनट के अंदर की 60 अनमर्ज्ड 1-सेकंड कैंडल्स देखें।',
    keyActionEn: 'Use 1-by-1 step forward to simulate zero-lookahead real market progression.',
    keyActionHi: '1-by-1 बटन दबाकर बिना चीटिंग के एक-एक कैंडल आगे बढ़ाकर टेस्ट करें।',
    icon: Play,
    uiHighlightTarget: 'REPLAY_TEST_CONTROLS',
    badge: 'Step 7 of 8 · Forward Testing',
    bulletPoints: [
      'Zero look-ahead bias: future candles are hidden until stepped forward.',
      '60 discrete 1-second ticks decompose the 1m container without smoothing.',
      '+ BOOK CANDLE: logs the exact observation into your JSON research report.'
    ]
  },
  {
    stepNumber: 8,
    titleEn: 'How to Return to the Live Showcase Anytime',
    titleHi: 'लाइव शोकेस पर वापस कैसे लौटें',
    summaryEn: 'At any time during your interactive testing, click the "LIVE SHOWCASE" or "WATCH BROADCAST" button in the upper header to return to the public 30-second automated showcase stream.',
    summaryHi: 'रिसर्च के दौरान किसी भी समय ऊपर "LIVE SHOWCASE" बटन दबाकर 30-सेकंड ऑटो-रोटेशन ब्रॉडकास्ट पर वापस जा सकते हैं।',
    keyActionEn: 'Click "LIVE SHOWCASE" in header to resume watching the automated stream.',
    keyActionHi: 'ऊपर "LIVE SHOWCASE" बटन दबाकर 30s ऑटोमैटिक स्ट्रीम पर लौटें।',
    icon: Tv,
    uiHighlightTarget: 'RETURN_TO_SHOWCASE',
    badge: 'Step 8 of 8 · Seamless Flow',
    bulletPoints: [
      'Your interactive chart state is preserved when you return to showcase.',
      'Showcase scheduler runs in background without resetting your work.',
      'Sign out button clears isolated token when your research session ends.'
    ]
  }
];

export const SrbmprInteractiveTutorialModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onOpenConnectModal?: () => void;
}> = ({ isOpen, onClose, onOpenConnectModal }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(true);
  const [langMode, setLangMode] = useState<'EN' | 'HI'>('HI'); // Default Hindi for user preference, easily toggled

  // Auto-play timer (advances step every 6 seconds if active)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isAutoPlaying && isOpen) {
      timer = setInterval(() => {
        setCurrentStepIndex(prev => (prev < TUTORIAL_STEPS.length - 1 ? prev + 1 : 0));
      }, 6500);
    }
    return () => clearInterval(timer);
  }, [isAutoPlaying, isOpen]);

  if (!isOpen) return null;

  const currentStep = TUTORIAL_STEPS[currentStepIndex];
  const StepIcon = currentStep.icon;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 font-mono select-none">
      <div className="w-full max-w-4xl max-h-[92vh] bg-[#070b14] border-2 border-amber-500/60 rounded-2xl shadow-[0_0_80px_rgba(245,158,11,0.25)] flex flex-col overflow-hidden text-slate-100">
        
        {/* Header Bar */}
        <div className="bg-[#0b1222] border-b border-slate-800 px-5 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 via-emerald-400 to-cyan-500 p-0.5 flex items-center justify-center shadow-md">
              <div className="w-full h-full rounded-[10px] bg-slate-950 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="text-[10px] text-amber-400 uppercase font-black tracking-widest flex items-center gap-1.5">
                <span>SRBMPR ONBOARDING ENGINE</span>
                <span className="text-zinc-600">|</span>
                <span className="text-emerald-400">GUIDED INTERACTIVE TUTORIAL</span>
              </div>
              <h2 className="text-sm sm:text-base font-black text-white">
                Live Auto-Chart Showcase & Viewer Terminal Masterclass
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg p-0.5 text-xs font-black">
              <button
                onClick={() => setLangMode('HI')}
                className={`px-2 py-1 rounded ${langMode === 'HI' ? 'bg-amber-500 text-black' : 'text-slate-400 hover:text-white'}`}
              >
                हिंदी
              </button>
              <button
                onClick={() => setLangMode('EN')}
                className={`px-2 py-1 rounded ${langMode === 'EN' ? 'bg-amber-500 text-black' : 'text-slate-400 hover:text-white'}`}
              >
                English
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg border border-slate-700"
              title="Close Tutorial"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Step Progress Indicators (1 to 8) */}
        <div className="bg-[#050811] px-5 py-2 border-b border-slate-800 flex items-center justify-between gap-1 overflow-x-auto">
          {TUTORIAL_STEPS.map((s, idx) => {
            const isDone = idx < currentStepIndex;
            const isCur = idx === currentStepIndex;
            return (
              <button
                key={s.stepNumber}
                onClick={() => {
                  setCurrentStepIndex(idx);
                  setIsAutoPlaying(false);
                }}
                className={`flex-1 min-w-[70px] py-1.5 px-2 rounded-lg text-center transition-all border ${
                  isCur
                    ? 'bg-amber-500 text-black border-amber-300 font-black shadow-md'
                    : isDone
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 font-bold'
                      : 'bg-slate-900/60 text-slate-500 border-slate-800 hover:text-slate-300'
                }`}
              >
                <div className="text-[9px] uppercase leading-none">Step {s.stepNumber}</div>
                <div className="text-[10px] truncate mt-0.5">
                  {langMode === 'HI' ? `भाग ${s.stepNumber}` : `Lesson ${s.stepNumber}`}
                </div>
              </button>
            );
          })}
        </div>

        {/* Main Stage: Left Walkthrough Details + Right Interactive Visual Canvas Mockup */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* Left Details (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-black uppercase">
                  {currentStep.badge}
                </span>
                <span className="text-[10px] text-slate-400 font-bold">
                  {currentStepIndex + 1} / {TUTORIAL_STEPS.length}
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  <StepIcon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black text-white leading-tight">
                  {langMode === 'HI' ? currentStep.titleHi : currentStep.titleEn}
                </h3>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {langMode === 'HI' ? currentStep.summaryHi : currentStep.summaryEn}
              </p>
            </div>

            {/* Key Action Callout */}
            <div className="bg-emerald-950/30 border border-emerald-500/40 rounded-xl p-3.5 space-y-1">
              <div className="text-[10px] text-emerald-400 font-black uppercase flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{langMode === 'HI' ? 'मुख्य एक्शन (Key Action)' : 'Key Action Required'}</span>
              </div>
              <p className="text-xs font-bold text-white">
                {langMode === 'HI' ? currentStep.keyActionHi : currentStep.keyActionEn}
              </p>
            </div>

            {/* Bullet Points */}
            <div className="space-y-1.5">
              {currentStep.bulletPoints.map((pt, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-slate-300 bg-slate-900/50 p-2 rounded-lg border border-slate-800/80">
                  <span className="text-amber-400 font-black shrink-0">▸</span>
                  <span>{pt}</span>
                </div>
              ))}
            </div>

            {/* If on Step 1, 2, or 3, show direct "Connect Now" launcher */}
            {currentStep.stepNumber <= 3 && onOpenConnectModal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenConnectModal();
                }}
                className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-xs uppercase rounded-xl flex items-center justify-center gap-2 shadow-lg"
              >
                <LogIn className="w-4 h-4" />
                <span>CONNECT SRBMPR / USE NOW</span>
              </button>
            )}
          </div>

          {/* Right Visual Stage Mockup (7 cols) */}
          <div className="lg:col-span-7 bg-[#03060d] border border-slate-800 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden min-h-[340px]">
            {/* Visual Header Mockup */}
            <div className="border-b border-slate-800/80 pb-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-bold text-white">SRBMPR INTERACTIVE UI SIMULATOR</span>
              </div>
              <span className="text-[10px] text-amber-400 font-mono">Simulated Viewport</span>
            </div>

            {/* Dynamic Step-Specific Visual Demonstration */}
            <div className="my-auto py-4">
              {currentStep.stepNumber === 1 && (
                <div className="space-y-3">
                  {/* Spotlight on Yellow Top Banner */}
                  <div className="p-4 bg-amber-500/20 border-2 border-amber-400 rounded-2xl ring-4 ring-amber-400/30 animate-pulse">
                    <div className="text-center space-y-1.5">
                      <span className="text-[11px] font-black text-amber-300 uppercase tracking-widest block">
                        ★ TOP LIVE SHOWCASE INVITATION
                      </span>
                      <p className="text-xs text-amber-100 font-bold max-w-md mx-auto">
                        “Connect SRBMPR Behavioral Terminal — Sign in to use the interactive research terminal and verify the research yourself.”
                      </p>
                      <div className="pt-2">
                        <button className="px-5 py-2 bg-gradient-to-r from-amber-400 to-yellow-300 text-black font-black text-xs rounded-xl shadow-md uppercase tracking-wider inline-flex items-center gap-1.5">
                          <LogIn className="w-3.5 h-3.5" />
                          <span>CONNECT SRBMPR / USE NOW</span>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="text-center text-[11px] text-slate-400">
                    ☝️ Visible at the top of every public broadcast screen
                  </div>
                </div>
              )}

              {currentStep.stepNumber === 2 && (
                <div className="max-w-sm mx-auto bg-slate-900 border border-amber-500/60 p-4 rounded-xl space-y-3 shadow-xl">
                  <div className="text-xs font-black text-amber-300 uppercase">Create Isolated Viewer Account</div>
                  <div className="space-y-2 text-xs">
                    <div>
                      <label className="text-[10px] text-slate-400">Email Address</label>
                      <input readOnly value="quant.researcher@example.com" className="w-full bg-black border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono text-[11px]" />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400">Password</label>
                      <input readOnly value="••••••••••••" type="password" className="w-full bg-black border border-slate-700 rounded px-2.5 py-1.5 text-white font-mono text-[11px]" />
                    </div>
                    <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded text-center">
                      <span className="text-[10px] text-emerald-400 font-bold">6-Digit Code Sent: </span>
                      <strong className="text-white text-xs tracking-widest font-mono">720656</strong>
                    </div>
                  </div>
                </div>
              )}

              {currentStep.stepNumber === 3 && (
                <div className="max-w-sm mx-auto bg-slate-900 border border-cyan-500/50 p-4 rounded-xl space-y-3 shadow-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-cyan-300 uppercase">Sandbox Security Activated</span>
                    <span className="text-[10px] text-emerald-400 font-bold">Isolated Session</span>
                  </div>
                  <div className="p-3 bg-black/80 border border-slate-800 rounded-lg space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Viewer Role:</span>
                      <strong className="text-white">READ & TEST ONLY</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Exchange API:</span>
                      <strong className="text-rose-400">LOCKED (NO TRADES)</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Database Access:</span>
                      <strong className="text-emerald-400">READ-ONLY EVIDENCE</strong>
                    </div>
                  </div>
                </div>
              )}

              {currentStep.stepNumber === 4 && (
                <div className="bg-black border border-slate-800 p-3 rounded-xl space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-amber-300 font-bold">BTCUSDT · 1m</span>
                    <span className="text-emerald-400 font-bold">$68,420.50</span>
                  </div>
                  <div className="h-28 bg-[#020409] border border-slate-900 rounded flex items-center justify-center text-xs text-slate-500">
                    [ Interactive 4K Canvas · 100,000 Continuous Candles ]
                  </div>
                  <div className="flex gap-2 text-[10px]">
                    <span className="px-2 py-0.5 bg-slate-900 border border-slate-700 rounded text-amber-300">◄ Bring to Left Side</span>
                    <span className="px-2 py-0.5 bg-slate-900 border border-slate-700 rounded text-cyan-300">Lock Viewport</span>
                    <span className="px-2 py-0.5 bg-slate-900 border border-slate-700 rounded text-slate-300">+ Upper/Lower Space</span>
                  </div>
                </div>
              )}

              {currentStep.stepNumber === 5 && (
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1.5 p-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-black">
                    <span className="px-2 py-1 bg-amber-500 text-black rounded">BTCUSDT</span>
                    <span className="px-2 py-1 bg-slate-800 text-slate-300 rounded">ETHUSDT</span>
                    <span className="px-2 py-1 bg-slate-800 text-slate-300 rounded">SOLUSDT</span>
                    <span className="px-2 py-1 bg-slate-800 text-slate-300 rounded">XRPUSDT</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 p-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-black">
                    <span className="px-2.5 py-1 bg-emerald-500 text-black rounded">★ 1m (1:10 & 1:20 INSIDE)</span>
                    <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/50 rounded">★ 5m (SINGLE 5-MIN)</span>
                    <span className="px-2 py-1 bg-slate-800 text-slate-300 rounded">1s</span>
                    <span className="px-2 py-1 bg-slate-800 text-slate-300 rounded">3m</span>
                    <span className="px-2 py-1 bg-slate-800 text-slate-300 rounded">15m</span>
                  </div>
                </div>
              )}

              {currentStep.stepNumber === 6 && (
                <div className="bg-slate-900/90 border border-emerald-500/50 p-3 rounded-xl space-y-2 text-xs tabular-nums">
                  <div className="flex justify-between items-center">
                    <span className="text-emerald-400 font-black uppercase text-[10px]">Verified Research Parameters</span>
                    <span className="text-[10px] text-slate-400">Q = 50 / |Entry - SL|</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 bg-black rounded border border-slate-800">
                      <div className="text-slate-400 text-[9px]">Entry Price</div>
                      <div className="text-white font-bold">$68,420.00</div>
                    </div>
                    <div className="p-2 bg-black rounded border border-rose-500/30">
                      <div className="text-rose-400 text-[9px]">Stop Loss ($50 Fixed Risk)</div>
                      <div className="text-rose-300 font-bold">$68,370.00 (Δ $50.00)</div>
                    </div>
                    <div className="p-2 bg-black rounded border border-emerald-500/30">
                      <div className="text-emerald-400 text-[9px]">★ 1:10 Target (+$500)</div>
                      <div className="text-emerald-300 font-bold">$68,920.00</div>
                    </div>
                    <div className="p-2 bg-black rounded border border-fuchsia-500/30">
                      <div className="text-fuchsia-400 text-[9px]">★ 1:20 Target (+$1,000)</div>
                      <div className="text-fuchsia-300 font-bold">$69,420.00</div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep.stepNumber === 7 && (
                <div className="bg-black border border-cyan-500/40 p-3.5 rounded-xl space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-cyan-300 font-bold">1-by-1 Forward Stepper & Micro Terminal</span>
                    <span className="text-emerald-400 font-mono text-[10px]">Zero-Lookahead Active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1 bg-amber-500 text-black font-black rounded text-[11px] shadow">
                      +1 CANDLE (1-BY-1)
                    </button>
                    <button className="px-3 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded text-[11px]">
                      1s MICRO TERMINAL (60×1s)
                    </button>
                    <span className="text-slate-400 text-[10px]">Keyboard: ➔ Key</span>
                  </div>
                  <div className="p-2 bg-slate-900 rounded text-[10px] text-slate-300">
                    Terminal 0 Origin at s12/60s · 1:1, 1:10, 1:20 verified in active 1-minute container.
                  </div>
                </div>
              )}

              {currentStep.stepNumber === 8 && (
                <div className="p-4 bg-gradient-to-r from-emerald-950/40 to-cyan-950/40 border border-emerald-500/40 rounded-xl space-y-3 text-center">
                  <div className="w-10 h-10 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/50">
                    <Tv className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-black text-white uppercase">Return to Live Showcase Anytime</div>
                  <p className="text-[11px] text-slate-300 max-w-sm mx-auto">
                    Click "LIVE SHOWCASE" in the top bar to return to the 30-second automated queue. Your interactive work remains safely saved in your session.
                  </p>
                </div>
              )}
            </div>

            {/* Simulated Status Bar Footer */}
            <div className="border-t border-slate-800/80 pt-2 flex items-center justify-between text-[10px] text-slate-400 font-mono">
              <span>● Bybit 0.1s Stream</span>
              <span>100% Deterministic Mechanism</span>
              <span>Isolated Sandbox Verified</span>
            </div>
          </div>
        </div>

        {/* Footer Playback Controls */}
        <div className="bg-[#0b1222] border-t border-slate-800 px-5 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAutoPlaying(p => !p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1.5 border transition-all ${
                isAutoPlaying
                  ? 'bg-amber-500 text-black border-amber-300'
                  : 'bg-slate-900 text-slate-300 border-slate-700 hover:text-white'
              }`}
            >
              {isAutoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isAutoPlaying ? 'PAUSE AUTO' : 'AUTO-PLAY'}</span>
            </button>

            <button
              onClick={() => {
                setCurrentStepIndex(0);
                setIsAutoPlaying(true);
              }}
              className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg border border-slate-700"
              title="Restart Tutorial from Step 1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={currentStepIndex === 0}
              onClick={() => {
                setCurrentStepIndex(p => Math.max(0, p - 1));
                setIsAutoPlaying(false);
              }}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-300 rounded-lg text-xs font-bold border border-slate-700 flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>{langMode === 'HI' ? 'पिछला' : 'Prev'}</span>
            </button>

            <button
              onClick={() => {
                if (currentStepIndex < TUTORIAL_STEPS.length - 1) {
                  setCurrentStepIndex(p => p + 1);
                  setIsAutoPlaying(false);
                } else {
                  onClose();
                  if (onOpenConnectModal) onOpenConnectModal();
                }
              }}
              className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-black rounded-lg text-xs font-black flex items-center gap-1 shadow-md"
            >
              <span>
                {currentStepIndex < TUTORIAL_STEPS.length - 1
                  ? langMode === 'HI' ? 'अगला भाग' : 'Next Step'
                  : langMode === 'HI' ? 'समाप्त करें / Connect' : 'Complete & Connect'}
              </span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
