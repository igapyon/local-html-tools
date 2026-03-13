    const WORK_LIST_STORAGE_KEY = "gitWorkList.entries";
    const RECENT_ACTIONS_KEY = "gitWorkList.recentActions";

    function quoteIfNeeded(value) {
      if (!value) return value;
      if (/[\s"'\\]/.test(value)) {
        const escaped = value.replace(/"/g, '\\"');
        return `"${escaped}"`;
      }
      return value;
    }

    function normalizeRepoUrl(repoUrl) {
      const trimmed = String(repoUrl || "").trim();
      if (!trimmed) return "";
      try {
        const parsed = new URL(trimmed);
        const segments = parsed.pathname.split("/").filter(Boolean);
        const repoSegment = segments[1] ? segments[1].replace(/\.git$/i, "") : "";
        if (segments.length >= 2 && repoSegment) {
          if (segments.length >= 4 && segments[2] === "pull") {
            return `${parsed.origin}/${segments[0]}/${repoSegment}`;
          }
          if (segments.length === 2) {
            return `${parsed.origin}/${segments[0]}/${repoSegment}`;
          }
        }
      } catch (_) {
        // URL として解釈できないものはそのまま扱う
      }
      return trimmed.replace(/\/+$/, "");
    }

    function isOpenableExternalUrl(url) {
      return /^https?:\/\//i.test(String(url || "").trim());
    }

    function getToggleSelected(id, fallbackValue = false) {
      const element = document.getElementById(id);
      if (!element) return !!fallbackValue;
      if ("selected" in element) {
        return !!element.selected;
      }
      return !!element.checked;
    }

    function setToggleSelected(id, selected) {
      const element = document.getElementById(id);
      if (!element) return;
      if ("selected" in element) {
        element.selected = !!selected;
        return;
      }
      element.checked = !!selected;
    }

    function readQueryValue(params, primaryKey, fallbackKey = "") {
      const primaryValue = params.get(primaryKey);
      if (primaryValue != null) return primaryValue.trim();
      if (!fallbackKey) return "";
      const fallbackValue = params.get(fallbackKey);
      return fallbackValue == null ? "" : fallbackValue.trim();
    }

    function normalizeScopeParam(value) {
      if (value === "remote") return "remote";
      if (value === "local") return "local";
      return "";
    }

    function normalizeBooleanParam(value) {
      if (value === "1" || value === "true") return true;
      if (value === "0" || value === "false") return false;
      return null;
    }

    function updateRepoUrlLockState(locked) {
      const repoUrlInput = document.getElementById("repoUrl");
      if (!repoUrlInput) return;
      repoUrlInput.readOnly = !!locked;
      repoUrlInput.classList.toggle("md-disabled", !!locked);
      repoUrlInput.setAttribute("aria-readonly", locked ? "true" : "false");
    }

    function readCurrentQueryParams() {
      return new URLSearchParams(window.location.search || "");
    }

    function applyQueryParams() {
      const params = readCurrentQueryParams();
      if (!params.toString()) return;

      const baseBranch = readQueryValue(params, "baseBranch", "branchA");
      const workBranch = readQueryValue(params, "workBranch", "branchB");
      const baseScope = normalizeScopeParam(readQueryValue(params, "baseScope", "scopeA"));
      const workScope = normalizeScopeParam(readQueryValue(params, "workScope", "scopeB"));
      const remoteName = readQueryValue(params, "remoteName");
      const useHeadWorkParam = normalizeBooleanParam(readQueryValue(params, "useHeadWork"));
      const useHeadWork = useHeadWorkParam === true || workBranch === "HEAD";

      const branchAInput = document.getElementById("branchA");
      const branchBInput = document.getElementById("branchB");
      const remoteNameInput = document.getElementById("remoteName");
      const repoUrlInput = document.getElementById("repoUrl");
      const repoUrl = readQueryValue(params, "repoUrl");

      if (baseBranch && branchAInput) {
        branchAInput.value = baseBranch;
      }
      if (workBranch && branchBInput && workBranch !== "HEAD") {
        branchBInput.value = workBranch;
      }
      if (baseScope) {
        setToggleSelected("scopeA", baseScope === "remote");
      }
      if (workScope) {
        setToggleSelected("scopeB", workScope === "remote");
      }
      if (useHeadWork) {
        setToggleSelected("useHeadWork", true);
        setToggleSelected("scopeB", false);
      }
      if (remoteName && remoteNameInput) {
        remoteNameInput.value = remoteName;
        if (remoteName !== "origin") {
          setToggleSelected("lockOrigin", false);
        }
      }
      if (repoUrl && repoUrlInput) {
        repoUrlInput.value = repoUrl;
        updateRepoUrlLockState(true);
      } else {
        updateRepoUrlLockState(false);
      }
    }

    function updateWorkHeadState() {
      const useHeadWork = getToggleSelected("useHeadWork", false);
      const branchBRow = document.getElementById("branchBRow");
      const branchB = document.getElementById("branchB");
      if (branchBRow) {
        branchBRow.classList.toggle("md-hidden", useHeadWork);
      }
      if (branchB) {
        branchB.disabled = useHeadWork;
      }
      if (useHeadWork) {
        setToggleSelected("scopeB", false);
      }
    }

    function createEntryId() {
      return `entry-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    }

    function normalizeStoredEntry(raw) {
      return {
        id: raw?.id ? String(raw.id) : createEntryId(),
        repoUrl: normalizeRepoUrl(raw?.repoUrl),
        baseBranch: String(raw?.baseBranch || "").trim(),
        baseScope: normalizeScopeParam(String(raw?.baseScope || "").trim()) || "remote",
        compareBranch: String(raw?.compareBranch || "").trim(),
        compareScope: normalizeScopeParam(String(raw?.compareScope || "").trim()) || "remote",
        compareUseHead: raw?.compareUseHead === true,
        locked: raw?.locked === true,
        remoteName: String(raw?.remoteName || "origin").trim() || "origin",
        createdAt: Number(raw?.createdAt || raw?.updatedAt || Date.now()),
        updatedAt: Number(raw?.updatedAt || Date.now())
      };
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
        return normalizeRecentActions(JSON.parse(raw));
      } catch (_) {
        return createEmptyRecentActions();
      }
    }

    function saveRecentActions(actions) {
      localStorage.setItem(RECENT_ACTIONS_KEY, JSON.stringify(actions));
    }

    function updateRecentActions(currentRecentActions, entryId, tool) {
      const normalized = normalizeRecentActions(currentRecentActions);
      return {
        ...normalized,
        [tool]: [entryId, ...normalized[tool].filter((item) => item !== entryId)].slice(0, 100)
      };
    }

    function loadWorkBranchListEntries() {
      try {
        const raw = localStorage.getItem(WORK_LIST_STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed.map((entry) => normalizeStoredEntry(entry));
      } catch (_) {
        return [];
      }
    }

    function saveWorkBranchListEntries(entries) {
      localStorage.setItem(WORK_LIST_STORAGE_KEY, JSON.stringify(entries));
    }

    function getCurrentFormState() {
      const branchA = document.getElementById("branchA").value.trim();
      const useHeadWork = getToggleSelected("useHeadWork", false);
      const branchB = document.getElementById("branchB").value.trim();
      const baseScope = document.getElementById("scopeA").checked ? "remote" : "local";
      const compareScope = useHeadWork ? "local" : (document.getElementById("scopeB").checked ? "remote" : "local");
      const lockOrigin = getToggleSelected("lockOrigin", true);
      const remoteInput = document.getElementById("remoteName");
      const remoteName = lockOrigin ? "origin" : (remoteInput ? remoteInput.value.trim() : "");
      return {
        baseBranch: branchA,
        compareBranch: branchB,
        baseScope,
        compareScope,
        compareUseHead: useHeadWork,
        remoteName: remoteName || "origin"
      };
    }

    function resolveRepoUrlForSave() {
      const repoUrlInput = document.getElementById("repoUrl");
      return repoUrlInput ? normalizeRepoUrl(repoUrlInput.value) : "";
    }

    function parseGitHubStyleRepoUrl(repoUrl) {
      const normalized = normalizeRepoUrl(repoUrl);
      if (!isOpenableExternalUrl(normalized)) return null;
      try {
        const parsed = new URL(normalized);
        const segments = parsed.pathname.split("/").filter(Boolean);
        if (segments.length !== 2) return null;
        const owner = segments[0];
        const repo = segments[1].replace(/\.git$/i, "");
        if (!owner || !repo) return null;
        return {
          origin: parsed.origin,
          owner,
          repo
        };
      } catch (_) {
        return null;
      }
    }

    function buildGitHubCompareUrl() {
      const state = getCurrentFormState();
      if (
        !state.baseBranch ||
        !state.compareBranch ||
        state.baseScope !== "remote" ||
        state.compareScope !== "remote" ||
        state.compareUseHead ||
        state.remoteName !== "origin"
      ) {
        return "";
      }

      const repoInfo = parseGitHubStyleRepoUrl(resolveRepoUrlForSave());
      if (!repoInfo) return "";

      const baseBranch = encodeURIComponent(state.baseBranch);
      const compareBranch = encodeURIComponent(state.compareBranch);
      return `${repoInfo.origin}/${repoInfo.owner}/${repoInfo.repo}/compare/${baseBranch}...${compareBranch}`;
    }

    function updateGitHubCompareButtonState() {
      const button = document.getElementById("openGitHubCompareBtn");
      if (!button) return;
      const compareUrl = buildGitHubCompareUrl();
      button.disabled = !compareUrl;
      button.setAttribute("aria-disabled", compareUrl ? "false" : "true");
    }

    function openRepoUrl() {
      const repoUrl = resolveRepoUrlForSave();
      if (!isOpenableExternalUrl(repoUrl)) return;
      window.open(repoUrl, "_blank", "noopener,noreferrer");
    }

    function openGitHubCompareUrl() {
      const compareUrl = buildGitHubCompareUrl();
      if (!compareUrl) return;
      window.open(compareUrl, "_blank", "noopener,noreferrer");
    }

    function navigateTo(url) {
      if (typeof window.__LHT_NAVIGATE__ === "function") {
        window.__LHT_NAVIGATE__(url);
        return;
      }
      if (window.location && typeof window.location.assign === "function") {
        window.location.assign(url);
        return;
      }
      window.location.href = url;
    }

    function saveToWorkBranchListAndOpen() {
      const state = getCurrentFormState();
      if (!state.baseBranch || !state.compareBranch) {
        alert("基準ブランチと比較ブランチを入力してください。");
        return;
      }
      const repoUrl = resolveRepoUrlForSave();
      if (!repoUrl) {
        const repoUrlInput = document.getElementById("repoUrl");
        alert("リポジトリ URL を入力してください。");
        if (repoUrlInput && typeof repoUrlInput.focus === "function") {
          repoUrlInput.focus();
        }
        return;
      }

      const entries = loadWorkBranchListEntries();
      const existingIndex = entries.findIndex((entry) => (
        entry.repoUrl === repoUrl &&
        entry.baseBranch === state.baseBranch &&
        entry.compareBranch === state.compareBranch
      ));
      const nextEntry = normalizeStoredEntry({
        id: existingIndex >= 0 ? entries[existingIndex].id : createEntryId(),
        repoUrl,
        baseBranch: state.baseBranch,
        baseScope: state.baseScope,
        compareBranch: state.compareBranch,
        compareScope: state.compareScope,
        compareUseHead: state.compareUseHead,
        locked: existingIndex >= 0 ? entries[existingIndex].locked === true : false,
        remoteName: state.remoteName,
        createdAt: existingIndex >= 0 ? entries[existingIndex].createdAt : Date.now(),
        updatedAt: Date.now()
      });

      if (existingIndex >= 0) {
        entries.splice(existingIndex, 1, nextEntry);
      } else {
        entries.push(nextEntry);
      }
      saveWorkBranchListEntries(entries);
      saveRecentActions(updateRecentActions(loadRecentActions(), nextEntry.id, "branch-diff"));
      showToast(existingIndex >= 0 ? "Git 作業一覧を更新しました" : "Git 作業一覧へ追加しました");
      navigateTo("git-work-list.html");
    }

    function updateRemoteState() {
      const lockOrigin = getToggleSelected("lockOrigin", true);
      const remoteInput = document.getElementById("remoteName");
      const remoteBlock = document.getElementById("remoteNameBlock");
      if (!remoteInput || !remoteBlock) return;
      remoteBlock.classList.toggle("md-hidden", lockOrigin);
      remoteInput.disabled = lockOrigin;
      if (lockOrigin) {
        remoteInput.value = "origin";
      }
    }

    function updateStatWidthState() {
      const diffMode = document.getElementById("diffMode")?.value || "";
      const statWidthBlock = document.getElementById("statWidthBlock");
      const show = diffMode === "--stat";
      if (statWidthBlock) {
        statWidthBlock.classList.toggle("md-hidden", !show);
      }
    }

    function generateCommands({ silent = false } = {}) {
      updateStatWidthState();
      const branchA = document.getElementById("branchA").value.trim();
      const useHeadWork = getToggleSelected("useHeadWork", false);
      const branchB = useHeadWork ? "HEAD" : document.getElementById("branchB").value.trim();
      const scopeA = document.getElementById("scopeA").checked;
      const scopeB = useHeadWork ? false : document.getElementById("scopeB").checked;
      const lockOrigin = getToggleSelected("lockOrigin", true);
      const remoteInput = document.getElementById("remoteName");
      const remoteName = lockOrigin ? "origin" : (remoteInput ? remoteInput.value.trim() : "");
      const diffMode = document.getElementById("diffMode").value;
      const useStat200 = getToggleSelected("useStat200", false);
      const useTripleDot = getToggleSelected("useTripleDot", false);
      const output = document.getElementById("diffCmd");

      if (!branchA || (!useHeadWork && !branchB)) {
        if (!silent) alert("ブランチAとブランチBを入力してください。");
        if (output) output.textContent = "";
        updateGitHubCompareButtonState();
        return;
      }
      const useRemote = scopeA || scopeB;
      if (useRemote && !remoteName) {
        if (!silent) alert("リモート名を入力してください。");
        if (output) output.textContent = "";
        updateGitHubCompareButtonState();
        return;
      }

      const refA = scopeA ? `${remoteName}/${branchA}` : branchA;
      const refB = scopeB ? `${remoteName}/${branchB}` : branchB;
      let diffOption = "";
      if (diffMode === "--stat") {
        diffOption = useStat200 ? " --stat=200" : " --stat";
      } else if (diffMode) {
        diffOption = ` ${diffMode}`;
      }
      const rangeSeparator = useTripleDot ? "..." : "..";
      const commands = [];
      if (useRemote) {
        commands.push(`git fetch ${quoteIfNeeded(remoteName)}`);
      }
      commands.push(`git diff${diffOption} ${quoteIfNeeded(refA)}${rangeSeparator}${quoteIfNeeded(refB)}`);
      if (output) output.textContent = commands.join("\n");
      updateGitHubCompareButtonState();
    }

    function setupAutoUpdate() {
      const handler = () => generateCommands({ silent: true });
      const inputIds = ["repoUrl", "branchA", "branchB", "remoteName"];
      const changeIds = ["scopeA", "scopeB", "useHeadWork", "lockOrigin", "diffMode", "useTripleDot", "useStat200"];
      inputIds.forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener("input", handler);
        el.addEventListener("change", handler);
      });
      changeIds.forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener("change", handler);
      });
      const useHeadWork = document.getElementById("useHeadWork");
      if (useHeadWork) {
        useHeadWork.addEventListener("change", updateWorkHeadState);
      }

      const saveButton = document.getElementById("saveToWorkBranchListBtn");
      if (saveButton) {
        saveButton.addEventListener("click", saveToWorkBranchListAndOpen);
      }
      const openRepoUrlButton = document.getElementById("openRepoUrlBtn");
      if (openRepoUrlButton) {
        openRepoUrlButton.addEventListener("click", openRepoUrl);
      }
      const openGitHubCompareButton = document.getElementById("openGitHubCompareBtn");
      if (openGitHubCompareButton) {
        openGitHubCompareButton.addEventListener("click", openGitHubCompareUrl);
      }
    }

    function showToast(message) {
      const toast = document.getElementById("toast");
      if (!toast || typeof toast.show !== "function") return;
      toast.show(message, 2200);
    }

    function bootstrap() {
      applyQueryParams();
      updateWorkHeadState();
      updateRemoteState();
      updateStatWidthState();
      setupAutoUpdate();
      generateCommands({ silent: true });
      updateGitHubCompareButtonState();
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", bootstrap);
    } else {
      bootstrap();
    }
