(() => {
  const mikuprojectXml = (globalThis as typeof globalThis & {
    __mikuprojectXml?: {
      SAMPLE_XML: string;
      importMsProjectXml: (xmlText: string) => ProjectModel;
      exportMsProjectXml: (model: ProjectModel) => string;
      normalizeProjectModel: (model: ProjectModel) => ProjectModel;
      validateProjectModel: (model: ProjectModel) => ValidationIssue[];
    };
  }).__mikuprojectXml;

  if (!mikuprojectXml) {
    throw new Error("mikuproject XML module is not loaded");
  }

  let currentModel: ProjectModel | null = null;

  function getElement<T extends HTMLElement>(id: string): T {
    const element = document.getElementById(id);
    if (!element) {
      throw new Error(`Element not found: ${id}`);
    }
    return element as T;
  }

  function getTextArea(id: string): HTMLTextAreaElement {
    return getElement<HTMLTextAreaElement>(id);
  }

  function showToast(message: string): void {
    const toast = document.getElementById("toast") as (HTMLElement & { show?: (text: string, duration?: number) => void }) | null;
    if (toast && typeof toast.show === "function") {
      toast.show(message, 2200);
    }
  }

  function setStatus(message: string): void {
    getElement<HTMLElement>("statusMessage").textContent = message;
  }

  function renderPreviewList(containerId: string, items: string[]): void {
    const container = getElement<HTMLElement>(containerId);
    if (items.length === 0) {
      container.innerHTML = `<div class="md-preview-empty">まだ表示できる項目がありません。</div>`;
      return;
    }
    container.innerHTML = items.join("");
  }

  function renderValidationIssues(issues: ValidationIssue[]): void {
    const container = getElement<HTMLElement>("validationIssues");
    if (issues.length === 0) {
      container.classList.add("md-hidden");
      container.innerHTML = "";
      return;
    }
    const sections: ValidationIssue["scope"][] = ["project", "tasks", "resources", "assignments", "calendars"];
    const sectionLabels: Record<ValidationIssue["scope"], string> = {
      project: "Project",
      tasks: "Tasks",
      resources: "Resources",
      assignments: "Assignments",
      calendars: "Calendars"
    };
    container.classList.remove("md-hidden");
    container.innerHTML = `
      <div class="md-issues__title">検証メッセージ</div>
      ${sections
        .map((scope) => {
          const scopedIssues = issues.filter((issue) => issue.scope === scope);
          if (scopedIssues.length === 0) {
            return "";
          }
          return `
            <div class="md-issues__section">
              <div class="md-issues__section-title">${sectionLabels[scope]}</div>
              <ul class="md-issues__list">
                ${scopedIssues.map((issue) => `<li class="md-issues__item">[${issue.level}] ${issue.message}</li>`).join("")}
              </ul>
            </div>
          `;
        })
        .join("")}
    `;
  }

  function updateSummary(model: ProjectModel | null): void {
    getElement<HTMLElement>("summaryProjectName").textContent = model?.project.name || "-";
    getElement<HTMLElement>("summaryTaskCount").textContent = String(model?.tasks.length || 0);
    getElement<HTMLElement>("summaryResourceCount").textContent = String(model?.resources.length || 0);
    getElement<HTMLElement>("summaryAssignmentCount").textContent = String(model?.assignments.length || 0);
    getElement<HTMLElement>("summaryCalendarCount").textContent = String(model?.calendars.length || 0);
    getTextArea("modelOutput").value = model ? JSON.stringify(model, null, 2) : "";
    renderPreviewList("taskPreview", model ? model.tasks.map((task) => `
      <div class="md-preview-item">
        <div class="md-preview-item__title">${task.name || "(no name)"}</div>
        <div class="md-preview-item__meta">UID=${task.uid} / ID=${task.id} / Outline=${task.outlineNumber || task.outlineLevel}
Start=${task.start || "-"}
Finish=${task.finish || "-"}
Predecessors=${task.predecessors.map((item) => item.predecessorUid).join(", ") || "-"}</div>
      </div>
    `) : []);
    renderPreviewList("resourcePreview", model ? model.resources.map((resource) => `
      <div class="md-preview-item">
        <div class="md-preview-item__title">${resource.name || "(no name)"}</div>
        <div class="md-preview-item__meta">UID=${resource.uid} / ID=${resource.id}
Initials=${resource.initials || "-"}
Group=${resource.group || "-"}</div>
      </div>
    `) : []);
    renderPreviewList("assignmentPreview", model ? model.assignments.map((assignment) => `
      <div class="md-preview-item">
        <div class="md-preview-item__title">Assignment ${assignment.uid || "-"}</div>
        <div class="md-preview-item__meta">TaskUID=${assignment.taskUid}
ResourceUID=${assignment.resourceUid}
Start=${assignment.start || "-"}
Finish=${assignment.finish || "-"}</div>
      </div>
    `) : []);
  }

  function loadSample(): void {
    getTextArea("xmlInput").value = mikuprojectXml.SAMPLE_XML;
    setStatus("サンプル XML を読み込みました");
  }

  async function importXmlFromFile(file: File | null | undefined): Promise<void> {
    if (!file) {
      return;
    }
    const xmlText = await file.text();
    getTextArea("xmlInput").value = xmlText;
    setStatus("XML ファイルを読み込みました");
    showToast("XML を読み込みました");
  }

  function parseCurrentXml(): void {
    const xmlText = getTextArea("xmlInput").value.trim();
    if (!xmlText) {
      setStatus("XML が空です");
      return;
    }
    currentModel = mikuprojectXml.importMsProjectXml(xmlText);
    const issues = mikuprojectXml.validateProjectModel(currentModel);
    updateSummary(currentModel);
    renderValidationIssues(issues);
    setStatus(issues.length > 0 ? `XML を解析しました。検証で ${issues.length} 件の問題があります` : "XML を内部モデルへ変換しました");
    showToast("XML を解析しました");
  }

  function exportCurrentModel(): void {
    if (!currentModel) {
      setStatus("内部モデルがありません");
      return;
    }
    getTextArea("xmlInput").value = mikuprojectXml.exportMsProjectXml(currentModel);
    renderValidationIssues([]);
    setStatus("内部モデルから XML を再生成しました");
    showToast("XML を再生成しました");
  }

  function downloadCurrentXml(): void {
    const xmlText = getTextArea("xmlInput").value.trim();
    if (!xmlText) {
      setStatus("出力する XML がありません");
      return;
    }
    const blob = new Blob([`${xmlText}\n`], { type: "application/xml;charset=utf-8" });
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const now = new Date();
    const stamp = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, "0"),
      String(now.getDate()).padStart(2, "0"),
      String(now.getHours()).padStart(2, "0"),
      String(now.getMinutes()).padStart(2, "0")
    ].join("");
    link.href = objectUrl;
    link.download = `mikuproject-export-${stamp}.xml`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
    setStatus("XML ファイルをエクスポートしました");
    showToast("XML を保存しました");
  }

  function runRoundTripCheck(): void {
    if (!currentModel) {
      parseCurrentXml();
      if (!currentModel) {
        return;
      }
    }
    const exportedXml = mikuprojectXml.exportMsProjectXml(currentModel);
    const reparsedModel = mikuprojectXml.importMsProjectXml(exportedXml);
    const validationIssues = mikuprojectXml.validateProjectModel(reparsedModel);
    renderValidationIssues(validationIssues);
    if (validationIssues.some((issue) => issue.level === "error")) {
      throw new Error(validationIssues.map((issue) => issue.message).join("\n"));
    }
    const normalizedLeft = JSON.stringify(mikuprojectXml.normalizeProjectModel(currentModel));
    const normalizedRight = JSON.stringify(mikuprojectXml.normalizeProjectModel(reparsedModel));
    if (normalizedLeft !== normalizedRight) {
      throw new Error("再読込後の内部モデルが一致しません");
    }
    setStatus("再読込テストに成功しました");
    showToast("再読込テスト成功");
  }

  function bindEvents(): void {
    getElement<HTMLButtonElement>("loadSampleBtn").addEventListener("click", loadSample);
    getElement<HTMLButtonElement>("importXmlBtn").addEventListener("click", () => {
      getElement<HTMLInputElement>("importXmlInput").click();
    });
    getElement<HTMLButtonElement>("parseXmlBtn").addEventListener("click", () => {
      try {
        parseCurrentXml();
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "XML 解析に失敗しました");
      }
    });
    getElement<HTMLButtonElement>("exportXmlBtn").addEventListener("click", () => {
      try {
        exportCurrentModel();
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "XML 再生成に失敗しました");
      }
    });
    getElement<HTMLButtonElement>("downloadXmlBtn").addEventListener("click", () => {
      try {
        downloadCurrentXml();
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "XML 保存に失敗しました");
      }
    });
    getElement<HTMLButtonElement>("roundTripBtn").addEventListener("click", () => {
      try {
        runRoundTripCheck();
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "再読込テストに失敗しました");
      }
    });
    getElement<HTMLInputElement>("importXmlInput").addEventListener("change", async (event) => {
      const input = event.target as HTMLInputElement | null;
      const file = input?.files && input.files[0];
      try {
        await importXmlFromFile(file);
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "XML 読み込みに失敗しました");
      } finally {
        if (input) {
          input.value = "";
        }
      }
    });
  }

  function initialize(): void {
    bindEvents();
    updateSummary(null);
    renderValidationIssues([]);
    loadSample();
  }

  document.addEventListener("DOMContentLoaded", initialize);
})();
