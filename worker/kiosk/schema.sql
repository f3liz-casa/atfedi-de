-- kiosk.atfedi.de — the newsstand's own store (in the same D1 as federation).
--
-- kiosk gathers Articles from hackers.pub and lays them out on a rack. It only
-- reads the fediverse; nothing here is anyone's identity or inbox. Two tables:
-- the papers on the rack, and the sweep work-queue that fills them gently over
-- many cron ticks (one small batch at a time — the source is a friend's small
-- instance, so we sweep kindly).

-- A gathered Article. Metadata only — the full body (with its contentMap) is
-- fetched on demand when someone opens it, so the rack stays small.
CREATE TABLE IF NOT EXISTS kiosk_papers (
  iri         TEXT PRIMARY KEY,  -- the Article's ActivityPub id
  url         TEXT NOT NULL,     -- the human-readable page
  title       TEXT,              -- default-language title
  summary     TEXT,
  author      TEXT,              -- @username@host
  author_name TEXT,
  published   TEXT,              -- ISO 8601
  updated     TEXT,              -- ISO 8601
  langs       TEXT,              -- JSON array of language subtags seen in nameMap
  title_map   TEXT,              -- JSON { "en": …, "ja": … } — the title per language
  fetched_at  TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS kiosk_papers_by_published ON kiosk_papers (published DESC);

-- The sweep queue: one row per account. The backfill moves by a shared date
-- frontier (kiosk_state 'horizon'): each account is walked back only as far as
-- the horizon, then waits ('reached') while the others catch up; when all have
-- reached it, the horizon steps further back and everyone resumes from `cursor`.
-- So the rack fills newest-first across everyone, then deepens by date.
CREATE TABLE IF NOT EXISTS kiosk_sweep (
  handle     TEXT PRIMARY KEY,   -- @username@host on the source instance
  outbox_url TEXT,               -- resolved once from the actor document
  cursor     TEXT,               -- next outbox page URL; NULL once at the start or exhausted
  state      TEXT NOT NULL,      -- 'pending' (below horizon) | 'reached' | 'done' (outbox exhausted)
  lastmod    TEXT,               -- sitemap's latest-post date; a window skips accounts older than it
  swept_at   TEXT,               -- last time the backfill touched this account (any page)
  recent_at  TEXT                -- last time we checked the newest end for new articles. Followed
                                 -- accounts push their new articles, so only the not-followed need
                                 -- this re-checked; recent_at tells us how stale each one is.
);
CREATE INDEX IF NOT EXISTS kiosk_sweep_by_state ON kiosk_sweep (state);

-- Small key/value for the sweep's own state — 'horizon' (the date the backfill
-- has reached back to) and 'seeded_at' (when the sitemap was last re-read, so
-- writers who joined since are picked up without polling the source hard).
CREATE TABLE IF NOT EXISTS kiosk_state (
  k TEXT PRIMARY KEY,
  v TEXT
);

-- @kiosk@atfedi.de — the newsstand's own actor. It follows writers so their new
-- Articles arrive in its inbox (push), instead of polling forever. One row: the
-- actor's keys (RSA for HTTP Signatures, Ed25519 for object integrity).
CREATE TABLE IF NOT EXISTS kiosk_actor (
  id          TEXT PRIMARY KEY,  -- always 'kiosk'
  rsa_private TEXT NOT NULL,
  rsa_public  TEXT NOT NULL,
  ed_private  TEXT NOT NULL,
  ed_public   TEXT NOT NULL,
  created_at  TEXT NOT NULL
);

-- Who @kiosk follows (writers with at least one Article). Delivery of new
-- Articles rides on these; a Follow starts 'pending' and turns 'accepted' when
-- the remote sends back Accept.
CREATE TABLE IF NOT EXISTS kiosk_following (
  target_iri TEXT PRIMARY KEY,   -- the followed actor's id
  handle     TEXT,               -- @user@host, for readability
  state      TEXT NOT NULL,      -- 'pending' | 'accepted' | 'rejected'
  follow_id  TEXT,               -- the Follow activity id (to match the Accept)
  created_at TEXT NOT NULL
);
