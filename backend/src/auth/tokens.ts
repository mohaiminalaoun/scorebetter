// Stateless signed tokens: no store, so each token carries its own claims plus
// an HMAC over them. The payload is readable by anyone — keep secrets out of it.

import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { env } from '../config/env';

// Both types share one secret, so without this a login link would also verify
// as a session cookie. Binding a token to its purpose prevents that swap.
export type TokenType = 'login' | 'session';

export interface TokenPayload {
  t: TokenType;
  e: string;
  // Unix seconds, sealed inside the signature so it cannot be edited.
  exp: number;
  // Nonce, so two tokens issued in the same second are still distinct.
  n: string;
}

export const LOGIN_TOKEN_TTL_SECONDS = 10 * 60;
export const SESSION_TOKEN_TTL_SECONDS = 24 * 60 * 60;

function signBody(body: string): string {
  return createHmac('sha256', env.AUTH_SECRET).update(body).digest('base64url');
}

function nowSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

export function signToken(
  type: TokenType,
  email: string,
  ttlSeconds: number,
): string {
  const payload: TokenPayload = {
    t: type,
    e: email,
    exp: nowSeconds() + ttlSeconds,
    n: randomBytes(16).toString('hex'),
  };
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${body}.${signBody(body)}`;
}

// Returns the payload when the token is authentic, of the expected type and
// unexpired. Every failure returns a bare null so callers learn nothing more.
export function verifyToken(
  token: string | undefined,
  expectedType: TokenType,
): TokenPayload | null {
  if (!token) return null;

  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [body, providedSignature] = parts;
  if (!body || !providedSignature) return null;

  const expected = Buffer.from(signBody(body));
  const provided = Buffer.from(providedSignature);
  // Length check first because timingSafeEqual throws on a mismatch. Using ===
  // would leak, through timing, how many leading bytes a guess got right.
  if (expected.length !== provided.length) return null;
  if (!timingSafeEqual(expected, provided)) return null;

  let payload: TokenPayload;
  try {
    payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
  } catch {
    return null;
  }

  if (payload === null || typeof payload !== 'object') return null;
  if (payload.t !== expectedType) return null;
  if (typeof payload.e !== 'string' || payload.e.length === 0) return null;
  if (typeof payload.exp !== 'number' || payload.exp < nowSeconds()) return null;

  return payload;
}
