import type { BuildProvenance } from '../buildInfo';

jest.mock('expo-application', () => ({
  nativeApplicationVersion: null,
  nativeBuildVersion: null,
}));

const scriptedBuildInfo: BuildProvenance = {
  appEnv: 'production',
  apiBaseUrl: 'https://api.brdg.social',
  version: '1.0.0',
  iosBuildNumber: '22',
  androidVersionCode: '22',
  gitBranch: 'main',
  gitSha: '2717b9c4091602e154943741c8d7f9f477dd274a',
  gitShortSha: '2717b9c',
  buildDate: '2026-03-28T18:21:04.000Z',
  buildDateSource: 'scripted',
  releaseMode: 'xcode',
  releaseProfile: 'production',
  provenanceSource: 'scripted-release',
};

const runtimeBuildInfo: BuildProvenance = {
  appEnv: 'production',
  apiBaseUrl: 'https://api.brdg.social',
  version: '1.0.0',
  iosBuildNumber: '1',
  androidVersionCode: '1',
  gitBranch: 'main',
  gitSha: '5933bd51c76dde696784f8b267372b99eeb3112d',
  gitShortSha: '5933bd5',
  buildDate: '2026-03-28T18:20:46.847Z',
  buildDateSource: 'runtime-generated',
  releaseMode: 'runtime',
  releaseProfile: null,
  provenanceSource: 'runtime-derived',
};

function loadBuildDisplayInfoModule() {
  jest.resetModules();
  const asyncStorageModule = require('@react-native-async-storage/async-storage') as typeof import('@react-native-async-storage/async-storage');

  return {
    AsyncStorage: (asyncStorageModule.default ?? asyncStorageModule) as typeof import('@react-native-async-storage/async-storage').default,
    buildDisplayInfo: require('../buildDisplayInfo') as typeof import('../buildDisplayInfo'),
  };
}

describe('buildDisplayInfo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('treats scripted release metadata as trusted binary provenance', () => {
    const { buildDisplayInfo } = loadBuildDisplayInfoModule();

    const resolved = buildDisplayInfo.deriveResolvedBuildDisplayInfo({
      currentBuildInfo: scriptedBuildInfo,
      nativeVersion: '1.0.0',
      nativeBuildVersion: '22',
    });

    expect(resolved).toMatchObject({
      version: '1.0.0',
      iosBuildNumber: '22',
      binaryGitSha: scriptedBuildInfo.gitSha,
      binaryBuiltAt: scriptedBuildInfo.buildDate,
      binaryReleasePath: 'xcode',
      binaryProvenanceSource: 'current-manifest',
      bundleGitSha: scriptedBuildInfo.gitSha,
      bundleReleasePath: 'xcode',
    });
  });

  it('falls back to stored native provenance after an OTA runtime manifest overrides the bundle config', () => {
    const { buildDisplayInfo } = loadBuildDisplayInfoModule();

    const resolved = buildDisplayInfo.deriveResolvedBuildDisplayInfo({
      currentBuildInfo: runtimeBuildInfo,
      storedBinaryBuildInfo: scriptedBuildInfo,
      nativeVersion: '1.0.0',
      nativeBuildVersion: '22',
    });

    expect(resolved).toMatchObject({
      version: '1.0.0',
      iosBuildNumber: '22',
      binaryGitSha: scriptedBuildInfo.gitSha,
      binaryBuiltAt: scriptedBuildInfo.buildDate,
      binaryReleasePath: 'xcode',
      binaryProvenanceSource: 'stored-native',
      bundleGitSha: runtimeBuildInfo.gitSha,
      bundleBuiltAt: runtimeBuildInfo.buildDate,
      bundleReleasePath: 'runtime',
    });
  });

  it('keeps the native build number even when no stored binary snapshot exists yet', () => {
    const { buildDisplayInfo } = loadBuildDisplayInfoModule();

    const resolved = buildDisplayInfo.deriveResolvedBuildDisplayInfo({
      currentBuildInfo: runtimeBuildInfo,
      nativeVersion: '1.0.0',
      nativeBuildVersion: '22',
    });

    expect(resolved).toMatchObject({
      version: '1.0.0',
      iosBuildNumber: '22',
      binaryGitSha: 'unknown',
      binaryBuiltAt: 'unknown',
      binaryReleasePath: 'unknown',
      binaryProvenanceSource: 'native-version-only',
      bundleGitSha: runtimeBuildInfo.gitSha,
      bundleReleasePath: 'runtime',
    });
  });

  it('stores trusted binary provenance per native version/build pair', async () => {
    const { AsyncStorage, buildDisplayInfo } = loadBuildDisplayInfoModule();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

    const stored = await buildDisplayInfo.ensureStoredBuildProvenance({
      currentBuildInfo: scriptedBuildInfo,
      nativeVersion: '1.0.0',
      nativeBuildVersion: '22',
    });

    expect(stored).toEqual(scriptedBuildInfo);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'build_provenance_by_binary_v1',
      JSON.stringify({
        '1.0.0+22': scriptedBuildInfo,
      }),
    );
  });
});
