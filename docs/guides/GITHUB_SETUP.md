# GitHub Repository Setup Guide

This guide will help you configure your GitHub repository for optimal CI/CD workflow and security.

## 🔐 Required Repository Secrets

Go to **Settings > Secrets and variables > Actions** and add these secrets:

### High Priority (CI will fail without these):
```
CODECOV_TOKEN
- Get from: https://codecov.io (connect your repo first)
- Purpose: Upload test coverage reports

BREVO_API_KEY
- Get from: Your Brevo account dashboard
- Purpose: Send emails through Brevo API

LEAD_NOTIFICATION_EMAIL
- Value: Your email for receiving lead notifications
- Purpose: Lead generation form submissions

VITE_SANITY_PROJECT_ID
- Get from: Your Sanity project dashboard
- Purpose: Sanity CMS project identifier

SANITY_API_WRITE_TOKEN
- Get from: Sanity project settings > API tokens
- Purpose: Write access to Sanity CMS for seeding
```

### Medium Priority (Have fallbacks but should be configured):
```
BREVO_SENDER_EMAIL
- Default: no-reply@proense.co
- Purpose: Default sender email address

BREVO_SENDER_NAME
- Default: Proense Asesora Digital
- Purpose: Default sender name

AGENT_EMAIL
- Default: comercial@proense.co
- Purpose: Agent notification email

VITE_SANITY_DATASET
- Default: production
- Purpose: Sanity dataset name
```

## 🛡️ Branch Protection Rules

Go to **Settings > Branches** and configure for `main` branch:

1. **Protect matching branches** ✅
2. **Require pull request reviews before merging** ✅
   - Required number of reviewers: 1
   - Dismiss stale reviews when new commits are pushed ✅
3. **Require status checks to pass before merging** ✅
   - Require branches to be up to date before merging ✅
   - Required status checks:
     - `Code Quality & Tests (18.x)`
     - `Security Audit`
     - `Deployment Readiness`
     - `Performance Analysis`
4. **Require conversation resolution before merging** ✅
5. **Restrict pushes that create files** ✅

## 🔍 Security Settings

Go to **Settings > Code security and analysis**:

1. **Dependency graph**: ✅ Enable
2. **Dependabot alerts**: ✅ Enable
3. **Dependabot security updates**: ✅ Enable
4. **Code scanning**: ✅ Enable GitHub's default CodeQL
5. **Secret scanning**: ✅ Enable
6. **Secret scanning push protection**: ✅ Enable

## 🤖 Actions Settings

Go to **Settings > Actions > General**:

1. **Actions permissions**: 
   - ✅ Allow select actions and reusable workflows
2. **Workflow permissions**:
   - ✅ Read repository contents and packages permissions
   - ✅ Allow GitHub Actions to create and approve pull requests
3. **Artifact and log retention**: 30 days

## 📋 Pre-Deployment Checklist

Before your CI/CD pipeline runs successfully:

- [ ] All required secrets added to repository
- [ ] Branch protection rules configured
- [ ] Security settings enabled
- [ ] Brevo account configured with API key
- [ ] Sanity CMS project set up
- [ ] Codecov account connected to repository

## 🚀 Testing Your Setup

1. **Create a test PR** to verify branch protection works
2. **Check Actions tab** to see if workflows run
3. **Verify security monitoring** in the Security tab
4. **Test Dependabot** by checking for dependency updates

## 📊 Expected Workflow Results

Once configured, your CI/CD pipeline will:
- ✅ Run quality checks (linting, tests)
- ✅ Perform security audits
- ✅ Verify deployment readiness
- ✅ Analyze performance metrics
- ✅ Upload coverage reports
- ✅ Run daily security monitoring
- ✅ Auto-merge safe dependency updates

## 🔧 Troubleshooting

### Common Issues:
1. **CI fails with "secret not found"** → Add missing secrets
2. **Codecov upload fails** → Check CODECOV_TOKEN
3. **Email tests fail** → Verify BREVO_API_KEY
4. **Sanity tests fail** → Check Sanity project settings

### Getting Help:
- Check the Actions tab for detailed error logs
- Verify all secrets are correctly named (case-sensitive)
- Ensure your Brevo account has sufficient credits
- Test API keys manually before adding to secrets