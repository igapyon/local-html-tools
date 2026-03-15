# ARCHITECTURE

## UIレイヤー方針（LHT）

- 方針の正本は `lht-cmn/README.md` とする
- 本書では要点のみ扱う:
  - 画面側のUIは `lht-*` Web Components を基本とする
  - Material Web は `lht-cmn` 内部で優先利用する
  - 実運用の共通スタイルは `lht-cmn/css/components.css` に集約する

### `lht-cmn` の役割

`lht-cmn` は、単なる共通 CSS 置き場ではなく、`local-html-tools` 全体の UI 公開層を担うコンポーネント基盤である。各画面は原則として `lht-*` を利用し、Material Web の採用有無や細かな DOM 構造の違いを画面側へ漏らさない。

- **公開 UI 層の統一**: 画面側が参照する UI API を `lht-*` に固定し、個別画面で `md-*` を直接組み立てる設計を避ける
- **内部実装の吸収**: `md-*` 優先 + fallback、または完全自前実装のどちらかで内部を構成し、依存の違いを `lht-cmn` 側で吸収する
- **共通ルールの集約**: ラベル、ヘルプ表示、必須表示、コピー導線、トースト、エラー表示、レスポンシブ時の振る舞いなどを横断的に統一する
- **保守境界の明確化**: 画面固有のレイアウト調整は各アプリ側、再利用可能な DOM 生成・アクセシビリティ・状態制御は `lht-cmn` 側が担当する

### `lht-cmn` の構成責務

- `lht-cmn/js/components.js`
  - `lht-*` Web Components の正本実装
  - 公開属性、公開メソッド、公開イベントの契約を保持する
  - Material Web 依存の吸収と fallback の提供を担う
- `lht-cmn/css/components.css`
  - 共通コンポーネントの見た目と状態表現の正本
  - pre-upgrade flash 抑止、tooltip 幅制御、共通レイアウトルールなどを保持する
- `lht-cmn/catalog/index.html`
  - 実表示と利用例を並べて確認するカタログ
  - UI の実装・レビュー・横展開時の参照先として使う
- `lht-cmn/vendor/*`
  - 必要な vendor アセットの配置場所
  - 単一 HTML 配布方針に合わせ、外部 CDN 依存を避けるための基盤となる

### 画面側との責務分担

- **画面側が持つ責務**
  - ツール固有の入力項目、業務ロジック、生成ロジック
  - 画面固有の配置や余白など、局所的なレイアウト調整
  - `field-id` など既存 JS 互換を保つための公開 ID 設計
- **`lht-cmn` が持つ責務**
  - 共通 UI パーツの DOM 構築
  - Material / fallback 差異の吸収
  - `active`、`show()`、`hide()` など表示制御 API の標準化
  - `role`、`aria-live`、`aria-hidden` などアクセシビリティ契約の標準化

### `lht-cmn` を使う理由

- 各ページで重複していた UI 実装を削減できる
- 画面間の見た目と操作感を揃えやすい
- 共通部品単位でレビューできるため、修正影響の把握がしやすい
- 生成 AI を含む変更作業で、個別画面ごとの独自実装を増やさずに済む
- 単一 HTML 生成を維持しつつ、開発時の再利用性と変更容易性を確保できる

### 代表的な共通コンポーネント

- **入力系**: `lht-text-field-help`, `lht-select-help`, `lht-switch-help`
- **補助UI系**: `lht-help-tooltip`, `lht-page-menu`, `lht-page-hero`
- **出力系**: `lht-command-block`, `lht-preview-output`
- **操作補助系**: `lht-file-select`, `lht-input-mode-toggle`
- **状態表示系**: `lht-loading-overlay`, `lht-toast`, `lht-error-alert`

## Material Design 実装ガイド

本プロジェクトでは、外部CSSに依存せず Material Design 系の見た目と操作感を再現する。画面側は原則 `lht-*` を利用し、`md-*` は `lht-cmn` 内部実装として扱う。詳細ルールやコンポーネント仕様は `lht-cmn/README.md` を参照する。

### 基本トークン

- 色や影は CSS 変数 `--md-sys-*` に集約する
- コンポーネント側はトークン参照のみで組み立てる

### 「i」ツールチップの標準

説明文はタイトル右の「i」アイコンに集約し、ホバーで表示する。

- **構成**: `md-tooltip-group` + `md-info-chip` + `md-tooltip-content` + `md-tooltip`
- **表示**: `md-tooltip-group:hover` で `md-tooltip-content` をフェードイン
- **幅**: 標準 `20rem`、必要なら `md-tooltip--wide`

#### 実装の基本形（参考）

```html
<span class="md-tooltip-group">
  <span class="md-info-chip">
    <svg aria-hidden="true" viewBox="0 0 24 24" class="md-info-icon" fill="none">
      <circle cx="12" cy="12" r="9" fill="#cbbcf0"/>
      <rect x="11" y="10" width="2" height="7" rx="1" fill="#ffffff"/>
      <circle cx="12" cy="7.5" r="1" fill="#ffffff"/>
    </svg>
  </span>
  <span class="md-tooltip-content md-tooltip">
    説明文…
  </span>
</span>
```

### 主要コンポーネント

- **レイアウト**: `md-page` `md-shell` `md-card` `md-section`
- **フォーム**: `md-label` `md-input` `md-select` `md-textarea` `md-field-block`
- **ボタン**: `md-button` `md-button--primary` `md-icon-btn`
- **コード表示**: `md-code-block` `md-code` `md-copy-button`
- **トースト**: `md-snackbar` `md-hidden` `md-visible`

### 追加クラス（用途別）

`git-pseudo-squash.html` を基準にしつつ、以下はツール固有で追加されたクラス群。

- **find-gen.html**
  - グリッド系: `md-grid` `md-grid-2` `md-grid-3`
  - フォーム行: `md-form-row` `md-form-row--nowrap`
- **text-processing.html**
  - テキストボタン: `md-text-button`
  - オプションカード: `md-option-card`
  - トグル: `md-toggle` `md-toggle-input` `md-toggle-track`
  - アコーディオン: `md-accordion`
  - 出力枠: `md-output` `md-output-wrap`

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

## music ディレクトリの例外運用

`docs/music/` は「配布は単一HTML」「開発は分割ソース」を採用する。

- 開発用テンプレート: `docs/music/*-src.html`
- 分割ソース: `docs/music/src/...`（`css` / `ts` / `js`）
- 配布用生成物: `docs/music/*.html`
- ビルドスクリプト: `scripts/build-music.mjs`

運用ルール:

- 手編集対象は `*-src.html` と `src/` のみ
- `*.html` は生成物として扱い、直接編集しない
- 変更後は `npm run build:music` で再生成する
- PRには `docs/music/*.html` を含める
