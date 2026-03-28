/*
 * Copyright 2026 Toshiki Iga
 * SPDX-License-Identifier: Apache-2.0
 */

const abcCommon = window["AbcCommon"] || (typeof AbcCommon !== "undefined" ? AbcCommon : null);
const musicXmlCommon = window["MusicXmlCommon"] || (typeof MusicXmlCommon !== "undefined" ? MusicXmlCommon : null);
const musicXmlSynthScheduleCommon = window["MusicXmlSynthScheduleCommon"] || (typeof MusicXmlSynthScheduleCommon !== "undefined" ? MusicXmlSynthScheduleCommon : null);
const musicSynthCommon = window["MusicSynthCommon"] || (typeof MusicSynthCommon !== "undefined" ? MusicSynthCommon : null);
const musicXmlWriterCommon = window["MusicXmlWriterCommon"] || (typeof MusicXmlWriterCommon !== "undefined" ? MusicXmlWriterCommon : null);
const abcCompatParser = window["AbcCompatParser"] || (typeof AbcCompatParser !== "undefined" ? AbcCompatParser : null);
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
if (!abcCompatParser) {
  throw new Error("AbcCompatParser is not loaded.");
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
    if (!(fileSelectBtn && fileSelectBtn.closest("lht-file-select"))) {
      fileSelectBtn.addEventListener("click", () => fileInput.click());
    }
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
      return abcCompatParser.parseForMusicXml(source, settings);
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
      if (errorText && typeof errorText.show === "function") {
        errorText.show(message);
      } else if (errorText) {
        errorText.textContent = message;
        errorText.classList.remove("md-hidden");
      }
      if (Number.isInteger(lineNumber) && lineNumber > 0) {
        focusLine(lineNumber);
      }
    }

    function clearError() {
      if (errorText && typeof errorText.clear === "function") {
        errorText.clear();
      } else if (errorText) {
        errorText.textContent = "";
        errorText.classList.add("md-hidden");
      }
    }

    function clearWarning() {
      warningText.textContent = "";
      warningText.classList.add("md-hidden");
    }

    function showToast(message) {
      if (!toast || typeof toast.show !== "function") {
        return;
      }
      toast.show(message, 1400);
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
