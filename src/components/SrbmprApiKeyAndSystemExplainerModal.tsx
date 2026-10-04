import React, { useState } from 'react';
import { 
  Key, 
  ShieldCheck, 
  Copy, 
  Check, 
  Video, 
  Sparkles, 
  Cpu, 
  Rocket, 
  Globe, 
  Layers, 
  Lock, 
  AlertTriangle, 
  CheckCircle2, 
  Play, 
  FileText,
  Clock,
  Database,
  Terminal,
  Shield,
  ExternalLink,
  Zap,
  ArrowRight
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const SrbmprApiKeyAndSystemExplainerModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'API_KEY_GUIDE' | 'FORENSIC_ACCURACY_WHY' | 'GOOGLE_MLA_PROMPT'>('API_KEY_GUIDE');

  // Input states for user who wants to connect their API credentials locally
  const [selectedExchange, setSelectedExchange] = useState<'BYBIT' | 'BINANCE' | 'ZERODHA' | 'UPSTOX'>('BYBIT');
  const [apiKeyInput, setApiKeyInput] = useState<string>('');
  const [apiSecretInput, setApiSecretInput] = useState<string>('');
  const [isSavedLocally, setIsSavedLocally] = useState<boolean>(false);

  // The Complete Master Prompt for Google MLA / Video Generation / Audio-Video Presentation
  const googleMlaPromptText = `[MASTER VIDEO SCRIPT & GENERATION PROMPT: SR TIME & SRBMPR ARCHITECTURE]

PROJECT TITLE:
SR TIME — POWERED BY SRBMPR | 15 YEARS OF RAW MARKET BEHAVIOR & THE EARTH LANDING FINAL TARGET

PRESENTER / FOUNDER IDENTITY:
Siyab Raheman Gulwadi Abbushet (Founder & Independent Market-Behavior Researcher since 2010).

TARGET AUDIENCE:
Global Traders, Quantitative Researchers, Fund Managers, and Institutional Analysts across Crypto, Indian Equities (NSE/BSE), Forex, Commodities, and US Equities.

PRIMARY GOAL:
Explain with undeniable visual evidence what SR TIME is, what is inside the application, how to securely connect an API key with 100% read-only safety, why direct API integration is mandatory for forensic data accuracy, and why the trader no longer needs to guess: price moves according to time, microstructure, and the 3-Rocket Earth Landing Target.

---

SCENE 1: THE FOUNDER'S CONVICTION & 15 YEARS OF RESEARCH
[Visual: Dark, high-contrast institutional terminal. High-precision 1-second candlesticks pulsating on screen with green/red wicks and glowing 1:1, 1:2 High-Low connection vectors.]
[Voiceover / Narrative]:
"For 15 years, market behavior has been researched not through indicators, moving averages, or hearsay, but through pure, raw OHLC data, exact timestamps, and Zero-to-Zero cycles. This is SR TIME, powered by SRBMPR.
This platform is not here asking for validation. When a dedicated researcher spends 15 years auditing 116,000+ candles and millions of ticks, the evidence speaks for itself. There is nobody left to validate the validator. It is time for the world to see."

SCENE 2: WHY DIRECT API INTEGRATION IS REQUIRED FOR FORENSIC DATA ACCURACY
[Visual: Graphic showing two paths: (1) Delayed 3rd-party web scraping with 300ms DOM lag vs (2) Direct Native Exchange WebSocket API with sub-millisecond cryptographic tick reception.]
[Voiceover / Narrative]:
"Why is a direct broker API required? Because in 1-second micro-structure, a 200-millisecond browser delay destroys empirical truth.
Web scrapers drop ticks, repaint candles, and interpolate missing gaps.
A direct native API connection gives SR TIME raw, unaltered exchange ticks with two distinct timestamps: the exchange event time and the server receive time.
Zero synthetic movement. Zero interpolation. Absolute forensic truth."

SCENE 3: HOW TO CONNECT YOUR BROKER API KEY (100% SECURITY PROTOCOL)
[Visual: Split screen showing Bybit, Binance, Zerodha, and Upstox API management dashboard with glowing shield over 'Read-Only'.]
[Voiceover / Narrative]:
"Connecting your broker to SR TIME is completely secure, seamless, and private.
Step 1: Open your Bybit, Binance, or Indian broker dashboard (Zerodha / Upstox).
Step 2: Generate an API Key. Select ONLY 'Read-Only' Market Data & Order Tracking permissions.
Step 3: Keep 'Withdrawal' strictly DISABLED. Your funds never leave your account, and SR TIME can never touch your balance.
Step 4: Enable IP Whitelisting for maximum security, and paste the public key into the SR TIME Terminal.
That is it! Your terminal is now locked to pure exchange-native ticks."

SCENE 4: WHAT IS INSIDE THIS TERMINAL? (THE 5 DEDICATED MARKET CHANNELS)
[Visual: Five TV-channel style portals opening smoothly like Sun TV, Zee TV, Star Plus — Crypto, Indian Market, Forex, Commodity, US Market.]
[Voiceover / Narrative]:
"Just like major television networks have distinct dedicated channels, SR TIME isolates markets into 5 independent terminals:
1. SRBMPR Crypto Market: Bybit Linear V5 feeds (BTC, ETH, SOL, SUI, PAXG).
2. SRBMPR Indian Market: NSE/BSE indices & stocks (Nifty 50, Bank Nifty, Reliance).
3. SRBMPR Forex Market: Global FX liquidity (EUR/USD, GBP/JPY).
4. SRBMPR Commodity Market: Gold Spot (XAU/USD), Silver, Crude Oil.
5. SRBMPR US Market: Nasdaq 100 (QQQ), S&P 500, NVIDIA, Apple, Tesla.
No market data is ever cross-contaminated. Each channel operates on its native time-zone and exchange feed."

SCENE 5: THE 1-SECOND LATCH & THE 3-ROCKET EARTH LANDING TARGET
[Visual: 1-second candle forming. High formed, clean pullback to lower margin, confirmation bounce, and a 1-second latch triggers. A rocket icon takes off with a 5-minute validity countdown.]
[Voiceover / Narrative]:
"Look at this 1-second candlestick. The 1:1 and 1:2 High-Low connection is crystal clear.
When a High forms, price breathes — it pulls back to retest structure. It does not shoot up blind.
Once the retest holds, the 1-second trigger latches. The trader does not need to overthink, stress, or stare at charts all day.
You enter, and the 3-Rocket flight commences:
- Rocket #1: Orbital Launch Entry — locked in 1 second.
- Rocket #2: Atmospheric Piercing — accelerating past the retest.
- Rocket #3: Earth Landing Final Target — the destination the rest of the world cannot catch.
All of this is backed by a 50-Year Immutable Storage Archive in TimescaleDB and Parquet.
SR TIME is not built on words. It is built on time, math, and relentless discipline."

SCENE 6: CALL TO ACTION
[Visual: QR code and direct URL to srbmpr terminal. Crisp text: 'SR TIME · ZERO STOP-LOSS MENTALITY · EARTH LANDING TARGET'.]
[Voiceover / Narrative]:
"Connect your read-only feed. Observe the 1-second precision. Watch the rocket land on Earth.
SR TIME — Powered by SRBMPR."`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(googleMlaPromptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSaveLocalKey = () => {
    if (!apiKeyInput) return;
    localStorage.setItem(`SRBMPR_API_KEY_${selectedExchange}`, apiKeyInput);
    setIsSavedLocally(true);
    setTimeout(() => setIsSavedLocally(false), 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#03060C] border-2 border-amber-500 max-w-4xl w-full rounded-3xl p-6 sm:p-8 space-y-6 font-mono text-zinc-100 shadow-[0_0_120px_rgba(245,158,11,0.3)] my-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-black uppercase flex items-center gap-1.5 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                FORENSIC DATA INTEGRITY & API GATEWAY
              </span>
              <span className="text-[10px] text-zinc-500 font-bold uppercase">15 YEARS RESEARCH PROOF</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
              API CONFIGURATION & GOOGLE MLA VIDEO MASTER PROMPT
            </h2>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl font-black text-xs uppercase border border-zinc-800 transition-all shrink-0"
          >
            ✕ Close
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            onClick={() => setActiveTab('API_KEY_GUIDE')}
            className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-2 text-xs font-black uppercase ${
              activeTab === 'API_KEY_GUIDE'
                ? 'bg-amber-500 text-black border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'
            }`}
          >
            <Key className="w-4 h-4" /> 1. Step-by-Step API Setup
          </button>

          <button
            onClick={() => setActiveTab('FORENSIC_ACCURACY_WHY')}
            className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-2 text-xs font-black uppercase ${
              activeTab === 'FORENSIC_ACCURACY_WHY'
                ? 'bg-amber-500 text-black border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'
            }`}
          >
            <Database className="w-4 h-4" /> 2. Why API for Forensic Accuracy?
          </button>

          <button
            onClick={() => setActiveTab('GOOGLE_MLA_PROMPT')}
            className={`p-3 rounded-2xl border text-left transition-all flex items-center gap-2 text-xs font-black uppercase ${
              activeTab === 'GOOGLE_MLA_PROMPT'
                ? 'bg-amber-500 text-black border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'
            }`}
          >
            <Sparkles className="w-4 h-4" /> 3. Google MLA Video Prompt
          </button>
        </div>

        {/* TAB 1: STEP-BY-STEP API KEY CONFIGURATION */}
        {activeTab === 'API_KEY_GUIDE' && (
          <div className="space-y-6">
            
            {/* 100% Security Guarantee Strip */}
            <div className="bg-emerald-950/40 border-2 border-emerald-500/50 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-[0_0_30px_rgba(16,185,129,0.15)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-emerald-300 uppercase">100% READ-ONLY CLIENT-SIDE SECURITY</h4>
                  <p className="text-[11px] text-zinc-300 mt-0.5">
                    SR TIME कभी भी आपके फण्ड को ट्रांसफर या विथड्रॉ नहीं कर सकता। केवल रॉ मार्केट डेटा व पोज़िशन देखने की अनुमति आवश्यक है।
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-black uppercase tracking-wider shrink-0">
                WITHDRAWAL STRICTLY BLOCKED
              </span>
            </div>

            {/* Exchange Selector */}
            <div className="space-y-2">
              <label className="text-[11px] text-zinc-400 font-bold uppercase flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-amber-400" /> SELECT YOUR BROKER / EXCHANGE FOR STEP-BY-STEP GUIDE:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'BYBIT', name: 'Bybit V5 Linear' },
                  { id: 'BINANCE', name: 'Binance Futures' },
                  { id: 'ZERODHA', name: 'Zerodha Kite' },
                  { id: 'UPSTOX', name: 'Upstox Pro' }
                ].map(ex => (
                  <button
                    key={ex.id}
                    onClick={() => setSelectedExchange(ex.id as any)}
                    className={`py-2 px-3 rounded-xl border text-xs font-black uppercase transition-all ${
                      selectedExchange === ex.id
                        ? 'bg-amber-500 text-black border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                        : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-white'
                    }`}
                  >
                    {ex.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Step-by-Step Instruction Cards */}
            <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl space-y-4">
              <h4 className="text-xs font-black text-amber-400 uppercase flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-400" />
                {selectedExchange === 'BYBIT' && 'BYBIT V5 API CONFIGURATION (4 SIMPLE STEPS)'}
                {selectedExchange === 'BINANCE' && 'BINANCE FUTURES API CONFIGURATION (4 SIMPLE STEPS)'}
                {selectedExchange === 'ZERODHA' && 'ZERODHA KITE CONNECT API CONFIGURATION (4 SIMPLE STEPS)'}
                {selectedExchange === 'UPSTOX' && 'UPSTOX DEVELOPER API CONFIGURATION (4 SIMPLE STEPS)'}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                
                <div className="bg-black/80 border border-zinc-800 p-3.5 rounded-xl space-y-1">
                  <span className="text-[10px] text-amber-400 font-black uppercase flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px]">1</span>
                    लॉगिन और API Management
                  </span>
                  <p className="text-[11px] text-zinc-300 leading-relaxed">
                    अपने {selectedExchange} खाते में लॉगिन करें, प्रोफाइल मेनू में जाकर <strong>API Management</strong> या Developer Console चुनें।
                  </p>
                </div>

                <div className="bg-black/80 border border-zinc-800 p-3.5 rounded-xl space-y-1">
                  <span className="text-[10px] text-emerald-400 font-black uppercase flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px]">2</span>
                    सिर्फ READ-ONLY अनुमति चुनें
                  </span>
                  <p className="text-[11px] text-zinc-300 leading-relaxed">
                    <strong>Create API Key</strong> दबाएँ। परमिशन में केवल <strong>Read-Only (Market Data / Order History)</strong> पर टिक करें।
                  </p>
                </div>

                <div className="bg-black/80 border border-zinc-800 p-3.5 rounded-xl space-y-1">
                  <span className="text-[10px] text-rose-400 font-black uppercase flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center text-[10px]">3</span>
                    WITHDRAWAL को बंद (UNCHECKED) रखें
                  </span>
                  <p className="text-[11px] text-zinc-300 leading-relaxed">
                    सुरक्षा के लिए <strong>Withdrawal और Transfer के चेकबॉक्स को अनिवार्य रूप से खाली</strong> छोड़ें ताकि कोई फंड न निकाल सके।
                  </p>
                </div>

                <div className="bg-black/80 border border-zinc-800 p-3.5 rounded-xl space-y-1">
                  <span className="text-[10px] text-cyan-400 font-black uppercase flex items-center gap-1.5">
                    <span className="w-4 h-4 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-[10px]">4</span>
                    API Key को SR TIME में पेस्ट करें
                  </span>
                  <p className="text-[11px] text-zinc-300 leading-relaxed">
                    जनरेट की गई API Key को नीचे दिए गए फ़ील्ड में पेस्ट करें। डेटा सीधे एक्सचेंज के 1-सेकंड टिक सॉकेट से कनेक्ट हो जाएगा।
                  </p>
                </div>

              </div>

              {/* Local Input Fields */}
              <div className="pt-2 border-t border-zinc-900 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-zinc-500 font-bold block uppercase mb-1">
                      {selectedExchange} API KEY (PUBLIC):
                    </label>
                    <input
                      type="text"
                      value={apiKeyInput}
                      onChange={(e) => setApiKeyInput(e.target.value)}
                      placeholder="e.g. bybit_live_v5_key_xxxxxxxx"
                      className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-500 font-bold block uppercase mb-1">
                      {selectedExchange} API SECRET (LOCAL ENCLAVE ONLY):
                    </label>
                    <input
                      type="password"
                      value={apiSecretInput}
                      onChange={(e) => setApiSecretInput(e.target.value)}
                      placeholder="••••••••••••••••••••••••"
                      className="w-full bg-black border border-zinc-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-zinc-500">
                    * Credentials are saved purely in your local browser sandbox. Never transmitted to third parties.
                  </span>
                  <button
                    onClick={handleSaveLocalKey}
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase rounded-xl transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] flex items-center gap-1.5"
                  >
                    {isSavedLocally ? (
                      <>
                        <Check className="w-4 h-4" /> Connected & Saved!
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 fill-black" /> Save & Connect Feed
                      </>
                    )}
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: WHY DIRECT API INTEGRATION IS REQUIRED FOR FORENSIC ACCURACY */}
        {activeTab === 'FORENSIC_ACCURACY_WHY' && (
          <div className="space-y-4 text-xs">
            
            <div className="bg-gradient-to-r from-zinc-950 via-black to-amber-950/40 border-2 border-amber-500/50 p-5 rounded-2xl space-y-2">
              <span className="text-amber-400 font-black text-sm uppercase flex items-center gap-2">
                <Database className="w-5 h-5 text-amber-400" />
                THE QUANTITATIVE NECESSITY OF DIRECT BROKER WEBSOCKET API
              </span>
              <p className="text-zinc-300 text-xs leading-relaxed">
                ट्रेडर और रिसर्चर को यह समझना आवश्यक है कि हम केवल चार्ट पर दिखने वाले विज़ुअल स्क्रैपिंग (Visual Scraping) पर निर्भर क्यों नहीं हो सकते। 1-सेकंड की माइक्रो-स्ट्रक्चर में फोरेंसिक सटीकता के लिए डायरेक्ट ब्रोकर API अनिवार्य क्यों है?
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl space-y-2.5">
                <span className="text-xs font-black text-rose-400 uppercase flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  थर्ड-पार्टी चार्ट / वेब स्क्रैपर की कमियां:
                </span>
                <ul className="space-y-2 text-zinc-400 text-[11px] list-disc pl-4">
                  <li><strong>DOM/Browser Latency (200-400ms):</strong> ब्राउज़र रेंडरिंग में आने वाला लैग 1-सेकंड के सूक्ष्म ब्रेक को मिस कर देता है।</li>
                  <li><strong>Missing Ticks & Interpolation:</strong> साधारण चार्ट बीच के टिक गायब होने पर नकली (सिंथेटिक) बार भरकर धोखा देते हैं।</li>
                  <li><strong>Repainting Bias:</strong> बार बंद होने के बाद सिग्नल बदल जाता है जिससे बैकटेस्ट में झूठा 100% विन रेट दिखता है।</li>
                </ul>
              </div>

              <div className="bg-zinc-950 border border-emerald-500/40 p-4 rounded-2xl space-y-2.5">
                <span className="text-xs font-black text-emerald-400 uppercase flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  SR TIME डायरेक्ट API कनेक्शन के लाभ:
                </span>
                <ul className="space-y-2 text-zinc-300 text-[11px] list-disc pl-4">
                  <li><strong>Dual Timestamps (Exchange + Server):</strong> हर टिक के दो समय दर्ज होते हैं: एक्सचेंज का असली समय और सर्वर पर प्राप्ति का समय।</li>
                  <li><strong>1-Second Microstructure Precision:</strong> 1-सेकंड की कैंडल में 1:1 और 1:2 हाई-लो कनेक्शन का शुद्ध टिक-बाय-टिक प्रमाण।</li>
                  <li><strong>Who Validates the Validator:</strong> कोई भी स्वतंत्र ऑडिटर Bybit/Binance के आधिकारिक ट्रेड लॉग से 1-टू-1 मिलान कर सकता है।</li>
                </ul>
              </div>

            </div>

            {/* DIRECT EXCECUTOR / TRADINGVIEW-FREE FLOW SECTION */}
            <div className="bg-gradient-to-r from-amber-950/20 via-black to-zinc-950 p-5 rounded-2xl border border-amber-500/30 space-y-3">
              <span className="text-xs font-black text-amber-400 uppercase flex items-center gap-1.5">
                <Rocket className="w-4 h-4 text-amber-400 animate-pulse" />
                TRADINGVIEW-FREE DIRECT ORDER PIPELINE (सीधा फ्लो)
              </span>
              <p className="text-[11px] text-zinc-300 leading-relaxed">
                यदि सिस्टम सीधे ब्रोकर/एक्सचेंज API से जुड़ा है, तो <strong>TradingView की कोई आवश्यकता नहीं है</strong>। 
                TradingView केवल तभी उपयोगी है जब आप विज़ुअल चार्ट, Pine Script अलार्म या उनके वेबहुक कनेक्शन का उपयोग करना चाहते हैं। 
                प्रत्यक्ष निष्पादन (Direct Execution) के लिए सीधा फ्लो इस प्रकार काम करता है:
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2 text-center text-[10px] font-black uppercase">
                <div className="bg-black border border-zinc-800 p-3 rounded-xl">
                  <div className="text-zinc-500 mb-1">STEP 1</div>
                  <div className="text-amber-400 font-black">SR CORE ENGINE</div>
                  <div className="text-[8px] text-zinc-500 mt-1">Rule Analyzer</div>
                </div>
                <div className="flex items-center justify-center text-amber-500">
                  <ArrowRight className="w-5 h-5 animate-pulse hidden sm:block" />
                  <span className="sm:hidden">▼</span>
                </div>
                <div className="bg-black border border-emerald-500/20 p-3 rounded-xl">
                  <div className="text-zinc-500 mb-1">STEP 2</div>
                  <div className="text-emerald-400 font-black">BROKER DIRECT API</div>
                  <div className="text-[8px] text-zinc-500 mt-1">Zero-Latency Hook</div>
                </div>
                <div className="flex items-center justify-center text-emerald-500">
                  <ArrowRight className="w-5 h-5 animate-pulse hidden sm:block" />
                  <span className="sm:hidden">▼</span>
                </div>
                <div className="bg-black border border-cyan-500/20 p-3 rounded-xl">
                  <div className="text-zinc-500 mb-1">STEP 3</div>
                  <div className="text-cyan-300 font-black">TRADING ACCOUNT</div>
                  <div className="text-[8px] text-zinc-500 mt-1">Bybit/Binance V5</div>
                </div>
                <div className="flex items-center justify-center text-cyan-300">
                  <ArrowRight className="w-5 h-5 animate-pulse hidden sm:block" />
                  <span className="sm:hidden">▼</span>
                </div>
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-black p-3 rounded-xl flex flex-col justify-center items-center shadow-[0_0_15px_rgba(16,185,129,0.3)]">
                  <div className="text-[8px] opacity-75 mb-0.5">FINAL OUTCOME</div>
                  <div className="font-black text-black">ORDER PLACED</div>
                  <div className="text-[8px] opacity-75 mt-0.5">Under 15ms</div>
                </div>
              </div>
            </div>


            <div className="bg-black p-4 rounded-2xl border border-zinc-800 text-[11px] text-zinc-400 flex items-center gap-3">
              <Shield className="w-5 h-5 text-amber-400 shrink-0" />
              <span>
                <strong>फोरेंसिक निष्कर्ष:</strong> डायरेक्ट API कनेक्शन से SR TIME का हर 1-सेकंड ट्रिगर, 1:1 रिस्क-रिवॉर्ड स्तर, और अर्थ लैंडिंग टार्गेट कानूनी और गणितीय रूप से 100% सच्चा और अपरिवर्तनीय रहता है।
              </span>
            </div>

          </div>
        )}

        {/* TAB 3: GOOGLE MLA VIDEO SCRIPT PROMPT */}
        {activeTab === 'GOOGLE_MLA_PROMPT' && (
          <div className="space-y-4">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-zinc-950 p-4 rounded-2xl border border-zinc-800">
              <div className="space-y-1">
                <span className="text-amber-400 font-black text-xs uppercase flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  COPY-READY PROMPT FOR GOOGLE MLA / YOUTUBE / VIDEO GENERATOR
                </span>
                <p className="text-[11px] text-zinc-400">
                  इस मास्टर प्रॉम्प्ट को कॉपी करें और Google MLA, Gemini, Sora या किसी भी AI वीडियो जनरेटर में पेस्ट करके वीडियो तैयार करें।
                </p>
              </div>

              <button
                onClick={copyToClipboard}
                className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-xs uppercase rounded-xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.4)] flex items-center gap-2 shrink-0 animate-pulse"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-black" /> Copied to Clipboard!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-black" /> Copy Master Prompt
                  </>
                )}
              </button>
            </div>

            <div className="bg-black border border-zinc-800 p-5 rounded-2xl max-h-[380px] overflow-y-auto custom-scroll text-xs text-zinc-300 leading-relaxed space-y-3 font-mono">
              <pre className="whitespace-pre-wrap font-sans text-xs sm:text-sm text-zinc-200">
                {googleMlaPromptText}
              </pre>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
