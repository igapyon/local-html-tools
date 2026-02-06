# ARCHITECTURE

## 「?」ツールチップのビジュアル標準

本プロジェクトでは、説明文はタイトル右の「?」に集約し、ホバーで表示する統一UIとする。

### 見た目の基準

- **形状**: 小さな丸型バッジ
- **サイズ**: `w-5 h-5`（1.25rem）
- **文字**: `?` を中央配置、`text-xs`、`font-bold`
- **配色**: `bg-gray-200`、文字色 `text-gray-600`
- **角丸**: `rounded-full`
- **配置**: タイトルの右に並べ、`inline-flex items-center` で整列

### ホバーテキストの基準

- **表示方式**: ホバー時にフェードイン（`opacity-0` → `group-hover:opacity-100`）
- **位置**: `top-full` + `mt-2`、中央寄せ（`left-1/2` + `-translate-x-1/2`）
- **幅**: `w-72` または `w-80` を基準（内容に応じて調整）
- **背景/文字**: `bg-gray-900`、`text-white`
- **文字サイズ**: `text-xs`、`leading-5`
- **装飾**: `rounded-lg`、`shadow-lg`、`px-3 py-2`
- **干渉防止**: `pointer-events-none`、`z-50`
- **余白の実運用**: 読みやすさ優先で `leading-6`、左右は `px-4`、上下は `py-2` を基準にして微調整する

### 実装の基本形（参考）

```html
<span class="relative inline-flex items-center group">
  <span class="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-gray-600 bg-gray-200 rounded-full">?</span>
  <span class="absolute left-1/2 top-full mt-2 w-72 -translate-x-1/2 rounded-lg shadow-lg bg-gray-900 text-white text-xs leading-5 font-normal px-3 py-2 opacity-0 group-hover:opacity-100 transition pointer-events-none z-50">
    説明文…
  </span>
</span>
```

## ボタンなし（自動生成）パターン

`git-pseudo-squash.html` のように、入力変更に応じてコマンドが即時更新されるUIでは、明示的な「生成」ボタンを置かない。

### 使いどころ

- 入力値が確定次第、自動で出力を更新して良いケース
- 複数ステップのコマンドを連続で提示するフロー型の画面

### 表示ルール

- 出力はコードブロック（`<code>`）で常時表示する
- コピー操作のみの最小ボタン（📋）は右上に付与してよい
- 入力不足時は空欄 or 必須メッセージで抑制し、冗長なボタンは置かない

## ボタンあり・多段フロー（loudnorm 型）

`docs/ffmpeg/ffmpeg-loudnorm-cmdline-gen.html` のように、段階的にコマンドを生成し、実行結果を入力して次のコマンドを作るツールの基本設計。

### 使いどころ

- 「設定 → コマンド生成 → 実行 → 実行結果貼り付け → 次の生成」のように多段の手順が必要なケース
- 実行結果（ffmpeg 出力など）を取り込んで最終コマンドを確定するケース

### 表示・操作ルール

- 各段階は見出し（`h2`）で区切り、番号付きで流れが一目で追えるようにする
- 生成操作は明示的なボタン（緑）で行い、結果は直下にコードブロックで表示する
- 実行結果の貼り付け欄は「次の段階」の直前に配置する
- 次の段階のボタンは、必要情報が揃ってから押す前提で配置し、未入力時はアラートで指示する
- 生成結果はコピー用ボタン（📋）を右上に付与して手戻りを減らす
