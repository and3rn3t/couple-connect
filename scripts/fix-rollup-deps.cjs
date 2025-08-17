#!/usr/bin/env node

/**
 * Fix for Rollup native dependencies issue in CI environments
 * Cross-platform Node.js version
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Checking Rollup native dependencies...');

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

// Map platform/arch to Rollup package
const rollupPackages = {
  'linux-x64': '@rollup/rollup-linux-x64-gnu',
  'linux-x64-musl': '@rollup/rollup-linux-x64-musl',
  'linux-arm64': '@rollup/rollup-linux-arm64-gnu',
  'linux-arm64-musl': '@rollup/rollup-linux-arm64-musl',
  'darwin-x64': '@rollup/rollup-darwin-x64',
  'darwin-arm64': '@rollup/rollup-darwin-arm64',
  'win32-x64': '@rollup/rollup-win32-x64-msvc',
};

const rollupPackage = rollupPackages[platformArch];

if (!rollupPackage) {
  console.warn(`⚠️ Unknown platform: ${platformArch}, trying generic approach`);
  cleanAndReinstall();
  process.exit(0);
}

console.log(`📦 Installing ${rollupPackage} for platform ${platformArch}`);

try {
  // Check if package is already installed
  try {
    execSync(`npm list ${rollupPackage}`, { stdio: 'pipe' });
    console.log(`✅ ${rollupPackage} is already installed`);
    process.exit(0);
  } catch {
    // Package not installed, continue with installation
  }

  // Install the specific Rollup package
  console.log(`📥 Installing ${rollupPackage}...`);
  execSync(`npm install --no-save --silent ${rollupPackage}@latest`, { stdio: 'inherit' });
  console.log(`✅ Successfully installed ${rollupPackage}`);
} catch (error) {
  console.error(`❌ Failed to install ${rollupPackage}:`, error.message);
  console.log('🔄 Trying alternative approach...');
  cleanAndReinstall();
}

console.log('✅ Rollup dependencies check completed!');

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
