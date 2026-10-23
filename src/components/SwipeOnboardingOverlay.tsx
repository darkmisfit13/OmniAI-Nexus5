import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Hand, ArrowLeftRight, Check, Sparkles, X, ChevronRight, ChevronLeft } from 'lucide-react';
import { triggerTactileHaptic } from '../lib/hapticFeedback';

interface SwipeOnboardingOverlayProps {
  onDismiss?: () => void;
  forceShow?: boolean;
}

export const SwipeOnboardingOverlay: React.FC<SwipeOnboardingOverlayProps> = ({ onDismiss, forceShow = false }) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    if (forceShow) {
      setIsVisible(true);
      return;
    }
    if (typeof window !== 'undefined') {
      const dismissed = localStorage.getItem('omni_swipe_tutorial_dismissed');
      if (!dismissed) {
        // Show after brief delay so initial view settles smoothly
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 800);
        return () => clearTimeout(timer);
      }
    }
  }, [forceShow]);

  const handleDismiss = () => {
    triggerTactileHaptic(6, 'tap');
    setIsVisible(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('omni_swipe_tutorial_dismissed', 'true');
    }
    onDismiss?.();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none"
          onClick={handleDismiss}
        >
          <motion.div
            initial={{ scale: 0.9, y: 15, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 10, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="w-full max-w-[340px] rounded-3xl bg-[#08060c] border border-[#00e5ff]/40 p-5 shadow-[0_0_40px_rgba(0,229,255,0.25)] flex flex-col items-center text-center relative overflow-hidden font-sans"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Ambient Background Glows */}
            <div className="absolute top-0 -left-10 w-40 h-40 bg-[#00ff99]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 -right-10 w-40 h-40 bg-[#8b5cf6]/15 rounded-full blur-3xl pointer-events-none" />

            {/* Top Close Button */}
            <button
              onClick={handleDismiss}
              className="absolute top-3 right-3 p-1.5 rounded-full text-zinc-500 hover:text-white hover:bg-zinc-800 transition"
              title="Close guide"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Animated Swipe Visual Graphic */}
            <div className="w-full py-4 flex flex-col items-center justify-center relative">
              {/* Swipe Track Banner */}
              <div className="w-64 h-12 rounded-2xl bg-black border border-zinc-800 relative flex items-center justify-between px-3 overflow-hidden shadow-inner">
                {/* Visual Guides */}
                <span className="text-[10px] font-mono font-bold text-zinc-500 flex items-center gap-0.5">
                  <ChevronLeft className="w-3 h-3 text-[#00ff99]" /> Keys
                </span>
                <span className="text-[10px] font-mono font-bold text-[#00e5ff] px-2 py-0.5 rounded-full bg-[#00e5ff]/15 border border-[#00e5ff]/30">
                  Vision HUD
                </span>
                <span className="text-[10px] font-mono font-bold text-zinc-500 flex items-center gap-0.5">
                  Workspace <ChevronRight className="w-3 h-3 text-[#ff007f]" />
                </span>

                {/* Animated Horizontal Swipe Orb Hand */}
                <motion.div
                  animate={{
                    x: [-45, 45, -45],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2.2,
                    ease: 'easeInOut',
                  }}
                  className="absolute left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-r from-[#00ff99] to-[#00e5ff] shadow-[0_0_15px_#00e5ff] flex items-center justify-center text-slate-950 pointer-events-none"
                >
                  <Hand className="w-4 h-4 text-slate-950 fill-current" />
                </motion.div>
              </div>

              {/* Direction Arrows */}
              <div className="flex items-center gap-2 mt-2 text-[10px] font-mono text-[#00e5ff]">
                <ArrowLeftRight className="w-3.5 h-3.5 text-[#00ff99] animate-pulse" />
                <span>Swipe Left or Right Across Screen</span>
              </div>
            </div>

            {/* Title & Description */}
            <div className="space-y-1.5 mt-1">
              <div className="flex items-center justify-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#00ff99]" />
                <h3 className="text-base font-bold text-white tracking-wide font-mono">
                  Swipe-to-Switch Navigation
                </h3>
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Glide horizontally with your thumb anywhere on the screen to switch seamlessly between your primary decks:
              </p>
            </div>

            {/* Mini Deck Matrix Pills */}
            <div className="grid grid-cols-3 gap-1.5 w-full my-3.5 text-[9.5px] font-mono">
              <div className="p-2 rounded-xl bg-zinc-950/80 border border-[#00ff99]/40 flex flex-col items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#00ff99] shadow-[0_0_6px_#00ff99]" />
                <span className="font-bold text-white">Keyboard</span>
                <span className="text-zinc-500 text-[8px]">Volumetric Keys</span>
              </div>
              <div className="p-2 rounded-xl bg-zinc-950/80 border border-[#00e5ff]/40 flex flex-col items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#00e5ff] shadow-[0_0_6px_#00e5ff]" />
                <span className="font-bold text-[#00e5ff]">Vision HUD</span>
                <span className="text-zinc-500 text-[8px]">Live Screen AI</span>
              </div>
              <div className="p-2 rounded-xl bg-zinc-950/80 border border-[#8b5cf6]/40 flex flex-col items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#8b5cf6] shadow-[0_0_6px_#8b5cf6]" />
                <span className="font-bold text-white">Workspace</span>
                <span className="text-zinc-500 text-[8px]">Vault & Tools</span>
              </div>
            </div>

            {/* Acknowledge Button */}
            <button
              onClick={handleDismiss}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#00ff99] via-[#00e5ff] to-[#8b5cf6] text-black font-black font-mono text-xs uppercase tracking-wider shadow-lg shadow-[#00e5ff]/25 active:scale-95 transition flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Got It, Let's Build</span>
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
