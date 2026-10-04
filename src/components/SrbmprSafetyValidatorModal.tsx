import React from 'react';
import { ShieldCheck, ShieldAlert, Lock, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import { SrbmprExecutionSafetyValidator, OrderValidationRequest, ValidationResult } from '../services/SrbmprExecutionSafetyValidator';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onRequest: OrderValidationRequest;
  onAuthorizedExecute: () => void;
}

export const SrbmprSafetyValidatorModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onRequest,
  onAuthorizedExecute
}) => {
  if (!isOpen) return null;

  const validator = SrbmprExecutionSafetyValidator.getInstance();
  const validationResult: ValidationResult = validator.validateOrder(onRequest);

  const rrRatio = ((onRequest.targetPrice - onRequest.entryPrice) / (Math.abs(onRequest.entryPrice - onRequest.slPrice) || 1)).toFixed(1);

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-in fade-in">
      <div className="bg-zinc-950 border-2 border-amber-500/60 rounded-3xl w-full max-w-4xl p-6 sm:p-8 space-y-6 shadow-[0_0_100px_rgba(245,158,11,0.2)] font-mono text-xs">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${
              validationResult.passed ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}>
              {validationResult.passed ? <ShieldCheck className="w-7 h-7" /> : <ShieldAlert className="w-7 h-7 animate-pulse" />}
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
                18-LAYER PRE-EXECUTION SAFETY GATE ($1 RISK RULE)
              </h2>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Data → Micro Entry → Exact Price → Account Rule → Risk → Quantity → Execution
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 rounded-xl"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning Notice */}
        <div className="p-4 bg-rose-950/30 border border-rose-500/40 rounded-2xl text-rose-300 text-[11px] flex items-center gap-3">
          <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0" />
          <div>
            <strong className="text-white uppercase font-bold">Strict $1 Risk Principle:</strong> Maximum actual dollar loss is strictly anchored to ${onRequest.targetDollarRisk.toFixed(2)}. Quantity is derived strictly from SL price distance. If calculated quantity is below exchange minimum, trade is blocked.
          </div>
        </div>

        {/* Final Safety Response Card ($1 Risk Format) */}
        <div className="bg-black border border-zinc-800 p-6 rounded-2xl space-y-4">
          <div className="text-[11px] font-black text-amber-400 uppercase tracking-widest border-b border-zinc-900 pb-2">
            FINAL SAFETY RESPONSE CARD (STRICT $1 RISK ENGINE)
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-[11px]">
            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-900">
              <span className="text-[9px] text-zinc-500 font-bold block">ACCOUNT SIZE</span>
              <span className="text-white font-black text-sm">${onRequest.accountSize.toLocaleString()}</span>
            </div>

            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-900">
              <span className="text-[9px] text-zinc-500 font-bold block">MAX ACTUAL TRADE RISK</span>
              <span className="text-emerald-400 font-black text-sm">${onRequest.targetDollarRisk.toFixed(2)}</span>
            </div>

            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-900">
              <span className="text-[9px] text-zinc-500 font-bold block">EXACT MICRO ENTRY</span>
              <span className="text-cyan-300 font-black text-sm">${onRequest.entryPrice}</span>
            </div>

            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-900">
              <span className="text-[9px] text-zinc-500 font-bold block">EXACT SL</span>
              <span className="text-rose-400 font-black text-sm">${onRequest.slPrice}</span>
            </div>

            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-900">
              <span className="text-[9px] text-zinc-500 font-bold block">SL PRICE DISTANCE</span>
              <span className="text-white font-black text-sm">${validationResult.metrics.slPriceDistance.toFixed(4)}</span>
            </div>

            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-900">
              <span className="text-[9px] text-zinc-500 font-bold block">VALID QUANTITY</span>
              <span className="text-amber-400 font-black text-sm">{validationResult.metrics.calculatedQuantity.toFixed(4)} units</span>
            </div>

            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-900">
              <span className="text-[9px] text-zinc-500 font-bold block">ACTUAL MAX GROSS LOSS</span>
              <span className="text-rose-400 font-black text-sm">${validationResult.metrics.actualMaxGrossLoss.toFixed(2)}</span>
            </div>

            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-900">
              <span className="text-[9px] text-zinc-500 font-bold block">TARGET</span>
              <span className="text-emerald-400 font-black text-sm">${onRequest.targetPrice}</span>
            </div>

            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-900">
              <span className="text-[9px] text-zinc-500 font-bold block">RR RATIO</span>
              <span className="text-amber-400 font-black text-sm">1:{rrRatio}</span>
            </div>

            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-900">
              <span className="text-[9px] text-zinc-500 font-bold block">REMAINING DAILY LOSS</span>
              <span className="text-emerald-400 font-black text-sm">${validationResult.metrics.remainingDailyLoss.toFixed(2)}</span>
            </div>

            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-900">
              <span className="text-[9px] text-zinc-500 font-bold block">REQUIRED MARGIN</span>
              <span className="text-white font-black text-sm">${validationResult.metrics.requiredMargin.toFixed(2)}</span>
            </div>

            <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-900">
              <span className="text-[9px] text-zinc-500 font-bold block">RULE STATUS</span>
              <span className={`font-black text-sm ${validationResult.metrics.ruleStatus === 'PASS' ? 'text-emerald-400' : 'text-rose-500'}`}>
                {validationResult.metrics.ruleStatus}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-zinc-900 rounded-xl border border-zinc-800 text-sm">
            <span className="text-zinc-400 font-bold">EXECUTION STATUS:</span>
            <span className={`font-black px-3 py-1 rounded-lg ${
              validationResult.metrics.executionStatus === 'READY' 
                ? 'bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.4)]' 
                : 'bg-rose-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]'
            }`}>
              {validationResult.metrics.executionStatus}
            </span>
          </div>

          {validationResult.blockReason && (
            <div className="p-3 bg-rose-950/60 border border-rose-500/50 rounded-xl text-rose-300 font-bold text-xs text-center">
              {validationResult.blockReason}
            </div>
          )}
        </div>

        {/* 18-Layer Checks Checklist */}
        <div className="space-y-3">
          <div className="text-[11px] font-black text-zinc-400 uppercase tracking-widest">
            18-LAYER PRE-EXECUTION AUDIT PIPELINE RESULTS
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-2">
            {validationResult.checks.map(check => (
              <div key={check.id} className="flex items-center justify-between p-2.5 bg-black rounded-xl border border-zinc-900 text-[10px]">
                <span className="text-zinc-300 font-bold">{check.id}. {check.name}</span>
                <span className={`font-black px-2 py-0.5 rounded ${check.passed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                  {check.passed ? 'PASS' : 'FAIL'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 rounded-xl font-bold text-xs"
          >
            Cancel / Abort
          </button>

          {validationResult.passed ? (
            <button
              onClick={() => {
                onAuthorizedExecute();
                onClose();
              }}
              className="px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black rounded-xl text-xs flex items-center gap-2 shadow-[0_0_25px_rgba(16,185,129,0.4)]"
            >
              <Lock className="w-4 h-4" /> Authorized Execute Order
            </button>
          ) : (
            <div className="text-rose-400 font-bold text-xs bg-rose-950/40 px-4 py-2 rounded-xl border border-rose-500/30">
              Execution Locked — All 18 Checks Must Pass
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
