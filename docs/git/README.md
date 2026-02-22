# Git HTML ツール集

`docs/git/` 配下の HTML は、ブラウザだけで使える Git コマンドジェネレータです。すべて単一 HTML で完結し、オフラインで動作します。

## 関連README

- [ルートREADME](../../README.md)
- [MD3リファレンス](../../md3/README.md)
- [PasswordツールREADME](../password/README.md)

## 現在のUI方針（LHT優先）

- `docs/git/` でも画面側は `lht-*` 利用を優先します
- Material Web（`md-outlined-text-field` など）は `lht-cmn` 内部で利用し、画面側へ直接露出させません
- 共通方針・コンポーネント仕様・適用ルールの正本は `lht-cmn/README.md` を参照してください

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

## 共通UI方針の参照先

`docs/git/` でも共通UI方針は `lht-cmn/README.md` を正本として参照します。  
このREADMEでは、Gitツール固有の差分（ビルド手順・移行メモ・画面固有調整）だけを残します。

最小ヒント:

- 画面側は `lht-*` を使う
- Material Web は `lht-cmn` 内部で使う
- 新規のUIルール追加は先に `lht-cmn/README.md` を更新する

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
