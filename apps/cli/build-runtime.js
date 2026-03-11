#!/usr/bin/env node
import { build } from 'esbuild';
import { writeFileSync } from 'fs';
async function buildRuntime() {
  console.log('Building standalone runtime...');
  try {
    await build({
      entryPoints: ['src/index.ts'],
      bundle: true,
      platform: 'node',
      target: 'node20',
      outfile: 'dist/runtime-standalone.js',
      format: 'esm',
      loader: {
        '.js': 'jsx',
        '.jsx': 'jsx',
        '.ts': 'ts',
        '.tsx': 'tsx'
      },
      external: [
        'fsevents'
      ],
      packages: 'external'
    });
    console.log('✓ Runtime built successfully: dist/runtime-standalone.cjs');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}
buildRuntime();
