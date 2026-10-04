import React, { useState, useEffect } from 'react';
import { ExchangeId, AssetSymbol, Timeframe, TimezoneMode, CandleData, Srbmpr2526LayerState, MarketType, TomorrowReportRecord, TradeEvent, TickerEvent } from './types/terminal';
import { SRBMPRMechanismEngine } from './services/SRBMPRMechanismEngine';
import { MultiAssetSelectorBox } from './components/MultiAssetSelectorBox';
import { BybitMarketOverviewHeader } from './components/BybitMarketOverviewHeader';
import { TechnicalOhlcInspectionPanel } from './components/TechnicalOhlcInspectionPanel';
import { Srbmpr2526LayerModule } from './components/Srbmpr2526LayerModule';
import { SrbmprMechanismChartContainer } from './components/SrbmprMechanismChartContainer';
import { SrScalpingTicketTerminal } from './components/SrScalpingTicketTerminal';
import { RMultipleTracker } from './components/RMultipleTracker';
import { SraiOperationsAgentModal } from './components/SraiOperationsAgentModal';
import { SrJarvisAssistantModal } from './components/SrJarvisAssistantModal';
import { PineScriptGeneratorModal } from './components/PineScriptGeneratorModal';
import { ForwardTestReportModal } from './components/ForwardTestReportModal';
import { ResearchPipelineWorkspace } from './components/ResearchPipelineWorkspace';
import { LiveCommunityHub } from './components/LiveCommunityHub';
import { TomorrowEntryReport } from './components/TomorrowEntryReport';
import { DailyBrokerAuditReportModal } from './components/DailyBrokerAuditReportModal';
import { SrbmprLimitOrderTerminalCanvas } from './components/SrbmprLimitOrderTerminalCanvas';
import { SrNewTraderInsight } from './components/SrNewTraderInsight';
import { SrbmprBehavioralLaboratory } from './components/SrbmprBehavioralLaboratory';
import { BrokerFootprintWorkspace } from './components/BrokerFootprintWorkspace';
import { KaliAuditEngineModal } from './components/KaliAuditEngineModal';
import { PublicResearchPortfolioModal } from './components/PublicResearchPortfolioModal';
import { SrMultiCoinHorizonPage } from './components/SrMultiCoinHorizonPage';
import { LiveCollaborationModal } from './components/LiveCollaborationModal';
import { AutomatedPublishAuditModal } from './components/AutomatedPublishAuditModal';
import { SrbmprDedicatedProjectionScreen } from './components/SrbmprDedicatedProjectionScreen';
import { BtcCleanExecutionDisplay } from './components/BtcCleanExecutionDisplay';
import { SrbmprTradingView3DChart } from './components/SrbmprTradingView3DChart';
import { SrbmprStrictAccountSafeguard } from './components/SrbmprStrictAccountSafeguard';
import { Srbmpr100CoinWorkspaceBoard } from './components/Srbmpr100CoinWorkspaceBoard';
import { SrbmprUnifiedEventEngineWorkspace } from './components/SrbmprUnifiedEventEngineWorkspace';
import { WhoValidatesTheValidatorVault } from './components/WhoValidatesTheValidatorVault';
import { SrbmprForensicFourContainerLedger } from './components/SrbmprForensicFourContainerLedger';
import { SrTimeEarthLandingTerminal } from './components/SrTimeEarthLandingTerminal';
import { SrbmprApiKeyAndSystemExplainerModal } from './components/SrbmprApiKeyAndSystemExplainerModal';
import { SrbmprMicroOneToOnePureValidator } from './components/SrbmprMicroOneToOnePureValidator';
import { SrbmprReplayLedger } from './components/SrbmprReplayLedger';
import { BybitDemoExecutionPanel } from './components/BybitDemoExecutionPanel';
import { SrbmprBoxStepOscillator } from './components/SrbmprBoxStepOscillator';
import { SrbmprFrozenInstructionBoard } from './components/SrbmprFrozenInstructionBoard';
import { SrbmprSuperScalingGantry } from './components/SrbmprSuperScalingGantry';
import { SrbmprMicroCompoundingAuditLedger } from './components/SrbmprMicroCompoundingAuditLedger';
import { SrbmprMemePennyCoinsTerminal } from './components/SrbmprMemePennyCoinsTerminal';


import { SrbmprThresholdLockRestart } from './components/SrbmprThresholdLockRestart';
import { BybitExecutionAuditLog } from './components/BybitExecutionAuditLog';
import { SrbmprSequentialWaveMeasurement } from './components/SrbmprSequentialWaveMeasurement';
import { SrbmprNanoPrecisionSimulator } from './components/SrbmprNanoPrecisionSimulator';
import { SrbmprTemporalPowerLedger } from './components/SrbmprTemporalPowerLedger';
import { SrbmprAutomationCommandCenter } from './components/SrbmprAutomationCommandCenter';
import { Shield, Bot, Terminal, Award, Zap, Target, Clock, Activity, CheckCircle2, Layers, AlertCircle, Lock, Monitor, MessageCircle, BarChart3, Ticket, FileText, ShieldAlert, Cpu, Video, ShieldCheck, Rocket, Key, Binary, Coins, Atom } from 'lucide-react';

export default function App() {
  const [selectedExchange, setSelectedExchange] = useState<ExchangeId>('BYBIT');
  const [marketType, setMarketType] = useState<MarketType>('SPOT');
  const [selectedAsset, setSelectedAsset] = useState<AssetSymbol>('BTC/USDT');
  const [timeframe, setTimeframe] = useState<Timeframe>('1m'); 
  const [structureTf, setStructureTf] = useState<'5m' | '15m' | '1h'>('5m'); 
  const [timezone, setTimezone] = useState<TimezoneMode>('UTC');
  const [viewMode, setViewMode] = useState<'PROJECTION' | 'HORIZON' | 'TICKET' | 'CHART' | 'ALL'>('PROJECTION');

  // Modal States
  const [isPineModalOpen, setIsPineModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [isAgentModalOpen, setIsAgentModalOpen] = useState(false);
  const [isPortfolioModalOpen, setIsPortfolioModalOpen] = useState(false);
  const [isJarvisModalOpen, setIsJarvisModalOpen] = useState(false);
  const [isBrokerAuditModalOpen, setIsBrokerAuditModalOpen] = useState(false);
  const [isKaliAuditModalOpen, setIsKaliAuditModalOpen] = useState(false);
  const [isPublishAuditModalOpen, setIsPublishAuditModalOpen] = useState(false);
  const [isLiveZoomModalOpen, setIsLiveZoomModalOpen] = useState(false);
  const [isExplainerModalOpen, setIsExplainerModalOpen] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  const engine = SRBMPRMechanismEngine.getInstance();
  const [candles, setCandles] = useState<CandleData[]>([]);
  const [layerState, setLayerState] = useState<Srbmpr2526LayerState | null>(null);
  const [tomorrowReports, setTomorrowReports] = useState<TomorrowReportRecord[]>([]);

  const [livePrice, setLivePrice] = useState<number>(0);
  const [tickerStats, setTickerStats] = useState<TickerEvent | null>(null);
  const [buyLiquidity, setBuyLiquidity] = useState<number>(0);
  const [sellLiquidity, setSellLiquidity] = useState<number>(0);

  useEffect(() => {
    const initData = async () => {
      const histCandles = await engine.fetchHistoricalCandles(selectedExchange, selectedAsset, timeframe, marketType, 60);
      setCandles(histCandles);
      const state = engine.calculateSrbmprModel2526(histCandles);
      setLayerState(state);
      if (histCandles.length > 0) {
        setLivePrice(histCandles[histCandles.length - 1].close);
      }
      
      const reports = await engine.generateTomorrowReport(selectedAsset);
      setTomorrowReports(reports);
    };

    initData();

    const handleTradeUpdate = (event: TradeEvent) => {
      setLivePrice(event.price);
      
      if (event.side === 'Buy') {
        setBuyLiquidity(prev => prev + event.size);
      } else {
        setSellLiquidity(prev => prev + event.size);
      }

      setCandles(prev => {
        if (prev.length === 0) return prev;
        const updated = [...prev];
        const last = { ...updated[updated.length - 1], close: event.price };
        if (event.price > last.high) last.high = event.price;
        if (event.price < last.low) last.low = event.price;
        updated[updated.length - 1] = last;
        
        const newState = engine.calculateSrbmprModel2526(updated);
        setLayerState(newState);
        return updated;
      });
    };

    const handleTickerUpdate = (event: TickerEvent) => {
      setTickerStats(event);
    };

    engine.subscribeToTrades(selectedExchange, selectedAsset, marketType, handleTradeUpdate);
    engine.subscribeToTickers(selectedExchange, selectedAsset, marketType, handleTickerUpdate);

    // 10-Minute Auto-Refresh Logic (Preserves local audit & evidence database)
    const refreshTimer = setTimeout(() => {
      window.location.reload();
    }, 600000); // 600,000ms = 10 minutes

    // Security: Prevent context menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Security: Prevent Developer Tools shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' || 
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        (e.ctrlKey && e.key === 'U') ||
        (e.ctrlKey && e.key === 'S')
      ) {
        e.preventDefault();
        return false;
      }
    };
    
    // Security: Blur on focus loss
    const handleBlur = () => setIsLocked(true);
    const handleFocus = () => setIsLocked(false);

    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      engine.unsubscribeFromTrades(selectedExchange, selectedAsset, handleTradeUpdate);
      clearTimeout(refreshTimer);
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, [selectedExchange, selectedAsset, timeframe, structureTf, marketType]);

  const handleFullSync = async () => {
    const histCandles = await engine.fetchHistoricalCandles(selectedExchange, selectedAsset, timeframe, marketType, 60);
    setCandles(histCandles);
    setLayerState(engine.calculateSrbmprModel2526(histCandles));
    setBuyLiquidity(0);
    setSellLiquidity(0);
  };

  const isStale = layerState ? Math.abs(livePrice - layerState.midZone) > (livePrice * 0.05) : false;

  return (
    <div className={`min-h-screen bg-black text-zinc-100 font-sans selection:bg-amber-500 selection:text-black pb-16 transition-all duration-500 ${isLocked ? 'filter blur-2xl pointer-events-none scale-105' : ''}`}>
      
      {/* Top Header Navbar */}
      <header className="border-b border-zinc-900 bg-zinc-950/80 sticky top-0 z-40 backdrop-blur-xl">
        <div className="max-w-[1800px] mx-auto px-6 py-6 flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 rounded-[2rem] bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center shadow-[0_0_40px_rgba(37,99,235,0.3)] text-white font-black font-mono text-2xl">
              SR
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-[0.2em] text-white uppercase italic leading-none">
                  SRBMPR
                </h1>
                <span className="text-zinc-600 font-light text-2xl hidden sm:inline">|</span>
                <span className="text-xs sm:text-sm md:text-base font-black tracking-[0.2em] text-amber-400 uppercase bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.2)] animate-pulse">
                  WHO VALIDATES THE VALIDATOR
                </span>
                <div className="flex flex-col">
                  <span className="text-[9px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30 font-black uppercase w-fit">
                    Live Exchange Sync
                  </span>
                  <span className="text-[11px] text-zinc-300 font-black tracking-widest mt-0.5">FORENSIC SUITE</span>
                </div>
              </div>
              <p className="text-[10px] sm:text-[11px] text-zinc-400 font-black uppercase tracking-[0.2em] mt-2">
                THIS PLATFORM DOES NOT SELL OR PROVIDE TRADES • FORENSIC BEHAVIORAL VALIDATION & EVIDENCE VAULT
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => {
                const el = document.getElementById('earth-landing-terminal');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-3.5 py-2 bg-gradient-to-r from-emerald-500/20 via-amber-500/20 to-yellow-500/20 hover:from-emerald-500/30 hover:to-amber-500/30 text-emerald-300 rounded-2xl font-black text-[10px] flex items-center gap-1.5 border border-emerald-500/50 transition-all uppercase tracking-widest shadow-[0_0_25px_rgba(16,185,129,0.3)] animate-pulse"
            >
              <Rocket className="w-3.5 h-3.5 text-emerald-400" /> Earth Landing Target
            </button>

            <button
              onClick={() => {
                const el = document.getElementById('who-validates-vault');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-3.5 py-2 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 text-amber-300 rounded-2xl font-black text-[10px] flex items-center gap-1.5 border border-amber-500/50 transition-all uppercase tracking-widest shadow-[0_0_20px_rgba(245,158,11,0.25)]"
            >
              <Award className="w-3.5 h-3.5 text-amber-400" /> Who Validates the Validator
            </button>

            <button
              onClick={() => setIsLiveZoomModalOpen(true)}
              className="px-3.5 py-2 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 rounded-2xl font-black text-[10px] flex items-center gap-1.5 border border-emerald-500/40 transition-all uppercase tracking-widest shadow-[0_0_15px_rgba(16,185,129,0.25)] animate-pulse"
            >
              <Video className="w-3.5 h-3.5 text-emerald-400" /> Live Zoom Room
            </button>

            <button
              onClick={() => setIsExplainerModalOpen(true)}
              className="px-3.5 py-2 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 text-amber-300 rounded-2xl font-black text-[10px] flex items-center gap-1.5 border border-amber-500/50 transition-all uppercase tracking-widest shadow-[0_0_20px_rgba(245,158,11,0.25)]"
            >
              <Key className="w-3.5 h-3.5 text-amber-400" /> API Setup & Video Prompt
            </button>

            <button
              onClick={() => {
                const el = document.getElementById('pure-1to1-validator');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-3.5 py-2 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 text-emerald-300 rounded-2xl font-black text-[10px] flex items-center gap-1.5 border border-emerald-500/50 transition-all uppercase tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.25)]"
            >
              <Binary className="w-3.5 h-3.5 text-emerald-400" /> 1:1 Micro (9 Pos)
            </button>

            <button
              onClick={() => {
                const el = document.getElementById('replay-ledger');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-3.5 py-2 bg-zinc-900/60 hover:bg-zinc-800/60 text-amber-300 rounded-2xl font-black text-[10px] flex items-center gap-1.5 border border-amber-500/40 transition-all uppercase tracking-widest shadow-[0_0_15px_rgba(245,158,11,0.2)]"
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" /> Replay Ledger
            </button>

            <button
              onClick={() => {
                setSelectedExchange('BYBIT');
                const el = document.getElementById('target-tier-summary');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-3.5 py-2 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 text-amber-300 rounded-2xl font-black text-[10px] flex items-center gap-1.5 border border-amber-500/50 transition-all uppercase tracking-widest shadow-[0_0_20px_rgba(245,158,11,0.25)] animate-pulse"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Bybit Demo Execution
            </button>

            <button
              onClick={() => {
                const el = document.getElementById('pure-1to1-validator');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-3.5 py-2 bg-zinc-900/60 hover:bg-zinc-800/60 text-amber-300 rounded-2xl font-black text-[10px] flex items-center gap-1.5 border border-amber-500/40 transition-all uppercase tracking-widest"
            >
              <Binary className="w-3.5 h-3.5 text-amber-400" /> ±1 Box Step Oscillator
            </button>

            <button
              onClick={() => {
                const el = document.getElementById('pure-1to1-validator');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-3.5 py-2 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 hover:from-amber-500/30 hover:to-yellow-500/30 text-amber-300 rounded-2xl font-black text-[10px] flex items-center gap-1.5 border border-amber-500/50 transition-all uppercase tracking-widest shadow-[0_0_20px_rgba(245,158,11,0.25)]"
            >
              <Coins className="w-3.5 h-3.5 text-amber-400" /> 30x Super Scaling Gantry
            </button>

            <button
              onClick={() => {
                const el = document.getElementById('pure-1to1-validator');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-3.5 py-2 bg-zinc-900/60 hover:bg-zinc-800/60 text-emerald-400 rounded-2xl font-black text-[10px] flex items-center gap-1.5 border border-emerald-500/40 transition-all uppercase tracking-widest"
            >
              <Lock className="w-3.5 h-3.5 text-emerald-400" /> $1000 Lock Safeguard
            </button>

            <button
              onClick={() => {
                const el = document.getElementById('pure-1to1-validator');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-3.5 py-2 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 text-emerald-300 rounded-2xl font-black text-[10px] flex items-center gap-1.5 border border-emerald-500/50 transition-all uppercase tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.25)]"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Bybit V5 Audit Log
            </button>

            <button
              onClick={() => {
                const el = document.getElementById('pure-1to1-validator');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-3.5 py-2 bg-zinc-900/60 hover:bg-zinc-800/60 text-amber-300 rounded-2xl font-black text-[10px] flex items-center gap-1.5 border border-amber-500/40 transition-all uppercase tracking-widest"
            >
              <Activity className="w-3.5 h-3.5 text-amber-400" /> 1:1 Pure Wave Sync
            </button>

            <button
              onClick={() => {
                const el = document.getElementById('pure-1to1-validator');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-3.5 py-2 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 text-emerald-300 rounded-2xl font-black text-[10px] flex items-center gap-1.5 border border-emerald-500/50 transition-all uppercase tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.25)]"
            >
              <Atom className="w-3.5 h-3.5 text-emerald-400" /> 1e-9 Nano Precision
            </button>

            <button
              onClick={() => {
                const el = document.getElementById('pure-1to1-validator');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-3.5 py-2 bg-zinc-900/60 hover:bg-zinc-800/60 text-amber-300 rounded-2xl font-black text-[10px] flex items-center gap-1.5 border border-amber-500/40 transition-all uppercase tracking-widest"
            >
              <Clock className="w-3.5 h-3.5 text-amber-400" /> 20x Temporal Power Ledger
            </button>

            <button
              onClick={() => {
                const el = document.getElementById('automation-command-center');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-black rounded-2xl font-black text-[10px] flex items-center gap-1.5 border border-emerald-400 transition-all uppercase tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.3)] animate-pulse"
            >
              <Zap className="w-3.5 h-3.5 fill-current" /> Activate V5 Automation
            </button>









            <button
              onClick={() => setIsPublishAuditModalOpen(true)}
              className="px-3.5 py-2 bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 rounded-2xl font-black text-[10px] flex items-center gap-1.5 border border-emerald-500/40 transition-all uppercase tracking-widest"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 9-Layer Audit
            </button>

            <button
              onClick={() => setIsPineModalOpen(true)}
              className="px-3.5 py-2 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 rounded-2xl font-black text-[10px] flex items-center gap-1.5 border border-amber-500/40 transition-all uppercase tracking-widest shadow-[0_0_15px_rgba(245,158,11,0.2)]"
            >
              <Terminal className="w-3.5 h-3.5 text-amber-400" /> Pine v6 & Bot Webhook
            </button>

            <button
              onClick={() => setIsAgentModalOpen(true)}
              className="px-3.5 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 rounded-2xl font-black text-[10px] flex items-center gap-1.5 border border-amber-500/40 transition-all uppercase tracking-widest shadow-[0_0_15px_rgba(245,158,11,0.2)]"
            >
              <Cpu className="w-3.5 h-3.5 text-amber-400 animate-pulse" /> SRAI Ops Agent
            </button>

            <button
              onClick={() => setIsPortfolioModalOpen(true)}
              className="px-3.5 py-2 bg-blue-950/40 hover:bg-blue-900/60 text-blue-300 rounded-2xl font-black text-[10px] flex items-center gap-1.5 border border-blue-500/40 transition-all uppercase tracking-widest shadow-[0_0_15px_rgba(59,130,246,0.2)]"
            >
              <FileText className="w-3.5 h-3.5 text-blue-400" /> Research Portfolio
            </button>

            <button
              onClick={() => setIsKaliAuditModalOpen(true)}
              className="px-3.5 py-2 bg-red-950/40 hover:bg-red-900/60 text-red-300 rounded-2xl font-black text-[10px] flex items-center gap-1.5 border border-red-500/40 transition-all uppercase tracking-widest shadow-[0_0_15px_rgba(239,68,68,0.2)]"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-red-400" /> Kali Linux Audit
            </button>

            <button
              onClick={() => setIsJarvisModalOpen(true)}
              className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-amber-400 rounded-2xl font-black text-[10px] flex items-center gap-1.5 border border-zinc-800 transition-all uppercase tracking-widest"
            >
              <Bot className="w-3.5 h-3.5" /> Jarvis AI
            </button>

            <button
              className="p-2.5 bg-red-950/20 text-red-500 rounded-2xl border border-red-500/20 transition-all cursor-not-allowed opacity-50"
              title="Source Locked"
            >
              <Lock className="w-4 h-4" />
            </button>

            <div className="w-px h-6 bg-white/5 mx-1" />

            <div className="flex items-center gap-4 px-4 py-2 bg-zinc-900/50 rounded-2xl border border-white/5">
               <div className="flex flex-col">
                  <span className="text-[8px] text-zinc-600 font-black uppercase">Platform</span>
                  <span className="text-[10px] text-white font-bold">MT5 Bridge</span>
               </div>
               <div className="flex flex-col">
                  <span className="text-[8px] text-zinc-600 font-black uppercase">Status</span>
                  <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Connected
                  </span>
               </div>
            </div>
          </div>

        </div>
      </header>

      {/* Floating Security Badge */}
      <div className="fixed bottom-6 left-6 z-50 pointer-events-none">
        <div className="bg-red-500/20 border border-red-500/40 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-3 shadow-[0_0_20px_rgba(239,68,68,0.2)]">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          <span className="text-[10px] text-white font-black uppercase tracking-widest flex items-center gap-2">
            <Lock className="w-3 h-3" /> STRICT DATA LOCK ACTIVE
          </span>
        </div>
      </div>

      {/* Main Workspace (100% Immersive Full-Screen Terminal Width) */}
      <main className="w-full px-4 sm:px-8 py-8 space-y-8 max-w-none">
        
        {/* Asset Selector & Fast Switcher Box */}
        <MultiAssetSelectorBox
          selectedExchange={selectedExchange}
          onSelectExchange={setSelectedExchange}
          selectedAsset={selectedAsset}
          onSelectAsset={setSelectedAsset}
          timeframe={timeframe}
          onSelectTimeframe={setTimeframe}
          timezone={timezone}
          onSelectTimezone={setTimezone}
          marketType={marketType}
          onSelectMarketType={setMarketType}
          onFullSync={handleFullSync}
        />

        {/* View Mode Switcher Header Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-zinc-950/80 p-2.5 rounded-2xl border border-white/5 backdrop-blur-xl">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 sm:pb-0">
            <button
              onClick={() => setViewMode('PROJECTION')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap ${
                viewMode === 'PROJECTION'
                  ? 'bg-cyan-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.4)]'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>SRBMPR Projection Tool</span>
            </button>

            <button
              onClick={() => setViewMode('HORIZON')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap ${
                viewMode === 'HORIZON'
                  ? 'bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Target className="w-4 h-4" />
              <span>1:100 → 1:1000 Horizon & Re-Entry Ladder</span>
            </button>

            <button
              onClick={() => setViewMode('TICKET')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap ${
                viewMode === 'TICKET'
                  ? 'bg-amber-500 text-black shadow-[0_0_20px_rgba(245,158,11,0.4)]'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Ticket className="w-4 h-4" />
              <span>Scalping Flight Ticket</span>
            </button>

            <button
              onClick={() => setViewMode('CHART')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap ${
                viewMode === 'CHART'
                  ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Chart & Vault</span>
            </button>

            <button
              onClick={() => setViewMode('ALL')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest transition-all whitespace-nowrap ${
                viewMode === 'ALL'
                  ? 'bg-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]'
                  : 'text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Full Workstation</span>
            </button>
          </div>

          <div className="flex items-center gap-3 px-3 py-1 font-mono text-[10px] text-zinc-500">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              LIVE {selectedAsset}
            </span>
            <span className="text-zinc-700">|</span>
            <span>PRICE: <span className="text-white font-bold">${livePrice.toLocaleString()}</span></span>
          </div>
        </div>

        {/* PROMINENT CLEAN BTC EXECUTION DISPLAY WITH CONTINUOUS TESTING PROTOCOL */}
        <BtcCleanExecutionDisplay
          selectedAsset={selectedAsset}
          livePrice={livePrice}
        />

        {/* SR TIME — EARTH LANDING FINAL TARGET TERMINAL (3 ROCKET STAGES & 5-MIN VALIDITY) */}
        <div id="earth-landing-terminal">
          <SrTimeEarthLandingTerminal />
        </div>

        {/* SRBMPR - WHO VALIDATES THE VALIDATOR (FORENSIC PROOF, TARGET HITS & VERIFICATION ARCHIVE) */}
        <div id="who-validates-vault">
          <WhoValidatesTheValidatorVault
            selectedAsset={selectedAsset}
            livePrice={livePrice}
          />
        </div>

        {/* SRBMPR STRICT ACCOUNT SAFEGUARD */}
        <SrbmprStrictAccountSafeguard />

        {/* DITTO TRADINGVIEW 3D CHART WITH VISUAL MEASUREMENT OVERLAY */}
        <SrbmprTradingView3DChart
          selectedAsset={selectedAsset}
          livePrice={livePrice}
        />

        {/* SRBMPR FORENSIC FOUR TARGET CONTAINERS & TODAY'S 24H DAILY SUMMARY */}
        <div id="target-tier-summary">
          <SrbmprForensicFourContainerLedger
            selectedAsset={selectedAsset}
            livePrice={livePrice}
          />
        </div>

        {/* SRBMPR PURE MATHEMATICAL MICRO VALIDATOR: 1-SECOND · 1:1 ONLY · 3 LAYERS · 9 POSITIONS */}
        <div id="pure-1to1-validator">
          <SrbmprMicroOneToOnePureValidator
            selectedAsset={selectedAsset}
            livePrice={livePrice}
          />
        </div>

        {/* SRBMPR REPLAY LEDGER: CHRONOLOGICAL EXECUTION AUDIT & TAMPER-PROOF PROOFS */}
        <div id="replay-ledger" className="max-w-[1400px] mx-auto px-4">
          <SrbmprReplayLedger />
        </div>

        {/* SRBMPR 100 COIN WORKSPACE BOARD */}
        <Srbmpr100CoinWorkspaceBoard />

        {/* SRBMPR UNIFIED EVENT ENGINE & BOT GATEWAY (CRICKET SPLIT & ANTI-DECEPTION LIVE GUARD) */}
        <SrbmprUnifiedEventEngineWorkspace
          selectedAsset={selectedAsset}
          livePrice={livePrice}
          onOpenPineModal={() => setIsPineModalOpen(true)}
        />

        {/* PRIMARY VIEW: DEDICATED SRBMPR PROJECTION TOOL (LIVE PRICE / ENTRY / SL / TARGET / RR) */}
        {(viewMode === 'PROJECTION' || viewMode === 'ALL') && (
          <SrbmprDedicatedProjectionScreen
            selectedAsset={selectedAsset}
            livePrice={livePrice}
            selectedExchange={selectedExchange}
            onFullSync={handleFullSync}
          />
        )}

        {/* PRIMARY VIEW: 1:100 TO 1:1000 HORIZON ENGINE & RE-ENTRY LADDER */}
        {(viewMode === 'HORIZON' || viewMode === 'ALL') && (
          <SrMultiCoinHorizonPage
            timezone={timezone}
            onSelectTimezone={setTimezone}
            selectedExchange={selectedExchange}
          />
        )}

        {/* PRIMARY VIEW: SCALPING FLIGHT TICKET (Mobile-Friendly, Left Limit Order, Right Risk Management & P&L) */}
        {(viewMode === 'TICKET' || viewMode === 'ALL') && (
          <SrScalpingTicketTerminal
            exchange={selectedExchange}
            asset={selectedAsset}
            layerState={layerState}
            livePrice={livePrice}
            onFullSync={handleFullSync}
            onOpenAuditReport={() => setIsBrokerAuditModalOpen(true)}
          />
        )}

        {/* CHART & DEEP MODULES (Displayed when CHART or ALL mode is selected) */}
        {(viewMode === 'CHART' || viewMode === 'ALL') && (
          <>
            {/* Live Market Overview & Technical Inspection Panels */}
            <BybitMarketOverviewHeader asset={selectedAsset} livePrice={livePrice} ticker={tickerStats} />

            <TechnicalOhlcInspectionPanel 
              candle={candles.length > 0 ? candles[candles.length - 1] : null}
              exchange={selectedExchange}
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
               
               {/* Left Column: Intelligence & Reports */}
               <div className="lg:col-span-4 space-y-8">
                  <TomorrowEntryReport 
                    reports={tomorrowReports} 
                    symbol={selectedAsset}
                    onOpenAuditReport={() => setIsBrokerAuditModalOpen(true)}
                  />
                  
                  <LiveCommunityHub />

                  <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4 font-mono">
                    <div className="flex items-center justify-between border-b border-white/5 pb-4">
                      <h2 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                        <Monitor className="w-4 h-4 text-blue-500" /> Terminal Nodes
                      </h2>
                      <span className="text-[10px] text-zinc-600 font-black">STABLE_CONNECT</span>
                    </div>
                    <div className="space-y-3">
                       <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                          <span className="text-[10px] text-zinc-400 font-bold">TradingView Layer</span>
                          <span className="text-[10px] text-emerald-400 font-black">ACTIVE</span>
                       </div>
                       <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                          <span className="text-[10px] text-zinc-400 font-bold">MT5 Layer 2</span>
                          <span className="text-[10px] text-emerald-400 font-black">SYNCED</span>
                       </div>
                       <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                          <span className="text-[10px] text-zinc-400 font-bold">Bybit V5 Public Stream</span>
                          <span className="text-[10px] text-blue-400 font-black uppercase">{marketType}</span>
                       </div>
                    </div>
                  </div>
               </div>

               {/* Right Column: Execution & Quantitative Mapping */}
               <div className="lg:col-span-8 space-y-8">
                  
                  {/* Sequential 1:1 -> 1:2 -> 1:3 Pipe State Machine */}
                  {layerState && (
                    <Srbmpr2526LayerModule 
                      layerState={layerState} 
                      onOpenAuditReport={() => setIsBrokerAuditModalOpen(true)}
                    />
                  )}

                  {/* BYBIT DEMO ACTUAL EXECUTION & 1:1 PROOF AUDIT MATCH PANEL */}
                  {selectedExchange === 'BYBIT' && (
                    <>
                      <BybitDemoExecutionPanel />
                      <SrbmprAutomationCommandCenter />
                      <SrbmprBoxStepOscillator />
                      <SrbmprFrozenInstructionBoard assetSymbol={selectedAsset} livePrice={livePrice} />
                      <SrbmprSuperScalingGantry selectedAsset={selectedAsset} livePrice={livePrice} />
                      <SrbmprMicroCompoundingAuditLedger selectedAsset={selectedAsset} />
                      <SrbmprMemePennyCoinsTerminal />
                      <SrbmprThresholdLockRestart />
                      <BybitExecutionAuditLog currentAsset={selectedAsset} lastLivePrice={livePrice} />
                      <SrbmprSequentialWaveMeasurement currentLivePrice={livePrice} />
                      <SrbmprNanoPrecisionSimulator />
                      <SrbmprTemporalPowerLedger />
                    </>
                  )}










                  {layerState && (
                    <div className="bg-gradient-to-br from-[#0a0c10] to-black border border-white/5 p-8 rounded-[40px] shadow-2xl relative overflow-hidden group">
                      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_10%_10%,rgba(59,130,246,0.05),transparent_50%)]" />
                      
                      <div className="flex items-center justify-between mb-8 relative z-10">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                            <Zap className="w-6 h-6 animate-pulse" />
                          </div>
                          <div>
                            <h3 className="text-lg font-black text-white tracking-widest uppercase italic">Quantitative Entry Activation</h3>
                            <div className="flex items-center gap-3 mt-1">
                               <span className="text-[10px] text-amber-400 font-black uppercase bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/20 tracking-tighter">
                                 Policy: Dynamic 0.10% Asset-Space SL (BTC: ~$85 | Gold: ~$4.18)
                               </span>
                               <span className="text-[10px] text-zinc-500 font-black uppercase tracking-tighter flex items-center gap-1.5">
                                 <Clock className="w-3 h-3" /> Wait for Time-Close Activation
                               </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end">
                           <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest mb-1">Time Window</span>
                           <span className="text-base font-black text-white font-mono bg-white/5 px-3 py-1 rounded-xl border border-white/10">
                             {layerState.entryTimeWindow?.start} — {layerState.entryTimeWindow?.end}
                           </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10 mb-8">
                        <div className="bg-zinc-950/80 border border-white/5 p-6 rounded-3xl backdrop-blur-xl">
                          <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">Frozen Entry Axis</span>
                          <div className="text-3xl font-black text-white mt-2 font-mono tabular-nums">${layerState.entryPrice.toLocaleString()}</div>
                          <div className="mt-3 text-[9px] text-blue-400 font-black uppercase flex items-center gap-1">
                            <BarChart3 className="w-3 h-3" /> Sequence State: {layerState.activeLayer}
                          </div>
                        </div>

                        <div className="bg-zinc-950/80 border border-rose-500/20 p-6 rounded-3xl backdrop-blur-xl">
                          <span className="text-[9px] text-rose-500/60 font-black uppercase tracking-widest italic">
                            0.10% Dynamic Stop Loss (±${layerState.slDistance || (layerState.entryPrice * 0.001).toFixed(2)})
                          </span>
                          <div className="text-3xl font-black text-rose-400 mt-2 font-mono tabular-nums">${layerState.stopLoss.toLocaleString()}</div>
                          <div className="mt-3 text-[9px] text-zinc-500 font-black uppercase italic">
                            "Asset-Space Floor: Long E - 0.1% | Short E + 0.1%"
                          </div>
                        </div>

                        <div className="bg-zinc-950/80 border border-emerald-500/20 p-6 rounded-3xl backdrop-blur-xl">
                          <span className="text-[9px] text-emerald-500/60 font-black uppercase tracking-widest">Target Objective</span>
                          <div className="text-3xl font-black text-emerald-400 mt-2 font-mono tabular-nums">${layerState.targetPrice.toLocaleString()}</div>
                          <div className="mt-3 text-[9px] text-zinc-600 font-black uppercase">"Calculated Behavioral Peak"</div>
                        </div>
                      </div>

                      <div className="space-y-3 relative z-10">
                        <div className="flex items-center justify-between">
                           <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Progressive Scale Targets (Completion Horizons)</span>
                           <span className="text-[9px] text-zinc-700 font-black">V25.26 ENGINE</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                          {layerState.scalingTargets.map((st) => (
                            <div key={st.ratio} className={`p-4 rounded-2xl border text-center transition-all ${st.reached ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-white/5 border-white/5 opacity-60'}`}>
                               <div className="text-[10px] font-black text-white">1:{st.ratio}</div>
                               <div className="text-[11px] font-bold text-zinc-300 mt-1 font-mono">${st.price.toLocaleString()}</div>
                               {st.timeWindow && (
                                 <div className="text-[8px] text-amber-400 font-mono mt-1 font-bold">{st.timeWindow}</div>
                               )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <SrbmprMechanismChartContainer
                    exchange={selectedExchange}
                    asset={selectedAsset}
                    layerState={layerState!}
                    buyLiquidity={buyLiquidity}
                    sellLiquidity={sellLiquidity}
                    livePrice={livePrice}
                  />

                  <ResearchPipelineWorkspace />
               </div>
            </div>
          </>
        )}

        {/* BOTTOM WORKSTATION MODULES (Rendered in CHART or ALL view mode) */}
        {(viewMode === 'CHART' || viewMode === 'ALL') && (
          <>
            <div className="pt-4">
              <SrbmprLimitOrderTerminalCanvas
                exchange={selectedExchange}
                asset={selectedAsset}
                layerState={layerState}
                livePrice={livePrice}
              />
            </div>

            <BrokerFootprintWorkspace asset={selectedAsset} />
            <SrbmprBehavioralLaboratory />
            <SrNewTraderInsight />
          </>
        )}

      </main>

      {/* Modals */}
      <KaliAuditEngineModal 
        isOpen={isKaliAuditModalOpen} 
        onClose={() => setIsKaliAuditModalOpen(false)} 
        auditSummary={engine.getKaliAuditSummary()} 
      />
      <PineScriptGeneratorModal isOpen={isPineModalOpen} onClose={() => setIsPineModalOpen(false)} />
      <ForwardTestReportModal isOpen={isArchiveModalOpen} onClose={() => setIsArchiveModalOpen(false)} archives={engine.getArchive()} />
      <SraiOperationsAgentModal isOpen={isAgentModalOpen} onClose={() => setIsAgentModalOpen(false)} />
      <PublicResearchPortfolioModal 
        isOpen={isPortfolioModalOpen} 
        onClose={() => setIsPortfolioModalOpen(false)} 
        onOpenArchive={() => setIsArchiveModalOpen(true)}
        onOpenPineScript={() => setIsPineModalOpen(true)}
      />
      <SrJarvisAssistantModal isOpen={isJarvisModalOpen} onClose={() => setIsJarvisModalOpen(false)} />
      <DailyBrokerAuditReportModal 
        isOpen={isBrokerAuditModalOpen} 
        onClose={() => setIsBrokerAuditModalOpen(false)} 
        auditSummary={engine.generate24HourBrokerAuditReport(selectedExchange, selectedAsset)} 
      />
      <AutomatedPublishAuditModal
        isOpen={isPublishAuditModalOpen}
        onClose={() => setIsPublishAuditModalOpen(false)}
      />
      <LiveCollaborationModal
        isOpen={isLiveZoomModalOpen}
        onClose={() => setIsLiveZoomModalOpen(false)}
        activeAsset={selectedAsset}
        livePrice={livePrice}
      />
      <SrbmprApiKeyAndSystemExplainerModal
        isOpen={isExplainerModalOpen}
        onClose={() => setIsExplainerModalOpen(false)}
      />

    </div>
  );
}
