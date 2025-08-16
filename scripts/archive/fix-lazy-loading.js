const fs = require('fs');
const path = require('path');

const appFilePath = path.join(__dirname, '..', 'src', 'App.tsx');
let content = fs.readFileSync(appFilePath, 'utf8');

// Component mapping from old names to lazy versions
const componentReplacements = [
  // Basic component replacements
  [
    '<OfflineNotification />',
    '<Suspense fallback={<ComponentLoader message="Loading notification..." />}><LazyOfflineNotification /></Suspense>',
  ],
  [
    '<PartnerProfile',
    '<Suspense fallback={<ComponentLoader message="Loading profile..." />}><LazyPartnerProfile',
  ],
  [
    '<MindmapView',
    '<Suspense fallback={<ComponentLoader message="Loading mindmap..." />}><LazyMindmapView',
  ],
  [
    '<MobileActionDashboard',
    '<Suspense fallback={<ComponentLoader message="Loading dashboard..." />}><LazyMobileActionDashboard',
  ],
  [
    '<GamificationCenter',
    '<Suspense fallback={<ComponentLoader message="Loading gamification..." />}><LazyGamificationCenter',
  ],
  [
    '<RewardSystem',
    '<Suspense fallback={<ComponentLoader message="Loading rewards..." />}><LazyRewardSystem',
  ],
  [
    '<NotificationCenter',
    '<Suspense fallback={<ComponentLoader message="Loading notifications..." />}><LazyNotificationCenter',
  ],
  [
    '<NotificationSummary',
    '<Suspense fallback={<ComponentLoader message="Loading summary..." />}><LazyNotificationSummary',
  ],
  [
    '<PerformanceDashboard />',
    '<Suspense fallback={<ComponentLoader message="Loading dashboard..." />}><LazyPerformanceDashboard /></Suspense>',
  ],
  [
    '<DailyChallenges',
    '<Suspense fallback={<ComponentLoader message="Loading challenges..." />}><LazyDailyChallenges',
  ],

  // Closing tag replacements - need to be done after opening tags
  ['</PartnerProfile>', '</LazyPartnerProfile></Suspense>'],
  ['</MindmapView>', '</LazyMindmapView></Suspense>'],
  ['</MobileActionDashboard>', '</LazyMobileActionDashboard></Suspense>'],
  ['</GamificationCenter>', '</LazyGamificationCenter></Suspense>'],
  ['</RewardSystem>', '</LazyRewardSystem></Suspense>'],
  ['</NotificationCenter>', '</LazyNotificationCenter></Suspense>'],
  ['</NotificationSummary>', '</LazyNotificationSummary></Suspense>'],
  ['</DailyChallenges>', '</LazyDailyChallenges></Suspense>'],
];

console.log('🔄 Applying lazy loading transformations...');

// Apply replacements
let changes = 0;
componentReplacements.forEach(([oldPattern, newPattern]) => {
  const before = content;
  content = content.replaceAll(oldPattern, newPattern);
  if (content !== before) {
    changes++;
    console.log(`  ✅ Replaced: ${oldPattern.slice(0, 30)}...`);
  }
});

// Write the updated file
fs.writeFileSync(appFilePath, content);

console.log(`\n✅ Applied ${changes} lazy loading transformations to App.tsx`);
console.log('📦 Bundle should now be much smaller with proper code splitting!');
