import React, { useState, useMemo } from 'react';
import {
  FileCode,
  Download,
  Copy,
  Check,
  Play,
  Globe,
  AlertTriangle,
  Activity,
  Layers,
  Target
} from 'lucide-react';
import { RawOhlcBar } from '../services/SrbmprForwardTestEngine';

export type BacktestStrategyId =
  | 'INTERNAL_WICK_MIDPOINT'
  | 'PROJECTION_1_TO_1'
  | 'PROJECTION_1_TO_2';

export type BacktestTimezoneId =
  | 'UTC'
  | 'Asia/Kolkata'
  | 'Asia/Dubai'
  | 'Europe/London'
  | 'America/New_York'
  | 'Asia/Tokyo';

export type FailureCaseType =
  | 'NONE_TARGET_REACHED'
  | 'IMMEDIATE_WICK_REJECTION'
  | 'NEAR_MISS_REVERSAL'
  | 'TOLERANCE_SLIPPAGE_STOP'
  | 'STRUCTURAL_TREND_FAILURE'
  | 'TIME_DECAY_EXPIRED'
  | 'UNFILLED_ORDER_EXPIRED'
  | 'ANCHOR_LOW_BROKEN_PRE_FILL';

export interface SimulatedSrbmprTrade {
  setupId: string;
  strategy: BacktestStrategyId;
  anchorBarIndex: number;
  anchorTimestampUtc: number;
  localTimeFormatted: string;
  timezone: BacktestTimezoneId;
  sessionBucket: string;
  anchorHigh: number;
  anchorLow: number;
  bodyTop: number;
  wRef: number;
  plannedEntry: number;
  toleranceAbs: number;
  fillPrice: number | null;
  slPrice: number;
  targetPrice: number;
  riskDistance: number;
  filledViaTolerance: boolean;
  clearedExactEntry: boolean;
  barsHeld: number;
  mfePrice: number;
  maePrice: number;
  mfeR: number;
  maeR: number;
  realizedR: number;
  status: 'WIN' | 'LOSS' | 'WIN_TIME_EXIT' | 'LOSS_TIME_EXIT' | 'UNFILLED_EXPIRED' | 'UNFILLED_INVALIDATED';
  failureCase: FailureCaseType;
}

export interface StrategySummaryMetrics {
  strategy: BacktestStrategyId;
  strategyLabel: string;
  entryFormula: string;
  totalSetups: number;
  filledTrades: number;
  fillRatePct: number;
  winRatePct: number;
  avgWinR: number;
  avgLossR: number;
  expectancyR: number;
  profitFactor: number;
  avgMfeR: number;
  avgMaeR: number;
  avgBarsHeld: number;
}

export interface FailureCaseCount {
  strategy: BacktestStrategyId;
  failureCase: FailureCaseType;
  count: number;
  shareOfFailuresPct: number;
  description: string;
}

export interface TimezoneSessionMetrics {
  timezone: BacktestTimezoneId;
  sessionBucket: string;
  filledTrades: number;
  winRatePct: number;
  expectancyR: number;
  avgMfeR: number;
  avgMaeR: number;
}

const FAILURE_DESCRIPTIONS: Record<FailureCaseType, string> = {
  NONE_TARGET_REACHED: 'Target objective reached cleanly within active lifecycle.',
  IMMEDIATE_WICK_REJECTION: 'Stopped out within <= 2 bars with minimal favorable excursion (MFE < 0.25R).',
  NEAR_MISS_REVERSAL: 'Reached >= 70% of target projection (MFE >= 0.70R) before reversing to Stop-Loss.',
  TOLERANCE_SLIPPAGE_STOP: 'Triggered via tolerance band without clearing exact entry axis, then hit Stop-Loss.',
  STRUCTURAL_TREND_FAILURE: 'Standard structural invalidation after partial expansion (0.25R <= MFE < 0.70R).',
  TIME_DECAY_EXPIRED: 'Observation window expired before reaching either Target or Stop-Loss.',
  UNFILLED_ORDER_EXPIRED: 'Price did not enter the entry tolerance band within maximum wait candles.',
  ANCHOR_LOW_BROKEN_PRE_FILL: 'Anchor candle low was violated prior to limit entry fill.'
};

export const R_SCRIPT_SOURCE = `#!/usr/bin/env Rscript
# ==============================================================================
# SRBMPR-25/26 QUANTITATIVE BACKTESTING ENGINE (R MODULE)
# File: scripts/srbmpr_25_26_backtest.R
# ==============================================================================
# Capabilities:
#   1. Raw OHLC ingestion with POSIXct timestamp parsing & timezone conversion.
#   2. Anchor candle detection & W_ref (Upper Wick reference unit) calculation:
#        body_top = max(open, close)
#        W_ref    = high - body_top
#   3. Entry point definitions across three SRBMPR-25/26 strategies:
#        - INTERNAL_WICK_MIDPOINT : Entry = body_top + 0.5 * W_ref
#        - PROJECTION_1_TO_1      : Entry = anchor_high + 1.0 * W_ref
#        - PROJECTION_1_TO_2      : Entry = anchor_high + 2.0 * W_ref
#   4. Configurable entry tolerance (e.g., 0.1% = 0.001 relative to W_ref)
#      and single active entry lifecycle state machine (IDLE -> PENDING -> ACTIVE).
#   5. MFE, MAE, Win Rate, Expectancy, Failure Case Taxonomy & Timezone Report.
# ==============================================================================

prepare_ohlc_data <- function(df, source_tz = "UTC", target_tz = "UTC") {
  required_cols <- c("timestamp", "open", "high", "low", "close")
  colnames(df) <- tolower(colnames(df))
  missing_cols <- setdiff(required_cols, colnames(df))
  if (length(missing_cols) > 0) {
    stop(sprintf("SCHEMA_ERROR: Missing columns: %s", paste(missing_cols, collapse = ", ")))
  }

  if (is.numeric(df$timestamp)) {
    epoch_sec <- if (max(df$timestamp, na.rm = TRUE) > 1e11) df$timestamp / 1000 else df$timestamp
    dt_utc <- as.POSIXct(epoch_sec, origin = "1970-01-01", tz = "UTC")
  } else {
    dt_utc <- as.POSIXct(as.character(df$timestamp), tz = source_tz)
  }

  df$datetime_utc   <- dt_utc
  df$datetime_local <- as.POSIXct(format(dt_utc, tz = target_tz, usetz = FALSE), tz = target_tz)
  df$local_timezone <- target_tz
  df$local_hour     <- as.integer(format(dt_utc, format = "%H", tz = target_tz))
  df$session_bucket <- ifelse(
    df$local_hour < 8, "00:00-07:59 (Asian/Early)",
    ifelse(df$local_hour < 16, "08:00-15:59 (London/Mid)", "16:00-23:59 (NY/Late)")
  )

  df <- df[order(df$datetime_utc), , drop = FALSE]
  df$bar_index <- seq_len(nrow(df))
  return(df)
}

identify_anchor_candles <- function(ohlc, swing_lookback = 5, min_wick_ratio = 0.15) {
  n <- nrow(ohlc)
  body_top   <- pmax(ohlc$open, ohlc$close)
  candle_rng <- pmax(ohlc$high - ohlc$low, 1e-8)
  upper_wick <- pmax(0, ohlc$high - body_top)
  wick_ratio <- upper_wick / candle_rng
  min_w_floor <- max(mean(candle_rng, na.rm = TRUE) * 0.10, ohlc$close[1] * 0.0002)

  is_anchor <- rep(FALSE, n)
  w_ref_vec <- rep(NA_real_, n)

  for (i in (swing_lookback + 1):n) {
    win_highs <- ohlc$high[max(1, i - swing_lookback):i]
    if (ohlc$high[i] >= max(win_highs) && upper_wick[i] >= min_w_floor && wick_ratio[i] >= min_wick_ratio) {
      is_anchor[i] <- TRUE
      w_ref_vec[i] <- upper_wick[i]
    }
  }

  ohlc$body_top            <- body_top
  ohlc$is_anchor           <- is_anchor
  ohlc$w_ref               <- w_ref_vec
  ohlc$entry_wick_midpoint <- ifelse(is_anchor, body_top + 0.5 * w_ref_vec, NA_real_)
  ohlc$proj_1_1            <- ifelse(is_anchor, ohlc$high + 1.0 * w_ref_vec, NA_real_)
  ohlc$proj_1_2            <- ifelse(is_anchor, ohlc$high + 2.0 * w_ref_vec, NA_real_)
  return(ohlc)
}

# Full lifecycle simulator & CLI runner available in /scripts/srbmpr_25_26_backtest.R
`;

function formatLocalTimeAndHour(timestampMs: number, tz: BacktestTimezoneId): { formatted: string; hour: number } {
  try {
    const dt = new Date(timestampMs);
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).formatToParts(dt);
    const map: Record<string, string> = {};
    for (const p of parts) map[p.type] = p.value;
    const hr = parseInt(map.hour || '0', 10) % 24;
    return {
      formatted: `${map.year}-${map.month}-${map.day} ${String(hr).padStart(2, '0')}:${map.minute}`,
      hour: hr
    };
  } catch {
    const iso = new Date(timestampMs).toISOString();
    return {
      formatted: iso.replace('T', ' ').slice(0, 16),
      hour: new Date(timestampMs).getUTCHours()
    };
  }
}

interface Srbmpr2526RBacktestWorkbenchProps {
  bars: RawOhlcBar[];
  symbol: string;
  timeframe: string;
  onClose?: () => void;
}

export const Srbmpr2526RBacktestWorkbench: React.FC<Srbmpr2526RBacktestWorkbenchProps> = ({
  bars,
  symbol,
  timeframe,
  onClose
}) => {
  const [tolerancePctOfWRef, setTolerancePctOfWRef] = useState<number>(0.1); // 0.1% relative to W_ref
  const [swingLookback, setSwingLookback] = useState<number>(5);
  const [slMode, setSlMode] = useState<'W_REF_UNIT' | 'ASSET_0_1_PCT'>('W_REF_UNIT');
  const [targetTimezone, setTargetTimezone] = useState<BacktestTimezoneId>('Asia/Kolkata');
  const [maxHoldBars, setMaxHoldBars] = useState<number>(30);
  const [activeTab, setActiveTab] = useState<'REPORT' | 'FAILURES' | 'TIMEZONE' | 'LEDGER' | 'R_CODE'>('REPORT');
  const [copied, setCopied] = useState<boolean>(false);

  const backtestOutput = useMemo(() => {
    if (!bars || bars.length < 20) {
      return {
        anchorCount: 0,
        strategyMetrics: [] as StrategySummaryMetrics[],
        failureBreakdown: [] as FailureCaseCount[],
        timezonePerformance: [] as TimezoneSessionMetrics[],
        trades: [] as SimulatedSrbmprTrade[]
      };
    }

    const tolRatio = tolerancePctOfWRef / 100; // e.g., 0.1% -> 0.001
    const n = bars.length;

    // 1. Compute average candle range for structural floor
    let totalRange = 0;
    for (let i = 0; i < n; i++) {
      totalRange += Math.max(1e-8, bars[i].high - bars[i].low);
    }
    const avgRange = totalRange / n;
    const minWRefFloor = Math.max(avgRange * 0.1, bars[0].close * 0.00015);

    // 2. Identify Anchor Candles and W_ref
    const isAnchor: boolean[] = new Array(n).fill(false);
    const wRefArr: number[] = new Array(n).fill(0);
    const bodyTopArr: number[] = new Array(n).fill(0);
    let anchorCount = 0;

    for (let i = 0; i < n; i++) {
      const b = bars[i];
      const bTop = Math.max(b.open, b.close);
      bodyTopArr[i] = bTop;
      const uWick = Math.max(0, b.high - bTop);
      const cRange = Math.max(1e-8, b.high - b.low);
      const wickRatio = uWick / cRange;

      if (i >= swingLookback) {
        let isLocalHigh = true;
        for (let k = i - swingLookback; k < i; k++) {
          if (bars[k].high > b.high) {
            isLocalHigh = false;
            break;
          }
        }
        if (isLocalHigh && uWick >= minWRefFloor && wickRatio >= 0.14) {
          isAnchor[i] = true;
          wRefArr[i] = uWick;
          anchorCount++;
        }
      }
    }

    // 3. Simulate each strategy with Single Active Entry Lifecycle
    const strategies: Array<{
      id: BacktestStrategyId;
      label: string;
      formula: string;
      rMult: number;
    }> = [
      {
        id: 'INTERNAL_WICK_MIDPOINT',
        label: 'Internal Wick Midpoint',
        formula: 'body_top + 0.5 × W_ref → Target 1:1',
        rMult: 1.5
      },
      {
        id: 'PROJECTION_1_TO_1',
        label: '1:1 Projection Entry',
        formula: 'anchor_high + 1.0 × W_ref → Target 1:2',
        rMult: 1.0
      },
      {
        id: 'PROJECTION_1_TO_2',
        label: '1:2 Projection Entry',
        formula: 'anchor_high + 2.0 × W_ref → Target 1:3',
        rMult: 1.0
      }
    ];

    const allTrades: SimulatedSrbmprTrade[] = [];
    const maxWaitBars = 15;

    for (const strat of strategies) {
      let lifecycleState: 'IDLE' | 'PENDING_FILL' | 'ACTIVE_TRADE' = 'IDLE';
      let currentTrade: SimulatedSrbmprTrade | null = null;
      let waitElapsed = 0;

      for (let i = 0; i < n; i++) {
        const bar = bars[i];

        if (lifecycleState === 'ACTIVE_TRADE' && currentTrade && currentTrade.fillPrice !== null) {
          currentTrade.barsHeld += 1;
          const fav = bar.high - currentTrade.fillPrice;
          const adv = currentTrade.fillPrice - bar.low;
          if (fav > currentTrade.mfePrice) currentTrade.mfePrice = fav;
          if (adv > currentTrade.maePrice) currentTrade.maePrice = adv;
          if (bar.high >= currentTrade.plannedEntry) currentTrade.clearedExactEntry = true;

          const hitSl = bar.low <= currentTrade.slPrice;
          const hitTarget = bar.high >= currentTrade.targetPrice;
          const timedOut = currentTrade.barsHeld >= maxHoldBars;

          if (hitSl || hitTarget || timedOut) {
            let resolveTarget = hitTarget;
            let resolveSl = hitSl;
            if (hitSl && hitTarget) {
              if (Math.abs(bar.open - currentTrade.slPrice) <= Math.abs(bar.open - currentTrade.targetPrice)) {
                resolveTarget = false;
              } else {
                resolveSl = false;
              }
            }

            currentTrade.mfeR = Number((currentTrade.mfePrice / currentTrade.riskDistance).toFixed(3));
            currentTrade.maeR = Number((currentTrade.maePrice / currentTrade.riskDistance).toFixed(3));

            if (resolveTarget) {
              currentTrade.status = 'WIN';
              currentTrade.realizedR = Number(
                ((currentTrade.targetPrice - currentTrade.fillPrice) / currentTrade.riskDistance).toFixed(3)
              );
              currentTrade.failureCase = 'NONE_TARGET_REACHED';
            } else if (resolveSl) {
              currentTrade.status = 'LOSS';
              currentTrade.realizedR = -1.0;
              if (!currentTrade.clearedExactEntry && currentTrade.filledViaTolerance) {
                currentTrade.failureCase = 'TOLERANCE_SLIPPAGE_STOP';
              } else if (currentTrade.barsHeld <= 2 && currentTrade.mfeR < 0.25) {
                currentTrade.failureCase = 'IMMEDIATE_WICK_REJECTION';
              } else if (currentTrade.mfeR >= 0.7) {
                currentTrade.failureCase = 'NEAR_MISS_REVERSAL';
              } else {
                currentTrade.failureCase = 'STRUCTURAL_TREND_FAILURE';
              }
            } else {
              const pnl = bar.close - currentTrade.fillPrice;
              currentTrade.realizedR = Number((pnl / currentTrade.riskDistance).toFixed(3));
              currentTrade.status = currentTrade.realizedR > 0 ? 'WIN_TIME_EXIT' : 'LOSS_TIME_EXIT';
              currentTrade.failureCase = 'TIME_DECAY_EXPIRED';
            }

            allTrades.push(currentTrade);
            currentTrade = null;
            lifecycleState = 'IDLE';
          }
          continue;
        }

        if (lifecycleState === 'PENDING_FILL' && currentTrade) {
          waitElapsed += 1;

          if (bar.low < currentTrade.anchorLow) {
            currentTrade.status = 'UNFILLED_INVALIDATED';
            currentTrade.failureCase = 'ANCHOR_LOW_BROKEN_PRE_FILL';
            allTrades.push(currentTrade);
            currentTrade = null;
            lifecycleState = 'IDLE';
            continue;
          }

          const bandLow = currentTrade.plannedEntry - currentTrade.toleranceAbs;
          const bandHigh = currentTrade.plannedEntry + currentTrade.toleranceAbs;
          const touchedBand = bar.high >= bandLow && bar.low <= bandHigh;
          const crossedExact = bar.low <= currentTrade.plannedEntry && bar.high >= currentTrade.plannedEntry;

          if (touchedBand || crossedExact) {
            const fillPx = crossedExact
              ? currentTrade.plannedEntry
              : bar.high >= bandLow && bar.high < currentTrade.plannedEntry
                ? bandLow
                : bandHigh;

            currentTrade.fillPrice = fillPx;
            currentTrade.filledViaTolerance = Math.abs(fillPx - currentTrade.plannedEntry) > 1e-8;
            currentTrade.clearedExactEntry = bar.high >= currentTrade.plannedEntry;
            lifecycleState = 'ACTIVE_TRADE';
            continue;
          }

          if (waitElapsed >= maxWaitBars) {
            currentTrade.status = 'UNFILLED_EXPIRED';
            currentTrade.failureCase = 'UNFILLED_ORDER_EXPIRED';
            allTrades.push(currentTrade);
            currentTrade = null;
            lifecycleState = 'IDLE';
          }
          continue;
        }

        if (lifecycleState === 'IDLE' && isAnchor[i]) {
          const wRef = wRefArr[i];
          const bTop = bodyTopArr[i];
          const plannedEntry =
            strat.id === 'INTERNAL_WICK_MIDPOINT'
              ? bTop + 0.5 * wRef
              : strat.id === 'PROJECTION_1_TO_1'
                ? bar.high + 1.0 * wRef
                : bar.high + 2.0 * wRef;

          const toleranceAbs = Math.max(wRef * tolRatio, plannedEntry * 0.00005);
          const riskDistance =
            slMode === 'W_REF_UNIT' ? wRef : Math.max(plannedEntry * 0.001, wRef * 0.5);

          const slPrice = plannedEntry - riskDistance;
          const targetPrice = plannedEntry + strat.rMult * wRef;

          const { formatted, hour } = formatLocalTimeAndHour(bar.timestamp, targetTimezone);
          const sessionBucket =
            hour < 8
              ? '00:00-07:59 (Asian/Early)'
              : hour < 16
                ? '08:00-15:59 (London/Mid)'
                : '16:00-23:59 (NY/Late)';

          currentTrade = {
            setupId: `SRB-${strat.id.slice(0, 4)}-${String(i + 1).padStart(4, '0')}`,
            strategy: strat.id,
            anchorBarIndex: i + 1,
            anchorTimestampUtc: bar.timestamp,
            localTimeFormatted: formatted,
            timezone: targetTimezone,
            sessionBucket,
            anchorHigh: bar.high,
            anchorLow: bar.low,
            bodyTop: bTop,
            wRef,
            plannedEntry,
            toleranceAbs,
            fillPrice: null,
            slPrice,
            targetPrice,
            riskDistance,
            filledViaTolerance: false,
            clearedExactEntry: false,
            barsHeld: 0,
            mfePrice: 0,
            maePrice: 0,
            mfeR: 0,
            maeR: 0,
            realizedR: 0,
            status: 'UNFILLED_EXPIRED',
            failureCase: 'NONE_TARGET_REACHED'
          };
          waitElapsed = 0;
          lifecycleState = 'PENDING_FILL';
        }
      }
    }

    // 4. Aggregate Strategy Summary Metrics
    const strategyMetrics: StrategySummaryMetrics[] = strategies.map(strat => {
      const subAll = allTrades.filter(t => t.strategy === strat.id);
      const filled = subAll.filter(t =>
        ['WIN', 'LOSS', 'WIN_TIME_EXIT', 'LOSS_TIME_EXIT'].includes(t.status)
      );
      const totalSetups = subAll.length;
      const filledCount = filled.length;
      const fillRatePct = totalSetups > 0 ? (filledCount / totalSetups) * 100 : 0;

      const wins = filled.filter(t => t.status === 'WIN' || t.status === 'WIN_TIME_EXIT');
      const losses = filled.filter(t => t.status === 'LOSS' || t.status === 'LOSS_TIME_EXIT');

      const winRatePct = filledCount > 0 ? (wins.length / filledCount) * 100 : 0;
      const avgWinR =
        wins.length > 0 ? wins.reduce((acc, r) => acc + r.realizedR, 0) / wins.length : 0;
      const avgLossR =
        losses.length > 0
          ? Math.abs(losses.reduce((acc, r) => acc + r.realizedR, 0) / losses.length)
          : 0;

      const winProb = filledCount > 0 ? wins.length / filledCount : 0;
      const lossProb = filledCount > 0 ? losses.length / filledCount : 0;
      const expectancyR = winProb * avgWinR - lossProb * avgLossR;

      const grossProfit = wins.reduce((acc, r) => acc + r.realizedR, 0);
      const grossLoss = Math.abs(losses.reduce((acc, r) => acc + r.realizedR, 0));
      const profitFactor =
        grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 99.9 : 0;

      const avgMfeR =
        filledCount > 0 ? filled.reduce((acc, r) => acc + r.mfeR, 0) / filledCount : 0;
      const avgMaeR =
        filledCount > 0 ? filled.reduce((acc, r) => acc + r.maeR, 0) / filledCount : 0;
      const avgBarsHeld =
        filledCount > 0 ? filled.reduce((acc, r) => acc + r.barsHeld, 0) / filledCount : 0;

      return {
        strategy: strat.id,
        strategyLabel: strat.label,
        entryFormula: strat.formula,
        totalSetups,
        filledTrades: filledCount,
        fillRatePct: Number(fillRatePct.toFixed(1)),
        winRatePct: Number(winRatePct.toFixed(1)),
        avgWinR: Number(avgWinR.toFixed(2)),
        avgLossR: Number(avgLossR.toFixed(2)),
        expectancyR: Number(expectancyR.toFixed(3)),
        profitFactor: Number(profitFactor.toFixed(2)),
        avgMfeR: Number(avgMfeR.toFixed(2)),
        avgMaeR: Number(avgMaeR.toFixed(2)),
        avgBarsHeld: Number(avgBarsHeld.toFixed(1))
      };
    });

    // 5. Aggregate Failure Case Breakdown
    const failureBreakdown: FailureCaseCount[] = [];
    for (const strat of strategies) {
      const failed = allTrades.filter(
        t => t.strategy === strat.id && t.failureCase !== 'NONE_TARGET_REACHED'
      );
      const counts = new Map<FailureCaseType, number>();
      for (const f of failed) {
        counts.set(f.failureCase, (counts.get(f.failureCase) || 0) + 1);
      }
      counts.forEach((cnt, fCase) => {
        failureBreakdown.push({
          strategy: strat.id,
          failureCase: fCase,
          count: cnt,
          shareOfFailuresPct: failed.length > 0 ? Number(((cnt / failed.length) * 100).toFixed(1)) : 0,
          description: FAILURE_DESCRIPTIONS[fCase]
        });
      });
    }

    // 6. Timezone Session Breakdown
    const filledAll = allTrades.filter(t =>
      ['WIN', 'LOSS', 'WIN_TIME_EXIT', 'LOSS_TIME_EXIT'].includes(t.status)
    );
    const buckets = [
      '00:00-07:59 (Asian/Early)',
      '08:00-15:59 (London/Mid)',
      '16:00-23:59 (NY/Late)'
    ];
    const timezonePerformance: TimezoneSessionMetrics[] = buckets.map(bucket => {
      const sub = filledAll.filter(t => t.sessionBucket === bucket);
      const nSub = sub.length;
      const wins = sub.filter(t => t.status === 'WIN' || t.status === 'WIN_TIME_EXIT').length;
      const wr = nSub > 0 ? (wins / nSub) * 100 : 0;
      const expR = nSub > 0 ? sub.reduce((acc, r) => acc + r.realizedR, 0) / nSub : 0;
      const mfeR = nSub > 0 ? sub.reduce((acc, r) => acc + r.mfeR, 0) / nSub : 0;
      const maeR = nSub > 0 ? sub.reduce((acc, r) => acc + r.maeR, 0) / nSub : 0;

      return {
        timezone: targetTimezone,
        sessionBucket: bucket,
        filledTrades: nSub,
        winRatePct: Number(wr.toFixed(1)),
        expectancyR: Number(expR.toFixed(3)),
        avgMfeR: Number(mfeR.toFixed(2)),
        avgMaeR: Number(maeR.toFixed(2))
      };
    });

    return {
      anchorCount,
      strategyMetrics,
      failureBreakdown,
      timezonePerformance,
      trades: allTrades
    };
  }, [bars, tolerancePctOfWRef, swingLookback, slMode, targetTimezone, maxHoldBars]);

  const handleCopyRScript = () => {
    navigator.clipboard.writeText(R_SCRIPT_SOURCE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadRScript = () => {
    const blob = new Blob([R_SCRIPT_SOURCE], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'srbmpr_25_26_backtest.R';
    a.click();
  };

  const formatPx = (val: number | null) => {
    if (val === null || Number.isNaN(val)) return '-';
    if (val < 1) return val.toFixed(6);
    if (val < 100) return val.toFixed(4);
    return val.toFixed(2);
  };

  return (
    <div className="bg-[#0b0f17] border border-slate-800 rounded-xl text-slate-100 font-mono text-xs shadow-2xl overflow-hidden">
      {/* Header Bar */}
      <div className="border-b border-slate-800 bg-[#070a10] px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <FileCode className="w-5 h-5 text-emerald-400" />
          <div>
            <div className="font-bold text-white text-sm tracking-wide flex items-center gap-2">
              <span>SRBMPR-25/26 R BACKTEST ENGINE & W_ref LIFECYCLE AUDITOR</span>
              <span className="px-2 py-0.5 text-[10px] bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 rounded">
                scripts/srbmpr_25_26_backtest.R
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              Dataset: {symbol} ({timeframe}) • {bars.length} Raw OHLC Candles • {backtestOutput.anchorCount} Anchor Candles (W_ref = High - max(Open, Close))
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyRScript}
            className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded flex items-center gap-1.5 text-[11px] font-bold transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied R Script' : 'Copy R Script'}</span>
          </button>
          <button
            onClick={handleDownloadRScript}
            className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-black rounded flex items-center gap-1.5 text-[11px] font-bold transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download .R File</span>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] font-bold"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* Parameter Control Bar */}
      <div className="border-b border-slate-800 bg-slate-900/60 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Tolerance relative to W_ref */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Tolerance (% of W_ref):</span>
            {[0.05, 0.1, 0.25, 0.5].map(tol => (
              <button
                key={tol}
                onClick={() => setTolerancePctOfWRef(tol)}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${
                  tolerancePctOfWRef === tol
                    ? 'bg-amber-500 text-black'
                    : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {tol}%
              </button>
            ))}
          </div>

          {/* Anchor Lookback */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Anchor Lookback:</span>
            {[3, 5, 8].map(lb => (
              <button
                key={lb}
                onClick={() => setSwingLookback(lb)}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition-colors ${
                  swingLookback === lb
                    ? 'bg-cyan-500 text-black'
                    : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {lb}b
              </button>
            ))}
          </div>

          {/* SL Mode */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Stop Rule:</span>
            <button
              onClick={() => setSlMode('W_REF_UNIT')}
              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                slMode === 'W_REF_UNIT'
                  ? 'bg-emerald-500 text-black'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              1.0 × W_ref
            </button>
            <button
              onClick={() => setSlMode('ASSET_0_1_PCT')}
              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                slMode === 'ASSET_0_1_PCT'
                  ? 'bg-emerald-500 text-black'
                  : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              0.10% Asset Stop
            </button>
          </div>

          {/* Reporting Timezone */}
          <div className="flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-sky-400" />
            <span className="text-[10px] text-slate-400 uppercase font-bold">Timezone:</span>
            <select
              value={targetTimezone}
              onChange={e => setTargetTimezone(e.target.value as BacktestTimezoneId)}
              className="bg-slate-950 border border-slate-700 text-white text-[11px] font-bold px-2 py-0.5 rounded"
            >
              <option value="UTC">UTC (Exchange)</option>
              <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
              <option value="Asia/Dubai">Asia/Dubai (GST)</option>
              <option value="Europe/London">Europe/London (LDN)</option>
              <option value="America/New_York">America/New_York (NY)</option>
              <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
            </select>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center bg-slate-950 border border-slate-800 rounded p-0.5">
          {[
            { id: 'REPORT', label: 'Strategy Summary' },
            { id: 'FAILURES', label: 'Failure Cases' },
            { id: 'TIMEZONE', label: 'Timezone Performance' },
            { id: 'LEDGER', label: `Lifecycle Ledger (${backtestOutput.trades.length})` },
            { id: 'R_CODE', label: 'R Script Source' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors ${
                activeTab === tab.id
                  ? 'bg-emerald-500 text-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {activeTab === 'REPORT' && (
          <div className="space-y-4">
            <div className="overflow-x-auto border border-slate-800 rounded-lg">
              <table className="w-full text-left border-collapse tabular-nums">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-900/90 text-[10px] text-slate-400 uppercase">
                    <th className="py-2.5 px-3">Entry Strategy</th>
                    <th className="py-2.5 px-3">Coordinate Formula</th>
                    <th className="py-2.5 px-3 text-right">Setups</th>
                    <th className="py-2.5 px-3 text-right">Filled</th>
                    <th className="py-2.5 px-3 text-right">Fill Rate</th>
                    <th className="py-2.5 px-3 text-right">Win Rate</th>
                    <th className="py-2.5 px-3 text-right">Expectancy (R)</th>
                    <th className="py-2.5 px-3 text-right">Profit Factor</th>
                    <th className="py-2.5 px-3 text-right">Avg MFE (R)</th>
                    <th className="py-2.5 px-3 text-right">Avg MAE (R)</th>
                    <th className="py-2.5 px-3 text-right">Avg Hold</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/70">
                  {backtestOutput.strategyMetrics.map(row => (
                    <tr key={row.strategy} className="hover:bg-slate-900/50">
                      <td className="py-2.5 px-3 font-bold text-white">{row.strategyLabel}</td>
                      <td className="py-2.5 px-3 text-slate-400 text-[11px]">{row.entryFormula}</td>
                      <td className="py-2.5 px-3 text-right text-slate-300">{row.totalSetups}</td>
                      <td className="py-2.5 px-3 text-right text-white font-bold">{row.filledTrades}</td>
                      <td className="py-2.5 px-3 text-right text-slate-300">{row.fillRatePct}%</td>
                      <td className="py-2.5 px-3 text-right font-bold text-emerald-400">{row.winRatePct}%</td>
                      <td
                        className={`py-2.5 px-3 text-right font-bold ${
                          row.expectancyR >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {row.expectancyR >= 0 ? `+${row.expectancyR}R` : `${row.expectancyR}R`}
                      </td>
                      <td className="py-2.5 px-3 text-right text-amber-400 font-bold">{row.profitFactor}</td>
                      <td className="py-2.5 px-3 text-right text-sky-400">+{row.avgMfeR}R</td>
                      <td className="py-2.5 px-3 text-right text-rose-400">-{row.avgMaeR}R</td>
                      <td className="py-2.5 px-3 text-right text-slate-300">{row.avgBarsHeld}b</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-[11px]">
              <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-3">
                <div className="text-slate-400 font-bold uppercase text-[10px] mb-1">
                  1. Anchor & W_ref Reference Definition
                </div>
                <div className="text-slate-300">
                  Each structural anchor candle defines <span className="text-white font-bold">body_top = max(Open, Close)</span> and <span className="text-emerald-400 font-bold">W_ref = High - body_top</span>. All internal midpoint and 1:1 / 1:2 projections scale directly from W_ref.
                </div>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-3">
                <div className="text-slate-400 font-bold uppercase text-[10px] mb-1">
                  2. Single Active Entry Lifecycle
                </div>
                <div className="text-slate-300">
                  Only one setup per strategy stream can be <span className="text-amber-400 font-bold">PENDING_FILL</span> or <span className="text-emerald-400 font-bold">ACTIVE_TRADE</span> at any bar. Subsequent anchors are ignored until the active lifecycle resolves.
                </div>
              </div>
              <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-3">
                <div className="text-slate-400 font-bold uppercase text-[10px] mb-1">
                  3. Relative Tolerance Execution
                </div>
                <div className="text-slate-300">
                  Entries trigger within <span className="text-cyan-400 font-bold">Entry ± ({tolerancePctOfWRef}% × W_ref)</span>, isolating tolerance-induced fills to audit slippage-stop failure cases.
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'FAILURES' && (
          <div className="overflow-x-auto border border-slate-800 rounded-lg">
            <table className="w-full text-left border-collapse tabular-nums">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/90 text-[10px] text-slate-400 uppercase">
                  <th className="py-2.5 px-3">Strategy</th>
                  <th className="py-2.5 px-3">Failure Case Classification</th>
                  <th className="py-2.5 px-3 text-right">Occurrences</th>
                  <th className="py-2.5 px-3 text-right">Share of Strategy Failures</th>
                  <th className="py-2.5 px-3">Diagnostic Mechanism</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {backtestOutput.failureBreakdown.map((item, idx) => (
                  <tr key={`${item.strategy}-${item.failureCase}-${idx}`} className="hover:bg-slate-900/50">
                    <td className="py-2.5 px-3 font-bold text-white">{item.strategy}</td>
                    <td className="py-2.5 px-3 font-bold text-rose-400">{item.failureCase}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-white">{item.count}</td>
                    <td className="py-2.5 px-3 text-right text-amber-400">{item.shareOfFailuresPct}%</td>
                    <td className="py-2.5 px-3 text-slate-300 text-[11px]">{item.description}</td>
                  </tr>
                ))}
                {backtestOutput.failureBreakdown.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-500">
                      No failure cases recorded for the current parameter configuration.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'TIMEZONE' && (
          <div className="overflow-x-auto border border-slate-800 rounded-lg">
            <table className="w-full text-left border-collapse tabular-nums">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/90 text-[10px] text-slate-400 uppercase">
                  <th className="py-2.5 px-3">Reporting Timezone</th>
                  <th className="py-2.5 px-3">Local Session Window</th>
                  <th className="py-2.5 px-3 text-right">Filled Trades</th>
                  <th className="py-2.5 px-3 text-right">Win Rate</th>
                  <th className="py-2.5 px-3 text-right">Expectancy (R)</th>
                  <th className="py-2.5 px-3 text-right">Avg MFE (R)</th>
                  <th className="py-2.5 px-3 text-right">Avg MAE (R)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {backtestOutput.timezonePerformance.map(row => (
                  <tr key={row.sessionBucket} className="hover:bg-slate-900/50">
                    <td className="py-2.5 px-3 font-bold text-sky-400">{row.timezone}</td>
                    <td className="py-2.5 px-3 font-bold text-white">{row.sessionBucket}</td>
                    <td className="py-2.5 px-3 text-right text-white">{row.filledTrades}</td>
                    <td className="py-2.5 px-3 text-right font-bold text-emerald-400">{row.winRatePct}%</td>
                    <td
                      className={`py-2.5 px-3 text-right font-bold ${
                        row.expectancyR >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {row.expectancyR >= 0 ? `+${row.expectancyR}R` : `${row.expectancyR}R`}
                    </td>
                    <td className="py-2.5 px-3 text-right text-sky-400">+{row.avgMfeR}R</td>
                    <td className="py-2.5 px-3 text-right text-rose-400">-{row.avgMaeR}R</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'LEDGER' && (
          <div className="max-h-80 overflow-y-auto border border-slate-800 rounded-lg">
            <table className="w-full text-left border-collapse tabular-nums">
              <thead className="sticky top-0 bg-slate-900 border-b border-slate-800 text-[10px] text-slate-400 uppercase">
                <tr>
                  <th className="py-2 px-2.5">Setup ID</th>
                  <th className="py-2 px-2.5">Strategy</th>
                  <th className="py-2 px-2.5">Local Timestamp ({targetTimezone})</th>
                  <th className="py-2 px-2.5 text-right">W_ref</th>
                  <th className="py-2 px-2.5 text-right">Entry</th>
                  <th className="py-2 px-2.5 text-right">SL</th>
                  <th className="py-2 px-2.5 text-right">Target</th>
                  <th className="py-2 px-2.5 text-right">MFE (R)</th>
                  <th className="py-2 px-2.5 text-right">MAE (R)</th>
                  <th className="py-2 px-2.5 text-right">Realized R</th>
                  <th className="py-2 px-2.5">Status / Failure Case</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {backtestOutput.trades.slice(0, 120).map(t => (
                  <tr key={t.setupId} className="hover:bg-slate-900/40">
                    <td className="py-1.5 px-2.5 font-bold text-slate-300">{t.setupId}</td>
                    <td className="py-1.5 px-2.5 text-slate-300">{t.strategy}</td>
                    <td className="py-1.5 px-2.5 text-slate-400">{t.localTimeFormatted}</td>
                    <td className="py-1.5 px-2.5 text-right text-amber-400">{formatPx(t.wRef)}</td>
                    <td className="py-1.5 px-2.5 text-right text-white font-bold">{formatPx(t.plannedEntry)}</td>
                    <td className="py-1.5 px-2.5 text-right text-rose-400">{formatPx(t.slPrice)}</td>
                    <td className="py-1.5 px-2.5 text-right text-emerald-400">{formatPx(t.targetPrice)}</td>
                    <td className="py-1.5 px-2.5 text-right text-sky-400">+{t.mfeR}R</td>
                    <td className="py-1.5 px-2.5 text-right text-rose-400">-{t.maeR}R</td>
                    <td
                      className={`py-1.5 px-2.5 text-right font-bold ${
                        t.realizedR > 0 ? 'text-emerald-400' : t.realizedR < 0 ? 'text-rose-400' : 'text-slate-500'
                      }`}
                    >
                      {t.realizedR > 0 ? `+${t.realizedR}R` : `${t.realizedR}R`}
                    </td>
                    <td className="py-1.5 px-2.5">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          t.status.startsWith('WIN')
                            ? 'bg-emerald-500/15 text-emerald-300'
                            : t.status.startsWith('LOSS')
                              ? 'bg-rose-500/15 text-rose-300'
                              : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {t.status} ({t.failureCase})
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'R_CODE' && (
          <div className="bg-[#05070b] border border-slate-800 rounded-lg p-3 max-h-80 overflow-y-auto">
            <pre className="text-[11px] text-emerald-300 font-mono whitespace-pre-wrap leading-relaxed">
              {R_SCRIPT_SOURCE}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
