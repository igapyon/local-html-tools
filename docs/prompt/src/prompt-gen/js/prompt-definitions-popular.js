const popularPromptDefinitions = [
    {
        id: "popular-prerequisites-request",
        label: "P1101-001: 前提条件を抽出",
        keywords: ["P1101-001", "prerequisites", "assumptions", "preconditions", "premises", "前提条件", "前提", "前提抽出", "仮定", "ぜんていじょうけん", "かてい"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容から、暗黙の前提も含めて前提条件を抽出してください。何が成立している前提で話が進んでいるのか、どの前提が崩れると結論や作業方針に影響するのかが分かるように整理してください。必要に応じて、明示されている前提と暗黙の前提を分けて示してください。`
    },
    {
        id: "popular-constraints-request",
        label: "P1101-002: 制約条件を抽出",
        keywords: ["P1101-002", "constraints", "limitations", "restrictions", "boundary conditions", "制約", "制約条件", "制限", "境界条件", "せいやくじょうけん", "せいげん"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容から、制約条件や守るべき境界を抽出してください。時間、コスト、依存関係、互換性、禁止事項、作業範囲など、結論や実装方針を縛る条件を整理し、重要度が高いものから分かるように示してください。前提条件と混ざりやすい場合は、その違いも区別して説明してください。`
    },
    {
        id: "popular-risk-list-request",
        label: "P1005-010: 見落としリスクを列挙",
        keywords: ["P1005-010", "risk list", "oversight risk", "missed risk", "risk enumeration", "見落としリスク", "リスク列挙", "見落とし", "懸念点", "みおとしりすく", "けねんてん"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容について、見落としやすいリスクを列挙してください。仕様、運用、保守、依存関係、テスト、認識齟齬などの観点から、問題になりそうな点を幅広く洗い出してください。まだ重大度評価までは厳密にしなくてよいので、抜け漏れを減らすことを優先してください。`
    },
    {
        id: "popular-risk-priority-request",
        label: "P1005-011: 見落としリスクを重大度順に整理",
        keywords: ["P1005-011", "risk priority", "severity order", "risk ranking", "prioritized risk", "重大度順", "優先リスク", "リスク順位", "危険度", "じゅうだいどじゅん", "ゆうせんりすく"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容について、見落としリスクを重大度順に整理してください。発生時の影響の大きさ、起こりやすさ、発見のしにくさを考慮し、どのリスクを先に潰すべきかが分かるように並べてください。可能であれば、各リスクの理由や対策候補も簡潔に添えてください。`
    },
    {
        id: "popular-nontechnical-summary-request",
        label: "P1201-001: 非技術者向けに要約",
        keywords: ["P1201-001", "non-technical summary", "executive summary", "plain language", "for non engineers", "非技術者向け", "平易化", "やさしく要約", "一般向け", "ひぎじゅつしゃむけ", "へいいか"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容を、非技術者にも分かるように要約してください。専門用語や内部事情は必要最小限に抑え、何が起きているのか、なぜ重要なのか、どんな影響があるのかが伝わるように説明してください。技術的な正確さは保ちつつ、分かりやすさを優先してください。`
    },
    {
        id: "popular-brief-nontechnical-summary-request",
        label: "P1201-002: 非技術者向けに短く要約",
        keywords: ["P1201-002", "short non-technical summary", "brief summary", "3 line summary", "plain brief", "短く要約", "短い要約", "三行要約", "非技術者向け要約", "みじかくようやく", "さんぎょうようやく"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容を、非技術者向けに短く要約してください。長い説明ではなく、重要なポイントがすぐ伝わるように、短い文章または短い箇条書きでまとめてください。専門用語はできるだけ避け、必要な場合は簡単に言い換えてください。`
    },
    {
        id: "popular-comparison-table-request",
        label: "P1301-001: 選択肢比較表を作成",
        keywords: ["P1301-001", "comparison table", "option comparison", "tradeoff table", "decision table", "比較表", "選択肢比較", "比較一覧", "トレードオフ表", "ひかくひょう", "せんたくしひかく"],
        requiresCommitId: false,
        buildBody: () => `与えられた選択肢について、比較表を作成してください。少なくとも各選択肢の特徴、メリット、デメリット、向いている場面が比較できるように整理してください。表形式または Markdown テーブルで、判断材料として使いやすい形にまとめてください。`
    },
    {
        id: "popular-merit-demerit-table-request",
        label: "P1301-002: 選択肢のメリット・デメリット比較表を作成",
        keywords: ["P1301-002", "pros cons table", "merit demerit", "pros and cons", "tradeoff comparison", "メリット", "デメリット", "比較表", "賛否", "めりっと", "でめりっと"],
        requiresCommitId: false,
        buildBody: () => `与えられた選択肢について、メリットとデメリットが見比べやすい比較表を作成してください。結論を急がず、各案の良い点と弱い点が対称に読める形で整理してください。必要に応じて、判断時に重視すべき観点も列として加えてください。`
    },
    {
        id: "popular-audience-shift-request",
        label: "P1202-001: 対象読者を変えて説明",
        keywords: ["P1202-001", "change audience", "audience shift", "rewrite for audience", "different audience", "対象読者", "読者変更", "対象別説明", "読み手を変える", "たいしょうどくしゃ", "よみてをかえる"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容について、対象読者を変えて説明してください。元の内容の意味はできるだけ保ちつつ、読み手に合わせて前提知識、用語、説明の深さ、強調点を調整してください。必要であれば、元の対象読者と新しい対象読者の違いも簡潔に意識して書き分けてください。`
    },
    {
        id: "popular-multi-audience-request",
        label: "P1202-002: 複数の対象読者向けに書き分ける",
        keywords: ["P1202-002", "multiple audiences", "rewrite for beginner and expert", "audience variants", "reader variants", "複数読者", "書き分け", "初学者向け", "管理者向け", "ふくすうどくしゃ", "かきわけ"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容について、複数の対象読者向けに書き分けてください。たとえば非技術者向け、初学者向け、実務担当者向けなど、対象ごとにどの情報を残し、どの用語を言い換え、どこを省略するかが分かるように整理してください。読み手ごとの差が伝わるように、見出しを分けて出力してください。`
    },
    {
        id: "popular-key-point-extract-request",
        label: "P1201-003: 要点だけを抽出",
        keywords: ["P1201-003", "key points", "extract key points", "main points", "highlight points", "要点抽出", "要点だけ", "重要ポイント", "ハイライト", "ようてんちゅうしゅつ", "じゅうようぽいんと"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容から、要点だけを抽出してください。細部や補足を広く並べるのではなく、全体理解や判断に効く重要ポイントを優先して簡潔に整理してください。必要であれば、重要度の高い順に並べてください。`
    },
    {
        id: "popular-decision-extract-request",
        label: "P1201-004: 決定事項だけを抽出",
        keywords: ["P1201-004", "decision extract", "decision summary", "decisions only", "agreed points", "決定事項抽出", "決定だけ", "合意事項", "けっていじこうちゅうしゅつ", "ごういじこう"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容から、決定事項だけを抽出してください。未決事項や背景説明とは分けて、何がすでに決まっているのかが一目で分かるように整理してください。必要であれば、各決定事項に簡潔な理由や前提も添えてください。`
    },
    {
        id: "popular-json-output-request",
        label: "P1204-003: JSON 形式で出力",
        keywords: ["P1204-003", "json output", "structured json", "json format", "machine readable", "JSON出力", "構造化出力", "機械可読", "じぇいそんしゅつりょく", "こうぞうかしゅつりょく"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容を JSON 形式で出力してください。人が読む説明だけでなく、機械的にも扱いやすい構造を意識し、キー名が分かりやすい JSON に整理してください。説明文が必要な場合も、まず JSON として一貫した形になることを優先してください。`
    },
    {
        id: "popular-markdown-table-request",
        label: "P1204-004: Markdown 表形式で出力",
        keywords: ["P1204-004", "markdown table", "table output", "markdown format", "tabular output", "Markdown表", "表形式", "表出力", "まーくだうんひょう", "ひょうけいしき"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容を Markdown の表形式で出力してください。比較、分類、一覧化に向くように列を整理し、表だけで主要な情報が読み取れるようにまとめてください。必要に応じて、列名や並び順も読みやすさを優先して調整してください。`
    },
    {
        id: "popular-recommendation-request",
        label: "P1301-003: 比較したうえで推奨案を選ぶ",
        keywords: ["P1301-003", "recommendation", "recommended option", "choose one", "best option", "推奨案", "おすすめ案", "案を選ぶ", "すいしょうあん", "おすすめあん"],
        requiresCommitId: false,
        buildBody: () => `与えられた選択肢を比較したうえで、推奨案を 1 つ選んでください。単に結論だけを述べるのではなく、なぜその案を勧めるのか、他案より優先する理由が分かるように整理してください。必要であれば、推奨しない案の理由も簡潔に添えてください。`
    },
    {
        id: "popular-tradeoff-request",
        label: "P1301-004: トレードオフを整理して推奨する",
        keywords: ["P1301-004", "tradeoff recommendation", "tradeoff summary", "pros cons recommendation", "decision tradeoff", "トレードオフ", "トレードオフ整理", "比較推奨", "とれーどおふ", "ひかくすいしょう"],
        requiresCommitId: false,
        buildBody: () => `与えられた選択肢について、トレードオフを整理したうえで推奨案を示してください。コスト、速度、保守性、理解しやすさなど、何を優先するとどの案が有利になるのかが分かるように説明してください。結論は、どの価値観を重視した推奨なのかも含めて示してください。`
    },
    {
        id: "popular-idea-list-request",
        label: "P1307-001: アイデアを広く列挙",
        keywords: ["P1307-001", "brainstorm", "idea list", "idea generation", "divergent thinking", "アイデア出し", "案出し", "発散", "ぶれいんすとーむ", "はっさん"],
        requiresCommitId: false,
        buildBody: () => `与えられたテーマについて、アイデアを広く列挙してください。すぐに評価や絞り込みを行うのではなく、まずは観点を広げて、考えられる案を幅広く出すことを優先してください。多少荒くてもよいので、重複を恐れず発散してください。`
    },
    {
        id: "popular-alternative-request",
        label: "P1307-002: 代替案を複数提案",
        keywords: ["P1307-002", "alternatives", "alternative proposal", "multiple options", "backup ideas", "代替案", "別案", "複数案", "だいたいあん", "べつあん"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容について、代替案を複数提案してください。現行案に近いものだけでなく、発想を少しずらした案も含めて、比較検討できるように並べてください。必要であれば、各代替案の特徴や採用しやすい条件も簡潔に添えてください。`
    },
    {
        id: "popular-next-steps-request",
        label: "P1302-001: 次の一手を3件に絞る",
        keywords: ["P1302-001", "next steps", "top 3 next actions", "prioritized actions", "what next", "次の一手", "次アクション", "3件に絞る", "つぎのいって", "じあくしょん"],
        requiresCommitId: false,
        buildBody: () => `与えられた状況から、次の一手を 3 件に絞ってください。やれることを網羅するのではなく、今この順で進めると効果が高いものに絞り込み、優先順位つきで示してください。必要であれば、なぜその 3 件を選んだのかも簡潔に説明してください。`
    },
    {
        id: "popular-prioritized-plan-request",
        label: "P1302-002: 実行順に並べる",
        keywords: ["P1302-002", "execution order", "ordered plan", "prioritized sequence", "step order", "実行順", "順番に並べる", "優先順", "じっこうじゅん", "じゅんばんにならべる"],
        requiresCommitId: false,
        buildBody: () => `与えられた候補や作業を、実行順に並べてください。依存関係、着手しやすさ、効果の大きさ、先に確認すべき前提を考慮して、どの順で進めるのが自然かが分かるように整理してください。必要に応じて、後回しにする理由も簡潔に添えてください。`
    },
    {
        id: "popular-beginner-explanation-request",
        label: "P1202-003: 初学者向けに説明",
        keywords: ["P1202-003", "for beginners", "beginner friendly", "explain simply", "entry level explanation", "初学者向け", "初心者向け", "やさしく説明", "しょがくしゃむけ", "しょしんしゃむけ"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容を、初学者向けに説明してください。前提知識が少ない読み手でも追えるように、用語や背景を補いながら段階的に説明してください。専門用語を使う場合は、簡単な言い換えや補足も添えてください。`
    },
    {
        id: "popular-plain-language-request",
        label: "P1202-004: 専門文を平易な言葉に言い換える",
        keywords: ["P1202-004", "plain language", "simplify technical text", "rewrite simply", "jargon free", "平易化", "言い換え", "専門文", "へいいか", "いいかえ"],
        requiresCommitId: false,
        buildBody: () => `与えられた専門的な文章を、より平易な言葉に言い換えてください。内容の意味は保ちつつ、専門用語や抽象表現を必要最小限にし、読み手が引っかかりやすい箇所を分かりやすく整えてください。`
    },
    {
        id: "popular-mail-draft-request",
        label: "P1204-005: メール文面を作成",
        keywords: ["P1204-005", "email draft", "mail writing", "email response", "business mail", "メール文面", "メール作成", "メール返信", "めーるぶんめん", "めーるさくせい"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容をもとに、メール文面を作成してください。相手や状況に応じて、簡潔さ、丁寧さ、必要情報の過不足を意識してまとめてください。件名が必要そうであれば、件名案も併せて示してください。`
    },
    {
        id: "popular-minutes-request",
        label: "P1204-006: 議事録ドラフトを作成",
        keywords: ["P1204-006", "meeting minutes", "minutes draft", "meeting note", "agenda notes", "議事録", "議事録ドラフト", "会議メモ", "ぎじろく", "かいぎめも"],
        requiresCommitId: false,
        buildBody: () => `与えられた会話やメモをもとに、議事録ドラフトを作成してください。議題、主な論点、決定事項、未決事項、次のアクションが分かるように整理してください。必要であれば、参加者向けに読みやすい見出しや箇条書きへ整えてください。`
    },
    {
        id: "popular-issue-list-request",
        label: "P1101-003: 課題一覧を整理",
        keywords: ["P1101-003", "issue list", "problem list", "issues summary", "issue inventory", "課題一覧", "問題一覧", "論点一覧", "かだいいちらん", "もんだいいちらん"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容から、課題一覧を整理してください。何が問題なのか、どこが未解決なのか、どの課題が他の課題に影響するのかが分かるように並べてください。必要であれば、課題ごとに簡潔な背景や優先度も添えてください。`
    },
    {
        id: "popular-dependency-risk-request",
        label: "P1101-004: 依存課題を抽出",
        keywords: ["P1101-004", "dependency issues", "dependency risk", "blocked by", "dependent issues", "依存課題", "依存リスク", "前提課題", "いぞんかだい", "ぜんていかだい"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容から、他の課題や前提に依存している課題を抽出してください。どれが先行条件になっているのか、どの課題が他の進行を止めうるのかが分かるように整理してください。必要であれば、依存関係の向きも明示してください。`
    },
    {
        id: "popular-implementation-plan-request",
        label: "P1401-001: 実装計画を作成",
        keywords: ["P1401-001", "implementation plan", "execution plan", "build plan", "work plan", "実装計画", "作業計画", "実施計画", "じっそうけいかく", "さぎょうけいかく"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容について、実装計画を作成してください。調査、設計、実装、確認、テストなどの段階に分けて、どの順で進めるとよいかが分かるように整理してください。必要であれば、各段階の目的や確認ポイントも簡潔に添えてください。`
    },
    {
        id: "popular-investigation-plan-request",
        label: "P1401-002: 調査計画を作成",
        keywords: ["P1401-002", "investigation plan", "research plan", "discovery plan", "analysis plan", "調査計画", "調査手順", "確認計画", "ちょうさけいかく", "かくにんけいかく"],
        requiresCommitId: false,
        buildBody: () => `与えられたテーマについて、調査計画を作成してください。何を確認し、どの順で情報を集め、どこで判断材料を得るのかが分かるように整理してください。いきなり結論を出すのではなく、調査観点と調査手順が見えることを重視してください。`
    },
    {
        id: "popular-checklist-request",
        label: "P1004-001: チェックリストを作成",
        keywords: ["P1004-001", "checklist", "review checklist", "qa checklist", "verification list", "チェックリスト", "確認項目", "点検項目", "ちぇっくりすと", "かくにんこうもく"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容について、チェックリストを作成してください。見落としを減らすことを目的に、確認すべき項目を過不足なく並べてください。必要であれば、実行前、実行中、実行後のように段階別に整理してください。`
    },
    {
        id: "popular-weak-evidence-request",
        label: "P1004-002: 根拠の弱い箇所を抽出",
        keywords: ["P1004-002", "weak evidence", "unsupported claims", "weak rationale", "evidence check", "根拠が弱い", "裏付け不足", "根拠抽出", "こんきょがよわい", "うらづけぶそく"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容について、根拠の弱い箇所を抽出してください。主張に対して理由が不足している点、裏付けが薄い点、断定が強すぎる点が分かるように整理してください。必要であれば、どのような追加根拠があると強くなるかも簡潔に示してください。`
    },
    {
        id: "popular-glossary-request",
        label: "P1504-001: 用語集を作成",
        keywords: ["P1504-001", "glossary", "term list", "terminology", "definitions", "用語集", "用語一覧", "定義集", "ようごしゅう", "ていぎしゅう"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容に含まれる重要な用語について、用語集を作成してください。単語の羅列ではなく、それぞれが何を意味し、どの文脈で使われているのかが分かるように整理してください。必要に応じて、紛らわしい近い用語との違いも添えてください。`
    },
    {
        id: "popular-naming-candidates-request",
        label: "P1504-002: 命名候補を提案",
        keywords: ["P1504-002", "naming candidates", "name ideas", "label candidates", "naming proposal", "命名候補", "名前候補", "ラベル候補", "めいめいこうほ", "なまえこうほ"],
        requiresCommitId: false,
        buildBody: () => `与えられた対象について、命名候補を提案してください。意味が伝わりやすいこと、他の候補との区別がつきやすいこと、将来の拡張でも破綻しにくいことを意識して、複数案を示してください。必要であれば、各候補のニュアンスの違いも簡潔に説明してください。`
    },
    {
        id: "popular-faq-request",
        label: "P1501-001: FAQ を作成",
        keywords: ["P1501-001", "faq", "frequently asked questions", "q and a", "common questions", "FAQ", "よくある質問", "Q&A", "ふぁっく", "よくあるしつもん"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容をもとに FAQ を作成してください。利用者や読み手が疑問に思いそうな点を先回りして、質問と回答の形で整理してください。よくある質問として自然な粒度を意識し、回答は簡潔で実用的にまとめてください。`
    },
    {
        id: "popular-knowledge-format-request",
        label: "P1501-002: ナレッジ向けに整理",
        keywords: ["P1501-002", "knowledge base", "knowledge article", "internal knowledge", "knowledge formatting", "ナレッジ化", "ナレッジ整理", "社内向け整理", "ないれっじか", "しゃないむけせいり"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容を、ナレッジベースや社内共有に向く形へ整理してください。単なる会話ログではなく、背景、要点、手順、注意点、FAQ など、後から参照しやすい構成を意識してまとめてください。必要であれば、見出し構成も提案してください。`
    },
    {
        id: "popular-counterargument-request",
        label: "P1304-001: 反対意見を代弁",
        keywords: ["P1304-001", "counterargument", "devils advocate", "opposing view", "critique", "反対意見", "逆張り", "反論", "はんたいいけん", "はんろん"],
        requiresCommitId: false,
        buildBody: () => `与えられた案や主張に対して、反対意見を代弁してください。無理に否定するのではなく、どこに懸念があり、どのような立場の人が反対しそうかが分かるように整理してください。必要であれば、反対意見が成立する条件も添えてください。`
    },
    {
        id: "popular-failure-scenario-request",
        label: "P1304-002: この案が失敗するとしたらを考える",
        keywords: ["P1304-002", "failure scenario", "premortem", "how this fails", "failure analysis", "失敗するとしたら", "プリモータム", "失敗シナリオ", "しっぱいするとしたら", "しっぱいしなりお"],
        requiresCommitId: false,
        buildBody: () => `この案が失敗するとしたら、どのような理由や経路で失敗しうるかを考えてください。後から振り返るのではなく、事前に失敗パターンを想定するつもりで、見落としやすい要因を列挙してください。可能であれば、失敗を避けるための予防策も簡潔に添えてください。`
    },
    {
        id: "popular-counterevidence-request",
        label: "P1304-003: この主張への反証を考える",
        keywords: ["P1304-003", "counterevidence", "disprove claim", "counterproof", "opposing evidence", "反証", "反証を考える", "反対根拠", "はんしょう", "はんたいこんきょ"],
        requiresCommitId: false,
        buildBody: () => `与えられた主張や結論について、それに対する反証を考えてください。どの前提が崩れると主張が弱くなるか、どの事実や観点が反対材料になりうるかを整理してください。`
    },
    {
        id: "popular-objection-list-request",
        label: "P1304-004: 想定される反対意見を列挙する",
        keywords: ["P1304-004", "list objections", "anticipated objections", "possible objections", "counterarguments list", "反対意見列挙", "想定反対意見", "反論候補", "はんたいいけんれっきょ", "はんろんこうほ"],
        requiresCommitId: false,
        buildBody: () => `与えられた案や提案について、想定される反対意見を列挙してください。技術面、運用面、コスト面、関係者調整の面などから、相手が懸念しそうな点を広く整理してください。`
    },
    {
        id: "popular-pm-view-request",
        label: "P1103-009: PM視点で見る",
        keywords: ["P1103-009", "pm perspective", "product manager view", "product perspective", "business priority", "PM視点", "プロダクト視点", "優先順位視点", "ぴーえむしてん", "ぷろだくとしてん"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容を PM 視点で見てください。価値、優先順位、利用者影響、意思決定のしやすさなどの観点から、何が重要で何を後回しにするべきかが分かるように整理してください。技術的な正しさだけでなく、プロダクトとしての判断材料を重視してください。`
    },
    {
        id: "popular-security-view-request",
        label: "P1005-001: セキュリティ視点で見る",
        keywords: ["P1005-001", "security perspective", "security review", "threat perspective", "security concerns", "セキュリティ視点", "脅威視点", "安全性観点", "せきゅりてぃしてん", "きょういしてん"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容をセキュリティ視点で見てください。権限、入力、公開範囲、依存関係、情報漏えい、悪用可能性などの観点から、注意すべき点や追加確認が必要な点を整理してください。重大な懸念がある場合は、優先して指摘してください。`
    },
    {
        id: "popular-timeline-request",
        label: "P1102-001: 出来事を時系列で整理",
        keywords: ["P1102-001", "timeline", "chronological order", "event timeline", "time sequence", "時系列", "タイムライン", "出来事整理", "じけいれつ", "たいむらいん"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容を、出来事の発生順に時系列で整理してください。単に並べるだけでなく、どこで状況が変わったのか、どの時点が重要なのかが分かるようにまとめてください。必要であれば、各時点の意味や影響も簡潔に添えてください。`
    },
    {
        id: "popular-decision-timeline-request",
        label: "P1102-002: 決定の流れを時系列で整理",
        keywords: ["P1102-002", "decision timeline", "decision history", "chronological decisions", "decision sequence", "決定の流れ", "判断履歴", "意思決定時系列", "けっていのながれ", "はんだんりれき"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容について、どのような順で意思決定や方針決定が行われたかを時系列で整理してください。どの時点で何が決まり、その判断が次にどう影響したのかが追えるようにまとめてください。必要であれば、未決のまま残っている点も併記してください。`
    },
    {
        id: "popular-cause-effect-request",
        label: "P1102-003: 原因と結果を分けて整理",
        keywords: ["P1102-003", "cause effect", "causal analysis", "cause and result", "why what happened", "原因と結果", "因果整理", "原因分析", "げんいんとけっか", "いんがせいり"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容について、原因と結果を分けて整理してください。何が引き金となり、何がその結果として起こったのかを混ぜずに区別して示してください。必要であれば、直接原因と間接的な影響も分けて説明してください。`
    },
    {
        id: "popular-root-cause-candidates-request",
        label: "P1102-004: 根本原因候補を列挙",
        keywords: ["P1102-004", "root cause", "root cause candidates", "underlying cause", "why analysis", "根本原因", "真因候補", "原因候補", "こんぽんげんいん", "しんいんこうほ"],
        requiresCommitId: false,
        buildBody: () => `与えられた問題や事象について、根本原因候補を列挙してください。表面的な現象の説明で止まらず、なぜそれが起きたのかを一段深く掘る観点で整理してください。まだ断定できない場合は、候補として複数並べて構いません。`
    },
    {
        id: "popular-problem-framing-request",
        label: "P1303-001: 本当の問題設定を見直す",
        keywords: ["P1303-001", "problem framing", "reframe problem", "true problem", "problem definition", "問題設定", "問い直し", "本当の問題", "もんだいせってい", "といなおし"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容について、本当の問題設定が適切かを見直してください。いま解こうとしている問題が本質的な課題なのか、症状への対処に留まっていないか、問いそのものを再確認してください。必要であれば、別の問題設定案も示してください。`
    },
    {
        id: "popular-redefine-question-request",
        label: "P1303-002: 問いを再定義する",
        keywords: ["P1303-002", "redefine question", "reframe question", "question redesign", "better question", "問いを再定義", "問いの言い換え", "再定義", "といをさいていぎ", "といのいいかえ"],
        requiresCommitId: false,
        buildBody: () => `与えられた問いや依頼を、より解きやすく、判断しやすい形に再定義してください。問いが広すぎる、曖昧すぎる、前提が混ざっている場合は、それを整理して、何を答えるべきかが明確になるように言い換えてください。`
    },
    {
        id: "popular-moscow-request",
        label: "P1302-003: Must / Should / Could に分ける",
        keywords: ["P1302-003", "moscow", "must should could", "prioritization", "priority split", "Must Should Could", "優先分類", "モスコウ", "ゆうせんぶんるい"],
        requiresCommitId: false,
        buildBody: () => `与えられた項目を、Must / Should / Could に分けて整理してください。必須、できれば必要、余裕があれば対応、のように優先度の違いが分かるように整理し、判断理由も簡潔に示してください。`
    },
    {
        id: "popular-now-later-never-request",
        label: "P1302-004: 今やる / 後でやる / やらないに分ける",
        keywords: ["P1302-004", "now later never", "do later", "not now", "prioritization buckets", "今やる", "後でやる", "やらない", "いまやる", "あとでやる"],
        requiresCommitId: false,
        buildBody: () => `与えられた項目を、今やる / 後でやる / やらない に分けて整理してください。優先度だけでなく、なぜ今なのか、なぜ後なのか、なぜやらないのかが分かるように理由も簡潔に添えてください。`
    },
    {
        id: "popular-priority-ranking-request",
        label: "P1302-005: 優先順位を番号付きで並べる",
        keywords: ["P1302-005", "priority ranking", "rank priorities", "ordered priorities", "priority order", "優先順位", "優先順", "順位づけ", "ゆうせんじゅんい", "じゅんいづけ"],
        requiresCommitId: false,
        buildBody: () => `与えられた候補やタスクについて、優先順位を番号付きで並べてください。なぜその順番になるのかが分かるように、各項目の優先理由も簡潔に添えてください。`
    },
    {
        id: "popular-priority-criteria-request",
        label: "P1302-006: 優先順位づけの観点を整理する",
        keywords: ["P1302-006", "priority criteria", "prioritization criteria", "ranking criteria", "how to prioritize", "優先順位観点", "優先判断基準", "優先基準", "ゆうせんじゅんいかんてん", "ゆうせんはんだんきじゅん"],
        requiresCommitId: false,
        buildBody: () => `与えられた候補を優先順位づけするための観点を整理してください。重要度、緊急度、影響範囲、実装コスト、リスクなど、何を基準に順番を決めるべきかが分かるように整理してください。`
    },
    {
        id: "popular-classify-items-request",
        label: "P1103-007: 項目を分類する",
        keywords: ["P1103-007", "categorize items", "classification", "group items", "sorting", "分類", "項目分類", "整理分類", "ぶんるい", "こうもくぶんるい"],
        requiresCommitId: false,
        buildBody: () => `与えられた項目を分類してください。似たものをまとめ、異なる性質のものは分けて、全体像が見えやすくなるように整理してください。必要であれば、分類軸や分類理由も簡潔に示してください。`
    },
    {
        id: "popular-cluster-issues-request",
        label: "P1103-008: 論点をクラスタリングする",
        keywords: ["P1103-008", "cluster issues", "clustering", "group topics", "issue clustering", "クラスタリング", "論点クラスタ", "話題整理", "くらすたりんぐ", "ろんてんくらすた"],
        requiresCommitId: false,
        buildBody: () => `与えられた論点や項目をクラスタリングしてください。個別に散らばっている話題を、近いテーマごとにまとめて、どの塊で考えると分かりやすいかが分かるように整理してください。必要に応じて各クラスタのラベルも付けてください。`
    },
    {
        id: "popular-scope-definition-request",
        label: "P1402-001: 対象範囲を明確化する",
        keywords: ["P1402-001", "scope definition", "define scope", "scope clarification", "scope boundary", "対象範囲", "スコープ定義", "範囲明確化", "たいしょうはんい", "すこーぷていぎ"],
        requiresCommitId: false,
        buildBody: () => `与えられた作業や議題について、対象範囲を明確化してください。何を含み、何を含まないのか、どこまでを今回扱うのかが分かるように整理してください。必要であれば、範囲が曖昧な点も指摘してください。`
    },
    {
        id: "popular-in-out-scope-request",
        label: "P1402-002: 今回やること / やらないことを分ける",
        keywords: ["P1402-002", "in scope out of scope", "scope split", "do and do not", "boundary split", "やること", "やらないこと", "対象外", "やることやらないこと", "たいしょうがい"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容について、今回やることとやらないことを分けて整理してください。対象外を明示することで作業の境界が見えるようにし、必要であれば、なぜ今回はやらないのかも簡潔に説明してください。`
    },
    {
        id: "popular-scope-boundary-request",
        label: "P1402-003: スコープ境界を明確にする",
        keywords: ["P1402-003", "scope boundary", "scope edges", "boundary clarification", "in out boundary", "スコープ境界", "境界明確化", "対象境界", "すこーぷきょうかい", "きょうかいめいかくか"],
        requiresCommitId: false,
        buildBody: () => `与えられた作業や仕様について、スコープの境界を明確にしてください。どこからが対象で、どこからが対象外なのか、境界で判断に迷いやすい点も含めて整理してください。`
    },
    {
        id: "popular-scope-expansion-risk-request",
        label: "P1402-004: スコープ肥大化のリスクを整理する",
        keywords: ["P1402-004", "scope creep", "scope expansion risk", "scope creep risk", "boundary drift", "スコープ肥大化", "スコープクリープ", "範囲拡大リスク", "すこーぷひだいか", "はんいかくだいりすく"],
        requiresCommitId: false,
        buildBody: () => `与えられた作業や計画について、スコープ肥大化のリスクを整理してください。どの要求や論点が範囲を広げやすいか、どこで歯止めをかけるべきかが分かるように整理してください。`
    },
    {
        id: "popular-user-story-request",
        label: "P1401-003: ユーザーストーリーとして書き直す",
        keywords: ["P1401-003", "user story", "rewrite as user story", "story format", "user perspective", "ユーザーストーリー", "利用者視点", "すとーりーけいしき", "りようしゃしてん"],
        requiresCommitId: false,
        buildBody: () => `与えられた要求や案を、ユーザーストーリーの形に書き直してください。誰が、何をしたいのか、なぜそれが必要なのかが伝わるように整理してください。必要に応じて、利用者の価値や期待結果も明示してください。`
    },
    {
        id: "popular-use-case-list-request",
        label: "P1401-004: ユースケースを列挙する",
        keywords: ["P1401-004", "use cases", "use case list", "scenario list", "usage scenarios", "ユースケース", "利用シナリオ", "使い方列挙", "ゆーすけーす", "りようしなりお"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容について、考えられるユースケースを列挙してください。誰がどの状況で使うのか、どのような流れがあるのかが分かるように、代表的な利用シナリオを整理してください。必要であれば、主要ケースと例外ケースを分けて示してください。`
    },
    {
        id: "popular-acceptance-criteria-request",
        label: "P1004-003: 受け入れ条件を作成",
        keywords: ["P1004-003", "acceptance criteria", "acceptance conditions", "done criteria", "completion criteria", "受け入れ条件", "確認条件", "受入条件", "うけいれじょうけん", "かくにんじょうけん"],
        requiresCommitId: false,
        buildBody: () => `与えられた要求や作業に対して、受け入れ条件を作成してください。何が満たされれば完了と見なせるのか、確認可能な形で整理してください。必要であれば、正常系、例外系、制約条件も含めて明示してください。`
    },
    {
        id: "popular-definition-of-done-request",
        label: "P1004-004: 完了条件を定義する",
        keywords: ["P1004-004", "definition of done", "done criteria", "completion definition", "done definition", "完了条件", "Doneの定義", "完了定義", "かんりょうじょうけん", "だんのていぎ"],
        requiresCommitId: false,
        buildBody: () => `与えられた作業について、完了条件を定義してください。単に「実装した」ではなく、確認、文書、テスト、共有なども含めて、どの状態なら完了と言えるのかが分かるように整理してください。`
    },
    {
        id: "popular-test-viewpoints-request",
        label: "P1004-005: テスト観点を列挙",
        keywords: ["P1004-005", "test viewpoints", "test ideas", "test perspectives", "test checklist", "テスト観点", "試験観点", "確認観点", "てすとかんてん", "しけんかんてん"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容について、テスト観点を列挙してください。どこを確認すれば抜け漏れが減るのかが分かるように、観点ベースで整理してください。必要であれば、機能、入力、境界、例外、依存のように分類して示してください。`
    },
    {
        id: "popular-test-buckets-request",
        label: "P1004-006: 正常系 / 異常系 / 境界値で整理",
        keywords: ["P1004-006", "normal abnormal boundary", "test buckets", "boundary values", "test categories", "正常系", "異常系", "境界値", "せいじょうけい", "いじょうけい", "きょうかいち"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容について、正常系 / 異常系 / 境界値 の観点で整理してください。確認すべきケースがどの枠に属するかを分けることで、テスト観点の抜け漏れを見つけやすくしてください。必要に応じて、各カテゴリの代表例も添えてください。`
    },
    {
        id: "popular-shorten-text-request",
        label: "P1203-001: 冗長文を短く書き直す",
        keywords: ["P1203-001", "shorten text", "concise rewrite", "reduce verbosity", "make concise", "冗長文", "短く書き直す", "簡潔化", "じょうちょうぶん", "かんけつか"],
        requiresCommitId: false,
        buildBody: () => `与えられた文章を、意味を保ったまま短く書き直してください。情報を削りすぎず、冗長さだけを減らして、読みやすく簡潔な文に整えてください。必要に応じて、繰り返しや回りくどい表現を積極的に圧縮してください。`
    },
    {
        id: "popular-bullet-format-request",
        label: "P1203-002: 箇条書きに整形する",
        keywords: ["P1203-002", "bullet list", "format as bullets", "list formatting", "bulleted summary", "箇条書き", "箇条書き化", "リスト化", "かじょうがき", "りすとか"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容を、箇条書きに整形してください。読みやすさと一覧性を重視し、項目が一目で追えるように整理してください。必要であれば、項目の粒度や順序も調整してください。`
    },
    {
        id: "popular-translate-english-request",
        label: "P1204-001: 英訳する",
        keywords: ["P1204-001", "translate to english", "english translation", "translate english", "en translation", "英訳", "英語にする", "えいやく", "えいごにする"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容を英訳してください。意味の正確さを優先しつつ、読み手にとって自然な英語になるように整えてください。必要に応じて、直訳よりも意図が伝わる表現を選んでください。`
    },
    {
        id: "popular-translate-japanese-request",
        label: "P1204-002: 和訳する",
        keywords: ["P1204-002", "translate to japanese", "japanese translation", "translate japanese", "jp translation", "和訳", "日本語にする", "わやく", "にほんごにする"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容を和訳してください。意味の正確さを保ちつつ、日本語として自然で読みやすい文になるように整えてください。必要に応じて、直訳よりも意図が伝わる言い回しを選んでください。`
    },
    {
        id: "popular-issue-draft-request",
        label: "P1403-001: Issue 文面に変換",
        keywords: ["P1403-001", "issue draft", "issue text", "convert to issue", "issue writing", "Issue文面", "Issue化", "課題票文面", "いしゅーぶんめん", "いしゅーか"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容を、Issue に書く文面へ変換してください。背景、問題、期待する対応、補足情報が整理され、後から読んでも何を扱う Issue なのかが分かるようにまとめてください。必要であれば、タイトル案も示してください。`
    },
    {
        id: "popular-review-request-draft",
        label: "P1403-002: レビュー依頼文に変換",
        keywords: ["P1403-002", "review request", "request review", "review draft", "ask for review", "レビュー依頼文", "レビュー依頼", "れびゅーいらいぶん", "れびゅーいらい"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容を、レビュー依頼文へ変換してください。何を見てほしいのか、どこに注意してほしいのか、レビュー相手が短時間で状況を把握できるように整理してください。必要であれば、前提や確認してほしい観点も添えてください。`
    },
    {
        id: "popular-question-gap-request",
        label: "P1403-003: 不足情報を埋める質問を作る",
        keywords: ["P1403-003", "clarifying questions", "missing information questions", "questions to ask", "fill gaps", "不足情報", "確認質問", "ヒアリング質問", "ふそくじょうほう", "かくにんしつもん"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容について、不足情報を埋めるための質問を作ってください。いまの情報だけでは判断しにくい点や、解像度が足りない点を見つけて、優先度の高い質問から並べてください。`
    },
    {
        id: "popular-spec-question-request",
        label: "P1403-004: 仕様確認質問を列挙",
        keywords: ["P1403-004", "spec questions", "spec clarification", "requirements questions", "questions for spec", "仕様確認質問", "仕様質問", "要件確認", "しようかくにんしつもん", "ようけんかくにん"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容について、仕様確認のための質問を列挙してください。あいまいな仕様、未確定の振る舞い、境界条件、例外時の扱いなど、実装前に確認したほうがよい点を質問の形で整理してください。`
    },
    {
        id: "popular-evaluation-criteria-request",
        label: "P1305-001: 評価基準を定義",
        keywords: ["P1305-001", "evaluation criteria", "success criteria", "judgment criteria", "assessment criteria", "評価基準", "判断基準", "成功基準", "ひょうかきじゅん", "はんだんきじゅん"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容について、良し悪しを判断するための評価基準を定義してください。何をもって成功とみなすのか、どの観点で比較や採否判断を行うのかが分かるように整理してください。必要であれば、優先度の高い基準から並べてください。`
    },
    {
        id: "popular-comparison-axes-request",
        label: "P1305-002: 比較軸を作る",
        keywords: ["P1305-002", "comparison axes", "comparison criteria", "evaluation axes", "decision axes", "比較軸", "評価軸", "比較基準", "ひかくじく", "ひょうかじく"],
        requiresCommitId: false,
        buildBody: () => `与えられた選択肢や案を比較するための比較軸を作ってください。何を見比べれば判断しやすいのかが分かるように、軸を整理してください。必要であれば、各軸の意味や重要度も簡潔に示してください。`
    },
    {
        id: "popular-template-conversion-request",
        label: "P1505-001: 再利用テンプレートへ変換",
        keywords: ["P1505-001", "template conversion", "reusable template", "make template", "boilerplate", "再利用テンプレート", "テンプレート化", "ひな形化", "さいりようてんぷれーと", "てんぷれーとか"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容を、再利用しやすいテンプレートへ変換してください。毎回同じ構造で使えるように、変数部分と固定部分が分かる形で整理してください。必要であれば、利用時の簡単な補足も添えてください。`
    },
    {
        id: "popular-boilerplate-request",
        label: "P1505-002: ひな形化する",
        keywords: ["P1505-002", "boilerplate", "draft template", "skeleton format", "make skeleton", "ひな形", "ひな形化", "骨格化", "ひながた", "こっかくか"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容を、ひな形として使える骨格へ整えてください。まだ具体値が埋まっていなくても、どの順で何を書くのかが分かるように、見出しや項目を整理してください。`
    },
    {
        id: "popular-mermaid-prep-request",
        label: "P1606-001: Mermaid 前の整理を行う",
        keywords: ["P1606-001", "mermaid prep", "diagram prep", "prepare mermaid", "diagram structure", "Mermaid前整理", "図示前整理", "Mermaid準備", "まーめいどまえせいり", "ずじまえせいり"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容を Mermaid で図示する前に、ノード候補、関係候補、流れ、階層を整理してください。いきなり記法へ落とすのではなく、何を図の要素として採用するのかが分かるように中間整理してください。`
    },
    {
        id: "popular-dot-node-prep-request",
        label: "P1606-002: DOT 前のノード整理を行う",
        keywords: ["P1606-002", "dot prep", "graphviz prep", "node prep", "prepare dot", "DOT前整理", "ノード整理", "Graphviz準備", "どっとまえせいり", "のーどせいり"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容を Graphviz DOT へ落とす前に、ノード候補とエッジ候補を整理してください。どの概念をノードにし、どの関係をエッジにするのかが分かるように、中間表現として整理してください。`
    },
    {
        id: "popular-faq-expansion-request",
        label: "P1502-001: 想定質問を増やして FAQ 化する",
        keywords: ["P1502-001", "faq expansion", "expand faq", "anticipated questions", "question expansion", "想定質問", "FAQ拡張", "想定問答", "そうていしつもん", "そうていもんどう"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容から、読み手が疑問に思いそうな点を増やして FAQ 化してください。すでに明示されている情報だけでなく、読み手が途中で引っかかりそうな点を先回りして質問化してください。`
    },
    {
        id: "popular-misunderstanding-qa-request",
        label: "P1502-002: 誤解ポイントから Q&A を作る",
        keywords: ["P1502-002", "misunderstanding qa", "qa from confusion", "common misunderstandings", "qa generation", "誤解ポイント", "Q&A作成", "誤解対策", "ごかいぽいんと", "きゅーあんどえーさくせい"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容について、誤解されやすいポイントから Q&A を作ってください。どこで誤読や思い込みが起きやすいかを見つけて、それを防ぐ質問と回答の形へ整理してください。`
    },
    {
        id: "popular-adr-style-request",
        label: "P1306-001: ADR 風に整理する",
        keywords: ["P1306-001", "adr", "architecture decision record", "decision record", "adr style", "ADR", "意思決定記録", "判断記録", "えーでぃーあーる", "いしけっていきろく"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容を ADR 風に整理してください。背景、課題、選択肢、採用した判断、採用理由、影響を分けて、後から参照しやすい意思決定記録の形にまとめてください。`
    },
    {
        id: "popular-adopt-reject-record-request",
        label: "P1306-002: 採用 / 不採用理由を記録する",
        keywords: ["P1306-002", "adopt reject record", "decision log", "accepted rejected", "why adopted", "採用理由", "不採用理由", "採否記録", "さいようりゆう", "ふさいようりゆう"],
        requiresCommitId: false,
        buildBody: () => `与えられた候補や判断について、採用した理由と不採用にした理由を記録してください。結論だけでなく、なぜそう判断したのかが後から追えるように、対比が見える形で整理してください。`
    },
    {
        id: "popular-consistency-check-request",
        label: "P1003-001: 記述間の矛盾を探す",
        keywords: ["P1003-001", "consistency check", "find contradictions", "inconsistency", "contradiction scan", "矛盾", "整合性確認", "不整合", "むじゅん", "せいごうせいかくにん"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容の中に、記述どうしの矛盾や不整合がないか確認してください。前後で言っていることが食い違っていないか、条件や結論が噛み合っているかを見て、問題があれば具体的に指摘してください。`
    },
    {
        id: "popular-term-drift-request",
        label: "P1003-002: 用語の揺れを検出する",
        keywords: ["P1003-002", "term drift", "term inconsistency", "terminology drift", "vocabulary mismatch", "用語の揺れ", "用語不整合", "表記揺れ", "ようごのゆれ", "ひょうきゆれ"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容について、同じものを別の言葉で呼んでいないか、用語の揺れや表記の不整合を検出してください。読み手が混乱しそうな箇所があれば、統一候補も併せて示してください。`
    },
    {
        id: "popular-abstract-explanation-request",
        label: "P1202-005: もっと抽象化して説明する",
        keywords: ["P1202-005", "abstract explanation", "higher level", "abstract summary", "generalize", "抽象化", "上位概念", "抽象説明", "ちゅうしょうか", "じょういがいねん"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容を、より抽象化したレベルで説明してください。細部の事例や固有事情から少し離れて、どのような一般原則や上位概念として捉えられるのかが分かるように整理してください。`
    },
    {
        id: "popular-concrete-explanation-request",
        label: "P1202-006: もっと具体化して説明する",
        keywords: ["P1202-006", "make concrete", "concrete explanation", "more specific", "add specifics", "具体化", "具体説明", "もっと具体的", "ぐたいか", "ぐたいせつめい"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容を、より具体的に説明してください。抽象的な表現や一般論だけでなく、具体例、場面、入力や出力、実際の振る舞いがイメージできるように補ってください。`
    },
    {
        id: "popular-three-examples-request",
        label: "P1202-007: 具体例を3つ出す",
        keywords: ["P1202-007", "three examples", "give examples", "sample examples", "example generation", "具体例3つ", "具体例", "例を出す", "ぐたいれい", "れいをだす"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容について、理解を助ける具体例を 3 つ出してください。似た例ばかりではなく、少しずつ観点の異なる例を選んで、考え方や使い分けが伝わるようにしてください。`
    },
    {
        id: "popular-good-bad-examples-request",
        label: "P1202-008: 良い例 / 悪い例を出す",
        keywords: ["P1202-008", "good bad examples", "good example bad example", "example contrast", "contrastive examples", "良い例", "悪い例", "対比例", "よいれい", "わるいれい"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容について、良い例と悪い例を対比して示してください。単に正解を書くのではなく、どこが良くてどこが悪いのかが分かるように、理由も含めて整理してください。`
    },
    {
        id: "popular-improve-first-draft-request",
        label: "P1205-001: 初稿を改善する",
        keywords: ["P1205-001", "improve draft", "revise first draft", "draft improvement", "polish draft", "初稿改善", "改稿", "ドラフト改善", "しょこうかいぜん", "かいこう"],
        requiresCommitId: false,
        buildBody: () => `与えられた初稿を改善してください。意図は保ちつつ、分かりやすさ、構成、表現の明確さを高める方向で見直してください。必要であれば、何をどう改善したかも簡潔に示してください。`
    },
    {
        id: "popular-fix-weak-points-request",
        label: "P1205-002: 弱い点だけを改善する",
        keywords: ["P1205-002", "fix weak points", "targeted revision", "improve weak areas", "focused rewrite", "弱い点改善", "部分改善", "ピンポイント改善", "よわいてんかいぜん", "ぶぶんかいぜん"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容について、全体を書き直すのではなく、弱い点だけを改善してください。冗長な箇所、不明確な箇所、根拠が弱い箇所など、改善効果の高い部分に絞って修正してください。`
    },
    {
        id: "popular-hard-to-read-request",
        label: "P1203-003: 読みにくい箇所を洗う",
        keywords: ["P1203-003", "hard to read", "readability issues", "reading friction", "find unclear parts", "読みにくい", "可読性", "読みにくい箇所", "よみにくい", "かどくせい"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容について、読みにくい箇所を洗い出してください。長すぎる文、主語が曖昧な箇所、論理の飛躍、情報の詰め込みすぎなど、読み手が引っかかりそうな点を具体的に指摘してください。`
    },
    {
        id: "popular-heading-structure-request",
        label: "P1203-004: 見出し構造を整える",
        keywords: ["P1203-004", "heading structure", "outline cleanup", "heading organization", "document structure", "見出し構造", "アウトライン整理", "構造整理", "みだしこうぞう", "あうとらいんせいり"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容について、見出し構造を整えてください。どこで話題が切り替わるのか、どの情報が同じまとまりに属するのかが分かるように、自然な見出しと順序へ整理してください。`
    },
    {
        id: "popular-persuasion-request",
        label: "P1405-001: 反対相手を説得する文面を作る",
        keywords: ["P1405-001", "persuasion", "persuasive writing", "convince opponent", "stakeholder persuasion", "説得文面", "説得", "反対相手", "せっとくぶんめん", "せっとく"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容について、反対意見を持つ相手を説得するための文面を作ってください。押し切るのではなく、相手の懸念を踏まえたうえで、納得しやすい根拠と利点が伝わるように整理してください。`
    },
    {
        id: "popular-consensus-request",
        label: "P1405-002: 合意形成向けに整理する",
        keywords: ["P1405-002", "consensus building", "alignment", "agreement support", "stakeholder alignment", "合意形成", "合意向け", "調整文面", "ごういけいせい", "ちょうせいぶんめん"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容を、合意形成しやすい形に整理してください。対立点だけでなく、共有できる前提や一致している目的も見えるようにし、どこから話を進めると合意しやすいかが分かるようにしてください。`
    },
    {
        id: "popular-rough-cost-request",
        label: "P1301-005: 実装コストを粗く見積もる",
        keywords: ["P1301-005", "rough cost", "rough estimate", "implementation cost", "high medium low", "コスト見積", "粗見積", "実装コスト", "こすとみつもり", "あらみつもり"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容について、実装コストを粗く見積もってください。厳密な工数ではなく、大 / 中 / 小 や 高 / 中 / 低 のような粒度で構いません。必要であれば、どの要因がコストを押し上げるのかも示してください。`
    },
    {
        id: "popular-cost-factor-request",
        label: "P1301-006: コスト要因を洗い出す",
        keywords: ["P1301-006", "cost factors", "effort drivers", "cost drivers", "complexity factors", "コスト要因", "工数要因", "複雑性要因", "こすとよういん", "こうすうよういん"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容について、コストや工数に効きそうな要因を洗い出してください。実装難易度、依存関係、調査量、テスト負荷、確認相手の多さなど、何が重さの原因になりそうかを整理してください。`
    },
    {
        id: "popular-dependency-inventory-request",
        label: "P1101-005: 依存先一覧を作る",
        keywords: ["P1101-005", "dependency inventory", "dependency list", "upstream dependencies", "dependency map", "依存先一覧", "依存一覧", "依存マップ", "いぞんさきいちらん", "いぞんいちらん"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容について、依存先一覧を作ってください。どの要素がどの外部要因や前提に依存しているのかを洗い出し、依存の全体像が見えるように整理してください。`
    },
    {
        id: "popular-dependency-reduction-request",
        label: "P1101-006: 依存削減候補を出す",
        keywords: ["P1101-006", "dependency reduction", "reduce dependencies", "dependency cleanup", "dependency simplification", "依存削減", "依存整理", "依存簡素化", "いぞんさくげん", "いぞんせいり"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容について、削減や整理の候補となる依存関係を挙げてください。どの依存が強すぎるか、どの依存がなくても成立しそうか、分離候補はどこかが分かるように整理してください。`
    },
    {
        id: "popular-stakeholder-request",
        label: "P1405-003: ステークホルダーを整理する",
        keywords: ["P1405-003", "stakeholders", "stakeholder mapping", "affected parties", "interested parties", "ステークホルダー", "利害関係者", "関係者整理", "すてーくほるだー", "りがいかんけいしゃ"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容について、ステークホルダーを整理してください。誰が影響を受けるのか、誰に確認が必要なのか、誰が意思決定に関わるのかが分かるように分類してください。`
    },
    {
        id: "popular-audience-interest-request",
        label: "P1405-004: 説明相手ごとの関心を整理する",
        keywords: ["P1405-004", "audience concerns", "stakeholder concerns", "interest mapping", "different audience interests", "関心整理", "説明相手", "相手別関心", "かんしんせいり", "あいてべつかんしん"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容について、説明相手ごとに関心を整理してください。どの相手が何を気にするのか、何を先に説明すると伝わりやすいのかが分かるようにまとめてください。`
    },
    {
        id: "popular-can-cannot-request",
        label: "P1402-005: できること / できないことを分ける",
        keywords: ["P1402-005", "can cannot", "capability limits", "what is possible", "limitations summary", "できること", "できないこと", "限界整理", "できることできないこと", "げんかいせいり"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容について、できることとできないことを分けて整理してください。期待を持たせすぎず、限界や前提も含めて、現実的にどこまで可能なのかが分かるように示してください。`
    },
    {
        id: "popular-expectation-alignment-request",
        label: "P1402-006: 制約込みで期待値を合わせる",
        keywords: ["P1402-006", "expectation alignment", "set expectations", "align expectations", "manage expectations", "期待値調整", "期待合わせ", "制約込み", "きたいちちょうせい", "きたいあわせ"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容について、制約も含めて期待値を合わせる説明を作ってください。何がすぐできて、何が時間や条件を要し、何が難しいのかが分かるように、過剰期待を防ぐ形で整理してください。`
    },
    {
        id: "popular-operation-procedure-request",
        label: "P1406-001: 運用手順を整理する",
        keywords: ["P1406-001", "operation procedure", "runbook", "operational steps", "maintenance procedure", "運用手順", "運用フロー", "ランブック", "うんようてじゅん", "らんぶっく"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容について、運用手順を整理してください。日常的にどう扱うか、どの順で何を確認し、どこで注意すべきかが分かるように、実務で使いやすい手順へまとめてください。`
    },
    {
        id: "popular-incident-flow-request",
        label: "P1406-002: 障害時対応フローを整理する",
        keywords: ["P1406-002", "incident flow", "incident response", "failure handling flow", "troubleshooting flow", "障害時対応", "障害対応フロー", "トラブル対応", "しょうがいじたいおう", "とらぶるたいおう"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容について、障害時の対応フローを整理してください。何を確認し、どの順で切り分け、どこで連絡し、どの状態で収束とみなすのかが分かるようにまとめてください。`
    },
    {
        id: "popular-metrics-request",
        label: "P1005-002: 観測すべき指標候補を出す",
        keywords: ["P1005-002", "metrics candidates", "observability metrics", "what to measure", "monitoring metrics", "指標候補", "観測指標", "メトリクス候補", "しひょうこうほ", "かんそくしひょう"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容について、観測すべき指標候補を出してください。何を見れば状態の良し悪しや異常の兆候が分かるのか、運用や改善に役立つ観点で整理してください。`
    },
    {
        id: "popular-observability-request",
        label: "P1005-003: ログ / メトリクス / アラート観点を整理する",
        keywords: ["P1005-003", "logs metrics alerts", "observability", "monitoring viewpoints", "alerting", "ログ", "メトリクス", "アラート", "観測観点", "ろぐ", "めとりくす", "あらーと"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容について、ログ / メトリクス / アラート の観点を整理してください。どこで記録し、何を数値で見て、どの条件で通知すべきかが分かるように、役割を分けて整理してください。`
    },
    {
        id: "popular-incident-report-request",
        label: "P1005-004: 事象報告文面を作成する",
        keywords: ["P1005-004", "incident report", "status report", "issue report", "event report", "事象報告", "障害報告", "報告文面", "じしょうほうこく", "しょうがいほうこく"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容をもとに、事象報告文面を作成してください。何が起きたのか、いつからか、影響は何か、現在どうなっているのかが短時間で伝わるように整理してください。`
    },
    {
        id: "popular-impact-scope-request",
        label: "P1005-005: 影響範囲を整理する",
        keywords: ["P1005-005", "impact scope", "affected scope", "impact analysis", "impact area", "影響範囲", "影響分析", "影響先", "えいきょうはんい", "えいきょうぶんせき"],
        requiresCommitId: false,
        buildBody: () => `与えられた事象や変更について、影響範囲を整理してください。誰に、どの機能に、どのデータに、どの程度の影響があるのかが分かるように整理してください。必要であれば、直接影響と間接影響を分けて示してください。`
    },
    {
        id: "popular-threat-model-entry-request",
        label: "P1005-006: 脅威モデリングの入口を整理する",
        keywords: ["P1005-006", "threat modeling", "security threats", "threat model entry", "security analysis", "脅威モデリング", "脅威整理", "脅威分析入口", "きょういもでりんぐ", "きょういせいり"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容について、脅威モデリングの入口となる観点を整理してください。何が守るべき資産で、どこに攻撃面があり、どの境界でリスクが高まりそうかが見えるように整理してください。`
    },
    {
        id: "popular-attack-surface-request",
        label: "P1005-007: 攻撃面を洗い出す",
        keywords: ["P1005-007", "attack surface", "security surface", "exposure points", "entry points", "攻撃面", "攻撃面洗い出し", "露出箇所", "こうげきめん", "ろしゅつかしょ"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容について、攻撃面を洗い出してください。外部入力、公開インターフェース、権限境界、依存ライブラリなど、悪用されうる入口や露出箇所が分かるように整理してください。`
    },
    {
        id: "popular-entity-extract-request",
        label: "P1104-001: エンティティを抽出する",
        keywords: ["P1104-001", "entity extraction", "entities", "domain entities", "object extraction", "エンティティ", "エンティティ抽出", "対象抽出", "えんてぃてぃ", "たいしょうちゅうしゅつ"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容から、主要なエンティティを抽出してください。何がデータや概念の中心単位になるのか、どの対象を区別して扱う必要があるのかが分かるように整理してください。`
    },
    {
        id: "popular-relationship-model-request",
        label: "P1104-002: 関係性を整理する",
        keywords: ["P1104-002", "relationship modeling", "relationships", "entity relationships", "relation map", "関係性", "関係整理", "関連整理", "かんけいせい", "かんれんせいり"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容について、主要な要素どうしの関係性を整理してください。どれがどれに属し、依存し、参照し、連動するのかが分かるようにまとめてください。必要であれば、1対多や多対多のような関係も示してください。`
    },
    {
        id: "popular-api-io-request",
        label: "P1104-003: API の入出力定義を整理する",
        keywords: ["P1104-003", "api io", "api input output", "api contract", "request response", "API入出力", "API定義", "リクエストレスポンス", "えーぴーあいにゅうしゅつりょく", "えーぴーあいていぎ"],
        requiresCommitId: false,
        buildBody: () => `与えられた API 案について、入出力定義を整理してください。何を受け取り、何を返すのか、どの項目が必須でどの項目が任意かが分かるように整理してください。必要であれば、代表的な例も添えてください。`
    },
    {
        id: "popular-api-error-request",
        label: "P1104-004: API のエラーパターンを整理する",
        keywords: ["P1104-004", "api errors", "error patterns", "api error cases", "failure responses", "APIエラー", "エラーパターン", "失敗応答", "えーぴーあいえらー", "えらーぱたーん"],
        requiresCommitId: false,
        buildBody: () => `与えられた API 案について、エラーパターンを整理してください。どのような失敗がありうるか、どの条件でどのエラーを返すべきか、読み手や利用者が理解しやすい形で整理してください。`
    },
    {
        id: "popular-ui-elements-request",
        label: "P1104-005: 画面要素を列挙する",
        keywords: ["P1104-005", "ui elements", "screen elements", "interface elements", "screen inventory", "画面要素", "UI要素", "画面部品", "がめんようそ", "ゆーあいようそ"],
        requiresCommitId: false,
        buildBody: () => `与えられた画面や UI 案について、画面要素を列挙してください。何が表示され、何が入力され、何が操作対象になるのかが分かるように整理してください。必要であれば、要素の役割も簡潔に添えてください。`
    },
    {
        id: "popular-operation-flow-request",
        label: "P1104-006: 操作フローを整理する",
        keywords: ["P1104-006", "interaction flow", "operation flow", "user flow", "screen flow", "操作フロー", "ユーザーフロー", "画面遷移", "そうさふろー", "ゆーざーふろー"],
        requiresCommitId: false,
        buildBody: () => `与えられた画面や機能について、操作フローを整理してください。利用者がどの順に見て、入力し、確認し、次へ進むのかが分かるようにまとめてください。必要であれば、分岐や例外時の流れも示してください。`
    },
    {
        id: "popular-readme-improvement-request",
        label: "P1503-001: README 改善観点を整理する",
        keywords: ["P1503-001", "readme improvement", "documentation improvement", "readme review", "doc quality", "README改善", "READMEレビュー", "文書改善", "りーどみーかいぜん", "ぶんしょかいぜん"],
        requiresCommitId: false,
        buildBody: () => `与えられた README について、改善観点を整理してください。何が不足しているか、どこが読みにくいか、どの情報が正本として弱いかなど、改善すると価値が高い点を列挙してください。`
    },
    {
        id: "popular-doc-structure-review-request",
        label: "P1503-002: 文書構成を見直す",
        keywords: ["P1503-002", "document structure review", "doc structure", "restructure document", "outline review", "文書構成", "構成見直し", "アウトライン見直し", "ぶんしょこうせい", "こうせいみなおし"],
        requiresCommitId: false,
        buildBody: () => `与えられた文書について、構成を見直してください。情報の順番、見出しの切り方、正本情報と補助情報の分離など、読み手が追いやすくなる構成案を示してください。`
    },
    {
        id: "popular-learning-order-request",
        label: "P1506-001: 学習順序を作る",
        keywords: ["P1506-001", "learning order", "study order", "learning path", "curriculum order", "学習順序", "学習パス", "勉強順序", "がくしゅうじゅんじょ", "がくしゅうぱす"],
        requiresCommitId: false,
        buildBody: () => `与えられたテーマについて、学習順序を作ってください。何から学び、次に何を押さえ、どの順で理解を積み上げると自然かが分かるように整理してください。必要であれば、前提知識も併記してください。`
    },
    {
        id: "popular-exercise-request",
        label: "P1506-002: 練習問題を作る",
        keywords: ["P1506-002", "practice problems", "exercises", "quiz generation", "learning exercises", "練習問題", "演習問題", "クイズ生成", "れんしゅうもんだい", "えんしゅうもんだい"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容について、理解を確認するための練習問題を作ってください。単なる知識確認だけでなく、考え方や適用のしかたが身につくような問題を意識してください。必要であれば、解答例や確認ポイントも添えてください。`
    },
    {
        id: "popular-user-announcement-request",
        label: "P1405-005: 利用者向け告知文を作成",
        keywords: ["P1405-005", "user announcement", "announcement text", "notice for users", "change notice", "利用者向け告知", "告知文", "アナウンス文", "りようしゃむけこくち", "こくちぶん"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容をもとに、利用者向けの告知文を作成してください。何が変わるのか、いつからか、利用者にどのような影響があるのかが短く分かるように整理してください。必要に応じて、対応が必要かどうかも明記してください。`
    },
    {
        id: "popular-maintenance-announcement-request",
        label: "P1405-006: メンテナンス告知文を作成",
        keywords: ["P1405-006", "maintenance notice", "maintenance announcement", "scheduled maintenance", "downtime notice", "メンテナンス告知", "停止告知", "保守告知", "めんてなんすこくち", "ていしこくち"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容をもとに、メンテナンス告知文を作成してください。実施日時、影響範囲、利用者への影響、必要な注意点が分かるように整理してください。読み手がすぐ判断できるように、重要情報を先に示してください。`
    },
    {
        id: "popular-undefined-cases-request",
        label: "P1003-003: 未定義ケースを洗い出す",
        keywords: ["P1003-003", "undefined cases", "missing cases", "unhandled cases", "spec gaps", "未定義ケース", "仕様の穴", "未定義", "みていぎけーす", "しようのあな"],
        requiresCommitId: false,
        buildBody: () => `与えられた仕様や説明について、未定義のケースを洗い出してください。通常ケースだけでなく、境界条件、例外条件、入力不足時、失敗時などで扱いが決まっていない点を見つけて整理してください。`
    },
    {
        id: "popular-exception-spec-question-request",
        label: "P1003-004: 例外時仕様の穴を補う質問を作る",
        keywords: ["P1003-004", "exception spec questions", "edge case questions", "missing spec questions", "exception handling questions", "例外時仕様", "仕様穴質問", "境界ケース質問", "れいがいじしよう", "きょうかいけーすしつもん"],
        requiresCommitId: false,
        buildBody: () => `与えられた仕様について、例外時や異常時の仕様の穴を埋めるための質問を作ってください。失敗したらどうするか、入力が不正なときどう扱うか、想定外の状態でどう振る舞うかを確認できる質問を優先してください。`
    },
    {
        id: "popular-misleading-expression-request",
        label: "P1001-001: 誤解を招く表現を洗い出す",
        keywords: ["P1001-001", "misleading expressions", "misleading wording", "ambiguous phrasing", "confusing text", "誤解を招く表現", "曖昧表現", "誤読しやすい", "ごかいをまねくひょうげん", "あいまいひょうげん"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容について、誤解を招きやすい表現を洗い出してください。曖昧な言い回し、強すぎる断定、読み手によって意味がぶれそうな箇所があれば指摘し、必要に応じて改善案も示してください。`
    },
    {
        id: "popular-consideration-risk-request",
        label: "P1001-002: 配慮不足リスクを確認する",
        keywords: ["P1001-002", "consideration risk", "sensitivity check", "fairness check", "inclusive wording", "配慮不足", "配慮リスク", "表現配慮", "はいりょぶそく", "ひょうげんはいりょ"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容について、配慮不足のリスクがないか確認してください。読み手や関係者への配慮、公平性、センシティブな表現への注意などの観点から、問題になりそうな箇所を整理してください。`
    },
    {
        id: "popular-discomfort-risk-request",
        label: "P1001-003: 不快感リスクを確認する",
        keywords: ["P1001-003", "discomfort risk", "offensive wording", "upsetting content", "tone risk", "不快感", "不快感リスク", "不快表現", "ふかいかん", "ふかいひょうげん"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容について、人を不快にさせるリスクがないか確認してください。言い方のきつさ、押しつけがましさ、見下し、嘲笑、過度な断定、相手の立場を軽んじる表現などの観点から、問題になりそうな箇所を整理してください。必要であれば、より穏当な言い換えの方向も示してください。`
    },
    {
        id: "popular-aggressive-expression-request",
        label: "P1001-004: 攻撃的な表現がないか確認する",
        keywords: ["P1001-004", "aggressive wording", "hostile tone", "harsh expressions", "attacky language", "攻撃的表現", "攻撃的", "きつい言い方", "こうげきてきひょうげん", "きついいいかた"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容について、攻撃的な表現が含まれていないか確認してください。相手を責める言い方、挑発的な言い回し、侮辱的に受け取られうる箇所、対立を不必要に強める表現があれば整理してください。必要に応じて、意味を保ちながら角を減らす方向も示してください。`
    },
    {
        id: "popular-sensitive-expression-request",
        label: "P1001-005: センシティブな表現を確認する",
        keywords: ["P1001-005", "sensitive wording", "sensitive expressions", "social sensitivity", "inclusive language", "センシティブ表現", "配慮表現", "社会的配慮", "せんしてぃぶひょうげん", "しゃかいてきはいりょ"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容について、センシティブな表現がないか確認してください。属性、立場、背景、文化的事情などに関わる表現で、読み手や関係者に不必要な負荷や反発を生みそうな箇所があれば整理してください。断定しすぎず、どの観点で注意が必要そうかが分かるように示してください。`
    },
    {
        id: "popular-clarify-request-request",
        label: "P1205-003: 曖昧な依頼を明確化する",
        keywords: ["P1205-003", "clarify request", "clarify vague request", "refine request", "request clarification", "依頼明確化", "曖昧な依頼", "依頼整理", "いらいめいかくか", "あいまいないらい"],
        requiresCommitId: false,
        buildBody: () => `与えられた依頼内容が曖昧な場合に、それを明確化してください。何を求めているのか、何が不足しているのか、どの範囲を対象としているのかが分かるように整理してください。必要であれば、確認すべき不足点も示してください。`
    },
    {
        id: "popular-breakdown-request-request",
        label: "P1205-004: 依頼内容を分解する",
        keywords: ["P1205-004", "break down request", "request decomposition", "task breakdown from request", "split request", "依頼分解", "依頼内容分解", "タスク分解", "いらいぶんかい", "たすくぶんかい"],
        requiresCommitId: false,
        buildBody: () => `与えられた依頼内容を分解してください。大きな依頼を、そのままでは扱いにくい場合に、どのサブタスクや観点に分けると進めやすいかが分かるように整理してください。`
    },
    {
        id: "popular-ambiguity-removal-request",
        label: "P1205-005: 曖昧な表現を具体化する",
        keywords: ["P1205-005", "remove ambiguity", "clarify wording", "make specific", "reduce ambiguity", "曖昧さ除去", "曖昧表現具体化", "表現明確化", "あいまいさじょきょ", "ひょうげんめいかくか"],
        requiresCommitId: false,
        buildBody: () => `与えられた文章や依頼について、曖昧な表現を具体化してください。読み手によって解釈がぶれそうな語や表現を見つけて、必要に応じて言い換えや確認観点を示してください。`
    },
    {
        id: "popular-ambiguous-term-request",
        label: "P1205-006: 解釈が割れそうな語を洗い出す",
        keywords: ["P1205-006", "ambiguous terms", "terms with multiple interpretations", "interpretation gaps", "vague words", "解釈が割れる語", "曖昧語", "解釈差", "かいしゃくがわれるご", "あいまいご"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容について、解釈が割れそうな語や言い回しを洗い出してください。人によって意味がずれそうな語、範囲が曖昧な語、判断基準が不足している語を優先して整理してください。`
    },
    {
        id: "popular-agenda-request",
        label: "P1404-001: 会議アジェンダ案を作る",
        keywords: ["P1404-001", "meeting agenda", "agenda draft", "discussion agenda", "meeting topics", "会議アジェンダ", "アジェンダ案", "会議議題", "かいぎあじぇんだ", "ぎだいあん"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容をもとに、会議アジェンダ案を作ってください。何を決めるのか、何を共有するのか、どの順で話すと効率的かが分かるように整理してください。必要であれば、各議題の目的も添えてください。`
    },
    {
        id: "popular-post-meeting-actions-request",
        label: "P1404-002: 会議後アクションを整理する",
        keywords: ["P1404-002", "post meeting actions", "meeting follow-up", "action items", "after meeting", "会議後アクション", "宿題整理", "フォローアップ", "かいぎごあくしょん", "ふぉろーあっぷ"],
        requiresCommitId: false,
        buildBody: () => `与えられた会議内容や議事メモから、会議後アクションを整理してください。誰が何をするのか、どこが未決なのか、次回までの宿題は何かが分かるように整理してください。`
    },
    {
        id: "popular-slide-outline-request",
        label: "P1204-007: スライド骨子を作る",
        keywords: ["P1204-007", "slide outline", "presentation outline", "deck outline", "slide structure", "スライド骨子", "発表骨子", "資料骨子", "すらいどこっし", "はっぴょうこっし"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容をもとに、スライド骨子を作ってください。どの順に何を見せると理解しやすいかが分かるように、ページ単位または章立て単位で構成してください。必要であれば、各スライドの役割も簡潔に示してください。`
    },
    {
        id: "popular-speaking-flow-request",
        label: "P1204-008: 口頭説明の流れを作る",
        keywords: ["P1204-008", "speaking flow", "talk track", "presentation flow", "oral explanation", "口頭説明", "説明の流れ", "トークトラック", "こうとうせつめい", "せつめいのながれ"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容について、口頭説明の流れを作ってください。聞き手が理解しやすい順序で、どこで背景を説明し、どこで結論を出し、どこで補足するかが分かるように整理してください。`
    },
    {
        id: "popular-longtext-to-slides-request",
        label: "P1205-007: 長文をスライド向けに再構成する",
        keywords: ["P1205-007", "long text to slides", "slide conversion", "presentation rewrite", "deck conversion", "長文再構成", "スライド向け", "資料化", "ちょうぶんさいこうせい", "しりょうか"],
        requiresCommitId: false,
        buildBody: () => `与えられた長文を、スライド向けに再構成してください。段落をそのまま並べるのではなく、1 スライド 1 メッセージを意識して、箇条書きや図示しやすい単位へ整理してください。`
    },
    {
        id: "popular-log-to-material-request",
        label: "P1205-008: 会話ログを説明資料向けに再構成する",
        keywords: ["P1205-008", "conversation log to material", "log restructuring", "explanatory material", "meeting log to deck", "会話ログ再構成", "説明資料化", "ログ資料化", "かいわろぐさいこうせい", "せつめいしりょうか"],
        requiresCommitId: false,
        buildBody: () => `与えられた会話ログや議論ログを、説明資料向けに再構成してください。やり取りをそのまま並べるのではなく、背景、論点、結論、アクションが読み手に伝わる順に整理してください。`
    },
    {
        id: "popular-true-intent-request",
        label: "P1103-001: 依頼者の本当の目的を推定する",
        keywords: ["P1103-001", "true intent", "infer intent", "underlying goal", "real objective", "本当の目的", "意図推定", "依頼者意図", "ほんとうのもくてき", "いとすいてい"],
        requiresCommitId: false,
        buildBody: () => `与えられた依頼や発言について、依頼者の本当の目的を推定してください。表面的な要求だけでなく、なぜそれを求めているのか、背後にある狙いや困りごとが何かを考えて整理してください。`
    },
    {
        id: "popular-hidden-success-request",
        label: "P1103-002: 表現されていない成功条件を推定する",
        keywords: ["P1103-002", "hidden success criteria", "implicit success", "unstated goals", "success inference", "成功条件推定", "暗黙の成功条件", "隠れた要求", "せいこうじょうけんすいてい", "あんもくのせいこうじょうけん"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容について、明示されていない成功条件を推定してください。依頼者が満足するとしたら何が満たされている必要があるのか、表現されていない期待や判断基準を整理してください。`
    },
    {
        id: "popular-sensitive-assumptions-request",
        label: "P1102-005: 結論を左右する前提を洗い出す",
        keywords: ["P1102-005", "sensitive assumptions", "key assumptions", "critical assumptions", "what changes conclusion", "前提洗い出し", "重要前提", "結論を左右する前提", "じゅうようぜんてい", "けつろんをさゆうするぜんてい"],
        requiresCommitId: false,
        buildBody: () => `与えられた結論や提案について、それを左右する重要な前提を洗い出してください。どの前提が変わると結論が変わるのか、どこが感度の高い条件なのかが分かるように整理してください。`
    },
    {
        id: "popular-parameter-sensitivity-request",
        label: "P1102-006: 重要パラメータの感度を整理する",
        keywords: ["P1102-006", "parameter sensitivity", "sensitivity analysis", "key parameters", "sensitive factors", "感度分析", "重要パラメータ", "条件感度", "かんどぶんせき", "じゅうようぱらめーた"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容について、重要なパラメータや条件の感度を整理してください。どの値や条件が少し変わるだけで結果に大きく影響するのかが分かるように、影響の大きい順に整理してください。`
    },
    {
        id: "popular-version-diff-request",
        label: "P1306-003: 旧版 / 新版の差分を整理する",
        keywords: ["P1306-003", "version diff", "old vs new", "compare versions", "change summary", "旧版新版差分", "差分整理", "バージョン差分", "きゅうはんしんぱんさぶん", "ばーじょんさぶん"],
        requiresCommitId: false,
        buildBody: () => `与えられた旧版と新版について、何が変わったのかを整理してください。追加、削除、変更の観点で、読み手が差分をすぐ把握できるようにまとめてください。必要であれば、重要度の高い差分から並べてください。`
    },
    {
        id: "popular-compatibility-impact-request",
        label: "P1306-004: 変更点の互換性影響を整理する",
        keywords: ["P1306-004", "compatibility impact", "backward compatibility", "breaking changes", "compatibility analysis", "互換性影響", "破壊的変更", "互換性分析", "ごかんせいえいきょう", "はかいてきへんこう"],
        requiresCommitId: false,
        buildBody: () => `与えられた変更点について、互換性への影響を整理してください。後方互換性が保たれるか、破壊的変更があるか、どの利用者や呼び出し側に影響しそうかが分かるように整理してください。`
    },
    {
        id: "popular-stakeholder-notification-request",
        label: "P1405-007: ステークホルダー別の通知方針を整理する",
        keywords: ["P1405-007", "stakeholder notification", "audience notification", "notification plan", "who to notify", "ステークホルダー通知", "通知方針", "通知先整理", "すてーくほるだーつうち", "つうちほうしん"],
        requiresCommitId: false,
        buildBody: () => `与えられた変更や事象について、どのステークホルダーに何を通知するべきかを整理してください。利用者、運用担当、開発者、管理者などの相手ごとに、通知の必要性、伝えるべき内容、通知タイミングが分かるように整理してください。`
    },
    {
        id: "popular-stakeholder-notification-message-request",
        label: "P1405-008: ステークホルダー別の通知文面を作る",
        keywords: ["P1405-008", "stakeholder message", "notification message", "audience-specific notice", "notification wording", "通知文面", "相手別通知", "関係者向け連絡", "つうちぶんめん", "あいてべつつうち"],
        requiresCommitId: false,
        buildBody: () => `与えられた変更や事象について、相手ごとに伝え方を変えた通知文面を作ってください。ステークホルダーごとに関心や必要情報が異なることを前提に、共通情報と相手別補足が分かるように整理してください。`
    },
    {
        id: "popular-kpi-definition-request",
        label: "P1305-003: KPI 候補を定義する",
        keywords: ["P1305-003", "kpi definition", "success metrics", "kpi candidates", "evaluation metrics", "KPI", "評価指標", "成功指標", "けーぴーあい", "ひょうかしひょう"],
        requiresCommitId: false,
        buildBody: () => `与えられた目標や施策について、KPI 候補を定義してください。何を測れば成功や改善が判断できるのかが分かるように、指標名、意味、見方を整理してください。必要であれば、先行指標と結果指標も区別してください。`
    },
    {
        id: "popular-kpi-measurement-request",
        label: "P1305-004: 評価指標の測り方を整理する",
        keywords: ["P1305-004", "measure metrics", "metric measurement", "how to measure", "metric formula", "測り方整理", "指標測定", "評価方法", "はかりかたせいり", "しひょうそくてい"],
        requiresCommitId: false,
        buildBody: () => `与えられた評価指標について、どう測るのかを整理してください。必要なデータ、算出方法、集計単位、更新頻度、解釈上の注意点が分かるようにまとめてください。`
    },
    {
        id: "popular-claim-evidence-request",
        label: "P1103-003: 主張と根拠を切り分ける",
        keywords: ["P1103-003", "claim and evidence", "separate claims", "rationale mapping", "evidence structure", "主張と根拠", "根拠整理", "論拠整理", "しゅちょうとこんきょ", "ろんきょせいり"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容について、主張と根拠を切り分けて整理してください。何を言っているのか、その裏付けは何か、推測に留まる部分はどこかが分かるように整理してください。`
    },
    {
        id: "popular-evidence-gap-request",
        label: "P1103-004: 根拠不足の箇所を補強観点つきで整理する",
        keywords: ["P1103-004", "evidence gaps", "missing evidence", "support gaps", "how to strengthen evidence", "根拠不足", "裏付け不足", "補強観点", "こんきょぶそく", "うらづけぶそく"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容について、根拠不足の箇所を整理してください。どの主張にどの種類の裏付けが不足しているのか、補強するとしたら何が必要かが分かるように整理してください。`
    },
    {
        id: "popular-evidence-request-request",
        label: "P1103-005: 主張ごとに必要な根拠を列挙する",
        keywords: ["P1103-005", "required evidence", "evidence needed", "support required", "what evidence is needed", "必要な根拠", "根拠要求", "主張別根拠", "ひつようなこんきょ", "こんきょようきゅう"],
        requiresCommitId: false,
        buildBody: () => `与えられた主張や提案について、各主張ごとに必要な根拠を列挙してください。事実、数値、実例、出典、利用者影響など、どの種類の裏付けが必要かが分かるように整理してください。`
    },
    {
        id: "popular-source-needed-request",
        label: "P1103-006: 出典や裏付けが必要な箇所を示す",
        keywords: ["P1103-006", "needs citation", "source needed", "citation required", "backing required", "出典が必要", "裏付け必要", "引用必要", "しゅってんがひつよう", "うらづけひつよう"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容について、出典や裏付けが必要な箇所を示してください。どの記述が断定的すぎるか、どの箇所に引用やデータが必要かが分かるように整理してください。`
    },
    {
        id: "popular-error-message-improvement-request",
        label: "P1203-005: エラーメッセージを改善する",
        keywords: ["P1203-005", "improve error message", "better errors", "error wording", "user-friendly error", "エラーメッセージ改善", "エラー文面", "分かりやすいエラー", "えらーめっせーじかいぜん", "えらーぶんめん"],
        requiresCommitId: false,
        buildBody: () => `与えられたエラーメッセージを改善してください。何が起きたのか、利用者が次に何をすればよいのかが分かるように、責めすぎず、曖昧すぎず、行動につながる表現へ整えてください。`
    },
    {
        id: "popular-error-message-split-request",
        label: "P1203-006: 利用者向けと開発者向けでエラー情報を分ける",
        keywords: ["P1203-006", "user vs developer error", "split error info", "developer message", "error detail separation", "利用者向けエラー", "開発者向けエラー", "エラー情報分離", "りようしゃむけえらー", "かいはつしゃむけえらー"],
        requiresCommitId: false,
        buildBody: () => `与えられたエラー情報について、利用者向けに伝える内容と、開発者や運用者向けに残す詳細情報を分けて整理してください。利用者には必要十分な説明と次の行動が伝わり、内部向けには調査に必要な詳細が残るように整理してください。`
    },
    {
        id: "popular-observability-design-request",
        label: "P1005-008: 観測設計を整理する",
        keywords: ["P1005-008", "observability design", "monitoring design", "what to observe", "instrumentation design", "観測設計", "監視設計", "観測方針", "かんそくせっけい", "かんしせっけい"],
        requiresCommitId: false,
        buildBody: () => `与えられた機能や運用対象について、観測設計を整理してください。何をログに残すか、何をメトリクスとして持つか、どこでアラートを上げるか、どの異常を早く検知したいかが分かるように整理してください。`
    },
    {
        id: "popular-observability-gap-request",
        label: "P1005-009: 観測不足の箇所を洗い出す",
        keywords: ["P1005-009", "observability gaps", "monitoring gaps", "missing instrumentation", "blind spots", "観測不足", "監視不足", "盲点洗い出し", "かんそくぶそく", "もうてんあらいだし"],
        requiresCommitId: false,
        buildBody: () => `与えられた機能や運用内容について、観測不足の箇所を洗い出してください。障害や劣化が起きても気づきにくい箇所、原因追跡が難しい箇所、ログや指標が足りない箇所を優先して整理してください。`
    },
    {
        id: "popular-restart-summary-request",
        label: "P1406-003: 次回再開用の要点を整理する",
        keywords: ["P1406-003", "restart summary", "resume summary", "next session summary", "continue later", "再開支援", "再開用要点", "次回再開", "さいかいしえん", "じかいさいかい"],
        requiresCommitId: false,
        buildBody: () => `与えられた会話や作業状況について、次回再開用の要点を整理してください。何が決まっていて、何が未決で、次に何から始めるべきかが短く分かるように整理してください。`
    },
    {
        id: "popular-restart-checklist-request",
        label: "P1406-004: 再開時に最初に確認すべき事項を列挙する",
        keywords: ["P1406-004", "resume checklist", "restart checklist", "what to check first", "session restart", "再開チェック", "再開時確認", "再開手順", "さいかいちぇっく", "さいかいじかくにん"],
        requiresCommitId: false,
        buildBody: () => `与えられた作業内容について、再開時に最初に確認すべき事項を列挙してください。前提条件、未決事項、最新状態の確認ポイント、着手前に見直すべき点が分かるように整理してください。`
    },
    {
        id: "popular-infographic-text-request",
        label: "P1601-001: 図解化テキスト化",
        keywords: ["P1601-001", "infographic text", "infographic copy", "visual summary text", "sketchnote text", "graphic recording text", "infographic", "インフォグラフィック", "グラレコ", "グラフィックレコーディング", "graphic recording", "visual summary", "sketchnote", "図解", "図解化", "可視化", "1枚図", "ホワイトボード風"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容を、infographic の元になるテキストへ再構成してください。文章をそのまま残すのではなく、見出し、サブ見出し、要点、短い説明、強調したい数値やキーワード、矢印や囲みで表現しやすい関係性が分かるように整理してください。最終的に、描画AIや人間がそのまま infographic / 図解 / グラレコに起こしやすい粒度で出力してください。必要であれば、中央メッセージ、補助メッセージ、周辺要素に分けてください。`
    },
    {
        id: "popular-infographic-drawing-request",
        label: "P1601-002: 図解化描画指示",
        keywords: ["P1601-002", "infographic drawing prompt", "visual prompt", "image prompt", "sketchnote prompt", "graphic recording prompt", "描画指示", "描画プロンプト", "画像生成プロンプト", "インフォグラフィック", "グラレコ", "グラフィックレコーディング", "graphic recording", "visual summary", "sketchnote", "図解", "図解化", "可視化", "1枚図", "ホワイトボード風"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容をもとに、infographic を描画させるための指示文を作成してください。レイアウト、主要見出し、視線誘導、強調語、アイコンやピクトグラムの候補、色数、図のトーン、文字量、避けるべき表現が分かるように整理してください。画像生成AIに渡しやすいよう、完成イメージが具体的に想像できる描画指示へまとめてください。必要であれば、英語ベースの image prompt と日本語の補足指示を分けて示してください。`
    },
    {
        id: "popular-infographic-visual-elements-request",
        label: "P1601-003: 図解化用の視覚要素を抽出",
        keywords: ["P1601-003", "visual elements", "icon extraction", "visual motifs", "diagram elements", "視覚要素", "視覚要素抽出", "アイコン候補", "モチーフ抽出", "インフォグラフィック", "グラレコ", "graphic recording", "visual summary", "sketchnote", "図解", "図解化"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容を infographic / 図解 / グラレコにする前提で、使えそうな視覚要素を抽出してください。たとえばアイコン、記号、囲み、関係線、対比構造、時系列、流れ、階層、強調に向く語句や数値などを整理し、何をどのように視覚化すると伝わりやすいかが分かるように示してください。必要であれば、各要素がどの情報に対応するかも併記してください。`
    },
    {
        id: "popular-infographic-layout-request",
        label: "P1601-004: 図解化のレイアウト案を作る",
        keywords: ["P1601-004", "infographic layout", "layout plan", "visual layout", "diagram composition", "レイアウト案", "構図案", "配置案", "インフォグラフィック", "グラレコ", "graphic recording", "visual summary", "sketchnote", "図解", "図解化", "1枚図"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容について、infographic / 図解 / グラレコ向けのレイアウト案を作成してください。どこにタイトルを置き、主要ブロックをどう配置し、どの順に視線が流れると理解しやすいかが分かるように整理してください。必要であれば、中央配置、左から右、上から下、タイムライン型、比較表型など複数の構図案を示し、それぞれの向き不向きも簡潔に添えてください。`
    },
    {
        id: "popular-concept-map-request",
        label: "P1602-001: 概念マップ化",
        keywords: ["P1602-001", "concept map", "concept mapping", "knowledge map", "relationship map", "concept diagram", "概念マップ", "概念マップ化", "概念図", "概念関係図", "知識マップ", "関係図", "構造整理"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容を、概念マップとして整理してください。主要な概念を抽出し、それぞれの関係を「原因と結果」「包含関係」「対立関係」「依存関係」「手段と目的」などの関係ラベルつきで表現できるようにまとめてください。単なる箇条書きではなく、どの概念が中心で、どの概念が周辺にあり、どうつながると理解しやすいかが分かるように整理してください。必要であれば、中心概念、主要ノード、補助ノード、接続ラベルに分けて出力してください。`
    },
    {
        id: "popular-timeline-request-structured",
        label: "P1603-001: タイムライン化",
        keywords: ["P1603-001", "timeline", "timeline format", "chronological order", "event timeline", "mermaid timeline", "タイムライン化", "時系列化", "時系列整理", "じけいれつか", "たいむらいんか"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容をタイムライン化してください。まず通常の Markdown テキストで、日付または順序が分かる時系列一覧を整理してください。そのうえで、可能であれば Mermaid timeline も併記してください。出来事、判断、変更点、節目が追えるようにし、順序が不明確なものは推定せずに不明と明示してください。`
    },
    {
        id: "popular-flowchart-request-structured",
        label: "P1604-001: フローチャート化",
        keywords: ["P1604-001", "flowchart", "flow chart", "mermaid flowchart", "process flow", "decision flow", "フローチャート化", "手順図化", "分岐図", "ふろーちゃーとか", "てじゅんずか"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容をフローチャート化してください。まず通常の Markdown テキストで、主要な手順、分岐条件、例外分岐、終了条件が分かるように整理してください。そのうえで、可能であれば Mermaid flowchart も併記してください。処理順と分岐条件を混同せず、読み手が流れを追いやすい構成にしてください。`
    },
    {
        id: "popular-mindmap-request-structured",
        label: "P1605-001: マインドマップ化",
        keywords: ["P1605-001", "mindmap", "mind map", "mermaid mindmap", "topic expansion", "brainstorm map", "マインドマップ化", "論点展開", "放射状整理", "まいんどまっぷか", "ろんてんてんかい"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容をマインドマップ化してください。まず通常の Markdown テキストで、中心テーマ、第1階層の論点、第2階層以下の補足が分かるように入れ子構造で整理してください。そのうえで、可能であれば Mermaid mindmap も併記してください。広げすぎて散漫にならないよう、中心テーマから主要論点が自然に追える構成を優先してください。`
    },
    {
        id: "popular-reading-support-summary",
        label: "P1701-001: あらすじ整理",
        keywords: ["P1701-001", "story summary", "plot summary", "synopsis", "reading summary", "あらすじ", "あらすじ整理", "概要整理", "読みもの", "よみもの", "すじたて"],
        requiresCommitId: false,
        buildBody: () => `与えられた読みものについて、あらすじを整理してください。大筋が追えるように、主要な出来事、話題の流れ、転換点、結末または現在地が分かるようにまとめてください。細部を羅列するのではなく、初めて読む人でも全体像をつかみやすい構成を優先してください。必要に応じて、短い段落または箇条書きで整理してください。`
    },
    {
        id: "popular-reading-support-highlights",
        label: "P1702-001: 読みどころ整理",
        keywords: ["P1702-001", "reading highlights", "what to notice", "key points for reading", "highlights", "読みどころ", "読みどころ整理", "注目点", "鑑賞ポイント", "よみどころ", "ちゅうもくてん"],
        requiresCommitId: false,
        buildBody: () => `与えられた読みものについて、読みどころを整理してください。何に注目すると面白いか、どの表現、展開、構成、モチーフ、対比、語り口が印象的かが分かるようにまとめてください。単なる要約ではなく、読む楽しさや注目点が伝わる整理を優先してください。`
    },
    {
        id: "popular-reading-support-easier-following",
        label: "P1703-001: 長文を追いやすくする",
        keywords: ["P1703-001", "make long text easier to follow", "reading aid", "follow long text", "reading guide", "長文", "長文を追いやすく", "読解補助", "追いやすくする", "ちょうぶん", "どっかいほじょ"],
        requiresCommitId: false,
        buildBody: () => `与えられた長文について、読み手が追いやすくなるように整理してください。話題の切り替わり、段落ごとの役割、重要な論点、読み飛ばすと分かりにくくなる箇所が見えるようにまとめてください。必要に応じて、見出し、箇条書き、短い導線メモを使ってください。`
    },
    {
        id: "popular-reading-support-entities",
        label: "P1704-001: 登場人物や対象を整理する",
        keywords: ["P1704-001", "characters list", "entities summary", "who is who", "subjects summary", "登場人物", "対象整理", "人物整理", "関係者整理", "とうじょうじんぶつ", "たいしょうせいり"],
        requiresCommitId: false,
        buildBody: () => `与えられた読みものについて、登場人物、話題の対象、主要な主体を整理してください。それぞれが誰または何で、どのような役割や立場にあるのか、必要であれば関係性も分かるようにまとめてください。人物が多い場合や対象が複雑な場合でも、読み手が混乱しにくい一覧性を優先してください。`
    },
    {
        id: "popular-reading-support-hard-parts",
        label: "P1705-001: わかりにくい箇所を整理する",
        keywords: ["P1705-001", "unclear parts", "hard to understand", "difficult passages", "confusing sections", "わかりにくい", "わかりにくい箇所", "難所整理", "読みにくい", "わかりにくいかしょ", "なんしょせいり"],
        requiresCommitId: false,
        buildBody: () => `与えられた読みものについて、わかりにくい箇所を整理してください。読み手が引っかかりやすい表現、前提が不足している箇所、主語や対象が追いにくい箇所、論理や展開の飛躍がある箇所を見つけて、何が分かりにくさの原因かが伝わるようにまとめてください。必要に応じて、読み解く観点や確認ポイントも添えてください。`
    },
    {
        id: "popular-legal-risk-check",
        label: "P1002-001: 法令違反リスクを確認する",
        keywords: ["P1002-001", "legal risk", "law violation risk", "compliance risk", "regulatory risk", "法令違反", "法令リスク", "法的リスク", "ほうれいいはん", "ほうてきりすく"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容について、法令違反のリスクがないか確認してください。何がどの法律に違反するかを断定するのではなく、違法性が問題になりそうな箇所、法令上の確認が必要そうな箇所、解釈を誤ると危険そうな箇所を整理してください。必要に応じて、どの観点で専門確認が必要かも示してください。`
    },
    {
        id: "popular-terms-risk-check",
        label: "P1002-002: 規約違反リスクを確認する",
        keywords: ["P1002-002", "terms risk", "policy violation risk", "terms of service", "rule violation", "規約違反", "利用規約", "ルール違反", "きやくいはん", "りようきやく"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容について、規約違反やルール違反のリスクがないか確認してください。法令違反とまでは言えなくても、利用規約、運用ルール、投稿ガイドライン、社内ルールなどに照らして問題になりそうな箇所を整理してください。どの種別のルールに抵触しそうかが分かるように示してください。`
    },
    {
        id: "popular-rights-risk-check",
        label: "P1002-003: 権利侵害リスクを確認する",
        keywords: ["P1002-003", "rights infringement", "copyright risk", "rights risk", "intellectual property risk", "権利侵害", "著作権リスク", "権利リスク", "けんりしんがい", "ちょさくけんりすく"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容について、権利侵害のリスクがないか確認してください。著作権、商標、肖像、プライバシー、利用許諾の観点から、問題になりそうな箇所を整理してください。何がどの権利に関係しそうか、追加確認が必要そうな点はどこかが分かるように示してください。`
    },
    {
        id: "popular-sensitive-info-risk-check",
        label: "P1002-004: 個人情報・機密リスクを確認する",
        keywords: ["P1002-004", "personal data risk", "confidential info risk", "privacy risk", "sensitive information", "個人情報", "機密", "機密情報", "プライバシー", "こじんじょうほう", "きみつじょうほう"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容について、個人情報や機密情報のリスクがないか確認してください。本人特定につながる情報、公開範囲に注意が必要な情報、内部情報として扱うべき内容、伏せるべき情報が含まれていないかを整理してください。必要に応じて、どの情報を伏せる、ぼかす、削るべきかの観点も示してください。`
    }
];
