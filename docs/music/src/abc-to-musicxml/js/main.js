const abcCommon = window["AbcCommon"] || (typeof AbcCommon !== "undefined" ? AbcCommon : null);
const musicXmlCommon = window["MusicXmlCommon"] || (typeof MusicXmlCommon !== "undefined" ? MusicXmlCommon : null);
const musicXmlSynthScheduleCommon = window["MusicXmlSynthScheduleCommon"] || (typeof MusicXmlSynthScheduleCommon !== "undefined" ? MusicXmlSynthScheduleCommon : null);
const musicSynthCommon = window["MusicSynthCommon"] || (typeof MusicSynthCommon !== "undefined" ? MusicSynthCommon : null);
const musicXmlWriterCommon = window["MusicXmlWriterCommon"] || (typeof MusicXmlWriterCommon !== "undefined" ? MusicXmlWriterCommon : null);
if (!abcCommon) {
  throw new Error("AbcCommon is not loaded.");
}
if (!musicXmlCommon) {
  throw new Error("MusicXmlCommon is not loaded.");
}
if (!musicXmlSynthScheduleCommon) {
  throw new Error("MusicXmlSynthScheduleCommon is not loaded.");
}
if (!musicSynthCommon) {
  throw new Error("MusicSynthCommon is not loaded.");
}
if (!musicXmlWriterCommon) {
  throw new Error("MusicXmlWriterCommon is not loaded.");
}

const abcInput = document.getElementById("abcInput");
    const fileInput = document.getElementById("fileInput");
    const inputModeSourceRadio = document.getElementById("inputModeSource");
    const inputModeFileRadio = document.getElementById("inputModeFile");
    const sourceInputBlock = document.getElementById("sourceInputBlock");
    const fileInputBlock = document.getElementById("fileInputBlock");
    const fileSelectBtn = document.getElementById("fileSelectBtn");
    const fileNameText = document.getElementById("fileNameText");
    const defaultTitleInput = document.getElementById("defaultTitleInput");
    const defaultComposerInput = document.getElementById("defaultComposerInput");
    const inferTransposeFromPartNameCheckbox = document.getElementById("inferTransposeFromPartNameCheckbox");
    const convertBtn = document.getElementById("convertBtn");
    const downloadBtn = document.getElementById("downloadBtn");
    const playSineBtn = document.getElementById("playSineBtn");
    const copyBtn = document.getElementById("copyBtn");
    const previewText = document.getElementById("previewText");
    const xmlOutput = document.getElementById("xmlOutput");
    const errorText = document.getElementById("errorText");
    const warningText = document.getElementById("warningText");
    const toast = document.getElementById("toast");
    const menuPanel = document.getElementById("menuPanel");

    const SETTINGS_KEY = "diagram-abc-to-musicxml-settings";
    const MIDI_TICKS_PER_QUARTER = 128;

    let lastXml = "";
    let lastSynthSchedule = null;
    const synthEngine = musicSynthCommon.createBasicWaveSynthEngine({
      ticksPerQuarter: MIDI_TICKS_PER_QUARTER
    });

    restoreSettings();

    convertBtn.addEventListener("click", convertAbc);
    downloadBtn.addEventListener("click", downloadMusicXml);
    playSineBtn.addEventListener("click", playSine);
    copyBtn.addEventListener("click", copyMusicXml);
    fileInput.addEventListener("change", loadAbcFile);
    fileSelectBtn.addEventListener("click", () => fileInput.click());
    inputModeSourceRadio.addEventListener("change", applyInputMode);
    inputModeFileRadio.addEventListener("change", applyInputMode);
    defaultTitleInput.addEventListener("change", persistSettings);
    defaultComposerInput.addEventListener("change", persistSettings);
    inferTransposeFromPartNameCheckbox.addEventListener("change", () => {
      persistSettings();
      convertAbc();
    });
    document.addEventListener("click", handleDocumentClick);

    applyInputMode();
    convertAbc();

    function loadAbcFile(event) {
      const file = event.target.files && event.target.files[0];
      if (!file) {
        updateFileName("");
        return;
      }
      inputModeFileRadio.checked = true;
      applyInputMode();
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

    function applyInputMode() {
      const sourceMode = inputModeSourceRadio.checked;
      sourceInputBlock.classList.toggle("md-hidden", !sourceMode);
      fileInputBlock.classList.toggle("md-hidden", sourceMode);
      if (sourceMode) {
        fileInput.value = "";
        updateFileName("");
      }
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
          defaultComposer: defaultComposerInput.value.trim() || "Unknown",
          inferTransposeFromPartName: !!inferTransposeFromPartNameCheckbox.checked
        });

        const xml = musicXmlWriterCommon.buildScorePartwiseXml(result);
        lastXml = xml;
        lastSynthSchedule = musicXmlSynthScheduleCommon.buildSynthScheduleFromMusicXml(xml, {
          ticksPerQuarter: MIDI_TICKS_PER_QUARTER
        });
        xmlOutput.textContent = xml;
        previewText.textContent = [
          "title: " + result.meta.title,
          "composer: " + result.meta.composer,
          "meter: " + result.meta.meterText,
          "unit length: " + result.meta.unitLengthText,
          "key: " + result.meta.keyText,
          "voices: " + result.voiceCount,
          "measures: " + result.measureCount,
          "notes/rests: " + result.noteCount
        ].join("\n");

        downloadBtn.disabled = false;
        playSineBtn.disabled = !lastSynthSchedule || lastSynthSchedule.events.length === 0;

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
      lastSynthSchedule = null;
      synthEngine.stop();
      xmlOutput.textContent = "";
      previewText.textContent = "未変換";
      downloadBtn.disabled = true;
      playSineBtn.disabled = true;
    }

    function parseAbc(source, settings) {
      const warnings = [];
      const lines = source.split("\n");
      const headers = {};
      const bodyEntries = [];
      const declaredVoiceIds = [];
      const voiceNameById = {};
      let currentVoiceId = "1";
      let scoreDirective = "";

      for (let i = 0; i < lines.length; i += 1) {
        const lineNo = i + 1;
        const raw = lines[i];
        const noComment = raw.split("%")[0];
        const trimmed = noComment.trim();

        if (!trimmed) {
          continue;
        }

        const scoreMatch = trimmed.match(/^%%\s*score\s+(.+)$/i);
        if (scoreMatch) {
          scoreDirective = scoreMatch[1].trim();
          continue;
        }

        const headerMatch = trimmed.match(/^([A-Za-z]):\s*(.*)$/);
        if (headerMatch && /^[A-Za-z]$/.test(headerMatch[1])) {
          const key = headerMatch[1];
          const value = headerMatch[2].trim();
          if (key === "V") {
            const m = value.match(/^(\S+)\s*(.*)$/);
            if (!m) {
              continue;
            }
            currentVoiceId = m[1];
            if (!declaredVoiceIds.includes(currentVoiceId)) {
              declaredVoiceIds.push(currentVoiceId);
            }
            const rest = m[2].trim();
            const parsedVoice = parseVoiceDirectiveTail(rest);
            if (parsedVoice.name) {
              voiceNameById[currentVoiceId] = parsedVoice.name;
            }
            if (parsedVoice.bodyText) {
              bodyEntries.push({ text: parsedVoice.bodyText, lineNo, voiceId: currentVoiceId });
            }
            continue;
          }
          headers[key] = value;
          continue;
        }

        if (!declaredVoiceIds.includes(currentVoiceId)) {
          declaredVoiceIds.push(currentVoiceId);
        }
        bodyEntries.push({ text: noComment, lineNo, voiceId: currentVoiceId });
      }

      if (bodyEntries.length === 0) {
        throw new Error("本文が見つかりません。ABCのノート列を入力してください。 (line 1)");
      }

      const meter = parseMeter(headers.M || "4/4", warnings);
      const unitLength = parseFraction(headers.L || "1/8", "L", warnings);
      const keyInfo = parseKey(headers.K || "C", warnings);
      const keySignatureAccidentals = keySignatureAlterByStep(keyInfo.fifths);
      const measuresByVoice = {};
      let noteCount = 0;

      function ensureVoice(voiceId) {
        if (!Object.prototype.hasOwnProperty.call(measuresByVoice, voiceId)) {
          measuresByVoice[voiceId] = [[]];
        }
        return measuresByVoice[voiceId];
      }

      for (const entry of bodyEntries) {
        const measures = ensureVoice(entry.voiceId);
        let currentMeasure = measures[measures.length - 1];
        let measureAccidentals = {};
        let lastNote = null;
        let pendingTieToNext = false;
        let pendingRhythmScale = null;
        let idx = 0;
        const text = entry.text;

        while (idx < text.length) {
          const ch = text[idx];

          if (ch === " " || ch === "\t") {
            idx += 1;
            continue;
          }

          if (ch === ">" || ch === "<") {
            if (!lastNote || lastNote.isRest) {
              warnings.push("line " + entry.lineNo + ": broken rhythm(" + ch + ") の前にノートがないためスキップしました。");
              idx += 1;
              continue;
            }
            const lastScale = ch === ">" ? { num: 3, den: 2 } : { num: 1, den: 2 };
            pendingRhythmScale = ch === ">" ? { num: 1, den: 2 } : { num: 3, den: 2 };
            lastNote.duration = Math.max(1, Math.round(lastNote.duration * (lastScale.num / lastScale.den)));
            lastNote.type = typeFromDuration(lastNote.duration, 960);
            idx += 1;
            continue;
          }

          if (ch === "|") {
            if (currentMeasure.length > 0 || measures.length === 0) {
              currentMeasure = [];
              measures.push(currentMeasure);
            }
            measureAccidentals = {};
            lastNote = null;
            idx += 1;
            continue;
          }

          if (ch === "-") {
            if (lastNote && !lastNote.isRest) {
              lastNote.tieStart = true;
              pendingTieToNext = true;
            } else {
              warnings.push("line " + entry.lineNo + ": tie(-) の前にノートがないためスキップしました。");
            }
            idx += 1;
            continue;
          }

          if (ch === "\"" ) {
            const endQuote = text.indexOf("\"", idx + 1);
            if (endQuote >= 0) {
              idx = endQuote + 1;
            } else {
              idx = text.length;
            }
            warnings.push("line " + entry.lineNo + ': インライン文字列(\"...\")はスキップしました。');
            continue;
          }

          if (ch === "[" || ch === "]" || ch === "(" || ch === ")" || ch === "{" || ch === "}" || ch === ":") {
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
          if (!pitchChar || !/[A-Ga-gzZxX]/.test(pitchChar)) {
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
          let absoluteLength = multiplyFractions(unitLength, len);
          if (pendingRhythmScale) {
            absoluteLength = multiplyFractions(absoluteLength, pendingRhythmScale);
            pendingRhythmScale = null;
          }

          if (idx < text.length && (text[idx] === ">" || text[idx] === "<")) {
            const rhythmChar = text[idx];
            idx += 1;
            if (rhythmChar === ">") {
              absoluteLength = multiplyFractions(absoluteLength, { num: 3, den: 2 });
              pendingRhythmScale = { num: 1, den: 2 };
            } else {
              absoluteLength = multiplyFractions(absoluteLength, { num: 1, den: 2 });
              pendingRhythmScale = { num: 3, den: 2 };
            }
          }

          const dur = durationInDivisions(absoluteLength, 960);
          if (dur <= 0) {
            throw new Error("line " + entry.lineNo + ": 長さが不正です");
          }

          const note = buildNoteData(
            pitchChar,
            accidental,
            octaveShift,
            absoluteLength,
            dur,
            entry.lineNo,
            keySignatureAccidentals,
            measureAccidentals
          );
          if (pendingTieToNext && !note.isRest) {
            note.tieStop = true;
            pendingTieToNext = false;
          } else if (note.isRest && pendingTieToNext) {
            warnings.push("line " + entry.lineNo + ": tie(-) の後ろが休符のため tie を解除しました。");
            pendingTieToNext = false;
          }
          note.voice = entry.voiceId;
          currentMeasure.push(note);
          lastNote = note;
          noteCount += 1;
        }
      }

      for (const voiceId of Object.keys(measuresByVoice)) {
        const measures = measuresByVoice[voiceId];
        while (measures.length > 1 && measures[measures.length - 1].length === 0) {
          measures.pop();
        }
      }

      if (noteCount === 0) {
        throw new Error("ノートまたは休符が見つかりませんでした。 (line 1)");
      }

      const orderedVoiceIds = parseScoreVoiceOrder(scoreDirective, declaredVoiceIds);
      const parts = orderedVoiceIds.map((voiceId, index) => {
        const partName = voiceNameById[voiceId] || ("Voice " + voiceId);
        return {
          partId: "P" + String(index + 1),
          partName,
          transpose: settings.inferTransposeFromPartName ? inferTransposeFromPartName(partName) : null,
          voiceId,
          measures: measuresByVoice[voiceId] || [[]]
        };
      });
      const measureCount = parts.reduce((acc, part) => Math.max(acc, part.measures.length), 0);

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
        parts,
        measures: parts[0] ? parts[0].measures : [[]],
        voiceCount: parts.length,
        measureCount,
        noteCount,
        warnings
      };
    }

    function parseScoreVoiceOrder(raw, declaredVoiceIds) {
      const baseOrder = Array.from(declaredVoiceIds || []);
      if (!raw) {
        return baseOrder.length > 0 ? baseOrder : ["1"];
      }

      const ordered = [];
      const seen = new Set();
      const groupRegex = /\(([^)]*)\)|([^\s()]+)/g;
      let m;
      while ((m = groupRegex.exec(raw)) !== null) {
        const chunk = m[1] || m[2] || "";
        const ids = chunk
          .split(/\s+/)
          .map((v) => v.trim())
          .filter((v) => /^[A-Za-z0-9_.-]+$/.test(v));
        for (const id of ids) {
          if (!seen.has(id)) {
            seen.add(id);
            ordered.push(id);
          }
        }
      }
      for (const id of baseOrder) {
        if (!seen.has(id)) {
          seen.add(id);
          ordered.push(id);
        }
      }
      return ordered.length > 0 ? ordered : ["1"];
    }

    function parseVoiceDirectiveTail(raw) {
      if (!raw) {
        return { name: "", bodyText: "" };
      }
      let bodyText = String(raw);
      let name = "";
      const attrRegex = /([A-Za-z][A-Za-z0-9_-]*)\s*=\s*("([^"]*)"|(\S+))/g;
      bodyText = bodyText.replace(attrRegex, (_full, key, _quotedValue, quotedInner, bareValue) => {
        if (String(key).toLowerCase() === "name") {
          name = quotedInner || bareValue || "";
        }
        return " ";
      });
      return {
        name: name.trim(),
        bodyText: bodyText.trim()
      };
    }

    function inferTransposeFromPartName(partName) {
      if (!partName) {
        return null;
      }
      const normalized = String(partName).replace(/[♭]/g, "b").replace(/[♯]/g, "#");
      const m = normalized.match(/\bin\s+([A-Ga-g])([#b]?)/);
      if (!m) {
        return null;
      }

      const tonic = String(m[1]).toUpperCase() + (m[2] || "");
      const semitoneByTonic = {
        C: 0,
        "C#": 1,
        Db: 1,
        D: 2,
        "D#": 3,
        Eb: 3,
        E: 4,
        F: 5,
        "F#": 6,
        Gb: 6,
        G: 7,
        "G#": 8,
        Ab: 8,
        A: 9,
        "A#": 10,
        Bb: 10,
        B: 11
      };
      if (!Object.prototype.hasOwnProperty.call(semitoneByTonic, tonic)) {
        return null;
      }
      let chromatic = semitoneByTonic[tonic];
      if (chromatic > 6) {
        chromatic -= 12;
      }
      if (chromatic === 0) {
        return null;
      }
      return { chromatic };
    }

    function parseMeter(raw, warnings) {
      const normalized = String(raw || "").trim();
      if (normalized === "C") {
        return { beats: 4, beatType: 4 };
      }
      if (normalized === "C|") {
        return { beats: 2, beatType: 2 };
      }
      const m = normalized.match(/^(\d+)\/(\d+)$/);
      if (!m) {
        warnings.push("拍子 M: の形式が不正なため 4/4 を使用しました: " + raw);
        return { beats: 4, beatType: 4 };
      }
      return { beats: Number(m[1]), beatType: Number(m[2]) };
    }

    function parseFraction(raw, fieldName, warnings) {
      const parsed = abcCommon.parseFractionText(raw, { num: 1, den: 8 });
      if (parsed.num === 1 && parsed.den === 8 && !/^\s*\d+\/\d+\s*$/.test(String(raw || ""))) {
        warnings.push(fieldName + " の形式が不正なため 1/8 を使用しました: " + raw);
        return parsed;
      }
      const m = String(raw || "").match(/^\s*(\d+)\/(\d+)\s*$/);
      if (!m || !Number(m[1]) || !Number(m[2])) {
        warnings.push(fieldName + " の値が不正なため 1/8 を使用しました: " + raw);
        return { num: 1, den: 8 };
      }
      return parsed;
    }

    function parseKey(raw, warnings) {
      const key = raw.trim();
      const fifths = abcCommon.fifthsFromAbcKey(key);
      if (fifths !== null) {
        return { fifths };
      }

      warnings.push("K: 非対応キーのため C を使用しました: " + key);
      return { fifths: 0 };
    }

    function parseLengthToken(token, lineNo) {
      return abcCommon.parseAbcLengthToken(token, lineNo);
    }

    function buildNoteData(
      pitchChar,
      accidental,
      octaveShift,
      absoluteLength,
      duration,
      lineNo,
      keySignatureAccidentals,
      measureAccidentals
    ) {
      const isRest = /[zZxX]/.test(pitchChar);
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
        measureAccidentals[step] = 1;
      } else if (accidental === "_") {
        alter = -1;
        accidentalText = "flat";
        measureAccidentals[step] = -1;
      } else if (accidental === "=") {
        alter = 0;
        accidentalText = "natural";
        measureAccidentals[step] = 0;
      } else {
        let resolvedAlter = 0;
        if (Object.prototype.hasOwnProperty.call(measureAccidentals, step)) {
          resolvedAlter = measureAccidentals[step];
        } else if (Object.prototype.hasOwnProperty.call(keySignatureAccidentals, step)) {
          resolvedAlter = keySignatureAccidentals[step];
        }
        alter = resolvedAlter === 0 ? null : resolvedAlter;
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

    function keySignatureAlterByStep(fifths) {
      const map = {};
      const sharpOrder = ["F", "C", "G", "D", "A", "E", "B"];
      const flatOrder = ["B", "E", "A", "D", "G", "C", "F"];
      const f = Number.isFinite(fifths) ? Math.max(-7, Math.min(7, Math.trunc(fifths))) : 0;
      if (f > 0) {
        for (let i = 0; i < f; i += 1) {
          map[sharpOrder[i]] = 1;
        }
      } else if (f < 0) {
        for (let i = 0; i < Math.abs(f); i += 1) {
          map[flatOrder[i]] = -1;
        }
      }
      return map;
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

    function typeFromDuration(duration, divisionsPerQuarter) {
      const whole = Number(duration) / (4 * divisionsPerQuarter);
      if (whole >= 1) {
        return "whole";
      }
      if (whole >= 0.5) {
        return "half";
      }
      if (whole >= 0.25) {
        return "quarter";
      }
      if (whole >= 0.125) {
        return "eighth";
      }
      if (whole >= 0.0625) {
        return "16th";
      }
      return "32nd";
    }

    function multiplyFractions(a, b) {
      return abcCommon.multiplyFractions(a, b, { num: 1, den: 1 });
    }

    function reduceFraction(num, den) {
      return abcCommon.reduceFraction(num, den, { num: 1, den: 8 });
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

    function playSine() {
      if (!lastSynthSchedule || lastSynthSchedule.events.length === 0) {
        setError("先に変換してください。");
        return;
      }
      synthEngine.playSchedule(lastSynthSchedule, "sine").then(() => {
        clearError();
        showToast("sine再生を開始しました。");
      }).catch((error) => {
        setError("sine再生に失敗しました: " + (error && error.message ? error.message : String(error)));
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
        defaultComposer: defaultComposerInput.value,
        inferTransposeFromPartName: !!inferTransposeFromPartNameCheckbox.checked
      };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(payload));
    }

    function restoreSettings() {
      inferTransposeFromPartNameCheckbox.checked = true;
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
          if (typeof data.inferTransposeFromPartName === "boolean") {
            inferTransposeFromPartNameCheckbox.checked = data.inferTransposeFromPartName;
          }
        }
      } catch (_error) {
        // ignore broken localStorage
        inferTransposeFromPartNameCheckbox.checked = true;
      }
    }
