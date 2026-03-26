import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import { collectDocViolations } from '../check-docs.mjs';

test('reports missing markdown targets and unknown npm scripts', () => {
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'brdg-check-docs-'));
  const write = (relativePath, content) => {
    const absolutePath = path.join(fixtureRoot, relativePath);
    fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
    fs.writeFileSync(absolutePath, content);
  };

  write('docs/existing.md', '# Existing\n');
  write(
    'docs/HARNESS.md',
    [
      '# Harness',
      '',
      'Use [existing](./existing.md) and [missing](./missing.md).',
      'Run `npm run docs:check` and `npm run missing:script`.',
      '',
    ].join('\n'),
  );

  assert.deepEqual(
    collectDocViolations({
      rootDir: fixtureRoot,
      markdownFiles: ['docs/HARNESS.md'],
      packageScripts: {
        'package.json': new Set(['docs:check']),
      },
    }),
    [
      'docs/HARNESS.md: missing markdown link target -> ./missing.md',
      'docs/HARNESS.md: references unknown npm script -> missing:script',
    ],
  );
});
