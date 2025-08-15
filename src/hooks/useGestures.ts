/**
 * Advanced Touch Gesture Hook
 * Provides swipe, long press, and pinch gesture detection
 */

import { useRef, useCallback, useEffect, useMemo } from 'react';

export interface SwipeDirection {
  direction: 'left' | 'right' | 'up' | 'down';
  distance: number;
  velocity: number;
}

export interface TouchPosition {
  x: number;
  y: number;
  timestamp: number;
}

export interface GestureCallbacks {
  onSwipe?: (swipe: SwipeDirection) => void;
  onLongPress?: (position: TouchPosition) => void;
  onTap?: (position: TouchPosition) => void;
  onDoubleTap?: (position: TouchPosition) => void;
  onPinch?: (scale: number, center: TouchPosition) => void;
}

export interface GestureOptions {
  swipeThreshold: number; // Minimum distance for swipe
  longPressThreshold: number; // Time for long press (ms)
  doubleTapThreshold: number; // Max time between taps (ms)
  velocityThreshold: number; // Minimum velocity for swipe
  preventDefault: boolean; // Prevent default touch behavior
}

const defaultOptions: GestureOptions = {
  swipeThreshold: 50,
  longPressThreshold: 500,
  doubleTapThreshold: 300,
  velocityThreshold: 0.3,
  preventDefault: true,
};

/**
 * Advanced touch gesture detection hook
 * Supports swipe, long press, tap, double tap, and pinch gestures
 */
export function useGestures(callbacks: GestureCallbacks, options: Partial<GestureOptions> = {}) {
  const gestureOptions = useMemo(() => ({ ...defaultOptions, ...options }), [options]);
  const elementRef = useRef<HTMLDivElement>(null);

  // Touch state tracking
  const touchState = useRef({
    startTouch: null as TouchPosition | null,
    lastTouch: null as TouchPosition | null,
    longPressTimer: null as NodeJS.Timeout | null,
    lastTapTime: 0,
    tapCount: 0,
    isPinching: false,
    initialPinchDistance: 0,
    touches: [] as Touch[],
  });

  const getTouchPosition = useCallback(
    (touch: Touch): TouchPosition => ({
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now(),
    }),
    []
  );

  const calculateDistance = useCallback((pos1: TouchPosition, pos2: TouchPosition): number => {
    const dx = pos2.x - pos1.x;
    const dy = pos2.y - pos1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  const calculateVelocity = useCallback(
    (pos1: TouchPosition, pos2: TouchPosition): number => {
      const distance = calculateDistance(pos1, pos2);
      const time = Math.max(pos2.timestamp - pos1.timestamp, 1);
      return distance / time;
    },
    [calculateDistance]
  );

  const getSwipeDirection = useCallback(
    (start: TouchPosition, end: TouchPosition): SwipeDirection['direction'] => {
      const dx = end.x - start.x;
      const dy = end.y - start.y;

      if (Math.abs(dx) > Math.abs(dy)) {
        return dx > 0 ? 'right' : 'left';
      } else {
        return dy > 0 ? 'down' : 'up';
      }
    },
    []
  );

  const getPinchDistance = useCallback((touches: TouchList): number => {
    if (touches.length < 2) return 0;
    const touch1 = touches[0];
    const touch2 = touches[1];
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  const getPinchCenter = useCallback((touches: TouchList): TouchPosition => {
    const touch1 = touches[0];
    const touch2 = touches[1];
    return {
      x: (touch1.clientX + touch2.clientX) / 2,
      y: (touch1.clientY + touch2.clientY) / 2,
      timestamp: Date.now(),
    };
  }, []);

  const clearLongPressTimer = useCallback(() => {
    if (touchState.current.longPressTimer) {
      clearTimeout(touchState.current.longPressTimer);
      touchState.current.longPressTimer = null;
    }
  }, []);

  const handleTouchStart = useCallback(
    (event: TouchEvent) => {
      if (gestureOptions.preventDefault) {
        event.preventDefault();
      }

      const touch = event.touches[0];
      const position = getTouchPosition(touch);

      touchState.current.startTouch = position;
      touchState.current.lastTouch = position;
      touchState.current.touches = Array.from(event.touches);

      // Handle pinch gesture
      if (event.touches.length === 2) {
        touchState.current.isPinching = true;
        touchState.current.initialPinchDistance = getPinchDistance(event.touches);
        clearLongPressTimer();
        return;
      }

      // Start long press timer
      if (callbacks.onLongPress) {
        touchState.current.longPressTimer = setTimeout(() => {
          if (touchState.current.startTouch) {
            callbacks.onLongPress!(touchState.current.startTouch);
            touchState.current.startTouch = null; // Prevent other gestures
          }
        }, gestureOptions.longPressThreshold);
      }
    },
    [callbacks, gestureOptions, getTouchPosition, getPinchDistance, clearLongPressTimer]
  );

  const handleTouchMove = useCallback(
    (event: TouchEvent) => {
      if (gestureOptions.preventDefault) {
        event.preventDefault();
      }

      if (!touchState.current.startTouch) return;

      const touch = event.touches[0];
      const position = getTouchPosition(touch);
      touchState.current.lastTouch = position;

      // Handle pinch gesture
      if (event.touches.length === 2 && touchState.current.isPinching && callbacks.onPinch) {
        const currentDistance = getPinchDistance(event.touches);
        const scale = currentDistance / touchState.current.initialPinchDistance;
        const center = getPinchCenter(event.touches);
        callbacks.onPinch(scale, center);
        return;
      }

      // Check if movement is too much for long press
      if (touchState.current.longPressTimer) {
        const distance = calculateDistance(touchState.current.startTouch, position);
        if (distance > 10) {
          // 10px tolerance for long press
          clearLongPressTimer();
        }
      }
    },
    [
      callbacks,
      gestureOptions,
      getTouchPosition,
      calculateDistance,
      getPinchDistance,
      getPinchCenter,
      clearLongPressTimer,
    ]
  );

  const handleTouchEnd = useCallback(
    (event: TouchEvent) => {
      if (gestureOptions.preventDefault) {
        event.preventDefault();
      }

      clearLongPressTimer();

      if (!touchState.current.startTouch || !touchState.current.lastTouch) {
        touchState.current.isPinching = false;
        return;
      }

      // Handle pinch end
      if (touchState.current.isPinching) {
        touchState.current.isPinching = false;
        return;
      }

      const startPos = touchState.current.startTouch;
      const endPos = touchState.current.lastTouch;
      const distance = calculateDistance(startPos, endPos);
      const velocity = calculateVelocity(startPos, endPos);

      // Check for swipe gesture
      if (
        distance >= gestureOptions.swipeThreshold &&
        velocity >= gestureOptions.velocityThreshold &&
        callbacks.onSwipe
      ) {
        const direction = getSwipeDirection(startPos, endPos);
        callbacks.onSwipe({
          direction,
          distance,
          velocity,
        });
      }
      // Check for tap gestures
      else if (distance < 10) {
        // Small movement tolerance for taps
        const currentTime = Date.now();
        const timeSinceLastTap = currentTime - touchState.current.lastTapTime;

        if (
          timeSinceLastTap < gestureOptions.doubleTapThreshold &&
          touchState.current.tapCount === 1
        ) {
          // Double tap
          if (callbacks.onDoubleTap) {
            callbacks.onDoubleTap(endPos);
          }
          touchState.current.tapCount = 0;
        } else {
          // Single tap (with delay to check for double tap)
          touchState.current.tapCount = 1;
          touchState.current.lastTapTime = currentTime;

          setTimeout(() => {
            if (touchState.current.tapCount === 1 && callbacks.onTap) {
              callbacks.onTap(endPos);
            }
            touchState.current.tapCount = 0;
          }, gestureOptions.doubleTapThreshold);
        }
      }

      // Reset touch state
      touchState.current.startTouch = null;
      touchState.current.lastTouch = null;
    },
    [
      callbacks,
      gestureOptions,
      calculateDistance,
      calculateVelocity,
      getSwipeDirection,
      clearLongPressTimer,
    ]
  );

  const handleTouchCancel = useCallback(
    (event: TouchEvent) => {
      if (gestureOptions.preventDefault) {
        event.preventDefault();
      }

      clearLongPressTimer();
      touchState.current.startTouch = null;
      touchState.current.lastTouch = null;
      touchState.current.isPinching = false;
    },
    [gestureOptions, clearLongPressTimer]
  );

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener('touchstart', handleTouchStart, {
      passive: !gestureOptions.preventDefault,
    });
    element.addEventListener('touchmove', handleTouchMove, {
      passive: !gestureOptions.preventDefault,
    });
    element.addEventListener('touchend', handleTouchEnd, {
      passive: !gestureOptions.preventDefault,
    });
    element.addEventListener('touchcancel', handleTouchCancel, {
      passive: !gestureOptions.preventDefault,
    });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      element.removeEventListener('touchcancel', handleTouchCancel);
      clearLongPressTimer();
    };
  }, [
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleTouchCancel,
    gestureOptions.preventDefault,
    clearLongPressTimer,
  ]);

  return elementRef;
}

/**
 * Simplified swipe-only gesture hook for common use cases
 */
export function useSwipeGesture(
  onSwipe: (direction: SwipeDirection['direction']) => void,
  options?: Partial<GestureOptions>
) {
  return useGestures(
    {
      onSwipe: (swipe) => onSwipe(swipe.direction),
    },
    options
  );
}

/**
 * Long press gesture hook
 */
export function useLongPress(onLongPress: () => void, options?: Partial<GestureOptions>) {
  return useGestures(
    {
      onLongPress: () => onLongPress(),
    },
    options
  );
}
