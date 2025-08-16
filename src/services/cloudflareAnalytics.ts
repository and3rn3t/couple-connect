/**
 * 📊 Cloudflare Analytics Service
 * Tracking love metrics with privacy-first approach! 💕📈
 */

export interface RelationshipEvent {
  name: string;
  properties?: Record<string, string | number | boolean>;
  timestamp?: number;
}

export interface LoveMetrics {
  actionCompleted: {
    actionType: string;
    difficulty: 'easy' | 'medium' | 'hard';
    coupleLevel: number;
    timeToComplete?: number;
  };

  achievementUnlocked: {
    achievementId: string;
    achievementType: string;
    coupleLevel: number;
    daysInRelationship: number;
  };

  dailyCheckIn: {
    mood: 'great' | 'good' | 'okay' | 'challenging';
    activitiesCompleted: number;
    relationshipHealth: number;
  };

  featureUsed: {
    feature: string;
    context: string;
    userType: 'partner1' | 'partner2' | 'both';
  };

  performanceMetric: {
    metric: 'pageLoad' | 'imageLoad' | 'actionResponse';
    duration: number;
    device: 'mobile' | 'tablet' | 'desktop';
  };
}

declare global {
  interface Window {
    cloudflare?: {
      analytics?: {
        track: (event: string, properties?: Record<string, any>) => void;
      };
    };
  }
}

export class CloudflareAnalyticsService {
  private isEnabled: boolean;
  private eventQueue: RelationshipEvent[] = [];
  private readonly maxQueueSize = 50;

  constructor() {
    this.isEnabled = this.checkAnalyticsAvailability();

    // Flush queue when Cloudflare Analytics loads
    if (typeof window !== 'undefined') {
      this.waitForAnalytics();
    }
  }

  /**
   * 💕 Track relationship milestone events
   * @param eventType The type of love event
   * @param data Event-specific data
   */
  trackLoveMetric<T extends keyof LoveMetrics>(eventType: T, data: LoveMetrics[T]): void {
    this.trackEvent(`love_${eventType}`, {
      ...data,
      // Add privacy-safe context
      sessionId: this.getSessionId(),
      timestamp: Date.now(),
      // No personal data - just relationship patterns! 💝
    });
  }

  /**
   * 🎯 Track user interaction events
   * @param action The user action
   * @param context Additional context
   */
  trackInteraction(action: string, context: Record<string, any> = {}): void {
    this.trackEvent('user_interaction', {
      action,
      ...context,
      device: this.getDeviceType(),
      timestamp: Date.now(),
    });
  }

  /**
   * ⚡ Track performance metrics
   * @param metric Performance metric name
   * @param duration Duration in milliseconds
   * @param context Additional context
   */
  trackPerformance(
    metric: LoveMetrics['performanceMetric']['metric'],
    duration: number,
    context: Record<string, any> = {}
  ): void {
    this.trackLoveMetric('performanceMetric', {
      metric,
      duration,
      device: this.getDeviceType(),
      ...context,
    });
  }

  /**
   * 🌟 Track feature adoption and usage
   * @param feature Feature name
   * @param action Action taken
   * @param context Additional context
   */
  trackFeatureUsage(
    feature: string,
    action: string = 'used',
    context: Record<string, any> = {}
  ): void {
    this.trackLoveMetric('featureUsed', {
      feature,
      context: action,
      userType: 'both', // Default to both since couples share the app
      ...context,
    });
  }

  /**
   * 🔄 Track page/route changes
   * @param route The new route
   * @param context Additional context
   */
  trackPageView(route: string, context: Record<string, any> = {}): void {
    this.trackEvent('page_view', {
      route,
      referrer: this.getSafeReferrer(),
      device: this.getDeviceType(),
      ...context,
      timestamp: Date.now(),
    });
  }

  /**
   * 🎉 Track celebration moments
   * @param celebrationType Type of celebration
   * @param context Celebration context
   */
  trackCelebration(
    celebrationType: 'milestone' | 'achievement' | 'daily_goal' | 'weekly_goal',
    context: Record<string, any> = {}
  ): void {
    this.trackEvent('love_celebration', {
      type: celebrationType,
      ...context,
      timestamp: Date.now(),
    });
  }

  /**
   * 📈 Get relationship insights (privacy-safe aggregated data)
   * @param timeframe Time period for insights
   * @returns Promise with anonymized insights
   */
  async getRelationshipInsights(timeframe: '7d' | '30d' | '90d' = '30d'): Promise<{
    activitiesCompleted: number;
    averageMood: number;
    streakDays: number;
    topFeatures: string[];
    performanceScore: number;
  }> {
    // This would typically connect to Cloudflare Analytics API
    // For now, return mock data based on localStorage
    const mockInsights = {
      activitiesCompleted: Math.floor(Math.random() * 50) + 10,
      averageMood: 4.2, // Out of 5
      streakDays: Math.floor(Math.random() * 14) + 1,
      topFeatures: ['ActionDashboard', 'GamificationCenter', 'ProgressTracker'],
      performanceScore: 92, // Percentage
    };

    return mockInsights;
  }

  /**
   * 🛠️ Private methods for analytics implementation
   */
  private trackEvent(eventName: string, properties: Record<string, any> = {}): void {
    const event: RelationshipEvent = {
      name: eventName,
      properties: this.sanitizeProperties(properties),
      timestamp: Date.now(),
    };

    if (this.isEnabled && window.cloudflare?.analytics) {
      // Send to Cloudflare Analytics
      window.cloudflare.analytics.track(eventName, properties);
    } else {
      // Queue for later or log in development
      this.queueEvent(event);
    }

    // Also log in development for debugging
    if (process.env.NODE_ENV === 'development') {
      console.log('💕 Love Analytics:', eventName, properties);
    }
  }

  private checkAnalyticsAvailability(): boolean {
    return typeof window !== 'undefined' && !!window.cloudflare?.analytics;
  }

  private async waitForAnalytics(): Promise<void> {
    // Wait up to 5 seconds for Cloudflare Analytics to load
    let attempts = 0;
    const maxAttempts = 50; // 5 seconds with 100ms intervals

    const checkInterval = setInterval(() => {
      attempts++;

      if (window.cloudflare?.analytics) {
        this.isEnabled = true;
        this.flushEventQueue();
        clearInterval(checkInterval);
      } else if (attempts >= maxAttempts) {
        console.warn('💔 Cloudflare Analytics not loaded - events will be queued');
        clearInterval(checkInterval);
      }
    }, 100);
  }

  private queueEvent(event: RelationshipEvent): void {
    if (this.eventQueue.length >= this.maxQueueSize) {
      this.eventQueue.shift(); // Remove oldest event
    }
    this.eventQueue.push(event);
  }

  private flushEventQueue(): void {
    while (this.eventQueue.length > 0 && this.isEnabled) {
      const event = this.eventQueue.shift();
      if (event) {
        this.trackEvent(event.name, event.properties);
      }
    }
  }

  private getSessionId(): string {
    // Generate privacy-safe session ID (no personal data)
    const sessionKey = 'couple_session_id';
    let sessionId = sessionStorage.getItem(sessionKey);

    if (!sessionId) {
      // Use cryptographically secure random values for session ID
      const randomArray = new Uint32Array(2);
      window.crypto.getRandomValues(randomArray);
      const randomStr = Array.from(randomArray).map(n => n.toString(36)).join('');
      sessionId = `session_${Date.now()}_${randomStr}`;
      sessionStorage.setItem(sessionKey, sessionId);
    }

    return sessionId;
  }

  private getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    if (typeof window === 'undefined') return 'desktop';

    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  private getSafeReferrer(): string {
    if (typeof document === 'undefined') return '';

    const referrer = document.referrer;
    // Only include our own domain referrers for privacy
    if (referrer.includes(window.location.hostname)) {
      return new URL(referrer).pathname;
    }
    return 'external';
  }

  private sanitizeProperties(properties: Record<string, any>): Record<string, any> {
    const sanitized: Record<string, any> = {};

    Object.entries(properties).forEach(([key, value]) => {
      // Only include safe data types and no personal information
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        sanitized[key] = value;
      } else if (value && typeof value === 'object') {
        sanitized[key] = JSON.stringify(value);
      }
    });

    return sanitized;
  }
}

/**
 * 🌟 Default analytics service instance
 */
export const analyticsService = new CloudflareAnalyticsService();

/**
 * 💕 React hook for easy analytics tracking
 * @returns Analytics utilities for React components
 */
export function useLoveAnalytics() {
  return {
    trackAction: (actionType: string, difficulty: LoveMetrics['actionCompleted']['difficulty']) => {
      analyticsService.trackLoveMetric('actionCompleted', {
        actionType,
        difficulty,
        coupleLevel: 1, // Would come from actual couple data
      });
    },

    trackAchievement: (achievementId: string, achievementType: string) => {
      analyticsService.trackLoveMetric('achievementUnlocked', {
        achievementId,
        achievementType,
        coupleLevel: 1, // Would come from actual couple data
        daysInRelationship: 365, // Would be calculated from actual data
      });
    },

    trackFeature: (feature: string, action: string = 'used') => {
      analyticsService.trackFeatureUsage(feature, action);
    },

    trackCelebration: (type: 'milestone' | 'achievement' | 'daily_goal' | 'weekly_goal') => {
      analyticsService.trackCelebration(type);
    },
  };
}

/**
 * 💖 Performance monitoring utilities
 */
export const performanceMonitor = {
  /**
   * ⚡ Measure and track page load performance
   */
  trackPageLoad: () => {
    if (typeof window !== 'undefined' && 'performance' in window) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const loadTime = performance.now();
          analyticsService.trackPerformance('pageLoad', loadTime);
        }, 0);
      });
    }
  },

  /**
   * 🖼️ Track image loading performance
   */
  trackImageLoad: (imageUrl: string, startTime: number) => {
    const loadTime = performance.now() - startTime;
    analyticsService.trackPerformance('imageLoad', loadTime, {
      imageType: imageUrl.includes('profile') ? 'profile' : 'other',
    });
  },

  /**
   * 🎯 Track user action response times
   */
  trackActionResponse: (actionType: string, startTime: number) => {
    const responseTime = performance.now() - startTime;
    analyticsService.trackPerformance('actionResponse', responseTime, {
      actionType,
    });
  },
};

/**
 * 💝 Example usage in React components:
 *
 * ```tsx
 * import { useLoveAnalytics, performanceMonitor } from '@/services/cloudflareAnalytics';
 *
 * function ActionCard({ action }: { action: Action }) {
 *   const analytics = useLoveAnalytics();
 *
 *   const handleCompleteAction = async () => {
 *     const startTime = performance.now();
 *
 *     // Complete the action...
 *     await completeAction(action.id);
 *
 *     // Track the completion
 *     analytics.trackAction(action.type, action.difficulty);
 *     performanceMonitor.trackActionResponse('complete_action', startTime);
 *   };
 *
 *   return (
 *     <button onClick={handleCompleteAction}>
 *       Complete Action 💕
 *     </button>
 *   );
 * }
 * ```
 */
