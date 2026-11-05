// ============================================================================
// SRBMPR — SUPABASE CENTRAL DATABASE & 30-DAY SPOT ENGINE SERVICE
// Project ID: kyrnctzfvmivzqejogci
// URL: https://kyrnctzfvmivzqejogci.supabase.co
// Preserves existing schema (candles.open_time), Zero Cycles, LEFT/RIGHT sequences,
// and Forward Test records. Supports idempotent 30-Day Spot Engine ledger.
// ============================================================================

import { RawOhlcBar, ForwardTimeframe } from './SrbmprForwardTestEngine';

export interface SupabaseCandleRow {
  id?: string | number;
  symbol?: string;
  asset?: string;
  timeframe?: string;
  interval?: string;
  open_time?: string | number;
  close_time?: string | number;
  timestamp_utc?: string;
  timestamp?: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface SupabaseForwardTestAuditRow {
  id?: number;
  order_link_id?: string;
  trade_no?: number;
  day_number?: number; // 1..30 for 30-Day Spot Engine
  market_type?: 'SPOT' | 'LINEAR';
  asset: string;
  timeframe?: string;
  cycle_stage: string;
  direction: 'LONG' | 'SHORT';
  entry_price: number;
  sl_price: number;
  t1_price: number;
  equilibrium_50?: number;
  t2_price?: number;
  t3_price?: number;
  pnl_usd: number;
  status: string;
  retrace_50_hit?: boolean;
  wick_ratio?: number;
  shot_candle_count?: number;
  entry_timestamp?: string;
  exit_timestamp?: string;
  notes?: string;
  created_at?: string;
}

export interface EnvAuditStatus {
  VITE_SUPABASE_URL: { configured: boolean; value: string };
  VITE_SUPABASE_ANON_KEY: { configured: boolean };
  DATABASE_URL: { configured: boolean };
  BYBIT_API_KEY: { configured: boolean };
  BYBIT_API_SECRET: { configured: boolean };
  missingRequired: string[];
  readyForLiveSpotExecution: boolean;
}

export interface SupabaseTestResult {
  success: boolean;
  timestamp: string;
  latencyMs: number;
  statusCode: number;
  message: string;
  envAudit?: EnvAuditStatus;
  tablesVerified: Array<{
    name: string;
    accessible: boolean;
    rowCountSample: number;
    timestampColumn?: string;
    error?: string;
  }>;
}

const SUPABASE_PROJECT_ID = 'kyrnctzfvmivzqejogci';
const DEFAULT_SUPABASE_URL = `https://${SUPABASE_PROJECT_ID}.supabase.co`;
const STORAGE_KEY_TOKEN = 'SR_SUPABASE_PUBLISHABLE_TOKEN';
const STORAGE_KEY_AUDITS_BACKUP = 'SR_SUPABASE_AUDITS_LOCAL_BACKUP';

export function parseCandleOpenTimeMs(row: SupabaseCandleRow, fallbackMs: number): number {
  const raw = row.open_time ?? row.timestamp ?? row.timestamp_utc;
  if (raw === undefined || raw === null) return fallbackMs;
  if (typeof raw === 'number') {
    // Handle epoch seconds vs milliseconds
    return raw < 1e11 ? raw * 1000 : raw;
  }
  const str = String(raw).trim();
  if (/^\d+$/.test(str)) {
    const num = Number(str);
    return num < 1e11 ? num * 1000 : num;
  }
  const parsed = Date.parse(str);
  return Number.isNaN(parsed) ? fallbackMs : parsed;
}

export class SrbmprSupabaseService {
  private static instance: SrbmprSupabaseService | null = null;
  private publishableToken: string = '';
  private supabaseUrl: string = DEFAULT_SUPABASE_URL;

  private constructor() {
    const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
    if (envUrl && typeof envUrl === 'string' && envUrl.startsWith('http')) {
      this.supabaseUrl = envUrl.trim().replace(/\/+$/, '');
    }
    this.loadToken();
  }

  public static getInstance(): SrbmprSupabaseService {
    if (!SrbmprSupabaseService.instance) {
      SrbmprSupabaseService.instance = new SrbmprSupabaseService();
    }
    return SrbmprSupabaseService.instance;
  }

  private loadToken() {
    try {
      const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;
      if (envKey && typeof envKey === 'string' && envKey.trim() && !envKey.includes('[')) {
        this.publishableToken = envKey.trim();
        return;
      }
      const stored = localStorage.getItem(STORAGE_KEY_TOKEN);
      if (stored) {
        this.publishableToken = stored.trim();
      }
    } catch (_) {}
  }

  public setPublishableToken(token: string) {
    this.publishableToken = token.trim();
    try {
      localStorage.setItem(STORAGE_KEY_TOKEN, this.publishableToken);
    } catch (_) {}
  }

  public getPublishableToken(): string {
    return this.publishableToken;
  }

  public getProjectDetails() {
    return {
      projectId: SUPABASE_PROJECT_ID,
      url: this.supabaseUrl,
      sqlEditorUrl: `https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/sql/new`,
      apiSettingsUrl: `https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/settings/api`,
      dbSettingsUrl: `https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/settings/database`,
      hasToken: Boolean(this.publishableToken)
    };
  }

  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Prefer': 'return=representation'
    };
    if (this.publishableToken) {
      headers['apikey'] = this.publishableToken;
      headers['Authorization'] = `Bearer ${this.publishableToken}`;
    }
    return headers;
  }

  /**
   * Queries server-side /api/supabase/env-check to verify which environment variables are set
   */
  public async fetchEnvAudit(): Promise<EnvAuditStatus | null> {
    try {
      const res = await fetch('/api/supabase/env-check');
      if (res.ok) {
        return await res.json();
      }
    } catch (_) {}
    return null;
  }

  /**
   * Phase 1 & 3: Inspect existing database tables (including candles.open_time) without modifying data
   */
  public async testDatabaseConnection(): Promise<SupabaseTestResult> {
    const start = performance.now();
    const envAudit = await this.fetchEnvAudit();

    // First try server-side proxy probe if server has credentials
    try {
      const srvRes = await fetch('/api/supabase/probe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientToken: this.publishableToken })
      });
      if (srvRes.ok) {
        const srvJson = await srvRes.json();
        if (srvJson && Array.isArray(srvJson.tablesVerified)) {
          return {
            ...srvJson,
            envAudit: envAudit || srvJson.envAudit
          };
        }
      }
    } catch (_) {}

    const tables = ['candles', 'srbmpr_raw_ticks', 'srbmpr_forward_tests'];
    const results: SupabaseTestResult['tablesVerified'] = [];
    let overallSuccess = true;
    let lastStatusCode = 200;

    for (const table of tables) {
      try {
        const url = `${this.supabaseUrl}/rest/v1/${table}?limit=5`;
        const res = await fetch(url, {
          method: 'GET',
          headers: this.getHeaders()
        });
        lastStatusCode = res.status;

        if (res.ok) {
          const data = await res.json();
          const firstRow = Array.isArray(data) && data.length > 0 ? data[0] : null;
          const tsCol = firstRow
            ? 'open_time' in firstRow
              ? 'open_time'
              : 'timestamp_utc' in firstRow
                ? 'timestamp_utc'
                : 'timestamp' in firstRow
                  ? 'timestamp'
                  : 'detected'
            : table === 'candles'
              ? 'open_time'
              : 'timestamp_utc';

          results.push({
            name: `public.${table}`,
            accessible: true,
            rowCountSample: Array.isArray(data) ? data.length : 0,
            timestampColumn: tsCol
          });
        } else {
          overallSuccess = false;
          let errText = `${res.status} ${res.statusText}`;
          try {
            const errJson = await res.json();
            if (errJson?.message) errText += `: ${errJson.message}`;
          } catch (_) {}

          results.push({
            name: `public.${table}`,
            accessible: false,
            rowCountSample: 0,
            error: errText
          });
        }
      } catch (err: any) {
        overallSuccess = false;
        results.push({
          name: `public.${table}`,
          accessible: false,
          rowCountSample: 0,
          error: err?.message || 'Network unreachable'
        });
      }
    }

    const latencyMs = Math.round(performance.now() - start);
    let mainMessage = '';

    if (overallSuccess) {
      mainMessage = `Supabase (${SUPABASE_PROJECT_ID}) connected & verified (${latencyMs}ms). Schema 'candles.open_time' active.`;
    } else if (!this.publishableToken && !envAudit?.VITE_SUPABASE_ANON_KEY?.configured) {
      mainMessage = `Endpoint ${this.supabaseUrl} is reachable (HTTP 401 without key). Set VITE_SUPABASE_ANON_KEY and DATABASE_URL in AI Studio Environment Variables to authenticate.`;
    } else {
      mainMessage = `Endpoint reached (${latencyMs}ms). Verify VITE_SUPABASE_ANON_KEY permissions or run non-destructive SQL check.`;
    }

    return {
      success: overallSuccess,
      timestamp: new Date().toISOString(),
      latencyMs,
      statusCode: lastStatusCode,
      message: mainMessage,
      envAudit: envAudit || undefined,
      tablesVerified: results
    };
  }

  /**
   * Phase 4: Fetches authentic historical candles from Supabase database tables.
   * Respects existing schema where candle timestamps use `open_time`.
   */
  public async fetchHistoricalCandlesFromDb(
    symbol: string,
    timeframe: ForwardTimeframe,
    limit: number = 2000
  ): Promise<RawOhlcBar[] | null> {
    const cleanSym = symbol.replace('/', '').toUpperCase();

    // 1. Try server-side proxy first (uses server-side VITE_SUPABASE_ANON_KEY / DATABASE_URL if configured)
    try {
      const srvRes = await fetch(
        `/api/supabase/candles?symbol=${encodeURIComponent(cleanSym)}&timeframe=${encodeURIComponent(timeframe)}&limit=${limit}`
      );
      if (srvRes.ok) {
        const srvJson = await srvRes.json();
        if (Array.isArray(srvJson?.candles) && srvJson.candles.length > 0) {
          return srvJson.candles;
        }
      }
    } catch (_) {}

    if (!this.publishableToken) {
      return null;
    }

    const headers = this.getHeaders();

    // Prioritize existing `candles` table ordered by `open_time.asc`
    const endpointsToTry = [
      `candles?symbol=eq.${cleanSym}&order=open_time.asc&limit=${limit}`,
      `candles?symbol=eq.${symbol}&order=open_time.asc&limit=${limit}`,
      `candles?order=open_time.asc&limit=${limit}`,
      `srbmpr_raw_ticks?asset=eq.${cleanSym}&order=timestamp_utc.asc&limit=${limit}`,
      `candles?symbol=eq.${cleanSym}&order=timestamp.asc&limit=${limit}`
    ];

    for (const endpoint of endpointsToTry) {
      try {
        const res = await fetch(`${this.supabaseUrl}/rest/v1/${endpoint}`, { headers });
        if (res.ok) {
          const rows: SupabaseCandleRow[] = await res.json();
          if (Array.isArray(rows) && rows.length > 0) {
            return rows.map((r, idx) => {
              const fallbackTs = Date.now() - (rows.length - idx) * 60000;
              const ts = parseCandleOpenTimeMs(r, fallbackTs);
              return {
                index: idx + 1,
                timestamp: ts,
                timeFormatted: new Date(ts).toISOString().replace('T', ' ').slice(0, 19),
                open: Number(r.open),
                high: Number(r.high),
                low: Number(r.low),
                close: Number(r.close),
                volume: Number(r.volume || 0)
              };
            });
          }
        }
      } catch (_) {
        // Continue to next candidate query
      }
    }

    return null;
  }

  /**
   * Phase 5, 6 & 7: Idempotent recording of Forward Test / 30-Day Spot Engine audit
   * Uses deterministic `order_link_id` to prevent duplicate orders across restarts.
   */
  public async recordForwardTestAudit(record: SupabaseForwardTestAuditRow): Promise<boolean> {
    const orderLinkId =
      record.order_link_id ||
      `SR30D-${record.asset.replace('/', '')}-${record.direction}-${Math.round(record.entry_price * 100)}-${record.entry_timestamp || new Date().toISOString().slice(0, 16)}`;

    const enriched: SupabaseForwardTestAuditRow = {
      ...record,
      order_link_id: orderLinkId,
      market_type: record.market_type || 'SPOT'
    };

    this.saveLocalAuditBackup(enriched);

    if (!this.publishableToken) {
      return false;
    }

    try {
      const res = await fetch(`${this.supabaseUrl}/rest/v1/srbmpr_forward_tests`, {
        method: 'POST',
        headers: {
          ...this.getHeaders(),
          'Prefer': 'resolution=ignore-duplicates,return=representation'
        },
        body: JSON.stringify(enriched)
      });
      return res.ok;
    } catch (_) {
      return false;
    }
  }

  public async fetchForwardTestAudits(asset?: string, limit: number = 50): Promise<SupabaseForwardTestAuditRow[]> {
    if (this.publishableToken) {
      try {
        let endpoint = `srbmpr_forward_tests?order=created_at.desc&limit=${limit}`;
        if (asset) {
          const clean = asset.replace('/', '').toUpperCase();
          endpoint += `&asset=eq.${clean}`;
        }
        const res = await fetch(`${this.supabaseUrl}/rest/v1/${endpoint}`, {
          headers: this.getHeaders()
        });
        if (res.ok) {
          const rows = await res.json();
          if (Array.isArray(rows) && rows.length > 0) {
            return rows;
          }
        }
      } catch (_) {}
    }

    return this.getLocalAuditBackup();
  }

  /**
   * Sync authentic candles to Supabase public.candles table using `open_time`
   */
  public async syncCandlesToDatabase(
    symbol: string,
    timeframe: string,
    bars: RawOhlcBar[]
  ): Promise<{ inserted: number; error?: string }> {
    if (!this.publishableToken) {
      return { inserted: 0, error: 'VITE_SUPABASE_ANON_KEY required to write to Supabase' };
    }

    try {
      const payload: SupabaseCandleRow[] = bars.slice(-200).map(b => ({
        symbol: symbol.replace('/', '').toUpperCase(),
        timeframe,
        open_time: new Date(b.timestamp).toISOString(),
        open: b.open,
        high: b.high,
        low: b.low,
        close: b.close,
        volume: b.volume
      }));

      const res = await fetch(`${this.supabaseUrl}/rest/v1/candles`, {
        method: 'POST',
        headers: {
          ...this.getHeaders(),
          'Prefer': 'resolution=ignore-duplicates,return=representation'
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        return { inserted: payload.length };
      } else {
        const err = await res.text();
        return { inserted: 0, error: `Supabase Error (${res.status}): ${err}` };
      }
    } catch (e: any) {
      return { inserted: 0, error: e?.message || 'Failed to sync candles' };
    }
  }

  private saveLocalAuditBackup(record: SupabaseForwardTestAuditRow) {
    try {
      const existing = this.getLocalAuditBackup();
      // Deduplicate by order_link_id
      if (record.order_link_id && existing.some(r => r.order_link_id === record.order_link_id)) {
        return;
      }
      const updated = [record, ...existing].slice(0, 200);
      localStorage.setItem(STORAGE_KEY_AUDITS_BACKUP, JSON.stringify(updated));
    } catch (_) {}
  }

  public getLocalAuditBackup(): SupabaseForwardTestAuditRow[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_AUDITS_BACKUP);
      if (raw) return JSON.parse(raw);
    } catch (_) {}
    return [];
  }

  /**
   * Phase 2: Safe, Non-Destructive SQL Migration Script preserving `open_time` on `public.candles`
   */
  public getNonDestructiveMigrationSql(): string {
    return `-- ============================================================================
-- SR-BMPR / SR TIME — SAFE NON-DESTRUCTIVE DATABASE MIGRATION (30-DAY SPOT ENGINE)
-- Supabase Project: kyrnctzfvmivzqejogci
-- Direct SQL Editor: https://supabase.com/dashboard/project/kyrnctzfvmivzqejogci/sql/new
--
-- SAFETY & PRESERVATION RULES:
-- 1. Preserves existing 'public.candles' table and its 'open_time' column.
-- 2. NEVER drops, truncates, overwrites, or resets existing market data.
-- 3. Adds idempotent 'order_link_id' constraint so restarts NEVER create duplicate orders.
-- ============================================================================

-- 1. Preserve existing 'public.candles' (uses 'open_time' for candle timestamps)
CREATE TABLE IF NOT EXISTS public.candles (
    id BIGSERIAL PRIMARY KEY,
    symbol VARCHAR(32) NOT NULL,
    timeframe VARCHAR(16) DEFAULT '1m',
    open_time TIMESTAMPTZ NOT NULL,
    open NUMERIC(24, 8) NOT NULL,
    high NUMERIC(24, 8) NOT NULL,
    low NUMERIC(24, 8) NOT NULL,
    close NUMERIC(24, 8) NOT NULL,
    volume NUMERIC(24, 8) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Non-destructive index on (symbol, open_time DESC)
CREATE INDEX IF NOT EXISTS idx_candles_symbol_open_time ON public.candles (symbol, open_time DESC);

-- 2. Preserve 'public.srbmpr_raw_ticks' for Micro -> 1s -> 1m sequence verification
CREATE TABLE IF NOT EXISTS public.srbmpr_raw_ticks (
    id BIGSERIAL PRIMARY KEY,
    asset VARCHAR(32) NOT NULL,
    timestamp_utc TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    price NUMERIC(24, 8) NOT NULL,
    size NUMERIC(24, 8) DEFAULT 0,
    side VARCHAR(8) DEFAULT 'BUY',
    open NUMERIC(24, 8),
    high NUMERIC(24, 8),
    low NUMERIC(24, 8),
    close NUMERIC(24, 8),
    volume NUMERIC(24, 8) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_srbmpr_ticks_asset_ts ON public.srbmpr_raw_ticks (asset, timestamp_utc DESC);

-- 3. 30-Day Spot Engine & Forward Test Ledger with Idempotent 'order_link_id'
CREATE TABLE IF NOT EXISTS public.srbmpr_forward_tests (
    id BIGSERIAL PRIMARY KEY,
    order_link_id VARCHAR(64) UNIQUE,
    trade_no INT,
    day_number INT DEFAULT 1,
    market_type VARCHAR(16) DEFAULT 'SPOT',
    asset VARCHAR(32) NOT NULL,
    timeframe VARCHAR(16) DEFAULT '1m',
    cycle_stage VARCHAR(32) DEFAULT 'CYCLE_1_ENTRY',
    direction VARCHAR(8) NOT NULL,
    entry_price NUMERIC(24, 8) NOT NULL,
    sl_price NUMERIC(24, 8) NOT NULL,
    t1_price NUMERIC(24, 8) NOT NULL,
    equilibrium_50 NUMERIC(24, 8),
    t2_price NUMERIC(24, 8),
    t3_price NUMERIC(24, 8),
    pnl_usd NUMERIC(16, 2) DEFAULT 0.00,
    status VARCHAR(32) DEFAULT 'VERIFIED_DRY_RUN',
    retrace_50_hit BOOLEAN DEFAULT FALSE,
    wick_ratio NUMERIC(10, 4) DEFAULT 1.0,
    shot_candle_count INT DEFAULT 8,
    entry_timestamp TIMESTAMPTZ DEFAULT NOW(),
    exit_timestamp TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_srbmpr_fwd_asset ON public.srbmpr_forward_tests (asset, entry_timestamp DESC);
`;
  }
}
