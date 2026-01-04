# AGENTS.md

このリポジトリは、ローカルで動作するFFmpegコマンド生成用のHTMLツール集。

## 概要
- ブラウザでHTMLを開いてフォーム入力すると、FFmpegのコマンド文字列を生成。
- すべてローカル動作で、インターネット接続は不要（ただしFFmpeg本体は別途インストールが必要）。

## 構成
- `index.html` トップページ（ツール一覧へのリンクと簡易説明）。
- `cmdline-gen/` 各種コマンド生成ツールのHTMLが配置。

## ツール一覧（cmdline-gen）
- `ffmpeg-concat-cmdline-gen.html` 複数の `.wav` を結合するためのコマンドを生成。
- `ffmpeg-loudnorm-cmdline-gen.html` loudnorm 測定結果に基づく正規化コマンドを生成（複数モード/ハイレゾ対応）。
- `ffmpeg-trim-cmdline-gen.html` `.wav` の切り出しコマンドを生成（開始/終了時刻指定）。
- `ffmpeg-wav2m4a-cmdline-gen.html` `.wav` を `.m4a` に変換するコマンドを生成（ビットレート選択）。
- `ffmpeg-youtube-mkv-gen.html` 音声＋画像からYouTube向け `.mkv` を生成するコマンドを作成。
