# Prompt ツール README

`docs/prompt/` 配下には、生成AIへ引き渡すための定型プロンプトを素早く組み立てる HTML ツールを配置します。

現時点の対象は `prompt-gen` です。ブラウザだけで動作し、配布物は single-file web app として完結します。

## 関連README

- [ルートREADME](../../README.md)
- [LHT共通部品README](../../lht-cmn/README.md)

## 対象ファイル

- 配布物（生成物）:
  - `docs/prompt/prompt-gen.html`
- 編集元:
  - `docs/prompt/prompt-gen-src.html`
  - `docs/prompt/src/prompt-gen/css/app.css`
  - `docs/prompt/src/prompt-gen/ts/prompt-definitions.ts`
  - `docs/prompt/src/prompt-gen/ts/main.ts`
- テスト:
  - `docs/prompt/tests/prompt-gen-main.test.js`

`prompt-gen.html` は直接編集せず、編集元を更新してビルドで反映します。

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
- 各定義は `id / label / keywords / requiresCommitId / buildBody()` を持つ
- `main.ts` は検索、選択状態、入力欄表示、生成結果更新、スクロール制御を担当する
- 検索は空欄で全候補表示、空白区切りで AND、各語の照合先は label / keywords / かな・カナ・ローマ字展開を含む

## 運用方針

- ビルド後の `docs/prompt/prompt-gen.html` は CDN や別ファイルの CSS / JS に依存しない single-file web app を維持する
- 画面側 UI は原則 `lht-*` を利用し、Material Web 直接利用は `lht-cmn` 内部へ寄せる
- 変更後は必要に応じて `npm run build:prompt` と関連テストを実行する
