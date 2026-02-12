// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const writerPath = path.resolve(__dirname, "../src/common/ts/musicxml-writer-common.ts");

function loadCommon() {
  const code = readFileSync(writerPath, "utf8");
  const factory = new Function(`${code}\nreturn MusicXmlWriterCommon;`);
  return factory();
}

describe("MusicXmlWriterCommon", () => {
  it("escapes xml entities", () => {
    const common = loadCommon();
    expect(common.escapeXml(`a&b<c>"d"'e`)).toBe("a&amp;b&lt;c&gt;&quot;d&quot;&apos;e");
  });

  it("builds score-partwise xml", () => {
    const common = loadCommon();
    const xml = common.buildScorePartwiseXml({
      meta: {
        title: "T",
        composer: "C",
        meter: { beats: 4, beatType: 4 },
        keyInfo: { fifths: 0 }
      },
      measures: [
        [
          { isRest: false, step: "C", alter: null, octave: 4, duration: 960, type: "quarter", accidentalText: null },
          { isRest: true, duration: 960, type: "quarter" }
        ]
      ]
    });
    expect(xml).toContain("<score-partwise version=\"3.1\">");
    expect(xml).toContain("<work-title>T</work-title>");
    expect(xml).toContain("<creator type=\"composer\">C</creator>");
    expect(xml).toContain("<rest/>");
    expect(xml).toContain("<duration>960</duration>");
  });

  it("writes transpose in first measure attributes when part transpose is provided", () => {
    const common = loadCommon();
    const xml = common.buildScorePartwiseXml({
      meta: {
        title: "T",
        composer: "C",
        meter: { beats: 4, beatType: 4 },
        keyInfo: { fifths: 0 }
      },
      parts: [
        {
          partId: "P1",
          partName: "clarinet in A",
          transpose: { chromatic: -3 },
          measures: [
            [{ isRest: false, step: "C", alter: null, octave: 4, duration: 960, type: "quarter", accidentalText: null }]
          ]
        }
      ]
    });
    expect(xml).toContain("<transpose>");
    expect(xml).toContain("<chromatic>-3</chromatic>");
  });
});
