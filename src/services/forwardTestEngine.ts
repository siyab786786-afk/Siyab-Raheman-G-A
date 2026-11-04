export interface ForwardCandle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface ForwardTestState {
  cursor: number;
  initialCursor: number;
  isPlaying: boolean;
  speedMs: number;
}

export function validateCandles(candles: readonly ForwardCandle[]): void {
  candles.forEach((candle, index) => {
    if (!Number.isFinite(candle.timestamp) || !Number.isFinite(candle.open) ||
        !Number.isFinite(candle.high) || !Number.isFinite(candle.low) ||
        !Number.isFinite(candle.close) || !Number.isFinite(candle.volume)) {
      throw new Error(`Invalid numeric candle at index ${index}`);
    }
    if (candle.high < Math.max(candle.open, candle.close) ||
        candle.low > Math.min(candle.open, candle.close) || candle.volume < 0) {
      throw new Error(`Invalid OHLC candle at index ${index}`);
    }
    if (index > 0 && candle.timestamp <= candles[index - 1].timestamp) {
      throw new Error(`Candle timestamps must be unique and ascending at index ${index}`);
    }
  });
}

export function createForwardTestState(candleCount: number, initialCursor = 0): ForwardTestState {
  if (candleCount < 1) throw new Error('At least one candle is required');
  const cursor = Math.min(Math.max(0, initialCursor), candleCount - 1);
  return { cursor, initialCursor: cursor, isPlaying: false, speedMs: 650 };
}

export function visibleCandles<T>(candles: readonly T[], state: ForwardTestState): readonly T[] {
  return candles.slice(0, state.cursor + 1);
}

export function forward(state: ForwardTestState, candleCount: number): ForwardTestState {
  const cursor = Math.min(state.cursor + 1, candleCount - 1);
  return { ...state, cursor, isPlaying: cursor < candleCount - 1 && state.isPlaying };
}

export function backward(state: ForwardTestState): ForwardTestState {
  return { ...state, cursor: Math.max(0, state.cursor - 1), isPlaying: false };
}

export function reset(state: ForwardTestState): ForwardTestState {
  return { ...state, cursor: state.initialCursor, isPlaying: false };
}

export function jumpToTimestamp(
  candles: readonly ForwardCandle[],
  state: ForwardTestState,
  timestamp: number,
): ForwardTestState {
  const index = candles.findIndex(candle => candle.timestamp === timestamp);
  if (index < 0) throw new Error('No candle exists at that exact timestamp');
  return { ...state, cursor: index, isPlaying: false };
}

export function togglePlay(state: ForwardTestState, candleCount: number): ForwardTestState {
  if (state.cursor >= candleCount - 1) return { ...state, isPlaying: false };
  return { ...state, isPlaying: !state.isPlaying };
}

