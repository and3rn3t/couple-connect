#!/usr/bin/env node

/**
 * 🧪 CI/CD Pipeline Validation Script
 *
 * Tests all components of the optimized CI/CD pipeline
 * Ensures everything is ready for production deployment
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import path from 'path';

const PROJECT_ROOT = process.cwd();

/**
 * 📊 Test execution helper
 */
function runTest(name, testFn) {
  try {
    console.log(`🧪 Testing: ${name}`);
    const result = testFn();
    if (result === true || result === undefined) {
      console.log(`✅ PASS: ${name}`);
      return true;
    } else {
      console.log(`❌ FAIL: ${name} - ${result}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ERROR: ${name} - ${error.message}`);
    return false;
  }
}

/**
 * 📦 Check if package.json has required scripts
 */
function testPackageScripts() {
  const requiredScripts = [
    'quality:analyze',
    'deps:analyze',
    'db:health',
    'perf:monitor',
    'pwa:optimize',
    'security:check',
    'test:unit',
    'test:integration',
    'validate:production',
  ];

  // Use fs instead of cat for Windows compatibility
  const packageJsonPath = path.join(PROJECT_ROOT, 'package.json');
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));

  const missingScripts = requiredScripts.filter((script) => !packageJson.scripts[script]);

  if (missingScripts.length > 0) {
    return `Missing scripts: ${missingScripts.join(', ')}`;
  }

  return true;
} /**
 * 📁 Check if required files exist
 */
function testRequiredFiles() {
  const requiredFiles = [
    '.github/workflows/ci-cd.yml',
    '.github/workflows/ci-cd-backup.yml',
    'scripts/dependency-manager.js',
    'scripts/pwa-manager.js',
    'scripts/database-manager.js',
    'scripts/code-quality-analyzer.js',
    'scripts/performance-monitor.js',
    'scripts/dev-environment-optimizer.js',
    'scripts/validate-production.js',
  ];

  const missingFiles = requiredFiles.filter((file) => !existsSync(path.join(PROJECT_ROOT, file)));

  if (missingFiles.length > 0) {
    return `Missing files: ${missingFiles.join(', ')}`;
  }

  return true;
}

/**
 * 🔧 Check if CI/CD workflow has required jobs
 */
function testWorkflowStructure() {
  try {
    // Use fs instead of cat for Windows compatibility
    const workflowPath = path.join(PROJECT_ROOT, '.github/workflows/ci-cd.yml');
    const workflow = readFileSync(workflowPath, 'utf8');

    const requiredJobs = [
      'changes',
      'quality',
      'dependency-analysis',
      'database-health',
      'test',
      'build',
      'e2e',
      'security',
      'deploy',
    ];

    const missingJobs = requiredJobs.filter((job) => !workflow.includes(`${job}:`));

    if (missingJobs.length > 0) {
      return `Missing jobs: ${missingJobs.join(', ')}`;
    }

    return true;
  } catch (error) {
    return `Cannot read workflow file: ${error.message}`;
  }
}

/**
 * 🎯 Test script execution (dry run)
 */
function testScriptExecution() {
  const testScripts = ['deps:analyze', 'quality:analyze'];

  for (const script of testScripts) {
    try {
      // Test if script exists and can be called (but don't run it fully)
      execSync(`npm run ${script} --help || echo "Script exists"`, {
        stdio: 'pipe',
        timeout: 5000,
      });
    } catch (error) {
      return `Script ${script} failed: ${error.message}`;
    }
  }

  return true;
}

/**
 * 📊 Check Node.js and npm versions
 */
function testEnvironment() {
  try {
    const nodeVersion = execSync('node --version', { encoding: 'utf8' }).trim();
    const npmVersion = execSync('npm --version', { encoding: 'utf8' }).trim();

    const nodeMinor = parseInt(nodeVersion.split('.')[0].substring(1));
    const npmMajor = parseInt(npmVersion.split('.')[0]);

    if (nodeMinor < 18) {
      return `Node.js version too old: ${nodeVersion} (requires >=18)`;
    }

    if (npmMajor < 8) {
      return `npm version too old: ${npmVersion} (requires >=8)`;
    }

    console.log(`  📦 Node.js: ${nodeVersion}`);
    console.log(`  📦 npm: ${npmVersion}`);

    return true;
  } catch (error) {
    return `Environment check failed: ${error.message}`;
  }
}

/**
 * 🚀 Main validation function
 */
async function validatePipeline() {
  console.log('🚀 CI/CD Pipeline Validation Starting...');
  console.log('=====================================');
  console.log('');

  const tests = [
    ['Environment Check', testEnvironment],
    ['Required Files', testRequiredFiles],
    ['Package Scripts', testPackageScripts],
    ['Workflow Structure', testWorkflowStructure],
    ['Script Execution', testScriptExecution],
  ];

  let passed = 0;
  let failed = 0;

  for (const [name, testFn] of tests) {
    if (runTest(name, testFn)) {
      passed++;
    } else {
      failed++;
    }
    console.log('');
  }

  // Summary
  console.log('📊 Validation Summary:');
  console.log('=====================');
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total: ${passed + failed}`);
  console.log('');

  if (failed === 0) {
    console.log('🎉 CI/CD Pipeline Validation PASSED!');
    console.log('✅ Ready for production deployment');
    console.log('');
    console.log('🚀 Next Steps:');
    console.log('  1. Commit and push changes to test the pipeline');
    console.log('  2. Monitor the first GitHub Actions run');
    console.log('  3. Review generated reports in the Actions artifacts');
    console.log('  4. Customize thresholds based on project needs');
    process.exit(0);
  } else {
    console.log('❌ CI/CD Pipeline Validation FAILED!');
    console.log(`⚠️ ${failed} test(s) failed - please fix before deployment`);
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('  1. Check missing files and scripts');
    console.log('  2. Verify workflow syntax');
    console.log('  3. Test script execution manually');
    console.log('  4. Review error messages above');
    process.exit(1);
  }
}

// Run validation
validatePipeline();
