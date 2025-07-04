# local-html-tools

このツール群は、お使いのコンピュータ上で直接動作する、一連のシンプルなHTMLファイルです。

各ツール（HTMLファイル）をウェブブラウザで開くと、専用の入力画面が表示されます。そこにファイル名などの必要な情報を入力するだけで、FFmpegで使えるコマンドラインのテキストが自動的に作成されます。

## 前提条件

このツールによって生成されたコマンドを実行するには、お使いのコンピュータに [FFmpeg](https://ffmpeg.org/) がインストールされている必要があります。

## 主な特徴

*   **ローカル動作**: インターネット接続は不要で、お使いのPC内だけで完結します。
*   **簡単な操作**: ウェブブラウザでファイルを開き、情報を入力するだけでコマンドが手に入ります。
*   **効率化**: FFmpegの複雑なコマンドの構文を覚える必要がなく、手入力によるミスを防ぎます。

つまり、「**ウェブブラウザで動く、FFmpegコマンドの自動生成ツール**」と言えます。

## cmdline-gen

FFmpegのコマンドラインを生成するツールです。

- **ffmpeg-concat-cmdline-gen.html**: 複数の.wavファイルを結合するためのコマンドを生成します。
- **ffmpeg-loudnorm-cmdline-gen.html**: .wavファイルの音量を正規化するためのコマンドを生成します。
- **ffmpeg-trim-cmdline-gen.html**: .wavファイルを切り出すためのコマンドを生成します。
- **ffmpeg-wav2m4a-cmdline-gen.html**: .wavファイルを.m4aファイルに変換するためのコマンドを生成します。
- **ffmpeg-youtube-mkv-gen.html**: 音声ファイルと画像ファイルからYouTubeにアップロードするための動画ファイルを生成します。