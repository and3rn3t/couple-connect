#!/usr/bin/env node

/**
 * 🔍 Production Validation Script
 *
 * Validates production deployment health and performance
 * Used by CI/CD pipeline for post-deployment validation
 */

import https from 'https';
import { performance } from 'perf_hooks';

const DEPLOYMENT_URL = process.env.DEPLOYMENT_URL || 'https://couple-connect.pages.dev';
const TIMEOUT = 30000; // 30 seconds
const EXPECTED_PERFORMANCE_THRESHOLD = 3000; // 3 seconds

/**
 * 🌐 Check if deployment is accessible
 */
async function checkAccessibility() {
  console.log('🌐 Checking deployment accessibility...');

  return new Promise((resolve, reject) => {
    const startTime = performance.now();

    const req = https.get(DEPLOYMENT_URL, { timeout: TIMEOUT }, (res) => {
      const endTime = performance.now();
      const responseTime = endTime - startTime;

      if (res.statusCode === 200) {
        console.log(`✅ Deployment accessible (${Math.round(responseTime)}ms)`);
        resolve({ success: true, responseTime });
      } else {
        console.log(`❌ Deployment returned status ${res.statusCode}`);
        reject(new Error(`HTTP ${res.statusCode}`));
      }
    });

    req.on('timeout', () => {
      req.destroy();
      console.log(`❌ Request timeout after ${TIMEOUT}ms`);
      reject(new Error('Request timeout'));
    });

    req.on('error', (err) => {
      console.log(`❌ Request failed: ${err.message}`);
      reject(err);
    });
  });
}

/**
 * 🔍 Check basic HTML structure
 */
async function checkHTMLStructure() {
  console.log('🔍 Checking HTML structure...');

  return new Promise((resolve, reject) => {
    https
      .get(DEPLOYMENT_URL, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          const checks = [
            { name: 'HTML doctype', test: () => data.includes('<!DOCTYPE html>') },
            { name: 'React root', test: () => data.includes('id="root"') },
            { name: 'Meta viewport', test: () => data.includes('viewport') },
            { name: 'Title tag', test: () => data.includes('<title>') },
          ];

          let passed = 0;
          let failed = 0;

          checks.forEach((check) => {
            if (check.test()) {
              console.log(`  ✅ ${check.name}`);
              passed++;
            } else {
              console.log(`  ❌ ${check.name}`);
              failed++;
            }
          });

          if (failed === 0) {
            console.log(`✅ HTML structure validation passed (${passed}/${checks.length})`);
            resolve({ success: true, passed, failed });
          } else {
            console.log(`❌ HTML structure validation failed (${passed}/${checks.length})`);
            reject(new Error(`HTML structure validation failed: ${failed} checks failed`));
          }
        });
      })
      .on('error', reject);
  });
}

/**
 * 📊 Performance validation
 */
async function checkPerformance(responseTime) {
  console.log('📊 Checking performance metrics...');

  const metrics = {
    responseTime,
    threshold: EXPECTED_PERFORMANCE_THRESHOLD,
    passed: responseTime < EXPECTED_PERFORMANCE_THRESHOLD,
  };

  if (metrics.passed) {
    console.log(
      `✅ Performance check passed (${Math.round(responseTime)}ms < ${EXPECTED_PERFORMANCE_THRESHOLD}ms)`
    );
  } else {
    console.log(
      `⚠️ Performance check warning (${Math.round(responseTime)}ms > ${EXPECTED_PERFORMANCE_THRESHOLD}ms)`
    );
  }

  return metrics;
}

/**
 * 🚀 Main validation function
 */
async function validateProduction() {
  console.log('🚀 Starting production validation...');
  console.log(`📍 Target URL: ${DEPLOYMENT_URL}`);
  console.log('');

  try {
    // Check accessibility and measure response time
    const accessibility = await checkAccessibility();

    // Check HTML structure
    const htmlStructure = await checkHTMLStructure();

    // Check performance
    const performance = await checkPerformance(accessibility.responseTime);

    // Summary
    console.log('');
    console.log('📊 Validation Summary:');
    console.log(`  🌐 Accessibility: ${accessibility.success ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  🔍 HTML Structure: ${htmlStructure.success ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  📊 Performance: ${performance.passed ? '✅ PASS' : '⚠️ WARNING'}`);
    console.log(`  ⏱️ Response Time: ${Math.round(accessibility.responseTime)}ms`);

    // Exit with appropriate code
    if (accessibility.success && htmlStructure.success) {
      console.log('');
      console.log('🎉 Production validation completed successfully!');
      process.exit(0);
    } else {
      console.log('');
      console.log('❌ Production validation failed!');
      process.exit(1);
    }
  } catch (error) {
    console.error('💥 Validation error:', error.message);
    process.exit(1);
  }
}

// Run validation
validateProduction();
