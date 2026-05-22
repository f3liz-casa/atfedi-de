import { loadDefaultJapaneseParser } from 'budoux';

const parser = loadDefaultJapaneseParser();

const escapeHtml = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Split Japanese text into phrases (文節) and join them with <wbr>.
//
// This runs at build time — the <wbr> markers are baked into the static HTML,
// so no BudouX code or model is shipped to the browser. Combined with
// `word-break: keep-all` on Japanese pages (see styles/base.css), the browser
// then breaks lines only at these natural phrase boundaries.
export function budouxJa(text: string): string {
  return parser.parse(text).map(escapeHtml).join('<wbr>');
}
