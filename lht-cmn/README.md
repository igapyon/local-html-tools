# lht-cmn

`local-html-tools` 全体で共有する UI コンポーネント置き場です。

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
- `lht` 前提の形へ揃える:
  - 外側の旧ラベル（`label + Required + (i) + :`）は整理する
  - 入力系は `lht-help-text-field` / `lht-help-select` / `lht-switch-help` 側に `label` と `help-text` を集約する
  - 必須指定は可能な限りコンポーネント側（`required` と `label` の `*`）へ寄せる
- 例外にする場合は、対象画面側に理由を残す（表示密度・既存互換・重複説明の回避など）
