# GitHub Repository Security Checklist

# Use this checklist to ensure all security settings are properly configured

## 🔒 Repository Settings

### Basic Security

- [ ] Repository visibility is set appropriately (private for sensitive data)
- [ ] Default branch is set to `main`
- [ ] Repository description and topics are updated
- [ ] License file is present and appropriate

### Vulnerability Management

- [ ] Vulnerability alerts are enabled
- [ ] Dependabot alerts are enabled
- [ ] Dependabot security updates are enabled
- [ ] Dependabot version updates are configured
- [ ] Secret scanning is enabled (GitHub Advanced Security)
- [ ] Code scanning is enabled (GitHub Advanced Security)

## 🛡️ Branch Protection Rules

### Main Branch Protection

- [ ] Branch protection rule created for `main` branch
- [ ] "Restrict pushes that create files larger than 100MB" enabled
- [ ] "Require status checks to pass before merging" enabled
- [ ] "Require branches to be up to date before merging" enabled
- [ ] "Require pull request reviews before merging" enabled
- [ ] "Dismiss stale pull request approvals when new commits are pushed" enabled
- [ ] "Require review from code owners" enabled
- [ ] "Restrict who can dismiss pull request reviews" configured
- [ ] "Allow specified actors to bypass required pull requests" configured (if needed)
- [ ] "Require approval of the most recent reviewable push" enabled
- [ ] "Require conversation resolution before merging" enabled
- [ ] "Require signed commits" enabled (optional, but recommended)
- [ ] "Require linear history" enabled (optional)
- [ ] "Require deployments to succeed before merging" configured (if applicable)
- [ ] "Lock branch" disabled (unless needed for special circumstances)
- [ ] "Do not allow bypassing the above settings" enabled
- [ ] "Restrict pushes that create files larger than 100MB" enabled

### Required Status Checks

- [ ] 🧪 Tests & Code Quality
- [ ] 📱 Mobile Performance
- [ ] 🔒 Security Analysis
- [ ] 🚨 Infinite Loop Detection
- [ ] 📊 Bundle Analysis
- [ ] 🔍 TypeScript Check
- [ ] 🧹 Lint & Format

## 🔑 Access Management

### Collaborators & Permissions

- [ ] Team permissions are set to minimum required level
- [ ] Individual collaborator permissions reviewed and documented
- [ ] Two-factor authentication required for all collaborators
- [ ] Admin permissions limited to essential personnel only
- [ ] Read/Write permissions granted based on role requirements

### Deploy Keys & Tokens

- [ ] Deploy keys have read-only access where possible
- [ ] Personal access tokens have minimal required scopes
- [ ] Service account tokens are used for automated deployments
- [ ] Token expiration dates are documented and monitored
- [ ] Unused keys and tokens are regularly removed

## 🔐 Secrets Management

### Repository Secrets

- [ ] All production secrets are stored in GitHub Secrets
- [ ] Development secrets use separate values from production
- [ ] Secret names follow consistent naming convention
- [ ] Secret descriptions are documented
- [ ] Unused secrets are regularly cleaned up

### Environment Secrets

- [ ] Production environment has restricted deployment protection
- [ ] Staging environment configured with appropriate secrets
- [ ] Development environment uses non-production values
- [ ] Required reviewers configured for production deployments
- [ ] Wait timer configured for production deployments (if needed)

## 🚨 Security Monitoring

### Automated Checks

- [ ] Security workflow runs weekly
- [ ] Dependency scanning configured
- [ ] Code quality checks run on every PR
- [ ] Performance regression tests enabled
- [ ] Infinite loop detection integrated into CI/CD

### Alert Configuration

- [ ] Email notifications enabled for security alerts
- [ ] Slack/Teams integration for critical alerts (if applicable)
- [ ] Escalation procedures documented
- [ ] Response time commitments defined

## 📋 Workflow Security

### GitHub Actions

- [ ] Workflow permissions follow principle of least privilege
- [ ] Third-party actions are pinned to specific versions with hash
- [ ] Workflow secrets are not exposed in logs
- [ ] Pull request workflows cannot access secrets (where appropriate)
- [ ] Workflow runs are limited to authorized users for main branch

### CI/CD Security

- [ ] Build process doesn't expose sensitive information
- [ ] Test data doesn't contain real user information
- [ ] Deployment process requires manual approval for production
- [ ] Rollback procedures are documented and tested

## 🔍 Regular Security Reviews

### Monthly Reviews

- [ ] Review and update collaborator access
- [ ] Check for and resolve security alerts
- [ ] Review recent commits for security implications
- [ ] Validate backup and recovery procedures

### Quarterly Reviews

- [ ] Full security settings audit
- [ ] Review and rotate access tokens
- [ ] Update security documentation
- [ ] Test incident response procedures
- [ ] Review and update this checklist

### Annual Reviews

- [ ] Comprehensive security assessment
- [ ] Third-party security audit (if applicable)
- [ ] Review and update security policies
- [ ] Training and awareness updates for team

## 📝 Documentation Requirements

### Security Documentation

- [ ] Security incident response plan documented
- [ ] Contact information for security issues current
- [ ] Security policies communicated to all contributors
- [ ] Code review guidelines include security considerations

### Compliance Documentation

- [ ] Data handling practices documented
- [ ] Privacy policy updated (if applicable)
- [ ] Compliance requirements met (GDPR, CCPA, etc.)
- [ ] Audit trails maintained for compliance

---

## 🚀 Quick Setup Commands

### Apply Branch Protection (PowerShell)

```powershell
# Run the setup script
.\.github\setup-branch-protection.ps1

# Dry run first to see what will be applied
.\.github\setup-branch-protection.ps1 -DryRun
```

### Manual GitHub CLI Commands

```bash
# Enable vulnerability alerts
gh api repos/:owner/:repo/vulnerability-alerts --method PUT

# Enable automated security fixes
gh api repos/:owner/:repo/automated-security-fixes --method PUT

# Check current protection status
gh api repos/:owner/:repo/branches/main/protection
```

**Last Updated**: August 16, 2025
**Review Schedule**: Monthly security review, quarterly comprehensive audit
**Next Review**: September 16, 2025
