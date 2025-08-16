#!/usr/bin/env node

/**
 * 🔍 Code Quality & Technical Debt Analyzer
 * 
 * Features:
 * - Code complexity analysis
 * - Technical debt detection
 * - Code duplication finder
 * - Performance anti-patterns
 * - TypeScript strict mode compliance
 * - React best practices validation
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { resolve, extname, relative } from 'path';
import { execSync } from 'child_process';

class CodeQualityAnalyzer {
  constructor() {
    this.srcDir = resolve('src');
    this.analysis = {
      files: [],
      summary: {
        totalFiles: 0,
        totalLines: 0,
        avgComplexity: 0,
        technicalDebtScore: 0,
        duplicateCodeBlocks: 0
      },
      issues: [],
      recommendations: []
    };
  }

  async analyze() {
    console.log('🔍 Starting comprehensive code quality analysis...\n');

    await this.scanFiles();
    await this.analyzeComplexity();
    await this.detectTechnicalDebt();
    await this.findCodeDuplication();
    await this.checkTypeScriptCompliance();
    await this.validateReactPatterns();
    await this.analyzeInfiniteLoopPatterns();
    
    this.generateQualityReport();
  }

  async scanFiles() {
    console.log('📁 Scanning source files...');
    
    const files = this.getAllFiles(this.srcDir)
      .filter(file => this.isSourceFile(file));
    
    this.analysis.summary.totalFiles = files.length;
    
    files.forEach(file => {
      const content = readFileSync(file, 'utf8');
      const lines = content.split('\n').length;
      const size = content.length;
      
      this.analysis.files.push({
        path: relative(process.cwd(), file),
        size,
        lines,
        extension: extname(file),
        content
      });
    });

    this.analysis.summary.totalLines = this.analysis.files.reduce((sum, file) => sum + file.lines, 0);
    
    console.log(`📊 Scanned ${files.length} files (${this.analysis.summary.totalLines.toLocaleString()} lines)`);
    console.log();
  }

  getAllFiles(dir, files = []) {
    const items = readdirSync(dir);
    
    for (const item of items) {
      const fullPath = resolve(dir, item);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory() && !this.shouldSkipDirectory(item)) {
        this.getAllFiles(fullPath, files);
      } else if (stat.isFile()) {
        files.push(fullPath);
      }
    }
    
    return files;
  }

  shouldSkipDirectory(dirname) {
    const skipDirs = ['node_modules', '.git', 'dist', 'build', '.next', 'coverage'];
    return skipDirs.includes(dirname);
  }

  isSourceFile(file) {
    const sourceExtensions = ['.ts', '.tsx', '.js', '.jsx'];
    return sourceExtensions.includes(extname(file));
  }

  async analyzeComplexity() {
    console.log('⚡ Analyzing code complexity...');
    
    let totalComplexity = 0;
    let complexFiles = 0;

    this.analysis.files.forEach(file => {
      const complexity = this.calculateComplexity(file.content);
      file.complexity = complexity;
      
      totalComplexity += complexity;
      
      if (complexity > 10) {
        complexFiles++;
        this.analysis.issues.push({
          type: 'complexity',
          severity: complexity > 20 ? 'high' : 'medium',
          file: file.path,
          message: `High cyclomatic complexity: ${complexity}`,
          fix: 'Consider breaking down into smaller functions'
        });
      }
    });

    this.analysis.summary.avgComplexity = Math.round(totalComplexity / this.analysis.files.length);
    
    console.log(`📊 Average complexity: ${this.analysis.summary.avgComplexity}`);
    console.log(`⚠️  High complexity files: ${complexFiles}`);
    console.log();
  }

  calculateComplexity(content) {
    // Simple cyclomatic complexity calculation
    let complexity = 1; // Base complexity
    
    const patterns = [
      /if\s*\(/g,           // if statements
      /else\s+if\s*\(/g,    // else if
      /while\s*\(/g,        // while loops
      /for\s*\(/g,          // for loops
      /switch\s*\(/g,       // switch statements
      /case\s+/g,           // case statements
      /catch\s*\(/g,        // catch blocks
      /&&/g,                // logical AND
      /\|\|/g,              // logical OR
      /\?/g,                // ternary operators
      /\.map\s*\(/g,        // array methods that increase complexity
      /\.filter\s*\(/g,
      /\.reduce\s*\(/g
    ];

    patterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        complexity += matches.length;
      }
    });

    return complexity;
  }

  async detectTechnicalDebt() {
    console.log('🔧 Detecting technical debt...');
    
    const debtPatterns = [
      { pattern: /TODO|FIXME|HACK|XXX/gi, type: 'comment-debt', severity: 'medium' },
      { pattern: /any/g, type: 'typescript-any', severity: 'high' },
      { pattern: /console\.log/g, type: 'debug-code', severity: 'low' },
      { pattern: /debugger/g, type: 'debug-code', severity: 'medium' },
      { pattern: /\.bind\(this\)/g, type: 'react-antipattern', severity: 'medium' },
      { pattern: /componentWillMount|componentWillReceiveProps/g, type: 'deprecated-lifecycle', severity: 'high' },
      { pattern: /dangerouslySetInnerHTML/g, type: 'security-risk', severity: 'high' },
      { pattern: /eval\(/g, type: 'security-risk', severity: 'critical' },
      { pattern: /\.innerHTML\s*=/g, type: 'security-risk', severity: 'medium' }
    ];

    let totalDebtScore = 0;

    this.analysis.files.forEach(file => {
      let fileDebtScore = 0;
      
      debtPatterns.forEach(({ pattern, type, severity }) => {
        const matches = file.content.match(pattern);
        if (matches) {
          const severityWeight = { low: 1, medium: 3, high: 5, critical: 10 };
          const score = matches.length * severityWeight[severity];
          fileDebtScore += score;
          
          this.analysis.issues.push({
            type: 'technical-debt',
            subtype: type,
            severity,
            file: file.path,
            count: matches.length,
            message: `${type.replace('-', ' ')}: ${matches.length} instances`,
            fix: this.getDebtFix(type)
          });
        }
      });
      
      file.debtScore = fileDebtScore;
      totalDebtScore += fileDebtScore;
    });

    this.analysis.summary.technicalDebtScore = totalDebtScore;
    
    console.log(`📊 Technical debt score: ${totalDebtScore}`);
    console.log(`⚠️  Debt issues found: ${this.analysis.issues.filter(i => i.type === 'technical-debt').length}`);
    console.log();
  }

  getDebtFix(type) {
    const fixes = {
      'comment-debt': 'Address TODO/FIXME comments or remove if no longer relevant',
      'typescript-any': 'Replace any types with specific type definitions',
      'debug-code': 'Remove debug statements before production',
      'react-antipattern': 'Use arrow functions or hooks instead of bind',
      'deprecated-lifecycle': 'Replace with modern lifecycle methods or hooks',
      'security-risk': 'Review for security implications and use safer alternatives'
    };
    
    return fixes[type] || 'Review and refactor this pattern';
  }

  async findCodeDuplication() {
    console.log('🔍 Finding code duplication...');
    
    const duplicates = [];
    const codeBlocks = new Map();
    
    this.analysis.files.forEach(file => {
      const lines = file.content.split('\n');
      
      // Check for duplicated blocks of 5+ lines
      for (let i = 0; i < lines.length - 4; i++) {
        const block = lines.slice(i, i + 5)
          .map(line => line.trim())
          .filter(line => line.length > 10) // Skip short lines
          .join('\n');
        
        if (block.length > 50) { // Only check substantial blocks
          const hash = this.hashCode(block);
          
          if (codeBlocks.has(hash)) {
            const existing = codeBlocks.get(hash);
            duplicates.push({
              block,
              files: [existing.file, file.path],
              lines: [existing.line, i + 1]
            });
          } else {
            codeBlocks.set(hash, { file: file.path, line: i + 1 });
          }
        }
      }
    });

    this.analysis.summary.duplicateCodeBlocks = duplicates.length;
    
    duplicates.forEach(dup => {
      this.analysis.issues.push({
        type: 'duplication',
        severity: 'medium',
        files: dup.files,
        message: `Duplicate code block found`,
        fix: 'Extract common code into a shared function or component'
      });
    });
    
    console.log(`📊 Duplicate code blocks: ${duplicates.length}`);
    console.log();
  }

  hashCode(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash;
  }

  async checkTypeScriptCompliance() {
    console.log('📝 Checking TypeScript compliance...');
    
    const tsFiles = this.analysis.files.filter(file => 
      file.extension === '.ts' || file.extension === '.tsx'
    );
    
    let nonCompliantFiles = 0;
    
    tsFiles.forEach(file => {
      const issues = this.checkTSFileCompliance(file.content);
      
      if (issues.length > 0) {
        nonCompliantFiles++;
        issues.forEach(issue => {
          this.analysis.issues.push({
            type: 'typescript-compliance',
            severity: issue.severity,
            file: file.path,
            message: issue.message,
            fix: issue.fix
          });
        });
      }
    });
    
    console.log(`📊 TypeScript files: ${tsFiles.length}`);
    console.log(`⚠️  Non-compliant files: ${nonCompliantFiles}`);
    console.log();
  }

  checkTSFileCompliance(content) {
    const issues = [];
    
    // Check for missing types
    if (content.match(/:\s*any[\s,\)\];]/g)) {
      issues.push({
        severity: 'high',
        message: 'Uses any type - reduces type safety',
        fix: 'Define specific types instead of any'
      });
    }
    
    // Check for @ts-ignore
    if (content.includes('@ts-ignore')) {
      issues.push({
        severity: 'medium',
        message: 'Uses @ts-ignore - suppresses type checking',
        fix: 'Fix type issues instead of suppressing them'
      });
    }
    
    // Check for missing return types on functions
    const functionMatches = content.match(/function\s+\w+\([^)]*\)\s*{/g);
    if (functionMatches && functionMatches.some(fn => !fn.includes(':'))) {
      issues.push({
        severity: 'low',
        message: 'Functions missing return type annotations',
        fix: 'Add explicit return types to functions'
      });
    }
    
    return issues;
  }

  async validateReactPatterns() {
    console.log('⚛️ Validating React patterns...');
    
    const reactFiles = this.analysis.files.filter(file => 
      file.extension === '.tsx' || file.extension === '.jsx' ||
      file.content.includes('react') || file.content.includes('React')
    );
    
    let patternIssues = 0;
    
    reactFiles.forEach(file => {
      const issues = this.checkReactPatterns(file.content);
      
      patternIssues += issues.length;
      issues.forEach(issue => {
        this.analysis.issues.push({
          type: 'react-patterns',
          severity: issue.severity,
          file: file.path,
          message: issue.message,
          fix: issue.fix
        });
      });
    });
    
    console.log(`📊 React files: ${reactFiles.length}`);
    console.log(`⚠️  Pattern issues: ${patternIssues}`);
    console.log();
  }

  checkReactPatterns(content) {
    const issues = [];
    
    // Check for missing key props in lists
    if (content.includes('.map(') && !content.includes('key=')) {
      issues.push({
        severity: 'medium',
        message: 'Missing key prop in list rendering',
        fix: 'Add unique key prop to list items'
      });
    }
    
    // Check for inline arrow functions in JSX
    if (content.match(/onClick={\([^}]*\) => [^}]*}/g)) {
      issues.push({
        severity: 'low',
        message: 'Inline arrow functions in JSX can cause re-renders',
        fix: 'Extract to useCallback or define outside render'
      });
    }
    
    // Check for useEffect without dependencies
    if (content.includes('useEffect(') && content.match(/useEffect\([^,]*\);/g)) {
      issues.push({
        severity: 'high',
        message: 'useEffect without dependency array runs on every render',
        fix: 'Add dependency array to useEffect'
      });
    }
    
    // Check for state setters in useEffect dependencies
    const useEffectMatches = content.match(/useEffect\([\s\S]*?\[[\s\S]*?\]/g);
    if (useEffectMatches) {
      useEffectMatches.forEach(effect => {
        if (effect.includes('set') && effect.match(/set\w+/g)) {
          issues.push({
            severity: 'critical',
            message: 'Potential infinite loop: state setter in useEffect dependencies',
            fix: 'Remove state setters from dependency array or use proper patterns'
          });
        }
      });
    }
    
    return issues;
  }

  async analyzeInfiniteLoopPatterns() {
    console.log('🔄 Analyzing infinite loop patterns...');
    
    try {
      // Use the existing infinite loop detection script
      const result = execSync('node scripts/check-infinite-loops.js --json', { encoding: 'utf8' });
      const loopAnalysis = JSON.parse(result);
      
      if (loopAnalysis.criticalIssues && loopAnalysis.criticalIssues.length > 0) {
        loopAnalysis.criticalIssues.forEach(issue => {
          this.analysis.issues.push({
            type: 'infinite-loop-risk',
            severity: 'critical',
            file: issue.file,
            line: issue.line,
            message: issue.message,
            fix: 'Review useEffect dependencies and avoid circular dependencies'
          });
        });
      }
      
      console.log(`✅ Infinite loop analysis complete`);
    } catch (error) {
      console.log('⚠️  Could not run infinite loop analysis');
    }
    
    console.log();
  }

  generateQualityReport() {
    // Calculate overall quality score
    const totalIssues = this.analysis.issues.length;
    const criticalIssues = this.analysis.issues.filter(i => i.severity === 'critical').length;
    const highIssues = this.analysis.issues.filter(i => i.severity === 'high').length;
    const mediumIssues = this.analysis.issues.filter(i => i.severity === 'medium').length;
    
    let qualityScore = 100;
    qualityScore -= (criticalIssues * 20);
    qualityScore -= (highIssues * 10);
    qualityScore -= (mediumIssues * 5);
    qualityScore = Math.max(0, qualityScore);

    // Generate recommendations
    this.generateRecommendations();

    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        ...this.analysis.summary,
        qualityScore,
        totalIssues,
        criticalIssues,
        highIssues,
        mediumIssues,
        lowIssues: this.analysis.issues.filter(i => i.severity === 'low').length
      },
      details: {
        files: this.analysis.files.map(f => ({
          path: f.path,
          lines: f.lines,
          size: f.size,
          complexity: f.complexity,
          debtScore: f.debtScore
        })),
        issues: this.analysis.issues,
        recommendations: this.analysis.recommendations
      }
    };

    // Save reports
    writeFileSync('code-quality-report.json', JSON.stringify(report, null, 2));
    
    const markdown = this.generateMarkdownReport(report);
    writeFileSync('CODE_QUALITY_REPORT.md', markdown);

    // Print summary
    console.log('📊 CODE QUALITY SUMMARY');
    console.log('========================');
    console.log(`🎯 Quality Score: ${qualityScore}/100`);
    console.log(`📁 Files Analyzed: ${report.summary.totalFiles}`);
    console.log(`📏 Total Lines: ${report.summary.totalLines.toLocaleString()}`);
    console.log(`⚡ Avg Complexity: ${report.summary.avgComplexity}`);
    console.log(`🔧 Tech Debt Score: ${report.summary.technicalDebtScore}`);
    console.log(`📋 Total Issues: ${totalIssues}`);
    console.log(`  - Critical: ${criticalIssues}`);
    console.log(`  - High: ${highIssues}`);
    console.log(`  - Medium: ${mediumIssues}`);

    if (this.analysis.recommendations.length > 0) {
      console.log('\n💡 Top Recommendations:');
      this.analysis.recommendations.slice(0, 3).forEach((rec, i) => {
        console.log(`${i + 1}. ${rec}`);
      });
    }

    console.log('\n📄 Reports generated:');
    console.log('   - code-quality-report.json');
    console.log('   - CODE_QUALITY_REPORT.md');
    console.log('\n✅ Code quality analysis complete!');
  }

  generateRecommendations() {
    const recommendations = [];
    
    const issuesByType = this.analysis.issues.reduce((acc, issue) => {
      acc[issue.type] = (acc[issue.type] || 0) + 1;
      return acc;
    }, {});

    // Priority recommendations based on issue frequency
    if (issuesByType['infinite-loop-risk'] > 0) {
      recommendations.push('🚨 CRITICAL: Fix infinite loop risks immediately to prevent blank screens');
    }
    
    if (issuesByType['complexity'] > 3) {
      recommendations.push('Reduce code complexity by breaking down large functions');
    }
    
    if (issuesByType['technical-debt'] > 5) {
      recommendations.push('Address technical debt to improve maintainability');
    }
    
    if (issuesByType['duplication'] > 2) {
      recommendations.push('Extract duplicate code into reusable components/functions');
    }
    
    if (issuesByType['typescript-compliance'] > 0) {
      recommendations.push('Improve TypeScript strict mode compliance');
    }
    
    if (issuesByType['react-patterns'] > 0) {
      recommendations.push('Follow React best practices for better performance');
    }
    
    // General recommendations
    recommendations.push('Set up automated code quality checks in CI/CD');
    recommendations.push('Consider implementing code review guidelines');
    recommendations.push('Regular code quality monitoring schedule');
    
    this.analysis.recommendations = recommendations;
  }

  generateMarkdownReport(report) {
    return `# 🔍 Code Quality Analysis Report

*Generated on ${new Date(report.timestamp).toLocaleString()}*

## 📊 Quality Overview

- **Quality Score**: ${report.summary.qualityScore}/100
- **Files Analyzed**: ${report.summary.totalFiles}
- **Total Lines**: ${report.summary.totalLines.toLocaleString()}
- **Average Complexity**: ${report.summary.avgComplexity}
- **Technical Debt Score**: ${report.summary.technicalDebtScore}
- **Duplicate Code Blocks**: ${report.summary.duplicateCodeBlocks}

## 🚨 Issues Summary

| Severity | Count |
|----------|-------|
| Critical | ${report.summary.criticalIssues} |
| High | ${report.summary.highIssues} |
| Medium | ${report.summary.mediumIssues} |
| Low | ${report.summary.lowIssues} |
| **Total** | **${report.summary.totalIssues}** |

## 🎯 Top Issues by Type

${Object.entries(
  report.details.issues.reduce((acc, issue) => {
    acc[issue.type] = (acc[issue.type] || 0) + 1;
    return acc;
  }, {})
).sort(([,a], [,b]) => b - a).slice(0, 5).map(([type, count]) => 
  `- **${type.replace('-', ' ')}**: ${count} issues`
).join('\n')}

## 💡 Recommendations

${report.details.recommendations.map((rec, i) => `${i + 1}. ${rec}`).join('\n')}

## 📁 File Analysis

### Most Complex Files

${report.details.files
  .sort((a, b) => (b.complexity || 0) - (a.complexity || 0))
  .slice(0, 5)
  .map(file => `- **${file.path}**: Complexity ${file.complexity}, ${file.lines} lines`)
  .join('\n')}

### Highest Technical Debt

${report.details.files
  .sort((a, b) => (b.debtScore || 0) - (a.debtScore || 0))
  .slice(0, 5)
  .map(file => `- **${file.path}**: Debt Score ${file.debtScore}`)
  .join('\n')}

## 🔧 Critical Issues Requiring Immediate Attention

${report.details.issues
  .filter(issue => issue.severity === 'critical')
  .map(issue => `
### ${issue.file}
**Issue**: ${issue.message}
**Fix**: ${issue.fix}
`).join('')}

---

*Run \`npm run quality:analyze\` to regenerate this report*
`;
  }
}

// CLI interface
async function main() {
  const command = process.argv[2];

  switch (command) {
    case 'analyze':
    case undefined:
      const analyzer = new CodeQualityAnalyzer();
      await analyzer.analyze();
      break;
      
    case 'complexity':
      console.log('⚡ Running complexity analysis only...');
      const complexityAnalyzer = new CodeQualityAnalyzer();
      await complexityAnalyzer.scanFiles();
      await complexityAnalyzer.analyzeComplexity();
      console.log('✅ Complexity analysis complete');
      break;
      
    case 'debt':
      console.log('🔧 Running technical debt analysis only...');
      const debtAnalyzer = new CodeQualityAnalyzer();
      await debtAnalyzer.scanFiles();
      await debtAnalyzer.detectTechnicalDebt();
      console.log('✅ Technical debt analysis complete');
      break;
      
    case 'help':
      console.log(`
🔍 Code Quality Analyzer

Usage: node scripts/code-quality-analyzer.js [command]

Commands:
  analyze      Run comprehensive code quality analysis (default)
  complexity   Run complexity analysis only
  debt         Run technical debt analysis only
  help         Show this help message

Examples:
  npm run quality:analyze     # Full analysis
  npm run quality:complexity  # Complexity only
  npm run quality:debt        # Technical debt only
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

export { CodeQualityAnalyzer };
