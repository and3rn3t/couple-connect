# Comprehensive fix for PowerShell profile
# Removes all React TypeScript code and creates a clean, working profile

Write-Host "🔧 Performing comprehensive PowerShell profile fix..." -ForegroundColor Yellow

# Backup the current profile
Copy-Item $PROFILE "$PROFILE.broken" -Force
Write-Host "✅ Created backup at $PROFILE.broken" -ForegroundColor Green

# Read the profile and filter out all problematic lines
$profileLines = Get-Content $PROFILE
$cleanedLines = @()
$skipMode = $false

foreach ($line in $profileLines) {
  # Start skipping when we hit problematic React code
  if ($line -match "export const.*use.*Name" -or
    $line -match "const \[state, setState\]" -or
    $line -match "export const.*Name.*React\.FC" -or
    $line -match "useState\(null\)" -or
    $line -match "useEffect\(\(\)" -or
    $line -match "className\?" -or
    $line -match "children\?" -or
    $line -match "React\.ReactNode") {
    $skipMode = $true
    continue
  }

  # Stop skipping when we hit a valid PowerShell line after React code
  if ($skipMode -and ($line -match "^\s*}\s*$" -or $line -match "Set-Alias.*nrc" -or $line -match "^# " -or $line -match "^function ")) {
    if ($line -match "Set-Alias.*nrc") {
      # Skip the broken alias line too
      continue
    }
    $skipMode = $false
    if ($line -match "^\s*}\s*$") {
      continue # Skip the closing brace of broken code
    }
  }

  # Add the line if we're not in skip mode
  if (-not $skipMode) {
    $cleanedLines += $line
  }
}

# Write the cleaned profile
$cleanedLines | Set-Content $PROFILE
Write-Host "✅ Removed all problematic React code from profile" -ForegroundColor Green

# Add the corrected functions
$correctedFunctions = @'

# === Couple Connect Enhanced Development Commands ===

# Fast npm install commands
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

# Optimized development server
function Start-Dev-Optimized {
    $env:NODE_OPTIONS = "--max-old-space-size=8192"
    $env:VITE_CJS_IGNORE_WARNING = "true"
    npm run dev
}
Set-Alias -Name devo -Value Start-Dev-Optimized

# Build with analysis
function Build-With-Analysis {
    Write-Host "🔨 Building with performance analysis..." -ForegroundColor Blue
    $startTime = Get-Date
    npm run build:analyze
    $duration = (Get-Date) - $startTime
    Write-Host "⏱️ Build completed in $($duration.TotalSeconds.ToString('F2')) seconds" -ForegroundColor Green
}
Set-Alias -Name bwa -Value Build-With-Analysis

# Component creation (FIXED VERSION)
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

    if ($Hook) {
        $template = "import { useState, useEffect } from 'react';`n`nexport const use$Name = () => {`n  const [state, setState] = useState(null);`n`n  useEffect(() => {`n    // TODO: Implement $Name hook logic`n  }, []);`n`n  return { state, setState };`n};"
    } else {
        $template = "import React from 'react';`nimport { cn } from '@/lib/utils';`n`ninterface ${Name}Props {`n  className?: string;`n  children?: React.ReactNode;`n}`n`nexport const $Name = ({ className, children }) => {`n  return (`n    <div className={cn('', className)}>`n      {children}`n      {/* TODO: Implement $Name component */}`n    </div>`n  );`n};"
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

    Write-Host "✅ Node.js issues fixed" -ForegroundColor Green
}
Set-Alias -Name fix -Value Fix-Node-Issues

# Deployment
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

Write-Host "`n🎯 Enhanced Commands Added:" -ForegroundColor Green
Write-Host "  nif [package] - Fast npm install" -ForegroundColor White
Write-Host "  nid <package> - Fast dev dependency install" -ForegroundColor White
Write-Host "  wbs          - Watch bundle size changes" -ForegroundColor White
Write-Host "  devo         - Optimized dev server" -ForegroundColor White
Write-Host "  bwa          - Build with analysis" -ForegroundColor White
Write-Host "  nrc <name>   - Create React component" -ForegroundColor White
Write-Host "  perf         - Performance diagnostics" -ForegroundColor White
Write-Host "  fix          - Fix common Node.js issues" -ForegroundColor White
Write-Host "  dcc          - Deploy Couple Connect" -ForegroundColor White

'@

Add-Content $PROFILE $correctedFunctions
Write-Host "✅ Added all corrected enhanced functions" -ForegroundColor Green

Write-Host "`n🔄 PowerShell profile completely fixed! Test the new commands:" -ForegroundColor Green
Write-Host "  pwsh -NoLogo -Command 'Get-Command nif,wbs,devo -ErrorAction SilentlyContinue'" -ForegroundColor Cyan
