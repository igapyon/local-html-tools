# AGENTS.md

このリポジトリは、ローカルで動作するHTMLツール集。現在はFFmpeg向けが中心だが、将来は他分野にも拡張予定。

## 概要
- ブラウザでHTMLを開いてフォーム入力すると、用途に応じたテキストや結果を生成。
- すべてローカル動作で、インターネット接続は不要（ただしFFmpeg本体は別途インストールが必要）。
- Static Web App（静的HTML/CSS/JSのみ）として構成され、サーバは不要。
- 各ツールは単一HTMLで完結して動作するのが売り。
- 基本の流れは「入力 → コマンド生成 → （必要に応じて）実行結果貼り付け → 次のステップのコマンド生成」で、画面要素は上から下へ流れに沿って並ぶ。
- ツールによっては「入力 → コマンド生成」だけで完結するものもある。
- ボタン色の方針: コマンド生成は緑、解析結果の反映は青（用途別に統一）。
- UIルール: 必須項目は赤いアスタリスク（*）で示し、説明は「?」にまとめる。
- PRテキスト作成時は `docs/index.html` の「更新日」も忘れずに更新する。
- PRテキスト作成は「特定のコミット以降の全変更」を求められる前提でまとめる（例: 「<コミット> 以降の変更内容全てのための PRテキスト」）。
- PRテキストの基本構成は「タイトル / 概要 / 変更点 / 影響」で統一する。

## 構成
- `docs/index.html` トップページ（ツール一覧へのリンクと簡易説明）。
- `docs/ffmpeg/` FFmpegおよび周辺ツールのHTMLが配置。
- `docs/git/` Git補助ツールのHTMLが配置。
- `docs/grep/` find検索ツールのHTMLが配置。
- `docs/img/` 画像系ツールのHTMLが配置。
- `docs/life/` 生活系ツールのHTMLが配置。
- `docs/link/` URL加工系ツールのHTMLが配置。
- `docs/password/` パスワード生成ツールのHTMLが配置。

## ツール一覧（docs/ffmpeg）
- `ffmpeg-concat-cmdline-gen.html` 複数の `.wav` を結合するためのコマンドを生成。
- `ffmpeg-loudnorm-cmdline-gen.html` loudnorm 測定結果に基づく正規化コマンドを生成（複数モード/ハイレゾ対応）。
- `ffmpeg-trim-cmdline-gen.html` `.wav` の切り出しコマンドを生成（開始/終了時刻指定）。
- `ffmpeg-audio-convert-cmdline-gen.html` 音声ファイルを指定の形式に変換するコマンドを生成。
- `ffmpeg-youtube-mkv-gen.html` 音声＋画像からYouTube向け `.mkv` を生成するコマンドを作成。
- `ffmpeg-mp4-to-wav-gen.html` `.mp4` から音声をWAVとして抽出するコマンドを生成。
- `ffmpeg-replace-audio-with-wav-gen.html` `.mp4` の音声をWAVへ差し替えるコマンドを生成。
- `ffmpeg-silence-detect-gen.html` 無音区間検出のためのコマンドを生成。

## ツール一覧（docs/git）
- `git-pseudo-squash.html` reset --soft で疑似的に1コミット化するコマンドを生成。
- `git-remote-branch-diff.html` リモート/ローカルのブランチ差分コマンドを生成。

## ツール一覧（docs/grep）
- `find-gen.html` findコマンドの検索条件を生成。

## ツール一覧（docs/img）
- `img2svg.html` 画像からSVG化のための手順/素材を生成。

## ツール一覧（docs/life）
- `forgot-items-check.html` 忘れ物チェック用のリストを生成。
- `japan-weather.html` 日本の天気情報（地域別）を確認。

## ツール一覧（docs/password）
- `password-gen.html` 文字種と文字数を指定してパスワードを生成。

## ツール一覧（docs/link）
- `amazon-dp-extract.html` Amazon URL から dp/ASIN を抽出。
- `facebook-fbclid-remove.html` URL から Facebook識別子（fbclid）を除去。
- `url-encode-decode.html` URLのエンコードとデコードを行う。
- `mime-base64.html` MIME Base64のエンコードとデコードを行う。
- `utm-remove.html` URL から utm_* パラメータを削除する。
