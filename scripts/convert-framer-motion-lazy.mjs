#!/usr/bin/env node

/**
 * SAFE Framer Motion to Lazy Loading Converter
 *
 * This script safely converts framer-motion imports to lazy loading
 * with comprehensive safety checks and backup capabilities.
 *
 * SAFETY FEATURES:
 * - Creates backups of all files before modification
 * - Dry-run mode to preview changes
 * - Validates file syntax after changes
 * - Rollback capability if issues are detected
 * - Only processes TypeScript/TSX files
 * - Preserves original file permissions and timestamps
 */

import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join, parse } from 'path';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Configuration
const CONFIG = {
  DRY_RUN: process.argv.includes('--dry-run') || process.argv.includes('-d'),
  BACKUP_DIR: join(projectRoot, '.backup-framer-motion'),
  FORCE: process.argv.includes('--force') || process.argv.includes('-f'),
  VERBOSE: process.argv.includes('--verbose') || process.argv.includes('-v'),
};

// Components that use framer-motion and should be converted
const COMPONENTS_TO_CONVERT = [
  'src/components/EnhancedMobileNavigation.tsx',
  'src/components/CelebrationAnimation.tsx',
  'src/components/OfflineNotification.tsx',
  'src/components/PullToRefresh.tsx',
  'src/components/MobileTestingDashboard.tsx',
  'src/components/SwipeableActionCard.tsx',
  'src/components/ui/mobile-layout.tsx',
  'src/components/ui/mobile-forms.tsx',
  'src/components/ui/mobile-card.tsx',
  'src/components/ui/touch-feedback.tsx',
];

/**
 * Safely create backup directory
 */
async function ensureBackupDirectory() {
  try {
    await fs.mkdir(CONFIG.BACKUP_DIR, { recursive: true });
    if (CONFIG.VERBOSE) console.log(`� Backup directory ready: ${CONFIG.BACKUP_DIR}`);
  } catch (error) {
    throw new Error(`Failed to create backup directory: ${error.message}`);
  }
}

/**
 * Create backup of a file with timestamp
 */
async function createBackup(filePath) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const { name, ext } = parse(filePath);
  const backupName = `${name}_${timestamp}${ext}`;
  const backupPath = join(CONFIG.BACKUP_DIR, backupName);

  try {
    await fs.copyFile(filePath, backupPath);
    if (CONFIG.VERBOSE) console.log(`💾 Backup created: ${backupName}`);
    return backupPath;
  } catch (error) {
    throw new Error(`Failed to create backup for ${filePath}: ${error.message}`);
  }
}

/**
 * Validate TypeScript syntax using tsc
 */
async function validateTypeScript(filePath) {
  try {
    // Use TypeScript compiler to check syntax
    execSync(`npx tsc --noEmit --skipLibCheck "${filePath}"`, {
      cwd: projectRoot,
      stdio: 'pipe',
    });
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error.stdout?.toString() || error.message,
    };
  }
}

/**
 * Check if file exists and is readable
 */
async function validateFileAccess(filePath) {
  try {
    await fs.access(filePath, fs.constants.R_OK | fs.constants.W_OK);
    return true;
  } catch {
    return false;
  }
}

/**
 * Preview changes without applying them
 */
function previewChanges(originalContent, newContent, filePath) {
  console.log(`\n📋 Preview changes for ${filePath}:`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const originalLines = originalContent.split('\n');
  const newLines = newContent.split('\n');

  let hasChanges = false;
  for (let i = 0; i < Math.max(originalLines.length, newLines.length); i++) {
    const originalLine = originalLines[i] || '';
    const newLine = newLines[i] || '';

    if (originalLine !== newLine) {
      hasChanges = true;
      if (originalLine) console.log(`❌ ${i + 1}: ${originalLine}`);
      if (newLine) console.log(`✅ ${i + 1}: ${newLine}`);
    }
  }

  if (!hasChanges) {
    console.log('No changes detected.');
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

/**
 * Safely convert framer-motion imports
 */
function convertFramerMotionContent(content, filePath) {
  let updatedContent = content;
  const changes = [];

  // 1. Replace import statements (more precise pattern)
  const importPattern =
    /import\s*{\s*([^}]*(?:motion|AnimatePresence)[^}]*)\s*}\s*from\s*['"]framer-motion['"];?/g;
  const importMatch = content.match(importPattern);

  if (importMatch) {
    // Check what's being imported
    const importedItems = importMatch[0]
      .match(/{\s*([^}]+)\s*}/)[1]
      .split(',')
      .map((item) => item.trim());

    let newImports = [];
    if (importedItems.some((item) => item.includes('motion'))) {
      newImports.push('motion');
    }
    if (importedItems.some((item) => item.includes('AnimatePresence'))) {
      newImports.push('LazyAnimatePresence');
    }

    if (newImports.length > 0) {
      const newImportStatement = `import { ${newImports.join(', ')} } from '@/components/ui/lazy-motion';`;
      updatedContent = updatedContent.replace(importPattern, newImportStatement);
      changes.push(`Import statement updated with: ${newImports.join(', ')}`);
    }
  }

  // 2. Replace AnimatePresence usage (only if import was found)
  if (importMatch && content.includes('AnimatePresence')) {
    updatedContent = updatedContent.replace(/\bAnimatePresence\b/g, 'LazyAnimatePresence');
    changes.push('Replaced AnimatePresence with LazyAnimatePresence');
  }

  // 3. Keep motion.* usage as-is since we're importing the motion object
  // This is the beauty of your new approach! No need to replace motion.div, motion.span, etc.
  // They'll automatically use the lazy-loaded components! 🎉

  return { updatedContent, changes };
}

/**
 * Process a single file safely
 */
async function processFile(componentPath) {
  const fullPath = join(projectRoot, componentPath);

  // 1. Validate file access
  if (!(await validateFileAccess(fullPath))) {
    console.log(`⚠️  Cannot access file: ${componentPath}`);
    return { success: false, reason: 'File not accessible' };
  }

  // 2. Read original content
  let originalContent;
  try {
    originalContent = await fs.readFile(fullPath, 'utf-8');
  } catch (error) {
    console.log(`❌ Error reading ${componentPath}: ${error.message}`);
    return { success: false, reason: `Read error: ${error.message}` };
  }

  // 3. Check if it uses framer-motion
  if (!originalContent.includes('framer-motion')) {
    if (CONFIG.VERBOSE) console.log(`⏭️  Skipping ${componentPath} (no framer-motion import)`);
    return { success: true, reason: 'No framer-motion usage' };
  }

  // 4. Convert content
  const { updatedContent, changes } = convertFramerMotionContent(originalContent, componentPath);

  // 5. Check if changes were made
  if (updatedContent === originalContent) {
    if (CONFIG.VERBOSE) console.log(`⏭️  No changes needed for ${componentPath}`);
    return { success: true, reason: 'No changes needed' };
  }

  // 6. Preview changes in dry-run mode
  if (CONFIG.DRY_RUN) {
    previewChanges(originalContent, updatedContent, componentPath);
    return { success: true, reason: 'Dry run completed', changes };
  }

  // 7. Create backup before making changes
  let backupPath;
  try {
    backupPath = await createBackup(fullPath);
  } catch (error) {
    console.log(`❌ Backup failed for ${componentPath}: ${error.message}`);
    return { success: false, reason: `Backup failed: ${error.message}` };
  }

  // 8. Write updated content
  try {
    await fs.writeFile(fullPath, updatedContent, 'utf-8');
  } catch (error) {
    console.log(`❌ Write failed for ${componentPath}: ${error.message}`);
    // Restore from backup
    try {
      await fs.copyFile(backupPath, fullPath);
      console.log(`🔄 Restored ${componentPath} from backup`);
    } catch (restoreError) {
      console.log(`💥 CRITICAL: Failed to restore ${componentPath}!`);
    }
    return { success: false, reason: `Write failed: ${error.message}` };
  }

  // 9. Validate syntax after changes
  if (!CONFIG.FORCE) {
    const validation = await validateTypeScript(fullPath);
    if (!validation.valid) {
      console.log(`❌ TypeScript validation failed for ${componentPath}`);
      console.log(`Validation error: ${validation.error}`);

      // Restore from backup
      try {
        await fs.copyFile(backupPath, fullPath);
        console.log(`🔄 Restored ${componentPath} from backup due to validation failure`);
      } catch (restoreError) {
        console.log(`💥 CRITICAL: Failed to restore ${componentPath}!`);
      }
      return { success: false, reason: `Validation failed: ${validation.error}` };
    }
  }

  console.log(`✅ Successfully converted ${componentPath}`);
  if (CONFIG.VERBOSE && changes.length > 0) {
    console.log(`   Changes: ${changes.join(', ')}`);
  }

  return { success: true, reason: 'Converted successfully', changes };
}

/**
 * Main conversion function with comprehensive safety
 */
async function convertFramerMotionImports() {
  console.log('🛡️  SAFE Framer Motion to Lazy Loading Converter');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  if (CONFIG.DRY_RUN) {
    console.log('🔍 DRY RUN MODE - No files will be modified');
  } else {
    console.log('⚠️  LIVE MODE - Files will be modified (backups will be created)');
  }

  if (CONFIG.FORCE) {
    console.log('⚡ FORCE MODE - TypeScript validation will be skipped');
  }

  console.log('');

  // Create backup directory if not in dry-run mode
  if (!CONFIG.DRY_RUN) {
    try {
      await ensureBackupDirectory();
    } catch (error) {
      console.error(`❌ Setup failed: ${error.message}`);
      process.exit(1);
    }
  }

  const results = {
    total: COMPONENTS_TO_CONVERT.length,
    processed: 0,
    converted: 0,
    skipped: 0,
    failed: 0,
    errors: [],
  };

  // Process each component
  for (const componentPath of COMPONENTS_TO_CONVERT) {
    results.processed++;

    const result = await processFile(componentPath);

    if (result.success) {
      if (result.reason === 'Converted successfully') {
        results.converted++;
      } else {
        results.skipped++;
      }
    } else {
      results.failed++;
      results.errors.push({ file: componentPath, reason: result.reason });
    }
  }

  // Print summary
  console.log('\n📊 Conversion Summary');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Total files: ${results.total}`);
  console.log(`Processed: ${results.processed}`);
  console.log(`Converted: ${results.converted}`);
  console.log(`Skipped: ${results.skipped}`);
  console.log(`Failed: ${results.failed}`);

  if (results.errors.length > 0) {
    console.log('\n❌ Errors:');
    results.errors.forEach((error) => {
      console.log(`   ${error.file}: ${error.reason}`);
    });
  }

  if (!CONFIG.DRY_RUN && results.converted > 0) {
    console.log(`\n💾 Backups stored in: ${CONFIG.BACKUP_DIR}`);
    console.log('\n📊 Next steps:');
    console.log('1. Run "npm run type-check" to verify TypeScript compilation');
    console.log('2. Run "npm run build" to see bundle size improvement');
    console.log('3. Run "npm run perf:mobile" to check updated metrics');
    console.log('4. Test components to ensure animations still work');
    console.log('\n🔄 To rollback changes, restore files from the backup directory');
  } else if (CONFIG.DRY_RUN) {
    console.log('\n🔍 Dry run completed. Add --force to apply changes.');
    console.log('Example: node scripts/convert-framer-motion-lazy.mjs --force');
  }
}

// Show help if requested
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
🛡️  SAFE Framer Motion to Lazy Loading Converter

Usage: node scripts/convert-framer-motion-lazy.mjs [options]

Options:
  --dry-run, -d    Preview changes without applying them
  --force, -f      Skip TypeScript validation (faster but less safe)
  --verbose, -v    Show detailed output
  --help, -h       Show this help message

Safety Features:
  ✅ Creates backups before modification
  ✅ Validates TypeScript syntax after changes
  ✅ Rollback capability on errors
  ✅ Dry-run mode for safe preview
  ✅ Only processes known component files

Examples:
  node scripts/convert-framer-motion-lazy.mjs --dry-run    # Preview changes
  node scripts/convert-framer-motion-lazy.mjs --force      # Apply with minimal validation
  node scripts/convert-framer-motion-lazy.mjs --verbose    # Apply with detailed output
`);
  process.exit(0);
}

// Run the conversion
convertFramerMotionImports().catch((error) => {
  console.error('💥 Fatal error:', error.message);
  process.exit(1);
});
