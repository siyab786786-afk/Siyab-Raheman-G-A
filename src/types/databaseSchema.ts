export interface RawDataRecord {
  source_id: string;
  asset: string;
  timestamp: string; // TIMESTAMPTZ UTC
  timeframe: 'MICRO' | '1S' | '1M';
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number | null;
  source_row: number;
  raw_file_hash: string;
}

export const RAW_DATA_CSV_HEADER = 'source_id,asset,timestamp,timeframe,open,high,low,close,volume,source_row,raw_file_hash';

export interface CycleTableRecord {
  cycle_id: string;
  asset: string;
  source_id: string;
  layer: 'MICRO' | '1S' | '1M';
  date: string; // YYYY-MM-DD
  timezone: string;
  high_1_time: string;
  high_1_price: number;
  low_time: string;
  low_price: number;
  high_2_time: string;
  high_2_price: number;
  duration_seconds: number;
  parent_cycle_id: string | null;
  raw_row_start: number;
  raw_row_end: number;
  status: 'COMPLETE' | 'INCOMPLETE' | 'UNVERIFIABLE_ORDER' | 'MISSING_DATA' | 'DUPLICATE';
  methodology_version: string;
}

export const CYCLES_CSV_HEADER = 'cycle_id,asset,source_id,layer,date,timezone,high_1_time,high_1_price,low_time,low_price,high_2_time,high_2_price,duration_seconds,parent_cycle_id,raw_row_start,raw_row_end,status,methodology_version';

export interface DailyCountRecord {
  date: string;
  asset: string;
  source_id: string;
  micro_complete_cycles: number;
  second_complete_cycles: number;
  minute_complete_cycles: number;
  micro_incomplete_cycles: number;
  second_incomplete_cycles: number;
  minute_incomplete_cycles: number;
  data_gap_count: number;
}

export const DAILY_COUNTS_CSV_HEADER = 'date,asset,source_id,micro_complete_cycles,second_complete_cycles,minute_complete_cycles,micro_incomplete_cycles,second_incomplete_cycles,minute_incomplete_cycles,data_gap_count';

export interface RrCompletionRecord {
  cycle_id: string;
  entry_reference: number;
  sl_reference: number;
  target_reference: number;
  rr_1_1_status: 'HIT' | 'MISS' | 'NOT_REACHED';
  rr_1_2_status: 'HIT' | 'MISS' | 'NOT_REACHED';
  rr_1_3_status: 'HIT' | 'MISS' | 'NOT_REACHED';
  completion_seconds: number;
  target_hit_order: string | null;
  status: 'COMPLETE' | 'PARTIAL' | 'INVALID';
}

export const RR_COMPLETION_CSV_HEADER = 'cycle_id,entry_reference,sl_reference,target_reference,rr_1_1_status,rr_1_2_status,rr_1_3_status,completion_seconds,target_hit_order,status';
