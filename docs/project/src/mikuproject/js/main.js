(() => {
    const mikuprojectXml = globalThis.__mikuprojectXml;
    if (!mikuprojectXml) {
        throw new Error("mikuproject XML module is not loaded");
    }
    let currentModel = null;
    function getElement(id) {
        const element = document.getElementById(id);
        if (!element) {
            throw new Error(`Element not found: ${id}`);
        }
        return element;
    }
    function getTextArea(id) {
        return getElement(id);
    }
    function showToast(message) {
        const toast = document.getElementById("toast");
        if (toast && typeof toast.show === "function") {
            toast.show(message, 2200);
        }
    }
    function setStatus(message) {
        getElement("statusMessage").textContent = message;
    }
    function renderPreviewList(containerId, items) {
        const container = getElement(containerId);
        if (items.length === 0) {
            container.innerHTML = `<div class="md-preview-empty">まだ表示できる項目がありません。</div>`;
            return;
        }
        container.innerHTML = items.join("");
    }
    function formatFirstBaselineSummary(item) {
        var _a, _b;
        const baseline = item.baselines[0];
        if (!baseline) {
            return "-";
        }
        return `#${(_a = baseline.number) !== null && _a !== void 0 ? _a : "-"} ${baseline.start || "-"} -> ${baseline.finish || "-"} / Work=${baseline.work || "-"} / Cost=${(_b = baseline.cost) !== null && _b !== void 0 ? _b : "-"}`;
    }
    function formatFirstTimephasedSummary(item) {
        var _a, _b;
        const timephasedData = item.timephasedData[0];
        if (!timephasedData) {
            return "-";
        }
        return `Type=${(_a = timephasedData.type) !== null && _a !== void 0 ? _a : "-"} ${timephasedData.start || "-"} -> ${timephasedData.finish || "-"} / Unit=${(_b = timephasedData.unit) !== null && _b !== void 0 ? _b : "-"} / Value=${timephasedData.value || "-"}`;
    }
    function renderValidationIssues(issues) {
        const container = getElement("validationIssues");
        if (issues.length === 0) {
            container.classList.add("md-hidden");
            container.innerHTML = "";
            return;
        }
        const sections = ["project", "tasks", "resources", "assignments", "calendars"];
        const sectionLabels = {
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
    function updateSummary(model) {
        getElement("summaryProjectName").textContent = (model === null || model === void 0 ? void 0 : model.project.name) || "-";
        getElement("summaryTaskCount").textContent = String((model === null || model === void 0 ? void 0 : model.tasks.length) || 0);
        getElement("summaryResourceCount").textContent = String((model === null || model === void 0 ? void 0 : model.resources.length) || 0);
        getElement("summaryAssignmentCount").textContent = String((model === null || model === void 0 ? void 0 : model.assignments.length) || 0);
        getElement("summaryCalendarCount").textContent = String((model === null || model === void 0 ? void 0 : model.calendars.length) || 0);
        getTextArea("modelOutput").value = model ? JSON.stringify(model, null, 2) : "";
        renderPreviewList("taskPreview", model ? model.tasks.map((task) => `
      <div class="md-preview-item">
        <div class="md-preview-item__title">${task.name || "(no name)"}</div>
        <div class="md-preview-item__meta">UID=${task.uid} / ID=${task.id} / Outline=${task.outlineNumber || task.outlineLevel}
Start=${task.start || "-"}
Finish=${task.finish || "-"}
Predecessors=${task.predecessors.map((item) => item.predecessorUid).join(", ") || "-"}
Ext=${task.extendedAttributes.length} / Baselines=${task.baselines.length} / Timephased=${task.timephasedData.length}
Baseline1=${formatFirstBaselineSummary(task)}
Timephased1=${formatFirstTimephasedSummary(task)}</div>
      </div>
    `) : []);
        renderPreviewList("resourcePreview", model ? model.resources.map((resource) => `
      <div class="md-preview-item">
        <div class="md-preview-item__title">${resource.name || "(no name)"}</div>
        <div class="md-preview-item__meta">UID=${resource.uid} / ID=${resource.id}
Initials=${resource.initials || "-"}
Group=${resource.group || "-"}
Ext=${resource.extendedAttributes.length} / Baselines=${resource.baselines.length} / Timephased=${resource.timephasedData.length}
Baseline1=${formatFirstBaselineSummary(resource)}
Timephased1=${formatFirstTimephasedSummary(resource)}</div>
      </div>
    `) : []);
        renderPreviewList("assignmentPreview", model ? model.assignments.map((assignment) => `
      <div class="md-preview-item">
        <div class="md-preview-item__title">Assignment ${assignment.uid || "-"}</div>
        <div class="md-preview-item__meta">TaskUID=${assignment.taskUid}
ResourceUID=${assignment.resourceUid}
Start=${assignment.start || "-"}
Finish=${assignment.finish || "-"}
Ext=${assignment.extendedAttributes.length} / Baselines=${assignment.baselines.length} / Timephased=${assignment.timephasedData.length}
Baseline1=${formatFirstBaselineSummary(assignment)}
Timephased1=${formatFirstTimephasedSummary(assignment)}</div>
      </div>
    `) : []);
    }
    function loadSample() {
        getTextArea("xmlInput").value = mikuprojectXml.SAMPLE_XML;
        setStatus("サンプル XML を読み込みました");
    }
    async function importXmlFromFile(file) {
        if (!file) {
            return;
        }
        const xmlText = await file.text();
        getTextArea("xmlInput").value = xmlText;
        setStatus("XML ファイルを読み込みました");
        showToast("XML を読み込みました");
    }
    function parseCurrentXml() {
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
    function exportCurrentModel() {
        if (!currentModel) {
            setStatus("内部モデルがありません");
            return;
        }
        getTextArea("xmlInput").value = mikuprojectXml.exportMsProjectXml(currentModel);
        renderValidationIssues([]);
        setStatus("内部モデルから XML を再生成しました");
        showToast("XML を再生成しました");
    }
    function downloadCurrentXml() {
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
    function runRoundTripCheck() {
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
    function bindEvents() {
        getElement("loadSampleBtn").addEventListener("click", loadSample);
        getElement("importXmlBtn").addEventListener("click", () => {
            getElement("importXmlInput").click();
        });
        getElement("parseXmlBtn").addEventListener("click", () => {
            try {
                parseCurrentXml();
            }
            catch (error) {
                setStatus(error instanceof Error ? error.message : "XML 解析に失敗しました");
            }
        });
        getElement("exportXmlBtn").addEventListener("click", () => {
            try {
                exportCurrentModel();
            }
            catch (error) {
                setStatus(error instanceof Error ? error.message : "XML 再生成に失敗しました");
            }
        });
        getElement("downloadXmlBtn").addEventListener("click", () => {
            try {
                downloadCurrentXml();
            }
            catch (error) {
                setStatus(error instanceof Error ? error.message : "XML 保存に失敗しました");
            }
        });
        getElement("roundTripBtn").addEventListener("click", () => {
            try {
                runRoundTripCheck();
            }
            catch (error) {
                setStatus(error instanceof Error ? error.message : "再読込テストに失敗しました");
            }
        });
        getElement("importXmlInput").addEventListener("change", async (event) => {
            const input = event.target;
            const file = (input === null || input === void 0 ? void 0 : input.files) && input.files[0];
            try {
                await importXmlFromFile(file);
            }
            catch (error) {
                setStatus(error instanceof Error ? error.message : "XML 読み込みに失敗しました");
            }
            finally {
                if (input) {
                    input.value = "";
                }
            }
        });
    }
    function initialize() {
        bindEvents();
        updateSummary(null);
        renderValidationIssues([]);
        loadSample();
    }
    document.addEventListener("DOMContentLoaded", initialize);
})();
