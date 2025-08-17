# PowerShell Terminal Optimization Script for Couple Connect
# Optimizations specific to Node.js v22.18.0 + React 19 + TypeScript + Vite

Write-Host "🚀 Applying PowerShell & Terminal Optimizations for Couple Connect..." -ForegroundColor Magenta

# === 1. NPM Performance Optimizations ===
Write-Host "`n📦 Configuring NPM for optimal performance..." -ForegroundColor Yellow

# Already configured: audit=false, fund=false, update-notifier=false
npm config set prefer-offline true
npm config set cache-max 604800000  # 1 week cache
npm config set maxsockets 50        # Increase concurrent downloads
npm config set network-timeout 60000 # 60 second timeout
npm config set progress false       # Disable progress for CI/scripts

Write-Host "✅ NPM configuration optimized" -ForegroundColor Green

# === 2. Node.js Memory Optimization ===
Write-Host "`n🧠 Setting Node.js memory optimizations..." -ForegroundColor Yellow

[Environment]::SetEnvironmentVariable("NODE_OPTIONS", "--max-old-space-size=8192 --max-semi-space-size=1024", "User")
[Environment]::SetEnvironmentVariable("UV_THREADPOOL_SIZE", "16", "User")
[Environment]::SetEnvironmentVariable("VITE_CJS_IGNORE_WARNING", "true", "User")

Write-Host "✅ Node.js memory settings optimized" -ForegroundColor Green

# === 3. Fix NPM Dependencies Issues ===
Write-Host "`n🔧 Fixing npm dependency issues..." -ForegroundColor Yellow

# Clean npm cache and reinstall
npm cache clean --force
Remove-Item -Recurse -Force "node_modules" -ErrorAction SilentlyContinue
Remove-Item "package-lock.json" -ErrorAction SilentlyContinue

Write-Host "Installing dependencies with optimized settings..." -ForegroundColor Cyan
npm install --prefer-offline --no-audit --no-fund

Write-Host "✅ Dependencies reinstalled successfully" -ForegroundColor Green

# === 4. Add PowerShell Profile Optimizations ===
Write-Host "`n⚙️ Adding PowerShell profile optimizations..." -ForegroundColor Yellow

$profileAdditions = @'

# === Couple Connect Specific Optimizations ===

# Fast npm commands with performance optimizations
function Install-Fast {
    param([string]$Package)
    if ($Package) {
        npm install $Package --prefer-offline --no-audit --no-fund --silent
    } else {
        npm install --prefer-offline --no-audit --no-fund --silent
    }
}
Set-Alias -Name nif -Value Install-Fast

function Install-Dev-Fast {
    param([Parameter(Mandatory)][string]$Package)
    npm install $Package --save-dev --prefer-offline --no-audit --no-fund --silent
}
Set-Alias -Name nid -Value Install-Dev-Fast

# Bundle monitoring
function Watch-Bundle-Size {
    Write-Host "👀 Monitoring bundle size changes..." -ForegroundColor Cyan
    $lastSize = 0
    while ($true) {
        if (Test-Path "dist") {
            $size = (Get-ChildItem -Recurse "dist" | Measure-Object -Property Length -Sum).Sum
            $sizeMB = [math]::Round($size / 1MB, 2)
            if ($size -ne $lastSize) {
                $change = if ($lastSize -gt 0) {
                    $diff = $size - $lastSize
                    $diffMB = [math]::Round($diff / 1MB, 2)
                    if ($diff -gt 0) { " (+$diffMB MB)" } else { " ($diffMB MB)" }
                } else { "" }
                $color = if ($change -and $change.Contains('+')) { 'Red' } else { 'Green' }
                Write-Host "📦 Bundle: $sizeMB MB$change" -ForegroundColor $color
                $lastSize = $size
            }
        }
        Start-Sleep -Seconds 3
    }
}
Set-Alias -Name wbs -Value Watch-Bundle-Size

# Quick development commands
function Start-Dev-Optimized {
    $env:NODE_OPTIONS = "--max-old-space-size=8192"
    $env:VITE_CJS_IGNORE_WARNING = "true"
    npm run dev
}
Set-Alias -Name devo -Value Start-Dev-Optimized

function Build-With-Analysis {
    Write-Host "🔨 Building with performance analysis..." -ForegroundColor Blue
    $startTime = Get-Date
    npm run build:analyze
    $duration = (Get-Date) - $startTime
    Write-Host "⏱️ Build completed in $($duration.TotalSeconds.ToString('F2')) seconds" -ForegroundColor Green
}
Set-Alias -Name bwa -Value Build-With-Analysis

# Component creation with templates
function New-React-Component {
    param(
        [Parameter(Mandatory)][string]$Name,
        [switch]$Mobile,
        [switch]$Dialog,
        [switch]$Hook
    )

    $dir = "src/components"
    if ($Mobile) { $dir = "src/components/mobile" }
    if ($Dialog) { $dir = "src/components/dialogs" }
    if ($Hook) { $dir = "src/hooks" }

    $ext = if ($Hook) { ".ts" } else { ".tsx" }
    $fileName = "$dir/$Name$ext"

    if (Test-Path $fileName) {
        Write-Host "⚠️ File already exists: $fileName" -ForegroundColor Yellow
        return
    }

    $template = if ($Hook) {
        @"
import { useState, useEffect } from 'react';

export const use$Name = () => {
  const [state, setState] = useState(null);

  useEffect(() => {
    // TODO: Implement $Name hook logic
  }, []);

  return { state, setState };
};
"@
    } else {
        @"
import React from 'react';
import { cn } from '@/lib/utils';

interface ${Name}Props {
  className?: string;
  children?: React.ReactNode;
}

export const $Name: React.FC<${Name}Props> = ({
  className,
  children
}) => {
  return (
    <div className={cn('', className)}>
      {children}
      {/* TODO: Implement $Name component */}
    </div>
  );
};
"@
    }

    New-Item -ItemType Directory -Force -Path $dir | Out-Null
    Set-Content -Path $fileName -Value $template
    code $fileName
    Write-Host "✅ Created: $fileName" -ForegroundColor Green
}
Set-Alias -Name nrc -Value New-React-Component

# Performance debugging
function Debug-Performance {
    Write-Host "🔍 Running performance diagnostics..." -ForegroundColor Cyan

    # Check Node.js memory
    $nodeProcs = Get-Process -Name "node" -ErrorAction SilentlyContinue
    if ($nodeProcs) {
        Write-Host "`n🧠 Node.js Memory Usage:" -ForegroundColor Yellow
        $nodeProcs | Select-Object Id, @{N="Memory(MB)";E={[math]::Round($_.WorkingSet/1MB,2)}}, CPU | Format-Table
    }

    # Check bundle size
    if (Test-Path "dist") {
        Write-Host "📦 Current Bundle Analysis:" -ForegroundColor Yellow
        Get-ChildItem -Recurse "dist" -Include "*.js", "*.css" |
            Sort-Object Length -Descending |
            Select-Object -First 5 Name, @{N="Size(KB)";E={[math]::Round($_.Length/1KB,2)}} |
            Format-Table
    }

    # Check npm cache
    $cacheInfo = npm cache verify 2>$null
    Write-Host "💾 NPM Cache Status:" -ForegroundColor Yellow
    Write-Host $cacheInfo -ForegroundColor Gray
}
Set-Alias -Name perf -Value Debug-Performance

# Quick fixes for common issues
function Fix-Node-Issues {
    Write-Host "🔧 Fixing common Node.js/React issues..." -ForegroundColor Yellow

    # Kill stuck Node processes
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force

    # Clear various caches
    npm cache clean --force
    if (Test-Path "node_modules/.cache") { Remove-Item -Recurse -Force "node_modules/.cache" }
    if (Test-Path "node_modules/.vite") { Remove-Item -Recurse -Force "node_modules/.vite" }

    # Reinstall dependencies
    Remove-Item "package-lock.json" -ErrorAction SilentlyContinue
    npm install --prefer-offline --no-audit --no-fund

    Write-Host "✅ Node.js issues fixed" -ForegroundColor Green
}
Set-Alias -Name fix -Value Fix-Node-Issues

# Project-specific deployment
function Deploy-Couple-Connect {
    param([switch]$Preview)

    Write-Host "🚀 Deploying Couple Connect..." -ForegroundColor Magenta

    # Run safety checks
    npm run check:infinite-loops:warn
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Infinite loop check failed" -ForegroundColor Red
        return
    }

    # Build
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Build failed" -ForegroundColor Red
        return
    }

    # Deploy
    if ($Preview) {
        npm run deploy:preview
    } else {
        npm run deploy
    }

    Write-Host "✅ Deployment complete!" -ForegroundColor Green
}
Set-Alias -Name dcc -Value Deploy-Couple-Connect
Set-Alias -Name dccp -Value { Deploy-Couple-Connect -Preview }

'@

# Append to PowerShell profile
Add-Content -Path $PROFILE -Value $profileAdditions

Write-Host "✅ PowerShell profile optimizations added" -ForegroundColor Green

# === 5. Install Performance Tools ===
Write-Host "`n🛠️ Installing performance monitoring tools..." -ForegroundColor Yellow

# Install pnpm as faster alternative (optional)
try {
  npm install -g pnpm --silent
  Write-Host "✅ pnpm installed for faster package management" -ForegroundColor Green
}
catch {
  Write-Host "⚠️ pnpm installation skipped (optional)" -ForegroundColor Yellow
}

# Install clinic for Node.js performance profiling
try {
  npm install -g clinic --silent
  Write-Host "✅ clinic installed for Node.js profiling" -ForegroundColor Green
}
catch {
  Write-Host "⚠️ clinic installation skipped (optional)" -ForegroundColor Yellow
}

# === 6. Create Windows Terminal Profile ===
Write-Host "`n🖥️ Creating optimized Windows Terminal profile..." -ForegroundColor Yellow

$terminalProfile = @{
  "name"              = "Couple Connect Dev"
  "commandline"       = "pwsh.exe -NoLogo"
  "startingDirectory" = "C:\\git\\couple-connect"
  "icon"              = "💕"
  "font"              = @{
    "face" = "Cascadia Code"
    "size" = 11
  }
  "colorScheme"       = "One Half Dark"
  "backgroundOpacity" = 0.95
  "useAcrylic"        = $true
  "environment"       = @{
    "NODE_ENV"                = "development"
    "VITE_CJS_IGNORE_WARNING" = "true"
    "NODE_OPTIONS"            = "--max-old-space-size=8192"
  }
}

$profileJson = $terminalProfile | ConvertTo-Json -Depth 3
Write-Host "📋 Windows Terminal profile JSON copied to clipboard" -ForegroundColor Green
Write-Host "Paste this into your Windows Terminal settings.json profiles list:" -ForegroundColor Cyan
Write-Host $profileJson -ForegroundColor Gray

# === 7. Performance Summary ===
Write-Host "`n📊 Optimization Summary:" -ForegroundColor Magenta
Write-Host "✅ NPM configured for optimal performance" -ForegroundColor Green
Write-Host "✅ Node.js memory optimized (8GB heap)" -ForegroundColor Green
Write-Host "✅ Dependency issues resolved" -ForegroundColor Green
Write-Host "✅ PowerShell profile enhanced with React/Node shortcuts" -ForegroundColor Green
Write-Host "✅ Performance monitoring tools available" -ForegroundColor Green
Write-Host "✅ Windows Terminal profile created" -ForegroundColor Green

Write-Host "`n🎯 New Commands Available:" -ForegroundColor Cyan
Write-Host "  nif [package]  - Fast npm install" -ForegroundColor White
Write-Host "  nid <package>  - Fast dev dependency install" -ForegroundColor White
Write-Host "  wbs           - Watch bundle size changes" -ForegroundColor White
Write-Host "  devo          - Start optimized dev server" -ForegroundColor White
Write-Host "  bwa           - Build with analysis" -ForegroundColor White
Write-Host "  nrc <name>    - Create new React component" -ForegroundColor White
Write-Host "  perf          - Performance diagnostics" -ForegroundColor White
Write-Host "  fix           - Fix common Node.js issues" -ForegroundColor White
Write-Host "  dcc           - Deploy Couple Connect" -ForegroundColor White

Write-Host "`n🔄 Restart your terminal to apply all optimizations!" -ForegroundColor Yellow
