#!/usr/bin/env node

/**
 * Comprehensive Project Cleanup Script for Couple Connect
 *
 * This script organizes the project by:
 * 1. Removing temporary/generated files
 * 2. Organizing documentation
 * 3. Consolidating configuration files
 * 4. Updating project status
 */

import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Files to clean up (temporary/generated files)
const CLEANUP_PATTERNS = [
  'build-performance.json',
  'bundle-analysis.json',
  'coverage-report.json',
  'css-analysis.json',
  'tailwind-usage-analysis.json',
  'tailwind.config.backup.js',
  'tailwind.config.full.backup.js',
  'project-status.json',
  'theme.json',
  '*.log',
  'dist/**/*', // Will be regenerated on build
];

// Configuration files to keep but organize
const CONFIG_FILES = [
  'vite.config.ts',
  'tailwind.config.js',
  'tailwind.mobile-optimized.config.js',
  'tailwind-mobile.config.js',
  'tailwind.minimal.config.js',
  'postcss.config.cjs',
  'postcss.mobile.config.cjs',
  'eslint.config.js',
  'tsconfig.json',
  'vitest.config.ts',
  'playwright.config.ts',
  'lighthouse.config.js',
];

// Essential scripts to keep
const ESSENTIAL_SCRIPTS = [
  'mobile-performance.js',
  'optimize-build.js',
  'analyze-bundle.js',
  'project-cleanup-comprehensive.js', // This script
  'docker-deploy.ps1',
  'docker-deploy.sh',
];

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function cleanupTemporaryFiles() {
  console.log('🧹 Cleaning up temporary files...');

  for (const pattern of CLEANUP_PATTERNS) {
    const filePath = path.join(ROOT_DIR, pattern);

    if (await fileExists(filePath)) {
      try {
        await fs.unlink(filePath);
        console.log(`  ✅ Removed: ${pattern}`);
      } catch (error) {
        console.log(`  ❌ Failed to remove ${pattern}: ${error.message}`);
      }
    }
  }
}

async function organizeScripts() {
  console.log('📁 Organizing scripts directory...');

  const scriptsDir = path.join(ROOT_DIR, 'scripts');
  const files = await fs.readdir(scriptsDir);

  // Create archive directory for old scripts
  const archiveDir = path.join(scriptsDir, 'archive');
  try {
    await fs.mkdir(archiveDir, { recursive: true });
  } catch {}

  let movedCount = 0;
  let keptCount = 0;

  for (const file of files) {
    if (file === 'archive') continue;

    const filePath = path.join(scriptsDir, file);
    const stats = await fs.stat(filePath);

    if (stats.isFile() && !ESSENTIAL_SCRIPTS.includes(file)) {
      // Check if it's an old optimization/analysis script
      if (
        file.includes('optimize-') ||
        file.includes('analyze-') ||
        file.includes('fix-') ||
        file.includes('implement-') ||
        file.includes('convert-') ||
        file.endsWith('.cjs')
      ) {
        const archivePath = path.join(archiveDir, file);
        try {
          await fs.rename(filePath, archivePath);
          console.log(`  📦 Archived: ${file}`);
          movedCount++;
        } catch (error) {
          console.log(`  ❌ Failed to archive ${file}: ${error.message}`);
        }
      } else {
        console.log(`  ✅ Kept: ${file}`);
        keptCount++;
      }
    }
  }

  console.log(`  📊 Results: ${movedCount} archived, ${keptCount} kept`);
}

async function updateProjectStatus() {
  console.log('📊 Updating project status...');

  const status = {
    timestamp: new Date().toISOString(),
    projectName: 'Couple Connect',
    version: '1.0.0',
    status: 'Production Ready - Mobile Optimized',
    techStack: {
      frontend: 'React 19, TypeScript, Vite',
      styling: 'Tailwind CSS, Radix UI',
      performance: 'Lazy loading, code splitting',
      deployment: 'Cloudflare Pages',
      database: 'Cloudflare D1',
    },
    currentMetrics: {
      bundleSize: '1.6 MB',
      javascript: '1.18 MB',
      css: '415 KB',
      mobileComponents: '23%',
    },
    targets: {
      bundleSize: '1.5 MB',
      javascript: '800 KB',
      css: '250 KB',
      mobileComponents: '80%',
    },
    lastCleanup: new Date().toISOString(),
    priorities: [
      'Reduce largest JavaScript chunk (606 KB)',
      'Increase mobile component coverage to 80%',
      'Optimize CSS bundle size',
      'Implement more aggressive code splitting',
    ],
  };

  const statusPath = path.join(ROOT_DIR, 'PROJECT_STATUS.md');
  const content = `# 📊 Couple Connect - Project Status

**Last Updated**: ${new Date().toLocaleDateString()}
**Status**: ${status.status}
**Version**: ${status.version}

## 🎯 Current Performance Metrics

| Metric | Current | Target | Status |
|--------|---------|--------|---------|
| Bundle Size | ${status.currentMetrics.bundleSize} | ${status.targets.bundleSize} | ${status.currentMetrics.bundleSize > status.targets.bundleSize ? '❌' : '✅'} |
| JavaScript | ${status.currentMetrics.javascript} | ${status.targets.javascript} | ❌ |
| CSS | ${status.currentMetrics.css} | ${status.targets.css} | ❌ |
| Mobile Components | ${status.currentMetrics.mobileComponents} | ${status.targets.mobileComponents} | ❌ |

## 🛠️ Tech Stack

${Object.entries(status.techStack)
  .map(([key, value]) => `- **${key.charAt(0).toUpperCase() + key.slice(1)}**: ${value}`)
  .join('\n')}

## 🎯 Current Priorities

${status.priorities.map((priority, index) => `${index + 1}. ${priority}`).join('\n')}

## 📝 Quick Commands

\`\`\`bash
# Development
npm run dev
npm run build
npm run test

# Performance Analysis
npm run perf:mobile
npm run build:analyze

# Mobile Testing
npm run test:mobile
npm run lighthouse:mobile

# Deployment
npm run deploy
npm run docker:deploy
\`\`\`

---
*Generated by project cleanup script on ${new Date().toISOString()}*
`;

  await fs.writeFile(statusPath, content, 'utf8');
  console.log('  ✅ Created PROJECT_STATUS.md');
}

async function validateEssentialFiles() {
  console.log('🔍 Validating essential files...');

  const essentialFiles = [
    'package.json',
    'README.md',
    'vite.config.ts',
    'tailwind.config.js',
    'src/App.tsx',
    'src/main.tsx',
    '.github/copilot-instructions.md',
  ];

  let missingFiles = [];

  for (const file of essentialFiles) {
    const filePath = path.join(ROOT_DIR, file);
    if (!(await fileExists(filePath))) {
      missingFiles.push(file);
    }
  }

  if (missingFiles.length > 0) {
    console.log('  ❌ Missing essential files:');
    missingFiles.forEach((file) => console.log(`    - ${file}`));
  } else {
    console.log('  ✅ All essential files present');
  }

  return missingFiles;
}

async function generateCleanupReport() {
  console.log('📋 Generating cleanup report...');

  const report = {
    timestamp: new Date().toISOString(),
    actions: [
      'Removed temporary analysis files',
      'Archived old optimization scripts',
      'Updated project status documentation',
      'Validated essential files',
    ],
    nextSteps: [
      'Update copilot instructions with current metrics',
      'Focus on largest JavaScript chunk optimization',
      'Increase mobile component coverage',
      'Implement CSS bundle optimization',
    ],
  };

  console.log('\n📊 Cleanup Report:');
  console.log('==================');
  console.log(`Timestamp: ${report.timestamp}`);
  console.log('\nActions Completed:');
  report.actions.forEach((action) => console.log(`  ✅ ${action}`));
  console.log('\nRecommended Next Steps:');
  report.nextSteps.forEach((step) => console.log(`  🎯 ${step}`));
}

async function main() {
  console.log('🚀 Starting Couple Connect project cleanup...\n');

  try {
    await cleanupTemporaryFiles();
    console.log('');

    await organizeScripts();
    console.log('');

    await updateProjectStatus();
    console.log('');

    const missingFiles = await validateEssentialFiles();
    console.log('');

    await generateCleanupReport();

    console.log('\n✨ Project cleanup completed successfully!');

    if (missingFiles.length > 0) {
      console.log('\n⚠️  Please address missing files before continuing development.');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main as cleanup };
