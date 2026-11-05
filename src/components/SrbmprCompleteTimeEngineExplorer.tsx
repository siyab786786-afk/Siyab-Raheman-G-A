import React, { useState, useMemo } from 'react';
import {
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  ArrowLeft,
  ArrowRight,
  Search,
  Clock,
  Layers,
  ShieldCheck,
  Database,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  StepForward,
  StepBack,
  RotateCcw,
  Maximize2,
  Eye,
  Compass,
  FileSpreadsheet,
  Activity,
  Target,
  GitBranch,
  Lock
} from 'lucide-react';
import {
  ForwardTimeframe,
  RawOhlcBar
} from '../services/SrbmprForwardTestEngine';
import {
  ReplayFrontierEvaluation,
  ReplayDatasetReport,
  ReplayDatasetSizeOption,
  VerifiedControllerStatus,
  DisplayTimezoneId,
  SUPPORTED_TIMEZONES,
  CandleStructuralAnnotation,
  ReplayMechanismDecision
} from '../services/SrbmprReplayTestCoreEngine';

export type SrTimeEngineModuleId =
  | 'FULL_3D_CHART_ONLY'
  | 'SR_TIME_ENGINE'
  | 'BACK_TEST_LEFT'
  | 'FORWARD_TEST_RIGHT'
  | 'REPLAY_TEST_CORE'
  | 'MECHANISM_1_1'
  | 'MECHANISM_1_2'
  | 'MECHANISM_1_3'
  | 'LEFT_HIGH_LOW_BEHAVIOR'
  | 'RIGHT_HIGH_LOW_BEHAVIOR'
  | 'SEQUENCE_CYCLE_LEDGER'
  | 'ENTRY_SL_TARGET_EVAL'
  | 'HISTORICAL_DATA_ARCHIVE'
  | 'TIMEFRAME_TIMEZONE_CONTROLLER'
  | 'AUDIT_VALIDATION_LEDGER';

interface EngineFolderItem {
  folderId: string;
  folderName: string;
  modules: Array<{
    id: SrTimeEngineModuleId;
    numberLabel: string;
    title: string;
    shortDesc: string;
    assetIcon: string;
  }>;
}

export const SR_TIME_ENGINE_FOLDERS: EngineFolderItem[] = [
  {
    folderId: 'FOLDER_01_CORE_TIME_REPLAY',
    folderName: '01. Core Time & Connected Replay',
    modules: [
      {
        id: 'SR_TIME_ENGINE',
        numberLabel: '01',
        title: 'SR Time Engine',
        shortDesc: 'Master UTC / Multi-Timezone Clock & Candle Horizon',
        assetIcon: '/assets/icons/cycle-origin-3d.svg'
      },
      {
        id: 'BACK_TEST_LEFT',
        numberLabel: '02',
        title: 'Back Test — LEFT Context',
        shortDesc: 'Historical LEFT-side market structure & completed rotations',
        assetIcon: '/assets/mechanisms/left-hlh-3d.svg'
      },
      {
        id: 'FORWARD_TEST_RIGHT',
        numberLabel: '03',
        title: 'Forward Test — RIGHT Context',
        shortDesc: 'Forward progression boundary & unrevealed right-side verification',
        assetIcon: '/assets/mechanisms/right-lhl-3d.svg'
      },
      {
        id: 'REPLAY_TEST_CORE',
        numberLabel: '04',
        title: 'Replay Test — Core Engine',
        shortDesc: 'Connected chronological testing framework (Back + Frontier + Forward)',
        assetIcon: '/assets/icons/cycle-completion-3d.svg'
      }
    ]
  },
  {
    folderId: 'FOLDER_02_PIPE_MECHANISMS',
    folderName: '02. Pipe Mechanisms (1:1 → 1:3)',
    modules: [
      {
        id: 'MECHANISM_1_1',
        numberLabel: '05',
        title: '1:1 Mechanism',
        shortDesc: 'First structural target pipe validation & 1:1 hit records',
        assetIcon: '/assets/mechanisms/pipe-1to1-3d.svg'
      },
      {
        id: 'MECHANISM_1_2',
        numberLabel: '06',
        title: '1:2 Mechanism',
        shortDesc: 'Second structural expansion pipe & 1:2 progression state',
        assetIcon: '/assets/mechanisms/pipe-1to2-3d.svg'
      },
      {
        id: 'MECHANISM_1_3',
        numberLabel: '07',
        title: '1:3 Mechanism',
        shortDesc: 'Full 1:3 structural completion horizon & R-multiple scaling',
        assetIcon: '/assets/mechanisms/pipe-1to3-3d.svg'
      }
    ]
  },
  {
    folderId: 'FOLDER_03_STRUCTURAL_BEHAVIOR',
    folderName: '03. HIGH/LOW & Sequence Ledger',
    modules: [
      {
        id: 'LEFT_HIGH_LOW_BEHAVIOR',
        numberLabel: '08',
        title: 'LEFT-Side HIGH/LOW Behavior',
        shortDesc: 'High → Low → High (H-Complete → Lower High Break → SHORT)',
        assetIcon: '/assets/structure/high-to-low-3d.svg'
      },
      {
        id: 'RIGHT_HIGH_LOW_BEHAVIOR',
        numberLabel: '09',
        title: 'RIGHT-Side HIGH/LOW Behavior',
        shortDesc: 'Low → High → Low (L-Complete → Higher Low Break → LONG)',
        assetIcon: '/assets/structure/low-to-high-3d.svg'
      },
      {
        id: 'SEQUENCE_CYCLE_LEDGER',
        numberLabel: '10',
        title: 'Sequence and Cycle Ledger',
        shortDesc: 'Zero-1..3 & Honest One..Three 6-stage behavioral ledger',
        assetIcon: '/assets/icons/cycle-apex-3d.svg'
      }
    ]
  },
  {
    folderId: 'FOLDER_04_EVAL_ARCHIVE_AUDIT',
    folderName: '04. Execution, Archive & Audit',
    modules: [
      {
        id: 'ENTRY_SL_TARGET_EVAL',
        numberLabel: '11',
        title: 'Entry / Stop Loss / Target Evaluation',
        shortDesc: 'Exact Open Entry, 0.1% Pivot Stop Loss & R-Target calculator',
        assetIcon: '/assets/structure/high-extreme-3d.svg'
      },
      {
        id: 'HISTORICAL_DATA_ARCHIVE',
        numberLabel: '12',
        title: 'Historical Data Archive',
        shortDesc: '1,000 / 3,500 Raw OHLCV dataset inspector & CSV export',
        assetIcon: '/assets/candles/bull-3d-neon.svg'
      },
      {
        id: 'TIMEFRAME_TIMEZONE_CONTROLLER',
        numberLabel: '13',
        title: 'Timeframe & Time-Zone Controller',
        shortDesc: '1m, 5m, 15m, 1h, 4h, 1D, 1W, 1M + UTC & regional timezones',
        assetIcon: '/assets/icons/cycle-transition-3d.svg'
      },
      {
        id: 'AUDIT_VALIDATION_LEDGER',
        numberLabel: '14',
        title: 'Audit and Validation Ledger',
        shortDesc: 'No-lookahead proofs, Verified Controller & cryptographic hashes',
        assetIcon: '/assets/icons/cycle-completion-3d.svg'
      }
    ]
  }
];

interface SrbmprCompleteTimeEngineExplorerProps {
  activeModule: SrTimeEngineModuleId;
  onSelectModule: (mod: SrTimeEngineModuleId) => void;
  navHistory: SrTimeEngineModuleId[];
  navHistoryIndex: number;
  onNavigateBack: () => void;
  onNavigateForward: () => void;
  isSidebarExpanded: boolean;
  onToggleSidebar: () => void;
  selectedSymbol: string;
  marketCategory: 'linear' | 'spot';
  selectedTimeframe: ForwardTimeframe;
  onSelectTimeframe: (tf: ForwardTimeframe) => void;
  displayTimezone: DisplayTimezoneId;
  onSelectTimezone: (tz: DisplayTimezoneId) => void;
  datasetSizeOption: ReplayDatasetSizeOption;
  onSelectDatasetSize: (size: ReplayDatasetSizeOption) => void;
  waitCandlesRule: number;
  onSelectWaitRule: (w: number) => void;
  fullCandles: RawOhlcBar[];
  datasetReport: ReplayDatasetReport | null;
  isLoadingCandles: boolean;
  replayStartIndex: number;
  forwardCursor: number;
  onJumpToBarIndex: (barIndex0Based: number) => void;
  onStepPrevCandle: () => void;
  onStepNextCandle: () => void;
  onToggleAutoPlay: () => void;
  isAutoPlaying: boolean;
  onResetReplayStart: () => void;
  frontierEvaluation: ReplayFrontierEvaluation;
  inspectedCandle: RawOhlcBar | null;
  inspectedBarNumber: number;
  inspectedAnnotation: CandleStructuralAnnotation | null;
  controllerStatus: VerifiedControllerStatus | null;
  onReverifyController: () => void;
  formatPrice: (p: number) => string;
  formatTs: (tsMs: number) => string;
}

const ALL_TIMEFRAMES: ForwardTimeframe[] = ['1m', '5m', '15m', '1h', '4h', '1D', '1W', '1M'];

export const SrbmprCompleteTimeEngineExplorer: React.FC<SrbmprCompleteTimeEngineExplorerProps> = ({
  activeModule,
  onSelectModule,
  navHistoryIndex,
  navHistory,
  onNavigateBack,
  onNavigateForward,
  isSidebarExpanded,
  onToggleSidebar,
  selectedSymbol,
  marketCategory,
  selectedTimeframe,
  onSelectTimeframe,
  displayTimezone,
  onSelectTimezone,
  datasetSizeOption,
  onSelectDatasetSize,
  waitCandlesRule,
  onSelectWaitRule,
  fullCandles,
  datasetReport,
  isLoadingCandles,
  replayStartIndex,
  forwardCursor,
  onJumpToBarIndex,
  onStepPrevCandle,
  onStepNextCandle,
  onToggleAutoPlay,
  isAutoPlaying,
  onResetReplayStart,
  frontierEvaluation,
  inspectedCandle,
  inspectedBarNumber,
  inspectedAnnotation,
  controllerStatus,
  onReverifyController,
  formatPrice,
  formatTs
}) => {
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    FOLDER_01_CORE_TIME_REPLAY: true,
    FOLDER_02_PIPE_MECHANISMS: true,
    FOLDER_03_STRUCTURAL_BEHAVIOR: true,
    FOLDER_04_EVAL_ARCHIVE_AUDIT: true
  });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [archivePage, setArchivePage] = useState<number>(0);

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => ({ ...prev, [folderId]: !prev[folderId] }));
  };

  // Find current folder & module metadata for breadcrumbs
  const currentBreadcrumb = useMemo(() => {
    if (activeModule === 'FULL_3D_CHART_ONLY') {
      return {
        folderName: 'Primary 3D Workspace',
        moduleTitle: '3D Neon Candlestick & Replay Canvas',
        numberLabel: '00'
      };
    }
    for (const folder of SR_TIME_ENGINE_FOLDERS) {
      const found = folder.modules.find((m) => m.id === activeModule);
      if (found) {
        return {
          folderName: folder.folderName,
          moduleTitle: `${found.numberLabel}. ${found.title}`,
          numberLabel: found.numberLabel
        };
      }
    }
    return {
      folderName: 'SRBMPR Workspace',
      moduleTitle: 'SR Time Engine',
      numberLabel: '01'
    };
  }, [activeModule]);

  // Filter folders/modules and records by search query
  const filteredFolders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return SR_TIME_ENGINE_FOLDERS;
    return SR_TIME_ENGINE_FOLDERS.map((folder) => ({
      ...folder,
      modules: folder.modules.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          m.shortDesc.toLowerCase().includes(q) ||
          m.numberLabel.includes(q)
      )
    })).filter((f) => f.modules.length > 0);
  }, [searchQuery]);

  // Matching decisions/events when searching in sidebar
  const matchingRecords = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return frontierEvaluation.visibleDecisionsUpToFrontier.filter(
      (d) =>
        d.id.toLowerCase().includes(q) ||
        d.stage.toLowerCase().includes(q) ||
        d.direction.toLowerCase().includes(q) ||
        d.connectionBreakDetail.toLowerCase().includes(q)
    );
  }, [searchQuery, frontierEvaluation.visibleDecisionsUpToFrontier]);

  // Decisions split by Back Test (LEFT) vs Forward Progression (RIGHT of replayStartIndex)
  const backTestDecisions = useMemo(
    () =>
      frontierEvaluation.visibleDecisionsUpToFrontier.filter(
        (d) => d.decisionCandleIndex <= replayStartIndex + 1
      ),
    [frontierEvaluation.visibleDecisionsUpToFrontier, replayStartIndex]
  );

  const forwardRevealedDecisions = useMemo(
    () =>
      frontierEvaluation.visibleDecisionsUpToFrontier.filter(
        (d) => d.decisionCandleIndex > replayStartIndex + 1
      ),
    [frontierEvaluation.visibleDecisionsUpToFrontier, replayStartIndex]
  );

  const pipe11Decisions = useMemo(
    () => frontierEvaluation.visibleDecisionsUpToFrontier.filter((d) => d.pipe11Reached),
    [frontierEvaluation.visibleDecisionsUpToFrontier]
  );
  const pipe12Decisions = useMemo(
    () => frontierEvaluation.visibleDecisionsUpToFrontier.filter((d) => d.pipe12Reached),
    [frontierEvaluation.visibleDecisionsUpToFrontier]
  );
  const pipe13Decisions = useMemo(
    () => frontierEvaluation.visibleDecisionsUpToFrontier.filter((d) => d.pipe13Reached),
    [frontierEvaluation.visibleDecisionsUpToFrontier]
  );

  // Determine dataset operational state badge
  const engineDataStatus: 'LOADED' | 'LOADING' | 'SHORTAGE' | 'UNAVAILABLE' = isLoadingCandles
    ? 'LOADING'
    : fullCandles.length === 0
    ? 'UNAVAILABLE'
    : datasetReport?.shortageReported
    ? 'SHORTAGE'
    : 'LOADED';

  const activeDec = frontierEvaluation.activeDecisionAtFrontier;

  // CSV Export helper for Historical Data Archive
  const handleDownloadCsv = () => {
    if (fullCandles.length === 0) return;
    const headers = 'Index,Timestamp_UTC,Display_Time,Open,High,Low,Close,Volume,Structural_Role,Stage\n';
    const rows = fullCandles
      .slice(0, forwardCursor + 1)
      .map((c) => {
        const ann = frontierEvaluation.candleAnnotationsByBarIndex[c.index];
        return `${c.index},${c.timeFormatted},${formatTs(c.timestamp)},${c.open},${c.high},${c.low},${c.close},${c.volume || 0},${ann?.structuralRole || 'STANDARD'},${ann?.stageLabel || '-'}`;
      })
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SRBMPR_${selectedSymbol}_${selectedTimeframe}_Bar${forwardCursor + 1}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col border-t border-zinc-800/90 bg-[#080a10] text-zinc-100 font-mono">
      {/* =================================================================== */}
      {/* GOOGLE-WORKFLOW BREADCRUMB & NAVIGATION HISTORY BAR                 */}
      {/* =================================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-[#0d1018] border-b border-zinc-800/80 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Expand / Collapse Folder Tree Button */}
          <button
            onClick={onToggleSidebar}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-amber-300 border border-amber-500/30 rounded font-bold transition-colors"
            title="Expand or Collapse Google-Workflow Folder Explorer"
          >
            {isSidebarExpanded ? (
              <FolderOpen className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Folder className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span>{isSidebarExpanded ? 'Hide Explorer' : 'Open SR Time Explorer (14 Modules)'}</span>
          </button>

          {/* Navigation History Back & Forward Controls (Distinct from Back Test Market Data) */}
          <div className="flex items-center gap-1 bg-zinc-950 p-0.5 rounded border border-zinc-800">
            <button
              onClick={onNavigateBack}
              disabled={navHistoryIndex <= 0}
              className="flex items-center gap-1 px-2 py-1 rounded hover:bg-zinc-800 disabled:opacity-35 text-zinc-200 transition-colors"
              title="Navigate Back to Previous View (Preserves Symbol, Timeframe & Replay Frontier)"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back View</span>
            </button>
            <button
              onClick={onNavigateForward}
              disabled={navHistoryIndex >= navHistory.length - 1}
              className="flex items-center gap-1 px-2 py-1 rounded hover:bg-zinc-800 disabled:opacity-35 text-zinc-200 transition-colors"
              title="Navigate Forward in View History"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Breadcrumb Path */}
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 px-2 py-1 bg-zinc-950/80 rounded border border-zinc-800/70">
            <button
              onClick={() => onSelectModule('FULL_3D_CHART_ONLY')}
              className="hover:text-amber-300 transition-colors font-semibold"
            >
              SRBMPR Workspace
            </button>
            <ChevronRight className="w-3 h-3 text-zinc-600" />
            <span className="text-zinc-300">{currentBreadcrumb.folderName}</span>
            <ChevronRight className="w-3 h-3 text-zinc-600" />
            <span className="text-amber-400 font-bold">{currentBreadcrumb.moduleTitle}</span>
          </div>
        </div>

        {/* Right: Persistent State Preservation Badge + One-Click Return to Full Chart */}
        <div className="flex flex-wrap items-center gap-2 text-[11px]">
          {/* State Preservation Readout */}
          <div className="hidden md:flex items-center gap-2 px-2.5 py-1 bg-zinc-950 border border-zinc-800 rounded text-zinc-300">
            <span>
              Symbol: <strong className="text-amber-400">{selectedSymbol}</strong>
            </span>
            <span className="text-zinc-600">·</span>
            <span>
              TF: <strong className="text-cyan-400">{selectedTimeframe}</strong>
            </span>
            <span className="text-zinc-600">·</span>
            <span>
              TZ: <strong className="text-emerald-400">{displayTimezone}</strong>
            </span>
            <span className="text-zinc-600">·</span>
            <span>
              Frontier: <strong className="text-white">Bar #{frontierEvaluation.frontierBarNumber}</strong>
            </span>
          </div>

          {/* Engine Status Indicator */}
          <span
            className={`px-2 py-1 rounded font-bold text-[10px] ${
              engineDataStatus === 'LOADED'
                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                : engineDataStatus === 'LOADING'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse'
                : engineDataStatus === 'SHORTAGE'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
            }`}
          >
            STATE: {engineDataStatus} ({fullCandles.length.toLocaleString()} BARS)
          </span>

          {activeModule !== 'FULL_3D_CHART_ONLY' && (
            <button
              onClick={() => onSelectModule('FULL_3D_CHART_ONLY')}
              className="flex items-center gap-1 px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded transition-colors"
            >
              <Maximize2 className="w-3 h-3" />
              Return to Full 3D Chart
            </button>
          )}
        </div>
      </div>

      {/* =================================================================== */}
      {/* WORKSPACE BODY: LEFT GOOGLE-WORKFLOW TREE + RIGHT MODULE INSPECTOR  */}
      {/* =================================================================== */}
      {(isSidebarExpanded || activeModule !== 'FULL_3D_CHART_ONLY') && (
        <div className="flex flex-col lg:flex-row w-full min-h-[340px] max-h-[540px] overflow-hidden">
          {/* LEFT: EXPANDABLE FOLDER-STYLE NAVIGATION PANEL */}
          {isSidebarExpanded && (
            <div className="w-full lg:w-80 shrink-0 bg-[#0b0d14] border-b lg:border-b-0 lg:border-r border-zinc-800/80 flex flex-col max-h-[540px]">
              {/* Module & Record Search Input */}
              <div className="p-2.5 border-b border-zinc-800/80">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search 14 modules, stages, IDs..."
                    className="w-full pl-8 pr-3 py-1 bg-zinc-950 border border-zinc-800 rounded text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Nested Folder Explorer Tree */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
                {filteredFolders.map((folder) => {
                  const isOpen = expandedFolders[folder.folderId] ?? true;
                  return (
                    <div key={folder.folderId} className="rounded border border-zinc-800/60 bg-zinc-950/50">
                      <button
                        onClick={() => toggleFolder(folder.folderId)}
                        className="w-full flex items-center justify-between px-2.5 py-1.5 text-left text-[11px] font-bold text-zinc-200 hover:bg-zinc-900/80 transition-colors"
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          {isOpen ? (
                            <FolderOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          ) : (
                            <Folder className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          )}
                          <span className="truncate">{folder.folderName}</span>
                        </div>
                        {isOpen ? (
                          <ChevronDown className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                        )}
                      </button>

                      {isOpen && (
                        <div className="pl-3 pr-1.5 pb-1.5 space-y-1 border-t border-zinc-800/40 pt-1">
                          {folder.modules.map((mod) => {
                            const isSelected = activeModule === mod.id;
                            return (
                              <button
                                key={mod.id}
                                onClick={() => onSelectModule(mod.id)}
                                className={`w-full flex items-center justify-between gap-2 px-2 py-1.5 rounded text-left text-[11px] transition-colors ${
                                  isSelected
                                    ? 'bg-amber-500/20 border border-amber-500/50 text-amber-300 font-bold'
                                    : 'hover:bg-zinc-900 text-zinc-300'
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0">
                                  <img
                                    src={mod.assetIcon}
                                    alt={mod.title}
                                    className="w-4 h-4 shrink-0 object-contain"
                                    loading="lazy"
                                  />
                                  <span className="truncate">
                                    <span className="text-zinc-500 mr-1">{mod.numberLabel}.</span>
                                    {mod.title}
                                  </span>
                                </div>
                                <span className="text-[9px] text-emerald-400 shrink-0">READY</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Matching Decision Records in Search */}
                {searchQuery.trim() && matchingRecords.length > 0 && (
                  <div className="p-2 bg-zinc-950 border border-zinc-800 rounded space-y-1">
                    <div className="text-[10px] font-bold text-cyan-400 uppercase">
                      Matching Engine Records ({matchingRecords.length})
                    </div>
                    {matchingRecords.slice(0, 6).map((rec) => (
                      <button
                        key={rec.id}
                        onClick={() => {
                          onJumpToBarIndex(Math.max(2, rec.decisionCandleIndex - 1));
                          onSelectModule('ENTRY_SL_TARGET_EVAL');
                        }}
                        className="w-full flex items-center justify-between px-2 py-1 rounded bg-black hover:bg-zinc-900 text-[10px] text-left"
                      >
                        <span className="text-amber-300 font-bold">{rec.id}</span>
                        <span className="text-zinc-300">{rec.stage}</span>
                        <span className={rec.direction === 'LONG' ? 'text-emerald-400' : 'text-rose-400'}>
                          {rec.direction} @ Bar #{rec.decisionCandleIndex}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* RIGHT: ACTIVE MODULE WORKSPACE (ALL 14 REQUIRED MODULES) */}
          <div className="flex-1 overflow-y-auto p-3.5 bg-[#090b12] space-y-3">
            {/* =============================================================== */}
            {/* DEFAULT COMPACT MATRIX WHEN IN FULL_3D_CHART_ONLY MODE          */}
            {/* =============================================================== */}
            {activeModule === 'FULL_3D_CHART_ONLY' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 text-xs">
                {/* Card 1: Selected / Hovered 3D Candle & Structural Asset State */}
                <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
                    <span className="font-bold text-amber-400 text-[11px] uppercase">
                      Selected 3D Candle & Structural Asset
                    </span>
                    <span className="text-[10px] text-zinc-400">
                      Bar #{inspectedBarNumber} / {fullCandles.length}
                    </span>
                  </div>
                  {inspectedCandle ? (
                    <div className="space-y-2 text-[11px]">
                      <div className="flex items-center justify-between bg-black/70 p-2 rounded border border-zinc-800">
                        <div className="flex items-center gap-2">
                          <img
                            src={
                              inspectedCandle.close >= inspectedCandle.open
                                ? '/assets/candles/bull-3d-neon.svg'
                                : '/assets/candles/bear-3d-neon.svg'
                            }
                            alt="3D Candle"
                            className="w-6 h-8 object-contain"
                          />
                          <div>
                            <div className="text-white font-bold">
                              {formatTs(inspectedCandle.timestamp)} ({displayTimezone})
                            </div>
                            <div className="text-[10px] text-zinc-400">
                              UTC Source: {inspectedCandle.timeFormatted} UTC
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-[10px] text-zinc-400">VOLUME</div>
                          <div className="text-cyan-400 font-bold">
                            {(inspectedCandle.volume ?? 0).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-1.5 text-center">
                        <div className="bg-black/60 p-1.5 rounded border border-zinc-800">
                          <div className="text-[9px] text-zinc-500">OPEN</div>
                          <div className="text-white font-bold">{formatPrice(inspectedCandle.open)}</div>
                        </div>
                        <div className="bg-black/60 p-1.5 rounded border border-zinc-800">
                          <div className="text-[9px] text-emerald-400">HIGH</div>
                          <div className="text-emerald-400 font-bold">{formatPrice(inspectedCandle.high)}</div>
                        </div>
                        <div className="bg-black/60 p-1.5 rounded border border-zinc-800">
                          <div className="text-[9px] text-rose-400">LOW</div>
                          <div className="text-rose-400 font-bold">{formatPrice(inspectedCandle.low)}</div>
                        </div>
                        <div className="bg-black/60 p-1.5 rounded border border-zinc-800">
                          <div className="text-[9px] text-amber-400">CLOSE</div>
                          <div className="text-amber-300 font-bold">{formatPrice(inspectedCandle.close)}</div>
                        </div>
                      </div>

                      {inspectedAnnotation ? (
                        <div className="flex items-center gap-2.5 p-2 rounded bg-amber-500/10 border border-amber-500/30">
                          <img
                            src={inspectedAnnotation.assetPath}
                            alt={inspectedAnnotation.shortBadge}
                            className="w-8 h-8 object-contain shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="text-amber-300 font-bold text-[11px]">
                              {inspectedAnnotation.shortBadge} • {inspectedAnnotation.cyclePhase} ({inspectedAnnotation.stageLabel})
                            </div>
                            <div className="text-[10px] text-zinc-300 truncate">
                              {inspectedAnnotation.explanation}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="p-2 rounded bg-black/50 border border-zinc-800/80 text-[10px] text-zinc-400">
                          Standard Intra-Wave Progression Bar (No extreme pivot completion on this exact bar).
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>

                {/* Card 2: LEFT (HLH) & RIGHT (LHL) Frontier Summary */}
                <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
                    <span className="font-bold text-cyan-400 text-[11px] uppercase">
                      LEFT & RIGHT Mechanism @ Bar #{frontierEvaluation.frontierBarNumber}
                    </span>
                    <button
                      onClick={() => onSelectModule('SEQUENCE_CYCLE_LEDGER')}
                      className="text-[10px] text-amber-400 hover:underline"
                    >
                      Open Cycle Ledger →
                    </button>
                  </div>
                  <div className="p-2 bg-black/70 rounded border border-amber-500/20 flex items-center gap-2.5">
                    <img
                      src="/assets/mechanisms/left-hlh-3d.svg"
                      alt="LEFT HLH"
                      className="w-10 h-8 object-contain shrink-0"
                    />
                    <div className="min-w-0 flex-1 text-[11px]">
                      <div className="flex items-center justify-between">
                        <span className="text-amber-300 font-bold">LEFT (High→Low→High)</span>
                        <span className="text-[10px] text-zinc-400">
                          Next: {frontierEvaluation.leftSideState.nextStageLabel}
                        </span>
                      </div>
                      <div className="text-[10px] text-zinc-300 truncate">
                        {frontierEvaluation.leftSideState.unfinishedBehaviorState}
                      </div>
                    </div>
                  </div>

                  <div className="p-2 bg-black/70 rounded border border-cyan-500/20 flex items-center gap-2.5">
                    <img
                      src="/assets/mechanisms/right-lhl-3d.svg"
                      alt="RIGHT LHL"
                      className="w-10 h-8 object-contain shrink-0"
                    />
                    <div className="min-w-0 flex-1 text-[11px]">
                      <div className="flex items-center justify-between">
                        <span className="text-cyan-300 font-bold">RIGHT (Low→High→Low)</span>
                        <span className="text-[10px] text-zinc-400">
                          Next: {frontierEvaluation.rightSideState.nextStageLabel}
                        </span>
                      </div>
                      <div className="text-[10px] text-zinc-300 truncate">
                        {frontierEvaluation.rightSideState.unfinishedBehaviorState}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card 3: Active Frontier Entry / SL / 1:1-1:3 Pipe Summary */}
                <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
                    <span className="font-bold text-emerald-400 text-[11px] uppercase">
                      Active Entry / SL / 1:1→1:3 Evaluation
                    </span>
                    <button
                      onClick={() => onSelectModule('ENTRY_SL_TARGET_EVAL')}
                      className="text-[10px] text-amber-400 hover:underline"
                    >
                      Inspect Rules →
                    </button>
                  </div>
                  {activeDec ? (
                    <div className="space-y-2 text-[11px]">
                      <div className="flex items-center justify-between bg-black/70 p-2 rounded border border-zinc-800">
                        <span className="font-bold text-white">
                          {activeDec.id} ({activeDec.direction} • {activeDec.stage})
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                          {activeDec.statusAtFrontier}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-1.5 text-center">
                        <div className="bg-black/70 p-1.5 rounded border border-zinc-800">
                          <div className="text-[9px] text-zinc-500">ENTRY</div>
                          <div className="text-white font-bold">{formatPrice(activeDec.entryPrice)}</div>
                        </div>
                        <div className="bg-black/70 p-1.5 rounded border border-rose-500/30">
                          <div className="text-[9px] text-rose-400">SL (0.1%)</div>
                          <div className="text-rose-400 font-bold">{formatPrice(activeDec.stopLossPrice)}</div>
                        </div>
                        <div className="bg-black/70 p-1.5 rounded border border-emerald-500/30">
                          <div className="text-[9px] text-emerald-400">1:3 TARGET</div>
                          <div className="text-emerald-400 font-bold">{formatPrice(activeDec.targets.r3)}</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-zinc-500 text-[11px] py-6 text-center">
                      No confirmed setup at Bar #{frontierEvaluation.frontierBarNumber}. Step forward (+1) to evaluate.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* =============================================================== */}
            {/* MODULE 01: SR TIME ENGINE                                       */}
            {/* =============================================================== */}
            {activeModule === 'SR_TIME_ENGINE' && (
              <div className="space-y-3 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                  <div className="flex items-center gap-3">
                    <img src="/assets/icons/cycle-origin-3d.svg" alt="SR Time Engine" className="w-8 h-8" />
                    <div>
                      <h3 className="text-sm font-bold text-white">01. SR Time Engine — Temporal & Multi-Timeframe Core</h3>
                      <p className="text-[11px] text-zinc-400">
                        Synchronizes UTC source timestamps, regional display timezones, and strict bar-close boundaries across all 8 timeframes.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-amber-500/15 border border-amber-500/40 text-amber-300 rounded font-bold">
                      Frontier UTC: {frontierEvaluation.frontierCandle.timeFormatted}
                    </span>
                    <span className="px-2.5 py-1 bg-cyan-500/15 border border-cyan-500/40 text-cyan-300 rounded font-bold">
                      {displayTimezone}: {formatTs(frontierEvaluation.frontierCandle.timestamp)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                    <div className="text-[10px] text-zinc-400">ACTIVE SYMBOL & STREAM</div>
                    <div className="text-base font-bold text-white mt-1">
                      {selectedSymbol} ({marketCategory.toUpperCase()})
                    </div>
                    <div className="text-[10px] text-emerald-400 mt-1">
                      Source: {datasetReport?.source || 'BYBIT_V5_LIVE'}
                    </div>
                  </div>
                  <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                    <div className="text-[10px] text-zinc-400">OLDEST LOADED BAR (#1)</div>
                    <div className="text-sm font-bold text-blue-300 mt-1">
                      {fullCandles[0] ? formatTs(fullCandles[0].timestamp) : 'N/A'}
                    </div>
                    <div className="text-[10px] text-zinc-500 mt-1">
                      UTC: {datasetReport?.oldestTimestamp || 'N/A'}
                    </div>
                  </div>
                  <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                    <div className="text-[10px] text-zinc-400">REPLAY FRONTIER BAR (#{frontierEvaluation.frontierBarNumber})</div>
                    <div className="text-sm font-bold text-amber-300 mt-1">
                      {formatTs(frontierEvaluation.frontierCandle.timestamp)}
                    </div>
                    <div className="text-[10px] text-zinc-500 mt-1">
                      Close: {formatPrice(frontierEvaluation.frontierCandle.close)}
                    </div>
                  </div>
                  <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                    <div className="text-[10px] text-zinc-400">LATEST AVAILABLE BAR (#{fullCandles.length})</div>
                    <div className="text-sm font-bold text-emerald-300 mt-1">
                      {fullCandles.length > 0 ? formatTs(fullCandles[fullCandles.length - 1].timestamp) : 'N/A'}
                    </div>
                    <div className="text-[10px] text-zinc-500 mt-1">
                      Continuity: {datasetReport?.timestampContinuityVerified ? 'VERIFIED' : 'CHECK'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* =============================================================== */}
            {/* MODULE 02: BACK TEST — HISTORICAL LEFT-SIDE CONTEXT             */}
            {/* =============================================================== */}
            {activeModule === 'BACK_TEST_LEFT' && (
              <div className="space-y-3 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 bg-zinc-950 p-3 rounded-lg border border-blue-500/30">
                  <div className="flex items-center gap-3">
                    <img src="/assets/mechanisms/left-hlh-3d.svg" alt="Back Test Left" className="w-10 h-8" />
                    <div>
                      <h3 className="text-sm font-bold text-blue-300">
                        02. Back Test — Historical LEFT-Side Context (Bars #1 → #{replayStartIndex + 1})
                      </h3>
                      <p className="text-[11px] text-zinc-400">
                        Supplies the validated historical foundation to the LEFT of the Replay Test starting boundary.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onResetReplayStart}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded text-xs"
                  >
                    Align Frontier to Back Test Boundary (#{replayStartIndex + 1})
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-zinc-950 p-3 rounded border border-zinc-800">
                    <div className="text-[10px] text-zinc-400">HISTORICAL BARS ALLOCATED</div>
                    <div className="text-lg font-bold text-blue-400 mt-1">
                      {replayStartIndex + 1} Candles ({selectedTimeframe})
                    </div>
                    <div className="text-[10px] text-zinc-500 mt-0.5">
                      {fullCandles[0]?.timeFormatted} → {fullCandles[replayStartIndex]?.timeFormatted} UTC
                    </div>
                  </div>
                  <div className="bg-zinc-950 p-3 rounded border border-zinc-800">
                    <div className="text-[10px] text-zinc-400">HISTORICAL DECISIONS (LEFT ZONE)</div>
                    <div className="text-lg font-bold text-white mt-1">{backTestDecisions.length} Confirmed Setups</div>
                    <div className="text-[10px] text-emerald-400 mt-0.5">
                      Used to anchor initial Zero→Honest cycle count
                    </div>
                  </div>
                  <div className="bg-zinc-950 p-3 rounded border border-zinc-800">
                    <div className="text-[10px] text-zinc-400">STRUCTURAL CONTINUITY TO FRONTIER</div>
                    <div className="text-lg font-bold text-emerald-400 mt-1">CONNECTED (NO GAP)</div>
                    <div className="text-[10px] text-zinc-500 mt-0.5">
                      State machine carries directly into Bar #{replayStartIndex + 2}
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3">
                  <div className="text-[11px] font-bold text-blue-300 mb-2 uppercase">
                    Historical Back Test Setups (Bars #1 → #{replayStartIndex + 1}) — Click any row to inspect on 3D Chart
                  </div>
                  <div className="max-h-48 overflow-y-auto divide-y divide-zinc-800/60 text-[11px]">
                    {backTestDecisions.length === 0 ? (
                      <div className="py-4 text-center text-zinc-500">
                        No historical setups inside the initial left boundary window.
                      </div>
                    ) : (
                      backTestDecisions.map((d) => (
                        <div
                          key={d.id}
                          onClick={() => onJumpToBarIndex(d.decisionCandleIndex - 1)}
                          className="py-1.5 px-2 hover:bg-zinc-900 flex items-center justify-between cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-blue-400 font-bold">Bar #{d.decisionCandleIndex}</span>
                            <span className="text-zinc-400">{d.decisionTimestamp}</span>
                            <span className={d.direction === 'LONG' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                              {d.direction}
                            </span>
                            <span className="text-amber-300">({d.stage})</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span>Entry: {formatPrice(d.entryPrice)}</span>
                            <span className="text-rose-400">SL: {formatPrice(d.stopLossPrice)}</span>
                            <span className="text-emerald-400 font-bold">{d.highestRatioHitAtFrontier}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* =============================================================== */}
            {/* MODULE 03: FORWARD TEST — FORWARD RIGHT-SIDE CONTEXT            */}
            {/* =============================================================== */}
            {activeModule === 'FORWARD_TEST_RIGHT' && (
              <div className="space-y-3 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 bg-zinc-950 p-3 rounded-lg border border-emerald-500/30">
                  <div className="flex items-center gap-3">
                    <img src="/assets/mechanisms/right-lhl-3d.svg" alt="Forward Test Right" className="w-10 h-8" />
                    <div>
                      <h3 className="text-sm font-bold text-emerald-300">
                        03. Forward Test — Forward RIGHT-Side Progression (Bars #{replayStartIndex + 2} → #{fullCandles.length})
                      </h3>
                      <p className="text-[11px] text-zinc-400">
                        Evaluates forward candles chronologically from the Back Test boundary without revealing future bars beyond Bar #{frontierEvaluation.frontierBarNumber}.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={onStepNextCandle}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-bold rounded text-xs flex items-center gap-1"
                    >
                      <StepForward className="w-3.5 h-3.5" />
                      Step Forward (+1 Bar)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-zinc-950 p-3 rounded border border-zinc-800">
                    <div className="text-[10px] text-zinc-400">REVEALED FORWARD BARS</div>
                    <div className="text-lg font-bold text-amber-400 mt-1">
                      {Math.max(0, frontierEvaluation.frontierIndex - replayStartIndex)} Bars Revealed
                    </div>
                    <div className="text-[10px] text-zinc-500 mt-0.5">
                      From Bar #{replayStartIndex + 2} up to Frontier #{frontierEvaluation.frontierBarNumber}
                    </div>
                  </div>
                  <div className="bg-zinc-950 p-3 rounded border border-zinc-800">
                    <div className="text-[10px] text-zinc-400">UNREVEALED FUTURE BARS (MASKED)</div>
                    <div className="text-lg font-bold text-emerald-400 mt-1">
                      {frontierEvaluation.forwardUnrevealedRightCount} Bars Masked
                    </div>
                    <div className="text-[10px] text-zinc-500 mt-0.5">
                      Strictly excluded from current decision calculation
                    </div>
                  </div>
                  <div className="bg-zinc-950 p-3 rounded border border-zinc-800">
                    <div className="text-[10px] text-zinc-400">FORWARD SETUPS REVEALED SO FAR</div>
                    <div className="text-lg font-bold text-white mt-1">
                      {forwardRevealedDecisions.length} Confirmed Forward Trades
                    </div>
                    <div className="text-[10px] text-cyan-400 mt-0.5">
                      Zero look-ahead bias verified
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3">
                  <div className="text-[11px] font-bold text-emerald-300 mb-2 uppercase">
                    Revealed Forward Test Decisions (Bars #{replayStartIndex + 2} → #{frontierEvaluation.frontierBarNumber})
                  </div>
                  <div className="max-h-48 overflow-y-auto divide-y divide-zinc-800/60 text-[11px]">
                    {forwardRevealedDecisions.length === 0 ? (
                      <div className="py-4 text-center text-zinc-500">
                        Advance the Replay Frontier forward (+1 Candle or Auto-Play) past Bar #{replayStartIndex + 1} to reveal forward test trades chronologically.
                      </div>
                    ) : (
                      forwardRevealedDecisions.map((d) => (
                        <div
                          key={d.id}
                          onClick={() => onJumpToBarIndex(d.decisionCandleIndex - 1)}
                          className="py-1.5 px-2 hover:bg-zinc-900 flex items-center justify-between cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-emerald-400 font-bold">Bar #{d.decisionCandleIndex}</span>
                            <span className="text-zinc-400">{d.decisionTimestamp}</span>
                            <span className={d.direction === 'LONG' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                              {d.direction}
                            </span>
                            <span className="text-amber-300">({d.stage})</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span>Entry: {formatPrice(d.entryPrice)}</span>
                            <span className="text-rose-400">SL: {formatPrice(d.stopLossPrice)}</span>
                            <span className="text-emerald-400 font-bold">{d.highestRatioHitAtFrontier}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* =============================================================== */}
            {/* MODULE 04: REPLAY TEST — CONNECTED CHRONOLOGICAL CORE ENGINE    */}
            {/* =============================================================== */}
            {activeModule === 'REPLAY_TEST_CORE' && (
              <div className="space-y-3 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 bg-zinc-950 p-3 rounded-lg border border-amber-500/40">
                  <div className="flex items-center gap-3">
                    <img src="/assets/icons/cycle-completion-3d.svg" alt="Replay Core" className="w-8 h-8" />
                    <div>
                      <h3 className="text-sm font-bold text-amber-300">
                        04. Replay Test — Connected Chronological Framework (LEFT + FRONTIER + RIGHT)
                      </h3>
                      <p className="text-[11px] text-zinc-400">
                        Connects Back Test history (LEFT) with Forward Test progression (RIGHT) at Bar #{frontierEvaluation.frontierBarNumber}.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={onStepPrevCandle}
                      className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-white rounded border border-zinc-700 font-bold"
                    >
                      -1 Bar
                    </button>
                    <button
                      onClick={onToggleAutoPlay}
                      className={`px-3 py-1 rounded font-bold ${
                        isAutoPlaying ? 'bg-rose-600 text-white' : 'bg-emerald-500 text-black'
                      }`}
                    >
                      {isAutoPlaying ? 'Pause' : 'Play / Resume'}
                    </button>
                    <button
                      onClick={onStepNextCandle}
                      className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-black rounded font-bold"
                    >
                      +1 Bar
                    </button>
                    <button
                      onClick={onResetReplayStart}
                      className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded border border-zinc-700"
                    >
                      Reset (#{replayStartIndex + 1})
                    </button>
                  </div>
                </div>

                {/* Dataset Size & Continuity Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-zinc-950 p-3 rounded border border-zinc-800 space-y-2">
                    <div className="text-[11px] font-bold text-cyan-400 uppercase">
                      Replay Dataset Context Selector (1,000 vs 3,500 Candles)
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onSelectDatasetSize(1000)}
                        className={`px-3 py-1.5 rounded font-bold ${
                          datasetSizeOption === 1000
                            ? 'bg-cyan-500 text-black'
                            : 'bg-zinc-900 text-zinc-300 border border-zinc-800'
                        }`}
                      >
                        1,000 Candles (Standard)
                      </button>
                      <button
                        onClick={() => onSelectDatasetSize(3500)}
                        className={`px-3 py-1.5 rounded font-bold ${
                          datasetSizeOption === 3500
                            ? 'bg-cyan-500 text-black'
                            : 'bg-zinc-900 text-zinc-300 border border-zinc-800'
                        }`}
                      >
                        3,500 Candles (Extended)
                      </button>
                    </div>
                    <div className="text-[11px] text-zinc-300">
                      Requested: <strong>{datasetSizeOption.toLocaleString()}</strong> | Actual Loaded:{' '}
                      <strong className="text-emerald-400">{fullCandles.length.toLocaleString()}</strong> | Missing:{' '}
                      <strong className="text-amber-400">{datasetReport?.missingCandleCount ?? 0}</strong>
                    </div>
                  </div>

                  <div className="bg-zinc-950 p-3 rounded border border-zinc-800 space-y-2">
                    <div className="text-[11px] font-bold text-amber-400 uppercase">
                      Chronological Frontier Scrubber (Bar #{frontierEvaluation.frontierBarNumber} / {fullCandles.length})
                    </div>
                    <input
                      type="range"
                      min={2}
                      max={Math.max(2, fullCandles.length - 1)}
                      value={Math.min(forwardCursor, Math.max(2, fullCandles.length - 1))}
                      onChange={(e) => onJumpToBarIndex(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-zinc-400">
                      <span>LEFT History: {frontierEvaluation.backTestLeftCount} bars</span>
                      <span>Frontier: Bar #{frontierEvaluation.frontierBarNumber}</span>
                      <span>Unrevealed RIGHT: {frontierEvaluation.forwardUnrevealedRightCount} bars</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* =============================================================== */}
            {/* MODULES 05, 06, 07: 1:1, 1:2, AND 1:3 PIPE MECHANISMS           */}
            {/* =============================================================== */}
            {(activeModule === 'MECHANISM_1_1' ||
              activeModule === 'MECHANISM_1_2' ||
              activeModule === 'MECHANISM_1_3') && (
              <div className="space-y-3 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 bg-zinc-950 p-3 rounded-lg border border-emerald-500/30">
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        activeModule === 'MECHANISM_1_1'
                          ? '/assets/mechanisms/pipe-1to1-3d.svg'
                          : activeModule === 'MECHANISM_1_2'
                          ? '/assets/mechanisms/pipe-1to2-3d.svg'
                          : '/assets/mechanisms/pipe-1to3-3d.svg'
                      }
                      alt="Pipe Mechanism"
                      className="w-14 h-9 object-contain"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-white">
                        {activeModule === 'MECHANISM_1_1'
                          ? '05. 1:1 Pipe Mechanism — First Structural Target Validation'
                          : activeModule === 'MECHANISM_1_2'
                          ? '06. 1:2 Pipe Mechanism — Secondary Structural Expansion'
                          : '07. 1:3 Pipe Mechanism — Full 1:3 Structural Completion Horizon'}
                      </h3>
                      <p className="text-[11px] text-zinc-400">
                        Evaluates real-time R-multiple progression from Entry ± (Risk × Ratio) up to Replay Frontier Bar #{frontierEvaluation.frontierBarNumber}.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {(['MECHANISM_1_1', 'MECHANISM_1_2', 'MECHANISM_1_3'] as SrTimeEngineModuleId[]).map((mId, idx) => (
                      <button
                        key={mId}
                        onClick={() => onSelectModule(mId)}
                        className={`px-2.5 py-1 rounded font-bold ${
                          activeModule === mId
                            ? 'bg-emerald-500 text-black'
                            : 'bg-zinc-900 text-zinc-300 border border-zinc-800'
                        }`}
                      >
                        1:{idx + 1} Pipe
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-zinc-950 p-3 rounded border border-zinc-800">
                    <div className="text-[10px] text-zinc-400">1:1 PIPE REACHED UP TO FRONTIER</div>
                    <div className="text-lg font-bold text-emerald-400 mt-1">
                      {pipe11Decisions.length} / {frontierEvaluation.visibleDecisionsUpToFrontier.length} Setups
                    </div>
                  </div>
                  <div className="bg-zinc-950 p-3 rounded border border-zinc-800">
                    <div className="text-[10px] text-zinc-400">1:2 PIPE REACHED UP TO FRONTIER</div>
                    <div className="text-lg font-bold text-cyan-400 mt-1">
                      {pipe12Decisions.length} / {frontierEvaluation.visibleDecisionsUpToFrontier.length} Setups
                    </div>
                  </div>
                  <div className="bg-zinc-950 p-3 rounded border border-zinc-800">
                    <div className="text-[10px] text-zinc-400">1:3 PIPE COMPLETED UP TO FRONTIER</div>
                    <div className="text-lg font-bold text-amber-400 mt-1">
                      {pipe13Decisions.length} / {frontierEvaluation.visibleDecisionsUpToFrontier.length} Setups
                    </div>
                  </div>
                </div>

                <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3">
                  <div className="text-[11px] font-bold text-zinc-200 mb-2 uppercase">
                    Verified Decisions Filtered by{' '}
                    {activeModule === 'MECHANISM_1_1'
                      ? '1:1 Pipe'
                      : activeModule === 'MECHANISM_1_2'
                      ? '1:2 Pipe'
                      : '1:3 Pipe'}{' '}
                    (Click any row to inspect on 3D Chart)
                  </div>
                  <div className="max-h-48 overflow-y-auto divide-y divide-zinc-800/60 text-[11px]">
                    {(activeModule === 'MECHANISM_1_1'
                      ? pipe11Decisions
                      : activeModule === 'MECHANISM_1_2'
                      ? pipe12Decisions
                      : pipe13Decisions
                    ).map((d) => (
                      <div
                        key={d.id}
                        onClick={() => onJumpToBarIndex(d.decisionCandleIndex - 1)}
                        className="py-1.5 px-2 hover:bg-zinc-900 flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-amber-400 font-bold">Bar #{d.decisionCandleIndex}</span>
                          <span className={d.direction === 'LONG' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                            {d.direction}
                          </span>
                          <span className="text-zinc-300">{d.stage}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span>Entry: {formatPrice(d.entryPrice)}</span>
                          <span className="text-emerald-300">1:1={formatPrice(d.targets.r1)}</span>
                          <span className="text-cyan-300">1:2={formatPrice(d.targets.r2)}</span>
                          <span className="text-amber-300 font-bold">1:3={formatPrice(d.targets.r3)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* =============================================================== */}
            {/* MODULES 08 & 09: LEFT-SIDE & RIGHT-SIDE HIGH/LOW BEHAVIOR       */}
            {/* =============================================================== */}
            {(activeModule === 'LEFT_HIGH_LOW_BEHAVIOR' || activeModule === 'RIGHT_HIGH_LOW_BEHAVIOR') && (
              <div className="space-y-3 text-xs">
                {(() => {
                  const isLeft = activeModule === 'LEFT_HIGH_LOW_BEHAVIOR';
                  const sideState = isLeft ? frontierEvaluation.leftSideState : frontierEvaluation.rightSideState;
                  const sideEvents = frontierEvaluation.structuralEventsUpToFrontier.filter((ev) =>
                    isLeft ? ev.orientation === 'LEFT_HLH' : ev.orientation === 'RIGHT_LHL'
                  );
                  return (
                    <>
                      <div className="flex flex-wrap items-center justify-between gap-2 bg-zinc-950 p-3 rounded-lg border border-amber-500/30">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              isLeft
                                ? '/assets/structure/high-to-low-3d.svg'
                                : '/assets/structure/low-to-high-3d.svg'
                            }
                            alt="HIGH/LOW Structure"
                            className="w-12 h-9 object-contain"
                          />
                          <div>
                            <h3 className="text-sm font-bold text-white">
                              {isLeft
                                ? '08. LEFT-Side HIGH/LOW Behavior — High → Low → High (H-Complete → Lower High Break)'
                                : '09. RIGHT-Side HIGH/LOW Behavior — Low → High → Low (L-Complete → Higher Low Break)'}
                            </h3>
                            <p className="text-[11px] text-zinc-400">
                              Connected directly to validated 3-bar structural pivots up to Bar #{frontierEvaluation.frontierBarNumber}.
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <img src="/assets/structure/high-extreme-3d.svg" alt="HIGH" className="w-7 h-7" />
                          <img src="/assets/structure/low-extreme-3d.svg" alt="LOW" className="w-7 h-7" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div className="bg-zinc-950 p-3 rounded border border-zinc-800">
                          <div className="text-[10px] text-zinc-400">ORIGIN PIVOT 1</div>
                          <div className="text-sm font-bold text-white mt-1">
                            {sideState.pivot1Price !== null
                              ? `${formatPrice(sideState.pivot1Price)} (Bar #${sideState.pivot1BarIndex})`
                              : 'Seeking...'}
                          </div>
                        </div>
                        <div className="bg-zinc-950 p-3 rounded border border-zinc-800">
                          <div className="text-[10px] text-zinc-400">SECONDARY PIVOT 2</div>
                          <div className="text-sm font-bold text-cyan-300 mt-1">
                            {sideState.pivot2Price !== null
                              ? `${formatPrice(sideState.pivot2Price)} (Bar #${sideState.pivot2BarIndex})`
                              : 'Awaiting Pivot 2...'}
                          </div>
                        </div>
                        <div className="bg-zinc-950 p-3 rounded border border-zinc-800">
                          <div className="text-[10px] text-zinc-400">COMPLETION APEX</div>
                          <div className="text-sm font-bold text-amber-300 mt-1">
                            {sideState.completionPivotPrice !== null
                              ? `${formatPrice(sideState.completionPivotPrice)} (Bar #${sideState.completionBarIndex})`
                              : 'Awaiting Completion...'}
                          </div>
                        </div>
                        <div className="bg-zinc-950 p-3 rounded border border-zinc-800">
                          <div className="text-[10px] text-zinc-400">CONNECTION BREAK PIVOT</div>
                          <div className="text-sm font-bold text-emerald-400 mt-1">
                            {sideState.connectionBreakPrice !== null
                              ? `${formatPrice(sideState.connectionBreakPrice)} (Bar #${sideState.connectionBreakBarIndex})`
                              : 'Awaiting LH/HL Break...'}
                          </div>
                        </div>
                      </div>

                      <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3">
                        <div className="text-[11px] font-bold text-amber-300 mb-2 uppercase">
                          Validated {isLeft ? 'LEFT (HLH)' : 'RIGHT (LHL)'} Structural Pivot Transitions Up To Bar #{frontierEvaluation.frontierBarNumber}
                        </div>
                        <div className="max-h-48 overflow-y-auto divide-y divide-zinc-800/60 text-[11px]">
                          {sideEvents
                            .slice()
                            .reverse()
                            .slice(0, 40)
                            .map((ev, idx) => (
                              <div
                                key={`${ev.barIndex}-${idx}`}
                                onClick={() => onJumpToBarIndex(Math.max(2, ev.barIndex - 1))}
                                className="py-1.5 px-2 hover:bg-zinc-900 flex items-center justify-between cursor-pointer"
                              >
                                <div className="flex items-center gap-2">
                                  <img src={ev.assetPath} alt={ev.shortBadge} className="w-5 h-5 object-contain" />
                                  <span className="text-amber-400 font-bold">Bar #{ev.barIndex}</span>
                                  <span className="px-1.5 py-0.5 rounded bg-zinc-900 text-white font-bold">
                                    {ev.shortBadge}
                                  </span>
                                  <span className="text-zinc-300">{ev.explanation}</span>
                                </div>
                                <span className="text-cyan-300 font-bold">{formatPrice(ev.priceLevel)}</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}

            {/* =============================================================== */}
            {/* MODULE 10: SEQUENCE AND CYCLE LEDGER                            */}
            {/* =============================================================== */}
            {activeModule === 'SEQUENCE_CYCLE_LEDGER' && (
              <div className="space-y-3 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                  <div className="flex items-center gap-3">
                    <img src="/assets/icons/cycle-apex-3d.svg" alt="Cycle Ledger" className="w-8 h-8" />
                    <div>
                      <h3 className="text-sm font-bold text-white">
                        10. Sequence & 6-Stage Cycle Ledger (3 Lower Zero Sets + 3 Upper Honest Sets)
                      </h3>
                      <p className="text-[11px] text-zinc-400">
                        Tracks Origin, Apex, Transition, and Completion across Zero-1, Zero-2, Zero-3 and Honest One, Honest Two, Honest Three.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <img src="/assets/icons/cycle-origin-3d.svg" alt="Origin" className="w-5 h-5" title="Origin" />
                    <img src="/assets/icons/cycle-apex-3d.svg" alt="Apex" className="w-5 h-5" title="Apex" />
                    <img src="/assets/icons/cycle-transition-3d.svg" alt="Transition" className="w-5 h-5" title="Transition" />
                    <img src="/assets/icons/cycle-completion-3d.svg" alt="Completion" className="w-5 h-5" title="Completion" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* LEFT 6-Stage Tracker */}
                  <div className="bg-zinc-950 p-3 rounded border border-amber-500/30 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-amber-300">LEFT (High → Low → High) 6-Stage Cycle</span>
                      <span className="text-[10px] text-zinc-400">
                        Completed Rotations: {frontierEvaluation.leftSideState.completedBehaviorsCount}
                      </span>
                    </div>
                    <div className="grid grid-cols-6 gap-1.5 text-center text-[10px]">
                      {(['Zero-1', 'Zero-2', 'Zero-3', 'Honest One', 'Honest Two', 'Honest Three'] as const).map(
                        (st) => {
                          const isNext = frontierEvaluation.leftSideState.nextStageLabel === st;
                          return (
                            <div
                              key={st}
                              className={`p-1.5 rounded border ${
                                isNext
                                  ? 'bg-amber-500 text-black border-amber-400 font-bold'
                                  : 'bg-black/60 text-zinc-400 border-zinc-800'
                              }`}
                            >
                              {st}
                            </div>
                          );
                        }
                      )}
                    </div>
                    <div className="text-[11px] text-zinc-300">
                      {frontierEvaluation.leftSideState.remainingBehaviorBalance}
                    </div>
                  </div>

                  {/* RIGHT 6-Stage Tracker */}
                  <div className="bg-zinc-950 p-3 rounded border border-cyan-500/30 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-cyan-300">RIGHT (Low → High → Low) 6-Stage Cycle</span>
                      <span className="text-[10px] text-zinc-400">
                        Completed Rotations: {frontierEvaluation.rightSideState.completedBehaviorsCount}
                      </span>
                    </div>
                    <div className="grid grid-cols-6 gap-1.5 text-center text-[10px]">
                      {(['Zero-1', 'Zero-2', 'Zero-3', 'Honest One', 'Honest Two', 'Honest Three'] as const).map(
                        (st) => {
                          const isNext = frontierEvaluation.rightSideState.nextStageLabel === st;
                          return (
                            <div
                              key={st}
                              className={`p-1.5 rounded border ${
                                isNext
                                  ? 'bg-cyan-500 text-black border-cyan-400 font-bold'
                                  : 'bg-black/60 text-zinc-400 border-zinc-800'
                              }`}
                            >
                              {st}
                            </div>
                          );
                        }
                      )}
                    </div>
                    <div className="text-[11px] text-zinc-300">
                      {frontierEvaluation.rightSideState.remainingBehaviorBalance}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* =============================================================== */}
            {/* MODULE 11: ENTRY / STOP LOSS / TARGET EVALUATION                */}
            {/* =============================================================== */}
            {activeModule === 'ENTRY_SL_TARGET_EVAL' && (
              <div className="space-y-3 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                  <div className="flex items-center gap-3">
                    <img src="/assets/structure/high-extreme-3d.svg" alt="Entry SL Target" className="w-8 h-8" />
                    <div>
                      <h3 className="text-sm font-bold text-white">
                        11. Entry, Stop Loss & Target Rule Evaluator (Bar #{frontierEvaluation.frontierBarNumber})
                      </h3>
                      <p className="text-[11px] text-zinc-400">
                        Entry = Open of post-wait confirmation candle | Stop Loss = 0.1% beyond Completion Pivot | Targets = 1:1 to 1:25.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-zinc-400">Wait Candles Rule:</span>
                    {[3, 4, 5, 6].map((w) => (
                      <button
                        key={w}
                        onClick={() => onSelectWaitRule(w)}
                        className={`px-2 py-1 rounded font-bold ${
                          waitCandlesRule === w ? 'bg-amber-500 text-black' : 'bg-zinc-900 text-zinc-400'
                        }`}
                      >
                        {w} Bars
                      </button>
                    ))}
                  </div>
                </div>

                {activeDec ? (
                  <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-2">
                      <div>
                        <span className="text-amber-400 font-bold mr-2">{activeDec.id}</span>
                        <span className="text-white font-bold mr-2">
                          {activeDec.direction} ({activeDec.sequencePattern})
                        </span>
                        <span className="text-cyan-300">Stage: {activeDec.stage}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                        STATUS: {activeDec.statusAtFrontier} ({activeDec.highestRatioHitAtFrontier})
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                      <div className="bg-black/70 p-2.5 rounded border border-zinc-800">
                        <div className="text-[10px] text-zinc-400">COMPLETION PIVOT</div>
                        <div className="text-sm font-bold text-amber-300">
                          {formatPrice(activeDec.completionPivotPrice)} (Bar #{activeDec.completionCandleIndex})
                        </div>
                      </div>
                      <div className="bg-black/70 p-2.5 rounded border border-zinc-800">
                        <div className="text-[10px] text-zinc-400">CONNECTION BREAK PIVOT</div>
                        <div className="text-sm font-bold text-cyan-300">
                          {formatPrice(activeDec.connectionPivotPrice)} (Bar #{activeDec.connectionBreakCandleIndex})
                        </div>
                      </div>
                      <div className="bg-black/70 p-2.5 rounded border border-zinc-800">
                        <div className="text-[10px] text-zinc-400">ENTRY PRICE (OPEN)</div>
                        <div className="text-sm font-bold text-white">
                          {formatPrice(activeDec.entryPrice)} (Bar #{activeDec.decisionCandleIndex})
                        </div>
                      </div>
                      <div className="bg-black/70 p-2.5 rounded border border-rose-500/40">
                        <div className="text-[10px] text-rose-400">STOP LOSS (0.1% PIVOT)</div>
                        <div className="text-sm font-bold text-rose-400">
                          {formatPrice(activeDec.stopLossPrice)}
                        </div>
                      </div>
                    </div>

                    <div className="text-[11px] text-zinc-300 bg-black/50 p-2 rounded border border-zinc-800">
                      <strong>Structural Invalidation Rule:</strong> {activeDec.invalidationCondition}
                    </div>
                  </div>
                ) : (
                  <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-6 text-center text-zinc-400">
                    No active decision at Bar #{frontierEvaluation.frontierBarNumber}. Advance Next Candle (+1) to evaluate upcoming structural breaks.
                  </div>
                )}
              </div>
            )}

            {/* =============================================================== */}
            {/* MODULE 12: HISTORICAL DATA ARCHIVE                              */}
            {/* =============================================================== */}
            {activeModule === 'HISTORICAL_DATA_ARCHIVE' && (
              <div className="space-y-3 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                  <div className="flex items-center gap-3">
                    <img src="/assets/candles/bull-3d-neon.svg" alt="Data Archive" className="w-6 h-8" />
                    <div>
                      <h3 className="text-sm font-bold text-white">
                        12. Historical Data Archive ({fullCandles.length.toLocaleString()} Loaded Raw OHLCV Bars)
                      </h3>
                      <p className="text-[11px] text-zinc-400">
                        Inspect exact Open, High, Low, Close, Volume, UTC & Display Timezone timestamps, or export to CSV.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleDownloadCsv}
                      className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded flex items-center gap-1.5"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      Download Visible CSV ({forwardCursor + 1} Bars)
                    </button>
                  </div>
                </div>

                <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-zinc-300">
                      Showing Bars #{archivePage * 25 + 1} – #{Math.min(fullCandles.length, (archivePage + 1) * 25)} of{' '}
                      {fullCandles.length.toLocaleString()}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setArchivePage((p) => Math.max(0, p - 1))}
                        disabled={archivePage === 0}
                        className="px-2 py-0.5 bg-zinc-900 rounded border border-zinc-800 disabled:opacity-40"
                      >
                        Prev Page
                      </button>
                      <button
                        onClick={() =>
                          setArchivePage((p) =>
                            (p + 1) * 25 < fullCandles.length ? p + 1 : p
                          )
                        }
                        disabled={(archivePage + 1) * 25 >= fullCandles.length}
                        className="px-2 py-0.5 bg-zinc-900 rounded border border-zinc-800 disabled:opacity-40"
                      >
                        Next Page
                      </button>
                    </div>
                  </div>

                  <div className="max-h-48 overflow-y-auto">
                    <table className="w-full text-left text-[11px]">
                      <thead className="text-zinc-400 border-b border-zinc-800">
                        <tr>
                          <th className="py-1">Bar #</th>
                          <th className="py-1">UTC Timestamp</th>
                          <th className="py-1">{displayTimezone}</th>
                          <th className="py-1">Open</th>
                          <th className="py-1">High</th>
                          <th className="py-1">Low</th>
                          <th className="py-1">Close</th>
                          <th className="py-1">Volume</th>
                          <th className="py-1">Zone</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/50">
                        {fullCandles.slice(archivePage * 25, (archivePage + 1) * 25).map((c) => {
                          const isMasked = c.index - 1 > forwardCursor;
                          return (
                            <tr
                              key={c.index}
                              onClick={() => onJumpToBarIndex(Math.max(2, c.index - 1))}
                              className="hover:bg-zinc-900 cursor-pointer"
                            >
                              <td className="py-1 font-bold text-amber-400">#{c.index}</td>
                              <td className="py-1 text-zinc-300">{c.timeFormatted}</td>
                              <td className="py-1 text-cyan-300">{formatTs(c.timestamp)}</td>
                              <td className="py-1">{formatPrice(c.open)}</td>
                              <td className="py-1 text-emerald-400">{formatPrice(c.high)}</td>
                              <td className="py-1 text-rose-400">{formatPrice(c.low)}</td>
                              <td className="py-1 font-bold text-white">{formatPrice(c.close)}</td>
                              <td className="py-1 text-zinc-400">{(c.volume ?? 0).toLocaleString()}</td>
                              <td className="py-1">
                                {c.index - 1 <= replayStartIndex ? (
                                  <span className="text-blue-400">BACK TEST (LEFT)</span>
                                ) : isMasked ? (
                                  <span className="text-zinc-500">UNREVEALED (RIGHT)</span>
                                ) : (
                                  <span className="text-emerald-400">REVEALED FORWARD</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* =============================================================== */}
            {/* MODULE 13: TIMEFRAME AND TIME-ZONE CONTROLLER                   */}
            {/* =============================================================== */}
            {activeModule === 'TIMEFRAME_TIMEZONE_CONTROLLER' && (
              <div className="space-y-3 text-xs">
                <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 space-y-3">
                  <div className="flex items-center gap-3">
                    <img src="/assets/icons/cycle-transition-3d.svg" alt="Timeframe Controller" className="w-8 h-8" />
                    <div>
                      <h3 className="text-sm font-bold text-white">
                        13. Timeframe & Time-Zone Controller (Independent Structural Isolation)
                      </h3>
                      <p className="text-[11px] text-zinc-400">
                        Each timeframe loads its own authentic OHLCV series and evaluates its own independent SRBMPR sequence. UTC timestamps are preserved.
                      </p>
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] font-bold text-amber-400 mb-1.5 uppercase">
                      Select Active Timeframe (1m, 5m, 15m, 1h, 4h, 1D, 1W, 1M)
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {ALL_TIMEFRAMES.map((tf) => (
                        <button
                          key={tf}
                          onClick={() => onSelectTimeframe(tf)}
                          className={`px-3 py-1.5 rounded font-bold text-xs ${
                            selectedTimeframe === tf
                              ? 'bg-amber-500 text-black'
                              : 'bg-zinc-900 text-zinc-300 border border-zinc-800 hover:bg-zinc-800'
                          }`}
                        >
                          {tf} Timeframe
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] font-bold text-cyan-400 mb-1.5 uppercase">
                      Select Display Timezone (UTC Source Preserved)
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {SUPPORTED_TIMEZONES.map((tz) => (
                        <button
                          key={tz.id}
                          onClick={() => onSelectTimezone(tz.id)}
                          className={`p-2.5 rounded border text-left transition-colors ${
                            displayTimezone === tz.id
                              ? 'bg-cyan-500/20 border-cyan-400 text-white'
                              : 'bg-zinc-900/70 border-zinc-800 text-zinc-300 hover:bg-zinc-900'
                          }`}
                        >
                          <div className="flex items-center justify-between font-bold">
                            <span className="text-cyan-300">{tz.shortLabel} ({tz.id})</span>
                            <span className="text-[10px] text-zinc-400">{tz.offsetLabel}</span>
                          </div>
                          <div className="text-[10px] text-zinc-400 mt-0.5">{tz.regionName}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* =============================================================== */}
            {/* MODULE 14: AUDIT AND VALIDATION LEDGER                          */}
            {/* =============================================================== */}
            {activeModule === 'AUDIT_VALIDATION_LEDGER' && (
              <div className="space-y-3 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 bg-zinc-950 p-3 rounded-lg border border-emerald-500/40">
                  <div className="flex items-center gap-3">
                    <img src="/assets/icons/cycle-completion-3d.svg" alt="Audit Ledger" className="w-8 h-8" />
                    <div>
                      <h3 className="text-sm font-bold text-emerald-300">
                        14. Audit & Validation Ledger (No-Lookahead Proofs & Verified Controller)
                      </h3>
                      <p className="text-[11px] text-zinc-400">
                        Every decision is cryptographically hashed at its exact confirmation bar with zero access to unrevealed right-side candles.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onReverifyController}
                    className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded text-xs"
                  >
                    Re-Verify Controller & Keys
                  </button>
                </div>

                {controllerStatus && (
                  <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 space-y-1.5 text-[11px]">
                    <div className="font-bold text-emerald-400">
                      {controllerStatus.controllerId} • {controllerStatus.controllerStatus} • Local Research Unlocked:{' '}
                      {String(controllerStatus.localResearchReplayUnlocked).toUpperCase()}
                    </div>
                    {controllerStatus.diagnosticLog.map((log, i) => (
                      <div key={i} className="text-zinc-300 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{log}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3">
                  <div className="text-[11px] font-bold text-amber-300 mb-2 uppercase">
                    Chronological Audit Trail Up To Frontier Bar #{frontierEvaluation.frontierBarNumber} ({frontierEvaluation.auditLogsUpToFrontier.length} Entries)
                  </div>
                  <div className="max-h-44 overflow-y-auto space-y-1 text-[11px]">
                    {frontierEvaluation.auditLogsUpToFrontier.length === 0 ? (
                      <div className="text-zinc-500 py-4 text-center">
                        No confirmed decisions logged prior to Bar #{frontierEvaluation.frontierBarNumber}.
                      </div>
                    ) : (
                      frontierEvaluation.auditLogsUpToFrontier
                        .slice()
                        .reverse()
                        .map((entry, idx) => (
                          <div key={idx} className="p-1.5 rounded bg-black/80 border border-zinc-800/80 text-zinc-200">
                            {entry}
                          </div>
                        ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
