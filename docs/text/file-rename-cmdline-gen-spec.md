# file-rename-cmdline-gen.html 仕様書

## 概要

ファイル名リストから連番リネームコマンドを生成するツール。  
デフォルトは macOS/Linux（bash/zsh）向け出力で、PowerShell スイッチを ON にすると Windows PowerShell 向け出力に切り替える。

## 配置先

`docs/text/file-rename-cmdline-gen.html`

## フロー定義

- 操作ステップは 2 段階。
- 最終的な出力表示（リネームコマンドとプレビュー）は結果表示セクションとして扱う。

1. ステップ1: ファイル一覧取得コマンドの生成
2. ステップ2: 実行結果の貼り付け + リネームルール入力
3. 結果表示: リネームコマンドと変換プレビュー

## 画面構成

### タイトル

`🔤 ファイル名連番リネームコマンドジェネレータ`

### タイトル横 `?` 説明

`ファイル名リストから連番リネームコマンドを生成します。PowerShellまたはbashで実行できるコマンドを出力し、実行前にプレビューで確認できます`

### 共通設定

- `PowerShell` スイッチ（checkbox）
  - OFF: macOS/Linux（bash/zsh）向け
  - ON: Windows PowerShell 向け
  - ツールチップ:
    - `Windows PowerShell 用のコマンドを出力するかどうかを切り替えます。スイッチがオフの場合は macOS/Linux の bash/zsh 向けのコマンドを出力します。ご利用の環境に従って切り替えてください`

## ステップ1: ファイル一覧取得コマンド生成

### 入力項目

- 拡張子フィルター（必須）
  - ラベル: `拡張子フィルター`
  - プレースホルダー: `png`
  - `png` / `.png` / `*.png` のいずれも受け付ける
  - ツールチップ:
    - `対象とする拡張子。*.png形式でもpngだけでもOKです`
- ファイル名パターン（任意）
  - ラベル: `ファイル名パターン`
  - プレースホルダー: `スクリーンショット*`
  - ツールチップ:
    - `ファイル名の一部で絞り込み（ワイルドカード使用可）。空欄の場合は拡張子のみでフィルタリングします`

### 出力（自動更新）

- 入力変更時に一覧取得コマンドを自動再生成する（ボタンなし）。
- 出力欄はコピーボタン付き。

#### macOS/Linux（OFF）

```bash
find . -maxdepth 1 -type f -name 'スクリーンショット*.png' -print | sed 's|^\./||'
```

#### Windows PowerShell（ON）

```powershell
Get-ChildItem -File -Filter 'スクリーンショット*.png' | Select-Object -ExpandProperty Name
```

## ステップ2: ファイル名リスト入力 + リネームルール

### 入力項目

- ファイル名リスト（必須 / textarea）
  - ラベル: `ファイル名リスト`
  - 行数目安: 10
  - ツールチップ:
    - `PowerShellやbashの出力結果をそのまま貼り付けられます。空行やヘッダー行は自動的にスキップします`
- プレフィックス（必須）
  - ラベル: `プレフィックス`
  - プレースホルダー: `MyTest_`
- 開始番号（必須）
  - ラベル: `開始番号`
  - 初期値: `1`
  - 最小値: `1`
- 桁数（必須）
  - ラベル: `桁数`
  - 選択肢: `2 / 3 / 4`
  - 初期値: `3`

### データ上限

- 最大 9999 件までサポート。
- 10000 件以上はエラー表示し、コマンド生成を行わない。

### 桁数ルール

- 指定桁数まではゼロ埋めする。
  - 例: 桁数 3 で 1 → `001`
- 指定桁数を超える桁になった場合は、その自然桁のまま出力する。
  - 例: 桁数 2 で 100 → `100`

## 結果表示（自動更新）

- ステップ2の入力変更時に自動再生成する（ボタンなし）。
- 表示内容:
  - リネームコマンド（選択中シェル向け）
  - 変換プレビュー表（元ファイル名 → 新ファイル名）
- 各コードブロックはコピーボタン付き。

### コマンド例（PowerShell ON）

```powershell
Rename-Item 'スクリーンショット-2024-01-15-123456.png' 'MyTest_001.png'
Rename-Item 'スクリーンショット-2024-01-15-123457.png' 'MyTest_002.png'
```

### コマンド例（PowerShell OFF）

```bash
mv 'スクリーンショット-2024-01-15-123456.png' 'MyTest_001.png'
mv 'スクリーンショット-2024-01-15-123457.png' 'MyTest_002.png'
```

## パース仕様

1. テキストを改行で分割
2. 各行を trim
3. 空行を除外
4. ヘッダー行を除外（例: `Name`, `FileName`）

補足:
- 本ツールは「ユーザーが shell/PowerShell をカレントディレクトリで実行し、ファイル名一覧を貼り付ける」前提。
- フルパスの basename 抽出は必須要件にしない。

## クォート仕様

- PowerShell:
  - シングルクォート `'...'`
  - 内部の `'` は `''` にエスケープ
- bash/zsh:
  - シングルクォート `'...'`
  - 内部の `'` は `'\''` にエスケープ

## エラー・注意方針

- 生成先ファイル名の重複検知は行わない。
- 実行時の失敗（上書き不可/同名衝突など）は shell/PowerShell 側の結果に委ねる。
- 必須入力が不足している場合は出力を空にして生成抑止する。

## UI 実装方針

- `git-pseudo-squash.html` 同様、ボタンレス自動更新を採用。
- 入力の `input/change` イベントで再生成。
- 必須項目は `md-required` で表示。
- 説明は `?` ツールチップに集約。
- コード表示は `md-code-block` + `md-copy-button`。

## localStorage 永続化仕様

以下の入力値を `localStorage` に保存し、次回アクセス時に復元する。

- `shellEnvPowerShell`（PowerShell スイッチ）
- `extensionFilter`（拡張子）
- `filenamePattern`（名前パターン）
- `prefixInput`（プレフィックス）
- `startNoInput`（開始番号）
- `digitsInput`（桁数）

キー:

- `fileRenameCmdlineGen.ui.shellEnvPowerShell`
- `fileRenameCmdlineGen.ui.extensionFilter`
- `fileRenameCmdlineGen.ui.filenamePattern`
- `fileRenameCmdlineGen.ui.prefix`
- `fileRenameCmdlineGen.ui.startNo`
- `fileRenameCmdlineGen.ui.digits`

保存タイミング:

- 対象項目の `input/change` イベントで保存。
- `localStorage` 例外は握りつぶして継続。

復元タイミング:

- 初期化時に読み込み、復元後にコマンド再生成を実行。
- `startNoInput` は `1` 以上の整数のみ復元。

### 設定クリア仕様

- 「設定をクリア」ボタンで以下キーを削除する
  - `fileRenameCmdlineGen.ui.shellEnvPowerShell`
  - `fileRenameCmdlineGen.ui.extensionFilter`
  - `fileRenameCmdlineGen.ui.filenamePattern`
  - `fileRenameCmdlineGen.ui.prefix`
  - `fileRenameCmdlineGen.ui.startNo`
  - `fileRenameCmdlineGen.ui.digits`
- 確認ダイアログ文言:
  - `ローカルに保存されているこのツールの設定をクリアします。よろしいですか？`
- クリア後は以下既定値で UI を更新し、再生成する
  - `shellEnvPowerShell = false`
  - `extensionFilter = "png"`
  - `filenamePattern = "スクリーンショット*"`
  - `prefixInput = "MyImage_"`
  - `startNoInput = 1`
  - `digitsInput = 3`

## 想定 JavaScript 関数

- `regenerateAll()` - すべての出力再生成
- `generateListCommand()` - 一覧取得コマンド生成
- `parseFileList(text)` - ファイル名リストのパース
- `buildRenamePlan(files, prefix, startNo, digits)` - 新旧ファイル名対応を生成
- `generateRenameCommands(plan, shellEnv)` - リネームコマンド生成
- `quoteShell(value, shellEnv)` - シェル別クォート処理
- `copyToClipboard(elementId)` - コピー
- `showToast(message)` - トースト
