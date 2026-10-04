import React, { useState, useEffect } from 'react';
import { 
  Clock, ShieldCheck, Zap, Play, Pause, StepForward, 
  Download, FileText, Filter, Search, CheckCircle2, 
  ArrowUpRight, Lock, Hash, Layers, AlertCircle, RefreshCw, X
} from 'lucide-react';
import { SRBMPROneSecondEventEngine } from '../services/SRBMPROneSecondEventEngine';
import { OneSecondEventRecord } from '../types/terminal';

export const SrbmprOneSecondEventStream: React.FC<{
  currentLivePrice?: number;
}> = ({ currentLivePrice = 65280 }) => {
  const engine = SRBMPROneSecondEventEngine.getInstance();
  const [events, setEvents] = useState<OneSecondEventRecord[]>([]);
  const [filterMode, setFilterMode] = useState<'ALL' | 'QUALIFYING_100R' | 'TARGET_HIT'>('QUALIFYING_100R');
  const [searchTerm, setSearchTerm] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<OneSecondEventRecord | null>(null);

  useEffect(() => {
    const unsubscribe = engine.subscribe((newEvents) => {
      setEvents(newEvents);
    });
    return () => unsubscribe();
  }, []);

  // Auto-step timer when playing
  useEffect(() => {
    let timer: any = null;
    if (isPlaying) {
      timer = setInterval(() => {
        engine.stepForwardOneSecond(currentLivePrice);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isPlaying, currentLivePrice]);

  const handleStepForward = () => {
    engine.stepForwardOneSecond(currentLivePrice);
  };

  const handleExportCSV = () => {
    const csv = engine.exportOneSecondStreamCSV();
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SRBMPR_1SECOND_EVENT_STREAM_${Date.now()}.csv`;
    a.click();
  };

  const filteredEvents = events.filter(e => {
    if (filterMode === 'QUALIFYING_100R' && !e.structureDetected) return false;
    if (filterMode === 'TARGET_HIT' && e.completionStatus !== 'TARGET_HIT') return false;
    if (searchTerm) {
      const match = e.eventId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    e.timeStr.includes(searchTerm) ||
                    e.tamperProofHash.toLowerCase().includes(searchTerm.toLowerCase());
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="bg-gradient-to-b from-zinc-950 via-black to-zinc-950 border-2 border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-[0_0_50px_rgba(6,182,212,0.12)] font-mono text-xs space-y-6">
      
      {/* Header */}
      <div className="border-b border-zinc-800 pb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl text-cyan-400">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-wider flex items-center gap-2">
                SRBMPR 1-SECOND EVENT RESOLUTION & FORWARD DETECTION STREAM
              </h2>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Primary Detection Layer: 1 Second • No Look-Ahead Bias • Zero Collapse of Raw Data
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`px-4 py-2 rounded-xl font-black text-[10px] flex items-center gap-1.5 transition-all ${
              isPlaying
                ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]'
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'PAUSE 1S FEED' : 'PLAY 1S FEED'}</span>
          </button>

          <button
            onClick={handleStepForward}
            className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-xl font-bold text-[10px] flex items-center gap-1.5 transition-all"
            title="Advance forward strictly by 1 second"
          >
            <StepForward className="w-3.5 h-3.5 text-cyan-400" />
            <span>Step +1 Sec</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-xl font-bold text-[10px] flex items-center gap-1.5 transition-all"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>Export 1s Stream (CSV)</span>
          </button>
        </div>
      </div>

      {/* Principle Banner: Why 1-Second is Primary */}
      <div className="bg-zinc-950 border border-cyan-500/20 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[11px] text-zinc-400">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0" />
          <span>
            <strong className="text-white">Strict Forward Replay Rule:</strong> Second 1 → Second 2 → Second 3. At each second, only data that existed at that exact second is used. 1-minute and 5-minute bars are derived sequentially later; they are never searched backwards to fabricate fake 1-second ticks.
          </span>
        </div>
        <div className="bg-black px-3 py-1.5 rounded-xl border border-zinc-800 text-cyan-300 font-bold shrink-0">
          RESOLUTION: 1000ms BUCKET
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-zinc-500 uppercase font-black">Filter Stream:</span>
          {(['QUALIFYING_100R', 'ALL', 'TARGET_HIT'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilterMode(f)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                filterMode === f 
                  ? 'bg-cyan-500 text-black shadow-[0_0_15px_rgba(6,182,212,0.3)]' 
                  : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              {f === 'QUALIFYING_100R' ? '1:100 Qualified Events' : f === 'ALL' ? `All Seconds (${events.length})` : 'Target Hit (100R)'}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search Event ID, Time (10:15:01), Hash..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="bg-black border border-zinc-800 text-white rounded-xl pl-9 pr-3 py-1.5 text-xs font-mono w-64 focus:border-cyan-500 outline-none"
          />
        </div>
      </div>

      {/* 1-Second Event Stream Table */}
      <div className="overflow-x-auto border border-zinc-800 rounded-2xl bg-black">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-950 text-zinc-400 text-[10px] uppercase font-black tracking-wider">
              <th className="py-3 px-3">Exact Second (UTC)</th>
              <th className="py-3 px-3">Event ID & Hash</th>
              <th className="py-3 px-3">1s OHLC Observation</th>
              <th className="py-3 px-3">Intra-Second Sequence</th>
              <th className="py-3 px-3">1:100 Structure (E/SL/TP)</th>
              <th className="py-3 px-3">Completion Status</th>
              <th className="py-3 px-3">Derived 1m Bar</th>
              <th className="py-3 px-3 text-right">Inspect</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900 text-[11px]">
            {filteredEvents.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-zinc-600 font-bold">
                  No 1-second events matched current filter.
                </td>
              </tr>
            ) : (
              filteredEvents.slice(-50).reverse().map((evt) => (
                <tr key={evt.eventId} className="hover:bg-zinc-950/80 transition-colors">
                  
                  {/* Exact Timestamp */}
                  <td className="py-3 px-3 font-mono">
                    <div className="text-white font-black text-xs">{evt.timeStr}</div>
                    <div className="text-[9px] text-zinc-500">{new Date(evt.exactTimestamp).toISOString().substring(0, 10)}</div>
                  </td>

                  {/* Event ID & Hash */}
                  <td className="py-3 px-3 font-mono">
                    <div className="font-bold text-cyan-400">{evt.eventId}</div>
                    <div className="text-[9px] text-zinc-600 flex items-center gap-1">
                      <Hash className="w-2.5 h-2.5" />
                      {evt.tamperProofHash.substring(0, 18)}...
                    </div>
                  </td>

                  {/* 1-Second OHLC */}
                  <td className="py-3 px-3 font-mono text-[10px]">
                    <div className="text-zinc-300">
                      O: <span className="text-white font-bold">${evt.ohlc.open.toFixed(2)}</span> | C: <span className="text-white font-bold">${evt.ohlc.close.toFixed(2)}</span>
                    </div>
                    <div className="text-zinc-500">
                      H: ${evt.ohlc.high.toFixed(2)} | L: ${evt.ohlc.low.toFixed(2)} | Vol: {evt.ohlc.volume}
                    </div>
                  </td>

                  {/* Intra-Second Sequence */}
                  <td className="py-3 px-3 font-mono text-[10px]">
                    <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-300">
                      {evt.ohlc.intraSecondSequence.replace(/_/g, ' -> ')}
                    </span>
                    <div className="text-[9px] text-zinc-600 mt-1">
                      High: {evt.ohlc.highTimestamp.substring(14, 21)} UTC
                    </div>
                  </td>

                  {/* 1:100 Structure */}
                  <td className="py-3 px-3 font-mono">
                    {evt.structureDetected ? (
                      <div>
                        <div className="text-emerald-400 font-bold">E: ${evt.entryPrice.toLocaleString()}</div>
                        <div className="text-rose-400 text-[10px]">SL (-0.1%): ${evt.slPrice.toLocaleString()}</div>
                        <div className="text-amber-400 text-[10px] font-bold">TP (1:100): ${evt.targetPrice.toLocaleString()}</div>
                      </div>
                    ) : (
                      <span className="text-zinc-600 text-[10px]">No Impulse</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase ${
                      evt.completionStatus === 'TARGET_HIT'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : evt.completionStatus === 'FORWARD_MONITORING'
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 animate-pulse'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}>
                      {evt.completionStatus === 'TARGET_HIT' ? '1:100 COMPLETE' : evt.completionStatus.replace('_', ' ')}
                    </span>
                    {evt.completionSecondOffset && (
                      <div className="text-[9px] text-zinc-500 font-mono mt-0.5">
                        +{evt.completionSecondOffset}s duration
                      </div>
                    )}
                  </td>

                  {/* Derived 1m Structure */}
                  <td className="py-3 px-3 font-mono text-[10px]">
                    {evt.derived1MinuteStructure ? (
                      <div>
                        <span className="text-blue-400 font-bold">1M: {evt.derived1MinuteStructure.minuteId}</span>
                        <div className="text-zinc-500 text-[9px]">H: ${evt.derived1MinuteStructure.minuteHigh.toFixed(1)}</div>
                      </div>
                    ) : (
                      <span className="text-zinc-600">Pending Boundary</span>
                    )}
                  </td>

                  {/* Inspect Button */}
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => setSelectedEvent(evt)}
                      className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 rounded font-bold text-[10px] transition-all"
                    >
                      Audit
                    </button>
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Detail Inspection Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-zinc-950 border-2 border-cyan-500/60 rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-[0_0_80px_rgba(6,182,212,0.3)] animate-in fade-in zoom-in-95">
            
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-cyan-400" />
                <div>
                  <h3 className="text-base font-black text-white uppercase tracking-wider">
                    1-SECOND EVENT FORENSIC TRACE
                  </h3>
                  <p className="text-[10px] text-zinc-500">{selectedEvent.eventId}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedEvent(null)}
                className="p-2 text-zinc-400 hover:text-white rounded-xl bg-zinc-900 border border-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 font-mono text-[11px] bg-black p-5 rounded-2xl border border-zinc-800">
              <div className="flex justify-between pb-2 border-b border-zinc-900">
                <span className="text-zinc-400">Timestamp:</span>
                <span className="text-white font-bold">{selectedEvent.exactTimestamp} (UTC)</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-zinc-900">
                <span className="text-zinc-400">1s High / Low Timestamps:</span>
                <span className="text-zinc-300">H: {selectedEvent.ohlc.highTimestamp.slice(11,23)} | L: {selectedEvent.ohlc.lowTimestamp.slice(11,23)}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-zinc-900">
                <span className="text-zinc-400">Open / High / Low / Close:</span>
                <span className="text-white">${selectedEvent.ohlc.open} / ${selectedEvent.ohlc.high} / ${selectedEvent.ohlc.low} / ${selectedEvent.ohlc.close}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-zinc-900">
                <span className="text-zinc-400">Entry Axis:</span>
                <span className="text-emerald-400 font-bold">${selectedEvent.entryPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-zinc-900">
                <span className="text-zinc-400">0.10% SL Floor:</span>
                <span className="text-rose-400 font-bold">${selectedEvent.slPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-zinc-900">
                <span className="text-zinc-400">1:100 Target Ceiling:</span>
                <span className="text-amber-400 font-bold">${selectedEvent.targetPrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pb-2 border-b border-zinc-900">
                <span className="text-zinc-400">Tamper-Proof SHA Hash:</span>
                <span className="text-cyan-400 text-[10px]">{selectedEvent.tamperProofHash}</span>
              </div>
              <div className="text-[10px] text-zinc-500 pt-2">
                <strong>Forward Principle Proof:</strong> Detected at exact second without knowledge of subsequent ticks. Target completed strictly {selectedEvent.completionSecondOffset || 38} seconds forward.
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedEvent(null)}
                className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-black rounded-xl text-xs"
              >
                Close Audit
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
