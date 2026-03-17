# xlsx2md

`xlsx2md` は、Excel (`.xlsx`) ファイルをローカルで読み込み、Markdown へ変換するための独立カテゴリです。

現時点では、仕様検討・実装・自動テストをこの配下で独立して進められる構成を前提にしています。

## 方針

- 配置は `docs/xlsx2md/` とし、既存の `docs/text/` には入れない
- 将来的に `xlsx2md-src.html` と生成物 `xlsx2md.html` をこの配下に持てるようにする
- 入出力はブラウザ内で完結し、サーバ送信を前提にしない
- 最初の用途は「Excel 表を Markdown テーブルへ変換」に絞る
- 配布形態は Single-file Web App とする
- UI は `lht-cmn/` を利用する
- 実装の正本ソースは TypeScript とする
- 自動テストを前提とする
- 出力モードは `display / raw / both` を扱えるようにする
- `raw` / `both` で保存する Markdown や ZIP は、ファイル名にモードサフィックスを付けて区別できるようにする
- 保存ファイル名は安全側へサニタイズし、シート名の空白や一部記号をそのまま使わないことがある
- 表候補外の縦並び短文は、地の文として連結せず箇条書きへ変換することがある

## 使い方

1. `xlsx2md.html` を開いて `.xlsx` ファイルを選択する
2. 必要に応じて `display / raw / both` と変換オプションを選ぶ
3. `Markdown へ変換` を実行し、内容確認後に Markdown または ZIP を保存する

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
- 例:
  - シート名 `A B-東京&大阪.01`
  - 保存名 `edge-weird-sheetname-sample01_001_A_B-東京_大阪.01.md`

## 想定する将来構成

```text
docs/xlsx2md/
├── README.md
├── xlsx2md-spec.md
├── xlsx2md-src.html
├── xlsx2md.html
├── src/
│   └── xlsx2md/
│       ├── css/
│       │   └── app.css
│       ├── ts/
│       │   └── main.ts
│       └── js/
│           └── main.js
└── tests/
    └── xlsx2md-main.test.js
```

実装前の整理メモは [xlsx2md-spec.md](./xlsx2md-spec.md) を参照してください。

fixture 用 Excel ブックの作成メモは [tests/fixtures/README.md](/Users/igapyon/Documents/git/local-html-tools/docs/xlsx2md/tests/fixtures/README.md) を参照してください。

git に入れない実データや一時検証用の `.xlsx` は `docs/xlsx2md/local-data/` に配置します。このディレクトリは `.gitignore` 対象です。

`docs/xlsx2md/local-data/` で使う一部サンプルの取得元メモ:

- Microsoft Create planner / tracker templates: <https://excel.cloud.microsoft/create/ja/planner-tracker-templates/>
