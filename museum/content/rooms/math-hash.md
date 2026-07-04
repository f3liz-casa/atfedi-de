---
name: 一方通行の扉
kind: 数学の隠れ街
repo: fedify
plain: どんな文書も短い「指紋」に変える計算。改ざん検知の芯です。
related: [sig, math-ec, math-graph]
files:
  - path: packages/fedify/src/sig/http.ts
    what: 扉の現場。Digest/Content-Digestヘッダ
---

SHA-256の扉です。どんな長さの文書でも、この扉をくぐると32バイトの影になって出てくる。影から元の文書に戻る道は、ありません。そして文書が一文字でも違えば、影はまるで別物になります。

地上では、外交文書の`Digest`ヘッダがこの扉の仕事です。船で届いた文書を受け取った島は、まず自分でも扉をくぐらせてみて、影が封筒の記載と一致するかを見る。一致しなければ、途中で誰かが文面に触った、ということ。

## 見どころ

- 出力は必ず256ビット(32バイト)。入力は一文字でも、全集でも
- 「同じ影を持つ二つの違う文書」を作る攻撃(衝突)が、SHA-256ではまだ誰にもできていない——前世代のSHA-1は2017年に破られて引退した
- HTTP署名が実際に署名するのは文書そのものではなく、この影のほう。長い文書に直接印鑑を捺すより、影に捺すほうが速くて、強さは変わらない
- 旧作法(cavage)は`Digest`ヘッダ、新作法(RFC 9421)は`Content-Digest`ヘッダ——扉は同じで、貼り場所の名前だけ違う

## 経文の一節

{% sutra path="packages/fedify/src/sig/http.ts" lines="L237-L243" note="文書の影を、封筒(Digestヘッダ)に貼るところ" repo="fedify" %}
```typescript
  if (!headers.has("Digest") && body != null) {
    const digest = await crypto.subtle.digest("SHA-256", body);
    headers.set("Digest", `SHA-256=${encodeBase64(digest)}`);
    if (span.isRecording()) {
      span.setAttribute("http_signatures.digest.sha-256", encodeHex(digest));
    }
  }
```
{% /sutra %}

## さわってみる

{% toy id="sha256" /%}
