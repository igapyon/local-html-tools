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
      lines.push('    <score-part id="' + escapeXml(partId) + '"><part-name>' + escapeXml(partName) + '</part-name></score-part>');
    }
    lines.push('  </part-list>');
    for (const part of parts) {
      const partId = part.partId || "P1";
      const measures = Array.isArray(part.measures) && part.measures.length > 0 ? part.measures : [[]];
      lines.push('  <part id="' + escapeXml(partId) + '">');

      for (let measureIndex = 0; measureIndex < measures.length; measureIndex += 1) {
        const measureNo = measureIndex + 1;
        const notes = measures[measureIndex];

        lines.push('    <measure number="' + measureNo + '">');
        if (measureIndex === 0) {
          lines.push('      <attributes>');
          lines.push('        <divisions>960</divisions>');
          lines.push('        <key><fifths>' + meta.keyInfo.fifths + '</fifths></key>');
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
          lines.push('        <clef><sign>G</sign><line>2</line></clef>');
          lines.push('      </attributes>');
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

  return {
    escapeXml,
    buildScorePartwiseXml
  };
})();

if (typeof window !== "undefined") {
  window["MusicXmlWriterCommon"] = MusicXmlWriterCommon;
}
