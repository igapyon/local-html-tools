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

## Local HTML Tools（ローカルHTMLツール）

- 定義: サーバ不要でローカル実行できる、ブラウザベースのツール群。
- このプロジェクトでの意味: リポジトリ全体とその運用方針。主に「ツール本体（`docs/**/*.html`）」「開発ソース（`*-src.html` / `docs/**/src/`）」「共通UI基盤（`lht-cmn/`）」「生成・補助スクリプト（`scripts/`）」「関連文書（`README.md` / `ARCHITECTURE.md` など）」を含む。
- 別名: local-html-tools、LHT
- 関連用語: `単一HTML`、`ビルド`、`lht化`
- 備考: 利用者向け文書では「Local HTML Tools」を正式名称として扱う。

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
- 関連用語: `単一HTML`、`生成HTML`
- 備考: このプロジェクトにおける「ビルド」は、一般的なコンパイルよりも「配布用HTML生成」を主に指す。

## lht化

- 定義: 画面/UI実装を `lht-*` コンポーネント層へ移行すること。
- このプロジェクトでの意味: ツール画面の `md-*` 直利用を `lht-*` へ置き換え、`lht-cmn` に合わせて挙動とスタイルを統一する作業。
- 別名: LHT化、lht migration
- 関連用語: `lht-cmn`、`lht-*`、`Material Web`
- 備考: Issue/PRでは、UI標準化の対象範囲を示す語として使う。

## Material Web

- 定義: Google の Material Design 3 を実装した Web コンポーネント群。
- このプロジェクトでの意味: `lht-cmn` で作成するカスタム Web Components（`lht-*`）の内側で利用する基盤UIライブラリ。
- 別名: `@material/web`、md-*
- 関連用語: `Web Components`、`lht-cmn`、`lht化`
- 備考: Material Web を使うときは、原則としてカスタム Web Components を作成して内包し、画面側では `lht-*` を利用する。

## Web Components

- 定義: カスタム要素・Shadow DOM などを用いて再利用可能なUI部品を定義するWeb標準技術。
- このプロジェクトでの意味: `lht-*` や `md-*` の部品化実装の技術基盤。
- 別名: カスタム要素、Custom Elements
- 関連用語: `Material Web`、`lht-*`、`lht-cmn`
- 備考: この用語集では、ライブラリ固有名ではなく技術カテゴリとして扱う。
