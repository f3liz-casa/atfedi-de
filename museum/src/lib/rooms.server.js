// content/rooms/*.md を読み、frontmatter+Markdoc木にする(ビルド時のみ)
import Markdoc from '@markdoc/markdoc';
import { parse as parseYaml } from 'yaml';
import { codeToHtml } from 'shiki';
import { config } from './markdoc.js';

const raw = import.meta.glob('/content/rooms/*.md', {
  query: '?raw', import: 'default', eager: true,
});

export const roomIds = Object.keys(raw).map((p) => p.match(/([^/]+)\.md$/)[1]);

const metaCache = new Map();

// frontmatterだけ(チップや順路の表示用)
export function roomMeta(id) {
  if (metaCache.has(id)) return metaCache.get(id);
  const src = raw[`/content/rooms/${id}.md`];
  if (!src) return null;
  const ast = Markdoc.parse(src);
  const fm = ast.attributes.frontmatter ? parseYaml(ast.attributes.frontmatter) : {};
  const meta = { id, name: fm.name, kind: fm.kind };
  metaCache.set(id, meta);
  return meta;
}

export async function loadRoom(id) {
  const src = raw[`/content/rooms/${id}.md`];
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
