# TODO

開発者向けのコマンドライン補助ツール（ローカルHTML）のアイデア:

- exiftool: 写真のEXIF確認
- tar/zip/7z: 圧縮・解凍コマンド生成
- pdfimages: PDFから画像抽出コマンド生成
- nmap: ネットワーク上の公開システムを探すコマンド生成
- pom.xml （自分の作り方）を生成するツール。mkdir つき。
- python -m http.server など簡易サーバ起動コマンド生成
- ps/lsof/netstat/ss でプロセス/ポート調査コマンド生成
- ssh: 安全な接続コマンド生成
- rsync: 安全な同期コマンド生成（除外ルールテンプレ生成・.gitignore連携も）
- scp: 安全な転送コマンド生成
- openssl: 鍵/証明書生成コマンドの雛形、署名/ハッシュ生成の補助（sha256sum相当含む）
- ffprobe/mediainfo系: 解析結果から次のコマンドを組み立てる補助
- curl: APIリクエスト作成（ヘッダ/JSON/認証付き）
- ImageMagick/sox: 画像/音声変換のパラメータ生成（バッチリサイズ/ウォーターマーク）
- regex/sed/awk: 文字列変換テンプレの生成
- [後まわし] docker/docker-compose: よくある起動・開発用コマンド生成
- 各HTMLのタイトル右に「?」説明を置く方針に統一し、その文言を docs/index.html のホバー説明へ転記する対応を実施
- [優先度高] タイトルに「?」が未設置のHTML一覧
- 対象: docs/ffmpeg/ffmpeg-audio-convert-cmdline-gen.html
- 対象: docs/ffmpeg/ffmpeg-concat-cmdline-gen.html
- 対象: docs/ffmpeg/ffmpeg-loudnorm-cmdline-gen.html
- 対象: docs/ffmpeg/ffmpeg-mp4-to-wav-gen.html
- 対象: docs/ffmpeg/ffmpeg-replace-audio-with-wav-gen.html
- 対象: docs/ffmpeg/ffmpeg-silence-detect-gen.html
- 対象: docs/ffmpeg/ffmpeg-trim-cmdline-gen.html
- 対象: docs/ffmpeg/ffmpeg-youtube-mkv-gen.html
- 対象: docs/index.html
- 対象: docs/life/forgot-items-check.html
- 対象: docs/life/japan-weather.html
- 対象: docs/link/amazon-dp-extract.html
- 対象: docs/link/facebook-fbclid-remove.html
- 対象: docs/link/mime-base64.html
- 対象: docs/link/url-encode-decode.html
- 対象: docs/link/utm-remove.html
- 対象: docs/text/text-viewer.html
- [検討] `docs/index.html` のカード構造を JSON データ化し、画面構築時に展開する方式へ移行できるか確認する
- [検討] ドロップダウン項目（`md-select-option`）の生成ロジックを `lht-cmn/js/components.js` 側へ共通化し、各画面の個別JS実装を減らせるか確認する
- [検討] `lht-cmn/js/components.js` の読み込み順依存を減らす（現在は `defer` 統一で回避）。将来的に `lht-help-select` 側でも子 `option` 後着を吸収できるか検討する
- [既存バグ] `docs/text/text-processing.html` の入力欄で、文字入力後にスペースを連打すると `.`（ピリオド）が自動挿入される
  - 不要な自動挿入のため、発生条件を切り分けて無効化する（ブラウザ/OSの自動補正影響も確認）
- [music] `docs/music/musicxml-to-midi.html` に、ダウンロードせずその場でMIDI再生できる機能を追加する
- [music] `docs/music/*` の「ファイルを選択」操作を、Material Design のよくあるパターン（Filled ボタン + 選択ファイル名表示）で目立たせる

# DONE

- [優先度高] タイトルに「?」が未設置のHTML一覧（対応済み分）
- 対象: docs/grep/find-gen.html
- 対象: docs/img/img2svg.html
- 対象: docs/password/password-gen.html
