import test from 'node:test';
import assert from 'node:assert/strict';
import {
  backward, createForwardTestState, forward, jumpToTimestamp, reset,
  togglePlay, validateCandles, visibleCandles,
} from './forwardTestEngine.ts';

const candles = Array.from({ length: 6 }, (_, index) => ({
  timestamp: 1_700_000_000_000 + index * 60_000,
  open: 100 + index,
  high: 102 + index,
  low: 99 + index,
  close: 101 + index,
  volume: 10 + index,
}));

test('only exposes candles at or before the reveal cursor', () => {
  const state = createForwardTestState(candles.length, 1);
  const revealed = visibleCandles(candles, state);
  assert.deepEqual(revealed.map(c => c.timestamp), candles.slice(0, 2).map(c => c.timestamp));
  assert.equal(revealed.some(c => c.timestamp > candles[1].timestamp), false);
});

test('forward and backward move exactly one candle without lookahead', () => {
  const initial = createForwardTestState(candles.length, 2);
  const next = forward(initial, candles.length);
  assert.equal(next.cursor, 3);
  assert.equal(visibleCandles(candles, next).at(-1)?.timestamp, candles[3].timestamp);
  assert.equal(backward(next).cursor, 2);
});

test('reset restores the frozen starting boundary', () => {
  const initial = createForwardTestState(candles.length, 2);
  assert.equal(reset(forward(initial, candles.length)).cursor, 2);
});

test('timestamp navigation requires an exact candle timestamp', () => {
  const state = createForwardTestState(candles.length);
  assert.equal(jumpToTimestamp(candles, state, candles[4].timestamp).cursor, 4);
  assert.throws(() => jumpToTimestamp(candles, state, candles[4].timestamp + 1), /exact timestamp/);
});

test('play cannot cross the final candle', () => {
  const final = createForwardTestState(candles.length, candles.length - 1);
  assert.equal(togglePlay(final, candles.length).isPlaying, false);
  assert.equal(forward(final, candles.length).cursor, candles.length - 1);
});

test('rejects malformed, duplicate and non-monotonic OHLC data', () => {
  validateCandles(candles);
  assert.throws(() => validateCandles([{ ...candles[0], high: 90 }]), /Invalid OHLC/);
  assert.throws(() => validateCandles([candles[0], { ...candles[1], timestamp: candles[0].timestamp }]), /unique and ascending/);
});

