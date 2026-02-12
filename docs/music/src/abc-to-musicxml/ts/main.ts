const abcInput = document.getElementById("abcInput");
    const fileInput = document.getElementById("fileInput");
    const fileSelectBtn = document.getElementById("fileSelectBtn");
    const fileNameText = document.getElementById("fileNameText");
    const defaultTitleInput = document.getElementById("defaultTitleInput");
    const defaultComposerInput = document.getElementById("defaultComposerInput");
    const convertBtn = document.getElementById("convertBtn");
    const downloadBtn = document.getElementById("downloadBtn");
    const copyBtn = document.getElementById("copyBtn");
    const previewText = document.getElementById("previewText");
    const xmlOutput = document.getElementById("xmlOutput");
    const errorText = document.getElementById("errorText");
    const warningText = document.getElementById("warningText");
    const toast = document.getElementById("toast");
    const menuPanel = document.getElementById("menuPanel");

    const SETTINGS_KEY = "diagram-abc-to-musicxml-settings";

    let lastXml = "";

    restoreSettings();

    convertBtn.addEventListener("click", convertAbc);
    downloadBtn.addEventListener("click", downloadMusicXml);
    copyBtn.addEventListener("click", copyMusicXml);
    fileInput.addEventListener("change", loadAbcFile);
    fileSelectBtn.addEventListener("click", () => fileInput.click());
    defaultTitleInput.addEventListener("change", persistSettings);
    defaultComposerInput.addEventListener("change", persistSettings);
    document.addEventListener("click", handleDocumentClick);

    convertAbc();

    function loadAbcFile(event) {
      const file = event.target.files && event.target.files[0];
      if (!file) {
        updateFileName("");
        return;
      }
      updateFileName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        abcInput.value = String(reader.result || "");
        showToast("ABCを読み込みました。");
      };
      reader.onerror = () => {
        setError("ファイルの読み込みに失敗しました。");
      };
      reader.readAsText(file, "utf-8");
    }

    function updateFileName(name) {
      fileNameText.textContent = name || "未選択";
    }

    function convertAbc() {
      const source = normalizeSource(abcInput.value);
      if (!source) {
        setError("ABCソースを入力してください。");
        resetOutput();
        return;
      }

      clearError();
      clearWarning();

      try {
        const result = parseAbc(source, {
          defaultTitle: defaultTitleInput.value.trim() || "Untitled",
          defaultComposer: defaultComposerInput.value.trim() || "Unknown"
        });

        const xml = buildMusicXml(result);
        lastXml = xml;
        xmlOutput.textContent = xml;
        previewText.textContent = [
          "title: " + result.meta.title,
          "composer: " + result.meta.composer,
          "meter: " + result.meta.meterText,
          "unit length: " + result.meta.unitLengthText,
          "key: " + result.meta.keyText,
          "measures: " + result.measures.length,
          "notes/rests: " + result.noteCount
        ].join("\n");

        downloadBtn.disabled = false;

        if (result.warnings.length > 0) {
          warningText.textContent = "警告:\n" + result.warnings.join("\n");
          warningText.classList.remove("md-hidden");
        }

        showToast("MusicXMLを生成しました。");
      } catch (error) {
        resetOutput();
        const message = error && error.message ? error.message : String(error);
        const lineNumber = extractLineNumber(message);
        setError("変換に失敗しました: " + message, lineNumber);
      }
    }

    function resetOutput() {
      lastXml = "";
      xmlOutput.textContent = "";
      previewText.textContent = "未変換";
      downloadBtn.disabled = true;
    }

    function parseAbc(source, settings) {
      const warnings = [];
      const lines = source.split("\n");
      const headers = {};
      const bodyEntries = [];

      for (let i = 0; i < lines.length; i += 1) {
        const lineNo = i + 1;
        const raw = lines[i];
        const noComment = raw.split("%")[0];
        const trimmed = noComment.trim();

        if (!trimmed) {
          continue;
        }

        const headerMatch = trimmed.match(/^([A-Za-z]):\s*(.*)$/);
        if (headerMatch && /^[A-Za-z]$/.test(headerMatch[1])) {
          const key = headerMatch[1];
          const value = headerMatch[2].trim();
          headers[key] = value;
          continue;
        }

        bodyEntries.push({ text: noComment, lineNo });
      }

      if (bodyEntries.length === 0) {
        throw new Error("本文が見つかりません。ABCのノート列を入力してください。 (line 1)");
      }

      const meter = parseMeter(headers.M || "4/4", warnings);
      const unitLength = parseFraction(headers.L || "1/8", "L", warnings);
      const keyInfo = parseKey(headers.K || "C", warnings);

      const measures = [[]];
      let currentMeasure = measures[0];
      let noteCount = 0;

      for (const entry of bodyEntries) {
        let idx = 0;
        const text = entry.text;

        while (idx < text.length) {
          const ch = text[idx];

          if (ch === " " || ch === "\t") {
            idx += 1;
            continue;
          }

          if (ch === "|") {
            if (currentMeasure.length > 0 || measures.length === 0) {
              currentMeasure = [];
              measures.push(currentMeasure);
            }
            idx += 1;
            continue;
          }

          if (ch === "[" || ch === "]" || ch === "(" || ch === ")" || ch === "{" || ch === "}" || ch === "\"" || ch === ":") {
            warnings.push("line " + entry.lineNo + ": 非対応記法をスキップしました: " + ch);
            idx += 1;
            continue;
          }

          let accidental = "";
          if (ch === "^" || ch === "_" || ch === "=") {
            accidental = ch;
            idx += 1;
          }

          const pitchChar = text[idx];
          if (!pitchChar || !/[A-Ga-gzZ]/.test(pitchChar)) {
            throw new Error("line " + entry.lineNo + ": ノート/休符の解釈に失敗しました: " + text.slice(idx, idx + 12));
          }
          idx += 1;

          let octaveShift = "";
          while (idx < text.length && (text[idx] === "'" || text[idx] === ",")) {
            octaveShift += text[idx];
            idx += 1;
          }

          let lengthToken = "";
          const lengthMatch = text.slice(idx).match(/^(\d+\/\d+|\d+|\/\d+|\/)/);
          if (lengthMatch) {
            lengthToken = lengthMatch[1];
            idx += lengthToken.length;
          }

          const len = parseLengthToken(lengthToken, entry.lineNo);
          const absoluteLength = multiplyFractions(unitLength, len);
          const dur = durationInDivisions(absoluteLength, 960);
          if (dur <= 0) {
            throw new Error("line " + entry.lineNo + ": 長さが不正です");
          }

          const note = buildNoteData(pitchChar, accidental, octaveShift, absoluteLength, dur, entry.lineNo);
          currentMeasure.push(note);
          noteCount += 1;
        }
      }

      while (measures.length > 1 && measures[measures.length - 1].length === 0) {
        measures.pop();
      }

      if (noteCount === 0) {
        throw new Error("ノートまたは休符が見つかりませんでした。 (line 1)");
      }

      return {
        meta: {
          title: headers.T || settings.defaultTitle,
          composer: headers.C || settings.defaultComposer,
          meter,
          meterText: headers.M || "4/4",
          unitLength,
          unitLengthText: headers.L || "1/8",
          keyInfo,
          keyText: headers.K || "C"
        },
        measures,
        noteCount,
        warnings
      };
    }

    function parseMeter(raw, warnings) {
      const m = raw.match(/^(\d+)\/(\d+)$/);
      if (!m) {
        warnings.push("拍子 M: の形式が不正なため 4/4 を使用しました: " + raw);
        return { beats: 4, beatType: 4 };
      }
      return { beats: Number(m[1]), beatType: Number(m[2]) };
    }

    function parseFraction(raw, fieldName, warnings) {
      const m = raw.match(/^(\d+)\/(\d+)$/);
      if (!m) {
        warnings.push(fieldName + " の形式が不正なため 1/8 を使用しました: " + raw);
        return { num: 1, den: 8 };
      }
      const num = Number(m[1]);
      const den = Number(m[2]);
      if (!num || !den) {
        warnings.push(fieldName + " の値が不正なため 1/8 を使用しました: " + raw);
        return { num: 1, den: 8 };
      }
      return reduceFraction(num, den);
    }

    function parseKey(raw, warnings) {
      const key = raw.trim();
      const table = {
        "C": 0,
        "G": 1,
        "D": 2,
        "A": 3,
        "E": 4,
        "B": 5,
        "F#": 6,
        "C#": 7,
        "F": -1,
        "Bb": -2,
        "Eb": -3,
        "Ab": -4,
        "Db": -5,
        "Gb": -6,
        "Cb": -7,
        "Am": 0,
        "Em": 1,
        "Bm": 2,
        "F#m": 3,
        "C#m": 4,
        "G#m": 5,
        "D#m": 6,
        "A#m": 7,
        "Dm": -1,
        "Gm": -2,
        "Cm": -3,
        "Fm": -4,
        "Bbm": -5,
        "Ebm": -6,
        "Abm": -7
      };

      const normalized = key.replace(/\s+/g, "");
      if (Object.prototype.hasOwnProperty.call(table, normalized)) {
        return { fifths: table[normalized] };
      }

      warnings.push("K: 非対応キーのため C を使用しました: " + key);
      return { fifths: 0 };
    }

    function parseLengthToken(token, lineNo) {
      if (!token) {
        return { num: 1, den: 1 };
      }
      if (token === "/") {
        return { num: 1, den: 2 };
      }
      if (/^\d+$/.test(token)) {
        return { num: Number(token), den: 1 };
      }
      if (/^\/\d+$/.test(token)) {
        return { num: 1, den: Number(token.slice(1)) };
      }
      if (/^\d+\/\d+$/.test(token)) {
        const p = token.split("/");
        return reduceFraction(Number(p[0]), Number(p[1]));
      }
      throw new Error("line " + lineNo + ": 長さ指定を解釈できません: " + token);
    }

    function buildNoteData(pitchChar, accidental, octaveShift, absoluteLength, duration, lineNo) {
      const isRest = /[zZ]/.test(pitchChar);
      if (isRest) {
        return {
          isRest: true,
          duration,
          type: typeFromFraction(absoluteLength)
        };
      }

      const step = pitchChar.toUpperCase();
      const isLower = /[a-g]/.test(pitchChar);
      let octave = isLower ? 5 : 4;

      for (const ch of octaveShift) {
        if (ch === "'") {
          octave += 1;
        } else if (ch === ",") {
          octave -= 1;
        }
      }

      if (octave < 0 || octave > 9) {
        throw new Error("line " + lineNo + ": オクターブが範囲外です");
      }

      let alter = null;
      let accidentalText = null;
      if (accidental === "^") {
        alter = 1;
        accidentalText = "sharp";
      } else if (accidental === "_") {
        alter = -1;
        accidentalText = "flat";
      } else if (accidental === "=") {
        alter = 0;
        accidentalText = "natural";
      }

      return {
        isRest: false,
        step,
        octave,
        alter,
        accidentalText,
        duration,
        type: typeFromFraction(absoluteLength)
      };
    }

    function buildMusicXml(parsed) {
      const lines = [];
      const meta = parsed.meta;

      lines.push('<?xml version="1.0" encoding="UTF-8"?>');
      lines.push('<!DOCTYPE score-partwise PUBLIC "-//Recordare//DTD MusicXML 3.1 Partwise//EN"');
      lines.push('  "http://www.musicxml.org/dtds/partwise.dtd">');
      lines.push('<score-partwise version="3.1">');
      lines.push('  <work><work-title>' + escapeXml(meta.title) + '</work-title></work>');
      lines.push('  <identification><creator type="composer">' + escapeXml(meta.composer) + '</creator></identification>');
      lines.push('  <part-list>');
      lines.push('    <score-part id="P1"><part-name>Music</part-name></score-part>');
      lines.push('  </part-list>');
      lines.push('  <part id="P1">');

      for (let measureIndex = 0; measureIndex < parsed.measures.length; measureIndex += 1) {
        const measureNo = measureIndex + 1;
        const notes = parsed.measures[measureIndex];

        lines.push('    <measure number="' + measureNo + '">');
        if (measureIndex === 0) {
          lines.push('      <attributes>');
          lines.push('        <divisions>960</divisions>');
          lines.push('        <key><fifths>' + meta.keyInfo.fifths + '</fifths></key>');
          lines.push('        <time><beats>' + meta.meter.beats + '</beats><beat-type>' + meta.meter.beatType + '</beat-type></time>');
          lines.push('        <clef><sign>G</sign><line>2</line></clef>');
          lines.push('      </attributes>');
        }

        for (const note of notes) {
          lines.push('      <note>');
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
          if (!note.isRest && note.accidentalText) {
            lines.push('        <accidental>' + note.accidentalText + '</accidental>');
          }
          lines.push('      </note>');
        }

        lines.push('    </measure>');
      }

      lines.push('  </part>');
      lines.push('</score-partwise>');
      return lines.join("\n");
    }

    function typeFromFraction(frac) {
      const value = frac.num / frac.den;
      if (value >= 1) {
        return "whole";
      }
      if (value >= 0.5) {
        return "half";
      }
      if (value >= 0.25) {
        return "quarter";
      }
      if (value >= 0.125) {
        return "eighth";
      }
      if (value >= 0.0625) {
        return "16th";
      }
      return "32nd";
    }

    function durationInDivisions(wholeFraction, divisionsPerQuarter) {
      return Math.round((wholeFraction.num / wholeFraction.den) * 4 * divisionsPerQuarter);
    }

    function multiplyFractions(a, b) {
      return reduceFraction(a.num * b.num, a.den * b.den);
    }

    function reduceFraction(num, den) {
      if (!den) {
        return { num: 1, den: 8 };
      }
      const g = gcd(Math.abs(num), Math.abs(den));
      return { num: num / g, den: den / g };
    }

    function gcd(a, b) {
      let x = a;
      let y = b;
      while (y !== 0) {
        const t = x % y;
        x = y;
        y = t;
      }
      return x || 1;
    }

    function escapeXml(value) {
      return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&apos;");
    }

    function normalizeSource(rawText) {
      if (!rawText) {
        return "";
      }

      const lines = rawText.split("\n");
      let first = 0;
      let last = lines.length - 1;

      while (first <= last && lines[first].trim() === "") {
        first += 1;
      }
      while (last >= first && lines[last].trim() === "") {
        last -= 1;
      }
      if (first > last) {
        return "";
      }

      const firstLine = lines[first].trim();
      const lastLine = lines[last].trim();
      const hasCodeFencePair = /^```.*$/.test(firstLine) && /^```\s*$/.test(lastLine);
      if (hasCodeFencePair) {
        return lines.slice(first + 1, last).join("\n").trim();
      }

      return lines.slice(first, last + 1).join("\n").trim();
    }

    function downloadMusicXml() {
      if (!lastXml) {
        setError("先に変換してください。");
        return;
      }
      const blob = new Blob([lastXml], { type: "application/vnd.recordare.musicxml+xml;charset=utf-8" });
      downloadBlob(blob, "score.musicxml");
      showToast("MusicXMLを保存しました。");
    }

    function copyMusicXml() {
      if (!lastXml) {
        setError("先に変換してください。");
        return;
      }
      navigator.clipboard.writeText(lastXml).then(() => {
        clearError();
        showToast("MusicXMLをコピーしました。");
      }).catch((error) => {
        setError("コピーに失敗しました: " + (error && error.message ? error.message : String(error)));
      });
    }

    function setError(message, lineNumber) {
      errorText.textContent = message;
      errorText.classList.remove("md-hidden");
      if (Number.isInteger(lineNumber) && lineNumber > 0) {
        focusLine(lineNumber);
      }
    }

    function clearError() {
      errorText.textContent = "";
      errorText.classList.add("md-hidden");
    }

    function clearWarning() {
      warningText.textContent = "";
      warningText.classList.add("md-hidden");
    }

    function showToast(message) {
      toast.textContent = message;
      toast.classList.remove("md-hidden");
      toast.classList.add("md-visible");
      clearTimeout(showToast.timer);
      showToast.timer = setTimeout(() => {
        toast.classList.remove("md-visible");
        toast.classList.add("md-hidden");
      }, 1400);
    }

    function toggleMenu() {
      menuPanel.classList.toggle("md-hidden");
    }

    function handleDocumentClick(event) {
      const menuButton = event.target.closest(".md-menu-button");
      if (menuButton) {
        return;
      }
      if (!event.target.closest("#menuPanel")) {
        menuPanel.classList.add("md-hidden");
      }
    }

    function extractLineNumber(message) {
      if (!message) {
        return null;
      }
      const m = message.match(/line\s+(\d+)/i);
      if (m) {
        return Number(m[1]);
      }
      return null;
    }

    function focusLine(lineNumber) {
      const text = abcInput.value;
      if (!text) {
        return;
      }

      let currentLine = 1;
      let start = 0;
      while (currentLine < lineNumber && start < text.length) {
        const nextBreak = text.indexOf("\n", start);
        if (nextBreak < 0) {
          start = text.length;
          break;
        }
        start = nextBreak + 1;
        currentLine += 1;
      }

      let end = text.indexOf("\n", start);
      if (end < 0) {
        end = text.length;
      }

      abcInput.focus();
      abcInput.setSelectionRange(start, end);

      const style = window.getComputedStyle(abcInput);
      const lineHeight = Number.parseFloat(style.lineHeight) || 24;
      abcInput.scrollTop = Math.max(0, (lineNumber - 2) * lineHeight);
    }

    function downloadBlob(blob, filename) {
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    function persistSettings() {
      const payload = {
        defaultTitle: defaultTitleInput.value,
        defaultComposer: defaultComposerInput.value
      };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(payload));
    }

    function restoreSettings() {
      const raw = localStorage.getItem(SETTINGS_KEY);
      if (!raw) {
        return;
      }
      try {
        const data = JSON.parse(raw);
        if (data && typeof data === "object") {
          if (typeof data.defaultTitle === "string") {
            defaultTitleInput.value = data.defaultTitle;
          }
          if (typeof data.defaultComposer === "string") {
            defaultComposerInput.value = data.defaultComposer;
          }
        }
      } catch (_error) {
        // ignore broken localStorage
      }
    }
