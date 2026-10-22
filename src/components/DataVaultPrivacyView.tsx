import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  Trash2, 
  AlertTriangle, 
  ChevronLeft, 
  RefreshCw, 
  Cpu, 
  Database, 
  Check, 
  CheckCircle2,
  Zap,
  PhoneCall,
  MessageSquare
} from 'lucide-react';
import { triggerTactileHaptic } from '../lib/hapticFeedback';
import { securityEngine, PrivacySecuritySettings } from '../lib/securityEngine';

interface DataVaultPrivacyViewProps {
  onBack?: () => void;
}

export const DataVaultPrivacyView: React.FC<DataVaultPrivacyViewProps> = ({ onBack }) => {
  const [settings, setSettings] = useState<PrivacySecuritySettings>(() => securityEngine.getSettings());
  const [dataFootprint, setDataFootprint] = useState<string>(() => securityEngine.getDataFootprint());
  const [isPurging, setIsPurging] = useState<boolean>(false);
  const [purgeFeedback, setPurgeFeedback] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = securityEngine.subscribe((newSettings, footprint) => {
      setSettings(newSettings);
      setDataFootprint(footprint);
    });
    return unsubscribe;
  }, []);

  // Mode Selection: Ephemeral vs Persistent
  const handleSelectMode = (mode: 'ephemeral' | 'persistent') => {
    triggerTactileHaptic(4, 'tap');
    if (mode === 'ephemeral') {
      securityEngine.updateSettings({
        mode: 'ephemeral',
        volatileCallMemory: true,
        volatileTextMemory: true,
      });
    } else {
      securityEngine.updateSettings({
        mode: 'persistent',
        volatileCallMemory: false,
        volatileTextMemory: false,
      });
    }
  };

  // Toggle Call Memory Volatility
  const handleToggleCallMemory = () => {
    triggerTactileHaptic(4, 'tap');
    securityEngine.updateSettings({
      volatileCallMemory: !settings.volatileCallMemory,
    });
  };

  // Toggle Text Memory Volatility
  const handleToggleTextMemory = () => {
    triggerTactileHaptic(4, 'tap');
    securityEngine.updateSettings({
      volatileTextMemory: !settings.volatileTextMemory,
    });
  };

  // Master Panic Clean / Emergency Purge
  const handleEmergencyPurge = async () => {
    triggerTactileHaptic(6, 'delete');
    setIsPurging(true);
    setPurgeFeedback('Overwriting memory context with null vectors...');

    setTimeout(async () => {
      await securityEngine.purgeActiveCacheMemory();
      setIsPurging(false);
      setPurgeFeedback('All temporary registers securely purged! (0B retained)');
      triggerTactileHaptic(6, 'enter');
      setTimeout(() => setPurgeFeedback(null), 3000);
    }, 900);
  };

  const isFullyEphemeral = settings.mode === 'ephemeral' && settings.volatileCallMemory && settings.volatileTextMemory;

  return (
    <div className="w-full max-w-[400px] h-[850px] mx-auto overflow-hidden bg-black text-white relative flex flex-col justify-between font-mono select-none border-x border-zinc-900 shadow-2xl">
      
      {/* 1. TOP STATUS & NAVIGATION HEADER */}
      <div className="shrink-0 bg-zinc-950/90 border-b border-zinc-900 backdrop-blur-md">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {onBack && (
              <button
                type="button"
                onClick={() => {
                  triggerTactileHaptic(3, 'tap');
                  onBack();
                }}
                className="p-1.5 -ml-1 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800 transition active:scale-95 flex items-center justify-center"
                title="Go back"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-bold tracking-wider text-white">
                  Data Vault & Privacy Security
                </h1>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              </div>
              <p className="text-[10px] text-zinc-400">
                Volatility Status Engine & Data Shredder
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 text-[10px]">
            <ShieldCheck className="w-3 h-3 text-cyan-400" />
            <span>NPU Shield</span>
          </div>
        </div>

        {/* PROMINENT STATUS HEADER: Active Data Footprint */}
        <div className="px-4 pb-3 pt-1 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isFullyEphemeral ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-amber-400 shadow-[0_0_8px_#fbbf24]'}`} />
            <span className="text-xs text-zinc-400">Active Data Footprint:</span>
          </div>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${
            isFullyEphemeral 
              ? 'bg-emerald-950/50 text-emerald-300 border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
              : 'bg-amber-950/40 text-amber-300 border-amber-500/30'
          }`}>
            {dataFootprint}
          </span>
        </div>
      </div>

      {/* 2. SCROLLABLE MIDDLE CONTENT AREA */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        
        {/* Two Operational Privacy Modes Switch */}
        <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-900 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              Operational Privacy Mode
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">
              {settings.mode === 'ephemeral' ? 'MAX SECURITY' : 'ENCRYPTED CACHE'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleSelectMode('ephemeral')}
              className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                settings.mode === 'ephemeral'
                  ? 'bg-gradient-to-br from-emerald-950/60 to-zinc-950 border-emerald-500/60 text-white shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                  : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-emerald-400">Ephemeral</span>
                {settings.mode === 'ephemeral' && <Check className="w-3.5 h-3.5 text-emerald-400" />}
              </div>
              <span className="text-[10px] text-zinc-400 leading-tight">
                Auto-Off. Zero retention. Wipes workspace the millisecond sessions close.
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleSelectMode('persistent')}
              className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                settings.mode === 'persistent'
                  ? 'bg-gradient-to-br from-cyan-950/60 to-zinc-950 border-cyan-500/60 text-white shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                  : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-cyan-400">Persistent</span>
                {settings.mode === 'persistent' && <Check className="w-3.5 h-3.5 text-cyan-400" />}
              </div>
              <span className="text-[10px] text-zinc-400 leading-tight">
                Auto-On. Preserves context memory in local encrypted device database.
              </span>
            </button>
          </div>
        </div>

        {/* THE SESSION RETENTION MODE TOGGLES */}
        <div className="space-y-3">
          <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 px-1">
            Session Memory Volatility Toggles
          </div>

          {/* ROW 1: Volatile Call Memory (Volatile Phone Sessions) */}
          <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-900 hover:border-zinc-800 transition flex items-start justify-between gap-3">
            <div className="space-y-1 pr-2">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-3.5 h-3.5 text-red-400" />
                <h3 className="text-xs font-bold text-white">
                  Volatile Call Memory
                </h3>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                  Phone Calls
                </span>
              </div>
              <p className="text-[10.5px] text-zinc-400 leading-relaxed font-sans">
                Auto-shreds speech transcripts and audio cache files immediately upon call hangup. Instantly purges all audio vectors from server memory.
              </p>
            </div>

            {/* iOS/Android Style Toggle */}
            <button
              type="button"
              onClick={handleToggleCallMemory}
              className={`w-12 h-6 rounded-full transition-colors relative shrink-0 mt-1 ${
                settings.volatileCallMemory ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]' : 'bg-zinc-800'
              }`}
              title="Toggle Volatile Call Memory"
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  settings.volatileCallMemory ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* ROW 2: Volatile Text Memory (Volatile Messaging Sessions) */}
          <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-900 hover:border-zinc-800 transition flex items-start justify-between gap-3">
            <div className="space-y-1 pr-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                <h3 className="text-xs font-bold text-white">
                  Volatile Text Memory
                </h3>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                  Chats & DMs
                </span>
              </div>
              <p className="text-[10.5px] text-zinc-400 leading-relaxed font-sans">
                Erases message context vectors the moment the chat view closes or when exiting the application.
              </p>
            </div>

            {/* iOS/Android Style Toggle */}
            <button
              type="button"
              onClick={handleToggleTextMemory}
              className={`w-12 h-6 rounded-full transition-colors relative shrink-0 mt-1 ${
                settings.volatileTextMemory ? 'bg-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.5)]' : 'bg-zinc-800'
              }`}
              title="Toggle Volatile Text Memory"
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                  settings.volatileTextMemory ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* WARNING INDICATOR PANEL (EXACT PROMPT SPECIFICATION) */}
        <div className="border border-yellow-600/30 bg-yellow-950/20 text-yellow-500 text-xs rounded-lg p-3 mx-1 my-2 flex items-start gap-2.5 font-sans leading-relaxed">
          <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0 mt-0.5" />
          <span>
            <strong>Notice:</strong> Leaving Memory Volatility OFF allows the AI to develop long-term contextual relationship memory, but retains private logs on your local device storage encryption layer.
          </span>
        </div>

        {/* Security Shredder Architecture Diagnostics */}
        <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-900 space-y-2 text-[10.5px]">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-zinc-500" />
              Memory Context Nullification:
            </span>
            <span className="text-emerald-400 font-bold">Active Vector Shredder</span>
          </div>
          <div className="flex items-center justify-between text-zinc-400">
            <span className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-zinc-500" />
              Local Encryption Standard:
            </span>
            <span className="text-zinc-200">{settings.encryptionStandard}</span>
          </div>
          {settings.lastPurgedAt && (
            <div className="flex items-center justify-between text-zinc-400 pt-1 border-t border-zinc-900">
              <span>Last Panic Clean Execution:</span>
              <span className="text-red-400 font-bold">{settings.lastPurgedAt}</span>
            </div>
          )}
        </div>

      </div>

      {/* 3. BOTTOM ANCHORED ACTION DOCK WITH MASTER 'PANIC CLEAN' TRIGGER */}
      <div className="shrink-0 p-4 border-t border-zinc-900 bg-zinc-950 space-y-2.5">
        {/* Purge Feedback Notification */}
        {purgeFeedback && (
          <div className="p-2.5 rounded-xl bg-red-950/80 border border-red-500/60 text-red-300 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-red-400 shrink-0" />
            <span className="truncate">{purgeFeedback}</span>
          </div>
        )}

        {/* Master 'Panic Clean' Trigger:
            w-full bg-red-950/40 border border-red-800/60 text-red-400 text-sm font-semibold text-center rounded-xl p-3 cursor-pointer */}
        <button
          type="button"
          onClick={handleEmergencyPurge}
          disabled={isPurging}
          className="w-full bg-red-950/40 hover:bg-red-900/50 border border-red-800/60 text-red-400 hover:text-red-300 text-sm font-semibold text-center rounded-xl p-3 cursor-pointer transition active:scale-[0.98] shadow-lg shadow-red-950/40 flex items-center justify-center gap-2 disabled:opacity-50"
          title="Emergency Purge: Immediately clear all temporary memory registers"
        >
          {isPurging ? (
            <>
              <RefreshCw className="w-4 h-4 text-red-400 animate-spin" />
              <span>Purging Active Registers...</span>
            </>
          ) : (
            <>
              <Trash2 className="w-4 h-4 text-red-400" />
              <span>Purge Active Cache Memory</span>
            </>
          )}
        </button>

        <p className="text-[10px] text-zinc-500 text-center font-sans">
          Overwrites temporary context in RAM buffers and wipes external voice traces.
        </p>
      </div>

    </div>
  );
};
