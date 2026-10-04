import {
  RawDataRecord,
  CycleTableRecord,
  DailyCountRecord,
  RrCompletionRecord,
  RAW_DATA_CSV_HEADER,
  CYCLES_CSV_HEADER,
  DAILY_COUNTS_CSV_HEADER,
  RR_COMPLETION_CSV_HEADER
} from '../types/databaseSchema';

export class CountFirstCycleEngine {
  private static instance: CountFirstCycleEngine;
  private rawData: RawDataRecord[] = [];
  private cycles: CycleTableRecord[] = [];
  private dailyCounts: DailyCountRecord[] = [];
  private rrCompletion: RrCompletionRecord[] = [];

  public static getInstance(): CountFirstCycleEngine {
    if (!CountFirstCycleEngine.instance) {
      CountFirstCycleEngine.instance = new CountFirstCycleEngine();
      CountFirstCycleEngine.instance.seedSchemaData();
    }
    return CountFirstCycleEngine.instance;
  }

  private seedSchemaData() {
    const source_id = 'src-zec-01';
    const asset = 'ZECUSDT';
    const date = '2026-10-03';
    const timezone = 'UTC';

    // Seed Cycles
    for (let i = 1; i <= 10; i++) {
      const isComplete = i !== 4; // 4th is incomplete
      const layer = i % 3 === 0 ? 'MICRO' : i % 3 === 1 ? '1S' : '1M';
      const cycle_id = `cyc-${layer.toLowerCase()}-${100 + i}`;
      
      const high_1_time = `${date}T09:${(i * 4).toString().padStart(2, '0')}:00Z`;
      const low_time = `${date}T09:${(i * 4 + 1).toString().padStart(2, '0')}:15Z`;
      const high_2_time = isComplete ? `${date}T09:${(i * 4 + 2).toString().padStart(2, '0')}:30Z` : '';

      const cycleRec: CycleTableRecord = {
        cycle_id,
        asset,
        source_id,
        layer: layer as any,
        date,
        timezone,
        high_1_time,
        high_1_price: 65200 + i * 10,
        low_time,
        low_price: 65150 + i * 10,
        high_2_time,
        high_2_price: isComplete ? 65240 + i * 10 : 0,
        duration_seconds: isComplete ? 30 : 15,
        parent_cycle_id: null,
        raw_row_start: i * 10,
        raw_row_end: i * 10 + 5,
        status: isComplete ? 'COMPLETE' : 'INCOMPLETE',
        methodology_version: 'SRBMPR-COUNT-v1.0'
      };

      this.cycles.push(cycleRec);

      // Populate RR & Completion ONLY if COMPLETE
      if (isComplete) {
        this.rrCompletion.push({
          cycle_id,
          entry_reference: cycleRec.low_price + 5,
          sl_reference: cycleRec.low_price,
          target_reference: cycleRec.high_2_price,
          rr_1_1_status: 'HIT',
          rr_1_2_status: i % 2 === 0 ? 'HIT' : 'NOT_REACHED',
          rr_1_3_status: 'NOT_REACHED',
          completion_seconds: 28.5,
          target_hit_order: '1.1->1.2',
          status: 'COMPLETE'
        });
      }
    }

    // Seed Daily Count
    this.dailyCounts.push({
      date,
      asset,
      source_id,
      micro_complete_cycles: 3,
      second_complete_cycles: 3,
      minute_complete_cycles: 3,
      micro_incomplete_cycles: 1,
      second_incomplete_cycles: 0,
      minute_incomplete_cycles: 0,
      data_gap_count: 1
    });
  }

  public getCycles(): CycleTableRecord[] {
    return this.cycles;
  }

  public getRrCompletions(): RrCompletionRecord[] {
    return this.rrCompletion;
  }

  public getDailyCount(): DailyCountRecord {
    return this.dailyCounts[0];
  }

  public scanRawHistoricalCandles(
    asset: string,
    layer: 'MICRO' | '1S' | '1M',
    rawCandles: { timestamp: number; open: number; high: number; low: number; close: number; volume?: number }[]
  ): { scanned: number; completeCycles: CycleTableRecord[]; incompleteCycles: CycleTableRecord[] } {
    const completeCycles: CycleTableRecord[] = [];
    const incompleteCycles: CycleTableRecord[] = [];

    let state: 0 | 1 | 2 = 0;
    let h1Time = '';
    let h1Price = 0;
    let lowTime = '';
    let lowPrice = 0;
    let startIdx = 0;

    for (let i = 0; i < rawCandles.length; i++) {
      const c = rawCandles[i];
      const isoTime = new Date(c.timestamp).toISOString();

      if (state === 0) {
        // High 1: Local peak
        if (i > 0 && i < rawCandles.length - 1 && c.high > rawCandles[i - 1].high && c.high >= rawCandles[i + 1].high) {
          h1Time = isoTime;
          h1Price = c.high;
          startIdx = i;
          state = 1;
        }
      } else if (state === 1) {
        // Low: Lowest trough following High 1
        if (c.low < h1Price && (i === rawCandles.length - 1 || c.low <= rawCandles[i + 1].low)) {
          lowTime = isoTime;
          lowPrice = c.low;
          state = 2;
        }
      } else if (state === 2) {
        // High 2: Subsequent peak
        if (c.high > lowPrice) {
          const h2Time = isoTime;
          const h2Price = c.high;
          const durationSeconds = Math.max(1, Math.round((c.timestamp - rawCandles[startIdx].timestamp) / 1000));

          const record: CycleTableRecord = {
            cycle_id: `cyc-${layer.toLowerCase()}-${Math.floor(10000 + Math.random() * 90000)}`,
            asset,
            source_id: 'BYBIT_MAINNET_V5',
            layer,
            date: isoTime.split('T')[0],
            timezone: 'UTC',
            high_1_time: h1Time,
            high_1_price: h1Price,
            low_time: lowTime,
            low_price: lowPrice,
            high_2_time: h2Time,
            high_2_price: h2Price,
            duration_seconds: durationSeconds,
            parent_cycle_id: null,
            raw_row_start: startIdx,
            raw_row_end: i,
            status: 'COMPLETE',
            methodology_version: 'SRBMPR-COUNT-v1.0'
          };

          completeCycles.push(record);
          this.cycles.unshift(record);

          // Populate RR record
          this.rrCompletion.unshift({
            cycle_id: record.cycle_id,
            entry_reference: lowPrice + 1.00,
            sl_reference: lowPrice,
            target_reference: h2Price,
            rr_1_1_status: 'HIT',
            rr_1_2_status: h2Price >= lowPrice + 2.00 ? 'HIT' : 'NOT_REACHED',
            rr_1_3_status: h2Price >= lowPrice + 3.00 ? 'HIT' : 'NOT_REACHED',
            completion_seconds: durationSeconds,
            target_hit_order: '1.1->1.2',
            status: 'COMPLETE'
          });

          // Reset to find next cycle
          state = 0;
        }
      }
    }

    // If state left at 1 or 2, record incomplete cycle
    if (state > 0) {
      const incompleteRecord: CycleTableRecord = {
        cycle_id: `cyc-${layer.toLowerCase()}-inc-${Math.floor(1000 + Math.random() * 9000)}`,
        asset,
        source_id: 'BYBIT_MAINNET_V5',
        layer,
        date: new Date().toISOString().split('T')[0],
        timezone: 'UTC',
        high_1_time: h1Time,
        high_1_price: h1Price,
        low_time: lowTime || 'PENDING',
        low_price: lowPrice || 0,
        high_2_time: 'MISSING',
        high_2_price: 0,
        duration_seconds: 0,
        parent_cycle_id: null,
        raw_row_start: startIdx,
        raw_row_end: rawCandles.length - 1,
        status: 'INCOMPLETE',
        methodology_version: 'SRBMPR-COUNT-v1.0'
      };
      incompleteCycles.push(incompleteRecord);
      this.cycles.unshift(incompleteRecord);
    }

    // Update Daily Counts
    if (this.dailyCounts.length > 0) {
      if (layer === 'MICRO') {
        this.dailyCounts[0].micro_complete_cycles += completeCycles.length;
        this.dailyCounts[0].micro_incomplete_cycles += incompleteCycles.length;
      } else if (layer === '1S') {
        this.dailyCounts[0].second_complete_cycles += completeCycles.length;
        this.dailyCounts[0].second_incomplete_cycles += incompleteCycles.length;
      } else if (layer === '1M') {
        this.dailyCounts[0].minute_complete_cycles += completeCycles.length;
        this.dailyCounts[0].minute_incomplete_cycles += incompleteCycles.length;
      }
    }

    return { scanned: rawCandles.length, completeCycles, incompleteCycles };
  }

  public exportTableCsv(tableName: 'raw_data' | 'cycles' | 'daily_counts' | 'rr_completion'): string {
    if (tableName === 'cycles') {
      const rows = this.cycles.map(c => [
        c.cycle_id, c.asset, c.source_id, c.layer, c.date, c.timezone,
        c.high_1_time, c.high_1_price, c.low_time, c.low_price,
        c.high_2_time, c.high_2_price, c.duration_seconds, c.parent_cycle_id || '',
        c.raw_row_start, c.raw_row_end, c.status, c.methodology_version
      ]);
      return [CYCLES_CSV_HEADER, ...rows.map(r => r.join(','))].join('\n');
    } else if (tableName === 'rr_completion') {
      const rows = this.rrCompletion.map(r => [
        r.cycle_id, r.entry_reference, r.sl_reference, r.target_reference,
        r.rr_1_1_status, r.rr_1_2_status, r.rr_1_3_status, r.completion_seconds,
        r.target_hit_order || '', r.status
      ]);
      return [RR_COMPLETION_CSV_HEADER, ...rows.map(r => r.join(','))].join('\n');
    } else if (tableName === 'daily_counts') {
      const rows = this.dailyCounts.map(d => [
        d.date, d.asset, d.source_id, d.micro_complete_cycles, d.second_complete_cycles,
        d.minute_complete_cycles, d.micro_incomplete_cycles, d.second_incomplete_cycles,
        d.minute_incomplete_cycles, d.data_gap_count
      ]);
      return [DAILY_COUNTS_CSV_HEADER, ...rows.map(r => r.join(','))].join('\n');
    } else {
      return RAW_DATA_CSV_HEADER;
    }
  }
}
