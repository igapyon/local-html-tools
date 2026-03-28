# TODO

このファイルは、リポジトリ全体の中長期バックログを管理する。

- 直近で着手する数件は `llmdocs/TODO.md` に置く
- 完了済みの記録は `llmdocs/SESSION.md` または `llmdocs/STATE.md` に寄せる
- ここには「未着手または継続検討中の項目」だけを残す
- 独立済みプロジェクトの詳細タスクは、このファイルへ戻さない

## 最優先バックログ

- [ ] `lht-cmn` の横展開を継続し、`toast` / `error` / `file select` / `input mode toggle` / `preview output` / `command block` の重複実装を残存アプリから減らす
- [ ] 表示制御ルールを整理し、`md-hidden` / `md-visible` 依存を `active` と `show/hide` 系 API へ段階移行する
- [ ] `lht-text-field-help` の trailing action API を、現行の暫定 `clearable` を超えて正式設計する
- [ ] `git-work-list` で Material Web の `md-outlined-text-field` / `md-outlined-select` が `translateY(NaNpx) scale(NaN)` 警告を出す件を切り分け、無視継続か修正かを決める
- [ ] 狭幅画面でのはみ出し問題の残件を、個別パッチではなく共有 `lht` ルール優先で潰す

## プロダクト改善

- [ ] `prompt-gen` の `生成AIで整理` 導線を、外部 URL ではなく `local-html-tools` 内の内部導線として扱う形へ見直す
- [ ] `prompt-gen` のユーザー追加定義機能について、初版スコープ、保存形式、検証ルール、削除導線を固める
- [ ] `ffmpeg-youtube-mkv-gen` を YouTube 専用命名から汎用寄りへ再設計し、名前・説明・出力プリセットを整理する
- [ ] `ffmpeg` 系で、入力だけで確定できるツールは生成ボタン省略と自動更新へ寄せられるかを見直す

## 新規ツール案

- [ ] EXIF / メタデータ確認補助ツールを追加する
- [ ] 圧縮・解凍コマンド生成ツールを追加する
- [ ] PDF 画像抽出補助ツールを追加する
- [ ] ネットワーク・プロセス・ポート調査補助ツールを追加する
- [ ] SSH / SCP / rsync など安全寄りの接続・転送補助ツールを追加する
- [ ] OpenSSL / curl / ffprobe / mediainfo / ImageMagick / sox / sed / awk など、既存方針に合う補助ツールを選定して段階追加する

## 後回し

- [ ] `docker` / `docker compose` 系の補助ツールは後回しとする

## 方針メモ

- [ ] `md3/` は段階的に参照用途へ縮退し、実運用スタイルは `lht-cmn` に集約する
- [ ] 新規実装は `lht-cmn` コンポーネントと共通ルール準拠を前提とし、既存画面は触るタイミングで順次置換する
- [ ] `md-icon-btn--prominent` はまず class で使い始め、Web Components 側の属性対応は複数箇所で必要になった時点で追加検討する

## 範囲外メモ

- [ ] `xlsx2md` は独立済みのため、詳細タスクは移管先で管理する
