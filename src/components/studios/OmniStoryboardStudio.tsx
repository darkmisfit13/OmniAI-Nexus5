import React, { useState, useRef } from 'react';
import { 
  Clapperboard, 
  Sparkles, 
  Plus, 
  Lock, 
  Unlock, 
  Check, 
  ChevronDown, 
  Image as ImageIcon, 
  Video, 
  Mic, 
  Send, 
  Layers, 
  Terminal, 
  Cpu, 
  Film,
  Zap,
  ArrowRight,
  UserCheck,
  CheckCircle2,
  Share2
} from 'lucide-react';
import { StudioId } from '../OmniStudiosView';

export interface StoryboardScene {
  id: string;
  sceneNumber: string;
  title: string;
  description: string;
  thumbnail: string;
  prompt: string;
  characterIds: string[];
}

export interface CharacterPortrait {
  id: string;
  name: string;
  avatar: string;
  isPinned: boolean;
}

interface OmniStoryboardStudioProps {
  onSelectStudio?: (id: StudioId) => void;
  onSaveToVault?: (asset: any) => void;
}

export const OmniStoryboardStudio: React.FC<OmniStoryboardStudioProps> = ({
  onSelectStudio,
  onSaveToVault,
}) => {
  // Title Header must display exactly: Omni Storyboard
  const [activeSceneId, setActiveSceneId] = useState<string>('scene-1');
  const [isAnchorEnabled, setIsAnchorEnabled] = useState<boolean>(true);
  const [isVectorLocked, setIsVectorLocked] = useState<boolean>(true);
  const [activeDispatcherDropdown, setActiveDispatcherDropdown] = useState<string | null>(null);
  const [dispatchStatusToast, setDispatchStatusToast] = useState<string | null>(null);

  // Script Terminal and Prompt state
  const [scriptText, setScriptText] = useState<string>(
    `### SCENE 01: THE NEON SPIRE [NIGHT]\nRain hammers the obsidian parapet of Dark Misfit headquarters. BENJAMIN (30s, nocturnal trench coat) stands before the volumetric terminal.\n\nBENJAMIN\n"The shadow engine is live. Fragment the script and lock continuity vectors across all studio nodes."\n\n### SCENE 02: THE DISPATCH PULSE\nHigh-speed optical streams ignite in neon cyan (#00ffcc). Volumetric storyboard cells materialize simultaneously across Video, Audio, and Image pipelines.`
  );
  const [promptInput, setPromptInput] = useState<string>(
    'Synthesize 4 cinematic nocturnal establishing keyframes with consistent facial vector anchor across all pipeline nodes.'
  );
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [selectedActions, setSelectedActions] = useState<{ analyze: boolean; sync: boolean }>({
    analyze: true,
    sync: true,
  });

  // Storyboard Scene cards for Zone 1
  const [scenes, setScenes] = useState<StoryboardScene[]>([
    {
      id: 'scene-1',
      sceneNumber: 'SCENE 01 • ESTABLISHING',
      title: 'The Obsidian Spire',
      description: 'Wide shot of cybernetic citadel against rainy midnight sky.',
      thumbnail: '/assets/filmstrip/thumb_01.jpg',
      prompt: 'Cyberpunk nocturnal citadel tower at midnight, rain reflections, volumetric cyan fog.',
      characterIds: ['char-1'],
    },
    {
      id: 'scene-2',
      sceneNumber: 'SCENE 02 • APEX CLOSE-UP',
      title: 'Facial Vector Anchor',
      description: 'Intense macro shot of protagonist activating the shadow console.',
      thumbnail: '/assets/filmstrip/thumb_03.jpg',
      prompt: 'Macro close-up portrait of protagonist with neon green holographic HUD eye reflection.',
      characterIds: ['char-1'],
    },
    {
      id: 'scene-3',
      sceneNumber: 'SCENE 03 • ACTION DISPATCH',
      title: 'Neural Stream Ignition',
      description: 'Multi-studio routing node executing instant vector transfers.',
      thumbnail: '/assets/filmstrip/thumb_06.jpg',
      prompt: 'Dynamic optical data streams arcing through midnight void, cinematic camera pan.',
      characterIds: ['char-1', 'char-2'],
    },
    {
      id: 'scene-4',
      sceneNumber: 'SCENE 04 • CLIMAX',
      title: 'The Infinite Consensus',
      description: 'Council quorum reached; holographic orb pulses in synchronous harmony.',
      thumbnail: '/assets/filmstrip/thumb_10.jpg',
      prompt: '3D glowing holographic orb floating over glass control desk, dark studio atmosphere.',
      characterIds: ['char-2'],
    },
  ]);

  // Global Character Anchor Array for Zone 2
  const [portraits, setPortraits] = useState<CharacterPortrait[]>([
    {
      id: 'char-1',
      name: 'Benjamin (Misfit)',
      avatar: '/assets/filmstrip/thumb_02.jpg',
      isPinned: true,
    },
    {
      id: 'char-2',
      name: 'Shadow AI Twin',
      avatar: '/assets/filmstrip/thumb_04.jpg',
      isPinned: true,
    },
    {
      id: 'char-3',
      name: 'Nexus Commander',
      avatar: '/assets/filmstrip/thumb_08.jpg',
      isPinned: false,
    },
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // One-Tap Studio Dispatcher Node Action Handlers
  const handleDispatch = (scene: StoryboardScene, destination: 'imagine' | 'motion' | 'wave') => {
    setActiveDispatcherDropdown(null);
    const destName = destination === 'imagine' ? 'Image Studio (OmniImagine)' : destination === 'motion' ? 'Video Studio (OmniMotion)' : 'Voice Studio (OmniWave)';
    
    setDispatchStatusToast(`⚡ Routed ${scene.sceneNumber} to ${destName}!`);
    setTimeout(() => setDispatchStatusToast(null), 3000);

    if (onSelectStudio) {
      setTimeout(() => {
        onSelectStudio(destination);
      }, 500);
    }
  };

  // Add Portrait handler
  const handleAddPortrait = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const url = uploadEvent.target?.result as string;
      const newPortrait: CharacterPortrait = {
        id: `char-${Date.now()}`,
        name: `Anchor Character ${portraits.length + 1}`,
        avatar: url,
        isPinned: true,
      };
      setPortraits((prev) => [...prev, newPortrait]);
    };
    reader.readAsDataURL(file);
  };

  // Master Action: Process Storyboard Elements
  const handleProcessStoryboard = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setDispatchStatusToast('✓ Processed Storyboard Elements: 4 Scene Cells Synthesized & Pinned!');
      setTimeout(() => setDispatchStatusToast(null), 3500);

      if (onSaveToVault) {
        onSaveToVault({
          type: 'storyboard',
          title: 'Omni Storyboard - Nocturnal Ep 1',
          thumbnail: scenes[0]?.thumbnail || '/assets/filmstrip/thumb_01.jpg',
          tags: ['OmniStoryboard', 'FaceAnchor', 'VTracerReady'],
          details: `${scenes.length} Scenes Processed with 99.2% Facial Consistency Vector.`,
        });
      }
    }, 1200);
  };

  return (
    <div className="w-full flex justify-center items-center py-1 sm:py-3 select-none bg-black">
      
      {/* 
        2. RIGID PHONE FRAME BOUNDARIES:
        Wrap the entire file framework inside a single-column container shell:
        w-full max-w-[400px] h-[850px] mx-auto overflow-hidden relative flex flex-col justify-between bg-black text-white
        Enforce box-sizing: border-box across absolutely all child divs to prevent horizontal scrolling layout bugs.
      */}
      <div 
        className="w-full max-w-[400px] h-[850px] mx-auto overflow-hidden relative flex flex-col justify-between bg-black text-white rounded-3xl border border-zinc-900 shadow-2xl font-sans"
        style={{ boxSizing: 'border-box' }}
      >

        {/* 1. APP HEADER: Title header strictly displays "Omni Storyboard" */}
        <div 
          className="h-11 px-3 bg-[#131024] border-b border-zinc-900 flex items-center justify-between shrink-0 z-30"
          style={{ boxSizing: 'border-box' }}
        >
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#00ffcc] flex items-center justify-center text-black font-black shadow-[0_0_10px_rgba(0,255,204,0.4)]">
              <Clapperboard className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-xs font-bold text-white tracking-wide">
                Omni Storyboard
              </h1>
              <span className="text-[9px] font-mono text-[#00ffcc] block leading-none">
                Fluid Split Multi-Pass Workspace
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-black/60 border border-[#00ffcc]/40 text-[#00ffcc] flex items-center gap-1 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00ffcc] animate-pulse" />
              <span>4 SCENES</span>
            </span>
          </div>
        </div>

        {/* ========================================================
            ZONE 1 (Top 40% - Visual Storyboard Preview & Dispatcher)
            ======================================================== */}
        <div 
          className="w-full h-[40%] relative bg-[#0b0816] border-b border-zinc-900 flex flex-col justify-between overflow-hidden"
          style={{ boxSizing: 'border-box' }}
        >
          {/* Header Bar within Preview Viewport */}
          <div 
            className="px-3 pt-2 pb-1 flex items-center justify-between z-10 shrink-0"
            style={{ boxSizing: 'border-box' }}
          >
            <div className="flex items-center gap-1.5">
              <Film className="w-3 h-3 text-[#00ffcc]" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-300">
                Visual Storyboard Preview Screen
              </span>
            </div>
            <span className="text-[9px] font-mono text-[#00ffcc]/80">⇄ Swipe Strip</span>
          </div>

          {/* Horizontal Swiping Strip of Generated Scene Cards */}
          <div 
            className="flex-1 flex overflow-x-auto whitespace-nowrap gap-3 p-3 scrollbar-hide items-center"
            style={{ boxSizing: 'border-box' }}
          >
            {scenes.map((scene) => {
              const isSelected = activeSceneId === scene.id;
              const isDropdownOpen = activeDispatcherDropdown === scene.id;

              return (
                <div
                  key={scene.id}
                  onClick={() => setActiveSceneId(scene.id)}
                  className={`relative shrink-0 w-52 h-[190px] rounded-2xl border transition-all flex flex-col justify-between p-2 select-none cursor-pointer ${
                    isSelected
                      ? 'bg-[#131024] border-[#00ffcc] shadow-[0_0_16px_rgba(0,255,204,0.3)]'
                      : 'bg-black/80 border-zinc-900 hover:border-zinc-800'
                  }`}
                  style={{ boxSizing: 'border-box' }}
                >
                  {/* Scene Header & Tag */}
                  <div className="flex items-center justify-between mb-1" style={{ boxSizing: 'border-box' }}>
                    <span className="text-[10px] font-mono font-bold text-[#00ffcc] truncate max-w-[140px]">
                      {scene.sceneNumber}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-[#00ffcc] opacity-80" />
                  </div>

                  {/* Thumbnail Frame Preview */}
                  <div 
                    className="w-full h-24 rounded-xl overflow-hidden bg-zinc-950 border border-zinc-900 relative group"
                    style={{ boxSizing: 'border-box' }}
                  >
                    <img 
                      src={scene.thumbnail} 
                      alt={scene.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent flex items-end p-1.5">
                      <span className="text-[10px] font-bold text-white truncate drop-shadow-md">
                        {scene.title}
                      </span>
                    </div>
                  </div>

                  {/* Scene Synopsis Description */}
                  <p className="text-[9px] text-zinc-400 font-sans truncate leading-tight mt-1" style={{ boxSizing: 'border-box' }}>
                    {scene.description}
                  </p>

                  {/* ONE-TAP AUTOMATED STUDIO DISPATCHER DROPDOWN */}
                  <div className="relative mt-1" style={{ boxSizing: 'border-box' }}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveDispatcherDropdown(isDropdownOpen ? null : scene.id);
                      }}
                      className="w-full py-1 px-2 rounded-lg bg-black border border-zinc-800 hover:border-[#00ffcc] text-[9.5px] font-mono font-bold text-zinc-300 hover:text-[#00ffcc] flex items-center justify-between transition-colors shadow-sm"
                    >
                      <span className="flex items-center gap-1">
                        <Zap className="w-2.5 h-2.5 text-[#00ffcc]" />
                        <span>Dispatch Node</span>
                      </span>
                      <ChevronDown className="w-3 h-3 text-zinc-500" />
                    </button>

                    {/* Dropdown Options */}
                    {isDropdownOpen && (
                      <div 
                        className="absolute bottom-full left-0 mb-1 w-full bg-[#131024] border border-[#00ffcc]/60 rounded-xl p-1 shadow-2xl z-40 space-y-1 animate-in fade-in"
                        style={{ boxSizing: 'border-box' }}
                      >
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleDispatch(scene, 'imagine'); }}
                          className="w-full text-left px-2 py-1 rounded text-[9.5px] font-mono text-zinc-200 hover:bg-black hover:text-[#00ffcc] flex items-center gap-1.5 transition"
                        >
                          <ImageIcon className="w-3 h-3 text-[#00ffcc]" />
                          <span>Route to Image Studio</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleDispatch(scene, 'motion'); }}
                          className="w-full text-left px-2 py-1 rounded text-[9.5px] font-mono text-zinc-200 hover:bg-black hover:text-[#00ffcc] flex items-center gap-1.5 transition"
                        >
                          <Video className="w-3 h-3 text-[#00ffcc]" />
                          <span>Route to Video Studio</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleDispatch(scene, 'wave'); }}
                          className="w-full text-left px-2 py-1 rounded text-[9.5px] font-mono text-zinc-200 hover:bg-black hover:text-[#00ffcc] flex items-center gap-1.5 transition"
                        >
                          <Mic className="w-3 h-3 text-[#00ffcc]" />
                          <span>Route to Voice Studio</span>
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>

          {/* Dispatch Status Toast Feedback */}
          {dispatchStatusToast && (
            <div 
              className="absolute top-2 inset-x-3 z-30 p-1.5 rounded-xl bg-[#00ffcc] text-black font-mono text-[10px] font-bold text-center shadow-[0_0_15px_rgba(0,255,204,0.8)] animate-in fade-in"
              style={{ boxSizing: 'border-box' }}
            >
              {dispatchStatusToast}
            </div>
          )}
        </div>

        {/* ========================================================
            ZONE 2 (Middle 20% - Global Character Anchor Array)
            ======================================================== */}
        <div 
          className="w-full h-[20%] bg-[#131024] p-3 flex flex-col justify-between border-b border-zinc-900"
          style={{ boxSizing: 'border-box' }}
        >
          {/* Top Row: Master Toggle & Pre-Pin Metrics */}
          <div className="flex items-center justify-between" style={{ boxSizing: 'border-box' }}>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-[#00ffcc]" />
                Global Character Anchor
              </span>
              <button
                type="button"
                onClick={() => setIsAnchorEnabled(!isAnchorEnabled)}
                className={`w-8 h-4 rounded-full p-0.5 transition-colors ${
                  isAnchorEnabled ? 'bg-[#00ffcc]' : 'bg-zinc-800'
                }`}
              >
                <div 
                  className={`w-3 h-3 rounded-full bg-black transition-transform ${
                    isAnchorEnabled ? 'translate-x-4' : 'translate-x-0'
                  }`} 
                />
              </button>
            </div>

            <span className="text-[10px] font-mono font-bold text-[#00ffcc] tracking-wide">
              Pre-Pin to Generative Prompts
            </span>
          </div>

          {/* Bottom Row: Ultra-Smooth Horizontal Swiping Track (0 to 5+ Portraits) */}
          <div 
            className="flex items-center justify-between gap-2 pt-1.5"
            style={{ boxSizing: 'border-box' }}
          >
            <div 
              className="flex items-center gap-2.5 overflow-x-auto whitespace-nowrap scrollbar-hide py-1 flex-1"
              style={{ boxSizing: 'border-box' }}
            >
              {/* Circular Gray "+" Button (Slot 1) */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-11 h-11 rounded-full bg-zinc-900 border border-zinc-700 hover:border-[#00ffcc] text-zinc-400 hover:text-[#00ffcc] flex items-center justify-center shrink-0 transition-all shadow-inner active:scale-95"
                title="Upload Face Portrait for Continuity"
              >
                <Plus className="w-4 h-4" />
              </button>
              <input 
                ref={fileInputRef} 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleAddPortrait} 
              />

              {/* Uploaded Face Portraits as Mini Circular Avatar Bubbles with Glowing Neon Borders */}
              {portraits.map((portrait) => (
                <div
                  key={portrait.id}
                  onClick={() => {
                    setPortraits((prev) =>
                      prev.map((p) => p.id === portrait.id ? { ...p, isPinned: !p.isPinned } : p)
                    );
                  }}
                  className={`relative shrink-0 w-11 h-11 rounded-full p-0.5 cursor-pointer transition-all ${
                    portrait.isPinned
                      ? 'border-2 border-[#00ffcc] shadow-[0_0_10px_rgba(0,255,204,0.5)]'
                      : 'border-2 border-zinc-800 opacity-60'
                  }`}
                  style={{ boxSizing: 'border-box' }}
                  title={`${portrait.name} (Click to toggle anchor)`}
                >
                  <img
                    src={portrait.avatar}
                    alt={portrait.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                  {portrait.isPinned && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#00ffcc] text-black flex items-center justify-center text-[8px] font-black">
                      ✓
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Prominent Center Button: Lock Consistency Vector */}
            <button
              type="button"
              onClick={() => setIsVectorLocked(!isVectorLocked)}
              className={`px-3 py-1.5 rounded-xl border text-[10px] font-mono font-bold flex items-center gap-1.5 shrink-0 transition-all shadow-md ${
                isVectorLocked
                  ? 'bg-black border-[#00ffcc] text-[#00ffcc] shadow-[0_0_12px_rgba(0,255,204,0.3)]'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {isVectorLocked ? (
                <>
                  <Lock className="w-3 h-3 text-[#00ffcc]" />
                  <span>Lock Consistency Vector</span>
                </>
              ) : (
                <>
                  <Unlock className="w-3 h-3 text-zinc-400" />
                  <span>Vector Unlocked</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ========================================================
            ZONE 3 (Bottom 40% - Script Parsing Terminal & Markdown Engine)
            ======================================================== */}
        <div 
          className="w-full h-[40%] bg-black p-4 flex flex-col justify-between overflow-y-auto"
          style={{ boxSizing: 'border-box' }}
        >
          {/* Upper Box: [Script Parsing Terminal] with Markdown text terminal */}
          <div className="space-y-1" style={{ boxSizing: 'border-box' }}>
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-[#00ffcc] uppercase font-bold flex items-center gap-1">
                <Terminal className="w-3 h-3 text-[#00ffcc]" /> Script Parsing Terminal
              </span>
              <span className="text-zinc-500">Markdown AST Engine</span>
            </div>

            <textarea
              value={scriptText}
              onChange={(e) => setScriptText(e.target.value)}
              className="w-full h-[95px] bg-zinc-950 border border-zinc-900 rounded-lg p-2 text-xs font-mono text-zinc-300 overflow-y-auto outline-none leading-relaxed resize-none focus:border-[#00ffcc]/60"
              style={{ boxSizing: 'border-box' }}
              placeholder="Paste screenplay, script, or markdown scenes here..."
            />
          </div>

          {/* Center Controls: Prompt Text Entry Block + Multi-Select Action Row */}
          <div className="space-y-2 py-1" style={{ boxSizing: 'border-box' }}>
            <input
              type="text"
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              placeholder="Directives for scene breakdown and camera framing..."
              className="w-full bg-[#131024] border border-zinc-800 rounded-xl px-2.5 py-1.5 text-xs font-sans text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-[#00ffcc]"
              style={{ boxSizing: 'border-box' }}
            />

            {/* Dedicated Multi-Select Action Row */}
            <div className="grid grid-cols-2 gap-2" style={{ boxSizing: 'border-box' }}>
              <button
                type="button"
                onClick={() => setSelectedActions((prev) => ({ ...prev, analyze: !prev.analyze }))}
                className={`py-1.5 px-2 rounded-xl text-[10px] font-mono font-bold border flex items-center justify-center gap-1.5 transition-all ${
                  selectedActions.analyze
                    ? 'bg-[#131024] border-[#00ffcc] text-[#00ffcc] shadow-[0_0_10px_rgba(0,255,204,0.25)]'
                    : 'bg-zinc-950 border-zinc-900 text-zinc-400'
                }`}
              >
                <CheckCircle2 className={`w-3 h-3 ${selectedActions.analyze ? 'text-[#00ffcc]' : 'text-zinc-600'}`} />
                <span>Analyze & Fragment Script</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedActions((prev) => ({ ...prev, sync: !prev.sync }))}
                className={`py-1.5 px-2 rounded-xl text-[10px] font-mono font-bold border flex items-center justify-center gap-1.5 transition-all ${
                  selectedActions.sync
                    ? 'bg-[#131024] border-[#00ffcc] text-[#00ffcc] shadow-[0_0_10px_rgba(0,255,204,0.25)]'
                    : 'bg-zinc-950 border-zinc-900 text-zinc-400'
                }`}
              >
                <CheckCircle2 className={`w-3 h-3 ${selectedActions.sync ? 'text-[#00ffcc]' : 'text-zinc-600'}`} />
                <span>Sync Global Matrix</span>
              </button>
            </div>
          </div>

          {/* Master Execution Button: Full-width glowing button anchored to absolute lowest margin */}
          <button
            type="button"
            onClick={handleProcessStoryboard}
            disabled={isProcessing}
            className="w-full h-11 text-black font-bold text-sm rounded-xl bg-[#00ffcc] hover:bg-[#00ffcc]/90 shadow-[0_0_20px_rgba(0,255,204,0.6)] flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 font-mono tracking-wide"
            style={{ boxSizing: 'border-box' }}
          >
            <Sparkles className="w-4 h-4 fill-current" />
            <span>{isProcessing ? 'Synthesizing Storyboard...' : 'Process Storyboard Elements'}</span>
          </button>
        </div>

      </div>

    </div>
  );
};
