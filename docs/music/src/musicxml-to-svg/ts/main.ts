/*
 * Copyright 2026 Toshiki Iga
 * SPDX-License-Identifier: Apache-2.0
 */

const musicXmlCommon = window["MusicXmlCommon"] || (typeof MusicXmlCommon !== "undefined" ? MusicXmlCommon : null);
const musicXmlSynthScheduleCommon = window["MusicXmlSynthScheduleCommon"] || (typeof MusicXmlSynthScheduleCommon !== "undefined" ? MusicXmlSynthScheduleCommon : null);
const musicSynthCommon = window["MusicSynthCommon"] || (typeof MusicSynthCommon !== "undefined" ? MusicSynthCommon : null);
if (!musicXmlCommon) {
  throw new Error("MusicXmlCommon is not loaded.");
}
if (!musicXmlSynthScheduleCommon) {
  throw new Error("MusicXmlSynthScheduleCommon is not loaded.");
}
if (!musicSynthCommon) {
  throw new Error("MusicSynthCommon is not loaded.");
}
const musicxmlInput = document.getElementById("musicxmlInput");
    const fileInput = document.getElementById("fileInput");
    const inputModeSourceRadio = document.getElementById("inputModeSource");
    const inputModeFileRadio = document.getElementById("inputModeFile");
    const sourceInputBlock = document.getElementById("sourceInputBlock");
    const fileInputBlock = document.getElementById("fileInputBlock");
    const fileSelectBtn = document.getElementById("fileSelectBtn");
    const fileNameText = document.getElementById("fileNameText");
    const scaleInput = document.getElementById("scaleInput");
    const pageWidthInput = document.getElementById("pageWidthInput");
    const longLineModeInput = document.getElementById("longLineModeInput");
    const marginTopInput = document.getElementById("marginTopInput");
    const marginBottomInput = document.getElementById("marginBottomInput");
    const marginLeftInput = document.getElementById("marginLeftInput");
    const marginRightInput = document.getElementById("marginRightInput");
    const renderBtn = document.getElementById("renderBtn");
    const downloadSvgBtn = document.getElementById("downloadSvgBtn");
    const downloadZipBtn = document.getElementById("downloadZipBtn");
    const playSineBtn = document.getElementById("playSineBtn");
    const prevPageBtn = document.getElementById("prevPageBtn");
    const nextPageBtn = document.getElementById("nextPageBtn");
    const pageIndicator = document.getElementById("pageIndicator");
    const copySvgBtn = document.getElementById("copySvgBtn");
    const svgPreview = document.getElementById("svgPreview");
    const svgText = document.getElementById("svgText");
    const errorText = document.getElementById("errorText");
    const toast = document.getElementById("toast");
    const menuPanel = document.getElementById("menuPanel");
    const statusText = document.getElementById("statusText");

    const STORAGE_KEY = "diagram-musicxml-render-options";
    const MIDI_TICKS_PER_QUARTER = 128;
    const LONG_LINE_PAGE_WIDTH = 200000;

    let lastSvg = "";
    let lastSynthSchedule = null;
    let toolkit = null;
    let pageCount = 0;
    let currentPage = 0;
    let pageSvgCache = [];
    const synthEngine = musicSynthCommon.createBasicWaveSynthEngine({
      ticksPerQuarter: MIDI_TICKS_PER_QUARTER
    });

    restoreOptions();

    renderBtn.addEventListener("click", renderMusicXML);
    downloadSvgBtn.addEventListener("click", downloadCurrentSvg);
    downloadZipBtn.addEventListener("click", downloadZipAllPages);
    playSineBtn.addEventListener("click", playSine);
    prevPageBtn.addEventListener("click", showPreviousPage);
    nextPageBtn.addEventListener("click", showNextPage);
    copySvgBtn.addEventListener("click", copySvg);
    fileInput.addEventListener("change", loadMusicXMLFile);
    if (!(fileSelectBtn && fileSelectBtn.closest("lht-file-select"))) {
      fileSelectBtn.addEventListener("click", () => fileInput.click());
    }
    inputModeSourceRadio.addEventListener("change", applyInputMode);
    inputModeFileRadio.addEventListener("change", applyInputMode);
    document.addEventListener("click", handleDocumentClick);

    [
      scaleInput,
      pageWidthInput,
      marginTopInput,
      marginBottomInput,
      marginLeftInput,
      marginRightInput
    ].forEach((input) => {
      input.addEventListener("change", persistOptions);
    });
    longLineModeInput.addEventListener("change", () => {
      applyLongLineModeUiState();
      persistOptions();
    });

    applyInputMode();
    applyLongLineModeUiState();
    initVerovioToolkit();

    function initVerovioToolkit() {
      if (!window.verovio || typeof verovio.toolkit !== "function") {
        statusText.textContent = "Verovioの初期化に失敗しました。";
        setError("Verovioライブラリが読み込まれていません。");
        return;
      }

      statusText.textContent = "Verovio初期化中...";

      const maxAttempts = 200;
      let attempt = 0;

      const timer = setInterval(() => {
        attempt += 1;
        try {
          toolkit = new verovio.toolkit();
          clearInterval(timer);
          statusText.textContent = "Verovio準備完了";
          renderBtn.disabled = false;
          renderMusicXML();
        } catch (_error) {
          if (attempt >= maxAttempts) {
            clearInterval(timer);
            statusText.textContent = "Verovioの初期化に失敗しました。";
            setError("Verovioの初期化がタイムアウトしました。");
          }
        }
      }, 50);
    }

    function loadMusicXMLFile(event) {
      const file = event.target.files && event.target.files[0];
      if (!file) {
        updateFileName("");
        return;
      }
      inputModeFileRadio.checked = true;
      applyInputMode();
      updateFileName(file.name);
      musicXmlCommon.readTextFileUtf8(file, (text) => {
        musicxmlInput.value = text;
        showToast("MusicXMLを読み込みました。");
      }, () => {
        setError("ファイルの読み込みに失敗しました。");
      });
    }

    function updateFileName(name) {
      fileNameText.textContent = name || "未選択";
    }

    function renderMusicXML() {
      if (!toolkit) {
        setError("Verovioの初期化完了を待ってください。");
        return;
      }

      const source = normalizeMusicXMLSource(musicxmlInput.value);
      if (!source) {
        setError("MusicXMLを入力してください。");
        return;
      }
      const renderSource = isLongLineModeEnabled() ? removeMusicXmlForcedBreaks(source) : source;

      clearError();
      renderBtn.disabled = true;

      try {
        const options = getRenderOptions();
        toolkit.setOptions(options);
        toolkit.loadData(renderSource);

        pageCount = Number(toolkit.getPageCount()) || 0;
        if (pageCount < 1) {
          throw new Error("ページを生成できませんでした。");
        }

        pageSvgCache = new Array(pageCount + 1).fill("");
        currentPage = 1;
        showPage(currentPage);

        downloadSvgBtn.disabled = false;
        downloadZipBtn.disabled = false;
        try {
        lastSynthSchedule = musicXmlSynthScheduleCommon.buildSynthScheduleFromMusicXml(renderSource, {
          ticksPerQuarter: MIDI_TICKS_PER_QUARTER
        });
        } catch (_error) {
          lastSynthSchedule = null;
        }
        playSineBtn.disabled = !lastSynthSchedule || lastSynthSchedule.events.length === 0;

        if (pageCount > 1) {
          showToast("SVGを生成しました（ページ切替できます）。");
        } else {
          showToast("SVGを生成しました。");
        }
      } catch (error) {
        resetRenderedOutput();
        const message = error && error.message ? error.message : String(error);
        const lineNumber = extractXmlErrorLine(message);
        setError("レンダリングに失敗しました: " + message, lineNumber);
      } finally {
        renderBtn.disabled = false;
      }
    }

    function getPageSvg(pageNumber) {
      if (!Number.isInteger(pageNumber) || pageNumber < 1 || pageNumber > pageCount) {
        throw new Error("ページ番号が範囲外です。");
      }
      if (pageSvgCache[pageNumber]) {
        return pageSvgCache[pageNumber];
      }
      const svg = toolkit.renderToSVG(pageNumber, {});
      if (!svg || !svg.trim()) {
        throw new Error("ページ " + pageNumber + " のSVGが空です。");
      }
      pageSvgCache[pageNumber] = svg;
      return svg;
    }

    function showPage(pageNumber) {
      const svg = getPageSvg(pageNumber);
      currentPage = pageNumber;
      lastSvg = svg;
      svgPreview.innerHTML = svg;
      svgText.textContent = svg;
      updatePager();
    }

    function showPreviousPage() {
      if (currentPage > 1) {
        showPage(currentPage - 1);
      }
    }

    function showNextPage() {
      if (currentPage < pageCount) {
        showPage(currentPage + 1);
      }
    }

    function updatePager() {
      pageIndicator.textContent = pageCount > 0 ? (currentPage + " / " + pageCount) : "0 / 0";
      prevPageBtn.disabled = currentPage <= 1;
      nextPageBtn.disabled = currentPage >= pageCount;
    }

    function resetRenderedOutput() {
      lastSvg = "";
      pageCount = 0;
      currentPage = 0;
      pageSvgCache = [];
      svgPreview.innerHTML = "";
      svgText.textContent = "";
      lastSynthSchedule = null;
      synthEngine.stop();
      downloadSvgBtn.disabled = true;
      downloadZipBtn.disabled = true;
      playSineBtn.disabled = true;
      updatePager();
    }

    function playSine() {
      if (!lastSynthSchedule || lastSynthSchedule.events.length === 0) {
        setError("先にレンダリングしてください。");
        return;
      }
      synthEngine.playSchedule(lastSynthSchedule, "sine").then(() => {
        clearError();
        showToast("sine再生を開始しました。");
      }).catch((error) => {
        setError("sine再生に失敗しました: " + (error && error.message ? error.message : String(error)));
      });
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

    function getRenderOptions() {
      const longLineMode = isLongLineModeEnabled();
      const options = {
        scale: sanitizeNumber(scaleInput.value, 40, 20, 200),
        pageWidth: longLineMode ? LONG_LINE_PAGE_WIDTH : getPageWidthInputValue(),
        pageMarginTop: sanitizeNumber(marginTopInput.value, 40, 0, 500),
        pageMarginBottom: sanitizeNumber(marginBottomInput.value, 40, 0, 500),
        pageMarginLeft: sanitizeNumber(marginLeftInput.value, 40, 0, 500),
        pageMarginRight: sanitizeNumber(marginRightInput.value, 40, 0, 500),
        breaks: longLineMode ? "none" : "auto",
        adjustPageWidth: longLineMode
      };
      return options;
    }

    function getPageWidthInputValue() {
      return sanitizeNumber(pageWidthInput.value, 1600, 400, 50000);
    }

    function sanitizeNumber(rawValue, fallback, min, max) {
      const value = Number(rawValue);
      if (!Number.isFinite(value)) {
        return fallback;
      }
      return Math.min(max, Math.max(min, Math.round(value)));
    }

    function persistOptions() {
      const options = {
        scale: sanitizeNumber(scaleInput.value, 40, 20, 200),
        pageWidth: getPageWidthInputValue(),
        pageMarginTop: sanitizeNumber(marginTopInput.value, 40, 0, 500),
        pageMarginBottom: sanitizeNumber(marginBottomInput.value, 40, 0, 500),
        pageMarginLeft: sanitizeNumber(marginLeftInput.value, 40, 0, 500),
        pageMarginRight: sanitizeNumber(marginRightInput.value, 40, 0, 500),
        longLineMode: isLongLineModeEnabled()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(options));
    }

    function restoreOptions() {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return;
      }
      try {
        const options = JSON.parse(raw);
        if (typeof options !== "object" || !options) {
          return;
        }
        setIfFinite(scaleInput, options.scale);
        setIfFinite(pageWidthInput, options.pageWidth);
        setIfFinite(marginTopInput, options.pageMarginTop);
        setIfFinite(marginBottomInput, options.pageMarginBottom);
        setIfFinite(marginLeftInput, options.pageMarginLeft);
        setIfFinite(marginRightInput, options.pageMarginRight);
        if (typeof options.longLineMode === "boolean") {
          longLineModeInput.checked = options.longLineMode;
        }
        applyLongLineModeUiState();
      } catch (_error) {
        // Ignore broken localStorage data
      }
    }

    function isLongLineModeEnabled() {
      return Boolean(longLineModeInput && longLineModeInput.checked);
    }

    function applyLongLineModeUiState() {
      const enabled = isLongLineModeEnabled();
      pageWidthInput.disabled = enabled;
      svgPreview.classList.toggle("md-preview-stage--long-line", enabled);
    }

    function setIfFinite(input, value) {
      if (Number.isFinite(Number(value))) {
        input.value = String(value);
      }
    }

    function downloadCurrentSvg() {
      if (!lastSvg) {
        setError("先にSVGを生成してください。");
        return;
      }
      const filename = "musicxml-score-page-" + String(currentPage || 1).padStart(3, "0") + ".svg";
      const blob = new Blob([lastSvg], { type: "image/svg+xml;charset=utf-8" });
      downloadBlob(blob, filename);
      showToast("現ページのSVGを保存しました。");
    }

    async function downloadZipAllPages() {
      if (!toolkit || pageCount < 1) {
        setError("先にSVGを生成してください。");
        return;
      }
      if (typeof JSZip !== "function") {
        setError("ZIPライブラリの初期化に失敗しました。");
        return;
      }

      downloadZipBtn.disabled = true;
      const originalLabel = downloadZipBtn.textContent;
      downloadZipBtn.textContent = "ZIP作成中...";

      try {
        const zip = new JSZip();
        for (let page = 1; page <= pageCount; page += 1) {
          const svg = getPageSvg(page);
          const filename = "score-page-" + String(page).padStart(3, "0") + ".svg";
          zip.file(filename, svg);
        }
        const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE", compressionOptions: { level: 6 } });
        downloadBlob(blob, "musicxml-score-pages.zip");
        showToast("全ページをZIPで保存しました。");
      } catch (error) {
        setError("ZIP作成に失敗しました: " + (error && error.message ? error.message : String(error)));
      } finally {
        downloadZipBtn.disabled = false;
        downloadZipBtn.textContent = originalLabel;
      }
    }

    function copySvg() {
      if (!lastSvg) {
        setError("先にSVGを生成してください。");
        return;
      }
      navigator.clipboard.writeText(lastSvg).then(() => {
        clearError();
        showToast("SVGテキストをコピーしました。");
      }).catch((error) => {
        setError("コピーに失敗しました: " + (error && error.message ? error.message : String(error)));
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
        focusXmlLine(lineNumber);
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

    function normalizeMusicXMLSource(rawText) {
      return musicXmlCommon.normalizeMusicXmlSource(rawText);
    }

    function removeMusicXmlForcedBreaks(source) {
      return source
        .replace(/\s+new-system\s*=\s*"(?:yes|true|1)"/gi, "")
        .replace(/\s+new-page\s*=\s*"(?:yes|true|1)"/gi, "");
    }

    function extractXmlErrorLine(message) {
      if (!message) {
        return null;
      }
      const lineMatch = message.match(/line\s+(\d+)/i);
      if (lineMatch) {
        return Number(lineMatch[1]);
      }
      const fallback = message.match(/\((\d+):(\d+)\)/);
      if (fallback) {
        return Number(fallback[1]);
      }
      return null;
    }

    function focusXmlLine(lineNumber) {
      const text = musicxmlInput.value;
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
        currentLine++;
      }

      let end = text.indexOf("\n", start);
      if (end < 0) {
        end = text.length;
      }

      musicxmlInput.focus();
      musicxmlInput.setSelectionRange(start, end);

      const style = window.getComputedStyle(musicxmlInput);
      const lineHeight = Number.parseFloat(style.lineHeight) || 24;
      musicxmlInput.scrollTop = Math.max(0, (lineNumber - 2) * lineHeight);
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
