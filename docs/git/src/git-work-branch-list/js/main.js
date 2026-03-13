    const STORAGE_KEY = "gitWorkBranchList.entries";
    let entries = [];
    let editingId = "";
    let dialogMode = "create";

    function readText(id) {
      const field = document.getElementById(id);
      return field ? String(field.value || "").trim() : "";
    }

    function setText(id, value) {
      const field = document.getElementById(id);
      if (!field) return;
      field.value = value == null ? "" : String(value);
    }

    function readSelectValue(id, fallbackValue) {
      const field = document.getElementById(id);
      if (!field) return fallbackValue;
      const value = String(field.value || "").trim();
      return value || fallbackValue;
    }

    function showToast(message) {
      const toast = document.getElementById("toast");
      if (!toast || typeof toast.show !== "function") return;
      toast.show(message, 2200);
    }

    function getDialog() {
      return document.getElementById("entryDialog");
    }

    function escapeHtml(text) {
      return String(text || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    }

    function getButtonIconSvg(kind) {
      if (kind === "add") {
        return '<svg aria-hidden="true" viewBox="0 0 24 24" class="md-button__icon" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"></path><path d="M5 12h14"></path></svg>';
      }
      if (kind === "branch-diff") {
        return '<svg aria-hidden="true" viewBox="0 0 24 24" class="md-button__icon" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 7h8"></path><path d="M11 3l4 4-4 4"></path><path d="M17 17H9"></path><path d="M13 13l-4 4 4 4"></path></svg>';
      }
      if (kind === "pseudo-squash") {
        return '<svg aria-hidden="true" viewBox="0 0 24 24" class="md-button__icon" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 7h12"></path><path d="M6 12h12"></path><path d="M6 17h12"></path><path d="M9 7v10"></path></svg>';
      }
      if (kind === "edit") {
        return '<svg aria-hidden="true" viewBox="0 0 24 24" class="md-button__icon" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z"></path></svg>';
      }
      if (kind === "delete") {
        return '<svg aria-hidden="true" viewBox="0 0 24 24" class="md-button__icon" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"></path><path d="M8 6V4h8v2"></path><path d="M19 6l-1 14H6L5 6"></path><path d="M10 11v6"></path><path d="M14 11v6"></path></svg>';
      }
      return "";
    }

    function setButtonContent(button, label, iconKind) {
      if (!button) return;
      button.innerHTML = `${getButtonIconSvg(iconKind)}<span>${escapeHtml(label)}</span>`;
    }

    function loadEntries() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed
          .map((entry) => normalizeEntry(entry))
          .filter((entry) => entry.repoUrl && entry.baseBranch && entry.compareBranch);
      } catch (_) {
        return [];
      }
    }

    function saveEntries() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    }

    function normalizeScope(value) {
      return value === "local" ? "local" : "remote";
    }

    function normalizeEntry(raw) {
      return {
        id: raw?.id ? String(raw.id) : createId(),
        repoUrl: String(raw?.repoUrl || "").trim(),
        baseBranch: String(raw?.baseBranch || "").trim(),
        baseScope: normalizeScope(raw?.baseScope),
        compareBranch: String(raw?.compareBranch || "").trim(),
        compareScope: normalizeScope(raw?.compareScope),
        remoteName: String(raw?.remoteName || "origin").trim() || "origin",
        updatedAt: Number(raw?.updatedAt || Date.now())
      };
    }

    function createId() {
      return `entry-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    }

    function extractRepoName(repoUrl) {
      const trimmed = String(repoUrl || "").trim().replace(/\/+$/, "");
      if (!trimmed) return "(名称未設定)";
      const normalized = trimmed.replace(/\.git$/i, "");
      const parts = normalized.split(/[/:]/).filter(Boolean);
      return parts[parts.length - 1] || normalized;
    }

    function buildDisplayName(entry) {
      return extractRepoName(entry.repoUrl);
    }

    function buildRef(branch, scope, remoteName) {
      return scope === "remote" ? `${remoteName}/${branch}` : branch;
    }

    function buildBranchDiffUrl(entry) {
      const params = new URLSearchParams();
      params.set("repoUrl", entry.repoUrl);
      params.set("baseBranch", entry.baseBranch);
      params.set("baseScope", entry.baseScope);
      params.set("branchWork", entry.compareBranch);
      params.set("scopeWork", entry.compareScope);
      params.set("remoteName", entry.remoteName);
      return `git-branch-diff.html?${params.toString()}`;
    }

    function buildPseudoSquashUrl(entry) {
      const params = new URLSearchParams();
      params.set("repoUrl", entry.repoUrl);
      params.set("baseBranch", entry.baseBranch);
      params.set("baseScope", entry.baseScope);
      params.set("branchWork", entry.compareBranch);
      params.set("remoteName", entry.remoteName);
      return `git-pseudo-squash.html?${params.toString()}`;
    }

    function openBranchDiff(entry) {
      window.location.href = buildBranchDiffUrl(entry);
    }

    function openPseudoSquash(entry) {
      window.location.href = buildPseudoSquashUrl(entry);
    }

    function readFormEntry() {
      return normalizeEntry({
        id: editingId || createId(),
        repoUrl: readText("repoUrl"),
        baseBranch: readText("baseBranch"),
        baseScope: readSelectValue("baseScope", "remote"),
        compareBranch: readText("compareBranch"),
        compareScope: readSelectValue("compareScope", "remote"),
        remoteName: readText("remoteName") || "origin",
        updatedAt: Date.now()
      });
    }

    function validateEntry(entry) {
      if (!entry.repoUrl) {
        alert("リポジトリ URL を入力してください。");
        return false;
      }
      if (!entry.baseBranch) {
        alert("基準ブランチを入力してください。");
        return false;
      }
      if (!entry.compareBranch) {
        alert("比較ブランチを入力してください。");
        return false;
      }
      return true;
    }

    function resetForm() {
      editingId = "";
      dialogMode = "create";
      setText("repoUrl", "");
      setText("baseBranch", "");
      setText("compareBranch", "");
      setText("remoteName", "origin");
      const baseScope = document.getElementById("baseScope");
      const compareScope = document.getElementById("compareScope");
      if (baseScope) baseScope.value = "remote";
      if (compareScope) compareScope.value = "remote";
      const saveButton = document.getElementById("saveEntryBtn");
      setButtonContent(saveButton, "追加", "add");
      const titleNode = document.getElementById("entryDialogTitle");
      if (titleNode) {
        titleNode.textContent = "登録";
      }
    }

    function populateForm(entry) {
      editingId = entry.id;
      dialogMode = "edit";
      setText("repoUrl", entry.repoUrl);
      setText("baseBranch", entry.baseBranch);
      setText("compareBranch", entry.compareBranch);
      setText("remoteName", entry.remoteName);
      const baseScope = document.getElementById("baseScope");
      const compareScope = document.getElementById("compareScope");
      if (baseScope) baseScope.value = entry.baseScope;
      if (compareScope) compareScope.value = entry.compareScope;
      const saveButton = document.getElementById("saveEntryBtn");
      setButtonContent(saveButton, "更新", "edit");
      const titleNode = document.getElementById("entryDialogTitle");
      if (titleNode) {
        titleNode.textContent = "更新";
      }
    }

    function openCreateDialog() {
      resetForm();
      openEntryDialog();
    }

    function openEditDialog(entry) {
      populateForm(entry);
      openEntryDialog();
    }

    function openEntryDialog() {
      const dialog = getDialog();
      if (!dialog) return;
      if (typeof dialog.showModal === "function") {
        dialog.showModal();
      }
    }

    function closeEntryDialog() {
      const dialog = getDialog();
      if (!dialog) return;
      if (dialog.open && typeof dialog.close === "function") {
        dialog.close();
      }
    }

    function updateEmptyGuide(visibleCount) {
      const guide = document.getElementById("emptyGuide");
      if (!guide) return;
      if (entries.length === 0) {
        guide.hidden = false;
        guide.textContent = "まだ登録がありません。追加ボタンから登録してください。";
        return;
      }
      guide.hidden = true;
    }

    function renderEntries() {
      const list = document.getElementById("entriesList");
      if (!list) return;
      const visibleEntries = entries
        .slice()
        .sort((a, b) => b.updatedAt - a.updatedAt);

      updateEmptyGuide(visibleEntries.length);

      if (visibleEntries.length === 0) {
        list.innerHTML = `<div class="md-empty-state">一致する項目がありません。</div>`;
        return;
      }

      list.innerHTML = visibleEntries.map((entry) => {
        return `
          <article class="md-entry-card" data-entry-id="${escapeHtml(entry.id)}">
            <div class="md-entry-head">
              <div class="md-entry-title-wrap">
                <h3 class="md-entry-title">${escapeHtml(buildDisplayName(entry))}</h3>
                <div class="md-entry-url">${escapeHtml(entry.repoUrl)}</div>
              </div>
              <div class="md-entry-actions">
                <button type="button" class="md-button md-button--surface" data-action="open-branch-diff">${getButtonIconSvg("branch-diff")}<span>比較</span></button>
                <button type="button" class="md-button md-button--surface" data-action="open-pseudo-squash">${getButtonIconSvg("pseudo-squash")}<span>まとめる</span></button>
                <button type="button" class="md-button md-button--surface" data-action="edit-entry">${getButtonIconSvg("edit")}<span>変更</span></button>
                <button type="button" class="md-button md-button--danger" data-action="delete-entry">${getButtonIconSvg("delete")}<span>削除</span></button>
              </div>
            </div>
            <div class="md-entry-meta">
              <div class="md-ref-grid">
                <section class="md-ref-box">
                  <div class="md-ref-label">基準 <span class="md-scope-badge" data-scope="${escapeHtml(entry.baseScope)}">${escapeHtml(entry.baseScope)}</span></div>
                  <div class="md-ref-value">${escapeHtml(buildRef(entry.baseBranch, entry.baseScope, entry.remoteName))}</div>
                </section>
                <section class="md-ref-box">
                  <div class="md-ref-label">作業 <span class="md-scope-badge" data-scope="${escapeHtml(entry.compareScope)}">${escapeHtml(entry.compareScope)}</span></div>
                  <div class="md-ref-value">${escapeHtml(buildRef(entry.compareBranch, entry.compareScope, entry.remoteName))}</div>
                </section>
              </div>
            </div>
          </article>
        `;
      }).join("");
    }

    function saveCurrentEntry() {
      const entry = readFormEntry();
      if (!validateEntry(entry)) return;

      const existingIndex = entries.findIndex((item) => item.id === entry.id);
      if (existingIndex >= 0) {
        entries.splice(existingIndex, 1, entry);
        showToast("一覧を更新しました");
      } else {
        entries.push(entry);
        showToast("一覧に追加しました");
      }
      saveEntries();
      renderEntries();
      closeEntryDialog();
      resetForm();
    }

    function deleteEntry(entryId) {
      const target = entries.find((entry) => entry.id === entryId);
      if (!target) return;
      if (!window.confirm(`"${buildDisplayName(target)}" を削除しますか？`)) {
        return;
      }
      entries = entries.filter((entry) => entry.id !== entryId);
      saveEntries();
      renderEntries();
      if (editingId === entryId) {
        resetForm();
      }
      showToast("一覧から削除しました");
    }

    async function handleListClick(event) {
      const button = event.target.closest("[data-action]");
      if (!button) return;
      const card = button.closest("[data-entry-id]");
      if (!card) return;
      const entryId = card.getAttribute("data-entry-id");
      const entry = entries.find((item) => item.id === entryId);
      if (!entry) return;

      const action = button.getAttribute("data-action");
      if (action === "open-branch-diff") {
        openBranchDiff(entry);
        return;
      }
      if (action === "open-pseudo-squash") {
        openPseudoSquash(entry);
        return;
      }
      if (action === "edit-entry") {
        openEditDialog(entry);
        return;
      }
      if (action === "delete-entry") {
        deleteEntry(entryId);
        return;
      }
    }

    function setupEvents() {
      const openCreateButton = document.getElementById("openCreateDialogBtn");
      if (openCreateButton) {
        openCreateButton.addEventListener("click", openCreateDialog);
      }
      const saveButton = document.getElementById("saveEntryBtn");
      if (saveButton) {
        saveButton.addEventListener("click", saveCurrentEntry);
      }
      const closeButton = document.getElementById("closeDialogBtn");
      if (closeButton) {
        closeButton.addEventListener("click", closeEntryDialog);
      }
      const entriesList = document.getElementById("entriesList");
      if (entriesList) {
        entriesList.addEventListener("click", (event) => {
          handleListClick(event);
        });
      }
      const dialog = getDialog();
      if (dialog && !dialog.dataset.boundOutsideClose) {
        dialog.addEventListener("click", (event) => {
          if (event.target === dialog) {
            closeEntryDialog();
          }
        });
        dialog.dataset.boundOutsideClose = "true";
      }
    }

    function bootstrap() {
      entries = loadEntries();
      resetForm();
      setupEvents();
      renderEntries();
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", bootstrap);
    } else {
      bootstrap();
    }
