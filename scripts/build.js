#!/usr/bin/env node
/**
 * Lexora Production Build Script
 * Enforces NODE_ENV=production to ensure Next.js App Router static prerendering
 * and React Server Component context dispatchers initialize correctly.
 */

process.env.NODE_ENV = 'production';

const { spawnSync } = require('child_process');
const path = require('path');

const nextBin = path.join(__dirname, '..', 'node_modules', 'next', 'dist', 'bin', 'next');

console.log('[Lexora Build] Starting Next.js build with NODE_ENV=production...');

const result = spawnSync(process.execPath, [nextBin, 'build'], {
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_ENV: 'production',
  },
});

process.exit(result.status ?? 0);
