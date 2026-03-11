@echo off
REM Hunchy CLI Installer for Windows (CMD)
REM
REM Quick install:
REM   curl -fsSL https://hunchy-4a0dc.web.app/install.cmd -o install.cmd && install.cmd && del install.cmd
REM

setlocal enabledelayedexpansion

echo.
echo   Installing Hunchy CLI...
echo.

REM Detect architecture
if "%PROCESSOR_ARCHITECTURE%"=="AMD64" (
    set PLATFORM=win-x64
) else if "%PROCESSOR_ARCHITECTURE%"=="ARM64" (
    set PLATFORM=win-arm64
) else (
    set PLATFORM=win-x86
)

echo ==^> Detected platform: !PLATFORM!

REM Configuration
set INSTALL_DIR=%USERPROFILE%\.hunchy\bin
set MANIFEST_URL=https://hunchy-4a0dc.web.app/manifest.json
set BINARY_URL=https://hunchy-4a0dc.web.app/binaries/hunchy-!PLATFORM!.exe

REM Create install directory
if not exist "!INSTALL_DIR!" mkdir "!INSTALL_DIR!"
echo + Created install directory: !INSTALL_DIR!

REM Download binary using PowerShell (available on all modern Windows)
echo ==^> Downloading hunchy...
powershell -Command "& { [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri '!BINARY_URL!' -OutFile '!INSTALL_DIR!\hunchy.exe' -UseBasicParsing }"

if errorlevel 1 (
    echo X Error: Failed to download binary
    exit /b 1
)

echo + Downloaded hunchy

REM Add to PATH (persistent)
powershell -Command "& { $path = [Environment]::GetEnvironmentVariable('Path', 'User'); if ($path -notlike '*!INSTALL_DIR!*') { [Environment]::SetEnvironmentVariable('Path', \"$path;!INSTALL_DIR!\", 'User'); Write-Host '+ Added to PATH' } else { Write-Host '+ Already in PATH' } }"

echo.
echo + Hunchy CLI installed successfully!
echo.
echo   Get started:
echo     hunchy auth     # Authenticate
echo     hunchy commit   # Create AI-powered commits
echo.
echo   For help:
echo     hunchy --help
echo.
echo   ! Restart your terminal to use 'hunchy'
echo.

endlocal
