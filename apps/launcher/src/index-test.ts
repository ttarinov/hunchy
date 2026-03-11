#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { spawn } from 'node:child_process';
import { get as httpGet } from 'node:http';
const HUNCHY_DIR = join(homedir(), '.hunchy-test');
const CACHE_DIR = join(HUNCHY_DIR, 'cache');
const VERSION_FILE = join(CACHE_DIR, 'version.json');
const UPDATE_CHECK_INTERVAL = 0; 
const VERSION_URL = 'http://localhost:8080/cli/version-local.json';
interface VersionManifest {
  latest: string;
  url: string;
  sha256: string;
  minLauncherVersion?: string;
}
interface CachedVersion {
  version: string;
  lastCheck: number;
  runtimePath: string;
}
function ensureDirectories(): void {
  if (!existsSync(HUNCHY_DIR)) {
    mkdirSync(HUNCHY_DIR, { mode: 0o700 });
  }
  if (!existsSync(CACHE_DIR)) {
    mkdirSync(CACHE_DIR, { mode: 0o700 });
  }
}
function download(url: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    httpGet(url, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        const redirectUrl = res.headers.location;
        if (!redirectUrl) {
          reject(new Error('Redirect without location'));
          return;
        }
        download(redirectUrl).then(resolve, reject);
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
        return;
      }
      const chunks: Buffer[] = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}
function sha256(data: Buffer): string {
  return createHash('sha256').update(data).digest('hex');
}
async function fetchVersionManifest(): Promise<VersionManifest> {
  try {
    const data = await download(VERSION_URL);
    return JSON.parse(data.toString('utf-8'));
  } catch (error) {
    throw new Error(`Failed to fetch version manifest: ${error}`);
  }
}
function getCachedVersion(): CachedVersion | null {
  try {
    if (!existsSync(VERSION_FILE)) {
      return null;
    }
    const data = readFileSync(VERSION_FILE, 'utf-8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}
function setCachedVersion(cache: CachedVersion): void {
  writeFileSync(VERSION_FILE, JSON.stringify(cache, null, 2), { mode: 0o600 });
}
function shouldCheckForUpdates(cached: CachedVersion | null): boolean {
  if (!cached) {
    return true;
  }
  const now = Date.now();
  const timeSinceLastCheck = now - cached.lastCheck;
  return timeSinceLastCheck > UPDATE_CHECK_INTERVAL;
}
async function downloadRuntime(manifest: VersionManifest): Promise<string> {
  console.log(`Downloading Hunchy CLI v${manifest.latest}...`);
  const runtimeData = await download(manifest.url);
  const actualHash = sha256(runtimeData);
  if (actualHash !== manifest.sha256) {
    throw new Error(
      `Checksum mismatch!\n` +
      `Expected: ${manifest.sha256}\n` +
      `Got:      ${actualHash}\n` +
      `This may indicate a corrupted download or security issue.`
    );
  }
  const runtimePath = join(CACHE_DIR, `runtime-${manifest.latest}.js`);
  writeFileSync(runtimePath, runtimeData, { mode: 0o600 });
  console.log(`Downloaded and verified v${manifest.latest}`);
  return runtimePath;
}
async function updateRuntime(): Promise<string> {
  const cached = getCachedVersion();
  if (!shouldCheckForUpdates(cached)) {
    if (cached && existsSync(cached.runtimePath)) {
      return cached.runtimePath;
    }
  }
  let manifest: VersionManifest;
  try {
    manifest = await fetchVersionManifest();
  } catch (error) {
    if (cached && existsSync(cached.runtimePath)) {
      console.error(`Warning: Could not check for updates, using cached version`);
      return cached.runtimePath;
    }
    throw error;
  }
  const needsDownload =
    !cached ||
    cached.version !== manifest.latest ||
    !existsSync(cached.runtimePath);
  let runtimePath: string;
  if (needsDownload) {
    runtimePath = await downloadRuntime(manifest);
  } else {
    runtimePath = cached.runtimePath;
  }
  setCachedVersion({
    version: manifest.latest,
    lastCheck: Date.now(),
    runtimePath
  });
  return runtimePath;
}
function executeRuntime(runtimePath: string, args: string[]): Promise<number> {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [runtimePath, ...args], {
      stdio: 'inherit',
      env: process.env
    });
    child.on('exit', (code) => {
      resolve(code ?? 1);
    });
    child.on('error', (error) => {
      console.error(`Failed to execute runtime: ${error.message}`);
      resolve(1);
    });
  });
}
async function main(): Promise<void> {
  try {
    ensureDirectories();
    const runtimePath = await updateRuntime();
    const args = process.argv.slice(2);
    const exitCode = await executeRuntime(runtimePath, args);
    process.exit(exitCode);
  } catch (error) {
    console.error(`Hunchy launcher error: ${error instanceof Error ? error.message : error}`);
    process.exit(1);
  }
}
main();
