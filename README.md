# local-html-tools

このツール群は、お使いのコンピュータ上で直接動作する、ブラウザで使えるローカル完結のStatic Web Appコレクションです。サーバ不要で、各ツールは単一HTMLで完結して動作します。基本の流れは「入力 → 生成 → （必要に応じて）実行結果貼り付け → 次のステップの生成」で、画面要素は上から下へ流れに沿って並びます。ツールによっては「入力 → 生成」だけで完結します。

各ツール（HTMLファイル）をウェブブラウザで開くと、専用の入力画面が表示されます。そこに必要な情報を入力するだけで、用途に応じたテキストや結果が自動的に作成されます。

## 関連README

- [MD3リファレンス](md3/README.md)
- [GitツールREADME](docs/git/README.md)
- [PasswordツールREADME](docs/password/README.md)
- [PromptツールREADME](docs/prompt/README.md)
- [Musicビルドプロセス](docs/music/BUILD_PROCESS.md)

## LLM開発ドキュメント

- `llmdocs/` は LLM支援開発向けの継続的な記憶レイヤーです
- 初回確認の導線:
  - [Project Context](llmdocs/CONTEXT.md)
  - [Architecture](llmdocs/ARCHITECTURE.md)
  - [Current State](llmdocs/STATE.md)
  - [Task List](llmdocs/TODO.md)
  - [Current Session](llmdocs/SESSION.md)
- 運用ルールは [Development Rules](llmdocs/RULES.md) を参照してください
- TODO の使い分け:
  - ルート `TODO.md` は中長期バックログ
  - `llmdocs/TODO.md` は直近で実際に動かす作業キュー

## 前提条件

- FFmpeg向けツールで生成されたコマンドを実行するには、お使いのコンピュータに [FFmpeg](https://ffmpeg.org/) がインストールされている必要があります。
- Japan Weather は天気情報の取得で外部と通信します（オンライン取得）。

## 主な特徴

*   **ローカル動作**: お使いのPC内で動作し、サーバは不要です。
*   **簡単な操作**: ウェブブラウザでファイルを開き、情報を入力するだけで結果が手に入ります。
*   **1HTML完結**: ツールごとに単一HTMLで完結し、配布や保守が簡単です。
*   **完全オフライン化**: CSSやJavaScriptライブラリは必要最小限に留め、外部CDNへの依存をベンダリング（自前実装）で排除しています。
*   **UIルール**: 必須項目は赤い*、説明は?に集約、ボタン色は生成=緑／反映=青で統一します。

つまり、「**ウェブブラウザで動く、ローカルHTMLツール集**」と言えます。

## 開発・運用ガイド

### 基本方針

- ブラウザでHTMLを開いてフォーム入力すると、用途に応じたテキストや結果を生成
- 基本はローカル動作で、インターネット接続は不要（※一部ツールはオンライン取得あり）
- Static Web App（静的HTML/CSS/JSのみ）として構成され、サーバは不要
- 各ツールは単一HTMLで完結して動作
- ただし `docs/music/` は保守性確保のため「分割ソースをビルドして単一HTMLを生成」する例外運用を採用
- `docs/grep/find-gen.html` も保守性確保のため「分割ソースをビルドして単一HTMLを生成」運用を採用
- `docs/diagram/*.html` も保守性確保のため「分割ソースをビルドして単一HTMLを生成」運用を採用
- `docs/ffmpeg/*.html` も保守性確保のため「分割ソースをビルドして単一HTMLを生成」運用を採用
- `docs/life/*.html` は `*-src.html` を編集し、ビルドで `*.html` を生成する運用を採用
- `docs/link/*.html` は `*-src.html` を編集し、ビルドで `*.html` を生成する運用を採用
- `docs/prompt/*.html` も保守性確保のため「分割ソースをビルドして単一HTMLを生成」運用を採用
- `docs/text/*.html` は `*-src.html` を編集し、ビルドで `*.html` を生成する運用を採用
- `docs/img/*.html` は `*-src.html` を編集し、ビルドで `*.html` を生成する運用を採用
- `docs/index.html` も `docs/index-src.html` から生成する運用を採用
- ビルド基盤は `scripts/build-*.mjs` ベースで運用し、配布形態は引き続き単一HTMLを維持する
- `lht-cmn/` はリポジトリ直下を正本として扱う（`docs/` 配下へ複製しない）
- `scripts/lib/single-html.mjs` で `*-src.html` のローカル `link/script src` をインライン化し、配布用 `*.html` は外部依存なしの単一HTMLとして生成する
- Material Web を採用する場合でも、画面で `md-*` を直接ばらで使うより、原則 `lht-cmn` に `lht-*` として抽象化してから適用する
- 基本の流れ：「入力 → 生成 → （必要に応じて）実行結果貼り付け → 次のステップの生成」で、画面要素は上から下へ流れに沿って並ぶ
- ツールによっては「入力 → 生成」だけで完結するものもある
- **ベンダリング**: CSSフレームワークなどの外部CDN依存をできる限り排除し、必要な機能は自前で実装して完全オフライン化を実現しています
- **仕様書の命名**: 各 `*.html` に対応する仕様書は同一ディレクトリに `*-spec.md` で配置する（例: `git-pseudo-squash.html` ↔ `git-pseudo-squash-spec.md`）

### LHT中心方針（重要）

- UI方針の正本は `lht-cmn/README.md` とする
- 本READMEでは要点のみ扱う:
  - 画面側は原則 `lht-*` を利用する
  - Material Web は `lht-cmn` 内部実装として優先利用する
  - 詳細な適用ルール/コンポーネント仕様は `lht-cmn/README.md` を参照する

### LHT完結方針（将来計画）

- `lht-*` を画面側の公開UI層として維持し、実装詳細は `lht-cmn` へ集約する
- `md3/` は段階的にリファレンス用途へ縮退し、実運用スタイルは `lht-cmn` に集約する
- 背景・狙い・運用詳細は `lht-cmn/README.md` を参照する

### UI設計ルール

- **ボタン色**: コマンド生成は緑、解析結果の反映は青（用途別に統一）
- **必須項目**: 赤いアスタリスク（`*`）で示す
- **説明**: 「`?`」のツールチップにまとめる
- **タイトル説明の運用**: 各HTMLのタイトル右に「`?`」の説明を置く方針にし、その文言を `docs/index.html` のホバー説明へ転記する

### プロジェクト構成

```
docs/
├── index.html           # トップページ（ツール一覧へのリンク）
├── diagram/             # 図表系ツール
├── knowledge-timeline/  # 知識タイムライン系ツール
├── music/               # 楽譜変換系ツール
│   ├── *-src.html       # music向け開発テンプレート（手編集対象）
│   ├── *.html           # music向け配布用生成物（手編集しない）
│   └── src/             # music向け分割ソース（css/ts/js）
├── ffmpeg/              # FFmpegおよび周辺ツール
├── git/                 # Git補助ツール
├── grep/                # 検索補助ツール
├── img/                 # 画像系ツール
├── prompt/              # 生成AI向けプロンプト作成支援ツール
├── text/                # テキスト系ツール
├── life/                # 生活系ツール
├── link/                # URL加工系ツール
├── project/             # MS Project XML 入出力実験ツール
├── xlsx2md/             # 独立前の xlsx2md 関連資料・実装控え
└── password/            # パスワード生成ツール
```

### music 例外運用（分割開発）

- 対象: `docs/music/` 配下
- 配布: `*.html`（単一HTML、生成物）
- 開発: `*-src.html` + `src/css/*.css` + `src/ts/*.ts` + `src/js/*.js`
- ビルド: `npm run build:music`（`scripts/build-music.mjs`）
- 型チェック: `npm run typecheck:music`（`typescript` 導入後）
- ルール:
  - `*.html` は直接編集しない
  - 変更は `*-src.html` と `src/` を編集する
  - PRには生成済み `*.html` を含める

### grep 例外運用（分割開発）

- 対象: `docs/grep/find-gen.html`
- 配布: `docs/grep/find-gen.html`（単一HTML、生成物）
- 開発: `docs/grep/find-gen-src.html` + `docs/grep/src/find-gen/css/app.css` + `docs/grep/src/find-gen/js/main.js`
- ビルド: `npm run build:grep`（`scripts/build-grep.mjs`）
- ルール:
  - `docs/grep/find-gen.html` は直接編集しない
  - 変更は `find-gen-src.html` と `src/find-gen/` を編集する
  - PRには生成済み `docs/grep/find-gen.html` を含める

### diagram 例外運用（分割開発）

- 対象: `docs/diagram/mermaid-to-svg.html`, `docs/diagram/graphviz-dot-to-svg.html`
- 配布: `docs/diagram/*.html`（単一HTML、生成物）
- 開発:
  - `docs/diagram/mermaid-to-svg-src.html` + `docs/diagram/src/mermaid-to-svg/css/app.css` + `docs/diagram/src/mermaid-to-svg/js/main.js`
  - `docs/diagram/graphviz-dot-to-svg-src.html` + `docs/diagram/src/graphviz-dot-to-svg/css/app.css` + `docs/diagram/src/graphviz-dot-to-svg/js/main.js`
- ビルド: `npm run build:diagram`（`scripts/build-diagram.mjs`）
- ルール:
  - `docs/diagram/*.html` は直接編集しない
  - 変更は `*-src.html` と `src/` 配下を編集する
  - PRには生成済み `docs/diagram/*.html` を含める

### ffmpeg 例外運用（分割開発）

- 対象: `docs/ffmpeg/*.html`
- 配布: `docs/ffmpeg/*.html`（単一HTML、生成物）
- 開発:
  - `docs/ffmpeg/*-src.html`
  - `docs/ffmpeg/src/*/css/app.css`
  - `docs/ffmpeg/src/*/js/main.js`
- ビルド: `npm run build:ffmpeg`（`scripts/build-ffmpeg.mjs`）
- ルール:
  - `docs/ffmpeg/*.html` は直接編集しない
  - 変更は `*-src.html` と `src/` 配下を編集する
  - PRには生成済み `docs/ffmpeg/*.html` を含める

### life 運用（src編集 + 生成）

- 対象: `docs/life/*.html`
- 配布: `docs/life/*.html`（単一HTML、生成物）
- 開発: `docs/life/*-src.html`
- ビルド: `npm run build:life`（`scripts/build-life.mjs`）
- ルール:
  - `docs/life/*.html` は直接編集しない
  - 変更は `*-src.html` を編集する
  - PRには生成済み `docs/life/*.html` を含める

### link 運用（src編集 + 生成）

- 対象: `docs/link/*.html`
- 配布: `docs/link/*.html`（単一HTML、生成物）
- 開発: `docs/link/*-src.html`
- ビルド: `npm run build:link`（`scripts/build-link.mjs`）
- ルール:
  - `docs/link/*.html` は直接編集しない
  - 変更は `*-src.html` を編集する
  - PRには生成済み `docs/link/*.html` を含める

### prompt 例外運用（分割開発）

- 対象: `docs/prompt/prompt-gen.html`
- 配布: `docs/prompt/prompt-gen.html`（単一HTML、生成物）
- 開発:
  - `docs/prompt/prompt-gen-src.html`
  - `docs/prompt/src/prompt-gen/css/app.css`
  - `docs/prompt/src/prompt-gen/ts/prompt-definitions.ts`
  - `docs/prompt/src/prompt-gen/ts/main.ts`
  - `docs/prompt/tests/prompt-gen-main.test.js`
- ビルド: `npm run build:prompt`（`scripts/build-prompt.mjs`）
- ルール:
  - `docs/prompt/prompt-gen.html` は直接編集しない
  - 変更は `prompt-gen-src.html` と `src/prompt-gen/` 配下を編集する
  - `scripts/build-prompt.mjs` は `ts -> js` を行ってから single-file の `prompt-gen.html` を生成する
  - PRには生成済み `docs/prompt/prompt-gen.html` を含める

### text 運用（src編集 + 生成）

- 対象: `docs/text/*.html`
- 配布: `docs/text/*.html`（単一HTML、生成物）
- 開発: `docs/text/*-src.html`
- ビルド: `npm run build:text`（`scripts/build-text.mjs`）
- ルール:
  - `docs/text/*.html` は直接編集しない
  - 変更は `*-src.html` を編集する
  - PRには生成済み `docs/text/*.html` を含める

### project 運用（src編集 + 生成）

- 対象: `docs/project/mikuproject.html`
- 配布: `docs/project/mikuproject.html`（単一HTML、生成物）
- 開発:
  - `docs/project/mikuproject-src.html`
  - `docs/project/src/mikuproject/css/app.css`
  - `docs/project/src/mikuproject/ts/*.ts`
  - `docs/project/tests/mikuproject-main.test.js`
  - `docs/project/mikuproject-spec.md`
  - `docs/project/mikuproject-gap-notes.md`
- ビルド: `npm run build:project`（`scripts/build-project.mjs`）
- ルール:
  - `docs/project/mikuproject.html` は直接編集しない
  - 変更は `mikuproject-src.html` と `src/mikuproject/` 配下を編集する
  - `scripts/build-project.mjs` は `ts -> js` を行ってから single-file の `mikuproject.html` を生成する
  - PRには生成済み `docs/project/mikuproject.html` を含める

### img 運用（src編集 + 生成）

- 対象: `docs/img/*.html`
- 配布: `docs/img/*.html`（単一HTML、生成物）
- 開発: `docs/img/*-src.html`
- ビルド: `npm run build:img`（`scripts/build-img.mjs`）
- ルール:
  - `docs/img/*.html` は直接編集しない
  - 変更は `*-src.html` を編集する
  - PRには生成済み `docs/img/*.html` を含める

### docs/index 運用（src編集 + 生成）

- 対象: `docs/index.html`
- 配布: `docs/index.html`（単一HTML、生成物）
- 開発: `docs/index-src.html`
- ビルド: `npm run build:docs`（`scripts/build-docs-index.mjs`）
- ルール:
  - `docs/index.html` は直接編集しない
  - 変更は `docs/index-src.html` を編集する
  - PRには生成済み `docs/index.html` を含める

### password 運用（src編集 + 生成）

- 対象: `docs/password/password-gen.html`
- 配布: `docs/password/password-gen.html`（単一HTML、生成物）
- 開発:
  - `docs/password/password-gen-src.html`
  - `docs/password/src/password-gen/css/app.css`
  - `docs/password/src/password-gen/js/main.js`
- ビルド: `npm run build:password`（`scripts/build-password.mjs`）
- ルール:
  - `docs/password/password-gen.html` は直接編集しない
  - 変更は `password-gen-src.html` と `src/password-gen/` 配下を編集する
  - PRには生成済み `docs/password/password-gen.html` を含める

### knowledge-timeline 運用（src編集 + 生成）

- 対象: `docs/knowledge-timeline/composers.html`
- 配布: `docs/knowledge-timeline/composers.html`（単一HTML、生成物）
- 開発:
  - `docs/knowledge-timeline/composers-src.html`
  - `docs/knowledge-timeline/src/composers/css/app.css`
  - `docs/knowledge-timeline/src/composers/js/*.js`
- ビルド: `npm run build:knowledge-timeline`（`scripts/build-knowledge-timeline.mjs`）
- ルール:
  - `docs/knowledge-timeline/composers.html` は直接編集しない
  - 変更は `composers-src.html` と `src/composers/` 配下を編集する
  - PRには生成済み `docs/knowledge-timeline/composers.html` を含める

#### ffmpeg の lht 共通部品 置換済み範囲

- 全8ページ適用済み:
  - 右上メニュー: `lht-page-menu`
  - コマンド表示 + コピー: `lht-command-block`
- 入力フィールド置換（進行中）:
  - `lht-text-field-help`: 全ページで適用済み
  - `lht-select-help`: `ffmpeg-audio-convert-cmdline-gen` / `ffmpeg-mp4-to-wav-gen` / `ffmpeg-replace-audio-with-wav-gen`
  - `lht-switch-help`: `ffmpeg-loudnorm-cmdline-gen` / `ffmpeg-replace-audio-with-wav-gen`
- 実装メモ:
  - `lht-text-field-help` は `min` / `max` / `step` 属性透過に対応
  - 既存JS互換のため `lht-switch-help` 内部 `md-switch` は `checked` プロパティでも参照可能

### PR作成時のルール

- `docs/index-src.html` を変更した場合は `npm run build:docs` を実行し、生成済み `docs/index.html` をPRに含める
- PRテキスト作成は「特定のコミット以降の全変更」を求められる前提でまとめる
  - 例：「`<コミット>` 以降の変更内容全てのための PRテキスト」
- PRテキストの基本構成は「タイトル / 概要 / 変更点 / 影響」で統一する
- 開発フローは「変更 → 動作/見た目を確認 → LGTMが出たらコミット」を基本とする

### ローカル確認の注意（重要）

- 変更確認時は、必ず「手元のローカルファイル」を開いていることを確認する
- GitHub Pages 公開版（`https://igapyon.github.io/local-html-tools/`）と、ローカル作業中の画面を混同しない
- 見た目確認の前に、ブラウザのURLがローカルファイル（`file://.../docs/index.html` など）かを毎回チェックする
- 公開版と比較する場合は、タブ名やウィンドウを分けて明示的に見分ける

### 生成AIエージェント向け重要事項

- **GitHub CLI不使用**: `gh` コマンドは使用しないでください。Bash の `git` コマンドで対応してください
- ユーザーが `LGTM` と明示した変更は、追加確認を挟まず commit まで進める
- このプロジェクトを編集・拡張する際は、上記の基本方針、UI設計ルール、構成、PRルールに従ってください

## ffmpeg

FFmpegのコマンドラインを生成するツールです。コマンド主体に見えますが、実際は「順を追って実行 → 結果を貼り付け → 次のコマンドを生成」というユースケースの流れに沿って設計されています。

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
- **url-memo.html**: URL とメモをローカルで一覧管理し、検索起点で再利用しやすくします。
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

- **img2svg.html**: 画像ファイルをSVGに変換してダウンロードします。

## diagram

図表系ツールです。

- **mermaid-to-svg.html**: Mermaid記法からSVGを生成し、SVGを保存します。
- **graphviz-dot-to-svg.html**: Graphviz DOT記法からSVGを生成し、SVGを保存します。

## music

楽譜変換系ツールです。

- **musicxml-to-svg.html**: MusicXMLから楽譜SVGを生成し、SVGを保存します。
- **musicxml-to-abc.html**: MusicXMLをABC記法へ変換し、ABCを保存します。
- **abc-to-musicxml.html**: ABC記法をMusicXMLへ変換し、MusicXMLを保存します。
- **musicxml-to-midi.html**: MusicXMLをMIDIへ変換し、.midを保存します。
- **midi-to-musicxml.html**: MIDIをMusicXMLへ変換します。

## text

テキスト系ツールです。

- **text-viewer.html**: テキストをペーストして、読みやすく表示します。マークダウン形式にも対応しています。
- **text-processing.html**: テキストを即時に変換・整形します。文字変換、行変換、空白変換を組み合わせて使えます。
- **file-rename-cmdline-gen.html**: ファイル名リストから連番リネーム用のコマンドを生成します。
- **text2spreadsheetml.html**: ベタテキスト、CSV、TAB区切りファイルを SpreadsheetML 2003 XML に変換します。
- **japanese-romaji-guide.html**: 日本語ローマ字表記のメモを確認できます。

## xlsx2md

`xlsx2md` は、このリポジトリから独立して運用するようになりました。  
現在の正本リポジトリは <https://github.com/igapyon/xlsx2md> です。  
このリポジトリ上の `docs/xlsx2md/` には、移行案内用の `README.md` のみを残しています。  
独立前は `docs/xlsx2md/` に配置し、`text` カテゴリから分離して運用していました。

## life

生活系ツールです。

- **forgot-items-check.html**: 忘れ物チェック用のリストを生成します。
- **japan-weather.html**: 日本の天気情報（地域別）を確認できます（オンライン取得）。

## knowledge-timeline

知識を時系列で俯瞰するツールです。

- **composers.html**: クラシック作曲家の生没年・主要作品・時代背景を同一時間軸で確認できます。

## git

Git補助ツールです。

- コマンドから入るのではなく、まずユースケース（やりたいこと）を明確化し、流れに沿って必要なコマンドを並べる方針です。
- **git-pseudo-squash.html**: reset --soft で疑似的に1コミット化するコマンドを生成します。複数行のコミットメッセージに対応し、内容は一時ファイルに書き込んで git commit -F で渡します。
- **git-branch-diff.html**: ブランチ差分コマンドを生成します。
- **git-work-list.html**: 複数リポジトリと複数作業の組み合わせを一覧管理し、比較や squash への導線もまとめて扱えます。
- **git-config-setup.html**: Gitのユーザー名とメールアドレスを設定するコマンドを生成します。
- **git-config-advanced-setup.html**: core.autocrlfやpush.defaultなどの詳細設定をコマンドで生成します。

## GitHub Pages

GitHub Pages で公開する場合は `docs/index.html` が入口になります。ツール本体は `docs/diagram/`、`docs/knowledge-timeline/`、`docs/music/`、`docs/ffmpeg/`、`docs/git/`、`docs/link/`、`docs/password/`、`docs/grep/`、`docs/img/`、`docs/text/`、`docs/life/`、`docs/prompt/`、`docs/project/` 配下にあります。  
公開URL: https://igapyon.github.io/local-html-tools/

## Third-Party Notices

本プロジェクトで利用しているサードパーティソフトウェアとライセンスは `THIRD_PARTY_NOTICES.md` に記載しています。

## License

本リポジトリのライセンスは `LICENSE` を参照してください。

## ツール群の構成

本プロジェクトは複数カテゴリのツールで構成されており、Diagram、FFmpeg、Git、リンク管理、パスワード、grep、画像、生活系などが並列に含まれます。FFmpeg 系ツールはその一部です。
