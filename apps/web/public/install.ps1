# Hunchy CLI Installer for Windows (PowerShell)
#
# Quick install:
#   irm https://hunchy-4a0dc.web.app/install.ps1 | iex
#
# Manual install:
#   Invoke-WebRequest -Uri https://hunchy-4a0dc.web.app/install.ps1 -OutFile install.ps1
#   .\install.ps1
#

$ErrorActionPreference = 'Stop'

# Colors
function Write-Info {
    param([string]$Message)
    Write-Host "==>" -ForegroundColor Blue -NoNewline
    Write-Host " $Message"
}

function Write-Success {
    param([string]$Message)
    Write-Host "✓" -ForegroundColor Green -NoNewline
    Write-Host " $Message"
}

function Write-Error {
    param([string]$Message)
    Write-Host "✗ Error:" -ForegroundColor Red -NoNewline
    Write-Host " $Message" -ForegroundColor Red
    exit 1
}

function Write-Warning {
    param([string]$Message)
    Write-Host "!" -ForegroundColor Yellow -NoNewline
    Write-Host " $Message"
}

# Banner
Write-Host ""
Write-Host "  ╦ ╦┬ ┬┌┐┌┌─┐┬ ┬┬ ┬" -ForegroundColor Blue
Write-Host "  ╠═╣│ │││││  ├─┤└┬┘" -ForegroundColor Blue
Write-Host "  ╩ ╩└─┘┘└┘└─┘┴ ┴ ┴ " -ForegroundColor Blue
Write-Host ""
Write-Host "  Installing Hunchy CLI..." -ForegroundColor Blue
Write-Host ""

# Detect architecture
$arch = if ([System.Environment]::Is64BitOperatingSystem) { "x64" } else { "x86" }
$platform = "win-$arch"

Write-Info "Detected platform: $platform"

# Configuration
$installDir = "$env:USERPROFILE\.hunchy\bin"
$manifestUrl = "https://hunchy-4a0dc.web.app/manifest.json"

# Create install directory
if (-not (Test-Path $installDir)) {
    New-Item -ItemType Directory -Force -Path $installDir | Out-Null
}
Write-Success "Created install directory: $installDir"

# Download manifest
Write-Info "Fetching release manifest..."
try {
    $manifest = Invoke-RestMethod -Uri $manifestUrl -ErrorAction Stop
}
catch {
    Write-Error "Failed to download manifest: $_"
}

# Get platform-specific info
$platformInfo = $manifest.platforms.$platform
if (-not $platformInfo) {
    Write-Error "Platform $platform not found in manifest"
}

$binaryUrl = $platformInfo.url
$expectedChecksum = $platformInfo.checksum

Write-Success "Found release for $platform"

# Download binary
Write-Info "Downloading hunchy..."
$binaryPath = "$installDir\hunchy.exe"
try {
    # Show progress
    $ProgressPreference = 'SilentlyContinue'
    Invoke-WebRequest -Uri $binaryUrl -OutFile $binaryPath -ErrorAction Stop
    $ProgressPreference = 'Continue'
}
catch {
    Write-Error "Failed to download binary: $_"
}
Write-Success "Downloaded hunchy"

# Verify checksum
Write-Info "Verifying checksum..."
$actualChecksum = (Get-FileHash -Path $binaryPath -Algorithm SHA256).Hash.ToLower()
if ($actualChecksum -ne $expectedChecksum) {
    Remove-Item $binaryPath -Force
    Write-Error "Checksum verification failed!`nExpected: $expectedChecksum`nGot:      $actualChecksum"
}
Write-Success "Checksum verified"

# Add to PATH
$userPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($userPath -notlike "*$installDir*") {
    Write-Info "Adding $installDir to PATH..."
    [Environment]::SetEnvironmentVariable("Path", "$userPath;$installDir", "User")
    Write-Success "Added to PATH"
    Write-Warning "Restart your terminal to use 'hunchy'"
}
else {
    Write-Success "$installDir is already in PATH"
}

Write-Host ""
Write-Success "Hunchy CLI installed successfully!"
Write-Host ""
Write-Host "  Get started:" -ForegroundColor Blue
Write-Host "    hunchy auth     # Authenticate"
Write-Host "    hunchy commit   # Create AI-powered commits"
Write-Host ""
Write-Host "  For help:" -ForegroundColor Blue
Write-Host "    hunchy --help"
Write-Host ""
