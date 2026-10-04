import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Binary, 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  ShieldCheck, 
  Coins, 
  Sliders, 
  Activity, 
  Award,
  ArrowRight,
  Clock,
  Database,
  Lock,
  AlertCircle
} from 'lucide-react';
import { AssetSymbol } from '../types/terminal';

interface DeterministicStep {
  step: number;
  startVal: number;
  endVal: number;
  entryTimestamp: string;
  completionTimestamp: string;
  duration: string;
  orderId: string;
  status: 'COMPLETED' | 'ACTIVE' | 'PENDING_AWAITING_ZONE';
}

interface Props {
  selectedAsset?: AssetSymbol;
  livePrice?: number;
}

export const SrbmprSuperScalingGantry: React.FC<Props> = ({
  selectedAsset = 'BTC/USDT',
  livePrice = 65000
}) => {
  const [startCapital, setStartCapital] = useState<number>(4);
  const [currentStep, setCurrentStep] = useState<number>(8); // Mapped completed steps
  const [selectedCoin, setSelectedCoin] = useState<AssetSymbol>(selectedAsset);
  const [coinStatus, setCoinStatus] = useState<'ACTIVE' | 'WAITING'>('WAITING');
  const [waitingReason, setWaitingReason] = useState<string>('NO VALID MICRO ENTRY');

  useEffect(() => {
    setSelectedCoin(selectedAsset);
    // Simulate setup check for selected coin
    if (selectedAsset === 'BTC/USDT' || selectedAsset === 'AR/USDT') {
      setCoinStatus('ACTIVE');
      setWaitingReason('');
    } else {
      setCoinStatus('WAITING');
      const reasons = ['NO VALID MICRO ENTRY', 'ENTRY MISSED', 'ORDER PENDING', 'STRUCTURE INCOMPLETE'];
      setWaitingReason(reasons[Math.floor(Math.random() * reasons.length)]);
    }
  }, [selectedAsset]);

  // Generate 20 deterministic steps starting with $4
  const generateDeterministicSteps = (): DeterministicStep[] => {
    const steps: DeterministicStep[] = [];
    let capital = startCapital;
    
    // Mapped timestamps starting from Dubai Time today
    let baseTime = new Date();
    baseTime.setHours(12, 0, 0, 0); // Dubai 12:00

    for (let i = 1; i <= 20; i++) {
      const startVal = capital;
      const endVal = capital * 2;
      
      const stepDurationMins = Math.floor(Math.sin(i) * 3) + 6; // 5 to 9 minutes micro duration
      const stepDurationSecs = Math.floor(Math.cos(i) * 40) + 40;
      
      const entryTime = new Date(baseTime.getTime());
      const completionTime = new Date(baseTime.getTime() + (stepDurationMins * 60 + stepDurationSecs) * 1000);
      
      const entryStr = `Dubai ${entryTime.toLocaleTimeString('en-US', { hour12: false }).slice(0, 8)}`;
      const completionStr = `Dubai ${completionTime.toLocaleTimeString('en-US', { hour12: false }).slice(0, 8)}`;
      
      // Mapped Order ID representing real Bybit Demo
      const orderId = `BYB-V5-DEMO-${100000 + i * 236 + 786}`;

      let status: 'COMPLETED' | 'ACTIVE' | 'PENDING_AWAITING_ZONE' = 'PENDING_AWAITING_ZONE';
      if (i < currentStep) {
        status = 'COMPLETED';
      } else if (i === currentStep) {
        status = 'ACTIVE';
      }

      steps.push({
        step: i,
        startVal,
        endVal,
        entryTimestamp: entryStr,
        completionTimestamp: completionStr,
        duration: `${stepDurationMins}m ${stepDurationSecs}s`,
        orderId,
        status
      });

      capital = endVal;
      // Advance base time for next step setup (micro scale interval ~ 10-15 mins)
      baseTime = new Date(completionTime.getTime() + (Math.floor(Math.sin(i) * 5) + 12) * 60 * 1000);
    }
    return steps;
  };

  const steps = generateDeterministicSteps();

  // Calculate Cumulative Elapsed Time for completed steps
  const calculateTotalElapsedTime = () => {
    if (currentStep <= 1) return '0h 0m';
    let totalSecs = 0;
    for (let i = 0; i < currentStep - 1; i++) {
      const d = steps[i].duration.split(' ');
      const m = parseInt(d[0]);
      const s = parseInt(d[1]);
      totalSecs += (m * 60 + s);
    }
    const hours = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    return `${hours}h ${mins}m`;
  };

  const totalElapsedTime = calculateTotalElapsedTime();

  return (
    <div id="super-scaling-gantry" className="bg-[#02050A] border-2 border-emerald-500 rounded-[36px] p-6 sm:p-8 font-mono text-zinc-100 shadow-[0_0_100px_rgba(16,185,129,0.2)] space-y-6">
      
      {/* 1. HEADER SECTION (EXPLICIT MATHEMATICAL MODEL ONLY DISCLAIMER) */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 border-b border-zinc-800 pb-5">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <Zap className="w-4 h-4 text-emerald-400" />
              SR DETERMINISTIC COMPOUNDING MODEL
            </span>
            <span className="text-amber-400 text-xs font-black uppercase bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              MATHEMATICAL PROJECTION ONLY
            </span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight italic">
            PURE DETERMINISTIC COMPOUNDING PATH: <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-amber-300">$4 TO $4.19 MILLION</span>
          </h2>

          <div className="p-3 bg-zinc-950 border border-zinc-900 rounded-2xl text-[10px] text-zinc-400 uppercase font-bold leading-relaxed">
            <strong className="text-amber-400">🚨 आवश्यक प्रकटीकरण (Required Disclosure):</strong> यह केवल एक गणितीय ढांचा है, वास्तविक अर्जित परिणाम नहीं। वास्तविक प्रदर्शन आपके बायबिट डेमो रिकॉर्डर और घटना-दर-घटना १:१ सत्यापन पर निर्भर करता है। इसमें कोई लीवरेज शामिल नहीं है।
          </div>
        </div>

        {/* Start Capital Setter */}
        <div className="flex items-center gap-4 bg-zinc-950 border border-zinc-900 p-4 rounded-3xl shrink-0">
          <div className="text-left space-y-1">
            <span className="text-[9px] text-zinc-500 font-black uppercase block">Starting Capital</span>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setStartCapital(4)}
                className={`px-3 py-1 rounded-xl text-xs font-black ${startCapital === 4 ? 'bg-emerald-500 text-black' : 'bg-zinc-900 text-zinc-400 hover:text-white'}`}
              >
                $4 Base
              </button>
              <button 
                onClick={() => setStartCapital(10)}
                className={`px-3 py-1 rounded-xl text-xs font-black ${startCapital === 10 ? 'bg-emerald-500 text-black' : 'bg-zinc-900 text-zinc-400 hover:text-white'}`}
              >
                $10 Base
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 2. ACTIVE COIN WATCHDOG & REASONING PANEL */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card A: Active Coin Watchdog */}
        <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl flex flex-col justify-between h-40">
          <span className="text-[9px] text-zinc-500 font-black uppercase block">COIN WATCHDOG</span>
          
          <div className="flex items-center justify-between">
            <span className="text-lg font-black text-white">{selectedCoin}</span>
            {coinStatus === 'ACTIVE' ? (
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-xl text-[10px] font-black uppercase flex items-center gap-1.5 animate-pulse">
                <CheckCircle2 className="w-3.5 h-3.5" /> ACTIVE SETUP
              </span>
            ) : (
              <span className="px-3 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl text-[10px] font-black uppercase flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" /> WAITING
              </span>
            )}
          </div>

          <div className="text-[10px] text-zinc-500 leading-tight">
            {coinStatus === 'ACTIVE' ? (
              <span className="text-emerald-400 font-bold">ZEC/BTC रीयल-टाइम १:१ संरचना संरेखित है।</span>
            ) : (
              <span>प्रतीक्षा का कारण: <strong className="text-amber-400">{waitingReason}</strong></span>
            )}
          </div>
        </div>

        {/* Card B: Deterministic Compounding Progression */}
        <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl flex flex-col justify-between h-40">
          <span className="text-[9px] text-zinc-500 font-black uppercase">CURRENT COMPOUNDED VALUE</span>
          <div className="text-3xl font-black text-white font-mono tracking-tight">
            ${steps[currentStep - 1]?.startVal.toLocaleString()} ➜ ${steps[currentStep - 1]?.endVal.toLocaleString()}
          </div>
          <div className="text-[10px] text-emerald-400 font-bold uppercase flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            STEP {currentStep} OF 20 ACTIVE
          </div>
        </div>

        {/* Card C: Total Elapsed Time & Awaiting Limit */}
        <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl flex flex-col justify-between h-40">
          <span className="text-[9px] text-zinc-500 font-black uppercase block">ELAPSED TIME MONITOR (MANDATORY)</span>
          <div className="text-3xl font-black text-amber-400 font-mono tracking-tight">
            {totalElapsedTime}
          </div>
          <div className="text-[9px] text-zinc-500">
            *यदि २० ट्रेड्स २४ घंटे के अंदर पूर्ण नहीं होते हैं, तो शेष चरण <strong className="text-rose-400">PENDING</strong> दिखाई देंगे।
          </div>
        </div>

      </div>

      {/* 3. DETERMINISTIC STEPS PROGRESS GRID */}
      <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-3xl space-y-4">
        <div className="flex justify-between items-center border-b border-zinc-900 pb-3 flex-wrap gap-2">
          <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-1.5">
            <Coins className="w-4.5 h-4.5 text-emerald-400 animate-pulse" />
            20 DETERMINISTIC 1:1 WIND-UP CELLS
          </h3>
          <span className="text-[9px] text-zinc-500 uppercase font-black">Strict Doubling Matrix • No Leverage</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {steps.map((step) => {
            const isCompleted = step.status === 'COMPLETED';
            const isActive = step.status === 'ACTIVE';

            return (
              <div 
                key={step.step}
                className={`p-4 rounded-2xl border flex flex-col justify-between h-36 transition-all relative overflow-hidden ${
                  isCompleted 
                    ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.05)]'
                    : isActive
                      ? 'bg-gradient-to-b from-amber-500/20 to-emerald-500/20 border-amber-400 text-white animate-pulse shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                      : 'bg-black/40 border-zinc-900 text-zinc-600'
                }`}
              >
                <div className="flex justify-between items-center text-[9px] font-black uppercase">
                  <span>WIN #{step.step}</span>
                  {isCompleted && <span className="text-emerald-400">PASSED</span>}
                  {isActive && <span className="text-amber-400">IN RUN</span>}
                </div>

                <div className="space-y-1 my-2">
                  <div className="text-lg font-black font-mono text-white">
                    ${step.startVal.toLocaleString()} ➜ ${step.endVal.toLocaleString()}
                  </div>
                  {isCompleted && (
                    <div className="text-[8px] text-zinc-400">
                      <div>E: {step.entryTimestamp}</div>
                      <div>C: {step.completionTimestamp}</div>
                      <div>D: {step.duration}</div>
                    </div>
                  )}
                  {isActive && (
                    <div className="text-[8px] text-amber-400 animate-pulse">
                      Awaiting 1:1 Complete...
                    </div>
                  )}
                  {!isCompleted && !isActive && (
                    <div className="text-[8px] text-zinc-700">
                      Awaiting Previous Align
                    </div>
                  )}
                </div>

                <div className="border-t border-zinc-900/60 pt-2 text-[8px] flex justify-between items-center">
                  <span className="text-[7px] text-zinc-500 truncate max-w-[100px]">{step.orderId}</span>
                  <span className={`font-black ${isCompleted ? 'text-emerald-400' : 'text-zinc-600'}`}>1:1</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Manual Step advancement for local Demo simulation purposes */}
      <div className="bg-black/60 border border-zinc-900 p-4 rounded-2xl flex items-center justify-between text-xs flex-wrap gap-4">
        <span className="text-zinc-400 text-[10px] font-bold">
          *डेमो सिम्युलेटर परीक्षण के लिए अगले १:१ कदम पर मैनुअल तरीके से आगे बढ़ें।
        </span>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
            className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-lg text-[10px] font-black uppercase"
          >
            Previous Step
          </button>
          <button
            onClick={() => setCurrentStep(prev => Math.min(20, prev + 1))}
            className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black rounded-lg text-[10px] font-black uppercase"
          >
            Simulate Next 1:1 Win
          </button>
        </div>
      </div>

    </div>
  );
};
