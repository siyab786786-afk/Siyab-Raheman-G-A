import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pause, Play, RotateCcw, SkipBack, SkipForward } from 'lucide-react';
import { CandleData } from '../types/terminal';
import {
  backward, createForwardTestState, forward, jumpToTimestamp, reset,
  togglePlay, validateCandles, visibleCandles,
} from '../services/forwardTestEngine';

interface Props {
  candles: CandleData[];
  symbol: string;
  timeframe: string;
}

const PAD = { top: 24, right: 84, bottom: 34, left: 12 };

function formatPrice(value: number, precision: number) {
  return value.toLocaleString(undefined, { minimumFractionDigits: precision, maximumFractionDigits: precision });
}

export const ForwardTestCandlestickWorkspace: React.FC<Props> = ({ candles, symbol, timeframe }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [state, setState] = useState(() => createForwardTestState(Math.max(candles.length, 1), Math.max(0, candles.length - 30)));
  const [timestampInput, setTimestampInput] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!candles.length) return;
    try {
      validateCandles(candles);
      setError(null);
      setState(createForwardTestState(candles.length, Math.max(0, candles.length - 30)));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Invalid candle data');
    }
  }, [candles]);

  const revealed = useMemo(() => visibleCandles(candles, state), [candles, state]);
  const current = revealed.at(-1);
  const precision = useMemo(() => current && current.close < 1 ? 8 : 2, [current]);

  useEffect(() => {
    if (!state.isPlaying || !candles.length) return;
    const timer = window.setInterval(() => {
      setState(previous => forward(previous, candles.length));
    }, state.speedMs);
    return () => window.clearInterval(timer);
  }, [state.isPlaying, state.speedMs, candles.length]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !revealed.length) return;
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, rect.width, rect.height);

    const windowCandles = revealed.slice(-120);
    const minPrice = Math.min(...windowCandles.map(c => c.low));
    const maxPrice = Math.max(...windowCandles.map(c => c.high));
    const range = Math.max(maxPrice - minPrice, Number.EPSILON);
    const width = rect.width - PAD.left - PAD.right;
    const height = rect.height - PAD.top - PAD.bottom;
    const y = (price: number) => PAD.top + ((maxPrice - price) / range) * height;

    ctx.strokeStyle = '#20242b';
    ctx.fillStyle = '#8b949e';
    ctx.font = '11px ui-monospace, SFMono-Regular, Menlo, monospace';
    ctx.textAlign = 'left';
    for (let line = 0; line <= 5; line += 1) {
      const lineY = PAD.top + (height / 5) * line;
      ctx.beginPath(); ctx.moveTo(PAD.left, lineY); ctx.lineTo(rect.width - PAD.right, lineY); ctx.stroke();
      ctx.fillText(formatPrice(maxPrice - (range / 5) * line, precision), rect.width - PAD.right + 8, lineY + 4);
    }

    const step = width / Math.max(windowCandles.length, 1);
    const bodyWidth = Math.max(2, Math.min(10, step * 0.62));
    windowCandles.forEach((candle, index) => {
      const x = PAD.left + index * step + step / 2;
      const rising = candle.close >= candle.open;
      ctx.strokeStyle = rising ? '#22c55e' : '#ef4444';
      ctx.fillStyle = ctx.strokeStyle;
      ctx.beginPath(); ctx.moveTo(x, y(candle.high)); ctx.lineTo(x, y(candle.low)); ctx.stroke();
      const bodyTop = y(Math.max(candle.open, candle.close));
      const bodyBottom = y(Math.min(candle.open, candle.close));
      ctx.fillRect(x - bodyWidth / 2, bodyTop, bodyWidth, Math.max(1, bodyBottom - bodyTop));
    });

    if (current) {
      const currentY = y(current.close);
      ctx.setLineDash([5, 4]); ctx.strokeStyle = '#f59e0b';
      ctx.beginPath(); ctx.moveTo(PAD.left, currentY); ctx.lineTo(rect.width - PAD.right, currentY); ctx.stroke();
      ctx.setLineDash([]);
    }
  }, [revealed, current, precision]);

  useEffect(() => {
    draw();
    const observer = new ResizeObserver(draw);
    if (canvasRef.current) observer.observe(canvasRef.current);
    return () => observer.disconnect();
  }, [draw]);

  const navigate = () => {
    if (!timestampInput || !candles.length) return;
    const timestamp = new Date(timestampInput).getTime();
    if (!Number.isFinite(timestamp)) return setError('Enter a valid UTC date and time');
    try {
      setState(previous => jumpToTimestamp(candles, previous, timestamp));
      setError(null);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Timestamp not found');
    }
  };

  if (!candles.length) return <section className="rounded-3xl border border-zinc-800 bg-zinc-950 p-8 text-zinc-400">Loading authentic OHLC candles…</section>;

  return (
    <section id="forward-test-workspace" className="overflow-hidden rounded-3xl border border-zinc-800 bg-[#0b0e11] shadow-2xl">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 px-4 py-3">
        <div>
          <div className="flex items-center gap-2"><strong className="text-white">{symbol}</strong><span className="rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-300">{timeframe}</span><span className="text-xs font-semibold text-amber-400">FORWARD TEST</span></div>
          <p className="mt-1 text-[10px] uppercase tracking-widest text-zinc-500">Bybit OHLC · future candles isolated · UTC timestamps</p>
        </div>
        {current && <div className="font-mono text-xs text-zinc-300">O {formatPrice(current.open, precision)} · H {formatPrice(current.high, precision)} · L {formatPrice(current.low, precision)} · C <span className="text-white">{formatPrice(current.close, precision)}</span></div>}
      </header>

      <div className="h-[58vh] min-h-[420px] w-full"><canvas ref={canvasRef} className="h-full w-full" aria-label="Forward testing OHLC candlestick chart" /></div>

      <footer className="flex flex-wrap items-center gap-2 border-t border-zinc-800 bg-zinc-950 px-4 py-3">
        <button aria-label="Backward one candle" onClick={() => setState(backward)} className="rounded-lg border border-zinc-700 p-2 hover:bg-zinc-800"><SkipBack size={16} /></button>
        <button aria-label={state.isPlaying ? 'Pause' : 'Play'} onClick={() => setState(previous => togglePlay(previous, candles.length))} className="rounded-lg bg-amber-500 p-2 text-black hover:bg-amber-400">{state.isPlaying ? <Pause size={16} /> : <Play size={16} />}</button>
        <button aria-label="Forward one candle" onClick={() => setState(previous => forward({ ...previous, isPlaying: false }, candles.length))} className="rounded-lg border border-zinc-700 p-2 hover:bg-zinc-800"><SkipForward size={16} /></button>
        <button aria-label="Reset" onClick={() => setState(reset)} className="rounded-lg border border-zinc-700 p-2 hover:bg-zinc-800"><RotateCcw size={16} /></button>
        <select value={state.speedMs} onChange={event => setState(previous => ({ ...previous, speedMs: Number(event.target.value) }))} className="rounded-lg border border-zinc-700 bg-zinc-900 px-2 py-2 text-xs">
          <option value={1200}>0.5×</option><option value={650}>1×</option><option value={300}>2×</option><option value={120}>5×</option>
        </select>
        <input type="datetime-local" step="60" value={timestampInput} onChange={event => setTimestampInput(event.target.value)} className="ml-auto rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs" />
        <button onClick={navigate} className="rounded-lg border border-amber-500/60 px-3 py-2 text-xs font-bold text-amber-400">Go to exact UTC candle</button>
        <span className="w-full font-mono text-[11px] text-zinc-500">Revealed {state.cursor + 1}/{candles.length} · {current ? new Date(current.timestamp).toISOString() : '—'} {error && <span className="ml-3 text-rose-400">{error}</span>}</span>
      </footer>
    </section>
  );
};

