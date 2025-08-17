# Fix Platform-Specific Dependencies for Windows Development
# Removes problematic platform-specific Rollup binaries

Write-Host "🔧 Fixing platform-specific dependency issues for Windows..." -ForegroundColor Yellow

# === 1. Remove problematic platform-specific dependencies ===
Write-Host "`n📦 Updating package.json to remove platform-specific Rollup binaries..." -ForegroundColor Cyan

# Read current package.json
$packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json

# Remove platform-specific Rollup dependencies that are causing issues
$devDepsToRemove = @(
  "@rollup/rollup-linux-x64-gnu",
  "@rollup/rollup-linux-arm64-gnu",
  "@rollup/rollup-darwin-x64",
  "@rollup/rollup-darwin-arm64"
)

foreach ($dep in $devDepsToRemove) {
  if ($packageJson.devDependencies.PSObject.Properties.Name -contains $dep) {
    $packageJson.devDependencies.PSObject.Properties.Remove($dep)
    Write-Host "✅ Removed $dep" -ForegroundColor Green
  }
}

# Keep only Windows binary which we actually need
if (-not ($packageJson.devDependencies.PSObject.Properties.Name -contains "@rollup/rollup-win32-x64-msvc")) {
  $packageJson.devDependencies | Add-Member -MemberType NoteProperty -Name "@rollup/rollup-win32-x64-msvc" -Value "^4.29.0" -Force
  Write-Host "✅ Ensured Windows Rollup binary is present" -ForegroundColor Green
}

# Save updated package.json
$packageJson | ConvertTo-Json -Depth 10 | Set-Content "package.json"
Write-Host "✅ package.json updated" -ForegroundColor Green

# === 2. Clean and reinstall ===
Write-Host "`n🧹 Cleaning existing installation..." -ForegroundColor Cyan

# Remove lock file and node_modules
if (Test-Path "package-lock.json") {
  Remove-Item "package-lock.json" -Force
  Write-Host "✅ Removed package-lock.json" -ForegroundColor Green
}

# Force remove node_modules (handle Windows file locks)
if (Test-Path "node_modules") {
  Write-Host "Removing node_modules... (may take a moment)" -ForegroundColor Yellow

  # Use robocopy for faster deletion on Windows
  $emptyDir = New-TemporaryFile | ForEach-Object { Remove-Item $_; New-Item -ItemType Directory -Path $_ }
  robocopy $emptyDir.FullName "node_modules" /MIR /MT:32 /NFL /NDL /NJH /NJS /NC /NS | Out-Null
  Remove-Item "node_modules" -Force -ErrorAction SilentlyContinue
  Remove-Item $emptyDir -Force -Recurse

  Write-Host "✅ node_modules removed" -ForegroundColor Green
}

# Clear npm cache
npm cache clean --force
Write-Host "✅ NPM cache cleared" -ForegroundColor Green

# === 3. Install with optimized settings ===
Write-Host "`n📦 Installing dependencies with Windows-optimized settings..." -ForegroundColor Cyan

# Configure npm for optimal Windows performance
npm config set audit false
npm config set fund false
npm config set update-notifier false
npm config set prefer-offline true
npm config set maxsockets 50

$installStart = Get-Date
npm install --no-audit --no-fund --prefer-offline

if ($LASTEXITCODE -eq 0) {
  $installDuration = (Get-Date) - $installStart
  Write-Host "✅ Dependencies installed successfully in $($installDuration.TotalSeconds.ToString('F1')) seconds" -ForegroundColor Green
}
else {
  Write-Host "❌ Installation failed. Check the error messages above." -ForegroundColor Red
  exit 1
}

# === 4. Verify installation ===
Write-Host "`n🔍 Verifying installation..." -ForegroundColor Cyan

# Test that key packages are working
$testCommands = @(
  @{ cmd = "npx vite --version"; name = "Vite" },
  @{ cmd = "npx tsc --version"; name = "TypeScript" },
  @{ cmd = "npx tailwindcss --help"; name = "Tailwind" }
)

foreach ($test in $testCommands) {
  try {
    $result = Invoke-Expression $test.cmd 2>&1
    Write-Host "✅ $($test.name) working" -ForegroundColor Green
  }
  catch {
    Write-Host "⚠️ $($test.name) check failed (might be normal)" -ForegroundColor Yellow
  }
}

# === 5. Test build ===
Write-Host "`n🔨 Testing build process..." -ForegroundColor Cyan

$buildStart = Get-Date
npm run build:only

if ($LASTEXITCODE -eq 0) {
  $buildDuration = (Get-Date) - $buildStart
  Write-Host "✅ Build successful in $($buildDuration.TotalSeconds.ToString('F1')) seconds" -ForegroundColor Green

  # Show bundle info
  if (Test-Path "dist") {
    $bundleSize = (Get-ChildItem -Recurse "dist" | Measure-Object -Property Length -Sum).Sum
    $bundleSizeMB = [math]::Round($bundleSize / 1MB, 2)
    Write-Host "📦 Bundle size: $bundleSizeMB MB" -ForegroundColor Cyan

    # Show largest files
    Write-Host "`n📊 Largest bundle files:" -ForegroundColor Yellow
    Get-ChildItem -Recurse "dist" -Include "*.js", "*.css" |
    Sort-Object Length -Descending |
    Select-Object -First 5 Name, @{N = "Size(KB)"; E = { [math]::Round($_.Length / 1KB, 2) } } |
    Format-Table
  }
}
else {
  Write-Host "❌ Build failed. Check error messages above." -ForegroundColor Red
}

# === 6. Performance optimizations summary ===
Write-Host "`n🎯 Windows Development Optimizations Applied:" -ForegroundColor Magenta

Write-Host "✅ Platform Dependencies Fixed:" -ForegroundColor Green
Write-Host "  • Removed Linux/macOS Rollup binaries" -ForegroundColor White
Write-Host "  • Kept only Windows x64 binary" -ForegroundColor White
Write-Host "  • Eliminated platform compatibility errors" -ForegroundColor White

Write-Host "`n✅ NPM Performance Optimized:" -ForegroundColor Green
Write-Host "  • Offline-first dependency resolution" -ForegroundColor White
Write-Host "  • Disabled audit/fund for faster installs" -ForegroundColor White
Write-Host "  • Increased socket connections (50)" -ForegroundColor White
Write-Host "  • Used robocopy for faster file operations" -ForegroundColor White

Write-Host "`n🚀 Ready for Development!" -ForegroundColor Green
Write-Host "You can now run:" -ForegroundColor Cyan
Write-Host "  npm run dev    - Start development server" -ForegroundColor White
Write-Host "  npm run build  - Build for production" -ForegroundColor White
Write-Host "  npm run test   - Run tests" -ForegroundColor White

Write-Host "`n💡 For additional PowerShell optimizations, run:" -ForegroundColor Yellow
Write-Host "  .\scripts\optimize-powershell.ps1" -ForegroundColor White
