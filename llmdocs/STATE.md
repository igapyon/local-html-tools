# Current State

## 概要

このリポジトリには、すでにルートレベルに `README.md`、`ARCHITECTURE.md`、`TODO.md` などのまとまった文書があります。ビルド基盤と生成物の運用はすでに進んでおり、共有 UI 挙動は `lht-cmn/` を中心に整理していく方針です。

## 現在の理解

- これは単一アプリではなく、複数ツールから成る静的 Web アプリ集のリポジトリである。
- 出力 HTML は `*-src.html` や分割ソースツリーから生成される成果物であることが多い。
- `music` と `prompt` は、他の領域より TypeScript ベースの開発フローが深い。
- 共有 UI の標準化は現在進行中の主要テーマである。

## 既知の問題

- ルートのバックログが大きく、まだ絞り込まれたアクティブキューに整理されていない。
- 一部の UI 挙動は、まだアプリページごとに重複している。
- レスポンシブ時のはみ出し問題は複数箇所で対応済みだが、引き続き注意が必要である。

## 最近の判断

- `llmdocs/` を、このリポジトリにおける今後の LLM 支援セッション用の永続的な記憶レイヤーとする。
- 今後のセッションは変更前に `llmdocs/CONTEXT.md`、`llmdocs/ARCHITECTURE.md`、`llmdocs/STATE.md`、`llmdocs/TODO.md`、`llmdocs/SESSION.md` を読む。
- ルートレベルの文書は引き続き有用な参照情報であり、`llmdocs/` はそれらを置き換えるものではなく、簡潔な運用レイヤーとして扱う。

## 最近の変更

- `docs/git/git-work-branch-list.html` を追加し、複数リポジトリと複数ブランチの組み合わせを一覧管理できるようにした。
- 一覧項目ごとにリポジトリ URL、基準ブランチ、作業ブランチ、local / remote の扱い、リモート名を `localStorage` に保存できる。
- 一覧カードから `git-branch-diff.html` へ遷移する導線を追加し、送信側では `baseBranch` / `baseScope` / `branchWork` / `scopeWork` / `remoteName` を URL に積むようにした。
- 一覧カードから `git-pseudo-squash.html` へ遷移する `まとめる` 導線を追加し、`repoUrl` / `baseBranch` / `baseScope` / `branchWork` / `remoteName` を URL に積んで初期反映するようにした。
- `git-branch-diff` 側は上記 5 パラメータを受け取り、妥当な値だけフォームへ反映したうえでコマンドを自動再生成する。`remoteName` が `origin` 以外なら `origin 固定` を自動解除する。
- `git-branch-diff` に `repoUrl` 入力欄を追加し、`git-work-branch-list` へ戻る保存導線では `repoUrl` とブランチ名一致時は更新、なければ追加する。
- Git ツール README、ルート README、`docs/index` に新規ツールへの導線を追加した。
- `git-work-branch-list` 用のテストを追加し、Git 関連テストとビルドが通ることを確認した。

## 調査結果

- この初期化以前には `llmdocs/` ディレクトリは存在しなかった。
- 既存ドキュメントだけで、従来のプロジェクト知識を壊さずに新しい運用を立ち上げるための十分な情報が得られた。
