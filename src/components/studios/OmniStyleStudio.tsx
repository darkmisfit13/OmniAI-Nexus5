import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Sparkles, 
  Upload, 
  Check, 
  User, 
  ShieldCheck, 
  FolderLock, 
  Play, 
  Pause, 
  RotateCcw, 
  Eye, 
  EyeOff, 
  Layers, 
  Zap, 
  Info,
  Maximize2,
  ChevronRight,
  Shirt,
  Scissors,
  Camera
} from 'lucide-react';

export type WardrobeGenre = 'All' | 'Formal' | 'Streetwear' | 'Holo' | 'Vintage';

export type WardrobePresetId = 
  | 'cyberpunk_space' 
  | 'holo_jacket' 
  | 'tactical_streetwear' 
  | 'cargo_anorak'
  | 'midnight_tuxedo'
  | 'haute_velvet'
  | 'distressed_leather'
  | 'retro_bomber'
  | 'custom_closet';

export interface WardrobePreset {
  id: WardrobePresetId;
  label: string;
  subLabel: string;
  genre: 'Formal' | 'Streetwear' | 'Holo' | 'Vintage' | 'All';
  themeDescription: string;
  thumbnail: string;
  filterStyle: string;
  fabricOverlayColor: string;
  shaderEffect: 'reflective-silver' | 'holographic-luminance' | 'matte-black-utility' | 'custom-pattern';
  accentHex: string;
}

export interface ClothingVaultItem {
  id: string;
  name: string;
  category: 'Outerwear' | 'Tops' | 'Techwear' | 'Suits';
  fabric: string;
  colorName: string;
  thumbnail: string;
  filterEffect: string;
}

export interface FacialLandmark {
  id: number;
  x: number;
  y: number;
  z: number;
}

export interface FacialAnchorResult {
  anchorStatus: 'locked' | 'tracking' | 'calibrating';
  landmarkCount: number;
  alignmentScore: number;
  skinToneDelta: number;
  skinToneHex: string;
  landmarks: FacialLandmark[];
  timestamp: number;
}

// Preset Wardrobe Options categorized by genre for fast navigation
export const WARDROBE_PRESETS: WardrobePreset[] = [
  {
    id: 'cyberpunk_space',
    label: 'Cyberpunk Space Suit',
    subLabel: 'Reflective Silver',
    genre: 'Holo',
    themeDescription: 'Applies a high-contrast reflective silver theme with metallic collar and glowing cyan seams.',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&q=80',
    filterStyle: 'contrast(1.35) brightness(1.2) saturate(0.65)',
    fabricOverlayColor: 'rgba(210, 225, 245, 0.35)',
    shaderEffect: 'reflective-silver',
    accentHex: '#d8e6ff',
  },
  {
    id: 'holo_jacket',
    label: 'Holo Jacket',
    subLabel: 'Holographic Glow',
    genre: 'Holo',
    themeDescription: 'Applies a high-luminance holographic jacket filter with iridescent chromatic prism sheen.',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&q=80',
    filterStyle: 'hue-rotate(290deg) saturate(1.8) brightness(1.25) contrast(1.15)',
    fabricOverlayColor: 'rgba(0, 255, 204, 0.4)',
    shaderEffect: 'holographic-luminance',
    accentHex: '#00ffcc',
  },
  {
    id: 'tactical_streetwear',
    label: 'Tactical Streetwear',
    subLabel: 'Matte-Black Utility',
    genre: 'Streetwear',
    themeDescription: 'Triggers a matte-black technical utility hoodie outfit overlay with ballistic nylon textures.',
    thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&q=80',
    filterStyle: 'contrast(1.4) brightness(0.75) grayscale(0.85)',
    fabricOverlayColor: 'rgba(15, 12, 25, 0.65)',
    shaderEffect: 'matte-black-utility',
    accentHex: '#211d34',
  },
  {
    id: 'cargo_anorak',
    label: 'Cargo Anorak',
    subLabel: 'Nocturnal Oversized',
    genre: 'Streetwear',
    themeDescription: 'Urban oversized technical outerwear with taped modular zippers and waterproof seams.',
    thumbnail: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=300&q=80',
    filterStyle: 'contrast(1.25) brightness(0.85) saturate(0.9)',
    fabricOverlayColor: 'rgba(18, 15, 30, 0.5)',
    shaderEffect: 'matte-black-utility',
    accentHex: '#00ffcc',
  },
  {
    id: 'midnight_tuxedo',
    label: 'Midnight Tuxedo',
    subLabel: 'Silk Lapels',
    genre: 'Formal',
    themeDescription: 'Tailored luxury bespoke suit with satin peak lapels and obsidian cufflinks.',
    thumbnail: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=300&q=80',
    filterStyle: 'contrast(1.3) brightness(0.9) saturate(0.8)',
    fabricOverlayColor: 'rgba(10, 8, 20, 0.6)',
    shaderEffect: 'matte-black-utility',
    accentHex: '#e8e6f2',
  },
  {
    id: 'haute_velvet',
    label: 'Haute Velvet Suit',
    subLabel: 'Imperial Violet',
    genre: 'Formal',
    themeDescription: 'Opulent deep violet crushed velvet dinner jacket with champagne gold piping.',
    thumbnail: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=300&q=80',
    filterStyle: 'hue-rotate(240deg) saturate(1.4) contrast(1.2)',
    fabricOverlayColor: 'rgba(108, 99, 255, 0.4)',
    shaderEffect: 'holographic-luminance',
    accentHex: '#6c63ff',
  },
  {
    id: 'distressed_leather',
    label: 'Distressed Biker',
    subLabel: 'Weathered Patina',
    genre: 'Vintage',
    themeDescription: 'Vintage 1980s heavy-grain motorcycle jacket with antiqued brass hardware.',
    thumbnail: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300&q=80',
    filterStyle: 'sepia(0.35) contrast(1.2) brightness(0.95)',
    fabricOverlayColor: 'rgba(40, 25, 20, 0.35)',
    shaderEffect: 'custom-pattern',
    accentHex: '#d97706',
  },
  {
    id: 'retro_bomber',
    label: 'Retro 90s Bomber',
    subLabel: 'Acid Wash Satin',
    genre: 'Vintage',
    themeDescription: 'Authentic 90s two-tone aviation bomber with contrast storm flap and utility sleeve pocket.',
    thumbnail: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&q=80',
    filterStyle: 'saturate(1.25) contrast(1.15) brightness(1.05)',
    fabricOverlayColor: 'rgba(20, 30, 45, 0.3)',
    shaderEffect: 'reflective-silver',
    accentHex: '#38bdf8',
  },
  {
    id: 'custom_closet',
    label: 'Custom Closet upload',
    subLabel: 'User Digital Closet',
    genre: 'All',
    themeDescription: 'Loads your custom wardrobe asset with 100% boundary mapping and realistic fabric draping.',
    thumbnail: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&q=80',
    filterStyle: 'saturate(1.2) contrast(1.1)',
    fabricOverlayColor: 'rgba(19, 16, 36, 0.3)',
    shaderEffect: 'custom-pattern',
    accentHex: '#6c63ff',
  },
];

// Initial Uploaded Clothing Vault assets
export const INITIAL_CLOTHING_VAULT: ClothingVaultItem[] = [
  {
    id: 'vault_item_1',
    name: 'Obsidian Tech Trench',
    category: 'Outerwear',
    fabric: 'Nanoweave Carbon',
    colorName: 'Nocturnal Black',
    thumbnail: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300&q=80',
    filterEffect: 'brightness(0.8) contrast(1.3) grayscale(0.7)',
  },
  {
    id: 'vault_item_2',
    name: 'Liquid Chrome Bomber',
    category: 'Outerwear',
    fabric: 'Metallic Foil',
    colorName: 'Reflective Silver',
    thumbnail: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&q=80',
    filterEffect: 'brightness(1.3) contrast(1.4) saturate(0.6)',
  },
  {
    id: 'vault_item_3',
    name: 'Prismatic Aurora Shell',
    category: 'Techwear',
    fabric: 'Holographic Mylar',
    colorName: 'Iridescent Cyan',
    thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=300&q=80',
    filterEffect: 'hue-rotate(180deg) saturate(1.7) brightness(1.2)',
  },
  {
    id: 'vault_item_4',
    name: 'Matrix Balaclava Hoodie',
    category: 'Tops',
    fabric: 'Ballistic Cotton',
    colorName: 'Matte Shadow',
    thumbnail: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=300&q=80',
    filterEffect: 'contrast(1.5) brightness(0.7)',
  },
  {
    id: 'vault_item_5',
    name: 'Neon Cyber Kimono',
    category: 'Suits',
    fabric: 'Smart LED Silk',
    colorName: 'Electric Emerald',
    thumbnail: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=300&q=80',
    filterEffect: 'hue-rotate(90deg) saturate(1.9)',
  },
  {
    id: 'vault_item_6',
    name: 'Titanium Combat Harness',
    category: 'Techwear',
    fabric: 'Aero Titanium',
    colorName: 'Burnished Steel',
    thumbnail: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&q=80',
    filterEffect: 'contrast(1.6) brightness(1.1) grayscale(0.5)',
  },
];

interface OmniStyleStudioProps {
  onSaveToVault?: (asset: any) => void;
}

export const OmniStyleStudio: React.FC<OmniStyleStudioProps> = ({ onSaveToVault }) => {
  // Active Selected Preset & Vault Item
  const [activePreset, setActivePreset] = useState<WardrobePreset>(WARDROBE_PRESETS[0]);
  const [selectedVaultItem, setSelectedVaultItem] = useState<ClothingVaultItem | null>(null);
  const [clothingVault, setClothingVault] = useState<ClothingVaultItem[]>(INITIAL_CLOTHING_VAULT);
  const [activeCategory, setActiveCategory] = useState<'All' | 'Outerwear' | 'Tops' | 'Techwear' | 'Suits'>('All');
  const [selectedGenre, setSelectedGenre] = useState<WardrobeGenre>('All');
  const [shutterFlash, setShutterFlash] = useState<boolean>(false);

  // Video Player States
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [videoProgress, setVideoProgress] = useState<number>(35); // percentage (0-100)
  const [isFaceAnchorLocked, setIsFaceAnchorLocked] = useState<boolean>(true);
  const [showMeshOverlay, setShowMeshOverlay] = useState<boolean>(true);
  const [isAnimatingTryOn, setIsAnimatingTryOn] = useState<boolean>(false);
  const [animationLoopCycle, setAnimationLoopCycle] = useState<number>(0);
  const [userFacePhotoUrl, setUserFacePhotoUrl] = useState<string>('https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&q=80');

  // Tracking Simulation Anchor State
  const [facialAnchorResult, setFacialAnchorResult] = useState<FacialAnchorResult>(() => {
    return eFacialAnchor('default_user_face', 'outfit_model_video_primary');
  });

  const [notificationBanner, setNotificationBanner] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoElementRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Quick Snapshot: Captures current frame of the animated outfit and automatically saves to local vault
  const handleQuickSnapshot = () => {
    setShutterFlash(true);
    setTimeout(() => setShutterFlash(false), 260);

    const activeName = selectedVaultItem ? selectedVaultItem.name : activePreset.label;
    const timeFormatted = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // Try capturing live video canvas frame if available
    let snapshotThumb = selectedVaultItem ? selectedVaultItem.thumbnail : activePreset.thumbnail;
    if (videoElementRef.current && videoElementRef.current.videoWidth > 0) {
      try {
        const snapCanvas = document.createElement('canvas');
        snapCanvas.width = 400;
        snapCanvas.height = 425;
        const snapCtx = snapCanvas.getContext('2d');
        if (snapCtx) {
          snapCtx.filter = selectedVaultItem ? selectedVaultItem.filterEffect : activePreset.filterStyle;
          snapCtx.drawImage(videoElementRef.current, 0, 0, 400, 425);
          snapshotThumb = snapCanvas.toDataURL('image/jpeg', 0.85);
        }
      } catch {
        // Fallback to active preset thumbnail
      }
    }

    const newStyleAsset = {
      id: `snapshot_${Date.now()}`,
      title: `OmniStyle Snapshot: ${activeName} (${timeFormatted})`,
      type: 'image',
      thumbnail: snapshotThumb,
      tags: ['OmniStyle Studio', 'Quick Snapshot', activePreset.label, selectedGenre],
      details: `Live try-on frame capture with 478-landmark tracking, dynamic fabric movement, and skin-tone blend.`,
      createdAt: new Date().toISOString(),
    };

    if (onSaveToVault) {
      onSaveToVault(newStyleAsset);
    }

    try {
      const existing = JSON.parse(localStorage.getItem('omni_vault_assets') || '[]');
      localStorage.setItem('omni_vault_assets', JSON.stringify([newStyleAsset, ...existing]));
      window.dispatchEvent(new CustomEvent('omni_vault_updated', { detail: { asset: newStyleAsset } }));
    } catch {}

    // Also add as an instantly accessible item in the user's digital clothing vault
    const newVaultItem: ClothingVaultItem = {
      id: newStyleAsset.id,
      name: `Snapshot ${activeName.slice(0, 14)}`,
      category: 'Outerwear',
      fabric: 'Captured Try-On Fabric',
      colorName: activePreset.subLabel,
      thumbnail: snapshotThumb,
      filterEffect: activePreset.filterStyle,
    };
    setClothingVault((prev) => [newVaultItem, ...prev]);

    showNotification('📸 Quick Snapshot captured & saved to local vault!');
  };

  // Execute eFacialAnchor tracking whenever an outfit preset tile is clicked
  const handleSelectPreset = (preset: WardrobePreset) => {
    setActivePreset(preset);
    setSelectedVaultItem(null);

    // If it's custom closet upload, trigger file picker
    if (preset.id === 'custom_closet') {
      fileInputRef.current?.click();
    }

    // Run Facial Anchor Engine simulation
    const result = eFacialAnchor(userFacePhotoUrl, `model_video_${preset.id}`);
    setFacialAnchorResult(result);
    setIsFaceAnchorLocked(true);

    showNotification(`⚡ ${preset.label} anchored! 478 landmarks mapped with skin-tone blend.`);
  };

  const handleSelectVaultItem = (item: ClothingVaultItem) => {
    setSelectedVaultItem(item);
    // Find matching preset or create dynamic custom state
    const result = eFacialAnchor(userFacePhotoUrl, `vault_item_${item.id}`);
    setFacialAnchorResult(result);
    setIsFaceAnchorLocked(true);

    showNotification(`🧥 ${item.name} staged on 3D avatar. Ready to animate!`);
  };

  const handleCustomUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const url = reader.result as string;
        const newItem: ClothingVaultItem = {
          id: `custom_${Date.now()}`,
          name: file.name.replace(/\.[^/.]+$/, '').slice(0, 22),
          category: 'Outerwear',
          fabric: 'User Uploaded Fabric',
          colorName: 'Custom Palette',
          thumbnail: url,
          filterEffect: 'brightness(1.05) contrast(1.15)',
        };
        setClothingVault((prev) => [newItem, ...prev]);
        setSelectedVaultItem(newItem);
        const result = eFacialAnchor(userFacePhotoUrl, url);
        setFacialAnchorResult(result);
        showNotification('✅ Custom wardrobe asset added to your digital closet!');
      };
      reader.readAsDataURL(file);
    }
  };

  const showNotification = (msg: string) => {
    setNotificationBanner(msg);
    setTimeout(() => {
      setNotificationBanner(null);
    }, 3200);
  };

  // Animate Outfit Try-On Action Button
  const handleAnimateOutfitTryOn = () => {
    setIsAnimatingTryOn(true);
    setAnimationLoopCycle((c) => c + 1);

    // Play/Restart video
    if (videoElementRef.current) {
      videoElementRef.current.currentTime = 0;
      videoElementRef.current.play().catch(() => {});
      setIsPlaying(true);
    }

    // Trigger face anchor re-verification
    const result = eFacialAnchor(userFacePhotoUrl, 'active_live_animation_stream');
    setFacialAnchorResult({
      ...result,
      alignmentScore: 99.9,
      anchorStatus: 'locked',
    });

    showNotification('✨ Fabric physics activated! Simulating realistic walking loop with fabric movement.');

    setTimeout(() => {
      setIsAnimatingTryOn(false);
    }, 4500);
  };

  // Toggle Video Play/Pause
  const handleTogglePlay = () => {
    if (videoElementRef.current) {
      if (isPlaying) {
        videoElementRef.current.pause();
        setIsPlaying(false);
      } else {
        videoElementRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  // Save current look to Global Vault
  const handleSaveLookToVault = () => {
    const activeName = selectedVaultItem ? selectedVaultItem.name : activePreset.label;
    const newAsset = {
      id: `omnistyle_${Date.now()}`,
      title: `OmniStyle: ${activeName}`,
      type: 'image',
      thumbnail: selectedVaultItem ? selectedVaultItem.thumbnail : activePreset.thumbnail,
      tags: ['OmniStyle Studio', 'Digital Wardrobe', 'Face-Anchored', activePreset.shaderEffect],
      details: `Interactive outfit simulation for ${activeName} with 478-landmark tracking and fabric movement.`,
      createdAt: new Date().toISOString(),
    };

    if (onSaveToVault) {
      onSaveToVault(newAsset);
    }

    try {
      const existing = JSON.parse(localStorage.getItem('omni_vault_assets') || '[]');
      localStorage.setItem('omni_vault_assets', JSON.stringify([newAsset, ...existing]));
      window.dispatchEvent(new CustomEvent('omni_vault_updated', { detail: { asset: newAsset } }));
    } catch {}

    showNotification('🔒 Outfit look saved directly to OMNI VAULT!');
  };

  // Continuous animation loop for video progress simulation & face tracking drift
  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlaying) {
        setVideoProgress((prev) => {
          const next = prev + 1.2;
          return next > 100 ? 0 : next;
        });
      }
    }, 80);
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Render 478-Landmark Mesh Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!showMeshOverlay || !isFaceAnchorLocked) return;

    const width = canvas.width;
    const height = canvas.height;

    // Center the face region in the upper third of the video container
    const faceCenterX = width * 0.50;
    const faceCenterY = height * 0.36;
    const faceRadiusX = width * 0.16;
    const faceRadiusY = height * 0.15;

    // Draw subtle glowing bounding ellipse
    ctx.beginPath();
    ctx.ellipse(faceCenterX, faceCenterY, faceRadiusX * 1.15, faceRadiusY * 1.25, 0, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0, 255, 204, 0.45)';
    ctx.lineWidth = 1.2;
    ctx.setLineDash([4, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw triangulation mesh connections
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(0, 255, 204, 0.18)';
    ctx.lineWidth = 0.6;

    // Connect concentric points
    for (let r = 0.2; r <= 1.0; r += 0.25) {
      ctx.beginPath();
      ctx.ellipse(faceCenterX, faceCenterY, faceRadiusX * r, faceRadiusY * r, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Connect vertical and diagonal rays
    for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 8) {
      ctx.beginPath();
      ctx.moveTo(faceCenterX, faceCenterY);
      ctx.lineTo(
        faceCenterX + Math.cos(angle) * faceRadiusX * 1.1,
        faceCenterY + Math.sin(angle) * faceRadiusY * 1.15
      );
      ctx.stroke();
    }

    // Render the 478 landmark points
    ctx.fillStyle = '#00ffcc';
    ctx.shadowColor = '#00ffcc';
    ctx.shadowBlur = 4;

    facialAnchorResult.landmarks.slice(0, 240).forEach((pt, i) => {
      // Map normalized landmark point to face coordinates
      const px = faceCenterX + (pt.x - 0.5) * faceRadiusX * 2.1;
      const py = faceCenterY + (pt.y - 0.5) * faceRadiusY * 2.3;

      ctx.beginPath();
      ctx.arc(px, py, i % 6 === 0 ? 1.6 : 0.9, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.shadowBlur = 0;
  }, [showMeshOverlay, isFaceAnchorLocked, facialAnchorResult, videoProgress]);

  const filteredVaultItems = activeCategory === 'All' 
    ? clothingVault 
    : clothingVault.filter((item) => item.category === activeCategory);

  return (
    <div className="w-full flex items-center justify-center p-0 sm:p-2 bg-black font-sans select-none overflow-hidden box-border">
      
      {/* Hidden File Input for Custom Closet Upload */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleCustomUpload}
        accept="image/*"
        className="hidden"
      />

      {/* ========================================================= */}
      {/* RIGID VIEWPORT LAYER: w-full max-w-[400px] h-[850px] mx-auto */}
      {/* ========================================================= */}
      <div 
        className="w-full max-w-[400px] h-[850px] mx-auto overflow-hidden relative flex flex-col justify-between bg-black text-white border-x border-zinc-900 shadow-2xl box-border"
        style={{ boxSizing: 'border-box' }}
      >
        
        {/* ========================================================= */}
        {/* TOP COMPACT TITLE & BRANDING BAR */}
        {/* ========================================================= */}
        <div className="h-11 px-3 bg-[#0b0816] border-b border-zinc-900 flex items-center justify-between shrink-0 z-30 box-border">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#131024] border border-[#00ffcc]/40 flex items-center justify-center text-[#00ffcc] shadow-[0_0_8px_rgba(0,255,204,0.3)]">
              <Shirt className="w-3.5 h-3.5 text-[#00ffcc]" />
            </div>
            <div>
              {/* BRANDING: App Title must read exactly: OmniStyle Studio */}
              <h1 className="text-xs font-black tracking-wider text-white flex items-center gap-1.5 uppercase font-mono">
                OmniStyle Studio
                <span className="w-1.5 h-1.5 rounded-full bg-[#00ffcc] animate-pulse" />
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Save to Vault Action */}
            <button
              onClick={handleSaveLookToVault}
              className="px-2 py-1 rounded bg-[#131024] hover:bg-[#1a1733] border border-zinc-800 hover:border-[#00ffcc]/50 text-[#00ffcc] text-[10px] font-mono flex items-center gap-1 transition active:scale-95"
              title="Save Current Look to OMNI VAULT"
            >
              <FolderLock className="w-3 h-3 text-[#00ffcc]" />
              <span>Save</span>
            </button>
          </div>
        </div>

        {/* Floating Notification Banner */}
        {notificationBanner && (
          <div className="absolute top-12 inset-x-3 z-40 p-2 rounded-lg bg-[#131024]/95 border border-[#00ffcc] text-[#00ffcc] text-[10.5px] font-mono shadow-[0_0_15px_rgba(0,255,204,0.4)] backdrop-blur-md animate-in fade-in slide-in-from-top-2 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 shrink-0 animate-spin" />
            <span className="truncate">{notificationBanner}</span>
          </div>
        )}

        {/* ========================================================= */}
        {/* ZONE 1 (Top 50% - The Interactive Try-On Player)          */}
        {/* ========================================================= */}
        <div 
          className="w-full h-[50%] relative bg-[#0b0816] flex items-center justify-center overflow-hidden border-b border-zinc-900 box-border group"
          style={{ boxSizing: 'border-box' }}
        >
          {/* PRIMARY VIDEO PLAYER / FABRIC SIMULATOR CANVAS */}
          <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-black">
            
            {/* Authentic Video Feed with dynamic fabric filter applied */}
            <video
              ref={videoElementRef}
              src="/assets/aistudio/ScreenRecording_10-22-2026_06-31-59_1_6c948d8f.mp4"
              className="w-full h-full object-cover transition-all duration-500"
              style={{
                filter: selectedVaultItem ? selectedVaultItem.filterEffect : activePreset.filterStyle,
                transform: isAnimatingTryOn ? 'scale(1.04)' : 'scale(1.0)',
              }}
              loop
              muted
              playsInline
              autoPlay
              onError={() => {
                // If local mp4 cannot load, video keeps graceful poster fallback
              }}
            />

            {/* Simulated Model Fallback / Backdrop Image Layer if video pauses or unbuffered */}
            <div 
              className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-30 transition-all duration-700"
              style={{
                backgroundColor: activePreset.fabricOverlayColor,
              }}
            />

            {/* Dynamic Reflective / Holographic Shimmer Effect */}
            {activePreset.shaderEffect === 'reflective-silver' && (
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-60 animate-pulse" />
            )}
            {activePreset.shaderEffect === 'holographic-luminance' && (
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-[#00ffcc]/15 via-[#6c63ff]/20 to-[#00ffcc]/15 mix-blend-color-dodge animate-pulse" />
            )}
            {activePreset.shaderEffect === 'matte-black-utility' && (
              <div className="absolute inset-0 pointer-events-none bg-black/30 mix-blend-multiply" />
            )}

            {/* Camera Shutter Flash Effect */}
            {shutterFlash && (
              <div className="absolute inset-0 bg-white/95 z-50 pointer-events-none transition-opacity duration-200" />
            )}

            {/* 478-Landmark Tracking Point Geometry Grid Overlay Canvas */}
            <canvas
              ref={canvasRef}
              width={400}
              height={425}
              className="absolute inset-0 w-full h-full pointer-events-none z-10"
            />

            {/* Top-Right Corner Controls: Face Anchor & Quick Snapshot */}
            <div className="absolute top-3 right-3 z-30 flex items-center gap-1.5">
              {/* Quick Snapshot Action Button in Try-On Player */}
              <button
                onClick={handleQuickSnapshot}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#131024]/90 border border-[#00ffcc] text-[#00ffcc] shadow-[0_0_12px_rgba(0,255,204,0.4)] backdrop-blur-md active:scale-95 transition cursor-pointer hover:bg-[#1a1630]"
                title="Capture current animated outfit frame and save to Vault"
              >
                <Camera className="w-3.5 h-3.5 text-[#00ffcc]" />
                <span className="text-[10px] font-mono font-bold tracking-tight">Quick Snapshot</span>
              </button>

              {/* Compact Floating Round Bubble Icon labeled 'Face Anchor Locked' using glowing #00ffcc */}
              <button
                onClick={() => {
                  setIsFaceAnchorLocked(!isFaceAnchorLocked);
                  setShowMeshOverlay(!showMeshOverlay);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#131024]/90 border border-[#00ffcc] text-[#00ffcc] shadow-[0_0_12px_rgba(0,255,204,0.45)] backdrop-blur-md active:scale-95 transition cursor-pointer"
                title="Click to toggle 478-point 3D landmark matrix overlay"
              >
                <div className="w-2 h-2 rounded-full bg-[#00ffcc] animate-ping" />
                <span className="text-[10px] font-mono font-bold tracking-tight">
                  {isFaceAnchorLocked ? 'Face Anchor Locked' : 'Anchor Paused'}
                </span>
              </button>
            </div>

            {/* Top-Left Status: Model Fabric Movement & Benchmark Badge */}
            <div className="absolute top-3 left-3 z-30 flex flex-col gap-1">
              <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-black/75 border border-zinc-800 text-[9px] font-mono text-zinc-300 backdrop-blur-md">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00ffcc]" />
                <span>478 Landmarks</span>
                <span className="text-[#00ffcc]">99.8% Match</span>
              </div>
              {isAnimatingTryOn && (
                <div className="px-2 py-0.5 rounded bg-[#00ffcc]/20 border border-[#00ffcc]/60 text-[9px] font-mono text-[#00ffcc] font-bold animate-pulse backdrop-blur-md">
                  🌀 Fabric Movement Active
                </div>
              )}
            </div>

            {/* Center Bottom: Video Play/Pause & Scrub Bar */}
            <div className="absolute bottom-2 inset-x-3 z-20 flex items-center justify-between px-2.5 py-1 rounded-lg bg-[#0b0816]/85 border border-zinc-900/80 backdrop-blur-md text-[10px] font-mono">
              <button
                onClick={handleTogglePlay}
                className="text-zinc-300 hover:text-[#00ffcc] transition flex items-center gap-1"
              >
                {isPlaying ? <Pause className="w-3 h-3 text-[#00ffcc]" /> : <Play className="w-3 h-3 text-[#00ffcc]" />}
                <span>{isPlaying ? 'Pause' : 'Play'} Loop</span>
              </button>

              {/* Scrub Progress Bar */}
              <div className="flex-1 mx-3 h-1 bg-zinc-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#00ffcc] shadow-[0_0_8px_#00ffcc] transition-all duration-100"
                  style={{ width: `${videoProgress}%` }}
                />
              </div>

              <span className="text-zinc-400 text-[9px]">
                {selectedVaultItem ? selectedVaultItem.name : activePreset.label.slice(0, 14)}
              </span>
            </div>

          </div>
        </div>

        {/* ========================================================= */}
        {/* ZONE 2 (Middle 15% - Quick Wardrobe Snap Presets)         */}
        {/* ========================================================= */}
        <div 
          className="w-full h-[15%] flex flex-col justify-between bg-[#131024] border-b border-zinc-900 box-border shrink-0 py-1.5"
          style={{ boxSizing: 'border-box' }}
        >
          {/* Horizontal Filter Chips above the preset row (Formal, Streetwear, Holo, Vintage) */}
          <div className="w-full flex items-center gap-1.5 px-3 overflow-x-auto whitespace-nowrap scrollbar-hide shrink-0 pb-1">
            <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider shrink-0 mr-0.5">Filter:</span>
            {(['All', 'Formal', 'Streetwear', 'Holo', 'Vintage'] as const).map((chip) => (
              <button
                key={chip}
                onClick={() => setSelectedGenre(chip)}
                className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono transition-all active:scale-95 shrink-0 ${
                  selectedGenre === chip
                    ? 'bg-[#00ffcc] text-black font-bold shadow-[0_0_10px_rgba(0,255,204,0.5)]'
                    : 'bg-[#0b0816] text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Single-row horizontal swiping track */}
          <div className="w-full flex-1 flex items-center gap-2.5 px-3 overflow-x-auto whitespace-nowrap scrollbar-hide">
            {(selectedGenre === 'All' 
              ? WARDROBE_PRESETS 
              : WARDROBE_PRESETS.filter((p) => p.genre === selectedGenre || p.id === 'custom_closet')
            ).map((preset) => {
              const isSelected = activePreset.id === preset.id && !selectedVaultItem;
              return (
                <button
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className={`relative flex-shrink-0 w-20 h-16 rounded-xl overflow-hidden border flex flex-col items-center justify-between p-1 transition-all duration-200 active:scale-95 text-left group ${
                    isSelected
                      ? 'border-[#00ffcc] bg-[#0b0816] shadow-[0_0_12px_rgba(0,255,204,0.4)] ring-1 ring-[#00ffcc]'
                      : 'border-zinc-800 bg-black/60 hover:border-zinc-700'
                  }`}
                  title={preset.themeDescription}
                >
                  {/* Thumbnail Image */}
                  <div className="w-full h-9 rounded-md overflow-hidden relative bg-zinc-900">
                    <img
                      src={preset.thumbnail}
                      alt={preset.label}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {isSelected && (
                      <div className="absolute top-1 right-1 w-3 h-3 rounded-full bg-[#00ffcc] flex items-center justify-center text-black">
                        <Check className="w-2 h-2 stroke-[3]" />
                      </div>
                    )}
                    {preset.id === 'custom_closet' && (
                      <div className="absolute inset-0 bg-[#131024]/70 flex items-center justify-center">
                        <Upload className="w-3.5 h-3.5 text-[#00ffcc]" />
                      </div>
                    )}
                  </div>

                  {/* text-[10px] Label */}
                  <span className={`text-[9px] font-mono leading-tight truncate w-full text-center ${
                    isSelected ? 'text-[#00ffcc] font-bold' : 'text-zinc-300'
                  }`}>
                    [{preset.label}]
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================================================= */}
        {/* ZONE 3 (Bottom 35% - Wardrobe Assets & Action Toggles)     */}
        {/* ========================================================= */}
        <div 
          className="w-full h-[35%] bg-black p-3.5 flex flex-col justify-between box-border overflow-hidden shrink-0"
          style={{ boxSizing: 'border-box' }}
        >
          {/* Header Row: Wardrobe Closet Title & Category Filters */}
          <div className="flex items-center justify-between shrink-0 mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-white uppercase font-mono tracking-wider">
                Digital Closet Vault
              </span>
              <span className="text-[9.5px] text-[#00ffcc] font-mono">
                ({clothingVault.length} Items)
              </span>
            </div>

            {/* Quick Category Filters */}
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide text-[9.5px] font-mono">
              {(['All', 'Outerwear', 'Techwear', 'Tops'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-2 py-0.5 rounded-md transition ${
                    activeCategory === cat
                      ? 'bg-[#131024] text-[#00ffcc] border border-[#00ffcc]/40 font-bold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Grid Layout Showing User's Uploaded Clothing Vault */}
          <div className="flex-1 min-h-0 overflow-y-auto grid grid-cols-3 gap-2 pr-0.5 my-1">
            {filteredVaultItems.map((item) => {
              const isSelected = selectedVaultItem?.id === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectVaultItem(item)}
                  className={`relative p-1.5 rounded-lg border text-left flex flex-col justify-between transition-all duration-150 active:scale-95 ${
                    isSelected
                      ? 'bg-[#131024] border-[#00ffcc] shadow-[0_0_10px_rgba(0,255,204,0.35)]'
                      : 'bg-[#0b0816] border-zinc-800/90 hover:border-zinc-700'
                  }`}
                >
                  <div className="w-full h-14 rounded-md overflow-hidden relative bg-zinc-900 mb-1">
                    <img
                      src={item.thumbnail}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-0.5 left-0.5 px-1 rounded bg-black/80 text-[8px] font-mono text-[#00ffcc]">
                      {item.category}
                    </span>
                  </div>

                  <span className="text-[9.5px] font-bold text-zinc-200 truncate w-full block">
                    {item.name}
                  </span>
                  <span className="text-[8.5px] font-mono text-zinc-400 truncate w-full block">
                    {item.fabric}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Large Full-Width Glowing Activation Button Anchored to the Absolute Bottom Margin */}
          <button
            onClick={handleAnimateOutfitTryOn}
            disabled={isAnimatingTryOn}
            className={`w-full py-3 px-4 rounded-xl font-black uppercase text-xs tracking-wider transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 shrink-0 ${
              isAnimatingTryOn
                ? 'bg-[#00ffcc]/80 text-black shadow-[0_0_25px_rgba(0,255,204,0.8)] animate-pulse'
                : 'bg-[#00ffcc] hover:bg-[#00e6b8] text-black shadow-[0_0_20px_rgba(0,255,204,0.6)] hover:shadow-[0_0_30px_rgba(0,255,204,0.9)] cursor-pointer'
            }`}
            style={{ boxSizing: 'border-box' }}
          >
            <Sparkles className="w-4 h-4 text-black animate-spin" />
            <span>
              {isAnimatingTryOn ? 'Animating Realistic Fabric Movement...' : 'Animate Outfit Try-On'}
            </span>
          </button>

        </div>

      </div>
    </div>
  );
};

// ============================================================================
// FACIAL ANCHOR ENGINE SIMULATION CODE
// Underneath the main viewport layer, write a mock tracking function eFacialAnchor(faceSource, mediaTarget).
// When executed, it maps a 478-landmark tracking point geometry grid over the face
// region of the outfit video, maintaining real-time alignment and skin-tone blending
// whenever an outfit preset tile is clicked.
// ============================================================================
export function eFacialAnchor(
  faceSource: string | HTMLImageElement | HTMLVideoElement,
  mediaTarget: string | HTMLVideoElement | HTMLCanvasElement
): FacialAnchorResult {
  const timestamp = Date.now();
  
  // Generate 478-landmark tracking point geometry grid (MediaPipe topology canonical points)
  const landmarkPoints: FacialLandmark[] = [];

  // Face Oval & Jawline (36 points)
  for (let i = 0; i < 36; i++) {
    const angle = (i / 36) * Math.PI * 2;
    landmarkPoints.push({
      id: i,
      x: 0.5 + Math.cos(angle) * 0.42,
      y: 0.5 + Math.sin(angle) * 0.48,
      z: Math.sin(angle) * 0.05,
    });
  }

  // Right & Left Eye Contours + Irises (70 points)
  for (let i = 36; i < 106; i++) {
    const isRight = i < 71;
    const eyeCenterX = isRight ? 0.35 : 0.65;
    const eyeCenterY = 0.40;
    const angle = ((i - 36) % 35 / 35) * Math.PI * 2;
    landmarkPoints.push({
      id: i,
      x: eyeCenterX + Math.cos(angle) * 0.09,
      y: eyeCenterY + Math.sin(angle) * 0.05,
      z: 0.02,
    });
  }

  // Eyebrows (40 points)
  for (let i = 106; i < 146; i++) {
    const isRight = i < 126;
    const browBaseX = isRight ? 0.25 : 0.55;
    const progress = (i - 106) % 20 / 20;
    landmarkPoints.push({
      id: i,
      x: browBaseX + progress * 0.20,
      y: 0.30 - Math.sin(progress * Math.PI) * 0.04,
      z: 0.04,
    });
  }

  // Nose Bridge & Nostril Wing Mesh (50 points)
  for (let i = 146; i < 196; i++) {
    const progress = (i - 146) / 50;
    landmarkPoints.push({
      id: i,
      x: 0.50 + ((i % 5) - 2) * 0.02,
      y: 0.35 + progress * 0.25,
      z: 0.08 - progress * 0.03,
    });
  }

  // Lips & Oral Cavity Contours (80 points)
  for (let i = 196; i < 276; i++) {
    const progress = (i - 196) / 80;
    const angle = progress * Math.PI * 2;
    landmarkPoints.push({
      id: i,
      x: 0.50 + Math.cos(angle) * 0.15,
      y: 0.70 + Math.sin(angle) * 0.07,
      z: 0.03,
    });
  }

  // Forehead, Cheeks & Surface Triangulation Nodes (remaining up to 478)
  for (let i = 276; i < 478; i++) {
    const seed = i * 1.618;
    const radius = 0.10 + ((i % 10) / 10) * 0.32;
    const angle = (seed % (Math.PI * 2));
    landmarkPoints.push({
      id: i,
      x: 0.50 + Math.cos(angle) * radius,
      y: 0.50 + Math.sin(angle) * radius * 1.1,
      z: Math.cos(radius * Math.PI) * 0.05,
    });
  }

  // Real-time alignment score and skin-tone blend calculation
  const calculatedAlignmentScore = 99.4 + (Math.random() * 0.5);
  const skinToneDelta = 0.015 + (Math.random() * 0.01);

  return {
    anchorStatus: 'locked',
    landmarkCount: 478,
    alignmentScore: Number(calculatedAlignmentScore.toFixed(2)),
    skinToneDelta: Number(skinToneDelta.toFixed(3)),
    skinToneHex: '#dfb59a',
    landmarks: landmarkPoints,
    timestamp,
  };
}
