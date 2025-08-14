# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Comprehensive documentation structure in `docs/` directory
- Documentation index with clear navigation
- Organized development and feature documentation

### Changed

- Moved all documentation files to `docs/` directory for better organization
- Updated main README.md to reference new documentation structure
- Reorganized project documentation into logical categories:
  - `docs/development/` - Setup and deployment guides
  - `docs/features/` - Feature-specific documentation
  - `docs/` root - Project overview and policies

### Removed

- README.old.md (outdated Spark template file)
- Scattered documentation files from root directory and other locations

### Documentation Structure

```
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
