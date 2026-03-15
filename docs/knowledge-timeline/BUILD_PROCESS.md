# knowledge-timeline build process

`docs/knowledge-timeline/` は配布時に単一HTMLを維持しつつ、開発時は分割ソースで管理します。

## 対象（現行）

- `composers`

## ファイル構成（composers）

- `docs/knowledge-timeline/composers-src.html`: 開発用テンプレート（手編集対象）
- `docs/knowledge-timeline/composers.html`: 配布用生成物（手編集しない）
- `docs/knowledge-timeline/src/composers/css/app.css`
- `docs/knowledge-timeline/src/composers/js/data-composers.js`
- `docs/knowledge-timeline/src/composers/js/data-events.js`
- `docs/knowledge-timeline/src/composers/js/main.js`

## ビルド

```bash
npm run build:knowledge-timeline
```

`build:knowledge-timeline` では以下を実行します。

1. `composers-src.html` の `link/script` 順序を検証
2. CSSとJSをインライン化
3. `composers.html`（配布用）を出力

## ルール

- `*.html` は生成物のため直接編集しない
- 変更は `*-src.html` と `src/` を編集する
- PRには生成済み `*.html` を含める
