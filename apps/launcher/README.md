# Hunchy Launcher

**Tiny, verifiable, open-source bootstrap for Hunchy CLI**

This launcher is intentionally small (~260 lines) so you can easily verify what it does. It handles downloading and executing the Hunchy CLI runtime, which auto-updates without requiring a new launcher binary.

Inspired by the [Claude Code CLI](https://github.com/anthropics/claude-code-cli) architecture.

## Why Open Source?

The launcher is open source so you can:
- ✅ **Verify**: Inspect the code and confirm it only downloads and executes the runtime
- ✅ **Trust**: See exactly what runs on your machine
- ✅ **Build**: Compile your own binaries from this source
- ✅ **Audit**: Check that published binaries match this source code

The actual CLI logic (UI, commands, features) lives in the runtime, which is updated frequently. The launcher rarely changes—only when the update mechanism itself needs modification.

## Architecture

```
┌─────────────────────────────────────┐
│  Hunchy Launcher (this repo)        │
│  Open source, ~260 lines             │
│  Updates: Rare (1-2 times/year)     │
│                                      │
│  Does 3 things:                      │
│  1. Checks for runtime updates       │
│  2. Downloads & caches runtime       │
│  3. Executes runtime with args       │
└─────────────────────────────────────┘
              ↓ downloads
┌─────────────────────────────────────┐
│  Runtime (tarball: runtime + deps)  │
│  Hosted: hunchy-4a0dc.web.app/cli/  │
│  Updates: Frequent (UI, features)    │
│                                      │
│  Contains:                           │
│  - All CLI commands                  │
│  - Terminal UI (Ink/React)          │
│  - Git operations                    │
│  - API communication                 │
│  - node_modules (bundled)            │
└─────────────────────────────────────┘
```

## How It Works

1. **First Run**:
   - Launcher checks `https://hunchy-4a0dc.web.app/cli/version.json` for the latest runtime version
   - Downloads the runtime tarball (~28MB) to `~/.hunchy/cache/runtime-{version}.tar.gz`
   - Verifies the download with SHA256 checksum
   - Extracts to `~/.hunchy/cache/runtime-{version}/`
   - Executes the runtime entry point (`runtime.mjs`)

2. **Subsequent Runs**:
   - Uses cached runtime immediately (fast!)
   - **Background update checks** (every 6 hours, non-blocking)
   - Downloads new versions in background while you work
   - Shows notification on next launch when update is ready

3. **Updates**:
   - **Non-blocking**: CLI starts immediately, updates download in background
   - No waiting for updates - they happen while you work
   - No launcher binary updates needed
   - Checksums verified for security
   - Notification shown when new version is ready

## Installation

### Quick Install (Recommended)

```bash
curl -fsSL https://hunchy-4a0dc.web.app/install.sh | bash
```

This will:
- Detect your platform (macOS, Linux, Windows)
- Download the appropriate launcher binary
- Verify the checksum
- Install to `~/.hunchy/bin/hunchy`
- Add to your PATH automatically

### Manual Install

**macOS (Apple Silicon):**
```bash
curl -fsSL https://hunchy-4a0dc.web.app/binaries/hunchy-macos-arm64 -o hunchy
chmod +x hunchy
sudo mv hunchy /usr/local/bin/
```

**macOS (Intel):**
```bash
curl -fsSL https://hunchy-4a0dc.web.app/binaries/hunchy-macos-x64 -o hunchy
chmod +x hunchy
sudo mv hunchy /usr/local/bin/
```

**Linux (x64):**
```bash
curl -fsSL https://hunchy-4a0dc.web.app/binaries/hunchy-linux-x64 -o hunchy
chmod +x hunchy
sudo mv hunchy /usr/local/bin/
```

**Windows (x64):**
```powershell
# Download from https://hunchy-4a0dc.web.app/binaries/hunchy-win-x64.exe
# Add to PATH manually
```

### From Source

```bash
# Clone this repository
git clone https://github.com/hunchy-hq/hunchy.git
cd hunchy/apps/launcher

# Install dependencies
npm install

# Build TypeScript
npm run build

# Test
node dist/index.js --help

# Build standalone binaries
npm run build:binary
```

## Source Code

The entire launcher is in [`src/index.ts`](./src/index.ts) (~260 lines). It's intentionally simple and well-commented so anyone can understand what it does.

**Key functions:**
- `fetchVersionManifest()`: Downloads version info from the web
- `downloadRuntime()`: Downloads and verifies the runtime tarball
- `executeRuntime()`: Extracts and executes the runtime with Node.js

That's it. No magic, no hidden logic.

## Security

- **Checksums**: All runtime downloads are verified with SHA256
- **HTTPS**: All downloads use HTTPS
- **Permissions**: Cache files are `0600` (owner read/write only)
- **Open Source**: This launcher code is fully transparent
- **Tarball Verification**: Runtime entry point must exist after extraction
- **No telemetry**: The launcher itself sends no data

## Development

```bash
# Install dependencies
npm install

# Build TypeScript
npm run build

# Run locally
node dist/index.js --help

# Build binaries for all platforms
npm run build:binary
```

The build process:
1. Compiles TypeScript to JavaScript (ESM → CJS)
2. Bundles with esbuild (CommonJS format)
3. Creates standalone binaries with [@yao-pkg/pkg](https://github.com/yao-pkg/pkg)

## Configuration

The launcher uses:
- `~/.hunchy/cache/` - Runtime cache directory
- `~/.hunchy/cache/version.json` - Version cache
- `~/.hunchy/cache/runtime-{version}.tar.gz` - Downloaded runtime tarball
- `~/.hunchy/cache/runtime-{version}/` - Extracted runtime
  - `runtime.mjs` - Entry point
  - `package.json` - Runtime metadata
  - `node_modules/` - Runtime dependencies

## Version Manifest

The launcher fetches a version manifest from `https://hunchy-4a0dc.web.app/cli/version.json`:

```json
{
  "latest": "0.0.1",
  "url": "https://hunchy-4a0dc.web.app/cli/runtime-0.0.1.tar.gz",
  "sha256": "23c4a2cdcc2821b7fd16e4a9ffff23861ef7fa9ddaf62cfd3d4c931f1c452df8",
  "minLauncherVersion": "1.0.0",
  "releaseDate": "2026-01-17T00:00:00Z",
  "format": "tarball"
}
```

## Cache Management

Clear the cache to force a fresh download:

```bash
rm -rf ~/.hunchy/cache
```

## FAQ

**Q: Why is the runtime a tarball instead of a single file?**
A: The CLI uses Ink (React for terminal) which requires dependencies. Bundling everything into a single file was problematic due to dynamic requires. The tarball approach is more reliable and follows best practices.

**Q: How often does the launcher check for updates?**
A: By default, on every run (set to 0ms). This can be configured in the source code by changing `UPDATE_CHECK_INTERVAL`.

**Q: Can I use this with my own runtime?**
A: Yes! Fork this repo and change `VERSION_URL` in `src/index.ts` to point to your own `version.json`.

**Q: What happens if the update server is down?**
A: The launcher will use the cached runtime. You can still use Hunchy even if the update server is offline.

**Q: How do I verify the binary matches this source?**
A: Build from source following the "From Source" instructions above and compare checksums.

## License

Apache 2.0 License - see [LICENSE](../../LICENSE) for details.

## Support

- 🐛 Issues: [GitHub Issues](https://github.com/hunchy-hq/hunchy/issues)
- 📚 Docs: [https://hunchy-4a0dc.web.app/docs](https://hunchy-4a0dc.web.app/docs)

---

**Simple, transparent, trustworthy.** That's the Hunchy launcher.
