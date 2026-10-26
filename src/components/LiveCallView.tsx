import React, { useState, useEffect, useRef } from 'react';
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
  ArrowRight
} from 'lucide-react';
import { HoloOrb } from './HoloOrb';
import { omniVoice } from '../lib/omniVoice';
import { handleSessionEnd, securityEngine } from '../lib/securityEngine';

export interface LiveCallCaller {
  name: string;
  role: string;
  avatar: string;
  company: string;
  badge?: string;
  initialDialogue: string[];
}

export const CALLER_PRESETS: LiveCallCaller[] = [
  {
    name: 'Alex Rivera',
    role: 'VP Engineering',
    company: 'Nexus Core Systems',
    avatar: '👨‍💼',
    badge: 'CRITICAL ESCALATION',
    initialDialogue: [
      "Hey, I need an unvarnished status on the staging deployment.",
      "The client CEO is breathing down my neck about the auth latency.",
      "Can we ship the patch before noon without breaking backward compatibility?"
    ]
  },
  {
    name: 'Sarah Jenkins',
    role: 'CFO',
    company: 'Apex Corporation',
    avatar: '📊',
    badge: 'BILLING DISPUTE',
    initialDialogue: [
      "Hello, I'm calling regarding invoice #8819 on our corporate account.",
      "There's an unverified fee line of $240 before we approve the monthly release.",
      "Can your team verify this credit by end of business today?"
    ]
  },
  {
    name: 'Maya Lin',
    role: 'Product Lead',
    company: 'Starlight Studio',
    avatar: '✨',
    badge: 'DESIGN REVIEW',
    initialDialogue: [
      "Hey! Just looking at the 3D volumetric keyboard mockup right now.",
      "The nocturnal neon glow looks incredible, but is the haptic response snappy on Android?",
      "Let's finalize the demo script for the investor showcase."
    ]
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

  // Transcript Feed
  const [transcript, setTranscript] = useState<Array<{ sender: 'caller' | 'me' | 'ai-cloned'; text: string; time: string }>>([]);
  const [dialogueIndex, setDialogueIndex] = useState(0);

  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Dynamic Tri-Agent Council Response Matrix mapped by Tone
  const councilMatrix: Record<PersonaTone, { strategist: string; empath: string; ghost: string }> = {
    Professional: {
      strategist: "Let's lock down the scope bounds and deploy staging immediately to safeguard SLA metrics.",
      empath: "I understand the priority on this rollout; our engineering leads are handling the fix right now.",
      ghost: "Acknowledged. Staging push is queued. We will provide verified telemetry logs upon completion."
    },
    Casual: {
      strategist: "All good, spinning up the staging build right now. We'll have this wrapped up in ten.",
      empath: "Totally get the crunch, man. Relax, we're on top of it and pinging you shortly.",
      ghost: "Gotcha. Handled and green. Don't sweat it."
    },
    Flirty: {
      strategist: "You know I always deliver before deadlines—especially when you're the one asking for it.",
      empath: "Don't stress your pretty mind over the staging bugs, I've got your back completely on this.",
      ghost: "Wouldn't leave you hanging on a critical push. Watch how fast I make this green."
    },
    Funny: {
      strategist: "If this staging push fails, I'll personally apologize in interpretive dance. Deploying now!",
      empath: "Take a deep breath and grab coffee—no servers were harmed in the making of this hotfix.",
      ghost: "Houston, we had a problem, but I already kicked it out the airlock. Staging is safe."
    }
  };

  // Best Recommended Response for Eye-Line prompter
  const eyeLinePrompterText = councilMatrix[activeTone].strategist;

  // Call Duration Timer
  useEffect(() => {
    if (!isOpen || !callActive) return;
    const interval = setInterval(() => {
      setCallSeconds((s) => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, callActive]);

  // Initial greeting from caller
  useEffect(() => {
    if (isOpen && callActive && transcript.length === 0) {
      const timer = setTimeout(() => {
        setTranscript([
          {
            sender: 'caller',
            text: caller.initialDialogue[0] || "Hey, I need an unvarnished status on the staging deployment.",
            time: '0:01'
          }
        ]);
        setDialogueIndex(1);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [isOpen, callActive, caller, transcript.length]);

  // Auto scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcript]);

  // Auto-Pilot voice takeover execution
  useEffect(() => {
    if (isAutoTakeover && callActive && transcript.length > 0) {
      const last = transcript[transcript.length - 1];
      if (last.sender === 'caller') {
        const replyText = councilMatrix[activeTone].strategist;
        const timer = setTimeout(() => {
          handleSpeakAsClone(replyText);
        }, 1300);
        return () => clearTimeout(timer);
      }
    }
  }, [isAutoTakeover, transcript, callActive, activeTone]);

  const formatCallTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  // Speak using Web Speech Synthesis configured to user's cloned voice parameters
  const handleSpeakAsClone = (text: string) => {
    setAiSpeaking(true);
    setTranscript((prev) => [
      ...prev,
      {
        sender: isAutoTakeover ? 'ai-cloned' : 'me',
        text,
        time: formatCallTime(callSeconds)
      }
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
        // Advance caller response after 2.5s
        if (dialogueIndex < caller.initialDialogue.length) {
          setTimeout(() => {
            setTranscript((prev) => [
              ...prev,
              {
                sender: 'caller',
                text: caller.initialDialogue[dialogueIndex],
                time: formatCallTime(callSeconds + 2)
              }
            ]);
            setDialogueIndex((i) => i + 1);
          }, 2400);
        }
      };

      utterance.onerror = () => setAiSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setAiSpeaking(false), 1800);
    }
  };

  const handleSimulateCallerTurn = () => {
    if (dialogueIndex < caller.initialDialogue.length) {
      setTranscript((prev) => [
        ...prev,
        {
          sender: 'caller',
          text: caller.initialDialogue[dialogueIndex],
          time: formatCallTime(callSeconds)
        }
      ]);
      setDialogueIndex((i) => i + 1);
    } else {
      const followUps = [
        "What's the exact ETA on the PR merge?",
        "Have we accounted for the load spike during US market open?",
        "Understood. Ping me on the private channel once telemetry clears."
      ];
      const randomText = followUps[Math.floor(Math.random() * followUps.length)];
      setTranscript((prev) => [
        ...prev,
        {
          sender: 'caller',
          text: randomText,
          time: formatCallTime(callSeconds)
        }
      ]);
    }
  };

  // Micro-action: [?] "What do they mean?"
  const handleTriggerSubtextAnalysis = () => {
    setIsQueryLoading(true);
    setActiveQueryModal('what-do-they-mean');
    setTimeout(() => {
      setIsQueryLoading(false);
    }, 450);
  };

  // Micro-action: [!] "Catch Me Up"
  const handleTriggerCatchMeUp = () => {
    setIsQueryLoading(true);
    setActiveQueryModal('catch-me-up');
    setTimeout(() => {
      setIsQueryLoading(false);
    }, 450);
  };

  const handleSilentPromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!silentAIPrompt.trim()) return;
    setSilentAIAdvice(`Council Analysis for "${silentAIPrompt}": Anchor your reply with verified telemetry metrics, de-escalate emotional friction, and propose an interim staging checkpoint.`);
    setSilentAIPrompt('');
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
      setDialogueIndex(0);
      setIsAutoTakeover(false);
      setActiveQueryModal(null);
      setSilentAIAdvice(null);
    }, 400);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#000000] text-[#f1f5f9] flex flex-col font-sans select-none overflow-hidden animate-in fade-in duration-200">
      
      {/* ==================================================================== */}
      {/* STATE 1: RE-ENGINEERED AUDIO CALL HUDS (FULL-SCREEN MODE)           */}
      {/* ==================================================================== */}
      {layoutState === 'audio' && (
        <div className="w-full h-full flex flex-col bg-[#000000] relative">
          
          {/* 1. THE SYSTEM MONITOR LINE (TOP ROW - 10% HEIGHT) */}
          <section className="h-[10%] min-h-[58px] px-3.5 sm:px-5 bg-[#000000] border-b border-[#2a2254] flex items-center justify-between shrink-0 z-20">
            {/* Pinned Upper-Left Branding */}
            <div className="flex items-center gap-2">
              <div className="relative flex items-center justify-center shrink-0 w-7 h-7 overflow-hidden rounded-full bg-[#100d23] border border-[#2a2254]">
                <HoloOrb
                  size="xs"
                  className="w-7 h-7"
                  phase={aiSpeaking ? 'talking' : 'thinking'}
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
              <div className="text-[9px] font-mono text-[#00ffcc] tracking-tighter truncate max-w-full">
                [OmniCore Telemetry: Active Real-Time Script Monitoring Loop]
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
                <span className="text-[#00ffcc] font-semibold">LIVE TRANSCRIPTION STREAM</span>
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
              <span className="text-emerald-400 font-mono text-[9.5px]">Neural Clarity: 99.4%</span>
            </div>

            {/* Scrollable Live Text Box Processing Incoming Voice */}
            <div className="flex-1 overflow-y-auto p-4 pr-16 space-y-3 font-sans">
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
                          ? 'bg-[#100d23] text-[#e2e8f0] border border-[#2a2254] rounded-tl-sm'
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

              {/* + Simulated Caller Utterance */}
              <button
                type="button"
                onClick={handleSimulateCallerTurn}
                className="group relative flex items-center justify-center w-10 h-10 rounded-xl bg-[#100d23] hover:bg-[#181333] border border-[#2a2254] hover:border-slate-500 text-slate-300 transition active:scale-95"
                title="Simulate Next Caller Utterance"
              >
                <RefreshCw className="w-4 h-4 text-[#948eb5]" />
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
                          Ollama Subtext Analysis (Last 3 Utterances)
                        </span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-[#ff007f]" />
                        <span className="text-xs font-mono font-bold text-[#ff007f]">
                          Catch Me Up: Executive 3-Sentence Summary
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
                      <p><strong className="text-white">Hidden Intent:</strong> The caller is under acute executive pressure regarding latency SLA compliance, not just general curiosity.</p>
                      <p><strong className="text-[#00ffcc]">Friction Vector:</strong> Fear of reputational damage with client stakeholders if noon deployment slips.</p>
                      <p><strong className="text-emerald-300">Optimal Leverage:</strong> Offer clear validation metrics and a firm staging checkpoint rather than defensive explanations.</p>
                    </div>
                  ) : (
                    <ul className="space-y-1.5 list-disc list-inside font-sans">
                      <li><strong className="text-white">1. Core Issue:</strong> Staging deployment status requested to resolve auth latency escalation.</li>
                      <li><strong className="text-[#ff007f]">2. Key Constraint:</strong> Patch must deploy prior to noon without breaking backwards compatibility.</li>
                      <li><strong className="text-emerald-300">3. Current Status:</strong> Staging regressions verified green; awaiting user confirmation to ship.</li>
                    </ul>
                  )}
                </div>
              </div>
            )}
          </section>

          {/* 3. THE FLUID INTERACTION INTERCONNECT DECK (BOTTOM ROW - 35% HEIGHT) */}
          <section className="h-[35%] flex flex-col justify-between bg-[#100d23] p-3 sm:p-4 z-20">
            {/* The Eye-Catch Response Pills: Matrix block displaying 3 real-time contextual response prompts */}
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

              {/* 3 Real-Time Response Options */}
              <div className="grid grid-cols-1 gap-1.5">
                {/* 1. Strategist Track */}
                <button
                  type="button"
                  onClick={() => handleSpeakAsClone(councilMatrix[activeTone].strategist)}
                  disabled={aiSpeaking}
                  className="w-full text-left p-2 rounded-xl bg-[#15122c] hover:bg-[#1c183b] border border-[#2a2254] hover:border-[#00ffcc]/60 transition flex items-center justify-between group disabled:opacity-50 shadow-sm"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="px-1.5 py-0.5 rounded text-[8.5px] font-mono font-bold bg-[#60a5fa]/20 text-[#60a5fa] border border-[#60a5fa]/40 shrink-0">
                      STRATEGIST
                    </span>
                    <span className="text-xs text-[#e2e8f0] group-hover:text-white truncate">
                      "{councilMatrix[activeTone].strategist}"
                    </span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-[#948eb5] group-hover:text-[#00ffcc] shrink-0 ml-1.5" />
                </button>

                {/* 2. Empath Track */}
                <button
                  type="button"
                  onClick={() => handleSpeakAsClone(councilMatrix[activeTone].empath)}
                  disabled={aiSpeaking}
                  className="w-full text-left p-2 rounded-xl bg-[#15122c] hover:bg-[#1c183b] border border-[#2a2254] hover:border-[#f472b6]/60 transition flex items-center justify-between group disabled:opacity-50 shadow-sm"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="px-1.5 py-0.5 rounded text-[8.5px] font-mono font-bold bg-[#f472b6]/20 text-[#f472b6] border border-[#f472b6]/40 shrink-0">
                      EMPATH
                    </span>
                    <span className="text-xs text-[#e2e8f0] group-hover:text-white truncate">
                      "{councilMatrix[activeTone].empath}"
                    </span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-[#948eb5] group-hover:text-[#f472b6] shrink-0 ml-1.5" />
                </button>

                {/* 3. Ghost Track */}
                <button
                  type="button"
                  onClick={() => handleSpeakAsClone(councilMatrix[activeTone].ghost)}
                  disabled={aiSpeaking}
                  className="w-full text-left p-2 rounded-xl bg-[#15122c] hover:bg-[#1c183b] border border-[#2a2254] hover:border-[#34d399]/60 transition flex items-center justify-between group disabled:opacity-50 shadow-sm"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="px-1.5 py-0.5 rounded text-[8.5px] font-mono font-bold bg-[#34d399]/20 text-[#34d399] border border-[#34d399]/40 shrink-0">
                      GHOST
                    </span>
                    <span className="text-xs text-[#e2e8f0] group-hover:text-white truncate">
                      "{councilMatrix[activeTone].ghost}"
                    </span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-[#948eb5] group-hover:text-[#34d399] shrink-0 ml-1.5" />
                </button>
              </div>
            </div>

            {/* Persona Shifter Tabs: Horizontal swipe tray directly beneath the response pills */}
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
                    onClick={() => setActiveTone(tone)}
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
            
            {/* Incoming Video Feed: Renders full-bleed edge-to-edge inside this section */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#100d23] via-[#090716] to-[#000000] flex items-center justify-center">
              {/* Simulated High-Res Video Feed Simulation */}
              <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                {/* Background Ambient Grid & Scanning Horizon */}
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#00ffcc_1px,transparent_1px)] [background-size:24px_24px]" />
                
                {/* Simulated Caller Persona Video Canvas */}
                <div className="relative flex flex-col items-center justify-center">
                  <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full p-1 bg-gradient-to-tr from-[#6c63ff] via-[#00ffcc] to-[#ff007f] shadow-[0_0_50px_rgba(0,255,204,0.3)]">
                    <div className="w-full h-full rounded-full bg-[#100d23] border-2 border-[#2a2254] flex items-center justify-center text-6xl select-none">
                      {caller.avatar}
                    </div>

                    {/* Facial recognition neural nodes simulation overlay */}
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

            {/* BRANDING ORB & PINNED UPPER-LEFT BRANDING */}
            <div className="absolute top-3 left-3 z-30 flex items-center gap-2 px-2.5 py-1 rounded-xl bg-[#000000]/80 backdrop-blur-md border border-[#2a2254] shadow-lg">
              <div className="relative flex items-center justify-center shrink-0 w-6 h-6 overflow-hidden rounded-full bg-[#100d23] border border-[#2a2254]">
                <HoloOrb
                  size="xs"
                  className="w-6 h-6"
                  phase={aiSpeaking ? 'talking' : 'thinking'}
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

            {/* THE EYE-LINE TELEMETRY LINE (TOP 15% VIEWPORT HEIGHT) */}
            {/* Acts as a smart prompter displaying the single "Best Recommended Response" from Tri-Agent Council */}
            {/* Placing it at the top forces the user's eyes up toward the physical lens */}
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
                  <span className="text-[#f1f5f9]">"{eyeLinePrompterText}"</span>
                  <button
                    type="button"
                    onClick={() => handleSpeakAsClone(eyeLinePrompterText)}
                    disabled={aiSpeaking}
                    className="shrink-0 px-2 py-1 rounded-md bg-[#00ffcc] hover:bg-[#00e6b8] text-black font-mono font-bold text-[10px] transition active:scale-95 disabled:opacity-50"
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
                    onClick={() => setActiveTone(tone)}
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
              {/* Mute Mic */}
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

              {/* Camera Toggle */}
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

              {/* Mode switch */}
              <button
                type="button"
                onClick={() => setLayoutState('audio')}
                className="w-11 h-11 rounded-full bg-[#181333] hover:bg-[#201a44] text-[#948eb5] hover:text-white border border-[#2a2254] flex items-center justify-center transition"
                title="Switch back to Audio Fullscreen HUD"
              >
                <Layers className="w-4 h-4" />
              </button>

              {/* End Call (Red) */}
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
