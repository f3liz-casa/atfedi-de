// dash's own sukhi login — same pattern as yum's (see federation/auth.js's
// createSukhiAuth), registered as its own app so it doesn't collide with
// console's or yum's client_id/secret. Reuses console's publisher allowlist.

import { createSukhiAuth } from '../federation/auth.js';

export const dashAuth = createSukhiAuth({
  appName: 'dash',
  clientName: 'atfedi.de dash',
  website: 'https://dash.atfedi.de',
  redirectUri: 'https://dash.atfedi.de/callback',
});
