    const WORK_BRANCH_LIST_STORAGE_KEY = "gitWorkBranchList.entries";

    function quoteIfNeeded(value) {
      if (!value) return value;
      if (/[\s"'\\]/.test(value)) {
        const escaped = value.replace(/"/g, '\\"');
        return `"${escaped}"`;
      }
      return value;
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

    function readCurrentQueryParams() {
      return new URLSearchParams(window.location.search || "");
    }

    function applyQueryParams() {
      const params = readCurrentQueryParams();
      if (!params.toString()) return;

      const baseBranch = readQueryValue(params, "baseBranch", "branchA");
      const branchWork = readQueryValue(params, "branchWork", "branchB");
      const baseScope = normalizeScopeParam(readQueryValue(params, "baseScope", "scopeA"));
      const scopeWork = normalizeScopeParam(readQueryValue(params, "scopeWork", "scopeB"));
      const remoteName = readQueryValue(params, "remoteName");

      const branchAInput = document.getElementById("branchA");
      const branchBInput = document.getElementById("branchB");
      const remoteNameInput = document.getElementById("remoteName");
      const repoUrlInput = document.getElementById("repoUrl");
      const repoUrl = readQueryValue(params, "repoUrl");

      if (baseBranch && branchAInput) {
        branchAInput.value = baseBranch;
      }
      if (branchWork && branchBInput) {
        branchBInput.value = branchWork;
      }
      if (baseScope) {
        setToggleSelected("scopeA", baseScope === "remote");
      }
      if (scopeWork) {
        setToggleSelected("scopeB", scopeWork === "remote");
      }
      if (remoteName && remoteNameInput) {
        remoteNameInput.value = remoteName;
        if (remoteName !== "origin") {
          setToggleSelected("lockOrigin", false);
        }
      }
      if (repoUrl && repoUrlInput) {
        repoUrlInput.value = repoUrl;
      }
    }

    function createEntryId() {
      return `entry-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    }

    function normalizeStoredEntry(raw) {
      return {
        id: raw?.id ? String(raw.id) : createEntryId(),
        repoUrl: String(raw?.repoUrl || "").trim(),
        baseBranch: String(raw?.baseBranch || "").trim(),
        baseScope: normalizeScopeParam(String(raw?.baseScope || "").trim()) || "remote",
        compareBranch: String(raw?.compareBranch || "").trim(),
        compareScope: normalizeScopeParam(String(raw?.compareScope || "").trim()) || "remote",
        remoteName: String(raw?.remoteName || "origin").trim() || "origin",
        updatedAt: Number(raw?.updatedAt || Date.now())
      };
    }

    function loadWorkBranchListEntries() {
      try {
        const raw = localStorage.getItem(WORK_BRANCH_LIST_STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        return parsed.map((entry) => normalizeStoredEntry(entry));
      } catch (_) {
        return [];
      }
    }

    function saveWorkBranchListEntries(entries) {
      localStorage.setItem(WORK_BRANCH_LIST_STORAGE_KEY, JSON.stringify(entries));
    }

    function getCurrentFormState() {
      const branchA = document.getElementById("branchA").value.trim();
      const branchB = document.getElementById("branchB").value.trim();
      const baseScope = document.getElementById("scopeA").checked ? "remote" : "local";
      const compareScope = document.getElementById("scopeB").checked ? "remote" : "local";
      const lockOrigin = getToggleSelected("lockOrigin", true);
      const remoteInput = document.getElementById("remoteName");
      const remoteName = lockOrigin ? "origin" : (remoteInput ? remoteInput.value.trim() : "");
      return {
        baseBranch: branchA,
        compareBranch: branchB,
        baseScope,
        compareScope,
        remoteName: remoteName || "origin"
      };
    }

    function resolveRepoUrlForSave() {
      const repoUrlInput = document.getElementById("repoUrl");
      return repoUrlInput ? String(repoUrlInput.value || "").trim() : "";
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
        remoteName: state.remoteName,
        updatedAt: Date.now()
      });

      if (existingIndex >= 0) {
        entries.splice(existingIndex, 1, nextEntry);
      } else {
        entries.push(nextEntry);
      }
      saveWorkBranchListEntries(entries);
      showToast(existingIndex >= 0 ? "Git 作業ブランチ一覧を更新しました" : "Git 作業ブランチ一覧へ追加しました");
      navigateTo("git-work-branch-list.html");
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
      const branchB = document.getElementById("branchB").value.trim();
      const scopeA = document.getElementById("scopeA").checked;
      const scopeB = document.getElementById("scopeB").checked;
      const lockOrigin = getToggleSelected("lockOrigin", true);
      const remoteInput = document.getElementById("remoteName");
      const remoteName = lockOrigin ? "origin" : (remoteInput ? remoteInput.value.trim() : "");
      const diffMode = document.getElementById("diffMode").value;
      const useStat200 = getToggleSelected("useStat200", false);
      const useTripleDot = getToggleSelected("useTripleDot", false);
      const output = document.getElementById("diffCmd");

      if (!branchA || !branchB) {
        if (!silent) alert("ブランチAとブランチBを入力してください。");
        if (output) output.textContent = "";
        return;
      }
      const useRemote = scopeA || scopeB;
      if (useRemote && !remoteName) {
        if (!silent) alert("リモート名を入力してください。");
        if (output) output.textContent = "";
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
    }

    function setupAutoUpdate() {
      const handler = () => generateCommands({ silent: true });
      const inputIds = ["repoUrl", "branchA", "branchB", "remoteName"];
      const changeIds = ["scopeA", "scopeB", "lockOrigin", "diffMode", "useTripleDot", "useStat200"];
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

      const saveButton = document.getElementById("saveToWorkBranchListBtn");
      if (saveButton) {
        saveButton.addEventListener("click", saveToWorkBranchListAndOpen);
      }
    }

    function showToast(message) {
      const toast = document.getElementById("toast");
      if (!toast || typeof toast.show !== "function") return;
      toast.show(message, 2200);
    }

    function bootstrap() {
      applyQueryParams();
      updateRemoteState();
      updateStatWidthState();
      setupAutoUpdate();
      generateCommands({ silent: true });
    }

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", bootstrap);
    } else {
      bootstrap();
    }
