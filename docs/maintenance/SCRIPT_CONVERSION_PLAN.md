# Script Conversion Plan: PowerShell/Bash → Node.js

## 🎯 Goal

Convert all platform-specific scripts (.ps1, .sh) to cross-platform Node.js scripts for better compatibility and maintenance.

## 📊 Current Status

### ✅ Completed Conversions

1. **check-infinite-loops.js** - ✅ Node.js version working perfectly (replaced PowerShell version)
2. **docker-deploy.js** - ✅ Converted from PowerShell/Bash to Node.js ES modules

### 🔄 Priority Conversions Needed

#### High Priority (Used in package.json)

1. **organize-docs.ps1** → **organize-docs.js**
   - Used by: `docs:check`, `docs:validate`, `docs:template`
   - Function: Document organization and validation
   - Complexity: Medium (file operations, markdown parsing)

2. **migrate-env.ps1** → **migrate-env.js**
   - Used by: `env:migrate`, `env:status`, `env:validate`
   - Function: Environment variable migration and validation
   - Complexity: Low (file reading, environment variable management)

#### Medium Priority

3. **setup-cloudflare.ps1** → **setup-cloudflare.js**
   - Function: Cloudflare configuration setup
   - Complexity: Medium (API calls, configuration management)

4. **fix-rollup-deps.ps1** → Already have **fix-rollup-deps.js**
   - Status: ✅ Node.js version exists, can remove PowerShell version

#### Low Priority (Duplicates)

5. **docker-deploy.sh** - ✅ Can be removed (Node.js version created)
6. **check-infinite-loops.ps1** - ✅ Can be removed (Node.js version working)
7. **fix-rollup-deps.sh** - ✅ Can be removed (Node.js version exists)

## 🚀 Benefits of Node.js Scripts

### Cross-Platform Compatibility

- ✅ Works on Windows, macOS, Linux
- ✅ No dependency on PowerShell or Bash
- ✅ Consistent behavior across platforms

### Better Integration

- ✅ Native npm package.json integration
- ✅ ES modules support
- ✅ Rich Node.js ecosystem (fs, path, child_process)
- ✅ Better error handling and logging

### Maintenance

- ✅ Single codebase instead of PowerShell + Bash duplicates
- ✅ TypeScript support (if needed)
- ✅ Better IDE support and debugging
- ✅ Consistent coding style with main project

## 📋 Implementation Strategy

### Phase 1: Core Functionality (Completed ✅)

- [x] Infinite loop detection
- [x] Docker deployment

### Phase 2: Documentation & Environment (Next)

- [ ] Document organization
- [ ] Environment migration

### Phase 3: Infrastructure & Setup

- [ ] Cloudflare setup
- [ ] Build optimization scripts

### Phase 4: Cleanup

- [ ] Remove duplicate PowerShell/Bash scripts
- [ ] Update all package.json references
- [ ] Update documentation

## 🛠️ Technical Approach

### Script Structure Template

```javascript
#!/usr/bin/env node

import { /* required modules */ } from 'node:fs';
import { spawn } from 'node:child_process';

class ScriptName {
  constructor() {
    this.parseArgs();
  }

  parseArgs() {
    // Command line argument parsing
  }

  async runCommand(command, args) {
    // Cross-platform command execution
  }

  async main() {
    // Main functionality
  }
}

// Main execution check
if (import.meta.url === `file://${process.argv[1]}` ||
    import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'))) {
  const script = new ScriptName();
  script.main();
}
```

### Key Patterns

- ES modules with proper main execution detection
- Cross-platform path handling
- Robust error handling with proper exit codes
- Consistent logging with emoji indicators
- Command line argument parsing
- Environment variable support

## 📈 Success Metrics

### Technical

- ✅ Zero platform-specific scripts remaining
- ✅ All npm scripts work on Windows/macOS/Linux
- ✅ Consistent error handling and logging
- ✅ Reduced code duplication

### Operational

- ✅ Easier onboarding for new developers
- ✅ Simplified CI/CD pipelines
- ✅ Reduced maintenance overhead
- ✅ Better developer experience

---

**Last Updated**: August 16, 2025
**Next Action**: Convert organize-docs.ps1 to organize-docs.js
