# lht-cmn

`local-html-tools` 全体で共有する UI コンポーネント置き場です。

## 位置づけ

- `lht-cmn` は `local-html-tools` の UI 抽象化レイヤーです
- Material Web を使う場合でも、画面側で `md-*` を直接多用せず、原則 `lht-*` コンポーネントとして提供してから利用します
- 目的:
  - 画面ごとの重複実装を減らす
  - 見た目と挙動を統一する
  - 変更点を `lht-cmn` に集約して保守しやすくする
  - 生成AIが扱いやすい構造にする

## 構成

- `lht-cmn/js/components.js`
  - 共通 Web Components 定義
  - `lht-help-tooltip`
  - `lht-help-text-field`
  - `lht-help-select`
  - `lht-switch-help`
  - `lht-command-block`
  - `lht-page-menu`
- `lht-cmn/css/components.css`
  - 上記コンポーネントの共通スタイル

## 利用方法

HTML から次を読み込みます。

- `../../lht-cmn/css/components.css`
- `../../lht-cmn/js/components.js`

ページ固有の見た目調整は各画面側の CSS で実施し、共通的な DOM 生成と振る舞いは `lht-cmn` 側で管理します。

## 適用ルール

- `lht-help-text-field` を使う場合は、`label` と `help-text` の設定を「できない理由がない限り」行う
- `lht-help-select` を使う場合も、`label` と `help-text` の設定を「できない理由がない限り」行う
- `lht` 前提の形へ揃える:
  - 外側の旧ラベル（`label + Required + (i) + :`）は整理する
  - 入力系は `lht-help-text-field` / `lht-help-select` / `lht-switch-help` 側に `label` と `help-text` を集約する
  - 必須指定は可能な限りコンポーネント側（`required` と `label` の `*`）へ寄せる
- 例外にする場合は、対象画面側に理由を残す（表示密度・既存互換・重複説明の回避など）

## ドロップダウン置換手順（`lht-help-select`）

1. 基本は `lht-help-select` を使い、`field-id` / `label` / `help-text` を設定する
2. 選択肢は `lht-help-select` に対して宣言する
   - 推奨: 子要素の `<script type="application/json" slot="options">[...]</script>`
   - 代替: 子要素の `<option>`（後方互換）
3. 表示崩れや選択肢非表示が出る画面は、初期化時に JS で `md-select-option` を注入する方式へ切り替える
4. 既存JS互換のため、DOM参照ID（`document.getElementById(...)`）は変更しない

### 静的定義で成立する事例

- すべての画面で動的注入が必須ではない
- 例: `docs/git/git-branch-diff-src.html` の「出力形式」は、`md-outlined-select` + `md-select-option` の静的定義で安定動作している
- そのため方針は「まず静的定義を試す → 崩れが出る画面のみ動的注入へ切替」が基本

### 崩れ対策の実装方針

- `selectElement.tagName === "MD-OUTLINED-SELECT"` の場合:
  - `md-select-option` を `createElement` で生成
  - `option.value` を設定
  - 表示文字列は `<div slot="headline">...</div>` で設定
  - 既定値は `selected` 属性と `selectElement.value` を両方設定
- ネイティブ `select` の場合:
  - 従来どおり `<option>` を生成して設定
