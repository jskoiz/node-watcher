import fs from 'node:fs';
import path from 'node:path';

function walkFiles(rootDir, relativeDir) {
  const absoluteDir = path.join(rootDir, relativeDir);
  if (!fs.existsSync(absoluteDir)) {
    return [];
  }

  const results = [];
  for (const entry of fs.readdirSync(absoluteDir, { withFileTypes: true })) {
    const absolutePath = path.join(absoluteDir, entry.name);
    const relativePath = path.relative(rootDir, absolutePath).replace(/\\/g, '/');

    if (entry.isDirectory()) {
      results.push(...walkFiles(rootDir, relativePath));
      continue;
    }

    results.push(relativePath);
  }

  return results;
}

export function shouldInspectFile(filePath) {
  return (
    /\.(md|ts|tsx|js|mjs|json|ya?ml)$/.test(filePath) &&
    !filePath.includes('/node_modules/') &&
    !filePath.includes('/coverage/') &&
    !filePath.includes('/build/') &&
    !filePath.startsWith('artifacts/harness/')
  );
}

export function loadRepoPolicyContext(rootDir) {
  const fileList = [
    'package.json',
    ...walkFiles(rootDir, 'backend/src'),
    ...walkFiles(rootDir, 'mobile/src'),
    ...walkFiles(rootDir, 'docs'),
    ...walkFiles(rootDir, '.github'),
    ...walkFiles(rootDir, 'scripts'),
    'artifacts/repo-index.json',
    'AGENTS.md',
    'backend/AGENTS.md',
    'mobile/AGENTS.md',
    'backend/README.md',
  ].filter((filePath) => shouldInspectFile(filePath) && fs.existsSync(path.join(rootDir, filePath)));

  const files = {};
  for (const filePath of new Set(fileList)) {
    files[filePath] = fs.readFileSync(path.join(rootDir, filePath), 'utf8');
  }

  const rootPackage = JSON.parse(files['package.json'] ?? '{"scripts":{}}');
  return { files, rootPackage };
}
