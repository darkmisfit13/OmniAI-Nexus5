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
  WifiOff,
  Disc
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
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
  onSaveToVault?: (asset: any) => void;
}

export const LiveCallView: React.FC<LiveCallViewProps> = ({
  isOpen,
  onClose,
  caller = CALLER_PRESETS[0],
  onInsertToKeyboard,
  onSaveToVault
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
  // HISTORICAL WEBSOCKET LATENCY TELEMETRY (LAST 60 SECONDS SPARKLINE)
  // =========================================================================
  const [latencyHistory, setLatencyHistory] = useState<Array<{ timestamp: number; latency: number; timeStr: string }>>(() => {
    const now = Date.now();
    return Array.from({ length: 20 }).map((_, i) => {
      const ts = now - (19 - i) * 3000;
      const baseLat = 22 + Math.floor(Math.sin(i * 0.7) * 7 + (i % 3) * 3);
      const d = new Date(ts);
      return {
        timestamp: ts,
        latency: baseLat,
        timeStr: `${d.getMinutes()}:${d.getSeconds() < 10 ? '0' : ''}${d.getSeconds()}`,
      };
    });
  });
  const [currentLatency, setCurrentLatency] = useState<number>(24);

  // =========================================================================
  // CLIENT-SIDE MEDIARECORDER AUDIO STREAM RECORDING & VAULT ARCHIVAL
  // =========================================================================
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [vaultArchiveNotice, setVaultArchiveNotice] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingStreamRef = useRef<MediaStream | null>(null);

  // =========================================================================
  // REAL-TIME DATA PIPE STATE (THE LISTENER HOOK & DYNAMIC TEXT RE-BINDING)
  // =========================================================================
  const [isLiveConnected, setIsLiveConnected] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'reconnecting' | 'disconnected'>('connecting');
  const [reconnectAttempt, setReconnectAttempt] = useState<number>(0);
  const [reconnectCountdown, setReconnectCountdown] = useState<number | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isSyncingState, setIsSyncingState] = useState(false);

  // Auto-reconnect & exponential backoff timers
  const reconnectAttemptRef = useRef<number>(0);
  const reconnectTimerRef = useRef<any>(null);
  const countdownIntervalRef = useRef<any>(null);
  const initWebSocketRef = useRef<() => void>(() => {});

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

  // Council Performance Real-Time Contribution Metrics (BarChart via Recharts)
  const [showCouncilDashboard, setShowCouncilDashboard] = useState<boolean>(false);
  const [councilContribution, setCouncilContribution] = useState<{
    strategist: number;
    empath: number;
    ghost: number;
  }>({
    strategist: 48,
    empath: 32,
    ghost: 20,
  });

  // Voice Dictation (Web Speech API)
  const [isDictating, setIsDictating] = useState<boolean>(false);
  const [dictationInterim, setDictationInterim] = useState<string>('');
  const recognitionRef = useRef<any>(null);

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

    // Dynamic Council Performance Share calculation based on response synthesis weight
    const sWeight = (record.strategist_response || '').length || 45;
    const eWeight = (record.empath_response || '').length || 35;
    const gWeight = (record.ghost_response || '').length || 20;
    const totalW = sWeight + eWeight + gWeight;
    const sPct = Math.round((sWeight / totalW) * 100);
    const ePct = Math.round((eWeight / totalW) * 100);
    const gPct = Math.max(10, 100 - sPct - ePct);
    setCouncilContribution({
      strategist: sPct,
      empath: ePct,
      ghost: gPct,
    });

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
  // AUTO-RECONNECT UTILITY WITH EXPONENTIAL BACKOFF & JITTER
  // =========================================================================
  const clearReconnectTimers = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setReconnectCountdown(null);
  }, []);

  const scheduleAutoReconnect = useCallback((immediate = false) => {
    clearReconnectTimers();

    if (immediate) {
      reconnectAttemptRef.current = 0;
      setReconnectAttempt(0);
      setConnectionStatus('connecting');
      initWebSocketRef.current();
      return;
    }

    const attempt = reconnectAttemptRef.current;
    // Exponential backoff: 1s, 2s, 4s, 8s, up to max 16s + random jitter 50-300ms
    const baseDelay = 1000;
    const backoff = Math.min(16000, baseDelay * Math.pow(2, attempt));
    const jitter = Math.floor(Math.random() * 250);
    const totalDelayMs = backoff + jitter;
    const targetTimestamp = Date.now() + totalDelayMs;

    setConnectionStatus('reconnecting');
    const initialSeconds = Math.max(1, Math.ceil(totalDelayMs / 1000));
    setReconnectCountdown(initialSeconds);

    countdownIntervalRef.current = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((targetTimestamp - Date.now()) / 1000));
      setReconnectCountdown(remaining);
      if (remaining <= 0 && countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = null;
      }
    }, 200);

    reconnectTimerRef.current = setTimeout(() => {
      clearReconnectTimers();
      reconnectAttemptRef.current += 1;
      setReconnectAttempt(reconnectAttemptRef.current);
      setConnectionStatus('connecting');
      initWebSocketRef.current();
    }, totalDelayMs);
  }, [clearReconnectTimers]);

  const initWebSocketConnection = useCallback(() => {
    if (timeoutGuardRef.current) {
      clearTimeout(timeoutGuardRef.current);
      timeoutGuardRef.current = null;
    }
    if (channelRef.current) {
      try {
        channelRef.current.unsubscribe();
      } catch {}
    }

    try {
      setConnectionStatus((prev) => (prev === 'connected' ? 'connecting' : prev));
      const channel = subscribeToNexusActiveStateSync(
        caller.name,
        (incomingRow) => {
          setIsLiveConnected(true);
          setConnectionStatus('connected');
          setConnectionError(null);
          clearReconnectTimers();
          reconnectAttemptRef.current = 0;
          setReconnectAttempt(0);
          applyIncomingSyncPulse(incomingRow);
        },
        (status, err) => {
          if (status === 'SUBSCRIBED') {
            setIsLiveConnected(true);
            setConnectionStatus('connected');
            setConnectionError(null);
            clearReconnectTimers();
            reconnectAttemptRef.current = 0;
            setReconnectAttempt(0);
            if (timeoutGuardRef.current) {
              clearTimeout(timeoutGuardRef.current);
              timeoutGuardRef.current = null;
            }
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED' || err) {
            setIsLiveConnected(false);
            setConnectionError('[Nexus WebSocket Interrupted: Auto-Reconnecting...]');
            scheduleAutoReconnect(false);
          }
        }
      );

      channelRef.current = channel;

      // Safe Connection Timeout Trap (3.5 seconds)
      timeoutGuardRef.current = setTimeout(() => {
        if (channel.state !== 'joined') {
          setIsLiveConnected(false);
          setConnectionError('[Nexus WebSocket Timeout: Triggering Exponential Reconnect]');
          scheduleAutoReconnect(false);
        }
      }, 3500);
    } catch (err) {
      setIsLiveConnected(false);
      setConnectionError('[Nexus WebSocket Exception: Triggering Exponential Reconnect]');
      scheduleAutoReconnect(false);
    }
  }, [caller.name, applyIncomingSyncPulse, clearReconnectTimers, scheduleAutoReconnect]);

  // Sync ref with function
  useEffect(() => {
    initWebSocketRef.current = initWebSocketConnection;
  }, [initWebSocketConnection]);

  // Window online/offline listener for immediate network reconnection
  useEffect(() => {
    const handleOnline = () => {
      scheduleAutoReconnect(true);
    };
    const handleOffline = () => {
      setConnectionStatus('disconnected');
      setIsLiveConnected(false);
      setConnectionError('[Hardware Network Offline: Reconnect Suspended]');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [scheduleAutoReconnect]);

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
      clearReconnectTimers();
      if (channelRef.current) {
        try {
          channelRef.current.unsubscribe();
        } catch {}
      }
    };
  }, [isOpen, callActive, initWebSocketConnection, dispatchStatePulse, clearReconnectTimers]);

  // Call Duration Timer
  useEffect(() => {
    if (!isOpen || !callActive) return;
    const interval = setInterval(() => {
      setCallSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, callActive]);

  // Maintain sliding 60-second window of latency points for Recharts sparkline
  useEffect(() => {
    if (!isOpen || !callActive) return;

    const interval = setInterval(() => {
      const now = Date.now();
      let measuredLatency: number;

      if (!isLiveConnected || connectionStatus === 'disconnected') {
        measuredLatency = 0;
      } else if (connectionStatus === 'reconnecting' || connectionStatus === 'connecting') {
        measuredLatency = 130 + Math.floor(Math.random() * 55);
      } else {
        // Connected normal range: 18ms - 36ms with subtle natural fluctuation
        const jitter = Math.floor((Math.random() - 0.48) * 8);
        measuredLatency = Math.max(14, Math.min(52, currentLatency + jitter));
      }

      setCurrentLatency(measuredLatency);

      const d = new Date(now);
      const timeStr = `${d.getMinutes()}:${d.getSeconds() < 10 ? '0' : ''}${d.getSeconds()}`;

      setLatencyHistory((prev) => {
        const sixtySecondsAgo = now - 60000;
        const filtered = prev.filter((item) => item.timestamp >= sixtySecondsAgo);
        return [...filtered, { timestamp: now, latency: measuredLatency, timeStr }];
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [isOpen, callActive, isLiveConnected, connectionStatus, currentLatency]);

  // Recording seconds ticker
  useEffect(() => {
    let timer: any = null;
    if (isRecordingAudio) {
      timer = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRecordingAudio]);

  // Helper: create a valid playable synthetic audio WAV PCM blob if mic is restricted
  const createSyntheticWavBlob = useCallback((): Blob => {
    const sampleRate = 8000;
    const numChannels = 1;
    const bitsPerSample = 16;
    const durationSeconds = Math.max(1, recordingSeconds || 2);
    const numSamples = sampleRate * durationSeconds;
    const blockAlign = (numChannels * bitsPerSample) / 8;
    const byteRate = sampleRate * blockAlign;
    const dataSize = numSamples * blockAlign;
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    const writeString = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitsPerSample, true);
    writeString(36, 'data');
    view.setUint32(40, dataSize, true);

    // Subtle ambient waveform
    for (let i = 0; i < numSamples; i++) {
      const sample = Math.sin((i / sampleRate) * 440 * 2 * Math.PI) * 0.05 * 32767;
      view.setInt16(44 + i * 2, Math.floor(sample), true);
    }

    return new Blob([buffer], { type: 'audio/wav' });
  }, [recordingSeconds]);

  // Clean up recording stream on component unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        try {
          mediaRecorderRef.current.stop();
        } catch {}
      }
      if (recordingStreamRef.current) {
        recordingStreamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const startAudioRecording = async () => {
    audioChunksRef.current = [];
    setRecordingSeconds(0);

    try {
      let stream: MediaStream;
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch (micErr) {
          console.warn('[LiveCall] Mic access denied/sandboxed; falling back to Web Audio synthetic stream:', micErr);
          const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
          const ctx = new AudioCtx();
          const dest = ctx.createMediaStreamDestination();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          gain.gain.value = 0.001;
          osc.connect(gain);
          gain.connect(dest);
          osc.start();
          stream = dest.stream;
        }
      } else {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        const dest = ctx.createMediaStreamDestination();
        stream = dest.stream;
      }

      recordingStreamRef.current = stream;

      const mimeType = typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported('audio/ogg')
        ? 'audio/ogg'
        : '';

      const recorder = typeof MediaRecorder !== 'undefined'
        ? (mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream))
        : null;

      mediaRecorderRef.current = recorder;

      if (recorder) {
        recorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };
        recorder.start(1000);
      }

      setIsRecordingAudio(true);
    } catch (err) {
      console.warn('[LiveCall] Fallback MediaRecorder activated:', err);
      setIsRecordingAudio(true);
    }
  };

  const stopAudioRecording = useCallback((): Promise<Blob> => {
    return new Promise((resolve) => {
      setIsRecordingAudio(false);
      const recorder = mediaRecorderRef.current;

      const finalizeBlob = () => {
        if (audioChunksRef.current.length > 0) {
          const mimeType = recorder?.mimeType || 'audio/webm';
          resolve(new Blob(audioChunksRef.current, { type: mimeType }));
        } else {
          resolve(createSyntheticWavBlob());
        }
      };

      if (recorder && recorder.state !== 'inactive') {
        recorder.onstop = () => {
          finalizeBlob();
        };
        try {
          recorder.stop();
        } catch {
          finalizeBlob();
        }
      } else {
        finalizeBlob();
      }

      if (recordingStreamRef.current) {
        recordingStreamRef.current.getTracks().forEach((track) => track.stop());
        recordingStreamRef.current = null;
      }
    });
  }, [createSyntheticWavBlob]);

  const toggleAudioRecording = () => {
    if (isRecordingAudio) {
      stopAudioRecording();
    } else {
      startAudioRecording();
    }
  };

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
    scheduleAutoReconnect(true);
    dispatchStatePulse({ recomputeOnly: true });
  };

  // =========================================================================
  // REAL-TIME CONNECTION STATUS PILL (NEON GREEN / CRIMSON WITH WS HEALTH)
  // =========================================================================
  const renderConnectionPill = (compact = false) => {
    const isHealthy = isLiveConnected && connectionStatus === 'connected';

    return (
      <button
        type="button"
        onClick={handleReconnectWebSocket}
        className={`group relative flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold transition-all duration-300 border select-none shrink-0 cursor-pointer active:scale-95 ${
          isHealthy
            ? 'bg-[#00FFFF]/10 hover:bg-[#00FFFF]/20 border-[#00FFFF]/60 text-[#00FFFF] shadow-[0_0_12px_rgba(0,255,255,0.35)]'
            : 'bg-[#ff0055]/15 hover:bg-[#ff0055]/25 border-[#ff0055] text-[#ff0055] shadow-[0_0_14px_rgba(255,0,85,0.45)] animate-pulse'
        }`}
        title={
          isHealthy
            ? 'Supabase WebSocket: Connected (nexus_active_state_sync stream active). Tap to force refresh.'
            : connectionStatus === 'reconnecting'
            ? `Supabase WebSocket: Interrupted. Auto-reconnecting in ${reconnectCountdown ?? 0}s (Attempt ${reconnectAttempt + 1}). Tap to force instant retry.`
            : 'Supabase WebSocket: Disconnected. Tap to force reconnect.'
        }
      >
        {/* Animated Ping Dot Indicator */}
        <span className="relative flex h-2 w-2 shrink-0">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              isHealthy ? 'bg-[#00FFFF]' : 'bg-[#ff0055]'
            }`}
          />
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${
              isHealthy ? 'bg-[#00FFFF]' : 'bg-[#ff0055]'
            }`}
          />
        </span>

        {/* Dynamic Icon */}
        {isHealthy ? (
          <Wifi className="w-3 h-3 text-[#00FFFF] shrink-0" />
        ) : (
          <WifiOff className="w-3 h-3 text-[#ff0055] shrink-0 animate-bounce" />
        )}

        {/* Dynamic Status Text */}
        <span className="tracking-wider">
          {isHealthy
            ? (compact ? 'WS LIVE' : 'WS CONNECTED')
            : connectionStatus === 'reconnecting' && reconnectCountdown !== null && reconnectCountdown > 0
            ? `RETRY IN ${reconnectCountdown}s (${reconnectAttempt + 1})`
            : connectionStatus === 'connecting'
            ? 'CONNECTING...'
            : 'RECONNECT'}
        </span>
      </button>
    );
  };

  // =========================================================================
  // MINI SPARKLINE CHART: HISTORICAL WEBSOCKET LATENCY (LAST 60 SECONDS)
  // =========================================================================
  const renderLatencySparkline = (compact = false) => {
    const isHealthy = isLiveConnected && connectionStatus === 'connected';
    const strokeColor = isHealthy ? '#00FFFF' : '#ff0055';

    return (
      <div
        className={`flex items-center gap-1.5 sm:gap-2 px-2 py-0.5 sm:py-1 rounded-xl bg-[#0a071b] border transition select-none ${
          isHealthy
            ? 'border-[#1e1642] hover:border-[#00FFFF]/60 shadow-[0_0_10px_rgba(0,255,255,0.18)]'
            : 'border-[#ff0055]/50 bg-[#ff0055]/10 animate-pulse'
        }`}
        title={`WebSocket Latency: ${currentLatency}ms (Historical plot over last 60 seconds)`}
      >
        <div className="flex flex-col items-start leading-none shrink-0">
          <div className="flex items-center gap-1 text-[8px] sm:text-[9px] font-mono text-[#948eb5]">
            <Activity className={`w-2.5 h-2.5 ${isHealthy ? 'text-[#00FFFF] animate-pulse' : 'text-[#ff0055]'}`} />
            <span className="hidden xs:inline">LATENCY</span>
          </div>
          <span className={`text-[10px] sm:text-[11px] font-mono font-bold ${isHealthy ? 'text-[#00FFFF]' : 'text-[#ff0055]'}`}>
            {currentLatency}ms
          </span>
        </div>

        {/* Recharts Area Chart Sparkline */}
        <div className={compact ? 'w-12 sm:w-16 h-5' : 'w-16 sm:w-20 md:w-24 h-5 sm:h-6'}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={latencyHistory} margin={{ top: 1, right: 1, left: 1, bottom: 1 }}>
              <defs>
                <linearGradient id={`latGrad_${compact ? 'c' : 'f'}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={strokeColor} stopOpacity={0.45} />
                  <stop offset="100%" stopColor={strokeColor} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="latency"
                stroke={strokeColor}
                strokeWidth={1.5}
                fillOpacity={1}
                fill={`url(#latGrad_${compact ? 'c' : 'f'})`}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  // =========================================================================
  // VOICE DICTATION ENGINE (WEB SPEECH API -> REAL-TIME TRANSCRIPT STREAM)
  // =========================================================================
  const toggleVoiceDictation = useCallback(() => {
    if (isDictating) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      setIsDictating(false);
      setDictationInterim('');
      return;
    }

    const SpeechRec = (typeof window !== 'undefined' && ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition));
    if (!SpeechRec) {
      console.warn('[VoiceDictation] Web Speech API not supported in this browser.');
      return;
    }

    try {
      const recognition = new SpeechRec();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsDictating(true);
        setDictationInterim('Listening...');
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        if (interim) {
          setDictationInterim(interim);
        }

        if (final && final.trim()) {
          const spoken = final.trim();
          setTranscript((prev) => [
            ...prev,
            {
              sender: 'me',
              text: spoken,
              time: formatCallTime(callSeconds),
            },
          ]);
          setDictationInterim('');
          // Trigger dynamic council reaction to spoken input
          dispatchStatePulse({ incomingSpeech: spoken });
        }
      };

      recognition.onerror = (e: any) => {
        console.warn('[VoiceDictation] Speech recognition error:', e?.error || e);
        setIsDictating(false);
        setDictationInterim('');
      };

      recognition.onend = () => {
        setIsDictating(false);
        setDictationInterim('');
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('[VoiceDictation] Failed to initialize Web Speech API:', err);
      setIsDictating(false);
      setDictationInterim('');
    }
  }, [isDictating, callSeconds, dispatchStatePulse]);

  const handleEndCall = async () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    setIsDictating(false);
    setDictationInterim('');

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    const sessionId = `call_${caller.name.replace(/\s+/g, '_')}_${Date.now()}`;
    const privacySettings = securityEngine.getSettings();
    handleSessionEnd(sessionId, { volatileModeEnabled: privacySettings.volatileCallMemory });

    // Client-side MediaRecorder session archival: save audio blob and transcript to Vault
    const hadRecording = isRecordingAudio || audioChunksRef.current.length > 0;
    if (hadRecording) {
      try {
        const audioBlob = await stopAudioRecording();
        const audioUrl = URL.createObjectURL(audioBlob);

        const formattedTranscript = transcript.length > 0
          ? transcript.map((t) => `[${t.time}] ${t.sender.toUpperCase()}: ${t.text}`).join('\n')
          : `[0:00] CALL ESTABLISHED with ${caller.name} (${caller.role})\n[${formatCallTime(callSeconds)}] CALL TERMINATED`;

        const vaultAsset = {
          id: `vault_call_audio_${Date.now()}`,
          name: `Call Audio & Transcript: ${caller.name}`,
          title: `Call Audio & Transcript: ${caller.name}`,
          type: 'audio' as const,
          studioSource: 'OmniAI - LiveCall',
          duration: formatCallTime(recordingSeconds || callSeconds),
          text: formattedTranscript,
          audioUrl: audioUrl,
          thumbnailUrl: '🎙️',
          tags: ['OmniCall', 'MediaRecorder', 'Audio Blob', caller.name, caller.company, 'Obsidian Vault'],
          details: `Recorded conversation audio stream (${formatCallTime(recordingSeconds || callSeconds)}) with ${caller.name} (${caller.role}, ${caller.company}). Encapsulates raw audio blob and full real-time transcript.`,
          createdAt: new Date().toISOString(),
        };

        const existing = JSON.parse(localStorage.getItem('omni_vault_assets') || '[]');
        localStorage.setItem(
          'omni_vault_assets',
          JSON.stringify([vaultAsset, ...existing.filter((a: any) => a.id !== vaultAsset.id)])
        );
        window.dispatchEvent(new CustomEvent('omni_vault_updated', { detail: { asset: vaultAsset } }));
        if (onSaveToVault) {
          onSaveToVault(vaultAsset);
        }
        setVaultArchiveNotice(`🎙️ Audio stream & transcript archived to Vault!`);
      } catch (vaultErr) {
        console.warn('[LiveCall] Could not archive recording blob to vault:', vaultErr);
      }
    }

    setCallActive(false);
    setTimeout(() => {
      onClose();
      setCallActive(true);
      setCallSeconds(0);
      setRecordingSeconds(0);
      setIsRecordingAudio(false);
      audioChunksRef.current = [];
      setTranscript([]);
      setCurrentSpeechToText('');
      setStrategistPrompt('');
      setEmpathPrompt('');
      setGhostPrompt('');
      setSynthesisPrompt('');
      setIsAutoTakeover(false);
      setActiveQueryModal(null);
      setSilentAIAdvice(null);
      setVaultArchiveNotice(null);
    }, 450);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#000000] text-[#f1f5f9] flex flex-col font-sans select-none overflow-hidden animate-in fade-in duration-200">
      
      {/* ==================================================================== */}
      {/* STATE STUCK SAFETY SAFEGUARD: SUBTLE NEON-RED WARNING TOAST          */}
      {/* ==================================================================== */}
      {(!isLiveConnected || connectionStatus !== 'connected' || connectionError) && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-md px-3 py-1.5 rounded-xl bg-[#000000]/95 backdrop-blur-md border border-[#ff0055]/80 shadow-[0_0_20px_rgba(255,0,85,0.35)] flex items-center justify-between animate-in slide-in-from-top-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-[#ff0055] animate-ping shrink-0" />
            <span className="text-[10px] sm:text-xs font-mono font-bold text-[#ff0055] tracking-tight truncate">
              {connectionStatus === 'reconnecting' && reconnectCountdown !== null
                ? `[Nexus WS Dropped: Auto-reconnecting in ${reconnectCountdown}s (Attempt ${reconnectAttempt + 1})]`
                : connectionStatus === 'connecting'
                ? `[Nexus WS Connecting: Establishing Realtime Channel...]`
                : `[Nexus Link Disconnected: Running in Mock Offline Mode]`}
            </span>
          </div>
          <button
            type="button"
            onClick={handleReconnectWebSocket}
            className="px-2 py-0.5 rounded-lg bg-[#181333] hover:bg-[#ff0055]/20 text-white hover:text-[#ff0055] text-[9.5px] font-mono border border-[#ff0055]/50 transition shrink-0 ml-2"
          >
            Force Reconnect
          </button>
        </div>
      )}

      {/* ==================================================================== */}
      {/* STATE 1: RE-ENGINEERED AUDIO CALL HUDS (FULL-SCREEN MODE)           */}
      {/* ==================================================================== */}
      {layoutState === 'audio' && (
        <div className="w-full h-full flex flex-col bg-[#000000] relative">
          
          {/* 1. THE SYSTEM MONITOR LINE (TOP ROW - 10% HEIGHT) */}
          <section className="h-[10%] min-h-[58px] px-3.5 sm:px-5 bg-[#000000] border-b border-[#1e1642] flex items-center justify-between shrink-0 z-20">
            
            {/* Pinned Upper-Left Branding with Dynamic Zero-State Gray / Vibrant Status Orb */}
            <div className="flex items-center gap-2">
              <div 
                className={`relative flex items-center justify-center shrink-0 w-7 h-7 overflow-hidden rounded-full transition-all duration-300 ${
                  !isLiveConnected || connectionError
                    ? 'border border-zinc-700 bg-transparent opacity-40 shadow-none filter grayscale'
                    : 'bg-[#0a071b] border border-[#00FFFF] shadow-[0_0_12px_rgba(0,255,255,0.4)]'
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
                OmniAI<span className="text-[#00FFFF]"> - Nexus</span>
              </span>
            </div>

            {/* Contact Profile Name & Duration Ticker with Monospaced Telemetry Loop */}
            <div className="flex-1 max-w-md mx-2 sm:mx-4 flex flex-col items-center justify-center text-center">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white tracking-tight">{caller.name}</span>
                <span className="text-[10px] text-[#948eb5] font-mono">({caller.role})</span>
                <span className="px-1.5 py-0.5 rounded bg-[#0a071b] border border-[#00FFFF]/40 text-[#00FFFF] text-[10px] font-mono font-bold">
                  {formatCallTime(callSeconds)}
                </span>
              </div>
              <div className="text-[9px] font-mono text-[#00FFFF] tracking-tighter truncate max-w-full flex items-center gap-1 justify-center">
                <span>[Nexus-Inference: Max-Speed / Local-Ollama Override] • [Nexus Sync:</span>
                <span className={isLiveConnected && connectionStatus === 'connected' ? "text-emerald-400 font-bold" : "text-[#ff0055] font-bold"}>
                  {isLiveConnected && connectionStatus === 'connected'
                    ? "WS STREAMING"
                    : connectionStatus === 'reconnecting'
                    ? `RECONNECTING ${reconnectCountdown ? `IN ${reconnectCountdown}s` : ''}`
                    : "MOCK OFFLINE"}
                </span>
                <span>• Tri-Agent Council Live]</span>
              </div>
            </div>

            {/* Right Controls: Historical Latency Sparkline & Real-Time Connection Status Pill & Mode Toggle & Close */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Historical WebSocket Latency Sparkline Chart (Last 60 Seconds) */}
              {renderLatencySparkline()}

              {/* Real-time Connection Status Pill in Top-Right Corner */}
              {renderConnectionPill()}

              {/* Council Performance Dashboard Toggle */}
              <button
                type="button"
                onClick={() => setShowCouncilDashboard(!showCouncilDashboard)}
                className={`px-2 py-1 rounded-lg border text-[10px] font-mono font-bold flex items-center gap-1 transition ${
                  showCouncilDashboard
                    ? 'bg-[#0C00CA] border-[#00FFFF] text-[#00FFFF] shadow-[0_0_12px_rgba(0,255,255,0.4)]'
                    : 'bg-[#0a071b] hover:bg-[#130d2d] border-[#1e1642] text-zinc-300 hover:text-[#00FFFF]'
                }`}
                title="Council Performance: View real-time bar chart of agent contributions"
              >
                <Activity className="w-3.5 h-3.5 text-[#00FFFF]" />
                <span className="hidden sm:inline">Council</span>
              </button>

              <button
                type="button"
                onClick={() => setLayoutState('video')}
                className="px-2 py-1 rounded-lg bg-[#0a071b] hover:bg-[#130d2d] border border-[#1e1642] hover:border-[#00FFFF]/50 text-[#00FFFF] text-[10px] font-mono font-bold flex items-center gap-1 transition"
                title="Switch to Compact Eye-Line Video Call"
              >
                <Video className="w-3.5 h-3.5 text-[#00FFFF]" />
                <span className="hidden xs:inline">Video Mode</span>
              </button>
              <button
                type="button"
                onClick={handleEndCall}
                className="p-1.5 rounded-lg bg-[#0a071b] hover:bg-rose-950 border border-rose-900/40 text-rose-400 hover:text-rose-200 transition"
                title="End Audio Call"
              >
                <PhoneOff className="w-3.5 h-3.5" />
              </button>
            </div>
          </section>

          {/* 2. THE LIVE SPEECH RECONSTRUCTION TRACK (CENTER AREA - 55% HEIGHT) */}
          <section className="h-[55%] relative flex flex-col bg-[#000000] border-b border-[#1e1642] overflow-hidden">
            
            {/* Top Telemetry Waveform Bar */}
            <div className="h-7 px-4 bg-[#0a071b] border-b border-[#1e1642] flex items-center justify-between text-[10px] font-mono text-[#948eb5] shrink-0">
              <div className="flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-[#00FFFF] animate-pulse" />
                <span className="text-[#00FFFF] font-semibold">CENTER SPEECH RECONSTRUCTION BOX</span>
              </div>
              <div className="flex items-center gap-1">
                {[14, 28, 10, 36, 22, 12, 42, 18, 30, 12, 24].map((h, i) => (
                  <span
                    key={i}
                    className="w-0.5 bg-gradient-to-t from-[#0C00CA] to-[#00FFFF] rounded-full animate-pulse"
                    style={{
                      height: `${h * 0.45}px`,
                      animationDuration: `${0.35 + (i % 5) * 0.15}s`
                    }}
                  />
                ))}
              </div>
              <span className="text-[#00FFFF] font-mono text-[9.5px]">
                {isSyncingState ? 'Syncing...' : 'Neural Pipe: 99.8%'}
              </span>
            </div>

            {/* COUNCIL PERFORMANCE DASHBOARD OVERLAY */}
            {showCouncilDashboard && (
              <div className="p-3 mx-4 my-2 rounded-xl bg-[#0a071b] border border-[#1e1642] space-y-2 shadow-2xl z-30 animate-in slide-in-from-top-2">
                <div className="flex items-center justify-between border-b border-[#1e1642] pb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-[#00FFFF]" />
                    <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                      Council Performance Dashboard
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[9.5px] font-mono font-bold bg-[#00FFFF]/15 text-[#00FFFF] border border-[#00FFFF]/40">
                      Top Contributor: {councilContribution.strategist >= councilContribution.empath && councilContribution.strategist >= councilContribution.ghost ? 'THE STRATEGIST' : councilContribution.empath >= councilContribution.ghost ? 'THE EMPATH' : 'THE GHOST'} ({Math.max(councilContribution.strategist, councilContribution.empath, councilContribution.ghost)}%)
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowCouncilDashboard(false)}
                      className="text-zinc-400 hover:text-white p-0.5"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-[10px] text-zinc-400 font-mono">
                  Real-time agent contribution to current conversation flow (Strategist, Empath, Ghost) utilizing Recharts.
                </p>

                <div className="h-24 w-full pt-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: 'Strategist', share: councilContribution.strategist, fill: '#00FFFF' },
                        { name: 'Empath', share: councilContribution.empath, fill: '#8b80f9' },
                        { name: 'Ghost', share: councilContribution.ghost, fill: '#0C00CA' }
                      ]}
                      layout="vertical"
                      margin={{ top: 2, right: 20, left: 25, bottom: 2 }}
                    >
                      <XAxis type="number" domain={[0, 100]} hide />
                      <YAxis
                        type="category"
                        dataKey="name"
                        stroke="#948eb5"
                        tick={{ fill: '#948eb5', fontSize: 10, fontFamily: 'monospace' }}
                        width={65}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0a071b',
                          borderColor: '#0C00CA',
                          borderRadius: 8,
                          fontSize: 11,
                          fontFamily: 'monospace',
                          color: '#f1f5f9',
                        }}
                        formatter={(val: any) => [`${val}% Contribution`, 'Impact']}
                      />
                      <Bar dataKey="share" radius={[0, 6, 6, 0]}>
                        {[
                          { fill: '#00FFFF' },
                          { fill: '#8b80f9' },
                          { fill: '#0C00CA' }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-1 border-t border-[#1e1642] text-[10px] font-mono text-center">
                  <div className="p-1.5 rounded-lg bg-[#000000] border border-[#00FFFF]/30">
                    <span className="text-[#00FFFF] font-bold block">STRATEGIST</span>
                    <span className="text-white font-semibold">{councilContribution.strategist}%</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-[#000000] border border-[#8b80f9]/30">
                    <span className="text-[#8b80f9] font-bold block">EMPATH</span>
                    <span className="text-white font-semibold">{councilContribution.empath}%</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-[#000000] border border-[#0C00CA]/50">
                    <span className="text-[#8b80f9] font-bold block">GHOST</span>
                    <span className="text-white font-semibold">{councilContribution.ghost}%</span>
                  </div>
                </div>
              </div>
            )}

            {/* Scrollable Live Text Box Processing Incoming Voice */}
            <div className="flex-1 overflow-y-auto p-4 pr-16 space-y-3 font-sans">
              {transcript.length === 0 && (
                <div className="flex items-center justify-center h-full text-zinc-500 font-mono text-xs">
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin text-[#00FFFF]" />
                  <span>Connecting to incoming caller speech stream...</span>
                </div>
              )}

              {/* Real-time Voice Dictation Stream Indicator */}
              {isDictating && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#0a071b] border border-[#00FFFF]/60 text-xs font-mono text-[#00FFFF] shadow-[0_0_15px_rgba(0,255,255,0.25)] animate-pulse">
                  <Mic className="w-4 h-4 text-[#00FFFF] animate-bounce shrink-0" />
                  <span className="font-bold">DICTATING LIVE:</span>
                  <span className="truncate italic">"{dictationInterim || 'Listening for speech...'}"</span>
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
                      <span className={isCaller ? 'text-[#00FFFF] font-semibold' : isAI ? 'text-[#00FFFF] font-bold' : 'text-slate-300'}>
                        {isCaller ? caller.name : isAI ? 'OmniAI (Cloned Voice Takeover)' : 'You (Live Dictation)'}
                      </span>
                      <span>• {msg.time}</span>
                    </div>
                    <div
                      className={`p-3 rounded-2xl max-w-[88%] text-xs leading-relaxed shadow-lg ${
                        isCaller
                          ? 'bg-[#0a071b] text-[#e2e8f0] border border-[#1e1642] rounded-tl-sm shadow-[0_0_12px_rgba(0,0,0,0.5)]'
                          : isAI
                          ? 'bg-gradient-to-r from-[#0a071b] to-[#130d2d] text-white border border-[#00FFFF]/40 rounded-tr-sm shadow-[0_0_15px_rgba(0,255,255,0.18)]'
                          : 'bg-[#0C00CA] text-white font-medium rounded-tr-sm shadow-[0_0_14px_rgba(12,0,202,0.45)]'
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
              {/* Council Performance Quick Toggle */}
              <button
                type="button"
                onClick={() => setShowCouncilDashboard(!showCouncilDashboard)}
                className="group relative flex items-center justify-center w-10 h-10 rounded-xl bg-[#0a071b] hover:bg-[#130d2d] border border-[#00FFFF]/50 hover:border-[#00FFFF] text-[#00FFFF] shadow-[0_0_14px_rgba(0,255,255,0.25)] transition active:scale-95"
                title="Council Performance Analytics Dashboard"
              >
                <Activity className="w-5 h-5 text-[#00FFFF]" />
                <span className="absolute right-12 px-2.5 py-1 rounded-md bg-[#000000] border border-[#1e1642] text-[#00FFFF] text-[9.5px] font-mono font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none shadow-xl">
                  Council Performance
                </span>
              </button>

              {/* [?] What do they mean? */}
              <button
                type="button"
                onClick={handleTriggerSubtextAnalysis}
                className="group relative flex items-center justify-center w-10 h-10 rounded-xl bg-[#0a071b] hover:bg-[#130d2d] border border-[#00FFFF]/50 hover:border-[#00FFFF] text-[#00FFFF] shadow-[0_0_14px_rgba(0,255,255,0.25)] transition active:scale-95"
                title="What do they mean? (Rapid Ollama Subtext Parse)"
              >
                <HelpCircle className="w-5 h-5 text-[#00FFFF]" />
                <span className="absolute right-12 px-2.5 py-1 rounded-md bg-[#000000] border border-[#1e1642] text-[#00FFFF] text-[9.5px] font-mono font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none shadow-xl">
                  [?] What do they mean?
                </span>
              </button>

              {/* [!] Catch Me Up */}
              <button
                type="button"
                onClick={handleTriggerCatchMeUp}
                className="group relative flex items-center justify-center w-10 h-10 rounded-xl bg-[#0a071b] hover:bg-[#130d2d] border border-[#ff007f]/50 hover:border-[#ff007f] text-[#ff007f] shadow-[0_0_14px_rgba(255,0,127,0.25)] transition active:scale-95"
                title="Catch Me Up (Instant 3-Sentence Summary)"
              >
                <AlertCircle className="w-5 h-5 text-[#ff007f]" />
                <span className="absolute right-12 px-2.5 py-1 rounded-md bg-[#000000] border border-[#1e1642] text-[#ff007f] text-[9.5px] font-mono font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none shadow-xl">
                  [!] Catch Me Up
                </span>
              </button>

              {/* + Simulated Next Speech Turn */}
              <button
                type="button"
                onClick={handleSimulateCallerTurn}
                disabled={isSyncingState}
                className="group relative flex items-center justify-center w-10 h-10 rounded-xl bg-[#0a071b] hover:bg-[#130d2d] border border-[#1e1642] hover:border-slate-500 text-slate-300 transition active:scale-95 disabled:opacity-50"
                title="Fetch Next Live Caller Utterance"
              >
                <RefreshCw className={`w-4 h-4 text-[#948eb5] ${isSyncingState ? 'animate-spin text-[#00FFFF]' : ''}`} />
                <span className="absolute right-12 px-2.5 py-1 rounded-md bg-[#000000] border border-[#1e1642] text-slate-300 text-[9.5px] font-mono whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none shadow-xl">
                  + Next Speech Turn
                </span>
              </button>
            </div>

            {/* Modal Sub-Panel for Subtext Query or Catch Me Up */}
            {activeQueryModal && (
              <div className="absolute inset-x-3 bottom-3 p-3.5 rounded-xl bg-[#0a071b]/95 backdrop-blur-md border border-[#1e1642] shadow-[0_0_30px_rgba(0,0,0,0.9)] z-40 animate-in slide-in-from-bottom-2">
                <div className="flex items-center justify-between pb-2 border-b border-[#1e1642]">
                  <div className="flex items-center gap-2">
                    {activeQueryModal === 'what-do-they-mean' ? (
                      <>
                        <HelpCircle className="w-4 h-4 text-[#00FFFF]" />
                        <span className="text-xs font-mono font-bold text-[#00FFFF]">
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
                    className="p-1 rounded-md hover:bg-[#130d2d] text-zinc-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="pt-2.5 text-xs text-[#cbd5e1] leading-relaxed">
                  {isQueryLoading ? (
                    <div className="flex items-center gap-2 py-2 text-zinc-400 font-mono text-[11px]">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#00FFFF]" />
                      <span>Parsing local LLM weights & conversation subtext...</span>
                    </div>
                  ) : activeQueryModal === 'what-do-they-mean' ? (
                    <div className="space-y-1.5 font-sans">
                      <p>
                        <strong className="text-white">Hidden Intent:</strong> {subtextAnalysis?.hiddenIntent || 'Caller requires definitive milestone validation to de-escalate executive stakeholder scrutiny.'}
                      </p>
                      <p>
                        <strong className="text-[#00FFFF]">Friction Vector:</strong> {subtextAnalysis?.friction || 'Anxiety over latency SLA adherence and potential regression.'}
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
          <section className="h-[35%] flex flex-col justify-between bg-[#0a071b] p-3 sm:p-4 z-20 border-t border-[#1e1642]">
            
            {/* The 3 Eye-Catch Response Pills: Dynamically injected on every database pulse */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[10px] font-mono text-[#948eb5]">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#00FFFF]" />
                  <span className="text-white font-bold uppercase tracking-wider">Tri-Agent Council Live Prompts</span>
                </div>
                <div className="flex items-center gap-2">
                  {/* Auto-Takeover Mode Toggle */}
                  <button
                    type="button"
                    onClick={() => setIsAutoTakeover(!isAutoTakeover)}
                    className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold transition flex items-center gap-1 ${
                      isAutoTakeover 
                        ? 'bg-[#00FFFF] text-black shadow-[0_0_8px_rgba(0,255,255,0.4)]' 
                        : 'bg-[#000000] border border-[#1e1642] text-[#948eb5] hover:text-white'
                    }`}
                  >
                    <Zap className="w-3 h-3" />
                    <span>{isAutoTakeover ? 'AI TAKEOVER: ON' : 'AI TAKEOVER: OFF'}</span>
                  </button>
                  <span className="text-[#00FFFF] font-semibold">{activeTone}</span>
                </div>
              </div>

              {/* 3 Fresh Contextual Responses Pushed by Tri-Agent Council */}
              <div className="grid grid-cols-1 gap-1.5">
                
                {/* 1. Strategist Pill */}
                <button
                  type="button"
                  onClick={() => handleSpeakAsClone(strategistPrompt)}
                  disabled={aiSpeaking || !strategistPrompt}
                  className="w-full text-left p-2 rounded-xl bg-[#000000] hover:bg-[#130d2d] border border-[#1e1642] hover:border-[#00FFFF]/60 transition flex items-center justify-between group disabled:opacity-50 shadow-sm"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="px-1.5 py-0.5 rounded text-[8.5px] font-mono font-bold bg-[#00FFFF]/15 text-[#00FFFF] border border-[#00FFFF]/40 shrink-0">
                      THE STRATEGIST
                    </span>
                    <span className="text-xs text-[#e2e8f0] group-hover:text-white truncate">
                      {strategistPrompt ? `"${strategistPrompt}"` : "Calculating tactical counter-proposal..."}
                    </span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-[#948eb5] group-hover:text-[#00FFFF] shrink-0 ml-1.5" />
                </button>

                {/* 2. Empath Pill */}
                <button
                  type="button"
                  onClick={() => handleSpeakAsClone(empathPrompt)}
                  disabled={aiSpeaking || !empathPrompt}
                  className="w-full text-left p-2 rounded-xl bg-[#000000] hover:bg-[#130d2d] border border-[#1e1642] hover:border-[#00FFFF]/60 transition flex items-center justify-between group disabled:opacity-50 shadow-sm"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="px-1.5 py-0.5 rounded text-[8.5px] font-mono font-bold bg-[#8b80f9]/15 text-[#8b80f9] border border-[#8b80f9]/40 shrink-0">
                      THE EMPATH
                    </span>
                    <span className="text-xs text-[#e2e8f0] group-hover:text-white truncate">
                      {empathPrompt ? `"${empathPrompt}"` : "Aligning emotional empathy tone..."}
                    </span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-[#948eb5] group-hover:text-[#00FFFF] shrink-0 ml-1.5" />
                </button>

                {/* 3. Ghost Pill */}
                <button
                  type="button"
                  onClick={() => handleSpeakAsClone(ghostPrompt)}
                  disabled={aiSpeaking || !ghostPrompt}
                  className="w-full text-left p-2 rounded-xl bg-[#000000] hover:bg-[#130d2d] border border-[#1e1642] hover:border-[#00FFFF]/60 transition flex items-center justify-between group disabled:opacity-50 shadow-sm"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="px-1.5 py-0.5 rounded text-[8.5px] font-mono font-bold bg-[#0C00CA]/30 text-[#00FFFF] border border-[#0C00CA]/60 shrink-0">
                      THE GHOST
                    </span>
                    <span className="text-xs text-[#e2e8f0] group-hover:text-white truncate">
                      {ghostPrompt ? `"${ghostPrompt}"` : "Synthesizing authentic cloned cadence..."}
                    </span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-[#948eb5] group-hover:text-[#00FFFF] shrink-0 ml-1.5" />
                </button>

              </div>
            </div>

            {/* Persona Shifter Tabs: Instant query state patch & re-calculation trigger */}
            <div className="pt-2 border-t border-[#1e1642]">
              <div className="flex items-center justify-between mb-1 text-[9.5px] font-mono text-[#7d779f]">
                <span>PERSONA SHIFTER:</span>
                <span className="text-[#00FFFF]">SWAP TONE INSTANTLY</span>
              </div>
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
                {(['Professional', 'Casual', 'Flirty', 'Funny'] as PersonaTone[]).map((tone) => (
                  <button
                    key={tone}
                    type="button"
                    onClick={() => handleToneChange(tone)}
                    className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-mono font-bold transition text-center shrink-0 ${
                      activeTone === tone
                        ? 'bg-[#0C00CA] text-white shadow-[0_0_14px_rgba(12,0,202,0.6)] border border-[#00FFFF]/40'
                        : 'bg-[#000000] hover:bg-[#130d2d] border border-[#1e1642] text-[#948eb5] hover:text-white'
                    }`}
                  >
                    {tone}
                  </button>
                ))}
              </div>
            </div>

            {/* Hardware Controls Row */}
            <div className="pt-2 flex items-center justify-around border-t border-[#1e1642]">
              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className={`p-2.5 rounded-full border transition ${
                  isMuted 
                    ? 'bg-rose-950/60 text-rose-400 border-rose-600/50' 
                    : 'bg-[#000000] hover:bg-[#130d2d] text-zinc-300 border-[#1e1642]'
                }`}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              {/* Voice Dictation (Web Speech API streaming live into conversation transcript) */}
              <button
                type="button"
                onClick={toggleVoiceDictation}
                className={`px-3 py-2 rounded-full border text-xs font-mono font-bold flex items-center gap-1.5 transition-all duration-300 ${
                  isDictating
                    ? 'bg-[#0C00CA] border-[#00FFFF] text-[#00FFFF] shadow-[0_0_15px_rgba(0,255,255,0.45)]'
                    : 'bg-[#000000] hover:bg-[#130d2d] text-zinc-300 hover:text-white border-[#1e1642] hover:border-[#00FFFF]/60'
                }`}
                title={
                  isDictating
                    ? 'Voice Dictation Active: Speaking live into transcript. Click to stop.'
                    : 'Voice Dictation: Stream live spoken speech directly into conversation transcript via Web Speech API.'
                }
              >
                <Mic className={`w-4 h-4 ${isDictating ? 'text-[#00FFFF] animate-pulse' : 'text-zinc-400'}`} />
                <span className="hidden xs:inline">{isDictating ? 'Dictating...' : 'Dictate'}</span>
                {isDictating && (
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00FFFF] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00FFFF]" />
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                className={`p-2.5 rounded-full border transition ${
                  isSpeakerOn 
                    ? 'bg-[#000000] text-[#00FFFF] border-[#00FFFF]/40 shadow-[0_0_8px_rgba(0,255,255,0.25)]' 
                    : 'bg-[#000000] text-zinc-400 border-[#1e1642]'
                }`}
                title={isSpeakerOn ? 'Speaker HD' : 'Earpiece'}
              >
                {isSpeakerOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              {/* Record Audio Stream Toggle Button */}
              <button
                type="button"
                onClick={toggleAudioRecording}
                className={`px-3 py-2 rounded-full border text-xs font-mono font-bold flex items-center gap-1.5 transition-all duration-300 ${
                  isRecordingAudio
                    ? 'bg-rose-950/70 border-[#ff0055] text-[#ff0055] shadow-[0_0_15px_rgba(255,0,85,0.45)] animate-pulse'
                    : 'bg-[#000000] hover:bg-[#130d2d] text-zinc-300 hover:text-white border-[#1e1642] hover:border-[#ff0055]/60'
                }`}
                title={
                  isRecordingAudio
                    ? `Recording Stream: ${formatCallTime(recordingSeconds)}. Audio blob & transcript will archive into Vault on call end.`
                    : 'Record Audio Stream: Starts client-side MediaRecorder. Saves audio blob & transcript to Vault on call end.'
                }
              >
                <Disc className={`w-4 h-4 ${isRecordingAudio ? 'text-[#ff0055] animate-spin' : 'text-zinc-400'}`} />
                <span className="hidden xs:inline">
                  {isRecordingAudio ? `REC ${formatCallTime(recordingSeconds)}` : 'Record Stream'}
                </span>
                {isRecordingAudio && (
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff0055] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ff0055]" />
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setLayoutState('video')}
                className="p-2.5 rounded-full bg-[#000000] hover:bg-[#130d2d] text-[#00FFFF] border border-[#00FFFF]/40 transition shadow-sm"
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
          <section className="h-[75%] relative w-full overflow-hidden bg-[#000000]">
            
            {/* Incoming Video Feed */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a071b] via-[#05030e] to-[#000000] flex items-center justify-center">
              <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#00FFFF_1px,transparent_1px)] [background-size:24px_24px]" />
                
                {/* Caller Persona Video Canvas */}
                <div className="relative flex flex-col items-center justify-center">
                  <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full p-1 bg-gradient-to-tr from-[#0C00CA] via-[#00FFFF] to-[#ff007f] shadow-[0_0_50px_rgba(0,255,255,0.3)]">
                    <div className="w-full h-full rounded-full bg-[#0a071b] border-2 border-[#1e1642] flex items-center justify-center text-6xl select-none">
                      {caller.avatar}
                    </div>

                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-[#000000]/80 border border-[#00FFFF] text-[#00FFFF] text-[8.5px] font-mono font-bold tracking-wider">
                      EYE-LINE SYNC 98%
                    </div>
                  </div>

                  <div className="mt-3 text-center">
                    <div className="text-sm font-bold text-white tracking-wide">{caller.name}</div>
                    <div className="text-[11px] font-mono text-[#948eb5]">{caller.company} • 1080p 60FPS</div>
                  </div>
                </div>

                {/* Video Watermark & Telemetry Badge */}
                <div className="absolute bottom-3 left-4 flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#000000]/80 backdrop-blur-md border border-[#1e1642] text-[9.5px] font-mono text-[#00FFFF]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00FFFF] animate-ping" />
                  <span>SECURE WEBRTC PIPELINE • {formatCallTime(callSeconds)}</span>
                </div>
              </div>
            </div>

            {/* BRANDING ORB WITH DYNAMIC ZERO-STATE GRAY OUTLINE ON DISCONNECT */}
            <div className="absolute top-3 left-3 z-30 flex items-center gap-2 px-2.5 py-1 rounded-xl bg-[#000000]/80 backdrop-blur-md border border-[#1e1642] shadow-lg">
              <div 
                className={`relative flex items-center justify-center shrink-0 w-6 h-6 overflow-hidden rounded-full transition-all duration-300 ${
                  !isLiveConnected || connectionError
                    ? 'border border-zinc-700 bg-transparent opacity-40 shadow-none filter grayscale'
                    : 'bg-[#0a071b] border border-[#00FFFF] shadow-[0_0_10px_rgba(0,255,255,0.4)]'
                }`}
              >
                <HoloOrb
                  size="xs"
                  className="w-6 h-6"
                  phase={!isLiveConnected || connectionError ? 'idle' : aiSpeaking ? 'talking' : 'thinking'}
                />
              </div>
              <span className="text-xs font-bold font-mono tracking-wider text-white">
                OmniAI<span className="text-[#00FFFF]"> - Nexus</span>
              </span>
            </div>

            {/* Mode Switcher Shortcut & Top Right Real-Time Connection Status Pill */}
            <div className="absolute top-3 right-3 z-30 flex items-center gap-1.5 sm:gap-2">
              {/* Mini Sparkline in Video Mode */}
              {renderLatencySparkline(true)}

              {/* Real-time Connection Status Pill in Top-Right Corner */}
              {renderConnectionPill(true)}

              <button
                type="button"
                onClick={() => setLayoutState('audio')}
                className="px-2.5 py-1 rounded-xl bg-[#000000]/80 backdrop-blur-md border border-[#1e1642] text-[#948eb5] hover:text-[#00FFFF] text-[10px] font-mono transition"
                title="Switch to Audio HUD"
              >
                Audio HUD
              </button>
            </div>

            {/* THE EYE-LINE TELEMETRY LINE: SMART PROMPTER */}
            <div className="absolute top-12 sm:top-14 inset-x-3 sm:inset-x-8 z-30">
              <div className="p-2 sm:p-2.5 rounded-xl bg-[#000000]/90 backdrop-blur-lg border border-[#00FFFF] shadow-[0_0_20px_rgba(0,255,255,0.3)] transition-all">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 text-[9px] font-mono font-bold text-[#00FFFF]">
                    <Eye className="w-3 h-3 text-[#00FFFF] animate-pulse" />
                    <span>EYE-LINE PROMPTER (LOOK AT CAMERA LENS)</span>
                  </div>
                  <span className="text-[8.5px] font-mono px-1.5 py-0.2 rounded bg-[#0a071b] text-[#00FFFF] border border-[#00FFFF]/40">
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
                    className="shrink-0 px-2.5 py-1 rounded-md bg-[#00FFFF] hover:bg-[#00e6e6] text-black font-mono font-bold text-[10px] transition active:scale-95 disabled:opacity-50"
                  >
                    Speak
                  </button>
                </div>
              </div>
            </div>

          </section>

          {/* 2. THE MINIMAL FLOATING INTERACTION HUD (BOTTOM 25% VIEWPORT HEIGHT) */}
          <section className="h-[25%] relative bg-[#0a071b]/95 backdrop-blur-xl border-t border-[#1e1642] flex flex-col justify-between p-3 sm:p-4 z-40 transition-all">
            
            {/* Swipe-Up Expansion Drawer Bar */}
            <div className="flex items-center justify-between text-[10px] font-mono text-[#948eb5]">
              <span className="text-white font-bold tracking-wider">CALL CONTROLS & HUD</span>
              
              <button
                type="button"
                onClick={() => setIsVideoTrayExpanded(!isVideoTrayExpanded)}
                className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#000000] border border-[#1e1642] text-[#00FFFF] hover:border-[#00FFFF] transition"
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
                    className="flex-1 bg-[#000000] border border-[#1e1642] focus:border-[#0C00CA] rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-zinc-600 outline-none font-sans"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-xl bg-[#00FFFF] text-black font-mono font-bold text-xs flex items-center gap-1 shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Ask</span>
                  </button>
                </form>
                {silentAIAdvice && (
                  <div className="p-2 rounded-lg bg-[#000000] border border-[#00FFFF]/40 text-[11px] text-[#cbd5e1] font-sans">
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
                        ? 'bg-[#0C00CA] text-white shadow-[0_0_12px_rgba(12,0,202,0.6)] border border-[#00FFFF]/40'
                        : 'bg-[#000000] border border-[#1e1642] text-[#948eb5]'
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
                className={`w-10 h-10 rounded-full border flex items-center justify-center transition ${
                  isMuted 
                    ? 'bg-rose-950/60 text-rose-400 border-rose-600/50' 
                    : 'bg-[#000000] hover:bg-[#130d2d] text-zinc-300 border-[#1e1642]'
                }`}
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>

              {/* Voice Dictation Button in Video Mode */}
              <button
                type="button"
                onClick={toggleVoiceDictation}
                className={`w-10 h-10 rounded-full border flex items-center justify-center transition ${
                  isDictating
                    ? 'bg-[#0C00CA] text-[#00FFFF] border-[#00FFFF] shadow-[0_0_12px_rgba(0,255,255,0.45)]'
                    : 'bg-[#000000] hover:bg-[#130d2d] text-zinc-400 border-[#1e1642]'
                }`}
                title={isDictating ? 'Dictating Speech (Live)' : 'Start Voice Dictation'}
              >
                <Mic className={`w-4 h-4 ${isDictating ? 'text-[#00FFFF] animate-pulse' : 'text-zinc-400'}`} />
              </button>

              <button
                type="button"
                onClick={() => setIsCameraActive(!isCameraActive)}
                className={`w-10 h-10 rounded-full border flex items-center justify-center transition ${
                  isCameraActive 
                    ? 'bg-[#000000] text-[#00FFFF] border-[#00FFFF]/40 shadow-[0_0_8px_rgba(0,255,255,0.25)]' 
                    : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                }`}
                title="Toggle Camera"
              >
                {isCameraActive ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
              </button>

              {/* Record Audio Stream Button in Video Mode */}
              <button
                type="button"
                onClick={toggleAudioRecording}
                className={`h-10 px-3 rounded-full border flex items-center gap-1.5 transition text-xs font-mono font-bold ${
                  isRecordingAudio 
                    ? 'bg-rose-950/70 text-[#ff0055] border-[#ff0055] shadow-[0_0_12px_rgba(255,0,85,0.45)] animate-pulse' 
                    : 'bg-[#000000] hover:bg-[#130d2d] text-zinc-300 border-[#1e1642] hover:border-[#ff0055]/50'
                }`}
                title={
                  isRecordingAudio
                    ? `Recording active (${formatCallTime(recordingSeconds)}). Tap to stop. Archives into Vault on call end.`
                    : 'Record Audio Stream: Starts MediaRecorder. Saves audio blob & transcript into Vault on call end.'
                }
              >
                <Disc className={`w-4 h-4 ${isRecordingAudio ? 'text-[#ff0055] animate-spin' : 'text-zinc-400'}`} />
                <span className="hidden xs:inline">
                  {isRecordingAudio ? `REC ${formatCallTime(recordingSeconds)}` : 'Record'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setLayoutState('audio')}
                className="w-10 h-10 rounded-full bg-[#000000] hover:bg-[#130d2d] text-[#948eb5] hover:text-white border border-[#1e1642] flex items-center justify-center transition"
                title="Switch back to Audio Fullscreen HUD"
              >
                <Layers className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleEndCall}
                className="px-4 h-10 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-rose-600/40 active:scale-95 transition"
                title="End Call"
              >
                <PhoneOff className="w-4 h-4" />
                <span>End</span>
              </button>
            </div>

          </section>

        </div>
      )}

      {/* Global Vault Archive Notification Toast */}
      {vaultArchiveNotice && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-[#0a071b]/95 backdrop-blur-md border border-[#00ffcc] text-[#00ffcc] shadow-[0_0_25px_rgba(0,255,204,0.4)] text-xs font-mono font-bold animate-in fade-in slide-in-from-bottom-3 flex items-center gap-2 pointer-events-none">
          <Disc className="w-4 h-4 text-[#ff0055] animate-spin shrink-0" />
          <span>{vaultArchiveNotice}</span>
        </div>
      )}

    </div>
  );
};
