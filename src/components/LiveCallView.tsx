import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Phone, 
  PhoneOff, 
  Mic, 
  MicOff, 
  Video,
  VideoOff,
  Volume2, 
  VolumeX, 
  Sparkles, 
  Zap, 
  Bot, 
  UserCheck, 
  Activity, 
  Check, 
  ChevronRight, 
  ChevronUp,
  ChevronDown,
  Radio, 
  Sliders, 
  X,
  MessageSquare,
  ShieldCheck,
  HelpCircle,
  AlertCircle,
  RefreshCw,
  Send,
  Eye,
  User,
  Layers,
  ArrowRight,
  Wifi,
  WifiOff
} from 'lucide-react';
import { HoloOrb } from './HoloOrb';
import { omniVoice } from '../lib/omniVoice';
import { handleSessionEnd, securityEngine } from '../lib/securityEngine';
import { 
  subscribeToNexusActiveStateSync, 
  pushNexusActiveState, 
  NexusActiveStateRecord 
} from '../lib/supabase';

export interface LiveCallCaller {
  name: string;
  role: string;
  avatar: string;
  company: string;
  badge?: string;
  contextScenario?: string;
}

export const CALLER_PRESETS: LiveCallCaller[] = [
  {
    name: 'Alex Rivera',
    role: 'VP Engineering',
    company: 'Nexus Core Systems',
    avatar: '👨‍💼',
    badge: 'CRITICAL ESCALATION',
    contextScenario: 'Staging deployment status and auth latency SLA verification.',
  },
  {
    name: 'Sarah Jenkins',
    role: 'CFO',
    company: 'Apex Corporation',
    avatar: '📊',
    badge: 'BILLING DISPUTE',
    contextScenario: 'Invoice #8819 unverified fee line audit and corporate credit clearance.',
  },
  {
    name: 'Maya Lin',
    role: 'Product Lead',
    company: 'Starlight Studio',
    avatar: '✨',
    badge: 'DESIGN REVIEW',
    contextScenario: '3D volumetric keyboard haptic response and investor showcase demo script.',
  }
];

export type CallLayoutState = 'audio' | 'video';
export type PersonaTone = 'Professional' | 'Casual' | 'Flirty' | 'Funny';

interface LiveCallViewProps {
  isOpen: boolean;
  onClose: () => void;
  caller?: LiveCallCaller;
  onInsertToKeyboard?: (text: string) => void;
}

export const LiveCallView: React.FC<LiveCallViewProps> = ({
  isOpen,
  onClose,
  caller = CALLER_PRESETS[0],
  onInsertToKeyboard
}) => {
  // Call Configuration State
  const [layoutState, setLayoutState] = useState<CallLayoutState>('audio');
  const [callActive, setCallActive] = useState(true);
  const [callSeconds, setCallSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [isCameraActive, setIsCameraActive] = useState(true);
  const [activeTone, setActiveTone] = useState<PersonaTone>('Professional');

  // Swipe-Up Text Extension Tray in Video Mode
  const [isVideoTrayExpanded, setIsVideoTrayExpanded] = useState(false);
  const [silentAIPrompt, setSilentAIPrompt] = useState('');
  const [silentAIAdvice, setSilentAIAdvice] = useState<string | null>(null);

  // Live Query Overlay States (What do they mean? & Catch Me Up)
  const [activeQueryModal, setActiveQueryModal] = useState<'what-do-they-mean' | 'catch-me-up' | null>(null);
  const [isQueryLoading, setIsQueryLoading] = useState(false);

  // Auto-Pilot & Voice Cloning State
  const [isAutoTakeover, setIsAutoTakeover] = useState(false);
  const [aiSpeaking, setAiSpeaking] = useState(false);

  // =========================================================================
  // REAL-TIME DATA PIPE STATE (THE LISTENER HOOK & DYNAMIC TEXT RE-BINDING)
  // =========================================================================
  const [isLiveConnected, setIsLiveConnected] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isSyncingState, setIsSyncingState] = useState(false);

  // Dynamic Prompt & Response Targets (No static arrays)
  const [currentSpeechToText, setCurrentSpeechToText] = useState<string>('');
  const [strategistPrompt, setStrategistPrompt] = useState<string>('');
  const [empathPrompt, setEmpathPrompt] = useState<string>('');
  const [ghostPrompt, setGhostPrompt] = useState<string>('');
  const [synthesisPrompt, setSynthesisPrompt] = useState<string>('');

  // Dynamic Ollama Subtext Analysis & Executive Catch-Me-Up
  const [subtextAnalysis, setSubtextAnalysis] = useState<{
    hiddenIntent: string;
    friction: string;
    leverage: string;
  } | null>(null);
  const [catchMeUpItems, setCatchMeUpItems] = useState<string[]>([]);

  // Transcript Feed
  const [transcript, setTranscript] = useState<Array<{ sender: 'caller' | 'me' | 'ai-cloned'; text: string; time: string }>>([]);

  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<any>(null);
  const timeoutGuardRef = useRef<any>(null);

  const formatCallTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  // Best Recommended Response for Eye-Line Prompter
  const eyeLinePrompterText = synthesisPrompt || strategistPrompt || "Awaiting incoming stream pulse...";

  // =========================================================================
  // DYNAMIC TEXT RE-BINDING ENGINE: INSTANT COMPONENT LAYOUT RECALCULATION
  // =========================================================================
  const applyIncomingSyncPulse = useCallback((record: NexusActiveStateRecord) => {
    if (!record) return;

    // 1. Text Prompt Target: Force Center Speech Reconstruction Box to update instantly
    if (record.speech_to_text) {
      setCurrentSpeechToText(record.speech_to_text);
      setTranscript((prev) => {
        const last = prev[prev.length - 1];
        if (!last || last.text !== record.speech_to_text) {
          return [
            ...prev,
            {
              sender: 'caller',
              text: record.speech_to_text,
              time: formatCallTime(callSeconds),
            },
          ];
        }
        return prev;
      });
    }

    // 2. Response Pill Targets: Completely wipe old values and dynamically inject fresh Tri-Agent responses
    if (record.strategist_response) setStrategistPrompt(record.strategist_response);
    if (record.empath_response) setEmpathPrompt(record.empath_response);
    if (record.ghost_response) setGhostPrompt(record.ghost_response);
    if (record.synthesis_response) setSynthesisPrompt(record.synthesis_response);

    // 3. Subtext & Catch Me Up Data
    if (record.subtext_hidden_intent || record.subtext_friction || record.subtext_leverage) {
      setSubtextAnalysis({
        hiddenIntent: record.subtext_hidden_intent || 'Direct operational inquiry pending verified telemetry.',
        friction: record.subtext_friction || 'Stakeholder anxiety regarding deployment milestone compliance.',
        leverage: record.subtext_leverage || 'Firm staging verification checkpoint prevents escalation.',
      });
    }

    if (Array.isArray(record.catch_me_up) && record.catch_me_up.length > 0) {
      setCatchMeUpItems(record.catch_me_up);
    }
  }, [callSeconds]);

  // =========================================================================
  // BACKEND QUERY PIPELINE DISPATCHER (FETCH & PATCH REAL-TIME CALL STATE)
  // =========================================================================
  const dispatchStatePulse = useCallback(async (params: {
    newTone?: PersonaTone;
    incomingSpeech?: string;
    recomputeOnly?: boolean;
    isInitial?: boolean;
  }) => {
    const toneToUse = params.newTone || activeTone;
    setIsSyncingState(true);

    try {
      const res = await fetch('/api/nexus/state-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callerName: caller.name,
          callerRole: caller.role,
          contextScenario: caller.contextScenario,
          incomingSpeech: params.incomingSpeech || (params.recomputeOnly ? currentSpeechToText : ''),
          activeTone: toneToUse,
          recomputeOnly: params.recomputeOnly,
          history: transcript.slice(-4),
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      if (data.success && data.record) {
        applyIncomingSyncPulse(data.record);
        // Persist to Supabase database table nexus_active_state_sync
        pushNexusActiveState(data.record).catch((e) => {
          console.warn('[LiveCall] Supabase async push note:', e?.message || e);
        });
      }
    } catch (err: any) {
      console.warn('[LiveCall] Backend pulse error (offline mode active):', err?.message || err);
      // Fallback calculation for offline mode so the layout never freezes
      const fallbackRecord: NexusActiveStateRecord = {
        caller_name: caller.name,
        caller_role: caller.role,
        speech_to_text: params.incomingSpeech || currentSpeechToText || `Incoming live voice stream for ${caller.name}...`,
        active_tone: toneToUse,
        strategist_response: toneToUse === 'Flirty' 
          ? `You know I always deliver before deadlines—especially when you're the one asking for it.`
          : toneToUse === 'Casual'
          ? `All good, spinning up the staging build right now. We'll have this wrapped up in ten.`
          : `Telemetry verified. Deploying staging immediately to safeguard SLA metrics and eliminate latency.`,
        empath_response: toneToUse === 'Flirty'
          ? `Don't stress your pretty mind over the staging bugs, I've got your back completely on this.`
          : toneToUse === 'Casual'
          ? `Totally get the crunch, man. Relax, we're on top of it and pinging you shortly.`
          : `I understand the priority on this rollout; our engineering leads are handling the fix right now.`,
        ghost_response: toneToUse === 'Flirty'
          ? `Wouldn't leave you hanging on a critical push. Watch how fast I make this green.`
          : toneToUse === 'Casual'
          ? `Gotcha. Handled and green. Don't sweat it.`
          : `Acknowledged. Staging push is queued. Telemetry logs will be delivered upon completion.`,
        synthesis_response: `Understood. The fix is verified and staging deployment is actively queued to safeguard SLA metrics with zero regressions.`,
        subtext_hidden_intent: `Executive stakeholder inquiry regarding live status and verified completion.`,
        subtext_friction: `Sensitivity around schedule adherence.`,
        subtext_leverage: `Firm verification checkpoints de-escalate friction immediately.`,
        catch_me_up: [
          `1. Active stream established for ${caller.name} (${caller.role}).`,
          `2. Calibrated to ${toneToUse} persona with sub-10ms neural routing.`,
          `3. Tri-Agent consensus recommends immediate verifiable confirmation.`,
        ],
      };
      applyIncomingSyncPulse(fallbackRecord);
    } finally {
      setIsSyncingState(false);
    }
  }, [activeTone, caller, currentSpeechToText, transcript, applyIncomingSyncPulse]);

  // =========================================================================
  // THE REAL-TIME DATA PIPE (THE LISTENER HOOK: SUPABASE WEBSOCKET STREAM)
  // =========================================================================
  const initWebSocketConnection = useCallback(() => {
    if (channelRef.current) {
      try {
        channelRef.current.unsubscribe();
      } catch {}
    }

    try {
      const channel = subscribeToNexusActiveStateSync(
        caller.name,
        (incomingRow) => {
          setIsLiveConnected(true);
          setConnectionError(null);
          applyIncomingSyncPulse(incomingRow);
        },
        (status, err) => {
          if (status === 'SUBSCRIBED') {
            setIsLiveConnected(true);
            setConnectionError(null);
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED' || err) {
            setIsLiveConnected(false);
            setConnectionError('[Nexus Link Mismatch: Running in Mock Offline Mode]');
          }
        }
      );

      channelRef.current = channel;

      // Safe Connection Timeout Trap (3 seconds)
      timeoutGuardRef.current = setTimeout(() => {
        // If connection did not reach SUBSCRIBED state, set safe offline mode
        if (channel.state !== 'joined') {
          setIsLiveConnected(false);
          setConnectionError('[Nexus Link Mismatch: Running in Mock Offline Mode]');
        }
      }, 3500);
    } catch (err) {
      setIsLiveConnected(false);
      setConnectionError('[Nexus Link Mismatch: Running in Mock Offline Mode]');
    }
  }, [caller.name, applyIncomingSyncPulse]);

  // Initial call setup & stream listener hook
  useEffect(() => {
    if (!isOpen || !callActive) return;

    // 1. Initialize persistent streaming connection pointing directly to nexus_active_state_sync
    initWebSocketConnection();

    // 2. Dispatch opening speech pulse
    const initTimer = setTimeout(() => {
      dispatchStatePulse({ isInitial: true });
    }, 450);

    return () => {
      clearTimeout(initTimer);
      if (timeoutGuardRef.current) clearTimeout(timeoutGuardRef.current);
      if (channelRef.current) {
        try {
          channelRef.current.unsubscribe();
        } catch {}
      }
    };
  }, [isOpen, callActive, initWebSocketConnection, dispatchStatePulse]);

  // Call Duration Timer
  useEffect(() => {
    if (!isOpen || !callActive) return;
    const interval = setInterval(() => {
      setCallSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, callActive]);

  // Auto scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  // Auto-Pilot voice takeover execution
  useEffect(() => {
    if (isAutoTakeover && callActive && transcript.length > 0) {
      const last = transcript[transcript.length - 1];
      if (last.sender === 'caller' && strategistPrompt) {
        const timer = setTimeout(() => {
          handleSpeakAsClone(synthesisPrompt || strategistPrompt);
        }, 1300);
        return () => clearTimeout(timer);
      }
    }
  }, [isAutoTakeover, transcript, callActive, strategistPrompt, synthesisPrompt]);

  // =========================================================================
  // TONE SHIFTER OVERRIDE (PERSONA SHIFTER TAB INSTANT STATE PATCH)
  // =========================================================================
  const handleToneChange = (tone: PersonaTone) => {
    if (tone === activeTone) return;
    setActiveTone(tone);
    // Fire instant query state patch back to the backend pipeline
    dispatchStatePulse({ newTone: tone, recomputeOnly: true });
  };

  // Speak using Web Speech Synthesis configured to user's cloned voice parameters
  const handleSpeakAsClone = (text: string) => {
    if (!text) return;
    setAiSpeaking(true);
    setTranscript((prev) => [
      ...prev,
      {
        sender: isAutoTakeover ? 'ai-cloned' : 'me',
        text,
        time: formatCallTime(callSeconds),
      },
    ]);

    if (onInsertToKeyboard) {
      onInsertToKeyboard(text);
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);

      const pitch = parseFloat(localStorage.getItem('omni_clone_pitch') || '1.0');
      const rate = parseFloat(localStorage.getItem('omni_clone_rate') || '1.05');
      utterance.pitch = pitch;
      utterance.rate = rate;

      utterance.onend = () => {
        setAiSpeaking(false);
        // Automatically request caller's next turn from backend after 2s
        setTimeout(() => {
          dispatchStatePulse({});
        }, 2200);
      };

      utterance.onerror = () => setAiSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => {
        setAiSpeaking(false);
        setTimeout(() => dispatchStatePulse({}), 2000);
      }, 1600);
    }
  };

  const handleSimulateCallerTurn = () => {
    dispatchStatePulse({});
  };

  // Micro-action: [?] "What do they mean?"
  const handleTriggerSubtextAnalysis = () => {
    setIsQueryLoading(true);
    setActiveQueryModal('what-do-they-mean');
    setTimeout(() => {
      setIsQueryLoading(false);
    }, 300);
  };

  // Micro-action: [!] "Catch Me Up"
  const handleTriggerCatchMeUp = () => {
    setIsQueryLoading(true);
    setActiveQueryModal('catch-me-up');
    setTimeout(() => {
      setIsQueryLoading(false);
    }, 300);
  };

  const handleSilentPromptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!silentAIPrompt.trim()) return;
    const prompt = silentAIPrompt.trim();
    setSilentAIPrompt('');
    setSilentAIAdvice('Council analyzing query against live call telemetry...');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `In the context of an active call with ${caller.name} (${caller.role}) who said "${currentSpeechToText}", answer this user query: "${prompt}"`,
          tone: activeTone.toLowerCase(),
        }),
      });
      const data = await res.json();
      setSilentAIAdvice(data.reply || data.verdict || `Optimal reply: Focus on concrete SLA milestone and confirm next steps.`);
    } catch {
      setSilentAIAdvice(`Council Analysis: Anchor your reply with verified telemetry metrics, de-escalate emotional friction, and confirm the staging checkpoint.`);
    }
  };

  const handleReconnectWebSocket = () => {
    setConnectionError(null);
    initWebSocketConnection();
    dispatchStatePulse({ recomputeOnly: true });
  };

  const handleEndCall = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    const sessionId = `call_${caller.name.replace(/\s+/g, '_')}_${Date.now()}`;
    const privacySettings = securityEngine.getSettings();
    handleSessionEnd(sessionId, { volatileModeEnabled: privacySettings.volatileCallMemory });

    setCallActive(false);
    setTimeout(() => {
      onClose();
      setCallActive(true);
      setCallSeconds(0);
      setTranscript([]);
      setCurrentSpeechToText('');
      setStrategistPrompt('');
      setEmpathPrompt('');
      setGhostPrompt('');
      setSynthesisPrompt('');
      setIsAutoTakeover(false);
      setActiveQueryModal(null);
      setSilentAIAdvice(null);
    }, 400);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#000000] text-[#f1f5f9] flex flex-col font-sans select-none overflow-hidden animate-in fade-in duration-200">
      
      {/* ==================================================================== */}
      {/* STATE STUCK SAFETY SAFEGUARD: SUBTLE NEON-RED WARNING TOAST          */}
      {/* ==================================================================== */}
      {(!isLiveConnected || connectionError) && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-md px-3 py-1.5 rounded-xl bg-[#000000]/95 backdrop-blur-md border border-[#ff0055]/80 shadow-[0_0_20px_rgba(255,0,85,0.35)] flex items-center justify-between animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-[#ff0055] animate-ping shrink-0" />
            <span className="text-[10px] sm:text-xs font-mono font-bold text-[#ff0055] tracking-tight truncate">
              [Nexus Link Mismatch: Running in Mock Offline Mode]
            </span>
          </div>
          <button
            type="button"
            onClick={handleReconnectWebSocket}
            className="px-2 py-0.5 rounded-lg bg-[#181333] hover:bg-[#ff0055]/20 text-white hover:text-[#ff0055] text-[9.5px] font-mono border border-[#ff0055]/50 transition shrink-0 ml-2"
          >
            Retry Link
          </button>
        </div>
      )}

      {/* ==================================================================== */}
      {/* STATE 1: RE-ENGINEERED AUDIO CALL HUDS (FULL-SCREEN MODE)           */}
      {/* ==================================================================== */}
      {layoutState === 'audio' && (
        <div className="w-full h-full flex flex-col bg-[#000000] relative">
          
          {/* 1. THE SYSTEM MONITOR LINE (TOP ROW - 10% HEIGHT) */}
          <section className="h-[10%] min-h-[58px] px-3.5 sm:px-5 bg-[#000000] border-b border-[#2a2254] flex items-center justify-between shrink-0 z-20">
            
            {/* Pinned Upper-Left Branding with Dynamic Zero-State Gray / Vibrant Status Orb */}
            <div className="flex items-center gap-2">
              <div 
                className={`relative flex items-center justify-center shrink-0 w-7 h-7 overflow-hidden rounded-full transition-all duration-300 ${
                  !isLiveConnected || connectionError
                    ? 'border border-zinc-700 bg-transparent opacity-40 shadow-none filter grayscale'
                    : 'bg-[#100d23] border border-[#00ffcc] shadow-[0_0_12px_rgba(0,255,204,0.4)]'
                }`}
                title={!isLiveConnected ? 'Nexus Link: Zero-State Gray Outline (Offline Mode)' : 'Nexus Link: Active Realtime Streaming'}
              >
                <HoloOrb
                  size="xs"
                  className="w-7 h-7"
                  phase={!isLiveConnected || connectionError ? 'idle' : aiSpeaking ? 'talking' : 'thinking'}
                />
              </div>
              <span className="text-xs sm:text-sm font-bold font-mono tracking-wider text-white">
                OmniAI<span className="text-[#00ffcc]"> - Nexus</span>
              </span>
            </div>

            {/* Contact Profile Name & Duration Ticker with Monospaced Telemetry Loop */}
            <div className="flex-1 max-w-md mx-2 sm:mx-4 flex flex-col items-center justify-center text-center">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white tracking-tight">{caller.name}</span>
                <span className="text-[10px] text-[#948eb5] font-mono">({caller.role})</span>
                <span className="px-1.5 py-0.5 rounded bg-[#100d23] border border-[#00ffcc]/40 text-[#00ffcc] text-[10px] font-mono font-bold">
                  {formatCallTime(callSeconds)}
                </span>
              </div>
              <div className="text-[9px] font-mono text-[#00ffcc] tracking-tighter truncate max-w-full flex items-center gap-1 justify-center">
                <span>[Nexus Active State Sync:</span>
                <span className={isLiveConnected ? "text-emerald-400 font-bold" : "text-[#ff0055] font-bold"}>
                  {isLiveConnected ? "STREAMING" : "OFFLINE MOCK"}
                </span>
                <span>• Tri-Agent Council Live]</span>
              </div>
            </div>

            {/* Right Controls: Mode Toggle & Close */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={() => setLayoutState('video')}
                className="px-2 py-1 rounded-lg bg-[#100d23] hover:bg-[#181333] border border-[#2a2254] hover:border-[#00ffcc]/50 text-[#00ffcc] text-[10px] font-mono font-bold flex items-center gap-1 transition"
                title="Switch to Compact Eye-Line Video Call"
              >
                <Video className="w-3.5 h-3.5 text-[#00ffcc]" />
                <span className="hidden xs:inline">Video Mode</span>
              </button>
              <button
                type="button"
                onClick={handleEndCall}
                className="p-1.5 rounded-lg bg-[#181333] hover:bg-rose-950 border border-rose-900/40 text-rose-400 hover:text-rose-200 transition"
                title="End Audio Call"
              >
                <PhoneOff className="w-3.5 h-3.5" />
              </button>
            </div>
          </section>

          {/* 2. THE LIVE SPEECH RECONSTRUCTION TRACK (CENTER AREA - 55% HEIGHT) */}
          <section className="h-[55%] relative flex flex-col bg-[#070512] border-b border-[#2a2254] overflow-hidden">
            
            {/* Top Telemetry Waveform Bar */}
            <div className="h-7 px-4 bg-[#0a081a] border-b border-[#1c163b] flex items-center justify-between text-[10px] font-mono text-[#948eb5] shrink-0">
              <div className="flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-[#00ffcc] animate-pulse" />
                <span className="text-[#00ffcc] font-semibold">CENTER SPEECH RECONSTRUCTION BOX</span>
              </div>
              <div className="flex items-center gap-1">
                {[14, 28, 10, 36, 22, 12, 42, 18, 30, 12, 24].map((h, i) => (
                  <span
                    key={i}
                    className="w-0.5 bg-gradient-to-t from-[#6c63ff] to-[#00ffcc] rounded-full animate-pulse"
                    style={{
                      height: `${h * 0.45}px`,
                      animationDuration: `${0.35 + (i % 5) * 0.15}s`
                    }}
                  />
                ))}
              </div>
              <span className="text-emerald-400 font-mono text-[9.5px]">
                {isSyncingState ? 'Syncing...' : 'Neural Pipe: 99.8%'}
              </span>
            </div>

            {/* Scrollable Live Text Box Processing Incoming Voice */}
            <div className="flex-1 overflow-y-auto p-4 pr-16 space-y-3 font-sans">
              {transcript.length === 0 && (
                <div className="flex items-center justify-center h-full text-zinc-500 font-mono text-xs">
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin text-[#00ffcc]" />
                  <span>Connecting to incoming caller speech stream...</span>
                </div>
              )}

              {transcript.map((msg, idx) => {
                const isCaller = msg.sender === 'caller';
                const isAI = msg.sender === 'ai-cloned';

                return (
                  <div
                    key={idx}
                    className={`flex flex-col ${isCaller ? 'items-start' : 'items-end'} animate-in fade-in slide-in-from-bottom-2`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 text-[9.5px] font-mono text-[#7d779f]">
                      <span className={isCaller ? 'text-cyan-400 font-semibold' : isAI ? 'text-[#00ffcc] font-bold' : 'text-slate-300'}>
                        {isCaller ? caller.name : isAI ? 'OmniAI (Cloned Voice Takeover)' : 'You (Live)'}
                      </span>
                      <span>• {msg.time}</span>
                    </div>
                    <div
                      className={`p-3 rounded-2xl max-w-[88%] text-xs leading-relaxed shadow-lg ${
                        isCaller
                          ? 'bg-[#100d23] text-[#e2e8f0] border border-[#2a2254] rounded-tl-sm shadow-[0_0_12px_rgba(0,0,0,0.5)]'
                          : isAI
                          ? 'bg-gradient-to-r from-[#181333] to-[#201648] text-white border border-[#00ffcc]/40 rounded-tr-sm shadow-[0_0_15px_rgba(0,255,204,0.15)]'
                          : 'bg-[#6c63ff] text-white font-medium rounded-tr-sm'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })}
              <div ref={transcriptEndRef} />
            </div>

            {/* LIVE QUERY OVERLAY (Right Margin Floating Buttons) */}
            <div className="absolute right-3 top-10 flex flex-col gap-2.5 z-30">
              {/* [?] What do they mean? */}
              <button
                type="button"
                onClick={handleTriggerSubtextAnalysis}
                className="group relative flex items-center justify-center w-10 h-10 rounded-xl bg-[#100d23] hover:bg-[#181333] border border-[#00ffcc]/50 hover:border-[#00ffcc] text-[#00ffcc] shadow-[0_0_14px_rgba(0,255,204,0.25)] transition active:scale-95"
                title="What do they mean? (Rapid Ollama Subtext Parse)"
              >
                <HelpCircle className="w-5 h-5 text-[#00ffcc]" />
                <span className="absolute right-12 px-2.5 py-1 rounded-md bg-[#000000] border border-[#2a2254] text-[#00ffcc] text-[9.5px] font-mono font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none shadow-xl">
                  [?] What do they mean?
                </span>
              </button>

              {/* [!] Catch Me Up */}
              <button
                type="button"
                onClick={handleTriggerCatchMeUp}
                className="group relative flex items-center justify-center w-10 h-10 rounded-xl bg-[#100d23] hover:bg-[#181333] border border-[#ff007f]/50 hover:border-[#ff007f] text-[#ff007f] shadow-[0_0_14px_rgba(255,0,127,0.25)] transition active:scale-95"
                title="Catch Me Up (Instant 3-Sentence Summary)"
              >
                <AlertCircle className="w-5 h-5 text-[#ff007f]" />
                <span className="absolute right-12 px-2.5 py-1 rounded-md bg-[#000000] border border-[#2a2254] text-[#ff007f] text-[9.5px] font-mono font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none shadow-xl">
                  [!] Catch Me Up
                </span>
              </button>

              {/* + Simulated Next Speech Turn */}
              <button
                type="button"
                onClick={handleSimulateCallerTurn}
                disabled={isSyncingState}
                className="group relative flex items-center justify-center w-10 h-10 rounded-xl bg-[#100d23] hover:bg-[#181333] border border-[#2a2254] hover:border-slate-500 text-slate-300 transition active:scale-95 disabled:opacity-50"
                title="Fetch Next Live Caller Utterance"
              >
                <RefreshCw className={`w-4 h-4 text-[#948eb5] ${isSyncingState ? 'animate-spin text-[#00ffcc]' : ''}`} />
                <span className="absolute right-12 px-2.5 py-1 rounded-md bg-[#000000] border border-[#2a2254] text-slate-300 text-[9.5px] font-mono whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none shadow-xl">
                  + Next Speech Turn
                </span>
              </button>
            </div>

            {/* Modal Sub-Panel for Subtext Query or Catch Me Up */}
            {activeQueryModal && (
              <div className="absolute inset-x-3 bottom-3 p-3.5 rounded-xl bg-[#100d23]/95 backdrop-blur-md border border-[#2a2254] shadow-[0_0_30px_rgba(0,0,0,0.9)] z-40 animate-in slide-in-from-bottom-2">
                <div className="flex items-center justify-between pb-2 border-b border-[#2a2254]">
                  <div className="flex items-center gap-2">
                    {activeQueryModal === 'what-do-they-mean' ? (
                      <>
                        <HelpCircle className="w-4 h-4 text-[#00ffcc]" />
                        <span className="text-xs font-mono font-bold text-[#00ffcc]">
                          Ollama Subtext Analysis (Dynamic Cognitive Parse)
                        </span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-[#ff007f]" />
                        <span className="text-xs font-mono font-bold text-[#ff007f]">
                          Catch Me Up: Executive 3-Point Summary
                        </span>
                      </>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveQueryModal(null)}
                    className="p-1 rounded-md hover:bg-[#181333] text-zinc-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="pt-2.5 text-xs text-[#cbd5e1] leading-relaxed">
                  {isQueryLoading ? (
                    <div className="flex items-center gap-2 py-2 text-zinc-400 font-mono text-[11px]">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#00ffcc]" />
                      <span>Parsing local LLM weights & conversation subtext...</span>
                    </div>
                  ) : activeQueryModal === 'what-do-they-mean' ? (
                    <div className="space-y-1.5 font-sans">
                      <p>
                        <strong className="text-white">Hidden Intent:</strong> {subtextAnalysis?.hiddenIntent || 'Caller requires definitive milestone validation to de-escalate executive stakeholder scrutiny.'}
                      </p>
                      <p>
                        <strong className="text-[#00ffcc]">Friction Vector:</strong> {subtextAnalysis?.friction || 'Anxiety over latency SLA adherence and potential regression.'}
                      </p>
                      <p>
                        <strong className="text-emerald-300">Optimal Leverage:</strong> {subtextAnalysis?.leverage || 'Present verified benchmark telemetry to secure unequivocal signoff.'}
                      </p>
                    </div>
                  ) : (
                    <ul className="space-y-1.5 list-disc list-inside font-sans">
                      {catchMeUpItems.length > 0 ? (
                        catchMeUpItems.map((item, i) => (
                          <li key={i} className="text-[#e2e8f0] font-sans">
                            {item}
                          </li>
                        ))
                      ) : (
                        <>
                          <li><strong className="text-white">1. Core Issue:</strong> Staging deployment status requested to resolve auth latency escalation.</li>
                          <li><strong className="text-[#ff007f]">2. Key Constraint:</strong> Patch must deploy prior to noon without breaking backwards compatibility.</li>
                          <li><strong className="text-emerald-300">3. Current Status:</strong> Staging regressions verified green; awaiting user confirmation to ship.</li>
                        </>
                      )}
                    </ul>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* 3. THE FLUID INTERACTION INTERCONNECT DECK (BOTTOM ROW - 35% HEIGHT) */}
          <section className="h-[35%] flex flex-col justify-between bg-[#100d23] p-3 sm:p-4 z-20">
            
            {/* The 3 Eye-Catch Response Pills: Dynamically injected on every database pulse */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-mono text-[#948eb5]">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#00ffcc]" />
                  <span className="text-white font-bold uppercase tracking-wider">Tri-Agent Council Live Prompts</span>
                </div>
                <div className="flex items-center gap-2">
                  {/* Auto-Takeover Mode Toggle */}
                  <button
                    type="button"
                    onClick={() => setIsAutoTakeover(!isAutoTakeover)}
                    className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold transition flex items-center gap-1 ${
                      isAutoTakeover 
                        ? 'bg-[#00ffcc] text-black shadow-[0_0_8px_rgba(0,255,204,0.4)]' 
                        : 'bg-[#181333] border border-[#2a2254] text-[#948eb5] hover:text-white'
                    }`}
                  >
                    <Zap className="w-3 h-3" />
                    <span>{isAutoTakeover ? 'AI TAKEOVER: ON' : 'AI TAKEOVER: OFF'}</span>
                  </button>
                  <span className="text-[#00ffcc] font-semibold">{activeTone}</span>
                </div>
              </div>

              {/* 3 Fresh Contextual Responses Pushed by Tri-Agent Council */}
              <div className="grid grid-cols-1 gap-1.5">
                
                {/* 1. Strategist Pill */}
                <button
                  type="button"
                  onClick={() => handleSpeakAsClone(strategistPrompt)}
                  disabled={aiSpeaking || !strategistPrompt}
                  className="w-full text-left p-2 rounded-xl bg-[#15122c] hover:bg-[#1c183b] border border-[#2a2254] hover:border-[#00ffcc]/60 transition flex items-center justify-between group disabled:opacity-50 shadow-sm"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="px-1.5 py-0.5 rounded text-[8.5px] font-mono font-bold bg-[#60a5fa]/20 text-[#60a5fa] border border-[#60a5fa]/40 shrink-0">
                      STRATEGIST
                    </span>
                    <span className="text-xs text-[#e2e8f0] group-hover:text-white truncate">
                      {strategistPrompt ? `"${strategistPrompt}"` : "Calculating tactical counter-proposal..."}
                    </span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-[#948eb5] group-hover:text-[#00ffcc] shrink-0 ml-1.5" />
                </button>

                {/* 2. Empath Pill */}
                <button
                  type="button"
                  onClick={() => handleSpeakAsClone(empathPrompt)}
                  disabled={aiSpeaking || !empathPrompt}
                  className="w-full text-left p-2 rounded-xl bg-[#15122c] hover:bg-[#1c183b] border border-[#2a2254] hover:border-[#f472b6]/60 transition flex items-center justify-between group disabled:opacity-50 shadow-sm"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="px-1.5 py-0.5 rounded text-[8.5px] font-mono font-bold bg-[#f472b6]/20 text-[#f472b6] border border-[#f472b6]/40 shrink-0">
                      EMPATH
                    </span>
                    <span className="text-xs text-[#e2e8f0] group-hover:text-white truncate">
                      {empathPrompt ? `"${empathPrompt}"` : "Aligning emotional empathy tone..."}
                    </span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-[#948eb5] group-hover:text-[#f472b6] shrink-0 ml-1.5" />
                </button>

                {/* 3. Ghost Pill */}
                <button
                  type="button"
                  onClick={() => handleSpeakAsClone(ghostPrompt)}
                  disabled={aiSpeaking || !ghostPrompt}
                  className="w-full text-left p-2 rounded-xl bg-[#15122c] hover:bg-[#1c183b] border border-[#2a2254] hover:border-[#34d399]/60 transition flex items-center justify-between group disabled:opacity-50 shadow-sm"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="px-1.5 py-0.5 rounded text-[8.5px] font-mono font-bold bg-[#34d399]/20 text-[#34d399] border border-[#34d399]/40 shrink-0">
                      GHOST
                    </span>
                    <span className="text-xs text-[#e2e8f0] group-hover:text-white truncate">
                      {ghostPrompt ? `"${ghostPrompt}"` : "Synthesizing authentic cloned cadence..."}
                    </span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-[#948eb5] group-hover:text-[#34d399] shrink-0 ml-1.5" />
                </button>

              </div>
            </div>

            {/* Persona Shifter Tabs: Instant query state patch & re-calculation trigger */}
            <div className="pt-2 border-t border-[#2a2254]/60">
              <div className="flex items-center justify-between mb-1 text-[9.5px] font-mono text-[#7d779f]">
                <span>PERSONA SHIFTER:</span>
                <span className="text-[#00ffcc]">SWAP TONE INSTANTLY</span>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                {(['Professional', 'Casual', 'Flirty', 'Funny'] as PersonaTone[]).map((tone) => (
                  <button
                    key={tone}
                    type="button"
                    onClick={() => handleToneChange(tone)}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-mono font-bold transition text-center shrink-0 ${
                      activeTone === tone
                        ? 'bg-[#00ffcc] text-black shadow-[0_0_10px_rgba(0,255,204,0.35)]'
                        : 'bg-[#181333] hover:bg-[#201a44] border border-[#2a2254] text-[#948eb5] hover:text-white'
                    }`}
                  >
                    {tone}
                  </button>
                ))}
              </div>
            </div>

            {/* Hardware Controls Row */}
            <div className="pt-2 flex items-center justify-around border-t border-[#2a2254]/50">
              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className={`p-2.5 rounded-full border transition ${
                  isMuted 
                    ? 'bg-rose-950/60 text-rose-400 border-rose-600/50' 
                    : 'bg-[#181333] hover:bg-[#201a44] text-zinc-300 border-[#2a2254]'
                }`}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                className={`p-2.5 rounded-full border transition ${
                  isSpeakerOn 
                    ? 'bg-[#181333] text-[#00ffcc] border-[#00ffcc]/40 shadow-[0_0_8px_rgba(0,255,204,0.2)]' 
                    : 'bg-[#181333] text-zinc-400 border-[#2a2254]'
                }`}
                title={isSpeakerOn ? 'Speaker HD' : 'Earpiece'}
              >
                {isSpeakerOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={() => setLayoutState('video')}
                className="p-2.5 rounded-full bg-[#181333] hover:bg-[#201a44] text-[#00ffcc] border border-[#00ffcc]/40 transition shadow-sm"
                title="Switch to Video Call View"
              >
                <Video className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleEndCall}
                className="px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-rose-600/30 active:scale-95 transition"
                title="End Active Call"
              >
                <PhoneOff className="w-4 h-4" />
                <span>End Call</span>
              </button>
            </div>

          </section>

        </div>
      )}

      {/* ==================================================================== */}
      {/* STATE 2: THE COMPACT VIDEO CALL CANVAS (EYE-LINE OPTIMIZED OVERLAY) */}
      {/* ==================================================================== */}
      {layoutState === 'video' && (
        <div className="w-full h-full flex flex-col bg-[#000000] relative">
          
          {/* 1. THE VIDEO VIEWPORT GRID (TOP 75% VIEWPORT HEIGHT) */}
          <section className="h-[75%] relative w-full overflow-hidden bg-[#070512]">
            
            {/* Incoming Video Feed */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#100d23] via-[#090716] to-[#000000] flex items-center justify-center">
              <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#00ffcc_1px,transparent_1px)] [background-size:24px_24px]" />
                
                {/* Caller Persona Video Canvas */}
                <div className="relative flex flex-col items-center justify-center">
                  <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full p-1 bg-gradient-to-tr from-[#6c63ff] via-[#00ffcc] to-[#ff007f] shadow-[0_0_50px_rgba(0,255,204,0.3)]">
                    <div className="w-full h-full rounded-full bg-[#100d23] border-2 border-[#2a2254] flex items-center justify-center text-6xl select-none">
                      {caller.avatar}
                    </div>

                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-[#000000]/80 border border-[#00ffcc] text-[#00ffcc] text-[8.5px] font-mono font-bold tracking-wider">
                      EYE-LINE SYNC 98%
                    </div>
                  </div>

                  <div className="mt-3 text-center">
                    <div className="text-sm font-bold text-white tracking-wide">{caller.name}</div>
                    <div className="text-[11px] font-mono text-[#948eb5]">{caller.company} • 1080p 60FPS</div>
                  </div>
                </div>

                {/* Video Watermark & Telemetry Badge */}
                <div className="absolute bottom-3 left-4 flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#000000]/70 backdrop-blur-md border border-[#2a2254] text-[9.5px] font-mono text-[#00ffcc]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00ffcc] animate-ping" />
                  <span>SECURE WEBRTC PIPELINE • {formatCallTime(callSeconds)}</span>
                </div>
              </div>
            </div>

            {/* BRANDING ORB WITH DYNAMIC ZERO-STATE GRAY OUTLINE ON DISCONNECT */}
            <div className="absolute top-3 left-3 z-30 flex items-center gap-2 px-2.5 py-1 rounded-xl bg-[#000000]/80 backdrop-blur-md border border-[#2a2254] shadow-lg">
              <div 
                className={`relative flex items-center justify-center shrink-0 w-6 h-6 overflow-hidden rounded-full transition-all duration-300 ${
                  !isLiveConnected || connectionError
                    ? 'border border-zinc-700 bg-transparent opacity-40 shadow-none filter grayscale'
                    : 'bg-[#100d23] border border-[#00ffcc] shadow-[0_0_10px_rgba(0,255,204,0.4)]'
                }`}
              >
                <HoloOrb
                  size="xs"
                  className="w-6 h-6"
                  phase={!isLiveConnected || connectionError ? 'idle' : aiSpeaking ? 'talking' : 'thinking'}
                />
              </div>
              <span className="text-xs font-bold font-mono tracking-wider text-white">
                OmniAI<span className="text-[#00ffcc]"> - Nexus</span>
              </span>
            </div>

            {/* Mode Switcher Shortcut */}
            <div className="absolute top-3 right-3 z-30 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setLayoutState('audio')}
                className="px-2.5 py-1 rounded-xl bg-[#000000]/80 backdrop-blur-md border border-[#2a2254] text-[#948eb5] hover:text-[#00ffcc] text-[10px] font-mono transition"
                title="Switch to Audio HUD"
              >
                Audio HUD
              </button>
            </div>

            {/* THE EYE-LINE TELEMETRY LINE: SMART PROMPTER */}
            <div className="absolute top-12 sm:top-14 inset-x-3 sm:inset-x-8 z-30">
              <div className="p-2 sm:p-2.5 rounded-xl bg-[#000000]/90 backdrop-blur-lg border border-[#00ffcc] shadow-[0_0_20px_rgba(0,255,204,0.3)] transition-all">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 text-[9px] font-mono font-bold text-[#00ffcc]">
                    <Eye className="w-3 h-3 text-[#00ffcc] animate-pulse" />
                    <span>EYE-LINE PROMPTER (LOOK AT CAMERA LENS)</span>
                  </div>
                  <span className="text-[8.5px] font-mono px-1.5 py-0.2 rounded bg-[#100d23] text-[#00ffcc] border border-[#00ffcc]/40">
                    {activeTone} RECOMMENDATION
                  </span>
                </div>
                <div className="text-xs sm:text-sm font-semibold text-white tracking-wide leading-snug flex items-center justify-between gap-2">
                  <span className="text-[#f1f5f9] truncate">
                    "{eyeLinePrompterText}"
                  </span>
                  <button
                    type="button"
                    onClick={() => handleSpeakAsClone(eyeLinePrompterText)}
                    disabled={aiSpeaking || !eyeLinePrompterText}
                    className="shrink-0 px-2.5 py-1 rounded-md bg-[#00ffcc] hover:bg-[#00e6b8] text-black font-mono font-bold text-[10px] transition active:scale-95 disabled:opacity-50"
                  >
                    Speak
                  </button>
                </div>
              </div>
            </div>

          </section>

          {/* 2. THE MINIMAL FLOATING INTERACTION HUD (BOTTOM 25% VIEWPORT HEIGHT) */}
          <section className="h-[25%] relative bg-[#100d23]/95 backdrop-blur-xl border-t border-[#2a2254] flex flex-col justify-between p-3 sm:p-4 z-40 transition-all">
            
            {/* Swipe-Up Expansion Drawer Bar */}
            <div className="flex items-center justify-between text-[10px] font-mono text-[#948eb5]">
              <span className="text-white font-bold tracking-wider">CALL CONTROLS & HUD</span>
              
              <button
                type="button"
                onClick={() => setIsVideoTrayExpanded(!isVideoTrayExpanded)}
                className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#181333] border border-[#2a2254] text-[#00ffcc] hover:border-[#00ffcc] transition"
              >
                <span>{isVideoTrayExpanded ? 'Minimize Query' : 'Swipe Up: Silent Query'}</span>
                {isVideoTrayExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
              </button>
            </div>

            {/* Expanded Swipe-Up Clean Text Input Prompt Box */}
            {isVideoTrayExpanded ? (
              <div className="my-1.5 space-y-1.5">
                <form onSubmit={handleSilentPromptSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={silentAIPrompt}
                    onChange={(e) => setSilentAIPrompt(e.target.value)}
                    placeholder="Type silent manual query to AI core..."
                    className="flex-1 bg-[#070512] border border-[#2a2254] focus:border-[#00ffcc] rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-zinc-600 outline-none font-sans"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-xl bg-[#00ffcc] text-black font-mono font-bold text-xs flex items-center gap-1 shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Ask</span>
                  </button>
                </form>
                {silentAIAdvice && (
                  <div className="p-2 rounded-lg bg-[#070512] border border-[#00ffcc]/40 text-[11px] text-[#cbd5e1] font-sans">
                    {silentAIAdvice}
                  </div>
                )}
              </div>
            ) : (
              /* Micro Persona Shifter (Space-saving pill selector) */
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                {(['Professional', 'Casual', 'Flirty', 'Funny'] as PersonaTone[]).map((tone) => (
                  <button
                    key={tone}
                    type="button"
                    onClick={() => handleToneChange(tone)}
                    className={`flex-1 py-1 px-2 rounded-lg text-[10.5px] font-mono font-bold transition text-center shrink-0 ${
                      activeTone === tone
                        ? 'bg-[#00ffcc] text-black shadow-[0_0_8px_rgba(0,255,204,0.3)]'
                        : 'bg-[#181333] border border-[#2a2254] text-[#948eb5]'
                    }`}
                  >
                    {tone}
                  </button>
                ))}
              </div>
            )}

            {/* Circular Hotkey Icons for Standard Calling Operations */}
            <div className="flex items-center justify-around pt-1">
              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className={`w-11 h-11 rounded-full border flex items-center justify-center transition ${
                  isMuted 
                    ? 'bg-rose-950/60 text-rose-400 border-rose-600/50' 
                    : 'bg-[#181333] hover:bg-[#201a44] text-zinc-300 border-[#2a2254]'
                }`}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={() => setIsCameraActive(!isCameraActive)}
                className={`w-11 h-11 rounded-full border flex items-center justify-center transition ${
                  isCameraActive 
                    ? 'bg-[#181333] text-[#00ffcc] border-[#00ffcc]/40 shadow-[0_0_8px_rgba(0,255,204,0.2)]' 
                    : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                }`}
                title="Toggle Camera"
              >
                {isCameraActive ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={() => setLayoutState('audio')}
                className="w-11 h-11 rounded-full bg-[#181333] hover:bg-[#201a44] text-[#948eb5] hover:text-white border border-[#2a2254] flex items-center justify-center transition"
                title="Switch back to Audio Fullscreen HUD"
              >
                <Layers className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleEndCall}
                className="px-5 h-11 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-rose-600/40 active:scale-95 transition"
                title="End Call"
              >
                <PhoneOff className="w-4 h-4" />
                <span>End Call</span>
              </button>
            </div>

          </section>

        </div>
      )}

    </div>
  );
};
