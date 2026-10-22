import React, { useState } from 'react';
import { 
  Film, 
  Lock, 
  Unlock, 
  Terminal, 
  Sparkles, 
  Play, 
  Plus, 
  Check, 
  Camera, 
  Layers, 
  FolderLock, 
  ChevronRight,
  UserCheck,
  RefreshCw,
  FileCode
} from 'lucide-react';
import { HoloOrb, OrbPhase } from '../HoloOrb';

interface StoryboardScene {
  id: string;
  sceneNumber: number;
  title: string;
  thumbnail: string;
  lens: string;
  duration: string;
  prompt: string;
  characterAnchorLocked: boolean;
}

interface CharacterAnchor {
  id: string;
  name: string;
  avatar: string;
  isLocked: boolean;
}

interface OmniStoryboardProps {
  onSaveToVault?: (asset: any) => void;
}

export const OmniStoryboardStudio: React.FC<OmniStoryboardProps> = ({ onSaveToVault }) => {
  // Global Character Anchors (0 to 5 circular badges)
  const [characterAnchors, setCharacterAnchors] = useState<CharacterAnchor[]>([
    { id: 'char-1', name: 'Ren (Rogue)', avatar: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&q=80', isLocked: true },
    { id: 'char-2', name: 'V (Hacker)', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80', isLocked: true },
    { id: 'char-3', name: 'Android K', avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&q=80', isLocked: false },
    { id: 'char-4', name: 'Nyx (Sniper)', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&q=80', isLocked: false },
    { id: 'char-5', name: 'Cipher AI', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80', isLocked: false },
  ]);

  const [activeAnchorId, setActiveAnchorId] = useState<string>('char-1');
  const [globalAnchorLock, setGlobalAnchorLock] = useState<boolean>(true);

  // Storyboard Scenes
  const [scenes, setScenes] = useState<StoryboardScene[]>([
    {
      id: 'sc-1',
      sceneNumber: 1,
      title: 'Neon Cyber Alleyway',
      thumbnail: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=600&q=80',
      lens: 'Wide Angle 24mm',
      duration: '3.5s',
      prompt: 'Rain soaked cyberpunk alley with purple neon signage reflection.',
      characterAnchorLocked: true
    },
    {
      id: 'sc-2',
      sceneNumber: 2,
      title: 'High-Speed Bike Chase',
      thumbnail: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&q=80',
      lens: 'Action Cam 18mm',
      duration: '4.0s',
      prompt: 'Protagonist weaving through hyper-highway traffic at nocturnal speed.',
      characterAnchorLocked: true
    },
    {
      id: 'sc-3',
      sceneNumber: 3,
      title: 'Holographic Neon Tower',
      thumbnail: 'https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=600&q=80',
      lens: 'Low Angle 35mm',
      duration: '2.8s',
      prompt: 'Gigantic advertising hologram projecting over megacity skyline.',
      characterAnchorLocked: false
    },
    {
      id: 'sc-4',
      sceneNumber: 4,
      title: 'Rooftop Duel Encounter',
      thumbnail: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=600&q=80',
      lens: 'Telephoto 85mm',
      duration: '5.2s',
      prompt: 'Direct confrontation atop Arasaka spire under thunderstorm.',
      characterAnchorLocked: true
    }
  ]);

  // Script Terminal
  const [scriptMarkdown, setScriptMarkdown] = useState<string>(
`INT. CYBER ALLEYWAY - NIGHT
The rain is heavy. Neon reflections ripple across the asphalt.
REN (30s) pulls up his cyber visor.

REN
They tracked the neural downlink. Move now!

EXT. NEO-TOKYO HIGHWAY - CONTINUOUS
V speeds ahead on a modified hover-bike. Sirens wail in the distance.`
  );

  const [isParsingScript, setIsParsingScript] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleToggleAnchorLock = (id: string) => {
    setCharacterAnchors(prev => prev.map(a => 
      a.id === id ? { ...a, isLocked: !a.isLocked } : a
    ));
    setToastMessage('Character facial anchor status updated');
    setTimeout(() => setToastMessage(null), 1500);
  };

  const handleParseScript = () => {
    setIsParsingScript(true);
    setToastMessage('Parsing script syntax and routing scene prompt tokens...');

    setTimeout(() => {
      setIsParsingScript(false);
      setToastMessage('Generated 4 active visual storyboard scenes!');
      setTimeout(() => setToastMessage(null), 2500);
    }, 1200);
  };

  const handleSaveToVault = () => {
    if (onSaveToVault) {
      onSaveToVault({
        type: 'storyboard',
        title: `Omni Storyboard - 4 Scenes (${characterAnchors.filter(c => c.isLocked).length} Character Anchors Locked)`,
        thumbnail: scenes[0]?.thumbnail || '/assets/filmstrip/thumb_01.jpg',
        tags: ['Omni Storyboard', 'Character Anchored', 'Cinematic Script'],
        details: scriptMarkdown
      });
      setToastMessage('Storyboard saved to Omni Vault!');
      setTimeout(() => setToastMessage(null), 2500);
    }
  };

  return (
    <div 
      className="w-full max-w-[400px] h-[850px] mx-auto overflow-hidden relative flex flex-col justify-between bg-black text-white font-sans select-none"
      style={{ boxSizing: 'border-box' }}
    >
      {/* Toast */}
      {toastMessage && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 z-50 px-3 py-1.5 rounded-full bg-[#131024]/95 border border-[#00ffcc]/50 text-[#00ffcc] text-[10.5px] font-mono shadow-2xl backdrop-blur-md animate-in fade-in flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-[#00ffcc]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER */}
      <div className="h-12 px-4 bg-[#131024] border-b border-zinc-900 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Film className="w-4 h-4 text-[#00ffcc]" />
          <h1 className="font-bold text-xs tracking-wider uppercase text-white font-mono">
            Omni Storyboard
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveToVault}
            className="px-2 py-0.5 rounded-md bg-[#00ffcc] text-slate-950 font-bold text-[9.5px] font-mono flex items-center gap-1 active:scale-95 transition"
            title="Save Storyboard to Vault"
          >
            <FolderLock className="w-2.5 h-2.5" />
            <span>Vault</span>
          </button>
        </div>
      </div>

      {/* ZONE 1 (Top 50% Height - 2-Column Scrollable Visual Storyboard Preview Grid) */}
      <div className="h-[50%] p-3 flex flex-col bg-black border-b border-zinc-900">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-zinc-400 text-[10px] font-mono">
            <Layers className="w-3.5 h-3.5 text-[#00ffcc]" />
            <span className="text-white font-bold">STORYBOARD PREVIEW GRID</span>
            <span className="text-zinc-600">|</span>
            <span className="text-zinc-400">{scenes.length} Scenes</span>
          </div>
          <span className="text-[9.5px] font-mono text-[#00ffcc]">
            {scenes.reduce((acc, s) => acc + parseFloat(s.duration), 0).toFixed(1)}s Runtime
          </span>
        </div>

        {/* The required 2-column scrollable grid */}
        <div className="grid grid-cols-2 gap-2 overflow-y-auto h-[320px] pr-1">
          {scenes.map((scene) => (
            <div 
              key={scene.id}
              className="group relative rounded-xl overflow-hidden bg-[#131024] border border-zinc-800 hover:border-[#00ffcc]/60 transition flex flex-col justify-between"
            >
              {/* Image Frame */}
              <div className="relative aspect-[16/10] overflow-hidden bg-[#0b0816]">
                <img 
                  src={scene.thumbnail} 
                  alt={scene.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40" />
                
                <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/80 text-[8.5px] font-mono text-white font-bold border border-white/10">
                  SCENE 0{scene.sceneNumber}
                </span>

                <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-[#00ffcc]/20 text-[#00ffcc] text-[8.5px] font-mono font-bold border border-[#00ffcc]/40">
                  {scene.duration}
                </span>

                {scene.characterAnchorLocked && (
                  <div className="absolute bottom-1.5 right-1.5 p-1 rounded-full bg-[#131024]/90 border border-[#00ffcc]/60 text-[#00ffcc]" title="Facial Identity Anchored">
                    <UserCheck className="w-2.5 h-2.5" />
                  </div>
                )}
              </div>

              {/* Card Meta & Prompt */}
              <div className="p-2 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-white truncate block">{scene.title}</span>
                </div>
                <div className="flex items-center gap-1 text-[8px] font-mono text-cyan-300">
                  <Camera className="w-2.5 h-2.5" />
                  <span>{scene.lens}</span>
                </div>
                <p className="text-[8.5px] text-zinc-400 line-clamp-2 leading-tight">
                  {scene.prompt}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ZONE 2 (Center 15% Height - Horizontal Scrolling Global Character Anchor Row) */}
      <div className="h-[15%] px-3 py-2 bg-[#131024] border-b border-zinc-900 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-300 font-bold">
            <UserCheck className="w-3.5 h-3.5 text-[#00ffcc]" />
            <span>GLOBAL CHARACTER ANCHORS (0-5)</span>
          </div>

          {/* Master Lock Switch */}
          <button
            onClick={() => setGlobalAnchorLock(!globalAnchorLock)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold transition ${
              globalAnchorLock 
                ? 'bg-[#00ffcc]/20 text-[#00ffcc] border border-[#00ffcc]/40' 
                : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
            }`}
          >
            {globalAnchorLock ? <Lock className="w-2.5 h-2.5" /> : <Unlock className="w-2.5 h-2.5" />}
            <span>{globalAnchorLock ? 'Anchor Locked' : 'Unlocked'}</span>
          </button>
        </div>

        {/* Horizontal Scrolling Badges */}
        <div className="flex items-center gap-3 overflow-x-auto pb-1 pt-1 no-scrollbar">
          {characterAnchors.map((char) => {
            const isSelected = activeAnchorId === char.id;
            return (
              <div
                key={char.id}
                onClick={() => setActiveAnchorId(char.id)}
                className={`flex items-center gap-1.5 p-1 pr-2.5 rounded-full cursor-pointer transition shrink-0 border ${
                  isSelected 
                    ? 'bg-[#0b0816] border-[#00ffcc] shadow-[0_0_8px_rgba(0,255,204,0.3)]' 
                    : 'bg-black/60 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="relative">
                  <img 
                    src={char.avatar} 
                    alt={char.name} 
                    className="w-7 h-7 rounded-full object-cover border border-white/10" 
                  />
                  {char.isLocked && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#00ffcc] text-slate-950 flex items-center justify-center">
                      <Lock className="w-2 h-2 stroke-[3]" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <span className="text-[9.5px] font-bold text-white block truncate">{char.name}</span>
                  <span className="text-[7.5px] font-mono text-[#00ffcc]">{char.isLocked ? 'Anchor ON' : 'Draft'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ZONE 3 (Bottom 35% Height - Markdown-Supported Script Parsing Terminal View) */}
      <div className="h-[35%] p-3 bg-black flex flex-col justify-between">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5 text-zinc-300 text-[10px] font-mono">
            <Terminal className="w-3.5 h-3.5 text-[#00ffcc]" />
            <span className="font-bold">SCRIPT PARSING TERMINAL</span>
          </div>
          <span className="text-[8.5px] font-mono text-zinc-500">
            Fountain / Screenplay Markdown
          </span>
        </div>

        {/* Script Editor Container */}
        <div className="flex-1 bg-[#0b0816] rounded-xl border border-zinc-900 p-2 overflow-hidden flex flex-col justify-between">
          <textarea
            value={scriptMarkdown}
            onChange={(e) => setScriptMarkdown(e.target.value)}
            className="w-full flex-1 bg-transparent text-zinc-300 font-mono text-[10.5px] resize-none outline-none leading-relaxed"
            placeholder="Type script markdown..."
          />
        </div>

        {/* Parse Script Action Button */}
        <button
          onClick={handleParseScript}
          disabled={isParsingScript}
          className="mt-2 w-full py-2.5 rounded-xl bg-[#00ffcc] hover:bg-[#1affd4] text-slate-950 font-black font-mono text-xs tracking-wider uppercase shadow-lg shadow-[#00ffcc]/20 active:scale-98 transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5 text-slate-950 fill-current" />
          <span>{isParsingScript ? 'Parsing Script Tokens...' : 'Parse Script to Storyboard Scenes'}</span>
        </button>
      </div>

    </div>
  );
};
