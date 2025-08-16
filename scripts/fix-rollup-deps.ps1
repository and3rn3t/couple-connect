# Fix for Rollup native dependencies issue in CI environments
# PowerShell version for Windows and cross-platform environments

$ErrorActionPreference = "Stop"

Write-Host "🔧 Checking Rollup native dependencies..." -ForegroundColor Cyan

# Get the platform
$Platform = $env:OS
$Arch = $env:PROCESSOR_ARCHITECTURE

# Determine the correct Rollup binary package
$RollupPackage = ""

switch -Regex ($Platform) {
  "Windows" {
    $RollupPackage = "@rollup/rollup-win32-x64-msvc"
  }
  default {
    # For non-Windows, use Node.js to detect
    $NodePlatform = node -e "console.log(process.platform + '-' + process.arch)"
    switch ($NodePlatform) {
      "linux-x64" { $RollupPackage = "@rollup/rollup-linux-x64-gnu" }
      "linux-arm64" { $RollupPackage = "@rollup/rollup-linux-arm64-gnu" }
      "darwin-x64" { $RollupPackage = "@rollup/rollup-darwin-x64" }
      "darwin-arm64" { $RollupPackage = "@rollup/rollup-darwin-arm64" }
      default {
        Write-Host "⚠️ Unknown platform: $NodePlatform, trying generic approach" -ForegroundColor Yellow
      }
    }
  }
}

if ($RollupPackage) {
  Write-Host "📦 Installing $RollupPackage for current platform" -ForegroundColor Green

  # Check if the package is already installed
  $PackageCheck = npm list $RollupPackage 2>$null
  if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ $RollupPackage is already installed" -ForegroundColor Green
  }
  else {
    Write-Host "📥 Installing $RollupPackage..." -ForegroundColor Yellow

    try {
      npm install --no-save --silent "$RollupPackage@latest"
      Write-Host "✅ Successfully installed $RollupPackage" -ForegroundColor Green
    }
    catch {
      Write-Host "❌ Failed to install $RollupPackage, trying alternative approach..." -ForegroundColor Red

      # Alternative: Clear npm cache and reinstall
      Write-Host "🧹 Clearing npm cache..." -ForegroundColor Yellow
      npm cache clean --force

      Write-Host "🔄 Reinstalling dependencies..." -ForegroundColor Yellow
      if (Test-Path "node_modules") { Remove-Item -Recurse -Force "node_modules" }
      if (Test-Path "package-lock.json") { Remove-Item -Force "package-lock.json" }
      npm install

      Write-Host "🔁 Retrying $RollupPackage installation..." -ForegroundColor Yellow
      npm install --no-save --silent "$RollupPackage@latest"
    }
  }
}
else {
  Write-Host "⚠️ Could not determine the correct Rollup package, clearing cache and reinstalling all dependencies..." -ForegroundColor Yellow
  npm cache clean --force
  if (Test-Path "node_modules") { Remove-Item -Recurse -Force "node_modules" }
  if (Test-Path "package-lock.json") { Remove-Item -Force "package-lock.json" }
  npm install
}

Write-Host "✅ Rollup dependencies check completed!" -ForegroundColor Green
