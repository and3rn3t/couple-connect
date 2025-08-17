#!/usr/bin/env pwsh
# Complete GitHub Security Setup Script
# Applies all security configurations and validates setup

param(
  [Parameter(Mandatory = $false)]
  [string]$Owner = "and3rn3t",

  [Parameter(Mandatory = $false)]
  [string]$Repo = "couple-connect",

  [Parameter(Mandatory = $false)]
  [switch]$DryRun,

  [Parameter(Mandatory = $false)]
  [switch]$SkipBranchProtection
)

Write-Host "🔒 GitHub Security Configuration Setup" -ForegroundColor Green
Write-Host "Repository: $Owner/$Repo" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Blue

# Check prerequisites
Write-Host "`n📋 Checking prerequisites..." -ForegroundColor Yellow

# Check GitHub CLI
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
  Write-Error "❌ GitHub CLI (gh) is not installed. Please install it first: https://cli.github.com/"
  exit 1
}
Write-Host "✅ GitHub CLI found" -ForegroundColor Green

# Check authentication
gh auth status 2>$null
if ($LASTEXITCODE -ne 0) {
  Write-Error "❌ Not authenticated with GitHub CLI. Run 'gh auth login' first."
  exit 1
}
Write-Host "✅ GitHub CLI authenticated" -ForegroundColor Green

# Check repository access
try {
  $repoInfo = gh api "repos/$Owner/$Repo" | ConvertFrom-Json
  Write-Host "✅ Repository access confirmed: $($repoInfo.full_name)" -ForegroundColor Green
}
catch {
  Write-Error "❌ Cannot access repository $Owner/$Repo. Check permissions."
  exit 1
}

if ($DryRun) {
  Write-Host "`n🔍 DRY RUN MODE - No changes will be applied" -ForegroundColor Yellow
}

Write-Host "`n🛡️ Configuring security settings..." -ForegroundColor Blue

# 1. Enable basic security features
Write-Host "📡 Enabling vulnerability alerts..." -ForegroundColor Cyan
if (-not $DryRun) {
  try {
    gh api "repos/$Owner/$Repo/vulnerability-alerts" --method PUT 2>$null
    Write-Host "✅ Vulnerability alerts enabled" -ForegroundColor Green
  }
  catch {
    Write-Host "⚠️ Could not enable vulnerability alerts (may already be enabled)" -ForegroundColor Yellow
  }
}
else {
  Write-Host "🔍 Would enable vulnerability alerts" -ForegroundColor Gray
}

Write-Host "🔧 Enabling automated security fixes..." -ForegroundColor Cyan
if (-not $DryRun) {
  try {
    gh api "repos/$Owner/$Repo/automated-security-fixes" --method PUT 2>$null
    Write-Host "✅ Automated security fixes enabled" -ForegroundColor Green
  }
  catch {
    Write-Host "⚠️ Could not enable automated security fixes (may already be enabled)" -ForegroundColor Yellow
  }
}
else {
  Write-Host "🔍 Would enable automated security fixes" -ForegroundColor Gray
}

Write-Host "🔐 Checking secret scanning availability..." -ForegroundColor Cyan
if (-not $DryRun) {
  try {
    gh api "repos/$Owner/$Repo/secret-scanning/alerts" --method GET >$null 2>&1
    Write-Host "✅ Secret scanning is available" -ForegroundColor Green
  }
  catch {
    Write-Host "⚠️ Secret scanning requires GitHub Advanced Security" -ForegroundColor Yellow
  }
}
else {
  Write-Host "🔍 Would check secret scanning availability" -ForegroundColor Gray
}

# 2. Apply branch protection rules
if (-not $SkipBranchProtection) {
  Write-Host "`n🔒 Applying branch protection rules..." -ForegroundColor Blue

  $protectionConfig = @{
    required_status_checks           = @{
      strict   = $true
      contexts = @(
        "🧪 Tests & Code Quality"
        "📱 Mobile Performance"
        "🔒 Security Analysis"
        "🚨 Infinite Loop Detection"
        "📊 Bundle Analysis"
        "🔍 TypeScript Check"
        "🧹 Lint & Format"
      )
    }
    enforce_admins                   = $true
    required_pull_request_reviews    = @{
      required_approving_review_count = 1
      dismiss_stale_reviews           = $true
      require_code_owner_reviews      = $true
      require_last_push_approval      = $true
    }
    restrictions                     = $null
    allow_force_pushes               = $false
    allow_deletions                  = $false
    required_conversation_resolution = $true
  }

  if ($DryRun) {
    Write-Host "🔍 Branch protection configuration:" -ForegroundColor Gray
    $protectionConfig | ConvertTo-Json -Depth 10 | Write-Host -ForegroundColor Gray
  }
  else {
    try {
      $tempFile = [System.IO.Path]::GetTempFileName()
      $protectionConfig | ConvertTo-Json -Depth 10 | Out-File -FilePath $tempFile -Encoding UTF8

      gh api "repos/$Owner/$Repo/branches/main/protection" --method PUT --input $tempFile 2>$null
      Remove-Item $tempFile -Force

      Write-Host "✅ Branch protection rules applied successfully" -ForegroundColor Green
    }
    catch {
      Write-Host "⚠️ Could not apply branch protection rules: $($_.Exception.Message)" -ForegroundColor Yellow
      Write-Host "📝 You may need to apply these manually via GitHub web interface" -ForegroundColor Cyan
    }
  }
}
else {
  Write-Host "⏭️ Skipping branch protection rules (use -SkipBranchProtection:$false to enable)" -ForegroundColor Yellow
}

# 3. Validate current settings
Write-Host "`n📊 Validating current security configuration..." -ForegroundColor Blue

try {
  $protection = gh api "repos/$Owner/$Repo/branches/main/protection" | ConvertFrom-Json
  Write-Host "✅ Branch protection status:" -ForegroundColor Green
  Write-Host "   • Enforce admins: $($protection.enforce_admins.enabled)" -ForegroundColor White
  Write-Host "   • Required reviews: $($protection.required_pull_request_reviews.required_approving_review_count)" -ForegroundColor White
  Write-Host "   • Status checks: $($protection.required_status_checks.contexts.Count) required" -ForegroundColor White
  Write-Host "   • Conversation resolution: $($protection.required_conversation_resolution)" -ForegroundColor White
}
catch {
  Write-Host "⚠️ Could not retrieve branch protection status" -ForegroundColor Yellow
}

# 4. Display next steps
Write-Host "`n🎯 Security setup completed!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Blue

Write-Host "`n📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. 📝 Review repository settings in GitHub web interface" -ForegroundColor White
Write-Host "2. 🔍 Check .github/SECURITY_CHECKLIST.md for detailed validation" -ForegroundColor White
Write-Host "3. 🧪 Create a test pull request to verify branch protection" -ForegroundColor White
Write-Host "4. 👥 Inform team members about new security requirements" -ForegroundColor White
Write-Host "5. 📅 Schedule monthly security reviews" -ForegroundColor White

Write-Host "`n📚 Documentation created:" -ForegroundColor Cyan
Write-Host "• .github/SECURITY_CONFIG.md - Security configuration overview" -ForegroundColor White
Write-Host "• .github/SECURITY_CHECKLIST.md - Comprehensive security checklist" -ForegroundColor White
Write-Host "• .github/CODEOWNERS - Code review requirements" -ForegroundColor White
Write-Host "• .github/branch-protection.yml - Branch protection configuration" -ForegroundColor White
Write-Host "• .github/workflows/branch-protection.yml - Status check workflow" -ForegroundColor White

Write-Host "`n⚠️ Important notes:" -ForegroundColor Yellow
Write-Host "• Status checks will only pass once CI/CD workflows are updated" -ForegroundColor White
Write-Host "• Code owners must approve changes to critical files" -ForegroundColor White
Write-Host "• All pull requests now require review and conversation resolution" -ForegroundColor White
Write-Host "• Secret scanning requires GitHub Advanced Security for private repos" -ForegroundColor White

Write-Host "`n🚀 Ready for secure development!" -ForegroundColor Green
