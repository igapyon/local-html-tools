# local-html-tools

このツール群は、お使いのコンピュータ上で直接動作する、一連のシンプルなHTMLファイルです。Static Web App（静的HTML/CSS/JSのみ）として構成され、サーバは不要です。各ツールは単一HTMLで完結して動作するのが売りです。基本の流れは「入力 → 生成 → （必要に応じて）実行結果貼り付け → 次のステップの生成」で、画面要素は上から下へ流れに沿って並びます。ツールによっては「入力 → 生成」だけで完結します。

各ツール（HTMLファイル）をウェブブラウザで開くと、専用の入力画面が表示されます。そこに必要な情報を入力するだけで、用途に応じたテキストや結果が自動的に作成されます。

## 前提条件

FFmpeg向けツールで生成されたコマンドを実行するには、お使いのコンピュータに [FFmpeg](https://ffmpeg.org/) がインストールされている必要があります。

## 主な特徴

*   **ローカル動作**: インターネット接続は不要で、お使いのPC内だけで完結します。
*   **簡単な操作**: ウェブブラウザでファイルを開き、情報を入力するだけでコマンドが手に入ります。
*   **効率化**: （FFmpeg系の場合）複雑なコマンドの構文を覚える必要がなく、手入力によるミスを防ぎます。

つまり、「**ウェブブラウザで動く、ローカルHTMLツール集**」と言えます。

## ffmpeg

FFmpegのコマンドラインを生成するツールです。

- **ffmpeg-concat-cmdline-gen.html**: 複数の.wavファイルを結合するためのコマンドを生成します。
- **ffmpeg-loudnorm-cmdline-gen.html**: ラウドネス測定結果を基に、ハイレゾ対応やモード切り替えを含んだ正規化コマンドを生成します。
- **ffmpeg-trim-cmdline-gen.html**: 音声/動画ファイルを切り出すためのコマンドを生成します。
- **ffmpeg-wav2m4a-cmdline-gen.html**: .wavファイルを.m4aファイルに変換するためのコマンドを生成します。
- **ffmpeg-youtube-mkv-gen.html**: .wav音声ファイルと静止画から、YouTube向けの動画(.mkv)コマンドを生成します。
- **ffmpeg-mp4-to-wav-gen.html**: .mp4ファイルから音声をWAVとして取り出すコマンドを生成します。
- **ffmpeg-replace-audio-with-wav-gen.html**: .mp4動画の音声をWAVに差し替えるコマンドを生成します。

## password

パスワード生成ツールです。

- **password-gen.html**: 選択した文字種と文字数でパスワードを生成します。

## GitHub Pages

GitHub Pages で公開する場合は `docs/index.html` が入口になります。ツール本体は `docs/ffmpeg/`（FFmpegおよび周辺ツール）と `docs/password/`（パスワード生成ツール）配下にあります。
公開URL: https://igapyon.github.io/local-html-tools/

## 将来の拡張

このプロジェクトは将来的に FFmpeg 以外のツール群にも対応する予定です。現状の FFmpeg 系ツールはその一部です。
