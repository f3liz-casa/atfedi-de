-- One-shot, run once by hand against the remote D1:
--
--   npx wrangler d1 execute atfedi-fedi --remote --file worker/yum/migrations/2026-08-08-name-local.sql
--
-- Adds the localized-reading column (see schema.sql's comment on
-- yum_pins.name_local). A plain ADD COLUMN, not the create/copy/drop/
-- rename dance the oauth_app migration needed — SQLite/D1 supports this
-- directly for a nullable column with no default to backfill.
ALTER TABLE yum_pins ADD COLUMN name_local TEXT;
