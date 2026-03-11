#!/usr/bin/env node
import { build } from 'esbuild';
import { execSync } from 'child_process';
import { existsSync, mkdirSync } from 'fs';
const platforms = [
  'node20-macos-x64',
  'node20-macos-arm64',
  'node20-linux-x64',
  'node20-linux-arm64',
  'node20-win-x64'
];
async function buildBinaries() {
  console.log('Building launcher binaries...\n');
  if (!existsSync('./dist')) {
    mkdirSync('./dist');
  }
  console.log('1. Compiling TypeScript...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('\n2. Bundling with esbuild...');
  await build({
    entryPoints: ['./dist/index.js'],
    bundle: true,
    platform: 'node',
    target: 'node20',
    outfile: './dist/bundled.cjs',
    format: 'cjs'
  });
  console.log('\n3. Creating platform binaries...');
  if (!existsSync('./binaries')) {
    mkdirSync('./binaries');
  }
  for (const platform of platforms) {
    const [, os, arch] = platform.match(/node\d+-(\w+)-(\w+)/);
    const ext = os === 'win' ? '.exe' : '';
    const output = `./binaries/hunchy-${os}-${arch}${ext}`;
    console.log(`   Building for ${os}-${arch}...`);
    try {
      execSync(
        `pkg ./dist/bundled.cjs --target ${platform} --output ${output}`,
        { stdio: 'pipe' }
      );
      console.log(`   ✓ ${output}`);
    } catch (error) {
      console.error(`   ✗ Failed to build for ${platform}`);
      console.error(error.message);
    }
  }
  console.log('\n✓ Build complete! Binaries are in ./binaries/');
  console.log('\nNext steps:');
  console.log('1. Test binaries: ./binaries/hunchy-<os>-<arch> --help');
  console.log('2. Calculate checksums: shasum -a 256 binaries/*');
  console.log('3. Upload to GitHub Releases');
}
buildBinaries().catch((error) => {
  console.error('Build failed:', error);
  process.exit(1);
});
