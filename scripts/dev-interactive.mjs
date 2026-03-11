#!/usr/bin/env node

import { execSync, spawn } from 'child_process';
import { join } from 'path';
import { checkbox } from '@inquirer/prompts';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');

// Colors for output
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

function warn(msg) {
  console.log(`${colors.yellow}!${colors.reset} ${msg}`);
}

/**
 * Build and link CLI for local development
 */
function setupCli() {
  log('Setting up CLI for local development...');

  // Build TypeScript
  log('Building TypeScript...');
  execSync('cd apps/cli && npm run build', { stdio: 'inherit', cwd: PROJECT_ROOT });
  success('CLI built');

  // Create npm link
  log('Creating npm link...');
  execSync('cd apps/cli && npm link', { stdio: 'inherit', cwd: PROJECT_ROOT });
  success('CLI linked globally');

  console.log('');
  success('CLI setup complete!');
  console.log('');
  console.log('You can now use:');
  console.log(`  ${colors.green}hunchy --local${colors.reset}           # Run with local emulators`);
  console.log(`  ${colors.green}hunchy auth --local${colors.reset}      # Authenticate with emulators`);
  console.log(`  ${colors.green}hunchy --local${colors.reset}           # Start interactive mode`);
  console.log('');
  warn('Remember: Use --local flag to connect to Firebase emulators');
  console.log('');
}

/**
 * Start web development server
 */
function startWeb() {
  log('Starting Next.js development server...');
  console.log('');

  const webProcess = spawn('npm', ['run', 'dev'], {
    cwd: join(PROJECT_ROOT, 'apps/web'),
    stdio: 'inherit',
    shell: true,
  });

  return webProcess;
}

/**
 * Start Firebase emulators
 */
function startEmulators() {
  log('Starting Firebase emulators...');
  console.log('');

  const emulatorsProcess = spawn('firebase', ['emulators:start'], {
    cwd: PROJECT_ROOT,
    stdio: 'inherit',
    shell: true,
  });

  return emulatorsProcess;
}

/**
 * Main interactive dev setup
 */
async function main() {
  console.log('');
  console.log('  █ █ █ █ █▄ █ ▄▀▀ █ █ █▄█  █▀▄ ██▀ █ █');
  console.log('  █▀█ █▄█ █ ▀█ ▀▄▄ █▀█  █   █▄▀ █▄▄ ▀▄▀');
  console.log('');
  console.log('  Local Development Setup');
  console.log('');

  const devTargets = await checkbox({
    message: 'What do you want to run locally?',
    choices: [
      {
        name: 'CLI (build & link for local testing with --local flag)',
        value: 'cli',
        description: 'Build CLI and link globally. Use "hunchy --local" to run with emulators'
      },
      {
        name: 'Web App (Next.js dev server)',
        value: 'web',
        description: 'Start Next.js on http://localhost:3000'
      },
      {
        name: 'Firebase Emulators (Functions + Auth + Database)',
        value: 'emulators',
        description: 'Start local Firebase emulators'
      },
    ],
    validate: (answer) => {
      if (answer.length < 1) {
        return 'You must choose at least one development target.';
      }
      return true;
    },
  });

  console.log('');

  try {
    const processes = [];

    // Setup CLI if selected
    if (devTargets.includes('cli')) {
      setupCli();

      console.log('');
      log('Testing which hunchy is active:');
      try {
        const whichHunchy = execSync('which hunchy', { encoding: 'utf-8', cwd: PROJECT_ROOT }).trim();
        console.log(`  Active: ${whichHunchy}`);

        if (whichHunchy.includes('.nvm') || whichHunchy.includes('node_modules')) {
          success('npm link is active (development version)');
        } else if (whichHunchy.includes('.hunchy')) {
          warn('Production version is active! npm link may not be working.');
        }
      } catch {
        warn('hunchy command not found in PATH');
      }
      console.log('');

      if (devTargets.includes('emulators')) {
        console.log('');
        success('CLI is ready! After emulators start, use: hunchy --local');
        console.log('');
      }
    }

    // Start emulators if selected
    if (devTargets.includes('emulators')) {
      const emulatorsProcess = startEmulators();
      processes.push(emulatorsProcess);
    }

    // Start web if selected
    if (devTargets.includes('web')) {
      const webProcess = startWeb();
      processes.push(webProcess);
    }

    // If we have running processes, handle cleanup
    if (processes.length > 0) {
      console.log('');
      warn('Press Ctrl+C to stop all services');
      console.log('');

      // Handle graceful shutdown
      const cleanup = () => {
        console.log('');
        log('Stopping all services...');
        processes.forEach(proc => {
          if (proc && !proc.killed) {
            proc.kill();
          }
        });
        process.exit(0);
      };

      process.on('SIGINT', cleanup);
      process.on('SIGTERM', cleanup);

      // Wait for all processes
      await Promise.all(
        processes.map(proc => new Promise((resolve) => {
          proc.on('exit', resolve);
        }))
      );
    } else if (!devTargets.includes('cli')) {
      console.log('');
      warn('No services to run. Setup complete!');
      console.log('');
    }

  } catch (err) {
    console.error('');
    console.error(`${colors.red}✗${colors.reset} Development setup failed: ${err.message}`);
    process.exit(1);
  }
}

main();
