import test from 'node:test';
import assert from 'node:assert/strict';
import { SrbmprMasterResearchArchiveService } from '../src/services/SrbmprMasterResearchArchiveService';
import { RocketEngineNoStopLossResearchService } from '../src/services/RocketEngineNoStopLossResearchService';
import { UniversalAssetFootprintEngine } from '../src/services/UniversalAssetFootprintEngine';
import { renderAppView } from '../src/services/SrbmprViewModeRouter';
import { RawOhlcBar } from '../src/services/SrbmprForwardTestEngine';

test('1. Derived Candle Measurement Formulas & Zero-Range Safe Division Guard', () => {
  const service = SrbmprMasterResearchArchiveService.getInstance();

  // Normal H1 candle: Open 0.2676, High 0.2915, Low 0.2670, Close 0.2891
  const m1 = service.calculateDerivedCandleMeasurement(0.2676, 0.2915, 0.2670, 0.2891);
  assert.equal(m1.body, 0.0215);
  assert.equal(m1.upperWick, 0.0024);
  assert.equal(m1.lowerWick, 0.0006);
  assert.equal(m1.totalRange, 0.0245);
  assert.equal(m1.isZeroRangeCandle, false);
  assert.equal(m1.polarity, 'BULLISH');

  // Zero-Range Candle (Open = High = Low = Close = 0.2828)
  const mZero = service.calculateDerivedCandleMeasurement(0.2828, 0.2828, 0.2828, 0.2828);
  assert.equal(mZero.totalRange, 0);
  assert.equal(mZero.isZeroRangeCandle, true);
  assert.equal(mZero.bodyToRangeRatio, 0);
  assert.equal(mZero.upperWickToRangeRatio, 0);
  assert.equal(mZero.lowerWickToRangeRatio, 0);
  assert.equal(Number.isNaN(mZero.bodyToRangeRatio), false);
});

test('2. Empirical Signed Sequence Preserved Without Numerical Sorting (-4 -> +4 -> +3 -> -3 -> +2 -> -2)', () => {
  const service = SrbmprMasterResearchArchiveService.getInstance();
  const seq = service.getEmpiricalSignedSequence();
  assert.deepEqual(seq, [-4, 4, 3, -3, 2, -2]);
});

test('3. Zero vs Minus-Zero (MINUS_ZERO) Structural Distinction Never Collapsed to Numeric 0', () => {
  const service = SrbmprMasterResearchArchiveService.getInstance();
  const minusZero = service.evaluateZeroStructuralToken('MINUS_ZERO');
  const zeroBase = service.evaluateZeroStructuralToken('ZERO');

  assert.equal(minusZero.token, 'MINUS_ZERO');
  assert.equal(minusZero.collapsedToNumericZero, false);
  assert.equal(zeroBase.token, 'ZERO_BASELINE');
  assert.notEqual(minusZero.token, zeroBase.token);
});

test('4. Three Nested Containers & Asymmetric Inclusion Law (Container 3 ⊃ Container 2 ⊃ Container 1)', () => {
  const service = SrbmprMasterResearchArchiveService.getInstance();
  const { containers, inclusionProof } = service.getThreeNestedContainers();

  assert.equal(containers.length, 3);
  assert.equal(inclusionProof.container3Encloses2And1, true);
  assert.equal(inclusionProof.container2Encloses1Only, true);
  assert.equal(inclusionProof.container1EnclosesNone, true);
  assert.equal(inclusionProof.level2ContainsLevel3False, true);
  assert.equal(inclusionProof.level1ContainsLevel2False, true);
  assert.equal(inclusionProof.lawSatisfied, true);
});

test('5. Yearly Historical Recovery Manifest (2009-2026) Enforces Zero Mirror Fabrication', () => {
  const service = SrbmprMasterResearchArchiveService.getInstance();
  const manifest = service.getYearlyRecoveryManifest();

  assert.equal(manifest.length, 18); // 2009 through 2026 inclusive
  assert.equal(manifest[0].year, 2009);
  assert.equal(manifest[manifest.length - 1].year, 2026);
  for (const row of manifest) {
    assert.equal(row.mirrorFabricationUsed, false);
    assert.equal(row.replayValidatedRecords, row.leftSideCausalRecords + row.rightSideReactionRecords);
  }
});

test('6. Upcomers #720656 Same-to-Same Execution Mapper & Timeframe Mismatch Abort', () => {
  const service = SrbmprMasterResearchArchiveService.getInstance();

  // ZECUSDT 1m -> ZEC-PERP 1m ($1202 Entry, $1195 SL => $7 distance, $49.98 risk => 7.14 ZEC)
  const zecMap = service.mapSrbmprToUpcomersExecution({
    srbmprSymbol: 'ZECUSDT',
    srbmprTimeframe: '1m',
    upcomersChartTimeframe: '1m',
    direction: 'LONG',
    entryPriceUsd: 1202.0,
    stopLossPriceUsd: 1195.0,
    rrMultiplier: 1,
    permittedRiskUsd: 49.98
  });

  assert.equal(zecMap.upcomersSymbol, 'ZEC-PERP');
  assert.equal(zecMap.timeframeParityStatus, 'MATCHED_100%');
  assert.equal(zecMap.calculatedQuantityContracts, 7.14);
  assert.equal(zecMap.targetPriceUsd, 1209.0);

  // Timeframe mismatch check (1m vs 5m)
  const mismatchMap = service.mapSrbmprToUpcomersExecution({
    srbmprSymbol: 'BTCUSDT',
    srbmprTimeframe: '1m',
    upcomersChartTimeframe: '5m',
    direction: 'LONG',
    entryPriceUsd: 68450,
    stopLossPriceUsd: 68200,
    rrMultiplier: 2,
    permittedRiskUsd: 49.98
  });

  assert.equal(mismatchMap.timeframeParityStatus, 'TIMEFRAME_MISMATCH_ABORT');
});

test('7. Second Mining Pass Zero-A Audit & Universal Asset Footprint 3-Way Valuation Separation', () => {
  const rocketService = RocketEngineNoStopLossResearchService.getInstance();
  const audit = rocketService.getSecondMiningPassAuditReport();

  assert.equal(audit.axisTotalNetLossUsdt, -8.0296);
  assert.equal(audit.recovery100xAxisObjectiveUsdt, 802.96);
  assert.ok(audit.sequenceTraces.length >= 4);

  const footprintEngine = UniversalAssetFootprintEngine.getInstance();
  const assets = footprintEngine.getRegisteredAssets();
  assert.ok(assets.length >= 4);
  for (const asset of assets) {
    assert.equal(asset.valuation.newLayerMarketValue.independentFromHistoricalPrice, true);
    for (const layer of asset.authorizedLayers) {
      assert.equal(layer.srbmprAllocationPct, 25);
      assert.equal(layer.originatingProjectAllocationPct, 75);
    }
  }
});

test('8. Exact 3-Condition View Router: outside vs terminal (general full chart vs forward_test strict single candle)', () => {
  const sampleCandles: RawOhlcBar[] = [
    { index: 1, timestamp: 1000, timeFormatted: '2026-10-26 10:00:00', open: 68000, high: 68100, low: 67950, close: 68050 },
    { index: 2, timestamp: 2000, timeFormatted: '2026-10-26 10:01:00', open: 68050, high: 68250, low: 68010, close: 68200 },
    { index: 3, timestamp: 3000, timeFormatted: '2026-10-26 10:02:00', open: 68200, high: 68300, low: 68150, close: 68280 }
  ];

  // Condition 1: Outside Terminal -> External Dashboard
  const outsideRes = renderAppView('outside', 'general', sampleCandles, 1);
  assert.equal(outsideRes.viewMode, 'outside');
  assert.equal(outsideRes.bannerTitle, '--- EXTERNAL DASHBOARD / UI VIEW ---');

  // Condition 2: Inside Terminal + General Mode -> Full Chart (all 3 candles visible)
  const generalRes = renderAppView('terminal', 'general', sampleCandles, 1);
  assert.equal(generalRes.viewMode, 'terminal');
  assert.equal(generalRes.modeType, 'general');
  assert.equal(generalRes.visibleCandles.length, 3);
  assert.equal(generalRes.zeroLookAheadEnforced, false);

  // Condition 3: Inside Terminal + Forward Test Mode -> Strict Single Candle (historical_data[current_index:current_index+1])
  const forwardRes = renderAppView('terminal', 'forward_test', sampleCandles, 1);
  assert.equal(forwardRes.viewMode, 'terminal');
  assert.equal(forwardRes.modeType, 'forward_test');
  assert.equal(forwardRes.visibleCandles.length, 1);
  assert.equal(forwardRes.visibleCandles[0].index, 2);
  assert.equal(forwardRes.zeroLookAheadEnforced, true);
});
