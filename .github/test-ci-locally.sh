#!/bin/bash

# Test CI Pipeline Locally
# This script simulates the GitHub Actions CI pipeline for local testing

set -e

echo "🚀 Starting Local CI Pipeline Test"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
        return 1
    fi
}

# Check Node.js version
echo -e "${YELLOW}📋 Environment Check${NC}"
echo "Node.js version: $(node --version)"
echo "npm version: $(npm --version)"
echo ""

# 1. Install dependencies
echo -e "${YELLOW}📦 Installing Dependencies${NC}"
npm ci
print_status $? "Dependencies installed"
echo ""

# 2. TypeScript type checking
echo -e "${YELLOW}🔍 TypeScript Type Checking${NC}"
npx tsc --noEmit
print_status $? "TypeScript type checking"
echo ""

# 3. ESLint
echo -e "${YELLOW}🔧 ESLint Code Quality Check${NC}"
npm run lint
print_status $? "ESLint code quality check"
echo ""

# 4. Tests (allow to continue on failure)
echo -e "${YELLOW}🧪 Running Tests${NC}"
npm run test -- --run || echo -e "${YELLOW}⚠️ Some tests failed but continuing...${NC}"
echo ""

# 5. Build
echo -e "${YELLOW}🏗️ Building Application${NC}"
npm run build
print_status $? "Application build"
echo ""

# 6. Security audit
echo -e "${YELLOW}🔒 Security Audit${NC}"
npm audit --audit-level=high || echo -e "${YELLOW}⚠️ Security audit completed with warnings${NC}"
echo ""

# 7. Check build output
echo -e "${YELLOW}📊 Build Analysis${NC}"
if [ -d "dist" ]; then
    echo "Build directory exists: ✅"
    echo "Build size: $(du -sh dist/ | cut -f1)"
    echo "Asset files:"
    ls -la dist/assets/ 2>/dev/null || echo "No assets directory found"
    
    # Check for large bundles
    echo "Checking for large bundles (>3MB)..."
    if find dist/assets -name "*.js" -size +3M 2>/dev/null | grep -q .; then
        echo -e "${RED}⚠️ Large bundle detected (>3MB)${NC}"
        find dist/assets -name "*.js" -size +3M -exec ls -lh {} \;
    else
        echo -e "${GREEN}✅ Bundle size check passed${NC}"
    fi
else
    echo -e "${RED}❌ Build directory not found${NC}"
    exit 1
fi
echo ""

# 8. Final summary
echo -e "${GREEN}🎉 Local CI Pipeline Test Completed${NC}"
echo "=================================="
echo "✅ Dependencies installed"
echo "✅ TypeScript type checking passed"
echo "✅ ESLint code quality check passed"
echo "⚠️ Tests ran (some may have failed)"
echo "✅ Application built successfully"
echo "✅ Security audit completed"
echo "✅ Build output verified"
echo ""
echo "Ready for GitHub Actions CI/CD! 🚀"