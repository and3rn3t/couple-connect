# Quick fix for PowerShell profile syntax error
# Removes the accidentally added React TypeScript code

Write-Host "🔧 Fixing PowerShell profile syntax error..." -ForegroundColor Yellow

# Read the current profile content
$profileContent = Get-Content $PROFILE

# Find the line numbers where the problem starts and ends
$startLine = -1
$endLine = -1

for ($i = 0; $i -lt $profileContent.Count; $i++) {
  if ($profileContent[$i] -match "export const.*use.*Name") {
    $startLine = $i
  }
  if ($startLine -ne -1 -and $profileContent[$i] -match "Set-Alias.*nrc.*New-React-Component") {
    $endLine = $i
    break
  }
}

if ($startLine -ne -1 -and $endLine -ne -1) {
  Write-Host "Found problematic React code at lines $($startLine + 1) to $($endLine)" -ForegroundColor Red

  # Remove the problematic lines
  $fixedContent = @()
  $fixedContent += $profileContent[0..($startLine - 1)]
  $fixedContent += $profileContent[($endLine + 1)..($profileContent.Count - 1)]

  # Backup the current profile
  Copy-Item $PROFILE "$PROFILE.backup" -Force
  Write-Host "✅ Created backup at $PROFILE.backup" -ForegroundColor Green

  # Write the fixed content
  $fixedContent | Set-Content $PROFILE
  Write-Host "✅ Fixed PowerShell profile syntax error" -ForegroundColor Green

  # Add the corrected function back
  $correctedFunction = @'

# Component creation with templates (CORRECTED)
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
'@

  Add-Content $PROFILE $correctedFunction
  Write-Host "✅ Added corrected component creation function" -ForegroundColor Green

}
else {
  Write-Host "❌ Could not find the problematic code section" -ForegroundColor Red
}

Write-Host "`n🔄 PowerShell profile fixed! Restart your terminal to apply changes." -ForegroundColor Green
