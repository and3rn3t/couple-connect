import { useCallback } from 'react';
import { useIOSDetection } from './use-mobile';
import { HAPTIC_DURATIONS, HAPTIC_PATTERNS } from '@/constants/mobile';

export type HapticFeedbackType =
  | 'light'
  | 'medium'
  | 'heavy'
  | 'selection'
  | 'impact'
  | 'notification';

export function useHapticFeedback() {
  const { isIOS } = useIOSDetection();

  const triggerHaptic = useCallback(
    (type: HapticFeedbackType = 'light') => {
      // For iOS devices with haptic feedback support
      if (isIOS && 'vibrate' in navigator) {
        switch (type) {
          case 'light':
            navigator.vibrate(HAPTIC_DURATIONS.LIGHT);
            break;
          case 'medium':
            navigator.vibrate(HAPTIC_DURATIONS.MEDIUM);
            break;
          case 'heavy':
            navigator.vibrate(HAPTIC_DURATIONS.HEAVY);
            break;
          case 'selection':
            navigator.vibrate(HAPTIC_DURATIONS.SELECTION);
            break;
          case 'impact':
            navigator.vibrate(HAPTIC_PATTERNS.IMPACT);
            break;
          case 'notification':
            navigator.vibrate(HAPTIC_PATTERNS.NOTIFICATION);
            break;
          default:
            navigator.vibrate(HAPTIC_DURATIONS.LIGHT);
        }
      }

      // For supported browsers with Haptic API (experimental)
      if (
        'haptics' in navigator &&
        (
          navigator as unknown as {
            haptics?: { vibrate: (params: { intensity: number; duration: number }) => void };
          }
        ).haptics
      ) {
        try {
          const haptics = (
            navigator as unknown as {
              haptics: { vibrate: (params: { intensity: number; duration: number }) => void };
            }
          ).haptics;
          switch (type) {
            case 'light':
              haptics.vibrate({ intensity: 0.3, duration: 10 });
              break;
            case 'medium':
              haptics.vibrate({ intensity: 0.6, duration: 20 });
              break;
            case 'heavy':
              haptics.vibrate({ intensity: 1.0, duration: 30 });
              break;
            default:
              haptics.vibrate({ intensity: 0.3, duration: 10 });
          }
        } catch (_error) {
          // Fallback to regular vibration
          if ('vibrate' in navigator) {
            navigator.vibrate(10);
          }
        }
      }
    },
    [isIOS]
  );

  const triggerSuccess = useCallback(() => {
    triggerHaptic('notification');
  }, [triggerHaptic]);

  const triggerError = useCallback(() => {
    triggerHaptic('heavy');
  }, [triggerHaptic]);

  const triggerSelection = useCallback(() => {
    triggerHaptic('selection');
  }, [triggerHaptic]);

  const triggerButtonPress = useCallback(() => {
    triggerHaptic('light');
  }, [triggerHaptic]);

  return {
    triggerHaptic,
    triggerSuccess,
    triggerError,
    triggerSelection,
    triggerButtonPress,
  };
}

// CSS class-based haptic feedback for declarative usage
export function useHapticClasses() {
  const addHapticClass = useCallback((element: HTMLElement, type: HapticFeedbackType = 'light') => {
    const className = `haptic-${type}`;
    element.classList.add(className);

    // Remove the class after animation completes
    setTimeout(() => {
      element.classList.remove(className);
    }, 200);
  }, []);

  return { addHapticClass };
}
