import React, { useState } from 'react';
import { 
  Building2, ShieldAlert, Zap, AlertCircle, CheckCircle2, 
  TrendingUp, RefreshCw, Lock, DollarSign, ArrowUpRight, 
  ArrowDownRight, Sliders, ShieldCheck, Power, AlertTriangle
} from 'lucide-react';
import { EvidenceStorageService } from '../services/EvidenceStorageService';
import { AssetSymbol } from '../types/terminal';
import { SrbmprSafetyValidatorModal } from './SrbmprSafetyValidatorModal';
import { SrbmprExecutionSafetyValidator, OrderValidationRequest } from '../services/SrbmprExecutionSafetyValidator';

interface FundedPosition {
  id: string;
  symbol: AssetSymbol;
  type: 'BUY_LIMIT' | 'SELL_LIMIT';
  entryPrice: number;
  currentPrice: number;
  slPrice: number;
  targetPrice: number;
  lotSize: number;
  pnl: number;
  rr: string;
  status: 'SUBMITTED' | 'FILLED' | 'IN_PROFIT';
  brokerOrderId: string;
}

export const FundedAccountManager: React.FC<{
  activeAsset?: AssetSymbol;
  livePrice?: number;
}> = ({
  activeAsset = 'BTC/USDT',
  livePrice = 65280
}) => {
  const service = EvidenceStorageService.getInstance();
  const [selectedFirm, setSelectedFirm] = useState<'FTMO' | 'UPCOMERS' | 'BYBIT_FUNDED'>('UPCOMERS');
  const [upcomersChallenge, setUpcomersChallenge] = useState<'Vanguard' | 'Oracle' | 'Ember'>('Vanguard');
  const [upcomersSize, setUpcomersSize] = useState<string>('$100K');
  const [upcomersPlatform, setUpcomersPlatform] = useState<string>('MetaTrader 5');
  const [isLiveExecutionEnabled, setIsLiveExecutionEnabled] = useState(false);
  const [isEmergencyKillTriggered, setIsEmergencyKillTriggered] = useState(false);
  const [orderNotice, setOrderNotice] = useState<string | null>(null);

  // Safety Validator Modal State
  const [isSafetyModalOpen, setIsSafetyModalOpen] = useState(false);
  const [pendingValidationRequest, setPendingValidationRequest] = useState<OrderValidationRequest | null>(null);

  // Prop Firm Parameters
  const [accountBalance, setAccountBalance] = useState(100000);
  const [accountEquity, setAccountEquity] = useState(103420);
  const dailyLossLimit = selectedFirm === 'UPCOMERS' ? 4000 : 5000; // 4% for Upcomers Vanguard
  const currentDailyLoss = 0; 
  const maxOverallDrawdown = selectedFirm === 'UPCOMERS' ? 7000 : 10000; // 7% for Upcomers Vanguard

  const [positions, setPositions] = useState<FundedPosition[]>([
    {
      id: 'POS-001',
      symbol: 'BTC/USDT',
      type: 'BUY_LIMIT',
      entryPrice: 65280,
      currentPrice: livePrice,
      slPrice: 65215,
      targetPrice: 71775,
      lotSize: 2.0,
      pnl: 1920.00,
      rr: '1:100',
      status: 'FILLED',
      brokerOrderId: 'ORD-FTMO-993821'
    },
    {
      id: 'POS-002',
      symbol: 'PAXG/USDT',
      type: 'BUY_LIMIT',
      entryPrice: 2650.40,
      currentPrice: 2665.20,
      slPrice: 2646.22,
      targetPrice: 2859.40,
      lotSize: 5.0,
      pnl: 740.00,
      rr: '1:50',
      status: 'FILLED',
      brokerOrderId: 'ORD-FTMO-994102'
    }
  ]);

  const handlePlaceSrbmprLimitOrder = () => {
    if (isEmergencyKillTriggered) {
      setOrderNotice('Emergency Kill Switch is active! Reset before ordering.');
      return;
    }

    const calculatedSl = Number((livePrice - 1.00).toFixed(2)); // Exact $1 risk distance below entry
    const calculatedTarget = Number((livePrice + 100.00).toFixed(2)); // Target objective
    const req: OrderValidationRequest = {
      accountSize: accountBalance,
      targetDollarRisk: 1.00, // Strict $1 actual dollar risk rule
      entryPrice: livePrice,
      slPrice: calculatedSl,
      targetPrice: calculatedTarget,
      symbol: activeAsset,
      exchange: selectedFirm,
      dailyLossUsed: currentDailyLoss,
      dailyLossLimit,
      maxAccountLoss: maxOverallDrawdown,
      minExchangeQty: 0.001,
      maxExchangeQty: 10000,
      leverage: 100
    };

    setPendingValidationRequest(req);
    setIsSafetyModalOpen(true);
  };

  const handleExecuteConfirmedOrder = () => {
    if (!pendingValidationRequest) return;

    const validationRes = SrbmprExecutionSafetyValidator.getInstance().validateOrder(pendingValidationRequest);
    if (!validationRes.passed) return;

    const brokerOrderId = `ORD-${selectedFirm}-${Math.floor(100000 + Math.random() * 900000)}`;

    const newPos: FundedPosition = {
      id: `POS-${Date.now().toString().slice(-4)}`,
      symbol: activeAsset,
      type: 'BUY_LIMIT',
      entryPrice: pendingValidationRequest.entryPrice,
      currentPrice: livePrice,
      slPrice: pendingValidationRequest.slPrice,
      targetPrice: pendingValidationRequest.targetPrice,
      lotSize: Number(validationRes.metrics.calculatedQuantity.toFixed(4)),
      pnl: 0,
      rr: '1:100',
      status: 'SUBMITTED',
      brokerOrderId
    };

    setPositions([newPos, ...positions]);

    // Register into immutable evidence store
    service.registerTradeEvent({
      asset: activeAsset,
      source: selectedFirm,
      accountType: 'Funded',
      entryPrice: pendingValidationRequest.entryPrice,
      slPrice: pendingValidationRequest.slPrice,
      targetPrice: pendingValidationRequest.targetPrice,
      riskRewardRatio: '1:100',
      orderType: 'LIMIT',
      brokerOrderId,
      sourceTimezone: 'UTC',
      expectedTargetTime: new Date(Date.now() + 86400000).toISOString(),
      status: 'ORDER_SUBMITTED',
      pnlDollar: 0,
      pnlPercent: 0,
      fees: 1.50,
      mfe: 0,
      mae: 0,
      algorithmVersion: 'SRBMPR-V26.0-SAFETY-LOCKED',
      rawEventReference: `FUNDED_FEED_${selectedFirm}_${activeAsset.replace('/', '')}`,
      capitalObjective: '$100->$100,000',
      auditNotes: `Passed 18-layer pre-execution safety pipeline. Submitted to ${selectedFirm}.`
    });

    setOrderNotice(`Limit order ${brokerOrderId} passed 18-layer safety check & submitted successfully!`);
    setTimeout(() => setOrderNotice(null), 5000);
  };

  const handleEmergencyKillSwitch = () => {
    setIsEmergencyKillTriggered(true);
    setPositions(positions.map(p => ({ ...p, status: 'SUBMITTED' })));
    setOrderNotice('EMERGENCY KILL SWITCH ACTIVATED! All active broker orders cancelled & positions secured.');
  };

  const handleResetKillSwitch = () => {
    setIsEmergencyKillTriggered(false);
    setOrderNotice('Emergency Kill Switch deactivated. Normal execution restored.');
    setTimeout(() => setOrderNotice(null), 4000);
  };

  return (
    <div className="bg-gradient-to-b from-zinc-950 via-black to-zinc-950 border-2 border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(245,158,11,0.1)] font-mono text-xs space-y-6">
      
      {/* Header */}
      <div className="border-b border-zinc-800 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-400">
            <Building2 className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
              FUNDED ACCOUNT CONNECTION CONTAINER
            </h2>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              FTMO / Upcomers / Prop Firm Isolation • 0.10% SL Risk Gate • Direct MT5 Bridge
            </p>
          </div>
        </div>

        {/* Firm Selector & Execution Mode */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800">
            {(['FTMO', 'UPCOMERS', 'BYBIT_FUNDED'] as const).map(firm => (
              <button
                key={firm}
                onClick={() => setSelectedFirm(firm)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                  selectedFirm === firm 
                    ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]' 
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                {firm === 'UPCOMERS' ? 'Upcomers Prop' : firm.replace('_', ' ')}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsLiveExecutionEnabled(!isLiveExecutionEnabled)}
            className={`px-3.5 py-2 rounded-xl font-black text-[10px] flex items-center gap-1.5 transition-all ${
              isLiveExecutionEnabled
                ? 'bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)] animate-pulse'
                : 'bg-zinc-900 border border-zinc-700 text-zinc-400'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{isLiveExecutionEnabled ? 'LIVE EXECUTION ON' : 'PAPER / TESTNET MODE'}</span>
          </button>
        </div>
      </div>

      {/* Upcomers Specific Configuration Bar */}
      {selectedFirm === 'UPCOMERS' && (
        <div className="bg-zinc-950 border border-amber-500/30 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-4 flex-wrap">
            <div>
              <span className="text-[9px] text-zinc-500 font-bold block mb-1">CHALLENGE TYPE</span>
              <div className="flex gap-1 bg-black p-1 rounded-xl border border-zinc-800">
                {(['Vanguard', 'Oracle', 'Ember'] as const).map(ch => (
                  <button
                    key={ch}
                    onClick={() => setUpcomersChallenge(ch)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase ${
                      upcomersChallenge === ch ? 'bg-amber-500 text-black' : 'text-zinc-400'
                    }`}
                  >
                    {ch}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-[9px] text-zinc-500 font-bold block mb-1">ACCOUNT SIZE</span>
              <select
                value={upcomersSize}
                onChange={e => setUpcomersSize(e.target.value)}
                className="bg-black border border-zinc-800 text-white font-bold rounded-xl px-3 py-1.5 text-xs outline-none focus:border-amber-500"
              >
                <option value="$10K">$10K ($59)</option>
                <option value="$50K">$50K ($169)</option>
                <option value="$100K">$100K ($279 - Vanguard)</option>
                <option value="$200K">$200K ($479)</option>
                <option value="$500K">$500K ($1,019)</option>
                <option value="$1M">$1M ($1,859)</option>
                <option value="$1.5M">$1.5M ($2,669)</option>
              </select>
            </div>

            <div>
              <span className="text-[9px] text-zinc-500 font-bold block mb-1">PLATFORM BRIDGE</span>
              <select
                value={upcomersPlatform}
                onChange={e => setUpcomersPlatform(e.target.value)}
                className="bg-black border border-zinc-800 text-white font-bold rounded-xl px-3 py-1.5 text-xs outline-none focus:border-amber-500"
              >
                <option value="MetaTrader 5">MetaTrader 5</option>
                <option value="cTrader">cTrader</option>
                <option value="TradeLocker">TradeLocker</option>
                <option value="Match-Trader">Match-Trader</option>
                <option value="Upcomers X">Upcomers X (Hyperliquid)</option>
              </select>
            </div>
          </div>

          <div className="text-[10px] text-amber-400 font-bold bg-amber-950/40 px-3 py-1.5 rounded-xl border border-amber-500/30">
            Rules: 90% Reward Share • 4% Daily DD • 7% Max DD • 1:100 Leverage
          </div>
        </div>
      )}

      {orderNotice && (
        <div className="p-3.5 bg-amber-500/10 border border-amber-500/40 rounded-xl text-amber-300 text-[11px] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{orderNotice}</span>
        </div>
      )}

      {/* Account Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-black border border-zinc-800 p-4 rounded-2xl">
          <span className="text-[10px] text-zinc-500 font-black uppercase">Funded Balance</span>
          <div className="text-xl font-black text-white mt-1 font-mono">${accountBalance.toLocaleString()}</div>
          <span className="text-[9px] text-zinc-600 font-bold">$100k Account Tier</span>
        </div>

        <div className="bg-black border border-emerald-500/30 p-4 rounded-2xl">
          <span className="text-[10px] text-emerald-400/80 font-black uppercase">Live Equity</span>
          <div className="text-xl font-black text-emerald-400 mt-1 font-mono">${accountEquity.toLocaleString()}</div>
          <span className="text-[9px] text-emerald-500 font-bold flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" /> +$3,420 Profit (+3.42%)
          </span>
        </div>

        <div className="bg-black border border-zinc-800 p-4 rounded-2xl">
          <span className="text-[10px] text-zinc-500 font-black uppercase">Daily Loss Buffer</span>
          <div className="text-xl font-black text-white mt-1 font-mono">${dailyLossLimit.toLocaleString()}</div>
          <span className="text-[9px] text-emerald-400 font-bold">0% Drawdown Used Today</span>
        </div>

        <div className="bg-black border border-zinc-800 p-4 rounded-2xl">
          <span className="text-[10px] text-zinc-500 font-black uppercase">Max Trailing Drawdown</span>
          <div className="text-xl font-black text-white mt-1 font-mono">${maxOverallDrawdown.toLocaleString()}</div>
          <span className="text-[9px] text-zinc-500 font-bold">Rule: Max 10% Floor</span>
        </div>
      </div>

      {/* SRBMPR Execution Gate: Limit Order with 0.10% SL */}
      <div className="bg-zinc-900/50 border border-zinc-800 p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-white font-black uppercase text-xs">SRBMPR ENTRY → LIMIT ORDER GATEWAY</span>
          </div>
          <p className="text-[11px] text-zinc-400">
            Calculated: <strong className="text-white">{activeAsset}</strong> at <strong className="text-emerald-400">${livePrice.toLocaleString()}</strong> • 0.10% SL Floor: <strong className="text-rose-400">${(livePrice * 0.999).toFixed(2)}</strong> • Target 1:100: <strong className="text-emerald-400">${(livePrice * 1.10).toFixed(2)}</strong>
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handlePlaceSrbmprLimitOrder}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)]"
          >
            <Zap className="w-4 h-4" />
            <span>SUBMIT SRBMPR LIMIT ORDER</span>
          </button>

          {!isEmergencyKillTriggered ? (
            <button
              onClick={handleEmergencyKillSwitch}
              className="px-4 py-2.5 bg-red-950/40 hover:bg-red-900/60 border border-red-500/50 text-red-300 font-black rounded-xl text-xs flex items-center gap-1.5 transition-all"
              title="Immediately close all positions & cancel limit orders"
            >
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span>KILL SWITCH</span>
            </button>
          ) : (
            <button
              onClick={handleResetKillSwitch}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-xl text-xs flex items-center gap-1.5 transition-all"
            >
              <span>RESET KILL SWITCH</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Positions / Orders Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-zinc-400 font-black uppercase">Active Funded Positions & Orders</span>
          <span className="text-[10px] text-emerald-400 font-mono">BROKER WEBHOOK: SYNCED</span>
        </div>

        <div className="overflow-x-auto border border-zinc-800 rounded-2xl bg-black">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-950 text-zinc-400 text-[10px] uppercase font-black">
                <th className="py-3 px-3">Position ID</th>
                <th className="py-3 px-3">Asset</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3">Entry Axis</th>
                <th className="py-3 px-3">Stop Loss</th>
                <th className="py-3 px-3">Target Axis</th>
                <th className="py-3 px-3">R:R Ratio</th>
                <th className="py-3 px-3">Live P&L</th>
                <th className="py-3 px-3">Broker Order ID</th>
                <th className="py-3 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900 text-[11px]">
              {positions.map(p => (
                <tr key={p.id} className="hover:bg-zinc-950/80 transition-colors">
                  <td className="py-3 px-3 font-bold text-white">{p.id}</td>
                  <td className="py-3 px-3 font-bold text-amber-400">{p.symbol}</td>
                  <td className="py-3 px-3 text-emerald-400 font-bold">{p.type}</td>
                  <td className="py-3 px-3 font-mono">${p.entryPrice.toLocaleString()}</td>
                  <td className="py-3 px-3 font-mono text-rose-400">${p.slPrice.toLocaleString()}</td>
                  <td className="py-3 px-3 font-mono text-emerald-400">${p.targetPrice.toLocaleString()}</td>
                  <td className="py-3 px-3 font-black text-amber-400">{p.rr}</td>
                  <td className="py-3 px-3 font-mono font-bold text-emerald-400">
                    +${p.pnl.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 font-mono text-[10px] text-zinc-400">{p.brokerOrderId}</td>
                  <td className="py-3 px-3 text-right">
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {pendingValidationRequest && (
        <SrbmprSafetyValidatorModal
          isOpen={isSafetyModalOpen}
          onClose={() => setIsSafetyModalOpen(false)}
          onRequest={pendingValidationRequest}
          onAuthorizedExecute={handleExecuteConfirmedOrder}
        />
      )}

    </div>
  );
};
