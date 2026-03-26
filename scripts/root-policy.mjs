import fs from 'node:fs';
import path from 'node:path';
import { ACTIVE_DOCS } from './doc-policy.mjs';
import { buildRepoIndex } from './generate-repo-index.mjs';

const bannedPreviewPatterns = [
  /open the preview (tab|screen)/i,
  /navigate to (the )?preview/i,
  /preview navigator/i,
  /preview stack/i,
];

function referenceTokensForScript(filePath) {
  return [
    filePath,
    `./${filePath}`,
    `./${path.basename(filePath)}`,
  ];
}

function textReferencesScript(content, filePath) {
  return referenceTokensForScript(filePath).some((token) => content.includes(token));
}

export function collectRootScriptReachabilityViolations(files, rootPackage) {
  const violations = [];
  const scriptFiles = Object.keys(files)
    .filter((filePath) => filePath.startsWith('scripts/') && !filePath.startsWith('scripts/__tests__/'))
    .toSorted();
  const workflowText = Object.entries(files)
    .filter(([filePath]) => filePath.startsWith('.github/workflows/'))
    .map(([, content]) => content);
  const externallyReachableText = [
    ...ACTIVE_DOCS.map((filePath) => files[filePath] ?? ''),
    ...Object.values(rootPackage.scripts ?? {}),
    ...workflowText,
  ].join('\n');

  const reachableScripts = new Set(
    scriptFiles.filter((filePath) => textReferencesScript(externallyReachableText, filePath)),
  );

  let changed = true;
  while (changed) {
    changed = false;
    for (const filePath of scriptFiles) {
      if (reachableScripts.has(filePath)) {
        continue;
      }

      const isReferencedByReachableScript = [...reachableScripts].some((reachableScriptPath) =>
        textReferencesScript(files[reachableScriptPath] ?? '', filePath),
      );
      if (isReferencedByReachableScript) {
        reachableScripts.add(filePath);
        changed = true;
      }
    }
  }

  for (const filePath of scriptFiles) {
    if (!reachableScripts.has(filePath)) {
      violations.push(`${filePath}: top-level script is not reachable through a package script, workflow, or active docs`);
    }
  }

  return violations;
}

export function collectActiveDocPolicyViolations(files) {
  const violations = [];

  for (const filePath of ACTIVE_DOCS) {
    const content = files[filePath];
    if (!content) {
      continue;
    }

    for (const pattern of bannedPreviewPatterns) {
      if (pattern.test(content)) {
        violations.push(`${filePath}: active doc references legacy preview-route workflow`);
      }
    }
  }

  return violations;
}

export function collectRepoIndexViolations(rootDir) {
  const repoIndexPath = path.join(rootDir, 'artifacts', 'repo-index.json');
  const next = `${JSON.stringify(buildRepoIndex(rootDir), null, 2)}\n`;
  const current = fs.existsSync(repoIndexPath) ? fs.readFileSync(repoIndexPath, 'utf8') : null;
  if (current !== next) {
    return [`${path.relative(rootDir, repoIndexPath)}: generated repo index is out of sync; run "npm run repo:index"`];
  }

  return [];
}

export function collectRootPolicyViolations({ files, rootPackage, rootDir, checkRepoIndexSync = false }) {
  const violations = [
    ...collectRootScriptReachabilityViolations(files, rootPackage),
    ...collectActiveDocPolicyViolations(files),
  ];

  if (checkRepoIndexSync) {
    violations.push(...collectRepoIndexViolations(rootDir));
  }

  return violations;
}
