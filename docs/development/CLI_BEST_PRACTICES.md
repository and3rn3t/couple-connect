# 🔧 CLI Best Practices & Command Reference

## 📋 Overview

This document establishes command-line interface (CLI) best practices for the Couple Connect project, ensuring consistency and clarity across all documentation and development workflows.

## 🎯 CLI Tool Hierarchy

**Use this priority order when choosing CLI tools:**

1. **GitHub CLI** (`gh`) - For all GitHub operations
2. **PowerShell** (full commands) - For file system and Windows operations
3. **npm/pnpm** - For Node.js package management
4. **git CLI** - Only for basic git operations not covered by GitHub CLI

## 🔗 GitHub CLI Commands

### Repository Management

```powershell
# Repository operations
gh repo view                          # View current repository details
gh repo view --web                    # Open repository in browser
gh repo clone and3rn3t/couple-connect # Clone repository
gh repo fork and3rn3t/couple-connect  # Fork repository

# Repository status and information
gh status                             # Overview of repository status
gh browse                             # Open repository in default browser
```

### Pull Request Management

```powershell
# Creating and managing PRs
gh pr create --title "feat: new feature" --body "Detailed description"
gh pr create --draft                  # Create draft PR
gh pr create --assignee "@me"         # Assign PR to yourself

# Viewing and interacting with PRs
gh pr list --state open               # List open PRs
gh pr list --author "@me"             # List your PRs
gh pr view 123                        # View specific PR details
gh pr view 123 --web                  # Open PR in browser

# PR operations
gh pr checkout 123                    # Checkout PR locally for testing
gh pr merge 123 --merge               # Merge PR (merge commit)
gh pr merge 123 --squash              # Squash and merge PR
gh pr merge 123 --rebase              # Rebase and merge PR
gh pr close 123                       # Close PR without merging
```

### Issue Management

```powershell
# Creating issues
gh issue create --title "Bug: description" --body "Detailed issue description"
gh issue create --label "bug,priority-high" # Create with labels
gh issue create --assignee "@me"      # Assign issue to yourself

# Managing issues
gh issue list --state open            # List open issues
gh issue list --label "bug"           # Filter by label
gh issue view 456                     # View specific issue
gh issue close 456                    # Close issue
gh issue comment 456 --body "Comment text" # Add comment to issue
```

### Workflow & Actions

```powershell
# Workflow management
gh workflow list                      # List all workflows
gh workflow view "Build and Deploy"   # View specific workflow
gh workflow run "Build and Deploy"    # Manually trigger workflow
gh workflow enable "Build and Deploy" # Enable workflow
gh workflow disable "Build and Deploy" # Disable workflow

# Action runs monitoring
gh run list                           # List recent workflow runs
gh run list --workflow="Build and Deploy" --limit 10 # Filter by workflow
gh run view                           # View latest run details
gh run view 789                       # View specific run
gh run view --log                     # View logs for latest run
gh run download 789                   # Download artifacts from run
gh run rerun 789                      # Rerun a workflow
gh run watch                          # Watch current run in real-time
```

### Release Management

```powershell
# Creating releases
gh release create v1.0.0 --title "Release v1.0.0" --notes "Release notes"
gh release create v1.0.0 --generate-notes # Auto-generate release notes
gh release create v1.0.0 --draft      # Create draft release
gh release create v1.0.0 --prerelease # Mark as pre-release

# Managing releases
gh release list                       # List all releases
gh release view v1.0.0                # View specific release
gh release upload v1.0.0 ./dist.zip   # Upload assets to release
gh release delete v1.0.0              # Delete release
```

### Secret Management

```powershell
# Repository secrets
gh secret list                        # List repository secrets
gh secret set SECRET_NAME --body "secret-value" # Set secret
gh secret delete SECRET_NAME          # Delete secret

# Environment secrets
gh secret set SECRET_NAME --env production --body "value" # Set environment secret
gh secret list --env production       # List environment secrets
```

## 💻 PowerShell Full Command Names

**Always use full PowerShell command names for clarity and documentation:**

### File System Operations

```powershell
# File operations (✅ Preferred - Full Commands)
Get-ChildItem -Path "docs" -Recurse -Filter "*.md" | Sort-Object Name
New-Item -Path "docs/new-file.md" -ItemType File -Force
Remove-Item -Path "temp-file.txt" -Force
Move-Item -Source "old-file.md" -Destination "docs/new-location.md"
Copy-Item -Source "template.md" -Destination "new-document.md"
Rename-Item -Path "old-name.md" -NewName "new-name.md"

# File testing and properties
Test-Path -Path "package.json"         # Check if file exists
Get-Item -Path "package.json"          # Get file properties
Get-ItemProperty -Path "package.json"  # Get detailed properties

# ❌ Avoid - Aliases and short forms
ls docs\*.md                          # Use Get-ChildItem instead
ni docs/file.md                       # Use New-Item instead
rm temp.txt                           # Use Remove-Item instead
mv old.md new.md                      # Use Move-Item instead
cp source.md target.md                # Use Copy-Item instead
```

### Directory Operations

```powershell
# Directory management
New-Item -Path "docs/new-folder" -ItemType Directory -Force
Remove-Item -Path "temp-folder" -Recurse -Force
Set-Location -Path "docs/development"
Push-Location -Path "docs"            # Save current location and navigate
Pop-Location                          # Return to saved location

# Directory analysis
Get-ChildItem -Path "docs" -Directory # List only directories
Get-ChildItem -Path "docs" -File      # List only files
Measure-Object -InputObject (Get-ChildItem -Path "docs" -Recurse) -Property Length -Sum
```

### Content Operations

```powershell
# Reading content
Get-Content -Path "package.json"                    # Read entire file
Get-Content -Path "README.md" | Select-Object -First 10  # First 10 lines
Get-Content -Path "log.txt" | Select-Object -Last 20     # Last 20 lines

# Writing content
Set-Content -Path "file.txt" -Value "New content"   # Overwrite file content
Add-Content -Path "file.txt" -Value "Append this"   # Append to file
Out-File -FilePath "output.txt" -InputObject "data" # Write objects to file

# Content analysis
Select-String -Path "*.md" -Pattern "TODO"          # Search for pattern
Select-String -Path "docs\*.md" -Pattern "GitHub" -CaseSensitive
```

### Process and Environment

```powershell
# Process management
Get-Process -Name "node"               # List Node.js processes
Stop-Process -Name "node" -Force       # Stop process by name
Start-Process -FilePath "npm" -ArgumentList "run", "dev" # Start process

# Environment variables
Get-ChildItem Env:                     # List all environment variables
$env:NODE_ENV = "development"          # Set environment variable
[Environment]::GetEnvironmentVariable("PATH", "User") # Get environment variable
```

## 🚀 npm Script Commands

**Standard npm commands for project operations:**

```bash
# Development
npm install                    # Install dependencies
npm run dev                   # Start development server
npm run build                 # Production build
npm run preview               # Preview production build

# Quality checks
npm run lint                  # Run ESLint (development mode)
npm run lint:ci               # Run ESLint (CI mode - zero warnings)
npm run lint:fix              # Auto-fix ESLint issues
npm run type-check            # TypeScript type checking
npm run type-check:ci         # TypeScript checking (CI mode)
npm run format                # Format with Prettier
npm run format:check          # Check Prettier formatting
npm run quality:check         # Run all quality checks

# Database operations
npm run db:create             # Create Cloudflare D1 database
npm run db:schema             # Apply database schema
npm run db:seed               # Add seed data
npm run db:setup              # Complete database setup

# Deployment
npm run deploy                # Deploy to Cloudflare Pages
npm run deploy:preview        # Deploy to preview environment
```

## 📝 Documentation Standards

### Command Documentation Format

When documenting commands in markdown files:

````markdown
## Command Examples

### GitHub CLI Operations

```powershell
# Repository management
gh repo view --web                    # Open repository in browser
gh pr create --title "feat: new feature" --body "Description"

# Workflow monitoring
gh workflow list                      # List all workflows
gh run list --limit 10               # List recent runs
```
````

### PowerShell File Operations

```powershell
# File system operations
Get-ChildItem -Path "docs" -Recurse -Filter "*.md"  # List markdown files
New-Item -Path "docs/new-file.md" -ItemType File    # Create new file
Test-Path -Path "package.json"                      # Check file existence
```

### Best Practice Guidelines

1. **Always include explanatory comments** for commands
2. **Use full command names** in documentation
3. **Group related commands** logically
4. **Provide context** for when to use each command
5. **Include expected output** when helpful
6. **Use consistent formatting** across all documentation

## 🔍 Command Validation

Before committing documentation with commands:

```powershell
# Test that documented PowerShell commands work
Get-Command Get-ChildItem             # Verify command exists
Get-Help Get-ChildItem -Examples      # View command examples

# Test that GitHub CLI commands are valid
gh --help                             # General help
gh pr --help                          # PR-specific help
gh workflow --help                    # Workflow-specific help
```

## 🎯 Benefits of This Approach

1. **Consistency**: All team members use the same commands
2. **Clarity**: Full command names are self-documenting
3. **Discoverability**: Easy to understand what commands do
4. **Maintainability**: Clear documentation reduces support burden
5. **GitHub Integration**: Leverage GitHub CLI for better workflow integration
6. **Cross-platform**: PowerShell works on Windows, Linux, and macOS

## 📁 Documentation Organization with CLI

### Creating and Managing Documentation Files

**Always create documentation in the `/docs` folder** using PowerShell commands:

```powershell
# Create new documentation file in appropriate subfolder
New-Item -Path "docs/development/NEW_FEATURE.md" -ItemType File -Force

# Create feature documentation with proper structure
New-Item -Path "docs/features" -ItemType Directory -Force
New-Item -Path "docs/features/FEATURE_NAME.md" -ItemType File -Force

# List all documentation files to check organization
Get-ChildItem -Path "docs" -Recurse -Filter "*.md" | Select-Object FullName

# Find documentation files that need reorganization
Get-ChildItem -Path "docs" -Filter "*.md" | Where-Object { $_.Name -like "*database*" }
```

### Folder Structure Optimization Commands

**Use these PowerShell commands to optimize documentation organization:**

```powershell
# Check documentation folder structure
Get-ChildItem -Path "docs" -Recurse -Directory | Sort-Object FullName

# Count files in each documentation folder (identify folders needing reorganization)
Get-ChildItem -Path "docs" -Recurse -Directory | ForEach-Object {
    $fileCount = (Get-ChildItem -Path $_.FullName -Filter "*.md").Count
    [PSCustomObject]@{
        Folder = $_.FullName
        MarkdownFiles = $fileCount
    }
} | Sort-Object MarkdownFiles -Descending

# Move documentation files to better organized structure
Move-Item -Path "docs/old-location.md" -Destination "docs/development/new-location.md"

# Create new documentation categories when needed
New-Item -Path "docs/api" -ItemType Directory -Force
New-Item -Path "docs/user" -ItemType Directory -Force
```

### GitHub CLI for Documentation Management

**Use GitHub CLI to manage documentation through the development workflow:**

```powershell
# Create issues for documentation improvements
gh issue create --title "docs: reorganize database documentation" --body "Consolidate database docs into structured subfolder"

# Create PRs for documentation updates
gh pr create --title "docs: add CLI best practices guide" --body "Comprehensive guide for command line standards"

# Review documentation changes in PRs
gh pr view 123 --web                  # Open documentation PR in browser
gh pr diff 123                        # View documentation changes in terminal
```

Following these CLI best practices ensures that our documentation is clear, consistent, and helpful for all developers working on the Couple Connect project! 🚀
