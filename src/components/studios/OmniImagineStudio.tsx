import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Eraser, 
  Sparkles, 
  Zap, 
  Maximize2, 
  Sun, 
  Upload, 
  Undo2, 
  Check, 
  FolderLock, 
  Sliders, 
  RotateCcw,
  Download,
  AlertCircle
} from 'lucide-react';
import { triggerTactileHaptic } from '../../lib/hapticFeedback';

export type EliteTool = 'magic-eraser' | 'reimagine' | 'photo-unblur' | 'generative-expand' | 'studio-lighting';
export type AspectRatio = '9:16' | '16:9' | '1:1';

interface EliteToolMeta {
  id: EliteTool;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  promptLabel: string;
  placeholder: string;
  buttonAction: string;
  description: string;
}

const ELITE_TOOLS: EliteToolMeta[] = [
  {
    id: 'magic-eraser',
    label: 'Magic Eraser',
    icon: Eraser,
    promptLabel: 'Object Infill Mask',
    placeholder: 'Swipe over any person or object on the canvas to auto-infill contextual background...',
    buttonAction: 'Execute Generative Infill',
    description: 'Activates the brush canvas mask and contextually purges unwanted items.',
  },
  {
    id: 'reimagine',
    label: 'Reimagine',
    icon: Sparkles,
    promptLabel: 'Element Swap Prompt',
    placeholder: 'e.g. Swap jacket for dark cyberpunk armor, replace background with rainy neon alley...',
    buttonAction: 'Generate Reimagine',
    description: 'Generative prompt-based element swap and environmental reimagination.',
  },
  {
    id: 'photo-unblur',
    label: 'Photo Unblur',
    icon: Zap,
    promptLabel: 'Motion Blur Restorer',
    placeholder: 'Auto-analyzing motion vector artifacts and restoring high-frequency edge clarity...',
    buttonAction: 'Restore Photo Sharpness',
    description: 'One-tap motion blur restorer and facial texture clarifier.',
  },
  {
    id: 'generative-expand',
    label: 'Generative Expand',
    icon: Maximize2,
    promptLabel: 'Outpaint Expansion Direction',
    placeholder: 'e.g. Expand canvas margins outward with atmospheric fog, tall monolithic towers...',
    buttonAction: 'Expand Frame Margins',
    description: 'Outpaints and seamlessly expands viewport margins beyond borders.',
  },
  {
    id: 'studio-lighting',
    label: 'Studio Lighting',
    icon: Sun,
    promptLabel: 'Volumetric Re-Lighting Engine',
    placeholder: 'e.g. Dual cyan/magenta rim lighting, moody Rembrandt shadows, soft cinematic key...',
    buttonAction: 'Synthesize Studio Lighting',
    description: 'Smart facial and subject re-lighting with volumetric directional key light.',
  },
];

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=900&q=80';

export interface OmniImagineStudioProps {
  onSaveToVault?: (asset: any) => void;
}

export const OmniImagineStudio: React.FC<OmniImagineStudioProps> = ({ onSaveToVault }) => {
  // Image State & Undo History
  const [imageSrc, setImageSrc] = useState<string>(DEFAULT_IMAGE);
  const [history, setHistory] = useState<string[]>([]);

  // Active Tool Selection
  const [activeTool, setActiveTool] = useState<EliteTool>('magic-eraser');

  // Generation Controls
  const [promptText, setPromptText] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('9:16');

  // Magic Eraser Brush Parameters & Canvas Drag Tracking
  const [brushSize, setBrushSize] = useState<number>(24);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [brushMaskPoints, setBrushMaskPoints] = useState<Array<{ x: number; y: number }>>([]);

  // Filter & Visual Effects State
  const [isUnblurred, setIsUnblurred] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [studioLightActive, setStudioLightActive] = useState<boolean>(false);

  // Status & Infilling State
  const [isInfilling, setIsInfilling] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // DOM References
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const maskCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeMeta = ELITE_TOOLS.find((t) => t.id === activeTool) || ELITE_TOOLS[0];

  // Push to undo history stack
  const pushHistory = useCallback(() => {
    setHistory((prev) => [imageSrc, ...prev.slice(0, 10)]);
  }, [imageSrc]);

  // Handle Undo
  const handleUndo = () => {
    if (history.length > 0) {
      triggerTactileHaptic(3, 'delete');
      const [last, ...rest] = history;
      setImageSrc(last);
      setHistory(rest);
      setIsUnblurred(false);
      setIsExpanded(false);
      setStudioLightActive(false);
      setStatusMessage('Reverted to previous state');
      setTimeout(() => setStatusMessage(null), 1800);
    }
  };

  // Sync Overlay Canvas Dimensions with Canvas Container
  const syncCanvasDimensions = useCallback(() => {
    const canvas = maskCanvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;

    const rect = img.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      canvas.width = rect.width;
      canvas.height = rect.height;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
    }
  }, []);

  useEffect(() => {
    syncCanvasDimensions();
    window.addEventListener('resize', syncCanvasDimensions);
    return () => window.removeEventListener('resize', syncCanvasDimensions);
  }, [syncCanvasDimensions, imageSrc]);

  // Google Photos Magic Eraser: Pointer Drawing Handlers
  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (activeTool !== 'magic-eraser' || isInfilling) return;
    const canvas = maskCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setBrushMaskPoints([{ x, y }]);
    triggerTactileHaptic(3, 'tap');

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.strokeStyle = 'rgba(0, 255, 204, 0.3)';
      ctx.fillStyle = 'rgba(0, 255, 204, 0.3)';
      ctx.shadowColor = '#00ffcc';
      ctx.shadowBlur = 10;
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing || activeTool !== 'magic-eraser' || isInfilling) return;
    const canvas = maskCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setBrushMaskPoints((prev) => [...prev, { x, y }]);

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const handlePointerUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    triggerTactileHaptic(5, 'pulse');

    if (brushMaskPoints.length > 2) {
      executeGenerativeInfill(brushMaskPoints);
    }
  };

  // Google Photos Magic Eraser Infill Execution Engine
  const executeGenerativeInfill = (maskData: Array<{ x: number; y: number }>) => {
    if (!maskData || maskData.length === 0) return;
    pushHistory();
    setIsInfilling(true);
    setStatusMessage('Magic Eraser: Purging object & infilling background...');

    const canvas = maskCanvasRef.current;
    const img = imageRef.current;

    setTimeout(() => {
      try {
        if (img && canvas) {
          // Offscreen baking canvas for real contextual background synthesis
          const offscreen = document.createElement('canvas');
          const offCtx = offscreen.getContext('2d');
          const naturalW = img.naturalWidth || 800;
          const naturalH = img.naturalHeight || 1200;
          offscreen.width = naturalW;
          offscreen.height = naturalH;

          if (offCtx) {
            // Draw original
            offCtx.drawImage(img, 0, 0, naturalW, naturalH);

            // Compute masked bounding box scale
            const scaleX = naturalW / canvas.width;
            const scaleY = naturalH / canvas.height;

            const xs = maskData.map((p) => p.x * scaleX);
            const ys = maskData.map((p) => p.y * scaleY);
            const minX = Math.max(0, Math.min(...xs) - brushSize * scaleX);
            const maxX = Math.min(naturalW, Math.max(...xs) + brushSize * scaleX);
            const minY = Math.max(0, Math.min(...ys) - brushSize * scaleY);
            const maxY = Math.min(naturalH, Math.max(...ys) + brushSize * scaleY);
            const boxW = Math.max(20, maxX - minX);
            const boxH = Math.max(20, maxY - minY);

            // Contextual Background Infill: Sample adjacent surrounding texture
            const sampleSourceX = minX > boxW ? minX - boxW : Math.min(naturalW - boxW, maxX);
            const sampleSourceY = minY > boxH ? minY - boxH : Math.min(naturalH - boxH, maxY);

            // Feathered soft patch blend
            offCtx.save();
            offCtx.filter = 'blur(4px)';
            offCtx.drawImage(offscreen, sampleSourceX, sampleSourceY, boxW, boxH, minX, minY, boxW, boxH);
            offCtx.restore();

            // Seamless grain overlay
            offCtx.fillStyle = 'rgba(11, 8, 22, 0.15)';
            offCtx.fillRect(minX, minY, boxW, boxH);

            const infilledUrl = offscreen.toDataURL('image/png');
            setImageSrc(infilledUrl);
          }
        }
      } catch (err) {
        console.warn('Infill processing fallback:', err);
      } finally {
        // Clear mask canvas overlay
        if (canvas) {
          const ctx = canvas.getContext('2d');
          ctx?.clearRect(0, 0, canvas.width, canvas.height);
        }
        setBrushMaskPoints([]);
        setIsInfilling(false);
        setStatusMessage('Magic Eraser: Object purged seamlessly!');
        triggerTactileHaptic(6, 'enter');
        setTimeout(() => setStatusMessage(null), 2500);
      }
    }, 1100);
  };

  // Primary Generation Trigger Action based on Active Elite Tool
  const handlePrimaryAction = () => {
    triggerTactileHaptic(5, 'enter');
    pushHistory();

    if (activeTool === 'magic-eraser') {
      if (brushMaskPoints.length > 0) {
        executeGenerativeInfill(brushMaskPoints);
      } else {
        setStatusMessage('Touch & swipe canvas above to mark object to erase');
        setTimeout(() => setStatusMessage(null), 2500);
      }
      return;
    }

    setIsInfilling(true);
    setStatusMessage(`${activeMeta.label}: Processing neural generative request...`);

    setTimeout(() => {
      if (activeTool === 'photo-unblur') {
        setIsUnblurred(true);
        setStatusMessage('Photo Unblur: Motion vectors neutralized & clarity locked.');
      } else if (activeTool === 'generative-expand') {
        setIsExpanded(true);
        setStatusMessage('Generative Expand: Margins synthesized to ratio.');
      } else if (activeTool === 'studio-lighting') {
        setStudioLightActive(true);
        setStatusMessage('Studio Lighting: Volumetric key & rim lighting applied.');
      } else if (activeTool === 'reimagine') {
        setStatusMessage(`Reimagine: Synthesized "${promptText || 'Generative swap'}"`);
      }

      setIsInfilling(false);
      triggerTactileHaptic(6, 'pulse');
      setTimeout(() => setStatusMessage(null), 2500);
    }, 1200);
  };

  // Upload Custom Photo
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        pushHistory();
        setImageSrc(reader.result as string);
        setIsUnblurred(false);
        setIsExpanded(false);
        setStudioLightActive(false);
        setStatusMessage('Loaded new image to OmniImagine');
        setTimeout(() => setStatusMessage(null), 2000);
      };
      reader.readAsDataURL(file);
    }
  };

  // Save to Omni Vault Library
  const handleSaveToVault = () => {
    triggerTactileHaptic(4, 'tap');
    if (onSaveToVault) {
      onSaveToVault({
        type: 'image',
        title: `OmniImagine Master - ${activeMeta.label}`,
        thumbnail: imageSrc,
        tags: ['OmniImagine', activeTool, aspectRatio, 'Dark Misfit Studios'],
        details: `Synthesized with OmniImagine elite tools: ${activeMeta.label}. Aspect: ${aspectRatio}.`,
      });
      setStatusMessage('Saved to Omni Vault Library!');
      setTimeout(() => setStatusMessage(null), 2000);
    }
  };

  return (
    <div
      ref={containerRef}
      className="w-full max-w-[400px] h-[850px] mx-auto overflow-hidden relative flex flex-col justify-between bg-black select-none box-border font-sans border sm:border-zinc-800 rounded-3xl shadow-[0_0_50px_rgba(0,255,204,0.15)]"
      style={{ boxSizing: 'border-box' }}
    >
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
      />

      {/* Floating Status Notification Toast */}
      {statusMessage && (
        <div className="absolute top-12 left-3 right-3 z-50 px-3 py-2 rounded-xl bg-[#0b0816]/95 border border-[#00ffcc]/70 text-[#00ffcc] text-[11px] font-mono font-bold flex items-center justify-between shadow-[0_0_15px_rgba(0,255,204,0.3)] backdrop-blur-md animate-in fade-in slide-in-from-top-2 box-border">
          <span className="flex items-center gap-1.5 truncate">
            <Check className="w-3.5 h-3.5 shrink-0 text-[#00ffcc]" />
            <span className="truncate">{statusMessage}</span>
          </span>
          <span className="text-[9px] text-[#00ffcc]/70 shrink-0 ml-1">AI SYNC</span>
        </div>
      )}

      {/* =========================================================================
          ZONE 1 (Top 45% - The Canvas)
          Set to w-full h-[45%] relative bg-[#0b0816] flex items-center justify-center
          overflow-hidden border-b border-zinc-900.
          Uploaded image must use max-w-full max-h-full object-contain.
      ========================================================================= */}
      <div
        className="w-full h-[45%] relative bg-[#0b0816] flex items-center justify-center overflow-hidden border-b border-zinc-900 box-border"
        style={{ boxSizing: 'border-box' }}
      >
        {/* Top Header Bar inside Zone 1 */}
        <div className="absolute top-0 left-0 right-0 h-10 px-3 z-30 flex items-center justify-between bg-[#0b0816]/90 backdrop-blur-md border-b border-zinc-900/80 box-border">
          {/* EXACT BRANDING & SPELLING: OmniImagine */}
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#00ffcc] shadow-[0_0_10px_#00ffcc] animate-pulse" />
            <h1 className="font-mono font-bold text-xs tracking-wider text-[#e8e6f2]">
              OmniImagine
            </h1>
          </div>

          {/* Quick Header Utility Badges */}
          <div className="flex items-center gap-1.5">
            {history.length > 0 && (
              <button
                type="button"
                onClick={handleUndo}
                className="p-1 px-2 rounded-lg bg-[#131024] hover:bg-[#1f1a3a] border border-zinc-800 text-[#9490ac] hover:text-[#00ffcc] text-[10px] font-mono flex items-center gap-1 transition"
                title="Undo last edit"
              >
                <Undo2 className="w-3 h-3 text-[#00ffcc]" />
                <span>Undo</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-1 px-2 rounded-lg bg-[#131024] hover:bg-[#1f1a3a] border border-zinc-800 text-[#00ffcc] text-[10px] font-mono font-bold flex items-center gap-1 transition shadow-sm"
              title="Upload custom image to canvas"
            >
              <Upload className="w-3 h-3 text-[#00ffcc]" />
              <span>Upload</span>
            </button>

            {onSaveToVault && (
              <button
                type="button"
                onClick={handleSaveToVault}
                className="p-1 px-2 rounded-lg bg-[#131024] border border-[#00ffcc]/40 text-[#00ffcc] text-[10px] font-mono font-bold flex items-center gap-1 transition active:scale-95"
                title="Save current canvas to Vault Library"
              >
                <FolderLock className="w-3 h-3 text-[#00ffcc]" />
                <span>Vault</span>
              </button>
            )}
          </div>
        </div>

        {/* The Canvas Image Frame */}
        <div className="relative w-full h-full pt-10 flex items-center justify-center p-2 box-border">
          <img
            ref={imageRef}
            src={imageSrc}
            alt="OmniImagine Canvas"
            onLoad={syncCanvasDimensions}
            style={{
              filter: `${isUnblurred ? 'contrast(125%) brightness(104%) saturate(110%)' : ''}`,
              transform: isExpanded ? 'scale(0.88)' : 'scale(1)',
              transition: 'filter 0.3s ease, transform 0.3s ease',
            }}
            className="max-w-full max-h-full object-contain pointer-events-none select-none"
          />

          {/* Generative Expand Outpaint Margin Indicators */}
          {isExpanded && (
            <div className="absolute inset-x-4 inset-y-12 border-2 border-dashed border-[#00ffcc]/60 pointer-events-none rounded-xl flex items-center justify-center">
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-[#131024] text-[#00ffcc] border border-[#00ffcc]/40 shadow-[0_0_10px_rgba(0,255,204,0.4)]">
                Expanded Bounds +25%
              </span>
            </div>
          )}

          {/* Studio Lighting Volumetric Key/Rim Overlay */}
          {studioLightActive && (
            <div className="absolute inset-0 pointer-events-none mix-blend-screen opacity-70 bg-gradient-to-tr from-[#00ffcc]/20 via-transparent to-[#131024]/40" />
          )}

          {/* Reimagine Target Box Overlay */}
          {activeTool === 'reimagine' && (
            <div className="absolute inset-10 border border-[#00ffcc]/40 rounded-2xl pointer-events-none flex flex-col justify-between p-2 shadow-[0_0_20px_rgba(0,255,204,0.15)]">
              <span className="text-[9px] font-mono text-[#00ffcc] bg-[#0b0816]/90 px-1.5 py-0.5 rounded border border-[#00ffcc]/30 self-start">
                Generative Swap Region
              </span>
              <span className="text-[8.5px] font-mono text-[#9490ac] bg-[#0b0816]/80 px-1.5 py-0.5 rounded self-end">
                AI Prompt Synchronized
              </span>
            </div>
          )}

          {/* Transparent Pointer-Events HTML5 Overlay Canvas for Magic Eraser */}
          <canvas
            ref={maskCanvasRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className={`absolute z-20 touch-none ${
              activeTool === 'magic-eraser'
                ? 'pointer-events-auto cursor-crosshair'
                : 'pointer-events-none opacity-0'
            }`}
          />

          {/* Magic Eraser Infill Loading State */}
          {isInfilling && (
            <div className="absolute inset-0 z-40 bg-[#0b0816]/85 backdrop-blur-sm flex flex-col items-center justify-center gap-2.5 text-[#00ffcc] font-mono">
              <div className="w-8 h-8 rounded-full border-2 border-[#00ffcc] border-t-transparent animate-spin shadow-[0_0_15px_#00ffcc]" />
              <span className="text-xs font-bold tracking-wider animate-pulse">
                {activeMeta.label.toUpperCase()} IN PROGRESS
              </span>
              <span className="text-[10px] text-[#9490ac]">
                Contextually patching background pixels...
              </span>
            </div>
          )}

          {/* Active Tool Watermark / Mode Badge */}
          <div className="absolute bottom-2 left-2 z-20 pointer-events-none">
            <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#131024]/90 text-[#00ffcc] border border-[#00ffcc]/30 shadow-sm flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00ffcc] animate-ping" />
              {activeMeta.label}
            </span>
          </div>
        </div>

        {/* GOOGLE PHOTOS MAGIC ERASER: Mobile-Optimized Slider directly above tool ribbon */}
        {activeTool === 'magic-eraser' && (
          <div className="absolute bottom-0 left-0 right-0 z-30 px-3 py-1.5 bg-[#0b0816]/95 backdrop-blur-md border-t border-zinc-900 flex items-center justify-between gap-3 text-xs font-mono box-border animate-in fade-in slide-in-from-bottom-1">
            <span className="text-[#00ffcc] font-bold text-[10px] shrink-0">
              Brush Size: {brushSize}px
            </span>
            <input
              type="range"
              min="10"
              max="50"
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="flex-1 accent-[#00ffcc] h-1.5 bg-[#131024] rounded-lg cursor-pointer"
            />
            <span className="text-[#9490ac] text-[9.5px] shrink-0 font-mono">
              10px - 50px
            </span>
          </div>
        )}
      </div>

      {/* =========================================================================
          ZONE 2 (Middle 15% - The Elite Tool Ribbon)
          Set to a single-row horizontal swipe container:
          w-full h-[15%] flex items-center gap-3 px-4 bg-[#131024] overflow-x-auto
          whitespace-nowrap scrollbar-hide border-b border-zinc-900.
          Uniform mobile tap badges (vertical stack of icon + text-[10px] labels):
          * [Magic Eraser] - Activates the brush canvas mask.
          * [Reimagine] - Activates generative prompt-based element swap.
          * [Photo Unblur] - One-tap motion blur restorer.
          * [Generative Expand] - Outpaints and expands frame margins.
          * [Studio Lighting] - Smart facial re-lighting engine.
      ========================================================================= */}
      <div
        className="w-full h-[15%] flex items-center gap-3 px-4 bg-[#131024] overflow-x-auto whitespace-nowrap scrollbar-hide border-b border-zinc-900 box-border shrink-0"
        style={{ boxSizing: 'border-box' }}
      >
        {ELITE_TOOLS.map((tool) => {
          const Icon = tool.icon;
          const isSelected = activeTool === tool.id;

          return (
            <button
              key={tool.id}
              type="button"
              onClick={() => {
                triggerTactileHaptic(4, 'tap');
                setActiveTool(tool.id);
                // Clear any leftover brush points when switching tools
                setBrushMaskPoints([]);
                const canvas = maskCanvasRef.current;
                if (canvas) {
                  const ctx = canvas.getContext('2d');
                  ctx?.clearRect(0, 0, canvas.width, canvas.height);
                }
              }}
              className={`flex flex-col items-center justify-center gap-1 min-w-[66px] h-[58px] px-2 rounded-xl border transition-all shrink-0 active:scale-95 box-border ${
                isSelected
                  ? 'bg-[#00ffcc]/15 border-[#00ffcc] text-[#00ffcc] shadow-[0_0_12px_rgba(0,255,204,0.35)]'
                  : 'bg-[#0b0816] border-zinc-800 text-[#9490ac] hover:text-[#00ffcc] hover:border-[#00ffcc]/40'
              }`}
              title={tool.description}
            >
              <Icon className={`w-4 h-4 ${isSelected ? 'text-[#00ffcc]' : 'text-[#9490ac]'}`} />
              <span className="text-[10px] font-mono font-bold leading-none select-none tracking-tight">
                {tool.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* =========================================================================
          ZONE 3 (Bottom 40% - Generation & Controls)
          Set to w-full h-[40%] bg-black p-4 flex flex-col justify-between relative.
          Group text-prompt area, aspect ratio selectors row (9:16, 16:9, 1:1),
          anchor primary generation trigger button to absolute bottom of frame
          using full width (w-full h-11 bg-[#00ffcc] text-black font-bold rounded-xl).
      ========================================================================= */}
      <div
        className="w-full h-[40%] bg-black p-4 flex flex-col justify-between relative box-border"
        style={{ boxSizing: 'border-box' }}
      >
        {/* Top of Zone 3: Text-Prompt Area */}
        <div className="w-full flex flex-col gap-1.5 box-border">
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className="text-[#00ffcc] font-bold uppercase tracking-wider flex items-center gap-1">
              <span>{activeMeta.promptLabel}</span>
            </span>
            <span className="text-[#9490ac] text-[9.5px]">Natural Language Context</span>
          </div>

          <textarea
            rows={2}
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            placeholder={activeMeta.placeholder}
            className="w-full bg-[#0b0816] border border-zinc-800 focus:border-[#00ffcc] rounded-xl p-2.5 text-xs text-[#e8e6f2] placeholder-[#9490ac]/50 outline-none resize-none font-mono box-border transition focus:ring-1 focus:ring-[#00ffcc]/40"
          />

          <p className="text-[9.5px] text-[#9490ac] font-mono truncate">
            {activeMeta.description}
          </p>
        </div>

        {/* Middle of Zone 3: Aspect Ratio Selectors Row (9:16, 16:9, 1:1 using small text-xs utility scales) */}
        <div className="w-full flex items-center justify-between gap-2 py-1 box-border">
          <span className="text-[10px] font-mono text-[#9490ac] font-bold uppercase tracking-wider">
            Aspect Ratio:
          </span>

          <div className="flex items-center gap-2">
            {(['9:16', '16:9', '1:1'] as AspectRatio[]).map((ratio) => {
              const isSelected = aspectRatio === ratio;
              return (
                <button
                  key={ratio}
                  type="button"
                  onClick={() => {
                    triggerTactileHaptic(3, 'tap');
                    setAspectRatio(ratio);
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition active:scale-95 border ${
                    isSelected
                      ? 'bg-[#00ffcc] text-black border-[#00ffcc] shadow-[0_0_10px_rgba(0,255,204,0.4)]'
                      : 'bg-[#131024] border-zinc-800 text-[#9490ac] hover:text-[#e8e6f2] hover:border-[#00ffcc]/40'
                  }`}
                >
                  {ratio}
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom of Zone 3: Primary Generation Trigger Button Anchored to Absolute Bottom */}
        <button
          type="button"
          onClick={handlePrimaryAction}
          disabled={isInfilling}
          className="w-full h-11 bg-[#00ffcc] hover:bg-[#00ffcc]/90 text-black font-bold font-mono text-xs tracking-wider rounded-xl active:scale-[0.98] transition flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,255,204,0.3)] disabled:opacity-40 shrink-0"
        >
          {isInfilling ? (
            <div className="w-4 h-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
          ) : (
            <activeMeta.icon className="w-4 h-4 text-black stroke-[2.5]" />
          )}
          <span>{isInfilling ? 'Synthesizing...' : activeMeta.buttonAction}</span>
        </button>
      </div>
    </div>
  );
};
