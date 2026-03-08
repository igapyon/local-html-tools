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

## 2026-03-08 `lht-switch-help` material bundle gap

- 症状:
  - `lht-switch-help` を利用しても、ページ側で `md-switch` が未登録のため fallback 実装に落ちる
  - `prompt-gen` では text field は Material 表示なのに switch だけ fallback 表示になる
- 問題:
  - `lht-*` を使っても、入力部品ごとに Material / fallback が混在しやすい
  - ページ側から見ると `lht-switch-help` の見た目が他の Material 部品と揃わず、利用側で原因が見えにくい
- 期待:
  - `lht-switch-help` も `lht-cmn` 側で Material 実装を self-contained に利用できる形に寄せたい
  - 少なくとも `md-switch` 用 bundle の vendor / 読み込み導線を `lht-cmn` 側で用意したい
  - それが難しい場合でも、README に「switch は fallback 前提になりうる」ことを明記したい
- 補足:
  - 現状の `lht-switch-help` は `window.customElements.get("md-switch")` が false のとき fallback DOM を生成する実装になっている
  - `lht-cmn/vendor` には `material-web-outlined-text-field.bundle.js` はあるが、`md-switch` 相当の bundle は見当たらない
