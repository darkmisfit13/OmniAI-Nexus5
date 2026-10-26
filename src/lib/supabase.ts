import { createClient, User, Session } from '@supabase/supabase-js';

// Retrieve Supabase credentials from Vite environment
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://sernddvfnlaioxiqpbxu.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  'sb_publishable_bmPjE80s08494qk5ztzptQ_tjSRlpiM';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[OmniAI Supabase] VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY is not defined in the environment.'
  );
}

// Client-side Supabase client instance with localStorage session persistence
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'omni-phone-supabase-auth',
  },
});

export interface ChatThreadItem {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessageRecord {
  id: string;
  user_id: string;
  thread_id: string;
  sdk_id: string;
  message: any;
  created_at: string;
}

export interface UserProfile {
  id: string;
  display_name: string;
  avatar_url: string | null;
  created_at: string;
}

// -------------------------------------------------------------
// Authentication Helpers
// -------------------------------------------------------------

export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (err) {
    console.error('Error fetching current Supabase user:', err);
    return null;
  }
}

export async function requireSupabaseUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Sign in to chat.');
  }
  return user;
}

export async function getSession(): Promise<Session | null> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  } catch (err) {
    console.error('Error fetching Supabase session:', err);
    return null;
  }
}

export function onAuthStateChange(callback: (user: User | null, session: Session | null) => void) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null, session);
  });
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });
  if (error) throw error;
  return data;
}

export async function signUpWithEmail(email: string, password: string, displayName?: string) {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: {
      data: {
        display_name: displayName || email.split('@')[0],
      },
    },
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.warn('Error fetching profile:', error);
    return null;
  }
  return data as UserProfile | null;
}

// -------------------------------------------------------------
// Chat Thread Operations (Enforces user_id ownership via RLS)
// -------------------------------------------------------------

export async function listChatThreads(userId: string): Promise<ChatThreadItem[]> {
  const { data, error } = await supabase
    .from('chat_threads')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) {
    console.error('Error listing chat threads:', error);
    throw error;
  }
  return (data || []) as ChatThreadItem[];
}

export async function createChatThread(userId: string, title = 'New conversation'): Promise<ChatThreadItem> {
  const { data, error } = await supabase
    .from('chat_threads')
    .insert({
      user_id: userId,
      title: title.slice(0, 100),
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating chat thread:', error);
    throw error;
  }
  return data as ChatThreadItem;
}

export async function renameChatThread(threadId: string, userId: string, newTitle: string): Promise<void> {
  const { error } = await supabase
    .from('chat_threads')
    .update({
      title: newTitle.trim().slice(0, 100),
      updated_at: new Date().toISOString(),
    })
    .eq('id', threadId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error renaming chat thread:', error);
    throw error;
  }
}

export async function deleteChatThread(threadId: string, userId: string): Promise<void> {
  // 1. Delete associated AI memories
  await supabase
    .from('ai_memories')
    .delete()
    .eq('user_id', userId)
    .eq('source_thread_id', threadId);

  // 2. Delete thread (cascades to chat_messages via foreign key)
  const { error } = await supabase
    .from('chat_threads')
    .delete()
    .eq('id', threadId)
    .eq('user_id', userId);

  if (error) {
    console.error('Error deleting chat thread:', error);
    throw error;
  }
}

// -------------------------------------------------------------
// Chat Messages Operations (Enforces thread_id & user_id via RLS)
// -------------------------------------------------------------

export async function loadThreadMessages(threadId: string, userId: string): Promise<ChatMessageRecord[]> {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('thread_id', threadId)
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error loading thread messages:', error);
    throw error;
  }
  return (data || []) as ChatMessageRecord[];
}

export async function saveChatMessage(
  threadId: string,
  userId: string,
  sdkId: string,
  messagePayload: any
): Promise<void> {
  const { error } = await supabase
    .from('chat_messages')
    .upsert(
      {
        user_id: userId,
        thread_id: threadId,
        sdk_id: sdkId,
        message: messagePayload,
      },
      { onConflict: 'thread_id,sdk_id' }
    );

  if (error) {
    console.error('Error saving chat message:', error);
    throw error;
  }

  // Touch thread updated_at timestamp
  await supabase
    .from('chat_threads')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', threadId)
    .eq('user_id', userId);
}

// -------------------------------------------------------------
// Vault Assets Operations (Protected by Supabase Row Level Security)
// -------------------------------------------------------------

export interface VaultAsset {
  id: string;
  name: string;
  type: 'audio' | 'video' | 'image' | 'code' | 'text';
  studioSource?: string;
  duration?: string;
  resolution?: string;
  lyrics?: string;
  bpm?: number;
  thumbnailUrl?: string;
  audioUrl?: string;
  codeSnippet?: string;
  text?: string;
  tags?: string[];
  createdAt: string;
}

export async function listVaultAssets(userId: string): Promise<VaultAsset[]> {
  const { data, error } = await supabase
    .from('vault_assets')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[Supabase Vault] Query failure:', error);
    throw new Error(`Supabase Vault query failed: ${error.message} (Code: ${error.code || 'UNKNOWN'})`);
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    name: row.name,
    type: row.type,
    studioSource: row.studio_source || undefined,
    duration: row.duration || undefined,
    resolution: row.resolution || undefined,
    lyrics: row.lyrics || undefined,
    bpm: row.bpm || undefined,
    thumbnailUrl: row.thumbnail_url || undefined,
    audioUrl: row.audio_url || undefined,
    codeSnippet: row.code_snippet || undefined,
    text: row.text || undefined,
    tags: row.tags || undefined,
    createdAt: row.created_at || new Date().toISOString(),
  }));
}

export async function saveVaultAsset(userId: string, asset: VaultAsset): Promise<void> {
  const payload = {
    id: asset.id,
    user_id: userId,
    name: asset.name,
    type: asset.type,
    studio_source: asset.studioSource || null,
    duration: asset.duration || null,
    resolution: asset.resolution || null,
    lyrics: asset.lyrics || null,
    bpm: asset.bpm || null,
    thumbnail_url: asset.thumbnailUrl || null,
    audio_url: asset.audioUrl || null,
    code_snippet: asset.codeSnippet || null,
    text: asset.text || null,
    tags: asset.tags || [],
    created_at: asset.createdAt || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from('vault_assets')
    .upsert(payload, { onConflict: 'id' });

  if (error) {
    console.error('[Supabase Vault] Error saving asset:', error.message);
    throw error;
  }
}

export async function deleteVaultAsset(userId: string, assetId: string): Promise<void> {
  const { error } = await supabase
    .from('vault_assets')
    .delete()
    .eq('id', assetId)
    .eq('user_id', userId);

  if (error) {
    console.error('[Supabase Vault] Error deleting asset:', error.message);
    throw error;
  }
}

// -------------------------------------------------------------
// Nexus Call Active State Realtime Sync (nexus_active_state_sync)
// -------------------------------------------------------------

export interface NexusActiveStateRecord {
  id?: string;
  user_id?: string | null;
  caller_name: string;
  caller_role?: string;
  speech_to_text: string;
  active_tone: 'Professional' | 'Casual' | 'Flirty' | 'Funny';
  strategist_response: string;
  empath_response: string;
  ghost_response: string;
  synthesis_response: string;
  subtext_hidden_intent?: string;
  subtext_friction?: string;
  subtext_leverage?: string;
  catch_me_up?: string[];
  created_at?: string;
  updated_at?: string;
}

/**
 * Initializes a persistent WebSocket Realtime subscription to the nexus_active_state_sync table.
 */
export function subscribeToNexusActiveStateSync(
  callerName: string,
  onRecord: (record: NexusActiveStateRecord) => void,
  onStatusChange?: (status: 'SUBSCRIBED' | 'TIMED_OUT' | 'CLOSED' | 'CHANNEL_ERROR', err?: any) => void
) {
  const channelTopic = `nexus_call_sync_${callerName.replace(/[^a-zA-Z0-9_-]/g, '_')}_${Date.now()}`;
  const channel = supabase
    .channel(channelTopic)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'nexus_active_state_sync',
      },
      (payload) => {
        if (payload.new && typeof payload.new === 'object') {
          const rec = payload.new as any;
          // Filter by caller name if specified, or emit all records for the session
          if (!callerName || rec.caller_name === callerName || rec.caller_name === '*' || !rec.caller_name) {
            onRecord({
              id: rec.id,
              user_id: rec.user_id,
              caller_name: rec.caller_name,
              caller_role: rec.caller_role,
              speech_to_text: rec.speech_to_text,
              active_tone: rec.active_tone || 'Professional',
              strategist_response: rec.strategist_response,
              empath_response: rec.empath_response,
              ghost_response: rec.ghost_response,
              synthesis_response: rec.synthesis_response,
              subtext_hidden_intent: rec.subtext_hidden_intent,
              subtext_friction: rec.subtext_friction,
              subtext_leverage: rec.subtext_leverage,
              catch_me_up: Array.isArray(rec.catch_me_up) ? rec.catch_me_up : undefined,
              created_at: rec.created_at,
              updated_at: rec.updated_at,
            });
          }
        }
      }
    )
    .subscribe((status, err) => {
      if (onStatusChange) {
        onStatusChange(status as any, err);
      }
    });

  return channel;
}

/**
 * Writes or patches a new sync row into public.nexus_active_state_sync.
 */
export async function pushNexusActiveState(
  state: Partial<NexusActiveStateRecord>
): Promise<NexusActiveStateRecord | null> {
  const row = {
    id: state.id || `nexus-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    user_id: state.user_id || null,
    caller_name: state.caller_name || 'Active Caller',
    caller_role: state.caller_role || 'Contact',
    speech_to_text: state.speech_to_text || '',
    active_tone: state.active_tone || 'Professional',
    strategist_response: state.strategist_response || '',
    empath_response: state.empath_response || '',
    ghost_response: state.ghost_response || '',
    synthesis_response: state.synthesis_response || '',
    subtext_hidden_intent: state.subtext_hidden_intent || null,
    subtext_friction: state.subtext_friction || null,
    subtext_leverage: state.subtext_leverage || null,
    catch_me_up: state.catch_me_up || [],
    created_at: state.created_at || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase
      .from('nexus_active_state_sync')
      .upsert(row, { onConflict: 'id' })
      .select()
      .maybeSingle();

    if (error) {
      console.warn('[Supabase Nexus Sync] push error (falling back to local):', error.message);
      return row as NexusActiveStateRecord;
    }
    return (data || row) as NexusActiveStateRecord;
  } catch (err: any) {
    console.warn('[Supabase Nexus Sync] Network error pushing state:', err?.message || err);
    return row as NexusActiveStateRecord;
  }
}

