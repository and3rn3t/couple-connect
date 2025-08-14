# 📁 Documentation Organization Helper Script
# This script helps maintain organized documentation structure

param(
  [string]$Action = "check",
  [string]$Path = "docs"
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

function Check-DocumentationStructure {
  Write-Header "Documentation Structure Analysis"

  if (-not (Test-Path $Path)) {
    Write-Warning "Documentation folder '$Path' not found!"
    return
  }

  # Count files in each folder
  Write-Info "Analyzing folder structure..."

  $folders = Get-ChildItem -Path $Path -Recurse -Directory | Sort-Object FullName
  $rootFiles = Get-ChildItem -Path $Path -Filter "*.md" | Measure-Object | Select-Object -ExpandProperty Count

  Write-Host "`n📊 Documentation Statistics:" -ForegroundColor Yellow
  Write-Host "Root markdown files: $rootFiles"

  foreach ($folder in $folders) {
    $markdownFiles = (Get-ChildItem -Path $folder.FullName -Filter "*.md").Count
    $relativePath = $folder.FullName.Replace((Get-Location).Path, "").TrimStart('\')

    if ($markdownFiles -gt 10) {
      Write-Warning "$relativePath has $markdownFiles files (consider reorganizing)"
    }
    elseif ($markdownFiles -eq 0) {
      Write-Info "$relativePath is empty (consider removing or adding content)"
    }
    else {
      Write-Success "$relativePath has $markdownFiles files (well organized)"
    }
  }

  # Check for documentation that might need reorganization
  Write-Host "`n🔍 Checking for potential reorganization opportunities:" -ForegroundColor Yellow

  $allMarkdownFiles = Get-ChildItem -Path $Path -Recurse -Filter "*.md"
  $patterns = @{
    "database"   = @()
    "api"        = @()
    "user"       = @()
    "setup"      = @()
    "deployment" = @()
  }

  foreach ($file in $allMarkdownFiles) {
    $fileName = $file.Name.ToLower()
    foreach ($pattern in $patterns.Keys) {
      if ($fileName -contains $pattern -or $fileName -like "*$pattern*") {
        $patterns[$pattern] += $file.FullName.Replace((Get-Location).Path, "").TrimStart('\')
      }
    }
  }

  foreach ($pattern in $patterns.Keys) {
    if ($patterns[$pattern].Count -gt 1) {
      Write-Info "Found $($patterns[$pattern].Count) $pattern-related files:"
      $patterns[$pattern] | ForEach-Object { Write-Host "  - $_" -ForegroundColor Gray }
      Write-Host "  Consider organizing in docs/$pattern/ folder" -ForegroundColor Cyan
    }
  }
}

function Validate-DocumentationLinks {
  Write-Header "Validating Documentation Links"

  $allMarkdownFiles = Get-ChildItem -Path $Path -Recurse -Filter "*.md"
  $brokenLinks = @()

  foreach ($file in $allMarkdownFiles) {
    $content = Get-Content $file.FullName -Raw
    $links = [regex]::Matches($content, '\[([^\]]*)\]\(([^)]+)\)')

    foreach ($link in $links) {
      $linkPath = $link.Groups[2].Value

      # Skip external links and anchors
      if ($linkPath.StartsWith("http") -or $linkPath.StartsWith("#")) {
        continue
      }

      # Convert relative path to absolute
      $absolutePath = Join-Path (Split-Path $file.FullName) $linkPath

      if (-not (Test-Path $absolutePath)) {
        $brokenLinks += @{
          File = $file.FullName.Replace((Get-Location).Path, "").TrimStart('\')
          Link = $linkPath
          Text = $link.Groups[1].Value
        }
      }
    }
  }

  if ($brokenLinks.Count -eq 0) {
    Write-Success "All documentation links are valid!"
  }
  else {
    Write-Warning "Found $($brokenLinks.Count) broken links:"
    foreach ($broken in $brokenLinks) {
      Write-Host "  📄 $($broken.File)" -ForegroundColor Gray
      Write-Host "    🔗 [$($broken.Text)]($($broken.Link))" -ForegroundColor Red
    }
  }
}

function Create-DocumentationTemplate {
  param([string]$FileName, [string]$Category = "development")

  Write-Header "Creating Documentation Template"

  $categoryPath = Join-Path $Path $Category
  if (-not (Test-Path $categoryPath)) {
    New-Item -Path $categoryPath -ItemType Directory -Force
    Write-Success "Created category folder: $Category"
  }

  $filePath = Join-Path $categoryPath "$FileName.md"

  if (Test-Path $filePath) {
    Write-Warning "File already exists: $filePath"
    return
  }

  $template = @"
# 🔧 $FileName

## 📋 Overview

Brief description of what this document covers.

## 🎯 Purpose

Why this documentation exists and who should read it.

## 📝 Content

### Section 1

Your content here.

### Section 2

More content here.

## 🔗 Related Documentation

- [Related Doc 1](./RELATED_DOC.md) - Description
- [Related Doc 2](../ANOTHER_DOC.md) - Description

## 🚀 Next Steps

What should readers do after reading this document?

---

💡 **Tip**: Update the [DOC_INDEX.md](../DOC_INDEX.md) to include this new documentation!
"@

  Set-Content -Path $filePath -Value $template
  Write-Success "Created documentation template: $filePath"
  Write-Info "Don't forget to update docs/DOC_INDEX.md with the new document!"
}

function Show-Help {
  Write-Host "📚 Documentation Organization Helper" -ForegroundColor Cyan
  Write-Host ""
  Write-Host "Usage: .\organize-docs.ps1 -Action <action> [-Path <path>]" -ForegroundColor Yellow
  Write-Host ""
  Write-Host "Actions:" -ForegroundColor Green
  Write-Host "  check      - Analyze current documentation structure (default)"
  Write-Host "  validate   - Check for broken links in documentation"
  Write-Host "  template   - Create a new documentation template"
  Write-Host "  help       - Show this help message"
  Write-Host ""
  Write-Host "Examples:" -ForegroundColor Blue
  Write-Host "  .\organize-docs.ps1 -Action check"
  Write-Host "  .\organize-docs.ps1 -Action validate"
  Write-Host "  .\organize-docs.ps1 -Action template -Path 'NEW_FEATURE'"
  Write-Host ""
}

# Main execution
switch ($Action.ToLower()) {
  "check" { Check-DocumentationStructure }
  "validate" { Validate-DocumentationLinks }
  "template" {
    if ($Path -eq "docs") {
      $fileName = Read-Host "Enter the documentation file name (without .md extension)"
      $category = Read-Host "Enter the category (development/features/api/user) [default: development]"
      if ([string]::IsNullOrWhiteSpace($category)) { $category = "development" }
      Create-DocumentationTemplate -FileName $fileName -Category $category
    }
    else {
      Create-DocumentationTemplate -FileName $Path
    }
  }
  "help" { Show-Help }
  default {
    Write-Warning "Unknown action: $Action"
    Show-Help
  }
}
