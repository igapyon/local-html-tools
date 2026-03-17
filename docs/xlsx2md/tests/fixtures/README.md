# xlsx2md Fixtures

`docs/xlsx2md/tests/fixtures/` は、`xlsx2md` の実ファイルベース回帰テスト用 `.xlsx` 置き場です。

## ルール

- できるだけ `1ファイル = 1目的` にする
- `1シート` で済むものは `1シート` にする
- 値は少なく、意図は明確にする
- 先頭付近に「何を試すサンプルか」が分かる見出しセルを置く
- 可能ならファイル名に `sample01` を付ける
- 通常は普通に Excel 保存して `cached value` を残す
- 未計算保存を試す場合だけ、別ファイルへ分ける

## 既存 fixture

### ルート直下

- `xlsx2md-basic-sample01.xlsx`
  - 総合サンプル
  - 地の文、表、結合セル、shared formula、表示形式をまとめて確認する

### `display/`

- `display-format-sample01.xlsx`
  - 表示形式専用
  - 数値、通貨、会計、日付、時刻、パーセンテージ、分数、指数、文字列、和暦を確認する

### `merge/`

- `merge-pattern-sample01.xlsx`
  - 結合セル専用
  - 横結合、縦結合、2x2 結合と `[MERGED←] / [MERGED↑]` を確認する

## 作成予定 fixture

### `formula/formula-basic-sample01.xlsx`

- 目的: 基本数式
- 構成: 1シート
- 含めたい式:
  - `=A1`
  - `=A1+B1`
  - `IF`
  - `SUM`
  - `COUNTIF`
  - `TEXT`
  - `DATE`
  - `VALUE`
- セル配置案:
  - `A1`: `基本数式サンプル`
  - `A3`: `base1`
  - `B3`: `10`
  - `A4`: `base2`
  - `B4`: `5`
  - `A5`: `ref`
  - `B5`: `=B3`
  - `A6`: `arith`
  - `B6`: `=B3+B4`
  - `A7`: `if`
  - `B7`: `=IF(B3>B4,"OK","NG")`
  - `A8`: `sum`
  - `B8`: `=SUM(B3:B4)`
  - `A9`: `countif`
  - `B9`: `=COUNTIF(B3:B4,">7")`
  - `A10`: `text`
  - `B10`: `=TEXT(B3,"0000")`
  - `D3`: `date`
  - `E3`: `=DATE(2024,3,17)`
  - `D4`: `value_num`
  - `E4`: `=VALUE("1,234.5")`
  - `D5`: `value_date`
  - `E5`: `=VALUE("2024/03/17")`

### `formula/formula-crosssheet-sample01.xlsx`

- 目的: 複数シート参照
- 構成: 2シート以上
- セル配置案:
  - シート:
    - `Sheet1`
    - `Sheet2`
    - `日本語シート`
  - `Sheet2!A1`: `1`
  - `Sheet2!B1`: `2`
  - `Sheet2!A2`: `3`
  - `Sheet2!B2`: `4`
  - `Sheet2!B3`: `CrossValue`
  - `日本語シート!C4`: `日本語参照値`
  - `Sheet1!A1`: `複数シート参照サンプル`
  - `Sheet1!A3`: `sheet2_ref`
  - `Sheet1!B3`: `=Sheet2!B3`
  - `Sheet1!A4`: `jp_sheet_ref`
  - `Sheet1!B4`: `='日本語シート'!C4`
  - `Sheet1!A5`: `sum_range`
  - `Sheet1!B5`: `=SUM(Sheet2!A1:B2)`
- 補足:
  - 余裕があれば空白入りシート名も追加する

### `formula/formula-shared-sample01.xlsx`

- 目的: shared formula
- 構成: 1シート
- セル配置案:
  - `A1`: `No`
  - `B1`: `連番`
  - `A2:A11`: `1..10`
  - `B2`: `1`
  - `B3`: `=B2+1`
  - `B3:B11`: オートフィル
  - `D1`: `shared formula サンプル`
- 補足:
  - コピー貼り付けではなく、Excel のオートフィルで増やす

### `formula/formula-spill-sample01.xlsx`

- 目的: dynamic array / spill
- 構成: 1シート
- セル配置案:
  - `A1`: `spill サンプル`
  - `A3`: `src1`
  - `A4`: `1`
  - `A5`: `2`
  - `A6`: `3`
  - `C3`: `spill_ref`
  - `C4`: `=A4:A6`
  - 可能なら、Excel が dynamic array として保存する形で `C4#` を参照する式も追加
  - `E3`: `spill_sum`
  - `E4`: `=SUM(C4#)`
- 補足:
  - Excel で実際に spill させて保存する
  - もし `=A4:A6` だけで spill しない場合は、Microsoft 365 / Excel for web で dynamic array が有効な状態で作成する
  - 可能なら worksheet XML の `f@ref` が残ることを確認したい

### `named-range/named-range-sample01.xlsx`

- 目的: `definedNames`
- 構成: 2シート
- セル配置案:
  - シート:
    - `Summary`
    - `Other`
  - `Summary!A1`: `definedNames サンプル`
  - `Summary!A3`: `BaseName元`
  - `Summary!B3`: `Base`
  - `Summary!A4`: `BaseRange1`
  - `Summary!B4`: `10`
  - `Summary!A5`: `BaseRange2`
  - `Summary!B5`: `20`
  - workbook スコープ名:
    - `BaseName=Summary!$B$3`
    - `BaseRange=Summary!$B$4:$B$5`
  - `Other!A1`: `LocalCross元`
  - `Other!B2`: `CrossRef`
  - sheet スコープ名:
    - `LocalCross=Other!$B$2`
  - `Summary!D3`: `=BaseName`
  - `Summary!D4`: `=SUM(BaseRange)`
  - `Other!D2`: `=LocalCross`

### `narrative/narrative-vs-table-sample01.xlsx`

- 目的: 地の文と表の判定
- 構成: 1シート
- セル配置案:
  - `A1`: 太字 `地の文と表の判定`
  - `A3`: `この設計書は受注入力画面を説明する。`
  - `A4`: `外部システムとの連携条件を以下に示す。`
  - `A5`: `本文は罫線なしのままにする。`
  - `A7`: 太字 `項目一覧`
  - `B8:F11`: 罫線あり表
  - `B8:F8`: `項番 / 項目名称 / 物理名 / 初期値 / 備考`
  - `B9:F11`: 2-3行のデータ
  - `A13`: `※注記: この表はサンプルです。`

### `image/image-basic-sample01.xlsx`

- 目的: 画像抽出
- 構成: 1シート
- セル配置案:
  - `A1`: `画像抽出サンプル`
  - `B3:F6`: 簡単な表
  - `A7`: `画像サンプル`
  - 画像1枚目: `C8` 付近
  - 画像2枚目: 置けるなら `F8` または `C15` 付近
- 補足:
  - 1枚はサイズ変更してもよい

### `edge/edge-empty-sample01.xlsx`

- 目的: 空系の境界
- 構成: 1シート
- セル配置案:
  - `A1`: `空系境界サンプル`
  - `C7`: `only-value`
- 補足:
  - それ以外は空のままにする
  - 罫線、結合、画像は入れない

### `edge/edge-weird-sheetname-sample01.xlsx`

- 目的: ファイル名サニタイズ
- 構成: 1シート
- 補足:
  - Excel は `/ \ ? * : [ ]` をシート名に使えない
  - そのため、Excel で許される範囲で揺れやすい名前を使う
- シート名案:
  - `A B-東京&大阪.01`
- セル配置案:
  - `A1:D1`: `項番 / 名称 / 値 / 備考`
  - `A2:D4`: 2-3行のデータ

## 補足

- さらに細かい方針や広いバックログは [TODO.md](/Users/igapyon/Documents/git/local-html-tools/TODO.md) を参照
