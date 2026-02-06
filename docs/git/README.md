# Git HTML ツール集

`docs/git/` 配下の HTML は、ブラウザだけで使える Git コマンドジェネレータです。すべて単一 HTML で完結し、オフラインで動作します。

## 一覧

- `docs/git/git-config-setup.html`
  - Git のユーザー名・メールアドレスをグローバル設定するコマンドを生成します。
- `docs/git/git-config-advanced-setup.html`
  - `core.autocrlf` や `push.default` など、Git の詳細設定をグローバルに反映するコマンドを生成します。
- `docs/git/git-branch-diff.html`
  - 2 ブランチ間の差分コマンド（`git diff` 系）を生成します。
- `docs/git/git-pseudo-squash.html`
  - `git reset --soft` と再コミットで履歴をまとめる「pseudo-squash」手順のコマンドを段階ごとに生成します。

## 使い方

対象の HTML をブラウザで開き、必要事項を入力して生成されたコマンドをそのままターミナルで実行します。

## git-pseudo-squash.html の Material Design 実装方針

`docs/git/git-pseudo-squash.html` は外部ライブラリに依存せず、単一 HTML 内で Material Design 仕様を再現しています。

- 命名は `md-*` で統一し、レイアウト/フォーム/ボタン/ツールチップ/スナックバー/コード表示をコンポーネント単位で定義する
- 色/角丸/影/タイポグラフィは CSS 変数 `--md-sys-*` に集約し、要素側はトークン参照のみで組み立てる
- 主要コンポーネントは以下のクラスで構成する
- `md-card` `md-input` `md-select` `md-textarea` `md-button` `md-icon-btn` `md-switch` `md-tooltip` `md-snackbar` `md-code`
- 表示切替は `md-hidden` `md-visible` `md-disabled` を使い、JS 側はクラスの付け替えだけで制御する
- 「i」アイコンはインライン SVG で実装し、色/サイズ/余白は `md-tooltip-trigger` 側で統一する

## Tailwind CSS から Material Design への書き換えルール

このプロジェクトでは、Tailwind 的ユーティリティをすべて撤去し、Material Design のコンポーネント指向に置き換えています。

- チェックボックスとトグルの使い分けは行わず、選択肢はすべてトグルに統一する
- トグルはラベルの左側に配置する（左右の違いで迷わないように固定）
- ユーティリティ連打の構造はやめ、意味単位の `md-*` コンポーネントに再構成する
- 色/角丸/影/タイポは `--md-sys-*` に集約し、要素側はトークン参照のみにする
- `input/select/textarea` は `md-input` `md-select` `md-textarea` に統一する
- 必須表示はラベル横の `md-required-chip` に統一する
- ツールチップは `md-tooltip-group` + `md-tooltip-content` で構成し、`i` はインライン SVG を使う
- ツールチップ本文は `md-tooltip` に `font-weight: 400` を指定し、細めの表現に統一する
- 表示状態は `md-hidden` `md-visible` `md-disabled` に統一し、JS はクラス切替のみで制御する

## フォーム配置の実装メモ

- ラベル右に入力を並べるときは `md-form-row md-form-row--nowrap` を使う
- モバイル幅では `@media (max-width: 640px)` で wrap させて詰まりを防ぐ
- `md-field-stack`（縦並び）の場合は `.md-field-stack .md-input` を `flex: 0 0 auto` にして縦に伸びるのを防ぐ
- 入力右端にアクションボタンを半分埋める配置は `md-input-wrap` + `md-input-action` を使う
- ラベルと入力を同じ行に固定したいときは `md-form-row md-form-row--nowrap` を使う

## Material Design 適用時の実装メモ（他フォルダの知見）

- アコーディオンは `<details>/<summary>` を使うのが軽量で管理しやすい。初期状態は `open` 属性で制御する
- ラジオはピル型ではなく、シンプルなラジオ＋ラベルを基準にする
- ツールチップは横幅を制御して縦長化を避ける（例: `max-width` と `min-width` を併用）
- ラベルと入力の並びは基本「ラベル直下に入力」。横並びにする場合は行高とベースラインを揃える
