/*
 * Copyright 2026 Toshiki Iga
 * SPDX-License-Identifier: Apache-2.0
 */
const aiSuggestPromptDefinitions = [
    {
        id: "ai-suggest-canonical-markdown-request",
        label: "S101-001: このディレクトリの正本 markdown を特定(AI提案)",
        keywords: ["S101-001", "source of truth", "canonical markdown", "canonical doc", "primary doc", "markdown", "正本", "正式", "一次情報", "主要文書", "基準文書", "canonical", "せいほん", "いちじじょうほう", "きじゅんぶんしょ"],
        requiresCommitId: false,
        buildBody: () => `いま作業しているディレクトリに含まれる markdown (.md) について、どれが正本として扱われるべきかを整理してください。README、仕様書、補助メモ、TODO などを同列に扱うのではなく、それぞれの役割を見極めたうえで、正本、補助資料、作業メモ、参考情報を区別して説明してください。正本と判断した理由、補助資料に留まる理由、競合や重複がある場合の扱いも示してください。必要であれば、対応するソースコードや機能との関係も簡潔に説明してください。

${getStrictHallucinationPreventionInstruction()}`
    },
    {
        id: "ai-suggest-reading-priority-request",
        label: "S101-002: このディレクトリで先に読むべき markdown を絞り込む(AI提案)",
        keywords: ["S101-002", "reading priority", "read first", "markdown shortlist", "priority docs", "先に読む", "優先順位", "読む順番", "絞り込み", "重要文書", "さきによむ", "ゆうせんじゅんい", "じゅうようぶんしょ"],
        requiresCommitId: false,
        buildBody: () => `いま作業しているディレクトリに含まれる markdown (.md) について、今回の作業判断に直接効きそうなものを優先順位つきで絞り込んでください。単なる一覧ではなく、まず読むべきもの、次に読むべきもの、余裕があれば読むものを区別し、それぞれの理由も簡潔に説明してください。必要であれば、どのソースコードや機能判断に効く文書なのかも添えてください。

${getSoftHallucinationPreventionInstruction()}`
    },
    {
        id: "ai-suggest-markdown-source-map-request",
        label: "S101-003: markdown とソースコードの対応関係を整理(AI提案)",
        keywords: ["S101-003", "source mapping", "doc to source", "markdown map", "code relation", "対応関係", "ソース対応", "文書対応", "関連ファイル", "たいおうかんけい", "そーすたいおう", "かんれんふぁいる"],
        requiresCommitId: false,
        buildBody: () => `いま作業しているディレクトリの markdown (.md) とソースコードについて、どの文書がどのファイルや機能に対応しているのかを整理してください。正本に近い文書、補助的な文書、実装と乖離していそうな文書があれば区別して示してください。必要であれば、作業開始時に先に参照すべき対応関係も提案してください。

${getStrictHallucinationPreventionInstruction()}`
    },
    {
        id: "ai-suggest-work-start-guide-request",
        label: "S101-004: このディレクトリの作業開始ガイドを作る(AI提案)",
        keywords: ["S101-004", "work start guide", "getting started", "onboarding", "directory guide", "作業開始", "開始ガイド", "最初に読む", "導入", "さぎょうかいし", "かいしがいど", "さいしょによむ"],
        requiresCommitId: false,
        buildBody: () => `いま作業しているディレクトリについて、次回の作業者や生成AIが迷わず入りやすいように、簡潔な作業開始ガイドを考えてください。最初に見るべき markdown、対応する主要ソース、注意すべき前提、今回の作業判断で外せない観点を整理してください。必要であれば、このガイドをどの markdown に置くのが自然かも提案してください。

${getSoftHallucinationPreventionInstruction()}`
    },
    {
        id: "ai-suggest-markdown-priority-update-request",
        label: "S102-001: 実装変更に対して優先更新すべき markdown を洗い出す(AI提案)",
        keywords: ["S102-001", "doc update priority", "markdown update", "priority update", "documentation sync", "優先更新", "更新優先", "未更新候補", "正本更新", "ゆうせんこうしん", "みこうしんこうほ"],
        requiresCommitId: false,
        buildBody: () => `実装変更がおこなわれたことを前提に、対応する markdown (.md) のうち、どれを優先して更新すべきかを整理してください。正本として扱うべき文書、利用者が最初に参照しそうな文書、将来の生成AIや作業者の判断に強く影響する文書を優先して示してください。必要であれば、既存文書の更新で足りるか、新規文書が必要かも区別してください。

${getSoftHallucinationPreventionInstruction()}`
    },
    {
        id: "ai-suggest-restart-first-check-request",
        label: "S301-001: 次回再開時に最初に確認すべき事項を整理(AI提案)",
        keywords: ["S301-001", "restart checklist", "resume work", "first checks", "handover start", "再開", "再開時", "最初に確認", "再開チェック", "さいかい", "さいしょにかくにん", "ちぇっくりすと"],
        requiresCommitId: false,
        buildBody: () => `次回この作業を再開するときに、最初に確認すべき事項を整理してください。未完了事項、前提条件、読み直すべき markdown、確認すべきソース、判断が揺れやすい論点を優先度つきで並べてください。引き継ぎ本文そのものではなく、再開直後の確認観点を短く強く整理することを重視してください。

${getStrictHallucinationPreventionInstruction()}`
    },
    {
        id: "ai-suggest-review-focus-request",
        label: "S304-001: レビューで優先的に疑うべき観点を先に宣言(AI提案)",
        keywords: ["S304-001", "review focus", "review checklist", "risk first", "critical review focus", "レビュー観点", "優先観点", "疑うべき点", "回帰リスク", "れびゅーかんてん", "かいきりすく"],
        requiresCommitId: false,
        buildBody: () => `これからレビューを行うにあたって、優先的に疑うべき観点を先に宣言してください。たとえば、仕様逸脱、回帰リスク、責務混在、依存関係の悪化、未テストなどのうち、今回特に重点的に見るべきものを整理してください。単なる一般論ではなく、今回の作業内容に照らしてどこを疑うのが効率的かを示してください。

${getSoftHallucinationPreventionInstruction()}`
    },
    {
        id: "ai-suggest-structuralization-target-request",
        label: "S321-001: 構造化・共通化の対象候補を先に列挙(AI提案)",
        keywords: ["S321-001", "structuralization target", "commonization target", "duplication scan", "refactor candidate", "構造化候補", "共通化候補", "重複候補", "対象列挙", "こうぞうかこうほ", "きょうつうかこうほ"],
        requiresCommitId: false,
        buildBody: () => `構造化・共通化を進める前に、対象候補を先に列挙してください。どこに知識やルールの重複がありそうか、どこが責務過大か、どこが依存関係の整理候補かを分けて示してください。まだ共通化するとは決めず、まず候補の洗い出しと優先順位づけに集中してください。

${getSoftHallucinationPreventionInstruction()}`
    },
    {
        id: "ai-suggest-structural-refactor-scope-request",
        label: "S322-001: 構造改善リファクタリングの対象範囲を先に区切る(AI提案)",
        keywords: ["S322-001", "refactor scope", "structural refactor scope", "scope cut", "planned refactor", "対象範囲", "範囲切り", "構造改善範囲", "今回だけ", "たいしょうはんい", "はんいぎり"],
        requiresCommitId: false,
        buildBody: () => `計画的な構造改善リファクタリングを行う前に、今回の対象範囲を先に区切ってください。何を今回の整理対象にするのか、何を今回は見送るのか、どこから先は機能変更や別タスクとして切り分けるべきかを明確にしてください。変更量を増やすこと自体が目的ではなく、範囲を意図的に制御することを重視してください。

${getSoftHallucinationPreventionInstruction()}`
    },
    {
        id: "ai-suggest-reuse-unit-request",
        label: "S323-001: 他プロジェクト資産の転用単位候補を先に整理(AI提案)",
        keywords: ["S323-001", "reuse unit", "import unit", "transfer unit", "reuse candidate", "転用単位", "取り込み単位", "流用候補", "再利用単位", "てんようたんい", "とりこみたんい"],
        requiresCommitId: false,
        buildBody: () => `他プロジェクト資産の転用可否を判断する前に、どの単位で取り込む候補があるかを先に整理してください。関数単位、モジュール単位、コンポーネント単位、画面単位、設計だけの採用などを区別し、それぞれが自立しているか、依存前提が強すぎないかを見てください。まだ採用可否の結論を急がず、まず転用単位の候補整理に集中してください。

${getSoftHallucinationPreventionInstruction()}`
    },
    {
        id: "ai-suggest-spec-issue-list-request",
        label: "S703-001: 仕様検討時の論点一覧を先に作る(AI提案)",
        keywords: ["S703-001", "spec issue list", "discussion points", "issue list", "spec checklist", "論点一覧", "仕様論点", "未確定事項", "判断材料", "ろんてんいちらん", "みかくていじこう"],
        requiresCommitId: false,
        buildBody: () => `仕様検討を始める前に、まず論点一覧を作ってください。決める必要があること、未確定事項、前提条件、判断材料、選択肢、後回しにしてよいことを分けて整理してください。結論を急ぐのではなく、何を議論すべきかが先に見える状態を作ることを目的にしてください。

${getSoftHallucinationPreventionInstruction()}`
    },
    {
        id: "ai-suggest-prompt-structure-dump-request",
        label: "S601-001: 現在のプロンプト構成を一覧としてダンプ(AI提案)",
        keywords: ["S601-001", "prompt structure", "prompt inventory", "dump prompt structure", "prompt map", "プロンプト構成", "一覧", "構成ダンプ", "候補一覧", "ぷろんぷとこうせい", "こうせいだんぷ"],
        requiresCommitId: false,
        buildBody: () => `現在の会話や作業で使われているプロンプト構成について、実行中の前提、作業モード、制約、補助的な観点を区別しながら一覧として整理してください。単なる全文ダンプではなく、どの種類の指示が現在効いているのかを把握しやすい形にまとめることを重視してください。

${getStrictHallucinationPreventionInstruction()}`
    },
    {
        id: "ai-suggest-full-restart-dump-request",
        label: "S602-001: 現在の会話から再開用サマリをフルダンプ(AI提案)",
        keywords: ["S602-001", "full dump", "restart summary", "resume dump", "full handover", "再開用サマリ", "フルダンプ", "完全引継", "会話要約", "さいかいようさまり", "ふるだんぷ"],
        requiresCommitId: false,
        buildBody: () => `現在の会話全体から、次回の再開に必要な情報を落とさないことを優先したフルダンプ形式のサマリを作成してください。決まったこと、未完了事項、保留事項、重要な理由づけ、次に見るべきファイルや論点を漏れなく整理してください。簡潔さよりも再開容易性と情報保持を重視してください。

${getStrictHallucinationPreventionInstruction()}`
    },
    {
        id: "ai-suggest-todo-decision-open-request",
        label: "S603-001: 現在の会話から TODO / 決定事項 / 未解決事項を抽出(AI提案)",
        keywords: ["S603-001", "todo decision open issues", "decision log", "open issues", "conversation extract", "TODO抽出", "決定事項", "未解決事項", "論点抽出", "けっていじこう", "みかいけつじこう"],
        requiresCommitId: false,
        buildBody: () => `現在の会話から、実作業に直結する情報として TODO、決定事項、未解決事項を抽出してください。雑多な要約ではなく、何が決まっていて、何がまだ決まっておらず、次に何をすべきかがすぐ分かる形で整理してください。必要であれば、項目ごとに簡潔な理由や背景も添えてください。

${getSoftHallucinationPreventionInstruction()}`
    },
    {
        id: "ai-suggest-mermaid-topic-flow-request",
        label: "S603-002: 現在の会話の論点遷移を Mermaid で記述(AI提案)",
        keywords: ["S603-002", "mermaid topic flow", "topic transition", "conversation flow", "mermaid flow", "論点遷移", "Mermaid", "会話フロー", "話題遷移", "ろんてんせんい", "かいわふろー"],
        requiresCommitId: false,
        buildBody: () => `現在の会話について、話題や論点がどの順に移り変わったかを Mermaid で記述してください。単なる発話順ではなく、どの論点からどの論点へ展開したのか、どこで重要な方針転換や新しい整理が入ったのかが分かるように表現してください。

${getSoftHallucinationPreventionInstruction()}

${getMarkdownFenceInstruction()}`
    },
    {
        id: "ai-suggest-mermaid-dependency-request",
        label: "S603-003: 現在の会話の依存関係を Mermaid で記述(AI提案)",
        keywords: ["S603-003", "mermaid dependency", "dependency graph", "conversation dependency", "mermaid graph", "依存関係", "Mermaid図", "関係図", "依存図", "いぞんかんけい", "かんけいず"],
        requiresCommitId: false,
        buildBody: () => `現在の会話や決定事項について、どの話題や判断がどの前提や別の決定に依存しているかを Mermaid で記述してください。時系列よりも依存関係を重視し、後続の判断が何を前提にしているかが分かるように整理してください。

${getSoftHallucinationPreventionInstruction()}

${getMarkdownFenceInstruction()}`
    },
    {
        id: "ai-suggest-mermaid-timeline-request",
        label: "S603-501: Mermaid timeline で図解化(AI提案)",
        keywords: ["S603-501", "mermaid timeline", "timeline diagram", "時系列図", "タイムライン化", "Mermaid timeline", "図解化", "じけいれつず", "たいむらいんか"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容を、まず時系列が読みやすい通常テキストとして整理し、そのあとに Mermaid timeline を出力してください。出来事、判断、変更点、節目が時系列で追えるようにし、日付や順序が不明確な箇所は推定せず不明と明示してください。

${getSoftHallucinationPreventionInstruction()}

${getMarkdownFenceInstruction()}`
    },
    {
        id: "ai-suggest-mermaid-flowchart-request",
        label: "S603-502: Mermaid flowchart で図解化(AI提案)",
        keywords: ["S603-502", "mermaid flowchart", "flowchart", "フローチャート化", "手順図", "分岐図", "Mermaid flowchart", "図解化", "ふろーちゃーとか", "てじゅんず"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容を、まず手順や分岐が分かる通常テキストとして整理し、そのあとに Mermaid flowchart を出力してください。開始点、主要ステップ、分岐条件、終了条件が追えるようにし、処理順と判断分岐を混同しないように整理してください。

${getSoftHallucinationPreventionInstruction()}

${getMarkdownFenceInstruction()}`
    },
    {
        id: "ai-suggest-mermaid-mindmap-request",
        label: "S603-503: Mermaid mindmap で図解化(AI提案)",
        keywords: ["S603-503", "mermaid mindmap", "mindmap", "マインドマップ化", "論点展開", "放射状整理", "Mermaid mindmap", "図解化", "まいんどまっぷか", "ろんてんてんかい"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容を、まず中心テーマと主要論点が分かる通常テキストとして整理し、そのあとに Mermaid mindmap を出力してください。中心テーマ、第1階層、第2階層の関係が自然に追えるようにし、細部を広げすぎずに主要な論点構造が見えるようにまとめてください。

${getSoftHallucinationPreventionInstruction()}

${getMarkdownFenceInstruction()}`
    },
    {
        id: "ai-suggest-mermaid-concept-map-request",
        label: "S603-504: Mermaid 風の概念マップとして図解化(AI提案)",
        keywords: ["S603-504", "concept map", "mermaid concept map", "概念マップ化", "概念関係図", "relationship map", "Mermaid graph", "図解化", "がいねんまっぷか", "がいねんかんけいず"],
        requiresCommitId: false,
        buildBody: () => `与えられた内容を、まず主要概念とその関係が分かる通常テキストとして整理し、そのあとに Mermaid flowchart または graph 記法で概念マップとして表現してください。中心概念、周辺概念、関係ラベルが分かるようにし、因果、依存、包含、対立などの関係を必要に応じて明示してください。

${getSoftHallucinationPreventionInstruction()}

${getMarkdownFenceInstruction()}`
    },
    {
        id: "ai-suggest-dot-causal-request",
        label: "S604-001: 現在の会話の因果関係を Graphviz DOT で記述(AI提案)",
        keywords: ["S604-001", "graphviz causal", "causal graph", "cause effect", "dot graph", "因果関係", "Graphviz", "DOT", "原因結果", "いんがかんけい", "げんいんけっか"],
        requiresCommitId: false,
        buildBody: () => `現在の会話について、どの問題意識や判断がどの結論や次のアクションにつながったかを Graphviz DOT で記述してください。時系列だけでなく、原因と結果のつながりが見えるように整理し、必要であれば主要な節点に短い説明を添えてください。

${getSoftHallucinationPreventionInstruction()}`
    },
    {
        id: "ai-suggest-dot-decision-flow-request",
        label: "S604-002: 現在の会話の意思決定フローを Graphviz DOT で記述(AI提案)",
        keywords: ["S604-002", "graphviz decision flow", "decision flow", "decision graph", "dot decision", "意思決定フロー", "判断フロー", "Graphviz DOT", "決定フロー", "いしけっていふろー", "はんだんふろー"],
        requiresCommitId: false,
        buildBody: () => `現在の会話について、検討、選択、採用、見送りの流れが分かるように、意思決定フローを Graphviz DOT で記述してください。どの候補が出て、何が採用され、何が見送られ、どこで方針が定まったのかが追えるように整理してください。

${getSoftHallucinationPreventionInstruction()}`
    }
];
