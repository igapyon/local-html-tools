# lht-cmn

`lht-cmn` は `local-html-tools` 全体で共有する UI コンポーネント基盤です。

- Version: `v20260306`
- License: Apache License 2.0 (`lht-cmn/LICENSE`)
- Copyright: Toshiki Iga

## ライセンスと帰属

- `lht-cmn` 自体は Apache License 2.0 で配布します。
- デザイン方針は Material Design 3 の設計原則を参照します。
- 実装技術として、`lht-cmn` は必要に応じて Material Web（`@material/web`）を優先利用します。
- Material Web のライセンスは Apache License 2.0 です。
- 帰属情報の詳細は `lht-cmn/NOTICE` に記載します。

## 目的

`local-html-tools` では、入力・選択・ヘルプ・コピー・メニューなどの UI を複数ページで繰り返し実装してきました。  
`lht-cmn` はこの重複を減らし、UI を `lht-*` Web Components として共通化するためのレイヤーです。

## 基本方針

- デザイン基準は Material Design 3
- 実現手段として Material Web を優先利用する
- Material Web に妥当な選択肢がない場合は、`lht-cmn` 側に自前実装（必要に応じて新規 Web Component）を追加し、`lht-*` として提供する
- Material Web で直接実現できる要素も、画面側では一旦 `lht-*` でラップして利用する
- 画面側で利用するのは原則 `lht-*` とし、`md-*` 直接利用は `lht-cmn` 内部実装に限定する

## メリット

- 画面ごとの重複実装を削減できる
- 見た目と挙動（必須表示、ヘルプ表示、フォーカス時の挙動）を統一できる
- 変更点を `lht-cmn` に集約でき、保守・レビューがしやすくなる
- 単一HTML生成前提でも、開発時の部品再利用性を維持できる
- 変更点が局所化され、生成AIが誤って別画面を壊す確率が下がる
- UI規約が `lht-*` に集約され、提案が毎回同じ型で出せる
- レビュー時に「画面の見た目差分」より「共通部品の差分」を見ればよくなり、判断が速くなる

## 運用方針（重要）

- 画面側（`docs/*-src.html`）は `lht-*` を利用し、`md-*` 直接実装の追加は原則避ける
- `lht-cmn/js/components.js` を共通コンポーネントの正本とする
- `lht-cmn/css/components.css` を実運用スタイルの正本とする
- `lht-cmn/` 配下（特に `js/components.js` / `css/components.css`）の変更は、必ずユーザーの明示許可を得てから実施する
- `md3/` は段階的にリファレンス用途へ縮退し、実運用スタイルは `lht-cmn` に集約する

## 構成

- `lht-cmn/js/components.js`
  - 共通 Web Components 定義
- `lht-cmn/css/components.css`
  - 上記コンポーネントの共通スタイル

### コンポーネント一覧

| コンポーネント | できること | 内部構造（概要） |
|---|---|---|
| `lht-help-tooltip` | `(i)` ヘルプアイコンとツールチップを1タグで配置できる | 内部で `md-icon-button` + `md-tooltip-content` を生成し、タグ内HTMLをツールチップ本文へ差し込む |
| `lht-text-field-help` | ラベル付き入力（単一行/複数行）とフォーカス時ヘルプ表示を共通化できる | 内部で `md-outlined-text-field` を生成し、属性（`field-id`/`label`/`type`/`rows` など）を透過。`focus/blur` で `supportingText` を制御 |
| `lht-select-help` | ラベル付きドロップダウンとヘルプ表示を共通化できる | 内部で `md-outlined-select` を生成し、`<script type="application/json" slot="options">` から `md-select-option` を構築 |
| `lht-switch-help` | スイッチ + ラベル + ヘルプを1セットで配置できる | 内部で `md-switch` と `lht-help-tooltip` を組み合わせ、`on-change` 指定時はグローバル関数を呼び出す |
| `lht-command-block` | コマンド表示枠とコピー操作（単一/二重ボタン）を共通化できる | 内部で `code` と `md-icon-button` を生成。クリック時に Clipboard API（不可時は `textarea` フォールバック）でコピー |
| `lht-page-menu` | 右上メニュー（トップへ戻る等）を共通化できる | 内部でメニューボタン + パネル + リンクを生成。外側クリックで自動クローズ |
| `lht-index-card-link` | `docs/index` のカードリンクを統一フォーマットで記述できる | 内部でカードDOM（`a` + タイトル + 説明 + 矢印/バッジ）を生成し、`variant`/`target`/外部リンク判定を吸収 |
| `lht-file-select` | ファイル選択UI（Filledボタン + ファイル名表示）を共通化できる | 内部で hidden `input[type=file]` とトリガUIを生成。`md-filled-button` が使える環境ではそれを利用し、未定義時はフォールバックボタンで動作維持 |
| `lht-loading-overlay` | 処理中オーバーレイ（スピナー + メッセージ）を共通化できる | `active` で表示制御し、`aria-live`/`aria-hidden` を同期。必要に応じて `aria-busy` 更新と操作無効化も連動 |
| `lht-toast` | 一時通知トースト（コピー完了など）を共通化できる | `active` と `show()/hide()` で表示制御し、`role="status"` / `aria-live="polite"` を標準化。`window.showToast` が未定義なら自動補完 |
| `lht-error-alert` | エラー表示（`role="alert"`）を共通化できる | `active` と `show()/hide()` で表示制御し、`aria-live="assertive"` と表示/非表示同期を標準化（`clear()` は補助） |
| `lht-input-mode-toggle` | 入力モード切替（file/source ラジオ）を共通化できる | 既定ID（`inputModeFile`/`inputModeSource`）を維持しつつ、`source/file` ブロックの `md-hidden` 切替を自動化できる |
| `lht-preview-output` | プレビュー表示 + コピー導線を共通化できる | `preview` 枠とコピーボタンを1タグで提供し、`copy-target-id` 指定で既存出力要素からのコピーにも対応 |

## 利用方法

HTML から次を読み込みます。

- `../../lht-cmn/css/components.css`
- `../../lht-cmn/js/components.js`

開発時は上記ファイルを参照し、最終的な配布物はビルド時に単一HTMLへインライン化します。

ページ固有の見た目調整は各画面側の CSS で実施し、共通的な DOM 生成と振る舞いは `lht-cmn` 側で管理します。

## 適用ルール

- `lht-text-field-help` を使う場合は、`label` と `help-text` の設定を「できない理由がない限り」行う
- `lht-select-help` を使う場合も、`label` と `help-text` の設定を「できない理由がない限り」行う
- `lht` 前提の形へ揃える:
  - 外側の旧ラベル（`label + Required + (i) + :`）は整理する（全画面で対応完了した時点で、この項目はREADMEから削除する）
  - 入力系は `lht-text-field-help` / `lht-select-help` / `lht-switch-help` 側に `label` と `help-text` を集約する
  - 必須指定は可能な限りコンポーネント側（`required`）へ寄せる
- 例外にする場合は、対象画面側に理由を残す（表示密度・既存互換・重複説明の回避など）

### コンポーネント設計規約（表示制御とAPI）

- 表示/非表示を持つ `lht-*` は、表示状態の正本属性を `active` とする
- 表示制御メソッドは `show()` / `hide()` を標準とする
- `clear()` は「内容を消して非表示にする」用途でのみ任意追加する（`show/hide` の代替にはしない）
- `active` の更新時は `aria-hidden` を同期する

## ドロップダウン置換手順（`lht-select-help`）

1. 基本は `lht-select-help` を使い、`field-id` / `label` / `help-text` を設定する
2. 選択肢は `lht-select-help` に対して宣言する
   - `<script type="application/json" slot="options">[...]</script>` を使用する
3. `lht-select-help` で `<option>` 子要素は使用しない（後方互換運用は終了）
4. 既存JS互換のため、DOM参照ID（`document.getElementById(...)`）は変更しない

## カード共通化（`lht-index-card-link`）

トップ `index` のリンクカードは、基本的に `lht-index-card-link` で共通化します。

- 目的:
  - カードDOM（`a + title + desc + arrow`）の型を固定する
  - 見た目と挙動をコンポーネント側へ集約する

### 主な属性

- `href`（必須）: 遷移先
- `title`（必須）: タイトル
- `desc`（必須）: 説明文
- `icon`（任意）: タイトル先頭に出すアイコン文字（例: `🧰`）
- `variant`: `default | simple | external`
- `arrow`: `auto | none`
- `target` / `rel`: 必要時に指定（`external` / 外部URL / `_blank` は自動補完あり）
- `badge`: バッジ文字列
- `desc-lines`: 説明文の行数クランプ（数値）

### 使用例

```html
<lht-index-card-link
  href="git/git-branch-diff.html"
  icon="🧰"
  title="Git ブランチ比較"
  desc="2つのブランチ差分を表示するコマンドを生成します。"
  variant="default"
  desc-lines="3">
</lht-index-card-link>
```

## LHT リファレンス

### `lht-help-tooltip`

- 用途: `(i)` ヘルプ表示
- 主な属性: `label`, `wide`

### `lht-text-field-help`

- 用途: テキスト/数値/複数行入力 + フォーカス時ヘルプ
- 主な属性: `field-id`, `label`, `help-text`, `hide-delay-ms`, `type`, `placeholder`, `value`, `rows`, `min`, `max`, `step`, `required`, `disabled`, `field-class`

### `lht-select-help`

- 用途: セレクト入力 + フォーカス時ヘルプ
- 主な属性: `field-id`, `label`, `help-text`, `hide-delay-ms`, `value`, `required`, `disabled`, `field-class`
- 選択肢定義: `<script type="application/json" slot="options">[...]</script>`

### `lht-switch-help`

- 用途: スイッチ + ラベル + ヘルプ
- 主な属性: `switch-id`, `label`, `help-label`, `help-wide`, `checked`, `on-change`

### `lht-command-block`

- 用途: コマンド表示 + コピーUI
- 主な属性: `command-id`, `copy-buttons`（`single` / `dual`）

### `lht-page-menu`

- 用途: 右上メニュー（戻るリンク等）
- 主な属性: `home-href`, `home-label`

### `lht-page-hero`

- 用途: ページ先頭の見出しブロック（タイトル + 補助説明 + ヘルプ + メニュー）
- 主な属性: `title`, `subtitle`, `icon`, `help-label`, `help-wide`, `menu-home-href`, `menu-home-label`, `no-menu`
- 本文スロット: ヘルプポップアップに表示する説明HTML

### `lht-index-card-link`

- 用途: `docs/index` 用カードリンク
- 主な属性: `href`, `title`, `desc`, `icon`, `variant`, `arrow`, `target`, `rel`, `badge`, `desc-lines`

### `lht-file-select`

- 用途: ファイル選択UI（ボタン + hidden file input + ファイル名表示）
- 主な属性: `input-id`, `button-id`, `file-name-id`, `accept`, `button-label`, `placeholder`, `file-label`, `multiple`, `disabled`, `show-file-name`

### `lht-loading-overlay`

- 用途: ファイル読み込みなどの非同期処理中オーバーレイ（indeterminate loading）
- 主な属性: `active`, `text`, `busy-target-id`, `disable-target-ids`
- 補助メソッド: `setActive(boolean)`, `isActive()`, `waitForNextPaint()`
- ARIAルール:
  - 常時 `role="status"` と `aria-live="polite"` を持つ
  - `active` に応じて `aria-hidden` を `false/true` へ同期する
  - `busy-target-id` 指定時は対象へ `aria-busy` を `true/false` で同期する
- 推奨フロー:
  1. `overlay.setActive(true)` で開始
  2. `await overlay.waitForNextPaint()` で先に描画を確定
  3. 重い処理を実行
  4. `finally` で `overlay.setActive(false)` を必ず実行

### `lht-toast`

- 用途: コピー完了などの短時間通知（toast/snackbar）
- 主な属性: `active`, `text`, `duration-ms`
- 補助メソッド: `show(message?, durationMs?)`, `hide()`
- ARIAルール:
  - 常時 `role="status"` と `aria-live="polite"` を持つ
  - 常時 `aria-atomic="true"` を持つ
- 運用メモ:
  - ページ側に `<lht-toast id="toast"></lht-toast>` を1つ配置して使う
  - 既存コードが `window.showToast(...)` を呼ぶ場合、未定義時は `lht-toast` 側が自動補完する

### `lht-error-alert`

- 用途: 画面内エラー表示の共通化（`errorText` パターンの置換）
- 主な属性: `text`, `active`
- 補助メソッド: `show(message?)`, `hide()`, `clear()`, `isVisible()`
- ARIAルール:
  - 常時 `role="alert"` と `aria-live="assertive"` を持つ
  - 常時 `aria-atomic="true"` を持つ
  - 表示状態に応じて `aria-hidden` を同期する

### `lht-input-mode-toggle`

- 用途: `file/source` 入力切替ラジオUIの共通化（music系の重複置換）
- 主な属性: `name`, `group-label`, `file-id`, `source-id`, `file-label`, `source-label`, `default-mode`, `source-target-id`, `file-target-id`, `on-change`, `disabled`
- 補助メソッド: `getMode()`, `setMode(mode)`, `applyModeUi()`
- 互換メモ:
  - 既定の `file-id` / `source-id` は `inputModeFile` / `inputModeSource`
  - 既存JSが `document.getElementById("inputModeFile")` 等を参照していても置換しやすい

### `lht-preview-output`

- 用途: プレビュー表示とコピー導線の共通化（`preview + copyBtn` パターンの置換）
- 主な属性: `preview-id`, `copy-button-id`, `copy-target-id`, `placeholder`, `copy-label`, `copy-aria-label`, `preview-tag`, `no-copy`
- 補助メソッド: `getText()`, `setText(text)`, `copy(targetId?)`, `clear()`
- 運用メモ:
  - 既定の `preview-id` / `copy-button-id` は `previewText` / `copyBtn`
  - `copy-target-id` を指定すると、プレビュー枠とは別要素のテキストをコピーできる

## Appendix

### Appendix A: Material Web 置換の実施手順（実装メモ）

`*-src.html` を `lht-*` 前提へ寄せるときの、実務上の手順メモです。

1. 置換対象を `*-src.html` 上で特定する
2. 既存の生HTML部品を `lht-*`（内部的には Material Web または自前実装）へ置換する
3. 状態取得/保存ロジックを `selected` / `value` ベースへ揃える
4. 見た目差分（角丸、高さ、フォーカスリング、余白）を CSS トークンで吸収する
5. 単一HTMLビルドを実行して動作確認する

### Appendix B: 置換対応表（内部実装の目安）

- テキスト入力: `md-outlined-text-field`
- テキストエリア: `md-outlined-text-field type="textarea"`
- セレクト: `md-outlined-select` + `md-select-option`
- トグル: `md-switch`
- アイコンボタン: `md-icon-button`
- ヘルプ `(i)`: `lht-help-tooltip`
- フィールド活性時ヘルプ表示: `lht-text-field-help`
- スイッチ + ヘルプ: `lht-switch-help`
- コマンド表示 + コピー: `lht-command-block`
- 右上メニュー: `lht-page-menu`

### Appendix C: テーマ色運用メモ

- フォーカス、選択、強調は `primary` 系（`--md-sys-color-primary`）を基準にする
- `secondary` は `primary` と競合しない範囲で使う。迷ったら `primary` に寄せる
- フォーカスリング色はコンポーネント間で統一する
- Material Web の色変更は、まず `:root` の `--md-sys-*` を調整し、個別上書きは最小限にする

### Appendix D: tooltip 実装制約メモ

- `@material/web@2.4.1` では `md-tooltip` が同梱されないため、`lht-help-tooltip` は `md-tooltip-group` + `md-tooltip-content` ベースで運用する

### Appendix E: ドロップダウンでよくあるミスと回避方法

`lht-select-help` は `md-outlined-select` を内部利用するため、単一HTML化や依存読込順の影響を受けやすいです。  
以下のミスが、ドロップダウン崩れ（選択肢がただのテキストになる等）を起こしやすいです。

1. `md-outlined-select` が未定義のまま初期化される
- 症状:
  - 選択UIが表示されず、選択肢テキストだけが並ぶ
- 回避:
  - Material Web バンドル読込を `lht-cmn/js/components.js` より前に配置する
  - `lht-cmn` 側のフォールバック（ネイティブ `select`）が効く実装を維持する

2. `lht-select-help` の選択肢定義が不正
- 症状:
  - 選択肢が空になる / 既定値が反映されない
- 回避:
  - `<script type="application/json" slot="options">[...]</script>` の JSON を必ず配列で定義する
  - `value` と `label` を明示する
  - 既定値は `selected: true` と `value` の整合を取る

3. `field-id` を変えて既存JS参照が壊れる
- 症状:
  - `document.getElementById(...)` が `null` になり、初期化やイベント登録で失敗する
- 回避:
  - 置換時も DOM 参照ID（`field-id`）は既存IDを維持する

4. 単一HTML化でインラインスクリプトが壊れる
- 症状:
  - `Unexpected end of input`
  - バンドル内文字列が壊れ、`popover` などの警告が連鎖する
- 回避:
  - ビルド時に `</script>` を `<\\/script>` へエスケープする
  - 文字列置換でJSを差し込む場合は `replace` の関数置換を使い、`$` 展開事故を避ける

5. CSSの責務が混在して見た目が崩れる
- 症状:
  - ドロップダウンの幅・余白・フォーカス装飾がページごとに不揃い
- 回避:
  - 基本スタイルは `lht-cmn/css/components.css` に集約する
  - 画面側CSSはレイアウト差分（余白・配置）に限定する
