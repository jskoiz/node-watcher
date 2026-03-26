import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptPath = fileURLToPath(import.meta.url);
const scriptDir = path.dirname(scriptPath);

export const repoRoot = path.resolve(scriptDir, '..');

export const DOCUMENTATION_DISCOVERY_ROOTS = Object.freeze(['docs', '.github']);

export const GOVERNED_DOC_GROUPS = Object.freeze({
  workflow: Object.freeze([
    'AGENTS.md',
    'backend/AGENTS.md',
    'mobile/AGENTS.md',
    'backend/README.md',
    'WORKFLOW.md',
  ]),
  activeGuides: Object.freeze([
    'docs/HARNESS.md',
    'docs/REPO_MAP.md',
    'docs/DEV_LOOP.md',
    'docs/ARCHITECTURE.md',
    'docs/STORYBOOK_WORKFLOW.md',
    'docs/FUNCTIONAL_MATRIX.md',
    'docs/APP_STORE_RELEASE.md',
    'docs/DEPLOY_LIGHTSAIL.md',
  ]),
});

export const GOVERNED_MARKDOWN_FILES = GOVERNED_DOC_GROUPS.workflow;

export const ACTIVE_DOCS = Object.freeze([
  ...GOVERNED_DOC_GROUPS.workflow,
  ...GOVERNED_DOC_GROUPS.activeGuides,
]);

const GOVERNED_MARKDOWN_FILE_SET = new Set(GOVERNED_MARKDOWN_FILES);
const ACTIVE_DOC_SET = new Set(ACTIVE_DOCS);

export const DOC_POLICY = Object.freeze({
  discoveryRoots: DOCUMENTATION_DISCOVERY_ROOTS,
  governedDocGroups: GOVERNED_DOC_GROUPS,
  governedMarkdownFiles: GOVERNED_MARKDOWN_FILES,
  activeDocs: ACTIVE_DOCS,
});

function walkMarkdownFiles(rootDir, relativeDir) {
  const absoluteDir = path.join(rootDir, relativeDir);
  if (!fs.existsSync(absoluteDir)) {
    return [];
  }

  const results = [];
  for (const entry of fs.readdirSync(absoluteDir, { withFileTypes: true })) {
    const absolutePath = path.join(absoluteDir, entry.name);
    const relativePath = path.relative(rootDir, absolutePath);

    if (entry.isDirectory()) {
      results.push(...walkMarkdownFiles(rootDir, relativePath));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith('.md')) {
      results.push(relativePath);
    }
  }

  return results;
}

export function isGovernedMarkdownFile(filePath) {
  return GOVERNED_MARKDOWN_FILE_SET.has(filePath);
}

export function isActiveDocFile(filePath) {
  return ACTIVE_DOC_SET.has(filePath);
}

export function listGovernedMarkdownFiles(rootDir = repoRoot) {
  return GOVERNED_MARKDOWN_FILES.filter((filePath) =>
    fs.existsSync(path.join(rootDir, filePath)),
  );
}

export function listMarkdownFiles(rootDir = repoRoot) {
  const discovered = DOCUMENTATION_DISCOVERY_ROOTS.flatMap((dir) => walkMarkdownFiles(rootDir, dir));
  const portable = [...discovered, ...listGovernedMarkdownFiles(rootDir)];
  return [...new Set(portable)].toSorted();
}

export function loadPackageScripts(rootDir = repoRoot) {
  const packageFiles = ['package.json', 'backend/package.json', 'mobile/package.json'];

  return packageFiles.reduce((accumulator, packageFile) => {
    const absolutePath = path.join(rootDir, packageFile);
    if (!fs.existsSync(absolutePath)) {
      return accumulator;
    }

    const manifest = JSON.parse(fs.readFileSync(absolutePath, 'utf8'));
    accumulator[packageFile] = new Set(Object.keys(manifest.scripts ?? {}));
    return accumulator;
  }, {});
}
