// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const synthPath = path.resolve(__dirname, "../src/common/ts/music-synth-common.ts");

function loadCommon() {
  const code = readFileSync(synthPath, "utf8");
  const factory = new Function(`${code}\nreturn MusicSynthCommon;`);
  return factory();
}

describe("MusicSynthCommon.normalizeWaveform", () => {
  it("accepts supported waveform", () => {
    const common = loadCommon();
    expect(common.normalizeWaveform("square")).toBe("square");
    expect(common.normalizeWaveform("triangle")).toBe("triangle");
  });

  it("falls back to sine", () => {
    const common = loadCommon();
    expect(common.normalizeWaveform("sawtooth")).toBe("sine");
    expect(common.normalizeWaveform("")).toBe("sine");
  });
});

describe("MusicSynthCommon.midiNumberToFrequency", () => {
  it("maps A4 correctly", () => {
    const common = loadCommon();
    expect(common.midiNumberToFrequency(69)).toBeCloseTo(440, 6);
  });
});
