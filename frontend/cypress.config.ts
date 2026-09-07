import { defineConfig } from 'cypress';
import {
  SESSION_TOKEN_TTL_SECONDS,
  signToken,
} from '../backend/src/auth/tokens';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    supportFile: false,
    fixturesFolder: false,
    video: false,
    setupNodeEvents(on) {
      // Mints a real session token with the running server's secret, so the
      // suite exercises the same guard production does.
      on('task', {
        mintSession(email: string) {
          return signToken('session', email, SESSION_TOKEN_TTL_SECONDS);
        },
      });
    },
  },
});
