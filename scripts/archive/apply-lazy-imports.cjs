const fs = require('fs');
const path = require('path');

const appFilePath = path.join(__dirname, '..', 'src', 'App.tsx');
let content = fs.readFileSync(appFilePath, 'utf8');

console.log('🔄 Applying basic lazy loading improvements to App.tsx...');

// Only replace imports, not component usage (to avoid syntax issues)
const importReplacements = [
  // Remove heavy direct imports and replace with lazy loading comment
  ["import MindmapView from '@/components/MindmapView';", '// MindmapView - will be lazy loaded'],
  [
    "import MobileActionDashboard from '@/components/MobileActionDashboardOptimized';",
    '// MobileActionDashboard - will be lazy loaded',
  ],
  [
    "import { OfflineNotification } from '@/components/OfflineNotification';",
    '// OfflineNotification - will be lazy loaded',
  ],
  [
    "import PartnerSetup, { Partner } from '@/components/PartnerSetup';",
    "import { Partner } from '@/components/PartnerSetup'; // PartnerSetup - will be lazy loaded",
  ],
  [
    "import PartnerProfile from '@/components/PartnerProfile';",
    '// PartnerProfile - will be lazy loaded',
  ],
  [
    "import NotificationCenter from '@/components/NotificationCenter';",
    '// NotificationCenter - will be lazy loaded',
  ],
  [
    "import NotificationSummary from '@/components/NotificationSummary';",
    '// NotificationSummary - will be lazy loaded',
  ],
  [
    "import GamificationCenter, { GamificationState } from '@/components/GamificationCenter';",
    "import { GamificationState } from '@/components/GamificationCenter'; // GamificationCenter - will be lazy loaded",
  ],
  [
    "import RewardSystem from '@/components/RewardSystem';",
    '// RewardSystem - will be lazy loaded',
  ],
  [
    "import DailyChallenges from '@/components/DailyChallenges';",
    '// DailyChallenges - will be lazy loaded',
  ],
  [
    "import { PerformanceDashboard } from '@/components/PerformanceDashboard';",
    '// PerformanceDashboard - will be lazy loaded',
  ],
];

// Add lazy imports at the top after other imports
const lazyImportCode = `
// Lazy-loaded components to reduce initial bundle size
import { lazy, Suspense } from 'react';

const LazyMindmapView = lazy(() => import('@/components/MindmapView'));
const LazyMobileActionDashboard = lazy(() => import('@/components/MobileActionDashboardOptimized'));
const LazyOfflineNotification = lazy(() => import('@/components/OfflineNotification').then(m => ({ default: m.OfflineNotification })));
const LazyPartnerSetup = lazy(() => import('@/components/PartnerSetup'));
const LazyPartnerProfile = lazy(() => import('@/components/PartnerProfile'));
const LazyNotificationCenter = lazy(() => import('@/components/NotificationCenter'));
const LazyNotificationSummary = lazy(() => import('@/components/NotificationSummary'));
const LazyGamificationCenter = lazy(() => import('@/components/GamificationCenter'));
const LazyRewardSystem = lazy(() => import('@/components/RewardSystem'));
const LazyDailyChallenges = lazy(() => import('@/components/DailyChallenges'));
const LazyPerformanceDashboard = lazy(() => import('@/components/PerformanceDashboard').then(m => ({ default: m.PerformanceDashboard })));

// Loading fallback component
const ComponentLoader = ({ message = "Loading..." }: { message?: string }) => (
  <div className="flex items-center justify-center p-8">
    <div className="space-y-4 text-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  </div>
);
`;

// Apply import replacements
let changes = 0;
importReplacements.forEach(([oldImport, newImport]) => {
  if (content.includes(oldImport)) {
    content = content.replace(oldImport, newImport);
    changes++;
    console.log(`  ✅ Replaced import: ${oldImport.slice(0, 40)}...`);
  }
});

// Add lazy imports after the existing imports
const importSectionEnd = content.lastIndexOf('import ');
const lineEnd = content.indexOf('\\n', importSectionEnd);
if (lineEnd > -1) {
  content = content.slice(0, lineEnd + 1) + lazyImportCode + content.slice(lineEnd + 1);
  changes++;
  console.log('  ✅ Added lazy import definitions');
}

// Write the updated file
fs.writeFileSync(appFilePath, content);

console.log(`\\n✅ Applied ${changes} lazy loading improvements to App.tsx`);
console.log('📦 Removed heavy direct imports - components will be bundled separately!');
console.log('⚠️  Manual component usage updates needed - check App.tsx for commented imports');
