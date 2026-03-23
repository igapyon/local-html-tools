# 用語集

このファイルは、命名と説明の一貫性を保つためのプロジェクト用語を定義します。

## 使い方

- 用語は見出し名の五十音順（または英字順）で追加する。
- 定義は短く保つ（1〜3行）。
- 正式な呼称を1つ決め、別名は「別名」に記載する。
- 廃止予定の語は「備考」に明記する。

## 用語テンプレート

```md
## <用語名>

- 定義:
- このプロジェクトでの意味:
- 別名:
- 関連用語:
- 備考:
```

## 用語一覧

## `*-src.html`

- 定義: 配布用 HTML を生成するための手編集対象テンプレート。
- このプロジェクトでの意味: `docs/*/*-src.html` を指し、生成物の `*.html` ではなくこちらを正本として編集する。
- 別名: src HTML、ソースHTML
- 関連用語: `単一HTML`、`ビルド`、`分割ソース型`
- 備考: 「`src` を編集する」の文脈では、`src/` ディレクトリだけでなく `*-src.html` を含む場合がある。

## Local HTML Tools（ローカルHTMLツール）

- 定義: サーバ不要でローカル実行できる、ブラウザベースのツール群。
- このプロジェクトでの意味: リポジトリ全体とその運用方針。主に「ツール本体（`docs/**/*.html`）」「開発ソース（`*-src.html` / `docs/**/src/`）」「共通UI基盤（`lht-cmn/`）」「生成・補助スクリプト（`scripts/`）」「関連文書（`README.md` / `ARCHITECTURE.md` など）」を含む。
- 別名: local-html-tools、LHT
- 関連用語: `単一HTML`、`ビルド`、`lht化`
- 備考: 正式名称は「Local HTML Tools」、リポジトリ名は `local-html-tools`、略称は `LHT` として扱う。

## `lht-*`

- 定義: `lht-` 接頭辞を持つプロジェクト独自の Web Components 群。
- このプロジェクトでの意味: 画面側が依存してよい公開 UI API。内部では Material Web や fallback 実装を使っていても、その差異を画面側へ漏らさない境界として扱う。
- 別名: LHT components、LHT コンポーネント
- 関連用語: `lht-cmn`、`lht化`、`Web Components`
- 備考: 新しい共通 UI を導入する際は、原則として `md-*` を画面へ直接露出させず `lht-*` として抽象化する。

## `lht-cmn`

- 定義: `local-html-tools` 全体の共有 UI 基盤ディレクトリ。
- このプロジェクトでの意味: `lht-*` コンポーネント、共通 CSS、vendor bundle、カタログ、テストを持つ UI 公開層の正本。
- 別名: LHT common、共通UI基盤
- 関連用語: `lht-*`、`Material Web`、`vendor bundle`
- 備考: 画面ごとの UI 重複を減らし、見た目と操作感の統一を担う。

## 単一HTML（Single HTML）

- 定義: ブラウザで動作するための要素を1ファイルにまとめたHTML。
- このプロジェクトでの意味: 各ツールの配布形式（`docs/**/*.html`）。生成物は原則として直接編集しない。
- 別名: 1HTML、standalone HTML
- 関連用語: `*-src.html`、`ビルド`
- 備考: 可能な限り外部依存を減らし、オフライン実行性を維持する。

## ビルド（Build）

- 定義: 保守しやすい開発用ソースを、配布用の単一HTMLへ変換する工程。
- このプロジェクトでの意味: `npm run build:*` と `scripts/build-*.mjs` により、`*-src.html` や分割ソースから配布HTMLを生成する処理。
- 別名: build pipeline、生成処理
- 関連用語: `単一HTML`、`生成HTML`、`single-html`
- 備考: このプロジェクトにおける「ビルド」は、一般的なコンパイルよりも「配布用HTML生成」を主に指す。

## lht化

- 定義: 画面/UI実装を `lht-*` コンポーネント層へ移行すること。
- このプロジェクトでの意味: ツール画面の `md-*` 直利用を `lht-*` へ置き換え、`lht-cmn` に合わせて挙動とスタイルを統一する作業。
- 別名: LHT化、lht migration
- 関連用語: `lht-cmn`、`lht-*`、`Material Web`
- 備考: Issue/PRでは、UI標準化の対象範囲を示す語として使う。

## Material Web

- 定義: Google の Material Design 3 を実装した Web コンポーネント群。
- このプロジェクトでの意味: `lht-cmn` で作成するカスタム Web Components（`lht-*`）の内側で優先利用する基盤 UI ライブラリ。
- 別名: `@material/web`、md-*
- 関連用語: `Web Components`、`lht-cmn`、`lht化`
- 備考: Material Web を使うときは、原則としてカスタム Web Components を作成して内包し、画面側では `lht-*` を利用する。実装は fallback と共存する場合がある。

## `md3`

- 定義: Material Design 3 関連の参照用アセット群。
- このプロジェクトでの意味: 実運用の UI 正本ではなく、トークンやスタイルの参照資料を置くディレクトリ。
- 別名: MD3リファレンス
- 関連用語: `Material Web`、`lht-cmn`
- 備考: 現在の方針では、実運用の UI ロジックは `lht-cmn/` を中心にする。

## single-html

- 定義: 複数ファイルのローカル参照を単一 HTML にまとめるためのインライン化処理、またはそのヘルパー。
- このプロジェクトでの意味: 主に `scripts/lib/single-html.mjs` と、その処理で生成される自己完結型 HTML を指す文脈で使う。
- 別名: single-html helper、インライン化処理
- 関連用語: `単一HTML`、`ビルド`、`vendor bundle`
- 備考: 単なる概念としての「単一HTML」と、実装ヘルパーとしての `single-html` は区別して扱う。

## src 編集 + 生成型

- 定義: `*-src.html` を正本として編集し、ビルドで `*.html` を生成する開発方式。
- このプロジェクトでの意味: `life`、`link`、`text`、`img`、`docs/index` などで採る比較的軽量な運用パターン。
- 別名: src編集型、テンプレート編集型
- 関連用語: `*-src.html`、`ビルド`、`分割ソース型`
- 備考: `src/` ディレクトリを必ずしも持たない。

## 分割ソース型

- 定義: `*-src.html` に加えて `src/css`、`src/js`、`src/ts` を分けて保守する開発方式。
- このプロジェクトでの意味: `music`、`prompt`、`project`、`diagram`、`ffmpeg`、`grep`、`password`、`knowledge-timeline` などで採る運用パターン。
- 別名: 分割開発、分割ソース運用
- 関連用語: `*-src.html`、`ビルド`、`src 編集 + 生成型`
- 備考: 複雑なロジック、型付き実装、テストを扱いやすくするための方式で、生成物の `*.html` は直接編集しない。

## vendor bundle

- 定義: 外部ライブラリから生成または同梱された、配布用に使う vendor アセット。
- このプロジェクトでの意味: 主に `lht-cmn/vendor/material-web-outlined-text-field.bundle.js` のように、外部依存を局所化して単一HTML生成へ組み込むためのファイルを指す。
- 別名: vendor asset、同梱 bundle
- 関連用語: `lht-cmn`、`Material Web`、`single-html`
- 備考: 画面側の公開 API ではなく、`lht-cmn` 側の内部実装資産として扱う。

## Web Components

- 定義: カスタム要素・Shadow DOM などを用いて再利用可能なUI部品を定義するWeb標準技術。
- このプロジェクトでの意味: `lht-*` や `md-*` の部品化実装の技術基盤。
- 別名: カスタム要素、Custom Elements
- 関連用語: `Material Web`、`lht-*`、`lht-cmn`
- 備考: この用語集では、ライブラリ固有名ではなく技術カテゴリとして扱う。
