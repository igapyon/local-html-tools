# xlsx2md

`xlsx2md` は、Excel (`.xlsx`) ファイルをローカルで読み込み、Markdown へ変換するための独立カテゴリです。

現時点では、仕様・実装・自動テストをこの配下で独立して進めています。

## 現在の状態

- `.xlsx` をブラウザ内で読み込み、全シートを自動で Markdown 化できる
- 出力モードとして `display / raw / both` を切り替えられる
- 画像、表、地の文、リスト、セクション分割を扱う
- 数式は `cached value` 優先で、必要時のみ自前 evaluator が補完する
- fixture と `local-data` を使った検証を継続している

## 主な特徴

- 変換対象は常に全シート
- `.xlsx` 選択後に自動で Markdown 生成まで進む
- Markdown を主表示とし、解析系 UI は補助情報として扱う
- 保存ファイル名は安全側へサニタイズする
- レイアウト中心シートは、見た目再現ではなく `セクション / 表 / リスト / 画像` へ分解して扱う

## 方針

- 配置は `docs/xlsx2md/` とし、既存の `docs/text/` には入れない
- 入出力はブラウザ内で完結し、サーバ送信を前提にしない
- 最初の用途は「Excel 設計書を Markdown へ変換する」に置く
- 配布形態は Single-file Web App とする
- UI は `lht-cmn/` を利用する
- 実装の正本ソースは TypeScript とする
- 自動テストを前提とする
- 出力モードは `display / raw / both` を扱えるようにする
- `raw` / `both` で保存する Markdown や ZIP は、ファイル名にモードサフィックスを付けて区別できるようにする
- `Markdown+assets ZIP保存` は、既定で `連結 Markdown 1 本 + assets/` の構成とする
- 保存ファイル名は安全側へサニタイズし、シート名の空白や一部記号をそのまま使わないことがある
- 表候補外の縦並び短文は、地の文として連結せず箇条書きへ変換することがある
- レイアウト中心シートは、見た目再現ではなく `セクション / 表 / リスト / 画像` へ分解して扱う
- 空欄の多いフォーム風の罫線領域は、現時点では情報脱落を避けるため表として残すことがある。一方で、横に広く疎なフォーム領域は表候補から外して地の文やセクションへ寄せることもある
- 数式は `cached value` を優先し、自前 evaluator は未計算保存や欠損時の補助として扱う
- 数式診断では、`resolved / fallback / unsupported` に加えて、`cached / ast / legacy / formula` の解決経路を表示する
- 数式セルの `cached value` 判定は `<v>` 要素の有無を基準とし、`<v></v>` のような空文字キャッシュも `cached` として扱う

## 使い方

1. `xlsx2md.html` を開いて `.xlsx` ファイルを選択する
2. 読み込み後、自動で全シートの Markdown が生成される
3. 必要に応じて `display / raw / both` と変換オプションを調整し、Markdown または ZIP を保存する

## UI の考え方

- Markdown を主表示とし、解析サマリーはその下に置く
- `解析サマリー`
- `変換設定`
- `表候補スコア`
- `数式診断`
  はアコーディオンで普段は閉じる
- 診断系は通常利用では補助情報として扱う

## Markdown 出力上の補助識別子

- 全シート連結 Markdown では、各チャンク先頭に HTML コメントで一意識別子を付けてよい
- この識別子は分割 Markdown ファイル名そのものではなく、チャンク識別子として扱う
- コメント中の識別子は、連結 Markdown 内で元シート断片を追跡しやすくするための補助メタ情報である
- 例:

```markdown
<!-- workbook_001_SheetName -->
```

## 出力モード

- `display`: Excel の表示値寄りで Markdown を出力する標準モード
- `raw`: Excel 内部値を優先して Markdown を出力するモード
- `both`: 表示値を本文に出しつつ、必要に応じて `[raw=...]` を補助表示するモード

## モード選択の目安

- `display`: 人間が Excel を見ながら生成 AI と内容を共有したいとき
- `raw`: 内部値や未加工値を確認したいとき
- `both`: 表示値と内部値の差分を比較しながら確認したいとき

## 出力例

同じセルでも、出力モードによって次のように表現が変わります。

```markdown
date
display: 2024/1/1
raw: 45292
both: 2024/1/1 [raw=45292]

currency
display: ¥1,024,768
raw: 1024768
both: ¥1,024,768 [raw=1024768]

fraction
display: 3/4
raw: 0.75
both: 3/4 [raw=0.75]

formula-date
display: 2024/3/17
raw: 45368
both: 2024/3/17 [raw=45368]
```

## 保存名の扱い

- 保存ファイル名は Workbook 名、シート順、シート名から組み立てる
- シート名の空白や一部記号は、保存名では `_` に寄せることがある
- ZIP 保存時の Markdown は、シートごとの分割ではなく Workbook 単位の連結 Markdown 1 本を標準とする
- 例:
  - シート名 `A B-東京&大阪.01`
  - 保存名 `edge-weird-sheetname-sample01_001_A_B-東京_大阪.01.md`
  - 連結 Markdown 保存名 `edge-weird-sheetname-sample01.md`

## レイアウト中心シートの扱い

- `イベント プランナー`、`月間プランナー`、`老後資金プランナー` のようなレイアウト中心シートでは、巨大な 1 表へ吸い込まず `セクション / 表 / リスト / 画像` のまとまりを優先する
- 現在は最小実装として、縦方向に大きな空白がある場所でセクションを分け、Markdown 上では `---` で区切る
- セクション先頭の短い単行テキストは、見出し候補として `###` へ昇格することがある
- ただしフォーム風領域、カレンダー、ボード、ダッシュボードの完全再現はまだ対象外で、今後の改善余地として扱う

## 既知の制約

- `spill` / dynamic array は最小対応の段階で、`A1#` のような表現や runtime 入口はあるが、実データ fixture による十分な検証はこれから
- 配列定数や `space intersection` は最小対応済みだが、Excel 互換としてはまだ限定的
- フォーム風領域は現時点では保守的に扱う
  - 表として残す場合がある
  - 横に広く疎なものは narrative / section 側へ寄せる場合がある
- カレンダー / ボード / ダッシュボード系は、通常表としての自然な表現が難しく、現在は `セクション / 表 / リスト / 画像` への分解を優先している
- Excel 数式全体を完全再実装しているわけではなく、通常は `cached value` を主に使い、自前 evaluator は補助として働く

## 現在の構成イメージ

```text
docs/xlsx2md/
├── README.md
├── xlsx2md-spec.md
├── xlsx-formula-subset.md
├── xlsx2md-src.html
├── xlsx2md.html
├── references/
│   └── MS-XLSX-parser-grammar.abnf
├── src/
│   └── xlsx2md/
│       ├── css/
│       │   └── app.css
│       ├── ts/
│       │   ├── core.ts
│       │   ├── main.ts
│       │   └── formula/
│       │       ├── tokenizer.ts
│       │       ├── parser.ts
│       │       └── evaluator.ts
│       └── js/
│           ├── core.js
│           ├── main.js
│           └── formula/
│               ├── tokenizer.js
│               ├── parser.js
│               └── evaluator.js
├── tests/
│   ├── xlsx2md-main.test.js
│   ├── xlsx2md-formula-parser.test.js
│   └── fixtures/
│       ├── README.md
│       ├── display/
│       ├── merge/
│       ├── formula/
│       ├── narrative/
│       ├── image/
│       ├── named-range/
│       └── edge/
└── local-data/
    └── ...
```

仕様の詳細は [xlsx2md-spec.md](./xlsx2md-spec.md) を参照してください。

Excel 数式サブセットの設計メモは [xlsx-formula-subset.md](/Users/igapyon/Documents/git/local-html-tools/docs/xlsx2md/xlsx-formula-subset.md) を参照してください。

fixture 用 Excel ブックの作成メモは [tests/fixtures/README.md](/Users/igapyon/Documents/git/local-html-tools/docs/xlsx2md/tests/fixtures/README.md) を参照してください。

git に入れない実データや一時検証用の `.xlsx` は `docs/xlsx2md/local-data/` に配置します。このディレクトリは `.gitignore` 対象です。

`docs/xlsx2md/local-data/` で使う一部サンプルの取得元メモ:

- Microsoft Create planner / tracker templates: <https://excel.cloud.microsoft/create/ja/planner-tracker-templates/>

## 数式文法の参照

Excel 数式の文法整理の参考資料として、`ClosedXML.Parser` の ABNF を参照します。

- 取得元リポジトリ: <https://github.com/ClosedXML/ClosedXML.Parser>
- 参照ファイル: `MS-XLSX-parser-grammar.abnf`
- ローカル配置先: [references/MS-XLSX-parser-grammar.abnf](/Users/igapyon/Documents/git/local-html-tools/docs/xlsx2md/references/MS-XLSX-parser-grammar.abnf)
- 利用目的: `xlsx2md` における Excel 数式サブセット文法の整理と、将来の AST ベース実装検討のための参照

ライセンス確認メモ:

- `ClosedXML.Parser` は MIT License として公開されている

謝辞:

- Excel 数式文法の参照資料を公開している `ClosedXML.Parser` プロジェクトに感謝します
