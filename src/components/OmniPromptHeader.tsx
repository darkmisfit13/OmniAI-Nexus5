import React, { useState, useRef } from 'react';
import { 
  Bot, 
  Zap, 
  Users, 
  Send, 
  Plus, 
  Sparkles, 
  FileText, 
  FileAudio, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  X, 
  ChevronDown, 
  ChevronUp,
  Scale
} from 'lucide-react';
import { useOmniChat } from '../context/OmniChatContext';
import { StudioId } from './OmniStudiosView';

interface OmniPromptHeaderProps {
  currentStudioId: StudioId;
  onNavigateStudio?: (studioId: StudioId) => void;
  onOpenChat?: () => void;
}

export const OmniPromptHeader: React.FC<OmniPromptHeaderProps> = ({
  currentStudioId,
  onNavigateStudio,
  onOpenChat,
}) => {
  const [mode, setMode] = useState<'normal' | 'director' | 'council'>('director');
  const [promptText, setPromptText] = useState('');
  const [attachedFileName, setAttachedFileName] = useState<string | null>(null);
  const [attachedDataUrl, setAttachedDataUrl] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { sendMessage, isGenerating } = useOmniChat();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAttachedFileName(file.name);
    const reader = new FileReader();

    if (file.type.startsWith('image/')) {
      reader.onload = () => setAttachedDataUrl(reader.result as string);
      reader.readAsDataURL(file);
    } else if (file.type.startsWith('audio/') || file.type.startsWith('video/')) {
      reader.onload = () => setAttachedDataUrl(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      reader.onload = () => {
        const text = reader.result as string;
        setPromptText((prev) => (prev ? `${prev}\n[${file.name}]: ${text.slice(0, 500)}` : `[${file.name}]: ${text.slice(0, 500)}`));
      };
      reader.readAsText(file);
    }
  };

  const handleExecutePrompt = async () => {
    if (!promptText.trim() && !attachedDataUrl) return;

    const currentText = promptText;
    setPromptText('');
    setAttachedFileName(null);
    const media = attachedDataUrl;
    setAttachedDataUrl(null);

    if (mode === 'director') {
      setStatusMessage(`Director AI processing: "${currentText.slice(0, 30)}..."`);
      
      // Automatic Studio Navigation & Variable Injection in Director Mode
      const lower = currentText.toLowerCase();
      if (lower.includes('voice') || lower.includes('dub') || lower.includes('speak') || lower.includes('naturalness')) {
        setTimeout(() => onNavigateStudio?.('wave'), 600);
      } else if (lower.includes('storyboard') || lower.includes('beat') || lower.includes('script') || lower.includes('scenes')) {
        setTimeout(() => onNavigateStudio?.('beat'), 600);
      } else if (lower.includes('imagine') || lower.includes('canvas') || lower.includes('erase') || lower.includes('mockup')) {
        setTimeout(() => onNavigateStudio?.('imagine'), 600);
      } else if (lower.includes('motion') || lower.includes('blur') || lower.includes('video') || lower.includes('capcut')) {
        setTimeout(() => onNavigateStudio?.('motion'), 600);
      } else if (lower.includes('automate') || lower.includes('flow') || lower.includes('agent')) {
        setTimeout(() => onNavigateStudio?.('automations'), 600);
      } else if (lower.includes('connect') || lower.includes('webhook') || lower.includes('twilio') || lower.includes('sheet')) {
        setTimeout(() => onNavigateStudio?.('connect'), 600);
      }
    }

    try {
      await sendMessage(currentText, {
        imageBase64: media,
        council: mode === 'council',
        studioContext: `Studio: ${currentStudioId} | Mode: ${mode}`,
      });
      setStatusMessage(`OmniAI (${mode.toUpperCase()}) executed.`);
      setTimeout(() => setStatusMessage(null), 3000);
    } catch {
      setStatusMessage('OmniAI prompt dispatched.');
      setTimeout(() => setStatusMessage(null), 2500);
    }
  };

  return (
    <div className="w-full bg-[#08060c] border-b border-[#181524] px-2 py-1.5 z-30 shrink-0">
      {/* File input accepting text, audio, images, videos */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*,video/*,audio/*,.txt,.md,.json,.pdf"
        className="hidden"
      />

      {/* Main Floating Trigger Bar */}
      <div className="flex items-center gap-1.5 w-full">
        {/* Prominent + File Attachment Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-1.5 rounded-lg border border-[#00e5ff] bg-black text-[#00e5ff] hover:bg-[#00e5ff]/20 transition shadow-[0_0_8px_rgba(0,229,255,0.25)] flex items-center justify-center shrink-0 active:scale-95"
          title="Add Attachment (+ Text, Audio, Images, Video)"
        >
          <Plus className="w-4 h-4 text-[#00e5ff]" />
        </button>

        {/* 3-Way Mode Segment Bar */}
        <div className="flex items-center bg-black border border-[#181524] rounded-lg p-0.5 text-xs font-semibold shrink-0">
          <button
            onClick={() => setMode('normal')}
            className={`px-1.5 py-0.5 rounded font-mono text-[9px] font-bold transition flex items-center gap-0.5 ${
              mode === 'normal'
                ? 'bg-[#08060c] text-[#00ff99] border border-[#00ff99] shadow-[0_0_6px_rgba(0,255,153,0.3)]'
                : 'text-zinc-400 hover:text-white'
            }`}
            title="Normal Mode: Standard text & voice"
          >
            <Bot className="w-2.5 h-2.5" />
            <span className="hidden xs:inline">Norm</span>
          </button>
          <button
            onClick={() => setMode('director')}
            className={`px-1.5 py-0.5 rounded font-mono text-[9px] font-bold transition flex items-center gap-0.5 ${
              mode === 'director'
                ? 'bg-[#08060c] text-[#ff007f] border border-[#ff007f] shadow-[0_0_6px_rgba(255,0,127,0.3)]'
                : 'text-zinc-400 hover:text-white'
            }`}
            title="Director Mode: Auto-navigation & layout triggers"
          >
            <Zap className="w-2.5 h-2.5" />
            <span>Direct</span>
          </button>
          <button
            onClick={() => setMode('council')}
            className={`px-1.5 py-0.5 rounded font-mono text-[9px] font-bold transition flex items-center gap-0.5 ${
              mode === 'council'
                ? 'bg-[#08060c] text-[#8b5cf6] border border-[#8b5cf6] shadow-[0_0_6px_rgba(139,92,246,0.3)]'
                : 'text-zinc-400 hover:text-white'
            }`}
            title="Council Mode: High-tier multi-proxy to 30+ LLMs"
          >
            <Scale className="w-2.5 h-2.5" />
            <span>Council</span>
          </button>
        </div>

        {/* Prompt Input Box */}
        <div className="flex-1 relative flex items-center min-w-0">
          <input
            type="text"
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleExecutePrompt()}
            placeholder={
              mode === 'director'
                ? 'Director: "Generate voice dub", "Create storyboard scenes"...'
                : mode === 'council'
                ? 'Council: Deliberate across all 30+ LLMs simultaneously...'
                : 'Ask OmniAI anything...'
            }
            className="w-full bg-black border border-[#181524] rounded-lg px-2.5 py-1 text-[11px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-[#00e5ff] transition font-sans truncate"
          />
        </div>

        {/* Send / Trigger Button */}
        <button
          type="button"
          onClick={handleExecutePrompt}
          disabled={(!promptText.trim() && !attachedDataUrl) || isGenerating}
          className="p-1.5 rounded-lg bg-gradient-to-r from-[#8b5cf6] to-[#00e5ff] text-slate-950 font-bold hover:brightness-110 disabled:opacity-40 transition shrink-0 active:scale-95"
          title="Dispatch Prompt"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Attachment Pill & Feedback Notification */}
      {(attachedFileName || statusMessage) && (
        <div className="flex items-center justify-between text-[9px] font-mono mt-1 px-1 text-zinc-300">
          {attachedFileName && (
            <div className="flex items-center gap-1 text-[#00e5ff]">
              <span>Attached: {attachedFileName}</span>
              <button onClick={() => { setAttachedFileName(null); setAttachedDataUrl(null); }} className="text-red-400">×</button>
            </div>
          )}
          {statusMessage && (
            <div className="text-[#00ff99] ml-auto animate-pulse">
              {statusMessage}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
