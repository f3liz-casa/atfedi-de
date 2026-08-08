-- One-shot, run once by hand against the remote D1:
--
--   npx wrangler d1 execute atfedi-fedi --remote --file worker/yum/migrations/2026-08-08-note-local.sql
--
-- Adds the localized-note column (see schema.sql's comment on
-- yum_pins.note_local) — the note's counterpart to name_local.
ALTER TABLE yum_pins ADD COLUMN note_local TEXT;
