# Prompt ツール README

`docs/prompt/` 配下には、生成AIへ引き渡すための定型プロンプトを素早く組み立てる HTML ツールを配置します。

現時点の対象は `prompt-gen` です。ブラウザだけで動作し、配布物は single-file web app として完結します。

## 関連README

- [ルートREADME](../../README.md)
- [LHT共通部品README](../../lht-cmn/README.md)
- [prompt-gen 検索とキーワード設計](./prompt-gen-search-and-keywords.md)
- [prompt-definitions-ai-expansion の役割](./prompt-definitions-ai-expansion.md)
- [prompt-definitions-ai-suggest の役割](./prompt-definitions-ai-suggest.md)
- [prompt-definitions-popular の役割](./prompt-definitions-popular.md)
- [docs/prompt TODO](./TODO.md)

## 対象ファイル

- 配布物（生成物）:
  - `docs/prompt/prompt-gen.html`
- 編集元:
  - `docs/prompt/prompt-gen-src.html`
  - `docs/prompt/src/prompt-gen/css/app.css`
  - `docs/prompt/src/prompt-gen/ts/prompt-definitions.ts`
  - `docs/prompt/src/prompt-gen/ts/prompt-definitions-ai-expansion.ts`
  - `docs/prompt/src/prompt-gen/ts/prompt-definitions-ai-suggest.ts`
  - `docs/prompt/src/prompt-gen/ts/prompt-definitions-popular.ts`
  - `docs/prompt/src/prompt-gen/ts/main.ts`
- テスト:
  - `docs/prompt/tests/prompt-gen-main.test.js`

`prompt-gen.html` は直接編集せず、編集元を更新してビルドで反映します。
候補ボタンの追加・変更・削除は `docs/prompt/src/prompt-gen/ts/prompt-definitions.ts` を変更対象とし、`prompt-gen.html` や生成済み `js` を直接編集しません。

`docs/prompt/src/prompt-gen/ts/prompt-definitions-ai-expansion.ts` には、既存 `prompt-definitions.ts` の延長上にある新規候補を生成AI視点で展開した `X` 系列を配置します。これらは UI 上では他の候補と同列に検索・表示されますが、定義ファイルは既存系列と分離して管理します。

`docs/prompt/src/prompt-gen/ts/prompt-definitions-ai-suggest.ts` には、既存系列の流れから自然に追加されそうな新規候補を生成AI視点で提案する `S` 系列を配置します。これらも UI 上では他の候補と同列に検索・表示されますが、既存系列や `X` 系列とは分離して管理します。

`docs/prompt/src/prompt-gen/ts/prompt-definitions-popular.ts` には、世間で広く使われている定番プロンプトを整理した `P` 系列を配置します。これらも UI 上では他の候補と同列に検索・表示されますが、自分の実務正本である `A` 系列とは分けて管理します。

### 系列の考え方

- `A` 系列:
  - 既存の基本系列です。人間にとって自然で簡潔な依頼文を中心に構成します。
- `X` 系列:
  - `A` 系列と目的感を大きく変えずに、生成AIが誤解しにくいように精密化した系列です。
- `S` 系列:
  - 既存系列の流れから自然に追加されそうな新規候補を、生成AI視点で提案する系列です。
  - 既存 `A` 系列のどこから派生した提案かを示したい場合は、`S101-001` のような枝番形式を用います。
- `P` 系列:
  - 世間で広く使われている、普及度の高い定番プロンプトを整理する系列です。

### 図解化系列の使い分け

- `S603-5xx`:
  - Mermaid を使った図解化を、生成AI視点の派生提案として扱う系列です。
  - `Mermaid timeline`、`Mermaid flowchart`、`Mermaid mindmap` など、構造化テキストから図へ落とし込みやすい表現を提案する用途を想定します。
- `P973` 以降:
  - 図解化を、世間的にも再利用しやすい定番プロンプトとして整理する系列です。
  - `図解化テキスト化`、`図解化描画指示`、`概念マップ化`、`タイムライン化`、`フローチャート化`、`マインドマップ化` などを含みます。
- 使い分けの目安:
  - AIに「こういう派生もありそう」と提案させたい場合は `S603-5xx`
  - 定番候補として安定運用したい場合は `P973` 以降

## ビルド

- `npm run build:prompt`

`scripts/build-prompt.mjs` が TypeScript を `docs/prompt/src/prompt-gen/js/*.js` へ変換し、その後 `prompt-gen-src.html` 内のローカル CSS / JS をインライン化して `prompt-gen.html` を生成します。

## テスト

- 単体テスト: `npm test -- docs/prompt/tests/prompt-gen-main.test.js`

現在の最小テストは次を対象にしています。

- 候補が一意に絞れたときの PR 文面生成
- 固定文面でのラベル接頭辞 ON / OFF
- 検索語変更時の commit ID クリアと出力更新

## 実装メモ

- `prompt-definitions.ts` に候補ボタン定義を集約する
- 候補ボタンの文言や本文追加は `prompt-definitions.ts` を編集して反映する
- 各定義は `id / label / keywords / requiresCommitId / buildBody()` を持つ
- `main.ts` は検索、選択状態、入力欄表示、生成結果更新、スクロール制御を担当する
- ハンバーガーメニューから `A / X / S / P` 系列の表示有無を切り替えられ、その設定は `localStorage` に保存される
- 検索は空欄で全候補表示、空白区切りで AND、各語の照合先は label / keywords / かな・カナ・ローマ字展開を含む

### 入力値制約

- `commitId` や `subject` のような可変入力は、そのまま本文へ埋め込まず、サニタイズ後の値をバッククオートで囲って返す
- 入力値は 1024 文字で打ち切り、以降は切り捨てる
- 制御文字、改行、タブなどは半角スペース 1 個へ変換する
- バッククオートはシングルクオートへ変換する
- これらは prompt injection への最低限の緩和策であり、完全な防御ではない
- `commitId` の文字種制限や、`subject` を命令ではなく文字列値として扱う明示文は、現時点では未実装で TODO 管理とする
- これは prompt injection リスクの軽減を目的とした最低限の制約であり、完全な防御ではない

## 検索とキーワード

- 検索ボックスの挙動と `keywords` の設計方針は [prompt-gen 検索とキーワード設計](./prompt-gen-search-and-keywords.md) を参照する
- `prompt-definitions.ts` の更新時は、候補本文だけでなく検索性もあわせて見直す

## 運用方針

- ビルド後の `docs/prompt/prompt-gen.html` は CDN や別ファイルの CSS / JS に依存しない single-file web app を維持する
- 画面側 UI は原則 `lht-*` を利用し、Material Web 直接利用は `lht-cmn` 内部へ寄せる
- 変更後は必要に応じて `npm run build:prompt` と関連テストを実行する
