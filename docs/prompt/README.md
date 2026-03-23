# Prompt ツール README

`docs/prompt/` 配下には、生成 AI へ渡すための定型プロンプトを素早く組み立てる HTML ツールを配置します。

現時点の対象は `prompt-gen` です。ブラウザだけで動作し、配布物は single-file web app として完結します。

## 関連文書

- [ルート README](../../README.md)
- [ルート ARCHITECTURE](../../ARCHITECTURE.md)
- [LHT 共通部品 README](../../lht-cmn/README.md)
- [prompt-gen 検索とキーワード設計](./prompt-gen-search-and-keywords.md)
- [prompt-definitions-ai-expansion の役割](./prompt-definitions-ai-expansion.md)
- [prompt-definitions-ai-suggest の役割](./prompt-definitions-ai-suggest.md)
- [prompt-definitions-popular の役割](./prompt-definitions-popular.md)
- [prompt-definitions-popular 再編案](./prompt-definitions-popular-reorganization.md)
- [docs/prompt TODO](./TODO.md)
- [prompt 履歴メモ](./prompt-history.md)

## 対象ファイル

- 配布物:
  - `docs/prompt/prompt-gen.html`
- 編集元:
  - `docs/prompt/prompt-gen-src.html`
  - `docs/prompt/src/prompt-gen/css/app.css`
  - `docs/prompt/src/prompt-gen/ts/main.ts`
  - `docs/prompt/src/prompt-gen/ts/prompt-markdown-util.ts`
  - `docs/prompt/src/prompt-gen/ts/prompt-definitions.ts`
  - `docs/prompt/src/prompt-gen/ts/prompt-definitions-ai-expansion.ts`
  - `docs/prompt/src/prompt-gen/ts/prompt-definitions-ai-suggest.ts`
  - `docs/prompt/src/prompt-gen/ts/prompt-definitions-popular.ts`
- テスト:
  - `docs/prompt/tests/prompt-gen-main.test.js`

`prompt-gen.html` は生成物です。直接編集せず、編集元を更新して `npm run build:prompt` で反映します。

## prompt-gen の役割

`prompt-gen` は、検索と候補選択を通じて定型プロンプトを組み立てるツールです。主な役割は次のとおりです。

- 候補定義の検索と選択
- 可変引数の入力
- 出力オプションの付与
- 生成結果のコピー、共有リンク生成、JSON エクスポート/インポート
- 一部表示設定や入力状態の `localStorage` 保存

UI は `lht-*` を優先して使い、Material Web 直接利用は `lht-cmn/` 内部へ寄せます。

## 系列の考え方

候補定義は系列ごとに分けて管理します。

- `A` 系列:
  - 自分の実務で常用する正本系列
- `X` 系列:
  - `A` 系列を AI 向けに詳細化した系列
- `S` 系列:
  - 既存系列から自然に派生しそうな提案系列
- `P` 系列:
  - 世間で広く使われる定番プロンプト整理系列

候補ボタン定義の追加・変更・削除は `prompt-definitions*.ts` を更新します。生成済み HTML や JS は直接編集しません。

## 実装上の要点

- `main.ts`
  - 検索、候補表示、選択状態、入力欄表示、出力更新、共有リンク、JSON 入出力を担当します。
- `prompt-markdown-util.ts`
  - Markdown 出力指示やハルシネーション防止ルールの共通付与を担当します。
- `prompt-definitions*.ts`
  - 候補定義を系列ごとに分担します。

検索は空欄で全候補表示、空白区切りで AND 検索です。照合対象には `label`、`keywords`、かな・カナ・ローマ字展開を含みます。

出力オプションでは `Markdown出力`、`文体`、`幻想防止`、`自己レビュー` などを扱います。候補本文に埋め込まれた指示があれば既定値へ反映し、埋め込みがない場合でも画面上の選択を後付けできます。

`幻想防止` は `none / low / high` の 3 段階です。詳細な判定方針や系列ごとの扱いは、README に長く固定せず、`prompt-markdown-util.ts` と関連定義ファイルを正本として保ちます。

可変入力はそのまま本文へ埋め込まず、最小限のサニタイズを通して扱います。これは prompt injection 軽減策であり、完全防御ではありません。

## ビルド

- `npm run build:prompt`

`scripts/build-prompt.mjs` が TypeScript を `docs/prompt/src/prompt-gen/js/*.js` へ変換し、その後 `prompt-gen-src.html` 内のローカル CSS / JS をインライン化して `prompt-gen.html` を生成します。

## テスト

- `npm test -- docs/prompt/tests/prompt-gen-main.test.js`

現在の最小テストでは、候補選択、出力オプション反映、共有リンク、JSON エクスポート/インポートなどを確認します。

## 運用メモ

- 配布物は CDN や外部 CSS / JS に依存しない single-file web app を維持します。
- 画面側 UI は原則 `lht-*` を利用します。
- 実装変更後は必要に応じて `npm run build:prompt` と関連テストを実行します。
- prompt 系の詳細メモや個別検討事項は README へ溜め込まず、必要に応じて専用 `.md` または `docs/prompt/TODO.md` へ分離します。
