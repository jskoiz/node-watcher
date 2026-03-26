import fs from 'node:fs';
import path from 'node:path';
import { buildRepoIndex } from './generate-repo-index.mjs';
import { ACTIVE_DOCS } from './doc-policy.mjs';
import {
  ALLOWED_ENV_FILES,
  BANNED_PREVIEW_PATTERNS,
  MOBILE_SCREEN_LIMITS,
  LOCAL_IMPORT_PATTERN,
} from './repo-policy-constants.mjs';
import {
  classifyRepoLayer,
  describeLayer,
  getAllowedLayerImports,
  resolveLocalImportTarget,
} from './repo-layers.mjs';

export function collectEnvViolations(files, scope) {
  const violations = [];

  for (const [filePath, content] of Object.entries(files)) {
    if (!/^(backend\/src|mobile\/src)\/.+\.(ts|tsx)$/.test(filePath)) {
      continue;
    }

    if (scope === 'backend' && !filePath.startsWith('backend/')) {
      continue;
    }

    if (scope === 'mobile' && !filePath.startsWith('mobile/')) {
      continue;
    }

    if (content.includes('process.env') && !ALLOWED_ENV_FILES.has(filePath)) {
      violations.push(`${filePath}: raw process.env access is only allowed in config layers`);
    }
  }

  return violations;
}

export function collectMobileViolations(files) {
  const violations = [];

  for (const [filePath, content] of Object.entries(files)) {
    if (filePath.startsWith('mobile/src/screens/') && filePath.endsWith('.tsx')) {
      if (content.includes('../api/client') || content.includes('../../api/client') || content.includes("from 'axios'") || content.includes('from "axios"')) {
        violations.push(`${filePath}: screen imports raw API client`);
      }

      const fileName = path.basename(filePath);
      const lineLimit = MOBILE_SCREEN_LIMITS.get(fileName);
      if (lineLimit) {
        if (content.includes('StyleSheet.create(')) {
          violations.push(`${filePath}: target screens should not define route-local StyleSheet.create`);
        }

        const lineCount = content.split('\n').length;
        if (lineCount > lineLimit) {
          violations.push(`${filePath}: target screen exceeds ${lineLimit} lines (${lineCount})`);
        }
      }
    }

    if (filePath.startsWith('mobile/src/features/') && /\.(ts|tsx)$/.test(filePath)) {
      if (
        content.includes('components/ui/AppButton') ||
        content.includes('components/ui/AppInput') ||
        content.includes('components/ui/AppCard') ||
        content.includes('components/ui/AppState')
      ) {
        violations.push(`${filePath}: imports legacy UI wrapper instead of a design primitive`);
      }
    }
  }

  return violations;
}

function resolveImportTarget(filePath, importPath, files, repoRootDir) {
  const baseTarget = resolveLocalImportTarget(filePath, importPath);
  if (!baseTarget) {
    return null;
  }

  const candidates = [
    baseTarget,
    `${baseTarget}.ts`,
    `${baseTarget}.tsx`,
    `${baseTarget}.js`,
    `${baseTarget}.mjs`,
    `${baseTarget}.json`,
    `${baseTarget}/index.ts`,
    `${baseTarget}/index.tsx`,
    `${baseTarget}/index.js`,
    `${baseTarget}/index.mjs`,
  ];

  const resolveRootDir = repoRootDir ?? process.cwd();
  return candidates.find((candidate) => files[candidate] !== undefined || fs.existsSync(path.join(resolveRootDir, candidate))) ?? null;
}

export function collectLayerViolations(files, scope, rootDir) {
  const violations = [];

  for (const [filePath, content] of Object.entries(files)) {
    if (!/^(backend\/src|mobile\/src)\/.+\.(ts|tsx)$/.test(filePath)) {
      continue;
    }

    const source = classifyRepoLayer(filePath);
    if (!source.area || !source.layer) {
      continue;
    }

    if (scope === 'backend' && source.area !== 'backend') {
      continue;
    }

    if (scope === 'mobile' && source.area !== 'mobile') {
      continue;
    }

    for (const match of content.matchAll(LOCAL_IMPORT_PATTERN)) {
      const importPath = match[1];
      const targetFilePath = resolveImportTarget(filePath, importPath, files, rootDir);
      if (!targetFilePath) {
        continue;
      }

      const target = classifyRepoLayer(targetFilePath);
      if (target.area !== source.area || !target.layer) {
        continue;
      }

      const allowedLayers = getAllowedLayerImports(source.area, source.layer);
      if (allowedLayers.includes(target.layer)) {
        continue;
      }

      const sourceLayer = describeLayer(source.area, source.layer);
      const targetLayer = describeLayer(target.area, target.layer);
      violations.push(
        `${filePath}: ${sourceLayer?.label ?? source.layer} layer cannot import ${targetLayer?.label ?? target.layer} layer via ${importPath}. Allowed layers: ${allowedLayers.join(', ')}`,
      );
    }
  }

  return violations;
}

export function collectRootViolations(files, rootPackage, repoRoot) {
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

  const referenceTokensForScript = (filePath) => [
    filePath,
    `./${filePath}`,
    `./${path.basename(filePath)}`,
  ];
  const textReferencesScript = (content, filePath) =>
    referenceTokensForScript(filePath).some((token) => content.includes(token));
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

  for (const filePath of ACTIVE_DOCS) {
    const content = files[filePath];
    if (!content) {
      continue;
    }

    for (const pattern of BANNED_PREVIEW_PATTERNS) {
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
    return [`${path.relative(rootDir, repoIndexPath)}: generated repo index is out of sync; run \"npm run repo:index\"`];
  }

  return [];
}
