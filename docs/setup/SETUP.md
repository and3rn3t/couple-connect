# GitHub Repository Setup Guide

This document outlines the required setup for proper GitHub configuration.

## Required GitHub Secrets

To enable Cloudflare Pages deployment, add these secrets in your repository settings:

1. Go to: `Settings` > `Secrets and variables` > `Actions`
2. Add the following repository secrets:

### Cloudflare Secrets

- **CLOUDFLARE_API_TOKEN**: Your Cloudflare API token with Pages:Edit permissions
- **CLOUDFLARE_ACCOUNT_ID**: Your Cloudflare Account ID

### How to get Cloudflare credentials:

#### API Token:

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens)
2. Click "Create Token"
3. Use "Custom token" with these permissions:
   - Zone:Zone:Read
   - Zone:Page Rules:Edit
   - Account:Cloudflare Pages:Edit

#### Account ID:

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Select your domain
3. Copy the Account ID from the right sidebar

## Recommended Branch Protection Rules

Set up branch protection for `main` branch:

1. Go to: `Settings` > `Branches`
2. Add rule for `main` branch with:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
   - ✅ Require conversation resolution before merging
   - ✅ Include administrators

## Environment Setup

### Production Environment

- Name: `production`
- Deployment branch: `main`
- Required reviewers: (optional, for additional security)

### Preview Environment

- Name: `preview`
- Deployment branch: Any branch (for PR previews)

## Security Setup

The repository includes automated security scanning:

- npm audit on every push/PR
- Dependency review on PRs
- Weekly security audits

Make sure to:

1. Keep dependencies updated
2. Review security alerts promptly
3. Enable Dependabot alerts in repository settings
