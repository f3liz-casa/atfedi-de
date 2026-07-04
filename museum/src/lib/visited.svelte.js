// めぐりの記録(御朱印帳)。localStorageに住み、地図と展示室で共有する
import { browser } from '$app/environment';

const KEY = 'fedimuseum.visited';

export const visited = $state({ ids: [] });

export function initVisited() {
  if (!browser) return;
  try { visited.ids = JSON.parse(localStorage.getItem(KEY) || '[]'); }
  catch { visited.ids = []; }
}

export function markVisited(id) {
  if (!browser || !id || visited.ids.includes(id)) return;
  visited.ids = [...visited.ids, id];
  try { localStorage.setItem(KEY, JSON.stringify(visited.ids)); } catch { /* 帳面が使えない環境では、そのまま */ }
}

// 御朱印帳を白紙に(歩き直したいとき)
export function resetVisited() {
  if (!browser) return;
  visited.ids = [];
  try { localStorage.removeItem(KEY); } catch { /* 同上 */ }
}
