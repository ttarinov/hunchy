#!/usr/bin/env bash

#
# Hunchy CLI Installer
#
# Quick install:
#   curl -fsSL https://hunchy-4a0dc.web.app/install.sh | bash
#
# Manual install:
#   curl -fsSL https://hunchy-4a0dc.web.app/install.sh -o install.sh
#   chmod +x install.sh
#   ./install.sh
#

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
INSTALL_DIR="${INSTALL_DIR:-$HOME/.hunchy/bin}"
RELEASES_URL="https://github.com/hunchy-hq/hunchy-launcher/releases/latest/download"
MANIFEST_URL="$RELEASES_URL/manifest.json"

# Helper functions
log() {
  echo -e "${BLUE}==>${NC} $1"
}

success() {
  echo -e "${GREEN}✓${NC} $1"
}

error() {
  echo -e "${RED}✗ Error:${NC} $1" >&2
  exit 1
}

warn() {
  echo -e "${YELLOW}!${NC} $1"
}

# Detect platform
detect_platform() {
  local os arch

  # Detect OS
  case "$(uname -s)" in
    Darwin)
      os="macos"
      ;;
    Linux)
      os="linux"
      ;;
    MINGW* | MSYS* | CYGWIN*)
      os="win"
      ;;
    *)
      error "Unsupported operating system: $(uname -s)"
      ;;
  esac

  # Detect architecture
  case "$(uname -m)" in
    x86_64 | amd64)
      arch="x64"
      ;;
    arm64 | aarch64)
      arch="arm64"
      ;;
    *)
      error "Unsupported architecture: $(uname -m)"
      ;;
  esac

  echo "${os}-${arch}"
}

# Check if command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Download file
download() {
  local url="$1"
  local output="$2"

  if command_exists curl; then
    curl -fsSL "$url" -o "$output"
  elif command_exists wget; then
    wget -q "$url" -O "$output"
  else
    error "curl or wget is required but not installed"
  fi
}

# Verify checksum
verify_checksum() {
  local file="$1"
  local expected="$2"

  log "Verifying checksum..."

  local actual
  if command_exists shasum; then
    actual=$(shasum -a 256 "$file" | awk '{print $1}')
  elif command_exists sha256sum; then
    actual=$(sha256sum "$file" | awk '{print $1}')
  else
    warn "shasum/sha256sum not found, skipping checksum verification"
    return 0
  fi

  if [ "$actual" != "$expected" ]; then
    error "Checksum verification failed!\nExpected: $expected\nGot:      $actual"
  fi

  success "Checksum verified"
}

# Add to PATH
add_to_path() {
  local shell_rc

  # Detect shell
  if [ -n "$BASH_VERSION" ]; then
    shell_rc="$HOME/.bashrc"
  elif [ -n "$ZSH_VERSION" ]; then
    shell_rc="$HOME/.zshrc"
  else
    shell_rc="$HOME/.profile"
  fi

  # Check if already in PATH
  if [[ ":$PATH:" != *":$INSTALL_DIR:"* ]]; then
    log "Adding $INSTALL_DIR to PATH in $shell_rc"

    cat >> "$shell_rc" << EOF

# Hunchy CLI
export PATH="\$PATH:$INSTALL_DIR"
EOF

    success "Added to PATH in $shell_rc"
    warn "Restart your shell or run: source $shell_rc"
  else
    success "$INSTALL_DIR is already in PATH"
  fi
}

# Main installation
main() {
  echo ""
  echo "  ╦ ╦┬ ┬┌┐┌┌─┐┬ ┬┬ ┬"
  echo "  ╠═╣│ │││││  ├─┤└┬┘"
  echo "  ╩ ╩└─┘┘└┘└─┘┴ ┴ ┴ "
  echo ""
  echo "  Installing Hunchy CLI..."
  echo ""

  # Detect platform
  local platform
  platform=$(detect_platform)
  log "Detected platform: $platform"

  # Create install directory
  mkdir -p "$INSTALL_DIR"
  success "Created install directory: $INSTALL_DIR"

  # Download manifest
  log "Fetching release manifest..."
  local tmp_dir
  tmp_dir=$(mktemp -d)
  trap 'rm -rf "$tmp_dir"' EXIT

  local manifest="$tmp_dir/manifest.json"
  download "$MANIFEST_URL" "$manifest"

  # Parse manifest (requires jq or fallback to grep)
  local binary_url checksum
  if command_exists jq; then
    binary_url=$(jq -r ".platforms.\"$platform\".url" "$manifest")
    checksum=$(jq -r ".platforms.\"$platform\".checksum" "$manifest")
  else
    # Fallback: use grep/sed (fragile but works for simple JSON)
    binary_url=$(grep "\"$platform\"" -A 2 "$manifest" | grep "url" | sed 's/.*"url": "\(.*\)".*/\1/')
    checksum=$(grep "\"$platform\"" -A 3 "$manifest" | grep "checksum" | sed 's/.*"checksum": "\(.*\)".*/\1/')
  fi

  if [ -z "$binary_url" ] || [ -z "$checksum" ]; then
    error "Platform $platform not found in manifest"
  fi

  success "Found release for $platform"

  # Download binary
  log "Downloading hunchy..."
  local tmp_binary="$tmp_dir/hunchy"
  download "$binary_url" "$tmp_binary"
  success "Downloaded hunchy"

  # Verify checksum
  verify_checksum "$tmp_binary" "$checksum"

  # Install binary
  log "Installing binary to $INSTALL_DIR/hunchy..."
  mv "$tmp_binary" "$INSTALL_DIR/hunchy"
  chmod +x "$INSTALL_DIR/hunchy"
  success "Installed hunchy"

  # Add to PATH
  add_to_path

  echo ""
  success "Hunchy CLI installed successfully!"
  echo ""
  echo "  Get started:"
  echo "    hunchy auth     # Authenticate"
  echo "    hunchy commit   # Create AI-powered commits"
  echo ""
  echo "  For help:"
  echo "    hunchy --help"
  echo ""
}

main "$@"
