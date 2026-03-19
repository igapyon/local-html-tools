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

    function isOpenableExternalUrl(url) {
      return /^https?:\/\//i.test(String(url || "").trim());
    }

    function convertTimeToThreeChars(hours, minutes) {
      const s1 = String.fromCharCode(97 + hours);
      const s2 = String.fromCharCode(97 + Math.floor(minutes / 10));
      const s3 = String.fromCharCode(97 + (minutes % 10));
      return s1 + s2 + s3;
    }

    function getUseCurrentBranchSelected() {
      const useCurrentBranch = document.getElementById("useCurrentBranch");
      if (!useCurrentBranch) return true;
      if ("selected" in useCurrentBranch) {
        return !!useCurrentBranch.selected;
      }
      return !!useCurrentBranch.checked;
    }

    function setUseCurrentBranchSelected(value) {
      const useCurrentBranch = document.getElementById("useCurrentBranch");
      if (!useCurrentBranch) return;
      if ("selected" in useCurrentBranch) {
        useCurrentBranch.selected = !!value;
        return;
      }
      useCurrentBranch.checked = !!value;
    }

    function getSwitchSelected(id, fallbackValue = false) {
      const switchElement = document.getElementById(id);
      if (!switchElement) return !!fallbackValue;
      if ("selected" in switchElement) {
        return !!switchElement.selected;
      }
      return !!switchElement.checked;
    }

    function setSwitchSelected(id, value) {
      const switchElement = document.getElementById(id);
      if (!switchElement) return;
      if ("selected" in switchElement) {
        switchElement.selected = !!value;
        return;
      }
      switchElement.checked = !!value;
    }

    function isShellEnvPowerShell() {
      return getSwitchSelected("shellEnvPowerShell", false);
    }

    function isLockOriginEnabled() {
      return getSwitchSelected("lockOrigin", true);
    }

    function toggleCurrentBranch() {
      const useCurrent = getUseCurrentBranchSelected();
      const workBranch = document.getElementById("workBranch");
      if (workBranch) {
        // 編集は常に可能にする（現在のブランチ使用時も入力は保持）
        workBranch.classList.remove("md-disabled");
      }
      saveUiPreferences();
      regenerateAllCommands();
    }

    function updateRepoUrlLockState(locked) {
      const repoUrlField = document.getElementById("repoUrl");
      if (!repoUrlField) return;
      repoUrlField.readOnly = !!locked;
      repoUrlField.classList.toggle("md-disabled", !!locked);
      repoUrlField.setAttribute("aria-readonly", locked ? "true" : "false");
    }

    function updateBaseScope() {
      const scope = document.getElementById("squashBaseScope");
      const baseRemote = document.getElementById("baseRemote");
      const lockOriginEnabled = isLockOriginEnabled();
      const baseRemoteRow = document.getElementById("baseRemoteRow");
      if (scope && baseRemote) {
        const disableRemote = scope.value !== "remote" || lockOriginEnabled;
        baseRemote.disabled = disableRemote;
        baseRemote.classList.toggle("md-disabled", disableRemote);
      }
      if (scope && lockOriginEnabled) {
        baseRemote.value = "origin";
      }
      const squashRemote = document.getElementById("squashRemote");
      const squashRemoteRow = document.getElementById("squashRemoteRow");
      if (squashRemote) {
        const disableRemoteName = lockOriginEnabled;
        squashRemote.disabled = disableRemoteName;
        squashRemote.classList.toggle("md-disabled", disableRemoteName);
        if (disableRemoteName) {
          squashRemote.value = "origin";
        }
      }
      if (baseRemoteRow) {
        baseRemoteRow.classList.toggle("md-hidden", lockOriginEnabled);
      }
      if (squashRemoteRow) {
        squashRemoteRow.classList.toggle("md-hidden", lockOriginEnabled);
      }
      regenerateAllCommands();
    }

    function toggleOriginLock() {
      const isLocked = isLockOriginEnabled();
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
      const saved = upsertWorkBranchListEntry({
        requireRepoUrl: false,
        showAlertOnInvalid: false,
        updateRecentActions: false
      });
      if (saved) {
        showToast("作業ブランチ名を更新し、Git 作業一覧へ反映しました");
      }
    }

    function generateRebaseCommand(options = {}) {
      const silent = options && options.silent === true;
      const squashScope = document.getElementById("squashBaseScope")?.value || "remote";
      const baseRemote = document.getElementById("baseRemote")?.value.trim() || "origin";
      const squashBranch = document.getElementById("squashBaseBranch")?.value.trim() || "";
      let base = "";
      const workBranch = document.getElementById("workBranch").value.trim();
      const useCurrent = getUseCurrentBranchSelected();
      const commitMessage = document.getElementById("commitMessage").value.trim();
      const squashRemote = document.getElementById("squashRemote").value.trim() || "origin";
      const shellEnv = isShellEnvPowerShell() ? "powershell" : "posix";

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
      const useCurrent = getUseCurrentBranchSelected();
      const squashRemote = document.getElementById("squashRemote").value.trim() || "origin";
      const shellEnv = isShellEnvPowerShell() ? "powershell" : "posix";

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

    function generateCreateBranchCommand(options = {}) {
      const silent = options && options.silent === true;
      const workBranch = document.getElementById("workBranch").value.trim();
      const scope = document.getElementById("squashBaseScope").value;
      const remote = document.getElementById("baseRemote").value.trim() || "origin";
      const baseBranch = document.getElementById("squashBaseBranch").value.trim();
      const shellEnv = isShellEnvPowerShell() ? "powershell" : "posix";

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
      const squashBaseScope = document.getElementById("squashBaseScope");
      if (squashBaseScope) {
        squashBaseScope.addEventListener("change", updateBaseScope);
      }
    }

    function setupRebaseAutoUpdate() {
      const inputIds = ["repoUrl", "squashBaseBranch", "workBranch", "squashBaseScope", "baseRemote", "squashRemote", "commitMessage"];
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

    function setupWorkBranchListButton() {
      const button = document.getElementById("saveToWorkBranchListBtn");
      if (!button) return;
      button.addEventListener("click", saveToWorkBranchListAndOpen);
    }

    function setupBranchDiffButton() {
      const button = document.getElementById("openBranchDiffBtn");
      if (!button) return;
      button.addEventListener("click", openBranchDiffFromPlannedDiff);
    }

    function copyToClipboard(id) {
      const element = document.getElementById(id);
      if (!element) return;
      const text = element.tagName === "TEXTAREA" || element.tagName === "INPUT"
        ? element.value
        : element.textContent;
      if (!text) return;
      copyPlainText(text);
      showToast("コピーしました");
    }

    function copyPlainText(text) {
      if (!text) return;
      const temp = document.createElement("textarea");
      temp.value = text;
      document.body.appendChild(temp);
      temp.select();
      document.execCommand("copy");
      document.body.removeChild(temp);
    }

    function formatBackupBranchTimestamp(date = new Date()) {
      const year = String(date.getFullYear());
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${year}-${month}-${day}-${hours}${minutes}`;
    }

    function copyBackupBranchCommand() {
      const command = `git branch backup/${formatBackupBranchTimestamp()}`;
      copyPlainText(command);
      showToast("Backup 用ブランチ作成コマンドをコピーしました");
    }

    function showToast(message) {
      const toast = document.getElementById("toast");
      if (!toast || typeof toast.show !== "function") return;
      toast.show(message, 2200);
    }

    function summarizeTextDiffForToast(beforeText, afterText) {
      const before = String(beforeText || "");
      const after = String(afterText || "");
      if (before === after) {
        return "変更なし";
      }

      let start = 0;
      const minLen = Math.min(before.length, after.length);
      while (start < minLen && before[start] === after[start]) {
        start += 1;
      }

      let endBefore = before.length - 1;
      let endAfter = after.length - 1;
      while (endBefore >= start && endAfter >= start && before[endBefore] === after[endAfter]) {
        endBefore -= 1;
        endAfter -= 1;
      }

      const changedBefore = before.slice(start, endBefore + 1).replace(/\s+/g, " ").trim();
      const changedAfter = after.slice(start, endAfter + 1).replace(/\s+/g, " ").trim();
      const compactBefore = changedBefore.length > 16 ? `${changedBefore.slice(0, 16)}...` : changedBefore;
      const compactAfter = changedAfter.length > 16 ? `${changedAfter.slice(0, 16)}...` : changedAfter;

      if (!compactBefore && compactAfter) {
        return `追加: ${compactAfter}`;
      }
      if (compactBefore && !compactAfter) {
        return `削除: ${compactBefore}`;
      }
      return `${compactBefore} → ${compactAfter}`;
    }

    function buildLineDiffHighlightData(beforeText, afterText) {
      const beforeLines = String(beforeText || "").replace(/\r\n?/g, "\n").split("\n");
      const afterLines = String(afterText || "").replace(/\r\n?/g, "\n").split("\n");
      const n = beforeLines.length;
      const m = afterLines.length;
      const dp = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0));

      for (let i = n - 1; i >= 0; i -= 1) {
        for (let j = m - 1; j >= 0; j -= 1) {
          if (beforeLines[i] === afterLines[j]) {
            dp[i][j] = dp[i + 1][j + 1] + 1;
          } else {
            dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
          }
        }
      }

      const beforeHighlighted = [];
      const afterHighlighted = [];
      let i = 0;
      let j = 0;
      while (i < n && j < m) {
        if (beforeLines[i] === afterLines[j]) {
          beforeHighlighted.push({ text: beforeLines[i], changed: false });
          afterHighlighted.push({ text: afterLines[j], changed: false });
          i += 1;
          j += 1;
          continue;
        }
        if (dp[i + 1][j] >= dp[i][j + 1]) {
          beforeHighlighted.push({ text: beforeLines[i], changed: true });
          i += 1;
        } else {
          afterHighlighted.push({ text: afterLines[j], changed: true });
          j += 1;
        }
      }
      while (i < n) {
        beforeHighlighted.push({ text: beforeLines[i], changed: true });
        i += 1;
      }
      while (j < m) {
        afterHighlighted.push({ text: afterLines[j], changed: true });
        j += 1;
      }

      return {
        beforeHighlighted,
        afterHighlighted
      };
    }

    function escapeHtml(text) {
      return String(text || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
    }

    function renderDiffHighlightHtml(lines, changedClass) {
      if (!lines || lines.length === 0) {
        return '<span class="md-diff-line">(空)</span>';
      }
      return lines.map((line) => {
        const cssClass = line.changed ? `md-diff-line ${changedClass}` : "md-diff-line";
        const safeText = escapeHtml(line.text);
        return `<span class="${cssClass}">${safeText || "&nbsp;"}</span>`;
      }).join("");
    }

    function isPrTitleHeadingLine(line) {
      const normalized = String(line || "").trim();
      if (!/^#{1,6}\s*/.test(normalized)) {
        return false;
      }
      const titleText = normalized.replace(/^#{1,6}\s*/, "").trim().toLowerCase();
      return /^(?:pr\s*タイトル|pr\s*title|タイトル|title)\s*[:：]?$/.test(titleText);
    }

    function isPrTextHeadingLine(line) {
      const normalized = String(line || "").trim();
      if (!/^#{1,6}\s*/.test(normalized)) {
        return false;
      }
      const headingText = normalized.replace(/^#{1,6}\s*/, "").trim().toLowerCase();
      return /^(?:pr\s*テキスト|pr\s*text|pr\s*本文)\s*[:：]?$/.test(headingText);
    }

    function isPrTitleLabelLine(line) {
      const normalized = String(line || "").trim().toLowerCase();
      return /^(?:pr\s*タイトル|pr\s*title|タイトル|title)\s*[:：]\s*$/.test(normalized);
    }

    function isPrTextLabelLine(line) {
      const normalized = String(line || "").trim().toLowerCase();
      return /^(?:pr\s*テキスト|pr\s*text|pr\s*本文)\s*[:：]\s*$/.test(normalized);
    }

    function isTildeFenceStartLine(line) {
      return /^~~~+(?:[a-z0-9_-]+)?\s*$/i.test(String(line || "").trim());
    }

    function isTildeFenceEndLine(line) {
      return /^~~~+\s*$/.test(String(line || "").trim());
    }

    function normalizeCommitMessageForPr() {
      const commitMessageField = document.getElementById("commitMessage");
      if (!commitMessageField) return;

      const original = String(commitMessageField.value || "");
      let lines = original.replace(/\r\n?/g, "\n").split("\n");

      // 先頭は「空行 / PRタイトル見出し / PRタイトル: / PR本文: / チルダフェンス開始」が
      // 混在しやすいため、順不同で連続除去する。
      let changed = true;
      let removedPrTitleHeading = false;
      while (changed) {
        changed = false;
        while (lines.length > 0 && lines[0].trim() === "") {
          lines.shift();
          changed = true;
        }
        if (lines.length > 0) {
          lines[0] = lines[0].replace(/^\uFEFF/, "");
        }
        if (lines.length > 0 && isPrTitleHeadingLine(lines[0])) {
          lines.shift();
          removedPrTitleHeading = true;
          changed = true;
          continue;
        }
        if (lines.length > 0 && isPrTitleLabelLine(lines[0])) {
          lines.shift();
          removedPrTitleHeading = true;
          changed = true;
          continue;
        }
        if (lines.length > 0 && isPrTextLabelLine(lines[0])) {
          lines.shift();
          changed = true;
          continue;
        }
        if (lines.length > 0 && isTildeFenceStartLine(lines[0])) {
          lines.shift();
          changed = true;
        }
      }

      if (removedPrTitleHeading) {
        const firstNonEmptyIndex = lines.findIndex((line) => line.trim() !== "");
        if (firstNonEmptyIndex >= 0) {
          const line = lines[firstNonEmptyIndex];
          if (/^\s*`.*`\s*$/.test(line)) {
            lines[firstNonEmptyIndex] = line.replace(/^\s*`+/, "").replace(/`+\s*$/, "");
          }
        }
      }

      // 「## PRテキスト」「## PR本文」見出しや「PR本文:」行は、行自体を除去する。
      // 見出し直後の空行もスキップする。
      {
        const rewritten = [];
        let i = 0;
        while (i < lines.length) {
          if (!isPrTextHeadingLine(lines[i]) && !isPrTextLabelLine(lines[i])) {
            rewritten.push(lines[i]);
            i += 1;
            continue;
          }

          // 見出し行を除去し、直後の空行をスキップ。
          i += 1;
          while (i < lines.length && lines[i].trim() === "") {
            i += 1;
          }
        }
        lines = rewritten;
      }

      while (lines.length > 0 && lines[lines.length - 1].trim() === "") {
        lines.pop();
      }

      if (lines.length > 0 && isTildeFenceEndLine(lines[lines.length - 1])) {
        lines.pop();
      }

      let normalized = lines.join("\n").trim();
      // 先頭文が「`<40桁コミットID>` の ...」で始まる場合は導入句を除去する。
      // 例: `3caa...fe8c0` の変更は〜 → 変更は〜
      normalized = normalized.replace(
        /^[\s\u3000\uFEFF]*[`'"\u2018\u2019\u201C\u201D「」『』]*\s*[0-9a-f]{40}\s*[`'"\u2018\u2019\u201C\u201D「」『』]*\s*の[\s\u3000]*/gim,
        ""
      );
      normalized = normalized.trim();
      lastNormalizeBefore = original;
      lastNormalizeAfter = normalized;
      commitMessageField.value = normalized;
      regenerateAllCommands();
      const summary = summarizeTextDiffForToast(original, normalized);
      showToast(`コミットメッセージを整形: ${summary}`);
    }

    function openNormalizeDiffDialog() {
      const dialog = document.getElementById("normalizeDiffDialog");
      const beforeNode = document.getElementById("normalizeDiffBefore");
      const afterNode = document.getElementById("normalizeDiffAfter");
      if (!dialog || !beforeNode || !afterNode) return;

      const commitMessageField = document.getElementById("commitMessage");
      const currentValue = commitMessageField ? String(commitMessageField.value || "") : "";
      const beforeText = lastNormalizeBefore || currentValue;
      const afterText = lastNormalizeAfter || currentValue;
      const diffData = buildLineDiffHighlightData(beforeText, afterText);
      beforeNode.innerHTML = renderDiffHighlightHtml(diffData.beforeHighlighted, "md-diff-line--before");
      afterNode.innerHTML = renderDiffHighlightHtml(diffData.afterHighlighted, "md-diff-line--after");

      if (!dialog.dataset.boundOutsideClose) {
        dialog.addEventListener("click", (event) => {
          if (event.target === dialog) {
            dialog.close();
          }
        });
        dialog.dataset.boundOutsideClose = "true";
      }

      if (typeof dialog.showModal === "function") {
        dialog.showModal();
      } else {
        showToast("このブラウザではダイアログ表示に対応していません");
      }
    }

    function closeNormalizeDiffDialog() {
      const dialog = document.getElementById("normalizeDiffDialog");
      if (!dialog) return;
      if (dialog.open && typeof dialog.close === "function") {
        dialog.close();
      }
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
    const WORK_LIST_STORAGE_KEY = "gitWorkList.entries";
    const RECENT_ACTIONS_KEY = "gitWorkList.recentActions";
    let baseBranchDefaultSuggestions = [];
    let baseBranchCurrentSuggestions = [];
    let baseBranchActiveIndex = -1;
    let baseBranchActiveValue = "";
    let suppressBaseBranchFocusOpen = false;
    let lastNormalizeBefore = "";
    let lastNormalizeAfter = "";

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

    function readCurrentQueryParams() {
      return new URLSearchParams(window.location.search || "");
    }

    function applyQueryParams() {
      const params = readCurrentQueryParams();
      const repoUrl = String(params.get("repoUrl") || "").trim();
      const baseBranch = String(params.get("baseBranch") || "").trim();
      const workBranch = String(params.get("workBranch") || "").trim();
      const defaultCommitMessage = String(params.get("defaultCommitMessage") || "").trim();
      const baseScope = String(params.get("baseScope") || "").trim();
      const remoteName = String(params.get("remoteName") || "").trim();
      const useHeadWork = String(params.get("useHeadWork") || "").trim();
      const useCurrentBranch = String(params.get("useCurrentBranch") || "").trim();
      const hasUseCurrentBranchParam = params.has("useCurrentBranch") || params.has("useHeadWork");
      const repoUrlField = document.getElementById("repoUrl");
      const baseBranchField = document.getElementById("squashBaseBranch");
      const workBranchField = document.getElementById("workBranch");
      const commitMessageField = document.getElementById("commitMessage");
      const baseScopeField = document.getElementById("squashBaseScope");
      const baseRemoteField = document.getElementById("baseRemote");
      const squashRemoteField = document.getElementById("squashRemote");
      const lockOriginField = document.getElementById("lockOrigin");
      if (repoUrl && repoUrlField) {
        repoUrlField.value = repoUrl;
        updateRepoUrlLockState(true);
      } else {
        updateRepoUrlLockState(false);
      }
      if (baseBranch && baseBranchField) {
        baseBranchField.value = baseBranch;
      }
      if (workBranch && workBranchField) {
        workBranchField.value = workBranch;
      }
      if (defaultCommitMessage && commitMessageField && !String(commitMessageField.value || "").trim()) {
        commitMessageField.value = defaultCommitMessage;
      }
      if (hasUseCurrentBranchParam) {
        const useCurrentBranchEnabled = (
          useHeadWork === "1" ||
          useHeadWork === "true" ||
          useCurrentBranch === "1" ||
          useCurrentBranch === "true"
        );
        setUseCurrentBranchSelected(useCurrentBranchEnabled);
      }
      if ((baseScope === "remote" || baseScope === "local") && baseScopeField) {
        baseScopeField.value = baseScope;
      }
      if (remoteName) {
        if (baseRemoteField) {
          baseRemoteField.value = remoteName;
        }
        if (squashRemoteField) {
          squashRemoteField.value = remoteName;
        }
        if (lockOriginField && remoteName !== "origin") {
          setSwitchSelected("lockOrigin", false);
        }
      }
    }

    function createWorkBranchListEntryId() {
      return `entry-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    }

    function normalizeWorkBranchListScope(value) {
      return value === "local" ? "local" : "remote";
    }

    function normalizeWorkBranchListEntry(raw) {
      return {
        id: raw?.id ? String(raw.id) : createWorkBranchListEntryId(),
        repoUrl: normalizeRepoUrl(raw?.repoUrl),
        baseBranch: String(raw?.baseBranch || "").trim(),
        baseScope: normalizeWorkBranchListScope(raw?.baseScope),
        compareBranch: String(raw?.compareBranch || "").trim(),
        compareScope: normalizeWorkBranchListScope(raw?.compareScope),
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
        return parsed.map((entry) => normalizeWorkBranchListEntry(entry));
      } catch (_) {
        return [];
      }
    }

    function saveWorkBranchListEntries(entries) {
      try {
      localStorage.setItem(WORK_LIST_STORAGE_KEY, JSON.stringify(entries));
      } catch (_) {
        // localStorage が使えない環境では保存機能を無効化
      }
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

    function upsertWorkBranchListEntry(options = {}) {
      const requireRepoUrl = options.requireRepoUrl !== false;
      const showAlertOnInvalid = options.showAlertOnInvalid !== false;
      const updateRecent = options.updateRecentActions !== false;
      const repoUrlField = document.getElementById("repoUrl");
      const repoUrl = repoUrlField ? normalizeRepoUrl(repoUrlField.value) : "";
      if (!repoUrl) {
        if (!requireRepoUrl) {
          return null;
        }
        if (showAlertOnInvalid) {
          alert("リポジトリ URL を入力してください。");
        }
        if (repoUrlField && typeof repoUrlField.focus === "function") {
          repoUrlField.focus();
        }
        return null;
      }

      const baseBranch = document.getElementById("squashBaseBranch")?.value.trim() || "";
      const compareBranch = document.getElementById("workBranch")?.value.trim() || "";
      if (!baseBranch || !compareBranch) {
        if (showAlertOnInvalid) {
          alert("基点ブランチと作業ブランチを入力してください。");
        }
        return null;
      }

      const baseScope = document.getElementById("squashBaseScope")?.value === "local" ? "local" : "remote";
      const lockOriginEnabled = isLockOriginEnabled();
      const baseRemote = document.getElementById("baseRemote")?.value.trim() || "origin";
      const squashRemote = document.getElementById("squashRemote")?.value.trim() || "origin";
      const remoteName = lockOriginEnabled ? "origin" : (baseRemote || squashRemote || "origin");
      const entries = loadWorkBranchListEntries();
      const existingIndex = entries.findIndex((entry) => (
        entry.repoUrl === repoUrl &&
        entry.baseBranch === baseBranch &&
        entry.compareBranch === compareBranch
      ));
      const nextEntry = normalizeWorkBranchListEntry({
        id: existingIndex >= 0 ? entries[existingIndex].id : createWorkBranchListEntryId(),
        repoUrl,
        baseBranch,
        baseScope,
        compareBranch,
        compareScope: "local",
        compareUseHead: getUseCurrentBranchSelected(),
        locked: existingIndex >= 0 ? entries[existingIndex].locked === true : false,
        remoteName,
        createdAt: existingIndex >= 0 ? entries[existingIndex].createdAt : Date.now(),
        updatedAt: Date.now()
      });

      if (existingIndex >= 0) {
        entries.splice(existingIndex, 1, nextEntry);
      } else {
        entries.push(nextEntry);
      }
      saveWorkBranchListEntries(entries);
      if (updateRecent) {
        saveRecentActions(updateRecentActions(loadRecentActions(), nextEntry.id, "pseudo-squash"));
      }
      return {
        entry: nextEntry,
        existed: existingIndex >= 0
      };
    }

    function saveToWorkBranchListAndOpen() {
      const saved = upsertWorkBranchListEntry({
        requireRepoUrl: true,
        showAlertOnInvalid: true,
        updateRecentActions: true
      });
      if (!saved) {
        return;
      }
      showToast(saved.existed ? "Git 作業一覧を更新しました" : "Git 作業一覧へ追加しました");
      navigateTo("git-work-list.html");
    }

    function openRepoUrl() {
      const repoUrl = document.getElementById("repoUrl")?.value.trim() || "";
      if (!isOpenableExternalUrl(repoUrl)) return;
      window.open(repoUrl, "_blank", "noopener,noreferrer");
    }

    function buildBranchDiffUrlFromPlannedDiff() {
      const repoUrl = document.getElementById("repoUrl")?.value.trim() || "";
      const baseBranch = document.getElementById("squashBaseBranch")?.value.trim() || "";
      const baseScope = document.getElementById("squashBaseScope")?.value === "local" ? "local" : "remote";
      const workBranchInput = document.getElementById("workBranch")?.value.trim() || "";
      const useCurrent = getUseCurrentBranchSelected();

      if (!baseBranch) {
        alert("基点ブランチを入力してください。");
        return "";
      }
      if (!workBranchInput) {
        alert("作業ブランチ名を入力してください。");
        return "";
      }

      const baseRemote = document.getElementById("baseRemote")?.value.trim() || "origin";
      const params = new URLSearchParams();
      if (repoUrl) {
        params.set("repoUrl", repoUrl);
      }
      params.set("baseBranch", baseBranch);
      params.set("baseScope", baseScope);
      params.set("workBranch", workBranchInput);
      params.set("workScope", "local");
      if (useCurrent) {
        params.set("useHeadWork", "1");
      }
      params.set("remoteName", isLockOriginEnabled() ? "origin" : baseRemote);
      return `git-branch-diff.html?${params.toString()}`;
    }

    function openBranchDiffFromPlannedDiff() {
      const url = buildBranchDiffUrlFromPlannedDiff();
      if (!url) return;
      navigateTo(url);
    }

    function loadPersistedUiPreferences() {
      const params = readCurrentQueryParams();
      const hasUseCurrentBranchParam = params.has("useCurrentBranch") || params.has("useHeadWork");
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
        setSwitchSelected("shellEnvPowerShell", shellEnvValue);
      }
      if (lockOrigin && lockOriginValue !== null) {
        setSwitchSelected("lockOrigin", lockOriginValue);
      }
      if (!hasUseCurrentBranchParam && useCurrentBranch && useCurrentBranchValue !== null) {
        setUseCurrentBranchSelected(useCurrentBranchValue);
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
        setStoredValue(UI_SHELL_ENV_POWERSHELL_STORAGE_KEY, isShellEnvPowerShell());
      }
      if (lockOrigin) {
        setStoredValue(UI_LOCK_ORIGIN_STORAGE_KEY, isLockOriginEnabled());
      }
      if (squashBaseScope) {
        setStoredValue(UI_SQUASH_BASE_SCOPE_STORAGE_KEY, squashBaseScope.value);
      }
      if (useCurrentBranch) {
        setStoredValue(UI_USE_CURRENT_BRANCH_STORAGE_KEY, getUseCurrentBranchSelected());
      }

      // lockOrigin ON 時は origin を強制表示するため、ユーザーのリモート入力値は保持する。
      const isLockOrigin = isLockOriginEnabled();
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

      if (shellEnvPowerShell) setSwitchSelected("shellEnvPowerShell", false);
      if (lockOrigin) setSwitchSelected("lockOrigin", true);
      if (squashBaseScope) squashBaseScope.value = "remote";
      if (baseRemote) baseRemote.value = "origin";
      if (squashRemote) squashRemote.value = "origin";
      if (useCurrentBranch) setUseCurrentBranchSelected(true);
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
        closeMenu();
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
      const params = readCurrentQueryParams();
      const queryBaseBranch = String(params.get("baseBranch") || "").trim();
      try {
        const stored = localStorage.getItem(BASE_BRANCH_STORAGE_KEY);
        const history = getStoredBaseBranchHistory();
        const restored = queryBaseBranch || (stored && stored.trim() ? stored.trim() : (history[0] || ""));
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
      const fieldIds = ["squashBaseBranch", "workBranch", "squashBaseScope", "baseRemote", "squashRemote", "commitMessage"];
      fieldIds.forEach((id) => {
        const field = document.getElementById(id);
        if (!field) return;
        const helpText = (field.getAttribute("data-help-text") || "").trim();
        if (!helpText) return;
        let blurHideTimer = null;

        const show = () => {
          if (blurHideTimer) {
            clearTimeout(blurHideTimer);
            blurHideTimer = null;
          }
          field.supportingText = helpText;
        };
        const hide = () => {
          if (blurHideTimer) {
            clearTimeout(blurHideTimer);
          }
          // blur の即時反映でクリックが取りこぼされるケースを避けるため、非表示は少し遅延させる。
          blurHideTimer = setTimeout(() => {
            field.supportingText = "";
            blurHideTimer = null;
          }, 120);
        };

        field.addEventListener("focus", show);
        field.addEventListener("blur", hide);
      });
    }

    function setupOpenRepoUrlButton() {
      const button = document.getElementById("openRepoUrlBtn");
      if (!button) return;
      button.addEventListener("click", openRepoUrl);
    }

    applyQueryParams();
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
    setupFieldSupportingTextHints();
    setupWorkBranchListButton();
    setupBranchDiffButton();
    setupOpenRepoUrlButton();
    setupCodeSelectAll();
