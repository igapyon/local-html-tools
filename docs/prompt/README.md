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

## 検索とキーワード

- 検索ボックスの挙動と `keywords` の設計方針は [prompt-gen 検索とキーワード設計](./prompt-gen-search-and-keywords.md) を参照する
- `prompt-definitions.ts` の更新時は、候補本文だけでなく検索性もあわせて見直す

## 運用方針

- ビルド後の `docs/prompt/prompt-gen.html` は CDN や別ファイルの CSS / JS に依存しない single-file web app を維持する
- 画面側 UI は原則 `lht-*` を利用し、Material Web 直接利用は `lht-cmn` 内部へ寄せる
- 変更後は必要に応じて `npm run build:prompt` と関連テストを実行する
