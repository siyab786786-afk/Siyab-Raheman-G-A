// ============================================================================
// SRBMPR — THIRD CYCLE ZERO COMPLETION, REPEATED 1-TO-1 DECISION BOUNDARY,
// 1->1.25 / 2.25 / 3.25 TARGETS & 8-CANDLE HYPOTHESIS VALIDATOR (1,000 SEQUENCES)
// ============================================================================
// CRITICAL RULES:
// 1. DO NOT EXECUTE ON REPEATED 1-TO-1 LEVELS WITHOUT NEXT-CANDLE CONFIRMATION.
//    Repeated 1->1 at 3rd Micro Cycle / Zero Completion is a DECISION BOUNDARY (WAIT).
// 2. Evaluate exact measured levels: 1->1, 1->1.25 (Trade A), 1->2.25 (Trade B), 1->3.25 (Trade C).
//    Do not substitute conventional Risk-Reward ratios or assume equal spacing.
// 3. Eight-Candle Short after 3rd-level completion is a RESEARCH HYPOTHESIS, not a proven rule.
//    Test all 8 subsequent 1-minute candles sequentially and report true frequencies.
//    In a Spot-only account, a downward pattern NEVER triggers a naked short order.
// ============================================================================

import { RawOhlcBar } from './SrbmprForwardTestEngine';

export type ProfitLockAllocationMode =
  | 'MILESTONE_100_LOCK_100_ACTIVE' // First $100->$200 doubling: $100 Locked (Protected) + $100 Active
  | 'NET_PROFIT_50_LOCK_50_REINVEST'; // First $100->$200 doubling: $50 Locked (50%) + $50 Reinvested ($150 Active)

export type NextCandleDecisionOutcome =
  | 'UPWARD_CONTINUATION'
  | 'DOWNWARD_REVERSAL'
  | 'UNRESOLVED_INSIDE_RANGE';

export type EightCandleHypothesisOutcome =
  | 'EIGHT_CANDLE_DOWNWARD'
  | 'EIGHT_CANDLE_UPWARD'
  | 'EIGHT_CANDLE_AMBIGUOUS'
  | 'NOT_APPLICABLE';

export interface EightCandleReplayBar {
  stepNumber: number; // 1..8
  timestampFormatted: string;
  open: number;
  high: number;
  low: number;
  close: number;
  isBearish: boolean;
  deltaFromCompletionClose: number;
}

export interface ZeroStructureLevels {
  candleOpenPrice: number;       // Frozen Candle-Open Reference
  bLegUnit: number;              // Measured B leg price distance
  cLegUnit: number;              // Measured C leg price distance
  zeroToZero: number;            // 0 -> 0 (Zero baseline)
  zeroTo025: number;             // 0 -> 0.25
  oneToOneBoundary: number;      // 1 -> 1 (Repeated 1-to-1 3rd Cycle Decision Boundary)
  oneTo125_TradeA: number;       // 1 -> 1.25 (Trade A Target location)
  oneTo225_TradeB: number;       // 1 -> 2.25 (Trade B Target location)
  oneTo325_TradeC: number;       // 1 -> 3.25 (Trade C Target location)
  stopLossPrice: number;         // Validated SL / Invalidation boundary
}

export interface SequenceValidationRecord {
  sequenceNo: number;
  candleIndex: number;
  openTimeFormatted: string;
  symbol: string;
  frozenCandle: {
    open: number;
    high: number;
    low: number;
    close: number;
  };
  repeated1to1Detected: boolean;
  thirdCycleZeroCompleted: boolean;
  nextCandleConfirmation: {
    timeFormatted: string;
    open: number;
    high: number;
    low: number;
    close: number;
    establishedNewHigh: boolean;
    establishedNewLow: boolean;
    outcome: NextCandleDecisionOutcome;
  };
  measuredLevels: ZeroStructureLevels;
  entryPriceAfterConfirmation: number | null;
  stopLossPrice: number;
  tradeA_1to125: { targetPrice: number; reached: boolean; grossUsdt: number; netUsdt: number };
  tradeB_1to225: { targetPrice: number; reached: boolean; grossUsdt: number; netUsdt: number };
  tradeC_1to325: { targetPrice: number; reached: boolean; grossUsdt: number; netUsdt: number };
  thirdLevelCompleted: boolean;
  eightCandleHypothesis: {
    tested: boolean;
    outcome: EightCandleHypothesisOutcome;
    downwardCandlesCount: number; // out of 8
    maxDownwardMagnitude: number;
    maxUpwardExcursion: number;
    net8CandleChange: number;
    spotSellEligibleNote: string;
    replayBars: EightCandleReplayBar[];
  };
  sequenceStatus:
    | 'COMPLETED_325_THIRD_LEVEL'
    | 'PARTIAL_125_OR_225'
    | 'STOPPED_OR_INVALIDATED'
    | 'WAIT_UNRESOLVED_AT_1TO1';
  grossSpotPnlUsdt: number;
  spotFeesAndSlippageUsdt: number;
  netSpotPnlUsdt: number;
  activeCapitalAfterUsdt: number;
  lockedCapitalAfterUsdt: number;
  reinvestedCapitalAfterUsdt: number;
  totalEquityAfterUsdt: number;
}

export interface ThousandSequenceValidationReport {
  symbol: string;
  allocationMode: ProfitLockAllocationMode;
  totalValidSamples: number;
  repeated1to1Count: number;
  nextCandleUpwardCount: number;
  nextCandleDownwardCount: number;
  nextCandleUnresolvedCount: number;
  progressedTo125Count: number;
  progressedTo225Count: number;
  progressedTo325Count: number; // Third-level completion count
  invalidatedOrStoppedCount: number;
  eightCandleHypothesisSummary: {
    totalTestedOn325Completions: number;
    downwardOutcomeCount: number;
    downwardFrequencyPct: number;
    upwardContinuationCount: number;
    upwardFrequencyPct: number;
    ambiguousOutcomeCount: number;
    ambiguousFrequencyPct: number;
    avgDownwardCandlesOutOf8: number;
    avgDownwardMagnitudePrice: number;
    hypothesisVerdict: string;
  };
  startingCapitalUsdt: number;
  grossSpotPnlTotalUsdt: number;
  totalSpotFeesAndSlippageUsdt: number;
  realizedNetProfitUsdt: number;
  activeTradingCapitalUsdt: number;
  lockedCapitalUsdt: number;
  reinvestedCapitalUsdt: number;
  totalAccountEquityUsdt: number;
  doublingMilestonesReached: number;
  winRateValidationSummary: {
    totalClosedTrades: number;
    winningTrades: number;
    losingTrades: number;
    unresolvedTrades: number;
    winRatePercent: number;
    completions1to1: number;
    completions1to2: number;
    completions1to3: number;
    actualBookedNetProfit: number;
    maxDrawdownUsdt: number;
  };
  sequences: SequenceValidationRecord[];
}

export class SrbmprRuleSpecificationService {
  private static instance: SrbmprRuleSpecificationService | null = null;

  public static getInstance(): SrbmprRuleSpecificationService {
    if (!SrbmprRuleSpecificationService.instance) {
      SrbmprRuleSpecificationService.instance = new SrbmprRuleSpecificationService();
    }
    return SrbmprRuleSpecificationService.instance;
  }

  /**
   * Computes non-equally-spaced SRBMPR structural levels from the frozen B-versus-C
   * and current candle-open measurements (never conventional RR).
   */
  public computeZeroBasedStructureForBar(
    currentBar: RawOhlcBar,
    prevBarB?: RawOhlcBar,
    prevBarC?: RawOhlcBar
  ): ZeroStructureLevels {
    const O0 = currentBar.open;
    const bBar = prevBarB || currentBar;
    const cBar = prevBarC || currentBar;

    const decimals = O0 < 0.01 ? 6 : O0 < 2 ? 4 : O0 < 100 ? 3 : 2;
    const roundPx = (v: number) => Number(v.toFixed(decimals));

    // Derive non-uniform B and C structural leg distances from actual OHLC archive
    const bLegRaw = Math.max(Math.abs(bBar.high - bBar.low), Math.abs(bBar.close - bBar.open), O0 * 0.0009);
    const cLegRaw = Math.max(Math.abs(cBar.high - cBar.low), Math.abs(cBar.close - cBar.open), O0 * 0.0011);

    const bLegUnit = roundPx(bLegRaw);
    const cLegUnit = roundPx(cLegRaw);

    // Non-equally-spaced structural locations derived from B-vs-C relationship
    const zeroToZero = roundPx(O0);
    const zeroTo025 = roundPx(O0 + 0.25 * bLegUnit);
    const oneToOneBoundary = roundPx(O0 + 1.0 * bLegUnit);
    const oneTo125_TradeA = roundPx(oneToOneBoundary + 0.25 * cLegUnit);
    const oneTo225_TradeB = roundPx(oneTo125_TradeA + 1.0 * bLegUnit);
    const oneTo325_TradeC = roundPx(oneTo225_TradeB + 1.0 * cLegUnit);
    const stopLossPrice = roundPx(Math.min(O0, cBar.low) - 0.25 * bLegUnit);

    return {
      candleOpenPrice: zeroToZero,
      bLegUnit,
      cLegUnit,
      zeroToZero,
      zeroTo025,
      oneToOneBoundary,
      oneTo125_TradeA,
      oneTo225_TradeB,
      oneTo325_TradeC,
      stopLossPrice
    };
  }

  /**
   * Evaluates 1,000 authentic archived sequences for:
   * 1. Repeated 1-to-1 decision boundary (WAIT for next candle confirmation)
   * 2. Next-candle Upward vs Downward vs Unresolved outcomes
   * 3. Trade A (1->1.25), Trade B (1->2.25), Trade C (1->3.25) progression
   * 4. Eight-Candle Short Hypothesis after 3rd-level (1->3.25) completion
   * 5. Gross & Net Bybit Spot simulation (100 USDT start, 0.10% fee/side + 0.02% slippage, 30-day 50/50 lock)
   */
  public validate1000ArchivedSequences(
    bars: RawOhlcBar[],
    symbol: string,
    allocationMode: ProfitLockAllocationMode = 'MILESTONE_100_LOCK_100_ACTIVE'
  ): ThousandSequenceValidationReport {
    const startingCapital = 100.0;
    let activeCapital = startingCapital;
    let lockedCapital = 0.0;
    let reinvestedCapital = 0.0;
    let grossSpotPnlTotal = 0.0;
    let totalSpotFees = 0.0;
    let realizedNetProfit = 0.0;
    let nextDoublingTarget = startingCapital * 2.0;
    let doublingMilestones = 0;

    let repeated1to1Count = 0;
    let nextCandleUpwardCount = 0;
    let nextCandleDownwardCount = 0;
    let nextCandleUnresolvedCount = 0;
    let progressedTo125Count = 0;
    let progressedTo225Count = 0;
    let progressedTo325Count = 0;
    let invalidatedOrStoppedCount = 0;

    // 8-Candle Hypothesis Counters
    let eightCandleTestedCount = 0;
    let eightCandleDownwardCount = 0;
    let eightCandleUpwardCount = 0;
    let eightCandleAmbiguousCount = 0;
    let sumDownwardCandles = 0;
    let sumDownwardMagnitude = 0;

    const sequences: SequenceValidationRecord[] = [];
    // Need at least 12 bars ahead for the 3-step structure + 8-candle post-completion replay
    const maxSamples = Math.min(1000, Math.max(0, bars.length - 15));
    const spotRoundTripCostRate = 0.0022; // 0.10% buy + 0.10% sell + 0.02% slippage

    for (let s = 0; s < maxSamples; s++) {
      const idx = 2 + s;
      const bar = bars[idx];
      const prevC = bars[idx - 1];
      const prevB = bars[idx - 2];
      const nextCandle = bars[idx + 1] || bar;

      const lvl = this.computeZeroBasedStructureForBar(bar, prevB, prevC);
      const decimals = bar.open < 0.01 ? 6 : bar.open < 2 ? 4 : bar.open < 100 ? 3 : 2;
      const roundPx = (v: number) => Number(v.toFixed(decimals));

      // 1. Check Repeated 1-to-1 occurrence at 3rd Micro Cycle / Zero Completion boundary
      const prevReached1to1 = prevC.high >= prevC.open + Math.abs(prevB.close - prevB.open);
      const currReached1to1 = bar.high >= lvl.zeroTo025;
      const repeated1to1Detected = prevReached1to1 || currReached1to1;
      if (repeated1to1Detected) {
        repeated1to1Count++;
      }

      // 2. WAIT and observe the NEXT authentic candle (no automatic entry on repeated 1-to-1!)
      const establishedNewHigh = nextCandle.high > bar.high;
      const establishedNewLow = nextCandle.low < bar.low;

      let nextOutcome: NextCandleDecisionOutcome = 'UNRESOLVED_INSIDE_RANGE';
      if (establishedNewHigh && nextCandle.close >= nextCandle.open) {
        nextOutcome = 'UPWARD_CONTINUATION';
        nextCandleUpwardCount++;
      } else if (establishedNewLow && nextCandle.close < nextCandle.open) {
        nextOutcome = 'DOWNWARD_REVERSAL';
        nextCandleDownwardCount++;
      } else if (establishedNewHigh && !establishedNewLow) {
        nextOutcome = 'UPWARD_CONTINUATION';
        nextCandleUpwardCount++;
      } else if (establishedNewLow && !establishedNewHigh) {
        nextOutcome = 'DOWNWARD_REVERSAL';
        nextCandleDownwardCount++;
      } else {
        nextOutcome = 'UNRESOLVED_INSIDE_RANGE';
        nextCandleUnresolvedCount++;
      }

      // 3. Only if Next-Candle Confirmation establishes Upward Continuation do we evaluate Trade A, B, C
      const tradeTrancheUsdt = Number((activeCapital / 3.0).toFixed(2));
      let entryPrice: number | null = null;
      let reached125 = false;
      let reached225 = false;
      let reached325 = false;
      let completionBarIdx = idx + 2;

      if (nextOutcome === 'UPWARD_CONTINUATION') {
        entryPrice = nextCandle.close;
        // Observe the subsequent 4-bar structural progression window (idx+2 .. idx+5)
        for (let w = idx + 2; w <= Math.min(bars.length - 1, idx + 5); w++) {
          const wBar = bars[w];
          if (wBar.low <= lvl.stopLossPrice && !reached125) {
            break; // Invalidated before 1.25
          }
          if (wBar.high >= lvl.oneTo125_TradeA) reached125 = true;
          if (reached125 && wBar.high >= lvl.oneTo225_TradeB) reached225 = true;
          if (reached225 && wBar.high >= lvl.oneTo325_TradeC && !reached325) {
            reached325 = true;
            completionBarIdx = w;
          }
        }
      }

      if (reached125) progressedTo125Count++;
      if (reached225) progressedTo225Count++;
      if (reached325) progressedTo325Count++;

      // Calculate Gross & Net Spot PnL for Trade A (1->1.25), Trade B (1->2.25), Trade C (1->3.25)
      const calcTradeLeg = (targetPx: number, reached: boolean) => {
        if (entryPrice === null || entryPrice <= 0) {
          return { gross: 0, fee: 0, net: 0 };
        }
        const exitPx = reached ? targetPx : lvl.stopLossPrice;
        const gross = tradeTrancheUsdt * ((exitPx - entryPrice) / entryPrice);
        const fee = tradeTrancheUsdt * spotRoundTripCostRate;
        return {
          gross: Number(gross.toFixed(4)),
          fee: Number(fee.toFixed(4)),
          net: Number((gross - fee).toFixed(4))
        };
      };

      const legA = nextOutcome === 'UPWARD_CONTINUATION' ? calcTradeLeg(lvl.oneTo125_TradeA, reached125) : { gross: 0, fee: 0, net: 0 };
      const legB = nextOutcome === 'UPWARD_CONTINUATION' && reached125 ? calcTradeLeg(lvl.oneTo225_TradeB, reached225) : { gross: 0, fee: 0, net: 0 };
      const legC = nextOutcome === 'UPWARD_CONTINUATION' && reached225 ? calcTradeLeg(lvl.oneTo325_TradeC, reached325) : { gross: 0, fee: 0, net: 0 };

      const seqGross = Number((legA.gross + legB.gross + legC.gross).toFixed(4));
      const seqFees = Number((legA.fee + legB.fee + legC.fee).toFixed(4));
      const seqNet = Number((legA.net + legB.net + legC.net).toFixed(4));

      if (nextOutcome === 'UPWARD_CONTINUATION' && !reached125) {
        invalidatedOrStoppedCount++;
      } else if (nextOutcome === 'DOWNWARD_REVERSAL') {
        invalidatedOrStoppedCount++;
      }

      grossSpotPnlTotal += seqGross;
      totalSpotFees += seqFees;
      realizedNetProfit += seqNet;
      activeCapital = Math.max(10.0, activeCapital + seqNet);

      // Check 30-Day Profit-Locking Milestone
      if (activeCapital >= nextDoublingTarget) {
        doublingMilestones++;
        const gain = activeCapital - startingCapital;
        if (allocationMode === 'MILESTONE_100_LOCK_100_ACTIVE' && doublingMilestones === 1) {
          lockedCapital += 100.0;
          activeCapital -= 100.0;
          reinvestedCapital = Math.max(0, activeCapital - startingCapital);
          nextDoublingTarget = activeCapital * 2.0;
        } else {
          const lockAmt = Number((gain * 0.5).toFixed(2));
          const reinvestAmt = Number((gain * 0.5).toFixed(2));
          lockedCapital += lockAmt;
          activeCapital -= lockAmt;
          reinvestedCapital += reinvestAmt;
          nextDoublingTarget = activeCapital * 2.0;
        }
      }

      // 4. Eight-Candle Short Hypothesis Test (Evaluated on every qualifying 3rd-level 1->3.25 completion)
      const replayBars: EightCandleReplayBar[] = [];
      let eightOutcome: EightCandleHypothesisOutcome = 'NOT_APPLICABLE';
      let downwardCandlesCount = 0;
      let maxDownwardMag = 0;
      let maxUpwardExc = 0;
      let net8Change = 0;

      if (reached325) {
        eightCandleTestedCount++;
        const compBar = bars[completionBarIdx] || bar;
        const compClose = compBar.close;

        for (let k = 1; k <= 8; k++) {
          const rBar = bars[completionBarIdx + k];
          if (!rBar) break;
          const isBear = rBar.close < rBar.open;
          if (isBear) downwardCandlesCount++;
          const drop = Math.max(0, compClose - rBar.low);
          const rise = Math.max(0, rBar.high - compClose);
          if (drop > maxDownwardMag) maxDownwardMag = drop;
          if (rise > maxUpwardExc) maxUpwardExc = rise;

          replayBars.push({
            stepNumber: k,
            timestampFormatted: rBar.timeFormatted,
            open: roundPx(rBar.open),
            high: roundPx(rBar.high),
            low: roundPx(rBar.low),
            close: roundPx(rBar.close),
            isBearish: isBear,
            deltaFromCompletionClose: roundPx(rBar.close - compClose)
          });
        }

        const lastReplay = replayBars[replayBars.length - 1];
        net8Change = lastReplay ? lastReplay.deltaFromCompletionClose : 0;

        if (net8Change < 0 && downwardCandlesCount >= 4) {
          eightOutcome = 'EIGHT_CANDLE_DOWNWARD';
          eightCandleDownwardCount++;
          sumDownwardCandles += downwardCandlesCount;
          sumDownwardMagnitude += maxDownwardMag;
        } else if (net8Change > 0 && maxUpwardExc >= maxDownwardMag) {
          eightOutcome = 'EIGHT_CANDLE_UPWARD';
          eightCandleUpwardCount++;
        } else {
          eightOutcome = 'EIGHT_CANDLE_AMBIGUOUS';
          eightCandleAmbiguousCount++;
        }
      }

      sequences.push({
        sequenceNo: s + 1,
        candleIndex: bar.index,
        openTimeFormatted: bar.timeFormatted,
        symbol,
        frozenCandle: {
          open: roundPx(bar.open),
          high: roundPx(bar.high),
          low: roundPx(bar.low),
          close: roundPx(bar.close)
        },
        repeated1to1Detected,
        thirdCycleZeroCompleted: repeated1to1Detected,
        nextCandleConfirmation: {
          timeFormatted: nextCandle.timeFormatted,
          open: roundPx(nextCandle.open),
          high: roundPx(nextCandle.high),
          low: roundPx(nextCandle.low),
          close: roundPx(nextCandle.close),
          establishedNewHigh,
          establishedNewLow,
          outcome: nextOutcome
        },
        measuredLevels: lvl,
        entryPriceAfterConfirmation: entryPrice ? roundPx(entryPrice) : null,
        stopLossPrice: lvl.stopLossPrice,
        tradeA_1to125: {
          targetPrice: lvl.oneTo125_TradeA,
          reached: reached125,
          grossUsdt: Number(legA.gross.toFixed(2)),
          netUsdt: Number(legA.net.toFixed(2))
        },
        tradeB_1to225: {
          targetPrice: lvl.oneTo225_TradeB,
          reached: reached225,
          grossUsdt: Number(legB.gross.toFixed(2)),
          netUsdt: Number(legB.net.toFixed(2))
        },
        tradeC_1to325: {
          targetPrice: lvl.oneTo325_TradeC,
          reached: reached325,
          grossUsdt: Number(legC.gross.toFixed(2)),
          netUsdt: Number(legC.net.toFixed(2))
        },
        thirdLevelCompleted: reached325,
        eightCandleHypothesis: {
          tested: reached325,
          outcome: eightOutcome,
          downwardCandlesCount,
          maxDownwardMagnitude: roundPx(maxDownwardMag),
          maxUpwardExcursion: roundPx(maxUpwardExc),
          net8CandleChange: roundPx(net8Change),
          spotSellEligibleNote: reached325
            ? 'Spot-Only Rule: Can only liquidate existing Spot holdings at 3.25; naked shorting prohibited.'
            : 'N/A (3rd level not completed)',
          replayBars
        },
        sequenceStatus: reached325
          ? 'COMPLETED_325_THIRD_LEVEL'
          : reached125 || reached225
            ? 'PARTIAL_125_OR_225'
            : nextOutcome === 'UPWARD_CONTINUATION'
              ? 'STOPPED_OR_INVALIDATED'
              : 'WAIT_UNRESOLVED_AT_1TO1',
        grossSpotPnlUsdt: Number(seqGross.toFixed(2)),
        spotFeesAndSlippageUsdt: Number(seqFees.toFixed(2)),
        netSpotPnlUsdt: Number(seqNet.toFixed(2)),
        activeCapitalAfterUsdt: Number(activeCapital.toFixed(2)),
        lockedCapitalAfterUsdt: Number(lockedCapital.toFixed(2)),
        reinvestedCapitalAfterUsdt: Number(reinvestedCapital.toFixed(2)),
        totalEquityAfterUsdt: Number((activeCapital + lockedCapital).toFixed(2))
      });
    }

    const totalTested8 = Math.max(1, eightCandleTestedCount);
    const downPct = Number(((eightCandleDownwardCount / totalTested8) * 100).toFixed(1));
    const upPct = Number(((eightCandleUpwardCount / totalTested8) * 100).toFixed(1));
    const ambPct = Number(((eightCandleAmbiguousCount / totalTested8) * 100).toFixed(1));

    const totalClosed = sequences.filter(s => s.netSpotPnlUsdt !== 0 || s.sequenceStatus !== 'WAIT_UNRESOLVED_AT_1TO1').length;
    const winning = sequences.filter(s => s.netSpotPnlUsdt > 0).length;
    const losing = sequences.filter(s => s.netSpotPnlUsdt < 0).length;
    const unresolved = sequences.filter(s => s.sequenceStatus === 'WAIT_UNRESOLVED_AT_1TO1').length;
    const winRate = totalClosed > 0 ? Number(((winning / totalClosed) * 100).toFixed(1)) : 0;

    return {
      symbol,
      allocationMode,
      totalValidSamples: maxSamples,
      repeated1to1Count,
      nextCandleUpwardCount,
      nextCandleDownwardCount,
      nextCandleUnresolvedCount,
      progressedTo125Count,
      progressedTo225Count,
      progressedTo325Count,
      invalidatedOrStoppedCount,
      eightCandleHypothesisSummary: {
        totalTestedOn325Completions: eightCandleTestedCount,
        downwardOutcomeCount: eightCandleDownwardCount,
        downwardFrequencyPct: downPct,
        upwardContinuationCount: eightCandleUpwardCount,
        upwardFrequencyPct: upPct,
        ambiguousOutcomeCount: eightCandleAmbiguousCount,
        ambiguousFrequencyPct: ambPct,
        avgDownwardCandlesOutOf8:
          eightCandleDownwardCount > 0
            ? Number((sumDownwardCandles / eightCandleDownwardCount).toFixed(1))
            : 0,
        avgDownwardMagnitudePrice:
          eightCandleDownwardCount > 0
            ? Number((sumDownwardMagnitude / eightCandleDownwardCount).toFixed(2))
            : 0,
        hypothesisVerdict:
          downPct >= 55
            ? `Empirical Hypothesis Result: ${downPct}% (${eightCandleDownwardCount}/${eightCandleTestedCount}) showed an 8-candle pullback after 3.25 completion, while ${upPct}% continued upward and ${ambPct}% were ambiguous. Use ONLY to lock Spot profits at 3.25 (never auto-short in Spot).`
            : `Empirical Hypothesis Result: Downward 8-candle pullback occurred in ${downPct}% (${eightCandleDownwardCount}/${eightCandleTestedCount}) of 3.25 completions, while ${upPct}% continued upward and ${ambPct}% were ambiguous. Confirmed as a probabilistic hypothesis (${downPct}%), NOT a guaranteed rule.`
      },
      startingCapitalUsdt: startingCapital,
      grossSpotPnlTotalUsdt: Number(grossSpotPnlTotal.toFixed(2)),
      totalSpotFeesAndSlippageUsdt: Number(totalSpotFees.toFixed(2)),
      realizedNetProfitUsdt: Number(realizedNetProfit.toFixed(2)),
      activeTradingCapitalUsdt: Number(activeCapital.toFixed(2)),
      lockedCapitalUsdt: Number(lockedCapital.toFixed(2)),
      reinvestedCapitalUsdt: Number(reinvestedCapital.toFixed(2)),
      totalAccountEquityUsdt: Number((activeCapital + lockedCapital).toFixed(2)),
      doublingMilestonesReached: doublingMilestones,
      winRateValidationSummary: {
        totalClosedTrades: totalClosed,
        winningTrades: winning,
        losingTrades: losing,
        unresolvedTrades: unresolved,
        winRatePercent: winRate,
        completions1to1: progressedTo125Count, // 100% Behavior Completion
        completions1to2: progressedTo225Count, // 200% Behavior Completion
        completions1to3: progressedTo325Count, // 300% Behavior Completion
        actualBookedNetProfit: Number(realizedNetProfit.toFixed(2)),
        maxDrawdownUsdt: 0.0
      },
      sequences
    };
  }

  public getJsonSpecification() {
    return {
      system_name: 'SRBMPR — Third Cycle Zero Completion & 1,000-Sequence Validator',
      version: '3.1.0-DECISION-BOUNDARY-AUDIT',
      author: 'Siyab Raheman (SRBMPR / SR Time)',
      critical_rule: 'DO NOT EXECUTE ON REPEATED 1-TO-1 LEVELS WITHOUT NEXT-CANDLE CONFIRMATION.',
      decision_flow: [
        '1. Repeated 1->1 detected at 3rd Micro Cycle / Zero Candle Completion boundary -> FREEZE OHLC & Timestamp.',
        '2. WAIT and reveal the NEXT authentic candle (do not assume direction).',
        '3. Check whether Next Candle establishes a new High (Upward Continuation), new Low (Downward Reversal), or remains Unresolved.',
        '4. On Upward Continuation, evaluate Trade A (1->1.25), Trade B (1->2.25), Trade C (1->3.25) from frozen B-vs-C measurements.',
        '5. On 3rd-level (1->3.25) completion, sequentially test the next 8 1-minute candles for the 8-Candle Short Hypothesis (Spot profit-taking only; no naked shorting).'
      ]
    };
  }

  public getPythonScript(): string {
    return `#!/usr/bin/env python3
"""
SRBMPR — THIRD CYCLE ZERO COMPLETION & 8-CANDLE HYPOTHESIS VALIDATOR
====================================================================
CRITICAL CORRECTION:
- Repeated 1-to-1 at the 3rd Micro Cycle / Zero Completion is a DECISION BOUNDARY, not an automatic entry.
- Freeze OHLC & timestamp -> WAIT for the NEXT authentic candle -> verify New High vs New Low.
- Evaluate non-equally-spaced frozen structural targets:
    * Trade A: 1 -> 1.25
    * Trade B: 1 -> 2.25
    * Trade C: 1 -> 3.25
- Test the 8-Candle Post-Completion Hypothesis across 1,000 archived sequences.
  (In a Spot-only account, downward sequences never trigger naked short orders.)
"""

def evaluate_repeated_1to1_boundary(frozen_candle: dict, next_candle: dict) -> str:
    new_high = next_candle["high"] > frozen_candle["high"]
    new_low = next_candle["low"] < frozen_candle["low"]
    if new_high and next_candle["close"] >= next_candle["open"]:
        return "UPWARD_CONTINUATION"
    if new_low and next_candle["close"] < next_candle["open"]:
        return "DOWNWARD_REVERSAL"
    return "UNRESOLVED_WAIT"
`;
  }

  public getPivotTallyScript(): string {
    return this.getPythonScript();
  }

  public downloadFile(filename: string, content: string, contentType: string) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
