-- One-shot, run once by hand against the remote D1:
--
--   npx wrangler d1 execute atfedi-fedi --remote --file worker/yum/migrations/2026-08-08-path.sql
--
-- Adds the line-geometry column (see schema.sql's comment on yum_pins.path) —
-- for a place felt as a stretch of coast or a walk rather than a single spot.
ALTER TABLE yum_pins ADD COLUMN path TEXT;
