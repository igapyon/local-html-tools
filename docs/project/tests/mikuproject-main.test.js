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
    expect(document.getElementById("summaryCalendarCount").textContent).toBe("1");
    expect(document.getElementById("modelOutput").value).toContain("\"name\": \"Sample Project\"");
    expect(document.getElementById("modelOutput").value).toContain("\"currentDate\": \"2026-03-16T09:00:00\"");
    expect(document.getElementById("modelOutput").value).toContain("\"defaultStartTime\": \"09:00:00\"");
    expect(document.getElementById("modelOutput").value).toContain("\"minutesPerDay\": 480");
    expect(document.getElementById("modelOutput").value).toContain("\"calendarUID\": \"1\"");
    expect(document.getElementById("modelOutput").value).toContain("\"predecessorUid\": \"2\"");
    expect(document.getElementById("modelOutput").value).toContain("\"name\": \"Standard\"");
    expect(document.getElementById("modelOutput").value).toContain("\"actualStart\": \"2026-03-16T09:00:00\"");
    expect(document.getElementById("modelOutput").value).toContain("\"constraintType\": 4");
    expect(document.getElementById("modelOutput").value).toContain("\"notes\": \"Implementation starts after design\"");
    expect(document.getElementById("modelOutput").value).toContain("\"initials\": \"MK\"");
    expect(document.getElementById("modelOutput").value).toContain("\"group\": \"Engineering\"");
    expect(document.getElementById("modelOutput").value).toContain("\"start\": \"2026-03-16T09:00:00\"");
    expect(document.getElementById("taskPreview").textContent).toContain("Implementation");
    expect(document.getElementById("resourcePreview").textContent).toContain("Engineering");
    expect(document.getElementById("assignmentPreview").textContent).toContain("TaskUID=2");
  });

  it("exports xml from the current model", () => {
    bootPage();

    document.getElementById("parseXmlBtn").click();
    document.getElementById("exportXmlBtn").click();

    const xmlText = document.getElementById("xmlInput").value;
    expect(xmlText).toContain("<?xml version=\"1.0\" encoding=\"UTF-8\"?>");
    expect(xmlText).toContain("\n<Project xmlns=\"http://schemas.microsoft.com/project\">\n");
    expect(xmlText).toContain("<CurrentDate>2026-03-16T09:00:00</CurrentDate>");
    expect(xmlText).toContain("<DefaultStartTime>09:00:00</DefaultStartTime>");
    expect(xmlText).toContain("<MinutesPerDay>480</MinutesPerDay>");
    expect(xmlText).toContain("<CalendarUID>1</CalendarUID>");
    expect(xmlText).toContain("<Calendars>");
    expect(xmlText).toContain("\n  <Calendars>\n");
    expect(xmlText).toContain("<Tasks>");
    expect(xmlText).toContain("<Assignments>");
    expect(xmlText).toContain("<LinkLag>PT0H0M0S</LinkLag>");
    expect(xmlText).toContain("<ActualStart>2026-03-16T09:00:00</ActualStart>");
    expect(xmlText).toContain("<ConstraintType>4</ConstraintType>");
    expect(xmlText).toContain("<Notes>Implementation starts after design</Notes>");
    expect(xmlText).toContain("<Initials>MK</Initials>");
    expect(xmlText).toContain("<Group>Engineering</Group>");
    expect(xmlText).toContain("<Start>2026-03-16T09:00:00</Start>");
  });

  it("passes round-trip check", () => {
    bootPage();

    document.getElementById("parseXmlBtn").click();
    document.getElementById("roundTripBtn").click();

    expect(document.getElementById("statusMessage").textContent).toContain("再読込テストに成功");
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
});
