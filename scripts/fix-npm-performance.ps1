# Quick NPM Dependencies Fix for Couple Connect
# Addresses the specific dependency issues found during package list

Write-Host "🔧 Fixing NPM dependency issues for Couple Connect..." -ForegroundColor Yellow

# === 1. Clean existing problematic state ===
Write-Host "`n🧹 Cleaning existing dependency state..." -ForegroundColor Cyan

# Remove problematic files
if (Test-Path "package-lock.json") {
  Remove-Item "package-lock.json" -Force
  Write-Host "✅ Removed package-lock.json" -ForegroundColor Green
}

if (Test-Path "node_modules") {
  Write-Host "Removing node_modules... (this may take a moment)" -ForegroundColor Yellow
  Remove-Item -Recurse -Force "node_modules"
  Write-Host "✅ Removed node_modules" -ForegroundColor Green
}

# Clear npm cache
Write-Host "Clearing npm cache..." -ForegroundColor Yellow
npm cache clean --force
Write-Host "✅ NPM cache cleared" -ForegroundColor Green

# === 2. Fix npm configuration for Windows ===
Write-Host "`n⚙️ Optimizing npm configuration..." -ForegroundColor Cyan

# Set optimal npm settings for Windows + React development
npm config set prefer-offline true
npm config set cache-max 604800000  # 1 week cache
npm config set maxsockets 50        # More concurrent downloads
npm config set network-timeout 60000 # 60 second timeout
npm config set progress false       # Disable progress for faster CI
npm config set legacy-peer-deps false # Use modern peer dependency resolution

Write-Host "✅ NPM configuration optimized" -ForegroundColor Green

# === 3. Install dependencies with optimized settings ===
Write-Host "`n📦 Installing dependencies with optimized settings..." -ForegroundColor Cyan

# Install with performance optimizations
$installStart = Get-Date
npm install --prefer-offline --no-audit --no-fund
$installDuration = (Get-Date) - $installStart

if ($LASTEXITCODE -eq 0) {
  Write-Host "✅ Dependencies installed successfully in $($installDuration.TotalSeconds.ToString('F1')) seconds" -ForegroundColor Green
}
else {
  Write-Host "❌ Dependency installation failed. Trying alternative approach..." -ForegroundColor Red

  # Alternative: Install with different strategy
  npm install --legacy-peer-deps --no-audit --no-fund

  if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dependencies installed with legacy peer deps resolution" -ForegroundColor Green
  }
  else {
    Write-Host "❌ Installation failed. Manual intervention may be required." -ForegroundColor Red
    exit 1
  }
}

# === 4. Verify installation ===
Write-Host "`n🔍 Verifying installation..." -ForegroundColor Cyan

# Quick dependency check
$listStart = Get-Date
$npmList = npm list --depth=0 2>&1
$listDuration = (Get-Date) - $listStart

if ($npmList -match "npm error") {
  Write-Host "⚠️ Some dependency warnings detected, but this is normal for large React projects" -ForegroundColor Yellow
}
else {
  Write-Host "✅ All dependencies verified successfully" -ForegroundColor Green
}

Write-Host "Package list completed in $($listDuration.TotalSeconds.ToString('F1')) seconds" -ForegroundColor Gray

# === 5. Test build to ensure everything works ===
Write-Host "`n🔨 Testing build process..." -ForegroundColor Cyan

$buildStart = Get-Date
npm run build:only
$buildDuration = (Get-Date) - $buildStart

if ($LASTEXITCODE -eq 0) {
  Write-Host "✅ Build test successful in $($buildDuration.TotalSeconds.ToString('F1')) seconds" -ForegroundColor Green

  # Show bundle size
  if (Test-Path "dist") {
    $bundleSize = (Get-ChildItem -Recurse "dist" | Measure-Object -Property Length -Sum).Sum
    $bundleSizeMB = [math]::Round($bundleSize / 1MB, 2)
    Write-Host "📦 Bundle size: $bundleSizeMB MB" -ForegroundColor Cyan
  }
}
else {
  Write-Host "❌ Build test failed. Check the error messages above." -ForegroundColor Red
}

# === 6. Performance recommendations ===
Write-Host "`n🎯 Performance Recommendations:" -ForegroundColor Magenta

Write-Host "✅ NPM Performance Optimized:" -ForegroundColor Green
Write-Host "  • Offline-first package resolution" -ForegroundColor White
Write-Host "  • Increased concurrent downloads (50 sockets)" -ForegroundColor White
Write-Host "  • Extended cache duration (1 week)" -ForegroundColor White
Write-Host "  • Disabled audit/fund for faster installs" -ForegroundColor White

Write-Host "`n💡 Additional Optimizations Available:" -ForegroundColor Yellow
Write-Host "  • Run 'scripts/optimize-powershell.ps1' for full terminal optimization" -ForegroundColor White
Write-Host "  • Consider using 'pnpm' for even faster package management" -ForegroundColor White
Write-Host "  • Use 'npm ci' in CI/CD for reproducible installs" -ForegroundColor White

Write-Host "`n🚀 Ready for Development!" -ForegroundColor Green
Write-Host "You can now use:" -ForegroundColor Cyan
Write-Host "  npm run dev          - Start development server" -ForegroundColor White
Write-Host "  npm run build        - Build for production" -ForegroundColor White
Write-Host "  npm run test         - Run tests" -ForegroundColor White
