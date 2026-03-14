jest.mock("expo-constants", () => ({
  expoConfig: {
    version: "1.0.0",
    extra: {
      appEnv: "production",
      apiBaseUrl: "https://api.brdg.social",
      buildProvenance: {
        appEnv: "production",
        apiBaseUrl: "https://api.brdg.social",
        version: "1.0.0",
        iosBuildNumber: "5",
        androidVersionCode: "5",
        gitBranch: "main",
        gitSha: "abcdef1234567890",
        gitShortSha: "abcdef1",
        buildDate: "2026-03-13T20:00:00.000Z",
        releaseMode: "eas",
        releaseProfile: "production",
      },
    },
  },
}));

import { buildInfo } from "../buildInfo";

describe("buildInfo", () => {
  it("reads build provenance from Expo config extra", () => {
    expect(buildInfo).toMatchObject({
      appEnv: "production",
      apiBaseUrl: "https://api.brdg.social",
      version: "1.0.0",
      iosBuildNumber: "5",
      gitBranch: "main",
      gitSha: "abcdef1234567890",
      gitShortSha: "abcdef1",
      buildDate: "2026-03-13T20:00:00.000Z",
      releaseMode: "eas",
      releaseProfile: "production",
    });
  });
});
