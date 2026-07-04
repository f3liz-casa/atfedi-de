// content/rooms/{lang}/*.md を読み、frontmatter+Markdoc木にする(ビルド時のみ)
// 訳がまだ無い部屋は日本語の正本に静かにフォールバックする
import Markdoc from '@markdoc/markdoc';
import { parse as parseYaml } from 'yaml';
import { codeToHtml } from 'shiki';
import { config } from './markdoc.js';

const raw = import.meta.glob('/content/rooms/*/*.md', {
  query: '?raw', import: 'default', eager: true,
});

const parsePath = (p) => {
  const m = p.match(/\/rooms\/([a-z]+)\/([^/]+)\.md$/);
  return { lang: m[1], id: m[2] };
};

// 部屋の一覧は日本語の正本が決める
export const roomIds = Object.keys(raw)
  .map(parsePath).filter((x) => x.lang === 'ja').map((x) => x.id);

const srcOf = (lang, id) =>
  raw[`/content/rooms/${lang}/${id}.md`] ?? raw[`/content/rooms/ja/${id}.md`];

const metaCache = new Map();

// frontmatterだけ(チップや順路の表示用)
export function roomMeta(lang, id) {
  const key = `${lang}/${id}`;
  if (metaCache.has(key)) return metaCache.get(key);
  const src = srcOf(lang, id);
  if (!src) return null;
  const ast = Markdoc.parse(src);
  const fm = ast.attributes.frontmatter ? parseYaml(ast.attributes.frontmatter) : {};
  const meta = { id, name: fm.name, kind: fm.kind };
  metaCache.set(key, meta);
  return meta;
}

export async function loadRoom(lang, id) {
  const src = srcOf(lang, id);
  if (!src) return null;
  const ast = Markdoc.parse(src);
  const fm = ast.attributes.frontmatter ? parseYaml(ast.attributes.frontmatter) : {};
  const tree = Markdoc.transform(ast, config);
  await shikify(tree);
  return { id, ...fm, body: JSON.parse(JSON.stringify(tree)) };
}

// コードフェンスをShikiで焼いておく(地の色は紙に差し替え)
async function shikify(node) {
  if (!node || typeof node !== 'object') return;
  const kids = node.children || [];
  for (let i = 0; i < kids.length; i++) {
    const c = kids[i];
    if (c && c.name === 'pre' && c.attributes?.['data-language']) {
      const code = (c.children || []).join('').replace(/\n$/, '');
      const html = await codeToHtml(code, {
        lang: c.attributes['data-language'],
        theme: 'vitesse-light',
        colorReplacements: { '#ffffff': '#F7F2E3' },
      });
      kids[i] = { $$mdtype: 'Tag', name: 'shikihtml', attributes: { html }, children: [] };
    } else {
      await shikify(c);
    }
  }
}
