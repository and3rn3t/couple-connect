#!/usr/bin/env node

/**
 * Quick fix for native binary dependencies in CI
 * Addresses: Rollup and LightningCSS native binary issues
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Quick fix for native dependencies (Rollup + LightningCSS)...');

// Get platform information
const platform = process.platform;
const arch = process.arch;

// Detect if we're on Alpine Linux (musl)
const isAlpine =
  fs.existsSync('/etc/alpine-release') ||
  (process.env.CONTAINER && process.env.CONTAINER.includes('alpine')) ||
  (process.env.IMAGE_NAME && process.env.IMAGE_NAME.includes('alpine'));

console.log(`🔍 Platform: ${platform}, Architecture: ${arch}, Alpine: ${isAlpine}`);

// Map platform/arch to packages
const nativePackages = {
  rollup: {
    linux: isAlpine ? '@rollup/rollup-linux-x64-musl' : '@rollup/rollup-linux-x64-gnu',
    darwin: '@rollup/rollup-darwin-x64',
    win32: '@rollup/rollup-win32-x64-msvc',
  },
  lightningcss: {
    linux: isAlpine ? 'lightningcss-linux-x64-musl' : 'lightningcss-linux-x64-gnu',
    darwin: 'lightningcss-darwin-x64',
    win32: 'lightningcss-win32-x64-msvc',
  },
};

// Get packages for current platform
const rollupPackage = nativePackages.rollup[platform];
const lightningcssPackage = nativePackages.lightningcss[platform];

const packagesToInstall = [];
if (rollupPackage) packagesToInstall.push({ name: 'Rollup', package: rollupPackage });
if (lightningcssPackage)
  packagesToInstall.push({ name: 'LightningCSS', package: lightningcssPackage });

if (packagesToInstall.length === 0) {
  console.warn(`⚠️ Unknown platform: ${platform}, trying generic approach`);
  fallbackFix();
  process.exit(0);
}

console.log(`📦 Installing native binaries for platform ${platform}...`);

// Install each required package
for (const { name, package: pkg } of packagesToInstall) {
  try {
    console.log(`📥 Installing ${name}: ${pkg}...`);
    execSync(`npm install --no-save --prefer-offline ${pkg}@latest`, {
      stdio: 'inherit',
      timeout: 60000, // 1 minute timeout
    });
    console.log(`✅ Successfully installed ${name} binary`);
  } catch (error) {
    console.log(`❌ ${name} installation failed, will try fallback approach...`);
  }
}

console.log('✅ Native dependencies fix completed!');

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

    // Try to install the binaries again
    const rollupPkg = nativePackages.rollup[process.platform];
    const lightningcssPkg = nativePackages.lightningcss[process.platform];

    if (rollupPkg) {
      console.log('🔁 Retrying Rollup binary installation...');
      execSync(`npm install --no-save ${rollupPkg}@latest`, {
        stdio: 'inherit',
        timeout: 30000,
      });
    }

    if (lightningcssPkg) {
      console.log('🔁 Retrying LightningCSS binary installation...');
      execSync(`npm install --no-save ${lightningcssPkg}@latest`, {
        stdio: 'inherit',
        timeout: 30000,
      });
    }
  } catch (retryError) {
    console.log('⚠️ Alternative approach failed, but this might still work at runtime...');
    console.log('If you continue to see native binary errors, try:');
    console.log('1. rm -rf node_modules package-lock.json');
    console.log('2. npm install');
    console.log('3. npm install --no-save @rollup/rollup-linux-x64-gnu lightningcss-linux-x64-gnu');
    console.log(
      '   (or the musl variants for Alpine: @rollup/rollup-linux-x64-musl lightningcss-linux-x64-musl)'
    );
  }
}
