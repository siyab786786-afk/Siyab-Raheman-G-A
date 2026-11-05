#!/usr/bin/env Rscript
# ==============================================================================
# SRBMPR-25/26 QUANTITATIVE BACKTESTING ENGINE (R MODULE)
# ==============================================================================
# Purpose:
#   Backtests the SRBMPR-25/26 Upper-Wick Reference (W_ref) structural model
#   on raw OHLC data with explicit timestamp & timezone handling.
#
# Key Capabilities:
#   1. Raw OHLC ingestion with POSIXct timestamp parsing & timezone conversion.
#   2. Anchor candle detection & W_ref (Upper Wick reference unit) calculation:
#        body_top = max(open, close)
#        W_ref    = high - body_top
#   3. Entry point definitions across three SRBMPR-25/26 strategies:
#        - INTERNAL_WICK_MIDPOINT : Entry = body_top + 0.5 * W_ref
#        - PROJECTION_1_TO_1      : Entry = anchor_high + 1.0 * W_ref
#        - PROJECTION_1_TO_2      : Entry = anchor_high + 2.0 * W_ref
#   4. Configurable entry tolerance (e.g., 0.1% = 0.001 relative to W_ref
#      or relative to price axis) and structural stop-loss calculation.
#   5. Strict Single Active Entry Lifecycle management (PENDING -> ACTIVE ->
#      RESOLVED) preventing overlapping signals per strategy stream.
#   6. Trade outcome tracking: MFE (Max Favorable Excursion), MAE (Max Adverse
#      Excursion), R-multiple realized, bars held, and Win/Loss classification.
#   7. Comprehensive failure case taxonomy & timezone-specific performance
#      reporting (session buckets & local hour diagnostics).
# ==============================================================================

suppressWarnings({
  options(scipen = 999, digits = 6)
})

# ------------------------------------------------------------------------------
# 1. DATA INGESTION & TIMEZONE NORMALIZATION
# ------------------------------------------------------------------------------
#' Prepare and validate raw OHLC data with timezone conversion
#'
#' @param df A data.frame containing timestamp, open, high, low, close, and optional volume/timezone
#' @param source_tz Source timezone of input timestamps (default "UTC")
#' @param target_tz Target reporting timezone (e.g., "UTC", "Asia/Kolkata", "Asia/Dubai", "America/New_York")
#' @return Normalized OHLC data.frame sorted chronologically with timezone metadata
prepare_ohlc_data <- function(df, source_tz = "UTC", target_tz = "UTC") {
  required_cols <- c("timestamp", "open", "high", "low", "close")
  col_names_lower <- tolower(colnames(df))
  colnames(df) <- col_names_lower

  missing_cols <- setdiff(required_cols, colnames(df))
  if (length(missing_cols) > 0) {
    stop(sprintf("SCHEMA_ERROR: Missing required OHLC columns: %s",
                 paste(missing_cols, collapse = ", ")))
  }

  # Parse timestamps (supports epoch milliseconds, epoch seconds, or ISO-8601 strings)
  if (is.numeric(df$timestamp)) {
    max_ts <- max(df$timestamp, na.rm = TRUE)
    epoch_sec <- if (max_ts > 1e11) df$timestamp / 1000 else df$timestamp
    dt_utc <- as.POSIXct(epoch_sec, origin = "1970-01-01", tz = "UTC")
  } else {
    dt_utc <- as.POSIXct(as.character(df$timestamp), tz = source_tz)
    dt_utc <- as.POSIXct(format(dt_utc, tz = "UTC", usetz = TRUE), tz = "UTC")
  }

  if (any(is.na(dt_utc))) {
    stop("TIMESTAMP_ERROR: Unable to parse one or more timestamps into valid POSIXct.")
  }

  df$datetime_utc <- dt_utc
  df$datetime_local <- as.POSIXct(format(dt_utc, tz = target_tz, usetz = FALSE), tz = target_tz)
  df$local_timezone <- target_tz
  df$local_hour <- as.integer(format(dt_utc, format = "%H", tz = target_tz))
  df$local_date <- format(dt_utc, format = "%Y-%m-%d", tz = target_tz)

  # Classify local trading session bucket
  df$session_bucket <- ifelse(
    df$local_hour >= 0 & df$local_hour < 8, "00:00-07:59 (Asian/Early)",
    ifelse(df$local_hour >= 8 & df$local_hour < 16, "08:00-15:59 (London/Mid)",
           "16:00-23:59 (NY/Late)")
  )

  # Ensure numeric price columns
  df$open  <- as.numeric(df$open)
  df$high  <- as.numeric(df$high)
  df$low   <- as.numeric(df$low)
  df$close <- as.numeric(df$close)
  if (!("volume" %in% colnames(df))) {
    df$volume <- 0
  } else {
    df$volume <- as.numeric(df$volume)
  }

  # Sort strictly in chronological order (no look-ahead)
  ord <- order(df$datetime_utc)
  df <- df[ord, , drop = FALSE]
  rownames(df) <- NULL
  df$bar_index <- seq_len(nrow(df))

  return(df)
}

# ------------------------------------------------------------------------------
# 2. ANCHOR CANDLE IDENTIFICATION & W_ref CALCULATION
# ------------------------------------------------------------------------------
#' Identify SRBMPR-25/26 anchor candles and compute Upper Wick Reference (W_ref)
#'
#' @param ohlc Normalized OHLC data.frame from prepare_ohlc_data()
#' @param swing_lookback Number of preceding/following bars to confirm structural high/wick
#' @param min_wick_ratio Minimum ratio of Upper Wick (W_ref) to total candle range (default 0.15)
#' @param Rocket_ratios Numeric vector of Rocket target multiples (1:1 to 1:100)
#' @return Data.frame with anchor candle flags, W_ref, internal midpoint, and 1:1/1:2/Rocket levels
identify_anchor_candles <- function(ohlc,
                                    swing_lookback = 5,
                                    min_wick_ratio = 0.15,
                                    rocket_ratios = c(1, 2, 3, 5, 10, 20, 30, 50, 100)) {
  n <- nrow(ohlc)
  if (n < (2 * swing_lookback + 5)) {
    stop("INSUFFICIENT_DATA: Need at least 2 * swing_lookback + 5 bars to identify anchors.")
  }

  body_top    <- pmax(ohlc$open, ohlc$close)
  body_bottom <- pmin(ohlc$open, ohlc$close)
  candle_rng  <- pmax(ohlc$high - ohlc$low, 1e-8)
  upper_wick  <- pmax(0, ohlc$high - body_top)
  wick_ratio  <- upper_wick / candle_rng

  # Rolling average range for fallback structural floor
  avg_rng <- mean(candle_rng, na.rm = TRUE)
  min_w_ref_floor <- max(avg_rng * 0.10, ohlc$close[1] * 0.0002)

  is_anchor <- rep(FALSE, n)
  w_ref_vec <- rep(NA_real_, n)

  # Evaluate candidate anchor bars strictly using historical window [i - swing_lookback, i]
  # to prevent look-ahead bias on bar i
  for (i in (swing_lookback + 1):n) {
    win_start <- max(1, i - swing_lookback)
    window_highs <- ohlc$high[win_start:i]
    is_local_high <- (ohlc$high[i] >= max(window_highs))
    has_meaningful_wick <- (upper_wick[i] >= min_w_ref_floor) && (wick_ratio[i] >= min_wick_ratio)

    if (is_local_high && has_meaningful_wick) {
      is_anchor[i] <- TRUE
      w_ref_vec[i] <- upper_wick[i]
    }
  }

  ohlc$body_top <- body_top
  ohlc$body_bottom <- body_bottom
  ohlc$upper_wick <- upper_wick
  ohlc$is_anchor <- is_anchor
  ohlc$w_ref <- w_ref_vec

  # Entry & projection coordinates defined when is_anchor == TRUE:
  # 1. Internal Wick Midpoint Entry: midpoint between body_top and anchor high
  ohlc$entry_wick_midpoint <- ifelse(is_anchor, body_top + 0.5 * w_ref_vec, NA_real_)
  # 2. 1:1 Projection Level: Anchor High + 1 * W_ref
  ohlc$proj_1_1 <- ifelse(is_anchor, ohlc$high + 1.0 * w_ref_vec, NA_real_)
  # 3. 1:2 Projection Level: Anchor High + 2 * W_ref
  ohlc$proj_1_2 <- ifelse(is_anchor, ohlc$high + 2.0 * w_ref_vec, NA_real_)
  # 4. 1:3 Projection Level: Anchor High + 3 * W_ref
  ohlc$proj_1_3 <- ifelse(is_anchor, ohlc$high + 3.0 * w_ref_vec, NA_real_)
  # 5. 1:5 Projection Level: Anchor High + 5 * W_ref
  ohlc$proj_1_5 <- ifelse(is_anchor, ohlc$high + 5.0 * w_ref_vec, NA_real_)

  # Attach Rocket Target columns (1:1, 1:2, 1:3, 1:5, 1:10, 1:20, 1:30, 1:50, 1:100)
  for (r in rocket_ratios) {
    col_key <- paste0("rocket_1_", r)
    ohlc[[col_key]] <- ifelse(is_anchor, ohlc$high + r * w_ref_vec, NA_real_)
  }

  return(ohlc)
}

# ------------------------------------------------------------------------------
# 3. TRADE SIMULATION WITH ACTIVE ENTRY LIFECYCLE & TOLERANCE BAND
# ------------------------------------------------------------------------------
#' Simulate a specific SRBMPR-25/26 entry strategy with strict single-active lifecycle
#'
#' @param ohlc Data.frame returned by identify_anchor_candles()
#' @param strategy One of "INTERNAL_WICK_MIDPOINT", "PROJECTION_1_TO_1", "PROJECTION_1_TO_2"
#' @param tolerance_wref Relative tolerance wrt W_ref (default 0.001 = 0.1% of W_ref)
#' @param sl_mode Stop-loss mode: "W_REF_UNIT" (1.0 * W_ref) or "ASSET_0_1_PCT" (0.1% of entry)
#' @param target_r_multiple Target multiple in W_ref units from entry (default 1.0 or 2.0)
#' @param max_wait_bars Max bars to wait for pending entry fill before expiring setup
#' @param max_hold_bars Max bars to hold an active trade before time-window expiry
#' @return Data.frame of all simulated setup lifecycles (filled and unfilled)
simulate_strategy_lifecycle <- function(ohlc,
                                        strategy = c("INTERNAL_WICK_MIDPOINT",
                                                     "PROJECTION_1_TO_1",
                                                     "PROJECTION_1_TO_2"),
                                        tolerance_wref = 0.001,
                                        sl_mode = c("W_REF_UNIT", "ASSET_0_1_PCT"),
                                        target_r_multiple = NULL,
                                        max_wait_bars = 15,
                                        max_hold_bars = 30) {
  strategy <- match.arg(strategy)
  sl_mode  <- match.arg(sl_mode)
  n <- nrow(ohlc)

  trades <- list()
  trade_counter <- 0

  # Single Active Entry Lifecycle State Machine:
  # States: "IDLE" -> "PENDING_FILL" -> "ACTIVE_TRADE" -> resolves to "IDLE"
  lifecycle_state <- "IDLE"
  active_setup <- NULL

  for (i in seq_len(n)) {
    bar <- ohlc[i, ]

    # --------------------------------------------------------------------------
    # STATE A: ACTIVE_TRADE — update MFE, MAE, and check SL / Target / Expiry
    # --------------------------------------------------------------------------
    if (lifecycle_state == "ACTIVE_TRADE") {
      active_setup$bars_held <- active_setup$bars_held + 1L

      # Track intra-bar excursions (LONG continuation along W_ref projection pipe)
      favorable_exc <- bar$high - active_setup$fill_price
      adverse_exc   <- active_setup$fill_price - bar$low

      if (favorable_exc > active_setup$mfe_price) {
        active_setup$mfe_price <- favorable_exc
      }
      if (adverse_exc > active_setup$mae_price) {
        active_setup$mae_price <- adverse_exc
      }
      if (bar$high >= active_setup$planned_entry) {
        active_setup$cleared_exact_entry <- TRUE
      }

      hit_sl     <- (bar$low <= active_setup$sl_price)
      hit_target <- (bar$high >= active_setup$target_price)
      timed_out  <- (active_setup$bars_held >= max_hold_bars)

      if (hit_sl || hit_target || timed_out) {
        active_setup$exit_bar_index <- i
        active_setup$exit_time_utc  <- bar$datetime_utc
        active_setup$exit_time_local <- bar$datetime_local

        # Conservative conflict resolution: if both SL and Target touched in same bar,
        # evaluate based on open proximity or mark SL first
        if (hit_sl && hit_target) {
          if (abs(bar$open - active_setup$sl_price) <= abs(bar$open - active_setup$target_price)) {
            hit_target <- FALSE
          } else {
            hit_sl <- FALSE
          }
        }

        if (hit_target) {
          active_setup$status <- "WIN"
          active_setup$exit_price <- active_setup$target_price
          active_setup$realized_r <- (active_setup$target_price - active_setup$fill_price) / active_setup$risk_distance
          active_setup$failure_case <- "NONE_TARGET_REACHED"
        } else if (hit_sl) {
          active_setup$status <- "LOSS"
          active_setup$exit_price <- active_setup$sl_price
          active_setup$realized_r <- -1.0

          mfe_r_Now <- active_setup$mfe_price / active_setup$risk_distance
          if (!active_setup$cleared_exact_entry && active_setup$filled_via_tolerance) {
            active_setup$failure_case <- "TOLERANCE_SLIPPAGE_STOP"
          } else if (active_setup$bars_held <= 2 && mfe_r_Now < 0.25) {
            active_setup$failure_case <- "IMMEDIATE_WICK_REJECTION"
          } else if (mfe_r_Now >= 0.70) {
            active_setup$failure_case <- "NEAR_MISS_REVERSAL"
          } else {
            active_setup$failure_case <- "STRUCTURAL_TREND_FAILURE"
          }
        } else {
          # Time window expired without hitting SL or Target
          active_setup$exit_price <- bar$close
          pnl_points <- bar$close - active_setup$fill_price
          active_setup$realized_r <- pnl_points / active_setup$risk_distance
          active_setup$status <- ifelse(active_setup$realized_r > 0, "WIN_TIME_EXIT", "LOSS_TIME_EXIT")
          active_setup$failure_case <- "TIME_DECAY_EXPIRED"
        }

        active_setup$mfe_r <- active_setup$mfe_price / active_setup$risk_distance
        active_setup$mae_r <- active_setup$mae_price / active_setup$risk_distance
        active_setup$mfe_wref <- active_setup$mfe_price / active_setup$w_ref
        active_setup$mae_wref <- active_setup$mae_price / active_setup$w_ref

        trade_counter <- trade_counter + 1L
        trades[[trade_counter]] <- as.data.frame(active_setup, stringsAsFactors = FALSE)

        lifecycle_state <- "IDLE"
        active_setup <- NULL
      }
      next
    }

    # --------------------------------------------------------------------------
    # STATE B: PENDING_FILL — check if bar enters [entry - tol, entry + tol]
    # --------------------------------------------------------------------------
    if (lifecycle_state == "PENDING_FILL") {
      active_setup$wait_bars_elapsed <- active_setup$wait_bars_elapsed + 1L

      # Check structural invalidation before fill (price breaks below anchor low)
      if (bar$low < active_setup$anchor_low) {
        active_setup$status <- "UNFILLED_INVALIDATED"
        active_setup$failure_case <- "ANCHOR_LOW_BROKEN_PRE_FILL"
        active_setup$exit_bar_index <- i
        active_setup$exit_time_utc <- bar$datetime_utc
        active_setup$exit_time_local <- bar$datetime_local
        trade_counter <- trade_counter + 1L
        trades[[trade_counter]] <- as.data.frame(active_setup, stringsAsFactors = FALSE)
        lifecycle_state <- "IDLE"
        active_setup <- NULL
        next
      }

      # Check if candle range intersects the tolerance band around planned_entry
      band_low  <- active_setup$planned_entry - active_setup$tolerance_abs
      band_high <- active_setup$planned_entry + active_setup$tolerance_abs

      is_touched <- (bar$high >= band_low) && (bar$low <= band_high)
      # Also trigger if price gaps/expands through projection level
      is_break_through <- (bar$low <= active_setup$planned_entry && bar$high >= active_setup$planned_entry)

      if (is_touched || is_break_through) {
        fill_px <- if (bar$low <= active_setup$planned_entry && bar$high >= active_setup$planned_entry) {
          active_setup$planned_entry
        } else if (bar$high >= band_low && bar$high < active_setup$planned_entry) {
          band_low
        } else {
          band_high
        }

        active_setup$fill_bar_index <- i
        active_setup$fill_time_utc <- bar$datetime_utc
        active_setup$fill_time_local <- bar$datetime_local
        active_setup$fill_price <- fill_px
        active_setup$filled_via_tolerance <- abs(fill_px - active_setup$planned_entry) > 1e-9
        active_setup$cleared_exact_entry <- (bar$high >= active_setup$planned_entry)
        lifecycle_state <- "ACTIVE_TRADE"
        next
      }

      if (active_setup$wait_bars_elapsed >= max_wait_bars) {
        active_setup$status <- "UNFILLED_EXPIRED"
        active_setup$failure_case <- "UNFILLED_ORDER_EXPIRED"
        active_setup$exit_bar_index <- i
        active_setup$exit_time_utc <- bar$datetime_utc
        active_setup$exit_time_local <- bar$datetime_local
        trade_counter <- trade_counter + 1L
        trades[[trade_counter]] <- as.data.frame(active_setup, stringsAsFactors = FALSE)
        lifecycle_state <- "IDLE"
        active_setup <- NULL
      }
      next
    }

    # --------------------------------------------------------------------------
    # STATE C: IDLE — arm a new setup when an Anchor Candle is identified
    # --------------------------------------------------------------------------
    if (lifecycle_state == "IDLE" && isTRUE(bar$is_anchor)) {
      w_ref <- bar$w_ref
      if (is.na(w_ref) || w_ref <= 0) next

      if (strategy == "INTERNAL_WICK_MIDPOINT") {
        planned_entry <- bar$entry_wick_midpoint
        default_r_mult <- 1.5 # Midpoint (0.5 W_ref below high) to 1:1 projection (+1.0 W_ref above high) = 1.5 W_ref
      } else if (strategy == "PROJECTION_1_TO_1") {
        planned_entry <- bar$proj_1_1
        default_r_mult <- 1.0 # 1:1 projection to 1:2 projection = 1.0 W_ref
      } else {
        planned_entry <- bar$proj_1_2
        default_r_mult <- 1.0 # 1:2 projection to 1:3 projection = 1.0 W_ref
      }

      r_mult <- if (is.null(target_r_multiple)) default_r_mult else target_r_multiple

      # Tolerance calculation: configurable tolerance relative to W_ref (e.g., 0.1% = 0.001 * W_ref)
      tolerance_abs <- max(w_ref * tolerance_wref, planned_entry * 0.00005)

      # Structural Stop-Loss distance
      risk_distance <- if (sl_mode == "W_REF_UNIT") {
        w_ref
      } else {
        max(planned_entry * 0.001, w_ref * 0.5)
      }

      sl_price     <- planned_entry - risk_distance
      target_price <- planned_entry + (r_mult * w_ref)

      active_setup <- list(
        setup_id             = sprintf("SRB-%s-%04d", substr(strategy, 1, 6), i),
        strategy             = strategy,
        anchor_bar_index     = i,
        anchor_time_utc      = bar$datetime_utc,
        anchor_time_local    = bar$datetime_local,
        local_timezone       = bar$local_timezone,
        local_hour           = bar$local_hour,
        session_bucket       = bar$session_bucket,
        anchor_high          = bar$high,
        anchor_low           = bar$low,
        body_top             = bar$body_top,
        w_ref                = w_ref,
        planned_entry        = planned_entry,
        tolerance_wref_Ratio = tolerance_wref,
        tolerance_abs        = tolerance_abs,
        sl_price             = sl_price,
        target_price         = target_price,
        risk_distance        = risk_distance,
        wait_bars_elapsed    = 0L,
        fill_bar_index       = NA_integer_,
        fill_time_utc        = as.POSIXct(NA, origin = "1970-01-01", tz = "UTC"),
        fill_time_local      = as.POSIXct(NA, origin = "1970-01-01", tz = bar$local_timezone),
        fill_price           = NA_real_,
        filled_via_tolerance = FALSE,
        cleared_exact_entry  = FALSE,
        bars_held            = 0L,
        mfe_price            = 0.0,
        mae_price            = 0.0,
        mfe_r                = 0.0,
        mae_r                = 0.0,
        mfe_wref             = 0.0,
        mae_wref             = 0.0,
        exit_bar_index       = NA_integer_,
        exit_time_utc        = as.POSIXct(NA, origin = "1970-01-01", tz = "UTC"),
        exit_time_local      = as.POSIXct(NA, origin = "1970-01-01", tz = bar$local_timezone),
        exit_price           = NA_real_,
        realized_r           = 0.0,
        status               = "PENDING",
        failure_case         = "NONE"
      )

      lifecycle_state <- "PENDING_FILL"
    }
  }

  if (length(trades) == 0) {
    return(data.frame())
  }

  result_df <- do.call(rbind, trades)
  rownames(result_df) <- NULL
  return(result_df)
}

# ------------------------------------------------------------------------------
# 4. PERFORMANCE, EXPECTANCY, FAILURE TAXONOMY & TIMEZONE REPORTING
# ------------------------------------------------------------------------------
#' Compute strategy-level summary metrics, failure cases, and timezone breakdown
#'
#' @param trades_df Combined data.frame of simulated trades across strategies
#' @return A list containing strategy_metrics, failure_breakdown, and timezone_performance
generate_backtest_report <- function(trades_df) {
  if (nrow(trades_df) == 0) {
    stop("EMPTY_TRADES: No setups were generated for the provided dataset.")
  }

  strategies <- unique(trades_df$strategy)
  strat_rows <- list()

  for (s in strategies) {
    sub_all <- trades_df[trades_df$strategy == s, , drop = FALSE]
    filled  <- sub_all[sub_all$status %in% c("WIN", "LOSS", "WIN_TIME_EXIT", "LOSS_TIME_EXIT"), , drop = FALSE]

    total_setups <- nrow(sub_all)
    n_filled     <- nrow(filled)
    fill_rate    <- if (total_setups > 0) (n_filled / total_setups) * 100 else 0

    if (n_filled > 0) {
      wins   <- filled[filled$status %in% c("WIN", "WIN_TIME_EXIT"), , drop = FALSE]
      losses <- filled[filled$status %in% c("LOSS", "LOSS_TIME_EXIT"), , drop = FALSE]

      win_rate   <- (nrow(wins) / n_filled) * 100
      avg_win_r  <- if (nrow(wins) > 0) mean(wins$realized_r, na.rm = TRUE) else 0
      avg_loss_r <- if (nrow(losses) > 0) abs(mean(losses$realized_r, na.rm = TRUE)) else 0
      win_prob   <- nrow(wins) / n_filled
      loss_prob  <- nrow(losses) / n_filled

      # Mathematical Expectancy per trade (in R multiples)
      expectancy_r <- (win_prob * avg_win_r) - (loss_prob * avg_loss_r)

      gross_profit <- sum(wins$realized_r, na.rm = TRUE)
      gross_loss   <- abs(sum(losses$realized_r, na.rm = TRUE))
      profit_factor <- if (gross_loss > 0) gross_profit / gross_loss else ifelse(gross_profit > 0, Inf, 0)

      avg_mfe_r    <- mean(filled$mfe_r, na.rm = TRUE)
      avg_mae_r    <- mean(filled$mae_r, na.rm = TRUE)
      avg_bars     <- mean(filled$bars_held, na.rm = TRUE)
    } else {
      win_rate <- 0; avg_win_r <- 0; avg_loss_r <- 0; expectancy_r <- 0
      profit_factor <- 0; avg_mfe_r <- 0; avg_mae_r <- 0; avg_bars <- 0
    }

    strat_rows[[s]] <- data.frame(
      strategy      = s,
      total_setups  = total_setups,
      filled_trades = n_filled,
      fill_rate_pct = round(fill_rate, 2),
      win_rate_pct  = round(win_rate, 2),
      avg_win_r     = round(avg_win_r, 3),
      avg_loss_r    = round(avg_loss_r, 3),
      expectancy_r  = round(expectancy_r, 3),
      profit_factor = round(profit_factor, 2),
      avg_mfe_r     = round(avg_mfe_r, 3),
      avg_mae_r     = round(avg_mae_r, 3),
      avg_bars_held = round(avg_bars, 1),
      stringsAsFactors = FALSE
    )
  }

  strategy_metrics <- do.call(rbind, strat_rows)
  rownames(strategy_metrics) <- NULL

  # Failure Case Breakdown per Strategy
  failed_only <- trades_df[trades_df$failure_case != "NONE_TARGET_REACHED", , drop = FALSE]
  if (nrow(failed_only) > 0) {
    failure_table <- as.data.frame(
      table(Strategy = failed_only$strategy, Failure_Case = failed_only$failure_case),
      stringsAsFactors = FALSE
    )
    failure_table <- failure_table[failure_table$Freq > 0, , drop = FALSE]
  } else {
    failure_table <- data.frame(Strategy = character(), Failure_Case = character(), Freq = integer())
  }

  # Timezone & Session Bucket Performance (on Filled Trades)
  filled_all <- trades_df[trades_df$status %in% c("WIN", "LOSS", "WIN_TIME_EXIT", "LOSS_TIME_EXIT"), , drop = FALSE]
  tz_rows <- list()
  if (nrow(filled_all) > 0) {
    groups <- unique(filled_all[, c("local_timezone", "session_bucket"), drop = FALSE])
    for (idx in seq_len(nrow(groups))) {
      tz_val  <- groups$local_timezone[idx]
      ses_val <- groups$session_bucket[idx]
      sub_tz  <- filled_all[filled_all$local_timezone == tz_val & filled_all$session_bucket == ses_val, , drop = FALSE]
      w_cnt   <- sum(sub_tz$status %in% c("WIN", "WIN_TIME_EXIT"))
      n_cnt   <- nrow(sub_tz)
      wr      <- (w_cnt / n_cnt) * 100
      exp_r   <- mean(sub_tz$realized_r, na.rm = TRUE)
      mfe_r   <- mean(sub_tz$mfe_r, na.rm = TRUE)
      mae_r   <- mean(sub_tz$mae_r, na.rm = TRUE)

      tz_rows[[idx]] <- data.frame(
        timezone       = tz_val,
        session_bucket = ses_val,
        filled_trades  = n_cnt,
        win_rate_pct   = round(wr, 2),
        expectancy_r   = round(exp_r, 3),
        avg_mfe_r      = round(mfe_r, 3),
        avg_mae_r      = round(mae_r, 3),
        stringsAsFactors = FALSE
      )
    }
  }
  timezone_performance <- if (length(tz_rows) > 0) do.call(rbind, tz_rows) else data.frame()

  return(list(
    strategy_metrics     = strategy_metrics,
    failure_breakdown    = failure_table,
    timezone_performance = timezone_performance,
    trades_ledger        = trades_df
  ))
}

# ------------------------------------------------------------------------------
# 5. MASTER RUNNER & FORMATTED CONSOLE REPORT PRINTER
# ------------------------------------------------------------------------------
#' Run complete SRBMPR-25/26 multi-strategy backtest and print comprehensive report
run_srbmpr_25_26_backtest <- function(raw_df,
                                      source_tz = "UTC",
                                      target_tz = "Asia/Kolkata",
                                      tolerance_wref = 0.001,
                                      swing_lookback = 5,
                                      sl_mode = "W_REF_UNIT",
                                      max_wait_bars = 15,
                                      max_hold_bars = 30,
                                      verbose = TRUE) {
  ohlc <- prepare_ohlc_data(raw_df, source_tz = source_tz, target_tz = target_tz)
  ohlc <- identify_anchor_candles(ohlc, swing_lookback = swing_lookback)

  strategies <- c("INTERNAL_WICK_MIDPOINT", "PROJECTION_1_TO_1", "PROJECTION_1_TO_2")
  all_trades <- lapply(strategies, function(strat) {
    simulate_strategy_lifecycle(
      ohlc           = ohlc,
      strategy       = strat,
      tolerance_wref = tolerance_wref,
      sl_mode        = sl_mode,
      max_wait_bars  = max_wait_bars,
      max_hold_bars  = max_hold_bars
    )
  })

  combined_trades <- do.call(rbind, all_trades)
  report <- generate_backtest_report(combined_trades)

  if (verbose) {
    cat("================================================================================\n")
    cat("         SRBMPR-25/26 MODEL QUANTITATIVE BACKTEST REPORT (R ENGINE)             \n")
    cat("================================================================================\n")
    cat(sprintf("Bars Analyzed   : %dbars (%s to %s)\n",
                nrow(ohlc),
                format(min(ohlc$datetime_local), "%Y-%m-%d %H:%M %Z"),
                format(max(ohlc$datetime_local), "%Y-%m-%d %H:%M %Z")))
    cat(sprintf("Reporting TZ    : %s | Anchor Candles Identified: %d\n",
                target_tz, sum(ohlc$is_anchor, na.rm = TRUE)))
    cat(sprintf("Tolerance Band  : %.3f%% of W_ref | Stop-Loss Mode: %s\n",
                tolerance_wref * 100, sl_mode))
    cat("--------------------------------------------------------------------------------\n")
    cat("1. STRATEGY PERFORMANCE & EXPECTANCY SUMMARY\n")
    cat("--------------------------------------------------------------------------------\n")
    print(report$strategy_metrics, row.names = FALSE)
    cat("\n--------------------------------------------------------------------------------\n")
    cat("2. SPECIFIC FAILURE CASE TAXONOMY BY ENTRY STRATEGY\n")
    cat("--------------------------------------------------------------------------------\n")
    if (nrow(report$failure_breakdown) > 0) {
      print(report$failure_breakdown, row.names = FALSE)
    } else {
      cat("No failure cases recorded.\n")
    }
    cat("\n--------------------------------------------------------------------------------\n")
    cat(sprintf("3. TIMEZONE-SPECIFIC SESSION PERFORMANCE (%s)\n", target_tz))
    cat("--------------------------------------------------------------------------------\n")
    if (nrow(report$timezone_performance) > 0) {
      print(report$timezone_performance, row.names = FALSE)
    } else {
      cat("No filled trades to segment by timezone session.\n")
    }
    cat("================================================================================\n")
  }

  invisible(report)
}

# ------------------------------------------------------------------------------
# 6. CLI EXECUTION ENTRY POINT (WITH SELF-CONTAINED VERIFICATION DATASET)
# ------------------------------------------------------------------------------
if (!interactive() && identical(sys.nframe(), 0L)) {
  args <- commandArgs(trailingOnly = TRUE)
  input_csv <- NULL
  target_tz <- "Asia/Kolkata"
  tol_val   <- 0.001

  if (length(args) > 0) {
    for (k in seq_along(args)) {
      if (args[k] == "--input" && k < length(args)) input_csv <- args[k + 1]
      if (args[k] == "--tz"    && k < length(args)) target_tz <- args[k + 1]
      if (args[k] == "--tolerance" && k < length(args)) tol_val <- as.numeric(args[k + 1])
    }
  }

  if (!is.null(input_csv) && file.exists(input_csv)) {
    raw_df <- read.csv(input_csv, stringsAsFactors = FALSE)
  } else {
    # Deterministic 500-bar OHLC verification dataset if no CSV is supplied
    set.seed(2526)
    n_bars <- 500
    base_ts <- as.numeric(as.POSIXct("2026-10-01 00:00:00", tz = "UTC")) + seq(0, by = 60, length.out = n_bars)
    price <- 68400 + cumsum(rnorm(n_bars, mean = 2.5, sd = 35))
    open_px  <- price
    close_px <- price + rnorm(n_bars, mean = 3, sd = 28)
    wick_up  <- abs(rnorm(n_bars, mean = 22, sd = 18))
    wick_dn  <- abs(rnorm(n_bars, mean = 18, sd = 14))
    high_px  <- pmax(open_px, close_px) + wick_up
    low_px   <- pmin(open_px, close_px) - wick_dn

    raw_df <- data.frame(
      timestamp = base_ts,
      open      = round(open_px, 2),
      high      = round(high_px, 2),
      low       = round(low_px, 2),
      close     = round(close_px, 2),
      volume    = round(runif(n_bars, 15, 240), 2)
    )
  }

  run_srbmpr_25_26_backtest(
    raw_df         = raw_df,
    source_tz      = "UTC",
    target_tz      = target_tz,
    tolerance_wref = tol_val
  )
}
