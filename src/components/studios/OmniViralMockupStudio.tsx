import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
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
  Check,
  AlertTriangle,
  Rotate3d,
  RefreshCw,
  Eye,
  EyeOff,
  Volume2,
  ThumbsUp,
  ThumbsDown,
  Repeat,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Star,
  Download,
  Upload,
  Plus,
  ShieldCheck,
  ShieldAlert,
  ChevronLeft,
  X
} from 'lucide-react';
import { triggerTactileHaptic } from '../../lib/hapticFeedback';

export type MockupPlatform = 'TikTok' | 'Instagram Reels' | 'YouTube Shorts' | 'Spotify Canvas' | 'Apple App Store';

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

const POPULAR_HASHTAG_BANK = [
  '#OmniAI',
  '#ViralHook',
  '#Cyberpunk',
  '#MobileAI',
  '#TechStack',
  '#BuildInPublic',
  '#NextGen',
  '#AIOS',
  '#HighTech',
];

interface OmniViralMockupStudioProps {
  onSaveToVault?: (asset: any) => void;
}

export const OmniViralMockupStudio: React.FC<OmniViralMockupStudioProps> = ({ onSaveToVault }) => {
  // Step 2: Platform Selection
  const [selectedPlatform, setSelectedPlatform] = useState<MockupPlatform>('TikTok');

  // Step 2: Active Placement Configurator Metadata
  const [creatorHandle, setCreatorHandle] = useState<string>('@omniai');
  const [caption, setCaption] = useState<string>('When the beat drops in OmniBeat ⚡ Pure obsidian frequency.');
  const [hashtags, setHashtags] = useState<string>('#OmniAI #Cyberpunk #ViralHook');
  const [audioLabel, setAudioLabel] = useState<string>('OmniVoice Studio - OmniAI Original Audio');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  // Step 1: Active Loaded Media & Global Vault thumbnails
  const [previewMedia, setPreviewMedia] = useState<string>(DEFAULT_VAULT_THUMBNAILS[0].url);
  const [vaultAssets, setVaultAssets] = useState<VaultQuickAsset[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('omni_vault_assets');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const mapped: VaultQuickAsset[] = parsed.map((a: any, idx: number) => ({
              id: a.id || `vault-${idx}`,
              name: a.title || `Asset ${idx + 1}`,
              url: a.thumbnail || a.url || DEFAULT_VAULT_THUMBNAILS[0].url,
              type: (a.type === 'video' ? 'video' : 'image') as 'image' | 'video',
            }));
            return [...mapped, ...DEFAULT_VAULT_THUMBNAILS];
          }
        }
      } catch {}
    }
    return DEFAULT_VAULT_THUMBNAILS;
  });

  // Step 1: 3D Orbit Mechanic State
  const [rotX, setRotX] = useState<number>(-5);
  const [rotY, setRotY] = useState<number>(10);
  const [isDraggingOrbit, setIsDraggingOrbit] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number; startRotX: number; startRotY: number }>({
    x: 0,
    y: 0,
    startRotX: -5,
    startRotY: 10,
  });

  // Step 3: Safe-Zone Guard Engine State
  const [showSafeZones, setShowSafeZones] = useState<boolean>(true);
  const [hazardWarning, setHazardWarning] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Platform rule constraints
  const platformRules = useMemo(() => {
    switch (selectedPlatform) {
      case 'TikTok':
        return { maxChars: 2200, accent: '#00ffcc', badgeText: '9:16 Feed', descLabel: 'Video Caption' };
      case 'Instagram Reels':
        return { maxChars: 2200, accent: '#ff007f', badgeText: 'Reels Tab', descLabel: 'Reel Caption' };
      case 'YouTube Shorts':
        return { maxChars: 100, accent: '#00e5ff', badgeText: 'Shorts Shelf', descLabel: 'Short Title' };
      case 'Spotify Canvas':
        return { maxChars: 80, accent: '#1db954', badgeText: 'Loop Canvas', descLabel: 'Track & Artist' };
      case 'Apple App Store':
        return { maxChars: 4000, accent: '#007aff', badgeText: 'App Card', descLabel: 'Promo Description' };
    }
  }, [selectedPlatform]);

  const triggerHaptic = (ms: number | number[] = 10) => {
    try {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        if (localStorage.getItem('omni_haptic_enabled') !== 'false') {
          navigator.vibrate(ms);
        }
      }
    } catch {}
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // =========================================================================
  // STEP 3: DYNAMIC SAFE-ZONE REPORT ENGINE & HAZARD CALCULATION
  // =========================================================================
  const safeZoneReport = useMemo(() => {
    const isCaptionOverflow = caption.length > (selectedPlatform === 'YouTube Shorts' ? 90 : 250);
    const isLineCountHigh = caption.split('\n').length > 3;

    // Boundary metrics:
    // Upper 12%: Profile & Title
    // Lower 22%: Buttons & Caption
    // Left 8%: Margin barrier
    // Right 18%: Touch interaction lane
    const topSafe = true;
    const bottomSafe = !isCaptionOverflow && !isLineCountHigh;
    const leftSafe = true;
    const rightSafe = true;
    const hasHazard = !bottomSafe;

    return {
      topSafe,
      bottomSafe,
      leftSafe,
      rightSafe,
      hasHazard,
      captionOverflow: isCaptionOverflow,
      lineOverflow: isLineCountHigh,
      status: hasHazard ? 'Critical Element Blocked' : 'All Safe Zones Clear',
    };
  }, [caption, selectedPlatform]);

  // Trigger hazard warning toast when safe zones are violated
  useEffect(() => {
    if (safeZoneReport.hasHazard && showSafeZones) {
      setHazardWarning('[Warning: Critical Element Blocked by Social Overlay]');
      triggerHaptic([15, 25, 15]);
      const timer = setTimeout(() => setHazardWarning(null), 4000);
      return () => clearTimeout(timer);
    } else {
      setHazardWarning(null);
    }
  }, [safeZoneReport.hasHazard, showSafeZones]);

  // =========================================================================
  // STEP 1: 3D ORBIT POINTER LISTENERS
  // =========================================================================
  const handlePointerDown = (clientX: number, clientY: number) => {
    setIsDraggingOrbit(true);
    dragStartRef.current = {
      x: clientX,
      y: clientY,
      startRotX: rotX,
      startRotY: rotY,
    };
  };

  const handlePointerMove = (clientX: number, clientY: number) => {
    if (!isDraggingOrbit) return;
    const deltaX = clientX - dragStartRef.current.x;
    const deltaY = clientY - dragStartRef.current.y;

    // Sensitivity damping
    const nextRotY = Math.min(45, Math.max(-45, dragStartRef.current.startRotY + deltaX * 0.35));
    const nextRotX = Math.min(35, Math.max(-35, dragStartRef.current.startRotX - deltaY * 0.35));

    setRotY(Math.round(nextRotY));
    setRotX(Math.round(nextRotX));
  };

  const handlePointerUp = () => {
    if (isDraggingOrbit) {
      setIsDraggingOrbit(false);
      triggerHaptic(6);
    }
  };

  const handleResetOrbit = () => {
    triggerHaptic(12);
    setRotX(0);
    setRotY(0);
    showToast('Reset 3D Viewport to 0° Angle');
  };

  // =========================================================================
  // STEP 1: DRAG & DROP / ASSET SWAP HOOKS
  // =========================================================================
  const handleSelectAsset = (asset: VaultQuickAsset) => {
    triggerHaptic(10);
    setPreviewMedia(asset.url);
    showToast(`Loaded "${asset.name}" into 3D Viewport`);
  };

  const handleDropOnPhone = (e: React.DragEvent) => {
    e.preventDefault();
    triggerHaptic(14);
    const droppedUrl = e.dataTransfer.getData('text/plain');
    if (droppedUrl) {
      setPreviewMedia(droppedUrl);
      showToast('Asset dropped into 3D phone viewport!');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const newAsset: VaultQuickAsset = {
        id: `upload-${Date.now()}`,
        name: file.name.slice(0, 20),
        url,
        type: file.type.startsWith('video') ? 'video' : 'image',
      };
      setVaultAssets((prev) => [newAsset, ...prev]);
      setPreviewMedia(url);
      triggerHaptic(16);
      showToast(`Uploaded custom media: ${file.name}`);
    }
  };

  // Hashtag toggle
  const handleToggleHashtag = (tag: string) => {
    triggerHaptic(8);
    const currentTags = hashtags.split(/\s+/).filter(Boolean);
    if (currentTags.includes(tag)) {
      setHashtags(currentTags.filter((t) => t !== tag).join(' '));
    } else {
      setHashtags([...currentTags, tag].join(' '));
    }
  };

  // =========================================================================
  // STEP 4: ACTION MECHANICS & VAULT DISPATCH
  // =========================================================================
  const handlePushToVault = () => {
    triggerHaptic([20, 25, 20]);
    const payload = {
      id: `mockup-${Date.now()}`,
      type: 'mockup',
      title: `Viral Mockup [${selectedPlatform}] - ${creatorHandle}`,
      platform: selectedPlatform,
      thumbnail: previewMedia,
      creatorHandle,
      caption,
      hashtags,
      audioLabel,
      safeZoneReport: {
        topSafe: safeZoneReport.topSafe,
        bottomSafe: safeZoneReport.bottomSafe,
        leftSafe: safeZoneReport.leftSafe,
        rightSafe: safeZoneReport.rightSafe,
        status: safeZoneReport.status,
        timestamp: new Date().toISOString(),
      },
      orbitAngle: { pitch: rotX, yaw: rotY },
      timestamp: Date.now(),
      tags: ['Viral Mockup Studio', selectedPlatform, 'Safe Zone Guarded', creatorHandle],
      details: `${caption} ${hashtags} | Audio: ${audioLabel}`,
    };

    if (onSaveToVault) {
      onSaveToVault(payload);
    }

    if (typeof window !== 'undefined') {
      try {
        const stored = JSON.parse(localStorage.getItem('omni_vault_assets') || '[]');
        localStorage.setItem('omni_vault_assets', JSON.stringify([payload, ...stored]));
      } catch {}
    }

    showToast(`[Mockup Dispatched: Saved ${selectedPlatform} to OmniAI Vault]`);
  };

  const PLATFORMS_LIST: MockupPlatform[] = [
    'TikTok',
    'Instagram Reels',
    'YouTube Shorts',
    'Spotify Canvas',
    'Apple App Store',
  ];

  return (
    <div className="w-full h-full flex flex-col bg-[#000000] text-[#e8e6f2] font-sans select-none overflow-hidden relative">
      
      {/* Toast Alert Message */}
      {toastMessage && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 z-50 px-3.5 py-1.5 rounded-full bg-[#100d23]/95 border border-[#00ffcc] text-[#00ffcc] text-xs font-mono shadow-[0_0_20px_rgba(0,255,204,0.35)] backdrop-blur-md animate-in fade-in flex items-center gap-2 max-w-[92%] truncate">
          <Sparkles className="w-3.5 h-3.5 text-[#00ffcc] shrink-0" />
          <span className="truncate font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Real-time Hazard Alert Warning Banner */}
      {hazardWarning && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 px-3.5 py-1.5 rounded-xl bg-red-950/95 border border-red-500 text-red-200 text-xs font-mono shadow-[0_0_25px_rgba(239,68,68,0.5)] backdrop-blur-md animate-bounce flex items-center gap-2 max-w-[92%]">
          <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
          <span className="truncate font-bold text-[11px]">{hazardWarning}</span>
          <button 
            type="button" 
            onClick={() => setHazardWarning(null)}
            className="text-red-400 hover:text-white p-0.5 ml-1"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* COMPACT TOP HEADER */}
      <div className="h-11 px-3 bg-[#100d23] border-b border-[#2a2254] flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-[#00ffcc]" />
          <div>
            <h1 className="font-bold text-xs tracking-wider uppercase text-white font-mono flex items-center gap-1.5">
              <span>Viral Mockup Studio</span>
              <span className="text-[8.5px] px-1.5 py-0.2 rounded font-bold bg-[#00ffcc]/20 text-[#00ffcc] border border-[#00ffcc]/40">
                SANDBOX
              </span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Safe Zones On/Off Toggle Button */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic(10);
              setShowSafeZones(!showSafeZones);
              showToast(showSafeZones ? 'Platform Safe Zones: OFF' : 'Platform Safe Zones: ON (Crimson Grid)');
            }}
            className={`px-2 py-1 rounded-lg text-[9.5px] font-mono font-bold flex items-center gap-1 border transition ${
              showSafeZones
                ? 'bg-red-950/60 text-red-300 border-red-500 shadow-[0_0_8px_rgba(239,68,68,0.3)]'
                : 'bg-[#181333] text-[#948eb5] border-[#2a2254] hover:text-white'
            }`}
            title="Toggle Live Platform Safe-Zones"
          >
            {showSafeZones ? <Eye className="w-3 h-3 text-red-400" /> : <EyeOff className="w-3 h-3" />}
            <span>Safe Zones: {showSafeZones ? 'ON' : 'OFF'}</span>
          </button>

          {/* Quick Dispatch to Vault Button */}
          <button
            type="button"
            onClick={handlePushToVault}
            className="px-2.5 py-1 rounded-lg bg-[#00ffcc] hover:bg-[#33ffdd] text-black font-extrabold text-[10px] font-mono flex items-center gap-1 shadow-[0_0_12px_rgba(0,255,204,0.35)] active:scale-95 transition"
            title="Push Mockup to Vault"
          >
            <FolderLock className="w-3 h-3" />
            <span>Vault</span>
          </button>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* STEP 1: INTERACTIVE 3D VIEWPORT DECK (TOP 50% HEIGHT)                   */}
      {/* ======================================================================= */}
      <div 
        className="h-[46%] min-h-[280px] bg-gradient-to-b from-[#080612] via-[#000000] to-[#0b0918] relative flex flex-col items-center justify-center p-2 overflow-hidden border-b border-[#2a2254] touch-none"
        onMouseDown={(e) => handlePointerDown(e.clientX, e.clientY)}
        onMouseMove={(e) => handlePointerMove(e.clientX, e.clientY)}
        onMouseUp={handlePointerUp}
        onTouchStart={(e) => {
          const t = e.touches[0];
          handlePointerDown(t.clientX, t.clientY);
        }}
        onTouchMove={(e) => {
          const t = e.touches[0];
          handlePointerMove(t.clientX, t.clientY);
        }}
        onTouchEnd={handlePointerUp}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDropOnPhone}
      >
        {/* Orbital Mechanics Control HUD (Angle Readout & Reset) */}
        <div className="absolute top-2 left-2 right-2 z-40 flex items-center justify-between pointer-events-auto">
          <div className="px-2 py-0.5 rounded-md bg-[#100d23]/80 border border-[#2a2254] text-[9px] font-mono text-[#948eb5] flex items-center gap-1.5 backdrop-blur-sm">
            <Rotate3d className="w-3 h-3 text-[#00ffcc]" />
            <span>Orbit: Pitch <b className="text-white">{rotX}°</b> | Yaw <b className="text-white">{rotY}°</b></span>
            {isDraggingOrbit && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#00ffcc] animate-ping" />
            )}
          </div>

          <button
            type="button"
            onClick={handleResetOrbit}
            className="px-2 py-0.5 rounded-md bg-[#100d23]/80 hover:bg-[#181333] border border-[#2a2254] hover:border-[#00ffcc]/50 text-[#00ffcc] text-[9px] font-mono flex items-center gap-1 backdrop-blur-sm transition"
            title="Reset 3D Orbit Viewport"
          >
            <RefreshCw className="w-2.5 h-2.5" />
            <span>Reset 0°</span>
          </button>
        </div>

        {/* 3D Phone Chassis Container */}
        <div 
          className="relative transition-transform duration-75 ease-out"
          style={{
            transform: `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(0.96, 0.96, 0.96)`,
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Smartphone Device 9:16 Frame */}
          <div className="relative w-[205px] h-[360px] xs:w-[220px] xs:h-[385px] rounded-[32px] bg-[#000000] border-4 border-[#1a1630] shadow-[0_20px_50px_rgba(0,0,0,0.9),0_0_20px_rgba(42,34,84,0.4)] overflow-hidden flex flex-col justify-between">
            
            {/* Dynamic Island Notch */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-16 h-3 bg-black rounded-full z-40 border border-zinc-800 flex items-center justify-center pointer-events-none shadow-md">
              <div className="w-1.5 h-1.5 rounded-full bg-[#181524] mr-2" />
              <div className="w-1 h-1 rounded-full bg-[#00ffcc]/50" />
            </div>

            {/* Background Media Canvas */}
            <div className="absolute inset-0 z-0">
              <img 
                src={previewMedia} 
                alt="3D Mockup Canvas"
                className="w-full h-full object-cover" 
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/90 pointer-events-none" />
            </div>

            {/* ================================================================= */}
            {/* STEP 3: LIVE SAFE-ZONE GUARD REPORT OVERLAY GRID                   */}
            {/* ================================================================= */}
            {showSafeZones && (
              <div className="absolute inset-0 z-20 pointer-events-none">
                {/* Upper 12% Region: Top Safe Limit Boundary */}
                <div className={`absolute top-0 left-0 right-0 h-[12%] border-b border-dashed ${safeZoneReport.topSafe ? 'border-red-500/80 bg-red-500/10' : 'border-red-500 bg-red-500/25 animate-pulse'} flex items-end justify-between px-2 pb-0.5 text-[6.5px] font-mono text-red-300 font-bold`}>
                  <span>▲ 12% HEADER SAFE</span>
                  <span>NO LOGO/AVATAR ZONE</span>
                </div>

                {/* Right 18% Lane: Action Rail Boundary */}
                <div className="absolute top-[12%] bottom-[22%] right-0 w-[18%] border-l border-dashed border-red-500/80 bg-red-500/10 flex flex-col items-center justify-center text-[6px] font-mono text-red-300 font-bold text-center leading-tight">
                  <span>18%</span>
                  <span>R</span>
                  <span>A</span>
                  <span>I</span>
                  <span>L</span>
                </div>

                {/* Left 8% Margin Area */}
                <div className="absolute top-[12%] bottom-[22%] left-0 w-[8%] border-r border-dashed border-red-500/80 bg-red-500/10 flex items-center justify-center text-[5.5px] font-mono text-red-300 font-bold">
                  <span>8%</span>
                </div>

                {/* Lower 22% Region: Caption & Buttons Boundary */}
                <div className={`absolute bottom-0 left-0 right-0 h-[22%] border-t border-dashed ${safeZoneReport.bottomSafe ? 'border-red-500/80 bg-red-500/10' : 'border-red-500 bg-red-500/30 animate-pulse'} flex flex-col justify-between p-1 text-[6.5px] font-mono text-red-300 font-bold`}>
                  <div className="flex justify-between">
                    <span>▼ 22% FEED SAFE LIMIT</span>
                    <span>{safeZoneReport.bottomSafe ? 'PASS' : 'WARN OVERFLOW'}</span>
                  </div>
                  <span className="text-[5.5px] text-red-400">TOUCH ACTION & CAPTION MARGIN</span>
                </div>
              </div>
            )}

            {/* ================================================================= */}
            {/* STEP 2: NATIVE PLATFORM OVERLAY GRAPHICS                         */}
            {/* ================================================================= */}

            {/* --- 1. TIKTOK OVERLAY --- */}
            {selectedPlatform === 'TikTok' && (
              <>
                {/* Top Following / For You Tabs */}
                <div className="relative z-30 pt-5 px-3 flex justify-center items-center text-[10px] font-bold text-white drop-shadow">
                  <div className="flex gap-2.5 text-[9.5px]">
                    <span className="opacity-60 font-mono">Following</span>
                    <span className="border-b-2 border-[#00ffcc] pb-0.5 font-mono text-white font-bold">For You</span>
                  </div>
                </div>

                {/* Right Action Rail */}
                <div className="relative z-30 self-end pr-1.5 flex flex-col items-center gap-2 text-white drop-shadow-md">
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-black/60 border border-white/20 flex items-center justify-center">
                      <Heart className="w-3 h-3 text-[#ff007f] fill-[#ff007f]" />
                    </div>
                    <span className="text-[7.5px] font-mono font-bold mt-0.5">142K</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-black/60 border border-white/20 flex items-center justify-center">
                      <MessageCircle className="w-3 h-3 text-[#00ffcc]" />
                    </div>
                    <span className="text-[7.5px] font-mono font-bold mt-0.5">3.8K</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-black/60 border border-white/20 flex items-center justify-center">
                      <Bookmark className="w-3 h-3 text-[#a78bfa] fill-[#a78bfa]" />
                    </div>
                    <span className="text-[7.5px] font-mono font-bold mt-0.5">18.4K</span>
                  </div>

                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-black/60 border border-white/20 flex items-center justify-center">
                      <Share2 className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-[7.5px] font-mono font-bold mt-0.5">Share</span>
                  </div>

                  {/* Spinning Vinyl Record */}
                  <div className="w-6 h-6 rounded-full bg-zinc-950 border border-zinc-700 flex items-center justify-center animate-spin">
                    <Music2 className="w-3 h-3 text-[#00ffcc]" />
                  </div>
                </div>

                {/* Bottom Feed Overlay */}
                <div className="relative z-30 p-2.5 text-white space-y-0.5">
                  <div className="flex items-center gap-1">
                    <span className="text-[9.5px] font-bold font-mono text-white">{creatorHandle}</span>
                    <span className="text-[7px] px-1 rounded bg-[#00ffcc] text-black font-bold">PRO</span>
                  </div>

                  <p className="text-[8.5px] text-zinc-200 line-clamp-2 leading-tight">
                    {caption}
                  </p>

                  <p className="text-[8px] text-[#00ffcc] font-mono truncate">
                    {hashtags}
                  </p>

                  <div className="flex items-center gap-1 text-[7.5px] font-mono text-zinc-300 pt-0.5">
                    <Music2 className="w-2.5 h-2.5 text-[#00ffcc] animate-spin" />
                    <span className="truncate">{audioLabel}</span>
                  </div>
                </div>
              </>
            )}

            {/* --- 2. INSTAGRAM REELS OVERLAY --- */}
            {selectedPlatform === 'Instagram Reels' && (
              <>
                <div className="relative z-30 pt-5 px-3 flex justify-between items-center text-white drop-shadow">
                  <span className="text-xs font-bold font-sans">Reels</span>
                  <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center">
                    <span className="text-[9px]">📷</span>
                  </div>
                </div>

                {/* Right Action Rail */}
                <div className="relative z-30 self-end pr-1.5 flex flex-col items-center gap-2.5 text-white drop-shadow-md">
                  <div className="flex flex-col items-center">
                    <Heart className="w-4 h-4 text-white" />
                    <span className="text-[7.5px] font-mono font-bold mt-0.5">89.4K</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <MessageCircle className="w-4 h-4 text-white" />
                    <span className="text-[7.5px] font-mono font-bold mt-0.5">1.2K</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <Share2 className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-bold leading-none">•••</span>
                  </div>
                </div>

                {/* Bottom Creator Card */}
                <div className="relative z-30 p-2.5 text-white space-y-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-amber-400 to-rose-500 p-0.5">
                      <div className="w-full h-full bg-black rounded-full" />
                    </div>
                    <span className="text-[9px] font-bold">{creatorHandle}</span>
                    <button className="px-1.5 py-0.2 rounded border border-white/60 text-[7.5px] font-bold">
                      Follow
                    </button>
                  </div>
                  <p className="text-[8px] text-zinc-200 line-clamp-2 leading-tight">
                    {caption} <span className="text-[#ff007f]">{hashtags}</span>
                  </p>
                  <div className="flex items-center gap-1 text-[7px] text-zinc-300 font-mono">
                    <Volume2 className="w-2.5 h-2.5 text-white" />
                    <span className="truncate">{audioLabel}</span>
                  </div>
                </div>
              </>
            )}

            {/* --- 3. YOUTUBE SHORTS OVERLAY --- */}
            {selectedPlatform === 'YouTube Shorts' && (
              <>
                <div className="relative z-30 pt-5 px-3 flex justify-between items-center text-white drop-shadow">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded bg-red-600 inline-block" />
                    <span className="text-[9.5px] font-bold font-mono">Shorts</span>
                  </div>
                  <div className="text-[9px] font-bold">•••</div>
                </div>

                {/* Right Action Rail */}
                <div className="relative z-30 self-end pr-1.5 flex flex-col items-center gap-2 text-white drop-shadow-md">
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-black/60 flex items-center justify-center">
                      <ThumbsUp className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-[7px] font-mono font-bold mt-0.5">76K</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-black/60 flex items-center justify-center">
                      <ThumbsDown className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-[7px] font-mono font-bold mt-0.5">Dislike</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-black/60 flex items-center justify-center">
                      <MessageCircle className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-[7px] font-mono font-bold mt-0.5">940</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-black/60 flex items-center justify-center">
                      <Share2 className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-[7px] font-mono font-bold mt-0.5">Share</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-black/60 flex items-center justify-center">
                      <Repeat className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-[7px] font-mono font-bold mt-0.5">Remix</span>
                  </div>
                </div>

                {/* Bottom Profile & Title */}
                <div className="relative z-30 p-2.5 text-white space-y-1">
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-4 rounded-full bg-zinc-700 flex items-center justify-center text-[8px]">
                      ⚡
                    </div>
                    <span className="text-[9px] font-bold truncate max-w-[80px]">{creatorHandle}</span>
                    <button className="px-1.5 py-0.5 rounded-full bg-white text-black font-bold text-[7.5px]">
                      Subscribe
                    </button>
                  </div>
                  <p className="text-[8px] font-medium text-white line-clamp-1 leading-tight">
                    {caption}
                  </p>
                  <p className="text-[7.5px] text-[#00e5ff] font-mono truncate">{hashtags}</p>
                </div>
              </>
            )}

            {/* --- 4. SPOTIFY CANVAS OVERLAY --- */}
            {selectedPlatform === 'Spotify Canvas' && (
              <>
                <div className="relative z-30 pt-5 px-3 flex justify-between items-center text-white drop-shadow">
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span className="text-[8.5px] font-bold tracking-wider font-mono uppercase">PLAYING FROM CANVAS</span>
                  <span className="text-xs font-bold leading-none">•••</span>
                </div>

                <div className="relative z-30 flex-1 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-black/50 border border-white/20 flex items-center justify-center backdrop-blur-md">
                    <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                  </div>
                </div>

                {/* Spotify Scrubber & Playback HUD */}
                <div className="relative z-30 p-3 bg-gradient-to-t from-black via-black/80 to-transparent text-white space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold leading-tight truncate max-w-[130px]">Omni Beat Wave</h4>
                      <p className="text-[8.5px] text-zinc-400 font-mono truncate">{creatorHandle} • {audioLabel}</p>
                    </div>
                    <Heart className="w-3.5 h-3.5 text-[#1db954] fill-[#1db954]" />
                  </div>

                  {/* Scrubber bar */}
                  <div className="space-y-0.5">
                    <div className="w-full h-1 bg-zinc-700 rounded-full overflow-hidden">
                      <div className="w-[45%] h-full bg-[#1db954] rounded-full" />
                    </div>
                    <div className="flex justify-between text-[7px] font-mono text-zinc-400">
                      <span>0:48</span>
                      <span>2:58</span>
                    </div>
                  </div>

                  {/* Playback icons */}
                  <div className="flex items-center justify-between px-2 pt-0.5 text-zinc-300">
                    <Shuffle className="w-3 h-3 text-[#1db954]" />
                    <SkipBack className="w-3.5 h-3.5" />
                    <div className="w-7 h-7 rounded-full bg-white text-black flex items-center justify-center">
                      <Pause className="w-3.5 h-3.5 fill-black" />
                    </div>
                    <SkipForward className="w-3.5 h-3.5" />
                    <Repeat className="w-3 h-3 text-zinc-400" />
                  </div>
                </div>
              </>
            )}

            {/* --- 5. APPLE APP STORE OVERLAY --- */}
            {selectedPlatform === 'Apple App Store' && (
              <>
                <div className="relative z-30 pt-5 px-3 flex justify-between items-center text-white drop-shadow">
                  <ChevronLeft className="w-3.5 h-3.5 text-[#007aff]" />
                  <span className="text-[9px] font-bold font-sans">App Preview</span>
                  <Share2 className="w-3 h-3 text-[#007aff]" />
                </div>

                <div className="relative z-30 flex-1 flex flex-col justify-end p-2.5 text-white space-y-1.5">
                  <div className="p-2 rounded-xl bg-black/75 backdrop-blur-md border border-white/20 flex items-center justify-between shadow-xl">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#00ffcc] to-[#007aff] flex items-center justify-center text-black font-extrabold text-xs shadow-md">
                        O
                      </div>
                      <div>
                        <h4 className="text-[10px] font-bold leading-none">OmniAI - Nexus</h4>
                        <span className="text-[7.5px] text-zinc-400 font-mono block mt-0.5">Productivity & OS</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <button className="px-3 py-1 rounded-full bg-[#007aff] hover:bg-[#0062cc] text-white font-extrabold text-[9px] shadow-sm">
                        GET
                      </button>
                      <span className="text-[6px] text-zinc-400 block mt-0.5">In-App Purchases</span>
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-black/75 backdrop-blur-md border border-white/20 text-[8px] font-mono space-y-1">
                    <div className="flex justify-between items-center text-zinc-300">
                      <span className="flex items-center gap-0.5 text-amber-400 font-bold">
                        <Star className="w-2.5 h-2.5 fill-current" /> 4.9 • 12K Ratings
                      </span>
                      <span className="px-1 rounded bg-zinc-800 text-white font-bold">12+</span>
                    </div>
                    <p className="text-zinc-200 line-clamp-2 leading-tight">
                      {caption}
                    </p>
                  </div>
                </div>
              </>
            )}

          </div>
        </div>
      </div>

      {/* ======================================================================= */}
      {/* STEP 2: ACTIVE PLACEMENT CONFIGURATOR DECK (BOTTOM 50% HEIGHT)          */}
      {/* ======================================================================= */}
      <div className="flex-1 min-h-0 bg-[#000000] flex flex-col justify-between overflow-y-auto p-2.5 space-y-2.5">
        
        {/* PLATFORM SELECTION ROW */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] font-mono px-0.5">
            <span className="text-[#948eb5] uppercase font-bold">Platform Overlay Redraw</span>
            <span className="text-[#00ffcc] font-bold">{selectedPlatform}</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
            {PLATFORMS_LIST.map((plat) => {
              const isSelected = selectedPlatform === plat;
              return (
                <button
                  key={plat}
                  type="button"
                  onClick={() => {
                    triggerHaptic(10);
                    setSelectedPlatform(plat);
                    showToast(`Redrawn native overlay: ${plat}`);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold whitespace-nowrap transition-all flex items-center gap-1 shrink-0 ${
                    isSelected
                      ? 'bg-[#181333] text-[#00ffcc] border border-[#00ffcc] shadow-[0_0_10px_rgba(0,255,204,0.3)]'
                      : 'bg-[#100d23] text-[#948eb5] border border-[#2a2254] hover:text-white'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-[#00ffcc] shadow-[0_0_6px_#00ffcc]' : 'bg-zinc-600'}`} />
                  <span>{plat}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* METADATA INPUT FIELDS */}
        <div className="p-2.5 rounded-xl bg-[#100d23] border border-[#2a2254] space-y-2">
          
          {/* Row 1: Creator Handle & Audio Track */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[9.5px] font-mono text-[#948eb5] flex items-center gap-1 mb-1">
                <AtSign className="w-3 h-3 text-[#00ffcc]" />
                <span>Creator Handle:</span>
              </label>
              <input
                type="text"
                value={creatorHandle}
                onChange={(e) => setCreatorHandle(e.target.value)}
                placeholder="@handle"
                className="w-full bg-[#000000] border border-[#2a2254] focus:border-[#00ffcc] rounded-lg px-2.5 py-1 text-xs text-white font-mono outline-none"
              />
            </div>

            <div>
              <label className="text-[9.5px] font-mono text-[#948eb5] flex items-center gap-1 mb-1">
                <Music2 className="w-3 h-3 text-[#00ffcc]" />
                <span>Audio Track Label:</span>
              </label>
              <input
                type="text"
                value={audioLabel}
                onChange={(e) => setAudioLabel(e.target.value)}
                placeholder="Track & Artist"
                className="w-full bg-[#000000] border border-[#2a2254] focus:border-[#00ffcc] rounded-lg px-2.5 py-1 text-xs text-white font-mono outline-none truncate"
              />
            </div>
          </div>

          {/* Row 2: Caption / Description Editor with Auto-Character Counter */}
          <div>
            <div className="flex items-center justify-between text-[9.5px] font-mono text-[#948eb5] mb-1">
              <span>{platformRules.descLabel}:</span>
              <span className={`font-bold ${caption.length > platformRules.maxChars ? 'text-red-400' : 'text-[#00ffcc]'}`}>
                {caption.length} / {platformRules.maxChars} chars
              </span>
            </div>
            <textarea
              rows={2}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Enter social caption..."
              className={`w-full bg-[#000000] border rounded-lg px-2.5 py-1.5 text-xs text-white font-sans outline-none resize-none leading-relaxed ${
                safeZoneReport.hasHazard ? 'border-red-500/80 focus:border-red-400' : 'border-[#2a2254] focus:border-[#00ffcc]'
              }`}
            />
          </div>

          {/* Row 3: Hashtag Injection Bank */}
          <div>
            <div className="flex items-center justify-between text-[9px] font-mono text-[#948eb5] mb-1">
              <span className="flex items-center gap-1">
                <Hash className="w-3 h-3 text-[#00ffcc]" />
                <span>Hashtag Injection Bank (Tap to inject/remove):</span>
              </span>
              <span className="text-[#00ffcc]">Live Tag Sync</span>
            </div>

            <div className="flex flex-wrap gap-1">
              {POPULAR_HASHTAG_BANK.map((tag) => {
                const isActive = hashtags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleToggleHashtag(tag)}
                    className={`px-1.5 py-0.5 rounded text-[9px] font-mono transition ${
                      isActive
                        ? 'bg-[#00ffcc] text-black font-bold shadow-[0_0_8px_rgba(0,255,204,0.3)]'
                        : 'bg-[#181333] text-[#948eb5] hover:text-white border border-[#2a2254]'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* STEP 3: LIVE SAFE-ZONE GUARD DIAGNOSTICS */}
        <div className="p-2 rounded-xl bg-[#100d23] border border-[#2a2254] flex items-center justify-between text-[9.5px] font-mono">
          <div className="flex items-center gap-1.5">
            {safeZoneReport.hasHazard ? (
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0" />
            ) : (
              <ShieldCheck className="w-4 h-4 text-[#00ffcc] shrink-0" />
            )}
            <div>
              <span className="font-bold text-white block">Safe-Zone Diagnostics</span>
              <span className={safeZoneReport.hasHazard ? 'text-red-400' : 'text-[#00ffcc]'}>
                {safeZoneReport.status}
              </span>
            </div>
          </div>

          <div className="flex gap-2 text-right text-[8.5px]">
            <div>
              <span className="text-[#948eb5] block">Top 12%:</span>
              <span className="text-[#00ffcc] font-bold">CLEAR</span>
            </div>
            <div>
              <span className="text-[#948eb5] block">Bot 22%:</span>
              <span className={safeZoneReport.bottomSafe ? 'text-[#00ffcc] font-bold' : 'text-red-400 font-bold'}>
                {safeZoneReport.bottomSafe ? 'CLEAR' : 'OVERLAP'}
              </span>
            </div>
            <div>
              <span className="text-[#948eb5] block">Rail 18%:</span>
              <span className="text-[#00ffcc] font-bold">GUARDED</span>
            </div>
          </div>
        </div>

        {/* STEP 1: HORIZONTAL GLOBAL VAULT THUMBNAIL ASSET BAY */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[9.5px] font-mono px-0.5">
            <span className="text-[#948eb5] uppercase font-bold flex items-center gap-1">
              <FolderLock className="w-3 h-3 text-[#00ffcc]" />
              <span>Global Vault Thumbnail Asset Bay</span>
            </span>
            <div className="flex items-center gap-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-[9px] text-[#00ffcc] hover:underline flex items-center gap-0.5 font-bold"
              >
                <Upload className="w-2.5 h-2.5" />
                <span>Upload Media</span>
              </button>
            </div>
          </div>

          <div className="w-full flex items-center gap-2 overflow-x-auto whitespace-nowrap p-1.5 bg-[#100d23] rounded-xl border border-[#2a2254] no-scrollbar">
            {vaultAssets.map((asset) => {
              const isSelected = previewMedia === asset.url;
              return (
                <div
                  key={asset.id}
                  onClick={() => handleSelectAsset(asset)}
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('text/plain', asset.url);
                  }}
                  className={`relative shrink-0 cursor-pointer rounded-lg overflow-hidden transition-all group ${
                    isSelected
                      ? 'ring-2 ring-[#00ffcc] scale-105 shadow-[0_0_10px_rgba(0,255,204,0.4)]'
                      : 'border border-[#2a2254] hover:border-[#00ffcc]/60 opacity-80 hover:opacity-100'
                  }`}
                  title={`Tap or drag ${asset.name} into 3D phone canvas`}
                >
                  <img
                    src={asset.url}
                    alt={asset.name}
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                  {isSelected && (
                    <div className="absolute inset-0 bg-[#00ffcc]/20 flex items-center justify-center pointer-events-none">
                      <Check className="w-4 h-4 text-white drop-shadow" />
                    </div>
                  )}
                  <span className="absolute bottom-0 inset-x-0 bg-black/80 text-[7px] text-center font-mono text-zinc-300 truncate px-0.5">
                    {asset.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* STEP 4: DISPATCH PUSH BUTTON */}
        <div className="pt-1">
          <button
            type="button"
            onClick={handlePushToVault}
            className="w-full py-2.5 rounded-xl bg-[#00ffcc] hover:bg-[#33ffdd] text-black font-extrabold text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(0,255,204,0.35)] active:scale-95 transition"
          >
            <FolderLock className="w-4 h-4" />
            <span>Push Mockup to Vault Database</span>
          </button>
        </div>

      </div>
    </div>
  );
};
