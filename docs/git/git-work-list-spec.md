# git-work-list

対象ファイル: `docs/git/git-work-list.html`

## 概要

複数リポジトリと複数ブランチの作業状況を、ローカルブラウザ上で一覧管理するツール。

現時点では主に Git 作業を前提としているが、今後は Git 連携を使わず、単なる URL とメモだけを管理する用途にも対応する。

## エントリ種別

- `git`
  - 現行の標準種別
  - Git ブランチ比較や pseudo-squash 連携を前提とする
- `url`
  - Git 連携なしの軽量種別
  - URL とメモを中心に扱う

既存データに `entryType` が保存されていない場合は、後方互換のため `git` とみなす。

## 入力項目

### `git` 種別

- リポジトリ URL
- 基準ブランチ
- 基準の扱い（remote / local）
- 作業ブランチ
- 作業の扱い（remote / local）
- リモート名

### `url` 種別

- リポジトリ URL

`url` 種別では、基準ブランチ、作業ブランチ、scope、リモート名は入力させない。

## 主要機能

### 共通

- 一覧へ追加
- 既存項目の編集
- 項目削除
- リポジトリ URL 末尾からの表示名自動生成
- メモ管理
- `localStorage` への永続化

### `git` 種別のみ

- 一覧から `git-branch-diff.html` へ遷移
- 一覧から `git-pseudo-squash.html` へ遷移
- Git 前提の各種導線表示

### `url` 種別のみ

- リポジトリ URL を開く
- Git 前提の導線ボタンは表示しない

## `git-branch-diff` 連携メモ

- 一覧から `git-branch-diff.html` へ遷移して比較を行う方針
- 初期版で引き渡す URL パラメータ名
  - `baseBranch`
  - `baseScope`
  - `workBranch`
  - `workScope`
  - `remoteName`
- 初期版では未対応とする項目
  - `diffMode`
  - `useTripleDot`
  - `useStat200`
  - `lockOrigin`

## 保存

- 保存先はブラウザの `localStorage`
- リポジトリ外ファイルへの書き出しは行わない
- `entryType` を保存し、`git` と `url` を判別する
