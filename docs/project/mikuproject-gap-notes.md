# mikuproject gap notes

`mikuproject` の次段を考えるための、実例 XML ベースの棚卸しメモ。

前提:

- 参照元は `docs/project/local-data/` に一時配置した実例 XML
- Git 管理対象の testdata ではない
- ここでは `Project / Task / Resource / Assignment / Calendar` ごとに、実例で見えた主なタグを整理する
- 目的は「現在の内部モデルで保持しているもの」と「今後候補になるもの」の差分を把握すること

## 対象実例

- `3PointPlan-example.xml`
- `01145024.xml`
- `Project_Grouping_and_Conditional_Formatting_Example.xml`
- `link types.xml`

## 現在の STEP 1 で保持済み

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
- `CalendarUID`

### Task

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
- `PredecessorLink`

### Resource

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

### Assignment

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
- `ActualWork`
- `RemainingWork`
- `Cost`
- `ActualCost`
- `RemainingCost`
- `PercentWorkComplete`
- `OvertimeWork`
- `ActualOvertimeWork`

### Calendar

- `UID`
- `Name`
- `IsBaseCalendar`
- `IsBaselineCalendar`
- `BaseCalendarUID`
- `WeekDays`
- `Exceptions`
- `WorkWeeks`

## 実例で見えた主な未保持タグ

### Project 候補

優先度が高そう:

- `Project CalendarUID` と calendar 実体の整合運用

後回し候補:

- `ExtendedAttributes` の完全対応
- `ExtendedAttributes`

### Task 候補

優先度が高そう:

- `Task CalendarUID` に紐づくカレンダー差分の扱い

実例で頻出だが重い:

- `Baseline`
- `TimephasedData`

特記事項:

- `UID=0`
- 空 `Name`
- `OutlineLevel=0`

は実例で普通に出るため、validation では placeholder 扱いを考慮済み

### Resource 候補

優先度が高そう:

- 直近の高優先候補は消化済み

実例で頻出だが重い:

- `Baseline`
- `TimephasedData`

### Assignment 候補

優先度が高そう:

- 直近の高優先候補は消化済み

実例で頻出だが重い:

- `Baseline`
- `TimephasedData`
- `ActualCost`
- `RemainingCost`
- `OvertimeWork`
- `ActualOvertimeWork`

特記事項:

- `ResourceUID=-65535`

は実例で未割当を示す特別値として扱う前提

### Calendar 候補

優先度が高そう:

- 直近の高優先候補は消化済み

後回し候補:

- 直近の軽量候補は消化済み

## 次に拾う候補

現時点での優先順:

1. `Calendar` の実用項目
   - 実例 XML の calendar 差分パターン整理
2. `Resource / Assignment` の次段候補
   - preview / validation の detail 表示強化
3. `Task` の次段候補
   - preview / validation の detail 表示強化
4. `Project` の次段候補
   - project 以外の `ExtendedAttributes`

## 後回しでよいもの

- `Baseline` 系
- `TimephasedData`
- コスト系の完全保持
- 表示設定
- Project Server 連携系
- `ExtendedAttributes` の完全対応

## 判断メモ

- STEP 2 は、まず「実例で頻出し、意味が分かりやすく、XML 往復しやすい項目」から拾うのがよい
- `Baseline` や `TimephasedData` は重要だが、構造が重いため別段階が自然
- 実例 XML を読む限り、parser 自体よりも「どこまでを内部モデルで保持するか」の整理が次の主題
