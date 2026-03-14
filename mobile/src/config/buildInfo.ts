import Constants from "expo-constants";

type BuildProvenance = {
  appEnv: string;
  apiBaseUrl: string | null;
  version: string;
  iosBuildNumber: string;
  androidVersionCode: string;
  gitBranch: string;
  gitSha: string;
  gitShortSha: string;
  buildDate: string;
  releaseMode: string;
  releaseProfile: string | null;
};

type ExpoExtra = {
  appEnv?: string;
  apiBaseUrl?: string | null;
  buildProvenance?: Partial<BuildProvenance>;
};

const extra = (Constants.expoConfig?.extra ?? {}) as ExpoExtra;
const provenance = extra.buildProvenance ?? {};

export const buildInfo: BuildProvenance = {
  appEnv: provenance.appEnv ?? extra.appEnv ?? "unknown",
  apiBaseUrl: provenance.apiBaseUrl ?? extra.apiBaseUrl ?? null,
  version:
    provenance.version ??
    Constants.expoConfig?.version ??
    "unknown",
  iosBuildNumber: provenance.iosBuildNumber ?? "unknown",
  androidVersionCode: provenance.androidVersionCode ?? "unknown",
  gitBranch: provenance.gitBranch ?? "unknown",
  gitSha: provenance.gitSha ?? "unknown",
  gitShortSha:
    provenance.gitShortSha ??
    (provenance.gitSha ? provenance.gitSha.slice(0, 7) : "unknown"),
  buildDate: provenance.buildDate ?? "unknown",
  releaseMode: provenance.releaseMode ?? "unknown",
  releaseProfile: provenance.releaseProfile ?? null,
};
