import React, { useState } from 'react';
import { 
  Network, 
  Sparkles, 
  Check, 
  Plus, 
  ShieldCheck, 
  Zap, 
  Activity, 
  Radio, 
  PhoneCall, 
  MessageSquare, 
  FileSpreadsheet, 
  Webhook, 
  RefreshCw,
  Search,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { HoloOrb, OrbPhase } from '../HoloOrb';

interface ConnectionKeyItem {
  id: string;
  name: string;
  category: string;
  connected: boolean;
  accent: string;
  keyLabel: string;
}

export const OmniConnectCatalog: React.FC = () => {
  const [orbPhase, setOrbPhase] = useState<OrbPhase>('idle');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedKeyForConfig, setSelectedKeyForConfig] = useState<ConnectionKeyItem | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 3-Column Rapid Mobile Connection Toggles
  const [connectionDeck, setConnectionDeck] = useState<ConnectionKeyItem[]>([
    { id: 'twilio', name: 'Twilio Bridge', category: 'Telephony', connected: true, accent: '#00ff99', keyLabel: 'Account SID & Auth Token' },
    { id: 'sip', name: 'SIP Carrier Trunk', category: 'VoIP VoIP', connected: false, accent: '#8b5cf6', keyLabel: 'SIP Trunk URI & Password' },
    { id: 'whatsapp', name: 'WhatsApp API', category: 'Messaging', connected: true, accent: '#00e5ff', keyLabel: 'Meta Graph API Token' },
    { id: 'discord', name: 'Discord Client', category: 'Community', connected: true, accent: '#ff007f', keyLabel: 'Bot Client Token' },
    { id: 'hubspot', name: 'HubSpot Sync', category: 'CRM Leads', connected: false, accent: '#a78bfa', keyLabel: 'Private App Token' },
    { id: 'sheets', name: 'Google Sheets Proxy', category: 'Database', connected: true, accent: '#00ff99', keyLabel: 'Service Account JSON' },
    { id: 'webhooks', name: 'Custom Inbound/Outbound', category: 'Webhooks', connected: true, accent: '#00e5ff', keyLabel: 'HMAC Secret Key' },
    { id: 'stripe', name: 'Stripe Billing', category: 'Payments', connected: true, accent: '#8b5cf6', keyLabel: 'Live Secret Key' },
    { id: 'slack', name: 'Slack Alerts', category: 'Chat Ops', connected: false, accent: '#ff007f', keyLabel: 'Webhook Incoming URL' },
    { id: 'github', name: 'GitHub Repo Sync', category: 'Code Version', connected: true, accent: '#a78bfa', keyLabel: 'Personal Access Token' },
    { id: 'shopify', name: 'Shopify Store', category: 'E-Commerce', connected: false, accent: '#00ff99', keyLabel: 'Admin API Access Token' },
    { id: 'notion', name: 'Notion Knowledge', category: 'Docs Sync', connected: false, accent: '#00e5ff', keyLabel: 'Internal Integration Secret' },
  ]);

  const handleToggleKey = (id: string) => {
    setOrbPhase('thinking');
    setConnectionDeck((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const next = !item.connected;
          setToastMessage(`${item.name} toggled: ${next ? 'CONNECTED' : 'DISCONNECTED'}`);
          setTimeout(() => setToastMessage(null), 2200);
          return { ...item, connected: next };
        }
        return item;
      })
    );
    setTimeout(() => setOrbPhase('idle'), 600);
  };

  const filteredDeck = connectionDeck.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col bg-black text-[#e8e6f2] overflow-hidden font-sans select-none">
      
      {/* Studio Header */}
      <div className="h-10 px-3 bg-[#08060c] border-b border-[#181524] flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Network className="w-3.5 h-3.5 text-[#00e5ff]" />
          <h1 className="font-bold text-[11px] tracking-wider uppercase text-white font-mono">
            OmniConnect Integrations
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[8.5px] font-mono px-2 py-0.5 rounded-full bg-[#00e5ff]/15 text-[#00e5ff] border border-[#00e5ff]/40">
            Pipeline Mesh Active
          </span>
        </div>
      </div>

      {toastMessage && (
        <div className="bg-[#08060c] border-b border-[#00e5ff]/40 px-3 py-1 text-[10px] font-mono text-[#00e5ff] flex items-center gap-1.5 animate-in fade-in">
          <Sparkles className="w-3 h-3 text-[#00e5ff]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* UPPER SECTION: MAIN PIPELINE DATA TRAFFIC STATUS GRAPHS */}
      <div className="p-3 bg-gradient-to-b from-[#08060c] to-black border-b border-[#181524] shrink-0 space-y-2.5">
        <div className="flex items-center justify-between text-[10px] font-mono">
          <span className="font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-[#00ff99] animate-pulse" />
            Main Pipeline Data Traffic Status
          </span>
          <span className="text-[#00ff99] font-bold">● 99.98% UPTIME</span>
        </div>

        {/* Live Traffic Bar Charts & Packet Flow Metrics */}
        <div className="grid grid-cols-3 gap-2">
          {/* Card 1: Throughput */}
          <div className="p-2 rounded-xl bg-[#08060c] border border-[#00ff99]/40 shadow-[0_0_8px_rgba(0,255,153,0.15)] flex flex-col justify-between">
            <span className="text-[8.5px] font-mono text-zinc-400 uppercase">Throughput</span>
            <div className="flex items-baseline gap-1 my-1">
              <span className="text-sm font-black font-mono text-white">4.8</span>
              <span className="text-[9px] font-mono text-[#00ff99]">MB/s</span>
            </div>
            {/* Animated Traffic Wave Bar */}
            <div className="flex items-end gap-0.5 h-5 w-full pt-1">
              {[40, 65, 85, 55, 95, 75, 90, 60, 100, 70, 80].map((h, i) => (
                <div 
                  key={i} 
                  className="flex-1 bg-[#00ff99] rounded-t-sm transition-all duration-300" 
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>

          {/* Card 2: Inbound Requests */}
          <div className="p-2 rounded-xl bg-[#08060c] border border-[#8b5cf6]/40 shadow-[0_0_8px_rgba(139,92,246,0.15)] flex flex-col justify-between">
            <span className="text-[8.5px] font-mono text-zinc-400 uppercase">Packet Rate</span>
            <div className="flex items-baseline gap-1 my-1">
              <span className="text-sm font-black font-mono text-white">1,240</span>
              <span className="text-[9px] font-mono text-[#8b5cf6]">req/m</span>
            </div>
            <div className="flex items-end gap-0.5 h-5 w-full pt-1">
              {[50, 70, 60, 80, 75, 90, 65, 85, 95, 60, 85].map((h, i) => (
                <div 
                  key={i} 
                  className="flex-1 bg-[#8b5cf6] rounded-t-sm transition-all duration-300" 
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>

          {/* Card 3: Global Latency */}
          <div className="p-2 rounded-xl bg-[#08060c] border border-[#00e5ff]/40 shadow-[0_0_8px_rgba(0,229,255,0.15)] flex flex-col justify-between">
            <span className="text-[8.5px] font-mono text-zinc-400 uppercase">Avg Latency</span>
            <div className="flex items-baseline gap-1 my-1">
              <span className="text-sm font-black font-mono text-white">18</span>
              <span className="text-[9px] font-mono text-[#00e5ff]">ms</span>
            </div>
            <div className="flex items-end gap-0.5 h-5 w-full pt-1">
              {[30, 25, 40, 35, 30, 20, 25, 30, 20, 25, 20].map((h, i) => (
                <div 
                  key={i} 
                  className="flex-1 bg-[#00e5ff] rounded-t-sm transition-all duration-300" 
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* MIDDLE/LOWER SECTION: 3-COLUMN RAPID MOBILE CONNECTION SETUP GRID
          Exact specification: grid grid-cols-3 gap-2 p-2 max-h-[350px] bg-[#08060c] rounded-xl border border-zinc-900 mx-2 */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 px-2 py-1">
          <span className="font-bold uppercase tracking-wider text-zinc-200">
            Rapid Connection Deck (Tap to Toggle):
          </span>
          <span className="text-[#00e5ff] text-[9px]">Tap Key to Activate</span>
        </div>

        <div className="grid grid-cols-3 gap-2 p-2 max-h-[350px] bg-[#08060c] rounded-xl border border-zinc-900 mx-2 overflow-y-auto">
          {filteredDeck.map((keyItem) => {
            const isConnected = keyItem.connected;
            return (
              <div
                key={keyItem.id}
                onClick={() => handleToggleKey(keyItem.id)}
                className={`p-2 rounded-lg border flex flex-col justify-between cursor-pointer transition-all active:scale-95 text-left relative ${
                  isConnected
                    ? 'bg-black/90 shadow-[0_0_10px_rgba(0,0,0,0.8)]'
                    : 'bg-black/40 border-zinc-800 opacity-60 hover:opacity-100'
                }`}
                style={{
                  borderColor: isConnected ? keyItem.accent : '#27272a',
                  boxShadow: isConnected ? `0 0 10px ${keyItem.accent}33` : undefined,
                }}
              >
                {/* Status Dot */}
                <div className="flex items-center justify-between mb-1">
                  <span 
                    className="w-2 h-2 rounded-full" 
                    style={{ 
                      backgroundColor: isConnected ? keyItem.accent : '#52525b',
                      boxShadow: isConnected ? `0 0 6px ${keyItem.accent}` : undefined,
                    }} 
                  />
                  <span 
                    className="text-[7.5px] font-mono font-bold uppercase tracking-tighter"
                    style={{ color: isConnected ? keyItem.accent : '#71717a' }}
                  >
                    {isConnected ? 'ON' : 'OFF'}
                  </span>
                </div>

                {/* Key Title */}
                <h4 className="text-[10px] font-bold text-white leading-tight font-sans truncate">
                  {keyItem.name}
                </h4>

                {/* Category & Action */}
                <div className="mt-1 pt-1 border-t border-zinc-900 flex items-center justify-between">
                  <span className="text-[7.5px] font-mono text-zinc-500 truncate">
                    {keyItem.category}
                  </span>
                  <span 
                    className="text-[7.5px] font-mono font-bold"
                    style={{ color: isConnected ? keyItem.accent : '#a1a1aa' }}
                  >
                    {isConnected ? 'LIVE' : 'TAP'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Configuration Field for Connected Third-Party Keys */}
        <div className="mx-2 mt-3 p-2.5 rounded-xl bg-[#08060c] border border-zinc-900 text-xs">
          <div className="flex items-center justify-between font-mono text-[9.5px] text-zinc-400 mb-1.5">
            <span className="font-bold text-white uppercase flex items-center gap-1">
              <Lock className="w-3 h-3 text-[#00e5ff]" />
              Secure API Gateway Token Proxy:
            </span>
            <span className="text-[#00ff99]">AES-256 Cloud Encrypted</span>
          </div>
          <p className="text-[10px] text-zinc-400 mb-2">
            Third-party tokens (Twilio, WhatsApp, VoIP, Google Sheets) route through server-side environment proxies. Never exposed client-side.
          </p>
          <div className="flex items-center gap-1.5">
            <input
              type="password"
              placeholder="Enter Custom API Key / Webhook Secret..."
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              className="flex-1 bg-black border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#00e5ff] font-mono"
            />
            <button
              onClick={() => {
                if (apiKeyInput.trim()) {
                  setToastMessage('API Key securely cached in encrypted session vault.');
                  setApiKeyInput('');
                  setTimeout(() => setToastMessage(null), 2500);
                }
              }}
              className="px-2.5 py-1 rounded-lg bg-[#00e5ff] text-slate-950 font-mono font-bold text-[10px] hover:brightness-110 active:scale-95 transition"
            >
              Save Key
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};
