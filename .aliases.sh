#!/bin/bash
# Hunchy Development Aliases
# Source this file in your ~/.zshrc or ~/.bashrc:
#   source ~/Documents/GitHub/hunchy/.aliases.sh

# Development CLI (npm linked)
alias hunchy-dev='hunchy --local'

# Production CLI (bypass npm link)
alias hunchy-prod='~/.hunchy/bin/hunchy'

# Quick rebuild and test
alias hunchy-rebuild='cd ~/Documents/GitHub/hunchy/apps/cli && npm run build && echo "✓ CLI rebuilt"'

# Check which hunchy you're using
alias hunchy-which='which hunchy && ls -la $(which hunchy)'
