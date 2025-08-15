#!/usr/bin/env node

/**
 * Mobile CSS Optimization Script
 * Creates a mobile-optimized CSS build by analyzing which Tailwind classes are actually used
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

console.log('🎨 Mobile CSS Optimization\n');

// Analyze which Tailwind classes are actually used in the codebase
function analyzeUsedClasses() {
  const srcPath = path.join(projectRoot, 'src');
  const usedClasses = new Set();

  // Patterns to find Tailwind classes
  const tailwindPattern = /class(?:Name)?=["'`]([^"'`]*?)["'`]/g;
  const cnPattern = /cn\([^)]*?["'`]([^"'`]*?)["'`]/g;

  function scanDirectory(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        // Skip node_modules and other build directories
        if (!['node_modules', '.git', 'dist', 'build'].includes(file)) {
          scanDirectory(filePath);
        }
      } else if (file.match(/\.(tsx?|jsx?)$/)) {
        const content = fs.readFileSync(filePath, 'utf-8');

        // Extract classes from className attributes
        let match;
        while ((match = tailwindPattern.exec(content)) !== null) {
          const classes = match[1].split(/\s+/).filter(Boolean);
          classes.forEach((cls) => usedClasses.add(cls));
        }

        // Extract classes from cn() function calls
        while ((match = cnPattern.exec(content)) !== null) {
          const classes = match[1].split(/\s+/).filter(Boolean);
          classes.forEach((cls) => usedClasses.add(cls));
        }
      }
    }
  }

  scanDirectory(srcPath);
  return Array.from(usedClasses).sort();
}

// Categorize classes by type
function categorizeClasses(classes) {
  const categories = {
    layout: [],
    spacing: [],
    colors: [],
    typography: [],
    effects: [],
    responsive: [],
    states: [],
    mobile: [],
    unused: [],
  };

  for (const cls of classes) {
    if (cls.includes(':')) {
      if (
        cls.startsWith('sm:') ||
        cls.startsWith('md:') ||
        cls.startsWith('lg:') ||
        cls.startsWith('xl:')
      ) {
        categories.responsive.push(cls);
      } else if (cls.includes('hover:') || cls.includes('focus:') || cls.includes('active:')) {
        categories.states.push(cls);
      } else {
        categories.responsive.push(cls);
      }
    } else if (
      cls.startsWith('touch-') ||
      cls.startsWith('safe-area-') ||
      cls.startsWith('mobile-')
    ) {
      categories.mobile.push(cls);
    } else if (cls.match(/^(p|m|space|gap)-/)) {
      categories.spacing.push(cls);
    } else if (cls.match(/^(bg|text|border)-/)) {
      categories.colors.push(cls);
    } else if (cls.match(/^(text|font|leading|tracking)/)) {
      categories.typography.push(cls);
    } else if (cls.match(/^(flex|grid|block|hidden|relative|absolute)/)) {
      categories.layout.push(cls);
    } else if (cls.match(/^(shadow|rounded|opacity|blur)/)) {
      categories.effects.push(cls);
    } else {
      categories.unused.push(cls);
    }
  }

  return categories;
}

// Generate recommendations
function generateOptimizationRecommendations(categories, totalClasses) {
  console.log('🔍 CSS Usage Analysis');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Total Tailwind classes found: ${totalClasses}`);
  console.log();

  console.log('📊 Class Distribution:');
  Object.entries(categories).forEach(([category, classes]) => {
    if (classes.length > 0) {
      const percentage = ((classes.length / totalClasses) * 100).toFixed(1);
      console.log(`  ${category}: ${classes.length} classes (${percentage}%)`);
    }
  });
  console.log();

  console.log('💡 Optimization Recommendations:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Check for excessive responsive classes
  if (categories.responsive.length > 100) {
    console.log('🔧 Consider reducing responsive variants - many breakpoint classes detected');
  }

  // Check for excessive color variations
  if (categories.colors.length > 80) {
    console.log('🎨 Consider consolidating color palette - many color classes detected');
  }

  // Check spacing usage
  if (categories.spacing.length > 60) {
    console.log('📏 Consider using consistent spacing scale - many spacing classes detected');
  }

  // Mobile optimization suggestions
  if (categories.mobile.length < 10) {
    console.log('📱 Consider adding more mobile-specific classes for better mobile UX');
  }

  console.log('✨ To reduce CSS bundle size:');
  console.log('  1. Use Tailwind JIT mode (already enabled)');
  console.log('  2. Remove unused responsive breakpoints');
  console.log('  3. Consolidate similar color variations');
  console.log('  4. Use CSS variables for frequently repeated values');
  console.log('  5. Consider extracting common patterns into components');
}

// Main execution
function main() {
  try {
    console.log('Scanning codebase for Tailwind class usage...');
    const usedClasses = analyzeUsedClasses();
    const categories = categorizeClasses(usedClasses);

    generateOptimizationRecommendations(categories, usedClasses.length);

    // Save analysis for later use
    const analysis = {
      totalClasses: usedClasses.length,
      categories,
      usedClasses,
      timestamp: new Date().toISOString(),
    };

    const outputPath = path.join(projectRoot, 'css-analysis.json');
    fs.writeFileSync(outputPath, JSON.stringify(analysis, null, 2));
    console.log(`\n📋 Detailed analysis saved to: ${outputPath}`);
  } catch (error) {
    console.error('❌ Error during CSS analysis:', error);
    process.exit(1);
  }
}

main();
