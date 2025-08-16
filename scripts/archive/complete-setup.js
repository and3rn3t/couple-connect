#!/usr/bin/env node

/**
 * Complete Database Setup and Migration Script
 *
 * This script handles:
 * 1. Setting up Cloudflare D1 database
 * 2. Applying schema and seed data
 * 3. Migrating existing localStorage data
 *
 * Usage:
 * node scripts/complete-setup.js [--migrate]
 */

const fs = require('fs');
const path = require('path');
const { execSync, execFileSync } = require('child_process');

const DATABASE_NAME = 'couple-connect-db';
const WRANGLER_CONFIG_PATH = path.join(process.cwd(), 'wrangler.toml');
const SCHEMA_PATH = path.join(process.cwd(), 'database', 'schema.sql');
const SEED_PATH = path.join(process.cwd(), 'database', 'seed.sql');

// Helper functions
function logStep(message) {
  console.log(`\n🔄 ${message}`);
}

function logSuccess(message) {
  console.log(`✅ ${message}`);
}

function logError(message) {
  console.error(`❌ ${message}`);
}

function logInfo(message) {
  console.log(`ℹ️  ${message}`);
}

// Check if wrangler is installed
function checkWrangler() {
  try {
    execSync('wrangler --version', { stdio: 'pipe' });
    return true;
  } catch (error) {
    return false;
  }
}

// Check if user is authenticated
function checkAuth() {
  try {
    const result = execSync('wrangler whoami', { encoding: 'utf8', stdio: 'pipe' });
    return !result.includes('not authenticated');
  } catch (error) {
    return false;
  }
}

// Create D1 database
async function createDatabase() {
  logStep('Creating Cloudflare D1 database...');

  try {
    const createResult = execSync(`wrangler d1 create ${DATABASE_NAME}`, {
      encoding: 'utf8',
      stdio: 'pipe',
    });

    console.log(createResult);

    // Extract database ID
    const dbIdMatch = createResult.match(/database_id = "([^"]+)"/);
    if (!dbIdMatch) {
      throw new Error('Could not extract database ID from output');
    }

    const databaseId = dbIdMatch[1];
    logSuccess(`Database created with ID: ${databaseId}`);

    return databaseId;
  } catch (error) {
    if (error.message.includes('already exists')) {
      logInfo('Database already exists, skipping creation');
      // Try to get existing database ID
      try {
        const listResult = execSync('wrangler d1 list', { encoding: 'utf8', stdio: 'pipe' });
        const lines = listResult.split('\n');
        for (const line of lines) {
          if (line.includes(DATABASE_NAME)) {
            const parts = line.split('│').map((p) => p.trim());
            if (parts.length >= 2) {
              return parts[1]; // Database ID is usually in the second column
            }
          }
        }
      } catch (listError) {
        console.warn('Could not get existing database ID automatically');
      }
      return null;
    }
    throw error;
  }
}

// Update wrangler.toml with database ID
function updateWranglerConfig(databaseId) {
  if (!databaseId) {
    logInfo('Skipping wrangler.toml update (no database ID)');
    return;
  }

  logStep('Updating wrangler.toml configuration...');

  let config = fs.readFileSync(WRANGLER_CONFIG_PATH, 'utf8');

  // Replace placeholder database ID
  if (config.includes('your-database-id-here')) {
    config = config.replace('your-database-id-here', databaseId);
    fs.writeFileSync(WRANGLER_CONFIG_PATH, config);
    logSuccess('wrangler.toml updated with database ID');
  } else if (config.includes(databaseId)) {
    logInfo('wrangler.toml already has the correct database ID');
  } else {
    logInfo('wrangler.toml may need manual update with database ID: ' + databaseId);
  }
}

// Apply database schema
async function applySchema() {
  logStep('Applying database schema...');

  try {
    execFileSync('wrangler', ['d1', 'execute', DATABASE_NAME, `--file=${SCHEMA_PATH}`], {
      stdio: 'inherit',
    });
    logSuccess('Database schema applied');
  } catch (error) {
    if (error.message.includes('already exists')) {
      logInfo('Schema already exists, continuing...');
    } else {
      throw error;
    }
  }
}

// Insert seed data
async function insertSeedData() {
  logStep('Inserting seed data...');

  try {
    execSync(`wrangler d1 execute ${DATABASE_NAME} --file=${SEED_PATH}`, {
      stdio: 'inherit',
    });
    logSuccess('Seed data inserted');
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      logInfo('Seed data already exists, skipping...');
    } else {
      throw error;
    }
  }
}

// Generate migration instructions
function generateMigrationInstructions() {
  const instructions = `
📋 Migration Instructions:

1. **Backup Current Data** (recommended):
   \`\`\`javascript
   // In browser console on your app:
   const backup = {};
   ['current-partner', 'other-partner', 'relationship-issues', 'relationship-actions', 'relationship-health']
     .forEach(key => backup[key] = localStorage.getItem(key));
   console.log('Backup:', JSON.stringify(backup, null, 2));
   \`\`\`

2. **Run Migration** (when ready):
   \`\`\`javascript
   // In your app:
   import { migrateFromLocalStorage } from './services/migration';
   const result = await migrateFromLocalStorage();
   console.log('Migration result:', result);
   \`\`\`

3. **Switch to D1** (in production):
   - Update your database service to use D1 instead of localStorage
   - Deploy with: \`npm run deploy\`

4. **Verify Migration**:
   - Check that all your issues and actions are preserved
   - Test creating new data to ensure D1 is working

🔄 **Rollback** (if needed):
   \`\`\`javascript
   import { restoreFromBackup } from './services/migration';
   restoreFromBackup();
   \`\`\`
`;

  console.log(instructions);
}

// Main setup function
async function setupDatabase() {
  console.log('🚀 Couple Connect Database Setup\n');
  console.log('This will set up your Cloudflare D1 database for production use.\n');

  try {
    // Prerequisite checks
    if (!checkWrangler()) {
      logError('Wrangler CLI not found. Install with: npm install -g wrangler');
      process.exit(1);
    }

    if (!checkAuth()) {
      logError('Not authenticated with Cloudflare. Run: wrangler login');
      process.exit(1);
    }

    logSuccess('Prerequisites check passed');

    // Database setup
    const databaseId = await createDatabase();
    updateWranglerConfig(databaseId);
    await applySchema();
    await insertSeedData();

    // Success message
    console.log('\n🎉 Database setup complete!');
    console.log('\n📊 What was set up:');
    console.log('  ✅ Cloudflare D1 database created');
    console.log('  ✅ Schema applied (users, couples, issues, actions, etc.)');
    console.log('  ✅ Seed data inserted (categories, templates, achievements)');
    console.log('  ✅ wrangler.toml configured');

    console.log('\n🚀 Next steps:');
    console.log('  1. Test with: npm run dev');
    console.log('  2. Deploy with: npm run deploy');
    console.log('  3. Optional: Migrate existing data (see instructions below)');

    // Show migration instructions
    generateMigrationInstructions();
  } catch (error) {
    logError(`Setup failed: ${error.message}`);
    console.log('\n🔧 Troubleshooting:');
    console.log('  - Make sure you have Cloudflare account access');
    console.log('  - Check that wrangler is authenticated: wrangler whoami');
    console.log('  - Try running: wrangler login');
    process.exit(1);
  }
}

// Command line interface
if (require.main === module) {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Usage: node scripts/complete-setup.js [options]

Options:
  --help, -h     Show this help message

This script will:
1. Create a Cloudflare D1 database
2. Apply the schema and seed data
3. Update wrangler.toml configuration
4. Provide migration instructions

Prerequisites:
- Wrangler CLI installed (npm install -g wrangler)
- Authenticated with Cloudflare (wrangler login)
`);
    process.exit(0);
  }

  setupDatabase();
}

module.exports = { setupDatabase };
