import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Hammer, 
  Sparkles, 
  ArrowUp, 
  Maximize2, 
  Minimize2, 
  Split, 
  Terminal, 
  FileCode, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp, 
  Layers, 
  RefreshCw, 
  Sun, 
  Moon, 
  Eye, 
  ExternalLink,
  CheckCircle2,
  Package,
  Palette,
  Zap,
  Shield,
  Sliders,
  X
} from 'lucide-react';

interface StreamingFile {
  name: string;
  status: 'pending' | 'editing' | 'done' | 'error';
  changes: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'omni';
  text: string;
  timestamp: string;
  tokens?: number;
}

export const OmniForgeStudio: React.FC = () => {
  // Theme state: dark mode by default with accessible high-contrast toggle
  const [isLightMode, setIsLightMode] = useState(false);

  // Split state: height ratio of upper canvas (from 0.05 to 1.0)
  // Three distinct target states:
  // - Prompt Focus: canvas ~30% (chat 70%)
  // - Split View: canvas 50% (chat 50%)
  // - Canvas Focus: canvas 100% (chat minimized into floating pill)
  const [canvasRatio, setCanvasRatio] = useState<number>(0.50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Chat console messages
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm-1',
      sender: 'omni',
      text: 'OmniForge v5.0 ready. What application are we creating today? Type below or tap a quick smart action.',
      timestamp: '09:24',
      tokens: 42
    },
    {
      id: 'm-2',
      sender: 'user',
      text: 'Create a next-gen dark aesthetic landing page with 3D product showcase and responsive glass cards.',
      timestamp: '09:25'
    },
    {
      id: 'm-3',
      sender: 'omni',
      text: 'Synthesizing React component tree and live styling. Live preview updating in real-time.',
      timestamp: '09:25',
      tokens: 88
    }
  ]);

  const [promptInput, setPromptInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorToast, setErrorToast] = useState<{ message: string; line: string } | null>(null);
  const [isErrorToastExpanded, setIsErrorToastExpanded] = useState(false);

  // Active file tree state
  const [files, setFiles] = useState<StreamingFile[]>([
    { name: 'App.tsx', status: 'done', changes: '+42 -8' },
    { name: 'main.tsx', status: 'done', changes: '+12 -2' },
    { name: 'styles.css', status: 'done', changes: '+85 -0' },
    { name: 'ProductCard.tsx', status: 'done', changes: '+64 -0' },
  ]);

  // Contextual smart actions directly above prompt box
  const smartActions = [
    { label: '⚡ Fix Layout', prompt: 'Refactor grid layout for clean fluid mobile proportions and touch padding.' },
    { label: '🎨 Change Theme', prompt: 'Invert color accents to neon violet (#8b7fff) with deep midnight backdrop.' },
    { label: '📦 Add Package', prompt: 'Install Lucide icons and Motion animation primitives.' },
    { label: '✨ Add Hero Glow', prompt: 'Inject radial glowing gradient behind the main call to action.' },
    { label: '🛡️ Add Auth Guard', prompt: 'Wrap profile routes with biometric authentication state.' },
  ];

  // Dragging logic for fluid divider handle
  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handlePointerMove = useCallback((e: PointerEvent) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const relativeY = e.clientY - rect.top;
    const newRatio = Math.max(0.15, Math.min(0.95, relativeY / rect.height));
    setCanvasRatio(newRatio);
  }, [isDragging]);

  const handlePointerUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
    }
  }, [isDragging]);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('pointermove', handlePointerMove);
      window.addEventListener('pointerup', handlePointerUp);
      return () => {
        window.removeEventListener('pointermove', handlePointerMove);
        window.removeEventListener('pointerup', handlePointerUp);
      };
    }
  }, [isDragging, handlePointerMove, handlePointerUp]);

  // Preset state switchers
  const setToPromptFocus = () => setCanvasRatio(0.30); // Canvas 30%, Chat 70%
  const setToSplitView = () => setCanvasRatio(0.50);    // Canvas 50%, Chat 50%
  const setToCanvasFocus = () => setCanvasRatio(1.0);    // Canvas 100%, Chat minimized

  // Submit prompt and trigger simulation
  const handleSendPrompt = (textToSend?: string) => {
    const text = (textToSend || promptInput).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setPromptInput('');
    setIsGenerating(true);

    // Simulate multi-file streaming edits
    setFiles([
      { name: 'App.tsx', status: 'editing', changes: '+24' },
      { name: 'HeroSection.tsx', status: 'editing', changes: '+48' },
      { name: 'styles.css', status: 'pending', changes: '+16' },
      { name: 'types.ts', status: 'done', changes: '+6' }
    ]);

    setTimeout(() => {
      setFiles((prev) => 
        prev.map((f) => f.name === 'HeroSection.tsx' ? { ...f, status: 'done' } : f)
      );
    }, 1100);

    setTimeout(() => {
      // Simulate temporary compilation error flash
      setFiles((prev) => 
        prev.map((f) => f.name === 'App.tsx' ? { ...f, status: 'error' } : f)
      );
      setErrorToast({
        message: 'Type error: Property "glowIntensity" is missing in type HeroProps.',
        line: 'src/App.tsx:42:15'
      });
    }, 1900);

    setTimeout(() => {
      // Auto-healed by AI
      setFiles((prev) => 
        prev.map((f) => ({ ...f, status: 'done' }))
      );
      setErrorToast(null);
      setIsGenerating(false);

      const aiMsg: ChatMessage = {
        id: `o-${Date.now()}`,
        sender: 'omni',
        text: `Applied: "${text}". Cleaned layout syntax, verified responsive typography, and re-rendered live canvas.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        tokens: 142
      };
      setMessages((prev) => [...prev, aiMsg]);
    }, 3200);
  };

  // Live interactive preview HTML for the iframe
  const previewHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        body {
          background-color: ${isLightMode ? '#f8f9fc' : '#0b0a14'};
          color: ${isLightMode ? '#1e1b4b' : '#e8e6f2'};
          padding: 16px;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 12px;
          border-bottom: 1px solid ${isLightMode ? '#e2e8f0' : '#211d34'};
        }
        .brand {
          font-weight: 900;
          font-size: 14px;
          letter-spacing: 1px;
          background: linear-gradient(135deg, #6c63ff, #8b7fff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .badge {
          font-size: 10px;
          padding: 3px 8px;
          border-radius: 9999px;
          background: ${isLightMode ? '#ede9fe' : '#14121f'};
          border: 1px solid #6c63ff;
          color: #8b7fff;
          font-weight: 700;
        }
        .hero {
          background: ${isLightMode ? '#ffffff' : '#14121f'};
          border: 1px solid ${isLightMode ? '#e2e8f0' : '#211d34'};
          border-radius: 16px;
          padding: 16px;
          text-align: center;
          box-shadow: 0 10px 25px -5px rgba(108, 99, 255, 0.15);
        }
        .hero h1 {
          font-size: 17px;
          font-weight: 800;
          margin-bottom: 6px;
          line-height: 1.25;
        }
        .hero p {
          font-size: 11.5px;
          color: ${isLightMode ? '#64748b' : '#9490ac'};
          margin-bottom: 14px;
          line-height: 1.4;
        }
        .btn-primary {
          background: linear-gradient(135deg, #6c63ff, #8b7fff);
          color: #ffffff;
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: transform 0.15s ease;
        }
        .btn-primary:active { transform: scale(0.96); }
        .grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .card {
          background: ${isLightMode ? '#ffffff' : '#14121f'};
          border: 1px solid ${isLightMode ? '#e2e8f0' : '#211d34'};
          border-radius: 12px;
          padding: 12px;
        }
        .card-title {
          font-size: 10px;
          color: #9490ac;
          text-transform: uppercase;
          margin-bottom: 4px;
        }
        .card-value {
          font-size: 14px;
          font-weight: 800;
          color: #8b7fff;
        }
        .interactive-section {
          background: ${isLightMode ? '#ffffff' : '#14121f'};
          border: 1px dashed #6c63ff;
          border-radius: 12px;
          padding: 12px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <span class="brand">DARK MISFIT STUDIOS</span>
        <span class="badge">v5.0 LIVE</span>
      </div>

      <div class="hero">
        <h1>Raw Emotion Transformed Into Visual Art</h1>
        <p>OmniAI autonomous intelligence & dark aesthetic mobile app creator.</p>
        <button class="btn-primary" onclick="alert('⚡ Interactive Preview: App code executes live!')">Explore Releases</button>
      </div>

      <div class="grid">
        <div class="card">
          <div class="card-title">STATUS</div>
          <div class="card-value">100% ONLINE</div>
        </div>
        <div class="card">
          <div class="card-title">LATENCY</div>
          <div class="card-value">1.8ms ENGINE</div>
        </div>
      </div>

      <div class="interactive-section">
        <div>
          <div style="font-size: 11px; font-weight: 700;">Live Interaction Counter</div>
          <div style="font-size: 10px; color: #9490ac;" id="counter-label">Tap to trigger DOM update</div>
        </div>
        <button class="btn-primary" style="padding: 6px 12px; font-size: 11px;" onclick="
          var count = parseInt(window._count || 0) + 1;
          window._count = count;
          document.getElementById('counter-label').innerText = 'Interactions: ' + count;
        ">+1 Tap</button>
      </div>
    </body>
    </html>
  `;

  const isCanvasFocus = canvasRatio >= 0.92;
  const isPromptFocus = canvasRatio <= 0.38;
  const isSplitView = !isCanvasFocus && !isPromptFocus;

  return (
    <div className={`w-full flex justify-center items-center py-2 sm:py-4 select-none ${isLightMode ? 'bg-[#f0f2f8]' : 'bg-[#050608]'}`}>
      
      {/* 
        EXACT MAIN STRUCTURAL LAYOUT CONTAINER SPECIFIED BY USER:
        w-full max-w-[400px] h-[850px] mx-auto overflow-hidden relative bg-[#090a0f] text-zinc-100 flex flex-col
      */}
      <div 
        ref={containerRef}
        className={`w-full max-w-[400px] h-[850px] mx-auto overflow-hidden relative text-zinc-100 flex flex-col rounded-[2.5rem] border shadow-2xl transition-colors duration-200 ${
          isLightMode 
            ? 'bg-[#ffffff] text-[#1e1b4b] border-slate-300' 
            : 'bg-[#090a0f] text-[#e8e6f2] border-[#211d34]'
        }`}
        style={{
          boxShadow: isLightMode 
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.15)' 
            : '0 25px 50px -12px rgba(108, 99, 255, 0.25)'
        }}
      >

        {/* 1. TOP HEADER & MODE CONTROLLER BAR */}
        <div className={`h-11 px-3 border-b flex items-center justify-between shrink-0 z-30 transition-colors ${
          isLightMode 
            ? 'bg-[#f8f9fc] border-slate-200' 
            : 'bg-[#14121f] border-[#211d34]'
        }`}>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#6c63ff] flex items-center justify-center text-white shadow-sm font-black">
              <Hammer className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-xs font-black tracking-wider font-mono">OMNIFORGE</span>
              <span className="text-[9px] font-mono text-[#9490ac] ml-1.5 hidden xs:inline">
                FLUID WORKSPACE
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {/* Quick State Buttons for convenience */}
            <div className={`flex items-center rounded-md p-0.5 border ${isLightMode ? 'bg-slate-200/80 border-slate-300' : 'bg-[#0b0a14] border-[#211d34]'}`}>
              <button
                type="button"
                onClick={setToPromptFocus}
                className={`p-1 rounded text-[10px] font-mono transition ${
                  isPromptFocus 
                    ? 'bg-[#6c63ff] text-white font-bold' 
                    : isLightMode ? 'text-slate-600 hover:text-black' : 'text-[#9490ac] hover:text-white'
                }`}
                title="Prompt Focus (70% Chat, 30% Canvas Thumbnail)"
              >
                70/30
              </button>
              <button
                type="button"
                onClick={setToSplitView}
                className={`p-1 rounded text-[10px] font-mono transition ${
                  isSplitView 
                    ? 'bg-[#6c63ff] text-white font-bold' 
                    : isLightMode ? 'text-slate-600 hover:text-black' : 'text-[#9490ac] hover:text-white'
                }`}
                title="Balanced Split View (50% Canvas, 50% Chat)"
              >
                50/50
              </button>
              <button
                type="button"
                onClick={setToCanvasFocus}
                className={`p-1 rounded text-[10px] font-mono transition ${
                  isCanvasFocus 
                    ? 'bg-[#6c63ff] text-white font-bold' 
                    : isLightMode ? 'text-slate-600 hover:text-black' : 'text-[#9490ac] hover:text-white'
                }`}
                title="Canvas Focus (100% Canvas, Minimized Chat Pill)"
              >
                100%
              </button>
            </div>

            {/* Light / Dark Mode Toggle */}
            <button
              type="button"
              onClick={() => setIsLightMode(!isLightMode)}
              className={`p-1.5 rounded-md border text-xs transition ${
                isLightMode 
                  ? 'bg-amber-100 border-amber-300 text-amber-700' 
                  : 'bg-[#0b0a14] border-[#211d34] text-[#8b7fff] hover:border-[#6c63ff]'
              }`}
              title="Toggle Light / Dark theme"
            >
              {isLightMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* 2. UPPER PANEL: [App Canvas Preview Area] */}
        <div 
          className="w-full relative overflow-hidden transition-all duration-75"
          style={{ height: `${canvasRatio * 100}%` }}
        >
          {/* Absolute-positioned container with w-full h-full overflow-hidden as mandated */}
          <div className="absolute inset-0 w-full h-full overflow-hidden bg-white select-none">
            
            {/* FLOATING 'LIVE' BADGE WITH GREEN PULSING DOT AS SPECIFIED */}
            <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/80 backdrop-blur-md border border-white/10 text-white text-[10px] font-mono font-bold shadow-md pointer-events-none">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.9)]" />
              <span>Live</span>
            </div>

            {/* Thumbnail Mode indicator overlay when in Prompt Focus (30% canvas) */}
            {isPromptFocus && (
              <div 
                onClick={setToSplitView}
                className="absolute inset-0 z-10 bg-black/40 hover:bg-black/20 backdrop-blur-[0.5px] cursor-pointer flex items-center justify-center group transition"
                title="Tap to expand preview canvas"
              >
                <div className="px-2.5 py-1 rounded-full bg-[#14121f]/90 border border-[#6c63ff] text-white text-[10px] font-mono font-bold shadow-lg flex items-center gap-1 group-hover:scale-105 transition-transform">
                  <Maximize2 className="w-3 h-3 text-[#8b7fff]" />
                  <span>Tap to expand (30% Thumbnail)</span>
                </div>
              </div>
            )}

            {/*
              INNER IFRAME:
              - pointer-events disabled while dragging/resizing to prevent mouse-capture lockups
              - w-full h-full object-cover select-none bg-white
            */}
            <iframe
              title="OmniForge App Canvas Preview"
              srcDoc={previewHtml}
              className={`w-full h-full object-cover select-none bg-white border-0 transition-opacity ${
                isDragging ? 'pointer-events-none opacity-90' : 'pointer-events-auto opacity-100'
              }`}
              sandbox="allow-scripts allow-modals"
            />
          </div>
        </div>

        {/* 3. HORIZONTAL DIVIDER HANDLE BLOCK AS SPECIFIED */}
        {/* Styled as h-2 w-full bg-zinc-800 flex items-center justify-center cursor-row-resize */}
        {!isCanvasFocus && (
          <div
            onPointerDown={handlePointerDown}
            className={`h-2.5 w-full flex items-center justify-center cursor-row-resize shrink-0 z-30 transition-colors ${
              isDragging 
                ? 'bg-[#6c63ff]' 
                : isLightMode ? 'bg-slate-300 hover:bg-[#6c63ff]' : 'bg-[#211d34] hover:bg-[#6c63ff]'
            }`}
            title="Drag vertically to fluidly adjust canvas and AI chat ratio"
          >
            {/* Tiny rounded slider notch indicator: w-12 h-1 bg-zinc-600 rounded-full */}
            <div className={`w-12 h-1 rounded-full transition-colors ${
              isDragging ? 'bg-white' : isLightMode ? 'bg-slate-500' : 'bg-[#9490ac]'
            }`} />
          </div>
        )}

        {/* 4. LOWER PANEL: [AI Chat Workspace & Token Code Tracker] */}
        {/* Enforce flex-1 flex flex-col justify-between overflow-hidden */}
        {!isCanvasFocus ? (
          <div className={`flex-1 flex flex-col justify-between overflow-hidden relative transition-colors ${
            isLightMode ? 'bg-[#ffffff]' : 'bg-[#0b0a14]'
          }`}>

            {/* ONGOING PROMPT STREAM: scrolls vertically (overflow-y-auto text-xs p-3 space-y-2) */}
            <div className="flex-1 overflow-y-auto text-xs p-3 space-y-2.5 font-sans">
              {messages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      <span className={`text-[10px] font-mono font-bold ${
                        isUser 
                          ? 'text-[#8b7fff]' 
                          : isLightMode ? 'text-slate-500' : 'text-[#9490ac]'
                      }`}>
                        {isUser ? 'YOU' : 'OMNI AI'}
                      </span>
                      <span className="text-[9px] text-[#9490ac] font-mono">{msg.timestamp}</span>
                      {msg.tokens && (
                        <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-[#6c63ff]/20 text-[#8b7fff]">
                          {msg.tokens} tokens
                        </span>
                      )}
                    </div>

                    <div className={`p-2.5 rounded-xl max-w-[88%] text-xs leading-relaxed shadow-sm ${
                      isUser
                        ? 'bg-[#6c63ff] text-white font-medium rounded-tr-none'
                        : isLightMode
                        ? 'bg-slate-100 text-slate-900 border border-slate-200 rounded-tl-none'
                        : 'bg-[#14121f] text-[#e8e6f2] border border-[#211d34] rounded-tl-none'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                );
              })}

              {isGenerating && (
                <div className="flex items-center gap-2 p-2 rounded-lg bg-[#6c63ff]/10 border border-[#6c63ff]/30 text-xs font-mono text-[#8b7fff]">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Synthesizing AST & compiling file stream...</span>
                </div>
              )}
            </div>

            {/* 
              VISUAL STREAMING FILE TREE INDICATOR:
              Must run as an absolute horizontal bar right above the prompt box.
              Shows compact list of files being edited side-by-side using text-xs font sizes,
              spinning loaders (🔄, ✅, ⚠️).
            */}
            <div className={`w-full px-2 py-1.5 border-t border-b flex items-center justify-between text-xs overflow-x-auto gap-2 shrink-0 ${
              isLightMode 
                ? 'bg-slate-100 border-slate-200' 
                : 'bg-[#14121f] border-[#211d34]'
            }`}>
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
                <span className="text-[10px] font-mono text-[#9490ac] uppercase tracking-wider flex items-center gap-1 shrink-0 font-bold">
                  <FileCode className="w-3 h-3 text-[#6c63ff]" />
                  Files:
                </span>

                {files.map((file) => {
                  const isEditing = file.status === 'editing';
                  const isError = file.status === 'error';
                  const isDone = file.status === 'done';

                  return (
                    <div
                      key={file.name}
                      className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-mono shrink-0 border transition-all ${
                        isError
                          ? 'bg-red-950/60 border-red-500 text-red-300 animate-pulse'
                          : isEditing
                          ? 'bg-[#6c63ff]/20 border-[#6c63ff] text-white'
                          : isLightMode
                          ? 'bg-white border-slate-200 text-slate-700'
                          : 'bg-[#0b0a14] border-[#211d34] text-[#e8e6f2]'
                      }`}
                    >
                      <span className="font-semibold">{file.name}</span>
                      <span>
                        {isEditing && '🔄'}
                        {isDone && '✅'}
                        {isError && '⚠️'}
                        {file.status === 'pending' && '⏳'}
                      </span>
                      <span className="text-[9px] text-[#9490ac] font-mono">{file.changes}</span>
                    </div>
                  );
                })}
              </div>

              <span className="text-[10px] font-mono text-[#9490ac] shrink-0 hidden xs:inline">
                Zero-pill metrics
              </span>
            </div>

            {/* COMPILATION ERROR EXPANDABLE TOAST NOTIFICATION */}
            {errorToast && (
              <div className="px-3 py-1.5 bg-red-950/90 border-t border-b border-red-600/50 text-red-200 text-xs font-mono flex items-center justify-between animate-in slide-in-from-bottom-2">
                <div className="flex items-center gap-1.5 truncate">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  <span className="truncate">{errorToast.message}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsErrorToastExpanded(!isErrorToastExpanded)}
                    className="p-1 rounded text-[10px] text-red-400 hover:text-white"
                  >
                    {isErrorToastExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setErrorToast(null)}
                    className="p-1 rounded text-[10px] text-red-400 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            {errorToast && isErrorToastExpanded && (
              <div className="p-2 bg-black/95 text-red-300 font-mono text-[10px] border-b border-red-800 space-y-1">
                <div>Source: {errorToast.line}</div>
                <div className="text-zinc-400">&gt; OmniAI self-healing daemon dispatched patch automatically...</div>
              </div>
            )}

            {/* 
              PERSISTENT COMMAND CENTER (AI Prompt Input):
              Anchored directly above keyboard layer.
              Styled with p-2 bg-[#121318] border-t border-zinc-800.
              Textarea auto-grows 1 to max 4 lines (max-h-[120px] overflow-y-auto).
              Glowing right-anchored 'Arrow Up' submit button.
              Directly above input box: single-row horizontal scrolling slider showing contextual smart actions.
            */}
            <div className={`p-2 border-t flex flex-col justify-end shrink-0 z-20 ${
              isLightMode 
                ? 'bg-slate-100 border-slate-200' 
                : 'bg-[#121318] border-zinc-800'
            }`}>
              
              {/* Single-row horizontal scrolling slider showing contextual smart actions */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1.5 mb-1.5 border-b border-white/5">
                {smartActions.map((action) => (
                  <button
                    key={action.label}
                    type="button"
                    onClick={() => handleSendPrompt(action.prompt)}
                    className={`px-2 py-1 rounded-md text-xs font-mono font-medium shrink-0 border transition-all ${
                      isLightMode
                        ? 'bg-white border-slate-300 text-slate-700 hover:border-[#6c63ff] hover:text-[#6c63ff]'
                        : 'bg-[#14121f] border-[#211d34] text-[#9490ac] hover:text-white hover:border-[#6c63ff]'
                    }`}
                  >
                    {action.label}
                  </button>
                ))}
              </div>

              {/* Textarea + Glowing Right-Anchored 'Arrow Up' Submit Button */}
              <div className="flex items-end gap-2 relative">
                <textarea
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendPrompt();
                    }
                  }}
                  rows={1}
                  placeholder="Ask OmniForge to build or edit anything..."
                  className={`flex-1 rounded-md p-2 text-xs font-sans leading-relaxed resize-none max-h-[120px] overflow-y-auto border transition focus:outline-none focus:ring-1 focus:ring-[#6c63ff] ${
                    isLightMode
                      ? 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
                      : 'bg-[#0b0a14] border-[#211d34] text-[#e8e6f2] placeholder-[#9490ac]'
                  }`}
                  style={{ minHeight: '38px' }}
                />

                <button
                  type="button"
                  onClick={() => handleSendPrompt()}
                  disabled={!promptInput.trim() && !isGenerating}
                  className="w-9 h-9 rounded-md bg-[#6c63ff] hover:bg-[#8b7fff] text-white flex items-center justify-center shrink-0 transition-all shadow-[0_0_12px_rgba(108,99,255,0.6)] active:scale-95 disabled:opacity-40 disabled:shadow-none"
                  title="Submit Prompt to OmniForge"
                >
                  <ArrowUp className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </div>

          </div>
        ) : (
          /* 
            CANVAS FOCUS MODE:
            The preview canvas expands to full screen (100%).
            The AI chat minimizes into a floating, pill-shaped trigger button as specified.
          */
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-40">
            <button
              type="button"
              onClick={setToSplitView}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#14121f]/95 border border-[#6c63ff] text-white text-xs font-mono font-bold shadow-[0_0_20px_rgba(108,99,255,0.6)] hover:scale-105 active:scale-95 transition-all backdrop-blur-md"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#8b7fff] animate-spin" />
              <span>💬 Prompt OmniAI Console</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
