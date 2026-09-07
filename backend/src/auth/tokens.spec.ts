import assert from 'node:assert/strict';
import test from 'node:test';

import {
  signToken,
  verifyToken,
  LOGIN_TOKEN_TTL_SECONDS,
  SESSION_TOKEN_TTL_SECONDS,
} from './tokens';

// env reads the secret lazily on each call, so setting it here is enough.
process.env.AUTH_SECRET = 'a'.repeat(64);

const EMAIL = 'nurayshaahmed06@gmail.com';

test('round-trips a signed token', () => {
  const token = signToken('session', EMAIL, SESSION_TOKEN_TTL_SECONDS);
  const payload = verifyToken(token, 'session');

  assert.ok(payload);
  assert.equal(payload.e, EMAIL);
  assert.equal(payload.t, 'session');
  assert.ok(payload.exp > Math.floor(Date.now() / 1000));
});

test('issues a distinct token every time', () => {
  const a = signToken('login', EMAIL, LOGIN_TOKEN_TTL_SECONDS);
  const b = signToken('login', EMAIL, LOGIN_TOKEN_TTL_SECONDS);
  assert.notEqual(a, b);
});

test('rejects a tampered payload', () => {
  const token = signToken('login', EMAIL, LOGIN_TOKEN_TTL_SECONDS);
  const [body, signature] = token.split('.');

  const forged = Buffer.from(
    JSON.stringify({
      ...JSON.parse(Buffer.from(body, 'base64url').toString()),
      e: 'attacker@example.com',
    }),
  ).toString('base64url');

  assert.equal(verifyToken(`${forged}.${signature}`, 'login'), null);
});

test('rejects a tampered expiry', () => {
  const token = signToken('login', EMAIL, LOGIN_TOKEN_TTL_SECONDS);
  const [body, signature] = token.split('.');

  const extended = Buffer.from(
    JSON.stringify({
      ...JSON.parse(Buffer.from(body, 'base64url').toString()),
      exp: Math.floor(Date.now() / 1000) + 10 * 365 * 24 * 60 * 60, // 10 years
    }),
  ).toString('base64url');

  assert.equal(verifyToken(`${extended}.${signature}`, 'login'), null);
});

test('rejects a token signed with a different secret', async () => {
  const token = signToken('session', EMAIL, SESSION_TOKEN_TTL_SECONDS);

  process.env.AUTH_SECRET = 'b'.repeat(64);
  const rejected = verifyToken(token, 'session');
  process.env.AUTH_SECRET = 'a'.repeat(64);

  assert.equal(rejected, null);
});

test('rejects an expired token', () => {
  const token = signToken('login', EMAIL, -1);
  assert.equal(verifyToken(token, 'login'), null);
});

// The token-confusion guard: a valid login link must not pass as a session.
test('rejects a login token where a session token is expected', () => {
  const token = signToken('login', EMAIL, LOGIN_TOKEN_TTL_SECONDS);

  assert.equal(verifyToken(token, 'session'), null);
  assert.ok(verifyToken(token, 'login'));
});

test('rejects malformed input', () => {
  assert.equal(verifyToken(undefined, 'session'), null);
  assert.equal(verifyToken('', 'session'), null);
  assert.equal(verifyToken('no-dot-here', 'session'), null);
  assert.equal(verifyToken('too.many.parts', 'session'), null);
  assert.equal(verifyToken('.', 'session'), null);
  assert.equal(verifyToken('notbase64.notasignature', 'session'), null);
});
