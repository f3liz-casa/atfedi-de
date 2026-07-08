// Publishing an Article to the fediverse — the one authorized action.
//
// "Authorized" means sukhi OAuth2, the same Mastodon-compatible flow the CMS
// uses: the writer carries a sukhi access token, we ask sukhi who they are, and
// match that against a writer's fedi handle. Reading is public; only the push
// to followers is gated.

import { SendActivityError } from '@fedify/fedify';
import { Endpoints } from '@fedify/fedify/vocab';

import { getFederation } from './index.js';
import { getPostAny, getTranslations } from './content.js';
import { handleForToken, isPublisher, sessionPublisher } from './auth.js';
import { buildCreate, buildUpdate, articleUri } from './article.js';
import { putOutbox, listFollowers, deleteFollower } from './store.js';

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });

// Who may publish: an authorized sukhi identity (the PUBLISHERS allow-list),
// via a bearer token (API use) or a studio session cookie. Returns the publisher
// handle, or null. This is separate from *which author* a post belongs to.
export async function authorizePublisher(request, env) {
  const auth = request.headers.get('authorization') ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : null;
  if (token) {
    const handle = await handleForToken(env.SUKHI_BASE_URL ?? 'https://sukhi.f3liz.casa', token);
    return isPublisher(handle) ? handle : null;
  }
  return await sessionPublisher(request, env);
}

// POST /ap/publish { lang, slug, action? } — federate a post. Authorized by a
// publisher, but sent from the post's own author's actor, under the author's
// byline. action 'update' re-sends so followers refresh; default is a Create.
export async function handlePublish(request, env, ctx) {
  const publisher = await authorizePublisher(request, env);
  if (!publisher) return json({ error: 'unauthorized' }, 401);

  const { lang, slug, action } = (await request.json().catch(() => ({}))) ?? {};
  if (!lang || !slug) return json({ error: 'lang and slug are required' }, 400);

  const post = await getPostAny(env, lang, slug);
  if (!post) return json({ error: 'no such post' }, 404);
  const author = post.author; // the actor it federates from
  // Publish the whole slug at once — every language as one Article (nameMap /
  // summaryMap / contentMap), whichever language's row the button belonged to.
  const translations = await getTranslations(env, author, slug);

  const fedCtx = getFederation(env).createContext(request, { env, ctx });
  const isUpdate = action === 'update';
  const stamp = new Date().toISOString();
  const activity = isUpdate
    ? buildUpdate(fedCtx, author, slug, translations, stamp)
    : buildCreate(fedCtx, author, slug, translations);
  const article = articleUri(fedCtx, author, slug);

  await putOutbox(env.FEDI_DB, {
    activity_id: activity.id.href,
    actor_handle: author,
    object_id: article.href,
    type: isUpdate ? 'Update' : 'Create',
    published: stamp,
  });

  // Recorded; deliver in the background so the response is quick.
  ctx.waitUntil(deliver(fedCtx, env, author, activity));

  return json({ ok: true, article: article.href, action: isUpdate ? 'update' : 'create' });
}

// Fan out to followers, one delivery per distinct inbox. We have no queue, so
// this is also where dead inboxes get pruned: a 404/410 means that inbox is
// gone, so drop every follower who reads there. Transient errors are left
// alone — the next post will reach them.
export async function deliver(fedCtx, env, writerId, activity) {
  const followers = await listFollowers(env.FEDI_DB, writerId);

  const byInbox = new Map(); // effective inbox → { recipient, followerUris }
  for (const f of followers) {
    const inbox = f.shared_inbox ?? f.inbox_url;
    if (!byInbox.has(inbox)) {
      byInbox.set(inbox, {
        recipient: {
          id: new URL(f.follower_uri),
          inboxId: new URL(f.inbox_url),
          endpoints: f.shared_inbox
            ? new Endpoints({ sharedInbox: new URL(f.shared_inbox) })
            : null,
        },
        followerUris: [],
      });
    }
    byInbox.get(inbox).followerUris.push(f.follower_uri);
  }

  await Promise.allSettled(
    [...byInbox.values()].map(async ({ recipient, followerUris }) => {
      try {
        await fedCtx.sendActivity({ identifier: writerId }, recipient, activity);
      } catch (e) {
        if (e instanceof SendActivityError && (e.statusCode === 404 || e.statusCode === 410)) {
          for (const uri of followerUris) {
            await deleteFollower(env.FEDI_DB, writerId, uri);
          }
        }
      }
    }),
  );
}
