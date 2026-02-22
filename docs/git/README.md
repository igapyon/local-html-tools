# Git HTML ツール集

`docs/git/` 配下の HTML は、ブラウザだけで使える Git コマンドジェネレータです。すべて単一 HTML で完結し、オフラインで動作します。

## 関連README

- [ルートREADME](../../README.md)
- [MD3リファレンス](../../md3/README.md)
- [PasswordツールREADME](../password/README.md)

## 現在のUI方針（LHT優先）

- `docs/git/` でも画面側は `lht-*` 利用を優先します
- Material Web（`md-outlined-text-field` など）は `lht-cmn` 内部で利用し、画面側へ直接露出させない方針です
- このREADMEに残る `md-*` 中心の記述は、移行前メモまたは内部実装の説明として扱ってください

## 一覧

- `docs/git/git-config-setup.html`
  - Git のユーザー名・メールアドレスをグローバル設定するコマンドを生成します。
- `docs/git/git-config-advanced-setup.html`
  - `core.autocrlf` や `push.default` など、Git の詳細設定をグローバルに反映するコマンドを生成します。
- `docs/git/git-branch-diff.html`
  - 2 ブランチ間の差分コマンド（`git diff` 系）を生成します。
- `docs/git/git-pseudo-squash.html`
  - `git reset --soft` と再コミットで履歴をまとめる「pseudo-squash」手順のコマンドを段階ごとに生成します。

## 使い方

対象の HTML をブラウザで開き、必要事項を入力して生成されたコマンドをそのままターミナルで実行します。

## Vite でのビルド（Single-file 前提）

`docs/git` のターゲットは、ブラウザ単体で動く Single-file web app です。

- 配布物: `docs/git/*.html`（単一HTML。オフライン動作）
- Vite ビルド出力: `dist/docs/git/*.html`（内容確認・配布候補）
- `git-pseudo-squash` の編集元:
- `docs/git/git-pseudo-squash-src.html`
- `docs/git/src/git-pseudo-squash/css/app.css`
- `docs/git/src/git-pseudo-squash/js/main.js`
- `git-config-setup` の編集元:
- `docs/git/git-config-setup-src.html`
- `docs/git/src/git-config-setup/css/app.css`
- `docs/git/src/git-config-setup/js/main.js`
- `git-config-advanced-setup` の編集元:
- `docs/git/git-config-advanced-setup-src.html`
- `docs/git/src/git-config-advanced-setup/css/app.css`
- `docs/git/src/git-config-advanced-setup/js/main.js`
- `git-branch-diff` の編集元:
- `docs/git/git-branch-diff-src.html`
- `docs/git/src/git-branch-diff/css/app.css`
- `docs/git/src/git-branch-diff/js/main.js`
- `docs/git/src/vendor/material-web-outlined-text-field.bundle.js`（Material Web ローカル同梱生成物）
- `lht-cmn/css/components.css`（共通 Web Components 用スタイル）
- `lht-cmn/js/components.js`（共通 Web Components 定義）
- `docs/git/git-pseudo-squash.html` は生成物（直接編集しない）

実行コマンド:

- Single-file 生成のみ: `npm run build:git:single`
- ビルド: `npm run build:git`
- ビルド結果確認: `npm run preview:git`
- ローカル確認用サーバー（任意）: `npm run dev:git`

`build:git:single` では `build:git:material` が先に実行され、`md-outlined-text-field` 用の Material Web をローカルバンドルしてから単一HTMLへインライン化します。

## 保留事項（再開メモ）

- `git-pseudo-squash` の `md-outlined-text-field` で、ブラウザ依存の autocomplete 表示を要再調整
- 項目フォーカス時の「淡い周辺強調（ふんわりハイライト）」を、旧UIに近い見え方へ要再調整

## Material Web 置き換え進捗メモ（2026-02-21）

※この節は移行前〜移行中の記録です。新規実装では `lht-*` を優先してください。

対象: `docs/git/git-pseudo-squash.html` 系

- 旧来の「ラベル + テキストボックス」は `md-outlined-text-field` へ移行済み
- 複数行入力（コミットメッセージ）は `md-outlined-text-field type="textarea"` へ移行済み
- 旧来の `select` は `md-outlined-select` + `md-select-option` へ移行済み（基点の参照先）
- 旧来のチェックボックス/独自スイッチは `md-switch` へ移行済み（`PowerShell` / `リモート + origin と作業` / `現在ブランチで作業`）
- スイッチサイズは細い見た目に統一するため、`md-switch` のサイズ系トークンを調整
- `(i)` ヘルプアイコンは `md-icon-button` へ統一済み
- ツールチップ表示は `md-tooltip-group` + `md-tooltip-content` を継続利用（`@material/web@2.4.1` には `md-tooltip` が同梱されないため）
- 候補選択 UI は、フォーカス直後に自動展開せず、入力操作を起点に開く挙動へ統一済み

今回の主な編集ファイル:

- `docs/git/git-pseudo-squash-src.html`
- `docs/git/src/git-pseudo-squash/js/main.js`
- `docs/git/src/git-pseudo-squash/css/app.css`
- `scripts/build-git-material-web.mjs`

反映手順:

- `npm run build:git` を実行し、`docs/git/git-pseudo-squash.html` と `dist/docs/git/git-pseudo-squash.html` を更新する

## Material Web 化の具体手順（実運用）

※この節は内部実装レイヤー向けの手順です。画面側HTMLは原則 `lht-*` で構築します。

`git-pseudo-squash` を Material Web 化するときは、次の順番で実施する。

1. 置換対象を `git-pseudo-squash-src.html` 上で特定する
1. 既存の生HTML部品を、Material Web または自作Web Componentsへ置換する
1. 状態取得/保存ロジックを `main.js` 側で `selected` / `value` ベースに合わせる
1. 見た目差分（角丸、高さ、フォーカスリング、余白）を `app.css` のトークンで吸収する
1. `npm run build:git:single` で生成物を更新して動作確認する
1. 問題なければ `npm run build:git` で `dist/` まで更新する

置換の基本対応表:

- テキスト入力: `md-outlined-text-field`
- テキストエリア: `md-outlined-text-field type="textarea"`
- セレクト: `md-outlined-select` + `md-select-option`
- トグル: `md-switch`
- アイコンボタン: `md-icon-button`
- ヘルプ `(i)`: `lht-help-tooltip`（内部で `md-icon-button` + tooltip DOM を生成）
- フィールド活性時ヘルプ表示: `lht-text-field-help`（フォーカス時のみ入力下に説明を表示）
- スイッチ + ヘルプ: `lht-switch-help`（`md-switch` + ラベル + `lht-help-tooltip`）
- コマンド表示 + コピー: `lht-command-block`（`copy-buttons="single|dual"`）
- 右上メニュー: `lht-page-menu`（`home-href` / `home-label`）

`@material/web@2.4.1` では `md-tooltip` が同梱されないため、ツールチップ表示は既存の `md-tooltip-group` + `md-tooltip-content` を継続利用する。

## テーマ色ポリシー（Material Web 化時）

- フォーカス、選択、強調は `primary` 系（`--md-sys-color-primary`）を基準にする
- `secondary` は primary と競合しない範囲で使う。迷ったら primary に寄せる
- フォーカスリング色はコンポーネント間で統一し、ブラウザ標準の青リングが出る場合は `:focus-visible` で上書きする
- Material Web の色変更は、まず `:root` の `--md-sys-*` を調整し、個別部品の上書きは最小限にする

## 自作 Web Components 一覧

`docs/git/src/git-pseudo-squash/js/main.js` に定義:

- `lht-help-tooltip`
  - 属性: `label`, `wide`
  - 本文: タグ内部テキスト/HTMLをそのままツールチップ本文として扱う
- `lht-text-field-help`
  - 属性: `field-id`, `label`, `help-text`, `placeholder`, `required`, `field-class`
  - 入力欄フォーカス時のみ `supportingText` を表示し、ブラー時に非表示に戻す
- `lht-switch-help`
  - 属性: `switch-id`, `label`, `help-label`, `help-wide`, `checked`, `on-change`
  - スイッチと `(i)` ヘルプを1セットで生成し、`on-change` に指定した関数名を呼び出す
- `lht-command-block`
  - 属性: `command-id`, `copy-buttons="single|dual"`
  - `command-id` の `code` 要素とコピー操作を自動生成
- `lht-page-menu`
  - 属性: `home-href`, `home-label`
  - 右上メニューの開閉と外側クリッククローズを内包

## git-pseudo-squash.html の Material Design 実装方針

※以下は主に内部実装の設計情報です。画面側での新規実装は `lht-*` 優先とします。

`docs/git/git-pseudo-squash.html` は単一 HTML 配布を維持しつつ、Material Web コンポーネントをローカルバンドルして利用します。

- 命名は内部実装として `md-*` を利用しつつ、画面側では `lht-*` を公開APIとして扱う
- 色/角丸/影/タイポグラフィは CSS 変数 `--md-sys-*` に集約し、要素側はトークン参照のみで組み立てる
- 主要コンポーネントは以下のクラスで構成する
- `md-card` `md-button` `md-icon-btn` `md-tooltip` `md-snackbar` `md-code`
- Material Web の主利用要素は `md-outlined-text-field` `md-outlined-select` `md-select-option` `md-icon-button` `md-switch`
- 表示切替は `md-hidden` `md-visible` `md-disabled` を使い、JS 側はクラスの付け替えだけで制御する
- 「i」アイコンは `md-icon-button` にインライン SVG を入れて実装し、色/サイズ/余白は共通クラスで統一する

## Material Design 実装ルール

このプロジェクトでは、外部CSS依存を避け、Material Design のコンポーネント指向に統一しています。

- チェックボックスとトグルの使い分けは行わず、選択肢はすべてトグルに統一する
- トグルはラベルの左側に配置する（左右の違いで迷わないように固定）
- 意味単位の `md-*` コンポーネントに再構成する
- 色/角丸/影/タイポは `--md-sys-*` に集約し、要素側はトークン参照のみにする
- `input/select/textarea` は Material Web の対応コンポーネント（`md-outlined-text-field` / `md-outlined-select`）へ寄せる
- 必須表示はラベル横の `md-required-chip` に統一する
- ツールチップは `md-tooltip-group` + `md-tooltip-content` で構成し、`i` は `md-icon-button` を使う
- ツールチップ本文は `md-tooltip` に `font-weight: 400` を指定し、細めの表現に統一する
- 表示状態は `md-hidden` `md-visible` `md-disabled` に統一し、JS はクラス切替のみで制御する

## フォーム配置の実装メモ

- ラベル右に入力を並べるときは `md-form-row md-form-row--nowrap` を使う
- モバイル幅では `@media (max-width: 640px)` で wrap させて詰まりを防ぐ
- `md-field-stack`（縦並び）の場合は `.md-field-stack .md-input` を `flex: 0 0 auto` にして縦に伸びるのを防ぐ
- 入力右端にアクションボタンを半分埋める配置は `md-input-wrap` + `md-input-action` を使う
- ラベルと入力を同じ行に固定したいときは `md-form-row md-form-row--nowrap` を使う

## Material Design 適用時の実装メモ（他フォルダの知見）

- アコーディオンは `<details>/<summary>` を使うのが軽量で管理しやすい。初期状態は `open` 属性で制御する
- ラジオはピル型ではなく、シンプルなラジオ＋ラベルを基準にする
- ツールチップは横幅を制御して縦長化を避ける（例: `max-width` と `min-width` を併用）
- ラベルと入力の並びは基本「ラベル直下に入力」。横並びにする場合は行高とベースラインを揃える
