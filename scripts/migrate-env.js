#!/usr/bin/env node

/**
 * 🔄 Environment Configuration Migration Script (Node.js)
 * Cross-platform environment file management and migration
 */

import {
  readFileSync,
  writeFileSync,
  existsSync,
  readdirSync,
  copyFileSync,
  mkdirSync,
} from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = new URL('.', import.meta.url).pathname;

class EnvironmentMigrator {
  constructor() {
    this.action = 'migrate';
    this.force = false;
    this.parseArgs();
  }

  parseArgs() {
    const args = process.argv.slice(2);

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];

      if (arg === '--action' || arg === '-a') {
        this.action = args[i + 1];
        i++;
      } else if (arg === '--force' || arg === '-f') {
        this.force = true;
      } else if (arg === '--help' || arg === '-h') {
        this.showHelp();
        process.exit(0);
      } else if (!arg.startsWith('-')) {
        // Support positional arguments
        this.action = arg;
      }
    }
  }

  // Logging utilities
  writeHeader(title) {
    console.log(`\n🔧 ${title}`);
    console.log('='.repeat(title.length + 3));
  }

  writeSuccess(message) {
    console.log(`✅ ${message}`);
  }

  writeWarning(message) {
    console.log(`⚠️  ${message}`);
  }

  writeInfo(message) {
    console.log(`ℹ️  ${message}`);
  }

  writeError(message) {
    console.log(`❌ ${message}`);
  }

  backupExistingFiles() {
    this.writeHeader('Backing Up Existing Environment Files');

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const backupFolder = `env-backup-${timestamp}`;

    if (!existsSync(backupFolder)) {
      mkdirSync(backupFolder, { recursive: true });
      this.writeSuccess(`Created backup folder: ${backupFolder}`);
    }

    const envFiles = [
      '.env',
      '.env.local',
      '.env.development',
      '.env.production',
      '.env.staging',
      '.env.test',
    ];
    let backedUpFiles = 0;

    for (const file of envFiles) {
      if (existsSync(file)) {
        try {
          copyFileSync(file, join(backupFolder, file));
          this.writeSuccess(`Backed up: ${file}`);
          backedUpFiles++;
        } catch (error) {
          this.writeError(`Failed to backup ${file}: ${error.message}`);
        }
      }
    }

    if (backedUpFiles === 0) {
      this.writeInfo('No environment files found to backup');
    } else {
      this.writeSuccess(`Backed up ${backedUpFiles} files to ${backupFolder}/`);
    }

    return backupFolder;
  }

  migrateEnvironmentFiles() {
    this.writeHeader('Migrating Environment Configuration');

    // Create .env folder if it doesn't exist
    if (!existsSync('.env')) {
      mkdirSync('.env', { recursive: true });
      this.writeSuccess('Created .env/ folder');
    }

    // Check if migration is needed
    const legacyFiles = ['.env.development', '.env.production', '.env.staging', '.env.test'];
    const foundLegacyFiles = legacyFiles.filter((file) => existsSync(file));

    if (foundLegacyFiles.length === 0) {
      this.writeInfo('No legacy environment files found to migrate');
      return;
    }

    this.writeInfo(`Found ${foundLegacyFiles.length} legacy files to migrate`);

    // Backup before migration
    const backupFolder = this.backupExistingFiles();

    // Create base .env file structure
    this.createBaseEnvironmentStructure();

    // Migrate each legacy file
    for (const legacyFile of foundLegacyFiles) {
      this.migrateLegacyFile(legacyFile);
    }

    this.writeSuccess('Migration completed!');
    this.writeInfo(`Original files backed up to: ${backupFolder}/`);
  }

  createBaseEnvironmentStructure() {
    const baseEnvContent = `# Base Environment Configuration
# This file contains shared configuration across all environments

# Application
VITE_APP_NAME=Couple Connect
VITE_APP_VERSION=1.0.0

# Features
VITE_ENABLE_PWA=true
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_OFFLINE_MODE=true

# Development Tools
VITE_ENABLE_DEVTOOLS=false
VITE_ENABLE_MOCK_API=false

# Security
VITE_ENABLE_HTTPS=false
VITE_ENABLE_CSP=true

# Performance
VITE_ENABLE_COMPRESSION=true
VITE_ENABLE_LAZY_LOADING=true
`;

    const baseEnvPath = '.env/.env.base';
    if (!existsSync(baseEnvPath) || this.force) {
      writeFileSync(baseEnvPath, baseEnvContent);
      this.writeSuccess('Created .env/.env.base');
    }

    // Create environment-specific files
    const environments = {
      development: {
        content: `# Development Environment Configuration

# Environment
VITE_ENVIRONMENT=development
VITE_DEBUG=true

# API Configuration
VITE_API_URL=http://localhost:3000
VITE_API_TIMEOUT=30000

# Development Features
VITE_ENABLE_DEVTOOLS=true
VITE_ENABLE_MOCK_API=true
VITE_ENABLE_HOT_RELOAD=true

# Database (Development)
# Note: Add your development database configuration here
`,
        path: '.env/.env.development',
      },
      production: {
        content: `# Production Environment Configuration

# Environment
VITE_ENVIRONMENT=production
VITE_DEBUG=false

# API Configuration
VITE_API_URL=https://api.coupleconnect.app
VITE_API_TIMEOUT=10000

# Production Features
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_ERROR_REPORTING=true
VITE_ENABLE_PERFORMANCE_MONITORING=true

# Security
VITE_ENABLE_HTTPS=true
VITE_ENABLE_SECURITY_HEADERS=true
`,
        path: '.env/.env.production',
      },
      staging: {
        content: `# Staging Environment Configuration

# Environment
VITE_ENVIRONMENT=staging
VITE_DEBUG=true

# API Configuration
VITE_API_URL=https://staging-api.coupleconnect.app
VITE_API_TIMEOUT=15000

# Staging Features
VITE_ENABLE_TESTING_FEATURES=true
VITE_ENABLE_DEBUG_LOGS=true
`,
        path: '.env/.env.staging',
      },
      test: {
        content: `# Test Environment Configuration

# Environment
VITE_ENVIRONMENT=test
VITE_DEBUG=true

# API Configuration
VITE_API_URL=http://localhost:3001
VITE_API_TIMEOUT=5000

# Test Features
VITE_ENABLE_MOCK_API=true
VITE_ENABLE_TEST_HELPERS=true
`,
        path: '.env/.env.test',
      },
    };

    for (const [envName, config] of Object.entries(environments)) {
      if (!existsSync(config.path) || this.force) {
        writeFileSync(config.path, config.content);
        this.writeSuccess(`Created ${config.path}`);
      }
    }

    // Create example file
    const exampleContent = `# Environment Configuration Example
# Copy this file to .env.local and configure for your setup

# Copy from .env/.env.base first, then add one of:
# - .env/.env.development (for development)
# - .env/.env.staging (for staging)
# - .env/.env.production (for production)
# - .env/.env.test (for testing)

# Example for development:
# cp .env/.env.base .env.local && cat .env/.env.development >> .env.local

# Add your custom configuration below:
# VITE_CUSTOM_SETTING=your-value
`;

    const examplePath = '.env/.env.example';
    if (!existsSync(examplePath) || this.force) {
      writeFileSync(examplePath, exampleContent);
      this.writeSuccess('Created .env/.env.example');
    }
  }

  migrateLegacyFile(legacyFile) {
    try {
      const content = readFileSync(legacyFile, 'utf8');
      const targetFile = legacyFile.replace('.env.', '.env/.env.');

      if (!existsSync(targetFile) || this.force) {
        writeFileSync(targetFile, content);
        this.writeSuccess(`Migrated ${legacyFile} → ${targetFile}`);
      } else {
        this.writeWarning(`Skipped ${legacyFile} (target exists, use --force to overwrite)`);
      }
    } catch (error) {
      this.writeError(`Failed to migrate ${legacyFile}: ${error.message}`);
    }
  }

  setupDevelopmentEnvironment() {
    this.writeHeader('Setting Up Development Environment');

    const baseFile = '.env/.env.base';
    const devFile = '.env/.env.development';
    const localFile = '.env.local';

    if (!existsSync(baseFile) || !existsSync(devFile)) {
      this.writeError('Environment files not found. Run migration first.');
      return;
    }

    try {
      const baseContent = readFileSync(baseFile, 'utf8');
      const devContent = readFileSync(devFile, 'utf8');
      const combinedContent = baseContent + '\n' + devContent;

      writeFileSync(localFile, combinedContent);
      this.writeSuccess(`Created ${localFile} for development`);
      this.writeInfo('Development environment is ready!');
    } catch (error) {
      this.writeError(`Failed to setup development environment: ${error.message}`);
    }
  }

  setupEnvironment(envType) {
    this.writeHeader(
      `Setting Up ${envType.charAt(0).toUpperCase() + envType.slice(1)} Environment`
    );

    const baseFile = '.env/.env.base';
    const envFile = `.env/.env.${envType}`;
    const localFile = '.env.local';

    if (!existsSync(baseFile)) {
      this.writeError(`Base environment file not found: ${baseFile}`);
      return false;
    }

    if (!existsSync(envFile)) {
      this.writeError(`Environment file not found: ${envFile}`);
      return false;
    }

    try {
      const baseContent = readFileSync(baseFile, 'utf8');
      const envContent = readFileSync(envFile, 'utf8');
      const combinedContent = baseContent + '\n' + envContent;

      writeFileSync(localFile, combinedContent);
      this.writeSuccess(`Created ${localFile} for ${envType} environment`);
      this.writeInfo(`${envType.charAt(0).toUpperCase() + envType.slice(1)} environment is ready!`);
      return true;
    } catch (error) {
      this.writeError(`Failed to setup ${envType} environment: ${error.message}`);
      return false;
    }
  }

  checkEnvironment() {
    this.writeHeader('Environment Check');

    if (existsSync('.env.local')) {
      this.writeSuccess('.env.local exists');

      try {
        const content = readFileSync('.env.local', 'utf8');
        const envMatch = content.match(/VITE_ENVIRONMENT=([^\r\n]+)/);

        if (envMatch) {
          const environment = envMatch[1];
          this.writeInfo(`Current environment: ${environment}`);
        } else {
          this.writeWarning('VITE_ENVIRONMENT not found in .env.local');
        }
      } catch (error) {
        this.writeError(`Error reading .env.local: ${error.message}`);
      }
    } else {
      this.writeError('.env.local not found');
      this.writeInfo(
        'Run one of: npm run env:dev, npm run env:staging, npm run env:prod, npm run env:test'
      );
    }
  }

  showMigrationStatus() {
    this.writeHeader('Environment Configuration Status');

    // Check .env folder structure
    if (existsSync('.env')) {
      this.writeSuccess('.env/ folder exists');

      const envFiles = [
        '.env.base',
        '.env.development',
        '.env.production',
        '.env.staging',
        '.env.test',
        '.env.example',
        'README.md',
      ];

      for (const file of envFiles) {
        const filePath = `.env/${file}`;
        if (existsSync(filePath)) {
          this.writeSuccess(`✓ ${file}`);
        } else {
          this.writeError(`✗ ${file} (missing)`);
        }
      }
    } else {
      this.writeError('.env folder not found!');
    }

    console.log('');

    // Check current environment setup
    if (existsSync('.env.local')) {
      this.writeSuccess('.env.local exists');

      try {
        const envContent = readFileSync('.env.local', 'utf8');
        const envMatch = envContent.match(/VITE_ENVIRONMENT=([^\r\n]+)/);

        if (envMatch) {
          const environment = envMatch[1];
          this.writeInfo(`Current environment: ${environment}`);
        } else {
          this.writeWarning('VITE_ENVIRONMENT not found in .env.local');
        }
      } catch (error) {
        this.writeError(`Error reading .env.local: ${error.message}`);
      }
    } else {
      this.writeWarning('.env.local not found - no environment configured');
      this.writeInfo('Run one of these commands to setup an environment:');
      console.log('  npm run env:dev     # Development environment');
      console.log('  npm run env:staging # Staging environment');
      console.log('  npm run env:prod    # Production environment');
      console.log('  npm run env:test    # Testing environment');
    }

    console.log('');

    // Check for legacy files
    const legacyFiles = [
      '.env',
      '.env.development',
      '.env.production',
      '.env.staging',
      '.env.test',
    ];
    const foundLegacy = legacyFiles.filter((file) => existsSync(file));

    if (foundLegacy.length > 0) {
      this.writeWarning('Legacy environment files found:');
      for (const file of foundLegacy) {
        console.log(`  - ${file}`);
      }
      this.writeInfo('Consider running migration to move to .env/ folder structure');
    } else {
      this.writeSuccess('No legacy environment files found');
    }
  }

  validateEnvironmentSetup() {
    this.writeHeader('Validating Environment Setup');

    let isValid = true;

    // Check required files
    const requiredFiles = ['.env/.env.base', '.env/.env.development', '.env/.env.production'];

    for (const file of requiredFiles) {
      if (existsSync(file)) {
        this.writeSuccess(`✓ ${file}`);
      } else {
        this.writeError(`✗ ${file} (required)`);
        isValid = false;
      }
    }

    // Validate .env.local if it exists
    if (existsSync('.env.local')) {
      try {
        const content = readFileSync('.env.local', 'utf8');

        // Check for required variables
        const requiredVars = ['VITE_ENVIRONMENT', 'VITE_APP_NAME'];

        for (const varName of requiredVars) {
          if (content.includes(varName)) {
            this.writeSuccess(`✓ ${varName}`);
          } else {
            this.writeError(`✗ ${varName} (missing from .env.local)`);
            isValid = false;
          }
        }
      } catch (error) {
        this.writeError(`Error reading .env.local: ${error.message}`);
        isValid = false;
      }
    }

    if (isValid) {
      this.writeSuccess('Environment setup is valid!');
    } else {
      this.writeError('Environment setup has issues');
    }

    return isValid;
  }

  showEnvironmentOptions() {
    this.writeHeader('Available Environment Configurations');

    console.log('🔧 Development Environment:');
    console.log('  - Debug mode enabled');
    console.log('  - Mock API available');
    console.log('  - Hot reload enabled');
    console.log('  - Command: npm run env:dev\n');

    console.log('🧪 Testing Environment:');
    console.log('  - Test helpers enabled');
    console.log('  - Mock API enabled');
    console.log('  - Isolated test database');
    console.log('  - Command: npm run env:test\n');

    console.log('🚀 Staging Environment:');
    console.log('  - Production-like setup');
    console.log('  - Testing features enabled');
    console.log('  - Debug logs available');
    console.log('  - Command: npm run env:staging\n');

    console.log('🏭 Production Environment:');
    console.log('  - Optimized performance');
    console.log('  - Analytics enabled');
    console.log('  - Security hardened');
    console.log('  - Command: npm run env:prod\n');
  }

  showHelp() {
    console.log(`
🔄 Environment Configuration Migration Script

Usage: node migrate-env.js [action] [options]

Actions:
  migrate    - Migrate legacy .env files to .env/ folder structure (default)
  backup     - Backup existing environment files
  dev        - Setup development environment (.env.local)
  staging    - Setup staging environment (.env.local)
  prod       - Setup production environment (.env.local)
  test       - Setup test environment (.env.local)
  check      - Check current environment status
  status     - Show current environment configuration status
  validate   - Validate environment setup
  options    - Show available environment options
  help       - Show this help message

Options:
  -a, --action <action>    Action to perform
  -f, --force             Force overwrite existing files
  -h, --help              Show this help message

Examples:
  node migrate-env.js migrate
  node migrate-env.js dev
  node migrate-env.js prod
  node migrate-env.js status
  node migrate-env.js validate
  node migrate-env.js --action backup --force

Environment Structure:
  .env/
    ├── .env.base         # Shared configuration
    ├── .env.development  # Development settings
    ├── .env.production   # Production settings
    ├── .env.staging      # Staging settings
    ├── .env.test         # Testing settings
    └── .env.example      # Example/template file

  .env.local              # Active environment (gitignored)
`);
  }

  async run() {
    try {
      switch (this.action.toLowerCase()) {
        case 'migrate':
          this.migrateEnvironmentFiles();
          break;

        case 'backup':
          this.backupExistingFiles();
          break;

        case 'setup-dev':
        case 'dev':
          this.setupEnvironment('development');
          break;

        case 'setup-staging':
        case 'staging':
          this.setupEnvironment('staging');
          break;

        case 'setup-prod':
        case 'production':
        case 'prod':
          this.setupEnvironment('production');
          break;

        case 'setup-test':
        case 'test':
          this.setupEnvironment('test');
          break;

        case 'check':
          this.checkEnvironment();
          break;

        case 'status':
          this.showMigrationStatus();
          break;

        case 'validate':
          const isValid = this.validateEnvironmentSetup();
          process.exit(isValid ? 0 : 1);
          break;

        case 'options':
          this.showEnvironmentOptions();
          break;

        case 'help':
          this.showHelp();
          break;

        default:
          this.writeWarning(`Unknown action: ${this.action}`);
          this.showHelp();
          process.exit(1);
      }
    } catch (error) {
      console.error(`❌ Error: ${error.message}`);
      process.exit(1);
    }
  }
}

// Main execution
if (
  import.meta.url === `file://${process.argv[1]}` ||
  import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'))
) {
  const migrator = new EnvironmentMigrator();
  migrator.run();
}

export default EnvironmentMigrator;
