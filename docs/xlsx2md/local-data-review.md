# xlsx2md local-data review

`docs/xlsx2md/local-data/` に置いた実データについて、`xlsx2md` の重点確認対象を整理するメモ。

## 現状サマリ

2026-03-17 時点で、`local-data` の Excel 系ファイルは 10 件。

機械集計では、ほとんどの Workbook が parse 可能で、数式も概ね解決できている。

重点確認対象:

- `TF0ffdef6d-9a19-4593-bdde-924d9e0aba2d7153cdcc_wac-2a2872261254.xlsx`
  - `計算`: formulas `2317`, resolved `2312`, fallback `5`
  - 数式未解決がまだ残っている唯一の強い候補
- `TFc2b640a6-8ee1-4258-9669-a8ab0b41240fb1a9c9ca_wac-2fedb8d0a784.xlsx`
  - `イベント プランナー`: images `18`, merges `174`
  - 画像と結合セルが多く、レイアウト由来の意味落ち確認に向く
- `TF97739ac3-cc1c-40fb-8682-f809e067145e8f18ec64_wac-912bbff00931.xlsx`
  - `月間プランナー`: merges `71`, formulas `128`, resolved `128`
  - 数式は解けているが、見た目の意味再現を確認したい
- `TFe6ae6c3f-7542-4b5a-80ce-d131a04ae548d10af21f_wac-3845acf76347.xlsx`
  - `To Do リスト`: リストブロック化確認に使用
  - `買い物リスト`: 会計書式ゼロ値 `¥ -` の確認に使用

## Workbook 別メモ

### TF0ffdef6d-9a19-4593-bdde-924d9e0aba2d7153cdcc_wac-2a2872261254.xlsx

- `老後資金プランナー`
  - formulas `801`, resolved `801`, fallback `0`
  - images `1`, merges `25`
- `計算`
  - formulas `2317`, resolved `2312`, fallback `5`
  - images `0`, merges `0`

次の確認:

- `計算` シートの fallback `5` の式パターン特定
- fallback を仕様で許容するか、実装で潰すかの判断

目視差分メモ:

- `老後資金プランナー` シートは、Excel 上では「グラフ + 入力パネル + 詳細表」の複合レイアウトだが、現状 Markdown では `B1-J59` 全体が 1 つの巨大表として出る
- 画面上部のグラフ説明や入力セクション見出しまで同一表へ吸われており、人間にとっては読みにくい
- この種のシートは、巨大表 1 個よりも「導入文 / 入力ブロック / 詳細表 / 画像」のような分割が望ましい

### TF2a72be1c-7be5-413d-b345-417c06878d3ab665d7ad_wac-acd2741d3bcc.xlsx

- `課題`
  - formulas `12`, resolved `12`, fallback `0`
- `月単位のビュー`
  - formulas `86`, resolved `86`, fallback `0`
- `週単位のビュー`
  - formulas `85`, resolved `85`, fallback `0`

確認済み事項:

- structured reference, defined name, `EOMONTH`, 反復再解決により fallback `0` まで到達済み

次の確認:

- 表示上の差分が残るかどうかの目視比較

### TF97739ac3-cc1c-40fb-8682-f809e067145e8f18ec64_wac-912bbff00931.xlsx

- `月間プランナー`
  - formulas `128`, resolved `128`, fallback `0`
  - images `1`, merges `71`
- `リスト`
  - formulas `9`, resolved `9`, fallback `0`

次の確認:

- 大量 merge を含むシートで、表検出・地の文・保存画像参照が自然か

目視差分メモ:

- `月間プランナー` は Excel 上ではカレンダー/ボード系レイアウトだが、現状 Markdown では曜日列ごとに多数の小表へ分解される
- `目標と優先事項`、前月・翌月ミニカレンダー、各曜日の予定欄が個別表になっており、元の月間カレンダーとしてのまとまりは失われる
- この種のシートは通常の表検出だけでは不十分で、`カレンダー/ボード系` という別カテゴリの検討が必要

### TFc2b640a6-8ee1-4258-9669-a8ab0b41240fb1a9c9ca_wac-2fedb8d0a784.xlsx

- `イベント プランナー`
  - formulas `11`, resolved `11`, fallback `0`
  - images `18`, merges `174`
- `支出`
  - formulas `23`, resolved `23`, fallback `0`
- `収入`
  - formulas `36`, resolved `36`, fallback `0`
- `概要`
  - formulas `6`, resolved `6`, fallback `0`

次の確認:

- 多画像シートでのアンカー位置と Markdown 出力の妥当性
- merge 多用シートでの表/地の文/画像の切り分け

目視差分メモ:

- `イベント プランナー` は Excel 上では装飾・画像・複数セクションが大きく効くレイアウト文書
- 現状 Markdown では `C10-AM14` などの広い merge 領域がそのまま巨大表として出ており、`[MERGED←]` が大量に並ぶ
- `議題`、`イベント チェックリスト`、`イベント カテゴリ`、`主な連絡先` といったセクションの存在は取れているが、視覚レイアウト依存の意味は落ちる
- この種のシートは、表の完全再現ではなく「セクション分割 + 表抽出 + 画像位置保持」に寄せるのが妥当

### TFe6ae6c3f-7542-4b5a-80ce-d131a04ae548d10af21f_wac-3845acf76347.xlsx

- `買い物リスト`
  - formulas `20`, resolved `20`, fallback `0`
  - images `1`, merges `2`
- `予算の内訳`
  - formulas `3`, resolved `3`, fallback `0`
- `To Do リスト`
  - formulas `0`
- `共有リスト`
  - formulas `0`, images `1`

確認済み事項:

- `To Do リスト` は 1 パラグラフではなく、リストブロックとして扱う実装を追加済み
- `買い物リスト` の会計書式ゼロ値は `¥0.00` ではなく `¥ -` を優先する実装を追加済み

## 次の優先順

1. `TF0ffdef.../計算` の fallback `5` を特定
2. `TFc2b640.../イベント プランナー` の多画像・多結合差分を確認
3. `TF97739.../月間プランナー` の merge 多用シートを確認
4. `TF2a72b...` と `TFe6ae...` は差分確認中心

## 人手確認があると助かるもの

- 上記 1-3 の代表シートについて、Excel 画面のスクリーンショット
- 特に「これを Markdown でどう見せたいか」がある場合は、その期待イメージ
- 条件付き書式やアイコンが意味を持つ列について、意味説明
