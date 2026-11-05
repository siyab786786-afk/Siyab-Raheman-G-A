import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SrbmprTwoSidedMechanismEngine,
  TwoSidedCandidateEvaluation
} from '../src/services/SrbmprTwoSidedMechanismEngine';
import { RawOhlcBar } from '../src/services/SrbmprForwardTestEngine';

test('1. LONG candidate is WITHHELD while SHORT mechanism remains actively expanding downward', () => {
  const engine = SrbmprTwoSidedMechanismEngine.getInstance();

  // Create a continuous downward trending market (Lower Highs and Lower Lows actively forming)
  const candles: RawOhlcBar[] = [];
  let p = 68000;
  for (let i = 0; i < 40; i++) {
    const open = p;
    const close = p - 50;
    const high = open + 20;
    const low = close - 30;
    candles.push({
      index: i + 1,
      timestamp: 1000 + i * 60000,
      timeFormatted: `2026-10-26 12:${i < 10 ? '0' + i : i}:00`,
      open,
      high,
      low,
      close,
      volume: 100
    });
    p = close;
  }

  const evaluation = engine.evaluateTwoSidedCandidate(
    candles,
    'BTCUSDT',
    '1m',
    'LONG'
  );

  // In an active downtrend, LONG entry MUST be withheld!
  assert.equal(evaluation.oppositeSideStatus, 'OPPOSITE_ACTIVE_IN_PROGRESS');
  assert.equal(evaluation.validationState, 'PENDING_OPPOSITE_COMPLETION');
  assert.equal(evaluation.entryPrice, null);
  assert.equal(evaluation.stopLossPrice, null);
  assert.equal(evaluation.targetPrice, null);
  assert.ok(evaluation.stateExplanation.includes('WITHHELD'));
});

test('2. SHORT candidate is WITHHELD while LONG mechanism remains actively expanding upward', () => {
  const engine = SrbmprTwoSidedMechanismEngine.getInstance();

  // Create a continuous upward trending market (Higher Highs and Higher Lows actively forming)
  const candles: RawOhlcBar[] = [];
  let p = 1200;
  for (let i = 0; i < 40; i++) {
    const open = p;
    const close = p + 20;
    const high = close + 10;
    const low = open - 10;
    candles.push({
      index: i + 1,
      timestamp: 1000 + i * 60000,
      timeFormatted: `2026-10-26 12:${i < 10 ? '0' + i : i}:00`,
      open,
      high,
      low,
      close,
      volume: 100
    });
    p = close;
  }

  const evaluation = engine.evaluateTwoSidedCandidate(
    candles,
    'ZECUSDT',
    '1m',
    'SHORT'
  );

  // In an active uptrend, SHORT entry MUST be withheld!
  assert.equal(evaluation.oppositeSideStatus, 'OPPOSITE_ACTIVE_IN_PROGRESS');
  assert.equal(evaluation.validationState, 'PENDING_OPPOSITE_COMPLETION');
  assert.equal(evaluation.entryPrice, null);
  assert.ok(evaluation.stateExplanation.includes('WITHHELD'));
});

test('3. Engine does NOT infer completion from missing candles (< 30 bars returns INCOMPLETE_DATA)', () => {
  const engine = SrbmprTwoSidedMechanismEngine.getInstance();

  const shortCandles: RawOhlcBar[] = [
    { index: 1, timestamp: 1000, timeFormatted: '2026-10-26 12:00:00', open: 68000, high: 68100, low: 67900, close: 68050 },
    { index: 2, timestamp: 2000, timeFormatted: '2026-10-26 12:01:00', open: 68050, high: 68200, low: 68000, close: 68150 }
  ];

  const evalShort = engine.evaluateTwoSidedCandidate(shortCandles, 'BTCUSDT', '1m', 'LONG');
  assert.equal(evalShort.validationState, 'INCOMPLETE_DATA');
  assert.equal(evalShort.oppositeSideStatus, 'INCOMPLETE_DATA');
  assert.equal(evalShort.entryPrice, null);
});

test('4. Final Micro-Zero Level determines the exact entry (never arbitrary mid-zone)', () => {
  const engine = SrbmprTwoSidedMechanismEngine.getInstance();

  // Create a completed SHORT descent followed by confirmed micro pivot low (Zero)
  const candles: RawOhlcBar[] = [];
  let p = 4150;
  for (let i = 0; i < 35; i++) {
    candles.push({
      index: i + 1,
      timestamp: 1000 + i * 60000,
      timeFormatted: `2026-10-26 12:${i < 10 ? '0' + i : i}:00`,
      open: p,
      high: p + 3,
      low: p - 3,
      close: p,
      volume: 200
    });
  }

  // Bar 36: descent to micro low 4130
  candles.push({
    index: 36,
    timestamp: 36000,
    timeFormatted: '2026-10-26 12:35:00',
    open: 4140,
    high: 4142,
    low: 4130, // Micro low (Zero)
    close: 4132,
    volume: 350
  });

  // Bar 37: holds higher low at 4135, closes higher at 4145
  candles.push({
    index: 37,
    timestamp: 37000,
    timeFormatted: '2026-10-26 12:36:00',
    open: 4133,
    high: 4148,
    low: 4134,
    close: 4146,
    volume: 500
  });

  const evaluation = engine.evaluateTwoSidedCandidate(
    candles,
    'PAXGUSDT',
    '1m',
    'LONG'
  );

  // Micro level confirmed at bar 36's low (4130)
  assert.equal(evaluation.finalMicroZeroPrice, 4130);
  assert.ok(evaluation.emaReferences.ema9 > 0);
  assert.ok(evaluation.emaReferences.ema21 > 0);
});

test('5. Both directions are evaluated from the same chronological dataset and 100% reproducible', () => {
  const engine = SrbmprTwoSidedMechanismEngine.getInstance();
  const testCandles = engine.generateSampleHistoricalCandles(68450, 60, '1m');

  const evalLong1 = engine.evaluateTwoSidedCandidate(testCandles, 'BTCUSDT', '1m', 'LONG');
  const evalLong2 = engine.evaluateTwoSidedCandidate(testCandles, 'BTCUSDT', '1m', 'LONG');
  const evalShort = engine.evaluateTwoSidedCandidate(testCandles, 'BTCUSDT', '1m', 'SHORT');

  // Exact reproducibility on replay
  assert.deepEqual(evalLong1, evalLong2);

  // Both directions evaluated from the identical dataset
  assert.equal(evalLong1.symbol, evalShort.symbol);
  assert.equal(evalLong1.evaluationTimestampUtc, evalShort.evaluationTimestampUtc);
  assert.equal(evalLong1.emaReferences.ema9, evalShort.emaReferences.ema9);
});

test('6. 100-Asset Universe multi-scan independently evaluates each asset without forced quotas', () => {
  const engine = SrbmprTwoSidedMechanismEngine.getInstance();

  const universe = [
    { symbol: 'BTCUSDT', category: 'CRYPTO' as const, basePrice: 68450 },
    { symbol: 'PAXGUSDT', category: 'GOLD' as const, basePrice: 4147 },
    { symbol: 'SILVER', category: 'COMMODITIES' as const, basePrice: 59.59 },
    { symbol: 'EURUSD', category: 'FOREX' as const, basePrice: 1.122 },
    { symbol: 'NAS100', category: 'INDICES' as const, basePrice: 30775 }
  ];

  const results = engine.scanMultiAssetUniverse(universe, 'LONG', '1m');
  assert.equal(results.length, 5);

  for (const res of results) {
    assert.ok(res.symbol);
    assert.ok(res.validationState);
    assert.ok(res.oppositeSideStatus);
    assert.ok(['PENDING', 'INCOMPLETE', 'VERIFIED'].includes(res.oppositeMechanismBadge));
    assert.ok(res.emaReferences.ema9 > 0);
  }
});

test('7. Opposite-side mechanism badge explicitly maps to PENDING, INCOMPLETE, or VERIFIED for LONG and SHORT', () => {
  const engine = SrbmprTwoSidedMechanismEngine.getInstance();

  assert.equal(engine.mapOppositeStatusToBadge('OPPOSITE_COMPLETED'), 'VERIFIED');
  assert.equal(engine.mapOppositeStatusToBadge('OPPOSITE_UNVERIFIED'), 'PENDING');
  assert.equal(engine.mapOppositeStatusToBadge('OPPOSITE_ACTIVE_IN_PROGRESS'), 'INCOMPLETE');
  assert.equal(engine.mapOppositeStatusToBadge('INCOMPLETE_DATA'), 'INCOMPLETE');
});

test('8. Gold (XAUUSD) M1 weekend closure is classified as MARKET_CLOSED_INTERVAL, not MISSING_DATA_GAP', () => {
  const engine = SrbmprTwoSidedMechanismEngine.getInstance();

  // Friday 2026-10-23 21:00 UTC close -> Sunday 2026-10-25 22:00 UTC open
  const friClose = Date.UTC(2026, 9, 23, 21, 0, 0);
  const sunOpen = Date.UTC(2026, 9, 25, 22, 0, 0);
  const weekendCheck = engine.classifyMarketTimeGap(friClose, sunOpen, 'GOLD');
  assert.equal(weekendCheck.classification, 'MARKET_CLOSED_INTERVAL');

  // Unexpected Tuesday 14:00 UTC -> 14:35 UTC gap on GOLD
  const tueStart = Date.UTC(2026, 9, 20, 14, 0, 0);
  const tueEnd = Date.UTC(2026, 9, 20, 14, 35, 0);
  const weekdayGapCheck = engine.classifyMarketTimeGap(tueStart, tueEnd, 'GOLD');
  assert.equal(weekdayGapCheck.classification, 'MISSING_DATA_GAP');
});

test('9. 1-Second (1s) tick aggregation preserves empty seconds without fabricating synthetic candles and separates counts', () => {
  const engine = SrbmprTwoSidedMechanismEngine.getInstance();

  const ticks = [
    { timestampMs: 1700000000100, price: 4147.1, volume: 1 },
    { timestampMs: 1700000000900, price: 4147.5, volume: 2 },
    // 1700000001 is empty (no ticks)
    { timestampMs: 1700000002300, price: 4148.0, volume: 3 }
    // 1700000003 is empty (no ticks)
  ];

  const agg = engine.aggregateTicksToOneSecondCandles(ticks, 1700000000, 1700000003);
  assert.equal(agg.downloadedTickRows, 3);
  assert.equal(agg.processedCandleRows, 2);
  assert.equal(agg.emptySecondsCount, 2);
  assert.equal(agg.syntheticCandlesCreated, 0);
});

test('10. Dukascopy vs MT5 Gold feed comparison preserves raw sources separately', () => {
  const engine = SrbmprTwoSidedMechanismEngine.getInstance();
  const dukascopyBars = engine.generateSampleHistoricalCandles(4147.5, 10, '1m');
  const mt5Bars = dukascopyBars.map(b => ({
    ...b,
    close: Number((b.close + 0.15).toFixed(3)),
    high: Number((b.high + 0.2).toFixed(3))
  }));

  const cmp = engine.compareGoldFeedsSideBySide(dukascopyBars, mt5Bars);
  assert.equal(cmp.dukascopyDownloadedRows, 10);
  assert.equal(cmp.mt5DownloadedRows, 10);
  assert.equal(cmp.matchedTimestamps, 10);
  assert.equal(cmp.rawSourcesPreservedSeparately, true);
  assert.ok(cmp.avgCloseSpreadUsd > 0);
});

