# lht-cmn Feedback

## 2026-03-08 `lht-command-block` style contract gap

- 症状:
  - `lht-command-block` をページ側で利用しても、`lht-cmn/css/components.css` だけでは「角丸四角の結果表示ブロック」として視覚的に完成しない
  - 実際には `md-code-block` / `md-code` / `md-copy-button` / `md-icon-button.md-copy-button` 相当の見た目をページ側 CSS が別途持っている前提になっている
- 問題:
  - `lht-command-block` を共通部品として使っても、利用ページごとに結果表示の見た目が欠けうる
  - `lht-cmn` の self-contained 方針とずれている
- 期待:
  - `lht-command-block` は `lht-cmn/css/components.css` だけで最低限の完成した見た目になるべき
  - 少なくとも以下の visual contract は `lht-cmn` 側に同梱する
    - `.md-code-block`
    - `.md-code`
    - `.md-copy-button`
    - `md-icon-button.md-copy-button`
    - `md-icon-button.md-copy-button--surface`
- 補足:
  - 今回 `docs/prompt/prompt-gen-src.html` では、既存画面に合わせるためページ側へ上記スタイルを追加して回避した
  - 根本対応は `lht-cmn` 側で行うべき
