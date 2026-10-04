export interface MicroOrigin {
  id: string;
  timestamp: number;
  price: number;
  validated: boolean;
}

export interface SixtySecondCycleResult {
  cycleId: string;
  microOrigin: MicroOrigin;
  windowDurationSeconds: number; // strictly 60 seconds
  completionTimestamp: number;
  targetCompleted: boolean;
  actualPriceMovement: number;
  actualRr: number;
  status: 'MICRO_ORIGIN_ACTIVE' | '60S_COMPLETED' | 'TARGET_QUALIFIED' | 'NO_MICRO_ABORT';
}

export class Micro60SecondExecutionEngine {
  private static instance: Micro60SecondExecutionEngine;

  public static getInstance(): Micro60SecondExecutionEngine {
    if (!Micro60SecondExecutionEngine.instance) {
      Micro60SecondExecutionEngine.instance = new Micro60SecondExecutionEngine();
    }
    return Micro60SecondExecutionEngine.instance;
  }

  public evaluateMicroCycle(
    currentMicro: MicroOrigin | null,
    livePrice: number,
    currentTime: number
  ): SixtySecondCycleResult {
    // Hard Rule: NO MICRO = NO START
    if (!currentMicro || !currentMicro.validated) {
      return {
        cycleId: 'CYC-NULL',
        microOrigin: { id: 'NONE', timestamp: currentTime, price: livePrice, validated: false },
        windowDurationSeconds: 60,
        completionTimestamp: currentTime,
        targetCompleted: false,
        actualPriceMovement: 0,
        actualRr: 0,
        status: 'NO_MICRO_ABORT'
      };
    }

    const elapsedSeconds = Math.floor((currentTime - currentMicro.timestamp) / 1000);
    const sixtySecComplete = elapsedSeconds >= 60;

    // Time-First Logic: Time = 60 Seconds -> Target Completion -> Price Movement -> RR Result
    const priceMovement = Number((livePrice - currentMicro.price).toFixed(2));
    const riskDistance = 1.00; // $1 micro risk reference
    const rr = Number((Math.abs(priceMovement) / riskDistance).toFixed(2));
    const targetCompleted = Math.abs(priceMovement) >= 0.50; // micro completion threshold

    return {
      cycleId: `CYC-MICRO-${currentMicro.id}`,
      microOrigin: currentMicro,
      windowDurationSeconds: 60,
      completionTimestamp: currentMicro.timestamp + 60000,
      targetCompleted,
      actualPriceMovement: priceMovement,
      actualRr: rr,
      status: targetCompleted ? 'TARGET_QUALIFIED' : sixtySecComplete ? '60S_COMPLETED' : 'MICRO_ORIGIN_ACTIVE'
    };
  }
}
