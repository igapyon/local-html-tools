# Git pseudo-squash 仕様

対象ファイル: `docs/git/git-pseudo-squash.html`

## 1. ドキュメント方針
この文書は次の2つを分けて記載する。

1. 現行仕様（実装済みの挙動）
2. 追加仕様案（未実装）

## 2. 現行仕様（実装済み）

### 2.1 画面の役割
`reset --soft` と再コミットを前提に、pseudo-squash のためのコマンド列を生成する。
出力ブロックは以下の4つ。

1. 作業開始 (基準ブランチから作成)
2. 作業をまとめる (squash)
3. リモートに反映 (push)
4. まとめる予定の作業 (diff)

### 2.2 入力項目と初期値
| ID | ラベル | 型 | 初期値 | 現行挙動 |
|---|---|---|---|---|
| `squashBaseBranch` | 基点ブランチ | text | `devel` | datalist候補あり。履歴クリアボタンあり。 |
| `workBranch` | 作業ブランチ | text | 空 | 初期化時、空なら `tigaMMddxxx` 形式で自動補完。 |
| `shellEnvPowerShell` | PowerShell | checkbox | OFF | ONでPowerShell向け、OFFでPOSIX向けコマンド。 |
| `lockOrigin` | リモート + origin と作業 | checkbox | ON | ONで `baseRemote`/`squashRemote` を `origin` に固定して入力を隠す。 |
| `squashBaseScope` | 基点の参照先 | select | `remote` | `remote`/`local` 切替。 |
| `baseRemote` | 基点リモート | text | `origin` | `scope=local` または `lockOrigin=ON` で無効化。 |
| `squashRemote` | squashリモート | text | `origin` | `lockOrigin=ON` で無効化かつ非表示。 |
| `commitMessage` | コミットメッセージ | textarea | 空 | rebase生成時に必須。 |
| `useCurrentBranch` | 現在ブランチで作業 | checkbox | ON | ON時、rebase/push/diff で `HEAD`/現在ブランチ運用。 |
| `repoUrl` | リポジトリ URL | text | 空 | Git 作業一覧との連携、および外部 URL を開く導線で利用。 |

### 2.3 文字列のクォート仕様
`quoteIfNeeded(value, shell)` を利用する。

1. `value` が空ならそのまま返す。
2. `value` が `[^\w@%+=:,./-]` を含まなければ無加工で返す。
3. PowerShell時は `'` を `''` にして全体を単引用符で囲む。
4. POSIX時は `'` を `'\''` 相当にエスケープして全体を単引用符で囲む。

### 2.4 コマンド生成仕様

#### 2.4.1 作業開始 (`createBranchCmd`)
前提入力:
1. `workBranch` 必須
2. `squashBaseBranch` 必須

生成:
1. `squashBaseScope = remote` の場合  
`git fetch <baseRemote>`  
`git switch -c <workBranch> <baseRemote>/<squashBaseBranch>`  
`git status -sb`
2. `squashBaseScope = local` の場合  
`git switch -c <workBranch> <squashBaseBranch>`  
`git status -sb`

補足:
`<baseRemote>/<squashBaseBranch>` は、`baseRemote` と `squashBaseBranch` を別々に `quoteIfNeeded` した文字列を `/` 連結している。

#### 2.4.2 作業をまとめる (`rebaseCmd`)
前提入力:
1. `squashBaseBranch` 必須
2. `useCurrentBranch = false` のとき `workBranch` 必須
3. `commitMessage` 必須

基点:
1. `squashBaseScope = remote` のとき `<base> = <baseRemote>/<squashBaseBranch>`
2. `squashBaseScope = local` のとき `<base> = <squashBaseBranch>`

共通生成:
1. `git fetch <squashRemote>`
2. `useCurrentBranch = false` のときのみ `git switch <workBranch>`
3. `git reset --soft <base>`
4. 一時ファイル経由で `git commit -F`
5. `git status -sb`

コミットメッセージの渡し方:
1. POSIX: `mktemp` + heredoc + `rm`
2. PowerShell: `New-TemporaryFile` + here-string + `Set-Content` + `Remove-Item`

#### 2.4.3 リモートに反映 (`pushCmd`)
前提入力:
1. `useCurrentBranch = false` のとき `workBranch` 必須

生成:
1. `useCurrentBranch = true` の場合  
`git push --force-with-lease <squashRemote> HEAD`  
`git pull`  
`git branch -m "$(git branch --show-current)" "$(git branch --show-current)-done"`  
`git status -sb`
2. `useCurrentBranch = false` の場合  
`git push --force-with-lease <squashRemote> <workBranch>`  
`git pull`  
`git branch -m <workBranch> <workBranch>-done`  
`git status -sb`

補足:
PowerShellモードでも `useCurrentBranch = true` 時のリネーム行は POSIX 形式の `$(...)` を出力する。

#### 2.4.4 まとめる予定の作業 (`plannedDiffCmd`)
前提入力:
1. `squashBaseBranch` 必須
2. `useCurrentBranch = false` のとき `workBranch` 必須

生成:
1. `squashBaseScope = remote` のときのみ `git fetch <baseRemote>`
2. `git diff <base>..<target>`
3. 基点コミットID表示
4. `git status -sb`

`<target>`:
1. `useCurrentBranch = true` のとき `HEAD`
2. `useCurrentBranch = false` のとき `<workBranch>`

基点コミットID表示:
1. POSIX: `echo "## Base branch commit ID: $(git rev-parse <base>)"`
2. PowerShell: `Write-Host ("## Base branch commit ID: " + (git rev-parse <base>))`

### 2.5 バリデーションとエラー表示
各生成関数は、必須入力不足時に対象出力を空文字へ設定して終了する。
`silent = false` の場合のみ `alert(...)` を表示する。
初期化および自動更新では `silent = true` で呼び出しているため、通常操作時に alert は出ない。

### 2.6 UI状態制御
`updateBaseScope()` が次を制御する。

1. `baseRemote` 無効化条件: `squashBaseScope !== "remote"` または `lockOrigin = ON`
2. `lockOrigin = ON` のとき `baseRemote = "origin"` を強制
3. `lockOrigin = ON` のとき `squashRemote` を無効化し `squashRemote = "origin"` を強制
4. `lockOrigin = ON` のとき `baseRemoteRow`/`squashRemoteRow`/`squashRemoteLabel` を非表示
5. 最後に `regenerateAllCommands()` を実行

`toggleCurrentBranch()` は `workBranch` の入力自体は無効化せず、常に編集可能のまま再生成のみ行う。

### 2.7 自動再生成トリガ
`regenerateAllCommands()` は次の4関数を `silent: true` で呼ぶ。

1. `generateCreateBranchCommand`
2. `generateRebaseCommand`
3. `generatePushCommand`
4. `generatePlannedDiffCommand`

イベント設定:
1. `setupCreateBranchAutoUpdate()`  
`squashBaseBranch`, `workBranch`, `squashBaseScope`, `baseRemote`, `squashRemote`, `shellEnvPowerShell`, `lockOrigin` に `input/change` を付与
2. `setupRebaseAutoUpdate()`  
`squashBaseBranch`, `workBranch`, `squashBaseScope`, `baseRemote`, `squashRemote`, `commitMessage` に `input/change` を付与  
`useCurrentBranch`, `shellEnvPowerShell`, `lockOrigin` に `change` を付与
3. HTML 側の `onchange` も併用 (`toggleOriginLock`, `updateBaseScope`, `toggleCurrentBranch`)

### 2.8 初期化順序
実行順は以下。

1. `setupBaseBranchSuggestions()`
2. `loadPersistedBaseBranch()`
3. `updateBaseScope()`
4. `toggleCurrentBranch()`
5. `setDefaultWorkBranch()`
6. `setupBaseBranchPersistence()`
7. `setupCreateBranchAutoUpdate()`
8. `generateCreateBranchCommand({ silent: true })`
9. `setupRebaseAutoUpdate()`
10. `generateRebaseCommand({ silent: true })`
11. `generatePushCommand({ silent: true })`
12. `generatePlannedDiffCommand({ silent: true })`
13. `setupCodeSelectAll()`

補足:
`setupCodeSelectAll()` は `code.selectable-code` を対象にするが、現行HTML内に該当クラスはない。

### 2.9 localStorage 現行仕様
現行で保存しているのは基点ブランチ関連のみ。

キー:
1. `gitPseudoSquash.squashBaseBranch`
2. `gitPseudoSquash.squashBaseBranchHistory`

仕様:
1. 履歴上限は 12 件 (`BASE_BRANCH_HISTORY_MAX = 12`)
2. 履歴は重複除去して先頭優先
3. 既定候補 + 履歴をマージして datalist 描画
4. 保存タイミングは `squashBaseBranch` の `change` イベント時
5. 復元時は `squashBaseBranch` を優先し、なければ履歴先頭
6. クリアボタンは上記2キーを削除し、候補再描画してトースト表示
7. localStorage例外は握りつぶして継続

### 2.10 補助機能
1. `copyToClipboard(id)` は一時 `textarea` と `document.execCommand("copy")` でコピーする
2. コピー対象が空文字なら何もしない
3. コピー成功時はトースト「コピーしました」を2秒表示
4. メニューボタンは `#menuPanel` の `md-hidden` をトグル

### 2.11 Git 作業一覧との連携
`git-pseudo-squash` から `git-work-list` への連携機能を持つ。

前提:
1. `repoUrl` 必須
2. `squashBaseBranch` 必須
3. `workBranch` 必須

保存内容:
1. `repoUrl`
2. `baseBranch`
3. `baseScope`
4. `compareBranch`
5. `compareScope = "local"`
6. `compareUseHead`
7. `remoteName`

現行挙動:
1. Git 作業一覧への保存時は、同一の `repoUrl` / `baseBranch` / `compareBranch` があれば更新し、なければ追加する
2. `saveToWorkBranchListAndOpen()` 実行時は、保存後に `git-work-list.html` へ遷移する
3. `updateWorkBranchWithCurrentTime()` 実行時は、作業ブランチ名を更新したうえで、保存可能なら Git 作業一覧側の同一項目も更新する
4. 保存成功時は、追加・更新内容に応じたトーストを表示する

補足:
1. `repoUrl` が GitHub Pull Request URL の場合は、保存前にリポジトリ URL へ正規化する
2. `remoteName` は `lockOrigin = ON` のとき `origin` 固定とする

## 3. 追加永続化仕様（実装済み）

### 3.1 目的
`Git pseudo-squash コマンドジェネレータ` の「作業モード系設定」を `localStorage` に保存し、次回アクセス時に前回設定を復元する。

### 3.2 永続化対象
1. `shellEnvPowerShell` (`boolean`)
2. `lockOrigin` (`boolean`)
3. `squashBaseScope` (`"remote"` or `"local"`)
4. `baseRemote` (`string`)
5. `squashRemote` (`string`)
6. `useCurrentBranch` (`boolean`)

### 3.3 追加 localStorage キー
1. `gitPseudoSquash.ui.shellEnvPowerShell`
2. `gitPseudoSquash.ui.lockOrigin`
3. `gitPseudoSquash.ui.squashBaseScope`
4. `gitPseudoSquash.ui.baseRemote`
5. `gitPseudoSquash.ui.squashRemote`
6. `gitPseudoSquash.ui.useCurrentBranch`

既存キーは維持する。

### 3.4 読み込み仕様
1. HTML初期値を読み込む
2. localStorage保存値があれば復元する
3. `updateBaseScope()` でUI整合をとる
4. 全コマンドを再生成する

### 3.5 保存仕様
1. 対象項目の `input/change` で保存
2. 保存失敗時は例外を握りつぶして継続

### 3.6 `lockOrigin` との整合仕様
1. `lockOrigin = true` 時の実行値は `baseRemote = origin`, `squashRemote = origin`
2. 推奨: `lockOrigin = true` 中でも、過去入力した `baseRemote/squashRemote` 保存値は破棄しない
3. 理由: `lockOrigin = false` に戻したとき以前の入力値を復元しやすい

### 3.7 既定値
現行互換とする。

1. `lockOrigin = true`
2. `squashBaseScope = "remote"`
3. `baseRemote = "origin"`
4. `squashRemote = "origin"`
5. `useCurrentBranch = true`
6. `shellEnvPowerShell = false`

### 3.8 クリア仕様
1. 既存「基点ブランチ履歴クリア」は現状どおり基点履歴のみ対象
2. UI設定クリアは別機能として分離し、「設定をクリア」ボタンで実行する
3. 確認ダイアログ文言は次を使用する  
`ローカルに保存されているこのツールの設定をクリアします。よろしいですか？`
4. 「設定をクリア」は `gitPseudoSquash.ui.*` キーを削除し、`gitPseudoSquash.squashBaseBranch` は既定値 `devel` に戻す
5. 基点ブランチ履歴キー（`gitPseudoSquash.squashBaseBranchHistory`）も削除し、autocomplete履歴を初期化する
6. 実行後はUIを既定値へ戻し、候補を再描画して全コマンドを再生成する
