# ARCHITECTURE

## システム概要

このリポジトリは、`docs/` 配下に多数の独立したローカル Web ツールを持つ Static Web App 集である。配布形態は原則として「各ツールが単一 HTML で自己完結する」ことを維持しつつ、開発時には `*-src.html` や `src/` 配下の分割ソースを用いて保守性を確保する。

アーキテクチャ上の大きな柱は次の 3 点である。

- **単一HTML配布**: 利用者には外部依存のない単一 HTML を渡す
- **LHT UI 抽象化**: 画面側は原則 `lht-*` を利用し、共通 UI の契約を `lht-cmn/` に集約する
- **生成物と手編集対象の分離**: `*.html` を生成物として扱い、`*-src.html` や `src/` を編集対象に寄せる

## 主要領域

- `docs/`
  - 利用者向けの各ツールをカテゴリ別に配置する公開領域
  - `git`、`music`、`ffmpeg`、`diagram`、`grep`、`text`、`link`、`life`、`img`、`prompt`、`password`、`project`、`knowledge-timeline` などを含む
- `scripts/`
  - `build-*.mjs` 系のビルドエントリポイント群
  - 共通の単一 HTML 生成ヘルパー `scripts/lib/single-html.mjs`
- `lht-cmn/`
  - 共有 UI コンポーネント層、CSS、JS、vendor アセット、カタログ、テスト
- `md3/`
  - 参照用途寄りの Material Design 関連アセット。実運用の UI ロジックは `lht-cmn/` を中心にする

## 配布モデル

配布物の基本単位は各ツールごとの単一 HTML である。最終成果物では、ローカル参照の CSS と JavaScript を HTML にインライン化し、外部 CDN なしで開ける状態を目指す。

- `docs/*/*.html`
  - 配布対象となる単一ファイル出力
- `docs/*/*-src.html`
  - 単一 HTML を生成するための編集対象テンプレート
- `docs/*/src/`
  - 複雑なツールで使う分割 CSS / TS / JS
- `scripts/lib/single-html.mjs`
  - `link rel="stylesheet"` と `script src` のローカル参照をインライン化し、自己完結した HTML を生成する

## ビルドアーキテクチャ

ビルドはカテゴリ単位の `scripts/build-*.mjs` で構成される。各スクリプトは対象ツールのソース配置を知っており、必要に応じて TypeScript から JavaScript への変換を行った上で、最終的に単一 HTML を生成する。

- `npm run build:all`
  - 各カテゴリのビルドを順に実行し、最後にテストを流す
- `npm run build:docs`
  - `docs/index-src.html` から `docs/index.html` を生成し、更新日プレースホルダも解決する
- `npm run build:git:material`
  - `@material/web` 由来の vendor bundle を `lht-cmn/vendor/` に生成する
- `npm run build:prompt` / `npm run build:project` / `npm run build:music`
  - TypeScript を JavaScript へ変換してから最終 HTML を生成する代表例

## 開発モード

このリポジトリには、開発のしかたが異なる複数のモードがある。

### src 編集 + 生成型

`*-src.html` を正本として編集し、ビルドで `*.html` を生成する方式。

- 対象例: `life`、`link`、`text`、`img`、`docs/index`
- 変更後は対応する `npm run build:*` を実行し、生成済み HTML を更新する

### 分割ソース型

`*-src.html` に加えて `src/css`、`src/js`、`src/ts` を持ち、保守性を高める方式。

- 対象例: `music`、`prompt`、`project`、`diagram`、`ffmpeg`、`grep`、`password`、`knowledge-timeline`
- 複雑なロジック、テスト、型付き実装を分離しやすい
- 生成物の `*.html` は直接編集しない

## UIレイヤー方針（LHT）

- 方針の正本は `lht-cmn/README.md` とする
- 本書では要点のみ扱う:
  - 画面側の UI は `lht-*` Web Components を基本とする
  - Material Web は `lht-cmn` 内部で優先利用する
  - 実運用の共通スタイルは `lht-cmn/css/components.css` に集約する

### `lht-cmn` の役割

`lht-cmn` は、単なる共通 CSS 置き場ではなく、`local-html-tools` 全体の UI 公開層を担うコンポーネント基盤である。各画面は原則として `lht-*` を利用し、Material Web の採用有無や細かな DOM 構造の違いを画面側へ漏らさない。

- **公開 UI 層の統一**: 画面側が参照する UI API を `lht-*` に固定し、個別画面で `md-*` を直接組み立てる設計を避ける
- **内部実装の吸収**: `md-*` 優先 + fallback、または完全自前実装のどちらかで内部を構成し、依存の違いを `lht-cmn` 側で吸収する
- **共通ルールの集約**: ラベル、ヘルプ表示、必須表示、コピー導線、トースト、エラー表示、レスポンシブ時の振る舞いなどを横断的に統一する
- **保守境界の明確化**: 画面固有のレイアウト調整は各アプリ側、再利用可能な DOM 生成・アクセシビリティ・状態制御は `lht-cmn` 側が担当する

### `lht-cmn` の構成責務

- `lht-cmn/js/components.js`
  - `lht-*` Web Components の正本実装
  - 公開属性、公開メソッド、公開イベントの契約を保持する
  - Material Web 依存の吸収と fallback の提供を担う
- `lht-cmn/css/components.css`
  - 共通コンポーネントの見た目と状態表現の正本
  - pre-upgrade flash 抑止、tooltip 幅制御、共通レイアウトルールなどを保持する
- `lht-cmn/catalog/index.html`
  - 実表示と利用例を並べて確認するカタログ
  - UI の実装・レビュー・横展開時の参照先として使う
- `lht-cmn/vendor/*`
  - 必要な vendor アセットの配置場所
  - 単一 HTML 配布方針に合わせ、外部 CDN 依存を避けるための基盤となる

### 画面側との責務分担

- **画面側が持つ責務**
  - ツール固有の入力項目、業務ロジック、生成ロジック
  - 画面固有の配置や余白など、局所的なレイアウト調整
  - `field-id` など既存 JS 互換を保つための公開 ID 設計
- **`lht-cmn` が持つ責務**
  - 共通 UI パーツの DOM 構築
  - Material / fallback 差異の吸収
  - `active`、`show()`、`hide()` など表示制御 API の標準化
  - `role`、`aria-live`、`aria-hidden` などアクセシビリティ契約の標準化

### 代表的な共通コンポーネント

- **入力系**: `lht-text-field-help`, `lht-select-help`, `lht-switch-help`
- **補助UI系**: `lht-help-tooltip`, `lht-page-menu`, `lht-page-hero`
- **出力系**: `lht-command-block`, `lht-preview-output`
- **操作補助系**: `lht-file-select`, `lht-input-mode-toggle`
- **状態表示系**: `lht-loading-overlay`, `lht-toast`, `lht-error-alert`

## 画面パターン

このリポジトリの画面は、大きくいくつかのパターンに整理できる。

### 自動生成型

`git-pseudo-squash.html` のように、入力変更に応じて出力を即時更新する方式。

- 入力値が確定次第、自動で出力を更新してよいケースに向く
- 出力はコードブロックで常時表示し、コピー操作を主導線にする
- 入力不足時は空欄または必須メッセージで抑制する

### 多段フロー型

`ffmpeg-loudnorm-cmdline-gen.html` のように、生成結果と手元の実行結果を往復させながら次段へ進む方式。

- 「設定 → コマンド生成 → 実行 → 実行結果貼り付け → 次の生成」のような流れを扱う
- 各段階は見出しで区切り、上から下へ読めるようにする
- 生成ボタン、結果表示、コピー導線を段階ごとに揃える

### 変換・プレビュー型

`diagram`、`musicxml-to-svg`、`mikuproject` の一部のように、入力や読込データをブラウザ内で変換し、プレビューや保存へつなぐ方式。

- SVG や中間テキストなど、可視な成果物をその場で確認できる
- ダウンロード、コピー、エラー表示を近接配置し、試行錯誤しやすくする
- 外部サービスではなくブラウザ内処理を優先する

## Material Design 実装ガイド

本プロジェクトでは、外部 CSS に依存せず Material Design 系の見た目と操作感を再現する。画面側は原則 `lht-*` を利用し、`md-*` は `lht-cmn` 内部実装として扱う。詳細ルールやコンポーネント仕様は `lht-cmn/README.md` を参照する。

### 基本トークン

- 色や影は CSS 変数 `--md-sys-*` に集約する
- コンポーネント側はトークン参照のみで組み立てる

### 「i」ツールチップの標準

説明文はタイトル右の「i」アイコンに集約し、ホバーで表示する。

- **構成**: `md-tooltip-group` + `md-info-chip` + `md-tooltip-content` + `md-tooltip`
- **表示**: `md-tooltip-group:hover` で `md-tooltip-content` をフェードイン
- **幅**: 標準 `20rem`、必要なら `md-tooltip--wide`

### 主要コンポーネント

- **レイアウト**: `md-page` `md-shell` `md-card` `md-section`
- **フォーム**: `md-label` `md-input` `md-select` `md-textarea` `md-field-block`
- **ボタン**: `md-button` `md-button--primary` `md-icon-btn`
- **コード表示**: `md-code-block` `md-code` `md-copy-button`
- **トースト**: `md-snackbar` `md-hidden` `md-visible`

## アーキテクチャ上の優先事項

- 単一ファイルでの配布を維持する
- `lht-*` を通じた共有 UI 抽象化を優先する
- ツールページ間の重複実装を減らす
- 編集対象ソースと生成物を明確に分離する
- ベンダー依存を局所化し、画面側へ漏らしにくくする
