import React, { useState } from 'react';
import { 
  Code, 
  Sparkles, 
  Layout, 
  Smartphone, 
  Monitor, 
  Tablet, 
  Play, 
  ExternalLink, 
  FolderLock, 
  Check, 
  RotateCcw, 
  Zap, 
  Globe, 
  Layers, 
  ArrowRight,
  Terminal,
  FileCode,
  Bug,
  Wand2
} from 'lucide-react';
import { HoloOrb, OrbPhase } from '../HoloOrb';

export const OmniCodeStudio: React.FC = () => {
  const [appIdeaPrompt, setAppIdeaPrompt] = useState('Create a nocturnal cyberpunk landing page for Dark Misfit Studios with 3D product showcase and Stripe billing.');
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildProgress, setBuildProgress] = useState(0);
  const [orbPhase, setOrbPhase] = useState<OrbPhase>('idle');
  const [activeViewport, setActiveViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isBuilt, setIsBuilt] = useState(false);

  const handleStartBuild = () => {
    if (!appIdeaPrompt.trim()) return;
    setIsBuilding(true);
    setOrbPhase('processing');
    setBuildProgress(15);

    setTimeout(() => setBuildProgress(40), 900);
    setTimeout(() => setBuildProgress(75), 1800);
    setTimeout(() => {
      setBuildProgress(100);
      setIsBuilding(false);
      setIsBuilt(true);
      setOrbPhase('idle');
    }, 2800);
  };

  return (
    <div className="h-full flex flex-col bg-[#07090e] text-slate-100 overflow-hidden font-sans">
      
      {/* Top Header */}
      <div className="p-3 bg-[#0d1017] border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 font-black">
            <Code className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              OMNICODE FULL-STACK BUILDER
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                CURSOR & LOVABLE SCAFFOLD
              </span>
            </h3>
            <p className="text-[11px] text-slate-400">Generate, scaffold, and render interactive web apps from natural language</p>
          </div>
        </div>

        {isBuilt && (
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800">
              <button
                onClick={() => setActiveViewport('desktop')}
                className={`p-1.5 rounded ${activeViewport === 'desktop' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                title="Desktop"
              >
                <Monitor className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setActiveViewport('tablet')}
                className={`p-1.5 rounded ${activeViewport === 'tablet' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                title="Tablet"
              >
                <Tablet className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setActiveViewport('mobile')}
                className={`p-1.5 rounded ${activeViewport === 'mobile' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}
                title="Mobile"
              >
                <Smartphone className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              onClick={() => setIsBuilt(false)}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs text-slate-300 flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              New Build
            </button>
          </div>
        )}
      </div>

      {/* Main Studio Body */}
      <div className="flex-1 overflow-hidden flex flex-col p-4 space-y-4">
        
        {/* Prompt Input Section */}
        <div className="p-4 rounded-xl bg-[#0e121a] border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Natural Language App Specification
            </span>
            <span className="text-[10px] font-mono text-slate-500">React 19 • Tailwind CSS • Vite</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <textarea
              value={appIdeaPrompt}
              onChange={(e) => setAppIdeaPrompt(e.target.value)}
              placeholder="Describe the application you want to build..."
              rows={2}
              className="flex-1 bg-black/60 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 font-mono resize-none"
            />
            <button
              onClick={handleStartBuild}
              disabled={isBuilding}
              className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all shrink-0 active:scale-95 disabled:opacity-50"
            >
              <Zap className="w-4 h-4 fill-current" />
              {isBuilding ? 'Forging App...' : 'Generate App'}
            </button>
          </div>
        </div>

        {/* Build Progress Indicator */}
        {isBuilding && (
          <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/30 space-y-2 animate-in fade-in">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-indigo-400 flex items-center gap-2">
                <HoloOrb phase="processing" size="sm" />
                Compiling components, layouts and API endpoints...
              </span>
              <span className="text-white font-bold">{buildProgress}%</span>
            </div>
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full transition-all duration-300"
                style={{ width: `${buildProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* App Preview & Canvas */}
        <div className="flex-1 min-h-[300px] rounded-xl border border-slate-800 bg-[#020204] overflow-hidden flex flex-col relative">
          <div className="h-8 bg-[#0d1017] border-b border-slate-800 px-3 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500/80" />
              <span className="w-2 h-2 rounded-full bg-amber-500/80" />
              <span className="w-2 h-2 rounded-full bg-emerald-500/80" />
              <span className="ml-2 text-slate-300">preview://localhost:3000</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
                Ready
              </span>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center p-4 overflow-y-auto">
            {isBuilt ? (
              <div className={`transition-all duration-300 shadow-2xl rounded-xl border border-slate-800 bg-slate-950 p-6 ${
                activeViewport === 'mobile' ? 'w-[320px] h-[540px]' : activeViewport === 'tablet' ? 'w-[520px] h-[480px]' : 'w-full h-full max-w-4xl'
              }`}>
                <div className="h-full flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                      <span className="font-mono text-sm font-bold text-white tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-cyan-400" /> DARK MISFIT STUDIOS
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                        CYBERPUNK v2.0
                      </span>
                    </div>
                    <h1 className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400">
                      Raw Emotion Transformed Into Visual Art
                    </h1>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Autonomous intelligence, heartbreak, betrayal, and shadow aesthetics engineered by Benjamin James.
                    </p>
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800">
                        <div className="text-[10px] text-slate-500 font-mono">DIGITAL SHADOW</div>
                        <div className="text-sm font-bold text-white mt-1">OmniAI Engine</div>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800">
                        <div className="text-[10px] text-slate-500 font-mono">LATENCY</div>
                        <div className="text-sm font-bold text-emerald-400 mt-1">4.2ms Speculative</div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                    <span className="text-[10px] text-slate-500 font-mono">Built with OmniCode</span>
                    <button className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition">
                      Live Preview Active
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-3 max-w-sm">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto text-indigo-400">
                  <Layout className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-white">Full-Stack Application Canvas</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Enter your app idea above and tap <strong>Generate App</strong> to synthesize interactive web apps with live viewport simulation.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
