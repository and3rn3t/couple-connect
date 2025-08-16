#!/usr/bin/env node

/**
 * Development vs Production Configuration Checker
 * Ensures development environment properly mirrors production setup
 */

import fs from 'fs';
import path from 'path';
import http from 'http';

console.log('🔍 Development vs Production Configuration Check\n');

// Check environment configuration
function checkEnvironment() {
  console.log('📋 Environment Configuration:');

  const envLocal = path.join('.env', '.env.local');
  const envDev = path.join('.env', '.env.development');
  const envProd = path.join('.env', '.env.production');

  if (fs.existsSync(envLocal)) {
    console.log('✅ .env.local exists');

    const envContent = fs.readFileSync(envLocal, 'utf8');
    const environment = envContent.match(/VITE_ENVIRONMENT=(.+)/);
    if (environment) {
      console.log(`   Environment: ${environment[1]}`);
    }
  } else {
    console.log('❌ .env.local missing');
  }

  console.log(`✅ Development config: ${fs.existsSync(envDev) ? 'exists' : 'missing'}`);
  console.log(`✅ Production config: ${fs.existsSync(envProd) ? 'exists' : 'missing'}`);
}

// Check build configuration
function checkBuildConfig() {
  console.log('\n🏗️  Build Configuration:');

  const viteConfig = 'vite.config.ts';
  if (fs.existsSync(viteConfig)) {
    console.log('✅ Vite config exists');

    const config = fs.readFileSync(viteConfig, 'utf8');

    // Check for development-specific optimizations
    if (config.includes('sourcemap')) {
      console.log('✅ Source maps configured');
    }

    if (config.includes('hmr')) {
      console.log('✅ Hot Module Replacement configured');
    }

    if (config.includes('optimizeDeps')) {
      console.log('✅ Dependency pre-bundling configured');
    }

    if (config.includes('terserOptions')) {
      console.log('✅ Production minification configured');
    }
  }
}

// Check dependencies
function checkDependencies() {
  console.log('\n📦 Dependencies:');

  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

  const devDeps = Object.keys(packageJson.devDependencies || {});
  const deps = Object.keys(packageJson.dependencies || {});

  console.log(`✅ ${deps.length} production dependencies`);
  console.log(`✅ ${devDeps.length} development dependencies`);

  // Check for key dependencies
  const keyDeps = ['react', 'react-dom', '@phosphor-icons/react', 'framer-motion'];
  keyDeps.forEach((dep) => {
    if (deps.includes(dep)) {
      console.log(`✅ ${dep} installed`);
    } else {
      console.log(`❌ ${dep} missing`);
    }
  });
}

// Check build output
function checkBuildOutput() {
  console.log('\n📁 Build Output:');

  const distDir = 'dist';
  if (fs.existsSync(distDir)) {
    console.log('✅ dist/ directory exists');

    const files = fs.readdirSync(distDir);
    console.log(`   ${files.length} files generated`);

    if (files.some((f) => f.endsWith('.html'))) {
      console.log('✅ HTML file generated');
    }

    if (files.some((f) => f.includes('.js'))) {
      console.log('✅ JavaScript files generated');
    }

    if (files.some((f) => f.includes('.css'))) {
      console.log('✅ CSS files generated');
    }
  } else {
    console.log('ℹ️  No build output (run npm run build first)');
  }
}

// Check server configuration
function checkServerConfig() {
  console.log('\n🌐 Server Configuration:');

  console.log('Development server: http://localhost:5173');
  console.log('Preview server: npm run preview');

  // Check if server is running by attempting to connect
  const options = {
    hostname: 'localhost',
    port: 5173,
    path: '/',
    method: 'GET',
    timeout: 1000,
  };

  const req = http.request(options, (res) => {
    console.log('✅ Development server is running');
  });

  req.on('error', () => {
    console.log('ℹ️  Development server is not running');
  });

  req.on('timeout', () => {
    console.log('ℹ️  Development server timeout');
  });

  req.end();
}

// Main execution
console.log('Starting configuration check...\n');

checkEnvironment();
checkBuildConfig();
checkDependencies();
checkBuildOutput();
checkServerConfig();

console.log('\n✨ Configuration check complete!');
console.log('\n💡 To start development server: npm run dev');
console.log('💡 To build for production: npm run build');
console.log('💡 To preview production build: npm run preview');
