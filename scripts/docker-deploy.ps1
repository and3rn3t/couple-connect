# Build and deploy to Docker Hub script for Couple Connect (PowerShell)

param(
  [string]$DockerUsername = $env:DOCKER_USERNAME,
  [string]$Version = "latest"
)

# Configuration
$ImageName = "couple-connect"
if (-not $DockerUsername) {
  $DockerUsername = Read-Host "Enter your Docker Hub username"
}

$FullImageName = "${DockerUsername}/${ImageName}:${Version}"

Write-Host "🚀 Building and deploying Couple Connect to Docker Hub" -ForegroundColor Green
Write-Host "Image: $FullImageName" -ForegroundColor Cyan

try {
  # Build the Docker image
  Write-Host "📦 Building Docker image..." -ForegroundColor Yellow
  docker build -t $FullImageName .

  if ($LASTEXITCODE -ne 0) {
    throw "Docker build failed"
  }

  # Tag as latest if not already
  if ($Version -ne "latest") {
    Write-Host "🏷️  Tagging as latest..." -ForegroundColor Yellow
    docker tag $FullImageName "${DockerUsername}/${ImageName}:latest"
  }

  # Push to Docker Hub
  Write-Host "⬆️  Pushing to Docker Hub..." -ForegroundColor Yellow
  docker push "${DockerUsername}/${ImageName}:${Version}"

  if ($LASTEXITCODE -ne 0) {
    throw "Docker push failed"
  }

  if ($Version -ne "latest") {
    docker push "${DockerUsername}/${ImageName}:latest"
  }

  Write-Host "✅ Successfully deployed to Docker Hub!" -ForegroundColor Green
  Write-Host "Run with: docker run -p 3000:80 $FullImageName" -ForegroundColor Cyan
}
catch {
  Write-Host "❌ Error: $_" -ForegroundColor Red
  exit 1
}
