const toNumber = (value: string | undefined, fallback: number): number => {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const requireEnv = (value: string | undefined, key: string): string => {
  if (!value) {
    throw new Error(`${key} is required`);
  }

  return value;
};

const apiPort = toNumber(process.env.PORT, 3000);
const localApiBaseUrl = `http://127.0.0.1:${apiPort}`;
const apiBaseUrl = process.env.API_BASE_URL || localApiBaseUrl;
const assetBaseUrl = process.env.BASE_URL || apiBaseUrl;

export const appConfig = {
  apiPort,
  jwt: {
    secret: requireEnv(process.env.JWT_SECRET, 'JWT_SECRET'),
    expiresIn: '60m' as const,
  },
  seed: {
    assetBaseUrl,
  },
  uploads: {
    profileDir: 'public/uploads/profile',
    profilePublicBaseUrl: `${assetBaseUrl}/uploads/profile`,
  },
  scripts: {
    apiBaseUrl,
  },
};
