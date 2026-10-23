import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Database, 
  Key, 
  FileText, 
  Terminal, 
  ShieldCheck, 
  Radio, 
  Server, 
  Send, 
  Play, 
  Copy, 
  Check, 
  Plus, 
  Trash2, 
  RotateCcw,
  Sparkles,
  Lock,
  Globe,
  Sliders,
  Layers,
  ArrowRight,
  ExternalLink,
  Code2,
  Workflow,
  Zap,
  Activity,
  SlidersHorizontal,
  FolderLock,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  RefreshCw,
  Box,
  Share2,
  Cpu
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { triggerTactileHaptic } from '../../lib/hapticFeedback';

export interface ColumnItem {
  id: string;
  name: string;
  type: string;
  isPrimary?: boolean;
  isForeign?: boolean;
}

export interface SchemaTableItem {
  id: string;
  name: string;
  x: number;
  y: number;
  columns: ColumnItem[];
  color: string;
}

export interface RelationshipItem {
  id: string;
  fromTable: string;
  fromCol: string;
  toTable: string;
  toCol: string;
  color: string;
}

interface OmniArchitectStudioProps {
  onSaveToVault?: (asset: any) => void;
  onBackToHome?: () => void;
  onOpenSidebar?: () => void;
  onOpenCompanion?: () => void;
}

export const OmniArchitectStudio: React.FC<OmniArchitectStudioProps> = ({ 
  onSaveToVault,
  onBackToHome,
  onOpenSidebar,
  onOpenCompanion
}) => {
  // ==========================================
  // ZONE 1: 4 TABLES (Users, Products, Orders, Messages)
  // ==========================================
  const [tables, setTables] = useState<SchemaTableItem[]>([
    {
      id: 'tbl_users',
      name: 'Users',
      x: 16,
      y: 20,
      color: '#00e5ff',
      columns: [
        { id: 'u_id', name: 'id', type: 'UUID', isPrimary: true },
        { id: 'u_email', name: 'email', type: 'VARCHAR(255)' },
        { id: 'u_role', name: 'role', type: 'ENUM("admin", "user")' },
        { id: 'u_created', name: 'created_at', type: 'TIMESTAMP' },
      ],
    },
    {
      id: 'tbl_products',
      name: 'Products',
      x: 185,
      y: 20,
      color: '#00ff99',
      columns: [
        { id: 'p_id', name: 'id', type: 'UUID', isPrimary: true },
        { id: 'p_name', name: 'name', type: 'VARCHAR(180)' },
        { id: 'p_price', name: 'price_cents', type: 'INT' },
        { id: 'p_stock', name: 'stock', type: 'INT' },
      ],
    },
    {
      id: 'tbl_orders',
      name: 'Orders',
      x: 16,
      y: 160,
      color: '#8b5cf6',
      columns: [
        { id: 'o_id', name: 'id', type: 'UUID', isPrimary: true },
        { id: 'o_uid', name: 'user_id', type: 'UUID', isForeign: true },
        { id: 'o_pid', name: 'product_id', type: 'UUID', isForeign: true },
        { id: 'o_total', name: 'total_usd', type: 'NUMERIC(10,2)' },
        { id: 'o_status', name: 'status', type: 'VARCHAR(40)' },
      ],
    },
    {
      id: 'tbl_messages',
      name: 'Messages',
      x: 185,
      y: 160,
      color: '#a78bfa',
      columns: [
        { id: 'm_id', name: 'id', type: 'UUID', isPrimary: true },
        { id: 'm_uid', name: 'user_id', type: 'UUID', isForeign: true },
        { id: 'm_oid', name: 'order_id', type: 'UUID', isForeign: true },
        { id: 'm_body', name: 'body', type: 'TEXT' },
        { id: 'm_sent', name: 'sent_at', type: 'TIMESTAMP' },
      ],
    },
  ]);

  const [relationships, setRelationships] = useState<RelationshipItem[]>([
    {
      id: 'rel-1',
      fromTable: 'tbl_users',
      fromCol: 'id',
      toTable: 'tbl_orders',
      toCol: 'user_id',
      color: '#00e5ff',
    },
    {
      id: 'rel-2',
      fromTable: 'tbl_products',
      fromCol: 'id',
      toTable: 'tbl_orders',
      toCol: 'product_id',
      color: '#00ff99',
    },
    {
      id: 'rel-3',
      fromTable: 'tbl_orders',
      fromCol: 'id',
      toTable: 'tbl_messages',
      toCol: 'order_id',
      color: '#8b5cf6',
    },
  ]);

  // Node wire connection drawing state
  const [activeWireStart, setActiveWireStart] = useState<{ tableId: string; colName: string } | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Dragging table state
  const [draggingTableId, setDraggingTableId] = useState<string | null>(null);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const playgroundRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2400);
  };

  const handleStartDrag = (tableId: string, clientX: number, clientY: number) => {
    triggerTactileHaptic(4, 'tap');
    setDraggingTableId(tableId);
    const tbl = tables.find((t) => t.id === tableId);
    if (!tbl) return;
    dragOffsetRef.current = {
      x: clientX - tbl.x,
      y: clientY - tbl.y,
    };
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingTableId || !playgroundRef.current) return;
    const rect = playgroundRef.current.getBoundingClientRect();
    const newX = Math.max(8, Math.min(rect.width - 150, e.clientX - rect.left - dragOffsetRef.current.x));
    const newY = Math.max(8, Math.min(rect.height - 130, e.clientY - rect.top - dragOffsetRef.current.y));

    setTables((prev) =>
      prev.map((t) => (t.id === draggingTableId ? { ...t, x: newX, y: newY } : t))
    );
  };

  const handlePointerUp = () => {
    if (draggingTableId) {
      setDraggingTableId(null);
    }
  };

  const handleColumnNodeClick = (tableId: string, colName: string) => {
    triggerTactileHaptic(5, 'tap');
    if (!activeWireStart) {
      setActiveWireStart({ tableId, colName });
      showToast(`Selected ${colName}. Tap another column to link wireframe.`);
    } else {
      if (activeWireStart.tableId === tableId && activeWireStart.colName === colName) {
        setActiveWireStart(null);
        return;
      }
      // Create new relationship
      const newRel: RelationshipItem = {
        id: `rel-${Date.now()}`,
        fromTable: activeWireStart.tableId,
        fromCol: activeWireStart.colName,
        toTable: tableId,
        toCol: colName,
        color: ['#00e5ff', '#00ff99', '#8b5cf6', '#ff007f'][relationships.length % 4],
      };
      setRelationships((prev) => [...prev, newRel]);
      setActiveWireStart(null);
      showToast(`Linked ${newRel.fromCol} → ${newRel.toCol}`);
      triggerTactileHaptic(8, 'enter');
    }
  };

  const handleClearRelationships = () => {
    triggerTactileHaptic(9, 'tap');
    setRelationships([]);
    setActiveWireStart(null);
    showToast('Relationships cleared.');
  };

  // ==========================================
  // ZONE 2: MODULE CONFIGURATION BADGES
  // ==========================================
  const [activeZone2Modal, setActiveZone2Modal] = useState<string | null>(null);

  // Gateways & Log state
  const [authGateways, setAuthGateways] = useState({
    googleOAuth: true,
    stripeApis: true,
    rbacPermissions: true,
    multiTenantRoles: true,
  });

  const [pipelineSettings, setPipelineSettings] = useState({
    jwtSecurityLayer: true,
    httpOnlyCookieStorage: true,
    emailValidationWorkflow: true,
  });

  const [webhookUrl, setWebhookUrl] = useState('https://api.yourapp.com/hooks/omni-event');
  const [slackWebhookStream, setSlackWebhookStream] = useState('https://hooks.slack.com/services/OMNI/DEV/SEC');
  const [securityMaxReq, setSecurityMaxReq] = useState(120);
  const [corsTier, setCorsTier] = useState<'Wildcard *' | 'Strict Origin' | 'Multi-Domain Allowed'>('Strict Origin');
  const [mockRowsCount, setMockRowsCount] = useState(5000);
  const [isGeneratingMockRows, setIsGeneratingMockRows] = useState(false);

  const handleTriggerMockIngestion = () => {
    triggerTactileHaptic(8, 'enter');
    setIsGeneratingMockRows(true);
    showToast('Injecting 5,000 realistic load-testing database rows...');
    setTimeout(() => {
      setIsGeneratingMockRows(false);
      showToast('5,000 rows generated into Users, Orders & Products.');
    }, 1200);
  };

  // ==========================================
  // ZONE 3: DEV-DECK TERMINALS & MIGRATION
  // ==========================================
  const [zone3Tab, setZone3Tab] = useState<'swagger' | 'sql' | 'migration'>('swagger');

  // Swagger State
  const [swaggerSelectedReq, setSwaggerSelectedReq] = useState<string>('GET /api/users');
  const [swaggerExecuting, setSwaggerExecuting] = useState(false);
  const [swaggerResponse, setSwaggerResponse] = useState<string | null>(JSON.stringify({
    status: 200,
    latency: '18ms',
    data: [
      { id: 'usr_981a', email: 'founder@darkmisfit.ai', role: 'admin' },
      { id: 'usr_204b', email: 'creator@spirecyber.com', role: 'user' }
    ]
  }, null, 2));

  const handleTestSwaggerRequest = (endpoint: string) => {
    triggerTactileHaptic(6, 'tap');
    setSwaggerSelectedReq(endpoint);
    setSwaggerExecuting(true);
    setTimeout(() => {
      setSwaggerExecuting(false);
      if (endpoint === 'POST /api/auth/signin') {
        setSwaggerResponse(JSON.stringify({
          status: 200,
          latency: '24ms',
          auth_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.omniPayloadToken981',
          user: { id: 'usr_981a', email: 'founder@darkmisfit.ai', verified: true },
          session_ttl: 86400
        }, null, 2));
      } else if (endpoint.startsWith('GET /api/orders') || endpoint.startsWith('POST /api/orders')) {
        setSwaggerResponse(JSON.stringify({
          status: 200,
          latency: '19ms',
          orders_count: 2,
          records: [
            { id: 'ord_1', total_usd: '499.00', status: 'PAID' },
            { id: 'ord_2', total_usd: '129.50', status: 'PENDING_SETTLEMENT' }
          ]
        }, null, 2));
      } else if (endpoint.startsWith('GET /api/products') || endpoint.startsWith('POST /api/products')) {
        setSwaggerResponse(JSON.stringify({
          status: 200,
          latency: '14ms',
          products: [
            { id: 'prd_01', name: 'Volumetric Haptic Keyboard Pro', price_cents: 29900, stock: 450 },
            { id: 'prd_02', name: 'OmniAI Neural Cloud Pass', price_cents: 4900, stock: 99999 }
          ]
        }, null, 2));
      } else {
        setSwaggerResponse(JSON.stringify({
          status: 200,
          latency: '16ms',
          endpoint,
          timestamp: new Date().toISOString(),
          active_nodes: 4,
          payload: { query: 'success', rows_returned: 12 }
        }, null, 2));
      }
      showToast(`200 OK — ${endpoint}`);
    }, 400);
  };

  // SQL Terminal State
  const [sqlFormat, setSqlFormat] = useState<'Prisma' | 'Migration SQL' | 'PostgreSQL'>('PostgreSQL');
  const [isCopiedSql, setIsCopiedSql] = useState(false);

  const getDynamicCodeSnippet = () => {
    if (sqlFormat === 'Prisma') {
      return `// Auto-generated by Omni Architect
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  role      String   @default("user")
  createdAt DateTime @default(now())
  orders    Order[]
  messages  Message[]
}

model Product {
  id         String   @id @default(uuid())
  name       String
  priceCents Int
  stock      Int
  orders     Order[]
}

model Order {
  id        String    @id @default(uuid())
  userId    String
  user      User      @relation(fields: [userId], references: [id])
  productId String
  product   Product   @relation(fields: [productId], references: [id])
  totalUsd  Decimal   @db.Decimal(10, 2)
  status    String
  messages  Message[]
}`;
    }
    if (sqlFormat === 'Migration SQL') {
      return `-- Omni Architect Migration: 2026-10-16_master_sync.sql
BEGIN;

ALTER TABLE "orders"
  ADD COLUMN IF NOT EXISTS "total_usd" NUMERIC(10, 2) DEFAULT 0.00;

CREATE INDEX IF NOT EXISTS "idx_orders_user_id" 
  ON "orders" ("user_id");

CREATE INDEX IF NOT EXISTS "idx_messages_order_id" 
  ON "messages" ("order_id");

COMMIT;`;
    }
    return `-- Live PostgreSQL DDL Schema
CREATE TABLE IF NOT EXISTS "users" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "email" VARCHAR(255) NOT NULL UNIQUE,
  "role" VARCHAR(50) DEFAULT 'user',
  "created_at" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "products" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" VARCHAR(180) NOT NULL,
  "price_cents" INTEGER NOT NULL,
  "stock" INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS "orders" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "user_id" UUID REFERENCES "users"("id") ON DELETE CASCADE,
  "product_id" UUID REFERENCES "products"("id"),
  "total_usd" NUMERIC(10,2) NOT NULL,
  "status" VARCHAR(40) DEFAULT 'pending'
);`;
  };

  const handleCopyCode = () => {
    triggerTactileHaptic(5, 'tap');
    navigator.clipboard?.writeText(getDynamicCodeSnippet());
    setIsCopiedSql(true);
    showToast(`Copied ${sqlFormat} code to clipboard.`);
    setTimeout(() => setIsCopiedSql(false), 2000);
  };

  // Migration Console State
  const [migrationPromoteState, setMigrationPromoteState] = useState<'pending' | 'promoting' | 'applied'>('pending');

  const handlePromoteLive = () => {
    triggerTactileHaptic(9, 'enter');
    setMigrationPromoteState('promoting');
    showToast('Executing zero-downtime DDL migration on production cluster...');
    setTimeout(() => {
      setMigrationPromoteState('applied');
      showToast('Migration 2026-10-16_orders_total_numeric applied to production!');
    }, 1200);
  };

  return (
    <div 
      className="w-full max-w-[400px] h-[850px] mx-auto overflow-hidden relative flex flex-col justify-between bg-black text-white font-sans select-none"
      style={{ boxSizing: 'border-box' }}
    >
      {/* Toast Notification */}
      {toastMsg && (
        <div className="absolute top-12 left-1/2 -translate-x-1/2 z-50 px-3 py-1.5 rounded-full bg-[#08060c]/95 border border-[#00e5ff]/50 text-[#00e5ff] text-[10.5px] font-mono shadow-2xl backdrop-blur-md animate-in fade-in flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-[#00ff99]" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* HEADER BAR: Component Header Text: Omni Architect */}
      <div className="h-12 px-3 bg-[#08060c] border-b border-zinc-900 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#00e5ff] animate-pulse shadow-[0_0_8px_#00e5ff]" />
          <h1 className="font-bold text-xs tracking-wider uppercase text-white font-mono">
            Omni Architect
          </h1>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-[#00ff99]/10 border border-[#00ff99]/30 text-[#00ff99]">
            {relationships.length} Bezier Links
          </span>
          <button
            onClick={() => {
              triggerTactileHaptic(6, 'tap');
              onSaveToVault?.({
                type: 'schema',
                title: 'Omni Architect Multi-Deck Schema',
                thumbnail: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=600&q=80',
                tags: ['Omni Architect', 'PostgreSQL', 'Prisma', `${relationships.length} Links`],
                details: getDynamicCodeSnippet()
              });
              showToast('Saved Schema Matrix to Vault!');
            }}
            className="px-2 py-0.5 rounded-md bg-[#00e5ff] text-slate-950 font-bold text-[9.5px] font-mono flex items-center gap-1 active:scale-95 transition"
            title="Save to Vault"
          >
            <FolderLock className="w-2.5 h-2.5" />
            <span>Vault</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* ZONE 1: THE INFINITE SCHEMA BUILDER PLAYGROUND (Top 40%) */}
      {/* ======================================================== */}
      <div 
        ref={playgroundRef}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="w-full h-[40%] relative bg-[#08060c] overflow-hidden border-b border-zinc-900 select-none"
      >
        {/* Background Cyber-Grid Matrix */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(to right, #00e5ff15 1px, transparent 1px), linear-gradient(to bottom, #8b5cf615 1px, transparent 1px)`,
            backgroundSize: '20px 20px'
          }}
        />

        {/* Floating "Clear Relationships" Button in Hot Magenta Pink (#ff007f) */}
        <div className="absolute top-2 right-2 z-20">
          <button
            type="button"
            onClick={handleClearRelationships}
            className="px-2.5 py-1 rounded-full bg-[#ff007f]/20 hover:bg-[#ff007f]/30 border border-[#ff007f] text-[#ff007f] text-[9.5px] font-mono font-bold flex items-center gap-1 shadow-[0_0_10px_rgba(255,0,127,0.3)] active:scale-95 transition"
            title="Clear all active wire connections"
          >
            <Trash2 className="w-3 h-3 text-[#ff007f]" />
            <span>Clear Relationships</span>
          </button>
        </div>

        {/* Active Node Selection Helper Toast in Top-Left */}
        <div className="absolute top-2 left-2 z-20 flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/70 border border-zinc-800 text-[9px] font-mono text-zinc-400">
          <Workflow className="w-3 h-3 text-[#00e5ff]" />
          <span>{activeWireStart ? `Linking ${activeWireStart.colName}...` : 'Drag headers • Tap columns to link'}</span>
        </div>

        {/* SVG Bezier Vector Lines with Brand Glow Tokens */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
          <defs>
            <linearGradient id="neonGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#00ff99" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id="neonGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#ff007f" stopOpacity="0.9" />
            </linearGradient>
            <filter id="glowEffect" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {relationships.map((rel, idx) => {
            const fromTbl = tables.find((t) => t.id === rel.fromTable);
            const toTbl = tables.find((t) => t.id === rel.toTable);
            if (!fromTbl || !toTbl) return null;

            const startX = fromTbl.x + 80;
            const startY = fromTbl.y + 40;
            const endX = toTbl.x + 80;
            const endY = toTbl.y + 40;

            const controlX1 = startX + (endX - startX) * 0.5;
            const controlY1 = startY;
            const controlX2 = startX + (endX - startX) * 0.5;
            const controlY2 = endY;

            const d = `M ${startX} ${startY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${endX} ${endY}`;

            return (
              <g key={rel.id}>
                <path
                  d={d}
                  fill="none"
                  stroke={idx % 2 === 0 ? 'url(#neonGradient1)' : 'url(#neonGradient2)'}
                  strokeWidth="2.2"
                  filter="url(#glowEffect)"
                  strokeDasharray="4 2"
                  className="animate-pulse"
                />
                <circle cx={startX} cy={startY} r="3.5" fill="#00e5ff" />
                <circle cx={endX} cy={endY} r="3.5" fill="#00ff99" />
              </g>
            );
          })}
        </svg>

        {/* 4 Movable Table Blocks: Users, Products, Orders, Messages */}
        {tables.map((tbl) => (
          <div
            key={tbl.id}
            style={{
              transform: `translate3d(${tbl.x}px, ${tbl.y}px, 0)`,
              width: '160px',
            }}
            className="absolute rounded-xl bg-black/90 border border-zinc-800 shadow-[0_4px_16px_rgba(0,0,0,0.8)] z-10 select-none overflow-hidden"
          >
            {/* Header: Draggable handle via touch */}
            <div
              onPointerDown={(e) => handleStartDrag(tbl.id, e.clientX, e.clientY)}
              style={{ borderLeftColor: tbl.color }}
              className="px-2 py-1.5 bg-[#0e0c1a] border-l-2 border-b border-zinc-800 flex items-center justify-between cursor-grab active:cursor-grabbing hover:bg-zinc-900 transition"
            >
              <div className="flex items-center gap-1 min-w-0">
                <Database className="w-3 h-3 text-[#00e5ff] shrink-0" />
                <span className="text-[10px] font-bold text-white font-mono truncate">{tbl.name}</span>
              </div>
              <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-white/5 text-zinc-400">
                {tbl.columns.length}cols
              </span>
            </div>

            {/* Column Nodes */}
            <div className="p-1 space-y-0.5 font-mono text-[9px]">
              {tbl.columns.map((col) => {
                const isSelected = activeWireStart?.tableId === tbl.id && activeWireStart?.colName === col.name;
                return (
                  <div
                    key={col.id}
                    onClick={() => handleColumnNodeClick(tbl.id, col.name)}
                    className={`px-1.5 py-0.5 rounded flex items-center justify-between cursor-pointer transition ${
                      isSelected
                        ? 'bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff]'
                        : 'bg-zinc-950/60 hover:bg-zinc-900 text-zinc-300 border border-zinc-900 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center gap-1 min-w-0">
                      {col.isPrimary && <span className="text-[#00ff99] text-[8px] font-bold">PK</span>}
                      {col.isForeign && <span className="text-[#8b5cf6] text-[8px] font-bold">FK</span>}
                      <span className="truncate">{col.name}</span>
                    </div>
                    <span className="text-[7.5px] text-zinc-500 shrink-0">{col.type.split('(')[0]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* ======================================================== */}
      {/* ZONE 2: INTEGRATED GATEWAYS & PRODUCTION LOG CONTROLS (15%) */}
      {/* ======================================================== */}
      <div className="w-full h-[15%] min-h-[95px] flex items-center gap-3 px-3 bg-[#131024] overflow-x-auto whitespace-nowrap scrollbar-hide border-b border-zinc-900 shrink-0">
        
        {/* Module Badge 1: [Auth & Gateway Logic] */}
        <button
          type="button"
          onClick={() => {
            triggerTactileHaptic(5, 'tap');
            setActiveZone2Modal(activeZone2Modal === 'auth' ? null : 'auth');
          }}
          className={`h-[72px] px-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition shrink-0 ${
            activeZone2Modal === 'auth'
              ? 'bg-[#8b5cf6]/25 border-[#8b5cf6] text-white shadow-[0_0_12px_rgba(139,92,246,0.3)]'
              : 'bg-black/60 border-zinc-800 text-zinc-400 hover:text-white hover:border-[#8b5cf6]/50'
          }`}
        >
          <Lock className="w-4 h-4 text-[#8b5cf6]" />
          <span className="text-[10px] font-bold font-mono">Auth & Gateway</span>
          <span className="text-[8px] font-mono text-[#00ff99]">OAuth • Stripe</span>
        </button>

        {/* Module Badge 2: [One-Click Pipeline] */}
        <button
          type="button"
          onClick={() => {
            triggerTactileHaptic(5, 'tap');
            setActiveZone2Modal(activeZone2Modal === 'pipeline' ? null : 'pipeline');
          }}
          className={`h-[72px] px-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition shrink-0 ${
            activeZone2Modal === 'pipeline'
              ? 'bg-[#00ff99]/25 border-[#00ff99] text-white shadow-[0_0_12px_rgba(0,255,153,0.3)]'
              : 'bg-black/60 border-zinc-800 text-zinc-400 hover:text-white hover:border-[#00ff99]/50'
          }`}
        >
          <Workflow className="w-4 h-4 text-[#00ff99]" />
          <span className="text-[10px] font-bold font-mono">One-Click Pipeline</span>
          <span className="text-[8px] font-mono text-[#00e5ff]">JWT • Cookies</span>
        </button>

        {/* Module Badge 3: [Webhook Broadcaster] */}
        <button
          type="button"
          onClick={() => {
            triggerTactileHaptic(5, 'tap');
            setActiveZone2Modal(activeZone2Modal === 'webhook' ? null : 'webhook');
          }}
          className={`h-[72px] px-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition shrink-0 ${
            activeZone2Modal === 'webhook'
              ? 'bg-[#00e5ff]/25 border-[#00e5ff] text-white shadow-[0_0_12px_rgba(0,229,255,0.3)]'
              : 'bg-black/60 border-zinc-800 text-zinc-400 hover:text-white hover:border-[#00e5ff]/50'
          }`}
        >
          <Radio className="w-4 h-4 text-[#00e5ff]" />
          <span className="text-[10px] font-bold font-mono">Webhook Broadcaster</span>
          <span className="text-[8px] font-mono text-[#a78bfa]">Slack • Outgoing</span>
        </button>

        {/* Module Badge 4: [Security Matrix] */}
        <button
          type="button"
          onClick={() => {
            triggerTactileHaptic(5, 'tap');
            setActiveZone2Modal(activeZone2Modal === 'security' ? null : 'security');
          }}
          className={`h-[72px] px-3 rounded-xl border flex flex-col items-center justify-center gap-1 transition shrink-0 ${
            activeZone2Modal === 'security'
              ? 'bg-[#ff007f]/25 border-[#ff007f] text-white shadow-[0_0_12px_rgba(255,0,127,0.3)]'
              : 'bg-black/60 border-zinc-800 text-zinc-400 hover:text-white hover:border-[#ff007f]/50'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-[#ff007f]" />
          <span className="text-[10px] font-bold font-mono">Security Matrix</span>
          <span className="text-[8px] font-mono text-[#ff007f]">Rate Limit • CORS</span>
        </button>

        {/* Module Badge 5: [Mock Data Ingestion] */}
        <button
          type="button"
          onClick={handleTriggerMockIngestion}
          disabled={isGeneratingMockRows}
          className="h-[72px] px-3 rounded-xl border border-zinc-800 bg-black/60 hover:border-[#00ff99] text-zinc-400 hover:text-white flex flex-col items-center justify-center gap-1 transition shrink-0 active:scale-95"
        >
          <Box className={`w-4 h-4 ${isGeneratingMockRows ? 'text-[#00ff99] animate-spin' : 'text-[#00ff99]'}`} />
          <span className="text-[10px] font-bold font-mono">Mock Data Ingestion</span>
          <span className="text-[8px] font-mono text-[#00ff99]">5,000 DB Rows</span>
        </button>

      </div>

      {/* Zone 2 Interactive Config Drawer (Collapsible) */}
      <AnimatePresence>
        {activeZone2Modal && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3 bg-[#0a0814] border-b border-zinc-900 font-mono text-[10px] space-y-2 z-20"
          >
            <div className="flex items-center justify-between pb-1 border-b border-zinc-800">
              <span className="font-bold text-white uppercase text-[10.5px] text-[#00e5ff]">
                {activeZone2Modal === 'auth' && 'Auth & Gateway Logic'}
                {activeZone2Modal === 'pipeline' && 'One-Click Pipeline Parameters'}
                {activeZone2Modal === 'webhook' && 'Webhook Broadcaster Destinations'}
                {activeZone2Modal === 'security' && 'Security Matrix Controls'}
              </span>
              <button onClick={() => setActiveZone2Modal(null)} className="text-zinc-500 hover:text-white">✕</button>
            </div>

            {activeZone2Modal === 'auth' && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAuthGateways({ ...authGateways, googleOAuth: !authGateways.googleOAuth })}
                  className={`p-1.5 rounded-lg border text-left flex items-center justify-between ${
                    authGateways.googleOAuth ? 'bg-[#8b5cf6]/20 border-[#8b5cf6] text-white' : 'bg-black border-zinc-800 text-zinc-500'
                  }`}
                >
                  <span>Google OAuth</span>
                  <span>{authGateways.googleOAuth ? 'ON' : 'OFF'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAuthGateways({ ...authGateways, stripeApis: !authGateways.stripeApis })}
                  className={`p-1.5 rounded-lg border text-left flex items-center justify-between ${
                    authGateways.stripeApis ? 'bg-[#00ff99]/20 border-[#00ff99] text-white' : 'bg-black border-zinc-800 text-zinc-500'
                  }`}
                >
                  <span>Stripe APIs</span>
                  <span>{authGateways.stripeApis ? 'ON' : 'OFF'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAuthGateways({ ...authGateways, rbacPermissions: !authGateways.rbacPermissions })}
                  className={`p-1.5 rounded-lg border text-left flex items-center justify-between ${
                    authGateways.rbacPermissions ? 'bg-[#00e5ff]/20 border-[#00e5ff] text-white' : 'bg-black border-zinc-800 text-zinc-500'
                  }`}
                >
                  <span>RBAC Toggles</span>
                  <span>{authGateways.rbacPermissions ? 'ON' : 'OFF'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAuthGateways({ ...authGateways, multiTenantRoles: !authGateways.multiTenantRoles })}
                  className={`p-1.5 rounded-lg border text-left flex items-center justify-between ${
                    authGateways.multiTenantRoles ? 'bg-[#a78bfa]/20 border-[#a78bfa] text-white' : 'bg-black border-zinc-800 text-zinc-500'
                  }`}
                >
                  <span>Multi-Tenant</span>
                  <span>{authGateways.multiTenantRoles ? 'ON' : 'OFF'}</span>
                </button>
              </div>
            )}

            {activeZone2Modal === 'pipeline' && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-zinc-300">
                  <span>JWT Parameters & Salt:</span>
                  <span className="text-[#00ff99] font-bold">RS256 4096-bit</span>
                </div>
                <div className="flex items-center justify-between text-zinc-300">
                  <span>HTTP-Only Cookie Flag:</span>
                  <span className="text-[#00e5ff] font-bold">Secure SameSite=Strict</span>
                </div>
                <div className="flex items-center justify-between text-zinc-300">
                  <span>Email Validation Workflow:</span>
                  <span className="text-[#8b5cf6] font-bold">6-Digit OTP</span>
                </div>
              </div>
            )}

            {activeZone2Modal === 'webhook' && (
              <div className="space-y-2">
                <div>
                  <label className="text-zinc-400 block mb-0.5">Target Destination URL</label>
                  <input
                    type="text"
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded px-2 py-1 text-white text-[9.5px]"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 block mb-0.5">Active Slack Stream</label>
                  <input
                    type="text"
                    value={slackWebhookStream}
                    onChange={(e) => setSlackWebhookStream(e.target.value)}
                    className="w-full bg-black border border-zinc-800 rounded px-2 py-1 text-white text-[9.5px]"
                  />
                </div>
              </div>
            )}

            {activeZone2Modal === 'security' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Max Request Threshold:</span>
                  <span className="text-[#ff007f] font-bold">{securityMaxReq} req/sec</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="500"
                  value={securityMaxReq}
                  onChange={(e) => setSecurityMaxReq(Number(e.target.value))}
                  className="w-full accent-[#ff007f] h-1 bg-zinc-800 rounded"
                />
                <div className="flex items-center justify-between pt-1">
                  <span className="text-zinc-400">CORS Access Tier:</span>
                  <select
                    value={corsTier}
                    onChange={(e) => setCorsTier(e.target.value as any)}
                    className="bg-black border border-zinc-800 text-[#00e5ff] rounded px-1.5 py-0.5"
                  >
                    <option value="Strict Origin">Strict Origin</option>
                    <option value="Wildcard *">Wildcard *</option>
                    <option value="Multi-Domain Allowed">Multi-Domain Allowed</option>
                  </select>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ======================================================== */}
      {/* ZONE 3: DEV-DECK TERMINALS & MIGRATION CONSOLES (45%)   */}
      {/* ======================================================== */}
      <div className="w-full h-[45%] bg-black p-3 flex flex-col justify-between overflow-y-auto border-t border-zinc-900 relative">
        
        {/* Tab Header for Zone 3 (Swagger | SQL | Migration) */}
        <div className="flex items-center justify-between gap-1 p-1 bg-[#08060c] rounded-xl border border-zinc-900 shrink-0 mb-2">
          {[
            { id: 'swagger', label: 'Live API Inspector', icon: Globe },
            { id: 'sql', label: 'SQL Raw Terminal', icon: Terminal },
            { id: 'migration', label: 'Migration Console', icon: Activity },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = zone3Tab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  triggerTactileHaptic(4, 'tap');
                  setZone3Tab(tab.id as any);
                }}
                className={`flex-1 py-1.5 px-1.5 rounded-lg text-[9.5px] font-mono font-bold flex items-center justify-center gap-1 transition ${
                  isActive
                    ? 'bg-[#00e5ff] text-slate-950 shadow-md shadow-[#00e5ff]/20'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* -------------------------------------------------------- */}
        {/* TAB FRAME 1: Swagger Style Live API Inspector            */}
        {/* -------------------------------------------------------- */}
        {zone3Tab === 'swagger' && (
          <div className="flex-1 flex flex-col justify-between space-y-2 overflow-y-auto pr-0.5">
            {/* Endpoints Micro-Buttons List */}
            <div className="space-y-1">
              {[
                { endpoint: 'GET /api/users', method: 'GET', color: '#00ff99' },
                { endpoint: 'POST /api/users', method: 'POST', color: '#00e5ff' },
                { endpoint: 'GET /api/products', method: 'GET', color: '#00ff99' },
                { endpoint: 'POST /api/products', method: 'POST', color: '#00e5ff' },
                { endpoint: 'GET /api/orders', method: 'GET', color: '#00ff99' },
                { endpoint: 'POST /api/orders', method: 'POST', color: '#00e5ff' },
                { endpoint: 'GET /api/messages', method: 'GET', color: '#00ff99' },
                { endpoint: 'POST /api/messages', method: 'POST', color: '#00e5ff' },
                { endpoint: 'POST /api/auth/signin', method: 'POST', color: '#8b5cf6' },
              ].map((row) => (
                <div
                  key={row.endpoint}
                  className="p-1.5 rounded-lg bg-[#08060c] border border-zinc-900 flex items-center justify-between text-[10px] font-mono"
                >
                  <div className="flex items-center gap-1.5">
                    <span 
                      style={{ color: row.color, borderColor: `${row.color}50` }} 
                      className="px-1.5 py-0.2 rounded border bg-black font-bold text-[8.5px]"
                    >
                      {row.method}
                    </span>
                    <span className="text-zinc-200">{row.endpoint.split(' ')[1]}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleTestSwaggerRequest(row.endpoint)}
                    className="px-2 py-0.5 rounded bg-[#00e5ff]/20 hover:bg-[#00e5ff]/35 text-[#00e5ff] font-bold text-[9px] border border-[#00e5ff]/40 active:scale-95 transition"
                  >
                    Test Request
                  </button>
                </div>
              ))}
            </div>

            {/* Live Response Payload Terminal */}
            <div className="p-2 rounded-xl bg-black border border-zinc-800 space-y-1 font-mono text-[9px]">
              <div className="flex items-center justify-between text-zinc-500 pb-1 border-b border-zinc-900">
                <span className="text-[#00ff99] flex items-center gap-1">
                  <Play className="w-2.5 h-2.5 fill-current" /> Response: 200 OK
                </span>
                <span className="text-zinc-400">{swaggerSelectedReq}</span>
              </div>
              <pre className="text-zinc-300 max-h-24 overflow-y-auto scrollbar-hide leading-relaxed">
                {swaggerExecuting ? 'Executing request...' : swaggerResponse}
              </pre>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------- */}
        {/* TAB FRAME 2: SQL Schema Raw Terminal                     */}
        {/* -------------------------------------------------------- */}
        {zone3Tab === 'sql' && (
          <div className="flex-1 flex flex-col justify-between space-y-2 overflow-hidden">
            {/* 3-way toggle slider navigation header + Copy Button */}
            <div className="flex items-center justify-between gap-1 pb-1 border-b border-zinc-900">
              <div className="flex items-center gap-1 bg-[#08060c] p-0.5 rounded-lg border border-zinc-800">
                {(['PostgreSQL', 'Prisma', 'Migration SQL'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => {
                      triggerTactileHaptic(4, 'tap');
                      setSqlFormat(fmt);
                    }}
                    className={`px-2 py-1 rounded text-[9px] font-mono font-bold transition ${
                      sqlFormat === fmt
                        ? 'bg-[#8b5cf6] text-white shadow-sm'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleCopyCode}
                className="px-2 py-1 rounded-lg bg-[#00ff99]/15 hover:bg-[#00ff99]/30 text-[#00ff99] border border-[#00ff99]/40 font-mono text-[9.5px] font-bold flex items-center gap-1 active:scale-95 transition"
              >
                {isCopiedSql ? <Check className="w-3 h-3 text-[#00ff99]" /> : <Copy className="w-3 h-3 text-[#00ff99]" />}
                <span>{isCopiedSql ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            {/* Code Output Terminal Block */}
            <div className="flex-1 p-2 rounded-xl bg-[#08060c] border border-zinc-900 overflow-y-auto font-mono text-[9px] leading-relaxed text-[#00e5ff]">
              <pre className="whitespace-pre-wrap">{getDynamicCodeSnippet()}</pre>
            </div>
          </div>
        )}

        {/* -------------------------------------------------------- */}
        {/* TAB FRAME 3: Database Migration Console Workspace        */}
        {/* -------------------------------------------------------- */}
        {zone3Tab === 'migration' && (
          <div className="flex-1 flex flex-col justify-between space-y-2 overflow-y-auto">
            {/* 3-Column Deployment Timeline Model Card */}
            <div className="grid grid-cols-3 gap-1.5 text-center font-mono text-[9px] h-full">
              
              {/* Column 1: Development 2 Staged */}
              <div className="p-2 rounded-xl bg-[#08060c] border border-zinc-900 flex flex-col justify-between space-y-1.5">
                <div>
                  <span className="text-[9.5px] font-bold text-[#00e5ff] block mb-1">
                    Development
                  </span>
                  <span className="text-[8px] text-zinc-500 uppercase block">2 Staged</span>
                </div>

                <div className="space-y-1.5 my-auto text-left">
                  <div className="p-1 rounded bg-black border border-zinc-800 text-[8px] text-zinc-300">
                    <span className="text-[#00e5ff] block font-bold">messages_body_ind</span>
                    <span className="text-zinc-500">2026-10-16_messages_body_ind_promote_staged</span>
                  </div>
                  <div className="p-1 rounded bg-black border border-zinc-800 text-[8px] text-zinc-300">
                    <span className="text-[#00e5ff] block font-bold">users_row_enum</span>
                    <span className="text-zinc-500">2026-10-16_users_row_enum_promote_staged</span>
                  </div>
                </div>

                <span className="text-[7.5px] text-zinc-500">Local Schema Synced</span>
              </div>

              {/* Column 2: Staged 1 with [Promote Live] High-Intensity Button */}
              <div className="p-2 rounded-xl bg-[#0d0a1c] border border-[#8b5cf6]/40 flex flex-col justify-between space-y-1.5 shadow-[0_0_15px_rgba(139,92,246,0.15)]">
                <div>
                  <span className="text-[9.5px] font-bold text-[#8b5cf6] block mb-1">
                    Staged 1
                  </span>
                  <span className="text-[8px] text-zinc-400 uppercase block">Pending Deploy</span>
                </div>

                <div className="p-1.5 rounded bg-black border border-[#8b5cf6]/50 text-left my-auto space-y-1">
                  <span className="text-[#a78bfa] block font-bold text-[8.5px]">orders_total_numeric</span>
                  <p className="text-zinc-400 text-[7.5px] leading-tight">
                    2026-10-16_orders_total_numeric
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handlePromoteLive}
                  disabled={migrationPromoteState === 'applied' || migrationPromoteState === 'promoting'}
                  className={`w-full py-1.5 rounded-lg font-black font-mono text-[9px] uppercase tracking-wider flex items-center justify-center gap-1 shadow-lg transition active:scale-95 ${
                    migrationPromoteState === 'applied'
                      ? 'bg-[#00ff99]/20 text-[#00ff99] border border-[#00ff99]'
                      : 'bg-gradient-to-r from-[#8b5cf6] to-[#ff007f] text-white shadow-[#ff007f]/30 hover:opacity-95'
                  }`}
                >
                  <Zap className={`w-3 h-3 ${migrationPromoteState === 'promoting' ? 'animate-spin' : ''}`} />
                  <span>{migrationPromoteState === 'applied' ? 'Live Promoted' : 'Promote Live'}</span>
                </button>
              </div>

              {/* Column 3: Live Production 1 */}
              <div className="p-2 rounded-xl bg-[#08060c] border border-[#00ff99]/30 flex flex-col justify-between space-y-1.5">
                <div>
                  <span className="text-[9.5px] font-bold text-[#00ff99] block mb-1">
                    Live Production
                  </span>
                  <span className="text-[8px] text-zinc-500 uppercase block">1 Active</span>
                </div>

                <div className="p-1.5 rounded bg-black border border-[#00ff99]/30 text-left my-auto space-y-1">
                  <span className="text-[#00ff99] font-bold text-[8.5px] flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5 text-[#00ff99]" />
                    init_schema
                  </span>
                  <p className="text-zinc-400 text-[7.5px]">
                    2026-10-15_init_schema
                  </p>
                  <span className="text-[#00ff99] font-bold text-[8px] block">
                    applied to production
                  </span>
                </div>

                <span className="text-[7.5px] text-[#00ff99]">Zero-Downtime Safe</span>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
