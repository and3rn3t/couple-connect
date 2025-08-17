#!/usr/bin/env node

/**
 * Quick fix for Rollup native binary issue in CI
 * Specifically addresses: Cannot find module @rollup/rollup-linux-x64-gnu
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Quick fix for Rollup native dependencies...');

// Get platform information
const platform = process.platform;
const arch = process.arch;

// Detect if we're on Alpine Linux (musl)
const isAlpine =
  fs.existsSync('/etc/alpine-release') ||
  (process.env.CONTAINER && process.env.CONTAINER.includes('alpine')) ||
  (process.env.IMAGE_NAME && process.env.IMAGE_NAME.includes('alpine'));

console.log(`🔍 Platform: ${platform}, Architecture: ${arch}, Alpine: ${isAlpine}`);

// Map platform/arch to Rollup package
const rollupPackages = {
  linux: isAlpine ? '@rollup/rollup-linux-x64-musl' : '@rollup/rollup-linux-x64-gnu',
  darwin: '@rollup/rollup-darwin-x64',
  win32: '@rollup/rollup-win32-x64-msvc',
};

const rollupPackage = rollupPackages[platform];

if (!rollupPackage) {
  console.warn(`⚠️ Unknown platform: ${platform}, trying generic approach`);
  fallbackFix();
  process.exit(0);
}

console.log(`📦 Installing ${rollupPackage} for platform ${platform}`);

try {
  // First, try to install the missing binary directly
  console.log(`📥 Installing ${rollupPackage}...`);
  execSync(`npm install --no-save --prefer-offline ${rollupPackage}@latest`, {
    stdio: 'inherit',
    timeout: 60000, // 1 minute timeout
  });
  console.log('✅ Successfully installed Rollup binary');
} catch (error) {
  console.log('❌ Direct installation failed, using alternative approach...');
  fallbackFix();
}

console.log('✅ Rollup fix completed!');

function fallbackFix() {
  try {
    // Alternative: Clear cache and reinstall with better flags
    console.log('🧹 Clearing npm cache...');
    execSync('npm cache clean --force', { stdio: 'inherit' });

    // For CI environments, sometimes we need to remove package-lock and reinstall
    if (process.env.CI) {
      console.log('🔄 CI environment detected - full dependency refresh...');

      // Remove package-lock if it exists
      if (fs.existsSync('package-lock.json')) {
        fs.unlinkSync('package-lock.json');
        console.log('🗑️ Removed package-lock.json');
      }

      // Remove node_modules if it exists
      if (fs.existsSync('node_modules')) {
        fs.rmSync('node_modules', { recursive: true, force: true });
        console.log('🗑️ Removed node_modules');
      }

      console.log('📦 Fresh npm install...');
      execSync('npm install', { stdio: 'inherit' });
    } else {
      console.log('🔄 Reinstalling dependencies with platform-specific flags...');
      execSync('npm install --force', { stdio: 'inherit' });
    }

    // Try to install the binary again
    if (rollupPackages[process.platform]) {
      console.log('🔁 Retrying Rollup binary installation...');
      execSync(`npm install --no-save ${rollupPackages[process.platform]}@latest`, {
        stdio: 'inherit',
        timeout: 30000,
      });
    }
  } catch (retryError) {
    console.log('⚠️ Alternative approach failed, but this might still work at runtime...');
    console.log('If you continue to see Rollup errors, try:');
    console.log('1. rm -rf node_modules package-lock.json');
    console.log('2. npm install');
    console.log('3. npm install --no-save @rollup/rollup-linux-x64-gnu');
  }
}
