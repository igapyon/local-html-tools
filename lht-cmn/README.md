# lht-cmn

`local-html-tools` 全体で共有する UI コンポーネント置き場です。

## 構成

- `lht-cmn/js/components.js`
  - 共通 Web Components 定義
  - `lht-help-tooltip`
  - `lht-help-text-field`
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
