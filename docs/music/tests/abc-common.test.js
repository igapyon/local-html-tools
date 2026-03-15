// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const abcCommonPath = path.resolve(__dirname, "../src/common/ts/abc-common.ts");

function loadCommon() {
  const code = readFileSync(abcCommonPath, "utf8");
  const factory = new Function(`${code}\nreturn AbcCommon;`);
  return factory();
}

describe("AbcCommon fraction helpers", () => {
  it("reduces and divides fractions", () => {
    const common = loadCommon();
    expect(common.reduceFraction(4, 8, { num: 1, den: 1 })).toEqual({ num: 1, den: 2 });
    expect(common.divideFractions({ num: 1, den: 2 }, { num: 1, den: 8 }, { num: 1, den: 1 }))
      .toEqual({ num: 4, den: 1 });
  });
});

describe("AbcCommon key helpers", () => {
  it("converts fifths to abc key", () => {
    const common = loadCommon();
    expect(common.keyFromFifthsMode(0, "major")).toBe("C");
    expect(common.keyFromFifthsMode(0, "minor")).toBe("Am");
  });

  it("converts abc key to fifths", () => {
    const common = loadCommon();
    expect(common.fifthsFromAbcKey("F#")).toBe(6);
    expect(common.fifthsFromAbcKey("Abm")).toBe(-7);
    expect(common.fifthsFromAbcKey("H")).toBeNull();
  });
});

describe("AbcCommon token helpers", () => {
  it("parses abc length token", () => {
    const common = loadCommon();
    expect(common.parseAbcLengthToken("/", 1)).toEqual({ num: 1, den: 2 });
    expect(common.parseAbcLengthToken("3/2", 1)).toEqual({ num: 3, den: 2 });
  });

  it("builds abc pitch and accidental", () => {
    const common = loadCommon();
    expect(common.abcPitchFromStepOctave("C", 4)).toBe("C");
    expect(common.abcPitchFromStepOctave("C", 5)).toBe("c");
    expect(common.accidentalFromAlter(2)).toBe("^^");
    expect(common.accidentalFromAlter(-1)).toBe("_");
  });
});
