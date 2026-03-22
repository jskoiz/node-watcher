export function parseTake(raw?: string, defaultValue = 20): number {
  const parsed = raw ? Number.parseInt(raw, 10) : NaN;
  return Number.isNaN(parsed) ? defaultValue : Math.min(Math.max(parsed, 1), 100);
}

export function parseSkip(raw?: string): number {
  const parsed = raw ? Number.parseInt(raw, 10) : NaN;
  return Number.isNaN(parsed) ? 0 : Math.max(parsed, 0);
}
