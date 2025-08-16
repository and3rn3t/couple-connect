# 🐳 Docker Hub Authentication Fix

## 🚨 Issue: Docker Push Access Denied

**Error Message**:

````bash
# 🐳 Docker Hub Authentication Fix

## 🚨 Problem

**Error**: `push access denied, repository does not exist or may require authorization`

**Root Cause**: Docker workflow trying to push to `docker.io/couple-connect` instead of `docker.io/USERNAME/couple-connect`

## ✅ Solution

### Fixed Docker Workflow Configuration

Updated `.github/workflows/docker.yml`:

```yaml
# ✅ Correct format includes username
env:
  REGISTRY: docker.io
  IMAGE_NAME: ${{ secrets.DOCKER_USERNAME }}/couple-connect
````

### Required Setup

1. **Configure GitHub Secrets** at `https://github.com/and3rn3t/couple-connect/settings/secrets/actions`:
   - `DOCKER_USERNAME`: Your Docker Hub username
   - `DOCKER_PASSWORD`: Your Docker Hub password/token

2. **Create Docker Hub Repository**:
   - Go to <https://hub.docker.com>
   - Create repository named `couple-connect`
   - Set as Public or Private

3. **Test the Fix**:
   - Push any commit to `main` branch
   - Check workflow at `https://github.com/and3rn3t/couple-connect/actions`

## 🔧 Alternative: Use GitHub Container Registry

If Docker Hub continues to have issues, switch to GitHub's registry:

```yaml
env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}
```

**Benefits**: No additional secrets needed, uses GitHub authentication.

## 📋 Status

- [x] Fixed workflow configuration
- [ ] Configure GitHub secrets (DOCKER_USERNAME, DOCKER_PASSWORD)
- [ ] Create Docker Hub repository
- [ ] Test workflow

---

**Next Step**: Configure GitHub repository secrets for Docker Hub authentication

````text

**Root Cause**: The Docker workflow was trying to push to `docker.io/couple-connect` instead of the proper format `docker.io/USERNAME/couple-connect`.

## ✅ Solution Applied

### 1. Fixed Docker Workflow Configuration

**File**: `.github/workflows/docker.yml`

**Changed**:

```yaml
# ❌ Before (incorrect)
env:
  REGISTRY: docker.io
  IMAGE_NAME: couple-connect

# ✅ After (correct)
env:
  REGISTRY: docker.io
  IMAGE_NAME: ${{ secrets.DOCKER_USERNAME }}/couple-connect
````

### 2. Required GitHub Secrets

You need to configure these secrets in your GitHub repository:

1. Go to: `https://github.com/and3rn3t/couple-connect/settings/secrets/actions`
2. Add these secrets:

**DOCKER_USERNAME**: Your Docker Hub username
**DOCKER_PASSWORD**: Your Docker Hub password or access token

### 3. Docker Hub Repository Setup

**Option A: Create Repository on Docker Hub**

1. Login to [Docker Hub](https://hub.docker.com)
2. Click "Create Repository"
3. Name: `couple-connect`
4. Visibility: Public (recommended) or Private
5. Click "Create"

**Option B: Let Docker Push Create Repository (if you have push permissions)**

- The repository will be created automatically on first successful push

## 🔧 Verification Steps

### 1. Check GitHub Secrets

```bash
# Go to GitHub repository settings
https://github.com/and3rn3t/couple-connect/settings/secrets/actions

# Verify these secrets exist:
- DOCKER_USERNAME
- DOCKER_PASSWORD
```

### 2. Test Docker Workflow

```bash
# Push a commit to trigger the workflow
git add .
git commit -m "fix: Update Docker workflow configuration"
git push origin main

# Check workflow status
https://github.com/and3rn3t/couple-connect/actions
```

### 3. Expected Docker Hub Result

After successful workflow:

- Repository: `https://hub.docker.com/r/[YOUR_USERNAME]/couple-connect`
- Tags: `latest`, `main-[commit-sha]`

## 🛠️ Alternative Solutions

### Option 1: Use GitHub Container Registry Instead

Update `.github/workflows/docker.yml`:

```yaml
env:
  REGISTRY: ghcr.io
  IMAGE_NAME: ${{ github.repository }}
```

**Benefits**:

- No additional secrets needed (uses GitHub token)
- Integrated with GitHub repository
- Same authentication as your repo

### Option 2: Disable Docker Workflow Temporarily

Rename the workflow file:

```bash
mv .github/workflows/docker.yml .github/workflows/docker.yml.disabled
```

## 🧪 Testing Commands

### Local Docker Build Test

```bash
# Build locally
docker build -t couple-connect .

# Test locally
docker run -p 3000:80 couple-connect

# Check if app runs
curl http://localhost:3000
```

### Manual Docker Push Test

```bash
# Login to Docker Hub
docker login

# Tag image properly
docker tag couple-connect [YOUR_USERNAME]/couple-connect:latest

# Push manually
docker push [YOUR_USERNAME]/couple-connect:latest
```

## 📋 Checklist

- [x] Fixed workflow IMAGE_NAME configuration
- [ ] Configure DOCKER_USERNAME secret in GitHub
- [ ] Configure DOCKER_PASSWORD secret in GitHub
- [ ] Create Docker Hub repository (optional)
- [ ] Test workflow by pushing a commit
- [ ] Verify image appears on Docker Hub

## 🔍 Common Issues

### Issue: "unauthorized: authentication required"

**Solution**: Check GitHub secrets are correctly configured

### Issue: "repository does not exist"

**Solution**: Create repository on Docker Hub or use GitHub Container Registry

### Issue: "invalid reference format"

**Solution**: Ensure IMAGE_NAME includes username: `username/repository-name`

## 📚 Related Documentation

- [Docker Hub Documentation](https://docs.docker.com/docker-hub/)
- [GitHub Actions Docker Login](https://github.com/marketplace/actions/docker-login)
- [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)

---

**Status**: ✅ Workflow configuration fixed
**Next Step**: Configure GitHub secrets for Docker Hub authentication
**Updated**: $(Get-Date -Format "MMMM dd, yyyy")
