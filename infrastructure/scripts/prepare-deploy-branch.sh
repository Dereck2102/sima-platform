#!/bin/bash
# =============================================================================
# SIMA Platform - Deployment Branch Preparation Script
# Creates clean QA/PROD branches with only deployment-necessary files
# =============================================================================

set -e

ENVIRONMENT=${1:-qa}
CURRENT_BRANCH=$(git branch --show-current)

echo "🚀 Preparing $ENVIRONMENT branch for deployment..."
echo "   Current branch: $CURRENT_BRANCH"
echo ""

# =============================================================================
# Files/Folders to INCLUDE for deployment
# =============================================================================
INCLUDE_FILES=(
  # Infrastructure (required for Terraform)
  "infrastructure/"
  
  # Docker files (required for building images)
  "docker-compose.yml"
  "docker-compose.qa.yml"
  "docker-compose.prod.yml"
  ".dockerignore"
  
  # GitHub Actions (required for CI/CD)
  ".github/"
  
  # Package files (required for builds)
  "package.json"
  "package-lock.json"
  "pnpm-lock.yaml"
  "nx.json"
  "tsconfig.base.json"
  
  # Source code (required for Docker builds)
  "apps/"
  "libs/"
  
  # Environment examples
  ".env.example"
)

# =============================================================================
# Files/Folders to EXCLUDE from deployment
# =============================================================================
EXCLUDE_PATTERNS=(
  # Documentation
  "docs/"
  "*.md"
  "!README.md"
  
  # Tests (separate from deployable code)
  "tests/"
  "**/*.spec.ts"
  "**/*.test.ts"
  "jest.config.*"
  "playwright.config.*"
  
  # Development files
  ".vscode/"
  ".idea/"
  "*.log"
  
  # Mobile app (deployed separately)
  "sima-mobile/"
  
  # Local development
  ".env"
  ".env.local"
  
  # Node modules (rebuilt in CI)
  "node_modules/"
  
  # Build outputs
  "dist/"
  "build/"
  ".nx/"
  
  # Git
  ".git/"
)

# =============================================================================
# Create deployment .gitignore for QA branch
# =============================================================================
create_deploy_gitignore() {
  cat > .gitignore.deploy << 'EOF'
# SIMA Platform - Deployment Branch .gitignore
# This file is used for QA/PROD branches to keep them minimal

# Documentation (not needed for deployment)
docs/
*.pdf
CONTRIBUTING.md
CHANGELOG.md
CODE_OF_CONDUCT.md
LICENSE

# Tests (run in CI, not deployed)
tests/
**/*.spec.ts
**/*.test.ts
jest.config.*
playwright.config.*
coverage/

# Mobile app (separate deployment)
sima-mobile/

# Development tools
.vscode/
.idea/
*.log
.eslintcache

# Local environment
.env
.env.local
.env.*.local

# Build artifacts
dist/
build/
.nx/
tmp/

# Dependencies (installed in CI)
node_modules/

# OS files
.DS_Store
Thumbs.db
EOF
}

# =============================================================================
# Main execution
# =============================================================================
echo "⚠️  This will:"
echo "   1. Save current work (stash)"
echo "   2. Checkout $ENVIRONMENT branch"
echo "   3. Reset to clean state"  
echo "   4. Copy only deployment files from $CURRENT_BRANCH"
echo "   5. Push to origin/$ENVIRONMENT"
echo ""
echo "Press Ctrl+C to cancel, or Enter to continue..."
read

# Stash current work
echo "📦 Stashing current work..."
git stash push -m "Pre-deployment stash $(date)"

# Checkout or create the deployment branch
echo "🔀 Switching to $ENVIRONMENT branch..."
if git show-ref --verify --quiet refs/heads/$ENVIRONMENT; then
  git checkout $ENVIRONMENT
else
  git checkout --orphan $ENVIRONMENT
fi

# Remove all files
echo "🧹 Cleaning branch..."
git rm -rf . 2>/dev/null || true
rm -rf * 2>/dev/null || true

# Copy files from the source branch
echo "📋 Copying deployment files from $CURRENT_BRANCH..."
git checkout $CURRENT_BRANCH -- \
  infrastructure/ \
  .github/ \
  apps/ \
  libs/ \
  package.json \
  pnpm-lock.yaml \
  nx.json \
  tsconfig.base.json \
  docker-compose.yml \
  .dockerignore \
  .env.example \
  README.md 2>/dev/null || true

# Create deployment .gitignore
create_deploy_gitignore
mv .gitignore.deploy .gitignore

# Remove excluded items
echo "🗑️  Removing non-deployment files..."
rm -rf docs/ tests/ sima-mobile/ .vscode/ 2>/dev/null || true
find . -name "*.spec.ts" -delete 2>/dev/null || true
find . -name "*.test.ts" -delete 2>/dev/null || true
find . -name "*.md" ! -name "README.md" -delete 2>/dev/null || true

# Stage all files
echo "📝 Staging files..."
git add -A

# Check what will be committed
echo ""
echo "📊 Files to be committed:"
git status --short | head -30
echo "..."
echo "Total files: $(git status --short | wc -l)"
echo ""

# Commit
echo "💾 Committing..."
git commit -m "deploy($ENVIRONMENT): Clean deployment package from $CURRENT_BRANCH

- Infrastructure: Terraform modules and scripts
- Apps: All microservices and frontends
- CI/CD: GitHub Actions workflows
- Excluded: docs, tests, mobile app, dev files"

# Push
echo "🚀 Pushing to origin/$ENVIRONMENT..."
git push origin $ENVIRONMENT --force

# Return to original branch
echo "↩️  Returning to $CURRENT_BRANCH..."
git checkout $CURRENT_BRANCH

# Restore stashed work
echo "📦 Restoring stashed work..."
git stash pop 2>/dev/null || true

echo ""
echo "============================================="
echo "✅ $ENVIRONMENT branch prepared for deployment!"
echo "============================================="
echo ""
echo "Branch contents:"
echo "  ✅ infrastructure/     - Terraform & scripts"
echo "  ✅ .github/            - CI/CD workflows"
echo "  ✅ apps/               - Microservices & frontends"
echo "  ✅ libs/               - Shared libraries"
echo "  ✅ package.json        - Dependencies"
echo "  ✅ docker-compose.yml  - Container config"
echo ""
echo "Excluded:"
echo "  ❌ docs/               - Documentation"
echo "  ❌ tests/              - Test files"
echo "  ❌ sima-mobile/        - Mobile app"
echo "  ❌ *.spec.ts           - Unit tests"
echo ""
echo "To deploy, GitHub Actions will trigger automatically"
echo "or run: gh workflow run deploy-qa.yml"
