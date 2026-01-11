# AGENTS.md

このリポジトリは、ローカルで動作するHTMLツール集。現在はFFmpeg向けが中心だが、将来は他分野にも拡張予定。

## 概要
- ブラウザでHTMLを開いてフォーム入力すると、FFmpegのコマンド文字列を生成。
- すべてローカル動作で、インターネット接続は不要（ただしFFmpeg本体は別途インストールが必要）。
- Static Web App（静的HTML/CSS/JSのみ）として構成され、サーバは不要。

## 構成
- `docs/index.html` トップページ（ツール一覧へのリンクと簡易説明）。
- `docs/ffmpeg/` 各種コマンド生成ツールのHTMLが配置。

## ツール一覧（docs/ffmpeg）
- `ffmpeg-concat-cmdline-gen.html` 複数の `.wav` を結合するためのコマンドを生成。
- `ffmpeg-loudnorm-cmdline-gen.html` loudnorm 測定結果に基づく正規化コマンドを生成（複数モード/ハイレゾ対応）。
- `ffmpeg-trim-cmdline-gen.html` `.wav` の切り出しコマンドを生成（開始/終了時刻指定）。
- `ffmpeg-wav2m4a-cmdline-gen.html` `.wav` を `.m4a` に変換するコマンドを生成（ビットレート選択）。
- `ffmpeg-youtube-mkv-gen.html` 音声＋画像からYouTube向け `.mkv` を生成するコマンドを作成。
- `ffmpeg-mp4-to-wav-gen.html` `.mp4` から音声をWAVとして抽出するコマンドを生成。
- `ffmpeg-replace-audio-with-wav-gen.html` `.mp4` の音声をWAVへ差し替えるコマンドを生成。
