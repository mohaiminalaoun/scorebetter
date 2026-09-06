// Single place where process.env is read. Values resolve lazily on access so
// unit tests can set their own env without satisfying the full production config.

function requireEnv(name: string, minLength = 1): string {
  const value = process.env[name];
  if (!value || value.length < minLength) {
    // Signing with `undefined` would make every token forgeable, so refuse to run.
    throw new Error(
      `Missing or too-short environment variable: ${name} (needs at least ${minLength} characters)`,
    );
  }
  return value;
}

export const env = {
  get AUTH_SECRET(): string {
    return requireEnv('AUTH_SECRET', 32);
  },

  get ALLOWED_EMAILS(): string[] {
    return (process.env.ALLOWED_EMAILS ?? '')
      .split(',')
      .map((entry) => entry.trim().toLowerCase())
      .filter((entry) => entry.length > 0);
  },

  get APP_URL(): string {
    return (process.env.APP_URL ?? 'http://localhost:5173').replace(/\/$/, '');
  },

  get RESEND_API_KEY(): string | undefined {
    return process.env.RESEND_API_KEY;
  },

  get MAIL_FROM(): string {
    return process.env.MAIL_FROM ?? 'ScoreBetter <onboarding@resend.dev>';
  },

  get isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  },
};

// Called at startup so a misconfigured deploy fails on boot with a clear
// message, rather than on the first sign-in attempt with a 500.
export function assertAuthConfig(): void {
  void env.AUTH_SECRET;
  if (env.ALLOWED_EMAILS.length === 0) {
    throw new Error('ALLOWED_EMAILS is empty — nobody would be able to sign in.');
  }
}
