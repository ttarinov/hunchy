#!/usr/bin/env node
import { build } from 'esbuild';
import { writeFileSync, readFileSync } from 'fs';
import { createHash } from 'crypto';
async function buildStandalone() {
  console.log('Building standalone runtime...');
  const externalizeNodeBuiltins = {
    name: 'externalize-node-builtins',
    setup(build) {
      build.onResolve({ filter: /^node:/ }, args => {
        return { path: args.path, external: true };
      });
      const nodeBuiltins = [
        'assert', 'buffer', 'child_process', 'cluster', 'crypto', 'dgram',
        'dns', 'domain', 'events', 'fs', 'http', 'https', 'net', 'os',
        'path', 'punycode', 'querystring', 'readline', 'stream', 'string_decoder',
        'tls', 'tty', 'url', 'util', 'v8', 'vm', 'zlib', 'process'
      ];
      build.onResolve({ filter: new RegExp(`^(${nodeBuiltins.join('|')})$`) }, args => {
        return { path: 'node:' + args.path, external: true };
      });
    }
  };
  try {
    const result = await build({
      entryPoints: ['src/index.ts'],
      bundle: true,
      platform: 'node',
      target: 'node20',
      outfile: 'dist/runtime-bundled.mjs',
      format: 'esm',
      minify: false,
      sourcemap: false,
      metafile: true,
      plugins: [externalizeNodeBuiltins],
      loader: {
        '.js': 'jsx',
        '.jsx': 'jsx',
        '.ts': 'ts',
        '.tsx': 'tsx',
        '.node': 'file'
      },
      packages: 'external',
      external: [
        'fsevents'
      ],
      inject: [],
      mainFields: ['module', 'main'],
      conditions: ['node', 'import', 'require'],
      treeShaking: true,
      keepNames: true,
      define: {
        'process.env.NODE_ENV': '"production"'
      }
    });
    const outputFile = 'dist/runtime-bundled.mjs';
    console.log(`✓ Runtime built successfully: ${outputFile}`);
    const content = readFileSync(outputFile);
    const hash = createHash('sha256').update(content).digest('hex');
    console.log(`✓ SHA256: ${hash}`);
    console.log(`✓ Size: ${(content.length / 1024 / 1024).toFixed(2)} MB`);
    writeFileSync('dist/runtime-metadata.json', JSON.stringify({
      file: 'runtime-bundled.mjs',
      sha256: hash,
      size: content.length,
      buildDate: new Date().toISOString()
    }, null, 2));
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}
buildStandalone();
