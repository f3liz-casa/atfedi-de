// The D1 side of federation. fedify remembers nothing; this is where we do.

/** One writer's actor row, or null if we don't host that handle. */
export async function getActor(db, handle) {
  return await db
    .prepare('SELECT * FROM actors WHERE handle = ?')
    .bind(handle)
    .first();
}

// --- followers -----------------------------------------------------------

/** Record (or refresh) a remote follower of one of our writers. */
export async function putFollower(db, f) {
  await db
    .prepare(
      `INSERT INTO followers (actor_handle, follower_uri, inbox_url, shared_inbox, created_at)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(actor_handle, follower_uri) DO UPDATE SET
         inbox_url = excluded.inbox_url, shared_inbox = excluded.shared_inbox`,
    )
    .bind(f.actor_handle, f.follower_uri, f.inbox_url, f.shared_inbox ?? null, f.created_at)
    .run();
}

export async function deleteFollower(db, actorHandle, followerUri) {
  await db
    .prepare('DELETE FROM followers WHERE actor_handle = ? AND follower_uri = ?')
    .bind(actorHandle, followerUri)
    .run();
}

/** Followers of one writer, as delivery recipients. */
export async function listFollowers(db, actorHandle) {
  const { results } = await db
    .prepare('SELECT follower_uri, inbox_url, shared_inbox FROM followers WHERE actor_handle = ?')
    .bind(actorHandle)
    .all();
  return results ?? [];
}

// --- comments (incoming replies to our Articles) -------------------------

export async function putComment(db, c) {
  await db
    .prepare(
      `INSERT INTO comments (id, article, author_uri, content, published, created_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET content = excluded.content, published = excluded.published`,
    )
    .bind(c.id, c.article, c.author_uri, c.content, c.published, c.created_at)
    .run();
}

export async function deleteComment(db, id) {
  await db.prepare('DELETE FROM comments WHERE id = ?').bind(id).run();
}

/** Comments on one Article, oldest first, with their author (if we cached one). */
export async function listComments(db, article) {
  const { results } = await db
    .prepare(
      `SELECT c.id, c.content, c.published, c.author_uri,
              r.handle AS author_handle, r.name AS author_name, r.icon_url AS author_icon
       FROM comments c
       LEFT JOIN remote_actors r ON r.uri = c.author_uri
       WHERE c.article = ?
       ORDER BY c.published ASC`,
    )
    .bind(article)
    .all();
  return results ?? [];
}

// --- remote actors (cached for rendering) --------------------------------

export async function putRemoteActor(db, a) {
  await db
    .prepare(
      `INSERT INTO remote_actors (uri, handle, name, icon_url, inbox_url, fetched_at)
       VALUES (?, ?, ?, ?, ?, ?)
       ON CONFLICT(uri) DO UPDATE SET
         handle = excluded.handle, name = excluded.name, icon_url = excluded.icon_url,
         inbox_url = excluded.inbox_url, fetched_at = excluded.fetched_at`,
    )
    .bind(a.uri, a.handle ?? null, a.name ?? null, a.icon_url ?? null, a.inbox_url ?? null, a.fetched_at)
    .run();
}

/**
 * A remote actor is gone (they sent Delete(Actor)). Forget them everywhere —
 * follows and comments. (Some servers keep tombstones as moderation evidence;
 * a blog would rather honour the erasure.)
 */
export async function removeRemoteActor(db, uri) {
  await db.batch([
    db.prepare('DELETE FROM followers WHERE follower_uri = ?').bind(uri),
    db.prepare('DELETE FROM comments WHERE author_uri = ?').bind(uri),
    db.prepare('DELETE FROM remote_actors WHERE uri = ?').bind(uri),
  ]);
}

// --- outbox (what we've published) ---------------------------------------

/** Record a published activity. Idempotent — a re-publish won't duplicate. */
export async function putOutbox(db, o) {
  await db
    .prepare(
      `INSERT INTO outbox (activity_id, actor_handle, object_id, type, published)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(activity_id) DO NOTHING`,
    )
    .bind(o.activity_id, o.actor_handle, o.object_id, o.type, o.published)
    .run();
}

/** One writer's published activities, newest first. */
export async function listOutbox(db, actorHandle) {
  const { results } = await db
    .prepare(
      'SELECT activity_id, object_id, type, published FROM outbox WHERE actor_handle = ? ORDER BY published DESC',
    )
    .bind(actorHandle)
    .all();
  return results ?? [];
}

// --- login (sukhi OAuth2 app + sessions) ---------------------------------

export async function getOAuthApp(db, base) {
  return await db
    .prepare('SELECT client_id, client_secret FROM oauth_app WHERE base = ?')
    .bind(base)
    .first();
}

export async function putOAuthApp(db, base, clientId, clientSecret) {
  await db
    .prepare(
      `INSERT INTO oauth_app (base, client_id, client_secret) VALUES (?, ?, ?)
       ON CONFLICT(base) DO UPDATE SET client_id = excluded.client_id, client_secret = excluded.client_secret`,
    )
    .bind(base, clientId, clientSecret)
    .run();
}

export async function putSession(db, s) {
  await db
    .prepare('INSERT INTO sessions (id, writer, token, expires) VALUES (?, ?, ?, ?)')
    .bind(s.id, s.writer, s.token, s.expires)
    .run();
}

export async function getSession(db, id) {
  return await db
    .prepare('SELECT id, writer, token, expires FROM sessions WHERE id = ?')
    .bind(id)
    .first();
}

export async function deleteSession(db, id) {
  await db.prepare('DELETE FROM sessions WHERE id = ?').bind(id).run();
}

/** Store a freshly provisioned actor (display name + both key pairs). */
export async function putActor(db, actor) {
  await db
    .prepare(
      `INSERT INTO actors
         (handle, name, summary, rsa_private, rsa_public, ed_private, ed_public, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      actor.handle,
      actor.name,
      actor.summary ?? null,
      actor.rsa_private,
      actor.rsa_public,
      actor.ed_private,
      actor.ed_public,
      actor.created_at,
    )
    .run();
}
