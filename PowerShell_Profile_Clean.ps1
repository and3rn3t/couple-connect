# === PowerShell 7 Performance Optimizations ===
$OutputEncoding = [System.Text.Encoding]::UTF8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$PSStyle.OutputRendering = 'ANSI'
$PSStyle.Progress.View = 'Minimal'

# === Enhanced PSReadLine with FIXED prediction settings ===
Import-Module PSReadLine
Set-PSReadLineOption -PredictionSource History
Set-PSReadLineOption -PredictionViewStyle InlineView
Set-PSReadLineOption -EditMode Windows
Set-PSReadLineOption -BellStyle None
Set-PSReadLineOption -HistorySearchCursorMovesToEnd
# Disabled ShowToolTips to prevent autocorrect issues

# === GitHub Copilot optimized colors ===
Set-PSReadLineOption -Colors @{
  Command                = 'Cyan'
  Parameter              = 'Gray'
  Operator               = 'DarkGray'
  Variable               = 'Green'
  String                 = 'Yellow'
  Number                 = 'Red'
  Type                   = 'DarkCyan'
  Comment                = 'DarkGreen'
  Keyword                = 'Blue'
  Member                 = 'DarkCyan'
  Emphasis               = 'Magenta'
  Error                  = 'Red'
  Selection              = 'DarkGray'
  InlinePrediction       = 'DarkGray'
  ListPrediction         = 'Yellow'
  ListPredictionSelected = 'DarkBlue'
}

# === Advanced Keyboard Shortcuts ===
Set-PSReadLineKeyHandler -Key Tab -Function MenuComplete
Set-PSReadLineKeyHandler -Key 'Ctrl+d' -Function DeleteChar
Set-PSReadLineKeyHandler -Key 'Ctrl+w' -Function BackwardDeleteWord
Set-PSReadLineKeyHandler -Key 'Ctrl+LeftArrow' -Function BackwardWord
Set-PSReadLineKeyHandler -Key 'Ctrl+RightArrow' -Function ForwardWord
Set-PSReadLineKeyHandler -Key UpArrow -Function HistorySearchBackward
Set-PSReadLineKeyHandler -Key DownArrow -Function HistorySearchForward
Set-PSReadLineKeyHandler -Key 'Ctrl+r' -Function ReverseSearchHistory
Set-PSReadLineKeyHandler -Key 'Ctrl+s' -Function ForwardSearchHistory

# === VS Code + GitHub Copilot Integration ===
function Open-VSCode {
  code . --enable-extension github.copilot --enable-extension github.copilot-chat
}
Set-Alias -Name c -Value Open-VSCode

function Open-File-VSCode {
  param([Parameter(Mandatory)][string]$File, [int]$Line = 1)
  if (Test-Path $File) {
    code --goto "$($File):$($Line):1"
  }
  else {
    Write-Host "❌ File not found: $File" -ForegroundColor Red
  }
}
Set-Alias -Name cf -Value Open-File-VSCode

function Open-Component {
  param([Parameter(Mandatory)][string]$ComponentName)
  $possiblePaths = @(
    "src/components/$ComponentName.tsx",
    "src/components/$ComponentName.ts",
    "src/components/ui/$ComponentName.tsx",
    "src/components/ui/$ComponentName.ts"
  )
  $found = $false
  foreach ($path in $possiblePaths) {
    if (Test-Path $path) {
      code $path
      Write-Host "✅ Opened $path" -ForegroundColor Green
      $found = $true
      break
    }
  }
  if (-not $found) {
    Write-Host "❌ Component '$ComponentName' not found" -ForegroundColor Red
    $possiblePaths | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }
  }
}
Set-Alias -Name comp -Value Open-Component

# === Enhanced Git Integration ===
function Git-Status-Detailed {
  Write-Host "📊 Git Repository Status" -ForegroundColor Cyan
  git status --short --branch --ahead-behind
  Write-Host ""
  $stash = git stash list --oneline 2>$null
  if ($stash) {
    Write-Host "💾 Stashes:" -ForegroundColor Yellow
    $stash | ForEach-Object { Write-Host "   $_" }
  }
}
Set-Alias -Name gs -Value Git-Status-Detailed

function Git-Log-Graph {
  git log --oneline --graph --decorate --all --max-count=15
}
Set-Alias -Name gl -Value Git-Log-Graph

function Git-Quick-Commit {
  param(
    [Parameter(Mandatory)]
    [ValidateSet('feat', 'fix', 'docs', 'style', 'refactor', 'test', 'chore', 'ui', 'ux')]
    [string]$Type,
    [Parameter(Mandatory)][string]$Message
  )
  git add .
  git commit -m "${Type}: ${Message}"
}
Set-Alias -Name qc -Value Git-Quick-Commit

function Git-Feature-Branch {
  param([Parameter(Mandatory)][string]$FeatureName)
  $branchName = "feature/$FeatureName"
  git checkout -b $branchName
  Write-Host "✅ Created and switched to branch: $branchName" -ForegroundColor Green
}
Set-Alias -Name gfb -Value Git-Feature-Branch

# === Development Commands ===
function Start-Dev {
  Write-Host "🚀 Starting Couple Connect development server..." -ForegroundColor Green
  npm run dev
}
Set-Alias -Name dev -Value Start-Dev

function Build-Project {
  Write-Host "🔨 Building Couple Connect for production..." -ForegroundColor Blue
  npm run build
}
Set-Alias -Name build -Value Build-Project

function Type-Check {
  Write-Host "🔍 Running TypeScript type check..." -ForegroundColor Cyan
  npx tsc --noEmit
}
Set-Alias -Name tc -Value Type-Check

function Lint-Code {
  Write-Host "📋 Running ESLint..." -ForegroundColor Yellow
  if (Test-Path "node_modules/.bin/eslint") {
    npx eslint src --ext .ts, .tsx, .js, .jsx
  }
  else {
    Write-Host "⚠️  ESLint not found. Install with: npm install -D eslint" -ForegroundColor Yellow
  }
}
Set-Alias -Name lint -Value Lint-Code

function Fix-Lint {
  Write-Host "🔧 Running ESLint with auto-fix..." -ForegroundColor Green
  if (Test-Path "node_modules/.bin/eslint") {
    npx eslint src --ext .ts, .tsx, .js, .jsx --fix
  }
  else {
    Write-Host "⚠️  ESLint not found" -ForegroundColor Yellow
  }
}
Set-Alias -Name fix -Value Fix-Lint

# === GitHub Copilot Integration Helpers ===
function Copy-Context {
  $context = @"
Couple Connect Project Context:
- React 19 + TypeScript relationship management app
- Vite build tool with HMR
- Tailwind CSS + shadcn/ui components
- Gamification features for relationship building
- Current directory: $(Get-Location)
- Git branch: $(git rev-parse --abbrev-ref HEAD 2>$null)
- Modified files: $(git diff --name-only 2>$null | Join-String -Separator ', ')

Key Components:
$(Get-ChildItem src/components -Name "*.tsx" -ErrorAction SilentlyContinue | Select-Object -First 10 | Join-String -Separator ', ')

Recent commits:
$(git log --oneline -5 2>$null)
"@
  $context | Set-Clipboard
  Write-Host "📋 Project context copied to clipboard for Copilot Chat!" -ForegroundColor Green
}
Set-Alias -Name ctx -Value Copy-Context

function Open-Copilot-Chat {
  code . --command "workbench.panel.chat.view.copilot.focus"
}
Set-Alias -Name chat -Value Open-Copilot-Chat

function Show-Project-Info {
  Write-Host "💕 Couple Connect - Relationship Management App" -ForegroundColor Magenta
  Write-Host "=" * 60 -ForegroundColor DarkGray
  if (Test-Path "package.json") {
    $pkg = Get-Content "package.json" | ConvertFrom-Json
    Write-Host "📦 Package: $($pkg.name) v$($pkg.version)" -ForegroundColor Green
    Write-Host "🛠️  Available Scripts:" -ForegroundColor Yellow
    $pkg.scripts.PSObject.Properties | ForEach-Object {
      Write-Host "   $($_.Name): $($_.Value)" -ForegroundColor White
    }
  }
  Write-Host ""
}
Set-Alias -Name info -Value Show-Project-Info

# === ENHANCED DEVELOPMENT COMMANDS ===

# Fast npm install commands
function Install-Fast {
  param([string]$Package)
  if ($Package) {
    npm install $Package --prefer-offline --no-audit --no-fund --silent
  }
  else {
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
        }
        else { "" }
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

# Component creation
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
  }
  else {
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
    $nodeProcs | Select-Object Id, @{N = "Memory(MB)"; E = { [math]::Round($_.WorkingSet / 1MB, 2) } }, CPU | Format-Table
  }

  # Check bundle size
  if (Test-Path "dist") {
    Write-Host "📦 Current Bundle Analysis:" -ForegroundColor Yellow
    Get-ChildItem -Recurse "dist" -Include "*.js", "*.css" |
    Sort-Object Length -Descending |
    Select-Object -First 5 Name, @{N = "Size(KB)"; E = { [math]::Round($_.Length / 1KB, 2) } } |
    Format-Table
  }
}
Set-Alias -Name perf -Value Debug-Performance

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
  }
  else {
    npm run deploy
  }

  Write-Host "✅ Deployment complete!" -ForegroundColor Green
}
Set-Alias -Name dcc -Value Deploy-Couple-Connect

# === Enhanced Prompt with Development Context ===
function prompt {
  $currentPath = $PWD.Path
  $shortPath = if ($currentPath.Length -gt 50) {
    "..." + $currentPath.Substring($currentPath.Length - 47)
  }
  else { $currentPath }

  # Git status
  $gitInfo = ""
  try {
    $branch = git rev-parse --abbrev-ref HEAD 2>$null
    if ($branch) {
      $status = git status --porcelain 2>$null
      $statusIcon = if ($status) { "🔴" } else { "🟢" }
      $gitInfo = " [$statusIcon $branch]"
    }
  }
  catch { }

  # Node.js version
  $nodeInfo = ""
  if (Get-Command node -ErrorAction SilentlyContinue) {
    $nodeInfo = " [node:$(node --version)]"
  }

  # Package.json indicator
  $scriptInfo = ""
  if (Test-Path "package.json") { $scriptInfo = " [📦]" }

  $timeStamp = Get-Date -Format "HH:mm:ss"
  Write-Host "┌─[" -NoNewline -ForegroundColor DarkGray
  Write-Host $timeStamp -NoNewline -ForegroundColor DarkCyan
  Write-Host "]─[" -NoNewline -ForegroundColor DarkGray
  Write-Host $shortPath -NoNewline -ForegroundColor Cyan
  Write-Host "]" -NoNewline -ForegroundColor DarkGray
  Write-Host $gitInfo -NoNewline -ForegroundColor Yellow
  Write-Host $nodeInfo -NoNewline -ForegroundColor DarkGreen
  Write-Host $scriptInfo -ForegroundColor Magenta
  Write-Host "└─❯ " -NoNewline -ForegroundColor DarkGray
  return " "
}

# === Module Loading ===
$modules = @('posh-git', 'Terminal-Icons')
foreach ($module in $modules) {
  try {
    if (Get-Module -ListAvailable -Name $module) {
      Import-Module $module -ErrorAction SilentlyContinue
    }
  }
  catch { }
}

# === Welcome Message ===
Clear-Host
Write-Host "💕 Couple Connect - Development Environment Ready!" -ForegroundColor Magenta
Write-Host "🤖 GitHub Copilot optimized PowerShell profile loaded" -ForegroundColor Cyan
Write-Host ""
Write-Host "Enhanced Commands: nif, nid, wbs, devo, bwa, nrc, perf, dcc" -ForegroundColor Green
Write-Host "Original Commands: dev, build, tc, lint, c, comp, gs, qc, ctx, chat, info" -ForegroundColor Yellow
Write-Host ""
