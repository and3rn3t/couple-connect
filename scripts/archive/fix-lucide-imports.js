import fs from 'fs';
import path from 'path';

const componentDir = 'src/components/ui';

// Map of icon imports to fix
const iconMappings = {
  ChevronDownIcon: 'ChevronDown',
  ChevronRightIcon: 'ChevronRight',
  ChevronLeftIcon: 'ChevronLeft',
  ChevronUpIcon: 'ChevronUp',
  MoreHorizontalIcon: 'MoreHorizontal',
  CheckIcon: 'Check',
  SearchIcon: 'Search',
  CircleIcon: 'Circle',
  XIcon: 'X',
  MinusIcon: 'Minus',
  ArrowLeft: 'ArrowLeft',
  ArrowRight: 'ArrowRight',
  GripVerticalIcon: 'GripVertical',
  PanelLeftIcon: 'PanelLeft',
};

// Get all .tsx files in the ui directory
const files = fs
  .readdirSync(componentDir)
  .filter((file) => file.endsWith('.tsx'))
  .map((file) => path.join(componentDir, file));

files.forEach((filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Fix import statements - convert from direct path imports to named imports
  const importRegex = /import\s+(\w+)\s+from\s+"lucide-react\/dist\/esm\/icons\/([^"]+)"/g;
  let imports = [];
  let match;

  while ((match = importRegex.exec(content)) !== null) {
    const importName = match[1];
    const iconPath = match[2];

    // Convert kebab-case to PascalCase
    const iconName = iconPath
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');

    imports.push({ importName, iconName });
    modified = true;
  }

  if (imports.length > 0) {
    // Remove all the old import statements
    content = content.replace(importRegex, '');

    // Add the new import statement
    const iconNames = imports.map((imp) => imp.iconName).join(', ');
    const importStatement = `import { ${iconNames} } from "lucide-react"`;

    // Insert the new import after the last import statement
    const lastImportMatch = content.match(/import[^;]+;(?=\s*\n)/g);
    if (lastImportMatch) {
      const lastImport = lastImportMatch[lastImportMatch.length - 1];
      const insertIndex = content.lastIndexOf(lastImport) + lastImport.length;
      content = content.slice(0, insertIndex) + '\n' + importStatement + content.slice(insertIndex);
    }

    // Replace usage of old icon names with new ones
    imports.forEach(({ importName, iconName }) => {
      const usageRegex = new RegExp(`\\b${importName}\\b`, 'g');
      content = content.replace(usageRegex, iconName);
    });

    // Write the modified content back
    fs.writeFileSync(filePath, content);
    console.log(`Fixed imports in ${filePath}`);
  }
});

console.log('Lucide import fixes completed!');
