import React, { useState } from 'react';
import { 
  Smartphone, 
  ShieldAlert, 
  FolderLock, 
  Share2, 
  Sparkles, 
  Eye, 
  RotateCcw, 
  Heart, 
  MessageCircle, 
  Bookmark, 
  Music2, 
  Check, 
  Download,
  AlertTriangle,
  Layers,
  Flame,
  Hash,
  AtSign
} from 'lucide-react';
import { HoloOrb, OrbPhase } from '../HoloOrb';

interface OmniViralMockupStudioProps {
  onSaveToVault?: (asset: any) => void;
}

export type MockupPlatform = 'TikTok' | 'Instagram' | 'YouTube' | 'App Store' | 'Spotify' | 'Canvas';

export const OmniViralMockupStudio: React.FC<OmniViralMockupStudioProps> = ({ onSaveToVault }) => {
  // Platform Tabs (6 required platforms)
  const [selectedPlatform, setSelectedPlatform] = useState<MockupPlatform>('TikTok');

  // Input Tray States
  const [creatorHandle, setCreatorHandle] = useState<string>('@darkmisfit');
  const [caption, setCaption] = useState<string>('When the beat drops in OmniBeat ⚡ No one makes music like this.');
  const [hashtags, setHashtags] = useState<string>('#OmniAI #OmniMotion #Cyberpunk #TechTrend');
  const [audioLabel, setAudioLabel] = useState<string>('OmniStyle Studio - Original Audio');

  // Mockup Media
  const [previewMedia, setPreviewMedia] = useState<string>('https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=800&q=80');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handlePushToVault = () => {
    if (onSaveToVault) {
      onSaveToVault({
        type: 'mockup',
        title: `Viral Mockup (${selectedPlatform}) - ${creatorHandle}`,
        thumbnail: previewMedia,
        tags: ['Viral Mockup Studio', selectedPlatform, 'Safe Zone Guarded', creatorHandle],
        details: `${caption} ${hashtags}`
      });
      setToastMessage(`Saved ${selectedPlatform} mockup directly to Omni Vault!`);
      setTimeout(() => setToastMessage(null), 2500);
    }
  };

  return (
    <div 
      className="w-full max-w-[400px] h-[850px] mx-auto overflow-hidden relative flex flex-col justify-between bg-black text-white font-sans select-none"
      style={{ boxSizing: 'border-box' }}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 z-50 px-3 py-1.5 rounded-full bg-[#131024]/95 border border-[#00ffcc]/50 text-[#00ffcc] text-[10.5px] font-mono shadow-2xl backdrop-blur-md animate-in fade-in flex items-center gap-1.5 max-w-[90%] truncate">
          <Sparkles className="w-3 h-3 text-[#00ffcc] shrink-0" />
          <span className="truncate">{toastMessage}</span>
        </div>
      )}

      {/* HEADER */}
      <div className="h-12 px-4 bg-[#131024] border-b border-zinc-900 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-[#00ffcc]" />
          <h1 className="font-bold text-xs tracking-wider uppercase text-white font-mono">
            Viral Mockup Studio
          </h1>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[8.5px] font-mono px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/40">
            Red Safe Zones Active
          </span>
          <button
            onClick={handlePushToVault}
            className="px-2 py-0.5 rounded-md bg-[#00ffcc] text-slate-950 font-bold text-[9.5px] font-mono flex items-center gap-1 active:scale-95 transition"
            title="Push Mockup to Vault"
          >
            <FolderLock className="w-2.5 h-2.5" />
            <span>Vault</span>
          </button>
        </div>
      </div>

      {/* ZONE 1 (Live Viewport - 60% Height) */}
      <div className="h-[60%] min-h-[460px] bg-[#0b0816] relative flex items-center justify-center p-3 overflow-hidden border-b border-zinc-900">
        
        {/* Smartphone Device Mockup Container */}
        <div className="relative w-[240px] h-[440px] rounded-[32px] bg-black border-4 border-zinc-800 shadow-[0_0_30px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col justify-between">
          
          {/* Dynamic Island / Camera Notch */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-4 bg-black rounded-full z-40 border border-zinc-900 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-zinc-900 mr-2" />
            <div className="w-1.5 h-1.5 rounded-full bg-blue-900/60" />
          </div>

          {/* Background Mockup Image */}
          <div className="absolute inset-0 z-0">
            <img 
              src={previewMedia} 
              alt="Mockup background"
              className="w-full h-full object-cover" 
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/85" />
          </div>

          {/* PERMANENT SEMI-TRANSLUCENT RED SAFE ZONE GUARD OVERLAY LINES */}
          <div className="absolute inset-0 z-20 pointer-events-none">
            {/* Top Red Safe Line (Status Bar & Following/For You tabs) */}
            <div className="absolute top-[48px] left-0 right-0 border-b border-dashed border-red-500/80 bg-red-500/10 h-6 flex items-center justify-between px-2 text-[7px] font-mono text-red-300 font-bold">
              <span>▲ HEADER SAFE LIMIT</span>
              <span>NO TEXT ZONE</span>
            </div>

            {/* Right Action Rail Red Safe Zone (Like, Comment, Bookmark, Share rail) */}
            <div className="absolute top-[110px] bottom-[110px] right-0 w-12 border-l border-dashed border-red-500/80 bg-red-500/10 flex flex-col items-center justify-center p-1 text-[6.5px] font-mono text-red-300 font-bold text-center leading-tight">
              <span>R</span>
              <span>A</span>
              <span>I</span>
              <span>L</span>
            </div>

            {/* Bottom Caption & Audio Safe Line */}
            <div className="absolute bottom-[20px] left-0 right-0 h-20 border-t border-dashed border-red-500/80 bg-red-500/10 flex flex-col justify-end p-1 text-[7px] font-mono text-red-300 font-bold">
              <div className="flex justify-between">
                <span>▼ FEED CAPTION & AUDIO MARQUEE BOUNDARY</span>
                <span>SAFE</span>
              </div>
            </div>
          </div>

          {/* Simulated Platform UI Elements */}
          {/* Header */}
          <div className="relative z-30 pt-6 px-3 flex justify-center items-center text-xs font-bold text-white drop-shadow">
            <div className="flex gap-3 text-[11px]">
              <span className="opacity-60">Following</span>
              <span className="border-b-2 border-white pb-0.5">For You</span>
            </div>
          </div>

          {/* Right Action Rail (Icons) */}
          <div className="relative z-30 self-end pr-2 flex flex-col items-center gap-3 text-white drop-shadow-md">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-zinc-800/80 backdrop-blur-sm flex items-center justify-center">
                <Heart className="w-4 h-4 text-red-500 fill-red-500" />
              </div>
              <span className="text-[9px] font-mono font-bold mt-0.5">142K</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-zinc-800/80 backdrop-blur-sm flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-white" />
              </div>
              <span className="text-[9px] font-mono font-bold mt-0.5">3.8K</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-zinc-800/80 backdrop-blur-sm flex items-center justify-center">
                <Bookmark className="w-4 h-4 text-amber-400 fill-amber-400" />
              </div>
              <span className="text-[9px] font-mono font-bold mt-0.5">18.4K</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-zinc-800/80 backdrop-blur-sm flex items-center justify-center">
                <Share2 className="w-4 h-4 text-white" />
              </div>
              <span className="text-[9px] font-mono font-bold mt-0.5">Share</span>
            </div>
          </div>

          {/* Bottom Feed Overlay (Handle, Caption, Audio) */}
          <div className="relative z-30 p-3 pt-0 text-white space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold font-mono text-white">{creatorHandle}</span>
              <span className="text-[8.5px] px-1 rounded bg-[#00ffcc] text-slate-950 font-bold">PRO</span>
            </div>

            <p className="text-[10px] text-zinc-200 line-clamp-2 leading-tight">
              {caption}
            </p>

            <p className="text-[9.5px] text-[#00ffcc] font-mono truncate">
              {hashtags}
            </p>

            <div className="flex items-center gap-1 text-[9px] font-mono text-zinc-300 pt-0.5">
              <Music2 className="w-3 h-3 text-[#00ffcc] animate-spin" />
              <span className="truncate">{audioLabel}</span>
            </div>
          </div>

        </div>
      </div>

      {/* ZONE 2 (Input Tray - 40% Height) */}
      <div className="h-[40%] min-h-[290px] p-3 bg-[#131024] flex flex-col justify-between overflow-y-auto">
        
        {/* Platform Tabs (6 required platforms) */}
        <div className="space-y-1">
          <span className="text-[9px] font-mono font-bold text-zinc-400 uppercase">
            Select Platform Format:
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {(
              ['TikTok', 'Instagram', 'YouTube', 'App Store', 'Spotify', 'Canvas'] as MockupPlatform[]
            ).map((plat) => {
              const isSelected = selectedPlatform === plat;
              return (
                <button
                  key={plat}
                  onClick={() => setSelectedPlatform(plat)}
                  className={`px-2.5 py-1 rounded-lg font-mono text-[9.5px] font-bold whitespace-nowrap shrink-0 transition active:scale-95 border ${
                    isSelected 
                      ? 'bg-[#00ffcc] text-slate-950 border-[#00ffcc] shadow-[0_0_8px_rgba(0,255,204,0.3)]' 
                      : 'bg-black/60 text-zinc-300 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  {plat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Form Inputs (Creator Handle, Caption, Hashtags) */}
        <div className="space-y-2 mt-1">
          {/* Creator Handle */}
          <div className="flex items-center gap-2 bg-[#0b0816] rounded-xl px-2.5 py-1.5 border border-zinc-800 focus-within:border-[#00ffcc] transition">
            <AtSign className="w-3.5 h-3.5 text-[#00ffcc] shrink-0" />
            <input
              type="text"
              value={creatorHandle}
              onChange={(e) => setCreatorHandle(e.target.value)}
              className="w-full bg-transparent text-xs text-white outline-none font-mono"
              placeholder="@handle"
            />
          </div>

          {/* Caption Textarea */}
          <div className="bg-[#0b0816] rounded-xl p-2 border border-zinc-800 focus-within:border-[#00ffcc] transition">
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={2}
              className="w-full bg-transparent text-xs text-white outline-none font-sans resize-none"
              placeholder="Caption text (guaranteed safe zone margins)..."
            />
          </div>

          {/* Metadata Hashtags */}
          <div className="flex items-center gap-2 bg-[#0b0816] rounded-xl px-2.5 py-1.5 border border-zinc-800 focus-within:border-[#00ffcc] transition">
            <Hash className="w-3.5 h-3.5 text-[#00ffcc] shrink-0" />
            <input
              type="text"
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              className="w-full bg-transparent text-xs text-cyan-300 outline-none font-mono"
              placeholder="#hashtags"
            />
          </div>
        </div>

        {/* Bottom Neon #00ffcc Action Button: Push Mockup to Vault */}
        <button
          onClick={handlePushToVault}
          className="mt-2 w-full py-3 rounded-xl bg-[#00ffcc] hover:bg-[#1affd4] text-slate-950 font-black font-mono text-xs tracking-wider uppercase shadow-lg shadow-[#00ffcc]/20 active:scale-98 transition flex items-center justify-center gap-2"
        >
          <FolderLock className="w-4 h-4 text-slate-950 fill-current" />
          <span>Push Mockup to Vault</span>
        </button>

      </div>
    </div>
  );
};
