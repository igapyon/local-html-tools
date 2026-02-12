// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const xmlCommonPath = path.resolve(__dirname, "../src/common/ts/musicxml-common.ts");
const synthScheduleCommonPath = path.resolve(__dirname, "../src/common/ts/musicxml-synth-schedule-common.ts");

function loadCommon() {
  const xmlCommonCode = readFileSync(xmlCommonPath, "utf8");
  const synthScheduleCommonCode = readFileSync(synthScheduleCommonPath, "utf8");
  const factory = new Function(`${xmlCommonCode}\n${synthScheduleCommonCode}\nreturn MusicXmlSynthScheduleCommon;`);
  return factory();
}

describe("MusicXmlSynthScheduleCommon", () => {
  it("builds events from all parts and applies transpose", () => {
    const common = loadCommon();
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<score-partwise version="3.1">
  <part-list>
    <score-part id="P1"><part-name>clarinet</part-name></score-part>
    <score-part id="P2"><part-name>violin</part-name></score-part>
  </part-list>
  <part id="P1">
    <measure number="1">
      <attributes>
        <divisions>1</divisions>
        <transpose><chromatic>-2</chromatic></transpose>
      </attributes>
      <direction><sound tempo="90"/></direction>
      <note><pitch><step>C</step><octave>4</octave></pitch><duration>1</duration></note>
    </measure>
  </part>
  <part id="P2">
    <measure number="1">
      <attributes><divisions>1</divisions></attributes>
      <note><pitch><step>G</step><octave>4</octave></pitch><duration>1</duration></note>
    </measure>
  </part>
</score-partwise>`;
    const schedule = common.buildSynthScheduleFromMusicXml(xml, { ticksPerQuarter: 128 });
    expect(schedule.tempo).toBe(90);
    expect(schedule.events.length).toBe(2);
    expect(schedule.events[0]).toEqual({ midiNumber: 58, start: 0, ticks: 128, channel: 1 });
    expect(schedule.events[1]).toEqual({ midiNumber: 67, start: 0, ticks: 128, channel: 2 });
  });
});
