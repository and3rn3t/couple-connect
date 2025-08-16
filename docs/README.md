# 📚 Couple Connect Documentation

This directory contains all documentation for the Couple Connect project, organized by category for easy navigation.

> 📖 **Looking for a complete documentation index?** See [DOC_INDEX.md](./DOC_INDEX.md) for a comprehensive list of all documentation files.

## 📖 Table of Contents

### 📋 Project Overview

- [**PRD.md**](./PRD.md) - Product Requirements Document with feature specifications and user experience design
- [**OPTIMIZATION_JOURNEY.md**](./OPTIMIZATION_JOURNEY.md) - Complete project optimization story and lessons learned
- [**SECURITY.md**](./SECURITY.md) - Security policy and vulnerability reporting guidelines
- [**CHANGELOG.md**](./CHANGELOG.md) - Project changelog and documentation reorganization history

### 🛠️ Development Documentation

#### Setup & Configuration

- [**SETUP.md**](./development/SETUP.md) - GitHub repository setup and configuration guide
- [**QUICK_DEV_REFERENCE.md**](./development/QUICK_DEV_REFERENCE.md) - Fast access to development commands and patterns
- [**FUN_DEVELOPMENT_GUIDE.md**](./development/FUN_DEVELOPMENT_GUIDE.md) - Engaging development practices and workflows
- [**CLOUDFLARE_SETUP.md**](./development/CLOUDFLARE_SETUP.md) - Cloudflare D1 and Pages setup guide
- [**DEPLOYMENT.md**](./development/DEPLOYMENT.md) - Comprehensive deployment guide for various platforms

#### CI/CD & Quality Assurance

- [**CI_CD_OPTIMIZATION.md**](./development/CI_CD_OPTIMIZATION.md) - Complete CI/CD pipeline optimization guide
- [**LINTING_CONFIGURATION.md**](./development/LINTING_CONFIGURATION.md) - Consistent CI/IDE linting setup documentation
- [**CI_IDE_LINTING_SUMMARY.md**](./development/CI_IDE_LINTING_SUMMARY.md) - Implementation summary and achievements
- [**GITHUB_ACTIONS_TROUBLESHOOTING.md**](./development/GITHUB_ACTIONS_TROUBLESHOOTING.md) - CI/CD pipeline debugging guide
- [**OPTIMIZATION_SUMMARY.md**](./development/OPTIMIZATION_SUMMARY.md) - Overall project optimization achievements
- [**REACT_TROUBLESHOOTING.md**](./development/REACT_TROUBLESHOOTING.md) - 🚨 Critical React bugs and debugging strategies

#### Database Development

- [**DATABASE.md**](./development/DATABASE.md) - Database architecture and development guide
- [**DATABASE_SETUP.md**](./development/DATABASE_SETUP.md) - Complete database setup and implementation status
- [**DATABASE_OPTIMIZATION.md**](./development/DATABASE_OPTIMIZATION.md) - Database performance optimization guide
- [**DATABASE_MIGRATION.md**](./development/DATABASE_MIGRATION.md) - Data migration documentation
- [**DATABASE_OPTIMIZATIONS_STATUS.md**](./development/DATABASE_OPTIMIZATIONS_STATUS.md) - Current optimization status

### ✨ Features Documentation

- [**GAMIFICATION.md**](./features/GAMIFICATION.md) - Detailed explanation of the gamification and rewards system

## 🚀 Quick Start

For getting started with the project, refer to the main [README.md](../README.md) in the root directory.

### 🤖 AI Development Assistant

This project includes comprehensive GitHub Copilot instructions in [`.github/.copilot-instructions.md`](../.github/.copilot-instructions.md) to help AI assistants understand the project architecture, coding patterns, and development workflows.

## 📁 Documentation Structure

```text
docs/
├── README.md                                      # This index file
├── PRD.md                                        # Product Requirements Document
├── SECURITY.md                                   # Security policy
├── CHANGELOG.md                                  # Project changelog
├── development/                                  # Development-related documentation
│   ├── DEPLOYMENT.md                            # Deployment instructions
│   ├── SETUP.md                                 # Repository setup guide
│   ├── DATABASE.md                              # Database architecture guide
│   ├── DATABASE_SETUP.md                        # Database implementation status
│   ├── DATABASE_OPTIMIZATION.md                 # Performance optimization guide
│   ├── DATABASE_MIGRATION.md                    # Data migration documentation
│   ├── DATABASE_OPTIMIZATIONS_STATUS.md         # Current optimization status
│   └── CLOUDFLARE_SETUP.md                      # Cloudflare setup guide
└── features/                                     # Feature-specific documentation
    └── GAMIFICATION.md                           # Gamification system details
```

## 🤝 Contributing to Documentation

When adding new documentation:

1. **Development docs** go in `./development/`
2. **Feature specs** go in `./features/`
3. **General project docs** go in the root `./docs/` directory
4. Update this README.md to include links to new documentation

## 📝 Documentation Standards

- Use clear, descriptive titles
- Include table of contents for longer documents
- Use consistent emoji prefixes for sections
- Keep documentation up-to-date with code changes
- Use relative links when referencing other docs
