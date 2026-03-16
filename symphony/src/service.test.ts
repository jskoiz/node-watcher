import test from 'node:test';
import assert from 'node:assert/strict';
import type { Issue } from './types.js';
import { buildIssueDispatchFingerprint } from './service.js';

const baseIssue: Issue = {
  id: 'issue-1',
  identifier: 'BRG-1',
  title: 'Example',
  description: 'Initial description',
  priority: 1,
  state: { id: 'todo', name: 'Todo', type: 'unstarted' },
  branchName: null,
  url: 'https://example.com',
  labels: ['mobile'],
  createdAt: '2026-03-16T10:00:00.000Z',
  updatedAt: '2026-03-16T10:00:00.000Z',
};

test('issue dispatch fingerprint stays stable for unchanged issues', () => {
  const left = buildIssueDispatchFingerprint(baseIssue);
  const right = buildIssueDispatchFingerprint({ ...baseIssue });
  assert.equal(left, right);
});

test('issue dispatch fingerprint changes when issue state changes', () => {
  const original = buildIssueDispatchFingerprint(baseIssue);
  const changed = buildIssueDispatchFingerprint({
    ...baseIssue,
    state: { id: 'review', name: 'Human Review', type: 'started' },
    updatedAt: '2026-03-16T10:05:00.000Z',
  });
  assert.notEqual(original, changed);
});

test('issue dispatch fingerprint changes when labels or description change', () => {
  const original = buildIssueDispatchFingerprint(baseIssue);
  const relabeled = buildIssueDispatchFingerprint({
    ...baseIssue,
    labels: ['mobile', 'urgent'],
  });
  const redesc = buildIssueDispatchFingerprint({
    ...baseIssue,
    description: 'Updated description',
    updatedAt: '2026-03-16T10:02:00.000Z',
  });
  assert.notEqual(original, relabeled);
  assert.notEqual(original, redesc);
});
