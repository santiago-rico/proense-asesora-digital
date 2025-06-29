# CI/CD Pipeline Documentation

This directory contains the GitHub Actions workflows and configurations for the automated CI/CD pipeline.

## 🚀 Workflows

### 1. CI/CD Pipeline (`ci.yml`)

**Triggers:**
- Push to `main` and `develop` branches
- Pull requests to `main` and `develop` branches

**Jobs:**

#### Quality Checks (`quality`)
- **Node.js Matrix**: Tests on Node.js 18.x and 20.x
- **TypeScript**: Type checking with `tsc --noEmit`
- **ESLint**: Code quality and style checks
- **Tests**: Runs Vitest with coverage reporting
- **Build**: Production build verification
- **Artifacts**: Uploads build files and coverage reports

#### Security Audit (`security`)
- **npm audit**: Checks for vulnerable dependencies
- **Security Tests**: Runs custom security test suites
  - `test-multistep-form-security.js`
  - `test-modification-form-security.js`
- **Dependency Review**: Scans for security issues in PRs

#### Deployment Check (`deployment-check`)
- **Production Build**: Verifies production-ready builds
- **File Verification**: Ensures all essential files exist
- **Size Analysis**: Reports build size metrics

#### Performance Analysis (`performance`)
- **Bundle Analysis**: Checks bundle sizes and composition
- **Size Limits**: Fails if bundles exceed 3MB
- **Performance Metrics**: Reports on build optimization

### 2. Security Monitoring (`security-monitoring.yml`)

**Triggers:**
- Daily at 2 AM UTC (scheduled)
- Manual workflow dispatch

**Features:**
- **Daily Security Scans**: Automated vulnerability detection
- **License Checking**: Monitors dependency licenses
- **Issue Creation**: Auto-creates GitHub issues for security findings
- **Artifact Reports**: Stores security reports for review

### 3. Dependabot Auto-merge (`dependabot-auto-merge.yml`)

**Triggers:**
- Dependabot pull requests

**Behavior:**
- **Auto-merge**: Patch updates and minor dev dependencies
- **Manual Review**: Major updates require human approval
- **CI Integration**: Waits for CI checks before merging

## 🔧 Configuration Files

### Dependabot (`dependabot.yml`)

**Update Schedule:**
- **Main Dependencies**: Weekly on Mondays at 09:00 UTC
- **Sanity Studio**: Weekly on Mondays at 10:00 UTC  
- **GitHub Actions**: Weekly on Mondays at 11:00 UTC

**Features:**
- **Grouped Updates**: Reduces PR noise
- **Automatic Labels**: Categorizes updates
- **Review Assignment**: Assigns maintainers
- **Commit Conventions**: Follows conventional commit format

## 🧪 Local Testing

### Test Script (`test-ci-locally.sh`)

Run the CI pipeline locally before pushing:

```bash
./.github/test-ci-locally.sh
```

**Checks Performed:**
1. Dependencies installation
2. TypeScript type checking
3. ESLint code quality
4. Test execution
5. Production build
6. Security audit
7. Build output verification

## 🔒 Security Features

### CSRF Protection Tests
- Validates CSRF token generation and validation
- Tests form submission security
- Verifies token expiration handling

### XSS Protection Tests
- Tests input sanitization
- Validates HTML content filtering
- Checks script injection prevention

### File Upload Security
- Validates file type restrictions
- Tests file size limits
- Verifies malicious file detection

### Honeypot Protection
- Tests bot detection mechanisms
- Validates spam filtering
- Checks silent rejection of bot submissions

## 📊 Coverage and Reporting

### Code Coverage
- **Tool**: Vitest with coverage
- **Upload**: Codecov integration
- **Thresholds**: Configurable via vitest.config.ts

### Security Reports
- **Artifacts**: Daily security scan results
- **Retention**: 30 days for security reports, 7 days for builds
- **Integration**: GitHub Security tab integration

## 🚦 Status Checks

### Required Checks
For branch protection, configure these as required status checks:
- `Code Quality & Tests (18.x)`
- `Security Audit`
- `CI Summary`

### Optional Checks
- `Code Quality & Tests (20.x)` - For Node.js compatibility
- `Performance Analysis` - For bundle size monitoring

## 🔧 Environment Variables

### Required Secrets
```bash
CODECOV_TOKEN=         # For coverage reporting
GITHUB_TOKEN=          # Automatically provided by GitHub
```

### Optional Secrets
```bash
SLACK_WEBHOOK=         # For notifications (if implemented)
DISCORD_WEBHOOK=       # For notifications (if implemented)
```

## 🎯 Best Practices

### Commit Messages
Follow conventional commits for automatic categorization:
- `feat:` - New features
- `fix:` - Bug fixes
- `chore:` - Maintenance tasks
- `ci:` - CI/CD changes
- `docs:` - Documentation updates

### Pull Request Process
1. Create feature branch from `develop`
2. Make changes and commit
3. Push and create PR to `develop`
4. Wait for CI checks to pass
5. Request review from maintainers
6. Merge after approval

### Dependency Updates
1. Dependabot creates weekly PRs
2. Patch updates auto-merge after CI passes
3. Minor dev dependency updates auto-merge
4. Major updates require manual review
5. Security updates are prioritized

## 🔍 Troubleshooting

### Common Issues

#### ESLint Failures
```bash
npm run lint -- --fix
```

#### Test Failures
```bash
npm run test -- --run --reporter=verbose
```

#### Build Failures
```bash
npm run build:dev  # Development build for debugging
```

#### Security Test Failures
```bash
# Ensure dev server is running on port 8080
npm run dev &
node test-multistep-form-security.js
```

### CI/CD Debugging
1. Check workflow logs in GitHub Actions tab
2. Download artifacts for detailed reports
3. Run local test script for quick debugging
4. Review status check details in PR

## 📈 Metrics and Monitoring

### Key Metrics Tracked
- **Build Success Rate**: Pipeline success percentage
- **Test Coverage**: Code coverage trends
- **Security Vulnerabilities**: Count and severity
- **Bundle Size**: Performance impact tracking
- **Dependency Age**: Update frequency monitoring

### Alerts and Notifications
- Security vulnerabilities create GitHub issues
- Failed builds are visible in commit status
- Coverage drops are reported in PR comments
- Large bundle size increases trigger warnings

## 🔄 Continuous Improvement

### Regular Reviews
- Monthly pipeline performance review
- Quarterly security assessment
- Annual dependency audit
- Workflow optimization based on team feedback

### Upgrade Path
1. Monitor GitHub Actions marketplace for updates
2. Test new actions in feature branches
3. Gradually rollout improvements
4. Document changes and train team members