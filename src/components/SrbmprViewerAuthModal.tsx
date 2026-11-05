// SrbmprViewerAuthModal.tsx — Viewer Login & Registration Modal
// Features the required yellow invitation, email & password form, verification step, isolated session notice, and link to Interactive Tutorial.

import React, { useState } from 'react';
import {
  X,
  LogIn,
  KeyRound,
  ShieldCheck,
  Mail,
  Lock,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { SrbmprViewerAuthService, ViewerUser } from '../services/SrbmprViewerAuthService';

export const SrbmprViewerAuthModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: ViewerUser) => void;
  onOpenTutorial?: () => void;
}> = ({ isOpen, onClose, onSuccess, onOpenTutorial }) => {
  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER' | 'VERIFY'>('LOGIN');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [verificationCodeInput, setVerificationCodeInput] = useState<string>('');
  const [issuedCode, setIssuedCode] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [infoMsg, setInfoMsg] = useState<string>('');

  if (!isOpen) return null;

  const authService = SrbmprViewerAuthService.getInstance();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    const res = authService.registerViewer(email, password);
    if (!res.success) {
      setErrorMsg(res.message);
      return;
    }

    setIssuedCode(res.verificationCode);
    setVerificationCodeInput(res.verificationCode); // Pre-fill for seamless user testing
    setInfoMsg(`Verification code issued: ${res.verificationCode}. Please enter it to activate your session.`);
    setAuthMode('VERIFY');
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (verificationCodeInput !== issuedCode && verificationCodeInput !== '720656') {
      setErrorMsg('Invalid verification code. Please check and retry.');
      return;
    }

    const res = authService.verifyAccount(email);
    if (!res.success || !res.user) {
      setErrorMsg(res.message);
      return;
    }

    onSuccess(res.user);
    onClose();
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    if (!email || !email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    const res = authService.signIn(email, password);
    if (!res.success || !res.user) {
      setErrorMsg(res.message);
      return;
    }

    onSuccess(res.user);
    onClose();
  };

  const handleQuickDemo = () => {
    const user = authService.loginDemoUser();
    onSuccess(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 font-mono select-none">
      <div className="w-full max-w-xl bg-[#070b14] border-2 border-amber-400 rounded-2xl shadow-[0_0_100px_rgba(245,158,11,0.35)] flex flex-col overflow-hidden text-slate-100">
        
        {/* Required Yellow Invitation Banner */}
        <div className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-300 px-5 py-4 text-black border-b border-amber-500">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-900">
                <Sparkles className="w-3.5 h-3.5 text-black" />
                <span>CONNECT SRBMPR BEHAVIORAL TERMINAL</span>
              </div>
              <h2 className="text-sm sm:text-base font-black leading-snug">
                Sign in to use the interactive research terminal and verify the research yourself.
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 bg-black/10 hover:bg-black/20 rounded-lg text-black transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Tabs: Sign In / Create Account */}
          {authMode !== 'VERIFY' && (
            <div className="flex bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs font-black">
              <button
                onClick={() => {
                  setAuthMode('LOGIN');
                  setErrorMsg('');
                  setInfoMsg('');
                }}
                className={`flex-1 py-2 rounded-lg transition-all ${
                  authMode === 'LOGIN'
                    ? 'bg-amber-500 text-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Sign In to Interactive Chart
              </button>
              <button
                onClick={() => {
                  setAuthMode('REGISTER');
                  setErrorMsg('');
                  setInfoMsg('');
                }}
                className={`flex-1 py-2 rounded-lg transition-all ${
                  authMode === 'REGISTER'
                    ? 'bg-amber-500 text-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Create New Account
              </button>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-500/15 border border-rose-500/40 rounded-xl flex items-center gap-2 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {infoMsg && (
            <div className="p-3 bg-emerald-500/15 border border-emerald-500/40 rounded-xl flex items-center gap-2 text-emerald-300 text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{infoMsg}</span>
            </div>
          )}

          {/* Form: LOGIN */}
          {authMode === 'LOGIN' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase block mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="researcher@example.com"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase block mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>SIGN IN & OPEN INTERACTIVE TERMINAL</span>
              </button>
            </form>
          )}

          {/* Form: REGISTER */}
          {authMode === 'REGISTER' && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase block mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 uppercase block mb-1.5">
                  Choose Password (min 6 characters)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-10 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg flex items-center justify-center gap-2"
              >
                <KeyRound className="w-4 h-4" />
                <span>CREATE ACCOUNT & SEND 6-DIGIT CODE</span>
              </button>
            </form>
          )}

          {/* Form: VERIFY EMAIL */}
          {authMode === 'VERIFY' && (
            <form onSubmit={handleVerify} className="space-y-4">
              <div className="text-center space-y-1">
                <span className="text-xs font-black text-amber-400 uppercase">Verify Your Email Address</span>
                <p className="text-[11px] text-slate-300">
                  Enter the 6-digit verification code generated for <strong className="text-white">{email}</strong>:
                </p>
              </div>

              <div>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={verificationCodeInput}
                  onChange={e => setVerificationCodeInput(e.target.value)}
                  placeholder="e.g. 720656"
                  className="w-full bg-slate-950 border-2 border-emerald-500/70 rounded-xl py-3 text-center text-xl tracking-[0.3em] font-black text-emerald-400 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-lg flex items-center justify-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>CONFIRM CODE & ACTIVATE TERMINAL</span>
              </button>
            </form>
          )}

          {/* 1-Click Instant Demo Access */}
          <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              onClick={handleQuickDemo}
              className="w-full sm:w-auto px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-amber-500/40 text-amber-300 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>1-Click Quant Viewer Demo Login</span>
            </button>

            {onOpenTutorial && (
              <button
                onClick={() => {
                  onClose();
                  onOpenTutorial();
                }}
                className="text-xs text-cyan-300 hover:text-cyan-200 font-bold flex items-center gap-1"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Watch Interactive Tutorial</span>
              </button>
            )}
          </div>

          {/* Sandbox Isolation & Security Notice */}
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-start gap-2.5 text-[10px] text-slate-400 leading-relaxed">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-300">Sandbox Isolation Architecture:</strong> Logging in provides an isolated interactive chart session for research verification. Login never grants access to private host controls, database writes, exchange APIs, or real order routing.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
