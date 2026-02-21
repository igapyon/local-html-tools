function quoteIfNeeded(value) {
  if (!value) return value;
  if (/[^\w@%+=:,./-]/.test(value)) {
    const escaped = value.replace(/"/g, '\\"');
    return `"${escaped}"`;
  }
  return value;
}

function generateCheckCommand() {
  const lines = [
    "git config --global user.name",
    "git config --global user.email"
  ];
  document.getElementById("checkCmd").textContent = lines.join("\n");
}

function generateSetupCommand({ silent = false } = {}) {
  const userName = document.getElementById("userName").value.trim();
  const userEmail = document.getElementById("userEmail").value.trim();

  if (!userName) {
    if (!silent) alert("ユーザー名を入力してください。");
    document.getElementById("setupCmd").textContent = "";
    return;
  }
  if (!userEmail) {
    if (!silent) alert("メールアドレスを入力してください。");
    document.getElementById("setupCmd").textContent = "";
    return;
  }

  const lines = [
    `git config --global user.name ${quoteIfNeeded(userName)}`,
    `git config --global user.email ${quoteIfNeeded(userEmail)}`
  ];
  document.getElementById("setupCmd").textContent = lines.join("\n");
}

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("md-visible");
  setTimeout(() => {
    toast.classList.remove("md-visible");
  }, 2000);
}

function setupAutoUpdate() {
  const handler = () => generateSetupCommand({ silent: true });
  ["userName", "userEmail"].forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("input", handler);
    el.addEventListener("change", handler);
  });
}

generateCheckCommand();
setupAutoUpdate();
generateSetupCommand({ silent: true });
