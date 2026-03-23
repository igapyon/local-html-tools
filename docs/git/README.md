# Git HTML ツール集

`docs/git/` 配下には、ブラウザだけで使える Git 補助ツールを配置します。すべて単一 HTML で完結し、基本的にオフラインで動作します。

## 関連README

- [ルートREADME](../../README.md)
- [ルート ARCHITECTURE](../../ARCHITECTURE.md)
- [LHT共通部品README](../../lht-cmn/README.md)

## 現在のUI方針（LHT優先）

- `docs/git/` でも画面側は `lht-*` 利用を優先します
- Material Web は `lht-cmn` 内部で優先利用し、画面側へ直接露出させません
- 共通方針・コンポーネント仕様・適用ルールの正本は `lht-cmn/README.md` を参照してください

## 一覧

- `docs/git/git-config-setup.html`
  - Git のユーザー名・メールアドレスをグローバル設定するコマンドを生成します
- `docs/git/git-config-advanced-setup.html`
  - `core.autocrlf` や `push.default` など、Git の詳細設定をグローバルに反映するコマンドを生成します
- `docs/git/git-branch-diff.html`
  - 2 ブランチ間の差分コマンド（`git diff` 系）を生成します
- `docs/git/git-pseudo-squash.html`
  - `git reset --soft` と再コミットで履歴をまとめる「pseudo-squash」手順のコマンドを段階ごとに生成します
- `docs/git/git-work-list.html`
  - 複数リポジトリと複数作業の組み合わせを一覧で管理し、比較や squash への導線もまとめて扱えます
  - `git` 種別に加えて、Git 連携なしで URL とメモを管理する `url` 種別も扱えます

## 使い方

対象の HTML をブラウザで開き、必要事項を入力して生成されたコマンドを手元のターミナルで実行します。

## 開発ファイル構成

- 配布物（生成物）
  - `docs/git/*.html`
- 編集元
  - `docs/git/*-src.html`
  - `docs/git/src/*/css/app.css`
  - `docs/git/src/*/js/main.js`
- 共通UI
  - `lht-cmn/vendor/material-web-outlined-text-field.bundle.js`
  - `lht-cmn/css/components.css`
  - `lht-cmn/js/components.js`

`docs/git/*.html` は生成物として扱い、直接編集しません。

## ビルド

- Git ツール全体: `npm run build:git`

`build:git` では `build:git:material` が先に実行され、Material Web 由来の vendor bundle を生成してから、各 `*-src.html` を単一 HTML へインライン化します。

## 補足

- Git ツール固有の仕様メモは `docs/git/*-spec.md` を参照してください
- 共通 UI ルールはこの README に重複記載せず、`lht-cmn/README.md` を正本として参照します
