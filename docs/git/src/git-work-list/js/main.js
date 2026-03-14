    const STORAGE_KEY = "gitWorkList.entries";
    const RECENT_ACTIONS_KEY = "gitWorkList.recentActions";
    const MEMO_STORAGE_KEY = "gitWorkList.memos";
    let entries = [];
    let recentActions = [];
    let memos = {};
    let editingId = "";
    let dialogMode = "create";
    let editingMemoKey = "";

    function readText(id) {
      const field = document.getElementById(id);
      return field ? String(field.value || "").trim() : "";
    }

    function normalizeRepoUrl(repoUrl) {
      const trimmed = String(repoUrl || "").trim();
      if (!trimmed) return "";
      try {
        const parsed = new URL(trimmed);
        if (parsed.hostname === "github.com") {
          const segments = parsed.pathname.split("/").filter(Boolean);
          if (segments.length >= 4 && segments[2] === "pull") {
            return `${parsed.origin}/${segments[0]}/${segments[1]}`;
          }
        }
      } catch (_) {
        // URL として解釈できないものはそのまま扱う
      }
      return trimmed.replace(/\/+$/, "");
    }

    function setText(id, value) {
      const field = document.getElementById(id);
      if (!field) return;
      field.value = value == null ? "" : String(value);
    }

    function updateRepoUrlLockState(locked) {
      const field = document.getElementById("repoUrl");
      if (!field) return;
      field.readOnly = !!locked;
      field.classList.toggle("md-disabled", !!locked);
      field.setAttribute("aria-readonly", locked ? "true" : "false");
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

    function updatePrimaryActionsState() {
      const openCreateButton = document.getElementById("openCreateDialogBtn");
      if (openCreateButton) {
        openCreateButton.classList.toggle("md-button--primary", entries.length === 0);
        openCreateButton.classList.toggle("md-button--surface", entries.length > 0);
      }
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
      if (kind === "lock") {
        return '<svg aria-hidden="true" viewBox="0 0 24 24" class="md-button__icon" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="10" rx="2"></rect><path d="M8 11V8a4 4 0 1 1 8 0v3"></path></svg>';
      }
      if (kind === "unlock") {
        return '<svg aria-hidden="true" viewBox="0 0 24 24" class="md-button__icon" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="10" rx="2"></rect><path d="M8 11V8a4 4 0 0 1 7.2-2.4"></path></svg>';
      }
      if (kind === "open-external") {
        return '<svg aria-hidden="true" viewBox="0 0 24 24" class="md-button__icon" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 5h5v5"></path><path d="M10 14 19 5"></path><path d="M19 14v4a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h4"></path></svg>';
      }
      if (kind === "copy-directory") {
        return '<svg aria-hidden="true" viewBox="0 0 24 24" class="md-button__icon" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><rect x="13" y="3" width="8" height="8" rx="2"></rect><path d="M15.5 7h3"></path><path d="M17 5.5v3"></path></svg>';
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

    function createEmptyRecentActions() {
      return {
        "pseudo-squash": [],
        "branch-diff": []
      };
    }

    function normalizeRecentActions(rawRecentActions) {
      const empty = createEmptyRecentActions();
      const normalizeToolEntries = (value) => (
        Array.isArray(value)
          ? value.map((item) => String(item || "").trim()).filter(Boolean).slice(0, 100)
          : []
      );
      if (!rawRecentActions || typeof rawRecentActions !== "object" || Array.isArray(rawRecentActions)) {
        return empty;
      }
      return {
        "pseudo-squash": normalizeToolEntries(rawRecentActions["pseudo-squash"]),
        "branch-diff": normalizeToolEntries(rawRecentActions["branch-diff"])
      };
    }

    function loadRecentActions() {
      try {
        const raw = localStorage.getItem(RECENT_ACTIONS_KEY);
        if (!raw) return createEmptyRecentActions();
        const parsed = JSON.parse(raw);
        return normalizeRecentActions(parsed);
      } catch (_) {
        return createEmptyRecentActions();
      }
    }

    function saveEntries() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
    }

    function saveRecentActions() {
      localStorage.setItem(RECENT_ACTIONS_KEY, JSON.stringify(recentActions));
    }

    function buildMemoKey(repoUrl, baseBranch) {
      return `${normalizeRepoUrl(repoUrl)}::${String(baseBranch || "").trim()}`;
    }

    function normalizeMemos(rawMemos) {
      if (!rawMemos || typeof rawMemos !== "object" || Array.isArray(rawMemos)) {
        return {};
      }
      const nextMemos = {};
      Object.entries(rawMemos).forEach(([key, value]) => {
        const normalizedKey = String(key || "").trim();
        if (!normalizedKey) return;
        if (typeof value === "string") {
          const normalizedMemo = value.trim();
          if (normalizedMemo) {
            nextMemos[normalizedKey] = {
              memo: normalizedMemo,
              gitCurrentDir: ""
            };
          }
          return;
        }
        if (!value || typeof value !== "object" || Array.isArray(value)) return;
        const normalizedMemo = String(value.memo || "").trim();
        const normalizedGitCurrentDir = String(value.gitCurrentDir || "").trim();
        if (normalizedMemo || normalizedGitCurrentDir) {
          nextMemos[normalizedKey] = {
            memo: normalizedMemo,
            gitCurrentDir: normalizedGitCurrentDir
          };
        }
      });
      return nextMemos;
    }

    function loadMemos() {
      try {
        const raw = localStorage.getItem(MEMO_STORAGE_KEY);
        if (!raw) return {};
        return normalizeMemos(JSON.parse(raw));
      } catch (_) {
        return {};
      }
    }

    function saveMemos() {
      localStorage.setItem(MEMO_STORAGE_KEY, JSON.stringify(memos));
    }

    function normalizeScope(value) {
      return value === "local" ? "local" : "remote";
    }

    function normalizeEntry(raw) {
      return {
        id: raw?.id ? String(raw.id) : createId(),
        repoUrl: normalizeRepoUrl(raw?.repoUrl),
        baseBranch: String(raw?.baseBranch || "").trim(),
        baseScope: normalizeScope(raw?.baseScope),
        compareBranch: String(raw?.compareBranch || "").trim(),
        compareScope: normalizeScope(raw?.compareScope),
        compareUseHead: raw?.compareUseHead === true,
        locked: raw?.locked === true,
        remoteName: String(raw?.remoteName || "origin").trim() || "origin",
        createdAt: Number(raw?.createdAt || raw?.updatedAt || Date.now()),
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

    function buildGroupKey(entry) {
      return [
        entry.repoUrl,
        buildRef(entry.baseBranch, entry.baseScope, entry.remoteName)
      ].join("::");
    }

    function groupEntriesByBase(visibleEntries) {
      const groupedMap = new Map();
      visibleEntries.forEach((entry) => {
        const key = buildGroupKey(entry);
        const memoKey = buildMemoKey(entry.repoUrl, entry.baseBranch);
        const existing = groupedMap.get(key);
        if (existing) {
          existing.entries.push(entry);
          return;
        }
        groupedMap.set(key, {
          key,
          repoUrl: entry.repoUrl,
          displayName: buildDisplayName(entry),
          baseBranch: entry.baseBranch,
          baseScope: entry.baseScope,
          remoteName: entry.remoteName,
          memoKey,
          memo: String(memos[memoKey]?.memo || "").trim(),
          gitCurrentDir: String(memos[memoKey]?.gitCurrentDir || "").trim(),
          entries: [entry]
        });
      });
      return Array.from(groupedMap.values());
    }

    function isOpenableExternalUrl(url) {
      return /^https?:\/\//i.test(String(url || "").trim());
    }

    function buildRef(branch, scope, remoteName) {
      return scope === "remote" ? `${remoteName}/${branch}` : branch;
    }

    function buildBranchDiffUrl(entry) {
      const params = new URLSearchParams();
      params.set("repoUrl", entry.repoUrl);
      params.set("baseBranch", entry.baseBranch);
      params.set("baseScope", entry.baseScope);
      params.set("workBranch", entry.compareBranch);
      params.set("workScope", entry.compareScope);
      params.set("remoteName", entry.remoteName);
      if (entry.compareUseHead) {
        params.set("useHeadWork", "1");
      }
      return `git-branch-diff.html?${params.toString()}`;
    }

    function buildPseudoSquashUrl(entry) {
      const params = new URLSearchParams();
      const memoKey = buildMemoKey(entry.repoUrl, entry.baseBranch);
      const memoText = String(memos[memoKey]?.memo || "").trim();
      params.set("repoUrl", entry.repoUrl);
      params.set("baseBranch", entry.baseBranch);
      params.set("baseScope", entry.baseScope);
      params.set("workBranch", entry.compareBranch);
      params.set("remoteName", entry.remoteName);
      if (memoText) {
        params.set("defaultCommitMessage", memoText);
      }
      if (entry.compareUseHead) {
        params.set("useHeadWork", "1");
      }
      return `git-pseudo-squash.html?${params.toString()}`;
    }

    function updateRecentActions(currentRecentActions, entryId, tool) {
      const normalized = normalizeRecentActions(currentRecentActions);
      const nextToolEntries = [
        entryId,
        ...normalized[tool].filter((item) => item !== entryId)
      ].slice(0, 100);
      return {
        ...normalized,
        [tool]: nextToolEntries
      };
    }

    function getToolButtonClass(entryId, tool) {
      const toolEntries = recentActions[tool] || [];
      if (toolEntries[0] === entryId) return "md-button--primary";
      if (toolEntries[1] === entryId) return "md-button--secondary";
      return "md-button--surface";
    }

    function markToolUsed(entryId, tool) {
      recentActions = updateRecentActions(recentActions, entryId, tool);
      saveRecentActions();
    }

    function openBranchDiff(entry) {
      window.location.href = buildBranchDiffUrl(entry);
    }

    function openPseudoSquash(entry) {
      window.location.href = buildPseudoSquashUrl(entry);
    }

    function openRepoUrl(entry) {
      if (!isOpenableExternalUrl(entry.repoUrl)) return;
      window.open(entry.repoUrl, "_blank", "noopener,noreferrer");
    }

    function readFormEntry() {
      const existingEntry = entries.find((item) => item.id === editingId);
      return normalizeEntry({
        id: editingId || createId(),
        repoUrl: normalizeRepoUrl(readText("repoUrl")),
        baseBranch: readText("baseBranch"),
        baseScope: readSelectValue("baseScope", "remote"),
        compareBranch: readText("compareBranch"),
        compareScope: readSelectValue("compareScope", "local"),
        compareUseHead: false,
        locked: existingEntry?.locked === true,
        remoteName: readText("remoteName") || "origin",
        createdAt: existingEntry?.createdAt || Date.now(),
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
      updateRepoUrlLockState(false);
      setText("baseBranch", "");
      setText("compareBranch", "");
      setText("remoteName", "origin");
      const baseScope = document.getElementById("baseScope");
      const compareScope = document.getElementById("compareScope");
      if (baseScope) baseScope.value = "remote";
      if (compareScope) compareScope.value = "local";
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
      updateRepoUrlLockState(!!entry.repoUrl);
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

    function renderGroup(group) {
      const memoPreview = group.memo.length > 16 ? `${group.memo.slice(0, 16)}...` : group.memo;
      return `
        <article class="md-entry-card md-entry-group" data-group-key="${escapeHtml(group.key)}">
          <div class="md-entry-head">
            <div class="md-entry-title-wrap">
              <div class="md-entry-title-row">
                <h3 class="md-entry-title">${escapeHtml(group.displayName)}</h3>
                <button type="button" class="md-entry-memo-btn" data-action="edit-memo" data-memo-key="${escapeHtml(group.memoKey)}" data-repo-url="${escapeHtml(group.repoUrl)}" data-base-branch="${escapeHtml(group.baseBranch)}" aria-label="メモを編集" title="メモを編集">${getButtonIconSvg("edit")}</button>
                ${group.memo ? `<span class="md-entry-memo-preview" data-full-text="${escapeHtml(group.memo)}">${escapeHtml(memoPreview)}</span>` : ""}
                ${group.gitCurrentDir ? `<button type="button" class="md-entry-copy-dir-btn" data-action="copy-git-current-dir" data-git-current-dir="${escapeHtml(group.gitCurrentDir)}" aria-label="git カレントディレクトリをコピー" title="${escapeHtml(group.gitCurrentDir)}">${getButtonIconSvg("copy-directory")}</button>` : ""}
              </div>
              <div class="md-entry-url-row">
                <div class="md-entry-url">${escapeHtml(group.repoUrl)}</div>
                ${isOpenableExternalUrl(group.repoUrl) ? `<button type="button" class="md-entry-link-btn" data-action="open-repo-url" data-repo-url="${escapeHtml(group.repoUrl)}" title="URL を開く" aria-label="URL を開く">${getButtonIconSvg("open-external")}</button>` : ""}
              </div>
            </div>
            <section class="md-ref-box md-entry-base-box">
              <div class="md-ref-label">基準 <span class="md-scope-badge" data-scope="${escapeHtml(group.baseScope)}">${escapeHtml(group.baseScope)}</span></div>
              <div class="md-ref-value">${escapeHtml(buildRef(group.baseBranch, group.baseScope, group.remoteName))}</div>
            </section>
          </div>
          <div class="md-entry-meta">
            <div class="md-entry-divider" aria-hidden="true"></div>
            <div class="md-work-row-list">
              ${group.entries.map((entry) => renderWorkRow(entry)).join("")}
            </div>
          </div>
        </article>
      `;
    }

    function getMemoDialog() {
      return document.getElementById("memoDialog");
    }

    function openMemoDialog(repoUrl, baseBranch) {
      editingMemoKey = buildMemoKey(repoUrl, baseBranch);
      const memoField = document.getElementById("memoText");
      if (memoField) {
        memoField.value = String(memos[editingMemoKey]?.memo || "");
      }
      const gitCurrentDirectoryField = document.getElementById("gitCurrentDirectory");
      if (gitCurrentDirectoryField) {
        gitCurrentDirectoryField.value = String(memos[editingMemoKey]?.gitCurrentDir || "");
      }
      const dialog = getMemoDialog();
      if (!dialog) return;
      if (typeof dialog.showModal === "function") {
        dialog.showModal();
      }
    }

    function closeMemoDialog() {
      const dialog = getMemoDialog();
      if (!dialog) return;
      if (dialog.open && typeof dialog.close === "function") {
        dialog.close();
      }
      editingMemoKey = "";
    }

    function saveMemo() {
      if (!editingMemoKey) return;
      const memoField = document.getElementById("memoText");
      const memoText = memoField ? String(memoField.value || "").trim() : "";
      const gitCurrentDirectoryField = document.getElementById("gitCurrentDirectory");
      const gitCurrentDir = gitCurrentDirectoryField ? String(gitCurrentDirectoryField.value || "").trim() : "";
      if (memoText || gitCurrentDir) {
        memos[editingMemoKey] = {
          memo: memoText,
          gitCurrentDir
        };
      } else {
        delete memos[editingMemoKey];
      }
      saveMemos();
      renderEntries();
      closeMemoDialog();
      showToast("メモを保存しました");
    }

    function quoteShellPath(value) {
      const text = String(value || "");
      if (!text) return "''";
      return `'${text.replace(/'/g, `'\"'\"'`)}'`;
    }

    async function copyGitStatusCommand() {
      const gitCurrentDirectoryField = document.getElementById("gitCurrentDirectory");
      const gitCurrentDir = gitCurrentDirectoryField ? String(gitCurrentDirectoryField.value || "").trim() : "";
      if (!gitCurrentDir) {
        showToast("git カレントディレクトリを入力してください");
        return;
      }
      const commandText = `cd ${quoteShellPath(gitCurrentDir)}\ngit status -sb`;
      const copied = await copyTextToClipboard(commandText);
      if (copied) {
        showToast("cd + git status をコピーしました");
      }
    }

    async function copyTextToClipboard(text) {
      const normalizedText = String(text || "");
      if (!normalizedText) return false;
      if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
        try {
          await navigator.clipboard.writeText(normalizedText);
          return true;
        } catch (_) {
          // fallback below
        }
      }
      const temp = document.createElement("textarea");
      temp.value = normalizedText;
      document.body.appendChild(temp);
      temp.select();
      const copied = document.execCommand("copy");
      document.body.removeChild(temp);
      return !!copied;
    }

    function renderWorkRow(entry) {
      const workRef = buildRef(entry.compareBranch, entry.compareScope, entry.remoteName);
      return `
        <section class="md-work-row" data-entry-id="${escapeHtml(entry.id)}">
          <div class="md-work-row__main">
            <div class="md-ref-box md-ref-box--work">
              <div class="md-ref-label">${entry.locked ? `<span class="md-entry-lock-icon" aria-label="ロック中">${getButtonIconSvg("lock")}</span>` : ""}作業 <span class="md-scope-badge" data-scope="${escapeHtml(entry.compareScope)}">${escapeHtml(entry.compareScope)}</span></div>
              <div class="md-ref-value-row">
                <div class="md-ref-value">${escapeHtml(workRef)}</div>
                ${entry.compareUseHead ? '<span class="md-head-badge">HEAD</span>' : ""}
              </div>
            </div>
          </div>
          <div class="md-entry-actions md-work-row__actions">
            <button type="button" class="md-button ${getToolButtonClass(entry.id, "pseudo-squash")}" data-action="open-pseudo-squash">${getButtonIconSvg("pseudo-squash")}<span>squash</span></button>
            <button type="button" class="md-button ${getToolButtonClass(entry.id, "branch-diff")}" data-action="open-branch-diff">${getButtonIconSvg("branch-diff")}<span>比較</span></button>
            <button type="button" class="md-button md-button--surface" data-action="edit-entry" ${entry.locked ? "disabled" : ""}>${getButtonIconSvg("edit")}<span>変更</span></button>
            <button type="button" class="md-button md-button--danger" data-action="delete-entry" ${entry.locked ? "disabled" : ""}>${getButtonIconSvg("delete")}<span>削除</span></button>
            <button type="button" class="md-button ${entry.locked ? "md-button--lock-active" : "md-button--surface"}" data-action="toggle-lock">${getButtonIconSvg(entry.locked ? "lock" : "unlock")}<span>${entry.locked ? "解除" : "ロック"}</span></button>
          </div>
        </section>
      `;
    }

    function renderEntries() {
      const list = document.getElementById("entriesList");
      if (!list) return;
      const visibleEntries = entries
        .slice()
        .sort((left, right) => Number(right.createdAt || 0) - Number(left.createdAt || 0));
      const visibleGroups = groupEntriesByBase(visibleEntries);

      updateEmptyGuide(visibleEntries.length);
      updatePrimaryActionsState();

      if (visibleEntries.length === 0) {
        list.innerHTML = "";
        return;
      }

      list.innerHTML = visibleGroups.map((group) => renderGroup(group)).join("");
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
      if (target.locked) {
        showToast("ロック中のため削除できません");
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

    function toggleEntryLock(entryId) {
      const target = entries.find((entry) => entry.id === entryId);
      if (!target) return;
      target.locked = !target.locked;
      saveEntries();
      renderEntries();
      if (editingId === entryId && target.locked) {
        closeEntryDialog();
        resetForm();
      }
      showToast(target.locked ? "ロックしました" : "ロックを解除しました");
    }

    async function handleListClick(event) {
      const button = event.target.closest("[data-action]");
      if (!button) return;
      const action = button.getAttribute("data-action");
      if (action === "edit-memo") {
        openMemoDialog(button.getAttribute("data-repo-url"), button.getAttribute("data-base-branch"));
        return;
      }
      if (action === "copy-git-current-dir") {
        const gitCurrentDir = button.getAttribute("data-git-current-dir");
        const copied = await copyTextToClipboard(gitCurrentDir);
        if (copied) {
          showToast("git カレントディレクトリをコピーしました");
        }
        return;
      }
      if (action === "open-repo-url") {
        const repoUrl = button.getAttribute("data-repo-url");
        if (!isOpenableExternalUrl(repoUrl)) return;
        window.open(repoUrl, "_blank", "noopener,noreferrer");
        return;
      }
      const card = button.closest("[data-entry-id]");
      if (!card) return;
      const entryId = card.getAttribute("data-entry-id");
      const entry = entries.find((item) => item.id === entryId);
      if (!entry) return;

      if (action === "open-branch-diff") {
        markToolUsed(entryId, "branch-diff");
        openBranchDiff(entry);
        return;
      }
      if (action === "open-pseudo-squash") {
        markToolUsed(entryId, "pseudo-squash");
        openPseudoSquash(entry);
        return;
      }
      if (action === "edit-entry") {
        if (entry.locked) {
          showToast("ロック中のため変更できません");
          return;
        }
        openEditDialog(entry);
        return;
      }
      if (action === "delete-entry") {
        deleteEntry(entryId);
        return;
      }
      if (action === "toggle-lock") {
        toggleEntryLock(entryId);
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
      const closeMemoButton = document.getElementById("closeMemoDialogBtn");
      if (closeMemoButton) {
        closeMemoButton.addEventListener("click", closeMemoDialog);
      }
      const saveMemoButton = document.getElementById("saveMemoBtn");
      if (saveMemoButton) {
        saveMemoButton.addEventListener("click", saveMemo);
      }
      const copyGitStatusCommandButton = document.getElementById("copyGitStatusCommandBtn");
      if (copyGitStatusCommandButton) {
        copyGitStatusCommandButton.addEventListener("click", () => {
          copyGitStatusCommand();
        });
      }
      const memoDialog = getMemoDialog();
      if (memoDialog && !memoDialog.dataset.boundOutsideClose) {
        memoDialog.addEventListener("click", (event) => {
          if (event.target === memoDialog) {
            closeMemoDialog();
          }
        });
        memoDialog.dataset.boundOutsideClose = "true";
      }
    }

    function bootstrap() {
      entries = loadEntries();
      recentActions = loadRecentActions();
      memos = loadMemos();
      resetForm();
      setupEvents();
      renderEntries();
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", bootstrap);
    } else {
      bootstrap();
    }
