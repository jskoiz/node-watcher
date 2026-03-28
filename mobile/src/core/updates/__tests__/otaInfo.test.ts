import type { CurrentOtaInfo } from '../otaInfo';

const mockUpdates = {
  isEnabled: true,
  updateId: 'e676f473-ee24-44bd-bdff-dc64fea68987',
  channel: 'production',
  createdAt: new Date('2026-03-28T17:00:07.000Z'),
  isEmbeddedLaunch: false,
  runtimeVersion: '1.0.0',
};

jest.mock('expo-updates', () => mockUpdates);

function loadOtaInfoModule() {
  jest.resetModules();
  const asyncStorageModule = require('@react-native-async-storage/async-storage') as typeof import('@react-native-async-storage/async-storage');

  return {
    AsyncStorage: (asyncStorageModule.default ?? asyncStorageModule) as typeof import('@react-native-async-storage/async-storage').default,
    otaInfo: require('../otaInfo') as typeof import('../otaInfo'),
  };
}

describe('otaInfo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUpdates.isEnabled = true;
    mockUpdates.updateId = 'e676f473-ee24-44bd-bdff-dc64fea68987';
    mockUpdates.channel = 'production';
    mockUpdates.createdAt = new Date('2026-03-28T17:00:07.000Z');
    mockUpdates.isEmbeddedLaunch = false;
    mockUpdates.runtimeVersion = '1.0.0';
  });

  it('formats relative ages for recent and older updates', () => {
    const { otaInfo } = loadOtaInfoModule();
    const now = new Date('2026-03-28T18:30:00.000Z');

    expect(otaInfo.formatRelativeAge('2026-03-28T18:29:40.000Z', now)).toBe('just now');
    expect(otaInfo.formatRelativeAge('2026-03-28T18:20:00.000Z', now)).toBe('10m ago');
    expect(otaInfo.formatRelativeAge('2026-03-28T16:30:00.000Z', now)).toBe('2h ago');
    expect(otaInfo.formatRelativeAge('2026-03-25T18:30:00.000Z', now)).toBe('3d ago');
  });

  it('summarizes the current downloaded OTA with publish and receipt timestamps', () => {
    const { otaInfo } = loadOtaInfoModule();
    const info = otaInfo.getCurrentOtaInfo({
      now: new Date('2026-03-28T18:30:00.000Z'),
      firstSeenAt: '2026-03-28T18:25:00.000Z',
    }) as CurrentOtaInfo;

    expect(info).toMatchObject({
      updateId: 'e676f473-ee24-44bd-bdff-dc64fea68987',
      shortUpdateId: 'e676f473',
      channel: 'production',
      runtimeVersion: '1.0.0',
      launchSource: 'downloaded',
      launchSourceLabel: 'downloaded OTA',
      publishedSummary: '2026-03-28T17:00:07.000Z (1h ago)',
      firstSeenSummary: '2026-03-28T18:25:00.000Z (5m ago)',
      headerLabel: 'Build Info - OTA e676f473',
    });
  });

  it('falls back to embedded metadata when no OTA was downloaded', () => {
    mockUpdates.isEmbeddedLaunch = true;

    const { otaInfo } = loadOtaInfoModule();
    const info = otaInfo.getCurrentOtaInfo({
      now: new Date('2026-03-28T18:30:00.000Z'),
    }) as CurrentOtaInfo;

    expect(info.launchSource).toBe('embedded');
    expect(info.launchSourceLabel).toBe('embedded bundle');
    expect(info.firstSeenSummary).toBe('not recorded yet');
    expect(info.headerLabel).toBe('Build Info - Embedded e676f473');
  });

  it('stores first-seen timestamps once per update id', async () => {
    const { AsyncStorage, otaInfo } = loadOtaInfoModule();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

    const firstSeenAt = await otaInfo.ensureCurrentOtaFirstSeenAt(
      new Date('2026-03-28T18:31:00.000Z'),
    );

    expect(firstSeenAt).toBe('2026-03-28T18:31:00.000Z');
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      'ota_update_first_seen_by_id_v1',
      JSON.stringify({
        'e676f473-ee24-44bd-bdff-dc64fea68987': '2026-03-28T18:31:00.000Z',
      }),
    );

    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(
      JSON.stringify({
        'e676f473-ee24-44bd-bdff-dc64fea68987': '2026-03-28T18:31:00.000Z',
      }),
    );

    const secondSeenAt = await otaInfo.ensureCurrentOtaFirstSeenAt(
      new Date('2026-03-28T18:40:00.000Z'),
    );

    expect(secondSeenAt).toBe('2026-03-28T18:31:00.000Z');
    expect(AsyncStorage.setItem).toHaveBeenCalledTimes(1);
  });
});
