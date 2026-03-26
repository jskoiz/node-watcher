import path from 'node:path';
import {
  STORYBOOK_REQUIRED_PATTERNS,
  STORY_COVERAGE_ALIASES,
  TEST_COVERAGE_ALIASES,
} from './repo-policy-constants.mjs';

export function matchesStorybookRequiredPath(filePath) {
  if (filePath === 'mobile/src/design/theme.tsx') {
    return false;
  }

  if (filePath.includes('/__tests__/') || filePath.endsWith('.test.tsx') || filePath.endsWith('.test.ts')) {
    return false;
  }

  if (/\.(styles|helpers|data)\.ts$/.test(filePath)) {
    return false;
  }

  return STORYBOOK_REQUIRED_PATTERNS.some((pattern) => pattern.test(filePath));
}

export function collectStorybookCoverageViolations(changedFiles) {
  const requiredFiles = changedFiles.filter(matchesStorybookRequiredPath);
  const storyTouched = changedFiles.some((filePath) => filePath.startsWith('mobile/src/stories/') && filePath.endsWith('.stories.tsx'));

  if (requiredFiles.length > 0 && !storyTouched) {
    return [`Reusable mobile UI changed without a Storybook update: ${requiredFiles.join(', ')}`];
  }

  return [];
}

function isStoryCovered(filePath, storyFiles) {
  const aliases = STORY_COVERAGE_ALIASES[filePath] ?? [];
  const baseName = path.basename(filePath, path.extname(filePath));
  return storyFiles.some((storyPath) => storyPath.includes(`${baseName}.stories.tsx`) || aliases.some((alias) => storyPath.endsWith(alias)));
}

function isTestCovered(filePath, testFiles) {
  const aliases = TEST_COVERAGE_ALIASES[filePath] ?? [];
  const baseName = path.basename(filePath, path.extname(filePath));
  return testFiles.some((testPath) => testPath.includes(`${baseName}.test.tsx`) || testPath.includes(`${baseName}.test.ts`) || aliases.some((alias) => testPath.endsWith(alias)));
}

export function collectCoverageAudit(files) {
  const candidateFiles = Object.keys(files).filter(matchesStorybookRequiredPath);
  const storyFiles = Object.keys(files).filter((filePath) => filePath.startsWith('mobile/src/stories/') && filePath.endsWith('.stories.tsx'));
  const testFiles = Object.keys(files).filter((filePath) => filePath.includes('/__tests__/') || filePath.endsWith('.test.tsx') || filePath.endsWith('.test.ts'));

  return {
    storybookGaps: candidateFiles.filter((filePath) => !isStoryCovered(filePath, storyFiles)).toSorted(),
    testGaps: candidateFiles.filter((filePath) => !isTestCovered(filePath, testFiles)).toSorted(),
  };
}
