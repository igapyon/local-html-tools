// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const commonPath = path.resolve(__dirname, "../src/common/ts/musicxml-common.ts");

function loadCommon() {
  const code = readFileSync(commonPath, "utf8");
  const factory = new Function(`${code}\nreturn MusicXmlCommon;`);
  return factory();
}

describe("MusicXmlCommon.normalizeMusicXmlSource", () => {
  it("trims blank lines", () => {
    const common = loadCommon();
    const normalized = common.normalizeMusicXmlSource("\n\n  <a>1</a>\n\n");
    expect(normalized).toBe("<a>1</a>");
  });

  it("unwraps fenced code block", () => {
    const common = loadCommon();
    const normalized = common.normalizeMusicXmlSource("```xml\n<score-partwise/>\n```");
    expect(normalized).toBe("<score-partwise/>");
  });
});

describe("MusicXmlCommon.parseScorePartwiseXml", () => {
  it("parses valid score-partwise", () => {
    const common = loadCommon();
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="3.1">
  <part-list><score-part id="P1"><part-name>Music</part-name></score-part></part-list>
  <part id="P1"><measure number="1"/></part>
</score-partwise>`;
    const doc = common.parseScorePartwiseXml(xml);
    expect(doc.documentElement.nodeName).toBe("score-partwise");
  });

  it("throws for non score-partwise root", () => {
    const common = loadCommon();
    expect(() => common.parseScorePartwiseXml("<score-timewise/>")).toThrow("score-partwise");
  });

  it("throws for malformed xml", () => {
    const common = loadCommon();
    expect(() => common.parseScorePartwiseXml("<score-partwise>")).toThrow(
      "XMLの構文解釈に失敗しました。"
    );
  });
});
