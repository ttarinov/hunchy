#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { select, checkbox } from '@inquirer/prompts';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

const colors = {
  blue: '\x1b[34m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

function log(msg, color = 'blue') {
  console.log(`${colors[color]}==>${colors.reset} ${msg}`);
}

function success(msg) {
  console.log(`${colors.green}✓${colors.reset} ${msg}`);
}

function error(msg) {
  console.log(`${colors.red}✗${colors.reset} ${msg}`);
  process.exit(1);
}

function warn(msg) {
  console.log(`${colors.yellow}!${colors.reset} ${msg}`);
}

function getCurrentVersion() {
  const packageJsonPath = join(PROJECT_ROOT, 'apps/cli/package.json');
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
  return packageJson.version;
}

function bumpVersion(currentVersion, type) {
  const parts = currentVersion.split('.').map(Number);

  switch (type) {
    case 'patch':
      parts[2]++;
      break;
    case 'minor':
      parts[1]++;
      parts[2] = 0;
      break;
    case 'major':
      parts[0]++;
      parts[1] = 0;
      parts[2] = 0;
      break;
    default:
      return currentVersion;
  }

  return parts.join('.');
}

function updateCliVersion(newVersion) {
  const packageJsonPath = join(PROJECT_ROOT, 'apps/cli/package.json');
  const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
  packageJson.version = newVersion;
  writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
  success(`Updated CLI version to ${newVersion}`);
}

async function deployCli(skipVersionBump = false) {
  const currentVersion = getCurrentVersion();

  let newVersion = currentVersion;

  if (!skipVersionBump) {
    console.log(''); // Add spacing

    // Check for uncommitted changes in CLI
    try {
      const hasChanges = execSync('git status --porcelain apps/cli', {
        encoding: 'utf-8',
        cwd: PROJECT_ROOT
      }).trim();

      if (hasChanges) {
        warn('Detected uncommitted changes in apps/cli:');
        console.log(hasChanges);
        console.log('');
      } else {
        log('No uncommitted changes detected in apps/cli');
      }
    } catch (err) {
      // Git not available or not a repo
    }

    const patchVersion = bumpVersion(currentVersion, 'patch');
    const minorVersion = bumpVersion(currentVersion, 'minor');
    const majorVersion = bumpVersion(currentVersion, 'major');

    const versionBump = await select({
      message: `Current version is ${currentVersion}. How do you want to bump it?`,
      choices: [
        {
          name: `+0.0.1 - Micro release (${currentVersion} -> ${patchVersion}) [Recommended]`,
          value: 'patch',
          description: 'Small fixes and improvements'
        },
        {
          name: `+0.1.0 - Feature release (${currentVersion} -> ${minorVersion})`,
          value: 'minor',
          description: 'New features and improvements'
        },
        {
          name: `+1.0.0 - Big release (${currentVersion} -> ${majorVersion})`,
          value: 'major',
          description: 'Major changes and breaking updates'
        },
        {
          name: `No change - Keep ${currentVersion} (users won't get updates)`,
          value: 'skip',
          description: 'Re-deploy same version'
        },
      ],
      default: 'patch',
    });

    // Use the value directly
    const selectedType = versionBump;

    if (selectedType !== 'skip') {
      newVersion = bumpVersion(currentVersion, selectedType);
      updateCliVersion(newVersion);
    } else {
      warn('Skipping version bump - users may not receive the update');
    }
  }

  console.log('');
  log('Building CLI runtime...');
  execSync('cd apps/cli && npm run build && npm run bundle:standalone', { stdio: 'inherit', cwd: PROJECT_ROOT });

  log('Preparing runtime bundle...');
  execSync(`
    rm -rf apps/cli/dist/bundle
    mkdir -p apps/cli/dist/bundle
    cp apps/cli/dist/runtime-bundled.mjs apps/cli/dist/bundle/runtime.mjs
    cp apps/cli/package.json apps/cli/dist/bundle/
  `, { shell: true, cwd: PROJECT_ROOT });

  log('Installing runtime dependencies...');
  execSync('cd apps/cli/dist/bundle && npm install --production --legacy-peer-deps --silent', {
    stdio: 'inherit',
    cwd: PROJECT_ROOT
  });

  log('Creating runtime tarball...');
  execSync(`cd apps/cli/dist/bundle && tar -czf ../runtime-${newVersion}.tar.gz .`, {
    shell: true,
    cwd: PROJECT_ROOT
  });

  const checksum = execSync(`shasum -a 256 apps/cli/dist/runtime-${newVersion}.tar.gz | awk '{print $1}'`, {
    encoding: 'utf-8',
    cwd: PROJECT_ROOT
  }).trim();

  success(`Runtime built: apps/cli/dist/runtime-${newVersion}.tar.gz`);
  log(`Runtime checksum: ${checksum}`);

  // Update version.json
  log('Updating version.json...');
  const versionJson = {
    latest: newVersion,
    url: `https://hunchy-4a0dc.web.app/cli/runtime-${newVersion}.tar.gz`,
    sha256: checksum,
    minLauncherVersion: '1.0.0',
    releaseDate: new Date().toISOString(),
    format: 'tarball',
  };
  writeFileSync(
    join(PROJECT_ROOT, 'apps/web/public/cli/version.json'),
    JSON.stringify(versionJson, null, 2) + '\n'
  );
  success('Updated version.json');

  // Build launcher binaries
  log('Building launcher binaries...');
  execSync('cd apps/launcher && npm run build:binary', { stdio: 'inherit', cwd: PROJECT_ROOT });

  // Calculate launcher checksums
  log('Calculating launcher checksums...');
  const launchers = {
    'macos-x64': execSync('shasum -a 256 apps/launcher/binaries/hunchy-macos-x64 | awk \'{print $1}\'', { encoding: 'utf-8', cwd: PROJECT_ROOT }).trim(),
    'macos-arm64': execSync('shasum -a 256 apps/launcher/binaries/hunchy-macos-arm64 | awk \'{print $1}\'', { encoding: 'utf-8', cwd: PROJECT_ROOT }).trim(),
    'linux-x64': execSync('shasum -a 256 apps/launcher/binaries/hunchy-linux-x64 | awk \'{print $1}\'', { encoding: 'utf-8', cwd: PROJECT_ROOT }).trim(),
    'linux-arm64': execSync('shasum -a 256 apps/launcher/binaries/hunchy-linux-arm64 | awk \'{print $1}\'', { encoding: 'utf-8', cwd: PROJECT_ROOT }).trim(),
    'win-x64': execSync('shasum -a 256 apps/launcher/binaries/hunchy-win-x64.exe | awk \'{print $1}\'', { encoding: 'utf-8', cwd: PROJECT_ROOT }).trim(),
  };

  // Update manifest.json
  log('Updating manifest.json...');
  const manifest = {
    version: '1.0.0',
    releaseDate: new Date().toISOString(),
    platforms: {
      'macos-x64': {
        url: 'https://hunchy-4a0dc.web.app/binaries/hunchy-macos-x64',
        checksum: launchers['macos-x64'],
      },
      'macos-arm64': {
        url: 'https://hunchy-4a0dc.web.app/binaries/hunchy-macos-arm64',
        checksum: launchers['macos-arm64'],
      },
      'linux-x64': {
        url: 'https://hunchy-4a0dc.web.app/binaries/hunchy-linux-x64',
        checksum: launchers['linux-x64'],
      },
      'linux-arm64': {
        url: 'https://hunchy-4a0dc.web.app/binaries/hunchy-linux-arm64',
        checksum: launchers['linux-arm64'],
      },
      'win-x64': {
        url: 'https://hunchy-4a0dc.web.app/binaries/hunchy-win-x64.exe',
        checksum: launchers['win-x64'],
      },
    },
  };
  writeFileSync(
    join(PROJECT_ROOT, 'apps/web/public/manifest.json'),
    JSON.stringify(manifest, null, 2) + '\n'
  );
  success('Updated manifest.json');
}

async function buildWeb() {
  log('Building web app...');
  execSync('cd apps/web && npm run build', { stdio: 'inherit', cwd: PROJECT_ROOT });
  success('Web app built');
}

async function deployToFirebase(targets) {
  log('Deploying to Firebase...');

  let deployCommand = 'firebase deploy --only ';

  if (targets.includes('hosting')) {
    deployCommand += 'hosting,';
  }
  if (targets.includes('functions')) {
    deployCommand += 'functions,';
  }

  deployCommand = deployCommand.replace(/,$/, '');

  execSync(deployCommand, { stdio: 'inherit', cwd: PROJECT_ROOT });
  success('Deployment complete!');
}

async function main() {
  console.log('');
  console.log('  █ █ █ █ █▄ █ ▄▀▀ █ █ █▄█  █▀▄ ██▀ █▀▄ █   ▄▀▄ ▀▄▀');
  console.log('  █▀█ █▄█ █ ▀█ ▀▄▄ █▀█  █   █▄▀ █▄▄ █▀  █▄▄ ▀▄▀  █');
  console.log('');

  const deployTargets = await checkbox({
    message: 'What do you want to deploy?',
    choices: [
      { name: 'CLI (Runtime + Launcher)', value: 'cli' },
      { name: 'Web App (Next.js) - required for CLI updates', value: 'web' },
      { name: 'Firebase Functions', value: 'functions' },
    ],
    validate: (answer) => {
      if (answer.length < 1) {
        return 'You must choose at least one deployment target.';
      }
      return true;
    },
  });

  console.log('');

  // Auto-select web if CLI is selected (required for deployment)
  if (deployTargets.includes('cli') && !deployTargets.includes('web')) {
    warn('Web App will be automatically included (required to deploy CLI files)');
    deployTargets.push('web');
  }

  try {
    if (deployTargets.includes('cli')) {
      await deployCli();
    }

    if (deployTargets.includes('web') || deployTargets.includes('cli')) {
      await buildWeb();

      if (deployTargets.includes('cli')) {
        const currentVersion = getCurrentVersion();
        log('Copying CLI files to web output...');
        execSync(`
          mkdir -p apps/web/out/cli apps/web/out/binaries
          cp apps/cli/dist/runtime-${currentVersion}.tar.gz apps/web/out/cli/
          cp apps/web/public/cli/version.json apps/web/out/cli/
          cp apps/launcher/binaries/* apps/web/out/binaries/
          cp apps/web/public/manifest.json apps/web/out/
          cp apps/web/public/install.sh apps/web/out/
          cp apps/web/public/install.ps1 apps/web/out/
          cp apps/web/public/install.cmd apps/web/out/
        `, { shell: true, cwd: PROJECT_ROOT });
        success('CLI files copied to web output');
      }
    }

    const firebaseTargets = [];
    if (deployTargets.includes('web') || deployTargets.includes('cli')) {
      firebaseTargets.push('hosting');
    }
    if (deployTargets.includes('functions')) {
      firebaseTargets.push('functions');
    }

    if (firebaseTargets.length > 0) {
      await deployToFirebase(firebaseTargets);
    }

    console.log('');
    success('All deployments completed successfully!');
    console.log('');
    log('Installation command:');
    console.log('  curl -fsSL https://hunchy-4a0dc.web.app/install.sh | bash');
    console.log('');

  } catch (err) {
    console.error('');
    error(`Deployment failed: ${err.message}`);
  }
}

main();
