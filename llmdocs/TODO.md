# Task List

## 現在のタスク

- [ ] toast、error、ファイル選択、プレビュー、コマンドブロック UI がまだ重複しているアプリに対して、`lht-cmn` コンポーネント展開を継続する。
- [ ] 狭幅画面でのはみ出し問題の残件を確認し、個別パッチの前に共有 `lht` ルールで修正する。
- [ ] `git-work-list` で Material Web の `md-outlined-text-field` / `md-outlined-select` が `translateY(NaNpx) scale(NaN)` 警告を出す件を切り分け、無視継続か初期化タイミング修正かを判断する。
- [ ] 既存のルート [`TODO.md`](/Users/igapyon/Documents/git/local-html-tools/TODO.md) バックログから、次に着手すべき最優先実装対象を明確化する。

## 最近完了した項目

- [x] 複数リポジトリと複数ブランチの作業状況を一覧管理できる Git ツール `git-work-list` を追加した。
- [x] `llmdocs/` を初期化し、プロジェクト文脈、アーキテクチャ、計画、タスクキュー、状態、セッションメモ、運用ルールを整備した。
- [x] `git-work-list` から `git-branch-diff` へ遷移し、`baseBranch` / `baseScope` / `workBranch` / `workScope` / `remoteName` を URL 引数で引き渡せるようにした。
- [x] `git-branch-diff` から `git-work-list` へ現在条件を保存して戻る導線を追加した。
- [x] `git-work-list` から `git-pseudo-squash` へ遷移する `まとめる` 導線を追加した。
- [x] `git-pseudo-squash` から `git-work-list` へ現在条件を保存して戻る導線を追加した。

## バックログ

- [ ] Material Web vendor bundle の参照先を `lht-cmn/` 周辺へ整理し、構成を正規化する。
- [ ] `lht-text-field-help` の trailing action API を、現状の暫定 `clearable` を超えて正式化する。
- [ ] 圧縮補助、EXIF 確認、ネットワーク/プロセス調査補助、カレンダ系ユーティリティなど、バックログ上のツールを追加または再設計する。
- [ ] `git-branch-diff` の URL 引数対応で `diffMode` / `useTripleDot` / `useStat200` / `lockOrigin` を後続対応する。
- [ ] `git-pseudo-squash` の `設定をクリア` で、手入力の `repoUrl` は消しつつ、URL 引数で渡された `repoUrl` は残すべきかを検討する。

## メモ

- 権威ある長文のバックログは、引き続きリポジトリルートの [`TODO.md`](/Users/igapyon/Documents/git/local-html-tools/TODO.md) に存在する。
- 具体的な作業を始める前に、ここへアクティブなタスクを追加または調整する。
