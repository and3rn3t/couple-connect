#!/usr/bin/env node

// Database setup script for Cloudflare D1
// Run this script to initialize your D1 database with the schema and seed data

const fs = require('fs');
const path = require('path');
const { execSync, execFileSync } = require('child_process');

const DATABASE_NAME = 'couple-connect-db';

async function setupDatabase() {
  console.log('🚀 Setting up Couple Connect Database...\n');

  try {
    // 1. Create the D1 database
    console.log('📦 Creating D1 database...');
    const createResult = execSync(`wrangler d1 create ${DATABASE_NAME}`, { encoding: 'utf8' });
    console.log(createResult);

    // Extract database ID from output
    const dbIdMatch = createResult.match(/database_id = "([^"]+)"/);
    if (!dbIdMatch) {
      throw new Error('Could not extract database ID from wrangler output');
    }
    const databaseId = dbIdMatch[1];
    console.log(`✅ Database created with ID: ${databaseId}\n`);

    // 2. Update wrangler.toml with the database ID
    console.log('📝 Updating wrangler.toml...');
    const wranglerPath = path.join(process.cwd(), 'wrangler.toml');
    let wranglerConfig = fs.readFileSync(wranglerPath, 'utf8');
    wranglerConfig = wranglerConfig.replace(
      'database_id = "your-database-id-here"',
      `database_id = "${databaseId}"`
    );
    fs.writeFileSync(wranglerPath, wranglerConfig);
    console.log('✅ wrangler.toml updated\n');

    // 3. Execute schema
    console.log('🏗️ Creating database schema...');
    const schemaPath = path.join(process.cwd(), 'database', 'schema.sql');
    execFileSync('wrangler', ['d1', 'execute', DATABASE_NAME, `--file=${schemaPath}`], { stdio: 'inherit' });
    console.log('✅ Schema created\n');

    // 4. Execute seed data
    console.log('🌱 Inserting seed data...');
    const seedPath = path.join(process.cwd(), 'database', 'seed.sql');
    execFileSync('wrangler', ['d1', 'execute', DATABASE_NAME, `--file=${seedPath}`], { stdio: 'inherit' });
    console.log('✅ Seed data inserted\n');

    console.log('🎉 Database setup complete!');
    console.log('\nNext steps:');
    console.log('1. Deploy your application: npm run deploy');
    console.log('2. Your database is ready to use with Cloudflare D1');
    console.log(`3. Database ID: ${databaseId}`);
  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase };
