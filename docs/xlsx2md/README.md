# xlsx2md

`xlsx2md` は、Excel (`.xlsx`) ファイルをローカルで読み込み、Markdown へ変換するための独立カテゴリです。

現時点では実装前の仕様検討フェーズとして扱い、将来この配下だけで独立して育てやすい構成を前提にしています。

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
```

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
