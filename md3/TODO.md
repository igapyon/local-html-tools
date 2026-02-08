# md3 TODO

`md3/index.html` の整合性レビューで見つかった修正候補を記録します。

## Medium（次に直す）

- [ ] `md-sr-only` 要素から `style="display:none"` を外す
  - 背景: プレビュー時に理由不明で非表示化が必要になり暫定的に `display:none` を併用したが、`sr-only` の意図と矛盾していて納得できていない
  - 対応方針: プレビューで見た目を崩さず、かつアクセシビリティ上の意味を壊さない方法を調査する

- [ ] ボタンの旧来クラス `md-button-primary` / `md-button-secondary` を削除し、`md-button--*` 系へ統一する
  - 背景: 命名系統が混在していて、実装ルールとカタログ運用の一貫性が崩れる
  - 対応方針: 旧来クラスの定義・参照を除去し、必要な見た目は `md-button--primary` / `md-button--secondary` へ寄せる

- [ ] Snackbar 可視化クラスを一本化する（`md-snackbar.md-visible` と `md-snackbar--visible` の併存解消）
  - 背景: 状態表現が2系統あり、どちらを正とするか判断しづらい
  - 対応方針: 状態クラス運用に合わせて1系統に統一し、README と実装例を同時更新する

## Low（品質改善）

- [x] テキスト中の `&` を `&amp;` に置換する
  - 対応済み: `Tooltip &amp; Help`, `Output &amp; Feedback`

- [ ] `TODO: md-switch と md-toggle の重複` を解消する
  - 方針: `md-switch` を標準化し、`md-toggle` は Deprecated 表示に寄せるか削除する

## メモ

- 未定義イベント関数参照は、実運用HTML断片をそのまま載せるプレビュー構造に起因するため、現時点では仕様として許容する
- `id="toast"` 重複も同様にプレビュー断片由来で、現時点では仕様として許容する
- `../docs/*.html` への参照リンク自体は現状すべて存在している
- コンポーネントカタログとしての構成（プレビュー + クラス + コード例 + 実利用リンク）は一貫している
