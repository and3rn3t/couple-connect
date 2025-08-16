import fs from 'fs';
import path from 'path';

const componentDir = 'src/components/ui';

// Icon mappings from usage to proper import name
const iconMap = {
  ChevronDown: 'ChevronDown',
  ChevronRight: 'ChevronRight',
  ChevronLeft: 'ChevronLeft',
  ChevronUp: 'ChevronUp',
  MoreHorizontal: 'MoreHorizontal',
  Check: 'Check',
  Search: 'Search',
  Circle: 'Circle',
  X: 'X',
  Minus: 'Minus',
  ArrowLeft: 'ArrowLeft',
  ArrowRight: 'ArrowRight',
  GripVertical: 'GripVertical',
  PanelLeft: 'PanelLeft',
};

const files = [
  'calendar.tsx',
  'carousel.tsx',
  'checkbox.tsx',
  'command.tsx',
  'context-menu.tsx',
  'dialog.tsx',
  'dropdown-menu.tsx',
  'input-otp.tsx',
  'menubar.tsx',
  'navigation-menu.tsx',
  'pagination.tsx',
  'radio-group.tsx',
  'resizable.tsx',
  'select.tsx',
  'sheet.tsx',
  'sidebar.tsx',
];

files.forEach((fileName) => {
  const filePath = path.join(componentDir, fileName);
  if (!fs.existsSync(filePath)) return;

  let content = fs.readFileSync(filePath, 'utf8');

  // Find which icons are used in this file
  const usedIcons = new Set();
  Object.keys(iconMap).forEach((iconName) => {
    const regex = new RegExp(`\\b${iconName}\\b`, 'g');
    if (regex.test(content)) {
      usedIcons.add(iconName);
    }
  });

  if (usedIcons.size > 0) {
    // Check if lucide-react import already exists
    const hasLucideImport = /import\s+{[^}]*}\s+from\s+["']lucide-react["']/.test(content);

    if (!hasLucideImport) {
      // Find the last import statement
      const imports = content.match(/import[^;]+;/g) || [];
      if (imports.length > 0) {
        const lastImport = imports[imports.length - 1];
        const insertIndex = content.indexOf(lastImport) + lastImport.length;

        const iconImport = `\nimport { ${Array.from(usedIcons).sort().join(', ')} } from "lucide-react"`;
        content = content.slice(0, insertIndex) + iconImport + content.slice(insertIndex);

        fs.writeFileSync(filePath, content);
        console.log(`Added lucide import to ${fileName}: ${Array.from(usedIcons).join(', ')}`);
      }
    }
  }
});

console.log('Icon import fixes completed!');
