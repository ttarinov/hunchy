#!/bin/bash

#
# Deploy Hunchy CLI Runtime
#
# This script:
# 1. Bundles the CLI runtime with esbuild
# 2. Creates a tarball with runtime and dependencies
# 3. Calculates SHA256 checksum
# 4. Copies tarball to apps/web/public/cli directory
# 5. Updates version.json manifest
#
# Usage:
#   ./scripts/deploy.sh
#

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

log() {
  echo -e "${BLUE}==>${NC} $1"
}

success() {
  echo -e "${GREEN}✓${NC} $1"
}

warn() {
  echo -e "${YELLOW}!${NC} $1"
}

# Get version from package.json
VERSION=$(node -p "require('./package.json').version")

# Directories
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLI_DIR="$(dirname "$SCRIPT_DIR")"
MONOREPO_DIR="$(dirname "$(dirname "$CLI_DIR")")"
HOSTING_DIR="$MONOREPO_DIR/apps/web/public/cli"
TEMP_DIR=$(mktemp -d)

trap "rm -rf $TEMP_DIR" EXIT

log "Deploying Hunchy CLI Runtime v$VERSION"
echo ""

# Step 1: Clean source directory
log "1. Cleaning source directory..."
cd "$CLI_DIR"
npm run clean
success "Source directory cleaned"

# Step 2: Build TypeScript
log "2. Building TypeScript..."
npm run build
success "TypeScript compiled"

# Step 3: Bundle with esbuild
log "3. Bundling runtime..."
npm run bundle:standalone
mv dist/runtime-standalone.js dist/runtime.mjs
success "Runtime bundled as runtime.mjs"

# Step 4: Create package structure in temp directory
log "4. Creating package structure..."
cp dist/runtime.mjs "$TEMP_DIR/"
cp package.json "$TEMP_DIR/"
if [ -f package-lock.json ]; then
  cp package-lock.json "$TEMP_DIR/"
fi

# Install production dependencies
cd "$TEMP_DIR"
npm install --omit=dev --no-audit --no-fund --legacy-peer-deps --silent 2>&1 | grep -E "added|removed|changed" || true
success "Package structure created with dependencies"

# Step 4: Create tarball
log "4. Creating tarball..."
cd "$TEMP_DIR"
tar -czf "runtime-$VERSION.tar.gz" .
success "Tarball created"

# Step 5: Calculate checksum
log "5. Calculating checksum..."
CHECKSUM=$(shasum -a 256 "runtime-$VERSION.tar.gz" | awk '{print $1}')
success "Checksum: $CHECKSUM"

# Step 6: Prepare CLI directory in web public folder
log "6. Preparing CLI directory..."
mkdir -p "$HOSTING_DIR"
success "CLI directory ready: $HOSTING_DIR"

# Step 7: Copy tarball
log "7. Copying tarball..."
cp "runtime-$VERSION.tar.gz" "$HOSTING_DIR/"
success "Copied to apps/web/public/cli/runtime-$VERSION.tar.gz"

# Step 8: Update version.json
log "8. Updating version.json..."
cat > "$HOSTING_DIR/version.json" << EOF
{
  "latest": "$VERSION",
  "url": "https://hunchy-4a0dc.web.app/cli/runtime-$VERSION.tar.gz",
  "sha256": "$CHECKSUM",
  "minLauncherVersion": "1.0.0",
  "releaseDate": "$(date -u +%Y-%m-%dT%H:%M:%S.000Z)",
  "format": "tarball"
}
EOF
success "version.json updated"

# Step 9: Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
success "Runtime prepared for deployment!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  Version:  $VERSION"
echo "  Checksum: $CHECKSUM"
echo "  Location: apps/web/public/cli/runtime-$VERSION.tar.gz"
echo ""
echo "Next steps:"
echo "  1. Review changes: cat $HOSTING_DIR/version.json"
echo "  2. Deploy to Firebase:"
echo "     cd $MONOREPO_DIR"
echo "     firebase deploy --only hosting"
echo ""
echo "  3. Test the update:"
echo "     rm -rf ~/.hunchy/cache"
echo "     hunchy --version"
echo ""
