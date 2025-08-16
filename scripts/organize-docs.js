#!/usr/bin/env node

/**
 * 📁 Documentation Organization Helper Script (Node.js)
 * Cross-platform documentation structure analysis and management
 */

import { readFileSync, writeFileSync, existsSync, readdirSync, statSync, mkdirSync } from 'node:fs';
import { join, resolve, relative, dirname, extname, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class DocumentationOrganizer {
  constructor() {
    this.action = 'check';
    this.path = 'docs';
    this.parseArgs();
  }

  parseArgs() {
    const args = process.argv.slice(2);

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];

      if (arg === '--action' || arg === '-a') {
        this.action = args[i + 1];
        i++;
      } else if (arg === '--path' || arg === '-p') {
        this.path = args[i + 1];
        i++;
      } else if (arg === '--help' || arg === '-h') {
        this.showHelp();
        process.exit(0);
      } else if (!arg.startsWith('-')) {
        // Support positional arguments like PowerShell
        this.action = arg;
      }
    }
  }

  // Logging utilities with colors
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

  // Recursively get all files in a directory
  getAllFiles(dir, extension = '') {
    let files = [];

    if (!existsSync(dir)) {
      return files;
    }

    const items = readdirSync(dir);

    for (const item of items) {
      const fullPath = join(dir, item);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        files = files.concat(this.getAllFiles(fullPath, extension));
      } else if (!extension || extname(item) === extension) {
        files.push(fullPath);
      }
    }

    return files;
  }

  // Get all directories in a path
  getAllDirectories(dir) {
    let dirs = [];

    if (!existsSync(dir)) {
      return dirs;
    }

    const items = readdirSync(dir);

    for (const item of items) {
      const fullPath = join(dir, item);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        dirs.push(fullPath);
        dirs = dirs.concat(this.getAllDirectories(fullPath));
      }
    }

    return dirs.sort();
  }

  checkDocumentationStructure() {
    this.writeHeader('Documentation Structure Analysis');

    if (!existsSync(this.path)) {
      this.writeWarning(`Documentation folder '${this.path}' not found!`);
      return;
    }

    this.writeInfo('Analyzing folder structure...');

    // Get root markdown files
    const rootFiles = readdirSync(this.path).filter((file) => extname(file) === '.md').length;

    console.log(`\n📊 Documentation Statistics:`);
    console.log(`Root markdown files: ${rootFiles}`);

    // Analyze subdirectories
    const directories = this.getAllDirectories(this.path);

    for (const dir of directories) {
      const markdownFiles = readdirSync(dir).filter((file) => extname(file) === '.md').length;

      const relativePath = relative(process.cwd(), dir);

      if (markdownFiles > 10) {
        this.writeWarning(`${relativePath} has ${markdownFiles} files (consider reorganizing)`);
      } else if (markdownFiles === 0) {
        this.writeInfo(`${relativePath} is empty (consider removing or adding content)`);
      } else {
        this.writeSuccess(`${relativePath} has ${markdownFiles} files (well organized)`);
      }
    }

    // Check for potential reorganization opportunities
    console.log(`\n🔍 Checking for potential reorganization opportunities:`);

    const allMarkdownFiles = this.getAllFiles(this.path, '.md');
    const patterns = {
      database: [],
      api: [],
      user: [],
      setup: [],
      deployment: [],
    };

    for (const file of allMarkdownFiles) {
      const fileName = basename(file).toLowerCase();

      for (const pattern of Object.keys(patterns)) {
        if (fileName.includes(pattern)) {
          patterns[pattern].push(relative(process.cwd(), file));
        }
      }
    }

    for (const [pattern, files] of Object.entries(patterns)) {
      if (files.length > 1) {
        this.writeInfo(`Found ${files.length} ${pattern}-related files:`);
        for (const file of files) {
          console.log(`  - ${file}`);
        }
        console.log(`  Consider organizing in docs/${pattern}/ folder`);
      }
    }
  }

  validateDocumentationLinks() {
    this.writeHeader('Validating Documentation Links');

    const allMarkdownFiles = this.getAllFiles(this.path, '.md');
    const brokenLinks = [];

    for (const file of allMarkdownFiles) {
      try {
        const content = readFileSync(file, 'utf8');
        const linkRegex = /\[([^\]]*)\]\(([^)]+)\)/g;
        let match;

        while ((match = linkRegex.exec(content)) !== null) {
          const [, linkText, linkPath] = match;

          // Skip external links and anchors
          if (linkPath.startsWith('http') || linkPath.startsWith('#')) {
            continue;
          }

          // Convert relative path to absolute
          const absolutePath = resolve(dirname(file), linkPath);

          if (!existsSync(absolutePath)) {
            brokenLinks.push({
              file: relative(process.cwd(), file),
              link: linkPath,
              text: linkText,
            });
          }
        }
      } catch (error) {
        this.writeWarning(`Error reading file ${file}: ${error.message}`);
      }
    }

    if (brokenLinks.length === 0) {
      this.writeSuccess('All links are valid!');
    } else {
      this.writeWarning(`Found ${brokenLinks.length} broken links:`);
      for (const broken of brokenLinks) {
        console.log(`  📄 ${broken.file}`);
        console.log(`    ❌ "${broken.text}" -> ${broken.link}`);
      }
    }

    return brokenLinks.length === 0;
  }

  createDocumentationTemplate(fileName, category = 'development') {
    this.writeHeader('Creating Documentation Template');

    if (!fileName) {
      console.error('❌ Error: File name is required');
      process.exit(1);
    }

    // Ensure .md extension
    if (!fileName.endsWith('.md')) {
      fileName += '.md';
    }

    // Create category directory if it doesn't exist
    const categoryPath = join(this.path, category);
    if (!existsSync(categoryPath)) {
      mkdirSync(categoryPath, { recursive: true });
      this.writeInfo(`Created directory: ${categoryPath}`);
    }

    const filePath = join(categoryPath, fileName);

    if (existsSync(filePath)) {
      this.writeWarning(`File already exists: ${filePath}`);
      return;
    }

    const template = this.generateTemplate(fileName, category);

    try {
      writeFileSync(filePath, template);
      this.writeSuccess(`Created template: ${relative(process.cwd(), filePath)}`);

      console.log('\n📝 Template Contents:');
      console.log('-------------------');
      console.log(template);
    } catch (error) {
      console.error(`❌ Error creating file: ${error.message}`);
      process.exit(1);
    }
  }

  generateTemplate(fileName, category) {
    const title = basename(fileName, '.md')
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (l) => l.toUpperCase());

    const date = new Date().toISOString().split('T')[0];

    return `# ${title}

## 📋 Overview

Brief description of what this document covers.

## 🎯 Purpose

Explain the purpose and scope of this documentation.

## 📖 Contents

- [Section 1](#section-1)
- [Section 2](#section-2)
- [Section 3](#section-3)

## Section 1

Content for section 1.

## Section 2

Content for section 2.

## Section 3

Content for section 3.

## 🔗 Related Documentation

- [Link to related doc](../related-doc.md)

## 📝 Notes

Additional notes or considerations.

---

**Category**: ${category}
**Created**: ${date}
**Last Updated**: ${date}
`;
  }

  showHelp() {
    console.log(`
📁 Documentation Organization Helper

Usage: node organize-docs.js [action] [options]

Actions:
  check      - Analyze documentation structure (default)
  validate   - Check for broken links in documentation
  template   - Create a new documentation template
  help       - Show this help message

Options:
  -a, --action <action>    Action to perform
  -p, --path <path>        Path to documentation folder (default: docs)
  -h, --help              Show this help message

Examples:
  node organize-docs.js check
  node organize-docs.js validate
  node organize-docs.js template --path "NEW_FEATURE"
  node organize-docs.js --action template --path "api/endpoints"

Environment Variables:
  DOCS_PATH    Default documentation path
`);
  }

  async run() {
    try {
      // Support environment variable
      if (process.env.DOCS_PATH && this.path === 'docs') {
        this.path = process.env.DOCS_PATH;
      }

      this.path = resolve(this.path);

      switch (this.action.toLowerCase()) {
        case 'check':
          this.checkDocumentationStructure();
          break;

        case 'validate':
          const isValid = this.validateDocumentationLinks();
          process.exit(isValid ? 0 : 1);
          break;

        case 'template':
          let fileName, category;

          if (this.path.endsWith('docs')) {
            // Interactive mode
            const readline = await import('readline');
            const rl = readline.createInterface({
              input: process.stdin,
              output: process.stdout,
            });

            fileName = await new Promise((resolve) => {
              rl.question('Enter the documentation file name (without .md extension): ', resolve);
            });

            category = await new Promise((resolve) => {
              rl.question(
                'Enter the category (development/features/api/user) [default: development]: ',
                (answer) => {
                  resolve(answer || 'development');
                }
              );
            });

            rl.close();
          } else {
            // Non-interactive mode
            fileName = basename(this.path);
            category = dirname(this.path).split(/[/\\]/).pop() || 'development';
            this.path = 'docs';
          }

          this.createDocumentationTemplate(fileName, category);
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
  const organizer = new DocumentationOrganizer();
  organizer.run();
}

export default DocumentationOrganizer;
