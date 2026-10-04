export type TimeZoneRatio = '1:1' | '1:2' | '1:5' | '1:10' | '1:100' | '1:1000';

export interface TimeZoneMapping {
  ratio: TimeZoneRatio;
  durationMinutes: number;
}

export const TIME_ZONE_MAP: Record<TimeZoneRatio, number> = {
  '1:1': 1,
  '1:2': 2,
  '1:5': 5,
  '1:10': 10,
  '1:100': 100,
  '1:1000': 1000 // Maximum limit = 1000 minutes
};

export interface TimeFirstAuditResult {
  eventId: string;
  entryTimestamp: number;
  entryPrice: number;
  selectedRatio: TimeZoneRatio;
  maxWindowMinutes: number;
  targetDeadlineTimestamp: number;
  actualCompletionTimestamp: number | null;
  completedWithinWindow: boolean;
  actualPriceMovement: number;
  actualRr: number;
  auditStatus: 'QUALIFIED' | 'EXPIRED_WITHOUT_COMPLETION' | 'DATA_RESOLUTION_ERROR';
  notes: string;
}

export class TimeFirstTimeZoneEngine {
  private static instance: TimeFirstTimeZoneEngine;

  public static getInstance(): TimeFirstTimeZoneEngine {
    if (!TimeFirstTimeZoneEngine.instance) {
      TimeFirstTimeZoneEngine.instance = new TimeFirstTimeZoneEngine();
    }
    return TimeFirstTimeZoneEngine.instance;
  }

  public auditTimeFirstEvent(
    eventId: string,
    entryTimestamp: number,
    entryPrice: number,
    ratio: TimeZoneRatio,
    candles: { timestamp: number; high: number; low: number; close: number }[]
  ): TimeFirstAuditResult {
    const windowMinutes = TIME_ZONE_MAP[ratio] || 1000;
    const maxWindowMs = windowMinutes * 60 * 1000;
    const deadlineTimestamp = entryTimestamp + maxWindowMs;

    // Filter candles strictly within [entryTimestamp, deadlineTimestamp]
    const windowCandles = candles.filter(c => c.timestamp >= entryTimestamp && c.timestamp <= deadlineTimestamp);

    if (windowCandles.length === 0) {
      return {
        eventId,
        entryTimestamp,
        entryPrice,
        selectedRatio: ratio,
        maxWindowMinutes: windowMinutes,
        targetDeadlineTimestamp: deadlineTimestamp,
        actualCompletionTimestamp: null,
        completedWithinWindow: false,
        actualPriceMovement: 0,
        actualRr: 0,
        auditStatus: 'DATA_RESOLUTION_ERROR',
        notes: 'No candles found in specified time window. Check time resolution and candle alignment.'
      };
    }

    // Time-First Logic: Check when target behavior completes within the time window
    // Target completion is defined by structural range completion or max excursion in window
    let completionTimestamp: number | null = null;
    let maxPriceInWindow = entryPrice;
    let minPriceInWindow = entryPrice;

    for (const c of windowCandles) {
      if (c.high > maxPriceInWindow) maxPriceInWindow = c.high;
      if (c.low < minPriceInWindow) minPriceInWindow = c.low;

      // Check if target completion threshold reached (e.g. 1% excursion or structural boundary)
      const excursion = Math.abs(c.close - entryPrice);
      if (excursion >= entryPrice * 0.002) { // 0.2% micro-target completion threshold
        completionTimestamp = c.timestamp;
        break;
      }
    }

    const actualCompletion = completionTimestamp || windowCandles[windowCandles.length - 1].timestamp;
    const completedWithin = completionTimestamp !== null && completionTimestamp <= deadlineTimestamp;
    const actualPriceMovement = Math.abs(windowCandles[windowCandles.length - 1].close - entryPrice);
    const riskDistance = entryPrice * 0.001; // $1 / micro risk reference
    const actualRr = Number((actualPriceMovement / (riskDistance || 1)).toFixed(2));

    return {
      eventId,
      entryTimestamp,
      entryPrice,
      selectedRatio: ratio,
      maxWindowMinutes: windowMinutes,
      targetDeadlineTimestamp: deadlineTimestamp,
      actualCompletionTimestamp: actualCompletion,
      completedWithinWindow: completedWithin,
      actualPriceMovement: Number(actualPriceMovement.toFixed(2)),
      actualRr,
      auditStatus: completedWithin ? 'QUALIFIED' : 'EXPIRED_WITHOUT_COMPLETION',
      notes: completedWithin 
        ? `Target behavior successfully completed within ${windowMinutes}-minute window at timestamp ${new Date(actualCompletion).toISOString()}` 
        : `Target behavior did not complete within the strict ${windowMinutes}-minute time window.`
    };
  }
}
