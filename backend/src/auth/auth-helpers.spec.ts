import assert from 'node:assert/strict';
import test from 'node:test';
import { isAllowed, isPlausibleEmail, normaliseEmail } from './allowlist';
import {
  SESSION_COOKIE_NAME,
  buildClearedSessionCookie,
  buildSessionCookie,
  readCookie,
} from './cookies';
import { resetRateLimits, withinRateLimit } from './rate-limit';

process.env.AUTH_SECRET = 'a'.repeat(64);
process.env.ALLOWED_EMAILS = 'nurayshaahmed06@gmail.com, mohaimin@example.com';

test('normalises casing and surrounding whitespace', () => {
  assert.equal(
    normaliseEmail('  Nurayshaahmed06@Gmail.com '),
    'nurayshaahmed06@gmail.com',
  );
});

test('allows only listed addresses', () => {
  assert.equal(isAllowed('nurayshaahmed06@gmail.com'), true);
  assert.equal(isAllowed('mohaimin@example.com'), true);
  assert.equal(isAllowed('attacker@example.com'), false);
});

test('a normalised listed address passes, an unnormalised one would not', () => {
  assert.equal(isAllowed('NURAYSHAAHMED06@GMAIL.COM'), false);
  assert.equal(isAllowed(normaliseEmail('NURAYSHAAHMED06@GMAIL.COM')), true);
});

test('rejects implausible email input', () => {
  assert.equal(isPlausibleEmail('a@b.com'), true);
  assert.equal(isPlausibleEmail(''), false);
  assert.equal(isPlausibleEmail('no-at-sign'), false);
  assert.equal(isPlausibleEmail(undefined), false);
  assert.equal(isPlausibleEmail(12345), false);
  assert.equal(isPlausibleEmail({ email: 'a@b.com' }), false);
  assert.equal(isPlausibleEmail(`${'x'.repeat(250)}@b.com`), false);
});

test('allows five requests in the window and blocks the sixth', () => {
  resetRateLimits();
  for (let i = 0; i < 5; i += 1) {
    assert.equal(withinRateLimit('someone@example.com'), true, `request ${i + 1}`);
  }
  assert.equal(withinRateLimit('someone@example.com'), false);
});

test('rate limits each key independently', () => {
  resetRateLimits();
  for (let i = 0; i < 5; i += 1) withinRateLimit('a@example.com');

  assert.equal(withinRateLimit('a@example.com'), false);
  assert.equal(withinRateLimit('b@example.com'), true);
});

test('forgets hits once they fall outside the window', () => {
  resetRateLimits();
  const start = Date.now();
  for (let i = 0; i < 5; i += 1) withinRateLimit('c@example.com', start);

  assert.equal(withinRateLimit('c@example.com', start), false);
  assert.equal(withinRateLimit('c@example.com', start + 61 * 60 * 1000), true);
});

test('reads a named cookie out of the header', () => {
  const header = `theme=dark; ${SESSION_COOKIE_NAME}=abc.def; other=1`;

  assert.equal(readCookie(header, SESSION_COOKIE_NAME), 'abc.def');
  assert.equal(readCookie(header, 'theme'), 'dark');
  assert.equal(readCookie(header, 'missing'), undefined);
  assert.equal(readCookie(undefined, SESSION_COOKIE_NAME), undefined);
});

test('decodes percent-encoded cookie values', () => {
  assert.equal(readCookie(`${SESSION_COOKIE_NAME}=a%2Bb`, SESSION_COOKIE_NAME), 'a+b');
});

test('does not match a cookie whose name merely ends with the target', () => {
  assert.equal(readCookie(`not_sb_session=nope`, SESSION_COOKIE_NAME), undefined);
});

test('builds a session cookie with the protective flags', () => {
  const cookie = buildSessionCookie('tok');

  assert.match(cookie, /^sb_session=tok;/);
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /SameSite=Lax/);
  assert.match(cookie, /Path=\//);
  assert.match(cookie, /Max-Age=86400/);
});

test('omits Secure outside production so localhost keeps the cookie', () => {
  assert.equal(/Secure/.test(buildSessionCookie('tok')), false);

  process.env.NODE_ENV = 'production';
  assert.match(buildSessionCookie('tok'), /Secure/);
  delete process.env.NODE_ENV;
});

// A cleared cookie must match the original's flags or the real session survives.
test('clears with matching attributes and a zero lifetime', () => {
  const cleared = buildClearedSessionCookie();

  assert.match(cleared, /^sb_session=;/);
  assert.match(cleared, /Max-Age=0/);
  assert.match(cleared, /Path=\//);
  assert.match(cleared, /HttpOnly/);
});
