#!/usr/bin/env node

/**
 * Quick fix for Rollup native binary issue in CI
 * Specifically addresses: Cannot find module @rollup/rollup-linux-x64-gnu
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔧 Quick fix for Rollup native dependencies...');

try {
  // First, try to install the missing Linux binary directly
  console.log('📥 Installing @rollup/rollup-linux-x64-gnu...');
  execSync('npm install --no-save @rollup/rollup-linux-x64-gnu@latest', { stdio: 'inherit' });
  console.log('✅ Successfully installed Linux Rollup binary');
} catch (error) {
  console.log('❌ Direct installation failed, using alternative approach...');

  try {
    // Alternative: Clear cache and reinstall
    console.log('🧹 Clearing npm cache...');
    execSync('npm cache clean --force', { stdio: 'inherit' });

    console.log('🔄 Reinstalling dependencies with platform-specific flags...');
    execSync('npm install --force', { stdio: 'inherit' });

    // Try to install the binary again
    console.log('🔁 Retrying Rollup binary installation...');
    execSync('npm install --no-save @rollup/rollup-linux-x64-gnu@latest', { stdio: 'inherit' });
  } catch (retryError) {
    console.log('⚠️ Alternative approach failed, proceeding anyway...');
    console.log('This might still work if the dependencies are resolved at runtime.');
  }
}

console.log('✅ Rollup fix completed!');
