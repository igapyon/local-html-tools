    const dotInput = document.getElementById("dotInput");
    const engineSelect = document.getElementById("engineSelect");
    const renderBtn = document.getElementById("renderBtn");
    const downloadSvgBtn = document.getElementById("downloadSvgBtn");
    const svgPreview = document.getElementById("svgPreview");
    const svgText = document.getElementById("svgText");
    const errorText = document.getElementById("errorText");
    const toast = document.getElementById("toast");

    const ENGINE_STORAGE_KEY = "diagram-graphviz-engine";

    let lastSvg = "";
    let viz = new Viz();

    restoreEngineSelection();

    renderBtn.addEventListener("click", renderDot);
    downloadSvgBtn.addEventListener("click", downloadSvg);
    engineSelect.addEventListener("change", persistEngineSelection);

    async function renderDot() {
      const source = normalizeDotSource(getFieldValue(dotInput));
      if (!source) {
        setError("DOTソースを入力してください。");
        return;
      }

      clearError();
      renderBtn.disabled = true;

      try {
        const svg = await viz.renderString(source, {
          format: "svg",
          engine: getFieldValue(engineSelect)
        });
        lastSvg = svg;
        svgPreview.innerHTML = svg;
        svgText.textContent = svg;
        downloadSvgBtn.disabled = false;
        showToast("SVGを生成しました。");
      } catch (error) {
        lastSvg = "";
        svgPreview.innerHTML = "";
        svgText.textContent = "";
        downloadSvgBtn.disabled = true;
        viz = new Viz();
        const message = error && error.message ? error.message : String(error);
        const lineNumber = extractGraphvizErrorLine(message);
        setError("レンダリングに失敗しました: " + message, lineNumber);
      } finally {
        renderBtn.disabled = false;
      }
    }

    function downloadSvg() {
      if (!lastSvg) {
        setError("先にSVGを生成してください。");
        return;
      }
      const blob = new Blob([lastSvg], { type: "image/svg+xml;charset=utf-8" });
      downloadBlob(blob, "graphviz-diagram.svg");
      showToast("SVGを保存しました。");
    }

    function setError(message, lineNumber) {
      errorText.textContent = message;
      errorText.classList.remove("md-hidden");
      if (Number.isInteger(lineNumber) && lineNumber > 0) {
        focusDotLine(lineNumber);
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
    function restoreEngineSelection() {
      const savedEngine = localStorage.getItem(ENGINE_STORAGE_KEY);
      if (!savedEngine) {
        return;
      }
      const hasOption = getSelectOptionValues(engineSelect).includes(savedEngine);
      if (hasOption) {
        setFieldValue(engineSelect, savedEngine);
      }
    }

    function persistEngineSelection() {
      localStorage.setItem(ENGINE_STORAGE_KEY, getFieldValue(engineSelect));
    }

    function normalizeDotSource(rawText) {
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

    function extractGraphvizErrorLine(message) {
      if (!message) {
        return null;
      }
      const match = message.match(/line\s+(\d+)/i);
      if (match) {
        return Number(match[1]);
      }
      return null;
    }

    function focusDotLine(lineNumber) {
      const text = getFieldValue(dotInput);
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

      if (typeof dotInput.focus === "function") {
        dotInput.focus();
      }
      if (typeof dotInput.setSelectionRange === "function") {
        dotInput.setSelectionRange(start, end);
        const style = window.getComputedStyle(dotInput);
        const lineHeight = Number.parseFloat(style.lineHeight) || 24;
        dotInput.scrollTop = Math.max(0, (lineNumber - 2) * lineHeight);
      }
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

    function getFieldValue(element) {
      if (!element) {
        return "";
      }
      const value = element.value;
      return typeof value === "string" ? value : "";
    }

    function setFieldValue(element, value) {
      if (!element) {
        return;
      }
      element.value = value;
      element.setAttribute("value", value);
    }

    function getSelectOptionValues(selectElement) {
      if (!selectElement) {
        return [];
      }
      const mdOptions = Array.from(selectElement.querySelectorAll("md-select-option"));
      if (mdOptions.length > 0) {
        return mdOptions.map((option) => {
          const value = option.value;
          if (typeof value === "string" && value.length > 0) {
            return value;
          }
          return option.getAttribute("value") || "";
        });
      }
      if (selectElement.options) {
        return Array.from(selectElement.options).map((option) => option.value);
      }
      return [];
    }

    renderDot();
