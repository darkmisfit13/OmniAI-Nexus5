import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { 
  Sparkles, 
  Send, 
  Plus, 
  ShieldCheck, 
  ChevronRight, 
  ChevronLeft, 
  Flame, 
  Smile, 
  Zap, 
  Heart, 
  Briefcase, 
  Coffee, 
  CheckCircle2, 
  AlignLeft, 
  FileText, 
  List, 
  Copy, 
  Check, 
  Upload, 
  X, 
  AlertTriangle,
  Smartphone,
  Eye,
  Activity,
  Sliders,
  Maximize2,
  Users,
  Compass,
  Cpu,
  Brain,
  Ghost,
  Fingerprint,
  Layers,
  Scale,
  RefreshCw,
  GitBranch,
  Target
} from 'lucide-react';
import { ScreenScenario, PRESET_SCENARIOS } from './SimulatedAppView';
import { DailyInsightCard } from './DailyInsightCard';
import { triggerTactileHaptic } from '../lib/hapticFeedback';

export type PaneType = 'left' | 'center' | 'right';
export type InteractionTone = 'flirty' | 'professional' | 'direct' | 'casual';
export type CouncilAgentType = 'strategist' | 'empath' | 'ghost' | 'synthesis';

interface ViewportCarouselProps {
  currentDraftText: string;
  onChangeDraftText: (text: string) => void;
  onSend: (text: string) => void;
  currentScenario: ScreenScenario;
  onSelectScenario: (scenario: ScreenScenario) => void;
  customScreenshot: string | null;
  onUploadScreenshot: (file: File) => void;
  onClearCustomScreenshot: () => void;
  isAnalyzing: boolean;
  onOpenVault: () => void;
  onOpenCompanion: () => void;
  onOpenSidebar: () => void;
  isAutoMode?: boolean;
  onSimulateIncomingMessage?: () => void;
}

// Flagged words for Contextual Auto-Correction (No Overwrite)
interface FlaggedWordMatch {
  word: string;
  startIndex: number;
  endIndex: number;
  rationale: string;
  emotionCategory: 'tension' | 'ambiguity' | 'informality';
  pivots: [string, string, string];
}

const CONTEXTUAL_SEMANTIC_FLAGS: Record<string, { rationale: string; emotionCategory: 'tension' | 'ambiguity' | 'informality'; pivots: [string, string, string] }> = {
  dispute: {
    rationale: 'Escalation Risk: Triggers defensive friction and legal posturing.',
    emotionCategory: 'tension',
    pivots: ['reconciliation', 'billing alignment', 'clarification item'],
  },
  charge: {
    rationale: 'Transactional Sensitivity: May heighten customer budget anxiety.',
    emotionCategory: 'tension',
    pivots: ['allotment', 'invoice line item', 'balance adjustment'],
  },
  broken: {
    rationale: 'High Perceived Fragility: Undermines operational confidence.',
    emotionCategory: 'tension',
    pivots: ['anomalous state', 'under active patch', 'isolated regression'],
  },
  problem: {
    rationale: 'Negative Anchor: Focuses conversation on failure rather than resolution.',
    emotionCategory: 'tension',
    pivots: ['isolated challenge', 'target scenario', 'edge consideration'],
  },
  asap: {
    rationale: 'Ambiguous Urgency: Lacks quantifiable SLA commitment.',
    emotionCategory: 'ambiguity',
    pivots: ['within 25 minutes', 'by 2:00 PM EST', 'prior to next deployment'],
  },
  maybe: {
    rationale: 'Low Conviction: Weakens user authority and technical confidence.',
    emotionCategory: 'ambiguity',
    pivots: ['projected to', 'verified contingent on', 'targeted for'],
  },
  fine: {
    rationale: 'Subtext Friction: Commonly interpreted as passive resistance or dismissal.',
    emotionCategory: 'tension',
    pivots: ['fully aligned', 'agreed', 'proceeding as planned'],
  },
  gonna: {
    rationale: 'Informality Drift: Reduces executive authority on technical milestones.',
    emotionCategory: 'informality',
    pivots: ['will', 'scheduled to', 'committed to'],
  },
  dunno: {
    rationale: 'Uncertainty Signal: Erodes technical trust.',
    emotionCategory: 'ambiguity',
    pivots: ['confirming telemetry now', 'auditing logs for', 'verifying with team'],
  },
  delay: {
    rationale: 'Schedule Friction: Can provoke milestone anxiety.',
    emotionCategory: 'tension',
    pivots: ['re-sequencing', 'staging buffer', 'controlled window shift'],
  },
};

export const ViewportCarousel: React.FC<ViewportCarouselProps> = ({
  currentDraftText,
  onChangeDraftText,
  onSend,
  currentScenario,
  onSelectScenario,
  customScreenshot,
  onUploadScreenshot,
  onClearCustomScreenshot,
  isAnalyzing,
  onOpenVault,
  onOpenCompanion,
  onOpenSidebar,
  isAutoMode = false,
  onSimulateIncomingMessage,
}) => {
  // Viewport defaults to Center Pane ('center')
  const [activePane, setActivePane] = useState<PaneType>('center');
  const [activeTone, setActiveTone] = useState<InteractionTone>('flirty');
  const [isCouncilSynthesisEnabled, setIsCouncilSynthesisEnabled] = useState<boolean>(true);
  const [activeCouncilAgent, setActiveCouncilAgent] = useState<'strategist' | 'empath' | 'ghost'>('strategist');
  const [showDossierPopover, setShowDossierPopover] = useState(false);
  const [quickActionNotice, setQuickActionNotice] = useState<string | null>(null);
  const [mockupPlatform, setMockupPlatform] = useState<'tiktok' | 'reels' | 'shorts'>('tiktok');
  const [starterCategory, setStarterCategory] = useState<'icebreaker' | 'negotiation' | 'followup'>('icebreaker');

  // Semantic Branch Tree Modal State (Revolution 1: Contextual Auto-Correction)
  const [selectedBranchToken, setSelectedBranchToken] = useState<FlaggedWordMatch | null>(null);

  // Biometric Kinetic Keyboard Sliders (Revolution 1: Right Pane Physics)
  const [kineticFriction, setKineticFriction] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('omni_kinetic_friction');
      return saved ? parseInt(saved, 10) : 55;
    }
    return 55;
  });

  const [predictiveGripFactor, setPredictiveGripFactor] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('omni_predictive_grip');
      return saved ? parseInt(saved, 10) : 70;
    }
    return 70;
  });

  const updateKineticFriction = (val: number) => {
    setKineticFriction(val);
    if (typeof window !== 'undefined') {
      localStorage.setItem('omni_kinetic_friction', val.toString());
      window.dispatchEvent(new CustomEvent('omni_kinetic_updated'));
    }
  };

  const updatePredictiveGrip = (val: number) => {
    setPredictiveGripFactor(val);
    if (typeof window !== 'undefined') {
      localStorage.setItem('omni_predictive_grip', val.toString());
      window.dispatchEvent(new CustomEvent('omni_kinetic_updated'));
    }
  };

  const touchStartXRef = useRef<number>(0);
  const touchStartYRef = useRef<number>(0);
  const touchStartTimeRef = useRef<number>(0);

  // Trigger haptic if enabled
  const triggerHaptic = (intensity = 8) => {
    try {
      if (typeof window !== 'undefined' && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        if (localStorage.getItem('omni_haptic_enabled') !== 'false') {
          navigator.vibrate(intensity);
        }
      }
    } catch {}
  };

  // Switch active pane with haptic
  const goToPane = (pane: PaneType) => {
    triggerHaptic(10);
    setActivePane(pane);
  };

  // Touch swipe gestures between the 3 panes (Left <-> Center <-> Right)
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartXRef.current = touch.clientX;
    touchStartYRef.current = touch.clientY;
    touchStartTimeRef.current = Date.now();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartXRef.current;
    const deltaY = touch.clientY - touchStartYRef.current;
    const elapsed = Date.now() - touchStartTimeRef.current;

    // Must be primarily horizontal and swift (< 650ms)
    if (Math.abs(deltaX) > 45 && Math.abs(deltaY) < 80 && elapsed < 650) {
      if (deltaX < 0) {
        // Swiped right-to-left
        if (activePane === 'left') goToPane('center');
        else if (activePane === 'center') goToPane('right');
      } else {
        // Swiped left-to-right
        if (activePane === 'right') goToPane('center');
        else if (activePane === 'center') goToPane('left');
      }
    }
  };

  // =========================================================================
  // REVOLUTION 1: SCAN FOR NON-BLOCKING CONTEXTUAL AUTO-CORRECTION TOKENS
  // =========================================================================
  const flaggedTokens = useMemo<FlaggedWordMatch[]>(() => {
    if (!currentDraftText) return [];
    const matches: FlaggedWordMatch[] = [];
    const lower = currentDraftText.toLowerCase();

    Object.keys(CONTEXTUAL_SEMANTIC_FLAGS).forEach((keyword) => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      let m;
      while ((m = regex.exec(lower)) !== null) {
        const config = CONTEXTUAL_SEMANTIC_FLAGS[keyword];
        matches.push({
          word: currentDraftText.substring(m.index, m.index + keyword.length),
          startIndex: m.index,
          endIndex: m.index + keyword.length,
          rationale: config.rationale,
          emotionCategory: config.emotionCategory,
          pivots: config.pivots,
        });
      }
    });

    return matches;
  }, [currentDraftText]);

  // Apply vocabulary pivot seamlessly without overwriting draft
  const handleApplyPivot = (pivotWord: string) => {
    if (!selectedBranchToken) return;
    triggerHaptic(14);
    const before = currentDraftText.slice(0, selectedBranchToken.startIndex);
    const after = currentDraftText.slice(selectedBranchToken.endIndex);
    const updated = before + pivotWord + after;
    onChangeDraftText(updated);
    setSelectedBranchToken(null);
    setQuickActionNotice(`Replaced with semantic pivot: "${pivotWord}"`);
    setTimeout(() => setQuickActionNotice(null), 2200);
  };

  // =========================================================================
  // REVOLUTION 2: THE SYNDICATED COUNCIL OVERLAY SYSTEM DATA MODEL
  // =========================================================================
  const councilIntelligence = useMemo(() => {
    const counterpart = currentScenario.appHeader.title;
    const isTech = currentScenario.id === 'terminal_bug' || currentScenario.id === 'work_slack';
    const isDating = currentScenario.id === 'dating_hinge';
    const isClient = currentScenario.id === 'client_dispute';

    // 1. The Strategist Agent (Tactical Matrix)
    const strategist = {
      name: 'The Strategist',
      title: 'Tactical Matrix Agent',
      badge: 'TACTICAL ANCHOR',
      icon: Target,
      leverageScore: isClient ? '78% (Upper Hand)' : isTech ? '92% (High Control)' : '85% (Active Momentum)',
      commitmentPoints: isClient 
        ? 'Invoice #8819 audit lock; zero recurring penalty' 
        : isTech 
        ? '15-min staging push; regression validation' 
        : 'Two-way conversational reciprocity',
      trapRadar: isClient 
        ? 'Ambiguous penalty wording in clause 3.2' 
        : 'Unverified auth middleware overhead',
      recommendation: isClient
        ? 'Anchor on immediate resolution while securing non-dispute signoff in writing.'
        : isTech
        ? 'State concrete deployment window. Avoid hypothetical debugging speculation.'
        : 'Keep initiative by matching playful energy with a high-conviction question.',
      suggestedPrompt: isClient
        ? `We will apply the $240 credit note to invoice #8819 today. In exchange, please confirm sign-off on the corrected balance so we can close out this billing cycle.`
        : isTech
        ? `Staging build #402 is green across auth test suites. Deploying live in 15 minutes to eliminate the 400ms latency anomaly.`
        : `Bold move asking for controversial opinions on day one. I'll trade you my answer for your absolute top late-night coffee spot.`,
    };

    // 2. The Empath Agent (Vibe/Emotional Alignment)
    const empath = {
      name: 'The Empath',
      title: 'Vibe & Emotional Register',
      badge: 'EMOTIONAL ALIGNMENT',
      icon: Heart,
      vibeDecode: isClient 
        ? 'Guarded financial anxiety mixed with desire for quick closure.' 
        : isTech 
        ? 'High operational pressure; stakeholder impatience.' 
        : 'Playful intrigue with subtle conversational testing.',
      hiddenFriction: isClient ? 'Moderate (42%)' : isTech ? 'Elevated (58%)' : 'Minimal (12%)',
      tensionPivot: 'De-escalate defensive barriers by demonstrating immediate ownership and calm certainty.',
      recommendation: isClient
        ? 'Validate their billing frustration before stating the resolution steps.'
        : isTech
        ? 'Acknowledge milestone urgency to reassure stakeholders before giving timeline.'
        : 'Lean into the warmth of their compliment to deepen authentic rapport.',
      suggestedPrompt: isClient
        ? `Completely understand why this line item caught your attention—we appreciate you flagging it so quickly. We're already reversing the charge and will have the corrected audit over to you shortly.`
        : isTech
        ? `Totally hear you on the turnaround time. Rest assured we've isolated the exact route causing delay and are pushing the hotfix right now.`
        : `Honestly, you just made this evening 10x more interesting. Let's see if your actual taste matches that confidence. 😉`,
    };

    // 3. The Ghost Agent (The Shadow Self)
    const ghost = {
      name: 'The Ghost',
      title: 'Shadow Self Cloned Cadence',
      badge: 'AUTHENTIC REPLICA',
      icon: Ghost,
      authenticityMatch: '98.7% Cloned Cadence',
      dialectSignature: 'Clean engineering vernacular, zero corporate fluff, rapid milestone delivery.',
      habitualTokens: ['locked in', 'verified', 'staging', 'clean run', 'on it'],
      recommendation: 'Mimic your personal cadence: concise, direct, technically precise with a confident conversational tone.',
      suggestedPrompt: isClient
        ? `Audit verified. Credit applied to balance. Sending the updated statement before 2 PM today so you can sign off.`
        : isTech
        ? `Patch verified locally; zero regressions on auth. Pushing build #402 to staging now. Will ping as soon as it's live.`
        : `Fair point! Honestly a solid cold brew makes any controversial opinion totally valid. What's your go-to order?`,
    };

    // 4. Master Council Synthesis Mode (The Hybrid Tri-Agent Solution)
    const synthesis = {
      name: 'Council Synthesis',
      title: 'Tri-Agent High-Converting Hybrid',
      badge: 'COUNCIL HARMONY',
      icon: Sparkles,
      breakdown: {
        strategist: '35% Tactical Leverage',
        empath: '35% Emotional Alignment',
        ghost: '30% Authentic Persona',
      },
      rationale: 'Blends the contractual protection of The Strategist, the de-escalating warmth of The Empath, and your authentic concise voice into one conversion-optimized response.',
      suggestedPrompt: isClient
        ? `Totally understand your concern regarding invoice #8819. We have reversed the $240 charge and applied the credit note to your balance. Once finance finalizes the statement at 2 PM, I'll send it over for final sign-off with zero recurring penalties.`
        : isTech
        ? `Understood—we know how critical this window is. The auth regression is fixed, local regression tests are passing cleanly, and build #402 is deploying to staging in 15 minutes. Monitoring latency now.`
        : `Honestly, you just made this 10x more interesting. Fair point on the takeout, but I'll trade you my real answer for your best late-night spot in the city. Deal?`,
    };

    return { strategist, empath, ghost, synthesis };
  }, [currentScenario]);

  // Conversation Starter Bank categorized by current scenario
  const conversationStarters = useMemo(() => {
    return {
      icebreaker: [
        `What's the one metric on this project that keeps you up at night?`,
        `Most teams overcomplicate this stage. Where would 80% leverage take us today?`,
        `Hot take: what's the most underrated tool in your workflow right now?`,
      ],
      negotiation: [
        `To ensure we hit the deployment SLA without compromising auth security, we propose staging verification by 2 PM.`,
        `We can credit the $240 immediately to invoice #8819 as a goodwill measure while auditing the billing anomaly.`,
        `Given the critical timeline, let's lock the scope to core deliverables and defer secondary enhancements to sprint 14.`,
      ],
      followup: [
        `Following up on the auth regression patch—staging build #402 is live and stable. Let me know when you review.`,
        `Checking in on invoice #8819: credit has been applied to your balance. Have you verified on your merchant dashboard?`,
        `Did the local reproducible test run cleanly on your side? Ready to merge whenever you give the signal.`,
      ],
    };
  }, []);

  // Quick Action formatting pipelines
  const handleRunQuickAction = (action: 'grammar' | 'summarize' | 'draft' | 'bullets' | 'quickAnswers') => {
    triggerHaptic(12);
    setQuickActionNotice(`Executing ${action}...`);

    if (action === 'grammar') {
      const fixed = currentDraftText
        .trim()
        .replace(/\bi\b/g, 'I')
        .replace(/\s+/g, ' ');
      const capitalized = fixed.charAt(0).toUpperCase() + fixed.slice(1);
      const punctuated = capitalized.endsWith('.') || capitalized.endsWith('?') || capitalized.endsWith('!') ? capitalized : `${capitalized}.`;
      onChangeDraftText(punctuated || 'The auth patch has been verified and deployed to staging.');
      setQuickActionNotice('Grammar & syntax verified!');
    } else if (action === 'summarize') {
      const text = currentDraftText || currentScenario.messages[0]?.text || '';
      onChangeDraftText(`Takeaway: ${text.slice(0, 75)}... [SLA: On track]`);
      setQuickActionNotice('Summary generated!');
    } else if (action === 'draft') {
      onChangeDraftText(`Hi ${currentScenario.appHeader.title},\n\nFollowing up on our discussion: the milestone is verified and staging deployment is scheduled for 15 minutes from now. Please let me know if you need any adjustments.\n\nBest regards,`);
      setQuickActionNotice('Expanded draft generated!');
    } else if (action === 'bullets') {
      const sentences = (currentDraftText || currentScenario.messages[0]?.text || '')
        .split(/[.?!]/)
        .map((s) => s.trim())
        .filter(Boolean);
      const bulleted = (sentences.length > 0 ? sentences : ['Milestone committed', 'Regression verified', 'Live deployment scheduled'])
        .map((s) => `• ${s}`)
        .join('\n');
      onChangeDraftText(bulleted);
      setQuickActionNotice('Formatted to scannable bullets!');
    } else if (action === 'quickAnswers') {
      onChangeDraftText(`Confirmed. Proceeding with deployment now.`);
      setQuickActionNotice('Quick response loaded!');
    }

    setTimeout(() => setQuickActionNotice(null), 2000);
  };

  // Viral safe zone analysis metrics for current draft text
  const safeZoneMetrics = useMemo(() => {
    const charCount = currentDraftText.length;
    const lineCount = currentDraftText.split('\n').length;
    const maxChars = mockupPlatform === 'tiktok' ? 140 : mockupPlatform === 'reels' ? 125 : 100;
    const isExceeded = charCount > maxChars;
    const isLineOverflow = lineCount > 4;

    return {
      charCount,
      lineCount,
      maxChars,
      isExceeded,
      isLineOverflow,
      status: isExceeded || isLineOverflow ? 'Risk of UI Obstruction' : 'Safe Within Mobile Overlay',
    };
  }, [currentDraftText, mockupPlatform]);

  return (
    <div 
      className="flex flex-col h-full bg-[#000000] text-[#e8e6f2] overflow-hidden select-none relative"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ========================================================================= */}
      {/* UNIFIED PERSISTENT SUB-TRACKING ROW (Top Viewport Hierarchy)             */}
      {/* ========================================================================= */}
      <div className="px-3 py-1.5 bg-[#100d23] border-b border-[#2a2254] flex items-center justify-between text-xs font-mono shrink-0 z-30">
        
        {/* Workspace Context Tracker */}
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00ffcc] animate-pulse shrink-0 shadow-[0_0_6px_#00ffcc]" />
          <span className="text-[10px] font-bold text-white font-mono tracking-tight truncate">
            {activePane === 'left' && (
              <>OmniAI - Nexus Core <span className="text-[#00ffcc] font-normal">• Syndicated Council</span></>
            )}
            {activePane === 'center' && (
              <>OmniAI - Nexus <span className="text-[#00ffcc] font-normal">• Pure Messaging</span></>
            )}
            {activePane === 'right' && (
              <>OmniAI - Nexus Core <span className="text-[#00ffcc] font-normal">• Biometric Matrix</span></>
            )}
          </span>
        </div>

        {/* 3-Pane Micro Navigation Switcher (Council Advice | Chat | Biometric Utility) */}
        <div className="flex items-center gap-1 bg-[#000000] p-0.5 rounded-lg border border-[#2a2254] shrink-0">
          <button
            type="button"
            onClick={() => goToPane('left')}
            className={`px-2 py-0.5 rounded text-[9.5px] font-mono font-bold transition-all ${
              activePane === 'left'
                ? 'bg-[#181333] text-[#00ffcc] border border-[#00ffcc]/50 shadow-[0_0_8px_rgba(0,255,204,0.3)]'
                : 'text-[#948eb5] hover:text-white'
            }`}
            title="Swipe Left: The Syndicated Council Overlay System"
          >
            ◀ Council
          </button>

          <button
            type="button"
            onClick={() => goToPane('center')}
            className={`px-2.5 py-0.5 rounded text-[9.5px] font-mono font-bold transition-all ${
              activePane === 'center'
                ? 'bg-[#00ffcc] text-black shadow-[0_0_10px_rgba(0,255,204,0.4)]'
                : 'text-[#948eb5] hover:text-white'
            }`}
            title="Center Pane: Pure Messaging Workspace"
          >
            Chat
          </button>

          <button
            type="button"
            onClick={() => goToPane('right')}
            className={`px-2 py-0.5 rounded text-[9.5px] font-mono font-bold transition-all ${
              activePane === 'right'
                ? 'bg-[#181333] text-[#00ffcc] border border-[#00ffcc]/50 shadow-[0_0_8px_rgba(0,255,204,0.3)]'
                : 'text-[#948eb5] hover:text-white'
            }`}
            title="Swipe Right: Biometric Kinetic Utility Matrix"
          >
            Kinetic ▶
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3-PANE HORIZONTAL SLIDING CAROUSEL CONTAINER                             */}
      {/* ========================================================================= */}
      <div className="flex-1 relative overflow-hidden flex min-h-0">
        
        {/* ======================================================================= */}
        {/* PANE 1: SWIPE LEFT (THE SYNDICATED COUNCIL OVERLAY SYSTEM)              */}
        {/* ======================================================================= */}
        {activePane === 'left' && (
          <div className="w-full h-full flex flex-col bg-[#000000] overflow-y-auto p-3 space-y-3.5 animate-in slide-in-from-left duration-200">
            
            {/* Top Sub-Header Breadcrumb & Return Hook */}
            <div className="flex items-center justify-between pb-2 border-b border-[#2a2254]">
              <div>
                <h3 className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                  <Brain className="w-3.5 h-3.5 text-[#00ffcc]" />
                  The Syndicated Council Overlay System
                </h3>
                <p className="text-[10px] text-[#948eb5] font-mono">
                  Multi-agent cognitive simulation surface with 3 identity-locked tracks
                </p>
              </div>
              <button
                type="button"
                onClick={() => goToPane('center')}
                className="px-2 py-1 rounded-lg bg-[#0a071b] border border-[#00ffcc]/50 text-[#00ffcc] text-[10px] font-mono font-bold flex items-center gap-1 hover:bg-[#130d2d] transition"
              >
                <span>Chat</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* Master Council Synthesis Toggle Switch */}
            <div className="p-3 rounded-xl bg-[#0a071b] border border-[#00ffcc]/50 shadow-[0_0_12px_rgba(0,255,204,0.15)] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#00ffcc]" />
                <div>
                  <div className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                    <span>Council Synthesis</span>
                    <span className={`px-1.5 py-0.2 rounded text-[8px] font-bold ${
                      isCouncilSynthesisEnabled 
                        ? 'bg-[#00ffcc]/20 text-[#00ffcc] border border-[#00ffcc]/40' 
                        : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                    }`}>
                      {isCouncilSynthesisEnabled ? 'HYBRID ACTIVE' : 'SEPARATE TRACKS'}
                    </span>
                  </div>
                  <span className="text-[9.5px] text-[#948eb5] font-mono">
                    {isCouncilSynthesisEnabled 
                      ? 'Strategist + Empath + Ghost merged into single high-converting suggestion' 
                      : 'Showing individual agent suggestion tracks'}
                  </span>
                </div>
              </div>

              {/* Master Toggle Pill Button */}
              <button
                type="button"
                onClick={() => {
                  triggerHaptic(12);
                  setIsCouncilSynthesisEnabled(!isCouncilSynthesisEnabled);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                  isCouncilSynthesisEnabled
                    ? 'bg-[#00ffcc] text-black shadow-[0_0_12px_rgba(0,255,204,0.4)]'
                    : 'bg-[#0a071b] text-[#948eb5] border border-[#2a2254] hover:text-white'
                }`}
                title="Toggle Council Synthesis"
              >
                <span className={`w-2 h-2 rounded-full ${isCouncilSynthesisEnabled ? 'bg-black animate-ping' : 'bg-zinc-600'}`} />
                <span>{isCouncilSynthesisEnabled ? 'SYNTHESIS ON' : 'SYNTHESIS OFF'}</span>
              </button>
            </div>

            {/* When Council Synthesis is ON: Show ONLY the single high-converting hybrid suggestion, REPLACING individual agent suggestions */}
            {isCouncilSynthesisEnabled ? (
              <div className="p-3.5 rounded-xl bg-[#0a071b] border border-[#00ffcc]/50 shadow-[0_0_15px_rgba(0,255,204,0.15)] space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between pb-1.5 border-b border-[#2a2254]">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-[#00ffcc]/20 border border-[#00ffcc] flex items-center justify-center">
                      <Sparkles className="w-3.5 h-3.5 text-[#00ffcc]" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white font-mono block">Council Synthesis Suggestion</span>
                      <span className="text-[9px] text-[#00ffcc] font-mono">Tri-Agent Merged High-Converting Stream</span>
                    </div>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[8.5px] font-mono font-bold bg-[#00ffcc]/20 text-[#00ffcc] border border-[#00ffcc]/40">
                    CONVERSION: 98.4%
                  </span>
                </div>

                {/* Synthesis Breakdown Matrix */}
                <div className="grid grid-cols-3 gap-1.5 py-1 text-[9px] font-mono">
                  <div className="p-1.5 rounded-lg bg-[#0a071b] border border-[#2a2254] text-center">
                    <span className="text-[#00ffcc] block font-bold">35% Leverage</span>
                    <span className="text-[#948eb5] text-[8px]">The Strategist</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-[#0a071b] border border-[#2a2254] text-center">
                    <span className="text-[#00ffcc] block font-bold">35% Softening</span>
                    <span className="text-[#948eb5] text-[8px]">The Empath</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-[#0a071b] border border-[#2a2254] text-center">
                    <span className="text-[#00ffcc] block font-bold">30% Cadence</span>
                    <span className="text-[#948eb5] text-[8px]">The Ghost</span>
                  </div>
                </div>

                <div className="text-[10px] text-[#948eb5] font-mono leading-relaxed bg-[#0a071b] p-2 rounded-lg border border-[#2a2254]">
                  <span className="text-[#00ffcc] font-bold block mb-0.5">Council Alignment Rationale:</span>
                  {councilIntelligence.synthesis.rationale}
                </div>

                {/* Single Consolidated High-Converting Hybrid Suggestion */}
                <div className="p-3 rounded-xl bg-[#000000] border border-[#00ffcc]/60 shadow-inner space-y-2">
                  <div className="flex items-center justify-between text-[9px] font-mono text-[#00ffcc]">
                    <span className="font-bold flex items-center gap-1">
                      <Zap className="w-3 h-3 text-[#00ffcc]" /> Single High-Converting Hybrid Suggestion
                    </span>
                    <span className="text-[#00ffcc] font-bold">Replaces Individual Suggestions</span>
                  </div>
                  <p className="text-xs text-white leading-relaxed font-sans font-medium">
                    "{councilIntelligence.synthesis.suggestedPrompt}"
                  </p>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic(12);
                        onChangeDraftText(councilIntelligence.synthesis.suggestedPrompt);
                        goToPane('center');
                      }}
                      className="flex-1 py-1.5 rounded-lg bg-[#0a071b] hover:bg-[#130d2d] border border-[#00ffcc]/60 text-[#00ffcc] text-[10px] font-mono font-bold flex items-center justify-center gap-1 transition"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Insert into Draft</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic(16);
                        onSend(councilIntelligence.synthesis.suggestedPrompt);
                        goToPane('center');
                      }}
                      className="py-1.5 px-3 rounded-lg bg-[#6366f1] hover:bg-[#797ef9] text-white text-[10px] font-mono font-extrabold flex items-center justify-center gap-1 shadow-[0_0_12px_rgba(99,102,241,0.5)] transition"
                    >
                      <Send className="w-3 h-3" />
                      <span>Deploy to Chat</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* When Council Synthesis is OFF: Show individual agent suggestion tracks */
              <div className="space-y-3">
                {/* Horizontal Carousel Switcher for the Individual Agent Tracks */}
                <div className="grid grid-cols-3 gap-1 p-1 bg-[#100d23] rounded-xl border border-[#2a2254]">
                  {[
                    { id: 'strategist', label: 'Strategist', icon: Target, color: 'text-indigo-400' },
                    { id: 'empath', label: 'Empath', icon: Heart, color: 'text-rose-400' },
                    { id: 'ghost', label: 'Ghost', icon: Ghost, color: 'text-emerald-400' },
                  ].map((agent) => {
                    const Icon = agent.icon;
                    const isSelected = activeCouncilAgent === agent.id;
                    return (
                      <button
                        key={agent.id}
                        type="button"
                        onClick={() => {
                          triggerHaptic(10);
                          setActiveCouncilAgent(agent.id as any);
                        }}
                        className={`py-1.5 px-1 rounded-lg text-center font-mono transition-all flex flex-col items-center justify-center gap-0.5 ${
                          isSelected
                            ? 'bg-[#00ffcc] text-black font-bold shadow-[0_0_10px_rgba(0,255,204,0.3)]'
                            : 'bg-[#181333] text-[#948eb5] hover:text-white border border-[#2a2254]'
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-black' : agent.color}`} />
                        <span className="text-[9px] truncate">{agent.label}</span>
                      </button>
                    );
                  })}
                </div>

            {/* TRACK 1: THE STRATEGIST */}
            {activeCouncilAgent === 'strategist' && (
              <div className="p-3.5 rounded-xl bg-[#100d23] border border-indigo-500/40 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between pb-1.5 border-b border-[#2a2254]">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-indigo-500/20 border border-indigo-400 flex items-center justify-center">
                      <Target className="w-3.5 h-3.5 text-indigo-400" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white font-mono block">The Strategist Agent</span>
                      <span className="text-[9px] text-indigo-400 font-mono">Tactical Matrix & Negotiation Leverage</span>
                    </div>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[8.5px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                    TACTICAL
                  </span>
                </div>

                <div className="space-y-2 text-[10px] font-mono">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-[#181333] border border-[#2a2254]">
                    <span className="text-[#948eb5]">Negotiation Leverage:</span>
                    <span className="text-indigo-300 font-bold">{councilIntelligence.strategist.leverageScore}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#181333] border border-[#2a2254] space-y-1">
                    <span className="text-[#948eb5] block text-[9px] uppercase font-bold">Commitment Points Tracked:</span>
                    <span className="text-[#e8e6f2] block leading-tight">{councilIntelligence.strategist.commitmentPoints}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#181333] border border-[#2a2254] space-y-1">
                    <span className="text-[#948eb5] block text-[9px] uppercase font-bold">Conversational Trap Radar:</span>
                    <span className="text-amber-300 block leading-tight">{councilIntelligence.strategist.trapRadar}</span>
                  </div>
                </div>

                {/* Strategist Response Prompt */}
                <div className="p-3 rounded-xl bg-[#0b0a14] border border-indigo-500/50 space-y-2">
                  <span className="text-[9px] font-mono text-indigo-400 font-bold block">
                    Strategic Counter-Proposal:
                  </span>
                  <p className="text-xs text-white leading-relaxed font-sans">
                    "{councilIntelligence.strategist.suggestedPrompt}"
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic(12);
                      onChangeDraftText(councilIntelligence.strategist.suggestedPrompt);
                      goToPane('center');
                    }}
                    className="w-full py-1.5 rounded-lg bg-[#181333] hover:bg-indigo-950/60 border border-indigo-400/60 text-indigo-300 text-[10px] font-mono font-bold flex items-center justify-center gap-1 transition"
                  >
                    <span>Insert Tactical Proposal</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            {/* TRACK 2: THE EMPATH */}
            {activeCouncilAgent === 'empath' && (
              <div className="p-3.5 rounded-xl bg-[#100d23] border border-rose-500/40 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between pb-1.5 border-b border-[#2a2254]">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-rose-500/20 border border-rose-400 flex items-center justify-center">
                      <Heart className="w-3.5 h-3.5 text-rose-400" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white font-mono block">The Empath Agent</span>
                      <span className="text-[9px] text-rose-400 font-mono">Vibe Alignment & Subtext Decoding</span>
                    </div>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[8.5px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                    VIBE
                  </span>
                </div>

                <div className="space-y-2 text-[10px] font-mono">
                  <div className="p-2 rounded-lg bg-[#181333] border border-[#2a2254] space-y-1">
                    <span className="text-[#948eb5] block text-[9px] uppercase font-bold">Subtext Decoding:</span>
                    <span className="text-rose-200 block leading-tight">{councilIntelligence.empath.vibeDecode}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-[#181333] border border-[#2a2254]">
                    <span className="text-[#948eb5]">Hidden Friction Index:</span>
                    <span className="text-rose-300 font-bold">{councilIntelligence.empath.hiddenFriction}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#181333] border border-[#2a2254] space-y-1">
                    <span className="text-[#948eb5] block text-[9px] uppercase font-bold">Tension Softening Pivot:</span>
                    <span className="text-[#e8e6f2] block leading-tight">{councilIntelligence.empath.tensionPivot}</span>
                  </div>
                </div>

                {/* Empath Response Prompt */}
                <div className="p-3 rounded-xl bg-[#0b0a14] border border-rose-500/50 space-y-2">
                  <span className="text-[9px] font-mono text-rose-400 font-bold block">
                    Empathic Resonance Phrasing:
                  </span>
                  <p className="text-xs text-white leading-relaxed font-sans">
                    "{councilIntelligence.empath.suggestedPrompt}"
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic(12);
                      onChangeDraftText(councilIntelligence.empath.suggestedPrompt);
                      goToPane('center');
                    }}
                    className="w-full py-1.5 rounded-lg bg-[#181333] hover:bg-rose-950/60 border border-rose-400/60 text-rose-300 text-[10px] font-mono font-bold flex items-center justify-center gap-1 transition"
                  >
                    <span>Insert Empathic Phrasing</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            {/* TRACK 3: THE GHOST */}
            {activeCouncilAgent === 'ghost' && (
              <div className="p-3.5 rounded-xl bg-[#100d23] border border-emerald-500/40 space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between pb-1.5 border-b border-[#2a2254]">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-400 flex items-center justify-center">
                      <Ghost className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white font-mono block">The Ghost Agent</span>
                      <span className="text-[9px] text-emerald-400 font-mono">The Shadow Self (Cloned Voice & Vernacular)</span>
                    </div>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[8.5px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    AUTHENTIC
                  </span>
                </div>

                <div className="space-y-2 text-[10px] font-mono">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-[#181333] border border-[#2a2254]">
                    <span className="text-[#948eb5]">Authenticity Metric:</span>
                    <span className="text-emerald-300 font-bold">{councilIntelligence.ghost.authenticityMatch}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#181333] border border-[#2a2254] space-y-1">
                    <span className="text-[#948eb5] block text-[9px] uppercase font-bold">Dialect Signature:</span>
                    <span className="text-[#e8e6f2] block leading-tight">{councilIntelligence.ghost.dialectSignature}</span>
                  </div>
                  <div className="p-2 rounded-lg bg-[#181333] border border-[#2a2254]">
                    <span className="text-[#948eb5] block text-[9px] uppercase font-bold mb-1">Cloned Vernacular Tokens:</span>
                    <div className="flex flex-wrap gap-1">
                      {councilIntelligence.ghost.habitualTokens.map((tok, i) => (
                        <span key={i} className="px-1.5 py-0.5 rounded bg-[#100d23] border border-emerald-500/40 text-[8.5px] text-emerald-300 font-bold">
                          "{tok}"
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Ghost Response Prompt */}
                <div className="p-3 rounded-xl bg-[#0b0a14] border border-emerald-500/50 space-y-2">
                  <span className="text-[9px] font-mono text-emerald-400 font-bold block">
                    Authentic Cloned Voice Phrasing:
                  </span>
                  <p className="text-xs text-white leading-relaxed font-sans">
                    "{councilIntelligence.ghost.suggestedPrompt}"
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic(12);
                      onChangeDraftText(councilIntelligence.ghost.suggestedPrompt);
                      goToPane('center');
                    }}
                    className="w-full py-1.5 rounded-lg bg-[#181333] hover:bg-emerald-950/60 border border-emerald-400/60 text-emerald-300 text-[10px] font-mono font-bold flex items-center justify-center gap-1 transition"
                  >
                    <span>Insert Authentic Cloned Voice</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
              </div>
            )}

            {/* Profile-Tailored Conversation Starter Bank */}
            <div className="p-3 rounded-xl bg-[#100d23] border border-[#2a2254] space-y-2">
              <div className="flex items-center justify-between text-[10.5px] font-mono">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <AlignLeft className="w-3.5 h-3.5 text-[#00ffcc]" />
                  Conversation Starter Bank
                </span>
                <span className="text-[9.5px] text-[#948eb5]">Profile-Tailored</span>
              </div>

              {/* Category Matrix */}
              <div className="grid grid-cols-3 gap-1">
                {[
                  { id: 'icebreaker', label: 'Icebreakers' },
                  { id: 'negotiation', label: 'Negotiation' },
                  { id: 'followup', label: 'Follow-Up' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setStarterCategory(cat.id as any)}
                    className={`py-1 text-[10px] font-mono rounded-lg transition ${
                      starterCategory === cat.id
                        ? 'bg-[#181333] text-[#00ffcc] border border-[#00ffcc]/50 font-bold'
                        : 'text-[#948eb5] hover:text-white bg-[#000000] border border-[#2a2254]'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Starter Prompt Cards */}
              <div className="space-y-1.5">
                {conversationStarters[starterCategory].map((starter, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      triggerHaptic(10);
                      onChangeDraftText(starter);
                      goToPane('center');
                    }}
                    className="w-full text-left p-2 rounded-lg bg-[#181333] border border-[#2a2254] hover:border-[#00ffcc]/50 text-[11px] text-[#e8e6f2] hover:text-white transition flex items-start gap-1.5 group"
                  >
                    <span className="text-[#00ffcc] font-mono text-[9px] mt-0.5">•</span>
                    <span className="leading-snug">{starter}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ======================================================================= */}
        {/* PANE 2: CENTER VIEWPORT (THE PURE MESSAGING WORKSPACE)                  */}
        {/* ======================================================================= */}
        {activePane === 'center' && (
          <div className="w-full h-full flex flex-col bg-[#000000] overflow-hidden relative">
            
            {/* Sub-Header Line: Scenario Selector & Live Cognition Dossier Indicator */}
            <div className="px-3 py-1.5 bg-[#0a071b] border-b border-[#2a2254] flex items-center justify-between text-xs font-mono shrink-0">
              {/* Scenario Switcher Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                {PRESET_SCENARIOS.map((sc) => {
                  const isSelected = !customScreenshot && currentScenario.id === sc.id;
                  const Icon = sc.icon;
                  return (
                    <button
                      key={sc.id}
                      type="button"
                      onClick={() => {
                        if (customScreenshot) onClearCustomScreenshot();
                        onSelectScenario(sc);
                      }}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10.5px] font-medium transition-all shrink-0 ${
                        isSelected
                          ? 'bg-[#0a071b] text-[#00ffcc] border border-[#00ffcc]/50 shadow-[0_0_8px_rgba(0,255,204,0.2)] font-bold'
                          : 'text-[#948eb5] hover:text-[#e8e6f2] hover:bg-[#130d2d]'
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      <span>{sc.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* Low-profile Live Cognition Dossier Icon Indicator */}
              <div className="flex items-center gap-1.5 shrink-0 ml-1.5 relative">
                <button
                  type="button"
                  onClick={() => setShowDossierPopover((prev) => !prev)}
                  className={`p-1.5 rounded-lg border transition-all flex items-center gap-1 ${
                    showDossierPopover
                      ? 'bg-[#00ffcc] text-black border-[#00ffcc] shadow-[0_0_10px_rgba(0,255,204,0.4)]'
                      : 'bg-[#0a071b] text-[#00ffcc] border-[#2a2254] hover:border-[#00ffcc]/50'
                  }`}
                  title="Live Cognition Dossier Indicator"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold font-mono hidden xs:inline">Dossier</span>
                </button>

                {/* Compact Popover */}
                {showDossierPopover && (
                  <div className="absolute top-8 right-0 w-64 bg-[#0a071b] border border-[#00ffcc]/50 rounded-xl p-3 shadow-2xl z-40 space-y-2 animate-in fade-in duration-100">
                    <div className="flex items-center justify-between border-b border-[#2a2254] pb-1.5">
                      <span className="text-[11px] font-bold text-[#00ffcc] flex items-center gap-1 font-mono">
                        <ShieldCheck className="w-3.5 h-3.5" /> Live Cognition Dossier
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowDossierPopover(false)}
                        className="text-[#948eb5] hover:text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="space-y-1.5 text-[10.5px] font-mono">
                      <div>
                        <span className="text-[#948eb5] block text-[9px] uppercase font-bold">Counterpart:</span>
                        <span className="text-[#e8e6f2] font-semibold">{currentScenario.appHeader.title}</span>
                      </div>
                      <div>
                        <span className="text-[#948eb5] block text-[9px] uppercase font-bold">Tactical Strategy:</span>
                        <p className="text-[#e8e6f2] leading-tight">{currentScenario.contextHint}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Center Feed: Continuous, Scrollable Chat Transcript */}
            <div className="flex-1 relative overflow-y-auto p-3 flex flex-col justify-between min-h-0 bg-[#000000] space-y-3">
              <DailyInsightCard />

              {customScreenshot ? (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="relative max-h-[200px] rounded-xl overflow-hidden border border-[#2a2254] shadow-xl">
                    <img
                      src={customScreenshot}
                      alt="Uploaded screen"
                      className="max-h-[200px] object-contain rounded-xl"
                    />
                    <div className="absolute top-2 right-2">
                      <button
                        type="button"
                        onClick={onClearCustomScreenshot}
                        className="px-2 py-1 rounded-md bg-black/90 text-[#e8e6f2] text-[10px] font-mono hover:bg-[#0a071b] transition border border-[#2a2254]"
                      >
                        Clear Screen
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {/* Counterpart Contact Profile */}
                  <div className="flex items-center justify-between pb-2 border-b border-[#2a2254]">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#0a071b] border border-[#2a2254] flex items-center justify-center text-xs shadow-inner">
                        {currentScenario.appHeader.avatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-[#e8e6f2]">
                            {currentScenario.appHeader.title}
                          </span>
                          {currentScenario.appHeader.badge && (
                            <span className="px-1.5 py-0.2 rounded text-[8px] font-mono font-bold bg-[#00ffcc]/15 text-[#00ffcc] border border-[#00ffcc]/40">
                              {currentScenario.appHeader.badge}
                            </span>
                          )}
                        </div>
                        <span className="text-[9.5px] text-[#948eb5] font-mono block leading-none mt-0.5">
                          {currentScenario.appHeader.subtitle}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-[9px] font-mono text-[#948eb5]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00ffcc] animate-ping" />
                      <span>Active</span>
                    </div>
                  </div>

                  {/* Messages Transcript */}
                  <div className="space-y-2 py-1">
                    {currentScenario.messages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex flex-col ${
                          msg.sender === 'them' ? 'items-start' : 'items-end'
                        }`}
                      >
                        <div
                          className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed shadow-lg ${
                            msg.sender === 'them'
                              ? 'bg-[#0a071b] text-[#e8e6f2] border border-[#2a2254] rounded-tl-sm'
                              : msg.isAutoPilot
                              ? 'bg-[#130d2d] text-[#e8e6f2] border border-[#00ffcc]/50 rounded-tr-sm shadow-[0_0_12px_rgba(0,255,204,0.15)]'
                              : 'bg-[#6366f1] text-white font-medium rounded-tr-sm border border-[#6366f1] shadow-[0_0_12px_rgba(99,102,241,0.4)]'
                          }`}
                        >
                          {msg.text}
                        </div>
                        <span className="text-[9px] text-[#948eb5] font-mono mt-0.5 px-1">
                          {msg.time} {msg.isAutoPilot && '• ⚡ Auto-Pilot'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* REVOLUTION 1: Contextual Auto-Correction Interactive Tokens (No Overwrite) */}
              {flaggedTokens.length > 0 && (
                <div className="p-2 rounded-xl bg-[#100d23] border border-[#00ffcc]/40 space-y-1.5 animate-in fade-in">
                  <div className="flex items-center justify-between text-[9px] font-mono">
                    <span className="text-[#00ffcc] font-bold flex items-center gap-1">
                      <GitBranch className="w-3 h-3 text-[#00ffcc]" />
                      Semantic Branch Tokens ({flaggedTokens.length})
                    </span>
                    <span className="text-[#948eb5]">Tap token to review pivots</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {flaggedTokens.map((tok, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => {
                          triggerHaptic(10);
                          setSelectedBranchToken(tok);
                        }}
                        className="px-2 py-0.5 rounded-md bg-[#181333] border-b-2 border-b-[#00ffcc] border-t border-l border-r border-[#2a2254] text-[10.5px] font-mono text-white hover:bg-[#201a44] transition flex items-center gap-1 shadow-[0_0_6px_rgba(0,255,204,0.2)]"
                      >
                        <span className="font-semibold underline decoration-[#00ffcc] decoration-wavy">{tok.word}</span>
                        <span className="text-[8px] text-[#00ffcc]">⚙</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Bottom live draft preview */}
              <div className="pt-2 border-t border-[#2a2254] flex items-center justify-between text-[10.5px] font-mono text-[#948eb5]">
                <span className="truncate pr-2">
                  Draft: <span className="text-[#e8e6f2] font-medium">{currentDraftText || '(empty)'}</span>
                </span>
                {onSimulateIncomingMessage && (
                  <button
                    type="button"
                    onClick={onSimulateIncomingMessage}
                    className="text-[9px] text-[#00ffcc] hover:underline font-bold shrink-0"
                  >
                    + Counterpart Msg
                  </button>
                )}
              </div>
            </div>

            {/* SEMANTIC BRANCH TREE MODAL / POPOVER */}
            {selectedBranchToken && (
              <div className="absolute inset-x-3 bottom-14 z-50 bg-[#100d23] border-2 border-[#00ffcc] rounded-2xl p-3.5 shadow-2xl animate-in zoom-in-95 duration-150 space-y-2.5">
                <div className="flex items-center justify-between border-b border-[#2a2254] pb-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-white font-mono">
                    <GitBranch className="w-4 h-4 text-[#00ffcc]" />
                    <span>Semantic Branch Tree: "{selectedBranchToken.word}"</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedBranchToken(null)}
                    className="text-[#948eb5] hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-[10px] font-mono bg-[#0b0a14] p-2 rounded-lg border border-[#2a2254] text-[#948eb5] leading-relaxed">
                  <span className="text-[#00ffcc] font-bold block mb-0.5">Engine Flag Rationale:</span>
                  {selectedBranchToken.rationale}
                </div>

                <div className="space-y-1.5">
                  <span className="text-[9.5px] font-mono font-bold text-[#e8e6f2] block">
                    Contextual Vocabulary Pivots (No Overwrite):
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {selectedBranchToken.pivots.map((pivot, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleApplyPivot(pivot)}
                        className="p-2 rounded-xl bg-[#181333] hover:bg-[#221b4a] border border-[#00ffcc]/50 hover:border-[#00ffcc] text-left transition group shadow-sm flex flex-col justify-between"
                      >
                        <span className="text-[8px] font-mono text-[#00ffcc] uppercase block mb-1">
                          Option {idx + 1}
                        </span>
                        <span className="text-[10.5px] font-mono font-bold text-white group-hover:text-[#00ffcc] leading-tight">
                          "{pivot}"
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => setSelectedBranchToken(null)}
                    className="text-[10px] font-mono text-[#948eb5] hover:text-white px-2 py-1"
                  >
                    Keep Original
                  </button>
                </div>
              </div>
            )}

            {/* Bottom Input HUD: Single clean text input box with explicit "+" button token */}
            <div className="p-2.5 bg-[#000000] border-t border-[#2a2254] flex items-center gap-2 shrink-0">
              
              {/* Explicit "+" Button Token for Vault asset uploads / media library */}
              <button
                type="button"
                onClick={() => {
                  triggerHaptic(12);
                  onOpenVault();
                }}
                className="w-9 h-9 rounded-xl bg-[#0a071b] border border-[#2a2254] hover:border-[#6366f1] hover:bg-[#130d2d] text-[#00ffcc] flex items-center justify-center transition active:scale-95 shrink-0"
                title="Upload media asset from Global Vault (+)"
              >
                <Plus className="w-5 h-5 text-[#00ffcc] stroke-[2.5]" />
              </button>

              {/* Clean Text Input Box */}
              <div className="relative flex-1">
                <input
                  type="text"
                  value={currentDraftText}
                  onChange={(e) => onChangeDraftText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (currentDraftText.trim()) onSend(currentDraftText);
                    }
                  }}
                  placeholder="Type with OmniAI - Nexus..."
                  className="w-full rounded-xl bg-[#0a071b] border border-[#2a2254] px-3.5 py-2 text-xs text-[#e8e6f2] placeholder-[#7d779f] focus:outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1]/50 font-mono transition-all pr-8 shadow-inner"
                />
                {currentDraftText && (
                  <button
                    type="button"
                    onClick={() => onChangeDraftText('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#948eb5] hover:text-white p-0.5 font-bold"
                    title="Clear text"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Quick Council Indicator / Selector */}
              <button
                type="button"
                onClick={() => goToPane('left')}
                className="px-2 py-2 rounded-xl bg-[#0a071b] border border-[#2a2254] text-[#00ffcc] hover:border-[#00ffcc]/50 transition text-[10px] font-mono font-bold shrink-0 capitalize"
                title="Council Synthesis (Tap to open Advice Workspace)"
              >
                Council
              </button>

              {/* Send Button: Purplish-Blue (#6366f1 / Electric Indigo) */}
              <button
                type="button"
                onClick={() => {
                  if (currentDraftText.trim()) onSend(currentDraftText);
                }}
                disabled={!currentDraftText.trim()}
                className="w-9 h-9 rounded-xl bg-[#6366f1] hover:bg-[#797ef9] text-white font-extrabold border border-[#6366f1] shadow-[0_0_15px_rgba(99,102,241,0.45)] active:scale-95 transition-all disabled:opacity-30 flex items-center justify-center shrink-0"
                title="Send message"
              >
                <Send className="w-4 h-4 text-white stroke-[2.5]" />
              </button>
            </div>
          </div>
        )}

        {/* ======================================================================= */}
        {/* PANE 3: SWIPE RIGHT (THE BIOMETRIC KINETIC KEYBOARD & UTILITY MATRIX)   */}
        {/* ======================================================================= */}
        {activePane === 'right' && (
          <div className="w-full h-full flex flex-col bg-[#000000] overflow-y-auto p-3 space-y-3.5 animate-in slide-in-from-right duration-200">
            
            {/* Top Sub-Header Breadcrumb & Return Hook */}
            <div className="flex items-center justify-between pb-2 border-b border-[#2a2254]">
              <div>
                <h3 className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                  <Fingerprint className="w-3.5 h-3.5 text-[#00ffcc]" />
                  Biometric Kinetic Matrix
                </h3>
                <p className="text-[10px] text-[#948eb5] font-mono">
                  Sensory-driven input architecture & predictive boundary physics
                </p>
              </div>
              <button
                type="button"
                onClick={() => goToPane('center')}
                className="px-2 py-1 rounded-lg bg-[#100d23] border border-[#00ffcc]/50 text-[#00ffcc] text-[10px] font-mono font-bold flex items-center gap-1 hover:bg-[#181333] transition"
              >
                <ChevronLeft className="w-3 h-3" />
                <span>Chat</span>
              </button>
            </div>

            {quickActionNotice && (
              <div className="px-3 py-1.5 rounded-lg bg-[#00ffcc]/20 border border-[#00ffcc]/50 text-[#00ffcc] text-xs font-mono font-bold animate-in fade-in flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" />
                <span>{quickActionNotice}</span>
              </div>
            )}

            {/* KEYBOARD PHYSICS SUB-PANEL */}
            <div className="p-3.5 rounded-xl bg-[#0a071b] border border-[#1e1642] space-y-3.5 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
              <div className="flex items-center justify-between pb-1.5 border-b border-[#2a2254]">
                <div className="flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-[#00ffcc]" />
                  <span className="text-xs font-bold text-white font-mono">
                    Keyboard Physics
                  </span>
                </div>
                <span className="text-[9px] font-mono text-[#00ffcc] font-bold px-1.5 py-0.5 rounded bg-[#00ffcc]/10 border border-[#00ffcc]/30">
                  HAPTIC & TARGET MODULATOR
                </span>
              </div>

              {/* Slider 1: Kinetic Friction (Purplish-Blue progress track #6366f1) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#e8e6f2] font-semibold flex items-center gap-1">
                    Kinetic Friction:
                  </span>
                  <span className="text-[#00ffcc] font-bold">{kineticFriction}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={kineticFriction}
                  onChange={(e) => updateKineticFriction(parseInt(e.target.value, 10))}
                  className="w-full accent-[#6366f1] bg-[#1e1642] h-2 rounded-lg cursor-pointer"
                />
                <p className="text-[9.5px] text-[#948eb5] font-mono leading-tight">
                  Creates micro-haptic dampening on the mobile screen if typing with an erratic or angry cadence.
                </p>
              </div>

              {/* Slider 2: Predictive Grip Factor (Purplish-Blue progress track #6366f1) */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-[#e8e6f2] font-semibold flex items-center gap-1">
                    Predictive Grip Factor:
                  </span>
                  <span className="text-[#00ffcc] font-bold">{predictiveGripFactor}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={predictiveGripFactor}
                  onChange={(e) => updatePredictiveGrip(parseInt(e.target.value, 10))}
                  className="w-full accent-[#6366f1] bg-[#1e1642] h-2 rounded-lg cursor-pointer"
                />
                <p className="text-[9.5px] text-[#948eb5] font-mono leading-tight">
                  Calculates next-character mathematical probability and dynamically scales touch boundaries to fit your thumbs.
                </p>
              </div>

              {/* Cadence Telemetry Monitor Card */}
              <div className="p-2 rounded-lg bg-[#000000] border border-[#2a2254] flex items-center justify-between text-[10px] font-mono">
                <div>
                  <span className="text-[#948eb5] block text-[8.5px]">Cadence Telemetry:</span>
                  <span className="text-[#00ffcc] font-bold">Stable Rhythm (62 WPM)</span>
                </div>
                <div className="text-right">
                  <span className="text-[#948eb5] block text-[8.5px]">Dampening Threshold:</span>
                  <span className="text-[#00ffcc] font-bold">&gt; {100 - Math.round(kineticFriction * 0.4)}ms</span>
                </div>
              </div>
            </div>

            {/* Consolidated Quick Actions */}
            <div className="p-3 rounded-xl bg-[#0a071b] border border-[#2a2254] space-y-2">
              <div className="flex items-center justify-between text-[10.5px] font-mono">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-[#00ffcc]" />
                  Consolidated Quick Actions
                </span>
                <span className="text-[9.5px] text-[#00ffcc]">Single-Tap Pipeline</span>
              </div>

              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { id: 'grammar', label: 'Fix Grammar', icon: CheckCircle2 },
                  { id: 'summarize', label: 'Summarize', icon: FileText },
                  { id: 'draft', label: 'Expand Draft', icon: Copy },
                  { id: 'bullets', label: 'Format Bullets', icon: List },
                  { id: 'quickAnswers', label: 'Quick Answers', icon: Zap },
                ].map((act) => {
                  const Icon = act.icon;
                  return (
                    <button
                      key={act.id}
                      type="button"
                      onClick={() => handleRunQuickAction(act.id as any)}
                      className="p-2 rounded-lg bg-[#0a071b] border border-[#2a2254] hover:border-[#6366f1]/60 text-left transition flex items-center gap-2 group"
                    >
                      <Icon className="w-3.5 h-3.5 text-[#00ffcc] group-hover:scale-110 transition-transform" />
                      <span className="text-xs font-mono font-semibold text-[#e8e6f2] group-hover:text-white">
                        {act.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Viral Safe Zone Visualizer & Boundaries */}
            <div className="p-3 rounded-xl bg-[#100d23] border border-[#2a2254] space-y-2">
              <div className="flex items-center justify-between text-[10.5px] font-mono">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-[#00ffcc]" />
                  Viral Safe Zone Preview
                </span>
                <span className={`text-[9.5px] font-bold ${safeZoneMetrics.isExceeded ? 'text-rose-400' : 'text-[#00ffcc]'}`}>
                  {safeZoneMetrics.status}
                </span>
              </div>

              <div className="flex items-center gap-1">
                {(['tiktok', 'reels', 'shorts'] as const).map((plat) => (
                  <button
                    key={plat}
                    type="button"
                    onClick={() => setMockupPlatform(plat)}
                    className={`flex-1 py-1 text-[10px] font-mono rounded-lg transition capitalize ${
                      mockupPlatform === plat
                        ? 'bg-[#00ffcc] text-black font-bold'
                        : 'bg-[#181333] text-[#948eb5] border border-[#2a2254]'
                    }`}
                  >
                    {plat}
                  </button>
                ))}
              </div>

              <div className="p-2.5 rounded-lg bg-[#000000] border border-[#2a2254] text-[10px] font-mono space-y-1">
                <div className="flex justify-between text-[#948eb5]">
                  <span>Character Limit:</span>
                  <span className="text-white">{safeZoneMetrics.charCount} / {safeZoneMetrics.maxChars}</span>
                </div>
                <div className="flex justify-between text-[#948eb5]">
                  <span>Vertical Stacking:</span>
                  <span className="text-white">{safeZoneMetrics.lineCount} lines</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
