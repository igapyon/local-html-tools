# Architecture

この文書は LLM 向けの短い要約版です。  
アーキテクチャの正本はルート [`ARCHITECTURE.md`](/Users/igapyon/Documents/git/local-html-tools/ARCHITECTURE.md) を参照してください。

## 最重要ポイント

- このリポジトリは、`docs/` 配下に多数の独立したローカル Web ツールを持つ Static Web App 集である
- 配布形態は原則として「各ツールが単一 HTML で自己完結する」ことを維持する
- 開発時は `*-src.html` や `src/` 配下の分割ソースを編集し、生成物の `*.html` は直接編集しない
- UI は原則 `lht-*` を公開 API とし、共通 UI 基盤は `lht-cmn/` に集約する
- Material Web は画面側で直接ばらまかず、`lht-cmn` 内部実装として優先利用する

## 主要領域

- `docs/`
  - 利用者向けの各ツール本体
- `scripts/`
  - `build-*.mjs` と `scripts/lib/single-html.mjs`
- `lht-cmn/`
  - 共有 UI コンポーネント、CSS、vendor、テスト
- `md3/`
  - 参照用途寄りの Material Design 関連アセット

## 開発時の読み方

- 全体構造や責務分担を知りたいときはルート [`ARCHITECTURE.md`](/Users/igapyon/Documents/git/local-html-tools/ARCHITECTURE.md)
- 現在のタスクは [`TODO.md`](/Users/igapyon/Documents/git/local-html-tools/llmdocs/TODO.md)
- 継続的な状態把握は [`STATE.md`](/Users/igapyon/Documents/git/local-html-tools/llmdocs/STATE.md)
- 直前の作業文脈は [`SESSION.md`](/Users/igapyon/Documents/git/local-html-tools/llmdocs/SESSION.md)

## LLM向け注意点

- `docs/*/*.html` が存在しても、対応する `*-src.html` や `src/` がある場合はそちらが正本である
- `lht-cmn` に要約されていない UI 重複を見つけたら、個別画面で増やすより共通化を先に検討する
- ビルド、生成物、責務分担に変更が入る場合は、ルート `ARCHITECTURE.md` の更新を優先する
