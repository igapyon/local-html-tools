# mikuproject

`mikuproject` は、MS Project XML 形式の入出力を扱うプロジェクト管理アプリとして設計する。

配置先:

- `docs/project/`

アプリ名:

- `mikuproject`

前提:

- このリポジトリ流儀の single-file web app とする
- ローカルで動作する HTML ツールとして構築する
- まずは UI よりも、MS Project XML の入出力と内部モデル化を優先する
- 仕様判断に迷った場合は、独自都合よりも `MS Project 仕様` に立ち返って判断する
- `MS Project` 実機は未保有である

## STEP 1 の目的

STEP 1 の目的は、`MS Project XML` を意味的に往復できる状態を作ること。

ここでいう「往復できる」とは、次を意味する。

- `MS Project XML` を読める
- 必要な情報を内部モデルへ落とせる
- 内部モデルから `MS Project XML` を再生成できる
- 再生成した XML を、少なくとも `mikuproject` 自身で再読込できる
- 主要フィールドが壊れず往復できる

注意:

- 目標は「元の XML と完全一致」ではない
- 目標は「意味的に往復できる」ことである

## STEP 1 の完了条件

STEP 1 の完了条件は次のとおり。

- `MS Project XML` を入力として読み込める
- XML から必要な情報を抽出し、内部モデルを生成できる
- 内部モデルから `MS Project XML` を出力できる
- 出力した XML を再読込しても例外にならない
- `xml -> model -> xml -> model` の往復後に、主要フィールドが保持されている

## STEP 1 の入力データ前提

`MS Project` 実機を保有していないため、STEP 1 の入力データ前提は次のとおりとする。

- Microsoft 公開の `MS Project XML schema` を基準にする
- 当面の基準スキーマは `Microsoft Office Project 2007 XML Data Interchange Schema` とする
- 具体的には `https://schemas.microsoft.com/project/2007/` および `mspdi_pj12.xsd` を基準とする
- STEP 1 で扱うファイル形式は、`.mpp` ではなく `.xml` の `MS Project XML 形式` とする
- `.mpp` は MS Project のネイティブ本体形式、`.xml` は外部連携や交換のための XML 表現と捉える
- STEP 1 の検証用 XML は、自作の最小サンプル XML を用いる
- まずは `mikuproject` 自身で意味的に往復できることを優先する
- 実際の `MS Project` 本体が出力した XML との互換確認は、将来課題として扱う

検証用データの参照元メモ:

- 一時的な検証用データの参照元として `https://github.com/rpbouman/open-msp-viewer/` を利用する
- ただし、Git 管理下へそのまま格納するかどうかは別途判断する
- `open-msp-viewer` プロジェクトのサンプルには大いに助けられた。感謝する
- 実例 XML から見えた保持項目ギャップは `docs/project/mikuproject-gap-notes.md` に整理する
- 仕様判断で迷った場合は、MicrosoftDocs の Project XML Data Interchange リファレンスも補助資料として参照する
  - `https://github.com/MicrosoftDocs/office-developer-msproject-xml-docs/tree/main/project-xml-data-interchange`

## STEP 1 で扱う対象

STEP 1 では、MS Project XML のうち、次の情報を優先して扱う。

- `Project` 基本情報
- `Tasks`
- `Resources`
- `Assignments`
- 必要最小限の `Calendars`
- `PredecessorLink` などの依存関係

## STEP 1 で優先する主要フィールド

### Project

- `Name`
- `Title`
- `Author`
- `Company`
- `CreationDate`
- `LastSaved`
- `SaveVersion`
- `CurrentDate`
- `StartDate`
- `FinishDate`
- `ScheduleFromStart`
- `DefaultStartTime`
- `DefaultFinishTime`
- `MinutesPerDay`
- `MinutesPerWeek`
- `DaysPerMonth`
- `StatusDate`
- `WeekStartDay`
- `WorkFormat`
- `DurationFormat`
- `CurrencyCode`
- `CurrencyDigits`
- `CurrencySymbol`
- `CurrencySymbolPosition`
- `FYStartDate`
- `FiscalYearStart`
- `CriticalSlackLimit`
- `DefaultTaskType`
- `DefaultFixedCostAccrual`
- `DefaultStandardRate`
- `DefaultOvertimeRate`
- `DefaultTaskEVMethod`
- `NewTaskStartDate`
- `NewTasksAreManual`
- `NewTasksEffortDriven`
- `NewTasksEstimated`
- `ActualsInSync`
- `EditableActualCosts`
- `HonorConstraints`
- `InsertedProjectsLikeSummary`
- `MultipleCriticalPaths`
- `TaskUpdatesResource`
- `UpdateManuallyScheduledTasksWhenEditingLinks`
- `CalendarUID`
- `OutlineCodes`
- `WBSMasks`
- `ExtendedAttributes`

### Tasks

- `UID`
- `ID`
- `Name`
- `OutlineLevel`
- `OutlineNumber`
- `WBS`
- `Type`
- `CalendarUID`
- `Priority`
- `Start`
- `Finish`
- `Duration`
- `ActualStart`
- `ActualFinish`
- `Deadline`
- `StartVariance`
- `FinishVariance`
- `Work`
- `WorkVariance`
- `TotalSlack`
- `FreeSlack`
- `Cost`
- `ActualCost`
- `RemainingCost`
- `RemainingWork`
- `ActualWork`
- `Milestone`
- `Summary`
- `Critical`
- `PercentComplete`
- `PercentWorkComplete`
- `Notes`
- `ConstraintType`
- `ConstraintDate`
- `ExtendedAttribute`
- `Baseline`
- `TimephasedData`
- `TimephasedData`
- `PredecessorLink`

### Resources

- `UID`
- `ID`
- `Name`
- `Type`
- `Initials`
- `Group`
- `WorkGroup`
- `MaxUnits`
- `CalendarUID`
- `StandardRate`
- `StandardRateFormat`
- `OvertimeRate`
- `OvertimeRateFormat`
- `CostPerUse`
- `Work`
- `ActualWork`
- `RemainingWork`
- `Cost`
- `ActualCost`
- `RemainingCost`
- `PercentWorkComplete`
- `ExtendedAttribute`
- `Baseline`
- `TimephasedData`

### Assignments

- `UID`
- `TaskUID`
- `ResourceUID`
- `Start`
- `Finish`
- `StartVariance`
- `FinishVariance`
- `Delay`
- `Milestone`
- `WorkContour`
- `Units`
- `Work`
- `Cost`
- `ActualCost`
- `RemainingCost`
- `PercentWorkComplete`
- `OvertimeWork`
- `ActualOvertimeWork`
- `ActualWork`
- `RemainingWork`
- `ExtendedAttribute`
- `Baseline`

### Calendars

- `UID`
- `Name`
- `IsBaseCalendar`
- `BaseCalendarUID`
- `WeekDays`
- `Exceptions`
- `WorkWeeks`

## STEP 1 で後回しにするもの

STEP 1 では、次のようなものは後回し候補とする。

- 表示設定
- UI レイアウト情報
- 独自拡張要素
- 完全互換のために必要だが、主要データの意味保持に直結しない補助ノード群

## 内部モデル方針

内部モデルは、MS Project XML をそのまま保持するのではなく、意味的に扱いやすい正規化済みのモデルとする。

最小モデル案:

```ts
type ProjectModel = {
  project: {
    name: string;
    currentDate?: string;
    startDate: string;
    finishDate: string;
    scheduleFromStart: boolean;
    defaultStartTime?: string;
    defaultFinishTime?: string;
    minutesPerDay?: number;
    minutesPerWeek?: number;
    daysPerMonth?: number;
    statusDate?: string;
    weekStartDay?: number;
    workFormat?: number;
    durationFormat?: number;
    currencyCode?: string;
    currencyDigits?: number;
    currencySymbol?: string;
    currencySymbolPosition?: number;
    fyStartDate?: string;
    fiscalYearStart?: boolean;
    criticalSlackLimit?: number;
    defaultTaskType?: number;
    defaultFixedCostAccrual?: number;
    defaultStandardRate?: string;
    defaultOvertimeRate?: string;
    defaultTaskEVMethod?: number;
    newTaskStartDate?: number;
    newTasksAreManual?: boolean;
    newTasksEffortDriven?: boolean;
    newTasksEstimated?: boolean;
    actualsInSync?: boolean;
    editableActualCosts?: boolean;
    honorConstraints?: boolean;
    insertedProjectsLikeSummary?: boolean;
    multipleCriticalPaths?: boolean;
    taskUpdatesResource?: boolean;
    updateManuallyScheduledTasksWhenEditingLinks?: boolean;
    calendarUID?: string;
    outlineCodes: OutlineCodeModel[];
    wbsMasks: WBSMaskModel[];
    extendedAttributes: ProjectExtendedAttributeModel[];
  };
  calendars: CalendarModel[];
  tasks: TaskModel[];
  resources: ResourceModel[];
  assignments: AssignmentModel[];
};

type TaskModel = {
  uid: string;
  id: string;
  name: string;
  outlineLevel: number;
  outlineNumber: string;
  wbs?: string;
  type?: number;
  calendarUID?: string;
  priority?: number;
  start: string;
  finish: string;
  duration: string;
  actualStart?: string;
  actualFinish?: string;
  deadline?: string;
  startVariance?: string;
  finishVariance?: string;
  work?: string;
  workVariance?: string;
  totalSlack?: string;
  freeSlack?: string;
  cost?: number;
  actualCost?: number;
  remainingCost?: number;
  remainingWork?: string;
  actualWork?: string;
  milestone: boolean;
  summary: boolean;
  critical?: boolean;
  percentComplete: number;
  percentWorkComplete?: number;
  notes?: string;
  constraintType?: number;
  constraintDate?: string;
  predecessors: PredecessorModel[];
};

type PredecessorModel = {
  predecessorUid: string;
  type?: number;
  linkLag?: string;
};

type ResourceModel = {
  uid: string;
  id: string;
  name: string;
  type?: number;
  initials?: string;
  group?: string;
  workGroup?: number;
  maxUnits?: number;
  calendarUID?: string;
  standardRate?: string;
  standardRateFormat?: number;
  overtimeRate?: string;
  overtimeRateFormat?: number;
  costPerUse?: number;
  work?: string;
  actualWork?: string;
  remainingWork?: string;
  cost?: number;
  actualCost?: number;
  remainingCost?: number;
  percentWorkComplete?: number;
};

type AssignmentModel = {
  uid: string;
  taskUid: string;
  resourceUid: string;
  start?: string;
  finish?: string;
  startVariance?: string;
  finishVariance?: string;
  delay?: string;
  milestone?: boolean;
  workContour?: number;
  units?: number;
  work?: string;
  cost?: number;
  actualCost?: number;
  remainingCost?: number;
  percentWorkComplete?: number;
  overtimeWork?: string;
  actualOvertimeWork?: string;
  actualWork?: string;
  remainingWork?: string;
};

type CalendarModel = {
  uid: string;
  name: string;
  isBaseCalendar: boolean;
  isBaselineCalendar?: boolean;
  baseCalendarUID?: string;
  weekDays: Array<{
    dayType: number;
    dayWorking: boolean;
    workingTimes: Array<{
      fromTime: string;
      toTime: string;
    }>;
  }>;
  exceptions: Array<{
    name?: string;
    fromDate?: string;
    toDate?: string;
    dayWorking?: boolean;
    workingTimes: Array<{
      fromTime: string;
      toTime: string;
    }>;
  }>;
  workWeeks: Array<{
    name?: string;
    fromDate?: string;
    toDate?: string;
    weekDays: Array<{
      dayType: number;
      dayWorking: boolean;
      workingTimes: Array<{
        fromTime: string;
        toTime: string;
      }>;
    }>;
  }>;
};
```

注意:

- これは STEP 1 の最小モデル案であり、今後拡張の余地がある
- 日付・期間表現は、まず XML と往復しやすい文字列保持を優先する

## 実装方針

STEP 1 の中核処理は、次のような責務に分ける。

- `parseXmlDocument(xmlText): XMLDocument`
- `importMsProjectXml(xmlText): ProjectModel`
- `validateProjectModel(model): ValidationIssue[]`
- `exportMsProjectXml(model): string`
- `normalizeProjectModel(model): ProjectModel`

テストの基本方針:

- `xml -> model -> xml -> model` のラウンドトリップを確認する
- 比較対象は文字列一致ではなく、正規化後の内部モデル一致とする

実装判断の原則:

- 仕様や表現方法に迷った場合は、`MS Project XML` の持ち方を優先する
- 独自に扱いやすいモデル化は許容するが、`MS Project XML` との意味対応を壊さないことを優先する
- 特にタスク階層や依存関係は、独自表現へ寄せすぎず、まず `MS Project` 側の表現を基準に考える

## テスト方針

STEP 1 では、少なくとも次を確認する。

- サンプル XML を読み込める
- 内部モデルへ変換できる
- 最小妥当性チェック結果を確認できる
- 再生成 XML を出力できる
- 再生成 XML を再読込できる
- 主要フィールドが保持される

比較観点:

- `Project` 基本情報
- `Tasks` の主要フィールド
- `Resources` の主要フィールド
- `Assignments` の主要フィールド
- 依存関係

## 非目標

STEP 1 では、次は非目標とする。

- MS Project XML の完全再現
- 元 XML のノード順や空白や書式の完全保持
- フル機能の編集 UI
- すべての MS Project XML 要素の対応

## STEP 1 実装済みメモ

現時点の STEP 1 実装では、次が入っている。

- `types.ts`, `msproject-xml.ts`, `main.ts` への責務分離
- サンプル XML の読込
- XML 文字列の import
- 内部モデルから整形済み XML を再生成
- XML ファイルの export
- `Project / Tasks / Resources / Assignments / Calendars` の簡易プレビュー表示
- `project / tasks / resources / assignments / calendars` 単位の検証メッセージ表示
- `mikuproject` 独自の最小妥当性チェック
- `Calendar` の `BaseCalendarUID / WeekDays / WorkingTimes` の round-trip
- `Calendar` の `IsBaselineCalendar / Exceptions / WorkWeeks / Exception WorkingTimes` の round-trip
- `Resource` の `CalendarUID / StandardRate / CostPerUse` の round-trip
- `Resource` の `Work / ActualWork / RemainingWork / Cost / ActualCost / RemainingCost / PercentWorkComplete` の round-trip
- `Assignment` の `StartVariance / FinishVariance` の round-trip
- `Resource` の `WorkGroup` の round-trip
- `Assignment` の `Delay / Milestone / WorkContour` の round-trip
- `Assignment` の `OvertimeWork / ActualOvertimeWork` の round-trip
- `Task` の `Deadline / StartVariance / FinishVariance` の round-trip
- `Task` の `WorkVariance / TotalSlack / FreeSlack / Critical` の round-trip
- `Resource` の `StandardRateFormat / OvertimeRate / OvertimeRateFormat` の round-trip
- `Assignment` の `PercentWorkComplete / ActualWork / RemainingWork` の round-trip
- `Project` の `StatusDate / WeekStartDay / WorkFormat / DurationFormat` の round-trip
- `Project` の `CurrencyCode / CurrencyDigits / CurrencySymbol / CurrencySymbolPosition` の round-trip
- `Project` の `FYStartDate / FiscalYearStart` の round-trip
- `Project` の `CriticalSlackLimit / DefaultTaskType` の round-trip
- `Project` の `DefaultFixedCostAccrual / DefaultStandardRate / DefaultOvertimeRate` の round-trip
- `Project` の `DefaultTaskEVMethod / NewTaskStartDate` の round-trip
- `Project` の `NewTasksAreManual / NewTasksEffortDriven` の round-trip
- `Project` の `NewTasksEstimated / ActualsInSync` の round-trip
- `Project` の `EditableActualCosts / HonorConstraints` の round-trip
- `Project` の `InsertedProjectsLikeSummary / MultipleCriticalPaths` の round-trip
- `Project` の `TaskUpdatesResource / UpdateManuallyScheduledTasksWhenEditingLinks` の round-trip
- `Project` の `OutlineCodes / WBSMasks` の最小 round-trip
- `Project` の `ExtendedAttributes` の最小 round-trip
- `Task` の `ExtendedAttribute` の最小 round-trip
- `Resource` の `ExtendedAttribute` の最小 round-trip
- `Assignment` の `ExtendedAttribute` の最小 round-trip
- `Task` の `Baseline` の最小 round-trip
- `Assignment` の `Baseline` の最小 round-trip
- `Resource` の `Baseline` の最小 round-trip
- `Task` の `TimephasedData` の最小 round-trip
- `Resource` の `TimephasedData` の最小 round-trip
- `Assignment` の `TimephasedData` の最小 round-trip
- `Task / Assignment` の `Cost / ActualCost / RemainingCost` の round-trip
- round-trip テスト

## 次に決めること

STEP 1 の次の検討項目:

1. サンプル XML の置き場所
2. 内部モデル型の確定
3. XML パーサ / シリアライザの実装方針
4. STEP 1 で実際に保持する必須フィールドの最終確定
5. ラウンドトリップ比較用の正規化ルール
