import fs from 'fs';
import path from 'path';

const fixes = [
  {
    file: 'src/components/ui/checkbox.tsx',
    imports: ['Check'],
    pattern: /import { cn } from "@\/lib\/utils"/,
    replacement: 'import { Check } from "lucide-react"\nimport { cn } from "@/lib/utils"',
  },
  {
    file: 'src/components/ui/command.tsx',
    imports: ['Search'],
    pattern: /import { cn } from "@\/lib\/utils"/,
    replacement: 'import { Search } from "lucide-react"\nimport { cn } from "@/lib/utils"',
  },
  {
    file: 'src/components/ui/context-menu.tsx',
    imports: ['Check', 'ChevronRight', 'Circle'],
    pattern: /import { cn } from "@\/lib\/utils"/,
    replacement:
      'import { Check, ChevronRight, Circle } from "lucide-react"\nimport { cn } from "@/lib/utils"',
  },
  {
    file: 'src/components/ui/dialog.tsx',
    imports: ['X'],
    pattern: /import { cn } from "@\/lib\/utils"/,
    replacement: 'import { X } from "lucide-react"\nimport { cn } from "@/lib/utils"',
  },
  {
    file: 'src/components/ui/dropdown-menu.tsx',
    imports: ['Check', 'ChevronRight', 'Circle'],
    pattern: /import { cn } from "@\/lib\/utils"/,
    replacement:
      'import { Check, ChevronRight, Circle } from "lucide-react"\nimport { cn } from "@/lib/utils"',
  },
  {
    file: 'src/components/ui/input-otp.tsx',
    imports: ['Minus'],
    pattern: /import { cn } from "@\/lib\/utils"/,
    replacement: 'import { Minus } from "lucide-react"\nimport { cn } from "@/lib/utils"',
  },
  {
    file: 'src/components/ui/menubar.tsx',
    imports: ['Check', 'ChevronRight', 'Circle'],
    pattern: /import { cn } from "@\/lib\/utils"/,
    replacement:
      'import { Check, ChevronRight, Circle } from "lucide-react"\nimport { cn } from "@/lib/utils"',
  },
  {
    file: 'src/components/ui/navigation-menu.tsx',
    imports: ['ChevronDown'],
    pattern: /import { cn } from "@\/lib\/utils"/,
    replacement: 'import { ChevronDown } from "lucide-react"\nimport { cn } from "@/lib/utils"',
  },
  {
    file: 'src/components/ui/pagination.tsx',
    imports: ['ChevronLeft', 'ChevronRight', 'MoreHorizontal'],
    pattern: /import { cn } from "@\/lib\/utils"/,
    replacement:
      'import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"\nimport { cn } from "@/lib/utils"',
  },
  {
    file: 'src/components/ui/radio-group.tsx',
    imports: ['Circle'],
    pattern: /import { cn } from "@\/lib\/utils"/,
    replacement: 'import { Circle } from "lucide-react"\nimport { cn } from "@/lib/utils"',
  },
  {
    file: 'src/components/ui/resizable.tsx',
    imports: ['GripVertical'],
    pattern: /import { cn } from "@\/lib\/utils"/,
    replacement: 'import { GripVertical } from "lucide-react"\nimport { cn } from "@/lib/utils"',
  },
  {
    file: 'src/components/ui/select.tsx',
    imports: ['Check', 'ChevronDown', 'ChevronUp'],
    pattern: /import { cn } from "@\/lib\/utils"/,
    replacement:
      'import { Check, ChevronDown, ChevronUp } from "lucide-react"\nimport { cn } from "@/lib/utils"',
  },
  {
    file: 'src/components/ui/sheet.tsx',
    imports: ['X'],
    pattern: /import { cn } from "@\/lib\/utils"/,
    replacement: 'import { X } from "lucide-react"\nimport { cn } from "@/lib/utils"',
  },
];

fixes.forEach((fix) => {
  if (!fs.existsSync(fix.file)) return;

  let content = fs.readFileSync(fix.file, 'utf8');

  // Check if lucide import already exists
  const hasLucideImport = /import\s+{[^}]*}\s+from\s+["']lucide-react["']/.test(content);

  if (!hasLucideImport && fix.pattern.test(content)) {
    content = content.replace(fix.pattern, fix.replacement);
    fs.writeFileSync(fix.file, content);
    console.log(`Fixed ${fix.file}: added ${fix.imports.join(', ')}`);
  }
});

console.log('All icon imports fixed!');
