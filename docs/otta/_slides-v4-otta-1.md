**판정 — RED.** 제공된 템플릿에서 수정이 필요한 항목은 14건입니다. 아래는 소스 검토 결과입니다. `__SLIDES__` 실제 내용과 브라우저 렌더링은 확인 못 했습니다. 파일은 변경하지 않았습니다.

검토 스킬의 일반 디자인 규칙보다 이번 학습게임 지침을 우선했습니다. 크기·여백의 구체적인 수치는 수정 제안이며, 지침 원문에 정해진 값은 아닙니다.

### 1. 본문 서체 — RED

근거: §1 **“본문·설명·풀이 흐름·손주석 — 한글 손글씨체”**, **“폰트 2종 고정”**.

현재 제목은 Gowun Batang, 본문은 Noto Sans KR, 각종 표시는 IBM Plex Mono입니다. 세 계열 모두 교체해야 합니다.

Google Fonts `<link>`를 삭제하고 다음처럼 통일합니다. 경로는 실제 포함할 폰트 자산으로 치환해야 합니다.

```css
@font-face {
  font-family: 'NanumPen';
  src: url('./fonts/NanumPenScript-Regular.woff2') format('woff2');
  font-style: normal;
  font-weight: 400;
  font-display: block;
}

:root {
  --font-hand: 'NanumPen', 'Nanum Pen Script', sans-serif;
  --font-display: var(--font-hand);
  --font-body: var(--font-hand);
  --font-mono: var(--font-hand);
}

html, body {
  font-family: var(--font-hand);
}

button, textarea, input, select {
  font-family: inherit;
}
```

기존의 `font-family:var(--font-mono)` 선언도 제거합니다. 숫자까지 손글씨로 바꾸라는 뜻은 아닙니다. 숫자는 다음 항목처럼 별도 처리합니다.

### 2. 수식·숫자·기호의 정자 분리 — RED

근거: §1 **“수식·숫자·기호 — KaTeX 기본 정자”**, **“손글씨 적용 금지”**.

현재 MathJax SVG 출력은 본문 폰트와 분리됩니다. 이 부분 자체는 GREEN입니다. 그러나 다음은 남습니다.

- 엔진이 지침에 명시된 KaTeX가 아닙니다.
- `#pos`, `.cn`, `.score .c b`, `.src-n` 등의 숫자는 일반 텍스트입니다.
- `s.title`, `s.html`, `s.ans`, 입력한 답의 숫자·수학 기호를 분리하는 규칙이 없습니다.

엄격히 준수하려면 MathJax 설정과 CDN 스크립트를 제거하고, 버전을 고정한 KaTeX CSS·JS 및 필요한 폰트를 로컬 자산으로 포함합니다.

```html
<span class="math" data-tex="1 / 12"></span>
<span class="math" data-tex="\nabla f"></span>
<div class="math" data-display="true"
     data-tex="\int_a^b f(x)\,dx"></div>
```

```css
.math {
  font-size: inherit;
}

/* KaTeX 내부의 첨자·분수 크기와 전용 폰트는 덮어쓰지 않음 */
.math > .katex {
  font-size: 1em;
}
```

렌더러는 `data-tex`를 `katex.render()`에 넘기고, `throwOnError:true`로 오류를 실패 처리해야 합니다. `#pos`도 `textContent`로 숫자를 넣는 대신 이 경로로 렌더링합니다.

`textarea`는 문자별 서체 분리가 안 됩니다. 따라서 **수학 답 입력란과 한글 설명 입력란을 분리**하는 안을 권합니다. 수학 답 입력란은 포함된 `KaTeX_Main` 정자를 사용하고, 확인된 답은 KaTeX로 렌더링합니다. 지원하지 않는 문자는 입력 단계에서 안내해야 합니다.

`* { font-family: ... }`처럼 수식 내부까지 손글씨를 강제하는 수정은 금지합니다.

### 3. 폰트 로딩·fallback — RED

근거: §0 **“fallback 체인 필수”**, **“font-display: swap 금지”**, **“서체가 섞이는 것 — 0건”**.

현재 Google Fonts URL에 `display=swap`이 명시돼 있습니다. 요구된 fallback 체인도 없습니다.

수정 조건은 다음과 같습니다.

- 본문 체인을 `'NanumPen', 'Nanum Pen Script', sans-serif`로 지정합니다.
- 본문과 수식 폰트를 로컬 포함 또는 HTML 안에 임베드합니다.
- 포함한 웹폰트의 `@font-face`에 `font-display:block`을 적용합니다.
- 폰트 로딩과 글리프 검사가 끝나기 전에는 학습 내용을 노출하지 않습니다.
- 로드 실패 시 fallback 화면을 정상 산출물로 통과시키지 않습니다.

**`block`만으로 영구적인 fallback 방지가 되지는 않습니다.** `document.fonts.ready` 대기, 필요한 폰트 로드 확인, 실제 사용 문자에 대한 글리프 검사가 함께 필요합니다.

본문 fallback 체인은 비상 경로입니다. 이를 갖췄다는 사실과 “서체 혼용 0건” 통과는 별개입니다.

### 4. 글자 크기 3단계 — RED

근거: §1 **“고정 스케일 3단계만 사용”**, **“임의 크기 조정 금지”**.

현재 `10px`, `10.5px`, `11px`, `12.5px`, `17px`, `20px`, 여러 `em`, `clamp()`가 섞여 있습니다. 특히 `.pad-big`은 문제 글자를 축소합니다.

다음 3개 값으로 교체합니다.

```css
:root {
  --fs-title: 36px;
  --fs-body: 26px;
  --fs-note: 22px;
}

body, #body {
  font-size: var(--fs-body);
  line-height: 1.45;
}

#body h1, #body h2, .cover .big,
#body.pad-big h2, .score .c b {
  font-size: var(--fs-title);
  line-height: 1.2;
}

#body .say, #body table,
.myans textarea, .myans-txt,
#body.pad-big .qbody,
#body.pad-big .myans textarea,
.mu-h, .mu li, .choice, .cover .sub,
.btn, .nav, .verdict {
  font-size: var(--fs-body);
}

#top, #body .kicker, #body thead th,
.q-kind, .myans label, .myans .hint,
.pad-bar, .pad-bar button, .mu-h .hint,
.choice .cn, .src-th .src-n,
.src-top, .src-x, .src-foot .hint,
.jump-h .hint, .jump-pt, .jp, .btn.xs,
.done-tag, #parts span, #orientation-notice {
  font-size: var(--fs-note);
}
```

これは追記だけで済ませず、**元の競合する `font-size` 宣言を削除・置換**します。

`.pad-big`の`.85em`、小さい見出し、`height:38px`も削除します。メモ欄を広げる場合は問題文を縮めず、問題・メモ・解説を別の学習段階に分けます。

KaTeX内部の添字・分数は数式組版です。内部まで3つのサイズで上書きすると数式が壊れます。

### 5. 5色の値 — RED

根拠: §2 **“5色固定”**、**“色追加禁止。装飾用色使用禁止”**。

現在の意味色は指定値と一致していません。まず次のトークンに置き換えます。

```css
:root {
  --memory: #FFE45C;
  --caution: #E03131;
  --concept: #1971C2;
  --exam: #FF4D8D;
  --example: #2F9E44;
}
```

| 現在の色・対象 | 置換先 |
|---|---|
| `--hl:#FFF176`、`.mu-mem`背景`#FFF8C4`・枠`#E6C84A` | `#FFE45C`：暗記 |
| `--acc:#4E5FB5`、`--acc-ink:#36418C` | 概念に使う箇所だけ`#1971C2` |
| `--acc-soft:#E8EAF7` | 削除。概念枠を`#1971C2`、背景は無彩色 |
| `.mu-und`の`#E8F0FB`・`#8EB4E6`・`#1B4F8C` | 枠・見出しを`#1971C2`、淡色背景は削除 |
| `--warn:#B9791A`、`--warn-ink:#7A4E0B` | 注意なら`#E03131`。機械的な一括置換はしない |
| `--warn-soft:#FBF1DD` | 削除 |
| `--ok:#3D7A4E`、`--ok-soft:#E5F1E7` | 例題・解説の枠を`#2F9E44`、淡色背景は削除 |
| `--crit:#B2483F`、`--crit-soft:#F8E6E3` | 注意・誤りの枠を`#E03131`、淡色背景は削除 |
| `.mu-mem .mu-h`の`#7A5A00` | 本文色。黄色背景に重ねる |
| `.src-top b`の`#C9D2FF` | 本文色 |
| フォーカスの`rgba(60,90,200,.15)` | 本文色の輪郭線 |
| キャンバスの紫色グリッド | 削除：`background-image:none` |

**無彩色の扱いは地の文に明記されていません。** 以下の修正案は「意味色は5色、紙面と文字は白黒」とする解釈です。白黒まで禁止という意味なら、この部分はアトの指定が必要です。

この解釈では、青みのある背景・グレーも整理します。

```css
:root {
  --bg: #FFFFFF;
  --stage: #FFFFFF;
  --ink: #000000;
  --ink-2: #000000;
  --ink-3: #000000;
  --line: #000000;
  --ans: #FFFFFF;
}

#stage {
  box-shadow: none;
}

.pad, .pad-bar, .jp.skip, #srclb {
  background: #FFFFFF;
  color: #000000;
}

.src-top, .src-foot, .src-x {
  color: #000000;
}

.src-th .src-n {
  background: #FFFFFF;
  color: #000000;
}

.pad canvas {
  background-image: none;
}
```

`padLine()`の`ctx.strokeStyle="#1B2430"`も`"#000000"`に変更します。色がCSS外にもある点に注意が必要です。

### 6. 色の意味 — RED

根拠: §2の各色の**意味・使用処**。

現在は青が操作、緑が完了、黄土色が応用問題などにも使われています。色値だけ直しても意味の混同は残ります。

```css
#body .why, #body .concept, .mu-und {
  background: var(--stage);
  color: var(--ink);
  border: 2px solid var(--concept);
}

#body .term {
  color: var(--concept);
  border-bottom-color: var(--concept);
}

#body .hl, .mu-mem {
  background: var(--memory);
  color: var(--ink);
}

.mu-mem {
  border: 2px solid var(--memory);
}

#body .red {
  color: var(--caution);
}

.example, .ans {
  background: var(--stage);
  color: var(--ink);
  border: 2px solid var(--example);
}

.btn.a, .btn.ok, .nav.next,
.q-kind, .q-kind.a,
.jp.done, .jp.cur,
#parts span.cur, #parts span.done,
.done-tag, .score .c.ok {
  background: var(--stage);
  color: var(--ink);
  border-color: var(--ink);
}
```

残る要素は内容で振り分けます。

- `.one`：例題なら緑。まとめなら無彩色。暗記公式なら黄色。
- `.say`：概念説明なら青。単なる発言・案内なら無彩色。
- `.star`：試験言及なら次項の正式表示に置換。根拠のない強調は削除。
- `.choice.sel`：黒の太枠などで選択を表現。
- `.choice.ok`、`.verdict.ok`：正答ラベルと無彩色。解説部分を緑にする。
- `.choice.bad`、`.verdict.bad`：誤りへの注意として赤枠と文字ラベルを使用。
- `.score .c.warn`、`.score .c.crit`：結果の区分は文字で示し、装飾的な色分けを削除。

### 7. 試験言及の最優先表示 — RED

根拠: §3 **“ピンクのテ두리 박스＋좌측 상단 라벨”**、**“원문 인용”**、**“확정・강조・배제”**、**“진행바에서도 핑크색 점”**。

現在は`.star`の星だけです。原文・強度・進行点を扱う構造がありません。

各スライドに、確認済みの原文と強度を持たせます。

```js
exam: {
  level: "확정", // "강조" | "배제"
  quote: "確認済みの教授発言原文"
}
```

表示は作業領域の先頭です。以下の原文欄は実データで埋めます。

```html
<aside class="exam-callout" aria-label="시험 언급">
  <div class="exam-label">📌 시험 언급 · 확정</div>
  <blockquote class="exam-quote"></blockquote>
</aside>
```

```css
.exam-callout {
  border: 4px solid var(--exam);
  padding: 12px 16px;
  background: var(--stage);
  color: var(--ink);
  text-align: left;
}

.exam-label {
  font-size: var(--fs-body);
}

.exam-quote {
  font-size: var(--fs-body);
}
```

原文は`textContent`でそのまま挿入します。`s.star`から強度や発言を推定してはいけません。

`📌`は本文フォントでの表示を確認できていません。字形不足なら、指定ラベルを維持しつつピン部分を同色SVGにし、読み上げ用ラベルも付けます。

### 8. 画面比率 — RED

根拠: §4 **“16:10 고정”**。

現在は幅計算・`aspect-ratio`ともに16:9です。

```css
html, body {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

body {
  display: grid;
  place-items: center;
  padding: 12px;
}

#stage {
  width: min(calc(100vw - 24px), calc((100dvh - 24px) * 1.6));
  height: auto;
  aspect-ratio: 16 / 10;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  overflow: hidden;
}
```

これは比率を直す修正です。小さい画面でも全文が収まる保証ではありません。対象端末の最小表示寸法で検証し、収まらない段階は分割します。

### 9. 上部進行表示・下部操作 — RED

根拠: §4 **“진행바 → 챕터명 → 1/12”**、**“[힌트] [확인]/[다음]”**。

現在は「タイトル→ページ番号→連続バー→パート一覧」です。下部には固定の学習ヒントがなく、`#hint`は画面回転の通知です。

構造を次のように変えます。

```html
<div id="stage">
  <header id="top">
    <div id="progress" aria-label="학습 진행"></div>
    <span id="chapterName"></span>
    <span id="pos" class="math"></span>
  </header>

  <main id="body"></main>

  <footer id="foot">
    <button id="hintBtn" class="btn">힌트</button>
    <div id="primaryAction">
      <button id="primaryBtn" class="btn">확인</button>
    </div>
  </footer>
</div>

<div id="orientation-notice" hidden>
  아이패드를 가로로 돌려 주세요
</div>
```

```css
#top {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) auto;
  align-items: center;
  gap: 12px;
  padding: 12px 24px;
}

#foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 24px;
}

#primaryAction {
  margin-left: auto;
}

#progress {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.progress-dot {
  flex: 0 0 12px;
  width: 12px;
  height: 12px;
  border: 2px solid var(--ink);
  border-radius: 50%;
  background: var(--stage);
}

.progress-dot.done {
  background: var(--ink);
}

.progress-dot.exam {
  border-color: var(--exam);
  background: var(--exam);
}

.progress-dot.current {
  outline: 2px solid var(--ink);
  outline-offset: 2px;
}
```

- `chapterName`には全資料のタイトルではなく現在の章名を入れます。
- 進行点は章内の段階に対応させ、試験言及のある点をピンクにします。
- 右側の主操作を状態に応じて「確認」「次へ」に切り替えます。
- ヒントは実際の補助段階を開く操作にします。存在しなければ無効状態で理由を示します。
- 出典サムネイル・再挑戦・一覧などは作業領域の専用段階へ移します。
- 点の数が多すぎる章も、自動検査の対象にします。

既存の`#act`、`#next`を参照する処理も同時に改修する必要があります。HTMLだけの交換では動きません。

### 10. 改行・段落位置 — RED

根拠: §0 **“문단 시작 위치는 전 화면 동일”**、共通の`margin:0; padding:0; text-indent:0;`、`overflow-wrap:break-word`。

`keep-all`は設定済みでGREENです。一方、`anywhere`指定、中央揃え、要素ごとの左右余白が残っています。

```css
/* リセットは既存の個別スタイルより前に置く */
:where(h1,h2,h3,p,ul,ol,li,blockquote,
       figure,figcaption,button,input,textarea,label) {
  margin: 0;
  padding: 0;
  text-indent: 0;
  word-break: keep-all;
  overflow-wrap: break-word;
}

html, body, .choice .ct, .myans-txt {
  word-break: keep-all;
  overflow-wrap: break-word;
}

#body {
  padding: 20px 24px;
}

.cover, .center {
  height: auto;
  align-items: stretch;
  justify-content: flex-start;
  text-align: left;
}

#body :is(.why,.concept,.one,.say),
.ans, .myans-show, .mu > div {
  margin: 0;
  padding: 12px 16px;
}

#body p, #body li {
  margin: 0;
}
```

通常本文もカード本文も同じ開始位置にしたい場合は、共通の`.text-block`で包み、全て`padding-inline:16px`に統一します。

箇条書きの意図的な字下げまで違反とは言えません。ただし現状の`22px`と`.mu ul`の`18px`は統一します。数式レンダラー内部へこのリセットを適用してはいけません。

### 11. オーバーフロー処理・検査 — RED

根拠: §0 **“화면 밖으로 넘치는 텍스트/수식”**、**“폰트를 줄이지 말고 단계를 쪼갠다”**、**“scrollHeight > clientHeight 자동 검사”**。

現在は次の逃げ道があります。

- `#body{overflow:auto}`：本文をスクロールさせる。
- `.tw{overflow-x:auto}`：表を横スクロールさせる。
- `.src-body{overflow:auto}`と190%拡大：出典をスクロールさせる。
- `.pad-big`：文字サイズを縮める。
- 検査処理そのものがありません。

```css
#body, #body .tw, .src-body {
  min-width: 0;
  min-height: 0;
  overflow: hidden;
}

.mu, .choices {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.mu > div, .choices > *, .choice .ct {
  min-width: 0;
}

.src-body img,
.src-body img.zoom {
  width: 100%;
  height: 100%;
  max-width: 100%;
  object-fit: contain;
}
```

**`overflow:hidden`で切り取るだけでは不合格です。** 修正案は「スクロールをなくす＋超過を検出したらビルドを落とす」の組み合わせです。

最低限、ビルド時のブラウザー検査に次を入れます。

```js
function assertNoOverflow(root) {
  const failures = [];

  for (const el of [root, ...root.querySelectorAll('*')]) {
    if (!(el instanceof HTMLElement)) continue;
    if (!el.getClientRects().length) continue;
    if (getComputedStyle(el).display === 'inline') continue;

    if (
      el.scrollHeight > el.clientHeight ||
      el.scrollWidth > el.clientWidth
    ) {
      failures.push(el);
    }
  }

  if (failures.length) {
    throw new Error(`オーバーフロー ${failures.length}件`);
  }
}
```

これに加えて、文字列の`Range.getClientRects()`、数式SVG等の境界と作業領域を比較します。上の関数だけではインライン文字やSVGのはみ出しを全て拾えません。

検査対象は初期表示だけでは不足です。**全スライド×ヒント×解答表示×入力済み×出典表示**を、フォント・数式・画像の読み込み完了後に検査します。超過時は問題と解説、長い表、出典の拡大部分を別段階に分割します。

### 12. 装飾アニメーション — RED

根拠: §4 **“단계 전환 + 채점 연출만”**。

`.nav.pulse`が完了後に無限拡縮します。画面遷移でも採点演出でもありません。

```css
.nav, #bar i {
  transition: none;
}

.nav.pulse {
  animation: none;
}

.nav.locked {
  transform: none;
}
```

`@keyframes pulse`と`render()`内の`pulse`クラス切替も削除します。段階遷移や採点時に限定した演出は許容されますが、追加は必須ではありません。

### 13. ブラウザー保存 — RED

根拠: §0 **“localStorage / sessionStorage 등 브라우저 저장소 사용”禁止**。

CSS外ですが、絶対禁止項目なので除外できません。

削除対象は次の通りです。

- `KEY`
- `localStorage.getItem()`を含む復元処理
- `localStorage.setItem()`を含む`save()`
- 開始画面の「進行と正答率はこの機器に保存される」という説明

移行中は`save()`を空関数にすれば既存の呼び出し元を維持できます。

```js
const save = () => {};
```

最終的には不要な呼び出しも削除し、`ST`はページ内メモリーだけに保持します。`sessionStorage`やIndexedDBへの置換も不可です。

### 14. raw LaTeX・レンダリング失敗の遮断 — RED

根拠: §0 **“raw LaTeX 노출 — 0건”**。

現在はHTML挿入後に非同期で数式変換し、失敗を`.catch(()=>{})`で握りつぶしています。`$$`は現在の区切り設定にもありません。

内容次第で生の数式が表示される経路があります。

修正条件は次の通りです。

1. 数式を本文文字列から分離し、前述の`data-tex`に格納します。
2. 非表示の次画面でKaTeX変換を完了させます。
3. フォント・画像・オーバーフロー検査を通します。
4. 成功時だけ表示画面と交換します。
5. 失敗時は学習内容を表示せず、ビルドを失敗させます。

```css
#body[data-ready="false"] {
  visibility: hidden;
}
```

`display:none`では寸法検査できないため、レイアウトを保つ非表示方式にします。

生成済み内容に残った`$$`、`\frac`、`\vec`なども検査します。ただし文字列検索だけで全ての未処理数式を検出できるとは限りません。生成側で数式を明示的に分離することが先です。

### 지침 외 권고

以下は14件の件数に含めません。

- **タッチ対象**：`.pad-bar button`、`.jp`、`.src-x`は小さい文字と余白に依存しています。`min-width:44px; min-height:44px`を提案します。`.choice`の高さ48px、`.nav`の46pxは既にこの提案値を満たします。
- **フォーカス表示**：`textarea{outline:none}`を廃止し、`:focus-visible{outline:3px solid #000;outline-offset:3px}`を追加します。
- **淡色による文字の弱化**：`.hint`の`opacity:.7`などを削除します。黄色・ピンクは黒文字の背景・枠として使い、小さい本文文字の色には使わない案です。
- **入力中の誤遷移**：現在は入力欄のSpace・矢印でもページ送りが動きます。`input,textarea,select,[contenteditable]`からのキーイベントを除外します。
- **筆記中の誤遷移**：文書全体の横スワイプはキャンバス操作にも反応し得ます。ページ送り用スワイプを削除するか、専用領域に限定します。

正答の検証、試験範囲、教授の授業順序、「一判断＝一画面」の実際の充足は、`__SLIDES__`未提供のため確認 못 했습니다。ここをGREEN扱いにはできません。

優先順位は次の通りです。

1. ブラウザー保存の削除、raw LaTeX・フォント失敗の遮断。
2. 本文手書き＋KaTeX 정자、3段階サイズの確定。
3. 16:10と固定の上部・下部構造への変更。
4. 5色の値と意味の再配分、試験言及の正式表示。
5. 本文位置・改行の統一、縮小・スクロール・点滅の削除。
6. 全段階・全表示状態の実レンダリング検査。超過段階の分割。

전체 판정: RED(14건)