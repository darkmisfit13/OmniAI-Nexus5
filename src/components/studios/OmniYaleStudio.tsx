import React, { useState, useEffect, useRef } from 'react';
import { 
  Radio, 
  Video, 
  Mic, 
  Presentation, 
  FileText, 
  Sliders, 
  Sparkles, 
  Share2, 
  FolderLock, 
  Check, 
  Scissors, 
  Play, 
  Pause, 
  CircleDot, 
  Layers, 
  Volume2, 
  Maximize2,
  Tv,
  Podcast,
  Eye,
  ChevronRight,
  X
} from 'lucide-react';
import { HoloOrb, OrbPhase } from '../HoloOrb';

interface OmniYaleStudioProps {
  onSaveToVault?: (asset: any) => void;
}

interface CameraStream {
  id: string;
  name: string;
  role: string;
  poster: string;
  vuLevel: number; // 0-100
  isActiveSpeaker: boolean;
}

export const OmniYaleStudio: React.FC<OmniYaleStudioProps> = ({ onSaveToVault }) => {
  // Broadcast Recording State
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 4 Camera Streams for 2x2 Grid
  const [cameraStreams, setCameraStreams] = useState<CameraStream[]>([
    {
      id: 'cam-1',
      name: 'Prof. M. Sterling',
      role: 'Main Lecturer',
      poster: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&q=80',
      vuLevel: 75,
      isActiveSpeaker: true,
    },
    {
      id: 'cam-2',
      name: 'Dr. H. Vance (Remote)',
      role: 'Guest Speaker',
      poster: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&q=80',
      vuLevel: 40,
      isActiveSpeaker: false,
    },
    {
      id: 'cam-3',
      name: 'Yale Law Hall 102',
      role: 'Audience Q&A',
      poster: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&q=80',
      vuLevel: 25,
      isActiveSpeaker: false,
    },
    {
      id: 'cam-4',
      name: 'Keynote Deck (Slide 14)',
      role: 'Presentation Feed',
      poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&q=80',
      vuLevel: 60,
      isActiveSpeaker: false,
    },
  ]);

  const [activeCamId, setActiveCamId] = useState<string>('cam-1');

  // Live Production Switcher Buttons
  const [isAutoDirectorActive, setIsAutoDirectorActive] = useState<boolean>(true);
  const [isSlidesInjected, setIsSlidesInjected] = useState<boolean>(false);
  const [showTeleprompter, setShowTeleprompter] = useState<boolean>(false);
  const [showMultiMicMatrix, setShowMultiMicMatrix] = useState<boolean>(false);

  // Mic Matrix Track Gains
  const [micGains, setMicGains] = useState<{ [key: string]: number }>({
    'cam-1': 85,
    'cam-2': 78,
    'cam-3': 45,
    'cam-4': 60,
  });

  // Teleprompter Script
  const [teleprompterScript, setTeleprompterScript] = useState<string>(
    'Welcome to Yale Law 102. Today we analyze constitutional parameters in autonomous agent alignment. Notice how slide 14 isolates neural consensus from speculative execution.'
  );

  // Real-time scrolling transcription
  const [transcriptLines, setTranscriptLines] = useState<string[]>([
    '[00:00:04] Prof. Sterling: Good morning everyone. In this session, we investigate recursive neural alignment.',
    '[00:00:12] Prof. Sterling: When an autonomous agent executes a legal protocol, who bears evidentiary burden?',
    '[00:00:22] Dr. Vance: In the UK jurisdiction, strict algorithmic liability applies unless verifiable cryptoseals exist.',
    '[00:00:35] Audience Q&A: Does that apply to multi-agent DAOs operating across international maritime borders?',
    '[00:00:48] Prof. Sterling: Exactly. That is where slide 14 constitutional anchors come into play.'
  ]);

  // Dynamic VU meter bounces & Auto-Director switching simulation
  useEffect(() => {
    const vuInterval = setInterval(() => {
      setCameraStreams(prev => prev.map(cam => ({
        ...cam,
        vuLevel: Math.floor(Math.random() * 65) + (cam.id === activeCamId ? 30 : 10)
      })));
    }, 200);

    return () => clearInterval(vuInterval);
  }, [activeCamId]);

  // Auto-Director speaker alternation simulation when enabled
  useEffect(() => {
    if (!isAutoDirectorActive) return;
    const switchInterval = setInterval(() => {
      const cams = ['cam-1', 'cam-2', 'cam-4'];
      const nextCam = cams[Math.floor(Math.random() * cams.length)];
      setActiveCamId(nextCam);
      setCameraStreams(prev => prev.map(c => ({
        ...c,
        isActiveSpeaker: c.id === nextCam
      })));
    }, 4500);

    return () => clearInterval(switchInterval);
  }, [isAutoDirectorActive]);

  // Recording Timer
  useEffect(() => {
    let timer: any;
    if (isRecording) {
      timer = setInterval(() => {
        setRecordingSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // AI Actions
  const handleGenerateSummary = () => {
    setToastMessage('Generated Yale Law Executive Summary & Saved to Vault');
    onSaveToVault?.({
      type: 'document',
      title: 'OmniYale - Lecture Executive Summary',
      thumbnail: cameraStreams[0].poster,
      tags: ['OmniYale Studio', 'Executive Summary', 'Yale Law 102'],
      details: `Lecture Transcript Summary:\n- Analyzed recursive neural governance\n- Verified strict algorithmic liability\n- Mapped slide 14 constitutional anchors`
    });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleExtractShorts = () => {
    setToastMessage('AI Clip Extractor: 3 Viral Shorts Clamped from Speaker Peaks');
    onSaveToVault?.({
      type: 'video',
      title: 'OmniYale - 9:16 Viral Lecture Short (Dr. Vance Highlight)',
      thumbnail: cameraStreams[1].poster,
      tags: ['OmniYale Studio', 'Shorts Clip', 'Vertical Reel', 'Auto-Framed'],
      details: 'Extracted with OmniYale Auto-Director voice cadence detection.'
    });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handlePublishPodcast = () => {
    setToastMessage('Syndicated Broadcast to Spotify & Apple Podcasts RSS feed!');
    onSaveToVault?.({
      type: 'audio',
      title: 'OmniYale Podcast Episode #42 - Algorithmic Governance',
      thumbnail: cameraStreams[0].poster,
      tags: ['OmniYale Studio', 'Podcast RSS', 'Spotify', 'Apple Podcasts'],
      details: 'Master audio feed processed with 4-mic balance and studio limiter.'
    });
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div 
      className="w-full max-w-[400px] h-[850px] mx-auto overflow-hidden relative flex flex-col justify-between bg-black text-white font-sans select-none"
      style={{ boxSizing: 'border-box' }}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 z-50 px-3 py-1.5 rounded-full bg-[#131024]/95 border border-[#00ffcc]/60 text-[#00ffcc] text-[10.5px] font-mono shadow-2xl backdrop-blur-md animate-in fade-in flex items-center gap-1.5 max-w-[92%] truncate">
          <Sparkles className="w-3 h-3 text-[#00ffcc] shrink-0" />
          <span className="truncate">{toastMessage}</span>
        </div>
      )}

      {/* HEADER */}
      <div className="h-12 px-4 bg-[#131024] border-b border-zinc-900 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Tv className="w-4 h-4 text-[#00ffcc]" />
          <h1 className="font-bold text-xs tracking-wider uppercase text-white font-mono">
            OmniYale Studio
          </h1>
        </div>

        <div className="flex items-center gap-2">
          {isRecording && (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 text-[9.5px] font-mono animate-pulse">
              <CircleDot className="w-2.5 h-2.5 fill-red-500" />
              <span>REC {formatTimer(recordingSeconds)}</span>
            </div>
          )}

          <button
            onClick={() => {
              onSaveToVault?.({
                type: 'broadcast',
                title: `OmniYale Broadcast Session - ${formatTimer(recordingSeconds)}`,
                thumbnail: cameraStreams[0].poster,
                tags: ['OmniYale Studio', 'Broadcast Master', 'Multi-Cam'],
                details: transcriptLines.join('\n')
              });
              setToastMessage('Session saved to Omni Vault!');
              setTimeout(() => setToastMessage(null), 2500);
            }}
            className="px-2 py-0.5 rounded-md bg-[#00ffcc] text-slate-950 font-bold text-[9.5px] font-mono flex items-center gap-1 active:scale-95 transition"
            title="Save Broadcast Session to Vault"
          >
            <FolderLock className="w-2.5 h-2.5" />
            <span>Vault</span>
          </button>
        </div>
      </div>

      {/* ZONE 1 (Top 45% - Multi-Cam Live Viewport) */}
      <div className="w-full h-[45%] relative bg-[#0b0816] overflow-hidden border-b border-zinc-900 flex flex-col justify-between">
        
        {/* Glowing Center-Top Live Broadcast Badge */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 px-2.5 py-0.5 rounded-full bg-black/85 backdrop-blur-md border border-[#00ffcc]/50 text-[#00ffcc] text-[9.5px] font-mono font-bold tracking-wider flex items-center gap-1.5 shadow-[0_0_12px_rgba(0,255,204,0.3)]">
          <span className="w-2 h-2 rounded-full bg-[#00ffcc] animate-ping" />
          <span>● LIVE BROADCAST</span>
          {isAutoDirectorActive && (
            <span className="text-[7.5px] px-1 rounded bg-[#00ffcc]/20 text-white ml-0.5 uppercase">Auto</span>
          )}
        </div>

        {/* 4-Window Compact Grid Layout (grid grid-cols-2 grid-rows-2 gap-1 p-2) */}
        <div className="w-full h-full grid grid-cols-2 grid-rows-2 gap-1 p-2 pt-8">
          {cameraStreams.map((cam) => {
            const isSelected = activeCamId === cam.id;
            return (
              <div
                key={cam.id}
                onClick={() => {
                  setActiveCamId(cam.id);
                  setCameraStreams(prev => prev.map(c => ({
                    ...c,
                    isActiveSpeaker: c.id === cam.id
                  })));
                }}
                className={`relative rounded-xl overflow-hidden bg-black cursor-pointer transition-all border ${
                  isSelected 
                    ? 'border-[#00ffcc] ring-2 ring-[#00ffcc]/40 shadow-[0_0_12px_rgba(0,255,204,0.25)]' 
                    : 'border-zinc-800 hover:border-zinc-700 opacity-90'
                }`}
              >
                {/* Video Feed Poster */}
                <img 
                  src={cam.poster} 
                  alt={cam.name} 
                  className="w-full h-full object-cover" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

                {/* Miniature Bouncing VU Audio Level Meter in Upper Corner */}
                <div className="absolute top-1.5 right-1.5 z-20 flex items-end gap-0.5 h-3.5 bg-black/70 px-1 py-0.5 rounded border border-white/10 backdrop-blur-sm">
                  {[20, 45, 75, 95].map((threshold, barIdx) => {
                    const isLit = cam.vuLevel >= threshold;
                    return (
                      <div
                        key={barIdx}
                        className={`w-1 rounded-sm transition-all duration-100 ${
                          isLit 
                            ? barIdx === 3 ? 'bg-red-400 h-3' : barIdx === 2 ? 'bg-amber-400 h-2.5' : 'bg-[#00ffcc] h-2'
                            : 'bg-zinc-800 h-1'
                        }`}
                      />
                    );
                  })}
                </div>

                {/* Camera Name & Status */}
                <div className="absolute bottom-1 left-1.5 right-1.5 flex items-center justify-between text-[8px] font-mono">
                  <div className="truncate min-w-0 pr-1">
                    <span className="text-white font-bold block truncate">{cam.name}</span>
                    <span className="text-[#00ffcc] text-[7px] truncate">{cam.role}</span>
                  </div>
                  {isSelected && (
                    <span className="px-1 rounded bg-[#00ffcc] text-slate-950 font-bold text-[7.5px] shrink-0">
                      LIVE
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Slide Injection Overlay when [Inject Slides] is active */}
        {isSlidesInjected && (
          <div className="absolute bottom-2 right-2 w-32 h-20 rounded-xl overflow-hidden border border-[#00ffcc] shadow-2xl bg-black z-30 animate-in zoom-in-95">
            <img 
              src="https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&q=80" 
              alt="Slide Deck" 
              className="w-full h-full object-cover" 
            />
            <div className="absolute top-1 left-1 px-1 py-0.2 rounded bg-black/80 text-[#00ffcc] text-[7px] font-mono font-bold">
              SLIDE DECK INJECTED
            </div>
          </div>
        )}
      </div>

      {/* ZONE 2 (Middle 15% - Live Production Switcher) */}
      <div className="w-full h-[15%] flex items-center gap-3 px-4 bg-[#131024] overflow-x-auto whitespace-nowrap scrollbar-hide border-b border-zinc-900 select-none">
        
        {/* 1. [Auto-Director] */}
        <button
          onClick={() => {
            setIsAutoDirectorActive(!isAutoDirectorActive);
            setToastMessage(`Auto-Director ${!isAutoDirectorActive ? 'Activated' : 'Paused'}`);
            setTimeout(() => setToastMessage(null), 1500);
          }}
          className={`flex flex-col items-center justify-center min-w-[76px] h-14 rounded-xl px-2.5 transition active:scale-95 border ${
            isAutoDirectorActive 
              ? 'bg-[#00ffcc]/20 border-[#00ffcc] text-[#00ffcc] shadow-[0_0_10px_rgba(0,255,204,0.3)]' 
              : 'bg-black/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
          }`}
          title="Voice-Triggered Automated Camera Switching"
        >
          <Radio className="w-4 h-4 mb-1" />
          <span className="text-[9px] font-mono font-bold">Auto-Director</span>
          <span className="text-[7px] text-[#00ffcc]">{isAutoDirectorActive ? 'ACTIVE' : 'OFF'}</span>
        </button>

        {/* 2. [Inject Slides] */}
        <button
          onClick={() => {
            setIsSlidesInjected(!isSlidesInjected);
            setToastMessage(`Slide Deck ${!isSlidesInjected ? 'Overlaid on Feed' : 'Hidden'}`);
            setTimeout(() => setToastMessage(null), 1500);
          }}
          className={`flex flex-col items-center justify-center min-w-[76px] h-14 rounded-xl px-2.5 transition active:scale-95 border ${
            isSlidesInjected 
              ? 'bg-[#00ffcc]/20 border-[#00ffcc] text-[#00ffcc] shadow-[0_0_10px_rgba(0,255,204,0.3)]' 
              : 'bg-black/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
          }`}
          title="Overlay Presentation Deck Graphics Directly onto Video"
        >
          <Presentation className="w-4 h-4 mb-1" />
          <span className="text-[9px] font-mono font-bold">Inject Slides</span>
          <span className="text-[7px] text-[#00ffcc]">{isSlidesInjected ? 'ON FEED' : 'OFF'}</span>
        </button>

        {/* 3. [AI Teleprompter] */}
        <button
          onClick={() => setShowTeleprompter(!showTeleprompter)}
          className={`flex flex-col items-center justify-center min-w-[76px] h-14 rounded-xl px-2.5 transition active:scale-95 border ${
            showTeleprompter 
              ? 'bg-[#00ffcc]/20 border-[#00ffcc] text-[#00ffcc] shadow-[0_0_10px_rgba(0,255,204,0.3)]' 
              : 'bg-black/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
          }`}
          title="Display Presentation Script Synced to Voice Cadence"
        >
          <FileText className="w-4 h-4 mb-1" />
          <span className="text-[9px] font-mono font-bold">Teleprompter</span>
          <span className="text-[7px] text-[#00ffcc]">VOICE SYNC</span>
        </button>

        {/* 4. [Multi-Mic Matrix] */}
        <button
          onClick={() => setShowMultiMicMatrix(!showMultiMicMatrix)}
          className={`flex flex-col items-center justify-center min-w-[76px] h-14 rounded-xl px-2.5 transition active:scale-95 border ${
            showMultiMicMatrix 
              ? 'bg-[#00ffcc]/20 border-[#00ffcc] text-[#00ffcc] shadow-[0_0_10px_rgba(0,255,204,0.3)]' 
              : 'bg-black/60 border-zinc-800 text-zinc-400 hover:border-zinc-700'
          }`}
          title="Open Individual Track Mic Gain Adjustments"
        >
          <Sliders className="w-4 h-4 mb-1" />
          <span className="text-[9px] font-mono font-bold">Mic Matrix</span>
          <span className="text-[7px] text-[#00ffcc]">4 CHANNELS</span>
        </button>

      </div>

      {/* Teleprompter Modal Drawer */}
      {showTeleprompter && (
        <div className="absolute top-12 left-2 right-2 z-40 bg-[#131024] border border-[#00ffcc]/40 rounded-2xl p-3 shadow-2xl animate-in fade-in zoom-in-95 font-mono">
          <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800 mb-2">
            <span className="text-[10px] font-bold text-[#00ffcc] flex items-center gap-1">
              <FileText className="w-3 h-3" />
              AI VOICE-CADENCE TELEPROMPTER
            </span>
            <button onClick={() => setShowTeleprompter(false)} className="text-zinc-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="h-28 overflow-y-auto text-xs text-white leading-relaxed p-2 bg-black/60 rounded-xl border border-zinc-800">
            {teleprompterScript}
          </div>
        </div>
      )}

      {/* Multi-Mic Matrix Drawer */}
      {showMultiMicMatrix && (
        <div className="absolute top-12 left-2 right-2 z-40 bg-[#131024] border border-[#00ffcc]/40 rounded-2xl p-3 shadow-2xl animate-in fade-in zoom-in-95 font-mono">
          <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800 mb-2">
            <span className="text-[10px] font-bold text-[#00ffcc] flex items-center gap-1">
              <Sliders className="w-3 h-3" />
              MULTI-MIC MATRIX (INDIVIDUAL GAINS)
            </span>
            <button onClick={() => setShowMultiMicMatrix(false)} className="text-zinc-400 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-2">
            {cameraStreams.map(cam => (
              <div key={cam.id} className="flex items-center justify-between text-[10px]">
                <span className="text-zinc-300 truncate w-32">{cam.name}</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={micGains[cam.id] || 75}
                  onChange={(e) => setMicGains({ ...micGains, [cam.id]: Number(e.target.value) })}
                  className="w-24 h-1 bg-black rounded-lg appearance-none cursor-pointer accent-[#00ffcc]"
                />
                <span className="text-[#00ffcc] font-bold w-8 text-right">{micGains[cam.id]}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ZONE 3 (Bottom 40% - Transcript & Broadcast Controls) */}
      <div className="w-full h-[40%] bg-black p-4 flex flex-col justify-between overflow-y-auto">
        
        {/* Real-time scrolling transcription block */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] font-mono">
            <span className="text-zinc-400 font-bold uppercase flex items-center gap-1">
              <Mic className="w-3 h-3 text-[#00ffcc]" />
              REAL-TIME LECTURE TRANSCRIPTION
            </span>
            <span className="text-[#00ffcc] text-[9px] animate-pulse">● Auto-Syncing</span>
          </div>

          <div className="h-[100px] text-xs text-zinc-300 overflow-y-auto bg-zinc-950 p-2 rounded-lg border border-zinc-800 font-mono space-y-1.5 select-text">
            {transcriptLines.map((line, idx) => (
              <p key={idx} className="leading-snug">
                <span className="text-[#00ffcc] font-bold">{line.split(':')[0]}:</span>
                <span className="text-zinc-300">{line.substring(line.indexOf(':') + 1)}</span>
              </p>
            ))}
          </div>
        </div>

        {/* AI Tools Quick Actions Layout */}
        <div className="grid grid-cols-3 gap-1.5 my-2 font-mono">
          <button
            onClick={handleGenerateSummary}
            className="p-1.5 rounded-xl bg-[#131024] border border-zinc-800 hover:border-[#00ffcc]/60 text-[9px] text-white flex flex-col items-center justify-center gap-1 active:scale-95 transition"
            title="Generate AI Executive Summary"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#00ffcc]" />
            <span className="text-center font-bold">AI Summary</span>
          </button>

          <button
            onClick={handleExtractShorts}
            className="p-1.5 rounded-xl bg-[#131024] border border-zinc-800 hover:border-[#00ffcc]/60 text-[9px] text-white flex flex-col items-center justify-center gap-1 active:scale-95 transition"
            title="Extract 9:16 Shorts Clips"
          >
            <Scissors className="w-3.5 h-3.5 text-cyan-300" />
            <span className="text-center font-bold">Shorts Clips</span>
          </button>

          <button
            onClick={handlePublishPodcast}
            className="p-1.5 rounded-xl bg-[#131024] border border-zinc-800 hover:border-[#00ffcc]/60 text-[9px] text-white flex flex-col items-center justify-center gap-1 active:scale-95 transition"
            title="Publish to Spotify & Apple Podcasts"
          >
            <Podcast className="w-3.5 h-3.5 text-fuchsia-400" />
            <span className="text-center font-bold">Spotify/Apple</span>
          </button>
        </div>

        {/* Master Execution Call: Large full-width button anchored to lowest margin */}
        <button
          onClick={() => {
            if (isRecording) {
              setIsRecording(false);
              setToastMessage(`Broadcast recording stopped (${formatTimer(recordingSeconds)}).`);
            } else {
              setIsRecording(true);
              setRecordingSeconds(0);
              setToastMessage('Recording session started! Multi-cam streams encoding in UHD.');
            }
          }}
          className={`w-full py-3.5 rounded-xl font-black font-mono text-xs tracking-wider uppercase shadow-lg active:scale-98 transition flex items-center justify-center gap-2 ${
            isRecording 
              ? 'bg-red-500 hover:bg-red-400 text-white shadow-red-500/30' 
              : 'bg-[#00ffcc] hover:bg-[#1affd4] text-slate-950 shadow-[#00ffcc]/20'
          }`}
        >
          <CircleDot className={`w-4 h-4 ${isRecording ? 'animate-ping' : ''}`} />
          <span>{isRecording ? 'Stop Recording Session' : 'Start Recording Session'}</span>
        </button>

      </div>

    </div>
  );
};
