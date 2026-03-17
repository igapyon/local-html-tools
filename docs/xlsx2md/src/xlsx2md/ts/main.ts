(() => {
  type MarkdownOptions = {
    treatFirstRowAsHeader: boolean;
    trimText: boolean;
    removeEmptyRows: boolean;
    removeEmptyColumns: boolean;
    outputMode: "display" | "raw" | "both";
  };

  type WorkbookFile = {
    fileName: string;
    sheetName: string;
    markdown: string;
    summary: {
      outputMode: "display" | "raw" | "both";
      tables: number;
      narrativeBlocks: number;
      merges: number;
      images: number;
      cells: number;
      tableScores: Array<{
        range: string;
        score: number;
        reasons: string[];
      }>;
      formulaDiagnostics: Array<{
        address: string;
        formulaText: string;
        status: "resolved" | "fallback_formula" | "unsupported_external" | null;
        outputValue: string;
      }>;
    };
  };

  type ParsedWorkbook = {
    name: string;
    sheets: Array<{ name: string; index: number }>;
  };

  const xlsx2md = (globalThis as typeof globalThis & {
    __xlsx2md?: {
      parseWorkbook: (arrayBuffer: ArrayBuffer, workbookName?: string) => Promise<ParsedWorkbook & { sheets: Array<Record<string, unknown>> }>;
      convertWorkbookToMarkdownFiles: (workbook: ParsedWorkbook & { sheets: Array<Record<string, unknown>> }, options?: MarkdownOptions) => WorkbookFile[];
      createSummaryText: (file: WorkbookFile) => string;
      createWorkbookExportArchive: (workbook: ParsedWorkbook & { sheets: Array<Record<string, unknown>> }, files: WorkbookFile[]) => Uint8Array;
    };
  }).__xlsx2md;

  if (!xlsx2md) {
    throw new Error("xlsx2md core module is not loaded");
  }

  let currentWorkbook: (ParsedWorkbook & { sheets: Array<Record<string, unknown>> }) | null = null;
  let currentFiles: WorkbookFile[] = [];

  function getElement<T extends HTMLElement>(id: string): T {
    const element = document.getElementById(id);
    if (!element) {
      throw new Error(`Element not found: ${id}`);
    }
    return element as T;
  }

  function getSwitchValue(id: string): boolean {
    const element = getElement<HTMLInputElement>(id);
    return !!element.checked;
  }

  function getOptions(): MarkdownOptions {
    const outputModeSelect = getElement<HTMLElement>("outputModeSelect") as HTMLElement & { getValue?: () => string };
    const outputMode = typeof outputModeSelect.getValue === "function"
      ? outputModeSelect.getValue()
      : (document.getElementById("outputModeSelect") as HTMLSelectElement | null)?.value || "display";
    return {
      treatFirstRowAsHeader: getSwitchValue("headerRowEnabled"),
      trimText: getSwitchValue("trimTextEnabled"),
      removeEmptyRows: getSwitchValue("removeEmptyRowsEnabled"),
      removeEmptyColumns: getSwitchValue("removeEmptyColumnsEnabled"),
      outputMode: outputMode === "raw" || outputMode === "both" ? outputMode : "display"
    };
  }

  function getSelectedOutputMode(): "display" | "raw" | "both" {
    return getOptions().outputMode;
  }

  function showToast(message: string): void {
    const toast = document.getElementById("toast") as (HTMLElement & { show?: (text: string, duration?: number) => void }) | null;
    if (toast && typeof toast.show === "function") {
      toast.show(message, 2200);
    }
  }

  function setSummaryText(message: string): void {
    getElement<HTMLElement>("analysisSummary").textContent = message;
  }

  function setSheetSummary(message: string): void {
    getElement<HTMLElement>("sheetSummary").textContent = message;
  }

  function setScoreSummary(message: string): void {
    getElement<HTMLElement>("scoreSummary").textContent = message;
  }

  function setFormulaSummary(message: string): void {
    getElement<HTMLElement>("formulaSummary").textContent = message;
  }

  function updateOutputModeNotice(mode: "display" | "raw" | "both"): void {
    const notice = getElement<HTMLElement>("outputModeNotice");
    if (mode === "raw") {
      notice.textContent = "`raw` は Excel の表示値ではなく、内部値を優先して Markdown に出力します。";
      return;
    }
    if (mode === "both") {
      notice.textContent = "`both` は表示値に加えて `[raw=...]` 形式の補助情報を出力します。";
      return;
    }
    notice.textContent = "`display` は Excel の表示値寄りで出力します。";
  }

  function updatePreviewModeBanner(mode: "display" | "raw" | "both"): void {
    const banner = getElement<HTMLElement>("previewModeBanner");
    if (mode === "raw") {
      banner.hidden = false;
      banner.textContent = "`raw` モードです。Markdown には Excel の表示値ではなく内部値が出ます。";
      return;
    }
    if (mode === "both") {
      banner.hidden = false;
      banner.textContent = "`both` モードです。Markdown には表示値に加えて `[raw=...]` が出ます。";
      return;
    }
    banner.hidden = true;
    banner.textContent = "";
  }

  function formatFormulaDiagnostics(files: WorkbookFile[]): string {
    const lines = files.flatMap((file) => {
      const diagnostics = file.summary.formulaDiagnostics;
      if (diagnostics.length === 0) {
        return [];
      }
      return diagnostics.map((diagnostic) => (
        `${file.sheetName} ${diagnostic.address}: [${diagnostic.status}] ${diagnostic.formulaText} => ${diagnostic.outputValue}`
      ));
    });
    return lines.join("\n") || "数式セルはありません。";
  }

  function setPreviewMarkdown(markdown: string): void {
    const preview = getElement<HTMLElement>("markdownPreview") as HTMLElement & { setText?: (text: string) => void };
    if (typeof preview.setText === "function") {
      preview.setText(markdown);
      return;
    }
    getElement<HTMLElement>("markdownOutput").textContent = markdown;
  }

  function clearError(): void {
    const errorAlert = getElement<HTMLElement>("errorAlert") as HTMLElement & { clear?: () => void };
    if (typeof errorAlert.clear === "function") {
      errorAlert.clear();
    } else {
      errorAlert.removeAttribute("active");
      errorAlert.textContent = "";
    }
  }

  function showError(message: string): void {
    const errorAlert = getElement<HTMLElement>("errorAlert") as HTMLElement & { show?: (text: string) => void };
    if (typeof errorAlert.show === "function") {
      errorAlert.show(message);
    } else {
      errorAlert.textContent = message;
      errorAlert.setAttribute("active", "");
    }
  }

  function setLoading(active: boolean, message?: string): void {
    const overlay = getElement<HTMLElement>("loadingOverlay") as HTMLElement & { show?: (text?: string) => void; hide?: () => void };
    if (active) {
      if (message) {
        overlay.setAttribute("text", message);
      }
      if (typeof overlay.show === "function") {
        overlay.show(message || "処理中です");
      } else {
        overlay.setAttribute("active", "");
      }
      return;
    }
    if (typeof overlay.hide === "function") {
      overlay.hide();
    } else {
      overlay.removeAttribute("active");
    }
  }

  function updateSheetOptions(): void {
    const select = getElement<HTMLElement>("sheetSelect") as HTMLElement & {
      setOptions?: (options: Array<{ value: string; label: string; selected?: boolean }>) => void;
      getValue?: () => string;
      setValue?: (value: string) => void;
    };
    if (!currentWorkbook || currentWorkbook.sheets.length === 0) {
      if (typeof select.setOptions === "function") {
        select.setOptions([{ value: "", label: "xlsx を読み込んでください", selected: true }]);
      }
      setSheetSummary("Workbook 未読込");
      return;
    }
    const options = [
      { value: "__all__", label: "全シート", selected: true },
      ...currentWorkbook.sheets.map((sheet) => ({
        value: String(sheet.name),
        label: String(sheet.name)
      }))
    ];
    if (typeof select.setOptions === "function") {
      select.setOptions(options);
    }
    setSheetSummary(`${currentWorkbook.name} / ${currentWorkbook.sheets.length} sheets`);
  }

  function renderCurrentSelection(): void {
    if (!currentFiles.length) {
      setSummaryText("まだ変換していません。");
      setScoreSummary("まだ変換していません。");
      setFormulaSummary("まだ変換していません。");
      setPreviewMarkdown("");
      updatePreviewModeBanner(getSelectedOutputMode());
      return;
    }
    const select = getElement<HTMLElement>("sheetSelect") as HTMLElement & {
      getValue?: () => string;
    };
    const selectedValue = typeof select.getValue === "function"
      ? select.getValue()
      : (document.getElementById("sheetSelect") as HTMLSelectElement | null)?.value || "__all__";
    if (!selectedValue || selectedValue === "__all__") {
      const combinedMarkdown = currentFiles.map((file) => `<!-- ${file.fileName} -->\n${file.markdown}`).join("\n\n");
      const totalTables = currentFiles.reduce((sum, file) => sum + file.summary.tables, 0);
      const totalNarratives = currentFiles.reduce((sum, file) => sum + file.summary.narrativeBlocks, 0);
      const totalMerges = currentFiles.reduce((sum, file) => sum + file.summary.merges, 0);
      const totalImages = currentFiles.reduce((sum, file) => sum + file.summary.images, 0);
      const totalCells = currentFiles.reduce((sum, file) => sum + file.summary.cells, 0);
      const outputMode = currentFiles[0]?.summary.outputMode || "display";
      updatePreviewModeBanner(outputMode);
      setSummaryText([
        `出力ファイル数: ${currentFiles.length}`,
        `出力モード: ${outputMode}`,
        `表: ${totalTables}`,
        `地の文ブロック: ${totalNarratives}`,
        `結合セル範囲: ${totalMerges}`,
        `画像: ${totalImages}`,
        `解析セル数: ${totalCells}`
      ].join("\n"));
      setScoreSummary(
        currentFiles
          .flatMap((file) => file.summary.tableScores.map((detail) => `${file.sheetName} ${detail.range}: ${detail.score}点 / ${detail.reasons.join(", ")}`))
          .join("\n") || "表候補はありません。"
      );
      setFormulaSummary(formatFormulaDiagnostics(currentFiles));
      setPreviewMarkdown(combinedMarkdown);
      getElement<HTMLButtonElement>("downloadBtn").disabled = false;
      getElement<HTMLButtonElement>("exportZipBtn").disabled = false;
      return;
    }

    const matched = currentFiles.find((file) => file.sheetName === selectedValue);
    if (!matched) {
      setSummaryText("選択シートの出力が見つかりません。");
      setPreviewMarkdown("");
      updatePreviewModeBanner(getSelectedOutputMode());
      return;
    }
    updatePreviewModeBanner(matched.summary.outputMode);
    setSummaryText(xlsx2md.createSummaryText(matched));
    setScoreSummary(
      matched.summary.tableScores.map((detail) => `${detail.range}: ${detail.score}点 / ${detail.reasons.join(", ")}`).join("\n") || "表候補はありません。"
    );
    setFormulaSummary(formatFormulaDiagnostics([matched]));
    setPreviewMarkdown(matched.markdown);
    getElement<HTMLButtonElement>("downloadBtn").disabled = false;
    getElement<HTMLButtonElement>("exportZipBtn").disabled = false;
  }

  function getSelectedFileForDownload(): { fileName: string; content: string } | null {
    if (!currentFiles.length) return null;
    const select = getElement<HTMLElement>("sheetSelect") as HTMLElement & { getValue?: () => string };
    const selectedValue = typeof select.getValue === "function"
      ? select.getValue()
      : (document.getElementById("sheetSelect") as HTMLSelectElement | null)?.value || "__all__";
    if (!selectedValue || selectedValue === "__all__") {
      const outputMode = currentFiles[0]?.summary.outputMode || "display";
      const suffix = outputMode === "display" ? "" : `_${outputMode}`;
      return {
        fileName: `${(currentWorkbook?.name || "workbook").replace(/\.xlsx$/i, "")}_all${suffix}.md`,
        content: currentFiles.map((file) => `<!-- ${file.fileName} -->\n${file.markdown}`).join("\n\n")
      };
    }
    const matched = currentFiles.find((file) => file.sheetName === selectedValue);
    if (!matched) return null;
    return {
      fileName: matched.fileName,
      content: matched.markdown
    };
  }

  function downloadCurrentMarkdown(): void {
    const payload = getSelectedFileForDownload();
    if (!payload) {
      showError("保存対象の Markdown がありません");
      return;
    }
    const blob = new Blob([`${payload.content}\n`], { type: "text/markdown;charset=utf-8" });
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = payload.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
    showToast("Markdown を保存しました");
  }

  function downloadExportZip(): void {
    if (!currentWorkbook || currentFiles.length === 0) {
      showError("先に Markdown を生成してください");
      return;
    }
    const zipBytes = xlsx2md.createWorkbookExportArchive(currentWorkbook, currentFiles);
    const outputMode = currentFiles[0]?.summary.outputMode || "display";
    const suffix = outputMode === "display" ? "" : `_${outputMode}`;
    const blob = new Blob([zipBytes], { type: "application/zip" });
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = `${currentWorkbook.name.replace(/\.xlsx$/i, "")}_xlsx2md_export${suffix}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
    showToast("ZIP を保存しました");
  }

  async function loadWorkbookFromFile(file: File): Promise<void> {
    clearError();
    setLoading(true, "xlsx を読み込んでいます");
    try {
      const arrayBuffer = await file.arrayBuffer();
      currentWorkbook = await xlsx2md.parseWorkbook(arrayBuffer, file.name);
      currentFiles = [];
      updateSheetOptions();
      setSummaryText(`${file.name} を読み込みました。変換ボタンを押してください。`);
      setScoreSummary("まだ変換していません。");
      setFormulaSummary("まだ変換していません。");
      setPreviewMarkdown("");
      getElement<HTMLButtonElement>("downloadBtn").disabled = true;
      getElement<HTMLButtonElement>("exportZipBtn").disabled = true;
      showToast("xlsx を読み込みました");
    } catch (error) {
      currentWorkbook = null;
      currentFiles = [];
      updateSheetOptions();
      setSummaryText("Workbook の読込に失敗しました。");
      setScoreSummary("まだ変換していません。");
      setFormulaSummary("まだ変換していません。");
      setPreviewMarkdown("");
      getElement<HTMLButtonElement>("downloadBtn").disabled = true;
      getElement<HTMLButtonElement>("exportZipBtn").disabled = true;
      showError(error instanceof Error ? error.message : "xlsx の読込に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  function bindFileInput(): void {
    const fileInput = getElement<HTMLInputElement>("xlsxFileInput");
    fileInput.addEventListener("change", async () => {
      const file = fileInput.files?.[0];
      if (!file) return;
      await loadWorkbookFromFile(file);
    });
  }

  function bindActions(): void {
    getElement<HTMLButtonElement>("convertBtn").addEventListener("click", () => {
      clearError();
      if (!currentWorkbook) {
        showError("先に xlsx ファイルを読み込んでください");
        return;
      }
      try {
        currentFiles = xlsx2md.convertWorkbookToMarkdownFiles(currentWorkbook, getOptions());
        renderCurrentSelection();
        showToast("Markdown を生成しました");
      } catch (error) {
        showError(error instanceof Error ? error.message : "Markdown 生成に失敗しました");
      }
    });
    getElement<HTMLButtonElement>("downloadBtn").addEventListener("click", () => {
      downloadCurrentMarkdown();
    });
    getElement<HTMLButtonElement>("exportZipBtn").addEventListener("click", () => {
      downloadExportZip();
    });
    getElement<HTMLElement>("sheetSelect").addEventListener("change", () => {
      renderCurrentSelection();
    });
    getElement<HTMLElement>("outputModeSelect").addEventListener("change", () => {
      const mode = getSelectedOutputMode();
      updateOutputModeNotice(mode);
      if (!currentFiles.length) {
        updatePreviewModeBanner(mode);
      }
    });
  }

  function initialize(): void {
    clearError();
    setSummaryText("まだ変換していません。");
    setSheetSummary("Workbook 未読込");
    setScoreSummary("まだ変換していません。");
    setFormulaSummary("まだ変換していません。");
    setPreviewMarkdown("");
    updateOutputModeNotice(getSelectedOutputMode());
    updatePreviewModeBanner(getSelectedOutputMode());
    getElement<HTMLButtonElement>("downloadBtn").disabled = true;
    getElement<HTMLButtonElement>("exportZipBtn").disabled = true;
    updateSheetOptions();
    bindFileInput();
    bindActions();
  }

  document.addEventListener("DOMContentLoaded", initialize);
})();
