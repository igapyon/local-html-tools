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
      ? `対象コミット ${commitId} における変更内容について、PRタイトルとPR本文を markdown テキスト形式で作文してください。PRタイトルとPR本文は ~~~~ で囲まれた一塊として回答してください。markdown 内に backtick による code fence が含まれる場合があるため、外側の囲みは tilde を使ってください。`
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
    label: "303: Markdown をチルダフェンスで出力",
    keywords: ["markdown", "tilde fence", "tilde fenced", "tilde-fence", "tilde-fenced", "fenced markdown", "code fence", "code block", "code", "チルダフェンス", "markdown出力", "コード形式", "出力", "ちるだふぇんす", "こーどふぇんす", "こーどぶろっく", "shutsuryoku", "まーくだうん", "こーど"],
    requiresCommitId: false,
    buildBody: () => "回答は、そのままコピーしやすいように markdown テキストを ~~~~ で囲まれた一塊として出力してください。markdown 内に backtick による code fence が含まれる場合があるため、外側の囲みは tilde を使ってください。"
  },
  {
    id: "extract-to-inline-code-request",
    label: "351: 添付ファイル等の抽出結果をチルダフェンスで出力",
    keywords: ["extract", "attachment", "text", "tilde fence", "tilde fenced", "tilde-fence", "tilde-fenced", "fenced markdown", "code fence", "code block", "markdown", "抽出", "添付ファイル", "テキスト", "チルダフェンス", "出力", "ちゅうしゅつ", "てんぷふぁいる", "てきすと", "ちるだふぇんす", "こーどふぇんす", "こーどぶろっく", "しゅつりょく"],
    requiresCommitId: false,
    buildBody: () => "添付ファイルから、あるいは与えるテキストから情報を抽出して、markdown テキストを ~~~~ で囲まれた一塊として出力してください。markdown 内に backtick による code fence が含まれる場合があるため、外側の囲みは tilde を使ってください。"
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
    buildBody: () => "今までの会話を別の生成AIに引継 (KT) したいです。受け手が生成AIであることを想定したうえでなるべく詳細にそして引継先で緻密に再現できるような引き継ぎテキストを markdown 形式で生成してください。"
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
    buildBody: () => "今回の事象が再現したときにすぐに気づくように、とても小さなシンプルなテストについて、容易に実現可能であればこれを追加して欲しいです。困難な場合は作業せずにその旨指摘してください。"
  },
  {
    id: "disagreement-first-request",
    label: "302: 違和感や誤りを先に指摘",
    keywords: ["disagree", "wrong", "違和感", "誤り", "間違い", "指摘", "先", "先に指摘", "いわかん", "まちがい", "してき", "iwakan", "machigai", "shiteki"],
    requiresCommitId: false,
    buildBody: () => "私の指示や指摘について、あなたが強い違和感を感じたり、あるいはあなたが間違っていると感じている場合には、指示を続行せずに、その違和感や間違いを回答して欲しい。"
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
    id: "resource-handover-ok-request",
    label: "307: リソース受領中は OK のみ回答",
    keywords: ["resource", "resources", "multiple resources", "ok", "複数", "リソース", "情報", "引き渡し", "受領", "回答", "okのみ", "OKのみ", "ふくすう", "りそーす", "じょうほう", "ひきわたし", "じゅりょう", "かいとう"],
    requiresCommitId: false,
    buildBody: () => "これから複数のリソースの情報を渡します。一連のリソースの引き渡しが終わるまでは、単にOKとのみ回答してください。"
  },
  {
    id: "lgtm-request",
    label: "300: 確認範囲は概ね良好で LGTM",
    keywords: ["lgtm", "looks good to me", "確認", "範囲", "良さそう", "良好", "概ね", "おおよそ", "レビュー", "かくにん", "はんい", "りょうこう", "れびゅー"],
    requiresCommitId: false,
    buildBody: () => "いいね！いい感じです。確認した範囲はおおよそ良さそうです。LGTMです。"
  },
  {
    id: "peer-feedback-analysis-request",
    label: "309: 他メンバー指摘の受入可否を判断",
    keywords: ["feedback", "review", "peer review", "comment", "accept", "reject", "判断", "指摘", "受け入れ", "受入", "可否", "解析", "メンバー", "はんだん", "してき", "うけいれ", "かひ", "かいせき"],
    requiresCommitId: false,
    buildBody: () => "他のメンバーから指摘をもらいました。この内容について、あなたなりに解析して判断して、そして受け入れられるかどうか、受け入れられないか、を判断して教えて欲しいです。"
  },
  {
    id: "recent-work-status-request",
    label: "310: 直近の作業状況を確認",
    keywords: ["recent work", "current status", "what was I doing", "直近", "作業状況", "確認", "離席", "現在", "未完了", "次に何を見る", "ちょっきん", "さぎょうじょうきょう", "りせき", "げんざい", "みかんりょう", "tsuginanimiru"],
    requiresCommitId: false,
    buildBody: () => "すみません、少し離席していました。直近で何の作業をしていたのか、現在どこまで進んでいるのか、未完了のものがあるか、次に何を見ればよいかを整理して教えてください。回答は markdownでお願いします。"
  },
  {
    id: "solution-soundness-review-request",
    label: "311: 場当たり対応や本質解決漏れを確認",
    keywords: ["ad hoc", "proper solution", "root cause", "architecture", "場当たり", "本質", "解決", "別解", "正しい解決方法", "設計", "妥当性", "ばあたり", "ほんしつ", "かいけつ", "べっかい", "せっけい"],
    requiresCommitId: false,
    buildBody: () => "今回の対応について、場当たり的な変更に留まっていないか、本質的には別のより適切な解決方法があるのにそれを選択していないところがないか、設計面と保守面から批判的に確認して教えてください。"
  },
  {
    id: "temporary-change-cleanup-request",
    label: "312: 暫定変更の置き忘れを確認",
    keywords: ["temporary", "temporary change", "cleanup", "debug code", "investigation", "暫定", "変更", "置き忘れ", "消し忘れ", "調査用", "試行錯誤", "デバッグ", "片付け", "ざんてい", "おきわすれ", "けしわすれ", "ちょうさよう", "でばっぐ"],
    requiresCommitId: false,
    buildBody: () => "開発中の試行錯誤や調査の過程で入れた暫定変更、デバッグ用コード、確認用の一時対応が、解決後も残ったままになっていないか確認してください。もし不要な暫定変更が残っていれば、どこにあり、なぜ不要と判断できるのかを指摘してください。"
  },
  {
    id: "reconsider-answer-request",
    label: "313: 回答を改めて再考して確認",
    keywords: ["reconsider", "rethink", "fresh look", "answer review", "再考", "再確認", "改めて", "新鮮な気持ち", "もう一度", "回答", "見直し", "さいこう", "さいかくにん", "あらためて", "みなおし"],
    requiresCommitId: false,
    buildBody: () => "その回答について、いったん先入観を外して、改めて新鮮な気持ちでよく考え直したうえでもう一度回答してください。見落としや早とちり、先入観による偏った考え方、さらに別の解釈の余地がないかも含めて再確認して欲しいです。"
  },
  {
    id: "directory-summary-markdown-request",
    label: "101: ディレクトリ内容整理 markdown を作成",
    keywords: ["directory", "markdown", "summary", "index", "scan cost", "ディレクトリ", "内容", "整理", "markdown作成", "作成", "md作成", "概要整理", "走査コスト削減", "でぃれくとり", "せいり", "がいよう", "そうさこすと"],
    requiresCommitId: false,
    buildBody: () => "いま作業しているディレクトリに含まれるファイルについて、無理のない範囲で、内容を調べて、それを整理した markdown (.md)ファイルを作成してほしい。既存の該当する対象ファイルがあればそれを更新あるいは加筆し、もし妥当な該当する対象ファイルがない場合は適切なファイル名の markdown ファイルを新規作成してそこに記述して欲しい。これは次回に生成AIがこのディレクトリを開いた時の走査のコストを削減することについても期待される効果となっています。"
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
    buildBody: () => "今回の作業はここまで。終わりにします。なお、次回に再開する時にスムーズに復帰できるように何か伝達事項はあるだろうか。もしそのようなものがあるのであれば、TODO.mdに必要な情報を記入してもらえませんか。そして必要があれば、直近の作業で何を実施したのかを実施済み引き継ぎ事項として TODO.md に記載して欲しいです。"
  },
  {
    id: "single-file-web-app-request",
    label: "701: Single-file Web App の維持",
    keywords: ["single-file", "single file", "web app", "html", "css", "js", "cdn", "維持", "依存なし", "単一html", "single-file web app", "しんぐるふぁいる", "しんぐるふぁいるうぇぶあぷり", "たんいつhtml", "いぞんなし"],
    requiresCommitId: false,
    buildBody: () => "このアプリは原則として Single-file Web App であるようにしてください。変更の過程でこれが崩れていることがたまにあります。ビルド後の html ファイルは、CDN や別ファイルの CSS / JS ファイルを利用していないことを確認してください。"
  }
];
