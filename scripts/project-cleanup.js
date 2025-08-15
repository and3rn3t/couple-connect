#!/usr/bin/env node

/**
 * Project Cleanup Script
 * Removes temporary files, optimizes structure, and validates configuration
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('🧹 Project Cleanup & Validation\n');

// Files and directories to clean up
const CLEANUP_TARGETS = [
  // Build artifacts
  'dist',
  'coverage',
  'playwright-report',
  'test-results',
  '.performance-history',

  // Dependencies
  'node_modules/.cache',
  'node_modules/.vite',

  // Temporary files
  '*.log',
  '*.tgz',
  '*.tar.gz',

  // OS specific
  '.DS_Store',
  'Thumbs.db',
  'desktop.ini',

  // Editor specific
  '.vscode/settings.json.backup',
  '*.swp',
  '*.swo',
  '*~',
];

// Required files validation
const REQUIRED_FILES = [
  'package.json',
  'vite.config.ts',
  'tsconfig.json',
  'tailwind.config.js',
  'README.md',
  'src/main.tsx',
  'src/App.tsx',
  'src/components/LazyIcons.tsx',
  'src/components/LazyRoutes.tsx',
  'src/components/LazyCharts.tsx',
];

// Performance scripts validation
const PERFORMANCE_SCRIPTS = [
  'scripts/mobile-performance.js',
  'scripts/optimize-css-aggressive.js',
  'scripts/implement-lazy-loading.js',
  'scripts/analyze-bundle.js',
];

function cleanupFiles() {
  console.log('🗑️  Cleaning up temporary files...');

  let cleanedCount = 0;

  for (const target of CLEANUP_TARGETS) {
    const fullPath = path.join(projectRoot, target);

    if (fs.existsSync(fullPath)) {
      try {
        if (fs.statSync(fullPath).isDirectory()) {
          fs.rmSync(fullPath, { recursive: true, force: true });
          console.log(`  ✅ Removed directory: ${target}`);
        } else {
          fs.unlinkSync(fullPath);
          console.log(`  ✅ Removed file: ${target}`);
        }
        cleanedCount++;
      } catch (error) {
        console.log(`  ⚠️  Could not remove: ${target}`);
      }
    }
  }

  console.log(`\n📊 Cleanup complete: ${cleanedCount} items removed\n`);
}

function validateRequiredFiles() {
  console.log('🔍 Validating required files...');

  let missingFiles = [];

  for (const file of REQUIRED_FILES) {
    const fullPath = path.join(projectRoot, file);
    if (!fs.existsSync(fullPath)) {
      missingFiles.push(file);
      console.log(`  ❌ Missing: ${file}`);
    } else {
      console.log(`  ✅ Found: ${file}`);
    }
  }

  if (missingFiles.length > 0) {
    console.log(`\n⚠️  ${missingFiles.length} required files missing!`);
    return false;
  } else {
    console.log(`\n✅ All required files present\n`);
    return true;
  }
}

function validatePerformanceScripts() {
  console.log('⚡ Validating performance scripts...');

  let missingScripts = [];

  for (const script of PERFORMANCE_SCRIPTS) {
    const fullPath = path.join(projectRoot, script);
    if (!fs.existsSync(fullPath)) {
      missingScripts.push(script);
      console.log(`  ❌ Missing: ${script}`);
    } else {
      console.log(`  ✅ Found: ${script}`);
    }
  }

  if (missingScripts.length > 0) {
    console.log(`\n⚠️  ${missingScripts.length} performance scripts missing!`);
    return false;
  } else {
    console.log(`\n✅ All performance scripts present\n`);
    return true;
  }
}

function validatePackageJson() {
  console.log('📦 Validating package.json...');

  const packagePath = path.join(projectRoot, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));

  // Check for required scripts
  const requiredScripts = [
    'dev',
    'build',
    'perf:mobile',
    'optimize:mobile',
    'analyze:lazy',
    'build:analyze',
  ];

  let missingScripts = [];

  for (const script of requiredScripts) {
    if (!packageJson.scripts[script]) {
      missingScripts.push(script);
      console.log(`  ❌ Missing script: ${script}`);
    } else {
      console.log(`  ✅ Found script: ${script}`);
    }
  }

  // Check for critical dependencies
  const criticalDeps = ['@vitejs/plugin-react-swc', 'tailwindcss', '@tailwindcss/vite', 'vite'];

  let missingDeps = [];

  for (const dep of criticalDeps) {
    if (!packageJson.dependencies[dep] && !packageJson.devDependencies[dep]) {
      missingDeps.push(dep);
      console.log(`  ❌ Missing dependency: ${dep}`);
    } else {
      console.log(`  ✅ Found dependency: ${dep}`);
    }
  }

  if (missingScripts.length > 0 || missingDeps.length > 0) {
    console.log(`\n⚠️  Package.json validation failed!`);
    return false;
  } else {
    console.log(`\n✅ Package.json validation passed\n`);
    return true;
  }
}

function generateProjectReport() {
  console.log('📋 Generating project status report...');

  const report = {
    timestamp: new Date().toISOString(),
    projectName: 'Couple Connect',
    status: 'Mobile Optimization Phase',
    issues: [],
    recommendations: [],
  };

  // Check bundle size
  const distPath = path.join(projectRoot, 'dist');
  if (fs.existsSync(distPath)) {
    // Calculate dist size
    let totalSize = 0;
    function calculateSize(dir) {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
          calculateSize(fullPath);
        } else {
          totalSize += stat.size;
        }
      }
    }
    calculateSize(distPath);

    const sizeInMB = (totalSize / (1024 * 1024)).toFixed(2);
    console.log(`  📦 Current build size: ${sizeInMB} MB`);

    if (totalSize > 1.5 * 1024 * 1024) {
      // 1.5 MB
      report.issues.push(`Bundle size (${sizeInMB} MB) exceeds mobile target (1.5 MB)`);
      report.recommendations.push('Run npm run analyze:lazy to debug large chunks');
    }
  } else {
    report.issues.push('No build artifacts found - run npm run build');
  }

  // Check mobile optimization files
  const lazyIconsPath = path.join(projectRoot, 'src/components/LazyIcons.tsx');
  if (fs.existsSync(lazyIconsPath)) {
    console.log(`  ✅ Lazy loading implementation found`);
  } else {
    report.issues.push('Lazy loading implementation missing');
  }

  // Save report
  const reportPath = path.join(projectRoot, 'project-status.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`  ✅ Report saved to: project-status.json\n`);

  return report;
}

async function runCleanup() {
  try {
    console.log('🚀 Starting project cleanup and validation...\n');

    // 1. Clean up temporary files
    cleanupFiles();

    // 2. Validate project structure
    const filesValid = validateRequiredFiles();
    const scriptsValid = validatePerformanceScripts();
    const packageValid = validatePackageJson();

    // 3. Generate status report
    const report = generateProjectReport();

    // 4. Summary
    console.log('📊 CLEANUP SUMMARY');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    if (filesValid && scriptsValid && packageValid) {
      console.log('✅ Project structure: VALID');
    } else {
      console.log('❌ Project structure: ISSUES FOUND');
    }

    console.log(`📋 Issues identified: ${report.issues.length}`);
    console.log(`💡 Recommendations: ${report.recommendations.length}`);

    if (report.issues.length > 0) {
      console.log('\n🔧 Issues to address:');
      report.issues.forEach((issue, i) => console.log(`  ${i + 1}. ${issue}`));
    }

    if (report.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      report.recommendations.forEach((rec, i) => console.log(`  ${i + 1}. ${rec}`));
    }

    console.log('\n🎯 Next steps:');
    console.log('  1. Run: npm run perf:mobile (check current metrics)');
    console.log('  2. Run: npm run build:analyze (debug bundle size)');
    console.log('  3. Review: docs/MOBILE_OPTIMIZATION.md');
    console.log('  4. Debug: Large JavaScript chunk issue');

    console.log('\n✅ Project cleanup complete!');
  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
    process.exit(1);
  }
}

runCleanup();
