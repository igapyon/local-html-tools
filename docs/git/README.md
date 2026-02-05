# Git HTML ツール集

`docs/git/` 配下の HTML は、ブラウザだけで使える Git コマンドジェネレータです。すべて単一 HTML で完結し、オフラインで動作します。

## 一覧

- `docs/git/git-config-setup.html`
  - Git のユーザー名・メールアドレスをグローバル設定するコマンドを生成します。
- `docs/git/git-config-advanced-setup.html`
  - `core.autocrlf` や `push.default` など、Git の詳細設定をグローバルに反映するコマンドを生成します。
- `docs/git/git-remote-branch-diff.html`
  - リモート（`origin` など）を含む 2 ブランチ間の差分コマンド（`git diff` 系）を生成します。
- `docs/git/git-pseudo-squash.html`
  - `git reset --soft` と再コミットで履歴をまとめる「pseudo-squash」手順のコマンドを段階ごとに生成します。

## 使い方

対象の HTML をブラウザで開き、必要事項を入力して生成されたコマンドをそのままターミナルで実行します。
