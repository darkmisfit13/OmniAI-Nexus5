import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  X, 
  Send, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Maximize2, 
  Mic, 
  MicOff, 
  Terminal, 
  Play, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  Copy, 
  AlertCircle,
  Clock,
  Zap,
  Activity,
  Wifi,
  WifiOff,
  Sun,
  ClipboardX,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { HoloOrb } from './HoloOrb';
import { useOmniChat } from '../context/OmniChatContext';
import { omniVoice } from '../lib/omniVoice';
import { triggerTactileHaptic } from '../lib/hapticFeedback';

export interface VoiceCommandLogItem {
  id: string;
  command: string;
  timestamp: string;
  studioContext?: string;
  executionCount: number;
}

const DEFAULT_VOICE_COMMANDS: VoiceCommandLogItem[] = [
  {
    id: 'cmd-1',
    command: 'Scan active screen and summarize context',
    timestamp: '10:24 AM',
    studioContext: 'Vision Cognitive HUD',
    executionCount: 4,
  },
  {
    id: 'cmd-2',
    command: 'Draft concise reply with strategic posture',
    timestamp: '10:18 AM',
    studioContext: 'Keyboard Dock',
    executionCount: 7,
  },
  {
    id: 'cmd-3',
    command: 'Calibrate voice tone to dry wit',
    timestamp: '09:55 AM',
    studioContext: 'OmniNexus Calibration',
    executionCount: 2,
  },
  {
    id: 'cmd-4',
    command: 'Generate visual storyboard concepts',
    timestamp: '09:41 AM',
    studioContext: 'Artisan Visual Studio',
    executionCount: 3,
  },
  {
    id: 'cmd-5',
    command: 'Check system telemetry and NPU latency',
    timestamp: '09:15 AM',
    studioContext: 'OmniCore Engine',
    executionCount: 5,
  },
];

export interface OmniNexusPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenFullChat: () => void;
  currentStudioName?: string;
  currentStudioTag?: string;
}

export const OmniNexusPanel: React.FC<OmniNexusPanelProps> = ({
  isOpen,
  onClose,
  onOpenFullChat,
  currentStudioName,
  currentStudioTag,
}) => {
  const { 
    messages, 
    sendMessage, 
    isGenerating, 
    chatError, 
    failedMessage, 
    retryLastMessage, 
    orbPhase,
    activeThread 
  } = useOmniChat();

  const [inputText, setInputText] = useState('');
  const [isVoiceEnabled, setIsVoiceEnabled] = useState<boolean>(omniVoice.getVoiceEnabled());
  const [isDictating, setIsDictating] = useState(false);
  const [isVoiceLogOpen, setIsVoiceLogOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [executingId, setExecutingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'chat' | 'commands'>('chat');
  const [wifiActive, setWifiActive] = useState<boolean>(true);
  const [brightnessLevel, setBrightnessLevel] = useState<number>(100);
  const [quickActionToast, setQuickActionToast] = useState<string | null>(null);
  const [isLogExported, setIsLogExported] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load persistent Voice Command Log
  const [voiceLog, setVoiceLog] = useState<VoiceCommandLogItem[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('omni_voice_command_log');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch {}
      }
    }
    return DEFAULT_VOICE_COMMANDS;
  });

  // Save voice log when updated
  const saveVoiceLog = (items: VoiceCommandLogItem[]) => {
    setVoiceLog(items);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('omni_voice_command_log', JSON.stringify(items));
      } catch {}
    }
  };

  // Add command to log
  const addVoiceCommand = (commandText: string) => {
    const trimmed = commandText.trim();
    if (!trimmed) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setVoiceLog((prev) => {
      const existingIdx = prev.findIndex(item => item.command.toLowerCase() === trimmed.toLowerCase());
      let updated: VoiceCommandLogItem[];
      if (existingIdx !== -1) {
        updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          timestamp: timeStr,
          executionCount: updated[existingIdx].executionCount + 1,
          studioContext: currentStudioName || updated[existingIdx].studioContext,
        };
        // Move to front
        const [item] = updated.splice(existingIdx, 1);
        updated.unshift(item);
      } else {
        const newItem: VoiceCommandLogItem = {
          id: `cmd-${Date.now()}`,
          command: trimmed,
          timestamp: timeStr,
          studioContext: currentStudioName || 'Nexus Direct',
          executionCount: 1,
        };
        updated = [newItem, ...prev.slice(0, 24)];
      }
      try {
        localStorage.setItem('omni_voice_command_log', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (isOpen && activeTab === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isGenerating, activeTab]);

  if (!isOpen) return null;

  const studioLabel = currentStudioName || 'Creative Studio';

  const studioChips = currentStudioName
    ? [
        `Help me create in ${currentStudioName}`,
        `What are the best settings for ${currentStudioName}?`,
        `Inspire a unique concept for this project`,
      ]
    : [
        'Scan active screen & summarize',
        'Draft concise reply with strategic posture',
        'Calibrate voice tone to dry wit',
        'Generate visual storyboard concepts',
      ];

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const textToSend = inputText.trim();
    if (!textToSend || isGenerating) return;

    setInputText('');
    const contextPrompt = currentStudioName
      ? `[Studio: ${currentStudioName} (${currentStudioTag || 'Active Engine'})] ${textToSend}`
      : textToSend;

    await sendMessage(contextPrompt, {
      studioContext: currentStudioName ? `Current Studio: ${currentStudioName} (${currentStudioTag || ''})` : undefined,
    });
  };

  const handleQuickChip = async (chipText: string) => {
    if (isGenerating) return;
    triggerTactileHaptic(4, 'tap');
    await sendMessage(chipText, {
      studioContext: currentStudioName ? `Current Studio: ${currentStudioName} (${currentStudioTag || ''})` : undefined,
    });
  };

  // Re-execute a voice command from log
  const handleReExecuteCommand = async (item: VoiceCommandLogItem) => {
    if (isGenerating) return;
    triggerTactileHaptic(6, 'enter');
    setExecutingId(item.id);

    // Update execution count
    setVoiceLog(prev => {
      const updated = prev.map(c => c.id === item.id ? { ...c, executionCount: c.executionCount + 1 } : c);
      try { localStorage.setItem('omni_voice_command_log', JSON.stringify(updated)); } catch {}
      return updated;
    });

    // Send command directly
    setActiveTab('chat');
    setTimeout(() => {
      setExecutingId(null);
    }, 1200);

    await sendMessage(item.command, {
      studioContext: item.studioContext || (currentStudioName ? `Current Studio: ${currentStudioName}` : undefined),
    });
  };

  const handleClearVoiceLog = () => {
    triggerTactileHaptic(3, 'delete');
    saveVoiceLog([]);
  };

  // Quick Action: Toggle Wi-Fi
  const handleToggleWifi = () => {
    triggerTactileHaptic(4, 'tap');
    const nextWifi = !wifiActive;
    setWifiActive(nextWifi);
    const msg = `System Task: Wi-Fi ${nextWifi ? 'Enabled & Connected' : 'Disconnected'}`;
    setQuickActionToast(msg);
    addVoiceCommand(`Toggle Wi-Fi (${nextWifi ? 'ON' : 'OFF'})`);
    setTimeout(() => setQuickActionToast(null), 2500);
  };

  // Quick Action: Brightness Down (step down by 20%, wraps to 100%)
  const handleBrightnessDown = () => {
    triggerTactileHaptic(4, 'tap');
    const nextBrightness = brightnessLevel <= 20 ? 100 : brightnessLevel - 20;
    setBrightnessLevel(nextBrightness);
    const msg = `System Task: Display Brightness lowered to ${nextBrightness}%`;
    setQuickActionToast(msg);
    addVoiceCommand(`Brightness Down (${nextBrightness}%)`);
    setTimeout(() => setQuickActionToast(null), 2500);
  };

  // Quick Action: Clipboard Clear
  const handleClipboardClear = async () => {
    triggerTactileHaptic(4, 'delete');
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText('');
      }
    } catch {}
    const msg = 'System Task: Clipboard Cleared';
    setQuickActionToast(msg);
    addVoiceCommand('Clipboard Clear');
    setTimeout(() => setQuickActionToast(null), 2500);
  };

  // Export Voice Command Log to Clipboard
  const handleExportVoiceLog = async () => {
    triggerTactileHaptic(4, 'tap');
    if (voiceLog.length === 0) {
      setQuickActionToast('Voice log is currently empty');
      setTimeout(() => setQuickActionToast(null), 2000);
      return;
    }

    const logText = voiceLog.map((item, idx) => 
      `${idx + 1}. [${item.timestamp}] [${item.studioContext || 'General'}] "${item.command}" (Executions: ${item.executionCount})`
    ).join('\n');

    const formattedLog = `=== OmniNexus Voice Command Log Export ===\nExported: ${new Date().toLocaleString()}\nTotal Interactions: ${voiceLog.length}\n\n${logText}\n===========================================`;

    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(formattedLog);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = formattedLog;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setIsLogExported(true);
      setQuickActionToast('Voice Command Log copied to clipboard!');
      setTimeout(() => {
        setIsLogExported(false);
        setQuickActionToast(null);
      }, 2500);
    } catch (err) {
      setQuickActionToast('Failed to export log to clipboard');
      setTimeout(() => setQuickActionToast(null), 2000);
    }
  };

  // Web Speech recognition dictation toggle
  const handleToggleDictation = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported on this browser.');
      return;
    }

    if (isDictating) {
      setIsDictating(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setIsDictating(true);
      triggerTactileHaptic(5, 'tap');

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsDictating(false);
        // Automatically add dictation into the Voice Command Log
        addVoiceCommand(transcript);
        triggerTactileHaptic(6, 'pulse');
      };
      recognition.onerror = () => {
        setIsDictating(false);
      };
      recognition.onend = () => {
        setIsDictating(false);
      };
      recognition.start();
    } catch {
      setIsDictating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex flex-col justify-end font-sans">
      {/* Semi-transparent Backdrop: click outside smoothly closes the companion */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-[#0b0a14]/80 backdrop-blur-sm transition-opacity"
      />

      {/* Slide-out OmniNexus Panel with strict Dark Misfit Studios cinematic styling */}
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="relative w-full max-w-lg mx-auto bg-[#0b0a14] border-t sm:border border-[#211d34] rounded-t-[28px] sm:rounded-2xl shadow-[0_-10px_40px_rgba(0,240,255,0.15)] flex flex-col h-[82vh] sm:h-[700px] max-h-[88vh] z-10 overflow-hidden text-[#e8e6f2]"
      >
        {/* Top Drag Indicator / Handle */}
        <div className="w-full flex justify-center pt-2 pb-1 bg-[#0b0a14]">
          <div className="w-12 h-1 rounded-full bg-[#211d34]" />
        </div>

        {/* Panel Header */}
        <div className="px-3.5 py-2.5 bg-[#14121f] border-b border-[#211d34] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-2.5 h-2.5 rounded-full bg-[#00f0ff] shadow-[0_0_10px_rgba(0,240,255,0.8)] animate-pulse shrink-0" />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs text-[#e8e6f2] tracking-wider font-mono truncate">
                  OmniNexus <span className="text-[#00f0ff]">Panel</span>
                </span>
                {currentStudioName && (
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#0b0a14] text-[#00f0ff] border border-[#00f0ff]/30 font-mono truncate">
                    {currentStudioName}
                  </span>
                )}
              </div>
              <p className="text-[10px] text-[#9490ac] font-mono truncate">
                {activeThread?.title || 'Dark Misfit Studios • Digital Shadow Nexus'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Voice Toggle */}
            <button
              type="button"
              onClick={() => {
                const next = omniVoice.toggleVoice();
                setIsVoiceEnabled(next);
                triggerTactileHaptic(3, 'tap');
              }}
              className={`p-1.5 rounded-lg border text-xs transition ${
                isVoiceEnabled
                  ? 'bg-[#14121f] text-[#00f0ff] border-[#00f0ff]/60 shadow-[0_0_8px_rgba(0,240,255,0.3)]'
                  : 'bg-[#14121f] text-[#9490ac] border-[#211d34]'
              }`}
              title={isVoiceEnabled ? 'Voice output enabled' : 'Voice output muted'}
            >
              {isVoiceEnabled ? <Volume2 className="w-3.5 h-3.5 text-[#00f0ff]" /> : <VolumeX className="w-3.5 h-3.5 text-[#9490ac]" />}
            </button>

            {/* Expand to Full Dedicated Chat Page */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenFullChat();
              }}
              className="p-1.5 rounded-lg bg-[#14121f] border border-[#211d34] text-[#9490ac] hover:text-[#00f0ff] hover:border-[#00f0ff]/50 text-xs transition flex items-center gap-1"
              title="Open full dedicated chat page"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>

            {/* Close Button: returns to exact studio and screen */}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-[#14121f] border border-[#211d34] text-[#9490ac] hover:text-[#e8e6f2] hover:bg-[#211d34] transition"
              title="Close OmniNexus Panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* HoloOrb Visual Section with Cyan Telemetry Halo */}
        <div className="px-4 py-2.5 bg-[#14121f] border-b border-[#211d34] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#0b0a14] border border-[#211d34] flex items-center justify-center shrink-0 shadow-inner overflow-hidden relative">
              <HoloOrb phase={orbPhase} size="sm" />
              <span className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-[#00f0ff] shadow-[0_0_6px_#00f0ff]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#e8e6f2]">HoloOrb Nexus Active</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#0b0a14] text-[#00f0ff] border border-[#00f0ff]/40 font-mono font-bold">
                  {orbPhase.toUpperCase()}
                </span>
              </div>
              <p className="text-[10px] text-[#9490ac] mt-0.5">
                Observing {studioLabel}. Directing cinematic execution with zero latency.
              </p>
            </div>
          </div>

          {/* Quick Voice Log Drawer Toggle */}
          <button
            type="button"
            onClick={() => setActiveTab(activeTab === 'chat' ? 'commands' : 'chat')}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[10.5px] font-mono font-bold transition shadow-sm ${
              activeTab === 'commands'
                ? 'bg-[#00f0ff]/15 border-[#00f0ff] text-[#00f0ff] shadow-[0_0_12px_rgba(0,240,255,0.35)]'
                : 'bg-[#0b0a14] border-[#211d34] text-[#9490ac] hover:text-[#00f0ff] hover:border-[#00f0ff]/40'
            }`}
            title="Toggle Voice Command Log"
          >
            <Mic className="w-3.5 h-3.5 text-[#00f0ff]" />
            <span className="hidden xs:inline">Voice Log</span>
            <span className="w-4 h-4 rounded-full bg-[#14121f] border border-[#00f0ff]/40 text-[#00f0ff] text-[9px] flex items-center justify-center font-bold">
              {voiceLog.length}
            </span>
          </button>
        </div>

        {/* Quick Actions System Tasks Ribbon */}
        <div className="px-3.5 py-2 bg-[#14121f] border-b border-[#211d34] flex items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5 min-w-0 shrink-0">
            <Zap className="w-3.5 h-3.5 text-[#00f0ff]" />
            <span className="text-[10px] font-mono font-bold text-[#e8e6f2] uppercase tracking-wider hidden xs:inline">
              Quick Actions
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {/* Toggle Wi-Fi */}
            <button
              type="button"
              onClick={handleToggleWifi}
              className={`px-2.5 py-1 rounded-lg border text-[10px] font-mono font-bold flex items-center gap-1.5 transition active:scale-95 shrink-0 ${
                wifiActive
                  ? 'bg-[#00f0ff]/10 text-[#00f0ff] border-[#00f0ff]/40 shadow-[0_0_8px_rgba(0,240,255,0.25)]'
                  : 'bg-[#0b0a14] text-[#9490ac] border-[#211d34]'
              }`}
              title="Toggle Wi-Fi (Single Tap System Action)"
            >
              {wifiActive ? <Wifi className="w-3 h-3 text-[#00f0ff]" /> : <WifiOff className="w-3 h-3 text-[#9490ac]" />}
              <span>Toggle Wi-Fi ({wifiActive ? 'ON' : 'OFF'})</span>
            </button>

            {/* Brightness Down */}
            <button
              type="button"
              onClick={handleBrightnessDown}
              className="px-2.5 py-1 rounded-lg bg-[#0b0a14] hover:bg-[#14121f] border border-[#211d34] hover:border-[#00f0ff]/50 text-[#e8e6f2] hover:text-[#00f0ff] text-[10px] font-mono font-bold flex items-center gap-1.5 transition active:scale-95 shrink-0"
              title="Reduce system display brightness"
            >
              <Sun className="w-3 h-3 text-[#00f0ff]" />
              <span>Brightness Down ({brightnessLevel}%)</span>
            </button>

            {/* Clipboard Clear */}
            <button
              type="button"
              onClick={handleClipboardClear}
              className="px-2.5 py-1 rounded-lg bg-[#0b0a14] hover:bg-[#14121f] border border-[#211d34] hover:border-[#00f0ff]/50 text-[#e8e6f2] hover:text-[#00f0ff] text-[10px] font-mono font-bold flex items-center gap-1.5 transition active:scale-95 shrink-0"
              title="Clear system clipboard with single tap"
            >
              <ClipboardX className="w-3 h-3 text-[#00f0ff]" />
              <span>Clipboard Clear</span>
            </button>
          </div>
        </div>

        {/* Quick Action Toast Indicator */}
        {quickActionToast && (
          <div className="px-3 py-1.5 bg-[#00f0ff]/15 border-b border-[#00f0ff]/40 text-[#00f0ff] text-[10.5px] font-mono font-bold flex items-center justify-between animate-in fade-in shrink-0">
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-[#00f0ff]" />
              {quickActionToast}
            </span>
            <span className="text-[9px] text-[#00f0ff]/80">System Executed</span>
          </div>
        )}

        {/* Studio Quick Context Chips */}
        {activeTab === 'chat' && (
          <div className="px-3 py-1.5 bg-[#0b0a14] border-b border-[#211d34] flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            <span className="text-[9.5px] font-mono text-[#00f0ff] font-bold shrink-0">Command:</span>
            {studioChips.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleQuickChip(chip)}
                className="px-2.5 py-1 rounded-full bg-[#14121f] border border-[#211d34] hover:border-[#00f0ff]/50 text-[#9490ac] hover:text-[#e8e6f2] text-[10px] font-mono whitespace-nowrap transition active:scale-95 shrink-0"
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        {/* Tab Switcher: Chat Stream vs Voice Command Log */}
        <div className="px-3 py-1.5 bg-[#14121f] border-b border-[#211d34] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('chat')}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 ${
                activeTab === 'chat'
                  ? 'bg-[#00f0ff]/15 text-[#00f0ff] border border-[#00f0ff]/50 shadow-[0_0_8px_rgba(0,240,255,0.25)]'
                  : 'text-[#9490ac] hover:text-[#e8e6f2]'
              }`}
            >
              <Terminal className="w-3 h-3" /> Live Stream
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('commands')}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 ${
                activeTab === 'commands'
                  ? 'bg-[#00f0ff]/15 text-[#00f0ff] border border-[#00f0ff]/50 shadow-[0_0_8px_rgba(0,240,255,0.25)]'
                  : 'text-[#9490ac] hover:text-[#e8e6f2]'
              }`}
            >
              <Mic className="w-3 h-3 text-[#00f0ff]" /> Voice Command Log ({voiceLog.length})
            </button>
          </div>

          {activeTab === 'commands' && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportVoiceLog}
                className="text-[10px] font-mono text-[#00f0ff] hover:text-[#00f0ff]/80 flex items-center gap-1 px-2 py-0.5 rounded bg-[#0b0a14] border border-[#00f0ff]/40 transition active:scale-95"
                title="Format and copy recent interaction history to clipboard"
              >
                {isLogExported ? <Check className="w-3 h-3 text-[#00f0ff]" /> : <FileText className="w-3 h-3 text-[#00f0ff]" />}
                <span>{isLogExported ? 'Exported!' : 'Export Log'}</span>
              </button>
              {voiceLog.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearVoiceLog}
                  className="text-[10px] font-mono text-[#9490ac] hover:text-[#00f0ff] flex items-center gap-1 transition"
                  title="Clear voice history"
                >
                  <Trash2 className="w-3 h-3" /> Clear
                </button>
              )}
            </div>
          )}
        </div>

        {/* TAB 1: CONVERSATION HISTORY STREAM */}
        {activeTab === 'chat' && (
          <div className="flex-1 overflow-y-auto p-3.5 space-y-3 no-scrollbar bg-[#0b0a14]">
            {messages.map((msg) => {
              const isUser = msg.sender === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-1 mb-0.5 px-1 text-[9px] font-mono text-[#9490ac]">
                    <span>{isUser ? 'You' : 'OmniNexus'}</span>
                    <span>•</span>
                    <span>{msg.timestamp}</span>
                  </div>

                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                      isUser
                        ? 'bg-gradient-to-r from-[#6c63ff] to-[#00f0ff] text-black font-semibold rounded-br-xs shadow-md shadow-[#00f0ff]/20'
                        : 'bg-[#14121f] text-[#e8e6f2] border border-[#211d34] rounded-bl-xs shadow-sm'
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </div>
              );
            })}

            {/* Generating Loading State */}
            {isGenerating && (
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-lg bg-[#14121f] border border-[#00f0ff]/40 flex items-center justify-center shrink-0">
                  <HoloOrb phase="processing" size="xs" />
                </div>
                <div className="px-3 py-2 rounded-2xl bg-[#14121f] border border-[#00f0ff]/30 text-[#00f0ff] text-xs font-mono flex items-center gap-2 animate-pulse">
                  <span>OmniNexus synthesizing response...</span>
                </div>
              </div>
            )}

            {/* Error Banner with Retry */}
            {chatError && (
              <div className="p-3 rounded-xl bg-[#14121f] border border-[#00f0ff]/50 text-[#e8e6f2] text-xs space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-[#00f0ff]">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Error communicating with OmniNexus:</span>
                </div>
                <p className="text-[11px] font-mono leading-relaxed text-[#9490ac]">{chatError}</p>
                {failedMessage && (
                  <button
                    type="button"
                    onClick={retryLastMessage}
                    className="px-3 py-1 rounded-lg bg-[#00f0ff] hover:bg-[#00f0ff]/90 text-black text-xs font-mono font-bold flex items-center gap-1 transition"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Retry Command</span>
                  </button>
                )}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}

        {/* TAB 2: VOICE COMMAND LOG (Tap to re-execute past voice commands) */}
        {activeTab === 'commands' && (
          <div className="flex-1 overflow-y-auto p-3.5 space-y-2.5 bg-[#0b0a14] no-scrollbar">
            <div className="p-3 rounded-xl bg-[#14121f] border border-[#00f0ff]/30 flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#0b0a14] border border-[#00f0ff]/40 flex items-center justify-center text-[#00f0ff]">
                  <Mic className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#e8e6f2]">Voice Command Memory</h4>
                  <p className="text-[10px] text-[#9490ac]">Tap any recent command to immediately re-dispatch</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleExportVoiceLog}
                  className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#0b0a14] text-[#00f0ff] border border-[#00f0ff]/40 hover:bg-[#00f0ff]/10 flex items-center gap-1 transition"
                  title="Export Voice Command Log to Clipboard"
                >
                  <FileText className="w-2.5 h-2.5" />
                  <span>{isLogExported ? 'Copied!' : 'Export'}</span>
                </button>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#0b0a14] text-[#00f0ff] border border-[#00f0ff]/30">
                  1-Tap Run
                </span>
              </div>
            </div>

            {voiceLog.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-2">
                <Mic className="w-8 h-8 text-[#9490ac]/40" />
                <p className="text-xs text-[#9490ac]">No voice interactions recorded yet.</p>
                <p className="text-[10px] text-[#9490ac]/70">Tap the mic button below to record your first voice command.</p>
              </div>
            ) : (
              voiceLog.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 rounded-xl border transition-all duration-150 flex items-center justify-between gap-3 group ${
                    executingId === item.id
                      ? 'bg-[#00f0ff]/15 border-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.3)]'
                      : 'bg-[#14121f] border-[#211d34] hover:border-[#00f0ff]/50'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handleReExecuteCommand(item)}
                    className="flex-1 text-left min-w-0"
                    title="Tap to re-execute this voice command"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff]" />
                      <span className="text-[10px] font-mono text-[#00f0ff] truncate">
                        {item.studioContext || 'Voice Command'}
                      </span>
                      <span className="text-[9px] font-mono text-[#9490ac] flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" /> {item.timestamp}
                      </span>
                      {item.executionCount > 1 && (
                        <span className="text-[9px] font-mono px-1 rounded bg-[#0b0a14] text-[#9490ac] border border-[#211d34]">
                          ×{item.executionCount}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-semibold text-[#e8e6f2] group-hover:text-white transition line-clamp-2">
                      "{item.command}"
                    </p>
                  </button>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleReExecuteCommand(item)}
                      disabled={isGenerating}
                      className="px-2.5 py-1.5 rounded-lg bg-[#00f0ff]/10 hover:bg-[#00f0ff] text-[#00f0ff] hover:text-black border border-[#00f0ff]/40 text-xs font-mono font-bold flex items-center gap-1 transition shadow-sm active:scale-95 disabled:opacity-40"
                      title="Re-execute command"
                    >
                      <Play className="w-3 h-3 fill-current" />
                      <span className="text-[10.5px]">Run</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Compact Bottom Message Input Bar */}
        <form
          onSubmit={handleSend}
          className="p-2.5 bg-[#14121f] border-t border-[#211d34] flex items-center gap-2 shrink-0 pb-[max(0.6rem,env(safe-area-inset-bottom))]"
        >
          {/* Dictate Button */}
          <button
            type="button"
            onClick={handleToggleDictation}
            className={`p-2 rounded-xl border transition ${
              isDictating
                ? 'bg-[#00f0ff]/20 text-[#00f0ff] border-[#00f0ff] shadow-[0_0_12px_rgba(0,240,255,0.4)] animate-pulse'
                : 'bg-[#0b0a14] border-[#211d34] text-[#9490ac] hover:text-[#00f0ff] hover:border-[#00f0ff]/40'
            }`}
            title="Voice dictation & Voice Log recorder"
          >
            {isDictating ? <MicOff className="w-4 h-4 text-[#00f0ff]" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Ask OmniNexus about ${studioLabel}...`}
            className="flex-1 bg-[#0b0a14] border border-[#211d34] focus:border-[#00f0ff] rounded-xl px-3 py-2 text-xs text-[#e8e6f2] placeholder:text-[#9490ac] focus:outline-none focus:ring-1 focus:ring-[#00f0ff]/40 transition font-sans"
            disabled={isGenerating}
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim() || isGenerating}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#6c63ff] to-[#00f0ff] hover:brightness-110 disabled:opacity-40 text-black font-bold text-xs flex items-center gap-1 shadow-md shadow-[#00f0ff]/25 active:scale-95 transition"
          >
            <Send className="w-3.5 h-3.5 fill-current" />
            <span className="hidden xs:inline">Send</span>
          </button>
        </form>
      </motion.div>
    </div>
  );
};
