import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  Video, 
  VideoOff, 
  RefreshCw, 
  Sparkles, 
  ShieldCheck, 
  Check, 
  Copy, 
  Send,
  Zap,
  Activity,
  User,
  Flame,
  Database
} from 'lucide-react';
import { HoloOrb } from './HoloOrb';

interface ScreenVisionHUDProps {
  stream: MediaStream | null;
  isStreaming: boolean;
  onStartStreaming: () => void;
  onStopStreaming: () => void;
  onManualScan: () => void;
  isAnalyzing: boolean;
  analysisData: any;
  onApplyReply: (replyText: string) => void;
  activeScreenName: string;
}

export const ScreenVisionHUD: React.FC<ScreenVisionHUDProps> = ({
  stream,
  isStreaming,
  onStartStreaming,
  onStopStreaming,
  onManualScan,
  isAnalyzing,
  analysisData,
  onApplyReply,
  activeScreenName,
}) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const handleCopyReply = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="flex flex-col h-full space-y-3.5 p-3.5 overflow-y-auto bg-black font-mono">
      {/* 1. VISION ENGINE HEADER */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-[#14121f] border border-[#211d34] shadow-[0_0_25px_rgba(0,0,0,0.8)]">
        <div className="flex items-center gap-2.5">
          <HoloOrb phase={isStreaming ? 'observing' : isAnalyzing ? 'analyzing' : 'idle'} size="sm" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-bold font-mono tracking-wider text-[#e8e6f2]">SYSTEM-WIDE COGNITION</h2>
              <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold flex items-center gap-1 ${
                isStreaming
                  ? 'bg-[#00f0ff]/15 text-[#00f0ff] border border-[#00f0ff]/50 animate-pulse'
                  : 'bg-[#211d34] text-[#9490ac] border border-[#211d34]'
              }`}>
                {isStreaming ? '● VIEWPORT ACTIVE' : 'SIMULATED FEED'}
              </span>
            </div>
            <p className="text-[10px] text-[#9490ac] font-mono">
              Active Context: <strong className="text-[#e8e6f2]">{activeScreenName}</strong>
            </p>
          </div>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-1.5">
          {isStreaming ? (
            <button
              onClick={onStopStreaming}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#0b0a14] border border-[#00f0ff]/40 text-[10px] font-mono text-[#00f0ff] hover:bg-[#14121f] transition"
            >
              <VideoOff className="w-3 h-3" />
              <span>Stop</span>
            </button>
          ) : (
            <button
              onClick={onStartStreaming}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-gradient-to-r from-[#6c63ff] to-[#00f0ff] text-[10px] font-mono font-bold text-black shadow-[0_0_12px_rgba(0,240,255,0.3)] transition active:scale-95"
            >
              <Video className="w-3 h-3" />
              <span>Share Viewport</span>
            </button>
          )}

          <button
            onClick={onManualScan}
            disabled={isAnalyzing}
            className="p-1.5 rounded-xl bg-[#0b0a14] border border-[#211d34] text-[#9490ac] hover:text-[#00f0ff] transition disabled:opacity-40"
            title="Scan Viewport Now"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin text-[#00f0ff]' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. REAL SCREEN DISPLAY (if streaming) */}
      {isStreaming && (
        <div className="relative rounded-2xl overflow-hidden border border-[#00f0ff]/40 shadow-2xl bg-black aspect-video flex items-center justify-center group">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-contain"
          />
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0b0a14]/85 border border-[#00f0ff]/50 backdrop-blur-md text-[10px] font-mono text-[#00f0ff]">
            <Activity className="w-3.5 h-3.5 animate-pulse text-[#00f0ff]" />
            <span>Scanning Active Window Live</span>
          </div>
        </div>
      )}

      {/* 3. DOSSIER & EMOTIONAL SUBTEXT */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2.5 rounded-xl bg-[#14121f] border border-[#211d34]">
          <span className="text-[9px] font-mono text-[#00f0ff] block mb-0.5">COUNTERPART DOSSIER</span>
          <p className="text-xs font-semibold text-[#e8e6f2] truncate">
            {analysisData?.counterpartDossier || 'Active Participant'}
          </p>
        </div>

        <div className="p-2.5 rounded-xl bg-[#14121f] border border-[#211d34]">
          <span className="text-[9px] font-mono text-[#9490ac] block mb-0.5">PSYCHOLOGICAL REGISTER</span>
          <p className="text-xs font-semibold text-[#e8e6f2] truncate">
            {analysisData?.emotionalRegister || 'Raw & Unflinching'}
          </p>
        </div>
      </div>

      {/* 4. TACTICAL RULES */}
      <div className="p-3.5 rounded-2xl bg-[#14121f] border border-[#211d34] space-y-2">
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#9490ac] flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-[#00f0ff]" />
          DarkMisfit Tactical Directives
        </span>

        <div className="space-y-1.5">
          {(analysisData?.tacticalAdvice || [
            'Lead with the exact timestamp. Under pressure, words look like excuses.',
            'Acknowledge the client risk without getting defensive.',
            'Confirm the build directly into the host conversation.'
          ]).map((tip: string, idx: number) => (
            <div
              key={idx}
              className="flex items-start gap-2 p-2 rounded-xl bg-[#0b0a14] border border-[#211d34] text-xs text-[#e8e6f2] font-mono text-[11px]"
            >
              <span className="w-4 h-4 rounded-full bg-[#00f0ff]/15 text-[#00f0ff] border border-[#00f0ff]/40 flex items-center justify-center font-bold text-[9px] shrink-0 mt-0.5">
                {idx + 1}
              </span>
              <span>{tip}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 5. PREDICTIVE RESPONSE TIERS */}
      <div className="p-3.5 rounded-2xl bg-[#14121f] border border-[#211d34] space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#00f0ff] flex items-center gap-1.5">
            <Send className="w-3.5 h-3.5 text-[#00f0ff]" />
            Predictive Response Tiers
          </span>
          <span className="text-[9px] font-mono text-[#9490ac]">Tap to load into keyboard</span>
        </div>

        <div className="space-y-2">
          {(analysisData?.suggestedReplies || []).map((reply: string, idx: number) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2.5 rounded-xl bg-[#0b0a14] border border-[#211d34] hover:border-[#00f0ff]/50 transition group"
            >
              <p className="text-xs text-[#e8e6f2] pr-2 leading-relaxed flex-1 font-mono text-[11px]">
                {reply}
              </p>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => handleCopyReply(reply, idx)}
                  className="p-1.5 rounded-lg bg-[#14121f] border border-[#211d34] text-[#9490ac] hover:text-[#e8e6f2] transition"
                  title="Copy to clipboard"
                >
                  {copiedIdx === idx ? <Check className="w-3 h-3 text-[#00f0ff]" /> : <Copy className="w-3 h-3" />}
                </button>

                <button
                  onClick={() => onApplyReply(reply)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#00f0ff]/15 border border-[#00f0ff]/50 text-[#00f0ff] text-xs font-mono font-bold hover:bg-[#00f0ff]/25 transition active:scale-95"
                  title="Insert into active keyboard"
                >
                  <span>Use</span>
                  <Send className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
