// The reader side of comments. The article page is static, so it fetches this
// (same-origin) and renders the list on the client. Everything here is read
// from D1 and sanitized before it leaves.

import { listComments } from './store.js';
import { sanitizeComment } from './sanitize.js';

const json = (obj, status = 200, headers = {}) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...headers },
  });

// GET /ap/comments?article=<the Article's AP id>
export async function handleComments(request, env) {
  const article = new URL(request.url).searchParams.get('article');
  if (!article) return json({ error: 'article is required' }, 400);

  const rows = await listComments(env.FEDI_DB, article);
  const comments = rows.map((c) => ({
    id: c.id,
    html: sanitizeComment(c.content), // the trust boundary — safe to render
    published: c.published,
    author: {
      uri: c.author_uri,
      handle: c.author_handle ?? null,
      name: c.author_name ?? null,
      icon: c.author_icon ?? null,
    },
  }));

  return json({ comments }, 200, { 'cache-control': 'public, max-age=30' });
}
