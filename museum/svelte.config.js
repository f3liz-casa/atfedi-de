import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
export default {
  kit: {
    // モノレポ共通のdistへ。dispatcher Workerが museum.atfedi.de → /museum で配る
    adapter: adapter({
      pages: '../dist/museum',
      assets: '../dist/museum',
    }),
    prerender: {
      // /section/fedify/#sig のようなハッシュは「地図のその場所を開く」
      // 独自の作法で、ページ内アンカーではないので、検札しない
      handleMissingId: 'ignore',
    },
  },
};
