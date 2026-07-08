// Incoming activities. fedify verifies the HTTP signature before any of these
// run, so by the time we're here the sender is who they claim to be. The job
// left to us is policy and remembering (into D1, via store.js).

import { Follow, Accept, Undo, Create, Note } from '@fedify/fedify/vocab';

import {
  getActor,
  putFollower,
  deleteFollower,
  putComment,
  deleteComment,
  putRemoteActor,
  removeRemoteActor,
} from './store.js';

// Someone followed one of our writers: accept, and remember them.
export async function onFollow(ctx, follow) {
  if (follow.id == null || follow.actorId == null || follow.objectId == null) return;

  const target = ctx.parseUri(follow.objectId);
  if (target?.type !== 'actor') return;
  const identifier = target.identifier;
  if (!(await getActor(ctx.data.env.FEDI_DB, identifier))) return; // not ours

  const follower = await follow.getActor(ctx);
  if (follower?.id == null || follower.inboxId == null) return;

  await ctx.sendActivity(
    { identifier },
    follower,
    new Accept({
      id: new URL(`#accept/${encodeURIComponent(follow.id.href)}`, ctx.getActorUri(identifier)),
      actor: follow.objectId,
      object: follow,
    }),
  );

  await cacheActor(ctx.data.env.FEDI_DB, follower);
  await putFollower(ctx.data.env.FEDI_DB, {
    actor_handle: identifier,
    follower_uri: follower.id.href,
    inbox_url: follower.inboxId.href,
    shared_inbox: follower.endpoints?.sharedInbox?.href ?? null,
    created_at: new Date().toISOString(),
  });
}

// Undo(Follow): they unfollowed.
export async function onUndo(ctx, undo) {
  const object = await undo.getObject(ctx);
  if (!(object instanceof Follow) || undo.actorId == null || object.objectId == null) return;

  const target = ctx.parseUri(object.objectId);
  if (target?.type !== 'actor') return;
  await deleteFollower(ctx.data.env.FEDI_DB, target.identifier, undo.actorId.href);
}

// Create(Note): if it replies to one of our Articles, it's a comment.
export async function onCreate(ctx, create) {
  const note = await create.getObject(ctx);
  if (!(note instanceof Note) || note.id == null || note.replyTargetId == null) return;

  const article = note.replyTargetId.href;
  if (articleTargetHandle(article) == null) return; // not a reply to us

  const authorUri = note.attributionId?.href ?? create.actorId?.href;
  if (authorUri == null) return;

  const author = await note.getAttribution(ctx).catch(() => null);
  if (author) await cacheActor(ctx.data.env.FEDI_DB, author);

  await putComment(ctx.data.env.FEDI_DB, {
    id: note.id.href,
    article,
    author_uri: authorUri,
    // Stored as received; the reader sanitizes before rendering (step 4).
    content: typeof note.content === 'string' ? note.content : (note.content?.toString() ?? ''),
    published: note.published?.toString() ?? new Date().toISOString(),
    created_at: new Date().toISOString(),
  });
}

// Delete: a remote drops their comment, or tombstones their whole account.
export async function onDelete(ctx, del) {
  const objectId = del.objectId?.href;
  if (objectId == null) return;

  if (del.actorId != null && objectId === del.actorId.href) {
    await removeRemoteActor(ctx.data.env.FEDI_DB, objectId); // Delete(Actor)
  } else {
    await deleteComment(ctx.data.env.FEDI_DB, objectId); // Delete(Note)
  }
}

// The writer handle if a URI is one of our Article ids, else null.
export function articleTargetHandle(uri) {
  try {
    const u = new URL(uri);
    if (u.origin !== 'https://blog.atfedi.de') return null;
    const m = u.pathname.match(/^\/ap\/actors\/([^/]+)\/articles\/[^/]+$/);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

// Remember a remote actor just enough to render them later.
async function cacheActor(db, actor) {
  if (actor?.id == null) return;
  const username = actor.preferredUsername ? String(actor.preferredUsername) : null;
  let handle = null;
  if (username) {
    try {
      handle = `@${username}@${new URL(actor.id.href).host}`;
    } catch {}
  }
  await putRemoteActor(db, {
    uri: actor.id.href,
    handle,
    name: actor.name?.toString() ?? null,
    icon_url: null, // enriched by the reader step, kept simple here
    inbox_url: actor.inboxId?.href ?? null,
    fetched_at: new Date().toISOString(),
  });
}
