import { error } from '@sveltejs/kit';
import { loadRoom, roomIds, roomMeta } from '$lib/rooms.server.js';
import { ORDER } from '$lib/museum.js';

export const entries = () => roomIds.map((id) => ({ id }));

export async function load({ params }) {
  const room = await loadRoom(params.id);
  if (!room) error(404, 'その部屋は、まだ建っていません');

  const avail = new Set(roomIds);
  const i = ORDER.indexOf(params.id);
  // まだ建っていない部屋は順路から飛ばす
  const seek = (step) => {
    let j = i + step;
    while (j >= 0 && j < ORDER.length && !avail.has(ORDER[j])) j += step;
    return j >= 0 && j < ORDER.length ? roomMeta(ORDER[j]) : null;
  };

  return {
    room,
    prev: seek(-1),
    next: seek(1),
    related: (room.related || []).filter((r) => avail.has(r)).map(roomMeta),
  };
}
