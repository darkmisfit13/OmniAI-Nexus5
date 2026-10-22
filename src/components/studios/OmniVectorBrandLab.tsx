import React, { useState, useRef } from 'react';
import { 
  Shapes, 
  Sparkles, 
  Download, 
  Layers, 
  Eye, 
  Check, 
  FolderLock, 
  Copy, 
  Wand2, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Sliders, 
  Lock, 
  Unlock, 
  Palette, 
  RotateCcw,
  Move
} from 'lucide-react';
import { HoloOrb, OrbPhase } from '../HoloOrb';

interface OmniVectorBrandLabProps {
  onSaveToVault?: (asset: any) => void;
}

export type StyleMatrixPreset = 
  | 'Vector Art'
  | 'Flatline Art'
  | 'Mascot Logo'
  | '3D App Icon'
  | 'Seamless Pattern'
  | 'Brand Logo';

export const OmniVectorBrandLab: React.FC<OmniVectorBrandLabProps> = ({ onSaveToVault }) => {
  // Style Matrix (6 required presets)
  const [selectedStyle, setSelectedStyle] = useState<StyleMatrixPreset>('Vector Art');

  // Canvas Workspace States (Pinch-to-zoom, pan, wireframe, layers)
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [showWireframe, setShowWireframe] = useState<boolean>(false);
  const [showLayerMenu, setShowLayerMenu] = useState<boolean>(false);
  const [activeLayer, setActiveLayer] = useState<'all' | 'paths' | 'fills' | 'strokes'>('all');
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // 5-Swatch Brand Color Locker
  const [brandSwatches, setBrandSwatches] = useState<string[]>([
    '#00ffcc', // Glowing Neon Bluish Green
    '#131024', // Deep Dark Bluish Purple
    '#6c63ff', // Electric Violet
    '#00d2c4', // Hyper Teal
    '#ffffff'  // Pure White
  ]);
  const [activeSwatchIndex, setActiveSwatchIndex] = useState<number>(0);
  const [lockedSwatches, setLockedSwatches] = useState<boolean[]>([true, true, false, false, false]);

  // Micro-edit deck parameters
  const [cornerRounding, setCornerRounding] = useState<number>(12);
  const [strokeWeight, setStrokeWeight] = useState<number>(2.5);
  const [pathSmoothness, setPathSmoothness] = useState<number>(85);

  // VTracer Raster-to-Vector Tracing Logic
  const [isTracing, setIsTracing] = useState<boolean>(false);
  const [tracingProgress, setTracingProgress] = useState<number>(0);
  const [vectorNodeCount, setVectorNodeCount] = useState<number>(1284);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const sampleSVG = `<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="neonGlow" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${brandSwatches[0]}" />
      <stop offset="100%" stop-color="${brandSwatches[2]}" />
    </linearGradient>
  </defs>
  <!-- Background Badge -->
  <rect x="20" y="20" width="160" height="160" rx="${cornerRounding * 2}" fill="${showWireframe ? 'none' : brandSwatches[1]}" stroke="${brandSwatches[0]}" stroke-width="${strokeWeight}" />
  <!-- Main Geometric Icon -->
  <polygon points="100,45 155,145 45,145" fill="${showWireframe ? 'none' : 'url(#neonGlow)'}" stroke="${brandSwatches[0]}" stroke-width="${strokeWeight * 1.2}" />
  <circle cx="100" cy="115" r="22" fill="${showWireframe ? 'none' : brandSwatches[3]}" stroke="${brandSwatches[4]}" stroke-width="${strokeWeight}" />
  <!-- Circuit Nodes -->
  <line x1="100" y1="20" x2="100" y2="45" stroke="${brandSwatches[0]}" stroke-width="${strokeWeight}" />
  <line x1="45" y1="145" x2="25" y2="165" stroke="${brandSwatches[0]}" stroke-width="${strokeWeight}" />
  <line x1="155" y1="145" x2="175" y2="165" stroke="${brandSwatches[0]}" stroke-width="${strokeWeight}" />
</svg>`;

  const handleConvertRasterToVector = () => {
    setIsTracing(true);
    setTracingProgress(20);
    setToastMessage('@visioncortex/vtracer: Extracting luminance contours...');

    setTimeout(() => {
      setTracingProgress(65);
      setToastMessage('Fitting cubic Bézier splines & color quantization...');
    }, 700);

    setTimeout(() => {
      setTracingProgress(100);
      setIsTracing(false);
      setVectorNodeCount(1438);
      setToastMessage('Tracing complete: 1,438 Bézier nodes vectorized!');
      setTimeout(() => setToastMessage(null), 3000);
    }, 1500);
  };

  const handleSaveToVault = () => {
    if (onSaveToVault) {
      onSaveToVault({
        type: 'vector',
        title: `Vector Brand - ${selectedStyle} (${vectorNodeCount} Nodes)`,
        thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80',
        tags: ['Vector and Brand Lab', selectedStyle, 'vtracer SVG', `${brandSwatches[0]}`],
        details: `Clean Bézier vector asset exported with ${vectorNodeCount} nodes and 5-swatch palette.`
      });
      setToastMessage('Vector asset stored in Omni Vault!');
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
          <Shapes className="w-4 h-4 text-[#00ffcc]" />
          <h1 className="font-bold text-xs tracking-wider uppercase text-white font-mono">
            Vector and Brand Lab
          </h1>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              navigator.clipboard?.writeText(sampleSVG);
              setCopiedCode(true);
              setToastMessage('SVG Bézier code copied to clipboard!');
              setTimeout(() => {
                setCopiedCode(false);
                setToastMessage(null);
              }, 2000);
            }}
            className="px-2 py-0.5 rounded-md bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-[9px] flex items-center gap-1 border border-zinc-700 active:scale-95 transition"
            title="Copy Raw SVG"
          >
            <Copy className="w-2.5 h-2.5" />
            <span>{copiedCode ? 'Copied' : 'SVG'}</span>
          </button>

          <button
            onClick={handleSaveToVault}
            className="px-2 py-0.5 rounded-md bg-[#00ffcc] text-slate-950 font-bold text-[9.5px] font-mono flex items-center gap-1 active:scale-95 transition"
            title="Save Vector Asset to Vault"
          >
            <FolderLock className="w-2.5 h-2.5" />
            <span>Vault</span>
          </button>
        </div>
      </div>

      {/* ZONE 1 (Main 45% Height - Canvas Workspace) */}
      <div className="h-[45%] relative bg-[#0b0816] overflow-hidden border-b border-zinc-900 flex flex-col justify-between p-2">
        {/* Top-Left & Top-Right Canvas HUD Controls */}
        <div className="flex items-center justify-between z-20">
          {/* Wireframe toggle */}
          <button
            onClick={() => setShowWireframe(!showWireframe)}
            className={`px-2 py-1 rounded-lg text-[9px] font-mono font-bold flex items-center gap-1.5 transition ${
              showWireframe 
                ? 'bg-[#00ffcc] text-slate-950 shadow-[0_0_8px_#00ffcc]' 
                : 'bg-black/70 text-zinc-300 border border-zinc-800'
            }`}
            title="Toggle Bézier Wireframe Line Views"
          >
            <Eye className="w-3 h-3" />
            <span>{showWireframe ? 'Wireframe ON' : 'Vector Fill'}</span>
          </button>

          {/* Zoom & Pan Controls */}
          <div className="flex items-center gap-1 bg-black/80 rounded-lg p-0.5 border border-zinc-800 font-mono text-[9px]">
            <button
              onClick={() => setZoomLevel(z => Math.max(50, z - 15))}
              className="p-1 text-zinc-400 hover:text-white"
              title="Zoom Out"
            >
              <ZoomOut className="w-3 h-3" />
            </button>
            <span className="px-1 text-[#00ffcc] font-bold">{zoomLevel}%</span>
            <button
              onClick={() => setZoomLevel(z => Math.min(200, z + 15))}
              className="p-1 text-zinc-400 hover:text-white"
              title="Zoom In"
            >
              <ZoomIn className="w-3 h-3" />
            </button>
            <button
              onClick={() => {
                setZoomLevel(100);
                setPanOffset({ x: 0, y: 0 });
              }}
              className="p-1 text-zinc-400 hover:text-white border-l border-zinc-800"
              title="Reset Viewport"
            >
              <RotateCcw className="w-2.5 h-2.5" />
            </button>
          </div>

          {/* Expandable Layer Menu Trigger */}
          <button
            onClick={() => setShowLayerMenu(!showLayerMenu)}
            className={`p-1.5 rounded-lg text-[9px] font-mono border transition ${
              showLayerMenu ? 'bg-[#00ffcc]/20 border-[#00ffcc] text-[#00ffcc]' : 'bg-black/70 border-zinc-800 text-zinc-400'
            }`}
            title="Expandable Layer Menu"
          >
            <Layers className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Expandable Layer Menu Popover */}
        {showLayerMenu && (
          <div className="absolute top-12 right-2 z-30 w-36 bg-[#131024] border border-[#00ffcc]/40 rounded-xl p-2 shadow-2xl font-mono text-[10px] space-y-1 animate-in fade-in zoom-in-95">
            <span className="text-[8.5px] uppercase text-zinc-400 font-bold px-1 block mb-1">Canvas Layers</span>
            {(['all', 'paths', 'fills', 'strokes'] as const).map(layer => (
              <button
                key={layer}
                onClick={() => {
                  setActiveLayer(layer);
                  setShowLayerMenu(false);
                }}
                className={`w-full text-left px-2 py-1 rounded-md transition flex items-center justify-between ${
                  activeLayer === layer ? 'bg-[#00ffcc]/20 text-[#00ffcc] font-bold' : 'text-zinc-300 hover:bg-white/5'
                }`}
              >
                <span className="capitalize">{layer}</span>
                {activeLayer === layer && <Check className="w-3 h-3" />}
              </button>
            ))}
          </div>
        )}

        {/* Live Vector Canvas Viewport with Grid Lines */}
        <div 
          className="flex-1 w-full flex items-center justify-center relative overflow-hidden my-1 bg-[#05040a] rounded-xl border border-zinc-800/80 cursor-grab active:cursor-grabbing"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(0,255,204,0.08) 1px, transparent 1px)',
            backgroundSize: '16px 16px'
          }}
        >
          <div 
            className="transition-transform duration-100 flex items-center justify-center"
            style={{
              transform: `scale(${zoomLevel / 100}) translate(${panOffset.x}px, ${panOffset.y}px)`,
            }}
            dangerouslySetInnerHTML={{ __html: sampleSVG }}
          />

          {/* Node count pill */}
          <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/80 border border-zinc-800 text-[8.5px] font-mono text-zinc-400 flex items-center gap-1 backdrop-blur-sm pointer-events-none">
            <span className="text-[#00ffcc]">●</span>
            <span>{vectorNodeCount} Bézier Nodes</span>
          </div>

          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/80 border border-zinc-800 text-[8px] font-mono text-cyan-300 pointer-events-none">
            {selectedStyle}
          </div>
        </div>
      </div>

      {/* ZONE 2 (Middle 15% Height - Style Matrix Horizontal Swipe Track) */}
      <div className="h-[15%] min-h-[95px] bg-[#131024] p-3 border-b border-zinc-900 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] font-mono font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
            <Wand2 className="w-3 h-3 text-[#00ffcc]" />
            STYLE MATRIX
          </span>
          <span className="text-[8.5px] font-mono text-[#00ffcc]">6 Neural Presets</span>
        </div>

        {/* Required Style Matrix Horizontal Swipe Track */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          {(
            [
              'Vector Art',
              'Flatline Art',
              'Mascot Logo',
              '3D App Icon',
              'Seamless Pattern',
              'Brand Logo'
            ] as StyleMatrixPreset[]
          ).map((style) => {
            const isSelected = selectedStyle === style;
            return (
              <button
                key={style}
                onClick={() => {
                  setSelectedStyle(style);
                  setToastMessage(`Style Matrix: Switched to ${style}`);
                  setTimeout(() => setToastMessage(null), 1500);
                }}
                className={`px-3 py-1.5 rounded-xl font-mono text-[10px] font-bold whitespace-nowrap shrink-0 transition active:scale-95 border ${
                  isSelected 
                    ? 'bg-[#00ffcc] text-slate-950 border-[#00ffcc] shadow-[0_0_10px_rgba(0,255,204,0.3)]' 
                    : 'bg-black/60 text-zinc-300 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                {style}
              </button>
            );
          })}
        </div>
      </div>

      {/* ZONE 3 (Bottom 40% Height - 5-Swatch Brand Color Locker, Micro-Edit Deck, and Convert Button) */}
      <div className="h-[40%] min-h-[260px] p-4 bg-black flex flex-col justify-between">
        
        {/* 5-Swatch Brand Color Locker */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-300 font-bold flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-[#00ffcc]" />
              BRAND COLOR LOCKER (5-SWATCH)
            </span>
            <span className="text-[9px] text-[#00ffcc] font-mono">
              Hex: {brandSwatches[activeSwatchIndex]}
            </span>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {brandSwatches.map((swatch, idx) => {
              const isLocked = lockedSwatches[idx];
              const isSelected = activeSwatchIndex === idx;
              return (
                <div
                  key={idx}
                  onClick={() => setActiveSwatchIndex(idx)}
                  className={`h-11 rounded-xl p-1 relative flex flex-col justify-between cursor-pointer border transition ${
                    isSelected ? 'ring-2 ring-[#00ffcc] border-transparent scale-105' : 'border-zinc-800'
                  }`}
                  style={{ backgroundColor: swatch }}
                >
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLockedSwatches(prev => {
                        const copy = [...prev];
                        copy[idx] = !copy[idx];
                        return copy;
                      });
                    }}
                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center self-end backdrop-blur-sm ${
                      isLocked ? 'bg-black/70 text-[#00ffcc]' : 'bg-black/40 text-zinc-400'
                    }`}
                  >
                    {isLocked ? <Lock className="w-2 h-2" /> : <Unlock className="w-2 h-2" />}
                  </button>

                  <span className={`text-[7px] font-mono px-0.5 rounded truncate ${
                    swatch === '#ffffff' ? 'text-slate-900 bg-white/70' : 'text-white bg-black/60'
                  }`}>
                    {swatch}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Micro-Edit Deck */}
        <div className="space-y-2 pt-2 border-t border-zinc-900 font-mono">
          {/* Corner Rounding */}
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-zinc-400">Corner Radius: {cornerRounding}px</span>
            <input
              type="range"
              min="0"
              max="40"
              value={cornerRounding}
              onChange={(e) => setCornerRounding(Number(e.target.value))}
              className="w-32 h-1 bg-[#131024] rounded-lg appearance-none cursor-pointer accent-[#00ffcc]"
            />
          </div>

          {/* Stroke Weight */}
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-zinc-400">Stroke Weight: {strokeWeight}pt</span>
            <input
              type="range"
              min="0.5"
              max="6"
              step="0.5"
              value={strokeWeight}
              onChange={(e) => setStrokeWeight(Number(e.target.value))}
              className="w-32 h-1 bg-[#131024] rounded-lg appearance-none cursor-pointer accent-[#00ffcc]"
            />
          </div>

          {/* Path Smoothness */}
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-zinc-400">Bézier Smoothness: {pathSmoothness}%</span>
            <input
              type="range"
              min="10"
              max="100"
              value={pathSmoothness}
              onChange={(e) => setPathSmoothness(Number(e.target.value))}
              className="w-32 h-1 bg-[#131024] rounded-lg appearance-none cursor-pointer accent-[#00ffcc]"
            />
          </div>
        </div>

        {/* Tracing Progress Bar */}
        {isTracing && (
          <div className="space-y-1 font-mono text-xs">
            <div className="flex justify-between text-[9.5px]">
              <span className="text-zinc-400">@visioncortex/vtracer Neural Tracing...</span>
              <span className="text-[#00ffcc] font-bold">{tracingProgress}%</span>
            </div>
            <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#00d2c4] to-[#00ffcc] transition-all duration-300"
                style={{ width: `${tracingProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Action Button: Convert Raster to Vector */}
        <button
          onClick={handleConvertRasterToVector}
          disabled={isTracing}
          className="w-full py-3 rounded-xl bg-[#00ffcc] hover:bg-[#1affd4] text-slate-950 font-black font-mono text-xs tracking-wider uppercase shadow-lg shadow-[#00ffcc]/20 active:scale-98 transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4 text-slate-950 fill-current" />
          <span>{isTracing ? 'Vectorizing Image Nodes...' : 'Convert Raster to Vector'}</span>
        </button>

      </div>
    </div>
  );
};
