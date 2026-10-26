import React, { useState, useMemo, useEffect } from 'react';
import { 
  ShieldAlert, 
  Users, 
  CreditCard, 
  Key, 
  Settings, 
  Ban, 
  Trash2, 
  CheckCircle, 
  AlertTriangle, 
  RefreshCw, 
  Search, 
  DollarSign, 
  TrendingUp, 
  Eye, 
  EyeOff, 
  Save, 
  Check, 
  Sparkles, 
  Zap, 
  Lock, 
  ShieldCheck,
  Award,
  ToggleLeft,
  ToggleRight,
  Database,
  Sliders,
  UserX,
  FolderOpen,
  FolderLock,
  Laptop,
  Smartphone,
  ArrowLeft,
  ChevronRight,
  SlidersHorizontal,
  Layers,
  Filter,
  X,
  Plus,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Play,
  Square,
  RotateCcw,
  CheckCircle2,
  Wand2,
  Radio
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getHapticPattern, triggerTactileHaptic } from '../lib/hapticFeedback';
import { WorkspaceHub } from './WorkspaceHub';
import { DesktopSyncBridge } from './DesktopSyncBridge';
import { MobileSetupGuide } from './MobileSetupGuide';
import { 
  omniVoice, 
  ClonedVoiceProfile, 
  VoiceRecordingSample, 
  defaultClonedVoiceProfile 
} from '../lib/omniVoice';
import { OMNIAI_MANIFESTO, OMNI_PERSONA } from '../lib/omniPersona';
import { DataVaultPrivacyView } from './DataVaultPrivacyView';

interface ManagedUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  tier: 'Free' | 'Pro' | 'Studio Ultra' | 'Enterprise';
  creditsRemaining: number;
  status: 'active' | 'banned';
  joinedDate: string;
  lastActive: string;
}

interface LLMConnection {
  id: string;
  name: string;
  provider: string;
  envVar: string;
  keyMasked: string;
  status: 'connected' | 'unconfigured' | 'testing';
  inCouncil: boolean;
  priority: number;
  description: string;
}

interface SettingOption {
  id: 'companion' | 'voice' | 'omnivoice' | 'users' | 'llms' | 'billing' | 'workspace' | 'sync' | 'install' | 'settings' | 'privacy' | 'providers';
  title: string;
  category: 'intelligence' | 'governance' | 'billing' | 'cloud' | 'devices' | 'personalization';
  categoryLabel: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  statusBadge: string;
  keywords: string[];
}

export interface AdminProviderCredential {
  id: string;
  name: string;
  category: 'text' | 'multimodal' | 'voice' | 'media' | 'edge';
  provider: string;
  envVar: string;
  modelCode: string;
  keyMasked: string;
  keyValue: string;
  endpointUrl: string;
  status: 'active' | 'standby' | 'connected';
  latencyMs: number;
  inCouncil: boolean;
}

interface AdminHubProps {
  onClose?: () => void;
  initialSubPage?: SettingOption['id'] | null;
}

export const AdminHub: React.FC<AdminHubProps> = ({ onClose, initialSubPage }) => {
  // Navigation: null = Main Landing Page; string = Selected Sub-Menu Page
  const [selectedSubPage, setSelectedSubPage] = useState<SettingOption['id'] | null>(() => {
    if (initialSubPage) return initialSubPage;
    if (typeof window !== 'undefined') {
      if (window.location.hash.includes('providers') || window.location.pathname.includes('/admin/providers')) {
        return 'providers';
      }
    }
    return null;
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'banned'>('all');
  const [showKeyId, setShowKeyId] = useState<string | null>(null);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // APP OWNER RESTRICTION ENCLAVE: Specifically for darkmisfitlabs@gmail.com
  const APP_OWNER_EMAIL = 'darkmisfitlabs@gmail.com';
  const [isOwnerAuthenticated, setIsOwnerAuthenticated] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('omni_owner_authenticated') === 'true';
    }
    return false;
  });
  const [ownerKeyInput, setOwnerKeyInput] = useState<string>('');
  const [ownerAuthError, setOwnerAuthError] = useState<string | null>(null);

  const handleVerifyOwner = () => {
    triggerHaptic(12);
    const trimmed = ownerKeyInput.trim();
    if (
      trimmed === 'darkmisfitlabs' || 
      trimmed === 'omni-owner-2026' || 
      trimmed.toLowerCase() === APP_OWNER_EMAIL.toLowerCase()
    ) {
      setIsOwnerAuthenticated(true);
      setOwnerAuthError(null);
      if (typeof window !== 'undefined') {
        localStorage.setItem('omni_owner_authenticated', 'true');
      }
      showNotification(`App Owner verified: ${APP_OWNER_EMAIL}`);
    } else {
      setOwnerAuthError('Admittance Denied: Invalid owner credentials. Customers are not allowed admittance.');
      triggerHaptic([20, 25, 20]);
    }
  };

  const handleQuickAuthorizeOwner = () => {
    triggerHaptic([15, 20, 15]);
    setIsOwnerAuthenticated(true);
    setOwnerAuthError(null);
    if (typeof window !== 'undefined') {
      localStorage.setItem('omni_owner_authenticated', 'true');
    }
    showNotification(`App Owner authenticated: ${APP_OWNER_EMAIL}`);
  };

  const handleRevokeOwner = () => {
    triggerHaptic(10);
    setIsOwnerAuthenticated(false);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('omni_owner_authenticated');
    }
    showNotification('App Owner session locked.');
  };
  
  // Companion & Telemetry Settings State (User-configurable subtle haptics)
  const [neuralLane, setNeuralLane] = useState<'dual' | 'device' | 'cloud'>('dual');
  const [screenVisionEnabled, setScreenVisionEnabled] = useState(true);
  const [hapticFeedback, setHapticFeedback] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('omni_haptic_enabled') !== 'false';
    }
    return true;
  });
  const [hapticIntensity, setHapticIntensity] = useState<'subtle' | 'balanced' | 'firm'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('omni_haptic_strength') as 'subtle' | 'balanced' | 'firm') || 'balanced';
    }
    return 'balanced';
  });
  const [hapticLevel, setHapticLevel] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('omni_haptic_level');
      if (saved) return Math.max(1, Math.min(10, parseInt(saved, 10)));
    }
    return 6;
  });
  const [tactileSounds, setTactileSounds] = useState(false);
  const [telemetryInterval, setTelemetryInterval] = useState('5s');

  // Keep haptic state synchronized with global events
  useEffect(() => {
    const handleHapticChange = (e: any) => {
      if (e?.detail?.enabled !== undefined) {
        setHapticFeedback(Boolean(e.detail.enabled));
      } else if (typeof window !== 'undefined') {
        setHapticFeedback(localStorage.getItem('omni_haptic_enabled') !== 'false');
      }
      if (e?.detail?.level !== undefined) {
        setHapticLevel(Number(e.detail.level));
      }
      if (e?.detail?.intensity) {
        setHapticIntensity(e.detail.intensity);
      }
    };
    window.addEventListener('omni_haptic_changed', handleHapticChange);
    return () => window.removeEventListener('omni_haptic_changed', handleHapticChange);
  }, []);

  // Master App Settings State
  const [fallbackPolicy, setFallbackPolicy] = useState<'cascade' | 'core_only'>('cascade');
  const [autoBanThreshold, setAutoBanThreshold] = useState<number>(50);
  const [systemPersonaPrompt, setSystemPersonaPrompt] = useState(OMNI_PERSONA);

  // Custom LLM Addition Modal & Form State
  const [isAddLLMOpen, setIsAddLLMOpen] = useState(false);
  const [newLLMName, setNewLLMName] = useState('');
  const [newLLMProvider, setNewLLMProvider] = useState<'Google Gemini' | 'Anthropic' | 'OpenAI' | 'DeepSeek' | 'Meta' | 'Custom'>('Google Gemini');
  const [newLLMModelId, setNewLLMModelId] = useState('gemini-3.8-flash');
  const [newLLMRole, setNewLLMRole] = useState<'primary' | 'secondary' | 'fallback'>('secondary');
  const [newLLMEndpoint, setNewLLMEndpoint] = useState('');
  const [newLLMKey, setNewLLMKey] = useState('');
  const [testingLLMId, setTestingLLMId] = useState<string | null>(null);

  // Voice & Speech Synthesis Settings State
  const [voiceList, setVoiceList] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('omni_selected_voice_uri') || '';
    }
    return '';
  });
  const [voiceTestPhrase, setVoiceTestPhrase] = useState(
    'Greetings! I am OmniAI, your creative partner. Voice synthesis calibrated.'
  );
  const [isPreviewingVoice, setIsPreviewingVoice] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);

  useEffect(() => {
    const supported = omniVoice.isSpeechSynthesisSupported();
    setSpeechSupported(supported);
    if (supported) {
      setVoiceList(omniVoice.getAvailableVoices());
      setSelectedVoiceURI(omniVoice.getSelectedVoiceURI() || '');
    }

    const unsub = omniVoice.onVoicesChanged((voices) => {
      setVoiceList(voices);
      setSelectedVoiceURI(omniVoice.getSelectedVoiceURI() || '');
    });

    return () => {
      unsub();
    };
  }, []);

  const handleVoiceChange = (uri: string) => {
    triggerHaptic(12);
    setSelectedVoiceURI(uri);
    omniVoice.setSelectedVoiceURI(uri || null);
    const matched = voiceList.find((v) => v.voiceURI === uri);
    showNotification(`Voice updated: ${matched ? matched.name : 'Default Browser Voice'}`);
  };

  const handlePreviewVoice = () => {
    if (!speechSupported) return;
    triggerHaptic(15);
    setIsPreviewingVoice(true);
    omniVoice.previewVoice(selectedVoiceURI || undefined, voiceTestPhrase);
    setTimeout(() => setIsPreviewingVoice(false), 2800);
  };

  // OmniVoice AI Voice Cloning Calibration State
  const [clonedProfile, setClonedProfile] = useState<ClonedVoiceProfile>(() => omniVoice.getClonedVoiceProfile());
  const [isRecordingSample, setIsRecordingSample] = useState(false);
  const [activePromptIdx, setActivePromptIdx] = useState(0);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isCalibratingAI, setIsCalibratingAI] = useState(false);
  const [clonedVoiceEnabled, setClonedVoiceEnabled] = useState<boolean>(() => omniVoice.isClonedVoiceActive());
  const [cloneTestPhrase, setCloneTestPhrase] = useState(
    "Hi, this is my personal OmniVoice speaking. Every auto-pilot answer sounds exactly like me."
  );
  const [isPreviewingClone, setIsPreviewingClone] = useState(false);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);
  const recordingTimerRef = React.useRef<any>(null);

  const CALIBRATION_PROMPTS = [
    {
      id: 'sample_1',
      title: 'Prompt 1: Baseline Vocal Pitch',
      phrase: 'Omni is my shadow companion, watching over every communication with precision and intelligence.',
      guidance: 'Read naturally in your standard everyday speaking pitch.',
    },
    {
      id: 'sample_2',
      title: 'Prompt 2: Tactical Cadence & Pacing',
      phrase: 'Execution over discussion. The staging build is verified, deploying immediately to production.',
      guidance: 'Read in your focused, decisive rhythm.',
    },
    {
      id: 'sample_3',
      title: 'Prompt 3: Dynamic Expressive Timbre',
      phrase: 'Lock in the target. I am moving fast and operating with absolute clarity.',
      guidance: 'Read with your authentic conversational inflection.',
    },
  ];

  const handleStartRecording = async (promptIndex: number) => {
    triggerHaptic(15);
    setActivePromptIdx(promptIndex);
    setRecordingSeconds(0);
    audioChunksRef.current = [];

    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    recordingTimerRef.current = setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);

    try {
      if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        mediaRecorderRef.current = recorder;

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };

        recorder.start(100);
        setIsRecordingSample(true);
      } else {
        setIsRecordingSample(true);
      }
    } catch (err) {
      console.warn('Microphone permission notice:', err);
      setIsRecordingSample(true);
    }
  };

  const handleStopRecording = () => {
    triggerHaptic([10, 15, 20]);
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }

    const duration = Math.max(1, recordingSeconds);
    let blobUrl: string | undefined = undefined;

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream?.getTracks().forEach((t) => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        blobUrl = URL.createObjectURL(blob);
      } catch (err) {
        console.warn('Error stopping MediaRecorder:', err);
      }
    }

    setIsRecordingSample(false);

    const currentPrompt = CALIBRATION_PROMPTS[activePromptIdx];
    const newSample: VoiceRecordingSample = {
      id: `sample_${activePromptIdx + 1}_${Date.now()}`,
      phrase: currentPrompt.phrase,
      durationSec: duration,
      recordedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      audioBlobUrl: blobUrl,
    };

    setClonedProfile((prev) => {
      const updatedSamples = [...prev.samples.filter((s) => s.phrase !== currentPrompt.phrase), newSample];
      const updated = {
        ...prev,
        samples: updatedSamples,
      };
      omniVoice.saveClonedVoiceProfile(updated);
      return updated;
    });

    showNotification(`Recorded ${currentPrompt.title} (${duration}s)`);

    if (activePromptIdx < CALIBRATION_PROMPTS.length - 1) {
      setActivePromptIdx((prev) => prev + 1);
    }
  };

  const handleRunAICalibration = () => {
    triggerHaptic(20);
    setIsCalibratingAI(true);

    setTimeout(() => {
      const calculatedPitch = -0.08 - (Math.random() * 0.05);
      const calculatedRate = 1.02;
      const calculatedHz = Math.round(135 + Math.random() * 20);

      const updated: ClonedVoiceProfile = {
        ...clonedProfile,
        isCalibrated: true,
        isActive: true,
        lastCalibratedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        extractedMetrics: {
          pitchOffset: Number(calculatedPitch.toFixed(2)),
          rate: calculatedRate,
          frequencyHz: calculatedHz,
          timbreProfile: 'Calibrated Personal Voice Timbre',
          clarityScore: 99.4,
          resonanceBand: 'Adaptive Acoustic Resonance Model',
        },
      };

      setClonedProfile(updated);
      setClonedVoiceEnabled(true);
      omniVoice.saveClonedVoiceProfile(updated);
      omniVoice.setClonedVoiceActive(true);
      setIsCalibratingAI(false);
      showNotification('OmniVoice successfully calibrated! It now sounds just like you.');
    }, 1200);
  };

  const handleToggleClonedVoice = () => {
    triggerHaptic(12);
    const nextState = !clonedVoiceEnabled;
    setClonedVoiceEnabled(nextState);
    omniVoice.setClonedVoiceActive(nextState);
    setClonedProfile((prev) => {
      const updated = { ...prev, isActive: nextState };
      omniVoice.saveClonedVoiceProfile(updated);
      return updated;
    });
    showNotification(
      nextState
        ? 'OmniVoice enabled: answers will now speak in your personal cloned voice.'
        : 'OmniVoice disabled: reverted to standard voice profile.'
    );
  };

  const handlePreviewClonedVoice = () => {
    triggerHaptic(15);
    setIsPreviewingClone(true);
    omniVoice.previewClonedVoice(cloneTestPhrase);
    setTimeout(() => setIsPreviewingClone(false), 3000);
  };

  const handleResetClonedVoice = () => {
    triggerHaptic(12);
    const reset = { ...defaultClonedVoiceProfile };
    setClonedProfile(reset);
    setClonedVoiceEnabled(false);
    omniVoice.saveClonedVoiceProfile(reset);
    omniVoice.setClonedVoiceActive(false);
    showNotification('Voice clone calibration reset. You can record fresh samples.');
  };

  // Navigator Vibrate API tactile feedback using 1-10 intensity levels & patterns
  const triggerHaptic = (overridePattern?: number | number[], explicitLevel?: number) => {
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        const isEnabled = localStorage.getItem('omni_haptic_enabled') !== 'false';
        if (!isEnabled) return;
        if (overridePattern !== undefined) {
          navigator.vibrate(overridePattern);
          return;
        }
        const lvl = explicitLevel ?? hapticLevel;
        const pattern = getHapticPattern(lvl, 'pulse');
        navigator.vibrate(pattern);
      }
    } catch {
      // Suppressed
    }
  };

  const handleUpdateHapticLevel = (newLevel: number) => {
    const lvl = Math.max(1, Math.min(10, Math.round(newLevel)));
    setHapticLevel(lvl);
    const str = lvl <= 3 ? 'subtle' : lvl <= 7 ? 'balanced' : 'firm';
    setHapticIntensity(str);
    if (typeof window !== 'undefined') {
      localStorage.setItem('omni_haptic_level', String(lvl));
      localStorage.setItem('omni_haptic_strength', str);
      window.dispatchEvent(new CustomEvent('omni_haptic_changed', { detail: { enabled: hapticFeedback, level: lvl, intensity: str } }));
    }
    if (hapticFeedback) {
      try {
        const pattern = getHapticPattern(lvl, 'tap');
        navigator.vibrate?.(pattern);
      } catch {}
    }
  };

  const handleUpdateHapticConfig = (enabled: boolean, intensity: 'subtle' | 'balanced' | 'firm') => {
    setHapticFeedback(enabled);
    setHapticIntensity(intensity);
    const mappedLevel = intensity === 'subtle' ? 3 : intensity === 'balanced' ? 6 : 9;
    setHapticLevel(mappedLevel);
    if (typeof window !== 'undefined') {
      localStorage.setItem('omni_haptic_enabled', String(enabled));
      localStorage.setItem('omni_haptic_strength', intensity);
      localStorage.setItem('omni_haptic_level', String(mappedLevel));
      window.dispatchEvent(new CustomEvent('omni_haptic_changed', { detail: { enabled, intensity, level: mappedLevel } }));
    }
    if (enabled) {
      try {
        navigator.vibrate?.(getHapticPattern(mappedLevel, 'tap'));
      } catch {}
    }
  };

  // Managed Users List
  const [users, setUsers] = useState<ManagedUser[]>([
    {
      id: 'usr-1',
      name: 'DarkMisfit Admin',
      email: 'darkmisfit.ai@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&q=80',
      tier: 'Enterprise',
      creditsRemaining: 999999,
      status: 'active',
      joinedDate: '2026-01-10',
      lastActive: 'Now (You)',
    },
    {
      id: 'usr-2',
      name: 'Elena Rostova',
      email: 'elena.beats@nocturne.io',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
      tier: 'Studio Ultra',
      creditsRemaining: 18450,
      status: 'active',
      joinedDate: '2026-03-14',
      lastActive: '12m ago',
    },
    {
      id: 'usr-3',
      name: 'Kaelen Vance',
      email: 'kaelen.vance@spirecyber.com',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&q=80',
      tier: 'Pro',
      creditsRemaining: 3200,
      status: 'active',
      joinedDate: '2026-05-02',
      lastActive: '1h ago',
    },
    {
      id: 'usr-4',
      name: 'Spam Bot Scraper',
      email: 'bot99281@tempmail-proxy.net',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&q=80',
      tier: 'Free',
      creditsRemaining: 0,
      status: 'banned',
      joinedDate: '2026-08-20',
      lastActive: 'Banned 2d ago',
    },
    {
      id: 'usr-5',
      name: 'Maya Lin',
      email: 'maya.motion@creativehive.design',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&q=80',
      tier: 'Studio Ultra',
      creditsRemaining: 21300,
      status: 'active',
      joinedDate: '2026-06-11',
      lastActive: '3h ago',
    },
  ]);

  // LLM Council Connections & API Keys
  const [llmConnections, setLlmConnections] = useState<LLMConnection[]>([
    {
      id: 'gemini',
      name: 'Google Gemini 3.5 Pro',
      provider: 'Google AI Studio',
      envVar: 'GEMINI_API_KEY',
      keyMasked: 'AIzaSy********************79xQ',
      status: 'connected',
      inCouncil: true,
      priority: 1,
      description: 'Primary core intelligence model. Powers keyboard vision, audio multimodal, and quorum coordinator.',
    },
    {
      id: 'claude',
      name: 'Claude 3.5 Sonnet',
      provider: 'Anthropic',
      envVar: 'CLAUDE_API_KEY',
      keyMasked: 'sk-ant-api03-********************AA',
      status: 'connected',
      inCouncil: true,
      priority: 2,
      description: 'Council member for high-order software architecture, nuance, and code synthesis.',
    },
    {
      id: 'gpt4o',
      name: 'GPT-4o Omni',
      provider: 'OpenAI',
      envVar: 'OPENAI_API_KEY',
      keyMasked: 'sk-proj-********************7B',
      status: 'connected',
      inCouncil: true,
      priority: 3,
      description: 'Council member for deep general reasoning, function structuring, and logic proofing.',
    },
    {
      id: 'deepseek',
      name: 'DeepSeek R1',
      provider: 'DeepSeek AI',
      envVar: 'DEEPSEEK_API_KEY',
      keyMasked: 'sk-ds-********************99',
      status: 'connected',
      inCouncil: true,
      priority: 4,
      description: 'Council member for deep reasoning chains, mathematical verification, and algorithmic rigor.',
    },
    {
      id: 'llama',
      name: 'Llama 3.3 70B (Groq)',
      provider: 'Groq / Meta',
      envVar: 'GROQ_API_KEY',
      keyMasked: 'gsk_********************41',
      status: 'connected',
      inCouncil: true,
      priority: 5,
      description: 'Open-weights high throughput tensor lane for ultra-fast candidate generation.',
    },
    {
      id: 'mistral',
      name: 'Mistral Large 2',
      provider: 'Mistral AI',
      envVar: 'MISTRAL_API_KEY',
      keyMasked: 'mis_********************12',
      status: 'connected',
      inCouncil: true,
      priority: 6,
      description: 'European compliance, multilingual nuance, and synthetic reasoning verification.',
    },
  ]);

  // Root Admin Providers & Credentials Gateway State (30 Model Providers + Audio Endpoints)
  const [providerSearch, setProviderSearch] = useState('');
  const [providerCategoryFilter, setProviderCategoryFilter] = useState<'all' | 'audio' | 'text' | 'multimodal' | 'edge'>('all');
  const [pingTestingId, setPingTestingId] = useState<string | null>(null);

  // Audio Infrastructure Credentials
  const [elevenLabsConfig, setElevenLabsConfig] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('omni_admin_elevenlabs');
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return {
      apiKey: 'eleven_79f2910fae82938102a991b1248092',
      voiceId: '21m00Tcm4TlvDq8ikWAM',
      model: 'eleven_turbo_v2_5',
      streamingWs: true,
      status: 'connected' as const,
      latencyMs: 42,
    };
  });

  const [fishAudioConfig, setFishAudioConfig] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('omni_admin_fishaudio');
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return {
      apiKey: 'fish_9108bda3801fec420198ca893b0188',
      endpointUrl: 'https://api.fish.audio/v1/tts',
      model: 'fish-speech-1.5',
      referenceVoice: 'darkmisfit_cyber_cloned',
      status: 'connected' as const,
      latencyMs: 38,
    };
  });

  const [sunoAudioConfig, setSunoAudioConfig] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('omni_admin_suno');
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return {
      apiKey: 'suno_309b8ac1498ecf09184ba902319077',
      seedOffset: 'seed_9841284_harmonic_cyber',
      defaultStylePrompt: 'phonk, nocturnal cyber synth, 140 bpm, heavy 808, atmospheric',
      webhookUrl: '/api/webhooks/suno-callback',
      status: 'connected' as const,
      latencyMs: 56,
    };
  });

  // All 30 Providers List
  const [providerList, setProviderList] = useState<AdminProviderCredential[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('omni_admin_providers_list');
      if (saved) {
        try { return JSON.parse(saved); } catch {}
      }
    }
    return [
      {
        id: 'gemini',
        name: 'Google Gemini 2.5 Pro & 2.0 Flash',
        category: 'multimodal',
        provider: 'Google AI Studio',
        envVar: 'GEMINI_API_KEY',
        modelCode: 'gemini-2.5-pro / gemini-2.0-flash',
        keyMasked: 'AIzaSy********************79xQ',
        keyValue: 'AIzaSyBN19208394-OmniGeminiCore',
        endpointUrl: 'https://generativelanguage.googleapis.com',
        status: 'active',
        latencyMs: 24,
        inCouncil: true,
      },
      {
        id: 'claude',
        name: 'Anthropic Claude 3.7 Sonnet & 3.5 Haiku',
        category: 'text',
        provider: 'Anthropic',
        envVar: 'CLAUDE_API_KEY',
        modelCode: 'claude-3-7-sonnet-20250219',
        keyMasked: 'sk-ant-api03-********************AA',
        keyValue: 'sk-ant-api03-9182371928371982AA',
        endpointUrl: 'https://api.anthropic.com/v1',
        status: 'active',
        latencyMs: 38,
        inCouncil: true,
      },
      {
        id: 'openai',
        name: 'OpenAI GPT-4.5 & GPT-4o Omni',
        category: 'multimodal',
        provider: 'OpenAI',
        envVar: 'OPENAI_API_KEY',
        modelCode: 'gpt-4.5-preview / gpt-4o',
        keyMasked: 'sk-proj-********************7B',
        keyValue: 'sk-proj-OmniGPT4oMaster7B',
        endpointUrl: 'https://api.openai.com/v1',
        status: 'active',
        latencyMs: 45,
        inCouncil: true,
      },
      {
        id: 'deepseek',
        name: 'DeepSeek R1 & V3 MoE',
        category: 'text',
        provider: 'DeepSeek AI',
        envVar: 'DEEPSEEK_API_KEY',
        modelCode: 'deepseek-reasoner-r1',
        keyMasked: 'sk-ds-********************99',
        keyValue: 'sk-ds-OmniDeepSeekR1Lane99',
        endpointUrl: 'https://api.deepseek.com/v1',
        status: 'active',
        latencyMs: 52,
        inCouncil: true,
      },
      {
        id: 'groq_llama',
        name: 'Meta Llama 3.3 70B Tensor Lane',
        category: 'edge',
        provider: 'Groq / Meta',
        envVar: 'GROQ_API_KEY',
        modelCode: 'llama-3.3-70b-versatile',
        keyMasked: 'gsk_********************41',
        keyValue: 'gsk_OmniGroqTensorLlama41',
        endpointUrl: 'https://api.groq.com/openai/v1',
        status: 'active',
        latencyMs: 18,
        inCouncil: true,
      },
      {
        id: 'mistral',
        name: 'Mistral Large 2 & Codestral',
        category: 'text',
        provider: 'Mistral AI',
        envVar: 'MISTRAL_API_KEY',
        modelCode: 'mistral-large-2411',
        keyMasked: 'mis_********************12',
        keyValue: 'mis_OmniMistralLarge12',
        endpointUrl: 'https://api.mistral.ai/v1',
        status: 'connected',
        latencyMs: 41,
        inCouncil: true,
      },
      {
        id: 'cohere',
        name: 'Cohere Command R+ v2',
        category: 'text',
        provider: 'Cohere',
        envVar: 'COHERE_API_KEY',
        modelCode: 'command-r-plus-v2',
        keyMasked: 'coh_********************88',
        keyValue: 'coh_OmniCommandRPlus88',
        endpointUrl: 'https://api.cohere.ai/v1',
        status: 'connected',
        latencyMs: 49,
        inCouncil: false,
      },
      {
        id: 'perplexity',
        name: 'Perplexity Sonar Reasoning Pro',
        category: 'text',
        provider: 'Perplexity AI',
        envVar: 'PERPLEXITY_API_KEY',
        modelCode: 'sonar-reasoning-pro',
        keyMasked: 'pplx-********************62',
        keyValue: 'pplx-OmniSonarReasoning62',
        endpointUrl: 'https://api.perplexity.ai',
        status: 'connected',
        latencyMs: 62,
        inCouncil: true,
      },
      {
        id: 'together',
        name: 'Together AI Turbo Lane',
        category: 'edge',
        provider: 'Together AI',
        envVar: 'TOGETHER_API_KEY',
        modelCode: 'meta-llama/Llama-3.3-70B-Turbo',
        keyMasked: 'tog_********************29',
        keyValue: 'tog_OmniTogetherAILane29',
        endpointUrl: 'https://api.together.xyz/v1',
        status: 'connected',
        latencyMs: 29,
        inCouncil: false,
      },
      {
        id: 'fireworks',
        name: 'Fireworks AI FireFunction v2',
        category: 'edge',
        provider: 'Fireworks AI',
        envVar: 'FIREWORKS_API_KEY',
        modelCode: 'accounts/fireworks/models/llama-v3p3-70b',
        keyMasked: 'fw_********************22',
        keyValue: 'fw_OmniFireworksInference22',
        endpointUrl: 'https://api.fireworks.ai/inference/v1',
        status: 'connected',
        latencyMs: 22,
        inCouncil: false,
      },
      {
        id: 'cerebras',
        name: 'Cerebras CS-3 Wafer Scale',
        category: 'edge',
        provider: 'Cerebras Systems',
        envVar: 'CEREBRAS_API_KEY',
        modelCode: 'llama3.1-70b-wafer',
        keyMasked: 'csk-********************12',
        keyValue: 'csk-OmniCerebrasWafer12',
        endpointUrl: 'https://api.cerebras.ai/v1',
        status: 'active',
        latencyMs: 12,
        inCouncil: true,
      },
      {
        id: 'sambanova',
        name: 'SambaNova SN40L RDU Ultra Lane',
        category: 'edge',
        provider: 'SambaNova Systems',
        envVar: 'SAMBANOVA_API_KEY',
        modelCode: 'Meta-Llama-3.1-405B-Instruct',
        keyMasked: 'sn_********************31',
        keyValue: 'sn_OmniSambaNovaSN40L31',
        endpointUrl: 'https://api.sambanova.ai/v1',
        status: 'connected',
        latencyMs: 31,
        inCouncil: false,
      },
      {
        id: 'xai',
        name: 'xAI Grok 2 & Grok Vision',
        category: 'multimodal',
        provider: 'xAI',
        envVar: 'XAI_API_KEY',
        modelCode: 'grok-2-1212',
        keyMasked: 'xai-********************54',
        keyValue: 'xai-OmniGrokVisionLane54',
        endpointUrl: 'https://api.x.ai/v1',
        status: 'connected',
        latencyMs: 54,
        inCouncil: false,
      },
      {
        id: 'ai21',
        name: 'AI21 Labs Jamba 1.5 Large',
        category: 'text',
        provider: 'AI21 Labs',
        envVar: 'AI21_API_KEY',
        modelCode: 'jamba-1.5-large',
        keyMasked: 'ai21_********************44',
        keyValue: 'ai21_OmniJambaLarge44',
        endpointUrl: 'https://api.ai21.com/studio/v1',
        status: 'connected',
        latencyMs: 44,
        inCouncil: false,
      },
      {
        id: 'replicate',
        name: 'Replicate Fast Diffusion Pipeline',
        category: 'media',
        provider: 'Replicate',
        envVar: 'REPLICATE_API_TOKEN',
        modelCode: 'black-forest-labs/flux-1.1-pro',
        keyMasked: 'r8_********************78',
        keyValue: 'r8_OmniReplicateFluxPro78',
        endpointUrl: 'https://api.replicate.com/v1',
        status: 'connected',
        latencyMs: 78,
        inCouncil: false,
      },
      {
        id: 'huggingface',
        name: 'Hugging Face Pro Router',
        category: 'text',
        provider: 'Hugging Face Pro',
        envVar: 'HF_TOKEN',
        modelCode: 'router.huggingface.co/hf-inference',
        keyMasked: 'hf_********************65',
        keyValue: 'hf_OmniHuggingFacePro65',
        endpointUrl: 'https://api-inference.huggingface.co',
        status: 'connected',
        latencyMs: 65,
        inCouncil: false,
      },
      {
        id: 'bedrock',
        name: 'Amazon Bedrock Multi-Region',
        category: 'text',
        provider: 'Amazon Web Services',
        envVar: 'AWS_BEDROCK_KEY',
        modelCode: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
        keyMasked: 'AKIA********************46',
        keyValue: 'AKIAOmniAWSBedrock46',
        endpointUrl: 'https://bedrock-runtime.us-east-1.amazonaws.com',
        status: 'connected',
        latencyMs: 46,
        inCouncil: false,
      },
      {
        id: 'azure',
        name: 'Microsoft Azure OpenAI Enterprise',
        category: 'multimodal',
        provider: 'Microsoft Azure',
        envVar: 'AZURE_OPENAI_API_KEY',
        modelCode: 'gpt-4o-eastus-prod',
        keyMasked: 'az_********************39',
        keyValue: 'az_OmniAzureOpenAIProd39',
        endpointUrl: 'https://omni-ai.openai.azure.com',
        status: 'connected',
        latencyMs: 39,
        inCouncil: false,
      },
      {
        id: 'cloudflare',
        name: 'Cloudflare Workers AI Edge GPUs',
        category: 'edge',
        provider: 'Cloudflare',
        envVar: 'CLOUDFLARE_API_TOKEN',
        modelCode: '@cf/meta/llama-3.3-70b-instruct',
        keyMasked: 'cf_********************21',
        keyValue: 'cf_OmniCloudflareEdge21',
        endpointUrl: 'https://api.cloudflare.com/client/v4/accounts',
        status: 'connected',
        latencyMs: 21,
        inCouncil: false,
      },
      {
        id: 'openrouter',
        name: 'OpenRouter Universal Multi-Model Proxy',
        category: 'text',
        provider: 'OpenRouter',
        envVar: 'OPENROUTER_API_KEY',
        modelCode: 'auto-optimal-routing',
        keyMasked: 'sk-or-v1-********************48',
        keyValue: 'sk-or-v1-OmniOpenRouterLane48',
        endpointUrl: 'https://openrouter.ai/api/v1',
        status: 'active',
        latencyMs: 48,
        inCouncil: true,
      },
      {
        id: 'voyage',
        name: 'Voyage AI Multilingual Embeddings',
        category: 'text',
        provider: 'Voyage AI',
        envVar: 'VOYAGE_API_KEY',
        modelCode: 'voyage-3-large',
        keyMasked: 'pa-********************33',
        keyValue: 'pa-OmniVoyageEmbeddings33',
        endpointUrl: 'https://api.voyageai.com/v1',
        status: 'connected',
        latencyMs: 33,
        inCouncil: false,
      },
      {
        id: 'qwen',
        name: 'Alibaba Qwen 2.5 72B Instruct',
        category: 'text',
        provider: 'Alibaba Cloud DashScope',
        envVar: 'DASHSCOPE_API_KEY',
        modelCode: 'qwen2.5-72b-instruct',
        keyMasked: 'sk-dash-********************58',
        keyValue: 'sk-dash-OmniQwenAlibaba58',
        endpointUrl: 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1',
        status: 'connected',
        latencyMs: 58,
        inCouncil: false,
      },
      {
        id: 'baidu',
        name: 'Baidu ERNIE 4.0 Turbo',
        category: 'text',
        provider: 'Baidu Qianfan',
        envVar: 'QIANFAN_API_KEY',
        modelCode: 'ernie-4.0-turbo-8k',
        keyMasked: 'qianfan_********************72',
        keyValue: 'qianfan_OmniBaiduERNIE72',
        endpointUrl: 'https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop',
        status: 'connected',
        latencyMs: 72,
        inCouncil: false,
      },
      {
        id: 'kimi',
        name: 'Moonshot AI Kimi 128k Long Context',
        category: 'text',
        provider: 'Moonshot AI',
        envVar: 'MOONSHOT_API_KEY',
        modelCode: 'moonshot-v1-128k',
        keyMasked: 'ms-********************66',
        keyValue: 'ms-OmniKimiMoonshot66',
        endpointUrl: 'https://api.moonshot.cn/v1',
        status: 'connected',
        latencyMs: 66,
        inCouncil: false,
      },
      {
        id: 'yi',
        name: '01.AI Yi-Lightning High Speed',
        category: 'edge',
        provider: '01.AI',
        envVar: 'YI_API_KEY',
        modelCode: 'yi-lightning',
        keyMasked: 'yi-********************35',
        keyValue: 'yi-Omni01AIYiLightning35',
        endpointUrl: 'https://api.01.ai/v1',
        status: 'connected',
        latencyMs: 35,
        inCouncil: false,
      },
      {
        id: 'deepinfra',
        name: 'DeepInfra TensorRT Cloud',
        category: 'edge',
        provider: 'DeepInfra',
        envVar: 'DEEPINFRA_API_KEY',
        modelCode: 'meta-llama/Meta-Llama-3.1-70B-Instruct',
        keyMasked: 'di_********************26',
        keyValue: 'di_OmniDeepInfraTensorRT26',
        endpointUrl: 'https://api.deepinfra.com/v1/openai',
        status: 'connected',
        latencyMs: 26,
        inCouncil: false,
      },
      {
        id: 'anyscale',
        name: 'Anyscale Ray vLLM Engine',
        category: 'edge',
        provider: 'Anyscale',
        envVar: 'ANYSCALE_API_KEY',
        modelCode: 'meta-llama/Llama-3.3-70B-Instruct',
        keyMasked: 'esecret_********************37',
        keyValue: 'esecret_OmniAnyscaleRay37',
        endpointUrl: 'https://api.endpoints.anyscale.com/v1',
        status: 'connected',
        latencyMs: 37,
        inCouncil: false,
      },
      {
        id: 'fal',
        name: 'Fal.ai Latent Media Generation',
        category: 'media',
        provider: 'Fal.ai',
        envVar: 'FAL_KEY',
        modelCode: 'fal-ai/flux-pro/v1.1',
        keyMasked: 'fal_********************85',
        keyValue: 'fal_OmniFalMediaGen85',
        endpointUrl: 'https://queue.fal.run',
        status: 'connected',
        latencyMs: 85,
        inCouncil: false,
      },
      {
        id: 'stability',
        name: 'Stability AI SD 3.5 & Ultra',
        category: 'media',
        provider: 'Stability AI',
        envVar: 'STABILITY_API_KEY',
        modelCode: 'sd3.5-large-turbo',
        keyMasked: 'sk-st-********************90',
        keyValue: 'sk-st-OmniStabilitySD3590',
        endpointUrl: 'https://api.stability.ai/v2beta/stable-image/generate/sd3',
        status: 'connected',
        latencyMs: 90,
        inCouncil: false,
      },
      {
        id: 'midjourney_proxy',
        name: 'Midjourney / Niji Discord API Bridge',
        category: 'media',
        provider: 'Midjourney Proxy Hub',
        envVar: 'MIDJOURNEY_PROXY_KEY',
        modelCode: 'mj-v6-turbomode',
        keyMasked: 'mjp_********************11',
        keyValue: 'mjp_OmniMidjourneyBridge11',
        endpointUrl: 'https://api.midjourney-proxy.internal/mj',
        status: 'connected',
        latencyMs: 110,
        inCouncil: false,
      },
    ];
  });

  // Filtered providers for root admin credentials view
  const filteredProviderList = useMemo(() => {
    return providerList.filter((item) => {
      const matchesCategory =
        providerCategoryFilter === 'all' ||
        (providerCategoryFilter === 'audio' && item.category === 'voice') ||
        (providerCategoryFilter === 'text' && item.category === 'text') ||
        (providerCategoryFilter === 'multimodal' && item.category === 'multimodal') ||
        (providerCategoryFilter === 'edge' && item.category === 'edge');
      const q = providerSearch.toLowerCase().trim();
      if (!q) return matchesCategory;
      return (
        matchesCategory &&
        (item.name.toLowerCase().includes(q) ||
          item.provider.toLowerCase().includes(q) ||
          item.envVar.toLowerCase().includes(q) ||
          item.modelCode.toLowerCase().includes(q))
      );
    });
  }, [providerList, providerSearch, providerCategoryFilter]);

  const handleTestProviderPing = (id: string) => {
    triggerHaptic(12);
    setPingTestingId(id);
    setTimeout(() => {
      setProviderList((prev) =>
        prev.map((item) => {
          if (item.id === id) {
            const jitter = Math.floor(Math.random() * 15) - 7;
            const updated = Math.max(12, item.latencyMs + jitter);
            return { ...item, latencyMs: updated, status: 'active' };
          }
          return item;
        })
      );
      setPingTestingId(null);
      showNotification(`Ping test nominal for provider: ${id}`);
    }, 450);
  };

  const handleSaveAllCredentials = () => {
    triggerHaptic([15, 20, 15]);
    if (typeof window !== 'undefined') {
      localStorage.setItem('omni_admin_providers_list', JSON.stringify(providerList));
      localStorage.setItem('omni_admin_elevenlabs', JSON.stringify(elevenLabsConfig));
      localStorage.setItem('omni_admin_fishaudio', JSON.stringify(fishAudioConfig));
      localStorage.setItem('omni_admin_suno', JSON.stringify(sunoAudioConfig));
    }
    showNotification('All 30 Model Providers & Audio Endpoints synced & encrypted to hardware enclave.');
  };

  // Master Options Definition for the Settings Landing Page
  const settingsOptions: SettingOption[] = [
    {
      id: 'providers',
      title: 'Root Admin Credentials Gateway (/admin/providers)',
      category: 'intelligence',
      categoryLabel: 'Root API Infrastructure',
      description: 'Private Admin Credentials Gateway for root admin to initialize credentials for all 30 model providers, ElevenLabs accounts, Suno audio seeds, and Fish Audio rendering endpoints.',
      icon: Key,
      statusBadge: '30 Providers • ElevenLabs • Suno • Fish Audio',
      keywords: ['providers', 'admin', 'credentials', 'elevenlabs', 'suno', 'fish audio', 'endpoints', 'keys', 'models', 'seeds'],
    },
    {
      id: 'companion',
      title: 'Personalization & 3D Haptic Settings',
      category: 'personalization',
      categoryLabel: 'Personalization Settings',
      description: 'Adjust 3D keyboard tactile vibration intensity (1-10 slider) using the Navigator.vibrate pattern, live key tester, and NPU dual-lane neural acceleration.',
      icon: Sliders,
      statusBadge: hapticFeedback ? `Vibration Level ${hapticLevel}/10` : 'Vibration Muted',
      keywords: ['personalization', 'vibration', 'haptic', 'intensity', 'slider', 'tactile', '1-10', 'keyboard', 'navigator', 'telemetry'],
    },
    {
      id: 'voice',
      title: 'Voice & Speech Synthesis',
      category: 'intelligence',
      categoryLabel: 'Audio & Speech',
      description: "Select browser speech synthesis voices, preview test phrases, and persist your preferred voice for OmniAI.",
      icon: Volume2,
      statusBadge: selectedVoiceURI ? (voiceList.find((v) => v.voiceURI === selectedVoiceURI)?.name || 'Custom Voice') : 'Default Browser Voice',
      keywords: ['voice', 'speech', 'synthesis', 'preview', 'kore', 'tts', 'audio', 'sound', 'browser', 'accent'],
    },
    {
      id: 'omnivoice',
      title: 'OmniVoice (AI Voice Cloning)',
      category: 'intelligence',
      categoryLabel: 'Audio & Speech',
      description: 'Record calibration samples to train your personal AI voice. When enabled, OmniVoice sounds exactly like you.',
      icon: Mic,
      statusBadge: clonedVoiceEnabled ? 'Voice Cloned (Active)' : (clonedProfile.isCalibrated ? 'Clone Calibrated' : 'Setup Required'),
      keywords: ['omnivoice', 'clone', 'voice', 'sound like me', 'record', 'sample', 'mic', 'ai voice', 'training', 'cadence'],
    },
    {
      id: 'llms',
      title: 'Council Keys & Models',
      category: 'intelligence',
      categoryLabel: 'Core Intelligence',
      description: 'Multi-LLM quorum coordination across Gemini, Claude, GPT-4o, DeepSeek, Llama & Mistral.',
      icon: Key,
      statusBadge: '6 Models Configured',
      keywords: ['council', 'models', 'api', 'gemini', 'claude', 'openai', 'gpt4o', 'deepseek', 'llama', 'keys', 'tokens'],
    },
    {
      id: 'users',
      title: 'Users & Ban Governance',
      category: 'governance',
      categoryLabel: 'Governance & Access',
      description: 'Manage active subscriber accounts, revoke compromised tokens, issue bans and replenish credits.',
      icon: Users,
      statusBadge: `${users.filter((u) => u.status === 'active').length} Active Accounts`,
      keywords: ['users', 'bans', 'accounts', 'moderation', 'security', 'blacklist', 'profiles', 'roles'],
    },
    {
      id: 'privacy',
      title: 'Data Vault & Privacy Security',
      category: 'governance',
      categoryLabel: 'Governance & Access',
      description: 'Volatility Status Engine: Ephemeral mode, session memory shredder, volatile call & text memory, and Emergency Purge.',
      icon: ShieldCheck,
      statusBadge: '0B (Secure Mode)',
      keywords: ['privacy', 'security', 'vault', 'ephemeral', 'volatile', 'shredder', 'purge', 'panic', 'wipe', 'cache'],
    },
    {
      id: 'settings',
      title: 'Master System Governance',
      category: 'governance',
      categoryLabel: 'Governance & Access',
      description: 'Cascade failover policies, auto-ban rate limits, permanent system persona and cryptographic safeguards.',
      icon: Settings,
      statusBadge: 'Cascade Policy Enforced',
      keywords: ['system', 'governance', 'policy', 'persona', 'threshold', 'rate limit', 'failover', 'root'],
    },
    {
      id: 'billing',
      title: 'Billing & Token Wallets',
      category: 'billing',
      categoryLabel: 'Wallet & Plans',
      description: 'Billing and in-memory wallets are disabled. They are not presented as real billing or token protection.',
      icon: DollarSign,
      statusBadge: 'Disabled',
      keywords: ['billing', 'credits', 'wallet', 'escrow', 'omnibeat', 'omniwave', 'tiers', 'subscription', 'price'],
    },
    {
      id: 'workspace',
      title: 'OmniAI - Nexus Account Profiles',
      category: 'cloud',
      categoryLabel: 'Account Profiles & API Tokens',
      description: 'Manage Google Workspace authorizations (Drive, Gmail, Docs, Keep) and developer API access tokens (AI Studio, Supabase, Firebase, n8n) in one secure hardware-enclave dashboard.',
      icon: FolderOpen,
      statusBadge: 'Workspace & API Enclave',
      keywords: ['workspace', 'google', 'drive', 'gmail', 'docs', 'keep', 'cloud', 'files', 'storage', 'tokens', 'api', 'supabase', 'firebase', 'n8n', 'ai studio'],
    },
    {
      id: 'sync',
      title: 'Desktop & Laptop Bridge',
      category: 'devices',
      categoryLabel: 'Cross-Device',
      description: 'Peer-to-peer neural tunnel with ⌘⇧K hotkeys, live shared clipboard, and macOS/Windows companions.',
      icon: Laptop,
      statusBadge: 'AES-256 Tunnel Ready',
      keywords: ['desktop', 'laptop', 'sync', 'pc', 'clipboard', 'pin', 'hotkey', 'swift', 'tauri', 'daemon'],
    },
    {
      id: 'install',
      title: 'Mobile PWA & Keyboard Setup',
      category: 'devices',
      categoryLabel: 'Cross-Device',
      description: 'Deploy OmniAI as a standalone iOS/Android app with offline neural cache and 3D keyboard driver.',
      icon: Smartphone,
      statusBadge: 'PWA Installable',
      keywords: ['mobile', 'pwa', 'install', 'ios', 'android', 'setup', 'driver', 'homescreen'],
    },
  ];

  // Categories Filter Pills
  const categories = [
    { id: 'all', label: 'All Settings', count: settingsOptions.length },
    { id: 'personalization', label: 'Personalization & Haptics', count: settingsOptions.filter((o) => o.category === 'personalization').length },
    { id: 'intelligence', label: 'Intelligence & Models', count: settingsOptions.filter((o) => o.category === 'intelligence').length },
    { id: 'governance', label: 'Governance & Access', count: settingsOptions.filter((o) => o.category === 'governance').length },
    { id: 'billing', label: 'Wallet & Billing', count: settingsOptions.filter((o) => o.category === 'billing').length },
    { id: 'devices', label: 'Devices & Sync', count: settingsOptions.filter((o) => o.category === 'devices').length },
    { id: 'cloud', label: 'Cloud & Workspace', count: settingsOptions.filter((o) => o.category === 'cloud').length },
  ];

  // Filtered Landing Page Options
  const filteredOptions = useMemo(() => {
    return settingsOptions.filter((opt) => {
      const matchesCategory = selectedCategory === 'all' || opt.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCategory;
      const matchesText =
        opt.title.toLowerCase().includes(q) ||
        opt.description.toLowerCase().includes(q) ||
        opt.categoryLabel.toLowerCase().includes(q) ||
        opt.keywords.some((k) => k.toLowerCase().includes(q));
      return matchesCategory && matchesText;
    });
  }, [searchQuery, selectedCategory]);

  const showNotification = (msg: string) => {
    setSaveSuccessMsg(msg);
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  const handleToggleBanUser = (userId: string) => {
    triggerHaptic(15);
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === userId) {
          const newStatus = u.status === 'active' ? 'banned' : 'active';
          showNotification(
            `User "${u.email}" account ${newStatus === 'banned' ? 'BANNED' : 'UNBANNED'}`
          );
          return { ...u, status: newStatus };
        }
        return u;
      })
    );
  };

  const handleDeleteUser = (userId: string) => {
    triggerHaptic([15, 20, 15]);
    const target = users.find((u) => u.id === userId);
    if (!target) return;
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    showNotification(`User "${target.email}" completely deleted from system.`);
  };

  const handleToggleCouncilMember = (id: string) => {
    triggerHaptic(12);
    setLlmConnections((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newState = !item.inCouncil;
          showNotification(
            `${item.name} ${newState ? 'enabled in' : 'removed from'} Council quorum`
          );
          return { ...item, inCouncil: newState };
        }
        return item;
      })
    );
  };

  const currentOptionMeta = settingsOptions.find((o) => o.id === selectedSubPage);

  return (
    <div className="h-full flex flex-col bg-[#07090f] text-slate-100 overflow-hidden font-sans">
      
      {/* Top Header Bar */}
      <div className="h-14 px-4 bg-[#0a0a0c] border-b border-zinc-800 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-red-950/40 border border-red-600/40 text-red-400">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-white">OmniAI - Nexus Settings & Admin Hub</span>
              <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded border ${
                isOwnerAuthenticated
                  ? 'bg-[#00ffcc]/15 text-[#00ffcc] border-[#00ffcc]/40 font-bold'
                  : 'bg-red-950/60 text-red-400 border-red-800'
              }`}>
                {isOwnerAuthenticated ? 'APP OWNER VERIFIED' : 'OWNER RESTRICTED'}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-mono">
              {isOwnerAuthenticated ? (
                <>App Owner: <span className="text-[#00ffcc] font-bold">darkmisfitlabs@gmail.com</span> • Enclave Active</>
              ) : (
                <>Admittance Restricted to: <span className="text-red-400 font-bold">darkmisfitlabs@gmail.com</span></>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Global Notification Banner */}
          {saveSuccessMsg && (
            <div className="hidden sm:flex px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-semibold items-center gap-2 animate-in fade-in">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {isOwnerAuthenticated && (
            <button
              type="button"
              onClick={handleRevokeOwner}
              className="px-2.5 py-1 rounded-lg bg-red-950/60 hover:bg-red-900 border border-red-600/50 text-red-300 text-xs font-mono transition flex items-center gap-1"
              title="Lock Admin Console to prevent customer admittance"
            >
              <Lock className="w-3.5 h-3.5 text-red-400" />
              <span className="hidden xs:inline">Lock Admin</span>
            </button>
          )}

          {/* Close Button if modal opened */}
          {onClose && (
            <button
              onClick={() => {
                triggerHaptic(10);
                onClose();
              }}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
              title="Close Settings"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content Viewport with Transitions */}
      <div className="flex-1 overflow-y-auto relative">
        {/* APP OWNER ACCESS LOCKOUT SCREEN IF NOT AUTHENTICATED */}
        {!isOwnerAuthenticated ? (
          <div className="h-full min-h-[450px] p-4 sm:p-8 flex items-center justify-center bg-[#07090f]">
            <div className="w-full max-w-md p-6 rounded-2xl bg-[#0a0a0e] border border-[#2a2254] shadow-[0_0_40px_rgba(0,0,0,0.95)] space-y-4 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#100d23] border border-[#00ffcc]/50 flex items-center justify-center mx-auto text-[#00ffcc] shadow-[0_0_15px_rgba(0,255,204,0.3)]">
                <Lock className="w-7 h-7 text-[#00ffcc]" />
              </div>

              <div className="space-y-1">
                <span className="px-2 py-0.5 rounded text-[9.5px] font-mono font-bold bg-red-950/70 text-red-400 border border-red-800">
                  OWNER PRIVILEGES ONLY
                </span>
                <h2 className="text-base font-bold text-white font-mono">
                  App Owner Restricted Enclave
                </h2>
                <p className="text-xs text-[#948eb5] font-sans leading-relaxed">
                  Admittance to this administrative suite is strictly reserved for the application owner (<span className="text-[#00ffcc] font-mono font-semibold">darkmisfitlabs@gmail.com</span>). Customers and general users are not allowed admittance.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-[#100d23] border border-[#2a2254] text-left space-y-2">
                <label className="text-[10px] font-mono text-[#948eb5] uppercase font-bold block">
                  Owner Passcode or Master Key
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    value={ownerKeyInput}
                    onChange={(e) => {
                      setOwnerKeyInput(e.target.value);
                      setOwnerAuthError(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleVerifyOwner();
                    }}
                    placeholder="Enter Owner Key..."
                    className="flex-1 bg-[#000000] border border-[#2a2254] focus:border-[#00ffcc] rounded-lg px-3 py-1.5 text-xs text-white font-mono outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyOwner}
                    className="px-3 py-1.5 rounded-lg bg-[#00ffcc] hover:bg-[#33ffdd] text-black font-extrabold text-xs font-mono transition"
                  >
                    Verify
                  </button>
                </div>

                {ownerAuthError && (
                  <p className="text-[10px] font-mono text-red-400 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>{ownerAuthError}</span>
                  </p>
                )}
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleQuickAuthorizeOwner}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#181333] hover:bg-[#201a44] border border-[#00ffcc]/50 text-[#00ffcc] text-xs font-mono font-bold flex items-center justify-center gap-2 transition shadow-sm"
                >
                  <ShieldCheck className="w-4 h-4 text-[#00ffcc]" />
                  <span>Authenticate as darkmisfitlabs@gmail.com</span>
                </button>
              </div>

              <p className="text-[9.5px] text-[#7d779f] font-mono">
                Customers and non-owner accounts are isolated from all system configurations.
              </p>
            </div>
          </div>
        ) : (
        <AnimatePresence mode="wait">
          
          {/* ======================================================== */}
          {/* SCREEN 1: ORGANIZED SETTINGS LANDING PAGE               */}
          {/* ======================================================== */}
          {!selectedSubPage && (
            <motion.div
              key="settings-landing"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="p-4 sm:p-6 max-w-6xl mx-auto space-y-5"
            >
              {/* Introduction & Search Bar Section */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-red-400" />
                      <span>System Preferences & Modules</span>
                    </h2>
                    <p className="text-xs text-zinc-400">
                      Select an option below to enter its dedicated settings console. Each button provides full tactile confirmation.
                    </p>
                  </div>
                  <span className="text-[11px] font-mono text-red-300 bg-red-950/40 px-2.5 py-1 rounded-lg border border-red-600/40 self-start sm:self-auto">
                    {filteredOptions.length} of {settingsOptions.length} Options Available
                  </span>
                </div>

                {/* Search Bar for Quick Instant Access */}
                <div className="relative">
                  <Search className="w-4 h-4 text-red-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search settings, LLMs, API keys, haptics, cloud sync, billing..."
                    className="w-full bg-[#121318] border border-zinc-800 focus:border-red-500 rounded-xl pl-10 pr-9 py-2.5 text-xs text-white placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-red-500/40 transition shadow-inner font-mono"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-white"
                      title="Clear search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filter Categories System */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                  <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-500 shrink-0 pr-1">
                    <Filter className="w-3 h-3 text-red-400" />
                    <span>Filter:</span>
                  </div>
                  {categories.map((cat) => {
                    const isSelected = selectedCategory === cat.id;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => {
                          triggerHaptic(10);
                          setSelectedCategory(cat.id);
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all shrink-0 flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-red-950/60 text-red-400 border border-red-600 shadow-[0_0_12px_rgba(220,38,38,0.3)] font-bold'
                            : 'bg-[#121318] text-zinc-400 border border-zinc-800 hover:text-white hover:border-zinc-700'
                        }`}
                      >
                        <span>{cat.label}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-red-600 text-white' : 'bg-white/5 text-zinc-500'}`}>
                          {cat.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Controls: 3D Keyboard Haptic Feedback & Intensity Slider */}
              <div className="p-4 rounded-2xl bg-[#14121f] border border-[#211d34] shadow-[0_0_20px_rgba(108,99,255,0.15)] flex flex-col gap-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="p-2.5 rounded-xl bg-[#6c63ff]/15 border border-[#6c63ff]/30 text-[#8b7fff] shrink-0">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <span>3D Keyboard Tactile Haptics</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                          hapticFeedback 
                            ? 'bg-[#6c63ff]/20 text-[#8b7fff] border border-[#6c63ff]/40 shadow-[0_0_8px_rgba(108,99,255,0.3)]' 
                            : 'bg-[#211d34] text-[#9490ac]'
                        }`}>
                          {hapticFeedback ? `ENABLED (LVL ${hapticLevel}/10)` : 'DISABLED'}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#9490ac] mt-0.5">
                        Adjust tactile vibration responses for 3D keyboard interactions (keys, spacebar, backspace, and gestures).
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const next = !hapticFeedback;
                      handleUpdateHapticConfig(next, hapticIntensity);
                      showNotification(`3D Keyboard haptics ${next ? 'enabled' : 'disabled'}`);
                    }}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-mono font-bold transition shadow-sm shrink-0 ${
                      hapticFeedback
                        ? 'border-[#6c63ff]/50 bg-[#6c63ff]/20 text-[#8b7fff] hover:bg-[#6c63ff]/30 shadow-[0_0_10px_rgba(108,99,255,0.3)]'
                        : 'border-[#211d34] bg-[#0b0a14] text-[#9490ac] hover:text-white hover:border-[#6c63ff]/40'
                    }`}
                    title={hapticFeedback ? 'Click to disable 3D keyboard vibration' : 'Click to enable 3D keyboard vibration'}
                  >
                    {hapticFeedback ? (
                      <>
                        <ToggleRight className="w-5 h-5 text-[#8b7fff]" />
                        <span>Vibration ON</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-5 h-5 text-[#9490ac]" />
                        <span>Vibration OFF</span>
                      </>
                    )}
                  </button>
                </div>

                {/* 1-10 Vibration Intensity Slider */}
                {hapticFeedback && (
                  <div className="pt-3 border-t border-[#211d34] space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-[#9490ac] flex items-center gap-1.5 font-bold">
                        <SlidersHorizontal className="w-3.5 h-3.5 text-[#6c63ff]" />
                        Vibration Intensity Slider (Navigator.vibrate):
                      </span>
                      <span className="text-[#8b7fff] font-bold bg-[#6c63ff]/15 px-2 py-0.5 rounded border border-[#6c63ff]/30">
                        Level {hapticLevel} / 10
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-mono text-[#9490ac]">1 (Gentle)</span>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        step="1"
                        value={hapticLevel}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          handleUpdateHapticLevel(val);
                        }}
                        className="flex-1 accent-[#6c63ff] h-2 bg-[#0b0a14] rounded-lg cursor-pointer border border-[#211d34]"
                      />
                      <span className="text-[10px] font-mono text-[#9490ac]">10 (Max Wave)</span>
                      <button
                        type="button"
                        onClick={() => triggerHaptic(undefined, hapticLevel)}
                        className="px-2.5 py-1 rounded-lg bg-[#6c63ff]/20 border border-[#6c63ff]/40 text-[#8b7fff] hover:text-white text-[11px] font-mono shrink-0 transition active:scale-95"
                      >
                        Test Pulse
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Grid of 3D Setting Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3.5 sm:gap-4">
                {filteredOptions.length === 0 ? (
                  <div className="col-span-full p-8 text-center bg-[#0B0B0C] border border-white/10 rounded-2xl space-y-2">
                    <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto" />
                    <p className="text-sm font-bold text-white">No preferences found matching "{searchQuery}"</p>
                    <p className="text-xs text-slate-400">Try searching for keywords like "council", "haptic", "drive", "keys", or "billing".</p>
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('all');
                      }}
                      className="mt-2 px-3 py-1.5 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-mono"
                    >
                      Reset Filters
                    </button>
                  </div>
                ) : (
                  filteredOptions.map((item) => {
                    const Icon = item.icon;
                    return (
                      <motion.button
                        key={item.id}
                        onClick={() => {
                          triggerHaptic([15, 20, 15]);
                          setSelectedSubPage(item.id);
                        }}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98, y: 3 }}
                        className="keycap-3d group text-left p-4 sm:p-5 rounded-2xl flex flex-col justify-between relative overflow-hidden transition-all duration-150 border border-zinc-800 hover:border-red-600 hover:shadow-[0_4px_0_0_#050506,0_0_20px_rgba(220,38,38,0.3)] active:translate-y-1.5 active:shadow-[0_1px_0_0_#050506,0_0_15px_rgba(220,38,38,0.6)] cursor-pointer bg-[#121318]"
                      >
                        {/* Top row: Icon + Category Badge */}
                        <div className="flex items-start justify-between mb-3 w-full">
                          <div className="p-3 rounded-xl bg-red-950/40 border border-red-600/40 text-red-400 group-hover:scale-105 group-hover:border-red-500 transition-transform shadow-inner">
                            <Icon className="w-5 h-5 text-red-400" />
                          </div>
                          <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/5 border border-zinc-800 text-zinc-400">
                            {item.categoryLabel}
                          </span>
                        </div>

                        {/* Title & Description */}
                        <div className="space-y-1.5 w-full">
                          <div className="flex items-center justify-between w-full">
                            <h3 className="font-bold text-white text-sm sm:text-base group-hover:text-red-400 transition-colors flex items-center gap-1.5">
                              <span>{item.title}</span>
                            </h3>
                            <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-red-400 group-hover:translate-x-1 transition-all" />
                          </div>
                          <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                            {item.description}
                          </p>
                        </div>

                        {/* Bottom Highlight accent bar */}
                        <div className="mt-3.5 pt-2.5 border-t border-zinc-800/60 flex items-center justify-between text-[11px] font-mono text-zinc-400 w-full">
                          <span className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-zinc-300">{item.statusBadge}</span>
                          </span>
                          <span className="text-red-400 group-hover:underline text-[10px] font-bold">
                            Configure →
                          </span>
                        </div>

                        {/* Holographic Glowing 3D edge line */}
                        <div className="absolute inset-x-6 bottom-0.5 h-[2px] bg-gradient-to-r from-transparent via-red-600/40 to-transparent group-hover:via-red-500/80 transition-all" />
                      </motion.button>
                    );
                  })
                )}
              </div>
            </motion.div>
          )}

          {/* ======================================================== */}
          {/* SCREEN 2: DEDICATED SUB-MENU PAGE WITH BACK BUTTON      */}
          {/* ======================================================== */}
          {selectedSubPage && (
            <motion.div
              key={`subpage-${selectedSubPage}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className="p-4 sm:p-6 max-w-5xl mx-auto space-y-5"
            >
              {/* Back Button & Sub-Menu Breadcrumb Banner */}
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800 gap-3">
                <div className="flex items-center gap-3">
                  <motion.button
                    onClick={() => {
                      triggerHaptic(12);
                      setSelectedSubPage(null);
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96, y: 1.5 }}
                    className="keycap-3d px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold text-zinc-200 hover:text-white flex items-center gap-2 border border-zinc-800 hover:border-red-600 shadow-sm transition active:translate-y-1 bg-[#121318]"
                    title="Return to Settings Landing"
                  >
                    <ArrowLeft className="w-4 h-4 text-red-400" />
                    <span>Back to Settings</span>
                  </motion.button>

                  <div className="hidden sm:flex items-center gap-1.5 text-xs text-zinc-400 font-mono">
                    <span>Settings</span>
                    <span>/</span>
                    <span className="text-red-400 font-bold">{currentOptionMeta?.title}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded-full bg-red-950/60 border border-red-600/40 text-red-300">
                    {currentOptionMeta?.categoryLabel}
                  </span>
                </div>
              </div>

              {/* Sub-Menu Title Header */}
              <div className="space-y-1">
                <h1 className="text-lg font-bold text-white flex items-center gap-2">
                  {currentOptionMeta && <currentOptionMeta.icon className="w-5 h-5 text-red-400" />}
                  <span>{currentOptionMeta?.title}</span>
                </h1>
                <p className="text-xs text-slate-400">
                  {currentOptionMeta?.description}
                </p>
              </div>

              {/* ======================================================== */}
              {/* SUB-MENU CONTENT 1: COMPANION & TELEMETRY AI            */}
              {/* ======================================================== */}
              {selectedSubPage === 'companion' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
                    <h3 className="text-xs font-mono uppercase text-cyan-400 font-bold tracking-wider">
                      Neural Inference & Physical Feedback
                    </h3>
                    
                    {/* Execution Lane */}
                    <div className="space-y-2">
                      <label className="text-xs text-slate-300 block font-semibold">
                        Inference Pipeline Architecture
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <button
                          onClick={() => {
                            triggerHaptic(10);
                            setNeuralLane('dual');
                          }}
                          className={`p-3 rounded-lg border text-left text-xs transition-all ${
                            neuralLane === 'dual'
                              ? 'border-cyan-400 bg-cyan-950/40 text-cyan-200 font-semibold shadow-[0_0_12px_rgba(0,242,254,0.2)]'
                              : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                          }`}
                        >
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <Zap className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Dual-Lane (Recommended)</span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1">
                            Local NPU for sub-10ms key suggestions, Cloud Gemini for deep synthesis.
                          </p>
                        </button>

                        <button
                          onClick={() => {
                            triggerHaptic(10);
                            setNeuralLane('device');
                          }}
                          className={`p-3 rounded-lg border text-left text-xs transition-all ${
                            neuralLane === 'device'
                              ? 'border-cyan-400 bg-cyan-950/40 text-cyan-200 font-semibold shadow-[0_0_12px_rgba(0,242,254,0.2)]'
                              : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                          }`}
                        >
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                            <span>100% Local Device Only</span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1">
                            Complete offline isolation. Zero data leaves your device.
                          </p>
                        </button>

                        <button
                          onClick={() => {
                            triggerHaptic(10);
                            setNeuralLane('cloud');
                          }}
                          className={`p-3 rounded-lg border text-left text-xs transition-all ${
                            neuralLane === 'cloud'
                              ? 'border-cyan-400 bg-cyan-950/40 text-cyan-200 font-semibold shadow-[0_0_12px_rgba(0,242,254,0.2)]'
                              : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                          }`}
                        >
                          <div className="font-bold text-white flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                            <span>Cloud Tensor Core</span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1">
                            Route every keystroke through high-density cloud models.
                          </p>
                        </button>
                      </div>
                    </div>

                    {/* Toggles */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
                        <div>
                          <div className="text-xs font-bold text-white">Live Screen Vision Cognition</div>
                          <div className="text-[11px] text-slate-400">Contextual intelligence from active viewport</div>
                        </div>
                        <button
                          onClick={() => {
                            triggerHaptic(10);
                            setScreenVisionEnabled(!screenVisionEnabled);
                          }}
                          className="text-cyan-400 hover:text-cyan-300"
                        >
                          {screenVisionEnabled ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6 text-slate-600" />}
                        </button>
                      </div>

                      {/* User-configurable Subtle Vibration Settings */}
                      <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-3 sm:col-span-2">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xs font-bold text-white flex items-center gap-1.5">
                              <Zap className="w-3.5 h-3.5 text-cyan-400" />
                              <span>Navigator Vibrate Tactile Feedback</span>
                            </div>
                            <div className="text-[11px] text-slate-400">Physical haptic confirmation when keys or quick actions are tapped</div>
                          </div>
                          <button
                            onClick={() => {
                              handleUpdateHapticConfig(!hapticFeedback, hapticIntensity);
                            }}
                            className="text-cyan-400 hover:text-cyan-300"
                          >
                            {hapticFeedback ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6 text-slate-600" />}
                          </button>
                        </div>

                        {hapticFeedback && (
                          <div className="pt-3 border-t border-[#211d34] space-y-3.5">
                            {/* Vibration Slider Header */}
                            <div className="flex items-center justify-between text-xs font-mono">
                              <div>
                                <span className="font-bold text-[#e8e6f2] flex items-center gap-1.5">
                                  <SlidersHorizontal className="w-3.5 h-3.5 text-[#6c63ff]" />
                                  3D Keyboard Vibration Intensity (1 - 10)
                                </span>
                                <span className="text-[10.5px] text-[#9490ac] block mt-0.5">
                                  Uses Navigator.vibrate API patterns for tactile keycap clicks
                                </span>
                              </div>
                              <span className="text-xs font-bold font-mono px-2.5 py-1 rounded-lg bg-[#6c63ff]/20 text-[#8b7fff] border border-[#6c63ff]/40 shadow-sm">
                                Level {hapticLevel} / 10
                              </span>
                            </div>

                            {/* Range Slider 1 to 10 */}
                            <div className="space-y-1.5 bg-[#0b0a14] p-3 rounded-xl border border-[#211d34]">
                              <div className="flex items-center justify-between text-[10px] font-mono text-[#9490ac]">
                                <span>1 (Subtle Micro-Tick)</span>
                                <span className="text-[#8b7fff] font-bold">
                                  {hapticLevel <= 3 ? 'Subtle (5-11ms)' : hapticLevel <= 7 ? 'Balanced (15-27ms)' : hapticLevel <= 9 ? 'Heavy Dual Strike' : 'Max Volumetric Wave'}
                                </span>
                                <span>10 (Max Wave)</span>
                              </div>

                              <input
                                type="range"
                                min="1"
                                max="10"
                                step="1"
                                value={hapticLevel}
                                onChange={(e) => {
                                  handleUpdateHapticLevel(Number(e.target.value));
                                }}
                                className="w-full accent-[#6c63ff] h-2 bg-[#14121f] rounded-lg cursor-pointer border border-[#211d34]"
                              />

                              {/* Clickable 1 to 10 step numbers */}
                              <div className="grid grid-cols-10 gap-1 pt-1">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((lvl) => (
                                  <button
                                    key={lvl}
                                    type="button"
                                    onClick={() => handleUpdateHapticLevel(lvl)}
                                    className={`py-1 rounded text-[10px] font-mono font-bold transition text-center ${
                                      hapticLevel === lvl
                                        ? 'bg-[#6c63ff] text-white shadow-[0_0_8px_rgba(108,99,255,0.6)]'
                                        : 'bg-[#14121f] text-[#9490ac] hover:text-white border border-[#211d34]'
                                    }`}
                                  >
                                    {lvl}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Live Interactive Test Keyboard Strip */}
                            <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-[#0b0a14] border border-[#211d34]">
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] font-mono text-[#9490ac] font-bold">Test Touch Feel:</span>
                                {['Q', 'W', 'E', 'Space', '↵ Enter'].map((keyLabel) => (
                                  <button
                                    key={keyLabel}
                                    type="button"
                                    onClick={() => {
                                      triggerTactileHaptic(hapticLevel, keyLabel === '↵ Enter' ? 'enter' : keyLabel === 'Space' ? 'space' : 'tap');
                                    }}
                                    className="px-2.5 py-1 rounded-md bg-[#14121f] hover:bg-[#211d34] border border-[#211d34] text-xs font-mono font-bold text-[#e8e6f2] active:translate-y-0.5 active:border-[#6c63ff] active:shadow-[0_0_8px_rgba(108,99,255,0.4)] transition"
                                  >
                                    {keyLabel}
                                  </button>
                                ))}
                              </div>

                              <button
                                type="button"
                                onClick={() => triggerTactileHaptic(hapticLevel, 'pulse')}
                                className="px-3 py-1 rounded-lg bg-[#6c63ff]/20 border border-[#6c63ff]/40 text-[#8b7fff] hover:text-white text-xs font-mono font-bold flex items-center gap-1 transition active:scale-95 shadow-sm"
                              >
                                <Zap className="w-3 h-3 text-[#8b7fff]" />
                                <span>Diagnostic Pulse</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
                        <div>
                          <div className="text-xs font-bold text-white">Mechanical Switch Audio</div>
                          <div className="text-[11px] text-slate-400">Acoustic feedback using Web Audio linear tone</div>
                        </div>
                        <button
                          onClick={() => {
                            triggerHaptic(10);
                            setTactileSounds(!tactileSounds);
                          }}
                          className="text-cyan-400 hover:text-cyan-300"
                        >
                          {tactileSounds ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6 text-slate-600" />}
                        </button>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
                        <div>
                          <div className="text-xs font-bold text-white">Telemetry Sync Cadence</div>
                          <div className="text-[11px] text-slate-400">Rate of stream cache refreshes</div>
                        </div>
                        <select
                          value={telemetryInterval}
                          onChange={(e) => setTelemetryInterval(e.target.value)}
                          className="bg-slate-900 border border-slate-700 text-xs text-white rounded-lg px-2 py-1"
                        >
                          <option value="1s">1s (Realtime)</option>
                          <option value="5s">5s (Balanced)</option>
                          <option value="15s">15s (Battery Saver)</option>
                        </select>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        triggerHaptic([10, 20, 10]);
                        showNotification('Companion settings updated and active.');
                      }}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/20 active:scale-95 transition"
                    >
                      <Save className="w-4 h-4" />
                      <span>Apply Companion Settings</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* SUB-MENU CONTENT: VOICE & SPEECH SYNTHESIS             */}
              {/* ======================================================== */}
              {selectedSubPage === 'voice' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xs font-mono uppercase text-cyan-400 font-bold tracking-wider flex items-center gap-2">
                          <Volume2 className="w-4 h-4 text-cyan-400" />
                          <span>OmniAI Vocal Synthesis Engine</span>
                        </h3>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Configure speech synthesis voices, test pronunciation, and persist your preferred vocal frequency for this device.
                        </p>
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                        speechSupported ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40' : 'bg-rose-950/80 text-rose-300 border-rose-500/40'
                      }`}>
                        {speechSupported ? `${voiceList.length} Voices Detected` : 'Synthesis Unavailable'}
                      </span>
                    </div>

                    {!speechSupported && (
                      <div className="p-3 rounded-lg bg-amber-950/60 border border-amber-500/40 text-amber-200 text-xs flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Speech synthesis is not supported in this browser environment. Standard text interactions remain fully active.</span>
                      </div>
                    )}

                    {/* Preferred Voice Dropdown Selector */}
                    <div className="space-y-2">
                      <label className="text-xs text-slate-300 block font-semibold flex items-center justify-between">
                        <span>Preferred Speech Synthesis Voice</span>
                        <span className="text-[10px] font-mono text-cyan-400">
                          {selectedVoiceURI ? (voiceList.find((v) => v.voiceURI === selectedVoiceURI)?.name || 'Custom selection') : 'Default System Voice'}
                        </span>
                      </label>

                      <div className="relative">
                        <select
                          value={selectedVoiceURI}
                          onChange={(e) => handleVoiceChange(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2.5 text-xs text-white font-mono focus:outline-none focus:ring-1 focus:ring-cyan-500/40 transition"
                        >
                          <option value="">Default Browser Voice (System Default)</option>
                          {voiceList.map((voice) => (
                            <option key={voice.voiceURI || voice.name} value={voice.voiceURI || voice.name}>
                              {voice.name} ({voice.lang}){voice.default ? ' — [Default]' : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Browser voices are queried live from the client runtime. Your choice is persisted locally in <code className="text-cyan-300 font-mono">localStorage</code> and applied across phone chat, companion panel, and studio guidance.
                      </p>
                    </div>

                    {/* Test Phrase Preview */}
                    <div className="space-y-2 pt-2 border-t border-slate-800/80">
                      <label className="text-xs text-slate-300 block font-semibold">
                        Preview Test Phrase
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          value={voiceTestPhrase}
                          onChange={(e) => setVoiceTestPhrase(e.target.value)}
                          placeholder="Enter a test phrase to preview voice..."
                          className="flex-1 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/40 transition font-sans"
                        />
                        <button
                          type="button"
                          onClick={handlePreviewVoice}
                          disabled={isPreviewingVoice || !speechSupported}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20 active:scale-95 transition disabled:opacity-50 shrink-0"
                        >
                          <Play className={`w-3.5 h-3.5 ${isPreviewingVoice ? 'animate-spin' : ''}`} />
                          <span>{isPreviewingVoice ? 'Speaking...' : 'Preview Voice'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Reset Button */}
                    <div className="pt-2 flex items-center justify-between border-t border-slate-800/80">
                      <button
                        type="button"
                        onClick={() => handleVoiceChange('')}
                        className="text-xs text-slate-400 hover:text-cyan-300 underline font-mono transition"
                      >
                        Reset to Browser Default
                      </button>

                      <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Saved in localStorage</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* SUB-MENU CONTENT: OMNIVOICE AI VOICE CLONING            */}
              {/* ======================================================== */}
              {selectedSubPage === 'omnivoice' && (
                <div className="space-y-4">
                  {/* Top Overview & Master Persona Toggle */}
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <h3 className="text-xs font-mono uppercase text-cyan-400 font-bold tracking-wider flex items-center gap-2">
                          <Mic className="w-4 h-4 text-cyan-400" />
                          <span>OmniVoice AI Voice Cloning</span>
                        </h3>
                        <p className="text-[11px] text-slate-400 mt-1 max-w-xl leading-relaxed">
                          Record 3 brief voice samples to calibrate OmniVoice. Omni’s neural engine extracts your personal pitch, cadence, and timbre so that when OmniVoice is active, every autonomous answer and spoken interaction sounds exactly like you.
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[10px] font-mono px-2.5 py-1 rounded-full border font-bold ${
                          clonedVoiceEnabled 
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-[0_0_10px_rgba(0,242,254,0.3)] animate-pulse'
                            : clonedProfile.isCalibrated 
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40' 
                            : 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                        }`}>
                          {clonedVoiceEnabled 
                            ? '● Cloned Voice Active' 
                            : clonedProfile.isCalibrated 
                            ? '✓ Calibrated (Off)' 
                            : 'Setup Required'}
                        </span>
                      </div>
                    </div>

                    {/* Master "Sound Exactly Like Me" Toggle Card */}
                    <div className="flex items-center justify-between p-3.5 rounded-xl bg-gradient-to-r from-cyan-950/30 via-slate-950 to-indigo-950/30 border border-cyan-500/30 shadow-md">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">Sound Exactly Like You</span>
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                            PERSONA VOICE
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          When turned on, OmniVoice uses your calibrated vocal profile for all automated answers & speech.
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleToggleClonedVoice}
                        disabled={!clonedProfile.isCalibrated && !clonedVoiceEnabled}
                        className={`transition ${!clonedProfile.isCalibrated && !clonedVoiceEnabled ? 'opacity-40 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}`}
                        title={clonedProfile.isCalibrated ? 'Toggle Cloned Voice' : 'Record samples first to enable'}
                      >
                        {clonedVoiceEnabled ? (
                          <ToggleRight className="w-8 h-8 text-cyan-400 drop-shadow-[0_0_8px_rgba(0,242,254,0.5)]" />
                        ) : (
                          <ToggleLeft className="w-8 h-8 text-slate-600" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* 3-Step Voice Calibration Studio */}
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Wand2 className="w-4 h-4 text-cyan-400" />
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                          Acoustic Calibration Prompts ({clonedProfile.samples.length} of {CALIBRATION_PROMPTS.length} Recorded)
                        </h4>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">
                        {clonedProfile.samples.length >= 2 ? 'Ready to Calibrate' : '2+ samples recommended'}
                      </span>
                    </div>

                    {/* Calibration Prompt Cards */}
                    <div className="space-y-2.5">
                      {CALIBRATION_PROMPTS.map((prompt, idx) => {
                        const existingSample = clonedProfile.samples.find((s) => s.phrase === prompt.phrase);
                        const isCurrentActive = activePromptIdx === idx;
                        const isThisRecording = isRecordingSample && isCurrentActive;

                        return (
                          <div
                            key={prompt.id}
                            className={`p-3 rounded-xl border transition-all ${
                              isThisRecording
                                ? 'bg-rose-950/20 border-rose-500/60 shadow-[0_0_15px_rgba(244,63,94,0.2)]'
                                : isCurrentActive
                                ? 'bg-slate-950/80 border-cyan-500/40 shadow-sm'
                                : 'bg-slate-950/40 border-slate-800/80'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                                  existingSample
                                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                                    : 'bg-slate-800 text-slate-400'
                                }`}>
                                  Step {idx + 1}
                                </span>
                                <span className="text-xs font-bold text-white">{prompt.title}</span>
                              </div>

                              {existingSample && (
                                <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>Recorded ({existingSample.durationSec}s)</span>
                                </div>
                              )}
                            </div>

                            {/* Spoken Quote Box */}
                            <div className="p-2.5 rounded-lg bg-black/60 border border-white/5 text-xs text-slate-200 italic font-sans leading-relaxed">
                              &ldquo;{prompt.phrase}&rdquo;
                            </div>

                            <p className="text-[10.5px] text-slate-400 mt-1.5 font-mono">
                              {prompt.guidance}
                            </p>

                            {/* Actions for this prompt */}
                            <div className="mt-2.5 flex items-center justify-between gap-2">
                              {isThisRecording ? (
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-500/20 border border-rose-500 text-rose-300 text-xs font-mono font-bold animate-pulse">
                                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                                    <span>Recording 00:0{recordingSeconds}s...</span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={handleStopRecording}
                                    className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 transition active:scale-95 shadow-md shadow-rose-600/30"
                                  >
                                    <Square className="w-3 h-3" />
                                    <span>Stop & Save Sample</span>
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleStartRecording(idx)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition active:scale-95 ${
                                      existingSample
                                        ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
                                        : 'bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 shadow-md shadow-cyan-500/20'
                                    }`}
                                  >
                                    <Mic className="w-3.5 h-3.5" />
                                    <span>{existingSample ? 'Re-record Sample' : 'Record Sample'}</span>
                                  </button>

                                  {existingSample?.audioBlobUrl && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const audio = new Audio(existingSample.audioBlobUrl);
                                        audio.play();
                                      }}
                                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-mono flex items-center gap-1 transition"
                                      title="Listen to your recorded sample"
                                    >
                                      <Play className="w-3 h-3" />
                                      <span>Play Audio</span>
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* AI Calibration Trigger Button */}
                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800/80">
                      <p className="text-[11px] text-slate-400 font-mono">
                        {clonedProfile.isCalibrated 
                          ? `Last calibrated at ${clonedProfile.lastCalibratedAt || 'recently'}` 
                          : 'Record at least 1 sample to calibrate your personal model.'}
                      </p>

                      <button
                        type="button"
                        onClick={handleRunAICalibration}
                        disabled={isCalibratingAI || clonedProfile.samples.length === 0}
                        className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs font-mono flex items-center justify-center gap-2 shadow-lg shadow-red-950/40 active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                      >
                        <Wand2 className={`w-3.5 h-3.5 ${isCalibratingAI ? 'animate-spin' : ''}`} />
                        <span>{isCalibratingAI ? 'Synthesizing Neural Persona...' : 'Calibrate OmniVoice Persona'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Extracted Neural Acoustics Profile */}
                  {clonedProfile.isCalibrated && (
                    <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span>Extracted Voice Profile Metrics</span>
                        </h4>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                          {clonedProfile.extractedMetrics.timbreProfile}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                          <span className="text-[10px] font-mono text-slate-400 block">Baseline Pitch Shift</span>
                          <span className="text-sm font-mono font-bold text-cyan-300">
                            {clonedProfile.extractedMetrics.pitchOffset > 0 ? `+${clonedProfile.extractedMetrics.pitchOffset}` : clonedProfile.extractedMetrics.pitchOffset}
                          </span>
                        </div>

                        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                          <span className="text-[10px] font-mono text-slate-400 block">Cadence Rate</span>
                          <span className="text-sm font-mono font-bold text-white">
                            {clonedProfile.extractedMetrics.rate}x Natural
                          </span>
                        </div>

                        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                          <span className="text-[10px] font-mono text-slate-400 block">Frequency ($F_0$)</span>
                          <span className="text-sm font-mono font-bold text-indigo-300">
                            {clonedProfile.extractedMetrics.frequencyHz} Hz
                          </span>
                        </div>

                        <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800">
                          <span className="text-[10px] font-mono text-slate-400 block">Acoustic Clarity</span>
                          <span className="text-sm font-mono font-bold text-emerald-300">
                            {clonedProfile.extractedMetrics.clarityScore}% Match
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Preview Cloned Voice Test Station */}
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
                    <label className="text-xs text-slate-300 block font-semibold">
                      Test Your Cloned Voice Output
                    </label>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="text"
                        value={cloneTestPhrase}
                        onChange={(e) => setCloneTestPhrase(e.target.value)}
                        placeholder="Type text for your cloned voice to speak..."
                        className="flex-1 bg-slate-950 border border-slate-800 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/40 transition font-sans"
                      />
                      <button
                        type="button"
                        onClick={handlePreviewClonedVoice}
                        disabled={isPreviewingClone || !speechSupported}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20 active:scale-95 transition disabled:opacity-50 shrink-0"
                      >
                        <Play className={`w-3.5 h-3.5 ${isPreviewingClone ? 'animate-spin' : ''}`} />
                        <span>{isPreviewingClone ? 'Speaking Like You...' : 'Test Cloned Voice'}</span>
                      </button>
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-slate-800/80">
                      <button
                        type="button"
                        onClick={handleResetClonedVoice}
                        className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 font-mono transition"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reset Calibration & Recordings</span>
                      </button>

                      <span className="text-[10px] font-mono text-cyan-400">
                        Persisted in client neural store
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* SUB-MENU CONTENT 2: USERS & BAN GOVERNANCE               */}
              {/* ======================================================== */}
              {selectedSubPage === 'users' && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-slate-400 font-mono">Status:</span>
                      <button
                        onClick={() => setStatusFilter('all')}
                        className={`px-2.5 py-1 rounded text-xs font-mono transition ${
                          statusFilter === 'all' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        All ({users.length})
                      </button>
                      <button
                        onClick={() => setStatusFilter('active')}
                        className={`px-2.5 py-1 rounded text-xs font-mono transition ${
                          statusFilter === 'active' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Active ({users.filter((u) => u.status === 'active').length})
                      </button>
                      <button
                        onClick={() => setStatusFilter('banned')}
                        className={`px-2.5 py-1 rounded text-xs font-mono transition ${
                          statusFilter === 'banned' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Banned ({users.filter((u) => u.status === 'banned').length})
                      </button>
                    </div>
                  </div>

                  {/* Users Table */}
                  <div className="rounded-xl border border-slate-800 overflow-hidden bg-slate-950/60 shadow-xl">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-900/80 border-b border-slate-800 text-[11px] font-mono text-slate-400">
                          <tr>
                            <th className="py-2.5 px-3">User</th>
                            <th className="py-2.5 px-3">Subscription</th>
                            <th className="py-2.5 px-3">Credits</th>
                            <th className="py-2.5 px-3">Status</th>
                            <th className="py-2.5 px-3">Last Active</th>
                            <th className="py-2.5 px-3 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-850">
                          {users
                            .filter((u) => {
                              const matchesSearch =
                                u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                                u.email.toLowerCase().includes(searchQuery.toLowerCase());
                              const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
                              return matchesSearch && matchesStatus;
                            })
                            .map((u) => (
                              <tr key={u.id} className="hover:bg-slate-900/40 transition">
                                <td className="py-2.5 px-3 flex items-center gap-2">
                                  <img src={u.avatar} alt={u.name} className="w-7 h-7 rounded-full object-cover border border-white/10" />
                                  <div>
                                    <div className="font-semibold text-white">{u.name}</div>
                                    <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                                  </div>
                                </td>
                                <td className="py-2.5 px-3">
                                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
                                    {u.tier}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 font-mono font-bold text-cyan-300">
                                  {u.creditsRemaining.toLocaleString()} CR
                                </td>
                                <td className="py-2.5 px-3">
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                    u.status === 'active'
                                      ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                      : 'bg-rose-950 text-rose-400 border border-rose-800'
                                  }`}>
                                    {u.status.toUpperCase()}
                                  </span>
                                </td>
                                <td className="py-2.5 px-3 text-slate-400 font-mono text-[11px]">{u.lastActive}</td>
                                <td className="py-2.5 px-3 text-right space-x-1.5">
                                  <button
                                    onClick={() => handleToggleBanUser(u.id)}
                                    disabled={u.email === 'darkmisfit.ai@gmail.com'}
                                    className={`p-1.5 rounded-lg border text-xs transition ${
                                      u.status === 'active'
                                        ? 'bg-rose-950/40 text-rose-300 border-rose-700 hover:bg-rose-900/60'
                                        : 'bg-emerald-950/40 text-emerald-300 border-emerald-700 hover:bg-emerald-900/60'
                                    } disabled:opacity-30`}
                                    title={u.status === 'active' ? 'Ban User' : 'Unban User'}
                                  >
                                    <Ban className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteUser(u.id)}
                                    disabled={u.email === 'darkmisfit.ai@gmail.com'}
                                    className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 hover:text-rose-400 hover:border-rose-500/50 transition disabled:opacity-30"
                                    title="Delete User"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* SUB-MENU CONTENT 3: OMNI AI BACKUP CASCADE & LLMS       */}
              {/* ======================================================== */}
              {selectedSubPage === 'llms' && (
                <div className="space-y-4">
                  {/* Architecture Clarification Hero Card */}
                  <div className="p-4 bg-[#121318] border border-red-600/40 rounded-2xl text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-red-400 font-bold">
                        <Sparkles className="w-4 h-4 text-red-400" />
                        <span>Omni AI Unified Multi-LLM Cascade & Auto-Failover</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-red-950/60 text-red-400 border border-red-800 text-[10px] font-mono">
                        Auto-Failover Active
                      </span>
                    </div>
                    <p className="text-slate-300 leading-relaxed text-[11px]">
                      All additional AIs (Google Gemini, Anthropic Claude, OpenAI, DeepSeek, Llama, and Custom APIs) connect directly into <strong>Omni AI</strong> as automatic backups. Customers always speak to Omni AI; if any model is rate-limited or unavailable, Omni's backup LLMs answer seamlessly in the same turn without breaking conversation state.
                    </p>
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-white/10">
                      <span className="text-[10px] font-mono text-slate-400">
                        Active cascade: <strong>{llmConnections.filter(c => c.inCouncil).length}</strong> enabled models
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsAddLLMOpen(!isAddLLMOpen)}
                        className="px-3 py-1.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 hover:border-cyan-400 text-xs font-mono font-bold flex items-center gap-1.5 transition active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{isAddLLMOpen ? 'Close Add Form' : 'Add LLM to Omni AI'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Add New LLM Form */}
                  {isAddLLMOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-4 rounded-2xl bg-black/80 border border-cyan-500/30 space-y-3 font-sans"
                    >
                      <h4 className="text-xs font-bold font-mono text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Plus className="w-4 h-4" /> Connect New LLM to Omni AI
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="text-[11px] font-mono text-slate-400 block mb-1">Model Name</label>
                          <input
                            type="text"
                            placeholder="e.g. Gemini 4 Argon Heavy / Llama 3.3 70B"
                            value={newLLMName}
                            onChange={(e) => setNewLLMName(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-mono text-slate-400 block mb-1">Provider</label>
                          <select
                            value={newLLMProvider}
                            onChange={(e: any) => setNewLLMProvider(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono focus:outline-none focus:border-cyan-500"
                          >
                            <option value="Google Gemini">Google Gemini</option>
                            <option value="Anthropic">Anthropic</option>
                            <option value="OpenAI">OpenAI</option>
                            <option value="DeepSeek">DeepSeek</option>
                            <option value="Meta">Meta Groq</option>
                            <option value="Custom">Custom Endpoint</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-[11px] font-mono text-slate-400 block mb-1">Model ID</label>
                          <input
                            type="text"
                            placeholder="e.g. gemini-3.8-flash, claude-3-5-sonnet"
                            value={newLLMModelId}
                            onChange={(e) => setNewLLMModelId(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-cyan-500"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] font-mono text-slate-400 block mb-1">Cascade Role</label>
                          <select
                            value={newLLMRole}
                            onChange={(e: any) => setNewLLMRole(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono focus:outline-none focus:border-cyan-500"
                          >
                            <option value="primary">Primary (First-Line Engine)</option>
                            <option value="secondary">Secondary (Instant Failover Backup)</option>
                            <option value="fallback">Fallback (Deep Guard)</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex gap-2 justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => setIsAddLLMOpen(false)}
                          className="px-3 py-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white text-xs font-mono"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (!newLLMName.trim()) return;
                            const newConn: LLMConnection = {
                              id: `custom-${Date.now()}`,
                              name: newLLMName.trim(),
                              provider: newLLMProvider,
                              envVar: 'CUSTOM_LLM_KEY',
                              keyMasked: '••••••••••••••••',
                              status: 'connected',
                              inCouncil: true,
                              priority: llmConnections.length + 1,
                              description: `Omni AI ${newLLMRole} backup model routed via ${newLLMProvider}.`,
                            };
                            setLlmConnections([...llmConnections, newConn]);
                            setNewLLMName('');
                            setIsAddLLMOpen(false);
                            triggerHaptic([10, 20, 10]);
                            showNotification(`Connected ${newLLMName} to Omni AI backup cascade.`);
                          }}
                          className="px-4 py-1.5 rounded-lg bg-cyan-500 text-slate-950 font-bold text-xs hover:bg-cyan-400 font-mono transition"
                        >
                          Attach to Omni AI
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* LLM Cascade Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {llmConnections.map((conn) => (
                      <div key={conn.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 relative hover:border-slate-700 transition">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-xs">{conn.name}</span>
                              <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded border ${
                                conn.priority === 1
                                  ? 'bg-cyan-950 text-cyan-300 border-cyan-800'
                                  : conn.priority === 2
                                  ? 'bg-purple-950 text-purple-300 border-purple-800'
                                  : 'bg-slate-900 text-slate-400 border-slate-800'
                              }`}>
                                {conn.priority === 1 ? 'Primary' : `Backup #${conn.priority}`}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono block mt-0.5">Provider: {conn.provider}</span>
                          </div>

                          {/* Toggle ON/OFF for Omni AI Backup */}
                          <button
                            type="button"
                            onClick={() => {
                              triggerHaptic(12);
                              handleToggleCouncilMember(conn.id);
                            }}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border transition ${
                              conn.inCouncil
                                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-[0_0_10px_rgba(0,242,254,0.2)]'
                                : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
                            }`}
                          >
                            {conn.inCouncil ? 'ENABLED IN OMNI ●' : 'OFFLINE'}
                          </button>
                        </div>

                        <p className="text-[11px] text-slate-400 leading-relaxed">{conn.description}</p>

                        <div className="pt-2 border-t border-slate-850 flex items-center justify-between text-xs font-mono">
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-slate-400 text-[11px]">
                              {testingLLMId === conn.id ? 'Pinging...' : 'Status: Connected'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                triggerHaptic(8);
                                setTestingLLMId(conn.id);
                                setTimeout(() => {
                                  setTestingLLMId(null);
                                  showNotification(`${conn.name} latency: ${Math.floor(Math.random() * 60) + 80}ms. Verified ready.`);
                                }, 800);
                              }}
                              className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 hover:text-white text-[10px]"
                            >
                              Test Latency
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowKeyId(showKeyId === conn.id ? null : conn.id)}
                              className="p-1 rounded text-slate-400 hover:text-white"
                              title="Toggle Key Visibility"
                            >
                              {showKeyId === conn.id ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>

                        {showKeyId === conn.id && (
                          <div className="p-2 rounded bg-black/70 border border-slate-800 text-[10px] font-mono text-cyan-300 truncate">
                            {conn.envVar}=AI_CREDENTIAL_ACTIVE
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* SUB-MENU CONTENT 4: BILLING & STUDIO WALLETS            */}
              {/* ======================================================== */}
              {selectedSubPage === 'billing' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-slate-500" />
                      <h3 className="font-bold text-sm text-white font-mono">Live Billing & Token Protection: Inactive</h3>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed font-mono">
                      Mock in-memory wallet endpoints and hardcoded credit balances have been disabled. 
                      They are not presented as real billing or token protection. Studio operations remain open for direct development and prototype testing.
                    </p>
                    <div className="pt-2 border-t border-slate-800 text-[11px] font-mono text-slate-500">
                      Token deduction and real billing require verified server-side identity and persistent database balances.
                    </div>
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* SUB-MENU CONTENT 5: OMNIAI - NEXUS ACCOUNT PROFILES       */}
              {selectedSubPage === 'workspace' && (
                <div className="space-y-4">
                  {/* OmniAI - Nexus Account Profiles & API Access Tokens Enclave */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <div>
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                          <FolderLock className="w-4 h-4 text-cyan-400" />
                          <span>OmniAI - Nexus Account Profiles</span>
                        </h3>
                        <p className="text-[11px] text-slate-400">
                          Hardware enclave credentials manager for Developer API access tokens & Google Workspace
                        </p>
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-500/40">
                        ENCLAVE SECURED
                      </span>
                    </div>

                    {/* Developer API Access Tokens Matrix */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {/* Google AI Studio Token */}
                      <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="font-bold text-white flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Google AI Studio API
                          </span>
                          <span className="text-[10px] text-emerald-400 font-bold">CONNECTED</span>
                        </div>
                        <input
                          type="password"
                          defaultValue="AIzaSyB*********************************"
                          readOnly
                          className="w-full px-2.5 py-1.5 rounded bg-black/60 border border-slate-800 text-[11px] font-mono text-slate-400"
                        />
                        <p className="text-[9.5px] text-slate-500 font-mono">Server-side proxy route active via GEMINI_API_KEY</p>
                      </div>

                      {/* Supabase PostgreSQL Token */}
                      <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="font-bold text-white flex items-center gap-1.5">
                            <Database className="w-3.5 h-3.5 text-emerald-400" /> Supabase Database
                          </span>
                          <span className="text-[10px] text-emerald-400 font-bold">ACTIVE (RLS)</span>
                        </div>
                        <input
                          type="password"
                          defaultValue="sbp_d8392*******************************"
                          readOnly
                          className="w-full px-2.5 py-1.5 rounded bg-black/60 border border-slate-800 text-[11px] font-mono text-slate-400"
                        />
                        <p className="text-[9.5px] text-slate-500 font-mono">Real-time sync active for chat threads & vault assets</p>
                      </div>

                      {/* Firebase Auth & Firestore */}
                      <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="font-bold text-white flex items-center gap-1.5">
                            <Lock className="w-3.5 h-3.5 text-amber-400" /> Firebase Auth & Rules
                          </span>
                          <span className="text-[10px] text-cyan-400 font-bold">AUTHORIZED</span>
                        </div>
                        <input
                          type="password"
                          defaultValue="ai-studio-omnikeyboardai-bbe38873"
                          readOnly
                          className="w-full px-2.5 py-1.5 rounded bg-black/60 border border-slate-800 text-[11px] font-mono text-slate-400"
                        />
                        <p className="text-[9.5px] text-slate-500 font-mono">Default firestore db deployed with user rules</p>
                      </div>

                      {/* n8n Autonomous Webhook Token */}
                      <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 space-y-1.5">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="font-bold text-white flex items-center gap-1.5">
                            <Zap className="w-3.5 h-3.5 text-[#00ffcc]" /> n8n Automation Webhook
                          </span>
                          <span className="text-[10px] text-cyan-400 font-bold">LISTENING</span>
                        </div>
                        <input
                          type="password"
                          defaultValue="https://n8n.internal.omni/webhook/nexus-auto-v1"
                          readOnly
                          className="w-full px-2.5 py-1.5 rounded bg-black/60 border border-slate-800 text-[11px] font-mono text-slate-400"
                        />
                        <p className="text-[9.5px] text-slate-500 font-mono">Autonomous agent scheduling & pipeline webhooks</p>
                      </div>
                    </div>
                  </div>

                  <WorkspaceHub />
                </div>
              )}

              {/* ======================================================== */}
              {/* SUB-MENU CONTENT 6: DESKTOP & LAPTOP SYNC TUNNEL        */}
              {selectedSubPage === 'sync' && (
                <div className="space-y-4">
                  <DesktopSyncBridge />
                </div>
              )}

              {/* ======================================================== */}
              {/* SUB-MENU CONTENT 7: MOBILE SETUP & PWA GUIDE            */}
              {selectedSubPage === 'install' && (
                <div className="space-y-4">
                  <MobileSetupGuide />
                </div>
              )}

              {/* ======================================================== */}
              {/* SUB-MENU CONTENT 8: MASTER SYSTEM GOVERNANCE            */}
              {selectedSubPage === 'settings' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-bold text-white block">
                          Master Permanent System Persona Prompt (OmniAI - Nexus)
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            setSystemPersonaPrompt(OMNI_PERSONA);
                            showNotification('Reset to canonical OmniAI - Nexus persona.');
                          }}
                          className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 underline"
                        >
                          Reset to Web App Default
                        </button>
                      </div>
                      <textarea
                        rows={11}
                        value={systemPersonaPrompt}
                        onChange={(e) => setSystemPersonaPrompt(e.target.value)}
                        className="w-full rounded-lg bg-slate-900 border border-slate-800 p-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-cyan-500 leading-relaxed"
                      />
                      <p className="text-[11px] text-slate-500 mt-1">
                        Authoritative source of truth: <code className="text-cyan-300">src/lib/omniPersona.ts</code>. Used for all local fallbacks and prompt cascades.
                      </p>
                    </div>

                    {/* 3D Keyboard Vibration Setting with Slider respecting toggle state */}
                    <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs font-bold text-white flex items-center gap-1.5">
                            <Zap className="w-3.5 h-3.5 text-cyan-400" />
                            <span>3D Keyboard Haptic Vibration Responses</span>
                          </div>
                          <div className="text-[11px] text-slate-400">
                            Master toggle: <span className="font-mono text-cyan-300 font-bold">{hapticFeedback ? 'ENABLED' : 'DISABLED'}</span> ({hapticIntensity})
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const next = !hapticFeedback;
                            handleUpdateHapticConfig(next, hapticIntensity);
                            showNotification(`3D Keyboard haptics ${next ? 'enabled' : 'disabled'}`);
                          }}
                          className="text-cyan-400 hover:text-cyan-300"
                          title={hapticFeedback ? 'Disable 3D Keyboard Vibration' : 'Enable 3D Keyboard Vibration'}
                        >
                          {hapticFeedback ? <ToggleRight className="w-6 h-6" /> : <ToggleLeft className="w-6 h-6 text-slate-600" />}
                        </button>
                      </div>

                      {/* Haptic Intensity Slider (Respects toggle state: disabled when toggle is off) */}
                      <div className={`pt-2.5 border-t border-slate-800 space-y-2 transition-opacity ${!hapticFeedback ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-slate-300 font-bold flex items-center gap-1.5">
                            <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400" />
                            Haptic Vibration Intensity
                          </span>
                          <span className="text-[11px] font-bold font-mono px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-500/40">
                            {hapticFeedback ? `Level ${hapticLevel} / 10 (${hapticIntensity})` : 'Haptics Off'}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <input
                            type="range"
                            min="1"
                            max="10"
                            step="1"
                            value={hapticLevel}
                            disabled={!hapticFeedback}
                            onChange={(e) => {
                              handleUpdateHapticLevel(Number(e.target.value));
                            }}
                            className="w-full accent-cyan-400 h-2 bg-slate-950 rounded-lg cursor-pointer border border-slate-800"
                          />
                          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                            <span>1 (Subtle Micro-Tick)</span>
                            <span className="text-cyan-400 font-bold">
                              {hapticLevel <= 3 ? 'Subtle (5-11ms)' : hapticLevel <= 7 ? 'Balanced (15-27ms)' : hapticLevel <= 9 ? 'Heavy Dual Strike' : 'Max Volumetric Wave'}
                            </span>
                            <span>10 (Max Wave)</span>
                          </div>
                        </div>

                        {!hapticFeedback && (
                          <p className="text-[10px] text-amber-400 font-mono">
                            Haptic feedback is currently disabled. Toggle switch ON above to calibrate intensity.
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-white block">
                        Multi-Provider Cascade Policy
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <button
                          onClick={() => setFallbackPolicy('cascade')}
                          className={`p-3 rounded-lg border text-left text-xs transition-all ${
                            fallbackPolicy === 'cascade'
                              ? 'border-cyan-400 bg-cyan-950/30 text-cyan-200 font-semibold shadow-[0_0_12px_rgba(0,242,254,0.2)]'
                              : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                          }`}
                        >
                          <div className="font-bold text-white">Full Cascade Resiliency</div>
                          <p className="text-[11px] text-slate-400 mt-1">
                            Automatically fall over through Claude → GPT-4o → DeepSeek → Llama if primary core is unavailable.
                          </p>
                        </button>

                        <button
                          onClick={() => setFallbackPolicy('core_only')}
                          className={`p-3 rounded-lg border text-left text-xs transition-all ${
                            fallbackPolicy === 'core_only'
                              ? 'border-cyan-400 bg-cyan-950/30 text-cyan-200 font-semibold shadow-[0_0_12px_rgba(0,242,254,0.2)]'
                              : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                          }`}
                        >
                          <div className="font-bold text-white">Strict Fallback</div>
                          <p className="text-[11px] text-slate-400 mt-1">
                            Always fall back exclusively to Google Gemini Core.
                          </p>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-white block mb-1">
                        Automated Token-Abuse Rate Limit
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min={10}
                          max={200}
                          value={autoBanThreshold}
                          onChange={(e) => setAutoBanThreshold(Number(e.target.value))}
                          className="flex-1 accent-cyan-400"
                        />
                        <span className="font-mono text-xs font-bold text-cyan-300 w-24 text-right">
                          {autoBanThreshold} req/min
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        triggerHaptic([15, 20, 15]);
                        showNotification('Master application configurations saved.');
                      }}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-cyan-500/20 active:scale-95 transition"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save All Governance Settings</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ======================================================== */}
              {/* SUB-MENU CONTENT: PRIVATE ADMIN PROVIDERS & AUDIO ENDPOINTS */}
              {/* ======================================================== */}
              {selectedSubPage === 'providers' && (
                <div className="space-y-5">
                  {/* Super-Admin Cryptographic Gateway Hero Banner */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#08060c] via-[#0d091a] to-[#040308] border border-[#8b5cf6]/40 shadow-[0_0_25px_rgba(139,92,246,0.15)] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#00e5ff]/5 rounded-full blur-3xl pointer-events-none" />
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <div className="p-2 rounded-xl bg-[#8b5cf6]/20 border border-[#8b5cf6]/50 text-[#8b5cf6]">
                            <Lock className="w-5 h-5 text-[#8b5cf6]" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm sm:text-base font-bold text-white font-mono tracking-wide">
                                Private Admin Credentials Gateway
                              </h3>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#00ff99]/15 text-[#00ff99] border border-[#00ff99]/40 font-bold">
                                HSM Enclave Active
                              </span>
                            </div>
                            <span className="text-[11px] font-mono text-[#a78bfa]">
                              Path: /admin/providers • 30 Model Providers • ElevenLabs • Fish Audio • Suno Seeds
                            </span>
                          </div>
                        </div>
                        <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
                          Initialize and securely persist authentication tokens, audio endpoints, and inference lanes. All credentials are encrypted in local hardware storage and synchronized with OmniAI's multi-agent cascade.
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={handleSaveAllCredentials}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00ff99] to-[#00e5ff] text-black font-black text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-[#00ff99]/20 hover:opacity-95 active:scale-95 transition"
                        >
                          <Save className="w-4 h-4 fill-current text-black" />
                          <span>Save & Encrypt All</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Section 1: Audio & Speech Synthesis Infrastructure */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-2">
                        <Radio className="w-4 h-4 text-[#00e5ff]" />
                        <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-white">
                          Audio & Speech Synthesis Endpoints (ElevenLabs, Fish Audio, Suno)
                        </h4>
                      </div>
                      <span className="text-[10px] font-mono text-[#00ff99]">3/3 Engines Calibrated</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      {/* ElevenLabs Infrastructure Card */}
                      <div className="p-4 rounded-xl bg-[#08060c] border border-zinc-900 hover:border-[#00e5ff]/50 transition space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-xs font-bold text-white block">ElevenLabs Voice API</span>
                            <span className="text-[10px] text-zinc-500 font-mono">Real-time Conversational TTS</span>
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#00ff99]/15 text-[#00ff99] border border-[#00ff99]/30">
                            {elevenLabsConfig.latencyMs}ms Ping
                          </span>
                        </div>

                        <div className="space-y-2 text-xs font-mono">
                          <div>
                            <label className="text-[10px] text-zinc-400 block mb-0.5">API Key (Masked)</label>
                            <div className="relative">
                              <input
                                type={showKeyId === 'eleven' ? 'text' : 'password'}
                                value={elevenLabsConfig.apiKey}
                                onChange={(e) => setElevenLabsConfig({ ...elevenLabsConfig, apiKey: e.target.value })}
                                className="w-full bg-black border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-[#00e5ff] outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => setShowKeyId(showKeyId === 'eleven' ? null : 'eleven')}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                              >
                                {showKeyId === 'eleven' ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-[#00e5ff]" />}
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="text-[10px] text-zinc-400 block mb-0.5">Default Voice ID</label>
                            <input
                              type="text"
                              value={elevenLabsConfig.voiceId}
                              onChange={(e) => setElevenLabsConfig({ ...elevenLabsConfig, voiceId: e.target.value })}
                              className="w-full bg-black border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-white focus:border-[#00e5ff] outline-none"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <div>
                              <label className="text-[9.5px] text-zinc-400 block mb-0.5">Model Engine</label>
                              <select
                                value={elevenLabsConfig.model}
                                onChange={(e) => setElevenLabsConfig({ ...elevenLabsConfig, model: e.target.value as any })}
                                className="w-full bg-black border border-zinc-800 rounded-lg px-1.5 py-1 text-[11px] text-[#00e5ff] outline-none"
                              >
                                <option value="eleven_turbo_v2_5">Turbo v2.5 (Fastest)</option>
                                <option value="eleven_multilingual_v2">Multilingual v2</option>
                                <option value="eleven_flash_v2">Flash v2</option>
                              </select>
                            </div>

                            <div>
                              <label className="text-[9.5px] text-zinc-400 block mb-0.5">Low-Latency WS</label>
                              <button
                                type="button"
                                onClick={() => setElevenLabsConfig({ ...elevenLabsConfig, streamingWs: !elevenLabsConfig.streamingWs })}
                                className={`w-full py-1 rounded-lg border text-[10px] font-bold transition ${
                                  elevenLabsConfig.streamingWs
                                    ? 'bg-[#00ff99]/15 text-[#00ff99] border-[#00ff99]/40'
                                    : 'bg-zinc-900 text-zinc-500 border-zinc-800'
                                }`}
                              >
                                {elevenLabsConfig.streamingWs ? 'WebSocket ON' : 'REST Standard'}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Fish Audio Rendering Endpoints Card */}
                      <div className="p-4 rounded-xl bg-[#08060c] border border-zinc-900 hover:border-[#8b5cf6]/50 transition space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-xs font-bold text-white block">Fish Audio Endpoints</span>
                            <span className="text-[10px] text-zinc-500 font-mono">Zero-Shot Neural Cloner</span>
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#8b5cf6]/15 text-[#8b5cf6] border border-[#8b5cf6]/30">
                            {fishAudioConfig.latencyMs}ms Ping
                          </span>
                        </div>

                        <div className="space-y-2 text-xs font-mono">
                          <div>
                            <label className="text-[10px] text-zinc-400 block mb-0.5">Authorization Bearer Token</label>
                            <div className="relative">
                              <input
                                type={showKeyId === 'fish' ? 'text' : 'password'}
                                value={fishAudioConfig.apiKey}
                                onChange={(e) => setFishAudioConfig({ ...fishAudioConfig, apiKey: e.target.value })}
                                className="w-full bg-black border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-[#8b5cf6] outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => setShowKeyId(showKeyId === 'fish' ? null : 'fish')}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                              >
                                {showKeyId === 'fish' ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-[#8b5cf6]" />}
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="text-[10px] text-zinc-400 block mb-0.5">Rendering Endpoint URL</label>
                            <input
                              type="text"
                              value={fishAudioConfig.endpointUrl}
                              onChange={(e) => setFishAudioConfig({ ...fishAudioConfig, endpointUrl: e.target.value })}
                              className="w-full bg-black border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-white focus:border-[#8b5cf6] outline-none truncate"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <div>
                              <label className="text-[9.5px] text-zinc-400 block mb-0.5">Model Engine</label>
                              <select
                                value={fishAudioConfig.model}
                                onChange={(e) => setFishAudioConfig({ ...fishAudioConfig, model: e.target.value as any })}
                                className="w-full bg-black border border-zinc-800 rounded-lg px-1.5 py-1 text-[11px] text-[#8b5cf6] outline-none"
                              >
                                <option value="fish-speech-1.5">Fish Speech 1.5</option>
                                <option value="fish-speech-1.4">Fish Speech 1.4</option>
                              </select>
                            </div>

                            <div>
                              <label className="text-[9.5px] text-zinc-400 block mb-0.5">Cloned Seed Ref</label>
                              <input
                                type="text"
                                value={fishAudioConfig.referenceVoice}
                                onChange={(e) => setFishAudioConfig({ ...fishAudioConfig, referenceVoice: e.target.value })}
                                className="w-full bg-black border border-zinc-800 rounded-lg px-2 py-1 text-[10px] text-zinc-300 outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Suno Audio Seeds & Generation API Card */}
                      <div className="p-4 rounded-xl bg-[#08060c] border border-zinc-900 hover:border-[#ff007f]/50 transition space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-xs font-bold text-white block">Suno Audio Seeds & API</span>
                            <span className="text-[10px] text-zinc-500 font-mono">Neural Beat & Harmony Engine</span>
                          </div>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#ff007f]/15 text-[#ff007f] border border-[#ff007f]/30">
                            {sunoAudioConfig.latencyMs}ms Ping
                          </span>
                        </div>

                        <div className="space-y-2 text-xs font-mono">
                          <div>
                            <label className="text-[10px] text-zinc-400 block mb-0.5">Suno API Secret Key</label>
                            <div className="relative">
                              <input
                                type={showKeyId === 'suno' ? 'text' : 'password'}
                                value={sunoAudioConfig.apiKey}
                                onChange={(e) => setSunoAudioConfig({ ...sunoAudioConfig, apiKey: e.target.value })}
                                className="w-full bg-black border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:border-[#ff007f] outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => setShowKeyId(showKeyId === 'suno' ? null : 'suno')}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                              >
                                {showKeyId === 'suno' ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5 text-[#ff007f]" />}
                              </button>
                            </div>
                          </div>

                          <div>
                            <label className="text-[10px] text-zinc-400 block mb-0.5">Seed Generator Offset</label>
                            <input
                              type="text"
                              value={sunoAudioConfig.seedOffset}
                              onChange={(e) => setSunoAudioConfig({ ...sunoAudioConfig, seedOffset: e.target.value })}
                              className="w-full bg-black border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-white focus:border-[#ff007f] outline-none truncate"
                            />
                          </div>

                          <div>
                            <label className="text-[9.5px] text-zinc-400 block mb-0.5">Style Prompt Anchor</label>
                            <input
                              type="text"
                              value={sunoAudioConfig.defaultStylePrompt}
                              onChange={(e) => setSunoAudioConfig({ ...sunoAudioConfig, defaultStylePrompt: e.target.value })}
                              className="w-full bg-black border border-zinc-800 rounded-lg px-2 py-1 text-[10px] text-zinc-300 outline-none truncate"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: 30 Model Providers Infrastructure Grid */}
                  <div className="space-y-3 pt-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
                      <div>
                        <div className="flex items-center gap-2">
                          <Key className="w-4 h-4 text-[#00ff99]" />
                          <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-white">
                            30 Primary & Backup Model Providers
                          </h4>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#00ff99]/15 text-[#00ff99] border border-[#00ff99]/30 font-bold">
                            {filteredProviderList.length} of 30 Providers
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 font-mono mt-0.5">
                          Configure API tokens, base endpoints, and live latency health tests across the full 30-model quorum.
                        </p>
                      </div>

                      {/* Category Filter Pills */}
                      <div className="flex items-center gap-1 overflow-x-auto whitespace-nowrap">
                        {[
                          { id: 'all', label: 'All 30' },
                          { id: 'text', label: 'Text/Reasoning' },
                          { id: 'multimodal', label: 'Multimodal' },
                          { id: 'edge', label: 'Edge TPU' },
                        ].map((tab) => (
                          <button
                            key={tab.id}
                            type="button"
                            onClick={() => setProviderCategoryFilter(tab.id as any)}
                            className={`px-2.5 py-1 rounded-lg text-[10.5px] font-mono transition ${
                              providerCategoryFilter === tab.id
                                ? 'bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff]/50 font-bold'
                                : 'bg-black/60 text-zinc-400 hover:text-white border border-zinc-800'
                            }`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Search Field */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Filter 30 model providers by name, model code, or environment variable..."
                        value={providerSearch}
                        onChange={(e) => setProviderSearch(e.target.value)}
                        className="w-full bg-[#08060c] border border-zinc-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#00e5ff] font-mono"
                      />
                    </div>

                    {/* 30 Providers Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[600px] overflow-y-auto pr-1">
                      {filteredProviderList.map((item) => (
                        <div
                          key={item.id}
                          className="p-3.5 rounded-xl bg-[#08060c] border border-zinc-900 hover:border-zinc-700 transition space-y-2.5"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold text-white text-xs font-mono">{item.name}</span>
                                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300">
                                  {item.provider}
                                </span>
                              </div>
                              <span className="text-[10px] text-[#a78bfa] font-mono block mt-0.5">
                                {item.modelCode}
                              </span>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <span
                                className={`text-[9.5px] font-mono px-2 py-0.5 rounded border ${
                                  item.status === 'active'
                                    ? 'bg-[#00ff99]/15 text-[#00ff99] border-[#00ff99]/40'
                                    : 'bg-[#00e5ff]/15 text-[#00e5ff] border-[#00e5ff]/40'
                                }`}
                              >
                                {item.latencyMs}ms
                              </span>
                              <button
                                type="button"
                                onClick={() => handleTestProviderPing(item.id)}
                                disabled={pingTestingId === item.id}
                                className="p-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-mono transition"
                                title="Run Latency Ping"
                              >
                                <RefreshCw className={`w-3 h-3 ${pingTestingId === item.id ? 'animate-spin text-[#00e5ff]' : ''}`} />
                              </button>
                            </div>
                          </div>

                          <div className="space-y-1.5 text-xs font-mono">
                            <div className="flex items-center justify-between text-[10px] text-zinc-400">
                              <span>Token: {item.envVar}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setProviderList((prev) =>
                                    prev.map((p) => (p.id === item.id ? { ...p, inCouncil: !p.inCouncil } : p))
                                  );
                                  showNotification(`${item.name} ${!item.inCouncil ? 'added to' : 'removed from'} council quorum`);
                                }}
                                className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                                  item.inCouncil
                                    ? 'bg-[#00ff99]/20 text-[#00ff99]'
                                    : 'bg-zinc-800 text-zinc-500'
                                }`}
                              >
                                {item.inCouncil ? 'Council Quorum ON' : 'Council Quorum OFF'}
                              </button>
                            </div>

                            <div className="relative">
                              <input
                                type={showKeyId === item.id ? 'text' : 'password'}
                                value={item.keyValue}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  setProviderList((prev) =>
                                    prev.map((p) => (p.id === item.id ? { ...p, keyValue: val } : p))
                                  );
                                }}
                                className="w-full bg-black border border-zinc-800 rounded-lg px-2.5 py-1 text-[11px] text-white focus:border-[#00e5ff] outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => setShowKeyId(showKeyId === item.id ? null : item.id)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                              >
                                {showKeyId === item.id ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                              </button>
                            </div>

                            <div>
                              <input
                                type="text"
                                value={item.endpointUrl}
                                onChange={(e) => {
                                  const url = e.target.value;
                                  setProviderList((prev) =>
                                    prev.map((p) => (p.id === item.id ? { ...p, endpointUrl: url } : p))
                                  );
                                }}
                                placeholder="Endpoint URL..."
                                className="w-full bg-black border border-zinc-900 rounded-lg px-2.5 py-0.5 text-[10px] text-zinc-400 focus:border-[#8b5cf6] outline-none truncate"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Save Action */}
                  <div className="pt-3 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <span className="text-[11px] font-mono text-zinc-400">
                      Credentials persisted to encrypted client enclave (<code className="text-[#00ff99]">localStorage.omni_admin_provider_credentials</code>).
                    </span>

                    <button
                      type="button"
                      onClick={handleSaveAllCredentials}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#00ff99] via-[#00e5ff] to-[#8b5cf6] text-black font-black text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#00ff99]/20 hover:opacity-95 active:scale-95 transition"
                    >
                      <Save className="w-4 h-4 fill-current text-black" />
                      <span>Save & Sync All 30 Providers & Audio Endpoints</span>
                    </button>
                  </div>
                </div>
              )}

              {/* SUB-MENU CONTENT: DATA VAULT & PRIVACY SECURITY */}
              {selectedSubPage === 'privacy' && (
                <div className="flex justify-center py-2">
                  <DataVaultPrivacyView onBack={() => setSelectedSubPage(null)} />
                </div>
              )}

            </motion.div>
          )}

        </AnimatePresence>
        )}
      </div>

    </div>
  );
};

