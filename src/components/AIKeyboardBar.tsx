import React, { useState } from 'react';
import { 
  Sparkles, 
  Send, 
  Copy, 
  Check, 
  Flame, 
  Smile, 
  Zap, 
  Heart,
  List, 
  FileText, 
  CheckCircle2, 
  X, 
  ChevronDown,
  Edit3,
  AlignLeft,
  Wand2
} from 'lucide-react';

export type PersonaTone = 'directAction' | 'rawHonest' | 'witty' | 'flirty';

export interface PersonaToneItem {
  id: PersonaTone;
  label: string;
  desc: string;
  icon: any;
  color: string;
  badge: string;
}

export const PERSONA_TONES: PersonaToneItem[] = [
  {
    id: 'directAction',
    label: 'Direct Action',
    desc: 'Unvarnished, milestone-certain, zero fluff or excuses',
    icon: Zap,
    color: 'text-[#00ffcc]',
    badge: 'ACTION',
  },
  {
    id: 'rawHonest',
    label: 'Raw & Honest',
    desc: 'Radical transparency, tactical truth, immediate context',
    icon: Flame,
    color: 'text-amber-400',
    badge: 'HONEST',
  },
  {
    id: 'witty',
    label: 'Witty',
    desc: 'Dry, razor-sharp, high-intelligence humor',
    icon: Smile,
    color: 'text-violet-400',
    badge: 'WITTY',
  },
  {
    id: 'flirty',
    label: 'Flirty',
    desc: 'Playful, magnetic, charming banter and chemistry',
    icon: Heart,
    color: 'text-[#00ffcc]',
    badge: 'MAGNETIC',
  },
];

export const personaToneMeta = PERSONA_TONES.reduce((acc, cur) => {
  acc[cur.id] = cur;
  return acc;
}, {} as Record<PersonaTone, PersonaToneItem>);

interface AIKeyboardBarProps {
  currentText: string;
  onChangeText: (text: string) => void;
  onSend: (text: string) => void;
  suggestedReplies: string[];
  onSelectSuggestion: (text: string) => void;
  liveAdvice?: string[];
  isAnalyzing?: boolean;
  autoPilotTone?: PersonaTone;
  onChangeAutoPilotTone?: (tone: PersonaTone) => void;
  onRewrite: (style: 'casual' | 'crisp' | 'executive' | 'magnetic') => void;
  onTriggerAction?: (actionId: string, currentText: string) => Promise<string | void>;
}

export const AIKeyboardBar: React.FC<AIKeyboardBarProps> = ({
  currentText,
  onChangeText,
  onSend,
  suggestedReplies,
  onSelectSuggestion,
  liveAdvice = [],
  isAnalyzing = false,
  autoPilotTone = 'directAction',
  onChangeAutoPilotTone,
  onRewrite,
  onTriggerAction,
}) => {
  // Consolidated Quick Actions: Group Draft, Summarize, Grammar, Bullets, and Quick Answers under a single clean tab interface
  type QuickActionTab = 'answers' | 'draft' | 'summarize' | 'grammar' | 'bullets';
  const [activeTab, setActiveTab] = useState<QuickActionTab | null>('answers');
  const [showToneMenu, setShowToneMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isProcessingAction, setIsProcessingAction] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [formalityLevel, setFormalityLevel] = useState<'casual' | 'crisp' | 'executive' | 'magnetic'>('crisp');

  const triggerHaptic = (duration = 10) => {
    try {
      if (typeof window !== 'undefined' && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        if (localStorage.getItem('omni_haptic_enabled') !== 'false') {
          navigator.vibrate(duration);
        }
      }
    } catch {}
  };

  const handleCopy = () => {
    if (!currentText) return;
    triggerHaptic(12);
    navigator.clipboard.writeText(currentText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExecuteQuickAction = async (tab: QuickActionTab) => {
    triggerHaptic(14);
    setIsProcessingAction(true);
    setActionFeedback(tab);

    try {
      if (tab === 'draft') {
        const draftCandidate = suggestedReplies[0] || 'Fix is verified locally; regression test passing. Pushing build #402 to staging in 15 minutes.';
        onChangeText(draftCandidate);
      } else if (tab === 'summarize') {
        if (onTriggerAction) {
          const res = await onTriggerAction('summarize', currentText);
          if (res) onChangeText(res);
        } else {
          onChangeText(`TL;DR: ${currentText.slice(0, 80)}...`);
        }
      } else if (tab === 'grammar') {
        if (onTriggerAction) {
          const res = await onTriggerAction('fix-grammar', currentText);
          if (res) onChangeText(res);
        } else {
          onRewrite('crisp');
        }
      } else if (tab === 'bullets') {
        if (onTriggerAction) {
          const res = await onTriggerAction('bulletize', currentText);
          if (res) onChangeText(res);
        } else {
          const lines = currentText.split('. ').filter(Boolean).map(l => `• ${l.trim()}`).join('\n');
          onChangeText(lines || '• Key milestone committed\n• Regression test validated\n• Deployment ready');
        }
      }
    } finally {
      setIsProcessingAction(false);
      setTimeout(() => setActionFeedback(null), 1800);
    }
  };

  const currentToneMeta = personaToneMeta[autoPilotTone] || personaToneMeta.directAction;
  const ToneIcon = currentToneMeta.icon;

  return (
    <div className="w-full bg-[#000000] border-t border-[#1e1642] flex flex-col select-none relative z-20">
      
      {/* 1. CONSOLIDATED QUICK ACTIONS: SINGLE CLEAN TAB INTERFACE */}
      <div className="flex items-center justify-between px-2.5 py-1.5 bg-[#0a071b] border-b border-[#1e1642]">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {[
            { id: 'answers', label: 'Quick Answers', icon: Sparkles },
            { id: 'draft', label: 'Draft', icon: FileText },
            { id: 'summarize', label: 'Summarize', icon: AlignLeft },
            { id: 'grammar', label: 'Grammar', icon: CheckCircle2 },
            { id: 'bullets', label: 'Bullets', icon: List },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  triggerHaptic(8);
                  if (activeTab === tab.id) {
                    setActiveTab(null); // Click to collapse for extra workspace
                  } else {
                    setActiveTab(tab.id as QuickActionTab);
                    if (tab.id !== 'answers') {
                      handleExecuteQuickAction(tab.id as QuickActionTab);
                    }
                  }
                }}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-all shrink-0 ${
                  isSelected
                    ? 'bg-[#6366f1]/20 text-[#00ffcc] border border-[#00ffcc]/60 shadow-[0_0_10px_rgba(0,255,204,0.2)]'
                    : 'text-[#948eb5] hover:text-[#e8e6f2] hover:bg-[#130d2d] border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#00ffcc]' : 'text-[#948eb5]'}`} />
                <span className="text-[11px]">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {activeTab && (
          <button
            type="button"
            onClick={() => setActiveTab(null)}
            className="p-1 rounded-lg text-[#948eb5] hover:text-white shrink-0 ml-1"
            title="Collapse panel"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* 2. EXPANDED CONSOLIDATED PANEL (CONDITIONAL ACCORDING TO ACTIVE TAB) */}
      {activeTab === 'answers' && (
        <div className="p-2.5 bg-[#0a071b] border-b border-[#1e1642] space-y-2 animate-in slide-in-from-top-1 duration-150">
          <div className="flex items-center justify-between text-[10px] font-mono text-[#948eb5]">
            <span className="text-[#00ffcc] font-bold flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#00ffcc]" /> 1-Tap Predictive Responses ({suggestedReplies.length})
            </span>
            <span>Tap to insert</span>
          </div>

          <div className="grid grid-cols-1 gap-1.5 max-h-36 overflow-y-auto no-scrollbar">
            {suggestedReplies.map((reply, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  triggerHaptic(10);
                  onSelectSuggestion(reply);
                }}
                className="p-2 rounded-xl bg-[#130d2d] hover:bg-[#1a123d] border border-[#1e1642] hover:border-[#00ffcc]/50 text-left transition-all group"
              >
                <p className="text-xs font-mono text-[#e8e6f2] group-hover:text-[#00ffcc] line-clamp-2 leading-relaxed">
                  {reply}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'grammar' && (
        <div className="p-2.5 bg-[#0a071b] border-b border-[#1e1642] space-y-2 animate-in slide-in-from-top-1 duration-150">
          <div className="flex items-center justify-between text-[10px] font-mono text-[#948eb5]">
            <span className="text-[#00ffcc] font-bold">Rewrite Formality Style</span>
            <span className="text-[#00ffcc] font-bold uppercase">{formalityLevel}</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {(['casual', 'crisp', 'executive', 'magnetic'] as const).map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => {
                  triggerHaptic(8);
                  setFormalityLevel(lvl);
                  onRewrite(lvl);
                }}
                className={`py-1.5 px-2 rounded-xl text-center text-xs font-mono capitalize transition-all ${
                  formalityLevel === lvl
                    ? 'bg-[#00ffcc] text-black font-bold shadow-[0_0_10px_rgba(0,255,204,0.3)]'
                    : 'bg-[#130d2d] text-[#948eb5] hover:text-[#e8e6f2] border border-[#1e1642]'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. CORE INTERACTION TONE SELECTION POPOVER (INCLUDES "FLIRTY") */}
      {showToneMenu && (
        <div className="p-3 bg-[#0a071b] border-b border-[#1e1642] animate-in slide-in-from-top-2 duration-150 space-y-2 shadow-2xl relative z-30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-white">
              <ToneIcon className={`w-3.5 h-3.5 ${currentToneMeta.color}`} />
              <span>OmniAI Interaction Tone</span>
            </div>
            <button
              type="button"
              onClick={() => setShowToneMenu(false)}
              className="text-[#948eb5] hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {PERSONA_TONES.map((tone) => {
              const Icon = tone.icon;
              const isSelected = autoPilotTone === tone.id;
              return (
                <button
                  key={tone.id}
                  type="button"
                  onClick={() => {
                    triggerHaptic(12);
                    onChangeAutoPilotTone?.(tone.id);
                    setShowToneMenu(false);
                  }}
                  className={`p-2 rounded-xl border text-left transition-all ${
                    isSelected
                      ? 'bg-[#130d2d] border-[#00ffcc] shadow-[0_0_12px_rgba(0,255,204,0.25)]'
                      : 'bg-[#0a071b] border-[#1e1642] hover:border-[#00ffcc]/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <Icon className={`w-3.5 h-3.5 ${tone.color}`} />
                      <span className="font-bold text-xs font-mono text-[#e8e6f2]">{tone.label}</span>
                    </div>
                    {isSelected && (
                      <span className="text-[9px] font-mono text-[#00ffcc] font-bold">ACTIVE</span>
                    )}
                  </div>
                  <p className="text-[10px] text-[#948eb5] line-clamp-1">{tone.desc}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. PRIMARY TYPING DOCK */}
      <div className="flex items-center gap-2 p-2.5 bg-[#000000]">
        
        {/* Core Tone Selector Button (Includes "Flirty") */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic(8);
            setShowToneMenu((prev) => !prev);
          }}
          className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl border transition-all shrink-0 active:scale-95 ${
            showToneMenu
              ? 'bg-[#00ffcc] text-black border-[#00ffcc] shadow-[0_0_12px_rgba(0,255,204,0.4)]'
              : 'bg-[#0a071b] text-[#00ffcc] border-[#1e1642] hover:border-[#00ffcc]/50 hover:bg-[#130d2d]'
          }`}
          title="Interaction Tone Selector (Direct Action, Raw & Honest, Witty, Flirty)"
        >
          <ToneIcon className={`w-3.5 h-3.5 ${showToneMenu ? 'text-black fill-black' : currentToneMeta.color}`} />
          <span className="text-[10px] font-mono font-bold hidden xs:inline">{currentToneMeta.label}</span>
          <ChevronDown className="w-3 h-3 opacity-70" />
        </button>

        {/* Text Input Field */}
        <div className="relative flex-1">
          <input
            type="text"
            value={currentText}
            onChange={(e) => onChangeText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onSend(currentText);
              }
            }}
            placeholder="Type with OmniAI..."
            className="w-full rounded-xl bg-[#0a071b] border border-[#1e1642] px-3.5 py-2 text-xs text-[#e8e6f2] placeholder-[#7d779f] focus:outline-none focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1]/40 font-mono transition-all pr-8 shadow-inner"
          />
          {currentText && (
            <button
              type="button"
              onClick={() => onChangeText('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#948eb5] hover:text-white p-0.5 font-bold"
              title="Clear text"
            >
              ×
            </button>
          )}
        </div>

        {/* Copy to system clipboard */}
        <button
          type="button"
          onClick={handleCopy}
          disabled={!currentText}
          className={`p-2 rounded-xl border transition-all disabled:opacity-30 shrink-0 ${
            copied
              ? 'bg-[#00ffcc]/20 text-[#00ffcc] border-[#00ffcc]/60 shadow-[0_0_10px_rgba(0,255,204,0.3)]'
              : 'bg-[#0a071b] text-[#948eb5] border-[#1e1642] hover:text-[#e8e6f2] hover:bg-[#130d2d]'
          }`}
          title="Copy text"
        >
          {copied ? <Check className="w-4 h-4 text-[#00ffcc]" /> : <Copy className="w-4 h-4" />}
        </button>

        {/* Send Button: Purplish-Blue primary accent */}
        <button
          type="button"
          onClick={() => onSend(currentText)}
          disabled={!currentText.trim()}
          className="p-2 rounded-xl bg-[#6366f1] hover:bg-[#4f46e5] text-white font-extrabold border border-[#6366f1] shadow-[0_0_15px_rgba(99,102,241,0.35)] active:scale-95 transition-all disabled:opacity-30 shrink-0"
          title="Send message"
        >
          <Send className="w-4 h-4 text-white stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
};
