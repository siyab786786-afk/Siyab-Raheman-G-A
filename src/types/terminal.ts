export type ExchangeId = 'BYBIT' | 'BINANCE';
export type MarketType = 'SPOT' | 'FUTURE' | 'OPTION';
export type AssetSymbol = 'BTC/USDT' | 'ETH/USDT' | 'ZEC/USDT' | 'PAXG/USDT' | 'SOL/USDT' | 'XRP/USDT' | 'DOGE/USDT' | 'ADA/USDT' | 'GOLD' | 'NIFTY50' | 'AR/USDT' | 'BNB/USDT' | 'PEPE/USDT' | 'SUI/USDT' | 'WIF/USDT' | 'SHIB/USDT' | 'FLOKI/USDT' | 'BONK/USDT';
export type Timeframe = '1m' | '5m' | '15m' | '1h' | '4h';
export type TimezoneMode = 'UTC' | 'Asia/Dubai' | 'Asia/Kolkata';
export type Side = 'LONG' | 'SHORT';
export type OrderStatus = 'PENDING_LIMIT' | 'FILLED' | 'SL_HIT' | 'TARGET_HIT' | 'EXPIRED' | 'CANCELLED';
export type ScalpingContainer = '1:5' | '1:10' | '1:15';

export interface ScalpingTicket {
  id: string;
  symbol: AssetSymbol;
  exchange: ExchangeId;
  container: ScalpingContainer;
  side: Side;
  timeWindowMin: number; // 5, 10, or 15
  limitEntry: number; // strictly frozen limit price
  targetPrice: number; // 1:5, 1:10, or 1:15 objective
  displaySL: number; // calculated from 0.1% space for risk containment
  slDistance: number;
  quantity: number; // calculated from userRisk / slDistance
  userBalance: number; // e.g. $50.00
  userRisk: number; // e.g. $2.00
  estimatedLoss: number; // -$2.00
  estimatedProfit: number; // +$10.00 for 1:5
  status: 'READY' | 'PENDING_LIMIT' | 'FILLED' | 'TARGET_HIT' | 'SL_HIT' | 'CLOSED';
  createdAt: number;
  expiresAt: number;
  filledAt?: number;
  fillPrice?: number;
  currentPnlDollar?: number;
  currentPnlPercent?: number;
}

export interface PendingOrder {
  id: string;
  type: 'BUY' | 'SELL';
  price: number;
  quantity: number;
  slPercent: number;
  slDistance: number;
  sl: number;
  target: number;
  status: OrderStatus;
  confirmed: boolean;
  timeframe: string;
  createdAt: number;
  expiresAt: number;
  fillPrice: number | null;
  frozen: boolean;
}

export interface LimitOrderInput {
  exchange: ExchangeId;
  marketType: MarketType;
  symbol: AssetSymbol;
  side: Side;
  timezone?: TimezoneMode;
  structureTimeframe?: string;
  executionTimeframe?: string;
  projectedLimitEntry: number;
  quantity?: number;
  slPercent?: number;
  targetPrice?: number;
  createdAt?: number;
  expiresAt?: number;
  sequenceId?: string;
  sequenceState?: string;
}

export interface FrozenLimitOrder {
  id: string;
  exchange: ExchangeId;
  marketType: MarketType;
  symbol: AssetSymbol;
  side: Side;
  timezone: TimezoneMode;
  structureTimeframe: string;
  executionTimeframe: string;
  sequenceId: string;
  sequenceState: string;
  orderType: 'LIMIT';
  entry: number; // strictly frozen
  quantity: number;
  slPercent: number; // 0.10%
  slDistance: number; // entry * 0.001 (strictly frozen)
  stopLoss: number; // strictly frozen
  targetPrice: number; // strictly frozen
  createdAt: number;
  expiresAt: number;
  status: OrderStatus;
  filledAt: number | null;
  fillPrice: number | null;
  closedAt?: number | null;
  closePrice?: number | null;
  frozen: true;
}

export interface CandleData {
  timestamp: number;
  timeStr: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  isConfirmed: boolean;
  exchange: ExchangeId;
  symbol: string;
}

export interface Srbmpr2526LayerState {
  anchorTime: number;
  anchorHigh: number;
  bodyTop: number;
  wRef: number;
  midZone: number;
  level1: number;
  level2: number;
  level3: number;
  activeLayer: '1:1' | '1:2' | '1:3' | '1:5' | '1:10' | 'COMPLETED';
  progress11: number;
  progress12: number;
  progress13: number;
  status: 'FORMING' | 'COMPLETED' | 'CONFIRMED' | 'INVALIDATED' | 'WAITING_TIME_CLOSE';
  entryPrice: number;
  slPercent?: number;
  slDistance?: number;
  stopLoss: number;
  toleranceStop: number;
  targetPrice: number;
  rrRatio: number;
  scalingTargets: { ratio: number; price: number; reached: boolean; timeWindow?: string }[];
  entryTimeWindow?: {
    start: string;
    end: string;
  };
  srbmpr333State?: 'A333' | 'B333' | 'C333' | 'ZERO';
}

export interface ValidationArchiveRecord {
  id: string;
  timestamp: string;
  exchange: ExchangeId;
  symbol: string;
  timeframe: Timeframe;
  timezone: TimezoneMode;
  totalCandles: number;
  confirmedCycles: number;
  winRate: number;
  avgMfe: number;
  avgMae: number;
  dataIntegrityStatus: 'VERIFIED_CLEAN' | 'GAP_DETECTED' | 'SYNCHRONIZED';
  proofHash: string;
}

export interface TomorrowReportRecord {
  time: string;
  entryPrice: number;
  sl: number;
  target: number;
  validity: string;
}

export interface DailyAuditReportRecord {
  id: string;
  timestampUtc: string;
  asset: AssetSymbol;
  exchange: ExchangeId;
  orderType: 'LIMIT_ORDER_ONLY';
  horizon: '1:5' | '1:10' | '1:15';
  limitEntry: number;
  structuralSL: number;
  slDistance: number;
  slPercent: number;
  targetPrice: number;
  timeframeConnection: string;
  proofRationale: string;
  waitingZoneStatus: 'CONFIRMED_PROVED' | 'WAITING_ZONE_ACTIVE' | 'TARGET_REACHED' | 'INVALIDATED_ZERO_LEAK';
  status: 'AUDITED_VALID' | 'PROFIT_SECURED' | 'CONTAINED_RISK';
}

export interface DailyBrokerAuditSummary {
  reportDate: string;
  exchange: ExchangeId;
  asset: AssetSymbol;
  researcherLead: string;
  timeZoneResearcher: string;
  totalLimitNodes: number;
  validLimitTrades: number;
  waitingZoneFilterRatio: string;
  zeroLeakIntegrity: boolean;
  timeframesAudited: string[];
  records: DailyAuditReportRecord[];
}

export interface TradeEvent {
  price: number;
  size: number;
  side: 'Buy' | 'Sell';
  timestamp: number;
}

export interface TickerEvent {
  symbol: string;
  lastPrice: number;
  highPrice24h: number;
  lowPrice24h: number;
  prevPrice24h: number;
  volume24h: number;
  turnover24h: number;
  price24hPcnt: number;
}

// ==========================================
// SRBMPR BROKER FOOTPRINT EXTRACTION TYPES
// ==========================================
export type SequenceDirection = 'BUY' | 'GIRL_SELL' | 'UNRESOLVED';
export type FootprintMatchStatus = 
  | 'MATCHED' 
  | 'BEHAVIOUR_MATCH_ONLY' 
  | 'PRICE_MATCH_ONLY' 
  | 'TIMESTAMP_MATCH_ONLY' 
  | 'PARTIAL_MATCH' 
  | 'NOT_FOUND' 
  | 'INCOMPLETE' 
  | 'OUT_OF_SCOPE' 
  | 'UNRESOLVED';

export interface BrokerFootprintRecord {
  footprint_id: string;
  source_id: ExchangeId | 'BYBIT' | 'BINANCE' | 'DERIBIT' | 'OKX';
  source_file: string;
  asset: string;
  calendar_date: string;
  timezone: string;
  timeframe: string;
  direction: SequenceDirection;
  sequence_depth: number;
  sequence_label: string; // e.g. BUY, BUY_BUY, BUY_BUY_BUY, GIRL, GIRL_GIRL
  cycle_ids: string[];
  start_timestamp: string;
  end_timestamp: string;
  source_rows: number[];
  price_reference: {
    start_price: number;
    end_price: number;
    high: number;
    low: number;
  };
  status: 'COMPLETE' | 'INCOMPLETE';
  raw_file_hash: string;
  methodology_version: string;
}

export interface CrossPlatformFootprintMatch {
  match_id: string;
  calendar_date: string;
  asset: string;
  timeframe: string;
  primary_source: string;
  secondary_source: string;
  primary_depth: number;
  secondary_depth: number;
  primary_sequence: string;
  secondary_sequence: string;
  structure_match: boolean;
  price_match: boolean;
  timestamp_match: boolean;
  status: FootprintMatchStatus;
  tolerance_delta_price: number;
  tolerance_delta_sec: number;
  evidence_notes: string;
}

// ==========================================
// KALI LINUX INDEPENDENT AUDIT TYPES
// ==========================================
export interface KaliAuditTimeframeRecord {
  timeframe: '1m' | '5m' | '10m';
  totalEvents: number;
  pnlDollar: number;
  directionNoneExcludedPercent: number;
  dateRange: string;
  clusteringAt0000_0005Percent: number;
  winRatePercent: number;
  pValueVersus50PctChance: number;
  isStatisticallySignificant: boolean;
  top3TradesProfitPercent: number;
  mfeMaeIntegrity: 'AUDITED_CLEAN_NO_LOOKAHEAD' | 'LEAKAGE_FLAGGED';
}

export interface KaliAuditReportSummary {
  auditFile: string;
  totalPages: number;
  totalAuditedEvents: number;
  auditorId: string;
  osArchitecture: 'KALI_LINUX_CHALLENGER' | 'UBUNTU_BUILDER';
  auditScope: string;
  keyFindings: string[];
  timeframeBreakdowns: KaliAuditTimeframeRecord[];
  forwardTestProtocol: {
    frozenRulesActive: boolean;
    futureCandlesGenerated: false;
    zeroCandleSequenceDetection: boolean;
    openEntryMicroResolution: string;
    immutableTimestampHashing: boolean;
  };
  reproducibilityRequirements: string[];
}

// =========================================================
// MULTI-DAY 1:100 TO 1:1000 HORIZON & RE-ENTRY CASCADE TYPES
// =========================================================
export type HorizonRatio = '1:100' | '1:200' | '1:300' | '1:500' | '1:1000';

export interface HorizonReEntryStep {
  stepNumber: number; // 1 (Opening / Now), 2 (Missed #1 -> Pullback), 3 (Missed #2 -> Continuation), 4 (Missed #3 -> Reset)
  label: string; // e.g. "ENTRY 1: OPENING CANCLE AXIS", "RE-ENTRY 2: 50% MID PULLBACK"
  triggerCondition: string; // e.g. "Opening 1m bar close above anchor", "5m retrace to 50% wick"
  timeWindow: string; // e.g. "04:00 - 04:30 UTC"
  entryPrice: number;
  slPercent: 0.10; // Strictly 0.10% space
  slDistance: number;
  stopLossPrice: number;
  target100: number;
  target200: number;
  target500: number;
  target1000: number;
  status: 'NOW_ENTRY_ACTIVE' | 'NEXT_VALID_WAITING' | 'CONTINGENT_LADDER';
}

export interface HorizonAssetRecord {
  id: string;
  symbol: string;
  exchange: ExchangeId;
  bias: 'LONG' | 'SHORT';
  status: 'NOW' | 'WAIT' | 'NEXT_RUN';
  openingCandlePrice: number;
  currentPrice: number;
  timeframe: string;
  timezone: TimezoneMode;
  candleOpeningTime: string;
  targetEndTime: string;
  totalDurationHours: number;
  strictSlPercent: 0.10;
  slDistance: number;
  stopLossPrice: number;
  targets: {
    ratio: HorizonRatio;
    multiplier: number;
    price: number;
    timeHorizon: string;
  }[];
  reEntrySteps: HorizonReEntryStep[];
  fundedRiskPlan: {
    accountProvider: 'UPCOMERS' | 'BYBIT_PROP' | 'SELF_TRADED';
    accountSize: number; // $10,000 | $50,000 | $100,000
    maxDailyRiskDollar: number; // 4% = $4,000 on $100k
    tradeRiskPercent: number; // 0.50%
    tradeRiskDollar: number; // $500 on $100k
    computedLotUnits: number;
    effectiveLeverage: string;
  };
}

// =========================================================
// SR EXECUTION VAULT & MULTI-TIER COMPOUNDING LEDGER TYPES
// =========================================================
export type AssetCategory = 'ALL' | 'CRYPTO_MAJOR' | 'MEME_COIN' | 'COMMODITY' | 'INDIAN_MARKET' | 'US_INDEX';

export interface ExecutionVaultTrade {
  id: string;
  symbol: string;
  category: AssetCategory;
  exchange: string;
  timeframe: string;
  candleOpenTime: string;
  limitEntryPrice: number;
  slPercent: 0.10;
  slDistance: number;
  stopLossPrice: number;
  targetRatio: string;
  targetPrice: number;
  initialCapitalDollar: number; // e.g. $1.00 or $2.00
  leverageApplied: number; // 1x, 5x, 10x, 20x, 50x
  compoundedReturnDollar: number; // e.g. $10, $200, $2000, $20000, $2000000
  tradeStatus: 'EXECUTED_TARGET_HIT' | 'ACTIVE_LIMIT_LOCKED' | 'WAITING_CANDLE_CLOSE' | 'NEXT_RE_ENTRY_LEVEL';
  methodologyProofNote: string;
  executionTimestamp: string;
  hash: string;
}

// =========================================================
// SRBMPR 1-SECOND EVENT RESOLUTION & FORWARD DETECTION TYPES
// =========================================================
export interface OneSecondOhlc {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  highTimestamp: string;
  lowTimestamp: string;
  intraSecondSequence: 'OPEN_LOW_HIGH_CLOSE' | 'OPEN_HIGH_LOW_CLOSE';
}

export interface OneSecondEventRecord {
  eventId: string;
  sequenceIndex: number;
  asset: AssetSymbol;
  source: string;
  exactTimestamp: string;
  unixTimestampMs: number;
  timeStr: string; // e.g. "10:15:01"
  timezone: TimezoneMode;
  ohlc: OneSecondOhlc;
  
  // Structural Detection
  structureDetected: boolean;
  rrRatio: string; // e.g. '1:100'
  entryPrice: number;
  slPrice: number;
  slDistance: number;
  targetPrice: number;
  
  // Completion & Forward Tracking
  completionStatus: 'REGISTERED' | 'FORWARD_MONITORING' | 'TARGET_HIT' | 'SL_HIT' | 'TIMEOUT_INCOMPLETE';
  completionTimestamp?: string;
  completionSecondOffset?: number; // duration in seconds (must be <= 900s / 15m threshold)
  subsequentHigh?: number;
  subsequentLow?: number;
  subsequentChangesCount: number;
  
  // Subsequent derived 1m structure (forward-derived, never looked back)
  derived1MinuteStructure?: {
    minuteId: string;
    minuteHigh: number;
    minuteLow: number;
    status: 'IN_PROGRESS' | 'COMPLETED';
    formedAtTimestamp: string;
  };

  rawReference: string;
  tamperProofHash: string;
  auditRule: string;
}

export interface AssetDensityRow {
  symbol: string;
  category: string;
  observations1s: number;
  qualifyingEvents: number;
  completedEvents: number;
  timeoutEvents: number;
  avgDurationSec: number;
  maxDurationSec: number;
  lastEventTime: string;
  status: 'ACTIVE_SCAN' | 'COMPLETED';
}

export interface DataDensitySummary {
  qualifyingEventsFound: number;
  completedEvents: number;
  incompleteTimeoutEvents: number;
  uniqueAssetsCount: number;
  totalOneSecondObservations: number;
  avgCompletionTimeSec: number;
  maxCompletionTimeSec: number;
  maxAllowedTimeoutThresholdSec: 900; // strictly 15 minutes
  eventsPerAssetAvg: number;
  eventsPerHour: number;
  observationsPerDay: number;
  lastScanTimestampUtc: string;
  assetRows: AssetDensityRow[];
}
