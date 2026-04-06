import { useRef, useCallback } from 'react';

/**
 * Detects a right-swipe gesture and fires `onBack`.
 * – Threshold: finger must travel ≥ 60 px horizontally to the right.
 * – Guard:     vertical movement must be less than 80 px (avoids triggering on scrolls).
 * – Start zone: only triggers when the swipe begins in the left 40 % of the screen,
 *   matching the iOS "edge-swipe" feel without requiring the exact edge.
 */
export function useSwipeBack(onBack: () => void) {
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    // Only activate when starting roughly from the left third of the screen
    if (touch.clientX < window.innerWidth * 0.4) {
      touchStart.current = { x: touch.clientX, y: touch.clientY };
    } else {
      touchStart.current = null;
    }
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStart.current) return;
      const touch = e.changedTouches[0];
      const dx = touch.clientX - touchStart.current.x;
      const dy = Math.abs(touch.clientY - touchStart.current.y);
      touchStart.current = null;

      if (dx >= 60 && dy < 80) {
        onBack();
      }
    },
    [onBack]
  );

  return { onTouchStart, onTouchEnd };
}
