import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  SrbmprRawDataMeasurementService,
  CRYPTO_100_HIGH_VOLUME_SYMBOLS,
} from '../src/services/SrbmprRawDataMeasurementService';
import { RawOhlcBar } from '../src/services/SrbmprForwardTestEngine';

describe('SRBMPR Raw-Data Measurement Tool & Micro-Candle Research Terminal', () => {
  const service = SrbmprRawDataMeasurementService.getInstance();

  const sampleBars: RawOhlcBar[] = Array.from({ length: 25 }, (_, i) => {
    const baseTime = Date.UTC(2026, 9, 20, 12, 0, 0) + i * 60_000;
    const open = 100 + i * 0.5;
    const close = i % 3 === 0 ? open - 0.3 : open + 0.8;
    const high = Math.max(open, close) + 0.4;
    const low = Math.min(open, close) - 0.25;
    return {
      index: i + 1,
      timestamp: baseTime,
      timeFormatted: new Date(baseTime).toISOString().replace('T', ' ').slice(0, 19),
      open,
      high,
      low,
      close,
      volume: 1500 + i * 100,
    };
  });

  test('1. Derives exact mathematical measurements and Zero roles from raw OHLC bars without fabricating prices', () => {
    const measurements = service.buildMeasurementsFromRawBars(
      sampleBars,
      'AXISUSDT',
      '1m',
      24,
      false
    );
    assert.equal(measurements.length, 25);

    const first = measurements[0];
    assert.equal(first.symbol, 'AXISUSDT');
    assert.equal(first.timeframe, '1m');
    assert.equal(first.open, sampleBars[0].open);
    assert.equal(first.high, sampleBars[0].high);
    assert.equal(first.low, sampleBars[0].low);
    assert.equal(first.close, sampleBars[0].close);
    assert.equal(first.totalRange, Number((sampleBars[0].high - sampleBars[0].low).toFixed(3)));
    assert.equal(first.provenance, 'HISTORICAL_VERIFIED');
    assert.ok(first.precedingStartArrayIndex <= first.arrayIndex);
  });

  test('2. Preserves original raw OHLC while recording separate researcher correction notes', () => {
    const measurementsBefore = service.buildMeasurementsFromRawBars(
      sampleBars,
      'AXISUSDT',
      '1m',
      24,
      false
    );
    const target = measurementsBefore[10];
    const originalClose = target.close;

    service.recordMeasurementCorrection(
      target.measurementId,
      'Verified Minus-Zero extension prior to Mid-Zone connection; raw OHLC preserved.'
    );

    const measurementsAfter = service.buildMeasurementsFromRawBars(
      sampleBars,
      'AXISUSDT',
      '1m',
      24,
      false
    );
    const updatedTarget = measurementsAfter[10];
    assert.equal(updatedTarget.close, originalClose, 'Raw close price must remain immutable');
    assert.equal(
      updatedTarget.researcherCorrectionNote,
      'Verified Minus-Zero extension prior to Mid-Zone connection; raw OHLC preserved.'
    );
    assert.ok(updatedTarget.correctedAtUtc);
  });

  test('3. Converts displayed time across timezones without altering underlying UTC timestamp', () => {
    const utcMs = Date.UTC(2026, 9, 20, 12, 0, 0);
    const utcStr = service.formatTimestampInTimezone(utcMs, 'UTC');
    const istStr = service.formatTimestampInTimezone(utcMs, 'Asia/Kolkata');
    const gstStr = service.formatTimestampInTimezone(utcMs, 'Asia/Dubai');

    assert.ok(utcStr.includes('12:00:00') && utcStr.includes('UTC'));
    assert.ok(istStr.includes('17:30:00') && istStr.includes('IST'));
    assert.ok(gstStr.includes('16:00:00') && gstStr.includes('GST'));
  });

  test('4. Backward date search locates preceding sequence or reports exact missing archive range', () => {
    const measurements = service.buildMeasurementsFromRawBars(
      sampleBars,
      'AXISUSDT',
      '1m',
      24,
      false
    );

    // Search within loaded range
    const foundResult = service.investigateDateAndBackwardSequence(
      '2026-10-20 12:15:00',
      measurements,
      'AXISUSDT',
      '1m'
    );
    assert.equal(foundResult.foundExactOrNearest, true);
    assert.equal(foundResult.matchedCandle?.arrayIndex, 15);
    assert.ok(foundResult.precedingSequenceCandles.length >= 10);

    // Search before earliest loaded candle -> must report missing archive range honestly
    const missingResult = service.investigateDateAndBackwardSequence(
      '2025-01-01 00:00:00',
      measurements,
      'AXISUSDT',
      '1m'
    );
    assert.equal(missingResult.foundExactOrNearest, false);
    assert.ok(missingResult.missingDataReport?.includes('MISSING ARCHIVE RANGE'));
  });

  test('5. 100-Coin High-Volume Crypto Universe manifest tracks pure crypto perpetuals and honest 100k shortfall', () => {
    assert.equal(CRYPTO_100_HIGH_VOLUME_SYMBOLS.length, 100);
    const manifest = service.get100CryptoArchiveManifest('AXISUSDT', 1000);
    assert.equal(manifest.length, 100);

    const axisEntry = manifest.find((m) => m.symbol === 'AXISUSDT');
    assert.ok(axisEntry, 'AXISUSDT must be present in the 100-coin crypto manifest');
    assert.equal(axisEntry.marketSource, 'Bybit V5 Linear Perp');
    assert.equal(axisEntry.loadedArchiveCandles, 1000);
    assert.equal(axisEntry.targetArchiveCandles, 100_000);
    assert.equal(axisEntry.shortfallCandles, 99_000);
    assert.ok(axisEntry.exchangeListingDateUtc.includes('2026-10-01'));
  });

  test('6. Provides complete 9-point repository & chart stability diagnostic report', () => {
    const report = service.getRepositoryDiagnosticReport('AXISUSDT', '1m', 1000, 12);
    assert.ok(report.availableRawDatasets.length >= 3);
    assert.ok(report.chartStabilityRootCauseAndFix.implementedFix.includes('lockedMinPrice'));
    assert.equal(report.replayVerificationSummary.deterministicMatch, true);
    assert.equal(report.replayVerificationSummary.scaleDriftDuringStepping, 0);
  });
});
