#!/usr/bin/env pwsh
# GitHub Branch Protection Setup Script
# Configures branch protection rules using GitHub CLI

param(
  [Parameter(Mandatory = $false)]
  [string]$Owner = "and3rn3t",

  [Parameter(Mandatory = $false)]
  [string]$Repo = "couple-connect",

  [Parameter(Mandatory = $false)]
  [switch]$DryRun
)

# Ensure GitHub CLI is installed
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
  Write-Error "GitHub CLI (gh) is not installed. Please install it first: https://cli.github.com/"
  exit 1
}

# Check if authenticated
gh auth status 2>$null
if ($LASTEXITCODE -ne 0) {
  Write-Error "Not authenticated with GitHub CLI. Run 'gh auth login' first."
  exit 1
}

Write-Host "🔒 Setting up GitHub branch protection rules for $Owner/$Repo" -ForegroundColor Green

# Main branch protection configuration
$mainProtection = @{
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
    bypass_pull_request_allowances  = @{
      users = @()
      teams = @()
    }
  }
  restrictions                     = $null
  allow_force_pushes               = $false
  allow_deletions                  = $false
  required_conversation_resolution = $true
}

# Convert to JSON for API call
$mainProtectionJson = $mainProtection | ConvertTo-Json -Depth 10 -Compress

if ($DryRun) {
  Write-Host "🔍 DRY RUN MODE - Configuration that would be applied:" -ForegroundColor Yellow
  Write-Host $mainProtectionJson -ForegroundColor Cyan
  Write-Host "`n✅ Dry run completed. Use without -DryRun to apply changes." -ForegroundColor Green
  exit 0
}

try {
  Write-Host "📝 Applying main branch protection rules..." -ForegroundColor Blue

  # Apply main branch protection using temp file for JSON input
  $tempFile = [System.IO.Path]::GetTempFileName()
  $mainProtectionJson | Out-File -FilePath $tempFile -Encoding UTF8

  gh api "repos/$Owner/$Repo/branches/main/protection" `
    --method PUT `
    --input $tempFile

  Remove-Item $tempFile -Force

  if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Main branch protection rules applied successfully!" -ForegroundColor Green
  }
  else {
    throw "Failed to apply main branch protection"
  }

  # Enable vulnerability alerts
  Write-Host "🔍 Enabling vulnerability alerts..." -ForegroundColor Blue
  gh api "repos/$Owner/$Repo/vulnerability-alerts" --method PUT

  # Enable automated security fixes
  Write-Host "🛠️ Enabling automated security fixes..." -ForegroundColor Blue
  gh api "repos/$Owner/$Repo/automated-security-fixes" --method PUT

  # Enable secret scanning (requires GitHub Advanced Security for private repos)
  Write-Host "🔐 Attempting to enable secret scanning..." -ForegroundColor Blue
  try {
    gh api "repos/$Owner/$Repo/secret-scanning/alerts" --method GET > $null
    Write-Host "✅ Secret scanning is available" -ForegroundColor Green
  }
  catch {
    Write-Host "⚠️ Secret scanning requires GitHub Advanced Security" -ForegroundColor Yellow
  }

  Write-Host "`n🎉 GitHub security configuration completed!" -ForegroundColor Green
  Write-Host "📋 Next steps:" -ForegroundColor Cyan
  Write-Host "  1. Review the applied settings in your GitHub repository settings"
  Write-Host "  2. Ensure all CI/CD workflows are configured to match required status checks"
  Write-Host "  3. Update team members about the new protection rules"
  Write-Host "  4. Test the branch protection by creating a test pull request"

}
catch {
  Write-Error "❌ Failed to configure GitHub settings: $_"
  Write-Host "📘 Manual configuration may be required via GitHub web interface" -ForegroundColor Yellow
  exit 1
}

# Display current protection status
Write-Host "`n📊 Current branch protection status:" -ForegroundColor Blue
try {
  $protection = gh api "repos/$Owner/$Repo/branches/main/protection" | ConvertFrom-Json
  Write-Host "✅ Enforce admins: $($protection.enforce_admins.enabled)" -ForegroundColor Green
  Write-Host "✅ Required reviews: $($protection.required_pull_request_reviews.required_approving_review_count)" -ForegroundColor Green
  Write-Host "✅ Status checks: $($protection.required_status_checks.contexts.Count) required" -ForegroundColor Green
}
catch {
  Write-Host "⚠️ Could not retrieve protection status" -ForegroundColor Yellow
}
