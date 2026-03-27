import test from 'node:test';
import assert from 'node:assert/strict';

import { classifyChangedFiles } from '../release-ios-fast-path.mjs';

test('classifyChangedFiles reuses the existing iOS project for JS-only changes', () => {
  const result = classifyChangedFiles([
    'mobile/src/screens/HomeScreen.tsx',
    'backend/src/users/users.service.ts',
    'shared/contracts/discovery.ts',
  ]);

  assert.equal(result.nativePrep, 'reuse-existing-ios');
});

test('classifyChangedFiles forces a clean prebuild for native-affecting changes', () => {
  const result = classifyChangedFiles([
    'mobile/src/screens/HomeScreen.tsx',
    'mobile/app.config.ts',
  ]);

  assert.equal(result.nativePrep, 'clean-prebuild');
  assert.match(result.reason, /mobile\/app\.config\.ts/);
});

test('classifyChangedFiles defaults to a clean prebuild for unknown paths', () => {
  const result = classifyChangedFiles([
    'mobile/config/runtime.ts',
  ]);

  assert.equal(result.nativePrep, 'clean-prebuild');
  assert.match(result.reason, /Unclassified change/);
});
