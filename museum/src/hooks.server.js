// %lang% を、そのページの言語に差し替える(prerender時に走る)
export async function handle({ event, resolve }) {
  const lang = event.params?.lang ?? 'ja';
  return resolve(event, {
    transformPageChunk: ({ html }) => html.replace('%lang%', lang),
  });
}
