import React, { useState } from 'react';
import { MotionDiv } from '@/components/ui/lazy-motion';
import {
  CheckCircle,
  Warning,
  ChartBar,
  XCircle,
  DeviceMobile,
  Speedometer,
} from '@/components/ui/InlineIcons';
import { useMobileDetection, useIOSDetection } from '@/hooks/use-mobile';
import { useMobilePerformance } from '@/hooks/useMobilePerformance';
import { useHapticFeedback } from '@/hooks/useHapticFeedback';
import { MobileCard, MobileActionCard } from './ui/mobile-card';
import { TouchButton } from './ui/touch-feedback';
import { MobileStack, MobileGrid } from './ui/mobile-layout';
import { Badge } from './ui/badge';

interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
}

/**
 * Mobile Testing Dashboard - For development and QA testing
 * Provides comprehensive mobile optimization testing interface
 */
export function MobileTestingDashboard() {
  const { isMobile, screenSize, isSmallScreen, isLargeScreen } = useMobileDetection();
  const { isIOS, hasSafeArea } = useIOSDetection();
  const { metrics, optimizations } = useMobilePerformance();
  const { triggerHaptic } = useHapticFeedback();

  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);

  // Run comprehensive mobile tests
  const runMobileTests = async () => {
    setIsRunningTests(true);
    triggerHaptic('medium');

    const results: TestResult[] = [];

    // Test 1: Mobile Detection
    results.push({
      name: 'Mobile Detection',
      status: isMobile ? 'pass' : 'fail',
      message: isMobile ? 'Mobile device detected correctly' : 'Desktop detected',
    });

    // Test 2: Safe Area Support
    results.push({
      name: 'Safe Area Support',
      status: hasSafeArea ? 'pass' : 'warning',
      message: hasSafeArea
        ? 'Safe area insets detected'
        : 'No safe area insets (normal for some devices)',
    });

    // Test 3: Touch Targets
    const touchTargets = document.querySelectorAll('[class*="touch-target"]');
    results.push({
      name: 'Touch Targets',
      status: touchTargets.length > 0 ? 'pass' : 'fail',
      message: `${touchTargets.length} elements with touch target optimization found`,
    });

    // Test 4: Performance Metrics
    results.push({
      name: 'Load Performance',
      status: metrics.loadTime < 3000 ? 'pass' : metrics.loadTime < 5000 ? 'warning' : 'fail',
      message: `Load time: ${Math.round(metrics.loadTime)}ms`,
    });

    // Test 5: Connection Speed
    results.push({
      name: 'Connection Speed',
      status:
        metrics.connectionSpeed === 'fast'
          ? 'pass'
          : metrics.connectionSpeed === 'medium'
            ? 'warning'
            : 'fail',
      message: `Connection: ${metrics.connectionSpeed}`,
    });

    // Test 6: Optimizations Active
    const activeOptimizations = Object.values(optimizations).filter(Boolean).length;
    results.push({
      name: 'Mobile Optimizations',
      status: activeOptimizations > 0 ? 'pass' : 'warning',
      message: `${activeOptimizations}/5 optimizations active`,
    });

    // Test 7: Haptic Feedback
    results.push({
      name: 'Haptic Feedback',
      status: 'vibrate' in navigator ? 'pass' : 'warning',
      message:
        'vibrate' in navigator ? 'Haptic feedback supported' : 'Haptic feedback not supported',
    });

    // Test 8: Responsive Design
    const responsiveClasses = document.querySelectorAll('[class*="mobile-"], [class*="ios-"]');
    results.push({
      name: 'Responsive Design',
      status: responsiveClasses.length > 0 ? 'pass' : 'fail',
      message: `${responsiveClasses.length} mobile-specific elements found`,
    });

    // Simulate test delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setTestResults(results);
    setIsRunningTests(false);
    triggerHaptic('medium');
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'pass':
        return 'text-green-600';
      case 'fail':
        return 'text-red-600';
      case 'warning':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle size={20} className="text-green-600" />;
      case 'fail':
        return <XCircle size={20} className="text-red-600" />;
      case 'warning':
        return <Warning size={20} className="text-yellow-600" />;
      default:
        return null;
    }
  };

  if (!isMobile) {
    return (
      <div className="p-6 text-center">
        <DeviceMobile size={48} className="mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-semibold mb-2">Mobile Testing Dashboard</h3>
        <p className="text-muted-foreground">
          This dashboard is only available on mobile devices. Please use browser developer tools to
          simulate a mobile device.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 pb-safe-area-bottom">
      <MobileStack spacing="lg">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Mobile Testing Dashboard</h1>
          <p className="text-muted-foreground">Comprehensive mobile optimization testing</p>
        </div>

        {/* Device Info */}
        <MobileActionCard title="Device Information" icon={<DeviceMobile size={24} />}>
          <MobileGrid columns={2} gap="sm">
            <div>
              <p className="text-sm text-muted-foreground">Screen Size</p>
              <Badge variant="outline">{screenSize}</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Platform</p>
              <Badge variant="outline">{isIOS ? 'iOS' : 'Other'}</Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Safe Area</p>
              <Badge variant={hasSafeArea ? 'default' : 'secondary'}>
                {hasSafeArea ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Connection</p>
              <Badge variant="outline">{metrics.connectionSpeed}</Badge>
            </div>
          </MobileGrid>
        </MobileActionCard>

        {/* Performance Metrics */}
        <MobileActionCard title="Performance Metrics" icon={<Speedometer size={24} />}>
          <MobileStack spacing="sm">
            <div className="flex justify-between">
              <span className="text-sm">Load Time</span>
              <span className="text-sm font-mono">{Math.round(metrics.loadTime)}ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm">Render Time</span>
              <span className="text-sm font-mono">{Math.round(metrics.renderTime)}ms</span>
            </div>
            {metrics.memoryUsage && (
              <div className="flex justify-between">
                <span className="text-sm">Memory</span>
                <span className="text-sm font-mono">{metrics.memoryUsage}GB</span>
              </div>
            )}
          </MobileStack>
        </MobileActionCard>

        {/* Active Optimizations */}
        <MobileActionCard title="Active Optimizations" icon={<ChartBar size={24} />}>
          <MobileStack spacing="sm">
            {Object.entries(optimizations).map(([key, value]) => (
              <div key={key} className="flex justify-between items-center">
                <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                <Badge variant={value ? 'default' : 'secondary'}>{value ? 'ON' : 'OFF'}</Badge>
              </div>
            ))}
          </MobileStack>
        </MobileActionCard>

        {/* Test Controls */}
        <MobileCard>
          <MobileStack spacing="md">
            <h3 className="font-semibold">Run Mobile Tests</h3>
            <TouchButton
              onPress={runMobileTests}
              variant="primary"
              size="lg"
              disabled={isRunningTests}
              className="w-full"
            >
              {isRunningTests ? 'Running Tests...' : 'Run Mobile Tests'}
            </TouchButton>

            {/* Haptic Test Buttons */}
            <div className="grid grid-cols-3 gap-2">
              <TouchButton onPress={() => triggerHaptic('light')} variant="ghost" size="sm">
                Light
              </TouchButton>
              <TouchButton onPress={() => triggerHaptic('medium')} variant="ghost" size="sm">
                Medium
              </TouchButton>
              <TouchButton onPress={() => triggerHaptic('heavy')} variant="ghost" size="sm">
                Heavy
              </TouchButton>
            </div>
          </MobileStack>
        </MobileCard>

        {/* Test Results */}
        {testResults.length > 0 && (
          <MobileCard>
            <MobileStack spacing="md">
              <h3 className="font-semibold">Test Results</h3>
              <MobileStack spacing="sm">
                {testResults.map((result, index) => (
                  <MotionDiv
                    key={result.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                  >
                    {getStatusIcon(result.status)}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{result.name}</p>
                      <p className={`text-xs ${getStatusColor(result.status)}`}>{result.message}</p>
                    </div>
                  </MotionDiv>
                ))}
              </MobileStack>

              {/* Summary */}
              <div className="pt-3 border-t border-border">
                <div className="flex justify-between text-sm">
                  <span>Passed: {testResults.filter((r) => r.status === 'pass').length}</span>
                  <span>Warnings: {testResults.filter((r) => r.status === 'warning').length}</span>
                  <span>Failed: {testResults.filter((r) => r.status === 'fail').length}</span>
                </div>
              </div>
            </MobileStack>
          </MobileCard>
        )}

        {/* Debug Info (Development only) */}
        {process.env.NODE_ENV === 'development' && (
          <MobileCard>
            <MobileStack spacing="sm">
              <h3 className="font-semibold text-sm">Debug Information</h3>
              <div className="text-xs font-mono bg-muted p-3 rounded-lg overflow-x-auto">
                <pre>
                  {JSON.stringify(
                    {
                      isMobile,
                      screenSize,
                      isSmallScreen,
                      isLargeScreen,
                      isIOS,
                      hasSafeArea,
                      viewport: {
                        width: window.innerWidth,
                        height: window.innerHeight,
                      },
                      userAgent: navigator.userAgent.substring(0, 50) + '...',
                    },
                    null,
                    2
                  )}
                </pre>
              </div>
            </MobileStack>
          </MobileCard>
        )}
      </MobileStack>
    </div>
  );
}

export default MobileTestingDashboard;
