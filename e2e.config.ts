import type { E2EConfig } from 'e2e';
import { web } from '@e2e-dev/web';

// Deterministic browser tests against the built site (`npm run build` first). No model is
// configured, so there are no agent steps and nothing needs a key. Telemetry: the npm script
// and CI set E2E_TELEMETRY_DISABLED=1.
export default {
  targets: [
    {
      engine: web(),
      app: {
        url: process.env.APP_URL ?? 'http://127.0.0.1:0',
        command: {
          executable: 'npx',
          args: ['astro', 'preview', '--host', '127.0.0.1', '--port', '{port}'],
          log: '.e2e/logs/preview.log',
          // Locally, reuse an `astro preview` that already serves dist/ (APP_URL=http://127.0.0.1:4399);
          // CI ignores this and starts its own.
          reuseExisting: true,
        },
      },
    },
  ],
} satisfies E2EConfig;
