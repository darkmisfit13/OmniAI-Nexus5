import React, { useState } from 'react';
import { 
  Zap, 
  Workflow, 
  Sparkles, 
  Play, 
  Plus, 
  ArrowDown, 
  CheckCircle2, 
  Smartphone, 
  Cpu, 
  Layers, 
  Radio, 
  RefreshCw, 
  Code, 
  Check, 
  SlidersHorizontal,
  Bot
} from 'lucide-react';
import { HoloOrb, OrbPhase } from '../HoloOrb';

interface WorkflowNode {
  id: string;
  type: 'trigger' | 'ai_model' | 'action' | 'device';
  title: string;
  subtitle: string;
  status: 'active' | 'idle' | 'running';
  color: string; // Accent color hex from 5-color matrix
  icon: any;
  metric?: string;
  codeSnippet?: string;
}

export const OmniAutomationsStudio: React.FC = () => {
  const [orbPhase, setOrbPhase] = useState<OrbPhase>('idle');
  const [aiFlowPrompt, setAiFlowPrompt] = useState('Create real-time WhatsApp triage pipeline routing high-intent questions to Council Engine and broadcasting summaries to Slack');
  const [isExecutingMaster, setIsExecutingMaster] = useState(false);
  const [masterExecutionLog, setMasterExecutionLog] = useState<string | null>(null);

  // Vertical node tree workflow blocks
  const [nodes, setNodes] = useState<WorkflowNode[]>([
    {
      id: 'node-1',
      type: 'trigger',
      title: 'Incoming Inbound Webhook (Twilio / WhatsApp)',
      subtitle: 'Triggers on incoming customer voice/text event in real-time',
      status: 'active',
      color: '#00ff99', // Mint Green
      icon: Radio,
      metric: 'Latency: 12ms',
      codeSnippet: 'POST /api/webhooks/inbound -> payload.message',
    },
    {
      id: 'node-2',
      type: 'ai_model',
      title: 'OmniAI Intent Recognition & Persona Filter',
      subtitle: 'Extracts customer sentiment, urgency level, and intent classification',
      status: 'active',
      color: '#8b5cf6', // Electric Violet
      icon: Cpu,
      metric: 'Intent: 98.4% Confidence',
      codeSnippet: 'gemini-3.8-flash.classifyIntent(text)',
    },
    {
      id: 'node-3',
      type: 'ai_model',
      title: 'Council Engine Multi-Proxy Deliberation',
      subtitle: 'Routes simultaneous prompts to 30+ LLMs & deciphers contradictions',
      status: 'active',
      color: '#00e5ff', // Vibrant Cyan
      icon: Sparkles,
      metric: '6 Models Consulted • 94% Quorum',
      codeSnippet: 'await council.deliberate({ quorum: 0.85 })',
    },
    {
      id: 'node-4',
      type: 'action',
      title: 'Dynamic Safe Zone Viral Mockup Generator',
      subtitle: 'Formats response summary into 9:16 vertical video with auto-subtitles',
      status: 'active',
      color: '#ff007f', // Hot Magenta Pink
      icon: Layers,
      metric: 'Render: 1.2s',
      codeSnippet: 'omniMockup.render({ platform: "TikTok" })',
    },
    {
      id: 'node-5',
      type: 'device',
      title: 'Mobile Host Target: Keyboard Auto-Dispatch',
      subtitle: 'Injects generated response into active draft on Android / iOS',
      status: 'active',
      color: '#a78bfa', // Deep Lavender
      icon: Smartphone,
      metric: 'Auto-Dispatched: 48 units today',
      codeSnippet: 'omniKeyboardBridge.insertText(response)',
    },
  ]);

  const handleGenerateAiFlow = () => {
    if (!aiFlowPrompt.trim()) return;
    setOrbPhase('thinking');
    setMasterExecutionLog('Generating autonomous workflow nodes from prompt...');

    setTimeout(() => {
      setOrbPhase('idle');
      setMasterExecutionLog('New AI workflow generated and injected into node execution tree.');
      setTimeout(() => setMasterExecutionLog(null), 3000);
    }, 1200);
  };

  const handleExecuteMasterScript = () => {
    setIsExecutingMaster(true);
    setOrbPhase('thinking');
    setMasterExecutionLog('Master script executing: Running active triggers across all 5 nodes...');

    let current = 0;
    const interval = setInterval(() => {
      if (current < nodes.length) {
        setNodes((prev) =>
          prev.map((n, i) => ({
            ...n,
            status: i === current ? 'running' : i < current ? 'active' : 'idle',
          }))
        );
        current++;
      } else {
        clearInterval(interval);
        setIsExecutingMaster(false);
        setOrbPhase('idle');
        setMasterExecutionLog('All 5 workflow nodes executed successfully. Pipeline synchronized with Cloud.');
        setTimeout(() => setMasterExecutionLog(null), 3500);
        setNodes((prev) => prev.map((n) => ({ ...n, status: 'active' })));
      }
    }, 700);
  };

  return (
    <div className="h-full flex flex-col bg-black text-[#e8e6f2] overflow-hidden font-sans select-none">
      
      {/* Studio Header */}
      <div className="h-10 px-3 bg-[#08060c] border-b border-[#181524] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Workflow className="w-3.5 h-3.5 text-[#00ff99]" />
          <h1 className="font-bold text-[11px] tracking-wider uppercase text-white font-mono">
            AI Automations Studio
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[8.5px] font-mono px-2 py-0.5 rounded-full bg-[#00ff99]/15 text-[#00ff99] border border-[#00ff99]/40 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00ff99] animate-ping" />
            5 Nodes Active
          </span>
        </div>
      </div>

      {/* AI FLOW TEXT GENERATOR PROMPT & MASTER EXECUTION BAR */}
      <div className="p-2.5 bg-[#08060c] border-b border-[#181524] shrink-0 space-y-2">
        <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
          <span className="font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#ff007f]" />
            AI Flow Text Generator Prompt:
          </span>
          <span className="text-[#00e5ff] text-[9px]">Autonomous Orchestration</span>
        </div>

        <div className="flex items-center gap-1.5">
          <input
            type="text"
            value={aiFlowPrompt}
            onChange={(e) => setAiFlowPrompt(e.target.value)}
            placeholder="Describe an automation flow (e.g. 'Extract YouTube comments and post to Discord')..."
            className="flex-1 bg-black border border-[#181524] rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#00ff99] transition font-sans"
          />
          <button
            type="button"
            onClick={handleGenerateAiFlow}
            className="px-2.5 py-1.5 rounded-lg bg-black border border-[#00ff99] hover:bg-[#00ff99]/20 text-[#00ff99] text-[10px] font-mono font-bold transition shadow-[0_0_8px_rgba(0,255,153,0.3)] shrink-0 active:scale-95"
            title="Generate AI Flow Nodes"
          >
            Generate Flow
          </button>
        </div>

        {/* Master Script Execution Button */}
        <button
          type="button"
          onClick={handleExecuteMasterScript}
          disabled={isExecutingMaster}
          className="w-full py-2 rounded-lg bg-gradient-to-r from-[#00ff99] via-[#8b5cf6] to-[#00e5ff] text-black font-black font-mono text-xs uppercase tracking-wider shadow-lg shadow-[#00ff99]/20 hover:brightness-110 active:scale-98 transition flex items-center justify-center gap-2"
        >
          {isExecutingMaster ? (
            <RefreshCw className="w-3.5 h-3.5 text-black animate-spin" />
          ) : (
            <Play className="w-3.5 h-3.5 text-black fill-current" />
          )}
          <span>{isExecutingMaster ? 'Executing Master Workflow...' : 'Master Script Execution (Trigger All)'}</span>
        </button>

        {masterExecutionLog && (
          <div className="p-1.5 rounded bg-black/90 border border-[#00ff99]/40 text-[#00ff99] font-mono text-[9.5px] truncate flex items-center gap-1.5 animate-in fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00ff99] animate-ping shrink-0" />
            <span className="truncate">{masterExecutionLog}</span>
          </div>
        )}
      </div>

      {/* VERTICAL-SCROLLING NODE WORKFLOW TREE TRACKER SCREEN */}
      <div className="flex-1 overflow-y-auto p-3 space-y-0 relative max-w-md mx-auto w-full">
        {nodes.map((node, index) => {
          const Icon = node.icon;
          const isLast = index === nodes.length - 1;
          const isNeonGreen = index % 2 === 0;

          return (
            <div key={node.id} className="relative flex flex-col items-center">
              
              {/* Compact Horizontal Card */}
              <div 
                className={`w-full rounded-xl p-3 transition-all relative z-10 bg-[#0d0c18] border ${
                  node.status === 'running' 
                    ? 'ring-2 ring-[#00ff99] shadow-[0_0_16px_rgba(0,255,153,0.5)]'
                    : 'hover:border-zinc-500'
                }`}
                style={{
                  borderColor: node.color,
                  boxShadow: `0 0 12px ${node.color}25`,
                }}
              >
                {/* Node Top Header */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-6 h-6 rounded-lg flex items-center justify-center text-black font-bold shadow-sm"
                      style={{ backgroundColor: node.color }}
                    >
                      <Icon className="w-3.5 h-3.5 text-black" />
                    </div>
                    <span 
                      className="text-[9px] font-mono uppercase tracking-wider font-bold"
                      style={{ color: node.color }}
                    >
                      Step {index + 1}: {node.type.toUpperCase()}
                    </span>
                  </div>

                  <span 
                    className={`text-[8.5px] font-mono px-2 py-0.5 rounded-full border ${
                      node.status === 'running'
                        ? 'bg-[#00ff99]/20 text-[#00ff99] border-[#00ff99] animate-pulse font-bold'
                        : 'bg-black text-zinc-300 border-zinc-800'
                    }`}
                  >
                    {node.status.toUpperCase()}
                  </span>
                </div>

                {/* Node Title & Subtitle */}
                <h4 className="text-xs font-bold text-white leading-tight">
                  {node.title}
                </h4>
                <p className="text-[10px] text-zinc-400 mt-0.5 leading-snug">
                  {node.subtitle}
                </p>

                {/* Metric & Code Snippet */}
                <div className="mt-2 pt-2 border-t border-[#181524] flex items-center justify-between text-[9px] font-mono text-zinc-400">
                  <span className="truncate text-zinc-300">
                    {node.codeSnippet}
                  </span>
                  <span 
                    className="font-bold shrink-0 ml-2"
                    style={{ color: node.color }}
                  >
                    {node.metric}
                  </span>
                </div>
              </div>

              {/* VERTICAL NEON GREEN OR VIOLET DASHED CONNECTOR LINE */}
              {!isLast && (
                <div className="w-full flex flex-col items-center my-1 relative z-0">
                  <div 
                    className="h-6 w-0.5 border-l-2 border-dashed transition-all"
                    style={{
                      borderColor: isNeonGreen ? '#00ff99' : '#8b5cf6',
                      filter: isNeonGreen 
                        ? 'drop-shadow(0 0 6px #00ff99)' 
                        : 'drop-shadow(0 0 6px #8b5cf6)',
                    }}
                  />
                  <ArrowDown 
                    className="w-3 h-3 -mt-1 transition-all"
                    style={{ color: isNeonGreen ? '#00ff99' : '#8b5cf6' }}
                  />
                </div>
              )}

            </div>
          );
        })}
      </div>

    </div>
  );
};
