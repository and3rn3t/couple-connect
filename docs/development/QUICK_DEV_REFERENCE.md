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

## 🔧 GitHub CLI Commands

**Prefer GitHub CLI over git for GitHub operations:**

```powershell
# Repository Management
gh repo view                          # View repository details
gh repo clone and3rn3t/couple-connect # Clone repository

# Pull Requests
gh pr create --title "feat: new feature" --body "Description"
gh pr list --state open             # List open PRs
gh pr view 123                       # View specific PR
gh pr checkout 123                   # Checkout PR locally
gh pr merge 123 --merge              # Merge PR

# Issues
gh issue create --title "Bug: description" --body "Details"
gh issue list --state open          # List open issues
gh issue view 456                    # View specific issue
gh issue close 456                   # Close issue

# Releases & Tags
gh release create v1.0.0 --title "Release v1.0.0" --notes "Release notes"
gh release list                      # List all releases

# Workflow & Actions
gh workflow list                     # List GitHub Actions workflows
gh run list                          # List workflow runs
gh run view 789                      # View specific run details
```

## 💻 PowerShell File Operations

**Use full command names for clarity:**

```powershell
# File & Directory Operations
Get-ChildItem -Path "docs" -Recurse -Filter "*.md"  # List markdown files
New-Item -Path "docs/new-file.md" -ItemType File    # Create new file
Remove-Item -Path "temp-file.txt" -Force           # Delete file
Move-Item -Source "old-file.md" -Destination "docs/" # Move file
Copy-Item -Source "template.md" -Destination "new.md" # Copy file
Test-Path -Path "package.json"                      # Check if file exists

# Directory Management
New-Item -Path "docs/new-folder" -ItemType Directory  # Create directory
Remove-Item -Path "temp-folder" -Recurse -Force      # Delete directory recursively
Set-Location -Path "docs/development"                # Change directory

# Content Operations
Get-Content -Path "package.json" | Select-Object -First 10  # Read first 10 lines
Set-Content -Path "file.txt" -Value "New content"          # Write content
Add-Content -Path "file.txt" -Value "Append this"          # Append content
```

## � Environment Management

**Quick environment setup commands:**

```powershell
# Environment Configuration
npm run env:dev         # Setup development environment (.env.local)
npm run env:staging     # Setup staging environment (.env.local)
npm run env:prod        # Setup production environment (.env.local)
npm run env:test        # Setup testing environment (.env.local)
npm run env:check       # Check current environment status
npm run env:validate    # Validate environment configuration

# Manual environment setup
Copy-Item ".env/.env.base" ".env.local" -Force
Get-Content ".env/.env.development" | Add-Content ".env.local"

# Environment status check
Get-Content ".env.local" | Select-String "VITE_ENVIRONMENT"
Test-Path ".env.local"  # Check if environment file exists
```

**Environment Files Structure:**

```text
.env/
├── .env.base         # Shared baseline configuration
├── .env.development  # Development-specific settings
├── .env.production   # Production-specific settings
├── .env.staging      # Staging/pre-production settings
├── .env.test         # Testing environment settings
├── .env.example      # Template with setup instructions
└── README.md         # Environment documentation
```

## �📁 Key File Locations

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

### Core Documentation

- **[Complete Documentation Index](../DOC_INDEX.md)** - Comprehensive documentation catalog
- **[Documentation README](../README.md)** - Main documentation entry point
- **[CLI Best Practices](./CLI_BEST_PRACTICES.md)** - Command line standards and documentation organization
- **[GitHub Copilot Instructions](../../.github/.copilot-instructions.md)** - AI assistant guidelines with documentation standards

### Technical Guides

- **[Database Architecture](./DATABASE.md)** - Database design and patterns
- **[Deployment Guide](./DEPLOYMENT.md)** - Deployment instructions
- **[GitHub Actions Troubleshooting](./GITHUB_ACTIONS_TROUBLESHOOTING.md)** - CI/CD debugging

### Documentation Organization

**Always create documentation in `/docs` folder:**

- `docs/development/` - Technical documentation
- `docs/features/` - Feature specifications
- `docs/api/` - API documentation (when needed)
- `docs/user/` - User guides (when needed)

**Quick Documentation Commands:**

```powershell
# Create new documentation file
New-Item -Path "docs/development/NEW_GUIDE.md" -ItemType File -Force

# List all documentation files
Get-ChildItem -Path "docs" -Recurse -Filter "*.md"

# Check documentation organization
Get-ChildItem -Path "docs" -Recurse -Directory | Sort-Object FullName
```

---

💡 **Pro Tip**: This project includes comprehensive GitHub Copilot instructions. AI assistants can help with development tasks by understanding the project patterns and architecture automatically!
