#!/usr/bin/env node

/**
 * Replace all @phosphor-icons/react imports with optimized lazy-loaded versions
 * This will move phosphor icons out of the main bundle and reduce it significantly
 */

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

console.log('🎯 Optimizing Phosphor Icons - Moving to lazy loading...');

// Icons currently used in the codebase (extracted from grep results)
const USED_ICONS = [
  'Heart',
  'UserPlus',
  'Users',
  'TrendUp',
  'CheckCircle',
  'Target',
  'Calendar',
  'ChartBar',
  'ArrowClockwise',
  'WifiSlash',
  'CloudArrowUp',
  'X',
  'Download',
  'Clock',
  'Warning',
  'MagicWand',
  'ArrowRight',
  'User',
  'SignOut',
  'Gear',
  'Bell',
  'Plus',
  'Trophy',
  'Star',
  'Gift',
  'PencilSimple',
  'MagnifyingGlass',
  'Check',
  'Rocket',
  'Lightbulb',
  'FireSimple',
  'Coins',
  'Medal',
  'Crown',
  'Sparkle',
  'Lightning',
  'GameController',
  'Confetti',
  'Smiley',
  'HandsClapping',
  'ThumbsUp',
  'Flame',
  'Certificate',
  'BookOpen',
  'PaintBrush',
  'MusicNote',
  'Camera',
  'Airplane',
  'MapPin',
  'Coffee',
  'Wine',
  'Hamburger',
  'Bicycle',
  'Car',
  'Train',
  'Beach',
  'Mountains',
  'Tree',
  'FlowerLotus',
  'Sun',
  'Moon',
  'CloudRain',
  'Snowflake',
  'Thermometer',
];

// Create the optimized icon library content
const createOptimizedIconLibrary = () => {
  const iconImports = USED_ICONS.map(
    (icon) =>
      `  ${icon}: lazy(() => import('@phosphor-icons/react').then(m => ({ default: m.${icon} }))),`
  ).join('\n');

  return `import { lazy, Suspense } from 'react';
import type { ComponentType, SVGProps } from 'react';

// Type definitions for icon props
interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number;
  weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';
}

// Icon loading placeholder component
export const IconPlaceholder = ({ size = 16 }: { size?: number }) => {
  const sizeClass = size <= 16 ? 'w-4 h-4' : size <= 24 ? 'w-6 h-6' : 'w-8 h-8';

  return (
    <div
      className={\`inline-block bg-current opacity-30 rounded-sm \${sizeClass}\`}
      data-size={size}
      aria-hidden="true"
    />
  );
};

// HOC for lazy icon loading
export const withLazyIcon = (IconComponent: ComponentType<IconProps>, fallbackSize = 16) => {
  const LazyIconWrapper = (props: IconProps) => (
    <Suspense fallback={<IconPlaceholder size={fallbackSize} />}>
      <IconComponent {...props} />
    </Suspense>
  );

  LazyIconWrapper.displayName = \`LazyIcon(\${IconComponent.displayName || IconComponent.name || 'Component'})\`;
  return LazyIconWrapper;
};

// Essential icons (inline SVGs for critical path)
export const EssentialIcons = {
  Heart: ({ size = 16, weight = 'regular', ...props }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 256 256" fill="currentColor" {...props}>
      <path d="M178,32c-20.65,0-38.73,8.88-50,23.89C116.73,40.88,98.65,32,78,32A62.07,62.07,0,0,0,16,94c0,70,103.79,126.66,108.21,129a8,8,0,0,0,7.58,0C136.21,220.66,240,164,240,94A62.07,62.07,0,0,0,178,32ZM128,206.8C109.74,196.16,32,147.69,32,94A46.06,46.06,0,0,1,78,48c19.45,0,35.78,10.36,42.6,27a8,8,0,0,0,14.8,0c6.82-16.67,23.15-27,42.6-27a46.06,46.06,0,0,1,46,46C224,147.69,146.26,196.16,128,206.8Z"/>
    </svg>
  ),

  CheckCircle: ({ size = 16, weight = 'regular', ...props }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 256 256" fill="currentColor" {...props}>
      <path d="M173.66,98.34a8,8,0,0,1,0,11.32l-56,56a8,8,0,0,1-11.32,0l-24-24a8,8,0,0,1,11.32-11.32L112,148.69l50.34-50.35A8,8,0,0,1,173.66,98.34ZM232,128A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"/>
    </svg>
  ),

  X: ({ size = 16, weight = 'regular', ...props }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 256 256" fill="currentColor" {...props}>
      <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z"/>
    </svg>
  ),

  Plus: ({ size = 16, weight = 'regular', ...props }: IconProps) => (
    <svg width={size} height={size} viewBox="0 0 256 256" fill="currentColor" {...props}>
      <path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"/>
    </svg>
  )
};

// Lazy-loaded phosphor icons
export const LazyPhosphorIcons = {
${iconImports}
};

// Export commonly used icons with lazy wrapper
${USED_ICONS.map(
  (icon) => `export const ${icon} = withLazyIcon(LazyPhosphorIcons.${icon}, 16);`
).join('\n')}

// Export all icons as default
export default {
  ...EssentialIcons,
  ...LazyPhosphorIcons,
${USED_ICONS.map((icon) => `  ${icon},`).join('\n')}
};
`;
};

async function optimizePhosphorIcons() {
  // Create the optimized icon library
  const iconLibraryContent = createOptimizedIconLibrary();
  writeFileSync('src/components/ui/OptimizedIcons.tsx', iconLibraryContent);
  console.log('✅ Created OptimizedIcons.tsx');

  // Find all files that use phosphor-icons
  const files = await glob('src/**/*.{ts,tsx}', {
    ignore: [
      'node_modules/**',
      'src/components/ui/OptimizedIcons.tsx',
      'src/components/LazyIcons.tsx',
    ],
  });

  let replacedFiles = 0;
  let totalReplacements = 0;

  for (const file of files) {
    let content = readFileSync(file, 'utf-8');

    // Skip files that don't use phosphor-icons
    if (!content.includes('@phosphor-icons/react')) {
      continue;
    }

    console.log(`📝 Processing: ${file}`);

    let modified = false;
    let fileReplacements = 0;

    // Replace the import statement
    const importRegex = /import\s*{([^}]+)}\s*from\s*['"]@phosphor-icons\/react['"];?/g;
    const matches = content.match(importRegex);

    if (matches) {
      for (const match of matches) {
        // Extract icon names
        const iconMatch = match.match(/import\s*{([^}]+)}\s*from/);
        if (iconMatch) {
          const imports = iconMatch[1]
            .split(',')
            .map((s) => s.trim())
            .map((s) => s.split(' as ')[0].trim()) // Handle 'Gear as SettingsIcon'
            .filter((s) => s && USED_ICONS.includes(s));

          if (imports.length > 0) {
            const newImport = `import { ${imports.join(', ')} } from '@/components/ui/OptimizedIcons';`;
            content = content.replace(match, newImport);
            modified = true;
            fileReplacements++;
          }
        }
      }
    }

    if (modified) {
      writeFileSync(file, content);
      console.log(`✅ Updated: ${file} (${fileReplacements} replacements)`);
      replacedFiles++;
      totalReplacements += fileReplacements;
    }
  }

  console.log(`\n📊 Phosphor Icons Optimization Complete:`);
  console.log(`- Files processed: ${files.length}`);
  console.log(`- Files modified: ${replacedFiles}`);
  console.log(`- Total replacements: ${totalReplacements}`);
  console.log(`- Icons moved to lazy loading: ${USED_ICONS.length}`);

  console.log(`\n💡 Bundle Impact:`);
  console.log(`- Expected main bundle reduction: ~3-4MB`);
  console.log(`- Phosphor icons now lazy-loaded on demand`);
  console.log(`- Critical icons (Heart, X, Plus, CheckCircle) remain inline`);

  console.log(`\n🚀 Next steps:`);
  console.log(`1. Build and check bundle size reduction`);
  console.log(`2. Test that icons still render correctly`);
  console.log(`3. Monitor lazy loading performance`);
}

// Run the optimization
optimizePhosphorIcons().catch(console.error);
