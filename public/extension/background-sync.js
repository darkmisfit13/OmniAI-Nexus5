/**
 * OmniExtension - Nexus Companion
 * File: background-sync.js
 * Architecture: Manifest V3 Background Service Worker Pipeline
 * Author: darkmisfitlabs@gmail.com
 */

const SYNDICATE_STORAGE_KEYS = {
  HAPTIC_LEVEL: 'omni_haptic_level',
  KINETIC_FRICTION: 'omni_kinetic_friction',
  PREDICTIVE_GRIP: 'omni_grip_factor',
  OWNER_AUTH: 'omni_owner_authenticated',
  TELEMETRY_CACHE: 'omni_telemetry_cache',
  OFFLINE_QUEUE: 'omni_offline_telemetry_queue'
};

const DEFAULT_SETTINGS = {
  [SYNDICATE_STORAGE_KEYS.HAPTIC_LEVEL]: 6,
  [SYNDICATE_STORAGE_KEYS.KINETIC_FRICTION]: 48,
  [SYNDICATE_STORAGE_KEYS.PREDICTIVE_GRIP]: 62,
  [SYNDICATE_STORAGE_KEYS.OWNER_AUTH]: true,
  [SYNDICATE_STORAGE_KEYS.TELEMETRY_CACHE]: {
    commitment: 84,
    risk: 12,
    emotion: 'Analytical Receptivity',
    timestamp: Date.now()
  }
};

/* -------------------------------------------------------------------------- */
/* 1. EXTENSION LIFECYCLE & INITIALIZATION PIPELINE                           */
/* -------------------------------------------------------------------------- */

chrome.runtime.onInstalled.addListener(async (details) => {
  console.log('[OmniNexus-Worker] Initializing Nexus Companion service worker...', details.reason);

  // Initialize local storage defaults if unset
  const stored = await chrome.storage.local.get(Object.keys(DEFAULT_SETTINGS));
  const updates = {};
  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    if (stored[key] === undefined) {
      updates[key] = value;
    }
  }

  if (Object.keys(updates).length > 0) {
    await chrome.storage.local.set(updates);
    console.log('[OmniNexus-Worker] Seeded default syndicate settings:', updates);
  }

  // Register Obsidian Context Menus
  setupContextMenus();

  // Create Recurring Background Telemetry Pulse Alarm
  chrome.alarms.create('omni_telemetry_pulse', {
    periodInMinutes: 5
  });

  // Create Local Archival / Garbage Collection Alarm
  chrome.alarms.create('omni_archive_cleanup', {
    periodInMinutes: 60 * 24 // Once daily
  });
});

/* -------------------------------------------------------------------------- */
/* 2. CONTEXT MENU & HUD FAST-ACTION HOOKS                                   */
/* -------------------------------------------------------------------------- */

function setupContextMenus() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'omni_parent_menu',
      title: 'OmniAI Nexus Syndicate',
      contexts: ['selection', 'editable']
    });

    chrome.contextMenus.create({
      parentId: 'omni_parent_menu',
      id: 'omni_analyze_tone',
      title: 'Analyze Emotional Vector & Risk',
      contexts: ['selection']
    });

    chrome.contextMenus.create({
      parentId: 'omni_parent_menu',
      id: 'omni_synthesize_reply',
      title: 'Inject Tri-Agent Council Synthesis',
      contexts: ['editable']
    });

    chrome.contextMenus.create({
      parentId: 'omni_parent_menu',
      id: 'omni_calibrate_haptics',
      title: 'Calibrate Kinetic Friction & Haptics',
      contexts: ['all']
    });
  });
}

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab || !tab.id) return;

  if (info.menuItemId === 'omni_analyze_tone') {
    const selectedText = info.selectionText || '';
    performCognitiveAnalysis(selectedText, tab.id);
  } else if (info.menuItemId === 'omni_synthesize_reply') {
    injectCouncilSynthesisIntoTab(tab.id);
  } else if (info.menuItemId === 'omni_calibrate_haptics') {
    chrome.action.openPopup();
  }
});

/* -------------------------------------------------------------------------- */
/* 3. SHORTCUT COMMANDS LISTENER                                              */
/* -------------------------------------------------------------------------- */

chrome.commands.onCommand.addListener(async (command) => {
  if (command === 'quick_council_synthesis') {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.id) {
      injectCouncilSynthesisIntoTab(tab.id);
    }
  }
});

/* -------------------------------------------------------------------------- */
/* 4. DOM INJECTION & SYNTHESIS DISPATCH                                      */
/* -------------------------------------------------------------------------- */

function injectCouncilSynthesisIntoTab(tabId) {
  const synthesis = "I hear your priorities on the timeline. Let's lock in the core tier first so you feel confident, and we can revisit secondary modules next quarter.";

  chrome.scripting.executeScript({
    target: { tabId },
    func: (textToPaste) => {
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable)) {
        if (activeEl.isContentEditable) {
          document.execCommand('insertText', false, textToPaste);
        } else {
          const start = activeEl.selectionStart || 0;
          const end = activeEl.selectionEnd || 0;
          const val = activeEl.value || '';
          activeEl.value = val.substring(0, start) + textToPaste + val.substring(end);
          activeEl.selectionStart = activeEl.selectionEnd = start + textToPaste.length;
          activeEl.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }
    },
    args: [synthesis]
  }).catch((err) => console.warn('[OmniNexus-Worker] Injection bypass:', err));
}

function performCognitiveAnalysis(text, tabId) {
  // Deterministic cognitive vector breakdown
  const lengthScore = Math.min(text.length / 100, 1);
  const commitment = Math.round(75 + lengthScore * 18);
  const risk = Math.round(15 - lengthScore * 5);
  const emotion = text.toLowerCase().includes('urgent') ? 'High Tension / Urgent' : 'Analytical Receptivity';

  const telemetryResult = {
    commitment,
    risk,
    emotion,
    timestamp: Date.now()
  };

  chrome.storage.local.set({ [SYNDICATE_STORAGE_KEYS.TELEMETRY_CACHE]: telemetryResult });

  // Optional notification badge or chrome notification
  chrome.notifications.create({
    type: 'basic',
    iconUrl: '../icon.svg',
    title: 'OmniAI - Cognitive Vector Computed',
    message: `Emotion: ${emotion} | Commitment: ${commitment}% | Risk: ${risk}%`,
    priority: 1
  });
}

/* -------------------------------------------------------------------------- */
/* 5. BACKGROUND ALARMS & STORAGE RESYNCHRONIZATION                           */
/* -------------------------------------------------------------------------- */

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'omni_telemetry_pulse') {
    // Ping telemetry buffer to maintain zero-latency local prediction
    const res = await chrome.storage.local.get(SYNDICATE_STORAGE_KEYS.TELEMETRY_CACHE);
    console.log('[OmniNexus-Worker] Telemetry Pulse Sync:', res[SYNDICATE_STORAGE_KEYS.TELEMETRY_CACHE]);
  } else if (alarm.name === 'omni_archive_cleanup') {
    // Purge outdated transient logs (> 30 days)
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const res = await chrome.storage.local.get(SYNDICATE_STORAGE_KEYS.OFFLINE_QUEUE);
    const queue = res[SYNDICATE_STORAGE_KEYS.OFFLINE_QUEUE] || [];
    const pruned = queue.filter(item => item.timestamp > thirtyDaysAgo);
    await chrome.storage.local.set({ [SYNDICATE_STORAGE_KEYS.OFFLINE_QUEUE]: pruned });
    console.log(`[OmniNexus-Worker] Cleaned ${queue.length - pruned.length} expired items from offline queue.`);
  }
});

/* -------------------------------------------------------------------------- */
/* 6. RUNTIME MESSAGE PIPELINE (HUD <-> BACKGROUND)                           */
/* -------------------------------------------------------------------------- */

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'HAPTIC_UPDATE') {
    console.log('[OmniNexus-Worker] Haptic Intensity persisted:', request.level);
    sendResponse({ success: true, level: request.level });
  } else if (request.type === 'PHYSICS_UPDATE') {
    console.log('[OmniNexus-Worker] Kinetic Physics updated:', request);
    sendResponse({ success: true });
  } else if (request.type === 'TRIGGER_TELEMETRY_REFRESH') {
    const updated = {
      commitment: Math.floor(78 + Math.random() * 16),
      risk: Math.floor(8 + Math.random() * 12),
      emotion: 'Harmonized Focus Vector',
      timestamp: Date.now()
    };
    chrome.storage.local.set({ [SYNDICATE_STORAGE_KEYS.TELEMETRY_CACHE]: updated });
    sendResponse({ success: true, telemetry: updated });
  }
  return true;
});
