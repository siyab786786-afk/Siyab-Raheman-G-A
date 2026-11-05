// ============================================================================
// SRBMPR — EXACT VIEW MODE & SINGLE-CANDLE FORWARD TEST ROUTER
// Direct TypeScript implementation of the exact 3-condition routing architecture:
// 1. view_mode === 'outside'  -> External Dashboard / Research UI
// 2. view_mode === 'terminal' & mode_type === 'general' -> Full Chart in Terminal (Unlocked Live)
// 3. view_mode === 'terminal' & mode_type === 'forward_test' -> Strict Single-Candle View
//    (single_candle = historical_data.slice(current_index, current_index + 1), Zero look-ahead error)
// ============================================================================

import { RawOhlcBar } from './SrbmprForwardTestEngine';

export type SrbmprViewMode = 'terminal' | 'outside';
export type SrbmprModeType = 'general' | 'forward_test';

export interface SrbmprRoutedViewResult {
  viewMode: SrbmprViewMode;
  modeType: SrbmprModeType;
  bannerTitle: string;
  visibleCandles: RawOhlcBar[];
  activeSingleCandle: RawOhlcBar | null;
  totalCandlesInBuffer: number;
  currentIndex: number;
  zeroLookAheadEnforced: boolean;
}

/**
 * Exact implementation of `render_app_view(view_mode, mode_type, historical_data, current_index)`
 */
export function renderAppView(
  viewMode: SrbmprViewMode,
  modeType: SrbmprModeType,
  historicalData: RawOhlcBar[],
  currentIndex: number
): SrbmprRoutedViewResult {
  const safeData = Array.isArray(historicalData) ? historicalData : [];
  const clampedIndex =
    safeData.length > 0
      ? Math.max(0, Math.min(safeData.length - 1, currentIndex))
      : 0;

  // 1. Terminal ke bahar (Dashboard / External UI)
  if (viewMode === 'outside') {
    return renderExternalDashboard(safeData, clampedIndex, modeType);
  }

  // 2. Terminal ke andar
  if (modeType === 'forward_test') {
    // Forward Test Mode: Strict single-candle rule (Zero look-ahead error)
    // single_candle = historical_data[current_index:current_index+1]
    const singleCandleSlice = safeData.slice(clampedIndex, clampedIndex + 1);
    return renderTerminalSingleCandle(singleCandleSlice, safeData.length, clampedIndex);
  }

  // General Chart Mode: Poora chart terminal mein dikhega
  return renderTerminalFullChart(safeData, clampedIndex);
}

export function renderTerminalSingleCandle(
  singleCandleSlice: RawOhlcBar[],
  totalCandles: number,
  currentIndex: number
): SrbmprRoutedViewResult {
  const activeCandle = singleCandleSlice[0] || null;
  return {
    viewMode: 'terminal',
    modeType: 'forward_test',
    bannerTitle: '--- FORWARD TEST TERMINAL VIEW --- [Strict Single-Candle Rule: historical_data[current_index:current_index+1]]',
    visibleCandles: singleCandleSlice,
    activeSingleCandle: activeCandle,
    totalCandlesInBuffer: totalCandles,
    currentIndex,
    zeroLookAheadEnforced: true
  };
}

export function renderTerminalFullChart(
  data: RawOhlcBar[],
  currentIndex: number
): SrbmprRoutedViewResult {
  const latestCandle = data.length > 0 ? data[data.length - 1] : null;
  return {
    viewMode: 'terminal',
    modeType: 'general',
    bannerTitle: `--- FULL TERMINAL CHART VIEW --- Total Candles: ${data.length}`,
    visibleCandles: data,
    activeSingleCandle: latestCandle,
    totalCandlesInBuffer: data.length,
    currentIndex,
    zeroLookAheadEnforced: false
  };
}

export function renderExternalDashboard(
  data: RawOhlcBar[],
  currentIndex: number,
  modeType: SrbmprModeType
): SrbmprRoutedViewResult {
  const activeCandle = data[currentIndex] || data[data.length - 1] || null;
  return {
    viewMode: 'outside',
    modeType,
    bannerTitle: '--- EXTERNAL DASHBOARD / UI VIEW ---',
    visibleCandles: data,
    activeSingleCandle: activeCandle,
    totalCandlesInBuffer: data.length,
    currentIndex,
    zeroLookAheadEnforced: modeType === 'forward_test'
  };
}
