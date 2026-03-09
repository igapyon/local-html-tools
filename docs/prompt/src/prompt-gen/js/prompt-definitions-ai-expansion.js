const aiExpansionPromptDefinitions = [
    {
        id: "ai-expansion-directory-markdown-check-request",
        label: "X100: ディレクトリ内の内容を確認して把握(AI詳細)",
        keywords: ["readme", "markdown", "directory", "contents check", "documentation survey", "ディレクトリ", "内容", "確認", "把握", "README確認", "md確認", "資料把握", "役割整理", "りーどみー", "でぃれくとり", "ないよう", "かくにん", "はあく", "しりょうはあく", "やくわりせいり"],
        requiresCommitId: false,
        buildBody: () => `README.md など、このディレクトリの内容を表す markdown (.md) を確認して内容を把握してください。単に存在を列挙するのではなく、各 markdown が何を説明しているのか、どれが正本に近いのか、今回の作業判断に直接効きそうなのはどれか、を意識して読み取ってください。必要に応じて、対応するソースコードや機能との関係も簡潔に押さえ、次に何を読むべきか判断できる程度に整理して把握してください。`
    },
    {
        id: "ai-expansion-practical-index-request",
        label: "X101: ディレクトリ内容整理 markdown を作成(AI詳細)",
        keywords: ["index", "overview", "practical index", "reading order", "source mapping", "markdown", "documentation map", "実用的", "INDEX", "概要", "読む順番", "優先順位", "正本", "補助資料", "ソース対応", "資料整理", "じつようてき", "がいよう", "よむじゅんばん", "ゆうせんじゅんい", "せいほん", "ほじょしりょう", "そーすたいおう"],
        requiresCommitId: false,
        buildBody: () => `いま作業しているディレクトリに含まれるファイルについて、無理のない範囲で内容を調べて、それを整理した markdown (.md) ファイルを作成または更新してください。単なるファイル一覧ではなく、作業判断に使いやすいように、各資料の役割、正本か補助資料か、何に対応するか、どの順番で読むとよいかが分かるように整理してください。必要であれば、対応するソースコードや機能も簡潔に関連付けてください。既存の適切な対象ファイルがあればそれを更新または加筆し、妥当な対象ファイルがない場合は適切なファイル名の markdown ファイルを新規作成してそこに記述してください。これは次回に生成AIがこのディレクトリを開いた時の走査のコストを削減することについても期待される効果となっています。`
    },
    {
        id: "ai-expansion-markdown-update-check-request",
        label: "X102: markdown 更新漏れの確認(AI詳細)",
        keywords: ["markdown", "md", "update", "doc", "docs", "documentation sync", "更新", "漏れ", "確認", "更新漏れ", "未更新", "正本更新", "追加すべき文書", "まーくだうん", "こうしん", "もれ", "かくにん", "こうしんもれ", "みこうしん", "せいほんこうしん"],
        requiresCommitId: false,
        buildBody: () => `実装の側に変更がおこなわれたことを前提に、これに対応する markdown (.md) に更新漏れがないか確認してください。単に「更新が必要そう」と述べるだけでなく、どの実装変更がどの markdown に対応するのか、既存の markdown の更新で足りるのか、新規の markdown を追加すべきなのか、を区別して整理してください。特に正本として扱うべき文書の更新漏れを優先して確認し、必要であれば更新候補のファイル名や追記すべき観点も示してください。`
    },
    {
        id: "ai-expansion-conversation-handover-request",
        label: "X301: セッションの引継テキストの生成(AI詳細)",
        keywords: ["handover", "session", "conversation", "markdown", "session handover", "structured handover", "引き継ぎ", "引継", "セッション", "会話", "引継テキスト", "未完了事項", "次に見る点", "構造化引継", "せっしょん", "かいわ", "ひきつぎ", "みかんりょうじこう", "つぎにみるてん", "こうぞうかひきつぎ"],
        requiresCommitId: false,
        buildBody: () => `今までのセッションでの会話を別の生成AIに引継 (KT) したいです。受け手が生成AIであることを前提に、状況を再現しやすい引き継ぎテキストを Markdown 形式で生成してください。特に、作業の目的、前提条件、決まったこと、未確定事項、未完了事項、次に見るべきファイルや論点、注意点を明確に区別して整理してください。可能であれば、受け手の生成AIがすぐに再開しやすい順番で並べてください。回答は ~~~~ で囲まれた一塊として出力してください。Markdown 内に backtick による code fence が含まれる場合があるため、外側の囲みは tilde を使ってください。`
    },
    {
        id: "ai-expansion-critical-review-request",
        label: "X304: 批判的レビューの依頼(AI詳細)",
        keywords: ["X304", "critical review", "findings first", "severity", "file reference", "批判的レビュー", "率直", "忖度しない", "迎合しない", "重大度順", "根拠付き", "ひはんてきれびゅー", "そんたくしない", "げいごうしない", "じゅうだいどじゅん", "こんきょつき"],
        requiresCommitId: false,
        buildBody: () => `これから批判的なレビューを実施してください。私は、迎合や忖度のない率直な指摘を求めています。私の意図に合わせて甘く評価したり、無理に肯定的にまとめたりしないでください。問題がある点、不適切な設計、弱い根拠、見落とし、回帰リスクがあれば、はっきり問題があると指摘してください。特に、バグ、仕様逸脱、回帰リスク、保守性低下、未テストの重要事項を優先して確認してください。指摘は重大度順に並べ、可能であればファイルや行、該当箇所を示し、なぜ問題なのかを根拠付きで説明してください。軽微な TYPO や表記ゆれも歓迎しますが、より重要な問題があればそちらを優先してください。`
    },
    {
        id: "ai-expansion-hallucination-check-request",
        label: "X305: 回答のハルシネーション有無を再確認(AI詳細)",
        keywords: ["X305", "hallucination", "fact check", "claim review", "certainty", "回答再点検", "ハルシネーション", "事実主張", "確証", "不確実性", "うらどり", "かくしょう", "ふかくじつせい"],
        requiresCommitId: false,
        buildBody: () => `先程の回答をいったん前提にせず、そこに含まれる事実主張や判断をできるだけ個別に再点検して、ハルシネーションが含まれていないか再確認してください。確証が高いもの、不確実なもの、推測に留まるものを区別して説明してください。確証が弱い箇所は不確実であることを明示し、必要に応じて Web 検索や追加確認を行って裏どりしてください。もし誤りや疑わしい点があれば、どの部分が問題で、どの程度不確実なのかを明確に示してください。`
    },
    {
        id: "ai-expansion-resource-handover-ok-request",
        label: "X307: リソース受領中は OK のみ回答(AI詳細)",
        keywords: ["X307", "OK only", "strict ok", "resource handover", "sentinel", "OKのみ", "厳密", "リソース受領", "合図まで", "応答制限", "おーけーのみ", "げんみつ", "おうとうせいげん"],
        requiresCommitId: false,
        buildBody: () => `これから複数のリソースの情報を渡します。一連のリソースの引き渡しが終わる明示的な合図があるまでは、毎回の応答は厳密に \`OK\` の1語のみにしてください。句読点、補足、言い換え、感想、要約、質問は付けないでください。内容を理解したとしても、合図があるまでは \`OK\` 以外を返さないでください。`
    },
    {
        id: "ai-expansion-pr-request",
        label: "X501: GitHub PR 文面の作成(AI詳細)",
        keywords: ["X501", "pull request", "github pr", "pr body", "pr title", "change summary", "risk", "tests", "PR文面", "PRタイトル", "PR本文", "変更概要", "テスト", "リスク", "ぴーあーる", "へんこうがいよう", "りすく"],
        requiresCommitId: true,
        buildBody: (commitId) => commitId
            ? `対象コミット ${commitId} における変更内容について、GitHub PR 用のタイトルと本文を Markdown 形式で作成してください。PR 本文には、少なくとも概要、主な変更点、テストまたは確認内容、必要であれば注意点やリスクを含めてください。変更内容に基づかない推測は避け、分からない点は断定しないでください。回答は ~~~~ で囲まれた一塊として出力してください。Markdown 内に backtick による code fence が含まれる場合があるため、外側の囲みは tilde を使ってください。`
            : ""
    },
    {
        id: "ai-expansion-release-request",
        label: "X502: GitHub Release 文面の作成(AI詳細)",
        keywords: ["X502", "release notes", "github release", "release body", "release title", "release summary", "release文面", "release本文", "リリースノート", "変更概要", "利用者向け", "りりーすのーと", "りようしゃむけ"],
        requiresCommitId: true,
        buildBody: (commitId) => commitId
            ? `${commitId} より後に行われた変更（${commitId} 自体の変更内容は除外する）について、GitHub Release 用のタイトルと本文を Markdown 形式で作成してください。利用者や読者が把握しやすいように、概要、主な変更点、必要であれば注意点や既知の制約を整理してください。変更内容に基づかない推測は避け、分からない点は断定しないでください。回答は ~~~~ で囲まれた一塊として出力してください。Markdown 内に backtick による code fence が含まれる場合があるため、外側の囲みは tilde を使ってください。`
            : ""
    },
    {
        id: "ai-expansion-github-no-change-request",
        label: "X503: GitHub 変更操作の禁止(AI詳細)",
        keywords: ["X503", "github no change", "no push", "no pr", "local only", "GitHub操作禁止", "pushしない", "PR作成しない", "コメントしない", "ローカルのみ", "ぷっしゅしない", "ろーかるのみ"],
        requiresCommitId: false,
        buildBody: () => `GitHub 変更操作は行わないでください。GitHub への push、PR の作成、PR へのコメント、Issue への書き込み、Web UI を通じた変更など、リモート上の状態を変更する操作は禁止します。必要であればローカルでの調査、編集、ビルド、テストまでは行って構いませんが、GitHub 側に反映する行為は行わないでください。もし GitHub 側の変更が必要だと判断した場合でも、実施せず、その必要性だけを指摘してください。`
    },
    {
        id: "ai-expansion-single-file-web-app-request",
        label: "X701: Single-file Web App の維持(AI詳細)",
        keywords: ["X701", "single-file web app", "single html", "bundle", "inline asset", "single-file", "単一HTML", "CDN禁止", "外部依存なし", "生成物確認", "たんいつえいちてぃーえむえる", "がいぶいぞんなし"],
        requiresCommitId: false,
        buildBody: () => `このアプリは原則として Single-file Web App を維持してください。変更に伴って、ビルド後の HTML が CDN や別ファイルの CSS / JS に依存していないかを確認してください。開発時に分割ソースを使うことは構いませんが、最終的な配布物では外部依存なしの単一 HTML として成立している必要があります。必要であれば、どの依存が残っているか、どこでインライン化が崩れているかも示してください。`
    },
    {
        id: "ai-expansion-small-test-request",
        label: "X702: 事象の再発防止テストを追加(AI詳細)",
        keywords: ["X702", "small test", "regression test", "lightweight test", "testability", "再発防止", "小さいテスト", "既存基盤", "回帰検知", "さいはつぼうし", "けいりょうてすと"],
        requiresCommitId: false,
        buildBody: () => `今回の事象が再現したときにすぐに気づくように、できるだけ小さく単純な再発防止テストを検討してください。既存のテスト基盤で無理なく追加できるものを優先し、重い統合テストや新規基盤導入、大量のモック準備が必要なものは避けてください。もし追加が難しい場合は、なぜ難しいのか、どの依存や構造が障害になっているのかも説明してください。`
    },
    {
        id: "ai-expansion-spec-discussion-request",
        label: "X703: 仕様検討モードで進める(AI詳細)",
        keywords: ["X703", "spec discussion", "spec mode", "no implementation", "task breakdown", "仕様検討", "実装しない", "論点整理", "未確定事項", "タスク分解", "しようけんとう", "ろんてんせいり"],
        requiresCommitId: false,
        buildBody: () => `今からの作業は仕様の検討です。コード変更、ファイル編集、ビルド、テスト実行などの実装作業は開始しないでください。その代わり、仕様論点、前提条件、未確定事項、判断材料、選択肢、実施候補のタスク分解を整理して提示してください。結論だけを急いで出すのではなく、何が決まっていて何が未決なのかが分かるようにまとめてください。まとまった仕様が実施事項に落としこめる場合には、TODO.md に書ける粒度の作業タスクへ分解してください。`
    },
    {
        id: "ai-expansion-todo-cleanup-request",
        label: "X704: TODO.md の完了項目を整理(AI詳細)",
        keywords: ["X704", "todo cleanup", "completed todo", "close todo", "stale todo", "TODO整理", "完了項目整理", "クローズ済み", "不要TODO", "とぅーどぅーせいり", "かんりょうこうもくせいり"],
        requiresCommitId: false,
        buildBody: () => `TODO.md の項目について、すでに対応済みで完了しているもの、以前にクローズ済みで不要になっているものを整理してください。単に削除するのではなく、本当に完了したのか、関連する実装や記録と矛盾しないかも確認してください。もし完了と未完了の判断が曖昧な項目があれば、その旨も区別して示してください。`
    },
    {
        id: "ai-expansion-build-check-request",
        label: "X705: 完全ビルドの実施確認(AI詳細)",
        keywords: ["X705", "full build", "build check", "build result", "build verification", "完全ビルド", "ビルド確認", "実施有無", "結果報告", "かんぜんびるど", "けっかほうこく"],
        requiresCommitId: false,
        buildBody: () => `まずビルドが実施済みか確認してください。未実施であれば、必要なビルドを実施してください。そのうえで、どのビルドを確認または実行したのか、成功したのか失敗したのか、失敗した場合はどこで失敗したのかを結果として報告してください。関連するビルドが複数ある場合は、完全性の観点でどこまで確認したかも明示してください。`
    },
    {
        id: "ai-expansion-session-close-request",
        label: "X706: 作業終了時の引継確認(AI詳細)",
        keywords: ["X706", "session close", "wrap up", "handover", "restart guide", "作業終了", "引継確認", "再開ガイド", "伝達事項", "さぎょうしゅうりょう", "ひきつぎかくにん", "さいかいがいど"],
        requiresCommitId: false,
        buildBody: () => `今回の作業をここで終える前に、次回に再開するときに必要な伝達事項がないか確認してください。未完了事項、保留事項、注意点、次に見るべきファイルや論点、必要なら TODO.md へ残すべき内容を整理してください。単に「引き継ぎあり/なし」で終わらせず、次回の生成AIや人間が迷わず再開できるかという観点で確認してください。`
    }
];
