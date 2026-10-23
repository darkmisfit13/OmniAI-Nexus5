import React, { useState } from 'react';
import { 
  Search, 
  Sparkles, 
  TrendingUp, 
  MessageSquare, 
  Activity, 
  Globe, 
  Share2, 
  Award, 
  RefreshCw, 
  Filter,
  CheckCircle2,
  Heart,
  Smile,
  AlertCircle
} from 'lucide-react';
import { HoloOrb, OrbPhase } from '../HoloOrb';

interface ListeningComment {
  id: string;
  network: 'TikTok' | 'Instagram Reels' | 'YouTube Shorts' | 'X/Twitter' | 'Facebook' | 'LinkedIn' | 'Reddit' | 'Google Reviews';
  author: string;
  avatar: string;
  text: string;
  sentiment: 'positive' | 'neutral' | 'critical';
  timestamp: string;
  engagement: string;
  accent: string;
}

export const OmniAnalyzerStudio: React.FC = () => {
  const [orbPhase, setOrbPhase] = useState<OrbPhase>('idle');
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [isAuditing, setIsAuditing] = useState(false);

  // Live universal listening comments stream
  const [listeningStream, setListeningStream] = useState<ListeningComment[]>([
    {
      id: 'c-1',
      network: 'TikTok',
      author: '@cybervortex',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80',
      text: 'The 3D mechanical keystroke sound on this keyboard app is insane 🔥 Never typing on default iOS again.',
      sentiment: 'positive',
      timestamp: '2m ago',
      engagement: '2.4K likes',
      accent: '#00ff99', // Mint
    },
    {
      id: 'c-2',
      network: 'Instagram Reels',
      author: '@nocturnal_studio',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
      text: 'Using OmniMotion to export 9:16 safe-zone compliant videos cut our editing time by 80%. Game changer.',
      sentiment: 'positive',
      timestamp: '5m ago',
      engagement: '890 likes',
      accent: '#ff007f', // Magenta
    },
    {
      id: 'c-3',
      network: 'YouTube Shorts',
      author: '@tech_disrupt',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&q=80',
      text: 'Council mode running 30+ LLMs at once gave the only accurate breakdown on our zero-knowledge rollup question.',
      sentiment: 'positive',
      timestamp: '11m ago',
      engagement: '4.1K views',
      accent: '#00e5ff', // Cyan
    },
    {
      id: 'c-4',
      network: 'X/Twitter',
      author: '@darkmisfit_fan',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&q=80',
      text: 'The nocturnal cyberpunk aesthetic of @darkmisfitstudios is what modern AI should look like.',
      sentiment: 'positive',
      timestamp: '18m ago',
      engagement: '342 reposts',
      accent: '#8b5cf6', // Violet
    },
    {
      id: 'c-5',
      network: 'Reddit',
      author: 'u/neural_architect',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&q=80',
      text: 'r/MachineLearning: Anyone benchmarked the on-device screen cognition lane vs cloud multimodal? Latency is sub-50ms.',
      sentiment: 'neutral',
      timestamp: '24m ago',
      engagement: '96 upvotes',
      accent: '#a78bfa', // Lavender
    },
    {
      id: 'c-6',
      network: 'Google Reviews',
      author: 'Elena Rostova',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
      text: '★★★★★ OmniAI is genuinely the first shadow companion that anticipates my next reply before I finish reading.',
      sentiment: 'positive',
      timestamp: '32m ago',
      engagement: 'Verified User',
      accent: '#00ff99', // Mint
    },
    {
      id: 'c-7',
      network: 'LinkedIn',
      author: 'Marcus Vance, CTO',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80',
      text: 'Deploying the Twilio and SIP Trunk bridges inside OmniConnect reduced our support response time by 4x.',
      sentiment: 'positive',
      timestamp: '45m ago',
      engagement: '18 comments',
      accent: '#00e5ff', // Cyan
    },
  ]);

  const handleRefreshStream = () => {
    setIsAuditing(true);
    setOrbPhase('thinking');
    setTimeout(() => {
      setIsAuditing(false);
      setOrbPhase('idle');
    }, 1000);
  };

  const filteredStream = activeFilter === 'All' 
    ? listeningStream 
    : listeningStream.filter(c => c.network.includes(activeFilter));

  return (
    <div className="h-full flex flex-col bg-black text-[#e8e6f2] overflow-hidden font-sans select-none">
      
      {/* Studio Header */}
      <div className="h-10 px-3 bg-[#08060c] border-b border-[#181524] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Search className="w-3.5 h-3.5 text-[#00e5ff]" />
          <h1 className="font-bold text-[11px] tracking-wider uppercase text-white font-mono">
            OmniAnalyzer: Media Listening Studio
          </h1>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleRefreshStream}
            disabled={isAuditing}
            className="p-1 rounded bg-black border border-[#181524] hover:border-[#00e5ff] text-zinc-300 hover:text-[#00e5ff] transition"
            title="Refresh Live Stream"
          >
            <RefreshCw className={`w-3 h-3 ${isAuditing ? 'animate-spin text-[#00e5ff]' : ''}`} />
          </button>
          <span className="text-[8.5px] font-mono px-2 py-0.5 rounded-full bg-[#00ff99]/15 text-[#00ff99] border border-[#00ff99]/40">
            8 Networks Live
          </span>
        </div>
      </div>

      {/* UPPER ZONE (45% Height): MULTI-SERIES LINE CHART TRACKING CROSS-PLATFORM BRAND PERFORMANCE */}
      <div className="h-[45%] min-h-[220px] p-3 bg-gradient-to-b from-[#08060c] via-black to-[#08060c] border-b border-[#181524] flex flex-col justify-between shrink-0">
        <div className="flex items-center justify-between text-[10px] font-mono">
          <div className="flex items-center gap-2">
            <span className="font-bold uppercase tracking-wider text-white flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-[#00e5ff]" />
              Cross-Platform Velocity
            </span>
            <span className="text-[8.5px] px-1.5 py-0.5 rounded bg-black border border-zinc-800 text-zinc-400">
              Last 24 Hours
            </span>
          </div>

          {/* Multi-series chart legend */}
          <div className="flex items-center gap-2 text-[8px] font-mono">
            <span className="flex items-center gap-1 text-[#00ff99]">
              <span className="w-2 h-0.5 bg-[#00ff99]" /> TikTok
            </span>
            <span className="flex items-center gap-1 text-[#ff007f]">
              <span className="w-2 h-0.5 bg-[#ff007f]" /> Reels
            </span>
            <span className="flex items-center gap-1 text-[#00e5ff]">
              <span className="w-2 h-0.5 bg-[#00e5ff]" /> Shorts
            </span>
            <span className="flex items-center gap-1 text-[#8b5cf6]">
              <span className="w-2 h-0.5 bg-[#8b5cf6]" /> X/Twitter
            </span>
          </div>
        </div>

        {/* Multi-Series Vector SVG Chart */}
        <div className="relative flex-1 w-full my-1.5 bg-black/60 rounded-xl border border-[#181524] p-2 flex items-center justify-center overflow-hidden">
          {/* Background Grid Lines */}
          <div className="absolute inset-0 grid grid-rows-4 grid-cols-6 pointer-events-none opacity-20">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="border-b border-r border-[#181524]" />
            ))}
          </div>

          <svg className="w-full h-full overflow-visible" viewBox="0 0 400 130" preserveAspectRatio="none">
            <defs>
              <linearGradient id="glow-mint" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00ff99" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#00ff99" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="glow-magenta" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ff007f" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#ff007f" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Line 1: TikTok (#00ff99) */}
            <path
              d="M 0,95 Q 60,65 120,70 T 240,35 T 320,40 T 400,15"
              fill="none"
              stroke="#00ff99"
              strokeWidth="2.5"
              style={{ filter: 'drop-shadow(0 0 6px #00ff99)' }}
            />

            {/* Line 2: Instagram Reels (#ff007f) */}
            <path
              d="M 0,110 Q 70,85 140,80 T 260,50 T 340,30 T 400,22"
              fill="none"
              stroke="#ff007f"
              strokeWidth="2"
              style={{ filter: 'drop-shadow(0 0 6px #ff007f)' }}
            />

            {/* Line 3: YouTube Shorts (#00e5ff) */}
            <path
              d="M 0,105 Q 80,90 150,60 T 280,55 T 350,42 T 400,28"
              fill="none"
              stroke="#00e5ff"
              strokeWidth="1.8"
              strokeDasharray="4 2"
              style={{ filter: 'drop-shadow(0 0 6px #00e5ff)' }}
            />

            {/* Line 4: X/Twitter (#8b5cf6) */}
            <path
              d="M 0,115 Q 90,100 160,85 T 270,70 T 360,52 T 400,38"
              fill="none"
              stroke="#8b5cf6"
              strokeWidth="1.5"
              style={{ filter: 'drop-shadow(0 0 4px #8b5cf6)' }}
            />

            {/* Peak Indicator Dot */}
            <circle cx="400" cy="15" r="4" fill="#00ff99" className="animate-ping" />
            <circle cx="400" cy="15" r="3" fill="#ffffff" />
          </svg>

          {/* Chart Y-Axis Markers */}
          <div className="absolute left-2 top-2 bottom-2 flex flex-col justify-between text-[7px] font-mono text-zinc-500 pointer-events-none">
            <span>250K</span>
            <span>150K</span>
            <span>50K</span>
            <span>0</span>
          </div>
        </div>

        {/* Real-Time Aggregate Callout */}
        <div className="flex items-center justify-between text-[9px] font-mono text-zinc-400 pt-1">
          <span>Global Brand Impressions: <strong className="text-white">1,482,900</strong></span>
          <span className="text-[#00ff99] font-bold">+28.4% vs Yesterday</span>
        </div>
      </div>

      {/* MIDDLE ZONE (20% Height): 3 DATA METRICS PLATES WITH SIGNATURE NEON BORDER ACCENTS (Lavender & Magenta) */}
      <div className="h-[20%] min-h-[95px] p-2 bg-[#08060c] border-b border-[#181524] grid grid-cols-3 gap-2 shrink-0">
        
        {/* Plate 1: Share of Voice (Lavender Glow Accent #a78bfa) */}
        <div className="p-2 rounded-xl bg-black border border-[#a78bfa] shadow-[0_0_12px_rgba(167,139,250,0.25)] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[8px] font-mono text-zinc-400">
            <span className="uppercase tracking-wider">Share of Voice</span>
            <span className="text-[#a78bfa] font-bold">SOV</span>
          </div>
          <div className="my-0.5">
            <span className="text-base xs:text-lg font-black font-mono text-white">41.8%</span>
          </div>
          <div className="flex items-center justify-between text-[7.5px] font-mono text-zinc-400">
            <span className="text-[#a78bfa] font-bold">+6.2% vs niche</span>
            <span className="text-zinc-500">Rank #1</span>
          </div>
        </div>

        {/* Plate 2: AI Net Sentiment Score (Hot Magenta Glow Accent #ff007f) */}
        <div className="p-2 rounded-xl bg-black border border-[#ff007f] shadow-[0_0_12px_rgba(255,0,127,0.25)] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[8px] font-mono text-zinc-400">
            <span className="uppercase tracking-wider">Net Sentiment</span>
            <span className="text-[#ff007f] font-bold">+94</span>
          </div>
          <div className="my-0.5">
            <span className="text-base xs:text-lg font-black font-mono text-[#ff007f]">96.4%</span>
          </div>
          <div className="flex items-center justify-between text-[7.5px] font-mono text-zinc-400">
            <span className="text-[#00ff99] font-bold">Ultra-Positive</span>
            <span className="text-zinc-500">NPS: +88</span>
          </div>
        </div>

        {/* Plate 3: Total Engagements (Vibrant Cyan Glow Accent #00e5ff) */}
        <div className="p-2 rounded-xl bg-black border border-[#00e5ff] shadow-[0_0_12px_rgba(0,229,255,0.25)] flex flex-col justify-between">
          <div className="flex items-center justify-between text-[8px] font-mono text-zinc-400">
            <span className="uppercase tracking-wider">Engagements</span>
            <span className="text-[#00e5ff] font-bold">Live</span>
          </div>
          <div className="my-0.5">
            <span className="text-base xs:text-lg font-black font-mono text-white">384.2K</span>
          </div>
          <div className="flex items-center justify-between text-[7.5px] font-mono text-zinc-400">
            <span className="text-[#00e5ff] font-bold">+34.1K today</span>
            <span className="text-zinc-500">8.9% ER</span>
          </div>
        </div>

      </div>

      {/* LOWER ZONE (35% Height): THE "UNIVERSAL LISTENING STREAM"
          Vertical feed aggregating live consumer comments, text strings, and profile mentions pulled in real time */}
      <div className="h-[35%] flex-1 overflow-y-auto p-2 bg-black flex flex-col">
        {/* Stream Header & Network Filter Pills */}
        <div className="flex items-center justify-between pb-1.5 border-b border-[#181524] mb-2 shrink-0">
          <div className="flex items-center gap-1.5 text-[9.5px] font-mono font-bold text-white uppercase">
            <MessageSquare className="w-3.5 h-3.5 text-[#00ff99]" />
            <span>Universal Listening Stream</span>
          </div>

          <div className="flex items-center gap-1 overflow-x-auto text-[8px] font-mono no-scrollbar">
            {['All', 'TikTok', 'Reels', 'Shorts', 'X/Twitter', 'Reddit'].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-1.5 py-0.5 rounded transition ${
                  activeFilter === filter
                    ? 'bg-[#08060c] border border-[#00e5ff] text-[#00e5ff] font-bold'
                    : 'text-zinc-500 hover:text-white'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Aggregated Live Feed Cards */}
        <div className="space-y-2 overflow-y-auto pr-1">
          {filteredStream.map((comment) => (
            <div
              key={comment.id}
              className="p-2 rounded-xl bg-[#08060c] border border-[#181524] hover:border-zinc-700 transition space-y-1"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <img
                    src={comment.avatar}
                    alt={comment.author}
                    className="w-4 h-4 rounded-full object-cover border border-zinc-800"
                  />
                  <span className="text-[9.5px] font-bold text-white font-mono">{comment.author}</span>
                  <span 
                    className="text-[7.5px] font-mono px-1.5 py-0.2 rounded font-bold border"
                    style={{
                      borderColor: `${comment.accent}55`,
                      color: comment.accent,
                      backgroundColor: `${comment.accent}15`,
                    }}
                  >
                    {comment.network}
                  </span>
                </div>
                <span className="text-[8px] font-mono text-zinc-500">{comment.timestamp}</span>
              </div>

              <p className="text-[10px] text-zinc-300 leading-snug font-sans">
                {comment.text}
              </p>

              <div className="flex items-center justify-between text-[8px] font-mono text-zinc-500 pt-0.5">
                <span className="text-[#00ff99] flex items-center gap-1">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  Sentiment: {comment.sentiment.toUpperCase()}
                </span>
                <span className="text-zinc-400">{comment.engagement}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
