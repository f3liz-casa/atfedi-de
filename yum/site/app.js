// 地図を組み立てるところ。ふだんは、ここは触らなくて大丈夫。
// 足したいお店は places.json のほうへ。
//
// transit.f3liz.casa の、やさしい方の地図フロントから。
// ちがうのは一つ ── ここのピンは「だれかが分けてくれた」もの。
// なので places.json の各点は by(fedi のハンドル) と src(元の投稿) を持てる。

(function () {
  const mapEl = document.getElementById("map");

  // Naver の地図がまだ読み込めていないとき（キー未設定・ドメイン未登録など）は、
  // 白い画面のかわりに、やさしい案内を出す。
  if (typeof naver === "undefined" || !naver.maps) {
    mapEl.classList.add("no-key");
    mapEl.innerHTML = `
      <div class="guide">
        <h1>もう少しで、地図が出ます</h1>
        <p>Naver の地図を出すには、この <code>yum.atfedi.de</code> を、
        Naver コンソールの Web サービス URL に登録してください。
        キーは referer で守られているので、公開されていて大丈夫です。</p>
        <p>やりかたは <code>README.md</code> に書いてあります。ゆっくりで大丈夫。</p>
      </div>`;
    return;
  }

  const info = new naver.maps.InfoWindow({
    borderWidth: 0,
    disableAnchor: false,
    backgroundColor: "#fff",
    borderColor: "#e7e1d6",
    anchorColor: "#fff",
    pixelOffset: new naver.maps.Point(0, -6),
  });

  const rateLabel = { suki: "すき", futsuu: "ふつう", imaichi: "いまいち" };

  // 場所は places.json から読む。
  // いまは手で編集する静的ファイル。いずれ worker が D1 から
  // 同じ形で吐けば、fediverse から集まったピンがそのまま乗る（継ぎ目はここ）。
  fetch("/places.json", { cache: "no-store" })
    .then((r) => (r.ok ? r.json() : { places: [], areas: [] }))
    .then((data) => build(data.places || [], data.areas || []))
    .catch(() => build([], []));

  function build(places, areas) {
    // 中心：置いたものがあればその真ん中に、なければソウルへ。
    const pts = [...places, ...areas];
    const center = pts.length
      ? avgLatLng(pts)
      : new naver.maps.LatLng(37.5563, 126.93);

    const map = new naver.maps.Map(mapEl, {
      center,
      zoom: 14,
      mapTypeControl: false,
      scaleControl: false,
      logoControl: true,
      mapDataControl: false,
      // 拡大・縮小は自前（index.html の .zoom）。Naver の既定のものは、
      // 中身が全部インラインスタイルで掴む所が無く、地図の静けさとけんかする。
      zoomControl: false,
    });

    // 地図ができてから、はじめて出す。
    const zoom = document.querySelector(".zoom");
    zoom.classList.add("ready");
    zoom.querySelector(".zoom-in").onclick = () => map.setZoom(map.getZoom() + 1, true);
    zoom.querySelector(".zoom-out").onclick = () => map.setZoom(map.getZoom() - 1, true);

    // ── 街の空気：やわらかい色の円 ──
    areas.forEach((a) => {
      const circle = new naver.maps.Circle({
        map,
        center: new naver.maps.LatLng(a.lat, a.lng),
        radius: a.radius,
        fillColor: a.color,
        fillOpacity: 0.22,
        strokeColor: a.color,
        strokeOpacity: 0.5,
        strokeWeight: 1,
        clickable: true,
      });
      naver.maps.Event.addListener(circle, "click", (e) => {
        info.setContent(
          `<div class="bubble area">
             <div class="head">${escapeHtml(a.name)}</div>
             <div class="mood">${escapeHtml(a.mood)}</div>
           </div>`
        );
        info.setPosition(e.coord);
        info.open(map);
      });
    });

    // ── おいしかったところ：三色のピン ──
    places.forEach((p) => {
      const rate = rateLabel[p.rating] ? p.rating : "futsuu";
      const marker = new naver.maps.Marker({
        map,
        position: new naver.maps.LatLng(p.lat, p.lng),
        icon: {
          content: `<div class="pin ${rate}"></div>`,
          anchor: new naver.maps.Point(8, 8),
        },
        zIndex: 100,
      });
      naver.maps.Event.addListener(marker, "click", () => {
        info.setContent(
          `<div class="bubble">
             <div class="head">${escapeHtml(p.name)}</div>
             <span class="rate ${rate}">${rateLabel[rate]}</span>
             ${p.note ? `<div class="note">${escapeHtml(p.note)}</div>` : ""}
             ${byLine(p)}
           </div>`
        );
        info.open(map, marker);
      });
    });

    // ぜんぶ見えるように、地図をあわせる。
    if (places.length) {
      const first = new naver.maps.LatLng(places[0].lat, places[0].lng);
      const b = new naver.maps.LatLngBounds(first, first);
      places.forEach((p) => b.extend(new naver.maps.LatLng(p.lat, p.lng)));
      map.fitBounds(b);
    }
  }

  // だれが分けてくれたか。src(元の投稿) があればそこへ、なければ名前だけ。
  function byLine(p) {
    if (!p.by) return "";
    const who = escapeHtml(p.by);
    const inner = p.src
      ? `<a href="${escapeAttr(p.src)}" target="_blank" rel="noopener">${who}</a>`
      : who;
    return `<span class="by">${inner} が分けてくれた</span>`;
  }

  // ── ちいさな道具たち ──
  function avgLatLng(list) {
    const lat = list.reduce((s, x) => s + x.lat, 0) / list.length;
    const lng = list.reduce((s, x) => s + x.lng, 0) / list.length;
    return new naver.maps.LatLng(lat, lng);
  }
  function escapeHtml(s) {
    return String(s ?? "").replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );
  }
  function escapeAttr(s) {
    return escapeHtml(s);
  }
})();
