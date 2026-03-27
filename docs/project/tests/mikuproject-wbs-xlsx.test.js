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
    expect(sheet.mergedRanges).toEqual(["A1:X1", "A2:X2", "A3:X3", "A4:X4", "T8:X8"]);
    expect(sheet.rows[0].cells[0].value).toBe("WBS");
    expect(sheet.rows[1].cells[0].value).toBe("Sample Project");
    expect(String(sheet.rows[2].cells[0].value)).toContain("Title=Sample Project Title");
    expect(String(sheet.rows[3].cells[0].value)).toContain("Start=2026-03-16T09:00:00");
    expect(String(sheet.rows[3].cells[0].value)).toContain("Holidays=0");
    expect(sheet.rows[4].cells[0].value).toBe("DisplayDays");
    expect(sheet.rows[4].cells[1].value).toBe(5);
    expect(sheet.rows[4].cells[0].fillColor).toBe("#FDE7D3");
    expect(sheet.rows[4].cells[1].fillColor).toBe("#FDE7D3");
    expect(sheet.rows[4].cells[2].value).toBe("DisplayWeeks");
    expect(sheet.rows[4].cells[3].value).toBe(1);
    expect(sheet.rows[4].cells[2].fillColor).toBe("#FDE7D3");
    expect(sheet.rows[4].cells[3].fillColor).toBe("#FDE7D3");
    expect(sheet.rows[4].cells[4].value).toBe("Tasks");
    expect(sheet.rows[4].cells[5].value).toBe(3);
    expect(sheet.rows[4].cells[4].fillColor).toBe("#E2F1EF");
    expect(sheet.rows[4].cells[5].fillColor).toBe("#E2F1EF");
    expect(sheet.rows[4].cells[6].value).toBe("Resources");
    expect(sheet.rows[4].cells[7].value).toBe(1);
    expect(sheet.rows[4].cells[6].fillColor).toBe("#E2F1EF");
    expect(sheet.rows[4].cells[7].fillColor).toBe("#E2F1EF");
    expect(sheet.rows[4].cells[8].value).toBe("Assignments");
    expect(sheet.rows[4].cells[9].value).toBe(2);
    expect(sheet.rows[4].cells[8].fillColor).toBe("#E2F1EF");
    expect(sheet.rows[4].cells[9].fillColor).toBe("#E2F1EF");
    expect(sheet.rows[4].cells[10].value).toBe("Calendars");
    expect(sheet.rows[4].cells[11].value).toBe(2);
    expect(sheet.rows[4].cells[10].fillColor).toBe("#E2F1EF");
    expect(sheet.rows[4].cells[11].fillColor).toBe("#E2F1EF");
    expect(sheet.rows[4].cells[12].value).toBe("BaseDate");
    expect(sheet.rows[4].cells[13].value).toBe("2026-03-16");
    expect(sheet.rows[4].cells[12].fillColor).toBe("#FDE7D3");
    expect(sheet.rows[4].cells[13].fillColor).toBe("#FDE7D3");
    expect(sheet.rows[5].cells[0].value).toBe("Legend");
    expect(sheet.rows[5].cells[1].value).toBe("進捗済み");
    expect(sheet.rows[5].cells[1].fillColor).toBe("#5BAE9C");
    expect(sheet.rows[5].cells[4].value).toBe("週頭");
    expect(sheet.rows[5].cells[4].fillColor).toBe("#E3EEF9");
    expect(sheet.rows[5].cells[6].value).toBe("祝日");
    expect(sheet.rows[5].cells[6].fillColor).toBe("#FCE4EC");
    expect(sheet.rows[5].cells[7].value).toBe("━:phase");
    expect(sheet.rows[5].cells[7].fillColor).toBe("#EEF7E8");
    expect(sheet.rows[5].cells[8].value).toBe("■:task");
    expect(sheet.rows[5].cells[8].fillColor).toBe("#9FD5C9");
    expect(sheet.rows[5].cells[9].value).toBe("◆:milestone");
    expect(sheet.rows[5].cells[9].fillColor).toBe("#FFF4E0");
    expect(sheet.rows[5].cells[10].value).toBe("M:Milestone");
    expect(sheet.rows[5].cells[10].fillColor).toBe("#FBE4EC");
    expect(sheet.rows[5].cells[11].value).toBe("S:Summary");
    expect(sheet.rows[5].cells[11].fillColor).toBe("#FBE4EC");
    expect(sheet.rows[5].cells[12].value).toBe("!:Critical");
    expect(sheet.rows[5].cells[12].fillColor).toBe("#FBE4EC");
    expect(sheet.rows[5].cells[13].value).toBe("-:未設定");
    expect(sheet.rows[5].cells[13].fillColor).toBe("#F5F7FA");
    expect(sheet.rows[6].cells[0].value).toBe("Task View / BaseDate=2026-03-16");
    expect(sheet.rows[7].cells[19].value).toBe("Week of Mar 16");
    expect(sheet.rows[8].cells[5].value).toBe("Today");
    expect(sheet.rows[8].cells[19].value).toBe("TODAY");
    expect(sheet.rows[9].cells.slice(0, 18).map((cell) => cell.value)).toEqual([
      "UID",
      "ID",
      "WBS",
      "Kind",
      "OutlineLevel",
      "Name",
      "Start",
      "Finish",
      "Duration",
      "PercentComplete",
      "PercentWorkComplete",
      "Milestone",
      "Summary",
      "Critical",
      "Owner",
      "Calendar",
      "Resources",
      "Predecessors"
    ]);
    expect(sheet.rows[9].cells[18].fillColor).toBe("#C5D1DB");
    expect(sheet.rows[9].cells.slice(19).map((cell) => cell.value)).toEqual([
      "03/16 Mon *",
      "03/17 Tue",
      "03/18 Wed",
      "03/19 Thu",
      "03/20 Fri"
    ]);
    expect(sheet.rows[9].cells[0].fillColor).toBe("#D7E7F6");
    expect(sheet.rows[9].cells[2].fillColor).toBe("#E6F0DF");
    expect(sheet.rows[9].cells[6].fillColor).toBe("#FDE7D3");
    expect(sheet.rows[9].cells[9].fillColor).toBe("#FBE4EC");
    expect(sheet.rows[9].cells[14].fillColor).toBe("#E2F1EF");
    expect(sheet.rows[9].cells[19].fillColor).toBe("#FFE6A7");
    expect(sheet.rows[11].cells[23].fillColor).toBe("#F4F7FB");
    expect(sheet.rows[10].cells[3].value).toBe("phase");
    expect(sheet.rows[10].cells[3].fillColor).toBe("#EEF7E8");
    expect(sheet.rows[10].cells[0].fillColor).toBe("#EEF7E8");
    expect(sheet.rows[10].cells[5].bold).toBe(true);
    expect(sheet.rows[10].cells[14].value).toBe("-");
    expect(sheet.rows[10].cells[14].fillColor).toBe("#F5F7FA");
    expect(sheet.rows[10].cells[16].value).toBe("-");
    expect(sheet.rows[10].cells[16].fillColor).toBe("#F5F7FA");
    expect(sheet.rows[10].cells[17].value).toBe("-");
    expect(sheet.rows[10].cells[17].fillColor).toBe("#F5F7FA");
    expect(sheet.rows[10].cells[11].value).toBe("");
    expect(sheet.rows[10].cells[12].value).toBe("S");
    expect(sheet.rows[10].cells[13].value).toBe("");
    expect(sheet.rows[10].cells[19].value).toBe("━");
    expect(sheet.rows[10].cells[20].value).toBe("━");
    expect(sheet.rows[11].cells[3].value).toBe("task");
    expect(sheet.rows[11].cells[3].fillColor).toBe("#EEF2F6");
    expect(sheet.rows[11].cells[4].value).toBe(2);
    expect(sheet.rows[11].cells[5].value).toBe("  Design");
    expect(sheet.rows[11].cells[14].value).toBe("Miku");
    expect(sheet.rows[11].cells[15].value).toBe("1 Standard");
    expect(sheet.rows[11].cells[16].value).toBe("Miku");
    expect(sheet.rows[11].cells[11].value).toBe("");
    expect(sheet.rows[11].cells[12].value).toBe("");
    expect(sheet.rows[11].cells[13].value).toBe("");
    expect(sheet.rows[12].cells[17].value).toBe("Design");
    expect(sheet.rows[11].cells[5].bold).toBe(false);
    expect(sheet.rows[11].cells[18].fillColor).toBe("#C5D1DB");
    expect(sheet.rows[11].cells[19].value).toBe("■");
    expect(sheet.rows[11].cells[19].fillColor).toBe("#D89A2B");
    expect(sheet.rows[11].cells[20].value).toBe("■");
    expect(sheet.rows[11].cells[20].fillColor).toBe("#5BAE9C");
    expect(sheet.rows[11].cells[21].value).toBe("");
    expect(sheet.rows[11].cells[22].value).toBe("");
    expect(sheet.rows[12].cells[23].value).toBe("■");
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
    expect(sheetXml).toContain('ref="A1:X1"');
    expect(sheetXml).toContain('ref="A4:X4"');
    expect(sheetXml).toContain('ref="T8:X8"');
    expect(sheetXml).toContain("Legend");
    expect(sheetXml).toContain("Week of Mar 16");
    expect(sheetXml).toContain("Task View / BaseDate=2026-03-16");
    expect(sheetXml).toContain("Sample Project");
    expect(sheetXml).toContain("OutlineLevel");
    expect(sheetXml).toContain("03/16 Mon *");
  });

  it("marks weekend date-band cells with weekend fill", () => {
    const { xml, wbsXlsx } = bootModules();
    const model = xml.importMsProjectXml(xml.SAMPLE_XML);

    model.project.startDate = "2026-03-20T09:00:00";
    model.project.finishDate = "2026-03-23T18:00:00";
    model.project.currentDate = "2026-03-21T09:00:00";

    const workbook = wbsXlsx.exportWbsWorkbook(model);
    const sheet = workbook.sheets[0];

    expect(sheet.rows[9].cells.slice(19).map((cell) => cell.value)).toEqual([
      "03/20 Fri",
      "03/21 Sat *",
      "03/22 Sun",
      "03/23 Mon"
    ]);
    expect(sheet.rows[8].cells[20].value).toBe("TODAY");
    expect(sheet.rows[9].cells[20].fillColor).toBe("#FFE6A7");
    expect(sheet.rows[9].cells[21].fillColor).toBe("#F1F1F1");
  });

  it("marks week-start date-band cells with week-start fill", () => {
    const { xml, wbsXlsx } = bootModules();
    const model = xml.importMsProjectXml(xml.SAMPLE_XML);

    model.project.startDate = "2026-03-16T09:00:00";
    model.project.finishDate = "2026-03-23T18:00:00";
    model.project.currentDate = "2026-03-18T09:00:00";

    const workbook = wbsXlsx.exportWbsWorkbook(model);
    const sheet = workbook.sheets[0];

    expect(sheet.rows[9].cells[26].value).toBe("03/23 Mon");
    expect(sheet.rows[9].cells[26].fillColor).toBe("#E3EEF9");
    expect(sheet.rows[11].cells[26].fillColor).toBe("#E3EEF9");
  });

  it("emphasizes week labels that contain a month boundary", () => {
    const { xml, wbsXlsx } = bootModules();
    const model = xml.importMsProjectXml(xml.SAMPLE_XML);

    model.project.startDate = "2026-03-30T09:00:00";
    model.project.finishDate = "2026-04-03T18:00:00";
    model.project.currentDate = "2026-04-01T09:00:00";

    const workbook = wbsXlsx.exportWbsWorkbook(model);
    const sheet = workbook.sheets[0];

    expect(sheet.mergedRanges).toContain("T8:X8");
    expect(sheet.rows[7].cells[19].value).toBe("Week of Mar 30 / Apr");
    expect(sheet.rows[7].cells[19].fillColor).toBe("#D6E7F8");
  });

  it("emphasizes month-start date headers", () => {
    const { xml, wbsXlsx } = bootModules();
    const model = xml.importMsProjectXml(xml.SAMPLE_XML);

    model.project.startDate = "2026-03-30T09:00:00";
    model.project.finishDate = "2026-04-03T18:00:00";
    model.project.currentDate = "2026-03-31T09:00:00";

    const workbook = wbsXlsx.exportWbsWorkbook(model);
    const sheet = workbook.sheets[0];

    expect(sheet.rows[9].cells[21].value).toBe("04/01 Wed");
    expect(sheet.rows[9].cells[21].fillColor).toBe("#DCEAF7");
  });

  it("renders milestone bands with a diamond marker", () => {
    const { xml, wbsXlsx } = bootModules();
    const model = xml.importMsProjectXml(xml.SAMPLE_XML);

    model.tasks[2].milestone = true;
    model.tasks[2].finish = model.tasks[2].start;

    const workbook = wbsXlsx.exportWbsWorkbook(model);
    const sheet = workbook.sheets[0];

    expect(sheet.rows[12].cells[3].value).toBe("milestone");
    expect(sheet.rows[12].cells[3].fillColor).toBe("#FFF4E0");
    expect(sheet.rows[12].cells[11].value).toBe("M");
    expect(sheet.rows[12].cells[21].value).toBe("◆");
  });

  it("renders critical flags with an exclamation marker", () => {
    const { xml, wbsXlsx } = bootModules();
    const model = xml.importMsProjectXml(xml.SAMPLE_XML);

    model.tasks[1].critical = true;

    const workbook = wbsXlsx.exportWbsWorkbook(model);
    const sheet = workbook.sheets[0];

    expect(sheet.rows[11].cells[13].value).toBe("!");
  });

  it("marks configured holidays in the date band", () => {
    const { xml, wbsXlsx } = bootModules();
    const model = xml.importMsProjectXml(xml.SAMPLE_XML);

    const workbook = wbsXlsx.exportWbsWorkbook(model, {
      holidayDates: ["2026-03-20"]
    });
    const sheet = workbook.sheets[0];

    expect(String(sheet.rows[3].cells[0].value)).toContain("Holidays=1");
    expect(sheet.rows[9].cells[23].value).toBe("03/20 Fri");
    expect(sheet.rows[9].cells[23].fillColor).toBe("#FCE4EC");
    expect(sheet.rows[11].cells[23].value).toBe("");
    expect(sheet.rows[11].cells[23].fillColor).toBe("#FCE4EC");
  });
});
