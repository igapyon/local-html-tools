// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const abcCommonPath = path.resolve(__dirname, "../src/common/ts/abc-common.ts");
const parserPath = path.resolve(__dirname, "../src/common/ts/abc-compat-parser.ts");

function loadParser() {
  const commonCode = readFileSync(abcCommonPath, "utf8");
  const parserCode = readFileSync(parserPath, "utf8");
  const factory = new Function(`${commonCode}\n${parserCode}\nreturn AbcCompatParser;`);
  return factory();
}

describe("AbcCompatParser", () => {
  it("parses spaced broken rhythm and inline chord text", () => {
    const parser = loadParser();
    const abc = `X:1
T:故郷(ふるさと)
M:3/4
L:1/4
K:G
V:1
"G"G G G|"D"A > B A|"G"B B c|d3`;

    const result = parser.parseForMusicXml(abc, {
      defaultTitle: "Untitled",
      defaultComposer: "Unknown",
      inferTransposeFromPartName: false
    });

    expect(result.noteCount).toBeGreaterThan(0);
    expect(result.meta.meter.beats).toBe(3);
    expect(result.meta.keyInfo.fifths).toBe(1);
    expect(result.warnings.some((w) => w.includes("インライン文字列"))).toBe(true);
  });

  it("parses x rests and mixed barline punctuation", () => {
    const parser = loadParser();
    const abc = `X:1
T:組曲第3番
M:C
L:1/16
K:Dm
V:B clef=bass
x16|x8 z2A,,>=B,, C,D,E,^F,`;

    const result = parser.parseForMusicXml(abc, {
      defaultTitle: "Untitled",
      defaultComposer: "Unknown",
      inferTransposeFromPartName: false
    });

    expect(result.noteCount).toBeGreaterThan(0);
    expect(result.meta.meter.beats).toBe(4);
    expect(result.meta.meter.beatType).toBe(4);
  });

  it("infers in-A transposition as minor-third down in written pitch", () => {
    const parser = loadParser();
    const abc = `X:1
T:Test
M:4/4
L:1/4
K:A
V:1 name="clarinet in A"
C D E F|`;

    const result = parser.parseForMusicXml(abc, {
      defaultTitle: "Untitled",
      defaultComposer: "Unknown",
      inferTransposeFromPartName: true
    });

    expect(result.parts[0].transpose).toEqual({ chromatic: -3 });
  });

  it("supports tuplet and chord syntax used in reel sources", () => {
    const parser = loadParser();
    const abc = `X:1
T:Drowzy Maggie (excerpt)
M:4/4
L:1/8
K:D
(3bag (3agf gfed|[DFA] [EGB] [A,cf]|`;

    const result = parser.parseForMusicXml(abc, {
      defaultTitle: "Untitled",
      defaultComposer: "Unknown",
      inferTransposeFromPartName: false
    });

    expect(result.noteCount).toBeGreaterThanOrEqual(10);
    expect(result.warnings.some((w) => w.includes("解釈に失敗"))).toBe(false);
  });

  it("accepts standalone octave marker after chord for compatibility", () => {
    const parser = loadParser();
    const abc = `X:1
T:Compat
M:6/8
L:1/8
K:Am
[B,b],EG [A,,Ca]CE|`;

    const result = parser.parseForMusicXml(abc, {
      defaultTitle: "Untitled",
      defaultComposer: "Unknown",
      inferTransposeFromPartName: false
    });

    expect(result.noteCount).toBeGreaterThan(0);
  });
});
