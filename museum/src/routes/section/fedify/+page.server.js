import { roomIds } from '$lib/rooms.server.js';

export function load() {
  return { available: [...roomIds, 'guide'] };
}
