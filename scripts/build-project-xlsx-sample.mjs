import fs from "node:fs";
import path from "node:path";
import { JSDOM } from "jsdom";

const ROOT = process.cwd();
const typesCode = fs.readFileSync(path.resolve(ROOT, "docs/project/src/mikuproject/js/types.js"), "utf8");
const excelIoCode = fs.readFileSync(path.resolve(ROOT, "docs/project/src/mikuproject/js/excel-io.js"), "utf8");
const msProjectXmlCode = fs.readFileSync(path.resolve(ROOT, "docs/project/src/mikuproject/js/msproject-xml.js"), "utf8");
const projectXlsxCode = fs.readFileSync(path.resolve(ROOT, "docs/project/src/mikuproject/js/project-xlsx.js"), "utf8");
const wbsXlsxCode = fs.readFileSync(path.resolve(ROOT, "docs/project/src/mikuproject/js/wbs-xlsx.js"), "utf8");

const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>");
globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.DOMParser = dom.window.DOMParser;
globalThis.XMLSerializer = dom.window.XMLSerializer;
globalThis.Node = dom.window.Node;

globalThis.eval(`${typesCode}\n${excelIoCode}\n${msProjectXmlCode}\n${projectXlsxCode}\n${wbsXlsxCode}`);

const excelIo = globalThis.__mikuprojectExcelIo;
const xml = globalThis.__mikuprojectXml;
const projectXlsx = globalThis.__mikuprojectProjectXlsx;
const wbsXlsx = globalThis.__mikuprojectWbsXlsx;
if (!excelIo?.XlsxWorkbookCodec) {
  throw new Error("mikuproject excel io module is not loaded");
}
if (!xml?.SAMPLE_XML || typeof xml.importMsProjectXml !== "function") {
  throw new Error("mikuproject xml module is not loaded");
}
if (typeof projectXlsx?.exportProjectWorkbook !== "function") {
  throw new Error("mikuproject project xlsx module is not loaded");
}
if (typeof wbsXlsx?.exportWbsWorkbook !== "function") {
  throw new Error("mikuproject wbs xlsx module is not loaded");
}

const codec = new excelIo.XlsxWorkbookCodec();
const model = xml.importMsProjectXml(xml.SAMPLE_XML);
const workbook = projectXlsx.exportProjectWorkbook(model);
const holidayDates = Array.from(new Set(
  model.calendars.flatMap((calendar) => calendar.exceptions || [])
    .filter((exception) => (exception.workingTimes || []).length === 0)
    .flatMap((exception) => {
      const from = (exception.fromDate || "").slice(0, 10);
      const to = (exception.toDate || "").slice(0, 10);
      if (!from) {
        return [];
      }
      if (!to || to === from) {
        return [from];
      }
      const days = [];
      const start = new Date(`${from}T00:00:00`);
      const finish = new Date(`${to}T00:00:00`);
      for (const cursor = new Date(start.getTime()); cursor.getTime() <= finish.getTime(); cursor.setDate(cursor.getDate() + 1)) {
        const year = cursor.getFullYear();
        const month = String(cursor.getMonth() + 1).padStart(2, "0");
        const day = String(cursor.getDate()).padStart(2, "0");
        days.push(`${year}-${month}-${day}`);
      }
      return days;
    })
));
const wbsWorkbook = wbsXlsx.exportWbsWorkbook(model, { holidayDates });

const bytes = codec.exportWorkbook(workbook);
const wbsBytes = codec.exportWorkbook(wbsWorkbook);
const outputPath = path.resolve(ROOT, "docs/project/local-data/mikuproject-sample.xlsx");
const wbsOutputPath = path.resolve(ROOT, "docs/project/local-data/mikuproject-wbs-sample.xlsx");
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, Buffer.from(bytes));
fs.writeFileSync(wbsOutputPath, Buffer.from(wbsBytes));
console.log(`[build:project:xlsx-sample] generated ${path.relative(ROOT, outputPath)}`);
console.log(`[build:project:xlsx-sample] generated ${path.relative(ROOT, wbsOutputPath)}`);
