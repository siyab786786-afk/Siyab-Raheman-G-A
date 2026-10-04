import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Coins, 
  CheckCircle2, 
  Activity, 
  TrendingUp, 
  Lock, 
  ArrowUpRight, 
  ShieldCheck, 
  RefreshCw,
  Terminal,
  Target
} from 'lucide-react';

interface MemeCoinData {
  symbol: string;
  name: string;
  price: number;
  decimals: number;
  vol24h: string;
  timezone: string;
  oneMinR: string;
  lockedEntry: number | null;
  lockedSl: number | null;
  lockedTarget: number | null;
  targetRr: 100 | 200;
  pnl: number | null;
  orderId: string | null;
  status: 'WAITING' | 'ORDER_SENT' | 'TARGET_HIT' | 'SL_HIT';
}

export const SrbmprMemePennyCoinsTerminal: React.FC = () => {
  const [coins, setCoins] = useState<MemeCoinData[]>([
    { symbol: 'PEPE/USDT', name: 'Pepe', price: 0.00000845, decimals: 8, vol24h: '$420M', timezone: 'Dubai 1-Min Latch', oneMinR: '1.5 Zone', lockedEntry: null, lockedSl: null, lockedTarget: null, targetRr: 100, pnl: null, orderId: null, status: 'WAITING' },
    { symbol: 'SHIB/USDT', name: 'Shiba Inu', price: 0.00001784, decimals: 8, vol24h: '$310M', timezone: 'Dubai 1-Min Latch', oneMinR: '1.5 Zone', lockedEntry: null, lockedSl: null, lockedTarget: null, targetRr: 100, pnl: null, orderId: null, status: 'WAITING' },
    { symbol: 'BONK/USDT', name: 'Bonk', price: 0.00002145, decimals: 8, vol24h: '$180M', timezone: 'Dubai 1-Min Latch', oneMinR: '1.5 Zone', lockedEntry: null, lockedSl: null, lockedTarget: null, targetRr: 200, pnl: null, orderId: null, status: 'WAITING' },
    { symbol: 'FLOKI/USDT', name: 'Floki', price: 0.00013450, decimals: 8, vol24h: '$140M', timezone: 'Dubai 1-Min Latch', oneMinR: '1.5 Zone', lockedEntry: null, lockedSl: null, lockedTarget: null, targetRr: 100, pnl: null, orderId: null, status: 'WAITING' },
    { symbol: 'BOME/USDT', name: 'Book of Meme', price: 0.00645000, decimals: 6, vol24h: '$95M', timezone: 'Dubai 1-Min Latch', oneMinR: '1.5 Zone', lockedEntry: null, lockedSl: null, lockedTarget: null, targetRr: 200, pnl: null, orderId: null, status: 'WAITING' },
    { symbol: 'MEW/USDT', name: 'Cat in a Dogs World', price: 0.00482000, decimals: 6, vol24h: '$80M', timezone: 'Dubai 1-Min Latch', oneMinR: '1.5 Zone', lockedEntry: null, lockedSl: null, lockedTarget: null, targetRr: 100, pnl: null, orderId: null, status: 'WAITING' },
    { symbol: 'DOGE/USDT', name: 'Dogecoin', price: 0.11450000, decimals: 5, vol24h: '$1.2B', timezone: 'Dubai 1-Min Latch', oneMinR: '1.5 Zone', lockedEntry: null, lockedSl: null, lockedTarget: null, targetRr: 100, pnl: null, orderId: null, status: 'WAITING' },
    { symbol: 'JASMY/USDT', name: 'JasmyCoin', price: 0.01850000, decimals: 5, vol24h: '$110M', timezone: 'Dubai 1-Min Latch', oneMinR: '1.5 Zone', lockedEntry: null, lockedSl: null, lockedTarget: null, targetRr: 200, pnl: null, orderId: null, status: 'WAITING' },
    { symbol: 'POPCAT/USDT', name: 'Popcat', price: 0.74500000, decimals: 4, vol24h: '$75M', timezone: 'Dubai 1-Min Latch', oneMinR: '1.5 Zone', lockedEntry: null, lockedSl: null, lockedTarget: null, targetRr: 100, pnl: null, orderId: null, status: 'WAITING' },
    { symbol: 'SR_COIN/USDT', name: 'SR Personal Research Coin', price: 0.01000000, decimals: 4, vol24h: '$250M', timezone: 'Dubai 1-Min Latch', oneMinR: '1.5 Zone', lockedEntry: null, lockedSl: null, lockedTarget: null, targetRr: 200, pnl: null, orderId: null, status: 'WAITING' }
  ]);

  const [notice, setNotice] = useState<string | null>(null);

  // Dubai Time Generator
  const getDubaiTimeNow = () => {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const dubaiOffset = 4;
    const dubai = new Date(utc + (3600000 * dubaiOffset));
    return dubai.toLocaleTimeString('en-US', { hour12: false });
  };

  const [dubaiTime, setDubaiTime] = useState<string>(getDubaiTimeNow());

  useEffect(() => {
    const timer = setInterval(() => {
      setDubaiTime(getDubaiTimeNow());

      // Simulate slight micro movements on current prices
      setCoins(prevCoins => 
        prevCoins.map(c => {
          const tickDelta = c.price * (Math.random() - 0.495) * 0.01; // small micro tick
          const nextPrice = parseFloat((c.price + tickDelta).toFixed(c.decimals));

          // If there is an active locked order, calculate fluctuating P&L based on locked entry, with absolutely NO price drift on Entry or SL!
          let nextPnl = c.pnl;
          let nextStatus = c.status;

          if (c.status === 'ORDER_SENT' && c.lockedEntry !== null && c.lockedSl !== null && c.lockedTarget !== null) {
            // Price fluctuation calculates actual P&L from $2 capital
            const multiplier = nextPrice / c.lockedEntry;
            nextPnl = parseFloat(((multiplier - 1) * 2).toFixed(4));

            // Check if SL or Target hit deterministically
            if (nextPrice <= c.lockedSl) {
              nextStatus = 'SL_HIT';
              nextPnl = -2.00; // Complete capital lock loss ($2)
            } else if (nextPrice >= c.lockedTarget) {
              nextStatus = 'TARGET_HIT';
              nextPnl = parseFloat((2 * c.targetRr).toFixed(2)); // massive 100x/200x reward payout
            }
          }

          return {
            ...c,
            price: nextPrice,
            pnl: nextPnl,
            status: nextStatus
          };
        })
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Place market order using $2 USD capital
  const handleMarketBuy = (symbol: string, rr: 100 | 200) => {
    setCoins(prevCoins => 
      prevCoins.map(c => {
        if (c.symbol === symbol) {
          // Entry price and SL are strictly locked, entry price does NOT move when price ticks!
          const entryPrice = c.price;
          
          // Tight micro risk of 0.5% for extreme R:R ratios
          const riskPercent = 0.005; 
          const sl = parseFloat((entryPrice * (1 - riskPercent)).toFixed(c.decimals));
          const target = parseFloat((entryPrice * (1 + riskPercent * rr)).toFixed(c.decimals));
          const orderId = `BYB-MEME-${Math.floor(Math.random() * 900000) + 100000}`;

          setNotice(`Market Order sent for ${c.symbol} with $2 capital at $${entryPrice}! Entry & SL strictly locked.`);
          setTimeout(() => setNotice(null), 4000);

          return {
            ...c,
            lockedEntry: entryPrice,
            lockedSl: sl,
            lockedTarget: target,
            targetRr: rr,
            pnl: 0,
            orderId,
            status: 'ORDER_SENT'
          };
        }
        return c;
      })
    );
  };

  const handleReset = (symbol: string) => {
    setCoins(prevCoins => 
      prevCoins.map(c => {
        if (c.symbol === symbol) {
          return {
            ...c,
            lockedEntry: null,
            lockedSl: null,
            lockedTarget: null,
            pnl: null,
            orderId: null,
            status: 'WAITING'
          };
        }
        return c;
      })
    );
  };

  return (
    <div id="meme-penny-coins-terminal" className="bg-[#02050A] border-2 border-cyan-500/50 rounded-[36px] p-6 sm:p-8 font-mono text-zinc-100 shadow-[0_0_100px_rgba(6,182,212,0.2)] space-y-6">
      
      {/* HEADER PANEL */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 border-b border-zinc-800 pb-5">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(6,182,212,0.3)] animate-pulse">
              <Coins className="w-4.5 h-4.5 text-cyan-400" />
              10 HIGH-VOLUME SUB-$1 MEME COIN CONDUITS
            </span>
            <span className="text-amber-400 text-xs font-black uppercase bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
              DUBAI TIME ZONE
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight italic">
            SR PERSONAL CRYPTO CONDUIT: <span className="text-cyan-400">$2 EXTREME R:R PORTAL (1:100 ➜ 1:200)</span>
          </h2>
          <p className="text-xs text-zinc-400 leading-relaxed max-w-4xl">
            <strong>$1 के नीचे के सूक्ष्म मीम कॉइन्स (Sub-$1 High-Volume Conduits):</strong> यहाँ १० सबसे सक्रिय छोटे कॉइन्स संकलित हैं। $2 के शुरुआती कैपिटल के साथ १-मिनट दुबई टाइम ज़ोन में प्रवेश करें। स्टॉप लॉस और प्रवेश मूल्य (Entry) पूरी तरह से लॉक रहेंगे, केवल और केवल आपका रीयल-टाइम लाभ (Profit/PnL) तरंगों के अनुसार परिवर्तित होगा।
          </p>
        </div>

        {/* Dubai Live Time Display */}
        <div className="bg-zinc-950 border border-zinc-900 p-4 rounded-3xl shrink-0 text-right">
          <span className="text-[8px] text-zinc-500 font-bold uppercase block">LIVE CLOCK</span>
          <span className="text-base font-black text-amber-400 font-mono">DUBAI {dubaiTime}</span>
        </div>
      </div>

      {notice && (
        <div className="p-3 bg-cyan-500/10 border border-cyan-500/40 rounded-xl text-cyan-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 animate-bounce" />
          <span>{notice}</span>
        </div>
      )}

      {/* 10 COINS GRID GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {coins.map(coin => {
          const isWaiting = coin.status === 'WAITING';
          const isSent = coin.status === 'ORDER_SENT';
          const isSlHit = coin.status === 'SL_HIT';
          const isTargetHit = coin.status === 'TARGET_HIT';

          return (
            <div 
              key={coin.symbol} 
              className={`p-4 rounded-3xl border transition-all flex flex-col justify-between h-[250px] relative overflow-hidden ${
                isSent
                  ? 'bg-cyan-950/20 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.15)] animate-pulse'
                  : isTargetHit
                    ? 'bg-emerald-950/20 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                    : isSlHit
                      ? 'bg-rose-950/20 border-rose-500/40'
                      : 'bg-zinc-950/60 border-zinc-900 hover:border-zinc-800'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs font-black text-white block truncate">{coin.symbol}</span>
                  <span className="text-[9px] text-zinc-500 font-bold block">{coin.name}</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 text-[8px] font-black uppercase">
                  {coin.vol24h} VOL
                </span>
              </div>

              {/* Price Fluctuation (Sub-$1) */}
              <div className="my-2.5">
                <span className="text-[8px] text-zinc-500 block font-bold uppercase">LIVE FEED</span>
                <span className="text-lg font-black text-white font-mono tabular-nums tracking-wide">
                  ${coin.price.toFixed(coin.decimals)}
                </span>
              </div>

              {/* Order State / Tracking */}
              {isWaiting && (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleMarketBuy(coin.symbol, 100)}
                      className="flex-1 py-2 bg-cyan-600 hover:bg-cyan-500 text-black font-black text-[10px] uppercase rounded-xl transition-all shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                    >
                      Buy (1:100)
                    </button>
                    <button
                      onClick={() => handleMarketBuy(coin.symbol, 200)}
                      className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-black font-black text-[10px] uppercase rounded-xl transition-all shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                    >
                      Buy (1:200)
                    </button>
                  </div>
                  <span className="text-[8px] text-zinc-500 block text-center font-semibold">1-Min Micro Entry with $2</span>
                </div>
              )}

              {isSent && coin.lockedEntry !== null && (
                <div className="space-y-1 bg-black/40 p-2.5 rounded-xl border border-cyan-500/20">
                  <div className="flex justify-between text-[8px] text-zinc-500">
                    <span>LOCKED ENTRY:</span>
                    <span className="text-white font-bold">${coin.lockedEntry.toFixed(coin.decimals)}</span>
                  </div>
                  <div className="flex justify-between text-[8px] text-zinc-500">
                    <span>LOCKED SL:</span>
                    <span className="text-rose-400 font-bold">${coin.lockedSl?.toFixed(coin.decimals)}</span>
                  </div>
                  <div className="flex justify-between text-[8px] text-zinc-500">
                    <span>TARGET RR:</span>
                    <span className="text-emerald-400 font-bold">1:{coin.targetRr}</span>
                  </div>
                  <div className="flex justify-between text-[8px] text-zinc-500 pt-1 border-t border-zinc-900/60">
                    <span>FLUC P&L:</span>
                    <span className={`font-black ${coin.pnl! >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {coin.pnl! >= 0 ? '+' : ''}${coin.pnl?.toFixed(4)}
                    </span>
                  </div>
                </div>
              )}

              {(isSlHit || isTargetHit) && (
                <div className="space-y-2">
                  <div className={`p-2 rounded-xl text-center border font-black text-[10px] ${
                    isTargetHit ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                  }`}>
                    {isTargetHit ? '100% TARGET HIT!' : 'STOP HIT (SL)'}
                    <div className="text-[11px] font-mono mt-0.5">
                      {isTargetHit ? `+$${coin.pnl}` : `-$2.00`} P&L
                    </div>
                  </div>
                  <button
                    onClick={() => handleReset(coin.symbol)}
                    className="w-full py-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 rounded-lg text-[9px] font-bold uppercase transition-all"
                  >
                    Clear Setup
                  </button>
                </div>
              )}

              {/* Order ID and Time Zone Marker */}
              <div className="border-t border-zinc-900/60 pt-2 text-[8px] flex justify-between text-zinc-500">
                <span>{coin.timezone}</span>
                <span>{coin.orderId ? coin.orderId.slice(0, 11) : 'WAITING'}</span>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
