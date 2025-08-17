#!/usr/bin/env node

/**
 * Fix for native dependencies issue in CI environments
 * Handles: Rollup and LightningCSS native binaries
 * Cross-platform Node.js version
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Checking native dependencies (Rollup + LightningCSS)...');

// Get platform information
const platform = process.platform;
const arch = process.arch;

// Detect if we're on Alpine Linux (musl)
const isAlpine =
  fs.existsSync('/etc/alpine-release') ||
  (process.env.CONTAINER && process.env.CONTAINER.includes('alpine')) ||
  (process.env.IMAGE_NAME && process.env.IMAGE_NAME.includes('alpine'));

const platformArch =
  platform === 'linux' && isAlpine ? `${platform}-${arch}-musl` : `${platform}-${arch}`;

console.log(`🔍 Detected platform: ${platform}, architecture: ${arch}, Alpine: ${isAlpine}`);

// Map platform/arch to native packages
const nativePackages = {
  rollup: {
    'linux-x64': '@rollup/rollup-linux-x64-gnu',
    'linux-x64-musl': '@rollup/rollup-linux-x64-musl',
    'linux-arm64': '@rollup/rollup-linux-arm64-gnu',
    'linux-arm64-musl': '@rollup/rollup-linux-arm64-musl',
    'darwin-x64': '@rollup/rollup-darwin-x64',
    'darwin-arm64': '@rollup/rollup-darwin-arm64',
    'win32-x64': '@rollup/rollup-win32-x64-msvc',
  },
  lightningcss: {
    'linux-x64': 'lightningcss-linux-x64-gnu',
    'linux-x64-musl': 'lightningcss-linux-x64-musl',
    'linux-arm64': 'lightningcss-linux-arm64-gnu',
    'linux-arm64-musl': 'lightningcss-linux-arm64-musl',
    'darwin-x64': 'lightningcss-darwin-x64',
    'darwin-arm64': 'lightningcss-darwin-arm64',
    'win32-x64': 'lightningcss-win32-x64-msvc',
  }
};

const rollupPackage = nativePackages.rollup[platformArch];
const lightningcssPackage = nativePackages.lightningcss[platformArch];

const packagesToInstall = [];
if (rollupPackage) packagesToInstall.push({ name: 'Rollup', package: rollupPackage });
if (lightningcssPackage) packagesToInstall.push({ name: 'LightningCSS', package: lightningcssPackage });

if (packagesToInstall.length === 0) {
  console.warn(`⚠️ Unknown platform: ${platformArch}, trying generic approach`);
  cleanAndReinstall();
  process.exit(0);
}

console.log(`📦 Installing native binaries for platform ${platformArch}...`);

// Check and install each package
for (const { name, package: pkg } of packagesToInstall) {
  try {
    // Check if package is already installed
    try {
      execSync(`npm list ${pkg}`, { stdio: 'pipe' });
      console.log(`✅ ${name} (${pkg}) is already installed`);
      continue;
    } catch {
      // Package not installed, continue with installation
    }

    // Install the specific package
    console.log(`📥 Installing ${name}: ${pkg}...`);
    execSync(`npm install --no-save --silent ${pkg}@latest`, { stdio: 'inherit' });
    console.log(`✅ Successfully installed ${name}`);
  } catch (error) {
    console.log(`❌ Failed to install ${name}, will try cleanup approach`);
    // Continue to next package or fallback
  }
}

console.log('✅ Native dependencies check completed!');

function cleanAndReinstall() {
  console.log('🧹 Clearing npm cache...');
  execSync('npm cache clean --force', { stdio: 'inherit' });

  console.log('🔄 Removing node_modules and package-lock.json...');

  // Remove node_modules
  if (fs.existsSync('node_modules')) {
    fs.rmSync('node_modules', { recursive: true, force: true });
  }

  // Remove package-lock.json
  if (fs.existsSync('package-lock.json')) {
    fs.unlinkSync('package-lock.json');
  }

  console.log('📦 Reinstalling all dependencies...');
  execSync('npm install', { stdio: 'inherit' });
}
