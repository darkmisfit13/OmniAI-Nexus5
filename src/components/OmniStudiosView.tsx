import React from 'react';
import { 
  Film, 
  Video, 
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
  ChevronLeft,
  Sparkles,
  Layers,
  Mic,
  Shapes,
  Tv
} from 'lucide-react';

// Import all dedicated studios
import { OmniMotionStudio } from './studios/OmniMotionStudio';
import { OmniBeatStudio } from './studios/OmniBeatStudio';
import { OmniWaveStudio } from './studios/OmniWaveStudio';
import { OmniVoiceStudio } from './studios/OmniVoiceStudio';
import { OmniStoryboardStudio } from './studios/OmniStoryboardStudio';
import { OmniVectorBrandLab } from './studios/OmniVectorBrandLab';
import { OmniCodeStudio } from './studios/OmniCodeStudio';
import { OmniForgeStudio } from './studios/OmniForgeStudio';
import { OmniImagineStudio } from './studios/OmniImagineStudio';
import { OmniAnalyzerStudio } from './studios/OmniAnalyzerStudio';
import { OmniStyleStudio } from './studios/OmniStyleStudio';
import { OmniSpatial3DStudio } from './studios/OmniSpatial3DStudio';
import { OmniViralMockupStudio } from './studios/OmniViralMockupStudio';
import { OmniYaleStudio } from './studios/OmniYaleStudio';
import { OmniCosmicUILab } from './studios/OmniCosmicUILab';
import { OmniArchitectStudio } from './studios/OmniArchitectStudio';
import { OmniAutomationsStudio } from './studios/OmniAutomationsStudio';
import { OmniConnectCatalog } from './studios/OmniConnectCatalog';

export type StudioId = 
  | 'motion' 
  | 'beat' 
  | 'wave' 
  | 'code' 
  | 'forge' 
  | 'imagine' 
  | 'analyzer' 
  | 'style' 
  | 'spatial' 
  | 'mockup' 
  | 'cosmic' 
  | 'architect' 
  | 'automations' 
  | 'connect'
  | 'vector'
  | 'yale';

interface OmniStudiosViewProps {
  onInsertToKeyboard?: (text: string) => void;
  currentScreenName?: string;
  onSaveToVault?: (asset: any) => void;
  selectedStudio: StudioId;
  onSelectStudio?: (id: StudioId) => void;
  onBackToHome?: () => void;
  onOpenSidebar?: () => void;
  onOpenCompanion?: () => void;
}

export const studioMeta: Record<StudioId, { name: string; tag: string; icon: any }> = {
  motion: { name: 'OmniMotion', tag: 'CapCut Video Editor', icon: Video },
  beat: { name: 'Omni Storyboard', tag: 'Visual Storyboard & Script Engine', icon: Film },
  wave: { name: 'OmniVoice Studio', tag: 'AI Voice Dub & Lip-Sync', icon: Mic },
  yale: { name: 'OmniYale Studio', tag: 'Multi-Cam Broadcast & Slides', icon: Tv },
  forge: { name: 'Vector and Brand Lab', tag: 'Raster to Vector Studio', icon: Shapes },
  vector: { name: 'Vector and Brand Lab', tag: 'Raster to Vector Studio', icon: Shapes },
  code: { name: 'OmniCode', tag: 'Full-Stack App Scaffold', icon: Code },
  imagine: { name: 'OmniImagine', tag: 'Mobile Canvas & Magic Eraser Suite', icon: Wand2 },
  analyzer: { name: 'OmniAnalyzer', tag: 'Site & Social Auditor', icon: Search },
  style: { name: 'OmniStyle Studio', tag: 'Wardrobe Try-On Engine', icon: Shirt },
  spatial: { name: 'Omnispacial 3D Studio', tag: 'WebGL 3D Engine', icon: Rotate3d },
  mockup: { name: 'Viral Mockup Studio', tag: 'Social Feed Safe Zones', icon: Smartphone },
  cosmic: { name: 'Cosmic UI Lab', tag: 'Generative UI Sandbox', icon: Palette },
  architect: { name: 'OmniArchitect', tag: 'DB & API Schemas', icon: Database },
  automations: { name: 'Automations', tag: 'AI Autonomous Agents', icon: Workflow },
  connect: { name: 'OmniConnect', tag: 'App Integrations Catalog', icon: Network },
};

import { OmniPromptHeader } from './OmniPromptHeader';

export const OmniStudiosView: React.FC<OmniStudiosViewProps> = ({
  onInsertToKeyboard,
  currentScreenName,
  onSaveToVault,
  selectedStudio = 'motion',
  onSelectStudio,
  onBackToHome,
  onOpenSidebar,
  onOpenCompanion,
}) => {
  const meta = studioMeta[selectedStudio] || studioMeta.motion;
  const Icon = meta.icon;

  const isMotionStudio = selectedStudio === 'motion';
  const isSpatialStudio = selectedStudio === 'spatial';
  const isMobileViewportStudio = 
    selectedStudio === 'style' || 
    selectedStudio === 'wave' || 
    selectedStudio === 'beat' || 
    selectedStudio === 'mockup' || 
    selectedStudio === 'forge' || 
    selectedStudio === 'vector' ||
    selectedStudio === 'yale' ||
    selectedStudio === 'architect';

  return (
    <div className="omni-mobile-wrapper h-full flex flex-col bg-black text-[#e8e6f2] overflow-hidden font-sans">
      
      {/* Permanent Floating Text Input Header Across All Studios */}
      <OmniPromptHeader
        currentStudioId={selectedStudio}
        onNavigateStudio={(id) => onSelectStudio?.(id)}
        onOpenChat={onOpenCompanion}
      />

      {/* Sleek Mobile Studio Top Bar with Back Button (Hidden for OmniMotion which has its own CapCut Top Bar) */}
      {!isMotionStudio && (
        <div className="h-10 px-3 bg-[#08060c] border-b border-[#181524] flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            {onBackToHome && (
              <button
                onClick={onBackToHome}
                className="p-1 -ml-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all flex items-center gap-0.5 text-xs font-semibold"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            )}

            <div className="flex items-center gap-1.5 pl-1 border-l border-[#181524]">
              <Icon className="w-3.5 h-3.5 text-[#00e5ff]" />
              <span className="font-bold text-xs text-white">{meta.name}</span>
              <span className="text-[10px] text-zinc-400 font-mono hidden sm:inline">
                ({meta.tag})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {onOpenCompanion && (
              <button
                onClick={onOpenCompanion}
                className="px-2 py-1 rounded-lg bg-[#08060c] border border-[#00e5ff]/50 hover:border-[#00e5ff] text-[#00e5ff] text-[10px] font-mono font-bold flex items-center gap-1 transition-all shadow-sm active:scale-95"
                title="Open OmniAI Studio Companion"
              >
                <Sparkles className="w-3 h-3 text-[#00e5ff]" />
                <span>OmniAI</span>
              </button>
            )}

            {/* Change Studio button */}
            {onOpenSidebar && (
              <button
                onClick={onOpenSidebar}
                className="px-2 py-1 rounded-lg bg-black border border-[#181524] hover:border-[#8b5cf6]/60 text-[#a78bfa] text-[10px] font-mono font-bold flex items-center gap-1 transition-all shadow-sm"
              >
                <Layers className="w-3 h-3 text-[#8b5cf6]" />
                <span>Studios</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Render the Active Studio Component inside studio-canvas container */}
      <div className={`studio-canvas flex-1 min-h-0 w-full flex flex-col ${isMotionStudio || isSpatialStudio ? 'studio-canvas-motion !p-0 !pb-0 !gap-0 overflow-hidden' : isMobileViewportStudio ? '!p-0 !pb-0 !gap-0 overflow-y-auto' : 'overflow-y-auto'}`}>
        {selectedStudio === 'motion' && (
          <OmniMotionStudio 
            onSaveToVault={onSaveToVault} 
            onBackToHome={onBackToHome}
            onOpenSidebar={onOpenSidebar}
            onOpenCompanion={onOpenCompanion}
          />
        )}
        {selectedStudio === 'beat' && <OmniStoryboardStudio onSaveToVault={onSaveToVault} />}
        {selectedStudio === 'wave' && <OmniVoiceStudio onSaveToVault={onSaveToVault} />}
        {selectedStudio === 'yale' && <OmniYaleStudio onSaveToVault={onSaveToVault} />}
        {selectedStudio === 'code' && <OmniCodeStudio />}
        {(selectedStudio === 'forge' || selectedStudio === 'vector') && <OmniVectorBrandLab onSaveToVault={onSaveToVault} />}
        {selectedStudio === 'imagine' && <OmniImagineStudio onSaveToVault={onSaveToVault} />}
        {selectedStudio === 'analyzer' && <OmniAnalyzerStudio onSaveToVault={onSaveToVault} />}
        {selectedStudio === 'style' && <OmniStyleStudio onSaveToVault={onSaveToVault} />}
        {selectedStudio === 'spatial' && <OmniSpatial3DStudio onSaveToVault={onSaveToVault} />}
        {selectedStudio === 'mockup' && <OmniViralMockupStudio onSaveToVault={onSaveToVault} />}
        {selectedStudio === 'cosmic' && <OmniCosmicUILab />}
        {selectedStudio === 'architect' && (
          <OmniArchitectStudio 
            onSaveToVault={onSaveToVault}
            onBackToHome={onBackToHome}
            onOpenSidebar={onOpenSidebar}
            onOpenCompanion={onOpenCompanion}
          />
        )}
        {selectedStudio === 'automations' && <OmniAutomationsStudio />}
        {selectedStudio === 'connect' && <OmniConnectCatalog />}
      </div>

    </div>
  );
};
