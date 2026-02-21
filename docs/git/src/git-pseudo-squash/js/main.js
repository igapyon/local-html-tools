    function quoteIfNeeded(value, shell = "posix") {
      if (!value) return value;
      if (!/[^\w@%+=:,./-]/.test(value)) {
        return value;
      }
      if (shell === "powershell") {
        const escaped = value.replace(/'/g, "''");
        return `'${escaped}'`;
      }
      const escaped = value.replace(/'/g, "'\\''");
      return `'${escaped}'`;
    }

    function convertTimeToThreeChars(hours, minutes) {
      const s1 = String.fromCharCode(97 + hours);
      const s2 = String.fromCharCode(97 + Math.floor(minutes / 26));
      const s3 = String.fromCharCode(97 + (minutes % 26));
      return s1 + s2 + s3;
    }

    function toggleCurrentBranch() {
      const useCurrent = document.getElementById("useCurrentBranch").checked;
      const workBranch = document.getElementById("workBranch");
      if (workBranch) {
        // 編集は常に可能にする（現在のブランチ使用時も入力は保持）
        workBranch.classList.remove("md-disabled");
      }
      saveUiPreferences();
      regenerateAllCommands();
    }

    function updateBaseScope() {
      const scope = document.getElementById("squashBaseScope");
      const baseRemote = document.getElementById("baseRemote");
      const lockOrigin = document.getElementById("lockOrigin");
      const baseRemoteRow = document.getElementById("baseRemoteRow");
      if (scope && baseRemote) {
        const disableRemote = scope.value !== "remote" || (lockOrigin && lockOrigin.checked);
        baseRemote.disabled = disableRemote;
        baseRemote.classList.toggle("md-disabled", disableRemote);
      }
      if (scope && lockOrigin && lockOrigin.checked) {
        baseRemote.value = "origin";
      }
      const squashRemote = document.getElementById("squashRemote");
      const squashRemoteRow = document.getElementById("squashRemoteRow");
      if (squashRemote && lockOrigin) {
        const disableRemoteName = lockOrigin.checked;
        squashRemote.disabled = disableRemoteName;
        squashRemote.classList.toggle("md-disabled", disableRemoteName);
        if (disableRemoteName) {
          squashRemote.value = "origin";
        }
      }
      if (baseRemoteRow && lockOrigin) {
        baseRemoteRow.classList.toggle("md-hidden", lockOrigin.checked);
      }
      if (squashRemoteRow && lockOrigin) {
        squashRemoteRow.classList.toggle("md-hidden", lockOrigin.checked);
      }
      const squashRemoteLabel = document.getElementById("squashRemoteLabel");
      if (squashRemoteLabel && lockOrigin) {
        squashRemoteLabel.classList.toggle("md-hidden", lockOrigin.checked);
      }
      regenerateAllCommands();
    }

    function toggleOriginLock() {
      const lockOrigin = document.getElementById("lockOrigin");
      const isLocked = !!(lockOrigin && lockOrigin.checked);
      if (!isLocked) {
        const baseRemote = document.getElementById("baseRemote");
        const squashRemote = document.getElementById("squashRemote");
        const storedBaseRemote = getStoredString(UI_BASE_REMOTE_STORAGE_KEY);
        const storedSquashRemote = getStoredString(UI_SQUASH_REMOTE_STORAGE_KEY);
        if (baseRemote && storedBaseRemote) {
          baseRemote.value = storedBaseRemote;
        }
        if (squashRemote && storedSquashRemote) {
          squashRemote.value = storedSquashRemote;
        }
      }
      updateBaseScope();
      saveUiPreferences();
    }

    function regenerateAllCommands() {
      generateCreateBranchCommand({ silent: true });
      generateRebaseCommand({ silent: true });
      generatePushCommand({ silent: true });
      generatePlannedDiffCommand({ silent: true });
    }

    function setDefaultWorkBranch() {
      const input = document.getElementById("workBranch");
      if (!input || input.value.trim()) return;
      const now = new Date();
      const pad = (num) => String(num).padStart(2, "0");
      const mm = pad(now.getMonth() + 1);
      const dd = pad(now.getDate());
      const hh = now.getHours();
      const min = now.getMinutes();
      const timeStr = convertTimeToThreeChars(hh, min);
      input.value = `tiga${mm}${dd}${timeStr}`;
      regenerateAllCommands();
    }

    function updateWorkBranchWithCurrentTime() {
      const input = document.getElementById("workBranch");
      if (!input) return;
      const now = new Date();
      const pad = (num) => String(num).padStart(2, "0");
      const mm = pad(now.getMonth() + 1);
      const dd = pad(now.getDate());
      const hh = now.getHours();
      const min = now.getMinutes();
      const timeStr = convertTimeToThreeChars(hh, min);
      input.value = `tiga${mm}${dd}${timeStr}`;
      regenerateAllCommands();
    }

    function generateRebaseCommand(options = {}) {
      const silent = options && options.silent === true;
      const squashScope = document.getElementById("squashBaseScope")?.value || "remote";
      const baseRemote = document.getElementById("baseRemote")?.value.trim() || "origin";
      const squashBranch = document.getElementById("squashBaseBranch")?.value.trim() || "";
      let base = "";
      const workBranch = document.getElementById("workBranch").value.trim();
      const useCurrent = document.getElementById("useCurrentBranch").checked;
      const commitMessage = document.getElementById("commitMessage").value.trim();
      const squashRemote = document.getElementById("squashRemote").value.trim() || "origin";
      const shellEnv = document.getElementById("shellEnvPowerShell")?.checked ? "powershell" : "posix";

      if (!squashBranch) {
        if (!silent) alert("基点ブランチを入力してください。");
        document.getElementById("rebaseCmd").textContent = "";
        return;
      }
      if (squashScope === "remote") {
        base = `${baseRemote}/${squashBranch}`;
      } else {
        base = squashBranch;
      }
      if (!base) {
        if (!silent) alert("基点（親）を入力してください。");
        document.getElementById("rebaseCmd").textContent = "";
        return;
      }
      if (!useCurrent && !workBranch) {
        if (!silent) alert("作業ブランチ名を入力してください。");
        document.getElementById("rebaseCmd").textContent = "";
        return;
      }
      if (!commitMessage) {
        if (!silent) alert("コミットメッセージを入力してください。");
        document.getElementById("rebaseCmd").textContent = "";
        return;
      }
      const lines = [];
      lines.push(`git fetch ${quoteIfNeeded(squashRemote, shellEnv)}`);
      if (!useCurrent) {
        lines.push(`git switch ${quoteIfNeeded(workBranch, shellEnv)}`);
      }
      lines.push(`git reset --soft ${quoteIfNeeded(base, shellEnv)}`);
      if (shellEnv === "powershell") {
        lines.push(`$CommitMsgFile = New-TemporaryFile`);
        lines.push(`@'`);
        lines.push(commitMessage);
        lines.push(`'@ | Set-Content -Path $CommitMsgFile -Encoding UTF8`);
        lines.push(`git commit -F $CommitMsgFile`);
        lines.push(`Remove-Item $CommitMsgFile`);
      } else {
        lines.push(`COMMIT_MSG_FILE=$(mktemp)`);
        lines.push(`cat > "$COMMIT_MSG_FILE" <<'EOF'`);
        lines.push(commitMessage);
        lines.push("EOF");
        lines.push(`git commit -F "$COMMIT_MSG_FILE"`);
        lines.push(`rm "$COMMIT_MSG_FILE"`);
      }
      lines.push(`git status -sb`);

      document.getElementById("rebaseCmd").textContent = lines.join("\n");
    }

    function generatePushCommand(options = {}) {
      const silent = options && options.silent === true;
      const output = document.getElementById("pushCmd");
      if (!output) return;

      const workBranch = document.getElementById("workBranch").value.trim();
      const useCurrent = document.getElementById("useCurrentBranch").checked;
      const squashRemote = document.getElementById("squashRemote").value.trim() || "origin";
      const shellEnv = document.getElementById("shellEnvPowerShell")?.checked ? "powershell" : "posix";

      if (!useCurrent && !workBranch) {
        if (!silent) alert("push する場合は作業ブランチ名を入力してください。");
        output.textContent = "";
        return;
      }

      const lines = [];
      if (useCurrent) {
        lines.push(`git push --force-with-lease ${quoteIfNeeded(squashRemote, shellEnv)} HEAD`);
      } else {
        lines.push(`git push --force-with-lease ${quoteIfNeeded(squashRemote, shellEnv)} ${quoteIfNeeded(workBranch, shellEnv)}`);
      }
      lines.push(`git pull`);
      if (useCurrent) {
        lines.push(`git branch -m "$(git branch --show-current)" "$(git branch --show-current)-done"`);
      } else {
        lines.push(`git branch -m ${quoteIfNeeded(workBranch, shellEnv)} ${quoteIfNeeded(`${workBranch}-done`, shellEnv)}`);
      }
      lines.push(`git status -sb`);
      output.textContent = lines.join("\n");
    }

    function generatePlannedDiffCommand(options = {}) {
      const silent = options && options.silent === true;
      const squashScope = document.getElementById("squashBaseScope")?.value || "remote";
      const baseRemote = document.getElementById("baseRemote")?.value.trim() || "origin";
      const squashBranch = document.getElementById("squashBaseBranch")?.value.trim() || "";
      const workBranch = document.getElementById("workBranch").value.trim();
      const useCurrent = document.getElementById("useCurrentBranch").checked;
      const shellEnv = document.getElementById("shellEnvPowerShell")?.checked ? "powershell" : "posix";

      const output = document.getElementById("plannedDiffCmd");
      if (!output) return;

      if (!squashBranch) {
        if (!silent) alert("基点ブランチを入力してください。");
        output.textContent = "";
        return;
      }
      const base = squashScope === "remote" ? `${baseRemote}/${squashBranch}` : squashBranch;
      if (!useCurrent && !workBranch) {
        if (!silent) alert("作業ブランチ名を入力してください。");
        output.textContent = "";
        return;
      }
      const target = useCurrent ? "HEAD" : workBranch;
      const lines = [];
      if (squashScope === "remote") {
        lines.push(`git fetch ${quoteIfNeeded(baseRemote, shellEnv)}`);
      }
      lines.push(`git diff ${quoteIfNeeded(base, shellEnv)}..${quoteIfNeeded(target, shellEnv)}`);
      if (shellEnv === "powershell") {
        lines.push(`Write-Host ("## Base branch commit ID: " + (git rev-parse ${quoteIfNeeded(base, shellEnv)}))`);
      } else {
        lines.push(`echo "## Base branch commit ID: $(git rev-parse ${quoteIfNeeded(base, shellEnv)})"`);
      }
      lines.push(`git status -sb`);
      output.textContent = lines.join("\n");
    }

    function generateCreateBranchCommand(options = {}) {
      const silent = options && options.silent === true;
      const workBranch = document.getElementById("workBranch").value.trim();
      const scope = document.getElementById("squashBaseScope").value;
      const remote = document.getElementById("baseRemote").value.trim() || "origin";
      const baseBranch = document.getElementById("squashBaseBranch").value.trim();
      const shellEnv = document.getElementById("shellEnvPowerShell")?.checked ? "powershell" : "posix";

      if (!workBranch) {
        if (!silent) alert("作業ブランチ名を入力してください。");
        document.getElementById("createBranchCmd").textContent = "";
        return;
      }
      if (!baseBranch) {
        if (!silent) alert("基点ブランチを入力してください。");
        document.getElementById("createBranchCmd").textContent = "";
        return;
      }
      const lines = [];
      if (scope === "remote") {
        lines.push(`git fetch ${quoteIfNeeded(remote, shellEnv)}`);
        lines.push(`git switch -c ${quoteIfNeeded(workBranch, shellEnv)} ${quoteIfNeeded(remote, shellEnv)}/${quoteIfNeeded(baseBranch, shellEnv)}`);
        lines.push(`git status -sb`);
      } else {
        lines.push(`git switch -c ${quoteIfNeeded(workBranch, shellEnv)} ${quoteIfNeeded(baseBranch, shellEnv)}`);
        lines.push(`git status -sb`);
      }
      document.getElementById("createBranchCmd").textContent = lines.join("\n");
    }

    function setupCreateBranchAutoUpdate() {
      const ids = ["squashBaseBranch", "workBranch", "squashBaseScope", "baseRemote", "squashRemote", "shellEnvPowerShell", "lockOrigin"];
      const handler = () => regenerateAllCommands();
      ids.forEach((id) => {
        const element = document.getElementById(id);
        if (!element) return;
        element.addEventListener("input", handler);
        element.addEventListener("change", handler);
      });
    }

    function setupRebaseAutoUpdate() {
      const inputIds = ["squashBaseBranch", "workBranch", "squashBaseScope", "baseRemote", "squashRemote", "commitMessage"];
      const changeIds = ["useCurrentBranch", "shellEnvPowerShell", "lockOrigin"];
      const handler = () => regenerateAllCommands();
      inputIds.forEach((id) => {
        const element = document.getElementById(id);
        if (!element) return;
        element.addEventListener("input", handler);
        element.addEventListener("change", handler);
      });
      changeIds.forEach((id) => {
        const element = document.getElementById(id);
        if (!element) return;
        element.addEventListener("change", handler);
      });
    }

    function copyToClipboard(id) {
      const element = document.getElementById(id);
      if (!element) return;
      const text = element.tagName === "TEXTAREA" || element.tagName === "INPUT"
        ? element.value
        : element.textContent;
      if (!text) return;
      const temp = document.createElement("textarea");
      temp.value = text;
      document.body.appendChild(temp);
      temp.select();
      document.execCommand("copy");
      document.body.removeChild(temp);
      showToast("コピーしました");
    }

    function showToast(message) {
      const toast = document.getElementById("toast");
      toast.textContent = message;
      toast.classList.remove("md-hidden");
      toast.classList.add("md-visible");
      setTimeout(() => {
        toast.classList.remove("md-visible");
        toast.classList.add("md-hidden");
      }, 2000);
    }

    function toggleMenu() {
      const panel = document.getElementById("menuPanel");
      if (!panel) return;
      panel.classList.toggle("md-hidden");
    }

    function setupCodeSelectAll() {
      document.querySelectorAll("code.selectable-code").forEach((el) => {
        el.addEventListener("click", () => {
          const range = document.createRange();
          range.selectNodeContents(el);
          const selection = window.getSelection();
          selection.removeAllRanges();
          selection.addRange(range);
        });
      });
    }

    const BASE_BRANCH_STORAGE_KEY = "gitPseudoSquash.squashBaseBranch";
    const BASE_BRANCH_HISTORY_STORAGE_KEY = "gitPseudoSquash.squashBaseBranchHistory";
    const BASE_BRANCH_HISTORY_MAX = 12;
    const BASE_BRANCH_DEFAULT_SUGGESTIONS = [
      "main",
      "master",
      "devel",
      "devel-tiga",
      "develop",
      "development",
      "release",
      "staging",
      "production",
      "prod",
      "canary",
      "working",
      "experimental",
      "prototype",
      "proto",
      "archive",
      "legacy",
      "gh-pages",
      "stable"
    ];
    const UI_SHELL_ENV_POWERSHELL_STORAGE_KEY = "gitPseudoSquash.ui.shellEnvPowerShell";
    const UI_LOCK_ORIGIN_STORAGE_KEY = "gitPseudoSquash.ui.lockOrigin";
    const UI_SQUASH_BASE_SCOPE_STORAGE_KEY = "gitPseudoSquash.ui.squashBaseScope";
    const UI_BASE_REMOTE_STORAGE_KEY = "gitPseudoSquash.ui.baseRemote";
    const UI_SQUASH_REMOTE_STORAGE_KEY = "gitPseudoSquash.ui.squashRemote";
    const UI_USE_CURRENT_BRANCH_STORAGE_KEY = "gitPseudoSquash.ui.useCurrentBranch";
    let baseBranchDefaultSuggestions = [];
    let baseBranchCurrentSuggestions = [];
    let baseBranchActiveIndex = -1;
    let baseBranchActiveValue = "";
    let suppressBaseBranchFocusOpen = false;

    function getStoredString(key) {
      try {
        const value = localStorage.getItem(key);
        if (value == null) return "";
        return String(value);
      } catch (_) {
        return "";
      }
    }

    function getStoredBoolean(key) {
      const raw = getStoredString(key);
      if (!raw) return null;
      if (raw === "true") return true;
      if (raw === "false") return false;
      return null;
    }

    function setStoredValue(key, value) {
      try {
        localStorage.setItem(key, String(value));
      } catch (_) {
        // localStorage が使えない環境では保存機能を無効化
      }
    }

    function loadPersistedUiPreferences() {
      const shellEnvPowerShell = document.getElementById("shellEnvPowerShell");
      const lockOrigin = document.getElementById("lockOrigin");
      const squashBaseScope = document.getElementById("squashBaseScope");
      const baseRemote = document.getElementById("baseRemote");
      const squashRemote = document.getElementById("squashRemote");
      const useCurrentBranch = document.getElementById("useCurrentBranch");

      const shellEnvValue = getStoredBoolean(UI_SHELL_ENV_POWERSHELL_STORAGE_KEY);
      const lockOriginValue = getStoredBoolean(UI_LOCK_ORIGIN_STORAGE_KEY);
      const useCurrentBranchValue = getStoredBoolean(UI_USE_CURRENT_BRANCH_STORAGE_KEY);
      const scopeValue = getStoredString(UI_SQUASH_BASE_SCOPE_STORAGE_KEY);
      const baseRemoteValue = getStoredString(UI_BASE_REMOTE_STORAGE_KEY);
      const squashRemoteValue = getStoredString(UI_SQUASH_REMOTE_STORAGE_KEY);

      if (shellEnvPowerShell && shellEnvValue !== null) {
        shellEnvPowerShell.checked = shellEnvValue;
      }
      if (lockOrigin && lockOriginValue !== null) {
        lockOrigin.checked = lockOriginValue;
      }
      if (useCurrentBranch && useCurrentBranchValue !== null) {
        useCurrentBranch.checked = useCurrentBranchValue;
      }
      if (squashBaseScope && (scopeValue === "remote" || scopeValue === "local")) {
        squashBaseScope.value = scopeValue;
      }
      if (baseRemote && baseRemoteValue) {
        baseRemote.value = baseRemoteValue;
      }
      if (squashRemote && squashRemoteValue) {
        squashRemote.value = squashRemoteValue;
      }
    }

    function saveUiPreferences() {
      const shellEnvPowerShell = document.getElementById("shellEnvPowerShell");
      const lockOrigin = document.getElementById("lockOrigin");
      const squashBaseScope = document.getElementById("squashBaseScope");
      const baseRemote = document.getElementById("baseRemote");
      const squashRemote = document.getElementById("squashRemote");
      const useCurrentBranch = document.getElementById("useCurrentBranch");

      if (shellEnvPowerShell) {
        setStoredValue(UI_SHELL_ENV_POWERSHELL_STORAGE_KEY, shellEnvPowerShell.checked);
      }
      if (lockOrigin) {
        setStoredValue(UI_LOCK_ORIGIN_STORAGE_KEY, lockOrigin.checked);
      }
      if (squashBaseScope) {
        setStoredValue(UI_SQUASH_BASE_SCOPE_STORAGE_KEY, squashBaseScope.value);
      }
      if (useCurrentBranch) {
        setStoredValue(UI_USE_CURRENT_BRANCH_STORAGE_KEY, useCurrentBranch.checked);
      }

      // lockOrigin ON 時は origin を強制表示するため、ユーザーのリモート入力値は保持する。
      const isLockOrigin = !!(lockOrigin && lockOrigin.checked);
      if (!isLockOrigin && baseRemote) {
        setStoredValue(UI_BASE_REMOTE_STORAGE_KEY, baseRemote.value.trim());
      }
      if (!isLockOrigin && squashRemote) {
        setStoredValue(UI_SQUASH_REMOTE_STORAGE_KEY, squashRemote.value.trim());
      }
    }

    function setupUiPreferencePersistence() {
      const ids = ["shellEnvPowerShell", "lockOrigin", "squashBaseScope", "baseRemote", "squashRemote", "useCurrentBranch"];
      const persist = () => saveUiPreferences();
      ids.forEach((id) => {
        const element = document.getElementById(id);
        if (!element) return;
        element.addEventListener("input", persist);
        element.addEventListener("change", persist);
      });
    }

    function clearUiPreferences() {
      const confirmed = confirm("ローカルに保存されているこのツールの設定をクリアします。よろしいですか？");
      if (!confirmed) return;

      try {
        localStorage.removeItem(UI_SHELL_ENV_POWERSHELL_STORAGE_KEY);
        localStorage.removeItem(UI_LOCK_ORIGIN_STORAGE_KEY);
        localStorage.removeItem(UI_SQUASH_BASE_SCOPE_STORAGE_KEY);
        localStorage.removeItem(UI_BASE_REMOTE_STORAGE_KEY);
        localStorage.removeItem(UI_SQUASH_REMOTE_STORAGE_KEY);
        localStorage.removeItem(UI_USE_CURRENT_BRANCH_STORAGE_KEY);
        localStorage.removeItem(BASE_BRANCH_HISTORY_STORAGE_KEY);
        localStorage.setItem(BASE_BRANCH_STORAGE_KEY, "devel");
      } catch (_) {
        showToast("設定のクリアに失敗しました");
        return;
      }

      const shellEnvPowerShell = document.getElementById("shellEnvPowerShell");
      const lockOrigin = document.getElementById("lockOrigin");
      const squashBaseScope = document.getElementById("squashBaseScope");
      const baseRemote = document.getElementById("baseRemote");
      const squashRemote = document.getElementById("squashRemote");
      const useCurrentBranch = document.getElementById("useCurrentBranch");
      const squashBaseBranch = document.getElementById("squashBaseBranch");
      const workBranch = document.getElementById("workBranch");
      const commitMessage = document.getElementById("commitMessage");

      if (shellEnvPowerShell) shellEnvPowerShell.checked = false;
      if (lockOrigin) lockOrigin.checked = true;
      if (squashBaseScope) squashBaseScope.value = "remote";
      if (baseRemote) baseRemote.value = "origin";
      if (squashRemote) squashRemote.value = "origin";
      if (useCurrentBranch) useCurrentBranch.checked = true;
      if (squashBaseBranch) squashBaseBranch.value = "devel";
      if (workBranch) workBranch.value = "";
      if (commitMessage) commitMessage.value = "";
      setDefaultWorkBranch();
      renderBaseBranchSuggestions();

      updateBaseScope();
      toggleCurrentBranch();
      regenerateAllCommands();
      showToast("設定をクリアしました");
    }

    function uniqueBranchNames(values) {
      const seen = new Set();
      const uniqueValues = [];
      values.forEach((value) => {
        if (!value || seen.has(value)) return;
        seen.add(value);
        uniqueValues.push(value);
      });
      return uniqueValues;
    }

    function getStoredBaseBranchHistory() {
      try {
        const raw = localStorage.getItem(BASE_BRANCH_HISTORY_STORAGE_KEY);
        if (!raw) return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        const normalized = parsed
          .map((value) => (typeof value === "string" ? value.trim() : ""))
          .filter((value) => value.length > 0);
        return uniqueBranchNames(normalized).slice(0, BASE_BRANCH_HISTORY_MAX);
      } catch (_) {
        return [];
      }
    }

    function saveBaseBranchHistory(values) {
      try {
        localStorage.setItem(BASE_BRANCH_HISTORY_STORAGE_KEY, JSON.stringify(values));
      } catch (_) {
        // localStorage が使えない環境では保存機能を無効化
      }
    }

    function renderBaseBranchSuggestions(options = {}) {
      const keepActive = options.keepActive === true;
      const menu = document.getElementById("baseBranchMenu");
      if (!menu) return;
      const history = getStoredBaseBranchHistory();
      const merged = uniqueBranchNames([...history, ...baseBranchDefaultSuggestions]).slice(0, BASE_BRANCH_HISTORY_MAX);
      const input = document.getElementById("squashBaseBranch");
      const query = (input?.value || "").trim().toLowerCase();
      const startsWith = [];
      const contains = [];
      merged.forEach((branch) => {
        const lower = branch.toLowerCase();
        if (!query || lower.startsWith(query)) {
          startsWith.push(branch);
        } else if (lower.includes(query)) {
          contains.push(branch);
        }
      });
      const suggestions = [...startsWith, ...contains];
      baseBranchCurrentSuggestions = suggestions;
      if (keepActive && baseBranchActiveValue) {
        baseBranchActiveIndex = suggestions.indexOf(baseBranchActiveValue);
      } else {
        baseBranchActiveIndex = -1;
      }
      if (baseBranchActiveIndex < 0) {
        baseBranchActiveValue = "";
      }

      menu.textContent = "";
      suggestions.forEach((branch, index) => {
        const item = document.createElement("md-menu-item");
        item.textContent = branch;
        item.dataset.value = branch;
        item.selected = index === baseBranchActiveIndex;
        item.dataset.active = index === baseBranchActiveIndex ? "true" : "false";
        menu.appendChild(item);
      });

      if (suggestions.length === 0) {
        menu.close();
      }
    }

    function setBaseBranchActiveSuggestion(nextIndex) {
      const menu = document.getElementById("baseBranchMenu");
      if (!menu) return;
      if (!Array.isArray(baseBranchCurrentSuggestions) || baseBranchCurrentSuggestions.length === 0) {
        baseBranchActiveIndex = -1;
        baseBranchActiveValue = "";
        return;
      }
      const max = baseBranchCurrentSuggestions.length - 1;
      const clamped = Math.max(0, Math.min(nextIndex, max));
      baseBranchActiveIndex = clamped;
      baseBranchActiveValue = baseBranchCurrentSuggestions[clamped] || "";
      const items = Array.from(menu.querySelectorAll("md-menu-item"));
      items.forEach((item, index) => {
        item.selected = index === clamped;
        item.dataset.active = index === clamped ? "true" : "false";
      });
      const activeItem = items[clamped];
      if (activeItem && typeof activeItem.focus === "function") {
        activeItem.focus();
      }
      ensureBaseBranchActiveVisible(menu, activeItem);
    }

    function ensureBaseBranchActiveVisible(menu, activeItem) {
      if (!menu || !activeItem) return;
      const scrollContainer = menu.shadowRoot?.querySelector?.(".items");
      if (!scrollContainer) {
        if (typeof activeItem.scrollIntoView === "function") {
          activeItem.scrollIntoView({ block: "nearest" });
        }
        return;
      }
      const activeIndex = baseBranchActiveIndex;
      if (activeIndex < 0) return;
      const itemHeight = Math.max(1, Math.round(activeItem.getBoundingClientRect().height || 44));
      const itemTop = activeIndex * itemHeight;
      const itemBottom = itemTop + itemHeight;
      const visibleTop = scrollContainer.scrollTop;
      const visibleBottom = visibleTop + scrollContainer.clientHeight;

      if (itemTop < visibleTop) {
        scrollContainer.scrollTop = itemTop;
      } else if (itemBottom > visibleBottom) {
        scrollContainer.scrollTop = itemBottom - scrollContainer.clientHeight;
      }
    }

    function setupBaseBranchSuggestions() {
      baseBranchDefaultSuggestions = uniqueBranchNames(BASE_BRANCH_DEFAULT_SUGGESTIONS);
      renderBaseBranchSuggestions();
    }

    function setupBaseBranchCombobox() {
      const input = document.getElementById("squashBaseBranch");
      const menu = document.getElementById("baseBranchMenu");
      if (!input || !menu) return;
      menu.anchorElement = input;
      menu.defaultFocus = "none";
      let closeTimer = null;

      const applySelection = (value) => {
        const selected = (value || "").trim();
        if (!selected) return;
        input.value = selected;
        rememberBaseBranch(selected);
        regenerateAllCommands();
        baseBranchActiveIndex = -1;
        baseBranchActiveValue = "";
        suppressBaseBranchFocusOpen = true;
        closeMenu();
        input.focus({ preventScroll: true });
      };

      const openMenu = (options = {}) => {
        renderBaseBranchSuggestions(options);
        if (menu.children.length > 0) {
          menu.show();
        }
      };

      const closeMenu = () => {
        menu.close();
      };

      input.addEventListener("focus", () => {
        if (suppressBaseBranchFocusOpen) {
          suppressBaseBranchFocusOpen = false;
          return;
        }
        if (closeTimer) {
          clearTimeout(closeTimer);
          closeTimer = null;
        }
        openMenu({ keepActive: false });
      });

      input.addEventListener("input", () => {
        renderBaseBranchSuggestions();
        if (baseBranchCurrentSuggestions.length > 0) {
          menu.show();
        } else {
          closeMenu();
        }
      });

      input.addEventListener("keydown", (event) => {
        if (event.key === "ArrowDown") {
          event.preventDefault();
          openMenu({ keepActive: true });
          if (baseBranchCurrentSuggestions.length === 0) return;
          const nextIndex = baseBranchActiveIndex < 0
            ? 0
            : (baseBranchActiveIndex + 1) % baseBranchCurrentSuggestions.length;
          setBaseBranchActiveSuggestion(nextIndex);
        } else if (event.key === "ArrowUp") {
          event.preventDefault();
          openMenu({ keepActive: true });
          if (baseBranchCurrentSuggestions.length === 0) return;
          const nextIndex = baseBranchActiveIndex < 0
            ? baseBranchCurrentSuggestions.length - 1
            : (baseBranchActiveIndex - 1 + baseBranchCurrentSuggestions.length) % baseBranchCurrentSuggestions.length;
          setBaseBranchActiveSuggestion(nextIndex);
        } else if (event.key === "Enter") {
          if (menu.open && baseBranchActiveIndex >= 0) {
            event.preventDefault();
            applySelection(baseBranchCurrentSuggestions[baseBranchActiveIndex]);
          }
        } else if (event.key === "Tab") {
          baseBranchActiveIndex = -1;
          baseBranchActiveValue = "";
          closeMenu();
        } else if (event.key === "Escape") {
          baseBranchActiveIndex = -1;
          baseBranchActiveValue = "";
          closeMenu();
        }
      });

      input.addEventListener("blur", () => {
        closeTimer = setTimeout(() => {
          closeMenu();
          closeTimer = null;
        }, 140);
      });

      document.addEventListener("pointerdown", (event) => {
        const path = event.composedPath();
        const insideInput = path.includes(input);
        const insideMenu = path.includes(menu);
        if (!insideInput && !insideMenu) {
          closeMenu();
        }
      });

      menu.addEventListener("focusin", () => {
        if (!closeTimer) return;
        clearTimeout(closeTimer);
        closeTimer = null;
      });

      menu.addEventListener("close-menu", (event) => {
        const initiator = event.detail && event.detail.initiator ? event.detail.initiator : null;
        if (!initiator) return;
        const value = (
          initiator.dataset?.value ||
          initiator.getAttribute?.("headline") ||
          initiator.textContent ||
          ""
        ).trim();
        applySelection(value);
      });

      menu.addEventListener("keydown", (event) => {
        if (event.key === "ArrowDown") {
          event.preventDefault();
          if (baseBranchCurrentSuggestions.length === 0) return;
          const nextIndex = baseBranchActiveIndex < 0
            ? 0
            : (baseBranchActiveIndex + 1) % baseBranchCurrentSuggestions.length;
          setBaseBranchActiveSuggestion(nextIndex);
        } else if (event.key === "ArrowUp") {
          event.preventDefault();
          if (baseBranchCurrentSuggestions.length === 0) return;
          const nextIndex = baseBranchActiveIndex < 0
            ? baseBranchCurrentSuggestions.length - 1
            : (baseBranchActiveIndex - 1 + baseBranchCurrentSuggestions.length) % baseBranchCurrentSuggestions.length;
          setBaseBranchActiveSuggestion(nextIndex);
        } else if (event.key === "Enter") {
          if (baseBranchActiveIndex >= 0) {
            event.preventDefault();
            applySelection(baseBranchCurrentSuggestions[baseBranchActiveIndex]);
          }
        } else if (event.key === "Tab" || event.key === "Escape") {
          baseBranchActiveIndex = -1;
          baseBranchActiveValue = "";
          closeMenu();
        }
      });
    }

    function rememberBaseBranch(value) {
      const branch = value.trim();
      if (!branch) return;
      try {
        localStorage.setItem(BASE_BRANCH_STORAGE_KEY, branch);
      } catch (_) {
        // localStorage が使えない環境では保存機能を無効化
      }
      const history = getStoredBaseBranchHistory();
      const next = [branch, ...history.filter((entry) => entry !== branch)].slice(0, BASE_BRANCH_HISTORY_MAX);
      saveBaseBranchHistory(next);
      renderBaseBranchSuggestions();
    }

    function loadPersistedBaseBranch() {
      const input = document.getElementById("squashBaseBranch");
      if (!input) return;
      try {
        const stored = localStorage.getItem(BASE_BRANCH_STORAGE_KEY);
        const history = getStoredBaseBranchHistory();
        const restored = stored && stored.trim() ? stored.trim() : (history[0] || "");
        if (restored) {
          input.value = restored;
          if (!history.includes(restored)) {
            saveBaseBranchHistory([restored, ...history].slice(0, BASE_BRANCH_HISTORY_MAX));
          }
        }
      } catch (_) {
        // localStorage が使えない環境では保存機能を無効化
      }
      renderBaseBranchSuggestions();
    }

    function setupBaseBranchPersistence() {
      const input = document.getElementById("squashBaseBranch");
      if (!input) return;
      const persist = () => {
        rememberBaseBranch(input.value);
      };
      input.addEventListener("change", persist);
    }

    function clearBaseBranchHistory() {
      const menu = document.getElementById("baseBranchMenu");
      try {
        localStorage.removeItem(BASE_BRANCH_HISTORY_STORAGE_KEY);
        localStorage.removeItem(BASE_BRANCH_STORAGE_KEY);
        renderBaseBranchSuggestions();
        if (menu) menu.close();
        showToast("基点ブランチ履歴をクリアしました");
      } catch (_) {
        showToast("履歴のクリアに失敗しました");
      }
    }

    function setupFieldSupportingTextHints() {
      const fieldIds = ["squashBaseBranch", "workBranch"];
      fieldIds.forEach((id) => {
        const field = document.getElementById(id);
        if (!field) return;
        const helpText = (field.getAttribute("data-help-text") || "").trim();
        if (!helpText) return;

        const show = () => {
          field.supportingText = helpText;
        };
        const hide = () => {
          field.supportingText = "";
        };

        field.addEventListener("focus", show);
        field.addEventListener("blur", hide);
      });
    }

    setupBaseBranchSuggestions();
    setupBaseBranchCombobox();
    loadPersistedBaseBranch();
    loadPersistedUiPreferences();
    updateBaseScope();
    toggleCurrentBranch();
    setDefaultWorkBranch();
    setupBaseBranchPersistence();
    setupUiPreferencePersistence();
    setupCreateBranchAutoUpdate();
    generateCreateBranchCommand({ silent: true });
    setupRebaseAutoUpdate();
    generateRebaseCommand({ silent: true });
    generatePushCommand({ silent: true });
    generatePlannedDiffCommand({ silent: true });
    setupFieldSupportingTextHints();
    setupCodeSelectAll();
