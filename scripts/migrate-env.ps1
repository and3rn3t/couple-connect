# 🔄 Environment Configuration Migration Script
# This script helps migrate from old .env files to the new .env folder structure

param(
  [string]$Action = "migrate",
  [switch]$Force = $false
)

function Write-Header {
  param([string]$Title)
  Write-Host "`n🔧 $Title" -ForegroundColor Cyan
  Write-Host ("=" * ($Title.Length + 3)) -ForegroundColor Cyan
}

function Write-Success {
  param([string]$Message)
  Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Warning {
  param([string]$Message)
  Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Write-Info {
  param([string]$Message)
  Write-Host "ℹ️  $Message" -ForegroundColor Blue
}

function Write-Error {
  param([string]$Message)
  Write-Host "❌ $Message" -ForegroundColor Red
}

function Backup-ExistingFiles {
  Write-Header "Backing Up Existing Environment Files"

  $backupFolder = "env-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"

  if (-not (Test-Path $backupFolder)) {
    New-Item -Path $backupFolder -ItemType Directory -Force | Out-Null
    Write-Success "Created backup folder: $backupFolder"
  }

  $envFiles = @('.env', '.env.local', '.env.development', '.env.production', '.env.staging', '.env.test')
  $backedUpFiles = 0

  foreach ($file in $envFiles) {
    if (Test-Path $file) {
      Copy-Item $file -Destination "$backupFolder/" -Force
      Write-Success "Backed up: $file"
      $backedUpFiles++
    }
  }

  if ($backedUpFiles -eq 0) {
    Write-Info "No existing environment files found to backup"
    Remove-Item $backupFolder -Force
  }
  else {
    Write-Success "Backed up $backedUpFiles environment files to $backupFolder"
  }

  return $backedUpFiles -gt 0
}

function Setup-Development-Environment {
  Write-Header "Setting Up Development Environment"

  if (Test-Path ".env.local" -and -not $Force) {
    Write-Warning ".env.local already exists. Use -Force to overwrite."
    return
  }

  # Copy base configuration
  Copy-Item ".env/.env.base" ".env.local" -Force
  Write-Success "Copied base configuration"

  # Append development-specific settings
  Get-Content ".env/.env.development" | Add-Content ".env.local"
  Write-Success "Added development-specific settings"

  Write-Info "Development environment configured successfully!"
  Write-Info "You can now run: npm run dev"
}

function Show-Migration-Status {
  Write-Header "Environment Configuration Status"

  # Check .env folder structure
  if (Test-Path ".env") {
    Write-Success ".env folder exists"

    $envFiles = @(
      '.env.base',
      '.env.development',
      '.env.production',
      '.env.staging',
      '.env.test',
      '.env.example',
      'README.md'
    )

    foreach ($file in $envFiles) {
      $filePath = ".env/$file"
      if (Test-Path $filePath) {
        Write-Success "✓ $file"
      }
      else {
        Write-Error "✗ $file (missing)"
      }
    }
  }
  else {
    Write-Error ".env folder not found!"
  }

  Write-Host ""

  # Check current environment setup
  if (Test-Path ".env.local") {
    Write-Success ".env.local exists"

    $envContent = Get-Content ".env.local" -Raw
    if ($envContent -match "VITE_ENVIRONMENT=([^\r\n]+)") {
      $environment = $matches[1]
      Write-Info "Current environment: $environment"
    }
    else {
      Write-Warning "VITE_ENVIRONMENT not found in .env.local"
    }
  }
  else {
    Write-Warning ".env.local not found - no environment configured"
    Write-Info "Run one of these commands to setup an environment:"
    Write-Host "  npm run env:dev     # Development environment" -ForegroundColor Yellow
    Write-Host "  npm run env:staging # Staging environment" -ForegroundColor Yellow
    Write-Host "  npm run env:prod    # Production environment" -ForegroundColor Yellow
    Write-Host "  npm run env:test    # Testing environment" -ForegroundColor Yellow
  }

  Write-Host ""

  # Check for legacy files
  $legacyFiles = @('.env', '.env.development', '.env.production', '.env.staging', '.env.test')
  $foundLegacy = $false

  foreach ($file in $legacyFiles) {
    if (Test-Path $file) {
      if (-not $foundLegacy) {
        Write-Warning "Legacy environment files found:"
        $foundLegacy = $true
      }
      Write-Host "  - $file" -ForegroundColor Red
    }
  }

  if ($foundLegacy) {
    Write-Info "Consider removing legacy files after confirming new setup works"
  }
}

function Show-Environment-Options {
  Write-Header "Available Environment Configurations"

  Write-Host "🛠️  Development (.env.development)" -ForegroundColor Yellow
  Write-Host "   - Local API endpoints (localhost:8787)"
  Write-Host "   - Debug tools enabled"
  Write-Host "   - Relaxed security for testing"
  Write-Host "   - Mock services where appropriate"
  Write-Host ""

  Write-Host "🧪 Staging (.env.staging)" -ForegroundColor Yellow
  Write-Host "   - Staging API endpoints"
  Write-Host "   - Production-like settings"
  Write-Host "   - Test analytics accounts"
  Write-Host "   - Enhanced logging for validation"
  Write-Host ""

  Write-Host "🚀 Production (.env.production)" -ForegroundColor Yellow
  Write-Host "   - Production API endpoints"
  Write-Host "   - Strict security policies"
  Write-Host "   - Real service integrations"
  Write-Host "   - Optimized performance settings"
  Write-Host ""

  Write-Host "🔬 Testing (.env.test)" -ForegroundColor Yellow
  Write-Host "   - Mock API endpoints"
  Write-Host "   - All external services mocked"
  Write-Host "   - Accelerated features for testing"
  Write-Host "   - Isolated storage"
  Write-Host ""

  Write-Info "Use npm scripts to switch environments:"
  Write-Host "  npm run env:dev     # Setup development" -ForegroundColor Cyan
  Write-Host "  npm run env:staging # Setup staging" -ForegroundColor Cyan
  Write-Host "  npm run env:prod    # Setup production" -ForegroundColor Cyan
  Write-Host "  npm run env:test    # Setup testing" -ForegroundColor Cyan
  Write-Host "  npm run env:check   # Check current setup" -ForegroundColor Cyan
}

function Validate-Environment-Setup {
  Write-Header "Validating Environment Configuration"

  if (-not (Test-Path ".env.local")) {
    Write-Error ".env.local not found!"
    Write-Info "Run 'npm run env:dev' to setup development environment"
    return $false
  }

  # Check for required variables
  $content = Get-Content ".env.local" -Raw
  $requiredVars = @(
    'VITE_APP_NAME',
    'VITE_ENVIRONMENT',
    'VITE_API_URL'
  )

  $allValid = $true
  foreach ($var in $requiredVars) {
    if ($content -match "$var=(.+)") {
      $value = $matches[1].Trim()
      if ($value -and $value -ne "") {
        Write-Success "$var = $value"
      }
      else {
        Write-Error "$var is empty"
        $allValid = $false
      }
    }
    else {
      Write-Error "$var not found"
      $allValid = $false
    }
  }

  if ($allValid) {
    Write-Success "Environment configuration is valid!"
    Write-Info "You can now run: npm run dev"
  }
  else {
    Write-Error "Environment configuration has issues"
    Write-Info "Try recreating with: npm run env:dev"
  }

  return $allValid
}

function Show-Help {
  Write-Host "🔄 Environment Configuration Migration Helper" -ForegroundColor Cyan
  Write-Host ""
  Write-Host "Usage: .\migrate-env.ps1 -Action <action> [-Force]" -ForegroundColor Yellow
  Write-Host ""
  Write-Host "Actions:" -ForegroundColor Green
  Write-Host "  migrate    - Full migration from old to new structure"
  Write-Host "  backup     - Backup existing environment files"
  Write-Host "  setup-dev  - Setup development environment (.env.local)"
  Write-Host "  status     - Show current environment status"
  Write-Host "  options    - Show available environment options"
  Write-Host "  validate   - Validate current environment setup"
  Write-Host "  help       - Show this help message"
  Write-Host ""
  Write-Host "Options:" -ForegroundColor Blue
  Write-Host "  -Force     - Overwrite existing files without prompting"
  Write-Host ""
  Write-Host "Examples:" -ForegroundColor Yellow
  Write-Host "  .\migrate-env.ps1 -Action migrate"
  Write-Host "  .\migrate-env.ps1 -Action setup-dev -Force"
  Write-Host "  .\migrate-env.ps1 -Action status"
  Write-Host ""
}

# Main execution
switch ($Action.ToLower()) {
  "migrate" {
    Backup-ExistingFiles
    Setup-Development-Environment
    Show-Migration-Status
  }
  "backup" {
    Backup-ExistingFiles
  }
  "setup-dev" {
    Setup-Development-Environment
  }
  "status" {
    Show-Migration-Status
  }
  "options" {
    Show-Environment-Options
  }
  "validate" {
    Validate-Environment-Setup
  }
  "help" {
    Show-Help
  }
  default {
    Write-Warning "Unknown action: $Action"
    Show-Help
  }
}
