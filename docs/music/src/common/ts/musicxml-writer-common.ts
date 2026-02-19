const MusicXmlWriterCommon = (() => {
  function escapeXml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }

  function buildScorePartwiseXml(parsed) {
    const lines = [];
    const meta = parsed.meta;
    const parts = Array.isArray(parsed.parts) && parsed.parts.length > 0
      ? parsed.parts
      : [{
        partId: "P1",
        partName: "Music",
        measures: parsed.measures || [[]]
      }];

    lines.push('<?xml version="1.0" encoding="UTF-8"?>');
    lines.push('<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN"');
    lines.push('  "http://www.musicxml.org/dtds/partwise.dtd">');
    lines.push('<score-partwise version="3.1">');
    lines.push('  <work><work-title>' + escapeXml(meta.title) + '</work-title></work>');
    lines.push('  <identification><creator type="composer">' + escapeXml(meta.composer) + '</creator></identification>');
    lines.push('  <part-list>');
    for (const part of parts) {
      const partId = part.partId || "P1";
      const partName = part.partName || "Music";
      const midiProgram = normalizeMidiProgram(part.midiProgram);
      const midiChannel = normalizeMidiChannel(part.midiChannel);
      const scoreInstrumentId = partId + "-I1";
      lines.push('    <score-part id="' + escapeXml(partId) + '">');
      lines.push('      <part-name>' + escapeXml(partName) + '</part-name>');
      if (midiProgram !== null || midiChannel !== null) {
        lines.push('      <score-instrument id="' + escapeXml(scoreInstrumentId) + '">');
        lines.push('        <instrument-name>' + escapeXml(resolveMidiInstrumentName(partName, midiProgram)) + '</instrument-name>');
        lines.push('      </score-instrument>');
        lines.push('      <midi-instrument id="' + escapeXml(scoreInstrumentId) + '">');
        if (midiChannel !== null) {
          lines.push("        <midi-channel>" + midiChannel + "</midi-channel>");
        }
        if (midiProgram !== null) {
          lines.push("        <midi-program>" + midiProgram + "</midi-program>");
        }
        lines.push("      </midi-instrument>");
      }
      lines.push("    </score-part>");
    }
    lines.push('  </part-list>');
    const tempoChangesByMeasure = normalizeTempoChanges(meta.tempoChanges, meta.tempo);
    for (let partIndex = 0; partIndex < parts.length; partIndex += 1) {
      const part = parts[partIndex];
      const partId = part.partId || "P1";
      const measures = Array.isArray(part.measures) && part.measures.length > 0 ? part.measures : [[]];
      const measureDynamics = Array.isArray(part.measureDynamics) ? part.measureDynamics : [];
      lines.push('  <part id="' + escapeXml(partId) + '">');

      for (let measureIndex = 0; measureIndex < measures.length; measureIndex += 1) {
        const measureNo = measureIndex + 1;
        const notes = measures[measureIndex];

        lines.push('    <measure number="' + measureNo + '">');
        if (measureIndex === 0) {
          const clef = normalizeClef(part.clef);
          const keyMode = normalizeKeyMode(meta.keyInfo && meta.keyInfo.mode);
          lines.push('      <attributes>');
          lines.push('        <divisions>960</divisions>');
          lines.push('        <key><fifths>' + meta.keyInfo.fifths + '</fifths><mode>' + keyMode + '</mode></key>');
          lines.push('        <time><beats>' + meta.meter.beats + '</beats><beat-type>' + meta.meter.beatType + '</beat-type></time>');
          const transpose = normalizeTranspose(part.transpose);
          if (transpose) {
            lines.push("        <transpose>");
            lines.push("          <chromatic>" + transpose.chromatic + "</chromatic>");
            if (Number.isFinite(transpose.octaveChange) && transpose.octaveChange !== 0) {
              lines.push("          <octave-change>" + transpose.octaveChange + "</octave-change>");
            }
            lines.push("        </transpose>");
          }
          lines.push('        <clef><sign>' + clef.sign + '</sign><line>' + clef.line + '</line></clef>');
          lines.push('      </attributes>');
        }
        if (partIndex === 0) {
          const tempoBpm = tempoChangesByMeasure.get(measureNo);
          if (Number.isFinite(tempoBpm) && tempoBpm > 0) {
            lines.push('      <direction placement="above">');
            lines.push("        <direction-type>");
            lines.push("          <metronome>");
            lines.push("            <beat-unit>quarter</beat-unit>");
            lines.push("            <per-minute>" + tempoBpm + "</per-minute>");
            lines.push("          </metronome>");
            lines.push("        </direction-type>");
            lines.push("        <sound tempo=\"" + tempoBpm + "\"/>");
            lines.push("      </direction>");
          }
        }
        const dynamicMark = normalizeDynamicMark(measureDynamics[measureIndex]);
        if (dynamicMark) {
          lines.push('      <direction placement="below">');
          lines.push("        <direction-type>");
          lines.push("          <dynamics>");
          lines.push("            <" + dynamicMark + "/>");
          lines.push("          </dynamics>");
          lines.push("        </direction-type>");
          lines.push("      </direction>");
        }

        for (const note of notes) {
          lines.push('      <note>');
          if (note.chord) {
            lines.push("        <chord/>");
          }
          if (note.isRest) {
            lines.push('        <rest/>');
          } else {
            lines.push('        <pitch>');
            lines.push('          <step>' + note.step + '</step>');
            if (note.alter !== null) {
              lines.push('          <alter>' + note.alter + '</alter>');
            }
            lines.push('          <octave>' + note.octave + '</octave>');
            lines.push('        </pitch>');
          }

          lines.push('        <duration>' + note.duration + '</duration>');
          lines.push('        <type>' + note.type + '</type>');
          if (note.voice) {
            lines.push('        <voice>' + escapeXml(note.voice) + '</voice>');
          }
          if (!note.isRest && note.accidentalText) {
            lines.push('        <accidental>' + note.accidentalText + '</accidental>');
          }
          if (!note.isRest && note.tieStart) {
            lines.push("        <tie type=\"start\"/>");
          }
          if (!note.isRest && note.tieStop) {
            lines.push("        <tie type=\"stop\"/>");
          }
          if (!note.isRest && (note.tieStart || note.tieStop)) {
            lines.push("        <notations>");
            if (note.tieStart) {
              lines.push("          <tied type=\"start\"/>");
            }
            if (note.tieStop) {
              lines.push("          <tied type=\"stop\"/>");
            }
            lines.push("        </notations>");
          }
          lines.push('      </note>');
        }

        lines.push('    </measure>');
      }

      lines.push('  </part>');
    }
    lines.push('</score-partwise>');
    return lines.join("\n");
  }

  function normalizeTranspose(rawTranspose) {
    if (rawTranspose === null || typeof rawTranspose === "undefined") {
      return null;
    }
    if (Number.isFinite(rawTranspose)) {
      const chromaticOnly = Number(rawTranspose);
      if (chromaticOnly === 0) {
        return null;
      }
      return { chromatic: chromaticOnly, octaveChange: 0 };
    }
    if (typeof rawTranspose !== "object") {
      return null;
    }
    const chromatic = Number(rawTranspose.chromatic);
    const octaveChange = Number(rawTranspose.octaveChange || 0);
    if (!Number.isFinite(chromatic) || chromatic === 0) {
      return null;
    }
    return {
      chromatic,
      octaveChange: Number.isFinite(octaveChange) ? octaveChange : 0
    };
  }

  function normalizeClef(rawClef) {
    if (!rawClef || typeof rawClef !== "object") {
      return { sign: "G", line: 2 };
    }
    const sign = String(rawClef.sign || "G").trim().toUpperCase();
    const line = Number.parseInt(rawClef.line, 10);
    if ((sign !== "G" && sign !== "F" && sign !== "C") || !Number.isFinite(line) || line <= 0) {
      return { sign: "G", line: 2 };
    }
    return { sign, line };
  }

  function normalizeKeyMode(rawMode) {
    const mode = String(rawMode || "major").trim().toLowerCase();
    if (mode === "minor") {
      return "minor";
    }
    return "major";
  }

  function normalizeMidiProgram(rawProgram) {
    const value = Number.parseInt(rawProgram, 10);
    if (!Number.isFinite(value) || value < 1 || value > 128) {
      return null;
    }
    return value;
  }

  function normalizeMidiChannel(rawChannel) {
    const value = Number.parseInt(rawChannel, 10);
    if (!Number.isFinite(value) || value < 1 || value > 16) {
      return null;
    }
    return value;
  }

  function resolveMidiInstrumentName(partName, midiProgram) {
    const normalizedPartName = String(partName || "").trim();
    if (normalizedPartName) {
      return normalizedPartName;
    }
    if (midiProgram !== null) {
      return "Program " + midiProgram;
    }
    return "Instrument";
  }

  function normalizeDynamicMark(rawMark) {
    const mark = String(rawMark || "").trim().toLowerCase();
    if (mark === "p" || mark === "mp" || mark === "mf" || mark === "f") {
      return mark;
    }
    return null;
  }

  function normalizeTempoChanges(rawTempoChanges, fallbackTempo) {
    const tempoByMeasure = new Map();
    if (Array.isArray(rawTempoChanges)) {
      for (const change of rawTempoChanges) {
        if (!change || typeof change !== "object") {
          continue;
        }
        const measure = Number.parseInt(change.measure, 10);
        const bpm = Number.parseInt(change.bpm, 10);
        if (!Number.isFinite(measure) || measure <= 0 || !Number.isFinite(bpm) || bpm <= 0) {
          continue;
        }
        tempoByMeasure.set(measure, bpm);
      }
    }
    if (tempoByMeasure.size === 0) {
      const fallback = Number.parseInt(fallbackTempo, 10);
      if (Number.isFinite(fallback) && fallback > 0) {
        tempoByMeasure.set(1, fallback);
      }
    } else if (!tempoByMeasure.has(1)) {
      const fallback = Number.parseInt(fallbackTempo, 10);
      if (Number.isFinite(fallback) && fallback > 0) {
        tempoByMeasure.set(1, fallback);
      }
    }
    return tempoByMeasure;
  }

  return {
    escapeXml,
    buildScorePartwiseXml
  };
})();

if (typeof window !== "undefined") {
  window["MusicXmlWriterCommon"] = MusicXmlWriterCommon;
}
  </script>
