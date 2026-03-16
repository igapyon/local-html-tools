// @vitest-environment jsdom

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { beforeEach, describe, expect, it, vi } from "vitest";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const typesCode = readFileSync(
  path.resolve(__dirname, "../src/mikuproject/js/types.js"),
  "utf8"
);
const msProjectXmlCode = readFileSync(
  path.resolve(__dirname, "../src/mikuproject/js/msproject-xml.js"),
  "utf8"
);
const mainCode = readFileSync(
  path.resolve(__dirname, "../src/mikuproject/js/main.js"),
  "utf8"
);
const minimalXml = readFileSync(
  path.resolve(__dirname, "../testdata/minimal.xml"),
  "utf8"
);
const hierarchyXml = readFileSync(
  path.resolve(__dirname, "../testdata/hierarchy.xml"),
  "utf8"
);
const dependencyXml = readFileSync(
  path.resolve(__dirname, "../testdata/dependency.xml"),
  "utf8"
);

function mountDom() {
  document.body.innerHTML = `
    <button id="loadSampleBtn" type="button">サンプル読込</button>
    <button id="importXmlBtn" type="button">XML Import</button>
    <button id="parseXmlBtn" type="button">XML を解析</button>
    <button id="exportXmlBtn" type="button">XML を再生成</button>
    <button id="downloadXmlBtn" type="button">XML Export</button>
    <button id="roundTripBtn" type="button">再読込テスト</button>
    <input id="importXmlInput" type="file" />
    <div id="statusMessage"></div>
    <div id="validationIssues" class="md-hidden"></div>
    <textarea id="xmlInput"></textarea>
    <div id="summaryProjectName"></div>
    <div id="summaryTaskCount"></div>
    <div id="summaryResourceCount"></div>
    <div id="summaryAssignmentCount"></div>
    <div id="summaryCalendarCount"></div>
    <textarea id="modelOutput"></textarea>
    <div id="taskPreview"></div>
    <div id="resourcePreview"></div>
    <div id="assignmentPreview"></div>
    <div id="toast"></div>
  `;
  const toast = document.getElementById("toast");
  toast.show = vi.fn();
}

function bootPage() {
  mountDom();
  new Function(`${typesCode}\n${msProjectXmlCode}\n${mainCode}`)();
  document.dispatchEvent(new Event("DOMContentLoaded"));
}

function bootXmlModule() {
  new Function(`${typesCode}\n${msProjectXmlCode}`)();
  return globalThis.__mikuprojectXml;
}

describe("mikuproject main", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    Object.defineProperty(URL, "createObjectURL", {
      value: vi.fn(() => "blob:mock"),
      configurable: true
    });
    Object.defineProperty(URL, "revokeObjectURL", {
      value: vi.fn(),
      configurable: true
    });
    HTMLAnchorElement.prototype.click = vi.fn();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-16T23:12:00+09:00"));
  });

  it("loads sample xml on startup", () => {
    bootPage();

    expect(document.getElementById("xmlInput").value).toContain("<Project");
    expect(document.getElementById("statusMessage").textContent).toContain("サンプル XML");
  });

  it("parses xml into internal model summary", () => {
    bootPage();

    document.getElementById("parseXmlBtn").click();

    expect(document.getElementById("summaryProjectName").textContent).toBe("Sample Project");
    expect(document.getElementById("summaryTaskCount").textContent).toBe("3");
    expect(document.getElementById("summaryResourceCount").textContent).toBe("1");
    expect(document.getElementById("summaryAssignmentCount").textContent).toBe("2");
    expect(document.getElementById("summaryCalendarCount").textContent).toBe("2");
    expect(document.getElementById("modelOutput").value).toContain("\"name\": \"Sample Project\"");
    expect(document.getElementById("modelOutput").value).toContain("\"title\": \"Sample Project Title\"");
    expect(document.getElementById("modelOutput").value).toContain("\"author\": \"Toshiki Iga\"");
    expect(document.getElementById("modelOutput").value).toContain("\"company\": \"Local HTML Tools\"");
    expect(document.getElementById("modelOutput").value).toContain("\"creationDate\": \"2026-03-16T08:30:00\"");
    expect(document.getElementById("modelOutput").value).toContain("\"lastSaved\": \"2026-03-16T09:10:00\"");
    expect(document.getElementById("modelOutput").value).toContain("\"saveVersion\": 14");
    expect(document.getElementById("modelOutput").value).toContain("\"currentDate\": \"2026-03-16T09:00:00\"");
    expect(document.getElementById("modelOutput").value).toContain("\"defaultStartTime\": \"09:00:00\"");
    expect(document.getElementById("modelOutput").value).toContain("\"minutesPerDay\": 480");
    expect(document.getElementById("modelOutput").value).toContain("\"statusDate\": \"2026-03-19T09:00:00\"");
    expect(document.getElementById("modelOutput").value).toContain("\"weekStartDay\": 1");
    expect(document.getElementById("modelOutput").value).toContain("\"workFormat\": 2");
    expect(document.getElementById("modelOutput").value).toContain("\"durationFormat\": 7");
    expect(document.getElementById("modelOutput").value).toContain("\"currencyCode\": \"JPY\"");
    expect(document.getElementById("modelOutput").value).toContain("\"currencyDigits\": 0");
    expect(document.getElementById("modelOutput").value).toContain("\"currencySymbol\": \"¥\"");
    expect(document.getElementById("modelOutput").value).toContain("\"currencySymbolPosition\": 0");
    expect(document.getElementById("modelOutput").value).toContain("\"fyStartDate\": \"2026-04-01T00:00:00\"");
    expect(document.getElementById("modelOutput").value).toContain("\"fiscalYearStart\": true");
    expect(document.getElementById("modelOutput").value).toContain("\"criticalSlackLimit\": 0");
    expect(document.getElementById("modelOutput").value).toContain("\"defaultTaskType\": 1");
    expect(document.getElementById("modelOutput").value).toContain("\"defaultFixedCostAccrual\": 2");
    expect(document.getElementById("modelOutput").value).toContain("\"defaultStandardRate\": \"5000/h\"");
    expect(document.getElementById("modelOutput").value).toContain("\"defaultOvertimeRate\": \"7000/h\"");
    expect(document.getElementById("modelOutput").value).toContain("\"defaultTaskEVMethod\": 0");
    expect(document.getElementById("modelOutput").value).toContain("\"newTaskStartDate\": 0");
    expect(document.getElementById("modelOutput").value).toContain("\"newTasksAreManual\": false");
    expect(document.getElementById("modelOutput").value).toContain("\"newTasksEffortDriven\": true");
    expect(document.getElementById("modelOutput").value).toContain("\"newTasksEstimated\": true");
    expect(document.getElementById("modelOutput").value).toContain("\"actualsInSync\": false");
    expect(document.getElementById("modelOutput").value).toContain("\"editableActualCosts\": true");
    expect(document.getElementById("modelOutput").value).toContain("\"honorConstraints\": true");
    expect(document.getElementById("modelOutput").value).toContain("\"insertedProjectsLikeSummary\": true");
    expect(document.getElementById("modelOutput").value).toContain("\"multipleCriticalPaths\": false");
    expect(document.getElementById("modelOutput").value).toContain("\"taskUpdatesResource\": true");
    expect(document.getElementById("modelOutput").value).toContain("\"updateManuallyScheduledTasksWhenEditingLinks\": false");
    expect(document.getElementById("modelOutput").value).toContain("\"calendarUID\": \"1\"");
    expect(document.getElementById("modelOutput").value).toContain("\"fieldID\": \"188743731\"");
    expect(document.getElementById("modelOutput").value).toContain("\"fieldName\": \"Outline Code1\"");
    expect(document.getElementById("modelOutput").value).toContain("\"alias\": \"Phase\"");
    expect(document.getElementById("modelOutput").value).toContain("\"onlyTableValues\": true");
    expect(document.getElementById("modelOutput").value).toContain("\"value\": \"PLAN\"");
    expect(document.getElementById("modelOutput").value).toContain("\"description\": \"Planning\"");
    expect(document.getElementById("modelOutput").value).toContain("\"level\": 2");
    expect(document.getElementById("modelOutput").value).toContain("\"mask\": \"00\"");
    expect(document.getElementById("modelOutput").value).toContain("\"fieldName\": \"Text1\"");
    expect(document.getElementById("modelOutput").value).toContain("\"alias\": \"Owner\"");
    expect(document.getElementById("modelOutput").value).toContain("\"appendNewValues\": true");
    expect(document.getElementById("modelOutput").value).toContain("\"isBaselineCalendar\": true");
    expect(document.getElementById("modelOutput").value).toContain("\"baseCalendarUID\": \"1\"");
    expect(document.getElementById("modelOutput").value).toContain("\"dayType\": 2");
    expect(document.getElementById("modelOutput").value).toContain("\"fromTime\": \"10:00:00\"");
    expect(document.getElementById("modelOutput").value).toContain("\"name\": \"Holiday\"");
    expect(document.getElementById("modelOutput").value).toContain("\"workingTimes\": [");
    expect(document.getElementById("modelOutput").value).toContain("\"name\": \"Spring Sprint\"");
    expect(document.getElementById("modelOutput").value).toContain("\"wbs\": \"1.2\"");
    expect(document.getElementById("modelOutput").value).toContain("\"priority\": 700");
    expect(document.getElementById("modelOutput").value).toContain("\"type\": 1");
    expect(document.getElementById("modelOutput").value).toContain("\"work\": \"PT24H0M0S\"");
    expect(document.getElementById("modelOutput").value).toContain("\"workVariance\": \"PT0H0M0S\"");
    expect(document.getElementById("modelOutput").value).toContain("\"totalSlack\": \"PT4H0M0S\"");
    expect(document.getElementById("modelOutput").value).toContain("\"freeSlack\": \"PT2H0M0S\"");
    expect(document.getElementById("modelOutput").value).toContain("\"cost\": 120000");
    expect(document.getElementById("modelOutput").value).toContain("\"actualCost\": 0");
    expect(document.getElementById("modelOutput").value).toContain("\"remainingCost\": 120000");
    expect(document.getElementById("modelOutput").value).toContain("\"remainingWork\": \"PT24H0M0S\"");
    expect(document.getElementById("modelOutput").value).toContain("\"actualWork\": \"PT0H0M0S\"");
    expect(document.getElementById("modelOutput").value).toContain("\"critical\": true");
    expect(document.getElementById("modelOutput").value).toContain("\"percentWorkComplete\": 0");
    expect(document.getElementById("modelOutput").value).toContain("\"predecessorUid\": \"2\"");
    expect(document.getElementById("modelOutput").value).toContain("\"name\": \"Standard\"");
    expect(document.getElementById("modelOutput").value).toContain("\"actualStart\": \"2026-03-16T09:00:00\"");
    expect(document.getElementById("modelOutput").value).toContain("\"constraintType\": 4");
    expect(document.getElementById("modelOutput").value).toContain("\"notes\": \"Implementation starts after design\"");
    expect(document.getElementById("modelOutput").value).toContain("\"deadline\": \"2026-03-21T18:00:00\"");
    expect(document.getElementById("modelOutput").value).toContain("\"startVariance\": \"PT0H0M0S\"");
    expect(document.getElementById("modelOutput").value).toContain("\"finishVariance\": \"PT0H0M0S\"");
    expect(document.getElementById("modelOutput").value).toContain("\"value\": \"Miku\"");
    expect(document.getElementById("modelOutput").value).toContain("\"number\": 0");
    expect(document.getElementById("modelOutput").value).toContain("\"unit\": 2");
    expect(document.getElementById("modelOutput").value).toContain("\"value\": \"PT8H0M0S\"");
    expect(document.getElementById("modelOutput").value).toContain("\"initials\": \"MK\"");
    expect(document.getElementById("modelOutput").value).toContain("\"group\": \"Engineering\"");
    expect(document.getElementById("modelOutput").value).toContain("\"workGroup\": 0");
    expect(document.getElementById("modelOutput").value).toContain("\"calendarUID\": \"2\"");
    expect(document.getElementById("modelOutput").value).toContain("\"standardRate\": \"5000/h\"");
    expect(document.getElementById("modelOutput").value).toContain("\"standardRateFormat\": 2");
    expect(document.getElementById("modelOutput").value).toContain("\"overtimeRate\": \"7000/h\"");
    expect(document.getElementById("modelOutput").value).toContain("\"overtimeRateFormat\": 2");
    expect(document.getElementById("modelOutput").value).toContain("\"costPerUse\": 1000");
    expect(document.getElementById("modelOutput").value).toContain("\"work\": \"PT40H0M0S\"");
    expect(document.getElementById("modelOutput").value).toContain("\"actualWork\": \"PT20H0M0S\"");
    expect(document.getElementById("modelOutput").value).toContain("\"remainingWork\": \"PT20H0M0S\"");
    expect(document.getElementById("modelOutput").value).toContain("\"cost\": 200000");
    expect(document.getElementById("modelOutput").value).toContain("\"actualCost\": 100000");
    expect(document.getElementById("modelOutput").value).toContain("\"remainingCost\": 100000");
    expect(document.getElementById("modelOutput").value).toContain("\"percentWorkComplete\": 50");
    expect(document.getElementById("modelOutput").value).toContain("\"value\": \"Platform Team\"");
    expect(document.getElementById("modelOutput").value).toContain("\"work\": \"PT40H0M0S\"");
    expect(document.getElementById("modelOutput").value).toContain("\"unit\": 2");
    expect(document.getElementById("modelOutput").value).toContain("\"start\": \"2026-03-16T09:00:00\"");
    expect(document.getElementById("modelOutput").value).toContain("\"startVariance\": \"PT0H0M0S\"");
    expect(document.getElementById("modelOutput").value).toContain("\"finishVariance\": \"PT0H0M0S\"");
    expect(document.getElementById("modelOutput").value).toContain("\"delay\": \"PT0H0M0S\"");
    expect(document.getElementById("modelOutput").value).toContain("\"milestone\": false");
    expect(document.getElementById("modelOutput").value).toContain("\"workContour\": 0");
    expect(document.getElementById("modelOutput").value).toContain("\"percentWorkComplete\": 50");
    expect(document.getElementById("modelOutput").value).toContain("\"overtimeWork\": \"PT2H0M0S\"");
    expect(document.getElementById("modelOutput").value).toContain("\"actualOvertimeWork\": \"PT1H0M0S\"");
    expect(document.getElementById("modelOutput").value).toContain("\"actualWork\": \"PT8H0M0S\"");
    expect(document.getElementById("modelOutput").value).toContain("\"remainingWork\": \"PT8H0M0S\"");
    expect(document.getElementById("modelOutput").value).toContain("\"value\": \"Design Slot\"");
    expect(document.getElementById("modelOutput").value).toContain("\"cost\": 80000");
    expect(document.getElementById("modelOutput").value).toContain("\"unit\": 2");
    expect(document.getElementById("taskPreview").textContent).toContain("Implementation");
    expect(document.getElementById("taskPreview").textContent).toContain("Ext=1 / Baselines=1 / Timephased=1");
    expect(document.getElementById("taskPreview").textContent).toContain("Baseline1=#0 2026-03-16T09:00:00 -> 2026-03-17T18:00:00");
    expect(document.getElementById("taskPreview").textContent).toContain("Timephased1=Type=1 2026-03-16T09:00:00 -> 2026-03-16T18:00:00");
    expect(document.getElementById("resourcePreview").textContent).toContain("Engineering");
    expect(document.getElementById("resourcePreview").textContent).toContain("Ext=1 / Baselines=1 / Timephased=1");
    expect(document.getElementById("resourcePreview").textContent).toContain("Baseline1=#0 2026-03-16T09:00:00 -> 2026-03-20T18:00:00");
    expect(document.getElementById("resourcePreview").textContent).toContain("Timephased1=Type=1 2026-03-16T09:00:00 -> 2026-03-16T18:00:00");
    expect(document.getElementById("assignmentPreview").textContent).toContain("TaskUID=2");
    expect(document.getElementById("assignmentPreview").textContent).toContain("Ext=1 / Baselines=1 / Timephased=1");
    expect(document.getElementById("assignmentPreview").textContent).toContain("Baseline1=#0 2026-03-16T09:00:00 -> 2026-03-17T18:00:00");
    expect(document.getElementById("assignmentPreview").textContent).toContain("Timephased1=Type=1 2026-03-16T09:00:00 -> 2026-03-16T18:00:00");
  });

  it("exports xml from the current model", () => {
    bootPage();

    document.getElementById("parseXmlBtn").click();
    document.getElementById("exportXmlBtn").click();

    const xmlText = document.getElementById("xmlInput").value;
    expect(xmlText).toContain("<?xml version=\"1.0\" encoding=\"UTF-8\"?>");
    expect(xmlText).toContain("\n<Project xmlns=\"http://schemas.microsoft.com/project\">\n");
    expect(xmlText).toContain("<Title>Sample Project Title</Title>");
    expect(xmlText).toContain("<Company>Local HTML Tools</Company>");
    expect(xmlText).toContain("<Author>Toshiki Iga</Author>");
    expect(xmlText).toContain("<CreationDate>2026-03-16T08:30:00</CreationDate>");
    expect(xmlText).toContain("<LastSaved>2026-03-16T09:10:00</LastSaved>");
    expect(xmlText).toContain("<SaveVersion>14</SaveVersion>");
    expect(xmlText).toContain("<CurrentDate>2026-03-16T09:00:00</CurrentDate>");
    expect(xmlText).toContain("<StatusDate>2026-03-19T09:00:00</StatusDate>");
    expect(xmlText).toContain("<WeekStartDay>1</WeekStartDay>");
    expect(xmlText).toContain("<WorkFormat>2</WorkFormat>");
    expect(xmlText).toContain("<DurationFormat>7</DurationFormat>");
    expect(xmlText).toContain("<CurrencyCode>JPY</CurrencyCode>");
    expect(xmlText).toContain("<CurrencyDigits>0</CurrencyDigits>");
    expect(xmlText).toContain("<CurrencySymbol>¥</CurrencySymbol>");
    expect(xmlText).toContain("<CurrencySymbolPosition>0</CurrencySymbolPosition>");
    expect(xmlText).toContain("<FYStartDate>2026-04-01T00:00:00</FYStartDate>");
    expect(xmlText).toContain("<FiscalYearStart>1</FiscalYearStart>");
    expect(xmlText).toContain("<CriticalSlackLimit>0</CriticalSlackLimit>");
    expect(xmlText).toContain("<DefaultTaskType>1</DefaultTaskType>");
    expect(xmlText).toContain("<DefaultFixedCostAccrual>2</DefaultFixedCostAccrual>");
    expect(xmlText).toContain("<DefaultStandardRate>5000/h</DefaultStandardRate>");
    expect(xmlText).toContain("<DefaultOvertimeRate>7000/h</DefaultOvertimeRate>");
    expect(xmlText).toContain("<DefaultTaskEVMethod>0</DefaultTaskEVMethod>");
    expect(xmlText).toContain("<NewTaskStartDate>0</NewTaskStartDate>");
    expect(xmlText).toContain("<NewTasksAreManual>0</NewTasksAreManual>");
    expect(xmlText).toContain("<NewTasksEffortDriven>1</NewTasksEffortDriven>");
    expect(xmlText).toContain("<NewTasksEstimated>1</NewTasksEstimated>");
    expect(xmlText).toContain("<ActualsInSync>0</ActualsInSync>");
    expect(xmlText).toContain("<EditableActualCosts>1</EditableActualCosts>");
    expect(xmlText).toContain("<HonorConstraints>1</HonorConstraints>");
    expect(xmlText).toContain("<InsertedProjectsLikeSummary>1</InsertedProjectsLikeSummary>");
    expect(xmlText).toContain("<MultipleCriticalPaths>0</MultipleCriticalPaths>");
    expect(xmlText).toContain("<TaskUpdatesResource>1</TaskUpdatesResource>");
    expect(xmlText).toContain("<UpdateManuallyScheduledTasksWhenEditingLinks>0</UpdateManuallyScheduledTasksWhenEditingLinks>");
    expect(xmlText).toContain("<OutlineCodes>");
    expect(xmlText).toContain("<FieldID>188743731</FieldID>");
    expect(xmlText).toContain("<FieldName>Outline Code1</FieldName>");
    expect(xmlText).toContain("<Alias>Phase</Alias>");
    expect(xmlText).toContain("<OnlyTableValues>1</OnlyTableValues>");
    expect(xmlText).toContain("<Values>");
    expect(xmlText).toContain("<Value>PLAN</Value>");
    expect(xmlText).toContain("<Description>Planning</Description>");
    expect(xmlText).toContain("<WBSMasks>");
    expect(xmlText).toContain("<WBSMask>");
    expect(xmlText).toContain("<Level>2</Level>");
    expect(xmlText).toContain("<Mask>00</Mask>");
    expect(xmlText).toContain("<ExtendedAttributes>");
    expect(xmlText).toContain("<ExtendedAttribute>");
    expect(xmlText).toContain("<FieldName>Text1</FieldName>");
    expect(xmlText).toContain("<Alias>Owner</Alias>");
    expect(xmlText).toContain("<AppendNewValues>1</AppendNewValues>");
    expect(xmlText).toContain("<WBS>1.2</WBS>");
    expect(xmlText).toContain("<Priority>700</Priority>");
    expect(xmlText).toContain("<CalendarUID>1</CalendarUID>");
    expect(xmlText).toContain("<Work>PT24H0M0S</Work>");
    expect(xmlText).toContain("<WorkVariance>PT0H0M0S</WorkVariance>");
    expect(xmlText).toContain("<TotalSlack>PT4H0M0S</TotalSlack>");
    expect(xmlText).toContain("<FreeSlack>PT2H0M0S</FreeSlack>");
    expect(xmlText).toContain("<Cost>120000</Cost>");
    expect(xmlText).toContain("<ActualCost>0</ActualCost>");
    expect(xmlText).toContain("<RemainingCost>120000</RemainingCost>");
    expect(xmlText).toContain("<RemainingWork>PT24H0M0S</RemainingWork>");
    expect(xmlText).toContain("<ActualWork>PT0H0M0S</ActualWork>");
    expect(xmlText).toContain("<PercentWorkComplete>0</PercentWorkComplete>");
    expect(xmlText).toContain("<DefaultStartTime>09:00:00</DefaultStartTime>");
    expect(xmlText).toContain("<MinutesPerDay>480</MinutesPerDay>");
    expect(xmlText).toContain("<CalendarUID>1</CalendarUID>");
    expect(xmlText).toContain("<Calendars>");
    expect(xmlText).toContain("\n  <Calendars>\n");
    expect(xmlText).toContain("<IsBaselineCalendar>1</IsBaselineCalendar>");
    expect(xmlText).toContain("<BaseCalendarUID>1</BaseCalendarUID>");
    expect(xmlText).toContain("<Exceptions>");
    expect(xmlText).toContain("<WorkWeeks>");
    expect(xmlText).toContain("<Name>Holiday</Name>");
    expect(xmlText).toContain("<WorkingTimes>");
    expect(xmlText).toContain("<Name>Spring Sprint</Name>");
    expect(xmlText).toContain("<WeekDays>");
    expect(xmlText).toContain("<DayType>2</DayType>");
    expect(xmlText).toContain("<FromTime>10:00:00</FromTime>");
    expect(xmlText).toContain("<Tasks>");
    expect(xmlText).toContain("<Assignments>");
    expect(xmlText).toContain("<LinkLag>PT0H0M0S</LinkLag>");
    expect(xmlText).toContain("<ActualStart>2026-03-16T09:00:00</ActualStart>");
    expect(xmlText).toContain("<Deadline>2026-03-21T18:00:00</Deadline>");
    expect(xmlText).toContain("<StartVariance>PT0H0M0S</StartVariance>");
    expect(xmlText).toContain("<FinishVariance>PT0H0M0S</FinishVariance>");
    expect(xmlText).toContain("<ConstraintType>4</ConstraintType>");
    expect(xmlText).toContain("<Notes>Implementation starts after design</Notes>");
    expect(xmlText).toContain("<ExtendedAttribute>");
    expect(xmlText).toContain("<FieldID>188743734</FieldID>");
    expect(xmlText).toContain("<Value>Miku</Value>");
    expect(xmlText).toContain("<Baseline>");
    expect(xmlText).toContain("<Number>0</Number>");
    expect(xmlText).toContain("<Work>PT16H0M0S</Work>");
    expect(xmlText).toContain("<TimephasedData>");
    expect(xmlText).toContain("<Unit>2</Unit>");
    expect(xmlText).toContain("<Value>PT8H0M0S</Value>");
    expect(xmlText).toContain("<Critical>1</Critical>");
    expect(xmlText).toContain("<Initials>MK</Initials>");
    expect(xmlText).toContain("<Group>Engineering</Group>");
    expect(xmlText).toContain("<WorkGroup>0</WorkGroup>");
    expect(xmlText).toContain("<StandardRate>5000/h</StandardRate>");
    expect(xmlText).toContain("<StandardRateFormat>2</StandardRateFormat>");
    expect(xmlText).toContain("<OvertimeRate>7000/h</OvertimeRate>");
    expect(xmlText).toContain("<OvertimeRateFormat>2</OvertimeRateFormat>");
    expect(xmlText).toContain("<CostPerUse>1000</CostPerUse>");
    expect(xmlText).toContain("<Work>PT40H0M0S</Work>");
    expect(xmlText).toContain("<ActualWork>PT20H0M0S</ActualWork>");
    expect(xmlText).toContain("<RemainingWork>PT20H0M0S</RemainingWork>");
    expect(xmlText).toContain("<Cost>200000</Cost>");
    expect(xmlText).toContain("<ActualCost>100000</ActualCost>");
    expect(xmlText).toContain("<RemainingCost>100000</RemainingCost>");
    expect(xmlText).toContain("<PercentWorkComplete>50</PercentWorkComplete>");
    expect(xmlText).toContain("<ExtendedAttribute>");
    expect(xmlText).toContain("<FieldID>188743737</FieldID>");
    expect(xmlText).toContain("<Value>Platform Team</Value>");
    expect(xmlText).toContain("<Baseline>");
    expect(xmlText).toContain("<Work>PT40H0M0S</Work>");
    expect(xmlText).toContain("<TimephasedData>");
    expect(xmlText).toContain("<Unit>2</Unit>");
    expect(xmlText).toContain("<Start>2026-03-16T09:00:00</Start>");
    expect(xmlText).toContain("<StartVariance>PT0H0M0S</StartVariance>");
    expect(xmlText).toContain("<FinishVariance>PT0H0M0S</FinishVariance>");
    expect(xmlText).toContain("<Delay>PT0H0M0S</Delay>");
    expect(xmlText).toContain("<Milestone>0</Milestone>");
    expect(xmlText).toContain("<WorkContour>0</WorkContour>");
    expect(xmlText).toContain("<PercentWorkComplete>50</PercentWorkComplete>");
    expect(xmlText).toContain("<OvertimeWork>PT2H0M0S</OvertimeWork>");
    expect(xmlText).toContain("<ActualOvertimeWork>PT1H0M0S</ActualOvertimeWork>");
    expect(xmlText).toContain("<ActualWork>PT8H0M0S</ActualWork>");
    expect(xmlText).toContain("<RemainingWork>PT8H0M0S</RemainingWork>");
    expect(xmlText).toContain("<FieldID>255852547</FieldID>");
    expect(xmlText).toContain("<Value>Design Slot</Value>");
    expect(xmlText).toContain("<Baseline>");
    expect(xmlText).toContain("<Number>0</Number>");
    expect(xmlText).toContain("<TimephasedData>");
    expect(xmlText).toContain("<Unit>2</Unit>");
  });

  it("passes round-trip check", () => {
    bootPage();

    document.getElementById("parseXmlBtn").click();
    document.getElementById("roundTripBtn").click();

    expect(document.getElementById("statusMessage").textContent).toContain("再読込テストに成功");
    expect(document.getElementById("modelOutput").value).toContain("\"extendedAttributes\": [");
  });

  it("imports xml from a file into the textarea", async () => {
    bootPage();

    const importInput = document.getElementById("importXmlInput");
    const file = new File(["<Project><Name>Imported</Name></Project>"], "sample.xml", { type: "application/xml" });
    Object.defineProperty(file, "text", {
      configurable: true,
      value: () => Promise.resolve("<Project><Name>Imported</Name></Project>")
    });
    Object.defineProperty(importInput, "files", {
      configurable: true,
      value: [file]
    });

    importInput.dispatchEvent(new Event("change"));
    await Promise.resolve();
    await Promise.resolve();

    expect(document.getElementById("xmlInput").value).toContain("<Name>Imported</Name>");
    expect(document.getElementById("statusMessage").textContent).toContain("XML ファイルを読み込みました");
  });

  it("downloads current xml", () => {
    bootPage();

    document.getElementById("downloadXmlBtn").click();

    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(HTMLAnchorElement.prototype.click).toHaveBeenCalled();
    const clickedAnchor = HTMLAnchorElement.prototype.click.mock.instances.at(-1);
    expect(clickedAnchor.download).toBe("mikuproject-export-202603162312.xml");
    expect(document.getElementById("statusMessage").textContent).toContain("XML ファイルをエクスポートしました");
  });

  it("reports validation error when assignment references a missing resource", () => {
    bootPage();

    document.getElementById("xmlInput").value = document.getElementById("xmlInput").value.replace(
      "<ResourceUID>1</ResourceUID>",
      "<ResourceUID>99</ResourceUID>"
    );
    document.getElementById("parseXmlBtn").click();
    document.getElementById("roundTripBtn").click();

    expect(document.getElementById("statusMessage").textContent).toContain("Assignment ResourceUID");
    expect(document.getElementById("validationIssues").textContent).toContain("Assignment ResourceUID");
  });

  it("reports validation error when project calendar does not exist", () => {
    bootPage();

    document.getElementById("xmlInput").value = document.getElementById("xmlInput").value.replace(
      "<CalendarUID>1</CalendarUID>",
      "<CalendarUID>99</CalendarUID>"
    );
    document.getElementById("parseXmlBtn").click();

    expect(document.getElementById("statusMessage").textContent).toContain("検証で");
    expect(document.getElementById("validationIssues").textContent).toContain("Project");
    expect(document.getElementById("validationIssues").textContent).toContain("Project CalendarUID");
  });

  it("reports validation warning when percent complete is out of range", () => {
    bootPage();

    document.getElementById("xmlInput").value = document.getElementById("xmlInput").value.replace(
      "<PercentComplete>100</PercentComplete>",
      "<PercentComplete>120</PercentComplete>"
    );
    document.getElementById("parseXmlBtn").click();

    expect(document.getElementById("validationIssues").textContent).toContain("PercentComplete");
  });

  it("reports validation warning when task start is after finish", () => {
    bootPage();

    document.getElementById("xmlInput").value = document.getElementById("xmlInput").value.replace(
      "<Start>2026-03-18T09:00:00</Start>\n      <Finish>2026-03-20T18:00:00</Finish>",
      "<Start>2026-03-21T09:00:00</Start>\n      <Finish>2026-03-20T18:00:00</Finish>"
    );
    document.getElementById("parseXmlBtn").click();

    expect(document.getElementById("validationIssues").textContent).toContain("Task Start が Finish より後");
  });

  it("round-trips the minimal xml sample", () => {
    const xmlTools = bootXmlModule();

    const model = xmlTools.importMsProjectXml(minimalXml);
    const exportedXml = xmlTools.exportMsProjectXml(model);
    const reparsedModel = xmlTools.importMsProjectXml(exportedXml);

    expect(model.project.name).toBe("Minimal Project");
    expect(reparsedModel.project.name).toBe("Minimal Project");
    expect(reparsedModel.tasks).toHaveLength(1);
    expect(reparsedModel.tasks[0].name).toBe("Single Task");
    expect(xmlTools.validateProjectModel(reparsedModel)).toHaveLength(0);
  });

  it("round-trips project metadata fields", () => {
    const xmlTools = bootXmlModule();
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Project xmlns="http://schemas.microsoft.com/project">
  <Name>Metadata Project</Name>
  <Title>Metadata Title</Title>
  <Company>Example Company</Company>
  <Author>Example Author</Author>
  <CreationDate>2026-03-16T07:00:00</CreationDate>
  <LastSaved>2026-03-16T10:15:00</LastSaved>
  <SaveVersion>14</SaveVersion>
  <CurrencyCode>JPY</CurrencyCode>
  <CurrencyDigits>0</CurrencyDigits>
  <CurrencySymbol>¥</CurrencySymbol>
  <CurrencySymbolPosition>0</CurrencySymbolPosition>
  <FYStartDate>2026-04-01T00:00:00</FYStartDate>
  <FiscalYearStart>1</FiscalYearStart>
  <CriticalSlackLimit>0</CriticalSlackLimit>
  <DefaultTaskType>1</DefaultTaskType>
  <DefaultFixedCostAccrual>2</DefaultFixedCostAccrual>
  <DefaultStandardRate>5000/h</DefaultStandardRate>
  <DefaultOvertimeRate>7000/h</DefaultOvertimeRate>
  <DefaultTaskEVMethod>0</DefaultTaskEVMethod>
  <NewTaskStartDate>0</NewTaskStartDate>
  <NewTasksAreManual>0</NewTasksAreManual>
  <NewTasksEffortDriven>1</NewTasksEffortDriven>
  <NewTasksEstimated>1</NewTasksEstimated>
  <ActualsInSync>0</ActualsInSync>
  <EditableActualCosts>1</EditableActualCosts>
  <HonorConstraints>1</HonorConstraints>
  <InsertedProjectsLikeSummary>1</InsertedProjectsLikeSummary>
  <MultipleCriticalPaths>0</MultipleCriticalPaths>
  <TaskUpdatesResource>1</TaskUpdatesResource>
  <UpdateManuallyScheduledTasksWhenEditingLinks>0</UpdateManuallyScheduledTasksWhenEditingLinks>
  <OutlineCodes>
    <OutlineCode>
      <FieldID>188743731</FieldID>
      <FieldName>Outline Code1</FieldName>
      <Alias>Phase</Alias>
      <OnlyTableValues>1</OnlyTableValues>
      <Masks>
        <Mask>
          <Level>1</Level>
          <Mask>*</Mask>
          <Length>0</Length>
          <Sequence>0</Sequence>
        </Mask>
      </Masks>
      <Values>
        <Value>
          <Value>PLAN</Value>
          <Description>Planning</Description>
        </Value>
      </Values>
    </OutlineCode>
  </OutlineCodes>
  <WBSMasks>
    <WBSMask>
      <Level>1</Level>
      <Mask>A</Mask>
      <Length>1</Length>
      <Sequence>1</Sequence>
    </WBSMask>
  </WBSMasks>
  <ExtendedAttributes>
    <ExtendedAttribute>
      <FieldID>188743734</FieldID>
      <FieldName>Text1</FieldName>
      <Alias>Owner</Alias>
      <CalculationType>0</CalculationType>
      <RestrictValues>0</RestrictValues>
      <AppendNewValues>1</AppendNewValues>
    </ExtendedAttribute>
  </ExtendedAttributes>
  <StartDate>2026-03-16T09:00:00</StartDate>
  <FinishDate>2026-03-16T18:00:00</FinishDate>
  <ScheduleFromStart>1</ScheduleFromStart>
  <Tasks />
  <Resources />
  <Assignments />
</Project>`;

    const model = xmlTools.importMsProjectXml(xml);
    const exportedXml = xmlTools.exportMsProjectXml(model);
    const reparsedModel = xmlTools.importMsProjectXml(exportedXml);

    expect(reparsedModel.project.title).toBe("Metadata Title");
    expect(reparsedModel.project.company).toBe("Example Company");
    expect(reparsedModel.project.author).toBe("Example Author");
    expect(reparsedModel.project.creationDate).toBe("2026-03-16T07:00:00");
    expect(reparsedModel.project.lastSaved).toBe("2026-03-16T10:15:00");
    expect(reparsedModel.project.saveVersion).toBe(14);
    expect(reparsedModel.project.currencyCode).toBe("JPY");
    expect(reparsedModel.project.currencyDigits).toBe(0);
    expect(reparsedModel.project.currencySymbol).toBe("¥");
    expect(reparsedModel.project.currencySymbolPosition).toBe(0);
    expect(reparsedModel.project.fyStartDate).toBe("2026-04-01T00:00:00");
    expect(reparsedModel.project.fiscalYearStart).toBe(true);
    expect(reparsedModel.project.criticalSlackLimit).toBe(0);
    expect(reparsedModel.project.defaultTaskType).toBe(1);
    expect(reparsedModel.project.defaultFixedCostAccrual).toBe(2);
    expect(reparsedModel.project.defaultStandardRate).toBe("5000/h");
    expect(reparsedModel.project.defaultOvertimeRate).toBe("7000/h");
    expect(reparsedModel.project.defaultTaskEVMethod).toBe(0);
    expect(reparsedModel.project.newTaskStartDate).toBe(0);
    expect(reparsedModel.project.newTasksAreManual).toBe(false);
    expect(reparsedModel.project.newTasksEffortDriven).toBe(true);
    expect(reparsedModel.project.newTasksEstimated).toBe(true);
    expect(reparsedModel.project.actualsInSync).toBe(false);
    expect(reparsedModel.project.editableActualCosts).toBe(true);
    expect(reparsedModel.project.honorConstraints).toBe(true);
    expect(reparsedModel.project.insertedProjectsLikeSummary).toBe(true);
    expect(reparsedModel.project.multipleCriticalPaths).toBe(false);
    expect(reparsedModel.project.taskUpdatesResource).toBe(true);
    expect(reparsedModel.project.updateManuallyScheduledTasksWhenEditingLinks).toBe(false);
    expect(reparsedModel.project.outlineCodes).toHaveLength(1);
    expect(reparsedModel.project.outlineCodes[0].fieldID).toBe("188743731");
    expect(reparsedModel.project.outlineCodes[0].alias).toBe("Phase");
    expect(reparsedModel.project.outlineCodes[0].values[0].value).toBe("PLAN");
    expect(reparsedModel.project.wbsMasks).toHaveLength(1);
    expect(reparsedModel.project.wbsMasks[0].mask).toBe("A");
    expect(reparsedModel.project.extendedAttributes).toHaveLength(1);
    expect(reparsedModel.project.extendedAttributes[0].fieldName).toBe("Text1");
    expect(reparsedModel.project.extendedAttributes[0].alias).toBe("Owner");
    expect(reparsedModel.project.extendedAttributes[0].appendNewValues).toBe(true);
  });

  it("round-trips project scheduling metadata fields", () => {
    const xmlTools = bootXmlModule();
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Project xmlns="http://schemas.microsoft.com/project">
  <Name>Schedule Metadata Project</Name>
  <StatusDate>2026-03-17T09:00:00</StatusDate>
  <WeekStartDay>2</WeekStartDay>
  <WorkFormat>2</WorkFormat>
  <DurationFormat>7</DurationFormat>
  <StartDate>2026-03-16T09:00:00</StartDate>
  <FinishDate>2026-03-18T18:00:00</FinishDate>
  <ScheduleFromStart>1</ScheduleFromStart>
  <Tasks />
  <Resources />
  <Assignments />
</Project>`;

    const model = xmlTools.importMsProjectXml(xml);
    const exportedXml = xmlTools.exportMsProjectXml(model);
    const reparsedModel = xmlTools.importMsProjectXml(exportedXml);

    expect(reparsedModel.project.statusDate).toBe("2026-03-17T09:00:00");
    expect(reparsedModel.project.weekStartDay).toBe(2);
    expect(reparsedModel.project.workFormat).toBe(2);
    expect(reparsedModel.project.durationFormat).toBe(7);
  });

  it("round-trips calendar base and weekday fields", () => {
    const xmlTools = bootXmlModule();
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Project xmlns="http://schemas.microsoft.com/project">
  <Name>Calendar Detail Project</Name>
  <StartDate>2026-03-16T09:00:00</StartDate>
  <FinishDate>2026-03-16T18:00:00</FinishDate>
  <ScheduleFromStart>1</ScheduleFromStart>
  <Calendars>
    <Calendar>
      <UID>1</UID>
      <Name>Standard</Name>
      <IsBaseCalendar>1</IsBaseCalendar>
      <IsBaselineCalendar>1</IsBaselineCalendar>
    </Calendar>
    <Calendar>
      <UID>2</UID>
      <Name>Night Shift</Name>
      <IsBaseCalendar>0</IsBaseCalendar>
      <BaseCalendarUID>1</BaseCalendarUID>
      <WeekDays>
        <WeekDay>
          <DayType>7</DayType>
          <DayWorking>1</DayWorking>
          <WorkingTimes>
            <WorkingTime>
              <FromTime>18:00:00</FromTime>
              <ToTime>22:00:00</ToTime>
            </WorkingTime>
          </WorkingTimes>
        </WeekDay>
      </WeekDays>
    </Calendar>
  </Calendars>
  <Tasks />
  <Resources />
  <Assignments />
</Project>`;

    const model = xmlTools.importMsProjectXml(xml);
    const exportedXml = xmlTools.exportMsProjectXml(model);
    const reparsedModel = xmlTools.importMsProjectXml(exportedXml);

    expect(reparsedModel.calendars).toHaveLength(2);
    expect(reparsedModel.calendars[0].isBaselineCalendar).toBe(true);
    expect(reparsedModel.calendars[1].baseCalendarUID).toBe("1");
    expect(reparsedModel.calendars[1].weekDays[0].dayType).toBe(7);
    expect(reparsedModel.calendars[1].weekDays[0].dayWorking).toBe(true);
    expect(reparsedModel.calendars[1].weekDays[0].workingTimes[0].fromTime).toBe("18:00:00");
    expect(reparsedModel.calendars[1].weekDays[0].workingTimes[0].toTime).toBe("22:00:00");
  });

  it("round-trips calendar exceptions and workweeks", () => {
    const xmlTools = bootXmlModule();
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Project xmlns="http://schemas.microsoft.com/project">
  <Name>Calendar Exception Project</Name>
  <StartDate>2026-03-16T09:00:00</StartDate>
  <FinishDate>2026-03-16T18:00:00</FinishDate>
  <ScheduleFromStart>1</ScheduleFromStart>
  <Calendars>
    <Calendar>
      <UID>1</UID>
      <Name>Standard</Name>
      <IsBaseCalendar>1</IsBaseCalendar>
      <Exceptions>
        <Exception>
          <Name>Holiday</Name>
          <FromDate>2026-03-20T00:00:00</FromDate>
          <ToDate>2026-03-20T23:59:59</ToDate>
          <DayWorking>0</DayWorking>
          <WorkingTimes>
            <WorkingTime>
              <FromTime>09:00:00</FromTime>
              <ToTime>12:00:00</ToTime>
            </WorkingTime>
          </WorkingTimes>
        </Exception>
      </Exceptions>
      <WorkWeeks>
        <WorkWeek>
          <Name>Sprint 1</Name>
          <FromDate>2026-03-16T00:00:00</FromDate>
          <ToDate>2026-03-31T23:59:59</ToDate>
          <WeekDays>
            <WeekDay>
              <DayType>2</DayType>
              <DayWorking>1</DayWorking>
              <WorkingTimes>
                <WorkingTime>
                  <FromTime>09:00:00</FromTime>
                  <ToTime>17:00:00</ToTime>
                </WorkingTime>
              </WorkingTimes>
            </WeekDay>
          </WeekDays>
        </WorkWeek>
      </WorkWeeks>
    </Calendar>
  </Calendars>
  <Tasks />
  <Resources />
  <Assignments />
</Project>`;

    const model = xmlTools.importMsProjectXml(xml);
    const exportedXml = xmlTools.exportMsProjectXml(model);
    const reparsedModel = xmlTools.importMsProjectXml(exportedXml);

    expect(reparsedModel.calendars[0].exceptions[0].name).toBe("Holiday");
    expect(reparsedModel.calendars[0].exceptions[0].dayWorking).toBe(false);
    expect(reparsedModel.calendars[0].exceptions[0].workingTimes[0].fromTime).toBe("09:00:00");
    expect(reparsedModel.calendars[0].exceptions[0].workingTimes[0].toTime).toBe("12:00:00");
    expect(reparsedModel.calendars[0].workWeeks[0].name).toBe("Sprint 1");
    expect(reparsedModel.calendars[0].workWeeks[0].weekDays[0].dayType).toBe(2);
    expect(reparsedModel.calendars[0].workWeeks[0].weekDays[0].workingTimes[0].toTime).toBe("17:00:00");
  });

  it("round-trips resource and assignment practical fields", () => {
    const xmlTools = bootXmlModule();
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Project xmlns="http://schemas.microsoft.com/project">
  <Name>Resource Assignment Project</Name>
  <StartDate>2026-03-16T09:00:00</StartDate>
  <FinishDate>2026-03-17T18:00:00</FinishDate>
  <ScheduleFromStart>1</ScheduleFromStart>
  <Calendars>
    <Calendar>
      <UID>1</UID>
      <Name>Standard</Name>
      <IsBaseCalendar>1</IsBaseCalendar>
    </Calendar>
  </Calendars>
  <Tasks>
    <Task>
      <UID>1</UID>
      <ID>1</ID>
      <Name>Assigned Task</Name>
      <OutlineLevel>1</OutlineLevel>
      <OutlineNumber>1</OutlineNumber>
      <Start>2026-03-16T09:00:00</Start>
      <Finish>2026-03-17T18:00:00</Finish>
      <Duration>PT16H0M0S</Duration>
      <Milestone>0</Milestone>
      <Summary>0</Summary>
      <PercentComplete>0</PercentComplete>
    </Task>
  </Tasks>
  <Resources>
    <Resource>
      <UID>1</UID>
      <ID>1</ID>
      <Name>Worker</Name>
      <Type>1</Type>
      <WorkGroup>0</WorkGroup>
      <CalendarUID>1</CalendarUID>
      <StandardRate>8000/h</StandardRate>
      <StandardRateFormat>2</StandardRateFormat>
      <OvertimeRate>12000/h</OvertimeRate>
      <OvertimeRateFormat>2</OvertimeRateFormat>
      <CostPerUse>1500</CostPerUse>
      <Work>PT24H0M0S</Work>
      <ActualWork>PT8H0M0S</ActualWork>
      <RemainingWork>PT16H0M0S</RemainingWork>
      <Cost>180000</Cost>
      <ActualCost>60000</ActualCost>
      <RemainingCost>120000</RemainingCost>
      <PercentWorkComplete>33</PercentWorkComplete>
    </Resource>
  </Resources>
  <Assignments>
    <Assignment>
      <UID>1</UID>
      <TaskUID>1</TaskUID>
      <ResourceUID>1</ResourceUID>
      <Start>2026-03-16T09:00:00</Start>
      <Finish>2026-03-17T18:00:00</Finish>
      <StartVariance>PT1H0M0S</StartVariance>
      <FinishVariance>PT2H0M0S</FinishVariance>
      <Delay>PT3H0M0S</Delay>
      <Milestone>0</Milestone>
      <WorkContour>1</WorkContour>
      <Units>1</Units>
      <Work>PT16H0M0S</Work>
      <Cost>100000</Cost>
      <ActualCost>30000</ActualCost>
      <RemainingCost>70000</RemainingCost>
      <PercentWorkComplete>50</PercentWorkComplete>
      <OvertimeWork>PT2H0M0S</OvertimeWork>
      <ActualOvertimeWork>PT1H0M0S</ActualOvertimeWork>
      <ActualWork>PT6H0M0S</ActualWork>
      <RemainingWork>PT10H0M0S</RemainingWork>
    </Assignment>
  </Assignments>
</Project>`;

    const model = xmlTools.importMsProjectXml(xml);
    const exportedXml = xmlTools.exportMsProjectXml(model);
    const reparsedModel = xmlTools.importMsProjectXml(exportedXml);

    expect(reparsedModel.resources[0].calendarUID).toBe("1");
    expect(reparsedModel.resources[0].workGroup).toBe(0);
    expect(reparsedModel.resources[0].standardRate).toBe("8000/h");
    expect(reparsedModel.resources[0].standardRateFormat).toBe(2);
    expect(reparsedModel.resources[0].overtimeRate).toBe("12000/h");
    expect(reparsedModel.resources[0].overtimeRateFormat).toBe(2);
    expect(reparsedModel.resources[0].costPerUse).toBe(1500);
    expect(reparsedModel.resources[0].work).toBe("PT24H0M0S");
    expect(reparsedModel.resources[0].actualWork).toBe("PT8H0M0S");
    expect(reparsedModel.resources[0].remainingWork).toBe("PT16H0M0S");
    expect(reparsedModel.resources[0].cost).toBe(180000);
    expect(reparsedModel.resources[0].actualCost).toBe(60000);
    expect(reparsedModel.resources[0].remainingCost).toBe(120000);
    expect(reparsedModel.resources[0].percentWorkComplete).toBe(33);
    expect(reparsedModel.assignments[0].startVariance).toBe("PT1H0M0S");
    expect(reparsedModel.assignments[0].finishVariance).toBe("PT2H0M0S");
    expect(reparsedModel.assignments[0].delay).toBe("PT3H0M0S");
    expect(reparsedModel.assignments[0].milestone).toBe(false);
    expect(reparsedModel.assignments[0].workContour).toBe(1);
    expect(reparsedModel.assignments[0].cost).toBe(100000);
    expect(reparsedModel.assignments[0].actualCost).toBe(30000);
    expect(reparsedModel.assignments[0].remainingCost).toBe(70000);
    expect(reparsedModel.assignments[0].percentWorkComplete).toBe(50);
    expect(reparsedModel.assignments[0].overtimeWork).toBe("PT2H0M0S");
    expect(reparsedModel.assignments[0].actualOvertimeWork).toBe("PT1H0M0S");
    expect(reparsedModel.assignments[0].actualWork).toBe("PT6H0M0S");
    expect(reparsedModel.assignments[0].remainingWork).toBe("PT10H0M0S");
  });

  it("round-trips task and assignment cost fields", () => {
    const xmlTools = bootXmlModule();
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Project xmlns="http://schemas.microsoft.com/project">
  <Name>Cost Project</Name>
  <StartDate>2026-03-16T09:00:00</StartDate>
  <FinishDate>2026-03-18T18:00:00</FinishDate>
  <ScheduleFromStart>1</ScheduleFromStart>
  <Tasks>
    <Task>
      <UID>1</UID>
      <ID>1</ID>
      <Name>Cost Task</Name>
      <OutlineLevel>1</OutlineLevel>
      <OutlineNumber>1</OutlineNumber>
      <Start>2026-03-16T09:00:00</Start>
      <Finish>2026-03-18T18:00:00</Finish>
      <Duration>PT24H0M0S</Duration>
      <Work>PT24H0M0S</Work>
      <Cost>150000</Cost>
      <ActualCost>50000</ActualCost>
      <RemainingCost>100000</RemainingCost>
      <Milestone>0</Milestone>
      <Summary>0</Summary>
      <PercentComplete>0</PercentComplete>
    </Task>
  </Tasks>
  <Resources />
  <Assignments>
    <Assignment>
      <UID>1</UID>
      <TaskUID>1</TaskUID>
      <ResourceUID>-65535</ResourceUID>
      <Start>2026-03-16T09:00:00</Start>
      <Finish>2026-03-18T18:00:00</Finish>
      <Units>1</Units>
      <Work>PT24H0M0S</Work>
      <Cost>150000</Cost>
      <ActualCost>50000</ActualCost>
      <RemainingCost>100000</RemainingCost>
    </Assignment>
  </Assignments>
</Project>`;

    const model = xmlTools.importMsProjectXml(xml);
    const exportedXml = xmlTools.exportMsProjectXml(model);
    const reparsedModel = xmlTools.importMsProjectXml(exportedXml);

    expect(reparsedModel.tasks[0].cost).toBe(150000);
    expect(reparsedModel.tasks[0].actualCost).toBe(50000);
    expect(reparsedModel.tasks[0].remainingCost).toBe(100000);
    expect(reparsedModel.assignments[0].cost).toBe(150000);
    expect(reparsedModel.assignments[0].actualCost).toBe(50000);
    expect(reparsedModel.assignments[0].remainingCost).toBe(100000);
  });

  it("round-trips task deadline and variance fields", () => {
    const xmlTools = bootXmlModule();
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Project xmlns="http://schemas.microsoft.com/project">
  <Name>Task Variance Project</Name>
  <StartDate>2026-03-16T09:00:00</StartDate>
  <FinishDate>2026-03-18T18:00:00</FinishDate>
  <ScheduleFromStart>1</ScheduleFromStart>
  <Tasks>
    <Task>
      <UID>1</UID>
      <ID>1</ID>
      <Name>Variance Task</Name>
      <OutlineLevel>1</OutlineLevel>
      <OutlineNumber>1</OutlineNumber>
      <Start>2026-03-16T09:00:00</Start>
      <Finish>2026-03-18T18:00:00</Finish>
      <Deadline>2026-03-19T18:00:00</Deadline>
      <Duration>PT24H0M0S</Duration>
      <StartVariance>PT1H0M0S</StartVariance>
      <FinishVariance>PT2H0M0S</FinishVariance>
      <Milestone>0</Milestone>
      <Summary>0</Summary>
      <PercentComplete>0</PercentComplete>
    </Task>
  </Tasks>
  <Resources />
  <Assignments />
</Project>`;

    const model = xmlTools.importMsProjectXml(xml);
    const exportedXml = xmlTools.exportMsProjectXml(model);
    const reparsedModel = xmlTools.importMsProjectXml(exportedXml);

    expect(reparsedModel.tasks[0].deadline).toBe("2026-03-19T18:00:00");
    expect(reparsedModel.tasks[0].startVariance).toBe("PT1H0M0S");
    expect(reparsedModel.tasks[0].finishVariance).toBe("PT2H0M0S");
  });

  it("round-trips extended task work fields", () => {
    const xmlTools = bootXmlModule();
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Project xmlns="http://schemas.microsoft.com/project">
  <Name>Task Detail Project</Name>
  <StartDate>2026-03-16T09:00:00</StartDate>
  <FinishDate>2026-03-17T18:00:00</FinishDate>
  <ScheduleFromStart>1</ScheduleFromStart>
  <Tasks>
    <Task>
      <UID>1</UID>
      <ID>1</ID>
      <Name>Detailed Task</Name>
      <OutlineLevel>1</OutlineLevel>
      <OutlineNumber>1</OutlineNumber>
      <WBS>1</WBS>
      <Type>1</Type>
      <CalendarUID>1</CalendarUID>
      <Priority>700</Priority>
      <Start>2026-03-16T09:00:00</Start>
      <Finish>2026-03-17T18:00:00</Finish>
      <Duration>PT16H0M0S</Duration>
      <Work>PT16H0M0S</Work>
      <WorkVariance>PT1H0M0S</WorkVariance>
      <TotalSlack>PT4H0M0S</TotalSlack>
      <FreeSlack>PT2H0M0S</FreeSlack>
      <RemainingWork>PT8H0M0S</RemainingWork>
      <ActualWork>PT8H0M0S</ActualWork>
      <Milestone>0</Milestone>
      <Summary>0</Summary>
      <Critical>1</Critical>
      <PercentComplete>50</PercentComplete>
      <PercentWorkComplete>50</PercentWorkComplete>
    </Task>
  </Tasks>
  <Resources />
  <Assignments />
</Project>`;

    const model = xmlTools.importMsProjectXml(xml);
    const exportedXml = xmlTools.exportMsProjectXml(model);
    const reparsedModel = xmlTools.importMsProjectXml(exportedXml);

    expect(reparsedModel.tasks[0].wbs).toBe("1");
    expect(reparsedModel.tasks[0].type).toBe(1);
    expect(reparsedModel.tasks[0].calendarUID).toBe("1");
    expect(reparsedModel.tasks[0].priority).toBe(700);
    expect(reparsedModel.tasks[0].work).toBe("PT16H0M0S");
    expect(reparsedModel.tasks[0].workVariance).toBe("PT1H0M0S");
    expect(reparsedModel.tasks[0].totalSlack).toBe("PT4H0M0S");
    expect(reparsedModel.tasks[0].freeSlack).toBe("PT2H0M0S");
    expect(reparsedModel.tasks[0].remainingWork).toBe("PT8H0M0S");
    expect(reparsedModel.tasks[0].actualWork).toBe("PT8H0M0S");
    expect(reparsedModel.tasks[0].critical).toBe(true);
    expect(reparsedModel.tasks[0].percentWorkComplete).toBe(50);
  });

  it("round-trips the hierarchy xml sample", () => {
    const xmlTools = bootXmlModule();

    const model = xmlTools.importMsProjectXml(hierarchyXml);
    const exportedXml = xmlTools.exportMsProjectXml(model);
    const reparsedModel = xmlTools.importMsProjectXml(exportedXml);

    expect(reparsedModel.tasks).toHaveLength(3);
    expect(reparsedModel.tasks[0].summary).toBe(true);
    expect(reparsedModel.tasks[1].outlineNumber).toBe("1.1");
    expect(reparsedModel.tasks[2].notes).toBe("Second child task");
    expect(xmlTools.validateProjectModel(reparsedModel)).toHaveLength(0);
  });

  it("round-trips the dependency xml sample", () => {
    const xmlTools = bootXmlModule();

    const model = xmlTools.importMsProjectXml(dependencyXml);
    const exportedXml = xmlTools.exportMsProjectXml(model);
    const reparsedModel = xmlTools.importMsProjectXml(exportedXml);

    expect(reparsedModel.calendars).toHaveLength(1);
    expect(reparsedModel.tasks[1].predecessors).toHaveLength(1);
    expect(reparsedModel.tasks[1].predecessors[0].predecessorUid).toBe("1");
    expect(reparsedModel.assignments).toHaveLength(1);
    expect(reparsedModel.assignments[0].taskUid).toBe("2");
    expect(xmlTools.validateProjectModel(reparsedModel)).toHaveLength(0);
  });

  it("allows placeholder UID=0 and unassigned ResourceUID=-65535", () => {
    const xmlTools = bootXmlModule();
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<Project xmlns="http://schemas.microsoft.com/project">
  <Name>Placeholder Project</Name>
  <StartDate>2026-03-16T09:00:00</StartDate>
  <FinishDate>2026-03-16T18:00:00</FinishDate>
  <ScheduleFromStart>1</ScheduleFromStart>
  <Tasks>
    <Task>
      <UID>0</UID>
      <ID>0</ID>
      <Name></Name>
      <OutlineLevel>0</OutlineLevel>
      <OutlineNumber></OutlineNumber>
      <Start>2026-03-16T09:00:00</Start>
      <Finish>2026-03-16T18:00:00</Finish>
      <Duration>PT8H0M0S</Duration>
      <Milestone>0</Milestone>
      <Summary>0</Summary>
      <PercentComplete>0</PercentComplete>
    </Task>
  </Tasks>
  <Resources>
    <Resource>
      <UID>0</UID>
      <ID>0</ID>
      <Name></Name>
      <Type>1</Type>
    </Resource>
  </Resources>
  <Assignments>
    <Assignment>
      <UID>1</UID>
      <TaskUID>0</TaskUID>
      <ResourceUID>-65535</ResourceUID>
      <Start>2026-03-16T09:00:00</Start>
      <Finish>2026-03-16T18:00:00</Finish>
      <Units>1</Units>
      <Work>PT8H0M0S</Work>
    </Assignment>
  </Assignments>
</Project>`;

    const model = xmlTools.importMsProjectXml(xml);
    const issues = xmlTools.validateProjectModel(model);

    expect(issues.some((issue) => issue.message.includes("OutlineLevel"))).toBe(false);
    expect(issues.some((issue) => issue.message.includes("ResourceUID が既存 Resource"))).toBe(false);
    expect(issues.some((issue) => issue.message.includes("Resource Name が空"))).toBe(false);
  });
});
