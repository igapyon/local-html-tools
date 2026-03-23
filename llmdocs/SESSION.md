# Current Session

## フォーカス

ルート文書と `llmdocs/` 文書の役割を整理し、重複や古さが目立っていた md 群を現在の構成に合わせて更新した。

## 完了済み

- `README.md` を、実ファイル構成、公開対象、ビルド運用、TODO の使い分けに合わせて更新した
- `THIRD_PARTY_NOTICES.md` を、実際に利用している依存関係と同梱物に合わせて更新した
- ルート `ARCHITECTURE.md` を、UI 方針中心の文書から全体設計書へ再構成した
- `GLOSSARY.md` に、現行アーキテクチャと運用で頻出する用語を追加した
- ルート `TODO.md` を中長期バックログへ整理した
- `llmdocs/TODO.md` を直近の作業キューへ整理した
- `llmdocs/RULES.md` に、2 系統の TODO の使い分けを明記した
- `llmdocs/ARCHITECTURE.md` を、ルート `ARCHITECTURE.md` を正本とする短い要約版へ整理した
- `llmdocs/STATE.md` を、ドキュメント整理後の現状に合わせて更新した
- `docs/git/README.md` と `docs/password/README.md` の古い記述を整理した

## 次の一手

次は、必要なら `docs/prompt/README.md` のようなカテゴリ内長文 README について、役割が「仕様」「設計背景」「バックログ」のどれに寄っているかを見直し、必要なものだけを残す。

## メモ

- `llmdocs/` は、短く、最新で、作業再開時に役立つ状態を保つ
- 具体的な設計の正本はルート文書側に寄せ、`llmdocs/` では重複を増やさない
