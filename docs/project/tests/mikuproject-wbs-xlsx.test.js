// @vitest-environment jsdom

import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const typesCode = readFileSync(
  path.resolve(__dirname, "../src/mikuproject/js/types.js"),
  "utf8"
);
const excelIoCode = readFileSync(
  path.resolve(__dirname, "../src/mikuproject/js/excel-io.js"),
  "utf8"
);
const msProjectXmlCode = readFileSync(
  path.resolve(__dirname, "../src/mikuproject/js/msproject-xml.js"),
  "utf8"
);
const wbsXlsxCode = readFileSync(
  path.resolve(__dirname, "../src/mikuproject/js/wbs-xlsx.js"),
  "utf8"
);

function bootModules() {
  new Function(`${typesCode}\n${excelIoCode}\n${msProjectXmlCode}\n${wbsXlsxCode}`)();
  return {
    excelIo: globalThis.__mikuprojectExcelIo,
    xml: globalThis.__mikuprojectXml,
    wbsXlsx: globalThis.__mikuprojectWbsXlsx
  };
}

function findRowIndexByCellValue(sheet, value, columnIndex = 0) {
  return sheet.rows.findIndex((row) => row.cells[columnIndex]?.value === value);
}

function findRowIndexByPredicate(sheet, predicate) {
  return sheet.rows.findIndex((row) => predicate(row.cells));
}

describe("mikuproject wbs xlsx", () => {
  it("collects holiday dates from calendar exceptions", () => {
    const { xml, wbsXlsx } = bootModules();
    const model = xml.importMsProjectXml(xml.SAMPLE_XML);

    expect(wbsXlsx.collectWbsHolidayDates(model)).toEqual(["2026-03-20"]);
  });

  it("exports a dedicated WBS workbook from ProjectModel", () => {
    const { xml, wbsXlsx } = bootModules();
    const model = xml.importMsProjectXml(xml.SAMPLE_XML);

    const workbook = wbsXlsx.exportWbsWorkbook(model);
    const sheet = workbook.sheets[0];

    expect(workbook.sheets.map((item) => item.name)).toEqual(["WBS"]);
    expect(sheet.columns[2].width).toBe(12);
    expect(sheet.columns[3].width).toBe(10);
    expect(sheet.columns[4].width).toBe(10);
    expect(sheet.columns[5].width).toBe(42);
    expect(sheet.columns[6].width).toBe(20);
    expect(sheet.columns[7].width).toBe(18);
    expect(sheet.columns[8].width).toBe(12);
    expect(sheet.columns[14].width).toBe(16);
    expect(sheet.columns[15].width).toBe(12);
    expect(sheet.columns[16].width).toBe(20);
    expect(sheet.columns[17].width).toBe(18);
    expect(sheet.mergedRanges).toContain("A1:AI1");
    expect(sheet.mergedRanges).toContain("A2:AI2");
    expect(sheet.mergedRanges).toContain("F3:G3");
    expect(sheet.mergedRanges).toContain("F12:G12");
    expect(sheet.rows[0].cells[0].value).toBe("WBS");
    expect(sheet.rows[1].cells[0].value).toBe("Sample Project");
    const projectInfoHeaderIndex = findRowIndexByCellValue(sheet, "プロジェクト", 5);
    expect(projectInfoHeaderIndex).toBe(2);
    expect(sheet.rows[projectInfoHeaderIndex + 1].cells[5].value).toBe("題名");
    expect(sheet.rows[projectInfoHeaderIndex + 1].cells[6].value).toBe("Sample Project ...");
    expect(sheet.rows[projectInfoHeaderIndex + 2].cells[5].value).toBe("カレンダ");
    expect(sheet.rows[projectInfoHeaderIndex + 2].cells[6].value).toBe("1 Standard");
    expect(sheet.rows[projectInfoHeaderIndex + 3].cells[5].value).toBe("基準");
    expect(sheet.rows[projectInfoHeaderIndex + 3].cells[6].value).toBe("開始基準");
    expect(sheet.rows[projectInfoHeaderIndex + 4].cells[5].value).toBe("開始日");
    expect(sheet.rows[projectInfoHeaderIndex + 4].cells[6].value).toBe("2026-03-16");
    expect(sheet.rows[projectInfoHeaderIndex + 5].cells[5].value).toBe("終了日");
    expect(sheet.rows[projectInfoHeaderIndex + 5].cells[6].value).toBe("2026-03-31");
    expect(sheet.rows[projectInfoHeaderIndex + 6].cells[5].value).toBe("現在日");
    expect(sheet.rows[projectInfoHeaderIndex + 6].cells[6].value).toBe("2026-03-16");
    expect(sheet.rows[projectInfoHeaderIndex + 7].cells[5].value).toBe("祝日");
    expect(sheet.rows[projectInfoHeaderIndex + 7].cells[6].value).toBe(0);
    expect(sheet.rows[projectInfoHeaderIndex + 8].height).toBe(28);
    expect(sheet.rows[projectInfoHeaderIndex + 8].cells[5].value).toBeUndefined();
    const summaryHeaderIndex = findRowIndexByCellValue(sheet, "サマリ", 5);
    expect(summaryHeaderIndex).toBe(11);
    expect(sheet.rows[summaryHeaderIndex].height).toBe(24);
    expect(sheet.rows[summaryHeaderIndex].cells[5].fillColor).toBe("#E1EDF8");
    expect(sheet.rows[summaryHeaderIndex + 1].cells[5].value).toBe("表示日");
    expect(sheet.rows[summaryHeaderIndex + 1].cells[6].value).toBe(16);
    expect(sheet.rows[summaryHeaderIndex + 1].cells[5].horizontalAlign).toBe("right");
    expect(sheet.rows[summaryHeaderIndex + 1].cells[6].horizontalAlign).toBe("center");
    expect(sheet.rows[summaryHeaderIndex + 1].cells[6].bold).toBe(true);
    expect(sheet.rows[projectInfoHeaderIndex + 1].cells[6].horizontalAlign).toBe("left");
    expect(sheet.rows[projectInfoHeaderIndex + 4].cells[6].horizontalAlign).toBe("left");
    expect(sheet.rows[summaryHeaderIndex + 3].cells[5].value).toBe("営業日");
    expect(sheet.rows[summaryHeaderIndex + 3].cells[6].value).toBe(12);
    expect(sheet.rows[summaryHeaderIndex + 4].cells[5].value).toBe("前日数");
    expect(sheet.rows[summaryHeaderIndex + 4].cells[6].value).toBe("-");
    expect(sheet.rows[summaryHeaderIndex + 5].cells[5].value).toBe("後日数");
    expect(sheet.rows[summaryHeaderIndex + 5].cells[6].value).toBe("-");
    expect(sheet.rows[summaryHeaderIndex + 6].cells[5].value).toBe("表示");
    expect(sheet.rows[summaryHeaderIndex + 6].cells[6].value).toBe("暦日");
    expect(sheet.rows[summaryHeaderIndex + 7].cells[5].value).toBe("進捗");
    expect(sheet.rows[summaryHeaderIndex + 7].cells[6].value).toBe("暦日");
    expect(sheet.rows[summaryHeaderIndex + 12].cells[5].value).toBe("基準日");
    expect(sheet.rows[summaryHeaderIndex + 12].cells[6].value).toBe("2026-03-16");
    const taskViewIndex = findRowIndexByCellValue(sheet, "タスク表", 5);
    const weekRowIndex = findRowIndexByCellValue(sheet, "週", 5);
    const baseDateRowIndex = findRowIndexByPredicate(
      sheet,
      (cells) => cells[5]?.value === "基準日" && cells.some((cell) => cell.value === "▼基準日")
    );
    const headerRowIndex = findRowIndexByCellValue(sheet, "UID");
    expect(taskViewIndex).toBe(24);
    expect(weekRowIndex).toBe(25);
    expect(baseDateRowIndex).toBe(26);
    expect(headerRowIndex).toBe(27);
    expect(sheet.rows[weekRowIndex].height).toBe(24);
    expect(sheet.rows[baseDateRowIndex].height).toBe(24);
    expect(sheet.rows[taskViewIndex].cells[5].fillColor).toBe("#E6F1FB");
    expect(sheet.rows[taskViewIndex].cells[6].value).toBe("基準日 2026-03-16");
    expect(sheet.rows[taskViewIndex].cells[8].fillColor).toBe("#E6F1FB");
    expect(sheet.rows[weekRowIndex].cells[5].fillColor).toBe("#E3EEF9");
    expect(sheet.rows[weekRowIndex].cells[6].fillColor).toBe("#E3EEF9");
    expect(sheet.rows[weekRowIndex].cells[19].value).toBe("週 03/16");
    expect(sheet.rows[baseDateRowIndex].cells[19].value).toBe("▼基準日");
    expect(sheet.rows[baseDateRowIndex].cells[6].fillColor).toBe("#FFEFC2");
    expect(sheet.rows[baseDateRowIndex].cells[20].fillColor).toBe("#FFF8E1");
    expect(sheet.rows[baseDateRowIndex].cells[21].fillColor).toBe("#FFF8E1");
    expect(sheet.rows[headerRowIndex].cells.slice(0, 18).map((cell) => cell.value)).toEqual([
      "UID",
      "ID",
      "WBS",
      "種別",
      "階層",
      "名称",
      "開始",
      "終了",
      "期間",
      "進捗",
      "作業進捗",
      "マイル",
      "サマリ",
      "クリティカル",
      "担当",
      "カレンダ",
      "リソース",
      "先行"
    ]);
    expect(sheet.rows[headerRowIndex].cells[18].fillColor).toBe("#D9E2EA");
    expect(sheet.rows[headerRowIndex].cells.slice(19).map((cell) => cell.value)).toEqual([
      "[03/16 Mon *]",
      "03/17 Tue",
      "03/18 Wed",
      "03/19 Thu",
      "03/20 Fri",
      "03/21 Sat",
      "03/22 Sun",
      "03/23 Mon",
      "03/24 Tue",
      "03/25 Wed",
      "03/26 Thu",
      "03/27 Fri",
      "03/28 Sat",
      "03/29 Sun",
      "03/30 Mon",
      "03/31 Tue"
    ]);
    expect(sheet.rows[headerRowIndex].cells[0].fillColor).toBe("#E1EDF8");
    expect(sheet.rows[headerRowIndex].cells[2].fillColor).toBe("#E6F0DF");
    expect(sheet.rows[headerRowIndex].cells[5].horizontalAlign).toBe("left");
    expect(sheet.rows[headerRowIndex].cells[6].fillColor).toBe("#FDE7D3");
    expect(sheet.rows[headerRowIndex].cells[9].fillColor).toBe("#FBE4EC");
    expect(sheet.rows[headerRowIndex].cells[14].fillColor).toBe("#E2F1EF");
    expect(sheet.rows[headerRowIndex].cells[19].fillColor).toBe("#FFE6A7");
    const firstTaskRow = sheet.rows[headerRowIndex + 1];
    const secondTaskRow = sheet.rows[headerRowIndex + 2];
    const thirdTaskRow = sheet.rows[headerRowIndex + 3];
    expect(firstTaskRow.cells[3].value).toBe("フェーズ");
    expect(firstTaskRow.cells[3].fillColor).toBe("#EEF7E8");
    expect(firstTaskRow.cells[0].fillColor).toBe("#EEF7E8");
    expect(firstTaskRow.cells[5].bold).toBe(true);
    expect(firstTaskRow.cells[14].value).toBe("-");
    expect(firstTaskRow.cells[14].fillColor).toBe("#F5F7FA");
    expect(firstTaskRow.cells[14].horizontalAlign).toBe("center");
    expect(firstTaskRow.cells[16].value).toBe("-");
    expect(firstTaskRow.cells[17].value).toBe("-");
    expect(firstTaskRow.cells[9].value).toBe(" 50% [#####-----]");
    expect(firstTaskRow.cells[10].value).toBe(" 50% [#####-----]");
    expect(firstTaskRow.cells[12].value).toBe("Sum");
    expect(firstTaskRow.cells[6].value).toBe("2026-03-16");
    expect(firstTaskRow.cells[7].value).toBe("2026-03-20");
    expect(firstTaskRow.cells[8].value).toBe("5日");
    expect(firstTaskRow.cells[19].value).toBe("━");
    expect(firstTaskRow.cells[20].value).toBe("━");
    expect(secondTaskRow.cells[3].value).toBe("タスク");
    expect(secondTaskRow.cells[3].fillColor).toBe("#EEF2F6");
    expect(secondTaskRow.cells[0].fillColor).toBe("#F7F9FC");
    expect(firstTaskRow.cells[5].value).toBe("> Project Summary");
    expect(secondTaskRow.cells[5].value).toBe("  - Design");
    expect(secondTaskRow.cells[5].fillColor).toBe("#FBFCFE");
    expect(secondTaskRow.cells[6].fillColor).toBe("#FCFAF7");
    expect(secondTaskRow.cells[14].value).toBe("Miku");
    expect(secondTaskRow.cells[14].fillColor).toBe("#F8FBFB");
    expect(secondTaskRow.cells[15].value).toBe("1 Standard");
    expect(secondTaskRow.cells[16].value).toBe("Miku");
    expect(secondTaskRow.cells[6].value).toBe("2026-03-16");
    expect(secondTaskRow.cells[7].value).toBe("2026-03-17");
    expect(secondTaskRow.cells[8].value).toBe("2日");
    expect(secondTaskRow.cells[9].value).toBe("100% [##########]");
    expect(secondTaskRow.cells[9].fillColor).toBe("#FCF8FB");
    expect(secondTaskRow.cells[10].value).toBe("100% [##########]");
    expect(secondTaskRow.cells[19].value).toBe("■");
    expect(secondTaskRow.cells[19].fillColor).toBe("#D89A2B");
    expect(secondTaskRow.cells[20].value).toBe("■");
    expect(secondTaskRow.cells[20].fillColor).toBe("#5BAE9C");
    expect(thirdTaskRow.cells[5].value).toBe("  - Implementation");
    expect(thirdTaskRow.cells[17].value).toBe("Design");
    expect(thirdTaskRow.cells[6].value).toBe("2026-03-18");
    expect(thirdTaskRow.cells[7].value).toBe("2026-03-20");
    expect(thirdTaskRow.cells[8].value).toBe("3日");
    expect(thirdTaskRow.cells[9].value).toBe("  0% [----------]");
    expect(thirdTaskRow.cells[10].value).toBe("  0% [----------]");
    expect(thirdTaskRow.cells[23].value).toBe("■");
    const legendHeaderIndex = findRowIndexByCellValue(sheet, "凡例", 5);
    expect(legendHeaderIndex).toBe(headerRowIndex + 5);
    expect(sheet.rows[legendHeaderIndex - 1].height).toBe(28);
    expect(sheet.rows[legendHeaderIndex - 1].cells[5].value).toBeUndefined();
    expect(sheet.rows[legendHeaderIndex].height).toBe(24);
    expect(sheet.rows[legendHeaderIndex + 1].height).toBe(24);
    expect(sheet.rows[legendHeaderIndex + 1].cells[5].value).toBe("進捗済み");
    expect(sheet.rows[legendHeaderIndex + 1].cells[5].bold).toBe(true);
    expect(sheet.rows[legendHeaderIndex + 1].cells[5].fillColor).toBe("#5BAE9C");
    expect(sheet.rows[legendHeaderIndex + 7].cells[5].value).toBe("━:フェーズ");
    expect(sheet.rows[legendHeaderIndex + 10].cells[5].fillColor).toBe("#FBE4EC");
    expect(sheet.rows[legendHeaderIndex + 11].cells[5].fillColor).toBe("#F7EAF0");
    expect(sheet.rows[legendHeaderIndex + 12].cells[5].fillColor).toBe("#F3E1E9");
    expect(sheet.rows[legendHeaderIndex + 10].cells[5].value).toBe("Mil:マイルストーン");
    expect(sheet.rows[legendHeaderIndex + 11].cells[5].value).toBe("Sum:サマリ");
    expect(sheet.rows[legendHeaderIndex + 12].cells[5].value).toBe("Crit:クリティカル");
    expect(sheet.rows[legendHeaderIndex + 13].cells[5].value).toBe("-:未設定");
  });

  it("can generate a real xlsx from the dedicated WBS workbook", () => {
    const { excelIo, xml, wbsXlsx } = bootModules();
    const codec = new excelIo.XlsxWorkbookCodec();
    const model = xml.importMsProjectXml(xml.SAMPLE_XML);

    const workbook = wbsXlsx.exportWbsWorkbook(model);
    const bytes = codec.exportWorkbook(workbook);
    const entries = codec.listEntries(bytes);
    const sheetXml = new TextDecoder().decode(codec.unpackEntries(bytes)["xl/worksheets/sheet1.xml"]);

    expect(entries).toContain("xl/workbook.xml");
    expect(entries).toContain("xl/worksheets/sheet1.xml");
    expect(sheetXml).toContain('ref="A1:AI1"');
    expect(sheetXml).toContain('ref="A2:AI2"');
    expect(sheetXml).toContain('ref="F3:G3"');
    expect(sheetXml).toContain('ref="F12:G12"');
    expect(sheetXml).toContain('ref="T26:Z26"');
    expect(sheetXml).not.toContain("<pane");
    expect(sheetXml).toContain("凡例");
    expect(sheetXml).toContain("プロジェクト");
    expect(sheetXml).toContain("週 03/16");
    expect(sheetXml).toContain("タスク表");
    expect(sheetXml).toContain("基準日 2026-03-16");
    expect(sheetXml).toContain("Sample Project");
    expect(sheetXml).toContain("階層");
    expect(sheetXml).toContain("[03/16 Mon *]");
  });

  it("marks weekend date-band cells with weekend fill", () => {
    const { xml, wbsXlsx } = bootModules();
    const model = xml.importMsProjectXml(xml.SAMPLE_XML);

    model.project.startDate = "2026-03-20T09:00:00";
    model.project.finishDate = "2026-03-23T18:00:00";
    model.project.currentDate = "2026-03-21T09:00:00";

    const workbook = wbsXlsx.exportWbsWorkbook(model);
    const sheet = workbook.sheets[0];

    const headerRowIndex = findRowIndexByCellValue(sheet, "UID");
    const baseDateRowIndex = findRowIndexByPredicate(
      sheet,
      (cells) => cells[5]?.value === "基準日" && cells.some((cell) => cell.value === "▼基準日")
    );
    expect(sheet.rows[headerRowIndex].cells.slice(19).map((cell) => cell.value)).toEqual([
      "03/20 Fri",
      "[03/21 Sat *]",
      "03/22 Sun",
      "03/23 Mon"
    ]);
    const baseDateMarkerIndex = sheet.rows[baseDateRowIndex].cells.findIndex((cell) => cell.value === "▼基準日");
    expect(baseDateMarkerIndex).toBe(20);
    expect(sheet.rows[headerRowIndex].cells[baseDateMarkerIndex].fillColor).toBe("#FFE6A7");
    expect(sheet.rows[headerRowIndex].cells[baseDateMarkerIndex + 1].fillColor).toBe("#F1F1F1");
  });

  it("marks week-start date-band cells with week-start fill", () => {
    const { xml, wbsXlsx } = bootModules();
    const model = xml.importMsProjectXml(xml.SAMPLE_XML);

    model.project.startDate = "2026-03-16T09:00:00";
    model.project.finishDate = "2026-03-23T18:00:00";
    model.project.currentDate = "2026-03-18T09:00:00";

    const workbook = wbsXlsx.exportWbsWorkbook(model);
    const sheet = workbook.sheets[0];

    const headerRowIndex = findRowIndexByCellValue(sheet, "UID");
    expect(sheet.rows[headerRowIndex].cells[26].value).toBe("03/23 Mon");
    expect(sheet.rows[headerRowIndex].cells[26].fillColor).toBe("#E3EEF9");
    expect(sheet.rows[headerRowIndex + 2].cells[26].fillColor).toBe("#E3EEF9");
  });

  it("emphasizes week labels that contain a month boundary", () => {
    const { xml, wbsXlsx } = bootModules();
    const model = xml.importMsProjectXml(xml.SAMPLE_XML);

    model.project.startDate = "2026-03-30T09:00:00";
    model.project.finishDate = "2026-04-03T18:00:00";
    model.project.currentDate = "2026-04-01T09:00:00";

    const workbook = wbsXlsx.exportWbsWorkbook(model);
    const sheet = workbook.sheets[0];

    const weekRowIndex = findRowIndexByCellValue(sheet, "週", 5);
    expect(sheet.mergedRanges).toContain("T26:X26");
    expect(sheet.rows[weekRowIndex].cells[19].value).toBe("週 03/30 / 04");
    expect(sheet.rows[weekRowIndex].cells[19].fillColor).toBe("#D6E7F8");
  });

  it("emphasizes month-start date headers", () => {
    const { xml, wbsXlsx } = bootModules();
    const model = xml.importMsProjectXml(xml.SAMPLE_XML);

    model.project.startDate = "2026-03-30T09:00:00";
    model.project.finishDate = "2026-04-03T18:00:00";
    model.project.currentDate = "2026-03-31T09:00:00";

    const workbook = wbsXlsx.exportWbsWorkbook(model);
    const sheet = workbook.sheets[0];

    const headerRowIndex = findRowIndexByCellValue(sheet, "UID");
    expect(sheet.rows[headerRowIndex].cells[21].value).toBe("04/01 Wed");
    expect(sheet.rows[headerRowIndex].cells[21].fillColor).toBe("#DCEAF7");
  });

  it("renders milestone bands with a diamond marker", () => {
    const { xml, wbsXlsx } = bootModules();
    const model = xml.importMsProjectXml(xml.SAMPLE_XML);

    model.tasks[2].milestone = true;
    model.tasks[2].finish = model.tasks[2].start;

    const workbook = wbsXlsx.exportWbsWorkbook(model);
    const sheet = workbook.sheets[0];

    const headerRowIndex = findRowIndexByCellValue(sheet, "UID");
    const milestoneRow = sheet.rows[headerRowIndex + 3];
    expect(milestoneRow.cells[3].value).toBe("マイル");
    expect(milestoneRow.cells[3].fillColor).toBe("#FFF4E0");
    expect(milestoneRow.cells[11].value).toBe("Mil");
    expect(milestoneRow.cells[21].value).toBe("◆");
  });

  it("renders critical flags with an exclamation marker", () => {
    const { xml, wbsXlsx } = bootModules();
    const model = xml.importMsProjectXml(xml.SAMPLE_XML);

    model.tasks[1].critical = true;

    const workbook = wbsXlsx.exportWbsWorkbook(model);
    const sheet = workbook.sheets[0];

    const headerRowIndex = findRowIndexByCellValue(sheet, "UID");
    expect(sheet.rows[headerRowIndex + 2].cells[13].value).toBe("Crit");
  });

  it("marks configured holidays in the date band", () => {
    const { xml, wbsXlsx } = bootModules();
    const model = xml.importMsProjectXml(xml.SAMPLE_XML);

    const workbook = wbsXlsx.exportWbsWorkbook(model, {
      holidayDates: ["2026-03-20"]
    });
    const sheet = workbook.sheets[0];

    const projectInfoHeaderIndex = findRowIndexByCellValue(sheet, "プロジェクト", 5);
    expect(sheet.rows[projectInfoHeaderIndex + 7].cells[6].value).toBe(1);
    const headerRowIndex = findRowIndexByCellValue(sheet, "UID");
    expect(sheet.rows[headerRowIndex].cells[23].value).toBe("03/20 Fri");
    expect(sheet.rows[headerRowIndex].cells[23].fillColor).toBe("#FCE4EC");
    expect(sheet.rows[headerRowIndex + 2].cells[23].value).toBe("");
    expect(sheet.rows[headerRowIndex + 2].cells[23].fillColor).toBe("#FCE4EC");
  });

  it("can limit the displayed date band around base date", () => {
    const { xml, wbsXlsx } = bootModules();
    const model = xml.importMsProjectXml(xml.SAMPLE_XML);

    const workbook = wbsXlsx.exportWbsWorkbook(model, {
      displayDaysBeforeBaseDate: 1,
      displayDaysAfterBaseDate: 2
    });
    const sheet = workbook.sheets[0];
    const summaryHeaderIndex = findRowIndexByCellValue(sheet, "サマリ", 5);
    const headerRowIndex = findRowIndexByCellValue(sheet, "UID");

    expect(sheet.rows[headerRowIndex].cells.slice(19).map((cell) => cell.value)).toEqual([
      "[03/16 Mon *]",
      "03/17 Tue",
      "03/18 Wed"
    ]);
    expect(sheet.rows[summaryHeaderIndex + 4].cells[6].value).toBe(1);
    expect(sheet.rows[summaryHeaderIndex + 5].cells[6].value).toBe(2);
    expect(sheet.rows[summaryHeaderIndex + 6].cells[6].value).toBe("暦日");
    expect(sheet.rows[summaryHeaderIndex + 7].cells[6].value).toBe("暦日");
  });

  it("can limit the displayed date band around base date using business days", () => {
    const { xml, wbsXlsx } = bootModules();
    const model = xml.importMsProjectXml(xml.SAMPLE_XML);

    model.project.startDate = "2026-03-16T09:00:00";
    model.project.finishDate = "2026-03-24T18:00:00";
    model.project.currentDate = "2026-03-18T09:00:00";

    const workbook = wbsXlsx.exportWbsWorkbook(model, {
      holidayDates: ["2026-03-20"],
      displayDaysBeforeBaseDate: 1,
      displayDaysAfterBaseDate: 2,
      useBusinessDaysForDisplayRange: true
    });
    const sheet = workbook.sheets[0];
    const summaryHeaderIndex = findRowIndexByCellValue(sheet, "サマリ", 5);
    const headerRowIndex = findRowIndexByCellValue(sheet, "UID");

    expect(sheet.rows[headerRowIndex].cells.slice(19).map((cell) => cell.value)).toEqual([
      "03/17 Tue",
      "[03/18 Wed *]",
      "03/19 Thu",
      "03/20 Fri",
      "03/21 Sat",
      "03/22 Sun",
      "03/23 Mon"
    ]);
    expect(sheet.rows[summaryHeaderIndex + 3].cells[6].value).toBe(4);
    expect(sheet.rows[summaryHeaderIndex + 6].cells[6].value).toBe("営業日");
    expect(sheet.rows[summaryHeaderIndex + 7].cells[6].value).toBe("暦日");
  });

  it("can calculate progress band using business days", () => {
    const { xml, wbsXlsx } = bootModules();
    const model = xml.importMsProjectXml(xml.SAMPLE_XML);

    model.project.currentDate = "2026-03-25T09:00:00";
    model.tasks[1].start = "2026-03-16T09:00:00";
    model.tasks[1].finish = "2026-03-22T18:00:00";
    model.tasks[1].percentComplete = 50;

    const workbook = wbsXlsx.exportWbsWorkbook(model, {
      holidayDates: ["2026-03-20"],
      useBusinessDaysForProgressBand: true
    });
    const sheet = workbook.sheets[0];
    const summaryHeaderIndex = findRowIndexByCellValue(sheet, "サマリ", 5);
    const headerRowIndex = findRowIndexByCellValue(sheet, "UID");
    const designRow = sheet.rows[headerRowIndex + 2];

    expect(sheet.rows[summaryHeaderIndex + 7].cells[6].value).toBe("営業日");
    expect(designRow.cells[8].value).toBe("4営業日");
    expect(designRow.cells[19].fillColor).toBe("#5BAE9C");
    expect(designRow.cells[20].fillColor).toBe("#5BAE9C");
    expect(designRow.cells[21].fillColor).toBe("#9FD5C9");
    expect(designRow.cells[23].fillColor).toBe("#9FD5C9");
    expect(designRow.cells[24].fillColor).toBe("#9FD5C9");
    expect(designRow.cells[25].fillColor).toBe("#9FD5C9");
  });

  it("truncates long owner, resources, and predecessors labels for wbs display", () => {
    const { xml, wbsXlsx } = bootModules();
    const model = xml.importMsProjectXml(xml.SAMPLE_XML);

    model.project.title = "Sample Project Title Very Long";
    model.resources[0].name = "Resource Alpha Very Long";
    model.calendars[0].name = "Standard Calendar Very Long";
    model.tasks[2].predecessors = [{ predecessorUid: "1", type: 1, lag: "0" }];

    const workbook = wbsXlsx.exportWbsWorkbook(model);
    const sheet = workbook.sheets[0];
    const projectInfoHeaderIndex = findRowIndexByCellValue(sheet, "プロジェクト", 5);
    const headerRowIndex = findRowIndexByCellValue(sheet, "UID");
    const secondTaskRow = sheet.rows[headerRowIndex + 2];
    const thirdTaskRow = sheet.rows[headerRowIndex + 3];

    expect(sheet.rows[projectInfoHeaderIndex + 1].cells[6].value).toBe("Sample Project ...");
    expect(secondTaskRow.cells[14].value).toBe("Resource Al...");
    expect(secondTaskRow.cells[15].value).toBe("1 Standa...");
    expect(secondTaskRow.cells[16].value).toBe("Resource Alpha ...");
    expect(thirdTaskRow.cells[17].value).toBe("Project Summary");
  });
});
