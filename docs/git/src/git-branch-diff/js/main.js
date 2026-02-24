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
      const inputIds = ["branchA", "branchB", "remoteName"];
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
    }

    function showToast(message) {
      const toast = document.getElementById("toast");
      toast.textContent = message;
      toast.classList.add("md-visible");
      setTimeout(() => {
        toast.classList.remove("md-visible");
      }, 2000);
    }

    function bootstrap() {
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
