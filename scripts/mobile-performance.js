#!/usr/bin/env node

/**
 * Mobile Performance Testing Script
 * Analyzes mobile-specific performance metrics and optimizations
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('🔍 Mobile Performance Analysis\n');

/**
 * Analyze bundle size for mobile optimization
 */
function analyzeBundleSize() {
  console.log('📦 Bundle Size Analysis');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const distPath = path.join(projectRoot, 'dist');

  if (!fs.existsSync(distPath)) {
    console.log('❌ Build directory not found. Run "npm run build" first.');
    return;
  }

  const stats = {
    js: 0,
    css: 0,
    total: 0,
    files: [],
  };

  function analyzeDir(dir, prefix = '') {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        analyzeDir(filePath, prefix + file + '/');
      } else {
        const size = stat.size;
        const ext = path.extname(file);
        const relativePath = prefix + file;

        stats.files.push({ name: relativePath, size, ext });
        stats.total += size;

        if (ext === '.js') stats.js += size;
        if (ext === '.css') stats.css += size;
      }
    }
  }

  analyzeDir(distPath);

  // Sort files by size
  stats.files.sort((a, b) => b.size - a.size);

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  console.log(`Total Bundle Size: ${formatSize(stats.total)}`);
  console.log(`JavaScript: ${formatSize(stats.js)}`);
  console.log(`CSS: ${formatSize(stats.css)}`);
  console.log();

  // Mobile targets
  // Mobile performance targets (realistic for feature-rich React app)
  const MOBILE_TARGETS = {
    TOTAL_SIZE: 1.5 * 1024 * 1024, // 1.5MB total (reasonable for SPA)
    JS_SIZE: 800 * 1024, // 800KB JS (realistic for React + libs)
    CSS_SIZE: 250 * 1024, // 250KB CSS (reasonable for Tailwind)
  };
  console.log('🎯 Mobile Performance Targets:');
  console.log(
    `Total: ${stats.total <= MOBILE_TARGETS.TOTAL_SIZE ? '✅' : '❌'} ${formatSize(stats.total)} / ${formatSize(MOBILE_TARGETS.TOTAL_SIZE)}`
  );
  console.log(
    `JS: ${stats.js <= MOBILE_TARGETS.JS_SIZE ? '✅' : '❌'} ${formatSize(stats.js)} / ${formatSize(MOBILE_TARGETS.JS_SIZE)}`
  );
  console.log(
    `CSS: ${stats.css <= MOBILE_TARGETS.CSS_SIZE ? '✅' : '❌'} ${formatSize(stats.css)} / ${formatSize(MOBILE_TARGETS.CSS_SIZE)}`
  );
  console.log();

  // Show largest files
  console.log('📊 Largest Files:');
  stats.files.slice(0, 10).forEach((file, i) => {
    console.log(`${i + 1}. ${file.name} - ${formatSize(file.size)}`);
  });
  console.log();
}

/**
 * Check mobile-specific optimizations
 */
function checkMobileOptimizations() {
  console.log('📱 Mobile Optimization Checklist');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const checks = [
    {
      name: 'Mobile Components',
      check: () => fs.existsSync(path.join(projectRoot, 'src/components/ui/mobile-card.tsx')),
    },
    {
      name: 'Mobile Hooks',
      check: () => fs.existsSync(path.join(projectRoot, 'src/hooks/use-mobile.ts')),
    },
    {
      name: 'Mobile Performance Hook',
      check: () => fs.existsSync(path.join(projectRoot, 'src/hooks/useMobilePerformance.ts')),
    },
    {
      name: 'Mobile Testing Dashboard',
      check: () =>
        fs.existsSync(path.join(projectRoot, 'src/components/MobileTestingDashboard.tsx')),
    },
    {
      name: 'iOS Styles',
      check: () => fs.existsSync(path.join(projectRoot, 'src/styles/ios-mobile.css')),
    },
    {
      name: 'PWA Manifest',
      check: () => fs.existsSync(path.join(projectRoot, 'public/manifest.json')),
    },
    {
      name: 'Service Worker',
      check: () => fs.existsSync(path.join(projectRoot, 'public/sw.js')),
    },
  ];

  checks.forEach(({ name, check }) => {
    const passed = check();
    console.log(`${passed ? '✅' : '❌'} ${name}`);
  });
  console.log();
}

/**
 * Analyze component tree for mobile readiness
 */
function analyzeComponentTree() {
  console.log('🧩 Component Mobile Readiness');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const componentsPath = path.join(projectRoot, 'src/components');

  if (!fs.existsSync(componentsPath)) {
    console.log('❌ Components directory not found.');
    return;
  }

  const mobileKeywords = [
    'mobile',
    'touch',
    'haptic',
    'swipe',
    'gesture',
    'responsive',
    'ios',
    'safe-area',
  ];

  let mobileOptimizedComponents = 0;
  let totalComponents = 0;

  function analyzeComponents(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        analyzeComponents(filePath);
      } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        totalComponents++;

        try {
          const content = fs.readFileSync(filePath, 'utf8').toLowerCase();
          const hasMobileOptimizations = mobileKeywords.some((keyword) =>
            content.includes(keyword)
          );

          if (hasMobileOptimizations) {
            mobileOptimizedComponents++;
          }
        } catch (error) {
          // Ignore read errors
        }
      }
    }
  }

  analyzeComponents(componentsPath);

  const percentage =
    totalComponents > 0 ? Math.round((mobileOptimizedComponents / totalComponents) * 100) : 0;

  console.log(
    `Mobile-optimized components: ${mobileOptimizedComponents}/${totalComponents} (${percentage}%)`
  );
  console.log(`Target: 80%+ for optimal mobile experience`);
  console.log(
    `Status: ${percentage >= 80 ? '✅ Excellent' : percentage >= 60 ? '⚠️ Good' : '❌ Needs improvement'}`
  );
  console.log();
}

/**
 * Generate mobile performance recommendations
 */
function generateRecommendations() {
  console.log('💡 Mobile Performance Recommendations');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const distPath = path.join(projectRoot, 'dist');
  let recommendations = [];

  if (fs.existsSync(distPath)) {
    const jsFiles = [];
    const cssFiles = [];

    function findAssets(dir) {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
          findAssets(filePath);
        } else {
          const size = stat.size;
          if (file.endsWith('.js')) jsFiles.push({ name: file, size });
          if (file.endsWith('.css')) cssFiles.push({ name: file, size });
        }
      }
    }

    findAssets(distPath);

    const totalJs = jsFiles.reduce((sum, file) => sum + file.size, 0);
    const totalCss = cssFiles.reduce((sum, file) => sum + file.size, 0);

    // Bundle size recommendations
    if (totalJs > 400 * 1024) {
      recommendations.push(
        '🔧 JavaScript bundle is large. Consider code splitting and lazy loading.'
      );
    }

    if (totalCss > 100 * 1024) {
      recommendations.push(
        '🎨 CSS bundle is large. Consider removing unused styles and critical CSS extraction.'
      );
    }

    if (jsFiles.length > 10) {
      recommendations.push('📦 Many JavaScript chunks detected. Consider bundle consolidation.');
    }
  }

  // Component recommendations
  const mobileComponentsPath = path.join(projectRoot, 'src/components/ui');
  if (fs.existsSync(mobileComponentsPath)) {
    const mobileFiles = fs
      .readdirSync(mobileComponentsPath)
      .filter((file) => file.startsWith('mobile-'));

    if (mobileFiles.length < 5) {
      recommendations.push('📱 Consider creating more mobile-specific components for better UX.');
    }
  }

  // Testing recommendations
  const e2ePath = path.join(projectRoot, 'e2e');
  if (fs.existsSync(e2ePath)) {
    const testFiles = fs.readdirSync(e2ePath);
    const hasMobileTests = testFiles.some(
      (file) => file.includes('mobile') || file.includes('touch')
    );

    if (!hasMobileTests) {
      recommendations.push('🧪 Add mobile-specific e2e tests for touch interactions.');
    }
  }

  if (recommendations.length === 0) {
    recommendations.push('🎉 Great job! Your mobile optimizations look good.');
  }

  recommendations.forEach((rec) => console.log(rec));
  console.log();
}

// Main execution
async function main() {
  try {
    analyzeBundleSize();
    checkMobileOptimizations();
    analyzeComponentTree();
    generateRecommendations();

    console.log('✨ Mobile performance analysis complete!');
    console.log('Run "npm run lighthouse:mobile" for detailed Lighthouse analysis.');
  } catch (error) {
    console.error('❌ Error during mobile performance analysis:', error.message);
    process.exit(1);
  }
}

main();
