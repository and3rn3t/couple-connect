#!/usr/bin/env node

/**
 * Mobile Component Coverage Analysis Script
 *
 * Analyzes the project to track mobile component adoption and coverage
 */

const fs = require('fs').promises;
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');

// Component categories and their mobile optimization status
const COMPONENT_ANALYSIS = {
  // Core Components
  core: {
    'PartnerProfile.tsx': { mobile: 'ResponsivePartnerProfile.tsx', status: 'implemented' },
    'ActionDashboard.tsx': { mobile: 'ResponsiveActionDashboard.tsx', status: 'implemented' },
    'ProgressView.tsx': { mobile: 'ResponsiveProgressView.tsx', status: 'implemented' },
    'ActionDialog.tsx': { mobile: 'MobileActionDialog.tsx', status: 'partial' },
    'MindmapView.tsx': { mobile: 'MobileMindmapView.tsx', status: 'planned' },
  },

  // UI Components (src/components/ui/)
  ui: {
    'mobile-card.tsx': { status: 'implemented', coverage: 100 },
    'mobile-forms.tsx': { status: 'implemented', coverage: 100 },
    'mobile-layout.tsx': { status: 'implemented', coverage: 100 },
    'mobile-navigation.tsx': { status: 'implemented', coverage: 100 },
    'touch-feedback.tsx': { status: 'implemented', coverage: 100 },
    'button.tsx': { status: 'partial', coverage: 60, note: 'Touch targets need optimization' },
    'input.tsx': { status: 'partial', coverage: 50, note: 'Mobile keyboard optimization needed' },
    'select.tsx': { status: 'partial', coverage: 40, note: 'Touch-friendly dropdown needed' },
    'dialog.tsx': { status: 'partial', coverage: 30, note: 'Mobile sheet implementation needed' },
  },

  // Feature Components
  features: {
    'MobileActionDashboardOptimized.tsx': { status: 'implemented', coverage: 100 },
    'MobilePartnerProfile.tsx': { status: 'implemented', coverage: 100 },
    'MobileProgressView.tsx': { status: 'implemented', coverage: 100 },
    'DailyChallenges.tsx': { mobile: 'MobileDailyChallenges.tsx', status: 'needed' },
    'GamificationCenter.tsx': { mobile: 'MobileGamificationCenter.tsx', status: 'needed' },
    'RewardSystem.tsx': { mobile: 'MobileRewardSystem.tsx', status: 'needed' },
    'NotificationCenter.tsx': { mobile: 'MobileNotificationCenter.tsx', status: 'needed' },
  },

  // Responsive Wrappers
  responsive: {
    'ResponsivePartnerProfile.tsx': { status: 'implemented', coverage: 100 },
    'ResponsiveActionDashboard.tsx': { status: 'implemented', coverage: 100 },
    'ResponsiveProgressView.tsx': { status: 'implemented', coverage: 100 },
  },
};

async function analyzeProjectStructure() {
  console.log('📱 Mobile Component Coverage Analysis\n');

  const componentsDir = path.join(ROOT_DIR, 'src', 'components');
  const uiDir = path.join(componentsDir, 'ui');

  let totalComponents = 0;
  let mobileOptimizedComponents = 0;
  let partiallyOptimizedComponents = 0;

  const results = {
    implemented: [],
    partial: [],
    needed: [],
    coverage: {
      core: { total: 0, mobile: 0 },
      ui: { total: 0, mobile: 0 },
      features: { total: 0, mobile: 0 },
    },
  };

  // Analyze each category
  for (const [category, components] of Object.entries(COMPONENT_ANALYSIS)) {
    console.log(`\n📂 ${category.toUpperCase()} Components:`);
    console.log('━'.repeat(50));

    for (const [component, info] of Object.entries(components)) {
      totalComponents++;
      results.coverage[category] = results.coverage[category] || { total: 0, mobile: 0 };
      results.coverage[category].total++;

      const status = info.status;
      const coverage = info.coverage || 0;

      let statusIcon = '';
      let statusText = '';

      switch (status) {
        case 'implemented':
          statusIcon = '✅';
          statusText = 'Fully Mobile Optimized';
          mobileOptimizedComponents++;
          results.coverage[category].mobile++;
          results.implemented.push({ category, component, coverage: coverage || 100 });
          break;
        case 'partial':
          statusIcon = '🟡';
          statusText = `Partially Optimized (${coverage}%)`;
          partiallyOptimizedComponents++;
          results.coverage[category].mobile += 0.5;
          results.partial.push({ category, component, coverage, note: info.note });
          break;
        case 'needed':
          statusIcon = '❌';
          statusText = 'Mobile Version Needed';
          results.needed.push({ category, component, mobile: info.mobile });
          break;
        case 'planned':
          statusIcon = '📋';
          statusText = 'Planned for Implementation';
          results.needed.push({ category, component, mobile: info.mobile });
          break;
      }

      console.log(`${statusIcon} ${component}`);
      console.log(`   ${statusText}`);
      if (info.mobile) {
        console.log(`   Mobile Version: ${info.mobile}`);
      }
      if (info.note) {
        console.log(`   Note: ${info.note}`);
      }
      console.log('');
    }
  }

  return { totalComponents, mobileOptimizedComponents, partiallyOptimizedComponents, results };
}

async function generateCoverageReport(analysis) {
  const { totalComponents, mobileOptimizedComponents, partiallyOptimizedComponents, results } =
    analysis;

  const fullCoverage = (mobileOptimizedComponents / totalComponents) * 100;
  const partialCoverage = (partiallyOptimizedComponents / totalComponents) * 100;
  const totalCoverage = fullCoverage + partialCoverage * 0.5;

  console.log('\n📊 Mobile Optimization Summary');
  console.log('━'.repeat(50));
  console.log(`Total Components: ${totalComponents}`);
  console.log(
    `✅ Fully Mobile Optimized: ${mobileOptimizedComponents} (${fullCoverage.toFixed(1)}%)`
  );
  console.log(
    `🟡 Partially Optimized: ${partiallyOptimizedComponents} (${partialCoverage.toFixed(1)}%)`
  );
  console.log(`❌ Need Mobile Version: ${results.needed.length}`);
  console.log(`\n🎯 Overall Mobile Coverage: ${totalCoverage.toFixed(1)}%`);

  // Progress towards 80% target
  const target = 80;
  const remaining = Math.max(0, target - totalCoverage);

  if (totalCoverage >= target) {
    console.log(`\n🎉 SUCCESS! Exceeded 80% mobile coverage target!`);
  } else {
    console.log(`\n📈 Progress to 80% target: ${((totalCoverage / target) * 100).toFixed(1)}%`);
    console.log(
      `   Remaining: ${remaining.toFixed(1)}% (${Math.ceil((remaining / 100) * totalComponents)} components)`
    );
  }

  return {
    totalCoverage,
    fullCoverage,
    partialCoverage,
    target,
    remaining,
    componentsNeeded: Math.ceil((remaining / 100) * totalComponents),
  };
}

async function generatePriorityList(results) {
  console.log('\n🎯 Next Implementation Priorities');
  console.log('━'.repeat(50));

  // High priority components (core functionality)
  const highPriority = results.needed.filter(
    (item) =>
      item.category === 'core' ||
      ['DailyChallenges.tsx', 'NotificationCenter.tsx'].includes(item.component)
  );

  // Medium priority (nice to have features)
  const mediumPriority = results.needed.filter(
    (item) => !highPriority.includes(item) && item.category === 'features'
  );

  // Partial optimization improvements
  const improvements = results.partial.filter((item) => item.coverage < 80);

  console.log('\n🔴 HIGH PRIORITY (Core Features):');
  highPriority.forEach((item) => {
    console.log(`   • ${item.component} → ${item.mobile}`);
  });

  console.log('\n🟡 MEDIUM PRIORITY (Enhanced Features):');
  mediumPriority.forEach((item) => {
    console.log(`   • ${item.component} → ${item.mobile}`);
  });

  console.log('\n🔧 IMPROVEMENTS NEEDED:');
  improvements.forEach((item) => {
    console.log(`   • ${item.component} (${item.coverage}%) - ${item.note}`);
  });

  return { highPriority, mediumPriority, improvements };
}

async function main() {
  try {
    console.log('🚀 Starting Mobile Component Coverage Analysis...\n');

    const analysis = await analyzeProjectStructure();
    const coverage = await generateCoverageReport(analysis);
    const priorities = await generatePriorityList(analysis.results);

    // Generate recommendations
    console.log('\n💡 Recommendations');
    console.log('━'.repeat(50));

    if (coverage.totalCoverage >= 80) {
      console.log('✅ Excellent mobile coverage! Focus on:');
      console.log('   • Performance optimization');
      console.log('   • User experience refinements');
      console.log('   • Advanced mobile features (haptics, gestures)');
    } else if (coverage.totalCoverage >= 60) {
      console.log('🎯 Good progress! Next steps:');
      console.log(`   • Complete ${priorities.highPriority.length} high priority components`);
      console.log('   • Improve partial implementations');
      console.log('   • Test on real mobile devices');
    } else {
      console.log('📱 Focus on mobile-first development:');
      console.log('   • Prioritize core component mobile versions');
      console.log('   • Implement responsive design patterns');
      console.log('   • Set up mobile testing workflow');
    }

    console.log('\n✨ Analysis completed successfully!');
    console.log(`📈 Current mobile coverage: ${coverage.totalCoverage.toFixed(1)}% (Target: 80%)`);
  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { analyzeMobileCoverage: main };
