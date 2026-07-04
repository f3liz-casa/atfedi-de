// 画面をまたぐ小さな状態: 扉(ページ間の間)と、レンズ(夜)
export const ui = $state({
  lens: false,
  door: { open: false, kind: '', name: '', dawn: false },
});
