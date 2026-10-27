import React, { useState, useRef } from 'react';
import { 
  Briefcase, 
  Heart, 
  Mail, 
  Terminal, 
  Upload, 
  Sparkles, 
  ShieldCheck, 
  X,
  ChevronDown,
  Info
} from 'lucide-react';
import { DailyInsightCard } from './DailyInsightCard';

export interface ScreenScenario {
  id: string;
  name: string;
  category: string;
  icon: any;
  appHeader: {
    title: string;
    subtitle: string;
    avatar: string;
    badge?: string;
  };
  messages: Array<{
    sender: 'them' | 'me';
    text: string;
    time: string;
    isAutoPilot?: boolean;
  }>;
  contextHint: string;
  defaultDraft: string;
}

export const PRESET_SCENARIOS: ScreenScenario[] = [
  {
    id: 'work_slack',
    name: 'Work Slack',
    category: 'Work',
    icon: Briefcase,
    appHeader: {
      title: 'Alex Rivera (VP Eng)',
      subtitle: 'Active now • #product-launch',
      avatar: '👨‍💼',
      badge: 'HIGH STAKES',
    },
    messages: [
      {
        sender: 'them',
        text: 'The client VP is asking why staging build #402 is delayed. Did you deploy the auth patch yet? Need an unvarnished ETA right now.',
        time: '10:42 AM',
      },
    ],
    contextHint: 'Alex is under intense executive scrutiny. Demands unambiguous certainty; zero filler words.',
    defaultDraft: 'Fix is verified locally; regression test passing. Pushing build #402 to staging in 15 minutes.',
  },
  {
    id: 'dating_hinge',
    name: 'Hinge Match',
    category: 'Social',
    icon: Heart,
    appHeader: {
      title: 'Maya Lin',
      subtitle: '2 miles away • Just matched',
      avatar: '✨',
      badge: 'UNFILTERED',
    },
    messages: [
      {
        sender: 'them',
        text: 'Haha okay but what’s your most controversial food opinion? And please do not say pineapple on pizza 😂',
        time: '9:15 PM',
      },
    ],
    contextHint: 'Maya is testing conversational authenticity. Avoid generic assistant clichés; be specific, magnetic, and witty.',
    defaultDraft: 'Cold takeout eaten directly out of the box in the refrigerator light at 1 AM hits different. Fight me.',
  },
  {
    id: 'client_dispute',
    name: 'Client Email',
    category: 'Finance',
    icon: Mail,
    appHeader: {
      title: 'Billing Breach: Apex Corp',
      subtitle: 'From: Sarah Jenkins (CFO)',
      avatar: '📊',
      badge: 'DISPUTE RISK',
    },
    messages: [
      {
        sender: 'them',
        text: 'We noticed an unexpected $240 charge on our corporate invoice #8819. Can someone explain this line item before we dispute it with our credit card merchant?',
        time: '11:05 AM',
      },
    ],
    contextHint: 'Sarah feels commercially breached. Validate her shock, prevent the merchant dispute, and offer same-day audit and credit.',
    defaultDraft: 'Hi Sarah, inspecting invoice #8819 immediately with our billing team. Expect clarity or full credit today.',
  },
  {
    id: 'terminal_bug',
    name: 'Terminal Crash',
    category: 'Dev',
    icon: Terminal,
    appHeader: {
      title: 'Crash Log: worker-auth',
      subtitle: 'node:v22.14 • Exit code 1',
      avatar: '⚡',
      badge: 'CRITICAL',
    },
    messages: [
      {
        sender: 'them',
        text: 'FATAL: TypeError: Cannot read properties of undefined (reading "bearerToken") at verifySession (/app/auth.js:84:22). Server down.',
        time: '3:01 PM',
      },
    ],
    contextHint: 'Missing optional chaining on auth header for healthcheck pings. Fix: req.headers?.authorization?.split(" ")[1]',
    defaultDraft: 'The auth header is undefined on unauthenticated health-pings. Adding safe optional chaining.',
  },
];

interface SimulatedAppViewProps {
  currentScenario: ScreenScenario;
  onSelectScenario: (scenario: ScreenScenario) => void;
  customScreenshot: string | null;
  onUploadScreenshot: (file: File) => void;
  onClearCustomScreenshot: () => void;
  isLiveScreenSharing: boolean;
  onToggleLiveScreenSharing: () => void;
  currentDraftText: string;
  onSimulateIncomingMessage?: () => void;
  isAutoMode?: boolean;
}

export const SimulatedAppView: React.FC<SimulatedAppViewProps> = ({
  currentScenario,
  onSelectScenario,
  customScreenshot,
  onUploadScreenshot,
  onClearCustomScreenshot,
  isLiveScreenSharing,
  onToggleLiveScreenSharing,
  currentDraftText,
  onSimulateIncomingMessage,
}) => {
  const [showDossierPopover, setShowDossierPopover] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadScreenshot(file);
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#000000] text-[#e8e6f2] overflow-hidden select-none relative">
      
      {/* 1. COMPACT SCENARIO & COGNITION BAR */}
      <div className="px-3 py-1.5 bg-[#0a071b] border-b border-[#1e1642] flex items-center justify-between text-xs font-mono shrink-0">
        
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
                    ? 'bg-[#6366f1]/20 text-[#00ffcc] border border-[#00ffcc]/50 shadow-[0_0_8px_rgba(0,255,204,0.2)] font-bold'
                    : 'text-[#948eb5] hover:text-[#e8e6f2] hover:bg-[#130d2d]'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{sc.name}</span>
              </button>
            );
          })}
        </div>

        {/* Space-Efficient Live Cognition Dossier Icon Button (Redesigned per Blueprint) */}
        <div className="flex items-center gap-1 shrink-0 ml-1.5 relative">
          <button
            type="button"
            onClick={() => setShowDossierPopover((prev) => !prev)}
            className={`p-1.5 rounded-lg border transition-all flex items-center gap-1 ${
              showDossierPopover
                ? 'bg-[#00ffcc] text-black border-[#00ffcc] shadow-[0_0_10px_rgba(0,255,204,0.4)]'
                : 'bg-[#0a071b] text-[#00ffcc] border-[#1e1642] hover:border-[#00ffcc]/50'
            }`}
            title="Live Cognition Dossier"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold font-mono hidden xs:inline">Dossier</span>
          </button>

          {/* Screenshot upload trigger */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-1.5 rounded-lg border border-[#1e1642] bg-[#0a071b] text-[#948eb5] hover:text-[#00ffcc] transition-all"
            title="Upload screenshot"
          >
            <Upload className="w-3.5 h-3.5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Compact Popover for Live Cognition Dossier */}
          {showDossierPopover && (
            <div className="absolute top-8 right-0 w-64 bg-[#0a071b] border border-[#00ffcc]/50 rounded-xl p-3 shadow-2xl z-40 space-y-2 animate-in fade-in duration-100">
              <div className="flex items-center justify-between border-b border-[#1e1642] pb-1.5">
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

      {/* 2. CHAT STREAM VIEWPORT CONTAINER */}
      <div className="flex-1 relative overflow-y-auto p-3 flex flex-col justify-between min-h-0 bg-[#000000] space-y-3">
        
        {/* Grounded Daily Insight */}
        <DailyInsightCard />

        {customScreenshot ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="relative max-h-[220px] rounded-xl overflow-hidden border border-[#1e1642] shadow-xl">
              <img
                src={customScreenshot}
                alt="Uploaded mobile screen"
                className="max-h-[220px] object-contain rounded-xl"
              />
              <div className="absolute top-2 right-2">
                <button
                  type="button"
                  onClick={onClearCustomScreenshot}
                  className="px-2 py-1 rounded-md bg-black/90 text-[#e8e6f2] text-[10px] font-mono hover:bg-[#130d2d] transition border border-[#1e1642]"
                >
                  Clear Screen
                </button>
              </div>
            </div>
            <p className="text-[10px] font-mono text-[#00ffcc] mt-2 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> OmniAI parsing uploaded screen viewport
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {/* Counterpart Contact Subheader */}
            <div className="flex items-center justify-between pb-2 border-b border-[#1e1642]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#0a071b] border border-[#1e1642] flex items-center justify-center text-xs shadow-inner">
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

              {/* Viewport Perception Status */}
              <div className="flex items-center gap-1 text-[9px] font-mono text-[#948eb5]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00ffcc] animate-ping" />
                <span>Active</span>
              </div>
            </div>

            {/* Simulated Messages */}
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
                        ? 'bg-[#0a071b] text-[#e8e6f2] border border-[#1e1642] rounded-tl-sm'
                        : msg.isAutoPilot
                        ? 'bg-[#130d2d] text-[#e8e6f2] border border-[#00ffcc]/50 rounded-tr-sm shadow-[0_0_12px_rgba(0,255,204,0.15)]'
                        : 'bg-[#6366f1] text-white font-semibold rounded-tr-sm border border-[#6366f1] shadow-[0_0_15px_rgba(99,102,241,0.25)]'
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

        {/* Live typing draft mirror */}
        <div className="pt-2 border-t border-[#1e1642] flex items-center justify-between text-[10.5px] font-mono text-[#948eb5]">
          <span className="truncate pr-2">
            Drafting: <span className="text-[#e8e6f2] font-medium">{currentDraftText || '(empty)'}</span>
          </span>
          {onSimulateIncomingMessage && (
            <button
              type="button"
              onClick={onSimulateIncomingMessage}
              className="text-[9px] text-[#00ffcc] hover:underline font-bold shrink-0"
              title="Simulate new counterpart message"
            >
              + Test Reply
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
