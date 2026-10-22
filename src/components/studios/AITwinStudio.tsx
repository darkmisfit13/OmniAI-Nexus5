import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  PhoneCall, 
  MessageSquare, 
  Mic, 
  MicOff, 
  Square, 
  Play, 
  Pause, 
  SkipForward, 
  ChevronRight, 
  ChevronLeft, 
  Sparkles, 
  Sliders, 
  Terminal, 
  ShieldCheck, 
  FolderLock, 
  Check, 
  Activity, 
  Send,
  Zap
} from 'lucide-react';
import { HoloOrb, OrbPhase } from '../HoloOrb';

interface AITwinStudioProps {
  onBack?: () => void;
  onSaveToVault?: (asset: any) => void;
}

// 25 Calibration Prompts
const TWIN_SCRIPT_PROMPTS: string[] = [
  "Hey, I'm heading over to the studio now. The 1st demo is ready to review.",
  "I cannot take your call right now because I'm in a high-stakes engineering review.",
  "Let's push the staging release by 15 minutes, but only if all tests pass.",
  "I don't think that's the best approach, although I understand your reasoning.",
  "The invoice comes out to exactly $250 with a 15% discount applied.",
  "Sounds great! Send over the link and I'll jump on the call right away.",
  "Are you free tomorrow around 3:30 PM to discuss the product roadmap?",
  "I'm confident we will close this sprint ahead of the 1st of next month.",
  "Honestly, I'd rather keep it minimal and ship faster instead of adding fluff.",
  "Can you verify the server credentials? We need them before 5 o'clock.",
  "Thanks for checking in! Everything is under control and moving smoothly.",
  "Let's circle back in 20 minutes... I need to verify this database query.",
  "I agree 100%. We should prioritize security and user privacy first.",
  "Please do not deploy without notifying the rest of the team in the channel.",
  "That makes sense to me, but let's confirm with the client before signing off.",
  "Got it. I'll make sure the team reviews the PR by 10 AM tomorrow.",
  "I'm on my way. Traffic is heavy on the highway, so give me 10 minutes.",
  "Could you summarize the main blockers from today's sprint retrospective?",
  "We tested the new neural speech pipeline, and latency dropped to 6 milliseconds.",
  "No worries at all! We will catch up first thing on Monday morning.",
  "I've updated the shared document with the revised quarterly projections.",
  "It's not a major bug, but we shouldn't let it slip into production.",
  "Look at that waveform! The acoustic resonance matches my real cadence.",
  "Let's wrap up this meeting so everyone can focus on execution.",
  "System calibration complete. My shadow voice clone is ready for active calls."
];

// Interview questions
const INTERVIEW_QUESTIONS = [
  "How do you usually say goodbye to close friends over text?",
  "When someone asks 'How are you?', what is your default candid response?",
  "How do you handle someone showing up 20 minutes late to a scheduled meeting?",
  "What is your go-to phrase when you need to politely decline an invitation?",
  "When you receive great unexpected news, how do you express your excitement?",
  "How do you deliver constructive criticism without sounding harsh or corporate?",
  "What's your typical greeting when messaging a colleague you work with daily?",
  "When someone sends a massive paragraph, do you respond with bullets or a few words?"
];

type RelationshipFilter = 'Casual Friends' | 'Professional/Work' | 'Family Default';

export const AITwinStudio: React.FC<AITwinStudioProps> = ({ onBack, onSaveToVault }) => {
  // ZONE 1: Cellular Swap & Telephony Gateway
  const [autoInterceptCalls, setAutoInterceptCalls] = useState<boolean>(true);
  const [autoReplyTexts, setAutoReplyTexts] = useState<boolean>(true);
  const [responseLatencyPad, setResponseLatencyPad] = useState<number>(180); // 100ms - 500ms

  // ZONE 2A: Voice Cloning Core
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState<number>(11); // 12th phrase
  const [recordedPhrasesCount, setRecordedPhrasesCount] = useState<number>(12);
  const [isRecordingMic, setIsRecordingMic] = useState<boolean>(false);
  const [micDuration, setMicDuration] = useState<number>(0);
  const [waveformBars, setWaveformBars] = useState<number[]>([25, 45, 70, 85, 60, 40, 65, 90, 75, 50, 80, 45]);

  // ZONE 2B: Personality Gym & Text Lexicon Matrix
  const [selectedFilter, setSelectedFilter] = useState<RelationshipFilter>('Casual Friends');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string }>>([
    {
      sender: 'ai',
      text: "Omni Interviewer: When a friend texts 'Hey are you free tonight?', how do you reply when you need to stay in and code?"
    },
    {
      sender: 'user',
      text: "Usually: 'Can't tonight man, heads down shipping this build. Rain check for Friday?'"
    },
    {
      sender: 'ai',
      text: "Captured style weights: Direct, warm, slang-light, maintains forward commitment. Next question: How do you sign off on high-priority client messages?"
    }
  ]);
  const [userInputText, setUserInputText] = useState<string>('');

  // ZONE 3: Operational Telemetry Log
  const [telemetryLogs, setTelemetryLogs] = useState<string[]>([
    "🟢 Neural Voice Matrix: Connected & Optimized",
    "🟢 Text Persona Lexicon: 3,400 Style Weights Trained",
    "🔒 Telephony Bridge Status: Live Carrier Intercept Listening...",
    "⚡ NPU Fast Agent Loop: 180ms Response Latency Bound",
    "🚨 INTERCEPT READY: AI Clone authorized to simulate identity on phone calls."
  ]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const logTerminalRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    if (logTerminalRef.current) {
      logTerminalRef.current.scrollTop = logTerminalRef.current.scrollHeight;
    }
  }, [telemetryLogs]);

  // Animate mic waveform when recording
  useEffect(() => {
    let interval: any;
    if (isRecordingMic) {
      interval = setInterval(() => {
        setWaveformBars(prev => prev.map(() => Math.floor(Math.random() * 80) + 15));
        setMicDuration(d => d + 0.1);
      }, 100);
    } else {
      setMicDuration(0);
    }
    return () => clearInterval(interval);
  }, [isRecordingMic]);

  // Handle Cellular Switch Toggles with Telemetry Flag
  const handleToggleCalls = () => {
    const nextState = !autoInterceptCalls;
    setAutoInterceptCalls(nextState);
    const timestamp = new Date().toLocaleTimeString();
    if (nextState) {
      setTelemetryLogs(prev => [
        ...prev,
        `[${timestamp}] 🚨 INTERCEPT READY: AI Clone authorized to simulate identity on phone calls.`
      ]);
      setToastMessage('Auto-Intercept Enabled: AI Clone authorized for cellular calls');
    } else {
      setTelemetryLogs(prev => [
        ...prev,
        `[${timestamp}] ⚪ Carrier Intercept Suspended: Manual call routing restored.`
      ]);
      setToastMessage('Auto-Intercept Paused: Calls will ring directly to device');
    }
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggleTexts = () => {
    const nextState = !autoReplyTexts;
    setAutoReplyTexts(nextState);
    const timestamp = new Date().toLocaleTimeString();
    if (nextState) {
      setTelemetryLogs(prev => [
        ...prev,
        `[${timestamp}] 🟢 SMS Auto-Reply Daemon Armed: Running ${selectedFilter} filter profile.`
      ]);
      setToastMessage('Auto-Reply SMS Armed');
    } else {
      setTelemetryLogs(prev => [
        ...prev,
        `[${timestamp}] ⚪ SMS Daemon Paused.`
      ]);
      setToastMessage('Auto-Reply SMS Paused');
    }
    setTimeout(() => setToastMessage(null), 2500);
  };

  const handleSendMessage = () => {
    if (!userInputText.trim()) return;
    const userText = userInputText.trim();
    setUserInputText('');

    setChatMessages(prev => [...prev, { sender: 'user', text: userText }]);

    // Simulated AI response
    setTimeout(() => {
      const nextQ = INTERVIEW_QUESTIONS[Math.floor(Math.random() * INTERVIEW_QUESTIONS.length)];
      setChatMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: `Style weights calibrated for [${selectedFilter}]. Next interview prompt: ${nextQ}`
        }
      ]);

      setTelemetryLogs(prev => [
        ...prev,
        `🟢 Persona Matrix Updated: +12 Style Weights trained for [${selectedFilter}].`
      ]);
    }, 600);
  };

  // Voice Health score calculation (0 - 100)
  const voiceHealthScore = Math.min(100, Math.round((recordedPhrasesCount / 25) * 100));
  const voiceHealthLabel = 
    voiceHealthScore < 30 ? 'Mechanical Tone' :
    voiceHealthScore < 70 ? 'Natural Cadence' : 
    'Flawless Human Inflection';

  return (
    <div 
      className="w-full max-w-[400px] h-[850px] mx-auto overflow-hidden bg-black text-white relative flex flex-col justify-between font-sans select-none"
      style={{ boxSizing: 'border-box' }}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 z-50 px-3 py-1.5 rounded-full bg-[#131024]/95 border border-[#00ffcc]/60 text-[#00ffcc] text-[10px] font-mono shadow-2xl backdrop-blur-md animate-in fade-in flex items-center gap-1.5 max-w-[92%] truncate">
          <Sparkles className="w-3 h-3 text-[#00ffcc] shrink-0" />
          <span className="truncate">{toastMessage}</span>
        </div>
      )}

      {/* HEADER */}
      <div className="h-12 px-4 bg-[#131024] border-b border-zinc-900 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          {onBack && (
            <button 
              onClick={onBack}
              className="p-1 -ml-1 text-zinc-400 hover:text-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          <Bot className="w-4 h-4 text-[#00ffcc]" />
          <h1 className="font-bold text-xs tracking-wider uppercase text-white font-mono">
            AITwin Studio
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#00ffcc]/10 border border-[#00ffcc]/30 text-[#00ffcc]">
            Neural Active
          </span>
          <button
            onClick={() => {
              onSaveToVault?.({
                type: 'ai_twin',
                title: 'AITwin Studio Profile - Complete Persona Configuration',
                thumbnail: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&q=80',
                tags: ['AITwin Studio', 'Voice Clone', 'Telephony Intercept', selectedFilter],
                details: `Voice Health: ${voiceHealthScore}% (${voiceHealthLabel}) | Latency: ${responseLatencyPad}ms`
              });
              setToastMessage('AI Twin Profile saved to Omni Vault!');
              setTimeout(() => setToastMessage(null), 2500);
            }}
            className="px-2 py-0.5 rounded-md bg-[#00ffcc] text-slate-950 font-bold text-[9.5px] font-mono flex items-center gap-1 active:scale-95 transition"
            title="Save AI Twin to Vault"
          >
            <FolderLock className="w-2.5 h-2.5" />
            <span>Vault</span>
          </button>
        </div>
      </div>

      {/* ENHANCED ZONE 1: CELLULAR SWAP & TELEPHONY GATEWAY (Top 25% Height) */}
      <div className="h-[25%] min-h-[175px] bg-[#131024] p-3 rounded-xl border border-zinc-800 mx-3 mt-2 flex flex-col justify-between shrink-0">
        
        {/* Gateway Title */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
          <div className="flex items-center gap-1.5 text-zinc-300 font-mono text-[10px] font-bold">
            <PhoneCall className="w-3.5 h-3.5 text-[#00ffcc]" />
            <span>CELLULAR SWAP & TELEPHONY GATEWAY</span>
          </div>
          <span className="text-[8.5px] font-mono text-[#00ffcc] animate-pulse">
            VoLTE Linked
          </span>
        </div>

        {/* Master Toggles Row */}
        <div className="grid grid-cols-2 gap-2 my-1">
          {/* Toggle 1: Auto-Intercept Phone Calls */}
          <button
            type="button"
            onClick={handleToggleCalls}
            className={`p-2 rounded-xl border flex flex-col justify-between text-left transition active:scale-95 ${
              autoInterceptCalls 
                ? 'bg-[#00ffcc]/15 border-[#00ffcc] shadow-[0_0_10px_rgba(0,255,204,0.2)]' 
                : 'bg-black/60 border-zinc-800 text-zinc-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <PhoneCall className={`w-3.5 h-3.5 ${autoInterceptCalls ? 'text-[#00ffcc]' : 'text-zinc-500'}`} />
              <span className={`text-[8px] font-mono font-bold px-1 rounded ${
                autoInterceptCalls ? 'bg-[#00ffcc] text-slate-950' : 'bg-zinc-800 text-zinc-400'
              }`}>
                {autoInterceptCalls ? 'ON' : 'OFF'}
              </span>
            </div>
            <div className="mt-1">
              <span className="text-[9.5px] font-bold text-white block leading-tight">Auto-Intercept</span>
              <span className="text-[7.5px] text-zinc-400 font-mono">Cellular Voice Calls</span>
            </div>
          </button>

          {/* Toggle 2: Auto-Reply Text System */}
          <button
            type="button"
            onClick={handleToggleTexts}
            className={`p-2 rounded-xl border flex flex-col justify-between text-left transition active:scale-95 ${
              autoReplyTexts 
                ? 'bg-[#00ffcc]/15 border-[#00ffcc] shadow-[0_0_10px_rgba(0,255,204,0.2)]' 
                : 'bg-black/60 border-zinc-800 text-zinc-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <MessageSquare className={`w-3.5 h-3.5 ${autoReplyTexts ? 'text-[#00ffcc]' : 'text-zinc-500'}`} />
              <span className={`text-[8px] font-mono font-bold px-1 rounded ${
                autoReplyTexts ? 'bg-[#00ffcc] text-slate-950' : 'bg-zinc-800 text-zinc-400'
              }`}>
                {autoReplyTexts ? 'ON' : 'OFF'}
              </span>
            </div>
            <div className="mt-1">
              <span className="text-[9.5px] font-bold text-white block leading-tight">Auto-Reply SMS</span>
              <span className="text-[7.5px] text-zinc-400 font-mono">Background Text Engine</span>
            </div>
          </button>
        </div>

        {/* Response Latency Pad Slider */}
        <div className="space-y-1 pt-1 border-t border-zinc-800/80 font-mono">
          <div className="flex items-center justify-between text-[9px]">
            <span className="text-zinc-300 flex items-center gap-1">
              <Zap className="w-3 h-3 text-[#00ffcc]" />
              Response Latency Pad:
            </span>
            <span className="text-[#00ffcc] font-bold">{responseLatencyPad}ms</span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="range"
              min="100"
              max="500"
              step="10"
              value={responseLatencyPad}
              onChange={(e) => setResponseLatencyPad(Number(e.target.value))}
              className="flex-1 h-1 bg-black rounded-lg appearance-none cursor-pointer accent-[#00ffcc]"
            />
            {responseLatencyPad < 300 && (
              <span className="px-1.5 py-0.2 rounded bg-[#00ffcc]/20 border border-[#00ffcc]/40 text-[#00ffcc] text-[7.5px] font-bold shrink-0">
                Fast Agent Mode Enabled (&lt;300ms)
              </span>
            )}
          </div>
        </div>

      </div>

      {/* ENHANCED ZONE 2: DUAL TRAINING MATRICES & PERSONALITY GYM (Middle 50% Height) */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-3 scrollbar-hide">
        
        {/* MODULE A: [Voice Cloning Core] */}
        <div className="p-3 rounded-xl bg-[#131024] border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-zinc-200 uppercase flex items-center gap-1.5">
              <Mic className="w-3.5 h-3.5 text-[#00ffcc]" />
              MODULE A: VOICE CLONING CORE
            </span>
            <span className="text-[9px] font-mono text-[#00ffcc] font-bold">
              Phrase {currentPhraseIndex + 1} / 25
            </span>
          </div>

          {/* Voice Health Check Meter Indicator */}
          <div className="p-2 rounded-lg bg-black/60 border border-zinc-800 font-mono space-y-1">
            <div className="flex items-center justify-between text-[8.5px]">
              <span className="text-zinc-400">VOICE HEALTH CHECK:</span>
              <span className="text-[#00ffcc] font-bold">{voiceHealthLabel} ({voiceHealthScore}%)</span>
            </div>
            
            {/* Color shifting progress bar toward neon green */}
            <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
              <div 
                className="h-full transition-all duration-300"
                style={{ 
                  width: `${voiceHealthScore}%`,
                  background: voiceHealthScore < 35 
                    ? 'linear-gradient(to right, #ef4444, #f59e0b)' 
                    : voiceHealthScore < 70 
                    ? 'linear-gradient(to right, #f59e0b, #00d2c4)' 
                    : 'linear-gradient(to right, #00d2c4, #00ffcc)'
                }}
              />
            </div>
            <div className="flex justify-between text-[7px] text-zinc-500">
              <span>Mechanical Tone</span>
              <span>Natural Cadence</span>
              <span>Flawless Inflection</span>
            </div>
          </div>

          {/* 25-Phrase Script Reader Card */}
          <div className="p-2.5 rounded-lg bg-[#0b0816] border border-zinc-800 space-y-2">
            <p className="text-[11px] text-white italic leading-relaxed">
              "{TWIN_SCRIPT_PROMPTS[currentPhraseIndex]}"
            </p>

            {/* Mic recording controls */}
            <div className="flex items-center justify-between pt-1 border-t border-zinc-800/80">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    if (isRecordingMic) {
                      setIsRecordingMic(false);
                      setRecordedPhrasesCount(c => Math.min(25, c + 1));
                      setToastMessage(`Phrase #${currentPhraseIndex + 1} Calibrated!`);
                      setTimeout(() => setToastMessage(null), 2000);
                    } else {
                      setIsRecordingMic(true);
                    }
                  }}
                  className={`px-3 py-1 rounded-full text-[9.5px] font-mono font-bold flex items-center gap-1.5 transition active:scale-95 ${
                    isRecordingMic 
                      ? 'bg-red-500 text-white animate-pulse' 
                      : 'bg-[#00ffcc] text-slate-950 shadow-md shadow-[#00ffcc]/20'
                  }`}
                >
                  {isRecordingMic ? <Square className="w-3 h-3 fill-current" /> : <Mic className="w-3 h-3" />}
                  <span>{isRecordingMic ? `Stop (${micDuration.toFixed(1)}s)` : 'Record Phrase'}</span>
                </button>

                {/* Waveform bars */}
                {isRecordingMic && (
                  <div className="flex items-end gap-0.5 h-4 px-2">
                    {waveformBars.slice(0, 8).map((bar, i) => (
                      <div 
                        key={i} 
                        className="w-1 bg-[#00ffcc] rounded-full transition-all duration-100" 
                        style={{ height: `${bar}%` }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Next/Prev Phrase Navigation */}
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPhraseIndex(i => Math.max(0, i - 1))}
                  className="p-1 rounded bg-zinc-800 text-zinc-300 hover:text-white"
                  title="Previous Phrase"
                >
                  <ChevronLeft className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setCurrentPhraseIndex(i => Math.min(TWIN_SCRIPT_PROMPTS.length - 1, i + 1))}
                  className="p-1 rounded bg-zinc-800 text-zinc-300 hover:text-white"
                  title="Next Phrase"
                >
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* MODULE B: [Personality Gym & Text Lexicon Matrix] */}
        <div className="p-3 rounded-xl bg-[#131024] border border-zinc-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-zinc-200 uppercase flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-[#00ffcc]" />
              MODULE B: PERSONALITY GYM &amp; LEXICON
            </span>
            <span className="text-[8.5px] font-mono text-cyan-300">
              Filter: {selectedFilter}
            </span>
          </div>

          {/* Interactive Chat Prompt Window */}
          <div className="h-32 bg-black/70 rounded-xl border border-zinc-800 p-2 overflow-y-auto space-y-2 font-mono text-[9.5px]">
            {chatMessages.map((msg, idx) => (
              <div 
                key={idx} 
                className={`p-1.5 rounded-lg max-w-[90%] leading-relaxed ${
                  msg.sender === 'ai' 
                    ? 'bg-zinc-900 border border-zinc-800 text-zinc-300' 
                    : 'bg-[#181432] border border-[#00ffcc]/40 text-[#00ffcc] ml-auto'
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>

          {/* Input Box to respond to interviewer */}
          <div className="flex items-center gap-1.5 bg-[#0b0816] rounded-xl px-2 py-1 border border-zinc-800 focus-within:border-[#00ffcc]">
            <input
              type="text"
              value={userInputText}
              onChange={(e) => setUserInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Answer interview prompt in your natural style..."
              className="w-full bg-transparent text-xs text-white outline-none font-sans"
            />
            <button
              onClick={handleSendMessage}
              className="p-1.5 rounded-lg bg-[#00ffcc] text-slate-950 font-bold active:scale-95 transition"
            >
              <Send className="w-3 h-3" />
            </button>
          </div>

          {/* NEW UPGRADE: Horizontal Chip-Selector tracking Relationship-Specific Filters */}
          <div className="pt-1 space-y-1">
            <span className="text-[8.5px] font-mono text-zinc-400 block uppercase">
              Relationship-Specific Filters:
            </span>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar">
              {(['Casual Friends', 'Professional/Work', 'Family Default'] as RelationshipFilter[]).map((filter) => {
                const isSelected = selectedFilter === filter;
                return (
                  <button
                    key={filter}
                    onClick={() => {
                      setSelectedFilter(filter);
                      setToastMessage(`Switched Lexicon Training to [${filter}]`);
                      setTimeout(() => setToastMessage(null), 1500);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[9px] font-mono font-bold whitespace-nowrap transition active:scale-95 border ${
                      isSelected 
                        ? 'bg-[#00ffcc] text-slate-950 border-[#00ffcc] shadow-[0_0_8px_rgba(0,255,204,0.3)]' 
                        : 'bg-black/60 text-zinc-300 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    {filter}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

      </div>

      {/* ENHANCED ZONE 3: OPERATIONAL TELEMETRY LOG (Bottom 25% Height) */}
      <div 
        ref={logTerminalRef}
        className="w-full bg-zinc-950 p-3 border-t border-zinc-900 h-[140px] overflow-y-auto text-[10px] font-mono text-zinc-400 shrink-0 select-text leading-relaxed"
      >
        <div className="flex items-center justify-between pb-1 mb-1 border-b border-zinc-900 text-zinc-500 text-[8.5px]">
          <span className="flex items-center gap-1">
            <Terminal className="w-3 h-3 text-[#00ffcc]" />
            OPERATIONAL TELEMETRY LOG (NPU LIVE FEED)
          </span>
          <span className="text-[#00ffcc] animate-pulse">● Connected</span>
        </div>

        {telemetryLogs.map((log, idx) => {
          const isAlert = log.includes('🚨');
          return (
            <p 
              key={idx} 
              className={isAlert ? 'text-[#00ffcc] font-bold drop-shadow-[0_0_8px_rgba(0,255,204,0.5)] my-0.5' : 'text-zinc-400 my-0.5'}
            >
              {log}
            </p>
          );
        })}
      </div>

    </div>
  );
};
