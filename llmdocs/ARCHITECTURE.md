# Architecture

## システム概要

このリポジトリには、`docs/` 配下に多数の独立したローカル Web ツールがあります。ソース HTML を直接保守するものもあれば、分割されたソースツリーから開発し、配布用の単一 HTML へビルドするものもあります。

## 主要領域

- `docs/`
  - `git`、`music`、`ffmpeg`、`text`、`link`、`diagram`、`prompt`、`password` などの分野ごとに配置された公開用 HTML ツール
- `scripts/`
  - `build-music.mjs`、`build-git.mjs`、`build-prompt.mjs` などのビルドエントリポイントと、共有の単一 HTML 生成ヘルパー `scripts/lib/single-html.mjs`
- `lht-cmn/`
  - 共有 UI コンポーネント層、CSS、JS、vendor アセット、テスト
- `md3/`
  - 参照用途寄りの Material Design 関連アセット。現在の方針では実運用の UI ロジックは `lht-cmn/` を中心にする

## `lht-cmn` の位置づけ

`lht-cmn` は、このリポジトリ全体の UI 公開層である。各画面は原則として `lht-*` を使い、Material Web の採用有無や内部 DOM の違いを画面側へ漏らさない。

- 画面側の公開 UI API を `lht-*` に統一する
- `md-*` 優先 + fallback、または完全自前実装で内部差異を吸収する
- ラベル、ヘルプ、コピー導線、トースト、エラー表示などの共通 UI 規約を横断的に集約する
- アクセシビリティ契約や表示制御 API を共通化する

## `lht-cmn` の構成

- `lht-cmn/js/components.js`
  - `lht-*` Web Components の正本実装
- `lht-cmn/css/components.css`
  - 共通スタイルと状態表現の正本
- `lht-cmn/catalog/index.html`
  - コンポーネントの実表示と利用例を確認するカタログ
- `lht-cmn/vendor/*`
  - 外部 CDN 依存を避けるための vendor アセット配置場所

## 画面側との責務分担

- 画面側
  - ツール固有の入力項目、業務ロジック、生成ロジックを持つ
  - 画面固有の配置や余白など、局所的なレイアウト調整を行う
- `lht-cmn`
  - 共通 UI パーツの DOM 構築を担う
  - Material / fallback 差異を吸収する
  - `active`、`show()`、`hide()` などの表示制御 API を標準化する
  - `role`、`aria-live`、`aria-hidden` などのアクセシビリティ契約を標準化する

## 代表的な共有コンポーネント

- 入力系: `lht-text-field-help`, `lht-select-help`, `lht-switch-help`
- 補助 UI 系: `lht-help-tooltip`, `lht-page-menu`, `lht-page-hero`
- 出力系: `lht-command-block`, `lht-preview-output`
- 操作補助系: `lht-file-select`, `lht-input-mode-toggle`
- 状態表示系: `lht-loading-overlay`, `lht-toast`, `lht-error-alert`

## モジュールごとの責務

- `docs/*/*.html`
  - 配布対象となる単一ファイル出力
- `docs/*/*-src.html`
  - 単一 HTML を生成するツール向けの編集対象ソース HTML
- `docs/*/src/`
  - 実装が比較的複雑な領域で使う分割 CSS、TS、JS
- `lht-cmn/css/components.css`
  - 共有スタイルとレイアウトルール
- `lht-cmn/js/components.js`
  - 共有 `lht-*` コンポーネント実装
- `docs/*/tests/` and `lht-cmn/components.test.js`
  - ツールロジックと共有コンポーネントの回帰テスト

## ビルド関係

- `npm run build:all` は分野ごとのビルドスクリプトを順番に実行する。
- 一部のビルドは先に共有 UI アセットを準備し、その後に最終 HTML を生成する。
- `scripts/lib/single-html.mjs` はローカル参照をインライン化し、配布ファイルが自己完結するようにする。

## 開発モード

## 直接編集型の領域

- 一部ページは、追加アセットを最小限に抑えつつソース HTML を中心に保守している。

## 分割ソース型の領域

- `music`、`prompt`、`diagram`、`ffmpeg`、`grep` などでは、ソーステンプレートと `src/` ツリーを使って開発し、生成 HTML をビルドする。

## 外部依存

- Node.js 実行環境
- `@material/web`
- `esbuild`
- `typescript`
- `vitest`
- `jsdom`

## アーキテクチャ上の優先事項

- 単一ファイルでの配布
- `lht-*` を通じた共有 UI 抽象化
- ツールページ間の重複削減
- 編集対象ソースと生成物の明確な分離
