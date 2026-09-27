#!/usr/bin/env node
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tsFile = path.resolve(__dirname, 'run_tests.ts');

const args = ['--experimental-strip-types', '--no-warnings', tsFile, ...process.argv.slice(2)];

const child = spawn(process.execPath, args, {
  stdio: 'inherit',
  cwd: __dirname,
});

child.on('exit', (code) => {
  process.exit(code ?? 0);
});
