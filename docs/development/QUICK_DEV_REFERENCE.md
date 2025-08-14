# 🚀 Quick Development Reference

This is a quick reference guide for common development tasks in Couple Connect. For detailed documentation, see the [docs folder](./docs/).

**🎉 BONUS**: Check out our [Fun Development Guide](./FUN_DEVELOPMENT_GUIDE.md) for emoji commands and silly development tricks!

## 🏃‍♂️ Quick Start Commands

```bash
# Setup
npm install                    # Install dependencies
npm run dev                   # Start development server

# Database (Development)
npm run db:dev               # Setup local D1 database
# Database uses localStorage by default in development

# Database (Production)
npm run db:create            # Create Cloudflare D1 database
npm run db:schema            # Apply database schema
npm run db:seed              # Add seed data
npm run db:setup             # Complete database setup (all above)

# Build & Deploy
npm run build                # Build for production
npm run preview              # Preview production build

# Automated CI/CD (via GitHub Actions)
# - Push to main → Production deployment
# - Create PR → Preview deployment
# - Quality gates: ESLint, TypeScript, tests, security

# Manual deployment (if needed)
npm run deploy               # Deploy to Cloudflare Pages
npm run deploy:preview       # Deploy to preview environment

# Code Quality
npm run lint                 # Run ESLint
npm run lint:fix             # Fix ESLint issues
npm run type-check           # TypeScript type checking
npm run test                 # Run all tests (type-check + lint)
```

## 📁 Key File Locations

```text
🏗️ Core Configuration
├── package.json                    # Dependencies & scripts
├── vite.config.ts                  # Build configuration
├── wrangler.toml                   # Cloudflare deployment
├── tsconfig.json                   # TypeScript config
└── tailwind.config.js              # Styling configuration

� CI/CD Pipeline
├── .github/workflows/pages.yml     # Optimized CI/CD workflow
├── .github/workflows/README.md     # Pipeline documentation
└── .github/dependabot.yml          # Automated dependency updates

�💾 Database Layer
├── database/schema.sql             # Database schema
├── database/seed.sql               # Sample data
├── src/services/database.ts        # Core database service
├── src/services/types.ts           # TypeScript interfaces
├── src/hooks/useDatabase.ts        # React database hooks
└── src/services/databaseConfig.ts  # Performance configuration

🎨 UI Components
├── src/components/ui/              # Reusable UI components (Radix)
├── src/components/                 # Feature components
├── src/styles/theme.css            # CSS variables & theming
└── components.json                 # Shadcn/ui configuration

📚 Documentation
├── .github/.copilot-instructions.md # AI assistant guidelines
├── docs/README.md                  # Documentation index
├── docs/DOC_INDEX.md               # Complete documentation list
├── docs/development/               # Technical guides
└── docs/features/                  # Feature specifications
```

## 🎯 Common Development Patterns

### Adding a New Database Entity

1. Define interface in `src/services/types.ts`
2. Update `database/schema.sql`
3. Add CRUD methods to `src/services/database.ts`
4. Create React hooks in `src/hooks/useDatabase.ts`
5. Build UI components using existing patterns

### Creating UI Components

```typescript
// Use existing UI components from src/components/ui/
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// Follow TypeScript patterns
interface MyComponentProps {
  title: string;
  onAction: () => void;
}

export function MyComponent({ title, onAction }: MyComponentProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={onAction}>Action</Button>
      </CardContent>
    </Card>
  )
}
```

### Database Operations

```typescript
// Use provided hooks
import { useIssues, useActions } from '@/hooks/useDatabase';

function MyComponent() {
  const { data: issues, create: createIssue } = useIssues();
  const { data: actions, create: createAction } = useActions();

  // Operations are automatically optimized with caching
  const handleCreate = async () => {
    await createIssue({
      title: 'New Issue',
      description: 'Description',
      // TypeScript ensures type safety
    });
  };
}
```

## 🔧 Development Environment

### Requirements

- Node.js 20.x+
- npm 10.x+
- Git
- VS Code (recommended)

### Recommended VS Code Extensions

- TypeScript Hero
- Tailwind CSS IntelliSense
- ES7+ React/Redux/React-Native snippets
- Auto Rename Tag
- Prettier - Code formatter

### Environment Variables

Create `.env.development` for local development:

```env
NODE_ENV=development
VITE_APP_TITLE=Couple Connect
```

## 🚀 Deployment Quick Reference

### Cloudflare Pages Setup

1. Connect GitHub repository to Cloudflare Pages
2. Configure build settings:
   - Build command: `npm run build`
   - Output directory: `dist`
3. Set environment variables in Cloudflare dashboard
4. Deploy automatically on main branch pushes

### Database Setup for Production

```bash
# First time setup
wrangler login
npm run db:create      # Note the database ID
# Update wrangler.toml with the database ID
npm run db:schema
npm run db:seed
```

## 🐛 Troubleshooting

### Common Issues

- **Build failures**: Run `npm run type-check` and `npm run lint`
- **Database issues**: Check if using correct environment (dev vs prod)
- **Style issues**: Ensure Tailwind classes are properly applied
- **TypeScript errors**: Check `src/services/types.ts` for interface definitions

### Debug Tools

- React DevTools for component inspection
- Browser Network tab for database operations
- Console for performance monitoring (enabled in development)

## 📖 Documentation Links

- **[Complete Documentation](./docs/README.md)** - Full documentation index
- **[GitHub Copilot Instructions](./.copilot-instructions.md)** - AI assistant guidelines
- **[Database Guide](./docs/development/DATABASE.md)** - Database architecture
- **[Deployment Guide](./docs/development/DEPLOYMENT.md)** - Deployment instructions

---

💡 **Pro Tip**: This project includes comprehensive GitHub Copilot instructions. AI assistants can help with development tasks by understanding the project patterns and architecture automatically!
