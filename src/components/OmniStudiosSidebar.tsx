import React from 'react';
import { 
  X, 
  Video, 
  Film, 
  Music, 
  Code, 
  Hammer, 
  Wand2, 
  Search, 
  Shirt, 
  Rotate3d, 
  Smartphone, 
  Palette, 
  Database, 
  Workflow, 
  Network, 
  Sparkles,
  ChevronRight,
  Settings,
  FolderLock,
  MessageSquare,
  Bot,
  Cloud,
  Tv,
  Activity,
  Eye,
  Sliders
} from 'lucide-react';
import { StudioId } from './OmniStudiosView';

interface OmniStudiosSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  selectedStudio: StudioId | null;
  onSelectStudio: (id: StudioId) => void;
  onOpenOmniAIChat?: () => void;
  onOpenSettings?: () => void;
  onOpenIdentity?: () => void;
  onOpenVault?: () => void;
  onOpenWorkspace?: () => void;
  onOpenAutopilot?: () => void;
  onOpenTelemetry?: () => void;
  onOpenVision?: () => void;
}

export const OmniStudiosSidebar: React.FC<OmniStudiosSidebarProps> = ({
  isOpen,
  onClose,
  selectedStudio,
  onSelectStudio,
  onOpenOmniAIChat,
  onOpenSettings,
  onOpenIdentity,
  onOpenVault,
  onOpenWorkspace,
  onOpenAutopilot,
  onOpenTelemetry,
  onOpenVision,
}) => {
  if (!isOpen) return null;

  const studios = [
    { id: 'motion', name: 'OmniMotion', tag: 'CapCut Video Studio', icon: Video, color: 'text-[#00ffcc] bg-[#00ffcc]/10 border-[#00ffcc]/30' },
    { id: 'beat', name: 'Omni Storyboard', tag: 'Character Anchor Engine', icon: Film, color: 'text-[#00ffcc] bg-[#00ffcc]/10 border-[#00ffcc]/30' },
    { id: 'wave', name: 'OmniVoice Studio', tag: 'Voice Dub & Lip-Sync', icon: Music, color: 'text-[#00ffcc] bg-[#00ffcc]/10 border-[#00ffcc]/30' },
    { id: 'yale', name: 'OmniYale Studio', tag: 'Broadcast & Slides', icon: Tv, color: 'text-[#00ffcc] bg-[#00ffcc]/10 border-[#00ffcc]/30' },
    { id: 'forge', name: 'Vector Brand Lab', tag: 'Raster to Vector Studio', icon: Hammer, color: 'text-[#00ffcc] bg-[#00ffcc]/10 border-[#00ffcc]/30' },
    { id: 'code', name: 'OmniCode', tag: 'Full-Stack App Scaffold', icon: Code, color: 'text-[#00ffcc] bg-[#00ffcc]/10 border-[#00ffcc]/30' },
    { id: 'imagine', name: 'OmniImagine', tag: 'Mobile Canvas & Magic Eraser', icon: Wand2, color: 'text-[#00ffcc] bg-[#00ffcc]/10 border-[#00ffcc]/30' },
    { id: 'analyzer', name: 'OmniAnalyzer', tag: 'Site & Social Auditor', icon: Search, color: 'text-[#00ffcc] bg-[#00ffcc]/10 border-[#00ffcc]/30' },
    { id: 'style', name: 'OmniStyle Studio', tag: 'Wardrobe Try-On Engine', icon: Shirt, color: 'text-[#00ffcc] bg-[#00ffcc]/10 border-[#00ffcc]/30' },
    { id: 'spatial', name: 'Omnispacial 3D', tag: 'WebGL 3D Engine', icon: Rotate3d, color: 'text-[#00ffcc] bg-[#00ffcc]/10 border-[#00ffcc]/30' },
    { id: 'mockup', name: 'Viral Mockup', tag: 'Social Feed Safe Zones', icon: Smartphone, color: 'text-[#00ffcc] bg-[#00ffcc]/10 border-[#00ffcc]/30' },
    { id: 'cosmic', name: 'Cosmic UI Lab', tag: 'Generative Components', icon: Palette, color: 'text-[#00ffcc] bg-[#00ffcc]/10 border-[#00ffcc]/30' },
    { id: 'architect', name: 'OmniArchitect', tag: 'Database & API Schemas', icon: Database, color: 'text-[#00ffcc] bg-[#00ffcc]/10 border-[#00ffcc]/30' },
    { id: 'automations', name: 'Automations', tag: 'AI Autonomous Agents', icon: Workflow, color: 'text-[#00ffcc] bg-[#00ffcc]/10 border-[#00ffcc]/30' },
    { id: 'connect', name: 'OmniConnect', tag: 'Integrations Catalog', icon: Network, color: 'text-[#00ffcc] bg-[#00ffcc]/10 border-[#00ffcc]/30' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-start font-sans">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity animate-in fade-in"
      />

      {/* Slide-over Drawer from Left */}
      <div className="relative w-84 max-w-[85vw] bg-[#000000] border-r border-[#2a2254] h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
        
        {/* Drawer Header */}
        <div className="p-3.5 border-b border-[#2a2254] bg-[#100d23] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#00ffcc] animate-pulse shadow-[0_0_8px_#00ffcc]" />
            <h3 className="font-bold text-xs font-mono tracking-widest text-[#e8e6f2]">
              OmniAI<span className="text-[#00ffcc]"> - Nexus</span> Navigation
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#948eb5] hover:text-white hover:bg-[#1a1638] transition-all"
            title="Close Drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* PRIMARY ITEM: OmniAI - Nexus Chat */}
        <div className="p-3 border-b border-[#2a2254] bg-[#080614]">
          <button
            onClick={() => {
              onOpenOmniAIChat?.();
              onClose();
            }}
            className="w-full p-2.5 rounded-xl bg-[#13102b] border border-[#00ffcc]/40 hover:border-[#00ffcc] text-left transition-all shadow-[0_0_15px_rgba(0,255,204,0.15)] group relative overflow-hidden active:scale-[0.98]"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#000000] border border-[#00ffcc]/40 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-[#00ffcc]" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-xs text-white tracking-wide group-hover:text-[#00ffcc] transition-colors">
                    OmniAI - Nexus Chat
                  </h2>
                  <span className="text-[8.5px] px-1.5 py-0.2 rounded-full bg-[#00ffcc]/15 text-[#00ffcc] border border-[#00ffcc]/40 font-mono font-bold">
                    COUNCIL
                  </span>
                </div>
                <p className="text-[10px] text-[#948eb5] truncate mt-0.5">
                  Full-Page Chat & Multi-LLM Council
                </p>
              </div>

              <ChevronRight className="w-3.5 h-3.5 text-[#00ffcc] group-hover:translate-x-0.5 transition-transform shrink-0" />
            </div>
          </button>
        </div>

        {/* SYSTEM MIGRATION HUBS (Autopilot, Telemetry, Vision, Vault, Workspace) */}
        <div className="p-3 border-b border-[#2a2254] space-y-1.5 bg-[#0a0718]">
          <span className="text-[9.5px] font-mono uppercase text-[#7d779f] font-bold block mb-1">
            System Intelligence
          </span>

          {/* Autonomous Autopilot */}
          {onOpenAutopilot && (
            <button
              onClick={() => {
                onClose();
                onOpenAutopilot();
              }}
              className="w-full p-2 rounded-xl bg-[#13102b] hover:bg-[#1a1638] border border-[#2a2254] hover:border-[#00ffcc]/40 flex items-center justify-between transition-all text-left text-xs"
            >
              <div className="flex items-center gap-2">
                <Bot className="w-3.5 h-3.5 text-[#00ffcc]" />
                <span className="text-[#e8e6f2] font-medium">Autonomous Autopilot</span>
              </div>
              <span className="text-[9px] font-mono text-[#00ffcc]">Configure</span>
            </button>
          )}

          {/* OmniCore Telemetry */}
          {onOpenTelemetry && (
            <button
              onClick={() => {
                onClose();
                onOpenTelemetry();
              }}
              className="w-full p-2 rounded-xl bg-[#13102b] hover:bg-[#1a1638] border border-[#2a2254] hover:border-[#00ffcc]/40 flex items-center justify-between transition-all text-left text-xs"
            >
              <div className="flex items-center gap-2">
                <Activity className="w-3.5 h-3.5 text-[#00ffcc]" />
                <span className="text-[#e8e6f2] font-medium">OmniCore Telemetry</span>
              </div>
              <span className="text-[9px] font-mono text-[#948eb5]">Live HUD</span>
            </button>
          )}

          {/* OmniVision / Real-Time Screen Cognition */}
          {onOpenVision && (
            <button
              onClick={() => {
                onClose();
                onOpenVision();
              }}
              className="w-full p-2 rounded-xl bg-[#13102b] hover:bg-[#1a1638] border border-[#2a2254] hover:border-[#00ffcc]/40 flex items-center justify-between transition-all text-left text-xs"
            >
              <div className="flex items-center gap-2">
                <Eye className="w-3.5 h-3.5 text-[#00ffcc]" />
                <span className="text-[#e8e6f2] font-medium">OmniVision Cognition</span>
              </div>
              <span className="text-[9px] font-mono text-[#948eb5]">Screen Stream</span>
            </button>
          )}

          {/* Global Vault Media Library */}
          {onOpenVault && (
            <button
              onClick={() => {
                onClose();
                onOpenVault();
              }}
              className="w-full p-2 rounded-xl bg-[#13102b] hover:bg-[#1a1638] border border-[#2a2254] hover:border-[#00ffcc]/40 flex items-center justify-between transition-all text-left text-xs"
            >
              <div className="flex items-center gap-2">
                <FolderLock className="w-3.5 h-3.5 text-[#00ffcc]" />
                <span className="text-[#e8e6f2] font-medium">OpenGlobalVault Library</span>
              </div>
              <span className="text-[9px] font-mono text-[#948eb5]">Assets</span>
            </button>
          )}

          {/* Google Workspace Authorization */}
          {onOpenWorkspace && (
            <button
              onClick={() => {
                onClose();
                onOpenWorkspace();
              }}
              className="w-full p-2 rounded-xl bg-[#13102b] hover:bg-[#1a1638] border border-[#2a2254] hover:border-[#00ffcc]/40 flex items-center justify-between transition-all text-left text-xs"
            >
              <div className="flex items-center gap-2">
                <Cloud className="w-3.5 h-3.5 text-[#00ffcc]" />
                <span className="text-[#e8e6f2] font-medium">Google Workspace Auth</span>
              </div>
              <span className="text-[9px] font-mono text-[#948eb5]">Drive • Gmail</span>
            </button>
          )}
        </div>

        {/* Studios Section Header */}
        <div className="px-3 pt-2.5 pb-1 flex items-center justify-between text-[10px] font-mono uppercase text-[#7d779f] font-bold">
          <span>Creative Studios ({studios.length})</span>
          <span className="text-[8.5px] text-[#00ffcc]">v4</span>
        </div>

        {/* Studios List */}
        <div className="flex-1 overflow-y-auto px-3 py-1 space-y-1 no-scrollbar">
          {studios.map((st) => {
            const Icon = st.icon;
            const isSelected = selectedStudio === st.id;

            return (
              <button
                key={st.id}
                onClick={() => {
                  onSelectStudio(st.id as StudioId);
                  onClose();
                }}
                className={`w-full p-2 rounded-xl border flex items-center gap-2.5 transition-all text-left ${
                  isSelected
                    ? 'bg-[#1e1940] border-[#00ffcc]/60 shadow-sm'
                    : 'bg-[#100d23]/80 border-[#2a2254] hover:bg-[#16122e] hover:border-[#00ffcc]/30'
                }`}
              >
                <div className="p-1.5 rounded-lg border border-[#00ffcc]/30 bg-[#00ffcc]/10 flex-shrink-0">
                  <Icon className="w-3.5 h-3.5 text-[#00ffcc]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-[#e8e6f2] truncate">{st.name}</span>
                    <ChevronRight className="w-3 h-3 text-[#7d779f]" />
                  </div>
                  <p className="text-[9.5px] text-[#948eb5] truncate">{st.tag}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* BOTTOM SECTION: SETTINGS & IDENTITY */}
        <div className="p-3 border-t border-[#2a2254] bg-[#0a0718] space-y-1.5">
          {/* My AI Identity Button */}
          {onOpenIdentity && (
            <button
              onClick={() => {
                onClose();
                onOpenIdentity();
              }}
              className="w-full py-2 px-3 rounded-xl bg-[#13102b] hover:bg-[#1a1638] border border-[#2a2254] hover:border-[#00ffcc] text-[#e8e6f2] text-xs font-semibold flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-2">
                <Bot className="w-3.5 h-3.5 text-[#00ffcc]" />
                <span>My AI Identity & Voice</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-[#7d779f]" />
            </button>
          )}

          {/* Settings block/button */}
          {onOpenSettings && (
            <button
              onClick={() => {
                onClose();
                onOpenSettings();
              }}
              className="w-full py-2 px-3 rounded-xl bg-[#13102b] hover:bg-[#1a1638] border border-[#2a2254] hover:border-[#00ffcc] text-[#e8e6f2] text-xs font-semibold flex items-center justify-between transition-all"
            >
              <div className="flex items-center gap-2">
                <Settings className="w-3.5 h-3.5 text-[#00ffcc]" />
                <span>Settings & Admin Hub</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-[#7d779f]" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
