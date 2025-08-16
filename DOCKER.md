# 🐳 Docker Setup Guide for Couple Connect

This guide will help you containerize and deploy the Couple Connect application using Docker and Docker Hub.

**✅ Docker Hub Token Configured**: GitHub Actions workflows are ready for automated builds and deployments.

## Prerequisites

- Docker Desktop installed and running
- Docker Hub account (for publishing)
- Git (for version control)

## Quick Start

### 1. Build and Run Locally

```bash
# Build the production image
npm run docker:build

# Run the container
npm run docker:run
```

The application will be available at `http://localhost:3000`

### 2. Development with Docker

```bash
# Run development environment with hot-reload
npm run docker:run:dev
```

The development server will be available at `http://localhost:5173`

### 3. Using Docker Compose

```bash
# Build and run with compose
npm run docker:compose:build

# Or just run (if already built)
npm run docker:compose
```

## Publishing to Docker Hub

### Manual Publishing

1. **Login to Docker Hub**

   ```bash
   docker login
   ```

2. **Set your Docker Hub username**

   ```bash
   # Windows PowerShell
   $env:DOCKER_USERNAME="your-dockerhub-username"

   # Linux/Mac
   export DOCKER_USERNAME="your-dockerhub-username"
   ```

3. **Deploy using the script**

   ```bash
   # PowerShell (Windows)
   npm run docker:deploy

   # Or manually with version
   .\scripts\docker-deploy.ps1 -DockerUsername "your-username" -Version "1.0.0"
   ```

### Automated Publishing with GitHub Actions

1. **Set up GitHub Secrets**
   - Go to your repository settings
   - Navigate to Secrets and Variables > Actions
   - Add the following secrets:
     - `DOCKER_USERNAME`: Your Docker Hub username
     - `DOCKER_PASSWORD`: Your Docker Hub password or access token

2. **Push to trigger build**

   ```bash
   git push origin main
   ```

   The GitHub Action will automatically:
   - Build the Docker image
   - Run security scans
   - Push to Docker Hub with appropriate tags

## Docker Files Overview

- **`Dockerfile`**: Multi-stage production build with nginx
- **`Dockerfile.dev`**: Development environment with hot-reload
- **`docker-compose.yml`**: Production compose configuration
- **`docker-compose.dev.yml`**: Development compose configuration
- **`.dockerignore`**: Files to exclude from Docker build context

## Image Optimization Features

- Multi-stage build for smaller production images
- Nginx with optimized configuration
- Gzip compression enabled
- Security headers configured
- Health checks included
- Cache optimization for static assets

## Running from Docker Hub

Once published, others can run your application with:

```bash
docker run -p 3000:80 your-dockerhub-username/couple-connect:latest
```

## Environment Variables

The application supports the following environment variables:

- `NODE_ENV`: Set to `production` or `development`
- Add any custom environment variables your app needs

## Health Checks

The Docker image includes health checks accessible at:

- `/health` - Returns "healthy" status

## Security

- Uses non-root user in production
- Includes security headers
- Vulnerability scanning with Trivy
- Minimal attack surface with alpine base images

## Troubleshooting

### Build Issues

```bash
# Clean Docker cache
docker system prune -a

# Rebuild without cache
docker build --no-cache -t couple-connect .
```

### Port Conflicts

```bash
# Use different port
docker run -p 8080:80 couple-connect
```

### Development Issues

```bash
# Check logs
docker-compose logs couple-connect-dev

# Restart development environment
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml up --build
```

## Performance Tips

1. **Use .dockerignore** to exclude unnecessary files
2. **Multi-stage builds** keep production images small
3. **Layer caching** - order Dockerfile commands by frequency of change
4. **Health checks** ensure container reliability

## Next Steps

1. Set up GitHub secrets for automated deployments
2. Configure monitoring and logging
3. Set up staging/production environments
4. Implement rolling deployments
5. Add database containers if needed

For more advanced configurations, refer to the individual Docker files and scripts in the repository.
