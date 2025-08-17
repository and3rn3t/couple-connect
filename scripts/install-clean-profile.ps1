# Install Clean PowerShell Profile
# Replaces the broken profile with a clean, working version

Write-Host "🔧 Installing clean PowerShell profile..." -ForegroundColor Yellow

# Check if we have a clean profile to install
if (-not (Test-Path "PowerShell_Profile_Clean.ps1")) {
    Write-Host "❌ Clean profile file not found!" -ForegroundColor Red
    exit 1
}

# Backup the current broken profile
if (Test-Path $PROFILE) {
    $backupPath = "$PROFILE.broken-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    Copy-Item $PROFILE $backupPath -Force
    Write-Host "✅ Backed up broken profile to: $backupPath" -ForegroundColor Green
}

# Create the profile directory if it doesn't exist
$profileDir = Split-Path $PROFILE -Parent
if (-not (Test-Path $profileDir)) {
    New-Item -ItemType Directory -Path $profileDir -Force | Out-Null
    Write-Host "✅ Created profile directory: $profileDir" -ForegroundColor Green
}

# Copy the clean profile
Copy-Item "PowerShell_Profile_Clean.ps1" $PROFILE -Force
Write-Host "✅ Installed clean PowerShell profile" -ForegroundColor Green

# Test the profile
Write-Host "`n🔍 Testing the new profile..." -ForegroundColor Cyan
try {
    pwsh -NoLogo -Command ". `$PROFILE; Write-Host 'Profile loaded successfully!' -ForegroundColor Green; Get-Command nif,wbs,devo,nrc,perf -ErrorAction SilentlyContinue | Select-Object Name"
    Write-Host "✅ Profile test successful!" -ForegroundColor Green
} catch {
    Write-Host "❌ Profile test failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Check the profile syntax manually." -ForegroundColor Yellow
}

Write-Host "`n🎯 Enhanced Commands Now Available:" -ForegroundColor Magenta
Write-Host "  nif [package] - Fast npm install" -ForegroundColor White
Write-Host "  nid <package> - Fast dev dependency install" -ForegroundColor White
Write-Host "  wbs          - Watch bundle size changes" -ForegroundColor White
Write-Host "  devo         - Optimized dev server" -ForegroundColor White
Write-Host "  bwa          - Build with analysis" -ForegroundColor White
Write-Host "  nrc <name>   - Create React component" -ForegroundColor White
Write-Host "  perf         - Performance diagnostics" -ForegroundColor White
Write-Host "  dcc          - Deploy Couple Connect" -ForegroundColor White

Write-Host "`n🔄 Restart your terminal or run: . `$PROFILE" -ForegroundColor Yellow
