export interface LeverageLevelState {
  level: number; // 1x to 6x (Level 1 to 6)
  leverageMultiplier: number;
  entryPrice: number;
  protectiveSlPrice: number;
  positionSize: number;
  actualDollarRiskAtSl: number;
  protectedProfit: number;
  targetPrice: number;
  remainingDistance: number;
  marginRequired: number;
  liquidationPrice: number;
  status: 'ACTIVE' | 'ADVANCED' | 'TRIGGERED' | 'LOCKED';
}

export class LeverageProgressionEngine {
  private static instance: LeverageProgressionEngine;

  public static getInstance(): LeverageProgressionEngine {
    if (!LeverageProgressionEngine.instance) {
      LeverageProgressionEngine.instance = new LeverageProgressionEngine();
    }
    return LeverageProgressionEngine.instance;
  }

  public calculateProgression(
    currentPrice: number,
    baseEntry: number,
    baseSize: number,
    targetPrice: number,
    currentLevel: number = 1
  ): LeverageLevelState[] {
    const levels: LeverageLevelState[] = [];
    const clampedLevel = Math.max(1, Math.min(6, currentLevel));

    for (let i = 1; i <= 6; i++) {
      const mult = i; // 1x, 2x, 3x, 4x, 5x, 6x
      const sizeAtLevel = baseSize * mult;
      
      // Progression of entry and protective stop based on SRBMPR sequence advancement
      const stepDistance = Math.abs(targetPrice - baseEntry) / 6;
      const entryAtLevel = baseEntry + (i - 1) * (stepDistance * 0.2);
      
      // Protective stop advances progressively to lock in profit / protect capital
      const protectiveSl = i === 1 
        ? baseEntry - (stepDistance * 0.5) 
        : baseEntry + (i - 2) * (stepDistance * 0.3);

      const slDistance = Math.abs(entryAtLevel - protectiveSl);
      const actualDollarRisk = sizeAtLevel * slDistance;
      const protectedProfit = i > 1 ? (entryAtLevel - baseEntry) * sizeAtLevel * 0.5 : 0;
      const remainingDistance = Math.abs(targetPrice - currentPrice);
      const marginReq = (entryAtLevel * sizeAtLevel) / (mult * 10);
      const liquidationPrice = entryAtLevel * (1 - (0.9 / mult));

      let status: 'ACTIVE' | 'ADVANCED' | 'TRIGGERED' | 'LOCKED' = 'LOCKED';
      if (i < clampedLevel) status = 'ADVANCED';
      else if (i === clampedLevel) status = 'ACTIVE';
      else status = 'LOCKED';

      levels.push({
        level: i,
        leverageMultiplier: mult,
        entryPrice: Number(entryAtLevel.toFixed(2)),
        protectiveSlPrice: Number(protectiveSl.toFixed(2)),
        positionSize: Number(sizeAtLevel.toFixed(4)),
        actualDollarRiskAtSl: Number(actualDollarRisk.toFixed(2)),
        protectedProfit: Number(protectedProfit.toFixed(2)),
        targetPrice: Number(targetPrice.toFixed(2)),
        remainingDistance: Number(remainingDistance.toFixed(2)),
        marginRequired: Number(marginReq.toFixed(2)),
        liquidationPrice: Number(liquidationPrice.toFixed(2)),
        status
      });
    }

    return levels;
  }
}
