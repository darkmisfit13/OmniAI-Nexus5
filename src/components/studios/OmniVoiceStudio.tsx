import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, 
  Upload, 
  Play, 
  Pause, 
  Volume2, 
  Sparkles, 
  Check, 
  RotateCcw, 
  Globe, 
  Sliders, 
  Radio, 
  FolderLock,
  ChevronDown,
  Layers,
  Activity
} from 'lucide-react';
import { HoloOrb, OrbPhase } from '../HoloOrb';
import { omniVoice } from '../../lib/omniVoice';

interface OmniVoiceStudioProps {
  onSaveToVault?: (asset: any) => void;
}

export const OmniVoiceStudio: React.FC<OmniVoiceStudioProps> = ({ onSaveToVault }) => {
  // Waveform & Audio Player
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(35);
  const [sampleLoaded, setSampleLoaded] = useState(true);
  const [sampleFileName, setSampleFileName] = useState('protagonist_voice_sample_10s.wav');

  // Input States
  const [targetLanguage, setTargetLanguage] = useState<'en' | 'es' | 'ja' | 'fr' | 'de' | 'zh' | 'ko'>('en');
  const [scriptText, setScriptText] = useState('In a city consumed by silicon and shadow, our voices will be the only frequency they cannot silence.');
  
  // 3 Sliders required: Emotional Expressiveness, Stability, Clarity
  const [emotionalExpressiveness, setEmotionalExpressiveness] = useState(65);
  const [stability, setStability] = useState(40);
  const [clarity, setClarity] = useState(85);

  // Execution & Lip-Sync Processing
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [syncProgress, setSyncProgress] = useState(0);
  const [dubbedAudioReady, setDubbedAudioReady] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [orbPhase, setOrbPhase] = useState<OrbPhase>('idle');

  // Animated bars for audio waveform monitor
  const [waveAmplitudes, setWaveAmplitudes] = useState<number[]>([
    20, 45, 60, 30, 85, 95, 70, 40, 55, 80, 65, 30, 90, 75, 50, 85, 60, 35, 70, 90, 55, 40, 65, 30
  ]);

  useEffect(() => {
    let interval: any;
    if (isPlayingAudio) {
      interval = setInterval(() => {
        setWaveAmplitudes(prev => prev.map(() => Math.floor(Math.random() * 85) + 15));
        setAudioProgress(p => (p >= 100 ? 0 : p + 2));
      }, 100);
    } else {
      setWaveAmplitudes([
        20, 35, 45, 30, 55, 65, 50, 30, 40, 60, 50, 25, 70, 55, 40, 65, 45, 25, 50, 70, 40, 30, 45, 20
      ]);
    }
    return () => clearInterval(interval);
  }, [isPlayingAudio]);

  const handleExecuteVoiceDub = () => {
    setIsSynthesizing(true);
    setSyncProgress(15);
    setOrbPhase('processing');
    setToastMessage('Synthesizing vocal cadence and neural phonemes...');

    setTimeout(() => {
      setSyncProgress(55);
      setToastMessage('Calibrating 478-point lip-sync visemes...');
    }, 800);

    setTimeout(() => {
      setSyncProgress(100);
      setIsSynthesizing(false);
      setDubbedAudioReady(true);
      setOrbPhase('talking');
      setIsPlayingAudio(true);
      setToastMessage('Voice Dub & Lip-Sync generated successfully!');

      // Play audio sample using browser synthesis or audio tone
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(scriptText);
        utterance.rate = 1.05;
        utterance.pitch = 0.95;
        window.speechSynthesis.speak(utterance);
      }

      setTimeout(() => setToastMessage(null), 3000);
    }, 1700);
  };

  const handleSaveToVault = () => {
    if (onSaveToVault) {
      onSaveToVault({
        type: 'audio',
        title: `OmniVoice Dub (${targetLanguage.toUpperCase()}) - ${emotionalExpressiveness}% Emotion`,
        thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&q=80',
        tags: ['OmniVoice Studio', targetLanguage, 'Viseme Lip-Sync', `${stability}% Stability`],
        details: scriptText,
      });
      setToastMessage('Saved dubbed audio to Omni Vault!');
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
        <div className="absolute top-12 left-1/2 -translate-x-1/2 z-50 px-3 py-1.5 rounded-full bg-[#131024]/95 border border-[#00ffcc]/50 text-[#00ffcc] text-[11px] font-mono shadow-2xl backdrop-blur-md animate-in fade-in flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-[#00ffcc]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER BAR */}
      <div className="h-12 px-4 bg-[#131024] border-b border-zinc-900 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#00ffcc] animate-pulse shadow-[0_0_8px_#00ffcc]" />
          <h1 className="font-bold text-xs tracking-wider uppercase text-white font-mono">
            OmniVoice Studio
          </h1>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#00ffcc]/10 border border-[#00ffcc]/30 text-[#00ffcc]">
            Neural Dub
          </span>
          {dubbedAudioReady && (
            <button
              onClick={handleSaveToVault}
              className="px-2 py-0.5 rounded-md bg-[#00ffcc] text-slate-950 font-bold text-[9.5px] font-mono flex items-center gap-1 active:scale-95 transition"
              title="Save to Vault"
            >
              <FolderLock className="w-2.5 h-2.5" />
              <span>Vault</span>
            </button>
          )}
        </div>
      </div>

      {/* ZONE 1 (Top 30% Height - Live Waveform Monitor) */}
      <div className="h-[30%] min-h-[180px] p-2 flex flex-col justify-center bg-black border-b border-zinc-900 relative">
        <div className="flex items-center justify-between px-3 mb-1">
          <div className="flex items-center gap-1.5 text-zinc-400 text-[10px] font-mono">
            <Radio className="w-3 h-3 text-[#00ffcc]" />
            <span className="text-white font-bold">WAVEFORM MONITOR</span>
            <span className="text-zinc-600">|</span>
            <span className="text-zinc-400">48kHz 24-bit Hi-Res</span>
          </div>
          <span className="text-[10px] font-mono text-[#00ffcc] font-bold">
            -4.2 dB Peak
          </span>
        </div>

        {/* The required waveform container */}
        <div className="h-[120px] bg-[#0b0816] rounded-xl border border-zinc-900 mx-4 mt-2 p-3 flex flex-col justify-between relative overflow-hidden shadow-inner">
          {/* Subtle Grid Lines */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#00ffcc_1px,transparent_1px)] [background-size:12px_12px] pointer-events-none" />

          {/* Audio Waveform Spectrum Visualization */}
          <div className="flex-1 flex items-center justify-between gap-1 px-2 z-10">
            {waveAmplitudes.map((amp, idx) => (
              <div 
                key={idx} 
                className="flex-1 rounded-full transition-all duration-100 ease-out"
                style={{
                  height: `${amp}%`,
                  backgroundColor: idx % 3 === 0 ? '#00ffcc' : idx % 2 === 0 ? '#00d2c4' : '#6c63ff',
                  boxShadow: isPlayingAudio && amp > 60 ? '0 0 8px #00ffcc' : 'none'
                }}
              />
            ))}
          </div>

          {/* Timeline & Playback Bar */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-zinc-800/80 z-10 font-mono text-[9.5px]">
            <button
              onClick={() => setIsPlayingAudio(!isPlayingAudio)}
              className="w-6 h-6 rounded-full bg-[#00ffcc] text-slate-950 flex items-center justify-center font-bold active:scale-95 transition shadow-sm"
              title="Play/Pause Waveform"
            >
              {isPlayingAudio ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 ml-0.5 fill-current" />}
            </button>

            {/* Scrubber track */}
            <div className="flex-1 h-1.5 bg-zinc-900 rounded-full overflow-hidden relative">
              <div 
                className="h-full bg-[#00ffcc] transition-all duration-100"
                style={{ width: `${audioProgress}%` }}
              />
            </div>

            <span className="text-zinc-400">
              00:0{Math.floor((audioProgress / 100) * 10)} / 00:10
            </span>
          </div>
        </div>
      </div>

      {/* ZONE 2 (Middle 30% Height - Sample Upload Zone & Multilingual Input) */}
      <div className="h-[30%] min-h-[190px] p-3 flex flex-col justify-between bg-[#131024] border-b border-zinc-900 overflow-y-auto">
        {/* Upload Zone */}
        <div className="p-2.5 rounded-xl bg-[#0b0816] border border-dashed border-zinc-700 hover:border-[#00ffcc]/60 transition flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[#00ffcc]/10 text-[#00ffcc] flex items-center justify-center shrink-0 border border-[#00ffcc]/20">
              <Mic className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-white truncate">10s Voice Sample</span>
                <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 text-[8.5px] font-mono">Cloned</span>
              </div>
              <p className="text-[9px] text-zinc-400 truncate font-mono">{sampleFileName}</p>
            </div>
          </div>

          <label className="px-2 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[9.5px] font-mono cursor-pointer shrink-0 border border-zinc-700 active:scale-95 transition">
            Replace
            <input 
              type="file" 
              accept="audio/*" 
              className="hidden" 
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setSampleFileName(file.name);
                  setSampleLoaded(true);
                  setToastMessage(`Voice sample loaded: ${file.name}`);
                  setTimeout(() => setToastMessage(null), 2000);
                }
              }} 
            />
          </label>
        </div>

        {/* Compact Multilingual Input */}
        <div className="space-y-1 mt-2">
          <div className="flex items-center justify-between">
            <label className="text-[9.5px] font-mono text-zinc-300 flex items-center gap-1">
              <Globe className="w-3 h-3 text-[#00ffcc]" />
              <span>Target Language & Dub Script:</span>
            </label>
            <select
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value as any)}
              className="bg-[#0b0816] border border-zinc-700 text-[#00ffcc] rounded-lg px-2 py-0.5 text-[9.5px] font-mono outline-none cursor-pointer"
            >
              <option value="en">English (US)</option>
              <option value="es">Spanish (ES)</option>
              <option value="ja">Japanese (JP)</option>
              <option value="fr">French (FR)</option>
              <option value="de">German (DE)</option>
              <option value="zh">Mandarin (CN)</option>
              <option value="ko">Korean (KR)</option>
            </select>
          </div>

          <textarea
            value={scriptText}
            onChange={(e) => setScriptText(e.target.value)}
            rows={2}
            className="w-full bg-[#0b0816] border border-zinc-800 rounded-xl p-2 text-xs text-white placeholder-zinc-500 focus:border-[#00ffcc] outline-none font-sans resize-none transition"
            placeholder="Type text for neural lip-sync voice clone..."
          />
        </div>
      </div>

      {/* ZONE 3 (Bottom 40% Height - 3 Sliders + Neon #00ffcc Action Button) */}
      <div className="h-[40%] min-h-[260px] p-4 bg-black flex flex-col justify-between">
        
        {/* 3 Touch-Friendly Sliders */}
        <div className="space-y-3">
          
          {/* Slider 1: Emotional Expressiveness */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-300 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#00ffcc]" />
                Emotional Expressiveness
              </span>
              <span className="text-[#00ffcc] font-bold">{emotionalExpressiveness}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={emotionalExpressiveness}
              onChange={(e) => setEmotionalExpressiveness(Number(e.target.value))}
              className="w-full h-1.5 bg-[#131024] rounded-lg appearance-none cursor-pointer accent-[#00ffcc]"
            />
            <div className="flex justify-between text-[8px] font-mono text-zinc-500">
              <span>Monotone (0%)</span>
              <span>Dramatic (100%)</span>
            </div>
          </div>

          {/* Slider 2: Stability */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-300 flex items-center gap-1">
                <Sliders className="w-3 h-3 text-[#00ffcc]" />
                Stability
              </span>
              <span className="text-[#00ffcc] font-bold">{stability}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={stability}
              onChange={(e) => setStability(Number(e.target.value))}
              className="w-full h-1.5 bg-[#131024] rounded-lg appearance-none cursor-pointer accent-[#00ffcc]"
            />
            <div className="flex justify-between text-[8px] font-mono text-zinc-500">
              <span>Raw Flaws (0%)</span>
              <span>Synthetic Flat (100%)</span>
            </div>
          </div>

          {/* Slider 3: Clarity */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-300 flex items-center gap-1">
                <Volume2 className="w-3 h-3 text-[#00ffcc]" />
                Clarity
              </span>
              <span className="text-[#00ffcc] font-bold">{clarity}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={clarity}
              onChange={(e) => setClarity(Number(e.target.value))}
              className="w-full h-1.5 bg-[#131024] rounded-lg appearance-none cursor-pointer accent-[#00ffcc]"
            />
            <div className="flex justify-between text-[8px] font-mono text-zinc-500">
              <span>Atmospheric (0%)</span>
              <span>Studio Isolated (100%)</span>
            </div>
          </div>

        </div>

        {/* Synthesis Status progress */}
        {isSynthesizing && (
          <div className="space-y-1 py-1 font-mono text-xs">
            <div className="flex justify-between text-[10px]">
              <span className="text-zinc-400">Rendering Visemes & Neural Dub...</span>
              <span className="text-[#00ffcc] font-bold">{syncProgress}%</span>
            </div>
            <div className="w-full h-1.5 bg-zinc-900 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#00d2c4] to-[#00ffcc] transition-all duration-300" 
                style={{ width: `${syncProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Bottom Full-Width #00ffcc Action Button */}
        <button
          onClick={handleExecuteVoiceDub}
          disabled={isSynthesizing}
          className="w-full py-3 rounded-xl bg-[#00ffcc] hover:bg-[#1affd4] text-slate-950 font-black font-mono text-xs tracking-wider uppercase shadow-lg shadow-[#00ffcc]/20 active:scale-98 transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Mic className="w-4 h-4 text-slate-950 fill-current" />
          <span>Execute Voice Dub & Lip-Sync</span>
        </button>

      </div>
    </div>
  );
};
