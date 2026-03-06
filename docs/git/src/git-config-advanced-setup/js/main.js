function getToggleSelected(id, fallbackValue = false) {
  const element = document.getElementById(id);
  if (!element) return !!fallbackValue;
  if ("selected" in element) return !!element.selected;
  return !!element.checked;
}

function generateCheckCommand() {
  const lines = [
    "git config --global core.autocrlf",
    "git config --global push.default"
  ];
  document.getElementById("checkCmd").textContent = lines.join("\n");
}

function toggleAutocrlfOptions() {
  const enabled = getToggleSelected("enableAutocrlf", false);
  const options = document.querySelectorAll("#autocrlfOptions input[type='radio']");
  options.forEach((opt) => {
    opt.disabled = !enabled;
  });
  document.getElementById("autocrlfOptions").classList.toggle("md-dimmed", !enabled);
}

function togglePushDefaultOptions() {
  const enabled = getToggleSelected("enablePushDefault", false);
  const options = document.querySelectorAll("#pushDefaultOptions input[type='radio']");
  options.forEach((opt) => {
    opt.disabled = !enabled;
  });
  document.getElementById("pushDefaultOptions").classList.toggle("md-dimmed", !enabled);
}

function generateConfigCommand({ silent = false } = {}) {
  const enableAutocrlf = getToggleSelected("enableAutocrlf", false);
  const enablePushDefault = getToggleSelected("enablePushDefault", false);

  if (!enableAutocrlf && !enablePushDefault) {
    if (!silent) alert("設定を1つ以上選択してください。");
    document.getElementById("configCmd").textContent = "";
    return;
  }

  const lines = [];

  if (enableAutocrlf) {
    const autocrlfValue = document.querySelector("input[name='autocrlf']:checked");
    if (autocrlfValue) {
      lines.push(`git config --global core.autocrlf ${autocrlfValue.value}`);
    }
  }

  if (enablePushDefault) {
    const pushDefaultValue = document.querySelector("input[name='pushdefault']:checked");
    if (pushDefaultValue) {
      lines.push(`git config --global push.default ${pushDefaultValue.value}`);
    }
  }

  document.getElementById("configCmd").textContent = lines.join("\n");
}

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast || typeof toast.show !== "function") return;
  toast.show(message, 2200);
}

function setupAutoUpdate() {
  const handler = () => generateConfigCommand({ silent: true });
  ["autocrlf-true", "autocrlf-input", "autocrlf-false", "pushdefault-simple", "pushdefault-current", "pushdefault-upstream", "pushdefault-matching", "enableAutocrlf", "enablePushDefault"].forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("change", handler);
    el.addEventListener("input", handler);
  });
}

generateCheckCommand();
toggleAutocrlfOptions();
togglePushDefaultOptions();
setupAutoUpdate();
generateConfigCommand({ silent: true });
