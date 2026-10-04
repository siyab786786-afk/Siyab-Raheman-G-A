export interface CycleCountRecord {
  id: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM:SS
  microCycleCount: number;
  oneSecCycleCount: number;
  oneMinCycleCount: number;
  rr: string;
  completionSecond: number;
}

export interface AggregatedCycleStats {
  totalMicroCycles: number;
  totalOneSecCycles: number;
  totalOneMinCycles: number;
  cyclesPerDay: number;
  cyclesPerYearEstimated: number;
  averageRr: number;
  records: CycleCountRecord[];
}

export class FinalCycleCountEngine {
  private static instance: FinalCycleCountEngine;
  private records: CycleCountRecord[] = [];

  public static getInstance(): FinalCycleCountEngine {
    if (!FinalCycleCountEngine.instance) {
      FinalCycleCountEngine.instance = new FinalCycleCountEngine();
      FinalCycleCountEngine.instance.seedInitialRecords();
    }
    return FinalCycleCountEngine.instance;
  }

  private seedInitialRecords() {
    const sampleDates = ['2026-10-01', '2026-10-02', '2026-10-03'];
    let idCounter = 101;

    for (const d of sampleDates) {
      for (let h = 9; h <= 16; h += 2) {
        this.records.push({
          id: `CNT-${idCounter++}`,
          date: d,
          time: `${h.toString().padStart(2, '0')}:15:00`,
          microCycleCount: Math.floor(3 + Math.random() * 5),
          oneSecCycleCount: Math.floor(2 + Math.random() * 4),
          oneMinCycleCount: Math.floor(1 + Math.random() * 3),
          rr: `1:${(2 + Math.random() * 3).toFixed(1)}`,
          completionSecond: Math.floor(15 + Math.random() * 40)
        });
      }
    }
  }

  public getAggregatedStats(): AggregatedCycleStats {
    let totalMicro = 0;
    let totalOneSec = 0;
    let totalOneMin = 0;
    let totalRrValue = 0;

    for (const r of this.records) {
      totalMicro += r.microCycleCount;
      totalOneSec += r.oneSecCycleCount;
      totalOneMin += r.oneMinCycleCount;
      const rrNum = parseFloat(r.rr.replace('1:', ''));
      totalRrValue += isNaN(rrNum) ? 2.5 : rrNum;
    }

    const uniqueDays = new Set(this.records.map(r => r.date)).size || 1;
    const avgRr = totalRrValue / (this.records.length || 1);

    return {
      totalMicroCycles: totalMicro,
      totalOneSecCycles: totalOneSec,
      totalOneMinCycles: totalOneMin,
      cyclesPerDay: Math.round(totalOneMin / uniqueDays),
      cyclesPerYearEstimated: Math.round((totalOneMin / uniqueDays) * 365),
      averageRr: Number(avgRr.toFixed(2)),
      records: this.records
    };
  }

  public addRecord(record: Omit<CycleCountRecord, 'id'>) {
    const newRec: CycleCountRecord = {
      id: `CNT-${Math.floor(1000 + Math.random() * 9000)}`,
      ...record
    };
    this.records.unshift(newRec);
    return newRec;
  }
}
