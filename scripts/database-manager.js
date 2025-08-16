#!/usr/bin/env node

/**
 * 🗄️ Database Health Monitor & Migration Manager
 * 
 * Features:
 * - Database health monitoring
 * - Migration management
 * - Performance analysis
 * - Backup automation
 * - Schema validation
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';

class DatabaseManager {
  constructor() {
    this.databaseDir = resolve('database');
    this.migrationsDir = resolve(this.databaseDir, 'migrations');
    this.backupsDir = resolve(this.databaseDir, 'backups');
    this.healthChecks = [];
    this.migrationStatus = [];
  }

  async monitor() {
    console.log('🗄️ Starting database health monitoring...\n');

    await this.checkDatabaseStructure();
    await this.runHealthChecks();
    await this.checkMigrationStatus();
    await this.analyzePerformance();
    await this.validateSchema();
    
    this.generateHealthReport();
  }

  async checkDatabaseStructure() {
    console.log('📁 Checking database structure...');

    const requiredFiles = [
      { path: resolve(this.databaseDir, 'schema.sql'), name: 'Schema file' },
      { path: resolve(this.databaseDir, 'seed.sql'), name: 'Seed data file' }
    ];

    const requiredDirs = [
      { path: this.migrationsDir, name: 'Migrations directory' },
      { path: this.backupsDir, name: 'Backups directory' }
    ];

    requiredFiles.forEach(file => {
      if (existsSync(file.path)) {
        console.log(`✅ ${file.name} exists`);
      } else {
        console.log(`❌ ${file.name} missing`);
        this.healthChecks.push({
          type: 'structure',
          status: 'fail',
          message: `${file.name} not found`,
          fix: `Create ${file.path}`
        });
      }
    });

    requiredDirs.forEach(dir => {
      if (existsSync(dir.path)) {
        console.log(`✅ ${dir.name} exists`);
      } else {
        console.log(`⚠️  ${dir.name} missing (will create)`);
        try {
          execSync(`mkdir -p "${dir.path}"`);
          console.log(`✅ Created ${dir.name}`);
        } catch (error) {
          this.healthChecks.push({
            type: 'structure',
            status: 'fail',
            message: `Could not create ${dir.name}`,
            fix: `Manually create ${dir.path}`
          });
        }
      }
    });

    console.log();
  }

  async runHealthChecks() {
    console.log('🏥 Running database health checks...');

    // Check if Wrangler CLI is available
    try {
      execSync('wrangler --version', { stdio: 'pipe' });
      console.log('✅ Wrangler CLI available');
      this.healthChecks.push({
        type: 'cli',
        status: 'pass',
        message: 'Wrangler CLI is available'
      });
    } catch (error) {
      console.log('❌ Wrangler CLI not available');
      this.healthChecks.push({
        type: 'cli',
        status: 'fail',
        message: 'Wrangler CLI not found',
        fix: 'Install Wrangler: npm install -g wrangler'
      });
    }

    // Check D1 database connection
    try {
      const result = execSync('wrangler d1 list', { encoding: 'utf8' });
      const databases = JSON.parse(result);
      
      if (databases.length > 0) {
        console.log(`✅ Found ${databases.length} D1 database(s)`);
        this.healthChecks.push({
          type: 'connection',
          status: 'pass',
          message: `${databases.length} D1 databases found`
        });
      } else {
        console.log('⚠️  No D1 databases found');
        this.healthChecks.push({
          type: 'connection',
          status: 'warn',
          message: 'No D1 databases found',
          fix: 'Create database: npm run db:create'
        });
      }
    } catch (error) {
      console.log('❌ Could not list D1 databases');
      this.healthChecks.push({
        type: 'connection',
        status: 'fail',
        message: 'Could not connect to D1',
        fix: 'Check Wrangler authentication'
      });
    }

    // Check environment configuration
    const envFiles = ['.env', '.env.local', '.env.development'];
    let envFound = false;
    
    envFiles.forEach(envFile => {
      if (existsSync(envFile)) {
        envFound = true;
        console.log(`✅ Environment file ${envFile} exists`);
      }
    });

    if (!envFound) {
      console.log('⚠️  No environment files found');
      this.healthChecks.push({
        type: 'config',
        status: 'warn',
        message: 'No environment configuration found',
        fix: 'Create .env file with database configuration'
      });
    }

    console.log();
  }

  async checkMigrationStatus() {
    console.log('📋 Checking migration status...');

    if (!existsSync(this.migrationsDir)) {
      console.log('⚠️  No migrations directory found');
      return;
    }

    try {
      const migrationFiles = execSync(`ls "${this.migrationsDir}"/*.sql 2>/dev/null || echo ""`, { encoding: 'utf8' })
        .split('\n')
        .filter(file => file.trim() && file.endsWith('.sql'));

      if (migrationFiles.length === 0) {
        console.log('📝 No migration files found');
        this.migrationStatus.push({
          type: 'info',
          message: 'No migrations to run',
          status: 'clean'
        });
      } else {
        console.log(`📂 Found ${migrationFiles.length} migration file(s)`);
        
        migrationFiles.forEach(file => {
          const migrationName = file.split('/').pop().replace('.sql', '');
          console.log(`   - ${migrationName}`);
          
          this.migrationStatus.push({
            type: 'migration',
            name: migrationName,
            file: file,
            status: 'pending'
          });
        });
      }
    } catch (error) {
      console.log('❌ Error checking migrations');
      this.healthChecks.push({
        type: 'migration',
        status: 'fail',
        message: 'Could not check migration status',
        fix: 'Check migrations directory permissions'
      });
    }

    console.log();
  }

  async analyzePerformance() {
    console.log('⚡ Analyzing database performance...');

    const performanceMetrics = {
      schemaSize: 0,
      seedDataSize: 0,
      migrationCount: this.migrationStatus.length,
      lastBackup: 'unknown'
    };

    // Check schema file size
    const schemaPath = resolve(this.databaseDir, 'schema.sql');
    if (existsSync(schemaPath)) {
      try {
        const schemaContent = readFileSync(schemaPath, 'utf8');
        performanceMetrics.schemaSize = schemaContent.length;
        
        // Count tables in schema
        const tableMatches = schemaContent.match(/CREATE TABLE/gi);
        const tableCount = tableMatches ? tableMatches.length : 0;
        
        console.log(`📊 Schema: ${(performanceMetrics.schemaSize / 1024).toFixed(1)}KB, ${tableCount} tables`);
      } catch (error) {
        console.log('⚠️  Could not analyze schema file');
      }
    }

    // Check seed data size
    const seedPath = resolve(this.databaseDir, 'seed.sql');
    if (existsSync(seedPath)) {
      try {
        const seedContent = readFileSync(seedPath, 'utf8');
        performanceMetrics.seedDataSize = seedContent.length;
        
        // Count INSERT statements
        const insertMatches = seedContent.match(/INSERT INTO/gi);
        const insertCount = insertMatches ? insertMatches.length : 0;
        
        console.log(`📊 Seed data: ${(performanceMetrics.seedDataSize / 1024).toFixed(1)}KB, ${insertCount} inserts`);
      } catch (error) {
        console.log('⚠️  Could not analyze seed file');
      }
    }

    // Check for recent backups
    if (existsSync(this.backupsDir)) {
      try {
        const backupFiles = execSync(`ls -lt "${this.backupsDir}"/*.sql 2>/dev/null | head -1 || echo ""`, { encoding: 'utf8' });
        if (backupFiles.trim()) {
          console.log('✅ Recent backup found');
          performanceMetrics.lastBackup = 'recent';
        } else {
          console.log('⚠️  No recent backups found');
          performanceMetrics.lastBackup = 'none';
        }
      } catch (error) {
        console.log('⚠️  Could not check backup status');
      }
    }

    this.performanceMetrics = performanceMetrics;
    console.log();
  }

  async validateSchema() {
    console.log('🔍 Validating database schema...');

    const schemaPath = resolve(this.databaseDir, 'schema.sql');
    if (!existsSync(schemaPath)) {
      console.log('❌ Schema file not found');
      return;
    }

    try {
      const schemaContent = readFileSync(schemaPath, 'utf8');
      const validationResults = this.runSchemaValidation(schemaContent);
      
      if (validationResults.issues.length === 0) {
        console.log('✅ Schema validation passed');
      } else {
        console.log(`⚠️  Found ${validationResults.issues.length} schema issues:`);
        validationResults.issues.forEach(issue => {
          console.log(`   - ${issue}`);
        });
      }

      this.schemaValidation = validationResults;
    } catch (error) {
      console.log('❌ Schema validation failed:', error.message);
    }

    console.log();
  }

  runSchemaValidation(schemaContent) {
    const issues = [];
    const recommendations = [];

    // Check for common issues
    if (!schemaContent.includes('PRIMARY KEY')) {
      issues.push('No PRIMARY KEY constraints found');
    }

    if (!schemaContent.includes('FOREIGN KEY')) {
      recommendations.push('Consider adding FOREIGN KEY constraints for data integrity');
    }

    if (!schemaContent.includes('INDEX')) {
      recommendations.push('Consider adding indexes for better query performance');
    }

    if (schemaContent.includes('TEXT') && !schemaContent.includes('VARCHAR')) {
      recommendations.push('Consider using VARCHAR with length limits instead of TEXT');
    }

    // Check for timestamps
    if (!schemaContent.toLowerCase().includes('created_at')) {
      recommendations.push('Consider adding created_at timestamps to tables');
    }

    if (!schemaContent.toLowerCase().includes('updated_at')) {
      recommendations.push('Consider adding updated_at timestamps to tables');
    }

    return {
      issues,
      recommendations,
      score: Math.max(0, 100 - (issues.length * 10))
    };
  }

  generateHealthReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        healthScore: this.calculateHealthScore(),
        totalChecks: this.healthChecks.length,
        checksPass: this.healthChecks.filter(c => c.status === 'pass').length,
        checksWarn: this.healthChecks.filter(c => c.status === 'warn').length,
        checksFail: this.healthChecks.filter(c => c.status === 'fail').length,
        migrationsCount: this.migrationStatus.length,
        schemaValid: this.schemaValidation?.issues.length === 0
      },
      details: {
        healthChecks: this.healthChecks,
        migrationStatus: this.migrationStatus,
        performanceMetrics: this.performanceMetrics,
        schemaValidation: this.schemaValidation
      },
      recommendations: this.generateRecommendations()
    };

    // Save report
    writeFileSync('database-health-report.json', JSON.stringify(report, null, 2));

    // Generate markdown report
    const markdown = this.generateMarkdownReport(report);
    writeFileSync('DATABASE_HEALTH_REPORT.md', markdown);

    console.log('📊 DATABASE HEALTH SUMMARY');
    console.log('===========================');
    console.log(`🏥 Health Score: ${report.summary.healthScore}/100`);
    console.log(`✅ Checks Passed: ${report.summary.checksPass}`);
    console.log(`⚠️  Warnings: ${report.summary.checksWarn}`);
    console.log(`❌ Failures: ${report.summary.checksFail}`);
    console.log(`📋 Migrations: ${report.summary.migrationsCount}`);
    console.log(`🔍 Schema: ${report.summary.schemaValid ? 'Valid' : 'Issues found'}`);

    if (report.recommendations.length > 0) {
      console.log('\n💡 Top Recommendations:');
      report.recommendations.slice(0, 3).forEach((rec, i) => {
        console.log(`${i + 1}. ${rec}`);
      });
    }

    console.log('\n📄 Reports generated:');
    console.log('   - database-health-report.json');
    console.log('   - DATABASE_HEALTH_REPORT.md');
    console.log('\n✅ Database health check complete!');
  }

  calculateHealthScore() {
    let score = 100;
    
    // Deduct points for failed checks
    const failedChecks = this.healthChecks.filter(c => c.status === 'fail').length;
    const warnChecks = this.healthChecks.filter(c => c.status === 'warn').length;
    
    score -= (failedChecks * 15); // -15 points per failure
    score -= (warnChecks * 5);    // -5 points per warning
    
    // Deduct points for schema issues
    if (this.schemaValidation?.issues.length > 0) {
      score -= (this.schemaValidation.issues.length * 10);
    }
    
    return Math.max(0, score);
  }

  generateRecommendations() {
    const recommendations = [];
    
    // Health check recommendations
    this.healthChecks.forEach(check => {
      if (check.fix) {
        recommendations.push(check.fix);
      }
    });
    
    // Schema recommendations
    if (this.schemaValidation?.recommendations) {
      recommendations.push(...this.schemaValidation.recommendations);
    }
    
    // Performance recommendations
    if (this.performanceMetrics?.lastBackup === 'none') {
      recommendations.push('Set up automated database backups');
    }
    
    if (this.migrationStatus.length > 0) {
      recommendations.push('Run pending database migrations');
    }
    
    return [...new Set(recommendations)]; // Remove duplicates
  }

  generateMarkdownReport(report) {
    return `# 🗄️ Database Health Report

*Generated on ${new Date(report.timestamp).toLocaleString()}*

## 📊 Health Summary

- **Health Score**: ${report.summary.healthScore}/100
- **Total Checks**: ${report.summary.totalChecks}
- **Passed**: ${report.summary.checksPass} ✅
- **Warnings**: ${report.summary.checksWarn} ⚠️
- **Failures**: ${report.summary.checksFail} ❌
- **Migrations**: ${report.summary.migrationsCount}
- **Schema Valid**: ${report.summary.schemaValid ? 'Yes' : 'No'}

## 🏥 Health Checks

${report.details.healthChecks.map(check => {
  const icon = check.status === 'pass' ? '✅' : check.status === 'fail' ? '❌' : '⚠️';
  return `### ${check.type.toUpperCase()}
${icon} **${check.message}**
${check.fix ? `**Fix**: ${check.fix}` : ''}`;
}).join('\n\n')}

## 📋 Migration Status

${report.details.migrationStatus.length > 0 ? 
  report.details.migrationStatus.map(m => `- ${m.name}: ${m.status}`).join('\n') : 
  'No migrations found'}

## ⚡ Performance Metrics

- **Schema Size**: ${((report.details.performanceMetrics?.schemaSize || 0) / 1024).toFixed(1)}KB
- **Seed Data Size**: ${((report.details.performanceMetrics?.seedDataSize || 0) / 1024).toFixed(1)}KB
- **Migration Count**: ${report.details.performanceMetrics?.migrationCount || 0}
- **Last Backup**: ${report.details.performanceMetrics?.lastBackup || 'Unknown'}

## 🔍 Schema Validation

${report.details.schemaValidation ? `
**Score**: ${report.details.schemaValidation.score}/100

**Issues**: ${report.details.schemaValidation.issues.length}
${report.details.schemaValidation.issues.map(issue => `- ${issue}`).join('\n')}

**Recommendations**: ${report.details.schemaValidation.recommendations.length}
${report.details.schemaValidation.recommendations.map(rec => `- ${rec}`).join('\n')}
` : 'Schema validation not performed'}

## 💡 Action Items

${report.recommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n')}

---

*Run \`npm run db:health\` to regenerate this report*
`;
  }
}

// CLI interface
async function main() {
  const command = process.argv[2];

  switch (command) {
    case 'monitor':
    case 'health':
    case undefined:
      const manager = new DatabaseManager();
      await manager.monitor();
      break;
      
    case 'backup':
      console.log('💾 Creating database backup...');
      try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        execSync(`wrangler d1 backup create couple-connect-db --name="backup-${timestamp}"`);
        console.log('✅ Backup created successfully');
      } catch (error) {
        console.log('❌ Backup failed:', error.message);
      }
      break;
      
    case 'migrate':
      console.log('📋 Running database migrations...');
      try {
        execSync('npm run db:schema && npm run db:seed');
        console.log('✅ Migrations completed');
      } catch (error) {
        console.log('❌ Migration failed:', error.message);
      }
      break;
      
    case 'help':
      console.log(`
🗄️ Database Manager

Usage: node scripts/database-manager.js [command]

Commands:
  monitor     Run comprehensive database health check (default)
  health      Alias for monitor
  backup      Create database backup
  migrate     Run database migrations
  help        Show this help message

Examples:
  npm run db:health        # Health monitoring
  npm run db:backup        # Create backup
  npm run db:migrate       # Run migrations
      `);
      break;
      
    default:
      console.log(`Unknown command: ${command}`);
      console.log('Run with "help" for usage information');
      process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { DatabaseManager };
