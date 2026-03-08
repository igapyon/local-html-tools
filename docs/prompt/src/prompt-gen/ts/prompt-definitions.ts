type PromptDefinition = {
  id: string;
  label: string;
  keywords: string[];
  requiresCommitId: boolean;
  buildBody: (commitId: string) => string;
};

const promptDefinitions: PromptDefinition[] = [
  {
    id: "pr-request",
    label: "501: GitHub PR 文面の作成",
    keywords: ["pr", "pull request", "pr作成依頼", "prタイトル", "pr本文", "文面", "作成", "ぶんめんさくせい", "bunmensakusei", "ぴーあーる", "ぷるりくえすと", "ぎっとはぶ"],
    requiresCommitId: true,
    buildBody: (commitId: string) => commitId
      ? `対象コミット ${commitId} における変更内容について、PRタイトルとPR本文を markdown テキスト形式で作文してください。PRタイトルとPR本文は \`\`\` で囲まれた一塊として回答してください。`
      : ""
  },
  {
    id: "release-request",
    label: "502: GitHub Release 文面の作成",
    keywords: ["release", "github release", "github", "リリース", "release文面", "release本文", "文面", "作成", "りりーす", "ぶんめんさくせい", "riri-su", "bunmensakusei", "ぎっとはぶ", "りりーす"],
    requiresCommitId: true,
    buildBody: (commitId: string) => commitId
      ? `${commitId} よりも後に行われた変更(${commitId}での変更内容は除外する)について、GitHub Release 用のリリースタイトルとリリース本文を markdown 形式で作文してください。`
      : ""
  },
  {
    id: "inline-code-request",
    label: "303: Markdown インラインコードとして出力",
    keywords: ["markdown", "inline code", "code", "インラインコード", "markdown出力", "コード形式", "出力", "いんらいんこーど", "しゅつりょく", "inrainko-do", "shutsuryoku", "まーくだうん", "こーど"],
    requiresCommitId: false,
    buildBody: () => "出力はインラインコード形式で markdown テキストで出力してください。回答が ``` と ``` とで囲まれるイメージです。"
  },
  {
    id: "github-no-change-request",
    label: "503: GitHub 変更操作の禁止",
    keywords: ["github", "push", "pr", "comment", "変更", "操作", "変更しない", "禁止", "github操作", "へんこうそうさ", "きんし", "henkousousa", "kinshi", "ぎっとはぶ", "ぷっしゅ", "ぴーあーる", "こめんと"],
    requiresCommitId: false,
    buildBody: () => "GitHub 変更操作の禁止。GitHubへの push、GitHub PR の作成や PR へのコメントなど、GitHub への変更をおこなう操作は行わないでください。"
  },
  {
    id: "directory-markdown-check-request",
    label: "100: ディレクトリ内の内容を確認して把握",
    keywords: ["readme", "markdown", "directory", "ディレクトリ", "内容", "確認", "把握", "内容確認", "md確認", "でぃれくとり", "ないようかくにん", "direkutori", "naiyoukakunin", "りーどみー", "まーくだうん", "えむでぃー"],
    requiresCommitId: false,
    buildBody: () => "README.md などこのディレクトリの内容をあらわす markdown の内容を確認してください。"
  },
  {
    id: "conversation-handover-request",
    label: "301: 会話の引継テキストの生成",
    keywords: ["handover", "conversation", "引き継ぎ", "引継", "会話", "テキスト", "生成", "生成ai", "別のai", "かいわ", "ひきつぎ", "てきすと", "せいせい", "kaiwa", "hikitsugi", "tekisuto", "seisei", "はんどおーばー", "こんばーせーしょん", "えーあい"],
    requiresCommitId: false,
    buildBody: () => "今までの会話を別の生成AIに引継 (KT) したいです。受け手が生成AIであることを想定したうえでなるべく詳細にそして引継先で緻密に再現できるような引き継ぎテキストを生成してください。"
  },
  {
    id: "spec-discussion-request",
    label: "703: 仕様検討モードで進める",
    keywords: ["spec", "specification", "仕様", "検討", "モード", "進める", "todo", "todo.md", "しよう", "けんとう", "とぅーどぅー", "shiyou", "kentou", "すぺっく"],
    requiresCommitId: false,
    buildBody: () => "今からの作業は仕様の検討です。実装を開始しないでください。一方で、まとまった仕様が実施事項に落としこめる場合には、TODO.mdに作業タスクとして分解して記述してください。"
  },
  {
    id: "small-test-request",
    label: "702: 事象の再発防止テストを追加",
    keywords: ["test", "testing", "small test", "再発", "防止", "テスト", "追加", "再現テスト", "小さなテスト", "軽量テスト", "てすと", "さいげんてすと", "しょうさなてすと", "tesuto", "saigentesuto"],
    requiresCommitId: false,
    buildBody: () => "今回の事象が再現したときにすぐに気づくように、とても小さなシンプルなテストについて、よういに実現可能であればこれを追加して欲しいです。困難な場合は作業せずにその旨指摘してください。"
  },
  {
    id: "disagreement-first-request",
    label: "302: 違和感や誤りを先に指摘",
    keywords: ["disagree", "wrong", "違和感", "誤り", "間違い", "指摘", "先", "先に指摘", "いわかん", "まちがい", "してき", "iwakan", "machigai", "shiteki"],
    requiresCommitId: false,
    buildBody: () => "私の指示や指摘について、あなたか強い違和感を感じたり、あるいはあなたが間違っていると感じている場合には、指示を続行せずに、その違和感や間違いを回答して欲しい。"
  },
  {
    id: "todo-cleanup-request",
    label: "704: TODO.md の完了項目を整理",
    keywords: ["todo", "todo.md", "cleanup", "close", "closed", "完了項目", "整理", "完了", "項目", "クローズ", "削除", "とぅーどぅー", "せいり", "かんりょう", "s e i r i", "kanryou"],
    requiresCommitId: false,
    buildBody: () => "TODO.mdのなかで、すでに対応済みで実施済みとなっているTODOがあれば、それをクローズしたり、あるいは以前にすでにクローズ済みのTODOがあればこれを削除してください。"
  },
  {
    id: "completion-check-request",
    label: "306: 依頼内容の実施状況を確認",
    keywords: ["done", "completed", "status", "check", "依頼", "内容", "実施", "状況", "実施済み", "未実施", "確認", "じっしずみ", "みじっし", "かくにん", "jisshizumi", "mijisshi", "kakunin", "じょうきょう", "joukyou"],
    requiresCommitId: false,
    buildBody: () => "さきほどお願いした一連の依頼内容は、基本的に全て実施済みでしょうか。それともまだ未実施のものはありますでしょうか。"
  },
  {
    id: "critical-review-request",
    label: "304: 批判的レビューの依頼",
    keywords: ["review", "critical review", "typo", "批判的", "レビュー", "依頼", "誤り", "間違い", "たいぽ", "ひはんてき", "れびゅー", "まちがい", "typo", "hibanteki", "rebyu-"],
    requiresCommitId: false,
    buildBody: () => "これから批判的なレビューを実施して欲しいです。誤り、間違い、TYPO、ささいなものでも批判的に指摘してください。それら批判的な指摘はこのコンテキストでは喜ばれます。"
  },
  {
    id: "markdown-update-check-request",
    label: "102: markdown 更新漏れの確認",
    keywords: ["markdown", "md", "update", "doc", "docs", "更新", "漏れ", "確認", "更新漏れ", "未更新", "追加すべき", "まーくだうん", "みこうしん", "こうしんもれ", "markdown", "mikkoushin", "koushinmore"],
    requiresCommitId: false,
    buildBody: () => "実装の側に変更がおこなわれましたが、これに対応する markdown (.md) で未更新のものはありますか。あるいは新規で markdown (.md) を追加すべき変更はありましたか。"
  },
  {
    id: "hallucination-check-request",
    label: "305: 回答のハルシネーション有無を再確認",
    keywords: ["hallucination", "fact check", "web search", "回答", "有無", "再確認", "裏どり", "裏取り", "ハルシネーション", "回答確認", "うらどり", "さいかくにん", "かいとうかくにん"],
    requiresCommitId: false,
    buildBody: () => "先程の回答にハルシネーションが含まれていないか、いまいちど新しい気持ちで考えてみて欲しいです。適宜必要に応じてWebを検索して裏どりを実施してください。"
  },
  {
    id: "directory-summary-markdown-request",
    label: "101: ディレクトリ内容整理 markdown を作成",
    keywords: ["directory", "markdown", "summary", "index", "scan cost", "ディレクトリ", "内容", "整理", "markdown作成", "作成", "md作成", "概要整理", "走査コスト削減", "でぃれくとり", "せいり", "がいよう", "そうさこすと"],
    requiresCommitId: false,
    buildBody: () => "いま作業しているディレクトリに含まれるファイルについて、無理のない範囲で、内容を調べて、それを整理した markdown (.md)ファイルを作成してほしい。既存の該当する対象ファイルがあればそれを更新あるいは加筆し、もし妥当な該当する対象ファイルがない場合は適切ないファイル名のmarkdownファイルを新規作成してそこに記述して欲しい。これは次回に生成AIがこのディレクトリを開いた時の走査のコストを削減することについても期待される効果となっています。"
  },
  {
    id: "build-check-request",
    label: "705: 完全ビルドの実施確認",
    keywords: ["build", "full build", "build all", "完全ビルド", "ビルド", "実施", "確認", "かんぜんびるど", "びるど", "じっし", "かくにん"],
    requiresCommitId: false,
    buildBody: () => "ビルドは実施済みでしょうか？もし未実施であれば、完全なビルドを実施して欲しいです。"
  },
  {
    id: "session-close-request",
    label: "706: 作業終了時の引継確認",
    keywords: ["session close", "wrap up", "handover", "todo", "todo.md", "作業終了", "終了", "引継", "伝達事項", "再開", "復帰", "さぎょうしゅうりょう", "しゅうりょう", "ひきつぎ", "でんたつじこう", "さいかい", "ふっき"],
    requiresCommitId: false,
    buildBody: () => "今回の作業はここまで。終わりにします。なお、次回に再開する時にスムーズに復帰できるように何か伝達事項はあるだろうか。もしそのようなものがあるのであれば、TODO.mdに 必要な情報を記入してもらえませんか。そして必要があれば、直近の作業出ないを実施したのかを実施済み引き継ぎ事項として TODO.md に記載して欲しいです。"
  },
  {
    id: "single-file-web-app-request",
    label: "701: Single-file Web App の維持",
    keywords: ["single-file", "single file", "web app", "html", "css", "js", "cdn", "維持", "依存なし", "単一html", "single-file web app", "しんぐるふぁいる", "しんぐるふぁいるうぇぶあぷり", "たんいつhtml", "いぞんなし"],
    requiresCommitId: false,
    buildBody: () => "原則として Single-file Web App であるようにしてください。ビルド後の html ファイルは、CDNや 別ファイルのcss/jsファイルを利用していないことを常に意識してください。"
  }
];
