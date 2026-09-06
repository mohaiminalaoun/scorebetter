import { Injectable } from '@nestjs/common';
import { env } from '../config/env';
import { isAllowed, isPlausibleEmail, normaliseEmail } from './allowlist';
import { sendMagicLink } from './mailer';
import { withinRateLimit } from './rate-limit';
import { LOGIN_TOKEN_TTL_SECONDS, signToken, verifyToken } from './tokens';

@Injectable()
export class AuthService {
  // Never throws and never reports an outcome. The caller returns the same
  // response either way, so a stranger cannot probe who has an account.
  async maybeSendLink(rawEmail: unknown): Promise<void> {
    try {
      if (!isPlausibleEmail(rawEmail)) return;

      const email = normaliseEmail(rawEmail);
      // Allowlist before rate limit, so junk addresses never enter the map.
      if (!isAllowed(email)) return;
      if (!withinRateLimit(email)) return;

      const token = signToken('login', email, LOGIN_TOKEN_TTL_SECONDS);
      const link = `${env.APP_URL}/api/auth/callback?token=${encodeURIComponent(token)}`;
      await sendMagicLink(email, link);
    } catch (error) {
      console.error('Failed to issue magic link', error);
    }
  }

  // Re-checks the allowlist so removing an address kills outstanding links.
  emailFromLoginToken(token: string | undefined): string | null {
    const payload = verifyToken(token, 'login');
    if (!payload || !isAllowed(payload.e)) return null;
    return payload.e;
  }
}
