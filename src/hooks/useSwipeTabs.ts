import { useRef, useCallback } from 'react';

export type PrimaryTab = 'keyboard' | 'vision' | 'workspace';

export const PRIMARY_TABS: PrimaryTab[] = ['keyboard', 'vision', 'workspace'];

interface UseSwipeTabsOptions {
  activeTab: string;
  onTabChange: (tab: PrimaryTab) => void;
  enabled?: boolean;
  threshold?: number;
  restraint?: number;
}

/**
 * useSwipeTabs
 * Enables smooth horizontal swipe navigation on mobile between the main
 * application tabs: Keyboard (Keys) <-> Vision <-> Workspace.
 */
export function useSwipeTabs({
  activeTab,
  onTabChange,
  enabled = true,
  threshold = 45,
  restraint = 90,
}: UseSwipeTabsOptions) {
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const touchStartTime = useRef<number>(0);
  const isSwiping = useRef<boolean>(false);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      if (!enabled) return;
      const touch = e.touches[0];
      touchStartX.current = touch.clientX;
      touchStartY.current = touch.clientY;
      touchStartTime.current = Date.now();
      isSwiping.current = true;
    },
    [enabled]
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!enabled || !isSwiping.current) return;
      isSwiping.current = false;
      const touch = e.changedTouches[0];
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
    [enabled, activeTab, onTabChange, threshold, restraint]
  );

  const currentIndex = PRIMARY_TABS.indexOf(activeTab as PrimaryTab);

  return {
    swipeHandlers: {
      onTouchStart: handleTouchStart,
      onTouchEnd: handleTouchEnd,
    },
    isPrimaryTab: currentIndex !== -1,
    canSwipeLeft: currentIndex !== -1 && currentIndex < PRIMARY_TABS.length - 1,
    canSwipeRight: currentIndex > 0,
    nextTabName: currentIndex !== -1 && currentIndex < PRIMARY_TABS.length - 1 ? PRIMARY_TABS[currentIndex + 1] : null,
    prevTabName: currentIndex > 0 ? PRIMARY_TABS[currentIndex - 1] : null,
  };
}
