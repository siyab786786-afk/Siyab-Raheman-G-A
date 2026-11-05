import React, { useState } from 'react';
import { Srbmpr2526LayerState } from '../types/terminal';
import {
  Layers,
  Target,
  Zap,
  CheckCircle,
  FileText,
  Rocket,
  ArrowRightLeft,
  ShieldAlert,
  Clock,
  TrendingUp,
  TrendingDown,
  Lock,
  Unlock
} from 'lucide-react';
import { ROCKET_TARGET_LIST, RocketTargetRatio } from './SrbmprForwardTestOnlyChart';

export type TwoSidedMechanismBadgeState = 'PENDING' | 'INCOMPLETE' | 'VERIFIED';

interface Srbmpr2526LayerModuleProps {
  layerState: Srbmpr2526LayerState;
  onOpenAuditReport?: () => void;
  defaultDirection?: 'LONG' | 'SHORT';
}

export const Srbmpr2526LayerModule: React.FC<Srbmpr2526LayerModuleProps> = ({
  layerState,
  onOpenAuditReport,
  defaultDirection
}) => {
  const [selectedRocketTarget, setSelectedRocketTarget] = useState<RocketTargetRatio>(5);
  const [evaluatedDirection, setEvaluatedDirection] = useState<'LONG' | 'SHORT'>(
    defaultDirection || layerState.evaluatedDirection || 'LONG'
  );

  const safeWRef =
    layerState.wRef > 0
      ? layerState.wRef
      : Math.max(1, layerState.slDistance || layerState.entryPrice * 0.001);

  const activeRocketTargetPrice =
    evaluatedDirection === 'LONG'
      ? Number((layerState.anchorHigh + selectedRocketTarget * safeWRef).toFixed(2))
      : Number(Math.max(0.01, layerState.anchorHigh - selectedRocketTarget * safeWRef).toFixed(2));
  const internalWickMidpoint = Number((layerState.bodyTop + 0.5 * safeWRef).toFixed(2));

  // Derive SHORT-side and LONG-side mechanism statuses from layerState (with deterministic fallback)
  const shortSideStatus: TwoSidedMechanismBadgeState =
    layerState.shortSideMechanismStatus ||
    (layerState.evaluatedDirection === 'LONG' && layerState.oppositeMechanismStatus
      ? layerState.oppositeMechanismStatus
      : layerState.status === 'CONFIRMED' || layerState.progress11 === 100
        ? 'VERIFIED'
        : layerState.progress11 > 0
          ? 'PENDING'
          : 'INCOMPLETE');

  const longSideStatus: TwoSidedMechanismBadgeState =
    layerState.longSideMechanismStatus ||
    (layerState.evaluatedDirection === 'SHORT' && layerState.oppositeMechanismStatus
      ? layerState.oppositeMechanismStatus
      : layerState.activeLayer === 'COMPLETED' || layerState.progress13 === 100
        ? 'VERIFIED'
        : layerState.progress12 > 0
          ? 'PENDING'
          : 'INCOMPLETE');

  // Under the Two-Sided Market Mechanism rule:
  // - Evaluating LONG entry -> Must inspect SHORT-side mechanism (PENDING | INCOMPLETE | VERIFIED)
  // - Evaluating SHORT entry -> Must inspect LONG-side mechanism (PENDING | INCOMPLETE | VERIFIED)
  const requiredOppositeSide: 'SHORT' | 'LONG' = evaluatedDirection === 'LONG' ? 'SHORT' : 'LONG';
  const activeOppositeStatus: TwoSidedMechanismBadgeState =
    evaluatedDirection === 'LONG' ? shortSideStatus : longSideStatus;
  const isEntryPermitted = activeOppositeStatus === 'VERIFIED';

  const statusReason =
    evaluatedDirection === 'LONG'
      ? activeOppositeStatus === 'VERIFIED'
        ? 'SHORT-side mechanism is VERIFIED complete (stopped making lower lows & broke counter-pivot high). LONG entry permitted at Final Micro-Zero.'
        : activeOppositeStatus === 'PENDING'
          ? 'SHORT-side mechanism is PENDING final counter-pivot break & micro-zero confirmation. LONG entry withheld in waiting zone.'
          : 'SHORT-side mechanism is INCOMPLETE (still actively expanding downward or insufficient bars). LONG entry strictly blocked.'
      : activeOppositeStatus === 'VERIFIED'
        ? 'LONG-side mechanism is VERIFIED complete (stopped making higher highs & broke counter-pivot low). SHORT entry permitted at Final Micro-Zero.'
        : activeOppositeStatus === 'PENDING'
          ? 'LONG-side mechanism is PENDING final counter-pivot breakdown & micro-zero confirmation. SHORT entry withheld in waiting zone.'
          : 'LONG-side mechanism is INCOMPLETE (still actively expanding upward or insufficient bars). SHORT entry strictly blocked.';

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-5 shadow-2xl font-mono">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-zinc-900">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-amber-500" />
          <div>
            <h3 className="text-sm font-mono font-bold text-white tracking-wide">
              SRBMPR-25/26 MODEL SEQUENCE LAYER & ROCKET TARGET ENGINE
            </h3>
            <p className="text-xs text-zinc-400 font-mono">
              Upper Wick Unit (W_ref) = ${safeWRef} | Sequential Pipe State: 1:1 → 1:2 → 1:3 → 1:{selectedRocketTarget}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Direction Evaluator Toggle (LONG vs SHORT) */}
          <div className="flex items-center bg-zinc-900 border border-zinc-700 p-0.5 rounded-lg">
            <button
              type="button"
              onClick={() => setEvaluatedDirection('LONG')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold flex items-center gap-1 transition-all ${
                evaluatedDirection === 'LONG'
                  ? 'bg-emerald-500 text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-3 h-3" />
              <span>EVAL LONG</span>
            </button>
            <button
              type="button"
              onClick={() => setEvaluatedDirection('SHORT')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold flex items-center gap-1 transition-all ${
                evaluatedDirection === 'SHORT'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <TrendingDown className="w-3 h-3" />
              <span>EVAL SHORT</span>
            </button>
          </div>

          {/* Selectable Dropdown for Rocket Targets (1:1 to 1:100) */}
          <div className="flex items-center gap-1.5 bg-zinc-900 border border-emerald-500/40 px-2.5 py-1 rounded-lg">
            <Rocket className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[10px] text-zinc-400 font-bold uppercase">Rocket Target:</span>
            <select
              value={selectedRocketTarget}
              onChange={e => setSelectedRocketTarget(Number(e.target.value) as RocketTargetRatio)}
              className="bg-zinc-950 border border-emerald-500/50 text-emerald-400 font-bold text-xs px-2 py-0.5 rounded focus:outline-none"
            >
              {ROCKET_TARGET_LIST.map((t: { ratio: RocketTargetRatio; label: string }) => {
                const targetVal =
                  evaluatedDirection === 'LONG'
                    ? Number((layerState.anchorHigh + t.ratio * safeWRef).toFixed(2))
                    : Number(Math.max(0.01, layerState.anchorHigh - t.ratio * safeWRef).toFixed(2));
                return (
                  <option key={t.ratio} value={t.ratio}>
                    {t.label} (${targetVal.toLocaleString()})
                  </option>
                );
              })}
            </select>
          </div>

          <span className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono text-xs font-bold rounded-lg flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" /> Active State: {layerState.activeLayer}
          </span>
          {onOpenAuditReport && (
            <button
              onClick={onOpenAuditReport}
              className="px-3 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-mono text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all shadow-sm"
              title="Open 24-Hour Broker Growth & Proof Audit Report"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-400" />
              <span>24H BROKER AUDIT (PDF/PROOF)</span>
            </button>
          )}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* EXPLICIT TWO-SIDED MARKET MECHANISM VISUAL INDICATOR BANNER           */}
      {/* Shows if SHORT-side is PENDING, INCOMPLETE, or VERIFIED for LONG      */}
      {/* and if LONG-side is PENDING, INCOMPLETE, or VERIFIED for SHORT        */}
      {/* ===================================================================== */}
      <div
        className={`mb-4 rounded-xl border-2 p-3.5 transition-all ${
          activeOppositeStatus === 'VERIFIED'
            ? 'bg-emerald-500/10 border-emerald-500/50'
            : activeOppositeStatus === 'PENDING'
              ? 'bg-amber-500/10 border-amber-500/50'
              : 'bg-rose-500/10 border-rose-500/50'
        }`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-[11px] font-bold text-white">
                <ArrowRightLeft className="w-3.5 h-3.5 text-purple-400" />
                <span>TWO-SIDED MECHANISM CHECK ({evaluatedDirection} ENTRY EVALUATION)</span>
              </span>

              <span className="text-xs font-bold text-zinc-200">
                Connected {requiredOppositeSide}-Side Mechanism:
              </span>

              {/* Explicit 3-State Visual Indicator Pills: PENDING | INCOMPLETE | VERIFIED */}
              <div className="inline-flex items-center gap-1 bg-zinc-950/90 border border-zinc-800 p-1 rounded-lg">
                {(['PENDING', 'INCOMPLETE', 'VERIFIED'] as const).map(badgeState => {
                  const isActive = activeOppositeStatus === badgeState;
                  const activeStyle =
                    badgeState === 'VERIFIED'
                      ? 'bg-emerald-500 text-black border-emerald-400 font-black shadow-sm'
                      : badgeState === 'PENDING'
                        ? 'bg-amber-500 text-black border-amber-400 font-black shadow-sm'
                        : 'bg-rose-500 text-white border-rose-400 font-black shadow-sm';
                  return (
                    <span
                      key={badgeState}
                      className={`px-2.5 py-0.5 rounded text-[10px] border transition-all flex items-center gap-1 ${
                        isActive
                          ? activeStyle
                          : 'bg-zinc-900/50 text-zinc-500 border-zinc-800/80 font-semibold'
                      }`}
                    >
                      {badgeState === 'VERIFIED' && <CheckCircle className="w-3 h-3" />}
                      {badgeState === 'PENDING' && <Clock className="w-3 h-3" />}
                      {badgeState === 'INCOMPLETE' && <ShieldAlert className="w-3 h-3" />}
                      <span>
                        {requiredOppositeSide}-SIDE: {badgeState}
                      </span>
                    </span>
                  );
                })}
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">{statusReason}</p>
          </div>

          {/* Entry Gate Lock / Unlock Badge + Bidirectional Matrix */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 shrink-0">
            <div className="bg-zinc-950/90 border border-zinc-800 rounded-lg px-3 py-1.5 text-[10px] space-y-0.5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-zinc-400">LONG Eval → SHORT-Side:</span>
                <span
                  className={`font-bold ${
                    shortSideStatus === 'VERIFIED'
                      ? 'text-emerald-400'
                      : shortSideStatus === 'PENDING'
                        ? 'text-amber-400'
                        : 'text-rose-400'
                  }`}
                >
                  {shortSideStatus}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-zinc-400">SHORT Eval → LONG-Side:</span>
                <span
                  className={`font-bold ${
                    longSideStatus === 'VERIFIED'
                      ? 'text-emerald-400'
                      : longSideStatus === 'PENDING'
                        ? 'text-amber-400'
                        : 'text-rose-400'
                  }`}
                >
                  {longSideStatus}
                </span>
              </div>
            </div>

            <div
              className={`px-3 py-2 rounded-lg border text-xs font-bold flex items-center gap-1.5 ${
                isEntryPermitted
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                  : 'bg-rose-500/20 border-rose-500/50 text-rose-300'
              }`}
            >
              {isEntryPermitted ? (
                <>
                  <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{evaluatedDirection} UNLOCKED ({requiredOppositeSide} VERIFIED)</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5 text-rose-400" />
                  <span>{evaluatedDirection} WITHHELD ({requiredOppositeSide} {activeOppositeStatus})</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Highlighted Selectable Rocket Target Bar (1:1 to 1:100) */}
      <div className="mb-4 bg-zinc-900/60 border border-zinc-800 rounded-xl p-3">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
          <span className="text-[11px] font-bold text-zinc-300 flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-emerald-400" />
            <span>SELECT ROCKET ENGINE TARGET HORIZON (1:1 TO 1:100):</span>
          </span>
          <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 rounded">
            ACTIVE TARGET 1:{selectedRocketTarget} = ${activeRocketTargetPrice.toLocaleString()}
          </span>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-9 gap-1.5 tabular-nums">
          {ROCKET_TARGET_LIST.map((item: { ratio: RocketTargetRatio; label: string }) => {
            const isSelected = selectedRocketTarget === item.ratio;
            const projPrice =
              evaluatedDirection === 'LONG'
                ? Number((layerState.anchorHigh + item.ratio * safeWRef).toFixed(2))
                : Number(Math.max(0.01, layerState.anchorHigh - item.ratio * safeWRef).toFixed(2));
            return (
              <button
                key={item.ratio}
                onClick={() => setSelectedRocketTarget(item.ratio)}
                className={`px-2 py-1.5 rounded-lg border text-left transition-all ${
                  isSelected
                    ? 'bg-emerald-500 text-black border-emerald-400 font-bold shadow-md'
                    : 'bg-zinc-950/90 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-white'
                }`}
              >
                <div className="text-[11px] font-bold">{item.label}</div>
                <div className={`text-[10px] truncate ${isSelected ? 'text-black font-semibold' : 'text-zinc-500'}`}>
                  ${projPrice.toLocaleString()}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 tabular-nums">
        {/* Layer 1:1 */}
        <div className={`p-4 rounded-xl border transition-all ${
          layerState.activeLayer === '1:1'
            ? 'bg-amber-500/10 border-amber-500/60 shadow-lg shadow-amber-500/10'
            : layerState.progress11 === 100
            ? 'bg-zinc-900/80 border-emerald-500/40'
            : 'bg-zinc-900/40 border-zinc-800'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold text-zinc-300">PIPE 1 = 1:1 PROJECTION</span>
            {layerState.progress11 === 100 ? (
              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> COMPLETE</span>
            ) : (
              <span className="text-[10px] font-mono text-amber-400">ACTIVE</span>
            )}
          </div>
          <div className="text-lg font-mono font-bold text-white mb-1">${layerState.level1}</div>
          <div className="text-xs text-zinc-400 font-mono mb-3">1 × W_ref Unit from Anchor High</div>
          <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden border border-zinc-800">
            <div
              className="bg-amber-500 h-full transition-all duration-500"
              style={{ width: `${layerState.progress11}%` }}
            ></div>
          </div>
          <div className="text-[10px] font-mono text-right text-zinc-500 mt-1">{layerState.progress11}% Complete</div>
        </div>

        {/* Layer 1:2 */}
        <div className={`p-4 rounded-xl border transition-all ${
          layerState.activeLayer === '1:2'
            ? 'bg-amber-500/10 border-amber-500/60 shadow-lg shadow-amber-500/10'
            : layerState.progress12 === 100
            ? 'bg-zinc-900/80 border-emerald-500/40'
            : 'bg-zinc-900/40 border-zinc-800'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold text-zinc-300">PIPE 2 = 1:2 PROJECTION</span>
            {layerState.progress12 === 100 ? (
              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> COMPLETE</span>
            ) : layerState.activeLayer === '1:2' ? (
              <span className="text-[10px] font-mono text-amber-400">ACTIVE NEXT</span>
            ) : (
              <span className="text-[10px] font-mono text-zinc-500">PENDING</span>
            )}
          </div>
          <div className="text-lg font-mono font-bold text-white mb-1">${layerState.level2}</div>
          <div className="text-xs text-zinc-400 font-mono mb-3">2 × W_ref Unit Projection</div>
          <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden border border-zinc-800">
            <div
              className="bg-amber-500 h-full transition-all duration-500"
              style={{ width: `${layerState.progress12}%` }}
            ></div>
          </div>
          <div className="text-[10px] font-mono text-right text-zinc-500 mt-1">{layerState.progress12}% Complete</div>
        </div>

        {/* Layer 1:3 */}
        <div className={`p-4 rounded-xl border transition-all ${
          layerState.activeLayer === '1:3' || layerState.activeLayer === 'COMPLETED'
            ? 'bg-amber-500/10 border-amber-500/60 shadow-lg shadow-amber-500/10'
            : 'bg-zinc-900/40 border-zinc-800'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono font-bold text-zinc-300">PIPE 3 = 1:3 TARGET</span>
            {layerState.activeLayer === 'COMPLETED' ? (
              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> CYCLE DONE</span>
            ) : layerState.activeLayer === '1:3' ? (
              <span className="text-[10px] font-mono text-amber-400">FINAL STAGE</span>
            ) : (
              <span className="text-[10px] font-mono text-zinc-500">PENDING</span>
            )}
          </div>
          <div className="text-lg font-mono font-bold text-white mb-1">${layerState.level3}</div>
          <div className="text-xs text-zinc-400 font-mono mb-3">3 × W_ref Final Target Unit</div>
          <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden border border-zinc-800">
            <div
              className="bg-emerald-500 h-full transition-all duration-500"
              style={{ width: `${layerState.progress13}%` }}
            ></div>
          </div>
          <div className="text-[10px] font-mono text-right text-zinc-500 mt-1">{layerState.progress13}% Complete</div>
        </div>
      </div>

      {/* Entry Parameters & W_ref Internal Midpoint + Selected Rocket Target */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 bg-zinc-900/50 p-3.5 rounded-xl border border-zinc-800 font-mono text-xs tabular-nums">
        <div>
          <div className="text-zinc-500 text-[10px]">UPPER WICK (W_ref)</div>
          <div className="text-white font-bold text-sm">${safeWRef}</div>
        </div>
        <div>
          <div className="text-zinc-500 text-[10px]">WICK MIDPOINT ENTRY</div>
          <div className="text-cyan-400 font-bold text-sm">${internalWickMidpoint}</div>
        </div>
        <div>
          <div className="text-zinc-500 text-[10px]">1:1 / 1:2 PROJECTION</div>
          <div className="text-amber-400 font-bold text-sm">${layerState.level1} / ${layerState.level2}</div>
        </div>
        <div>
          <div className="text-zinc-500 text-[10px]">0.10% DYNAMIC STOP</div>
          <div className="text-rose-400 font-bold text-sm">
            ${layerState.stopLoss} <span className="text-[9px] text-zinc-500 font-normal">(±${layerState.slDistance || (layerState.entryPrice * 0.001).toFixed(2)})</span>
          </div>
        </div>
        <div>
          <div className="text-zinc-500 text-[10px]">ACTIVE ROCKET (1:{selectedRocketTarget})</div>
          <div className="text-emerald-400 font-bold text-sm">${activeRocketTargetPrice.toLocaleString()}</div>
        </div>
        <div>
          <div className="text-zinc-500 text-[10px]">SELECTED R:R</div>
          <div className="text-indigo-400 font-bold text-sm">1:{selectedRocketTarget}</div>
        </div>
      </div>
    </div>
  );
};

