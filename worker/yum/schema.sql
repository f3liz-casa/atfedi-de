-- yum.atfedi.de — the shared food map's store (in the same D1 as everything else).
--
-- A pin arrives as a gesture in two parts: someone posts publicly about a place,
-- then replies to their own post with a DM to @yum@atfedi.de carrying the place
-- link. The public half is what people read; the DM is only the machine channel.
--
-- Two different promises, which are easy to confuse:
--
--   * what arrives is KEPT (yum_inbox) — so nothing incoming is lost, and a
--     reading we got wrong can be done again later
--   * what is PUBLISHED is only the public post's words (yum_pins.note) — the
--     DM's own prose never reaches the map
--
-- Keeping is not publishing. The inbox is the record; the pins are the view.

-- @yum@atfedi.de — the map's actor. One row; the keys it signs with.
CREATE TABLE IF NOT EXISTS yum_actor (
  id          TEXT PRIMARY KEY,  -- always 'yum'
  rsa_private TEXT NOT NULL,     -- HTTP Signatures
  rsa_public  TEXT NOT NULL,
  ed_private  TEXT NOT NULL,     -- object integrity
  ed_public   TEXT NOT NULL,
  created_at  TEXT NOT NULL
);

-- What arrived. Every DM addressed to yum is written down before it is read,
-- so a crash mid-read, a place link yum couldn't resolve yet, or a colour it
-- guessed wrong all stay recoverable — the raw activity is still here, and the
-- pin can be derived again once the reading improves.
--
-- `outcome` says what happened to it ('placed', or why it was refused), which
-- is also the work-queue for a later retry.
--
-- If the sender deletes their DM, the fediverse's Delete means *forget this*:
-- `raw` is cleared and the outcome becomes 'deleted'. The fact that something
-- arrived and was withdrawn stays; its contents don't.
CREATE TABLE IF NOT EXISTS yum_inbox (
  dm_iri      TEXT PRIMARY KEY,  -- the DM's AP id
  actor_iri   TEXT,              -- who sent it
  by_handle   TEXT,              -- @user@host, for reading by eye
  post_iri    TEXT,              -- what it replied to, if anything
  raw         TEXT,              -- the activity as JSON-LD; NULL once withdrawn
  outcome     TEXT NOT NULL,     -- 'placed' | 'deleted' | a refusal reason
  received_at TEXT NOT NULL,     -- when it actually arrived; a replay never moves this
  settled_at  TEXT,              -- when the outcome was last decided
  tries       INTEGER NOT NULL DEFAULT 0  -- how many times it has been read (see backfill)
);
CREATE INDEX IF NOT EXISTS yum_inbox_by_outcome ON yum_inbox (outcome, received_at DESC);

-- A pin on the map.
--
-- Keyed by the *public post*, not by the DM: sending a second DM in reply to the
-- same post updates the pin rather than doubling it. That's also how a rating is
-- corrected — reply again with the right word.
--
-- `dm_iri` is kept so the gesture stays reversible: delete the DM on your own
-- server and the Delete reaches us, and the pin goes with it.
CREATE TABLE IF NOT EXISTS yum_pins (
  post_iri   TEXT PRIMARY KEY,   -- the public post's AP id (the pin's identity)
  post_url   TEXT,               -- its human-readable page (what `src` links to)
  dm_iri     TEXT NOT NULL,      -- the DM that placed it (deleting it removes the pin)
  by_handle  TEXT,               -- @user@host — who shared it
  lat        REAL NOT NULL,
  lng        REAL NOT NULL,
  name       TEXT,               -- the place's name, as the place link gave it
  name_local TEXT,               -- a reading for someone who doesn't read `name`'s
                                 -- script (e.g. a Japanese approximation of a Korean
                                 -- name) — shown alongside it, never replacing it.
                                 -- NULL is fine; the map just shows `name` alone.
  rating     TEXT NOT NULL,      -- 'suki' | 'futsuu' | 'imaichi'
  note       TEXT,               -- the PUBLIC post's words. Never the DM's.
                                 -- (the DM is kept in yum_inbox, just not shown)
  place_url  TEXT,               -- the link they sent, kept so a pin can be re-read
  created_at TEXT NOT NULL,
  updated_at TEXT
);
CREATE INDEX IF NOT EXISTS yum_pins_by_dm ON yum_pins (dm_iri);
CREATE INDEX IF NOT EXISTS yum_pins_by_created ON yum_pins (created_at DESC);
