import { env } from '../config/env';
import { SESSION_TOKEN_TTL_SECONDS } from './tokens';

export const SESSION_COOKIE_NAME = 'sb_session';

export function readCookie(
  header: string | undefined,
  name: string,
): string | undefined {
  if (!header) return undefined;

  for (const part of header.split(';')) {
    const separator = part.indexOf('=');
    if (separator === -1) continue;
    if (part.slice(0, separator).trim() !== name) continue;
    return decodeURIComponent(part.slice(separator + 1).trim());
  }
  return undefined;
}

// Secure is conditional because localhost is plain HTTP and the browser would
// drop the cookie in dev. SameSite=Lax still rides a click from the email.
function attributes(maxAgeSeconds: number): string {
  return [
    'HttpOnly',
    ...(env.isProduction ? ['Secure'] : []),
    'SameSite=Lax',
    'Path=/',
    `Max-Age=${maxAgeSeconds}`,
  ].join('; ');
}

export function buildSessionCookie(token: string): string {
  return `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}; ${attributes(
    SESSION_TOKEN_TTL_SECONDS,
  )}`;
}

// Clearing only works when name, Path and flags match the original exactly,
// otherwise this sets a second empty cookie and the real session survives.
export function buildClearedSessionCookie(): string {
  return `${SESSION_COOKIE_NAME}=; ${attributes(0)}`;
}
