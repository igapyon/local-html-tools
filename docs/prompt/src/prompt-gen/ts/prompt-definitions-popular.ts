const popularPromptDefinitions = [
  {
    id: "popular-prerequisites-request",
    label: "P901-001: 前提条件を抽出",
    keywords: ["P901-001", "prerequisites", "assumptions", "preconditions", "premises", "前提条件", "前提", "前提抽出", "仮定", "ぜんていじょうけん", "かてい"],
    requiresCommitId: false,
    buildBody: () => `与えられた内容から、暗黙の前提も含めて前提条件を抽出してください。何が成立している前提で話が進んでいるのか、どの前提が崩れると結論や作業方針に影響するのかが分かるように整理してください。必要に応じて、明示されている前提と暗黙の前提を分けて示してください。`
  },
  {
    id: "popular-constraints-request",
    label: "P901-002: 制約条件を抽出",
    keywords: ["P901-002", "constraints", "limitations", "restrictions", "boundary conditions", "制約", "制約条件", "制限", "境界条件", "せいやくじょうけん", "せいげん"],
    requiresCommitId: false,
    buildBody: () => `与えられた内容から、制約条件や守るべき境界を抽出してください。時間、コスト、依存関係、互換性、禁止事項、作業範囲など、結論や実装方針を縛る条件を整理し、重要度が高いものから分かるように示してください。前提条件と混ざりやすい場合は、その違いも区別して説明してください。`
  },
  {
    id: "popular-risk-list-request",
    label: "P902-001: 見落としリスクを列挙",
    keywords: ["P902-001", "risk list", "oversight risk", "missed risk", "risk enumeration", "見落としリスク", "リスク列挙", "見落とし", "懸念点", "みおとしりすく", "けねんてん"],
    requiresCommitId: false,
    buildBody: () => `与えられた内容について、見落としやすいリスクを列挙してください。仕様、運用、保守、依存関係、テスト、認識齟齬などの観点から、問題になりそうな点を幅広く洗い出してください。まだ重大度評価までは厳密にしなくてよいので、抜け漏れを減らすことを優先してください。`
  },
  {
    id: "popular-risk-priority-request",
    label: "P902-002: 見落としリスクを重大度順に整理",
    keywords: ["P902-002", "risk priority", "severity order", "risk ranking", "prioritized risk", "重大度順", "優先リスク", "リスク順位", "危険度", "じゅうだいどじゅん", "ゆうせんりすく"],
    requiresCommitId: false,
    buildBody: () => `与えられた内容について、見落としリスクを重大度順に整理してください。発生時の影響の大きさ、起こりやすさ、発見のしにくさを考慮し、どのリスクを先に潰すべきかが分かるように並べてください。可能であれば、各リスクの理由や対策候補も簡潔に添えてください。`
  },
  {
    id: "popular-nontechnical-summary-request",
    label: "P903-001: 非技術者向けに要約",
    keywords: ["P903-001", "non-technical summary", "executive summary", "plain language", "for non engineers", "非技術者向け", "平易化", "やさしく要約", "一般向け", "ひぎじゅつしゃむけ", "へいいか"],
    requiresCommitId: false,
    buildBody: () => `与えられた内容を、非技術者にも分かるように要約してください。専門用語や内部事情は必要最小限に抑え、何が起きているのか、なぜ重要なのか、どんな影響があるのかが伝わるように説明してください。技術的な正確さは保ちつつ、分かりやすさを優先してください。`
  },
  {
    id: "popular-brief-nontechnical-summary-request",
    label: "P903-002: 非技術者向けに短く要約",
    keywords: ["P903-002", "short non-technical summary", "brief summary", "3 line summary", "plain brief", "短く要約", "短い要約", "三行要約", "非技術者向け要約", "みじかくようやく", "さんぎょうようやく"],
    requiresCommitId: false,
    buildBody: () => `与えられた内容を、非技術者向けに短く要約してください。長い説明ではなく、重要なポイントがすぐ伝わるように、短い文章または短い箇条書きでまとめてください。専門用語はできるだけ避け、必要な場合は簡単に言い換えてください。`
  },
  {
    id: "popular-comparison-table-request",
    label: "P904-001: 選択肢比較表を作成",
    keywords: ["P904-001", "comparison table", "option comparison", "tradeoff table", "decision table", "比較表", "選択肢比較", "比較一覧", "トレードオフ表", "ひかくひょう", "せんたくしひかく"],
    requiresCommitId: false,
    buildBody: () => `与えられた選択肢について、比較表を作成してください。少なくとも各選択肢の特徴、メリット、デメリット、向いている場面が比較できるように整理してください。表形式または Markdown テーブルで、判断材料として使いやすい形にまとめてください。`
  },
  {
    id: "popular-merit-demerit-table-request",
    label: "P904-002: 選択肢のメリット・デメリット比較表を作成",
    keywords: ["P904-002", "pros cons table", "merit demerit", "pros and cons", "tradeoff comparison", "メリット", "デメリット", "比較表", "賛否", "めりっと", "でめりっと"],
    requiresCommitId: false,
    buildBody: () => `与えられた選択肢について、メリットとデメリットが見比べやすい比較表を作成してください。結論を急がず、各案の良い点と弱い点が対称に読める形で整理してください。必要に応じて、判断時に重視すべき観点も列として加えてください。`
  },
  {
    id: "popular-audience-shift-request",
    label: "P905-001: 対象読者を変えて説明",
    keywords: ["P905-001", "change audience", "audience shift", "rewrite for audience", "different audience", "対象読者", "読者変更", "対象別説明", "読み手を変える", "たいしょうどくしゃ", "よみてをかえる"],
    requiresCommitId: false,
    buildBody: () => `与えられた内容について、対象読者を変えて説明してください。元の内容の意味はできるだけ保ちつつ、読み手に合わせて前提知識、用語、説明の深さ、強調点を調整してください。必要であれば、元の対象読者と新しい対象読者の違いも簡潔に意識して書き分けてください。`
  },
  {
    id: "popular-multi-audience-request",
    label: "P905-002: 複数の対象読者向けに書き分ける",
    keywords: ["P905-002", "multiple audiences", "rewrite for beginner and expert", "audience variants", "reader variants", "複数読者", "書き分け", "初学者向け", "管理者向け", "ふくすうどくしゃ", "かきわけ"],
    requiresCommitId: false,
    buildBody: () => `与えられた内容について、複数の対象読者向けに書き分けてください。たとえば非技術者向け、初学者向け、実務担当者向けなど、対象ごとにどの情報を残し、どの用語を言い換え、どこを省略するかが分かるように整理してください。読み手ごとの差が伝わるように、見出しを分けて出力してください。`
  }
];
