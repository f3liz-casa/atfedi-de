// Markdocの独自タグ: 経文(コード抜粋)と、動くおもちゃ
export const config = {
  tags: {
    sutra: {
      render: 'Sutra',
      attributes: {
        path: { type: String },
        lines: { type: String },
        note: { type: String },
        repo: { type: String, default: 'fedify' },
      },
    },
    toy: {
      render: 'Toy',
      attributes: { id: { type: String } },
    },
  },
};
