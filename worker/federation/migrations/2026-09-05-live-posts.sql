-- One-shot, run once by hand against the remote D1:
--
--   npx wrangler d1 execute atfedi-fedi --remote --file worker/federation/migrations/2026-09-05-live-posts.sql
--
-- From here on, a post is on the site only if its slug is in live_posts —
-- the console decides, not the build. The posts that were already public
-- when this landed (everything committed on 2026-09-05) start out live, so
-- nothing a reader could open yesterday goes dark today.
CREATE TABLE IF NOT EXISTS live_posts (
  slug         TEXT PRIMARY KEY,
  published_at TEXT NOT NULL,
  publisher    TEXT NOT NULL
);
INSERT OR IGNORE INTO live_posts (slug, published_at, publisher) VALUES ('activityplug-walk-along', '2026-09-05T07:00:00Z', 'seed');
INSERT OR IGNORE INTO live_posts (slug, published_at, publisher) VALUES ('feder-walk-along', '2026-09-05T07:00:00Z', 'seed');
INSERT OR IGNORE INTO live_posts (slug, published_at, publisher) VALUES ('good-tools-4-msky', '2026-09-05T07:00:00Z', 'seed');
INSERT OR IGNORE INTO live_posts (slug, published_at, publisher) VALUES ('leaving-fedify', '2026-09-05T07:00:00Z', 'seed');
INSERT OR IGNORE INTO live_posts (slug, published_at, publisher) VALUES ('msky-vs-msky-server', '2026-09-05T07:00:00Z', 'seed');
INSERT OR IGNORE INTO live_posts (slug, published_at, publisher) VALUES ('new-stack', '2026-09-05T07:00:00Z', 'seed');
INSERT OR IGNORE INTO live_posts (slug, published_at, publisher) VALUES ('playing-with-vlt', '2026-09-05T07:00:00Z', 'seed');
INSERT OR IGNORE INTO live_posts (slug, published_at, publisher) VALUES ('server-rail-map', '2026-09-05T07:00:00Z', 'seed');
INSERT OR IGNORE INTO live_posts (slug, published_at, publisher) VALUES ('sukhi-fedi', '2026-09-05T07:00:00Z', 'seed');
INSERT OR IGNORE INTO live_posts (slug, published_at, publisher) VALUES ('sukhi-no-shinsetsu', '2026-09-05T07:00:00Z', 'seed');
INSERT OR IGNORE INTO live_posts (slug, published_at, publisher) VALUES ('two-directions', '2026-09-05T07:00:00Z', 'seed');
