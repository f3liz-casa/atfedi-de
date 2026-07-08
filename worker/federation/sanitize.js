// Comment HTML arrives from other servers — never trusted. An allowlist of the
// tags a fediverse reply actually uses; everything else is stripped, event
// handlers and unknown attributes drop, and javascript: hrefs are removed
// (js-xss checks the protocol). This is the single sanitizing seam: the reader
// endpoint runs every stored comment through it before anyone sees it.

import xss from 'xss';

const filter = new xss.FilterXSS({
  whiteList: {
    p: [],
    br: [],
    a: ['href', 'class'],
    span: ['class'],
    strong: [],
    em: [],
    b: [],
    i: [],
    code: [],
    pre: [],
    blockquote: [],
    ul: [],
    ol: [],
    li: [],
  },
  stripIgnoreTag: true, // unknown tags vanish, rather than show as escaped text
  stripIgnoreTagBody: ['script', 'style'], // and take their contents with them
});

export function sanitizeComment(html) {
  return filter.process(String(html ?? ''));
}

// Articles from elsewhere (hackers.pub and the like) are longer-form, so a
// wider allowlist — headings, images, figures, tables. Same strict discipline:
// unknown tags and attributes drop, javascript: hrefs go.
const articleFilter = new xss.FilterXSS({
  whiteList: {
    p: [], br: [], hr: [],
    a: ['href', 'class'],
    span: ['class'],
    strong: [], em: [], b: [], i: [], u: [], s: [], del: [], mark: [],
    code: [], pre: [], kbd: [], samp: [],
    blockquote: ['cite'],
    ul: [], ol: ['start'], li: [],
    h1: [], h2: [], h3: [], h4: [], h5: [], h6: [],
    img: ['src', 'alt', 'title'],
    figure: [], figcaption: [],
    table: [], thead: [], tbody: [], tr: [], th: ['scope'], td: [], caption: [],
  },
  stripIgnoreTag: true,
  stripIgnoreTagBody: ['script', 'style'],
});

export function sanitizeArticle(html) {
  return articleFilter.process(String(html ?? ''));
}
