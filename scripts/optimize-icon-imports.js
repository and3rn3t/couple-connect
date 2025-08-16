#!/usr/bin/env node

/**
 * Replace all direct lucide-react imports with optimized inline icons
 * This reduces bundle size by avoiding the large lucide-react library in the main chunk
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

// Define icon replacements (from lucide-react to our optimized icons)
const iconReplacements = {
  AlertTriangleIcon: 'AlertTriangleIcon',
  RefreshCwIcon: 'RefreshCwIcon',
  ChevronDown: 'ChevronDown',
  ChevronRight: 'ChevronRight',
  ChevronLeft: 'ChevronLeft',
  ChevronUp: 'ChevronUp',
  MoreHorizontal: 'MoreHorizontal',
  Check: 'Check',
  Circle: 'Circle',
  X: 'X',
  Search: 'Search',
  Minus: 'Minus',
  GripVertical: 'GripVertical',
  PanelLeft: 'PanelLeft',
  ArrowLeft: 'ArrowLeft',
  ArrowRight: 'ArrowRight',
};

async function replaceIconImports() {
  console.log('🔄 Replacing lucide-react imports with optimized icons...');

  // Find all TypeScript/React files
  const files = await glob('src/**/*.{ts,tsx}', {
    ignore: ['src/components/ui/icons.tsx', 'node_modules/**'],
  });

  let totalReplacements = 0;
  let filesModified = 0;

  for (const file of files) {
    const content = readFileSync(file, 'utf-8');
    let newContent = content;
    let fileModified = false;

    // Check if file has lucide-react imports
    if (content.includes('lucide-react')) {
      console.log(`📝 Processing: ${file}`);

      // Replace import statements
      const importRegex = /import\s*\{\s*([^}]+)\s*\}\s*from\s*['"]lucide-react['"];?/g;

      newContent = newContent.replace(importRegex, (match, iconList) => {
        const icons = iconList.split(',').map((icon) => icon.trim());
        const optimizedIcons = [];

        for (const icon of icons) {
          if (iconReplacements[icon]) {
            optimizedIcons.push(icon);
            totalReplacements++;
          } else {
            console.log(`⚠️  Unknown icon: ${icon} in ${file}`);
            optimizedIcons.push(icon); // Keep unknown icons for now
          }
        }

        if (optimizedIcons.length > 0) {
          fileModified = true;
          return `import { ${optimizedIcons.join(', ')} } from '@/components/ui/icons';`;
        }

        return match;
      });

      // Write back if modified
      if (fileModified) {
        writeFileSync(file, newContent);
        filesModified++;
        console.log(`✅ Updated: ${file}`);
      }
    }
  }

  console.log(`\\n📊 Summary:`);
  console.log(`- Files processed: ${files.length}`);
  console.log(`- Files modified: ${filesModified}`);
  console.log(`- Icon imports replaced: ${totalReplacements}`);
  console.log(`\\n🎯 Bundle optimization: Lucide-react imports replaced with inline SVGs`);
}

// Check if framer-motion imports exist and suggest optimization
async function checkFramerMotionUsage() {
  console.log('\\n🔍 Checking framer-motion usage...');

  const files = await glob('src/**/*.{ts,tsx}');
  const framerFiles = [];

  for (const file of files) {
    const content = readFileSync(file, 'utf-8');
    if (content.includes('framer-motion')) {
      framerFiles.push(file);
    }
  }

  if (framerFiles.length > 0) {
    console.log(`⚠️  Found ${framerFiles.length} files using framer-motion:`);
    framerFiles.forEach((file) => console.log(`   - ${file}`));
    console.log(
      `\\n💡 Consider lazy loading framer-motion or using CSS animations for better bundle size`
    );
  } else {
    console.log('✅ No framer-motion imports found');
  }
}

async function main() {
  try {
    await replaceIconImports();
    await checkFramerMotionUsage();
    console.log('\\n🚀 Icon optimization complete!');
  } catch (error) {
    console.error('❌ Error during optimization:', error);
    process.exit(1);
  }
}

// Run the script
main();
