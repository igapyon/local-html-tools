# music tools build process

`docs/music/` は配布時に単一HTMLを維持しつつ、開発時は分割ソースで管理します。

## 対象（現行）

- `musicxml-to-midi`
- `musicxml-to-abc`
- `abc-to-musicxml`
- `musicxml-to-svg`

## ファイル構成（musicxml-to-midi）

- `docs/music/musicxml-to-midi-src.html`: 開発用テンプレート（手編集対象）
- `docs/music/musicxml-to-midi.html`: 配布用生成物（手編集しない）
- `docs/music/src/musicxml-to-midi/css/app.css`
- `docs/music/src/musicxml-to-midi/ts/main.ts`
- `docs/music/src/musicxml-to-midi/js/midi-writer.js`（ライブラリ同梱）
- `docs/music/src/musicxml-to-midi/js/main.js`（TS変換後）

## ファイル構成（musicxml-to-abc / abc-to-musicxml）

- `docs/music/musicxml-to-abc-src.html`
- `docs/music/musicxml-to-abc.html`（生成物）
- `docs/music/src/musicxml-to-abc/css/app.css`
- `docs/music/src/musicxml-to-abc/ts/main.ts`
- `docs/music/src/musicxml-to-abc/js/main.js`
- `docs/music/abc-to-musicxml-src.html`
- `docs/music/abc-to-musicxml.html`（生成物）
- `docs/music/src/abc-to-musicxml/css/app.css`
- `docs/music/src/abc-to-musicxml/ts/main.ts`
- `docs/music/src/abc-to-musicxml/js/main.js`

## ファイル構成（musicxml-to-svg）

- `docs/music/musicxml-to-svg-src.html`
- `docs/music/musicxml-to-svg.html`（生成物）
- `docs/music/src/musicxml-to-svg/css/app.css`
- `docs/music/src/musicxml-to-svg/ts/main.ts`
- `docs/music/src/musicxml-to-svg/js/main.js`
- `docs/music/src/musicxml-to-svg/js/verovio.js`（ライブラリ同梱）
- `docs/music/src/musicxml-to-svg/js/jszip.js`（ライブラリ同梱）

## ビルド

```bash
npm run build:music
```

`build:music` では以下を実行します。

1. `src/.../ts/*.ts` を `src/.../js/*.js` に変換
2. `*-src.html` の `link/script` 順序を検証
3. CSSとJSをインライン化
4. `*.html`（配布用）を出力

備考:

- `typescript` が未導入の場合、`build:music` はフォールバックとして `.ts` をそのまま `.js` へコピーして継続します。
- 厳密な型チェックを行う場合は `npm install` 後に `npm run typecheck:music` を実行します。

## ルール

- `*.html` は生成物のため直接編集しない
- 変更は `*-src.html` と `src/` を編集する
- PRには生成済み `*.html` を含める
