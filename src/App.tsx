import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Keyboard as KeyboardIcon, 
  Eye, 
  Sparkles, 
  Smartphone, 
  Wifi, 
  Battery, 
  Maximize2, 
  FolderOpen, 
  Code,
  Activity,
  Layers,
  Cpu,
  Laptop,
  Zap,
  Volume2,
  VolumeX,
  MessageSquare,
  Settings,
  FolderLock,
  Menu,
  ChevronLeft,
  Bot,
  Vibrate,
  VibrateOff,
  Cloud,
  Sliders,
  ShieldAlert,
  Phone,
  Video
} from 'lucide-react';
import { getHapticPattern } from './lib/hapticFeedback';
import { HoloOrb, OrbPhase } from './components/HoloOrb';
import { AIKeyboardBar } from './components/AIKeyboardBar';
import { SoftKeyboard } from './components/SoftKeyboard';
import { SimulatedAppView, PRESET_SCENARIOS, ScreenScenario } from './components/SimulatedAppView';
import { ViewportCarousel } from './components/ViewportCarousel';
import { ScreenVisionHUD } from './components/ScreenVisionHUD';
import { OmniStudiosView, StudioId, studioMeta } from './components/OmniStudiosView';
import { OmniStudiosSidebar } from './components/OmniStudiosSidebar';
import { OmniAIChatRoom } from './components/OmniAIChatRoom';
import { OmniChatAndCouncil } from './components/OmniChatAndCouncil';
import { OmniNexusPanel } from './components/OmniNexusPanel';
import { useOmniChat } from './context/OmniChatContext';
import { AdminHub } from './components/AdminHub';
import { VaultAssetsDrawer, VaultAsset, initialVaultAssets } from './components/VaultAssetsDrawer';
import { MobileSetupGuide } from './components/MobileSetupGuide';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import { WorkspaceHub } from './components/WorkspaceHub';
import { KeyboardExtensionBridge } from './components/KeyboardExtensionBridge';
import { DesktopSyncBridge } from './components/DesktopSyncBridge';
import { DesktopFloatingWidget } from './components/DesktopFloatingWidget';
import { JarvisTelemetryHUD } from './components/JarvisTelemetryHUD';
import { onDeviceAI, DualLaneAnalysisResult } from './lib/onDeviceAI';
import { auth, testFirestoreConnection } from './lib/firebase';
import { User } from 'firebase/auth';
import { getCurrentUser, saveVaultAsset } from './lib/supabase';
import { omniVoice } from './lib/omniVoice';
import { OmniVoidBackground } from './components/OmniVoidBackground';
import { LiveCallView, CALLER_PRESETS, LiveCallCaller } from './components/LiveCallView';
import { OmniNexusSetupModel } from './components/OmniNexusSetupModel';
import { MyAIIdentityView } from './components/MyAIIdentityView';
import { useSwipeTabs, PRIMARY_TABS } from './hooks/useSwipeTabs';
import { SwipeOnboardingOverlay } from './components/SwipeOnboardingOverlay';

export default function App() {
  const [activeTab, setActiveTab] = useState<'keyboard' | 'chat' | 'vision' | 'workspace' | 'extension' | 'studios' | 'sync' | 'setup' | 'admin' | 'identity'>('keyboard');
  const [isDesktopOverlayActive, setIsDesktopOverlayActive] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState<boolean>(omniVoice.getVoiceEnabled());
  const [isLiveCallOpen, setIsLiveCallOpen] = useState(false);
  const [liveCallCaller, setLiveCallCaller] = useState<LiveCallCaller>(CALLER_PRESETS[0]);
  const [isAutoPilotSetupOpen, setIsAutoPilotSetupOpen] = useState(false);
  const typingTimerRef = useRef<any>(null);

  // Shared OmniChat Context for Companion Panel & Dedicated Chat Page
  const { isCompanionOpen, setIsCompanionOpen, setActiveStudioContext } = useOmniChat();

  // 3D Keyboard Haptic Feedback State
  const [hapticFeedback, setHapticFeedback] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('omni_haptic_enabled') !== 'false';
    }
    return true;
  });

  const [hapticLevel, setHapticLevel] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('omni_haptic_level');
      if (saved) return Math.max(1, Math.min(10, parseInt(saved, 10)));
    }
    return 6;
  });

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
    };
    window.addEventListener('omni_haptic_changed', handleHapticChange);
    return () => window.removeEventListener('omni_haptic_changed', handleHapticChange);
  }, []);

  // Studios Sidebar & Vault Drawer & Admin Modals
  const [isStudiosSidebarOpen, setIsStudiosSidebarOpen] = useState(false);
  const [isVaultOpen, setIsVaultOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [selectedStudio, setSelectedStudio] = useState<StudioId>('motion');

  // Global Vault Assets State synced across Workspace, Studios & Drawer
  const [vaultAssets, setVaultAssets] = useState<VaultAsset[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('omni_vault_assets');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return initialVaultAssets;
  });

  const handleSaveToVault = useCallback((asset: any) => {
    const newAsset = { ...asset, id: asset.id || `vault-${Date.now()}` };
    setVaultAssets((prev) => [newAsset, ...prev.filter((a) => a.id !== newAsset.id)]);
    if (typeof window !== 'undefined') {
      try {
        const existing = JSON.parse(localStorage.getItem('omni_vault_assets') || '[]');
        localStorage.setItem(
          'omni_vault_assets',
          JSON.stringify([newAsset, ...existing.filter((a: any) => a.id !== newAsset.id)])
        );
      } catch {}
    }
    // Sync to Supabase under authenticated user's ID (RLS protected)
    getCurrentUser().then((user) => {
      if (user) {
        saveVaultAsset(user.id, newAsset).catch((err) => {
          console.warn('[App] Supabase Vault asset save:', err);
        });
      }
    });
  }, []);

  useEffect(() => {
    const handleVaultUpdate = (e: any) => {
      if (e?.detail?.asset) {
        const incoming = e.detail.asset;
        setVaultAssets((prev) => [incoming, ...prev.filter((a) => a.id !== incoming.id)]);
      }
    };
    window.addEventListener('omni_vault_updated', handleVaultUpdate);
    return () => window.removeEventListener('omni_vault_updated', handleVaultUpdate);
  }, []);

  // Sync studio context with OmniChatContext whenever studio or tab changes
  useEffect(() => {
    if (activeTab === 'studios' && selectedStudio) {
      const meta = studioMeta[selectedStudio];
      if (meta) {
        setActiveStudioContext({
          id: selectedStudio,
          name: meta.name,
          tag: meta.tag,
        });
      }
    } else {
      setActiveStudioContext(null);
    }
  }, [activeTab, selectedStudio, setActiveStudioContext]);

  // Autonomous Auto Mode State
  const [isAutoMode, setIsAutoMode] = useState(false);
  const [autoPilotTone, setAutoPilotTone] = useState<'rawHonest' | 'witty' | 'directAction' | 'flirty'>('directAction');
  const [autoCountdown, setAutoCountdown] = useState<number | null>(null);
  const [autoDispatchTarget, setAutoDispatchTarget] = useState<string>('');
  const [autoDispatchPreviewText, setAutoDispatchPreviewText] = useState<string>('');
  const autoCountdownTimerRef = useRef<any>(null);

  // Active typing text
  const [currentDraftText, setCurrentDraftText] = useState<string>(PRESET_SCENARIOS[0].defaultDraft);

  // Active screen scenario
  const [currentScenario, setCurrentScenario] = useState<ScreenScenario>(PRESET_SCENARIOS[0]);
  const [customScreenshot, setCustomScreenshot] = useState<string | null>(null);

  // Live Screen Sharing stream
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  // Keyboard collapsed state
  const [isKeyboardCollapsed, setIsKeyboardCollapsed] = useState(false);

  // Phone frame simulation toggle for desktop screens
  const [phoneFrameMode, setPhoneFrameMode] = useState(true);

  // Swipe-to-switch navigation between primary mobile views (Keyboard <-> Vision <-> Workspace)
  const { swipeHandlers, isPrimaryTab, canSwipeLeft, canSwipeRight, nextTabName, prevTabName } = useSwipeTabs({
    activeTab,
    onTabChange: (newTab) => {
      setActiveTab(newTab);
      if (newTab === 'keyboard') {
        setIsKeyboardCollapsed(false);
      }
    },
    enabled: activeTab === 'keyboard' || activeTab === 'vision' || activeTab === 'workspace',
  });

  // Autonomous Auto-Mode Schedule Evaluation
  useEffect(() => {
    const evaluateAutoModeSchedule = () => {
      try {
        const raw = localStorage.getItem('omni_autopilot_schedule');
        if (!raw) return;
        const config = JSON.parse(raw);
        if (!config || !config.enabled) return;

        const now = new Date();
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const currentDay = dayNames[now.getDay()];
        if (!config.days || !Array.isArray(config.days) || !config.days.includes(currentDay)) {
          if (isAutoModeRef.current) {
            setIsAutoMode(false);
          }
          return;
        }

        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        const [startH, startM] = (config.startTime || '09:00').split(':').map(Number);
        const [endH, endM] = (config.endTime || '17:00').split(':').map(Number);
        const startTotal = (startH || 0) * 60 + (startM || 0);
        const endTotal = (endH || 0) * 60 + (endM || 0);

        let inWindow = false;
        if (startTotal <= endTotal) {
          inWindow = currentMinutes >= startTotal && currentMinutes <= endTotal;
        } else {
          // Overnight shift (e.g. 22:00 to 06:00)
          inWindow = currentMinutes >= startTotal || currentMinutes <= endTotal;
        }

        if (inWindow && !isAutoModeRef.current) {
          setIsAutoMode(true);
        } else if (!inWindow && isAutoModeRef.current) {
          setIsAutoMode(false);
        }
      } catch (err) {
        console.warn('[App] Error evaluating autopilot schedule:', err);
      }
    };

    evaluateAutoModeSchedule();
    const interval = setInterval(evaluateAutoModeSchedule, 30000);

    const onScheduleUpdate = () => {
      evaluateAutoModeSchedule();
    };
    window.addEventListener('omni_schedule_changed', onScheduleUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('omni_schedule_changed', onScheduleUpdate);
    };
  }, []);

  // On-Device AI Mode vs Cloud Mode
  const [isOnDeviceMode, setIsOnDeviceMode] = useState(true);
  const [localLatencyMs, setLocalLatencyMs] = useState(6.4);

  // Jarvis Telemetry HUD state
  const [isTelemetryHUDOpen, setIsTelemetryHUDOpen] = useState(false);

  // Current Firebase Auth User
  const [currentUser, setCurrentUser] = useState<User | null>(auth.currentUser);

  // Dual-Lane AI analysis state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [orbPhase, setOrbPhase] = useState<OrbPhase>('idle');
  const [analysisData, setAnalysisData] = useState<DualLaneAnalysisResult>({
    summary: 'Alex Rivera (VP Eng) is demanding an unvarnished ETA on the staging build #402 deployment.',
    counterpartDossier: 'Alex Rivera • VP Engineering • #product-launch',
    emotionalRegister: 'High-Stakes Pressure & Zero-Fluff Accountability',
    urgency: 'High',
    suggestionTrio: {
      witty: 'Code is compiling—unless the server catches fire, staging is live at 11:00 AM.',
      rawHonest: 'The delay was on our auth regression check. We caught the flaw before client demo, pushing in 15m.',
      directAction: 'Fix is verified locally; regression test passing. Pushing build #402 to staging in 15 minutes.',
      flirty: 'Are you this demanding with everyone, or do I get the VIP treatment? Pushing staging in 15m.',
    },
    suggestedReplies: [
      'Code is compiling—unless the server catches fire, staging is live at 11:00 AM.',
      'The delay was on our auth regression check. We caught the flaw before client demo, pushing in 15m.',
      'Fix is verified locally; regression test passing. Pushing build #402 to staging in 15 minutes.',
    ],
    tacticalAdvice: [
      'Lead with the exact timestamp. Under extreme pressure, adjectives look like excuses.',
      'Acknowledge the client visibility risk without getting defensive.',
      'Commit to immediate channel confirmation the second artifacts hit staging.'
    ],
    telemetryNotes: [
      {
        id: 'init_note_1',
        category: 'Commitment',
        label: 'Build #402 Staging Target',
        detail: 'Commitment to deliver staging deploy within 15 minutes (11:00 AM hard cutoff).',
        timestamp: '10:42 AM',
      },
      {
        id: 'init_note_2',
        category: 'Risk',
        label: 'Client Executive Escalation',
        detail: 'VP of client operations is actively pinging engineering leadership.',
        timestamp: '10:42 AM',
      },
      {
        id: 'init_note_3',
        category: 'Emotion',
        label: 'Executive Urgency',
        detail: 'Uncompromising tone; demands unambiguous milestone certainty.',
        timestamp: '10:42 AM',
      }
    ],
    telemetry: {
      latencyMs: 6.4,
      memoryMb: 19.2,
      accelerator: 'WebGPU (NPU/GPU)',
      privacyStatus: 'Shielded (Zero Network Data)',
      modelName: 'OmniWave-DualLane-v4',
    }
  });

  // Clock in status bar
  const [currentTime, setCurrentTime] = useState('9:41');
  useEffect(() => {
    testFirestoreConnection();
    const unsub = auth.onAuthStateChanged((u) => setCurrentUser(u));

    const updateTime = () => {
      const d = new Date();
      const hours = d.getHours();
      const mins = d.getMinutes();
      const formattedMins = mins < 10 ? `0${mins}` : mins;
      const formattedHours = hours % 12 || 12;
      setCurrentTime(`${formattedHours}:${formattedMins}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => {
      clearInterval(interval);
      unsub();
    };
  }, []);

  // Sync OmniVoice with HoloOrb kinetic phases
  useEffect(() => {
    const unsubVoice = omniVoice.subscribe((state) => {
      if (state === 'speaking') {
        setOrbPhase('talking');
      } else if (state === 'idle') {
        setOrbPhase((prev) => (prev === 'talking' ? 'idle' : prev));
      }
    });
    return unsubVoice;
  }, []);

  const triggerTypingState = useCallback(() => {
    setOrbPhase('texting');
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      setOrbPhase('idle');
    }, 1400);
  }, []);

  // Trigger Dual-Lane Viewport Cognition
  const analyzeActiveScreen = useCallback(async () => {
    setIsAnalyzing(true);
    setOrbPhase('analyzing');

    const screenContextText = `${currentScenario.name} - ${currentScenario.category} (${currentScenario.messages.map(m => m.text).join(' ')})`;
    const speaker = currentScenario.appHeader.title;

    try {
      const result = await onDeviceAI.processViewportCognition(
        screenContextText,
        currentDraftText,
        speaker
      );
      setAnalysisData(result);
      setLocalLatencyMs(result.telemetry.latencyMs);
      setOrbPhase('suggesting');
      return result;
    } catch (err) {
      console.error('Cognition failed:', err);
      setOrbPhase('idle');
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, [currentScenario, currentDraftText]);

  // Handle switching scenario
  const handleSelectScenario = (scenario: ScreenScenario) => {
    setCurrentScenario(scenario);
    setCurrentDraftText(scenario.defaultDraft);
    setOrbPhase('observing');
    setTimeout(() => {
      analyzeActiveScreen();
    }, 180);
  };

  // Handle uploading custom screenshot
  const handleUploadScreenshot = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setCustomScreenshot(result);
      setOrbPhase('observing');
      setTimeout(() => {
        analyzeActiveScreen();
      }, 250);
    };
    reader.readAsDataURL(file);
  };

  // Toggle real screen sharing with getDisplayMedia
  const handleToggleLiveScreenSharing = async () => {
    if (isStreaming) {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      setStream(null);
      setIsStreaming(false);
      setOrbPhase('idle');
    } else {
      try {
        if (!navigator.mediaDevices?.getDisplayMedia) {
          alert('Screen capture API is not supported on this browser/platform. You can still upload screenshots.');
          return;
        }

        const newStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false,
        });

        setStream(newStream);
        setIsStreaming(true);
        setOrbPhase('observing');

        newStream.getVideoTracks()[0].onended = () => {
          setIsStreaming(false);
          setStream(null);
          setOrbPhase('idle');
        };

        setTimeout(() => {
          analyzeActiveScreen();
        }, 900);
      } catch (err) {
        console.warn('Screen share canceled or denied:', err);
        setIsStreaming(false);
      }
    }
  };

  // Rewrite current text with target tone
  const handleRewrite = async (style: string) => {
    if (!currentDraftText.trim()) return;
    setIsAnalyzing(true);
    setOrbPhase('typing');

    try {
      const { rewritten, telemetry } = await onDeviceAI.rewriteLocally(
        currentDraftText,
        style as any
      );
      setCurrentDraftText(rewritten);
      setLocalLatencyMs(telemetry.latencyMs);
      setOrbPhase('suggesting');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Keyboard soft touch interactions
  const handleKeyPress = (char: string) => {
    setCurrentDraftText((prev) => prev + char);
    triggerTypingState();
  };

  const handleBackspace = () => {
    setCurrentDraftText((prev) => prev.slice(0, -1));
    triggerTypingState();
  };

  const handleSpace = () => {
    setCurrentDraftText((prev) => prev + ' ');
    triggerTypingState();
  };

  const isAutoModeRef = useRef(isAutoMode);
  isAutoModeRef.current = isAutoMode;

  const autoPilotToneRef = useRef(autoPilotTone);
  autoPilotToneRef.current = autoPilotTone;

  const lastAnsweredMsgIndexRef = useRef<number>(-1);

  const handleEnter = useCallback((text?: string, isAutoPilot = false) => {
    const final = text || currentDraftText;
    if (!final.trim()) return;

    setCurrentScenario((prev) => ({
      ...prev,
      messages: [
        ...prev.messages,
        {
          sender: 'me',
          text: final,
          time: 'Just now',
          isAutoPilot,
        },
      ],
    }));
    setCurrentDraftText('');
    setOrbPhase('suggesting');

    setTimeout(() => {
      analyzeActiveScreen();
    }, 450);
  }, [currentDraftText, analyzeActiveScreen]);

  // Trigger autonomous auto-dispatch with countdown
  const triggerAutoPilotDispatch = useCallback(
    (target: string, incomingContext: string, customReply?: string) => {
      const chosenReply =
        customReply ||
        analysisData.suggestionTrio[autoPilotToneRef.current] ||
        analysisData.suggestedReplies[0] ||
        'Locking in execution immediately.';

      setAutoDispatchTarget(target);
      setAutoDispatchPreviewText(chosenReply);
      setOrbPhase('auto');

      if (autoCountdownTimerRef.current) {
        clearInterval(autoCountdownTimerRef.current);
      }

      let count = 3;
      setAutoCountdown(count);

      autoCountdownTimerRef.current = setInterval(() => {
        count -= 1;
        if (count > 0) {
          setAutoCountdown(count);
        } else {
          clearInterval(autoCountdownTimerRef.current);
          setAutoCountdown(null);
          handleEnter(chosenReply, true);

          if (omniVoice.getVoiceEnabled()) {
            omniVoice.speak(chosenReply);
          }

          const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          setAnalysisData((prev) => ({
            ...prev,
            telemetryNotes: [
              {
                id: `auto_${Date.now()}`,
                category: 'Auto-Pilot',
                label: `Auto-Answered: ${target}`,
                detail: `Autonomous dispatch (${autoPilotToneRef.current.toUpperCase()}): "${chosenReply}"`,
                timestamp: nowStr,
              },
              ...prev.telemetryNotes,
            ],
          }));
        }
      }, 1000);
    },
    [analysisData, handleEnter]
  );

  const handleCancelAutoDispatch = useCallback(() => {
    if (autoCountdownTimerRef.current) {
      clearInterval(autoCountdownTimerRef.current);
    }
    setAutoCountdown(null);
    setOrbPhase('idle');
  }, []);

  const handleInstantAutoDispatch = useCallback(() => {
    if (autoCountdownTimerRef.current) {
      clearInterval(autoCountdownTimerRef.current);
    }
    const replyToSend =
      autoDispatchPreviewText ||
      analysisData.suggestionTrio[autoPilotTone] ||
      analysisData.suggestedReplies[0];
    setAutoCountdown(null);
    handleEnter(replyToSend, true);

    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setAnalysisData((prev) => ({
      ...prev,
      telemetryNotes: [
        {
          id: `auto_${Date.now()}`,
          category: 'Auto-Pilot',
          label: `Instant Auto-Answer: ${autoDispatchTarget || 'Counterpart'}`,
          detail: `Manual override dispatch (${autoPilotTone.toUpperCase()}): "${replyToSend}"`,
          timestamp: nowStr,
        },
        ...prev.telemetryNotes,
      ],
    }));
  }, [autoDispatchPreviewText, analysisData, autoPilotTone, autoDispatchTarget, handleEnter]);

  // Toggle Auto Mode
  const handleToggleAutoMode = useCallback(() => {
    setIsAutoMode((prev) => {
      const next = !prev;
      if (next) {
        setOrbPhase('auto');
        // Reset answered index to trigger on any unhandled incoming message immediately
        lastAnsweredMsgIndexRef.current = -1;
      } else {
        if (autoCountdownTimerRef.current) {
          clearInterval(autoCountdownTimerRef.current);
        }
        setAutoCountdown(null);
        setOrbPhase('idle');
      }
      return next;
    });
  }, []);

  // Continuous Auto-Pilot Watcher: Automatically answers subsequent incoming messages without manual toggling
  useEffect(() => {
    if (!isAutoMode) return;
    const msgs = currentScenario.messages;
    const lastIdx = msgs.length - 1;
    if (lastIdx < 0) return;
    const lastMsg = msgs[lastIdx];

    if (lastMsg && lastMsg.sender === 'them' && lastAnsweredMsgIndexRef.current !== lastIdx) {
      lastAnsweredMsgIndexRef.current = lastIdx;

      const timer = setTimeout(async () => {
        const res = await analyzeActiveScreen();
        const toneKey = autoPilotToneRef.current;
        const candidate = res?.suggestionTrio?.[toneKey] || res?.suggestedReplies?.[0] || 'Acknowledged and proceeding.';
        triggerAutoPilotDispatch(currentScenario.appHeader.title, lastMsg.text, candidate);
      }, 450);

      return () => clearTimeout(timer);
    }
  }, [currentScenario.messages, isAutoMode, currentScenario.appHeader.title, analyzeActiveScreen, triggerAutoPilotDispatch]);

  // Simulate new incoming counterpart message for testing Auto Mode
  const handleSimulateIncomingMessage = useCallback(() => {
    const counterpartReplies: Record<string, string[]> = {
      work_slack: [
        'Client VP is pinging me again. What is our fallback plan if staging isn’t stable by 11:00?',
        'Can you confirm when the database migration script completes on staging?',
        'Team lead asked if the health check endpoints are logging 200 OK?',
        'Understood. How soon can we notify the client that everything is live?',
      ],
      dating_hinge: [
        'Haha deal! Next question: what is your go-to midnight creative playlist when you are locked in the lab?',
        'Are you more of an impulsive road trip person or meticulous planner?',
        'What is your favorite late-night spot in the city when you need inspiration?',
      ],
      client_dispute: [
        'Can you confirm in writing that our payment gateway won’t incur any recurring penalty for this charge?',
        'Thank you for looking into this. Please send the adjusted invoice as soon as finance approves.',
        'Is there any other line item we should review before signing off on the audit?',
      ],
      terminal_bug: [
        'Crash monitor ping: port 8080 reporting high connection drop rate. Check auth middleware overhead.',
        'Core dump written to /var/log/crash.log. Session validation taking >400ms.',
        'High memory watermark hit on pod 3. Should we trigger automated pod restart?',
      ],
    };

    const options = counterpartReplies[currentScenario.id] || [
      'Hey, got a quick second to sync on our next steps?',
      'Just following up on your last update, let me know when ready.',
      'Could you confirm the next milestone timing?',
    ];
    const randomReply = options[Math.floor(Math.random() * options.length)];

    setCurrentScenario((prev) => ({
      ...prev,
      messages: [
        ...prev.messages,
        {
          sender: 'them',
          text: randomReply,
          time: 'Just now',
        },
      ],
    }));

    setOrbPhase('observing');
  }, [currentScenario.id]);

  const handleLoadIntoScreenSimulator = (title: string, body: string, sender: string) => {
    const customScenario: ScreenScenario = {
      id: `screen_${Date.now()}`,
      name: title,
      category: 'Workspace',
      icon: FolderOpen,
      appHeader: {
        title: sender,
        subtitle: title,
        avatar: '✉️',
        badge: 'WORKSPACE',
      },
      messages: [
        {
          sender: 'them',
          text: body,
          time: 'Just now',
        },
      ],
      contextHint: `Real-time context from ${title}. Inspecting live dialogue.`,
      defaultDraft: '',
    };
    setCurrentScenario(customScenario);
    setActiveTab('keyboard');
    setOrbPhase('observing');
    setTimeout(() => {
      analyzeActiveScreen();
    }, 250);
  };

  const activeScreenName = isStreaming
    ? 'Live Screen Broadcast'
    : customScreenshot
    ? 'Uploaded Screen Image'
    : currentScenario.name;

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col items-center justify-center p-0 sm:p-4 select-none">
      <OfflineIndicator />

      {/* TOP DESKTOP CONTROLS BAR (Desktop only) */}
      <div className={`w-full transition-all duration-300 ${phoneFrameMode ? 'max-w-[430px]' : 'max-w-6xl'} hidden sm:flex items-center justify-between mb-2 px-2 text-xs font-mono text-[#948eb5]`}>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#00ffcc] animate-pulse shadow-[0_0_8px_#00ffcc]" />
          <span className="font-bold text-white tracking-wider text-xs">
            Omni<span className="text-[#00ffcc]">AI</span>
          </span>
          <span className="px-1.5 py-0.5 rounded text-[8.5px] bg-[#0a071b] border border-[#2a2254] text-[#00ffcc] font-bold">
            Mobile-First OS
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsDesktopOverlayActive(!isDesktopOverlayActive)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono transition ${
              isDesktopOverlayActive
                ? 'bg-[#6366f1] text-white border-[#6366f1] font-bold shadow-[0_0_12px_rgba(99,102,241,0.5)]'
                : 'bg-[#0a071b] border-[#2a2254] hover:border-[#6366f1]/60 text-[#948eb5] hover:text-white'
            }`}
            title="Launch Floating Desktop Companion Overlay (⌘+Shift+K)"
          >
            <Laptop className="w-3.5 h-3.5" />
            <span>{isDesktopOverlayActive ? 'Dock Active' : 'PC Overlay'}</span>
          </button>
          <button
            onClick={() => setPhoneFrameMode(!phoneFrameMode)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0a071b] border border-[#2a2254] hover:border-[#6366f1]/60 text-[#948eb5] hover:text-white transition"
            title="Toggle between phone bezel and full view"
          >
            {phoneFrameMode ? <Maximize2 className="w-3.5 h-3.5" /> : <Smartphone className="w-3.5 h-3.5" />}
            <span>{phoneFrameMode ? 'Full View' : 'Phone Bezel'}</span>
          </button>
          <PWAInstallButton variant="compact" />
        </div>
      </div>

      {/* MAIN PHONE CONTAINER - Pure Matte Black (#000000) Foundation */}
      <div
        className={`w-full flex flex-col bg-[#000000] overflow-hidden transition-all duration-300 ${
          phoneFrameMode
            ? 'sm:max-w-[430px] sm:h-[min(860px,calc(100dvh-44px))] sm:rounded-[44px] sm:border-[8px] sm:border-[#0a071b] sm:shadow-[0_0_70px_rgba(42,34,84,0.4)] sm:ring-1 sm:ring-[#2a2254]'
            : 'max-w-6xl w-full h-[100dvh] rounded-none sm:rounded-2xl border-0 sm:border sm:border-[#2a2254]'
        } relative h-[100dvh] text-[#e8e6f2]`}
      >
        {/* 3D Gyro-Responsive UI Overlay Canvas */}
        <OmniVoidBackground />

        {/* 1. NATIVE MOBILE STATUS BAR */}
        <div className={`px-4 sm:px-6 flex items-center justify-between bg-[#000000] font-mono font-semibold text-[#948eb5] shrink-0 z-30 transition-all ${
          activeTab === 'studios' && selectedStudio === 'motion' ? 'pt-1 pb-0.5 text-[10px]' : 'pt-2 pb-1 text-[11px]'
        }`}>
          <span className="text-[#e8e6f2]">{currentTime}</span>

          {/* Dynamic Island / Hardware Notch */}
          <div className="w-24 h-4 bg-[#0a071b] rounded-full flex items-center justify-center gap-2 border border-[#2a2254] shadow-inner px-2">
            <div className="w-2 h-2 rounded-full bg-[#000000] border border-[#2a2254]" />
            <div className={`w-1.5 h-1.5 rounded-full ${isStreaming ? 'bg-[#00ffcc] animate-pulse' : 'bg-[#2a2254]'}`} />
          </div>

          <div className="flex items-center gap-2">
            {/* Visual Haptic Feedback Indicator Icon */}
            <button
              type="button"
              onClick={() => {
                const next = !hapticFeedback;
                setHapticFeedback(next);
                localStorage.setItem('omni_haptic_enabled', String(next));
                if (next && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
                  try { navigator.vibrate(18); } catch {}
                }
                window.dispatchEvent(new CustomEvent('omni_haptic_changed', { detail: { enabled: next } }));
              }}
              className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition ${
                hapticFeedback
                  ? 'text-[#00ffcc] bg-[#0a071b] border border-[#00ffcc]/50 shadow-[0_0_8px_rgba(0,255,204,0.35)]'
                  : 'text-[#948eb5] hover:text-[#e8e6f2] border border-transparent'
              }`}
              title={hapticFeedback ? '3D Keyboard Haptics: ENABLED (Tap to toggle)' : '3D Keyboard Haptics: DISABLED (Tap to toggle)'}
            >
              {hapticFeedback ? (
                <Vibrate className="w-3.5 h-3.5 text-[#00ffcc] animate-pulse" />
              ) : (
                <VibrateOff className="w-3.5 h-3.5 text-[#948eb5]" />
              )}
              <span className={`text-[8.5px] font-mono font-bold tracking-tight ${hapticFeedback ? 'text-[#00ffcc]' : 'text-[#948eb5]'}`}>
                {hapticFeedback ? 'ON' : 'OFF'}
              </span>
            </button>

            <Wifi className="w-3 h-3 text-[#948eb5]" />
            <Battery className="w-3.5 h-3.5 text-[#948eb5]" />
          </div>
        </div>

        {/* 2. APP HEADER: STATIC PINNED ORB & EXPLICIT OMNIAI - NEXUS BRANDING */}
        {!(activeTab === 'studios' && selectedStudio === 'motion') && (
        <header className="px-3.5 py-2.5 bg-[#000000] border-b border-[#2a2254] flex items-center justify-between shrink-0 z-20">
          {/* Static Pinned OmniAI Orb anchored to far upper-left directly adjacent to "OmniAI - Nexus" */}
          <div className="flex items-center gap-2 pl-0.5">
            <div className="relative flex items-center justify-center shrink-0 w-7 h-7 overflow-hidden rounded-full bg-[#0a071b] border border-[#2a2254]">
              <HoloOrb
                size="xs"
                className="w-7 h-7"
                phase={isAnalyzing ? 'thinking' : isAutoMode ? 'talking' : 'idle'}
              />
            </div>
            <span className="text-sm sm:text-base font-bold font-mono tracking-wider text-white">
              OmniAI<span className="text-[#00ffcc]"> - Nexus</span>
            </span>
          </div>

          {/* Far Top-Right Navigation: OmniAI Companion Toggle & OmniAI Sidebar Navigation Toggle */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Real-Time Calling Suite Toggle */}
            <button
              type="button"
              onClick={() => {
                if (hapticFeedback && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
                  try { navigator.vibrate(15); } catch {}
                }
                setIsLiveCallOpen(true);
              }}
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl bg-[#0a071b] border border-[#00ffcc]/60 text-[#00ffcc] hover:bg-[#130d2d] hover:border-[#00ffcc] transition-all shadow-[0_0_12px_rgba(0,255,204,0.25)] active:scale-95"
              title="Launch Real-Time Calling Suite (Audio HUD & Eye-Line Video)"
            >
              <Phone className="w-3.5 h-3.5 text-[#00ffcc] animate-pulse" />
              <span className="text-[10px] font-mono font-bold">Call</span>
            </button>

            {/* OmniAI Companion Toggle */}
            <button
              type="button"
              onClick={() => setIsCompanionOpen(true)}
              className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl bg-[#0a071b] border border-[#2a2254] text-[#948eb5] hover:text-[#00ffcc] hover:bg-[#130d2d] hover:border-[#00ffcc]/50 transition-all shadow-sm active:scale-95"
              title="Open OmniAI - Nexus Companion"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#00ffcc]" />
              <span className="text-[10px] font-mono font-bold hidden xs:inline">Companion</span>
            </button>

            {/* OmniAI Sidebar Toggle (Far Top-Right) */}
            <button
              type="button"
              onClick={() => setIsStudiosSidebarOpen(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-[#0a071b] border border-[#2a2254] text-[#e8e6f2] hover:text-[#00ffcc] hover:border-[#00ffcc]/50 transition-all shadow-sm active:scale-95"
              title="Open OmniAI - Nexus Navigation Drawer"
            >
              <Menu className="w-4 h-4 text-[#00ffcc]" />
              <span className="text-[10px] font-mono font-bold hidden xs:inline">Menu</span>
            </button>
          </div>
        </header>
        )}

        {/* 3. MAIN TAB CONTENT AREA */}
        <main 
          {...swipeHandlers}
          className="flex-1 overflow-hidden relative flex flex-col bg-[#000000] touch-pan-y"
        >
          {/* Mobile Horizontal Swipe Gesture Indicator for Primary Tabs */}
          {isPrimaryTab && (
            <div className="absolute top-1.5 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#0a071b]/90 backdrop-blur-md border border-[#2a2254] text-[9px] font-mono text-[#948eb5] select-none shadow-sm">
              <span className={`w-1.5 h-1.5 rounded-full transition-all ${activeTab === 'keyboard' ? 'bg-[#00ffcc] scale-125 shadow-[0_0_6px_#00ffcc]' : 'bg-[#2a2254]'}`} />
              <span className={`w-1.5 h-1.5 rounded-full transition-all ${activeTab === 'vision' ? 'bg-[#00ffcc] scale-125 shadow-[0_0_6px_#00ffcc]' : 'bg-[#2a2254]'}`} />
              <span className={`w-1.5 h-1.5 rounded-full transition-all ${activeTab === 'workspace' ? 'bg-[#00ffcc] scale-125 shadow-[0_0_6px_#00ffcc]' : 'bg-[#2a2254]'}`} />
              <span className="text-[8px] text-[#948eb5] ml-1 hidden xs:inline">⇄ Swipe Tab</span>
            </div>
          )}
          {/* SLIDE-UP JARVIS TELEMETRY HUD CARD */}
          <JarvisTelemetryHUD
            isOpen={isTelemetryHUDOpen}
            onClose={() => setIsTelemetryHUDOpen(false)}
            activeScreenTitle={activeScreenName}
            detectedSpeaker={analysisData.counterpartDossier}
            emotionalRegister={analysisData.emotionalRegister}
            telemetryNotes={analysisData.telemetryNotes}
            latencyMs={localLatencyMs}
            npuAccelerator={analysisData.telemetry.accelerator}
            onClearNotes={() => setAnalysisData(prev => ({ ...prev, telemetryNotes: [] }))}
          />

          {/* TAB 1: THE AUTHENTIC 3-PANE VIEWPORT CAROUSEL COMMAND STATION */}
          {activeTab === 'keyboard' && (
            <div className="flex flex-col h-full justify-between overflow-hidden">
              {/* 3-Pane Viewport Carousel: Left (Advice) <-> Center (Pure Messaging) <-> Right (Utility Matrix) */}
              <div className="flex-1 overflow-hidden">
                <ViewportCarousel
                  currentDraftText={currentDraftText}
                  onChangeDraftText={setCurrentDraftText}
                  onSend={handleEnter}
                  currentScenario={currentScenario}
                  onSelectScenario={handleSelectScenario}
                  customScreenshot={customScreenshot}
                  onUploadScreenshot={handleUploadScreenshot}
                  onClearCustomScreenshot={() => setCustomScreenshot(null)}
                  isAnalyzing={isAnalyzing}
                  onOpenVault={() => setIsVaultOpen(true)}
                  onOpenCompanion={() => setIsCompanionOpen(true)}
                  onOpenSidebar={() => setIsStudiosSidebarOpen(true)}
                  isAutoMode={isAutoMode}
                  onSimulateIncomingMessage={handleSimulateIncomingMessage}
                />
              </div>

              {/* Volumetric 3D Soft Keyboard Dock (collapsible) */}
              <div className="shrink-0 flex flex-col">
                <SoftKeyboard
                  onKeyPress={handleKeyPress}
                  onBackspace={handleBackspace}
                  onEnter={() => handleEnter()}
                  onSpace={handleSpace}
                  onSwipeWord={(word) => {
                    setCurrentDraftText((prev) => (prev ? (prev.endsWith(' ') ? prev + word + ' ' : prev + ' ' + word + ' ') : word + ' '));
                  }}
                  currentDraftText={currentDraftText}
                  isCollapsed={isKeyboardCollapsed}
                  onToggleCollapse={() => setIsKeyboardCollapsed(!isKeyboardCollapsed)}
                />
              </div>
            </div>
          )}

          {/* TAB 2: GEMINI CHATBOT & MULTI-LLM COUNCIL MODE */}
          {activeTab === 'chat' && (
            <div className="h-full overflow-hidden flex flex-col">
              <OmniChatAndCouncil
                onInsertToKeyboard={(text) => {
                  setCurrentDraftText(text);
                  setActiveTab('keyboard');
                }}
              />
            </div>
          )}

          {/* TAB 3: OMNI STUDIOS (14 CREATIVE ENGINES) */}
          {activeTab === 'studios' && (
            <OmniStudiosView
              selectedStudio={selectedStudio}
              onSelectStudio={(id) => setSelectedStudio(id)}
              onBackToHome={() => setActiveTab('keyboard')}
              onOpenSidebar={() => setIsStudiosSidebarOpen(true)}
              onOpenCompanion={() => setIsCompanionOpen(true)}
              onInsertToKeyboard={(text) => {
                setCurrentDraftText(text);
                setActiveTab('keyboard');
              }}
              currentScreenName={activeScreenName}
            />
          )}

          {/* TAB 4: SCREEN VISION HUD */}
          {activeTab === 'vision' && (
            <ScreenVisionHUD
              stream={stream}
              isStreaming={isStreaming}
              onStartStreaming={handleToggleLiveScreenSharing}
              onStopStreaming={handleToggleLiveScreenSharing}
              onManualScan={() => analyzeActiveScreen()}
              isAnalyzing={isAnalyzing}
              analysisData={analysisData}
              onApplyReply={(reply) => {
                setCurrentDraftText(reply);
                setActiveTab('keyboard');
              }}
              activeScreenName={activeScreenName}
            />
          )}

          {/* TAB 5: WORKSPACE HUB */}
          {activeTab === 'workspace' && (
            <WorkspaceHub
              onInsertToKeyboard={(text) => {
                setCurrentDraftText(text);
                setActiveTab('keyboard');
              }}
              onLoadIntoScreenSimulator={handleLoadIntoScreenSimulator}
              onSaveToVault={handleSaveToVault}
            />
          )}

          {/* TAB 6: EXTENSION BRIDGE */}
          {activeTab === 'extension' && (
            <KeyboardExtensionBridge />
          )}

          {/* TAB 7: PC SYNC BRIDGE */}
          {activeTab === 'sync' && (
            <DesktopSyncBridge
              onInsertToKeyboard={(text) => {
                setCurrentDraftText(text);
                setActiveTab('keyboard');
              }}
              onToggleDesktopOverlay={() => setIsDesktopOverlayActive(!isDesktopOverlayActive)}
              isDesktopOverlayActive={isDesktopOverlayActive}
            />
          )}

          {/* TAB 8: MOBILE SETUP GUIDE */}
          {activeTab === 'setup' && (
            <MobileSetupGuide
              onTestKeyboard={() => setActiveTab('keyboard')}
            />
          )}

          {/* TAB 9: ADMIN CONSOLE */}
          {activeTab === 'admin' && (
            <div className="h-full overflow-y-auto">
              <AdminHub />
            </div>
          )}

          {/* TAB 10: MY AI IDENTITY & DATA VAULT */}
          {activeTab === 'identity' && (
            <div className="h-full overflow-y-auto">
              <MyAIIdentityView onBack={() => setActiveTab('keyboard')} />
            </div>
          )}
        </main>

        {/* 4. MOBILE BOTTOM TAB NAVIGATION BAR (Hidden during OmniMotion studio editing for authentic CapCut full-height experience) */}
        {!(activeTab === 'studios' && selectedStudio === 'motion') && (
        <nav className="h-14 bg-[#000000] border-t border-[#2a2254] flex items-center justify-around px-2 shrink-0 z-30 pb-[env(safe-area-inset-bottom)]">
          {/* Enhanced Keys Button: Toggles Keyboard Show/Hide */}
          <button
            onClick={() => {
              if (activeTab !== 'keyboard') {
                setActiveTab('keyboard');
                setIsKeyboardCollapsed(false);
              } else {
                setIsKeyboardCollapsed((prev) => !prev);
              }
            }}
            className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-all ${
              activeTab === 'keyboard' && !isKeyboardCollapsed
                ? 'text-[#00ffcc] font-bold drop-shadow-[0_0_8px_rgba(0,255,204,0.7)]'
                : activeTab === 'keyboard' && isKeyboardCollapsed
                ? 'text-[#00ffcc]/60 font-semibold'
                : 'text-[#948eb5] hover:text-[#e8e6f2]'
            }`}
            title={
              activeTab === 'keyboard'
                ? isKeyboardCollapsed
                  ? 'Show Keyboard'
                  : 'Hide Keyboard'
                : 'Open Keyboard'
            }
          >
            <KeyboardIcon className="w-4 h-4 mb-0.5" />
            <span className="text-[9px] font-mono">
              {activeTab === 'keyboard' && isKeyboardCollapsed ? 'Keys: Off' : 'Keys'}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('vision')}
            className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-all relative ${
              activeTab === 'vision'
                ? 'text-[#00ffcc] font-bold drop-shadow-[0_0_8px_rgba(0,255,204,0.7)]'
                : 'text-[#948eb5] hover:text-[#e8e6f2]'
            }`}
            title="Screen Vision Cognition"
          >
            <Eye className="w-4 h-4 mb-0.5" />
            <span className="text-[9px] font-mono">Vision</span>
            {isStreaming && (
              <span className="absolute top-1 right-2 w-2 h-2 rounded-full bg-[#00ffcc] shadow-[0_0_8px_#00ffcc] animate-ping" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('workspace')}
            className={`flex flex-col items-center justify-center w-14 py-1 rounded-xl transition-all ${
              activeTab === 'workspace'
                ? 'text-[#00ffcc] font-bold drop-shadow-[0_0_8px_rgba(0,255,204,0.7)]'
                : 'text-[#948eb5] hover:text-[#e8e6f2]'
            }`}
            title="Google Workspace (Drive, Gmail, Keep)"
          >
            <FolderOpen className="w-4 h-4 mb-0.5" />
            <span className="text-[9px] font-mono">Workspace</span>
          </button>
        </nav>
        )}

        {/* Slide-out Persistent OmniNexus Panel with Voice Command Log */}
        <OmniNexusPanel
          isOpen={isCompanionOpen}
          onClose={() => setIsCompanionOpen(false)}
          onOpenFullChat={() => {
            setIsCompanionOpen(false);
            setActiveTab('chat');
          }}
          currentStudioName={activeTab === 'studios' ? (studioMeta[selectedStudio]?.name || 'Studio') : undefined}
          currentStudioTag={activeTab === 'studios' ? (studioMeta[selectedStudio]?.tag || '') : undefined}
        />

        {/* 5. NATIVE MOBILE HOME INDICATOR BAR */}
        <div className={`w-full flex justify-center shrink-0 ${
          activeTab === 'studios' && selectedStudio === 'motion' ? 'pb-0.5 pt-0.5 bg-[#000000]' : 'pb-1 pt-0.5 bg-[#000000]'
        }`}>
          <div className="w-28 h-1 rounded-full bg-[#2a2254]" />
        </div>
      </div>

      {/* 6. SYSTEM-WIDE FLOATING COMPANION WIDGET (OMNI KEY) */}
      <DesktopFloatingWidget
        isOpen={isDesktopOverlayActive}
        onToggle={() => setIsDesktopOverlayActive(!isDesktopOverlayActive)}
        phoneDraftText={currentDraftText}
        onSendToPhone={(text) => setCurrentDraftText(text)}
        onSelectSuggestion={(text) => setCurrentDraftText(text)}
        activeScreenName={activeScreenName}
        isAutoMode={isAutoMode}
        onToggleAutoMode={handleToggleAutoMode}
        autoPilotTone={autoPilotTone}
      />

      {/* 7. COLLAPSIBLE OMNIAI SIDEBAR DRAWER (Accessible from top-right navigation toggle) */}
      <OmniStudiosSidebar
        isOpen={isStudiosSidebarOpen}
        onClose={() => setIsStudiosSidebarOpen(false)}
        selectedStudio={selectedStudio}
        onSelectStudio={(id) => {
          setSelectedStudio(id);
          setActiveTab('studios');
          setIsStudiosSidebarOpen(false);
        }}
        onOpenOmniAIChat={() => {
          setActiveTab('chat');
          setIsStudiosSidebarOpen(false);
        }}
        onOpenIdentity={() => {
          setActiveTab('identity');
          setIsStudiosSidebarOpen(false);
        }}
        onOpenSettings={() => {
          setIsAdminModalOpen(true);
          setIsStudiosSidebarOpen(false);
        }}
        onOpenVault={() => {
          setIsVaultOpen(true);
          setIsStudiosSidebarOpen(false);
        }}
        onOpenAutopilot={() => {
          setIsAutoPilotSetupOpen(true);
          setIsStudiosSidebarOpen(false);
        }}
        onOpenTelemetry={() => {
          setIsTelemetryHUDOpen(true);
          setIsStudiosSidebarOpen(false);
        }}
        onOpenVision={() => {
          setActiveTab('vision');
          setIsStudiosSidebarOpen(false);
        }}
        onOpenWorkspace={() => {
          setActiveTab('workspace');
          setIsStudiosSidebarOpen(false);
        }}
      />

      {/* 8. GLOBAL VAULT ASSETS DRAWER */}
      <VaultAssetsDrawer
        isOpen={isVaultOpen}
        onClose={() => setIsVaultOpen(false)}
        assets={vaultAssets}
        onAddCustomAsset={handleSaveToVault}
        onInsertToKeyboard={(text) => {
          setCurrentDraftText(text);
          setActiveTab('keyboard');
          setIsVaultOpen(false);
        }}
      />

      {/* 9. SETTINGS & ADMIN CONSOLE MODAL */}
      {isAdminModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-6 animate-in fade-in">
          <div className="relative w-full max-w-4xl max-h-[92vh] bg-[#000000] border border-[#2a2254] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            <div className="p-3 bg-[#0a071b] border-b border-[#2a2254] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="w-4 h-4 text-[#00ffcc]" />
                <span className="font-bold text-sm text-white">OmniAI<span className="text-[#00ffcc]"> - Nexus</span> Settings & Admin Hub</span>
                <span className="text-[10px] font-mono text-[#948eb5] hidden sm:inline">• Configuration Matrix</span>
              </div>
              <div className="flex items-center gap-2">
                {/* Master Haptic Toggle */}
                <button
                  type="button"
                  onClick={() => {
                    const next = !hapticFeedback;
                    setHapticFeedback(next);
                    localStorage.setItem('omni_haptic_enabled', String(next));
                    if (next && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
                      try { navigator.vibrate(14); } catch {}
                    }
                    window.dispatchEvent(new CustomEvent('omni_haptic_changed', { detail: { enabled: next, level: hapticLevel } }));
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono font-medium transition ${
                    hapticFeedback
                      ? 'bg-[#0a071b] border-[#00ffcc]/60 text-[#00ffcc] shadow-[0_0_8px_rgba(0,255,204,0.3)]'
                      : 'bg-[#0a071b] border-[#2a2254] text-[#948eb5] hover:text-[#e8e6f2]'
                  }`}
                  title={hapticFeedback ? 'Disable 3D Keyboard Vibration' : 'Enable 3D Keyboard Vibration'}
                >
                  <Zap className={`w-3.5 h-3.5 ${hapticFeedback ? 'text-[#00ffcc]' : 'text-[#948eb5]'}`} />
                  <span className="hidden xs:inline">3D Haptics:</span>
                  <span className="font-bold">{hapticFeedback ? 'ON' : 'OFF'}</span>
                </button>

                {/* Haptic Intensity Slider Control (Purplish-Blue track #6366f1) */}
                <div 
                  className={`flex items-center gap-2 bg-[#0a071b] px-2.5 py-1 rounded-xl border border-[#2a2254] transition ${
                    hapticFeedback ? 'border-[#6366f1]/60 shadow-[0_0_8px_rgba(99,102,241,0.25)]' : 'opacity-40'
                  }`}
                  title="3D Keyboard Haptic Feedback Intensity (1-10)"
                >
                  <Sliders className="w-3.5 h-3.5 text-[#6366f1] shrink-0" />
                  <span className="text-[10px] font-mono text-[#e8e6f2] font-semibold whitespace-nowrap">
                    {hapticLevel}/10
                  </span>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    disabled={!hapticFeedback}
                    value={hapticLevel}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setHapticLevel(val);
                      localStorage.setItem('omni_haptic_level', String(val));
                      if (hapticFeedback && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
                        try {
                          navigator.vibrate(getHapticPattern(val, 'tap'));
                        } catch {}
                      }
                      window.dispatchEvent(new CustomEvent('omni_haptic_changed', { detail: { level: val, enabled: hapticFeedback } }));
                    }}
                    className="w-16 xs:w-24 accent-[#6366f1] h-1.5 bg-[#1e1642] rounded-lg cursor-pointer"
                  />
                </div>
                {/* Relocated Train Your Voice Button (from Top Bar) */}
                <button
                  type="button"
                  onClick={() => {
                    setIsAdminModalOpen(false);
                    setIsAutoPilotSetupOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono font-medium transition bg-[#0a071b] border-[#00ffcc]/50 text-[#00ffcc] hover:bg-[#00ffcc]/20 shadow-sm"
                  title="Train Your Voice: Calibrate AI Voice Clone & Persona"
                >
                  <Volume2 className="w-3.5 h-3.5 text-[#00ffcc]" />
                  <span>Train Your Voice</span>
                </button>

                <button
                  onClick={() => setIsAdminModalOpen(false)}
                  className="p-1 rounded-lg text-[#9490ac] hover:text-[#e8e6f2] hover:bg-[#1e1642] transition"
                  title="Close Settings"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              <AdminHub />
            </div>
          </div>
        </div>
      )}

      {/* 10. REAL-TIME PHONE CALL INTEGRATION VIEW */}
      <LiveCallView
        isOpen={isLiveCallOpen}
        onClose={() => setIsLiveCallOpen(false)}
        caller={liveCallCaller}
        onInsertToKeyboard={(text) => setCurrentDraftText(text)}
        onSaveToVault={handleSaveToVault}
      />

      {/* 11. OMNINEXUS MODEL & AUTONOMOUS SCHEDULE ONBOARDING MODAL */}
      <OmniNexusSetupModel
        isOpen={isAutoPilotSetupOpen}
        onClose={() => setIsAutoPilotSetupOpen(false)}
        onSaveProfile={(profile) => {
          if (profile?.voiceSettings) {
            console.log('[OmniNexus] Saved Voice Profile:', profile.voiceSettings);
          }
        }}
      />

      {/* 12. SWIPE NAVIGATION ONBOARDING GESTURE OVERLAY */}
      <SwipeOnboardingOverlay />
    </div>
  );
}
