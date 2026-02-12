const musicxmlInput = document.getElementById("musicxmlInput");
    const fileInput = document.getElementById("fileInput");
    const scaleInput = document.getElementById("scaleInput");
    const pageWidthInput = document.getElementById("pageWidthInput");
    const marginTopInput = document.getElementById("marginTopInput");
    const marginBottomInput = document.getElementById("marginBottomInput");
    const marginLeftInput = document.getElementById("marginLeftInput");
    const marginRightInput = document.getElementById("marginRightInput");
    const renderBtn = document.getElementById("renderBtn");
    const downloadSvgBtn = document.getElementById("downloadSvgBtn");
    const downloadZipBtn = document.getElementById("downloadZipBtn");
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

    let lastSvg = "";
    let toolkit = null;
    let pageCount = 0;
    let currentPage = 0;
    let pageSvgCache = [];

    restoreOptions();

    renderBtn.addEventListener("click", renderMusicXML);
    downloadSvgBtn.addEventListener("click", downloadCurrentSvg);
    downloadZipBtn.addEventListener("click", downloadZipAllPages);
    prevPageBtn.addEventListener("click", showPreviousPage);
    nextPageBtn.addEventListener("click", showNextPage);
    copySvgBtn.addEventListener("click", copySvg);
    fileInput.addEventListener("change", loadMusicXMLFile);
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
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        musicxmlInput.value = String(reader.result || "");
        showToast("MusicXMLを読み込みました。");
      };
      reader.onerror = () => {
        setError("ファイルの読み込みに失敗しました。");
      };
      reader.readAsText(file, "utf-8");
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

      clearError();
      renderBtn.disabled = true;

      try {
        const options = getRenderOptions();
        toolkit.setOptions(options);
        toolkit.loadData(source);

        pageCount = Number(toolkit.getPageCount()) || 0;
        if (pageCount < 1) {
          throw new Error("ページを生成できませんでした。");
        }

        pageSvgCache = new Array(pageCount + 1).fill("");
        currentPage = 1;
        showPage(currentPage);

        downloadSvgBtn.disabled = false;
        downloadZipBtn.disabled = false;

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
      downloadSvgBtn.disabled = true;
      downloadZipBtn.disabled = true;
      updatePager();
    }

    function getRenderOptions() {
      return {
        scale: sanitizeNumber(scaleInput.value, 40, 20, 200),
        pageWidth: sanitizeNumber(pageWidthInput.value, 1600, 400, 5000),
        pageMarginTop: sanitizeNumber(marginTopInput.value, 40, 0, 500),
        pageMarginBottom: sanitizeNumber(marginBottomInput.value, 40, 0, 500),
        pageMarginLeft: sanitizeNumber(marginLeftInput.value, 40, 0, 500),
        pageMarginRight: sanitizeNumber(marginRightInput.value, 40, 0, 500)
      };
    }

    function sanitizeNumber(rawValue, fallback, min, max) {
      const value = Number(rawValue);
      if (!Number.isFinite(value)) {
        return fallback;
      }
      return Math.min(max, Math.max(min, Math.round(value)));
    }

    function persistOptions() {
      const options = getRenderOptions();
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
      } catch (_error) {
        // Ignore broken localStorage data
      }
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
      errorText.textContent = message;
      errorText.classList.remove("md-hidden");
      if (Number.isInteger(lineNumber) && lineNumber > 0) {
        focusXmlLine(lineNumber);
      }
    }

    function clearError() {
      errorText.textContent = "";
      errorText.classList.add("md-hidden");
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

    function normalizeMusicXMLSource(rawText) {
      if (!rawText) {
        return "";
      }

      const lines = rawText.split("\n");
      let first = 0;
      let last = lines.length - 1;

      while (first <= last && lines[first].trim() === "") {
        first++;
      }
      while (last >= first && lines[last].trim() === "") {
        last--;
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
