# SRBMPR / SRVBPR Intra-1-Minute (`60 × 1s`) `1:10` & `1:20` Micro-Zero (`Terminal 0`) Engine & Lock Account Suite

This plan delivers the **Intra-1-Minute (`1m` = `60 × 1s` Unmerged Micro-Candles) `1:10` and `1:20` Structural Progression Engine** anchored at **Terminal 0 (`Micro-Zero`)**, together with the **Lock Account & Locked Chart Inspector**, **10,000-Candle Causal State Machine (3-Tier Timestamps)**, **New Coin `Minute-0` Origin Tracker**, and **Compounding / Walk-Forward Purge Gap (`g`) Analyzer**, integrated directly into the **Separate `1s` Micro-Candle Terminal** and **Full Report & Booking Modal**.

## User Review & Critical Decisions

> [!IMPORTANT]
> **Primary Focus Confirmed (`1-Minute` Intra-Candle `1:10` & `1:20`)**: Per your latest instruction (*"भाई मुझे सिर्फ़ 1 मिनट कैंडल का अंदर का 1:10, 1:20 चाहिए"*), the **Separate `1s` Micro-Candle Terminal** and **1-Minute (`1m`) Container Inspector** will spotlight the **60 unmerged `1-Second` micro-candles inside the active `1-Minute` candle**, measuring the exact **`Terminal 0` (`Micro-Zero`) Reference Origin**, **`1:1` Atomic Unit**, and **Intra-1-Minute `1:10` and `1:20` Target & Structural Progression Levels** in real time.

- **Confirmed Decision 1 (Intra-1-Minute `1:10` & `1:20` Inside `60 × 1s` Container)**: Every `1m` candle is decomposed into its 60 individual `1s` micro-candles (`Second 00` to `Second 59`) without merging or smoothing. From the single active `Terminal 0` (`Micro-Zero`) origin inside that 1-minute window, the engine computes the atomic `1:1` micro-unit ($\Delta_0$) and plots the exact **`1:10` ($10 \times \Delta_0$)** and **`1:20` ($20 \times \Delta_0$)** intra-minute price levels, hit status, and second-of-completion (`s00..s59`).
- **Confirmed Decision 2 (All 4 SRBMPR Methodology Modules Included)**: Alongside the primary Intra-1-Minute `1:10` & `1:20` view, the **Full Report & Booking Modal** includes tabs for:
  1. **Lock Account (`#720656` / `$10,000`) & Locked Chart UI Status** (verifying that live data continues appending in the background while the locked chart UI never jumps).
  2. **10,000-Candle Forward Single-Candle State Machine** (`ZERO → WAIT → FORMATION → CONFIRMATION → ENTRY → COMPLETION → RESET`) with separated **Formation Time**, **Confirmation Time**, and **Execution Time**.
  3. **New Coin `Minute-0` Launch-Timestamp Tracker** & **Compounding (`C_n = 9.9 · 2^n + 0.10`) / Walk-Forward Purge Gap (`g`) Analyzer**.
- **Confirmed Decision 3 (Integration Placement)**: Integrated directly into the **Separate `1s` Micro-Candle Terminal** (docked below or maximized) and the **Full Report & Booking Modal**.

---

## 1. Overview & Core Concept

- **What It Does**:
  1. **Intra-1-Minute (`60 × 1s`) `1:10` & `1:20` Micro-Zero Inspector**: Displays the 60 individual `1-Second` candles inside the active `1-Minute` candle (`s00` to `s59`), identifies the single active **Terminal 0 (`Micro-Zero`)** reference candle, measures the initial `1:1` micro structural unit, and draws horizontal price lines and live badges for **`1:1`**, **`1:2`**, **`1:3`**, **`1:10`**, and **`1:20`** right inside the `1s` micro-terminal and on the `1m` chart.
  2. **Lock Account & Locked Chart Verification**: Displays the real-time status of your locked chart (`LOCKED 1-BY-1` with background candle counter `+N BG`) and Upcomers Thunderbolt Account `#720656` (`$10,000` balance, `$50` fixed risk, zero rule violations).
  3. **Causal State Machine & Quantitative Audit**: Tracks the 7-stage state machine with 3-tier timestamps, models the `$10.00` to Trade 29 compounding formula ($C_n = (C_0 - f) \cdot 2^n + f$), and visualizes Walk-Forward Analysis (WFA) purge gaps ($W_{\text{train}} \rightarrow g \rightarrow W_{\text{test}}$).
- **Target Audience / Persona**: Quantitative market mechanism researcher (Founder, SRBMPR / SRVBPR Research Platform • SR Time Market) inspecting intra-minute `1s` behavior and `1:10` / `1:20` micro-expansions without lookahead bias.
- **Key Value**: Gives instant, 4K numerical visibility into how the 60 individual `1-Second` candles inside a `1-Minute` bar form `Terminal 0` and reach `1:10` and `1:20` micro-targets.

---

## 2. User Experience & Visual Design

- **Key User Flows**:
  1. **1-Click `1m (INSIDE 1:10 / 1:20)` Mode**: Clicking the dedicated **`1m (1:10 & 1:20 INSIDE)`** button in the top bar switches the main chart or Separate `1s` Micro-Candle Terminal into the **60-Second Intra-Minute Container View** (`Second 00` through `Second 59`).
  2. **Live `1:10` & `1:20` Price Lines on `1s` Micro-Terminal**: Inside the Separate `1s` Micro-Candle Terminal, the canvas automatically highlights the **Terminal 0 (`T0`)** origin second, the **`1:1` Atomic Base Unit**, and crisp horizontal target lines for **`1:10`** and **`1:20`**, showing the exact dollar price, point distance, and whether `1:10` or `1:20` has been completed within the current 60-second minute container.
  3. **Lock Account & Full Report Modal**: Clicking **Full Report & Booking** opens the multi-tab research ledger with dedicated views for **Intra-1m `1:10` & `1:20` Telemetry**, **Lock Account `#720656` Audit**, **10,000-Candle State Machine (3-Tier Timestamps)**, and **Compounding / WFA Purge Gap Simulator**.
- **Visual Identity & Theme**:
  - *Aesthetic Direction*: High-precision institutional 4K research terminal with zero decorative clutter and unboxed tabular metrics.
  - *Color Palette & Mood*: Supports all 4 selectable 4K background themes (**Pure Black `#000000`**, **Pure White `#FFFFFF`**, **Deep Obsidian `#05080F`**, **SR Time Midnight `#071022`**) and 6 candle palettes (**4K Neon Green `#00FF66` & Crimson Red `#FF1744`**, **Blue-Green `#00E5FF` & Red**, **White & Royal Blue `#2979FF`**, etc.).
  - *Typography & Hierarchy*: Monospace tabular numerals (`font-mono tabular-nums`) across all OHLC prices, `1:10` / `1:20` target readouts, Dual Timezones (`TZ 1` + `TZ 2`), and second-by-second counters (`00s..59s`).
- **Interactive Feedback & Motion**: Instant `<100ms` canvas redraws when toggling `1:10` / `1:20` overlays, refreshing the `1s` micro-stream, or stepping forward 1 candle at a time.

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Strict Non-Merging of the 60 `1-Second` Candles Inside Every `1-Minute` Container**
  - *Chosen Approach*: Keep all 60 `1-Second` bars inside the active `1-Minute` container as discrete sequential records (`s00` to `s59`), deriving the `Terminal 0` origin and `1:1` micro-unit from the actual sequence of highs and lows inside that minute, and projecting exact **`1:10`** ($10\times$) and **`1:20`** ($20\times$) price levels.
  - *Why*: Two 1-minute candles with identical OHLC values can have completely different internal `1s` high/low sequences; preserving the 60 individual `1s` candles prevents averaging distortion and reveals true intra-minute `1:10` and `1:20` expansions.
- **Decision 2: Background Live Data Ingestion While UI Is Locked**
  - *Chosen Approach*: When the chart or `1s` terminal is locked, incoming WebSocket/REST ticks and klines append to the underlying data array in the background (`+N BG`), while the visible viewport window and price scale remain 100% frozen until the user steps forward or unlocks.
  - *Why*: Guarantees zero visual jumping during manual inspection while ensuring no live market data is lost.

---

## 4. Technical Architecture & Data Strategy *(Technical Reference)*

- **Architecture & Component Diagram**:
```text
┌────────────────────────────────────────────────────────────────────────────┐
│       SRVBPR / SRBMPR RESEARCH PLATFORM • SR TIME MARKET (4K HEADER)       │
│  [Universal Ball] [Anytime Search] [★ 1m (1:10 & 1:20)] [★ 5m] [Refresh]   │
└───────────────────┬────────────────────────────────────┬───────────────────┘
                    │                                    │
                    ▼                                    ▼
┌───────────────────────────────────────┐  ┌─────────────────────────────────┐
│     MAIN 4K CANDLE CHART VIEWPORT     │  │  SEPARATE 1s MICRO TERMINAL     │
│ • 100,000 Candles (Left-Side + 1-by-1)│  │ • 60 × 1s Unmerged Container    │
│ • Chosen-Time Price Line (TZ1 + TZ2)  │  │ • Terminal 0 (Micro-Zero) Origin│
│ • Intra-1m 1:10 & 1:20 Overlay Lines  │  │ • Live 1:1 → 1:10 & 1:20 Lines  │
│ • Locked UI (+BG Live Data Counter)   │  │ • Dedicated [REFRESH 1s MICRO]  │
└───────────────────┬───────────────────┘  └─────────────────┬───────────────┘
                    │                                        │
                    └───────────────────┬────────────────────┘
                                        ▼
┌────────────────────────────────────────────────────────────────────────────┐
│              FULL REPORT, LOCK ACCOUNT & METHODOLOGY MODAL                 │
│  ├─ Tab 1: Intra-1m (60×1s) Terminal 0 & 1:10 / 1:20 Progression Ledger    │
│  ├─ Tab 2: Lock Account (#720656 / $10k) & 10,000-Candle State Machine     │
│  ├─ Tab 3: Compounding (Cn = 9.9·2^n + 0.10) & WFA Purge Gap (g) Analyzer  │
│  └─ Tab 4: 24-Color Matrix (Pure Black/White) & Booked Research Export     │
└────────────────────────────────────────────────────────────────────────────┘
```

- **Data Model & State**:
  - `IntraOneMinuteMicroAnalysis`: Holds the 60 `1-Second` bars of the active 1-minute container, `terminalZeroBar` (index `0..59`, timestamp, origin price), `atomicOneToOneDelta` ($\Delta_0$), `direction` (`LONG` | `SHORT`), `target1to1`, `target1to2`, `target1to3`, `target1to10` ($\text{Origin} \pm 10 \cdot \Delta_0$), `target1to20` ($\text{Origin} \pm 20 \cdot \Delta_0$), and completion timestamps for `1:10` and `1:20`.
  - `CausalStateMachineRecord`: Tracks `currentState` (`ZERO` | `WAIT` | `FORMATION` | `CONFIRMATION` | `ENTRY` | `COMPLETION` | `RESET`) and the 3 separated timestamps (`formationTime`, `confirmationTime`, `executionTime`).
- **Interactive Component & State Mapping**:
  - Clicking **`★ 1m (1:10 & 1:20 INSIDE)`** in the top bar or inside the **Separate `1s` Micro-Candle Terminal** switches to the 1-minute container and toggles the `1:10` & `1:20` horizontal target lines and telemetry badges on both the `1s` micro-canvas and the main chart.
  - Clicking **`Book 1:10 / 1:20 Level`** logs the exact `Terminal 0` origin, `1:10` price, `1:20` price, `TZ 1`, and `TZ 2` timestamps into the Research Booking Ledger.
