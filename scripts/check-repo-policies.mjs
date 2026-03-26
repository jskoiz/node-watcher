import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadRepoPolicyContext as loadRepoPolicyContextFromFiles } from './repo-policy-context.mjs';
import {
  collectCoverageAudit,
  collectStorybookCoverageViolations,
  matchesStorybookRequiredPath,
} from './repo-policy-coverage.mjs';
import {
  collectEnvViolations,
  collectMobileViolations,
  collectRootViolations,
  collectLayerViolations,
  collectRepoIndexViolations,
} from './repo-policy-collectors.mjs';

const scriptPath = fileURLToPath(import.meta.url);
const scriptDir = path.dirname(scriptPath);
const repoRoot = path.resolve(scriptDir, '..');

export function loadRepoPolicyContext(rootDir = repoRoot) {
  return loadRepoPolicyContextFromFiles(rootDir);
}

export { collectCoverageAudit, collectStorybookCoverageViolations, matchesStorybookRequiredPath };

export function collectRepoPolicyViolations({
  files,
  rootPackage,
  scope = 'all',
  rootDir = repoRoot,
  checkRepoIndexSync = false,
} = {}) {
  const violations = [...collectEnvViolations(files, scope)];

  if (scope === 'all' || scope === 'backend' || scope === 'mobile') {
    violations.push(...collectLayerViolations(files, scope, rootDir));
  }

  if (scope === 'all' || scope === 'mobile') {
    violations.push(...collectMobileViolations(files));
  }

  if (scope === 'all') {
    violations.push(...collectRootViolations(files, rootPackage, rootDir));
    if (checkRepoIndexSync) {
      violations.push(...collectRepoIndexViolations(rootDir));
    }
  }

  return violations;
}

function printCoverageAudit(files) {
  const { storybookGaps, testGaps } = collectCoverageAudit(files);
  console.log('Coverage audit');
  console.log(`- Storybook heuristic gaps: ${storybookGaps.length}`);
  for (const gap of storybookGaps) {
    console.log(`  - ${gap}`);
  }
  console.log(`- Test heuristic gaps: ${testGaps.length}`);
  for (const gap of testGaps) {
    console.log(`  - ${gap}`);
  }
}

function main() {
  const args = process.argv.slice(2);
  const scopeIndex = args.indexOf('--scope');
  const scope = scopeIndex >= 0 ? args[scopeIndex + 1] : 'all';
  const auditOnly = args.includes('--audit');
  const { files, rootPackage } = loadRepoPolicyContext(repoRoot);
  const violations = collectRepoPolicyViolations({
    files,
    rootPackage,
    scope,
    rootDir: repoRoot,
    checkRepoIndexSync: true,
  });

  if (violations.length > 0) {
    console.error('Repo policy violations detected:\n');
    for (const violation of violations) {
      console.error(`- ${violation}`);
    }
    process.exit(1);
  }

  if (auditOnly) {
    printCoverageAudit(files);
    return;
  }

  console.log(`Repo policy check passed for scope "${scope}".`);
}

if (process.argv[1] === scriptPath) {
  main();
}
