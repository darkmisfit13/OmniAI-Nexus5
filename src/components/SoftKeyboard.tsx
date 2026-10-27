import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { 
  Delete, 
  ArrowUp, 
  Smile, 
  CornerDownLeft, 
  Volume2, 
  VolumeX,
  ChevronDown,
  Sparkles,
  Zap,
  Activity,
  Fingerprint
} from 'lucide-react';
import { getHapticPattern } from '../lib/hapticFeedback';

// Built-in high-confidence dictionary for gesture/swipe word resolution
const SWIPE_DICTIONARY = [
  'the', 'to', 'and', 'in', 'is', 'it', 'you', 'that', 'he', 'was', 'for', 'on', 'are', 'with', 'as', 'at',
  'be', 'this', 'have', 'from', 'or', 'one', 'had', 'by', 'word', 'but', 'not', 'what', 'all', 'were', 'we',
  'when', 'your', 'can', 'said', 'there', 'use', 'an', 'each', 'which', 'she', 'do', 'how', 'their', 'if',
  'will', 'up', 'other', 'about', 'out', 'many', 'then', 'them', 'these', 'so', 'some', 'her', 'would', 'make',
  'like', 'him', 'into', 'time', 'has', 'look', 'two', 'more', 'write', 'go', 'see', 'number', 'no', 'way',
  'could', 'people', 'my', 'than', 'first', 'water', 'been', 'call', 'who', 'oil', 'its', 'now', 'find', 'long',
  'down', 'day', 'did', 'get', 'come', 'made', 'may', 'part', 'over', 'new', 'sound', 'take', 'only', 'little',
  'work', 'know', 'place', 'year', 'live', 'me', 'back', 'give', 'most', 'very', 'after', 'thing', 'our', 'just',
  'name', 'good', 'sentence', 'man', 'think', 'say', 'great', 'where', 'help', 'through', 'much', 'before',
  'line', 'right', 'too', 'mean', 'old', 'any', 'same', 'tell', 'boy', 'follow', 'came', 'want', 'show', 'also',
  'around', 'farm', 'three', 'small', 'set', 'put', 'end', 'does', 'another', 'well', 'large', 'must', 'big',
  'even', 'such', 'because', 'turn', 'here', 'why', 'ask', 'went', 'men', 'read', 'need', 'land', 'different',
  'home', 'us', 'move', 'try', 'kind', 'hand', 'picture', 'again', 'change', 'off', 'play', 'spell', 'air',
  'away', 'animal', 'house', 'point', 'page', 'letter', 'mother', 'answer', 'found', 'study', 'still', 'learn',
  'should', 'america', 'world', 'high', 'every', 'near', 'add', 'food', 'between', 'own', 'below', 'country',
  'plant', 'last', 'school', 'father', 'keep', 'tree', 'never', 'start', 'city', 'earth', 'eye', 'light', 'thought',
  // Domain specific tech & conversational vocabulary
  'hello', 'hey', 'thanks', 'thank', 'please', 'awesome', 'ready', 'yes', 'sure', 'sounds', 'perfect',
  'update', 'status', 'milestone', 'deploy', 'deployment', 'verified', 'staging', 'production', 'review',
  'patch', 'fixed', 'audit', 'invoice', 'client', 'meeting', 'confirm', 'confirmed', 'quick', 'today',
  'tomorrow', 'working', 'progress', 'auth', 'token', 'secure', 'team', 'done', 'send', 'sent', 'test',
  'clean', 'code', 'build', 'commit', 'branch', 'staging', 'pricing', 'agree', 'collaborate', 'locked',
  'optimal', 'latency', 'interface', 'kinetic', 'biometric', 'friction', 'predictive', 'vector', 'matrix'
];

interface SoftKeyboardProps {
  onKeyPress: (char: string) => void;
  onBackspace: () => void;
  onEnter: () => void;
  onSpace: () => void;
  onSwipeWord?: (word: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  currentDraftText?: string;
  kineticFriction?: number;
  predictiveGripFactor?: number;
}

export const SoftKeyboard: React.FC<SoftKeyboardProps> = ({
  onKeyPress,
  onBackspace,
  onEnter,
  onSpace,
  onSwipeWord,
  isCollapsed = false,
  onToggleCollapse,
  currentDraftText = '',
  kineticFriction: propKineticFriction,
  predictiveGripFactor: propPredictiveGrip,
}) => {
  const [isShift, setIsShift] = useState(false);
  const [layoutMode, setLayoutMode] = useState<'alpha' | 'numbers' | 'symbols'>('alpha');
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [glideTypingEnabled, setGlideTypingEnabled] = useState(true);

  // Swipe / Glide Gesture State
  const [isSwiping, setIsSwiping] = useState(false);
  const [swipePoints, setSwipePoints] = useState<Array<{ x: number; y: number }>>([]);
  const [traversedKeys, setTraversedKeys] = useState<string[]>([]);
  const [lastSwipedWord, setLastSwipedWord] = useState<string | null>(null);
  const [frictionDampened, setFrictionDampened] = useState(false);

  // Cadence telemetry for Kinetic Friction
  const keyCadenceHistory = useRef<number[]>([]);
  const keyboardContainerRef = useRef<HTMLDivElement>(null);

  // Sync physics parameters from storage if not passed directly
  const [localFriction, setLocalFriction] = useState(50);
  const [localGrip, setLocalGrip] = useState(65);

  useEffect(() => {
    const readStorage = () => {
      try {
        const storedFriction = localStorage.getItem('omni_kinetic_friction');
        if (storedFriction) setLocalFriction(parseInt(storedFriction, 10));
        const storedGrip = localStorage.getItem('omni_predictive_grip');
        if (storedGrip) setLocalGrip(parseInt(storedGrip, 10));
      } catch {}
    };
    readStorage();
    const handleUpdate = () => readStorage();
    window.addEventListener('omni_kinetic_updated', handleUpdate);
    return () => window.removeEventListener('omni_kinetic_updated', handleUpdate);
  }, []);

  const effectiveFriction = propKineticFriction ?? localFriction;
  const effectiveGrip = propPredictiveGrip ?? localGrip;

  // Tactile physical confirmation via Navigator Vibrate API
  const triggerHaptic = (overrideDuration?: number | number[], type: 'tap' | 'enter' | 'delete' | 'space' = 'tap') => {
    try {
      if (typeof window !== 'undefined' && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        const isEnabled = localStorage.getItem('omni_haptic_enabled') !== 'false';
        if (!isEnabled) return;

        if (overrideDuration !== undefined) {
          navigator.vibrate(overrideDuration);
          return;
        }

        const level = parseInt(localStorage.getItem('omni_haptic_level') || '6', 10);
        navigator.vibrate(getHapticPattern(level, type));
      }
    } catch {}
  };

  // Inspect typing cadence & trigger Kinetic Friction micro-haptics on erratic bursts
  const recordCadenceAndApplyFriction = () => {
    const now = Date.now();
    const history = keyCadenceHistory.current;
    history.push(now);
    if (history.length > 6) history.shift();

    if (history.length >= 4) {
      const intervals = [];
      for (let i = 1; i < history.length; i++) {
        intervals.push(history[i] - history[i - 1]);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      
      // Erratic / rapid typing cadence detected (< 110ms with high friction setting)
      if (avgInterval < 110 && effectiveFriction > 35) {
        setFrictionDampened(true);
        triggerHaptic([6, 12, 6], 'tap');
        setTimeout(() => setFrictionDampened(false), 800);
      }
    }
  };

  // Play mechanical switch click sound using Web Audio API
  const playClick = (type: 'standard' | 'space' | 'enter' | 'swipe' = 'standard') => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      const freq = type === 'space' ? 420 : type === 'enter' ? 880 : type === 'swipe' ? 580 : 640;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, audioCtx.currentTime + 0.035);
      
      gain.gain.setValueAtTime(0.09, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.035);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.035);
    } catch {}
  };

  // Character Probability Map based on current word prefix for Dynamic Hit-Box Scaling
  const predictedNextChars = useMemo(() => {
    if (!currentDraftText) return new Set<string>();
    const trimmed = currentDraftText.trimEnd();
    const lastWord = trimmed.split(/[\s,.-]+/).pop()?.toLowerCase() || '';
    if (!lastWord) return new Set<string>();

    const matches = SWIPE_DICTIONARY.filter(w => w.startsWith(lastWord) && w.length > lastWord.length);
    const nextChars = new Set<string>();
    matches.forEach(m => {
      const char = m[lastWord.length];
      if (char) nextChars.add(char);
    });

    // Fallback common phonetic bigrams if dictionary has no match
    if (nextChars.size === 0 && lastWord.length > 0) {
      const lastChar = lastWord[lastWord.length - 1];
      const bigramRules: Record<string, string[]> = {
        t: ['h', 'e', 'o', 'r', 'a', 'i'],
        s: ['t', 'h', 'e', 'a', 'o', 'p'],
        h: ['e', 'a', 'i', 'o'],
        w: ['h', 'e', 'a', 'o', 'i'],
        d: ['e', 'o', 'a', 'i'],
        c: ['h', 'o', 'a', 'e', 'k'],
        p: ['r', 'l', 'e', 'a', 'o'],
        m: ['e', 'a', 'o', 'i'],
        f: ['o', 'e', 'a', 'i', 'r'],
      };
      (bigramRules[lastChar] || ['e', 'a', 'o', 'i', 's']).forEach(c => nextChars.add(c));
    }
    return nextChars;
  }, [currentDraftText]);

  // Handle single tap key
  const handleKey = (char: string) => {
    recordCadenceAndApplyFriction();
    triggerHaptic(10);
    playClick('standard');
    setActiveKey(char);
    setTimeout(() => setActiveKey(null), 120);
    const finalChar = isShift ? char.toUpperCase() : char.toLowerCase();
    onKeyPress(finalChar);
  };

  const handleBackspaceClick = () => {
    recordCadenceAndApplyFriction();
    triggerHaptic(14, 'delete');
    playClick('standard');
    setActiveKey('backspace');
    setTimeout(() => setActiveKey(null), 120);
    onBackspace();
  };

  const handleSpaceClick = () => {
    recordCadenceAndApplyFriction();
    triggerHaptic(12, 'space');
    playClick('space');
    setActiveKey('space');
    setTimeout(() => setActiveKey(null), 120);
    onSpace();
  };

  const handleEnterClick = () => {
    triggerHaptic([15, 20, 15], 'enter');
    playClick('enter');
    setActiveKey('enter');
    setTimeout(() => setActiveKey(null), 120);
    onEnter();
  };

  // Helper to resolve key under pointer coordinates
  const getKeyFromPoint = (clientX: number, clientY: number): string | null => {
    const elem = document.elementFromPoint(clientX, clientY);
    if (!elem) return null;
    const keyElem = elem.closest('[data-key]');
    if (keyElem) {
      return keyElem.getAttribute('data-key');
    }
    return null;
  };

  // =========================================================================
  // SWIPE-TO-TEXT / GLIDE TYPING ENGINE
  // =========================================================================
  const handleGestureStart = (clientX: number, clientY: number) => {
    if (!glideTypingEnabled || layoutMode !== 'alpha') return;
    const rect = keyboardContainerRef.current?.getBoundingClientRect();
    if (!rect) return;

    setIsSwiping(true);
    const initialKey = getKeyFromPoint(clientX, clientY);
    const relX = clientX - rect.left;
    const relY = clientY - rect.top;

    setSwipePoints([{ x: relX, y: relY }]);
    setTraversedKeys(initialKey ? [initialKey.toLowerCase()] : []);
    if (initialKey) triggerHaptic(8);
  };

  const handleGestureMove = (clientX: number, clientY: number) => {
    if (!isSwiping || !keyboardContainerRef.current) return;
    const rect = keyboardContainerRef.current.getBoundingClientRect();
    const relX = clientX - rect.left;
    const relY = clientY - rect.top;

    setSwipePoints(prev => [...prev.slice(-35), { x: relX, y: relY }]);

    const key = getKeyFromPoint(clientX, clientY);
    if (key && /^[a-zA-Z]$/.test(key)) {
      const lowerKey = key.toLowerCase();
      setTraversedKeys(prev => {
        if (prev.length === 0 || prev[prev.length - 1] !== lowerKey) {
          triggerHaptic(6);
          return [...prev, lowerKey];
        }
        return prev;
      });
    }
  };

  const resolveSwipedWord = (keys: string[]): string | null => {
    if (keys.length < 2) return null;
    const startChar = keys[0];
    const endChar = keys[keys.length - 1];

    // Score candidates from dictionary
    let bestWord: string | null = null;
    let highestScore = -1;

    for (const candidate of SWIPE_DICTIONARY) {
      if (candidate.length < 2) continue;
      if (candidate[0] !== startChar || candidate[candidate.length - 1] !== endChar) continue;

      // Check if candidate matches subsequence of traversed keys
      let keyIndex = 0;
      let matchedCount = 0;
      for (let i = 0; i < candidate.length; i++) {
        const char = candidate[i];
        while (keyIndex < keys.length && keys[keyIndex] !== char) {
          keyIndex++;
        }
        if (keyIndex < keys.length && keys[keyIndex] === char) {
          matchedCount++;
          keyIndex++;
        }
      }

      const matchRatio = matchedCount / candidate.length;
      if (matchRatio >= 0.75) {
        const score = matchRatio * 100 - Math.abs(candidate.length - keys.length) * 2;
        if (score > highestScore) {
          highestScore = score;
          bestWord = candidate;
        }
      }
    }

    if (bestWord) return bestWord;

    // Fallback heuristic: condense duplicate traversed letters
    const deduplicated = keys.filter((k, idx) => idx === 0 || k !== keys[idx - 1]).join('');
    return deduplicated.length >= 2 ? deduplicated : null;
  };

  const handleGestureEnd = () => {
    if (!isSwiping) return;
    setIsSwiping(false);
    setSwipePoints([]);

    if (traversedKeys.length >= 2) {
      const resolved = resolveSwipedWord(traversedKeys);
      if (resolved) {
        triggerHaptic([14, 18, 14]);
        playClick('swipe');
        setLastSwipedWord(resolved);

        if (onSwipeWord) {
          onSwipeWord(resolved);
        } else {
          // Fallback: type out word with space
          for (let i = 0; i < resolved.length; i++) {
            onKeyPress(resolved[i]);
          }
          onSpace();
        }

        setTimeout(() => setLastSwipedWord(null), 2500);
      }
    }
    setTraversedKeys([]);
  };

  // Keyboard Rows
  const alphaRows = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
  ];

  const numberRows = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    ['-', '/', ':', ';', '(', ')', '$', '&', '@', '"'],
    ['.', ',', '?', '!', "'", '#', '%'],
  ];

  const symbolRows = [
    ['[', ']', '{', '}', '#', '%', '^', '*', '+', '='],
    ['_', '\\', '|', '~', '<', '>', '€', '£', '¥', '•'],
    ['.', ',', '?', '!', '`', '…', '"'],
  ];

  const emojis = [
    '⚡', '🔥', '✨', '💀', '🖤', '💡', '🎯', '🚀',
    '👍', '🤝', '👀', '💯', '🙏', '☕', '💼', '🍷',
  ];

  if (isCollapsed) {
    return (
      <div className="bg-[#0a071b] px-4 py-2 flex items-center justify-between border-t border-[#1e1642] text-xs text-[#9490ac]">
        <div className="flex items-center gap-2">
          <Fingerprint className="w-3.5 h-3.5 text-[#00ffcc]" />
          <span className="font-mono text-[11px] text-[#9490ac]">Biometric Kinetic Keyboard Docked</span>
        </div>
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="text-[#00ffcc] hover:text-[#00ffcc]/80 font-mono font-semibold text-xs flex items-center gap-1"
          >
            <span>Restore Keyboard</span>
            <span>↑</span>
          </button>
        )}
      </div>
    );
  }

  const currentRows = layoutMode === 'alpha' ? alphaRows : layoutMode === 'numbers' ? numberRows : symbolRows;

  // Compute SVG polyline string for glide trail
  const polylinePoints = swipePoints.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div 
      ref={keyboardContainerRef}
      className="bg-[#000000] select-none border-t border-[#1e1642] p-1.5 pb-2 touch-none relative overflow-hidden"
      onTouchStart={(e) => {
        const touch = e.touches[0];
        handleGestureStart(touch.clientX, touch.clientY);
      }}
      onTouchMove={(e) => {
        const touch = e.touches[0];
        handleGestureMove(touch.clientX, touch.clientY);
      }}
      onTouchEnd={handleGestureEnd}
      onMouseDown={(e) => handleGestureStart(e.clientX, e.clientY)}
      onMouseMove={(e) => {
        if (e.buttons === 1) handleGestureMove(e.clientX, e.clientY);
      }}
      onMouseUp={handleGestureEnd}
    >
      {/* Real-time Neon Polyline Glide Trail Overlay */}
      {isSwiping && swipePoints.length > 1 && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-50">
          <polyline
            points={polylinePoints}
            fill="none"
            stroke="#00ffcc"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-90 drop-shadow-[0_0_10px_#00ffcc]"
          />
          <polyline
            points={polylinePoints}
            fill="none"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-95"
          />
          {swipePoints.length > 0 && (
            <circle
              cx={swipePoints[swipePoints.length - 1].x}
              cy={swipePoints[swipePoints.length - 1].y}
              r="7"
              fill="#00ffcc"
              className="animate-ping opacity-75"
            />
          )}
        </svg>
      )}

      {/* Mini Mechanical & Kinetic Status Toolbar */}
      <div className="flex items-center justify-between px-2 py-0.5 text-[10px] font-mono text-[#948eb5] mb-1">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="flex items-center gap-1 hover:text-[#e8e6f2] transition"
            title="Toggle Mechanical Key Switch Audio"
          >
            {soundEnabled ? <Volume2 className="w-3 h-3 text-[#00ffcc]" /> : <VolumeX className="w-3 h-3" />}
            <span>{soundEnabled ? 'Switch: Linear' : 'Muted'}</span>
          </button>

          {/* Glide Typing Toggle */}
          <button
            onClick={() => setGlideTypingEnabled(!glideTypingEnabled)}
            className={`flex items-center gap-1 transition ${
              glideTypingEnabled ? 'text-[#00ffcc] font-bold' : 'text-[#948eb5]'
            }`}
            title="Toggle Continuous Swipe-To-Text Glide Typing"
          >
            <Zap className="w-3 h-3" />
            <span>Glide: {glideTypingEnabled ? 'ON' : 'OFF'}</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {frictionDampened && (
            <span className="text-[#00ffcc] font-mono text-[9px] animate-pulse font-bold bg-[#00ffcc]/10 px-1 rounded border border-[#00ffcc]/40">
              Dampening Spikes
            </span>
          )}

          {lastSwipedWord ? (
            <span className="text-[#00ffcc] font-mono text-[9.5px] font-bold tracking-tight bg-[#0a071b] px-2 py-0.5 rounded border border-[#00ffcc]/50 shadow-[0_0_8px_rgba(0,255,204,0.3)] animate-in fade-in">
              ⚡ Swiped: "{lastSwipedWord}"
            </span>
          ) : (
            <span className="text-[#00ffcc] font-mono text-[9px] tracking-wider font-bold">
              KINETIC 3D CAPS
            </span>
          )}

          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="hover:text-[#e8e6f2] p-0.5"
              title="Minimize Keyboard"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Emoji Drawer */}
      {showEmojiPicker && (
        <div className="grid grid-cols-8 gap-1.5 p-2 bg-[#0a071b] rounded-xl mb-1.5 border border-[#1e1642] shadow-[0_0_15px_rgba(0,0,0,0.8)] animate-in fade-in duration-100">
          {emojis.map((emoji, idx) => (
            <button
              key={idx}
              onClick={() => {
                triggerHaptic(10);
                playClick('standard');
                onKeyPress(emoji);
              }}
              className="text-lg p-1.5 rounded-lg hover:bg-zinc-800 active:scale-125 transition-transform"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Row 1 */}
      <div className="flex justify-center gap-1 mb-1.5">
        {currentRows[0].map((k) => {
          const isPressed = activeKey === k;
          const isPredicted = layoutMode === 'alpha' && predictedNextChars.has(k.toLowerCase());
          // Dynamic Hit-Box Scaling: expanded flex grow factor when predictive grip is engaged
          const gripWeight = isPredicted && effectiveGrip > 20 
            ? `flex-[${1 + Math.round((effectiveGrip / 100) * 0.45 * 10) / 10}]` 
            : 'flex-1';

          return (
            <button
              key={k}
              data-key={k}
              onClick={() => handleKey(k)}
              className={`${gripWeight} max-w-[42px] h-11 rounded-lg keycap-3d text-white font-medium text-sm flex flex-col items-center justify-center font-mono relative transition-all duration-150 ${
                isPressed ? 'depressed' : ''
              } ${isPredicted ? 'border-[#00ffcc]/50 shadow-[0_0_6px_rgba(0,255,204,0.25)]' : ''}`}
            >
              <span className="relative z-10">{isShift && layoutMode === 'alpha' ? k.toUpperCase() : k}</span>
              {isPredicted && (
                <span className="w-1 h-1 rounded-full bg-[#00ffcc] absolute bottom-1 shadow-[0_0_4px_#00ffcc]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Row 2 */}
      <div className="flex justify-center gap-1 mb-1.5 px-2">
        {currentRows[1].map((k) => {
          const isPressed = activeKey === k;
          const isPredicted = layoutMode === 'alpha' && predictedNextChars.has(k.toLowerCase());
          const gripWeight = isPredicted && effectiveGrip > 20 
            ? `flex-[${1 + Math.round((effectiveGrip / 100) * 0.45 * 10) / 10}]` 
            : 'flex-1';

          return (
            <button
              key={k}
              data-key={k}
              onClick={() => handleKey(k)}
              className={`${gripWeight} max-w-[42px] h-11 rounded-lg keycap-3d text-white font-medium text-sm flex flex-col items-center justify-center font-mono relative transition-all duration-150 ${
                isPressed ? 'depressed' : ''
              } ${isPredicted ? 'border-[#00ffcc]/50 shadow-[0_0_6px_rgba(0,255,204,0.25)]' : ''}`}
            >
              <span className="relative z-10">{isShift && layoutMode === 'alpha' ? k.toUpperCase() : k}</span>
              {isPredicted && (
                <span className="w-1 h-1 rounded-full bg-[#00ffcc] absolute bottom-1 shadow-[0_0_4px_#00ffcc]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Row 3 with Shift & Backspace */}
      <div className="flex justify-center gap-1 mb-1.5">
        {layoutMode === 'alpha' ? (
          <button
            onClick={() => {
              triggerHaptic(10);
              playClick('standard');
              setIsShift(!isShift);
            }}
            className={`w-11 h-11 rounded-lg text-xs font-mono font-bold flex items-center justify-center transition-all ${
              isShift
                ? 'keycap-primary-3d text-white border-[#00f0ff]'
                : 'keycap-3d text-[#e8e6f2]'
            }`}
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => {
              triggerHaptic(10);
              playClick('standard');
              setLayoutMode(layoutMode === 'numbers' ? 'symbols' : 'numbers');
            }}
            className="w-11 h-11 rounded-lg keycap-3d text-[#e8e6f2] text-xs font-mono font-bold flex items-center justify-center"
          >
            {layoutMode === 'numbers' ? '#+=' : '123'}
          </button>
        )}

        {currentRows[2].map((k) => {
          const isPressed = activeKey === k;
          const isPredicted = layoutMode === 'alpha' && predictedNextChars.has(k.toLowerCase());
          const gripWeight = isPredicted && effectiveGrip > 20 
            ? `flex-[${1 + Math.round((effectiveGrip / 100) * 0.45 * 10) / 10}]` 
            : 'flex-1';

          return (
            <button
              key={k}
              data-key={k}
              onClick={() => handleKey(k)}
              className={`${gripWeight} max-w-[42px] h-11 rounded-lg keycap-3d text-[#e8e6f2] font-medium text-sm flex flex-col items-center justify-center font-mono relative transition-all duration-150 ${
                isPressed ? 'depressed' : ''
              } ${isPredicted ? 'border-[#00ffcc]/50 shadow-[0_0_6px_rgba(0,255,204,0.25)]' : ''}`}
            >
              <span className="relative z-10">{isShift && layoutMode === 'alpha' ? k.toUpperCase() : k}</span>
              {isPredicted && (
                <span className="w-1 h-1 rounded-full bg-[#00ffcc] absolute bottom-1 shadow-[0_0_4px_#00ffcc]" />
              )}
            </button>
          );
        })}

        <button
          onClick={handleBackspaceClick}
          className={`w-11 h-11 rounded-lg keycap-3d text-[#9490ac] text-xs font-mono flex items-center justify-center ${
            activeKey === 'backspace' ? 'depressed' : ''
          }`}
        >
          <Delete className="w-4 h-4" />
        </button>
      </div>

      {/* Row 4: Switch mode, Emoji, Spacebar, Return */}
      <div className="flex justify-center gap-1.5 px-0.5">
        <button
          onClick={() => {
            triggerHaptic(10);
            playClick('standard');
            setLayoutMode(layoutMode === 'alpha' ? 'numbers' : 'alpha');
          }}
          className="w-12 h-11 rounded-lg keycap-3d text-[#9490ac] text-xs font-mono font-bold flex items-center justify-center"
        >
          {layoutMode === 'alpha' ? '?123' : 'ABC'}
        </button>

        <button
          onClick={() => {
            triggerHaptic(10);
            playClick('standard');
            setShowEmojiPicker(!showEmojiPicker);
          }}
          className={`w-10 h-11 rounded-lg text-xs font-mono font-bold flex items-center justify-center transition-all ${
            showEmojiPicker
              ? 'keycap-primary-3d text-white'
              : 'keycap-3d text-[#9490ac]'
          }`}
        >
          <Smile className="w-4 h-4" />
        </button>

        {/* Volumetric Spacebar named 'THE VOID' */}
        <button
          onClick={handleSpaceClick}
          className={`flex-1 h-11 rounded-lg keycap-3d text-[#e8e6f2] text-xs font-mono flex items-center justify-center relative overflow-hidden group border border-[#1e1642] hover:border-[#6366f1]/60 ${
            activeKey === 'space' ? 'depressed ring-1 ring-[#6366f1]/60' : ''
          }`}
          title="The Void"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a071b] via-[#130d2d] to-[#0a071b]" />
          
          <div className="relative z-10 flex items-center justify-center gap-2">
            <span className="text-[11px] font-black tracking-[0.38em] uppercase font-mono bg-clip-text text-transparent bg-gradient-to-r from-[#6c63ff] via-[#e8e6f2] to-[#00ffcc] drop-shadow-[0_0_8px_rgba(0,255,204,0.7)] group-hover:drop-shadow-[0_0_12px_rgba(0,255,204,0.9)] transition-all">
              THE VOID
            </span>
          </div>

          <div className="absolute inset-x-8 bottom-1.5 h-[2px] bg-gradient-to-r from-transparent via-[#00ffcc]/70 to-transparent shadow-[0_0_8px_rgba(0,255,204,0.7)]" />
        </button>

        {/* Enter key with High-Impact Gradient */}
        <button
          onClick={handleEnterClick}
          className={`w-14 h-11 rounded-lg keycap-primary-3d text-black font-mono font-bold text-xs flex items-center justify-center ${
            activeKey === 'enter' ? 'depressed' : ''
          }`}
        >
          <CornerDownLeft className="w-4 h-4 stroke-[3]" />
        </button>
      </div>
    </div>
  );
};
