import { env } from '../config/env';

// Trim and lowercase before comparing: a phone keyboard capitalising the first
// letter, or a trailing space from a paste, must not silently fail the check.
export function normaliseEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export function isAllowed(email: string): boolean {
  return env.ALLOWED_EMAILS.includes(email);
}

// Cheap shape check at the boundary, before the allowlist or the rate limiter
// see the value. 254 is the maximum length of an email address.
export function isPlausibleEmail(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.length > 0 &&
    value.length <= 254 &&
    value.includes('@')
  );
}
