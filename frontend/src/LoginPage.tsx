import { useState } from 'react';
import { requestMagicLink } from './api';

export default function LoginPage({ linkWasInvalid }: { linkWasInvalid: boolean }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!email.trim() || status === 'sending') return;

    setStatus('sending');
    try {
      await requestMagicLink(email);
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  }

  return (
    <main className="page login">
      <p className="eyebrow">ScoreBetter</p>

      {linkWasInvalid && status !== 'sent' && (
        <p className="login-notice" data-testid="login-invalid">
          That sign-in link has expired or already been used. Request a new one below.
        </p>
      )}

      {status === 'sent' ? (
        // Deliberately the same message whatever the address, so the form
        // cannot be used to discover which accounts exist.
        <div className="login-card" data-testid="login-sent">
          <h2>Check your inbox</h2>
          <p>
            If <strong>{email.trim()}</strong> is on the list, a sign-in link is on its way.
            It works for 10 minutes.
          </p>
          <button type="button" className="link-button" onClick={() => setStatus('idle')}>
            Use a different address
          </button>
        </div>
      ) : (
        <form className="login-card" onSubmit={handleSubmit}>
          <h2>Sign in</h2>
          <p>Enter your email and we'll send you a link that signs you straight in.</p>

          <label className="login-label" htmlFor="login-email">
            Email address
          </label>
          <input
            id="login-email"
            data-testid="login-email"
            type="email"
            required
            autoComplete="email"
            autoFocus
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button type="submit" data-testid="login-submit" disabled={status === 'sending'}>
            {status === 'sending' ? 'Sending…' : 'Send me a link'}
          </button>

          {status === 'error' && (
            <p className="login-error">Something went wrong. Please try again.</p>
          )}
        </form>
      )}
    </main>
  );
}
