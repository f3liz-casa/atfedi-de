// yum's own sukhi login — the same OAuth2 flow console uses, registered as its
// own app (see federation/auth.js's createSukhiAuth) so it doesn't share or
// collide with console's client_id/secret. "今のところ sukhi アカウントで"
// (nyanrus, 2026-08-07) — reuses console's publisher allowlist as-is.

import { createSukhiAuth } from '../federation/auth.js';

export const yumAuth = createSukhiAuth({
  appName: 'yum',
  clientName: 'atfedi.de yum editor',
  website: 'https://yum.atfedi.de',
  redirectUri: 'https://yum.atfedi.de/callback',
});
