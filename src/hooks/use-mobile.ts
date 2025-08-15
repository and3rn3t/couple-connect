import { useEffect, useState } from 'react';
import { IOS_BREAKPOINTS, type ScreenSize } from '@/constants/mobile';

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${IOS_BREAKPOINTS.TABLET - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < IOS_BREAKPOINTS.TABLET);
    };
    mql.addEventListener('change', onChange);
    setIsMobile(window.innerWidth < IOS_BREAKPOINTS.TABLET);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return !!isMobile;
}

export function useScreenSize(): ScreenSize {
  const [screenSize, setScreenSize] = useState<ScreenSize>('standard');

  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;

      if (width < IOS_BREAKPOINTS.STANDARD) {
        setScreenSize('small');
      } else if (width < IOS_BREAKPOINTS.LARGE) {
        setScreenSize('standard');
      } else if (width < IOS_BREAKPOINTS.TABLET) {
        setScreenSize('large');
      } else if (width < IOS_BREAKPOINTS.DESKTOP) {
        setScreenSize('tablet');
      } else {
        setScreenSize('desktop');
      }
    };

    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  return screenSize;
}

export function useMobileDetection() {
  const isMobile = useIsMobile();
  const screenSize = useScreenSize();

  return {
    isMobile,
    screenSize,
    isSmallScreen: screenSize === 'small',
    isStandardScreen: screenSize === 'standard',
    isLargeScreen: screenSize === 'large',
    isTablet: screenSize === 'tablet',
    isDesktop: screenSize === 'desktop',
  };
}

// iOS-specific device detection
export function useIOSDetection() {
  const [isIOS, setIsIOS] = useState(false);
  const [hasSafeArea, setHasSafeArea] = useState(false);

  useEffect(() => {
    const userAgent = navigator.userAgent;
    const isIOSDevice = /iPad|iPhone|iPod/.test(userAgent);
    setIsIOS(isIOSDevice);

    // Check for safe area support (devices with notch/Dynamic Island)
    const checkSafeArea = () => {
      const safeAreaTop = getComputedStyle(document.documentElement)
        .getPropertyValue('env(safe-area-inset-top)')
        .replace('px', '');
      setHasSafeArea(parseInt(safeAreaTop) > 0);
    };

    checkSafeArea();
    window.addEventListener('orientationchange', checkSafeArea);
    return () => window.removeEventListener('orientationchange', checkSafeArea);
  }, []);

  return { isIOS, hasSafeArea };
}
