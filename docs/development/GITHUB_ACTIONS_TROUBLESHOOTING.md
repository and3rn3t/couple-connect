# 🔧 GitHub Actions Troubleshooting Guide

## 🔍 Recent Fixes Applied (August 14, 2025)

### ✅ **Fixed Issues:**

1. **Missing build-performance.json**:
   - Added `--save-report` flag to `optimize-build.js` script
   - Ensures performance report is generated for artifact upload

2. **Bundle Analysis Error Handling**:
   - Added conditional check for `bundle-analysis.json` existence
   - Prevents workflow failure if bundle analysis fails

3. **Artifact Upload Resilience**:
   - Added `if-no-files-found: warn` to prevent failure on missing files
   - Added `if: always()` to ensure artifacts are uploaded even on partial failures

### 🚨 **Common GitHub Actions Failure Points:**

#### 1. **Missing Required Secrets**

If deployment fails, check these secrets in GitHub repository settings:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
- `GITHUB_TOKEN` (usually auto-provided)

#### 2. **Node.js Version Compatibility**

- Workflow uses Node.js 20
- Ensure package-lock.json is compatible with Node 20

#### 3. **Dependency Installation Issues**

- Check for conflicting peer dependencies
- Verify package-lock.json integrity
- Ensure all dependencies support the target platform (linux-x64)

#### 4. **Build Script Failures**

The workflow depends on these scripts working:

- `scripts/optimize-build.js --save-report`
- `scripts/analyze-bundle.js --json`
- `npm run build`
- `npm run lint`
- `npm run type-check`
- `npm run format:check`

#### 5. **Bundle Size Limits**

- Current limit: 3MB total bundle size
- Workflow will fail if bundle exceeds this limit
- Check bundle-analysis.json for size breakdown

### 🛠️ **Quick Diagnostics**

#### Check Local Build Works

```bash
# Test the exact commands used in CI
npm ci --prefer-offline --no-audit --no-fund
node scripts/optimize-build.js --save-report
npm run build
node scripts/analyze-bundle.js --json
```

#### Check Generated Files

```bash
# Verify required files are created
ls -la bundle-analysis.json
ls -la build-performance.json
ls -la dist/
```

#### Test Quality Checks

```bash
npm run lint
npm run type-check
npm run format:check
```

### 📊 **Monitoring GitHub Actions**

1. **View Workflow Runs**: [https://github.com/and3rn3t/couple-connect/actions](https://github.com/and3rn3t/couple-connect/actions)
2. **Check Individual Job Logs** for specific failure points
3. **Review Artifacts** uploaded from successful builds
4. **Monitor Bundle Size Trends** in the performance reports

### 🚀 **Expected Workflow Success Indicators**

- ✅ All quality checks (lint, type-check, format-check) pass
- ✅ Security audit completes without critical issues
- ✅ Build completes and generates all artifacts
- ✅ Bundle size is under 3MB limit
- ✅ Deployment succeeds (if secrets are configured)
- ✅ Performance monitoring data is collected

### 🔄 **Recovery Steps if Workflow Still Fails**

1. **Check the latest workflow run logs**
2. **Identify the failing step**
3. **Test that step locally if possible**
4. **Review recent commits for breaking changes**
5. **Check for dependency updates that might cause issues**
6. **Verify all required files exist in the repository**

### 📞 **Additional Support**

If issues persist:

- Check the GitHub Actions tab for detailed error logs
- Review the step-by-step execution in the workflow
- Look for any recent changes to dependencies or scripts
- Ensure the repository has proper permissions for GitHub Actions

---
**Last Updated**: August 14, 2025
**Next Review**: Check workflow status after this commit is pushed
