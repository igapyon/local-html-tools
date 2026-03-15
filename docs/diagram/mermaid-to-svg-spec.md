# mermaid-to-svg 仕様

## 目的

Mermaid記法を入力し、ブラウザ上でSVGを生成する。生成したSVGはテキストコピーとファイル保存を可能にする。

## 入力

- Mermaidソース（必須）
- テーマ（`default` / `neutral` / `forest` / `dark`）

## 出力

- レンダリング済みSVGプレビュー
- SVGテキスト
- ダウンロード:
  - `mermaid-diagram.svg`

## エラーハンドリング

- 入力空欄時はエラーメッセージを表示し、処理を中断する
- Mermaidレンダリング失敗時はエラーメッセージを表示する

## UI方針

- `md3/spec/token-spec.css` と `md3/spec/core-spec.css` の設計を踏襲
- 説明はタイトル右の `i` ツールチップに集約
- ユーザー操作は `レンダリング` / `SVG保存` / `コピー` を明示
- 成功時はトーストで短く通知

## 実装メモ

- Mermaid本体は `docs/diagram/mermaid.min.js` を同梱して利用する
