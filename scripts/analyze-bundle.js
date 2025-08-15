#!/usr/bin/env node

/**
 * Bundle Analysis Script for Couple Connect
 *
 * This script analyzes the build output and provides detailed information about:
 * - Bundle sizes and file distribution
 * - Chunk analysis
 * - Asset optimization recommendations
 * - Performance metrics
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DIST_PATH = path.join(process.cwd(), 'dist');
const ASSETS_PATH = path.join(DIST_PATH, 'assets');

// Color output utilities
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function analyzeFile(filePath) {
  const stats = fs.statSync(filePath);
  const fileName = path.basename(filePath);
  const extension = path.extname(filePath);

  return {
    name: fileName,
    path: filePath,
    size: stats.size,
    extension,
    isChunk: fileName.includes('-') && (extension === '.js' || extension === '.css'),
    isAsset:
      !fileName.includes('.') ||
      ['png', 'jpg', 'jpeg', 'svg', 'gif', 'ico', 'woff', 'woff2'].includes(extension.slice(1)),
  };
}

function analyzeDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    return [];
  }

  const files = [];
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      files.push(...analyzeDirectory(fullPath));
    } else {
      // Skip bundle analysis HTML files from the analysis
      if (!entry.name.includes('bundle-analysis.html')) {
        files.push(analyzeFile(fullPath));
      }
    }
  }

  return files;
}
function categorizeFiles(files) {
  const categories = {
    javascript: [],
    css: [],
    images: [],
    fonts: [],
    other: [],
  };

  files.forEach((file) => {
    const ext = file.extension.toLowerCase();

    if (ext === '.js' || ext === '.mjs') {
      categories.javascript.push(file);
    } else if (ext === '.css') {
      categories.css.push(file);
    } else if (['.png', '.jpg', '.jpeg', '.svg', '.gif', '.ico', '.webp'].includes(ext)) {
      categories.images.push(file);
    } else if (['.woff', '.woff2', '.ttf', '.eot'].includes(ext)) {
      categories.fonts.push(file);
    } else {
      categories.other.push(file);
    }
  });

  return categories;
}

function analyzeChunks(jsFiles) {
  const chunks = {
    vendor: [],
    main: [],
    dynamic: [],
  };

  jsFiles.forEach((file) => {
    const name = file.name.toLowerCase();

    if (name.includes('vendor') || name.includes('node_modules')) {
      chunks.vendor.push(file);
    } else if (name.includes('index') || name.includes('main')) {
      chunks.main.push(file);
    } else {
      chunks.dynamic.push(file);
    }
  });

  return chunks;
}

function generateRecommendations(analysis) {
  const recommendations = [];
  const { categories, totals, chunks } = analysis;

  // Check total bundle size
  if (totals.total > 2 * 1024 * 1024) {
    // 2MB
    recommendations.push({
      type: 'warning',
      category: 'Bundle Size',
      message: `Total bundle size (${formatBytes(totals.total)}) is large. Consider code splitting and lazy loading.`,
    });
  }

  // Check JavaScript size
  if (totals.javascript > 1 * 1024 * 1024) {
    // 1MB
    recommendations.push({
      type: 'warning',
      category: 'JavaScript',
      message: `JavaScript bundle (${formatBytes(totals.javascript)}) is large. Consider dynamic imports and tree shaking.`,
    });
  }

  // Check CSS size
  if (totals.css > 200 * 1024) {
    // 200KB
    recommendations.push({
      type: 'info',
      category: 'CSS',
      message: `CSS bundle (${formatBytes(totals.css)}) could be optimized. Consider purging unused styles.`,
    });
  }

  // Check vendor chunks
  const vendorSize = chunks.vendor.reduce((sum, file) => sum + file.size, 0);
  if (vendorSize > 500 * 1024) {
    // 500KB
    recommendations.push({
      type: 'info',
      category: 'Vendor',
      message: `Vendor bundle (${formatBytes(vendorSize)}) is large. Consider splitting vendors or using CDN.`,
    });
  }

  // Check number of chunks
  const totalChunks = categories.javascript.length + categories.css.length;
  if (totalChunks > 20) {
    recommendations.push({
      type: 'warning',
      category: 'Chunks',
      message: `High number of chunks (${totalChunks}). This might impact HTTP/2 multiplexing benefits.`,
    });
  }

  // Check image optimization
  const largeImages = categories.images.filter((img) => img.size > 100 * 1024); // 100KB
  if (largeImages.length > 0) {
    recommendations.push({
      type: 'info',
      category: 'Images',
      message: `${largeImages.length} large images found. Consider WebP format and compression.`,
    });
  }

  return recommendations;
}

function printAnalysis(analysis) {
  const { files, categories, totals, chunks, recommendations } = analysis;

  console.log(colorize('\n📊 Bundle Analysis Report', 'bright'));
  console.log(colorize('─'.repeat(50), 'cyan'));

  // Summary
  console.log(colorize('\n📋 Summary:', 'bright'));
  console.log(`Total files: ${files.length}`);
  console.log(`Total size: ${colorize(formatBytes(totals.total), 'green')}`);

  // Size breakdown by category
  console.log(colorize('\n📦 Size Breakdown:', 'bright'));
  console.log(
    `JavaScript: ${colorize(formatBytes(totals.javascript), 'yellow')} (${((totals.javascript / totals.total) * 100).toFixed(1)}%)`
  );
  console.log(
    `CSS: ${colorize(formatBytes(totals.css), 'blue')} (${((totals.css / totals.total) * 100).toFixed(1)}%)`
  );
  console.log(
    `Images: ${colorize(formatBytes(totals.images), 'magenta')} (${((totals.images / totals.total) * 100).toFixed(1)}%)`
  );
  console.log(
    `Fonts: ${colorize(formatBytes(totals.fonts), 'cyan')} (${((totals.fonts / totals.total) * 100).toFixed(1)}%)`
  );
  console.log(
    `Other: ${colorize(formatBytes(totals.other), 'reset')} (${((totals.other / totals.total) * 100).toFixed(1)}%)`
  );

  // Largest files
  console.log(colorize('\n🔍 Largest Files:', 'bright'));
  const largestFiles = files.sort((a, b) => b.size - a.size).slice(0, 10);

  largestFiles.forEach((file, index) => {
    const sizeColor = file.size > 500 * 1024 ? 'red' : file.size > 200 * 1024 ? 'yellow' : 'green';
    console.log(`${index + 1}. ${file.name} - ${colorize(formatBytes(file.size), sizeColor)}`);
  });

  // Chunk analysis
  console.log(colorize('\n🧩 Chunk Analysis:', 'bright'));
  console.log(
    `Vendor chunks: ${chunks.vendor.length} (${formatBytes(chunks.vendor.reduce((sum, f) => sum + f.size, 0))})`
  );
  console.log(
    `Main chunks: ${chunks.main.length} (${formatBytes(chunks.main.reduce((sum, f) => sum + f.size, 0))})`
  );
  console.log(
    `Dynamic chunks: ${chunks.dynamic.length} (${formatBytes(chunks.dynamic.reduce((sum, f) => sum + f.size, 0))})`
  );

  // Recommendations
  if (recommendations.length > 0) {
    console.log(colorize('\n💡 Recommendations:', 'bright'));
    recommendations.forEach((rec) => {
      const icon = rec.type === 'warning' ? '⚠️' : 'ℹ️';
      const color = rec.type === 'warning' ? 'yellow' : 'blue';
      console.log(`${icon} ${colorize(`[${rec.category}]`, color)} ${rec.message}`);
    });
  }

  console.log(colorize('\n─'.repeat(50), 'cyan'));
}

function generateJSONReport(analysis) {
  const reportPath = path.join(process.cwd(), 'bundle-analysis.json');

  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalFiles: analysis.files.length,
      totalSize: analysis.totals.total,
      categories: {
        javascript: {
          count: analysis.categories.javascript.length,
          size: analysis.totals.javascript,
        },
        css: { count: analysis.categories.css.length, size: analysis.totals.css },
        images: { count: analysis.categories.images.length, size: analysis.totals.images },
        fonts: { count: analysis.categories.fonts.length, size: analysis.totals.fonts },
        other: { count: analysis.categories.other.length, size: analysis.totals.other },
      },
    },
    files: analysis.files.map((file) => ({
      name: file.name,
      size: file.size,
      category: file.extension,
      path: path.relative(process.cwd(), file.path),
    })),
    recommendations: analysis.recommendations,
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 JSON report saved to: ${colorize(reportPath, 'green')}`);
}

function main() {
  console.log(colorize('🔍 Starting Bundle Analysis...', 'bright'));

  if (!fs.existsSync(DIST_PATH)) {
    console.error(
      colorize('❌ Build directory not found. Please run "npm run build" first.', 'red')
    );
    process.exit(1);
  }

  // Analyze all files in dist directory
  const files = analyzeDirectory(DIST_PATH);
  const categories = categorizeFiles(files);

  // Calculate totals
  const totals = {
    total: files.reduce((sum, file) => sum + file.size, 0),
    javascript: categories.javascript.reduce((sum, file) => sum + file.size, 0),
    css: categories.css.reduce((sum, file) => sum + file.size, 0),
    images: categories.images.reduce((sum, file) => sum + file.size, 0),
    fonts: categories.fonts.reduce((sum, file) => sum + file.size, 0),
    other: categories.other.reduce((sum, file) => sum + file.size, 0),
  };

  // Analyze chunks
  const chunks = analyzeChunks(categories.javascript);

  // Generate recommendations
  const recommendations = generateRecommendations({ categories, totals, chunks });

  const analysis = {
    files,
    categories,
    totals,
    chunks,
    recommendations,
  };

  // Print analysis
  printAnalysis(analysis);

  // Generate JSON report if requested
  if (process.argv.includes('--json')) {
    generateJSONReport(analysis);
  }

  // Exit with warning if bundle is too large
  if (totals.total > 3 * 1024 * 1024) {
    // 3MB
    console.log(colorize('\n⚠️  Bundle size exceeds recommended limit!', 'yellow'));
    process.exit(1);
  }

  console.log(colorize('\n✅ Bundle analysis completed successfully!', 'green'));
}

// ES Module entry point detection
if (import.meta.url.includes(process.argv[1]) || process.argv[1].endsWith('analyze-bundle.js')) {
  main();
}

export { analyzeDirectory, categorizeFiles, generateRecommendations };
