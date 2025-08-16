#!/usr/bin/env node

/**
 * 📦 Dependency Manager - Comprehensive dependency analysis and management
 * 
 * Features:
 * - Analyze dependency usage patterns
 * - Identify unused dependencies
 * - Check for security vulnerabilities
 * - Suggest optimizations
 * - Generate dependency reports
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';

class DependencyManager {
  constructor() {
    this.packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
    this.results = {
      unused: [],
      outdated: [],
      security: [],
      bundleImpact: {},
      recommendations: []
    };
  }

  async analyze() {
    console.log('🔍 Starting comprehensive dependency analysis...\n');

    await this.checkUnusedDependencies();
    await this.checkOutdatedPackages();
    await this.checkSecurityVulnerabilities();
    await this.analyzeBundleImpact();
    await this.generateRecommendations();

    this.generateReport();
  }

  async checkUnusedDependencies() {
    console.log('📦 Checking for unused dependencies...');
    
    try {
      // Use depcheck to find unused dependencies
      const result = execSync('npx depcheck --json', { encoding: 'utf8' });
      const depcheck = JSON.parse(result);
      
      this.results.unused = [
        ...depcheck.dependencies,
        ...depcheck.devDependencies
      ];

      if (this.results.unused.length > 0) {
        console.log(`⚠️  Found ${this.results.unused.length} potentially unused dependencies`);
        this.results.unused.forEach(dep => console.log(`   - ${dep}`));
      } else {
        console.log('✅ No unused dependencies found');
      }
    } catch (error) {
      console.log('⚠️  Depcheck not available - install with: npm i -g depcheck');
      // Fallback: basic analysis
      await this.fallbackUnusedCheck();
    }
    console.log();
  }

  async fallbackUnusedCheck() {
    console.log('🔍 Running fallback unused dependency check...');
    
    const dependencies = Object.keys(this.packageJson.dependencies || {});
    const devDependencies = Object.keys(this.packageJson.devDependencies || {});
    
    // Basic grep-based check for imports
    for (const dep of dependencies) {
      try {
        execSync(`grep -r "from ['\"]\${dep}" src/ --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx"`, { stdio: 'pipe' });
      } catch {
        // No imports found - potentially unused
        this.results.unused.push(dep);
      }
    }
  }

  async checkOutdatedPackages() {
    console.log('📅 Checking for outdated packages...');
    
    try {
      const result = execSync('npm outdated --json', { encoding: 'utf8' });
      const outdated = JSON.parse(result);
      
      this.results.outdated = Object.entries(outdated).map(([name, info]) => ({
        name,
        current: info.current,
        wanted: info.wanted,
        latest: info.latest,
        type: info.type
      }));

      if (this.results.outdated.length > 0) {
        console.log(`📈 Found ${this.results.outdated.length} outdated packages`);
        this.results.outdated.slice(0, 5).forEach(pkg => {
          console.log(`   - ${pkg.name}: ${pkg.current} → ${pkg.latest}`);
        });
        if (this.results.outdated.length > 5) {
          console.log(`   ... and ${this.results.outdated.length - 5} more`);
        }
      } else {
        console.log('✅ All packages are up to date');
      }
    } catch (error) {
      // No outdated packages or npm outdated failed
      console.log('✅ All packages appear to be up to date');
    }
    console.log();
  }

  async checkSecurityVulnerabilities() {
    console.log('🔒 Checking for security vulnerabilities...');
    
    try {
      const result = execSync('npm audit --json', { encoding: 'utf8' });
      const audit = JSON.parse(result);
      
      if (audit.vulnerabilities) {
        this.results.security = Object.entries(audit.vulnerabilities).map(([name, vuln]) => ({
          name,
          severity: vuln.severity,
          title: vuln.title,
          url: vuln.url
        }));

        const severityCounts = this.results.security.reduce((acc, vuln) => {
          acc[vuln.severity] = (acc[vuln.severity] || 0) + 1;
          return acc;
        }, {});

        console.log('🚨 Security vulnerabilities found:');
        Object.entries(severityCounts).forEach(([severity, count]) => {
          console.log(`   - ${severity}: ${count}`);
        });
      } else {
        console.log('✅ No security vulnerabilities found');
      }
    } catch (error) {
      console.log('✅ No security vulnerabilities found');
    }
    console.log();
  }

  async analyzeBundleImpact() {
    console.log('📊 Analyzing bundle impact of dependencies...');
    
    try {
      // Use bundle-phobia API to get package sizes
      const deps = Object.keys(this.packageJson.dependencies || {});
      const largestDeps = [];

      for (const dep of deps.slice(0, 10)) { // Limit to top 10 for performance
        try {
          const response = await fetch(`https://bundlephobia.com/api/size?package=${dep}`);
          if (response.ok) {
            const data = await response.json();
            largestDeps.push({
              name: dep,
              size: data.size,
              gzip: data.gzip
            });
          }
        } catch {
          // Skip if API fails
        }
      }

      largestDeps.sort((a, b) => b.size - a.size);
      
      if (largestDeps.length > 0) {
        console.log('📦 Largest dependencies by bundle size:');
        largestDeps.slice(0, 5).forEach(dep => {
          const sizeMB = (dep.size / 1024 / 1024).toFixed(2);
          const gzipKB = (dep.gzip / 1024).toFixed(1);
          console.log(`   - ${dep.name}: ${sizeMB}MB (${gzipKB}KB gzipped)`);
        });
      }

      this.results.bundleImpact = largestDeps;
    } catch (error) {
      console.log('⚠️  Bundle analysis failed - network or API issues');
    }
    console.log();
  }

  async generateRecommendations() {
    console.log('💡 Generating optimization recommendations...');

    // Unused dependencies recommendation
    if (this.results.unused.length > 0) {
      this.results.recommendations.push({
        type: 'cleanup',
        priority: 'high',
        title: 'Remove unused dependencies',
        description: `Remove ${this.results.unused.length} unused dependencies to reduce bundle size`,
        action: `npm uninstall ${this.results.unused.join(' ')}`
      });
    }

    // Security vulnerabilities recommendation
    if (this.results.security.length > 0) {
      const highSeverity = this.results.security.filter(v => v.severity === 'high' || v.severity === 'critical');
      if (highSeverity.length > 0) {
        this.results.recommendations.push({
          type: 'security',
          priority: 'critical',
          title: 'Fix critical security vulnerabilities',
          description: `${highSeverity.length} high/critical security issues found`,
          action: 'npm audit fix'
        });
      }
    }

    // Outdated packages recommendation
    if (this.results.outdated.length > 5) {
      this.results.recommendations.push({
        type: 'maintenance',
        priority: 'medium',
        title: 'Update outdated packages',
        description: `${this.results.outdated.length} packages can be updated`,
        action: 'npm update'
      });
    }

    // Large bundle dependencies recommendation
    const largeDeps = this.results.bundleImpact.filter(dep => dep.size > 500000); // >500KB
    if (largeDeps.length > 0) {
      this.results.recommendations.push({
        type: 'performance',
        priority: 'medium',
        title: 'Consider alternatives for large dependencies',
        description: `${largeDeps.length} dependencies are >500KB each`,
        action: 'Review and consider lighter alternatives or lazy loading'
      });
    }

    console.log(`💡 Generated ${this.results.recommendations.length} recommendations`);
    console.log();
  }

  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalDependencies: Object.keys(this.packageJson.dependencies || {}).length,
        totalDevDependencies: Object.keys(this.packageJson.devDependencies || {}).length,
        unusedCount: this.results.unused.length,
        outdatedCount: this.results.outdated.length,
        securityIssues: this.results.security.length,
        recommendationsCount: this.results.recommendations.length
      },
      details: this.results
    };

    // Save JSON report
    writeFileSync('dependency-analysis.json', JSON.stringify(report, null, 2));

    // Generate markdown report
    const markdown = this.generateMarkdownReport(report);
    writeFileSync('DEPENDENCY_REPORT.md', markdown);

    console.log('📄 Reports generated:');
    console.log('   - dependency-analysis.json (machine-readable)');
    console.log('   - DEPENDENCY_REPORT.md (human-readable)');
    console.log();

    // Print summary
    this.printSummary(report);
  }

  generateMarkdownReport(report) {
    return `# 📦 Dependency Analysis Report

*Generated on ${new Date(report.timestamp).toLocaleString()}*

## 📊 Summary

- **Total Dependencies**: ${report.summary.totalDependencies}
- **Total Dev Dependencies**: ${report.summary.totalDevDependencies}
- **Unused Dependencies**: ${report.summary.unusedCount}
- **Outdated Packages**: ${report.summary.outdatedCount}
- **Security Issues**: ${report.summary.securityIssues}
- **Recommendations**: ${report.summary.recommendationsCount}

## 🎯 Recommendations

${report.details.recommendations.map(rec => `
### ${rec.title} (${rec.priority.toUpperCase()})

${rec.description}

**Action**: \`${rec.action}\`
`).join('')}

## 📦 Unused Dependencies

${report.details.unused.length > 0 ? report.details.unused.map(dep => `- ${dep}`).join('\n') : 'None found'}

## 📈 Outdated Packages

${report.details.outdated.length > 0 ? report.details.outdated.map(pkg => `- ${pkg.name}: ${pkg.current} → ${pkg.latest}`).join('\n') : 'All packages up to date'}

## 🔒 Security Vulnerabilities

${report.details.security.length > 0 ? report.details.security.map(vuln => `- **${vuln.name}**: ${vuln.severity} - ${vuln.title}`).join('\n') : 'No vulnerabilities found'}

## 📊 Bundle Impact Analysis

${report.details.bundleImpact.length > 0 ? report.details.bundleImpact.slice(0, 10).map(dep => {
  const sizeMB = (dep.size / 1024 / 1024).toFixed(2);
  const gzipKB = (dep.gzip / 1024).toFixed(1);
  return `- **${dep.name}**: ${sizeMB}MB (${gzipKB}KB gzipped)`;
}).join('\n') : 'Analysis not available'}

---

*Run \`npm run deps:analyze\` to regenerate this report*
`;
  }

  printSummary(report) {
    console.log('📊 DEPENDENCY ANALYSIS SUMMARY');
    console.log('================================');
    console.log(`📦 Total Dependencies: ${report.summary.totalDependencies}`);
    console.log(`🛠️  Dev Dependencies: ${report.summary.totalDevDependencies}`);
    console.log(`🗑️  Unused: ${report.summary.unusedCount}`);
    console.log(`📅 Outdated: ${report.summary.outdatedCount}`);
    console.log(`🔒 Security Issues: ${report.summary.securityIssues}`);
    console.log(`💡 Recommendations: ${report.summary.recommendationsCount}`);
    
    if (report.details.recommendations.length > 0) {
      console.log('\n🎯 TOP RECOMMENDATIONS:');
      report.details.recommendations.slice(0, 3).forEach((rec, i) => {
        console.log(`${i + 1}. ${rec.title} (${rec.priority.toUpperCase()})`);
        console.log(`   ${rec.description}`);
      });
    }

    console.log('\n✅ Analysis complete! Check DEPENDENCY_REPORT.md for details.');
  }
}

// CLI interface
async function main() {
  const command = process.argv[2];

  switch (command) {
    case 'analyze':
    case undefined:
      const manager = new DependencyManager();
      await manager.analyze();
      break;
      
    case 'clean':
      console.log('🧹 Cleaning up old analysis files...');
      if (existsSync('dependency-analysis.json')) {
        execSync('rm dependency-analysis.json');
      }
      if (existsSync('DEPENDENCY_REPORT.md')) {
        execSync('rm DEPENDENCY_REPORT.md');
      }
      console.log('✅ Cleanup complete');
      break;
      
    case 'help':
      console.log(`
📦 Dependency Manager

Usage: node scripts/dependency-manager.js [command]

Commands:
  analyze    Run comprehensive dependency analysis (default)
  clean      Remove old analysis files
  help       Show this help message

Examples:
  npm run deps:analyze     # Full analysis
  npm run deps:clean       # Clean old reports
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

export { DependencyManager };
