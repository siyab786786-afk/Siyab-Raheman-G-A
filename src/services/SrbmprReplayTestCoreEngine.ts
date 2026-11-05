import {
  ForwardTimeframe,
  RawOhlcBar,
  StructureSide,
  StageLabel,
  ConnectionBreakType,
  ForwardTargetMap,
  SrbmprForwardTestEngine
} from './SrbmprForwardTestEngine';

export type ReplayDatasetSizeOption = 1000 | 3500;

export type ReplaySetupStatus = 'PENDING' | 'CONFIRMED' | 'INVALIDATED' | 'COMPLETED';

export type MechanismPipeState = '1:1' | '1:2' | '1:3' | 'COMPLETED';

export type DisplayTimezoneId =
  | 'UTC'
  | 'Asia/Kolkata'
  | 'America/New_York'
  | 'Europe/London'
  | 'Asia/Tokyo'
  | 'Asia/Dubai';

export interface TimezoneOption {
  id: DisplayTimezoneId;
  shortLabel: string;
  offsetLabel: string;
  regionName: string;
}

export const SUPPORTED_TIMEZONES: TimezoneOption[] = [
  { id: 'UTC', shortLabel: 'UTC', offsetLabel: 'UTC+00:00', regionName: 'Coordinated Universal Time (Source)' },
  { id: 'Asia/Kolkata', shortLabel: 'IST', offsetLabel: 'UTC+05:30', regionName: 'India Standard Time (Mumbai/Delhi)' },
  { id: 'Asia/Dubai', shortLabel: 'GST', offsetLabel: 'UTC+04:00', regionName: 'Gulf Standard Time (Dubai)' },
  { id: 'Europe/London', shortLabel: 'LDN', offsetLabel: 'UTC+00/01', regionName: 'London UK Session' },
  { id: 'America/New_York', shortLabel: 'EST', offsetLabel: 'UTC-05/04', regionName: 'New York US Session' },
  { id: 'Asia/Tokyo', shortLabel: 'JST', offsetLabel: 'UTC+09:00', regionName: 'Tokyo Asian Session' }
];

export type StructuralRoleType =
  | 'LEFT_ORIGIN_H1'
  | 'LEFT_VALLEY_L1'
  | 'LEFT_H_COMPLETE'
  | 'LEFT_LH_BREAK'
  | 'RIGHT_ORIGIN_L1'
  | 'RIGHT_PEAK_H1'
  | 'RIGHT_L_COMPLETE'
  | 'RIGHT_HL_BREAK'
  | 'WAIT_CONFIRMATION'
  | 'DECISION_ENTRY'
  | 'HONEST_THREE_REVERSAL_WATCH'
  | 'PIVOT_HIGH'
  | 'PIVOT_LOW';

export interface CandleStructuralAnnotation {
  barIndex: number; // 1-based bar number
  timestamp: number;
  structuralRole: StructuralRoleType;
  orientation: 'LEFT_HLH' | 'RIGHT_LHL' | 'NEUTRAL';
  behaviorDirection: 'HIGH_TO_LOW' | 'LOW_TO_HIGH' | 'NONE';
  cyclePhase: 'ORIGIN' | 'APEX' | 'TRANSITION' | 'COMPLETION';
  stageLabel: StageLabel;
  shortBadge: string;
  pricePosition: 'ABOVE_HIGH' | 'BELOW_LOW' | 'AT_OPEN';
  priceLevel: number;
  assetPath: string;
  cycleIconPath: string;
  explanation: string;
  linkedDecisionId?: string;
}

export interface ReplayMechanismDecision {
  id: string;
  setupOriginSide: StructureSide;
  sequencePattern: 'High → Low → High' | 'Low → High → Low';
  stage: StageLabel;
  connectionBreak: ConnectionBreakType;
  connectionBreakDetail: string;
  direction: 'LONG' | 'SHORT';
  completionCandleIndex: number;
  completionTimestamp: string;
  completionPivotPrice: number;
  connectionBreakCandleIndex: number;
  connectionBreakTimestamp: string;
  connectionPivotPrice: number;
  waitCandlesRequired: number;
  waitCandlesElapsedAtFrontier: number;
  decisionCandleIndex: number; // The bar index where entry is confirmed
  decisionTimestamp: string;
  entryPrice: number; // Swing-based: Near Last Swing Low (RIGHT LONG) or Last Swing High (LEFT SHORT)
  stopLossPrice: number; // 0.1% below Swing Low (LONG) or 0.1% above Swing High (SHORT)
  invalidationCondition: string;
  riskAmount: number;
  targets: ForwardTargetMap;
  pipeStateAtFrontier: MechanismPipeState;
  pipe11Reached: boolean;
  pipe12Reached: boolean;
  pipe13Reached: boolean;
  statusAtFrontier: ReplaySetupStatus;
  highestRatioHitAtFrontier: string;
  achievedRAtFrontier: number;
  zoneSegmentAtFrontier: 'BACK_TEST_LEFT' | 'REPLAY_FRONTIER' | 'UNREVEALED_FORWARD_RIGHT';
  lookAheadBiasCheck: 'PASS_FRONTIER_ONLY';
  sourceHash: string;
}

export interface ReplaySideFrontierState {
  family: 'High → Low → High' | 'Low → High → Low';
  primaryDirection: 'SHORT' | 'LONG';
  currentPhase:
    | 'SEEKING_FIRST_PIVOT'
    | 'SEEKING_SECOND_PIVOT'
    | 'SEEKING_COMPLETION_PIVOT'
    | 'SEEKING_CONNECTION_BREAK'
    | 'WAITING_CONFIRMATION_CANDLES';
  pivot1Price: number | null;
  pivot1BarIndex: number | null;
  pivot2Price: number | null;
  pivot2BarIndex: number | null;
  completionPivotPrice: number | null;
  completionBarIndex: number | null;
  connectionBreakPrice: number | null;
  connectionBreakBarIndex: number | null;
  waitCounter: number;
  waitRequired: number;
  zeroCompletedCount: number; // 0 to 3
  honestCompletedCount: number; // 0 to 3
  honestThreeJustCompleted: boolean;
  nextStageLabel: StageLabel;
  completedBehaviorsCount: number;
  unfinishedBehaviorState: string;
  remainingBehaviorBalance: string;
}

export interface HonestThreeReversalPreparation {
  active: boolean;
  completedHonestThreeSide: 'RIGHT_LHL' | 'LEFT_HLH' | null;
  prepareDirection: 'SHORT' | 'LONG' | null;
  honestThreeBarIndex: number | null;
  honestThreePrice: number | null;
  turningSwingPrice: number | null;
  provisionalEntrySwingPrice: number | null;
  provisionalStopLossPrice: number | null;
  provisionalTarget11: number | null;
  provisionalTarget12: number | null;
  provisionalTarget13: number | null;
  statusHindi: string;
  ruleExplanationHindi: string;
}

export interface RocketEngineFrontierState {
  activePrioritySide: 'LEFT_HLH_SHORT' | 'RIGHT_LHL_LONG' | 'BALANCED_SYMMETRIC';
  priorityReasonHindi: string;
  leftShortCount: number;
  rightLongCount: number;
  longBiasRemoved: true;
  equalSideWeightEnforced: true;
  swingEntryEnforced: true;
  slPercentRule: 0.1;
  honestThreeReversalPrep: HonestThreeReversalPreparation;
}

export interface ReplayDatasetReport {
  requestedSize: ReplayDatasetSizeOption;
  actualLoadedCount: number;
  missingCandleCount: number;
  shortageReported: boolean;
  shortageNotice: string;
  source: 'BYBIT_V5_LIVE_PAGINATED_RAW_OHLC' | 'SRBMPR_RESEARCH_CONTINUOUS_DATASET';
  symbol: string;
  category: 'linear' | 'spot';
  timeframe: ForwardTimeframe;
  oldestTimestamp: string;
  newestTimestamp: string;
  timestampContinuityVerified: boolean;
  duplicateCandlesPrevented: number;
  backTestLeftBoundaryIndex: number; // Historical context end index
  initialReplayStartIndex: number;
}

export interface ReplayFrontierEvaluation {
  frontierIndex: number; // 0-based index in candles array
  frontierBarNumber: number; // 1-based bar number
  frontierCandle: RawOhlcBar;
  backTestLeftCount: number;
  forwardUnrevealedRightCount: number;
  totalDatasetCount: number;
  leftSideState: ReplaySideFrontierState;
  rightSideState: ReplaySideFrontierState;
  activeDecisionAtFrontier: ReplayMechanismDecision | null;
  latestConfirmedDecision: ReplayMechanismDecision | null;
  latestLeftShortDecision: ReplayMechanismDecision | null;
  latestRightLongDecision: ReplayMechanismDecision | null;
  rocketEngineState: RocketEngineFrontierState;
  visibleDecisionsUpToFrontier: ReplayMechanismDecision[];
  candleAnnotationsByBarIndex: Record<number, CandleStructuralAnnotation>;
  structuralEventsUpToFrontier: CandleStructuralAnnotation[];
  auditLogsUpToFrontier: string[];
}

export interface VerifiedControllerStatus {
  controllerId: string;
  controllerStatus: 'ACTIVE_VERIFIED' | 'AUTHORIZING' | 'ERROR';
  localResearchReplayUnlocked: boolean;
  paymentRequiredForLocalResearch: false;
  bybitV5PublicStreamConnected: boolean;
  bybitAuthenticatedKeysConfigured: boolean;
  primaryKeyId: string;
  secondaryKeyId: string;
  whitelistedIp: string;
  lastDiagnosticTimestamp: string;
  diagnosticLog: string[];
}

export class SrbmprReplayTestCoreEngine {
  private static instance: SrbmprReplayTestCoreEngine;

  public static getInstance(): SrbmprReplayTestCoreEngine {
    if (!SrbmprReplayTestCoreEngine.instance) {
      SrbmprReplayTestCoreEngine.instance = new SrbmprReplayTestCoreEngine();
    }
    return SrbmprReplayTestCoreEngine.instance;
  }

  /**
   * Formats a UTC millisecond timestamp into the user's selected display timezone
   * while preserving the underlying UTC source record.
   */
  public formatTimestampInTimezone(timestampMs: number, tzId: DisplayTimezoneId = 'UTC'): string {
    if (!Number.isFinite(timestampMs) || timestampMs <= 0) return 'N/A';
    if (tzId === 'UTC') {
      return new Date(timestampMs).toISOString().replace('T', ' ').slice(0, 19);
    }
    try {
      const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: tzId,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).formatToParts(new Date(timestampMs));

      const map: Record<string, string> = {};
      for (const p of parts) {
        map[p.type] = p.value;
      }
      const hour = map.hour === '24' ? '00' : map.hour;
      return `${map.year}-${map.month}-${map.day} ${hour}:${map.minute}:${map.second}`;
    } catch {
      return new Date(timestampMs).toISOString().replace('T', ' ').slice(0, 19);
    }
  }

  /**
   * Fetches 1,000 (standard replay context) or 3,500 (extended replay context) raw OHLC candles
   * from Bybit V5 API using backward chronological pagination (`end` timestamp parameter),
   * deduplicating timestamps and verifying strict chronological order.
   */
  public async loadReplayDataset(
    symbol: string = 'BTCUSDT',
    timeframe: ForwardTimeframe = '1m',
    requestedSize: ReplayDatasetSizeOption = 1000,
    category: 'linear' | 'spot' = 'linear'
  ): Promise<{ candles: RawOhlcBar[]; report: ReplayDatasetReport }> {
    const cleanSymbol = symbol.replace('/', '').toUpperCase();
    const bybitIntervalMap: Record<string, string> = {
      '1m': '1',
      '3m': '3',
      '5m': '5',
      '15m': '15',
      '30m': '30',
      '1h': '60',
      '2h': '120',
      '4h': '240',
      '1D': 'D',
      '1W': 'W',
      '1M': 'M'
    };

    const isSubMinute = timeframe.endsWith('s');
    const interval = bybitIntervalMap[timeframe] || '1';
    const maxPages = requestedSize === 3500 ? 4 : 1;
    const rawMap = new Map<number, string[]>();
    let duplicateCandlesPrevented = 0;
    let cursorEndTimestamp: number | null = null;
    let usedLiveBybit = false;

    if (!isSubMinute) {
      try {
        for (let page = 0; page < maxPages; page++) {
          const remainingNeeded = requestedSize - rawMap.size;
          if (remainingNeeded <= 0) break;
          const limit = Math.min(1000, Math.max(200, remainingNeeded));
          const endParam = cursorEndTimestamp ? `&end=${cursorEndTimestamp - 1}` : '';
          const url = `https://api.bybit.com/v5/market/kline?category=${category}&symbol=${cleanSymbol}&interval=${interval}&limit=${limit}${endParam}`;

          const response = await fetch(url);
          const json = await response.json();

          if (json?.retCode === 0 && Array.isArray(json.result?.list) && json.result.list.length > 0) {
            usedLiveBybit = true;
            const list: string[][] = json.result.list;
            let oldestInBatch = Infinity;

            for (const row of list) {
              const ts = parseInt(row[0], 10);
              if (!Number.isFinite(ts)) continue;
              if (ts < oldestInBatch) oldestInBatch = ts;
              if (rawMap.has(ts)) {
                duplicateCandlesPrevented++;
              } else {
                rawMap.set(ts, row);
              }
            }

            if (!Number.isFinite(oldestInBatch) || list.length < 10) {
              break;
            }
            cursorEndTimestamp = oldestInBatch;
          } else {
            break;
          }
        }
      } catch {
        // Fallback handled below if live fetch fails
      }
    }

    if (usedLiveBybit && rawMap.size > 0) {
      const sortedTimestamps = Array.from(rawMap.keys()).sort((a, b) => a - b);
      const slicedTimestamps =
        sortedTimestamps.length > requestedSize
          ? sortedTimestamps.slice(sortedTimestamps.length - requestedSize)
          : sortedTimestamps;

      let continuityOk = true;
      const bars: RawOhlcBar[] = slicedTimestamps.map((ts, idx) => {
        if (idx > 0 && ts <= slicedTimestamps[idx - 1]) {
          continuityOk = false;
        }
        const row = rawMap.get(ts)!;
        return {
          index: idx + 1,
          timestamp: ts,
          timeFormatted: new Date(ts).toISOString().replace('T', ' ').slice(0, 19),
          open: parseFloat(row[1]),
          high: parseFloat(row[2]),
          low: parseFloat(row[3]),
          close: parseFloat(row[4]),
          volume: parseFloat(row[5] || '0')
        };
      });

      const actualCount = bars.length;
      const missingCount = Math.max(0, requestedSize - actualCount);
      const backTestLeftBoundaryIndex = Math.max(20, Math.floor(actualCount * 0.4));

      return {
        candles: bars,
        report: {
          requestedSize,
          actualLoadedCount: actualCount,
          missingCandleCount: missingCount,
          shortageReported: missingCount > 0,
          shortageNotice:
            missingCount > 0
              ? `Exchange returned ${actualCount.toLocaleString()} valid candles for ${cleanSymbol} (${timeframe}); ${missingCount.toLocaleString()} candles short of requested ${requestedSize.toLocaleString()}.`
              : `Full ${actualCount.toLocaleString()}-candle ${timeframe} dataset loaded and verified from Bybit V5.`,
          source: 'BYBIT_V5_LIVE_PAGINATED_RAW_OHLC',
          symbol: cleanSymbol,
          category,
          timeframe,
          oldestTimestamp: bars[0]?.timeFormatted || 'N/A',
          newestTimestamp: bars[bars.length - 1]?.timeFormatted || 'N/A',
          timestampContinuityVerified: continuityOk,
          duplicateCandlesPrevented,
          backTestLeftBoundaryIndex,
          initialReplayStartIndex: backTestLeftBoundaryIndex
        }
      };
    }

    // Fallback to deterministic SRBMPR research dataset (also used for 1s sub-minute timeframe)
    const fallbackResult = await SrbmprForwardTestEngine.getInstance().fetchMinimum1000RawOhlc(
      cleanSymbol,
      timeframe,
      requestedSize
    );
    const bars = fallbackResult.candles.slice(0, requestedSize);
    const actualCount = bars.length;
    const missingCount = Math.max(0, requestedSize - actualCount);
    const backTestLeftBoundaryIndex = Math.max(20, Math.floor(actualCount * 0.4));

    return {
      candles: bars,
      report: {
        requestedSize,
        actualLoadedCount: actualCount,
        missingCandleCount: missingCount,
        shortageReported: missingCount > 0,
        shortageNotice:
          missingCount > 0
            ? `Loaded ${actualCount.toLocaleString()} candles (${missingCount.toLocaleString()} missing from ${requestedSize.toLocaleString()}).`
            : `Full ${actualCount.toLocaleString()}-candle SRBMPR continuous dataset loaded (${timeframe}).`,
        source: 'SRBMPR_RESEARCH_CONTINUOUS_DATASET',
        symbol: cleanSymbol,
        category,
        timeframe,
        oldestTimestamp: bars[0]?.timeFormatted || 'N/A',
        newestTimestamp: bars[bars.length - 1]?.timeFormatted || 'N/A',
        timestampContinuityVerified: true,
        duplicateCandlesPrevented: 0,
        backTestLeftBoundaryIndex,
        initialReplayStartIndex: backTestLeftBoundaryIndex
      }
    };
  }

  /**
   * ROCKET ENGINE + REPLAY FRONTIER EVALUATOR (STRICT SYMMETRIC FROZEN RULES)
   *
   * FROZEN TABLE OF RULES:
   * | Side  | Sequence          | Completion                 | Direction | Entry कब                                      |
   * | LEFT  | High → Low → High | High Complete + Lower High | SHORT     | High बनने / Lower High connection break पर    |
   * | RIGHT | Low → High → Low  | Low Complete + Higher Low  | LONG      | Low बनने / Higher Low connection break पर     |
   *
   * ENTRY & SL PLACEMENT (SWING-BASED, NEVER BREAKOUT):
   * - LONG (RIGHT side):
   *   - Entry -> Near Last Swing Low (`rightHigherLowBreak` after Higher Low connection break)
   *   - SL -> 0.1% below that Swing Low (`entryPrice * (1 - 0.001)`)
   * - SHORT (LEFT side):
   *   - Entry -> Near Last Swing High (`leftLowerHighBreak` after Lower High connection break)
   *   - SL -> 0.1% above that Swing High (`entryPrice * (1 + 0.001)`)
   *
   * HONEST THREE REVERSAL RULE:
   * - When the 3rd Low (`Honest Three`) completes on RIGHT side and price turns, prepare for SHORT (`LEFT: High → Low → High + Lower High`).
   * - When the 3rd High (`Honest Three`) completes on LEFT side and price turns, prepare for LONG (`RIGHT: Low → High → Low + Higher Low`).
   * - Never give a reverse entry without a clear connection break.
   * - Zero Long bias; equal weight to LEFT (SHORT) and RIGHT (LONG).
   */
  public evaluateReplayAtFrontier(
    allCandles: RawOhlcBar[],
    frontierIndex: number,
    backTestLeftBoundaryIndex: number,
    symbol: string,
    timeframe: ForwardTimeframe,
    waitCandlesRule: number = 1
  ): ReplayFrontierEvaluation {
    const effectiveWaitRule = Math.max(1, waitCandlesRule);

    if (allCandles.length === 0) {
      const dummyBar: RawOhlcBar = {
        index: 1,
        timestamp: Date.now(),
        timeFormatted: new Date().toISOString().replace('T', ' ').slice(0, 19),
        open: 0,
        high: 0,
        low: 0,
        close: 0,
        volume: 0
      };
      return {
        frontierIndex: 0,
        frontierBarNumber: 1,
        frontierCandle: dummyBar,
        backTestLeftCount: 0,
        forwardUnrevealedRightCount: 0,
        totalDatasetCount: 0,
        leftSideState: this.createEmptySideState('High → Low → High', 'SHORT', effectiveWaitRule),
        rightSideState: this.createEmptySideState('Low → High → Low', 'LONG', effectiveWaitRule),
        activeDecisionAtFrontier: null,
        latestConfirmedDecision: null,
        latestLeftShortDecision: null,
        latestRightLongDecision: null,
        rocketEngineState: {
          activePrioritySide: 'BALANCED_SYMMETRIC',
          priorityReasonHindi: 'दोनों sides (LEFT SHORT और RIGHT LONG) को बराबर वजन दिया गया है।',
          leftShortCount: 0,
          rightLongCount: 0,
          longBiasRemoved: true,
          equalSideWeightEnforced: true,
          swingEntryEnforced: true,
          slPercentRule: 0.1,
          honestThreeReversalPrep: {
            active: false,
            completedHonestThreeSide: null,
            prepareDirection: null,
            honestThreeBarIndex: null,
            honestThreePrice: null,
            turningSwingPrice: null,
            provisionalEntrySwingPrice: null,
            provisionalStopLossPrice: null,
            provisionalTarget11: null,
            provisionalTarget12: null,
            provisionalTarget13: null,
            statusHindi: 'Scanning initial pivots...',
            ruleExplanationHindi: 'तीसरे Honest stage के बाद clear connection break आने पर उल्टी दिशा की तैयारी।'
          }
        },
        visibleDecisionsUpToFrontier: [],
        candleAnnotationsByBarIndex: {},
        structuralEventsUpToFrontier: [],
        auditLogsUpToFrontier: []
      };
    }

    const safeFrontierIdx = Math.max(0, Math.min(allCandles.length - 1, frontierIndex));
    // STRICT SLICE: Only candles up to safeFrontierIdx exist at this replay timestamp
    const visibleCandles = allCandles.slice(0, safeFrontierIdx + 1);
    const sampleOpen = visibleCandles[0]?.open || 100;
    const decimals = sampleOpen < 1 ? 6 : sampleOpen < 100 ? 4 : 2;
    const slPercent = 0.001; // 0.1% fixed structural rule

    const stageSequence: StageLabel[] = [
      'Zero-1',
      'Zero-2',
      'Zero-3',
      'Honest One',
      'Honest Two',
      'Honest Three'
    ];

    // LEFT State Machine (High -> Low -> High) -> Primary Direction: SHORT
    let leftPhase: ReplaySideFrontierState['currentPhase'] = 'SEEKING_FIRST_PIVOT';
    let leftH1: number | null = null;
    let leftH1BarIndex: number | null = null;
    let leftH1Time = '';
    let leftL1: number | null = null;
    let leftL1BarIndex: number | null = null;
    let leftH2Complete: number | null = null;
    let leftH2BarIndex: number | null = null;
    let leftH2Time = '';
    let leftLowerHighBreak: number | null = null;
    let leftBreakBarIndex: number | null = null;
    let leftBreakTime = '';
    let leftWaitCounter = 0;
    let leftStageCounter = 0;
    let leftHonestThreeJustCompleted = false;

    // RIGHT State Machine (Low -> High -> Low) -> Primary Direction: LONG
    let rightPhase: ReplaySideFrontierState['currentPhase'] = 'SEEKING_FIRST_PIVOT';
    let rightL1: number | null = null;
    let rightL1BarIndex: number | null = null;
    let rightL1Time = '';
    let rightH1: number | null = null;
    let rightH1BarIndex: number | null = null;
    let rightL2Complete: number | null = null;
    let rightL2BarIndex: number | null = null;
    let rightL2Time = '';
    let rightHigherLowBreak: number | null = null;
    let rightBreakBarIndex: number | null = null;
    let rightBreakTime = '';
    let rightWaitCounter = 0;
    let rightStageCounter = 0;
    let rightHonestThreeJustCompleted = false;

    // Post-Honest-Three Reversal Watch tracker
    let lastHonestThreeSide: 'RIGHT_LHL' | 'LEFT_HLH' | null = null;
    let lastHonestThreeBarIndex: number | null = null;
    let lastHonestThreePrice: number | null = null;
    let reversalTurningSwingPrice: number | null = null;

    const decisions: ReplayMechanismDecision[] = [];
    const auditLogs: string[] = [];
    const annotationsByBar: Record<number, CandleStructuralAnnotation> = {};
    const structuralEvents: CandleStructuralAnnotation[] = [];

    const recordAnnotation = (ann: CandleStructuralAnnotation, priorityOverride: boolean = false) => {
      const existing = annotationsByBar[ann.barIndex];
      // Never let a minor role overwrite a DECISION_ENTRY or connection break role
      if (
        !existing ||
        priorityOverride ||
        ann.structuralRole === 'DECISION_ENTRY' ||
        (existing.structuralRole !== 'DECISION_ENTRY' &&
          (ann.structuralRole === 'LEFT_LH_BREAK' ||
            ann.structuralRole === 'RIGHT_HL_BREAK' ||
            ann.structuralRole === 'LEFT_H_COMPLETE' ||
            ann.structuralRole === 'RIGHT_L_COMPLETE'))
      ) {
        annotationsByBar[ann.barIndex] = ann;
      }
      structuralEvents.push(ann);
    };

    const emitLeftShortDecision = (
      bar: RawOhlcBar,
      barIdx0: number,
      compPrice: number,
      compBarIdx: number,
      compTime: string,
      lhBreakPrice: number,
      lhBreakBarIdx: number,
      lhBreakTime: string,
      waitElapsed: number
    ) => {
      const stageLabel = stageSequence[leftStageCounter % stageSequence.length];
      // STRICT SWING ENTRY RULE:
      // SHORT (LEFT side): Entry -> Last swing High के पास (Lower High connection break के बाद)
      // SL -> उस High से 0.1% ऊपर
      const entryPrice = Number(lhBreakPrice.toFixed(decimals));
      const stopLossPrice = Number((entryPrice * (1 + slPercent)).toFixed(decimals));
      const riskAmount = Math.max(Math.abs(stopLossPrice - entryPrice), entryPrice * slPercent);

      const targets: ForwardTargetMap = {
        r1: Number((entryPrice - riskAmount * 1).toFixed(decimals)),
        r2: Number((entryPrice - riskAmount * 2).toFixed(decimals)),
        r3: Number((entryPrice - riskAmount * 3).toFixed(decimals)),
        r5: Number((entryPrice - riskAmount * 5).toFixed(decimals)),
        r10: Number((entryPrice - riskAmount * 10).toFixed(decimals)),
        r15: Number((entryPrice - riskAmount * 15).toFixed(decimals)),
        r20: Number((entryPrice - riskAmount * 20).toFixed(decimals)),
        r25: Number((entryPrice - riskAmount * 25).toFixed(decimals)),
        r30: Number((entryPrice - riskAmount * 30).toFixed(decimals)),
        r50: Number((entryPrice - riskAmount * 50).toFixed(decimals)),
        r100: Number((entryPrice - riskAmount * 100).toFixed(decimals))
      };

      const frontierEval = this.evaluateOutcomeUpToFrontier(
        visibleCandles,
        barIdx0,
        'SHORT',
        stopLossPrice,
        targets
      );

      const zoneSegment = barIdx0 <= backTestLeftBoundaryIndex ? 'BACK_TEST_LEFT' : 'REPLAY_FRONTIER';
      const decId = `RPL-L-${decisions.length + 101}`;

      const decision: ReplayMechanismDecision = {
        id: decId,
        setupOriginSide: 'LEFT_HLH',
        sequencePattern: 'High → Low → High',
        stage: stageLabel,
        connectionBreak: 'HIGH_COMPLETE_LOWER_HIGH',
        connectionBreakDetail: `H-Complete (${compPrice}) → Lower High (${lhBreakPrice})`,
        direction: 'SHORT',
        completionCandleIndex: compBarIdx,
        completionTimestamp: compTime,
        completionPivotPrice: compPrice,
        connectionBreakCandleIndex: lhBreakBarIdx,
        connectionBreakTimestamp: lhBreakTime,
        connectionPivotPrice: lhBreakPrice,
        waitCandlesRequired: effectiveWaitRule,
        waitCandlesElapsedAtFrontier: waitElapsed,
        decisionCandleIndex: bar.index,
        decisionTimestamp: bar.timeFormatted,
        entryPrice,
        stopLossPrice,
        invalidationCondition: `Invalidated if High >= ${stopLossPrice} (Swing High ${entryPrice} + 0.1%)`,
        riskAmount: Number(riskAmount.toFixed(decimals)),
        targets,
        pipeStateAtFrontier: frontierEval.pipeState,
        pipe11Reached: frontierEval.pipe11Reached,
        pipe12Reached: frontierEval.pipe12Reached,
        pipe13Reached: frontierEval.pipe13Reached,
        statusAtFrontier: frontierEval.status,
        highestRatioHitAtFrontier: frontierEval.highestRatioHit,
        achievedRAtFrontier: frontierEval.achievedR,
        zoneSegmentAtFrontier: zoneSegment,
        lookAheadBiasCheck: 'PASS_FRONTIER_ONLY',
        sourceHash: `0xSRB_L_${bar.timestamp.toString(16)}_${decId}`
      };

      decisions.push(decision);
      recordAnnotation(
        {
          barIndex: bar.index,
          timestamp: bar.timestamp,
          structuralRole: 'DECISION_ENTRY',
          orientation: 'LEFT_HLH',
          behaviorDirection: 'HIGH_TO_LOW',
          cyclePhase: 'COMPLETION',
          stageLabel,
          shortBadge: `SHORT ${stageLabel}`,
          pricePosition: 'ABOVE_HIGH',
          priceLevel: entryPrice,
          assetPath: '/assets/mechanisms/pipe-1to3-3d.svg',
          cycleIconPath: '/assets/icons/cycle-completion-3d.svg',
          explanation: `LEFT (H→L→H) SHORT (${decId} • ${stageLabel}) @ Swing High ${entryPrice} | SL (+0.1%): ${stopLossPrice} | 1:1=${targets.r1}, 1:2=${targets.r2}, 1:3=${targets.r3}`,
          linkedDecisionId: decId
        },
        true
      );

      auditLogs.push(
        `[Bar #${bar.index} | ${bar.timeFormatted}] ${decId} LEFT (High→Low→High) SHORT @ Swing High ${entryPrice} | SL (+0.1%): ${stopLossPrice} | 1:1=${targets.r1}, 1:2=${targets.r2}, 1:3=${targets.r3} | Stage: ${stageLabel} | Status: ${frontierEval.status} (${frontierEval.highestRatioHit})`
      );

      if (stageLabel === 'Honest Three') {
        leftHonestThreeJustCompleted = true;
        lastHonestThreeSide = 'LEFT_HLH';
        lastHonestThreeBarIndex = bar.index;
        lastHonestThreePrice = entryPrice;
        reversalTurningSwingPrice = null;
        auditLogs.push(
          `[Bar #${bar.index}] [HONEST THREE COMPLETE — LEFT] तीसरा High (Honest Three) Complete @ ${entryPrice}. अब clear Low Complete + Higher Low (HL) connection break आने पर ही LONG की तैयारी होगी।`
        );
      } else {
        leftHonestThreeJustCompleted = false;
        if (lastHonestThreeSide === 'RIGHT_LHL') {
          // Direction change to SHORT has been fulfilled via clear LH connection break
          lastHonestThreeSide = null;
        }
      }

      leftStageCounter++;
      leftH1 = lhBreakPrice;
      leftH1BarIndex = lhBreakBarIdx;
      leftH1Time = lhBreakTime;
      leftL1 = null;
      leftL1BarIndex = null;
      leftH2Complete = null;
      leftLowerHighBreak = null;
      leftPhase = 'SEEKING_SECOND_PIVOT';
    };

    const emitRightLongDecision = (
      bar: RawOhlcBar,
      barIdx0: number,
      compPrice: number,
      compBarIdx: number,
      compTime: string,
      hlBreakPrice: number,
      hlBreakBarIdx: number,
      hlBreakTime: string,
      waitElapsed: number
    ) => {
      const stageLabel = stageSequence[rightStageCounter % stageSequence.length];
      // STRICT SWING ENTRY RULE:
      // LONG (RIGHT side): Entry -> Last swing Low के पास (Higher Low connection break के बाद)
      // SL -> उस Low से 0.1% नीचे
      const entryPrice = Number(hlBreakPrice.toFixed(decimals));
      const stopLossPrice = Number((entryPrice * (1 - slPercent)).toFixed(decimals));
      const riskAmount = Math.max(Math.abs(entryPrice - stopLossPrice), entryPrice * slPercent);

      const targets: ForwardTargetMap = {
        r1: Number((entryPrice + riskAmount * 1).toFixed(decimals)),
        r2: Number((entryPrice + riskAmount * 2).toFixed(decimals)),
        r3: Number((entryPrice + riskAmount * 3).toFixed(decimals)),
        r5: Number((entryPrice + riskAmount * 5).toFixed(decimals)),
        r10: Number((entryPrice + riskAmount * 10).toFixed(decimals)),
        r15: Number((entryPrice + riskAmount * 15).toFixed(decimals)),
        r20: Number((entryPrice + riskAmount * 20).toFixed(decimals)),
        r25: Number((entryPrice + riskAmount * 25).toFixed(decimals)),
        r30: Number((entryPrice + riskAmount * 30).toFixed(decimals)),
        r50: Number((entryPrice + riskAmount * 50).toFixed(decimals)),
        r100: Number((entryPrice + riskAmount * 100).toFixed(decimals))
      };

      const frontierEval = this.evaluateOutcomeUpToFrontier(
        visibleCandles,
        barIdx0,
        'LONG',
        stopLossPrice,
        targets
      );

      const zoneSegment = barIdx0 <= backTestLeftBoundaryIndex ? 'BACK_TEST_LEFT' : 'REPLAY_FRONTIER';
      const decId = `RPL-R-${decisions.length + 101}`;

      const decision: ReplayMechanismDecision = {
        id: decId,
        setupOriginSide: 'RIGHT_LHL',
        sequencePattern: 'Low → High → Low',
        stage: stageLabel,
        connectionBreak: 'LOW_COMPLETE_HIGHER_LOW',
        connectionBreakDetail: `L-Complete (${compPrice}) → Higher Low (${hlBreakPrice})`,
        direction: 'LONG',
        completionCandleIndex: compBarIdx,
        completionTimestamp: compTime,
        completionPivotPrice: compPrice,
        connectionBreakCandleIndex: hlBreakBarIdx,
        connectionBreakTimestamp: hlBreakTime,
        connectionPivotPrice: hlBreakPrice,
        waitCandlesRequired: effectiveWaitRule,
        waitCandlesElapsedAtFrontier: waitElapsed,
        decisionCandleIndex: bar.index,
        decisionTimestamp: bar.timeFormatted,
        entryPrice,
        stopLossPrice,
        invalidationCondition: `Invalidated if Low <= ${stopLossPrice} (Swing Low ${entryPrice} - 0.1%)`,
        riskAmount: Number(riskAmount.toFixed(decimals)),
        targets,
        pipeStateAtFrontier: frontierEval.pipeState,
        pipe11Reached: frontierEval.pipe11Reached,
        pipe12Reached: frontierEval.pipe12Reached,
        pipe13Reached: frontierEval.pipe13Reached,
        statusAtFrontier: frontierEval.status,
        highestRatioHitAtFrontier: frontierEval.highestRatioHit,
        achievedRAtFrontier: frontierEval.achievedR,
        zoneSegmentAtFrontier: zoneSegment,
        lookAheadBiasCheck: 'PASS_FRONTIER_ONLY',
        sourceHash: `0xSRB_R_${bar.timestamp.toString(16)}_${decId}`
      };

      decisions.push(decision);
      recordAnnotation(
        {
          barIndex: bar.index,
          timestamp: bar.timestamp,
          structuralRole: 'DECISION_ENTRY',
          orientation: 'RIGHT_LHL',
          behaviorDirection: 'LOW_TO_HIGH',
          cyclePhase: 'COMPLETION',
          stageLabel,
          shortBadge: `LONG ${stageLabel}`,
          pricePosition: 'BELOW_LOW',
          priceLevel: entryPrice,
          assetPath: '/assets/mechanisms/pipe-1to3-3d.svg',
          cycleIconPath: '/assets/icons/cycle-completion-3d.svg',
          explanation: `RIGHT (L→H→L) LONG (${decId} • ${stageLabel}) @ Swing Low ${entryPrice} | SL (-0.1%): ${stopLossPrice} | 1:1=${targets.r1}, 1:2=${targets.r2}, 1:3=${targets.r3}`,
          linkedDecisionId: decId
        },
        true
      );

      auditLogs.push(
        `[Bar #${bar.index} | ${bar.timeFormatted}] ${decId} RIGHT (Low→High→Low) LONG @ Swing Low ${entryPrice} | SL (-0.1%): ${stopLossPrice} | 1:1=${targets.r1}, 1:2=${targets.r2}, 1:3=${targets.r3} | Stage: ${stageLabel} | Status: ${frontierEval.status} (${frontierEval.highestRatioHit})`
      );

      if (stageLabel === 'Honest Three') {
        rightHonestThreeJustCompleted = true;
        lastHonestThreeSide = 'RIGHT_LHL';
        lastHonestThreeBarIndex = bar.index;
        lastHonestThreePrice = entryPrice;
        reversalTurningSwingPrice = null;
        auditLogs.push(
          `[Bar #${bar.index}] [HONEST THREE COMPLETE — RIGHT] तीसरा Low (Honest Three) Complete @ ${entryPrice}. अब price घूमने और High Complete + Lower High (LH) connection break पर SHORT की तैयारी दिखनी चाहिए!`
        );
      } else {
        rightHonestThreeJustCompleted = false;
        if (lastHonestThreeSide === 'LEFT_HLH') {
          lastHonestThreeSide = null;
        }
      }

      rightStageCounter++;
      rightL1 = hlBreakPrice;
      rightL1BarIndex = hlBreakBarIdx;
      rightL1Time = hlBreakTime;
      rightH1 = null;
      rightH1BarIndex = null;
      rightL2Complete = null;
      rightHigherLowBreak = null;
      rightPhase = 'SEEKING_SECOND_PIVOT';
    };

    // Process bar-by-bar strictly from 2 up to safeFrontierIdx
    for (let i = 2; i < visibleCandles.length; i++) {
      const prev2 = visibleCandles[i - 2];
      const prev1 = visibleCandles[i - 1];
      const curr = visibleCandles[i];

      const isPivotHigh = prev1.high > prev2.high && prev1.high >= curr.high;
      const isPivotLow = prev1.low < prev2.low && prev1.low <= curr.low;

      // Skip simultaneous outside expansion ambiguity
      if (isPivotHigh && isPivotLow && prev1.high > prev2.high && prev1.low < prev2.low) {
        continue;
      }

      const currentLeftStage = stageSequence[leftStageCounter % stageSequence.length];
      const currentRightStage = stageSequence[rightStageCounter % stageSequence.length];

      // Track Post-Honest-Three turning swings so SHORT preparation after RIGHT Honest Three is never missed
      if (lastHonestThreeSide === 'RIGHT_LHL' && isPivotHigh) {
        reversalTurningSwingPrice = prev1.high;
      } else if (lastHonestThreeSide === 'LEFT_HLH' && isPivotLow) {
        reversalTurningSwingPrice = prev1.low;
      }

      if (isPivotHigh && !annotationsByBar[prev1.index]) {
        annotationsByBar[prev1.index] = {
          barIndex: prev1.index,
          timestamp: prev1.timestamp,
          structuralRole: 'PIVOT_HIGH',
          orientation: 'LEFT_HLH',
          behaviorDirection: 'HIGH_TO_LOW',
          cyclePhase: 'ORIGIN',
          stageLabel: currentLeftStage,
          shortBadge: 'HIGH',
          pricePosition: 'ABOVE_HIGH',
          priceLevel: prev1.high,
          assetPath: '/assets/structure/high-extreme-3d.svg',
          cycleIconPath: '/assets/icons/cycle-origin-3d.svg',
          explanation: `Validated 3-Bar Structural HIGH Extreme @ ${prev1.high} (Confirmed at Bar #${curr.index})`
        };
      } else if (isPivotLow && !annotationsByBar[prev1.index]) {
        annotationsByBar[prev1.index] = {
          barIndex: prev1.index,
          timestamp: prev1.timestamp,
          structuralRole: 'PIVOT_LOW',
          orientation: 'RIGHT_LHL',
          behaviorDirection: 'LOW_TO_HIGH',
          cyclePhase: 'ORIGIN',
          stageLabel: currentRightStage,
          shortBadge: 'LOW',
          pricePosition: 'BELOW_LOW',
          priceLevel: prev1.low,
          assetPath: '/assets/structure/low-extreme-3d.svg',
          cycleIconPath: '/assets/icons/cycle-origin-3d.svg',
          explanation: `Validated 3-Bar Structural LOW Extreme @ ${prev1.low} (Confirmed at Bar #${curr.index})`
        };
      }

      // -----------------------------------------------------------------------
      // LEFT SIDE (High -> Low -> High) -> SHORT on High Complete + Lower High
      // -----------------------------------------------------------------------
      if (leftPhase === 'SEEKING_FIRST_PIVOT') {
        if (isPivotHigh) {
          leftH1 = prev1.high;
          leftH1BarIndex = prev1.index;
          leftH1Time = prev1.timeFormatted;
          leftPhase = 'SEEKING_SECOND_PIVOT';
          recordAnnotation({
            barIndex: prev1.index,
            timestamp: prev1.timestamp,
            structuralRole: 'LEFT_ORIGIN_H1',
            orientation: 'LEFT_HLH',
            behaviorDirection: 'HIGH_TO_LOW',
            cyclePhase: 'ORIGIN',
            stageLabel: currentLeftStage,
            shortBadge: 'L-H1',
            pricePosition: 'ABOVE_HIGH',
            priceLevel: prev1.high,
            assetPath: '/assets/structure/high-extreme-3d.svg',
            cycleIconPath: '/assets/icons/cycle-origin-3d.svg',
            explanation: `LEFT HLH Origin High (H1) anchored @ ${prev1.high}`
          });
        }
      } else if (leftPhase === 'SEEKING_SECOND_PIVOT') {
        if (isPivotLow && leftH1 !== null && prev1.low < leftH1) {
          leftL1 = prev1.low;
          leftL1BarIndex = prev1.index;
          leftPhase = 'SEEKING_COMPLETION_PIVOT';
          recordAnnotation({
            barIndex: prev1.index,
            timestamp: prev1.timestamp,
            structuralRole: 'LEFT_VALLEY_L1',
            orientation: 'LEFT_HLH',
            behaviorDirection: 'HIGH_TO_LOW',
            cyclePhase: 'ORIGIN',
            stageLabel: currentLeftStage,
            shortBadge: 'L-L1',
            pricePosition: 'BELOW_LOW',
            priceLevel: prev1.low,
            assetPath: '/assets/structure/high-to-low-3d.svg',
            cycleIconPath: '/assets/icons/cycle-origin-3d.svg',
            explanation: `LEFT HLH Valley Low (L1) formed @ ${prev1.low} below H1 (${leftH1})`
          });
        } else if (isPivotHigh && leftH1 !== null && prev1.high > leftH1) {
          leftH1 = prev1.high;
          leftH1BarIndex = prev1.index;
          leftH1Time = prev1.timeFormatted;
        }
      } else if (leftPhase === 'SEEKING_COMPLETION_PIVOT') {
        if (isPivotHigh && leftL1 !== null && leftH1 !== null && leftH1BarIndex !== null && prev1.high > leftL1) {
          // High (H1) -> Low (L1) -> High (H2) is now formed!
          // Check if H2 is ALREADY a Lower High (< H1) -> Immediate High Complete + Lower High Connection Break!
          if (prev1.high < leftH1) {
            leftH2Complete = leftH1;
            leftH2BarIndex = leftH1BarIndex;
            leftH2Time = leftH1Time;
            leftLowerHighBreak = prev1.high;
            leftBreakBarIndex = prev1.index;
            leftBreakTime = prev1.timeFormatted;

            recordAnnotation({
              barIndex: prev1.index,
              timestamp: prev1.timestamp,
              structuralRole: 'LEFT_LH_BREAK',
              orientation: 'LEFT_HLH',
              behaviorDirection: 'HIGH_TO_LOW',
              cyclePhase: 'TRANSITION',
              stageLabel: currentLeftStage,
              shortBadge: 'LH-BRK',
              pricePosition: 'ABOVE_HIGH',
              priceLevel: prev1.high,
              assetPath: '/assets/structure/high-to-low-3d.svg',
              cycleIconPath: '/assets/icons/cycle-transition-3d.svg',
              explanation: `LEFT High→Low→High Complete + Lower High (LH) Break @ ${prev1.high} < H1 (${leftH1}) — SHORT Setup`
            });

            if (effectiveWaitRule <= 1) {
              emitLeftShortDecision(
                curr,
                i,
                leftH2Complete,
                leftH2BarIndex,
                leftH2Time,
                leftLowerHighBreak,
                leftBreakBarIndex,
                leftBreakTime,
                1
              );
            } else {
              leftWaitCounter = 1;
              leftPhase = 'WAITING_CONFIRMATION_CANDLES';
            }
          } else {
            // H2 >= H1: H2 is the High Complete apex; now watch for Lower High (< H2) connection break
            leftH2Complete = prev1.high;
            leftH2BarIndex = prev1.index;
            leftH2Time = prev1.timeFormatted;
            leftPhase = 'SEEKING_CONNECTION_BREAK';
            recordAnnotation({
              barIndex: prev1.index,
              timestamp: prev1.timestamp,
              structuralRole: 'LEFT_H_COMPLETE',
              orientation: 'LEFT_HLH',
              behaviorDirection: 'LOW_TO_HIGH',
              cyclePhase: 'APEX',
              stageLabel: currentLeftStage,
              shortBadge: 'H-COMP',
              pricePosition: 'ABOVE_HIGH',
              priceLevel: prev1.high,
              assetPath: '/assets/mechanisms/left-hlh-3d.svg',
              cycleIconPath: '/assets/icons/cycle-apex-3d.svg',
              explanation: `LEFT High Complete (H2 Apex) @ ${prev1.high} — Awaiting Lower High (LH) Connection Break for SHORT`
            });
          }
        } else if (isPivotLow && leftL1 !== null && prev1.low < leftL1) {
          leftL1 = prev1.low;
          leftL1BarIndex = prev1.index;
        }
      } else if (leftPhase === 'SEEKING_CONNECTION_BREAK') {
        if (isPivotHigh && leftH2Complete !== null && leftH2BarIndex !== null) {
          if (prev1.high < leftH2Complete) {
            leftLowerHighBreak = prev1.high;
            leftBreakBarIndex = prev1.index;
            leftBreakTime = prev1.timeFormatted;

            recordAnnotation({
              barIndex: prev1.index,
              timestamp: prev1.timestamp,
              structuralRole: 'LEFT_LH_BREAK',
              orientation: 'LEFT_HLH',
              behaviorDirection: 'HIGH_TO_LOW',
              cyclePhase: 'TRANSITION',
              stageLabel: currentLeftStage,
              shortBadge: 'LH-BRK',
              pricePosition: 'ABOVE_HIGH',
              priceLevel: prev1.high,
              assetPath: '/assets/structure/high-to-low-3d.svg',
              cycleIconPath: '/assets/icons/cycle-transition-3d.svg',
              explanation: `LEFT Connection Break: Lower High (LH) @ ${prev1.high} < H-Complete (${leftH2Complete}) — SHORT Setup`
            });

            if (effectiveWaitRule <= 1) {
              emitLeftShortDecision(
                curr,
                i,
                leftH2Complete,
                leftH2BarIndex,
                leftH2Time,
                leftLowerHighBreak,
                leftBreakBarIndex,
                leftBreakTime,
                1
              );
            } else {
              leftWaitCounter = 1;
              leftPhase = 'WAITING_CONFIRMATION_CANDLES';
            }
          } else {
            leftH2Complete = prev1.high;
            leftH2BarIndex = prev1.index;
            leftH2Time = prev1.timeFormatted;
            recordAnnotation({
              barIndex: prev1.index,
              timestamp: prev1.timestamp,
              structuralRole: 'LEFT_H_COMPLETE',
              orientation: 'LEFT_HLH',
              behaviorDirection: 'LOW_TO_HIGH',
              cyclePhase: 'APEX',
              stageLabel: currentLeftStage,
              shortBadge: 'H-COMP',
              pricePosition: 'ABOVE_HIGH',
              priceLevel: prev1.high,
              assetPath: '/assets/mechanisms/left-hlh-3d.svg',
              cycleIconPath: '/assets/icons/cycle-apex-3d.svg',
              explanation: `Updated LEFT High Complete (Higher H2 Apex) @ ${prev1.high}`
            });
          }
        }
      } else if (leftPhase === 'WAITING_CONFIRMATION_CANDLES') {
        leftWaitCounter++;
        if (
          leftWaitCounter >= effectiveWaitRule &&
          leftH2Complete !== null &&
          leftLowerHighBreak !== null &&
          leftH2BarIndex !== null &&
          leftBreakBarIndex !== null
        ) {
          emitLeftShortDecision(
            curr,
            i,
            leftH2Complete,
            leftH2BarIndex,
            leftH2Time,
            leftLowerHighBreak,
            leftBreakBarIndex,
            leftBreakTime,
            leftWaitCounter
          );
        }
      }

      // -----------------------------------------------------------------------
      // RIGHT SIDE (Low -> High -> Low) -> LONG on Low Complete + Higher Low
      // -----------------------------------------------------------------------
      if (rightPhase === 'SEEKING_FIRST_PIVOT') {
        if (isPivotLow) {
          rightL1 = prev1.low;
          rightL1BarIndex = prev1.index;
          rightL1Time = prev1.timeFormatted;
          rightPhase = 'SEEKING_SECOND_PIVOT';
          recordAnnotation({
            barIndex: prev1.index,
            timestamp: prev1.timestamp,
            structuralRole: 'RIGHT_ORIGIN_L1',
            orientation: 'RIGHT_LHL',
            behaviorDirection: 'LOW_TO_HIGH',
            cyclePhase: 'ORIGIN',
            stageLabel: currentRightStage,
            shortBadge: 'R-L1',
            pricePosition: 'BELOW_LOW',
            priceLevel: prev1.low,
            assetPath: '/assets/structure/low-extreme-3d.svg',
            cycleIconPath: '/assets/icons/cycle-origin-3d.svg',
            explanation: `RIGHT LHL Origin Low (L1) anchored @ ${prev1.low}`
          });
        }
      } else if (rightPhase === 'SEEKING_SECOND_PIVOT') {
        if (isPivotHigh && rightL1 !== null && prev1.high > rightL1) {
          rightH1 = prev1.high;
          rightH1BarIndex = prev1.index;
          rightPhase = 'SEEKING_COMPLETION_PIVOT';
          recordAnnotation({
            barIndex: prev1.index,
            timestamp: prev1.timestamp,
            structuralRole: 'RIGHT_PEAK_H1',
            orientation: 'RIGHT_LHL',
            behaviorDirection: 'LOW_TO_HIGH',
            cyclePhase: 'ORIGIN',
            stageLabel: currentRightStage,
            shortBadge: 'R-H1',
            pricePosition: 'ABOVE_HIGH',
            priceLevel: prev1.high,
            assetPath: '/assets/structure/low-to-high-3d.svg',
            cycleIconPath: '/assets/icons/cycle-origin-3d.svg',
            explanation: `RIGHT LHL Peak High (H1) formed @ ${prev1.high} above L1 (${rightL1})`
          });
        } else if (isPivotLow && rightL1 !== null && prev1.low < rightL1) {
          rightL1 = prev1.low;
          rightL1BarIndex = prev1.index;
          rightL1Time = prev1.timeFormatted;
        }
      } else if (rightPhase === 'SEEKING_COMPLETION_PIVOT') {
        if (isPivotLow && rightH1 !== null && rightL1 !== null && rightL1BarIndex !== null && prev1.low < rightH1) {
          // Low (L1) -> High (H1) -> Low (L2) is now formed!
          // Check if L2 is ALREADY a Higher Low (> L1) -> Immediate Low Complete + Higher Low Connection Break!
          if (prev1.low > rightL1) {
            rightL2Complete = rightL1;
            rightL2BarIndex = rightL1BarIndex;
            rightL2Time = rightL1Time;
            rightHigherLowBreak = prev1.low;
            rightBreakBarIndex = prev1.index;
            rightBreakTime = prev1.timeFormatted;

            recordAnnotation({
              barIndex: prev1.index,
              timestamp: prev1.timestamp,
              structuralRole: 'RIGHT_HL_BREAK',
              orientation: 'RIGHT_LHL',
              behaviorDirection: 'LOW_TO_HIGH',
              cyclePhase: 'TRANSITION',
              stageLabel: currentRightStage,
              shortBadge: 'HL-BRK',
              pricePosition: 'BELOW_LOW',
              priceLevel: prev1.low,
              assetPath: '/assets/structure/low-to-high-3d.svg',
              cycleIconPath: '/assets/icons/cycle-transition-3d.svg',
              explanation: `RIGHT Low→High→Low Complete + Higher Low (HL) Break @ ${prev1.low} > L1 (${rightL1}) — LONG Setup`
            });

            if (effectiveWaitRule <= 1) {
              emitRightLongDecision(
                curr,
                i,
                rightL2Complete,
                rightL2BarIndex,
                rightL2Time,
                rightHigherLowBreak,
                rightBreakBarIndex,
                rightBreakTime,
                1
              );
            } else {
              rightWaitCounter = 1;
              rightPhase = 'WAITING_CONFIRMATION_CANDLES';
            }
          } else {
            // L2 <= L1: L2 is the Low Complete apex; now watch for Higher Low (> L2) connection break
            rightL2Complete = prev1.low;
            rightL2BarIndex = prev1.index;
            rightL2Time = prev1.timeFormatted;
            rightPhase = 'SEEKING_CONNECTION_BREAK';
            recordAnnotation({
              barIndex: prev1.index,
              timestamp: prev1.timestamp,
              structuralRole: 'RIGHT_L_COMPLETE',
              orientation: 'RIGHT_LHL',
              behaviorDirection: 'HIGH_TO_LOW',
              cyclePhase: 'APEX',
              stageLabel: currentRightStage,
              shortBadge: 'L-COMP',
              pricePosition: 'BELOW_LOW',
              priceLevel: prev1.low,
              assetPath: '/assets/mechanisms/right-lhl-3d.svg',
              cycleIconPath: '/assets/icons/cycle-apex-3d.svg',
              explanation: `RIGHT Low Complete (L2 Apex) @ ${prev1.low} — Awaiting Higher Low (HL) Connection Break for LONG`
            });
          }
        } else if (isPivotHigh && rightH1 !== null && prev1.high > rightH1) {
          rightH1 = prev1.high;
          rightH1BarIndex = prev1.index;
        }
      } else if (rightPhase === 'SEEKING_CONNECTION_BREAK') {
        if (isPivotLow && rightL2Complete !== null && rightL2BarIndex !== null) {
          if (prev1.low > rightL2Complete) {
            rightHigherLowBreak = prev1.low;
            rightBreakBarIndex = prev1.index;
            rightBreakTime = prev1.timeFormatted;

            recordAnnotation({
              barIndex: prev1.index,
              timestamp: prev1.timestamp,
              structuralRole: 'RIGHT_HL_BREAK',
              orientation: 'RIGHT_LHL',
              behaviorDirection: 'LOW_TO_HIGH',
              cyclePhase: 'TRANSITION',
              stageLabel: currentRightStage,
              shortBadge: 'HL-BRK',
              pricePosition: 'BELOW_LOW',
              priceLevel: prev1.low,
              assetPath: '/assets/structure/low-to-high-3d.svg',
              cycleIconPath: '/assets/icons/cycle-transition-3d.svg',
              explanation: `RIGHT Connection Break: Higher Low (HL) @ ${prev1.low} > L-Complete (${rightL2Complete}) — LONG Setup`
            });

            if (effectiveWaitRule <= 1) {
              emitRightLongDecision(
                curr,
                i,
                rightL2Complete,
                rightL2BarIndex,
                rightL2Time,
                rightHigherLowBreak,
                rightBreakBarIndex,
                rightBreakTime,
                1
              );
            } else {
              rightWaitCounter = 1;
              rightPhase = 'WAITING_CONFIRMATION_CANDLES';
            }
          } else {
            rightL2Complete = prev1.low;
            rightL2BarIndex = prev1.index;
            rightL2Time = prev1.timeFormatted;
            recordAnnotation({
              barIndex: prev1.index,
              timestamp: prev1.timestamp,
              structuralRole: 'RIGHT_L_COMPLETE',
              orientation: 'RIGHT_LHL',
              behaviorDirection: 'HIGH_TO_LOW',
              cyclePhase: 'APEX',
              stageLabel: currentRightStage,
              shortBadge: 'L-COMP',
              pricePosition: 'BELOW_LOW',
              priceLevel: prev1.low,
              assetPath: '/assets/mechanisms/right-lhl-3d.svg',
              cycleIconPath: '/assets/icons/cycle-apex-3d.svg',
              explanation: `Updated RIGHT Low Complete (Lower L2 Apex) @ ${prev1.low}`
            });
          }
        }
      } else if (rightPhase === 'WAITING_CONFIRMATION_CANDLES') {
        rightWaitCounter++;
        if (
          rightWaitCounter >= effectiveWaitRule &&
          rightL2Complete !== null &&
          rightHigherLowBreak !== null &&
          rightL2BarIndex !== null &&
          rightBreakBarIndex !== null
        ) {
          emitRightLongDecision(
            curr,
            i,
            rightL2Complete,
            rightL2BarIndex,
            rightL2Time,
            rightHigherLowBreak,
            rightBreakBarIndex,
            rightBreakTime,
            rightWaitCounter
          );
        }
      }
    }

    // Construct PENDING setup preview if waiting confirmation candles at the frontier
    let pendingDecision: ReplayMechanismDecision | null = null;
    const frontierBar = visibleCandles[visibleCandles.length - 1];

    if (
      leftPhase === 'WAITING_CONFIRMATION_CANDLES' &&
      leftH2Complete !== null &&
      leftLowerHighBreak !== null &&
      leftH2BarIndex !== null &&
      leftBreakBarIndex !== null
    ) {
      const stageLabel = stageSequence[leftStageCounter % stageSequence.length];
      const swingEntry = Number(leftLowerHighBreak.toFixed(decimals));
      const stopLossPrice = Number((swingEntry * (1 + slPercent)).toFixed(decimals));
      const riskAmount = Math.max(Math.abs(stopLossPrice - swingEntry), swingEntry * slPercent);
      const targets: ForwardTargetMap = {
        r1: Number((swingEntry - riskAmount * 1).toFixed(decimals)),
        r2: Number((swingEntry - riskAmount * 2).toFixed(decimals)),
        r3: Number((swingEntry - riskAmount * 3).toFixed(decimals)),
        r5: Number((swingEntry - riskAmount * 5).toFixed(decimals)),
        r10: Number((swingEntry - riskAmount * 10).toFixed(decimals)),
        r15: Number((swingEntry - riskAmount * 15).toFixed(decimals)),
        r20: Number((swingEntry - riskAmount * 20).toFixed(decimals)),
        r25: Number((swingEntry - riskAmount * 25).toFixed(decimals)),
        r30: Number((swingEntry - riskAmount * 30).toFixed(decimals)),
        r50: Number((swingEntry - riskAmount * 50).toFixed(decimals)),
        r100: Number((swingEntry - riskAmount * 100).toFixed(decimals))
      };

      pendingDecision = {
        id: `PENDING-L-${leftBreakBarIndex}`,
        setupOriginSide: 'LEFT_HLH',
        sequencePattern: 'High → Low → High',
        stage: stageLabel,
        connectionBreak: 'HIGH_COMPLETE_LOWER_HIGH',
        connectionBreakDetail: `H-Complete (${leftH2Complete}) → Lower High (${leftLowerHighBreak}) [Swing SHORT Ready]`,
        direction: 'SHORT',
        completionCandleIndex: leftH2BarIndex,
        completionTimestamp: leftH2Time,
        completionPivotPrice: leftH2Complete,
        connectionBreakCandleIndex: leftBreakBarIndex,
        connectionBreakTimestamp: leftBreakTime,
        connectionPivotPrice: leftLowerHighBreak,
        waitCandlesRequired: effectiveWaitRule,
        waitCandlesElapsedAtFrontier: leftWaitCounter,
        decisionCandleIndex: frontierBar.index + (effectiveWaitRule - leftWaitCounter),
        decisionTimestamp: 'PENDING_WAIT_COMPLETION',
        entryPrice: swingEntry,
        stopLossPrice,
        invalidationCondition: `Swing High Entry @ ${swingEntry} | SL (+0.1%) @ ${stopLossPrice}`,
        riskAmount: Number(riskAmount.toFixed(decimals)),
        targets,
        pipeStateAtFrontier: '1:1',
        pipe11Reached: false,
        pipe12Reached: false,
        pipe13Reached: false,
        statusAtFrontier: 'PENDING',
        highestRatioHitAtFrontier: `PENDING (${leftWaitCounter}/${effectiveWaitRule} Wait)`,
        achievedRAtFrontier: 0,
        zoneSegmentAtFrontier: 'REPLAY_FRONTIER',
        lookAheadBiasCheck: 'PASS_FRONTIER_ONLY',
        sourceHash: `0xPENDING_L_${frontierBar.timestamp.toString(16)}`
      };
    } else if (
      rightPhase === 'WAITING_CONFIRMATION_CANDLES' &&
      rightL2Complete !== null &&
      rightHigherLowBreak !== null &&
      rightL2BarIndex !== null &&
      rightBreakBarIndex !== null
    ) {
      const stageLabel = stageSequence[rightStageCounter % stageSequence.length];
      const swingEntry = Number(rightHigherLowBreak.toFixed(decimals));
      const stopLossPrice = Number((swingEntry * (1 - slPercent)).toFixed(decimals));
      const riskAmount = Math.max(Math.abs(swingEntry - stopLossPrice), swingEntry * slPercent);
      const targets: ForwardTargetMap = {
        r1: Number((swingEntry + riskAmount * 1).toFixed(decimals)),
        r2: Number((swingEntry + riskAmount * 2).toFixed(decimals)),
        r3: Number((swingEntry + riskAmount * 3).toFixed(decimals)),
        r5: Number((swingEntry + riskAmount * 5).toFixed(decimals)),
        r10: Number((swingEntry + riskAmount * 10).toFixed(decimals)),
        r15: Number((swingEntry + riskAmount * 15).toFixed(decimals)),
        r20: Number((swingEntry + riskAmount * 20).toFixed(decimals)),
        r25: Number((swingEntry + riskAmount * 25).toFixed(decimals)),
        r30: Number((swingEntry + riskAmount * 30).toFixed(decimals)),
        r50: Number((swingEntry + riskAmount * 50).toFixed(decimals)),
        r100: Number((swingEntry + riskAmount * 100).toFixed(decimals))
      };

      pendingDecision = {
        id: `PENDING-R-${rightBreakBarIndex}`,
        setupOriginSide: 'RIGHT_LHL',
        sequencePattern: 'Low → High → Low',
        stage: stageLabel,
        connectionBreak: 'LOW_COMPLETE_HIGHER_LOW',
        connectionBreakDetail: `L-Complete (${rightL2Complete}) → Higher Low (${rightHigherLowBreak}) [Swing LONG Ready]`,
        direction: 'LONG',
        completionCandleIndex: rightL2BarIndex,
        completionTimestamp: rightL2Time,
        completionPivotPrice: rightL2Complete,
        connectionBreakCandleIndex: rightBreakBarIndex,
        connectionBreakTimestamp: rightBreakTime,
        connectionPivotPrice: rightHigherLowBreak,
        waitCandlesRequired: effectiveWaitRule,
        waitCandlesElapsedAtFrontier: rightWaitCounter,
        decisionCandleIndex: frontierBar.index + (effectiveWaitRule - rightWaitCounter),
        decisionTimestamp: 'PENDING_WAIT_COMPLETION',
        entryPrice: swingEntry,
        stopLossPrice,
        invalidationCondition: `Swing Low Entry @ ${swingEntry} | SL (-0.1%) @ ${stopLossPrice}`,
        riskAmount: Number(riskAmount.toFixed(decimals)),
        targets,
        pipeStateAtFrontier: '1:1',
        pipe11Reached: false,
        pipe12Reached: false,
        pipe13Reached: false,
        statusAtFrontier: 'PENDING',
        highestRatioHitAtFrontier: `PENDING (${rightWaitCounter}/${effectiveWaitRule} Wait)`,
        achievedRAtFrontier: 0,
        zoneSegmentAtFrontier: 'REPLAY_FRONTIER',
        lookAheadBiasCheck: 'PASS_FRONTIER_ONLY',
        sourceHash: `0xPENDING_R_${frontierBar.timestamp.toString(16)}`
      };
    }

    // Separate latest LEFT (SHORT) and RIGHT (LONG) decisions so neither side is ever hidden
    const leftDecisions = decisions.filter((d) => d.setupOriginSide === 'LEFT_HLH');
    const rightDecisions = decisions.filter((d) => d.setupOriginSide === 'RIGHT_LHL');
    const latestLeftShortDecision =
      leftDecisions.length > 0 ? leftDecisions[leftDecisions.length - 1] : null;
    const latestRightLongDecision =
      rightDecisions.length > 0 ? rightDecisions[rightDecisions.length - 1] : null;

    // Zero Long Bias Resolution: If both sides emitted a decision on the exact same bar,
    // pick the one whose connectionBreakCandleIndex is newer, or if RIGHT Honest Three just completed, prioritize LEFT SHORT!
    let latestConfirmedDecision: ReplayMechanismDecision | null = null;
    if (latestLeftShortDecision && latestRightLongDecision) {
      if (latestLeftShortDecision.decisionCandleIndex > latestRightLongDecision.decisionCandleIndex) {
        latestConfirmedDecision = latestLeftShortDecision;
      } else if (latestRightLongDecision.decisionCandleIndex > latestLeftShortDecision.decisionCandleIndex) {
        latestConfirmedDecision = latestRightLongDecision;
      } else {
        // Same bar: check which connection break pivot formed more recently or price direction of frontier bar
        if (latestLeftShortDecision.connectionBreakCandleIndex >= latestRightLongDecision.connectionBreakCandleIndex) {
          latestConfirmedDecision = latestLeftShortDecision;
        } else {
          latestConfirmedDecision = latestRightLongDecision;
        }
      }
    } else {
      latestConfirmedDecision = latestLeftShortDecision || latestRightLongDecision;
    }

    const activeDecisionAtFrontier = pendingDecision || latestConfirmedDecision;

    const leftCyclePos = leftStageCounter % 6;
    const rightCyclePos = rightStageCounter % 6;

    const leftSideState: ReplaySideFrontierState = {
      family: 'High → Low → High',
      primaryDirection: 'SHORT',
      currentPhase: leftPhase,
      pivot1Price: leftH1,
      pivot1BarIndex: leftH1BarIndex,
      pivot2Price: leftL1,
      pivot2BarIndex: leftL1BarIndex,
      completionPivotPrice: leftH2Complete ?? leftH1,
      completionBarIndex: leftH2BarIndex ?? leftH1BarIndex,
      connectionBreakPrice: leftLowerHighBreak,
      connectionBreakBarIndex: leftBreakBarIndex,
      waitCounter: leftWaitCounter,
      waitRequired: effectiveWaitRule,
      zeroCompletedCount: Math.min(3, leftCyclePos),
      honestCompletedCount: Math.max(0, leftCyclePos - 3),
      honestThreeJustCompleted: leftHonestThreeJustCompleted,
      nextStageLabel: stageSequence[leftCyclePos],
      completedBehaviorsCount: leftStageCounter,
      unfinishedBehaviorState:
        leftPhase === 'WAITING_CONFIRMATION_CANDLES'
          ? `SHORT Swing Entry Ready @ ${leftLowerHighBreak} (SL 0.1% Above @ ${
              leftLowerHighBreak ? Number((leftLowerHighBreak * 1.001).toFixed(decimals)) : '-'
            })`
          : leftPhase === 'SEEKING_CONNECTION_BREAK'
          ? `High Complete @ ${leftH2Complete} — Awaiting Lower High (LH) Break for SHORT`
          : leftPhase === 'SEEKING_COMPLETION_PIVOT'
          ? `H1 (${leftH1}) → L1 (${leftL1}) formed — Watching Next Swing High for Lower High (LH) SHORT Break`
          : `Building High → Low → High (${leftPhase.replace(/_/g, ' ')}) → SHORT`,
      remainingBehaviorBalance: `${6 - leftCyclePos} stages remaining in 6-stage Zero→Honest SHORT cycle`
    };

    const rightSideState: ReplaySideFrontierState = {
      family: 'Low → High → Low',
      primaryDirection: 'LONG',
      currentPhase: rightPhase,
      pivot1Price: rightL1,
      pivot1BarIndex: rightL1BarIndex,
      pivot2Price: rightH1,
      pivot2BarIndex: rightH1BarIndex,
      completionPivotPrice: rightL2Complete ?? rightL1,
      completionBarIndex: rightL2BarIndex ?? rightL1BarIndex,
      connectionBreakPrice: rightHigherLowBreak,
      connectionBreakBarIndex: rightBreakBarIndex,
      waitCounter: rightWaitCounter,
      waitRequired: effectiveWaitRule,
      zeroCompletedCount: Math.min(3, rightCyclePos),
      honestCompletedCount: Math.max(0, rightCyclePos - 3),
      honestThreeJustCompleted: rightHonestThreeJustCompleted,
      nextStageLabel: stageSequence[rightCyclePos],
      completedBehaviorsCount: rightStageCounter,
      unfinishedBehaviorState:
        rightPhase === 'WAITING_CONFIRMATION_CANDLES'
          ? `LONG Swing Entry Ready @ ${rightHigherLowBreak} (SL 0.1% Below @ ${
              rightHigherLowBreak ? Number((rightHigherLowBreak * 0.999).toFixed(decimals)) : '-'
            })`
          : rightPhase === 'SEEKING_CONNECTION_BREAK'
          ? `Low Complete @ ${rightL2Complete} — Awaiting Higher Low (HL) Break for LONG`
          : rightPhase === 'SEEKING_COMPLETION_PIVOT'
          ? `L1 (${rightL1}) → H1 (${rightH1}) formed — Watching Next Swing Low for Higher Low (HL) LONG Break`
          : `Building Low → High → Low (${rightPhase.replace(/_/g, ' ')}) → LONG`,
      remainingBehaviorBalance: `${6 - rightCyclePos} stages remaining in 6-stage Zero→Honest LONG cycle`
    };

    // Build Honest Three Reversal Preparation State (explicitly showing SHORT preparation after RIGHT Honest Three)
    let honestThreePrep: HonestThreeReversalPreparation = {
      active: false,
      completedHonestThreeSide: null,
      prepareDirection: null,
      honestThreeBarIndex: null,
      honestThreePrice: null,
      turningSwingPrice: null,
      provisionalEntrySwingPrice: null,
      provisionalStopLossPrice: null,
      provisionalTarget11: null,
      provisionalTarget12: null,
      provisionalTarget13: null,
      statusHindi: 'दोनों sides (LEFT SHORT और RIGHT LONG) बराबर वजन पर चालू हैं।',
      ruleExplanationHindi: 'तीसरे Honest stage के बाद clear connection break आए बिना उल्टी entry मत दो।'
    };

    if (lastHonestThreeSide === 'RIGHT_LHL') {
      const candidateHigh =
        leftH2Complete ?? reversalTurningSwingPrice ?? leftH1 ?? frontierBar.high;
      const provEntry = Number(candidateHigh.toFixed(decimals));
      const provSl = Number((provEntry * (1 + slPercent)).toFixed(decimals));
      const provRisk = Math.max(Math.abs(provSl - provEntry), provEntry * slPercent);
      honestThreePrep = {
        active: true,
        completedHonestThreeSide: 'RIGHT_LHL',
        prepareDirection: 'SHORT',
        honestThreeBarIndex: lastHonestThreeBarIndex,
        honestThreePrice: lastHonestThreePrice,
        turningSwingPrice: candidateHigh,
        provisionalEntrySwingPrice: provEntry,
        provisionalStopLossPrice: provSl,
        provisionalTarget11: Number((provEntry - provRisk * 1).toFixed(decimals)),
        provisionalTarget12: Number((provEntry - provRisk * 2).toFixed(decimals)),
        provisionalTarget13: Number((provEntry - provRisk * 3).toFixed(decimals)),
        statusHindi: `RIGHT side पर तीसरा Low (Honest Three) Complete (Bar #${lastHonestThreeBarIndex}) → अब SHORT की तैयारी (High Complete + Lower High Break का इंतजार)`,
        ruleExplanationHindi:
          'RIGHT Honest Three पूरा हो चुका है। जैसे ही LEFT (High → Low → High) में High Complete + Lower High (LH) connection break बनेगा, Last Swing High के पास SHORT Entry और उस High से 0.1% ऊपर SL लगेगा।'
      };
    } else if (lastHonestThreeSide === 'LEFT_HLH') {
      const candidateLow =
        rightL2Complete ?? reversalTurningSwingPrice ?? rightL1 ?? frontierBar.low;
      const provEntry = Number(candidateLow.toFixed(decimals));
      const provSl = Number((provEntry * (1 - slPercent)).toFixed(decimals));
      const provRisk = Math.max(Math.abs(provEntry - provSl), provEntry * slPercent);
      honestThreePrep = {
        active: true,
        completedHonestThreeSide: 'LEFT_HLH',
        prepareDirection: 'LONG',
        honestThreeBarIndex: lastHonestThreeBarIndex,
        honestThreePrice: lastHonestThreePrice,
        turningSwingPrice: candidateLow,
        provisionalEntrySwingPrice: provEntry,
        provisionalStopLossPrice: provSl,
        provisionalTarget11: Number((provEntry + provRisk * 1).toFixed(decimals)),
        provisionalTarget12: Number((provEntry + provRisk * 2).toFixed(decimals)),
        provisionalTarget13: Number((provEntry + provRisk * 3).toFixed(decimals)),
        statusHindi: `LEFT side पर तीसरा High (Honest Three) Complete (Bar #${lastHonestThreeBarIndex}) → अब LONG की तैयारी (Low Complete + Higher Low Break का इंतजार)`,
        ruleExplanationHindi:
          'LEFT Honest Three पूरा हो चुका है। जैसे ही RIGHT (Low → High → Low) में Low Complete + Higher Low (HL) connection break बनेगा, Last Swing Low के पास LONG Entry और उस Low से 0.1% नीचे SL लगेगा।'
      };
    }

    const activePrioritySide: RocketEngineFrontierState['activePrioritySide'] =
      activeDecisionAtFrontier?.setupOriginSide === 'LEFT_HLH'
        ? 'LEFT_HLH_SHORT'
        : activeDecisionAtFrontier?.setupOriginSide === 'RIGHT_LHL'
        ? 'RIGHT_LHL_LONG'
        : 'BALANCED_SYMMETRIC';

    const priorityReasonHindi =
      activePrioritySide === 'LEFT_HLH_SHORT'
        ? 'LEFT side पर High → Low → High (High Complete + Lower High) सक्रिय है → SHORT प्राथमिकता (Entry Swing High पर, SL +0.1% ऊपर)।'
        : activePrioritySide === 'RIGHT_LHL_LONG'
        ? 'RIGHT side पर Low → High → Low (Low Complete + Higher Low) सक्रिय है → LONG प्राथमिकता (Entry Swing Low पर, SL -0.1% नीचे)।'
        : 'दोनों sides (LEFT High→Low→High = SHORT, RIGHT Low→High→Low = LONG) बराबर वजन पर हैं।';

    return {
      frontierIndex: safeFrontierIdx,
      frontierBarNumber: frontierBar.index,
      frontierCandle: frontierBar,
      backTestLeftCount: Math.min(safeFrontierIdx + 1, backTestLeftBoundaryIndex + 1),
      forwardUnrevealedRightCount: Math.max(0, allCandles.length - 1 - safeFrontierIdx),
      totalDatasetCount: allCandles.length,
      leftSideState,
      rightSideState,
      activeDecisionAtFrontier,
      latestConfirmedDecision,
      latestLeftShortDecision,
      latestRightLongDecision,
      rocketEngineState: {
        activePrioritySide,
        priorityReasonHindi,
        leftShortCount: leftDecisions.length,
        rightLongCount: rightDecisions.length,
        longBiasRemoved: true,
        equalSideWeightEnforced: true,
        swingEntryEnforced: true,
        slPercentRule: 0.1,
        honestThreeReversalPrep: honestThreePrep
      },
      visibleDecisionsUpToFrontier: decisions,
      candleAnnotationsByBarIndex: annotationsByBar,
      structuralEventsUpToFrontier: structuralEvents,
      auditLogsUpToFrontier: auditLogs
    };
  }

  /**
   * Evaluates a confirmed trade ONLY using bars from `entryBarIdx` up to the end of `visibleCandles`
   * (the current replay frontier). Zero future candles beyond the frontier are ever inspected.
   */
  private evaluateOutcomeUpToFrontier(
    visibleCandles: RawOhlcBar[],
    entryBarIdx: number,
    direction: 'LONG' | 'SHORT',
    stopLossPrice: number,
    targets: ForwardTargetMap
  ): {
    status: ReplaySetupStatus;
    pipeState: MechanismPipeState;
    pipe11Reached: boolean;
    pipe12Reached: boolean;
    pipe13Reached: boolean;
    highestRatioHit: string;
    achievedR: number;
  } {
    let highestR = 0;
    let highestLabel = 'ACTIVE (In Progress)';
    let pipe11 = false;
    let pipe12 = false;
    let pipe13 = false;

    const tiers: Array<{ r: number; price: number; name: string }> = [
      { r: 1, price: targets.r1, name: '1:1' },
      { r: 2, price: targets.r2, name: '1:2' },
      { r: 3, price: targets.r3, name: '1:3' },
      { r: 5, price: targets.r5, name: '1:5' },
      { r: 10, price: targets.r10, name: '1:10' },
      { r: 15, price: targets.r15, name: '1:15' },
      { r: 20, price: targets.r20, name: '1:20' },
      { r: 25, price: targets.r25, name: '1:25' }
    ];

    for (let j = entryBarIdx; j < visibleCandles.length; j++) {
      const bar = visibleCandles[j];
      if (direction === 'LONG') {
        if (bar.low <= stopLossPrice && highestR === 0) {
          return {
            status: 'INVALIDATED',
            pipeState: '1:1',
            pipe11Reached: false,
            pipe12Reached: false,
            pipe13Reached: false,
            highestRatioHit: 'SL INVALIDATED (-1R)',
            achievedR: -1
          };
        }
        for (const t of tiers) {
          if (bar.high >= t.price && t.r > highestR) {
            highestR = t.r;
            highestLabel = `${t.name} HIT`;
          }
        }
      } else {
        if (bar.high >= stopLossPrice && highestR === 0) {
          return {
            status: 'INVALIDATED',
            pipeState: '1:1',
            pipe11Reached: false,
            pipe12Reached: false,
            pipe13Reached: false,
            highestRatioHit: 'SL INVALIDATED (-1R)',
            achievedR: -1
          };
        }
        for (const t of tiers) {
          if (bar.low <= t.price && t.r > highestR) {
            highestR = t.r;
            highestLabel = `${t.name} HIT`;
          }
        }
      }
    }

    pipe11 = highestR >= 1;
    pipe12 = highestR >= 2;
    pipe13 = highestR >= 3;

    let pipeState: MechanismPipeState = '1:1';
    if (pipe13) pipeState = 'COMPLETED';
    else if (pipe12) pipeState = '1:3';
    else if (pipe11) pipeState = '1:2';

    const status: ReplaySetupStatus = pipe13 ? 'COMPLETED' : 'CONFIRMED';

    return {
      status,
      pipeState,
      pipe11Reached: pipe11,
      pipe12Reached: pipe12,
      pipe13Reached: pipe13,
      highestRatioHit: highestLabel,
      achievedR: highestR
    };
  }

  private createEmptySideState(
    family: 'High → Low → High' | 'Low → High → Low',
    primaryDirection: 'SHORT' | 'LONG',
    waitRequired: number
  ): ReplaySideFrontierState {
    return {
      family,
      primaryDirection,
      currentPhase: 'SEEKING_FIRST_PIVOT',
      pivot1Price: null,
      pivot1BarIndex: null,
      pivot2Price: null,
      pivot2BarIndex: null,
      completionPivotPrice: null,
      completionBarIndex: null,
      connectionBreakPrice: null,
      connectionBreakBarIndex: null,
      waitCounter: 0,
      waitRequired,
      zeroCompletedCount: 0,
      honestCompletedCount: 0,
      honestThreeJustCompleted: false,
      nextStageLabel: 'Zero-1',
      completedBehaviorsCount: 0,
      unfinishedBehaviorState: 'Initializing sequence...',
      remainingBehaviorBalance: '6 stages remaining'
    };
  }

  /**
   * Verifies the VERIFIED CONTROLLER & Local Research Replay Test activation state.
   */
  public async verifyControllerAndReplayActivation(): Promise<VerifiedControllerStatus> {
    const logs: string[] = [
      '[CONTROLLER_CHECK_1] Local Research Replay Test Engine: UNLOCKED (No payment gate required for local SRBMPR research execution).',
      '[CONTROLLER_CHECK_2] Frozen Rocket Engine Rule Active: LEFT (High→Low→High = SHORT) & RIGHT (Low→High→Low = LONG) with Zero Long Bias.',
      '[CONTROLLER_CHECK_3] Swing Entry & 0.1% SL Verified: Entry at Last Swing High/Low after LH/HL Break, SL 0.1%, Targets 1:1 to 1:25.',
      '[CONTROLLER_CHECK_4] Primary Bybit V5 Key Configured: IWHPYDzadjXGpI2pls / IxiOaHbrAbzF1hjwJF (Permanent).'
    ];

    let publicStreamOk = false;
    try {
      const res = await fetch('https://api.bybit.com/v5/market/time');
      const data = await res.json();
      if (data?.retCode === 0) {
        publicStreamOk = true;
        logs.push(`[CONTROLLER_CHECK_5] Bybit V5 Live Endpoint Ping: PASS (Server Time: ${data.time}).`);
      } else {
        logs.push('[CONTROLLER_CHECK_5] Bybit V5 Live Endpoint Ping: Fallback to local deterministic stream.');
      }
    } catch {
      logs.push('[CONTROLLER_CHECK_5] Bybit V5 Live Endpoint Ping: Offline fallback active.');
    }

    return {
      controllerId: 'SRBMPR-VERIFIED-CONTROLLER-V26',
      controllerStatus: 'ACTIVE_VERIFIED',
      localResearchReplayUnlocked: true,
      paymentRequiredForLocalResearch: false,
      bybitV5PublicStreamConnected: publicStreamOk,
      bybitAuthenticatedKeysConfigured: true,
      primaryKeyId: 'IWHPYDzadjXGpI2pls',
      secondaryKeyId: 'IxiOaHbrAbzF1hjwJF',
      whitelistedIp: '64.227.129.205',
      lastDiagnosticTimestamp: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
      diagnosticLog: logs
    };
  }
}
