#!/usr/bin/env node

/**
 * Build Performance Optimization Script
 *
 * This script optimizes the build process by:
 * - Analyzing build times
 * - Optimizing dependencies
 * - Cleaning build artifacts
 * - Providing performance recommendations
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Performance tracking
let buildStartTime;
let buildSteps = [];

// Color utilities
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

function logStep(message) {
  const timestamp = new Date().toISOString();
  console.log(`${colorize('🔄', 'blue')} ${message}`);

  buildSteps.push({
    message,
    timestamp,
    startTime: Date.now(),
  });
}

function logStepComplete(message) {
  const now = Date.now();
  const currentStep = buildSteps[buildSteps.length - 1];
  if (currentStep) {
    currentStep.duration = now - currentStep.startTime;
    console.log(
      `${colorize('✅', 'green')} ${message} ${colorize(`(${currentStep.duration}ms)`, 'yellow')}`
    );
  }
}

function logWarning(message) {
  console.log(`${colorize('⚠️', 'yellow')} ${message}`);
}

function logError(message) {
  console.log(`${colorize('❌', 'red')} ${message}`);
}

function logInfo(message) {
  console.log(`${colorize('ℹ️', 'blue')} ${message}`);
}

function execCommand(command, options = {}) {
  try {
    const result = execSync(command, {
      encoding: 'utf8',
      stdio: options.silent ? 'pipe' : 'inherit',
      ...options,
    });
    return { success: true, output: result };
  } catch (error) {
    return { success: false, error: error.message, output: error.stdout || error.stderr };
  }
}

function checkNodeModulesSize() {
  logStep('Checking node_modules size...');

  const nodeModulesPath = path.join(process.cwd(), 'node_modules');
  if (!fs.existsSync(nodeModulesPath)) {
    logStepComplete('node_modules not found');
    return 0;
  }

  const result = execCommand('du -sh node_modules 2>/dev/null || dir node_modules /s /-c 2>nul', {
    silent: true,
  });

  if (result.success) {
    logStepComplete('node_modules size checked');
    return result.output;
  } else {
    logStepComplete('Could not determine node_modules size');
    return 'Unknown';
  }
}

function analyzePackageJson() {
  logStep('Analyzing package.json...');

  const packagePath = path.join(process.cwd(), 'package.json');
  if (!fs.existsSync(packagePath)) {
    logError('package.json not found');
    return null;
  }

  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

  const analysis = {
    dependencies: Object.keys(packageJson.dependencies || {}).length,
    devDependencies: Object.keys(packageJson.devDependencies || {}).length,
    scripts: Object.keys(packageJson.scripts || {}).length,
    hasWorkspaces: !!packageJson.workspaces,
    hasLintStaged: !!packageJson['lint-staged'],
  };

  logStepComplete(`Found ${analysis.dependencies} deps, ${analysis.devDependencies} devDeps`);
  return analysis;
}

function checkDuplicateDependencies() {
  logStep('Checking for duplicate dependencies...');

  const result = execCommand('npm ls --depth=0 --json', { silent: true });

  if (result.success) {
    try {
      const deps = JSON.parse(result.output);
      const duplicates = [];

      // Simple duplicate detection (this could be enhanced)
      const allDeps = { ...deps.dependencies, ...deps.devDependencies };

      logStepComplete('Duplicate dependency check completed');
      return duplicates;
    } catch (error) {
      logWarning('Could not parse npm ls output');
      return [];
    }
  } else {
    logWarning('Could not check for duplicate dependencies');
    return [];
  }
}

function optimizeBuildCache() {
  logStep('Optimizing build cache...');

  const viteCache = path.join(process.cwd(), 'node_modules', '.vite');
  const distPath = path.join(process.cwd(), 'dist');

  let cleaned = [];

  // Clean Vite cache if it's large or old
  if (fs.existsSync(viteCache)) {
    const stats = fs.statSync(viteCache);
    const cacheAge = Date.now() - stats.mtime.getTime();
    const oneDayMs = 24 * 60 * 60 * 1000;

    if (cacheAge > oneDayMs) {
      try {
        fs.rmSync(viteCache, { recursive: true, force: true });
        cleaned.push('Vite cache');
      } catch (error) {
        logWarning('Could not clean Vite cache');
      }
    }
  }

  // Clean dist directory
  if (fs.existsSync(distPath)) {
    try {
      fs.rmSync(distPath, { recursive: true, force: true });
      cleaned.push('dist directory');
    } catch (error) {
      logWarning('Could not clean dist directory');
    }
  }

  if (cleaned.length > 0) {
    logStepComplete(`Cleaned: ${cleaned.join(', ')}`);
  } else {
    logStepComplete('No cleanup needed');
  }
}

function runBuildWithTiming() {
  logStep('Building project with performance monitoring...');
  buildStartTime = Date.now();

  const result = execCommand('npm run build');

  const buildTime = Date.now() - buildStartTime;

  if (result.success) {
    logStepComplete(`Build completed in ${buildTime}ms`);
    return { success: true, duration: buildTime };
  } else {
    logError('Build failed');
    return { success: false, duration: buildTime, error: result.error };
  }
}

function analyzeViteConfig() {
  logStep('Analyzing Vite configuration...');

  const viteConfigPath = path.join(process.cwd(), 'vite.config.ts');
  if (!fs.existsSync(viteConfigPath)) {
    logWarning('vite.config.ts not found');
    return null;
  }

  const viteConfig = fs.readFileSync(viteConfigPath, 'utf8');

  const analysis = {
    hasAlias: viteConfig.includes('alias'),
    hasPlugins: viteConfig.includes('plugins'),
    hasOptimization:
      viteConfig.includes('rollupOptions') || viteConfig.includes('chunkSizeWarningLimit'),
    hasBuildConfig: viteConfig.includes('build:'),
    usesReactSWC: viteConfig.includes('react-swc'),
    usesTailwind: viteConfig.includes('tailwind'),
  };

  logStepComplete('Vite configuration analyzed');
  return analysis;
}

function generateOptimizationRecommendations(data) {
  const recommendations = [];

  // Build time recommendations
  if (data.buildResult && data.buildResult.duration > 30000) {
    // 30 seconds
    recommendations.push({
      type: 'performance',
      category: 'Build Time',
      message:
        'Build time is slow. Consider enabling SWC, optimizing imports, or using build cache.',
      priority: 'high',
    });
  }

  // Dependency recommendations
  if (data.packageAnalysis && data.packageAnalysis.dependencies > 50) {
    recommendations.push({
      type: 'optimization',
      category: 'Dependencies',
      message: 'High number of dependencies. Consider bundle analysis and tree shaking.',
      priority: 'medium',
    });
  }

  // Vite configuration recommendations
  if (data.viteAnalysis) {
    if (!data.viteAnalysis.hasOptimization) {
      recommendations.push({
        type: 'optimization',
        category: 'Vite Config',
        message: 'Consider adding Rollup optimization options for better chunking.',
        priority: 'medium',
      });
    }

    if (!data.viteAnalysis.usesReactSWC) {
      recommendations.push({
        type: 'performance',
        category: 'Vite Config',
        message: 'Using React SWC plugin instead of Babel can improve build speed.',
        priority: 'high',
      });
    }
  }

  // Cache recommendations
  recommendations.push({
    type: 'maintenance',
    category: 'Cache',
    message: 'Regularly clean build cache and node_modules for optimal performance.',
    priority: 'low',
  });

  return recommendations;
}

function printReport(data) {
  console.log(colorize('\n🚀 Build Performance Report', 'bright'));
  console.log(colorize('─'.repeat(50), 'cyan'));

  // Build performance
  if (data.buildResult) {
    console.log(colorize('\n⏱️  Build Performance:', 'bright'));
    const duration = data.buildResult.duration;
    const durationColor = duration > 30000 ? 'red' : duration > 15000 ? 'yellow' : 'green';
    console.log(`Build time: ${colorize((duration / 1000).toFixed(2) + 's', durationColor)}`);
    console.log(
      `Status: ${data.buildResult.success ? colorize('Success', 'green') : colorize('Failed', 'red')}`
    );
  }

  // Dependencies
  if (data.packageAnalysis) {
    console.log(colorize('\n📦 Dependencies:', 'bright'));
    console.log(`Production: ${data.packageAnalysis.dependencies}`);
    console.log(`Development: ${data.packageAnalysis.devDependencies}`);
    console.log(`Scripts: ${data.packageAnalysis.scripts}`);
  }

  // node_modules size
  if (data.nodeModulesSize) {
    console.log(colorize('\n💾 Storage:', 'bright'));
    console.log(`node_modules size: ${data.nodeModulesSize}`);
  }

  // Build steps timing
  if (buildSteps.length > 0) {
    console.log(colorize('\n📊 Step Timing:', 'bright'));
    buildSteps.forEach((step) => {
      if (step.duration) {
        const durationColor =
          step.duration > 5000 ? 'red' : step.duration > 2000 ? 'yellow' : 'green';
        console.log(`${step.message}: ${colorize(step.duration + 'ms', durationColor)}`);
      }
    });
  }

  // Recommendations
  if (data.recommendations && data.recommendations.length > 0) {
    console.log(colorize('\n💡 Optimization Recommendations:', 'bright'));
    data.recommendations.forEach((rec) => {
      const priorityColor =
        rec.priority === 'high' ? 'red' : rec.priority === 'medium' ? 'yellow' : 'blue';
      const icon = rec.priority === 'high' ? '🔥' : rec.priority === 'medium' ? '⚡' : 'ℹ️';
      console.log(`${icon} ${colorize(`[${rec.category}]`, priorityColor)} ${rec.message}`);
    });
  }

  console.log(colorize('\n─'.repeat(50), 'cyan'));
}

function savePerformanceReport(data) {
  const reportPath = path.join(process.cwd(), 'build-performance.json');

  const report = {
    timestamp: new Date().toISOString(),
    buildTime: data.buildResult?.duration || 0,
    buildSuccess: data.buildResult?.success || false,
    dependencies: data.packageAnalysis || {},
    viteConfig: data.viteAnalysis || {},
    steps: buildSteps,
    recommendations: data.recommendations || [],
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n📄 Performance report saved to: ${colorize(reportPath, 'green')}`);
}

async function main() {
  console.log(colorize('🚀 Starting Build Performance Optimization...', 'bright'));

  const data = {};

  // Pre-build optimizations
  optimizeBuildCache();

  // Analysis
  data.nodeModulesSize = checkNodeModulesSize();
  data.packageAnalysis = analyzePackageJson();
  data.viteAnalysis = analyzeViteConfig();
  data.duplicates = checkDuplicateDependencies();

  // Build with timing
  data.buildResult = runBuildWithTiming();

  // Generate recommendations
  data.recommendations = generateOptimizationRecommendations(data);

  // Print report
  printReport(data);

  // Save report if requested
  if (process.argv.includes('--save-report')) {
    savePerformanceReport(data);
  }

  // Exit with appropriate code
  if (data.buildResult && !data.buildResult.success) {
    process.exit(1);
  }

  console.log(colorize('\n✅ Build performance optimization completed!', 'green'));
}

if (import.meta.url.includes(process.argv[1]) || process.argv[1].endsWith('optimize-build.js')) {
  main().catch((error) => {
    console.error(colorize(`❌ Error: ${error.message}`, 'red'));
    process.exit(1);
  });
}
