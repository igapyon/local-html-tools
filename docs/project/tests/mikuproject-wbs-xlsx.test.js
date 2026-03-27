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
  it("exports a dedicated WBS workbook from ProjectModel", () => {
    const { xml, wbsXlsx } = bootModules();
    const model = xml.importMsProjectXml(xml.SAMPLE_XML);

    const workbook = wbsXlsx.exportWbsWorkbook(model);
    const sheet = workbook.sheets[0];

    expect(workbook.sheets.map((item) => item.name)).toEqual(["WBS"]);
    expect(sheet.mergedRanges).toEqual(["A1:W1", "A2:W2", "A3:W3", "A4:W4"]);
    expect(sheet.rows[0].cells[0].value).toBe("WBS");
    expect(sheet.rows[1].cells[0].value).toBe("Sample Project");
    expect(String(sheet.rows[2].cells[0].value)).toContain("Title=Sample Project Title");
    expect(String(sheet.rows[3].cells[0].value)).toContain("Start=2026-03-16T09:00:00");
    expect(String(sheet.rows[3].cells[0].value)).toContain("Holidays=0");
    expect(sheet.rows[4].cells[0].value).toBe("Task View");
    expect(sheet.rows[5].cells[5].value).toBe("Today");
    expect(sheet.rows[5].cells[18].value).toBe("▼");
    expect(sheet.rows[6].cells.slice(0, 18).map((cell) => cell.value)).toEqual([
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
    expect(sheet.rows[6].cells.slice(18).map((cell) => cell.value)).toEqual([
      "03/16 Mon",
      "03/17 Tue",
      "03/18 Wed",
      "03/19 Thu",
      "03/20 Fri"
    ]);
    expect(sheet.rows[6].cells[18].fillColor).toBe("#FFE6A7");
    expect(sheet.rows[7].cells[3].value).toBe("phase");
    expect(sheet.rows[7].cells[0].fillColor).toBe("#EEF7E8");
    expect(sheet.rows[7].cells[5].bold).toBe(true);
    expect(sheet.rows[8].cells[3].value).toBe("task");
    expect(sheet.rows[8].cells[4].value).toBe(2);
    expect(sheet.rows[8].cells[5].value).toBe("  Design");
    expect(sheet.rows[8].cells[14].value).toBe("Miku");
    expect(sheet.rows[8].cells[15].value).toBe("1 Standard");
    expect(sheet.rows[8].cells[16].value).toBe("Miku");
    expect(sheet.rows[9].cells[17].value).toBe("Design");
    expect(sheet.rows[8].cells[5].bold).toBe(false);
    expect(sheet.rows[8].cells[18].value).toBe("■");
    expect(sheet.rows[8].cells[18].fillColor).toBe("#D89A2B");
    expect(sheet.rows[8].cells[19].value).toBe("■");
    expect(sheet.rows[8].cells[19].fillColor).toBe("#5BAE9C");
    expect(sheet.rows[8].cells[20].value).toBe("");
    expect(sheet.rows[8].cells[21].value).toBe("");
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
    expect(sheetXml).toContain('ref="A1:W1"');
    expect(sheetXml).toContain('ref="A4:W4"');
    expect(sheetXml).toContain("Task View");
    expect(sheetXml).toContain("Sample Project");
    expect(sheetXml).toContain("OutlineLevel");
    expect(sheetXml).toContain("03/16 Mon");
  });

  it("marks weekend date-band cells with weekend fill", () => {
    const { xml, wbsXlsx } = bootModules();
    const model = xml.importMsProjectXml(xml.SAMPLE_XML);

    model.project.startDate = "2026-03-20T09:00:00";
    model.project.finishDate = "2026-03-23T18:00:00";
    model.project.currentDate = "2026-03-21T09:00:00";

    const workbook = wbsXlsx.exportWbsWorkbook(model);
    const sheet = workbook.sheets[0];

    expect(sheet.rows[6].cells.slice(18).map((cell) => cell.value)).toEqual([
      "03/20 Fri",
      "03/21 Sat",
      "03/22 Sun",
      "03/23 Mon"
    ]);
    expect(sheet.rows[5].cells[19].value).toBe("▼");
    expect(sheet.rows[6].cells[19].fillColor).toBe("#FFE6A7");
    expect(sheet.rows[6].cells[20].fillColor).toBe("#F1F1F1");
  });

  it("marks configured holidays in the date band", () => {
    const { xml, wbsXlsx } = bootModules();
    const model = xml.importMsProjectXml(xml.SAMPLE_XML);

    const workbook = wbsXlsx.exportWbsWorkbook(model, {
      holidayDates: ["2026-03-20"]
    });
    const sheet = workbook.sheets[0];

    expect(String(sheet.rows[3].cells[0].value)).toContain("Holidays=1");
    expect(sheet.rows[6].cells[22].value).toBe("03/20 Fri");
    expect(sheet.rows[6].cells[22].fillColor).toBe("#FCE4EC");
    expect(sheet.rows[8].cells[22].value).toBe("");
    expect(sheet.rows[8].cells[22].fillColor).toBe("#FCE4EC");
  });
});
