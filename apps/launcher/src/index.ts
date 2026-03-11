#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { spawn, execSync } from 'node:child_process';
import { get as httpsGet } from 'node:https';
declare global {
  namespace NodeJS {
    interface Process {
      pkg?: {
        entrypoint: string;
        defaultEntrypoint: string;
      };
    }
  }
}
const HUNCHY_DIR = join(homedir(), '.hunchy');
const CACHE_DIR = join(HUNCHY_DIR, 'cache');
const VERSION_FILE = join(CACHE_DIR, 'version.json');
const UPDATE_CHECK_INTERVAL = 0; 
const VERSION_URL = 'https://hunchy-4a0dc.web.app/cli/version.json';
interface VersionManifest {
  latest: string;
  url: string;
  sha256: string;
  minLauncherVersion?: string;
  format?: 'tarball' | 'single';
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
    httpsGet(url, (res) => {
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
  if (manifest.format === 'tarball') {
    const tarPath = join(CACHE_DIR, `runtime-${manifest.latest}.tar.gz`);
    const extractDir = join(CACHE_DIR, `runtime-${manifest.latest}`);
    if (existsSync(extractDir)) {
      rmSync(extractDir, { recursive: true, force: true });
    }
    writeFileSync(tarPath, runtimeData, { mode: 0o600 });
    mkdirSync(extractDir, { mode: 0o700 });
    execSync(`tar -xzf "${tarPath}" -C "${extractDir}"`, { stdio: 'pipe' });
    const runtimePath = join(extractDir, 'runtime.mjs');
    if (!existsSync(runtimePath)) {
      throw new Error(`Runtime entry point not found after extraction: ${runtimePath}`);
    }
    console.log(`Downloaded and verified v${manifest.latest}`);
    return runtimePath;
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
function findNodeExecutable(): string {
  if (!process.pkg) {
    return process.execPath;
  }
  try {
    const result = execSync('which node', { encoding: 'utf-8' }).trim();
    if (result && existsSync(result)) {
      return result;
    }
  } catch {
  }
  const commonPaths = [
    '/usr/local/bin/node',
    '/usr/bin/node',
    '/opt/homebrew/bin/node',
    `${homedir()}/.nvm/versions/node/*/bin/node`
  ];
  for (const path of commonPaths) {
    if (existsSync(path)) {
      return path;
    }
  }
  return 'node';
}
function executeRuntime(runtimePath: string, args: string[]): Promise<number> {
  return new Promise((resolve) => {
    const nodeExe = findNodeExecutable();
    const child = spawn(nodeExe, [runtimePath, ...args], {
      stdio: 'inherit',
      env: process.env
    });
    child.on('exit', (code) => {
      resolve(code ?? 1);
    });
    child.on('error', (error) => {
      console.error(`Failed to execute runtime: ${error.message}`);
      console.error(`Tried to use Node.js from: ${nodeExe}`);
      console.error(`Make sure Node.js is installed and in your PATH`);
      resolve(1);
    });
  });
}
function startBackgroundUpdateCheck(): void {
  const cached = getCachedVersion();
  const SIX_HOURS = 6 * 60 * 60 * 1000;
  if (cached && Date.now() - cached.lastCheck < SIX_HOURS) {
    return;
  }
  const nodeExe = findNodeExecutable();
  try {
    spawn(nodeExe, [process.argv[1], '--background-update-check'], {
      detached: true,
      stdio: 'ignore',
      env: process.env
    }).unref(); 
  } catch {
  }
}
async function performBackgroundUpdate(): Promise<void> {
  try {
    ensureDirectories();
    const cached = getCachedVersion();
    let manifest: VersionManifest;
    try {
      manifest = await fetchVersionManifest();
    } catch {
      return;
    }
    if (cached) {
      setCachedVersion({
        ...cached,
        lastCheck: Date.now()
      });
    }
    if (cached && cached.version === manifest.latest) {
      return;
    }
    const runtimePath = await downloadRuntime(manifest);
    setCachedVersion({
      version: manifest.latest,
      lastCheck: Date.now(),
      runtimePath
    });
    writeFileSync(
      join(CACHE_DIR, 'update-available'),
      manifest.latest,
      { mode: 0o600 }
    );
  } catch {
  }
}
async function main(): Promise<void> {
  try {
    const args = process.argv.slice(2);
    if (args[0] === '--background-update-check') {
      await performBackgroundUpdate();
      return;
    }
    ensureDirectories();
    const cached = getCachedVersion();
    if (!cached || !existsSync(cached.runtimePath)) {
      console.log('First run - downloading Hunchy CLI...');
      const runtimePath = await updateRuntime();
      const exitCode = await executeRuntime(runtimePath, args);
      process.exit(exitCode);
      return;
    }
    const runtimePath = cached.runtimePath;
    startBackgroundUpdateCheck();
    const exitCode = await executeRuntime(runtimePath, args);
    process.exit(exitCode);
  } catch (error) {
    console.error(`Hunchy launcher error: ${error instanceof Error ? error.message : error}`);
    process.exit(1);
  }
}
main();
