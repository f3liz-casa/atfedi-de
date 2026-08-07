-- One-shot, run once by hand against the remote D1 (see yum/README.md's
-- "建てるのに要るもの" for the same convention):
--
--   npx wrangler d1 execute atfedi-fedi --remote --file worker/federation/migrations/2026-08-07-oauth-app-multi.sql
--
-- oauth_app used to be keyed by `base` alone (one app per sukhi instance).
-- yum's editor now registers its own app against the same instance, so the
-- key grows an app_name column. The existing row (console's) becomes
-- app_name = 'console'; nothing else changes, and console's session/login
-- keeps working through this exactly as it did before.
CREATE TABLE oauth_app_new (
  base          TEXT NOT NULL,
  app_name      TEXT NOT NULL,
  client_id     TEXT NOT NULL,
  client_secret TEXT NOT NULL,
  PRIMARY KEY (base, app_name)
);
INSERT INTO oauth_app_new (base, app_name, client_id, client_secret)
  SELECT base, 'console', client_id, client_secret FROM oauth_app;
DROP TABLE oauth_app;
ALTER TABLE oauth_app_new RENAME TO oauth_app;
