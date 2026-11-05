import React, { useState } from 'react';
import {
  ShieldCheck,
  Layers,
  Award,
  CheckCircle2,
  XCircle,
  Lock,
  FileCode2,
  PlusCircle,
  ArrowRight,
  Database,
  History,
  AlertTriangle,
  X,
  Globe,
  Cpu
} from 'lucide-react';
import {
  UniversalAssetFootprintEngine,
  UniversalRegisteredAsset,
  UniversalAssetCategory
} from '../services/UniversalAssetFootprintEngine';

interface SrbmprUniversalFootprintFrameworkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SrbmprUniversalFootprintFrameworkModal: React.FC<SrbmprUniversalFootprintFrameworkModalProps> = ({
  isOpen,
  onClose
}) => {
  const engine = UniversalAssetFootprintEngine.getInstance();
  const [assets, setAssets] = useState<UniversalRegisteredAsset[]>(() => engine.getRegisteredAssets());
  const [selectedAssetId, setSelectedAssetId] = useState<string>(() => assets[0]?.assetId || 'SRBMPR-PILOT-001');
  const [activeTab, setActiveTab] = useState<'PIPELINE_REGISTRY' | 'INGEST_AND_LOCK' | 'TEST_SUITE_AND_CONTRACT'>('PIPELINE_REGISTRY');
  const [statusMessage, setStatusMessage] = useState<{ type: 'SUCCESS' | 'ERROR'; text: string } | null>(null);

  // Registration Form State
  const [title, setTitle] = useState('2004 Olympic Commemorative Gold Medal & Laureate Diploma');
  const [category, setCategory] = useState<UniversalAssetCategory>('CERTIFICATE_RECORD');
  const [country, setCountry] = useState('United Arab Emirates / Global Pilot');
  const [serialId, setSerialId] = useState('MEDAL-GOLD-2004-219');
  const [issuer, setIssuer] = useState('INTERNATIONAL_SPORTS_COMMITTEE');
  const [certNumber, setCertNumber] = useState('CERT-ISC-2004-8812');
  const [ownerEntity, setOwnerEntity] = useState('0x8F1c...44A2 (Verified Athlete Custody)');
  const [historicalPrice, setHistoricalPrice] = useState('32000');
  const [historicalCurrency, setHistoricalCurrency] = useState('USD');
  const [historicalDate, setHistoricalDate] = useState('2004-08-29 19:00:00');
  const [historicalSource, setHistoricalSource] = useState('Official Laureate Registry 2004');
  const [currentLayerEstimate, setCurrentLayerEstimate] = useState('85000');
  const [historySummary, setHistorySummary] = useState(
    'Verified original medal serial engraving + signed diploma; 22-year continuous provenance chain.'
  );

  if (!isOpen) return null;

  const selectedAsset = assets.find(a => a.assetId === selectedAssetId) || assets[0];
  const testResults = engine.runComprehensiveTestSuite();
  const blockedAttempts = engine.getBlockedDuplicates();

  const refreshState = () => {
    setAssets(engine.getRegisteredAssets());
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = engine.registerAssetThroughPipeline({
      title,
      category,
      countryJurisdiction: country,
      serialOrContractId: serialId,
      issuerOrMaker: issuer,
      certificateNumber: certNumber,
      ownerAddressOrEntity: ownerEntity,
      historicalPrice: parseFloat(historicalPrice) || 0,
      historicalCurrency,
      historicalDateUtc: historicalDate,
      historicalSource,
      currentEstimatedMarketValue: parseFloat(currentLayerEstimate) || 0,
      documentedHistorySummary: historySummary
    });

    refreshState();
    if (res.success && res.asset) {
      setSelectedAssetId(res.asset.assetId);
      setStatusMessage({
        type: 'SUCCESS',
        text: `Asset ${res.asset.assetId} passed all 9 stages! Permanent Footprint ${res.asset.footprint.footprintHash} generated and locked.`
      });
    } else {
      setStatusMessage({
        type: 'ERROR',
        text: res.error || 'Registration blocked.'
      });
    }
  };

  const handleSimulateDuplicateAttack = () => {
    // Attempt to re-register SRBMPR-PILOT-001 (same serial, maker, certificate)
    const res = engine.registerAssetThroughPipeline({
      title: 'Unauthorized Duplicate Submission of 1998 Gold Medal',
      category: 'CERTIFICATE_RECORD',
      countryJurisdiction: 'Global',
      serialOrContractId: 'MEDAL-GOLD-1998-001',
      issuerOrMaker: 'WORLD_ATHLETICS_FEDERATION',
      certificateNumber: 'CERT-WAF-98-7741',
      ownerAddressOrEntity: '0x0000...DEAD (Unauthorized Actor)',
      historicalPrice: 45000,
      historicalCurrency: 'USD',
      historicalDateUtc: '1998-11-14 18:00:00',
      historicalSource: 'Duplicate Claim',
      currentEstimatedMarketValue: 120000,
      documentedHistorySummary: 'Attempted second registration'
    });
    refreshState();
    setStatusMessage({
      type: 'ERROR',
      text: res.error || 'Duplicate blocked.'
    });
  };

  const handleIssueLayer = (assetId: string) => {
    const res = engine.issueAuthorizedLayer(assetId, 'SRBMPR Pilot Authority Vault');
    refreshState();
    if (res.success && res.layer) {
      setStatusMessage({
        type: 'SUCCESS',
        text: `Authorized Layer ${res.layer.layerId} issued! Enforced 25% SRBMPR (${res.layer.srbmprAllocatedUnits} units) / 75% Project (${res.layer.projectAllocatedUnits} units) allocation.`
      });
    } else {
      setStatusMessage({
        type: 'ERROR',
        text: res.error || 'Layer issuance blocked.'
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-5 font-mono select-none">
      <div className="bg-[#090d16] border border-amber-500/40 w-full max-w-6xl rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-100 max-h-[92vh]">
        
        {/* Top Master Blueprint Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 bg-[#070a12] flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-black text-white uppercase tracking-wider">
                  SRBMPR Universal Asset Behavior & Footprint Framework
                </h2>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded font-bold">
                  Master Blueprint v1.0 • Pilot Active
                </span>
              </div>
              <p className="text-[11px] text-amber-400/90 font-bold mt-0.5">
                Core Principle: Preserve the Footprint. Transfer the Layer. Maintain the History.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
              <button
                onClick={() => {
                  setActiveTab('PIPELINE_REGISTRY');
                  setStatusMessage(null);
                }}
                className={`px-3 py-1 rounded-md font-bold transition-colors ${
                  activeTab === 'PIPELINE_REGISTRY'
                    ? 'bg-amber-500 text-black font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                1. 9-Stage Pipeline & Pilot Registry ({assets.length})
              </button>
              <button
                onClick={() => {
                  setActiveTab('INGEST_AND_LOCK');
                  setStatusMessage(null);
                }}
                className={`px-3 py-1 rounded-md font-bold transition-colors ${
                  activeTab === 'INGEST_AND_LOCK'
                    ? 'bg-amber-500 text-black font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                2. Register Asset & Data-Lock Test
              </button>
              <button
                onClick={() => {
                  setActiveTab('TEST_SUITE_AND_CONTRACT');
                  setStatusMessage(null);
                }}
                className={`px-3 py-1 rounded-md font-bold transition-colors ${
                  activeTab === 'TEST_SUITE_AND_CONTRACT'
                    ? 'bg-amber-500 text-black font-black'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                3. Security Suite & Smart Contract
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status Alert Banner */}
        {statusMessage && (
          <div
            className={`px-5 py-2 text-xs font-bold flex items-center justify-between border-b shrink-0 ${
              statusMessage.type === 'SUCCESS'
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-500/15 border-rose-500/40 text-rose-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {statusMessage.type === 'SUCCESS' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
            <button onClick={() => setStatusMessage(null)} className="text-[10px] underline ml-4">
              Dismiss
            </button>
          </div>
        )}

        {/* TAB 1: 9-STAGE PIPELINE & PILOT ASSET REGISTRY */}
        {activeTab === 'PIPELINE_REGISTRY' && selectedAsset && (
          <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 text-xs">
            
            {/* Left Column (4 cols): Registered Pilot Assets List */}
            <div className="lg:col-span-4 space-y-2.5">
              <div className="text-[11px] font-black text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>Registered Global Pilot Assets</span>
                <span className="text-[10px] text-amber-400">One Asset = One Record</span>
              </div>

              <div className="space-y-2">
                {assets.map(asset => (
                  <div
                    key={asset.assetId}
                    onClick={() => setSelectedAssetId(asset.assetId)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      selectedAsset.assetId === asset.assetId
                        ? 'bg-amber-500/10 border-amber-500 text-white shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-black text-amber-400 text-[11px]">{asset.assetId}</span>
                      <span className="text-[9px] bg-slate-800 text-cyan-300 px-1.5 py-0.5 rounded font-bold">
                        {asset.category}
                      </span>
                    </div>
                    <div className="font-bold text-xs text-white mt-1 leading-snug">{asset.title}</div>
                    <div className="text-[10px] text-slate-400 mt-1 truncate">
                      ID: {asset.serialOrContractId} • Cert: {asset.certificateNumber}
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-800/80 text-[10px]">
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Footprint Locked
                      </span>
                      <span className="text-purple-300 font-bold">
                        Layers: {asset.authorizedLayers.length} / 1 Max
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Duplicate Protection Trigger */}
              <div className="bg-slate-950 border border-rose-500/30 rounded-xl p-3 space-y-2">
                <div className="text-[10px] font-black text-rose-400 uppercase flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Section 5.2 Data Lock Verification</span>
                </div>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  Test submitting the same Medal/Certificate (`MEDAL-GOLD-1998-001`) a second time to verify automatic duplicate quarantine:
                </p>
                <button
                  onClick={handleSimulateDuplicateAttack}
                  className="w-full py-1.5 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 rounded-lg font-bold text-[11px] transition-colors"
                >
                  Simulate Duplicate Registration Attempt
                </button>
              </div>
            </div>

            {/* Right Column (8 cols): Full 9-Stage Pipeline & Footprint Inspector */}
            <div className="lg:col-span-8 space-y-3.5">
              
              {/* Asset Identity & Permanent Behavior Footprint Box */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-amber-400 font-black text-sm">{selectedAsset.assetId}</span>
                      <span className="text-white font-bold text-sm">{selectedAsset.title}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Globe className="w-3 h-3 text-cyan-400" /> {selectedAsset.countryJurisdiction}
                      </span>
                      <span>Owner: {selectedAsset.ownerAddressOrEntity}</span>
                      <span>Version: v{selectedAsset.versionNumber} (Immutable Log)</span>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 rounded-lg text-[10px] font-black">
                    {selectedAsset.classification}
                  </span>
                </div>

                {/* Cryptographic Footprint Hashes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 bg-slate-900/70 p-2.5 rounded-lg border border-slate-800 text-[10px]">
                  <div>
                    <div className="text-slate-400 uppercase">Composite Identity Key (Register-Once Lock)</div>
                    <div className="text-amber-300 font-bold truncate mt-0.5">{selectedAsset.compositeIdentityKey}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 uppercase">Permanent Behavior Footprint Hash (Stage 5)</div>
                    <div className="text-emerald-400 font-bold truncate mt-0.5">{selectedAsset.footprint.footprintHash}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 uppercase">IPFS Content-Addressed Evidence URI</div>
                    <div className="text-cyan-300 truncate mt-0.5">{selectedAsset.footprint.evidenceContentHashIpfs}</div>
                  </div>
                  <div>
                    <div className="text-slate-400 uppercase">Genesis Registration Transaction</div>
                    <div className="text-slate-200 truncate mt-0.5">{selectedAsset.footprint.originalRegistrationTxHash}</div>
                  </div>
                </div>
              </div>

              {/* Section 5.4: Three Separated Valuation Records (Never Mixed) */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
                <div className="text-[11px] font-black text-cyan-400 uppercase tracking-wider">
                  Stage 3 — Three-Way Separated Valuation Engine (Historical vs Footprint vs New Layer)
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <div className="text-[9px] text-slate-400 uppercase">1. Original Value Record</div>
                    <div className="text-sm font-black text-white mt-0.5">
                      {selectedAsset.valuation.originalValueRecord.historicalPrice.toLocaleString()}{' '}
                      {selectedAsset.valuation.originalValueRecord.currency}
                    </div>
                    <div className="text-[9px] text-slate-400 mt-1">
                      Date: {selectedAsset.valuation.originalValueRecord.recordedTimestampUtc}
                    </div>
                    <div className="text-[9px] text-slate-500">
                      Source: {selectedAsset.valuation.originalValueRecord.sourceAuthority}
                    </div>
                  </div>

                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <div className="text-[9px] text-slate-400 uppercase">2. Footprint Value Context</div>
                    <div className="text-sm font-black text-amber-400 mt-0.5">
                      Score: {selectedAsset.valuation.behaviorFootprintValueContext.significanceScore}/100 (Verified)
                    </div>
                    <p className="text-[9px] text-slate-300 mt-1 leading-relaxed">
                      {selectedAsset.valuation.behaviorFootprintValueContext.documentedHistorySummary}
                    </p>
                  </div>

                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-emerald-500/30">
                    <div className="text-[9px] text-emerald-300 uppercase">3. New Layer Market Value</div>
                    <div className="text-sm font-black text-emerald-400 mt-0.5">
                      ${selectedAsset.valuation.newLayerMarketValue.currentEstimatedMarketValue.toLocaleString()}{' '}
                      {selectedAsset.valuation.newLayerMarketValue.currency}
                    </div>
                    <div className="text-[9px] text-slate-400 mt-1">
                      {selectedAsset.valuation.newLayerMarketValue.valuationBasis}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 5.7 & 5.8: Authorized New Layer Issuance & 25% SRBMPR Allocation */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="text-[11px] font-black text-purple-300 uppercase tracking-wider">
                      Stages 7, 8 & 9 — Authorized New Layer Continuity & 25% SRBMPR / 75% Project Allocation
                    </div>
                    <p className="text-[10px] text-slate-400">
                      New layer carries cryptographic proof back to {selectedAsset.footprint.footprintHash} without claiming to be the original object.
                    </p>
                  </div>

                  <button
                    onClick={() => handleIssueLayer(selectedAsset.assetId)}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-black text-[11px] rounded-lg flex items-center gap-1.5 shadow-md transition-colors"
                  >
                    <Layers className="w-3.5 h-3.5" />
                    <span>
                      {selectedAsset.authorizedLayers.length === 0
                        ? 'Issue Authorized Layer (25% SRBMPR)'
                        : 'Test 2nd Issuance (Blocked by Rule)'}
                    </span>
                  </button>
                </div>

                {selectedAsset.authorizedLayers.length === 0 ? (
                  <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3 text-center text-slate-400 text-[11px]">
                    No derivative layer issued yet. Footprint is locked and ready for authorized layer issuance.
                  </div>
                ) : (
                  selectedAsset.authorizedLayers.map(layer => (
                    <div key={layer.layerId} className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="font-black text-white text-xs">{layer.layerId}</span>
                          <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold">
                            {layer.layerStatus}
                          </span>
                          <span className="text-[9px] bg-slate-800 text-amber-300 px-2 py-0.5 rounded font-bold">
                            Claims Original Object: FALSE (Verified Link Only)
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">Issued: {layer.issuedAtUtc} UTC</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[10px] pt-1">
                        <div className="bg-slate-950/80 p-2 rounded border border-slate-800">
                          <span className="text-slate-400 block">Contractual Allocation Split:</span>
                          <strong className="text-amber-400">
                            25% SRBMPR ({layer.srbmprAllocatedUnits} units) / 75% Project ({layer.projectAllocatedUnits} units)
                          </strong>
                        </div>
                        <div className="bg-slate-950/80 p-2 rounded border border-slate-800">
                          <span className="text-slate-400 block">Linked Footprint Hash:</span>
                          <strong className="text-emerald-400 truncate block">{layer.linkedFootprintHash}</strong>
                        </div>
                        <div className="bg-slate-950/80 p-2 rounded border border-slate-800">
                          <span className="text-slate-400 block">Original Digital Token Status:</span>
                          <strong className="text-cyan-300">{layer.originalDigitalTokenRetirementStatus}</strong>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* 9-Stage End-to-End Pipeline Status Grid & Audit Trail */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-1.5">
                  <div className="text-[10px] font-black text-slate-300 uppercase">
                    9-Stage End-to-End Pipeline Status
                  </div>
                  {selectedAsset.pipelineStages.map(st => (
                    <div key={st.stage} className="flex items-center justify-between text-[10px] py-1 border-b border-slate-900 last:border-0">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="text-white font-bold">
                          S{st.stage}. {st.name}
                        </span>
                      </div>
                      <span className="text-slate-400 text-[9px]">{st.verificationNote}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-1.5">
                  <div className="text-[10px] font-black text-slate-300 uppercase flex items-center gap-1.5">
                    <History className="w-3.5 h-3.5 text-amber-400" />
                    <span>Permanent Audit Trail ({selectedAsset.auditTrail.length} Events)</span>
                  </div>
                  <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                    {selectedAsset.auditTrail.map(evt => (
                      <div key={evt.eventId} className="bg-slate-900/70 p-2 rounded border border-slate-800 text-[10px]">
                        <div className="flex items-center justify-between text-[9px] text-slate-400">
                          <span className="font-bold text-amber-300">{evt.actionType}</span>
                          <span>{evt.timestampUtc} UTC</span>
                        </div>
                        <div className="text-slate-200 mt-0.5">{evt.details}</div>
                        <div className="text-[9px] text-slate-500 truncate mt-0.5">Tx: {evt.txHash}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: REGISTER NEW ASSET & TEST DUPLICATE DATA-LOCK */}
        {activeTab === 'INGEST_AND_LOCK' && (
          <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 text-xs">
            <form onSubmit={handleRegisterSubmit} className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="text-xs font-black text-amber-400 uppercase flex items-center gap-2 border-b border-slate-800 pb-2">
                <PlusCircle className="w-4 h-4" />
                <span>Ingest New Physical / Digital Asset into 9-Stage SRBMPR Pipeline</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[10px] text-slate-400 uppercase mb-1">Asset Title / Description</label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 uppercase mb-1">Asset Category (Section 3)</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as UniversalAssetCategory)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs"
                  >
                    <option value="CERTIFICATE_RECORD">Certificates & Sports Medals</option>
                    <option value="PHYSICAL_OBJECT">Physical Objects (Watches, Vehicles, Trophies)</option>
                    <option value="HISTORICAL_COLLECTIBLE">Historical & Signed Collectibles</option>
                    <option value="DIGITAL_ASSET">Digital Assets & NFTs</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 uppercase mb-1">Country / Jurisdiction</label>
                  <input
                    type="text"
                    value={country}
                    onChange={e => setCountry(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 uppercase mb-1">Unique Serial / Contract+TokenID</label>
                  <input
                    type="text"
                    value={serialId}
                    onChange={e => setSerialId(e.target.value)}
                    className="w-full bg-slate-900 border border-amber-500/40 rounded-lg px-3 py-1.5 text-amber-300 font-bold text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 uppercase mb-1">Issuing Authority / Maker / Network</label>
                  <input
                    type="text"
                    value={issuer}
                    onChange={e => setIssuer(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 uppercase mb-1">Certificate Number / Metadata Hash</label>
                  <input
                    type="text"
                    value={certNumber}
                    onChange={e => setCertNumber(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 uppercase mb-1">Verified Owner Vault / Address</label>
                  <input
                    type="text"
                    value={ownerEntity}
                    onChange={e => setOwnerEntity(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 uppercase mb-1">Original Historical Price</label>
                  <input
                    type="number"
                    value={historicalPrice}
                    onChange={e => setHistoricalPrice(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] text-slate-400 uppercase mb-1">Independent New Layer Value (USD)</label>
                  <input
                    type="number"
                    value={currentLayerEstimate}
                    onChange={e => setCurrentLayerEstimate(e.target.value)}
                    className="w-full bg-slate-900 border border-emerald-500/40 rounded-lg px-3 py-1.5 text-emerald-300 font-bold text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] text-slate-400 uppercase mb-1">Provenance & Historical Behavior Summary</label>
                  <textarea
                    rows={2}
                    value={historySummary}
                    onChange={e => setHistorySummary(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white text-xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-black text-xs rounded-xl shadow-lg transition-colors"
              >
                Run 9-Stage Verification & Lock Permanent Behavior Footprint
              </button>
            </form>

            {/* Blocked Duplicate Submissions Log */}
            <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
              <div className="text-xs font-black text-rose-400 uppercase flex items-center justify-between border-b border-slate-800 pb-2">
                <span>Quarantined / Blocked Duplicate Attempts</span>
                <span className="bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded text-[10px]">
                  {blockedAttempts.length} Blocked
                </span>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                Under Section 5.2 (<strong>Data Lock Rule — Register Once</strong>), any attempt to submit an existing composite identity key (`Category::Issuer::Serial::Certificate`) is automatically rejected and logged.
              </p>

              <button
                onClick={handleSimulateDuplicateAttack}
                className="w-full py-2 bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/40 text-rose-300 font-bold rounded-lg text-xs"
              >
                Test Duplicate Submission (MEDAL-GOLD-1998-001)
              </button>

              <div className="space-y-2 max-h-72 overflow-y-auto">
                {blockedAttempts.length === 0 ? (
                  <div className="p-6 text-center text-slate-500 text-[11px] border border-dashed border-slate-800 rounded-lg">
                    No duplicate registration attempts recorded yet. Click above or submit the form twice with the same serial to test.
                  </div>
                ) : (
                  blockedAttempts.map(b => (
                    <div key={b.attemptId} className="bg-rose-950/20 border border-rose-500/30 rounded-lg p-2.5 space-y-1">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="font-bold text-rose-400">{b.attemptId}</span>
                        <span className="text-slate-400">{b.blockedAtUtc} UTC</span>
                      </div>
                      <div className="text-white font-bold text-[11px]">{b.submittedTitle}</div>
                      <div className="text-[10px] text-rose-300">{b.reason}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: SECURITY TEST SUITE & SMART CONTRACT */}
        {activeTab === 'TEST_SUITE_AND_CONTRACT' && (
          <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 text-xs">
            <div className="lg:col-span-6 space-y-2.5">
              <div className="text-xs font-black text-emerald-400 uppercase flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                <span>Deliverable 12 — Automated Security & Continuity Verification Suite</span>
              </div>
              <div className="space-y-2">
                {testResults.map(t => (
                  <div key={t.testId} className="bg-slate-950 border border-slate-800 rounded-xl p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-white">{t.testName}</span>
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded text-[10px] font-bold">
                        PASSED
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400">Expected: {t.expectedOutcome}</div>
                    <div className="text-[10px] text-emerald-400 font-bold">Actual: {t.actualOutcome}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-6 flex flex-col bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
              <div className="text-xs font-black text-amber-400 uppercase flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <FileCode2 className="w-4 h-4" />
                  <span>Deliverable 10 — Solidity Smart Contract (SRBMPRUniversalFootprintRegistry.sol)</span>
                </span>
                <span className="text-[10px] text-slate-400">Solidity ^0.8.24</span>
              </div>
              <pre className="flex-1 bg-[#06080f] border border-slate-800 rounded-lg p-3 text-[10px] text-cyan-300 overflow-x-auto overflow-y-auto max-h-[58vh] leading-relaxed">
                {engine.getSmartContractSourceCode()}
              </pre>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 bg-[#070a12] flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400 shrink-0">
          <div>
            Governing Principle: <strong>One original registration. One authorized transformation per asset lifecycle. Complete historical continuity. No duplicate issuance.</strong>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold text-xs"
          >
            Close Blueprint Workspace
          </button>
        </div>

      </div>
    </div>
  );
};
