# git-work-branch-list

対象ファイル: `docs/git/git-work-branch-list.html`

## 概要

複数リポジトリと複数ブランチの作業状況を、ローカルブラウザ上で一覧管理するツール。

## 入力項目

- リポジトリ URL
- 基準ブランチ
- 基準の扱い（remote / local）
- 作業ブランチ
- 作業の扱い（remote / local）
- リモート名

## 主要機能

- 一覧へ追加
- 一覧から `git-branch-diff.html` へ遷移
- 既存項目の編集
- 項目削除
- リポジトリ URL 末尾からの表示名自動生成
- `localStorage` への永続化

## `git-branch-diff` 連携メモ

- 一覧から `git-branch-diff.html` へ遷移して比較を行う方針
- 初期版で引き渡す URL パラメータ名
  - `baseBranch`
  - `baseScope`
  - `branchWork`
  - `scopeWork`
  - `remoteName`
- 初期版では未対応とする項目
  - `diffMode`
  - `useTripleDot`
  - `useStat200`
  - `lockOrigin`

## 保存

- 保存先はブラウザの `localStorage`
- リポジトリ外ファイルへの書き出しは行わない
