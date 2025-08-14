# 🚀 Deployment Guide

This guide covers deploying Couple Connect to various platforms.

## 📋 Pre-deployment Checklist

- [ ] All environment variables configured
- [ ] Tests passing (`npm test`)
- [ ] Linting passing (`npm run lint`)
- [ ] Type checking passing (`npm run type-check`)
- [ ] Production build successful (`npm run build`)

## 🌟 Cloudflare Pages (Recommended)

### Automatic Deployment via GitHub

1. **Create Cloudflare Pages Project**:
   - Go to [Cloudflare Pages](https://pages.cloudflare.com/)
   - Click "Create a project"
   - Connect your GitHub account
   - Select the `couple-connect` repository

2. **Configure Build Settings**:
   ```
   Framework preset: Vite
   Build command: npm run build
   Build output directory: dist
   Root directory: /
   ```

3. **Set Environment Variables**:
   ```
   VITE_APP_NAME=Couple Connect
   VITE_ENVIRONMENT=production
   VITE_API_URL=https://your-api-url.com
   VITE_ENABLE_ANALYTICS=true
   ```

4. **Deploy**: 
   - Click "Save and Deploy"
   - Future pushes to `main` will auto-deploy

### Manual Deployment via Wrangler

1. **Install Wrangler**:
   ```bash
   npm install -g wrangler
   ```

2. **Login to Cloudflare**:
   ```bash
   wrangler login
   ```

3. **Deploy**:
   ```bash
   npm run build
   wrangler pages deploy dist --project-name=couple-connect
   ```

## 🔧 GitHub Actions Setup

The project includes automated CI/CD. To enable:

1. **Set Repository Secrets**:
   - Go to GitHub repo → Settings → Secrets and variables → Actions
   - Add these secrets:
     ```
     CLOUDFLARE_API_TOKEN: Your Cloudflare API token
     CLOUDFLARE_ACCOUNT_ID: Your Cloudflare account ID
     ```

2. **Get Cloudflare Credentials**:
   - **API Token**: Cloudflare Dashboard → My Profile → API Tokens → Create Token
     - Use "Cloudflare Pages:Edit" template
   - **Account ID**: Cloudflare Dashboard → Right sidebar

3. **Verify Workflows**:
   - Push to `main` triggers production deployment
   - Pull requests trigger preview deployments
   - Security audits run weekly

## 🌐 Other Deployment Options

### Netlify

1. **Connect Repository**:
   - Go to [Netlify](https://app.netlify.com/)
   - Click "New site from Git"
   - Select your repository

2. **Configure Build**:
   ```
   Build command: npm run build
   Publish directory: dist
   ```

3. **Environment Variables**:
   - Add the same variables as Cloudflare Pages

### Vercel

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel --prod
   ```

3. **Configure**:
   - Follow the prompts
   - Set environment variables in Vercel dashboard

### Traditional Hosting

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Upload**:
   - Upload the entire `dist/` folder to your web server
   - Ensure your server serves `index.html` for all routes (SPA)

## 🔐 Security Configuration

### Cloudflare Pages Security Headers

The `wrangler.toml` includes security headers:

```toml
[[headers]]
for = "/*"
[headers.values]
X-Frame-Options = "DENY"
X-Content-Type-Options = "nosniff"
Referrer-Policy = "strict-origin-when-cross-origin"
```

### Content Security Policy (Optional)

Add to your hosting platform:

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://api.couple-connect.com;
```

## 🏥 Health Checks & Monitoring

### Basic Health Check

Add this to your hosting platform:

```
/_health → returns 200 OK
```

### Performance Monitoring

Consider integrating:
- **Sentry**: Error tracking
- **Google Analytics**: Usage analytics
- **Cloudflare Analytics**: Traffic insights

## 🚨 Troubleshooting

### Common Issues

1. **Build Fails**:
   ```bash
   # Clear cache and reinstall
   npm run clean
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

2. **Environment Variables Not Loading**:
   - Ensure variables start with `VITE_`
   - Check spelling and casing
   - Restart dev server after changes

3. **Routes Not Working (404)**:
   - Ensure SPA redirect rules are configured
   - Check `_redirects` file for Netlify
   - Verify hosting platform SPA support

4. **CSS Not Loading**:
   - Check build output includes CSS files
   - Verify Tailwind CSS is building correctly
   - Check network tab for 404s

### Debug Commands

```bash
# Check build output
npm run build && ls -la dist/

# Test production build locally
npm run preview

# Check for errors
npm run lint
npm run type-check

# View detailed build info
VITE_LOG_LEVEL=info npm run build
```

## 📞 Support

If you encounter deployment issues:

1. Check the [GitHub Issues](https://github.com/and3rn3t/couple-connect/issues)
2. Review GitHub Actions logs
3. Check hosting platform logs
4. Create a new issue with:
   - Error messages
   - Deployment logs
   - Environment details
