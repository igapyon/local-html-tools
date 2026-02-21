# Git HTML ツール集

`docs/git/` 配下の HTML は、ブラウザだけで使える Git コマンドジェネレータです。すべて単一 HTML で完結し、オフラインで動作します。

## 関連README

- [ルートREADME](../../README.md)
- [MD3リファレンス](../../md3/README.md)
- [PasswordツールREADME](../password/README.md)

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
- `docs/git/src/vendor/material-web-outlined-text-field.bundle.js`（Material Web ローカル同梱生成物）
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

対象: `docs/git/git-pseudo-squash.html` 系

- 旧来の「ラベル + テキストボックス + (i) ツールチップ」は、`md-outlined-text-field` と `data-help-text` を利用した構成へ段階的に置き換える
- 旧来の `textarea` は、`md-outlined-text-field` の `type="textarea"` を利用した複数行入力へ置き換える
- 旧来の `select` ベースのドロップダウンは、`md-outlined-select` + `md-select-option` 構成へ置き換え、候補リストの見た目トークン（角丸・配色・行高）も既存コンボボックスに寄せる
- ヘルプ表示は、フィールドフォーカス時に `supportingText` を出す共通処理へ寄せる
- 候補選択 UI は、フォーカス直後に自動展開せず、入力操作を起点に開く挙動へ統一する

今回の主な編集ファイル:

- `docs/git/git-pseudo-squash-src.html`
- `docs/git/src/git-pseudo-squash/js/main.js`

反映手順:

- `npm run build:git` を実行し、`docs/git/git-pseudo-squash.html` と `dist/docs/git/git-pseudo-squash.html` を更新する

## git-pseudo-squash.html の Material Design 実装方針

`docs/git/git-pseudo-squash.html` は外部ライブラリに依存せず、単一 HTML 内で Material Design 仕様を再現しています。

- 命名は `md-*` で統一し、レイアウト/フォーム/ボタン/ツールチップ/スナックバー/コード表示をコンポーネント単位で定義する
- 色/角丸/影/タイポグラフィは CSS 変数 `--md-sys-*` に集約し、要素側はトークン参照のみで組み立てる
- 主要コンポーネントは以下のクラスで構成する
- `md-card` `md-input` `md-select` `md-textarea` `md-button` `md-icon-btn` `md-switch` `md-tooltip` `md-snackbar` `md-code`
- 表示切替は `md-hidden` `md-visible` `md-disabled` を使い、JS 側はクラスの付け替えだけで制御する
- 「i」アイコンはインライン SVG で実装し、色/サイズ/余白は `md-tooltip-trigger` 側で統一する

## Material Design 実装ルール

このプロジェクトでは、外部CSS依存を避け、Material Design のコンポーネント指向に統一しています。

- チェックボックスとトグルの使い分けは行わず、選択肢はすべてトグルに統一する
- トグルはラベルの左側に配置する（左右の違いで迷わないように固定）
- 意味単位の `md-*` コンポーネントに再構成する
- 色/角丸/影/タイポは `--md-sys-*` に集約し、要素側はトークン参照のみにする
- `input/select/textarea` は `md-input` `md-select` `md-textarea` に統一する
- 必須表示はラベル横の `md-required-chip` に統一する
- ツールチップは `md-tooltip-group` + `md-tooltip-content` で構成し、`i` はインライン SVG を使う
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
