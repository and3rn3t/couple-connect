# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Comprehensive documentation structure in `docs/` directory
- Documentation index with clear navigation
- Organized development and feature documentation
- **GitHub Copilot Instructions** (`.github/.copilot-instructions.md`) - Comprehensive AI assistant guidelines
- **Complete Documentation Index** (`docs/DOC_INDEX.md`) - Full documentation catalog
- **Quick Development Reference** (`QUICK_DEV_REFERENCE.md`) - Fast access to commands and patterns
- **Optimized CI/CD Pipeline** - Streamlined GitHub Actions workflow
- **Pipeline Documentation** (`.github/workflows/README.md`) - Comprehensive workflow guide
- Database development documentation suite:
  - Database setup and implementation status
  - Performance optimization guides
  - Migration procedures documentation
  - Cloudflare D1 setup instructions

### Fixed

- **🚨 CRITICAL: Infinite Re-render Loop Fix** (August 16, 2025)
  - Fixed blank screen issue caused by circular useEffect dependencies
  - Partner initialization effect was triggering infinite re-renders
  - Solution: Changed dependency array to empty array `[]` for one-time initialization
  - Added comprehensive documentation in `docs/development/REACT_TROUBLESHOOTING.md`
  - Updated Copilot instructions with prevention strategies
  - **Impact**: App now loads correctly without infinite loops
- **🔧 React 19 Scheduler Compatibility Fix** (August 16, 2025)
  - Fixed `Cannot set properties of undefined (setting 'unstable_now')` error
  - Added scheduler polyfill in main.tsx for React 19 + Vite compatibility
  - **Impact**: Eliminated console errors and improved app stability
- **🛡️ Content Security Policy Updates** (August 16, 2025)
  - Fixed CSP violations blocking Cloudflare Analytics and Google Fonts
  - Updated `public/_headers` to whitelist trusted external domains
  - **Impact**: Analytics and custom fonts now load correctly
- **📱 Progressive Web App Fixes** (August 16, 2025)
  - Fixed deprecated `apple-mobile-web-app-capable` meta tag warning
  - Simplified manifest.json and fixed missing icon references
  - Added proper favicon files to public directory
  - **Impact**: Eliminated manifest and PWA-related console errors

### Changed

- Moved all documentation files to `docs/` directory for better organization
- Updated main README.md to reference new documentation structure and Copilot instructions
- Reorganized project documentation into logical categories:
  - `docs/development/` - Setup, deployment, and database guides
  - `docs/features/` - Feature-specific documentation
  - `docs/` root - Project overview, policies, and navigation
- Consolidated database-related documentation into development folder
- Enhanced documentation navigation with cross-references
- **Optimized GitHub Actions Pipeline**: Reduced from 5 jobs to 2 jobs
  - Combined quality checks, security audits, and builds into single CI job
  - Streamlined deployment with conditional logic
  - ~40% faster execution time and 60% fewer resources
- **Enhanced Dependabot Configuration**: Weekly grouped updates to reduce PR noise

### Removed

- Scattered documentation files from root directory:
  - `DATABASE_SETUP_COMPLETE.md` → `docs/development/DATABASE_SETUP.md`
  - `DATABASE_OPTIMIZATION_GUIDE.md` → `docs/development/DATABASE_OPTIMIZATION.md`
  - `MIGRATION_COMPLETE.md` → `docs/development/DATABASE_MIGRATION.md`
  - `OPTIMIZATIONS_ENABLED.md` → `docs/development/DATABASE_OPTIMIZATIONS_STATUS.md`
  - `SETUP_COMPLETE.md` → `docs/development/CLOUDFLARE_SETUP.md`

### Documentation Structure

```text
docs/
├── README.md                    # Documentation index
├── PRD.md                      # Product Requirements Document
├── SECURITY.md                 # Security policy
├── development/                # Development guides
│   ├── DEPLOYMENT.md          # Deployment instructions
│   └── SETUP.md               # Repository setup
└── features/                   # Feature documentation
    └── GAMIFICATION.md         # Gamification system
```
