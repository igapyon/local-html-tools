    const mermaidInput = document.getElementById("mermaidInput");
    const themeSelect = document.getElementById("themeSelect");
    const renderBtn = document.getElementById("renderBtn");
    const svgPreview = document.getElementById("svgPreview");
    const svgText = document.getElementById("svgText");
    const errorText = document.getElementById("errorText");
    const downloadSvgBtn = document.getElementById("downloadSvgBtn");
    const copySvgBtn = document.getElementById("copySvgBtn");
    const toast = document.getElementById("toast");
    const THEME_STORAGE_KEY = "diagram-mermaid-theme";
    const DEFAULT_MERMAID_SOURCE = `flowchart TD
  A[Start] --> B{Need SVG?}
  B -->|Yes| C[Render Mermaid]
  C --> D[Download SVG]
  B -->|No| F[Edit source]`;

    let lastSvg = "";
    let renderCount = 0;

    if (!getFieldValue(mermaidInput).trim()) {
      setFieldValue(mermaidInput, DEFAULT_MERMAID_SOURCE);
    }

    restoreThemeSelection();

    mermaid.initialize({
      startOnLoad: false,
      securityLevel: "strict",
      theme: getFieldValue(themeSelect)
    });

    renderBtn.addEventListener("click", renderMermaid);
    downloadSvgBtn.addEventListener("click", downloadSvg);
    copySvgBtn.addEventListener("click", copySvg);
    themeSelect.addEventListener("change", persistThemeSelection);

    async function renderMermaid() {
      const source = normalizeMermaidSource(getFieldValue(mermaidInput));
      if (!source) {
        setError("Mermaid記法を入力してください。");
        return;
      }

      clearError();
      renderBtn.disabled = true;

      try {
        const renderId = "mermaidRender" + (++renderCount);
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: getFieldValue(themeSelect)
        });

        const result = await mermaid.render(renderId, source);
        lastSvg = normalizeSvgForXml(result.svg);
        svgPreview.innerHTML = lastSvg;
        svgText.textContent = lastSvg;

        downloadSvgBtn.disabled = false;
        showToast("SVGを生成しました。");
      } catch (error) {
        lastSvg = "";
        svgPreview.innerHTML = "";
        svgText.textContent = "";
        downloadSvgBtn.disabled = true;
        const errorMessage = error && error.message ? error.message : String(error);
        const errorLine = extractMermaidErrorLine(errorMessage);
        setError("レンダリングに失敗しました: " + errorMessage, errorLine);
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
      downloadBlob(blob, "mermaid-diagram.svg");
      showToast("SVGを保存しました。");
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

    function normalizeSvgForXml(svgText) {
      if (!svgText) {
        return "";
      }

      // Mermaid can emit HTML-style <br> inside foreignObject labels.
      // Convert them to XML-safe self-closing tags for standalone SVG consumers.
      const candidate = svgText
        .replace(/<br\s*>/gi, "<br/>")
        .replace(/<br([^/>]*)><\/br>/gi, "<br$1/>");

      try {
        const parsed = new DOMParser().parseFromString(candidate, "image/svg+xml");
        if (parsed.querySelector("parsererror")) {
          return candidate;
        }
        return new XMLSerializer().serializeToString(parsed.documentElement);
      } catch (error) {
        return candidate;
      }
    }

    function setError(message, lineNumber) {
      errorText.textContent = message;
      errorText.classList.remove("md-hidden");
      if (Number.isInteger(lineNumber) && lineNumber > 0) {
        focusMermaidLine(lineNumber);
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
    function restoreThemeSelection() {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (!savedTheme) {
        return;
      }
      if (!hasThemeOption(savedTheme)) {
        return;
      }
      setFieldValue(themeSelect, savedTheme);
    }

    function persistThemeSelection() {
      localStorage.setItem(THEME_STORAGE_KEY, getFieldValue(themeSelect));
    }

    function normalizeMermaidSource(rawText) {
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
      const hasCodeFencePair = /^```(?:[^\s`]*)?\s*$/i.test(firstLine) && /^```\s*$/.test(lastLine);
      if (hasCodeFencePair) {
        return lines.slice(first + 1, last).join("\n").trim();
      }

      return lines.slice(first, last + 1).join("\n").trim();
    }

    function extractMermaidErrorLine(message) {
      if (!message) {
        return null;
      }
      const lineMatch = message.match(/line\\s+(\\d+)/i);
      if (lineMatch) {
        return Number(lineMatch[1]);
      }
      const fallbackMatch = message.match(/\\((\\d+):(\\d+)\\)/);
      if (fallbackMatch) {
        return Number(fallbackMatch[1]);
      }
      return null;
    }

    function focusMermaidLine(lineNumber) {
      const text = getFieldValue(mermaidInput);
      if (!text) {
        return;
      }

      let currentLine = 1;
      let start = 0;
      while (currentLine < lineNumber && start < text.length) {
        const nextBreak = text.indexOf("\\n", start);
        if (nextBreak < 0) {
          start = text.length;
          break;
        }
        start = nextBreak + 1;
        currentLine++;
      }

      let end = text.indexOf("\\n", start);
      if (end < 0) {
        end = text.length;
      }

      if (typeof mermaidInput.focus === "function") {
        mermaidInput.focus();
      }
      if (typeof mermaidInput.setSelectionRange === "function") {
        mermaidInput.setSelectionRange(start, end);
        const style = window.getComputedStyle(mermaidInput);
        const lineHeight = Number.parseFloat(style.lineHeight) || 24;
        mermaidInput.scrollTop = Math.max(0, (lineNumber - 2) * lineHeight);
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

    function getFieldValue(field) {
      if (!field) return "";
      const value = field.value;
      return typeof value === "string" ? value : String(value ?? "");
    }

    function setFieldValue(field, value) {
      if (!field) return;
      field.value = value;
    }

    function hasThemeOption(value) {
      if (!themeSelect) return false;
      if (themeSelect instanceof HTMLSelectElement) {
        return Array.from(themeSelect.options).some((option) => option.value === value);
      }
      const options = Array.from(themeSelect.querySelectorAll("md-select-option"));
      return options.some((option) => {
        const optionValue = typeof option.value === "string"
          ? option.value
          : (option.getAttribute("value") || "");
        return optionValue === value;
      });
    }

    renderMermaid();
