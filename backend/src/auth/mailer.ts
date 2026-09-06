import { env } from '../config/env';

export async function sendMagicLink(to: string, link: string): Promise<void> {
  if (!env.RESEND_API_KEY) {
    // The whole local dev loop: no inbox round trip needed.
    console.log(`\n  MAGIC LINK for ${to}\n  ${link}\n`);
    return;
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: env.MAIL_FROM,
      to,
      subject: 'Your ScoreBetter sign-in link',
      // Some clients strip links, so the plain text carries a copyable URL.
      text: `Sign in to ScoreBetter:\n\n${link}\n\nThis link works for 10 minutes.`,
      html:
        `<p><a href="${link}">Sign in to ScoreBetter</a></p>` +
        `<p>This link works for 10 minutes. If you did not ask for it, ignore this email.</p>`,
    }),
  });

  if (!response.ok) {
    // Logged, never surfaced: the HTTP response to the browser must look the
    // same whether or not the send worked.
    console.error('Resend failed', response.status, await response.text());
  }
}
