// yum editor — 手でピンを足す・直す・消す、Naver フォルダの取り込み。
// このページ自体が /editor で、すでにログイン済みの人にしか出ない
// (worker/yum/editor.js がゲート)。ここでは API を叩くだけ。

(function () {
  const rateLabel = { suki: "すき", futsuu: "ふつう", imaichi: "いまいち" };
  const pinList = document.getElementById("pin-list");
  const pinCount = document.getElementById("pin-count");
  const pinRowTpl = document.getElementById("pin-row");

  function escapeHtml(s) {
    return String(s ?? "").replace(/[&<>"']/g, (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
    );
  }

  async function api(path, opts) {
    const res = await fetch(path, {
      ...opts,
      headers: { "content-type": "application/json", ...(opts?.headers || {}) },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || `${res.status}`);
    return data;
  }

  // ── ピンの一覧 ──────────────────────────────────────────────
  async function loadPins() {
    const { pins } = await api("/api/pins");
    pinList.innerHTML = "";
    pinCount.textContent = pins.length ? `(${pins.length})` : "";
    pins.forEach((p) => pinList.appendChild(buildPinRow(p)));
  }

  function buildPinRow(p) {
    const node = pinRowTpl.content.firstElementChild.cloneNode(true);
    const rate = rateLabel[p.rating] ? p.rating : "futsuu";
    node.querySelector(".dot").classList.add(rate);
    node.querySelector(".name").textContent = p.name_local
      ? `${p.name || "この辺"}（${p.name_local}）`
      : p.name || "この辺";
    node.querySelector(".by").textContent = p.by ? `${p.by} が分けてくれた` : "";

    const view = node.querySelector(".view");
    const form = node.querySelector(".edit-form");

    node.querySelector(".edit").addEventListener("click", () => {
      form.name.value = p.name || "";
      form.name_local.value = p.name_local || "";
      form.lat.value = p.lat;
      form.lng.value = p.lng;
      form.rating.value = rate;
      form.by.value = p.by || "";
      form.place_url.value = p.place_url || "";
      form.note.value = p.note || "";
      view.hidden = true;
      form.hidden = false;
    });
    node.querySelector(".cancel").addEventListener("click", () => {
      form.hidden = true;
      view.hidden = false;
    });
    node.querySelector(".del").addEventListener("click", async () => {
      if (!confirm(`「${p.name || "この辺"}」を消す?`)) return;
      await api(`/api/pins/${encodeURIComponent(p.id)}`, { method: "DELETE" });
      loadPins();
    });
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const body = Object.fromEntries(new FormData(form));
      body.lat = Number(body.lat);
      body.lng = Number(body.lng);
      try {
        await api(`/api/pins/${encodeURIComponent(p.id)}`, {
          method: "PUT",
          body: JSON.stringify(body),
        });
        loadPins();
      } catch (err) {
        alert(err.message);
      }
    });

    return node;
  }

  // ── 手で足す ────────────────────────────────────────────────
  const addForm = document.getElementById("add-form");
  addForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const body = Object.fromEntries(new FormData(addForm));
    body.lat = Number(body.lat);
    body.lng = Number(body.lng);
    try {
      await api("/api/pins", { method: "POST", body: JSON.stringify(body) });
      addForm.reset();
      loadPins();
    } catch (err) {
      alert(err.message);
    }
  });

  // ── Naver フォルダの取り込み ──────────────────────────────
  const folderForm = document.getElementById("folder-form");
  const folderStatus = document.getElementById("folder-status");
  const folderList = document.getElementById("folder-list");
  const folderImport = document.getElementById("folder-import");
  const candidateTpl = document.getElementById("candidate-row");
  let candidates = [];

  folderForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const url = document.getElementById("folder-url").value.trim();
    folderStatus.textContent = "読んでいるところ…";
    folderList.innerHTML = "";
    folderImport.hidden = true;
    try {
      const folder = await api("/api/naver/folder", {
        method: "POST",
        body: JSON.stringify({ url }),
      });
      candidates = folder.bookmarks || [];
      folderStatus.textContent = candidates.length
        ? `${folder.name ? `「${folder.name}」── ` : ""}${candidates.length} 件`
        : "0件だった(空のフォルダかも)";
      candidates.forEach((b, i) => {
        const node = candidateTpl.content.firstElementChild.cloneNode(true);
        node.querySelector(".name").textContent = b.name || "名前なし";
        node.querySelector(".address").textContent = b.address || "";
        node.querySelector("input").dataset.index = i;
        folderList.appendChild(node);
      });
      folderImport.hidden = candidates.length === 0;
    } catch (err) {
      folderStatus.textContent = err.message;
    }
  });

  folderImport.addEventListener("click", async () => {
    const picked = [...folderList.querySelectorAll("input:checked")].map(
      (el) => candidates[Number(el.dataset.index)],
    );
    if (!picked.length) return;
    folderImport.disabled = true;
    try {
      const bookmarks = picked.map((b) => ({
        name: b.name,
        lat: b.lat,
        lng: b.lng,
        note: b.note,
        url: b.url,
      }));
      const res = await api("/api/naver/import", {
        method: "POST",
        body: JSON.stringify({ bookmarks }),
      });
      folderStatus.textContent = `${res.inserted} 件、取り込んだ`;
      folderList.innerHTML = "";
      folderImport.hidden = true;
      loadPins();
    } catch (err) {
      alert(err.message);
    } finally {
      folderImport.disabled = false;
    }
  });

  loadPins();
})();
