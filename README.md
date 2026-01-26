# local-html-tools

このツール群は、お使いのコンピュータ上で直接動作する、ブラウザで使えるローカル完結のStatic Web Appコレクションです。サーバ不要で、各ツールは単一HTMLで完結して動作します。基本の流れは「入力 → 生成 → （必要に応じて）実行結果貼り付け → 次のステップの生成」で、画面要素は上から下へ流れに沿って並びます。ツールによっては「入力 → 生成」だけで完結します。

各ツール（HTMLファイル）をウェブブラウザで開くと、専用の入力画面が表示されます。そこに必要な情報を入力するだけで、用途に応じたテキストや結果が自動的に作成されます。

## 前提条件

FFmpeg向けツールで生成されたコマンドを実行するには、お使いのコンピュータに [FFmpeg](https://ffmpeg.org/) がインストールされている必要があります。

## 主な特徴

*   **ローカル動作**: インターネット接続は不要で、お使いのPC内だけで完結します。
*   **簡単な操作**: ウェブブラウザでファイルを開き、情報を入力するだけで結果が手に入ります。
*   **1HTML完結**: ツールごとに単一HTMLで完結し、配布や保守が簡単です。
*   **UIルール**: 必須項目は赤い*、説明は?に集約、ボタン色は生成=緑／反映=青で統一します。

つまり、「**ウェブブラウザで動く、ローカルHTMLツール集**」と言えます。

## ffmpeg

FFmpegのコマンドラインを生成するツールです。

- **ffmpeg-concat-cmdline-gen.html**: 複数の.wavファイルを結合するためのコマンドを生成します。
- **ffmpeg-loudnorm-cmdline-gen.html**: ラウドネス測定結果を基に、ハイレゾ対応やモード切り替えを含んだ正規化コマンドを生成します。
- **ffmpeg-trim-cmdline-gen.html**: 音声/動画ファイルを切り出すためのコマンドを生成します。
- **ffmpeg-audio-convert-cmdline-gen.html**: 音声ファイルを指定の形式に変換するコマンドを生成します。
- **ffmpeg-youtube-mkv-gen.html**: .wav音声ファイルと静止画から、YouTube向けの動画(.mkv)コマンドを生成します。
- **ffmpeg-mp4-to-wav-gen.html**: .mp4ファイルから音声をWAVとして取り出すコマンドを生成します。
- **ffmpeg-replace-audio-with-wav-gen.html**: .mp4動画の音声をWAVに差し替えるコマンドを生成します。
- **ffmpeg-silence-detect-gen.html**: 無音区間検出のためのコマンドを生成します。

## link

URL加工系ツールです。

- **amazon-dp-extract.html**: Amazon URL から dp/ASIN を抽出します。
- **facebook-fbclid-remove.html**: URL から Facebook識別子（fbclid）を除去します。
- **url-encode-decode.html**: URLのエンコードとデコードを行います。
- **mime-base64.html**: MIME Base64のエンコードとデコードを行います。
- **utm-remove.html**: URL から utm_* パラメータを削除します。

## password

パスワード生成ツールです。

- **password-gen.html**: 選択した文字種と文字数でパスワードを生成します。

## grep

検索補助ツールです。

- **find-gen.html**: findコマンドの検索条件を生成します。

## img

画像系ツールです。

- **img2svg.html**: 画像からSVG化のための手順/素材を生成します。

## life

生活系ツールです。

- **forgot-items-check.html**: 忘れ物チェック用のリストを生成します。

## GitHub Pages

GitHub Pages で公開する場合は `docs/index.html` が入口になります。ツール本体は `docs/ffmpeg/`（FFmpegおよび周辺ツール）と `docs/password/`（パスワード生成ツール）配下にあります。
公開URL: https://igapyon.github.io/local-html-tools/

## Third-Party Notices

本プロジェクトで利用しているサードパーティソフトウェアとライセンスは `THIRD_PARTY_NOTICES.md` に記載しています。

## License

本リポジトリのライセンスは `LICENSE` を参照してください。

## 将来の拡張

このプロジェクトは将来的に FFmpeg 以外のツール群にも対応する予定です。現状の FFmpeg 系ツールはその一部です。
