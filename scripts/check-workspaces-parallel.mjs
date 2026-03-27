#!/usr/bin/env node
/**
 * Runs workspace checks (backend, mobile, symphony) in parallel.
 * Streams output with workspace prefixes. Exits non-zero if any workspace fails.
 */
import { spawn } from 'node:child_process';

const workspaces = [
  { name: 'backend', command: 'npm run check:backend' },
  { name: 'mobile', command: 'npm run check:mobile' },
  { name: 'symphony', command: 'npm run check:symphony' },
];

function prefixStream(stream, prefix) {
  let buffer = '';
  stream.on('data', (chunk) => {
    buffer += chunk.toString();
    const lines = buffer.split('\n');
    buffer = lines.pop();
    for (const line of lines) {
      process.stdout.write(`[${prefix}] ${line}\n`);
    }
  });
  stream.on('end', () => {
    if (buffer) process.stdout.write(`[${prefix}] ${buffer}\n`);
  });
}

async function run() {
  const results = await Promise.allSettled(
    workspaces.map(
      ({ name, command }) =>
        new Promise((resolve, reject) => {
          const child = spawn('bash', ['-c', command], {
            cwd: process.cwd(),
            env: { ...process.env, FORCE_COLOR: '1' },
          });
          prefixStream(child.stdout, name);
          prefixStream(child.stderr, name);
          child.on('close', (code) => {
            if (code === 0) resolve(name);
            else reject(new Error(`${name} failed with exit code ${code}`));
          });
        }),
    ),
  );

  const failed = results.filter((r) => r.status === 'rejected');
  if (failed.length > 0) {
    console.error(
      `\n✗ ${failed.length} workspace(s) failed: ${failed.map((r) => r.reason.message).join(', ')}`,
    );
    process.exit(1);
  }
  console.log('\n✓ All workspace checks passed');
}

run();
