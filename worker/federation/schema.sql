-- blog.atfedi.de federation store (D1).
--
-- fedify holds nothing of its own — it hands us vocabulary objects and expects
-- us to remember. So everything durable lives here. One actor per writer.

-- fedify's own scratch space (context cache, inbox idempotency). Not a second
-- store — just the KvStore interface fedify asks for, backed by this same D1.
CREATE TABLE IF NOT EXISTS kv (
  k       TEXT PRIMARY KEY,  -- JSON-encoded KvKey
  v       TEXT NOT NULL,     -- JSON-encoded value
  expires INTEGER            -- epoch ms, or NULL for no expiry
);

CREATE TABLE IF NOT EXISTS actors (
  handle       TEXT PRIMARY KEY,   -- local username: @{handle}@blog.atfedi.de
  name         TEXT NOT NULL,      -- display name
  summary      TEXT,               -- bio (HTML)
  rsa_private  TEXT NOT NULL,      -- JWK, RSASSA-PKCS1-v1_5 — for HTTP Signatures
  rsa_public   TEXT NOT NULL,
  ed_private   TEXT NOT NULL,      -- JWK, Ed25519 — for Object Integrity Proofs
  ed_public    TEXT NOT NULL,
  created_at   TEXT NOT NULL
);

-- Who follows each of our writers. Delivery reads this.
CREATE TABLE IF NOT EXISTS followers (
  actor_handle TEXT NOT NULL,      -- which writer is followed
  follower_uri TEXT NOT NULL,      -- the remote actor's id URI
  inbox_url    TEXT NOT NULL,      -- personal inbox
  shared_inbox TEXT,               -- shared inbox, if the server has one
  created_at   TEXT NOT NULL,
  PRIMARY KEY (actor_handle, follower_uri)
);

-- Remote actors we've met (comment authors, followers), kept for rendering.
CREATE TABLE IF NOT EXISTS remote_actors (
  uri        TEXT PRIMARY KEY,
  handle     TEXT,                 -- @name@host, best-effort
  name       TEXT,
  icon_url   TEXT,
  inbox_url  TEXT,
  fetched_at TEXT NOT NULL
);

-- Incoming replies to our Articles = comments.
CREATE TABLE IF NOT EXISTS comments (
  id          TEXT PRIMARY KEY,    -- the Note's id URI
  article     TEXT NOT NULL,       -- our Article id URI it replies to
  author_uri  TEXT NOT NULL,
  content     TEXT NOT NULL,       -- sanitized HTML
  published   TEXT NOT NULL,
  created_at  TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS comments_by_article ON comments (article, published);

-- What we've pushed out — so the outbox can list it and we never double-publish.
CREATE TABLE IF NOT EXISTS outbox (
  activity_id  TEXT PRIMARY KEY,   -- the Create/Update/Delete id URI
  actor_handle TEXT NOT NULL,
  object_id    TEXT NOT NULL,      -- the Article id URI
  type         TEXT NOT NULL,      -- Create | Update | Delete
  published    TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS outbox_by_actor ON outbox (actor_handle, published);

-- Publishing logs in through sukhi's OAuth2. The app registers itself with
-- sukhi once (no secret to set by hand); a login becomes a server-side session.
CREATE TABLE IF NOT EXISTS oauth_app (
  base          TEXT PRIMARY KEY, -- the sukhi base URL this app is registered with
  client_id     TEXT NOT NULL,
  client_secret TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  id      TEXT PRIMARY KEY, -- the cookie value: an unguessable random id
  writer  TEXT NOT NULL,    -- which writer this session may publish as
  token   TEXT NOT NULL,    -- the sukhi access token behind it
  expires TEXT NOT NULL     -- ISO timestamp
);
