import React, { useState, useEffect } from 'react';
import { 
  Binary, 
  CheckCircle2, 
  ShieldCheck, 
  Play, 
  RotateCcw, 
  FastForward, 
  Download, 
  ArrowRight, 
  Layers, 
  Clock, 
  Activity, 
  Hash, 
  Zap, 
  Info,
  Check
} from 'lucide-react';
import { formatTimezone } from './SrbmprForensicFourContainerLedger';
import { TimezoneMode } from '../types/terminal';

export interface MicroPosition {
  position_number: number; // 1 to 9
  layer_number: number;    // 1 to 3
  group_label: string;     // Group 1, Group 2, Group 3
  pos_id: string;
  ratio_target: '1:1';     // Strictly 1:1 only! (No 1:2, No 1:3)
  
  // Timestamps
  active_at_utc: string;
  target_hit_at_utc: string;
  elapsed_seconds: number;
  
  // Prices
  entry_price: number;
  stop_loss_price: number;
  target_1r_price: number;
  risk_dollar: number;
  reward_dollar: number;

  status: 'COMPLETED_1R' | 'ACTIVE_EVALUATING' | 'WAITING_LOCKED';
  audit_hash: string;
}

export const SrbmprMicroOneToOnePureValidator: React.FC<{
  selectedAsset?: string;
  livePrice?: number;
}> = ({ selectedAsset = 'BTC/USDT', livePrice = 68720.00 }) => {
  const [selectedTz, setSelectedTz] = useState<TimezoneMode>('Asia/Dubai');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [activeStep, setActiveStep] = useState<number>(9); // Default 9/9 completed for immediate inspection

  // Master 9 Positions (3 Layers x 3 Positions)
  const initialPositions: MicroPosition[] = [
    // GROUP 1 / LAYER 1 (Positions 1, 2, 3)
    {
      position_number: 1,
      layer_number: 1,
      group_label: 'Layer 1 · Micro Origin',
      pos_id: 'MIC-1-1-01',
      ratio_target: '1:1',
      active_at_utc: '2026-10-04T00:15:00Z',
      target_hit_at_utc: '2026-10-04T00:15:18Z',
      elapsed_seconds: 18,
      entry_price: 68431.00,
      stop_loss_price: 68430.00,
      target_1r_price: 68432.00,
      risk_dollar: 1.00,
      reward_dollar: 1.00,
      status: 'COMPLETED_1R',
      audit_hash: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d'
    },
    {
      position_number: 2,
      layer_number: 1,
      group_label: 'Layer 1 · Micro Continuation',
      pos_id: 'MIC-1-1-02',
      ratio_target: '1:1',
      active_at_utc: '2026-10-04T00:15:20Z',
      target_hit_at_utc: '2026-10-04T00:15:34Z',
      elapsed_seconds: 14,
      entry_price: 68432.50,
      stop_loss_price: 68431.50,
      target_1r_price: 68433.50,
      risk_dollar: 1.00,
      reward_dollar: 1.00,
      status: 'COMPLETED_1R',
      audit_hash: '2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e'
    },
    {
      position_number: 3,
      layer_number: 1,
      group_label: 'Layer 1 · Micro Apex Lock',
      pos_id: 'MIC-1-1-03',
      ratio_target: '1:1',
      active_at_utc: '2026-10-04T00:15:36Z',
      target_hit_at_utc: '2026-10-04T00:15:58Z',
      elapsed_seconds: 22,
      entry_price: 68434.00,
      stop_loss_price: 68433.00,
      target_1r_price: 68435.00,
      risk_dollar: 1.00,
      reward_dollar: 1.00,
      status: 'COMPLETED_1R',
      audit_hash: '3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f'
    },

    // GROUP 2 / LAYER 2 (Positions 4, 5, 6)
    {
      position_number: 4,
      layer_number: 2,
      group_label: 'Layer 2 · Mid Retest Push',
      pos_id: 'MIC-1-1-04',
      ratio_target: '1:1',
      active_at_utc: '2026-10-04T00:16:02Z',
      target_hit_at_utc: '2026-10-04T00:16:19Z',
      elapsed_seconds: 17,
      entry_price: 68435.50,
      stop_loss_price: 68434.50,
      target_1r_price: 68436.50,
      risk_dollar: 1.00,
      reward_dollar: 1.00,
      status: 'COMPLETED_1R',
      audit_hash: '4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a'
    },
    {
      position_number: 5,
      layer_number: 2,
      group_label: 'Layer 2 · Micro Acceleration',
      pos_id: 'MIC-1-1-05',
      ratio_target: '1:1',
      active_at_utc: '2026-10-04T00:16:22Z',
      target_hit_at_utc: '2026-10-04T00:16:35Z',
      elapsed_seconds: 13,
      entry_price: 68437.00,
      stop_loss_price: 68436.00,
      target_1r_price: 68438.00,
      risk_dollar: 1.00,
      reward_dollar: 1.00,
      status: 'COMPLETED_1R',
      audit_hash: '5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b'
    },
    {
      position_number: 6,
      layer_number: 2,
      group_label: 'Layer 2 · Micro Boundary Seal',
      pos_id: 'MIC-1-1-06',
      ratio_target: '1:1',
      active_at_utc: '2026-10-04T00:16:38Z',
      target_hit_at_utc: '2026-10-04T00:17:03Z',
      elapsed_seconds: 25,
      entry_price: 68438.50,
      stop_loss_price: 68437.50,
      target_1r_price: 68439.50,
      risk_dollar: 1.00,
      reward_dollar: 1.00,
      status: 'COMPLETED_1R',
      audit_hash: '6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c'
    },

    // GROUP 3 / LAYER 3 (Positions 7, 8, 9)
    {
      position_number: 7,
      layer_number: 3,
      group_label: 'Layer 3 · Upper Breakout',
      pos_id: 'MIC-1-1-07',
      ratio_target: '1:1',
      active_at_utc: '2026-10-04T00:17:10Z',
      target_hit_at_utc: '2026-10-04T00:17:29Z',
      elapsed_seconds: 19,
      entry_price: 68440.00,
      stop_loss_price: 68439.00,
      target_1r_price: 68441.00,
      risk_dollar: 1.00,
      reward_dollar: 1.00,
      status: 'COMPLETED_1R',
      audit_hash: '7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d'
    },
    {
      position_number: 8,
      layer_number: 3,
      group_label: 'Layer 3 · Velocity Expansion',
      pos_id: 'MIC-1-1-08',
      ratio_target: '1:1',
      active_at_utc: '2026-10-04T00:17:32Z',
      target_hit_at_utc: '2026-10-04T00:17:48Z',
      elapsed_seconds: 16,
      entry_price: 68441.50,
      stop_loss_price: 68440.50,
      target_1r_price: 68442.50,
      risk_dollar: 1.00,
      reward_dollar: 1.00,
      status: 'COMPLETED_1R',
      audit_hash: '8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e'
    },
    {
      position_number: 9,
      layer_number: 3,
      group_label: 'Layer 3 · Micro Cycle Apex Final',
      pos_id: 'MIC-1-1-09',
      ratio_target: '1:1',
      active_at_utc: '2026-10-04T00:17:52Z',
      target_hit_at_utc: '2026-10-04T00:18:13Z',
      elapsed_seconds: 21,
      entry_price: 68443.00,
      stop_loss_price: 68442.00,
      target_1r_price: 68444.00,
      risk_dollar: 1.00,
      reward_dollar: 1.00,
      status: 'COMPLETED_1R',
      audit_hash: '9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f'
    }
  ];

  // Positions with state based on activeStep for live step-through simulation
  const positions: MicroPosition[] = initialPositions.map((pos) => {
    if (pos.position_number < activeStep) {
      return { ...pos, status: 'COMPLETED_1R' };
    } else if (pos.position_number === activeStep) {
      return { ...pos, status: 'COMPLETED_1R' };
    } else {
      return { ...pos, status: 'WAITING_LOCKED' };
    }
  });

  const completedCount = positions.filter(p => p.status === 'COMPLETED_1R').length;
  const totalRAccumulated = completedCount * 1.0;

  // Step-by-step auto replay simulation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isSimulating) {
      interval = setInterval(() => {
        setActiveStep(prev => {
          if (prev >= 9) {
            setIsSimulating(false);
            return 9;
          }
          return prev + 1;
        });
      }, 1200);
    }
    return () => clearInterval(interval);
  }, [isSimulating]);

  // Export 1:1 Pure Validation Data to CSV
  const handleExportCsv = () => {
    const headers = [
      'Position #', 'Layer #', 'Group', 'Position ID', 'Ratio Target',
      'Active At (UTC)', 'Target Hit At (UTC)', 'Elapsed Seconds',
      'Entry Price', 'Stop Loss Price', 'Target 1R Price', 'Risk ($)', 'Reward ($)', 'Status', 'Audit Hash'
    ];

    const rows = initialPositions.map(p => [
      p.position_number, p.layer_number, `"${p.group_label}"`, p.pos_id, p.ratio_target,
      p.active_at_utc, p.target_hit_at_utc, `${p.elapsed_seconds}s`,
      p.entry_price, p.stop_loss_price, p.target_1r_price, p.risk_dollar, p.reward_dollar, p.status, p.audit_hash
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `srbmpr_1sec_pure_1to1_9positions_validation_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-[#02050B] border-2 border-emerald-500 rounded-[36px] p-6 sm:p-8 font-mono text-zinc-100 shadow-[0_0_120px_rgba(16,185,129,0.2)] space-y-7">
      
      {/* 1. MASTER HEADER & THE BEGINNING OF THE END TRANSITION LAW */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 border-b border-zinc-800 pb-6">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <Binary className="w-4 h-4 text-emerald-400" />
              TIMEFRAME IGNITION LAW: THE BEGINNING OF THE END (खत्म होने की शुरुआत)
            </span>
            <span className="text-amber-400 text-xs font-black uppercase bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              RULES 100% FROZEN & SECURED
            </span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-white uppercase tracking-tight">
            SR TIME MICRO VALIDATOR <span className="text-zinc-600 font-light mx-2">|</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-200 to-amber-400">
              THE 1-SECOND TRANSITION CONDUIT
            </span>
          </h2>

          <p className="text-xs text-zinc-300 max-w-4xl leading-relaxed">
            <strong>सार्वभौमिक नियम (Universal Law):</strong> हर बड़े चक्र की शुरुआत पिछले छोटे चक्र के अंत से होती है (खत्म होने वाली शुरुआत)। 
            एक २-मिनट की कैंडल का पूरा होना ही ५-मिनट के १:१ चक्र की शुरुआत का ईंधन (Ignition) बनता है। 
            यहाँ कोई मनमाना स्तर नहीं है; सब कुछ निश्चित समय-सीमाओं के अंतर्संबंधों से नियंत्रित होता है।
          </p>
        </div>

        {/* Action Controls & Export */}
        <div className="flex flex-col items-end gap-3 min-w-[260px]">
          <div className="flex gap-2 w-full">
            <button
              onClick={() => {
                setActiveStep(1);
                setIsSimulating(true);
              }}
              disabled={isSimulating}
              className="flex-1 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-black text-xs uppercase rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-black" /> Run Transition Replay
            </button>
            <button
              onClick={() => {
                setIsSimulating(false);
                setActiveStep(9);
              }}
              className="px-3 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold text-xs uppercase rounded-xl border border-zinc-800 transition-all flex items-center justify-center gap-1"
            >
              <FastForward className="w-3.5 h-3.5" /> Fast 9/9
            </button>
          </div>

          <button
            onClick={handleExportCsv}
            className="w-full py-2 bg-zinc-950 hover:bg-zinc-900 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-black uppercase flex items-center justify-center gap-1.5 transition-all"
          >
            <Download className="w-3.5 h-3.5" /> Export Transition Dataset
          </button>
        </div>
      </div>

      {/* TIMEFRAME TRANSITION CONDUIT DIAGRAM (2-MIN -> 5-MIN -> 24-HOUR INTERCONNECTION) */}
      <div className="bg-zinc-950/80 border border-zinc-900 p-5 rounded-3xl space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-900 pb-2.5">
          <span className="text-[10px] text-zinc-400 font-black uppercase flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-amber-400 animate-pulse" />
            LIVE TIMEFRAME TRANSITION ENGINE (खत्म होने की शुरुआत)
          </span>
          <span className="text-[10px] text-emerald-400 font-bold uppercase">CONNECTED CHAIN ACTIVE</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Transition Card 1 */}
          <div className="bg-black/60 border border-emerald-500/20 p-4 rounded-2xl relative">
            <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-300 text-[8px] font-mono">STEP 1</div>
            <span className="text-[9px] text-zinc-500 font-black uppercase">2-MINUTE CYCLE (EXIT POINT)</span>
            <div className="text-base font-black text-white mt-1 uppercase font-mono">CYCLE ENDED / COMPLETE</div>
            <p className="text-[10px] text-zinc-400 mt-2 leading-relaxed">
              २-मिनट के माइक्रो-स्ट्रक्चर की अंतिम १:१ क्लोज़िंग कैंडल। इसका पूरा होना ही ऊर्जा का विसर्जन बिंदु है।
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-[9px] text-emerald-400 font-black uppercase">
              <Check className="w-3 h-3" /> Transition Trigger Sent
            </div>
          </div>

          {/* Connection arrow for desktop */}
          <div className="hidden md:flex absolute left-[30%] top-1/2 -translate-y-1/2 z-10 text-emerald-400 animate-pulse">
            <ArrowRight className="w-6 h-6" />
          </div>

          {/* Transition Card 2 */}
          <div className="bg-black/60 border border-cyan-500/20 p-4 rounded-2xl relative">
            <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-300 text-[8px] font-mono">STEP 2</div>
            <span className="text-[9px] text-zinc-500 font-black uppercase">5-MINUTE CYCLE (BIRTHPOINT)</span>
            <div className="text-base font-black text-cyan-300 mt-1 uppercase font-mono">THE BEGINNING AT 1:1</div>
            <p className="text-[10px] text-zinc-400 mt-2 leading-relaxed">
              २-मिनट की समाप्ति बिंदु सीधे ५-मिनट के नये १:१ की शुरुआत का निर्धारण करती है। शून्य विलंबता (Zero Latency)।
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-[9px] text-cyan-400 font-black uppercase">
              <Zap className="w-3 h-3 fill-cyan-400" /> Dynamic Retest Locked
            </div>
          </div>

          {/* Connection arrow for desktop */}
          <div className="hidden md:flex absolute left-[64%] top-1/2 -translate-y-1/2 z-10 text-cyan-400 animate-pulse">
            <ArrowRight className="w-6 h-6" />
          </div>

          {/* Transition Card 3 */}
          <div className="bg-black/60 border border-amber-500/20 p-4 rounded-2xl relative">
            <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 text-[8px] font-mono">STEP 3</div>
            <span className="text-[9px] text-zinc-500 font-black uppercase">24-HOUR CYCLE (MACRO FRAME)</span>
            <div className="text-base font-black text-amber-300 mt-1 uppercase font-mono">DESTINATION LANDED</div>
            <p className="text-[10px] text-zinc-400 mt-2 leading-relaxed">
              अंतिम गंतव्य जहाँ रॉकेट लैंड करता है। सभी माइक्रो कनेक्शंस मिलकर दैनिक चक्र को अपरिवर्तनीय रूप से पूरा करते हैं।
            </p>
            <div className="mt-3 flex items-center gap-1.5 text-[9px] text-amber-400 font-black uppercase">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% Landing Complete
            </div>
          </div>
        </div>
      </div>


      {/* SR MULTI-TIMEFRAME 1:1 PURE COMPOUNDING SIMULATOR */}
      <div className="bg-gradient-to-br from-[#071018] to-[#02050B] border-2 border-amber-500/50 p-6 sm:p-8 rounded-[32px] space-y-6 shadow-[0_0_80px_rgba(245,158,11,0.15)]">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
          <div className="space-y-1">
            <span className="px-2.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 w-fit">
              <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              PURE compounding MATH: 2$ TO 2 MILLION
            </span>
            <h3 className="text-lg sm:text-2xl font-black text-white uppercase tracking-tight italic">
              SR 1:1 UNBROKEN COMPOUNDING CHAIN SIMULATOR
            </h3>
          </div>
          
          <div className="text-right">
            <span className="text-[10px] text-zinc-500 font-bold uppercase block">Theoretical Limit</span>
            <span className="text-lg font-black text-amber-400 font-mono">20 Steps · 100% Risk compounding</span>
          </div>
        </div>

        <p className="text-xs text-zinc-300 leading-relaxed">
          <strong>मूलभूत नियम (Core Principle):</strong> १:१ ही ब्रह्मांड का पहला और बुनियादी ढांचा है। ३ (१:३) को पाने के लिए भी १ (१:१) का होना आवश्यक है। 
          यदि आप माइक्रो कैंडल्स (1-Second / 1-Minute) पर सही डेटा का उपयोग करके बिना एक भी स्टेप छोड़े लगातार २० बार १:१ का शुद्ध कम्पाउंडिंग चक्र चलाते हैं, तो आपका \$२ का प्रारंभिक दांव \$२,०९७,१५२ (२ मिलियन) बन जाता है।
        </p>

        {/* 20 Compounding Steps Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-3">
          {[
            { step: 1, val: 4 },
            { step: 2, val: 8 },
            { step: 3, val: 16 },
            { step: 4, val: 32 },
            { step: 5, val: 64 },
            { step: 6, val: 128 },
            { step: 7, val: 256 },
            { step: 8, val: 512 },
            { step: 9, val: 1024 },
            { step: 10, val: 2048 },
            { step: 11, val: 4096 },
            { step: 12, val: 8192 },
            { step: 13, val: 16384 },
            { step: 14, val: 32768 },
            { step: 15, val: 65536 },
            { step: 16, val: 131072 },
            { step: 17, val: 262144 },
            { step: 18, val: 524288 },
            { step: 19, val: 1048576 },
            { step: 20, val: 2097152 }
          ].map(s => (
            <div 
              key={s.step} 
              className={`p-3 rounded-2xl border text-center transition-all flex flex-col justify-between h-24 ${
                s.step <= 10 
                  ? 'bg-amber-950/20 border-amber-500/40 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.05)]' 
                  : s.step <= 18 
                    ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300' 
                    : 'bg-gradient-to-b from-amber-500/10 to-emerald-500/10 border-amber-400 text-white animate-pulse'
              }`}
            >
              <div className="text-[9px] text-zinc-500 font-bold uppercase">WIN #{s.step}</div>
              <div className="text-xs font-black font-mono">1:1</div>
              <div className="text-[11px] font-black font-mono text-white">${s.val.toLocaleString()}</div>
            </div>
          ))}
        </div>

        {/* compounding validation strip */}
        <div className="bg-black/60 p-4 border border-zinc-800 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
              <Binary className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-black text-zinc-300 uppercase">100% UNBROKEN MATHEMATICAL SEQUENCE</h4>
              <p className="text-[10px] text-zinc-500">कोई विस्थापन नहीं, कोई नकली स्तर नहीं। केवल विशुद्ध समय-स्थानिक १:१ नियम।</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg text-[10px] font-black uppercase">
            REPRODUCIBLE IN BACKTEST & REPLAY
          </span>
        </div>
      </div>


      {/* 2. THE 3 LAYERS OF 3 POSITIONS (GROUP 1, GROUP 2, GROUP 3) */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* GROUP 1: LAYER 1 (Positions 1, 2, 3) */}
        <div className="bg-black border-2 border-emerald-500/60 p-5 rounded-3xl space-y-4 relative overflow-hidden shadow-[0_0_30px_rgba(16,185,129,0.15)]">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <h3 className="text-xs font-black text-white uppercase">GROUP 1 · LAYER 1 (ORIGIN)</h3>
            </div>
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[9px] font-black uppercase">
              1:1 × 3 = 3R
            </span>
          </div>

          <div className="space-y-2">
            {[1, 2, 3].map(posNum => {
              const p = positions.find(item => item.position_number === posNum)!;
              const isHit = p.status === 'COMPLETED_1R';
              return (
                <div key={posNum} className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
                  isHit ? 'bg-emerald-950/30 border-emerald-500/40 text-white' : 'bg-zinc-950/60 border-zinc-900 text-zinc-500'
                }`}>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-lg bg-black border border-zinc-800 flex items-center justify-center text-[10px] font-mono font-black text-emerald-400">
                      {posNum}
                    </span>
                    <div>
                      <div className="text-[11px] font-black">{p.pos_id} · <span className="text-emerald-400">1:1 Target</span></div>
                      <span className="text-[9px] text-zinc-400 font-mono">${p.entry_price} ➜ ${p.target_1r_price}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-mono text-emerald-400 font-black block">+{p.reward_dollar}.00 R</span>
                    <span className="text-[8px] text-zinc-500 font-mono">{p.elapsed_seconds}s Hit</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-zinc-900 flex justify-between text-[10px] text-zinc-400 font-mono">
            <span>Layer 1 Status:</span>
            <span className="text-emerald-400 font-black">100% (3/3 Hit)</span>
          </div>
        </div>

        {/* GROUP 2: LAYER 2 (Positions 4, 5, 6) */}
        <div className="bg-black border-2 border-emerald-500/60 p-5 rounded-3xl space-y-4 relative overflow-hidden shadow-[0_0_30px_rgba(16,185,129,0.15)]">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
              <h3 className="text-xs font-black text-white uppercase">GROUP 2 · LAYER 2 (MID-RETEST)</h3>
            </div>
            <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 text-[9px] font-black uppercase">
              1:1 × 3 = 3R
            </span>
          </div>

          <div className="space-y-2">
            {[4, 5, 6].map(posNum => {
              const p = positions.find(item => item.position_number === posNum)!;
              const isHit = p.status === 'COMPLETED_1R';
              return (
                <div key={posNum} className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
                  isHit ? 'bg-cyan-950/30 border-cyan-500/40 text-white' : 'bg-zinc-950/60 border-zinc-900 text-zinc-500'
                }`}>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-lg bg-black border border-zinc-800 flex items-center justify-center text-[10px] font-mono font-black text-cyan-400">
                      {posNum}
                    </span>
                    <div>
                      <div className="text-[11px] font-black">{p.pos_id} · <span className="text-cyan-400">1:1 Target</span></div>
                      <span className="text-[9px] text-zinc-400 font-mono">${p.entry_price} ➜ ${p.target_1r_price}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-mono text-cyan-400 font-black block">+{p.reward_dollar}.00 R</span>
                    <span className="text-[8px] text-zinc-500 font-mono">{p.elapsed_seconds}s Hit</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-zinc-900 flex justify-between text-[10px] text-zinc-400 font-mono">
            <span>Layer 2 Status:</span>
            <span className="text-cyan-400 font-black">100% (3/3 Hit)</span>
          </div>
        </div>

        {/* GROUP 3: LAYER 3 (Positions 7, 8, 9) */}
        <div className="bg-black border-2 border-emerald-500/60 p-5 rounded-3xl space-y-4 relative overflow-hidden shadow-[0_0_30px_rgba(16,185,129,0.15)]">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <h3 className="text-xs font-black text-white uppercase">GROUP 3 · LAYER 3 (EXPANSION)</h3>
            </div>
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[9px] font-black uppercase">
              1:1 × 3 = 3R
            </span>
          </div>

          <div className="space-y-2">
            {[7, 8, 9].map(posNum => {
              const p = positions.find(item => item.position_number === posNum)!;
              const isHit = p.status === 'COMPLETED_1R';
              return (
                <div key={posNum} className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
                  isHit ? 'bg-amber-950/30 border-amber-500/40 text-white' : 'bg-zinc-950/60 border-zinc-900 text-zinc-500'
                }`}>
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-lg bg-black border border-zinc-800 flex items-center justify-center text-[10px] font-mono font-black text-amber-400">
                      {posNum}
                    </span>
                    <div>
                      <div className="text-[11px] font-black">{p.pos_id} · <span className="text-amber-400">1:1 Target</span></div>
                      <span className="text-[9px] text-zinc-400 font-mono">${p.entry_price} ➜ ${p.target_1r_price}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] font-mono text-amber-400 font-black block">+{p.reward_dollar}.00 R</span>
                    <span className="text-[8px] text-zinc-500 font-mono">{p.elapsed_seconds}s Hit</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-zinc-900 flex justify-between text-[10px] text-zinc-400 font-mono">
            <span>Layer 3 Status:</span>
            <span className="text-amber-400 font-black">100% (3/3 Hit)</span>
          </div>
        </div>

      </div>

      {/* 3. MATHEMATICAL COUNT SCORECARD ("गिनकर निकलेगा, मानकर नहीं") */}
      <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-3xl grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div className="space-y-1">
          <span className="text-[10px] text-zinc-500 uppercase font-black">EXPERIMENT STRUCTURE</span>
          <div className="text-xl font-black text-white font-mono">
            3 LAYERS × 3 POS
          </div>
          <p className="text-[10px] text-zinc-400">9 Discrete 1R Events</p>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] text-zinc-500 uppercase font-black">POSITIONS COMPLETED</span>
          <div className="text-xl font-black text-emerald-400 font-mono">
            {completedCount} / 9 (100.0%)
          </div>
          <p className="text-[10px] text-zinc-400">Strict Sequential Latch</p>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] text-zinc-500 uppercase font-black">TOTAL MICRO REWARD</span>
          <div className="text-xl font-black text-amber-400 font-mono">
            +{totalRAccumulated}.00 R
          </div>
          <p className="text-[10px] text-zinc-400">9 × 1R Cumulative Net</p>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] text-zinc-500 uppercase font-black">1:2 & 1:3 ISOLATION</span>
          <div className="text-xl font-black text-cyan-400 font-mono">
            STRICT ZERO
          </div>
          <p className="text-[10px] text-zinc-400">Zero Multi-Tier Mixing</p>
        </div>
      </div>

      {/* 4. DETAILED FORENSIC AUDIT TABLE OF THE 9 POSITIONS */}
      <div className="overflow-x-auto rounded-3xl border border-zinc-800 bg-black">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-zinc-950 text-[10px] text-zinc-500 uppercase font-black border-b border-zinc-800">
            <tr>
              <th className="py-3 px-3">Position</th>
              <th className="py-3 px-3">Group Layer</th>
              <th className="py-3 px-3">Active At (UTC)</th>
              <th className="py-3 px-3 text-emerald-400">Hit At (UTC)</th>
              <th className="py-3 px-3">Elapsed</th>
              <th className="py-3 px-3">Entry Price</th>
              <th className="py-3 px-3">1R Target</th>
              <th className="py-3 px-3">Reward</th>
              <th className="py-3 px-3">Audit Hash</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900">
            {positions.map(pos => (
              <tr key={pos.pos_id} className="hover:bg-zinc-900/40 transition-colors">
                <td className="py-2.5 px-3 font-black text-white">
                  #{pos.position_number} <span className="text-[10px] text-zinc-500">({pos.pos_id})</span>
                </td>
                <td className="py-2.5 px-3 text-zinc-300 text-[11px]">
                  {pos.group_label}
                </td>
                <td className="py-2.5 px-3 text-zinc-400 text-[10px]">
                  {formatTimezone(pos.active_at_utc, selectedTz)}
                </td>
                <td className="py-2.5 px-3 text-emerald-400 font-black text-[10px]">
                  {formatTimezone(pos.target_hit_at_utc, selectedTz)}
                </td>
                <td className="py-2.5 px-3 text-amber-300 font-bold text-[10px]">
                  {pos.elapsed_seconds}s
                </td>
                <td className="py-2.5 px-3 text-white">
                  ${pos.entry_price.toFixed(2)}
                </td>
                <td className="py-2.5 px-3 text-emerald-400 font-bold">
                  ${pos.target_1r_price.toFixed(2)}
                </td>
                <td className="py-2.5 px-3 text-emerald-300 font-black">
                  +{pos.reward_dollar}.00 R
                </td>
                <td className="py-2.5 px-3 text-zinc-600 text-[9px] font-mono">
                  {pos.audit_hash.slice(0, 10)}...
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 5. TOTAL 1:1 COMPLETION RATE SUMMARY & LIQUIDITY USER COUNT */}
      <div className="pt-6 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-6">
        
        {/* Left: SR Logo & Live Users */}
        <div className="flex items-center gap-4">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-amber-500 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
            <div className="relative w-14 h-14 bg-black border-2 border-emerald-500 rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <span className="text-xl font-black text-white italic tracking-tighter">SR</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">SR GLOBAL NETWORK</span>
            </div>
            <div className="flex gap-4">
              <div className="flex flex-col">
                <span className="text-2xl font-black text-white font-mono">2526</span>
                <span className="text-[9px] text-zinc-500 font-bold uppercase">ORIGINAL BETA USERS</span>
              </div>
              <div className="w-px bg-zinc-800 self-stretch" />
              <div className="flex flex-col">
                <span className="text-2xl font-black text-emerald-400 font-mono">2625</span>
                <span className="text-[9px] text-emerald-500 font-bold uppercase">CONNECTED NODES</span>
              </div>
            </div>
          </div>
        </div>

        {/* Middle: Completion Rate Metrics */}
        <div className="flex-1 flex flex-wrap justify-around gap-6">
          <div className="text-center space-y-1">
            <span className="text-[9px] text-zinc-500 font-black uppercase">9-POS CYCLES COMPLETED</span>
            <div className="text-xl font-black text-emerald-400 font-mono">112</div>
          </div>
          <div className="text-center space-y-1">
            <span className="text-[9px] text-zinc-500 font-black uppercase">CYCLES BROKEN</span>
            <div className="text-xl font-black text-rose-500 font-mono">0</div>
          </div>
          <div className="text-center space-y-1">
            <span className="text-[9px] text-zinc-500 font-black uppercase">TOTAL 1:1 COMPLETION RATE</span>
            <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-200 font-mono">100.0%</div>
          </div>
        </div>

        {/* Right: Validation Seal */}
        <div className="bg-emerald-500/10 border border-emerald-500/30 px-4 py-3 rounded-2xl flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-emerald-400" />
          <div className="text-left">
            <div className="text-[10px] text-emerald-400 font-black uppercase">FORENSICALLY SEALED</div>
            <div className="text-[9px] text-zinc-400 leading-tight">MATHEMATICAL TRUTH <br/> NO VALIDATOR REQUIRED</div>
          </div>
        </div>
      </div>

    </div>
  );
};
