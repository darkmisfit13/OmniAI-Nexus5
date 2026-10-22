import { useRef, useCallback } from 'react';

export type PrimaryTab = 'keyboard' | 'vision' | 'workspace';

export const PRIMARY_TABS: PrimaryTab[] = ['keyboard', 'vision', 'workspace'];

interface UseSwipeTabsOptions {
  activeTab: string;
  onTabChange: (tab: PrimaryTab) => void;
  onThreeFingerSwipeLeft?: () => void;
  enabled?: boolean;
  threshold?: number;
  restraint?: number;
}

/**
 * useSwipeTabs
 * Enables smooth horizontal swipe navigation on mobile between the main
 * application tabs: Keyboard (Keys) <-> Vision <-> Workspace.
 * Also detects 3-finger horizontal swipe left gestures to trigger undo operations.
 */
export function useSwipeTabs({
  activeTab,
  onTabChange,
  onThreeFingerSwipeLeft,
  enabled = true,
  threshold = 45,
  restraint = 90,
}: UseSwipeTabsOptions) {
  // Single-finger tab switching
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const touchStartTime = useRef<number>(0);
  const isSingleSwiping = useRef<boolean>(false);

  // Three-finger swipe left detection
  const threeFingerStartX = useRef<number>(0);
  const threeFingerStartY = useRef<number>(0);
  const threeFingerLastX = useRef<number>(0);
  const threeFingerLastY = useRef<number>(0);
  const threeFingerStartTime = useRef<number>(0);
  const isThreeFingerSwiping = useRef<boolean>(false);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!enabled) return;

      if (e.touches.length === 3) {
        // Detected 3-finger touch
        const avgX = (e.touches[0].clientX + e.touches[1].clientX + e.touches[2].clientX) / 3;
        const avgY = (e.touches[0].clientY + e.touches[1].clientY + e.touches[2].clientY) / 3;
        threeFingerStartX.current = avgX;
        threeFingerStartY.current = avgY;
        threeFingerLastX.current = avgX;
        threeFingerLastY.current = avgY;
        threeFingerStartTime.current = Date.now();
        isThreeFingerSwiping.current = true;
        isSingleSwiping.current = false;
        return;
      }

      if (e.touches.length === 1) {
        const touch = e.touches[0];
        touchStartX.current = touch.clientX;
        touchStartY.current = touch.clientY;
        touchStartTime.current = Date.now();
        isSingleSwiping.current = true;
        isThreeFingerSwiping.current = false;
      }
    },
    [enabled]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!enabled) return;
      if (isThreeFingerSwiping.current && e.touches.length === 3) {
        const avgX = (e.touches[0].clientX + e.touches[1].clientX + e.touches[2].clientX) / 3;
        const avgY = (e.touches[0].clientY + e.touches[1].clientY + e.touches[2].clientY) / 3;
        threeFingerLastX.current = avgX;
        threeFingerLastY.current = avgY;
      }
    },
    [enabled]
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!enabled) return;

      // Handle 3-finger swipe left completion
      if (isThreeFingerSwiping.current) {
        isThreeFingerSwiping.current = false;
        const deltaX = threeFingerLastX.current - threeFingerStartX.current;
        const deltaY = threeFingerLastY.current - threeFingerStartY.current;
        const elapsedTime = Date.now() - threeFingerStartTime.current;

        // Swiped left by at least 35px with minimal vertical deviation within 1000ms
        if (deltaX < -35 && Math.abs(deltaY) <= 120 && elapsedTime <= 1000) {
          onThreeFingerSwipeLeft?.();
        }
        return;
      }

      // Handle single-finger primary tab switching
      if (!isSingleSwiping.current) return;
      isSingleSwiping.current = false;
      const touch = e.changedTouches[0];
      if (!touch) return;
      const deltaX = touch.clientX - touchStartX.current;
      const deltaY = touch.clientY - touchStartY.current;
      const elapsedTime = Date.now() - touchStartTime.current;

      const currentIndex = PRIMARY_TABS.indexOf(activeTab as PrimaryTab);
      if (currentIndex === -1) return;

      // Ensure horizontal swipe intent (deltaX > threshold and deltaY within limit)
      if (Math.abs(deltaX) >= threshold && Math.abs(deltaY) <= restraint && elapsedTime <= 800) {
        if (deltaX < 0) {
          // Swiped left (finger right to left) -> Next primary tab
          if (currentIndex < PRIMARY_TABS.length - 1) {
            onTabChange(PRIMARY_TABS[currentIndex + 1]);
          }
        } else {
          // Swiped right (finger left to right) -> Previous primary tab
          if (currentIndex > 0) {
            onTabChange(PRIMARY_TABS[currentIndex - 1]);
          }
        }
      }
    },
    [enabled, activeTab, onTabChange, onThreeFingerSwipeLeft, threshold, restraint]
  );

  const currentIndex = PRIMARY_TABS.indexOf(activeTab as PrimaryTab);

  return {
    swipeHandlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
    isPrimaryTab: currentIndex !== -1,
    canSwipeLeft: currentIndex !== -1 && currentIndex < PRIMARY_TABS.length - 1,
    canSwipeRight: currentIndex > 0,
    nextTabName: currentIndex !== -1 && currentIndex < PRIMARY_TABS.length - 1 ? PRIMARY_TABS[currentIndex + 1] : null,
    prevTabName: currentIndex > 0 ? PRIMARY_TABS[currentIndex - 1] : null,
  };
}
