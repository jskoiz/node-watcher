import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DOC_POLICY,
  isActiveDocFile,
  isGovernedMarkdownFile,
  listMarkdownFiles,
} from '../doc-policy.mjs';

test('centralizes the governed markdown definitions', () => {
  assert.deepEqual(DOC_POLICY.discoveryRoots, ['docs', '.github']);
  assert.equal(isGovernedMarkdownFile('WORKFLOW.md'), true);
  assert.equal(isActiveDocFile('docs/HARNESS.md'), true);
  assert.equal(isActiveDocFile('docs/notes.md'), false);
});

test('lists discovered markdown alongside governed root docs', () => {
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'brdg-doc-policy-'));
  const write = (relativePath, content) => {
    const absolutePath = path.join(fixtureRoot, relativePath);
    fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
    fs.writeFileSync(absolutePath, content);
  };

  write('AGENTS.md', '# Repo\n');
  write('WORKFLOW.md', '# Workflow\n');
  write('backend/README.md', '# Backend\n');
  write('docs/HARNESS.md', '# Harness\n');
  write('docs/guide.md', '# Guide\n');
  write('.github/workflows/ci.md', '# CI\n');

  assert.deepEqual(listMarkdownFiles(fixtureRoot), [
    '.github/workflows/ci.md',
    'AGENTS.md',
    'WORKFLOW.md',
    'backend/README.md',
    'docs/HARNESS.md',
    'docs/guide.md',
  ]);
});
