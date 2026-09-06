// Per-instance and wiped by every cold start, so this is a courtesy brake, not
// a security control. The allowlist is the control: an address that is not on
// it never reaches this map at all.

const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_IN_WINDOW = 5;

const hitsByKey = new Map<string, number[]>();

export function withinRateLimit(key: string, now = Date.now()): boolean {
  // Prune on every call, or the map grows without bound.
  const recent = (hitsByKey.get(key) ?? []).filter((at) => now - at < WINDOW_MS);

  if (recent.length >= MAX_IN_WINDOW) {
    hitsByKey.set(key, recent);
    return false;
  }

  recent.push(now);
  hitsByKey.set(key, recent);
  return true;
}

export function resetRateLimits(): void {
  hitsByKey.clear();
}
