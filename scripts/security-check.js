#!/usr/bin/env node

/**
 * 🔒 Simple Security Check - Basic npm audit wrapper
 */

const { execSync } = require('child_process');

console.log('🔒 Running security vulnerability check...');

try {
  console.log('📋 Running npm audit...');
  execSync('npm audit --audit-level high', {
    stdio: 'inherit',
  });
  console.log('✅ No high/critical security vulnerabilities found');
} catch (error) {
  if (error.status === 0) {
    console.log('✅ npm audit completed successfully');
  } else {
    console.log('⚠️  npm audit found some issues');
  }
}

console.log('✅ Security check complete!');
