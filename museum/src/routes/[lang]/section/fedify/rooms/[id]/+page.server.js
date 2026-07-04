import { error } from '@sveltejs/kit';
import { loadRoom, roomIds, roomMeta } from '$lib/rooms.server.js';
import { ORDER } from '$lib/museum.js';
import { LANGS } from '$lib/i18n.js';

export const entries = () =>
  LANGS.flatMap((lang) => roomIds.map((id) => ({ lang, id })));

export async function load({ params }) {
  const { lang, id } = params;
  const room = await loadRoom(lang, id);
  if (!room) error(404);

  const avail = new Set(roomIds);
  const i = ORDER.indexOf(id);
  // まだ建っていない部屋は順路から飛ばす
  const seek = (step) => {
    let j = i + step;
    while (j >= 0 && j < ORDER.length && !avail.has(ORDER[j])) j += step;
    return j >= 0 && j < ORDER.length ? roomMeta(lang, ORDER[j]) : null;
  };

  return {
    room,
    prev: seek(-1),
    next: seek(1),
    related: (room.related || []).filter((r) => avail.has(r)).map((r) => roomMeta(lang, r)),
  };
}
