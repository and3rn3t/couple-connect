#!/bin/bash

# Fix for Rollup native dependencies issue in CI environments
# This script ensures the correct Rollup native binaries are installed

set -e

echo "🔧 Checking Rollup native dependencies..."

# Get the platform
PLATFORM=$(uname -s | tr '[:upper:]' '[:lower:]')
ARCH=$(uname -m)

# Determine the correct Rollup binary package
ROLLUP_PACKAGE=""

case "$PLATFORM-$ARCH" in
  "linux-x86_64")
    ROLLUP_PACKAGE="@rollup/rollup-linux-x64-gnu"
    ;;
  "linux-aarch64")
    ROLLUP_PACKAGE="@rollup/rollup-linux-arm64-gnu"
    ;;
  "darwin-x86_64")
    ROLLUP_PACKAGE="@rollup/rollup-darwin-x64"
    ;;
  "darwin-arm64")
    ROLLUP_PACKAGE="@rollup/rollup-darwin-arm64"
    ;;
  "mingw64_nt"*"-x86_64" | "msys_nt"*"-x86_64")
    ROLLUP_PACKAGE="@rollup/rollup-win32-x64-msvc"
    ;;
  *)
    echo "⚠️  Unknown platform: $PLATFORM-$ARCH, trying generic approach"
    ;;
esac

if [ -n "$ROLLUP_PACKAGE" ]; then
  echo "📦 Installing $ROLLUP_PACKAGE for platform $PLATFORM-$ARCH"

  # Check if the package is already installed
  if npm list "$ROLLUP_PACKAGE" > /dev/null 2>&1; then
    echo "✅ $ROLLUP_PACKAGE is already installed"
  else
    echo "📥 Installing $ROLLUP_PACKAGE..."
    npm install --no-save --silent "$ROLLUP_PACKAGE@latest" || {
      echo "❌ Failed to install $ROLLUP_PACKAGE, trying alternative approach..."

      # Alternative: Clear npm cache and reinstall
      echo "🧹 Clearing npm cache..."
      npm cache clean --force

      echo "🔄 Reinstalling dependencies..."
      rm -rf node_modules package-lock.json
      npm install

      echo "🔁 Retrying $ROLLUP_PACKAGE installation..."
      npm install --no-save --silent "$ROLLUP_PACKAGE@latest"
    }
  fi
else
  echo "⚠️  Could not determine the correct Rollup package, clearing cache and reinstalling all dependencies..."
  npm cache clean --force
  rm -rf node_modules package-lock.json
  npm install
fi

echo "✅ Rollup dependencies check completed!"
