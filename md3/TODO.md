# md3 TODO

`md3/index.html` の整合性レビューで見つかった修正候補を記録します。

## Medium（次に直す）

- [ ] `Token（:root / --md-sys-*）` / `Core（共通）` の標準仕様バージョニングを導入する
  - 背景: 今後は仕様を固定化して `docs/*.html` へ展開する運用に切り替えるため、更新差分を追跡できる識別子が必要
  - 対応方針: `Token Spec v1.x` / `Core Spec v1.x` を定義し、更新履歴と適用対象ページを記録する

- [ ] `md-sr-only` 要素から `style="display:none"` を外す
  - 背景: プレビュー時に理由不明で非表示化が必要になり暫定的に `display:none` を併用したが、`sr-only` の意図と矛盾していて納得できていない
  - 対応方針: プレビューで見た目を崩さず、かつアクセシビリティ上の意味を壊さない方法を調査する

- [x] ボタンの旧来クラス `md-button-primary` / `md-button-secondary` を削除し、`md-button--*` 系へ統一する
  - 背景: 命名系統が混在していて、実装ルールとカタログ運用の一貫性が崩れる
  - 対応済み: 旧来クラスの定義・参照を除去し、`md-button--primary` / `md-button--secondary` に統一

- [x] Snackbar 可視化クラスを一本化する（`md-snackbar.md-visible` と `md-snackbar--visible` の併存解消）
  - 背景: 状態表現が2系統あり、どちらを正とするか判断しづらい
  - 対応済み: 状態クラス運用に合わせ `md-visible` 系に統一し、README/実装例も更新

## Low（品質改善）

- [x] テキスト中の `&` を `&amp;` に置換する
  - 対応済み: `Tooltip &amp; Help`, `Output &amp; Feedback`

- [x] `TODO: md-switch と md-toggle の重複` を解消する
  - 対応済み: `md-switch` に統一し、`md-toggle` のカタログ項目を削除

## メモ

- 未定義イベント関数参照は、実運用HTML断片をそのまま載せるプレビュー構造に起因するため、現時点では仕様として許容する
- `id="toast"` 重複も同様にプレビュー断片由来で、現時点では仕様として許容する
- `Origin: Project-specific` かつ `Usage: 使用箇所なし` のカードは、現時点ではカタログから削除運用にしている（再利用先ができた場合のみ再追加）
- `Project-specific` で実利用のない要素は、`md3` だけでなく `docs/*.html` 側の定義・実装も削除対象とする
- `Token（:root / --md-sys-*）` と `Core（共通）` は標準仕様として管理し、適用HTMLには未使用定義を含む標準セット貼り付けを許容する
- カタログ表示整形の一部を `md3/index.html` のJSで実施している（`Source:` の `Usage` への吸収、`Usage` 重複リンク除去、`使用箇所なし` チップ整理）
- `../docs/*.html` への参照リンク自体は現状すべて存在している
- コンポーネントカタログとしての構成（プレビュー + クラス + コード例 + 実利用リンク）は一貫している
