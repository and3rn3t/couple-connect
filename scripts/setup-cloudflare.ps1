#!/usr/bin/env pwsh
<#
.SYNOPSIS
    🚀 Cloudflare Optimization Setup Helper
    Your love app's journey to lightning-fast performance! ⚡💕

.DESCRIPTION
    This script helps you set up Cloudflare optimization features step by step.
    It's like a relationship counselor... but for your app's performance! 😉

.PARAMETER Feature
    The Cloudflare feature to set up:
    - analytics: Set up Cloudflare Analytics
    - images: Configure Cloudflare Images
    - kv: Set up KV namespaces for caching
    - all: Interactive setup for all features

.EXAMPLE
    .\scripts\setup-cloudflare.ps1 -Feature analytics
    .\scripts\setup-cloudflare.ps1 -Feature all
#>

param(
  [Parameter(Mandatory = $false)]
  [ValidateSet("analytics", "images", "kv", "all")]
  [string]$Feature = "all"
)

# 💕 Love-themed functions for setup
function Write-LoveMessage {
  param([string]$Message, [string]$Color = "Magenta")
  Write-Host "💕 $Message" -ForegroundColor $Color
}

function Write-SuccessMessage {
  param([string]$Message)
  Write-Host "✨ $Message" -ForegroundColor Green
}

function Write-InfoMessage {
  param([string]$Message)
  Write-Host "💡 $Message" -ForegroundColor Cyan
}

function Write-WarningMessage {
  param([string]$Message)
  Write-Host "⚠️ $Message" -ForegroundColor Yellow
}

function Show-LoveHeader {
  Write-Host ""
  Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Magenta
  Write-Host "║  🚀 Cloudflare Optimization Setup for Couple Connect 💕      ║" -ForegroundColor Magenta
  Write-Host "║  Making your love app faster than Cupid's arrow! ⚡          ║" -ForegroundColor Magenta
  Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Magenta
  Write-Host ""
}

function Test-Prerequisites {
  Write-LoveMessage "Checking if you have all the love tools installed..."

  $prerequisites = @()

  # Check for wrangler CLI
  try {
    $wranglerVersion = wrangler --version 2>$null
    Write-SuccessMessage "Wrangler CLI is installed: $wranglerVersion"
  }
  catch {
    $prerequisites += "wrangler CLI"
    Write-WarningMessage "Wrangler CLI not found. Install with: npm install -g wrangler"
  }

  # Check if logged into Cloudflare
  try {
    $whoami = wrangler whoami 2>$null
    if ($whoami -like "*You are not authenticated*") {
      $prerequisites += "Cloudflare authentication"
      Write-WarningMessage "Not logged into Cloudflare. Run: wrangler login"
    }
    else {
      Write-SuccessMessage "Logged into Cloudflare ✨"
    }
  }
  catch {
    $prerequisites += "Cloudflare authentication"
    Write-WarningMessage "Please run: wrangler login"
  }

  # Check for Node.js
  try {
    $nodeVersion = node --version 2>$null
    Write-SuccessMessage "Node.js is installed: $nodeVersion"
  }
  catch {
    $prerequisites += "Node.js"
    Write-WarningMessage "Node.js not found. Please install Node.js"
  }

  if ($prerequisites.Count -gt 0) {
    Write-WarningMessage "Missing prerequisites: $($prerequisites -join ', ')"
    Write-InfoMessage "Please install missing tools and run this script again!"
    return $false
  }

  return $true
}

function Setup-CloudflareAnalytics {
  Write-LoveMessage "Setting up Cloudflare Analytics - Let's track some love metrics! 📊💕"

  Write-InfoMessage "To set up Cloudflare Analytics:"
  Write-Host "1. Go to your Cloudflare dashboard"
  Write-Host "2. Select your domain (or create one)"
  Write-Host "3. Go to Analytics → Web Analytics"
  Write-Host "4. Click 'Enable Web Analytics'"
  Write-Host "5. Copy the tracking token"
  Write-Host ""

  $token = Read-Host "Enter your Cloudflare Analytics token (or press Enter to skip)"

  if ($token) {
    try {
      # Update index.html with the token
      $indexPath = "index.html"
      $content = Get-Content $indexPath -Raw
      $updatedContent = $content -replace 'data-cf-beacon=\{\"token\": \"REPLACE_WITH_YOUR_TOKEN\"\}', "data-cf-beacon='{`"token`": `"$token`"}'"

      if ($updatedContent -ne $content) {
        Set-Content $indexPath $updatedContent -NoNewline
        Write-SuccessMessage "Analytics token updated in index.html! 🎉"
      }
      else {
        Write-WarningMessage "Token placeholder not found in index.html. Please update manually."
      }
    }
    catch {
      Write-WarningMessage "Error updating index.html: $_"
      Write-InfoMessage "Please manually replace 'REPLACE_WITH_YOUR_TOKEN' with your actual token in index.html"
    }
  }

  Write-SuccessMessage "Analytics setup complete! Deploy your app to start tracking love metrics! 💕📈"
}

function Setup-CloudflareImages {
  Write-LoveMessage "Setting up Cloudflare Images - Making couple photos beautiful! 📸✨"

  Write-InfoMessage "To set up Cloudflare Images:"
  Write-Host "1. Go to your Cloudflare dashboard"
  Write-Host "2. Navigate to Images"
  Write-Host "3. Click 'Enable Cloudflare Images'"
  Write-Host "4. Copy your account hash from the dashboard"
  Write-Host ""

  $accountHash = Read-Host "Enter your Cloudflare Images account hash (or press Enter to skip)"

  if ($accountHash) {
    try {
      # Update wrangler.toml with the account hash
      $wranglerPath = "wrangler.toml"
      $content = Get-Content $wranglerPath -Raw
      $updatedContent = $content -replace 'VITE_CLOUDFLARE_IMAGES_ACCOUNT_HASH = "YOUR_IMAGES_ACCOUNT_HASH_HERE"', "VITE_CLOUDFLARE_IMAGES_ACCOUNT_HASH = `"$accountHash`""
      $updatedContent = $updatedContent -replace 'CLOUDFLARE_IMAGES_ACCOUNT_HASH = "YOUR_IMAGES_ACCOUNT_HASH_HERE"', "CLOUDFLARE_IMAGES_ACCOUNT_HASH = `"$accountHash`""

      if ($updatedContent -ne $content) {
        Set-Content $wranglerPath $updatedContent -NoNewline
        Write-SuccessMessage "Images account hash updated in wrangler.toml! 🎉"
      }
      else {
        Write-WarningMessage "Account hash placeholders not found. Please update manually."
      }
    }
    catch {
      Write-WarningMessage "Error updating wrangler.toml: $_"
      Write-InfoMessage "Please manually replace the account hash placeholders in wrangler.toml"
    }

    # Update the images service
    try {
      $imagesServicePath = "src/services/cloudflareImages.ts"
      if (Test-Path $imagesServicePath) {
        $content = Get-Content $imagesServicePath -Raw
        $updatedContent = $content -replace 'REPLACE_WITH_YOUR_ACCOUNT_HASH', $accountHash

        if ($updatedContent -ne $content) {
          Set-Content $imagesServicePath $updatedContent -NoNewline
          Write-SuccessMessage "Images service updated with your account hash! 🖼️✨"
        }
      }
    }
    catch {
      Write-WarningMessage "Error updating images service: $_"
    }
  }

  Write-SuccessMessage "Images setup complete! Your couple photos will look amazing! 📸💕"
}

function Setup-CloudflareKV {
  Write-LoveMessage "Setting up Cloudflare KV - Lightning-fast love data caching! ⚡💾"

  Write-InfoMessage "Creating KV namespaces for production and preview..."

  try {
    Write-Host "Creating production KV namespace..."
    $prodResult = wrangler kv:namespace create "COUPLE_CACHE" 2>&1
    Write-Host $prodResult

    Write-Host ""
    Write-Host "Creating preview KV namespace..."
    $previewResult = wrangler kv:namespace create "COUPLE_CACHE" --preview 2>&1
    Write-Host $previewResult

    Write-Host ""
    Write-SuccessMessage "KV namespaces created! 🎉"
    Write-InfoMessage "Please update your wrangler.toml with the namespace IDs from above."
    Write-InfoMessage "Look for the 'id' values in the output and replace the placeholders in wrangler.toml"
  }
  catch {
    Write-WarningMessage "Error creating KV namespaces: $_"
    Write-InfoMessage "You can create them manually in the Cloudflare dashboard under Workers → KV"
  }

  Write-SuccessMessage "KV setup complete! Your app will cache love data at the edge! 💕⚡"
}

function Setup-AllFeatures {
  Write-LoveMessage "Let's set up ALL the Cloudflare love features! This is going to be AMAZING! 🚀💕"

  $features = @(
    @{ Name = "Analytics"; Function = { Setup-CloudflareAnalytics } },
    @{ Name = "Images"; Function = { Setup-CloudflareImages } },
    @{ Name = "KV Storage"; Function = { Setup-CloudflareKV } }
  )

  foreach ($feature in $features) {
    Write-Host ""
    Write-Host "═══════════════════════════════════════" -ForegroundColor Magenta
    $continue = Read-Host "Set up $($feature.Name)? (y/N)"
    if ($continue -eq 'y' -or $continue -eq 'Y') {
      & $feature.Function
    }
    else {
      Write-InfoMessage "Skipping $($feature.Name) - you can set it up later! 💕"
    }
  }
}

function Show-NextSteps {
  Write-Host ""
  Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
  Write-Host "║  🎉 Setup Complete! Your Love App is Ready to Fly! 🚀       ║" -ForegroundColor Green
  Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Green
  Write-Host ""

  Write-SuccessMessage "Next Steps:"
  Write-Host "1. 🏗️  Build your app: npm run build"
  Write-Host "2. 🚀 Deploy to Cloudflare: wrangler pages publish dist"
  Write-Host "3. 📊 Check your analytics in the Cloudflare dashboard"
  Write-Host "4. 🖼️  Start uploading couple photos to see image optimization in action"
  Write-Host "5. 💕 Watch your love app performance soar!"
  Write-Host ""

  Write-InfoMessage "📚 For detailed implementation guides, check out:"
  Write-Host "   - docs/development/CLOUDFLARE_OPTIMIZATION_FEATURES.md"
  Write-Host "   - docs/development/CLOUDFLARE_IMPLEMENTATION_GUIDE.md"
  Write-Host ""

  Write-LoveMessage "Your couples are going to LOVE how fast and smooth their app is now! 💕⚡"
}

# 🚀 Main execution
try {
  Show-LoveHeader

  if (-not (Test-Prerequisites)) {
    exit 1
  }

  switch ($Feature) {
    "analytics" { Setup-CloudflareAnalytics }
    "images" { Setup-CloudflareImages }
    "kv" { Setup-CloudflareKV }
    "all" { Setup-AllFeatures }
  }

  Show-NextSteps
}
catch {
  Write-Host ""
  Write-Host "💔 Oops! Something went wrong: $_" -ForegroundColor Red
  Write-Host "Don't worry though - love conquers all! Check the error and try again! 💕" -ForegroundColor Yellow
  exit 1
}
