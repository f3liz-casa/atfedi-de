// 地図を組み立てるところ。ふだんは、ここは触らなくて大丈夫。
// 足したいお店は places.json のほうへ。
//
// transit.f3liz.casa の、やさしい方の地図フロントから。
// ちがうのは一つ ── ここのピンは「だれかが分けてくれた」もの。
// なので places.json の各点は by(fedi のハンドル) と src(元の投稿) を持てる。
//
// 言葉は日本語と韓国語の二つ。最初の一度だけ「親しい言葉はなんですか?」と
// 訊いて、選んだ方をlocalStorageに覚える(index.htmlの#lang-picker)。
// #lang-switchでいつでも訊き直せる。

(function () {
  const LANG_KEY = "yum-lang";

  const STRINGS = {
    ja: {
      tagLine: "おいしい、を分けあう地図 — yum.atfedi.de",
      guideTitle: "もう少しで、地図が出ます",
      guideBody: `<p>Naver の地図を出すには、この <code>yum.atfedi.de</code> を、
        Naver コンソールの Web サービス URL に登録してください。
        キーは referer で守られているので、公開されていて大丈夫です。</p>
        <p>やりかたは <code>README.md</code> に書いてあります。ゆっくりで大丈夫。</p>`,
      rate: { suki: "すき", futsuu: "ふつう", imaichi: "いまいち" },
      zoomIn: "地図を拡大",
      zoomOut: "地図を縮小",
      sharedBy: (who) => `${who} が分けてくれた`,
    },
    ko: {
      tagLine: "맛있었던 곳을 나누는 지도 — yum.atfedi.de",
      guideTitle: "조금만 있으면, 지도가 나와요",
      guideBody: `<p>네이버 지도를 띄우려면, 이 <code>yum.atfedi.de</code>를
        네이버 콘솔의 Web 서비스 URL에 등록해 주세요.
        키는 referer로 보호되어 있어서 공개되어도 괜찮아요.</p>
        <p>방법은 <code>README.md</code>에 적혀 있어요. 천천히 해도 괜찮아요.</p>`,
      rate: { suki: "좋아", futsuu: "보통", imaichi: "별로" },
      zoomIn: "지도 확대",
      zoomOut: "지도 축소",
      sharedBy: (who) => `${who}님이 나눠준 곳`,
    },
  };

  function currentLang() {
    return localStorage.getItem(LANG_KEY) === "ko" ? "ko" : "ja";
  }

  // 静的な文言(タイトル札・凡例・拡大縮小)だけをここで差し替える。
  // 地図の吹き出しは開くたびに currentLang() を読み直すので、
  // 切り替え後に開いたものからすぐ新しい言葉になる。
  function applyLang(lang) {
    const t = STRINGS[lang];
    const set = (id, fn) => {
      const el = document.getElementById(id);
      if (el) fn(el);
    };
    set("tag-line", (el) => (el.textContent = t.tagLine));
    set("rate-suki", (el) => (el.textContent = t.rate.suki));
    set("rate-futsuu", (el) => (el.textContent = t.rate.futsuu));
    set("rate-imaichi", (el) => (el.textContent = t.rate.imaichi));
    set("zoom-in-btn", (el) => el.setAttribute("aria-label", t.zoomIn));
    set("zoom-out-btn", (el) => el.setAttribute("aria-label", t.zoomOut));
  }

  function initLangPicker() {
    const picker = document.getElementById("lang-picker");
    const switchBtn = document.getElementById("lang-switch");
    if (!picker) return;

    if (!localStorage.getItem(LANG_KEY)) picker.classList.add("show");

    picker.querySelectorAll("[data-lang]").forEach((btn) => {
      btn.addEventListener("click", () => {
        localStorage.setItem(LANG_KEY, btn.dataset.lang);
        applyLang(btn.dataset.lang);
        picker.classList.remove("show");
      });
    });
    if (switchBtn) switchBtn.addEventListener("click", () => picker.classList.add("show"));
  }

  applyLang(currentLang());
  initLangPicker();

  const mapEl = document.getElementById("map");

  // Naver の地図がまだ読み込めていないとき（キー未設定・ドメイン未登録など）は、
  // 白い画面のかわりに、やさしい案内を出す。
  if (typeof naver === "undefined" || !naver.maps) {
    const t = STRINGS[currentLang()];
    mapEl.classList.add("no-key");
    mapEl.innerHTML = `<div class="guide"><h1>${t.guideTitle}</h1>${t.guideBody}</div>`;
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
      const rate = STRINGS.ja.rate[p.rating] ? p.rating : "futsuu";
      const marker = new naver.maps.Marker({
        map,
        position: new naver.maps.LatLng(p.lat, p.lng),
        icon: {
          // pin-hit は指で押しやすいように広げた当たり判定(44px四方)、
          // pin はその真ん中の、見えているドット。anchor は当たり判定の
          // 中心に合わせる(位置がずれないよう、そこは変わらない)。
          content: `<div class="pin-hit"><div class="pin ${rate}"></div></div>`,
          anchor: new naver.maps.Point(22, 22),
        },
        zIndex: 100,
      });
      naver.maps.Event.addListener(marker, "click", () => {
        const lang = currentLang();
        const t = STRINGS[lang];
        // name_local / note_local はいまのところ日本語読みしか持っていない
        // ので、日本語で見ている人にだけ出す。韓国語で見ている人には
        // name そのもの・note そのものがすでに読める言葉。
        const nameLocal = lang === "ja" && p.nameLocal ? p.nameLocal : null;
        const note = (lang === "ja" && p.noteLocal) || p.note || "";
        info.setContent(
          `<div class="bubble">
             <div class="head">${escapeHtml(p.name)}${nameLocal ? `<span class="name-local">（${escapeHtml(nameLocal)}）</span>` : ""}</div>
             <span class="rate ${rate}">${t.rate[rate]}</span>
             ${note ? `<div class="note">${escapeHtml(note)}</div>` : ""}
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
    return `<span class="by">${STRINGS[currentLang()].sharedBy(inner)}</span>`;
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
