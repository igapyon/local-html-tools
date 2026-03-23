# text2spreadsheetml.html 仕様書

## 概要

ベタテキスト、CSV ファイル、TAB 区切りファイルを入力として受け取り、SpreadsheetML 2003 XML Spreadsheet 形式の `.xml` を生成するツール。

- ローカル完結の single-file web app とする
- 生成結果は Excel で開ける SpreadsheetML 2003 を対象とする
- MVP では「表データを壊さず 1 シートの XML を生成する」ことを最優先とする

補足:

- 本仕様書では `SpreadsheetML 2003` を正式名称として扱う
- 「Excel 2004 でも開ける XML」という説明は UI 上の補助説明として許容する

## 配置先

`docs/text/text2spreadsheetml.html`

## フロー定義

- 操作ステップは 4 段階
- 最終的な XML 出力表示と保存操作は結果表示セクションとして扱う

1. ステップ1: 入力方式の選択
2. ステップ2: テキストまたはファイルの入力
3. ステップ3: 読み取り設定と表プレビュー確認
4. 結果表示: SpreadsheetML 2003 XML の生成と保存

## 画面構成

### タイトル

`📊 text2spreadsheetml`

### タイトル横 `?` 説明

`ベタテキスト、CSV、TAB区切りテキストを SpreadsheetML 2003 XML に変換します。Excel で開ける 1 シートの XML をローカルで生成できます`

## ステップ1: 入力方式の選択

### 入力項目

- 入力方式（必須）
  - ラベル: `入力方式`
  - 選択肢:
    - `ベタテキスト`
    - `CSV ファイル`
    - `TAB 区切りファイル`
  - 初期値: `ベタテキスト`
  - ツールチップ:
    - `貼り付けテキストか、CSV/TSV ファイルかを選択します。どの入力方式でも内部的には表データとして扱います`

### 表示切替仕様

- `ベタテキスト` 選択時:
  - テキスト入力欄を表示
  - その中で `直接入力` または `テキストファイル` を選べる
- `CSV ファイル` 選択時:
  - ファイル入力欄を表示
  - テキスト入力欄は非表示
  - 区切り文字は `,` に固定
- `TAB 区切りファイル` 選択時:
  - ファイル入力欄を表示
  - テキスト入力欄は非表示
  - 区切り文字は `\t` に固定

## ステップ2: データ入力

### ベタテキスト入力時

- 入力方法（必須）
  - 選択肢:
    - `直接入力`
    - `テキストファイル`
  - 初期値: `直接入力`

- 入力テキスト（必須 / textarea）
  - ラベル: `入力テキスト`
  - 行数目安: 12
  - プレースホルダー:
    - `name,age,joined`
    - `Alice,30,2026-03-01`
    - `Bob,28,2026-03-15`
  - ツールチップ:
    - `区切り文字付きの表テキストを貼り付けます。CSV 風、TAB 区切り、パイプ区切りなどを読み取り設定に合わせて解釈します`

- テキストファイル（`テキストファイル` 選択時のみ必須 / file）
  - ラベル: `テキストファイル`
  - 受け付け:
    - `.txt,.csv,.tsv,text/plain,text/csv,text/tab-separated-values`
  - ツールチップ:
    - `区切り文字付きのテキストファイルをブラウザ内で読み込みます。読み込み後はベタテキストと同じ処理系へ渡します`

### ファイル入力時

- 入力ファイル（必須 / file）
  - ラベル: `入力ファイル`
  - 受け付け:
    - `CSV ファイル` 選択時: `.csv,text/csv`
    - `TAB 区切りファイル` 選択時: `.tsv,.txt,text/tab-separated-values,text/plain`
  - ツールチップ:
    - `ローカルファイルをブラウザ内で読み込みます。サーバ送信は行いません`

### ファイル読込仕様

- `FileReader` で UTF-8 として読み込む
- 文字化けの可能性がある場合は注意メッセージを表示する
- ファイル読込後は内部的にテキストへ展開し、以降はベタテキスト入力と同じ処理系へ渡す

## ステップ3: 読み取り設定とプレビュー

### 入力項目

- 区切り文字（ベタテキスト時のみ必須）
  - ラベル: `区切り文字`
  - 選択肢:
    - `カンマ (, )`
    - `TAB`
    - `半角空白`
    - `パイプ (|)`
    - `セミコロン (;)`
  - 初期値: `半角空白`
  - ツールチップ:
    - `ベタテキストをどの区切り文字で列分割するかを指定します`

### 半角空白区切り仕様

- `区切り文字 = 半角空白` の場合:
  - 半角空白 1 個以上の連続を 1 区切りとして扱う
  - 例: `A B C` と `A   B   C` は同じ 3 列として解釈する
- TAB や全角空白は半角空白区切りには含めない
- `trimCells = ON` の場合は行頭・行末の半角空白も除去してから分割する

- 1行目をヘッダとして扱う（checkbox）
  - ラベル: `1行目をヘッダとして扱う`
  - 初期値: `ON`

- 空行を無視（checkbox）
  - ラベル: `空行を無視`
  - 初期値: `ON`

- 各セルの前後空白を trim（checkbox）
  - ラベル: `各セルの前後空白を trim`
  - 初期値: `ON`

- ダブルクォート付き CSV を解釈（checkbox）
  - ラベル: `ダブルクォート付き CSV を解釈`
  - 初期値:
    - `CSV ファイル`: `ON`
  - 表示条件:
    - `CSV ファイル` 選択時のみ表示
  - ツールチップ:
    - `CSV の \"...\" による囲み、カンマや改行を含むセルを解釈します。MVP では CSV 向けの簡易対応とします`

- シート名（必須）
  - ラベル: `シート名`
  - 初期値: `Sheet1`
  - プレースホルダー: `Sheet1`

- Workbook 名（任意）
  - ラベル: `Workbook 名`
  - 初期値: `text2spreadsheetml`
  - プレースホルダー: `text2spreadsheetml`

### プレビュー表示

- 読み取り設定の変更時に自動更新する
- 表示内容:
  - 行数
  - 列数
  - ヘッダ行の内容
  - 文字列固定で出力する旨の表示
  - 先頭 20 行までの表プレビュー

### 列名仕様

- `1行目をヘッダとして扱う = ON` の場合:
  - 1 行目を列名として扱う
  - XML 上はヘッダも通常セルとして 1 行目に出力する
- `OFF` の場合:
  - 列名は内部表示用に `Column1`, `Column2`, ... を補う

### 列数仕様

- 基本は各行の列数を揃えて扱う
- 最大列数に満たない行は末尾空セルで補完する
- 最大列数を超える行は存在しない前提でパースする
- CSV 引用符不整合などにより正常に列分割できない場合はエラー表示する

## データ型仕様

### 型モード

- `文字列固定`
  - すべて `String`
- `限定数値推論`
  - 列単位で `String` / `Number` を判定する

### 限定数値推論のルール

- 判定対象はデータ行のみとする
- 空セルは判定対象から除外する
- 列内に 1 つでも `先頭ゼロ付き整数` が存在する場合、その列全体を `String` にフォールバックする
  - 例: `00123`, `0123`, `-012`
- 上記に該当せず、列内の非空セルがすべて数値形式に一致する場合、その列全体を `Number` とする
- それ以外は `String`

### 数値形式

- `-?(0|[1-9][0-9]*)(\.[0-9]+)?`
- 例:
  - `0` → `Number`
  - `12` → `Number`
  - `-3` → `Number`
  - `0.5` → `Number`
  - `-0.5` → `Number`
  - `00123` → `String`

### 型方針

- 既定値は `文字列固定`
- コード値や ID を壊したくない場合は `文字列固定` を使う
- 数値列を Excel 側でそのまま扱いたい場合は `限定数値推論` を使う

## ステップ4: SpreadsheetML 2003 XML 出力

### 出力（自動更新）

- 入力または設定変更時に自動再生成する
- 表示内容:
  - SpreadsheetML 2003 XML 本文
  - 生成サマリ
    - シート名
    - 行数
    - 列数
    - 生成セル数

### XML 仕様

- XML 宣言を含む
- 生成対象は 1 Workbook / 1 Worksheet
- 最低限含める要素:
  - `Workbook`
  - `DocumentProperties`
  - `Styles`
  - `Worksheet`
  - `Table`
  - `Row`
  - `Cell`
  - `Data`

### 名前空間方針

- SpreadsheetML 2003 として妥当な名前空間を付与する
- `ss:` 接頭辞を利用して `ss:Type` などを出力する

### セル出力仕様

- 各セルは `Cell > Data` で出力する
- `Data` の `ss:Type` は型モードと列判定結果に従う
- 空セルは基本的に空の `Cell` として出力してよい
- XML 特殊文字は必ずエスケープする
  - `&`
  - `<`
  - `>`
  - `"`
  - `'`

### スタイル仕様

- MVP では最小限の既定スタイルのみ出力する
- 少なくとも以下を定義する
  - `Default`
  - `Header`（ヘッダあり時）

### ヘッダ行スタイル

- `1行目をヘッダとして扱う = ON` の場合:
  - 1 行目セルに `Header` スタイルを適用してよい
- `OFF` の場合:
  - 全行 `Default`

## 保存機能

### 出力機能

- `.xml` ダウンロードボタン

### 保存ファイル名

- 既定値:
  - `text2spreadsheetml.xml`
- Workbook 名が入力されている場合:
  - サニタイズして `${workbookName}.xml`

### サニタイズ方針

- ファイル名に使えない文字は `_` に置換する
- 空白は `_` へ置換してよい

## エラー・注意方針

- 入力が空の場合は XML 生成を抑止する
- 正常にパースできない場合は XML 生成を抑止する
- エラー例:
  - 入力テキストが空
  - ファイル未選択
  - CSV 引用符の不整合
  - シート名が空
- 警告例:
  - 列数が行ごとに不一致
  - UTF-8 以外の可能性

## UI 実装方針

- 基本はボタンレス自動更新
- 必須項目は `md-required`
- 説明は `?` ツールチップに集約
- XML 表示は `md-code-block` + `md-copy-button`
- ファイル入力時も、読み込み完了後は同じ再生成関数へ流す

## localStorage 永続化仕様

以下の入力値を `localStorage` に保存し、次回アクセス時に復元する。

- `inputMode`（入力方式）
- `delimiter`（区切り文字）
- `typeInferenceMode`（項目型）
- `hasHeader`（ヘッダ有無）
- `ignoreEmptyLines`（空行無視）
- `trimCells`（trim）
- `csvQuoteMode`（CSV 引用符解釈）
- `sheetName`（シート名）
- `workbookName`（Workbook 名）

キー:

- `text2spreadsheetml.ui.inputMode`
- `text2spreadsheetml.ui.delimiter`
- `text2spreadsheetml.ui.typeInferenceMode`
- `text2spreadsheetml.ui.hasHeader`
- `text2spreadsheetml.ui.ignoreEmptyLines`
- `text2spreadsheetml.ui.trimCells`
- `text2spreadsheetml.ui.csvQuoteMode`
- `text2spreadsheetml.ui.sheetName`
- `text2spreadsheetml.ui.workbookName`

保存タイミング:

- 対象項目の `input/change` イベントで保存
- `localStorage` 例外は握りつぶして継続

復元タイミング:

- 初期化時に読み込み
- 復元後に再生成を実行

### 設定クリア仕様

- 「設定をクリア」ボタンで上記キーを削除する
- 確認ダイアログ文言:
  - `ローカルに保存されているこのツールの設定をクリアします。よろしいですか？`
- クリア後は以下既定値で UI を更新し、再生成する
  - `inputMode = "text"`
  - `delimiter = "space"`
  - `typeInferenceMode = "string"`
  - `hasHeader = true`
  - `ignoreEmptyLines = true`
  - `trimCells = true`
  - `csvQuoteMode = false`
  - `sheetName = "Sheet1"`
  - `workbookName = "text2spreadsheetml"`

## 非対応（MVP）

- 複数シート
- 数式
- セル結合
- 複雑な装飾
- 罫線や色の詳細編集
- フィルタ
- ソート条件
- 複雑な CSV 方言の完全互換
- 文字コード自動判定

## 想定 JavaScript 関数

- `regenerateAll()` - すべての出力再生成
- `readInputSource()` - 入力方式ごとのテキスト取得
- `parseDelimitedText(text, options)` - 表データへパース
- `parseCsvWithQuotes(text, options)` - CSV 引用符対応パース
- `normalizeRows(rows, options)` - 行列数調整
- `inferColumnTypes(previewModel, options)` - 列単位の型推論
- `buildWorkbookModel(parsed, options)` - Workbook 用内部モデル生成
- `generateSpreadsheetMlXml(model)` - SpreadsheetML 2003 XML 生成
- `escapeXml(value)` - XML エスケープ
- `downloadXml(filename, xml)` - ダウンロード
- `copyToClipboard(elementId)` - コピー
- `showToast(message)` - トースト
