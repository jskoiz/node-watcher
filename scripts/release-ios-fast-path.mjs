import { execFileSync } from 'node:child_process';

const FORCE_CLEAN_PATHS = [
  'mobile/app.config.ts',
  'mobile/eas.json',
  'mobile/package.json',
  'mobile/package-lock.json',
  'mobile/babel.config.js',
];

const FORCE_CLEAN_PREFIXES = [
  'mobile/ios/',
  'mobile/plugins/',
  'mobile/assets/icon',
  'mobile/assets/icons/',
  'mobile/assets/splash',
  'mobile/assets/splash/',
];

const SAFE_PREFIXES = [
  '.github/',
  'artifacts/',
  'backend/',
  'deploy/',
  'docs/',
  'shared/',
  'symphony/',
  'scripts/',
  'mobile/src/',
  'mobile/.storybook/',
  'mobile/stories/',
  'mobile/storybook/',
  'mobile/__tests__/',
];

const SAFE_SUFFIXES = [
  '.md',
  '.stories.tsx',
  '.stories.ts',
  '.stories.jsx',
  '.stories.js',
  '.test.ts',
  '.test.tsx',
  '.test.js',
  '.test.jsx',
  '.spec.ts',
  '.spec.tsx',
  '.spec.js',
  '.spec.jsx',
];

export function classifyChangedFiles(files) {
  if (!Array.isArray(files) || files.length === 0) {
    return {
      nativePrep: 'reuse-existing-ios',
      reason: 'No changes were detected since the release base ref.',
      changedFiles: [],
    };
  }

  for (const file of files) {
    if (FORCE_CLEAN_PATHS.includes(file) || FORCE_CLEAN_PREFIXES.some((prefix) => file.startsWith(prefix))) {
      return {
        nativePrep: 'clean-prebuild',
        reason: `Native-affecting change detected at ${file}.`,
        changedFiles: files,
      };
    }
  }

  const unknownFile = files.find((file) => {
    if (SAFE_PREFIXES.some((prefix) => file.startsWith(prefix))) {
      return false;
    }
    if (SAFE_SUFFIXES.some((suffix) => file.endsWith(suffix))) {
      return false;
    }
    if (file.startsWith('mobile/') && !file.startsWith('mobile/src/') && !file.startsWith('mobile/stories/') && !file.startsWith('mobile/__tests__/')) {
      return true;
    }
    return !file.startsWith('mobile/') && !file.startsWith('backend/') && !file.startsWith('shared/') && !file.startsWith('docs/') && !file.startsWith('.github/') && !file.startsWith('scripts/') && !file.startsWith('deploy/') && !file.startsWith('symphony/') && !file.startsWith('artifacts/');
  });

  if (unknownFile) {
    return {
      nativePrep: 'clean-prebuild',
      reason: `Unclassified change detected at ${unknownFile}; defaulting to a clean prebuild.`,
      changedFiles: files,
    };
  }

  return {
    nativePrep: 'reuse-existing-ios',
    reason: 'Changes are limited to non-native-affecting paths.',
    changedFiles: files,
  };
}

function execGit(args, cwd) {
  return execFileSync('git', args, {
    cwd,
    encoding: 'utf8',
  }).trim();
}

export function detectReleaseBaseRef(cwd) {
  const output = execGit(['tag', '--merged', 'HEAD', '--list', 'v*', '--sort=-creatordate'], cwd);
  return output.split('\n').find(Boolean) || '';
}

export function listChangedFiles({ cwd, baseRef, headRef = 'HEAD' }) {
  if (!baseRef) {
    return [];
  }

  const output = execGit(['diff', '--name-only', '--diff-filter=ACMRTUXB', `${baseRef}...${headRef}`], cwd);
  return output ? output.split('\n').filter(Boolean) : [];
}

function parseArgs(argv) {
  const values = {
    _: [],
    cwd: process.cwd(),
    headRef: 'HEAD',
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    switch (arg) {
      case '--cwd':
        values.cwd = argv[index + 1];
        index += 1;
        break;
      case '--base-ref':
        values.baseRef = argv[index + 1];
        index += 1;
        break;
      case '--head-ref':
        values.headRef = argv[index + 1];
        index += 1;
        break;
      case '-h':
      case '--help':
        values.help = true;
        break;
      default:
        values._.push(arg);
        break;
    }
  }

  return values;
}

function printUsage() {
  process.stdout.write([
    'Usage: node ./scripts/release-ios-fast-path.mjs classify [options]',
    '',
    'Options:',
    '  --cwd <path>         Repository root to inspect. Defaults to process.cwd().',
    '  --base-ref <ref>     Base ref to diff against. Defaults to the latest merged v* tag.',
    '  --head-ref <ref>     Head ref to diff against. Defaults to HEAD.',
    '',
  ].join('\n'));
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help || args._[0] !== 'classify') {
    printUsage();
    process.exit(args.help ? 0 : 1);
  }

  const baseRef = args.baseRef || detectReleaseBaseRef(args.cwd);
  if (!baseRef) {
    process.stdout.write(`${JSON.stringify({
      baseRef: null,
      headRef: args.headRef,
      nativePrep: 'clean-prebuild',
      reason: 'No previous release tag was found; defaulting to a clean prebuild.',
      changedFiles: [],
    }, null, 2)}\n`);
    return;
  }

  const changedFiles = listChangedFiles({
    cwd: args.cwd,
    baseRef,
    headRef: args.headRef,
  });
  const classification = classifyChangedFiles(changedFiles);

  process.stdout.write(`${JSON.stringify({
    baseRef,
    headRef: args.headRef,
    ...classification,
  }, null, 2)}\n`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    process.stderr.write(`release-ios-fast-path: ${error.message}\n`);
    process.exit(1);
  });
}
