# md3

`md3/index.html` は、このリポジトリの Single-File Web App 群（主に `docs/` 配下）で蓄積した UI 実装知見を、`md-*` コンポーネントとして蒸留・整理したリファレンスです。

## 関連README

- [ルートREADME](../README.md)
- [GitツールREADME](../docs/git/README.md)
- [PasswordツールREADME](../docs/password/README.md)

## 何をまとめたものか

- 対象: `docs/` の各 HTML ツール（Git / FFmpeg / Link / Text / Grep / Password / Life など）
- 形式: 「実物プレビュー + Selectors + Origin + Rationale + Preview Code + Usage（実利用リンク）」
- 目的:
  - 画面ごとに散らばった UI パターンの再利用性を上げる
  - Material Design 風の見た目と操作感を、外部依存なしで統一する
  - 新規ツール作成時に、既存の安定パターンをすぐ流用できるようにする
  - プロジェクト共通の UI ルールを実装レベルで再利用できるようにする

## 設計の前提（ルート `README.md` 由来）

`md3/index.html` は、ルート `README.md` にある次の方針を UI コンポーネントへ落とし込むための実装カタログです。

- 各ツールは単一 HTML で完結し、ローカル動作を基本にする
- 画面フローは「入力 → 生成 → （必要に応じて）実行結果貼り付け → 次のステップ生成」を上から下に配置する
- UI ルール（`md3` 現行実装優先）:
  - 必須項目は `Required` ピル（`md-required`）を基本にする
  - 説明は `i` アイコンのツールチップ（`md-help-chip` + `md-tooltip-*`）を基本にする
  - ボタン色は用途固定（生成=緑/反映=青）ではなく、`md-*` トークンとコンポーネント設計に合わせる

## `md3/index.html` の内容

`md3/index.html` は単なるサンプル集ではなく、実運用で使ったクラス設計のカタログです。

- ページタイトル: `MD3 Component Catalog`
- 主なセクション:
  - `Core Components`
- 掲載要素（例）:
  - レイアウト: `md-page` `md-shell` `md-card`
  - 入力系: `md-label` `md-input` `md-select` `md-textarea` `md-required`
  - 選択系: `md-radio` `md-choice` `md-switch`
  - 操作系: `md-button` `md-icon-btn` `md-menu-*`
  - 補助表示: `md-tooltip-*` `md-chip` `md-sr-only`
  - 出力/通知: `md-code-block` `md-copy-button` `md-snackbar`

## 標準セットファイル

- `md3/spec/token-spec.css`（Token Spec）
- `md3/spec/core-spec.css`（Core Spec）
- `md3/spec/VERSION.md`（バージョンと変更履歴）

## 標準セット運用（正本と還元）

- `md3/index.html` は参照正本（カタログ）として扱う
  - 設計意図・構成・Preview Code の確認元
  - ページ全体をそのままコピペする対象ではない
- `md3/spec/token-spec.css` と `md3/spec/core-spec.css` は貼り付け正本（配布元）として扱う
  - 各 `docs/*.html` にはこの2ファイルを基準にコピーして利用する（未使用定義を含んでよい）
- `docs/*.html` 側で改善を行った場合は、適用後に `md3` 側へ必ずフィードバックして正本を更新する

## docs への反映手順（標準）

1. 対象 `docs/*.html` の `<style>` 内で、`:root { ... }` を `md3/spec/token-spec.css` の内容に置き換える。
2. 同じ `<style>` 内で、共通部品（`md-page`, `md-shell`, `md-card`, `md-input`, `md-button`, `md-tooltip`, `md-code`, `md-snackbar` など）を `md3/spec/core-spec.css` で置き換える。
3. 画面固有スタイル（`Screen-specific`）は残す。共通化済み定義と重複する箇所だけ削除する。
4. ブラウザで表示確認する（レイアウト崩れ、ボタン/入力/ツールチップ/コピーUI/通知の見た目と操作）。
5. 反映時に修正した内容は `md3/index.html` と `md3/spec/*.css` に還元し、`md3/spec/VERSION.md` を更新する。

## 現状スナップショット（実態）

- 構成は2層（完全統合）:
  - トークン/セレクタ集約（`Core（共通）` と `Screen-specific（画面依存）` の提示）
  - `Core Selector Catalog`（実物 + Selectors + Origin + Rationale + Preview Code + Usageリンク）
- カタログカードは `Origin`（`MD-inspired` / `Project-specific`）と `Rationale`（意図メモ）を分離している
- `Usage` の `../docs/*.html` 参照リンクは現状 25 件あり、リンク先は存在している
- スイッチ系は `md-switch` に統一済み
- ボタン系は `md-button--*` 修飾子スタイルへ統一済み（旧来 `md-button-primary` / `md-button-secondary` は削除）
- Snackbar 可視化は `md-visible` 系へ統一済み（`md-snackbar--visible` は削除）
- このため、`md3/index.html` は「統一済み仕様書」ではなく「実運用知見の収集・移行中カタログ」として扱う

## 位置づけ（docs との関係）

ルート `README.md` が全体方針、`docs/` が機能実装、`md3/` が UI 抽出レイヤです。

- ルート `README.md`: プロジェクト全体の原則（ローカル完結、画面フロー、UIルール）
- `docs/`: 機能を提供する本体（各ツールの業務ロジック中心）
- `md3/`: UI 部分の再利用可能な共通パターン中心

特に `docs/git/README.md` にある Material Design 実装方針（`md-*` 命名、トークン化、状態クラス統一など）は、`md3/index.html` の詳細設計に直接つながっています。

## 使い方

1. 新しい `docs/*.html` を作るときに、`md3/index.html` から必要な構造とクラスを選ぶ。
2. 既存ページの UI を揃えるときに、同等コンポーネントへ寄せる。
3. 新しい実装パターンが固まったら、`md3/index.html` に逆輸入してカタログを更新する。

## 自作実装ルール（明文化）

- 依存関係:
  - 単一HTMLで完結させる（外部CDNに依存しない）
  - 必要機能はベンダリング（自前実装）を優先する
- 命名:
  - UIクラスは `md-*` プレフィックスで統一する
  - 役割ベースで命名し、見た目専用の場当たりクラスを増やしすぎない
- デザイントークン:
  - 色・角丸・影・タイポは `:root` の `--md-sys-*` / `--md-*` に集約する
  - コンポーネント側はトークン参照を基本とし、直値の乱立を避ける
- コンポーネント設計:
  - 基本部品（入力・選択・ボタン・補助表示・通知）を分離して再利用可能に保つ
  - 画面固有スタイルは `Screen-specific` として分け、コア部品に混ぜ込まない
- 状態管理:
  - 表示切替は `md-hidden` / `md-visible` / `md-disabled` などの状態クラスを優先する
  - JSはスタイル直接操作よりクラス付け替えを優先する
- UI運用:
  - 必須表示は `Required` ピル（`md-required`）を基本にする
  - 説明文は `i` アイコンのツールチップに寄せる
  - ボタン色は用途固定色より、`md-button--*` とトークン整合を優先する
- アクセシビリティ:
  - 現時点では完全対応を目標にしない（必要時に段階的に対応する）
  - アクセシビリティに関する未整理事項は `md3/TODO.md` で管理する
- カタログ運用:
  - 各項目は「実物プレビュー + Selectors + Origin + Rationale + Preview Code + Usageリンク」を1セットで揃える
  - `Token（:root / --md-sys-*）` と `Core（共通）` は標準仕様としてバージョン管理する（例: `Token Spec v1.x`, `Core Spec v1.x`）
  - 標準仕様の適用対象HTMLには、未使用定義を含む標準セットを貼り付けてよい（仕様準拠を優先）
  - `Selectors` は実体クラスを表示し、必要に応じて同カード内に `State Selectors` / `Composite Selectors` を分離表示する
  - 実体クラスは `unused` 表示で、プレビュー内で直接使っていないものを区別する
  - 疑似クラス/複合セレクタ（例: `:focus`, `.a .b`）は参照用として扱い、未使用判定の対象外にする
  - `MD-inspired` で `unused` が出ることは許容する（状態・派生の説明として有効）
  - `Project-specific` は `docs/*.html` に実利用があるものだけ採用する（未使用の独自実装は追加しない）
  - `Project-specific` で実利用のない要素はカタログに載せない方針とする
  - `Project-specific` で実利用のない要素は `docs/*.html` 側にも残さない（未使用定義は削除する）
  - 表示整形の一部は `md3/index.html` のJSで実施する（`Source:` の `Usage` への吸収、`Usage` 重複リンク除去、`使用箇所なし` チップ整理 など）
  - 仕様として許容する例外（未定義関数参照・重複IDなど）はREADME/TODOで明示する

## 補足

- 方針の一次情報はルート `README.md`。
- `docs/index.html` と各サブフォルダ README（例: `docs/git/README.md`）は、カテゴリ別・実装別の補足情報。

## 既知の制約（プレビュー由来）

- `md3/index.html` の一部プレビューは、実運用HTMLから断片をそのまま引用している。
- そのため、`onclick` / `onchange` がこのページ内で未定義の関数を参照する箇所がある（仕様として許容）。
- 以前は同じ理由で、プレビュー断片間で `id` が重複する箇所（`toast`）があったが、現在は `toastHost` / `toastInline` へ分離済み。
