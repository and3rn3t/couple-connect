#!/bin/bash

# Build and deploy to Docker Hub script for Couple Connect

set -e

# Configuration
IMAGE_NAME="couple-connect"
DOCKER_USERNAME="${DOCKER_USERNAME:-your-username}"
VERSION="${VERSION:-latest}"
FULL_IMAGE_NAME="${DOCKER_USERNAME}/${IMAGE_NAME}:${VERSION}"

echo "🚀 Building and deploying Couple Connect to Docker Hub"
echo "Image: ${FULL_IMAGE_NAME}"

# Build the Docker image
echo "📦 Building Docker image..."
docker build -t "${FULL_IMAGE_NAME}" .

# Tag as latest if not already
if [ "${VERSION}" != "latest" ]; then
    echo "🏷️  Tagging as latest..."
    docker tag "${FULL_IMAGE_NAME}" "${DOCKER_USERNAME}/${IMAGE_NAME}:latest"
fi

# Push to Docker Hub
echo "⬆️  Pushing to Docker Hub..."
docker push "${DOCKER_USERNAME}/${IMAGE_NAME}:${VERSION}"

if [ "${VERSION}" != "latest" ]; then
    docker push "${DOCKER_USERNAME}/${IMAGE_NAME}:latest"
fi

echo "✅ Successfully deployed to Docker Hub!"
echo "Run with: docker run -p 3000:80 ${FULL_IMAGE_NAME}"
