import { roomIds } from '$lib/rooms.server.js';
import { LANGS } from '$lib/i18n.js';

export const entries = () => LANGS.map((lang) => ({ lang }));

export function load() {
  return { available: [...roomIds, 'guide'] };
}
