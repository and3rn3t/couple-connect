#!/usr/bin/env node

/**
 * Infinite Re-render Loop Detection Script
 *
 * This script scans the codebase for potential infinite re-render loops
 * based on the patterns identified in the August 16, 2025 incident.
 *
 * Patterns it detects:
 * 1. useEffect with state setters in dependency array
 * 2. useEffect modifying state that's in its dependencies
 * 3. Missing dependency array when state setters are used
 * 4. Function dependencies that might cause re-renders
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class InfiniteLoopDetector {
  constructor() {
    this.issues = [];
    this.warnings = [];
    this.scannedFiles = 0;
    this.srcDir = path.join(process.cwd(), 'src');
  }

  // Main scanning function
  scan() {
    console.log('🔍 Scanning for infinite re-render loop patterns...');
    console.log('📁 Scanning directory:', this.srcDir);

    this.scanDirectory(this.srcDir);

    console.log(`\n📊 Scan Complete: ${this.scannedFiles} files scanned`);
    this.reportResults();

    return this.issues.length === 0;
  }

  // Recursively scan directories
  scanDirectory(dir) {
    if (!fs.existsSync(dir)) {
      console.warn(`⚠️ Directory does not exist: ${dir}`);
      return;
    }

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        // Skip node_modules and other non-source directories
        if (!this.shouldSkipDirectory(entry.name)) {
          this.scanDirectory(fullPath);
        }
      } else if (this.isReactFile(entry.name)) {
        this.scanFile(fullPath);
      }
    }
  }

  // Check if directory should be skipped
  shouldSkipDirectory(dirName) {
    const skipDirs = [
      'node_modules',
      '.git',
      'dist',
      'build',
      '.next',
      '__tests__',
      'test-results',
    ];
    return skipDirs.includes(dirName);
  }

  // Check if file is a React file
  isReactFile(filename) {
    return /\.(tsx?|jsx?)$/.test(filename);
  }

  // Scan individual file for patterns
  scanFile(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const relativePath = path.relative(process.cwd(), filePath);

      this.scannedFiles++;

      // Check for useEffect patterns
      this.checkUseEffectPatterns(content, relativePath);

      // Check for useState patterns
      this.checkUseStatePatterns(content, relativePath);

      // Check for useCallback/useMemo patterns
      this.checkMemoizationPatterns(content, relativePath);
    } catch (error) {
      console.warn(`⚠️ Could not read file: ${filePath}`, error.message);
    }
  }

  // Check useEffect patterns for infinite loops
  checkUseEffectPatterns(content, filePath) {
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = i + 1;

      // Find useEffect declarations
      if (line.match(/useEffect\s*\(/)) {
        const effectBlock = this.extractUseEffectBlock(lines, i);
        this.analyzeUseEffect(effectBlock, filePath, lineNum);
      }
    }
  }

  // Extract the complete useEffect block
  extractUseEffectBlock(lines, startIndex) {
    let braceCount = 0;
    let inEffect = false;
    let endIndex = startIndex;

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i];

      if (line.includes('useEffect')) {
        inEffect = true;
      }

      if (inEffect) {
        braceCount += (line.match(/\{/g) || []).length;
        braceCount -= (line.match(/\}/g) || []).length;

        if (braceCount === 0 && line.includes('}')) {
          endIndex = i;
          break;
        }
      }
    }

    return {
      content: lines.slice(startIndex, endIndex + 1).join('\n'),
      startLine: startIndex + 1,
      endLine: endIndex + 1,
    };
  }

  // Analyze useEffect for potential issues
  analyzeUseEffect(effectBlock, filePath, lineNum) {
    const { content, startLine, endLine } = effectBlock;

    // Extract dependency array
    const depsMatch = content.match(/\}\s*,\s*\[(.*?)\]\s*\)\s*;?\s*$/s);
    const deps = depsMatch ? depsMatch[1].trim() : null;

    // Check for missing dependency array with state setters
    if (!content.includes('], ') && !content.includes('[]') && !content.includes('}, [')) {
      if (content.match(/set[A-Z]\w+\(/)) {
        this.addIssue(
          'CRITICAL',
          filePath,
          startLine,
          endLine,
          'useEffect with state setters missing dependency array',
          'Add empty dependency array [] if this should run only once, or include proper dependencies'
        );
      }
    }

    // Check for state setters in dependency array
    if (deps) {
      const stateSetters = content.match(/set[A-Z]\w+/g) || [];
      const depsList = deps.split(',').map((d) => d.trim());

      for (const setter of stateSetters) {
        const stateName = setter.replace('set', '').toLowerCase();
        // Check for exact match to avoid false positives like "userId" matching "user"
        if (depsList.some((dep) => dep.toLowerCase() === stateName)) {
          this.addIssue(
            'CRITICAL',
            filePath,
            startLine,
            endLine,
            `Potential infinite loop: ${setter} modifies state that's in dependency array`,
            'Remove the state from dependencies or use empty array [] for one-time effects'
          );
        }
      }
    }

    // Check for function dependencies that might cause re-renders
    if (deps) {
      const functionDeps = deps.match(/\b\w+(?=\s*[,\]])/g) || [];
      for (const dep of functionDeps) {
        if (dep.match(/^[a-z]/)) {
          // camelCase functions
          this.addWarning(
            'WARNING',
            filePath,
            startLine,
            endLine,
            `Function dependency "${dep}" might cause re-renders`,
            'Consider wrapping in useCallback or removing from dependencies if not needed'
          );
        }
      }
    }

    // Check for complex state updates in effects
    if (content.includes('setState') || content.includes('set')) {
      const conditionalUpdates = content.match(/if\s*\([^)]*\)\s*{[^}]*set[A-Z]/g);
      if (conditionalUpdates && !deps) {
        this.addWarning(
          'WARNING',
          filePath,
          startLine,
          endLine,
          'Conditional state updates without dependency array',
          'Ensure this effect should run on every render or add proper dependencies'
        );
      }
    }
  }

  // Check useState patterns
  checkUseStatePatterns(content, filePath) {
    // Check for useState in render functions (outside of components)
    const lines = content.split('\n');
    let inRenderFunction = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = i + 1;

      // Simple check for useState outside component functions
      if (line.includes('useState') && !this.isInComponentFunction(lines, i)) {
        this.addWarning(
          'WARNING',
          filePath,
          lineNum,
          lineNum,
          'useState outside component function',
          'Ensure useState is only called inside React components'
        );
      }
    }
  }

  // Check for memoization patterns
  checkMemoizationPatterns(content, filePath) {
    // Check for missing useCallback on functions passed to useEffect deps
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = i + 1;

      // Look for function declarations that might need useCallback
      if (line.match(/const\s+\w+\s*=\s*\([^)]*\)\s*=>/)) {
        const functionName = line.match(/const\s+(\w+)/)?.[1];
        if (functionName) {
          // Check if this function is used in useEffect dependencies
          const useEffectWithThisFunction =
            content.includes(`[${functionName}]`) ||
            content.includes(`, ${functionName}]`) ||
            content.includes(`[${functionName},`);

          if (useEffectWithThisFunction && !content.includes(`useCallback`)) {
            this.addWarning(
              'WARNING',
              filePath,
              lineNum,
              lineNum,
              `Function "${functionName}" used in useEffect deps without useCallback`,
              'Consider wrapping in useCallback to prevent unnecessary re-renders'
            );
          }
        }
      }
    }
  }

  // Simple check if useState is in a component function
  isInComponentFunction(lines, currentIndex) {
    // Look backwards for function/component declaration
    for (let i = currentIndex; i >= 0; i--) {
      const line = lines[i];
      if (line.match(/^(export\s+)?(const|function)\s+[A-Z]/)) {
        return true; // Component function found
      }
      if (line.match(/^(export\s+)?(const|function)\s+[a-z]/)) {
        return false; // Regular function found
      }
    }
    return true; // Default to true if unclear
  }

  // Add critical issue
  addIssue(level, filePath, startLine, endLine, message, suggestion) {
    this.issues.push({
      level,
      filePath,
      startLine,
      endLine,
      message,
      suggestion,
    });
  }

  // Add warning
  addWarning(level, filePath, startLine, endLine, message, suggestion) {
    this.warnings.push({
      level,
      filePath,
      startLine,
      endLine,
      message,
      suggestion,
    });
  }

  // Report results
  reportResults() {
    console.log('\n' + '='.repeat(60));

    if (this.issues.length === 0 && this.warnings.length === 0) {
      console.log('✅ No infinite re-render patterns detected!');
      return;
    }

    if (this.issues.length > 0) {
      console.log(`\n🚨 CRITICAL ISSUES FOUND: ${this.issues.length}`);
      console.log('These patterns are likely to cause infinite re-render loops:\n');

      this.issues.forEach((issue, index) => {
        console.log(`${index + 1}. 📁 ${issue.filePath}:${issue.startLine}-${issue.endLine}`);
        console.log(`   ❌ ${issue.message}`);
        console.log(`   💡 ${issue.suggestion}\n`);
      });
    }

    if (this.warnings.length > 0) {
      console.log(`\n⚠️  WARNINGS: ${this.warnings.length}`);
      console.log('These patterns might cause performance issues:\n');

      this.warnings.forEach((warning, index) => {
        console.log(`${index + 1}. 📁 ${warning.filePath}:${warning.startLine}-${warning.endLine}`);
        console.log(`   ⚠️  ${warning.message}`);
        console.log(`   💡 ${warning.suggestion}\n`);
      });
    }

    // Summary
    console.log('='.repeat(60));
    console.log('📊 SUMMARY:');
    console.log(`   Files scanned: ${this.scannedFiles}`);
    console.log(`   Critical issues: ${this.issues.length}`);
    console.log(`   Warnings: ${this.warnings.length}`);

    if (this.issues.length > 0) {
      console.log('\n❌ DEPLOYMENT BLOCKED: Critical infinite loop patterns detected!');
      console.log('   Fix these issues before deploying to prevent blank screens.');
    } else {
      console.log('\n✅ Safe to deploy: No critical infinite loop patterns found');
    }
  }
}

// Main execution
const detector = new InfiniteLoopDetector();
const isClean = detector.scan();

// Exit with error code if critical issues found
process.exit(isClean ? 0 : 1);
