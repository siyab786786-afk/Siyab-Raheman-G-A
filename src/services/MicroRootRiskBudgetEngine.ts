export interface MicroSequenceTick {
  timestamp: number;
  price: number;
  type: 'HIGH' | 'LOW' | 'REGULAR';
}

export interface MicroCycle {
  id: string;
  high1: MicroSequenceTick;
  low: MicroSequenceTick;
  high2: MicroSequenceTick;
  completedAt: number;
  durationMs: number;
  status: 'COMPLETE' | 'INCOMPLETE';
}

export interface GranularCandle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  lastMicroClosePrice: number;
  microSequence: MicroSequenceTick[];
  verifiedCycles: MicroCycle[];
}

export interface RiskBudgetConfiguration {
  accountSize: number;
  riskPercentage: number; // e.g., 0.1 for 0.1%, 0.5 for 0.5%
  calculatedRiskValue: number;
}

export interface LiveReplayTrade {
  id: string;
  timestamp: number;
  entryPrice: number;
  slPrice: number;
  targetPrice: number;
  rrMultiple: number;
  positionSize: number;
  actualPriceMovement: number;
  status: 'LOCKED' | 'RUNNING' | 'COMPLETED' | 'STOPPED_OUT';
  pnl: number;
  durationSeconds: number;
  testingPhase: 'REPLAY_TEST' | 'FORWARD_TEST' | 'BACK_TEST';
}

export class MicroRootRiskBudgetEngine {
  private static instance: MicroRootRiskBudgetEngine;

  private accountSize: number = 100000;
  private riskPercentage: number = 0.5; // 0.5% default

  // Historical simulation sequence for MICRO -> 1 SECOND -> 1 MINUTE
  private microTicks: MicroSequenceTick[] = [];
  private currentCandles1S: GranularCandle[] = [];
  private currentCandles1M: GranularCandle[] = [];
  private activeTrade: LiveReplayTrade | null = null;
  private completedTrades: LiveReplayTrade[] = [];

  public static getInstance(): MicroRootRiskBudgetEngine {
    if (!MicroRootRiskBudgetEngine.instance) {
      MicroRootRiskBudgetEngine.instance = new MicroRootRiskBudgetEngine();
      MicroRootRiskBudgetEngine.instance.initializeSimulationData();
    }
    return MicroRootRiskBudgetEngine.instance;
  }

  public setRiskConfig(accountSize: number, riskPercentage: number) {
    this.accountSize = accountSize;
    this.riskPercentage = riskPercentage;
  }

  public getRiskConfig(): RiskBudgetConfiguration {
    return {
      accountSize: this.accountSize,
      riskPercentage: this.riskPercentage,
      calculatedRiskValue: (this.accountSize * this.riskPercentage) / 100
    };
  }

  private initializeSimulationData() {
    // Populate raw simulation of micro sequences to build 1-second and 1-minute layers
    const startPrice = 67420.50;
    const now = Date.now();
    
    // Simulate 300 micro ticks (every 100ms corresponds to a tick)
    for (let i = 0; i < 300; i++) {
      const time = now - (300 - i) * 100;
      const noise = (Math.sin(i / 1.5) * 0.8) + (Math.cos(i / 4) * 0.5);
      const isHigh = i > 0 && i < 299 && noise > 0.8;
      const isLow = i > 0 && i < 299 && noise < -0.8;
      
      this.microTicks.push({
        timestamp: time,
        price: Number((startPrice + noise).toFixed(2)),
        type: isHigh ? 'HIGH' : isLow ? 'LOW' : 'REGULAR'
      });
    }

    // Build 1-second candles (10 micro ticks each)
    for (let s = 0; s < 30; s++) {
      const chunk = this.microTicks.slice(s * 10, (s + 1) * 10);
      if (chunk.length === 0) continue;
      
      const prices = chunk.map(t => t.price);
      const high = Math.max(...prices);
      const low = Math.min(...prices);
      const open = prices[0];
      const close = prices[prices.length - 1];
      const lastMicroClosePrice = chunk[chunk.length - 1].price;

      // Extract verified High -> Low -> High cycles within this second
      const verifiedCycles = this.findCyclesInSequence(chunk);

      this.currentCandles1S.push({
        timestamp: chunk[0].timestamp,
        open,
        high,
        low,
        close,
        lastMicroClosePrice,
        microSequence: chunk,
        verifiedCycles
      });
    }

    // Build 1-minute candles (60 1-second candles per minute, here scaled to match simulation length)
    for (let m = 0; m < 5; m++) {
      const chunk1S = this.currentCandles1S.slice(m * 6, (m + 1) * 6);
      if (chunk1S.length === 0) continue;

      const prices = chunk1S.map(c => c.close);
      const high = Math.max(...chunk1S.map(c => c.high));
      const low = Math.min(...chunk1S.map(c => c.low));
      const open = chunk1S[0].open;
      const close = chunk1S[chunk1S.length - 1].close;

      const microSeqMerged = chunk1S.flatMap(c => c.microSequence);
      const verifiedCycles = this.findCyclesInSequence(microSeqMerged);

      this.currentCandles1M.push({
        timestamp: chunk1S[0].timestamp,
        open,
        high,
        low,
        close,
        lastMicroClosePrice: chunk1S[chunk1S.length - 1].lastMicroClosePrice,
        microSequence: microSeqMerged,
        verifiedCycles
      });
    }
  }

  private findCyclesInSequence(ticks: MicroSequenceTick[]): MicroCycle[] {
    const cycles: MicroCycle[] = [];
    let h1: MicroSequenceTick | null = null;
    let low: MicroSequenceTick | null = null;

    ticks.forEach((tick, i) => {
      if (tick.type === 'HIGH') {
        if (!h1) {
          h1 = tick;
        } else if (low && !h1) {
          // Restart loop
          h1 = tick;
          low = null;
        } else if (low && h1) {
          // Completed Cycle! High -> Low -> High
          cycles.push({
            id: `CYC-M-${i}-${Math.floor(1000 + Math.random() * 9000)}`,
            high1: h1,
            low,
            high2: tick,
            completedAt: tick.timestamp,
            durationMs: tick.timestamp - h1.timestamp,
            status: 'COMPLETE'
          });
          h1 = tick;
          low = null;
        }
      } else if (tick.type === 'LOW') {
        if (h1 && !low) {
          low = tick;
        }
      }
    });

    return cycles;
  }

  public get1SCandles(): GranularCandle[] {
    return this.currentCandles1S;
  }

  public get1MCandles(): GranularCandle[] {
    return this.currentCandles1M;
  }

  public getMicroTicks(): MicroSequenceTick[] {
    return this.microTicks;
  }

  public getActiveTrade(): LiveReplayTrade | null {
    return this.activeTrade;
  }

  public getCompletedTrades(): LiveReplayTrade[] {
    return this.completedTrades;
  }

  public triggerTradeExecution(livePrice: number, rrMultiple: number, phase: 'REPLAY_TEST' | 'FORWARD_TEST' | 'BACK_TEST') {
    const config = this.getRiskConfig();
    
    // SL structure is exactly 1:1 of 1-second candle range (or reference distance = $1.00)
    const slDistance = 1.00; 
    const positionSize = config.calculatedRiskValue / slDistance;
    
    const targetPrice = livePrice + (slDistance * rrMultiplierToTargetValue(rrMultiple));

    const newTrade: LiveReplayTrade = {
      id: `TRD-${Math.floor(10000 + Math.random() * 90000)}`,
      timestamp: Date.now(),
      entryPrice: livePrice,
      slPrice: livePrice - slDistance,
      targetPrice,
      rrMultiple,
      positionSize,
      actualPriceMovement: 0,
      status: 'LOCKED',
      pnl: 0,
      durationSeconds: 0,
      testingPhase: phase
    };

    this.activeTrade = newTrade;
    return newTrade;
  }

  public updateActiveTradePrice(currentPrice: number) {
    if (!this.activeTrade) return;

    const t = this.activeTrade;
    t.status = 'RUNNING';
    const movement = currentPrice - t.entryPrice;
    t.actualPriceMovement = Number(movement.toFixed(2));
    
    // P&L = Position Size * Price Movement
    t.pnl = Number((t.positionSize * movement).toFixed(2));
    t.durationSeconds += 1;

    // Check target hit or SL hit
    if (currentPrice >= t.targetPrice) {
      t.status = 'COMPLETED';
      t.actualPriceMovement = t.targetPrice - t.entryPrice;
      t.pnl = Number((t.positionSize * t.actualPriceMovement).toFixed(2));
      this.completedTrades.unshift({ ...t });
      this.activeTrade = null;
    } else if (currentPrice <= t.slPrice) {
      t.status = 'STOPPED_OUT';
      t.actualPriceMovement = t.slPrice - t.entryPrice;
      t.pnl = Number((t.positionSize * t.actualPriceMovement).toFixed(2));
      this.completedTrades.unshift({ ...t });
      this.activeTrade = null;
    }
  }
}

function rrMultiplierToTargetValue(multiple: number): number {
  return multiple;
}
