# Infinite Re-render Loop Detection Script (PowerShell)
#
# This script scans the codebase for potential infinite re-render loops
# based on the patterns identified in the August 16, 2025 incident.

param(
  [string]$SourceDir = "src",
  [switch]$Verbose = $false
)

$ErrorActionPreference = "Stop"

class InfiniteLoopResult {
  [string]$Level
  [string]$FilePath
  [int]$StartLine
  [int]$EndLine
  [string]$Message
  [string]$Suggestion
}

function Write-ColorOutput {
  param(
    [string]$Message,
    [string]$Color = "White"
  )

  $colorMap = @{
    "Red"    = [System.ConsoleColor]::Red
    "Green"  = [System.ConsoleColor]::Green
    "Yellow" = [System.ConsoleColor]::Yellow
    "Blue"   = [System.ConsoleColor]::Blue
    "Cyan"   = [System.ConsoleColor]::Cyan
    "White"  = [System.ConsoleColor]::White
  }

  Write-Host $Message -ForegroundColor $colorMap[$Color]
}

function Test-InfiniteLoops {
  param(
    [string]$SourceDirectory
  )

  $issues = @()
  $warnings = @()
  $scannedFiles = 0

  Write-ColorOutput "🔍 Scanning for infinite re-render loop patterns..." "Cyan"
  Write-ColorOutput "📁 Scanning directory: $SourceDirectory" "Blue"

  if (-not (Test-Path $SourceDirectory)) {
    Write-ColorOutput "❌ Source directory does not exist: $SourceDirectory" "Red"
    return $false
  }

  # Get all React files
  $reactFiles = Get-ChildItem -Path $SourceDirectory -Recurse -Include "*.tsx", "*.jsx", "*.ts", "*.js" |
  Where-Object { $_.Directory.Name -notmatch "node_modules|\.git|dist|build|\.next|__tests__|test-results" }

  foreach ($file in $reactFiles) {
    $scannedFiles++

    if ($Verbose) {
      Write-ColorOutput "Scanning: $($file.FullName)" "Gray"
    }

    $content = Get-Content $file.FullName -Raw
    $lines = Get-Content $file.FullName
    $relativePath = $file.FullName.Replace((Get-Location).Path, "").TrimStart("\")

    # Check for useEffect patterns
    $results = Test-UseEffectPatterns -Content $content -Lines $lines -FilePath $relativePath
    $issues += $results.Issues
    $warnings += $results.Warnings
  }

  # Report results
  Write-ColorOutput "`n$("=" * 60)" "White"
  Write-ColorOutput "📊 Scan Complete: $scannedFiles files scanned" "Blue"

  if ($issues.Count -eq 0 -and $warnings.Count -eq 0) {
    Write-ColorOutput "✅ No infinite re-render patterns detected!" "Green"
    return $true
  }

  if ($issues.Count -gt 0) {
    Write-ColorOutput "`n🚨 CRITICAL ISSUES FOUND: $($issues.Count)" "Red"
    Write-ColorOutput "These patterns are likely to cause infinite re-render loops:`n" "Red"

    for ($i = 0; $i -lt $issues.Count; $i++) {
      $issue = $issues[$i]
      Write-ColorOutput "$($i + 1). 📁 $($issue.FilePath):$($issue.StartLine)-$($issue.EndLine)" "Red"
      Write-ColorOutput "   ❌ $($issue.Message)" "Red"
      Write-ColorOutput "   💡 $($issue.Suggestion)`n" "Yellow"
    }
  }

  if ($warnings.Count -gt 0) {
    Write-ColorOutput "`n⚠️  WARNINGS: $($warnings.Count)" "Yellow"
    Write-ColorOutput "These patterns might cause performance issues:`n" "Yellow"

    for ($i = 0; $i -lt $warnings.Count; $i++) {
      $warning = $warnings[$i]
      Write-ColorOutput "$($i + 1). 📁 $($warning.FilePath):$($warning.StartLine)-$($warning.EndLine)" "Yellow"
      Write-ColorOutput "   ⚠️  $($warning.Message)" "Yellow"
      Write-ColorOutput "   💡 $($warning.Suggestion)`n" "Cyan"
    }
  }

  # Summary
  Write-ColorOutput "$("=" * 60)" "White"
  Write-ColorOutput "📊 SUMMARY:" "Blue"
  Write-ColorOutput "   Files scanned: $scannedFiles" "Blue"
  Write-ColorOutput "   Critical issues: $($issues.Count)" "Blue"
  Write-ColorOutput "   Warnings: $($warnings.Count)" "Blue"

  if ($issues.Count -gt 0) {
    Write-ColorOutput "`n❌ DEPLOYMENT BLOCKED: Critical infinite loop patterns detected!" "Red"
    Write-ColorOutput "   Fix these issues before deploying to prevent blank screens." "Red"
    return $false
  }
  else {
    Write-ColorOutput "`n✅ Safe to deploy: No critical infinite loop patterns found" "Green"
    return $true
  }
}

function Test-UseEffectPatterns {
  param(
    [string]$Content,
    [string[]]$Lines,
    [string]$FilePath
  )

  $issues = @()
  $warnings = @()

  for ($i = 0; $i -lt $Lines.Count; $i++) {
    $line = $Lines[$i]
    $lineNum = $i + 1

    # Find useEffect declarations
    if ($line -match "useEffect\s*\(") {
      $effectBlock = Get-UseEffectBlock -Lines $Lines -StartIndex $i
      $analysis = Test-UseEffectBlock -EffectBlock $effectBlock -FilePath $FilePath

      $issues += $analysis.Issues
      $warnings += $analysis.Warnings
    }
  }

  return @{
    Issues   = $issues
    Warnings = $warnings
  }
}

function Get-UseEffectBlock {
  param(
    [string[]]$Lines,
    [int]$StartIndex
  )

  $braceCount = 0
  $inEffect = $false
  $endIndex = $StartIndex

  for ($i = $StartIndex; $i -lt $Lines.Count; $i++) {
    $line = $Lines[$i]

    if ($line -match "useEffect") {
      $inEffect = $true
    }

    if ($inEffect) {
      $braceCount += ([regex]::Matches($line, "\{")).Count
      $braceCount -= ([regex]::Matches($line, "\}")).Count

      if ($braceCount -eq 0 -and $line -match "\}") {
        $endIndex = $i
        break
      }
    }
  }

  return @{
    Content   = ($Lines[$StartIndex..$endIndex] -join "`n")
    StartLine = $StartIndex + 1
    EndLine   = $endIndex + 1
  }
}

function Test-UseEffectBlock {
  param(
    [hashtable]$EffectBlock,
    [string]$FilePath
  )

  $issues = @()
  $warnings = @()
  $content = $EffectBlock.Content
  $startLine = $EffectBlock.StartLine
  $endLine = $EffectBlock.EndLine

  # Extract dependency array
  $depsMatch = [regex]::Match($content, "\}\s*,\s*\[(.*?)\]\s*\)\s*;?\s*$", [System.Text.RegularExpressions.RegexOptions]::Singleline)
  $deps = if ($depsMatch.Success) { $depsMatch.Groups[1].Value.Trim() } else { $null }

  # Check for missing dependency array with state setters
  if (-not ($content -match "\],\s*\)" -or $content -match "\[\]\s*\)")) {
    if ($content -match "set[A-Z]\w+\(") {
      $issue = New-Object InfiniteLoopResult
      $issue.Level = "CRITICAL"
      $issue.FilePath = $FilePath
      $issue.StartLine = $startLine
      $issue.EndLine = $endLine
      $issue.Message = "useEffect with state setters missing dependency array"
      $issue.Suggestion = "Add empty dependency array [] if this should run only once, or include proper dependencies"
      $issues += $issue
    }
  }

  # Check for state setters in dependency array
  if ($deps) {
    $stateSetters = [regex]::Matches($content, "set[A-Z]\w+") | ForEach-Object { $_.Value }
    $depsList = $deps -split "," | ForEach-Object { $_.Trim() }

    foreach ($setter in $stateSetters) {
      $stateName = $setter -replace "set", "" | ForEach-Object { $_.ToLower() }
      if ($depsList | Where-Object { $_.ToLower() -match $stateName }) {
        $issue = New-Object InfiniteLoopResult
        $issue.Level = "CRITICAL"
        $issue.FilePath = $FilePath
        $issue.StartLine = $startLine
        $issue.EndLine = $endLine
        $issue.Message = "Potential infinite loop: $setter modifies state that's in dependency array"
        $issue.Suggestion = "Remove the state from dependencies or use empty array [] for one-time effects"
        $issues += $issue
      }
    }
  }

  return @{
    Issues   = $issues
    Warnings = $warnings
  }
}

# Main execution
$result = Test-InfiniteLoops -SourceDirectory $SourceDir
exit $(if ($result) { 0 } else { 1 })
