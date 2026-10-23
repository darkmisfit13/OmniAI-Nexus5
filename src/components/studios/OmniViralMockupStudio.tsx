import React, { useState } from 'react';
import { 
  Smartphone, 
  FolderLock, 
  Share2, 
  Sparkles, 
  Heart, 
  MessageCircle, 
  Bookmark, 
  Music2, 
  Layers, 
  Hash, 
  AtSign,
  Check
} from 'lucide-react';

interface OmniViralMockupStudioProps {
  onSaveToVault?: (asset: any) => void;
}

export type MockupPlatform = 'TikTok' | 'Instagram Reels' | 'YouTube Shorts' | 'App Store' | 'Spotify Canvas';

interface VaultQuickAsset {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'video';
}

const DEFAULT_VAULT_THUMBNAILS: VaultQuickAsset[] = [
  { id: 'v-1', name: 'Cyber City Tokyo Drive', url: '/assets/filmstrip/thumb_01.jpg', type: 'image' },
  { id: 'v-2', name: 'Dark Rose Winged Fairy', url: '/assets/filmstrip/thumb_02.jpg', type: 'image' },
  { id: 'v-3', name: 'Neon Rain Reflections', url: '/assets/filmstrip/thumb_03.jpg', type: 'image' },
  { id: 'v-4', name: 'Glitch Shutter Motion', url: '/assets/filmstrip/thumb_04.jpg', type: 'image' },
  { id: 'v-5', name: 'Quantum Core Hologram', url: '/assets/filmstrip/thumb_05.jpg', type: 'image' },
  { id: 'v-6', name: 'CapCut Timeline Beat', url: '/assets/filmstrip/thumb_06.jpg', type: 'image' },
  { id: 'v-7', name: 'Nocturnal Studio Aesthetic', url: '/assets/filmstrip/thumb_07.jpg', type: 'image' },
  { id: 'v-8', name: 'Obsidian Void Persona', url: '/assets/filmstrip/thumb_08.jpg', type: 'image' },
  { id: 'v-9', name: 'Cyberpunk Skyline', url: '/assets/filmstrip/thumb_09.jpg', type: 'image' },
];

export const OmniViralMockupStudio: React.FC<OmniViralMockupStudioProps> = ({ onSaveToVault }) => {
  // Platform selection (Zone 2)
  const [selectedPlatform, setSelectedPlatform] = useState<MockupPlatform>('TikTok');

  // Input Tray States (Zone 3)
  const [creatorHandle, setCreatorHandle] = useState<string>('@darkmisfit');
  const [caption, setCaption] = useState<string>('When the beat drops in OmniBeat ⚡ Pure nocturnal frequency.');
  const [hashtags, setHashtags] = useState<string>('#OmniAI #DarkMisfit #Cyberpunk #ViralHook');
  const [audioLabel, setAudioLabel] = useState<string>('OmniVoice Studio - DarkMisfit Original Audio');

  // Active loaded media in Zone 1
  const [previewMedia, setPreviewMedia] = useState<string>(DEFAULT_VAULT_THUMBNAILS[0].url);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Platform badges configuration with the 5 Cyber Accents
  const PLATFORMS: { name: MockupPlatform; accent: string; borderClass: string; badgeText: string }[] = [
    { name: 'TikTok', accent: '#00ff99', borderClass: 'border-[#00ff99] text-[#00ff99]', badgeText: '9:16 Feed' },
    { name: 'Instagram Reels', accent: '#ff007f', borderClass: 'border-[#ff007f] text-[#ff007f]', badgeText: 'Reels Tab' },
    { name: 'YouTube Shorts', accent: '#00e5ff', borderClass: 'border-[#00e5ff] text-[#00e5ff]', badgeText: 'Shorts Shelf' },
    { name: 'App Store', accent: '#8b5cf6', borderClass: 'border-[#8b5cf6] text-[#8b5cf6]', badgeText: 'Preview Card' },
    { name: 'Spotify Canvas', accent: '#a78bfa', borderClass: 'border-[#a78bfa] text-[#a78bfa]', badgeText: 'Loop Canvas' },
  ];

  const handlePushToVault = () => {
    if (onSaveToVault) {
      onSaveToVault({
        type: 'mockup',
        title: `Viral Mockup (${selectedPlatform}) - ${creatorHandle}`,
        thumbnail: previewMedia,
        tags: ['Viral Mockup Studio', selectedPlatform, 'Safe Zone Guarded', creatorHandle],
        details: `${caption} ${hashtags}`,
      });
      setToastMessage(`Saved ${selectedPlatform} mockup to Omni Vault!`);
      setTimeout(() => setToastMessage(null), 2500);
    }
  };

  const handleSwapVaultAsset = (asset: VaultQuickAsset) => {
    setPreviewMedia(asset.url);
    setToastMessage(`Swapped viewport asset: ${asset.name}`);
    setTimeout(() => setToastMessage(null), 2000);
  };

  return (
    <div 
      className="w-full max-w-[420px] h-full mx-auto overflow-hidden relative flex flex-col justify-between bg-black text-[#e8e6f2] font-sans select-none border-x border-[#181524]"
      style={{ boxSizing: 'border-box' }}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 z-50 px-3 py-1.5 rounded-full bg-[#08060c]/95 border border-[#00e5ff]/60 text-[#00e5ff] text-[10.5px] font-mono shadow-2xl backdrop-blur-md animate-in fade-in flex items-center gap-1.5 max-w-[90%] truncate">
          <Sparkles className="w-3 h-3 text-[#00e5ff] shrink-0" />
          <span className="truncate">{toastMessage}</span>
        </div>
      )}

      {/* COMPACT TOP HEADER */}
      <div className="h-10 px-3 bg-[#08060c] border-b border-[#181524] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Smartphone className="w-3.5 h-3.5 text-[#00ff99]" />
          <h1 className="font-bold text-[11px] tracking-wider uppercase text-white font-mono">
            Viral Mockup Studio
          </h1>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-[8px] font-mono px-1.5 py-0.5 rounded-full bg-red-950/60 text-red-400 border border-red-600/40">
            Safe Zones Active
          </span>
          <button
            onClick={handlePushToVault}
            className="px-2 py-0.5 rounded-md bg-[#00e5ff] text-slate-950 font-bold text-[9px] font-mono flex items-center gap-1 active:scale-95 transition hover:brightness-110"
            title="Push Mockup to Vault"
          >
            <FolderLock className="w-2.5 h-2.5" />
            <span>Vault</span>
          </button>
        </div>
      </div>

      {/* ZONE 1 (Top 55% Height): Vertical 9:16 smartphone preview canvas overlayed with translucent crimson safe zone boundaries */}
      <div className="h-[55%] min-h-[300px] bg-black relative flex items-center justify-center p-2 overflow-hidden border-b border-[#181524]">
        
        {/* Smartphone Device 9:16 Canvas Frame */}
        <div className="relative w-[190px] h-[338px] xs:w-[210px] xs:h-[373px] rounded-[28px] bg-[#000000] border-2 border-[#181524] shadow-[0_0_30px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col justify-between">
          
          {/* Dynamic Island Notch */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-3 bg-black rounded-full z-40 border border-zinc-900 flex items-center justify-center pointer-events-none">
            <div className="w-1.5 h-1.5 rounded-full bg-[#181524] mr-2" />
            <div className="w-1 h-1 rounded-full bg-[#00e5ff]/40" />
          </div>

          {/* Background Mockup Media Canvas */}
          <div className="absolute inset-0 z-0">
            <img 
              src={previewMedia} 
              alt="Mockup viewport media"
              className="w-full h-full object-cover" 
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/90" />
          </div>

          {/* PERMANENT TRANSLUCENT CRIMSON SAFE ZONE BOUNDARY OVERLAY LINES */}
          <div className="absolute inset-0 z-20 pointer-events-none">
            {/* Top Red Safe Zone: Status Bar & Following/For You Header Boundary */}
            <div className="absolute top-[40px] left-0 right-0 border-b border-dashed border-red-500/80 bg-red-500/10 h-5 flex items-center justify-between px-2 text-[6.5px] font-mono text-red-300 font-bold">
              <span>▲ HEADER SAFE LIMIT</span>
              <span>NO TEXT ZONE</span>
            </div>

            {/* Right Action Rail Red Safe Zone: Likes, Comments, Shares, Bookmarks */}
            <div className="absolute top-[80px] bottom-[85px] right-0 w-10 border-l border-dashed border-red-500/80 bg-red-500/10 flex flex-col items-center justify-center p-0.5 text-[6px] font-mono text-red-300 font-bold text-center leading-tight">
              <span>R</span>
              <span>A</span>
              <span>I</span>
              <span>L</span>
            </div>

            {/* Bottom Feed Caption & Audio Marquee Boundary */}
            <div className="absolute bottom-[16px] left-0 right-0 h-16 border-t border-dashed border-red-500/80 bg-red-500/10 flex flex-col justify-end p-1 text-[6.5px] font-mono text-red-300 font-bold">
              <div className="flex justify-between">
                <span>▼ FEED CAPTION & AUDIO MARQUEE BOUNDARY</span>
                <span>SAFE</span>
              </div>
            </div>
          </div>

          {/* Simulated Platform UI Elements */}
          {/* Top Platform Switcher Indicator */}
          <div className="relative z-30 pt-5 px-3 flex justify-center items-center text-[10px] font-bold text-white drop-shadow">
            <div className="flex gap-2.5 text-[9.5px]">
              <span className="opacity-60 font-mono">Following</span>
              <span className="border-b-2 border-[#00ff99] pb-0.5 font-mono text-white font-bold">For You</span>
            </div>
          </div>

          {/* Right Action Rail */}
          <div className="relative z-30 self-end pr-1.5 flex flex-col items-center gap-2 text-white drop-shadow-md">
            <div className="flex flex-col items-center">
              <div className="w-6 h-6 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 flex items-center justify-center">
                <Heart className="w-3 h-3 text-[#ff007f] fill-[#ff007f]" />
              </div>
              <span className="text-[7.5px] font-mono font-bold mt-0.5">142K</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-6 h-6 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 flex items-center justify-center">
                <MessageCircle className="w-3 h-3 text-[#00e5ff]" />
              </div>
              <span className="text-[7.5px] font-mono font-bold mt-0.5">3.8K</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-6 h-6 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 flex items-center justify-center">
                <Bookmark className="w-3 h-3 text-[#a78bfa] fill-[#a78bfa]" />
              </div>
              <span className="text-[7.5px] font-mono font-bold mt-0.5">18.4K</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-6 h-6 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 flex items-center justify-center">
                <Share2 className="w-3 h-3 text-white" />
              </div>
              <span className="text-[7.5px] font-mono font-bold mt-0.5">Share</span>
            </div>
          </div>

          {/* Bottom Feed Overlay (Handle, Caption, Audio Marquee) */}
          <div className="relative z-30 p-2 text-white space-y-0.5">
            <div className="flex items-center gap-1">
              <span className="text-[9.5px] font-bold font-mono text-white">{creatorHandle}</span>
              <span className="text-[7px] px-1 rounded bg-[#00ff99] text-slate-950 font-bold">PRO</span>
            </div>

            <p className="text-[8.5px] text-zinc-200 line-clamp-2 leading-tight">
              {caption}
            </p>

            <p className="text-[8px] text-[#00e5ff] font-mono truncate">
              {hashtags}
            </p>

            <div className="flex items-center gap-1 text-[7.5px] font-mono text-zinc-300 pt-0.5">
              <Music2 className="w-2.5 h-2.5 text-[#00ff99] animate-spin" />
              <span className="truncate">{audioLabel}</span>
            </div>
          </div>

        </div>
      </div>

      {/* ZONE 2 (Middle 10% Height): Horizontal swiping ribbon of placement config selector badges styled with clean, thin neon borders from our 5-color matrix */}
      <div className="h-[10%] min-h-[44px] px-2 py-1.5 bg-[#08060c] border-b border-[#181524] flex items-center overflow-x-auto gap-2 no-scrollbar">
        {PLATFORMS.map((plat) => {
          const isSelected = selectedPlatform === plat.name;
          return (
            <button
              key={plat.name}
              onClick={() => setSelectedPlatform(plat.name)}
              className={`px-2.5 py-1 rounded-lg font-mono text-[9.5px] font-bold whitespace-nowrap shrink-0 transition active:scale-95 border ${
                isSelected
                  ? `${plat.borderClass} bg-black shadow-[0_0_12px_rgba(0,0,0,0.8)]`
                  : 'border-[#181524] bg-black/70 text-zinc-400 hover:border-zinc-700'
              }`}
              style={{
                borderColor: isSelected ? plat.accent : undefined,
                color: isSelected ? plat.accent : undefined,
                boxShadow: isSelected ? `0 0 10px ${plat.accent}44` : undefined,
              }}
            >
              <span>{plat.name}</span>
              <span className="ml-1 opacity-70 text-[8px]">({plat.badgeText})</span>
            </button>
          );
        })}
      </div>

      {/* ZONE 3 (Bottom 35% Height): Displays creator handle form inputs, captions, hashtags + Quick Swap Vault Assets ribbon */}
      <div className="h-[35%] min-h-[220px] p-2 bg-[#08060c] flex flex-col justify-between overflow-y-auto space-y-1.5">
        
        {/* Creator Handle, Caption & Hashtags Inputs */}
        <div className="space-y-1.5">
          {/* Creator Handle */}
          <div className="flex items-center gap-1.5 bg-black rounded-lg px-2 py-1 border border-[#181524] focus-within:border-[#00ff99] transition">
            <AtSign className="w-3 h-3 text-[#00ff99] shrink-0" />
            <input
              type="text"
              value={creatorHandle}
              onChange={(e) => setCreatorHandle(e.target.value)}
              className="w-full bg-transparent text-[11px] text-white outline-none font-mono"
              placeholder="@handle"
            />
          </div>

          {/* Caption Textarea */}
          <div className="bg-black rounded-lg p-1.5 border border-[#181524] focus-within:border-[#00e5ff] transition">
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              rows={2}
              className="w-full bg-transparent text-[11px] text-white outline-none font-sans resize-none"
              placeholder="Caption text (guaranteed safe zone margins)..."
            />
          </div>

          {/* Hashtags Input */}
          <div className="flex items-center gap-1.5 bg-black rounded-lg px-2 py-1 border border-[#181524] focus-within:border-[#8b5cf6] transition">
            <Hash className="w-3 h-3 text-[#8b5cf6] shrink-0" />
            <input
              type="text"
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
              className="w-full bg-transparent text-[11px] text-[#a78bfa] outline-none font-mono"
              placeholder="#hashtags"
            />
          </div>
        </div>

        {/* QUICK SWAP VAULT ASSETS RIBBON: Exactly specified:
            w-full h-[65px] flex items-center gap-2 overflow-x-auto whitespace-nowrap p-1 bg-[#08060c] rounded-lg border border-zinc-900 scrollbar-hide
            with square vault thumbnails (w-11 h-11 rounded object-cover border border-zinc-800 cursor-pointer hover:border-[#00e5ff]) */}
        <div className="pt-1">
          <div className="flex items-center justify-between text-[9px] font-mono text-zinc-400 px-1 mb-1">
            <span className="uppercase tracking-wider font-bold text-zinc-300">Quick Swap Vault Assets:</span>
            <span className="text-[#00e5ff] text-[8.5px]">Tap to load into 9:16</span>
          </div>

          <div className="w-full h-[65px] flex items-center gap-2 overflow-x-auto whitespace-nowrap p-1 bg-[#08060c] rounded-lg border border-zinc-900 scrollbar-hide">
            {DEFAULT_VAULT_THUMBNAILS.map((asset) => {
              const isCurrent = previewMedia === asset.url;
              return (
                <div
                  key={asset.id}
                  onClick={() => handleSwapVaultAsset(asset)}
                  className={`relative shrink-0 group ${isCurrent ? 'ring-2 ring-[#00e5ff]' : ''}`}
                  title={`Load ${asset.name} into simulator canvas`}
                >
                  <img
                    src={asset.url}
                    alt={asset.name}
                    className="w-11 h-11 rounded object-cover border border-zinc-800 cursor-pointer hover:border-[#00e5ff] transition"
                  />
                  {isCurrent && (
                    <div className="absolute inset-0 bg-[#00e5ff]/25 rounded flex items-center justify-center pointer-events-none">
                      <Check className="w-3.5 h-3.5 text-white drop-shadow" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
